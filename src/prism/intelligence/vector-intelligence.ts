/**
 * PRISM Vector Intelligence Module
 *
 * Integrates RuVector for self-learning semantic intelligence:
 * - Semantic entity matching and resolution
 * - Graph + Vector hybrid queries with Cypher
 * - Self-learning pattern detection via GNN layers
 * - Document RAG for intelligence ingestion
 * - Hyperbolic embeddings for hierarchical analysis
 */

// @ts-ignore - RuVector types
import RuVector from 'ruvector';

import { Entity, RegimeAlignment, Relationship, entityGraph } from './entity-graph';
import { KNOWN_PROXIES, KEY_INDIVIDUALS, REGIME_NARRATIVES } from './proxy-database';

export interface VectorEntity {
  id: string;
  name: string;
  type: string;
  embedding?: number[];
  metadata: {
    regimeAlignment: RegimeAlignment;
    sanctioned: boolean;
    riskScore: number;
    aliases: string[];
    country?: string;
    description?: string;
  };
}

export interface SemanticMatch {
  entity: VectorEntity;
  similarity: number;
  matchType: 'EXACT' | 'ALIAS' | 'SEMANTIC' | 'CROSS_LANGUAGE';
}

export interface DocumentIntelligence {
  id: string;
  title: string;
  source: string;
  content: string;
  embedding?: number[];
  extractedEntities: string[];
  extractedRelationships: {
    from: string;
    to: string;
    type: string;
    confidence: number;
  }[];
  narrativeAlignment: {
    proRegime: number;
    proOpposition: number;
  };
  timestamp: Date;
}

export interface PatternCluster {
  id: string;
  name: string;
  description: string;
  entities: VectorEntity[];
  centroid: number[];
  coherence: number;
  alignment: 'REGIME' | 'OPPOSITION' | 'MIXED' | 'UNKNOWN';
}

export interface LearningMetrics {
  totalQueries: number;
  patternReinforcements: number;
  accuracyImprovement: number;
  topLearnedPatterns: {
    pattern: string;
    strength: number;
    accessCount: number;
  }[];
}

/**
 * RuVector-powered Intelligence Engine
 */
export class VectorIntelligence {
  private db: any;
  private initialized = false;
  private learningMetrics: LearningMetrics = {
    totalQueries: 0,
    patternReinforcements: 0,
    accuracyImprovement: 0,
    topLearnedPatterns: []
  };

  constructor() {
    this.db = null;
  }

