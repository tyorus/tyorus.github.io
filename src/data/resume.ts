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
    'Data Engineer and Python Developer with 3+ years of experience building data-intensive applications, automated workflows, and production systems. Experienced in Python, Prefect, Linux, Docker, object storage, and HPC environments, with domain expertise in geospatial and metocean data.',
  focus: [
    'Production Data engineering: ingestion, transformation, QC, orchestration, and delivery of operational datasets',
    'Backend & Workflow Automation: Python, Prefect, Linux, Docker, S3-compatible storage, Zarr, and HPC workflows',
    'Geospatial and metocean systems: numerical model data, forecast production, model verification, and large-scale scientific datasets',
  ],
  skills: {
    'Data Engineering': [ 'Python', 'ETL / ELT pipelines', 'Prefect', 'Xarray', 'Zarr', 'NetCDF', 'SQL', 'Data quality & validation', 'Time-series processing', ],
    'Platform & Backend': [ 'Linux', 'Bash', 'Docker', 'AWS', 'Object storage', 'FastAPI', 'Streamlit', 'Workflow orchestration', 'SLURM HPC', 'Production automation', ],
    'Geospatial & MetOcean': [ 'WAVEWATCH III', 'SWAN', 'Numerical weather prediction', 'Hindcast analysis', 'Model verification', 'Marine forecasting', 'Geospatial data processing', ],
  },
  experience: [
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Metocean Data Engineer',
      period: 'Sep 2023 – Present',
      location: 'Jakarta, Indonesia · Hybrid',
      highlights: [
        'Develop and maintain production data pipelines and automated workflows using Python, Bash, Prefect, and SLURM for data ingestion, processing, validation, monitoring, and dissemination.',
        'Maintain data-intensive operational applications and forecasting systems, including L2/L3 troubleshooting, incident investigation, and reliability improvements.',
        'Process large-scale time-series and multidimensional datasets; build QC workflows to catch missing, inconsistent, delayed, or invalid data before downstream use.',
        'Build Python applications and Streamlit dashboards for analysis, visualization, climatological processing, and operational monitoring.',
        'Develop cloud-optimized datasets with Xarray, Zarr, and S3-compatible object storage; integrate workflows across Linux servers, HPC, and operational services.',
        'Benchmark, debug, and optimize compute-intensive workflows, including INACAWO, INAWAVES, and INAFLOWS production systems.',
        'Contribute to AI and Big Data system modernization (MMS) through technical evaluation, integration planning, and implementation support.',
      ],
    },
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Marine Meteorologist',
      period: 'Jan 2023 – Sep 2023',
      location: 'Jakarta, Indonesia · On-site',
      highlights: [
        'Forecasted critical metocean parameters, including wind, waves, tides, and severe weather conditions.',
        'Analyzed observational and NWP data for model verification, data quality control, and forecast evaluation.',
        'Delivered forecast products, warnings, and routine weather briefings for maritime safety, marine transportation, fisheries, and offshore operations.',
        'Conducted field campaigns including ADCP surveys in Jakarta Bay and the Jalacitra Expedition cruise 2023, and presented at the Fishermen Weather Field School.',
      ],
    },
    {
      company: 'Fastwork Technologies Indonesia',
      role: 'Data Analyst',
      period: 'Sep 2025 – Nov 2025',
      location: 'Remote · Freelance',
      highlights: [
        'Conducted time-series analysis on electrocardiogram (ECG) data for a healthcare client, applying the Hilbert–Huang Transform to extract and interpret signal characteristics.',
        'Delivered the requested analytical workflow and results in line with the client’s technical requirements.',
      ],
    },
    {
      company: 'Projects.co.id',
      role: 'Student Mentor',
      period: 'Jan 2023 – Jul 2023',
      location: 'Remote · Part-time',
      highlights: [
        'Created step-by-step video explanations for six CPNS Test Intelegensia Umum (TIU) practice-test packages, covering 210 questions in total.',
        'Explained the reasoning and concepts behind each solution to support students’ exam preparation.',
      ],
    },
    {
      company: 'Voluntary work',
      role: 'Career break',
      period: 'Sep 2022 – Dec 2022',
      location: 'Purworejo Regency, Central Java, Indonesia',
      highlights: [
        'Supported family farming activities, primarily field and planting preparation, before starting at BMKG.',
      ],
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
