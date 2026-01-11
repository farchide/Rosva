/**
 * Real Person Research Test
 *
 * Tests the system with actual web data fetching.
 */

import { RosvaOrchestrator, Finding, Source } from './orchestrator';
import { WebResearcher } from './web';
import { ReportGenerator } from './reports';

/**
 * Real research function using web data
 */
async function realResearch(name: string, context?: string): Promise<void> {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║  ROSVA DEEP RESEARCH: ${name.padEnd(32)}║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);

  const webResearcher = new WebResearcher();
  const reportGenerator = new ReportGenerator();
  const findings: Finding[] = [];
  const allSources: Source[] = [];

  console.log('[Phase 1] Searching Wikipedia...');

  // Search Wikipedia
  const wikiResults = await webResearcher.searchWikipedia(name, 5);
  console.log(`Found ${wikiResults.length} Wikipedia results`);

  for (const result of wikiResults) {
    console.log(`  - ${result.title}`);
  }

  // Fetch Wikipedia page if found
  if (wikiResults.length > 0) {
    console.log('\n[Phase 2] Fetching Wikipedia page content...');

    const mainPage = await webResearcher.getWikipediaPage(wikiResults[0].title);

    if (mainPage.text) {
      console.log(`Retrieved page: ${mainPage.title}`);
      console.log(`Content length: ${mainPage.text.length} characters`);

      // Create source
      const wikiSource: Source = {
        id: `wiki-${wikiResults[0].title.replace(/\s+/g, '-').toLowerCase()}`,
        url: mainPage.url,
        title: `Wikipedia: ${mainPage.title}`,
        type: 'wiki',
        accessedDate: new Date(),
        reliabilityScore: 0.7
      };
      allSources.push(wikiSource);

      // Extract findings from Wikipedia content
      const wikiFindings = extractFindingsFromWikipedia(name, mainPage.text, wikiSource);
      findings.push(...wikiFindings);
      console.log(`Extracted ${wikiFindings.length} findings from Wikipedia`);
    }
  }

  // Search DuckDuckGo for more context
  console.log('\n[Phase 3] Searching DuckDuckGo for additional context...');

  const searchQuery = context ? `${name} ${context}` : name;
  const ddgResults = await webResearcher.searchDuckDuckGo(searchQuery);

  if (ddgResults.abstract) {
    console.log(`Abstract: ${ddgResults.abstract.substring(0, 200)}...`);

    const ddgSource: Source = {
      id: 'ddg-abstract',
      url: 'https://duckduckgo.com',
      title: 'DuckDuckGo Summary',
      type: 'search',
      accessedDate: new Date(),
      reliabilityScore: 0.5
    };
    allSources.push(ddgSource);

    // Create finding from abstract
    if (ddgResults.abstract.length > 50) {
      findings.push({
        id: 'ddg-abstract-finding',
        type: 'summary',
        subject: name,
        claim: ddgResults.abstract,
        evidence: [{
          type: 'search_result',
          content: ddgResults.abstract,
          source: ddgSource
        }],
        sources: [ddgSource],
        confidence: 0.5,
        verificationStatus: 'unverified',
        timestamp: new Date()
      });
    }
  }

  console.log(`Related topics: ${ddgResults.relatedTopics.length}`);
  for (const topic of ddgResults.relatedTopics.slice(0, 5)) {
    console.log(`  - ${topic.substring(0, 80)}...`);
  }

  // Generate report
  console.log('\n[Phase 4] Generating research report...');

  const subject = {
    id: `person-${name.replace(/\s+/g, '-').toLowerCase()}`,
    canonicalName: name,
    aliases: [],
    identifiers: [],
    attributes: []
  };

  const report = await reportGenerator.generate({
    subject,
    findings,
    relationships: [],
    timeline: findings
      .filter(f => f.timestamp)
      .map(f => ({
        date: f.timestamp,
        type: f.type,
        description: f.claim,
        sources: f.sources,
        entities: [name]
      })),
    sources: allSources,
    format: 'structured-report'
  });

  // Output report
  console.log('\n' + '='.repeat(60));
  console.log('RESEARCH REPORT');
  console.log('='.repeat(60));
  console.log(report.content);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('RESEARCH SUMMARY');
  console.log('='.repeat(60));
  console.log(`Subject: ${name}`);
  console.log(`Findings: ${findings.length}`);
  console.log(`Sources: ${allSources.length}`);
  console.log(`Web requests: ${webResearcher.getStats().requestCount}`);
}

/**
 * Extract findings from Wikipedia content
 */
function extractFindingsFromWikipedia(name: string, text: string, source: Source): Finding[] {
  const findings: Finding[] = [];
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 100);

  // First paragraph is usually the summary
  if (paragraphs[0]) {
    findings.push({
      id: 'wiki-summary',
      type: 'biography',
      subject: name,
      claim: paragraphs[0].substring(0, 500),
      evidence: [{
        type: 'wiki_extract',
        content: paragraphs[0],
        source
      }],
      sources: [source],
      confidence: 0.7,
      verificationStatus: 'partially_verified',
      timestamp: new Date()
    });
  }

  // Look for organization mentions
  const orgPatterns = [
    /(?:founded|established|created|leads?|chairs?|member of|affiliated with|works? (?:for|with))\s+(?:the\s+)?([A-Z][A-Za-z\s]+(?:Organization|Council|Committee|Congress|Foundation|Institute|Association|Group|Party|Movement))/gi
  ];

  for (const pattern of orgPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const org = match[1].trim();
      if (org.length > 3 && org.length < 100) {
        findings.push({
          id: `wiki-org-${findings.length}`,
          type: 'corporate_affiliation',
          subject: name,
          claim: `${name} is associated with ${org}`,
          evidence: [{
            type: 'organization_mention',
            content: match[0],
            source
          }],
          sources: [source],
          confidence: 0.6,
          verificationStatus: 'partially_verified',
          timestamp: new Date()
        });
      }
    }
  }

  // Look for key events/dates
  const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
  const dateMatches = text.match(datePattern);

  if (dateMatches && dateMatches.length > 0) {
    const eventContext = text.substring(
      Math.max(0, text.indexOf(dateMatches[0]) - 100),
      text.indexOf(dateMatches[0]) + 200
    );

    findings.push({
      id: 'wiki-timeline',
      type: 'timeline_event',
      subject: name,
      claim: `Key dates mentioned: ${dateMatches.slice(0, 5).join(', ')}`,
      evidence: [{
        type: 'date_mention',
        content: eventContext,
        source
      }],
      sources: [source],
      confidence: 0.8,
      verificationStatus: 'verified',
      timestamp: new Date()
    });
  }

  return findings;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Default test subjects
    console.log('Running research on test subjects...\n');

    // Test 1: Well-known person
    await realResearch('Amir Abbas Fakhravar', 'Iranian dissident');

    // Test 2: Another person from the user's document
    // await realResearch('Abbas Milani', 'Stanford historian Iran');

  } else {
    // Research the provided name
    const name = args[0];
    const context = args.slice(1).join(' ');
    await realResearch(name, context);
  }
}

main().catch(error => {
  console.error('Research error:', error);
  process.exit(1);
});
