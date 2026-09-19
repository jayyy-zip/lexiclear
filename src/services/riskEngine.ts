import type {
  DimensionScore,
  EvidenceStrength,
  LegalHealthScore,
  RiskSeverity,
  SilentRisk,
  Clause
} from '../types/schemas';

export function calculateCompositeHealthScore(dimensions: {
  fairness: number;
  clarity: number;
  riskExposure: number;
  obligationBalance: number;
  terminationRights: number;
  disputeResolution: number;
}): number {
  const weighted =
    clampScore(dimensions.fairness) * 0.20 +
    clampScore(dimensions.clarity) * 0.15 +
    clampScore(dimensions.riskExposure) * 0.25 +
    clampScore(dimensions.obligationBalance) * 0.15 +
    clampScore(dimensions.terminationRights) * 0.15 +
    clampScore(dimensions.disputeResolution) * 0.10;

  return Math.max(0, Math.min(100, Math.round(weighted)));
}

export function clampScore(score: unknown, fallback: number = 60): number {
  if (typeof score !== 'number' || isNaN(score)) return fallback;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreStatus(score: number): LegalHealthScore['status'] {
  if (score < 45) return 'Critical Risk';
  if (score < 65) return 'Needs Attention';
  if (score < 80) return 'Moderate Health';
  return 'Strong Terms';
}

export function getDimensionStatus(score: number): DimensionScore['status'] {
  if (score < 45) return 'Critical';
  if (score < 65) return 'Warning';
  if (score < 80) return 'Fair';
  return 'Strong';
}

export function normalizeSeverity(severity?: string): RiskSeverity {
  if (!severity) return 'medium';
  const lower = severity.toLowerCase().trim();
  if (lower.includes('high') || lower.includes('critical') || lower.includes('severe')) return 'high';
  if (lower.includes('low') || lower.includes('minor') || lower.includes('informational')) return 'low';
  return 'medium';
}

/**
 * Validates evidence strength string to ensure defensible labels.
 */
export function normalizeEvidenceStrength(strength?: string): EvidenceStrength {
  if (!strength) return 'Moderate evidence';
  const lower = strength.toLowerCase();
  if (lower.includes('strong') || lower.includes('high') || lower.includes('explicit')) {
    return 'Strong evidence';
  }
  if (lower.includes('limited') || lower.includes('low') || lower.includes('weak') || lower.includes('implied')) {
    return 'Limited evidence';
  }
  return 'Moderate evidence';
}

/**
 * Deduplicates risks to prevent repetitive findings in large documents.
 */
export function deduplicateRisks(risks: SilentRisk[]): SilentRisk[] {
  const seen = new Set<string>();
  const deduplicated: SilentRisk[] = [];

  for (const risk of risks) {
    // Fingerprint based on clauseId and normalized title/evidence
    const normTitle = (risk.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const normEvidence = (risk.evidence || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 50).trim();
    const key = `${risk.clauseId}_${normTitle}_${normEvidence}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(risk);
    }
  }

  return deduplicated;
}

export function buildLegalHealthScore(
  dimensionsInput: {
    fairness: { score: number; keyFinding: string };
    clarity: { score: number; keyFinding: string };
    riskExposure: { score: number; keyFinding: string };
    obligationBalance: { score: number; keyFinding: string };
    terminationRights: { score: number; keyFinding: string };
    disputeResolution: { score: number; keyFinding: string };
  },
  customExplanation?: string
): LegalHealthScore {
  const fairnessScore = clampScore(dimensionsInput.fairness?.score, 60);
  const clarityScore = clampScore(dimensionsInput.clarity?.score, 70);
  const riskExposureScore = clampScore(dimensionsInput.riskExposure?.score, 55);
  const obligationBalanceScore = clampScore(dimensionsInput.obligationBalance?.score, 60);
  const terminationRightsScore = clampScore(dimensionsInput.terminationRights?.score, 65);
  const disputeResolutionScore = clampScore(dimensionsInput.disputeResolution?.score, 60);

  const overall = calculateCompositeHealthScore({
    fairness: fairnessScore,
    clarity: clarityScore,
    riskExposure: riskExposureScore,
    obligationBalance: obligationBalanceScore,
    terminationRights: terminationRightsScore,
    disputeResolution: disputeResolutionScore,
  });

  const status = getScoreStatus(overall);

  const defaultExplanation =
    overall < 50
      ? 'Significant contractual asymmetry detected. Several high-severity clauses impose disproportionate liability, restrictive covenants, or unilateral termination terms.'
      : overall < 70
      ? 'Moderate risk profile. The agreement contains several notable terms requiring clarification or targeted negotiation before execution.'
      : 'Generally balanced contractual provisions with delineated allocation of obligations.';

  return {
    overallScore: overall,
    status,
    shortExplanation: customExplanation || defaultExplanation,
    dimensions: {
      fairness: {
        name: 'Fairness',
        score: fairnessScore,
        weight: 20,
        status: getDimensionStatus(fairnessScore),
        description: 'Evaluates bilateral reciprocity, reasonable standards, and non-unilateral protections.',
        keyFinding: dimensionsInput.fairness?.keyFinding || 'Review bilateral reciprocity'
      },
      clarity: {
        name: 'Clarity',
        score: clarityScore,
        weight: 15,
        status: getDimensionStatus(clarityScore),
        description: 'Examines ambiguity, defined terms, readability, and explicit deadlines.',
        keyFinding: dimensionsInput.clarity?.keyFinding || 'Contract structure and definitions'
      },
      riskExposure: {
        name: 'Risk Exposure',
        score: riskExposureScore,
        weight: 25,
        status: getDimensionStatus(riskExposureScore),
        description: 'Assesses financial penalties, liability caps, indemnification shifts, and personal guarantees.',
        keyFinding: dimensionsInput.riskExposure?.keyFinding || 'Potential financial exposure'
      },
      obligationBalance: {
        name: 'Obligation Balance',
        score: obligationBalanceScore,
        weight: 15,
        status: getDimensionStatus(obligationBalanceScore),
        description: 'Reviews affirmative duties, maintenance burdens, and non-compete/IP restrictions.',
        keyFinding: dimensionsInput.obligationBalance?.keyFinding || 'Allocation of ongoing duties'
      },
      terminationRights: {
        name: 'Termination Rights',
        score: terminationRightsScore,
        weight: 15,
        status: getDimensionStatus(terminationRightsScore),
        description: 'Checks automatic renewal mechanics, notice windows, and exit symmetry.',
        keyFinding: dimensionsInput.terminationRights?.keyFinding || 'Notice windows and exit terms'
      },
      disputeResolution: {
        name: 'Dispute Resolution',
        score: disputeResolutionScore,
        weight: 10,
        status: getDimensionStatus(disputeResolutionScore),
        description: 'Assesses venue fairness, arbitration mandates, class-action waivers, and fee-shifting.',
        keyFinding: dimensionsInput.disputeResolution?.keyFinding || 'Dispute forum and governing jurisdiction'
      }
    },
    calculationMethodology:
      'The Legal Health Score is calculated as an objective screening index across 6 core risk dimensions: Risk Exposure (25%), Fairness (20%), Obligation Balance (15%), Termination Rights (15%), Clarity (15%), and Dispute Resolution (10%). High-severity silent risks apply algorithmic downward pressure.'
  };
}

/**
 * Deterministically computes health score by combining AI findings with local rule-based adjustments.
 */
export function computeDeterministicHealthScore(
  aiDimensions: any,
  risks: SilentRisk[],
  customExplanation?: string
): LegalHealthScore {
  const highRisks = risks.filter(r => r.severity === 'high');

  // Baseline proposed scores from AI or defaults
  let fairness = clampScore(aiDimensions?.fairness?.score, 60);
  let clarity = clampScore(aiDimensions?.clarity?.score, 70);
  let riskExposure = clampScore(aiDimensions?.riskExposure?.score, 60);
  let obligationBalance = clampScore(aiDimensions?.obligationBalance?.score, 60);
  let terminationRights = clampScore(aiDimensions?.terminationRights?.score, 65);
  let disputeResolution = clampScore(aiDimensions?.disputeResolution?.score, 65);

  // Apply deterministic downward adjustments for identified high risks
  for (const hr of highRisks) {
    const text = `${hr.title} ${hr.reason}`.toLowerCase();
    if (text.includes('indemnif') || text.includes('liability') || text.includes('cap') || text.includes('fee') || text.includes('deposit')) {
      riskExposure = Math.max(25, riskExposure - 8);
    }
    if (text.includes('unilateral') || text.includes('asymmetr') || text.includes('sole discretion')) {
      fairness = Math.max(25, fairness - 7);
    }
    if (text.includes('renew') || text.includes('terminat') || text.includes('notice')) {
      terminationRights = Math.max(25, terminationRights - 8);
    }
    if (text.includes('arbitrat') || text.includes('jury') || text.includes('venue') || text.includes('class action')) {
      disputeResolution = Math.max(30, disputeResolution - 6);
    }
    if (text.includes('maintenance') || text.includes('repair') || text.includes('duty') || text.includes('obligat')) {
      obligationBalance = Math.max(30, obligationBalance - 6);
    }
  }

  return buildLegalHealthScore({
    fairness: {
      score: fairness,
      keyFinding: aiDimensions?.fairness?.keyFinding || 'Evaluated for bilateral reciprocity'
    },
    clarity: {
      score: clarity,
      keyFinding: aiDimensions?.clarity?.keyFinding || 'Evaluated for language clarity and defined terms'
    },
    riskExposure: {
      score: riskExposure,
      keyFinding: aiDimensions?.riskExposure?.keyFinding || 'Evaluated for financial penalties and liabilities'
    },
    obligationBalance: {
      score: obligationBalance,
      keyFinding: aiDimensions?.obligationBalance?.keyFinding || 'Evaluated for apportionment of duties'
    },
    terminationRights: {
      score: terminationRights,
      keyFinding: aiDimensions?.terminationRights?.keyFinding || 'Evaluated for renewal and exit terms'
    },
    disputeResolution: {
      score: disputeResolution,
      keyFinding: aiDimensions?.disputeResolution?.keyFinding || 'Evaluated for dispute forum and waivers'
    }
  }, customExplanation);
}
