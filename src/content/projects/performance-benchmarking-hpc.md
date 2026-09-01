---
title: "The Compute Engine"
description: "HPC scaling is not linear: benchmarking an operational WAVEWATCH III workload on SLURM to meet forecast deadlines without over-allocating resources."
pubDate: "2026-09-08"
tags: ["HPC", "SLURM", "WW3", "Benchmarking", "Ocean Forecasting", "Parallel Computing"]
categories: ["Ocean modelling", "Production System"]
math: true
lang: en
draft: true
---

> ## TL;DR
> More processors does not mean proportionally faster simulation.
> The objective is not to request the largest possible allocation — it is to find a configuration that meets the operational deadline while using resources reasonably efficiently.

## The assumption that breaks on HPC

Many people who work with numerical weather and ocean models first encounter them on a workstation or laptop. During university, I ran WRF on a single machine and learned to think about runtime in simple terms: more cores, shorter wait.

That intuition carries over poorly to HPC.

When I started benchmarking an operational wave-model workload on a cluster, the question was not "how fast can this possibly run?" but "what configuration gets the 10-day nested-domain forecast finished before the downstream deadline, without wasting nodes that could be used elsewhere?"

The workload was <a href="https://github.com/NOAA-EMC/WW3" target="_blank" rel="noopener noreferrer">InaWaves</a>, built on WAVEWATCH III — a third-generation spectral wave model running operationally as part of a team-operated ocean forecasting system at BMKG. For the benchmark described here, I used `ww3_multi`, the parallel multi-domain driver, on the Disaster Recovery Center (DRC) cluster in Bali.

The operational forecast uses four nested domains with hourly timesteps and up to 10 days of integration:

| Domain | Resolution (°) | Coverage | Time step (s) |
| --- | ---: | --- | ---: |
| global | 1.0 | 0–360°E, 70°S–70°N | 3600 |
| regional | 0.5 | 80–160°E, 30°S–30°N | 1800 |
| super regional | 0.25 | 85–150°E, 20°S–20°N | 900 |
| hires | 0.0625 | 90–145°E, 15°S–15°N | 600 |

This is a realistic operational setup — not a toy domain — and it is exactly the kind of workload where scaling behaviour matters.

## Why scaling is more complicated than adding cores

A wave model on HPC is not embarrassingly parallel. Domains are coupled. MPI processes exchange boundary information. OpenMP threads share memory within a node. I/O writes compete with computation. The SLURM scheduler places your job in a queue alongside everyone else's.

WAVEWATCH III can be compiled with different parallelization strategies, controlled by a compile-time switch:

| Option | Role |
| --- | --- |
| **MPI** | Pure MPI (distributed memory) |
| **OMPG** | OpenMP exclusive or hybrid MPI–OpenMP |
| **OMPH** | Hybrid MPI–OpenMP only |

Each option changes how work is divided across processes and threads, and therefore how communication overhead scales with resource count. The right choice is not obvious from the documentation — it has to be measured on the actual hardware and domain configuration you intend to run in production.

## The benchmarking mindset

For an operational ocean forecasting system, every minute before the publication deadline matters. Model output has to be available before downstream processing, visualization, and dissemination.

> The objective is not to request the largest possible allocation. It is to find a configuration that meets the operational deadline while using resources reasonably efficiently.

That sounds obvious, but it changes what you measure. A configuration that finishes 10 seconds faster but requires four extra nodes may not be worth it if a cheaper configuration already meets the deadline with room to spare. Conversely, a configuration that is efficient on paper but routinely misses the deadline is not operational.

## Metrics

I measured two runtime components from the model log: **init time** (setup before the time integration loop) and **elapsed time** (the integration itself). For comparing resource configurations, I used speedup and parallel efficiency:

$$
S = \frac{T_1}{T_N}, \qquad E = \frac{S}{N} \times 100\%
$$

where $T_1$ is the runtime on the baseline configuration (typically one node) and $T_N$ is the runtime using $N$ times the baseline resource count.

Speedup tells you how much faster a configuration is relative to the baseline. A speedup of 4 means the job finished in one quarter of the time. Parallel efficiency tells you how much of that speedup you actually got per unit of extra resource. Perfect linear scaling would give $E = 100\%$. In practice, efficiency drops as communication overhead, I/O contention, and load imbalance grow. An efficiency of 50% at 8 nodes means you are using twice the resources but only getting 4× the speed — the other resources are spent on coordination rather than computation.

