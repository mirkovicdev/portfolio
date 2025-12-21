'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import 'katex/dist/katex.min.css';
import { Quiz } from './Quiz';
import { CodeExercise } from './CodeExercise';
import { ConceptCheck } from './ConceptCheck';
import { CodeBlock } from './CodeBlock';
import { DownloadNotebook } from './DownloadNotebook';
import { TextResponse } from './TextResponse';
import { NumericInput } from './NumericInput';
import { Checkpoint, GatedSection } from './Checkpoint';
import { ProfitVisualization } from './ProfitVisualization';
import { KellyVisualization } from './KellyVisualization';
import { SurfaceVisualization } from './SurfaceVisualization';
import { GradientVisualization } from './GradientVisualization';
import { HessianVisualization } from './HessianVisualization';

// Custom MDX components including project-specific interactive ones
const components = {
  // Project interactive components
  Quiz,
  CodeExercise,
  ConceptCheck,
  CodeBlock,
  DownloadNotebook,
  TextResponse,
  NumericInput,
  Checkpoint,
  GatedSection,
  ProfitVisualization,
  KellyVisualization,
  SurfaceVisualization,
  GradientVisualization,
  HessianVisualization,

  // Standard MDX components styled for dark theme
  h1: (props: any) => (
    <h1
      className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600"
      {...props}
    />
  ),
  h2: (props: any) => <h2 className="text-3xl font-bold mt-12 mb-4 text-white" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-semibold mt-8 mb-3 text-zinc-200" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-semibold mt-6 mb-2 text-zinc-300" {...props} />,
  p: (props: any) => <p className="text-zinc-300 leading-relaxed mb-4" {...props} />,
  ul: (props: any) => (
    <ul className="list-disc list-inside space-y-2 text-zinc-300 mb-4 ml-4" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside space-y-2 text-zinc-300 mb-4 ml-4" {...props} />
  ),
  li: (props: any) => <li className="text-zinc-300" {...props} />,
  code: (props: any) => {
    // Check if this is inline code (not in a pre block)
    const isInline = !props.className;
    if (isInline) {
      return (
        <code
          className="px-2 py-0.5 bg-zinc-800 rounded text-phthalo-300 font-mono text-sm"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props: any) => (
    <pre className="bg-zinc-800/80 rounded-lg p-4 overflow-x-auto mb-6 border border-zinc-700" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-phthalo-500 pl-4 italic text-zinc-400 my-6" {...props} />
  ),
  strong: (props: any) => <strong className="font-bold text-white" {...props} />,
  em: (props: any) => <em className="text-phthalo-300" {...props} />,
  hr: () => <hr className="border-zinc-800 my-8" />,
  a: (props: any) => (
    <a
      className="text-phthalo-400 hover:text-phthalo-300 underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-zinc-700" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-zinc-700 bg-zinc-800 px-4 py-2 text-left text-white" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-zinc-700 px-4 py-2 text-zinc-300" {...props} />
  ),
};

interface ProjectContentProps {
  source: MDXRemoteSerializeResult;
}

export function ProjectContent({ source }: ProjectContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
