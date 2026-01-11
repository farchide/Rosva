/**
 * PRISM Biography Research Agent
 *
 * Gathers biographical information including:
 * - Personal details (birth, death, nationality)
 * - Family relationships
 * - Education history
 * - Career timeline
 */

import { BaseAgent, AgentConfig, SearchResult } from './base-agent';
import {
  Biography,
  FamilyNetwork,
  FamilyMember,
  EducationHistory,
  EducationRecord,
  CareerHistory,
  CareerPosition
} from '../core/types';

export interface BiographyResult {
  biography: Biography;
  family: FamilyNetwork;
  education: EducationHistory;
  career: CareerHistory;
}

export class BiographyAgent extends BaseAgent {
  constructor(config: AgentConfig = {}) {
    super('BiographyAgent', config);
  }

  async research(subject: string, context?: Record<string, any>): Promise<BiographyResult> {
    // In a real implementation, this would make web searches
    // For now, we return a structure that can be populated

    const biography: Biography = {
      fullName: subject,
      nationality: [],
      occupation: [],
      titles: [],
      summary: ''
    };

    const family: FamilyNetwork = {
      members: []
    };

    const education: EducationHistory = {
      institutions: [],
      degrees: [],
      fields: []
    };

    const career: CareerHistory = {
      positions: [],
      industries: []
    };

    return { biography, family, education, career };
  }

  /**
   * Parse biography from search results
   */
  parseBiography(results: SearchResult[]): Partial<Biography> {
    const bio: Partial<Biography> = {
      nationality: [],
      occupation: [],
      titles: []
    };

    for (const result of results) {
      const text = result.snippet;

      // Extract birth information
      const birthMatch = text.match(/born\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4})/i);
      if (birthMatch && !bio.birthDate) {
        bio.birthDate = birthMatch[1];
      }

      const birthPlaceMatch = text.match(/born\s+(?:on\s+[^,]+,?\s+)?in\s+([A-Za-z\s,]+)/i);
      if (birthPlaceMatch && !bio.birthPlace) {
        bio.birthPlace = birthPlaceMatch[1].trim();
      }

      // Extract nationality
      const nationalityMatch = text.match(/(\w+(?:-\w+)?)\s+(?:politician|activist|leader|prince|businessman)/i);
      if (nationalityMatch) {
        const nat = nationalityMatch[1];
        if (!bio.nationality!.includes(nat)) {
          bio.nationality!.push(nat);
        }
      }

