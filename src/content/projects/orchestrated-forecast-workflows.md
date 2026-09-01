---
title: "From Cron Jobs to Orchestrated Forecast Workflows"
description: "Why scheduling is not orchestration: dependencies, retries, recovery, and workflow state in an operational ocean forecasting environment."
pubDate: "2026-09-01"
tags: ["Prefect", "Workflow Orchestration", "SLURM", "Data Engineering", "Ocean Forecasting"]
categories: ["Ocean modelling", "Production System"]
math: false
lang: en
draft: true
---

> ## TL;DR
> Cron and shell scripts can carry a surprising amount of operational work.
> The problem appears when dependency logic, recovery rules, and workflow state all end up buried inside custom code.
> An orchestrator coordinates work across environments — it does not replace the compute engine underneath.

## The workflow I inherited

In the [overview article](/projects/metocean-data-engineering/), I described a simplified version of the production chain I worked with inside an operational ocean forecasting environment:

```text
scheduler
    ↓
script
    ↓
remote system
    ↓
compute job
    ↓
post-processing
    ↓
publication / transfer
```

At a small scale, this pattern works well. A cron entry fires a Bash wrapper on `orchestration-server`. The wrapper SSHs to `processing-node`, submits a SLURM job on `hpc-login`, waits for completion, runs a Python post-processing step, and copies the result to `publication-server`. I have maintained workflows built exactly this way, and the tools involved — cron, Bash, Python, SSH — are not the problem.

The limitation appears when scheduling starts being treated as orchestration.

## When the simple approach is enough

If a workflow has a handful of steps, runs on one or two machines, and fails rarely enough that a manual rerun is acceptable, a script-plus-scheduler setup is a reasonable engineering choice. It has few moving parts. It does not require another service to operate. A competent colleague can read one file and understand the full chain.

I would still use this pattern today for low-frequency, low-complexity tasks. The mistake is not choosing cron. The mistake is letting operational state and dependency logic accumulate inside scripts without any structure to hold them.

## Two failures that changed how I thought about it

The first case was straightforward on paper and painful in practice. The numerical model had finished on the HPC cluster. Post-processing completed. The final transfer to the publication server failed — a transient network issue, a full disk, something ordinary. The scheduler's next run, or a manual rerun of the wrapper script, started the entire chain from the beginning. That meant another SLURM allocation, another multi-hour model integration, for work that had already succeeded.

The second case was subtler. An upstream boundary-condition file had not arrived by the time the workflow started. The download step failed. Because everything lived in one script, the whole run was marked failed — including stages that had not even been attempted yet. In reality, the right response was to wait and retry the download, not to treat the forecast cycle as dead.

Both cases are dependency and recovery problems. Of course they can be handled in Bash or Python. I have added retry loops, conditional checks, and state files scattered across directories. That works until the workflow grows.

> The problem is that, as the workflow grows, more of its operational logic becomes hidden inside the custom code. Dependencies become harder to see, recovery procedures become less obvious, and a newcomer may need to read several scripts just to understand how one production workflow actually runs.

## A different mental model

Cron answers one question: *should this command run at this time?*

Orchestration answers a different set of questions:

```text
this stage depends on that stage,
runs in this environment,
has this state,
and can be retried independently
```

That shift matters because operational forecasting workflows are not single commands. They are graphs of work that cross execution environments. Input acquisition may run on a data-ingest host. The model runs under SLURM. Post-processing may run on a separate processing node. Publication may involve another remote copy. Each stage has its own failure modes, retry policy, and runtime characteristics.

What I wanted was not a new way to run the model. The model runner, the SLURM submission script, and the post-processing utilities were already doing their jobs. I wanted a layer above them that could see the whole graph, remember what had already succeeded, and resume from the right place.

## What orchestration adds

An orchestrator provides a few things that are awkward to maintain by hand.

**Explicit dependencies.** Instead of implicit ordering inside a shell script, stages declare what they need. If publication depends on post-processing, and post-processing depends on compute, that structure is visible without reading every line of Bash.

**Persisted workflow state.** When a stage completes, the orchestrator records it. A later failure does not erase that record. On retry, completed stages can be skipped.

**Independent retry.** A transfer step can be retried three times with a backoff policy without resubmitting the HPC job. A download step can wait for upstream data without failing stages that do not depend on it yet.

**Execution environment routing.** Different stages run in different places. A local worker handles lightweight Python tasks. An HPC worker submits and monitors SLURM jobs. A remote worker handles SSH-based operations on another host. The orchestrator decides where each task runs; the task itself stays focused on the work.

**Visibility for the team.** When something breaks at 03:00, it helps to open one interface and see which stage failed, which stages completed, and what the last successful run looked like. That was harder when state was spread across log files, marker files, and comments inside scripts.

Here is the generalized architecture I ended up working toward:

```text
                   Orchestration Server
                           │
                    workflow state
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    local worker       HPC worker      remote worker
          │                │                │
    Python/Bash         SLURM jobs      Python/SSH
```

