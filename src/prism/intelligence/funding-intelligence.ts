/**
 * PRISM Funding Intelligence Module
 *
 * Tracks financial relationships, sanctions connections,
 * FARA filings, and money trails in Iranian influence networks.
 *
 * Data Sources:
 * - OFAC Sanctions Lists (SDN, Sectoral)
 * - FARA Foreign Agent Registry
 * - Corporate registries
 * - Foundation/NGO filings
 * - News reports and investigations
 */

import { Entity, Relationship, entityGraph, RelationshipType, RegimeAlignment } from './entity-graph';

export interface FundingConnection {
  id: string;
  fromEntity: string; // Entity name or ID
  toEntity: string;
  type: FundingType;
  amount?: number;
  currency?: string;
  frequency: 'ONE_TIME' | 'ANNUAL' | 'MONTHLY' | 'UNKNOWN';
  startDate?: Date;
  endDate?: Date;
  active: boolean;
  verified: boolean;
  sources: FundingSource[];
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
}

export type FundingType =
  | 'DIRECT_FUNDING'      // Direct financial transfer
  | 'GRANT'               // Foundation/NGO grant
  | 'CONTRACT'            // Business contract
  | 'INVESTMENT'          // Investment/equity
  | 'LOAN'                // Loan provision
  | 'DONATION'            // Charitable donation
  | 'SPONSORSHIP'         // Event/project sponsorship
  | 'EMPLOYMENT'          // Salary/employment
  | 'CONSULTING'          // Consulting fees
  | 'SPEAKING_FEE'        // Speaking engagement fees
  | 'BOOK_DEAL'           // Publishing deal
  | 'MEDIA_APPEARANCE'    // Payment for media
  | 'TRAVEL_EXPENSE'      // Paid travel
  | 'HOUSING'             // Housing provision
  | 'LEGAL_FEES'          // Legal representation
  | 'LOBBYING_PAYMENT'    // Lobbying contract
  | 'SANCTIONS_EVASION'   // Circumventing sanctions
  | 'HAWALA'              // Informal value transfer
  | 'CRYPTOCURRENCY'      // Crypto transfers
  | 'SHELL_COMPANY'       // Through shell entities
  | 'PROXY_FUNDING';      // Indirect funding through intermediaries

export interface FundingSource {
  type: 'FARA_FILING' | 'OFAC_ACTION' | 'COURT_DOCUMENT' | 'NEWS_REPORT' |
        'IRS_990' | 'SEC_FILING' | 'LEAKED_DOCUMENT' | 'RESEARCH_PAPER' |
        'WHISTLEBLOWER' | 'GOVERNMENT_REPORT';
  name: string;
  url?: string;
  date?: Date;
  reliability: 'VERIFIED' | 'LIKELY' | 'UNVERIFIED' | 'DISPUTED';
}

export interface SanctionsCheck {
  entityName: string;
  isSanctioned: boolean;
  sanctionDetails?: {
    list: string;
    programs: string[];
    addedDate: Date;
    reason: string;
    aliases: string[];
  }[];
  relatedSanctionedEntities: string[];
  degreesOfSeparation: number; // Hops to sanctioned entity
  riskScore: number;
}

export interface FARACheck {
  entityName: string;
  isRegistered: boolean;
  registrations?: {
    registrationNumber: string;
    foreignPrincipal: string;
    country: string;
    registrationDate: Date;
    terminationDate?: Date;
    activities: string[];
    compensation?: number;
  }[];
  shouldBeRegistered: boolean; // Based on analysis
  unregisteredIndicators: string[];
}

export interface FundingAnalysis {
  subject: string;
  directFunding: FundingConnection[];
  indirectFunding: FundingConnection[];
  suspiciousPatterns: FundingPattern[];
  sanctionsCheck: SanctionsCheck;
  faraCheck: FARACheck;
  totalRiskScore: number;
  summary: string;
  redFlags: string[];
  recommendations: string[];
}

export interface FundingPattern {
  type: PatternType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string[];
  entities: string[];
}

