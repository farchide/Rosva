/**
 * Rosva Demo - Full Pipeline Demonstration
 *
 * Demonstrates the complete research pipeline with realistic mock data
 * based on publicly available information about Iranian opposition figures.
 */

import { RosvaOrchestrator, Finding, Source, Relationship } from './orchestrator';
import { ReportGenerator } from './reports';
import { VerificationEngine } from './verification';
import { GraphManager } from './graph';

/**
 * Create realistic mock data for demonstration
 */
function createDemoData(name: string): {
  findings: Finding[];
  relationships: Relationship[];
  sources: Source[];
} {
  const now = new Date();

  const sources: Source[] = [
    {
      id: 'wiki-aaf',
      url: 'https://en.wikipedia.org/wiki/Amir_Abbas_Fakhravar',
      title: 'Wikipedia: Amir Abbas Fakhravar',
      type: 'wiki',
      publishedDate: new Date('2024-01-15'),
      accessedDate: now,
      reliabilityScore: 0.7
    },
    {
      id: 'nic-bio',
      url: 'https://iraniancongress.com/nic/amir-a-fakhravar-siavash',
      title: 'National Iranian Congress - Biography',
      type: 'organization',
      accessedDate: now,
      reliabilityScore: 0.6
    },
    {
      id: 'voa-interview',
      url: 'https://www.voanews.com/iranian-dissident',
      title: 'VOA Interview with Iranian Dissident',
      type: 'broadcast',
      publishedDate: new Date('2023-11-10'),
      accessedDate: now,
      reliabilityScore: 0.85
    },
    {
      id: 'reuters-iran',
      url: 'https://www.reuters.com/iran-opposition',
      title: 'Reuters: Iran Opposition Groups',
      type: 'wire_service',
      publishedDate: new Date('2024-02-20'),
      accessedDate: now,
      reliabilityScore: 0.9
    },
    {
      id: 'hudson-event',
      url: 'https://www.hudson.org/events',
      title: 'Hudson Institute Event Speaker List',
      type: 'think_tank',
      publishedDate: new Date('2024-03-15'),
      accessedDate: now,
      reliabilityScore: 0.75
    }
  ];

  const findings: Finding[] = [
    {
      id: 'f-1',
      type: 'biography',
      subject: name,
      claim: `${name} is an Iranian dissident and political activist who was imprisoned in Iran for his pro-democracy activities. He later became a prominent voice in the Iranian-American community advocating for regime change through peaceful means.`,
      evidence: [{
        type: 'wiki_extract',
        content: 'Iranian student activist and dissident who was imprisoned for political activities',
        source: sources[0]
      }],
      sources: [sources[0], sources[1]],
      confidence: 0.8,
      verificationStatus: 'verified',
      timestamp: now
    },
    {
      id: 'f-2',
      type: 'corporate_affiliation',
      subject: name,
      claim: `${name} is associated with the National Iranian Congress (NIC), a US-based advocacy organization focused on Iran policy.`,
      evidence: [{
        type: 'organization_mention',
        content: 'Listed as key figure on NIC website',
        source: sources[1]
      }],
      sources: [sources[1]],
      confidence: 0.85,
      verificationStatus: 'verified',
      timestamp: now
    },
    {
      id: 'f-3',
      type: 'media_mention',
      subject: name,
      claim: `${name} has been interviewed by major news outlets including Voice of America, discussing US-Iran relations and the Iranian opposition movement.`,
      evidence: [{
        type: 'interview',
        content: 'Appeared on VOA discussing sanctions policy and regime change',
        source: sources[2]
      }],
      sources: [sources[2], sources[3]],
      confidence: 0.9,
      verificationStatus: 'verified',
      timestamp: new Date('2023-11-10')
    },
    {
      id: 'f-4',
      type: 'public_statement',
      subject: name,
      claim: `${name} advocates for a secular, democratic Iran and has positioned himself as an alternative voice to other opposition groups including the MEK.`,
      evidence: [{
        type: 'quote',
        content: 'Statements supporting peaceful transition to democracy',
        source: sources[2]
      }],
      sources: [sources[2]],
      confidence: 0.75,
      verificationStatus: 'partially_verified',
      timestamp: new Date('2023-12-01')
    },
    {
      id: 'f-5',
      type: 'network_connection',
      subject: name,
      claim: `${name} has connections to US policy circles, having spoken at events hosted by Washington think tanks including the Hudson Institute.`,
      evidence: [{
        type: 'event_attendance',
        content: 'Listed as speaker at Iran policy forum',
        source: sources[4]
      }],
      sources: [sources[4]],
      confidence: 0.7,
      verificationStatus: 'partially_verified',
      timestamp: new Date('2024-03-15')
    },
    {
      id: 'f-6',
      type: 'network_connection',
      subject: name,
      claim: `${name} operates independently from the Pahlavi-led opposition coalition, representing a separate center of gravity in the Iranian diaspora movement.`,
      evidence: [{
        type: 'analysis',
        content: 'Not listed among signatories of major opposition coalition statements',
        source: sources[3]
      }],
      sources: [sources[3]],
      confidence: 0.6,
      verificationStatus: 'unverified',
      timestamp: now
    }
  ];

  const relationships: Relationship[] = [
    {
      from: name,
      to: 'National Iranian Congress (NIC)',
      type: 'AFFILIATED_WITH',
      strength: 0.9,
      evidence: [sources[1]]
    },
    {
      from: name,
      to: 'Hudson Institute',
      type: 'SPOKE_AT',
      strength: 0.7,
      evidence: [sources[4]]
    },
    {
      from: name,
      to: 'Voice of America',
      type: 'QUOTED_BY',
      strength: 0.8,
      evidence: [sources[2]]
    },
    {
      from: name,
      to: 'US Policy Circles',
      type: 'CONNECTED_TO',
      strength: 0.65,
      evidence: [sources[4], sources[2]]
    },
    {
      from: name,
      to: 'Reza Pahlavi Coalition',
      type: 'OPPOSES',
      strength: 0.4,
      evidence: [sources[3]]
    }
  ];

  return { findings, relationships, sources };
}

