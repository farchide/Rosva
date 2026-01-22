/**
 * PRISM Influence Network Analyzer
 *
 * Comprehensive analysis of influence networks including:
 * - Multi-hop path finding to regime entities
 * - Network centrality analysis
 * - Influence operation detection
 * - Coordinated behavior analysis
 * - Temporal pattern analysis
 */

import {
  Entity,
  Relationship,
  entityGraph,
  InfluencePath,
  ClusterAnalysis,
  RegimeAlignment,
  EntityType
} from './entity-graph';
import { analyzeNarrativeAlignment, REGIME_NARRATIVES } from './proxy-database';

export interface InfluenceAnalysis {
  subject: string;
  subjectEntity?: Entity;

  // Path Analysis
  shortestPathToRegime: InfluencePath | null;
  allRegimePaths: InfluencePath[];
  criticalPaths: InfluencePath[];  // Paths through known proxies

  // Network Position
  networkCentrality: NetworkCentrality;
  clusterMembership: ClusterAnalysis[];
  bridgeNodes: Entity[];  // Entities connecting different clusters

  // Influence Indicators
  influenceIndicators: InfluenceIndicator[];
  coordinatedBehavior: CoordinatedBehaviorAnalysis;
  temporalPatterns: TemporalPattern[];

  // Risk Assessment
  influenceRiskScore: number;
  networkRiskScore: number;
  overallRiskScore: number;

  // Summary
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface NetworkCentrality {
  degreeCentrality: number;      // Number of connections
  closenessCentrality: number;   // Average distance to all nodes
  betweennessCentrality: number; // How often node is on shortest paths
  eigenvectorCentrality: number; // Connections to well-connected nodes
  regimeProximity: number;       // Closeness specifically to regime entities
  interpretation: string;
}

export interface InfluenceIndicator {
  type: InfluenceIndicatorType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string[];
  timestamp?: Date;
  confidence: number;
}

export type InfluenceIndicatorType =
  | 'REGIME_MEDIA_APPEARANCE'
  | 'PROXY_ORG_AFFILIATION'
  | 'LOBBYING_ACTIVITY'
  | 'NARRATIVE_AMPLIFICATION'
  | 'CONFERENCE_ATTENDANCE'
  | 'FINANCIAL_RELATIONSHIP'
  | 'FAMILY_CONNECTION'
  | 'BUSINESS_PARTNERSHIP'
  | 'COORDINATED_POSTING'
  | 'TALKING_POINT_ALIGNMENT'
  | 'SANCTIONS_OPPOSITION'
  | 'ACCESS_JOURNALISM'
  | 'THINK_TANK_AFFILIATION'
  | 'ACADEMIC_COLLABORATION';

export interface CoordinatedBehaviorAnalysis {
  detected: boolean;
  confidence: number;
  patterns: {
    type: string;
    description: string;
    involvedEntities: string[];
    timeWindow?: string;
    evidence: string[];
  }[];
  amplificationNetwork: string[];
  suspectedInfluenceOperation: boolean;
}

export interface TemporalPattern {
  type: 'STANCE_SHIFT' | 'ACTIVITY_SPIKE' | 'NETWORK_EXPANSION' | 'COORDINATED_ACTION';
  startDate: Date;
  endDate?: Date;
  description: string;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedEvents: string[];
}

/**
 * Influence Network Analyzer
 */
export class InfluenceAnalyzer {
  /**
   * Perform comprehensive influence analysis
   */
  async analyzeInfluence(subject: string): Promise<InfluenceAnalysis> {
    const entity = entityGraph.findEntityByName(subject);

    // Path analysis
    const shortestPath = entity
      ? entityGraph.findShortestPathToRegime(entity.id, 6)
      : null;

    const allPaths = entity
      ? entityGraph.findAllRegimeConnections(entity.id, 4)
      : [];

    const criticalPaths = this.identifyCriticalPaths(allPaths);

    // Network analysis
    const centrality = this.calculateCentrality(entity);
    const clusters = entityGraph.detectClusters();
    const memberClusters = entity
      ? clusters.filter(c => c.entities.some(e => e.id === entity.id))
      : [];
    const bridgeNodes = this.identifyBridgeNodes(entity);

    // Influence indicators
    const indicators = this.detectInfluenceIndicators(entity, allPaths);
    const coordinatedBehavior = this.analyzeCoordinatedBehavior(entity);
    const temporalPatterns = this.detectTemporalPatterns(entity);

    // Risk scores
    const influenceRiskScore = this.calculateInfluenceRisk(indicators);
    const networkRiskScore = this.calculateNetworkRisk(centrality, allPaths);
    const overallRiskScore = Math.round((influenceRiskScore + networkRiskScore) / 2);

    // Summary
    const keyFindings = this.generateKeyFindings(
      shortestPath,
      criticalPaths,
      indicators,
      coordinatedBehavior
    );

    return {
      subject,
      subjectEntity: entity,
      shortestPathToRegime: shortestPath,
      allRegimePaths: allPaths,
      criticalPaths,
      networkCentrality: centrality,
      clusterMembership: memberClusters,
      bridgeNodes,
      influenceIndicators: indicators,
      coordinatedBehavior,
      temporalPatterns,
      influenceRiskScore,
      networkRiskScore,
      overallRiskScore,
      summary: this.generateSummary(subject, overallRiskScore, keyFindings),
      keyFindings,
      recommendations: this.generateRecommendations(overallRiskScore, indicators)
    };
  }

