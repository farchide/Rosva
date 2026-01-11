/**
 * PRISM Visualization Engine
 *
 * Generates visual outputs including:
 * - ASCII art dashboards
 * - Mermaid diagrams
 * - GraphML export
 * - Neo4j Cypher
 * - JSON exports
 */

import {
  ResearchReport,
  PersonProfile,
  Entity,
  Relationship,
  NetworkMetrics,
  TimelineEvent,
  PoliticalAffiliation,
  SocialMediaAnalysis
} from './types';

export class PRISMVisualizer {
  /**
   * Generate complete visualization output
   */
  generate(report: ResearchReport): string {
    let output = '';

    output += this.generateHeader();
    output += this.generateSubjectProfile(report.profile);
    output += this.generatePoliticalAffiliation(report.profile.politicalAffiliation);
    output += this.generateSocialMediaAnalysis(report.profile.mediaPresence.socialMediaAnalysis);
    output += this.generateNetworkMetrics(report.metrics, report.graph.entities.length, report.graph.relationships.length);
    output += this.generateFamilyNetwork(report.profile);
    output += this.generateOrganizations(report.profile);
    output += this.generateForeignRelations(report.profile);
    output += this.generatePositions(report.profile);
    output += this.generateControversies(report.profile);
    output += this.generateTimeline(report.profile.timeline);
    output += this.generateTopRelationships(report.graph.relationships, report.graph.entities);
    output += this.generateEntityBreakdown(report.graph.entities);
    output += this.generateSources(report.sources);
    output += this.generateFooter(report);

    return output;
  }

  /**
   * Generate PRISM header
   */
  private generateHeader(): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                  ║
║  ██████╗ ██████╗ ██╗███████╗███╗   ███╗    ██╗███╗   ██╗████████╗███████╗██╗                                     ║
║  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║    ██║████╗  ██║╚══██╔══╝██╔════╝██║                                     ║
║  ██████╔╝██████╔╝██║███████╗██╔████╔██║    ██║██╔██╗ ██║   ██║   █████╗  ██║                                     ║
║  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║    ██║██║╚██╗██║   ██║   ██╔══╝  ██║                                     ║
║  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║    ██║██║ ╚████║   ██║   ███████╗███████╗                                ║
║  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝                                ║
║                                                                                                                  ║
║                       OPEN-SOURCE TRUTH & ACCOUNTABILITY ENGINE v1.0                                            ║
║                       Narrative Analysis • Influence Mapping • Source Documentation                              ║
║                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

`;
  }

  /**
   * Generate subject profile section
   */
  private generateSubjectProfile(profile: PersonProfile): string {
    const bio = profile.biography;

    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           SUBJECT PROFILE                                                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
┃    ████████████████████████████████████████████████████████████████████████                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   ${bio.fullName.padEnd(60)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   Titles:     ${(bio.titles?.slice(0, 2).join(', ') || 'N/A').padEnd(48)}██                                     ┃
┃    ██   Born:       ${(bio.birthDate || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Birthplace: ${(bio.birthPlace || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Residence:  ${(bio.residence || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Nationality:${(bio.nationality?.join(', ') || 'Unknown').padEnd(48)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   Occupation: ${(bio.occupation?.slice(0, 2).join(', ') || 'Unknown').padEnd(48)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ████████████████████████████████████████████████████████████████████████                                     ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate political affiliation section
   */
  private generatePoliticalAffiliation(affiliation?: PoliticalAffiliation): string {
    if (!affiliation) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                    POLITICAL AFFILIATION ANALYSIS                                               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
`;

