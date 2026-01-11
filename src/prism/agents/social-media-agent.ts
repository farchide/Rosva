/**
 * PRISM Social Media Research Agent
 *
 * Analyzes social media presence across platforms:
 * - X (Twitter) - Primary platform
 * - Instagram, YouTube, TikTok (future)
 *
 * Extracts:
 * - Profile information
 * - Engagement metrics
 * - Political indicators
 * - Network connections
 * - Iran-related activity
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import { XProvider, XAnalysisResult, XIranActivity, XPoliticalIndicators } from '../social/x-provider';

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

  constructor(config: AgentConfig = {}) {
    super('SocialMediaAgent', config);
    this.xProvider = new XProvider();
  }

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

    return result;
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
