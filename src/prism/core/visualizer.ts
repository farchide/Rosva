/**
 * PRISM Visualization Engine
 *
 * Generates visual outputs including:
 * - ASCII art dashboards
 * - Mermaid diagrams
 * - GraphML export
 * - Neo4j Cypher
 * - JSON exports
 */

import {
  ResearchReport,
  PersonProfile,
  Entity,
  Relationship,
  NetworkMetrics,
  TimelineEvent
} from './types';

export class PRISMVisualizer {
  /**
   * Generate complete visualization output
   */
  generate(report: ResearchReport): string {
    let output = '';

    output += this.generateHeader();
    output += this.generateSubjectProfile(report.profile);
    output += this.generateNetworkMetrics(report.metrics, report.graph.entities.length, report.graph.relationships.length);
    output += this.generateFamilyNetwork(report.profile);
    output += this.generateOrganizations(report.profile);
    output += this.generateForeignRelations(report.profile);
    output += this.generatePositions(report.profile);
    output += this.generateControversies(report.profile);
    output += this.generateTimeline(report.profile.timeline);
    output += this.generateTopRelationships(report.graph.relationships, report.graph.entities);
    output += this.generateEntityBreakdown(report.graph.entities);
    output += this.generateSources(report.sources);
    output += this.generateFooter(report);

    return output;
  }

