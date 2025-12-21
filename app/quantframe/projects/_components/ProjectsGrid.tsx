'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  Tag,
  FolderOpen,
  Trophy,
  Flame,
  Sparkles,
} from 'lucide-react';
import { ProjectMetadata, Difficulty, PROJECT_CATEGORIES } from '@/lib/projects/types';

interface ProjectWithProgress extends ProjectMetadata {
  totalBlocks: number;
  completedBlocks: number;
  isCompleted: boolean;
}

interface ProjectsGridProps {
  projects: ProjectWithProgress[];
  isLoggedIn: boolean;
}

const difficultyColors = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const difficultyButtons: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

type StatusFilter = 'all' | 'in-progress' | 'not-started' | 'completed';

function ProjectCard({ project, variant }: { project: ProjectWithProgress; variant: 'default' | 'completed' | 'in-progress' }) {
  const progressPercent =
    project.totalBlocks > 0
      ? Math.round((project.completedBlocks / project.totalBlocks) * 100)
      : 0;

  const isCompleted = variant === 'completed';
  const isInProgress = variant === 'in-progress';

  return (
    <Link href={`/quantframe/projects/${project.slug}`} className="group block">
      <div
        className={`h-full backdrop-blur-sm rounded-xl p-6 transition-all duration-300 ${
          isCompleted
            ? 'bg-green-500/5 border-2 border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10'
            : isInProgress
            ? 'bg-amber-500/5 border-2 border-amber-500/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10'
            : 'bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50'
        }`}
      >
        {/* Header with badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${difficultyColors[project.difficulty]}`}
          >
            {project.difficulty}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
              <Trophy className="w-4 h-4" />
              COMPLETED
            </span>
          )}
          {isInProgress && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Flame className="w-4 h-4" />
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-bold mb-3 transition-colors ${
            isCompleted
              ? 'text-white group-hover:text-green-300'
              : isInProgress
              ? 'text-white group-hover:text-amber-300'
              : 'text-white group-hover:text-zinc-200'
          }`}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress Bar (only for in-progress) */}
        {isInProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>Progress</span>
              <span>
                {project.completedBlocks} / {project.totalBlocks} blocks
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {project.estimatedMinutes < 60
                ? `${project.estimatedMinutes}min`
                : `${Math.floor(project.estimatedMinutes / 60)}h ${project.estimatedMinutes % 60}m`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>
              {PROJECT_CATEGORIES[project.category as keyof typeof PROJECT_CATEGORIES]?.name ||
                project.category}
            </span>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-phthalo-500/10 border border-phthalo-500/20 rounded text-phthalo-400 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className={`flex items-center gap-2 font-medium text-sm transition-colors ${
            isCompleted
              ? 'text-green-400 group-hover:text-green-300'
              : isInProgress
              ? 'text-amber-400 group-hover:text-amber-300'
              : 'text-zinc-400 group-hover:text-zinc-300'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Project</span>
            </>
          ) : isInProgress ? (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>Continue Project</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Start Project</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProjectsGrid({ projects, isLoggedIn }: ProjectsGridProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  const categories = [...new Set(projects.map((p) => p.category))];

  // Split projects by status
  const completedProjects = projects.filter((p) => p.isCompleted);
  const inProgressProjects = projects.filter((p) => !p.isCompleted && p.completedBlocks > 0);
  const notStartedProjects = projects.filter((p) => !p.isCompleted && p.completedBlocks === 0);

  // Auto-select first non-empty tab if current is empty
  const getDefaultStatus = (): StatusFilter => {
    if (inProgressProjects.length > 0) return 'in-progress';
    if (notStartedProjects.length > 0) return 'not-started';
    if (completedProjects.length > 0) return 'completed';
    return 'not-started';
  };

  // Get current projects based on status filter
  const getCurrentProjects = () => {
    let projectList: ProjectWithProgress[] = [];

    switch (statusFilter) {
      case 'all':
        projectList = projects;
        break;
      case 'in-progress':
        projectList = inProgressProjects;
        break;
      case 'completed':
        projectList = completedProjects;
        break;
      case 'not-started':
      default:
        projectList = notStartedProjects;
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      projectList = projectList.filter((p) => p.difficulty === difficultyFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      projectList = projectList.filter((p) => p.category === categoryFilter);
    }

    return projectList;
  };

  const currentProjects = getCurrentProjects();

  // Determine card variant based on project status (for 'all' view, check each project)
  const getVariant = (project: ProjectWithProgress) => {
    if (statusFilter === 'all') {
      if (project.isCompleted) return 'completed';
      if (project.completedBlocks > 0) return 'in-progress';
      return 'default';
    }
    return statusFilter === 'completed' ? 'completed' : statusFilter === 'in-progress' ? 'in-progress' : 'default';
  };

  // For non-logged-in users, just show all projects
  if (!isLoggedIn) {
    const filteredProjects = projects.filter((p) => {
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      return true;
    });

    return (
      <div>
        {/* Difficulty Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {difficultyButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setDifficultyFilter(btn.value)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                difficultyFilter === btn.value
                  ? 'bg-phthalo-500/20 border-2 border-phthalo-500 text-phthalo-300'
                  : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} variant="default" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
            statusFilter === 'all'
              ? 'bg-white/20 border-2 border-white/40 text-white'
              : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          All
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            statusFilter === 'all' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {projects.length}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter('in-progress')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
            statusFilter === 'in-progress'
              ? 'bg-phthalo-500/20 border-2 border-phthalo-500 text-phthalo-300'
              : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <Flame className="w-4 h-4" />
          In Progress
          {inProgressProjects.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              statusFilter === 'in-progress' ? 'bg-phthalo-500/30' : 'bg-white/10'
            }`}>
              {inProgressProjects.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter('not-started')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
            statusFilter === 'not-started'
              ? 'bg-zinc-600/30 border-2 border-zinc-500 text-zinc-200'
              : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ready to Start
          {notStartedProjects.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              statusFilter === 'not-started' ? 'bg-zinc-500/30' : 'bg-white/10'
            }`}>
              {notStartedProjects.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
            statusFilter === 'completed'
              ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
              : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Completed
          {completedProjects.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              statusFilter === 'completed' ? 'bg-green-500/30' : 'bg-white/10'
            }`}>
              {completedProjects.length}
            </span>
          )}
        </button>
      </div>

      {/* Secondary Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          {difficultyButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setDifficultyFilter(btn.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                difficultyFilter === btn.value
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                All Topics
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {PROJECT_CATEGORIES[cat as keyof typeof PROJECT_CATEGORIES]?.name || cat}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Projects Grid */}
      {currentProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-zinc-400">
            {statusFilter === 'all' && 'No projects found.'}
            {statusFilter === 'in-progress' && 'No projects in progress yet.'}
            {statusFilter === 'completed' && 'No completed projects yet.'}
            {statusFilter === 'not-started' && 'All projects have been started!'}
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            {statusFilter === 'all' && 'Try adjusting your filters.'}
            {statusFilter === 'in-progress' && 'Start a project to see it here.'}
            {statusFilter === 'completed' && 'Complete a project to see it here.'}
            {statusFilter === 'not-started' && 'Great job making progress!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} variant={getVariant(project)} />
          ))}
        </div>
      )}
    </div>
  );
}
