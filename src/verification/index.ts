/**
 * Verification Engine
 *
 * Cross-references findings and assigns confidence scores
 * based on source reliability and corroboration.
 */

export interface VerificationConfig {
  minSources: number;
  crossReference: boolean;
  contradictionThreshold?: number;
  sourceWeighting?: boolean;
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

export interface Source {
  id: string;
  url: string;
  title: string;
  type: string;
  publishedDate?: Date;
  accessedDate: Date;
  reliabilityScore: number;
}

export interface Evidence {
  type: string;
  content: string;
  source: Source;
}

interface VerificationResult {
  finding: Finding;
  status: 'unverified' | 'partially_verified' | 'verified' | 'contradicted';
  confidence: number;
  corroboratingSources: Source[];
  contradictingFindings: Finding[];
  notes: string[];
}

/**
 * Verification engine for cross-referencing findings
 */
export class VerificationEngine {
  private config: VerificationConfig;

  // Source reliability tiers
  private reliabilityTiers: Map<string, number>;

  constructor(config: VerificationConfig) {
    this.config = {
      contradictionThreshold: 0.7,
      sourceWeighting: true,
      ...config
    };

    this.reliabilityTiers = this.initializeReliabilityTiers();
  }

  /**
   * Initialize source reliability scores by type
   */
  private initializeReliabilityTiers(): Map<string, number> {
    return new Map([
      // Official records
      ['government', 0.95],
      ['court', 0.95],
      ['corporate_filing', 0.9],
      ['state_registry', 0.9],

      // Established media
      ['wire_service', 0.9],
      ['major_newspaper', 0.85],
      ['broadcast', 0.8],

      // Other sources
      ['academic', 0.85],
      ['trade_publication', 0.75],
      ['social_profile', 0.6],
      ['social_post', 0.4],
      ['blog', 0.4],

      // Default
      ['unknown', 0.3]
    ]);
  }

  /**
   * Verify all findings
   */
  async verifyAll(findings: Finding[]): Promise<Finding[]> {
    const results: Finding[] = [];

    // Group findings by claim similarity
    const groups = this.groupSimilarClaims(findings);

    for (const group of groups) {
      if (group.length === 1) {
        // Single source - limited verification
        const verified = await this.verifySingle(group[0], findings);
        results.push(verified);
      } else {
        // Multiple sources - cross-verify
        const verified = await this.verifyGroup(group);
        results.push(...verified);
      }
    }

    // Check for contradictions across all findings
    if (this.config.crossReference) {
      this.detectContradictions(results);
    }

    return results;
  }

  /**
   * Verify a single finding
   */
  private async verifySingle(
    finding: Finding,
    allFindings: Finding[]
  ): Promise<Finding> {
    const result = { ...finding };

    // Check source reliability
    const avgReliability = this.calculateAverageReliability(finding.sources);

    // Look for corroborating findings
    const corroborating = this.findCorroborating(finding, allFindings);

    if (corroborating.length >= this.config.minSources - 1) {
      // Sufficient corroboration
      result.verificationStatus = 'verified';
      result.confidence = Math.min(
        avgReliability + corroborating.length * 0.1,
        0.95
      );
    } else if (finding.sources.length >= 1 && avgReliability > 0.7) {
      // Single high-quality source
      result.verificationStatus = 'partially_verified';
      result.confidence = avgReliability * 0.8;
    } else {
      // Insufficient verification
      result.verificationStatus = 'unverified';
      result.confidence = Math.min(finding.confidence, 0.4);
    }

    return result;
  }

  /**
   * Verify a group of similar findings
   */
  private async verifyGroup(group: Finding[]): Promise<Finding[]> {
    // Merge sources and evidence
    const allSources = new Map<string, Source>();
    const allEvidence = new Map<string, Evidence>();

    for (const finding of group) {
      for (const source of finding.sources) {
        if (!allSources.has(source.id)) {
          allSources.set(source.id, source);
        }
      }
      for (const evidence of finding.evidence) {
        const key = `${evidence.type}-${evidence.source.id}`;
        if (!allEvidence.has(key)) {
          allEvidence.set(key, evidence);
        }
      }
    }

    const sources = Array.from(allSources.values());
    const evidence = Array.from(allEvidence.values());

    // Check source independence
    const independence = this.assessSourceIndependence(sources);

    // Calculate verification status
    let status: Finding['verificationStatus'];
    let confidence: number;

    const avgReliability = this.calculateAverageReliability(sources);

    if (sources.length >= this.config.minSources && independence > 0.5) {
      status = 'verified';
      confidence = Math.min(0.95, avgReliability + independence * 0.2);
    } else if (sources.length >= 2) {
      status = 'partially_verified';
      confidence = Math.min(0.7, avgReliability);
    } else {
      status = 'unverified';
      confidence = Math.min(0.4, avgReliability);
    }

    // Create merged finding (take best from group)
    const best = group.reduce((a, b) =>
      a.sources.length > b.sources.length ? a : b
    );

    return [{
      ...best,
      sources,
      evidence,
      verificationStatus: status,
      confidence
    }];
  }

