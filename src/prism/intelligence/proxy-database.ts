/**
 * PRISM Proxy & Front Organization Database
 *
 * Comprehensive database of known and suspected Iranian regime proxies,
 * front organizations, media outlets, lobbyists, and influence networks.
 *
 * Categories:
 * - Lobby Groups & NGOs
 * - Media Outlets
 * - Think Tanks & Academic Centers
 * - Business Fronts
 * - Government & IRGC Entities
 * - Key Individuals
 */

import {
  Entity,
  EntityType,
  RegimeAlignment,
  RiskFactor,
  entityGraph
} from './entity-graph';

// Helper to generate UUIDs
function generateId(): string {
  return 'entity-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Known Regime-Aligned Organizations
 */
export const KNOWN_PROXIES: Partial<Entity>[] = [
  // ==================== LOBBY GROUPS & NGOs ====================
  {
    name: 'National Iranian American Council',
    type: 'LOBBY_GROUP' as EntityType,
    aliases: ['NIAC', 'NIAC Action'],
    description: 'US-based advocacy organization frequently accused of promoting Iranian regime interests',
    regimeAlignment: 'SUSPECTED_PROXY' as RegimeAlignment,
    alignmentConfidence: 75,
    alignmentEvidence: [
      'Consistent opposition to sanctions on Iran',
      'Leadership with ties to Iranian officials',
      'Lost defamation lawsuit where evidence of regime ties was presented',
      'Opposes designation of IRGC as terrorist organization'
    ],
    sanctioned: false,
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 65,
    riskFactors: [
      {
        type: 'POLICY_ALIGNMENT',
        severity: 'HIGH',
        description: 'Consistently promotes policies favorable to Iranian regime',
        evidence: ['Anti-sanctions advocacy', 'Opposition to IRGC designation'],
        weight: 0.8
      }
    ]
  },
  {
    name: 'Alavi Foundation',
    type: 'FOUNDATION' as EntityType,
    aliases: ['Bonyad Alavi', 'Alavi Foundation of New York'],
    description: 'Foundation controlled by Iranian government, subject to forfeiture',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Federal court ruled it is controlled by Iranian government',
      '650 Fifth Avenue building subject to forfeiture',
      'Promotes Iranian cultural and religious programs'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2017-06-30'),
        reason: 'Controlled by Government of Iran',
        programCodes: ['IRAN']
      }
    ],
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 90,
    riskFactors: []
  },
  {
    name: 'Islamic Centre of England',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['ICEL', 'Islamic Center of England'],
    description: 'UK-based organization linked to Iranian Supreme Leader',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 90,
    alignmentEvidence: [
      'Directly reports to Office of Supreme Leader',
      'Promotes Khamenei ideology in UK',
      'Directors appointed by Tehran'
    ],
    sanctioned: true,
    country: 'UK',
    activeStatus: 'ACTIVE',
    riskScore: 85,
    riskFactors: []
  },

  // ==================== MEDIA OUTLETS ====================
  {
    name: 'Press TV',
    type: 'MEDIA_OUTLET' as EntityType,
    aliases: ['PressTV', 'Press TV News'],
    description: 'English-language state media of Islamic Republic of Iran',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Directly funded by IRIB (Islamic Republic of Iran Broadcasting)',
      'Controlled by Iranian government',
      'Broadcasts regime propaganda',
      'Banned in UK for broadcasting forced confessions'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'UK',
        listName: 'Ofcom Banned',
        dateAdded: new Date('2012-01-20'),
        reason: 'Broadcast forced confession of journalist',
        programCodes: []
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },
  {
    name: 'Fars News Agency',
    type: 'MEDIA_OUTLET' as EntityType,
    aliases: ['FNA', 'Fars News'],
    description: 'Semi-official news agency linked to IRGC',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Close ties to Islamic Revolutionary Guard Corps',
      'Publishes IRGC statements',
      'Promotes regime narratives'
    ],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 90,
    riskFactors: []
  },
  {
    name: 'Tasnim News Agency',
    type: 'MEDIA_OUTLET' as EntityType,
    aliases: ['Tasnim', 'TNA'],
    description: 'News agency affiliated with IRGC',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Founded by former IRIB employees',
      'Affiliated with IRGC',
      'Promotes hardline positions'
    ],
    sanctioned: false,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 85,
    riskFactors: []
  },
  {
    name: 'Al-Manar TV',
    type: 'MEDIA_OUTLET' as EntityType,
    aliases: ['Al Manar', 'Almanar'],
    description: 'Hezbollah television station funded by Iran',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Owned by Hezbollah',
      'Funded by Iranian regime',
      'Designated terrorist organization media'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2006-03-23'),
        reason: 'Hezbollah media arm',
        programCodes: ['SDGT']
      }
    ],
    country: 'Lebanon',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },
  {
    name: 'IRIB (Islamic Republic of Iran Broadcasting)',
    type: 'MEDIA_OUTLET' as EntityType,
    aliases: ['IRIB', 'Seda va Sima'],
    description: 'State broadcaster of Islamic Republic of Iran',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Official state broadcaster',
      'Controlled by Supreme Leader',
      'Produces all regime media content'
    ],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },

  // ==================== THINK TANKS & ACADEMIC ====================
  {
    name: 'Quincy Institute for Responsible Statecraft',
    type: 'THINK_TANK' as EntityType,
    aliases: ['Quincy Institute', 'QI'],
    description: 'Think tank advocating diplomatic engagement with Iran',
    regimeAlignment: 'REGIME_FRIENDLY' as RegimeAlignment,
    alignmentConfidence: 50,
    alignmentEvidence: [
      'Advocates ending sanctions on Iran',
      'Promotes diplomacy over pressure',
      'Some analysts with pro-engagement positions'
    ],
    sanctioned: false,
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 30,
    riskFactors: [
      {
        type: 'POLICY_ALIGNMENT',
        severity: 'MEDIUM',
        description: 'Promotes policies that benefit Iranian regime',
        evidence: ['Anti-sanctions research', 'Pro-JCPOA advocacy'],
        weight: 0.4
      }
    ]
  },
  {
    name: 'Institute for Policy Studies',
    type: 'THINK_TANK' as EntityType,
    aliases: ['IPS'],
    description: 'Progressive think tank, some Iran-related work',
    regimeAlignment: 'NEUTRAL' as RegimeAlignment,
    alignmentConfidence: 40,
    alignmentEvidence: [
      'Generally progressive foreign policy positions',
      'Some anti-sanctions advocacy'
    ],
    sanctioned: false,
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 15,
    riskFactors: []
  },

  // ==================== GOVERNMENT & IRGC ENTITIES ====================
  {
    name: 'Islamic Revolutionary Guard Corps',
    type: 'GOVERNMENT' as EntityType,
    aliases: ['IRGC', 'Sepah', 'Pasdaran', 'Revolutionary Guards'],
    description: 'Military force of Islamic Republic, designated terrorist organization',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Core military/intelligence arm of Iranian regime',
      'Controls major economic sectors',
      'Runs Quds Force for external operations'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'FTO',
        dateAdded: new Date('2019-04-15'),
        reason: 'Foreign Terrorist Organization',
        programCodes: ['SDGT', 'IRAN']
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Quds Force',
    type: 'GOVERNMENT' as EntityType,
    aliases: ['IRGC-QF', 'Qods Force', 'Jerusalem Force'],
    description: 'IRGC special forces unit for extraterritorial operations',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Runs Iranian proxy networks globally',
      'Conducts assassinations and terrorism',
      'Led by Esmail Qaani (formerly Qasem Soleimani)'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2007-10-25'),
        reason: 'Terrorism support',
        programCodes: ['SDGT', 'IRAN']
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Ministry of Intelligence and Security',
    type: 'GOVERNMENT' as EntityType,
    aliases: ['MOIS', 'VAJA', 'Vezarat-e Ettela\'at'],
    description: 'Primary intelligence agency of Islamic Republic',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Official intelligence ministry',
      'Conducts surveillance of diaspora',
      'Involved in assassinations abroad'
    ],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Basij',
    type: 'GOVERNMENT' as EntityType,
    aliases: ['Basij Resistance Force', 'Sazman-e Basij-e Mostazafin'],
    description: 'Paramilitary volunteer militia under IRGC',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Subordinate to IRGC',
      'Enforces regime control domestically',
      'Used to suppress protests'
    ],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },

  // ==================== BUSINESS FRONTS ====================
  {
    name: 'Khatam al-Anbiya Construction Headquarters',
    type: 'BUSINESS' as EntityType,
    aliases: ['Khatam al-Anbiya', 'Ghorb Khatam', 'Khatam-ol-Anbia'],
    description: 'IRGC-owned engineering conglomerate',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Wholly owned by IRGC',
      'Major infrastructure contractor',
      'Sanctions evasion vehicle'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2010-06-16'),
        reason: 'IRGC-owned enterprise',
        programCodes: ['IRAN']
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },
  {
    name: 'Bank Melli Iran',
    type: 'BUSINESS' as EntityType,
    aliases: ['BMI', 'Melli Bank'],
    description: 'Largest Iranian bank, used for sanctions evasion',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'State-owned bank',
      'Used to finance weapons programs',
      'Facilitates IRGC transactions'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2008-10-21'),
        reason: 'WMD proliferation financing',
        programCodes: ['NPWMD', 'IRAN']
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },
  {
    name: 'Mahan Air',
    type: 'BUSINESS' as EntityType,
    aliases: ['Mahan Airlines'],
    description: 'Airline used by IRGC-QF for weapons transport',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Provides transportation to Quds Force',
      'Transports weapons to Syria/Lebanon',
      'Owned by IRGC-affiliated entities'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'SDN',
        dateAdded: new Date('2011-10-12'),
        reason: 'Support for IRGC-QF',
        programCodes: ['IRAN', 'SDGT']
      }
    ],
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 90,
    riskFactors: []
  },

  // ==================== PROXY MILITIAS ====================
  {
    name: 'Hezbollah',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['Hizbollah', 'Hizballah', 'Party of God'],
    description: 'Lebanese militant group, primary Iranian proxy',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: [
      'Founded and funded by IRGC',
      'Receives $700M+ annually from Iran',
      'Follows Iranian Supreme Leader'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'FTO',
        dateAdded: new Date('1997-10-08'),
        reason: 'Foreign Terrorist Organization',
        programCodes: ['SDGT']
      }
    ],
    country: 'Lebanon',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Hamas',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['Islamic Resistance Movement'],
    description: 'Palestinian militant group with Iranian support',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 90,
    alignmentEvidence: [
      'Receives Iranian funding and weapons',
      'Military wing trained by IRGC',
      'Periodic tensions but overall allied'
    ],
    sanctioned: true,
    sanctionDetails: [
      {
        authority: 'OFAC',
        listName: 'FTO',
        dateAdded: new Date('1997-10-08'),
        reason: 'Foreign Terrorist Organization',
        programCodes: ['SDGT']
      }
    ],
    country: 'Palestine',
    activeStatus: 'ACTIVE',
    riskScore: 95,
    riskFactors: []
  },
  {
    name: 'Houthis',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['Ansar Allah', 'Ansarullah'],
    description: 'Yemeni militia backed by Iran',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Receives Iranian weapons and training',
      'Follows Velayat-e Faqih ideology',
      'Coordinated attacks with IRGC'
    ],
    sanctioned: true,
    country: 'Yemen',
    activeStatus: 'ACTIVE',
    riskScore: 90,
    riskFactors: []
  },
  {
    name: 'Popular Mobilization Forces',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['PMF', 'PMU', 'Hashd al-Shaabi', 'al-Hashd'],
    description: 'Iraqi umbrella militia with Iran-aligned factions',
    regimeAlignment: 'SUSPECTED_PROXY' as RegimeAlignment,
    alignmentConfidence: 80,
    alignmentEvidence: [
      'Several component militias loyal to Iran',
      'Kataib Hezbollah, Asaib Ahl al-Haq are IRGC proxies',
      'Some factions independent of Iran'
    ],
    sanctioned: false,
    country: 'Iraq',
    activeStatus: 'ACTIVE',
    riskScore: 75,
    riskFactors: []
  },

  // ==================== OPPOSITION ORGANIZATIONS (for comparison) ====================
  {
    name: 'National Council of Resistance of Iran',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['NCRI'],
    description: 'Iranian opposition coalition in exile',
    regimeAlignment: 'CONFIRMED_OPPOSITION' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Explicitly opposes Islamic Republic',
      'Advocates regime change',
      'Provides intelligence on regime activities'
    ],
    sanctioned: false,
    country: 'France',
    activeStatus: 'ACTIVE',
    riskScore: 5,
    riskFactors: []
  },
  {
    name: 'People\'s Mojahedin Organization of Iran',
    type: 'ORGANIZATION' as EntityType,
    aliases: ['MEK', 'PMOI', 'MKO', 'Mujahedin-e Khalq'],
    description: 'Iranian opposition group, formerly listed as terrorist',
    regimeAlignment: 'CONFIRMED_OPPOSITION' as RegimeAlignment,
    alignmentConfidence: 95,
    alignmentEvidence: [
      'Primary opposition militant group',
      'Removed from FTO list in 2012',
      'Based in Albania'
    ],
    sanctioned: false,
    country: 'Albania',
    activeStatus: 'ACTIVE',
    riskScore: 10,
    riskFactors: []
  }
];

