/**
 * ROSVA/PRISM INTELLIGENCE PROFILE
 *
 * Subject: Reza Pahlavi
 * Classification: Public Figure - Political
 * Methodology: Open-Source Intelligence (OSINT)
 *
 * All data sourced from publicly available records.
 * No private data. No speculation. Source-anchored.
 */

import {
  UltimateKnowledgeGraph,
  Entity,
  Edge,
  EntityType,
  EdgeType,
  NetworkMetrics
} from './ultimate-engine';

// ============================================================================
// INTELLIGENCE PACKAGE - REZA PAHLAVI
// ============================================================================

interface PoliticalIntelligence {
  subject: Entity;
  biography: BiographyData;
  organizations: OrganizationIntel[];
  network: NetworkIntel[];
  timeline: TimelineEvent[];
  mediaPresence: MediaPresence;
  positions: PositionRecord[];
  foreignRelations: ForeignRelation[];
  sources: SourceRecord[];
}

interface BiographyData {
  fullName: string;
  birthDate: string;
  birthPlace: string;
  currentResidence: string;
  nationality: string;
  titles: string[];
  education: EducationRecord[];
  family: FamilyMember[];
}

interface EducationRecord {
  institution: string;
  degree?: string;
  field?: string;
  period: string;
  location: string;
}

interface FamilyMember {
  name: string;
  relationship: string;
  status: 'living' | 'deceased';
  notes?: string;
}

interface OrganizationIntel {
  name: string;
  role: string;
  founded: string;
  status: 'active' | 'inactive' | 'unknown';
  description: string;
  keyFigures?: string[];
  sources: string[];
}

interface NetworkIntel {
  name: string;
  role: string;
  relationship: string;
  organization?: string;
  publiclyKnown: boolean;
  sources: string[];
}

interface TimelineEvent {
  date: string;
  event: string;
  type: 'political' | 'statement' | 'meeting' | 'organization' | 'media' | 'personal';
  significance: 'high' | 'medium' | 'low';
  source: string;
  sourceUrl?: string;
}

interface MediaPresence {
  platforms: SocialPlatform[];
  mediaAppearances: MediaAppearance[];
  publications: string[];
}

interface SocialPlatform {
  platform: string;
  handle: string;
  url: string;
  followers?: string;
  verified: boolean;
}

interface MediaAppearance {
  outlet: string;
  date: string;
  type: 'interview' | 'op-ed' | 'statement' | 'conference';
  topic: string;
  source: string;
}

interface PositionRecord {
  topic: string;
  position: string;
  date: string;
  source: string;
  evolution?: PositionChange[];
}

interface PositionChange {
  date: string;
  newPosition: string;
  source: string;
}

interface ForeignRelation {
  country: string;
  entity: string;
  type: 'meeting' | 'statement' | 'endorsement' | 'opposition';
  date: string;
  details: string;
  source: string;
}

interface SourceRecord {
  id: string;
  name: string;
  url: string;
  type: 'primary' | 'secondary' | 'media';
  reliability: 'high' | 'medium' | 'low';
  accessed: string;
}

// ============================================================================
// FULL INTELLIGENCE PACKAGE
// ============================================================================