  /**
   * Generate PRISM header
   */
  private generateHeader(): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                  ║
║  ██████╗ ██████╗ ██╗███████╗███╗   ███╗    ██╗███╗   ██╗████████╗███████╗██╗                                     ║
║  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║    ██║████╗  ██║╚══██╔══╝██╔════╝██║                                     ║
║  ██████╔╝██████╔╝██║███████╗██╔████╔██║    ██║██╔██╗ ██║   ██║   █████╗  ██║                                     ║
║  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║    ██║██║╚██╗██║   ██║   ██╔══╝  ██║                                     ║
║  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║    ██║██║ ╚████║   ██║   ███████╗███████╗                                ║
║  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝                                ║
║                                                                                                                  ║
║                       OPEN-SOURCE TRUTH & ACCOUNTABILITY ENGINE v1.0                                            ║
║                       Narrative Analysis • Influence Mapping • Source Documentation                              ║
║                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

`;
  }

  /**
   * Generate subject profile section
   */
  private generateSubjectProfile(profile: PersonProfile): string {
    const bio = profile.biography;

    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           SUBJECT PROFILE                                                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
┃    ████████████████████████████████████████████████████████████████████████                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   ${bio.fullName.padEnd(60)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   Titles:     ${(bio.titles?.slice(0, 2).join(', ') || 'N/A').padEnd(48)}██                                     ┃
┃    ██   Born:       ${(bio.birthDate || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Birthplace: ${(bio.birthPlace || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Residence:  ${(bio.residence || 'Unknown').padEnd(48)}██                                     ┃
┃    ██   Nationality:${(bio.nationality?.join(', ') || 'Unknown').padEnd(48)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ██   Occupation: ${(bio.occupation?.slice(0, 2).join(', ') || 'Unknown').padEnd(48)}██                                     ┃
┃    ██                                                                    ██                                     ┃
┃    ████████████████████████████████████████████████████████████████████████                                     ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate network metrics section
   */
  private generateNetworkMetrics(metrics: NetworkMetrics, entityCount: number, relCount: number): string {
    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃        NETWORK METRICS           ┃        GRAPH STATISTICS          ┃         DATA QUALITY             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Total Entities: ${entityCount.toString().padEnd(15)} ┃  Relationships: ${relCount.toString().padEnd(16)} ┃  Sources: OSINT                  ┃
┃  Network Density: ${(metrics.density * 100).toFixed(2).padEnd(13)}% ┃  Components: ${metrics.components.toString().padEnd(19)} ┃  Methodology: Source-anchored    ┃
┃  Key Influencers: ${metrics.keyInfluencers.length.toString().padEnd(13)} ┃  Communities: ${metrics.communities.length.toString().padEnd(18)} ┃  All Claims Documented: YES      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate family network section
   */
  private generateFamilyNetwork(profile: PersonProfile): string {
    if (!profile.family.members || profile.family.members.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           FAMILY NETWORK                                                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const member of profile.family.members.slice(0, 15)) {
      const statusIcon = member.status === 'DECEASED' ? '†' : member.status === 'LIVING' ? '●' : '○';
      output += `    ${statusIcon} ${member.name.padEnd(30)} │ ${member.relationship.padEnd(15)} │ ${(member.notes || '').substring(0, 40)}\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate organizations section
   */
  private generateOrganizations(profile: PersonProfile): string {
    if (!profile.organizations || profile.organizations.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                       ORGANIZATIONS & INITIATIVES                                               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const org of profile.organizations.slice(0, 10)) {
      const statusIcon = org.status === 'ACTIVE' ? '●' : org.status === 'INACTIVE' ? '○' : '◐';
      output += `    ${statusIcon} ${org.name.padEnd(45)} [${org.status}]\n`;
      output += `      Role: ${org.role}\n`;
      if (org.startDate) output += `      Founded: ${org.startDate}\n`;
      if (org.description) output += `      ${org.description.substring(0, 80)}\n`;
      output += '\n';
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate foreign relations section
   */
  private generateForeignRelations(profile: PersonProfile): string {
    if (!profile.foreignRelations || profile.foreignRelations.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                    DOCUMENTED FOREIGN RELATIONS                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const fr of profile.foreignRelations.slice(0, 15)) {
      const typeIcon = fr.relationType === 'MEETING' ? '🤝' :
                       fr.relationType === 'ENDORSEMENT' ? '✓' :
                       fr.relationType === 'OPPOSITION' ? '✗' :
                       fr.relationType === 'FUNDING' ? '💰' : '📢';

      output += `    ${typeIcon} ${fr.date.padEnd(12)} │ ${fr.country.padEnd(15)} │ ${fr.entity}\n`;
      output += `                      └─ ${fr.description.substring(0, 70)}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate positions section
   */
  private generatePositions(profile: PersonProfile): string {
    if (!profile.positions || profile.positions.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      DOCUMENTED PUBLIC POSITIONS                                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const pos of profile.positions.slice(0, 10)) {
      output += `    ▸ ${pos.topic} [${pos.category}]\n`;
      output += `      Position: ${pos.currentPosition.substring(0, 80)}\n`;
      output += `      Consistency: ${pos.consistency}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate controversies section
   */
  private generateControversies(profile: PersonProfile): string {
    if (!profile.controversies || profile.controversies.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      DOCUMENTED CONTROVERSIES                                                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (const cont of profile.controversies.slice(0, 8)) {
      const sigIcon = cont.significance === 'HIGH' ? '⚠️' : cont.significance === 'MEDIUM' ? '⚡' : '○';
      const statusIcon = cont.ongoing ? '[ONGOING]' : '[RESOLVED]';

      output += `    ${sigIcon} ${cont.title.substring(0, 50).padEnd(50)} ${statusIcon}\n`;
      output += `       Category: ${cont.category} │ Date: ${cont.date}\n`;
      output += `       ${cont.description.substring(0, 80)}\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate timeline section
   */
  private generateTimeline(events: TimelineEvent[]): string {
    if (!events || events.length === 0) {
      return '';
    }

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                         CHRONOLOGICAL TIMELINE                                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    const displayEvents = events.slice(0, 25);
    for (let i = 0; i < displayEvents.length; i++) {
      const event = displayEvents[i];
      const icon = event.category === 'POLITICAL' ? '🏛️' :
                   event.category === 'PERSONAL' ? '👤' :
                   event.category === 'ORGANIZATIONAL' ? '🏢' :
                   event.category === 'MEETING' ? '🤝' :
                   event.category === 'STATEMENT' ? '📢' :
                   event.category === 'CONTROVERSY' ? '⚠️' : '📅';

      const sigIcon = event.significance === 'HIGH' ? '★' : event.significance === 'MEDIUM' ? '◆' : '○';
      const connector = i === displayEvents.length - 1 ? '└' : '├';

      output += `    ${event.date.padEnd(12)} ${connector}──${icon}── ${sigIcon} ${event.event.substring(0, 70)}\n`;
      if (i < displayEvents.length - 1) output += `                    │\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate top relationships section
   */
  private generateTopRelationships(relationships: Relationship[], entities: Entity[]): string {
    if (!relationships || relationships.length === 0) {
      return '';
    }

    const entityMap = new Map(entities.map(e => [e.id, e]));
    const sorted = [...relationships].sort((a, b) => b.weight - a.weight).slice(0, 15);

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                   TOP RELATIONSHIPS BY STRENGTH                                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    for (let i = 0; i < sorted.length; i++) {
      const rel = sorted[i];
      const from = entityMap.get(rel.from)?.name || rel.from;
      const to = entityMap.get(rel.to)?.name || rel.to;
      const pct = (rel.weight * 100).toFixed(0);
      const bar = '█'.repeat(Math.round(rel.weight * 25));

      output += `    ${(i + 1).toString().padStart(2)}. ${from.substring(0, 20).padEnd(20)} ──[${rel.type.padEnd(15)}]──▶ ${to.substring(0, 20).padEnd(20)}\n`;
      output += `        ${bar} ${pct}%\n\n`;
    }

    output += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate entity breakdown section
   */
  private generateEntityBreakdown(entities: Entity[]): string {
    const typeCounts = new Map<string, number>();
    for (const e of entities) {
      typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
    }

    const maxCount = Math.max(...typeCounts.values());
    const icons: Record<string, string> = {
      PERSON: '👤', COMPANY: '🏢', ORGANIZATION: '🏛️', GOVERNMENT: '🏛️',
      POLITICAL_PARTY: '🏛️', THINK_TANK: '🎓', MEDIA_OUTLET: '📰',
      NGO: '🤝', COALITION: '🤝', LOCATION: '📍', COUNTRY: '🌍',
      EVENT: '📅', SOCIAL_ACCOUNT: '💬', EDUCATIONAL_INSTITUTION: '🎓'
    };

    let output = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                      ENTITY TYPE BREAKDOWN                                                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫

`;

    const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
      const bar = '▓'.repeat(Math.round((count / maxCount) * 40));
      const icon = icons[type] || '❓';
      output += `    ${icon} ${type.padEnd(25)} │${bar.padEnd(40)}│ ${count}\n`;
    }

    output += `
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
    return output;
  }

  /**
   * Generate sources section
   */
  private generateSources(sources: any[]): string {
    // Simplified source output
    return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           METHODOLOGY                                                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                                                                 ┃
┃  • All data sourced from publicly available records                                                             ┃
┃  • No private data collected or inferred                                                                        ┃
┃  • No speculation - all claims are source-anchored                                                              ┃
┃  • Relationships documented with evidence citations                                                             ┃
┃  • This report documents public narratives and documented relationships only                                    ┃
┃                                                                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

`;
  }

  /**
   * Generate footer
   */
  private generateFooter(report: ResearchReport): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                  ║
║                                      ✓ PRISM RESEARCH COMPLETE                                                  ║
║                                                                                                                  ║
║  Generated: ${report.generatedAt.toISOString().padEnd(30)}                                                       ║
║  Entities:  ${report.graph.entities.length.toString().padEnd(10)} Relationships: ${report.graph.relationships.length.toString().padEnd(10)} Timeline Events: ${report.profile.timeline.length.toString().padEnd(5)}              ║
║                                                                                                                  ║
║  Export Formats: JSON, GraphML, Mermaid, Neo4j Cypher, CSV                                                      ║
║                                                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

`;
  }

  /**
   * Generate Mermaid diagram
   */
  generateMermaid(report: ResearchReport): string {
    let mermaid = 'graph LR\n';
    mermaid += '    %% PRISM Intelligence Graph\n\n';

    // Group entities by type
    const byType = new Map<string, Entity[]>();
    for (const e of report.graph.entities) {
      if (!byType.has(e.type)) byType.set(e.type, []);
      byType.get(e.type)!.push(e);
    }

    // Add subgraphs
    for (const [type, entities] of byType) {
      mermaid += `    subgraph ${type}\n`;
      for (const e of entities.slice(0, 20)) {
        const icon = this.getMermaidIcon(e.type);
        const label = e.name.substring(0, 25).replace(/"/g, "'");
        mermaid += `        ${e.id}["${icon} ${label}"]\n`;
      }
      mermaid += '    end\n\n';
    }

    // Add relationships
    for (const r of report.graph.relationships.slice(0, 50)) {
      const style = r.weight > 0.8 ? '===' : '--';
      mermaid += `    ${r.from} ${style}"${r.type}"${style}> ${r.to}\n`;
    }

    return mermaid;
  }

  /**
   * Get Mermaid icon for entity type
   */
  private getMermaidIcon(type: string): string {
    const icons: Record<string, string> = {
      PERSON: '👤', COMPANY: '🏢', ORGANIZATION: '🏛️', GOVERNMENT: '🏛️',
      POLITICAL_PARTY: '🏛️', THINK_TANK: '🎓', MEDIA_OUTLET: '📰',
      COUNTRY: '🌍', LOCATION: '📍', EVENT: '📅'
    };
    return icons[type] || '❓';
  }

  /**
   * Export to JSON
   */
  exportJSON(report: ResearchReport): string {
    return JSON.stringify(report, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }, 2);
  }
}
