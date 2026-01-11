# Rosva Architecture: Deep Agentic Person Research

## System Overview

Rosva is a hierarchical multi-agent system designed for comprehensive OSINT research on individuals. It leverages RuVector's self-learning vector database with GNN enhancement to progressively improve research quality over time.

## Core Design Principles

### 1. Separation of Concerns
- **Collection Agents** - Gather raw data from specific source types
- **Verification Engine** - Cross-reference and validate claims
- **Graph Manager** - Build and query relationship networks
- **Report Generator** - Synthesize findings into structured output

### 2. Progressive Refinement
Research proceeds in waves:
1. **Broad Discovery** - Initial sweep across all sources
2. **Entity Extraction** - Identify people, organizations, events
3. **Relationship Mapping** - Build connection graph
4. **Deep Dive** - Follow significant threads
5. **Verification** - Cross-reference claims
6. **Synthesis** - Generate final report

### 3. Self-Learning
RuVector's GNN layers learn from:
- Which sources yield reliable information
- Common relationship patterns
- Entity disambiguation signals
- Query refinement strategies

## Agent Architecture

### Research Planner Agent
Decomposes the research task into subqueries and coordinates agent assignments.

```typescript
interface ResearchPlan {
  subject: PersonIdentifier;
  phases: ResearchPhase[];
  priorityQueries: string[];
  agentAssignments: Map<AgentType, Query[]>;
  verificationRequirements: VerificationConfig;
}
```

### Specialized Collection Agents

| Agent | Sources | Output |
|-------|---------|--------|
| PublicRecordsAgent | Court records, property, voter rolls | Verified facts, addresses, legal history |
| SocialMediaAgent | Twitter/X, LinkedIn, Facebook, Instagram | Posts, connections, public statements |
| CorporateAgent | SEC filings, state registries, OpenCorporates | Roles, companies, financial indicators |
| MediaAgent | News archives, interviews, podcasts | Quotes, appearances, media coverage |
| AcademicAgent | Google Scholar, ResearchGate, university sites | Publications, affiliations, expertise |
| EventAgent | Conference sites, event listings, speaker pages | Speaking history, event participation |
| NetworkAgent | Graph traversal, connection analysis | Relationship strength, network position |

### Agent Communication Protocol

Agents communicate via structured messages:

```typescript
interface AgentMessage {
  from: AgentId;
  to: AgentId | 'broadcast';
  type: 'finding' | 'query' | 'verification_request' | 'completion';
  payload: Finding | Query | VerificationRequest;
  confidence: number;
  sources: Source[];
}
```

## Data Model

### Person Entity

```typescript
interface PersonEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  identifiers: {
    type: 'email' | 'phone' | 'social_handle' | 'government_id';
    value: string;
    verified: boolean;
  }[];
  attributes: {
    key: string;
    value: any;
    sources: Source[];
    confidence: number;
    asOf: Date;
  }[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  embedding: Float32Array; // RuVector embedding
}
```

### Relationship Graph

```cypher
// Core relationship types
(:Person)-[:AFFILIATED_WITH]->(:Organization)
(:Person)-[:WORKED_WITH]->(:Person)
(:Person)-[:SPOKE_AT]->(:Event)
(:Person)-[:QUOTED_BY]->(:MediaOutlet)
(:Person)-[:FUNDED_BY]->(:Organization)
(:Person)-[:MEMBER_OF]->(:Group)
(:Organization)-[:CONNECTED_TO]->(:Organization)
```

### Finding Structure

```typescript
interface Finding {
  id: string;
  type: FindingType;
  subject: EntityReference;
  claim: string;
  evidence: Evidence[];
  sources: Source[];
  confidence: number;
  verificationStatus: 'unverified' | 'partially_verified' | 'verified' | 'contradicted';
  contradictions?: Finding[];
  timestamp: Date;
}
```

## RuVector Integration

### Vector Storage Strategy

| Vector Type | Dimensions | Purpose |
|------------|------------|---------|
| Person embedding | 768 | Semantic similarity, disambiguation |
| Document chunk | 384 | Source content retrieval |
| Relationship embedding | 256 | Connection pattern matching |
| Query embedding | 384 | Search refinement |

