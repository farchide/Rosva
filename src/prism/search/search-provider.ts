/**
 * PRISM Search Provider
 *
 * Interface and implementations for gathering search results from various sources.
 * Supports multiple search backends (DuckDuckGo, SerpAPI, Google, etc.)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface SearchProvider {
  name: string;
  search(query: string, maxResults?: number): Promise<SearchResult[]>;
}

/**
 * Generate comprehensive search queries for a person
 */
export function generateSearchQueries(subject: string): string[] {
  return [
    // Biography & Background
    `${subject} biography`,
    `${subject} born birthplace nationality`,
    `${subject} early life childhood`,

    // Family
    `${subject} family parents children`,
    `${subject} spouse wife husband married`,
    `${subject} siblings brothers sisters`,

    // Education & Career
    `${subject} education university degree`,
    `${subject} career positions jobs`,
    `${subject} companies founded CEO`,

    // Political
    `${subject} political views positions`,
    `${subject} political party affiliation`,
    `${subject} Republican Democrat conservative liberal`,
    `${subject} endorsements supported`,
    `${subject} Trump Biden political`,

    // Iranian Opposition (for Iranian-related subjects)
    `${subject} Iran Iranian`,
    `${subject} Islamic Republic regime`,
    `${subject} Pahlavi monarchist`,
    `${subject} MEK NCRI opposition`,
    `${subject} Woman Life Freedom Mahsa Amini`,
    `${subject} secular democracy Iran`,
    `${subject} diaspora exile`,

    // Foreign Relations
    `${subject} Israel meeting`,
    `${subject} United States relations`,
    `${subject} Saudi Arabia UAE`,

    // Funding & Business
    `${subject} funding donors backers`,
    `${subject} net worth wealth`,
    `${subject} business investments`,

    // Controversies
    `${subject} controversy scandal criticism`,
    `${subject} allegations accused`,

    // Media & Social
    `${subject} interview podcast`,
    `${subject} Twitter X Instagram social media`,
    `${subject} YouTube channel`,

    // Organizations
    `${subject} organizations associations member`,
    `${subject} foundation charity nonprofit`,
    `${subject} advisors associates allies`
  ];
}

/**
 * DuckDuckGo HTML Search Provider (no API key required)
 */
export class DuckDuckGoProvider implements SearchProvider {
  name = 'DuckDuckGo';

  async search(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      const response = await axios.get('https://html.duckduckgo.com/html/', {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $('.result').each((i, elem) => {
        if (i >= maxResults) return false;

        const titleElem = $(elem).find('.result__title a');
        const snippetElem = $(elem).find('.result__snippet');
        const urlElem = $(elem).find('.result__url');

        const title = titleElem.text().trim();
        const snippet = snippetElem.text().trim();
        let url = titleElem.attr('href') || '';

        // DuckDuckGo encodes URLs
        if (url.includes('uddg=')) {
          const match = url.match(/uddg=([^&]+)/);
          if (match) {
            url = decodeURIComponent(match[1]);
          }
        }

        if (title && snippet && url) {
          results.push({
            title,
            url,
            snippet,
            source: this.extractSource(url),
            date: this.extractDate(snippet)
          });
        }
      });
    } catch (error) {
      console.error(`DuckDuckGo search error: ${error}`);
    }

    return results;
  }

  private extractSource(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  private extractDate(text: string): string | undefined {
    const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
    if (dateMatch) return dateMatch[1];

    const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) return yearMatch[1];

    return undefined;
  }
}

/**
 * Wikipedia API Search Provider
 */
export class WikipediaProvider implements SearchProvider {
  name = 'Wikipedia';

  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Search for articles
      const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          srlimit: maxResults,
          format: 'json',
          origin: '*'
        },
        timeout: 10000
      });

      const searchResults = searchResponse.data.query?.search || [];

      for (const item of searchResults) {
        // Get extract for each result
        try {
          const extractResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
              action: 'query',
              prop: 'extracts',
              exintro: true,
              explaintext: true,
              titles: item.title,
              format: 'json',
              origin: '*'
            },
            timeout: 10000
          });

          const pages = extractResponse.data.query?.pages || {};
          const page = Object.values(pages)[0] as any;

          if (page && page.extract) {
            results.push({
              title: item.title,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
              snippet: page.extract.substring(0, 500),
              source: 'Wikipedia',
              date: new Date().getFullYear().toString()
            });
          }
        } catch (e) {
          // Skip if extract fails
        }
      }
    } catch (error) {
      console.error(`Wikipedia search error: ${error}`);
    }

    return results;
  }
}

/**
 * Composite Search Provider - combines multiple providers
 */
export class CompositeSearchProvider implements SearchProvider {
  name = 'Composite';
  private providers: SearchProvider[];

  constructor(providers?: SearchProvider[]) {
    this.providers = providers || [
      new WikipediaProvider(),
      new DuckDuckGoProvider()
    ];
  }

  async search(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const provider of this.providers) {
      try {
        const results = await provider.search(query, Math.ceil(maxResults / this.providers.length));

        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            allResults.push(result);
          }
        }
      } catch (error) {
        console.error(`${provider.name} search failed:`, error);
      }
    }

    return allResults.slice(0, maxResults);
  }
}

/**
 * Research a subject by running multiple queries and aggregating results
 */
export async function researchSubject(
  subject: string,
  provider: SearchProvider,
  options: { maxQueriesParallel?: number; resultsPerQuery?: number } = {}
): Promise<SearchResult[]> {
  const { maxQueriesParallel = 3, resultsPerQuery = 5 } = options;

  const queries = generateSearchQueries(subject);
  const allResults: SearchResult[] = [];
  const seenUrls = new Set<string>();

  console.log(`📡 Executing ${queries.length} search queries...`);

  // Process queries in batches to avoid rate limiting
  for (let i = 0; i < queries.length; i += maxQueriesParallel) {
    const batch = queries.slice(i, i + maxQueriesParallel);

    const batchPromises = batch.map(async (query) => {
      try {
        return await provider.search(query, resultsPerQuery);
      } catch (error) {
        console.error(`Query failed: ${query}`);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);

    for (const results of batchResults) {
      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }
    }

    // Small delay between batches to be respectful
    if (i + maxQueriesParallel < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batch.length) / queries.length) * 100));
    process.stdout.write(`\r   Progress: ${progress}% (${allResults.length} results)`);
  }

  console.log(`\n✅ Collected ${allResults.length} unique search results\n`);

  return allResults;
}