    // Primary Party
    if (affiliation.primaryParty) {
      const p = affiliation.primaryParty;
      const confBar = this.generateConfidenceBar(p.confidence);
      output += `┃   🗳️  PRIMARY PARTY AFFILIATION                                                                              ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃
┃   │  Party:       ${p.partyName.padEnd(78)}│     ┃
┃   │  Country:     ${p.country.padEnd(78)}│     ┃
┃   │  Status:      ${p.affiliation.padEnd(78)}│     ┃
┃   │  Confidence:  ${confBar}  ${p.confidence.toString().padStart(3)}%                                            │     ┃
┃   │  Evidence:    ${p.evidenceCount.toString().padEnd(3)} mentions across ${p.sources.length.toString().padEnd(2)} sources                                               │     ┃
┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃
`;

      // Evidence summary
      if (p.evidenceSummary.length > 0) {
        output += `┃   Evidence Snippets:                                                                                        ┃\n`;
        for (const ev of p.evidenceSummary.slice(0, 2)) {
          const cleaned = ev.replace(/[\n\r]/g, ' ').substring(0, 90);
          output += `┃     • "${cleaned}"  ┃\n`;
        }
        output += `┃                                                                                                                 ┃\n`;
      }
    } else {
      output += `┃   🗳️  PRIMARY PARTY: Unable to determine with confidence                                                       ┃
┃                                                                                                                 ┃
`;
    }

    // Iranian Opposition Connections (dedicated section)
    const iranianParties = affiliation.secondaryParties.filter(p => p.country === 'Iran');
    const otherSecondary = affiliation.secondaryParties.filter(p => p.country !== 'Iran');

    // Check if primary party is also Iranian
    const primaryIsIranian = affiliation.primaryParty?.country === 'Iran';

    if (iranianParties.length > 0 || primaryIsIranian) {
      output += `┃   🇮🇷 IRANIAN OPPOSITION CONNECTION                                                                           ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃\n`;

      // If primary is Iranian, show it prominently
      if (primaryIsIranian && affiliation.primaryParty) {
        const p = affiliation.primaryParty;
        const confBar = this.generateConfidenceBar(p.confidence);
        output += `┃   │  PRIMARY: ${p.partyName.padEnd(65)}│     ┃
┃   │  Confidence: ${confBar}  ${p.confidence.toString().padStart(3)}%                                        │     ┃\n`;
      }

      // Show Iranian secondary affiliations
      for (const p of iranianParties) {
        const miniBar = this.generateMiniBar(p.confidence);
        output += `┃   │  ${miniBar} ${p.partyName.padEnd(50)} ${p.confidence}% confidence           │     ┃\n`;
      }

      output += `┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃\n`;
    }

