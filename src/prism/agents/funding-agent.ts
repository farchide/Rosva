/**
 * PRISM Funding & Media Research Agent
 *
 * Analyzes financial and media dimensions including:
 * - Funding sources and financial backers
 * - Media presence and appearances
 * - Amplification networks
 * - Digital influence campaigns
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import {
  FundingProfile,
  FundingSource,
  MediaPresence,
  SocialAccount,
  MediaAppearance,
  AmplificationNode,
  DigitalCampaign
} from '../core/types';

export interface FundingMediaResult {
  funding: FundingProfile;
  media: MediaPresence;
}

export class FundingMediaAgent extends BaseAgent {
  constructor(config: AgentConfig = {}) {
    super('FundingMediaAgent', config);
  }

  async research(subject: string, context?: Record<string, any>): Promise<FundingMediaResult> {
    const funding: FundingProfile = {
      knownSources: [],
      financialDisclosures: [],
      controversies: [],
      transparency: 'OPAQUE'
    };

    const media: MediaPresence = {
      socialAccounts: [],
      mediaAppearances: []
    };

    return { funding, media };
  }

  /**
   * Parse funding sources from search results
   */
  parseFundingSources(results: SearchResult[], subject: string): FundingSource[] {
    const sources: FundingSource[] = [];
    const seen = new Set<string>();

    const fundingPatterns = [
      { pattern: /funded\s+by\s+(?:the\s+)?([A-Za-z\s]+(?:government|administration|agency))/gi, type: 'GOVERNMENT' as const },
      { pattern: /(?:CIA|State Department|government)\s+(?:funding|support|money)/gi, type: 'GOVERNMENT' as const },
      { pattern: /donations?\s+from\s+(?:the\s+)?([A-Za-z\s]+diaspora)/gi, type: 'DIASPORA' as const },
      { pattern: /([A-Za-z\s]+(?:Foundation|Fund|Trust))\s+(?:funds?|supports?|backs?)/gi, type: 'FOUNDATION' as const },
      { pattern: /private\s+(?:donors?|funding|backers?)/gi, type: 'PRIVATE' as const },
      { pattern: /self[- ]funded/gi, type: 'SELF' as const },
      { pattern: /net\s+worth[^.]*?(\$[\d,.]+\s*(?:million|billion)?)/gi, type: 'SELF' as const },
      { pattern: /estimated\s+(?:wealth|fortune)[^.]*?(\$[\d,.]+\s*(?:million|billion)?)/gi, type: 'SELF' as const }
    ];

    for (const result of results) {
      for (const { pattern, type } of fundingPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const source = match[1]?.trim() || type;
          const key = `${type}_${source}`;

          if (seen.has(key)) continue;
          seen.add(key);

          // Try to extract amount
          const amountMatch = result.snippet.match(/\$[\d,.]+\s*(?:million|billion)?/i);

          // Check if verified
          const isVerified = result.snippet.toLowerCase().includes('confirmed') ||
                            result.snippet.toLowerCase().includes('documented') ||
                            result.snippet.toLowerCase().includes('reported');

          sources.push({
            source,
            sourceType: type,
            amount: amountMatch ? amountMatch[0] : undefined,
            verified: isVerified,
            sources: [result.url]
          });
        }
      }
    }

    return sources;
  }

  /**
   * Parse social media accounts from search results
   */
  parseSocialAccounts(results: SearchResult[], subject: string): SocialAccount[] {
    const accounts: SocialAccount[] = [];
    const seen = new Set<string>();

    const platforms = [
      { name: 'X (Twitter)', pattern: /(?:twitter\.com|x\.com)\/(@?\w+)/gi, urlBase: 'https://x.com/' },
      { name: 'Instagram', pattern: /instagram\.com\/(@?\w+)/gi, urlBase: 'https://instagram.com/' },
      { name: 'Facebook', pattern: /facebook\.com\/(\w+)/gi, urlBase: 'https://facebook.com/' },
      { name: 'YouTube', pattern: /youtube\.com\/(?:@|c\/|channel\/)?(\w+)/gi, urlBase: 'https://youtube.com/' },
      { name: 'LinkedIn', pattern: /linkedin\.com\/in\/(\w+)/gi, urlBase: 'https://linkedin.com/in/' },
      { name: 'Telegram', pattern: /t\.me\/(\w+)/gi, urlBase: 'https://t.me/' }
    ];

    // Also look for mentions
    const mentionPatterns = [
      { platform: 'X (Twitter)', pattern: /@(\w+)\s+(?:on\s+)?(?:Twitter|X)/gi },
      { platform: 'Instagram', pattern: /@(\w+)\s+(?:on\s+)?Instagram/gi }
    ];

    for (const result of results) {
      // Check URL patterns
      for (const { name, pattern, urlBase } of platforms) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const handle = match[1].replace('@', '');
          const key = `${name}_${handle}`;

          if (seen.has(key)) continue;
          seen.add(key);

          // Extract follower count if mentioned
          const followerMatch = result.snippet.match(/(\d+(?:,\d+)*(?:\.\d+)?[KkMm]?)\s*followers?/i);

          accounts.push({
            platform: name,
            handle,
            url: urlBase + handle,
            followers: followerMatch ? this.parseFollowerCount(followerMatch[1]) : undefined,
            verified: result.snippet.toLowerCase().includes('verified'),
            active: !result.snippet.toLowerCase().includes('inactive') && !result.snippet.toLowerCase().includes('suspended')
          });
        }
      }

      // Check mention patterns
      for (const { platform, pattern } of mentionPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const handle = match[1];
          const key = `${platform}_${handle}`;

          if (seen.has(key)) continue;
          seen.add(key);

          accounts.push({
            platform,
            handle,
            url: platform.includes('Twitter') ? `https://x.com/${handle}` : `https://instagram.com/${handle}`,
            verified: false,
            active: true
          });
        }
      }
    }

    return accounts;
  }

  /**
   * Parse media appearances from search results
   */
  parseMediaAppearances(results: SearchResult[], subject: string): MediaAppearance[] {
    const appearances: MediaAppearance[] = [];
    const seen = new Set<string>();

    const mediaOutlets = [
      { name: 'CNN', type: 'TV' as const },
      { name: 'Fox News', type: 'TV' as const },
      { name: 'BBC', type: 'TV' as const },
      { name: 'NPR', type: 'RADIO' as const },
      { name: 'New York Times', type: 'PRINT' as const },
      { name: 'Washington Post', type: 'PRINT' as const },
      { name: 'Wall Street Journal', type: 'PRINT' as const },
      { name: 'Guardian', type: 'PRINT' as const },
      { name: 'TIME', type: 'PRINT' as const },
      { name: 'Newsweek', type: 'PRINT' as const },
      { name: 'Iran International', type: 'TV' as const },
      { name: 'VOA', type: 'TV' as const },
      { name: 'Radio Farda', type: 'RADIO' as const },
      { name: 'Al Jazeera', type: 'TV' as const },
      { name: 'Jerusalem Post', type: 'PRINT' as const },
      { name: 'Times of Israel', type: 'ONLINE' as const },
      { name: 'Haaretz', type: 'PRINT' as const },
      { name: 'Politico', type: 'ONLINE' as const },
      { name: 'Axios', type: 'ONLINE' as const }
    ];

    const appearanceTypes = [
      { keywords: ['interviewed', 'interview with', 'spoke to', 'told'], type: 'INTERVIEW' as const },
      { keywords: ['op-ed', 'opinion piece', 'wrote for', 'column'], type: 'OP_ED' as const },
      { keywords: ['statement', 'press release', 'announced'], type: 'STATEMENT' as const },
      { keywords: ['speech', 'address', 'spoke at'], type: 'SPEECH' as const },
      { keywords: ['panel', 'forum', 'discussion'], type: 'PANEL' as const },
      { keywords: ['documentary', 'feature', 'profile'], type: 'DOCUMENTARY' as const }
    ];

    for (const result of results) {
      const text = result.snippet.toLowerCase();

      for (const { name: outlet, type: outletType } of mediaOutlets) {
        if (!text.includes(outlet.toLowerCase())) continue;

        for (const { keywords, type } of appearanceTypes) {
          if (!keywords.some(k => text.includes(k))) continue;

          const key = `${outlet}_${type}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Extract date
          const dateMatch = result.snippet.match(/(\d{4}(?:-\d{2})?(?:-\d{2})?)/);

          // Extract topic
          const topicMatch = result.snippet.match(/(?:about|on|regarding|discussing)\s+([^.]+)/i);

          appearances.push({
            outlet,
            outletType,
            date: dateMatch ? dateMatch[1] : 'Unknown',
            type,
            topic: topicMatch ? topicMatch[1].substring(0, 100) : 'Unknown',
            url: result.url
          });
        }
      }
    }

    return appearances;
  }

  /**
   * Parse amplification network from search results
   */
  parseAmplificationNetwork(results: SearchResult[], subject: string): AmplificationNode[] {
    const nodes: AmplificationNode[] = [];
    const seen = new Set<string>();

    const amplifierPatterns = [
      { pattern: /([A-Za-z\s]+(?:TV|News|Media|Channel))\s+(?:promotes?|amplifies?|broadcasts?)/gi, type: 'MEDIA' as const },
      { pattern: /(?:think tank|institute)[^.]*?([A-Z][a-zA-Z\s]+(?:Foundation|Institute|Center))/gi, type: 'THINK_TANK' as const },
      { pattern: /(?:troll|bot)\s+(?:network|farm|army)/gi, type: 'BOT_NETWORK' as const },
      { pattern: /([A-Za-z]+)\s+government\s+(?:supports?|backs?|promotes?)/gi, type: 'GOVERNMENT' as const },
      { pattern: /influencer[s]?\s+(?:like|including)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, type: 'INFLUENCER' as const }
    ];

    for (const result of results) {
      for (const { pattern, type } of amplifierPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1]?.trim() || type;
          if (seen.has(name)) continue;
          seen.add(name);

          nodes.push({
            entityId: `amplifier_${name.toLowerCase().replace(/\s+/g, '_')}`,
            name,
            type,
            relationship: 'Amplifies messaging',
            sources: [result.url]
          });
        }
      }
    }

    return nodes;
  }

  /**
   * Parse digital campaigns from search results
   */
  parseDigitalCampaigns(results: SearchResult[], subject: string): DigitalCampaign[] {
    const campaigns: DigitalCampaign[] = [];
    const seen = new Set<string>();

    const campaignIndicators = [
      'influence campaign', 'disinformation', 'coordinated', 'fake accounts',
      'bot network', 'astroturfing', 'propaganda', 'psyop', 'information operation'
    ];

    for (const result of results) {
      const text = result.snippet.toLowerCase();

      const hasCampaign = campaignIndicators.some(ind => text.includes(ind));
      if (!hasCampaign) continue;

      // Extract campaign name or description
      const nameMatch = result.snippet.match(/([A-Za-z\s]+(?:campaign|operation|network))/i);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Campaign';

      if (seen.has(name)) continue;
      seen.add(name);

      // Extract platforms
      const platforms: string[] = [];
      if (text.includes('twitter') || text.includes(' x ')) platforms.push('Twitter/X');
      if (text.includes('facebook')) platforms.push('Facebook');
      if (text.includes('instagram')) platforms.push('Instagram');
      if (text.includes('telegram')) platforms.push('Telegram');
      if (text.includes('youtube')) platforms.push('YouTube');

      // Extract operator
      const operatorMatch = result.snippet.match(/(?:operated|run|linked to)\s+(?:by\s+)?([A-Za-z\s]+)/i);

      campaigns.push({
        name,
        operator: operatorMatch ? operatorMatch[1].trim() : undefined,
        platforms: platforms.length > 0 ? platforms : ['Unknown'],
        tactics: campaignIndicators.filter(ind => text.includes(ind)),
        sources: [result.url]
      });
    }

    return campaigns;
  }

  /**
   * Parse follower count string to number
   */
  private parseFollowerCount(str: string): number {
    const num = parseFloat(str.replace(/,/g, ''));
    if (str.toLowerCase().includes('m')) return num * 1000000;
    if (str.toLowerCase().includes('k')) return num * 1000;
    return num;
  }
}
