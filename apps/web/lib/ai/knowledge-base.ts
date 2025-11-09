'use server';

import { promises as fs } from "fs";
import path from "path";
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Maximum number of characters per content chunk.
 */
const MAX_CHUNK_SIZE = 1200;

/**
 * Collection of documentation files that describe the platform.
 *
 * Add new entries here when additional documentation should be exposed to the AI assistant.
 */
const DOC_RELATIVE_PATHS = [
  "README.md",
  "docs/README.md",
  "docs/NEXT_STEPS.md",
  "docs/development/FRONTEND_ARCHITECTURE_STUDY.md",
  "docs/components/overview/COMPLETE_INTEGRATION_SUMMARY.md",
  "docs/apps/LANDING_PAGE.md",
  "docs/apps/DASHBOARD.md",
  "docs/deployment/ENV_EXAMPLE.md",
  "docs/deployment/VERCEL_DEPLOYMENT.md",
  "docs/deployment/VERCEL_DEPLOYMENT_SUMMARY.md",
  "docs/development/CONSISTENCY_FIXES.md",
  "docs/development/DEMO_REMOVAL_SUMMARY.md",
  "docs/architecture/FRONTEND_RESTRUCTURE_SUMMARY.md",
  "apps/web/docs/TESTING_GUIDE.md",
];

/**
 * Text chunk derived from documentation.
 */
interface KnowledgeChunk {
  /**
   * Unique identifier for the chunk.
   */
  id: string;
  /**
   * Associated heading for context.
   */
  heading: string;
  /**
   * Source file path.
   */
  source: string;
  /**
   * Chunk content.
   */
  content: string;
}

/**
 * Loads and memoizes documentation snippets that describe the platform.
 *
 * @returns Array of {@link KnowledgeChunk}.
 */
async function loadKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  'use cache';
  // ⚙️ CACHING STRATEGY: These values assume documentation updates are infrequent.
  // Adjust or revalidate as needed if docs change more regularly.
  cacheLife({
    stale: 60 * 60, // 1 hour
    revalidate: 60 * 60 * 24, // 24 hours
    expire: 60 * 60 * 24 * 7, // 7 days
  });
  cacheTag('knowledge-base');

  const projectRoot = process.cwd();
  const chunks: KnowledgeChunk[] = [];

  for (const relativePath of DOC_RELATIVE_PATHS) {
    const absolutePath = path.join(projectRoot, relativePath);
    try {
      const fileContent = await fs.readFile(absolutePath, "utf8");
      const fileChunks = splitContentIntoChunks(fileContent, relativePath);
      chunks.push(...fileChunks);
    } catch (error) {
      console.warn(
        `[knowledge-base] Failed to read documentation file "${relativePath}":`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return chunks;
}

/**
 * Splits markdown content into heading-aware chunks.
 *
 * @param markdown Markdown source string.
 * @param source Relative file path.
 * @returns Array of {@link KnowledgeChunk}.
 */
function splitContentIntoChunks(markdown: string, source: string): KnowledgeChunk[] {
  const lines = markdown.split(/\r?\n/);
  let currentHeading = "Overview";
  let buffer: string[] = [];
  const chunks: KnowledgeChunk[] = [];
  let chunkIndex = 0;

  const flushBuffer = () => {
    if (buffer.length === 0) {
      return;
    }

    const content = buffer.join("\n").trim();
    if (content.length === 0) {
      buffer = [];
      return;
    }

    chunks.push({
      id: `${source}#${chunkIndex}`,
      heading: currentHeading,
      source,
      content,
    });

    chunkIndex += 1;
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.*)/);
    if (headingMatch) {
      flushBuffer();
      const headingText = headingMatch[1];
      if (headingText) {
        currentHeading = headingText.trim() || currentHeading;
      }
      continue;
    }

    buffer.push(line);

    if (buffer.join("\n").length >= MAX_CHUNK_SIZE) {
      flushBuffer();
    }
  }

  flushBuffer();
  return chunks;
}

/**
 * Computes a simple relevance score using keyword overlap.
 *
 * @param queryText User query text.
 * @param chunk Chunk to score.
 * @returns Numeric relevance score.
 */
function scoreChunk(queryText: string, chunk: KnowledgeChunk): number {
  const normalizedQueryTerms = Array.from(
    new Set(
      queryText
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean),
    ),
  );

  if (normalizedQueryTerms.length === 0) {
    return 0;
  }

  const normalizedContent = chunk.content.toLowerCase();
  const normalizedHeading = chunk.heading.toLowerCase();

  let score = 0;
  for (const term of normalizedQueryTerms) {
    if (normalizedHeading.includes(term)) {
      score += 3;
    }
    if (normalizedContent.includes(term)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Retrieves the most relevant documentation chunks for a given query.
 *
 * @param queryText User question to match on.
 * @param limit Maximum number of chunks to return.
 * @returns Ordered chunks by relevance (descending).
 */
export async function getRelevantKnowledgeChunks(queryText: string, limit = 4): Promise<KnowledgeChunk[]> {
  const chunks = await loadKnowledgeChunks();
  const rankedChunks = chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(queryText, chunk),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ chunk }) => chunk);

  return rankedChunks;
}

/**
 * Formats relevant documentation snippets into a context block for the AI provider.
 *
 * @param queryText User input used for retrieval.
 * @returns Formatted context string and metadata for citations.
 */
export async function buildKnowledgeContext(queryText: string): Promise<{
  /**
   * Plain-text context block.
   */
  context: string;
  /**
   * Metadata describing included sources.
   */
  sources: Array<{ id: string; heading: string; source: string }>;
}> {
  const relevantChunks = await getRelevantKnowledgeChunks(queryText);

  if (relevantChunks.length === 0) {
    return {
      context: "",
      sources: [],
    };
  }

  const contextParts = relevantChunks.map(
    (chunk) =>
      `Source: ${chunk.source}\nSection: ${chunk.heading}\n---\n${chunk.content.trim()}`,
  );

  return {
    context: contextParts.join("\n\n"),
    sources: relevantChunks.map((chunk) => ({
      id: chunk.id,
      heading: chunk.heading,
      source: chunk.source,
    })),
  };
}

