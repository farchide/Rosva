/**
 * Report Generator
 *
 * Generates structured research reports from findings.
 */

export interface ReportRequest {
  subject: PersonEntity;
  findings: Finding[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  sources: Source[];
  format: OutputFormat;
}

export type OutputFormat = 'json' | 'markdown' | 'html' | 'structured-report';

export interface GeneratedReport {
  format: OutputFormat;
  content: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: string;
  findings: Finding[];
}

interface PersonEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  identifiers: any[];
  attributes: any[];
}

type VerificationStatus = 'unverified' | 'partially_verified' | 'verified' | 'contradicted';

interface Finding {
  id: string;
  type: string;
  subject: string;
  claim: string;
  evidence: Evidence[];
  confidence: number;
  verificationStatus: VerificationStatus;
  sources: Source[];
  contradictions?: Finding[];
  timestamp: Date;
}

interface Evidence {
  type: string;
  content: string;
  source: Source;
}

interface Source {
  id: string;
  url: string;
  title: string;
  type: string;
  publishedDate?: Date;
  accessedDate: Date;
  reliabilityScore: number;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
}

interface TimelineEvent {
  date: Date;
  type: string;
  description: string;
}

/**
 * Report generator for research findings
 */
export class ReportGenerator {
  constructor() {}

  /**
   * Generate a report from research findings
   */
  async generate(request: ReportRequest): Promise<GeneratedReport> {
    switch (request.format) {
      case 'json':
        return this.generateJSON(request);
      case 'markdown':
        return this.generateMarkdown(request);
      case 'html':
        return this.generateHTML(request);
      case 'structured-report':
      default:
        return this.generateStructuredReport(request);
    }
  }

  /**
   * Generate JSON output
   */
  private generateJSON(request: ReportRequest): GeneratedReport {
    const content = JSON.stringify({
      subject: request.subject,
      findings: request.findings,
      relationships: request.relationships,
      timeline: request.timeline,
      sources: request.sources,
      generatedAt: new Date().toISOString()
    }, null, 2);

    return {
      format: 'json',
      content,
      sections: []
    };
  }

  /**
   * Generate Markdown output
   */
  private generateMarkdown(request: ReportRequest): GeneratedReport {
    const sections = this.buildSections(request);
    let content = '';

    content += `# Research Report: ${request.subject.canonicalName}\n\n`;
    content += `*Generated: ${new Date().toISOString()}*\n\n`;
    content += `---\n\n`;

    for (const section of sections) {
      content += `## ${section.title}\n\n`;
      content += section.content + '\n\n';

      if (section.findings.length > 0) {
        content += '### Key Findings\n\n';
        for (const finding of section.findings) {
          const status = this.getStatusEmoji(finding.verificationStatus);
          content += `- ${status} ${finding.claim} *(${(finding.confidence * 100).toFixed(0)}% confidence)*\n`;
        }
        content += '\n';
      }
    }

    // Sources section
    content += `## Sources\n\n`;
    const uniqueSources = new Map<string, Source>();
    for (const source of request.sources) {
      uniqueSources.set(source.id, source);
    }
    for (const [, source] of uniqueSources) {
      content += `- [${source.title}](${source.url}) *(${source.type})*\n`;
    }

    return {
      format: 'markdown',
      content,
      sections
    };
  }