## Experiment design

The benchmark used a fixed 6-hour integration window with the operational domain setup described above. I compiled three parallelization options (MPI, OMPG, OMPH) against WW3 7.14 with Intel compilers and MPI, and submitted jobs through SLURM using `srun` as the launcher.

The procedure was deliberate and repeatable:

1. Compile all three SWITCH options.
2. Compare them on the same single-node configurations.
3. Select the best option.
4. Sweep across nodes, cores, and threads.
5. Collect init and elapsed times from `ww3_multi` logs.

A generic SLURM job skeleton for the sweep looked conceptually like this:

```bash
#!/bin/bash
#SBATCH --job-name=ww3-bench
#SBATCH --nodes=8
#SBATCH --ntasks-per-node=96
#SBATCH --cpus-per-task=1
#SBATCH --time=01:00:00
#SBATCH --output=logs/%x_%j.out

module load intel/2021.5 intelmpi/2021.5

srun ./ww3_multi
```

The exact partition names, module paths, and task layout varied across configurations. The important part is that every run in a comparison used the same domain setup, the same integration length, and the same input data.

## Choosing a parallelization option

On a single node, I swept cores and threads per core while keeping the total task count consistent where possible. OMPH performed best overall.

| Threads/core | Cores | Tasks/node | Elapsed MPI (s) | Elapsed OMPG (s) | Elapsed OMPH (s) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 96 | 156.71 | 193.51 | 180.20 |
| 1 | 48 | 48 | 185.37 | 185.34 | 188.10 |
| 1 | 24 | 24 | 295.86 | 295.76 | 293.82 |
| 2 | 48 | 96 | — | 158.27 | **133.64** |
| 4 | 24 | 96 | — | 200.47 | 145.77 |
| 2 | 24 | 48 | — | 226.14 | 190.30 |

The best single-node result was OMPH at 96 tasks, 48 cores, and 2 threads per core: 133.64 seconds elapsed. Pure MPI reached 156.71 seconds at 96 cores with 1 thread. OMPG was competitive but consistently slower on both init and elapsed time.

OMPH won because hybrid MPI–OpenMP uses shared memory within a node and distributed memory across nodes, reducing inter-process communication overhead compared to pure MPI at high task counts. This is not a universal rule for all models on all hardware — it is what the measurement showed for this workload on this cluster.

## Scaling across nodes

With the parallelization option fixed, I swept the number of nodes. OMPH and OMPG continued to improve through 8 nodes. MPI peaked earlier, around 4 nodes, and did not benefit from further scaling in the tests available.

| Nodes | Elapsed MPI (s) | Elapsed OMPG (s) | Elapsed OMPH (s) |
| ---: | ---: | ---: | ---: |
| 1 | 156.71 | 158.27 | 133.64 |
| 2 | 132.28 | 110.20 | 85.30 |
| 4 | 110.93 | 88.93 | 66.87 |
| 8 | — | **79.92** | **58.98** |

Going from 1 to 8 nodes, OMPH elapsed time dropped from 133.64 s to 58.98 s — a speedup of about 2.3× using 8× the nodes. That is useful, but far from linear. The efficiency at 8 nodes is roughly 29%. Each additional node buys less improvement than the last.

This is the pattern I expected, but seeing it in the numbers still changed how I thought about resource requests. Doubling nodes does not double speed. At some point, the queue time and resource cost of extra nodes outweigh the runtime gain.

## The resource sweep and the production choice

With OMPH selected, I swept threads per core against node count. Two patterns stood out.

**Init time decreased roughly logarithmically with thread count** — from about 62 s at 1 thread down to about 3.8 s at 32 threads. More threads help the model distribute its initial setup work.

**Elapsed time formed a valley.** Performance improved up to about 8 threads per core, then degraded beyond that. On 1–2 nodes, the sweet spot was closer to 2–4 threads. Past 8 threads, elapsed time rose again — likely due to thread contention and communication bottlenecks between nodes.

The absolute fastest configuration in the sweep was 12 nodes with 8 threads per core, finishing in about 34 seconds. But the gain from 10 to 12 nodes was small compared to the jump from 6 to 8 nodes. Extreme configurations — very few or very many threads, or very high node counts — also failed more often.

