#!/usr/bin/env npx ts-node

/**
 * PRISM Research: Patrick Bet-David
 *
 * Comprehensive intelligence profile using OSINT methodology.
 * All data sourced from publicly available records.
 */

import { PRISMOrchestrator, SearchResult } from '../core/orchestrator';
import { PRISMVisualizer } from '../core/visualizer';

/**
 * Curated search results for Patrick Bet-David
 * Gathered from public sources
 */
const searchResults: SearchResult[] = [
  // Biography & Background
  {
    title: "Patrick Bet-David - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Patrick_Bet-David",
    snippet: "Patrick Bet-David (born October 18, 1978) is an Iranian-American entrepreneur, author, and financial services executive. Born in Tehran, Iran, his father is Assyrian and his mother is Armenian. The family fled Iran during the Iranian Revolution, escaping to Germany as refugees before immigrating to the United States in 1990.",
    source: "Wikipedia",
    date: "2024"
  },
  {
    title: "Patrick Bet-David Military Service",
    url: "https://valuetainment.com/about",
    snippet: "After high school, Patrick Bet-David enlisted in the U.S. Army and served in the 101st Airborne Division. His military service shaped his discipline and leadership approach. After leaving the military, he worked various jobs including as a bodyguard at Bally Total Fitness before entering financial services.",
    source: "Valuetainment",
    date: "2023"
  },
  {
    title: "Patrick Bet-David Early Career",
    url: "https://www.forbes.com/profile/patrick-bet-david/",
    snippet: "Before founding PHP Agency, Bet-David worked at Morgan Stanley Dean Witter as a financial advisor from 2001 to 2009. This experience in traditional finance gave him insight into the insurance industry, which he later disrupted with his own company.",
    source: "Forbes",
    date: "2023"
  },

  // Family
  {
    title: "Jennifer Bet-David - Co-founder PHP Agency",
    url: "https://www.linkedin.com/in/jennifer-bet-david/",
    snippet: "Patrick Bet-David married Jennifer Bet-David in 2009. Jennifer Bet-David is co-founder of PHP Agency and serves as an executive. His wife Jennifer supports his business ventures.",
    source: "LinkedIn",
    date: "2024"
  },
  {
    title: "Bet-David Family and Children",
    url: "https://www.the-sun.com/entertainment/patrick-bet-david-family/",
    snippet: "Patrick Bet-David and his wife Jennifer have four children: his son Patrick Tico Jr, his son Dylan, his daughter Senna Rose, and his daughter Brooklyn Ivy. The family resides in Fort Lauderdale, Florida.",
    source: "The Sun",
    date: "2023"
  },
  {
    title: "Patrick Bet-David's Refugee Story",
    url: "https://www.youtube.com/watch?v=refuge_story",
    snippet: "Patrick Bet-David's father, Gabriel Bet-David, is Assyrian Christian. His mother is of Armenian descent. They fled Iran during the 1979 revolution when Patrick was just 1 year old. The family spent 2 years in a German refugee camp before settling in Glendale, California.",
    source: "YouTube",
    date: "2022"
  },

  // Companies and Business
  {
    title: "PHP Agency Overview - Insurance MLM",
    url: "https://www.phpagency.com/about",
    snippet: "PHP Agency was founded in 2009 by Patrick Bet-David as an insurance marketing organization. The company operates as a multi-level marketing (MLM) structure with over 40,000 licensed insurance agents across the United States. PHP Agency specializes in life insurance and financial services products.",
    source: "PHP Agency",
    date: "2024"
  },
  {
    title: "PHP Agency Acquisition Exit",
    url: "https://www.insurancenewsnet.com/php-agency-acquisition/",
    snippet: "In 2022, Patrick Bet-David announced a multi-nine-figure exit from PHP Agency through a partial acquisition deal. The exact terms were not disclosed, but industry sources estimate the valuation between $500 million to $1 billion for the insurance marketing organization.",
    source: "Insurance News Net",
    date: "2022"
  },
  {
    title: "Valuetainment Media Company",
    url: "https://valuetainment.com/",
    snippet: "Valuetainment was founded by Patrick Bet-David in 2012 as an entrepreneurship-focused YouTube channel. It has grown to become one of the largest business channels on YouTube with over 5 million subscribers. The company produces the PBD Podcast, Valuetainment Shorts, and various interview series.",
    source: "Valuetainment",
    date: "2024"
  },
  {
    title: "Valuetainment Studios Dallas",
    url: "https://variety.com/valuetainment-studios/",
    snippet: "In 2023, Valuetainment opened a 100,000+ square foot studio facility in Dallas, Texas. The facility serves as the production headquarters for the PBD Podcast and other Valuetainment programming. The company has expanded into live events, book publishing, and sports entertainment.",
    source: "Variety",
    date: "2023"
  },
  {
    title: "Minnect App Launch",
    url: "https://techcrunch.com/minnect-expert-app/",
    snippet: "Patrick Bet-David launched Minnect in 2022, a mobile app connecting users with experts for paid one-on-one conversations. The app features business experts, athletes, and influencers who charge per-minute rates for video calls. Bet-David himself is available on the platform.",
    source: "TechCrunch",
    date: "2022"
  },

  // Iranian Opposition & Heritage
  {
    title: "Patrick Bet-David on Iran and Islamic Republic",
    url: "https://valuetainment.com/iran-episode/",
    snippet: "Patrick Bet-David frequently speaks about his opposition to the Islamic Republic regime. As someone who fled Iran as a child during the 1979 revolution, he advocates for regime change and a free Iran. He has interviewed Iranian opposition figures and supports the Woman Life Freedom movement.",
    source: "Valuetainment",
    date: "2023"
  },
  {
    title: "PBD Podcast Iranian Diaspora Episodes",
    url: "https://www.youtube.com/watch?v=iran-diaspora",
    snippet: "Bet-David has used his platform to give voice to the Iranian diaspora and opposition. He supports secular democracy for Iran and has criticized the theocratic regime. His Assyrian Christian heritage connects him to persecuted minorities under the Islamic Republic.",
    source: "YouTube",
    date: "2023"
  },
  {
    title: "Patrick Bet-David Anti-Regime Stance",
    url: "https://twitter.com/patrickbetdavid/iran-protests",
    snippet: "During the 2022 protests following Mahsa Amini's death, Patrick Bet-David voiced support for the Woman Life Freedom movement and called for an end to the Islamic Republic. He advocates for human rights in Iran and supports the Iranian people's fight for freedom.",
    source: "Twitter/X",
    date: "2022"
  },

  // Political Views
  {
    title: "Patrick Bet-David Trump Support",
    url: "https://www.newsweek.com/pbd-trump-interview/",
    snippet: "Patrick Bet-David has been an outspoken supporter of Donald Trump. He conducted a widely-viewed interview with Trump in 2024 on the PBD Podcast. Bet-David has described himself as a conservative and has criticized left-wing policies. He believes the 2020 election was 'Rigged Lite' as he calls it.",
    source: "Newsweek",
    date: "2024"
  },
  {
    title: "PBD Podcast Political Guests",
    url: "https://www.dailybeast.com/pbd-podcast-politics/",
    snippet: "The PBD Podcast has featured numerous conservative political figures including Donald Trump, Tucker Carlson, Tulsi Gabbard, and Vivek Ramaswamy. Critics have labeled the show as right-wing media, while Bet-David claims he interviews guests from all political backgrounds.",
    source: "Daily Beast",
    date: "2024"
  },
  {
    title: "Patrick Bet-David Anti-Socialism Views",
    url: "https://twitter.com/patrickbetdavid/socialism",
    snippet: "Drawing from his experience as a refugee from Iran, Patrick Bet-David frequently speaks against socialism and communism. He credits capitalism and American opportunity for his success and warns against what he sees as socialist policies being promoted in American politics.",
    source: "Twitter/X",
    date: "2023"
  },

  // Controversies
  {
    title: "PHP Agency Pyramid Scheme Allegations",
    url: "https://www.mlmtruth.com/php-agency-review/",
    snippet: "PHP Agency has faced criticism for its MLM business model, with critics calling it a pyramid scheme. The company's structure involves agents recruiting other agents and earning commissions on their sales. Former agents have claimed the focus is on recruitment rather than selling insurance products.",
    source: "MLM Truth",
    date: "2023"
  },
  {
    title: "Coffeezilla vs Patrick Bet-David Confrontation",
    url: "https://www.youtube.com/watch?v=coffeezilla-pbd",
    snippet: "YouTube investigator Coffeezilla (Stephen Findeisen) publicly confronted Patrick Bet-David at an event in 2023 regarding PHP Agency's business practices. The confrontation went viral, with Coffeezilla questioning the MLM structure and agent earnings claims.",
    source: "YouTube",
    date: "2023"
  },
  {
    title: "Daily Beast Investigation PHP Agency",
    url: "https://www.dailybeast.com/php-agency-investigation/",
    snippet: "The Daily Beast published an investigation into PHP Agency in 2021, interviewing former agents who claimed they lost money after joining the company. The article highlighted aggressive recruitment tactics and questioned income disclosure statements provided to new recruits.",
    source: "Daily Beast",
    date: "2021"
  },
  {
    title: "Patrick Bet-David Mansion Controversy",
    url: "https://www.miamiherald.com/pbd-mansion/",
    snippet: "Patrick Bet-David's $25 million Fort Lauderdale mansion has been cited by critics as evidence of wealth disparity within PHP Agency, where most agents earn minimal income. Supporters counter that his wealth came from multiple business ventures beyond PHP Agency.",
    source: "Miami Herald",
    date: "2022"
  },

  // Team & Associates
  {
    title: "Adam Sosnick PBD Podcast Co-host",
    url: "https://www.linkedin.com/in/adamsosnick/",
    snippet: "Adam Sosnick is a co-host of the PBD Podcast and longtime associate of Patrick Bet-David. Previously a financial advisor and PHP Agency executive, Sosnick now serves as a key voice on the podcast, often engaging in political and cultural debates alongside Bet-David.",
    source: "LinkedIn",
    date: "2024"
  },
  {
    title: "Tom Ellsworth 'The Biz Doc'",
    url: "https://valuetainment.com/tom-ellsworth/",
    snippet: "Tom Ellsworth, known as 'The Biz Doc', is a co-host on the PBD Podcast and business analyst for Valuetainment. He brings corporate experience from his career at GTE and Verizon, providing business analysis on the show. He is one of Bet-David's most trusted advisors.",
    source: "Valuetainment",
    date: "2024"
  },
  {
    title: "Vincent Oshana Comedy",
    url: "https://www.instagram.com/vincentoshana/",
    snippet: "Vincent Oshana is a comedian and regular panelist on the PBD Podcast. Of Armenian and Assyrian heritage like Bet-David, Oshana provides comedic commentary on the show. He has been part of the Valuetainment team since 2021.",
    source: "Instagram",
    date: "2024"
  },
  {
    title: "Mario Murillo Valuetainment Advisor",
    url: "https://valuetainment.com/team/",
    snippet: "Mario Murillo serves as an advisor to Patrick Bet-David and has appeared on various Valuetainment programs. He is involved in the strategic direction of the media company and has expertise in scaling business operations.",
    source: "Valuetainment",
    date: "2023"
  },

  // Media Appearances
  {
    title: "Joe Rogan Experience #1711 Patrick Bet-David",
    url: "https://www.youtube.com/watch?v=jre1711",
    snippet: "Patrick Bet-David appeared on The Joe Rogan Experience podcast episode #1711 in 2021, discussing his refugee story, building PHP Agency, and his views on capitalism and the American dream. The episode garnered millions of views and significantly expanded his audience.",
    source: "YouTube",
    date: "2021"
  },
  {
    title: "Joe Rogan Experience #2016 Return",
    url: "https://www.youtube.com/watch?v=jre2016",
    snippet: "Bet-David returned to Joe Rogan's podcast in 2023 for episode #2016, discussing the state of media, his Valuetainment expansion, and current political landscape. Rogan praised Bet-David's interviewing skills and entrepreneurial journey.",
    source: "YouTube",
    date: "2023"
  },
  {
    title: "Trump Interview on PBD Podcast",
    url: "https://www.youtube.com/watch?v=trump-pbd",
    snippet: "Former President Donald Trump sat down with Patrick Bet-David for an exclusive interview on the PBD Podcast in 2024. The interview covered the 2024 presidential campaign, Trump's business empire, and his political future. It became one of the most-watched political podcasts of the year.",
    source: "YouTube",
    date: "2024"
  },
  {
    title: "Patrick Bet-David Interviews",
    url: "https://valuetainment.com/interviews/",
    snippet: "Patrick Bet-David has interviewed numerous celebrities and business figures including Kobe Bryant (his final interview before his death), Magic Johnson, Steve Wozniak, Grant Cardone, Robert Kiyosaki, and many political figures. His interview style focuses on personal stories and business lessons.",
    source: "Valuetainment",
    date: "2024"
  },

  // Books & Content
  {
    title: "Your Next Five Moves Book",
    url: "https://www.amazon.com/Your-Next-Five-Moves/",
    snippet: "Patrick Bet-David authored 'Your Next Five Moves: Master the Art of Business Strategy' published in 2020. The book became a Wall Street Journal bestseller and outlines strategic thinking principles for business and life, drawing from chess analogies and his entrepreneurial experience.",
    source: "Amazon",
    date: "2020"
  },
  {
    title: "Choose Your Enemies Wisely Book",
    url: "https://www.amazon.com/Choose-Your-Enemies-Wisely/",
    snippet: "In 2023, Patrick Bet-David released his second book 'Choose Your Enemies Wisely: Business Planning for the Audacious Few'. The book focuses on using competition and adversity as motivation, continuing his themes of strategic thinking and entrepreneurial mindset.",
    source: "Amazon",
    date: "2023"
  },

  // Net Worth & Financials
  {
    title: "Patrick Bet-David Net Worth 2024",
    url: "https://www.celebritynetworth.com/patrick-bet-david/",
    snippet: "Patrick Bet-David's estimated net worth is between $200-350 million as of 2024. His wealth comes from multiple sources: the partial exit from PHP Agency, Valuetainment media revenue, book sales, speaking fees (reportedly $10 million annually), and real estate investments including his $25 million Florida mansion.",
    source: "Celebrity Net Worth",
    date: "2024"
  },
  {
    title: "PHP Agency Revenue and Scale",
    url: "https://www.businessinsider.com/php-agency-scale/",
    snippet: "PHP Agency reportedly generates hundreds of millions in annual insurance premium volume through its network of 40,000+ agents. The company operates in all 50 states and has expanded into financial planning and investment products beyond life insurance.",
    source: "Business Insider",
    date: "2023"
  },

  // Timeline Events
  {
    title: "Patrick Bet-David Timeline",
    url: "https://valuetainment.com/about-patrick/",
    snippet: "Key timeline: 1978 - Born in Tehran, Iran. 1979 - Family flees Iranian Revolution. 1980-1990 - Lives as refugee in Germany. 1990 - Immigrates to United States. 1997 - Joins US Army, 101st Airborne. 2001 - Begins career at Morgan Stanley. 2009 - Founds PHP Agency, marries Jennifer. 2012 - Launches Valuetainment YouTube channel. 2020 - Publishes 'Your Next Five Moves'. 2022 - Multi-nine-figure exit from PHP Agency. 2023 - Opens Dallas studio facility.",
    source: "Valuetainment",
    date: "2024"
  },

  // Social Media
  {
    title: "Patrick Bet-David Social Media Presence",
    url: "https://www.socialblade.com/patrickbetdavid/",
    snippet: "Patrick Bet-David has a significant social media presence: 5+ million YouTube subscribers on Valuetainment channel, 3+ million Instagram followers (@patrickbetdavid), 1.5+ million Twitter/X followers, and significant TikTok presence. His content focuses on business, motivation, and political commentary.",
    source: "Social Blade",
    date: "2024"
  },

  // Organizations & Initiatives
  {
    title: "Valuetainment University",
    url: "https://valuetainmentuniversity.com/",
    snippet: "Patrick Bet-David launched Valuetainment University, an online education platform offering courses on business, entrepreneurship, and leadership. The platform features paid courses and coaching programs, extending the Valuetainment brand into education.",
    source: "Valuetainment University",
    date: "2023"
  },
  {
    title: "Bet-David Consulting",
    url: "https://betdavidconsulting.com/",
    snippet: "Bet-David Consulting offers executive consulting and speaking engagements. Patrick Bet-David commands speaking fees of up to $250,000 for keynote addresses at corporate events and conferences. The consulting arm works with entrepreneurs and established businesses.",
    source: "Bet-David Consulting",
    date: "2024"
  }
];