### Graph Queries

```cypher
// Find all organizations a person is connected to within 2 hops
MATCH (p:Person {name: $name})-[:AFFILIATED_WITH|WORKED_WITH*1..2]-(org:Organization)
RETURN org, count(*) as connectionStrength
ORDER BY connectionStrength DESC

// Find shared connections between two people
MATCH (p1:Person {name: $name1})-[:WORKED_WITH|AFFILIATED_WITH]-(shared)-[:WORKED_WITH|AFFILIATED_WITH]-(p2:Person {name: $name2})
RETURN shared, type(shared) as sharedType

// Timeline query for event co-occurrence
MATCH (p:Person {name: $name})-[:SPOKE_AT]->(e:Event)
WHERE e.date >= $startDate AND e.date <= $endDate
RETURN e ORDER BY e.date
```

### GNN Enhancement

The GNN layer learns to:
1. **Improve retrieval** - Surface more relevant documents over time
2. **Relationship classification** - Better categorize connection types
3. **Entity resolution** - Disambiguate same-name individuals
4. **Source reliability** - Weight findings by source quality

## Verification Pipeline

### Multi-Source Verification

```
Finding → Extract Claims → For Each Claim:
  ├── Search for corroborating sources
  ├── Search for contradicting sources
  ├── Calculate temporal consistency
  ├── Assess source independence
  └── Generate confidence score
```

### Verification Levels

| Level | Requirements | Confidence |
|-------|--------------|------------|
| L0 - Single Source | One source, no verification | 0.3 |
| L1 - Corroborated | 2+ independent sources | 0.6 |
| L2 - Cross-Verified | Multiple source types agree | 0.8 |
| L3 - Documented | Official records/filings | 0.95 |
| Contradicted | Sources disagree | Flag for review |

### Source Independence Check

```typescript
function assessIndependence(sources: Source[]): number {
  // Check for:
  // - Same author/outlet
  // - Circular citation (A cites B cites A)
  // - Same original source
  // - Same publication date (possible syndication)
  // Returns independence score 0-1
}
```

## Report Generation

### Output Formats

1. **Structured JSON** - Machine-readable, full data
2. **Executive Summary** - Key findings, 1-2 pages
3. **Full Report** - Comprehensive with citations
4. **Network Visualization** - Graph of relationships
5. **Timeline View** - Chronological events

### Report Sections

```markdown
1. Subject Overview
   - Verified identifiers
   - Key affiliations
   - Summary assessment

2. Background & Biography
   - Education
   - Career history
   - Public positions

3. Organizational Affiliations
   - Current roles
   - Historical affiliations
   - Funding relationships

4. Network Analysis
   - Key connections
   - Influence mapping
   - Coalition positions

5. Media Presence
   - Public statements
   - Interview appearances
   - Social media activity

6. Verification Status
   - Confirmed facts
   - Unverified claims
   - Contradictions found

7. Sources & Citations
   - Full source list
   - Source reliability ratings
```

## Security & Ethics

### Data Handling
- Only public/legally obtainable sources
- No hacking or unauthorized access
- Respect robots.txt and rate limits
- Anonymize/pseudonymize in logs

### Output Controls
- Clear "verified vs alleged" labeling
- Source citations for all claims
- Confidence scores on findings
- Contradiction highlighting

### Audit Trail
- Full provenance for every finding
- Query history logging
- Agent decision logging
- Human review triggers

## Performance Characteristics

| Operation | Expected Latency |
|-----------|-----------------|
| Initial person search | 2-5 seconds |
| Single agent collection | 10-30 seconds |
| Full research cycle | 5-15 minutes |
| Graph query (2-hop) | <100ms |
| Vector similarity search | <1ms |
| Report generation | 30-60 seconds |

## Scaling Strategy

- Horizontal agent scaling per source type
- RuVector distributed mode for large corpora
- Caching for frequently-accessed entities
- Progressive loading (summary → details)
