'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProject } from '@/lib/projects/context';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy, Lock, Loader2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarkCompleteSectionProps {
  requiredBlockIds: string[];
}

export function MarkCompleteSection({ requiredBlockIds }: MarkCompleteSectionProps) {
  const {
    userId,
    completedBlockIds,
    isProjectMarkedComplete,
    markProjectAsComplete,
    setRequiredBlockIds,
  } = useProject();

  const [isLoading, setIsLoading] = useState(false);

  // Register required block IDs with context on mount
  useEffect(() => {
    setRequiredBlockIds(requiredBlockIds);
  }, [requiredBlockIds, setRequiredBlockIds]);

  // Calculate progress
  const completedCount = requiredBlockIds.filter(id => completedBlockIds.includes(id)).length;
  const totalCount = requiredBlockIds.length;
  const allCompleted = completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleMarkComplete = async () => {
    if (!allCompleted || isProjectMarkedComplete) return;

    setIsLoading(true);
    const success = await markProjectAsComplete();
    setIsLoading(false);

    if (success) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#26804a', '#2d9659', '#34ac68', '#FFD700', '#FFA500'],
      });
    }
  };

  // Back to projects button (reusable)
  const BackToProjectsButton = () => (
    <div className="mt-6 flex justify-center">
      <Button
        asChild
        variant="outline"
        className="bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
      >
        <Link href="/quantframe/projects">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
      </Button>
    </div>
  );

  // Don't show if user is not logged in
  if (!userId) {
    return (
      <>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
          <Lock className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <p className="text-zinc-400">Sign in to track your progress and mark this project complete.</p>
        </div>
        <BackToProjectsButton />
      </>
    );
  }

  // Already completed
  if (isProjectMarkedComplete) {
    return (
      <>
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Project Completed!</h3>
          </div>
          <p className="text-center text-zinc-300">
            Congratulations! You've successfully completed this project.
            The skills you've learned here will serve you well in your quant journey.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">All {totalCount} tasks completed</span>
          </div>
        </div>
        <BackToProjectsButton />
      </>
    );
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">Project Completion</h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Progress</span>
            <span className="text-zinc-300">{completedCount} / {totalCount} tasks</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                allCompleted ? 'bg-green-500' : 'bg-phthalo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        {!allCompleted ? (
          <p className="text-zinc-400 text-center mb-4">
            Complete all {totalCount - completedCount} remaining task{totalCount - completedCount !== 1 ? 's' : ''} to mark this project complete.
          </p>
        ) : (
          <p className="text-green-400 text-center mb-4">
            All tasks completed! You can now mark this project as complete.
          </p>
        )}

        {/* Button */}
        <Button
          onClick={handleMarkComplete}
          disabled={!allCompleted || isLoading}
          className={`w-full ${
            allCompleted
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'bg-zinc-700 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Marking Complete...
            </>
          ) : allCompleted ? (
            <>
              <Trophy className="w-5 h-5 mr-2" />
              Mark Project Complete
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Complete All Tasks First
            </>
          )}
        </Button>
      </div>
      <BackToProjectsButton />
    </>
  );
}
