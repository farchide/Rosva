/**
 * Graph Manager
 *
 * Manages relationship graphs using Cypher-compatible queries.
 * Integrates with RuVector's graph capabilities.
 */

export interface Relationship {
  from: string;
  to: string;
  type: RelationshipType;
  strength: number;
  evidence: any[];
  timeframe?: { start?: Date; end?: Date };
  properties?: Record<string, any>;
}

export type RelationshipType =
  | 'AFFILIATED_WITH'
  | 'WORKED_WITH'
  | 'SPOKE_AT'
  | 'QUOTED_BY'
  | 'FUNDED_BY'
  | 'MEMBER_OF'
  | 'CONNECTED_TO'
  | 'APPEARED_WITH'
  | 'OPPOSES'
  | 'SUPPORTS';

interface GraphNode {
  id: string;
  type: 'Person' | 'Organization' | 'Event' | 'Media';
  name: string;
  properties: Record<string, any>;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: RelationshipType;
  properties: Record<string, any>;
}

/**
 * Graph manager for relationship analysis
 */
export class GraphManager {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private initialized: boolean = false;

  constructor() {}

  /**
   * Initialize the graph manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[GraphManager] Initializing...');

    // In production, this would connect to RuVector's graph layer
    // or a dedicated graph database

    this.initialized = true;
    console.log('[GraphManager] Initialization complete');
  }

  /**
   * Extract relationships from a finding
   */
  async extractRelationships(
    subjectName: string,
    finding: any
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    // Ensure subject node exists
    const subjectId = this.getOrCreateNode('Person', subjectName);

    // Extract entities from the finding
    const entities = this.extractEntities(finding.claim);

    // Create relationships based on finding type
    for (const entity of entities) {
      const entityId = this.getOrCreateNode(entity.type, entity.name);

      const relType = this.inferRelationshipType(finding.type, entity.type);

      relationships.push({
        from: subjectId,
        to: entityId,
        type: relType,
        strength: finding.confidence,
        evidence: finding.sources,
        timeframe: finding.timestamp ? { start: finding.timestamp } : undefined
      });
    }

    return relationships;
  }

  /**
   * Store relationships in the graph
   */
  async storeRelationships(
    subjectId: string,
    relationships: Relationship[]
  ): Promise<void> {
    for (const rel of relationships) {
      const edgeId = `${rel.from}-${rel.type}-${rel.to}`;

      // Check for existing edge
      if (this.edges.has(edgeId)) {
        // Update existing edge - increase strength
        const existing = this.edges.get(edgeId)!;
        existing.properties.strength = Math.max(
          existing.properties.strength || 0,
          rel.strength
        );
        existing.properties.evidenceCount =
          (existing.properties.evidenceCount || 0) + rel.evidence.length;
      } else {
        // Create new edge
        this.edges.set(edgeId, {
          id: edgeId,
          from: rel.from,
          to: rel.to,
          type: rel.type,
          properties: {
            strength: rel.strength,
            evidenceCount: rel.evidence.length,
            timeframe: rel.timeframe
          }
        });

        // Update adjacency list
        if (!this.adjacencyList.has(rel.from)) {
          this.adjacencyList.set(rel.from, new Set());
        }
        this.adjacencyList.get(rel.from)!.add(rel.to);
      }
    }
  }

  /**
   * Get network around a person
   */
  async getNetwork(name: string, depth: number = 2): Promise<Relationship[]> {
    const personId = this.findNodeByName('Person', name);
    if (!personId) return [];

    const visited = new Set<string>();
    const relationships: Relationship[] = [];

    await this.traverseNetwork(personId, depth, visited, relationships);

    return relationships;
  }

  /**
   * Query the graph with Cypher-like syntax
   */
  async query(cypherQuery: string): Promise<any[]> {
    // Parse and execute simple Cypher-like queries
    // This is a simplified implementation

    // Example: MATCH (p:Person)-[:AFFILIATED_WITH]->(o:Organization) WHERE p.name = 'John' RETURN o

    const matchPattern = /MATCH\s+\((\w+):(\w+)\)-\[:(\w+)\]->\((\w+):(\w+)\)/i;
    const wherePattern = /WHERE\s+(\w+)\.name\s*=\s*['"]([^'"]+)['"]/i;

    const matchResult = cypherQuery.match(matchPattern);
    const whereResult = cypherQuery.match(wherePattern);

    if (!matchResult) return [];

    const [, fromVar, fromType, relType, toVar, toType] = matchResult;
    const filterName = whereResult ? whereResult[2] : null;

    const results: any[] = [];

    for (const [, edge] of this.edges) {
      if (edge.type !== relType) continue;

      const fromNode = this.nodes.get(edge.from);
      const toNode = this.nodes.get(edge.to);

      if (!fromNode || !toNode) continue;
      if (fromNode.type !== fromType || toNode.type !== toType) continue;
      if (filterName && fromNode.name !== filterName) continue;

      results.push({
        [fromVar]: fromNode,
        [toVar]: toNode,
        relationship: edge
      });
    }

    return results;
  }

