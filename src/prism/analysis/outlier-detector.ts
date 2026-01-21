/**
 * PRISM Outlier Detection Module
 *
 * Identifies contradictions and anomalies in a subject's narrative:
 * - Iran stance outliers (anti-regime person making pro-regime statements)
 * - Political flip-flops (contradictory party support)
 * - Narrative inconsistencies
 * - Suspicious engagement patterns
 *
 * Critical for verifying consistency and detecting potential:
 * - Compromised positions
 * - Evolving stances
 * - Deliberate narrative manipulation
 * - Authentic position changes
 */

export interface Outlier {
  id: string;
  type: OutlierType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: OutlierCategory;
  description: string;
  expectedBehavior: string;
  actualBehavior: string;
  evidence: OutlierEvidence[];
  date?: string;
  source?: string;
  confidence: number; // 0-100
  possibleExplanations: string[];
}

export type OutlierType =
  | 'CONTRADICTION'      // Direct contradiction of stated position
  | 'FLIP_FLOP'         // Changed position over time
  | 'ANOMALY'           // Unusual behavior that doesn't fit pattern
  | 'INCONSISTENCY'     // Minor inconsistency in narrative
  | 'SUSPICIOUS'        // Potentially suspicious activity
  | 'ASSOCIATION';      // Unexpected association with opposing group

export type OutlierCategory =
  | 'IRAN_STANCE'       // Iran-related contradictions
  | 'POLITICAL'         // Political party/ideology contradictions
  | 'FINANCIAL'         // Financial inconsistencies
  | 'NETWORK'           // Network/association anomalies
  | 'NARRATIVE'         // General narrative contradictions
  | 'TEMPORAL';         // Time-based anomalies

export interface OutlierEvidence {
  type: 'TWEET' | 'STATEMENT' | 'ENDORSEMENT' | 'MEETING' | 'DOCUMENT' | 'ASSOCIATION';
  content: string;
  date?: string;
  source: string;
  url?: string;
}

export interface OutlierAnalysisResult {
  subject: string;
  totalOutliers: number;
  criticalOutliers: number;
  outliers: Outlier[];
  consistencyScore: number; // 0-100, higher = more consistent
  iranStanceConsistency: number;
  politicalConsistency: number;
  narrativeSummary: string;
  redFlags: string[];
}

export interface PatternProfile {
  primaryIranStance: 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN';
  primaryPoliticalLeaning: string;
  expectedHashtags: string[];
  expectedMentions: string[];
  expectedTopics: string[];
  opposingHashtags: string[];
  opposingMentions: string[];
}

export class OutlierDetector {
  private outliers: Outlier[] = [];
  private outlierId = 0;

  /**
   * Analyze for outliers across all categories
   */
  analyze(
    subject: string,
    pattern: PatternProfile,
    content: AnalysisContent
  ): OutlierAnalysisResult {
    this.outliers = [];
    this.outlierId = 0;

    // Detect Iran stance outliers
    this.detectIranStanceOutliers(subject, pattern, content);

    // Detect political outliers
    this.detectPoliticalOutliers(subject, pattern, content);

    // Detect network/association outliers
    this.detectNetworkOutliers(subject, pattern, content);

    // Detect temporal outliers (flip-flops over time)
    this.detectTemporalOutliers(subject, pattern, content);

    // Calculate consistency scores
    const iranConsistency = this.calculateIranConsistency(pattern, content);
    const politicalConsistency = this.calculatePoliticalConsistency(pattern, content);
    const overallConsistency = Math.round((iranConsistency + politicalConsistency) / 2);

    // Generate red flags
    const redFlags = this.generateRedFlags();

    // Generate narrative summary
    const narrativeSummary = this.generateNarrativeSummary(subject, pattern);

    return {
      subject,
      totalOutliers: this.outliers.length,
      criticalOutliers: this.outliers.filter(o => o.severity === 'CRITICAL').length,
      outliers: this.outliers,
      consistencyScore: overallConsistency,
      iranStanceConsistency: iranConsistency,
      politicalConsistency: politicalConsistency,
      narrativeSummary,
      redFlags
    };
  }

