/**
 * PRISM Comprehensive Risk Scoring Engine
 *
 * Aggregates all intelligence sources into a unified risk assessment:
 * - Entity graph connections
 * - Funding analysis
 * - Influence indicators
 * - Narrative alignment
 * - Temporal patterns
 * - Network centrality
 */

import { Entity, entityGraph, RegimeAlignment, InfluencePath } from './entity-graph';
import { fundingIntelligence, FundingAnalysis } from './funding-intelligence';
import { influenceAnalyzer, InfluenceAnalysis } from './influence-analyzer';
import { analyzeNarrativeAlignment, initializeProxyDatabase, matchKnownProxy } from './proxy-database';

export interface ComprehensiveRiskAssessment {
  subject: string;
  timestamp: Date;

  // Component Analyses
  entityProfile: EntityProfile;
  fundingAnalysis: FundingAnalysis;
  influenceAnalysis: InfluenceAnalysis;
  narrativeAnalysis: NarrativeAnalysis;

  // Aggregate Scores
  scores: {
    directRegimeConnection: number;    // Direct ties to regime
    proxyConnection: number;           // Ties through proxies
    financialRisk: number;             // Financial red flags
    influenceRisk: number;             // Influence operation indicators
    narrativeAlignment: number;        // Messaging alignment with regime
    networkCentrality: number;         // Position in network
    temporalRisk: number;              // Changes over time
    overallRisk: number;               // Weighted aggregate
  };

  // Classification
  riskClassification: RiskClassification;
  confidence: number;

  // Key Intelligence
  criticalFindings: CriticalFinding[];
  redFlags: RedFlag[];
  mitigatingFactors: string[];

  // Actionable Intelligence
  watchlist: WatchlistRecommendation;
  investigationPriority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR';
  suggestedActions: string[];

  // Report
  executiveSummary: string;
  detailedFindings: string;
}

export interface EntityProfile {
  name: string;
  type: string;
  knownEntity: boolean;
  regimeAlignment: RegimeAlignment;
  alignmentConfidence: number;
  sanctioned: boolean;
  faraRegistered: boolean;
  aliases: string[];
  country?: string;
  description?: string;
}

export interface NarrativeAnalysis {
  proRegimeScore: number;
  proOppositionScore: number;
  netAlignment: number;  // Positive = pro-regime, negative = pro-opposition
  detectedProRegimeIndicators: string[];
  detectedProOppositionIndicators: string[];
  consistencyScore: number;  // How consistent is their messaging
  contradictions: string[];
  talkingPointMatches: {
    phrase: string;
    context: string;
    frequency: number;
  }[];
}

export type RiskClassification =
  | 'CONFIRMED_AGENT'      // Confirmed foreign agent
  | 'LIKELY_AGENT'         // Strong indicators of agent status
  | 'SUSPECTED_PROXY'      // Working through proxy organizations
  | 'INFLUENCE_TARGET'     // Being cultivated/influenced
  | 'USEFUL_IDIOT'         // Unwitting amplifier of regime narratives
  | 'REGIME_SYMPATHIZER'   // Ideological alignment without coordination
  | 'NEUTRAL'              // No significant regime connection
  | 'OPPOSITION_ALIGNED'   // Aligned with opposition
  | 'UNKNOWN';             // Insufficient data

export interface CriticalFinding {
  id: string;
  category: 'SANCTIONS' | 'FUNDING' | 'INFLUENCE' | 'NETWORK' | 'NARRATIVE' | 'FARA';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  evidence: string[];
  dateDiscovered: Date;
  actionRequired: boolean;
}

export interface RedFlag {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  source: string;
}

export interface WatchlistRecommendation {
  shouldAdd: boolean;
  listType: 'ACTIVE_INVESTIGATION' | 'MONITORING' | 'PERIODIC_REVIEW' | 'NONE';
  reason: string;
  reviewFrequency?: string;
}

/**
 * Comprehensive Risk Engine
 */
export class RiskEngine {
  private initialized = false;

