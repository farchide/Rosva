/**
 * Agent Swarm Coordinator
 *
 * Manages multiple research agents, coordinates their work,
 * and aggregates findings using attention-based mechanisms.
 */

import { BaseAgent, Finding, ResearchContext } from './base';

export interface SwarmConfig {
  maxConcurrentAgents: number;
  coordinationStrategy: 'parallel' | 'sequential' | 'hierarchical';
  attentionMechanism: 'flash' | 'multi-head' | 'linear';
}

interface AgentStatus {
  id: string;
  type: string;
  status: 'idle' | 'researching' | 'completed' | 'error';
  findingsCount: number;
  lastActivity: Date;
}

export class AgentSwarm {
  private agents: Map<string, BaseAgent> = new Map();
  private agentStatus: Map<string, AgentStatus> = new Map();
  private config: SwarmConfig;

  constructor(config?: Partial<SwarmConfig>) {
    this.config = {
      maxConcurrentAgents: 10,
      coordinationStrategy: 'parallel',
      attentionMechanism: 'flash',
      ...config
    };
  }

  /**
   * Register an agent with the swarm
   */
  async registerAgent(type: string, agent: BaseAgent): Promise<void> {
    this.agents.set(type, agent);
    this.agentStatus.set(type, {
      id: type,
      type,
      status: 'idle',
      findingsCount: 0,
      lastActivity: new Date()
    });
  }

  /**
   * Get an agent by type
   */
  getAgent(type: string): BaseAgent | undefined {
    return this.agents.get(type);
  }