/**
 * Regime Narrative Keywords & Hashtags
 * Used to detect alignment with regime messaging
 */
export const REGIME_NARRATIVES = {
  proRegime: {
    hashtags: [
      '#DeathToAmerica', '#DownWithUSA', '#MargBarAmrika',
      '#DeathToIsrael', '#DownWithIsrael',
      '#IslamicRepublic', '#IslamicRevolution',
      '#ImamKhomeini', '#Khamenei',
      '#AxisOfResistance', '#MoqawamaNow',
      '#SanctionsAreWar', '#EndSanctions', '#SanctionsTerrorism',
      '#JCPOA', '#SaveTheJCPOA',
      '#QasemSoleimani', '#SoleimaniMartyr', '#AbuMahdiAlMuhandis',
      '#Resistance', '#ResistanceAxis',
      '#Hezbollah', '#AnsarAllah', '#PMF'
    ],
    phrases: [
      'maximum pressure has failed',
      'sanctions are economic terrorism',
      'Iran\'s peaceful nuclear program',
      'resistance front',
      'axis of resistance',
      'imperial aggression',
      'American imperialism',
      'Zionist regime',
      'Zionist entity',
      'Israel is not legitimate',
      'legitimate resistance',
      'anti-imperialist struggle',
      'illegal sanctions',
      'unilateral sanctions',
      'Iran\'s legitimate defense',
      'defensive military capability'
    ],
    accounts: [
      '@khaboronline', '@PressTV', '@FarsNews_Agency', '@Aborwatch',
      '@Iran_GOV', '@ABORWATCH', '@ABORWATCH', '@IIKIRIB',
      '@khaboronline', '@ABORWATCH', '@kaboronline', '@ArreTakhti'
    ]
  },
  proOpposition: {
    hashtags: [
      '#MahsaAmini', '#مهسا_امینی', '#JinJiyanAzadi',
      '#WomanLifeFreedom', '#زن_زندگی_آزادی',
      '#IranRevolution', '#IranProtests', '#IranProtests2022',
      '#FreeIran', '#RegimeChange',
      '#PahlaviReza', '#KingRezaPahlavi',
      '#MEK', '#NCRI',
      '#IRGCterrorists', '#DesignateIRGC',
      '#StopExecutionsInIran', '#NoToIslamicRepublic',
      '#SayTheirNames',
      '#آزادی', '#براندازی'
    ],
    phrases: [
      'islamic republic must go',
      'down with dictator',
      'down with khamenei',
      'death to khamenei',
      'irgc terrorists',
      'regime change',
      'free iran',
      'secular democracy',
      'women life freedom',
      'mullah regime',
      'terrorist regime',
      'islamic fascism',
      'stop executions',
      'political prisoners'
    ],
    accounts: [
      '@PahlaviReza', '@Aborwatch', '@ArreTakhti', '@IranIntl',
      '@ManotoTV', '@RadioFarda', '@VOAIran', '@BBCPersian',
      '@ABORWATCH', '@IranNW', '@HengawO'
    ]
  }
};

