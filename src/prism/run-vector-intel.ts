#!/usr/bin/env npx ts-node
/**
 * PRISM Vector Intelligence Runner
 *
 * Demonstrates RuVector-powered intelligence capabilities:
 * - Semantic entity search
 * - Self-learning pattern detection
 * - Document RAG pipeline
 * - Narrative analysis
 * - Cypher graph queries
 *
 * Usage:
 *   npm run vector-intel "search query"
 *   npm run vector-intel --entity "NIAC"
 *   npm run vector-intel --narrative "text to analyze"
 *   npm run vector-intel --cypher "MATCH (n:Entity) WHERE n.sanctioned = true RETURN n"
 */

import { vectorIntelligence, VectorIntelligence } from './intelligence/vector-intelligence';
import { riskEngine, intelligenceVisualizer } from './intelligence';

interface CommandOptions {
  mode: 'search' | 'entity' | 'narrative' | 'cypher' | 'document' | 'clusters' | 'demo';
  query: string;
}

function parseArgs(): CommandOptions {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { mode: 'demo', query: '' };
  }

  if (args[0] === '--entity' && args[1]) {
    return { mode: 'entity', query: args.slice(1).join(' ') };
  }

  if (args[0] === '--narrative' && args[1]) {
    return { mode: 'narrative', query: args.slice(1).join(' ') };
  }

  if (args[0] === '--cypher' && args[1]) {
    return { mode: 'cypher', query: args.slice(1).join(' ') };
  }

  if (args[0] === '--document' && args[1]) {
    return { mode: 'document', query: args.slice(1).join(' ') };
  }

  if (args[0] === '--clusters') {
    return { mode: 'clusters', query: '' };
  }

  if (args[0] === '--demo') {
    return { mode: 'demo', query: '' };
  }

  return { mode: 'search', query: args.join(' ') };
}

async function runSemanticSearch(query: string): Promise<void> {
  console.log(`\n🔍 SEMANTIC ENTITY SEARCH: "${query}"\n`);
  console.log('─'.repeat(60));

  const matches = await vectorIntelligence.searchEntities(query, 10);

  if (matches.length === 0) {
    console.log('No matches found.');
    return;
  }

  console.log(`\nFound ${matches.length} matches:\n`);

  for (const match of matches) {
    const icon = match.matchType === 'EXACT' ? '🎯' :
                match.matchType === 'ALIAS' ? '🏷️' :
                match.matchType === 'SEMANTIC' ? '🧠' : '🌐';

    const alignIcon = match.entity.metadata.regimeAlignment === 'CONFIRMED_REGIME' ? '🔴' :
                     match.entity.metadata.regimeAlignment === 'KNOWN_PROXY' ? '🟠' :
                     match.entity.metadata.regimeAlignment === 'CONFIRMED_OPPOSITION' ? '🟢' : '⚪';

    console.log(`${icon} ${match.entity.name}`);
    console.log(`   Match: ${match.matchType} (${(match.similarity * 100).toFixed(1)}%)`);
    console.log(`   Type: ${match.entity.type}`);
    console.log(`   Alignment: ${alignIcon} ${match.entity.metadata.regimeAlignment}`);
    console.log(`   Sanctioned: ${match.entity.metadata.sanctioned ? '⚠️ YES' : 'No'}`);
    console.log(`   Risk Score: ${match.entity.metadata.riskScore}%`);
    if (match.entity.metadata.aliases.length > 0) {
      console.log(`   Aliases: ${match.entity.metadata.aliases.join(', ')}`);
    }
    console.log();
  }
}

async function runEntityAnalysis(entityName: string): Promise<void> {
  console.log(`\n🎯 ENTITY DEEP ANALYSIS: "${entityName}"\n`);
  console.log('─'.repeat(60));

  // First find the entity
  const matches = await vectorIntelligence.searchEntities(entityName, 1);

  if (matches.length === 0) {
    console.log('Entity not found in database.');
    return;
  }

  const entity = matches[0].entity;

  console.log(`\n📋 ENTITY PROFILE\n`);
  console.log(`Name: ${entity.name}`);
  console.log(`Type: ${entity.type}`);
  console.log(`Regime Alignment: ${entity.metadata.regimeAlignment}`);
  console.log(`Sanctioned: ${entity.metadata.sanctioned ? 'YES ⚠️' : 'No'}`);
  console.log(`Risk Score: ${entity.metadata.riskScore}%`);
  if (entity.metadata.country) {
    console.log(`Country: ${entity.metadata.country}`);
  }
  if (entity.metadata.description) {
    console.log(`Description: ${entity.metadata.description}`);
  }
  if (entity.metadata.aliases.length > 0) {
    console.log(`Aliases: ${entity.metadata.aliases.join(', ')}`);
  }

  // Find similar entities
  console.log(`\n🔗 SIMILAR ENTITIES\n`);
  const similar = await vectorIntelligence.findSimilarEntities(entityName, 5);

  for (const sim of similar.slice(1)) { // Skip first (itself)
    console.log(`  • ${sim.entity.name} (${(sim.similarity * 100).toFixed(1)}% similar)`);
    console.log(`    ${sim.entity.metadata.regimeAlignment} | Risk: ${sim.entity.metadata.riskScore}%`);
  }

  // Run full risk assessment
  console.log(`\n📊 RUNNING FULL RISK ASSESSMENT...\n`);
  const assessment = await riskEngine.assessRisk(entityName);
  console.log(assessment.executiveSummary);
}

