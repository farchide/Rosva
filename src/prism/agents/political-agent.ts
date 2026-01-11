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
  TimelineEvent,
  PoliticalAffiliation,
  PartyAffiliation,
  IdeologyProfile,
  IdeologyLabel,
  PoliticalEndorsement
} from '../core/types';

export interface PoliticalResult {
  positions: PositionRecord[];
  foreignRelations: ForeignRelation[];
  controversies: Controversy[];
  timeline: TimelineEvent[];
  politicalAffiliation: PoliticalAffiliation;
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
    const politicalAffiliation: PoliticalAffiliation = {
      primaryParty: null,
      secondaryParties: [],
      ideology: {
        primaryLabel: 'Unknown',
        confidence: 0,
        economicAxis: 0,
        socialAxis: 0,
        authoritarianAxis: 0,
        labels: []
      },
      endorsements: [],
      donations: [],
      overallConfidence: 0
    };

    return { positions, foreignRelations, controversies, timeline, politicalAffiliation };
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

  /**
   * Parse political affiliation from search results
   * Analyzes party membership, endorsements, donations, and ideological signals
   */
  parsePoliticalAffiliation(results: SearchResult[], subject: string): PoliticalAffiliation {
    const partySignals: Map<string, { count: number; evidence: string[]; sources: string[]; weight: number }> = new Map();
    const ideologySignals: Map<string, { count: number; evidence: string[] }> = new Map();
    const endorsements: PoliticalEndorsement[] = [];

    // Political parties and their indicators (order matters - more specific first)
    const partyPatterns: Array<{ party: string; country: string; keywords: string[]; weight: number }> = [
      // US Parties - higher weight for US-based subjects
      { party: 'Republican Party', country: 'USA', weight: 2, keywords: ['republican', 'gop', 'rnc', 'trump supporter', 'trump', 'maga', 'conservative republican', 'red state', 'right-wing', 'interviewed trump', 'supports trump'] },
      { party: 'Democratic Party', country: 'USA', weight: 2, keywords: ['democrat', 'dnc', 'biden supporter', 'biden', 'liberal democrat', 'blue state', 'progressive democrat', 'supports biden'] },
      { party: 'Libertarian Party', country: 'USA', weight: 1.5, keywords: ['libertarian party', 'libertarian candidate', 'ron paul'] },
      { party: 'Independent', country: 'USA', weight: 1, keywords: ['independent voter', 'no party affiliation', 'political independent', 'registered independent'] },
      // UK Parties - lower weight, require UK-specific keywords
      { party: 'Conservative Party (UK)', country: 'UK', weight: 1, keywords: ['tory', 'tories', 'conservative party uk', 'british conservative', 'uk parliament'] },
      { party: 'Labour Party', country: 'UK', weight: 1, keywords: ['labour party', 'labour mp', 'british labour', 'uk labour'] },
      // Iranian Opposition
      { party: 'Monarchist', country: 'Iran', weight: 1.5, keywords: ['pahlavi', 'monarchist', 'constitutionalist', 'shahist', 'crown prince'] },
      { party: 'MEK/NCRI', country: 'Iran', weight: 1.5, keywords: ['mek', 'ncri', 'mujahedin', 'rajavi'] },
      { party: 'Reformist', country: 'Iran', weight: 1, keywords: ['reformist', 'green movement', 'iranian reformist'] },
    ];

    // Ideological indicators
    const ideologyPatterns: Array<{ label: string; keywords: string[]; economic: number; social: number; auth: number }> = [
      { label: 'Conservative', keywords: ['conservative', 'right-wing', 'traditional values', 'pro-business', 'free market conservative'], economic: 60, social: 50, auth: 20 },
      { label: 'Liberal', keywords: ['liberal', 'progressive', 'left-leaning', 'social justice'], economic: -40, social: -50, auth: -20 },
      { label: 'Libertarian', keywords: ['libertarian', 'small government', 'free market', 'individual liberty', 'anti-regulation'], economic: 80, social: -30, auth: -70 },
      { label: 'Socialist', keywords: ['socialist', 'democratic socialist', 'anti-capitalist', 'workers rights'], economic: -80, social: -40, auth: 10 },
      { label: 'Centrist', keywords: ['centrist', 'moderate', 'bipartisan', 'middle ground', 'pragmatic'], economic: 0, social: 0, auth: 0 },
      { label: 'Populist', keywords: ['populist', 'anti-establishment', 'drain the swamp', 'outsider'], economic: 20, social: 30, auth: 30 },
      { label: 'Nationalist', keywords: ['nationalist', 'patriot', 'america first', 'anti-globalist', 'national sovereignty'], economic: 40, social: 60, auth: 40 },
      { label: 'Pro-Capitalism', keywords: ['capitalist', 'entrepreneur', 'free enterprise', 'pro-business', 'wealth creation'], economic: 70, social: 20, auth: 0 },
      { label: 'Anti-Communist', keywords: ['anti-communist', 'anti-socialism', 'fled communism', 'escaped socialism', 'refugee from'], economic: 60, social: 30, auth: 0 },
    ];

    // Endorsement patterns
    const endorsementPatterns = [
      /(?:endorsed|supports?|backed|campaigned for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:for|in)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:endorsed|supported|backed)\s+(?:by\s+)?(?:him|her|them)/gi,
      /voted for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /supporter of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    ];