  /**
   * Detect Iran stance contradictions
   */
  private detectIranStanceOutliers(
    subject: string,
    pattern: PatternProfile,
    content: AnalysisContent
  ): void {
    // If subject is pro-opposition, look for pro-regime signals
    if (pattern.primaryIranStance === 'PRO_OPPOSITION') {
      // Check for regime-supporting hashtags
      const regimeHashtags = ['irgc', 'islamicrepublic', 'khamenei', 'velayat', 'sepah', 'hezbollah'];
      for (const hashtag of content.hashtags || []) {
        const lower = hashtag.toLowerCase();
        if (regimeHashtags.some(r => lower.includes(r))) {
          this.addOutlier({
            type: 'CONTRADICTION',
            severity: 'CRITICAL',
            category: 'IRAN_STANCE',
            description: `Pro-opposition ${subject} used regime-supporting hashtag`,
            expectedBehavior: 'Use opposition hashtags (#FreeIran, #WomanLifeFreedom)',
            actualBehavior: `Used #${hashtag} which supports the Islamic Republic`,
            evidence: [{
              type: 'TWEET',
              content: `Hashtag: #${hashtag}`,
              source: 'X/Twitter'
            }],
            confidence: 85,
            possibleExplanations: [
              'Sarcastic or critical usage',
              'Quoting regime supporters',
              'Position change',
              'Account compromise'
            ]
          });
        }
      }

      // Check for regime figure mentions/praise
      const regimeFigures = ['khamenei', 'raisi', 'rouhani', 'zarif', 'soleimani'];
      for (const mention of content.mentions || []) {
        const lower = mention.toLowerCase();
        for (const figure of regimeFigures) {
          if (lower.includes(figure)) {
            // Check context - is it criticism or praise?
            const context = this.findMentionContext(mention, content.tweets || []);
            if (context && !this.isCriticalContext(context)) {
              this.addOutlier({
                type: 'ANOMALY',
                severity: 'HIGH',
                category: 'IRAN_STANCE',
                description: `Pro-opposition ${subject} mentioned regime figure without clear criticism`,
                expectedBehavior: 'Criticize regime figures or avoid positive mentions',
                actualBehavior: `Mentioned ${figure} - context unclear`,
                evidence: [{
                  type: 'TWEET',
                  content: context || `Mention of ${figure}`,
                  source: 'X/Twitter'
                }],
                confidence: 60,
                possibleExplanations: [
                  'Neutral reporting',
                  'Historical reference',
                  'Context missing',
                  'Actual support (rare)'
                ]
              });
            }
          }
        }
      }

      // Check for anti-opposition content
      const antiOppositionPhrases = [
        'mek terrorist', 'pahlavi dictator', 'shah crimes', 'monarchist',
        'foreign interference', 'regime change bad', 'sanctions hurt people'
      ];
      for (const tweet of content.tweets || []) {
        const lower = tweet.text.toLowerCase();
        for (const phrase of antiOppositionPhrases) {
          if (lower.includes(phrase) && !this.isNegation(lower, phrase)) {
            this.addOutlier({
              type: 'CONTRADICTION',
              severity: 'HIGH',
              category: 'IRAN_STANCE',
              description: `Pro-opposition ${subject} used anti-opposition rhetoric`,
              expectedBehavior: 'Support opposition movements and figures',
              actualBehavior: `Statement contains: "${phrase}"`,
              evidence: [{
                type: 'TWEET',
                content: tweet.text.substring(0, 200),
                source: 'X/Twitter',
                date: tweet.date
              }],
              confidence: 70,
              possibleExplanations: [
                'Nuanced criticism within opposition',
                'Quoting critics',
                'Genuine disagreement on tactics',
                'Position evolution'
              ]
            });
          }
        }
      }
    }

    // If subject is pro-regime, look for opposition signals
    if (pattern.primaryIranStance === 'PRO_REGIME') {
      const oppositionHashtags = ['freeiran', 'womanlifefreedom', 'mahsaamini', 'pahlavi', 'regimechange'];
      for (const hashtag of content.hashtags || []) {
        const lower = hashtag.toLowerCase();
        if (oppositionHashtags.some(o => lower.includes(o))) {
          this.addOutlier({
            type: 'CONTRADICTION',
            severity: 'CRITICAL',
            category: 'IRAN_STANCE',
            description: `Pro-regime ${subject} used opposition hashtag`,
            expectedBehavior: 'Avoid or criticize opposition hashtags',
            actualBehavior: `Used #${hashtag} which supports opposition`,
            evidence: [{
              type: 'TWEET',
              content: `Hashtag: #${hashtag}`,
              source: 'X/Twitter'
            }],
            confidence: 85,
            possibleExplanations: [
              'Mocking usage',
              'Position change',
              'Infiltration attempt',
              'Genuine awakening'
            ]
          });
        }
      }
    }
  }

