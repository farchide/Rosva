#!/usr/bin/env node

/**
 * PRISM Research Runner
 *
 * Runs full analysis on any subject using multiple data sources:
 * - E2B-powered web search
 * - X (Twitter) API search
 * - Fallback demo data
 *
 * Usage:
 *   npx ts-node src/prism/run-research.ts "Patrick Bet-David"
 *   npx ts-node src/prism/run-research.ts "Reza Pahlavi"
 *
 * Environment Variables:
 *   E2B_API_KEY       - Enable E2B web scraping
 *   X_BEARER_TOKEN    - Enable X/Twitter API search
 */

import { PRISMOrchestrator } from './core/orchestrator';
import { PRISMVisualizer } from './core/visualizer';
import { E2BSearchProvider, SearchResult } from './search/e2b-search-provider';
import { XSearchProvider } from './search/x-search-provider';

async function main() {
  const subject = process.argv[2] || 'Patrick Bet-David';

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
║  Multi-Source Research Mode (E2B + X/Twitter)                                ║
║  Research Target: ${subject.padEnd(55)}║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  // Check available data sources
  const xProvider = new XSearchProvider();
  const e2bConfigured = !!process.env.E2B_API_KEY;
  const xConfigured = xProvider.isConfigured();

  console.log('📡 Data Sources:');
  console.log(`   E2B Web Search: ${e2bConfigured ? '✓ Configured' : '✗ Not configured (set E2B_API_KEY)'}`);
  console.log(`   X/Twitter API:  ${xConfigured ? '✓ Configured' : '✗ Not configured (set X_BEARER_TOKEN)'}`);
  console.log('');

  let searchResults: SearchResult[] = [];

  // Phase 1: Try E2B web search
  console.log('🚀 Starting multi-source research...\n');

  try {
    console.log('🌐 Phase 1: E2B Web Search...');
    const e2bProvider = new E2BSearchProvider();
    const e2bResults = await e2bProvider.researchSubject(subject);
    searchResults.push(...e2bResults);
    console.log(`   ✓ Found ${e2bResults.length} web results\n`);
  } catch (error) {
    console.log(`   ✗ E2B search failed: ${error instanceof Error ? error.message : error}\n`);
  }

  // Phase 2: Try X/Twitter search
  if (xConfigured) {
    try {
      console.log('🐦 Phase 2: X/Twitter Search...');
      const xResults = await xProvider.search(subject);
      searchResults.push(...xResults);
      console.log(`   ✓ Found ${xResults.length} X results\n`);

      // Also get Iran-specific content
      console.log('🇮🇷 Phase 2b: X Iran-Related Content...');
      const iranResults = await xProvider.searchIranContent(subject);
      searchResults.push(...iranResults);
      console.log(`   ✓ Found ${iranResults.length} Iran-related X results\n`);
    } catch (error) {
      console.log(`   ✗ X search failed: ${error instanceof Error ? error.message : error}\n`);
    }
  } else {
    console.log('🐦 Phase 2: X/Twitter Search... (skipped - not configured)\n');
  }

  // Phase 3: Fallback to demo data if no results
  if (searchResults.length === 0) {
    console.log('💡 No live data available. Using curated demo data...\n');
    searchResults = getDemoData(subject);
  }

  console.log(`\n📊 Loaded ${searchResults.length} search results\n`);

  // Run PRISM analysis
  const orchestrator = new PRISMOrchestrator({ depth: 'DEEP' });
  const visualizer = new PRISMVisualizer();

  console.log(`🔍 PRISM: Initiating research on "${subject}"...\n`);

  const report = await orchestrator.research(subject, searchResults);

  console.log(`\n════════════════════════════════════════════════════════════════════════════════`);
  console.log(`                         INTELLIGENCE REPORT`);
  console.log(`════════════════════════════════════════════════════════════════════════════════\n`);

  console.log(visualizer.generate(report));

  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('                         RELATIONSHIP GRAPH');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  console.log('```mermaid');
  console.log(visualizer.generateMermaid(report));
  console.log('```');
}

/**
 * Demo data fallback for Patrick Bet-David
 */
