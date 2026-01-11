/**
 * Rosva Research Orchestrator
 *
 * Coordinates multi-agent deep research on individuals using RuVector
 * for self-learning vector storage and GNN-enhanced retrieval.
 */

import { VectorStore } from '../vector';
import { GraphManager } from '../graph';
import { VerificationEngine } from '../verification';
import { ReportGenerator } from '../reports';
import {
  AgentSwarm,
  PublicRecordsAgent,
  SocialMediaAgent,
  CorporateAgent,
  MediaAgent,
  NetworkAgent
} from '../agents';

// Types
export interface RosvaConfig {
  vectorDB: {
    provider: 'ruvector';
    gnnEnabled: boolean;
    embeddingDimensions?: number;
  };
  agents: AgentType[];
  verification: {
    minSources: number;
    crossReference: boolean;
    contradictionThreshold?: number;
  };
  output?: {
    format: OutputFormat;
    includeGraph?: boolean;
    includeTimeline?: boolean;
  };
}

export type AgentType =
  | 'public-records'
  | 'social-media'
  | 'corporate'
  | 'media'
  | 'academic'
  | 'events'
  | 'network';

export type OutputFormat = 'json' | 'markdown' | 'html' | 'structured-report';

export interface ResearchRequest {
  name: string;
  context?: string;
  aliases?: string[];
  knownAffiliations?: string[];
  depth: 'quick' | 'standard' | 'comprehensive';
  focusAreas?: string[];
  excludeSources?: string[];
  outputFormat?: OutputFormat;
}

export interface ResearchResult {
  subject: PersonEntity;
  findings: Finding[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  verificationSummary: VerificationSummary;
  sources: Source[];
  report: GeneratedReport;
  metadata: {
    researchDuration: number;
    agentsUsed: string[];
    sourcesSearched: number;
    findingsCount: number;
    verifiedCount: number;
  };
}

export interface PersonEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  identifiers: Identifier[];
  attributes: Attribute[];
  embedding?: Float32Array;
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

export interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  evidence: Source[];
  timeframe?: { start?: Date; end?: Date };
}

export interface TimelineEvent {
  date: Date;
  type: string;
  description: string;
  sources: Source[];
  entities: string[];
}

interface Identifier {
  type: string;
  value: string;
  verified: boolean;
}

interface Attribute {
  key: string;
  value: any;
  sources: Source[];
  confidence: number;
  asOf: Date;
}

interface Evidence {
  type: string;
  content: string;
  source: Source;
}

interface VerificationSummary {
  totalFindings: number;
  verified: number;
  partiallyVerified: number;
  unverified: number;
  contradicted: number;
  overallConfidence: number;
}

interface GeneratedReport {
  format: OutputFormat;
  content: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  content: string;
  findings: Finding[];
}

/**
 * Main orchestrator for deep person research
 */
export class RosvaOrchestrator {
  private config: RosvaConfig;
  private vectorStore: VectorStore;
  private graphManager: GraphManager;
  private verificationEngine: VerificationEngine;
  private reportGenerator: ReportGenerator;
  private agentSwarm: AgentSwarm;
  private initialized: boolean = false;

  constructor(config: RosvaConfig) {
    this.config = config;
    this.vectorStore = new VectorStore(config.vectorDB);
    this.graphManager = new GraphManager();
    this.verificationEngine = new VerificationEngine(config.verification);
    this.reportGenerator = new ReportGenerator();
    this.agentSwarm = new AgentSwarm();
  }

  /**
   * Initialize all components
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[Rosva] Initializing components...');

    // Initialize vector store with RuVector
    await this.vectorStore.initialize();

    // Initialize graph manager
    await this.graphManager.initialize();

    // Register agents based on config
    await this.registerAgents();

    this.initialized = true;
    console.log('[Rosva] Initialization complete');
  }

  /**
   * Register research agents based on configuration
   */
  private async registerAgents(): Promise<void> {
    const agentMap: Record<AgentType, new () => any> = {
      'public-records': PublicRecordsAgent,
      'social-media': SocialMediaAgent,
      'corporate': CorporateAgent,
      'media': MediaAgent,
      'academic': MediaAgent, // TODO: Implement AcademicAgent
      'events': MediaAgent,   // TODO: Implement EventsAgent
      'network': NetworkAgent
    };

    for (const agentType of this.config.agents) {
      const AgentClass = agentMap[agentType];
      if (AgentClass) {
        const agent = new AgentClass();
        await this.agentSwarm.registerAgent(agentType, agent);
        console.log(`[Rosva] Registered agent: ${agentType}`);
      }
    }
  }

