/**
 * PRISM Web Server
 *
 * Simple web interface for intelligence analysis
 * - Single search box UI
 * - Automatic analysis pipeline
 * - Interactive graph visualization
 * - Name disambiguation
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import { riskEngine } from '../intelligence/risk-engine';
import { vectorIntelligence } from '../intelligence/vector-intelligence';
import { entityGraph } from '../intelligence/entity-graph';
import { KNOWN_PROXIES, KEY_INDIVIDUALS } from '../intelligence/proxy-database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Types
interface SearchResult {
  id: string;
  name: string;
  type: string;
  description?: string;
  regimeAlignment: string;
  riskScore: number;
  sanctioned: boolean;
  country?: string;
  aliases: string[];
}

interface DisambiguationOption {
  id: string;
  name: string;
  type: string;
  description?: string;
  country?: string;
  matchScore: number;
}

interface GraphNode {
  id: string;
  name: string;
  type: string;
  group: 'regime' | 'opposition' | 'neutral' | 'subject';
  riskScore: number;
  sanctioned: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface AnalysisResult {
  subject: string;
  classification: string;
  riskScore: number;
  confidence: number;
  criticalFindings: {
    severity: string;
    title: string;
    description: string;
  }[];
  scores: {
    directRegimeConnection: number;
    proxyConnection: number;
    financialRisk: number;
    influenceRisk: number;
    narrativeAlignment: number;
    networkCentrality: number;
  };
  graph: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  redFlags: string[];
  recommendations: string[];
  timestamp: string;
}

/**
 * API: Search/Disambiguation
 * Returns matching entities for disambiguation if multiple matches
 */
