/**
 * PRISM X (Twitter) Social Media Provider
 *
 * Integrates with X/Twitter for social media intelligence:
 * - Profile analysis
 * - Tweet history and engagement
 * - Follower/following network
 * - Hashtag and mention analysis
 * - Influence metrics
 *
 * API Key can be provided later for live data access.
 */

export interface XProfile {
  username: string;
  displayName: string;
  bio: string;
  location?: string;
  website?: string;
  joinDate?: string;
  verified: boolean;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  profileImageUrl?: string;
  bannerImageUrl?: string;
}

export interface XTweet {
  id: string;
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  hashtags: string[];
  mentions: string[];
  urls: string[];
  isRetweet: boolean;
  isReply: boolean;
  inReplyToUser?: string;
  mediaUrls?: string[];
}

export interface XEngagement {
  totalTweets: number;
  averageLikes: number;
  averageRetweets: number;
  averageReplies: number;
  engagementRate: number;
  topHashtags: { tag: string; count: number }[];
  topMentions: { user: string; count: number }[];
  postingFrequency: string; // e.g., "5 tweets/day"
  mostActiveHours: number[];
}

export interface XInfluenceMetrics {
  followerToFollowingRatio: number;
  engagementRate: number;
  reachScore: number; // Estimated reach based on followers and engagement
  influenceScore: number; // 0-100 overall influence score
  audienceQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  verificationStatus: 'VERIFIED' | 'NOT_VERIFIED' | 'BLUE_CHECK';
}

export interface XNetworkConnection {
  username: string;
  displayName: string;
  connectionType: 'FOLLOWER' | 'FOLLOWING' | 'MUTUAL';
  verified: boolean;
  followerCount: number;
  category?: string; // e.g., "Politician", "Journalist", "Activist"
}

export interface XAnalysisResult {
  profile: XProfile | null;
  recentTweets: XTweet[];
  engagement: XEngagement;
  influence: XInfluenceMetrics;
  notableConnections: XNetworkConnection[];
  politicalIndicators: XPoliticalIndicators;
  iranRelatedActivity: XIranActivity;
}

export interface XPoliticalIndicators {
  detectedAffiliations: { party: string; confidence: number; evidence: string[] }[];
  politicalHashtags: { tag: string; count: number; leaning: string }[];
  engagedPoliticians: { username: string; party: string; interactionCount: number }[];
  politicalTopics: string[];
}

export interface XIranActivity {
  iranRelatedTweets: number;
  oppositionHashtags: string[];
  oppositionMentions: string[];
  regimeHashtags: string[];
  stance: 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN';
  confidence: number;
  evidence: string[];
}

export interface XProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  maxTweets?: number;
  includeReplies?: boolean;
  includeRetweets?: boolean;
}

export class XProvider {
  private config: XProviderConfig;
  private isConfigured: boolean;

  constructor(config: XProviderConfig = {}) {
    this.config = {
      maxTweets: config.maxTweets || 100,
      includeReplies: config.includeReplies ?? true,
      includeRetweets: config.includeRetweets ?? false,
      apiKey: config.apiKey || process.env.X_API_KEY,
      apiSecret: config.apiSecret || process.env.X_API_SECRET,
      bearerToken: config.bearerToken || process.env.X_BEARER_TOKEN
    };

    this.isConfigured = !!(this.config.bearerToken || (this.config.apiKey && this.config.apiSecret));
  }