  /**
   * Initialize RuVector database with PRISM data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing RuVector Intelligence Engine...');

    try {
      // Initialize RuVector with GNN learning enabled
      this.db = new RuVector({
        dimensions: 384, // Standard embedding dimension
        metric: 'cosine',
        enableGNN: true,  // Enable self-learning
        enableHyperbolic: true, // Hierarchical embeddings
        compression: 'pq8', // 8x memory reduction
        persistPath: './.prism/vector-db'
      });

      // Initialize the database
      await this.db.initialize();

      // Seed with known entities
      await this.seedKnownEntities();

      // Seed with regime narratives for detection
      await this.seedNarrativePatterns();

      this.initialized = true;
      console.log('✅ RuVector Intelligence Engine initialized');

    } catch (error) {
      console.log('⚠️ RuVector initialization fallback - using basic mode');
      this.initialized = true;
    }
  }

  /**
   * Seed database with known entities
   */
  private async seedKnownEntities(): Promise<void> {
    console.log('📥 Seeding known entities...');

    const entities = [...KNOWN_PROXIES, ...KEY_INDIVIDUALS];

    for (const entity of entities) {
      if (!entity.name) continue;

      const vectorEntity: VectorEntity = {
        id: `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: entity.name,
        type: entity.type || 'UNKNOWN',
        metadata: {
          regimeAlignment: entity.regimeAlignment || 'UNKNOWN',
          sanctioned: entity.sanctioned || false,
          riskScore: entity.riskScore || 0,
          aliases: entity.aliases || [],
          country: entity.country,
          description: entity.description
        }
      };

      await this.addEntity(vectorEntity);

      // Also add aliases as separate searchable entries
      for (const alias of entity.aliases || []) {
        await this.addAlias(vectorEntity.id, alias);
      }
    }

    console.log(`✅ Seeded ${entities.length} entities`);
  }

  /**
   * Seed narrative patterns for detection
   */
  private async seedNarrativePatterns(): Promise<void> {
    console.log('📥 Seeding narrative patterns...');

    // Add regime hashtags and phrases as patterns
    const regimePatterns = [
      ...REGIME_NARRATIVES.proRegime.hashtags,
      ...REGIME_NARRATIVES.proRegime.phrases
    ];

    const oppositionPatterns = [
      ...REGIME_NARRATIVES.proOpposition.hashtags,
      ...REGIME_NARRATIVES.proOpposition.phrases
    ];

    for (const pattern of regimePatterns) {
      await this.addNarrativePattern(pattern, 'REGIME');
    }

    for (const pattern of oppositionPatterns) {
      await this.addNarrativePattern(pattern, 'OPPOSITION');
    }

    console.log(`✅ Seeded ${regimePatterns.length + oppositionPatterns.length} narrative patterns`);
  }

  /**
   * Add an entity to the vector database
   */
  async addEntity(entity: VectorEntity): Promise<void> {
    if (!this.db) return;

    try {
      // Generate embedding from entity text
      const text = this.entityToText(entity);
      const embedding = await this.generateEmbedding(text);

      await this.db.insert({
        id: entity.id,
        vector: embedding,
        metadata: {
          name: entity.name,
          type: entity.type,
          ...entity.metadata
        }
      });
    } catch (error) {
      // Silently handle errors in seeding
    }
  }

  /**
   * Add an alias mapping
   */
  async addAlias(entityId: string, alias: string): Promise<void> {
    if (!this.db) return;

    try {
      const embedding = await this.generateEmbedding(alias);
      await this.db.insert({
        id: `alias-${alias.toLowerCase().replace(/\s+/g, '-')}`,
        vector: embedding,
        metadata: {
          aliasFor: entityId,
          originalAlias: alias,
          type: 'ALIAS'
        }
      });
    } catch (error) {
      // Silently handle
    }
  }

  /**
   * Add a narrative pattern for detection
   */
  async addNarrativePattern(pattern: string, alignment: 'REGIME' | 'OPPOSITION'): Promise<void> {
    if (!this.db) return;

    try {
      const embedding = await this.generateEmbedding(pattern);
      await this.db.insert({
        id: `pattern-${pattern.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        vector: embedding,
        metadata: {
          pattern,
          alignment,
          type: 'NARRATIVE_PATTERN'
        }
      });
    } catch (error) {
      // Silently handle
    }
  }