app.get('/api/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query || query.trim().length < 2) {
    return res.json({ matches: [], needsDisambiguation: false });
  }

  try {
    const normalizedQuery = query.toLowerCase().trim();
    const matches: DisambiguationOption[] = [];

    // Search known entities
    for (const entity of [...KNOWN_PROXIES, ...KEY_INDIVIDUALS]) {
      if (!entity.name) continue;

      let matchScore = 0;

      // Exact name match
      if (entity.name.toLowerCase() === normalizedQuery) {
        matchScore = 100;
      }
      // Name contains query
      else if (entity.name.toLowerCase().includes(normalizedQuery)) {
        matchScore = 80;
      }
      // Query contains name
      else if (normalizedQuery.includes(entity.name.toLowerCase())) {
        matchScore = 70;
      }
      // Alias match
      else if (entity.aliases?.some(a => a.toLowerCase() === normalizedQuery)) {
        matchScore = 95;
      }
      // Alias contains query
      else if (entity.aliases?.some(a => a.toLowerCase().includes(normalizedQuery))) {
        matchScore = 75;
      }

      if (matchScore > 0) {
        matches.push({
          id: `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: entity.name,
          type: entity.type || 'UNKNOWN',
          description: entity.description,
          country: entity.country,
          matchScore
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // If no matches in database, allow free-form search
    if (matches.length === 0) {
      return res.json({
        matches: [{
          id: `search-${normalizedQuery.replace(/\s+/g, '-')}`,
          name: query.trim(),
          type: 'SEARCH',
          description: 'New search query',
          matchScore: 50
        }],
        needsDisambiguation: false
      });
    }

    // Need disambiguation if multiple high-scoring matches
    const highMatches = matches.filter(m => m.matchScore >= 70);
    const needsDisambiguation = highMatches.length > 1;

    return res.json({
      matches: matches.slice(0, 10),
      needsDisambiguation
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * API: Full Analysis
 * Runs complete intelligence analysis on a subject
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { subject, entityId } = req.body;

  if (!subject) {
    return res.status(400).json({ error: 'Subject name required' });
  }

  try {
    console.log(`\n🔍 Web Analysis Request: ${subject}`);

    // Initialize engines
    await riskEngine.initialize();
    await vectorIntelligence.initialize();

    // Run comprehensive risk assessment
    const assessment = await riskEngine.assessRisk(subject);

    // Build graph data
    const graph = buildGraphData(subject, assessment);

    // Format response
    const result: AnalysisResult = {
      subject: assessment.subject,
      classification: assessment.riskClassification,
      riskScore: assessment.scores.overallRisk,
      confidence: assessment.confidence,
      criticalFindings: assessment.criticalFindings.map(f => ({
        severity: f.severity,
        title: f.title,
        description: f.description
      })),
      scores: {
        directRegimeConnection: assessment.scores.directRegimeConnection,
        proxyConnection: assessment.scores.proxyConnection,
        financialRisk: assessment.scores.financialRisk,
        influenceRisk: assessment.scores.influenceRisk,
        narrativeAlignment: assessment.scores.narrativeAlignment,
        networkCentrality: assessment.scores.networkCentrality
      },
      graph,
      redFlags: assessment.redFlags.map(f => f.description),
      recommendations: assessment.suggestedActions,
      timestamp: new Date().toISOString()
    };

    return res.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * API: Get known entities for browsing
 */
app.get('/api/entities', async (_req: Request, res: Response) => {
  try {
    const entities: SearchResult[] = [];

    for (const entity of [...KNOWN_PROXIES, ...KEY_INDIVIDUALS]) {
      if (!entity.name) continue;

      entities.push({
        id: `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: entity.name,
        type: entity.type || 'UNKNOWN',
        description: entity.description,
        regimeAlignment: entity.regimeAlignment || 'UNKNOWN',
        riskScore: entity.riskScore || 0,
        sanctioned: entity.sanctioned || false,
        country: entity.country,
        aliases: entity.aliases || []
      });
    }

    return res.json({ entities });

  } catch (error) {
    console.error('Entities error:', error);
    return res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

/**
 * API: Get clusters
 */
app.get('/api/clusters', async (_req: Request, res: Response) => {
  try {
    const clusters = await vectorIntelligence.detectClusters();
    return res.json({ clusters });
  } catch (error) {
    console.error('Clusters error:', error);
    return res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

/**
 * Build graph data for visualization
 */
function buildGraphData(subject: string, assessment: any): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const addedNodes = new Set<string>();

  // Add subject as central node
  const subjectId = `subject-${subject.toLowerCase().replace(/\s+/g, '-')}`;
  nodes.push({
    id: subjectId,
    name: subject,
    type: assessment.entityProfile?.type || 'PERSON',
    group: 'subject',
    riskScore: assessment.scores.overallRisk,
    sanctioned: assessment.entityProfile?.sanctioned || false
  });
  addedNodes.add(subjectId);

  // Add related entities from known database
  const relatedEntities = findRelatedEntities(subject);

  for (const entity of relatedEntities) {
    const entityId = `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`;

    if (!addedNodes.has(entityId)) {
      const group = entity.regimeAlignment === 'CONFIRMED_REGIME' || entity.regimeAlignment === 'KNOWN_PROXY'
        ? 'regime'
        : entity.regimeAlignment === 'CONFIRMED_OPPOSITION' || entity.regimeAlignment === 'OPPOSITION_FRIENDLY'
          ? 'opposition'
          : 'neutral';

      nodes.push({
        id: entityId,
        name: entity.name,
        type: entity.type || 'UNKNOWN',
        group,
        riskScore: entity.riskScore || 0,
        sanctioned: entity.sanctioned || false
      });
      addedNodes.add(entityId);

      // Add link to subject
      links.push({
        source: subjectId,
        target: entityId,
        type: 'RELATED',
        strength: 0.5
      });
    }
  }

  // Add some regime entities for context
  const regimeEntities = KNOWN_PROXIES.filter(e =>
    e.regimeAlignment === 'CONFIRMED_REGIME'
  ).slice(0, 5);

  for (const entity of regimeEntities) {
    if (!entity.name) continue;
    const entityId = `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`;

    if (!addedNodes.has(entityId)) {
      nodes.push({
        id: entityId,
        name: entity.name,
        type: entity.type || 'UNKNOWN',
        group: 'regime',
        riskScore: entity.riskScore || 0,
        sanctioned: entity.sanctioned || false
      });
      addedNodes.add(entityId);
    }
  }

  // Add opposition entities for context
  const oppositionEntities = [...KNOWN_PROXIES, ...KEY_INDIVIDUALS].filter(e =>
    e.regimeAlignment === 'CONFIRMED_OPPOSITION'
  ).slice(0, 3);

  for (const entity of oppositionEntities) {
    if (!entity.name) continue;
    const entityId = `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`;

    if (!addedNodes.has(entityId)) {
      nodes.push({
        id: entityId,
        name: entity.name,
        type: entity.type || 'UNKNOWN',
        group: 'opposition',
        riskScore: entity.riskScore || 0,
        sanctioned: entity.sanctioned || false
      });
      addedNodes.add(entityId);
    }
  }

  // Add inter-entity links based on alignment
  const regimeNodes = nodes.filter(n => n.group === 'regime');
  for (let i = 0; i < regimeNodes.length - 1; i++) {
    links.push({
      source: regimeNodes[i].id,
      target: regimeNodes[i + 1].id,
      type: 'ALIGNED',
      strength: 0.3
    });
  }

  return { nodes, links };
}

/**
 * Find entities related to a subject
 */
function findRelatedEntities(subject: string): any[] {
  const normalizedSubject = subject.toLowerCase();
  const related: any[] = [];

  // Find exact or partial matches
  for (const entity of [...KNOWN_PROXIES, ...KEY_INDIVIDUALS]) {
    if (!entity.name) continue;

    if (entity.name.toLowerCase() === normalizedSubject) {
      // This is the subject itself, find its cluster
      continue;
    }

    if (entity.name.toLowerCase().includes(normalizedSubject) ||
        normalizedSubject.includes(entity.name.toLowerCase())) {
      related.push(entity);
    }
  }

  // If subject matches a known entity, include related entities
  const subjectEntity = KNOWN_PROXIES.find(e =>
    e.name?.toLowerCase() === normalizedSubject ||
    e.aliases?.some(a => a.toLowerCase() === normalizedSubject)
  );

  if (subjectEntity) {
    // Add entities with same alignment
    const sameAlignment = KNOWN_PROXIES.filter(e =>
      e.name !== subjectEntity.name &&
      e.regimeAlignment === subjectEntity.regimeAlignment
    ).slice(0, 5);

    related.push(...sameAlignment);
  }

  return related;
}

// Serve frontend
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ██████╗ ██████╗ ██╗███████╗███╗   ███╗                            ║
║   ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║                            ║
║   ██████╔╝██████╔╝██║███████╗██╔████╔██║                            ║
║   ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║                            ║
║   ██║     ██║  ██║██║███████║██║ ╚═╝ ██║                            ║
║   ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝                            ║
║                                                                      ║
║   Intelligence Analysis Web Interface                                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

🌐 Server running at http://localhost:${PORT}

Enter a name in the search box to begin analysis.
`);
});

export default app;
