/**
 * PRISM Research Orchestrator
 *
 * Central coordinator for all research agents.
 * Manages the research pipeline and aggregates results.
 */

import { BiographyAgent } from '../agents/biography-agent';
import { NetworkAgent } from '../agents/network-agent';
import { PoliticalAgent } from '../agents/political-agent';
import { FundingMediaAgent } from '../agents/funding-agent';
import { SocialMediaAgent, SocialMediaResult } from '../agents/social-media-agent';
import { OutlierDetector, createPatternProfile, AnalysisContent } from '../analysis/outlier-detector';
import {
  PersonProfile,
  Entity,
  Relationship,
  Source,
  ResearchReport,
  NetworkMetrics,
  TimelineEvent,
  SocialMediaAnalysis,
  OutlierAnalysis
} from './types';

export interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface OrchestratorConfig {
  searchProvider?: SearchProvider;
  maxSearches?: number;
  depth?: 'QUICK' | 'STANDARD' | 'DEEP' | 'EXHAUSTIVE';
  includeControversies?: boolean;
  includeFunding?: boolean;
  includeOpposition?: boolean;
}

export class PRISMOrchestrator {
  private config: OrchestratorConfig;
  private biographyAgent: BiographyAgent;
  private networkAgent: NetworkAgent;
  private politicalAgent: PoliticalAgent;
  private fundingMediaAgent: FundingMediaAgent;
  private socialMediaAgent: SocialMediaAgent;
  private outlierDetector: OutlierDetector;