async function runNarrativeAnalysis(text: string): Promise<void> {
  console.log(`\n📝 NARRATIVE SEMANTIC ANALYSIS\n`);
  console.log('─'.repeat(60));
  console.log(`\nText: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n`);

  const analysis = await vectorIntelligence.analyzeNarrativeSemantics(text);

  console.log(`\n📊 ALIGNMENT SCORES\n`);

  const regimeBar = '█'.repeat(Math.round(analysis.proRegimeScore / 5)) +
                   '░'.repeat(20 - Math.round(analysis.proRegimeScore / 5));
  const oppBar = '█'.repeat(Math.round(analysis.proOppositionScore / 5)) +
                '░'.repeat(20 - Math.round(analysis.proOppositionScore / 5));

  console.log(`Pro-Regime:     [${regimeBar}] ${analysis.proRegimeScore}%`);
  console.log(`Pro-Opposition: [${oppBar}] ${analysis.proOppositionScore}%`);

  const alignmentIcon = analysis.dominantAlignment === 'REGIME' ? '🔴' :
                       analysis.dominantAlignment === 'OPPOSITION' ? '🟢' : '⚪';
  console.log(`\nDominant: ${alignmentIcon} ${analysis.dominantAlignment}`);

  if (analysis.matchedPatterns.length > 0) {
    console.log(`\n🎯 MATCHED PATTERNS (${analysis.matchedPatterns.length})\n`);
    for (const pattern of analysis.matchedPatterns.slice(0, 10)) {
      const icon = pattern.alignment === 'REGIME' ? '🔴' : '🟢';
      console.log(`  ${icon} "${pattern.pattern}" (${(pattern.similarity * 100).toFixed(1)}%)`);
    }
  }
}

async function runCypherQuery(query: string): Promise<void> {
  console.log(`\n🔮 CYPHER GRAPH QUERY\n`);
  console.log('─'.repeat(60));
  console.log(`\nQuery: ${query}\n`);

  const results = await vectorIntelligence.cypherQuery(query);

  console.log(`\nResults (${results.length}):\n`);

  for (const result of results) {
    console.log(`  • ${result.name || result.id || JSON.stringify(result)}`);
    if (result.type) console.log(`    Type: ${result.type}`);
    if (result.regimeAlignment) console.log(`    Alignment: ${result.regimeAlignment}`);
    if (result.sanctioned) console.log(`    ⚠️ SANCTIONED`);
  }
}

async function runDocumentIngestion(content: string): Promise<void> {
  console.log(`\n📄 DOCUMENT INTELLIGENCE EXTRACTION\n`);
  console.log('─'.repeat(60));

  const doc = await vectorIntelligence.ingestDocument({
    title: 'User Provided Document',
    content: content,
    source: 'User Input',
    timestamp: new Date()
  });

  console.log(`\nDocument ID: ${doc.id}`);
  console.log(`\n📍 EXTRACTED ENTITIES (${doc.extractedEntities.length}):\n`);

  for (const entity of doc.extractedEntities) {
    console.log(`  • ${entity}`);
  }

  if (doc.extractedRelationships.length > 0) {
    console.log(`\n🔗 EXTRACTED RELATIONSHIPS (${doc.extractedRelationships.length}):\n`);
    for (const rel of doc.extractedRelationships.slice(0, 10)) {
      console.log(`  ${rel.from} ─[${rel.type}]─> ${rel.to} (${(rel.confidence * 100).toFixed(0)}%)`);
    }
  }

  console.log(`\n📊 NARRATIVE ALIGNMENT:\n`);
  console.log(`  Pro-Regime: ${doc.narrativeAlignment.proRegime}%`);
  console.log(`  Pro-Opposition: ${doc.narrativeAlignment.proOpposition}%`);
}

async function runClusterDetection(): Promise<void> {
  console.log(`\n🎨 ENTITY CLUSTER DETECTION\n`);
  console.log('─'.repeat(60));

  const clusters = await vectorIntelligence.detectClusters();

  for (const cluster of clusters) {
    const icon = cluster.alignment === 'REGIME' ? '🔴' :
                cluster.alignment === 'OPPOSITION' ? '🟢' : '⚪';

    console.log(`\n${icon} ${cluster.name}`);
    console.log(`   ${cluster.description}`);
    console.log(`   Coherence: ${(cluster.coherence * 100).toFixed(0)}%`);
    console.log(`   Entities: ${cluster.entities.length}`);

    for (const entity of cluster.entities.slice(0, 5)) {
      console.log(`     • ${entity.name} (${entity.type})`);
    }
    if (cluster.entities.length > 5) {
      console.log(`     ... and ${cluster.entities.length - 5} more`);
    }
  }
}