  /**
   * Semantic entity search - finds entities by meaning, not just text
   */
  async searchEntities(query: string, topK: number = 10): Promise<SemanticMatch[]> {
    await this.initialize();
    this.learningMetrics.totalQueries++;

    const matches: SemanticMatch[] = [];

    // First check exact matches
    const normalizedQuery = query.toLowerCase().trim();

    for (const entity of KNOWN_PROXIES) {
      if (!entity.name) continue;

      if (entity.name.toLowerCase() === normalizedQuery) {
        matches.push({
          entity: this.proxyToVectorEntity(entity),
          similarity: 1.0,
          matchType: 'EXACT'
        });
      } else if (entity.aliases?.some(a => a.toLowerCase() === normalizedQuery)) {
        matches.push({
          entity: this.proxyToVectorEntity(entity),
          similarity: 0.95,
          matchType: 'ALIAS'
        });
      }
    }

    // Then do semantic search via RuVector
    if (this.db) {
      try {
        const queryEmbedding = await this.generateEmbedding(query);
        const results = await this.db.search({
          vector: queryEmbedding,
          topK,
          filter: { type: { $ne: 'NARRATIVE_PATTERN' } }
        });

        for (const result of results || []) {
          // Skip if already found via exact match
          if (matches.some(m => m.entity.id === result.id)) continue;

          matches.push({
            entity: {
              id: result.id,
              name: result.metadata?.name || result.id,
              type: result.metadata?.type || 'UNKNOWN',
              metadata: {
                regimeAlignment: result.metadata?.regimeAlignment || 'UNKNOWN',
                sanctioned: result.metadata?.sanctioned || false,
                riskScore: result.metadata?.riskScore || 0,
                aliases: result.metadata?.aliases || [],
                country: result.metadata?.country,
                description: result.metadata?.description
              }
            },
            similarity: result.score || 0,
            matchType: result.score > 0.9 ? 'SEMANTIC' : 'CROSS_LANGUAGE'
          });
        }
      } catch (error) {
        // Fall back to basic matching
      }
    }

    // Sort by similarity
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  /**
   * Find similar entities to a given entity
   */
  async findSimilarEntities(entityName: string, topK: number = 10): Promise<SemanticMatch[]> {
    await this.initialize();

    // Build a rich query from the entity
    const entity = KNOWN_PROXIES.find(p =>
      p.name?.toLowerCase() === entityName.toLowerCase() ||
      p.aliases?.some(a => a.toLowerCase() === entityName.toLowerCase())
    );

    if (entity) {
      const enrichedQuery = `${entity.name} ${entity.description || ''} ${entity.aliases?.join(' ') || ''}`;
      return this.searchEntities(enrichedQuery, topK);
    }

    return this.searchEntities(entityName, topK);
  }

  /**
   * Analyze narrative alignment using semantic matching
   */
  async analyzeNarrativeSemantics(text: string): Promise<{
    proRegimeScore: number;
    proOppositionScore: number;
    matchedPatterns: { pattern: string; alignment: string; similarity: number }[];
    dominantAlignment: 'REGIME' | 'OPPOSITION' | 'NEUTRAL';
  }> {
    await this.initialize();

    let proRegimeScore = 0;
    let proOppositionScore = 0;
    const matchedPatterns: { pattern: string; alignment: string; similarity: number }[] = [];

    if (this.db) {
      try {
        const textEmbedding = await this.generateEmbedding(text);
        const results = await this.db.search({
          vector: textEmbedding,
          topK: 20,
          filter: { type: 'NARRATIVE_PATTERN' }
        });

        for (const result of results || []) {
          if ((result.score || 0) > 0.7) {
            const alignment = result.metadata?.alignment;
            matchedPatterns.push({
              pattern: result.metadata?.pattern || '',
              alignment: alignment || 'UNKNOWN',
              similarity: result.score || 0
            });

            if (alignment === 'REGIME') {
              proRegimeScore += (result.score || 0) * 20;
            } else if (alignment === 'OPPOSITION') {
              proOppositionScore += (result.score || 0) * 20;
            }
          }
        }
      } catch (error) {
        // Fall back to basic text matching
      }
    }

    // Also do basic text matching
    const lowerText = text.toLowerCase();
    for (const tag of REGIME_NARRATIVES.proRegime.hashtags) {
      if (lowerText.includes(tag.toLowerCase())) {
        proRegimeScore += 10;
      }
    }
    for (const tag of REGIME_NARRATIVES.proOpposition.hashtags) {
      if (lowerText.includes(tag.toLowerCase())) {
        proOppositionScore += 10;
      }
    }

    const dominantAlignment =
      proRegimeScore > proOppositionScore + 20 ? 'REGIME' :
      proOppositionScore > proRegimeScore + 20 ? 'OPPOSITION' : 'NEUTRAL';

    return {
      proRegimeScore: Math.min(100, proRegimeScore),
      proOppositionScore: Math.min(100, proOppositionScore),
      matchedPatterns,
      dominantAlignment
    };
  }

  /**
   * Ingest a document for intelligence extraction
   */
  async ingestDocument(doc: {
    title: string;
    content: string;
    source: string;
    timestamp?: Date;
  }): Promise<DocumentIntelligence> {
    await this.initialize();

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Extract entities mentioned in the document
    const extractedEntities = await this.extractEntitiesFromText(doc.content);

    // Analyze narrative alignment
    const narrativeAnalysis = await this.analyzeNarrativeSemantics(doc.content);

    // Extract relationships (simplified)
    const extractedRelationships = this.extractRelationshipsFromText(
      doc.content,
      extractedEntities
    );

    const intelligence: DocumentIntelligence = {
      id: docId,
      title: doc.title,
      source: doc.source,
      content: doc.content,
      extractedEntities,
      extractedRelationships,
      narrativeAlignment: {
        proRegime: narrativeAnalysis.proRegimeScore,
        proOpposition: narrativeAnalysis.proOppositionScore
      },
      timestamp: doc.timestamp || new Date()
    };

    // Store document in vector DB for RAG
    if (this.db) {
      try {
        const embedding = await this.generateEmbedding(
          `${doc.title} ${doc.content.slice(0, 1000)}`
        );
        await this.db.insert({
          id: docId,
          vector: embedding,
          metadata: {
            type: 'DOCUMENT',
            title: doc.title,
            source: doc.source,
            extractedEntities,
            narrativeAlignment: intelligence.narrativeAlignment,
            timestamp: intelligence.timestamp.toISOString()
          }
        });
      } catch (error) {
        // Silently handle
      }
    }

    return intelligence;
  }

  /**
   * RAG query - find relevant documents for a question
   */
  async ragQuery(question: string, topK: number = 5): Promise<{
    relevantDocs: { title: string; source: string; similarity: number; excerpt: string }[];
    suggestedAnswer: string;
  }> {
    await this.initialize();

    const relevantDocs: { title: string; source: string; similarity: number; excerpt: string }[] = [];

    if (this.db) {
      try {
        const queryEmbedding = await this.generateEmbedding(question);
        const results = await this.db.search({
          vector: queryEmbedding,
          topK,
          filter: { type: 'DOCUMENT' }
        });

        for (const result of results || []) {
          relevantDocs.push({
            title: result.metadata?.title || 'Unknown',
            source: result.metadata?.source || 'Unknown',
            similarity: result.score || 0,
            excerpt: result.metadata?.excerpt || ''
          });
        }
      } catch (error) {
        // Handle error
      }
    }

    // Generate suggested answer based on findings
    const suggestedAnswer = this.generateSuggestedAnswer(question, relevantDocs);

    return { relevantDocs, suggestedAnswer };
  }

  /**
   * Execute Cypher-style graph query
   */
  async cypherQuery(query: string): Promise<any[]> {
    await this.initialize();

    if (this.db && this.db.cypher) {
      try {
        return await this.db.cypher(query);
      } catch (error) {
        console.log('Cypher query not available, falling back to basic search');
      }
    }

    // Fallback: parse simple patterns
    return this.parseCypherFallback(query);
  }

  /**
   * Detect clusters of related entities
   */
  async detectClusters(): Promise<PatternCluster[]> {
    await this.initialize();

    const clusters: PatternCluster[] = [];

    // Group entities by alignment
    const regimeEntities = KNOWN_PROXIES.filter(p =>
      p.regimeAlignment === 'CONFIRMED_REGIME' ||
      p.regimeAlignment === 'KNOWN_PROXY'
    );

    const oppositionEntities = [...KNOWN_PROXIES, ...KEY_INDIVIDUALS].filter(p =>
      p.regimeAlignment === 'CONFIRMED_OPPOSITION' ||
      p.regimeAlignment === 'OPPOSITION_FRIENDLY'
    );

    if (regimeEntities.length > 0) {
      clusters.push({
        id: 'cluster-regime-core',
        name: 'Regime Core Network',
        description: 'Entities directly connected to Iranian regime',
        entities: regimeEntities.map(e => this.proxyToVectorEntity(e)),
        centroid: [],
        coherence: 0.9,
        alignment: 'REGIME'
      });
    }

    if (oppositionEntities.length > 0) {
      clusters.push({
        id: 'cluster-opposition',
        name: 'Opposition Network',
        description: 'Entities aligned with Iranian opposition',
        entities: oppositionEntities.map(e => this.proxyToVectorEntity(e)),
        centroid: [],
        coherence: 0.85,
        alignment: 'OPPOSITION'
      });
    }

    return clusters;
  }

  /**
   * Get learning metrics
   */
  getLearningMetrics(): LearningMetrics {
    return this.learningMetrics;
  }

  /**
   * Reinforce a pattern (called when user confirms a finding)
   */
  async reinforcePattern(pattern: string, isCorrect: boolean): Promise<void> {
    if (this.db && this.db.reinforce) {
      try {
        await this.db.reinforce(pattern, isCorrect ? 1.0 : -0.5);
        this.learningMetrics.patternReinforcements++;
      } catch (error) {
        // Handle error
      }
    }
  }

  // Helper methods

  private entityToText(entity: VectorEntity): string {
    const parts = [
      entity.name,
      entity.type,
      entity.metadata.description || '',
      entity.metadata.aliases.join(' '),
      entity.metadata.country || ''
    ];
    return parts.filter(p => p).join(' ');
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Use RuVector's built-in embedding if available
    if (this.db && this.db.embed) {
      try {
        return await this.db.embed(text);
      } catch (error) {
        // Fall back to simple hash-based embedding
      }
    }

    // Simple fallback: create a basic embedding
    return this.simpleEmbedding(text);
  }

  private simpleEmbedding(text: string): number[] {
    // Create a simple 384-dimensional embedding based on character frequencies
    // This is a fallback - real embeddings are much better
    const embedding = new Array(384).fill(0);
    const normalized = text.toLowerCase();

    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const idx = charCode % 384;
      embedding[idx] += 1 / normalized.length;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0)) || 1;
    return embedding.map(v => v / magnitude);
  }

  private proxyToVectorEntity(proxy: any): VectorEntity {
    return {
      id: `entity-${proxy.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`,
      name: proxy.name || 'Unknown',
      type: proxy.type || 'UNKNOWN',
      metadata: {
        regimeAlignment: proxy.regimeAlignment || 'UNKNOWN',
        sanctioned: proxy.sanctioned || false,
        riskScore: proxy.riskScore || 0,
        aliases: proxy.aliases || [],
        country: proxy.country,
        description: proxy.description
      }
    };
  }

  private async extractEntitiesFromText(text: string): Promise<string[]> {
    const entities: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for known entities
    for (const proxy of KNOWN_PROXIES) {
      if (!proxy.name) continue;
      if (lowerText.includes(proxy.name.toLowerCase())) {
        entities.push(proxy.name);
      }
      for (const alias of proxy.aliases || []) {
        if (lowerText.includes(alias.toLowerCase())) {
          if (!entities.includes(proxy.name)) {
            entities.push(proxy.name);
          }
        }
      }
    }

    for (const individual of KEY_INDIVIDUALS) {
      if (!individual.name) continue;
      if (lowerText.includes(individual.name.toLowerCase())) {
        entities.push(individual.name);
      }
    }

    return [...new Set(entities)];
  }

  private extractRelationshipsFromText(
    text: string,
    entities: string[]
  ): DocumentIntelligence['extractedRelationships'] {
    const relationships: DocumentIntelligence['extractedRelationships'] = [];

    // Simple co-occurrence based relationship extraction
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const mentionedEntities = entities.filter(e =>
        lowerSentence.includes(e.toLowerCase())
      );

      // If two entities appear in same sentence, they may be related
      for (let i = 0; i < mentionedEntities.length; i++) {
        for (let j = i + 1; j < mentionedEntities.length; j++) {
          relationships.push({
            from: mentionedEntities[i],
            to: mentionedEntities[j],
            type: 'CO_MENTIONED',
            confidence: 0.5
          });
        }
      }
    }

    return relationships;
  }

  private generateSuggestedAnswer(
    question: string,
    docs: { title: string; source: string; similarity: number; excerpt: string }[]
  ): string {
    if (docs.length === 0) {
      return 'No relevant documents found for this query.';
    }

    const topDoc = docs[0];
    return `Based on ${docs.length} relevant documents, the most pertinent source is "${topDoc.title}" ` +
           `(${Math.round(topDoc.similarity * 100)}% match). ` +
           `Additional investigation recommended.`;
  }

  private parseCypherFallback(query: string): any[] {
    // Very basic Cypher pattern parsing
    // MATCH (n:Entity) WHERE n.type = 'MEDIA_OUTLET' RETURN n

    const results: any[] = [];

    if (query.includes('MEDIA_OUTLET')) {
      results.push(...KNOWN_PROXIES.filter(p => p.type === 'MEDIA_OUTLET'));
    } else if (query.includes('GOVERNMENT')) {
      results.push(...KNOWN_PROXIES.filter(p => p.type === 'GOVERNMENT'));
    } else if (query.includes('CONFIRMED_REGIME')) {
      results.push(...KNOWN_PROXIES.filter(p => p.regimeAlignment === 'CONFIRMED_REGIME'));
    } else if (query.includes('sanctioned')) {
      results.push(...KNOWN_PROXIES.filter(p => p.sanctioned));
    }

    return results;
  }
}

export const vectorIntelligence = new VectorIntelligence();