  /**
   * Conduct deep research on a person
   */
  async research(request: ResearchRequest): Promise<ResearchResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    console.log(`[Rosva] Starting research on: ${request.name}`);

    // Phase 1: Create research plan
    const plan = await this.createResearchPlan(request);
    console.log(`[Rosva] Research plan created with ${plan.queries.length} queries`);

    // Phase 2: Initialize subject entity
    const subject = await this.initializeSubject(request);

    // Phase 3: Dispatch agents for data collection
    const rawFindings = await this.collectData(plan, request);
    console.log(`[Rosva] Collected ${rawFindings.length} raw findings`);

    // Phase 4: Build relationship graph
    const relationships = await this.buildRelationshipGraph(subject, rawFindings);
    console.log(`[Rosva] Mapped ${relationships.length} relationships`);

    // Phase 5: Verify findings
    const verifiedFindings = await this.verifyFindings(rawFindings);
    const verificationSummary = this.summarizeVerification(verifiedFindings);
    console.log(`[Rosva] Verified ${verificationSummary.verified}/${verificationSummary.totalFindings} findings`);

    // Phase 6: Build timeline
    const timeline = this.buildTimeline(verifiedFindings);

    // Phase 7: Generate report
    const sources = this.extractSources(verifiedFindings);
    const report = await this.reportGenerator.generate({
      subject,
      findings: verifiedFindings,
      relationships,
      timeline,
      sources,
      format: request.outputFormat || 'structured-report'
    });

    // Phase 8: Store embeddings for future learning
    await this.storeForLearning(subject, verifiedFindings, relationships);

    const duration = Date.now() - startTime;
    console.log(`[Rosva] Research complete in ${duration}ms`);