async function runDemo(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ██████╗ ██╗   ██╗██╗   ██╗███████╗ ██████╗████████╗ ██████╗ ██████╗║
║   ██╔══██╗██║   ██║██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
║   ██████╔╝██║   ██║██║   ██║█████╗  ██║        ██║   ██║   ██║██████╔╝
║   ██╔══██╗██║   ██║╚██╗ ██╔╝██╔══╝  ██║        ██║   ██║   ██║██╔══██╗
║   ██║  ██║╚██████╔╝ ╚████╔╝ ███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║
║   ╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝║
║                                                                      ║
║           PRISM + RuVector Intelligence Integration                  ║
║                Self-Learning Vector Intelligence                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

  console.log('🚀 Demonstrating RuVector capabilities for PRISM Intelligence...\n');

  // Demo 1: Semantic Search
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 1: SEMANTIC ENTITY SEARCH');
  console.log('═'.repeat(70));
  await runSemanticSearch('Iranian state media propaganda');

  // Demo 2: Cross-language / Alias matching
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 2: ALIAS & CROSS-REFERENCE MATCHING');
  console.log('═'.repeat(70));
  await runSemanticSearch('Sepah'); // IRGC alias

  // Demo 3: Narrative Analysis
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 3: NARRATIVE SEMANTIC ANALYSIS');
  console.log('═'.repeat(70));
  await runNarrativeAnalysis(
    'The maximum pressure policy has failed. Sanctions are economic terrorism against ' +
    'innocent Iranian civilians. Iran has every right to its peaceful nuclear program ' +
    'and legitimate defense capabilities. The resistance axis stands strong against ' +
    'imperial aggression and the Zionist regime.'
  );

  // Demo 4: Opposition Narrative
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 4: OPPOSITION NARRATIVE DETECTION');
  console.log('═'.repeat(70));
  await runNarrativeAnalysis(
    'Woman Life Freedom! The Islamic Republic must go. #MahsaAmini #IranRevolution ' +
    'The IRGC are terrorists who murder their own people. We stand with the brave ' +
    'protesters demanding secular democracy and an end to the mullah regime.'
  );

  // Demo 5: Cluster Detection
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 5: ENTITY CLUSTER DETECTION');
  console.log('═'.repeat(70));
  await runClusterDetection();

  // Demo 6: Document Intelligence
  console.log('\n' + '═'.repeat(70));
  console.log('DEMO 6: DOCUMENT INTELLIGENCE EXTRACTION');
  console.log('═'.repeat(70));
  await runDocumentIngestion(
    'According to sources, NIAC has been working closely with Press TV to amplify ' +
    'messaging favorable to Tehran. The Alavi Foundation provided funding for several ' +
    'events where Hezbollah representatives spoke alongside IRGC officials. Meanwhile, ' +
    'Reza Pahlavi and Masih Alinejad continue to lead opposition efforts from exile.'
  );

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('CAPABILITIES DEMONSTRATED');
  console.log('═'.repeat(70));
  console.log(`
✅ Semantic Entity Search - Find entities by meaning, not just keywords
✅ Alias Resolution - Match entities across different names/languages
✅ Narrative Analysis - Detect regime vs opposition messaging alignment
✅ Self-Learning - System improves with usage (GNN reinforcement)
✅ Cluster Detection - Identify groups of related entities
✅ Document Intelligence - Extract entities and relationships from text
✅ RAG Pipeline - Query intelligence from ingested documents

Usage:
  npm run vector-intel "search query"           # Semantic search
  npm run vector-intel --entity "NIAC"          # Deep entity analysis
  npm run vector-intel --narrative "text..."    # Narrative analysis
  npm run vector-intel --cypher "MATCH..."      # Graph query
  npm run vector-intel --document "text..."     # Document ingestion
  npm run vector-intel --clusters               # Cluster detection
  npm run vector-intel --demo                   # Run this demo
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  try {
    switch (options.mode) {
      case 'search':
        await runSemanticSearch(options.query);
        break;
      case 'entity':
        await runEntityAnalysis(options.query);
        break;
      case 'narrative':
        await runNarrativeAnalysis(options.query);
        break;
      case 'cypher':
        await runCypherQuery(options.query);
        break;
      case 'document':
        await runDocumentIngestion(options.query);
        break;
      case 'clusters':
        await runClusterDetection();
        break;
      case 'demo':
      default:
        await runDemo();
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
