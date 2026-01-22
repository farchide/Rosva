/**
 * PRISM Intelligence Visualizer
 *
 * Generates comprehensive visual reports for influence network analysis
 */

import { ComprehensiveRiskAssessment, RiskClassification } from './risk-engine';
import { InfluencePath, Entity, RegimeAlignment } from './entity-graph';

export class IntelligenceVisualizer {
  /**
   * Generate full intelligence report
   */
  generateReport(assessment: ComprehensiveRiskAssessment): string {
    let report = '';

    report += this.generateHeader(assessment);
    report += this.generateRiskDashboard(assessment);
    report += this.generateClassificationBadge(assessment);
    report += this.generateScoreBreakdown(assessment);
    report += this.generateCriticalFindings(assessment);
    report += this.generateNetworkVisualization(assessment);
    report += this.generateFundingAnalysis(assessment);
    report += this.generateInfluenceMap(assessment);
    report += this.generateNarrativeAnalysis(assessment);
    report += this.generateRedFlags(assessment);
    report += this.generateActionableIntelligence(assessment);
    report += this.generateFooter(assessment);

    return report;
  }

  /**
   * Generate header
   */
  private generateHeader(assessment: ComprehensiveRiskAssessment): string {
    const border = '═'.repeat(70);

    return `
${border}
  ██████╗ ██████╗ ██╗███████╗███╗   ███╗    ██╗███╗   ██╗████████╗███████╗██╗
  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║    ██║████╗  ██║╚══██╔══╝██╔════╝██║
  ██████╔╝██████╔╝██║███████╗██╔████╔██║    ██║██╔██╗ ██║   ██║   █████╗  ██║
  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║    ██║██║╚██╗██║   ██║   ██╔══╝  ██║
  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║    ██║██║ ╚████║   ██║   ███████╗███████╗
  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝
${border}
            COMPREHENSIVE INFLUENCE NETWORK INTELLIGENCE REPORT
${border}

  SUBJECT: ${assessment.subject}
  GENERATED: ${assessment.timestamp.toISOString()}
  CONFIDENCE: ${assessment.confidence}%

${border}
`;
  }

  /**
   * Generate risk dashboard
   */
  private generateRiskDashboard(assessment: ComprehensiveRiskAssessment): string {
    const risk = assessment.scores.overallRisk;
    const bar = this.generateRiskBar(risk);
    const icon = this.getRiskIcon(risk);

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                         RISK ASSESSMENT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   OVERALL RISK: ${risk.toString().padStart(3)}%  ${icon}                                          │
│   ${bar}                                        │
│                                                                      │
│   ${this.getRiskDescription(risk).padEnd(60)}   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
`;
  }

  /**
   * Generate classification badge
   */
  private generateClassificationBadge(assessment: ComprehensiveRiskAssessment): string {
    const classification = assessment.riskClassification;
    const badge = this.getClassificationBadge(classification);
    const description = this.getClassificationDescription(classification);

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                        CLASSIFICATION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ${badge}
│                                                                      │
│   ${description.substring(0, 64).padEnd(64)}   │
${description.length > 64 ? `│   ${description.substring(64, 128).padEnd(64)}   │\n` : ''}└─────────────────────────────────────────────────────────────────────┘
`;
  }

