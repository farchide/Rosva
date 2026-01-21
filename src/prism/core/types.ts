/**
 * PRISM Core Types
 *
 * Type definitions for the PRISM intelligence research engine.
 * All data structures for entities, relationships, evidence, and analysis.
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'COMPANY'
  | 'GOVERNMENT'
  | 'POLITICAL_PARTY'
  | 'THINK_TANK'
  | 'MEDIA_OUTLET'
  | 'NGO'
  | 'COALITION'
  | 'LOCATION'
  | 'COUNTRY'
  | 'EVENT'
  | 'DOCUMENT'
  | 'PUBLICATION'
  | 'SOCIAL_ACCOUNT'
  | 'DOMAIN'
  | 'FINANCIAL_ENTITY'
  | 'EDUCATIONAL_INSTITUTION';

export type RelationshipType =
  // Family
  | 'PARENT_OF' | 'CHILD_OF' | 'SIBLING_OF' | 'SPOUSE_OF' | 'RELATIVE_OF'
  // Professional
  | 'FOUNDED' | 'CEO_OF' | 'LEADS' | 'WORKS_AT' | 'WORKED_AT' | 'ADVISES' | 'ADVISED_BY'
  | 'MEMBER_OF' | 'BOARD_MEMBER_OF' | 'AFFILIATED_WITH'
  // Political
  | 'ALLIED_WITH' | 'OPPOSES' | 'ENDORSED_BY' | 'ENDORSES' | 'SUPPORTS' | 'SUPPORTED_BY'
  | 'CRITICIZED_BY' | 'CRITICIZES' | 'MET_WITH' | 'NEGOTIATED_WITH'
  // Financial
  | 'FUNDED_BY' | 'FUNDS' | 'INVESTED_IN' | 'DONATED_TO' | 'RECEIVED_FROM'
  // Media/Communication
  | 'INTERVIEWED_BY' | 'QUOTED_BY' | 'AMPLIFIED_BY' | 'PROMOTED_BY'
  // Educational
  | 'EDUCATED_AT' | 'STUDIED_UNDER' | 'TAUGHT_AT'
  // Location
  | 'LOCATED_IN' | 'BASED_IN' | 'BORN_IN' | 'RESIDES_IN' | 'OPERATES_IN'
  // Digital
  | 'OWNS_ACCOUNT' | 'CONTROLS_DOMAIN' | 'PUBLISHED_ON'
  // General
  | 'ASSOCIATED_WITH' | 'CONNECTED_TO' | 'LINKED_TO';

export type SourceReliability = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export type SourceType =
  | 'PRIMARY'      // Direct statements, official documents
  | 'SECONDARY'    // News reports, academic analysis
  | 'SOCIAL_MEDIA' // Social media posts
  | 'GOVERNMENT'   // Government records, filings
  | 'ACADEMIC'     // Academic papers, research
  | 'LEAKED'       // Leaked documents (requires verification)
  | 'SELF_REPORTED'; // Self-reported information

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  description?: string;
  attributes: Record<string, string | number | boolean | null>;
  confidence: number; // 0-1
  sources: Source[];
  firstSeen: Date;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  from: string; // Entity ID
  to: string;   // Entity ID
  weight: number; // 0-1 strength
  bidirectional: boolean;
  temporal?: {
    start?: Date;
    end?: Date;
    ongoing: boolean;
  };
  evidence: Evidence[];
  confidence: number;
  metadata?: Record<string, any>;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url?: string;
  reliability: SourceReliability;
  accessDate: Date;
  publicationDate?: Date;
  author?: string;
  archived?: boolean;
  archiveUrl?: string;
}

export interface Evidence {
  sourceId: string;
  quote?: string;
  summary: string;
  date: Date;
  confidence: number;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'DISPUTED' | 'FALSE';
}

// ============================================================================
// RESEARCH MODULE TYPES
// ============================================================================

export interface PersonProfile {
  entity: Entity;
  biography: Biography;
  family: FamilyNetwork;
  career: CareerHistory;
  education: EducationHistory;
  organizations: OrganizationAffiliation[];
  advisors: AdvisorNetwork;
  positions: PositionRecord[];
  foreignRelations: ForeignRelation[];
  mediaPresence: MediaPresence;
  funding: FundingProfile;
  controversies: Controversy[];
  timeline: TimelineEvent[];
  oppositionMap?: OppositionMap;
  politicalAffiliation?: PoliticalAffiliation;
  outlierAnalysis?: OutlierAnalysis;
}

// ============================================================================
// POLITICAL AFFILIATION
// ============================================================================

export interface PoliticalAffiliation {
  primaryParty: PartyAffiliation | null;
  secondaryParties: PartyAffiliation[];
  ideology: IdeologyProfile;
  votingRecord?: VotingPattern[];
  endorsements: PoliticalEndorsement[];
  donations: PoliticalDonation[];
  overallConfidence: number; // 0-100
}

export interface PartyAffiliation {
  partyName: string;
  country: string;
  affiliation: 'MEMBER' | 'SUPPORTER' | 'DONOR' | 'ENDORSED_BY' | 'ALIGNED' | 'FORMER_MEMBER';
  startDate?: string;
  endDate?: string;
  current: boolean;
  confidence: number; // 0-100 percentage
  evidenceCount: number;
  evidenceSummary: string[];
  sources: string[];
}

export interface IdeologyProfile {
  primaryLabel: string; // e.g., "Conservative", "Liberal", "Libertarian"
  confidence: number; // 0-100
  economicAxis: number; // -100 (left/socialist) to +100 (right/capitalist)
  socialAxis: number; // -100 (progressive) to +100 (traditional)
  authoritarianAxis: number; // -100 (libertarian) to +100 (authoritarian)
  labels: IdeologyLabel[];
}

export interface IdeologyLabel {
  label: string;
  confidence: number;
  evidence: string[];
}

export interface VotingPattern {
  election: string;
  date: string;
  party: string;
  candidate?: string;
  source: string;
}

export interface PoliticalEndorsement {
  endorsed: string; // Who they endorsed
  endorsedBy?: string; // Who endorsed them
  party: string;
  date: string;
  type: 'GAVE' | 'RECEIVED';
  source: string;
}

export interface PoliticalDonation {
  recipient: string;
  party: string;
  amount?: string;
  date: string;
  source: string;
}

export interface Biography {
  fullName: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  nationality: string[];
  residence?: string;
  occupation: string[];
  titles: string[];
  summary: string;
}

export interface FamilyNetwork {
  members: FamilyMember[];
  dynastyName?: string;
  generation?: number;
}

export interface FamilyMember {
  entityId: string;
  name: string;
  relationship: string;
  birthDate?: string;
  deathDate?: string;
  status: 'LIVING' | 'DECEASED' | 'UNKNOWN';
  politicalRole?: string;
  notes?: string;
  sources: string[];
}

export interface CareerHistory {
  positions: CareerPosition[];
  totalYearsExperience?: number;
  industries: string[];
}

export interface CareerPosition {
  title: string;
  organization: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
  sources: string[];
}

export interface EducationHistory {
  institutions: EducationRecord[];
  degrees: string[];
  fields: string[];
}

export interface EducationRecord {
  institution: string;
  institutionId?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  completed: boolean;
  honors?: string[];
  sources: string[];
}

export interface OrganizationAffiliation {
  organizationId: string;
  name: string;
  type: EntityType;
  role: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string;
  keyFigures?: string[];
  funding?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISSOLVED' | 'UNKNOWN';
  sources: string[];
}

export interface AdvisorNetwork {
  advisors: Advisor[];
  innerCircle: string[]; // Entity IDs
  knownAssociates: string[];
}

export interface Advisor {
  entityId: string;
  name: string;
  role: string;
  organization?: string;
  expertise?: string[];
  startDate?: string;
  endDate?: string;
  current: boolean;
  publiclyKnown: boolean;
  influence: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: string[];
}

export interface PositionRecord {
  topic: string;
  category: 'POLITICAL' | 'ECONOMIC' | 'SOCIAL' | 'FOREIGN_POLICY' | 'DOMESTIC' | 'OTHER';
  currentPosition: string;
  date: string;
  evolution: PositionChange[];
  consistency: 'CONSISTENT' | 'EVOLVED' | 'CONTRADICTORY' | 'UNCLEAR';
  sources: string[];
}

export interface PositionChange {
  date: string;
  position: string;
  context?: string;
  source: string;
}

export interface ForeignRelation {
  country: string;
  countryId?: string;
  entity: string;
  entityId?: string;
  entityType: 'GOVERNMENT' | 'OFFICIAL' | 'ORGANIZATION' | 'LEADER';
  relationType: 'MEETING' | 'ENDORSEMENT' | 'OPPOSITION' | 'ALLIANCE' | 'FUNDING' | 'STATEMENT';
  date: string;
  description: string;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  publicReaction?: string;
  sources: string[];
}

export interface MediaPresence {
  socialAccounts: SocialAccount[];
  mediaAppearances: MediaAppearance[];
  ownedMedia?: string[];
  amplificationNetwork?: AmplificationNode[];
  digitalCampaigns?: DigitalCampaign[];
  socialMediaAnalysis?: SocialMediaAnalysis;
}

// ============================================================================
// SOCIAL MEDIA ANALYSIS
// ============================================================================

export interface SocialMediaAnalysis {
  profiles: SocialMediaProfile[];
  primaryPlatform: string | null;
  overallInfluence: number;
  xAnalysis: XAnalysisSummary | null;
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

export interface XAnalysisSummary {
  profileFound: boolean;
  username?: string;
  verified: boolean;
  followerCount: number;
  influenceScore: number;
  engagementRate: number;
  notableConnections: XConnection[];
  politicalIndicators: XPoliticalSummary;
  iranActivity: XIranActivitySummary;
}

export interface XConnection {
  username: string;
  displayName: string;
  category: string;
  verified: boolean;
}

export interface XPoliticalSummary {
  detectedLeanings: { leaning: string; confidence: number }[];
  topPoliticalHashtags: { tag: string; count: number }[];
  politicalTopics: string[];
}

export interface XIranActivitySummary {
  iranRelatedTweets: number;
  stance: 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN';
  confidence: number;
  oppositionHashtags: string[];
  oppositionMentions: string[];
  evidence: string[];
}

export interface SocialAccount {
  platform: string;
  handle: string;
  url: string;
  followers?: number;
  verified: boolean;
  active: boolean;
  created?: string;
}

export interface MediaAppearance {
  outlet: string;
  outletType: 'TV' | 'RADIO' | 'PRINT' | 'ONLINE' | 'PODCAST' | 'CONFERENCE';
  date: string;
  type: 'INTERVIEW' | 'OP_ED' | 'STATEMENT' | 'SPEECH' | 'PANEL' | 'DOCUMENTARY';
  topic: string;
  url?: string;
  keyQuotes?: string[];
}

export interface AmplificationNode {
  entityId: string;
  name: string;
  type: 'MEDIA' | 'INFLUENCER' | 'BOT_NETWORK' | 'THINK_TANK' | 'GOVERNMENT';
  reach?: number;
  relationship: string;
  sources: string[];
}

export interface DigitalCampaign {
  name: string;
  operator?: string;
  startDate?: string;
  endDate?: string;
  platforms: string[];
  tactics: string[];
  reach?: string;
  sources: string[];
}

export interface FundingProfile {
  knownSources: FundingSource[];
  estimatedWealth?: string;
  financialDisclosures: FinancialDisclosure[];
  controversies: string[];
  transparency: 'HIGH' | 'MEDIUM' | 'LOW' | 'OPAQUE';
}

export interface FundingSource {
  source: string;
  sourceType: 'GOVERNMENT' | 'PRIVATE' | 'FOUNDATION' | 'DIASPORA' | 'SELF' | 'UNKNOWN';
  amount?: string;
  period?: string;
  verified: boolean;
  sources: string[];
}

export interface FinancialDisclosure {
  type: string;
  date: string;
  summary: string;
  source: string;
}

export interface Controversy {
  title: string;
  date: string;
  category: 'POLITICAL' | 'FINANCIAL' | 'ETHICAL' | 'LEGAL' | 'PERSONAL' | 'ORGANIZATIONAL';
  description: string;
  allegations: string[];
  response?: string;
  resolution?: string;
  ongoing: boolean;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: string[];
}

export interface TimelineEvent {
  date: string;
  event: string;
  category: 'PERSONAL' | 'POLITICAL' | 'ORGANIZATIONAL' | 'STATEMENT' | 'MEETING' | 'CONTROVERSY' | 'ACHIEVEMENT';
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedEntities?: string[];
  sources: string[];
}

export interface OppositionMap {
  subject: string;
  allies: OppositionActor[];
  critics: OppositionActor[];
  neutral: OppositionActor[];
  coalitions: Coalition[];
  ideologicalSpectrum: IdeologicalPosition[];
}

export interface OppositionActor {
  entityId: string;
  name: string;
  type: EntityType;
  ideology?: string;
  relationship: 'ALLY' | 'CRITIC' | 'NEUTRAL' | 'RIVAL' | 'FORMER_ALLY';
  relationshipHistory?: string;
  keyDifferences?: string[];
  sources: string[];
}

export interface Coalition {
  name: string;
  formed: string;
  dissolved?: string;
  members: string[];
  purpose: string;
  status: 'ACTIVE' | 'DISSOLVED' | 'STRAINED';
  outcomes?: string[];
  sources: string[];
}

export interface IdeologicalPosition {
  actor: string;
  position: string;
  spectrum: number; // -100 (far left) to +100 (far right)
  axes: {
    economic?: number;
    social?: number;
    authoritarian?: number;
    nationalist?: number;
  };
}

// ============================================================================
// OUTLIER DETECTION
// ============================================================================

export interface OutlierAnalysis {
  totalOutliers: number;
  criticalOutliers: number;
  consistencyScore: number; // 0-100, higher = more consistent
  iranStanceConsistency: number;
  politicalConsistency: number;
  outliers: NarrativeOutlier[];
  redFlags: string[];
  narrativeSummary: string;
}

export interface NarrativeOutlier {
  id: string;
  type: 'CONTRADICTION' | 'FLIP_FLOP' | 'ANOMALY' | 'INCONSISTENCY' | 'SUSPICIOUS' | 'ASSOCIATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'IRAN_STANCE' | 'POLITICAL' | 'FINANCIAL' | 'NETWORK' | 'NARRATIVE' | 'TEMPORAL';
  description: string;
  expectedBehavior: string;
  actualBehavior: string;
  evidence: string;
  date?: string;
  source?: string;
  confidence: number;
  possibleExplanations: string[];
}

// ============================================================================
// ANALYSIS OUTPUT TYPES
// ============================================================================

export interface NetworkMetrics {
  totalNodes: number;
  totalEdges: number;
  density: number;
  components: number;
  centralityScores: {
    pageRank: Map<string, number>;
    betweenness: Map<string, number>;
    degree: Map<string, number>;
    eigenvector: Map<string, number>;
  };
  communities: string[][];
  keyInfluencers: string[];
  bridges: string[];
}

export interface ResearchReport {
  subject: string;
  generatedAt: Date;
  profile: PersonProfile;
  graph: {
    entities: Entity[];
    relationships: Relationship[];
  };
  metrics: NetworkMetrics;
  sources: Source[];
  methodology: string;
  limitations: string[];
  exportFormats: string[];
}
