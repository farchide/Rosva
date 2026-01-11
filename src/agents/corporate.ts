/**
 * Corporate Agent
 *
 * Researches corporate/organizational affiliations:
 * - SEC filings
 * - State business registrations
 * - Nonprofit 990 filings
 * - Board memberships
 * - Executive positions
 */

import { BaseAgent, ResearchContext, Finding, Source, Evidence, AgentConfig } from './base';

const DEFAULT_CONFIG: AgentConfig = {
  name: 'CorporateAgent',
  sourceTypes: ['sec', 'state_registry', 'nonprofit', 'board'],
  maxConcurrentRequests: 5,
  rateLimitPerMinute: 30,
  timeout: 30000
};

interface CorporateRole {
  organization: string;
  role: string;
  type: 'executive' | 'board' | 'founder' | 'employee' | 'advisor';
  startDate?: Date;
  endDate?: Date;
  source: string;
  sourceUrl: string;
}

interface OrganizationInfo {
  name: string;
  type: 'corporation' | 'nonprofit' | 'llc' | 'partnership' | 'other';
  jurisdiction: string;
  status: 'active' | 'inactive' | 'dissolved';
  registrationDate?: Date;
  principals: string[];
  address?: string;
  sourceUrl: string;
}

export class CorporateAgent extends BaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Research corporate affiliations for a subject
   */
  async research(context: ResearchContext): Promise<Finding[]> {
    this.log(`Starting research for: ${context.subject}`);
    const findings: Finding[] = [];

    // Search SEC EDGAR for executive/director roles
    await this.rateLimit();
    const secRoles = await this.searchSEC(context);
    findings.push(...this.processRoles(secRoles, context.subject));

    // Search nonprofit databases
    await this.rateLimit();
    const nonprofitRoles = await this.searchNonprofits(context);
    findings.push(...this.processRoles(nonprofitRoles, context.subject));

    // Search state registries
    if (context.depth !== 'quick') {
      await this.rateLimit();
      const stateRoles = await this.searchStateRegistries(context);
      findings.push(...this.processRoles(stateRoles, context.subject));
    }

    // Search for organization connections
    if (context.depth === 'comprehensive') {
      const orgs = await this.findConnectedOrganizations(context);
      findings.push(...this.processOrganizations(orgs, context.subject));
    }

    this.log(`Found ${findings.length} findings`);
    return findings;
  }

  /**
   * Search SEC EDGAR for roles
   */
  private async searchSEC(context: ResearchContext): Promise<CorporateRole[]> {
    // Would search SEC EDGAR for:
    // - Form DEF 14A (proxy statements) for board members
    // - Form 10-K/10-Q for executive mentions
    // - Form 4 for insider trading disclosures
    // - Form 8-K for appointments/departures

    // Placeholder implementation
    return [];
  }

  /**
   * Search nonprofit databases (IRS 990s)
   */
  private async searchNonprofits(context: ResearchContext): Promise<CorporateRole[]> {
    // Would search:
    // - ProPublica Nonprofit Explorer
    // - IRS Form 990 database
    // - GuideStar/Candid

    // Placeholder implementation
    return [];
  }

  /**
   * Search state business registries
   */
  private async searchStateRegistries(context: ResearchContext): Promise<CorporateRole[]> {
    // Would search:
    // - Delaware Division of Corporations
    // - California Secretary of State
    // - New York DOS
    // - OpenCorporates aggregation

    // Placeholder implementation
    return [];
  }

  /**
   * Find organizations connected to the subject
   */
  private async findConnectedOrganizations(
    context: ResearchContext
  ): Promise<OrganizationInfo[]> {
    // Build network of organizations
    // Placeholder implementation
    return [];
  }

  /**
   * Process corporate roles into findings
   */
  private processRoles(roles: CorporateRole[], subject: string): Finding[] {
    return roles.map(role => {
      const source = this.createSource(
        role.sourceUrl,
        `${role.source}: ${role.organization}`,
        'corporate_filing',
        role.startDate,
        0.9 // Corporate filings are highly reliable
      );

      const evidence: Evidence = {
        type: 'corporate_role',
        content: `${role.role} at ${role.organization}`,
        source
      };

      const timeframe = this.formatTimeframe(role.startDate, role.endDate);
      const claim = `Served as ${role.role} at ${role.organization}${timeframe}`;

      return this.createFinding(
        'corporate_affiliation',
        subject,
        claim,
        [evidence],
        [source],
        0.9,
        role.startDate
      );
    });
  }

  /**
   * Process organizations into findings
   */
  private processOrganizations(
    orgs: OrganizationInfo[],
    subject: string
  ): Finding[] {
    return orgs.map(org => {
      const source = this.createSource(
        org.sourceUrl,
        `Registry: ${org.name}`,
        'state_registry',
        org.registrationDate,
        0.95
      );

      const evidence: Evidence = {
        type: 'organization_registration',
        content: `${org.name} (${org.type}) registered in ${org.jurisdiction}`,
        source
      };

      return this.createFinding(
        'organization_connection',
        subject,
        `Connected to ${org.name}, a ${org.status} ${org.type} in ${org.jurisdiction}`,
        [evidence],
        [source],
        0.85,
        org.registrationDate
      );
    });
  }

  /**
   * Format a timeframe for display
   */
  private formatTimeframe(start?: Date, end?: Date): string {
    if (!start && !end) return '';

    const startStr = start ? start.getFullYear().toString() : 'unknown';
    const endStr = end ? end.getFullYear().toString() : 'present';

    return ` (${startStr}-${endStr})`;
  }
}

export default CorporateAgent;
