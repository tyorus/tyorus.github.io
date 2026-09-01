---
title: "Storing Multidimensional Geospatial Data"
description: "Model output layout vs analytical access patterns: NetCDF, Xarray, chunking, Zarr, and object storage trade-offs."
pubDate: "2026-09-15"
tags: ["Zarr", "NetCDF", "Xarray", "Geospatial Data", "Object Storage", "Ocean Forecasting"]
categories: ["Ocean modelling", "Production System"]
math: false
lang: en
draft: true
---

> ## TL;DR
> There is no universally best storage format.
> Storage layout should follow how data will actually be accessed — and that is often different from how a numerical model naturally writes its output.

## Files organized around forecast cycles

An operational ocean forecasting system produces output on a regular schedule. Each forecast cycle generates one or more files, named and organized by run time:

```text
forecast_20260101_00.nc
forecast_20260101_12.nc
forecast_20260102_00.nc
forecast_20260102_12.nc
...
```

This layout is natural for operations. Each file is self-contained. It corresponds to one model run. It can be transferred, archived, or delivered to users as a discrete product. If a single cycle fails, the surrounding files are unaffected.

I worked with this pattern for years and it served operational needs well. The friction appeared when I started doing analytical work that cut across many cycles at once.

## When the file layout becomes the bottleneck

Consider climatological analysis — computing monthly or seasonal averages of sea surface temperature, significant wave height, or current speed over several years of operational output.

Each individual NetCDF file might contain 10 days of hourly data across multiple variables and depth levels. To compute a January climatology for one point, I need January data from every January in the archive. That means opening dozens or hundreds of files, extracting the relevant timesteps, and combining them. To compute a spatial map of the long-term mean at one depth level, I need a different slice from each of those same files.

The model organized its output around forecast runs. My analytical question organized data around time periods, locations, and variables. Those two organizations do not align.

> As the historical collection grows, the challenge is no longer only how to store individual model outputs, but also how we can access and process data across months or years efficiently.

This is not a criticism of <a href="https://en.wikipedia.org/wiki/NetCDF" target="_blank" rel="noopener noreferrer">NetCDF</a>. NetCDF remains extremely useful for scientific data exchange and numerical-model output, and we still use it extensively. The issue is that storage organized around model output is not always organized around downstream analytical access patterns.

## The multidimensional data model

Datasets from NWP and ocean models are naturally multidimensional:

```text
time
latitude
longitude
depth
variable
```

A single forecast file might contain sea surface temperature, current components, and wave parameters, each defined on a lat–lon grid with multiple depth levels and hourly timesteps. The metadata — coordinate names, units, fill values — follows CF conventions that make the data interpretable across tools and institutions.

Understanding this structure is the starting point for any storage decision. The question is not "which format?" but "which layout within that format matches the questions I will ask most often?"

## Xarray as an analytical layer

<a href="https://docs.xarray.dev/" target="_blank" rel="noopener noreferrer">Xarray</a> became my primary tool for working across collections of forecast files. It provides labeled dimensions, lazy loading, and operations that respect the structure of multidimensional data.

Opening many files as one logical dataset is straightforward:

```python
import xarray as xr

files = sorted(data_dir.glob("forecast_*.nc"))
ds = xr.open_mfdataset(files, combine="by_coords", parallel=True)
```

With `chunks` specified, Xarray reads only the portions of each file needed for a given operation rather than loading everything into memory. That lazy evaluation is essential when the combined dataset spans terabytes across hundreds of files.

Xarray does not solve the underlying access-pattern problem by itself. If the data is stored in a layout that requires reading entire files to extract a single time series at one location, Xarray will still trigger those reads — it just makes the code cleaner while doing so.

## Chunking as an engineering decision

Chunking is the practice of dividing a multidimensional array into smaller rectangular blocks stored and read independently. It is not unique to any one format. NetCDF-4 supports internal chunking. <a href="https://en.wikipedia.org/wiki/Zarr_(data_format)" target="_blank" rel="noopener noreferrer">Zarr</a> is built around chunks as its fundamental storage unit.

The choice of chunk shape is an engineering decision because it determines how much data must be read for a given query.

Different analytical questions imply different access patterns:

```text
one timestep over the entire domain
    → read all lat/lon for one time slice

one location over several years
    → read all time steps for one lat/lon point

one variable over a regional subset
    → read one variable across a lat/lon bounding box

monthly climatology
    → read many timesteps across many files, aggregate by calendar month
```

If chunks are shaped `(1, 100, 100)` — one timestep per chunk — the "one timestep, full domain" query is efficient. The "one location, multi-year time series" query is expensive, because it must open many chunks across many files.