/**
 * Key individuals in the Iranian influence network
 */
export const KEY_INDIVIDUALS: Partial<Entity>[] = [
  // Regime Officials
  {
    name: 'Ali Khamenei',
    type: 'PERSON' as EntityType,
    aliases: ['Supreme Leader', 'Ayatollah Khamenei', 'Rahbar'],
    description: 'Supreme Leader of Iran since 1989',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['Head of Islamic Republic'],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Ebrahim Raisi',
    type: 'PERSON' as EntityType,
    aliases: ['Raisi', 'President Raisi'],
    description: 'President of Iran (until 2024 death)',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['President of Iran', '1988 massacre participation'],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'INACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Esmail Qaani',
    type: 'PERSON' as EntityType,
    aliases: ['Ismail Ghaani', 'Qaani'],
    description: 'Commander of IRGC Quds Force',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['Leads Quds Force', 'Successor to Soleimani'],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },
  {
    name: 'Hossein Salami',
    type: 'PERSON' as EntityType,
    aliases: ['Major General Salami'],
    description: 'Commander-in-Chief of IRGC',
    regimeAlignment: 'CONFIRMED_REGIME' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['IRGC Commander'],
    sanctioned: true,
    country: 'Iran',
    activeStatus: 'ACTIVE',
    riskScore: 100,
    riskFactors: []
  },

  // Opposition Figures
  {
    name: 'Reza Pahlavi',
    type: 'PERSON' as EntityType,
    aliases: ['Crown Prince Reza Pahlavi', 'Prince Pahlavi', 'شاهزاده رضا پهلوی'],
    description: 'Crown Prince of Iran, opposition leader',
    regimeAlignment: 'CONFIRMED_OPPOSITION' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['Son of Shah', 'Leading opposition figure', 'Advocates secular democracy'],
    sanctioned: false,
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 0,
    riskFactors: []
  },
  {
    name: 'Masih Alinejad',
    type: 'PERSON' as EntityType,
    aliases: ['مسیح علی‌نژاد'],
    description: 'Iranian-American journalist and activist',
    regimeAlignment: 'CONFIRMED_OPPOSITION' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['Prominent regime critic', 'Target of assassination plot', 'Women\'s rights activist'],
    sanctioned: false,
    country: 'USA',
    activeStatus: 'ACTIVE',
    riskScore: 0,
    riskFactors: []
  },
  {
    name: 'Hamed Esmaeilion',
    type: 'PERSON' as EntityType,
    aliases: ['حامد اسماعیلیون'],
    description: 'Iranian-Canadian activist, leader of diaspora protests',
    regimeAlignment: 'CONFIRMED_OPPOSITION' as RegimeAlignment,
    alignmentConfidence: 100,
    alignmentEvidence: ['PS752 advocacy', 'Organized massive protests', 'Family killed by IRGC'],
    sanctioned: false,
    country: 'Canada',
    activeStatus: 'ACTIVE',
    riskScore: 0,
    riskFactors: []
  }
];

