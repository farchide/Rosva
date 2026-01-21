/**
 * PRISM Social Media Research Agent
 *
 * Analyzes social media presence across platforms:
 * - X (Twitter) - Primary platform with live API support
 * - Instagram, YouTube, TikTok (future)
 *
 * Extracts:
 * - Profile information
 * - Engagement metrics
 * - Political indicators
 * - Network connections
 * - Iran-related activity
 *
 * Data Sources:
 * - X API v2 (when X_BEARER_TOKEN is set)
 * - Search result analysis (fallback)
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import { XProvider, XAnalysisResult, XIranActivity, XPoliticalIndicators } from '../social/x-provider';
import { XApiClient, XSubjectAnalysis } from '../social/x-api-client';

export interface SocialMediaProfile {
  platform: 'X' | 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK' | 'LINKEDIN';
  username: string;
  displayName?: string;
  url: string;
  verified: boolean;
  followerCount: number;
  followingCount?: number;
  postCount?: number;
  bio?: string;
  joinDate?: string;
}

export interface SocialMediaResult {
  profiles: SocialMediaProfile[];
  xAnalysis: XAnalysisResult | null;
  overallInfluence: number;
  platforms: string[];
  primaryPlatform: string | null;
  politicalSummary: {
    primaryLeaning: string;
    confidence: number;
    evidence: string[];
  };
  iranStance: {
    stance: string;
    confidence: number;
    evidence: string[];
  };
}

export class SocialMediaAgent extends BaseAgent {
  private xProvider: XProvider;
  private xApiClient: XApiClient;

  constructor(config: AgentConfig = {}) {
    super('SocialMediaAgent', config);
    this.xProvider = new XProvider();
    this.xApiClient = new XApiClient();
  }

  /**
   * Check if X API is available for live data
   */
  isXApiConfigured(): boolean {
    return this.xApiClient.isConfigured();
  }

  /**
   * Research subject's social media presence
   * Uses live X API when available, otherwise falls back to search analysis
   */
  async research(subject: string, context?: Record<string, any>): Promise<SocialMediaResult> {
    const result: SocialMediaResult = {
      profiles: [],
      xAnalysis: null,
      overallInfluence: 0,
      platforms: [],
      primaryPlatform: null,
      politicalSummary: {
        primaryLeaning: 'Unknown',
        confidence: 0,
        evidence: []
      },
      iranStance: {
        stance: 'Unknown',
        confidence: 0,
        evidence: []
      }
    };

    // Try live X API first
    if (this.xApiClient.isConfigured()) {
      console.log('  Using live X API for social media analysis...');
      try {
        const xAnalysis = await this.xApiClient.analyzeSubject(subject);
        this.integrateXApiResults(result, xAnalysis, subject);
      } catch (error: any) {
        console.log(`  X API analysis failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Integrate X API results into the social media result
   */
  private integrateXApiResults(result: SocialMediaResult, xAnalysis: XSubjectAnalysis, subject: string): void {
    // Add X profile if found
    if (xAnalysis.profile) {
      result.profiles.push({
        platform: 'X',
        username: xAnalysis.profile.username,
        displayName: xAnalysis.profile.name,
        url: `https://x.com/${xAnalysis.profile.username}`,
        verified: xAnalysis.profile.verified || false,
        followerCount: xAnalysis.profile.public_metrics?.followers_count || 0,
        followingCount: xAnalysis.profile.public_metrics?.following_count,
        postCount: xAnalysis.profile.public_metrics?.tweet_count,
        bio: xAnalysis.profile.description,
        joinDate: xAnalysis.profile.created_at
      });
    }

    // Set primary platform
    result.platforms = ['X'];
    result.primaryPlatform = 'X';

    // Analyze political hashtags from tweets
    const politicalHashtags = this.analyzePoliticalHashtags(xAnalysis.politicalHashtags);
    const iranHashtags = xAnalysis.iranHashtags;

    // Build XAnalysisResult format from live data
    result.xAnalysis = {
      profile: xAnalysis.profile ? {
        username: xAnalysis.profile.username,
        displayName: xAnalysis.profile.name,
        bio: xAnalysis.profile.description || '',
        verified: xAnalysis.profile.verified || false,
        followerCount: xAnalysis.profile.public_metrics?.followers_count || 0,
        followingCount: xAnalysis.profile.public_metrics?.following_count || 0,
        tweetCount: xAnalysis.profile.public_metrics?.tweet_count || 0
      } : null,
      recentTweets: xAnalysis.tweets.map(t => ({
        id: t.id,
        text: t.text,
        createdAt: t.created_at || '',
        likeCount: t.public_metrics?.like_count || 0,
        retweetCount: t.public_metrics?.retweet_count || 0,
        replyCount: t.public_metrics?.reply_count || 0,
        quoteCount: t.public_metrics?.quote_count || 0,
        hashtags: t.entities?.hashtags?.map(h => h.tag) || [],
        mentions: t.entities?.mentions?.map(m => m.username) || [],
        urls: t.entities?.urls?.map(u => u.expanded_url) || [],
        isRetweet: t.referenced_tweets?.some(rt => rt.type === 'retweeted') || false,
        isReply: t.referenced_tweets?.some(rt => rt.type === 'replied_to') || false
      })),
      engagement: {
        totalTweets: xAnalysis.tweets.length,
        averageLikes: xAnalysis.tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) / Math.max(1, xAnalysis.tweets.length),
        averageRetweets: xAnalysis.tweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0) / Math.max(1, xAnalysis.tweets.length),
        averageReplies: xAnalysis.tweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0) / Math.max(1, xAnalysis.tweets.length),
        engagementRate: 0,
        topHashtags: this.countHashtags(xAnalysis.politicalHashtags),
        topMentions: this.countMentions(xAnalysis.mentionedUsers),
        postingFrequency: 'Unknown',
        mostActiveHours: []
      },
      influence: {
        followerToFollowingRatio: xAnalysis.profile ?
          (xAnalysis.profile.public_metrics?.followers_count || 0) / Math.max(1, xAnalysis.profile.public_metrics?.following_count || 1) : 0,
        engagementRate: 0,
        reachScore: xAnalysis.profile ? Math.min(100, Math.log10((xAnalysis.profile.public_metrics?.followers_count || 0) + 1) * 20) : 0,
        influenceScore: this.calculateXInfluenceScore(xAnalysis),
        audienceQuality: 'UNKNOWN',
        verificationStatus: xAnalysis.profile?.verified ? 'VERIFIED' : 'NOT_VERIFIED'
      },
      notableConnections: xAnalysis.following
        .filter(u => u.verified || (u.public_metrics?.followers_count || 0) > 100000)
        .slice(0, 20)
        .map(u => ({
          username: u.username,
          displayName: u.name,
          connectionType: 'FOLLOWING' as const,
          verified: u.verified || false,
          followerCount: u.public_metrics?.followers_count || 0,
          category: this.categorizeUser(u)
        })),
      politicalIndicators: {
        detectedAffiliations: politicalHashtags.affiliations,
        politicalHashtags: politicalHashtags.hashtags,
        engagedPoliticians: [],
        politicalTopics: politicalHashtags.topics
      },
      iranRelatedActivity: {
        iranRelatedTweets: xAnalysis.iranRelatedTweets.length,
        oppositionHashtags: iranHashtags.filter(h => this.isOppositionHashtag(h)),
        oppositionMentions: xAnalysis.mentionedUsers.filter(u => this.isOppositionFigure(u)),
        regimeHashtags: iranHashtags.filter(h => this.isRegimeHashtag(h)),
        stance: this.determineIranStance(xAnalysis),
        confidence: this.calculateIranConfidence(xAnalysis),
        evidence: this.gatherIranEvidence(xAnalysis)
      }
    };

    // Calculate overall influence
    result.overallInfluence = this.calculateOverallInfluence(result);

    // Generate summaries
    result.politicalSummary = this.generatePoliticalSummary(result.xAnalysis.politicalIndicators);
    result.iranStance = this.generateIranSummary(result.xAnalysis.iranRelatedActivity);
  }

  /**
   * Calculate X influence score from live data
   */
  private calculateXInfluenceScore(analysis: XSubjectAnalysis): number {
    let score = 0;

    if (analysis.profile) {
      // Follower count
      score += Math.min(40, Math.log10((analysis.profile.public_metrics?.followers_count || 0) + 1) * 10);
      // Verified bonus
      if (analysis.profile.verified) score += 20;
    }

    // Tweet engagement
    const avgEngagement = analysis.tweets.reduce((sum, t) => {
      return sum + (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0) * 2;
    }, 0) / Math.max(1, analysis.tweets.length);

    score += Math.min(20, Math.log10(avgEngagement + 1) * 5);

    // Notable connections
    score += Math.min(20, analysis.following.filter(u => u.verified).length * 2);

    return Math.min(100, Math.round(score));
  }

  /**
   * Analyze political hashtags
   */
  private analyzePoliticalHashtags(hashtags: string[]): {
    affiliations: { party: string; confidence: number; evidence: string[] }[];
    hashtags: { tag: string; count: number; leaning: string }[];
    topics: string[];
  } {
    const tagCounts: Record<string, number> = {};
    const tagLeanings: Record<string, string> = {};

    const leaningMap: Record<string, string> = {
      'maga': 'Republican', 'trump': 'Republican', 'republican': 'Republican', 'gop': 'Republican',
      'conservative': 'Conservative', 'biden': 'Democrat', 'democrat': 'Democrat',
      'liberal': 'Liberal', 'progressive': 'Progressive', 'libertarian': 'Libertarian'
    };

    for (const tag of hashtags) {
      const lower = tag.toLowerCase();
      tagCounts[lower] = (tagCounts[lower] || 0) + 1;

      for (const [keyword, leaning] of Object.entries(leaningMap)) {
        if (lower.includes(keyword)) {
          tagLeanings[lower] = leaning;
          break;
        }
      }
    }

    const hashtagResults = Object.entries(tagCounts)
      .filter(([tag]) => tagLeanings[tag])
      .map(([tag, count]) => ({
        tag: '#' + tag,
        count,
        leaning: tagLeanings[tag]
      }))
      .sort((a, b) => b.count - a.count);

    // Detect affiliations
    const affiliationCounts: Record<string, number> = {};
    for (const h of hashtagResults) {
      affiliationCounts[h.leaning] = (affiliationCounts[h.leaning] || 0) + h.count;
    }

    const affiliations = Object.entries(affiliationCounts)
      .map(([party, count]) => ({
        party,
        confidence: Math.min(90, count * 15),
        evidence: hashtagResults.filter(h => h.leaning === party).map(h => `Used ${h.tag}`)
      }))
      .sort((a, b) => b.confidence - a.confidence);

    // Detect topics
    const topics: string[] = [];
    const topicKeywords: Record<string, string> = {
      'immigration': 'Immigration', 'border': 'Immigration',
      'abortion': 'Abortion', 'prolife': 'Abortion', 'prochoice': 'Abortion',
      'gun': 'Gun Rights', '2a': 'Gun Rights',
      'climate': 'Climate', 'healthcare': 'Healthcare',
      'economy': 'Economy', 'tax': 'Economy'
    };

    for (const tag of hashtags) {
      const lower = tag.toLowerCase();
      for (const [keyword, topic] of Object.entries(topicKeywords)) {
        if (lower.includes(keyword) && !topics.includes(topic)) {
          topics.push(topic);
        }
      }
    }

    return { affiliations, hashtags: hashtagResults.slice(0, 10), topics };
  }

  /**
   * Count hashtag occurrences
   */
  private countHashtags(tags: string[]): { tag: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const tag of tags) {
      const lower = '#' + tag.toLowerCase();
      counts[lower] = (counts[lower] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  /**
   * Count mention occurrences
   */
  private countMentions(users: string[]): { user: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const user of users) {
      counts[user] = (counts[user] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  /**
   * Categorize a user by their profile
   */
  private categorizeUser(user: { username: string; name: string; description?: string }): string {
    const desc = (user.description || '').toLowerCase();
    const name = user.name.toLowerCase();

    if (/journalist|reporter|editor|news/i.test(desc)) return 'Journalist';
    if (/politician|senator|congress|mayor|governor/i.test(desc)) return 'Politician';
    if (/ceo|founder|entrepreneur/i.test(desc)) return 'Business';
    if (/activist|advocate/i.test(desc)) return 'Activist';
    if (/author|writer/i.test(desc)) return 'Author';
    if (/iran|persian|pahlavi/i.test(desc)) return 'Iranian Opposition';

    return 'Public Figure';
  }

  /**
   * Check if hashtag is opposition-related
   */
  private isOppositionHashtag(tag: string): boolean {
    const opposition = ['womanlifefreedom', 'mahsaamini', 'freeiran', 'iranprotests',
      'pahlavi', 'rezapahlavi', 'mek', 'ncri', 'regimechange'];
    return opposition.some(o => tag.toLowerCase().includes(o));
  }

  /**
   * Check if hashtag is regime-related
   */
  private isRegimeHashtag(tag: string): boolean {
    const regime = ['irgc', 'islamicrepublic', 'khamenei'];
    return regime.some(r => tag.toLowerCase().includes(r));
  }

  /**
   * Check if user is known opposition figure
   */
  private isOppositionFigure(username: string): boolean {
    const figures = ['rezapahlavi', 'masikihlalinejad', 'iranintl', 'vikihlai'];
    return figures.some(f => username.toLowerCase().includes(f));
  }

  /**
   * Determine Iran stance from analysis
   */
  private determineIranStance(analysis: XSubjectAnalysis): 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN' {
    const oppositionScore = analysis.iranHashtags.filter(h => this.isOppositionHashtag(h)).length;
    const regimeScore = analysis.iranHashtags.filter(h => this.isRegimeHashtag(h)).length;

    if (oppositionScore > regimeScore && oppositionScore > 0) return 'PRO_OPPOSITION';
    if (regimeScore > oppositionScore && regimeScore > 0) return 'PRO_REGIME';
    if (oppositionScore > 0 || regimeScore > 0) return 'NEUTRAL';
    return 'UNKNOWN';
  }

  /**
   * Calculate Iran stance confidence
   */
  private calculateIranConfidence(analysis: XSubjectAnalysis): number {
    const total = analysis.iranHashtags.length + analysis.iranRelatedTweets.length;
    return Math.min(95, 30 + total * 5);
  }

  /**
   * Gather Iran evidence
   */
  private gatherIranEvidence(analysis: XSubjectAnalysis): string[] {
    const evidence: string[] = [];

    if (analysis.iranRelatedTweets.length > 0) {
      evidence.push(`Found ${analysis.iranRelatedTweets.length} Iran-related tweets`);
    }

    const oppositionHashtags = analysis.iranHashtags.filter(h => this.isOppositionHashtag(h));
    if (oppositionHashtags.length > 0) {
      evidence.push(`Used opposition hashtags: ${oppositionHashtags.slice(0, 3).join(', ')}`);
    }

    return evidence;
  }

  /**
   * Analyze social media from search results
   */
  analyzeFromSearchResults(results: SearchResult[], subject: string): SocialMediaResult {
    const result: SocialMediaResult = {
      profiles: [],
      xAnalysis: null,
      overallInfluence: 0,
      platforms: [],
      primaryPlatform: null,
      politicalSummary: {
        primaryLeaning: 'Unknown',
        confidence: 0,
        evidence: []
      },
      iranStance: {
        stance: 'Unknown',
        confidence: 0,
        evidence: []
      }
    };

    // Extract social media profiles
    result.profiles = this.extractProfiles(results, subject);

    // Detect platforms
    result.platforms = [...new Set(result.profiles.map(p => p.platform))];

    // Determine primary platform (by follower count)
    const primaryProfile = result.profiles.sort((a, b) => b.followerCount - a.followerCount)[0];
    result.primaryPlatform = primaryProfile?.platform || null;

    // Run X analysis
    const searchResultsForX = results.map(r => ({
      snippet: r.snippet,
      url: r.url,
      title: r.title
    }));

    result.xAnalysis = this.xProvider.analyzeFromSearchResults(searchResultsForX) as XAnalysisResult;

    // Calculate overall influence
    result.overallInfluence = this.calculateOverallInfluence(result);

    // Generate political summary
    result.politicalSummary = this.generatePoliticalSummary(result.xAnalysis?.politicalIndicators);

    // Generate Iran stance summary
    result.iranStance = this.generateIranSummary(result.xAnalysis?.iranRelatedActivity);

    return result;
  }

  /**
   * Extract social media profiles from search results
   */
  private extractProfiles(results: SearchResult[], subject: string): SocialMediaProfile[] {
    const profiles: SocialMediaProfile[] = [];
    const seenUrls = new Set<string>();

    // Platform patterns
    const platformPatterns = [
      { platform: 'X' as const, patterns: [
        /(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i,
        /@([A-Za-z0-9_]{1,15})\s+(?:on\s+)?(?:twitter|x\b)/i
      ]},
      { platform: 'INSTAGRAM' as const, patterns: [
        /instagram\.com\/([A-Za-z0-9_.]+)/i,
        /@([A-Za-z0-9_.]+)\s+(?:on\s+)?instagram/i
      ]},
      { platform: 'YOUTUBE' as const, patterns: [
        /youtube\.com\/(?:@|user\/|channel\/|c\/)([A-Za-z0-9_-]+)/i,
        /youtube\.com\/([A-Za-z0-9_-]+)/i
      ]},
      { platform: 'TIKTOK' as const, patterns: [
        /tiktok\.com\/@([A-Za-z0-9_.]+)/i,
        /@([A-Za-z0-9_.]+)\s+(?:on\s+)?tiktok/i
      ]},
      { platform: 'FACEBOOK' as const, patterns: [
        /facebook\.com\/([A-Za-z0-9_.]+)/i
      ]},
      { platform: 'LINKEDIN' as const, patterns: [
        /linkedin\.com\/in\/([A-Za-z0-9_-]+)/i
      ]}
    ];

    for (const result of results) {
      const text = result.snippet + ' ' + result.url + ' ' + result.title;

      for (const { platform, patterns } of platformPatterns) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            const username = match[1];

            // Build URL
            let url = '';
            switch (platform) {
              case 'X':
                url = `https://x.com/${username}`;
                break;
              case 'INSTAGRAM':
                url = `https://instagram.com/${username}`;
                break;
              case 'YOUTUBE':
                url = `https://youtube.com/@${username}`;
                break;
              case 'TIKTOK':
                url = `https://tiktok.com/@${username}`;
                break;
              case 'FACEBOOK':
                url = `https://facebook.com/${username}`;
                break;
              case 'LINKEDIN':
                url = `https://linkedin.com/in/${username}`;
                break;
            }

            if (!seenUrls.has(url)) {
              seenUrls.add(url);

              // Extract follower count if mentioned
              const followerCount = this.extractFollowerCount(text);

              // Check if verified
              const verified = /verified|✓|blue\s*check/i.test(text);

              profiles.push({
                platform,
                username,
                url,
                verified,
                followerCount,
                displayName: subject
              });
            }
          }
        }
      }
    }

    return profiles;
  }

  /**
   * Extract follower count from text
   */
  private extractFollowerCount(text: string): number {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:million|m)\s*followers/i,
      /(\d+(?:\.\d+)?)\s*(?:k|thousand)\s*followers/i,
      /(\d+(?:,\d+)*)\s*followers/i,
      /followers?:?\s*(\d+(?:,\d+)*)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let count = match[1].replace(/,/g, '');
        if (text.toLowerCase().includes('million') || /m\s*followers/i.test(match[0])) {
          return Math.round(parseFloat(count) * 1000000);
        }
        if (text.toLowerCase().includes('thousand') || /k\s*followers/i.test(match[0])) {
          return Math.round(parseFloat(count) * 1000);
        }
        return parseInt(count);
      }
    }

    return 0;
  }

  /**
   * Calculate overall influence score
   */
  private calculateOverallInfluence(result: SocialMediaResult): number {
    let score = 0;

    // Profile count
    score += Math.min(20, result.profiles.length * 5);

    // Follower count across platforms
    const totalFollowers = result.profiles.reduce((sum, p) => sum + p.followerCount, 0);
    score += Math.min(40, Math.log10(totalFollowers + 1) * 10);

    // Verified accounts bonus
    const verifiedCount = result.profiles.filter(p => p.verified).length;
    score += verifiedCount * 10;

    // X analysis contribution
    if (result.xAnalysis) {
      score += result.xAnalysis.influence.influenceScore * 0.3;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Generate political summary from X analysis
   */
  private generatePoliticalSummary(indicators?: XPoliticalIndicators): {
    primaryLeaning: string;
    confidence: number;
    evidence: string[];
  } {
    if (!indicators) {
      return { primaryLeaning: 'Unknown', confidence: 0, evidence: [] };
    }

    // Count leanings
    const leaningCounts: Record<string, number> = {};
    for (const hashtag of indicators.politicalHashtags) {
      const leaning = hashtag.leaning;
      leaningCounts[leaning] = (leaningCounts[leaning] || 0) + hashtag.count;
    }

    // Find primary leaning
    const sorted = Object.entries(leaningCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return { primaryLeaning: 'Unknown', confidence: 0, evidence: [] };
    }

    const primaryLeaning = sorted[0][0];
    const totalCount = Object.values(leaningCounts).reduce((a, b) => a + b, 0);
    const confidence = Math.min(95, Math.round((sorted[0][1] / totalCount) * 100));

    const evidence = indicators.politicalHashtags
      .filter(h => h.leaning === primaryLeaning)
      .slice(0, 3)
      .map(h => `Used ${h.tag} ${h.count} time(s)`);

    return { primaryLeaning, confidence, evidence };
  }

  /**
   * Generate Iran stance summary
   */
  private generateIranSummary(iranActivity?: XIranActivity): {
    stance: string;
    confidence: number;
    evidence: string[];
  } {
    if (!iranActivity) {
      return { stance: 'Unknown', confidence: 0, evidence: [] };
    }

    const stanceLabels: Record<string, string> = {
      'PRO_OPPOSITION': 'Pro-Opposition',
      'PRO_REGIME': 'Pro-Regime',
      'NEUTRAL': 'Neutral',
      'UNKNOWN': 'Unknown'
    };

    return {
      stance: stanceLabels[iranActivity.stance] || 'Unknown',
      confidence: iranActivity.confidence,
      evidence: iranActivity.evidence
    };
  }
}