If chunks are shaped `(1000, 1, 1)` — many timesteps at a single point — the time-series query is efficient but the spatial map query is not.

There is no chunk shape that optimizes every access pattern simultaneously. The engineering task is to identify the dominant queries and choose a layout that minimizes unnecessary I/O for those queries, while accepting that other queries will be slower.

## Zarr and object storage

Zarr stores each chunk as a separate object in a directory or bucket. This has several practical consequences.

**Parallel reads.** Multiple processes can read different chunks simultaneously without locking a single file. This matters for distributed analysis on HPC or in cloud environments.

**Cloud-friendly access.** Zarr works naturally with object storage systems such as S3-compatible buckets. A chunk store can live in a bucket and be accessed remotely without mounting a shared filesystem.

**Rechunking without rewriting everything.** Converting a collection of per-cycle NetCDF files into a Zarr store with a chosen chunk layout is a one-time transformation. After that, analytical queries against the Zarr store can be much faster for the access patterns the chunk layout was designed for.

**Transparency.** The chunk index is human-readable JSON. You can inspect the store structure, chunk sizes, and compression settings without proprietary tools.

Zarr is particularly useful for large multidimensional datasets where the dominant access pattern is known in advance — climatological analysis, reanalysis-style products, or training data extraction for machine learning workflows.

It is less obviously beneficial when the primary use case is delivering one self-contained file per forecast cycle to external users who expect a standard NetCDF product.

## A reproducible experiment

<!-- TODO: Link to geospatial-storage-patterns repository -->

I plan to publish a companion repository called `geospatial-storage-patterns` that demonstrates the storage trade-offs with a small public dataset. The experiment will follow these steps:

1. Obtain or generate a small multidimensional dataset with time, latitude, longitude, and at least one variable.
2. Store it as a collection of per-timestep (or per-cycle) NetCDF files, mimicking operational output layout.
3. Open and combine the files with Xarray.
4. Convert the combined dataset to Zarr using two or three different chunk layouts.
5. Benchmark several access patterns against each storage arrangement.
6. Compare results.

<!-- TODO: Dataset source (public sample, e.g. CMEMS subset or synthetic generator) -->

The access patterns to benchmark:

| Query | Description |
| --- | --- |
| Spatial slice | One timestep, full domain, one variable |
| Time series | One lat/lon point, all timesteps, one variable |
| Regional subset | One variable, bounded lat/lon box, one month of timesteps |
| Climatological mean | Monthly mean across all available years |

<!-- TODO: Benchmark table — access pattern × storage format × chunk layout -->

<!-- TODO: Diagram — file-per-forecast vs rechunked store access paths -->

I have not yet run this experiment publicly. The article describes the engineering reasoning; the repository will provide the measured evidence.

## Trade-offs

**When NetCDF remains the right answer:**

- Delivering a single forecast product to external users who expect CF-compliant NetCDF.
- Model native output — the model writes NetCDF directly and downstream consumers read it as-is.
- Small archives where analytical queries across many files are rare.
- Scientific data exchange where tool compatibility and convention adherence matter more than read performance.

**When rechunked Zarr helps:**

- Repeated analytical queries spanning long time periods.
- Distributed processing where parallel chunk reads matter.
- Cloud-based workflows where object storage replaces shared filesystems.
- Internal analysis pipelines where you control both storage and query patterns.

**Costs of conversion:**

- A one-time (or periodic) ETL step to transform model output into the analytical store.
- Storage of both the operational archive and the analytical store, unless you choose to replace one with the other.
- Maintenance of chunk layout decisions as domain resolution, variable sets, or analytical requirements change.

There is no universally best storage format. The right choice depends on who reads the data, how often, and what questions they ask.

## What I learned

Working on downstream analysis in an operational ocean forecasting environment taught me that the model's output layout and the analyst's access pattern are often designed independently — and that mismatch becomes more expensive as the archive grows.

NetCDF is not the problem. Zarr is not the solution to everything. The engineering decision is chunk layout and storage organization, guided by the dominant queries.

Even when data is efficiently stored and accessible, production still needs to know whether the expected latest data is complete, fresh, and actually available to users. That observability problem is the subject of the final article in this series.

## In this series

This article is part of a series on engineering lessons from an operational ocean forecasting environment. Continue with:

- [Production Resilience](/projects/operational-forecast-monitoring/) — observability from infrastructure to product health

Previous: [The Compute Engine](/projects/performance-benchmarking-hpc/)

Start from the [series overview](/projects/metocean-data-engineering/) if you have not read it yet.