  private entities: Map<string, Entity> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private sources: Map<string, Source> = new Map();
  private searchResults: SearchResult[] = [];

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxSearches: config.maxSearches || 50,
      depth: config.depth || 'STANDARD',
      includeControversies: config.includeControversies ?? true,
      includeFunding: config.includeFunding ?? true,
      includeOpposition: config.includeOpposition ?? true,
      ...config
    };

    this.biographyAgent = new BiographyAgent();
    this.networkAgent = new NetworkAgent();
    this.politicalAgent = new PoliticalAgent();
    this.fundingMediaAgent = new FundingMediaAgent();
    this.socialMediaAgent = new SocialMediaAgent();
    this.outlierDetector = new OutlierDetector();
  }

  /**
   * Main research entry point
   */
  async research(subject: string, searchResults: SearchResult[]): Promise<ResearchReport> {
    console.log(`\n🔍 PRISM: Initiating research on "${subject}"...\n`);

    this.searchResults = searchResults;
    this.reset();

    // Create subject entity
    const subjectEntity = this.createSubjectEntity(subject);
    this.entities.set(subjectEntity.id, subjectEntity);

    // Phase 1: Biography & Family
    console.log('📋 Phase 1: Extracting biography and family network...');
    const bioResults = this.extractBiography(searchResults, subject);

    // Phase 2: Organizations & Advisors
    console.log('🏢 Phase 2: Mapping organizations and advisor network...');
    const networkResults = this.extractNetwork(searchResults, subject);

    // Phase 3: Political Analysis
    console.log('🏛️ Phase 3: Analyzing political positions and foreign relations...');
    const politicalResults = this.extractPolitical(searchResults, subject);

    // Phase 3b: Political Affiliation Detection
    console.log('🗳️ Phase 3b: Detecting political party affiliation...');
    const politicalAffiliation = this.politicalAgent.parsePoliticalAffiliation(searchResults, subject);

    // Phase 4: Funding & Media
    if (this.config.includeFunding) {
      console.log('💰 Phase 4: Investigating funding and media presence...');
      const fundingResults = this.extractFundingMedia(searchResults, subject);
    }

    // Phase 5: Social Media Analysis
    console.log('📱 Phase 5: Analyzing social media presence (X, Instagram, YouTube)...');
    const socialMediaResults = this.socialMediaAgent.analyzeFromSearchResults(searchResults, subject);

    // Phase 6: Build Timeline
    console.log('📅 Phase 6: Constructing chronological timeline...');
    const timeline = this.buildTimeline(searchResults, subject);

    // Phase 7: Calculate Metrics
    console.log('📊 Phase 7: Computing network metrics...');
    const metrics = this.calculateMetrics();

    // Phase 8: Outlier Detection
    console.log('🔍 Phase 8: Detecting narrative outliers and contradictions...');
    const outlierAnalysis = this.detectOutliers(subject, politicalAffiliation, socialMediaResults, searchResults);

    // Build final profile
    const profile = this.buildProfile(subject, bioResults, networkResults, politicalResults, timeline, politicalAffiliation, socialMediaResults, outlierAnalysis);

    // Generate report
    const report: ResearchReport = {
      subject,
      generatedAt: new Date(),
      profile,
      graph: {
        entities: Array.from(this.entities.values()),
        relationships: Array.from(this.relationships.values())
      },
      metrics,
      sources: Array.from(this.sources.values()),
      methodology: 'Open-source intelligence (OSINT) analysis using publicly available data. All claims are source-anchored.',
      limitations: [
        'Limited to publicly available information',
        'Some sources may have bias',
        'Historical data may be incomplete',
        'Relationships inferred from co-occurrence may not indicate direct connection'
      ],
      exportFormats: ['JSON', 'GraphML', 'Mermaid', 'Neo4j Cypher', 'CSV']
    };

    console.log(`\n✅ Research complete: ${this.entities.size} entities, ${this.relationships.size} relationships\n`);

    return report;
  }

  /**
   * Create the main subject entity
   */
  private createSubjectEntity(subject: string): Entity {
    return {
      id: `person_${subject.toLowerCase().replace(/\s+/g, '_')}`,
      name: subject,
      type: 'PERSON',
      aliases: [],
      attributes: {},
      confidence: 1.0,
      sources: [],
      firstSeen: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Extract biography information
   */
  private extractBiography(results: SearchResult[], subject: string): any {
    const bio = this.biographyAgent.parseBiography(results);
    const family = this.biographyAgent.parseFamilyMembers(results, subject);
    const education = this.biographyAgent.parseEducation(results);
    const career = this.biographyAgent.parseCareer(results, subject);

    // Add family members as entities
    for (const member of family) {
      const entity = this.networkAgent.createEntity(member.name, 'PERSON', {
        relationship: member.relationship,
        status: member.status
      }, member.sources);

      this.entities.set(entity.id, entity);

      // Create family relationship
      const relType = this.inferFamilyRelationType(member.relationship);
      const rel = this.networkAgent.createRelationship(
        `person_${subject.toLowerCase().replace(/\s+/g, '_')}`,
        entity.id,
        relType,
        1.0,
        `${member.relationship} of ${subject}`
      );
      this.relationships.set(rel.id, rel);
    }

    // Add educational institutions
    for (const edu of education) {
      const entity = this.networkAgent.createEntity(edu.institution, 'EDUCATIONAL_INSTITUTION', {
        degree: edu.degree,
        field: edu.field
      }, edu.sources);

      this.entities.set(entity.id, entity);

      const rel = this.networkAgent.createRelationship(
        `person_${subject.toLowerCase().replace(/\s+/g, '_')}`,
        entity.id,
        'EDUCATED_AT',
        0.9,
        `${edu.degree || 'Studied'} ${edu.field || ''} at ${edu.institution}`
      );
      this.relationships.set(rel.id, rel);
    }

    return { bio, family, education, career };
  }

  /**
   * Extract network information
   */
  private extractNetwork(results: SearchResult[], subject: string): any {
    const advisors = this.networkAgent.parseAdvisors(results, subject);
    const organizations = this.networkAgent.parseOrganizations(results, subject);
    const { allies, critics } = this.networkAgent.parseOpposition(results, subject);
    const coalitions = this.networkAgent.parseCoalitions(results);

    const subjectId = `person_${subject.toLowerCase().replace(/\s+/g, '_')}`;

    // Add advisors
    for (const advisor of advisors) {
      const entity = this.networkAgent.createEntity(advisor.name, 'PERSON', {
        role: advisor.role,
        organization: advisor.organization,
        influence: advisor.influence
      }, advisor.sources);

      this.entities.set(entity.id, entity);

      const rel = this.networkAgent.createRelationship(
        subjectId,
        entity.id,
        'ADVISED_BY',
        advisor.influence === 'HIGH' ? 0.95 : 0.7,
        `${advisor.role}: ${advisor.name}`
      );
      this.relationships.set(rel.id, rel);
    }

    // Add organizations
    for (const org of organizations) {
      const entity = this.networkAgent.createEntity(org.name, org.type, {
        role: org.role,
        status: org.status,
        founded: org.startDate
      }, org.sources);

      this.entities.set(entity.id, entity);

      const relType = org.role.toLowerCase().includes('founder') ? 'FOUNDED' :
                      org.role.toLowerCase().includes('member') ? 'MEMBER_OF' : 'AFFILIATED_WITH';

      const rel = this.networkAgent.createRelationship(
        subjectId,
        entity.id,
        relType,
        0.85,
        `${org.role} of ${org.name}`
      );
      this.relationships.set(rel.id, rel);
    }

    // Add allies
    for (const ally of allies) {
      if (!this.entities.has(ally.entityId)) {
        const entity = this.networkAgent.createEntity(ally.name, ally.type, {}, ally.sources);
        this.entities.set(entity.id, entity);
      }

      const rel = this.networkAgent.createRelationship(
        subjectId,
        ally.entityId,
        'ALLIED_WITH',
        0.7,
        `Political ally`
      );
      this.relationships.set(rel.id, rel);
    }

    // Add critics
    for (const critic of critics) {
      if (!this.entities.has(critic.entityId)) {
        const entity = this.networkAgent.createEntity(critic.name, critic.type, {}, critic.sources);
        this.entities.set(entity.id, entity);
      }

      const rel = this.networkAgent.createRelationship(
        critic.entityId,
        subjectId,
        'CRITICIZES',
        0.6,
        `Critic of ${subject}`
      );
      this.relationships.set(rel.id, rel);
    }

    return { advisors, organizations, allies, critics, coalitions };
  }

  /**
   * Extract political information
   */
  private extractPolitical(results: SearchResult[], subject: string): any {
    const positions = this.politicalAgent.parsePositions(results, subject);
    const foreignRelations = this.politicalAgent.parseForeignRelations(results, subject);
    const controversies = this.politicalAgent.parseControversies(results, subject);

    const subjectId = `person_${subject.toLowerCase().replace(/\s+/g, '_')}`;

    // Add foreign relations as entities and relationships
    for (const fr of foreignRelations) {
      // Add country
      const countryId = `country_${fr.country.toLowerCase().replace(/\s+/g, '_')}`;
      if (!this.entities.has(countryId)) {
        const countryEntity = this.networkAgent.createEntity(fr.country, 'COUNTRY', {}, fr.sources);
        this.entities.set(countryEntity.id, countryEntity);
      }

      // Add foreign entity if different from country
      if (fr.entity !== fr.country) {
        const entityId = `entity_${fr.entity.toLowerCase().replace(/\s+/g, '_')}`;
        if (!this.entities.has(entityId)) {
          const entity = this.networkAgent.createEntity(fr.entity, fr.entityType === 'OFFICIAL' ? 'PERSON' : 'ORGANIZATION', {
            country: fr.country,
            type: fr.entityType
          }, fr.sources);
          this.entities.set(entity.id, entity);
        }

        const relType = fr.relationType === 'MEETING' ? 'MET_WITH' :
                        fr.relationType === 'ENDORSEMENT' ? 'ENDORSED_BY' :
                        fr.relationType === 'ALLIANCE' ? 'ALLIED_WITH' :
                        fr.relationType === 'FUNDING' ? 'FUNDED_BY' : 'ASSOCIATED_WITH';

        const rel = this.networkAgent.createRelationship(
          subjectId,
          entityId,
          relType,
          fr.significance === 'HIGH' ? 0.9 : 0.7,
          fr.description
        );
        this.relationships.set(rel.id, rel);
      }
    }

    return { positions, foreignRelations, controversies };
  }

  /**
   * Extract funding and media information
   */
  private extractFundingMedia(results: SearchResult[], subject: string): any {
    const fundingSources = this.fundingMediaAgent.parseFundingSources(results, subject);
    const socialAccounts = this.fundingMediaAgent.parseSocialAccounts(results, subject);
    const mediaAppearances = this.fundingMediaAgent.parseMediaAppearances(results, subject);
    const amplificationNetwork = this.fundingMediaAgent.parseAmplificationNetwork(results, subject);
    const digitalCampaigns = this.fundingMediaAgent.parseDigitalCampaigns(results, subject);

    const subjectId = `person_${subject.toLowerCase().replace(/\s+/g, '_')}`;

    // Add funding sources as relationships
    for (const fs of fundingSources) {
      if (fs.sourceType === 'GOVERNMENT' || fs.sourceType === 'FOUNDATION') {
        const entityId = `funder_${fs.source.toLowerCase().replace(/\s+/g, '_')}`;
        const entity = this.networkAgent.createEntity(fs.source, fs.sourceType === 'GOVERNMENT' ? 'GOVERNMENT' : 'ORGANIZATION', {
          amount: fs.amount,
          verified: fs.verified
        }, fs.sources);

        this.entities.set(entity.id, entity);

        const rel = this.networkAgent.createRelationship(
          entityId,
          subjectId,
          'FUNDS',
          fs.verified ? 0.9 : 0.5,
          `Funding source: ${fs.source}`
        );
        this.relationships.set(rel.id, rel);
      }
    }

    // Add amplification nodes
    for (const node of amplificationNetwork) {
      const entity = this.networkAgent.createEntity(node.name, node.type === 'MEDIA' ? 'MEDIA_OUTLET' : 'ORGANIZATION', {
        amplifierType: node.type
      }, node.sources);

      this.entities.set(entity.id, entity);

      const rel = this.networkAgent.createRelationship(
        entity.id,
        subjectId,
        'AMPLIFIED_BY',
        0.6,
        node.relationship
      );
      this.relationships.set(rel.id, rel);
    }

    return { fundingSources, socialAccounts, mediaAppearances, amplificationNetwork, digitalCampaigns };
  }

  /**
   * Build chronological timeline
   */
  private buildTimeline(results: SearchResult[], subject: string): TimelineEvent[] {
    const events = this.politicalAgent.parseTimeline(results, subject);

    // Sort by date
    events.sort((a, b) => {
      const dateA = a.date.replace(/[^\d]/g, '');
      const dateB = b.date.replace(/[^\d]/g, '');
      return dateA.localeCompare(dateB);
    });

    return events;
  }

  /**
   * Calculate network metrics
   */
  private calculateMetrics(): NetworkMetrics {
    const nodes = this.entities.size;
    const edges = this.relationships.size;
    const maxEdges = nodes * (nodes - 1);
    const density = maxEdges > 0 ? edges / maxEdges : 0;

    // Calculate degree centrality
    const degree = new Map<string, number>();
    for (const [id] of this.entities) {
      let count = 0;
      for (const rel of this.relationships.values()) {
        if (rel.from === id || rel.to === id) count++;
      }
      degree.set(id, count);
    }

    // Simple PageRank approximation
    const pageRank = new Map<string, number>();
    const dampingFactor = 0.85;
    const iterations = 20;

    // Initialize
    for (const [id] of this.entities) {
      pageRank.set(id, 1 / nodes);
    }

    // Iterate
    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map<string, number>();

      for (const [id] of this.entities) {
        let rank = (1 - dampingFactor) / nodes;

        for (const rel of this.relationships.values()) {
          if (rel.to === id) {
            const fromDegree = degree.get(rel.from) || 1;
            rank += dampingFactor * (pageRank.get(rel.from) || 0) / fromDegree;
          }
        }

        newRanks.set(id, rank);
      }

      for (const [id, rank] of newRanks) {
        pageRank.set(id, rank);
      }
    }

    // Find connected components (simplified)
    const visited = new Set<string>();
    let components = 0;

    for (const [id] of this.entities) {
      if (!visited.has(id)) {
        components++;
        this.dfs(id, visited);
      }
    }

    return {
      totalNodes: nodes,
      totalEdges: edges,
      density,
      components,
      centralityScores: {
        pageRank,
        betweenness: new Map(),
        degree,
        eigenvector: new Map()
      },
      communities: [],
      keyInfluencers: this.findKeyInfluencers(pageRank, 5),
      bridges: []
    };
  }

  /**
   * DFS for component finding
   */
  private dfs(id: string, visited: Set<string>): void {
    visited.add(id);

    for (const rel of this.relationships.values()) {
      if (rel.from === id && !visited.has(rel.to)) {
        this.dfs(rel.to, visited);
      }
      if (rel.to === id && !visited.has(rel.from)) {
        this.dfs(rel.from, visited);
      }
    }
  }

  /**
   * Find top influencers by PageRank
   */
  private findKeyInfluencers(pageRank: Map<string, number>, n: number): string[] {
    return Array.from(pageRank.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([id]) => id);
  }

  /**
   * Detect narrative outliers and contradictions
   */
  private detectOutliers(
    subject: string,
    politicalAffiliation: any,
    socialMediaResults: SocialMediaResult | undefined,
    searchResults: SearchResult[]
  ): OutlierAnalysis {
    // Determine primary stances from analysis
    const iranStance = politicalAffiliation?.primaryParty?.country === 'Iran'
      ? (politicalAffiliation.primaryParty.partyName.toLowerCase().includes('regime') ? 'PRO_REGIME' : 'PRO_OPPOSITION')
      : socialMediaResults?.iranStance?.stance === 'Pro-Opposition' ? 'PRO_OPPOSITION'
      : socialMediaResults?.iranStance?.stance === 'Pro-Regime' ? 'PRO_REGIME'
      : 'UNKNOWN';

    const politicalLeaning = politicalAffiliation?.secondaryParties?.find((p: any) => p.country === 'USA')?.partyName
      || socialMediaResults?.politicalSummary?.primaryLeaning
      || 'Unknown';

    // Create pattern profile
    const pattern = createPatternProfile(
      iranStance as 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN',
      politicalLeaning
    );

    // Gather content for analysis
    const content: AnalysisContent = {
      tweets: searchResults.map(r => ({ text: r.snippet, date: r.date })),
      hashtags: this.extractHashtags(searchResults),
      mentions: this.extractMentions(searchResults),
      connections: socialMediaResults?.xAnalysis?.notableConnections?.map(c => ({
        username: c.username,
        type: c.connectionType
      })) || []
    };

    // Run outlier detection
    const result = this.outlierDetector.analyze(subject, pattern, content);

    // Convert to our type format
    return {
      totalOutliers: result.totalOutliers,
      criticalOutliers: result.criticalOutliers,
      consistencyScore: result.consistencyScore,
      iranStanceConsistency: result.iranStanceConsistency,
      politicalConsistency: result.politicalConsistency,
      outliers: result.outliers.map(o => ({
        id: o.id,
        type: o.type,
        severity: o.severity,
        category: o.category,
        description: o.description,
        expectedBehavior: o.expectedBehavior,
        actualBehavior: o.actualBehavior,
        evidence: o.evidence[0]?.content || '',
        date: o.date,
        source: o.source,
        confidence: o.confidence,
        possibleExplanations: o.possibleExplanations
      })),
      redFlags: result.redFlags,
      narrativeSummary: result.narrativeSummary
    };
  }

  /**
   * Extract hashtags from search results
   */
  private extractHashtags(results: SearchResult[]): string[] {
    const hashtags: string[] = [];
    const pattern = /#([A-Za-z0-9_]+)/g;

    for (const result of results) {
      let match;
      while ((match = pattern.exec(result.snippet)) !== null) {
        hashtags.push(match[1]);
      }
    }

    return hashtags;
  }

  /**
   * Extract @mentions from search results
   */
  private extractMentions(results: SearchResult[]): string[] {
    const mentions: string[] = [];
    const pattern = /@([A-Za-z0-9_]+)/g;

    for (const result of results) {
      let match;
      while ((match = pattern.exec(result.snippet)) !== null) {
        mentions.push(match[1]);
      }
    }

    return mentions;
  }

  /**
   * Build final profile
   */
  private buildProfile(
    subject: string,
    bioResults: any,
    networkResults: any,
    politicalResults: any,
    timeline: TimelineEvent[],
    politicalAffiliation?: any,
    socialMediaResults?: SocialMediaResult,
    outlierAnalysis?: OutlierAnalysis
  ): PersonProfile {
    const subjectEntity = this.entities.get(`person_${subject.toLowerCase().replace(/\s+/g, '_')}`)!;

    // Convert social media results to our type structure
    const socialMediaAnalysis: SocialMediaAnalysis | undefined = socialMediaResults ? {
      profiles: socialMediaResults.profiles.map(p => ({
        platform: p.platform,
        username: p.username,
        displayName: p.displayName,
        url: p.url,
        verified: p.verified,
        followerCount: p.followerCount,
        followingCount: p.followingCount,
        postCount: p.postCount,
        bio: p.bio,
        joinDate: p.joinDate
      })),
      primaryPlatform: socialMediaResults.primaryPlatform,
      overallInfluence: socialMediaResults.overallInfluence,
      xAnalysis: socialMediaResults.xAnalysis ? {
        profileFound: !!socialMediaResults.xAnalysis.profile,
        username: socialMediaResults.xAnalysis.profile?.username,
        verified: socialMediaResults.xAnalysis.profile?.verified || false,
        followerCount: socialMediaResults.xAnalysis.profile?.followerCount || 0,
        influenceScore: socialMediaResults.xAnalysis.influence.influenceScore,
        engagementRate: socialMediaResults.xAnalysis.engagement.engagementRate,
        notableConnections: socialMediaResults.xAnalysis.notableConnections.map(c => ({
          username: c.username,
          displayName: c.displayName,
          category: c.category || 'Unknown',
          verified: c.verified
        })),
        politicalIndicators: {
          detectedLeanings: socialMediaResults.xAnalysis.politicalIndicators.politicalHashtags.map(h => ({
            leaning: h.leaning,
            confidence: Math.min(100, h.count * 20)
          })),
          topPoliticalHashtags: socialMediaResults.xAnalysis.politicalIndicators.politicalHashtags.slice(0, 10),
          politicalTopics: socialMediaResults.xAnalysis.politicalIndicators.politicalTopics
        },
        iranActivity: {
          iranRelatedTweets: socialMediaResults.xAnalysis.iranRelatedActivity.iranRelatedTweets,
          stance: socialMediaResults.xAnalysis.iranRelatedActivity.stance,
          confidence: socialMediaResults.xAnalysis.iranRelatedActivity.confidence,
          oppositionHashtags: socialMediaResults.xAnalysis.iranRelatedActivity.oppositionHashtags,
          oppositionMentions: socialMediaResults.xAnalysis.iranRelatedActivity.oppositionMentions,
          evidence: socialMediaResults.xAnalysis.iranRelatedActivity.evidence
        }
      } : null,
      politicalSummary: socialMediaResults.politicalSummary,
      iranStance: socialMediaResults.iranStance
    } : undefined;

    return {
      entity: subjectEntity,
      biography: {
        fullName: subject,
        ...bioResults.bio,
        nationality: bioResults.bio?.nationality || [],
        occupation: bioResults.bio?.occupation || [],
        titles: bioResults.bio?.titles || [],
        summary: ''
      },
      family: {
        members: bioResults.family || []
      },
      career: {
        positions: bioResults.career || [],
        industries: []
      },
      education: {
        institutions: bioResults.education || [],
        degrees: [],
        fields: []
      },
      organizations: networkResults.organizations || [],
      advisors: {
        advisors: networkResults.advisors || [],
        innerCircle: [],
        knownAssociates: []
      },
      positions: politicalResults.positions || [],
      foreignRelations: politicalResults.foreignRelations || [],
      mediaPresence: {
        socialAccounts: socialMediaResults?.profiles.map(p => ({
          platform: p.platform,
          handle: p.username,
          url: p.url,
          followers: p.followerCount,
          verified: p.verified,
          active: true
        })) || [],
        mediaAppearances: [],
        socialMediaAnalysis
      },
      funding: {
        knownSources: [],
        financialDisclosures: [],
        controversies: [],
        transparency: 'OPAQUE'
      },
      controversies: politicalResults.controversies || [],
      timeline,
      oppositionMap: networkResults.coalitions ? {
        subject,
        allies: networkResults.allies || [],
        critics: networkResults.critics || [],
        neutral: [],
        coalitions: networkResults.coalitions || [],
        ideologicalSpectrum: []
      } : undefined,
      politicalAffiliation: politicalAffiliation || undefined,
      outlierAnalysis: outlierAnalysis || undefined
    };
  }

  /**
   * Infer family relationship type
   */
  private inferFamilyRelationType(relationship: string): any {
    const lower = relationship.toLowerCase();
    if (lower.includes('father') || lower.includes('mother') || lower.includes('parent')) return 'CHILD_OF';
    if (lower.includes('son') || lower.includes('daughter') || lower.includes('child')) return 'PARENT_OF';
    if (lower.includes('brother') || lower.includes('sister') || lower.includes('sibling')) return 'SIBLING_OF';
    if (lower.includes('wife') || lower.includes('husband') || lower.includes('spouse')) return 'SPOUSE_OF';
    return 'RELATIVE_OF';
  }

  /**
   * Reset state
   */
  private reset(): void {
    this.entities.clear();
    this.relationships.clear();
    this.sources.clear();
  }
}