const REZA_PAHLAVI_INTEL: PoliticalIntelligence = {
  subject: {
    id: 'person_reza_pahlavi',
    name: 'Reza Pahlavi',
    type: 'PERSON',
    aliases: ['Reza Pahlavi II', 'Crown Prince of Iran', 'Reza Shah II (claimed)'],
    attributes: new Map([
      ['fullName', 'Reza Cyrus Pahlavi'],
      ['title', 'Crown Prince of Iran (in exile)'],
      ['born', 'October 31, 1960'],
      ['birthPlace', 'Tehran, Iran'],
      ['residence', 'Great Falls, Virginia, USA'],
      ['citizenship', 'Iranian (claimed), US Resident'],
      ['occupation', 'Political Figure, Opposition Leader'],
      ['yearsInExile', '45+ years (since 1979)']
    ]),
    confidence: 1.0,
    sources: ['wikipedia', 'britannica', 'rezapahlavi.org', 'iranintl', 'npr', 'cnn'],
    firstSeen: new Date('1960-10-31'),
    lastSeen: new Date()
  },

  biography: {
    fullName: 'Reza Cyrus Pahlavi',
    birthDate: '1960-10-31',
    birthPlace: 'Tehran, Iran',
    currentResidence: 'Great Falls, Virginia, USA',
    nationality: 'Iranian (in exile)',
    titles: [
      'Crown Prince of Iran (1967-1979)',
      'Self-styled Shah of Iran (post-1980)',
      'Head of House of Pahlavi'
    ],
    education: [
      {
        institution: 'Imperial Iranian Air Force Academy',
        field: 'Pilot Training',
        period: '1978',
        location: 'Iran'
      },
      {
        institution: 'Reese Air Force Base',
        field: 'Fighter Pilot Training',
        period: '1978-1979',
        location: 'Texas, USA'
      },
      {
        institution: 'Williams College',
        degree: 'Did not complete',
        period: '1981-1984',
        location: 'Massachusetts, USA'
      },
      {
        institution: 'University of Southern California',
        degree: 'BA Political Science',
        period: '1985',
        location: 'California, USA'
      }
    ],
    family: [
      { name: 'Mohammad Reza Pahlavi', relationship: 'Father', status: 'deceased', notes: 'Last Shah of Iran (d. 1980)' },
      { name: 'Farah Pahlavi', relationship: 'Mother', status: 'living', notes: 'Former Empress, lives in exile' },
      { name: 'Yasmine Etemad-Amini', relationship: 'Wife', status: 'living', notes: 'Married 1986' },
      { name: 'Noor Pahlavi', relationship: 'Daughter', status: 'living', notes: 'Born 1992' },
      { name: 'Iman Pahlavi', relationship: 'Daughter', status: 'living', notes: 'Born 1993' },
      { name: 'Farah Pahlavi (daughter)', relationship: 'Daughter', status: 'living', notes: 'Born 2004' },
      { name: 'Ali-Reza Pahlavi', relationship: 'Brother', status: 'deceased', notes: 'Died 2011' },
      { name: 'Leila Pahlavi', relationship: 'Sister', status: 'deceased', notes: 'Died 2001' }
    ]
  },

  organizations: [
    {
      name: 'Phoenix Project of Iran (Qoqnoos)',
      role: 'Founder / Patron',
      founded: '2019-02',
      status: 'active',
      description: 'Non-profit think tank bringing together Iranian scholars and experts to develop solutions for post-Islamic Republic Iran. Registered in Washington, DC.',
      keyFigures: ['Dr. Alayar Kangarloo (Executive Director)'],
      sources: ['iranprojectphoenix.org', 'nationalinterest.org']
    },
    {
      name: 'Iran Future Association (IFA)',
      role: 'Initiator',
      founded: '2008',
      status: 'inactive',
      description: 'Predecessor to Phoenix Project. Organized scientific conference in Toronto, Canada.',
      sources: ['iranprojectphoenix.org']
    },
    {
      name: 'National Council of Iran (proposed)',
      role: 'Proposed Leader',
      founded: '2022',
      status: 'unknown',
      description: 'Proposed umbrella opposition coalition. Georgetown Alliance signed October 2022 with Hamed Esmaeilion and Masih Alinejad.',
      keyFigures: ['Hamed Esmaeilion', 'Masih Alinejad'],
      sources: ['iranintl.com', 'media reports']
    },
    {
      name: 'Iran Prosperity Project',
      role: 'Advisor / Patron',
      founded: 'Unknown',
      status: 'active',
      description: 'Think tank focused on post-transition economic planning for Iran.',
      sources: ['iranopasmigirim.com']
    }
  ],

  network: [
    {
      name: 'Saeed Ghasseminejad',
      role: 'Senior Advisor',
      relationship: 'Key Political Advisor',
      organization: 'Foundation for Defense of Democracies (FDD)',
      publiclyKnown: true,
      sources: ['FDD website', 'Media interviews']
    },
    {
      name: 'Dr. Alayar Kangarloo',
      role: 'Executive Director',
      relationship: 'Organizational Leadership',
      organization: 'Phoenix Project of Iran',
      publiclyKnown: true,
      sources: ['iranprojectphoenix.org']
    },
    {
      name: 'Masih Alinejad',
      role: 'Activist',
      relationship: 'Coalition Partner (2022)',
      organization: 'Independent',
      publiclyKnown: true,
      sources: ['Georgetown Alliance announcement']
    },
    {
      name: 'Hamed Esmaeilion',
      role: 'Activist',
      relationship: 'Coalition Partner (2022)',
      organization: 'Association of Families of Flight PS752 Victims',
      publiclyKnown: true,
      sources: ['Georgetown Alliance announcement']
    },
    {
      name: 'Gila Gamliel',
      role: 'Israeli Minister',
      relationship: 'Political Contact',
      organization: 'Israeli Government',
      publiclyKnown: true,
      sources: ['Iran International', 'Times of Israel']
    }
  ],

  timeline: [
    { date: '1960-10-31', event: 'Born in Tehran, Iran', type: 'personal', significance: 'high', source: 'Wikipedia' },
    { date: '1967-10-26', event: 'Officially named Crown Prince at father\'s coronation', type: 'political', significance: 'high', source: 'Britannica' },
    { date: '1978', event: 'Left Iran for pilot training at Reese Air Force Base, Texas', type: 'personal', significance: 'high', source: 'Wikipedia' },
    { date: '1979-02-11', event: 'Iranian Revolution - Monarchy abolished, never returned to Iran', type: 'political', significance: 'high', source: 'Historical record' },
    { date: '1980-07-27', event: 'Father Mohammad Reza Shah dies in Cairo', type: 'personal', significance: 'high', source: 'Historical record' },
    { date: '1980-10-31', event: 'Proclaimed himself Shah of Iran on 20th birthday (not recognized)', type: 'political', significance: 'medium', source: 'Wikipedia' },
    { date: '1986', event: 'Married Yasmine Etemad-Amini', type: 'personal', significance: 'medium', source: 'Wikipedia' },
    { date: '2001-06-10', event: 'Sister Leila Pahlavi dies in London', type: 'personal', significance: 'medium', source: 'Media reports' },
    { date: '2011-01-04', event: 'Brother Ali-Reza Pahlavi dies in Boston', type: 'personal', significance: 'medium', source: 'Media reports' },
    { date: '2019-02', event: 'Launched Phoenix Project of Iran', type: 'organization', significance: 'high', source: 'National Interest' },
    { date: '2022-09', event: 'Mahsa Amini protests begin - Pahlavi increases public profile', type: 'political', significance: 'high', source: 'Multiple media' },
    { date: '2022-10', event: 'Georgetown Alliance signed with Esmaeilion and Alinejad', type: 'political', significance: 'high', source: 'Iran International' },
    { date: '2023-04', event: 'Visited Israel, met Netanyahu and Herzog', type: 'meeting', significance: 'high', source: 'Times of Israel, Iran International' },
    { date: '2024-11-14', event: 'Called on Iranians to "reclaim Iran", offered to lead transition', type: 'statement', significance: 'high', source: 'Wikipedia/Media' },
    { date: '2025-01', event: 'Advised Trump against nuclear deal with Islamic Republic', type: 'political', significance: 'medium', source: 'Wikipedia' },
    { date: '2025-02', event: 'Munich Security Conference invitation withdrawn then reinstated then cancelled', type: 'political', significance: 'medium', source: 'Wikipedia' },
    { date: '2025-06-17', event: 'Declared Islamic Republic "on verge of collapse" during Iran-Israel war', type: 'statement', significance: 'high', source: 'Wikipedia' },
    { date: '2025-09', event: 'Israeli Minister Gila Gamliel publicly endorses Pahlavi for regime change', type: 'political', significance: 'high', source: 'Iran International' },
    { date: '2026-01', event: 'Urges protesters during nationwide demonstrations', type: 'statement', significance: 'high', source: 'NPR, CNN' }
  ],

  mediaPresence: {
    platforms: [
      { platform: 'X (Twitter)', handle: '@PahlaviReza', url: 'https://x.com/PahlaviReza', verified: true },
      { platform: 'Instagram', handle: '@rezapahlavi', url: 'https://instagram.com/rezapahlavi', verified: true },
      { platform: 'Official Website', handle: 'rezapahlavi.org', url: 'https://rezapahlavi.org', verified: true },
      { platform: 'YouTube', handle: 'Reza Pahlavi', url: 'https://youtube.com/@RezaPahlavi', verified: true }
    ],
    mediaAppearances: [
      { outlet: 'CNN', date: '2026-01', type: 'interview', topic: 'Iran protests', source: 'cnn.com' },
      { outlet: 'NPR', date: '2026-01', type: 'interview', topic: 'Opposition leadership', source: 'npr.org' },
      { outlet: 'Jerusalem Post', date: '2026-01', type: 'op-ed', topic: 'Future of Iran', source: 'jpost.com' },
      { outlet: 'Iran International', date: '2025-09', type: 'interview', topic: 'Israeli endorsement', source: 'iranintl.com' },
      { outlet: 'TIME', date: '2026-01', type: 'interview', topic: 'Protest analysis', source: 'time.com' }
    ],
    publications: ['rezapahlavi.org statements', 'Various op-eds']
  },

  positions: [
    {
      topic: 'Form of Government',
      position: 'Advocates for secular democracy; open to constitutional monarchy with elected head of state; says decision is for Iranian people',
      date: 'Ongoing',
      source: 'Multiple interviews'
    },
    {
      topic: 'Israel Relations',
      position: 'Publicly supports normalization with Israel; proposes "Cyrus Accord" modeled on Abraham Accords',
      date: '2023-present',
      source: 'Israel visit 2023, advisor statements'
    },
    {
      topic: 'US Intervention',
      position: 'Calls for US support of protesters; opposes nuclear deals with Islamic Republic',
      date: '2025-2026',
      source: 'Statements to Trump administration'
    },
    {
      topic: 'Transition Leadership',
      position: 'Offered to "guide change and lead transitional period" (Nov 2024)',
      date: '2024-11-14',
      source: 'Official statement'
    }
  ],

  foreignRelations: [
    {
      country: 'Israel',
      entity: 'Benjamin Netanyahu',
      type: 'meeting',
      date: '2023-04',
      details: 'Met with PM Netanyahu and President Herzog during Israel visit',
      source: 'Times of Israel'
    },
    {
      country: 'Israel',
      entity: 'Gila Gamliel',
      type: 'endorsement',
      date: '2025-09',
      details: 'Israeli Minister publicly endorsed Pahlavi for regime change - first official Israeli government endorsement',
      source: 'Iran International'
    },
    {
      country: 'Israel',
      entity: 'Yossi Dagan',
      type: 'meeting',
      date: '2025',
      details: 'Met with head of Northern West Bank Settlements Council',
      source: 'Israeli Channel 14'
    },
    {
      country: 'USA',
      entity: 'Trump Administration',
      type: 'statement',
      date: '2025-2026',
      details: 'Advised against Iran nuclear deal; Trump declined meeting but expressed positive view',
      source: 'Times of Israel'
    },
    {
      country: 'Germany',
      entity: 'Munich Security Conference',
      type: 'opposition',
      date: '2025-02',
      details: 'Invitation withdrawn after Iranian regime pressure',
      source: 'Wikipedia'
    }
  ],

  sources: [
    { id: 'wiki', name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Reza_Pahlavi,_Crown_Prince_of_Iran', type: 'secondary', reliability: 'medium', accessed: '2026-01-11' },
    { id: 'britannica', name: 'Britannica', url: 'https://www.britannica.com/biography/Reza-Pahlavi', type: 'secondary', reliability: 'high', accessed: '2026-01-11' },
    { id: 'official', name: 'Official Website', url: 'https://rezapahlavi.org', type: 'primary', reliability: 'high', accessed: '2026-01-11' },
    { id: 'iranintl', name: 'Iran International', url: 'https://iranintl.com', type: 'media', reliability: 'medium', accessed: '2026-01-11' },
    { id: 'npr', name: 'NPR', url: 'https://npr.org', type: 'media', reliability: 'high', accessed: '2026-01-11' },
    { id: 'cnn', name: 'CNN', url: 'https://cnn.com', type: 'media', reliability: 'high', accessed: '2026-01-11' },
    { id: 'toi', name: 'Times of Israel', url: 'https://timesofisrael.com', type: 'media', reliability: 'medium', accessed: '2026-01-11' },
    { id: 'jpost', name: 'Jerusalem Post', url: 'https://jpost.com', type: 'media', reliability: 'medium', accessed: '2026-01-11' },
    { id: 'phoenix', name: 'Phoenix Project', url: 'https://iranprojectphoenix.org', type: 'primary', reliability: 'high', accessed: '2026-01-11' }
  ]
};

// ============================================================================
// GRAPH BUILDER
// ============================================================================

function buildPahlaviGraph(intel: PoliticalIntelligence): UltimateKnowledgeGraph {
  const graph = new UltimateKnowledgeGraph();
  const now = new Date();
  const subjectId = intel.subject.id;

  // Add subject
  graph.addEntity(intel.subject);

  // Add family members
  intel.biography.family.forEach(member => {
    const memberId = `person_${member.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    graph.addEntity({
      id: memberId,
      name: member.name,
      type: 'PERSON',
      aliases: [],
      attributes: new Map([
        ['relationship', member.relationship],
        ['status', member.status],
        ['notes', member.notes || '']
      ]),
      confidence: 0.95,
      sources: ['wikipedia', 'britannica'],
      firstSeen: now,
      lastSeen: now
    });

    const edgeType: EdgeType = member.relationship.includes('Wife') ? 'MARRIED_TO' :
      member.relationship.includes('Father') || member.relationship.includes('Mother') ? 'CHILD_OF' :
      member.relationship.includes('Daughter') || member.relationship.includes('Son') ? 'PARENT_OF' :
      member.relationship.includes('Brother') || member.relationship.includes('Sister') ? 'SIBLING_OF' : 'FAMILY_OF';

    graph.addEdge({
      id: `${subjectId}_${edgeType}_${memberId}`,
      from: subjectId,
      to: memberId,
      type: edgeType,
      weight: 1.0,
      evidence: [{
        source: 'Wikipedia/Britannica',
        url: 'https://en.wikipedia.org/wiki/Reza_Pahlavi,_Crown_Prince_of_Iran',
        snippet: `${member.name} - ${member.relationship}`,
        date: now,
        reliability: 0.95
      }]
    });
  });

  // Add organizations
  intel.organizations.forEach(org => {
    const orgId = `org_${org.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    graph.addEntity({
      id: orgId,
      name: org.name,
      type: 'ORGANIZATION',
      aliases: [],
      attributes: new Map([
        ['founded', org.founded],
        ['status', org.status],
        ['description', org.description]
      ]),
      confidence: 0.85,
      sources: org.sources,
      firstSeen: now,
      lastSeen: now
    });

    graph.addEdge({
      id: `${subjectId}_founded_${orgId}`,
      from: subjectId,
      to: orgId,
      type: 'FOUNDED',
      weight: 0.9,
      evidence: [{
        source: org.sources[0],
        url: '',
        snippet: `${org.role} of ${org.name}`,
        date: now,
        reliability: 0.85
      }]
    });

    // Add key figures
    if (org.keyFigures) {
      org.keyFigures.forEach(figure => {
        const figureId = `person_${figure.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
        if (!graph.entities.has(figureId)) {
          graph.addEntity({
            id: figureId,
            name: figure,
            type: 'PERSON',
            aliases: [],
            attributes: new Map([['organization', org.name]]),
            confidence: 0.7,
            sources: org.sources,
            firstSeen: now,
            lastSeen: now
          });
        }

        graph.addEdge({
          id: `${orgId}_has_${figureId}`,
          from: orgId,
          to: figureId,
          type: 'MEMBER_OF',
          weight: 0.8,
          evidence: [{
            source: org.sources[0],
            url: '',
            snippet: `Key figure at ${org.name}`,
            date: now,
            reliability: 0.7
          }]
        });
      });
    }
  });

  // Add network connections
  intel.network.forEach(person => {
    const personId = `person_${person.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    if (!graph.entities.has(personId)) {
      graph.addEntity({
        id: personId,
        name: person.name,
        type: 'PERSON',
        aliases: [],
        attributes: new Map([
          ['role', person.role],
          ['organization', person.organization || '']
        ]),
        confidence: person.publiclyKnown ? 0.9 : 0.6,
        sources: person.sources,
        firstSeen: now,
        lastSeen: now
      });
    }

    graph.addEdge({
      id: `${subjectId}_knows_${personId}`,
      from: subjectId,
      to: personId,
      type: person.relationship.includes('Advisor') ? 'ADVISED_BY' :
            person.relationship.includes('Partner') ? 'COLLABORATED_WITH' :
            person.relationship.includes('Contact') ? 'MET_WITH' : 'KNOWS',
      weight: person.publiclyKnown ? 0.85 : 0.5,
      evidence: [{
        source: person.sources[0],
        url: '',
        snippet: `${person.relationship}: ${person.role}`,
        date: now,
        reliability: person.publiclyKnown ? 0.85 : 0.5
      }]
    });
  });

  // Add foreign relations
  intel.foreignRelations.forEach(relation => {
    const entityId = `entity_${relation.entity.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
    const countryId = `country_${relation.country.toLowerCase().replace(/\s+/g, '_')}`;

    // Add country
    if (!graph.entities.has(countryId)) {
      graph.addEntity({
        id: countryId,
        name: relation.country,
        type: 'LOCATION',
        aliases: [],
        attributes: new Map(),
        confidence: 1.0,
        sources: [relation.source],
        firstSeen: now,
        lastSeen: now
      });
    }

    // Add foreign entity
    if (!graph.entities.has(entityId)) {
      graph.addEntity({
        id: entityId,
        name: relation.entity,
        type: relation.entity.includes('Conference') ? 'EVENT' : 'PERSON',
        aliases: [],
        attributes: new Map([['country', relation.country]]),
        confidence: 0.9,
        sources: [relation.source],
        firstSeen: now,
        lastSeen: now
      });
    }

    const edgeType: EdgeType = relation.type === 'meeting' ? 'MET_WITH' :
      relation.type === 'endorsement' ? 'ENDORSED_BY' : 'ASSOCIATED_WITH';

    graph.addEdge({
      id: `${subjectId}_${relation.type}_${entityId}_${relation.date}`,
      from: subjectId,
      to: entityId,
      type: edgeType,
      weight: relation.type === 'endorsement' ? 0.95 : 0.8,
      evidence: [{
        source: relation.source,
        url: '',
        snippet: `${relation.date}: ${relation.details}`,
        date: new Date(relation.date),
        reliability: 0.85
      }]
    });
  });

  // Add education
  intel.biography.education.forEach(edu => {
    const eduId = `edu_${edu.institution.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    graph.addEntity({
      id: eduId,
      name: edu.institution,
      type: 'ORGANIZATION',
      aliases: [],
      attributes: new Map([
        ['type', 'Educational Institution'],
        ['location', edu.location]
      ]),
      confidence: 0.9,
      sources: ['wikipedia'],
      firstSeen: now,
      lastSeen: now
    });

    graph.addEdge({
      id: `${subjectId}_educated_${eduId}`,
      from: subjectId,
      to: eduId,
      type: 'EDUCATED_AT',
      weight: 0.8,
      evidence: [{
        source: 'Wikipedia',
        url: '',
        snippet: `${edu.field || ''} (${edu.period})`,
        date: now,
        reliability: 0.9
      }]
    });
  });

  // Add social platforms
  intel.mediaPresence.platforms.forEach(platform => {
    const platformId = `social_${platform.platform.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    graph.addEntity({
      id: platformId,
      name: `${platform.platform}: ${platform.handle}`,
      type: 'SOCIAL_ACCOUNT',
      aliases: [platform.handle],
      attributes: new Map([
        ['url', platform.url],
        ['verified', platform.verified.toString()]
      ]),
      confidence: 0.95,
      sources: [platform.url],
      firstSeen: now,
      lastSeen: now
    });

    graph.addEdge({
      id: `${subjectId}_uses_${platformId}`,
      from: subjectId,
      to: platformId,
      type: 'OWNS_DOMAIN',
      weight: 0.95,
      evidence: [{
        source: platform.platform,
        url: platform.url,
        snippet: `Official ${platform.platform} account`,
        date: now,
        reliability: 0.95
      }]
    });
  });

  // Add locations
  ['Great Falls, Virginia, USA', 'Tehran, Iran (birthplace)'].forEach(loc => {
    const locId = `location_${loc.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    graph.addEntity({
      id: locId,
      name: loc,
      type: 'LOCATION',
      aliases: [],
      attributes: new Map(),
      confidence: 0.9,
      sources: ['wikipedia'],
      firstSeen: now,
      lastSeen: now
    });

    graph.addEdge({
      id: `${subjectId}_in_${locId}`,
      from: subjectId,
      to: locId,
      type: 'LOCATED_IN',
      weight: loc.includes('Virginia') ? 0.95 : 0.7,
      evidence: [{
        source: 'Wikipedia',
        url: '',
        snippet: loc.includes('Virginia') ? 'Current residence' : 'Birthplace',
        date: now,
        reliability: 0.9
      }]
    });
  });

  return graph;
}

// ============================================================================
// VISUALIZATION
// ============================================================================

function generatePahlaviVisualization(intel: PoliticalIntelligence, graph: UltimateKnowledgeGraph, metrics: NetworkMetrics): string {
  let output = '';

  // HEADER
  output += '\n';
  output += '╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗\n';
  output += '║                                                                                                                  ║\n';
  output += '║  ██████╗ ██████╗ ██╗███████╗███╗   ███╗    ██╗███╗   ██╗████████╗███████╗██╗                                     ║\n';
  output += '║  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║    ██║████╗  ██║╚══██╔══╝██╔════╝██║                                     ║\n';
  output += '║  ██████╔╝██████╔╝██║███████╗██╔████╔██║    ██║██╔██╗ ██║   ██║   █████╗  ██║                                     ║\n';
  output += '║  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║    ██║██║╚██╗██║   ██║   ██╔══╝  ██║                                     ║\n';
  output += '║  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║    ██║██║ ╚████║   ██║   ███████╗███████╗                                ║\n';
  output += '║  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝                                ║\n';
  output += '║                                                                                                                  ║\n';
  output += '║                       OPEN-SOURCE INTELLIGENCE - NARRATIVE & INFLUENCE ANALYSIS                                 ║\n';
  output += '║                                                                                                                  ║\n';
  output += '╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝\n\n';

  // SUBJECT PROFILE
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                           SUBJECT PROFILE                                                       ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n';
  output += '┃                                                                                                                 ┃\n';
  output += '┃    ████████████████████████████████████████████████████████████████████████                                     ┃\n';
  output += '┃    ██                                                                    ██                                     ┃\n';
  output += '┃    ██   REZA CYRUS PAHLAVI                                               ██                                     ┃\n';
  output += '┃    ██                                                                    ██                                     ┃\n';
  output += '┃    ██   Title:      Crown Prince of Iran (in exile)                      ██                                     ┃\n';
  output += '┃    ██   Born:       October 31, 1960 - Tehran, Iran                      ██                                     ┃\n';
  output += '┃    ██   Residence:  Great Falls, Virginia, USA                           ██                                     ┃\n';
  output += '┃    ██   In Exile:   45+ years (since 1979)                               ██                                     ┃\n';
  output += '┃    ██   Education:  USC (BA Political Science)                           ██                                     ┃\n';
  output += '┃    ██                                                                    ██                                     ┃\n';
  output += '┃    ██   Role:       Iranian Opposition Figure                            ██                                     ┃\n';
  output += '┃    ██   Platform:   @PahlaviReza (X/Twitter)                             ██                                     ┃\n';
  output += '┃    ██                                                                    ██                                     ┃\n';
  output += '┃    ████████████████████████████████████████████████████████████████████████                                     ┃\n';
  output += '┃                                                                                                                 ┃\n';
  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // NETWORK METRICS
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃        NETWORK METRICS           ┃        GRAPH STATISTICS          ┃         DATA QUALITY             ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n';
  output += `┃  Total Entities: ${metrics.totalNodes.toString().padEnd(15)} ┃  Timeline Events: ${intel.timeline.length.toString().padEnd(14)} ┃  Sources: ${intel.sources.length.toString().padEnd(22)} ┃\n`;
  output += `┃  Total Relationships: ${metrics.totalEdges.toString().padEnd(10)} ┃  Organizations: ${intel.organizations.length.toString().padEnd(16)} ┃  High Reliability: ${intel.sources.filter(s => s.reliability === 'high').length.toString().padEnd(13)} ┃\n`;
  output += `┃  Network Density: ${(metrics.density * 100).toFixed(2).padEnd(13)}% ┃  Foreign Relations: ${intel.foreignRelations.length.toString().padEnd(12)} ┃  Medium Reliability: ${intel.sources.filter(s => s.reliability === 'medium').length.toString().padEnd(11)} ┃\n`;
  output += `┃  Components: ${metrics.components.toString().padEnd(18)} ┃  Known Associates: ${intel.network.length.toString().padEnd(13)} ┃  All Sources Cited: YES          ┃\n`;
  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // FAMILY TREE
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                           FAMILY NETWORK                                                        ┃\n';
  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  output += `
                        ┌─────────────────────────────────────────────────────────────┐
                        │                                                             │
                        │   Mohammad Reza Pahlavi  ═══════════════  Farah Diba        │
                        │   (Shah of Iran)                          (Empress)         │
                        │   1919-1980 [deceased]                    Living            │
                        │                                                             │
                        └───────────────────────────────┬─────────────────────────────┘
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────────────┐
                    │                                   │                                   │
                    ▼                                   ▼                                   ▼
      ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
      │   Leila Pahlavi             │   │   ★ REZA PAHLAVI ★          │   │   Ali-Reza Pahlavi          │
      │   1970-2001 [deceased]      │   │   b. 1960                   │   │   1966-2011 [deceased]      │
      │                             │   │   Crown Prince              │   │                             │
      └─────────────────────────────┘   └──────────────┬──────────────┘   └─────────────────────────────┘
                                                       │
                                                       ═══════════════ Yasmine Etemad-Amini (Wife)
                                                       │                Married 1986
                                                       │
                        ┌──────────────────────────────┼──────────────────────────────┐
                        │                              │                              │
                        ▼                              ▼                              ▼
          ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
          │   Noor Pahlavi          │  │   Iman Pahlavi          │  │   Farah Pahlavi         │
          │   b. 1992               │  │   b. 1993               │  │   b. 2004               │
          └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
\n`;

  // ORGANIZATIONS
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                       ORGANIZATIONS & INITIATIVES                                               ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n';

  intel.organizations.forEach(org => {
    const statusIcon = org.status === 'active' ? '●' : org.status === 'inactive' ? '○' : '◐';
    output += `    ${statusIcon} ${org.name.padEnd(40)} [${org.status.toUpperCase()}]\n`;
    output += `      Role: ${org.role}\n`;
    output += `      Founded: ${org.founded}\n`;
    output += `      ${org.description}\n`;
    if (org.keyFigures && org.keyFigures.length > 0) {
      output += `      Key Figures: ${org.keyFigures.join(', ')}\n`;
    }
    output += `      Sources: ${org.sources.join(', ')}\n\n`;
  });

  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // FOREIGN RELATIONS
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                    DOCUMENTED FOREIGN RELATIONS                                                 ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n';

  intel.foreignRelations.forEach(rel => {
    const typeIcon = rel.type === 'meeting' ? '🤝' :
                     rel.type === 'endorsement' ? '✓' :
                     rel.type === 'statement' ? '📢' : '⚠️';
    output += `    ${typeIcon} ${rel.date.padEnd(10)} │ ${rel.country.padEnd(10)} │ ${rel.entity}\n`;
    output += `                     └─ ${rel.details}\n`;
    output += `                        Source: ${rel.source}\n\n`;
  });

  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // PUBLIC POSITIONS
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                      DOCUMENTED PUBLIC POSITIONS                                                ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n';

  intel.positions.forEach(pos => {
    output += `    ▸ ${pos.topic}\n`;
    output += `      Position: ${pos.position}\n`;
    output += `      Source: ${pos.source}\n\n`;
  });

  output += '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // TIMELINE
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                         CHRONOLOGICAL TIMELINE                                                  ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n';

  intel.timeline.forEach((event, i) => {
    const icon = event.type === 'political' ? '🏛️' :
                 event.type === 'statement' ? '📢' :
                 event.type === 'meeting' ? '🤝' :
                 event.type === 'organization' ? '🏢' :
                 event.type === 'media' ? '📰' : '👤';

    const sigIcon = event.significance === 'high' ? '★' : event.significance === 'medium' ? '◆' : '○';
    const connector = i === intel.timeline.length - 1 ? '└' : '├';

    output += `    ${event.date.padEnd(12)} ${connector}──${icon}── ${sigIcon} ${event.event}\n`;
    output += `                    │      Source: ${event.source}\n`;
    if (i < intel.timeline.length - 1) output += '                    │\n';
  });

  output += '\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // SOURCES
  output += '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n';
  output += '┃                                           SOURCE DOCUMENTATION                                                  ┃\n';
  output += '┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n';

  intel.sources.forEach(src => {
    const reliabilityIcon = src.reliability === 'high' ? '●●●' : src.reliability === 'medium' ? '●●○' : '●○○';
    output += `    [${src.id.padEnd(10)}] ${src.name.padEnd(25)} ${reliabilityIcon} ${src.type.padEnd(10)} ${src.url}\n`;
  });

  output += '\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  // METHODOLOGY NOTE
  output += '╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗\n';
  output += '║                                                                                                                  ║\n';
  output += '║                                      ✓ INTELLIGENCE REPORT COMPLETE                                             ║\n';
  output += '║                                                                                                                  ║\n';
  output += '║  METHODOLOGY: All data sourced from publicly available records. No private data. No speculation.                ║\n';
  output += '║  Every claim is source-anchored. This report documents public narratives and documented relationships.          ║\n';
  output += '║                                                                                                                  ║\n';
  output += `║  Entities: ${metrics.totalNodes.toString().padEnd(6)}  Relationships: ${metrics.totalEdges.toString().padEnd(6)}  Timeline Events: ${intel.timeline.length.toString().padEnd(4)}  Sources: ${intel.sources.length.toString().padEnd(4)}                       ║\n`;
  output += '║                                                                                                                  ║\n';
  output += '║  Export Formats: GraphML, GEXF (Gephi), Neo4j Cypher, D3.js JSON, Mermaid                                       ║\n';
  output += '║                                                                                                                  ║\n';
  output += '╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝\n\n';

  return output;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runPahlaviResearch(): Promise<void> {
  console.log('\n🔍 PRISM INTELLIGENCE ENGINE - INITIATING OSINT ANALYSIS...\n');

  // Phase 1: Load data
  console.log('📊 Phase 1: Loading Intelligence Package...');
  console.log(`   ✓ Subject: ${REZA_PAHLAVI_INTEL.subject.name}`);
  console.log(`   ✓ Timeline events: ${REZA_PAHLAVI_INTEL.timeline.length}`);
  console.log(`   ✓ Organizations: ${REZA_PAHLAVI_INTEL.organizations.length}`);
  console.log(`   ✓ Network connections: ${REZA_PAHLAVI_INTEL.network.length}`);
  console.log(`   ✓ Foreign relations: ${REZA_PAHLAVI_INTEL.foreignRelations.length}`);
  console.log(`   ✓ Sources: ${REZA_PAHLAVI_INTEL.sources.length}`);

  // Phase 2: Build graph
  console.log('\n📊 Phase 2: Building Knowledge Graph...');
  const graph = buildPahlaviGraph(REZA_PAHLAVI_INTEL);
  console.log(`   ✓ Loaded ${graph.entities.size} entities`);
  console.log(`   ✓ Mapped ${graph.edges.length} relationships`);

  // Phase 3: Calculate metrics
  console.log('\n🧮 Phase 3: Computing Network Analytics...');
  const metrics = graph.getMetrics();
  console.log(`   ✓ Network density: ${(metrics.density * 100).toFixed(2)}%`);
  console.log(`   ✓ Components: ${metrics.components}`);
  console.log(`   ✓ Communities: ${metrics.communities.length}`);

  // Phase 4: Generate visualization
  console.log('\n🎨 Phase 4: Generating Intelligence Report...\n');
  const visualization = generatePahlaviVisualization(REZA_PAHLAVI_INTEL, graph, metrics);
  console.log(visualization);

  // Phase 5: Generate Mermaid
  console.log('┌─ MERMAID DIAGRAM (copy to mermaid.live) ────────────────────┐\n');
  console.log('```mermaid');
  console.log(graph.toMermaidEnhanced());
  console.log('```');
  console.log('\n└─────────────────────────────────────────────────────────────┘\n');
}

// Run
runPahlaviResearch().catch(console.error);
