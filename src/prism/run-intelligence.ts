#!/usr/bin/env npx ts-node
/**
 * PRISM Intelligence Analysis Runner
 *
 * Comprehensive influence network analysis for Iranian regime connections.
 *
 * Usage:
 *   npm run intelligence "Subject Name"
 *   npx ts-node src/prism/run-intelligence.ts "Subject Name"
 */

import { riskEngine, intelligenceVisualizer } from './intelligence';

async function runIntelligenceAnalysis(subject: string): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ██████╗ ██████╗ ██╗███████╗███╗   ███╗                            ║
║   ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║                            ║
║   ██████╔╝██████╔╝██║███████╗██╔████╔██║                            ║
║   ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║                            ║
║   ██║     ██║  ██║██║███████║██║ ╚═╝ ██║                            ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝                            ║
║                                                                      ║
║        INFLUENCE NETWORK INTELLIGENCE SYSTEM                         ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

  console.log(`\n🎯 TARGET: ${subject}`);
  console.log('─'.repeat(70));
  console.log('\n📡 Initializing intelligence modules...\n');

  try {
    // Run comprehensive risk assessment
    const assessment = await riskEngine.assessRisk(subject, {
      socialMediaContent: [],
      publicStatements: [],
      knownAffiliations: []
    });

    // Generate and display report
    const report = intelligenceVisualizer.generateReport(assessment);
    console.log(report);

    // Also output the detailed findings
    console.log('\n' + assessment.detailedFindings);

  } catch (error) {
    console.error('❌ Intelligence analysis failed:', error);
    process.exit(1);
  }
}

// Main execution
const subject = process.argv.slice(2).join(' ') || 'Unknown Subject';

if (subject === 'Unknown Subject' || subject.trim() === '') {
  console.log(`
Usage: npm run intelligence "Subject Name"

Examples:
  npm run intelligence "NIAC"
  npm run intelligence "Press TV"
  npm run intelligence "Hezbollah"
  npm run intelligence "Quincy Institute"

The system will analyze:
  • Direct regime connections
  • Proxy organization links
  • Financial relationships & sanctions
  • Influence network position
  • Narrative alignment with regime
  • FARA registration status
  • Multi-hop paths to regime entities
`);
  process.exit(0);
}

runIntelligenceAnalysis(subject).catch(console.error);
