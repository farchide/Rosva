/**
 * PRISM Political Research Agent
 *
 * Analyzes political dimensions including:
 * - Public positions on key issues
 * - Position evolution over time
 * - Foreign relations and meetings
 * - Controversies and criticisms
 * - Endorsements and opposition
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import {
  PositionRecord,
  PositionChange,
  ForeignRelation,
  Controversy,
  TimelineEvent
} from '../core/types';

export interface PoliticalResult {
  positions: PositionRecord[];
  foreignRelations: ForeignRelation[];
  controversies: Controversy[];
  timeline: TimelineEvent[];
}

export class PoliticalAgent extends BaseAgent {
  constructor(config: AgentConfig = {}) {
    super('PoliticalAgent', config);
  }

  async research(subject: string, context?: Record<string, any>): Promise<PoliticalResult> {
    const positions: PositionRecord[] = [];
    const foreignRelations: ForeignRelation[] = [];
    const controversies: Controversy[] = [];
    const timeline: TimelineEvent[] = [];

    return { positions, foreignRelations, controversies, timeline };
  }

  /**
   * Parse political positions from search results
   */
  parsePositions(results: SearchResult[], subject: string): PositionRecord[] {
    const positions: PositionRecord[] = [];
    const seenTopics = new Set<string>();

    // Key political topics to look for
    const topics = [
      { keywords: ['democracy', 'democratic', 'republic', 'monarchy', 'government form'], topic: 'Form of Government', category: 'POLITICAL' as const },
      { keywords: ['israel', 'israeli', 'zionist', 'normalization'], topic: 'Israel Relations', category: 'FOREIGN_POLICY' as const },
      { keywords: ['united states', 'america', 'us government', 'washington'], topic: 'US Relations', category: 'FOREIGN_POLICY' as const },
      { keywords: ['sanctions', 'economic pressure', 'financial'], topic: 'Sanctions Policy', category: 'ECONOMIC' as const },
      { keywords: ['intervention', 'military', 'regime change'], topic: 'Foreign Intervention', category: 'FOREIGN_POLICY' as const },
      { keywords: ['secular', 'religion', 'theocracy', 'separation'], topic: 'Secularism', category: 'POLITICAL' as const },
      { keywords: ['federalism', 'federalist', 'decentralization', 'autonomy'], topic: 'Federalism', category: 'POLITICAL' as const },
      { keywords: ['minority', 'ethnic', 'kurdish', 'arab', 'baloch'], topic: 'Minority Rights', category: 'SOCIAL' as const },
      { keywords: ['women', 'gender', 'feminist', 'equality'], topic: 'Gender Equality', category: 'SOCIAL' as const },
      { keywords: ['nuclear', 'atomic', 'enrichment', 'nonproliferation'], topic: 'Nuclear Policy', category: 'FOREIGN_POLICY' as const },
      { keywords: ['transition', 'transitional', 'interim', 'provisional'], topic: 'Transition Plan', category: 'POLITICAL' as const }
    ];

    for (const result of results) {
      const text = result.snippet.toLowerCase();

      for (const { keywords, topic, category } of topics) {
        if (seenTopics.has(topic)) continue;

        const hasKeyword = keywords.some(kw => text.includes(kw));
        if (!hasKeyword) continue;

        // Try to extract the actual position
        const positionPatterns = [
          new RegExp(`${subject}[^.]*?(?:advocates?|supports?|believes?|calls for|proposes?|favors?|opposes?)\\s+([^.]+)`, 'i'),
          new RegExp(`(?:advocates?|supports?|believes?|calls for|proposes?)[^.]*?${keywords[0]}[^.]*`, 'i'),
          new RegExp(`${keywords[0]}[^.]*?(?:position|stance|view)[^.]*`, 'i')
        ];

        for (const pattern of positionPatterns) {
          const match = result.snippet.match(pattern);
          if (match) {
            seenTopics.add(topic);

            // Extract date if present
            const dateMatch = result.snippet.match(/(\d{4})/);

            positions.push({
              topic,
              category,
              currentPosition: this.normalizeText(match[0]),
              date: dateMatch ? dateMatch[1] : 'Unknown',
              evolution: [],
              consistency: 'UNCLEAR',
              sources: [result.url]
            });
            break;
          }
        }
      }
    }

    return positions;
  }

  /**
   * Parse foreign relations from search results
   */
  parseForeignRelations(results: SearchResult[], subject: string): ForeignRelation[] {
    const relations: ForeignRelation[] = [];
    const seen = new Set<string>();

    // Countries and their leaders/officials to look for
    const countryPatterns = [
      { country: 'Israel', patterns: ['netanyahu', 'herzog', 'israeli', 'tel aviv', 'jerusalem'] },
      { country: 'United States', patterns: ['trump', 'biden', 'white house', 'state department', 'washington'] },
      { country: 'Saudi Arabia', patterns: ['saudi', 'mbs', 'riyadh', 'bin salman'] },
      { country: 'United Kingdom', patterns: ['british', 'uk government', 'london', 'parliament'] },
      { country: 'France', patterns: ['macron', 'french', 'paris', 'élysée'] },
      { country: 'Germany', patterns: ['german', 'berlin', 'bundestag', 'scholz'] },
      { country: 'Turkey', patterns: ['erdogan', 'turkish', 'ankara'] },
      { country: 'Russia', patterns: ['putin', 'russian', 'moscow', 'kremlin'] },
      { country: 'China', patterns: ['chinese', 'beijing', 'xi jinping'] }
    ];

    const relationTypes = [
      { keywords: ['met with', 'meeting with', 'visited', 'visit to'], type: 'MEETING' as const },
      { keywords: ['endorsed', 'endorsement', 'supports', 'backed'], type: 'ENDORSEMENT' as const },
      { keywords: ['criticized', 'condemned', 'denounced', 'opposed'], type: 'OPPOSITION' as const },
      { keywords: ['allied', 'alliance', 'partnership', 'cooperation'], type: 'ALLIANCE' as const },
      { keywords: ['funded', 'funding', 'financial support', 'donated'], type: 'FUNDING' as const },
      { keywords: ['statement', 'said', 'declared', 'announced'], type: 'STATEMENT' as const }
    ];

    for (const result of results) {
      const text = result.snippet.toLowerCase();

      for (const { country, patterns } of countryPatterns) {
        const hasCountry = patterns.some(p => text.includes(p));
        if (!hasCountry) continue;

        for (const { keywords, type } of relationTypes) {
          const hasRelation = keywords.some(k => text.includes(k));
          if (!hasRelation) continue;

          // Extract the specific entity (person/org)
          const entityPatterns = [
            /met\s+(?:with\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:endorsed|supported|met)/i,
            /visit(?:ed)?\s+(?:to\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
          ];

          let entityName = country;
          for (const ep of entityPatterns) {
            const match = result.snippet.match(ep);
            if (match && match[1]) {
              entityName = match[1].trim();
              break;
            }
          }

          const key = `${country}_${type}_${entityName}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Extract date
          const dateMatch = result.snippet.match(/(\d{4}(?:-\d{2})?(?:-\d{2})?)/);

          relations.push({
            country,
            entity: entityName,
            entityType: entityName === country ? 'GOVERNMENT' : 'OFFICIAL',
            relationType: type,
            date: dateMatch ? dateMatch[1] : 'Unknown',
            description: this.normalizeText(result.snippet).substring(0, 200),
            significance: type === 'MEETING' || type === 'ENDORSEMENT' ? 'HIGH' : 'MEDIUM',
            sources: [result.url]
          });
        }
      }
    }

    return relations;
  }

  /**
   * Parse controversies from search results
   */
  parseControversies(results: SearchResult[], subject: string): Controversy[] {
    const controversies: Controversy[] = [];
    const seen = new Set<string>();

    const controversyPatterns = [
      { keywords: ['controversy', 'controversial', 'scandal'], category: 'POLITICAL' as const },
      { keywords: ['criticized for', 'criticism', 'critics say'], category: 'POLITICAL' as const },
      { keywords: ['accused', 'allegation', 'alleged'], category: 'ETHICAL' as const },
      { keywords: ['financial', 'funding', 'money', 'funds'], category: 'FINANCIAL' as const },
      { keywords: ['lawsuit', 'legal', 'court', 'sued'], category: 'LEGAL' as const },
      { keywords: ['failed', 'failure', 'collapsed', 'dissolved'], category: 'ORGANIZATIONAL' as const }
    ];

    for (const result of results) {
      const text = result.snippet.toLowerCase();

      for (const { keywords, category } of controversyPatterns) {
        const hasKeyword = keywords.some(k => text.includes(k));
        if (!hasKeyword) continue;

        // Create a key based on the main topic
        const topicMatch = result.snippet.match(/(?:controversy|criticism|scandal)[^.]*?(?:about|over|regarding)\s+([^.]+)/i);
        const topic = topicMatch ? topicMatch[1].substring(0, 50) : result.title.substring(0, 50);

        if (seen.has(topic)) continue;
        seen.add(topic);

        // Extract date
        const dateMatch = result.snippet.match(/(\d{4})/);

        controversies.push({
          title: topic,
          date: dateMatch ? dateMatch[1] : 'Unknown',
          category,
          description: this.normalizeText(result.snippet).substring(0, 300),
          allegations: [],
          ongoing: !text.includes('resolved') && !text.includes('ended'),
          significance: text.includes('major') || text.includes('significant') ? 'HIGH' : 'MEDIUM',
          sources: [result.url]
        });
      }
    }

    return controversies;
  }

  /**
   * Parse timeline events from search results
   */
  parseTimeline(results: SearchResult[], subject: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const seen = new Set<string>();

    const eventPatterns = [
      { pattern: /(\d{4}(?:-\d{2})?(?:-\d{2})?)[,:\s]+([^.]+(?:founded|established|launched|created)[^.]+)/gi, category: 'ORGANIZATIONAL' as const },
      { pattern: /(\d{4}(?:-\d{2})?(?:-\d{2})?)[,:\s]+([^.]+(?:met with|visited|meeting)[^.]+)/gi, category: 'MEETING' as const },
      { pattern: /(\d{4}(?:-\d{2})?(?:-\d{2})?)[,:\s]+([^.]+(?:said|stated|declared|announced)[^.]+)/gi, category: 'STATEMENT' as const },
      { pattern: /(\d{4}(?:-\d{2})?(?:-\d{2})?)[,:\s]+([^.]+(?:born|died|married)[^.]+)/gi, category: 'PERSONAL' as const },
      { pattern: /(\d{4}(?:-\d{2})?(?:-\d{2})?)[,:\s]+([^.]+(?:elected|appointed|resigned)[^.]+)/gi, category: 'POLITICAL' as const },
      { pattern: /(?:in|on)\s+(\d{4}(?:-\d{2})?(?:-\d{2})?)[,\s]+([^.]+)/gi, category: 'POLITICAL' as const }
    ];

    for (const result of results) {
      for (const { pattern, category } of eventPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const date = match[1];
          const event = this.normalizeText(match[2]);

          // Only include if it mentions the subject or is clearly related
          if (!event.toLowerCase().includes(subject.toLowerCase().split(' ')[0]) &&
              !result.snippet.toLowerCase().includes(subject.toLowerCase())) {
            continue;
          }

          const key = `${date}_${event.substring(0, 30)}`;
          if (seen.has(key)) continue;
          seen.add(key);

          events.push({
            date,
            event: event.substring(0, 150),
            category,
            significance: this.assessEventSignificance(event),
            sources: [result.url]
          });
        }
      }
    }

    // Sort by date
    events.sort((a, b) => a.date.localeCompare(b.date));

    return events;
  }

  /**
   * Assess event significance
   */
  private assessEventSignificance(event: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highKeywords = ['founded', 'elected', 'major', 'historic', 'first', 'death', 'born', 'president', 'prime minister'];
    const lowKeywords = ['minor', 'small', 'brief', 'routine'];

    const lower = event.toLowerCase();

    if (highKeywords.some(k => lower.includes(k))) return 'HIGH';
    if (lowKeywords.some(k => lower.includes(k))) return 'LOW';
    return 'MEDIUM';
  }
}