I chose **8 nodes · 12 cores/node · 8 threads/core** for production. It was not the fastest single data point in the sweep. It was the configuration that balanced runtime, stability, and resource consumption with enough margin before the operational deadline.

> Adding more computing resources does not always make a model run much faster.

That was the lesson from the sweep, stated plainly.

## Context: why benchmarking mattered

The DRC cluster replaced a legacy supercomputer for this workload. Running the same 10-day, four-domain forecast on comparable hardware told part of the story:

| Metric | Legacy | DRC (optimal config) |
| --- | ---: | ---: |
| Elapsed (s) | ~2600 | ~740 |
| Init (s) | ~420 | ~10 |

The new hardware was faster — AMD EPYC 7642 versus Intel Xeon E5-2670 v3, more cores per socket, more RAM. But hardware alone did not explain the full gain. The legacy system ran default MPI only. Moving to OMPH on the new cluster was a parallelization improvement as much as a hardware upgrade.

I mention this not as a hardware comparison exercise, but as motivation. Without benchmarking, it would have been easy to request the default MPI build on the new cluster and leave most of the performance improvement on the table.

## A reproducible methodology for readers

<!-- TODO: Link to hpc-scaling-benchmark repository (synthetic reproducible methodology) -->

Most readers will not have access to the same HPC infrastructure or a WAVEWATCH III installation. I plan to publish a companion repository called `hpc-scaling-benchmark` with a synthetic CPU-bound workload — something like a parameterized matrix operation or embarrassingly parallel loop — that can be submitted through SLURM in a node sweep.

The repository will include:

- A Python workload with configurable compute intensity
- A SLURM array or sweep script varying node and task counts
- A results collector that computes speedup and parallel efficiency
- A plotting script for runtime vs resource curves

<!-- TODO: Plot runtime vs nodes — synthetic workload results from public repo -->

<!-- TODO: Optional — sanitized SLURM job log excerpt -->

The public experiment demonstrates the **methodology** — how to design a sweep, keep inputs comparable, measure runtime, and interpret diminishing returns. It cannot replicate the specific behaviour of a spectral wave model with nested domains, MPI–OpenMP coupling, and operational I/O patterns. Those effects only appear when you benchmark the actual workload on the actual system.

## Trade-offs and limitations

Benchmark results are snapshots. Cluster load, filesystem contention, and queue wait times change from day to day. A configuration that wins in a controlled benchmark may behave differently during a busy operational period.

Over-allocation wastes queue share and denies resources to other teams. Under-allocation risks missing the forecast deadline. The production configuration I chose was a compromise, not an optimum in the mathematical sense.

Benchmarking also takes time. Compiling three SWITCH options, running dozens of configurations, and parsing logs is not free. For a model that runs daily with a stable domain setup, the investment pays off over months of operational runs. For a one-off experiment, it may not.

Finally, the optimal configuration can shift. A model upgrade, a domain resolution change, or a new compiler version can invalidate prior results. Benchmarking is not a one-time task — it is a recurring engineering practice.

## What comes next

Once the compute engine finishes producing forecasts efficiently, another issue grows over time: the amount and organization of the output. A model that runs well on HPC still writes files in a layout optimized for the model run, not necessarily for the analytical questions people ask afterward. That is the subject of the next article.

## In this series

This article is part of a series on engineering lessons from an operational ocean forecasting environment. Continue with:

- [Storing Multidimensional Geospatial Data](/projects/storing-geospatial-data-zarr/) — NetCDF, Xarray, chunking, and Zarr
- [Production Resilience](/projects/operational-forecast-monitoring/) — observability from infrastructure to product health

Previous: [From Cron Jobs to Orchestrated Forecast Workflows](/projects/orchestrated-forecast-workflows/)

Start from the [series overview](/projects/metocean-data-engineering/) if you have not read it yet.

## Further reading

- NOAA-EMC, *The WAVEWATCH III Framework* (2024). [github.com/NOAA-EMC/WW3](https://github.com/NOAA-EMC/WW3)
- Tolman, H. L. (2002). Distributed-memory concepts in the wave model WAVEWATCH III. *Parallel Computing*, 28(1), 35–52.
- Rautenbach, C., Mullarney, J. C., & Bryan, K. R. (2021). Parallel computing efficiency of SWAN 40.91. *Geoscientific Model Development*, 14(7), 4241–4247.