  /**
   * Identify critical paths (through known proxies)
   */
  private identifyCriticalPaths(paths: InfluencePath[]): InfluencePath[] {
    return paths.filter(path => {
      // Check if any node in the path is a known proxy
      for (const connection of path.path) {
        if (
          connection.toEntity.regimeAlignment === 'KNOWN_PROXY' ||
          connection.toEntity.regimeAlignment === 'SUSPECTED_PROXY'
        ) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Calculate network centrality metrics
   */
  private calculateCentrality(entity?: Entity): NetworkCentrality {
    if (!entity) {
      return {
        degreeCentrality: 0,
        closenessCentrality: 0,
        betweennessCentrality: 0,
        eigenvectorCentrality: 0,
        regimeProximity: 0,
        interpretation: 'Entity not found in network'
      };
    }

    // Degree centrality: number of connections
    const connections = entityGraph.getConnectedEntities(entity.id);
    const degreeCentrality = connections.length;

    // Closeness to regime entities
    const shortestPath = entityGraph.findShortestPathToRegime(entity.id, 6);
    const regimeProximity = shortestPath
      ? Math.max(0, 100 - (shortestPath.totalHops * 20))
      : 0;

    // Simplified betweenness (how many regime paths go through this entity)
    let betweennessCentrality = 0;
    for (const conn of connections) {
      const connPaths = entityGraph.findAllRegimeConnections(conn.id, 3);
      if (connPaths.some(p => p.path.some(c =>
        c.fromEntity.id === entity.id || c.toEntity.id === entity.id
      ))) {
        betweennessCentrality += 10;
      }
    }

    // Eigenvector: connections to well-connected entities
    const eigenvectorCentrality = connections.reduce((sum, conn) => {
      const connConnections = entityGraph.getConnectedEntities(conn.id);
      return sum + connConnections.length;
    }, 0) / Math.max(1, connections.length);

    // Interpretation
    let interpretation = '';
    if (regimeProximity >= 80) {
      interpretation = 'Very close to regime entities - likely direct involvement';
    } else if (regimeProximity >= 60) {
      interpretation = 'Significant proximity to regime network';
    } else if (regimeProximity >= 40) {
      interpretation = 'Moderate network proximity - indirect connections';
    } else if (regimeProximity > 0) {
      interpretation = 'Distant from regime core - peripheral connection';
    } else {
      interpretation = 'No detected regime network connections';
    }

    return {
      degreeCentrality,
      closenessCentrality: 50, // Simplified
      betweennessCentrality: Math.min(100, betweennessCentrality),
      eigenvectorCentrality: Math.min(100, eigenvectorCentrality * 5),
      regimeProximity,
      interpretation
    };
  }

  /**
   * Identify bridge nodes (connect different clusters)
   */
  private identifyBridgeNodes(entity?: Entity): Entity[] {
    if (!entity) return [];

    const bridges: Entity[] = [];
    const connections = entityGraph.getConnectedEntities(entity.id);

    for (const conn of connections) {
      // Check if this connection links to entities with different alignments
      const connConnections = entityGraph.getConnectedEntities(conn.id);

      let hasRegimeConnection = false;
      let hasOppositionConnection = false;

      for (const cc of connConnections) {
        if (cc.regimeAlignment === 'CONFIRMED_REGIME' ||
            cc.regimeAlignment === 'KNOWN_PROXY') {
          hasRegimeConnection = true;
        }
        if (cc.regimeAlignment === 'CONFIRMED_OPPOSITION' ||
            cc.regimeAlignment === 'OPPOSITION_FRIENDLY') {
          hasOppositionConnection = true;
        }
      }

      // Bridge node connects both sides
      if (hasRegimeConnection && hasOppositionConnection) {
        bridges.push(conn);
      }
    }

    return bridges;
  }

  /**
   * Detect influence indicators
   */
  private detectInfluenceIndicators(
    entity?: Entity,
    paths?: InfluencePath[]
  ): InfluenceIndicator[] {
    const indicators: InfluenceIndicator[] = [];

    if (!entity) return indicators;

    const relationships = entityGraph.getEntityRelationships(entity.id);

    for (const rel of relationships) {
      const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
      const otherEntity = entityGraph.getEntity(otherId);

      if (!otherEntity) continue;

      // Regime media appearance
      if (rel.type === 'APPEARED_ON' &&
          otherEntity.type === 'MEDIA_OUTLET' &&
          otherEntity.regimeAlignment === 'CONFIRMED_REGIME') {
        indicators.push({
          type: 'REGIME_MEDIA_APPEARANCE',
          severity: 'CRITICAL',
          description: `Appeared on regime state media: ${otherEntity.name}`,
          evidence: [otherEntity.name],
          confidence: 90
        });
      }

      // Proxy organization affiliation
      if ((rel.type === 'MEMBER_OF' || rel.type === 'EMPLOYED_BY' ||
           rel.type === 'BOARD_MEMBER') &&
          (otherEntity.regimeAlignment === 'KNOWN_PROXY' ||
           otherEntity.regimeAlignment === 'SUSPECTED_PROXY')) {
        indicators.push({
          type: 'PROXY_ORG_AFFILIATION',
          severity: 'HIGH',
          description: `Affiliated with suspected proxy organization: ${otherEntity.name}`,
          evidence: otherEntity.alignmentEvidence,
          confidence: otherEntity.alignmentConfidence
        });
      }

      // Lobbying activity
      if (rel.type === 'LOBBIED_FOR' || rel.type === 'REGISTERED_AGENT_FOR') {
        if (otherEntity.country === 'Iran' ||
            otherEntity.regimeAlignment === 'CONFIRMED_REGIME') {
          indicators.push({
            type: 'LOBBYING_ACTIVITY',
            severity: 'CRITICAL',
            description: `Lobbying activity for Iranian interest: ${otherEntity.name}`,
            evidence: [rel.description || ''],
            confidence: 85
          });
        }
      }

      // Think tank affiliation
      if ((rel.type === 'EMPLOYED_BY' || rel.type === 'MEMBER_OF') &&
          otherEntity.type === 'THINK_TANK' &&
          otherEntity.regimeAlignment === 'REGIME_FRIENDLY') {
        indicators.push({
          type: 'THINK_TANK_AFFILIATION',
          severity: 'MEDIUM',
          description: `Affiliated with Iran-friendly think tank: ${otherEntity.name}`,
          evidence: otherEntity.alignmentEvidence,
          confidence: 60
        });
      }

      // Financial relationship
      if (rel.type === 'FUNDED_BY' || rel.type === 'RECEIVED_GRANT_FROM') {
        if (otherEntity.regimeAlignment === 'CONFIRMED_REGIME' ||
            otherEntity.regimeAlignment === 'KNOWN_PROXY') {
          indicators.push({
            type: 'FINANCIAL_RELATIONSHIP',
            severity: 'CRITICAL',
            description: `Received funding from regime-linked entity: ${otherEntity.name}`,
            evidence: [rel.description || ''],
            confidence: 80
          });
        }
      }

      // Conference attendance
      if (rel.type === 'SPOKE_AT' || rel.type === 'ATTENDED') {
        if (otherEntity.regimeAlignment === 'CONFIRMED_REGIME') {
          indicators.push({
            type: 'CONFERENCE_ATTENDANCE',
            severity: 'HIGH',
            description: `Attended regime-organized event: ${otherEntity.name}`,
            evidence: [],
            confidence: 75
          });
        }
      }
    }

    // Check narrative alignment
    if (entity.description) {
      const narrativeAnalysis = analyzeNarrativeAlignment(entity.description);
      if (narrativeAnalysis.proRegimeScore > 30) {
        indicators.push({
          type: 'TALKING_POINT_ALIGNMENT',
          severity: narrativeAnalysis.proRegimeScore > 60 ? 'HIGH' : 'MEDIUM',
          description: 'Uses regime-aligned narratives and talking points',
          evidence: [
            ...narrativeAnalysis.detectedHashtags.filter(h => h.alignment === 'REGIME').map(h => h.tag),
            ...narrativeAnalysis.detectedPhrases.filter(p => p.alignment === 'REGIME').map(p => p.phrase)
          ],
          confidence: narrativeAnalysis.proRegimeScore
        });
      }
    }

    // Check for sanctions opposition advocacy
    // (This would be enhanced with content analysis)
    if (entity.alignmentEvidence?.some(e =>
      e.toLowerCase().includes('sanction') ||
      e.toLowerCase().includes('jcpoa')
    )) {
      indicators.push({
        type: 'SANCTIONS_OPPOSITION',
        severity: 'MEDIUM',
        description: 'Advocates against Iran sanctions or for JCPOA',
        evidence: entity.alignmentEvidence.filter(e =>
          e.toLowerCase().includes('sanction') ||
          e.toLowerCase().includes('jcpoa')
        ),
        confidence: 50
      });
    }

    return indicators;
  }

  /**
   * Analyze coordinated behavior
   */
  private analyzeCoordinatedBehavior(entity?: Entity): CoordinatedBehaviorAnalysis {
    if (!entity) {
      return {
        detected: false,
        confidence: 0,
        patterns: [],
        amplificationNetwork: [],
        suspectedInfluenceOperation: false
      };
    }

    const patterns: CoordinatedBehaviorAnalysis['patterns'] = [];
    const amplificationNetwork: string[] = [];

    // Check for network amplification patterns
    const connections = entityGraph.getConnectedEntities(entity.id);
    const regimeConnections = connections.filter(c =>
      c.regimeAlignment === 'CONFIRMED_REGIME' ||
      c.regimeAlignment === 'KNOWN_PROXY' ||
      c.regimeAlignment === 'REGIME_FRIENDLY'
    );

    if (regimeConnections.length >= 3) {
      patterns.push({
        type: 'AMPLIFICATION_NETWORK',
        description: 'Part of regime-aligned amplification network',
        involvedEntities: regimeConnections.map(c => c.name),
        evidence: ['Multiple connections to regime-aligned entities']
      });

      amplificationNetwork.push(...regimeConnections.map(c => c.name));
    }

    // Check for media coordination
    const mediaConnections = connections.filter(c => c.type === 'MEDIA_OUTLET');
    const regimeMedia = mediaConnections.filter(c =>
      c.regimeAlignment === 'CONFIRMED_REGIME'
    );

    if (regimeMedia.length >= 2) {
      patterns.push({
        type: 'MEDIA_COORDINATION',
        description: 'Appearances across multiple regime media outlets',
        involvedEntities: regimeMedia.map(m => m.name),
        evidence: regimeMedia.map(m => `Appeared on ${m.name}`)
      });
    }

    const suspectedInfluenceOperation =
      patterns.length >= 2 ||
      (regimeConnections.length >= 5 && entity.regimeAlignment !== 'CONFIRMED_REGIME');

    return {
      detected: patterns.length > 0,
      confidence: Math.min(100, patterns.length * 25 + regimeConnections.length * 10),
      patterns,
      amplificationNetwork,
      suspectedInfluenceOperation
    };
  }

  /**
   * Detect temporal patterns
   */
  private detectTemporalPatterns(entity?: Entity): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];

    // This would be enhanced with actual temporal data
    // For now, detect based on entity metadata

    if (entity?.activeStatus === 'ACTIVE' && entity.foundedYear) {
      const yearsActive = new Date().getFullYear() - entity.foundedYear;

      if (yearsActive <= 5) {
        patterns.push({
          type: 'NETWORK_EXPANSION',
          startDate: new Date(entity.foundedYear, 0, 1),
          description: 'Recently established entity in the network',
          significance: 'MEDIUM',
          relatedEvents: []
        });
      }
    }

    return patterns;
  }

  /**
   * Calculate influence risk score
   */
  private calculateInfluenceRisk(indicators: InfluenceIndicator[]): number {
    let score = 0;

    for (const indicator of indicators) {
      const severityWeights = {
        CRITICAL: 25,
        HIGH: 15,
        MEDIUM: 8,
        LOW: 3
      };

      score += severityWeights[indicator.severity] * (indicator.confidence / 100);
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate network risk score
   */
  private calculateNetworkRisk(
    centrality: NetworkCentrality,
    paths: InfluencePath[]
  ): number {
    let score = 0;

    // Regime proximity (40% weight)
    score += centrality.regimeProximity * 0.4;

    // Path-based risk (40% weight)
    if (paths.length > 0) {
      const shortestHops = Math.min(...paths.map(p => p.totalHops));
      const pathRisk = Math.max(0, 100 - (shortestHops * 25));
      score += pathRisk * 0.4;
    }

    // Betweenness (20% weight) - being on paths to regime
    score += centrality.betweennessCentrality * 0.2;

    return Math.min(100, Math.round(score));
  }

  /**
   * Generate key findings
   */
  private generateKeyFindings(
    shortestPath: InfluencePath | null,
    criticalPaths: InfluencePath[],
    indicators: InfluenceIndicator[],
    coordinated: CoordinatedBehaviorAnalysis
  ): string[] {
    const findings: string[] = [];

    // Shortest path finding
    if (shortestPath) {
      findings.push(
        `${shortestPath.totalHops}-hop connection to ${shortestPath.endEntity.name} (${shortestPath.endEntity.regimeAlignment})`
      );
    }

    // Critical path findings
    if (criticalPaths.length > 0) {
      findings.push(
        `${criticalPaths.length} paths through known proxy organizations`
      );
    }

    // Critical indicators
    const criticalIndicators = indicators.filter(i => i.severity === 'CRITICAL');
    for (const indicator of criticalIndicators) {
      findings.push(`CRITICAL: ${indicator.description}`);
    }

    // Coordinated behavior
    if (coordinated.suspectedInfluenceOperation) {
      findings.push('SUSPECTED INFLUENCE OPERATION: Coordinated behavior detected');
    }

    // High severity indicators
    const highIndicators = indicators.filter(i => i.severity === 'HIGH');
    if (highIndicators.length > 0) {
      findings.push(`${highIndicators.length} high-severity influence indicators detected`);
    }

    return findings;
  }

  /**
   * Generate summary
   */
  private generateSummary(
    subject: string,
    riskScore: number,
    findings: string[]
  ): string {
    if (riskScore >= 80) {
      return `CRITICAL: ${subject} shows extensive integration into Iranian regime influence networks. ` +
             `${findings.length} significant findings indicate active participation in regime-aligned activities.`;
    } else if (riskScore >= 60) {
      return `HIGH RISK: ${subject} has substantial connections to Iranian regime influence infrastructure. ` +
             `Network analysis reveals concerning proximity to known proxies and regime entities.`;
    } else if (riskScore >= 40) {
      return `MODERATE RISK: ${subject} has detectable connections to Iranian regime-adjacent networks. ` +
             `While not directly implicated, relationship patterns warrant monitoring.`;
    } else if (riskScore >= 20) {
      return `LOW RISK: ${subject} has limited connections to Iranian influence networks. ` +
             `Minor indicators present but no significant regime integration detected.`;
    }

    return `MINIMAL RISK: ${subject} shows no significant connection to Iranian regime influence networks.`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    riskScore: number,
    indicators: InfluenceIndicator[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push('Treat as potential foreign influence agent');
      recommendations.push('Cross-reference with FARA and lobbying disclosures');
      recommendations.push('Monitor all public communications for regime narratives');
      recommendations.push('Investigate financial relationships thoroughly');
    } else if (riskScore >= 60) {
      recommendations.push('Conduct enhanced monitoring');
      recommendations.push('Review organizational affiliations');
      recommendations.push('Track public statements on Iran policy');
    } else if (riskScore >= 40) {
      recommendations.push('Periodic monitoring recommended');
      recommendations.push('Note for future reference');
    }

    // Specific indicator-based recommendations
    if (indicators.some(i => i.type === 'REGIME_MEDIA_APPEARANCE')) {
      recommendations.push('Document all regime media appearances');
    }

    if (indicators.some(i => i.type === 'LOBBYING_ACTIVITY')) {
      recommendations.push('Verify FARA registration status');
    }

    if (indicators.some(i => i.type === 'FINANCIAL_RELATIONSHIP')) {
      recommendations.push('Conduct financial due diligence');
    }

    return recommendations;
  }
}

export const influenceAnalyzer = new InfluenceAnalyzer();