/**
 * Conference and Event Red Flags
 * Events known to be regime-aligned or infiltrated
 */
export const SUSPICIOUS_EVENTS = [
  {
    name: 'Tehran International Conference on Palestine',
    riskLevel: 'HIGH',
    reason: 'Regime-organized anti-Israel conference'
  },
  {
    name: 'Islamic Unity Conference',
    riskLevel: 'HIGH',
    reason: 'Annual regime propaganda event'
  },
  {
    name: 'New Horizon Conference',
    riskLevel: 'CRITICAL',
    reason: 'IRGC-linked influence operation targeting Western figures'
  },
  {
    name: 'Hollywoodism Conference',
    riskLevel: 'CRITICAL',
    reason: 'MOIS-organized propaganda event'
  }
];

/**
 * OFAC Program codes relevant to Iran
 */
export const IRAN_SANCTIONS_PROGRAMS = [
  'IRAN',      // Iran sanctions
  'IRAN-HR',   // Iran human rights
  'IRAN-TRA',  // Iran Transactions Regulations
  'SDGT',      // Specially Designated Global Terrorist
  'IFSR',      // Iranian Financial Sanctions Regulations
  'NPWMD',     // Nonproliferation of WMD
  'IRGC',      // IRGC-specific
];

/**
 * Initialize the entity graph with known proxies
 */
