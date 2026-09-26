import { getProjectsAction } from '@/lib/actions';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import { HomeProjectContent } from './home-project-content';

export async function HomeProjectSection({ locale }: { locale: Locale }) {
  try {
    // Newest first (as getProjectsAction returns them); only projects that
    // have a screenshot to show.
    const published = ((await getProjectsAction()) as Project[]).filter(
      (p) => p.published && p.featuredImage,
    );
    // Strip the full TipTap `content` field — the homepage only needs the
    // summary fields. Including the full content body embeds ~20 KB of JSON
    // per project in the RSC flight data.
    const projects = published
      .slice(0, 6)
      .map(({ content: _content, gallery: _gallery, ...rest }) => rest);
    return <HomeProjectContent projects={projects} locale={locale} />;
  } catch (error) {
    // Firestore unavailable with nothing cached: leave the section out.
    console.warn('Failed to fetch projects for the homepage:', error);
    return null;
  }
}