export type PatternType =
  | 'SANCTIONS_EVASION_NETWORK'
  | 'SHELL_COMPANY_LAYERING'
  | 'ROUND_TRIP_FUNDING'
  | 'HAWALA_INDICATORS'
  | 'CRYPTO_OBFUSCATION'
  | 'PROXY_FUNDING'
  | 'FARA_VIOLATION'
  | 'UNREPORTED_FOREIGN_INCOME'
  | 'BENEFICIAL_OWNERSHIP_HIDDEN'
  | 'DUAL_USE_ORGANIZATION'
  | 'INFLUENCE_PAYMENT';

/**
 * Known suspicious funding channels
 */
const SUSPICIOUS_FUNDING_CHANNELS = [
  {
    name: 'Alavi Foundation',
    type: 'FOUNDATION',
    riskLevel: 'CRITICAL' as const,
    reason: 'Iranian government controlled, subject to forfeiture',
    sanctioned: true
  },
  {
    name: 'Bonyad Mostazafan',
    type: 'FOUNDATION',
    riskLevel: 'CRITICAL' as const,
    reason: 'IRGC-linked foundation',
    sanctioned: true
  },
  {
    name: 'Bank Melli Iran',
    type: 'BANK',
    riskLevel: 'CRITICAL' as const,
    reason: 'State bank, sanctions evasion',
    sanctioned: true
  },
  {
    name: 'Bank Saderat',
    type: 'BANK',
    riskLevel: 'CRITICAL' as const,
    reason: 'Hezbollah financing',
    sanctioned: true
  },
  {
    name: 'Mahan Air',
    type: 'BUSINESS',
    riskLevel: 'HIGH' as const,
    reason: 'IRGC transportation',
    sanctioned: true
  },
  {
    name: 'Khatam al-Anbiya',
    type: 'BUSINESS',
    riskLevel: 'CRITICAL' as const,
    reason: 'IRGC construction arm',
    sanctioned: true
  }
];

/**
 * Shell company indicators
 */
const SHELL_COMPANY_INDICATORS = [
  'Registered in UAE Free Zones',
  'Registered in Turkey',
  'Malaysian front company',
  'Hong Kong trading company',
  'No physical office presence',
  'Single director with multiple companies',
  'Recent incorporation before major contract',
  'No employees listed',
  'Minimal public presence',
  'Name similar to sanctioned entity'
];

/**
 * Funding Intelligence Analyzer
 */
export class FundingIntelligence {
  private fundingConnections: Map<string, FundingConnection[]> = new Map();

  constructor() {
    this.initializeKnownFunding();
  }

  private initializeKnownFunding(): void {
    // Initialize with known funding relationships from investigations
  }

  /**
   * Analyze funding for a subject
   */
  async analyzeFunding(subject: string): Promise<FundingAnalysis> {
    const directFunding = await this.findDirectFunding(subject);
    const indirectFunding = await this.findIndirectFunding(subject);
    const patterns = this.detectFundingPatterns(subject, [...directFunding, ...indirectFunding]);
    const sanctionsCheck = await this.checkSanctions(subject);
    const faraCheck = await this.checkFARA(subject);

    const redFlags = this.identifyRedFlags(
      subject,
      directFunding,
      indirectFunding,
      patterns,
      sanctionsCheck,
      faraCheck
    );

    const totalRiskScore = this.calculateTotalRisk(
      directFunding,
      indirectFunding,
      patterns,
      sanctionsCheck,
      faraCheck
    );

    return {
      subject,
      directFunding,
      indirectFunding,
      suspiciousPatterns: patterns,
      sanctionsCheck,
      faraCheck,
      totalRiskScore,
      summary: this.generateSummary(subject, totalRiskScore, redFlags),
      redFlags,
      recommendations: this.generateRecommendations(redFlags, totalRiskScore)
    };
  }

