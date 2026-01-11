/**
 * Shared Types for Rosva
 *
 * Central type definitions used across all modules.
 */

// ============ Core Entities ============

export interface PersonEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  identifiers: Identifier[];
  attributes: Attribute[];
  embedding?: Float32Array;
}

export interface Identifier {
  type: string;
  value: string;
  verified: boolean;
}

export interface Attribute {
  key: string;
  value: any;
  sources: Source[];
  confidence: number;
  asOf: Date;
}

// ============ Findings ============

export interface Finding {
  id: string;
  type: string;
  subject: string;
  claim: string;
  evidence: Evidence[];
  sources: Source[];
  confidence: number;
  verificationStatus: VerificationStatus;
  contradictions?: Finding[];
  timestamp: Date;
}

export type VerificationStatus =
  | 'unverified'
  | 'partially_verified'
  | 'verified'
  | 'contradicted';

export interface Evidence {
  type: string;
  content: string;
  source: Source;
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

// ============ Relationships ============

export interface Relationship {
  from: string;
  to: string;
  type: RelationshipType;
  strength: number;
  evidence: Source[];
  timeframe?: { start?: Date; end?: Date };
  properties?: Record<string, any>;
}

export type RelationshipType =
  | 'AFFILIATED_WITH'
  | 'WORKED_WITH'
  | 'SPOKE_AT'
  | 'QUOTED_BY'
  | 'FUNDED_BY'
  | 'MEMBER_OF'
  | 'CONNECTED_TO'
  | 'APPEARED_WITH'
  | 'OPPOSES'
  | 'SUPPORTS';

// ============ Timeline ============

export interface TimelineEvent {
  date: Date;
  type: string;
  description: string;
  sources: Source[];
  entities: string[];
}

// ============ Reports ============

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

export type OutputFormat = 'json' | 'markdown' | 'html' | 'structured-report';

// ============ Research Configuration ============

export interface RosvaConfig {
  vectorDB: {
    provider: 'ruvector' | 'memory';
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
  metadata: ResearchMetadata;
}

export interface VerificationSummary {
  totalFindings: number;
  verified: number;
  partiallyVerified: number;
  unverified: number;
  contradicted: number;
  overallConfidence: number;
}

export interface ResearchMetadata {
  researchDuration: number;
  agentsUsed: string[];
  sourcesSearched: number;
  findingsCount: number;
  verifiedCount: number;
}

// ============ Agent Types ============

export interface AgentConfig {
  name: string;
  sourceTypes: string[];
  maxConcurrentRequests: number;
  rateLimitPerMinute: number;
  timeout: number;
}

export interface ResearchContext {
  subject: string;
  queries: string[];
  context?: string;
  depth: 'quick' | 'standard' | 'comprehensive';
  focusAreas?: string[];
}
