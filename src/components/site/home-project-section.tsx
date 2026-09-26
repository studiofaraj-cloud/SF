import { getProjectsAction } from '@/lib/actions';
import { selectHomeProjects } from '@/lib/showcase';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/definitions';
import { HomeProjectContent } from './home-project-content';

export async function HomeProjectSection({ locale }: { locale: Locale }) {
  try {
    const { recent, total } = selectHomeProjects(await getProjectsAction());
    // Strip the full TipTap `content` field — the homepage only needs the
    // summary fields. Including the full content body embeds ~20 KB of JSON
    // per project in the RSC flight data.
    const projects = recent.map(
      ({ content: _content, gallery: _gallery, ...rest }: Project) => rest,
    );
    return <HomeProjectContent projects={projects} total={total} locale={locale} />;
  } catch (error) {
    // Firestore unavailable with nothing cached: leave the section out.
    console.warn('Failed to fetch projects for the homepage:', error);
    return null;
  }
}
