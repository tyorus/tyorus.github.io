export const services = {
  headline: 'Operational Intelligence Briefs for Marketing Agencies & Ops Teams',
  lede:
    'Turn weekly Ads exports, CRM CSVs, and ops sheets into one brief: data readiness, anomaly flags, a written narrative of what changed, and delivery to email/Slack — without another dashboard login. Built with production data-engineering discipline (including metocean/ops systems experience).',
  problems: [
    'Weekly client packs still assembled by hand from Ads + CRM + spreadsheets',
    'Anomalies (CPA spikes, zero conversions, low NPS) spotted after the update was sent',
    'Dashboards exist, but account managers still need a clear written “what changed / what to do”',
    'Teams work in email and Slack — they will not adopt yet another BI login',
    'Need reliable automation from someone who has run production data workflows',
  ],
  packages: [
    {
      name: 'Intelligence Workflow Audit',
      fee: 'USD 75–250',
      summary:
        'Map sources, anomaly rules, narrative needs, and delivery channel. Get hours-saved estimate and an implementation plan.',
      ideal: 'Best first step when the weekly pack pain is clear but scope is not.',
    },
    {
      name: 'Operational Brief System',
      fee: 'USD 500–1,500',
      summary:
        'Ingest multi-source files, validation/cleaning, anomaly detection, narrative brief, Excel/PDF audit trail, email/Slack delivery.',
      ideal: 'Replace a recurring manual agency/ops pack with a repeatable workflow.',
    },
    {
      name: 'Monthly Intelligence Retainer',
      fee: 'USD 250–1,000 / month',
      summary:
        'Recurring brief generation, anomaly watch, small rule updates, and delivery support.',
      ideal: 'When the workflow must run every week without reinventing it.',
    },
  ],
  proof: [
    'Demo: Agency Operational Intelligence Brief — Ads + CRM + ops sheet → anomalies + narrative + email/Slack delivery',
    'Background as a Metocean Data Engineer: production pipelines, QC, orchestration, APIs, Docker/Linux, HPC',
    'Same engine remaps to ecommerce or environmental consulting workflows when needed',
  ],
  cta: 'Email a short description of your weekly pack (sources + who reads it). I will reply with approach, timeline, and whether an audit or build fits.',
} as const;
