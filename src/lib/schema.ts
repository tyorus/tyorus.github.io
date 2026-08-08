import { site } from '../data/site';

const personId = `${site.url}/#person`;
const orgId = `${site.url}/#organization`;
const websiteId = `${site.url}/#website`;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    alternateName: [site.shortName, 'Tyo Suwignyo', site.title],
    url: site.url,
    image: absoluteUrl(site.avatar),
    email: site.email,
    jobTitle: [...site.roles, 'Metocean Data Engineer'],
    description: site.description,
    homeLocation: {
      '@type': 'Place',
      name: site.location,
    },
    worksFor: { '@id': orgId },
    sameAs: [site.links.github, site.links.linkedin],
  };
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': orgId,
    name: site.title,
    url: site.url,
    logo: absoluteUrl(site.avatar),
    description: site.description,
    founder: { '@id': personId },
    sameAs: [site.links.github, site.links.linkedin],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.title,
    alternateName: `${site.title} — ${site.name}`,
    url: site.url,
    description: site.description,
    inLanguage: ['en', 'id'],
    publisher: { '@id': orgId },
    author: { '@id': personId },
  };
}

export function homeGraphSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema(), personSchema()],
  };
}

export function profilePageSchema(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl,
    name: `${site.name} — Resume · ${site.title}`,
    description: `Resume of ${site.name} — Metocean Data Engineer, ${site.role}. Experience, skills, and education.`,
    mainEntity: personSchema(),
    isPartOf: { '@id': websiteId },
  };
}

type ArticleSchemaType = 'BlogPosting' | 'TechArticle' | 'Article';

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  keywords?: string[];
  type?: ArticleSchemaType;
  inLanguage?: 'en' | 'id';
}) {
  const type = opts.type ?? 'BlogPosting';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    author: personSchema(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    image: absoluteUrl(site.avatar),
    publisher: organizationSchema(),
    isPartOf: { '@id': websiteId },
    inLanguage: opts.inLanguage ?? 'en',
    ...(opts.keywords && opts.keywords.length > 0
      ? { keywords: opts.keywords.join(', ') }
      : {}),
  };
}

export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}
