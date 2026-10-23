// Live Web Search — Real-time internet data for AI responses
import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string;
}

export interface WebSearchResponse {
  results: SearchResult[];
  summary: string;
  query: string;
}

const SEARCH_ENGINES = [
  {
    name: 'duckduckgo',
    fetch: async (query: string): Promise<SearchResult[]> => {
      try {
        const html = await axios.get(
          `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
          }
        );
        // Parse DDG HTML results (simple regex fallback)
        const results: SearchResult[] = [];
        const resultRegex = /<a rel="nofollow" class="result__a" href="([^"]+)">([^<]+)<\/a>/g;
        const snippetRegex = /<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
        let match;
        let i = 0;
        while ((match = resultRegex.exec(html.data)) && i < 5) {
          const url = match[1];
          const title = match[2];
          results.push({ title, url, snippet: '', source: 'duckduckgo' });
          i++;
        }
        return results;
      } catch {
        return [];
      }
    }
  }
];

export async function webSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  // Try DuckDuckGo HTML scraping (no API key needed)
  for (const engine of SEARCH_ENGINES) {
    try {
      const results = await engine.fetch(query);
      if (results.length > 0) return results.slice(0, limit);
    } catch {
      continue;
    }
  }
  return [];
}

export async function searchAndSummarize(
  query: string,
  generateText: (opts: { systemPrompt?: string; userPrompt: string; temperature?: number; maxTokens?: number }) => Promise<string>
): Promise<WebSearchResponse> {
  const results = await webSearch(query, 5);
  const context = results.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}\n`).join('\n');

  const summary = await generateText({
    systemPrompt: `You are a research assistant. Based on the search results below, provide a concise, accurate summary answering the user's query. Cite sources using [1], [2], etc. Be objective and note uncertainty when sources conflict.`,
    userPrompt: `Query: ${query}\n\nSearch Results:\n${context}`,
    temperature: 0.3,
    maxTokens: 800
  });

  return {
    results,
    summary,
    query
  };
}

// Live feedback system — collect user ratings and feedback
export interface FeedbackEntry {
  id: string;
  userId: string;
  messageId: string;
  rating: number; // 1-5
  feedback?: string;
  helpful: boolean;
  createdAt: string;
}

export async function recordFeedback(
  db: any,
  userId: string,
  messageId: string,
  rating: number,
  feedback?: string,
  helpful?: boolean
): Promise<void> {
  db.prepare(
    `INSERT INTO feedback (id, user_id, message_id, rating, feedback, helpful, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    crypto.randomUUID(),
    userId,
    messageId,
    rating,
    feedback || null,
    helpful ? 1 : 0
  );
}

export async function getFeedbackStats(db: any, userId?: string): Promise<any> {
  if (userId) {
    return db.prepare(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count, SUM(helpful) as helpful_count
       FROM feedback WHERE user_id = ?`
    ).get(userId);
  }
  return db.prepare(
    `SELECT AVG(rating) as avg_rating, COUNT(*) as count, SUM(helpful) as helpful_count
     FROM feedback`
  ).get();
}

// Initialize feedback table
export async function initFeedbackTable() {
  const { getDatabase } = await import('../lib/database.js');
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      feedback TEXT,
      helpful INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
  `);
}