  /**
   * Find direct funding connections
   */
  private async findDirectFunding(subject: string): Promise<FundingConnection[]> {
    const connections: FundingConnection[] = [];

    // Check entity graph for funding relationships
    const entity = entityGraph.findEntityByName(subject);
    if (entity) {
      const relationships = entityGraph.getEntityRelationships(entity.id);

      for (const rel of relationships) {
        if (this.isFundingRelationship(rel.type)) {
          const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
          const otherEntity = entityGraph.getEntity(otherId);

          if (otherEntity) {
            connections.push({
              id: rel.id,
              fromEntity: rel.sourceId === entity.id ? otherEntity.name : entity.name,
              toEntity: rel.sourceId === entity.id ? entity.name : otherEntity.name,
              type: this.relationshipToFundingType(rel.type),
              amount: rel.financialAmount,
              currency: rel.financialCurrency,
              frequency: rel.financialFrequency || 'UNKNOWN',
              active: rel.active,
              verified: rel.verified,
              sources: rel.sources.map(s => ({
                type: 'NEWS_REPORT' as const,
                name: s,
                reliability: 'UNVERIFIED' as const
              })),
              riskLevel: this.calculateConnectionRisk(otherEntity),
              description: rel.description
            });
          }
        }
      }
    }

    // Check against suspicious funding channels
    for (const channel of SUSPICIOUS_FUNDING_CHANNELS) {
      const normalizedSubject = subject.toLowerCase();
      const normalizedChannel = channel.name.toLowerCase();

      // This would be enhanced with actual data lookups
      if (normalizedSubject.includes(normalizedChannel) ||
          normalizedChannel.includes(normalizedSubject)) {
        connections.push({
          id: `suspicious-${channel.name}`,
          fromEntity: channel.name,
          toEntity: subject,
          type: 'DIRECT_FUNDING',
          frequency: 'UNKNOWN',
          active: true,
          verified: false,
          sources: [{
            type: 'RESEARCH_PAPER',
            name: 'Sanctions database',
            reliability: 'VERIFIED'
          }],
          riskLevel: channel.riskLevel,
          description: channel.reason
        });
      }
    }

    return connections;
  }

  /**
   * Find indirect funding (through intermediaries)
   */
  private async findIndirectFunding(subject: string): Promise<FundingConnection[]> {
    const connections: FundingConnection[] = [];

    const entity = entityGraph.findEntityByName(subject);
    if (!entity) return connections;

    // Find paths to sanctioned/high-risk entities
    const regimePaths = entityGraph.findAllRegimeConnections(entity.id, 3);

    for (const path of regimePaths) {
      if (path.totalHops > 1) {
        // This is an indirect connection
        const intermediaries = path.path
          .slice(0, -1)
          .map(p => p.toEntity.name)
          .join(' → ');

        connections.push({
          id: `indirect-${path.endEntity.id}`,
          fromEntity: path.endEntity.name,
          toEntity: subject,
          type: 'PROXY_FUNDING',
          frequency: 'UNKNOWN',
          active: true,
          verified: false,
          sources: [{
            type: 'RESEARCH_PAPER',
            name: 'Network analysis',
            reliability: 'LIKELY'
          }],
          riskLevel: path.totalHops === 2 ? 'HIGH' : 'MEDIUM',
          description: `Indirect connection through: ${intermediaries} (${path.totalHops} hops)`
        });
      }
    }

    return connections;
  }

  /**
   * Check OFAC sanctions status
   */
  async checkSanctions(subject: string): Promise<SanctionsCheck> {
    // Check if directly sanctioned
    const entity = entityGraph.findEntityByName(subject);
    const isSanctioned = entity?.sanctioned || false;
    const sanctionDetails = entity?.sanctionDetails?.map(s => ({
      list: s.listName,
      programs: s.programCodes,
      addedDate: s.dateAdded,
      reason: s.reason,
      aliases: entity.aliases
    }));

    // Find related sanctioned entities
    const relatedSanctioned: string[] = [];
    let minDegrees = Infinity;

    if (entity) {
      const path = entityGraph.findShortestPathToRegime(entity.id, 6);
      if (path && path.endEntity.sanctioned) {
        relatedSanctioned.push(path.endEntity.name);
        minDegrees = path.totalHops;
      }

      // Check all connections
      const connections = entityGraph.getConnectedEntities(entity.id);
      for (const conn of connections) {
        if (conn.sanctioned && !relatedSanctioned.includes(conn.name)) {
          relatedSanctioned.push(conn.name);
          minDegrees = Math.min(minDegrees, 1);
        }
      }
    }

    // Calculate risk score
    let riskScore = 0;
    if (isSanctioned) riskScore = 100;
    else if (minDegrees === 1) riskScore = 75;
    else if (minDegrees === 2) riskScore = 50;
    else if (minDegrees <= 4) riskScore = 25;

    return {
      entityName: subject,
      isSanctioned,
      sanctionDetails,
      relatedSanctionedEntities: relatedSanctioned,
      degreesOfSeparation: minDegrees === Infinity ? -1 : minDegrees,
      riskScore
    };
  }