function getDemoData(subject: string): SearchResult[] {
  if (subject.toLowerCase().includes('patrick') && subject.toLowerCase().includes('bet-david')) {
    return [
      {
        title: "Patrick Bet-David - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Patrick_Bet-David",
        snippet: "Patrick Bet-David (born October 18, 1978) is an Iranian-American entrepreneur, author, and financial media personality. He is the founder and CEO of PHP Agency, a financial services marketing company, and the creator of Valuetainment, a media company. Born in Tehran, Iran, his father is Assyrian and his mother is Armenian. The family fled Iran during the 1979 revolution and spent time in a German refugee camp before settling in California.",
        source: "Wikipedia"
      },
      {
        title: "Patrick Bet-David Family",
        url: "https://www.the-sun.com/entertainment/patrick-bet-david-family/",
        snippet: "Patrick Bet-David married Jennifer Bet-David (née Guevara) in 2009. His wife Jennifer is co-founder of PHP Agency. They have four children: his son Patrick Tico Jr, his son Dylan, his daughter Senna Rose, and his daughter Brooklyn Ivy. The family resides in Fort Lauderdale, Florida.",
        source: "The Sun"
      },
      {
        title: "Patrick Bet-David Trump Interview",
        url: "https://www.newsweek.com/pbd-trump-interview/",
        snippet: "Patrick Bet-David has been an outspoken supporter of Donald Trump. He conducted a widely-viewed interview with Trump in 2024 on the PBD Podcast. Bet-David has described himself as conservative and has criticized left-wing policies. He frequently interviews conservative political figures including Donald Trump, Tucker Carlson, Tulsi Gabbard, and Candace Owens.",
        source: "Newsweek"
      },
      {
        title: "PHP Agency Overview",
        url: "https://www.phpagency.com/about",
        snippet: "PHP Agency was founded in 2009 by Patrick Bet-David as an insurance marketing organization (IMO). The company focuses on life insurance and financial services. PHP Agency has grown to include thousands of licensed agents across multiple states. Bet-David served as CEO before selling his stake in 2022.",
        source: "PHP Agency"
      },
      {
        title: "Patrick Bet-David on Iran",
        url: "https://valuetainment.com/iran-episode/",
        snippet: "Patrick Bet-David frequently speaks about his opposition to the Islamic Republic regime. As someone who fled Iran as a child during the 1979 revolution, he advocates for regime change and a free Iran. He has interviewed Iranian opposition figures and supports the Woman Life Freedom movement. He supports secular democracy for Iran.",
        source: "Valuetainment"
      },
      {
        title: "PBD Anti-Regime Stance",
        url: "https://twitter.com/patrickbetdavid/iran-protests",
        snippet: "During the 2022 protests following Mahsa Amini's death, Patrick Bet-David voiced support for the Woman Life Freedom movement and called for an end to the Islamic Republic. He advocates for human rights in Iran and supports the Iranian people's fight for freedom. His Assyrian Christian heritage connects him to persecuted minorities under the Islamic Republic.",
        source: "Twitter/X"
      },
      {
        title: "Valuetainment Media",
        url: "https://www.forbes.com/profile/patrick-bet-david/",
        snippet: "Valuetainment was founded by Patrick Bet-David in 2012 as an entrepreneurship-focused YouTube channel. It has grown to over 5 million subscribers. The PBD Podcast features interviews with business leaders, politicians, and celebrities. Bet-David has interviewed figures like Donald Trump, Jordan Peterson, and various political commentators.",
        source: "Forbes"
      },
      {
        title: "PHP Agency Exit",
        url: "https://www.businessinsider.com/php-agency-sale/",
        snippet: "Patrick Bet-David announced a multi-nine-figure exit from PHP Agency through a management buyout in 2022. The exact terms were not disclosed but the company was valued at several hundred million dollars. Bet-David retained a minority stake and advisory role while focusing on his media ventures.",
        source: "Business Insider"
      },
      {
        title: "Patrick Bet-David Military Service",
        url: "https://valuetainment.com/about",
        snippet: "After high school, Patrick Bet-David enlisted in the U.S. Army and served in the 101st Airborne Division. He served during the Iraq War era. His military experience shaped his views on discipline, leadership, and patriotism. He often speaks about lessons learned during his service.",
        source: "Valuetainment"
      },
      {
        title: "PBD Books",
        url: "https://www.amazon.com/Patrick-Bet-David/author/",
        snippet: "Patrick Bet-David released his second book 'Choose Your Enemies Wisely: Business Planning for the Audacious Few' in 2023. His first book 'Your Next Five Moves' was a Wall Street Journal bestseller. He writes about entrepreneurship, business strategy, and personal development.",
        source: "Amazon"
      }
    ];
  }

  // Generic fallback
  return [{
    title: `${subject} - Wikipedia`,
    url: `https://en.wikipedia.org/wiki/${subject.replace(/\s+/g, '_')}`,
    snippet: `${subject} is a notable public figure.`,
    source: "Wikipedia"
  }];
}

main().catch(console.error);