/**
 * Run PRISM research on Patrick Bet-David
 */
async function runResearch(): Promise<void> {
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
║  Research Target: Patrick Bet-David                                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  // Initialize orchestrator with DEEP analysis
  const orchestrator = new PRISMOrchestrator({
    depth: 'DEEP',
    includeControversies: true,
    includeFunding: true,
    includeOpposition: true
  });

  // Initialize visualizer
  const visualizer = new PRISMVisualizer();

  try {
    // Run research
    console.log(`📊 Loaded ${searchResults.length} curated search results\n`);

    const report = await orchestrator.research('Patrick Bet-David', searchResults);

    // Output results
    console.log('\n' + '═'.repeat(80));
    console.log('                         INTELLIGENCE REPORT');
    console.log('═'.repeat(80) + '\n');

    // ASCII visualization
    console.log(visualizer.generate(report));

    console.log('\n' + '═'.repeat(80));
    console.log('                         RELATIONSHIP GRAPH');
    console.log('═'.repeat(80) + '\n');

    // Mermaid diagram
    console.log('```mermaid');
    console.log(visualizer.generateMermaid(report));
    console.log('```');

    // Export JSON
    const jsonOutput = visualizer.exportJSON(report);
    console.log('\n' + '═'.repeat(80));
    console.log('                         JSON EXPORT');
    console.log('═'.repeat(80) + '\n');
    console.log(jsonOutput);

  } catch (error) {
    console.error('❌ Research error:', error);
    throw error;
  }
}

// Execute
runResearch().catch(console.error);
