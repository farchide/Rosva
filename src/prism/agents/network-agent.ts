/**
 * PRISM Network Research Agent
 *
 * Maps relationship networks including:
 * - Advisors and inner circle
 * - Professional associations
 * - Political alliances
 * - Opposition relationships
 * - Coalition membership
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import {
  AdvisorNetwork,
  Advisor,
  OrganizationAffiliation,
  OppositionMap,
  OppositionActor,
  Coalition,
  Entity,
  Relationship,
  RelationshipType
} from '../core/types';

export interface NetworkResult {
  advisors: AdvisorNetwork;
  organizations: OrganizationAffiliation[];
  oppositionMap?: OppositionMap;
  entities: Entity[];
  relationships: Relationship[];
}

export class NetworkAgent extends BaseAgent {
  constructor(config: AgentConfig = {}) {
    super('NetworkAgent', config);
  }

  async research(subject: string, context?: Record<string, any>): Promise<NetworkResult> {
    const advisors: AdvisorNetwork = {
      advisors: [],
      innerCircle: [],
      knownAssociates: []
    };

    const organizations: OrganizationAffiliation[] = [];
    const entities: Entity[] = [];
    const relationships: Relationship[] = [];

    return { advisors, organizations, entities, relationships };
  }

  /**
   * Parse advisors from search results
   */
  parseAdvisors(results: SearchResult[], subject: string): Advisor[] {
    const advisors: Advisor[] = [];
    const seen = new Set<string>();

    const advisorPatterns = [
      { pattern: /(?:senior\s+)?advisor[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, role: 'Senior Advisor' },
      { pattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)[,\s]+(?:his|her)\s+(?:senior\s+)?advisor/gi, role: 'Senior Advisor' },
      { pattern: /advised\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, role: 'Advisor' },
      { pattern: /(?:chief\s+)?strategist[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, role: 'Chief Strategist' },
      { pattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)[,\s]+(?:who\s+)?(?:serves\s+as|is)\s+(?:his|her)\s+advisor/gi, role: 'Advisor' },
      { pattern: /inner\s+circle[^.]*?(?:includes?|comprises?)[^.]*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, role: 'Inner Circle' },
      { pattern: /close\s+(?:associate|ally)[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi, role: 'Close Associate' }
    ];

    for (const result of results) {
      for (const { pattern, role } of advisorPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1].trim();
          if (!seen.has(name) && name !== subject && name.split(' ').length >= 2) {
            seen.add(name);

            // Try to find organization affiliation
            const orgMatch = result.snippet.match(new RegExp(`${name}[^.]*?(?:of|at|from)\\s+(?:the\\s+)?([A-Z][a-zA-Z\\s]+(?:Foundation|Institute|Organization|Democracies))`, 'i'));

            advisors.push({
              entityId: `person_${name.toLowerCase().replace(/\s+/g, '_')}`,
              name,
              role,
              organization: orgMatch ? orgMatch[1].trim() : undefined,
              current: !result.snippet.toLowerCase().includes('former'),
              publiclyKnown: true,
              influence: role.toLowerCase().includes('senior') || role.toLowerCase().includes('chief') ? 'HIGH' : 'MEDIUM',
              sources: [result.url]
            });
          }
        }
      }
    }

    return advisors;
  }

  /**
   * Parse organizations from search results
   */
  parseOrganizations(results: SearchResult[], subject: string): OrganizationAffiliation[] {
    const orgs: OrganizationAffiliation[] = [];
    const seen = new Set<string>();

    const orgPatterns = [
      { pattern: /(?:founded|launched|established|created)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Project|Foundation|Institute|Organization|Association|Alliance|Coalition|Movement|Party|Council))/gi, role: 'Founder' },
      { pattern: /(?:leads?|heads?|chairs?)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Project|Foundation|Institute|Organization|Party))/gi, role: 'Leader' },
      { pattern: /(?:member|part)\s+of\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Alliance|Coalition|Council|Committee))/gi, role: 'Member' },
      { pattern: /([A-Z][a-zA-Z\s]+(?:Project|Foundation|Institute|Organization))[,\s]+(?:which\s+)?(?:he|she)\s+(?:founded|established|created)/gi, role: 'Founder' }
    ];

    for (const result of results) {
      for (const { pattern, role } of orgPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1].trim();
          if (!seen.has(name) && name.length > 5) {
            seen.add(name);

            // Determine status
            const isActive = result.snippet.toLowerCase().includes('active') ||
                            !result.snippet.toLowerCase().includes('dissolved') &&
                            !result.snippet.toLowerCase().includes('disbanded');

            // Extract year if present
            const yearMatch = result.snippet.match(/(?:founded|established|launched|created)\s+(?:in\s+)?(\d{4})/i);

            orgs.push({
              organizationId: `org_${name.toLowerCase().replace(/\s+/g, '_')}`,
              name,
              type: this.inferOrgType(name),
              role,
              startDate: yearMatch ? yearMatch[1] : undefined,
              current: isActive,
              description: '',
              status: isActive ? 'ACTIVE' : 'UNKNOWN',
              sources: [result.url]
            });
          }
        }
      }
    }

    return orgs;
  }

  /**
   * Parse opposition actors from search results
   */
  parseOpposition(results: SearchResult[], subject: string): { allies: OppositionActor[], critics: OppositionActor[] } {
    const allies: OppositionActor[] = [];
    const critics: OppositionActor[] = [];
    const seenAllies = new Set<string>();
    const seenCritics = new Set<string>();

    const allyPatterns = [
      /(?:allied|aligned)\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)[,\s]+(?:who\s+)?(?:supports?|backs?|endorses?)/gi,
      /coalition\s+(?:with|including)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /signed\s+(?:agreement|charter|alliance)\s+with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi
    ];

    const criticPatterns = [
      /criticized\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:criticized|opposed|rejected|denounced)/gi,
      /(?:opposition|rival)\s+(?:from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:refuses?|declined?)\s+to\s+(?:join|support)/gi
    ];

    for (const result of results) {
      // Find allies
      for (const pattern of allyPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1].trim();
          if (!seenAllies.has(name) && name !== subject && name.split(' ').length >= 2) {
            seenAllies.add(name);
            allies.push({
              entityId: `entity_${name.toLowerCase().replace(/\s+/g, '_')}`,
              name,
              type: 'PERSON',
              relationship: 'ALLY',
              sources: [result.url]
            });
          }
        }
      }

      // Find critics
      for (const pattern of criticPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1].trim();
          if (!seenCritics.has(name) && name !== subject && name.split(' ').length >= 2) {
            seenCritics.add(name);
            critics.push({
              entityId: `entity_${name.toLowerCase().replace(/\s+/g, '_')}`,
              name,
              type: 'PERSON',
              relationship: 'CRITIC',
              sources: [result.url]
            });
          }
        }
      }
    }

    return { allies, critics };
  }

  /**
   * Parse coalitions from search results
   */
  parseCoalitions(results: SearchResult[]): Coalition[] {
    const coalitions: Coalition[] = [];
    const seen = new Set<string>();

    const coalitionPatterns = [
      /([A-Z][a-zA-Z\s]+(?:Alliance|Coalition|Convergence|Summit|Charter|Accord))/gi,
      /(?:signed|formed|joined)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+)/gi
    ];

    for (const result of results) {
      for (const pattern of coalitionPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const name = match[1].trim();
          if (!seen.has(name) && name.length > 5 &&
              (name.includes('Alliance') || name.includes('Coalition') ||
               name.includes('Charter') || name.includes('Summit'))) {
            seen.add(name);

            // Extract date
            const dateMatch = result.snippet.match(/(\d{4})/);

            // Try to extract members
            const memberMatch = result.snippet.match(/(?:members?|participants?|signatories)[^.]*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+(?:[,\s]+(?:and\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)*)/i);
            const members = memberMatch ? memberMatch[1].split(/[,\s]+(?:and\s+)?/).map(m => m.trim()) : [];

            coalitions.push({
              name,
              formed: dateMatch ? dateMatch[1] : 'Unknown',
              members,
              purpose: '',
              status: result.snippet.toLowerCase().includes('dissolved') || result.snippet.toLowerCase().includes('collapsed') ? 'DISSOLVED' : 'ACTIVE',
              sources: [result.url]
            });
          }
        }
      }
    }

    return coalitions;
  }

  /**
   * Build entity from parsed data
   */
  createEntity(
    name: string,
    type: string,
    attributes: Record<string, any> = {},
    sources: string[] = []
  ): Entity {
    return {
      id: `${type.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      type: type as any,
      aliases: [],
      attributes,
      confidence: 0.8,
      sources: sources.map(url => this.createSource(this.extractDomain(url), 'SECONDARY', this.assessReliability(url), url)),
      firstSeen: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Create relationship between entities
   */
  createRelationship(
    from: string,
    to: string,
    type: RelationshipType,
    weight: number = 0.7,
    evidence?: string
  ): Relationship {
    return {
      id: `rel_${from}_${type}_${to}`,
      type,
      from,
      to,
      weight,
      bidirectional: false,
      evidence: evidence ? [{
        sourceId: 'unknown',
        summary: evidence,
        date: new Date(),
        confidence: 0.7,
        verificationStatus: 'UNVERIFIED'
      }] : [],
      confidence: weight
    };
  }

  /**
   * Infer organization type from name
   */
  private inferOrgType(name: string): any {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('foundation')) return 'NGO';
    if (lowerName.includes('institute') || lowerName.includes('think tank')) return 'THINK_TANK';
    if (lowerName.includes('party')) return 'POLITICAL_PARTY';
    if (lowerName.includes('alliance') || lowerName.includes('coalition')) return 'COALITION';
    if (lowerName.includes('government') || lowerName.includes('ministry')) return 'GOVERNMENT';
    if (lowerName.includes('media') || lowerName.includes('news')) return 'MEDIA_OUTLET';
    if (lowerName.includes('university') || lowerName.includes('college')) return 'EDUCATIONAL_INSTITUTION';
    return 'ORGANIZATION';
  }
}
