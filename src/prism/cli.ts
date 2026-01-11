#!/usr/bin/env node

/**
 * PRISM CLI
 *
 * Command-line interface for the PRISM intelligence research engine.
 *
 * Usage:
 *   prism research "Person Name"
 *   prism research "Person Name" --depth=deep
 *   prism research "Person Name" --output=json
 */

import { PRISMOrchestrator, SearchResult } from './core/orchestrator';
import { PRISMVisualizer } from './core/visualizer';

// Simple argument parsing
const args = process.argv.slice(2);

interface CLIOptions {
  command: string;
  subject?: string;
  depth: 'QUICK' | 'STANDARD' | 'DEEP' | 'EXHAUSTIVE';
  output: 'text' | 'json' | 'mermaid';
  help: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    command: 'help',
    depth: 'STANDARD',
    output: 'text',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === 'research' || arg === 'r') {
      options.command = 'research';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.subject = args[i + 1];
        i++;
      }
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--depth=')) {
      options.depth = arg.split('=')[1].toUpperCase() as any;
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1].toLowerCase() as any;
    } else if (!arg.startsWith('-') && !options.subject) {
      options.subject = arg;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ██████╗ ██████╗ ██╗███████╗███╗   ███╗                                      ║
║  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║                                      ║
║  ██████╔╝██████╔╝██║███████╗██╔████╔██║                                      ║
║  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║                                      ║
║  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║                                      ║
║  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝                                      ║
║                                                                              ║
║  Open-Source Truth & Accountability Engine                                   ║
║  Narrative Analysis • Influence Mapping • Source Documentation               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  prism research "Person Name" [options]

COMMANDS:
  research, r    Research a person by name

OPTIONS:
  --depth=LEVEL     Research depth: QUICK, STANDARD, DEEP, EXHAUSTIVE
                    Default: STANDARD

  --output=FORMAT   Output format: text, json, mermaid
                    Default: text

  --help, -h        Show this help message

EXAMPLES:
  prism research "Reza Pahlavi"
  prism research "Reza Pahlavi" --depth=deep
  prism research "Reza Pahlavi" --output=json
  prism r "Person Name" --depth=exhaustive --output=mermaid

METHODOLOGY:
  PRISM uses open-source intelligence (OSINT) to analyze public figures.
  All data is sourced from publicly available records.
  No private data. No speculation. Source-anchored documentation.

  This tool is designed for:
  • Narrative mapping
  • Influence network analysis
  • Funding & amplification transparency
  • Media accountability
  • Public-record synthesis

`);
}

/**
 * Simulated search results for demonstration
 * In production, this would call a real search API
 */
function generateSearchQueries(subject: string): string[] {
  return [
    `${subject} biography background`,
    `${subject} family parents children spouse`,
    `${subject} education university school`,
    `${subject} career positions organizations`,
    `${subject} political positions statements`,
    `${subject} foreign relations meetings`,
    `${subject} Israel Netanyahu meeting`,
    `${subject} United States Trump administration`,
    `${subject} funding sources backers`,
    `${subject} advisors associates inner circle`,
    `${subject} controversy criticism scandal`,
    `${subject} coalition alliance opposition`,
    `${subject} media appearances interviews`,
    `${subject} social media twitter instagram`,
    `${subject} timeline chronology history`
  ];
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const options = parseArgs(args);

  if (options.help || options.command === 'help') {
    printHelp();
    return;
  }

  if (options.command === 'research') {
    if (!options.subject) {
      console.error('\n❌ Error: Please provide a subject name.\n');
      console.error('Usage: prism research "Person Name"\n');
      process.exit(1);
    }

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ██████╗ ██████╗ ██╗███████╗███╗   ███╗                                      ║
║  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║                                      ║
║  ██████╔╝██████╔╝██║███████╗██╔████╔██║                                      ║
║  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║                                      ║
║  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║                                      ║
║  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝                                      ║
║                                                                              ║
║  Open-Source Truth & Accountability Engine                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`🎯 Subject: ${options.subject}`);
    console.log(`📊 Depth: ${options.depth}`);
    console.log(`📄 Output: ${options.output}\n`);

    // Generate search queries
    const queries = generateSearchQueries(options.subject);
    console.log(`🔍 Generated ${queries.length} research queries\n`);

    console.log('📡 Search Queries:');
    for (const query of queries.slice(0, 5)) {
      console.log(`   • ${query}`);
    }
    console.log(`   • ... and ${queries.length - 5} more\n`);

    console.log('⚠️  NOTE: PRISM requires search results to be provided.');
    console.log('   In production, integrate with a search API (WebSearch, SerpAPI, etc.)\n');

    console.log('📋 To use PRISM programmatically:\n');
    console.log(`
import { PRISMOrchestrator } from './core/orchestrator';
import { PRISMVisualizer } from './core/visualizer';

// Your search results from any search API
const searchResults = [
  { title: '...', url: '...', snippet: '...', source: '...' },
  // ... more results
];

const orchestrator = new PRISMOrchestrator({ depth: '${options.depth}' });
const report = await orchestrator.research('${options.subject}', searchResults);

const visualizer = new PRISMVisualizer();
console.log(visualizer.generate(report));
`);

    // Demo mode - show what the output would look like
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('                           DEMO OUTPUT PREVIEW');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    // Create a demo orchestrator and visualizer
    const orchestrator = new PRISMOrchestrator({ depth: options.depth });
    const visualizer = new PRISMVisualizer();

    // Create demo search results
    const demoResults: SearchResult[] = [
      {
        title: `${options.subject} - Wikipedia`,
        url: 'https://en.wikipedia.org/wiki/' + options.subject.replace(/\s+/g, '_'),
        snippet: `${options.subject} is a notable public figure. Born in [location], they have been involved in various political and social activities.`,
        source: 'Wikipedia'
      }
    ];

    try {
      const report = await orchestrator.research(options.subject, demoResults);

      if (options.output === 'json') {
        console.log(visualizer.exportJSON(report));
      } else if (options.output === 'mermaid') {
        console.log('```mermaid');
        console.log(visualizer.generateMermaid(report));
        console.log('```');
      } else {
        console.log(visualizer.generate(report));
      }
    } catch (error) {
      console.error('Error during research:', error);
    }
  }
}

// Run
main().catch(console.error);
