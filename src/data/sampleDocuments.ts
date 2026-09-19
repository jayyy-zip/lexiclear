import { AnalysisResult } from '../types/document';

export interface SampleDoc {
  id: string;
  name: string;
  category: string;
  description: string;
  fileType: 'pdf' | 'docx' | 'txt';
  sizeFormatted: string;
  rawText: string;
  precomputedAnalysis: AnalysisResult;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-rental',
    name: 'Residential Lease Agreement - Unit 4B',
    category: 'Real Estate / Housing',
    description: 'Standard 12-month apartment lease with automatic renewal and tenant maintenance provisions.',
    fileType: 'pdf',
    sizeFormatted: '184 KB',
    rawText: `RESIDENTIAL LEASE AGREEMENT

PARTIES & PREMISES
This Agreement is entered into on June 15, 2025, between Oakridge Properties LLC ("Landlord"), located at 450 Market Street, Suite 800, San Francisco, CA, and Alex Morgan ("Tenant"). Landlord leases to Tenant the premises known as Unit 4B, 1224 Pine Street, San Francisco, California 94109 ("Premises").

1. TERM & AUTOMATIC RENEWAL
The initial term shall commence on August 1, 2025, and terminate on July 31, 2026. Unless Tenant provides written notice of non-renewal via certified mail no less than ninety (90) days prior to the expiration date (by May 2, 2026), this Agreement shall automatically renew for a successive twelve (12) month term at a monthly rent increased by twelve percent (12%). Landlord may terminate this lease upon thirty (30) days notice if redevelopment or renovation is deemed necessary by Landlord.

2. RENT & LATE FEES
Tenant agrees to pay rent of $3,200.00 per month, payable in advance on or before the first (1st) calendar day of each month. If rent is not received by Landlord by the third (3rd) calendar day of the month, Tenant shall incur a late charge of $250.00, plus an additional daily penalty fee of $25.00 per day until rent is paid in full.

3. SECURITY DEPOSIT
Tenant shall deposit with Landlord the sum of $6,400.00 (two months' rent) as security for performance. Landlord shall hold the deposit in an unsegregated general operating account. Landlord shall have sixty (60) days following surrender of the premises to return remaining deposit funds, and may deduct standard turnover cleaning fees of $450.00 regardless of move-out cleanliness.

4. MAINTENANCE, REPAIRS & HABITABILITY
Tenant shall be solely responsible for all maintenance, repairs, and replacements within the unit, including HVAC filter replacement, plumbing clogs, appliance repairs, and window treatments, unless damage is directly caused by Landlord's proven gross negligence. Tenant shall not withhold rent for any failure of appliances or interruption of utility service lasting less than twenty-one (21) days.

5. ENTRY BY LANDLORD
Landlord and Landlord's designated agents, contractors, or prospective purchasers reserve the right to enter the Premises at any time during regular business hours (8:00 AM to 7:00 PM) upon twelve (12) hours verbal or electronic notice, or immediately without prior notice in case of suspected emergency or routine quarterly asset inspections.

6. SUBLETTING & GUESTS
No subletting, Airbnb hosting, assignment, or roommate addition is permitted without Landlord's prior written consent, which Landlord may withhold in its sole and unfettered discretion. Guests staying more than four (4) consecutive nights or seven (7) cumulative nights in any 30-day period shall be deemed unauthorized occupants, incurring a surcharge penalty of $100.00 per night.

7. INDEMNIFICATION & LIMITATION OF LIABILITY
Tenant agrees to indemnify, defend, and hold harmless Landlord and its managing agents from all claims, damages, liabilities, losses, and legal costs arising from any injury or property damage occurring inside the unit or common areas, regardless of whether caused in whole or in part by ordinary negligence of Landlord. Landlord's total aggregate liability under this agreement shall be strictly capped at $500.00.

8. GOVERNING LAW & DISPUTE RESOLUTION
This Agreement shall be governed by the laws of the State of California. Any controversy or dispute arising under this Agreement shall be resolved through binding mandatory arbitration administered in San Francisco County. Tenant expressly waives any right to a trial by jury or to participate in any class action or consolidated tenant action against Landlord. The prevailing party shall be awarded reasonable attorneys' fees and costs.`,
    precomputedAnalysis: {
      metadata: {
        id: 'sample-rental',
        fileName: 'Residential_Lease_Agreement_Unit4B.pdf',
        fileSize: 188416,
        fileType: 'pdf',
        uploadDate: 'June 15, 2025',
        wordCount: 618,
        pageCount: 3,
        rawText: ''
      },
      documentType: 'Residential Lease Agreement',
      parties: ['Oakridge Properties LLC (Landlord)', 'Alex Morgan (Tenant)'],
      jurisdiction: 'State of California (San Francisco County)',
      summary: 'A 12-month residential apartment lease containing several asymmetrical tenant obligations, an onerous 90-day automatic renewal clause with a 12% rent increase, landlord liability caps, and tenant-funded repair obligations.',
      importantDates: [
        'August 1, 2025 - Lease Start Date',
        'May 2, 2026 - Deadline to provide written non-renewal notice (90 days)',
        'July 31, 2026 - Initial Lease Expiration Date',
        '1st of each month - Rent payment due date'
      ],
      financialTerms: [
        '$3,200.00 per month rent',
        '$6,400.00 security deposit (held in general account)',
        '$250.00 late fee after 3rd of the month + $25.00/day daily penalty',
        '$450.00 mandatory move-out cleaning deduction',
        '12% automatic rent hike upon renewal'
      ],
      obligations: [
        'Tenant responsible for all appliance, plumbing, and HVAC maintenance',
        '90-day certified mail notice required to prevent automatic lease renewal',
        'Strict 4-night limit on guest stays before $100/night penalty applies',
        'Tenant indemnifies landlord even for landlord ordinary negligence'
      ],
      terminationTerms: [
        'Automatic 12-month extension if tenant misses 90-day notice cutoff',
        'Landlord can terminate on 30 days notice for renovations or redevelopment',
        'Asymmetrical termination favors Landlord'
      ],
      disputeResolution: 'Mandatory binding arbitration in San Francisco County; Tenant explicitly waives jury trial and class action rights.',
      healthScore: {
        overallScore: 62,
        status: 'Needs Attention',
        shortExplanation: 'Significant contractual asymmetry detected. The agreement imposes extensive repair burdens on the tenant, a steep 90-day renewal trap, and an aggressive landlord liability limitation.',
        dimensions: {
          fairness: {
            name: 'Fairness',
            score: 50,
            weight: 20,
            status: 'Warning',
            description: 'Balance of rights and protections between tenant and landlord.',
            keyFinding: 'One-sided landlord indemnification and unilateral 30-day renovation termination clause.'
          },
          clarity: {
            name: 'Clarity',
            score: 80,
            weight: 15,
            status: 'Strong',
            description: 'Unambiguous language, readable phrasing, and structured terms.',
            keyFinding: 'Clauses are drafted clearly, though legal terms of art require careful review.'
          },
          riskExposure: {
            name: 'Risk Exposure',
            score: 55,
            weight: 25,
            status: 'Warning',
            description: 'Financial exposure, unexpected penalties, and liability traps.',
            keyFinding: 'Steep $250 + $25/day late fee and $450 automatic cleaning deduction.'
          },
          obligationBalance: {
            name: 'Obligation Balance',
            score: 60,
            weight: 15,
            status: 'Warning',
            description: 'Equitable allocation of maintenance and performance duties.',
            keyFinding: 'Tenant is assigned ordinary appliance and plumbing repairs typically carried by landlord.'
          },
          terminationRights: {
            name: 'Termination Rights',
            score: 65,
            weight: 15,
            status: 'Warning',
            description: 'Exit flexibility, notice periods, and renewal mechanics.',
            keyFinding: 'Automatic 12-month renewal requires certified mail notice 90 days before lease end.'
          },
          disputeResolution: {
            name: 'Dispute Resolution',
            score: 75,
            weight: 10,
            status: 'Fair',
            description: 'Fairness and forum accessibility for legal conflicts.',
            keyFinding: 'Mandatory arbitration with jury waiver in local county.'
          }
        },
        calculationMethodology: 'Calculated using a weighted index of 6 structural risk dimensions. High-severity silent risks and liability shifts exert negative scoring pressure against standard statutory tenant protections.'
      },
      clauses: [
        {
          id: 'c-term',
          title: 'Clause 1: Term & Automatic Renewal',
          text: 'Unless Tenant provides written notice of non-renewal via certified mail no less than ninety (90) days prior to the expiration date (by May 2, 2026), this Agreement shall automatically renew for a successive twelve (12) month term at a monthly rent increased by twelve percent (12%). Landlord may terminate this lease upon thirty (30) days notice if redevelopment or renovation is deemed necessary by Landlord.',
          page: 1,
          type: 'renewal',
          obligations: ['Provide written notice by certified mail by May 2, 2026'],
          rights: ['Tenant can vacate at end of term if 90 days notice given'],
          dates: ['August 1, 2025', 'May 2, 2026', 'July 31, 2026'],
          financialExposure: 'Automatic 12% rent increase ($384/mo) if renewal window missed',
          riskIndicators: ['90-day renewal notice trap', 'Landlord unilateral 30-day early termination'],
          plainEnglish: 'If you do not send a formal certified letter 90 days before your lease ends (by May 2, 2026), you are locked into another full year with a 12% rent hike ($3,584/month). Meanwhile, the landlord can cancel your lease with only 30 days notice for renovations.',
          whyItMatters: '90 days is double the standard California 30-to-60-day notice window. Missing this specific cutoff locks you into another year at higher rent without recourse.'
        },
        {
          id: 'c-rent',
          title: 'Clause 2: Rent & Late Fees',
          text: 'If rent is not received by Landlord by the third (3rd) calendar day of the month, Tenant shall incur a late charge of $250.00, plus an additional daily penalty fee of $25.00 per day until rent is paid in full.',
          page: 1,
          type: 'payment',
          obligations: ['Pay $3,200 on or before 1st of month'],
          rights: ['3-day grace period before late penalty'],
          dates: ['1st of month', '3rd of month'],
          financialExposure: '$250 base late fee + $25/day compounding penalty',
          riskIndicators: ['Compounding daily late fee', 'Short 2-day grace window'],
          plainEnglish: 'If your rent is late past the 3rd of the month, you are charged an immediate $250 penalty, plus $25 every single day it remains unpaid.',
          whyItMatters: 'In California, late fees must reflect reasonable administrative costs incurred by the landlord. A $250 flat fee plus daily compounding penalties may be legally challenged as an unenforceable penalty clause.'
        },
        {
          id: 'c-deposit',
          title: 'Clause 3: Security Deposit',
          text: 'Tenant shall deposit with Landlord the sum of $6,400.00 (two months\' rent) as security for performance. Landlord shall hold the deposit in an unsegregated general operating account. Landlord shall have sixty (60) days following surrender of the premises to return remaining deposit funds, and may deduct standard turnover cleaning fees of $450.00 regardless of move-out cleanliness.',
          page: 1,
          type: 'deposit',
          obligations: ['Deposit $6,400 with landlord'],
          rights: ['Return of remaining funds within 60 days following surrender'],
          dates: ['60 days after move-out'],
          financialExposure: '$6,400 held in general account + $450 mandatory cleaning deduction',
          riskIndicators: ['Mandatory $450 cleaning fee regardless of cleanliness', '60-day return window exceeds CA 21-day statutory rule', 'Deposit held in unsegregated operating account'],
          plainEnglish: 'You must pay a $6,400 security deposit. The landlord can hold it in their regular business account, takes up to 60 days to return any remaining balance, and automatically keeps $450 for cleaning even if the apartment is returned spotless.',
          whyItMatters: 'California Civil Code 1950.5 mandates that security deposits must be returned within 21 calendar days with an itemized statement, and prohibits automatic non-refundable cleaning deductions if the tenant returns the unit clean.'
        },
        {
          id: 'c-repairs',
          title: 'Clause 4: Maintenance, Repairs & Habitability',
          text: 'Tenant shall be solely responsible for all maintenance, repairs, and replacements within the unit, including HVAC filter replacement, plumbing clogs, appliance repairs, and window treatments, unless damage is directly caused by Landlord\'s proven gross negligence. Tenant shall not withhold rent for any failure of appliances or interruption of utility service lasting less than twenty-one (21) days.',
          page: 2,
          type: 'maintenance',
          obligations: ['Pay for all unit repairs including plumbing and appliances', 'May not withhold rent for utility interruptions under 21 days'],
          rights: ['Exempt only if landlord gross negligence is proven'],
          dates: ['21 days utility tolerance'],
          financialExposure: 'Unlimited repair bills for appliances, pipes, and fixtures',
          riskIndicators: ['Shifts landlord statutory habitability duties onto tenant', '21-day utility outage rent-withholding waiver'],
          plainEnglish: 'You must pay out-of-pocket for appliance repairs and plumbing clogs inside your apartment. Furthermore, you cannot withhold rent even if utilities or appliances are broken for up to 21 consecutive days.',
          whyItMatters: 'Under California Civil Code 1941.1, landlords have non-waivable duties to maintain plumbing, heating, and appliances in good working order. Forcing tenants to pay for general maintenance contradicts implied habitability protections.'
        },
        {
          id: 'c-entry',
          title: 'Clause 5: Entry by Landlord',
          text: 'Landlord and Landlord\'s designated agents, contractors, or prospective purchasers reserve the right to enter the Premises at any time during regular business hours (8:00 AM to 7:00 PM) upon twelve (12) hours verbal or electronic notice, or immediately without prior notice in case of suspected emergency or routine quarterly asset inspections.',
          page: 2,
          type: 'entry',
          obligations: ['Permit landlord entry upon 12 hours notice or immediate inspection'],
          rights: ['Entry restricted to business hours 8:00 AM - 7:00 PM'],
          dates: ['12 hours notice'],
          financialExposure: 'None direct',
          riskIndicators: ['12-hour notice instead of statutory 24-hour', 'Immediate unannounced entry permitted for routine quarterly inspections'],
          plainEnglish: 'The landlord can enter your apartment with only 12 hours verbal or electronic notice, and can enter immediately without notice for routine quarterly inspections.',
          whyItMatters: 'California Civil Code 1954 requires 24 hours written notice for normal inspection entries. Routine quarterly asset checks do not legally justify immediate unannounced entry.'
        },
        {
          id: 'c-sublet',
          title: 'Clause 6: Subletting & Guests',
          text: 'No subletting, Airbnb hosting, assignment, or roommate addition is permitted without Landlord\'s prior written consent, which Landlord may withhold in its sole and unfettered discretion. Guests staying more than four (4) consecutive nights or seven (7) cumulative nights in any 30-day period shall be deemed unauthorized occupants, incurring a surcharge penalty of $100.00 per night.',
          page: 2,
          type: 'guests',
          obligations: ['Obtain prior written consent for subletting or roommates', 'Limit guest stays to under 4 consecutive or 7 cumulative nights per month'],
          rights: ['Permitted guests under 4 consecutive nights'],
          dates: ['4 consecutive nights limit', '7 cumulative nights per 30-day period'],
          financialExposure: '$100.00 per night surcharge penalty for unauthorized guest stay',
          riskIndicators: ['Landlord sole discretion over roommates', '$100/night penalty for guest stays over 4 nights'],
          plainEnglish: 'You cannot sublet or add roommates without landlord permission. If a guest stays more than 4 nights in a row or 7 nights in a month, you are charged $100 per night.',
          whyItMatters: 'Restricts normal guest hospitality and penalizes visiting family or partners with arbitrary surcharges.'
        },
        {
          id: 'c-liability',
          title: 'Clause 7: Indemnification & Limitation of Liability',
          text: 'Tenant agrees to indemnify, defend, and hold harmless Landlord and its managing agents from all claims, damages, liabilities, losses, and legal costs arising from any injury or property damage occurring inside the unit or common areas, regardless of whether caused in whole or in part by ordinary negligence of Landlord. Landlord\'s total aggregate liability under this agreement shall be strictly capped at $500.00.',
          page: 2,
          type: 'liability',
          obligations: ['Defend and pay legal costs for landlord even if landlord was negligent'],
          rights: ['None specified'],
          dates: [],
          financialExposure: 'Full legal defense costs + $500 maximum recovery from landlord',
          riskIndicators: ['Tenant pays for Landlord ordinary negligence', 'Asymmetrical $500 damage cap'],
          plainEnglish: 'You agree to pay the landlord\'s legal bills and damages even if the landlord was negligent. In contrast, if the landlord ruins your property or breaches the lease, the most you can ever recover from them is $500.',
          whyItMatters: 'Broad exculpatory clauses attempting to shield landlords from their own negligence are heavily disfavored and frequently void under state public policy.'
        },
        {
          id: 'c-dispute',
          title: 'Clause 8: Governing Law & Dispute Resolution',
          text: 'Any controversy or dispute arising under this Agreement shall be resolved through binding mandatory arbitration administered in San Francisco County. Tenant expressly waives any right to a trial by jury or to participate in any class action or consolidated tenant action against Landlord. The prevailing party shall be awarded reasonable attorneys\' fees and costs.',
          page: 3,
          type: 'dispute',
          obligations: ['Submit all disputes to private arbitration', 'Waive jury trial and class action'],
          rights: ['Prevailing party fee recovery'],
          dates: [],
          financialExposure: 'Private arbitration filing and arbitrator fees',
          riskIndicators: ['Mandatory binding arbitration', 'Jury trial waiver in residential lease'],
          plainEnglish: 'You forfeit your right to go to regular court, have a jury trial, or join other tenants in a lawsuit. All complaints must be handled in private arbitration.',
          whyItMatters: 'Mandatory pre-dispute arbitration agreements in California residential leases are subject to strict scrutiny under California Civil Code Section 1953.'
        }
      ],
      risks: [
        {
          id: 'risk-1',
          clauseId: 'c-term',
          severity: 'high',
          title: 'Strict 90-Day Automatic Renewal Lock-In',
          reason: 'Requires written notice by certified mail at least 90 days before expiration (May 2, 2026). Missing this window triggers a full 1-year renewal with an automatic 12% rent increase.',
          evidence: 'Unless Tenant provides written notice of non-renewal via certified mail no less than ninety (90) days prior to the expiration date (by May 2, 2026), this Agreement shall automatically renew for a successive twelve (12) month term at a monthly rent increased by twelve percent (12%).',
          evidenceStrength: 'Strong evidence',
          userImpact: 'If you decide to move in summer 2026 but miss the May 2 deadline, you could be on the hook for $43,008 in additional rent.',
          questionToConsider: 'Can the landlord agree to a standard 30-day or 60-day notice period, and transition to month-to-month after the initial year?',
          plainEnglishTranslation: 'You are automatically locked into another full year at 12% higher rent unless you send a certified letter 90 days early.',
          clauseTitle: 'Clause 1: Term & Automatic Renewal',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-2',
          clauseId: 'c-repairs',
          severity: 'high',
          title: 'Shift of Core Appliance & Plumbing Repair Burden',
          reason: 'Transfers responsibility for fixing unit appliances, plumbing clogs, and HVAC filters entirely to the tenant unless landlord gross negligence is proven in court.',
          evidence: 'Tenant shall be solely responsible for all maintenance, repairs, and replacements within the unit, including HVAC filter replacement, plumbing clogs, appliance repairs, and window treatments, unless damage is directly caused by Landlord\'s proven gross negligence.',
          evidenceStrength: 'Strong evidence',
          userImpact: 'You could be billed thousands of dollars for broken water heaters, refrigerator repairs, or aging plumbing.',
          questionToConsider: 'Will the landlord remove tenant liability for major structural, plumbing, and existing appliance breakdowns?',
          plainEnglishTranslation: 'You are made to pay for appliance and pipe repairs that are normally the landlord\'s legal responsibility.',
          clauseTitle: 'Clause 4: Maintenance, Repairs & Habitability',
          pageReference: 'Page 2'
        },
        {
          id: 'risk-3',
          clauseId: 'c-liability',
          severity: 'high',
          title: 'One-Sided Indemnification for Landlord Negligence',
          reason: 'Forces tenant to indemnify and pay landlord legal fees even if the landlord was negligent, while capping landlord liability to only $500.',
          evidence: 'Tenant agrees to indemnify, defend, and hold harmless Landlord and its managing agents from all claims, damages, liabilities, losses, and legal costs arising from any injury or property damage occurring inside the unit or common areas, regardless of whether caused in whole or in part by ordinary negligence of Landlord. Landlord\'s total aggregate liability under this agreement shall be strictly capped at $500.00.',
          evidenceStrength: 'Strong evidence',
          userImpact: 'If you slip on a landlord-maintained wet stairwell or suffer water damage from a burst main pipe, your recovery is capped at $500 and you might have to pay their lawyers.',
          questionToConsider: 'Can this clause be amended to mutual indemnification excluding negligence, and remove the $500 liability cap?',
          plainEnglishTranslation: 'You protect the landlord from their own mistakes, but they only owe you at most $500 if they damage your belongings.',
          clauseTitle: 'Clause 7: Indemnification & Limitation of Liability',
          pageReference: 'Page 2'
        },
        {
          id: 'risk-4',
          clauseId: 'c-rent',
          severity: 'medium',
          title: 'Compounding Daily Late Fees ($25/day)',
          reason: 'A $250 flat charge triggered on the 4th of the month plus $25 per day represents an unusually steep cumulative penalty.',
          evidence: 'Tenant shall incur a late charge of $250.00, plus an additional daily penalty fee of $25.00 per day until rent is paid in full.',
          evidenceStrength: 'Strong evidence',
          userImpact: 'A payment delayed by 10 days due to bank processing could result in $475 in extra fees on a single month\'s rent.',
          questionToConsider: 'Can the late fee be capped at a reasonable flat rate (e.g., 5% of monthly rent with a 5-day grace period)?',
          plainEnglishTranslation: 'Rent paid after the 3rd triggers a steep $250 fee plus an extra $25 per day.',
          clauseTitle: 'Clause 2: Rent & Late Fees',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-5',
          clauseId: 'c-term',
          severity: 'medium',
          title: 'Asymmetrical 30-Day Early Termination by Landlord',
          reason: 'Landlord retains right to terminate lease on 30 days notice for renovation, but tenant receives no reciprocal early termination right.',
          evidence: 'Landlord may terminate this lease upon thirty (30) days notice if redevelopment or renovation is deemed necessary by Landlord.',
          evidenceStrength: 'Moderate evidence',
          userImpact: 'You could be forced to relocate in the middle of your lease with only 30 days notice.',
          questionToConsider: 'Can the landlord strike this provision or provide relocation compensation and at least 90 days notice?',
          plainEnglishTranslation: 'The landlord can kick you out with 30 days notice if they decide to renovate, but you have no right to leave early.',
          clauseTitle: 'Clause 1: Term & Automatic Renewal',
          pageReference: 'Page 1'
        }
      ],
      actionChecklist: [
        {
          id: 'act-1',
          title: 'Negotiate 90-day renewal notice down to standard 30-60 days',
          reason: 'Reduces risk of accidental automatic renewal and 12% rent hike.',
          clauseReference: 'Clause 1 (Term & Renewal)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-2',
          title: 'Request strike of tenant appliance and plumbing repair obligations',
          reason: 'Landlords have a statutory duty to maintain plumbing and major appliances under CA Civil Code 1941.1.',
          clauseReference: 'Clause 4 (Maintenance)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-3',
          title: 'Amend indemnification to exclude landlord negligence',
          reason: 'Prevent signing away rights or assuming tenant liability for landlord property faults.',
          clauseReference: 'Clause 7 (Liability)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-4',
          title: 'Add calendar reminder for May 2, 2026 renewal notice deadline',
          reason: 'Crucial safeguard if the 90-day renewal clause remains unchanged.',
          clauseReference: 'Clause 1 (Term & Renewal)',
          priority: 'medium',
          completed: false,
          category: 'deadline'
        },
        {
          id: 'act-5',
          title: 'Request cap on late fees to 5% with a 5-day grace period',
          reason: 'Eliminate daily $25 compounding penalty.',
          clauseReference: 'Clause 2 (Late Fees)',
          priority: 'medium',
          completed: false,
          category: 'clarify'
        }
      ],
      timeline: [
        {
          id: 'time-1',
          date: 'Aug 1, 2025',
          title: 'Lease Commencement & Move-In',
          description: 'Initial lease term starts. Security deposit and first month rent must be fully tendered.',
          clauseReference: 'Clause 1',
          priority: 'medium',
          isoDate: '2025-08-01'
        },
        {
          id: 'time-2',
          date: 'Monthly (1st-3rd)',
          title: 'Rent Due & Grace Window',
          description: '$3,200 due on 1st. Late penalties ($250 + $25/day) trigger on 4th.',
          clauseReference: 'Clause 2',
          priority: 'medium',
          isoDate: '2025-09-01'
        },
        {
          id: 'time-3',
          date: 'May 2, 2026',
          title: '90-Day Non-Renewal Notice Deadline',
          description: 'CRITICAL: Must deliver written notice via certified mail to prevent automatic 12-month extension with 12% rent hike.',
          clauseReference: 'Clause 1',
          priority: 'high',
          isoDate: '2026-05-02'
        },
        {
          id: 'time-4',
          date: 'Jul 31, 2026',
          title: 'Lease Expiration Date',
          description: 'Official end of initial 12-month lease term. Surrender premises or start renewal term.',
          clauseReference: 'Clause 1',
          priority: 'high',
          isoDate: '2026-07-31'
        },
        {
          id: 'time-5',
          date: 'Sep 29, 2026',
          title: 'Deposit Accounting Return Deadline',
          description: '60 days following surrender for landlord to furnish itemized deposit accounting.',
          clauseReference: 'Clause 3',
          priority: 'low',
          isoDate: '2026-09-29'
        }
      ],
      lawyerPrepKit: {
        documentSummary: 'Residential lease for Unit 4B at 1224 Pine St, San Francisco, CA. Initial term Aug 1, 2025 to Jul 31, 2026 with $3,200 monthly rent. Contains several atypical and non-standard landlord-protective clauses that should be reviewed for statutory enforceability under California landlord-tenant law.',
        topConcerns: [
          'Automatic 12-month renewal triggered unless certified mail is sent 90 days in advance (by May 2, 2026), alongside an automatic 12% rent increase.',
          'Shifting of habitability maintenance, plumbing clogs, and appliance repair costs onto the tenant.',
          'Broad tenant indemnification for landlord\'s own ordinary negligence and an asymmetrical $500 landlord liability cap.',
          'Potentially unlawful compounding late fees ($250 + $25/day).'
        ],
        importantFinancialExposure: [
          'Automatic 12% rent increase adds $4,608/year upon renewal.',
          'Tenant is liable for out-of-pocket appliance and plumbing repairs.',
          'Compounding late fees could reach $500+ within two weeks of a payment delay.',
          '$450 non-negotiable cleaning deduction from security deposit.'
        ],
        importantClauses: [
          {
            title: 'Clause 1: Term & Automatic Renewal',
            reference: 'Page 1, Paragraph 2',
            summary: '90-day advance notice requirement with certified mail mandate and 12% increase.',
            flagReason: 'Far exceeds standard 30-day notice and locks tenant in.'
          },
          {
            title: 'Clause 4: Maintenance & Repairs',
            reference: 'Page 2, Paragraph 1',
            summary: 'Tenant bears appliance and plumbing repair costs; 21-day utility outage rent-withholding waiver.',
            flagReason: 'Potential conflict with CA Civil Code 1941 (implied warranty of habitability).'
          },
          {
            title: 'Clause 7: Indemnification & Liability Cap',
            reference: 'Page 2, Paragraph 4',
            summary: 'Tenant indemnifies landlord even for landlord negligence; $500 landlord liability ceiling.',
            flagReason: 'Often held void as against public policy in residential tenancies.'
          }
        ],
        questionsForLawyer: [
          'Is the 90-day automatic renewal clause enforceable under San Francisco Rent Ordinance or California Civil Code?',
          'Can the landlord legally shift plumbing and appliance repair obligations onto me in a residential lease?',
          'Is the $500 liability cap and waiver of tenant rights in Clause 7 legally valid?',
          'How should I structure my counter-proposal to remove these clauses without jeopardizing my lease offer?'
        ],
        supportingDocumentsToBring: [
          'Copy of the unsigned Residential Lease Agreement (this document)',
          'Any email communications or rental listing showing advertised terms',
          'Move-in inspection checklist or property photos (if already inspected)',
          'Local San Francisco Rent Board information sheet'
        ],
        disclaimer: 'LexiClear provides informational document analysis, not legal advice. Consult a licensed attorney in your jurisdiction for binding legal counsel.'
      }
    }
  },
  {
    id: 'sample-employment',
    name: 'Executive Employment Agreement - VP of Engineering',
    category: 'Employment & Labor',
    description: 'Senior tech leadership employment agreement featuring strict non-compete, perpetual IP assignment, and broad clawback terms.',
    fileType: 'docx',
    sizeFormatted: '142 KB',
    rawText: `EMPLOYMENT AND PROPRIETARY RIGHTS AGREEMENT

This Employment Agreement ("Agreement") is made effective as of October 1, 2025, between NovaStream Inc., a Delaware corporation ("Company"), and Jordan Taylor ("Executive").

1. POSITION AND DUTIES
Executive shall serve as Vice President of Engineering, reporting to the Chief Executive Officer. Executive shall devote full business time, energy, and attention exclusively to the business of the Company. Executive shall not engage in any other business activities, advisory roles, or consulting, whether or not for compensation, without prior written approval of the Board.

2. COMPENSATION & AT-WILL STATUS
Company shall pay Executive a base salary of $280,000 per annum. Executive is employed on an "at-will" basis, meaning either party may terminate employment at any time, with or without cause or advance notice.

3. INCENTIVE EQUITY & FORFEITURE
Executive shall be eligible for stock option grants subject to standard 4-year vesting with a 1-year cliff. However, in the event of termination for "Cause" (which shall include any failure to meet performance targets as determined in the Board's sole discretion), all vested and unvested equity shall be immediately forfeited and canceled without compensation.

4. INTELLECTUAL PROPERTY ASSIGNMENT
Executive agrees that all inventions, discoveries, designs, software, ideas, and intellectual property conceived, developed, or reduced to practice by Executive—either alone or with others, during the term of employment and for a period of twelve (12) months thereafter, whether or not during working hours or using Company equipment—shall be the sole and exclusive property of the Company ("Company Inventions"). Executive hereby irrevocably assigns all right, title, and interest in and to all such Inventions to Company.

5. NON-COMPETITION & NON-SOLICITATION
During the term of employment and for a period of eighteen (18) months following termination of employment for any reason, Executive shall not directly or indirectly, anywhere within North America or Europe, engage in, advise, invest in, or perform services for any business entity that competes with any current or planned product or service of the Company. Executive further agrees not to solicit or hire any employee or contractor of the Company for twenty-four (24) months post-termination.

6. SEVERANCE & GENERAL RELEASE
Upon termination by Company without Cause, Executive shall be eligible to receive three (3) months base salary continuation, contingent upon Executive executing a comprehensive, non-mutual general release of all claims in favor of Company, and re-affirming perpetual non-disparagement obligations.

7. GOVERNING LAW & VENUE
This Agreement shall be governed by and construed under the laws of the State of Delaware, without regard to conflict of law principles. Any legal action or proceeding shall be brought exclusively in the state or federal courts situated in Wilmington, Delaware, and Executive irrevocably submits to personal jurisdiction therein.`,
    precomputedAnalysis: {
      metadata: {
        id: 'sample-employment',
        fileName: 'Executive_Employment_Agreement_VP_Engineering.docx',
        fileSize: 145408,
        fileType: 'docx',
        uploadDate: 'October 1, 2025',
        wordCount: 485,
        pageCount: 2,
        rawText: ''
      },
      documentType: 'Executive Employment Agreement',
      parties: ['NovaStream Inc. (Delaware Corporation)', 'Jordan Taylor (Executive)'],
      jurisdiction: 'State of Delaware (Wilmington venue)',
      summary: 'Executive employment agreement with $280,000 base salary, characterized by a sweeping 18-month non-compete covering North America and Europe, 12-month post-employment IP assignment, and discretionary equity forfeiture under an expanded "Cause" definition.',
      importantDates: [
        'October 1, 2025 - Employment Start Date',
        '1-Year Cliff from Start Date for Initial Option Vesting',
        '12 Months Post-Termination - Inventions Assignment Window',
        '18 Months Post-Termination - Non-Compete Period',
        '24 Months Post-Termination - Non-Solicitation Window'
      ],
      financialTerms: [
        '$280,000 annual base salary',
        '4-year equity vesting with 1-year cliff',
        '3 months severance salary continuation (conditional on general release)',
        'Forfeiture of all vested equity if terminated under broad "Cause" definition'
      ],
      obligations: [
        'Exclusive full-time commitment; no external advisory or angel investing without Board consent',
        'Assignment of all inventions made during employment and for 12 months after termination',
        '18-month non-competition restriction across North America and Europe',
        'Perpetual non-disparagement obligations'
      ],
      terminationTerms: [
        'At-will termination by either party without advance notice',
        'Company can define failure to meet subjective performance targets as "Cause" to trigger equity forfeiture',
        'Severance requires non-mutual release of claims'
      ],
      disputeResolution: 'Exclusive jurisdiction in state or federal courts in Wilmington, Delaware; Delaware governing law.',
      healthScore: {
        overallScore: 48,
        status: 'Needs Attention',
        shortExplanation: 'The agreement contains high-severity post-termination restrictions: an overbroad 18-month multi-continent non-compete, a 12-month tail on personal IP assignment, and equity forfeiture for subjective performance issues.',
        dimensions: {
          fairness: {
            name: 'Fairness',
            score: 38,
            weight: 20,
            status: 'Critical',
            description: 'Reciprocity of releases, severance protections, and balanced cause definitions.',
            keyFinding: 'Non-mutual general release requirement and unilateral definition of Cause.'
          },
          clarity: {
            name: 'Clarity',
            score: 75,
            weight: 15,
            status: 'Fair',
            description: 'Clear drafting and specific timeframes.',
            keyFinding: 'Explicit timelines provided, though geographic scope is overly broad.'
          },
          riskExposure: {
            name: 'Risk Exposure',
            score: 40,
            weight: 25,
            status: 'Critical',
            description: 'Post-employment career restrictions and forfeiture of earned equity.',
            keyFinding: 'Vested equity can be canceled if terminated for subjective underperformance.'
          },
          obligationBalance: {
            name: 'Obligation Balance',
            score: 45,
            weight: 15,
            status: 'Warning',
            description: 'Balance of duties and IP assignments.',
            keyFinding: 'Assigns personal inventions made 12 months after leaving the company.'
          },
          terminationRights: {
            name: 'Termination Rights',
            score: 50,
            weight: 15,
            status: 'Warning',
            description: 'Severance guarantees and notice provisions.',
            keyFinding: 'Only 3 months severance for VP level; conditioned on broad waiver.'
          },
          disputeResolution: {
            name: 'Dispute Resolution',
            score: 55,
            weight: 10,
            status: 'Fair',
            description: 'Venue and governing law fairness for the employee.',
            keyFinding: 'Requires remote litigation in Delaware courts regardless of where employee resides.'
          }
        },
        calculationMethodology: 'Weighted evaluation across post-termination freedom of work, IP ownership rights, equity security, and severance proportionality.'
      },
      clauses: [
        {
          id: 'c-ip',
          title: 'Clause 4: Intellectual Property Assignment',
          text: 'Executive agrees that all inventions, discoveries, designs, software, ideas, and intellectual property conceived, developed, or reduced to practice by Executive—either alone or with others, during the term of employment and for a period of twelve (12) months thereafter, whether or not during working hours or using Company equipment—shall be the sole and exclusive property of the Company.',
          page: 1,
          type: 'intellectual_property',
          obligations: ['Assign all inventions during employment and for 12 months after'],
          rights: ['None specified'],
          dates: ['12 months post-employment'],
          financialExposure: 'Loss of ownership in independent projects or future company startups',
          riskIndicators: ['12-month post-termination "trailer" clause', 'Includes off-hours inventions without company equipment'],
          plainEnglish: 'The company claims ownership of everything you invent, program, or design—even on your own time, on your own laptop, and for a full year after you quit or are fired.',
          whyItMatters: 'Post-employment invention assignment "trailer clauses" can severely impair your ability to start a new venture or work at a new tech employer. Under California Labor Code 2870 and similar statutes, off-hours inventions that do not relate to company business cannot be seized.'
        },
        {
          id: 'c-noncompete',
          title: 'Clause 5: Non-Competition & Non-Solicitation',
          text: 'During the term of employment and for a period of eighteen (18) months following termination of employment for any reason, Executive shall not directly or indirectly, anywhere within North America or Europe, engage in, advise, invest in, or perform services for any business entity that competes with any current or planned product or service of the Company.',
          page: 2,
          type: 'restrictive_covenant',
          obligations: ['Refrain from working for any competitor in North America or Europe for 18 months'],
          rights: ['None specified'],
          dates: ['18 months post-termination'],
          financialExposure: 'Inability to work in your domain expertise for 1.5 years',
          riskIndicators: ['Broad 18-month duration', 'Expansive geographic scope (North America & Europe)', 'Covers unlaunched "planned" products'],
          plainEnglish: 'You cannot work for, consult with, or invest in any competitor anywhere in North America or Europe for 18 months after leaving NovaStream, covering even products the company merely "planned."',
          whyItMatters: 'Depending on your location, this non-compete may be unenforceable (e.g. in California, FTC rulemaking, or under reasonable scope requirements in Delaware). It represents a severe impediment to ongoing livelihood.'
        },
        {
          id: 'c-equity',
          title: 'Clause 3: Incentive Equity & Forfeiture',
          text: 'In the event of termination for "Cause" (which shall include any failure to meet performance targets as determined in the Board\'s sole discretion), all vested and unvested equity shall be immediately forfeited and canceled without compensation.',
          page: 1,
          type: 'compensation',
          obligations: ['Meet subjective board targets to retain earned stock'],
          rights: ['Stock options subject to 4-year vesting'],
          dates: ['1-year cliff', '4-year vesting'],
          financialExposure: 'Total forfeiture of valuable vested stock options',
          riskIndicators: ['Subjective definition of "Cause"', 'Clawback/cancellation of already vested options'],
          plainEnglish: 'If the Board decides you failed to meet performance expectations, they can classify your termination as "for Cause" and confiscate all of your stock options—even the ones you already earned and vested.',
          whyItMatters: '"Cause" in executive contracts is traditionally reserved for gross misconduct, criminal fraud, or willful material breaches. Allowing standard underperformance to wipe out vested equity strips away critical earned compensation.'
        }
      ],
      risks: [
        {
          id: 'risk-emp-1',
          clauseId: 'c-ip',
          severity: 'high',
          title: '12-Month Post-Employment Invention Assignment ("Trailer Clause")',
          reason: 'Assigns all IP, code, and inventions conceived up to 12 months after leaving the company, regardless of whether made on personal time or without company equipment.',
          evidence: '...conceived, developed, or reduced to practice by Executive... during the term of employment and for a period of twelve (12) months thereafter, whether or not during working hours or using Company equipment...',
          evidenceStrength: 'Strong evidence',
          userImpact: 'Any code you write or startup you found within 12 months of departing could be sued and claimed by NovaStream.',
          questionToConsider: 'Will the company eliminate the 12-month post-employment tail and explicitly carve out personal inventions made on employee time without company resources?',
          plainEnglishTranslation: 'The company claims to own anything you create for a full year after you leave.',
          clauseTitle: 'Clause 4: Intellectual Property Assignment',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-emp-2',
          clauseId: 'c-equity',
          severity: 'high',
          title: 'Vested Equity Forfeiture for Subjective Underperformance',
          reason: 'Defines "Cause" to include failure to hit board targets in their sole discretion, triggering cancellation of already vested stock options.',
          evidence: '...termination for "Cause" (which shall include any failure to meet performance targets as determined in the Board\'s sole discretion), all vested and unvested equity shall be immediately forfeited...',
          evidenceStrength: 'Strong evidence',
          userImpact: 'You could work for years, build significant company value, and lose 100% of your equity if you have a strategic disagreement with the Board.',
          questionToConsider: 'Can "Cause" be narrowed strictly to felony convictions, fraud, gross negligence, or uncured material breach, with vested equity remaining untouched?',
          plainEnglishTranslation: 'The company can cancel your earned stock options if the board feels you missed performance targets.',
          clauseTitle: 'Clause 3: Incentive Equity & Forfeiture',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-emp-3',
          clauseId: 'c-noncompete',
          severity: 'high',
          title: '18-Month Multi-Continent Non-Compete',
          reason: 'Prohibits working or consulting for any competitor across North America and Europe for 18 months, covering planned as well as existing products.',
          evidence: '...for a period of eighteen (18) months following termination... anywhere within North America or Europe, engage in, advise, invest in, or perform services for any business entity that competes...',
          evidenceStrength: 'Strong evidence',
          userImpact: 'Could block you from taking executive or engineering roles in your field for a year and a half without compensation.',
          questionToConsider: 'Is the company willing to strike the non-compete or limit it strictly to direct trade-secret protection, or provide garden leave salary continuation?',
          plainEnglishTranslation: 'You cannot work for any competitor anywhere in North America or Europe for 18 months.',
          clauseTitle: 'Clause 5: Non-Competition & Non-Solicitation',
          pageReference: 'Page 2'
        }
      ],
      actionChecklist: [
        {
          id: 'act-emp-1',
          title: 'Negotiate standard definition of "Cause" for equity protection',
          reason: 'Prevent forfeiture of earned equity due to subjective performance metrics.',
          clauseReference: 'Clause 3 (Equity)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-emp-2',
          title: 'Remove the 12-month post-employment IP trailer clause',
          reason: 'Ensure you retain ownership of your personal ideas and future ventures after leaving.',
          clauseReference: 'Clause 4 (IP Assignment)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-emp-3',
          title: 'Limit or strike the 18-month non-compete covenant',
          reason: 'Preserve your career mobility and avoid broad multi-continent restrictions.',
          clauseReference: 'Clause 5 (Non-Compete)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-emp-4',
          title: 'Increase severance from 3 months to 6-12 months for VP title',
          reason: 'Three months is below standard executive market benchmarks given the restrictive covenants.',
          clauseReference: 'Clause 6 (Severance)',
          priority: 'medium',
          completed: false,
          category: 'clarify'
        }
      ],
      timeline: [
        {
          id: 'time-emp-1',
          date: 'Oct 1, 2025',
          title: 'Employment Effective Date',
          description: 'Official start date as VP of Engineering. Base salary $280,000 begins.',
          clauseReference: 'Preamble & Clause 1',
          priority: 'medium',
          isoDate: '2025-10-01'
        },
        {
          id: 'time-emp-2',
          date: 'Oct 1, 2026',
          title: '1-Year Equity Vesting Cliff',
          description: 'First 25% of initial stock option grant vests if employed continuously.',
          clauseReference: 'Clause 3',
          priority: 'high',
          isoDate: '2026-10-01'
        },
        {
          id: 'time-emp-3',
          date: 'Post-Termination +12 Mo',
          title: 'IP Assignment Trailer Expiration',
          description: 'End of company claim on personal inventions developed after departure.',
          clauseReference: 'Clause 4',
          priority: 'high',
          isoDate: '2027-10-01'
        },
        {
          id: 'time-emp-4',
          date: 'Post-Termination +18 Mo',
          title: 'Non-Compete Restriction Expiration',
          description: 'End of non-compete covenant across North America and Europe.',
          clauseReference: 'Clause 5',
          priority: 'medium',
          isoDate: '2028-04-01'
        }
      ],
      lawyerPrepKit: {
        documentSummary: 'Executive Employment Agreement for VP of Engineering position at NovaStream Inc. $280,000 base salary. Contains severe employer-favored terms regarding post-employment invention ownership, an expansive 18-month international non-compete, and discretionary equity cancellation.',
        topConcerns: [
          'Trailer clause seizing personal inventions created within 12 months after leaving the company.',
          'Cancellation of already vested equity if terminated under a subjective "Cause" definition.',
          'Broad 18-month non-compete across North America and Europe covering unreleased products.',
          'Modest 3-month severance package coupled with non-mutual releases.'
        ],
        importantFinancialExposure: [
          'Potential loss of hundreds of thousands of dollars in vested equity value.',
          '18 months of restricted employment without guaranteed compensation (no garden leave).',
          'Legal exposure if founding a new company during the 12-month post-employment IP window.'
        ],
        importantClauses: [
          {
            title: 'Clause 3: Incentive Equity & Forfeiture',
            reference: 'Page 1, Paragraph 3',
            summary: 'Defines Cause as failing performance targets; cancels vested options.',
            flagReason: 'Atypical clawback of earned vested compensation for performance disputes.'
          },
          {
            title: 'Clause 4: Intellectual Property Assignment',
            reference: 'Page 1, Paragraph 4',
            summary: '12-month post-termination assignment of all ideas regardless of equipment or hours.',
            flagReason: 'Overbroad post-employment reach; likely conflicts with state employee protection laws.'
          },
          {
            title: 'Clause 5: Non-Competition',
            reference: 'Page 2, Paragraph 1',
            summary: '18-month ban across North America and Europe.',
            flagReason: 'Extremely aggressive geographic scope and time duration.'
          }
        ],
        questionsForLawyer: [
          'How enforceable is the 12-month post-employment IP assignment under Delaware vs. local state law?',
          'Is the 18-month multi-continent non-compete valid given recent FTC rules and state statutory bans?',
          'What is the best language to protect vested options from discretionary Board forfeiture?',
          'What standard executive severance modifications (e.g. 6-12 months + COBRA) should I propose?'
        ],
        supportingDocumentsToBring: [
          'Unsigned Employment Agreement',
          'Offer letter or initial term sheet',
          'Stock option plan document or grant agreement summary (if provided)',
          'List of existing personal pre-existing inventions to exclude'
        ],
        disclaimer: 'LexiClear provides informational document analysis, not legal advice. Consult a licensed employment attorney for binding counsel.'
      }
    }
  },
  {
    id: 'sample-loan',
    name: 'Commercial Promissory Note & Loan Agreement',
    category: 'Finance & Banking',
    description: 'Secured business loan of $150,000 with cross-default acceleration, personal guaranty, and variable balloon maturity.',
    fileType: 'pdf',
    sizeFormatted: '160 KB',
    rawText: `COMMERCIAL PROMISSORY NOTE & SECURITY AGREEMENT

Principal Amount: $150,000.00
Effective Date: September 1, 2025
Maturity Date: September 1, 2027

FOR VALUE RECEIVED, BlueSky Logistics LLC ("Borrower") and Marcus Vance ("Guarantor"), jointly and severally promise to pay to the order of Apex Capital Partners LLC ("Lender"), the principal sum of One Hundred Fifty Thousand Dollars ($150,000.00), together with interest on unpaid principal balances at an initial rate of 11.5% per annum.

1. REPAYMENT & BALLOON PAYMENT
Borrower shall make monthly interest-only payments of $1,437.50 on the first day of each calendar month, commencing October 1, 2025. The entire unpaid principal balance, together with all accrued and unpaid interest, shall be due and payable in full on the Maturity Date as a single balloon payment of $150,000.00.

2. PREPAYMENT PENALTY
Borrower may not prepay this Note in whole or in part during the first twelve (12) months. Any prepayment occurring during the second year (months 13 through 24) shall incur a mandatory prepayment penalty fee equal to five percent (5.0%) of the total prepaid principal amount ($7,500.00).

3. DEFAULT, ACCELERATION & DEFAULT INTEREST
Upon the occurrence of any Event of Default, Lender may, at its sole election and without notice or demand, declare the entire unpaid balance immediately due and payable. An Event of Default includes: (a) non-payment of any installment within five (5) days of due date; (b) any material adverse change in Borrower\'s financial condition as determined by Lender; (c) any cross-default under any other credit card, lease, or indebtedness of Borrower or Guarantor to third parties; or (d) death or incapacity of Guarantor. Upon default, the interest rate shall immediately surge to the Default Rate of twenty-four percent (24.0%) per annum.

4. UNCONDITIONAL CONTINUING PERSONAL GUARANTY
Marcus Vance ("Guarantor") unconditionally, irrevocably, and personally guarantees the prompt, punctual payment and performance of all liabilities under this Note. Guarantor expressly waives presentment, demand, notice of dishonor, protest, and any requirement that Lender first exhaust remedies against Borrower or pledged collateral before seizing personal assets of Guarantor.

5. CONFESSION OF JUDGMENT & COGNOVIT
Borrower and Guarantor hereby irrevocably authorize any attorney of any court of record to appear for Borrower and Guarantor in any court after default, waive the issuance and service of process, and confess judgment against Borrower and Guarantor for the unpaid balance plus attorney fees of fifteen percent (15%).

6. GOVERNING LAW & ATTORNEY FEES
This Note shall be governed by the laws of the State of New York. In any enforcement action, Borrower and Guarantor agree to reimburse Lender for all attorneys' fees, collection expenses, and court costs.`,
    precomputedAnalysis: {
      metadata: {
        id: 'sample-loan',
        fileName: 'Commercial_Promissory_Note_Apex_Capital.pdf',
        fileSize: 163840,
        fileType: 'pdf',
        uploadDate: 'September 1, 2025',
        wordCount: 460,
        pageCount: 2,
        rawText: ''
      },
      documentType: 'Commercial Promissory Note & Security Agreement',
      parties: ['BlueSky Logistics LLC (Borrower)', 'Marcus Vance (Guarantor)', 'Apex Capital Partners LLC (Lender)'],
      jurisdiction: 'State of New York',
      summary: 'A high-interest commercial loan for $150,000 with monthly interest-only payments culminating in a full $150,000 balloon payment at 24 months. Contains aggressive lender remedies including confession of judgment, subjective material adverse change default, and a 24% default interest spike.',
      importantDates: [
        'September 1, 2025 - Loan Closing & Disbursement',
        'October 1, 2025 - First Monthly Interest-Only Payment Due',
        'September 1, 2026 - Expiration of Prepayment Lockout Window',
        'September 1, 2027 - Maturity Date ($150,000 Balloon Payment Due)'
      ],
      financialTerms: [
        '$150,000.00 principal amount',
        '11.5% initial annual interest rate ($1,437.50/month)',
        '$150,000.00 balloon payment at maturity (24 months)',
        '12-month prepayment lockout + 5% prepayment penalty in Year 2 ($7,500)',
        '24.0% default interest rate upon any default event',
        '15% attorney fee automatic assessment on confessed judgment'
      ],
      obligations: [
        'Pay monthly interest payments without fail by 5th day',
        'Full repayment of $150,000 principal on September 1, 2027',
        'Guarantor personally guarantees debt without requiring lender to first pursue company',
        'Maintain financial condition to Lender subjective satisfaction'
      ],
      terminationTerms: [
        'Maturity date after 24 months requires full lump sum refinancing or payoff',
        'Lender can accelerate entire $150k debt immediately on cross-default or subjective material change',
        'Prepayment locked out for first 12 months'
      ],
      disputeResolution: 'Confession of judgment clause allows lender to enter court judgment without trial; New York governing law.',
      healthScore: {
        overallScore: 41,
        status: 'Critical Risk',
        shortExplanation: 'Severe borrower risks detected: confession of judgment clause, subjective material adverse change acceleration triggers, full personal asset exposure, and a steep 24% default penalty interest rate.',
        dimensions: {
          fairness: {
            name: 'Fairness',
            score: 30,
            weight: 20,
            status: 'Critical',
            description: 'Reciprocity of default remedies and borrower rights.',
            keyFinding: 'Confession of judgment allows lender to bypass legal defense.'
          },
          clarity: {
            name: 'Clarity',
            score: 80,
            weight: 15,
            status: 'Fair',
            description: 'Clarity of interest rates and payment dates.',
            keyFinding: 'Payment amounts and percentages are clear, but subjective default criteria are vague.'
          },
          riskExposure: {
            name: 'Risk Exposure',
            score: 28,
            weight: 25,
            status: 'Critical',
            description: 'Personal liability, balloon refinance risk, and default acceleration.',
            keyFinding: 'Unconditional personal guaranty puts personal bank accounts and home at immediate risk.'
          },
          obligationBalance: {
            name: 'Obligation Balance',
            score: 35,
            weight: 15,
            status: 'Critical',
            description: 'Balance of lender vs borrower rights upon default.',
            keyFinding: 'Lender can declare default based on third-party debts or subjective financial changes.'
          },
          terminationRights: {
            name: 'Termination Rights',
            score: 45,
            weight: 15,
            status: 'Warning',
            description: 'Prepayment flexibility and early exit rights.',
            keyFinding: 'Locked out from prepaying for 12 months; 5% penalty thereafter.'
          },
          disputeResolution: {
            name: 'Dispute Resolution',
            score: 30,
            weight: 10,
            status: 'Critical',
            description: 'Court protections, defense rights, and due process.',
            keyFinding: 'Borrower waives notice and service of process via cognovit note.'
          }
        },
        calculationMethodology: 'Score heavily penalized by extreme clauses: Cognovit/Confession of Judgment, 24% Default Interest, and subjective Acceleration triggers.'
      },
      clauses: [
        {
          id: 'c-loan-confession',
          title: 'Clause 5: Confession of Judgment & Cognovit',
          text: 'Borrower and Guarantor hereby irrevocably authorize any attorney of any court of record to appear for Borrower and Guarantor in any court after default, waive the issuance and service of process, and confess judgment against Borrower and Guarantor for the unpaid balance plus attorney fees of fifteen percent (15%).',
          page: 2,
          type: 'enforcement',
          obligations: ['Waive right to contest lawsuits or receive court summons'],
          rights: ['None specified'],
          dates: [],
          financialExposure: 'Immediate court judgment + 15% ($22,500+) attorney fee',
          riskIndicators: ['Confession of judgment', 'Waiver of service of process and due process rights'],
          plainEnglish: 'If the lender claims you defaulted, an attorney chosen by the lender can walk into court on your behalf, plead guilty for you, and obtain an immediate enforceable judgment without giving you notice or a chance to defend yourself.',
          whyItMatters: 'Confession of judgment clauses are among the most draconian legal mechanisms. In New York, recent statutory amendments have prohibited confessions of judgment against out-of-state debtors.'
        },
        {
          id: 'c-loan-default',
          title: 'Clause 3: Default, Acceleration & Default Interest',
          text: 'Upon the occurrence of any Event of Default, Lender may, at its sole election and without notice or demand, declare the entire unpaid balance immediately due and payable. An Event of Default includes: (a) non-payment within five (5) days; (b) any material adverse change in Borrower\'s financial condition as determined by Lender; (c) any cross-default under any other credit card, lease, or indebtedness... Upon default, the interest rate shall immediately surge to the Default Rate of twenty-four percent (24.0%) per annum.',
          page: 1,
          type: 'default',
          obligations: ['Pay entire $150,000 immediately if lender deems you financially weakened'],
          rights: ['5-day grace period for monthly payment'],
          dates: ['5 days grace'],
          financialExposure: 'Instant $150,000 balance demand + 24% interest ($3,000/mo)',
          riskIndicators: ['Subjective "material adverse change" standard', 'Cross-default trigger', '24% default interest rate'],
          plainEnglish: 'The lender can demand the entire $150,000 immediately if they feel your finances worsened or if you are late on an unrelated credit card. The interest rate instantly jumps from 11.5% to 24%.',
          whyItMatters: 'Subjective default triggers give the lender extraordinary leverage to call the loan even when you have never missed a scheduled payment.'
        },
        {
          id: 'c-loan-guaranty',
          title: 'Clause 4: Unconditional Continuing Personal Guaranty',
          text: 'Marcus Vance ("Guarantor") unconditionally, irrevocably, and personally guarantees the prompt, punctual payment and performance... Guarantor expressly waives presentment, demand... and any requirement that Lender first exhaust remedies against Borrower or pledged collateral before seizing personal assets of Guarantor.',
          page: 1,
          type: 'guaranty',
          obligations: ['Pay debt from personal savings, home, and personal assets'],
          rights: ['None specified'],
          dates: [],
          financialExposure: 'Full $150,000+ debt transferred to personal liability',
          riskIndicators: ['Lender can seize personal assets before selling business collateral', 'Waiver of subrogation and defense rights'],
          plainEnglish: 'The lender does not have to liquidate company inventory or vehicles first; they can go directly after Marcus Vance\'s personal bank accounts, savings, and personal real estate.',
          whyItMatters: 'A personal guaranty pierces the limited liability protection of your LLC, placing personal family assets at direct risk.'
        }
      ],
      risks: [
        {
          id: 'risk-loan-1',
          clauseId: 'c-loan-confession',
          severity: 'high',
          title: 'Confession of Judgment (Cognovit Note)',
          reason: 'Authorizes entry of judgment without notice, trial, or opportunity to present defenses, plus an automatic 15% attorney fee charge.',
          evidence: '...irrevocably authorize any attorney... to appear for Borrower and Guarantor... waive the issuance and service of process, and confess judgment against Borrower and Guarantor...',
          evidenceStrength: 'Strong evidence',
          userImpact: 'Lender can freeze your bank accounts overnight without you ever receiving a court summons.',
          questionToConsider: 'Will the lender strike the Confession of Judgment clause in its entirety?',
          plainEnglishTranslation: 'The lender can get a court judgment against you instantly without letting you defend yourself.',
          clauseTitle: 'Clause 5: Confession of Judgment & Cognovit',
          pageReference: 'Page 2'
        },
        {
          id: 'risk-loan-2',
          clauseId: 'c-loan-default',
          severity: 'high',
          title: 'Subjective "Material Adverse Change" Default Trigger',
          reason: 'Lender can declare an immediate default and demand $150,000 if it subjectively believes your financial health changed, even if payments are current.',
          evidence: '...any material adverse change in Borrower\'s financial condition as determined by Lender... declare the entire unpaid balance immediately due and payable...',
          evidenceStrength: 'Strong evidence',
          userImpact: 'A dip in quarterly revenue could trigger immediate loan acceleration and foreclosure.',
          questionToConsider: 'Can default triggers be restricted to objective events (e.g. 30 days uncured non-payment)?',
          plainEnglishTranslation: 'The lender can call the whole loan if they feel your business is slowing down, even if payments are on time.',
          clauseTitle: 'Clause 3: Default, Acceleration & Default Interest',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-loan-3',
          clauseId: 'c-loan-guaranty',
          severity: 'high',
          title: 'Direct Personal Asset Exposure Without Collateral Exhaustion',
          reason: 'Guarantor waives the requirement for lender to liquidate company assets or equipment first before suing the guarantor personally.',
          evidence: '...waives... any requirement that Lender first exhaust remedies against Borrower or pledged collateral before seizing personal assets of Guarantor.',
          evidenceStrength: 'Strong evidence',
          userImpact: 'Your personal family checking and savings accounts can be seized immediately upon default.',
          questionToConsider: 'Can the guaranty be modified to a "guaranty of collection" requiring lender to exhaust business collateral first?',
          plainEnglishTranslation: 'The lender can take your personal assets directly before touching company assets.',
          clauseTitle: 'Clause 4: Unconditional Continuing Personal Guaranty',
          pageReference: 'Page 1'
        },
        {
          id: 'risk-loan-4',
          clauseId: 'c-loan-default',
          severity: 'medium',
          title: '24.0% Default Interest Rate Surge',
          reason: 'Doubles the interest rate to 24% per annum upon any alleged default event.',
          evidence: 'Upon default, the interest rate shall immediately surge to the Default Rate of twenty-four percent (24.0%) per annum.',
          evidenceStrength: 'Strong evidence',
          userImpact: 'Interest costs double from $1,437.50 to $3,000 per month, accelerating insolvency.',
          questionToConsider: 'Can the default rate be capped at no more than 3-5% above the note rate?',
          plainEnglishTranslation: 'Interest spikes to 24% immediately if there is any dispute or delayed payment.',
          clauseTitle: 'Clause 3: Default, Acceleration & Default Interest',
          pageReference: 'Page 1'
        }
      ],
      actionChecklist: [
        {
          id: 'act-loan-1',
          title: 'Insist on striking the Confession of Judgment clause',
          reason: 'Crucial to preserving due process, notice, and the right to defend against incorrect claims.',
          clauseReference: 'Clause 5 (Confession of Judgment)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-loan-2',
          title: 'Remove subjective "material adverse change" default trigger',
          reason: 'Ensure defaults can only occur upon objective monetary or covenant non-compliance.',
          clauseReference: 'Clause 3 (Default Triggers)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-loan-3',
          title: 'Convert to Guaranty of Collection with collateral exhaustion clause',
          reason: 'Require lender to exhaust business collateral before proceeding against personal assets.',
          clauseReference: 'Clause 4 (Personal Guaranty)',
          priority: 'high',
          completed: false,
          category: 'negotiate'
        },
        {
          id: 'act-loan-4',
          title: 'Plan refinancing strategy 6 months before September 1, 2027 balloon date',
          reason: '$150,000 lump sum balloon payment will require replacement financing or liquid reserves.',
          clauseReference: 'Clause 1 (Balloon Payment)',
          priority: 'medium',
          completed: false,
          category: 'prepare'
        }
      ],
      timeline: [
        {
          id: 'time-loan-1',
          date: 'Sep 1, 2025',
          title: 'Loan Disbursement & Closing',
          description: '$150,000 principal disbursed. 11.5% interest begins accruing.',
          clauseReference: 'Preamble',
          priority: 'medium',
          isoDate: '2025-09-01'
        },
        {
          id: 'time-loan-2',
          date: 'Oct 1, 2025',
          title: 'First Monthly Interest Payment',
          description: 'First $1,437.50 interest installment due. 5-day grace window before default.',
          clauseReference: 'Clause 1 & 3',
          priority: 'medium',
          isoDate: '2025-10-01'
        },
        {
          id: 'time-loan-3',
          date: 'Sep 1, 2026',
          title: 'Prepayment Lockout Expiration',
          description: '12-month lockout ends. Prepayment permitted subject to 5% fee ($7,500).',
          clauseReference: 'Clause 2',
          priority: 'medium',
          isoDate: '2026-09-01'
        },
        {
          id: 'time-loan-4',
          date: 'Sep 1, 2027',
          title: 'Maturity Date & $150,000 Balloon Payment',
          description: 'CRITICAL: Full $150,000 principal due in one single balloon payment.',
          clauseReference: 'Clause 1',
          priority: 'high',
          isoDate: '2027-09-01'
        }
      ],
      lawyerPrepKit: {
        documentSummary: 'Commercial Promissory Note and Security Agreement for $150,000 between BlueSky Logistics LLC (Borrower), Marcus Vance (Guarantor), and Apex Capital Partners LLC. Two-year term with 11.5% interest-only monthly payments and full $150,000 balloon payment at maturity. Contains highly aggressive creditor protection terms.',
        topConcerns: [
          'Confession of judgment clause waiving notice and court trial rights.',
          'Subjective material adverse change default triggers allowing premature acceleration.',
          'Unconditional personal guaranty permitting direct personal asset attachment without exhausting business collateral.',
          '24% default interest spike and 5% prepayment penalty in Year 2.'
        ],
        importantFinancialExposure: [
          'Full $150,000 principal due at month 24 as a lump sum balloon.',
          'Personal home and bank accounts of Marcus Vance are directly exposed.',
          'Interest cost jumps from $1,437.50/month to $3,000.00/month upon default.',
          'Mandatory 15% ($22,500) attorney fee penalty added if judgment is confessed.'
        ],
        importantClauses: [
          {
            title: 'Clause 5: Confession of Judgment',
            reference: 'Page 2, Paragraph 2',
            summary: 'Waives summons and allows attorney to confess debt in court.',
            flagReason: 'High legal risk; may also violate recent NY CPLR 3218 restrictions.'
          },
          {
            title: 'Clause 3: Default & Acceleration',
            reference: 'Page 1, Paragraph 3',
            summary: 'Subjective default, cross-default on unrelated debt, 24% default rate.',
            flagReason: 'Gives lender uncontrolled discretion to demand immediate repayment.'
          },
          {
            title: 'Clause 4: Personal Guaranty',
            reference: 'Page 1, Paragraph 4',
            summary: 'Marcus Vance personally liable without requiring collateral sale first.',
            flagReason: 'Negates LLC corporate shield entirely.'
          }
        ],
        questionsForLawyer: [
          'Is the Confession of Judgment in Clause 5 legally enforceable under current New York law?',
          'How can we negotiate the personal guaranty down to a "Good Guy" guaranty or a guaranty of collection?',
          'What standard language should replace the subjective "material adverse change" default clause?',
          'Can we eliminate the 12-month prepayment lockout so we can refinance as soon as rates drop?'
        ],
        supportingDocumentsToBring: [
          'Unsigned Promissory Note & Security Agreement',
          'Company LLC Operating Agreement',
          'BlueSky Logistics LLC current balance sheet and tax return',
          'Marcus Vance personal financial statement'
        ],
        disclaimer: 'LexiClear provides informational document analysis, not legal advice. Consult a qualified commercial finance attorney for legal counsel.'
      }
    }
  }
];

// Ensure all sample documents have their full rawText attached in metadata for zero-hallucination Q&A
SAMPLE_DOCUMENTS.forEach(sample => {
  if (sample.precomputedAnalysis?.metadata) {
    sample.precomputedAnalysis.metadata.rawText = sample.rawText;
  }
});
