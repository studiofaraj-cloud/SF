import { getProjectsAction } from '@/lib/actions';
import { HomeProjectContent } from './home-project-content';

export async function HomeProjectSection() {
  try {
    const projects = await getProjectsAction();
    const latestProjects = (projects || []).filter(p => p.published).slice(0, 3);
    
    return <HomeProjectContent projects={latestProjects} />;
  } catch (error) {
    // Gracefully handle Firestore connection errors
    // Return empty array if Firestore is unavailable (offline mode)
    console.warn('Failed to fetch projects, using empty array:', error);
    return <HomeProjectContent projects={[]} />;
  }
}
