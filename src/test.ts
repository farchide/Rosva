/**
 * Rosva Test Suite
 *
 * Tests the deep research system with real and simulated data.
 */

import { RosvaOrchestrator } from './orchestrator';
import { VectorStore } from './vector';
import { GraphManager } from './graph';
import { VerificationEngine } from './verification';
import { ReportGenerator } from './reports';
import { Finding, Source } from './orchestrator';

// Test configuration
const TEST_CONFIG = {
  vectorDB: { provider: 'ruvector' as const, gnnEnabled: true },
  agents: ['public-records', 'social-media', 'corporate', 'media', 'network'] as any[],
  verification: { minSources: 2, crossReference: true }
};

/**
 * Create mock findings for testing
 */
function createMockFindings(subject: string): Finding[] {
  const now = new Date();

  const mockSource = (id: string, title: string, type: string): Source => ({
    id,
    url: `https://example.com/${id}`,
    title,
    type,
    publishedDate: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    accessedDate: now,
    reliabilityScore: 0.5 + Math.random() * 0.4
  });

  return [
    {
      id: 'finding-1',
      type: 'corporate_affiliation',
      subject,
      claim: `${subject} is affiliated with the National Iranian Congress (NIC)`,
      evidence: [{
        type: 'organization_mention',
        content: `${subject} serves as a key figure in NIC advocacy efforts`,
        source: mockSource('src-1', 'NIC Official Website', 'organization')
      }],
      sources: [mockSource('src-1', 'NIC Official Website', 'organization')],
      confidence: 0.85,
      verificationStatus: 'verified',
      timestamp: now
    },
    {
      id: 'finding-2',
      type: 'media_mention',
      subject,
      claim: `${subject} has been interviewed by major news outlets about Iran policy`,
      evidence: [{
        type: 'interview',
        content: 'Interview discussing sanctions policy',
        source: mockSource('src-2', 'Voice of America Interview', 'broadcast')
      }],
      sources: [
        mockSource('src-2', 'Voice of America Interview', 'broadcast'),
        mockSource('src-3', 'Radio Farda Report', 'broadcast')
      ],
      confidence: 0.9,
      verificationStatus: 'verified',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'finding-3',
      type: 'public_statement',
      subject,
      claim: `${subject} advocates for regime change in Iran through peaceful means`,
      evidence: [{
        type: 'quote',
        content: 'We support the Iranian people\'s desire for freedom and democracy',
        source: mockSource('src-4', 'Conference Speech 2024', 'speech')
      }],
      sources: [mockSource('src-4', 'Conference Speech 2024', 'speech')],
      confidence: 0.75,
      verificationStatus: 'partially_verified',
      timestamp: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'finding-4',
      type: 'network_connection',
      subject,
      claim: `${subject} has connections to US policy circles`,
      evidence: [{
        type: 'event_attendance',
        content: 'Attended Washington policy summit',
        source: mockSource('src-5', 'Think Tank Event List', 'event')
      }],
      sources: [mockSource('src-5', 'Think Tank Event List', 'event')],
      confidence: 0.6,
      verificationStatus: 'unverified',
      timestamp: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
  ];
}

/**
 * Test 1: Vector Store
 */
async function testVectorStore(): Promise<boolean> {
  console.log('\n=== Test 1: Vector Store ===');

  try {
    const store = new VectorStore({ provider: 'ruvector', gnnEnabled: true });
    await store.initialize();

    // Store a person
    const testPerson = {
      id: 'test-person-1',
      canonicalName: 'Test Person',
      aliases: ['TP', 'Testy'],
      identifiers: [],
      attributes: []
    };

    await store.storePerson(testPerson);
    console.log('Stored person:', testPerson.canonicalName);

    // Find the person
    const found = await store.findPerson('Test Person');
    console.log('Found person:', found?.canonicalName);

    // Search
    const results = await store.searchPersons('Test', 5);
    console.log('Search results:', results.length);

    const stats = store.getStats();
    console.log('Store stats:', stats);

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL');
    return false;
  }
}

/**
 * Test 2: Graph Manager
 */
async function testGraphManager(): Promise<boolean> {
  console.log('\n=== Test 2: Graph Manager ===');

  try {
    const graph = new GraphManager();
    await graph.initialize();

    // Create test finding
    const finding: Finding = {
      id: 'test-finding',
      type: 'corporate_affiliation',
      subject: 'Test Person',
      claim: 'Test Person is affiliated with Test Organization',
      evidence: [],
      sources: [],
      confidence: 0.8,
      verificationStatus: 'verified',
      timestamp: new Date()
    };

    // Extract relationships
    const relationships = await graph.extractRelationships('Test Person', finding);
    console.log('Extracted relationships:', relationships.length);

    // Store relationships
    await graph.storeRelationships('test-person-1', relationships);

    // Query network
    const network = await graph.getNetwork('Test Person', 2);
    console.log('Network size:', network.length);

    const stats = graph.getStats();
    console.log('Graph stats:', stats);

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL');
    return false;
  }
}

/**
 * Test 3: Verification Engine
 */
async function testVerificationEngine(): Promise<boolean> {
  console.log('\n=== Test 3: Verification Engine ===');

  try {
    const engine = new VerificationEngine({ minSources: 2, crossReference: true });

    // Create test findings
    const findings = createMockFindings('Test Subject');
    console.log('Input findings:', findings.length);

    // Verify
    const verified = await engine.verifyAll(findings);
    console.log('Verified findings:', verified.length);

    // Get summary
    const summary = engine.getSummary(verified);
    console.log('Summary:', summary);

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL');
    return false;
  }
}

/**
 * Test 4: Report Generator
 */
async function testReportGenerator(): Promise<boolean> {
  console.log('\n=== Test 4: Report Generator ===');

  try {
    const generator = new ReportGenerator();

    const findings = createMockFindings('Test Subject');
    const subject = {
      id: 'test-subject',
      canonicalName: 'Test Subject',
      aliases: ['TS'],
      identifiers: [],
      attributes: []
    };

    // Generate markdown report
    const mdReport = await generator.generate({
      subject,
      findings,
      relationships: [],
      timeline: [],
      sources: findings.flatMap(f => f.sources),
      format: 'markdown'
    });

    console.log('Markdown report length:', mdReport.content.length);
    console.log('Sections:', mdReport.sections.map(s => s.title));

    // Generate structured report
    const structuredReport = await generator.generate({
      subject,
      findings,
      relationships: [],
      timeline: [],
      sources: findings.flatMap(f => f.sources),
      format: 'structured-report'
    });

    console.log('Structured report length:', structuredReport.content.length);
    console.log('\n--- Report Preview ---');
    console.log(structuredReport.content.substring(0, 500) + '...\n');

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL');
    return false;
  }
}

/**
 * Test 5: Full Orchestrator (with mock data)
 */
async function testOrchestrator(): Promise<boolean> {
  console.log('\n=== Test 5: Full Orchestrator ===');

  try {
    const orchestrator = new RosvaOrchestrator(TEST_CONFIG);
    await orchestrator.initialize();

    console.log('Orchestrator initialized');

    // Note: This will run with empty results since agents don't have real API connections
    // In production, agents would fetch real data
    const result = await orchestrator.research({
      name: 'Test Subject',
      context: 'Iranian opposition',
      depth: 'quick',
      outputFormat: 'structured-report'
    });

    console.log('Research complete:');
    console.log('- Subject:', result.subject.canonicalName);
    console.log('- Findings:', result.findings.length);
    console.log('- Relationships:', result.relationships.length);
    console.log('- Sources:', result.sources.length);
    console.log('- Duration:', result.metadata.researchDuration, 'ms');

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║       ROSVA TEST SUITE                 ║');
  console.log('╚════════════════════════════════════════╝');

  const results: { name: string; passed: boolean }[] = [];

  // Run tests
  results.push({ name: 'Vector Store', passed: await testVectorStore() });
  results.push({ name: 'Graph Manager', passed: await testGraphManager() });
  results.push({ name: 'Verification Engine', passed: await testVerificationEngine() });
  results.push({ name: 'Report Generator', passed: await testReportGenerator() });
  results.push({ name: 'Full Orchestrator', passed: await testOrchestrator() });

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       TEST RESULTS SUMMARY             ║');
  console.log('╚════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? '[PASS]' : '[FAIL]';
    console.log(`${status} ${result.name}`);
    if (result.passed) passed++;
    else failed++;
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed out of ${results.length} tests`);

  if (failed === 0) {
    console.log('\n✓ All tests passed! Rosva is ready for real testing.');
  } else {
    console.log('\n✗ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
