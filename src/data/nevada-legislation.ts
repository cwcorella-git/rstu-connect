/**
 * Nevada Revised Statutes (NRS) relevant to tenant rights
 * Chapter 118A: Landlord and Tenant: Dwellings
 * Chapter 40: Actions and Proceedings in Particular Cases Concerning Property
 */

export interface LegislationSection {
  citation: string;
  title: string;
  chapter: string;
  summary: string;
  fullText: string;
  relatedSections?: string[];
  practicalTips?: string[];
}

export const nevadaLegislation: Record<string, LegislationSection> = {
  // ===== CHAPTER 118A: LANDLORD AND TENANT =====

  'NRS 118A.200': {
    citation: 'NRS 118A.200',
    title: 'Rental Agreement: Form and Contents',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Establishes requirements for rental agreements, including what must be in writing and what terms are enforceable.',
    fullText: `NRS 118A.200 - Rental agreement: Form and contents; prohibited provisions.

1. A landlord and a tenant may include in a rental agreement terms and conditions not prohibited by this chapter or other rule of law, including rent, term of the agreement and other provisions governing the rights and obligations of the parties.

2. A rental agreement may not provide that the tenant:
   (a) Agrees to waive or forgo rights or remedies under this chapter;
   (b) Authorizes any person to confess judgment on a claim arising out of the rental agreement;
   (c) Agrees to pay the landlord's attorney's fees, except as provided by court order;
   (d) Agrees to the exculpation or limitation of any liability of the landlord arising under law or to indemnify the landlord for that liability or the costs connected therewith.

3. A provision prohibited by subsection 2 included in a rental agreement is unenforceable. If a landlord deliberately uses a rental agreement containing provisions known by the landlord to be prohibited, the tenant may recover in addition to the tenant's actual damages an amount up to 1 month's rent and reasonable attorney's fees.`,
    relatedSections: ['NRS 118A.210', 'NRS 118A.220'],
    practicalTips: [
      'Always get your lease in writing',
      'Any clause waiving your tenant rights is unenforceable',
      'You cannot be forced to pay landlord attorney fees unless ordered by court'
    ]
  },

  'NRS 118A.210': {
    citation: 'NRS 118A.210',
    title: 'Terms and Conditions of Rental Agreement',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Defines the term of tenancy based on rent payment periods when no written agreement exists.',
    fullText: `NRS 118A.210 - Term of tenancy when not specified in rental agreement.

1. In the absence of agreement, the tenant shall pay the fair rental value for the use and occupancy of the dwelling unit.

2. Unless the rental agreement fixes a definite term, the tenancy is week to week in the case of a tenant who pays weekly rent, and in all other cases month to month.

3. The landlord or tenant may terminate a week-to-week tenancy by a written notice given to the other at least 7 days before the termination date specified in the notice.

4. Except as otherwise provided in NRS 118A.460 and 40.251, the landlord or the tenant may terminate a month-to-month tenancy by a written notice given to the other at least 30 days before the periodic rental date specified in the notice.`,
    relatedSections: ['NRS 118A.200', 'NRS 40.251'],
    practicalTips: [
      'Without a lease, you have month-to-month tenancy if paying monthly rent',
      'Either party needs 30 days notice to end a month-to-month tenancy',
      'Get all agreements in writing to avoid disputes'
    ]
  },

  'NRS 118A.242': {
    citation: 'NRS 118A.242',
    title: 'Security Deposit Limits and Return',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Limits security deposits to 3 months rent and requires return within 30 days of move-out.',
    fullText: `NRS 118A.242 - Security deposits: Limits; return; damages.

1. A landlord shall not demand or receive security, however denominated, in an amount or value in excess of 3 months' periodic rent.

2. Upon termination of the tenancy, any security deposit must be returned to the tenant within 30 days after:
   (a) The tenant surrenders the dwelling unit; and
   (b) The landlord receives the tenant's forwarding address or other reasonable means for returning the security deposit.

3. If the landlord claims any portion of the security deposit, the landlord shall provide to the tenant:
   (a) A written, itemized accounting of the disposition of the security deposit;
   (b) Any amount of the security deposit remaining after the deductions.

4. A landlord who fails to comply with subsection 2 or 3:
   (a) Forfeits the right to retain any part of the security deposit; and
   (b) Is liable to the tenant for the entire amount of the security deposit, plus any additional damages.

5. The landlord may not deduct from the security deposit for normal wear and tear.`,
    relatedSections: ['NRS 118A.244', 'NRS 118A.246'],
    practicalTips: [
      'Maximum deposit is 3 months rent',
      'Landlord has 30 days to return deposit after you move out',
      'Provide your new address in writing when you move',
      'Normal wear and tear cannot be deducted',
      'Request itemized statement if any amount is withheld',
      'If landlord misses 30-day deadline, they may forfeit the entire deposit'
    ]
  },

  'NRS 118A.290': {
    citation: 'NRS 118A.290',
    title: 'Implied Warranty of Habitability',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Establishes that every rental comes with an implied promise that the property is fit for human habitation.',
    fullText: `NRS 118A.290 - Implied warranty of habitability.

1. The landlord shall at all times during the tenancy maintain the dwelling unit in a habitable condition.

2. A dwelling unit is not habitable if it substantially lacks any of the following characteristics:
   (a) Effective waterproofing and weather protection of roof and exterior walls, including unbroken windows and doors;
   (b) Plumbing facilities in good working order, including hot and cold running water, connected to a sewage disposal system;
   (c) A water supply capable of producing hot and cold running water furnished to appropriate fixtures and connected to a sewage disposal system approved under applicable law;
   (d) Adequate heating facilities in good working order;
   (e) Electrical lighting with wiring and electrical equipment in good working order;
   (f) An adequate number of appropriate receptacles for garbage and rubbish in clean condition;
   (g) Floors, stairways and railings maintained in good repair;
   (h) The absence of rodents, vermin and other pests.

3. This warranty may not be waived in any residential lease.

4. The landlord and tenant may agree that the tenant perform specified repairs, maintenance tasks and minor remodeling only if the agreement is:
   (a) Set forth in a separate writing signed by the parties;
   (b) Supported by adequate consideration; and
   (c) Not for the purpose of evading the landlord's obligations.`,
    relatedSections: ['NRS 118A.320', 'NRS 118A.355', 'NRS 118A.380'],
    practicalTips: [
      'Your landlord must keep the property livable - this cannot be waived',
      'Document all habitability issues with photos and written complaints',
      'Issues like no heat, no hot water, rodents, or broken plumbing violate this law',
      'Use this as basis for repair requests and rent withholding if necessary'
    ]
  },

  'NRS 118A.320': {
    citation: 'NRS 118A.320',
    title: 'Landlord Duty to Maintain Premises',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Requires landlords to comply with building codes, make repairs, maintain common areas, and provide essential services.',
    fullText: `NRS 118A.320 - Duties of landlord to maintain dwelling unit.

1. The landlord shall:
   (a) Comply with the requirements of applicable building codes, housing codes and regulations materially affecting health and safety;
   (b) Make all repairs and do whatever is necessary to put and keep the premises in a fit and habitable condition;
   (c) Keep all common areas of the premises in a clean and safe condition;
   (d) Maintain in good and safe working order and condition all electrical, plumbing, sanitary, heating, ventilating, air-conditioning and other facilities and appliances, including elevators, supplied or required to be supplied by the landlord;
   (e) Provide and maintain appropriate receptacles and conveniences for the removal of ashes, garbage, rubbish and other waste incidental to the occupancy of the dwelling unit and arrange for their removal;
   (f) Supply running water and reasonable amounts of hot water at all times, and reasonable heat except where the building is not equipped for that purpose or the dwelling unit is so constructed that heat is generated by the tenant.

2. The landlord and tenant may agree in writing that the tenant perform the landlord's duties specified in paragraphs (e) and (f) of subsection 1 and specified repairs, maintenance tasks and minor remodeling if:
   (a) The agreement of the parties is set forth in a separate writing signed by both parties;
   (b) The agreement is supported by adequate consideration; and
   (c) The work is not necessary to cure noncompliance with the requirements of paragraph (a) of subsection 1.`,
    relatedSections: ['NRS 118A.290', 'NRS 118A.355'],
    practicalTips: [
      'Landlord must follow all building and housing codes',
      'They must provide running water, hot water, and heat (if equipped)',
      'Common areas must be clean and safe',
      'Any agreement for you to do repairs must be separate from your lease'
    ]
  },

  'NRS 118A.330': {
    citation: 'NRS 118A.330',
    title: 'Landlord Access to Dwelling Unit',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Requires landlords to give 24-hour notice before entering, except in emergencies.',
    fullText: `NRS 118A.330 - Landlord's access to dwelling unit.

1. A tenant shall not unreasonably withhold consent to the landlord to enter into the dwelling unit in order to inspect the premises, make necessary or agreed repairs, decorations, alterations or improvements, supply necessary or agreed services or exhibit the dwelling unit to prospective or actual purchasers, mortgagees, tenants, workers or contractors.

2. A landlord may enter the dwelling unit without consent of the tenant in case of emergency.

3. A landlord shall not abuse the right of access or use it to harass the tenant. Except in case of emergency or if it is impractical to do so, the landlord shall give the tenant at least 24 hours' notice of intent to enter and may enter only at reasonable times.

4. A landlord has no other right of access except:
   (a) Pursuant to court order;
   (b) As permitted by NRS 118A.420 and 118A.460; or
   (c) Unless the tenant has abandoned or surrendered the premises.`,
    relatedSections: ['NRS 118A.420', 'NRS 118A.460'],
    practicalTips: [
      'Landlord must give 24 hours notice before entering',
      'They can only enter at reasonable times',
      'Emergency is the only exception to the notice requirement',
      'Repeated unannounced entries may constitute harassment',
      'Document unauthorized entries in writing'
    ]
  },

  'NRS 118A.355': {
    citation: 'NRS 118A.355',
    title: 'Rent Withholding for Habitability Violations (14-Day Notice)',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Allows tenants to withhold rent after giving 14-day notice if landlord fails to fix habitability violations.',
    fullText: `NRS 118A.355 - Tenant's remedies for failure of landlord to maintain dwelling unit.

1. If there is noncompliance by the landlord with NRS 118A.290 or 118A.320, and the reasonable cost of compliance does not exceed $100 or an amount equal to 1 month's rent, whichever is greater, the tenant may recover damages for the breach or may notify the landlord of the tenant's intention to correct the condition at the landlord's expense. If the landlord fails to comply within 14 days after being notified by the tenant in writing, or as promptly as conditions require in case of emergency, the tenant may cause the work to be done by a licensed contractor and, after submitting to the landlord an itemized statement, deduct from the rent the actual and reasonable cost of the work, not exceeding the amount specified in this subsection.

2. If there is noncompliance by the landlord with NRS 118A.290 or 118A.320, the tenant may:
   (a) Recover damages based on the diminished fair rental value of the dwelling unit; or
   (b) Procure reasonable substitute housing during the period of the noncompliance, and the rent shall abate for that period.

3. If the landlord's noncompliance is willful, the tenant may recover reasonable attorney's fees.

4. The tenant may not proceed under paragraph (a) of subsection 1 if the condition was caused by the deliberate or negligent act or omission of the tenant, a member of the tenant's family or other person on the premises with the tenant's consent.

5. **Rent Escrow:** If the tenant proceeds under this section, the tenant shall deposit the withheld rent into an escrow account or with the court.`,
    relatedSections: ['NRS 118A.290', 'NRS 118A.320', 'NRS 118A.380'],
    practicalTips: [
      'Give landlord written 14-day notice of habitability problems',
      'If not fixed, you can withhold rent BUT must put it in escrow',
      'Keep all rent money - deposit it with the court or escrow account',
      'Document everything with photos, videos, and written records',
      'Get multiple quotes if you need to hire someone to fix it'
    ]
  },

  'NRS 118A.380': {
    citation: 'NRS 118A.380',
    title: 'Essential Services Failure (48-Hour Notice)',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Allows immediate rent reduction or substitute housing when essential services (water, heat, electricity) fail.',
    fullText: `NRS 118A.380 - Failure to supply essential services.

1. If contrary to the rental agreement or NRS 118A.320, the landlord deliberately or negligently fails to supply any essential service, including heat, running water, hot water, electricity, gas or reasonable amounts of hot water, the tenant may:
   (a) Give written notice to the landlord specifying the breach and that the rental agreement will terminate upon a date not less than 48 hours after receipt of the notice unless the breach is remedied within 48 hours;
   (b) Procure reasonable amounts of heat, hot water, running water, electric, gas and other essential service during the period of the landlord's noncompliance and deduct their actual and reasonable cost from the rent;
   (c) Recover damages based upon the diminution of the fair rental value of the dwelling unit; or
   (d) Procure reasonable substitute housing during the period of noncompliance, and the rent shall abate for that period.

2. If the tenant proceeds under this section, the landlord is liable for:
   (a) The tenant's reasonable costs of substitute housing, not exceeding an amount equal to the rent;
   (b) The actual costs of repairing the condition, if the tenant caused the repair to be made; and
   (c) Reasonable attorney's fees if the landlord's noncompliance is willful.

3. The tenant may not proceed under this section if the condition was caused by the deliberate or negligent act or omission of the tenant, a member of the tenant's family or other person on the premises with the tenant's consent.`,
    relatedSections: ['NRS 118A.320', 'NRS 118A.355'],
    practicalTips: [
      'Only 48 hours notice needed for essential services (heat, water, electricity)',
      'You can get substitute housing and deduct the cost from rent',
      'No escrow required for essential services failure',
      'Document the outage with photos, videos, and timestamps'
    ]
  },

  'NRS 118A.390': {
    citation: 'NRS 118A.390',
    title: 'Unlawful Utility Shutoffs',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Prohibits landlords from intentionally interrupting utilities to force tenant out.',
    fullText: `NRS 118A.390 - Landlord prohibited from interruption or termination of utility services.

1. A landlord shall not directly or indirectly cause the interruption or termination of any utility service, including electricity, gas, water, sanitary sewer or telephone service, which is being supplied to or for the benefit of a tenant, with the intent to terminate the occupancy of the tenant.

2. If a landlord violates subsection 1, the tenant may:
   (a) Recover immediate possession of the dwelling unit;
   (b) Recover an amount not more than $2,500 or actual damages, whichever is greater;
   (c) Terminate the rental agreement;
   (d) Obtain injunctive relief; and
   (e) Recover reasonable attorney's fees and costs.

3. A landlord who violates the provisions of this section is guilty of a misdemeanor.`,
    relatedSections: ['NRS 118A.480', 'NRS 118A.510'],
    practicalTips: [
      'Landlord cannot shut off utilities to force you out',
      'This is both a civil violation and a criminal misdemeanor',
      'You can recover up to $2,500 in damages plus actual damages',
      'Document any utility interruptions immediately',
      'Call police if utilities are intentionally shut off'
    ]
  },

  'NRS 118A.420': {
    citation: 'NRS 118A.420',
    title: 'Tenant Duties and Obligations',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Lists tenant responsibilities including paying rent, maintaining cleanliness, and not disturbing neighbors.',
    fullText: `NRS 118A.420 - Duties of tenant.

The tenant shall:
1. Comply with all obligations imposed upon tenants by applicable provisions of building codes, housing codes and regulations materially affecting health and safety;

2. Keep that part of the premises which the tenant occupies and uses as clean and safe as the condition of the premises permit;

3. Dispose of all ashes, garbage, rubbish and other waste from the dwelling unit in a clean and safe manner;

4. Keep all plumbing fixtures in the dwelling unit or used by the tenant as clean as their condition permits;

5. Use in a reasonable manner all electrical, plumbing, sanitary, heating, ventilating, air-conditioning and other facilities and appliances, including elevators, in the premises;

6. Not deliberately or negligently destroy, deface, damage, impair or remove any part of the premises or knowingly permit any other person to do so;

7. Conduct themselves and require other persons on the premises with their consent to conduct themselves in a manner that will not disturb a neighbor's peaceful enjoyment of the premises;

8. Notify the landlord in writing before vacating the premises.`,
    relatedSections: ['NRS 118A.200', 'NRS 118A.290'],
    practicalTips: [
      'Keep your unit clean and sanitary',
      'Report maintenance issues promptly in writing',
      'Be respectful of neighbors to avoid lease violations',
      'Give proper notice before moving out'
    ]
  },

  'NRS 118A.480': {
    citation: 'NRS 118A.480',
    title: 'Unlawful Removal or Lockout',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Prohibits landlords from locking out tenants or removing their belongings without court order.',
    fullText: `NRS 118A.480 - Unlawful removal or exclusion of tenant; willful interruption of services; remedies.

1. A landlord shall not:
   (a) Willfully and without legal authority remove or exclude the tenant from the dwelling unit;
   (b) Willfully seize the tenant's personal property; or
   (c) Willfully cause the interruption or termination of any utility service being supplied to the tenant.

2. If a landlord violates this section, the tenant may:
   (a) Recover immediate possession of the dwelling unit;
   (b) Recover an amount not more than $2,500 or actual damages, whichever is greater;
   (c) Terminate the rental agreement;
   (d) Obtain injunctive relief to prevent further violations; and
   (e) Recover reasonable attorney's fees and costs incurred in any action brought to enforce these remedies.

3. A landlord who violates subsection 1 is guilty of a misdemeanor.

4. The remedies provided by this section are in addition to any other remedies available at law or in equity.`,
    relatedSections: ['NRS 118A.390', 'NRS 118A.510'],
    practicalTips: [
      'Landlord cannot change locks without court order',
      'They cannot remove your belongings without court order',
      'This is a criminal misdemeanor - call the police',
      'You can recover up to $2,500 plus actual damages',
      'Document everything and call police immediately if locked out'
    ]
  },

  'NRS 118A.490': {
    citation: 'NRS 118A.490',
    title: 'Rent Withholding Rights',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Establishes tenant right to withhold rent for landlord violations, with rent deposited into escrow.',
    fullText: `NRS 118A.490 - Rent withheld by tenant upon noncompliance of landlord.

1. If a landlord fails to comply with NRS 118A.290 or 118A.320, and notice of the noncompliance has been given to the landlord in writing, the tenant may:
   (a) Deposit rent which becomes due and owing after such notice into an escrow account; and
   (b) Give written notice to the landlord that the rent has been deposited in the escrow account and will be held in escrow until the landlord complies with the requirements of NRS 118A.290 or 118A.320.

2. When the landlord complies with the provisions of NRS 118A.290 or 118A.320:
   (a) The tenant shall pay the rent in escrow to the landlord; or
   (b) If the landlord refuses to accept the rent, the tenant may deduct the cost of the repairs from the rent in accordance with NRS 118A.355.

3. If a tenant proceeds under this section in bad faith, the landlord may recover actual damages and reasonable attorney's fees.

4. The provisions of this section do not affect any right of the landlord to commence an action for summary eviction or any defense thereto.`,
    relatedSections: ['NRS 118A.290', 'NRS 118A.320', 'NRS 118A.355'],
    practicalTips: [
      'You must put withheld rent in escrow - do not spend it',
      'Give written notice explaining why you are withholding',
      'Keep records of all communications',
      'The landlord can still file for eviction, but you have a defense'
    ]
  },

  'NRS 118A.510': {
    citation: 'NRS 118A.510',
    title: 'Anti-Retaliation Protection',
    chapter: 'Chapter 118A - Landlord and Tenant',
    summary: 'Prohibits landlord retaliation against tenants who exercise their legal rights. Violators pay $2,500 plus actual damages.',
    fullText: `NRS 118A.510 - Retaliatory conduct by landlord against tenant prohibited; remedies.

1. A landlord shall not, in retaliation, terminate a tenancy, refuse to renew a tenancy, increase rent or decrease services to a tenant who has:
   (a) Complained in good faith of a violation of a building, housing or health code to a governmental agency charged with the responsibility for the enforcement of that code;
   (b) Complained in good faith to the landlord of a violation of any of the provisions of this chapter;
   (c) Organized or become a member of a tenant's union or similar organization; or
   (d) Exercised any right or remedy provided by law.

2. If the landlord acts in violation of subsection 1, the tenant is entitled to the remedies provided in NRS 118A.390 and has a defense in any retaliatory action against the tenant for possession.

3. Evidence of retaliation includes but is not limited to:
   (a) The fact that the landlord acted within 90 days after the tenant's action described in subsection 1;
   (b) Evidence of a pattern of harassment by the landlord against the tenant;
   (c) Any other evidence that the landlord's primary motivation was retaliation.

4. If a landlord acts in bad faith in violation of this section, the tenant may recover:
   (a) $2,500 or actual damages, whichever is greater;
   (b) Reasonable attorney's fees and costs.

5. This section does not prevent the landlord from:
   (a) Increasing rent to the rate charged for comparable dwelling units;
   (b) Terminating a tenancy for nonpayment of rent; or
   (c) Terminating a tenancy for a violation of the rental agreement.`,
    relatedSections: ['NRS 118A.390', 'NRS 118A.480'],
    practicalTips: [
      'Keep records of all complaints you make',
      'Any negative action within 90 days of complaint is presumed retaliatory',
      'Joining a tenant union is protected activity',
      'You can recover $2,500 in punitive damages for retaliation',
      'Document the timeline: complaint date vs. landlord action date'
    ]
  },

  // ===== CHAPTER 40: EVICTION PROCEDURES =====

  'NRS 40.251': {
    citation: 'NRS 40.251',
    title: '30-Day Notice to Quit (No-Cause Eviction)',
    chapter: 'Chapter 40 - Actions Concerning Property',
    summary: 'Requires 30-day notice to end a month-to-month tenancy without cause.',
    fullText: `NRS 40.251 - Tenancy at will: Termination by notice; unlawful detainer.

1. Except as otherwise provided in subsection 2, a tenancy at will or by sufferance may be terminated by either party by giving 30 days' notice, in writing, to the other party.

2. The notice must be:
   (a) Served upon the other party at least 30 days before the termination date specified in the notice;
   (b) Specify the date of termination, which must not be earlier than the periodic rental date;
   (c) Be served by:
       (1) Delivering a copy to the tenant personally;
       (2) If the tenant is absent, leaving a copy with a person of suitable age at the tenant's dwelling unit; or
       (3) If no person is available, posting a copy in a conspicuous place on the property and sending a copy by certified mail.

3. If the tenant fails to surrender the premises at the time specified in the notice, the tenant is guilty of an unlawful detainer.

4. The landlord is not required to state a reason for terminating the tenancy.`,
    relatedSections: ['NRS 118A.210', 'NRS 118A.510'],
    practicalTips: [
      'Landlord needs 30 days notice to end month-to-month tenancy',
      'Notice must specify termination date',
      'If within 90 days of complaint, may be retaliation - document everything',
      'Check if your city has additional tenant protections'
    ]
  },

  'NRS 40.253': {
    citation: 'NRS 40.253',
    title: '3-Day Notice for Nonpayment of Rent',
    chapter: 'Chapter 40 - Actions Concerning Property',
    summary: 'Allows 3-day notice to pay rent or quit for nonpayment. Tenant can stay if rent paid within 3 days.',
    fullText: `NRS 40.253 - Unlawful detainer: Supplemental remedy of summary eviction for failure to pay rent.

1. Except as otherwise provided in subsection 9, in addition to the remedy provided in NRS 40.290, when the tenant of any dwelling, apartment, mobile home, recreational vehicle or commercial premises with periodic rent reserved payable monthly or at shorter intervals is in default in payment of the rent, the landlord or the landlord's agent may serve or have served a notice in writing, requiring the tenant:
   (a) To pay the rent which is in default within 7 judicial days after service of the notice; or
   (b) To surrender possession of the premises within 7 judicial days after service of the notice.

2. The notice must:
   (a) Identify the rental agreement;
   (b) State the date on which the rent became due;
   (c) State the amount of rent which is due as of the date of the notice;
   (d) Advise the tenant of the tenant's right to contest the matter by filing, within 7 judicial days after service of the notice, an affidavit with the justice court;
   (e) State the name, address and telephone number of the landlord or landlord's agent.

3. A landlord shall not serve or have served a notice pursuant to this section:
   (a) During any period in which a declaration of emergency is in effect; or
   (b) During any period set forth in a regulation adopted by the Governor.

4. The tenant may, at any time before the entry of a judgment or the issuance of an order for removal by the court, pay the rent in full plus any late fees and court costs to stay the eviction.`,
    relatedSections: ['NRS 40.254', 'NRS 40.290'],
    practicalTips: [
      'You have 7 judicial days (not weekends/holidays) to pay or file response',
      'If you pay the full amount owed, the eviction stops',
      'You can contest the notice by filing an affidavit with the court',
      'Notice must include specific required information'
    ]
  },

  'NRS 40.2514': {
    citation: 'NRS 40.2514',
    title: '5-Day Notice for Lease Violations',
    chapter: 'Chapter 40 - Actions Concerning Property',
    summary: 'Requires 5-day notice to cure lease violations (other than nonpayment) before eviction.',
    fullText: `NRS 40.2514 - Unlawful detainer: Supplemental remedy of summary eviction for breach of lease for term of tenancy.

1. In addition to the remedy provided in NRS 40.290, when the tenant of a dwelling unit with periodic rent reserved payable monthly or at shorter intervals breaches the lease or rental agreement, the landlord may serve or have served a notice in writing requiring the tenant:
   (a) To cure the breach, if possible, within 5 days after service of the notice; or
   (b) To surrender possession of the premises.

2. The notice must:
   (a) Identify the lease provision allegedly violated;
   (b) Describe the breach with reasonable specificity;
   (c) State the action required to cure the breach;
   (d) Advise the tenant of the tenant's right to contest the notice by filing, within 5 days, an affidavit with the justice court.

3. If the breach is curable and the tenant cures the breach within the period specified, the notice becomes void.

4. If the same or a similar breach occurs within 6 months after the first notice, the landlord may serve a 5-day notice to quit without opportunity to cure.`,
    relatedSections: ['NRS 40.2516', 'NRS 40.290'],
    practicalTips: [
      'You have 5 days to fix ("cure") the violation',
      'The notice must specifically describe what you did wrong',
      'If you fix the problem in 5 days, the notice is void',
      'Second similar violation within 6 months = no cure period'
    ]
  },

  'NRS 40.2516': {
    citation: 'NRS 40.2516',
    title: '7-Day Notice for Nuisance/Illegal Activity',
    chapter: 'Chapter 40 - Actions Concerning Property',
    summary: 'Allows 7-day notice for serious violations like illegal activity or nuisance without opportunity to cure.',
    fullText: `NRS 40.2516 - Unlawful detainer: Supplemental remedy of summary eviction for nuisance or illegal activity.

1. In addition to the remedy provided in NRS 40.290, when the tenant of any dwelling:
   (a) Creates a nuisance;
   (b) Is responsible for a condition which constitutes a nuisance; or
   (c) Commits waste of the premises;

   The landlord may serve a notice requiring the tenant to surrender possession of the premises within 7 days.

2. The notice must:
   (a) Describe the nuisance, condition or waste with reasonable specificity;
   (b) State that the rental agreement will terminate in 7 days;
   (c) Advise the tenant of the right to contest by filing an affidavit with the justice court.

3. A nuisance includes but is not limited to:
   (a) Drug-related activity on the premises;
   (b) Activity that makes the premises unsafe;
   (c) Repeated noise violations that disturb neighbors;
   (d) Criminal activity on the premises.

4. There is no right to cure for violations under this section.`,
    relatedSections: ['NRS 40.2514', 'NRS 40.290'],
    practicalTips: [
      'This is for serious violations - no chance to fix',
      'You have 7 days to leave or contest in court',
      'You can file an affidavit to contest the notice',
      'Get legal help immediately if you receive this notice'
    ]
  },

  'NRS 40.290': {
    citation: 'NRS 40.290',
    title: 'Formal Eviction Process',
    chapter: 'Chapter 40 - Actions Concerning Property',
    summary: 'Establishes formal court eviction procedures, requiring landlord to file lawsuit and obtain court order.',
    fullText: `NRS 40.290 - Action for unlawful detainer.

1. A tenant is guilty of an unlawful detainer:
   (a) When the tenant continues in possession after a neglect or failure to perform any condition or covenant of the lease under which the property is held;
   (b) When the tenant continues in possession after default in the payment of rent;
   (c) When the tenant continues in possession after receiving notice to quit.

2. To remove a tenant for unlawful detainer, the landlord must:
   (a) File a complaint in the appropriate court;
   (b) Serve the tenant with a summons and complaint;
   (c) Allow the tenant to file an answer;
   (d) Attend a court hearing;
   (e) Obtain a court order for eviction.

3. Only a constable or sheriff may physically remove a tenant from the premises.

4. The landlord may not:
   (a) Change the locks;
   (b) Remove the tenant's property;
   (c) Shut off utilities;
   without first obtaining a court order.

5. The tenant has the right to:
   (a) Contest the eviction in court;
   (b) Present defenses, including habitability violations;
   (c) Request a jury trial for certain matters.`,
    relatedSections: ['NRS 40.253', 'NRS 40.2514', 'NRS 40.2516'],
    practicalTips: [
      'Only a court can order your eviction',
      'Only sheriff/constable can physically remove you',
      'Self-help eviction (lock changes, utility shutoffs) is illegal',
      'You have the right to go to court and defend yourself',
      'Habitability problems can be a defense to eviction'
    ]
  },
};

// Helper to find legislation by citation
export function findLegislation(citation: string): LegislationSection | undefined {
  // Normalize the citation (remove extra spaces, handle case variations)
  const normalized = citation.toUpperCase().replace(/\s+/g, ' ').trim();

  // Try exact match first
  if (nevadaLegislation[normalized]) {
    return nevadaLegislation[normalized];
  }

  // Try to find partial match
  for (const key of Object.keys(nevadaLegislation)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return nevadaLegislation[key];
    }
  }

  return undefined;
}

// Regex pattern to match NRS citations
export const NRS_PATTERN = /NRS\s+(\d+[A-Z]?)\.(\d+)/gi;

// Extract all NRS citations from text
export function extractNRSCitations(text: string): string[] {
  const citations: string[] = [];
  let match;
  const pattern = new RegExp(NRS_PATTERN.source, 'gi');
  while ((match = pattern.exec(text)) !== null) {
    citations.push(match[0].toUpperCase().replace(/\s+/g, ' '));
  }
  return citations;
}

// Get all available legislation citations
export function getAllCitations(): string[] {
  return Object.keys(nevadaLegislation);
}
