// Types for the Projects Vault feature
// Projects are defined as MDX files with interactive components

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Project metadata - stored in database, references MDX file
export interface ProjectMetadata {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  estimatedMinutes: number;
  tags: string[];
  category: string;
  prerequisites: string[]; // Array of project slugs (recommendation only)
  contentPath: string; // Path to MDX file

  // Module linking (optional)
  moduleId: string | null;

  // Required block IDs for completion
  requiredBlockIds: string[];

  // Career sections
  cvBullets: string[];
  linkedinSummary: string | null;
  interviewPoints: string[];

  // Publishing
  isPublished: boolean;
  orderIndex: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Database row type (snake_case from Supabase)
export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  estimated_minutes: number;
  tags: string[];
  category: string;
  prerequisites: string[];
  content_path: string;
  module_id: string | null;
  required_block_ids: string[];
  cv_bullets: string[];
  linkedin_summary: string | null;
  interview_points: string[];
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Convert database row to metadata
export function rowToMetadata(row: ProjectRow): ProjectMetadata {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    tags: row.tags || [],
    category: row.category,
    prerequisites: row.prerequisites || [],
    contentPath: row.content_path,
    moduleId: row.module_id,
    requiredBlockIds: row.required_block_ids || [],
    cvBullets: row.cv_bullets || [],
    linkedinSummary: row.linkedin_summary,
    interviewPoints: row.interview_points || [],
    isPublished: row.is_published,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Test case structure for code exercises
export interface TestCase {
  input: any; // Can be string, array, object, or Python code
  expected: any;
  hidden: boolean;
  description?: string;
  tolerance?: number; // For floating-point comparisons
  outputExpression?: string; // Python expression to extract value from result (e.g., "len(result[0])")
}

// Props for MDX interactive components
export interface QuizProps {
  id: string;
  question: string;
  options: string[];
  correct: number; // Index of correct option
  explanation: string;
}

export interface CodeExerciseProps {
  id: string;
  starterCode: string;
  solution: string;
  tests: TestCase[];
  hint?: string;
  language?: 'python' | 'typescript' | 'javascript';
}

export interface ConceptCheckProps {
  id: string;
  question: string;
  answer: string;
}

// User progress tracking
export interface ProjectProgress {
  userId: string;
  projectSlug: string;
  projectId: string | null;
  completedBlockIds: string[];
  blockAttempts: Record<string, string>; // blockId -> user code/answer
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
}

// Project progress database row
export interface ProjectProgressRow {
  id: string;
  user_id: string;
  project_slug: string;
  project_id: string | null;
  completed_block_ids: string[];
  block_attempts: Record<string, string>;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Categories for organizing projects
export const PROJECT_CATEGORIES = {
  'trading-strategies': {
    name: 'Trading Strategies',
    description: 'Algorithmic trading and quantitative strategies',
  },
  'python-fundamentals': {
    name: 'Python Fundamentals',
    description: 'Core Python skills for quant finance',
  },
  'data-analysis': {
    name: 'Data Analysis',
    description: 'Working with financial data using pandas and numpy',
  },
  'machine-learning': {
    name: 'Machine Learning',
    description: 'ML techniques for finance and trading',
  },
  'risk-management': {
    name: 'Risk Management',
    description: 'Portfolio risk and VaR calculations',
  },
  'derivatives': {
    name: 'Derivatives',
    description: 'Options pricing and fixed income',
  },
} as const;

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

// Legacy types for backward compatibility with existing _data files
// These will be removed after full migration to MDX

export type BlockType =
  | 'markdown'
  | 'code'
  | 'exerciseCode'
  | 'quiz'
  | 'conceptCheck'
  | 'output'
  | 'visualization'
  | 'resources';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface MarkdownBlock extends BaseBlock {
  type: 'markdown';
  content: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: 'python' | 'typescript' | 'javascript';
  code: string;
  readOnly?: boolean;
}

export interface ExerciseCodeBlock extends BaseBlock {
  type: 'exerciseCode';
  language: 'python' | 'typescript' | 'javascript';
  starterCode: string;
  solutionCode: string;
  hint?: string;
  testCases: TestCase[];
}

export interface QuizBlock extends BaseBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ConceptCheckBlock extends BaseBlock {
  type: 'conceptCheck';
  question: string;
  answer: string;
}

export interface OutputBlock extends BaseBlock {
  type: 'output';
  content: string;
  language?: 'python' | 'json' | 'text';
}

export interface VisualizationBlock extends BaseBlock {
  type: 'visualization';
  title: string;
  description?: string;
  chartType?: 'line' | 'bar' | 'scatter';
  data?: any;
}

export interface ResourcesBlock extends BaseBlock {
  type: 'resources';
  title: string;
  links: Array<{
    label: string;
    url: string;
    type: 'paper' | 'docs' | 'article' | 'video';
  }>;
}

export type ProjectBlock =
  | MarkdownBlock
  | CodeBlock
  | ExerciseCodeBlock
  | QuizBlock
  | ConceptCheckBlock
  | OutputBlock
  | VisualizationBlock
  | ResourcesBlock;

// Legacy project definition (used by old _data files)
export interface ProjectDefinition {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTimeMinutes: number;
  tags: string[];
  lastUpdated?: string;
  notebookBlocks: ProjectBlock[];
  cvBullets?: string[];
  linkedinSummary?: string;
  interviewTalkingPoints?: string[];
}
