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
    'Data Engineer and Backend Developer building reliable production data pipelines, workflow orchestration, and operational systems. Experienced in Python, Prefect, Linux, Docker, object storage, and HPC environments, with domain expertise in geospatial and metocean data.',
  focus: [
    'Production Data engineering: ingestion, transformation, QC, orchestration, and delivery of operational datasets',
    'Backend & Workflow Automation: Python, Prefect, Linux, Docker, S3-compatible storage, Zarr, and HPC workflows',
    'Geospatial and metocean systems: numerical model data, forecast production, model verification, and large-scale scientific datasets',
  ],
  skills: {
    'Data Engineering': [ 'Python', 'ETL / ELT pipelines', 'Prefect', 'Xarray', 'Zarr', 'NetCDF', 'Data quality & validation', 'Time-series processing', ],
    'Platform & Backend': [ 'Linux', 'Docker', 'AWS', 'Object storage', 'Workflow orchestration', 'SLURM HPC', 'API & data dissemination', 'Production automation', ],
    'Geospatial & MetOcean': [ 'WAVEWATCH III', 'SWAN', 'Numerical weather prediction', 'Hindcast analysis', 'Model verification', 'Marine forecasting', 'Geospatial data processing', ],
  },
  experience: [
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Metocean Data Engineer',
      period: 'Sep 2023 – Present',
      location: 'Jakarta, Indonesia · Hybrid',
      highlights: [ 
        'Engineer and operate production data pipelines supporting BMKG ocean forecasting systems, including atmospheric, wave, and ocean-model workflows used for real-time marine forecasting.', 
        'Build automated ingestion, validation, transformation, post-processing, and dissemination workflows for large numerical and geospatial datasets using Python, Prefect, Linux, and HPC infrastructure.', 
        'Operate and improve production workflows for INACAWO, INAWAVES, and INAFLOWS across numerical weather, wave, and ocean circulation models.', 
        'Develop workflow orchestration and automation across distributed environments using Prefect, Docker, SLURM, object storage', 
        'Optimize scientific computing workloads and model post-processing pipelines, including HPC benchmarking, parallel execution, and production reliability improvements.', 
        'Contribute to Marine Meteorology System (MMS) initiatives as a Big Data & AI Engineer, supporting data architecture, operational services, and marine data dissemination.', 
      ],
    },
    {
      company: 'Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)',
      role: 'Marine Meteorologist',
      period: 'Feb 2023 – Sep 2023',
      location: 'Jakarta, Indonesia · On-site',
      highlights: [ 
        'Produced operational marine forecasts covering wind, waves, tides, currents, and severe weather conditions for Indonesian waters.', 
        'Analyzed observational, satellite, and numerical weather prediction data to evaluate forecast conditions and support operational decision-making.', 
        'Performed model verification and interpreted meteorological and oceanographic datasets for marine forecast guidance.', 
      ],
    },
    {
      company: 'Voluntary work',
      role: 'Career break',
      period: 'Sep 2022 – Dec 2022',
      location: 'Purworejo Regency, Central Java, Indonesia',
      highlights: [
        'Voluntary work during a short career break after graduation.'
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
