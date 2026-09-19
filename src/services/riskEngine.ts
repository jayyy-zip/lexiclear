import {
  DimensionScore,
  EvidenceStrength,
  LegalHealthScore,
  RiskSeverity,
  SilentRisk,
  Clause
} from '../types/document';

export function calculateCompositeHealthScore(dimensions: {
  fairness: number;
  clarity: number;
  riskExposure: number;
  obligationBalance: number;
  terminationRights: number;
  disputeResolution: number;
}): number {
  const weighted =
    dimensions.fairness * 0.20 +
    dimensions.clarity * 0.15 +
    dimensions.riskExposure * 0.25 +
    dimensions.obligationBalance * 0.15 +
    dimensions.terminationRights * 0.15 +
    dimensions.disputeResolution * 0.10;

  return Math.max(0, Math.min(100, Math.round(weighted)));
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
  const overall = calculateCompositeHealthScore({
    fairness: dimensionsInput.fairness.score,
    clarity: dimensionsInput.clarity.score,
    riskExposure: dimensionsInput.riskExposure.score,
    obligationBalance: dimensionsInput.obligationBalance.score,
    terminationRights: dimensionsInput.terminationRights.score,
    disputeResolution: dimensionsInput.disputeResolution.score,
  });

  const status = getScoreStatus(overall);

  const defaultExplanation =
    overall < 50
      ? 'Significant contractual asymmetry detected. Several high-severity clauses impose disproportionate liability, restrictive covenants, or unilateral termination terms.'
      : overall < 70
      ? 'Moderate risk profile. The agreement contains several notable terms requiring clarification or targeted negotiation before execution.'
      : 'Generally balanced contract structure with standard market commercial provisions and clear allocation of obligations.';

  return {
    overallScore: overall,
    status,
    shortExplanation: customExplanation || defaultExplanation,
    dimensions: {
      fairness: {
        name: 'Fairness',
        score: dimensionsInput.fairness.score,
        weight: 20,
        status: getDimensionStatus(dimensionsInput.fairness.score),
        description: 'Evaluates bilateral reciprocity, reasonable standards, and non-unilateral protections.',
        keyFinding: dimensionsInput.fairness.keyFinding
      },
      clarity: {
        name: 'Clarity',
        score: dimensionsInput.clarity.score,
        weight: 15,
        status: getDimensionStatus(dimensionsInput.clarity.score),
        description: 'Examines ambiguity, defined terms, readability, and explicit deadlines.',
        keyFinding: dimensionsInput.clarity.keyFinding
      },
      riskExposure: {
        name: 'Risk Exposure',
        score: dimensionsInput.riskExposure.score,
        weight: 25,
        status: getDimensionStatus(dimensionsInput.riskExposure.score),
        description: 'Assesses financial penalties, liability caps, indemnification shifts, and personal guarantees.',
        keyFinding: dimensionsInput.riskExposure.keyFinding
      },
      obligationBalance: {
        name: 'Obligation Balance',
        score: dimensionsInput.obligationBalance.score,
        weight: 15,
        status: getDimensionStatus(dimensionsInput.obligationBalance.score),
        description: 'Reviews affirmative duties, maintenance burdens, and non-compete/IP restrictions.',
        keyFinding: dimensionsInput.obligationBalance.keyFinding
      },
      terminationRights: {
        name: 'Termination Rights',
        score: dimensionsInput.terminationRights.score,
        weight: 15,
        status: getDimensionStatus(dimensionsInput.terminationRights.score),
        description: 'Checks automatic renewal mechanics, notice windows, and exit symmetry.',
        keyFinding: dimensionsInput.terminationRights.keyFinding
      },
      disputeResolution: {
        name: 'Dispute Resolution',
        score: dimensionsInput.disputeResolution.score,
        weight: 10,
        status: getDimensionStatus(dimensionsInput.disputeResolution.score),
        description: 'Assesses venue fairness, arbitration mandates, class-action waivers, and fee-shifting.',
        keyFinding: dimensionsInput.disputeResolution.keyFinding
      }
    },
    calculationMethodology:
      'The Legal Health Score is calculated as an objective screening index across 6 core risk dimensions: Risk Exposure (25%), Fairness (20%), Obligation Balance (15%), Termination Rights (15%), Clarity (15%), and Dispute Resolution (10%). High-severity silent risks apply algorithmic downward pressure.'
  };
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
