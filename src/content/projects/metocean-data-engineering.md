---
title: "Inside an Operational Ocean Forecasting System"
description: "Engineering lessons from workflow orchestration, HPC, geospatial data, and production resilience inside an operational ocean forecasting environment."
pubDate: "2026-08-24"
tags: ["Data Engineering", "Prefect", "HPC", "Geospatial Data", "Observability", "Ocean Forecasting"]
categories: ["Ocean modelling", "Production System"]
math: false
lang: en
---

> ## TL;DR
> Ocean forecasting is not only a modeling problem.
> Once forecasts have to run reliably in production, the harder questions become orchestration, compute efficiency, data storage, and resilience.
> This series is about the engineering lessons I learned working on those layers.

## From Science into Engineering

I did not start my career thinking of myself as a data engineer. My background is in meteorology, so I naturally focused first on forecasts, numerical models, and whether the resulting products made scientific sense.

Working in an operational environment gradually pulled me deeper into the engineering behind those forecasts. Data had to be collected, moved between systems, processed on HPC clusters, transformed into downstream products, stored, monitored, and delivered on schedule. Many of the problems I was solving had become problems of data engineering and production operations.

Here, I identified 4 prominent problems that significantly impacted to the efficient of production chain in operational ocean forecasting system.

## 1. Scheduling is not orchestration

Cron, Bash, Python, SSH, and similar tools can automate a surprising amount of operational work. I have worked with workflows built around exactly those tools, and they are not inherently the problem.

The limitation appears when scheduling starts being treated as orchestration.

Consider a simplified workflow:

```text
cron
 ↓
script
 ↓
remote machine
 ↓
SLURM job
 ↓
post-processing
 ↓
file transfer
```

If only the final transfer fails, rerunning an expensive computation usually makes little sense. Likewise, if upstream data has not arrived yet, immediately marking the entire workflow as failed may not be the right response either.

Those are dependency and recovery problems, not scheduling problems. 

Of course, we can handle them with Bash or Python. We can add retry loops, status files, SSH commands, conditional checks, and more scripts around existing scripts. I have done that too.

The problem is that, as the workflow grows, more of its operational logic becomes hidden inside custom code. Dependencies become harder to see, recovery procedures become less obvious, monitoring is fragmented, and a newcomer may need to read several scripts just to understand how one production workflow actually runs.

This was one reason I started introducing <a href="https://docs.prefect.io/v3/get-started" target="_blank" rel="noopener noreferrer">Prefect</a> into parts of the workflows I maintained.

The idea was not to replace Linux, Bash, SSH, or SLURM. Those systems were already good at executing work.

Instead, I wanted an orchestration layer above them. Here is the example.

```text
                    Prefect Host Server
                               │
                     orchestration / state
                               │
             ┌───────────────────┼──────────────────┐
             │                 │                 │
        Some worker       HPC worker         Another worker
        / work pool        / work pool        / work pool
             │                 │                 │
        Python / Bash       SLURM jobs         Python jobs
        SSH / rsync        processing         processing
             │                 │                 │
        data routines     HPC workloads      some workloads
```

One lesson that became important to me was that **an orchestrator does not need to become the compute engine**. It will keeps track of what should run, where it should run, what it depends on, and what state each part of the workflow is currently in.

That coordination problem will be the focus of the first technical article in this series.

## 2. The fastest computation is not always the best one

The next gap appears once the workflow reaches its compute-heavy stages.

It is tempting to assume that giving a numerical workload more compute resources should make it proportionally faster.

In distributed modeling, that assumption eventually breaks down.

I have spent time benchmarking operational wave-model workloads under different SLURM configurations, looking at runtime, node allocation, task configuration, and memory usage.

What became more interesting than finding the fastest run was understanding the trade-off behind it.

The operational objective is rarely just:

```text
minimum possible runtime
```

It is usually closer to:

```text
acceptable runtime
        +
resource efficiency
        +
operational deadline
        +
shared cluster capacity
```

Additional nodes introduce their own costs through communication, synchronization, I/O, and parts of the workload that do not scale perfectly.

