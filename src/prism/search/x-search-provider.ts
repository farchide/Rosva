/**
 * PRISM X Search Provider
 *
 * Integrates X (Twitter) API as a search source for the research pipeline.
 * Fetches user profiles, tweets, and political/Iran-related content.
 */

import { XApiClient, XSubjectAnalysis, convertToSearchResults } from '../social/x-api-client';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export class XSearchProvider {
  private client: XApiClient;

  constructor() {
    this.client = new XApiClient();
  }

  /**
   * Check if X API is configured
   */
  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  /**
   * Search X for a subject and return results in standard search format
   */
  async search(subject: string): Promise<SearchResult[]> {
    if (!this.isConfigured()) {
      console.log('  X Search: API not configured (set X_BEARER_TOKEN)');
      return [];
    }

    console.log(`\n  X Search: Researching "${subject}" on X/Twitter...`);

    try {
      // Full analysis
      const analysis = await this.client.analyzeSubject(subject);

      // Convert to search results format
      const results = convertToSearchResults(analysis, subject);

      // Add source tag
      return results.map(r => ({
        ...r,
        source: 'X/Twitter'
      }));

    } catch (error: any) {
      console.log(`  X Search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search specifically for Iran-related content
   */
  async searchIranContent(subject: string): Promise<SearchResult[]> {
    if (!this.isConfigured()) {
      return [];
    }

    console.log(`  X Search: Finding Iran-related content for "${subject}"...`);

    try {
      const iranResults = await this.client.searchIranRelatedTweets(subject);

      const results: SearchResult[] = [];

      // Convert tweets to search results
      for (const tweet of iranResults.tweets) {
        results.push({
          title: `Iran-related X post about ${subject}`,
          url: `https://x.com/i/status/${tweet.id}`,
          snippet: tweet.text,
          source: 'X/Twitter (Iran-related)'
        });
      }

      // Add users who mentioned the subject in Iran context
      for (const user of iranResults.users) {
        results.push({
          title: `${user.name} discussed ${subject} and Iran`,
          url: `https://x.com/${user.username}`,
          snippet: `@${user.username}: ${user.description || 'X user'}. ${user.public_metrics?.followers_count || 0} followers.`,
          source: 'X/Twitter (Iran-related)'
        });
      }

      return results;

    } catch (error: any) {
      console.log(`  X Iran search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get direct profile analysis
   */
  async getProfileAnalysis(subject: string): Promise<XSubjectAnalysis | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      return await this.client.analyzeSubject(subject);
    } catch {
      return null;
    }
  }

  /**
   * Generate X-specific search queries
   */
  static generateQueries(subject: string): string[] {
    return [
      `${subject}`,
      `${subject} Iran`,
      `${subject} politics`,
      `${subject} interview`,
      `${subject} (mahsa OR amini OR "woman life freedom")`,
      `${subject} (pahlavi OR shah)`,
      `${subject} (republican OR democrat OR conservative OR liberal)`,
      `${subject} controversy`,
      `from:${subject.toLowerCase().replace(/\s+/g, '')}`
    ];
  }
}

/**
 * Standalone function to add X results to existing search results
 */
export async function augmentWithXSearch(
  existingResults: SearchResult[],
  subject: string
): Promise<SearchResult[]> {
  const xProvider = new XSearchProvider();

  if (!xProvider.isConfigured()) {
    return existingResults;
  }

  const xResults = await xProvider.search(subject);

  // Combine results, X results at the end
  return [...existingResults, ...xResults];
}
