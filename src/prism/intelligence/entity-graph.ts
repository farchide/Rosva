/**
 * PRISM Entity Graph System
 *
 * Maps complex multi-hop relationships between:
 * - People (journalists, academics, politicians, activists, lobbyists)
 * - Organizations (NGOs, think tanks, lobby groups, front organizations)
 * - Media Outlets (TV, newspapers, podcasts, social media)
 * - Businesses (companies, banks, investment firms)
 * - Government Entities (ministries, IRGC, intelligence services)
 * - Events (conferences, meetings, panels)
 */

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'MEDIA_OUTLET'
  | 'BUSINESS'
  | 'GOVERNMENT'
  | 'THINK_TANK'
  | 'UNIVERSITY'
  | 'LOBBY_GROUP'
  | 'NGO'
  | 'EVENT'
  | 'FOUNDATION';

export type RelationshipType =
  | 'FUNDED_BY'
  | 'FUNDS'
  | 'EMPLOYED_BY'
  | 'EMPLOYS'
  | 'BOARD_MEMBER'
  | 'FOUNDED'
  | 'FOUNDED_BY'
  | 'MEMBER_OF'
  | 'APPEARED_ON'
  | 'INTERVIEWED'
  | 'COLLABORATED_WITH'
  | 'ATTENDED'
  | 'SPOKE_AT'
  | 'LOBBIED_FOR'
  | 'REGISTERED_AGENT_FOR'
  | 'BUSINESS_PARTNER'
  | 'FAMILY_OF'
  | 'MARRIED_TO'
  | 'ADVISOR_TO'
  | 'CONSULTANT_FOR'
  | 'RECEIVED_GRANT_FROM'
  | 'PUBLISHED_BY'
  | 'CITED_BY'
  | 'PROMOTED_BY'
  | 'SANCTIONED_WITH'
  | 'CO_SANCTIONED'
  | 'SHARES_ADDRESS'
  | 'SHARES_BOARD_MEMBERS'
  | 'LINKED_FINANCIALLY';

export type RegimeAlignment =
  | 'CONFIRMED_REGIME'      // Directly part of regime apparatus
  | 'KNOWN_PROXY'           // Widely recognized as regime front
  | 'SUSPECTED_PROXY'       // Strong indicators of regime alignment
  | 'REGIME_FRIENDLY'       // Consistently pushes regime narratives
  | 'NEUTRAL'               // No clear alignment
  | 'OPPOSITION_FRIENDLY'   // Supports opposition causes
  | 'CONFIRMED_OPPOSITION'  // Active opposition member
  | 'UNKNOWN';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  description?: string;

  // Classification
  regimeAlignment: RegimeAlignment;
  alignmentConfidence: number; // 0-100
  alignmentEvidence: string[];

  // Sanctions & Legal Status
  sanctioned: boolean;
  sanctionDetails?: SanctionRecord[];
  faraRegistered?: boolean;
  faraDetails?: FARARecord[];

  // Metadata
  country?: string;
  foundedYear?: number;
  activeStatus: 'ACTIVE' | 'INACTIVE' | 'DISSOLVED' | 'UNKNOWN';

  // Risk Scoring
  riskScore: number; // 0-100
  riskFactors: RiskFactor[];

  // External IDs
  externalIds: {
    twitter?: string;
    linkedin?: string;
    wikipedia?: string;
    opencorporates?: string;
    ofacId?: string;
  };

  // Tracking
  lastUpdated: Date;
  sources: string[];
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;

  // Relationship Details
  description?: string;
  startDate?: Date;
  endDate?: Date;
  active: boolean;

  // Financial Details (if applicable)
  financialAmount?: number;
  financialCurrency?: string;
  financialFrequency?: 'ONE_TIME' | 'ANNUAL' | 'MONTHLY' | 'UNKNOWN';

  // Confidence & Verification
  confidence: number; // 0-100
  verified: boolean;
  sources: string[];

  // Risk Contribution
  riskWeight: number; // How much this relationship contributes to risk
}