At some point, significantly more compute may provide only a small reduction in runtime.

That creates an important distinction:

> **The fastest configuration and the best operational configuration are not necessarily the same thing.**

The second article will explore this through performance benchmarking of an operational wave-model workload.

## 3. Storage should follow how data is used

Then there is the model output itself.

Forecast and ocean datasets are naturally multidimensional:

```text
time
latitude
longitude
depth
variable
```

NetCDF remains extremely useful for scientific data exchange and numerical-model output, and I still use it extensively.

But while working on downstream analysis workflows, I became more aware of another distinction:

> **A format that works well for producing or archiving data does not automatically match every downstream access pattern.**

This became particularly visible while working on climatological analysis.

One request might need:

```text
one variable
    +
one spatial region
    +
several years
    +
one depth level
```

Another might need:

```text
one location
    +
a long time series
```

They are completely different ways of reading the same underlying dataset.

As the historical collection grew, the problem stopped being only about computation. Data organization and access increasingly mattered.

That pushed me further into Xarray, NetCDF, Zarr, chunking strategies, compression, and S3-compatible object storage.

The question became less about:

> Which file format is best?

and more about:

> **How should the data be organized around the way it will actually be used?**

The third article will focus on this shift from model-output-oriented files toward storage and access patterns designed for downstream analysis.

## 4. A healthy server does not mean a healthy product

The final gap is observability and resilience.

I have worked with Grafana and Zabbix, including maintaining monitoring infrastructure that was delivered as part of larger operational systems.

These tools can tell us a lot about infrastructure:

```text
CPU          healthy
memory       healthy
disk         healthy
network      healthy
process      running
```

Yet the latest forecast can still be stale.

That means operational health exists at several layers:

```text
Infrastructure
      ↓
Workflow
      ↓
Data
      ↓
Product
```

Infrastructure monitoring asks whether hosts and services are available.

Workflow monitoring asks whether expected processes actually ran.

Data monitoring asks whether expected outputs exist, are complete, and belong to the correct forecast cycle.

Product monitoring asks whether the current forecast has actually reached the system that users depend on.

The important distinction is simple:

> **Infrastructure availability is not the same as product availability.**

The same principle applies to recovery.

If a long-running model has already completed successfully and only a downstream transfer fails, rerunning the entire forecast is not really recovery. It is unnecessary recomputation.

A more resilient workflow should preserve valid completed work and repeat only the stage that actually failed.

That will be the focus of the final article: monitoring, workflow state, freshness, alerts, and recovery.

## Where this series goes next

The series will follow four connected engineering problems:

### 01. From Cron Jobs to Orchestrated Forecast Workflows

Scheduling, dependencies, distributed execution, retries, and using Prefect around existing Python, Bash, SSH, and SLURM workflows.

### 02. The Compute Engine

Benchmarking operational wave-model workloads and finding the balance between runtime and HPC resource consumption.

### 03. Storing Multidimensional Geospatial Data

How downstream analytical requirements changed the way I thought about NetCDF, Xarray, Zarr, chunking, and object storage.

### 04. Production Resilience

Monitoring infrastructure, workflows, data freshness, and forecast products—and recovering when one part of the system fails.

These are not four unrelated projects.

They are different manifestations of the same engineering challenge: **turning scientific computation into something dependable enough to run repeatedly in production.**


## Disclaimer

Everything I describe exists within a larger team-operated environment.

I did not build the entire operational ocean forecasting system. Some components existed long before I worked on them. Others were developed by colleagues, researchers, vendors, or different engineering teams.

What I can speak about directly are the parts I personally worked on: workflows I automated, systems I maintained, benchmarks I ran, data architectures I experimented with, monitoring I built or operated, and operational problems I investigated.

Infrastructure details will be generalized where appropriate.

The purpose of this series is not to document an internal forecasting platform. It is to extract engineering lessons that remain useful beyond ocean forecasting.

Because producing a forecast is only one part of the problem.

A production system has to produce it repeatedly, produce it on time, make it usable downstream, and make failure visible when something goes wrong.
