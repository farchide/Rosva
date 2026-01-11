#!/usr/bin/env node

/**
 * PRISM CLI
 *
 * Command-line interface for the PRISM intelligence research engine.
 *
 * Usage:
 *   npx ts-node src/prism/cli.ts research "Person Name"
 *   npx ts-node src/prism/cli.ts research "Person Name" --depth=deep
 *   npx ts-node src/prism/cli.ts research "Person Name" --output=json
 */

import { PRISMOrchestrator } from './core/orchestrator';
import { PRISMVisualizer } from './core/visualizer';
import {
  CompositeSearchProvider,
  WikipediaProvider,
  DuckDuckGoProvider,
  researchSubject,
  SearchResult
} from './search/search-provider';

// Simple argument parsing
const args = process.argv.slice(2);

interface CLIOptions {
  command: string;
  subject?: string;
  depth: 'QUICK' | 'STANDARD' | 'DEEP' | 'EXHAUSTIVE';
  output: 'text' | 'json' | 'mermaid';
  help: boolean;
  offline: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    command: 'help',
    depth: 'STANDARD',
    output: 'text',
    help: false,
    offline: false
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
    } else if (arg === '--offline') {
      options.offline = true;
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
  npm run prism -- research "Person Name" [options]

COMMANDS:
  research, r    Research a person by name

OPTIONS:
  --depth=LEVEL     Research depth: QUICK, STANDARD, DEEP, EXHAUSTIVE
                    Default: STANDARD

  --output=FORMAT   Output format: text, json, mermaid
                    Default: text

  --offline         Skip web search, use minimal demo data
                    Default: false (live search enabled)

  --help, -h        Show this help message

EXAMPLES:
  npm run prism -- research "Reza Pahlavi"
  npm run prism -- research "Patrick Bet-David" --depth=deep
  npm run prism -- research "Masih Alinejad" --output=json
  npm run prism -- r "Person Name" --depth=exhaustive --output=mermaid

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

function printBanner(subject: string, depth: string, output: string): void {
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
║  Research Target: ${subject.padEnd(55)}║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
  console.log(`🎯 Subject: ${subject}`);
  console.log(`📊 Depth: ${depth}`);
  console.log(`📄 Output: ${output}\n`);
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
      console.error('Usage: npm run prism -- research "Person Name"\n');
      process.exit(1);
    }

    printBanner(options.subject, options.depth, options.output);

    let searchResults: SearchResult[];

    if (options.offline) {
      console.log('📴 Offline mode: Using minimal demo data\n');
      searchResults = [{
        title: `${options.subject} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${options.subject.replace(/\s+/g, '_')}`,
        snippet: `${options.subject} is a notable public figure.`,
        source: 'Wikipedia'
      }];
    } else {
      // Use live search
      console.log('🌐 Live search mode: Gathering data from the web...\n');

      const provider = new CompositeSearchProvider([
        new WikipediaProvider(),
        new DuckDuckGoProvider()
      ]);

      try {
        searchResults = await researchSubject(options.subject, provider, {
          maxQueriesParallel: 2,
          resultsPerQuery: 5
        });

        // If no results found, provide helpful message
        if (searchResults.length === 0) {
          console.log('\n⚠️  No search results found. This could be due to:');
          console.log('   • Network restrictions in this environment');
          console.log('   • Rate limiting from search providers');
          console.log('   • The subject name may need different spelling\n');
          console.log('💡 TIP: Use the programmatic API to provide your own search results:');
          console.log(`
   import { PRISMOrchestrator } from './core/orchestrator';
   import { SearchResult } from './search/search-provider';

   const results: SearchResult[] = [
     { title: "...", url: "...", snippet: "...", source: "..." }
   ];

   const orchestrator = new PRISMOrchestrator();
   const report = await orchestrator.research("${options.subject}", results);
`);
        }
      } catch (error) {
        console.error('❌ Search failed:', error instanceof Error ? error.message : 'Unknown error');
        console.log('\n💡 TIP: Use --offline flag for demo mode, or provide search results programmatically.\n');
        searchResults = [];
      }
    }

    console.log(`📊 Loaded ${searchResults.length} search results\n`);

    // Create orchestrator and run analysis
    const orchestrator = new PRISMOrchestrator({ depth: options.depth });
    const visualizer = new PRISMVisualizer();

    try {
      console.log(`\n🔍 PRISM: Initiating research on "${options.subject}"...\n`);

      const report = await orchestrator.research(options.subject, searchResults);

      console.log(`\n════════════════════════════════════════════════════════════════════════════════`);
      console.log(`                         INTELLIGENCE REPORT`);
      console.log(`════════════════════════════════════════════════════════════════════════════════\n`);

      if (options.output === 'json') {
        console.log(visualizer.exportJSON(report));
      } else if (options.output === 'mermaid') {
        console.log('\n════════════════════════════════════════════════════════════════════════════════');
        console.log('                         RELATIONSHIP GRAPH');
        console.log('════════════════════════════════════════════════════════════════════════════════\n');
        console.log('```mermaid');
        console.log(visualizer.generateMermaid(report));
        console.log('```');
      } else {
        console.log(visualizer.generate(report));

        // Also output relationship graph
        console.log('\n════════════════════════════════════════════════════════════════════════════════');
        console.log('                         RELATIONSHIP GRAPH');
        console.log('════════════════════════════════════════════════════════════════════════════════\n');
        console.log('```mermaid');
        console.log(visualizer.generateMermaid(report));
        console.log('```');

        // JSON export
        console.log('\n════════════════════════════════════════════════════════════════════════════════');
        console.log('                         JSON EXPORT');
        console.log('════════════════════════════════════════════════════════════════════════════════\n');
        console.log(visualizer.exportJSON(report).substring(0, 3000) + '\n\n... [truncated] ...');
      }

    } catch (error) {
      console.error('❌ Error during research:', error);
      process.exit(1);
    }
  }
}

// Run
main().catch(console.error);
