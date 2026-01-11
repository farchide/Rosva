/**
 * Network Agent
 *
 * Analyzes relationship networks and connections:
 * - Co-appearances
 * - Organizational overlaps
 * - Event co-attendance
 * - Collaborative projects
 * - Influence mapping
 */

import { BaseAgent, ResearchContext, Finding, Source, Evidence, AgentConfig } from './base';

const DEFAULT_CONFIG: AgentConfig = {
  name: 'NetworkAgent',
  sourceTypes: ['relationship', 'event', 'collaboration'],
  maxConcurrentRequests: 5,
  rateLimitPerMinute: 30,
  timeout: 30000
};

interface Connection {
  person: string;
  relationshipType: ConnectionType;
  strength: number;
  evidence: ConnectionEvidence[];
  organizations?: string[];
  events?: string[];
  firstSeen?: Date;
  lastSeen?: Date;
}

type ConnectionType =
  | 'colleague'
  | 'co-speaker'
  | 'co-board-member'
  | 'co-author'
  | 'interviewer'
  | 'mentioned-together'
  | 'organizational-ally'
  | 'organizational-rival';

interface ConnectionEvidence {
  type: string;
  description: string;
  date?: Date;
  url?: string;
}

interface NetworkMetrics {
  totalConnections: number;
  strongConnections: number;
  organizationalTies: number;
  influenceScore: number;
  clusterMemberships: string[];
}

export class NetworkAgent extends BaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Research network connections for a subject
   */
  async research(context: ResearchContext): Promise<Finding[]> {
    this.log(`Starting network analysis for: ${context.subject}`);
    const findings: Finding[] = [];

    // Find direct connections
    await this.rateLimit();
    const connections = await this.findConnections(context);
    findings.push(...this.processConnections(connections, context.subject));

    // Analyze organizational networks
    if (context.depth !== 'quick') {
      await this.rateLimit();
      const orgNetworks = await this.analyzeOrganizationalNetworks(context);
      findings.push(...orgNetworks);
    }

    // Calculate network metrics
    if (context.depth === 'comprehensive') {
      const metrics = this.calculateNetworkMetrics(connections);
      findings.push(this.createMetricsFinding(metrics, context.subject));
    }

    this.log(`Found ${findings.length} findings`);
    return findings;
  }

  /**
   * Find connections to the subject
   */
  private async findConnections(context: ResearchContext): Promise<Connection[]> {
    const connections: Connection[] = [];

    // Search for co-appearances
    const coAppearances = await this.findCoAppearances(context.subject);
    connections.push(...coAppearances);

    // Search for organizational overlaps
    const orgOverlaps = await this.findOrganizationalOverlaps(context.subject);
    connections.push(...orgOverlaps);

    // Merge duplicate connections
    return this.mergeConnections(connections);
  }

  /**
   * Find co-appearances (events, media, etc.)
   */
  private async findCoAppearances(subject: string): Promise<Connection[]> {
    // Would search for:
    // - Conference speaker lists
    // - Panel discussions
    // - Joint interviews
    // - Co-authored pieces

    // Placeholder implementation
    return [];
  }

  /**
   * Find organizational overlaps
   */
  private async findOrganizationalOverlaps(subject: string): Promise<Connection[]> {
    // Would search for:
    // - Shared board memberships
    // - Same organization employees
    // - Coalition memberships
    // - Funding relationships

    // Placeholder implementation
    return [];
  }

  /**
   * Merge duplicate connections
   */
  private mergeConnections(connections: Connection[]): Connection[] {
    const merged = new Map<string, Connection>();

    for (const conn of connections) {
      const key = conn.person.toLowerCase();

      if (merged.has(key)) {
        const existing = merged.get(key)!;
        existing.evidence.push(...conn.evidence);
        existing.strength = Math.max(existing.strength, conn.strength);

        if (conn.organizations) {
          existing.organizations = [
            ...(existing.organizations || []),
            ...conn.organizations
          ];
        }
        if (conn.events) {
          existing.events = [...(existing.events || []), ...conn.events];
        }
      } else {
        merged.set(key, { ...conn });
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Analyze organizational network patterns
   */
  private async analyzeOrganizationalNetworks(
    context: ResearchContext
  ): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Would analyze:
    // - Shared organization memberships
    // - Coalition patterns
    // - Funding network overlaps

    // Placeholder implementation
    return findings;
  }

  /**
   * Calculate network metrics
   */
  private calculateNetworkMetrics(connections: Connection[]): NetworkMetrics {
    const strongConnections = connections.filter(c => c.strength > 0.7);
    const orgTies = connections.filter(c =>
      c.relationshipType === 'colleague' ||
      c.relationshipType === 'co-board-member'
    );

    // Simple influence score based on connection count and strength
    const influenceScore = connections.reduce(
      (sum, c) => sum + c.strength, 0
    ) / Math.max(connections.length, 1);

    return {
      totalConnections: connections.length,
      strongConnections: strongConnections.length,
      organizationalTies: orgTies.length,
      influenceScore,
      clusterMemberships: this.identifyClusters(connections)
    };
  }

  /**
   * Identify cluster memberships
   */
  private identifyClusters(connections: Connection[]): string[] {
    const clusters = new Set<string>();

    for (const conn of connections) {
      if (conn.organizations) {
        conn.organizations.forEach(org => clusters.add(org));
      }
    }

    return Array.from(clusters).slice(0, 5);
  }

  /**
   * Process connections into findings
   */
  private processConnections(
    connections: Connection[],
    subject: string
  ): Finding[] {
    // Sort by strength
    const sorted = [...connections].sort((a, b) => b.strength - a.strength);

    return sorted.slice(0, 20).map(conn => {
      const sources = conn.evidence
        .filter(e => e.url)
        .map(e => this.createSource(
          e.url!,
          e.description,
          'connection_evidence',
          e.date,
          0.6
        ));

      const evidence: Evidence[] = conn.evidence.map(e => ({
        type: 'connection',
        content: e.description,
        source: sources[0] || this.createSource(
          'internal://network-analysis',
          'Network analysis',
          'analysis',
          undefined,
          0.5
        )
      }));

      const sharedContext = [
        ...(conn.organizations?.slice(0, 2) || []),
        ...(conn.events?.slice(0, 2) || [])
      ].join(', ');

      const claim = `Connected to ${conn.person} (${conn.relationshipType})${
        sharedContext ? ` via ${sharedContext}` : ''
      }`;

      return this.createFinding(
        'network_connection',
        subject,
        claim,
        evidence,
        sources.length > 0 ? sources : [],
        conn.strength,
        conn.lastSeen
      );
    });
  }

  /**
   * Create a finding from network metrics
   */
  private createMetricsFinding(
    metrics: NetworkMetrics,
    subject: string
  ): Finding {
    const claim = `Network analysis: ${metrics.totalConnections} connections identified, ` +
      `${metrics.strongConnections} strong ties, ` +
      `influence score ${metrics.influenceScore.toFixed(2)}`;

    return this.createFinding(
      'network_analysis',
      subject,
      claim,
      [],
      [],
      0.7
    );
  }
}

export default NetworkAgent;
