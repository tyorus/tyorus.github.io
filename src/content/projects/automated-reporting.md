---
title: "Operational Intelligence Brief"
description: "Operational intelligence brief demo: Ads + CRM + ops sheet → data readiness, anomalies, narrative brief, and email/Slack delivery automation."
pubDate: "2026-08-04"
tags: ["python", "automation", "agency", "reporting", "streamlit"]
categories: ["Automation"]
---

Weekly **Operational Intelligence Brief** for marketing / growth agencies.

## Problem

Account teams pull Ads exports, CRM CSVs, and a client ops sheet, then rebuild the same weekly status pack by hand.

## Solution

1. Ingest Ads + CRM + client sheet  
2. Clean nulls / duplicates  
3. Flag anomalies (high CPA, zero conversions, low NPS, task backlog)  
4. Write a narrative brief with suggested actions  
5. Export Excel/PDF and prepare email/Slack delivery  

## Stack

Python · Pandas · Streamlit · Plotly · openpyxl · fpdf2

## Run

```bash
cd demo-automated-reporting
source .venv/bin/activate
streamlit run app.py
```