  /**
   * Initialize the risk engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🔄 Initializing PRISM Risk Engine...');
    initializeProxyDatabase();
    this.initialized = true;
    console.log('✅ Risk Engine initialized');
  }

  /**
   * Perform comprehensive risk assessment
   */
  async assessRisk(subject: string, additionalContext?: {
    socialMediaContent?: string[];
    publicStatements?: string[];
    knownAffiliations?: string[];
  }): Promise<ComprehensiveRiskAssessment> {
    await this.initialize();

    console.log(`\n🔍 Performing comprehensive risk assessment for: ${subject}`);

    // Build entity profile
    const entityProfile = await this.buildEntityProfile(subject);

    // Run component analyses
    const [fundingAnalysis, influenceAnalysis] = await Promise.all([
      fundingIntelligence.analyzeFunding(subject),
      influenceAnalyzer.analyzeInfluence(subject)
    ]);

    // Narrative analysis
    const narrativeAnalysis = this.analyzeNarrative(
      subject,
      additionalContext?.socialMediaContent || [],
      additionalContext?.publicStatements || []
    );

    // Calculate component scores
    const scores = this.calculateScores(
      entityProfile,
      fundingAnalysis,
      influenceAnalysis,
      narrativeAnalysis
    );

    // Determine risk classification
    const riskClassification = this.classifyRisk(scores, entityProfile);
    const confidence = this.calculateConfidence(entityProfile, fundingAnalysis, influenceAnalysis);

    // Identify critical findings
    const criticalFindings = this.identifyCriticalFindings(
      entityProfile,
      fundingAnalysis,
      influenceAnalysis,
      narrativeAnalysis
    );

    // Compile red flags
    const redFlags = this.compileRedFlags(fundingAnalysis, influenceAnalysis, narrativeAnalysis);

    // Identify mitigating factors
    const mitigatingFactors = this.identifyMitigatingFactors(
      entityProfile,
      influenceAnalysis,
      narrativeAnalysis
    );

    // Watchlist recommendation
    const watchlist = this.recommendWatchlist(scores.overallRisk, criticalFindings, riskClassification);

    // Investigation priority
    const investigationPriority = this.determineInvestigationPriority(
      scores.overallRisk,
      criticalFindings.length
    );

    // Generate reports
    const executiveSummary = this.generateExecutiveSummary(
      subject,
      riskClassification,
      scores,
      criticalFindings
    );

    const detailedFindings = this.generateDetailedFindings(
      subject,
      entityProfile,
      fundingAnalysis,
      influenceAnalysis,
      narrativeAnalysis,
      criticalFindings
    );

    return {
      subject,
      timestamp: new Date(),
      entityProfile,
      fundingAnalysis,
      influenceAnalysis,
      narrativeAnalysis,
      scores,
      riskClassification,
      confidence,
      criticalFindings,
      redFlags,
      mitigatingFactors,
      watchlist,
      investigationPriority,
      suggestedActions: this.generateSuggestedActions(riskClassification, criticalFindings),
      executiveSummary,
      detailedFindings
    };
  }

  /**
   * Build entity profile
   */
  private async buildEntityProfile(subject: string): Promise<EntityProfile> {
    const knownEntity = matchKnownProxy(subject);

    if (knownEntity) {
      return {
        name: knownEntity.name,
        type: knownEntity.type,
        knownEntity: true,
        regimeAlignment: knownEntity.regimeAlignment,
        alignmentConfidence: knownEntity.alignmentConfidence,
        sanctioned: knownEntity.sanctioned,
        faraRegistered: knownEntity.faraRegistered || false,
        aliases: knownEntity.aliases,
        country: knownEntity.country,
        description: knownEntity.description
      };
    }

    // Create profile for unknown entity
    return {
      name: subject,
      type: 'UNKNOWN',
      knownEntity: false,
      regimeAlignment: 'UNKNOWN',
      alignmentConfidence: 0,
      sanctioned: false,
      faraRegistered: false,
      aliases: []
    };
  }

