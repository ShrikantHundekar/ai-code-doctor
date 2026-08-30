import type {
  ReviewResult,
  ComparisonResult,
  DebugResult,
  ExplanationResult,
  RefactorResult,
  SecurityResult,
  ReviewHistoryItem,
  ProviderStats
} from '../types';

export type {
  ReviewResult,
  ComparisonResult,
  DebugResult,
  ExplanationResult,
  RefactorResult,
  SecurityResult,
  ReviewHistoryItem,
  ProviderStats
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5000';

export interface Provider {
  id: string;
  name: string;
  available: boolean;
}

export interface ProvidersResponse {
  providers: Provider[];
  default: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/api/health`);
  return await response.json();
}

export async function getProviders(): Promise<ProvidersResponse> {
  const response = await fetch(`${API_URL}/api/providers`);
  return await response.json();
}

export async function reviewCode(
  language: string,
  code: string,
  provider?: string,
  title?: string,
  parentReviewId?: number | null,
  version?: number
): Promise<ReviewResult> {
  const requestBody: any = { language, code };
  if (provider) requestBody.provider = provider;
  if (title) requestBody.title = title;
  if (parentReviewId) requestBody.parentReviewId = parentReviewId;
  if (version) requestBody.version = version;

  const response = await fetch(`${API_URL}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function compareCode(
  language: string,
  code: string,
  providers: string[],
  title?: string,
  parentReviewId?: number | null
): Promise<ComparisonResult> {
  const requestBody: any = { language, code, providers };
  if (title) requestBody.title = title;
  if (parentReviewId) requestBody.parentReviewId = parentReviewId;

  const response = await fetch(`${API_URL}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function debugCode(
  language: string,
  code: string,
  error: string,
  stackTrace?: string,
  provider?: string
): Promise<DebugResult> {
  const requestBody: any = { language, code, error };
  if (stackTrace) requestBody.stackTrace = stackTrace;
  if (provider) requestBody.provider = provider;

  const response = await fetch(`${API_URL}/api/debug`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function explainCode(
  language: string,
  code: string,
  level: string = 'intermediate',
  provider?: string
): Promise<ExplanationResult> {
  const requestBody: any = { language, code, level };
  if (provider) requestBody.provider = provider;

  const response = await fetch(`${API_URL}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function refactorCode(
  language: string,
  code: string,
  goals: string[] = ['readability', 'performance', 'maintainability'],
  provider?: string
): Promise<RefactorResult> {
  const requestBody: any = { language, code, goals };
  if (provider) requestBody.provider = provider;

  const response = await fetch(`${API_URL}/api/refactor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function securityScan(
  language: string,
  code: string,
  provider?: string
): Promise<SecurityResult> {
  const requestBody: any = { language, code };
  if (provider) requestBody.provider = provider;

  const response = await fetch(`${API_URL}/api/security-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function fixCode(
  language: string,
  code: string,
  provider?: string
): Promise<any> {
  const requestBody: any = { language, code };
  if (provider) requestBody.provider = provider;

  const response = await fetch(`${API_URL}/api/fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function getReviews(
  search?: string,
  language?: string,
  provider?: string,
  analysisType?: string,
  page: number = 1
): Promise<{ reviews: ReviewHistoryItem[]; total: number; pages: number }> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (language && language !== 'all') params.append('language', language);
  if (provider && provider !== 'all') params.append('provider', provider);
  if (analysisType && analysisType !== 'all') params.append('analysis_type', analysisType);
  params.append('page', page.toString());

  const response = await fetch(`${API_URL}/api/reviews?${params.toString()}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to load reviews');
  return await response.json();
}

export async function getReview(id: string | number): Promise<any> {
  const response = await fetch(`${API_URL}/api/reviews/${id}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return await response.json();
}

export async function getReviewVersions(id: string | number): Promise<{ versions: ReviewResult[] }> {
  const response = await fetch(`${API_URL}/api/reviews/${id}/versions`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to load review versions');
  return await response.json();
}

export async function compareReviews(id1: number, id2: number): Promise<any> {
  const response = await fetch(`${API_URL}/api/reviews/compare?id1=${id1}&id2=${id2}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to compare reviews');
  }
  return await response.json();
}

export async function getProviderStats(): Promise<{ stats: ProviderStats }> {
  const response = await fetch(`${API_URL}/api/history/provider-stats`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to load provider statistics');
  return await response.json();
}

export async function deleteReview(id: string | number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/reviews/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Delete failed with status ${response.status}`);
  }
  return await response.json();
}

export async function getDashboardStats(): Promise<{
  totalReviews: number;
  totalBugs: number;
  averageScore: number;
  criticalIssues: number;
}> {
  const response = await fetch(`${API_URL}/api/dashboard/stats`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to load dashboard stats');
  return await response.json();
}

// Authentication API
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  totalReviews: number;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Registration failed with status ${response.status}`);
  }

  return await response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Login failed with status ${response.status}`);
  }

  return await response.json();
}

export async function logout(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 401) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Logout failed with status ${response.status}`);
  }

  return await response.json();
}

export async function getCurrentUser(): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return await response.json();
}

export async function updateProfile(name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Update failed with status ${response.status}`);
  }

  return await response.json();
}

export async function getPreferences(): Promise<any> {
  const response = await fetch(`${API_URL}/api/auth/preferences`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to load preferences');
  return await response.json();
}

export async function updatePreferences(prefs: any): Promise<any> {
  const response = await fetch(`${API_URL}/api/auth/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(prefs),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update preferences');
  }
  return await response.json();
}
