/**
 * PRISM Base Research Agent
 *
 * Abstract base class for all research agents.
 * Provides common functionality for data gathering, parsing, and evidence collection.
 */

import { Source, Evidence, SourceReliability, SourceType } from '../core/types';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface AgentConfig {
  maxResults?: number;
  timeout?: number;
  retryAttempts?: number;
  sourcePriority?: string[];
}

export abstract class BaseAgent {
  protected name: string;
  protected config: AgentConfig;
  protected sources: Source[] = [];
  protected evidence: Evidence[] = [];

  constructor(name: string, config: AgentConfig = {}) {
    this.name = name;
    this.config = {
      maxResults: config.maxResults || 20,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      sourcePriority: config.sourcePriority || []
    };
  }

  /**
   * Main research method - implemented by each specialized agent
   */
  abstract research(subject: string, context?: Record<string, any>): Promise<any>;

  /**
   * Create a source record
   */
  protected createSource(
    name: string,
    type: SourceType,
    reliability: SourceReliability,
    url?: string
  ): Source {
    const source: Source = {
      id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      reliability,
      url,
      accessDate: new Date(),
      archived: false
    };
    this.sources.push(source);
    return source;
  }

  /**
   * Create an evidence record
   */
  protected createEvidence(
    sourceId: string,
    summary: string,
    confidence: number,
    quote?: string
  ): Evidence {
    const evidence: Evidence = {
      sourceId,
      summary,
      confidence,
      quote,
      date: new Date(),
      verificationStatus: confidence > 0.8 ? 'VERIFIED' : 'UNVERIFIED'
    };
    this.evidence.push(evidence);
    return evidence;
  }

  /**
   * Assess source reliability based on domain
   */
  protected assessReliability(url: string): SourceReliability {
    const domain = this.extractDomain(url);

    // High reliability sources
    const highReliability = [
      'wikipedia.org', 'britannica.com', 'reuters.com', 'apnews.com',
      'bbc.com', 'bbc.co.uk', 'npr.org', 'pbs.org', 'c-span.org',
      'gov', 'edu', 'ac.uk', 'washingtonpost.com', 'nytimes.com',
      'theguardian.com', 'economist.com', 'foreignaffairs.com'
    ];

    // Medium reliability sources
    const mediumReliability = [
      'cnn.com', 'foxnews.com', 'msnbc.com', 'politico.com',
      'thehill.com', 'axios.com', 'vox.com', 'vice.com',
      'timesofisrael.com', 'jpost.com', 'haaretz.com',
      'iranintl.com', 'radiofarda.com', 'aljazeera.com'
    ];

    for (const high of highReliability) {
      if (domain.includes(high)) return 'HIGH';
    }

    for (const med of mediumReliability) {
      if (domain.includes(med)) return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Extract domain from URL
   */
  protected extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Clean and normalize text
   */
  protected normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, ' ')
      .trim();
  }

  /**
   * Extract dates from text
   */
  protected extractDates(text: string): string[] {
    const patterns = [
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b/gi
    ];

    const dates: string[] = [];
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) dates.push(...matches);
    }

    return [...new Set(dates)];
  }

  /**
   * Extract names from text (basic NER)
   */
  protected extractNames(text: string): string[] {
    // Pattern for capitalized word sequences (potential names)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    const matches = text.match(namePattern) || [];

    // Filter out common non-name phrases
    const excludePatterns = [
      /^(The|United|Islamic|Republic|Federal|National|International)/,
      /University|Institute|Foundation|Organization|Association/,
      /January|February|March|April|May|June|July|August|September|October|November|December/
    ];

    return matches.filter(name => {
      return !excludePatterns.some(pattern => pattern.test(name));
    });
  }

  /**
   * Extract organizations from text
   */
  protected extractOrganizations(text: string): string[] {
    const orgPatterns = [
      /(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Foundation|Institute|Organization|Association|Committee|Council|Agency|Bureau|Department|Ministry|Party|Movement|Alliance|Coalition|Group|Network|Center|Centre))/g,
      /(?:the\s+)?([A-Z][a-zA-Z\s]+(?:University|College|School))/g,
      /(?:the\s+)?([A-Z][A-Z]+)\b/g // Acronyms
    ];

    const orgs: string[] = [];
    for (const pattern of orgPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length > 2) {
          orgs.push(match[1].trim());
        }
      }
    }

    return [...new Set(orgs)];
  }

  /**
   * Get collected sources
   */
  getSources(): Source[] {
    return this.sources;
  }

  /**
   * Get collected evidence
   */
  getEvidence(): Evidence[] {
    return this.evidence;
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.sources = [];
    this.evidence = [];
  }
}