  /**
   * Analyze narrative alignment
   */
  private analyzeNarrative(
    subject: string,
    socialMediaContent: string[],
    publicStatements: string[]
  ): NarrativeAnalysis {
    const allContent = [...socialMediaContent, ...publicStatements].join(' ');

    const alignment = analyzeNarrativeAlignment(allContent);

    // Check for contradictions (pro-regime and pro-opposition indicators)
    const contradictions: string[] = [];
    if (alignment.proRegimeScore > 20 && alignment.proOppositionScore > 20) {
      contradictions.push('Mixed messaging: Both pro-regime and pro-opposition indicators detected');
    }

    // Calculate consistency
    const consistencyScore = alignment.proRegimeScore > 0 || alignment.proOppositionScore > 0
      ? Math.abs(alignment.proRegimeScore - alignment.proOppositionScore)
      : 50;

    return {
      proRegimeScore: alignment.proRegimeScore,
      proOppositionScore: alignment.proOppositionScore,
      netAlignment: alignment.proRegimeScore - alignment.proOppositionScore,
      detectedProRegimeIndicators: [
        ...alignment.detectedHashtags.filter(h => h.alignment === 'REGIME').map(h => h.tag),
        ...alignment.detectedPhrases.filter(p => p.alignment === 'REGIME').map(p => p.phrase)
      ],
      detectedProOppositionIndicators: [
        ...alignment.detectedHashtags.filter(h => h.alignment === 'OPPOSITION').map(h => h.tag),
        ...alignment.detectedPhrases.filter(p => p.alignment === 'OPPOSITION').map(p => p.phrase)
      ],
      consistencyScore,
      contradictions,
      talkingPointMatches: alignment.detectedPhrases.map(p => ({
        phrase: p.phrase,
        context: 'Content analysis',
        frequency: 1
      }))
    };
  }

  /**
   * Calculate all component scores
   */
  private calculateScores(
    entityProfile: EntityProfile,
    fundingAnalysis: FundingAnalysis,
    influenceAnalysis: InfluenceAnalysis,
    narrativeAnalysis: NarrativeAnalysis
  ): ComprehensiveRiskAssessment['scores'] {
    // Direct regime connection score
    let directRegimeConnection = 0;
    if (entityProfile.regimeAlignment === 'CONFIRMED_REGIME') directRegimeConnection = 100;
    else if (entityProfile.sanctioned) directRegimeConnection = 90;
    else if (entityProfile.regimeAlignment === 'KNOWN_PROXY') directRegimeConnection = 75;
    else directRegimeConnection = entityProfile.alignmentConfidence * 0.5;

    // Proxy connection score
    let proxyConnection = 0;
    if (influenceAnalysis.criticalPaths.length > 0) {
      proxyConnection = Math.min(100, influenceAnalysis.criticalPaths.length * 25);
    }
    if (influenceAnalysis.shortestPathToRegime) {
      const hops = influenceAnalysis.shortestPathToRegime.totalHops;
      proxyConnection = Math.max(proxyConnection, Math.max(0, 100 - (hops * 20)));
    }

    // Financial risk score
    const financialRisk = fundingAnalysis.totalRiskScore;

    // Influence risk score
    const influenceRisk = influenceAnalysis.overallRiskScore;

    // Narrative alignment score
    const narrativeAlignment = Math.max(0, narrativeAnalysis.netAlignment);

    // Network centrality score
    const networkCentrality = influenceAnalysis.networkCentrality.regimeProximity;

    // Temporal risk (based on coordinated behavior)
    const temporalRisk = influenceAnalysis.coordinatedBehavior.suspectedInfluenceOperation ? 80 : 20;

    // Overall weighted score
    const weights = {
      directRegimeConnection: 0.25,
      proxyConnection: 0.15,
      financialRisk: 0.20,
      influenceRisk: 0.15,
      narrativeAlignment: 0.10,
      networkCentrality: 0.10,
      temporalRisk: 0.05
    };

    const overallRisk = Math.round(
      directRegimeConnection * weights.directRegimeConnection +
      proxyConnection * weights.proxyConnection +
      financialRisk * weights.financialRisk +
      influenceRisk * weights.influenceRisk +
      narrativeAlignment * weights.narrativeAlignment +
      networkCentrality * weights.networkCentrality +
      temporalRisk * weights.temporalRisk
    );

    return {
      directRegimeConnection,
      proxyConnection,
      financialRisk,
      influenceRisk,
      narrativeAlignment,
      networkCentrality,
      temporalRisk,
      overallRisk
    };
  }

