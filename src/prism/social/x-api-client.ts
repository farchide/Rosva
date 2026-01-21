/**
 * PRISM X (Twitter) API Client
 *
 * Full X API v2 integration for searching and fetching:
 * - User profiles by username or search
 * - User tweets and timelines
 * - Tweet search by keywords
 * - Follower/following networks
 *
 * Requires X API credentials:
 * - X_BEARER_TOKEN (for read-only access)
 * - X_API_KEY + X_API_SECRET (for user context)
 */

export interface XApiConfig {
  bearerToken?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

export interface XUserResponse {
  id: string;
  name: string;
  username: string;
  description?: string;
  location?: string;
  url?: string;
  profile_image_url?: string;
  verified?: boolean;
  verified_type?: string;
  created_at?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  entities?: {
    url?: { urls: { expanded_url: string }[] };
    description?: { urls: { expanded_url: string }[]; hashtags: { tag: string }[] };
  };
}

export interface XTweetResponse {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  entities?: {
    hashtags?: { tag: string }[];
    mentions?: { username: string }[];
    urls?: { expanded_url: string }[];
  };
  referenced_tweets?: { type: string; id: string }[];
}

export interface XSearchResult {
  users: XUserResponse[];
  tweets: XTweetResponse[];
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

export class XApiClient {
  private config: XApiConfig;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(config?: XApiConfig) {
    this.config = {
      bearerToken: config?.bearerToken || process.env.X_BEARER_TOKEN,
      apiKey: config?.apiKey || process.env.X_API_KEY,
      apiSecret: config?.apiSecret || process.env.X_API_SECRET,
      accessToken: config?.accessToken || process.env.X_ACCESS_TOKEN,
      accessTokenSecret: config?.accessTokenSecret || process.env.X_ACCESS_TOKEN_SECRET
    };
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.config.bearerToken;
  }

  /**
   * Get authorization header
   */
  private getAuthHeader(): Record<string, string> {
    if (this.config.bearerToken) {
      return {
        'Authorization': `Bearer ${this.config.bearerToken}`,
        'Content-Type': 'application/json'
      };
    }
    throw new Error('X API not configured. Set X_BEARER_TOKEN environment variable.');
  }