  /**
   * Get all registered agent types
   */
  getAgentTypes(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get status of all agents
   */
  getSwarmStatus(): AgentStatus[] {
    return Array.from(this.agentStatus.values());
  }

  /**
   * Dispatch all agents to research a subject
   */
  async dispatchAll(context: ResearchContext): Promise<Finding[]> {
    const allFindings: Finding[] = [];

    switch (this.config.coordinationStrategy) {
      case 'parallel':
        return this.dispatchParallel(context);
      case 'sequential':
        return this.dispatchSequential(context);
      case 'hierarchical':
        return this.dispatchHierarchical(context);
      default:
        return this.dispatchParallel(context);
    }
  }

  /**
   * Parallel dispatch - all agents work simultaneously
   */
  private async dispatchParallel(context: ResearchContext): Promise<Finding[]> {
    const promises = Array.from(this.agents.entries()).map(
      async ([type, agent]) => {
        this.updateStatus(type, 'researching');

        try {
          const findings = await agent.research(context);
          this.updateStatus(type, 'completed', findings.length);
          return findings;
        } catch (error) {
          console.error(`Agent ${type} error:`, error);
          this.updateStatus(type, 'error');
          return [];
        }
      }
    );

    const results = await Promise.all(promises);
    const allFindings = results.flat();

    // Apply attention-based deduplication and ranking
    return this.applyAttention(allFindings);
  }

  /**
   * Sequential dispatch - agents work one at a time
   */
  private async dispatchSequential(context: ResearchContext): Promise<Finding[]> {
    const allFindings: Finding[] = [];

    for (const [type, agent] of this.agents) {
      this.updateStatus(type, 'researching');

      try {
        const findings = await agent.research(context);
        this.updateStatus(type, 'completed', findings.length);
        allFindings.push(...findings);
      } catch (error) {
        console.error(`Agent ${type} error:`, error);
        this.updateStatus(type, 'error');
      }
    }

    return this.applyAttention(allFindings);
  }

  /**
   * Hierarchical dispatch - coordinator assigns work based on initial findings
   */
  private async dispatchHierarchical(context: ResearchContext): Promise<Finding[]> {
    const allFindings: Finding[] = [];

    // Phase 1: Quick broad search with fast agents
    const quickAgents = ['social-media', 'media'];
    const quickPromises = quickAgents
      .filter(type => this.agents.has(type))
      .map(async type => {
        const agent = this.agents.get(type)!;
        this.updateStatus(type, 'researching');

        try {
          const findings = await agent.research({ ...context, depth: 'quick' });
          this.updateStatus(type, 'completed', findings.length);
          return findings;
        } catch (error) {
          this.updateStatus(type, 'error');
          return [];
        }
      });

    const quickResults = await Promise.all(quickPromises);
    allFindings.push(...quickResults.flat());

    // Phase 2: Extract leads from initial findings
    const leads = this.extractLeads(allFindings);

    // Phase 3: Deep dive with specialized agents based on leads
    const deepAgents = ['public-records', 'corporate', 'network'];
    const enrichedContext = { ...context, focusAreas: leads };

    const deepPromises = deepAgents
      .filter(type => this.agents.has(type))
      .map(async type => {
        const agent = this.agents.get(type)!;
        this.updateStatus(type, 'researching');

        try {
          const findings = await agent.research(enrichedContext);
          this.updateStatus(type, 'completed', findings.length);
          return findings;
        } catch (error) {
          this.updateStatus(type, 'error');
          return [];
        }
      });

    const deepResults = await Promise.all(deepPromises);
    allFindings.push(...deepResults.flat());

    return this.applyAttention(allFindings);
  }

  /**
   * Extract leads (organizations, people, topics) from findings
   */
  private extractLeads(findings: Finding[]): string[] {
    const leads = new Set<string>();

    for (const finding of findings) {
      // Extract organization mentions
      const orgPatterns = finding.claim.match(/(?:at|with|for|of)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/g);
      if (orgPatterns) {
        orgPatterns.forEach(match => {
          const org = match.replace(/^(?:at|with|for|of)\s+/, '');
          leads.add(org);
        });
      }
    }

    return Array.from(leads).slice(0, 10); // Limit to top 10 leads
  }

  /**
   * Apply attention mechanism for deduplication and ranking
   */
  private applyAttention(findings: Finding[]): Finding[] {
    // Group similar findings
    const groups = this.groupSimilarFindings(findings);

    // Merge and rank
    const merged: Finding[] = [];

    for (const group of groups) {
      if (group.length === 1) {
        merged.push(group[0]);
      } else {
        // Merge similar findings
        const best = this.mergeFindingGroup(group);
        merged.push(best);
      }
    }

    // Sort by confidence
    merged.sort((a, b) => b.confidence - a.confidence);

    return merged;
  }

  /**
   * Group similar findings based on content overlap
   */
  private groupSimilarFindings(findings: Finding[]): Finding[][] {
    const groups: Finding[][] = [];
    const used = new Set<string>();

    for (const finding of findings) {
      if (used.has(finding.id)) continue;

      const group = [finding];
      used.add(finding.id);

      for (const other of findings) {
        if (used.has(other.id)) continue;
        if (this.areSimilar(finding, other)) {
          group.push(other);
          used.add(other.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Check if two findings are similar
   */
  private areSimilar(a: Finding, b: Finding): boolean {
    if (a.subject !== b.subject) return false;
    if (a.type !== b.type) return false;

    // Simple word overlap check
    const wordsA = new Set(a.claim.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.claim.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) overlap++;
    }

    const similarity = overlap / Math.max(wordsA.size, wordsB.size);
    return similarity > 0.5;
  }

  /**
   * Merge a group of similar findings
   */
  private mergeFindingGroup(group: Finding[]): Finding {
    // Take the finding with highest confidence as base
    group.sort((a, b) => b.confidence - a.confidence);
    const base = { ...group[0] };

    // Combine sources from all findings
    const allSources = new Map<string, any>();
    for (const finding of group) {
      for (const source of finding.sources) {
        allSources.set(source.id, source);
      }
    }
    base.sources = Array.from(allSources.values());

    // Combine evidence
    const allEvidence = new Map<string, any>();
    for (const finding of group) {
      for (const evidence of finding.evidence) {
        const key = `${evidence.type}-${evidence.source.id}`;
        if (!allEvidence.has(key)) {
          allEvidence.set(key, evidence);
        }
      }
    }
    base.evidence = Array.from(allEvidence.values());

    // Boost confidence for corroborated findings
    const corroborationBoost = Math.min(group.length * 0.1, 0.3);
    base.confidence = Math.min(base.confidence + corroborationBoost, 1.0);

    return base;
  }

  /**
   * Update agent status
   */
  private updateStatus(
    type: string,
    status: 'idle' | 'researching' | 'completed' | 'error',
    findingsCount?: number
  ): void {
    const current = this.agentStatus.get(type);
    if (current) {
      current.status = status;
      current.lastActivity = new Date();
      if (findingsCount !== undefined) {
        current.findingsCount = findingsCount;
      }
    }
  }
}

export default AgentSwarm;