  /**
   * Classify overall risk level
   */
  private classifyRisk(
    scores: ComprehensiveRiskAssessment['scores'],
    profile: EntityProfile
  ): RiskClassification {
    // Direct classifications based on known status
    if (profile.regimeAlignment === 'CONFIRMED_REGIME') return 'CONFIRMED_AGENT';
    if (profile.regimeAlignment === 'KNOWN_PROXY') return 'LIKELY_AGENT';
    if (profile.regimeAlignment === 'CONFIRMED_OPPOSITION') return 'OPPOSITION_ALIGNED';

    // Score-based classification
    if (scores.overallRisk >= 85) return 'LIKELY_AGENT';
    if (scores.overallRisk >= 70) return 'SUSPECTED_PROXY';
    if (scores.overallRisk >= 55) return 'INFLUENCE_TARGET';
    if (scores.overallRisk >= 40) return 'USEFUL_IDIOT';
    if (scores.overallRisk >= 25) return 'REGIME_SYMPATHIZER';
    if (scores.overallRisk >= 10) return 'NEUTRAL';

    // Check for opposition alignment
    if (profile.regimeAlignment === 'OPPOSITION_FRIENDLY') return 'OPPOSITION_ALIGNED';

    return 'UNKNOWN';
  }

  /**
   * Calculate confidence in assessment
   */
  private calculateConfidence(
    profile: EntityProfile,
    funding: FundingAnalysis,
    influence: InfluenceAnalysis
  ): number {
    let confidence = 0;

    // Known entity adds confidence
    if (profile.knownEntity) confidence += 40;

    // Data availability
    if (funding.directFunding.length > 0) confidence += 15;
    if (funding.indirectFunding.length > 0) confidence += 10;
    if (influence.allRegimePaths.length > 0) confidence += 15;
    if (influence.influenceIndicators.length > 0) confidence += 15;

    // Verification status
    const verifiedFunding = funding.directFunding.filter(f => f.verified).length;
    confidence += Math.min(15, verifiedFunding * 5);

    return Math.min(100, confidence);
  }

  /**
   * Identify critical findings
   */
  private identifyCriticalFindings(
    profile: EntityProfile,
    funding: FundingAnalysis,
    influence: InfluenceAnalysis,
    narrative: NarrativeAnalysis
  ): CriticalFinding[] {
    const findings: CriticalFinding[] = [];

    // Sanctions finding
    if (profile.sanctioned) {
      findings.push({
        id: 'sanctions-direct',
        category: 'SANCTIONS',
        severity: 'CRITICAL',
        title: 'Subject is directly sanctioned',
        description: `${profile.name} appears on sanctions lists`,
        evidence: ['OFAC SDN List'],
        dateDiscovered: new Date(),
        actionRequired: true
      });
    }

    if (funding.sanctionsCheck.degreesOfSeparation === 1) {
      findings.push({
        id: 'sanctions-adjacent',
        category: 'SANCTIONS',
        severity: 'HIGH',
        title: 'Direct connection to sanctioned entity',
        description: `Connected to: ${funding.sanctionsCheck.relatedSanctionedEntities.join(', ')}`,
        evidence: funding.sanctionsCheck.relatedSanctionedEntities,
        dateDiscovered: new Date(),
        actionRequired: true
      });
    }

    // Funding findings
    for (const connection of funding.directFunding.filter(f => f.riskLevel === 'CRITICAL')) {
      findings.push({
        id: `funding-${connection.id}`,
        category: 'FUNDING',
        severity: 'CRITICAL',
        title: `Critical funding from ${connection.fromEntity}`,
        description: connection.description || 'Financial relationship with high-risk entity',
        evidence: connection.sources.map(s => s.name),
        dateDiscovered: new Date(),
        actionRequired: true
      });
    }

    // FARA findings
    if (funding.faraCheck.shouldBeRegistered && !funding.faraCheck.isRegistered) {
      findings.push({
        id: 'fara-violation',
        category: 'FARA',
        severity: 'HIGH',
        title: 'Potential FARA violation',
        description: 'Foreign agent activities detected without registration',
        evidence: funding.faraCheck.unregisteredIndicators,
        dateDiscovered: new Date(),
        actionRequired: true
      });
    }

    // Influence findings
    for (const indicator of influence.influenceIndicators.filter(i => i.severity === 'CRITICAL')) {
      findings.push({
        id: `influence-${indicator.type}`,
        category: 'INFLUENCE',
        severity: 'CRITICAL',
        title: indicator.description,
        description: indicator.evidence.join('; '),
        evidence: indicator.evidence,
        dateDiscovered: new Date(),
        actionRequired: true
      });
    }

    // Network findings
    if (influence.shortestPathToRegime && influence.shortestPathToRegime.totalHops <= 2) {
      findings.push({
        id: 'network-proximity',
        category: 'NETWORK',
        severity: influence.shortestPathToRegime.totalHops === 1 ? 'CRITICAL' : 'HIGH',
        title: `${influence.shortestPathToRegime.totalHops}-hop to regime entity`,
        description: influence.shortestPathToRegime.pathDescription,
        evidence: [influence.shortestPathToRegime.endEntity.name],
        dateDiscovered: new Date(),
        actionRequired: influence.shortestPathToRegime.totalHops === 1
      });
    }

    // Narrative findings
    if (narrative.proRegimeScore >= 50) {
      findings.push({
        id: 'narrative-alignment',
        category: 'NARRATIVE',
        severity: narrative.proRegimeScore >= 80 ? 'CRITICAL' : 'HIGH',
        title: 'High regime narrative alignment',
        description: `Pro-regime messaging score: ${narrative.proRegimeScore}%`,
        evidence: narrative.detectedProRegimeIndicators,
        dateDiscovered: new Date(),
        actionRequired: false
      });
    }

    return findings;
  }

