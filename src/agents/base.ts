/**
 * Base Agent Class
 *
 * Provides common functionality for all research agents.
 */

export interface ResearchContext {
  subject: string;
  queries: string[];
  context?: string;
  depth: 'quick' | 'standard' | 'comprehensive';
}

export interface Finding {
  id: string;
  type: string;
  subject: string;
  claim: string;
  evidence: Evidence[];
  sources: Source[];
  confidence: number;
  verificationStatus: 'unverified' | 'partially_verified' | 'verified' | 'contradicted';
  contradictions?: Finding[];
  timestamp: Date;
}

export interface Evidence {
  type: string;
  content: string;
  source: Source;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  type: string;
  publishedDate?: Date;
  accessedDate: Date;
  reliabilityScore: number;
}

export interface AgentConfig {
  name: string;
  sourceTypes: string[];
  maxConcurrentRequests: number;
  rateLimitPerMinute: number;
  timeout: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Main research entry point - implement in subclasses
   */
  abstract research(context: ResearchContext): Promise<Finding[]>;

  /**
   * Rate limiting helper
   */
  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / this.config.rateLimitPerMinute;

    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Generate a unique finding ID
   */
  protected generateFindingId(): string {
    return `finding-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique source ID
   */
  protected generateSourceId(url: string): string {
    const hash = this.simpleHash(url);
    return `source-${hash}`;
  }

  /**
   * Simple string hash for ID generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a source object
   */
  protected createSource(
    url: string,
    title: string,
    type: string,
    publishedDate?: Date,
    reliabilityScore: number = 0.5
  ): Source {
    return {
      id: this.generateSourceId(url),
      url,
      title,
      type,
      publishedDate,
      accessedDate: new Date(),
      reliabilityScore
    };
  }

  /**
   * Create a finding object
   */
  protected createFinding(
    type: string,
    subject: string,
    claim: string,
    evidence: Evidence[],
    sources: Source[],
    confidence: number,
    timestamp?: Date
  ): Finding {
    return {
      id: this.generateFindingId(),
      type,
      subject,
      claim,
      evidence,
      sources,
      confidence,
      verificationStatus: 'unverified',
      timestamp: timestamp || new Date()
    };
  }

  /**
   * Extract entities from text (basic implementation)
   */
  protected extractEntities(text: string): {
    people: string[];
    organizations: string[];
    locations: string[];
  } {
    // This is a placeholder - in production, use NER
    return {
      people: [],
      organizations: [],
      locations: []
    };
  }

  /**
   * Calculate initial confidence score
   */
  protected calculateConfidence(
    sourceCount: number,
    sourceReliability: number,
    recency: number
  ): number {
    // Base confidence from source count (max 0.4)
    const sourceScore = Math.min(sourceCount * 0.2, 0.4);

    // Reliability contribution (max 0.4)
    const reliabilityScore = sourceReliability * 0.4;

    // Recency contribution (max 0.2) - decay over 2 years
    const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
    const age = Date.now() - recency;
    const recencyScore = Math.max(0, 0.2 * (1 - age / twoYearsMs));

    return Math.min(sourceScore + reliabilityScore + recencyScore, 1.0);
  }

  /**
   * Log agent activity
   */
  protected log(message: string): void {
    console.log(`[${this.config.name}] ${message}`);
  }
}

export default BaseAgent;