  /**
   * Make API request
   */
  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeader()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`X API Error ${response.status}: ${JSON.stringify(error)}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search for users by query
   */
  async searchUsers(query: string, maxResults: number = 10): Promise<XUserResponse[]> {
    if (!this.isConfigured()) {
      console.log('  X API not configured');
      return [];
    }

    try {
      console.log(`  Searching X for users: "${query}"`);

      // Note: X API v2 doesn't have direct user search, using tweets search with user expansion
      const result = await this.request<{ data?: XTweetResponse[]; includes?: { users?: XUserResponse[] } }>(
        '/tweets/search/recent',
        {
          'query': `from:${query.replace(/\s+/g, '')} OR ${query}`,
          'max_results': '10',
          'expansions': 'author_id',
          'user.fields': 'id,name,username,description,location,url,profile_image_url,verified,created_at,public_metrics'
        }
      );

      return result.includes?.users || [];
    } catch (error: any) {
      console.log(`  X user search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<XUserResponse | null> {
    if (!this.isConfigured()) {
      console.log('  X API not configured');
      return null;
    }

    try {
      // Remove @ if present
      const cleanUsername = username.replace(/^@/, '');
      console.log(`  Fetching X profile: @${cleanUsername}`);

      const result = await this.request<{ data?: XUserResponse }>(
        `/users/by/username/${cleanUsername}`,
        {
          'user.fields': 'id,name,username,description,location,url,profile_image_url,verified,verified_type,created_at,public_metrics,entities'
        }
      );

      return result.data || null;
    } catch (error: any) {
      console.log(`  X profile fetch failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get multiple users by usernames
   */
  async getUsersByUsernames(usernames: string[]): Promise<XUserResponse[]> {
    if (!this.isConfigured() || usernames.length === 0) {
      return [];
    }

    try {
      const cleanUsernames = usernames.map(u => u.replace(/^@/, '')).join(',');
      console.log(`  Fetching ${usernames.length} X profiles...`);

      const result = await this.request<{ data?: XUserResponse[] }>(
        '/users/by',
        {
          'usernames': cleanUsernames,
          'user.fields': 'id,name,username,description,location,url,profile_image_url,verified,verified_type,created_at,public_metrics,entities'
        }
      );

      return result.data || [];
    } catch (error: any) {
      console.log(`  X profiles fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(userId: string, maxResults: number = 100): Promise<XTweetResponse[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      console.log(`  Fetching tweets for user ${userId}...`);

      const result = await this.request<{ data?: XTweetResponse[] }>(
        `/users/${userId}/tweets`,
        {
          'max_results': Math.min(maxResults, 100).toString(),
          'tweet.fields': 'id,text,created_at,public_metrics,entities,referenced_tweets',
          'exclude': 'retweets'
        }
      );

      return result.data || [];
    } catch (error: any) {
      console.log(`  Tweet fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search tweets by query
   */
  async searchTweets(query: string, maxResults: number = 100): Promise<{ tweets: XTweetResponse[]; users: XUserResponse[] }> {
    if (!this.isConfigured()) {
      return { tweets: [], users: [] };
    }

    try {
      console.log(`  Searching X tweets: "${query}"`);

      const result = await this.request<{
        data?: XTweetResponse[];
        includes?: { users?: XUserResponse[] };
        meta?: { result_count: number; next_token?: string };
      }>(
        '/tweets/search/recent',
        {
          'query': query,
          'max_results': Math.min(maxResults, 100).toString(),
          'tweet.fields': 'id,text,created_at,author_id,public_metrics,entities,referenced_tweets',
          'expansions': 'author_id',
          'user.fields': 'id,name,username,description,verified,public_metrics'
        }
      );

      return {
        tweets: result.data || [],
        users: result.includes?.users || []
      };
    } catch (error: any) {
      console.log(`  Tweet search failed: ${error.message}`);
      return { tweets: [], users: [] };
    }
  }

  /**
   * Search for Iran-related tweets about a person
   */
  async searchIranRelatedTweets(subject: string): Promise<{ tweets: XTweetResponse[]; users: XUserResponse[] }> {
    const queries = [
      `${subject} Iran`,
      `${subject} (mahsa OR amini OR "woman life freedom")`,
      `${subject} (pahlavi OR shah OR monarchy)`,
      `${subject} (#FreeIran OR #IranProtests OR #WomanLifeFreedom)`
    ];

    const allTweets: XTweetResponse[] = [];
    const allUsers: XUserResponse[] = [];
    const seenTweetIds = new Set<string>();
    const seenUserIds = new Set<string>();

    for (const query of queries) {
      const result = await this.searchTweets(query, 25);

      for (const tweet of result.tweets) {
        if (!seenTweetIds.has(tweet.id)) {
          seenTweetIds.add(tweet.id);
          allTweets.push(tweet);
        }
      }

      for (const user of result.users) {
        if (!seenUserIds.has(user.id)) {
          seenUserIds.add(user.id);
          allUsers.push(user);
        }
      }
    }

    return { tweets: allTweets, users: allUsers };
  }

  /**
   * Get user's followers (sample)
   */
  async getUserFollowers(userId: string, maxResults: number = 100): Promise<XUserResponse[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      console.log(`  Fetching followers for user ${userId}...`);

      const result = await this.request<{ data?: XUserResponse[] }>(
        `/users/${userId}/followers`,
        {
          'max_results': Math.min(maxResults, 100).toString(),
          'user.fields': 'id,name,username,description,verified,public_metrics'
        }
      );

      return result.data || [];
    } catch (error: any) {
      console.log(`  Followers fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get who user is following
   */
  async getUserFollowing(userId: string, maxResults: number = 100): Promise<XUserResponse[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      console.log(`  Fetching following for user ${userId}...`);

      const result = await this.request<{ data?: XUserResponse[] }>(
        `/users/${userId}/following`,
        {
          'max_results': Math.min(maxResults, 100).toString(),
          'user.fields': 'id,name,username,description,verified,public_metrics'
        }
      );

      return result.data || [];
    } catch (error: any) {
      console.log(`  Following fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Full profile analysis for a subject
   */
  async analyzeSubject(subject: string): Promise<XSubjectAnalysis> {
    console.log(`\n  Starting X analysis for "${subject}"...`);

    const analysis: XSubjectAnalysis = {
      profile: null,
      tweets: [],
      iranRelatedTweets: [],
      mentionedBy: [],
      following: [],
      followers: [],
      politicalHashtags: [],
      iranHashtags: [],
      mentionedUsers: [],
      searchSuccess: false
    };

    if (!this.isConfigured()) {
      console.log('  X API not configured. Set X_BEARER_TOKEN to enable.');
      return analysis;
    }

    try {
      // Try to find their profile by username guess
      const usernameGuess = subject.toLowerCase().replace(/\s+/g, '');
      const profile = await this.getUserByUsername(usernameGuess);

      if (profile) {
        analysis.profile = profile;
        analysis.searchSuccess = true;

        // Get their tweets
        analysis.tweets = await this.getUserTweets(profile.id, 100);

        // Analyze tweets for hashtags and mentions
        for (const tweet of analysis.tweets) {
          if (tweet.entities?.hashtags) {
            for (const ht of tweet.entities.hashtags) {
              analysis.politicalHashtags.push(ht.tag.toLowerCase());
            }
          }
          if (tweet.entities?.mentions) {
            for (const m of tweet.entities.mentions) {
              analysis.mentionedUsers.push(m.username);
            }
          }
        }

        // Get sample of who they follow
        analysis.following = await this.getUserFollowing(profile.id, 50);
      }

      // Search for Iran-related content
      const iranResults = await this.searchIranRelatedTweets(subject);
      analysis.iranRelatedTweets = iranResults.tweets;
      analysis.mentionedBy = iranResults.users;

      // Extract Iran-specific hashtags
      for (const tweet of analysis.iranRelatedTweets) {
        if (tweet.entities?.hashtags) {
          for (const ht of tweet.entities.hashtags) {
            const tag = ht.tag.toLowerCase();
            if (this.isIranRelatedHashtag(tag)) {
              analysis.iranHashtags.push(tag);
            }
          }
        }
      }

      console.log(`  X analysis complete: ${analysis.tweets.length} tweets, ${analysis.iranRelatedTweets.length} Iran-related`);

    } catch (error: any) {
      console.log(`  X analysis failed: ${error.message}`);
    }

    return analysis;
  }

  /**
   * Check if hashtag is Iran-related
   */
  private isIranRelatedHashtag(tag: string): boolean {
    const iranTags = [
      'iran', 'iranian', 'persia', 'persian',
      'mahsaamini', 'mahsa', 'amini', 'jinaamini',
      'womanlifefreedom', 'زن_زندگی_آزادی',
      'freeiran', 'iranprotests', 'iranrevolution',
      'pahlavi', 'rezapahlavi', 'shah', 'monarchy',
      'mek', 'ncri', 'pmoi',
      'irgc', 'khamenei', 'rouhani', 'raisi',
      'tehran', 'isfahan', 'shiraz', 'tabriz'
    ];
    return iranTags.some(t => tag.includes(t));
  }
}

export interface XSubjectAnalysis {
  profile: XUserResponse | null;
  tweets: XTweetResponse[];
  iranRelatedTweets: XTweetResponse[];
  mentionedBy: XUserResponse[];
  following: XUserResponse[];
  followers: XUserResponse[];
  politicalHashtags: string[];
  iranHashtags: string[];
  mentionedUsers: string[];
  searchSuccess: boolean;
}

/**
 * Convert X API analysis to PRISM format
 */
export function convertToSearchResults(analysis: XSubjectAnalysis, subject: string): { snippet: string; url: string; title: string }[] {
  const results: { snippet: string; url: string; title: string }[] = [];

  // Add profile info
  if (analysis.profile) {
    results.push({
      title: `${analysis.profile.name} (@${analysis.profile.username}) - X Profile`,
      url: `https://x.com/${analysis.profile.username}`,
      snippet: `${analysis.profile.description || ''} Followers: ${analysis.profile.public_metrics?.followers_count || 0}. Following: ${analysis.profile.public_metrics?.following_count || 0}. Tweets: ${analysis.profile.public_metrics?.tweet_count || 0}. ${analysis.profile.verified ? 'Verified account.' : ''}`
    });
  }

  // Add tweets as search results
  for (const tweet of analysis.tweets.slice(0, 20)) {
    results.push({
      title: `Tweet by ${subject}`,
      url: `https://x.com/i/status/${tweet.id}`,
      snippet: tweet.text
    });
  }

  // Add Iran-related tweets
  for (const tweet of analysis.iranRelatedTweets.slice(0, 10)) {
    results.push({
      title: `Iran-related: ${subject}`,
      url: `https://x.com/i/status/${tweet.id}`,
      snippet: tweet.text
    });
  }

  // Add following as connections
  for (const user of analysis.following.slice(0, 10)) {
    if (user.verified || (user.public_metrics?.followers_count || 0) > 100000) {
      results.push({
        title: `${subject} follows ${user.name}`,
        url: `https://x.com/${user.username}`,
        snippet: `@${user.username} - ${user.description || 'No bio'}. ${user.public_metrics?.followers_count || 0} followers.`
      });
    }
  }

  return results;
}
