---
title: "Production Resilience"
description: "Infrastructure health, workflow success, and product availability are different questions — observability for operational ocean forecasts."
pubDate: "2026-09-22"
tags: ["Observability", "Grafana", "Data Quality", "Ocean Forecasting", "Production System"]
categories: ["Ocean modelling", "Production System"]
math: false
lang: en
draft: true
---

> ## TL;DR
> A successful workflow does not necessarily mean a healthy product.
> Infrastructure can be up, jobs can complete, and users can still see stale or missing forecasts.

## The gap between "running" and "healthy"

I once spent an hour investigating a forecast that users reported as outdated. The processing server showed normal CPU and memory. Disk usage was within limits. The network was reachable. The orchestrator reported that the latest workflow run had completed successfully.

The forecast product available to users was from the previous cycle.

Every individual check passed. The system was running. The product was not healthy. That experience changed how I thought about monitoring in an operational ocean forecasting environment.

## Four layers of operational health

In the [overview article](/projects/metocean-data-engineering/), I introduced a layered model. Here I expand it, because each layer answers a different question and each can fail independently.

```text
Infrastructure
      ↓
Workflow
      ↓
Data
      ↓
Product
```

**Infrastructure** asks whether the underlying resources are available. CPU, memory, disk, network, and services — the things a traditional server monitoring stack watches.

```text
CPU          healthy
memory       healthy
disk         healthy
network      healthy
services     running
```

**Workflow** asks whether the expected processes actually ran and completed. Did the scheduled forecast cycle start? Did each stage succeed? When did the last successful run finish?

```text
did expected jobs run?
did they succeed?
when did they last succeed?
```

**Data** asks whether the expected outputs exist, are complete, and belong to the correct forecast cycle. Does the latest NetCDF file exist? Is it fresh? Does it contain the expected variables, dimensions, and timesteps? Are there unexpected gaps or NaN coverage?

```text
does expected output exist?
is it fresh?
correct forecast cycle?
expected dimensions?
expected variables?
missing timesteps?
unexpected NaN coverage?
```

**Product** asks whether the current forecast has actually reached the system that users depend on. A file can exist on a processing server and still not be visible to the operational product pipeline, a visualization service, or an API endpoint.

```text
did the current forecast actually reach the system used by users?
```

These layers are connected but not equivalent.

> Infrastructure availability is not the same as product availability.

And further:

> Workflow success is also not necessarily the same as product health.

A workflow can complete every task while writing incomplete data. Data can be complete on a processing server while the publication step silently fails. Each layer needs its own checks.

## A concrete example

Consider a simplified failure scenario:

```text
server              healthy
workflow            successful
latest product      stale
```

The processing server is up. The orchestrator logged a successful run at 04:15. But the forecast product that users see was last updated at the previous day's 12:00 cycle.

What could cause this?

The publication step may have copied a file to the wrong directory. The product pipeline may read from a different path than the one the workflow writes to. A downstream service may cache the previous cycle and not refresh. The workflow may have succeeded on a test partition while the production output path was never updated.

Without product-level monitoring, this failure is invisible until a user reports it — or until the gap becomes large enough that someone notices during a routine check.

Infrastructure monitoring would not catch it. Workflow monitoring would not catch it. Even data monitoring on the processing server might not catch it if the file exists locally but never reached the product system.

## What to observe

The specific metrics depend on the system, but the concepts transfer. Here are the signal names I think about when designing checks:

```text
forecast_age_seconds
latest_forecast_timestamp
expected_forecast_timestamp
workflow_last_success_timestamp
data_complete
product_available
```

**forecast_age_seconds** measures how old the latest available product is relative to now. If forecasts are published every 12 hours, an age of 36 hours is a problem even if the server is healthy.

**latest_forecast_timestamp** records the cycle time of the most recent product. **expected_forecast_timestamp** records what the latest cycle should be based on the operational schedule. The gap between them indicates staleness.

**workflow_last_success_timestamp** comes from the orchestration layer. It tells you when the pipeline last completed without error — but, as discussed, success does not guarantee fresh data.

**data_complete** is a boolean or score derived from structural checks: expected variables present, expected number of timesteps, no anomalous NaN coverage above a threshold, file size within expected bounds.

**product_available** is the highest-level signal: has the current forecast reached the user-facing system? This might be checked by querying an API, reading a catalog, or verifying a file at the publication endpoint.

The engineering work is deciding which of these signals matter for your operational context and what thresholds constitute a real problem versus normal variation.

## Grafana as one implementation

In practice, I use <a href="https://grafana.com/" target="_blank" rel="noopener noreferrer">Grafana</a> to make some of these signals easier to observe, particularly data freshness across operational products. This article is not a Grafana tutorial — the subject is determining what should be observed, not how to configure a specific dashboard panel.

The general pattern is:

1. A check script or exporter evaluates data and product health on a schedule.
2. Results are written as time-series metrics (Prometheus or an equivalent).
3. Grafana dashboards visualize freshness, completeness, and age trends.
4. Alert rules fire when thresholds are breached.

