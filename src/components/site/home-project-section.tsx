import { getProjectsAction } from '@/lib/actions';
import { HomeProjectContent } from './home-project-content';

export async function HomeProjectSection() {
  try {
    const projects = await getProjectsAction();
    // Strip the full TipTap `content` field — the homepage only needs
    // title, slug, description, featuredImage. Including the full
    // content body embeds ~20 KB of JSON per project in the RSC flight data.
    const latestProjects = (projects || [])
      .filter(p => p.published)
      .slice(0, 3)
      .map(({ content: _content, gallery: _gallery, ...rest }) => rest);

    return <HomeProjectContent projects={latestProjects as any} />;
  } catch (error) {
    // Gracefully handle Firestore connection errors
    // Return empty array if Firestore is unavailable (offline mode)
    console.warn('Failed to fetch projects, using empty array:', error);
    return <HomeProjectContent projects={[]} />;
  }
}