  /**
   * Compile all red flags
   */
  private compileRedFlags(
    funding: FundingAnalysis,
    influence: InfluenceAnalysis,
    narrative: NarrativeAnalysis
  ): RedFlag[] {
    const flags: RedFlag[] = [];

    // From funding analysis
    for (const flag of funding.redFlags) {
      const severity = flag.includes('CRITICAL') ? 'CRITICAL' as const :
                      flag.includes('HIGH') ? 'HIGH' as const :
                      flag.includes('MEDIUM') ? 'MEDIUM' as const : 'LOW' as const;
      flags.push({
        type: 'FUNDING',
        severity,
        description: flag.replace(/^[🚨⚠️\s]+/, '').replace(/^(CRITICAL|HIGH|MEDIUM|LOW):\s*/, ''),
        source: 'Funding Intelligence'
      });
    }

    // From influence analysis
    for (const indicator of influence.influenceIndicators) {
      flags.push({
        type: indicator.type,
        severity: indicator.severity,
        description: indicator.description,
        source: 'Influence Analysis'
      });
    }

    // From narrative analysis
    for (const indicator of narrative.detectedProRegimeIndicators) {
      flags.push({
        type: 'NARRATIVE',
        severity: 'MEDIUM',
        description: `Uses regime talking point: ${indicator}`,
        source: 'Narrative Analysis'
      });
    }

    return flags.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Identify mitigating factors
   */
  private identifyMitigatingFactors(
    profile: EntityProfile,
    influence: InfluenceAnalysis,
    narrative: NarrativeAnalysis
  ): string[] {
    const factors: string[] = [];

    if (profile.regimeAlignment === 'CONFIRMED_OPPOSITION') {
      factors.push('Confirmed opposition member');
    }

    if (profile.regimeAlignment === 'OPPOSITION_FRIENDLY') {
      factors.push('Generally aligned with opposition');
    }

    if (narrative.proOppositionScore > narrative.proRegimeScore) {
      factors.push('Net pro-opposition messaging');
    }

    if (influence.influenceIndicators.length === 0) {
      factors.push('No influence indicators detected');
    }

    if (!profile.sanctioned && influence.allRegimePaths.length === 0) {
      factors.push('No detected path to regime entities');
    }

    return factors;
  }

  /**
   * Recommend watchlist status
   */
  private recommendWatchlist(
    overallRisk: number,
    criticalFindings: CriticalFinding[],
    classification: RiskClassification
  ): WatchlistRecommendation {
    const criticalCount = criticalFindings.filter(f => f.severity === 'CRITICAL').length;

    if (classification === 'CONFIRMED_AGENT' || classification === 'LIKELY_AGENT') {
      return {
        shouldAdd: true,
        listType: 'ACTIVE_INVESTIGATION',
        reason: 'High-confidence regime agent or proxy',
        reviewFrequency: 'Weekly'
      };
    }

    if (overallRisk >= 70 || criticalCount >= 2) {
      return {
        shouldAdd: true,
        listType: 'ACTIVE_INVESTIGATION',
        reason: `${criticalCount} critical findings, ${overallRisk}% overall risk`,
        reviewFrequency: 'Bi-weekly'
      };
    }

    if (overallRisk >= 50 || criticalCount >= 1) {
      return {
        shouldAdd: true,
        listType: 'MONITORING',
        reason: 'Significant risk indicators present',
        reviewFrequency: 'Monthly'
      };
    }

    if (overallRisk >= 30) {
      return {
        shouldAdd: true,
        listType: 'PERIODIC_REVIEW',
        reason: 'Low-level indicators warrant periodic review',
        reviewFrequency: 'Quarterly'
      };
    }

    return {
      shouldAdd: false,
      listType: 'NONE',
      reason: 'Insufficient risk indicators'
    };
  }

  /**
   * Determine investigation priority
   */
  private determineInvestigationPriority(
    overallRisk: number,
    criticalFindingsCount: number
  ): ComprehensiveRiskAssessment['investigationPriority'] {
    if (criticalFindingsCount >= 3 || overallRisk >= 85) return 'IMMEDIATE';
    if (criticalFindingsCount >= 2 || overallRisk >= 70) return 'HIGH';
    if (criticalFindingsCount >= 1 || overallRisk >= 50) return 'MEDIUM';
    if (overallRisk >= 30) return 'LOW';
    return 'MONITOR';
  }

  /**
   * Generate suggested actions
   */
  private generateSuggestedActions(
    classification: RiskClassification,
    findings: CriticalFinding[]
  ): string[] {
    const actions: string[] = [];

    switch (classification) {
      case 'CONFIRMED_AGENT':
      case 'LIKELY_AGENT':
        actions.push('Report to relevant authorities');
        actions.push('Do not engage in business relationships');
        actions.push('Document all known activities');
        break;

      case 'SUSPECTED_PROXY':
        actions.push('Conduct in-depth investigation');
        actions.push('Map all organizational relationships');
        actions.push('Monitor financial transactions');
        break;

      case 'INFLUENCE_TARGET':
        actions.push('Document influence attempts');
        actions.push('Monitor for recruitment indicators');
        break;

      case 'USEFUL_IDIOT':
        actions.push('Track narrative amplification patterns');
        actions.push('Document regime-aligned content');
        break;
    }

    // Finding-specific actions
    if (findings.some(f => f.category === 'FARA')) {
      actions.push('Refer potential FARA violation to DOJ');
    }

    if (findings.some(f => f.category === 'SANCTIONS')) {
      actions.push('Review for OFAC compliance violations');
    }

    return actions;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    subject: string,
    classification: RiskClassification,
    scores: ComprehensiveRiskAssessment['scores'],
    findings: CriticalFinding[]
  ): string {
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;

    let summary = `SUBJECT: ${subject}\n`;
    summary += `CLASSIFICATION: ${classification}\n`;
    summary += `OVERALL RISK SCORE: ${scores.overallRisk}%\n\n`;

    summary += `ASSESSMENT SUMMARY:\n`;

    switch (classification) {
      case 'CONFIRMED_AGENT':
        summary += `${subject} is a CONFIRMED foreign agent of the Iranian regime. `;
        summary += `Direct involvement in regime activities is documented. `;
        break;

      case 'LIKELY_AGENT':
        summary += `${subject} shows strong indicators of being a foreign agent. `;
        summary += `Multiple critical findings support this assessment. `;
        break;

      case 'SUSPECTED_PROXY':
        summary += `${subject} appears to operate as a proxy for Iranian regime interests. `;
        summary += `Evidence suggests coordination with known regime entities. `;
        break;

      case 'INFLUENCE_TARGET':
        summary += `${subject} shows signs of being targeted for influence operations. `;
        summary += `Relationships with regime-adjacent entities detected. `;
        break;

      case 'USEFUL_IDIOT':
        summary += `${subject} amplifies regime narratives, possibly unwittingly. `;
        summary += `No direct coordination detected but messaging aligns with regime interests. `;
        break;

      default:
        summary += `${subject} shows limited connection to Iranian regime influence networks. `;
    }

    if (criticalCount > 0) {
      summary += `\n\n${criticalCount} CRITICAL and ${highCount} HIGH severity findings require attention.`;
    }

    return summary;
  }

  /**
   * Generate detailed findings report
   */
  private generateDetailedFindings(
    subject: string,
    profile: EntityProfile,
    funding: FundingAnalysis,
    influence: InfluenceAnalysis,
    narrative: NarrativeAnalysis,
    findings: CriticalFinding[]
  ): string {
    let report = `\n${'═'.repeat(60)}\n`;
    report += `DETAILED INTELLIGENCE REPORT: ${subject}\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `${'═'.repeat(60)}\n\n`;

    // Entity Profile
    report += `ENTITY PROFILE\n${'─'.repeat(40)}\n`;
    report += `Name: ${profile.name}\n`;
    report += `Type: ${profile.type}\n`;
    report += `Known Entity: ${profile.knownEntity ? 'Yes' : 'No'}\n`;
    report += `Regime Alignment: ${profile.regimeAlignment}\n`;
    report += `Sanctioned: ${profile.sanctioned ? 'YES ⚠️' : 'No'}\n`;
    if (profile.aliases.length > 0) {
      report += `Aliases: ${profile.aliases.join(', ')}\n`;
    }
    report += '\n';

    // Critical Findings
    if (findings.length > 0) {
      report += `CRITICAL FINDINGS (${findings.length})\n${'─'.repeat(40)}\n`;
      for (const finding of findings) {
        report += `\n[${finding.severity}] ${finding.title}\n`;
        report += `  Category: ${finding.category}\n`;
        report += `  ${finding.description}\n`;
        if (finding.evidence.length > 0) {
          report += `  Evidence: ${finding.evidence.join('; ')}\n`;
        }
        if (finding.actionRequired) {
          report += `  ⚠️ ACTION REQUIRED\n`;
        }
      }
      report += '\n';
    }

    // Network Analysis
    report += `NETWORK ANALYSIS\n${'─'.repeat(40)}\n`;
    if (influence.shortestPathToRegime) {
      report += `Shortest Path to Regime: ${influence.shortestPathToRegime.totalHops} hops\n`;
      report += `  ${influence.shortestPathToRegime.pathDescription}\n`;
    } else {
      report += `No path to regime entities detected\n`;
    }
    report += `Regime Proximity Score: ${influence.networkCentrality.regimeProximity}%\n`;
    report += `${influence.networkCentrality.interpretation}\n\n`;

    // Funding Analysis
    report += `FUNDING ANALYSIS\n${'─'.repeat(40)}\n`;
    report += `Financial Risk Score: ${funding.totalRiskScore}%\n`;
    if (funding.directFunding.length > 0) {
      report += `Direct Funding Connections: ${funding.directFunding.length}\n`;
      for (const conn of funding.directFunding) {
        report += `  - ${conn.fromEntity} [${conn.riskLevel}]\n`;
      }
    }
    report += '\n';

    // Narrative Analysis
    report += `NARRATIVE ANALYSIS\n${'─'.repeat(40)}\n`;
    report += `Pro-Regime Score: ${narrative.proRegimeScore}%\n`;
    report += `Pro-Opposition Score: ${narrative.proOppositionScore}%\n`;
    report += `Net Alignment: ${narrative.netAlignment > 0 ? 'Pro-Regime' : narrative.netAlignment < 0 ? 'Pro-Opposition' : 'Neutral'}\n`;
    if (narrative.detectedProRegimeIndicators.length > 0) {
      report += `Regime Indicators: ${narrative.detectedProRegimeIndicators.join(', ')}\n`;
    }
    if (narrative.contradictions.length > 0) {
      report += `Contradictions: ${narrative.contradictions.join('; ')}\n`;
    }

    report += `\n${'═'.repeat(60)}\n`;
    report += `END OF REPORT\n`;
    report += `${'═'.repeat(60)}\n`;

    return report;
  }
}

export const riskEngine = new RiskEngine();