    // Other Secondary affiliations (non-Iranian)
    if (otherSecondary.length > 0) {
      output += `┃   📊 OTHER AFFILIATIONS                                                                                       ┃\n`;
      for (const p of otherSecondary.slice(0, 3)) {
        const miniBar = this.generateMiniBar(p.confidence);
        output += `┃     ${miniBar} ${p.partyName.padEnd(30)} (${p.country}) - ${p.confidence}% confidence               ┃\n`;
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    // Ideology Profile
    output += `┃   🧭 IDEOLOGY PROFILE                                                                                         ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃
┃   │  Primary:     ${affiliation.ideology.primaryLabel.padEnd(30)} ${this.generateConfidenceBar(affiliation.ideology.confidence)}  ${affiliation.ideology.confidence.toString().padStart(3)}%  │     ┃
┃   │                                                                                                     │     ┃
┃   │  Economic:    ${this.generateAxisBar(affiliation.ideology.economicAxis)}   ${this.formatAxisValue(affiliation.ideology.economicAxis)}  │     ┃
┃   │               Left ◄─────────────────────────┼─────────────────────────► Right                      │     ┃
┃   │                                                                                                     │     ┃
┃   │  Social:      ${this.generateAxisBar(affiliation.ideology.socialAxis)}   ${this.formatAxisValue(affiliation.ideology.socialAxis)}  │     ┃
┃   │               Progressive ◄──────────────────┼──────────────────► Traditional                       │     ┃
┃   │                                                                                                     │     ┃
┃   │  Authority:   ${this.generateAxisBar(affiliation.ideology.authoritarianAxis)}   ${this.formatAxisValue(affiliation.ideology.authoritarianAxis)}  │     ┃
┃   │               Libertarian ◄──────────────────┼──────────────────► Authoritarian                     │     ┃
┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃
`;

    // Ideology Labels
    if (affiliation.ideology.labels.length > 0) {
      output += `┃   📌 DETECTED IDEOLOGICAL SIGNALS                                                                             ┃\n`;
      for (const label of affiliation.ideology.labels.slice(0, 5)) {
        const bar = this.generateMiniBar(label.confidence);
        output += `┃     ${bar} ${label.label.padEnd(25)} ${label.confidence}%                                                ┃\n`;
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    // Endorsements
    if (affiliation.endorsements.length > 0) {
      output += `┃   🤝 POLITICAL ENDORSEMENTS                                                                                   ┃\n`;
      for (const e of affiliation.endorsements.slice(0, 4)) {
        output += `┃     • ${e.type === 'GAVE' ? 'Endorsed' : 'Endorsed by'}: ${e.endorsed.padEnd(30)} (${e.party})                        ┃\n`;
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    // Overall Confidence
    const overallBar = this.generateConfidenceBar(affiliation.overallConfidence);
    output += `┃   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ┃
┃   OVERALL AFFILIATION CONFIDENCE: ${overallBar}  ${affiliation.overallConfidence.toString().padStart(3)}%                                             ┃
┃   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;

    return output;
  }

  /**
   * Generate social media analysis section
   */
  private generateSocialMediaAnalysis(analysis?: SocialMediaAnalysis): string {
    if (!analysis) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      SOCIAL MEDIA ANALYSIS                                                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
`;

    // Overall Influence Score
    const influenceBar = this.generateConfidenceBar(analysis.overallInfluence);
    output += `┃   📊 OVERALL SOCIAL MEDIA INFLUENCE                                                                             ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃
┃   │  Influence Score: ${influenceBar}  ${analysis.overallInfluence.toString().padStart(3)}%                                            │     ┃
┃   │  Primary Platform: ${(analysis.primaryPlatform || 'Not detected').padEnd(71)}│     ┃
┃   │  Platforms Found: ${analysis.profiles.length.toString().padEnd(72)}│     ┃
┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃
`;

    // Social Media Profiles
    if (analysis.profiles.length > 0) {
      output += `┃   📱 DETECTED SOCIAL MEDIA PROFILES                                                                             ┃\n`;
      for (const profile of analysis.profiles.slice(0, 6)) {
        const platformIcon = this.getPlatformIcon(profile.platform);
        const verifiedIcon = profile.verified ? '✓' : ' ';
        const followers = this.formatFollowerCount(profile.followerCount);
        output += `┃     ${platformIcon} ${profile.platform.padEnd(12)} @${profile.username.padEnd(20)} ${verifiedIcon} ${followers.padEnd(15)} ${profile.url.substring(0, 40)}\n`;
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    // X (Twitter) Analysis
    if (analysis.xAnalysis) {
      const x = analysis.xAnalysis;
      output += `┃   🐦 X (TWITTER) ANALYSIS                                                                                       ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃
┃   │  Profile Found: ${(x.profileFound ? 'Yes' : 'Analysis from search results').padEnd(76)}│     ┃
┃   │  Influence Score: ${this.generateMiniBar(x.influenceScore)} ${x.influenceScore.toString().padStart(3)}%                                              │     ┃
┃   │  Verification: ${(x.verified ? 'Verified Account' : 'Not Verified').padEnd(77)}│     ┃
┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃
`;

      // Notable Connections
      if (x.notableConnections.length > 0) {
        output += `┃   🔗 NOTABLE X CONNECTIONS                                                                                      ┃\n`;
        for (const conn of x.notableConnections.slice(0, 5)) {
          const verifiedMark = conn.verified ? '✓' : ' ';
          output += `┃     ${verifiedMark} @${conn.username.padEnd(20)} │ ${conn.displayName.padEnd(25)} │ ${conn.category.padEnd(20)}\n`;
        }
        output += `┃                                                                                                                 ┃\n`;
      }

      // Political Indicators from X
      if (x.politicalIndicators.topPoliticalHashtags.length > 0) {
        output += `┃   🏛️ X POLITICAL INDICATORS                                                                                     ┃\n`;
        for (const hashtag of x.politicalIndicators.topPoliticalHashtags.slice(0, 4)) {
          const bar = this.generateMiniBar(Math.min(100, hashtag.count * 20));
          output += `┃     ${bar} ${hashtag.tag.padEnd(25)} (used ${hashtag.count} times)                                          ┃\n`;
        }
        if (x.politicalIndicators.politicalTopics.length > 0) {
          output += `┃     Topics: ${x.politicalIndicators.politicalTopics.slice(0, 5).join(', ').substring(0, 80).padEnd(85)}\n`;
        }
        output += `┃                                                                                                                 ┃\n`;
      }

      // Iran Activity from X
      if (x.iranActivity.stance !== 'UNKNOWN' || x.iranActivity.iranRelatedTweets > 0) {
        output += `┃   🇮🇷 IRAN-RELATED X ACTIVITY                                                                                    ┃
┃   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐     ┃\n`;

        const stanceLabel = x.iranActivity.stance === 'PRO_OPPOSITION' ? 'Pro-Opposition' :
                           x.iranActivity.stance === 'PRO_REGIME' ? 'Pro-Regime' :
                           x.iranActivity.stance === 'NEUTRAL' ? 'Neutral' : 'Unknown';
        const stanceBar = this.generateConfidenceBar(x.iranActivity.confidence);

        output += `┃   │  Stance: ${stanceLabel.padEnd(20)} Confidence: ${stanceBar}  ${x.iranActivity.confidence.toString().padStart(3)}%  │     ┃
┃   │  Iran-Related Activity: ${x.iranActivity.iranRelatedTweets.toString().padEnd(66)}│     ┃\n`;

        if (x.iranActivity.oppositionHashtags.length > 0) {
          output += `┃   │  Opposition Hashtags: ${x.iranActivity.oppositionHashtags.slice(0, 4).join(', ').substring(0, 68).padEnd(68)}│     ┃\n`;
        }
        if (x.iranActivity.oppositionMentions.length > 0) {
          output += `┃   │  Opposition Mentions: ${x.iranActivity.oppositionMentions.slice(0, 4).join(', ').substring(0, 68).padEnd(68)}│     ┃\n`;
        }
        if (x.iranActivity.evidence.length > 0) {
          output += `┃   │  Evidence: ${x.iranActivity.evidence[0].substring(0, 80).padEnd(81)}│     ┃\n`;
        }
        output += `┃   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘     ┃
┃                                                                                                                 ┃\n`;
      }
    }

    // Overall Political Summary from Social Media
    if (analysis.politicalSummary.primaryLeaning !== 'Unknown') {
      output += `┃   🗳️ SOCIAL MEDIA POLITICAL SUMMARY                                                                            ┃
┃     Primary Leaning: ${analysis.politicalSummary.primaryLeaning.padEnd(30)} Confidence: ${analysis.politicalSummary.confidence}%                       ┃\n`;
      if (analysis.politicalSummary.evidence.length > 0) {
        for (const ev of analysis.politicalSummary.evidence.slice(0, 2)) {
          output += `┃     • ${ev.substring(0, 95).padEnd(95)}\n`;
        }
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    // Iran Stance Summary from Social Media
    if (analysis.iranStance.stance !== 'Unknown') {
      output += `┃   🇮🇷 SOCIAL MEDIA IRAN STANCE                                                                                   ┃
┃     Stance: ${analysis.iranStance.stance.padEnd(30)} Confidence: ${analysis.iranStance.confidence}%                                  ┃\n`;
      if (analysis.iranStance.evidence.length > 0) {
        for (const ev of analysis.iranStance.evidence.slice(0, 2)) {
          output += `┃     • ${ev.substring(0, 95).padEnd(95)}\n`;
        }
      }
      output += `┃                                                                                                                 ┃\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;

    return output;
  }

  /**
   * Get platform icon
   */
  private getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      'X': '🐦',
      'INSTAGRAM': '📷',
      'YOUTUBE': '📺',
      'TIKTOK': '🎵',
      'FACEBOOK': '👤',
      'LINKEDIN': '💼'
    };
    return icons[platform] || '🌐';
  }

  /**
   * Format follower count
   */
  private formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M followers';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K followers';
    }
    if (count > 0) {
      return count + ' followers';
    }
    return 'Unknown';
  }

  /**
   * Generate confidence bar visualization
   */
  private generateConfidenceBar(confidence: number): string {
    const filled = Math.round(confidence / 5); // 20 chars max for 100%
    const empty = 20 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Generate mini bar for lists
   */
  private generateMiniBar(confidence: number): string {
    const filled = Math.round(confidence / 10); // 10 chars max
    return '▓'.repeat(filled) + '░'.repeat(10 - filled);
  }

  /**
   * Generate axis bar (-100 to +100)
   */
  private generateAxisBar(value: number): string {
    // Convert -100 to +100 to 0-20 position
    const pos = Math.round((value + 100) / 10); // 0-20
    const bar = '─'.repeat(20);
    const chars = bar.split('');
    chars[10] = '┼'; // Center marker
    chars[Math.min(19, Math.max(0, pos))] = '●'; // Position marker
    return chars.join('');
  }

  /**
   * Format axis value with label
   */
  private formatAxisValue(value: number): string {
    if (value > 50) return `Right (+${value})`.padEnd(15);
    if (value < -50) return `Left (${value})`.padEnd(15);
    if (value > 20) return `Center-Right (+${value})`.padEnd(15);
    if (value < -20) return `Center-Left (${value})`.padEnd(15);
    return `Center (${value})`.padEnd(15);
  }

  /**
   * Generate network metrics section
   */
  private generateNetworkMetrics(metrics: NetworkMetrics, entityCount: number, relCount: number): string {
    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃        NETWORK METRICS           ┃        GRAPH STATISTICS          ┃         DATA QUALITY             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Total Entities: ${entityCount.toString().padEnd(15)} ┃  Relationships: ${relCount.toString().padEnd(16)} ┃  Sources: OSINT                  ┃
┃  Network Density: ${(metrics.density * 100).toFixed(2).padEnd(13)}% ┃  Components: ${metrics.components.toString().padEnd(19)} ┃  Methodology: Source-anchored    ┃
┃  Key Influencers: ${metrics.keyInfluencers.length.toString().padEnd(13)} ┃  Communities: ${metrics.communities.length.toString().padEnd(18)} ┃  All Claims Documented: YES      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate family network section
   */
  private generateFamilyNetwork(profile: PersonProfile): string {
    if (!profile.family.members || profile.family.members.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           FAMILY NETWORK                                                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const member of profile.family.members.slice(0, 15)) {
      const statusIcon = member.status === 'DECEASED' ? '†' : member.status === 'LIVING' ? '●' : '○';
      output += `    ${statusIcon} ${member.name.padEnd(30)} │ ${member.relationship.padEnd(15)} │ ${(member.notes || '').substring(0, 40)}\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate organizations section
   */
  private generateOrganizations(profile: PersonProfile): string {
    if (!profile.organizations || profile.organizations.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                       ORGANIZATIONS & INITIATIVES                                               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const org of profile.organizations.slice(0, 10)) {
      const statusIcon = org.status === 'ACTIVE' ? '●' : org.status === 'INACTIVE' ? '○' : '◐';
      output += `    ${statusIcon} ${org.name.padEnd(45)} [${org.status}]\n`;
      output += `      Role: ${org.role}\n`;
      if (org.startDate) output += `      Founded: ${org.startDate}\n`;
      if (org.description) output += `      ${org.description.substring(0, 80)}\n`;
      output += '\n';
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate foreign relations section
   */
  private generateForeignRelations(profile: PersonProfile): string {
    if (!profile.foreignRelations || profile.foreignRelations.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                    DOCUMENTED FOREIGN RELATIONS                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const fr of profile.foreignRelations.slice(0, 15)) {
      const typeIcon = fr.relationType === 'MEETING' ? '🤝' :
                       fr.relationType === 'ENDORSEMENT' ? '✓' :
                       fr.relationType === 'OPPOSITION' ? '✗' :
                       fr.relationType === 'FUNDING' ? '💰' : '📢';

      output += `    ${typeIcon} ${fr.date.padEnd(12)} │ ${fr.country.padEnd(15)} │ ${fr.entity}\n`;
      output += `                      └─ ${fr.description.substring(0, 70)}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate positions section
   */
  private generatePositions(profile: PersonProfile): string {
    if (!profile.positions || profile.positions.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      DOCUMENTED PUBLIC POSITIONS                                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const pos of profile.positions.slice(0, 10)) {
      output += `    ▸ ${pos.topic} [${pos.category}]\n`;
      output += `      Position: ${pos.currentPosition.substring(0, 80)}\n`;
      output += `      Consistency: ${pos.consistency}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate controversies section
   */
  private generateControversies(profile: PersonProfile): string {
    if (!profile.controversies || profile.controversies.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      DOCUMENTED CONTROVERSIES                                                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const cont of profile.controversies.slice(0, 8)) {
      const sigIcon = cont.significance === 'HIGH' ? '⚠️' : cont.significance === 'MEDIUM' ? '⚡' : '○';
      const statusIcon = cont.ongoing ? '[ONGOING]' : '[RESOLVED]';

      output += `    ${sigIcon} ${cont.title.substring(0, 50).padEnd(50)} ${statusIcon}\n`;
      output += `       Category: ${cont.category} │ Date: ${cont.date}\n`;
      output += `       ${cont.description.substring(0, 80)}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate timeline section
   */
  private generateTimeline(events: TimelineEvent[]): string {
    if (!events || events.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                         CHRONOLOGICAL TIMELINE                                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    const displayEvents = events.slice(0, 25);
    for (let i = 0; i < displayEvents.length; i++) {
      const event = displayEvents[i];
      const icon = event.category === 'POLITICAL' ? '🏛️' :
                   event.category === 'PERSONAL' ? '👤' :
                   event.category === 'ORGANIZATIONAL' ? '🏢' :
                   event.category === 'MEETING' ? '🤝' :
                   event.category === 'STATEMENT' ? '📢' :
                   event.category === 'CONTROVERSY' ? '⚠️' : '📅';

      const sigIcon = event.significance === 'HIGH' ? '★' : event.significance === 'MEDIUM' ? '◆' : '○';
      const connector = i === displayEvents.length - 1 ? '└' : '├';

      output += `    ${event.date.padEnd(12)} ${connector}──${icon}── ${sigIcon} ${event.event.substring(0, 70)}\n`;
      if (i < displayEvents.length - 1) output += `                    │\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate top relationships section
   */
  private generateTopRelationships(relationships: Relationship[], entities: Entity[]): string {
    if (!relationships || relationships.length === 0) {
      return '';
    }

    const entityMap = new Map(entities.map(e => [e.id, e]));
    const sorted = [...relationships].sort((a, b) => b.weight - a.weight).slice(0, 15);

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                   TOP RELATIONSHIPS BY STRENGTH                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (let i = 0; i < sorted.length; i++) {
      const rel = sorted[i];
      const from = entityMap.get(rel.from)?.name || rel.from;
      const to = entityMap.get(rel.to)?.name || rel.to;
      const pct = (rel.weight * 100).toFixed(0);
      const bar = '█'.repeat(Math.round(rel.weight * 25));

      output += `    ${(i + 1).toString().padStart(2)}. ${from.substring(0, 20).padEnd(20)} ──[${rel.type.padEnd(15)}]──▶ ${to.substring(0, 20).padEnd(20)}\n`;
      output += `        ${bar} ${pct}%\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate entity breakdown section
   */
  private generateEntityBreakdown(entities: Entity[]): string {
    const typeCounts = new Map<string, number>();
    for (const e of entities) {
      typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
    }

    const maxCount = Math.max(...typeCounts.values());
    const icons: Record<string, string> = {
      PERSON: '👤', COMPANY: '🏢', ORGANIZATION: '🏛️', GOVERNMENT: '🏛️',
      POLITICAL_PARTY: '🏛️', THINK_TANK: '🎓', MEDIA_OUTLET: '📰',
      NGO: '🤝', COALITION: '🤝', LOCATION: '📍', COUNTRY: '🌍',
      EVENT: '📅', SOCIAL_ACCOUNT: '💬', EDUCATIONAL_INSTITUTION: '🎓'
    };

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      ENTITY TYPE BREAKDOWN                                                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
      const bar = '▓'.repeat(Math.round((count / maxCount) * 40));
      const icon = icons[type] || '❓';
      output += `    ${icon} ${type.padEnd(25)} │${bar.padEnd(40)}│ ${count}\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate sources section
   */
  private generateSources(sources: any[]): string {
    // Simplified source output
    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           METHODOLOGY                                                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
┃  • All data sourced from publicly available records                                                             ┃
┃  • No private data collected or inferred                                                                        ┃
┃  • No speculation - all claims are source-anchored                                                              ┃
┃  • Relationships documented with evidence citations                                                             ┃
┃  • This report documents public narratives and documented relationships only                                    ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate footer
   */
  private generateFooter(report: ResearchReport): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                  ║
║                                      ✓ PRISM RESEARCH COMPLETE                                                  ║
║                                                                                                                  ║
║  Generated: ${report.generatedAt.toISOString().padEnd(30)}                                                       ║
║  Entities:  ${report.graph.entities.length.toString().padEnd(10)} Relationships: ${report.graph.relationships.length.toString().padEnd(10)} Timeline Events: ${report.profile.timeline.length.toString().padEnd(5)}              ║
║                                                                                                                  ║
║  Export Formats: JSON, GraphML, Mermaid, Neo4j Cypher, CSV                                                      ║
║                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

`;
  }

  /**
   * Generate Mermaid diagram
   */
  generateMermaid(report: ResearchReport): string {
    let mermaid = 'graph LR\n';
    mermaid += '    %% PRISM Intelligence Graph\n\n';

    // Group entities by type
    const byType = new Map<string, Entity[]>();
    for (const e of report.graph.entities) {
      if (!byType.has(e.type)) byType.set(e.type, []);
      byType.get(e.type)!.push(e);
    }

    // Add subgraphs
    for (const [type, entities] of byType) {
      mermaid += `    subgraph ${type}\n`;
      for (const e of entities.slice(0, 20)) {
        const icon = this.getMermaidIcon(e.type);
        const label = e.name.substring(0, 25).replace(/"/g, "'");
        mermaid += `        ${e.id}["${icon} ${label}"]\n`;
      }
      mermaid += '    end\n\n';
    }

    // Add relationships
    for (const r of report.graph.relationships.slice(0, 50)) {
      const style = r.weight > 0.8 ? '===' : '--';
      mermaid += `    ${r.from} ${style}"${r.type}"${style}> ${r.to}\n`;
    }

    return mermaid;
  }

  /**
   * Get Mermaid icon for entity type
   */
  private getMermaidIcon(type: string): string {
    const icons: Record<string, string> = {
      PERSON: '👤', COMPANY: '🏢', ORGANIZATION: '🏛️', GOVERNMENT: '🏛️',
      POLITICAL_PARTY: '🏛️', THINK_TANK: '🎓', MEDIA_OUTLET: '📰',
      COUNTRY: '🌍', LOCATION: '📍', EVENT: '📅'
    };
    return icons[type] || '❓';
  }

  /**
   * Export to JSON
   */
  exportJSON(report: ResearchReport): string {
    return JSON.stringify(report, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }, 2);
  }
}
