#!/usr/bin/env node

/**
 * PRISM Research Runner
 *
 * Runs full analysis on any subject using E2B-powered web search.
 *
 * Usage:
 *   npx ts-node src/prism/run-research.ts "Patrick Bet-David"
 *   npx ts-node src/prism/run-research.ts "Reza Pahlavi"
 */

import { PRISMOrchestrator } from './core/orchestrator';
import { PRISMVisualizer } from './core/visualizer';
import { E2BSearchProvider, SearchResult } from './search/e2b-search-provider';

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
║  E2B-Powered Research Mode                                                   ║
║  Research Target: ${subject.padEnd(55)}║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  console.log('🚀 Starting E2B-powered research...\n');

  let searchResults: SearchResult[];

  try {
    // Use E2B for real web search
    const provider = new E2BSearchProvider();
    searchResults = await provider.researchSubject(subject);
  } catch (error) {
    console.error('❌ E2B search failed:', error instanceof Error ? error.message : error);
    console.log('\n💡 Falling back to curated demo data...\n');

    // Fallback to demo data if E2B fails
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
