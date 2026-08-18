// Suwignyo Prasetyo — Resume
// Build: typst compile cv/resume.typ public/files/suwignyo-prasetyo-resume.pdf

#set document(
  title: "Suwignyo Prasetyo — Resume",
  author: "Suwignyo Prasetyo",
  keywords: ("data engineer", "metocean", "BMKG", "Python", "Prefect"),
)

#set page(
  paper: "a4",
  margin: (x: 1.2cm, y: 0.95cm),
)

#set text(
  font: "Libertinus Serif",
  size: 9pt,
  fill: rgb("#1a1a1a"),
  lang: "en",
)

#set par(leading: 0.36em, justify: false)
#show link: set text(fill: rgb("#1a3a5c"))

#let muted = rgb("#4a4a4a")
#let rule = rgb("#c8c8c8")
#let accent = rgb("#1a3a5c")

#let section(title) = {
  v(0.36em)
  text(size: 9.5pt, weight: "bold", fill: accent, tracking: 0.06em, upper(title))
  v(-0.2em)
  line(length: 100%, stroke: 0.55pt + rule)
  v(0.18em)
}

#let dated(left, when) = {
  grid(
    columns: (1fr, auto),
    column-gutter: 0.5em,
    left,
    align(right, text(fill: muted, size: 8.6pt, when)),
  )
}

#let bullet(body) = {
  grid(
    columns: (0.7em, 1fr),
    text(fill: muted, size: 8.2pt)[•],
    body,
  )
  v(0.04em)
}

#align(center)[
  #text(size: 17.5pt, weight: "bold", fill: accent)[Suwignyo Prasetyo]
  #v(0.06em)
  #text(size: 9.2pt, fill: muted)[
    Data Engineer · Python Backend Developer · Workflow Automation
  ]
  #v(0.14em)
  #text(size: 8.15pt, fill: muted)[
    Jakarta, Indonesia
    · #link("mailto:tyo.suwignyo@gmail.com")[tyo.suwignyo\@gmail.com]
    · #link("tel:+6282246389922")[+62 822-4638-9922]
    · #link("https://tyorus.com")[tyorus.com]
    · #link("https://www.linkedin.com/in/tyo-suwignyo/")[linkedin.com/in/tyo-suwignyo]
    · #link("https://github.com/tyorus")[github.com/tyorus]
  ]
]

#section("Summary")
Data Engineer and Python Backend Developer with 3+ years building data-intensive applications, automated workflows, and production systems. Experienced in Python, Prefect, Linux, Docker, object storage, and HPC, with geospatial/metocean domain expertise — currently operating BMKG Ocean Forecasting System (BMKG-OFS) production workflows at the Centre for Marine Meteorology.

#section("Experience")

#dated(
  [*Indonesian Agency for Meteorology, Climatology, and Geophysics (BMKG)*],
  [Jan 2023 – Present],
)
#text(fill: muted, size: 8.4pt)[Centre for Marine Meteorology · Jakarta, Indonesia · Hybrid]

#v(0.16em)
#dated([*Metocean Data Engineer*], [Sep 2023 – Present])
#bullet[Develop and maintain production pipelines and automated workflows with Python, Bash, Prefect, and SLURM (ingestion, processing, validation, monitoring, dissemination).]
#bullet[Support operational forecasting systems with L2/L3 troubleshooting; process large-scale time-series/multidimensional data and QC missing, delayed, or invalid inputs.]
#bullet[Build Python/Streamlit apps; develop cloud-optimized datasets with Xarray, Zarr, and S3-compatible storage.]
#bullet[Benchmark compute-intensive workflows (INACAWO, INAWAVES, INAFLOWS); contribute to AI and Big Data modernization (MMS).]

#v(0.1em)
#dated([*Marine Meteorologist*], [Jan 2023 – Sep 2023])
#bullet[Forecasted wind, waves, tides, and severe weather; verified observational/NWP data; briefed maritime, fisheries, and offshore users.]
#bullet[Field work: ADCP surveys in Jakarta Bay, Jalacitra Expedition 2023, and Fishermen Weather Field School.]

#v(0.14em)
#dated(
  [*Data Analyst* — Fastwork Technologies Indonesia · Freelance],
  [Sep 2025 – Nov 2025],
)
#bullet[ECG time-series analysis with the Hilbert–Huang Transform; delivered the workflow to client requirements.]

#section("Selected Projects")
#bullet[*BMKG-OFS Analysis Platform* (2025) — Streamlit analysis/monitoring (#link("https://klimatologi.pusmar.id")[klimatologi.pusmar.id]).]
#bullet[*BMKG-OFS DRC Backup* (2024) — Standalone wave-forecast backup with HPC performance benchmarking.]
#bullet[*Zarr archive for BMKG-OFS* (2024) — Large-scale multidimensional model archive for scalable geospatial access.]
#bullet[*INACAWO post-processing* (2024) — Parallel post-processing for the 3-way coupled model (Baron Weather).]
#bullet[*BMKG-OFS bias correction* (2024) — MOS correction of significant wave height vs satellite altimetry.]
#bullet[*Coastal flood ConvLSTM* (2024) — Semarang coastal-flood model; AI Datathon finalist (BMKG × KORIKA).]

#section("Skills")
*Data engineering:* Python, ETL/ELT, Prefect, Xarray, Zarr, NetCDF, data QC, time-series \
*Platform & backend:* Linux, Bash, Docker, AWS / object storage, SLURM, APIs, Grafana \
*Geospatial & metocean:* WAVEWATCH III, SWAN, NWP, hindcast, model verification, marine forecasting \
*Languages:* Indonesian & Javanese (native); English (IELTS 6.5, CEFR B2)

#section("Education")
#dated(
  [*State College of Meteorology Climatology and Geophysics (STMKG)*],
  [Sep 2018 – Sep 2022],
)
*BASc, Meteorology* · GPA 3.70 / 4.00 · honours (3rd in Department) · fully funded BMKG scholarship \
Thesis: moistening of cold-surge air masses over the western Maritime Continent using ERA5 (2010–2019).

#section("Honors, Research & Training")
#bullet[*Trainer* — Satellite Altimetry for Operational Metocean Services (BMKG × OTGA), 2024 · *AI Datathon Finalist* (BMKG × KORIKA), 2024]
#bullet[*Karya Cipta Madya* (STMKG, 2022) · *BMKG Scholarship* (2018–2022) · WW3 optimization with Eviden (2024) · Ship Safety Score Model (peer-reviewed, 2024)]
#bullet[Haryanto et al. (2023), _JPFA_ 13(1) · Prasetyo et al. (2022), _Jurnal Aplikasi Meteorologi_ 1(1)]
#bullet[HPC Scientific Computing — NPTEL (2025) · Model Validation & HPC — CLS France (2024) · Intro to HPC — BMKG · AWS Cloud & Gen AI · INACAWO Hindcast]