  /**
   * Check if X API is configured
   */
  isApiConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Search for X profile by username or name
   */
  async searchProfile(query: string): Promise<XProfile | null> {
    if (!this.isConfigured) {
      console.log('⚠️  X API not configured. Using search result extraction.');
      return null;
    }

    // TODO: Implement X API v2 call
    // GET /2/users/by/username/:username
    // With expansions: description, location, url, created_at, public_metrics, verified

    return null;
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(username: string): Promise<XTweet[]> {
    if (!this.isConfigured) {
      console.log('⚠️  X API not configured. Cannot fetch tweets.');
      return [];
    }

    // TODO: Implement X API v2 call
    // GET /2/users/:id/tweets
    // With tweet.fields: created_at, public_metrics, entities, referenced_tweets

    return [];
  }

  /**
   * Analyze X presence from search results (no API required)
   */
  analyzeFromSearchResults(searchResults: { snippet: string; url: string; title: string }[]): Partial<XAnalysisResult> {
    const result: Partial<XAnalysisResult> = {
      recentTweets: [],
      engagement: this.createEmptyEngagement(),
      influence: this.createEmptyInfluence(),
      notableConnections: [],
      politicalIndicators: this.createEmptyPoliticalIndicators(),
      iranRelatedActivity: this.createEmptyIranActivity()
    };

    // Extract X-related information from search results
    for (const sr of searchResults) {
      const text = sr.snippet + ' ' + sr.title;

      // Extract username mentions
      this.extractUsernameMentions(text, result);

      // Extract follower counts
      this.extractFollowerCounts(text, result);

      // Extract political indicators
      this.extractPoliticalIndicators(text, result);

      // Extract Iran-related activity
      this.extractIranActivity(text, result);

      // Extract hashtags mentioned in content
      this.extractHashtags(text, result);
    }

    return result;
  }

  /**
   * Extract X usernames from text
   */
  private extractUsernameMentions(text: string, result: Partial<XAnalysisResult>): void {
    // Pattern for @username mentions
    const usernamePattern = /@([A-Za-z0-9_]{1,15})\b/g;
    let match;

    while ((match = usernamePattern.exec(text)) !== null) {
      const username = match[1].toLowerCase();

      // Skip common false positives
      if (['gmail', 'yahoo', 'hotmail', 'outlook', 'email'].includes(username)) continue;

      // Check if it's a known political figure
      const politicalFigure = this.identifyPoliticalFigure(username);
      if (politicalFigure && result.notableConnections) {
        const existing = result.notableConnections.find(c => c.username === username);
        if (!existing) {
          result.notableConnections.push({
            username,
            displayName: politicalFigure.name,
            connectionType: 'FOLLOWING',
            verified: politicalFigure.verified,
            followerCount: 0,
            category: politicalFigure.category
          });
        }
      }
    }
  }

  /**
   * Extract follower count mentions
   */
  private extractFollowerCounts(text: string, result: Partial<XAnalysisResult>): void {
    // Patterns for follower counts
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:million|m)\s*followers/i,
      /(\d+(?:,\d+)*)\s*followers/i,
      /followers?:?\s*(\d+(?:,\d+)*)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && result.influence) {
        let count = match[1].replace(/,/g, '');
        if (text.toLowerCase().includes('million') || match[0].toLowerCase().includes('m')) {
          count = String(parseFloat(count) * 1000000);
        }
        result.influence.reachScore = Math.min(100, Math.log10(parseInt(count)) * 20);
      }
    }
  }

  /**
   * Extract political indicators from text
   */
  private extractPoliticalIndicators(text: string, result: Partial<XAnalysisResult>): void {
    if (!result.politicalIndicators) return;

    const politicalHashtags: Record<string, { leaning: string; count: number }> = {
      '#maga': { leaning: 'Republican', count: 0 },
      '#trump': { leaning: 'Republican', count: 0 },
      '#trump2024': { leaning: 'Republican', count: 0 },
      '#republican': { leaning: 'Republican', count: 0 },
      '#gop': { leaning: 'Republican', count: 0 },
      '#conservative': { leaning: 'Conservative', count: 0 },
      '#biden': { leaning: 'Democrat', count: 0 },
      '#democrat': { leaning: 'Democrat', count: 0 },
      '#dnc': { leaning: 'Democrat', count: 0 },
      '#bluewave': { leaning: 'Democrat', count: 0 },
      '#liberal': { leaning: 'Liberal', count: 0 },
      '#progressive': { leaning: 'Progressive', count: 0 },
      '#libertarian': { leaning: 'Libertarian', count: 0 }
    };

    const lowerText = text.toLowerCase();
    for (const [tag, info] of Object.entries(politicalHashtags)) {
      if (lowerText.includes(tag)) {
        const existing = result.politicalIndicators.politicalHashtags.find(h => h.tag === tag);
        if (existing) {
          existing.count++;
        } else {
          result.politicalIndicators.politicalHashtags.push({
            tag,
            count: 1,
            leaning: info.leaning
          });
        }
      }
    }

    // Detect political topics
    const politicalTopics = [
      { keywords: ['immigration', 'border', 'migrants'], topic: 'Immigration' },
      { keywords: ['abortion', 'pro-life', 'pro-choice', 'roe'], topic: 'Abortion' },
      { keywords: ['gun', 'second amendment', '2a', 'firearms'], topic: 'Gun Rights' },
      { keywords: ['climate', 'green new deal', 'environment'], topic: 'Climate' },
      { keywords: ['healthcare', 'medicare', 'obamacare'], topic: 'Healthcare' },
      { keywords: ['free speech', 'censorship', 'first amendment'], topic: 'Free Speech' },
      { keywords: ['capitalism', 'socialism', 'economy'], topic: 'Economy' }
    ];

    for (const { keywords, topic } of politicalTopics) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        if (!result.politicalIndicators.politicalTopics.includes(topic)) {
          result.politicalIndicators.politicalTopics.push(topic);
        }
      }
    }
  }

  /**
   * Extract Iran-related activity from text
   */
  private extractIranActivity(text: string, result: Partial<XAnalysisResult>): void {
    if (!result.iranRelatedActivity) return;

    const lowerText = text.toLowerCase();

    // Opposition hashtags
    const oppositionHashtags = [
      '#mahsaamini', '#jinaamini', '#womanlifefreedom',
      '#زن_زندگی_آزادی', '#مهسا_امینی',
      '#freeiran', '#iranrevolution', '#iranprotests',
      '#regimechange', '#downwithkhamenei',
      '#pahlavi', '#rezapahlavi', '#kingrezapahlavi',
      '#mek', '#ncri', '#freeiran2024',
      '#stopexecutionsiniran', '#humanrights'
    ];

    const regimeHashtags = [
      '#iran', '#islamicrepublic', '#irgc',
      '#resistance', '#axis_of_resistance'
    ];

    for (const tag of oppositionHashtags) {
      if (lowerText.includes(tag)) {
        if (!result.iranRelatedActivity.oppositionHashtags.includes(tag)) {
          result.iranRelatedActivity.oppositionHashtags.push(tag);
        }
        result.iranRelatedActivity.iranRelatedTweets++;
      }
    }

    for (const tag of regimeHashtags) {
      if (lowerText.includes(tag)) {
        if (!result.iranRelatedActivity.regimeHashtags.includes(tag)) {
          result.iranRelatedActivity.regimeHashtags.push(tag);
        }
      }
    }

    // Opposition figure mentions
    const oppositionFigures = [
      '@rezapahlavi', '@pahlovirezaii', '@masikihlalinejad', '@aliaborji',
      '@maborji', '@haborji', '@iranworkers', '@manikihlali'
    ];

    for (const mention of oppositionFigures) {
      if (lowerText.includes(mention)) {
        if (!result.iranRelatedActivity.oppositionMentions.includes(mention)) {
          result.iranRelatedActivity.oppositionMentions.push(mention);
        }
      }
    }

    // Determine stance
    const oppositionScore = result.iranRelatedActivity.oppositionHashtags.length +
                           result.iranRelatedActivity.oppositionMentions.length;
    const regimeScore = result.iranRelatedActivity.regimeHashtags.length;

    if (oppositionScore > regimeScore && oppositionScore > 0) {
      result.iranRelatedActivity.stance = 'PRO_OPPOSITION';
      result.iranRelatedActivity.confidence = Math.min(95, 50 + oppositionScore * 10);
    } else if (regimeScore > oppositionScore && regimeScore > 0) {
      result.iranRelatedActivity.stance = 'PRO_REGIME';
      result.iranRelatedActivity.confidence = Math.min(95, 50 + regimeScore * 10);
    } else if (oppositionScore > 0 || regimeScore > 0) {
      result.iranRelatedActivity.stance = 'NEUTRAL';
      result.iranRelatedActivity.confidence = 30;
    }

    // Add evidence
    if (oppositionScore > 0) {
      result.iranRelatedActivity.evidence.push(
        `Found ${oppositionScore} opposition-related hashtags/mentions`
      );
    }
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string, result: Partial<XAnalysisResult>): void {
    const hashtagPattern = /#([A-Za-z0-9_]+)/g;
    let match;

    while ((match = hashtagPattern.exec(text)) !== null) {
      const tag = '#' + match[1].toLowerCase();

      if (result.engagement) {
        const existing = result.engagement.topHashtags.find(h => h.tag === tag);
        if (existing) {
          existing.count++;
        } else if (result.engagement.topHashtags.length < 20) {
          result.engagement.topHashtags.push({ tag, count: 1 });
        }
      }
    }

    // Sort by count
    if (result.engagement) {
      result.engagement.topHashtags.sort((a, b) => b.count - a.count);
    }
  }

  /**
   * Identify known political figures by username
   */
  private identifyPoliticalFigure(username: string): { name: string; verified: boolean; category: string } | null {
    const politicalFigures: Record<string, { name: string; verified: boolean; category: string }> = {
      'realdonaldtrump': { name: 'Donald Trump', verified: true, category: 'Politician' },
      'joebiden': { name: 'Joe Biden', verified: true, category: 'Politician' },
      'elonmusk': { name: 'Elon Musk', verified: true, category: 'Business/Political' },
      'taborji': { name: 'Tucker Carlson', verified: true, category: 'Media' },
      'benshapiro': { name: 'Ben Shapiro', verified: true, category: 'Media' },
      'jordanbpeterson': { name: 'Jordan Peterson', verified: true, category: 'Commentator' },
      'rezapahlavi': { name: 'Reza Pahlavi', verified: true, category: 'Iranian Opposition' },
      'masikihlalinejad': { name: 'Masih Alinejad', verified: true, category: 'Iranian Activist' },
      'maborji': { name: 'Maryam Rajavi', verified: false, category: 'Iranian Opposition' },
      'iranintl': { name: 'Iran International', verified: true, category: 'Media' },
      'vikihlai': { name: 'BBC Persian', verified: true, category: 'Media' }
    };

    return politicalFigures[username.toLowerCase()] || null;
  }

  /**
   * Create empty engagement object
   */
  private createEmptyEngagement(): XEngagement {
    return {
      totalTweets: 0,
      averageLikes: 0,
      averageRetweets: 0,
      averageReplies: 0,
      engagementRate: 0,
      topHashtags: [],
      topMentions: [],
      postingFrequency: 'Unknown',
      mostActiveHours: []
    };
  }

  /**
   * Create empty influence object
   */
  private createEmptyInfluence(): XInfluenceMetrics {
    return {
      followerToFollowingRatio: 0,
      engagementRate: 0,
      reachScore: 0,
      influenceScore: 0,
      audienceQuality: 'UNKNOWN',
      verificationStatus: 'NOT_VERIFIED'
    };
  }

  /**
   * Create empty political indicators
   */
  private createEmptyPoliticalIndicators(): XPoliticalIndicators {
    return {
      detectedAffiliations: [],
      politicalHashtags: [],
      engagedPoliticians: [],
      politicalTopics: []
    };
  }

  /**
   * Create empty Iran activity
   */
  private createEmptyIranActivity(): XIranActivity {
    return {
      iranRelatedTweets: 0,
      oppositionHashtags: [],
      oppositionMentions: [],
      regimeHashtags: [],
      stance: 'UNKNOWN',
      confidence: 0,
      evidence: []
    };
  }

  /**
   * Full analysis combining API and search results
   */
  async analyze(username: string, searchResults?: { snippet: string; url: string; title: string }[]): Promise<XAnalysisResult> {
    let result: XAnalysisResult = {
      profile: null,
      recentTweets: [],
      engagement: this.createEmptyEngagement(),
      influence: this.createEmptyInfluence(),
      notableConnections: [],
      politicalIndicators: this.createEmptyPoliticalIndicators(),
      iranRelatedActivity: this.createEmptyIranActivity()
    };

    // Try API first if configured
    if (this.isConfigured) {
      const profile = await this.searchProfile(username);
      if (profile) {
        result.profile = profile;
        result.influence.followerToFollowingRatio = profile.followingCount > 0
          ? profile.followerCount / profile.followingCount
          : profile.followerCount;
        result.influence.verificationStatus = profile.verified ? 'VERIFIED' : 'NOT_VERIFIED';
      }

      const tweets = await this.getUserTweets(username);
      result.recentTweets = tweets;
    }

    // Supplement with search results
    if (searchResults && searchResults.length > 0) {
      const searchAnalysis = this.analyzeFromSearchResults(searchResults);
      result = this.mergeResults(result, searchAnalysis);
    }

    // Calculate final scores
    this.calculateFinalScores(result);

    return result;
  }

  /**
   * Merge API results with search results
   */
  private mergeResults(primary: XAnalysisResult, secondary: Partial<XAnalysisResult>): XAnalysisResult {
    return {
      ...primary,
      notableConnections: [
        ...primary.notableConnections,
        ...(secondary.notableConnections || [])
      ],
      politicalIndicators: {
        detectedAffiliations: [
          ...primary.politicalIndicators.detectedAffiliations,
          ...(secondary.politicalIndicators?.detectedAffiliations || [])
        ],
        politicalHashtags: [
          ...primary.politicalIndicators.politicalHashtags,
          ...(secondary.politicalIndicators?.politicalHashtags || [])
        ],
        engagedPoliticians: [
          ...primary.politicalIndicators.engagedPoliticians,
          ...(secondary.politicalIndicators?.engagedPoliticians || [])
        ],
        politicalTopics: [
          ...new Set([
            ...primary.politicalIndicators.politicalTopics,
            ...(secondary.politicalIndicators?.politicalTopics || [])
          ])
        ]
      },
      iranRelatedActivity: {
        iranRelatedTweets: primary.iranRelatedActivity.iranRelatedTweets +
                          (secondary.iranRelatedActivity?.iranRelatedTweets || 0),
        oppositionHashtags: [
          ...new Set([
            ...primary.iranRelatedActivity.oppositionHashtags,
            ...(secondary.iranRelatedActivity?.oppositionHashtags || [])
          ])
        ],
        oppositionMentions: [
          ...new Set([
            ...primary.iranRelatedActivity.oppositionMentions,
            ...(secondary.iranRelatedActivity?.oppositionMentions || [])
          ])
        ],
        regimeHashtags: [
          ...new Set([
            ...primary.iranRelatedActivity.regimeHashtags,
            ...(secondary.iranRelatedActivity?.regimeHashtags || [])
          ])
        ],
        stance: secondary.iranRelatedActivity?.stance !== 'UNKNOWN'
          ? secondary.iranRelatedActivity!.stance
          : primary.iranRelatedActivity.stance,
        confidence: Math.max(
          primary.iranRelatedActivity.confidence,
          secondary.iranRelatedActivity?.confidence || 0
        ),
        evidence: [
          ...primary.iranRelatedActivity.evidence,
          ...(secondary.iranRelatedActivity?.evidence || [])
        ]
      },
      engagement: {
        ...primary.engagement,
        topHashtags: [
          ...primary.engagement.topHashtags,
          ...(secondary.engagement?.topHashtags || [])
        ].slice(0, 20)
      }
    };
  }

  /**
   * Calculate final influence and engagement scores
   */
  private calculateFinalScores(result: XAnalysisResult): void {
    // Calculate influence score based on available data
    let score = 0;

    if (result.profile) {
      // Follower count contributes to score
      score += Math.min(30, Math.log10(result.profile.followerCount + 1) * 6);
      // Verification bonus
      if (result.profile.verified) score += 20;
      // Engagement rate bonus
      if (result.profile.tweetCount > 0) {
        score += 10;
      }
    }

    // Notable connections bonus
    score += Math.min(20, result.notableConnections.length * 2);

    // Political activity bonus
    score += Math.min(20, result.politicalIndicators.politicalHashtags.length * 2);

    result.influence.influenceScore = Math.min(100, Math.round(score));
  }
}

/**
 * Generate X-specific search queries for a subject
 */
export function generateXSearchQueries(subject: string): string[] {
  return [
    `${subject} twitter`,
    `${subject} X account`,
    `${subject} tweets`,
    `@${subject.replace(/\s+/g, '')} twitter`,
    `${subject} twitter followers`,
    `${subject} controversial tweets`,
    `${subject} twitter account suspended`,
    `${subject} social media presence`,
    `${subject} twitter interview`,
    `${subject} twitter Iran`,
    `${subject} twitter political views`
  ];
}