export interface SanctionRecord {
  authority: 'OFAC' | 'EU' | 'UK' | 'UN' | 'OTHER';
  listName: string;
  dateAdded: Date;
  reason: string;
  programCodes: string[];
}

export interface FARARecord {
  registrationNumber: string;
  foreignPrincipal: string;
  registrationDate: Date;
  terminationDate?: Date;
  activities: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string[];
  weight: number;
}

export interface PathConnection {
  fromEntity: Entity;
  toEntity: Entity;
  relationship: Relationship;
  hopNumber: number;
}

export interface InfluencePath {
  startEntity: Entity;
  endEntity: Entity;
  path: PathConnection[];
  totalHops: number;
  pathRiskScore: number;
  pathDescription: string;
}

export interface ClusterAnalysis {
  clusterId: string;
  name: string;
  entities: Entity[];
  centralEntity?: Entity;
  averageRegimeAlignment: number;
  clusterType: 'REGIME_ALIGNED' | 'OPPOSITION_ALIGNED' | 'MIXED' | 'UNKNOWN';
  keyConnections: Relationship[];
  riskAssessment: string;
}

/**
 * Entity Graph Database
 * In-memory graph for relationship analysis
 */
export class EntityGraph {
  private entities: Map<string, Entity> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // entity -> connected entities
  private relationshipIndex: Map<string, Set<string>> = new Map(); // entity -> relationship IDs

  constructor() {
    this.initializeKnownEntities();
  }

  /**
   * Initialize with known regime-linked entities
   */
  private initializeKnownEntities(): void {
    // This will be populated by the proxy database
  }