  /**
   * Generate score breakdown
   */
  private generateScoreBreakdown(assessment: ComprehensiveRiskAssessment): string {
    const s = assessment.scores;

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT SCORES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Direct Regime Connection    ${this.miniBar(s.directRegimeConnection)} ${s.directRegimeConnection.toString().padStart(3)}%   │
│   Proxy Organization Link     ${this.miniBar(s.proxyConnection)} ${s.proxyConnection.toString().padStart(3)}%   │
│   Financial Risk              ${this.miniBar(s.financialRisk)} ${s.financialRisk.toString().padStart(3)}%   │
│   Influence Indicators        ${this.miniBar(s.influenceRisk)} ${s.influenceRisk.toString().padStart(3)}%   │
│   Narrative Alignment         ${this.miniBar(s.narrativeAlignment)} ${s.narrativeAlignment.toString().padStart(3)}%   │
│   Network Centrality          ${this.miniBar(s.networkCentrality)} ${s.networkCentrality.toString().padStart(3)}%   │
│   Temporal Risk               ${this.miniBar(s.temporalRisk)} ${s.temporalRisk.toString().padStart(3)}%   │
│                                                                      │
│   ──────────────────────────────────────────────────────────────    │
│   AGGREGATE RISK              ${this.miniBar(s.overallRisk)} ${s.overallRisk.toString().padStart(3)}%   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
`;
  }

  /**
   * Generate critical findings section
   */
  private generateCriticalFindings(assessment: ComprehensiveRiskAssessment): string {
    if (assessment.criticalFindings.length === 0) {
      return `
┌─────────────────────────────────────────────────────────────────────┐
│                      CRITICAL FINDINGS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ✅ No critical findings identified                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
`;
    }

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                      CRITICAL FINDINGS                               │
├─────────────────────────────────────────────────────────────────────┤
`;

    for (const finding of assessment.criticalFindings) {
      const icon = finding.severity === 'CRITICAL' ? '🚨' :
                   finding.severity === 'HIGH' ? '⚠️' : '📋';

      section += `│                                                                      │\n`;
      section += `│   ${icon} [${finding.severity}] ${finding.title.substring(0, 50).padEnd(50)}   │\n`;
      section += `│      Category: ${finding.category.padEnd(54)}   │\n`;

      const descLines = this.wrapText(finding.description, 54);
      for (const line of descLines) {
        section += `│      ${line.padEnd(58)}   │\n`;
      }

      if (finding.actionRequired) {
        section += `│      ⚡ ACTION REQUIRED                                              │\n`;
      }
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate network visualization
   */
  private generateNetworkVisualization(assessment: ComprehensiveRiskAssessment): string {
    const influence = assessment.influenceAnalysis;

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                    NETWORK ANALYSIS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Network Position:                                                  │
│   ${influence.networkCentrality.interpretation.substring(0, 62).padEnd(62)}   │
│                                                                      │
│   Regime Proximity: ${influence.networkCentrality.regimeProximity}%                                           │
│   ${this.generateProximityBar(influence.networkCentrality.regimeProximity)}        │
│                                                                      │
`;

    // Shortest path visualization
    if (influence.shortestPathToRegime) {
      section += `│   SHORTEST PATH TO REGIME (${influence.shortestPathToRegime.totalHops} hops):                               │\n`;
      section += `│                                                                      │\n`;

      const path = influence.shortestPathToRegime;
      section += `│   [${assessment.subject.substring(0, 15)}]                                                 │\n`;

      for (let i = 0; i < path.path.length; i++) {
        const conn = path.path[i];
        const relType = conn.relationship.type.substring(0, 20);
        const targetName = conn.toEntity.name.substring(0, 25);
        const alignment = this.getAlignmentIcon(conn.toEntity.regimeAlignment);

        section += `│       │                                                             │\n`;
        section += `│       ├──[${relType}]──►                                       │\n`;
        section += `│       │                                                             │\n`;
        section += `│       ▼                                                             │\n`;
        section += `│   [${targetName.padEnd(25)}] ${alignment}                       │\n`;
      }
    } else {
      section += `│   No path to regime entities detected                               │\n`;
    }

    section += `│                                                                      │\n`;

    // All regime paths summary
    if (influence.allRegimePaths.length > 0) {
      section += `│   Total paths to regime entities: ${influence.allRegimePaths.length.toString().padEnd(30)}   │\n`;
      section += `│   Critical paths (through proxies): ${influence.criticalPaths.length.toString().padEnd(27)}   │\n`;
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate funding analysis section
   */
  private generateFundingAnalysis(assessment: ComprehensiveRiskAssessment): string {
    const funding = assessment.fundingAnalysis;

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                    FUNDING ANALYSIS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Financial Risk Score: ${funding.totalRiskScore.toString().padStart(3)}%                                        │
│   ${this.miniBar(funding.totalRiskScore)}                                        │
│                                                                      │
`;

    // Sanctions status
    if (funding.sanctionsCheck.isSanctioned) {
      section += `│   🚨 SANCTIONED ENTITY                                               │\n`;
    } else if (funding.sanctionsCheck.degreesOfSeparation > 0) {
      section += `│   ⚠️  ${funding.sanctionsCheck.degreesOfSeparation}-hop(s) to sanctioned entity                                      │\n`;
      section += `│      Related: ${funding.sanctionsCheck.relatedSanctionedEntities.slice(0, 2).join(', ').substring(0, 50).padEnd(50)}   │\n`;
    } else {
      section += `│   ✅ No direct sanctions connection                                  │\n`;
    }

    section += `│                                                                      │\n`;

    // FARA status
    if (funding.faraCheck.shouldBeRegistered && !funding.faraCheck.isRegistered) {
      section += `│   ⚠️  POTENTIAL FARA VIOLATION                                       │\n`;
      section += `│      Indicators:                                                    │\n`;
      for (const indicator of funding.faraCheck.unregisteredIndicators.slice(0, 3)) {
        section += `│      • ${indicator.substring(0, 56).padEnd(56)}   │\n`;
      }
    } else if (funding.faraCheck.isRegistered) {
      section += `│   📋 FARA Registered                                                │\n`;
    }

    section += `│                                                                      │\n`;

    // Direct funding
    if (funding.directFunding.length > 0) {
      section += `│   Direct Funding Connections (${funding.directFunding.length}):                                │\n`;
      for (const conn of funding.directFunding.slice(0, 5)) {
        const riskIcon = conn.riskLevel === 'CRITICAL' ? '🔴' :
                        conn.riskLevel === 'HIGH' ? '🟠' :
                        conn.riskLevel === 'MEDIUM' ? '🟡' : '🟢';
        section += `│      ${riskIcon} ${conn.fromEntity.substring(0, 40).padEnd(40)} [${conn.riskLevel.padEnd(8)}]   │\n`;
      }
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate influence map
   */
  private generateInfluenceMap(assessment: ComprehensiveRiskAssessment): string {
    const influence = assessment.influenceAnalysis;

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                    INFLUENCE INDICATORS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
`;

    if (influence.influenceIndicators.length === 0) {
      section += `│   No significant influence indicators detected                       │\n`;
    } else {
      // Group by severity
      const critical = influence.influenceIndicators.filter(i => i.severity === 'CRITICAL');
      const high = influence.influenceIndicators.filter(i => i.severity === 'HIGH');
      const medium = influence.influenceIndicators.filter(i => i.severity === 'MEDIUM');

      if (critical.length > 0) {
        section += `│   🚨 CRITICAL (${critical.length}):                                                     │\n`;
        for (const ind of critical.slice(0, 3)) {
          section += `│      • ${ind.description.substring(0, 56).padEnd(56)}   │\n`;
        }
      }

      if (high.length > 0) {
        section += `│   ⚠️  HIGH (${high.length}):                                                         │\n`;
        for (const ind of high.slice(0, 3)) {
          section += `│      • ${ind.description.substring(0, 56).padEnd(56)}   │\n`;
        }
      }

      if (medium.length > 0) {
        section += `│   📋 MEDIUM (${medium.length}):                                                       │\n`;
        for (const ind of medium.slice(0, 2)) {
          section += `│      • ${ind.description.substring(0, 56).padEnd(56)}   │\n`;
        }
      }
    }

    section += `│                                                                      │\n`;

    // Coordinated behavior
    if (influence.coordinatedBehavior.suspectedInfluenceOperation) {
      section += `│   ⚡ SUSPECTED INFLUENCE OPERATION                                   │\n`;
      section += `│      Confidence: ${influence.coordinatedBehavior.confidence}%                                           │\n`;
      if (influence.coordinatedBehavior.amplificationNetwork.length > 0) {
        section += `│      Amplification network: ${influence.coordinatedBehavior.amplificationNetwork.slice(0, 3).join(', ').substring(0, 40)}   │\n`;
      }
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate narrative analysis section
   */
  private generateNarrativeAnalysis(assessment: ComprehensiveRiskAssessment): string {
    const narrative = assessment.narrativeAnalysis;

    const alignment = narrative.netAlignment > 20 ? 'PRO-REGIME' :
                     narrative.netAlignment < -20 ? 'PRO-OPPOSITION' : 'NEUTRAL';

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                    NARRATIVE ANALYSIS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Messaging Alignment: ${alignment.padEnd(45)}   │
│                                                                      │
│   Pro-Regime Score:     ${narrative.proRegimeScore.toString().padStart(3)}% ${this.miniBar(narrative.proRegimeScore)}   │
│   Pro-Opposition Score: ${narrative.proOppositionScore.toString().padStart(3)}% ${this.miniBar(narrative.proOppositionScore)}   │
│   Net Alignment:        ${(narrative.netAlignment > 0 ? '+' : '') + narrative.netAlignment.toString().padStart(3)}                                      │
│                                                                      │
`;

    // Detected indicators
    if (narrative.detectedProRegimeIndicators.length > 0) {
      section += `│   Regime Narratives Detected:                                        │\n`;
      for (const ind of narrative.detectedProRegimeIndicators.slice(0, 4)) {
        section += `│      🔴 ${ind.substring(0, 55).padEnd(55)}   │\n`;
      }
    }

    if (narrative.detectedProOppositionIndicators.length > 0) {
      section += `│   Opposition Narratives Detected:                                    │\n`;
      for (const ind of narrative.detectedProOppositionIndicators.slice(0, 4)) {
        section += `│      🟢 ${ind.substring(0, 55).padEnd(55)}   │\n`;
      }
    }

    // Contradictions
    if (narrative.contradictions.length > 0) {
      section += `│                                                                      │\n`;
      section += `│   ⚠️  CONTRADICTIONS DETECTED:                                       │\n`;
      for (const contradiction of narrative.contradictions) {
        section += `│      • ${contradiction.substring(0, 56).padEnd(56)}   │\n`;
      }
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate red flags summary
   */
  private generateRedFlags(assessment: ComprehensiveRiskAssessment): string {
    if (assessment.redFlags.length === 0) {
      return '';
    }

    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                       RED FLAGS SUMMARY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
`;

    const critical = assessment.redFlags.filter(f => f.severity === 'CRITICAL');
    const high = assessment.redFlags.filter(f => f.severity === 'HIGH');
    const medium = assessment.redFlags.filter(f => f.severity === 'MEDIUM');

    section += `│   🚨 Critical: ${critical.length.toString().padEnd(3)} | ⚠️  High: ${high.length.toString().padEnd(3)} | 📋 Medium: ${medium.length.toString().padEnd(3)}               │\n`;
    section += `│                                                                      │\n`;

    // List top flags
    for (const flag of assessment.redFlags.slice(0, 8)) {
      const icon = flag.severity === 'CRITICAL' ? '🚨' :
                   flag.severity === 'HIGH' ? '⚠️' :
                   flag.severity === 'MEDIUM' ? '📋' : '📝';
      section += `│   ${icon} ${flag.description.substring(0, 60).padEnd(60)}   │\n`;
    }

    if (assessment.redFlags.length > 8) {
      section += `│   ... and ${(assessment.redFlags.length - 8).toString()} more                                               │\n`;
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate actionable intelligence section
   */
  private generateActionableIntelligence(assessment: ComprehensiveRiskAssessment): string {
    let section = `
┌─────────────────────────────────────────────────────────────────────┐
│                   ACTIONABLE INTELLIGENCE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Investigation Priority: ${assessment.investigationPriority.padEnd(42)}   │
│                                                                      │
│   Watchlist Recommendation:                                          │
│      Add to list: ${assessment.watchlist.shouldAdd ? 'YES' : 'NO'}                                               │
│      List type: ${assessment.watchlist.listType.padEnd(52)}   │
│      Reason: ${assessment.watchlist.reason.substring(0, 54).padEnd(54)}   │
${assessment.watchlist.reviewFrequency ? `│      Review: ${assessment.watchlist.reviewFrequency.padEnd(54)}   │\n` : ''}│                                                                      │
│   Suggested Actions:                                                 │
`;

    for (const action of assessment.suggestedActions.slice(0, 5)) {
      section += `│      → ${action.substring(0, 56).padEnd(56)}   │\n`;
    }

    // Mitigating factors
    if (assessment.mitigatingFactors.length > 0) {
      section += `│                                                                      │\n`;
      section += `│   Mitigating Factors:                                                │\n`;
      for (const factor of assessment.mitigatingFactors.slice(0, 3)) {
        section += `│      ✓ ${factor.substring(0, 56).padEnd(56)}   │\n`;
      }
    }

    section += `│                                                                      │\n`;
    section += `└─────────────────────────────────────────────────────────────────────┘\n`;

    return section;
  }

  /**
   * Generate footer
   */
  private generateFooter(assessment: ComprehensiveRiskAssessment): string {
    return `
${'═'.repeat(70)}
                           EXECUTIVE SUMMARY
${'═'.repeat(70)}

${assessment.executiveSummary}

${'═'.repeat(70)}
                              END OF REPORT
                    PRISM Intelligence Analysis System
                         Classification: CONFIDENTIAL
${'═'.repeat(70)}
`;
  }

  // Helper methods

  private generateRiskBar(risk: number): string {
    const filled = Math.round(risk / 5);
    const empty = 20 - filled;

    let bar = '[';
    if (risk >= 70) {
      bar += '🔴'.repeat(Math.min(filled, 20));
    } else if (risk >= 40) {
      bar += '🟠'.repeat(Math.min(filled, 20));
    } else {
      bar += '🟢'.repeat(Math.min(filled, 20));
    }
    bar += '░'.repeat(Math.max(0, empty));
    bar += ']';

    return bar;
  }

  private miniBar(value: number): string {
    const filled = Math.round(value / 5);
    const empty = 20 - filled;

    let color = '█';
    if (value >= 70) color = '▓';
    else if (value >= 40) color = '▒';
    else color = '░';

    return '[' + color.repeat(filled) + '·'.repeat(empty) + ']';
  }

  private generateProximityBar(proximity: number): string {
    const position = Math.round(proximity / 2);
    const bar = '─'.repeat(position) + '●' + '─'.repeat(50 - position);
    return `FAR [${bar}] CLOSE`;
  }

  private getRiskIcon(risk: number): string {
    if (risk >= 80) return '🚨 CRITICAL';
    if (risk >= 60) return '⚠️  HIGH';
    if (risk >= 40) return '📋 MODERATE';
    if (risk >= 20) return '📝 LOW';
    return '✅ MINIMAL';
  }

  private getRiskDescription(risk: number): string {
    if (risk >= 80) return 'CRITICAL RISK: Immediate attention required. Strong regime ties.';
    if (risk >= 60) return 'HIGH RISK: Significant concerns. Active investigation recommended.';
    if (risk >= 40) return 'MODERATE RISK: Notable indicators. Monitoring recommended.';
    if (risk >= 20) return 'LOW RISK: Minor indicators. Periodic review suggested.';
    return 'MINIMAL RISK: No significant regime connection detected.';
  }

  private getClassificationBadge(classification: RiskClassification): string {
    const badges: Record<RiskClassification, string> = {
      'CONFIRMED_AGENT':    '████ CONFIRMED FOREIGN AGENT ████',
      'LIKELY_AGENT':       '████   LIKELY FOREIGN AGENT   ████',
      'SUSPECTED_PROXY':    '███   SUSPECTED REGIME PROXY   ███',
      'INFLUENCE_TARGET':   '██     INFLUENCE TARGET        ██',
      'USEFUL_IDIOT':       '█     UNWITTING AMPLIFIER       █',
      'REGIME_SYMPATHIZER': '      REGIME SYMPATHIZER          ',
      'NEUTRAL':            '          NEUTRAL                  ',
      'OPPOSITION_ALIGNED': '      OPPOSITION ALIGNED          ',
      'UNKNOWN':            '          UNKNOWN                  '
    };
    return badges[classification];
  }

  private getClassificationDescription(classification: RiskClassification): string {
    const descriptions: Record<RiskClassification, string> = {
      'CONFIRMED_AGENT': 'Documented foreign agent working directly for Iranian regime interests.',
      'LIKELY_AGENT': 'Strong indicators suggest active coordination with regime entities.',
      'SUSPECTED_PROXY': 'Operating through proxy organizations aligned with regime interests.',
      'INFLUENCE_TARGET': 'Being actively cultivated or influenced by regime-linked entities.',
      'USEFUL_IDIOT': 'Amplifies regime narratives, possibly without direct coordination.',
      'REGIME_SYMPATHIZER': 'Ideological alignment with regime positions without operational ties.',
      'NEUTRAL': 'No significant indicators of regime connection or alignment.',
      'OPPOSITION_ALIGNED': 'Aligned with Iranian opposition movements against the regime.',
      'UNKNOWN': 'Insufficient data for classification.'
    };
    return descriptions[classification];
  }

  private getAlignmentIcon(alignment: RegimeAlignment): string {
    const icons: Record<RegimeAlignment, string> = {
      'CONFIRMED_REGIME': '🔴 REGIME',
      'KNOWN_PROXY': '🟠 PROXY',
      'SUSPECTED_PROXY': '🟡 SUSPECTED',
      'REGIME_FRIENDLY': '🟡 FRIENDLY',
      'NEUTRAL': '⚪ NEUTRAL',
      'OPPOSITION_FRIENDLY': '🟢 OPP-FRIENDLY',
      'CONFIRMED_OPPOSITION': '🟢 OPPOSITION',
      'UNKNOWN': '⚫ UNKNOWN'
    };
    return icons[alignment];
  }

  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

export const intelligenceVisualizer = new IntelligenceVisualizer();
