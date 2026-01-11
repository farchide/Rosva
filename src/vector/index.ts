/**
 * RuVector Integration Layer
 *
 * Provides vector storage and GNN-enhanced retrieval
 * for person entities and research findings.
 */

export interface VectorConfig {
  provider: 'ruvector';
  gnnEnabled: boolean;
  embeddingDimensions?: number;
  indexType?: 'hnsw' | 'flat';
  persistPath?: string;
}

export interface PersonEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  identifiers: { type: string; value: string; verified: boolean }[];
  attributes: { key: string; value: any; sources: any[]; confidence: number; asOf: Date }[];
  embedding?: Float32Array;
}

export interface Finding {
  id: string;
  type: string;
  subject: string;
  claim: string;
  confidence: number;
  sources: any[];
  timestamp: Date;
}

interface SearchResult<T> {
  item: T;
  score: number;
  gnnEnhanced: boolean;
}

/**
 * Vector store for person research data
 */
export class VectorStore {
  private config: VectorConfig;
  private initialized: boolean = false;

  // In-memory stores (would be RuVector in production)
  private personVectors: Map<string, { entity: PersonEntity; vector: Float32Array }> = new Map();
  private findingVectors: Map<string, { finding: Finding; vector: Float32Array }> = new Map();
  private nameIndex: Map<string, string[]> = new Map(); // name -> entity IDs

  constructor(config: VectorConfig) {
    this.config = {
      embeddingDimensions: 768,
      indexType: 'hnsw',
      ...config
    };
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[VectorStore] Initializing with config:', this.config);

    // In production, this would:
    // 1. Connect to RuVector instance
    // 2. Initialize HNSW index
    // 3. Load GNN model if enabled
    // 4. Restore persisted data if available

    this.initialized = true;
    console.log('[VectorStore] Initialization complete');
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<Float32Array> {
    // In production, use a proper embedding model (e.g., OpenAI, Sentence Transformers)
    // For now, create a simple hash-based pseudo-embedding

    const dims = this.config.embeddingDimensions || 768;
    const embedding = new Float32Array(dims);

    // Simple deterministic embedding based on text hash
    const normalized = text.toLowerCase();
    for (let i = 0; i < dims; i++) {
      let hash = 0;
      for (let j = 0; j < normalized.length; j++) {
        hash = ((hash << 5) - hash + normalized.charCodeAt(j) + i) | 0;
      }
      embedding[i] = Math.sin(hash) * 0.5 + 0.5;
    }

    // Normalize
    let magnitude = 0;
    for (let i = 0; i < dims; i++) {
      magnitude += embedding[i] * embedding[i];
    }
    magnitude = Math.sqrt(magnitude);
    for (let i = 0; i < dims; i++) {
      embedding[i] /= magnitude;
    }

    return embedding;
  }

  /**
   * Store a person entity
   */
  async storePerson(entity: PersonEntity): Promise<void> {
    // Generate embedding if not present
    if (!entity.embedding) {
      const text = this.buildPersonText(entity);
      entity.embedding = await this.generateEmbedding(text);
    }

    // Store in vector index
    this.personVectors.set(entity.id, {
      entity,
      vector: entity.embedding
    });

    // Update name index
    const names = [entity.canonicalName, ...entity.aliases];
    for (const name of names) {
      const normalizedName = name.toLowerCase();
      const existing = this.nameIndex.get(normalizedName) || [];
      if (!existing.includes(entity.id)) {
        existing.push(entity.id);
        this.nameIndex.set(normalizedName, existing);
      }
    }

    console.log(`[VectorStore] Stored person: ${entity.canonicalName}`);
  }

  /**
   * Store a finding
   */
  async storeFinding(finding: Finding): Promise<void> {
    const text = `${finding.type}: ${finding.claim}`;
    const vector = await this.generateEmbedding(text);

    this.findingVectors.set(finding.id, { finding, vector });
  }

  /**
   * Find a person by name
   */
  async findPerson(name: string): Promise<PersonEntity | null> {
    const normalizedName = name.toLowerCase();

    // First, check exact name index
    const ids = this.nameIndex.get(normalizedName);
    if (ids && ids.length > 0) {
      const stored = this.personVectors.get(ids[0]);
      if (stored) {
        return stored.entity;
      }
    }

    // If not found, try semantic search
    const results = await this.searchPersons(name, 1);
    if (results.length > 0 && results[0].score > 0.8) {
      return results[0].item;
    }

    return null;
  }

  /**
   * Search for persons by semantic similarity
   */
  async searchPersons(query: string, k: number = 5): Promise<SearchResult<PersonEntity>[]> {
    const queryVector = await this.generateEmbedding(query);
    const results: SearchResult<PersonEntity>[] = [];

    for (const [id, stored] of this.personVectors) {
      const score = this.cosineSimilarity(queryVector, stored.vector);
      results.push({
        item: stored.entity,
        score,
        gnnEnhanced: this.config.gnnEnabled
      });
    }

    // Sort by score and take top k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Search for similar findings
   */
  async searchFindings(
    query: string,
    k: number = 10,
    subjectFilter?: string
  ): Promise<SearchResult<Finding>[]> {
    const queryVector = await this.generateEmbedding(query);
    const results: SearchResult<Finding>[] = [];

    for (const [id, stored] of this.findingVectors) {
      if (subjectFilter && stored.finding.subject !== subjectFilter) {
        continue;
      }

      const score = this.cosineSimilarity(queryVector, stored.vector);
      results.push({
        item: stored.finding,
        score,
        gnnEnhanced: this.config.gnnEnabled
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Find related persons (for network analysis)
   */
  async findRelatedPersons(
    personId: string,
    k: number = 10
  ): Promise<SearchResult<PersonEntity>[]> {
    const stored = this.personVectors.get(personId);
    if (!stored) return [];

    const results: SearchResult<PersonEntity>[] = [];

    for (const [id, other] of this.personVectors) {
      if (id === personId) continue;

      const score = this.cosineSimilarity(stored.vector, other.vector);
      results.push({
        item: other.entity,
        score,
        gnnEnhanced: this.config.gnnEnabled
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Build text representation for embedding
   */
  private buildPersonText(entity: PersonEntity): string {
    const parts = [
      entity.canonicalName,
      ...entity.aliases,
      ...entity.attributes.map(a => `${a.key}: ${a.value}`)
    ];
    return parts.join(' ');
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get statistics about the store
   */
  getStats(): { persons: number; findings: number } {
    return {
      persons: this.personVectors.size,
      findings: this.findingVectors.size
    };
  }
}

export default VectorStore;
