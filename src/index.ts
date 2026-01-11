/**
 * Rosva: Deep Agentic Person Research System
 *
 * A comprehensive multi-agent system for OSINT research on individuals,
 * leveraging RuVector's self-learning vector database and GNN-enhanced retrieval.
 */

export { RosvaOrchestrator } from './orchestrator';
export type {
  RosvaConfig,
  ResearchRequest,
  ResearchResult,
  PersonEntity,
  Finding,
  Source,
  Relationship,
  TimelineEvent
} from './orchestrator';

export { VectorStore } from './vector';
export { GraphManager } from './graph';
export { VerificationEngine } from './verification';
export { ReportGenerator } from './reports';

export {
  AgentSwarm,
  BaseAgent,
  PublicRecordsAgent,
  SocialMediaAgent,
  CorporateAgent,
  MediaAgent,
  NetworkAgent
} from './agents';

// Quick start function
import { RosvaOrchestrator, ResearchRequest, ResearchResult } from './orchestrator';

/**
 * Quick research function for simple use cases
 */
export async function research(
  name: string,
  options?: Partial<ResearchRequest>
): Promise<ResearchResult> {
  const orchestrator = new RosvaOrchestrator({
    vectorDB: { provider: 'ruvector', gnnEnabled: true },
    agents: ['public-records', 'social-media', 'corporate', 'media', 'network'],
    verification: { minSources: 2, crossReference: true }
  });

  return orchestrator.research({
    name,
    depth: 'standard',
    ...options
  });
}

// Default export
export default RosvaOrchestrator;
