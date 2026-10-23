// RAG Service — Document ingestion, ChromaDB storage, semantic search with citations
import { ChromaClient } from 'chromadb';
import { getDatabase } from '../lib/database.js';
import { generateEmbedding } from '../ai/provider.js';

const chroma = new ChromaClient({ path: process.env.CHROMA_DB_PATH || './chromadb_data' });

let documentsCollection: any = null;

async function getOrCreateCollection() {
  if (documentsCollection) return documentsCollection;
  documentsCollection = await chroma.getOrCreateCollection({
    name: 'forge_documents',
    metadata: { description: 'User document embeddings for RAG' }
  });
  return documentsCollection;
}

// Chunk text into overlapping segments
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end > text.length) end = text.length;
    // Try to break at sentence or paragraph boundary
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = end - overlap;
    if (start >= text.length) break;
  }
  return chunks;
}

export interface DocumentInput {
  title: string;
  content: string;
  source: string; // filename, url, or user-provided
  userId: string;
  metadata?: Record<string, any>;
}

export interface RAGResult {
  content: string;
  source: string;
  title: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface RAGResponse {
  answer: string;
  sources: RAGResult[];
  context: string;
}

export async function ingestDocument(doc: DocumentInput): Promise<void> {
  const db = getDatabase();
  const collection = await getOrCreateCollection();
  const chunks = chunkText(doc.content);

  const embeddings = await Promise.all(
    chunks.map(chunk => generateEmbedding(chunk))
  );

  const ids = chunks.map((_, i) => `${doc.userId}-${Date.now()}-${i}`);
  const metadatas = chunks.map((chunk, i) => ({
    title: doc.title,
    source: doc.source,
    userId: doc.userId,
    chunkIndex: i,
    ...(doc.metadata || {})
  }));

  await collection.add({
    ids,
    documents: chunks,
    embeddings,
    metadatas
  });

  // Store document record in SQLite
  db.prepare(
    `INSERT INTO document_knowledge (id, user_id, title, source, content, chunk_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    doc.userId + '-' + Date.now(),
    doc.userId,
    doc.title,
    doc.source,
    doc.content,
    chunks.length
  );
}

export async function semanticSearch(
  query: string,
  userId: string,
  limit: number = 5
): Promise<RAGResult[]> {
  const collection = await getOrCreateCollection();
  const queryEmbedding = await generateEmbedding(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    where: { userId },
    include: ['documents', 'metadatas', 'distances']
  });

  const sources: RAGResult[] = [];
  const docs = results.documents?.[0] || [];
  const metas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  for (let i = 0; i < docs.length; i++) {
    sources.push({
      content: docs[i],
      source: metas[i]?.source || 'unknown',
      title: metas[i]?.title || 'Untitled',
      score: 1 - (distances[i] || 0), // Convert distance to similarity
      metadata: metas[i]
    });
  }

  return sources.sort((a, b) => b.score - a.score);
}

export async function getDocuments(userId: string): Promise<any[]> {
  const db = getDatabase();
  return db.prepare(
    `SELECT id, title, source, chunk_count, created_at FROM document_knowledge WHERE user_id = ? ORDER BY created_at DESC`
  ).all(userId);
}

export async function deleteDocument(docId: string, userId: string): Promise<void> {
  const db = getDatabase();
  db.prepare(`DELETE FROM document_knowledge WHERE id = ? AND user_id = ?`).run(docId, userId);
  // Note: ChromaDB deletion by metadata filter would go here
}

// Initialize tables
export async function initRAGTables() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_knowledge (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      chunk_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_doc_knowledge_user ON document_knowledge(user_id);
    CREATE INDEX IF NOT EXISTS idx_doc_knowledge_created ON document_knowledge(created_at);
  `);
}

export async function buildRAGContext(
  query: string,
  userId: string,
  limit: number = 5
): Promise<{ context: string; sources: RAGResult[] }> {
  const sources = await semanticSearch(query, userId, limit);
  const context = sources.map((s, i) => `[Source ${i + 1}] ${s.title} (${s.source}): ${s.content}`).join('\n\n');
  return { context, sources };
}