  /**
   * Check FARA registration status
   */
  async checkFARA(subject: string): Promise<FARACheck> {
    // This would integrate with actual FARA database
    // For now, analyze indicators of whether registration should be required

    const unregisteredIndicators: string[] = [];

    const entity = entityGraph.findEntityByName(subject);
    if (entity) {
      // Check for foreign government connections
      if (entity.regimeAlignment === 'CONFIRMED_REGIME' ||
          entity.regimeAlignment === 'KNOWN_PROXY') {
        unregisteredIndicators.push('Direct connection to Iranian government');
      }

      // Check for lobbying relationships
      const relationships = entityGraph.getEntityRelationships(entity.id);
      for (const rel of relationships) {
        if (rel.type === 'LOBBIED_FOR' || rel.type === 'REGISTERED_AGENT_FOR') {
          const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
          const otherEntity = entityGraph.getEntity(otherId);
          if (otherEntity?.country === 'Iran') {
            unregisteredIndicators.push(`Lobbying activity for Iranian entity: ${otherEntity.name}`);
          }
        }
      }

      // Check for media work
      for (const rel of relationships) {
        if (rel.type === 'APPEARED_ON') {
          const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
          const otherEntity = entityGraph.getEntity(otherId);
          if (otherEntity?.regimeAlignment === 'CONFIRMED_REGIME' &&
              otherEntity?.type === 'MEDIA_OUTLET') {
            unregisteredIndicators.push(`Appeared on regime media: ${otherEntity.name}`);
          }
        }
      }
    }

    const shouldBeRegistered = unregisteredIndicators.length >= 2;

    return {
      entityName: subject,
      isRegistered: entity?.faraRegistered || false,
      registrations: entity?.faraDetails?.map(f => ({
        registrationNumber: f.registrationNumber,
        foreignPrincipal: f.foreignPrincipal,
        country: 'Iran',
        registrationDate: f.registrationDate,
        terminationDate: f.terminationDate,
        activities: f.activities
      })),
      shouldBeRegistered,
      unregisteredIndicators
    };
  }