One lesson that became important to me was that **an orchestrator does not need to become the compute engine**. SLURM still schedules the model. The existing Bash and Python programs still do the actual work. The orchestrator keeps track of what should run, where it should run, what it depends on, and what state each part of the workflow is currently in.

## Prefect as one implementation

I introduced <a href="https://docs.prefect.io/v3/get-started" target="_blank" rel="noopener noreferrer">Prefect</a> into parts of the workflows I maintained. This article is not a Prefect tutorial — the subject is workflow orchestration — but it helps to see how the concepts map to a concrete tool.

A Prefect flow defines the workflow graph. Individual tasks wrap existing scripts or Python functions. Work pools route tasks to the right execution environment. When a flow run fails, the orchestration server retains state about which tasks completed.

Here is a simplified illustration of how I think about task boundaries. The real production code is more complex; this shows the pattern:

```python
from prefect import flow, task

@task(retries=3, retry_delay_seconds=120)
def download_input(cycle: str) -> str:
    # Wrap existing download script; return path to input file
    ...

@task
def prepare(input_path: str) -> str:
    # Lightweight preprocessing on local worker
    ...

@task
def compute(prepared_path: str) -> str:
    # Submit SLURM job via HPC worker; return output path
    ...

@task(retries=2)
def postprocess(model_output: str) -> str:
    ...

@task(retries=3, retry_delay_seconds=60)
def publish(processed_path: str) -> None:
    # Idempotent copy to publication-server
    ...

@flow
def forecast_cycle(cycle: str):
    raw = download_input(cycle)
    prep = prepare(raw)
    model_out = compute(prep)
    final = postprocess(model_out)
    publish(final)
```

A few engineering decisions are visible in that sketch.

**Retries belong at the task level, not only at the script level.** A publication task that fails on a network blip can retry without touching compute.

**Idempotency matters for publish steps.** Copying the same processed file to the publication server twice should not corrupt downstream state. Where possible, publication writes to a temporary name and atomically replaces the target.

**Configuration varies by environment.** The same flow definition can run against different work pools, input directories, or SLURM partitions depending on whether it is a test run or an operational cycle. Keeping that configuration outside the task logic made it easier to reason about.

**Avoid unnecessary recomputation.** If `compute` and `postprocess` completed in a prior run and only `publish` failed, a re-run should not resubmit the SLURM job. Orchestrators handle this through task result caching or explicit state — the exact mechanism depends on the tool, but the engineering goal is the same.

## A reproducible example

<!-- TODO: Link to forecast-workflow-orchestration repository -->

I plan to publish a generalized demonstration repository called `forecast-workflow-orchestration`. It will simulate a forecast pipeline without any proprietary model code:

```text
download_input
      ↓
prepare
      ↓
compute
      ↓
postprocess
      ↓
publish
```

Each stage will be a lightweight Python function with configurable sleep duration to mimic real runtime differences. The repository will include a failure-injection mechanism — for example, a flag that causes `publish` to fail on the first two attempts — so that partial rerun and recovery can be demonstrated without an HPC cluster.

<!-- TODO: Diagram of dependency graph with failure injection points -->

<!-- TODO: Screenshot of orchestration UI showing partial rerun / recovery -->

<!-- TODO: Example run demonstrating retry after publish failure -->

The point of the demo is not to reproduce an internal system. It is to show the engineering pattern: staged dependencies, persisted state, selective retry, and independent recovery.

## Trade-offs

Orchestration is not free. It adds a service to operate, a database or state backend to maintain, and a learning curve for the team. For a workflow that runs once a week with two steps and rarely fails, that overhead may not be justified.

There is also a risk of over-centralizing logic. If every conditional branch, data validation rule, and environment-specific hack moves into the orchestrator, the flow definition becomes as hard to read as the original Bash script. I tried to keep business logic inside the existing programs and use the orchestrator for coordination, state, and retry policy.

Environment differences are another practical concern. A task that works on a development worker may behave differently on an HPC worker with a different module stack, filesystem layout, or network path to a data source. Testing the full graph across environments is as important as testing individual scripts.

## What I learned

The workflows I maintained did not need to be rewritten from scratch. The model runners, SLURM submission wrappers, and post-processing scripts were already the right tools for their jobs. What they needed was a coordination layer that understood dependencies, remembered state, and could recover without wasting an HPC allocation on work that had already finished.

That coordination problem is distinct from the compute problem. Even after work is correctly orchestrated, the expensive numerical workload itself still needs to use compute resources efficiently. That is where the next article in this series begins.

## In this series

This article is part of a series on engineering lessons from an operational ocean forecasting environment. Continue with:

- [The Compute Engine](/projects/performance-benchmarking-hpc/) — HPC scaling and performance benchmarking
- [Storing Multidimensional Geospatial Data](/projects/storing-geospatial-data-zarr/) — NetCDF, Xarray, chunking, and Zarr
- [Production Resilience](/projects/operational-forecast-monitoring/) — observability from infrastructure to product health

Start from the [series overview](/projects/metocean-data-engineering/) if you have not read it yet.