  /**
   * Add an entity to the graph
   */
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
    if (!this.adjacencyList.has(entity.id)) {
      this.adjacencyList.set(entity.id, new Set());
    }
    if (!this.relationshipIndex.has(entity.id)) {
      this.relationshipIndex.set(entity.id, new Set());
    }
  }

  /**
   * Add a relationship between entities
   */
  addRelationship(relationship: Relationship): void {
    this.relationships.set(relationship.id, relationship);

    // Update adjacency list (bidirectional)
    if (!this.adjacencyList.has(relationship.sourceId)) {
      this.adjacencyList.set(relationship.sourceId, new Set());
    }
    if (!this.adjacencyList.has(relationship.targetId)) {
      this.adjacencyList.set(relationship.targetId, new Set());
    }

    this.adjacencyList.get(relationship.sourceId)!.add(relationship.targetId);
    this.adjacencyList.get(relationship.targetId)!.add(relationship.sourceId);

    // Update relationship index
    if (!this.relationshipIndex.has(relationship.sourceId)) {
      this.relationshipIndex.set(relationship.sourceId, new Set());
    }
    if (!this.relationshipIndex.has(relationship.targetId)) {
      this.relationshipIndex.set(relationship.targetId, new Set());
    }

    this.relationshipIndex.get(relationship.sourceId)!.add(relationship.id);
    this.relationshipIndex.get(relationship.targetId)!.add(relationship.id);
  }

  /**
   * Find entity by ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Find entity by name (fuzzy match)
   */
  findEntityByName(name: string): Entity | undefined {
    const normalizedName = name.toLowerCase().trim();

    for (const entity of this.entities.values()) {
      if (entity.name.toLowerCase() === normalizedName) {
        return entity;
      }
      if (entity.aliases.some(alias => alias.toLowerCase() === normalizedName)) {
        return entity;
      }
    }

    return undefined;
  }

  /**
   * Get all relationships for an entity
   */
  getEntityRelationships(entityId: string): Relationship[] {
    const relationshipIds = this.relationshipIndex.get(entityId);
    if (!relationshipIds) return [];

    return Array.from(relationshipIds)
      .map(id => this.relationships.get(id)!)
      .filter(r => r !== undefined);
  }

  /**
   * Get directly connected entities
   */
  getConnectedEntities(entityId: string): Entity[] {
    const connectedIds = this.adjacencyList.get(entityId);
    if (!connectedIds) return [];

    return Array.from(connectedIds)
      .map(id => this.entities.get(id)!)
      .filter(e => e !== undefined);
  }

  /**
   * Find all paths between two entities (up to maxHops)
   */
  findPaths(startId: string, endId: string, maxHops: number = 4): InfluencePath[] {
    const paths: InfluencePath[] = [];
    const startEntity = this.entities.get(startId);
    const endEntity = this.entities.get(endId);

    if (!startEntity || !endEntity) return paths;

    // BFS with path tracking
    const queue: { entityId: string; path: PathConnection[] }[] = [
      { entityId: startId, path: [] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.path.length >= maxHops) continue;

      const connectedIds = this.adjacencyList.get(current.entityId);
      if (!connectedIds) continue;

      for (const nextId of connectedIds) {
        if (visited.has(`${current.entityId}-${nextId}`)) continue;
        visited.add(`${current.entityId}-${nextId}`);

        const relationship = this.findRelationship(current.entityId, nextId);
        if (!relationship) continue;

        const fromEntity = this.entities.get(current.entityId)!;
        const toEntity = this.entities.get(nextId)!;

        const newPath: PathConnection[] = [
          ...current.path,
          {
            fromEntity,
            toEntity,
            relationship,
            hopNumber: current.path.length + 1
          }
        ];

        if (nextId === endId) {
          // Found a path
          paths.push({
            startEntity,
            endEntity,
            path: newPath,
            totalHops: newPath.length,
            pathRiskScore: this.calculatePathRisk(newPath),
            pathDescription: this.generatePathDescription(newPath)
          });
        } else {
          queue.push({ entityId: nextId, path: newPath });
        }
      }
    }

    return paths.sort((a, b) => b.pathRiskScore - a.pathRiskScore);
  }

  /**
   * Find shortest path to any regime-aligned entity
   */
  findShortestPathToRegime(entityId: string, maxHops: number = 6): InfluencePath | null {
    const startEntity = this.entities.get(entityId);
    if (!startEntity) return null;

    // BFS to find closest regime entity
    const queue: { entityId: string; path: PathConnection[] }[] = [
      { entityId, path: [] }
    ];
    const visited = new Set<string>([entityId]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.path.length >= maxHops) continue;

      const connectedIds = this.adjacencyList.get(current.entityId);
      if (!connectedIds) continue;

      for (const nextId of connectedIds) {
        if (visited.has(nextId)) continue;
        visited.add(nextId);

        const relationship = this.findRelationship(current.entityId, nextId);
        if (!relationship) continue;

        const fromEntity = this.entities.get(current.entityId)!;
        const toEntity = this.entities.get(nextId)!;

        const newPath: PathConnection[] = [
          ...current.path,
          {
            fromEntity,
            toEntity,
            relationship,
            hopNumber: current.path.length + 1
          }
        ];

        // Check if this entity is regime-aligned
        if (
          toEntity.regimeAlignment === 'CONFIRMED_REGIME' ||
          toEntity.regimeAlignment === 'KNOWN_PROXY'
        ) {
          return {
            startEntity,
            endEntity: toEntity,
            path: newPath,
            totalHops: newPath.length,
            pathRiskScore: this.calculatePathRisk(newPath),
            pathDescription: this.generatePathDescription(newPath)
          };
        }

        queue.push({ entityId: nextId, path: newPath });
      }
    }

    return null;
  }

  /**
   * Find all regime connections within N hops
   */
  findAllRegimeConnections(entityId: string, maxHops: number = 3): InfluencePath[] {
    const paths: InfluencePath[] = [];
    const startEntity = this.entities.get(entityId);
    if (!startEntity) return paths;

    // Find all regime-aligned entities
    const regimeEntities = Array.from(this.entities.values()).filter(
      e => e.regimeAlignment === 'CONFIRMED_REGIME' ||
           e.regimeAlignment === 'KNOWN_PROXY' ||
           e.regimeAlignment === 'SUSPECTED_PROXY'
    );

    for (const regimeEntity of regimeEntities) {
      const entityPaths = this.findPaths(entityId, regimeEntity.id, maxHops);
      paths.push(...entityPaths);
    }

    return paths.sort((a, b) => {
      // Sort by hops first, then by risk score
      if (a.totalHops !== b.totalHops) {
        return a.totalHops - b.totalHops;
      }
      return b.pathRiskScore - a.pathRiskScore;
    });
  }

  /**
   * Detect clusters in the network
   */
  detectClusters(): ClusterAnalysis[] {
    const clusters: ClusterAnalysis[] = [];
    const visited = new Set<string>();
    let clusterId = 0;

    for (const [entityId, _entity] of this.entities) {
      if (visited.has(entityId)) continue;

      // BFS to find connected component
      const clusterEntities: Entity[] = [];
      const queue = [entityId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const entity = this.entities.get(currentId);
        if (entity) {
          clusterEntities.push(entity);

          const connected = this.adjacencyList.get(currentId);
          if (connected) {
            for (const connectedId of connected) {
              if (!visited.has(connectedId)) {
                queue.push(connectedId);
              }
            }
          }
        }
      }

      if (clusterEntities.length > 1) {
        clusters.push(this.analyzeCluster(clusterId++, clusterEntities));
      }
    }

    return clusters;
  }

  /**
   * Calculate risk score for an entity based on all connections
   */
  calculateEntityRisk(entityId: string): number {
    const entity = this.entities.get(entityId);
    if (!entity) return 0;

    let riskScore = entity.riskScore;

    // Add risk from direct connections
    const relationships = this.getEntityRelationships(entityId);
    for (const rel of relationships) {
      const connectedId = rel.sourceId === entityId ? rel.targetId : rel.sourceId;
      const connectedEntity = this.entities.get(connectedId);

      if (connectedEntity) {
        // Add weighted risk from connected entities
        const alignmentRisk = this.getAlignmentRiskWeight(connectedEntity.regimeAlignment);
        riskScore += alignmentRisk * rel.riskWeight * 0.5;

        // Sanctioned connections are high risk
        if (connectedEntity.sanctioned) {
          riskScore += 20 * rel.riskWeight;
        }
      }
    }

    // Check 2-hop connections (reduced weight)
    const regimePaths = this.findAllRegimeConnections(entityId, 2);
    for (const path of regimePaths) {
      const hopPenalty = Math.pow(0.5, path.totalHops);
      riskScore += path.pathRiskScore * hopPenalty * 0.25;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Get statistics about the graph
   */
  getStats(): {
    totalEntities: number;
    totalRelationships: number;
    entitiesByType: Record<EntityType, number>;
    entitiesByAlignment: Record<RegimeAlignment, number>;
  } {
    const entitiesByType: Partial<Record<EntityType, number>> = {};
    const entitiesByAlignment: Partial<Record<RegimeAlignment, number>> = {};

    for (const entity of this.entities.values()) {
      entitiesByType[entity.type] = (entitiesByType[entity.type] || 0) + 1;
      entitiesByAlignment[entity.regimeAlignment] =
        (entitiesByAlignment[entity.regimeAlignment] || 0) + 1;
    }

    return {
      totalEntities: this.entities.size,
      totalRelationships: this.relationships.size,
      entitiesByType: entitiesByType as Record<EntityType, number>,
      entitiesByAlignment: entitiesByAlignment as Record<RegimeAlignment, number>
    };
  }

  // Helper methods

  private findRelationship(entityId1: string, entityId2: string): Relationship | undefined {
    for (const rel of this.relationships.values()) {
      if (
        (rel.sourceId === entityId1 && rel.targetId === entityId2) ||
        (rel.sourceId === entityId2 && rel.targetId === entityId1)
      ) {
        return rel;
      }
    }
    return undefined;
  }

  private calculatePathRisk(path: PathConnection[]): number {
    let risk = 0;
    for (const connection of path) {
      risk += connection.toEntity.riskScore * connection.relationship.riskWeight;
      risk += this.getAlignmentRiskWeight(connection.toEntity.regimeAlignment);
    }
    return Math.min(100, risk / path.length);
  }

  private getAlignmentRiskWeight(alignment: RegimeAlignment): number {
    const weights: Record<RegimeAlignment, number> = {
      'CONFIRMED_REGIME': 50,
      'KNOWN_PROXY': 40,
      'SUSPECTED_PROXY': 30,
      'REGIME_FRIENDLY': 20,
      'NEUTRAL': 0,
      'OPPOSITION_FRIENDLY': -10,
      'CONFIRMED_OPPOSITION': -20,
      'UNKNOWN': 5
    };
    return weights[alignment];
  }

  private generatePathDescription(path: PathConnection[]): string {
    const steps = path.map(conn => {
      return `${conn.fromEntity.name} → [${conn.relationship.type}] → ${conn.toEntity.name}`;
    });
    return steps.join('\n');
  }

  private analyzeCluster(id: number, entities: Entity[]): ClusterAnalysis {
    // Find most connected entity (central node)
    let maxConnections = 0;
    let centralEntity: Entity | undefined;

    for (const entity of entities) {
      const connections = this.adjacencyList.get(entity.id)?.size || 0;
      if (connections > maxConnections) {
        maxConnections = connections;
        centralEntity = entity;
      }
    }

    // Calculate average alignment
    let alignmentSum = 0;
    let regimeCount = 0;
    let oppositionCount = 0;

    for (const entity of entities) {
      if (entity.regimeAlignment === 'CONFIRMED_REGIME' ||
          entity.regimeAlignment === 'KNOWN_PROXY') {
        regimeCount++;
        alignmentSum += 1;
      } else if (entity.regimeAlignment === 'CONFIRMED_OPPOSITION' ||
                 entity.regimeAlignment === 'OPPOSITION_FRIENDLY') {
        oppositionCount++;
        alignmentSum -= 1;
      }
    }

    const avgAlignment = alignmentSum / entities.length;

    let clusterType: ClusterAnalysis['clusterType'] = 'UNKNOWN';
    if (avgAlignment > 0.3) clusterType = 'REGIME_ALIGNED';
    else if (avgAlignment < -0.3) clusterType = 'OPPOSITION_ALIGNED';
    else if (regimeCount > 0 && oppositionCount > 0) clusterType = 'MIXED';

    // Get key connections within cluster
    const keyConnections: Relationship[] = [];
    const entityIds = new Set(entities.map(e => e.id));

    for (const entity of entities) {
      const rels = this.getEntityRelationships(entity.id);
      for (const rel of rels) {
        const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
        if (entityIds.has(otherId) && !keyConnections.find(r => r.id === rel.id)) {
          keyConnections.push(rel);
        }
      }
    }

    return {
      clusterId: `cluster-${id}`,
      name: centralEntity ? `${centralEntity.name} Network` : `Cluster ${id}`,
      entities,
      centralEntity,
      averageRegimeAlignment: avgAlignment,
      clusterType,
      keyConnections: keyConnections.slice(0, 10), // Top 10 connections
      riskAssessment: this.generateClusterRiskAssessment(entities, clusterType)
    };
  }

  private generateClusterRiskAssessment(
    entities: Entity[],
    clusterType: ClusterAnalysis['clusterType']
  ): string {
    const sanctionedCount = entities.filter(e => e.sanctioned).length;
    const regimeCount = entities.filter(
      e => e.regimeAlignment === 'CONFIRMED_REGIME' || e.regimeAlignment === 'KNOWN_PROXY'
    ).length;

    if (clusterType === 'REGIME_ALIGNED') {
      return `HIGH RISK: This cluster contains ${regimeCount} regime-aligned entities` +
             (sanctionedCount > 0 ? ` and ${sanctionedCount} sanctioned entities.` : '.');
    } else if (clusterType === 'MIXED') {
      return `MODERATE RISK: Mixed cluster with both regime and opposition elements. ` +
             `Potential infiltration or influence operation.`;
    } else if (clusterType === 'OPPOSITION_ALIGNED') {
      return `LOW RISK: Opposition-aligned cluster. Monitor for regime infiltration.`;
    }

    return `UNKNOWN RISK: Insufficient data to assess cluster alignment.`;
  }
}

export const entityGraph = new EntityGraph();
