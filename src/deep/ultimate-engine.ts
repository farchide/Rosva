/**
 * ROSVA ULTIMATE RESEARCH ENGINE v3.0
 *
 * Maximum capability deep intelligence system with:
 * - Multi-source OSINT collection
 * - Breach/leak detection
 * - Infrastructure intelligence (DNS, WHOIS, SSL)
 * - Historical analysis (Wayback Machine)
 * - Advanced network algorithms (PageRank, HITS, Betweenness)
 * - NLP entity extraction
 * - Sentiment analysis
 * - Multi-format export (GraphML, Neo4j, Gephi, JSON)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  attributes: Map<string, any>;
  confidence: number;
  sources: string[];
  sentiment?: SentimentScore;
  riskScore?: number;
  firstSeen: Date;
  lastSeen: Date;
}

export type EntityType =
  | 'PERSON' | 'COMPANY' | 'ORGANIZATION' | 'PRODUCT' | 'TECHNOLOGY'
  | 'EVENT' | 'LOCATION' | 'PATENT' | 'PUBLICATION' | 'DOMAIN'
  | 'EMAIL' | 'PHONE' | 'SOCIAL_ACCOUNT' | 'CREDENTIAL' | 'IP_ADDRESS';

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight: number;
  evidence: Evidence[];
  temporal?: { start?: Date; end?: Date };
  sentiment?: number;
}

export type EdgeType =
  | 'FOUNDED' | 'CEO_OF' | 'WORKS_AT' | 'WORKED_AT' | 'INVESTED_IN'
  | 'ACQUIRED' | 'PARTNERED_WITH' | 'COMPETITOR_OF' | 'KNOWS'
  | 'COLLABORATED_WITH' | 'QUOTED_BY' | 'SPOKE_AT' | 'AUTHORED'
  | 'INVENTED' | 'EDUCATED_AT' | 'LOCATED_IN' | 'FAMILY_OF'
  | 'INFLUENCED_BY' | 'MEMBER_OF' | 'OWNS_DOMAIN' | 'USES_EMAIL'
  | 'BREACHED_AT' | 'MENTIONED_IN' | 'LINKED_TO'
  | 'MARRIED_TO' | 'CHILD_OF' | 'PARENT_OF' | 'SIBLING_OF'
  | 'ADVISED_BY' | 'MET_WITH' | 'ENDORSED_BY' | 'ASSOCIATED_WITH';

export interface Evidence {
  source: string;
  url: string;
  snippet: string;
  date: Date;
  reliability: number;
  archived?: boolean;
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  compound: number;
}

export interface BreachRecord {
  name: string;
  domain: string;
  breachDate: Date;
  addedDate: Date;
  modifiedDate: Date;
  pwnCount: number;
  description: string;
  dataClasses: string[];
  isVerified: boolean;
  isSensitive: boolean;
}

export interface DomainIntel {
  domain: string;
  registrar?: string;
  createdDate?: Date;
  expiryDate?: Date;
  nameservers: string[];
  emails: string[];
  ipAddresses: string[];
  sslCert?: SSLCertInfo;
  subdomains: string[];
  technologies: string[];
}

export interface SSLCertInfo {
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  altNames: string[];
}

export interface WaybackSnapshot {
  url: string;
  timestamp: Date;
  statusCode: number;
  digest: string;
  mimeType: string;
}

export interface NetworkMetrics {
  totalNodes: number;
  totalEdges: number;
  density: number;
  avgClustering: number;
  diameter: number;
  components: number;
  centralityScores: {
    degree: Map<string, number>;
    betweenness: Map<string, number>;
    pageRank: Map<string, number>;
    hits: { hubs: Map<string, number>; authorities: Map<string, number> };
  };
  influencers: string[];
  communities: string[][];
}

// ============================================================================
// ULTIMATE KNOWLEDGE GRAPH
// ============================================================================

export class UltimateKnowledgeGraph {
  entities: Map<string, Entity> = new Map();
  edges: Edge[] = [];
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacency: Map<string, Set<string>> = new Map();

  addEntity(entity: Entity): void {
    const existing = this.entities.get(entity.id);
    if (existing) {
      existing.aliases = [...new Set([...existing.aliases, ...entity.aliases])];
      existing.sources = [...new Set([...existing.sources, ...entity.sources])];
      existing.confidence = Math.max(existing.confidence, entity.confidence);
      existing.lastSeen = new Date();
      entity.attributes.forEach((v, k) => existing.attributes.set(k, v));
    } else {
      this.entities.set(entity.id, entity);
      this.adjacencyList.set(entity.id, new Set());
      this.reverseAdjacency.set(entity.id, new Set());
    }
  }

  addEdge(edge: Edge): void {
    const existing = this.edges.find(e =>
      e.from === edge.from && e.to === edge.to && e.type === edge.type
    );
    if (existing) {
      existing.weight = Math.max(existing.weight, edge.weight);
      existing.evidence.push(...edge.evidence);
    } else {
      this.edges.push(edge);
      this.adjacencyList.get(edge.from)?.add(edge.to);
      this.reverseAdjacency.get(edge.to)?.add(edge.from);
    }
  }

  // PageRank algorithm
  calculatePageRank(iterations: number = 100, dampingFactor: number = 0.85): Map<string, number> {
    const n = this.entities.size;
    if (n === 0) return new Map();

    const ranks = new Map<string, number>();
    const ids = Array.from(this.entities.keys());

    // Initialize
    ids.forEach(id => ranks.set(id, 1 / n));

    // Iterate
    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map<string, number>();

      ids.forEach(id => {
        let rank = (1 - dampingFactor) / n;
        const inbound = this.reverseAdjacency.get(id) || new Set();

        inbound.forEach(source => {
          const outDegree = this.adjacencyList.get(source)?.size || 1;
          rank += dampingFactor * (ranks.get(source) || 0) / outDegree;
        });

        newRanks.set(id, rank);
      });

      ranks.clear();
      newRanks.forEach((v, k) => ranks.set(k, v));
    }

    return ranks;
  }

  // HITS algorithm (Hubs and Authorities)
  calculateHITS(iterations: number = 100): { hubs: Map<string, number>; authorities: Map<string, number> } {
    const ids = Array.from(this.entities.keys());
    const hubs = new Map<string, number>();
    const authorities = new Map<string, number>();

    // Initialize
    ids.forEach(id => {
      hubs.set(id, 1);
      authorities.set(id, 1);
    });

    // Iterate
    for (let i = 0; i < iterations; i++) {
      // Update authorities
      ids.forEach(id => {
        let auth = 0;
        const inbound = this.reverseAdjacency.get(id) || new Set();
        inbound.forEach(source => auth += hubs.get(source) || 0);
        authorities.set(id, auth);
      });

      // Update hubs
      ids.forEach(id => {
        let hub = 0;
        const outbound = this.adjacencyList.get(id) || new Set();
        outbound.forEach(target => hub += authorities.get(target) || 0);
        hubs.set(id, hub);
      });

      // Normalize
      const authNorm = Math.sqrt(Array.from(authorities.values()).reduce((a, b) => a + b * b, 0)) || 1;
      const hubNorm = Math.sqrt(Array.from(hubs.values()).reduce((a, b) => a + b * b, 0)) || 1;

      authorities.forEach((v, k) => authorities.set(k, v / authNorm));
      hubs.forEach((v, k) => hubs.set(k, v / hubNorm));
    }

    return { hubs, authorities };
  }

  // Betweenness centrality
  calculateBetweenness(): Map<string, number> {
    const betweenness = new Map<string, number>();
    const ids = Array.from(this.entities.keys());

    ids.forEach(id => betweenness.set(id, 0));

    ids.forEach(source => {
      const stack: string[] = [];
      const predecessors = new Map<string, string[]>();
      const sigma = new Map<string, number>();
      const distance = new Map<string, number>();

      ids.forEach(id => {
        predecessors.set(id, []);
        sigma.set(id, 0);
        distance.set(id, -1);
      });

      sigma.set(source, 1);
      distance.set(source, 0);

      const queue: string[] = [source];

      while (queue.length > 0) {
        const v = queue.shift()!;
        stack.push(v);

        const neighbors = this.adjacencyList.get(v) || new Set();
        neighbors.forEach(w => {
          if (distance.get(w)! < 0) {
            queue.push(w);
            distance.set(w, distance.get(v)! + 1);
          }
          if (distance.get(w) === distance.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            predecessors.get(w)!.push(v);
          }
        });
      }

      const delta = new Map<string, number>();
      ids.forEach(id => delta.set(id, 0));

      while (stack.length > 0) {
        const w = stack.pop()!;
        predecessors.get(w)!.forEach(v => {
          delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
        });
        if (w !== source) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
        }
      }
    });

    // Normalize
    const n = ids.length;
    if (n > 2) {
      const norm = 2 / ((n - 1) * (n - 2));
      betweenness.forEach((v, k) => betweenness.set(k, v * norm));
    }

    return betweenness;
  }

  // Community detection (Louvain-like)
  detectCommunities(): string[][] {
    const communities: string[][] = [];
    const visited = new Set<string>();

    this.entities.forEach((_, id) => {
      if (!visited.has(id)) {
        const community: string[] = [];
        this.bfs(id, visited, community);
        if (community.length > 0) {
          communities.push(community);
        }
      }
    });

    return communities.sort((a, b) => b.length - a.length);
  }

  private bfs(start: string, visited: Set<string>, community: string[]): void {
    const queue = [start];
    visited.add(start);
    community.push(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = new Set([
        ...(this.adjacencyList.get(current) || []),
        ...(this.reverseAdjacency.get(current) || [])
      ]);

      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          community.push(neighbor);
          queue.push(neighbor);
        }
      });
    }
  }

  // Get comprehensive metrics
  getMetrics(): NetworkMetrics {
    const pageRank = this.calculatePageRank();
    const hits = this.calculateHITS();
    const betweenness = this.calculateBetweenness();
    const communities = this.detectCommunities();

    const n = this.entities.size;
    const m = this.edges.length;
    const maxEdges = n * (n - 1);
    const density = maxEdges > 0 ? m / maxEdges : 0;

    // Degree centrality
    const degree = new Map<string, number>();
    this.entities.forEach((_, id) => {
      const out = this.adjacencyList.get(id)?.size || 0;
      const inD = this.reverseAdjacency.get(id)?.size || 0;
      degree.set(id, out + inD);
    });

    // Top influencers by PageRank
    const sortedByPR = Array.from(pageRank.entries()).sort((a, b) => b[1] - a[1]);
    const influencers = sortedByPR.slice(0, 10).map(([id]) => id);

    return {
      totalNodes: n,
      totalEdges: m,
      density,
      avgClustering: 0, // Would need triangle counting
      diameter: 0, // Would need all-pairs shortest paths
      components: communities.length,
      centralityScores: {
        degree,
        betweenness,
        pageRank,
        hits
      },
      influencers,
      communities
    };
  }

  // Export to GraphML
  toGraphML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
    xml += '  <key id="name" for="node" attr.name="name" attr.type="string"/>\n';
    xml += '  <key id="type" for="node" attr.name="type" attr.type="string"/>\n';
    xml += '  <key id="confidence" for="node" attr.name="confidence" attr.type="double"/>\n';
    xml += '  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>\n';
    xml += '  <key id="reltype" for="edge" attr.name="reltype" attr.type="string"/>\n';
    xml += '  <graph id="G" edgedefault="directed">\n';

    this.entities.forEach((entity, id) => {
      xml += `    <node id="${this.escapeXml(id)}">\n`;
      xml += `      <data key="name">${this.escapeXml(entity.name)}</data>\n`;
      xml += `      <data key="type">${entity.type}</data>\n`;
      xml += `      <data key="confidence">${entity.confidence}</data>\n`;
      xml += '    </node>\n';
    });

    this.edges.forEach((edge, i) => {
      xml += `    <edge id="e${i}" source="${this.escapeXml(edge.from)}" target="${this.escapeXml(edge.to)}">\n`;
      xml += `      <data key="weight">${edge.weight}</data>\n`;
      xml += `      <data key="reltype">${edge.type}</data>\n`;
      xml += '    </edge>\n';
    });

    xml += '  </graph>\n';
    xml += '</graphml>';
    return xml;
  }

  // Export for Neo4j Cypher
  toCypher(): string {
    let cypher = '// Neo4j Import Script\n';
    cypher += '// Generated by Rosva Deep Research Engine\n\n';

    // Create nodes
    cypher += '// === NODES ===\n';
    this.entities.forEach((entity, id) => {
      const props = {
        name: entity.name,
        confidence: entity.confidence,
        aliases: entity.aliases,
        sources: entity.sources
      };
      cypher += `CREATE (n:${entity.type} {id: "${this.escapeString(id)}", ${this.propsToString(props)}})\n`;
    });

    cypher += '\n// === RELATIONSHIPS ===\n';
    this.edges.forEach(edge => {
      cypher += `MATCH (a {id: "${this.escapeString(edge.from)}"}), (b {id: "${this.escapeString(edge.to)}"})\n`;
      cypher += `CREATE (a)-[:${edge.type} {weight: ${edge.weight}}]->(b)\n`;
    });

    return cypher;
  }

  // Export JSON for D3.js visualization
  toD3JSON(): string {
    const nodes = Array.from(this.entities.values()).map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      confidence: e.confidence,
      group: e.type
    }));

    const links = this.edges.map(e => ({
      source: e.from,
      target: e.to,
      type: e.type,
      weight: e.weight
    }));

    return JSON.stringify({ nodes, links }, null, 2);
  }

  // Export for Gephi
  toGEXF(): string {
    let gexf = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gexf += '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">\n';
    gexf += '  <meta lastmodifieddate="' + new Date().toISOString().split('T')[0] + '">\n';
    gexf += '    <creator>Rosva Deep Research Engine</creator>\n';
    gexf += '  </meta>\n';
    gexf += '  <graph defaultedgetype="directed">\n';
    gexf += '    <attributes class="node">\n';
    gexf += '      <attribute id="0" title="type" type="string"/>\n';
    gexf += '      <attribute id="1" title="confidence" type="float"/>\n';
    gexf += '    </attributes>\n';
    gexf += '    <nodes>\n';

    this.entities.forEach((entity, id) => {
      gexf += `      <node id="${this.escapeXml(id)}" label="${this.escapeXml(entity.name)}">\n`;
      gexf += '        <attvalues>\n';
      gexf += `          <attvalue for="0" value="${entity.type}"/>\n`;
      gexf += `          <attvalue for="1" value="${entity.confidence}"/>\n`;
      gexf += '        </attvalues>\n';
      gexf += '      </node>\n';
    });

    gexf += '    </nodes>\n';
    gexf += '    <edges>\n';

    this.edges.forEach((edge, i) => {
      gexf += `      <edge id="${i}" source="${this.escapeXml(edge.from)}" target="${this.escapeXml(edge.to)}" weight="${edge.weight}" label="${edge.type}"/>\n`;
    });

    gexf += '    </edges>\n';
    gexf += '  </graph>\n';
    gexf += '</gexf>';
    return gexf;
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private escapeString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private propsToString(props: Record<string, any>): string {
    return Object.entries(props)
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          return `${k}: [${v.map(x => `"${this.escapeString(String(x))}"`).join(', ')}]`;
        }
        return `${k}: "${this.escapeString(String(v))}"`;
      })
      .join(', ');
  }

  // Mermaid with enhanced styling
  toMermaidEnhanced(): string {
    let mermaid = 'graph LR\n';
    mermaid += '    %% Rosva Ultimate Knowledge Graph\n\n';

    // Group entities by type
    const byType = new Map<EntityType, Entity[]>();
    this.entities.forEach(e => {
      if (!byType.has(e.type)) byType.set(e.type, []);
      byType.get(e.type)!.push(e);
    });

    // Subgraphs for each type
    byType.forEach((entities, type) => {
      mermaid += `    subgraph ${type}\n`;
      entities.forEach(e => {
        const safeId = e.id.replace(/[^a-zA-Z0-9]/g, '_');
        const icon = this.getIcon(e.type);
        mermaid += `        ${safeId}["${icon} ${e.name.substring(0, 30)}"]\n`;
      });
      mermaid += '    end\n\n';
    });

    // Edges with styling based on weight
    this.edges.forEach(edge => {
      const from = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
      const to = edge.to.replace(/[^a-zA-Z0-9]/g, '_');

      if (edge.weight >= 0.8) {
        mermaid += `    ${from} ==="${edge.type}"==> ${to}\n`;
      } else if (edge.weight >= 0.5) {
        mermaid += `    ${from} --"${edge.type}"--> ${to}\n`;
      } else {
        mermaid += `    ${from} -."${edge.type}".- ${to}\n`;
      }
    });

    // Styling
    mermaid += '\n    %% Styling\n';
    mermaid += '    classDef person fill:#bbdefb,stroke:#1976d2,stroke-width:2px\n';
    mermaid += '    classDef company fill:#ffe0b2,stroke:#f57c00,stroke-width:2px\n';
    mermaid += '    classDef tech fill:#e1bee7,stroke:#7b1fa2,stroke-width:2px\n';
    mermaid += '    classDef breach fill:#ffcdd2,stroke:#c62828,stroke-width:3px\n';

    return mermaid;
  }

  private getIcon(type: EntityType): string {
    const icons: Record<EntityType, string> = {
      PERSON: '👤',
      COMPANY: '🏢',
      ORGANIZATION: '🏛️',
      PRODUCT: '📦',
      TECHNOLOGY: '⚙️',
      EVENT: '📅',
      LOCATION: '📍',
      PATENT: '📜',
      PUBLICATION: '📄',
      DOMAIN: '🌐',
      EMAIL: '📧',
      PHONE: '📱',
      SOCIAL_ACCOUNT: '💬',
      CREDENTIAL: '🔐',
      IP_ADDRESS: '🖥️'
    };
    return icons[type] || '❓';
  }
}

// ============================================================================
// SENTIMENT ANALYZER
// ============================================================================

export class SentimentAnalyzer {
  private positiveWords = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding',
    'innovative', 'successful', 'leading', 'award', 'recognition', 'growth', 'profit',
    'partnership', 'collaboration', 'breakthrough', 'pioneer', 'trusted', 'reliable'
  ]);

  private negativeWords = new Set([
    'bad', 'poor', 'terrible', 'awful', 'horrible', 'failed', 'failure', 'scandal',
    'controversy', 'lawsuit', 'breach', 'hack', 'fraud', 'accused', 'alleged',
    'investigation', 'violation', 'penalty', 'fine', 'bankrupt', 'crisis'
  ]);

  analyze(text: string): SentimentScore {
    const words = text.toLowerCase().split(/\W+/);
    let positive = 0;
    let negative = 0;
    let total = 0;

    words.forEach(word => {
      if (this.positiveWords.has(word)) positive++;
      if (this.negativeWords.has(word)) negative++;
      total++;
    });

    const neutral = total - positive - negative;
    const compound = total > 0 ? (positive - negative) / total : 0;

    return {
      positive: total > 0 ? positive / total : 0,
      negative: total > 0 ? negative / total : 0,
      neutral: total > 0 ? neutral / total : 0,
      compound
    };
  }
}

// ============================================================================
// ENTITY EXTRACTOR (NLP)
// ============================================================================

export class EntityExtractor {
  // Patterns for entity extraction
  private patterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /\+?[\d\s\-().]{10,}/g,
    url: /https?:\/\/[^\s<>\"{}|\\^`[\]]+/g,
    domain: /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g,
    ip: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    date: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
    money: /\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|M|B))?\b/gi,
    company: /(?:Inc\.|Corp\.|LLC|Ltd\.|Co\.|Company|Corporation|Incorporated)/gi,
    person: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g,
    social: /@[a-zA-Z0-9_]+/g
  };

  extract(text: string): Map<string, string[]> {
    const results = new Map<string, string[]>();

    Object.entries(this.patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        results.set(type, [...new Set(matches)]);
      }
    });

    return results;
  }
}

// ============================================================================
// RISK SCORER
// ============================================================================

export class RiskScorer {
  private riskFactors = {
    breach: 0.3,
    lawsuit: 0.2,
    controversy: 0.15,
    investigation: 0.2,
    negative_sentiment: 0.1,
    missing_info: 0.05
  };

  calculateRisk(entity: Entity, breaches: BreachRecord[], sentiment: SentimentScore): number {
    let risk = 0;

    // Breach history
    if (breaches.length > 0) {
      risk += this.riskFactors.breach * Math.min(breaches.length / 5, 1);
    }

    // Negative sentiment
    if (sentiment.negative > 0.2) {
      risk += this.riskFactors.negative_sentiment * sentiment.negative;
    }

    // Missing information
    if (entity.sources.length < 3) {
      risk += this.riskFactors.missing_info;
    }

    return Math.min(risk, 1);
  }
}

// ============================================================================
// ALIAS EXPORT
// ============================================================================

export { UltimateKnowledgeGraph as Graph };