    return {
      subject,
      findings: verifiedFindings,
      relationships,
      timeline,
      verificationSummary,
      sources,
      report,
      metadata: {
        researchDuration: duration,
        agentsUsed: this.config.agents,
        sourcesSearched: sources.length,
        findingsCount: verifiedFindings.length,
        verifiedCount: verificationSummary.verified
      }
    };
  }

  /**
   * Create a research plan with prioritized queries
   */
  private async createResearchPlan(request: ResearchRequest): Promise<ResearchPlan> {
    const queries: string[] = [];
    const depth = request.depth;

    // Base queries
    queries.push(`"${request.name}"`);

    if (request.aliases) {
      request.aliases.forEach(alias => queries.push(`"${alias}"`));
    }

    // Context-specific queries
    if (request.context) {
      queries.push(`"${request.name}" ${request.context}`);
    }

    // Affiliation queries
    if (request.knownAffiliations) {
      request.knownAffiliations.forEach(affiliation => {
        queries.push(`"${request.name}" "${affiliation}"`);
      });
    }

    // Depth-based expansion
    if (depth === 'comprehensive' || depth === 'standard') {
      queries.push(`"${request.name}" biography`);
      queries.push(`"${request.name}" interview`);
      queries.push(`"${request.name}" statement`);
      queries.push(`"${request.name}" organization`);
    }

    if (depth === 'comprehensive') {
      queries.push(`"${request.name}" controversy`);
      queries.push(`"${request.name}" funding`);
      queries.push(`"${request.name}" political`);
      queries.push(`"${request.name}" conference speech`);
    }

    // Focus area queries
    if (request.focusAreas) {
      request.focusAreas.forEach(area => {
        queries.push(`"${request.name}" "${area}"`);
      });
    }

    return {
      subject: request.name,
      queries,
      depth,
      agentAssignments: this.assignQueriesToAgents(queries)
    };
  }

  /**
   * Assign queries to appropriate agents
   */
  private assignQueriesToAgents(queries: string[]): Map<AgentType, string[]> {
    const assignments = new Map<AgentType, string[]>();

    // Each agent gets all queries but processes them according to their specialty
    for (const agentType of this.config.agents) {
      assignments.set(agentType, [...queries]);
    }

    return assignments;
  }

  /**
   * Initialize a subject entity
   */
  private async initializeSubject(request: ResearchRequest): Promise<PersonEntity> {
    const id = this.generateEntityId(request.name);

    // Check if we have existing data
    const existing = await this.vectorStore.findPerson(request.name);

    if (existing) {
      console.log(`[Rosva] Found existing entity for ${request.name}`);
      return existing;
    }

    return {
      id,
      canonicalName: request.name,
      aliases: request.aliases || [],
      identifiers: [],
      attributes: []
    };
  }

  /**
   * Dispatch agents to collect data
   */
  private async collectData(plan: ResearchPlan, request: ResearchRequest): Promise<Finding[]> {
    const allFindings: Finding[] = [];

    // Run agents in parallel based on depth
    const agentPromises = Array.from(plan.agentAssignments.entries()).map(
      async ([agentType, queries]) => {
        const agent = this.agentSwarm.getAgent(agentType);
        if (!agent) return [];

        try {
          const findings = await agent.research({
            subject: request.name,
            queries,
            context: request.context,
            depth: request.depth
          });
          return findings;
        } catch (error) {
          console.error(`[Rosva] Agent ${agentType} error:`, error);
          return [];
        }
      }
    );

    const results = await Promise.all(agentPromises);
    results.forEach(findings => allFindings.push(...findings));

    return allFindings;
  }

  /**
   * Build relationship graph from findings
   */
  private async buildRelationshipGraph(
    subject: PersonEntity,
    findings: Finding[]
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    for (const finding of findings) {
      const extracted = await this.graphManager.extractRelationships(
        subject.canonicalName,
        finding
      );
      relationships.push(...extracted);
    }

    // Store in graph
    await this.graphManager.storeRelationships(subject.id, relationships);

    return relationships;
  }

  /**
   * Verify findings using the verification engine
   */
  private async verifyFindings(findings: Finding[]): Promise<Finding[]> {
    return this.verificationEngine.verifyAll(findings);
  }

  /**
   * Summarize verification results
   */
  private summarizeVerification(findings: Finding[]): VerificationSummary {
    const summary: VerificationSummary = {
      totalFindings: findings.length,
      verified: 0,
      partiallyVerified: 0,
      unverified: 0,
      contradicted: 0,
      overallConfidence: 0
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

    summary.overallConfidence = findings.length > 0
      ? totalConfidence / findings.length
      : 0;

    return summary;
  }

  /**
   * Build timeline from findings
   */
  private buildTimeline(findings: Finding[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    for (const finding of findings) {
      if (finding.timestamp) {
        events.push({
          date: finding.timestamp,
          type: finding.type,
          description: finding.claim,
          sources: finding.sources,
          entities: [finding.subject]
        });
      }
    }

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }

  /**
   * Extract all unique sources
   */
  private extractSources(findings: Finding[]): Source[] {
    const sourceMap = new Map<string, Source>();

    for (const finding of findings) {
      for (const source of finding.sources) {
        if (!sourceMap.has(source.id)) {
          sourceMap.set(source.id, source);
        }
      }
    }

    return Array.from(sourceMap.values());
  }

  /**
   * Store data for future learning
   */
  private async storeForLearning(
    subject: PersonEntity,
    findings: Finding[],
    relationships: Relationship[]
  ): Promise<void> {
    // Generate and store embedding for the subject
    const embedding = await this.vectorStore.generateEmbedding(
      `${subject.canonicalName} ${subject.aliases.join(' ')} ` +
      findings.map(f => f.claim).join(' ')
    );

    subject.embedding = embedding;
    await this.vectorStore.storePerson(subject);

    // Store findings for GNN learning
    for (const finding of findings) {
      await this.vectorStore.storeFinding(finding);
    }
  }

  /**
   * Generate a unique entity ID
   */
  private generateEntityId(name: string): string {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now().toString(36);
    return `person-${normalized}-${timestamp}`;
  }

  /**
   * Query existing knowledge about a person
   */
  async query(name: string): Promise<PersonEntity | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.vectorStore.findPerson(name);
  }

  /**
   * Get relationship network for a person
   */
  async getNetwork(name: string, depth: number = 2): Promise<Relationship[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.graphManager.getNetwork(name, depth);
  }
}

interface ResearchPlan {
  subject: string;
  queries: string[];
  depth: 'quick' | 'standard' | 'comprehensive';
  agentAssignments: Map<AgentType, string[]>;
}

export default RosvaOrchestrator;
