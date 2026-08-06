export const services = {
  headline: 'Selective freelance automation for agencies & ops teams',
  lede:
    'Personal freelance work rooted in production data-engineering experience (including metocean/ops systems): turn weekly Ads exports, CRM CSVs, and ops sheets into one brief — data readiness, anomaly flags, a written narrative of what changed, and delivery to email/Slack — without another dashboard login.',
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
    'Project write-up: Operational Intelligence Brief — Ads + CRM + ops sheet → anomalies + narrative + email/Slack delivery',
    'Background as a Metocean Data Engineer: production pipelines, QC, orchestration, APIs, Docker/Linux, HPC',
    'Same engine remaps to ecommerce or ops/consulting workflows when needed',
  ],
  emailChecklist: [
    'Sources you pull today (Ads, CRM, sheets, etc.)',
    'How often the pack goes out (weekly / monthly)',
    'Who reads it and what decision it should drive',
    'Where it should land (email, Slack, both)',
  ],
  cta: 'Email a short description of your weekly pack. I will reply with approach, timeline, and whether an audit or build fits.',
} as const;
