export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'csharp';
export type AnalysisType = 'single' | 'comparison' | 'debug' | 'explain' | 'refactor' | 'security';
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Bug {
  id?: number;
  severity: Severity | string;
  line: number;
  title: string;
  description?: string;
  explanation?: string;
  problematicCode?: string;
  suggestedFix?: string;
  fix?: string;
}

export interface Warning {
  id?: number;
  line: number;
  message: string;
  severity: Severity | string;
}

export interface SecurityIssue {
  id?: number;
  severity: Severity | string;
  category?: string;
  line?: number;
  title: string;
  description: string;
  impact?: string;
  recommendation?: string;
}

export interface ComplexityInfo {
  time: string;
  timeExplanation?: string;
  space: string;
  spaceExplanation?: string;
  explanation?: string;
}

export interface QualityMetrics {
  readability: number;
  maintainability: number;
  performance: number;
  security: number;
}

export interface ImprovementPlanItem {
  priority: number;
  priorityLabel: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  category: string;
}

export interface SingleProviderReview {
  score: number;
  summary?: string;
  bugs: Bug[];
  warnings: Warning[];
  securityIssues: SecurityIssue[];
  suggestions: string[];
  complexity: ComplexityInfo;
  quality: QualityMetrics;
  fixedCode: string;
}

export interface ProviderResultItem {
  provider: string;
  model: string;
  success: boolean;
  review?: SingleProviderReview;
  error?: string;
}

export interface BugCluster {
  title: string;
  line: number;
  confidence: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  detectedBy: string[];
  providerCount: number;
  totalProviders: number;
  message: string;
  severity: string;
  explanations?: Array<{
    provider: string;
    title: string;
    explanation: string;
    severity: string;
  }>;
}

export interface ComparisonData {
  bestProvider: string | null;
  bestScore?: number;
  recommendation: string;
  averageScore: number;
  agreement: number;
  agreementPercentage: number;
  summary: string;
  bugClusters: BugCluster[];
  complexityComparison: {
    timeComplexity: Record<string, string>;
    spaceComplexity: Record<string, string>;
    disagreement: boolean;
    message?: string;
  };
  scoreComparison: Record<string, number>;
  bugCountComparison: Record<string, number>;
  securityComparison: Record<string, number>;
  suggestedFixes: Record<string, string>;
}

export interface ComparisonResult {
  id?: number;
  title?: string;
  mode: 'comparison';
  language: string;
  results: ProviderResultItem[];
  comparison: ComparisonData;
}

export interface DebugResult {
  provider?: string;
  model?: string;
  errorExplanation: string;
  rootCause: string;
  solution: string;
  fixedCode: string;
  changes: string[];
}

export interface LineExplanation {
  line: number;
  code?: string;
  explanation: string;
}

export interface ExplanationResult {
  provider?: string;
  model?: string;
  language?: string;
  level: string;
  summary: string;
  explanation: string;
  lineExplanations?: LineExplanation[];
  steps?: Array<{ line: number; explanation: string }>;
}

export interface RefactorChange {
  type: string;
  description: string;
}

export interface RefactorResult {
  provider?: string;
  model?: string;
  originalCode: string;
  refactoredCode: string;
  changes: RefactorChange[];
  expectedBenefits: string[];
}

export interface SecurityResult {
  provider?: string;
  model?: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical' | string;
  summary: string;
  issues: SecurityIssue[];
}

export interface ReviewResult {
  id: string | number;
  userId?: number;
  language: Language | string;
  provider?: string;
  model?: string;
  score: number;
  summary?: string;
  bugs: Bug[];
  warnings: Warning[];
  securityIssues: SecurityIssue[];
  suggestions: string[];
  complexity: ComplexityInfo;
  qualityMetrics?: QualityMetrics;
  quality?: QualityMetrics;
  originalCode?: string;
  code?: string;
  fixedCode: string;
  codeLines?: number;
  createdAt: string;
  reviewName?: string;
  title?: string;
  analysisType?: AnalysisType;
  providersUsed?: string[];
  comparisonResult?: ComparisonData;
  parentReviewId?: number | null;
  version?: number;
  improvementPlan?: ImprovementPlanItem[];
}

export interface ReviewHistoryItem {
  id: string | number;
  reviewName?: string;
  title?: string;
  language: Language | string;
  score: number;
  bugCount: number;
  warningCount: number;
  bugsCount?: number;
  warningsCount?: number;
  date?: string;
  createdAt?: string;
  provider?: string;
  model?: string;
  status?: 'completed' | 'failed' | 'in_progress' | string;
  analysisType?: AnalysisType;
  providersUsed?: string[];
  parentReviewId?: number | null;
  version?: number;
}

export interface ProviderStatsItem {
  reviews: number;
  totalScore: number;
  averageScore: number;
}

export type ProviderStats = Record<string, ProviderStatsItem>;

export type Theme = 'dark' | 'light';

export interface AppState {
  theme: Theme;
  sidebarOpen: boolean;
  currentReview: ReviewResult | null;
  currentComparison: ComparisonResult | null;
  reviewHistory: ReviewHistoryItem[];
  isAnalyzing: boolean;
  editorFontSize: number;
  editorTabSize: number;
  editorWordWrap: boolean;
  editorAutoIndent: boolean;
  showSecurity: boolean;
  showComplexity: boolean;
  showSuggestions: boolean;
}

export type AppAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_CURRENT_REVIEW'; payload: ReviewResult | null }
  | { type: 'SET_CURRENT_COMPARISON'; payload: ComparisonResult | null }
  | { type: 'SET_REVIEW_HISTORY'; payload: ReviewHistoryItem[] }
  | { type: 'ADD_TO_HISTORY'; payload: ReviewHistoryItem }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'SET_EDITOR_FONT_SIZE'; payload: number }
  | { type: 'SET_EDITOR_TAB_SIZE'; payload: number }
  | { type: 'SET_EDITOR_WORD_WRAP'; payload: boolean }
  | { type: 'SET_EDITOR_AUTO_INDENT'; payload: boolean }
  | { type: 'SET_SHOW_SECURITY'; payload: boolean }
  | { type: 'SET_SHOW_COMPLEXITY'; payload: boolean }
  | { type: 'SET_SHOW_SUGGESTIONS'; payload: boolean }
  | { type: 'LOAD_SETTINGS'; payload: Partial<AppState> };