A useful dashboard for an operational forecasting system might show, at a glance:

- The age of the latest forecast product for each operational variable or domain.
- Whether the most recent workflow run succeeded and when.
- A timeline of data completeness scores over the past week.
- Comparison between expected and actual forecast cycle timestamps.

<!-- TODO: Grafana dashboard screenshot (synthetic demo) -->

The value is not the dashboard itself. It is the discipline of defining what "healthy" means at each layer and making deviations visible before users report them.

## Alerting philosophy

Alerts should fire on conditions that affect users, not on every anomaly in the system.

A single missing timestep in a 240-timestep file might warrant a warning. A completely missing file for the current cycle warrants an immediate alert. A server CPU spike during model integration is normal and should not page anyone.

I try to separate severity levels:

- **Informational** — something worth noting in the dashboard but not actionable right now. Example: forecast age is within normal range but slightly higher than the weekly average.
- **Warning** — a check failed but a fallback or retry may resolve it. Example: data completeness score dropped below threshold but the workflow is still running.
- **Critical** — the current forecast product is stale or missing and users are affected. Example: product_available is false for the expected cycle and the workflow has already completed.

False positives erode trust in alerting. If the on-call engineer receives ten alerts per week that turn out to be noise, they will stop responding to all of them. It is better to start with fewer, higher-confidence checks and add granularity as the patterns become clear.

Sanity checks I have found useful at the data layer include verifying expected dimensions and variable names, counting timesteps against the forecast length, checking for NaN coverage above a configurable threshold in surface fields, and comparing file size against historical norms for the same domain and cycle.

## A reproducible observability stack

<!-- TODO: Link to forecast-observability repository -->

I plan to publish a companion repository called `forecast-observability` that demonstrates the layered monitoring model with synthetic data. The stack will look conceptually like this:

```text
synthetic forecast producer
        ↓
freshness / quality checks
        ↓
metrics
        ↓
Prometheus (or equivalent)
        ↓
Grafana
```

The repository will simulate four scenarios:

1. **Everything healthy** — producer writes on schedule, checks pass, product is current.
2. **Infrastructure healthy, workflow healthy, data stale** — producer stops writing but the workflow reports success (simulating a silent publication failure).
3. **File present, but missing expected timestep** — producer writes an incomplete file; data completeness check fails.
4. **Data current, but publication endpoint stale** — processing output is fresh but the product-facing copy is not updated.

<!-- TODO: Example alert rule / metric exposition snippet -->

<!-- TODO: Diagram — four monitoring layers with example signals -->

The demo uses no proprietary infrastructure. It exists to show the engineering pattern: define checks at each layer, export metrics, visualize trends, and alert on user-visible failure.

## Trade-offs

**Metric cardinality.** Checking every variable at every grid point produces too many metrics to be useful. Aggregate checks — file-level completeness, domain-level freshness — are more maintainable.

**Check maintenance.** Data formats change, new variables are added, forecast lengths are extended. Checks must be updated alongside the production system or they will either miss real failures or generate false positives.

**Coverage vs effort.** Monitoring every layer thoroughly takes engineering time. In practice, I prioritized product-level freshness and data completeness first, because those are closest to user impact. Infrastructure monitoring was largely handled by existing platform tools.

**Blind spots.** No monitoring stack catches everything. A bug that produces physically plausible but scientifically wrong output will pass structural checks. Monitoring ensures operational reliability, not scientific validation — those are different problems.

## Closing the series

This is the fourth and final article in a series on engineering lessons from an operational ocean forecasting environment. The arc began with a simple observation: producing a forecast is only one part of the problem.

A production system has to:

- **Coordinate the work** — orchestrate dependencies, retries, and recovery across machines and execution environments.
- **Execute computation efficiently** — find HPC configurations that meet deadlines without over-allocating resources.
- **Organize output for downstream use** — choose storage layouts that match analytical access patterns.
- **Make operational failure visible** — monitor from infrastructure through to product availability.

I did not build the entire operational ocean forecasting system. I worked within a larger team-operated environment, contributing to the engineering layers I personally maintained, improved, benchmarked, automated, experimented with, or monitored. The lessons transfer beyond ocean forecasting to any production system that moves data through computation and delivers a time-sensitive product.

The goal was never to document an internal platform. It was to extract engineering patterns that remain useful when the specific models, clusters, and filenames are different.

Because producing a forecast is only one part of the problem.

## In this series

- [Inside an Operational Ocean Forecasting System](/projects/metocean-data-engineering/) — series overview
- [From Cron Jobs to Orchestrated Forecast Workflows](/projects/orchestrated-forecast-workflows/) — orchestration and reproducibility
- [The Compute Engine](/projects/performance-benchmarking-hpc/) — HPC scaling and performance benchmarking
- [Storing Multidimensional Geospatial Data](/projects/storing-geospatial-data-zarr/) — NetCDF, Xarray, chunking, and Zarr
