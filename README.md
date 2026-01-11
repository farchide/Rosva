# Rosva: Deep Agentic Person Research System

A comprehensive multi-agent system for deep OSINT research on individuals, leveraging RuVector's self-learning vector database and agentic orchestration.

## Overview

Rosva combines:
- **RuVector** - Self-learning vector database with GNN-enhanced search
- **Multi-Agent Orchestration** - Specialized agents for different research domains
- **Graph-Based Relationship Mapping** - Cypher queries for network analysis
- **Verification Pipelines** - Cross-reference and credibility scoring

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROSVA RESEARCH ORCHESTRATOR                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Research   │  │  Verification│  │   Report     │          │
│  │   Planner    │  │   Engine     │  │   Generator  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼─────────────────▼─────────────────▼───────┐          │
│  │              AGENT SWARM COORDINATOR              │          │
│  │  (Hierarchical Attention + MoE Routing)          │          │
│  └──────────────────────┬───────────────────────────┘          │
│                         │                                       │
├─────────────────────────▼───────────────────────────────────────┤
│                    SPECIALIZED AGENTS                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Public  │ │ Social  │ │Corporate│ │ Media   │ │ Network │  │
│  │ Records │ │ Media   │ │ Registry│ │ Archive │ │ Mapper  │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
│       │           │           │           │           │        │
├───────▼───────────▼───────────▼───────────▼───────────▼────────┤
│                         RUVECTOR                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vector Store (HNSW)  │  Graph DB (Cypher)  │  GNN Layer │  │
│  │  - Person embeddings  │  - Relationships    │  - Learning │  │
│  │  - Document chunks    │  - Organizations    │  - Patterns │  │
│  │  - Entity mentions    │  - Events/Timeline  │  - Ranking  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Multi-Source Intelligence Gathering
- Public records and registries
- Social media presence analysis
- Corporate filings (SEC, state registries)
- Media mentions and interviews
- Academic publications
- Event participation (conferences, speaking)
- Legal filings and court records

### Relationship Mapping
- Organizational affiliations
- Co-appearances and collaborations
- Financial connections (where public)
- Political alignments
- Network influence scoring

### Verification & Credibility
- Multi-source cross-referencing
- Claim verification scoring
- Source reliability assessment
- Temporal consistency checks
- Contradiction detection

### Self-Learning Capabilities
- GNN-enhanced retrieval improves over time
- Pattern recognition across subjects
- Relationship type classification
- Source quality learning

## Installation

```bash
npm install ruvector @ruvector/core @ruvector/gnn
pip install agentic-reports
```

## Quick Start

```typescript
import { RosvaOrchestrator } from './src/orchestrator';

const rosva = new RosvaOrchestrator({
  vectorDB: { provider: 'ruvector', gnnEnabled: true },
  agents: ['public-records', 'social-media', 'corporate', 'media', 'network'],
  verification: { minSources: 2, crossReference: true }
});

// Deep research on a person
const report = await rosva.research({
  name: 'John Doe',
  context: 'political activist, Iran opposition',
  depth: 'comprehensive',
  outputFormat: 'structured-report'
});
```

## Project Structure

```
rosva/
├── src/
│   ├── orchestrator/       # Main orchestration logic
│   ├── agents/             # Specialized research agents
│   ├── vector/             # RuVector integration
│   ├── graph/              # Relationship graph management
│   ├── verification/       # Cross-reference & validation
│   └── reports/            # Report generation
├── config/
│   ├── agents.yaml         # Agent configurations
│   └── sources.yaml        # Data source definitions
└── docs/
    └── architecture.md     # Detailed architecture docs
```

## License

MIT

## References

- [RuVector](https://github.com/ruvnet/ruvector) - Self-learning vector database
- [Agentic-Flow](https://github.com/ruvnet/agentic-flow) - Agent orchestration platform
- [Agentic-Reports](https://github.com/ruvnet/agentic-reports) - Research report generation
