import type { Project } from '@/lib/definitions';

/**
 * Homepage portfolio selection, shared by the hero and the "recent work"
 * section so they agree on which project the hero features (and the section
 * doesn't repeat it right underneath).
 *
 * `projects` is expected newest-first, as getProjectsAction returns them.
 */
export function selectHomeProjects(projects: Project[], count = 3) {
  const published = projects.filter((p) => p.published && p.featuredImage);
  // The hero shows a build log, which reads best with measured results: prefer
  // the newest project that has them, else the newest project.
  const showcase = published.find((p) => p.metrics?.length) ?? published[0] ?? null;
  const recent = published.filter((p) => p !== showcase).slice(0, count);
  return { showcase, recent, total: published.length };
}