export function initializeProxyDatabase(): void {
  // Add known proxies
  for (const proxy of KNOWN_PROXIES) {
    const entity: Entity = {
      id: generateId(),
      name: proxy.name!,
      type: proxy.type!,
      aliases: proxy.aliases || [],
      description: proxy.description,
      regimeAlignment: proxy.regimeAlignment!,
      alignmentConfidence: proxy.alignmentConfidence || 0,
      alignmentEvidence: proxy.alignmentEvidence || [],
      sanctioned: proxy.sanctioned || false,
      sanctionDetails: proxy.sanctionDetails,
      country: proxy.country,
      activeStatus: proxy.activeStatus || 'UNKNOWN',
      riskScore: proxy.riskScore || 0,
      riskFactors: proxy.riskFactors || [],
      externalIds: {},
      lastUpdated: new Date(),
      sources: []
    };

    entityGraph.addEntity(entity);
  }

  // Add key individuals
  for (const individual of KEY_INDIVIDUALS) {
    const entity: Entity = {
      id: generateId(),
      name: individual.name!,
      type: individual.type!,
      aliases: individual.aliases || [],
      description: individual.description,
      regimeAlignment: individual.regimeAlignment!,
      alignmentConfidence: individual.alignmentConfidence || 0,
      alignmentEvidence: individual.alignmentEvidence || [],
      sanctioned: individual.sanctioned || false,
      country: individual.country,
      activeStatus: individual.activeStatus || 'UNKNOWN',
      riskScore: individual.riskScore || 0,
      riskFactors: individual.riskFactors || [],
      externalIds: {},
      lastUpdated: new Date(),
      sources: []
    };

    entityGraph.addEntity(entity);
  }

  console.log(`✅ Proxy database initialized with ${KNOWN_PROXIES.length + KEY_INDIVIDUALS.length} entities`);
}