  /**
   * Generate HTML output
   */
  private generateHTML(request: ReportRequest): GeneratedReport {
    const sections = this.buildSections(request);

    let content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Report: ${this.escapeHtml(request.subject.canonicalName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; }
    .finding { padding: 10px; margin: 10px 0; border-left: 3px solid #ddd; background: #f9f9f9; }
    .finding.verified { border-left-color: #4caf50; }
    .finding.unverified { border-left-color: #ff9800; }
    .finding.contradicted { border-left-color: #f44336; }
    .confidence { font-size: 0.85em; color: #666; }
    .sources { background: #f0f0f0; padding: 15px; margin-top: 30px; }
    .source-item { margin: 5px 0; }
    .timeline { border-left: 2px solid #333; padding-left: 20px; margin: 20px 0; }
    .timeline-event { margin: 15px 0; }
    .timeline-date { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <h1>Research Report: ${this.escapeHtml(request.subject.canonicalName)}</h1>
  <p><em>Generated: ${new Date().toISOString()}</em></p>
`;

    for (const section of sections) {
      content += `  <h2>${this.escapeHtml(section.title)}</h2>\n`;
      content += `  <p>${this.escapeHtml(section.content)}</p>\n`;

      if (section.findings.length > 0) {
        content += `  <h3>Key Findings</h3>\n`;
        for (const finding of section.findings) {
          const statusClass = finding.verificationStatus.replace('_', '-');
          content += `  <div class="finding ${statusClass}">
    <p>${this.escapeHtml(finding.claim)}</p>
    <p class="confidence">${(finding.confidence * 100).toFixed(0)}% confidence | ${finding.verificationStatus}</p>
  </div>\n`;
        }
      }
    }

    // Sources
    content += `  <div class="sources">
    <h2>Sources</h2>\n`;
    for (const source of request.sources) {
      content += `    <div class="source-item">
      <a href="${this.escapeHtml(source.url)}">${this.escapeHtml(source.title)}</a>
      <span>(${this.escapeHtml(source.type)})</span>
    </div>\n`;
    }
    content += `  </div>\n`;

    content += `</body>
</html>`;

    return {
      format: 'html',
      content,
      sections
    };
  }

  /**
   * Generate structured report
   */
  private generateStructuredReport(request: ReportRequest): GeneratedReport {
    const sections = this.buildSections(request);

    // Build executive summary
    const verifiedCount = request.findings.filter(
      f => f.verificationStatus === 'verified'
    ).length;
    const totalCount = request.findings.length;

    let content = `# RESEARCH REPORT: ${request.subject.canonicalName.toUpperCase()}\n\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Verification Rate: ${verifiedCount}/${totalCount} findings verified\n\n`;
    content += `---\n\n`;

    // Executive Summary
    content += `## EXECUTIVE SUMMARY\n\n`;
    content += this.generateExecutiveSummary(request);
    content += '\n\n';

    // Subject Overview
    content += `## SUBJECT OVERVIEW\n\n`;
    content += `**Name:** ${request.subject.canonicalName}\n`;
    if (request.subject.aliases.length > 0) {
      content += `**Also Known As:** ${request.subject.aliases.join(', ')}\n`;
    }
    content += '\n';

    // Detailed sections
    for (const section of sections) {
      content += `## ${section.title.toUpperCase()}\n\n`;
      content += section.content + '\n\n';

      if (section.findings.length > 0) {
        for (const finding of section.findings) {
          const status = this.getStatusBadge(finding.verificationStatus);
          content += `${status} ${finding.claim}\n`;
          content += `   Confidence: ${(finding.confidence * 100).toFixed(0)}%\n`;
          if (finding.sources.length > 0) {
            content += `   Source: ${finding.sources[0].title}\n`;
          }
          content += '\n';
        }
      }
    }

    // Relationship Network
    if (request.relationships.length > 0) {
      content += `## RELATIONSHIP NETWORK\n\n`;
      const sortedRels = [...request.relationships].sort(
        (a, b) => b.strength - a.strength
      );
      for (const rel of sortedRels.slice(0, 15)) {
        content += `- ${rel.from} --[${rel.type}]--> ${rel.to} (strength: ${(rel.strength * 100).toFixed(0)}%)\n`;
      }
      content += '\n';
    }

    // Timeline
    if (request.timeline.length > 0) {
      content += `## TIMELINE\n\n`;
      for (const event of request.timeline) {
        const dateStr = event.date.toISOString().split('T')[0];
        content += `[${dateStr}] ${event.description}\n`;
      }
      content += '\n';
    }

    // Verification Summary
    content += `## VERIFICATION SUMMARY\n\n`;
    content += `| Status | Count |\n`;
    content += `|--------|-------|\n`;
    const statusCounts = this.countByStatus(request.findings);
    for (const [status, count] of Object.entries(statusCounts)) {
      content += `| ${status} | ${count} |\n`;
    }
    content += '\n';

    // Sources
    content += `## SOURCES (${request.sources.length})\n\n`;
    const sourcesByType = this.groupSourcesByType(request.sources);
    for (const [type, sources] of Object.entries(sourcesByType)) {
      content += `### ${type.charAt(0).toUpperCase() + type.slice(1)}\n`;
      for (const source of sources) {
        content += `- ${source.title}\n  ${source.url}\n`;
      }
      content += '\n';
    }

    // Disclaimer
    content += `---\n\n`;
    content += `## DISCLAIMER\n\n`;
    content += `This report was generated using publicly available sources only. `;
    content += `Findings marked as "unverified" or "partially_verified" should be `;
    content += `independently confirmed before use. Contradicted findings indicate `;
    content += `conflicting information was discovered.\n`;

    return {
      format: 'structured-report',
      content,
      sections
    };
  }

  /**
   * Build report sections from findings
   */
  private buildSections(request: ReportRequest): ReportSection[] {
    const sections: ReportSection[] = [];

    // Group findings by type
    const findingsByType = new Map<string, Finding[]>();
    for (const finding of request.findings) {
      const type = finding.type;
      if (!findingsByType.has(type)) {
        findingsByType.set(type, []);
      }
      findingsByType.get(type)!.push(finding);
    }

    // Background section
    const backgroundTypes = ['public_record_court', 'public_record_property', 'biography'];
    const backgroundFindings = this.collectFindings(findingsByType, backgroundTypes);
    if (backgroundFindings.length > 0) {
      sections.push({
        title: 'Background',
        content: 'Verified background information from public records.',
        findings: backgroundFindings
      });
    }

    // Affiliations section
    const affiliationTypes = ['corporate_affiliation', 'organization_connection'];
    const affiliationFindings = this.collectFindings(findingsByType, affiliationTypes);
    if (affiliationFindings.length > 0) {
      sections.push({
        title: 'Organizational Affiliations',
        content: 'Corporate and organizational relationships.',
        findings: affiliationFindings
      });
    }

    // Public Statements section
    const statementTypes = ['public_statement', 'media_mention'];
    const statementFindings = this.collectFindings(findingsByType, statementTypes);
    if (statementFindings.length > 0) {
      sections.push({
        title: 'Public Statements & Media',
        content: 'Documented public statements and media coverage.',
        findings: statementFindings
      });
    }

    // Social Media section
    const socialTypes = ['social_presence', 'media_appearance'];
    const socialFindings = this.collectFindings(findingsByType, socialTypes);
    if (socialFindings.length > 0) {
      sections.push({
        title: 'Online Presence',
        content: 'Social media and online platform activity.',
        findings: socialFindings
      });
    }

    // Network section
    const networkTypes = ['network_connection', 'network_analysis'];
    const networkFindings = this.collectFindings(findingsByType, networkTypes);
    if (networkFindings.length > 0) {
      sections.push({
        title: 'Network Analysis',
        content: 'Key connections and relationship patterns.',
        findings: networkFindings
      });
    }

    // Other findings
    const coveredTypes = new Set([
      ...backgroundTypes,
      ...affiliationTypes,
      ...statementTypes,
      ...socialTypes,
      ...networkTypes
    ]);
    const otherFindings: Finding[] = [];
    for (const [type, findings] of findingsByType) {
      if (!coveredTypes.has(type)) {
        otherFindings.push(...findings);
      }
    }
    if (otherFindings.length > 0) {
      sections.push({
        title: 'Additional Findings',
        content: 'Other relevant information discovered.',
        findings: otherFindings
      });
    }

    return sections;
  }

  /**
   * Collect findings of specified types
   */
  private collectFindings(
    findingsByType: Map<string, Finding[]>,
    types: string[]
  ): Finding[] {
    const findings: Finding[] = [];
    for (const type of types) {
      const typeFindings = findingsByType.get(type) || [];
      findings.push(...typeFindings);
    }
    return findings.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(request: ReportRequest): string {
    const verified = request.findings.filter(
      f => f.verificationStatus === 'verified'
    );
    const highConfidence = verified.slice(0, 5);

    let summary = '';

    if (highConfidence.length > 0) {
      summary += 'Key verified findings:\n';
      for (const finding of highConfidence) {
        summary += `- ${finding.claim}\n`;
      }
    }

    if (request.relationships.length > 0) {
      const topConnections = request.relationships
        .filter(r => r.strength > 0.5)
        .slice(0, 3);
      if (topConnections.length > 0) {
        summary += '\nKey relationships:\n';
        for (const rel of topConnections) {
          summary += `- ${rel.type} with ${rel.to}\n`;
        }
      }
    }

    return summary || 'Insufficient verified information for summary.';
  }

  /**
   * Count findings by verification status
   */
  private countByStatus(findings: Finding[]): Record<string, number> {
    const counts: Record<string, number> = {
      verified: 0,
      partially_verified: 0,
      unverified: 0,
      contradicted: 0
    };

    for (const finding of findings) {
      counts[finding.verificationStatus] =
        (counts[finding.verificationStatus] || 0) + 1;
    }

    return counts;
  }

  /**
   * Group sources by type
   */
  private groupSourcesByType(sources: Source[]): Record<string, Source[]> {
    const groups: Record<string, Source[]> = {};

    for (const source of sources) {
      if (!groups[source.type]) {
        groups[source.type] = [];
      }
      groups[source.type].push(source);
    }

    return groups;
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'verified':
        return '[V]';
      case 'partially_verified':
        return '[P]';
      case 'unverified':
        return '[?]';
      case 'contradicted':
        return '[X]';
      default:
        return '[-]';
    }
  }

  /**
   * Get status badge for structured report
   */
  private getStatusBadge(status: string): string {
    switch (status) {
      case 'verified':
        return '[VERIFIED]';
      case 'partially_verified':
        return '[PARTIAL]';
      case 'unverified':
        return '[UNVERIFIED]';
      case 'contradicted':
        return '[CONTRADICTED]';
      default:
        return '[UNKNOWN]';
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export default ReportGenerator;