      // Extract titles
      const titlePatterns = [
        /(?:Crown\s+)?Prince/i,
        /President/i,
        /Prime\s+Minister/i,
        /Minister/i,
        /Ambassador/i,
        /Senator/i,
        /CEO/i,
        /Founder/i,
        /Director/i,
        /Chairman/i
      ];

      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match && !bio.titles!.includes(match[0])) {
          bio.titles!.push(match[0]);
        }
      }
    }

    return bio;
  }

  /**
   * Parse family members from search results
   */
  parseFamilyMembers(results: SearchResult[], subject: string): FamilyMember[] {
    const members: FamilyMember[] = [];
    const seen = new Set<string>();

    // Enhanced patterns to capture common name formats
    const relationshipPatterns = [
      // Direct patterns: "his father, Name" or "his father Name"
      { pattern: /(?:his|her)\s+(?:late\s+)?father[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Father' },
      { pattern: /(?:his|her)\s+(?:late\s+)?mother[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Mother' },
      { pattern: /(?:his|her)\s+wife[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Wife' },
      { pattern: /wife\s+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Wife' },
      { pattern: /married\s+(?:to\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Spouse' },
      { pattern: /(?:his|her)\s+husband[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Husband' },
      { pattern: /(?:his|her)\s+(?:eldest\s+)?son[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Son' },
      { pattern: /(?:his|her)\s+(?:eldest\s+)?daughter[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Daughter' },
      { pattern: /(?:his|her)\s+(?:younger\s+|elder\s+)?brother[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Brother' },
      { pattern: /(?:his|her)\s+(?:younger\s+|elder\s+)?sister[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Sister' },
      { pattern: /son\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Parent' },
      { pattern: /daughter\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})/gi, relationship: 'Parent' },
      // Child patterns: "children: Name, Name, Name"
      { pattern: /children[:\s]+(?:include\s+)?([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)/gi, relationship: 'Child' },
      { pattern: /(?:\d+\s+)?children[:\s]+([A-Z][a-z'"]+(?:\s+[A-Z][a-z'-]+)*)/gi, relationship: 'Child' },
      // Name is the [relation]: "Jennifer is his wife"
      { pattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})\s+is\s+(?:his|her)\s+wife/gi, relationship: 'Wife' },
      { pattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){0,3})\s+is\s+(?:his|her)\s+husband/gi, relationship: 'Husband' },
    ];

    for (const result of results) {
      for (const { pattern, relationship } of relationshipPatterns) {
        let match;
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        while ((match = pattern.exec(result.snippet)) !== null) {
          let name = match[1].trim();

          // Clean up the name - remove trailing words that aren't part of names
          name = this.cleanupName(name);

          // Skip if empty or same as subject
          if (!name || name.length < 2) continue;
          if (this.normalizeForComparison(name) === this.normalizeForComparison(subject)) continue;

          // Skip common false positives
          if (/^(the|and|or|is|was|has|have|his|her|their)$/i.test(name)) continue;

          if (!seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());

            const isDeceased = result.snippet.toLowerCase().includes(`late ${name.toLowerCase()}`) ||
                               result.snippet.toLowerCase().includes(`${name.toLowerCase()} died`) ||
                               result.snippet.toLowerCase().includes(`death of ${name.toLowerCase()}`);

            members.push({
              entityId: `person_${name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
              name,
              relationship,
              status: isDeceased ? 'DECEASED' : 'UNKNOWN',
              sources: [result.url]
            });
          }
        }
      }
    }

    return members;
  }

  /**
   * Clean up extracted name
   */
  private cleanupName(name: string): string {
    // Remove common trailing non-name words
    const stopWords = ['and', 'is', 'was', 'has', 'have', 'the', 'a', 'an', 'who', 'which', 'that',
                        'Jr', 'Sr', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

    let parts = name.split(/\s+/);

    // Keep names that look like proper nouns (start with capital)
    parts = parts.filter((word, idx) => {
      // Keep first word always if it's capitalized
      if (idx === 0 && /^[A-Z]/.test(word)) return true;
      // Keep subsequent words if capitalized and not stop words
      if (/^[A-Z]/.test(word) && !stopWords.includes(word)) return true;
      // Keep Jr, Sr suffixes
      if (['Jr', 'Sr', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'].includes(word)) return true;
      return false;
    });

    return parts.join(' ');
  }

  /**
   * Normalize name for comparison
   */
  private normalizeForComparison(name: string): string {
    return name.toLowerCase().replace(/[^a-z]/g, '');
  }

  /**
   * Parse education from search results
   */
  parseEducation(results: SearchResult[]): EducationRecord[] {
    const records: EducationRecord[] = [];
    const seen = new Set<string>();

    const eduPatterns = [
      /(?:attended|studied\s+at|graduated\s+from|enrolled\s+(?:at|in))\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:University|College|School|Institute|Academy))/gi,
      /([A-Z][a-zA-Z\s]+(?:University|College))\s+(?:graduate|alumnus|alumni)/gi,
      /(?:B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?|J\.?D\.?|M\.?B\.?A\.?)\s+(?:in\s+)?([A-Za-z\s]+)\s+(?:from|at)\s+([A-Z][a-zA-Z\s]+)/gi
    ];

    for (const result of results) {
      for (const pattern of eduPatterns) {
        let match;
        while ((match = pattern.exec(result.snippet)) !== null) {
          const institution = match[1]?.trim() || match[2]?.trim();
          if (institution && !seen.has(institution)) {
            seen.add(institution);

            // Try to extract degree info
            const degreeMatch = result.snippet.match(/(B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?|J\.?D\.?|M\.?B\.?A\.?)/i);
            const fieldMatch = result.snippet.match(/(?:in|of)\s+([A-Za-z\s]+?)(?:\s+from|\s+at|\.|,)/i);

            records.push({
              institution,
              degree: degreeMatch ? degreeMatch[1] : undefined,
              field: fieldMatch ? fieldMatch[1].trim() : undefined,
              completed: !result.snippet.toLowerCase().includes('did not complete'),
              sources: [result.url]
            });
          }
        }
      }
    }

    return records;
  }

  /**
   * Parse career positions from search results
   */
  parseCareer(results: SearchResult[], subject: string): CareerPosition[] {
    const positions: CareerPosition[] = [];
    const seen = new Set<string>();

    const careerPatterns = [
      /(?:founded|co-founded|established)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+)/gi,
      /(?:CEO|founder|president|director|chairman|leader)\s+(?:of\s+)?(?:the\s+)?([A-Z][a-zA-Z\s]+)/gi,
      /(?:served|worked|appointed)\s+as\s+([a-zA-Z\s]+)\s+(?:at|of|for)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+)/gi,
      /([A-Z][a-zA-Z\s]+(?:Foundation|Institute|Organization|Party|Movement))/gi
    ];

    for (const result of results) {
      // Look for role + organization patterns
      const roleOrgMatch = result.snippet.match(/(?:as\s+)?(?:the\s+)?(\w+(?:\s+\w+)?)\s+(?:of|at)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+)/gi);
      if (roleOrgMatch) {
        for (const match of roleOrgMatch) {
          const parts = match.match(/(?:as\s+)?(?:the\s+)?(\w+(?:\s+\w+)?)\s+(?:of|at)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+)/i);
          if (parts && parts[1] && parts[2]) {
            const key = `${parts[1]}_${parts[2]}`;
            if (!seen.has(key)) {
              seen.add(key);

              const isCurrent = result.snippet.toLowerCase().includes('currently') ||
                               result.snippet.toLowerCase().includes('present');

              positions.push({
                title: parts[1].trim(),
                organization: parts[2].trim(),
                current: isCurrent,
                sources: [result.url]
              });
            }
          }
        }
      }
    }

    return positions;
  }
}