  /**
   * Detect political contradictions
   */
  private detectPoliticalOutliers(
    subject: string,
    pattern: PatternProfile,
    content: AnalysisContent
  ): void {
    const politicalOpposites: Record<string, string[]> = {
      'Republican': ['democrat', 'biden', 'liberal', 'progressive', 'bluewave', 'dnc'],
      'Democrat': ['republican', 'trump', 'maga', 'conservative', 'gop', 'redwave'],
      'Conservative': ['liberal', 'progressive', 'socialist', 'leftist'],
      'Liberal': ['conservative', 'rightwing', 'maga', 'nationalist'],
      'Libertarian': ['authoritarian', 'statist', 'big government']
    };

    const opposites = politicalOpposites[pattern.primaryPoliticalLeaning] || [];

    for (const hashtag of content.hashtags || []) {
      const lower = hashtag.toLowerCase();
      for (const opposite of opposites) {
        if (lower.includes(opposite)) {
          this.addOutlier({
            type: 'CONTRADICTION',
            severity: 'MEDIUM',
            category: 'POLITICAL',
            description: `${pattern.primaryPoliticalLeaning} ${subject} used opposing political hashtag`,
            expectedBehavior: `Support ${pattern.primaryPoliticalLeaning} positions`,
            actualBehavior: `Used #${hashtag} (associated with opposition)`,
            evidence: [{
              type: 'TWEET',
              content: `Hashtag: #${hashtag}`,
              source: 'X/Twitter'
            }],
            confidence: 65,
            possibleExplanations: [
              'Bipartisan issue',
              'Criticizing the opposition',
              'Independent on this issue',
              'Position evolution'
            ]
          });
        }
      }
    }

    // Check for endorsements of opposing figures
    const opposingFigures: Record<string, string[]> = {
      'Republican': ['biden', 'pelosi', 'aoc', 'bernie', 'harris', 'schumer'],
      'Democrat': ['trump', 'desantis', 'mcconnell', 'mtg', 'boebert', 'cruz']
    };

    const oppFigures = opposingFigures[pattern.primaryPoliticalLeaning] || [];
    for (const tweet of content.tweets || []) {
      const lower = tweet.text.toLowerCase();
      for (const figure of oppFigures) {
        if (lower.includes(figure) && this.isPraise(lower, figure)) {
          this.addOutlier({
            type: 'ANOMALY',
            severity: 'MEDIUM',
            category: 'POLITICAL',
            description: `${pattern.primaryPoliticalLeaning} ${subject} praised opposing political figure`,
            expectedBehavior: `Criticize or ignore ${figure}`,
            actualBehavior: `Appeared to praise ${figure}`,
            evidence: [{
              type: 'TWEET',
              content: tweet.text.substring(0, 200),
              source: 'X/Twitter',
              date: tweet.date
            }],
            confidence: 55,
            possibleExplanations: [
              'Agreement on specific issue',
              'Sarcasm not detected',
              'Genuine bipartisan moment',
              'Position change'
            ]
          });
        }
      }
    }
  }

  /**
   * Detect network/association anomalies
   */
  private detectNetworkOutliers(
    subject: string,
    pattern: PatternProfile,
    content: AnalysisContent
  ): void {
    // Check for follows/engagement with opposing figures
    for (const connection of content.connections || []) {
      // Iran-related
      if (pattern.primaryIranStance === 'PRO_OPPOSITION') {
        const regimeAccounts = ['khaborji_ir', 'iikihlai', 'press_tv', 'iran_gov'];
        if (regimeAccounts.some(r => connection.username.toLowerCase().includes(r))) {
          this.addOutlier({
            type: 'ASSOCIATION',
            severity: 'HIGH',
            category: 'NETWORK',
            description: `Pro-opposition ${subject} connected with regime-affiliated account`,
            expectedBehavior: 'Avoid following/engaging regime accounts',
            actualBehavior: `Connected with @${connection.username}`,
            evidence: [{
              type: 'ASSOCIATION',
              content: `Following/mutual with @${connection.username}`,
              source: 'X/Twitter'
            }],
            confidence: 75,
            possibleExplanations: [
              'Monitoring regime activity',
              'Pre-existing connection',
              'Engagement for debate',
              'Actual alignment (investigate)'
            ]
          });
        }
      }
    }
  }