  /**
   * Detect suspicious funding patterns
   */
  private detectFundingPatterns(
    subject: string,
    connections: FundingConnection[]
  ): FundingPattern[] {
    const patterns: FundingPattern[] = [];

    // Check for shell company layering
    const shellIndicators = connections.filter(c =>
      SHELL_COMPANY_INDICATORS.some(ind =>
        c.description?.toLowerCase().includes(ind.toLowerCase())
      )
    );

    if (shellIndicators.length > 0) {
      patterns.push({
        type: 'SHELL_COMPANY_LAYERING',
        severity: 'HIGH',
        description: 'Multiple shell company indicators detected in funding chain',
        evidence: shellIndicators.map(s => s.description || s.fromEntity),
        entities: shellIndicators.map(s => s.fromEntity)
      });
    }

    // Check for sanctions evasion indicators
    const criticalConnections = connections.filter(c => c.riskLevel === 'CRITICAL');
    if (criticalConnections.length > 0) {
      patterns.push({
        type: 'SANCTIONS_EVASION_NETWORK',
        severity: 'CRITICAL',
        description: 'Connections to sanctioned entities detected',
        evidence: criticalConnections.map(c => `${c.fromEntity}: ${c.description || 'Sanctioned entity'}`),
        entities: criticalConnections.map(c => c.fromEntity)
      });
    }

    // Check for proxy funding
    const proxyConnections = connections.filter(c => c.type === 'PROXY_FUNDING');
    if (proxyConnections.length > 0) {
      patterns.push({
        type: 'PROXY_FUNDING',
        severity: 'HIGH',
        description: 'Indirect funding through intermediary organizations',
        evidence: proxyConnections.map(c => c.description || ''),
        entities: proxyConnections.map(c => c.fromEntity)
      });
    }

    // Check for FARA violations
    const entity = entityGraph.findEntityByName(subject);
    if (entity) {
      const relationships = entityGraph.getEntityRelationships(entity.id);
      const foreignMedia = relationships.filter(r => {
        if (r.type !== 'APPEARED_ON') return false;
        const otherId = r.sourceId === entity.id ? r.targetId : r.sourceId;
        const otherEntity = entityGraph.getEntity(otherId);
        return otherEntity?.regimeAlignment === 'CONFIRMED_REGIME';
      });

      if (foreignMedia.length > 0 && !entity.faraRegistered) {
        patterns.push({
          type: 'FARA_VIOLATION',
          severity: 'HIGH',
          description: 'Potential FARA violation: appearances on foreign state media without registration',
          evidence: foreignMedia.map(r => {
            const otherId = r.sourceId === entity.id ? r.targetId : r.sourceId;
            return entityGraph.getEntity(otherId)?.name || 'Unknown media';
          }),
          entities: []
        });
      }
    }

    return patterns;
  }

  /**
   * Identify red flags
   */
  private identifyRedFlags(
    subject: string,
    directFunding: FundingConnection[],
    indirectFunding: FundingConnection[],
    patterns: FundingPattern[],
    sanctionsCheck: SanctionsCheck,
    faraCheck: FARACheck
  ): string[] {
    const redFlags: string[] = [];

    // Sanctions-related
    if (sanctionsCheck.isSanctioned) {
      redFlags.push(`🚨 CRITICAL: ${subject} is directly sanctioned`);
    }

    if (sanctionsCheck.degreesOfSeparation === 1) {
      redFlags.push(`⚠️ HIGH: Direct connection to sanctioned entity (${sanctionsCheck.relatedSanctionedEntities.join(', ')})`);
    } else if (sanctionsCheck.degreesOfSeparation === 2) {
      redFlags.push(`⚠️ MEDIUM: 2-hop connection to sanctioned entity`);
    }

    // FARA-related
    if (faraCheck.shouldBeRegistered && !faraCheck.isRegistered) {
      redFlags.push(`⚠️ HIGH: Potential FARA violation - foreign agent activities without registration`);
      for (const indicator of faraCheck.unregisteredIndicators) {
        redFlags.push(`  - ${indicator}`);
      }
    }

    // Critical funding
    const criticalFunding = [...directFunding, ...indirectFunding].filter(
      f => f.riskLevel === 'CRITICAL'
    );
    for (const funding of criticalFunding) {
      redFlags.push(`🚨 CRITICAL: Funding connection to ${funding.fromEntity}`);
    }

    // Pattern-based
    for (const pattern of patterns) {
      if (pattern.severity === 'CRITICAL') {
        redFlags.push(`🚨 CRITICAL: ${pattern.description}`);
      } else if (pattern.severity === 'HIGH') {
        redFlags.push(`⚠️ HIGH: ${pattern.description}`);
      }
    }

    return redFlags;
  }