/**
 * Run demonstration
 */
async function runDemo() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          ROSVA DEEP RESEARCH SYSTEM - DEMONSTRATION            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const targetName = 'Amir Abbas Fakhravar';

  console.log(`[Demo] Target: ${targetName}`);
  console.log('[Demo] Context: Iranian opposition fragmentation analysis\n');

  // Initialize components
  console.log('[Step 1] Initializing research components...');
  const reportGenerator = new ReportGenerator();
  const verificationEngine = new VerificationEngine({ minSources: 2, crossReference: true });
  const graphManager = new GraphManager();
  await graphManager.initialize();

  // Load demo data (simulating web research)
  console.log('[Step 2] Loading research data (simulated web research)...');
  const { findings, relationships, sources } = createDemoData(targetName);
  console.log(`   - Collected ${findings.length} findings`);
  console.log(`   - Identified ${relationships.length} relationships`);
  console.log(`   - Referenced ${sources.length} sources`);

  // Verify findings
  console.log('\n[Step 3] Running verification engine...');
  const verifiedFindings = await verificationEngine.verifyAll(findings);
  const summary = verificationEngine.getSummary(verifiedFindings);
  console.log(`   - Verified: ${summary.verified}`);
  console.log(`   - Partially verified: ${summary.partiallyVerified}`);
  console.log(`   - Unverified: ${summary.unverified}`);
  console.log(`   - Average confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`);

  // Build relationship graph
  console.log('\n[Step 4] Building relationship graph...');
  for (const finding of verifiedFindings) {
    await graphManager.extractRelationships(targetName, finding);
  }
  await graphManager.storeRelationships('target-1', relationships);
  const graphStats = graphManager.getStats();
  console.log(`   - Nodes: ${graphStats.nodes}`);
  console.log(`   - Edges: ${graphStats.edges}`);

  // Generate report
  console.log('\n[Step 5] Generating comprehensive report...\n');

  const subject = {
    id: 'person-amir-abbas-fakhravar',
    canonicalName: targetName,
    aliases: ['Amir Fakhravar', 'Siavash'],
    identifiers: [],
    attributes: []
  };

  const report = await reportGenerator.generate({
    subject,
    findings: verifiedFindings,
    relationships,
    timeline: verifiedFindings
      .filter(f => f.timestamp)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(f => ({
        date: f.timestamp,
        type: f.type,
        description: f.claim.substring(0, 100) + '...',
        sources: f.sources,
        entities: [targetName]
      })),
    sources,
    format: 'structured-report'
  });

  // Output report
  console.log('═'.repeat(70));
  console.log(report.content);
  console.log('═'.repeat(70));

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    DEMONSTRATION COMPLETE                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('This demonstration shows the Rosva research pipeline:');
  console.log('  1. Multi-source data collection (simulated here, real web fetch in production)');
  console.log('  2. Finding extraction and structuring');
  console.log('  3. Cross-reference verification');
  console.log('  4. Relationship graph construction');
  console.log('  5. Comprehensive report generation');
  console.log('\nThe system is designed to work with:');
  console.log('  - Wikipedia API for encyclopedic data');
  console.log('  - Web scraping for news/media articles');
  console.log('  - Public records databases (SEC, FARA, FEC, etc.)');
  console.log('  - Social media APIs for public statements');
  console.log('  - E2B sandbox for secure code execution (when network available)');
  console.log('\nTo run real web research:');
  console.log('  npm run research "Person Name" "optional context"');
}

// Run demo
runDemo().catch(console.error);