  /**
   * Detect temporal outliers (changes over time)
   */
  private detectTemporalOutliers(
    subject: string,
    pattern: PatternProfile,
    content: AnalysisContent
  ): void {
    if (!content.tweets || content.tweets.length < 10) return;

    // Sort tweets by date
    const sortedTweets = [...content.tweets]
      .filter(t => t.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    if (sortedTweets.length < 10) return;

    // Split into early and recent
    const midpoint = Math.floor(sortedTweets.length / 2);
    const earlyTweets = sortedTweets.slice(0, midpoint);
    const recentTweets = sortedTweets.slice(midpoint);

    // Analyze stance shift
    const earlyIranScore = this.calculateIranScore(earlyTweets);
    const recentIranScore = this.calculateIranScore(recentTweets);

    // Significant shift detection
    if (Math.abs(earlyIranScore - recentIranScore) > 50) {
      const shiftDirection = recentIranScore > earlyIranScore ?
        'more pro-opposition' : 'more pro-regime';

      this.addOutlier({
        type: 'FLIP_FLOP',
        severity: 'HIGH',
        category: 'TEMPORAL',
        description: `${subject} shows significant Iran stance shift over time`,
        expectedBehavior: 'Consistent stance on Iran',
        actualBehavior: `Shifted ${shiftDirection} (score change: ${Math.abs(earlyIranScore - recentIranScore)})`,
        evidence: [{
          type: 'STATEMENT',
          content: `Early period score: ${earlyIranScore}, Recent score: ${recentIranScore}`,
          source: 'Timeline analysis'
        }],
        confidence: 70,
        possibleExplanations: [
          'Genuine position evolution',
          'Response to events (e.g., 2022 protests)',
          'Strategic repositioning',
          'New information changed view'
        ]
      });
    }
  }

  /**
   * Calculate Iran stance score for a set of tweets
   */
  private calculateIranScore(tweets: { text: string; date?: string }[]): number {
    let score = 50; // Neutral baseline

    const oppositionKeywords = ['freeiran', 'womanlifefreedom', 'mahsa', 'pahlavi', 'regime change', 'dictatorship'];
    const regimeKeywords = ['irgc', 'islamic republic', 'resistance', 'sanctions bad', 'western interference'];

    for (const tweet of tweets) {
      const lower = tweet.text.toLowerCase();

      for (const kw of oppositionKeywords) {
        if (lower.includes(kw)) score += 5;
      }

      for (const kw of regimeKeywords) {
        if (lower.includes(kw)) score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if context is critical (negative)
   */
  private isCriticalContext(context: string): boolean {
    const criticalWords = ['against', 'condemn', 'criminal', 'dictator', 'murderer',
      'terrorist', 'oppose', 'reject', 'denounce', 'criticize', 'evil', 'corrupt'];
    const lower = context.toLowerCase();
    return criticalWords.some(w => lower.includes(w));
  }

  /**
   * Check if text contains negation before phrase
   */
  private isNegation(text: string, phrase: string): boolean {
    const negations = ['not', 'never', "don't", "doesn't", 'no', 'against', 'oppose'];
    const phraseIndex = text.indexOf(phrase);
    if (phraseIndex === -1) return false;

    const before = text.substring(Math.max(0, phraseIndex - 30), phraseIndex);
    return negations.some(n => before.includes(n));
  }

  /**
   * Check if text praises a figure
   */
  private isPraise(text: string, figure: string): boolean {
    const praiseWords = ['great', 'excellent', 'best', 'right', 'agree', 'support',
      'brilliant', 'smart', 'correct', 'admire', 'respect', 'thank'];
    const figureIndex = text.indexOf(figure);
    if (figureIndex === -1) return false;

    // Check 50 chars before and after
    const context = text.substring(
      Math.max(0, figureIndex - 50),
      Math.min(text.length, figureIndex + figure.length + 50)
    );

    return praiseWords.some(p => context.includes(p)) &&
           !this.isCriticalContext(context);
  }

  /**
   * Find context for a mention
   */
  private findMentionContext(mention: string, tweets: { text: string }[]): string | null {
    for (const tweet of tweets) {
      if (tweet.text.toLowerCase().includes(mention.toLowerCase())) {
        return tweet.text;
      }
    }
    return null;
  }

  /**
   * Calculate Iran consistency score
   */
  private calculateIranConsistency(pattern: PatternProfile, content: AnalysisContent): number {
    const iranOutliers = this.outliers.filter(o => o.category === 'IRAN_STANCE');
    const criticalCount = iranOutliers.filter(o => o.severity === 'CRITICAL').length;
    const highCount = iranOutliers.filter(o => o.severity === 'HIGH').length;

    let score = 100;
    score -= criticalCount * 25;
    score -= highCount * 15;
    score -= (iranOutliers.length - criticalCount - highCount) * 5;

    return Math.max(0, score);
  }

  /**
   * Calculate political consistency score
   */
  private calculatePoliticalConsistency(pattern: PatternProfile, content: AnalysisContent): number {
    const politicalOutliers = this.outliers.filter(o => o.category === 'POLITICAL');
    const criticalCount = politicalOutliers.filter(o => o.severity === 'CRITICAL').length;
    const highCount = politicalOutliers.filter(o => o.severity === 'HIGH').length;

    let score = 100;
    score -= criticalCount * 25;
    score -= highCount * 15;
    score -= (politicalOutliers.length - criticalCount - highCount) * 5;

    return Math.max(0, score);
  }

  /**
   * Generate red flags summary
   */
  private generateRedFlags(): string[] {
    const flags: string[] = [];

    const criticalOutliers = this.outliers.filter(o => o.severity === 'CRITICAL');
    if (criticalOutliers.length > 0) {
      flags.push(`${criticalOutliers.length} critical contradictions detected`);
    }

    const iranContradictions = this.outliers.filter(
      o => o.category === 'IRAN_STANCE' && o.type === 'CONTRADICTION'
    );
    if (iranContradictions.length > 0) {
      flags.push(`Iran stance contradictions found (${iranContradictions.length})`);
    }

    const flipFlops = this.outliers.filter(o => o.type === 'FLIP_FLOP');
    if (flipFlops.length > 0) {
      flags.push(`Position changes detected over time (${flipFlops.length})`);
    }

    const suspiciousAssociations = this.outliers.filter(
      o => o.category === 'NETWORK' && o.severity !== 'LOW'
    );
    if (suspiciousAssociations.length > 0) {
      flags.push(`Unexpected network associations (${suspiciousAssociations.length})`);
    }

    return flags;
  }

  /**
   * Generate narrative summary
   */
  private generateNarrativeSummary(subject: string, pattern: PatternProfile): string {
    if (this.outliers.length === 0) {
      return `${subject} shows consistent narrative alignment with stated positions. No significant contradictions detected.`;
    }

    const parts: string[] = [];

    const criticalCount = this.outliers.filter(o => o.severity === 'CRITICAL').length;
    if (criticalCount > 0) {
      parts.push(`${criticalCount} critical inconsistencies require attention`);
    }

    const iranOutliers = this.outliers.filter(o => o.category === 'IRAN_STANCE');
    if (iranOutliers.length > 0) {
      parts.push(`${iranOutliers.length} Iran-related anomalies detected despite ${pattern.primaryIranStance} stance`);
    }

    const politicalOutliers = this.outliers.filter(o => o.category === 'POLITICAL');
    if (politicalOutliers.length > 0) {
      parts.push(`${politicalOutliers.length} political inconsistencies found`);
    }

    return `${subject} analysis: ${parts.join('; ')}. Review outliers for context.`;
  }

  /**
   * Add outlier to list
   */
  private addOutlier(outlier: Omit<Outlier, 'id'>): void {
    this.outliers.push({
      ...outlier,
      id: `outlier_${++this.outlierId}`
    });
  }
}

/**
 * Content to analyze for outliers
 */
export interface AnalysisContent {
  tweets?: { text: string; date?: string }[];
  hashtags?: string[];
  mentions?: string[];
  connections?: { username: string; type: string }[];
  statements?: { text: string; date?: string; source: string }[];
  endorsements?: { entity: string; date?: string; type: 'GAVE' | 'RECEIVED' }[];
}

/**
 * Create pattern profile from existing analysis
 */
export function createPatternProfile(
  iranStance: 'PRO_OPPOSITION' | 'PRO_REGIME' | 'NEUTRAL' | 'UNKNOWN',
  politicalLeaning: string,
  hashtags: string[] = [],
  mentions: string[] = []
): PatternProfile {
  // Define expected vs opposing based on stance
  const oppositionHashtags = ['freeiran', 'womanlifefreedom', 'mahsaamini', 'pahlavi'];
  const regimeHashtags = ['irgc', 'islamicrepublic', 'resistance'];

  return {
    primaryIranStance: iranStance,
    primaryPoliticalLeaning: politicalLeaning,
    expectedHashtags: iranStance === 'PRO_OPPOSITION' ? oppositionHashtags :
                       iranStance === 'PRO_REGIME' ? regimeHashtags : [],
    expectedMentions: [],
    expectedTopics: [],
    opposingHashtags: iranStance === 'PRO_OPPOSITION' ? regimeHashtags :
                       iranStance === 'PRO_REGIME' ? oppositionHashtags : [],
    opposingMentions: []
  };
}
