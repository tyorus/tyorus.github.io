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

Here, I identified four key problems that significantly affected the efficiency of our operational ocean forecasting workflow.

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

If only the final transfer fails, rerunning an expensive computation (SLURM job) makes little sense. Likewise, if upstream data has not arrived yet, marking the entire workflow as failed may not be the right response either.

Those are dependency and recovery problems. 

Of course, we can handle them with Bash or Python. We can add retry loops, conditional checks, and more scripts around or inside the existing scripts. I have done that too.

> The problem is that, as the workflow grows, more of its operational logic becomes hidden inside the custom code. Dependencies become harder to see, recovery procedures become less obvious, and a newcomer may need to read several scripts just to understand how one production workflow actually runs.

This was one reason I started introducing <a href="https://docs.prefect.io/v3/get-started" target="_blank" rel="noopener noreferrer">Prefect</a> into parts of the workflows I maintained.

The idea was not to replace all of the existing programs. Those were already good at executing work.

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

That problem will be the focus of the first technical article in this series.

## 2. Deploying programs on HPC

The next challenge appears once the workflow reaches its compute-heavy stages.

I believe many of my colleagues have experience running NWP models on their own laptops, especially WRF during college. When moving the same kind of workload to an HPC cluster, it is tempting to assume that simply allocating more processors will make the model run proportionally faster.

In practice, distributed computing does not work that way.

Running a program on HPC is one thing, running it efficiently is another. It requires understanding how the workload behaves across multiple nodes and finding the configuration that makes the best use of the available resources.

The objective was simple: to find minimum possible runtime.

For an operational forecasting system, every minute matters. Model output has to be available before downstream processing, visualization, dissemination, and ultimately the forecast deadline.

Here is what I found:

> Adding more computing resources does not always make a model run much faster. 

At some point, using more nodes or CPUs may only give a small improvement, so running a numerical model on HPC still requires some testing to find the most effective configurations.

The second article will explore this through performance benchmarking of an operational wave-model workload.

## 3. Data format should be optimized for easy of use

Then there is the model output itself.

Datasets from NWP models are naturally multidimensional, typically they contains the following dimensions:

```text
time
latitude
longitude
depth
variable
```

<a href="https://en.wikipedia.org/wiki/NetCDF" target="_blank" rel="noopener noreferrer">NetCDF</a> remains extremely useful for scientific data exchange and numerical-model output, and we still use it extensively.

However, while working on downstream analysis workflows, I became more aware that the way these datasets are stored is not always ideal for every use case. 

Consider the case for climatological analysis. 

> As the historical collection grows, the challenge is no longer only how to store individual model outputs, but also how we can access and process data across months or years efficiently.

This pushed me to explore storage formats designed around different access patterns, which eventually led me to <a href="https://en.wikipedia.org/wiki/Zarr_(data_format)" target="_blank" rel="noopener noreferrer">Zarr</a>.

Zarr is particularly useful for large multidimensional datasets because the data can be stored in chunks and accessed in parallel without reading an entire file. It also works naturally with object storage, making it well suited for cloud-based access and processing.

The third article will focus on this shift from model-output-oriented files toward storage and access patterns designed for downstream analysis.

## 4. A successful workflow does not mean a healthy product

The final gap is observability.

In operational systems, it is tempting to define health through infrastructure metrics or workflow states.

A server may report:

```text
CPU          healthy
memory       healthy
disk         healthy
network      healthy
process      running
```

An orchestrator may also report that the latest workflow completed successfully.

Yet the forecast products available to users can still be stale.

This made me think about operational health as several connected layers:

```text
Infrastructure -> Workflow -> Data -> Product
```

- Infrastructure monitoring asks whether hosts and services are available.
- Workflow monitoring asks whether expected processes actually ran.
- Data monitoring asks whether expected outputs exist, are complete, and belong to the correct forecast cycle.
- Product monitoring asks whether the current forecast has actually reached the system that users depend on.

In practice, I use tools such as Grafana to make some of these signals easier to observe, particularly data freshness across operational products. 

For an operational forecasting system, the final question is not simply:

> Is the system running?

but

> Is the latest expected forecast product actually available to the user?

The final article will explore this end-to-end view of observability, from infrastructure and workflow states to data freshness and operational product availability.

## Where this series goes next

The series will follow four connected engineering problems:

### 01. From Cron Jobs to Orchestrated Forecast Workflows

How scheduling evolves into orchestration once workflows span multiple machines and execution environments. This article will cover dependencies, retries and recovery, distributed execution, configuration, and reproducibility using Prefect around existing Python, Bash, SSH, and SLURM workflows.

### 02. The Compute Engine

How to run numerical workloads efficiently on HPC rather than simply allocating more resources. This article will explore SLURM, performance benchmarking, scaling behaviour, and the trade-off between runtime and resource consumption.

### 03. Storing Multidimensional Geospatial Data

How downstream analytical requirements change the way model output should be organized. This article will explore NetCDF, Xarray, chunking, Zarr, object storage, and how different access patterns influence storage design.

### 04. Production Resilience

How to determine whether an operational forecasting system is actually healthy. This article will connect infrastructure monitoring, workflow state, data quality and freshness, product availability, metrics, dashboards, and alerts into a broader view of operational health.

## Disclaimer

Everything I describe exists within a team-operated environment.

I did not build the entire operational ocean forecasting system. Some components existed long before I worked on them. Others were developed by colleagues or different engineering teams.

I will focus only on the areas I worked on directly. The goal is not to document an internal platform, but to extract engineering lessons that are useful beyond ocean forecasting.

Because producing a forecast is only one part of the problem.

A production system has to produce it repeatedly, produce it on time, make it usable downstream, and make failure visible when something goes wrong.