    // Analyze each search result
    for (const result of results) {
      const text = result.snippet.toLowerCase();
      const originalText = result.snippet;

      // Check party affiliations
      for (const { party, country, keywords, weight } of partyPatterns) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            const current = partySignals.get(party) || { count: 0, evidence: [], sources: [], weight: weight };
            current.count += weight; // Apply weight to count

            // Extract context around the keyword
            const idx = text.indexOf(keyword);
            const start = Math.max(0, idx - 50);
            const end = Math.min(text.length, idx + keyword.length + 100);
            const context = originalText.substring(start, end).trim();

            if (!current.evidence.includes(context) && current.evidence.length < 5) {
              current.evidence.push(context);
            }
            if (!current.sources.includes(result.url)) {
              current.sources.push(result.url);
            }
            partySignals.set(party, current);
          }
        }
      }

      // Check ideological signals
      for (const { label, keywords } of ideologyPatterns) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            const current = ideologySignals.get(label) || { count: 0, evidence: [] };
            current.count++;

            const idx = text.indexOf(keyword);
            const start = Math.max(0, idx - 30);
            const end = Math.min(text.length, idx + keyword.length + 70);
            const context = originalText.substring(start, end).trim();

            if (!current.evidence.includes(context) && current.evidence.length < 3) {
              current.evidence.push(context);
            }
            ideologySignals.set(label, current);
          }
        }
      }

      // Check for endorsements
      for (const pattern of endorsementPatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(originalText)) !== null) {
          const endorsed = match[1].trim();
          if (endorsed.length > 2 && endorsed.length < 50) {
            // Determine party from endorsement
            let party = 'Unknown';
            if (/trump|republican|gop/i.test(text)) party = 'Republican Party';
            if (/biden|democrat|dnc/i.test(text)) party = 'Democratic Party';

            endorsements.push({
              endorsed,
              party,
              date: result.date || 'Unknown',
              type: 'GAVE',
              source: result.url
            });
          }
        }
      }
    }

    // Calculate primary party affiliation
    const sortedParties = Array.from(partySignals.entries())
      .map(([party, data]) => ({
        party,
        ...data,
        score: data.count * (1 + data.sources.length * 0.2) // Weight by source diversity
      }))
      .sort((a, b) => b.score - a.score);

    // Calculate confidence based on evidence strength
    const calculateConfidence = (count: number, sourceCount: number, totalResults: number): number => {
      // Base confidence from mention frequency
      const frequencyScore = Math.min(count / totalResults, 1) * 40;
      // Source diversity bonus
      const diversityScore = Math.min(sourceCount / 5, 1) * 30;
      // Evidence quantity bonus
      const evidenceScore = Math.min(count / 10, 1) * 30;

      return Math.round(frequencyScore + diversityScore + evidenceScore);
    };

    // Build primary party affiliation
    let primaryParty: PartyAffiliation | null = null;
    const secondaryParties: PartyAffiliation[] = [];

    for (let i = 0; i < sortedParties.length && i < 3; i++) {
      const p = sortedParties[i];
      const confidence = calculateConfidence(p.count, p.sources.length, results.length);

      // Find country for this party
      const partyInfo = partyPatterns.find(pp => pp.party === p.party);

      const affiliation: PartyAffiliation = {
        partyName: p.party,
        country: partyInfo?.country || 'Unknown',
        affiliation: confidence > 60 ? 'SUPPORTER' : 'ALIGNED',
        current: true,
        confidence,
        evidenceCount: p.count,
        evidenceSummary: p.evidence.slice(0, 3),
        sources: p.sources
      };

      if (i === 0 && confidence >= 20) {
        primaryParty = affiliation;
      } else if (confidence >= 15) {
        secondaryParties.push(affiliation);
      }
    }

    // Build ideology profile
    const sortedIdeology = Array.from(ideologySignals.entries())
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.count - a.count);

    // Calculate ideology axes from signals
    let economicSum = 0, socialSum = 0, authSum = 0, totalWeight = 0;
    const ideologyLabels: IdeologyLabel[] = [];

    for (const ideo of sortedIdeology) {
      const pattern = ideologyPatterns.find(p => p.label === ideo.label);
      if (pattern) {
        const weight = ideo.count;
        economicSum += pattern.economic * weight;
        socialSum += pattern.social * weight;
        authSum += pattern.auth * weight;
        totalWeight += weight;

        const confidence = Math.min(Math.round(ideo.count / results.length * 100 * 2), 95);
        ideologyLabels.push({
          label: ideo.label,
          confidence,
          evidence: ideo.evidence
        });
      }
    }

    const ideology: IdeologyProfile = {
      primaryLabel: sortedIdeology[0]?.label || 'Unknown',
      confidence: sortedIdeology[0] ? Math.min(Math.round(sortedIdeology[0].count / results.length * 100 * 2), 95) : 0,
      economicAxis: totalWeight > 0 ? Math.round(economicSum / totalWeight) : 0,
      socialAxis: totalWeight > 0 ? Math.round(socialSum / totalWeight) : 0,
      authoritarianAxis: totalWeight > 0 ? Math.round(authSum / totalWeight) : 0,
      labels: ideologyLabels.slice(0, 5)
    };

    // Calculate overall confidence
    const overallConfidence = Math.round(
      (primaryParty?.confidence || 0) * 0.5 +
      ideology.confidence * 0.3 +
      Math.min(endorsements.length * 10, 20)
    );

    return {
      primaryParty,
      secondaryParties,
      ideology,
      endorsements: endorsements.slice(0, 10),
      donations: [],
      overallConfidence: Math.min(overallConfidence, 95)
    };
  }
}