/**
 * Check if an entity name matches any known proxy
 */
export function matchKnownProxy(name: string): Entity | null {
  return entityGraph.findEntityByName(name) || null;
}

/**
 * Get all entities by regime alignment
 */
export function getEntitiesByAlignment(alignment: RegimeAlignment): Entity[] {
  const results: Entity[] = [];
  // This would iterate through the graph - for now simplified
  return results;
}

/**
 * Analyze text for regime narrative alignment
 */
export function analyzeNarrativeAlignment(text: string): {
  proRegimeScore: number;
  proOppositionScore: number;
  detectedHashtags: { tag: string; alignment: 'REGIME' | 'OPPOSITION' }[];
  detectedPhrases: { phrase: string; alignment: 'REGIME' | 'OPPOSITION' }[];
} {
  const lowerText = text.toLowerCase();

  let proRegimeScore = 0;
  let proOppositionScore = 0;
  const detectedHashtags: { tag: string; alignment: 'REGIME' | 'OPPOSITION' }[] = [];
  const detectedPhrases: { phrase: string; alignment: 'REGIME' | 'OPPOSITION' }[] = [];

  // Check regime hashtags
  for (const tag of REGIME_NARRATIVES.proRegime.hashtags) {
    if (lowerText.includes(tag.toLowerCase())) {
      proRegimeScore += 10;
      detectedHashtags.push({ tag, alignment: 'REGIME' });
    }
  }

  // Check opposition hashtags
  for (const tag of REGIME_NARRATIVES.proOpposition.hashtags) {
    if (lowerText.includes(tag.toLowerCase())) {
      proOppositionScore += 10;
      detectedHashtags.push({ tag, alignment: 'OPPOSITION' });
    }
  }

  // Check regime phrases
  for (const phrase of REGIME_NARRATIVES.proRegime.phrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      proRegimeScore += 15;
      detectedPhrases.push({ phrase, alignment: 'REGIME' });
    }
  }

  // Check opposition phrases
  for (const phrase of REGIME_NARRATIVES.proOpposition.phrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      proOppositionScore += 15;
      detectedPhrases.push({ phrase, alignment: 'OPPOSITION' });
    }
  }

  return {
    proRegimeScore: Math.min(100, proRegimeScore),
    proOppositionScore: Math.min(100, proOppositionScore),
    detectedHashtags,
    detectedPhrases
  };
}
