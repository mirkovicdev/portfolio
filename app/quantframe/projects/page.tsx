import { createClient } from '@/lib/supabase/server';
import { getAllProjects } from '@/lib/projects/loader';
import { getAllUserProgress } from '@/lib/projects/supabaseProgress';
import { ProjectsGrid } from './_components/ProjectsGrid';
import { PageHeader } from '../components/page-header';

// Make page dynamic for auth
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projects Vault | QuantFrame',
  description:
    'Build real quantitative finance projects from scratch. Learn through hands-on coding, quizzes, and practical exercises.',
};

export default async function ProjectsPage() {
  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load all projects from database
  const projects = await getAllProjects();

  // Load all user progress if logged in
  const userProgress = user ? await getAllUserProgress(user.id) : {};

  // Add progress data to projects
  const projectsWithProgress = projects.map((project) => ({
    ...project,
    totalBlocks: project.requiredBlockIds.length,
    completedBlocks: userProgress[project.slug]?.completedCount || 0,
    isCompleted: userProgress[project.slug]?.completed || false,
  }));

  return (
    <>
      <PageHeader
        title="Projects Vault"
        description="Build real quantitative finance projects from scratch. Learn through hands-on coding, quizzes, and practical exercises."
      />

      <div className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Projects Grid with client-side filtering */}
          <ProjectsGrid projects={projectsWithProgress} isLoggedIn={!!user} />
        </div>
      </div>
    </>
  );
}
