/** Posts with optional draft frontmatter. */
export type Draftable = { data: { draft?: boolean } };

/**
 * Filter entries for index pages and listings.
 * Drafts are shown in dev (local preview) and hidden in production builds.
 */
export function forListing<T extends Draftable>(entries: T[]): T[] {
  if (import.meta.env.DEV) return entries;
  return entries.filter((entry) => !entry.data.draft);
}

/**
 * Filter entries for static path generation.
 * Draft routes exist in dev only; production builds return 404 for draft slugs.
 */
export function forStaticPaths<T extends Draftable>(entries: T[]): T[] {
  if (import.meta.env.DEV) return entries;
  return entries.filter((entry) => !entry.data.draft);
}