  /**
   * Calculate total risk score
   */
  private calculateTotalRisk(
    directFunding: FundingConnection[],
    indirectFunding: FundingConnection[],
    patterns: FundingPattern[],
    sanctionsCheck: SanctionsCheck,
    faraCheck: FARACheck
  ): number {
    let score = 0;

    // Sanctions weight (40% max)
    score += sanctionsCheck.riskScore * 0.4;

    // Direct funding (30% max)
    const directRisk = directFunding.reduce((sum, f) => {
      const weights = { CRITICAL: 30, HIGH: 20, MEDIUM: 10, LOW: 5 };
      return sum + weights[f.riskLevel];
    }, 0);
    score += Math.min(30, directRisk);

    // Pattern weight (20% max)
    const patternRisk = patterns.reduce((sum, p) => {
      const weights = { CRITICAL: 20, HIGH: 15, MEDIUM: 10, LOW: 5 };
      return sum + weights[p.severity];
    }, 0);
    score += Math.min(20, patternRisk);

    // FARA weight (10% max)
    if (faraCheck.shouldBeRegistered && !faraCheck.isRegistered) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Generate summary
   */
  private generateSummary(subject: string, riskScore: number, redFlags: string[]): string {
    if (riskScore >= 80) {
      return `CRITICAL RISK: ${subject} has significant financial connections to Iranian regime entities. ` +
             `${redFlags.length} red flags identified requiring immediate attention.`;
    } else if (riskScore >= 60) {
      return `HIGH RISK: ${subject} has concerning financial patterns suggesting potential regime connections. ` +
             `${redFlags.length} red flags warrant further investigation.`;
    } else if (riskScore >= 40) {
      return `MODERATE RISK: ${subject} has some financial connections that merit monitoring. ` +
             `${redFlags.length} indicators identified.`;
    } else if (riskScore >= 20) {
      return `LOW RISK: ${subject} has limited concerning financial connections. ` +
             `Minor indicators present but no major red flags.`;
    }
    return `MINIMAL RISK: No significant financial connections to Iranian regime entities detected.`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(redFlags: string[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push('Conduct comprehensive due diligence investigation');
      recommendations.push('Review all financial transactions for sanctions compliance');
      recommendations.push('Consult with OFAC compliance counsel');
      recommendations.push('Consider filing Suspicious Activity Report (SAR)');
    } else if (riskScore >= 60) {
      recommendations.push('Conduct enhanced due diligence');
      recommendations.push('Review business relationships for regime connections');
      recommendations.push('Monitor ongoing activities for changes');
    } else if (riskScore >= 40) {
      recommendations.push('Perform standard due diligence');
      recommendations.push('Periodic monitoring recommended');
    }

    if (redFlags.some(f => f.includes('FARA'))) {
      recommendations.push('Review FARA registration requirements with legal counsel');
    }

    return recommendations;
  }

  // Helper methods

  private isFundingRelationship(type: RelationshipType): boolean {
    const fundingTypes: RelationshipType[] = [
      'FUNDED_BY', 'FUNDS', 'RECEIVED_GRANT_FROM', 'EMPLOYED_BY',
      'CONSULTANT_FOR', 'LOBBIED_FOR', 'BUSINESS_PARTNER'
    ];
    return fundingTypes.includes(type);
  }

  private relationshipToFundingType(type: RelationshipType): FundingType {
    const mapping: Partial<Record<RelationshipType, FundingType>> = {
      'FUNDED_BY': 'DIRECT_FUNDING',
      'FUNDS': 'DIRECT_FUNDING',
      'RECEIVED_GRANT_FROM': 'GRANT',
      'EMPLOYED_BY': 'EMPLOYMENT',
      'CONSULTANT_FOR': 'CONSULTING',
      'LOBBIED_FOR': 'LOBBYING_PAYMENT',
      'BUSINESS_PARTNER': 'CONTRACT'
    };
    return mapping[type] || 'DIRECT_FUNDING';
  }

  private calculateConnectionRisk(entity: Entity): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (entity.sanctioned) return 'CRITICAL';
    if (entity.regimeAlignment === 'CONFIRMED_REGIME') return 'CRITICAL';
    if (entity.regimeAlignment === 'KNOWN_PROXY') return 'HIGH';
    if (entity.regimeAlignment === 'SUSPECTED_PROXY') return 'HIGH';
    if (entity.regimeAlignment === 'REGIME_FRIENDLY') return 'MEDIUM';
    return 'LOW';
  }
}

export const fundingIntelligence = new FundingIntelligence();
