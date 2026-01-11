/**
 * PRISM - Open-Source Truth & Accountability Engine
 *
 * An intelligence research system for narrative and influence analysis
 * using open-source intelligence (OSINT) methodologies.
 *
 * Features:
 * - Gather deep intelligence on funding, critics, and coalitions
 * - Map complete family networks with all members
 * - Document all organizations and initiatives
 * - Build advisor networks
 * - Create complete timelines
 * - Document foreign relations matrices
 * - Track position evolution and controversies
 * - Map opposition ecosystem relationships
 * - Document funding and influence operations
 * - Generate visualizations and exports
 *
 * Methodology:
 * - All data from publicly available records
 * - No private data collected
 * - No speculation - source-anchored only
 * - Evidence-based documentation
 */

// Core types
export * from './core/types';

// Core modules
export { PRISMOrchestrator, SearchResult } from './core/orchestrator';
export { PRISMVisualizer } from './core/visualizer';

// Research agents
export { BaseAgent } from './agents/base-agent';
export { BiographyAgent } from './agents/biography-agent';
export { NetworkAgent } from './agents/network-agent';
export { PoliticalAgent } from './agents/political-agent';
export { FundingMediaAgent } from './agents/funding-agent';

/**
 * Quick start example:
 *
 * ```typescript
 * import { PRISMOrchestrator, PRISMVisualizer, SearchResult } from 'prism';
 *
 * // Your search results from any search API
 * const searchResults: SearchResult[] = [
 *   {
 *     title: 'Person Name - Wikipedia',
 *     url: 'https://en.wikipedia.org/wiki/Person_Name',
 *     snippet: 'Person Name is a notable figure...',
 *     source: 'Wikipedia'
 *   },
 *   // ... more results from your search API
 * ];
 *
 * async function research(name: string) {
 *   const orchestrator = new PRISMOrchestrator({
 *     depth: 'DEEP',
 *     includeControversies: true,
 *     includeFunding: true,
 *     includeOpposition: true
 *   });
 *
 *   const report = await orchestrator.research(name, searchResults);
 *
 *   const visualizer = new PRISMVisualizer();
 *
 *   // Generate ASCII visualization
 *   console.log(visualizer.generate(report));
 *
 *   // Generate Mermaid diagram
 *   console.log(visualizer.generateMermaid(report));
 *
 *   // Export to JSON
 *   const json = visualizer.exportJSON(report);
 * }
 *
 * research('Person Name');
 * ```
 */
