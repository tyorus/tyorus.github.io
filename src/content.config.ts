import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const postSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  // YAML may emit Date objects for unquoted dates — normalize both
  pubDate: z.union([z.string(), z.number(), z.date()]).transform((v) => new Date(v)),
  updatedDate: z
    .union([z.string(), z.number(), z.date()])
    .transform((v) => new Date(v))
    .optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  math: z.boolean().default(false),
  lang: z.enum(['en', 'id']).default('en'),
});

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    deferRender: true,
  }),
  schema: postSchema,
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/projects',
    deferRender: true,
  }),
  schema: postSchema,
});

export const collections = { blog, projects };
