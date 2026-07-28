const API_BASE = '';

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('primordex_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' })) as any;
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  const body = await response.json() as any;
  return body.data !== undefined ? body.data : body;
}

export async function apiGet(url: string): Promise<any> {
  return request(url, { method: 'GET' });
}

export async function apiPost(url: string, body: any): Promise<any> {
  return request(url, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPatch(url: string, body: any): Promise<any> {
  return request(url, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function apiDelete(url: string): Promise<any> {
  return request(url, { method: 'DELETE' });
}

// Auth
export async function apiLogin(email: string, password: string) {
  return apiPost('/api/auth/login', { email, password });
}

export async function apiRegister(email: string, password: string) {
  return apiPost('/api/auth/register', { email, password });
}

export async function apiVerify(token: string) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) return null;
  const body = await response.json() as any;
  const data = body.data || body;
  return data.user || data;
}

// Chat
export async function apiChat(message: string, chamber: string, personalityMode: string, context: any = {}) {
  return apiPost('/api/chat', { message, chamber, personalityMode, context });
}

// Consciousness
export async function apiGetPrimeInsights(userId: string) {
  return apiGet(`/api/consciousness/prime/${userId}`);
}

export async function apiGetLearningState(userId: string) {
  return apiGet(`/api/learning-state/${userId}`);
}

export async function apiGetUltimateForm(userId: string) {
  return apiGet(`/api/ultimate-form/${userId}`);
}

// Projects
export async function apiGetProjects() {
  return apiGet('/api/projects');
}

export async function apiAnalyzeRepo(repoUrl: string, visibility: string = 'private') {
  return apiPost('/api/analyze/repo', { repoUrl, visibility });
}

// Hiring
export async function apiGenerateHireSpec(projectId: string, budget: number, timeline: string, skills: string[]) {
  return apiPost('/api/hire/generate-spec', { projectId, budget, timeline, skills });
}

export async function apiPostHire(specId: string, jobDescription: string) {
  return apiPost('/api/hire/post', { specId, jobDescription });
}

export async function apiGetHireSpecs() {
  return apiGet('/api/hire/specs');
}

// Link Preview
export async function apiLinkPreview(url: string) {
  return apiPost('/api/link-preview', { url });
}

// Personality Modes
export async function apiGetPersonalityModes() {
  return apiGet('/api/personality-modes');
}

// Usage
export async function apiGetUsage() {
  return apiGet('/api/usage');
}

// Audit
export async function apiGetAuditLog(limit = 100, offset = 0) {
  return apiGet(`/api/audit?limit=${limit}&offset=${offset}`);
}
