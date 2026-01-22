/**
 * PRISM Intelligence Module
 *
 * Comprehensive influence network intelligence system for
 * analyzing Iranian regime connections and proxy networks.
 */

// Entity Graph
export {
  EntityGraph,
  entityGraph,
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
  RegimeAlignment,
  InfluencePath,
  ClusterAnalysis,
  RiskFactor
} from './entity-graph';

// Proxy Database
export {
  initializeProxyDatabase,
  matchKnownProxy,
  analyzeNarrativeAlignment,
  KNOWN_PROXIES,
  KEY_INDIVIDUALS,
  REGIME_NARRATIVES,
  SUSPICIOUS_EVENTS
} from './proxy-database';

// Funding Intelligence
export {
  FundingIntelligence,
  fundingIntelligence,
  FundingConnection,
  FundingAnalysis,
  FundingPattern,
  SanctionsCheck,
  FARACheck
} from './funding-intelligence';

// Influence Analyzer
export {
  InfluenceAnalyzer,
  influenceAnalyzer,
  InfluenceAnalysis,
  InfluenceIndicator,
  NetworkCentrality,
  CoordinatedBehaviorAnalysis
} from './influence-analyzer';

// Risk Engine
export {
  RiskEngine,
  riskEngine,
  ComprehensiveRiskAssessment,
  RiskClassification,
  CriticalFinding,
  RedFlag,
  WatchlistRecommendation
} from './risk-engine';

// Intelligence Visualizer
export {
  IntelligenceVisualizer,
  intelligenceVisualizer
} from './intelligence-visualizer';