  /**
   * Group findings by claim similarity
   */
  private groupSimilarClaims(findings: Finding[]): Finding[][] {
    const groups: Finding[][] = [];
    const used = new Set<string>();

    for (const finding of findings) {
      if (used.has(finding.id)) continue;

      const group = [finding];
      used.add(finding.id);

      for (const other of findings) {
        if (used.has(other.id)) continue;
        if (this.areClaimsSimilar(finding.claim, other.claim)) {
          group.push(other);
          used.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Check if two claims are similar
   */
  private areClaimsSimilar(claim1: string, claim2: string): boolean {
    const words1 = new Set(claim1.toLowerCase().split(/\s+/));
    const words2 = new Set(claim2.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of words1) {
      if (words2.has(word)) overlap++;
    }

    const similarity = overlap / Math.max(words1.size, words2.size);
    return similarity > 0.5;
  }

  /**
   * Find corroborating findings
   */
  private findCorroborating(
    finding: Finding,
    allFindings: Finding[]
  ): Finding[] {
    return allFindings.filter(other => {
      if (other.id === finding.id) return false;
      if (other.subject !== finding.subject) return false;

      // Check for similar claims from independent sources
      const shareSources = finding.sources.some(s1 =>
        other.sources.some(s2 => s1.id === s2.id)
      );

      if (shareSources) return false; // Not independent

      return this.areClaimsSimilar(finding.claim, other.claim);
    });
  }

  /**
   * Calculate average source reliability
   */
  private calculateAverageReliability(sources: Source[]): number {
    if (sources.length === 0) return 0;

    const total = sources.reduce((sum, source) => {
      if (this.config.sourceWeighting) {
        const tierScore = this.reliabilityTiers.get(source.type) ||
                         this.reliabilityTiers.get('unknown') ||
                         0.3;
        return sum + (source.reliabilityScore + tierScore) / 2;
      }
      return sum + source.reliabilityScore;
    }, 0);

    return total / sources.length;
  }

  /**
   * Assess independence of sources
   */
  private assessSourceIndependence(sources: Source[]): number {
    if (sources.length <= 1) return 0;

    // Check for:
    // - Same domain
    // - Same publication date (possible syndication)
    // - Same author (if available)

    const domains = new Set<string>();
    const dates = new Map<string, number>();

    for (const source of sources) {
      try {
        const domain = new URL(source.url).hostname.replace('www.', '');
        domains.add(domain);
      } catch {
        // Invalid URL
      }

      if (source.publishedDate) {
        const dateKey = source.publishedDate.toISOString().split('T')[0];
        dates.set(dateKey, (dates.get(dateKey) || 0) + 1);
      }
    }

    // Independence score based on domain diversity
    const domainDiversity = domains.size / sources.length;

    // Check for same-day publication (possible syndication)
    let syndicationPenalty = 0;
    for (const [, count] of dates) {
      if (count > 1) {
        syndicationPenalty += 0.1 * (count - 1);
      }
    }

    return Math.max(0, domainDiversity - syndicationPenalty);
  }

  /**
   * Detect contradictions between findings
   */
  private detectContradictions(findings: Finding[]): void {
    const threshold = this.config.contradictionThreshold || 0.7;

    for (let i = 0; i < findings.length; i++) {
      for (let j = i + 1; j < findings.length; j++) {
        const f1 = findings[i];
        const f2 = findings[j];

        // Only check findings about the same subject
        if (f1.subject !== f2.subject) continue;

        // Check for contradictions
        if (this.areContradictory(f1, f2)) {
          // Mark the lower-confidence finding as contradicted
          if (f1.confidence < f2.confidence) {
            f1.verificationStatus = 'contradicted';
            f1.contradictions = f1.contradictions || [];
            f1.contradictions.push(f2);
          } else {
            f2.verificationStatus = 'contradicted';
            f2.contradictions = f2.contradictions || [];
            f2.contradictions.push(f1);
          }
        }
      }
    }
  }

  /**
   * Check if two findings contradict each other
   */
  private areContradictory(f1: Finding, f2: Finding): boolean {
    // Simple heuristics for contradiction detection
    const negationPatterns = [
      ['supports', 'opposes'],
      ['member of', 'not affiliated with'],
      ['confirmed', 'denied'],
      ['attended', 'absent from'],
      ['pro-', 'anti-']
    ];

    const claim1 = f1.claim.toLowerCase();
    const claim2 = f2.claim.toLowerCase();

    for (const [positive, negative] of negationPatterns) {
      if (
        (claim1.includes(positive) && claim2.includes(negative)) ||
        (claim1.includes(negative) && claim2.includes(positive))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get verification summary statistics
   */
  getSummary(findings: Finding[]): {
    total: number;
    verified: number;
    partiallyVerified: number;
    unverified: number;
    contradicted: number;
    averageConfidence: number;
  } {
    const summary = {
      total: findings.length,
      verified: 0,
      partiallyVerified: 0,
      unverified: 0,
      contradicted: 0,
      averageConfidence: 0
    };

    let totalConfidence = 0;

    for (const finding of findings) {
      totalConfidence += finding.confidence;
      switch (finding.verificationStatus) {
        case 'verified':
          summary.verified++;
          break;
        case 'partially_verified':
          summary.partiallyVerified++;
          break;
        case 'unverified':
          summary.unverified++;
          break;
        case 'contradicted':
          summary.contradicted++;
          break;
      }
    }

    summary.averageConfidence =
      findings.length > 0 ? totalConfidence / findings.length : 0;

    return summary;
  }
}

export default VerificationEngine;
