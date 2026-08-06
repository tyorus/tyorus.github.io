---
title: "Operational Intelligence Brief"
description: "Outcome: turn Ads + CRM + ops sheets into a weekly narrative brief with anomaly flags and email/Slack delivery — production DE patterns applied to agency ops."
pubDate: "2026-08-04"
tags: ["python", "automation", "agency", "reporting", "streamlit"]
categories: ["Automation"]
lang: en
---

Weekly **Operational Intelligence Brief** for marketing / growth agencies — selective freelance automation built with the same production data-engineering discipline used in operational metocean systems.

## Problem

Account teams pull Ads exports, CRM CSVs, and a client ops sheet, then rebuild the same weekly status pack by hand. Anomalies often surface only after the update was already sent.

## Outcome

A repeatable workflow that:

- Ingests multi-source files into one readiness check
- Flags anomalies (high CPA, zero conversions, low NPS, task backlog)
- Writes a short narrative brief with suggested actions
- Leaves an Excel/PDF audit trail and prepares email/Slack delivery

Transferable skills from production DE work: ingest, QC, orchestration mindset, anomaly rules, and reliable delivery — not another dashboard login.

## Approach

1. Ingest Ads + CRM + client sheet  
2. Clean nulls / duplicates  
3. Flag anomalies against simple, editable rules  
4. Generate narrative brief + suggested actions  
5. Export Excel/PDF and prepare channel delivery  

## Stack

Python · Pandas · Streamlit · Plotly · openpyxl · fpdf2

## Local demo

If you have the companion demo repo locally:

```bash
cd demo-automated-reporting
source .venv/bin/activate
streamlit run app.py
```
