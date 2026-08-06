export type Experience = {
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
};

export type Education = {
  school: string;
  degree: string;
  period: string;
  detail?: string;
};

export const resume = {
  summary:
    'I design data pipelines and backend services for operational systems, with a focus on marine weather and ocean forecasting — and apply the same reliability mindset to practical reporting and workflow automation.',
  focus: [
    'Data engineering: pipelines, QC, orchestration, and cloud-native geospatial data (Python, Prefect, Zarr, S3)',
    'Backend & platform: Linux, Docker, automation, SLURM/HPC jobs, and operational production environments',
    'Metocean practice: WAVEWATCH III & SWAN, hindcast analysis, model verification, bias correction, and real-time forecasting systems',
  ],
  skills: {
    'Data Engineering': [
      'Python',
      'ETL / data pipelines',
      'Prefect',
      'Xarray / Zarr',
      'Data QC',
      'Time-series analysis',
    ],
    Backend: [
      'Linux / Bash',
      'Workflow automation',
      'SLURM / HPC',
      'AWS / S3',
      'Operational services',
      'API & data dissemination',
    ],
    MetOcean: [
      'WAVEWATCH III',
      'SWAN',
      'Hindcast analysis',
      'Model verification',
      'NWP',
      'Marine forecasting',
    ],
  },
  experience: [
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Metocean Data Engineer',
      period: 'Sep 2023 – Present',
      location: 'Jakarta, Indonesia · Hybrid',
      highlights: [
        'Maintain and support the operational production environment of BMKG-OFS (BMKG Ocean Forecasting System), including INACAWO, INAWAVES, and INAFLOWS model workflows for real-time forecasting.',
        'Build and operate metocean data pipelines, QC, and automation for operational marine services.',
        'Contribute as Big Data & AI / Metocean Data Engineer on Marine Meteorology System (MMS) initiatives.',
      ],
    },
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Marine Meteorologist',
      period: 'Feb 2023 – Sep 2023',
      location: 'Jakarta, Indonesia · On-site',
      highlights: [
        'Forecasted critical metocean parameters, including wind, waves, tides, and severe weather conditions.',
        'Analyzed observational and numerical weather prediction (NWP) data for model verification and operational guidance.',
      ],
    },
    {
      company: 'Voluntary work',
      role: 'Career break',
      period: 'Sep 2022 – Dec 2022',
      location: 'Purworejo Regency, Central Java, Indonesia',
      highlights: ['Community-focused voluntary work during a short career break after graduation.'],
    },
  ] satisfies Experience[],
  education: [
    {
      school: 'State College of Meteorology Climatology and Geophysics (STMKG)',
      degree: 'Bachelor of Applied Science (BASc), Meteorology',
      period: 'Sep 2018 – Sep 2022',
      detail:
        'GPA 3.70 / 4.00. Bachelor thesis on moistening of cold-surge air masses over the western Maritime Continent using ERA5 (2010–2019).',
    },
  ] satisfies Education[],
};