  /**
   * Find shortest path between two nodes
   */
  async findPath(fromName: string, toName: string): Promise<Relationship[]> {
    const fromId = this.findNodeByName('Person', fromName);
    const toId = this.findNodeByName('Person', toName);

    if (!fromId || !toId) return [];

    // BFS to find shortest path
    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: fromId, path: [fromId] }
    ];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === toId) {
        // Convert path to relationships
        return this.pathToRelationships(path);
      }

      const neighbors = this.adjacencyList.get(nodeId);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor]
          });
        }
      }
    }

    return [];
  }

  /**
   * Get shared connections between two people
   */
  async getSharedConnections(name1: string, name2: string): Promise<GraphNode[]> {
    const id1 = this.findNodeByName('Person', name1);
    const id2 = this.findNodeByName('Person', name2);

    if (!id1 || !id2) return [];

    const neighbors1 = this.adjacencyList.get(id1) || new Set();
    const neighbors2 = this.adjacencyList.get(id2) || new Set();

    const shared: GraphNode[] = [];

    for (const nodeId of neighbors1) {
      if (neighbors2.has(nodeId)) {
        const node = this.nodes.get(nodeId);
        if (node) shared.push(node);
      }
    }

    return shared;
  }

  /**
   * Calculate influence score for a node
   */
  calculateInfluenceScore(nodeId: string): number {
    // Simple PageRank-like calculation
    const incomingEdges = Array.from(this.edges.values()).filter(
      e => e.to === nodeId
    );

    const outgoingEdges = Array.from(this.edges.values()).filter(
      e => e.from === nodeId
    );

    // Combine in-degree and out-degree with edge strengths
    const inScore = incomingEdges.reduce(
      (sum, e) => sum + (e.properties.strength || 0.5),
      0
    );
    const outScore = outgoingEdges.reduce(
      (sum, e) => sum + (e.properties.strength || 0.5),
      0
    );

    return (inScore + outScore * 0.5) / Math.max(this.nodes.size, 1);
  }

  // Private helper methods

  private getOrCreateNode(type: string, name: string): string {
    const id = `${type.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;

    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        type: type as any,
        name,
        properties: {}
      });
    }

    return id;
  }

  private findNodeByName(type: string, name: string): string | null {
    const id = `${type.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
    return this.nodes.has(id) ? id : null;
  }

  private extractEntities(text: string): { type: string; name: string }[] {
    const entities: { type: string; name: string }[] = [];

    // Simple pattern matching for organizations
    const orgPatterns = [
      /(?:at|with|for|of)\s+(?:the\s+)?([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/g,
      /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)\s+(?:organization|group|council|committee)/gi
    ];

    for (const pattern of orgPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'Organization',
          name: match[1].trim()
        });
      }
    }

    return entities;
  }

  private inferRelationshipType(
    findingType: string,
    entityType: string
  ): RelationshipType {
    switch (findingType) {
      case 'corporate_affiliation':
        return 'AFFILIATED_WITH';
      case 'media_mention':
        return 'QUOTED_BY';
      case 'public_statement':
        return 'SPOKE_AT';
      case 'network_connection':
        return 'CONNECTED_TO';
      default:
        return entityType === 'Organization' ? 'AFFILIATED_WITH' : 'CONNECTED_TO';
    }
  }

  private async traverseNetwork(
    nodeId: string,
    depth: number,
    visited: Set<string>,
    relationships: Relationship[]
  ): Promise<void> {
    if (depth === 0 || visited.has(nodeId)) return;
    visited.add(nodeId);

    const neighbors = this.adjacencyList.get(nodeId);
    if (!neighbors) return;

    for (const neighborId of neighbors) {
      // Find the edge
      for (const [, edge] of this.edges) {
        if (
          (edge.from === nodeId && edge.to === neighborId) ||
          (edge.from === neighborId && edge.to === nodeId)
        ) {
          relationships.push({
            from: edge.from,
            to: edge.to,
            type: edge.type,
            strength: edge.properties.strength || 0.5,
            evidence: []
          });
        }
      }

      await this.traverseNetwork(neighborId, depth - 1, visited, relationships);
    }
  }

  private pathToRelationships(path: string[]): Relationship[] {
    const relationships: Relationship[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      for (const [, edge] of this.edges) {
        if (edge.from === from && edge.to === to) {
          relationships.push({
            from: edge.from,
            to: edge.to,
            type: edge.type,
            strength: edge.properties.strength || 0.5,
            evidence: []
          });
          break;
        }
      }
    }

    return relationships;
  }

  /**
   * Get graph statistics
   */
  getStats(): { nodes: number; edges: number } {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size
    };
  }
}

export default GraphManager;
