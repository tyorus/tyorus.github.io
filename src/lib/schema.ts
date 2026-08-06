import { site } from '../data/site';

const personId = `${site.url}/#person`;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    url: site.url,
    image: absoluteUrl(site.avatar),
    email: site.email,
    jobTitle: [...site.roles],
    homeLocation: {
      '@type': 'Place',
      name: site.location,
    },
    sameAs: [site.links.github, site.links.linkedin],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.title,
    url: site.url,
    description: site.description,
    publisher: { '@id': personId },
    author: { '@id': personId },
  };
}

export function homeGraphSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [websiteSchema(), personSchema()],
  };
}

export function profilePageSchema(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: pageUrl,
    name: `${site.name} — Resume`,
    description: `Resume of ${site.name} — ${site.role}. Experience, skills, and education.`,
    mainEntity: personSchema(),
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
    publisher: {
      '@type': 'Person',
      name: site.name,
      url: site.url,
    },
    ...(opts.keywords && opts.keywords.length > 0
      ? { keywords: opts.keywords.join(', ') }
      : {}),
  };
}

export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}
