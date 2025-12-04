# Phase 1.1 Data Quality Assessment Report
**Comprehensive Analysis of Organizing Intelligence Implementation**

Generated: 2025-09-09  
Assessment Scope: Washoe County Property Data & Corporate Landlord Analysis  
Planning Documents Reference: Building a Comprehensive Tenant Organizing Platform for Reno-Sparks.pdf

## Executive Summary

**CRITICAL FINDING**: Our Phase 1.1 implementation contains significant data quality issues that would severely compromise tenant organizing campaigns. While we successfully collected comprehensive property data (192,463 parcels), **systematic extraction errors have rendered our corporate landlord analysis unreliable**.

**Bottom Line**: Current data quality is **insufficient for organizers to rely on for campaigns** and must be fixed before scaling to Clark County.

---

## 1. Critical Data Quality Gaps

### 1.1 Corporate Landlord Identification FAILURE

**Issue**: Final report shows "0 corporate landlords" despite having extensive corporate entities in database

**Root Cause**: Data extraction pipeline failure
- Raw JSON data contains owner information: `"FIRSTNAME": "TOLL NORTH RENO", "LASTNAME": "LLC"`
- Extraction to `owner_name` column failed (0 records populated)
- Final analysis script queries empty `owner_name` column instead of raw JSON

**Impact on Organizing**:
- Organizers cannot identify multi-property landlords for portfolio campaigns
- No targeting data for corporate entities owning hundreds of units
- Missing network analysis of ownership concentration

**Evidence**:
```
Database Reality: 15+ major corporate landlords identified
- TOLL NORTH RENO LLC: 534 properties
- MG LAKERIDGE LIVING APARTMENTS LLC: 440 properties  
- GAGE VILLAGE COMMERCIAL DEV LLC: 361 properties
- SWD-QUARRY BSV LLC: 341 properties

Report Output: "0 corporate landlords"
Report Conclusion: "0.0% corporate concentration ratio"
```

### 1.2 Property Boundary & Geographic Data Quality

**Current State**: Unknown accuracy
- No validation against surveyed property boundaries
- No cross-reference with actual building footprints
- Centroid coordinates present but accuracy unverified

**Risk to Organizing**:
- Inaccurate addresses could misdirect organizing efforts
- Geographic clustering analysis may be based on incorrect locations
- Door-to-door canvassing could fail due to address errors

### 1.3 Unit Count Reliability

**Current Implementation**: Industry estimates applied to assessor data
- Single-family: 35% assumed rental (industry standard)
- Multi-family: 95% assumed rental (industry standard)
- Unit counts from assessor database (unverified)

**Missing Validation**:
- No cross-reference with building permits
- No verification against actual occupancy data
- No comparison with utility connection records

---

## 2. Systematic Errors in Organizing Intelligence

### 2.1 Corporate Ownership Network Mapping BROKEN

**Planning Document Requirement**: "Property portfolio tracking for multi-property landlords"

**Implementation Gap**: 
- Database contains ownership data but extraction pipeline fails
- Network analysis impossible due to data extraction errors
- Portfolio campaigns cannot be planned without reliable ownership data

### 2.2 Organizing Priority Scoring Invalid

**Current Scoring**: Based on estimated rental units without corporate ownership context

**Missing Components**:
- Corporate entity identification (broken)
- Actual tenant count verification
- Market manipulation indicators
- Legal violation history

**Result**: Priority scoring lacks critical corporate landlord context

### 2.3 Legal Aid Integration Data Insufficient

**Planning Document Requirement**: "Evidence collection meeting legal standards"

**Current State**: Property ownership data only
- No eviction case history integration
- No housing violation records
- No tenant complaint databases
- No verification of ownership claim accuracy

---

## 3. Comparison Against Organizer Needs

### 3.1 What Organizers Actually Need vs. What We Provide

**Organizer Requirements** (from planning document):
1. **Multi-property landlord identification** → BROKEN (0 corporate landlords identified)
2. **Property portfolio tracking** → BROKEN (no portfolio analysis possible)
3. **Corporate ownership networks** → BROKEN (extraction pipeline failure)
4. **Evidence meeting legal standards** → INSUFFICIENT (no verification processes)
5. **Integration with legal aid referral** → MISSING (no legal aid data)

**What We Currently Provide**:
- Total property counts ✓
- Estimated rental units ✓ (unverified)
- Individual property data ✓
- Geographic coordinates ✓ (unverified accuracy)

### 3.2 Campaign Planning Reliability

**For Successful Tenant Campaigns, Organizers Need**:
- Verified property ownership (to identify real landlord)
- Accurate tenant counts (for power analysis)
- Portfolio scope (for coordinated campaigns)
- Legal standing data (for legal strategy)

**Our Current Data Reliability**:
- Property ownership: BROKEN (extraction failure)
- Tenant counts: ESTIMATED ONLY (no verification)
- Portfolio analysis: IMPOSSIBLE (due to extraction failure)
- Legal standing: NOT AVAILABLE

---

## 4. Validation Processes for Phase 1.1.1

### 4.1 Immediate Data Repair (Priority 1)

**Fix Corporate Landlord Extraction Pipeline**:
```python
# CRITICAL FIX NEEDED
# Current broken query:
WHERE owner_name IS NOT NULL  # Always returns 0 records

# Correct implementation:
WHERE json_extract(raw_attributes, '$.LASTNAME') IS NOT NULL
```

**Validation Steps**:
1. Re-run corporate landlord analysis using JSON extraction
2. Cross-reference against Nevada Secretary of State business registry
3. Verify top 10 corporate landlords through public records
4. Validate property counts per corporate entity

### 4.2 Data Accuracy Verification (Priority 2)

**Address Verification System**:
- Implement Smarty Address Verification API ($0.60-$0.80/1000 requests)
- Cross-reference with USPS address database
- Validate top 100 organizing targets through street-view verification

**Ownership Verification Process**:
- Sample validation of top 20 corporate landlords
- Secretary of State business entity lookup
- County recorder deed verification for disputed ownership

**Unit Count Verification**:
- Building permit cross-reference for properties >50 units
- Utility connection record comparison
- Sample field verification for major complexes

### 4.3 Legal Standards Compliance (Priority 3)

**Evidence Quality Standards**:
- Implement chain of custody for all data collection
- Document data source provenance
- Create audit trail for all data transformations
- Legal reviewer approval for organizing target lists

---

## 5. Recommendations for Campaign Reliability

### 5.1 Before Any Organizing Campaign

**Data Quality Gates**:
1. ✅ Corporate landlord identification verified through business registry
2. ✅ Property ownership confirmed through county records  
3. ✅ Address accuracy validated through postal service
4. ✅ Unit counts verified through building permits or field verification
5. ✅ Legal review completed for all targeting data

### 5.2 Risk Mitigation for Organizers

**High-Risk Data Usage**:
- Never use unverified corporate landlord data for confrontational campaigns
- Always verify ownership before legal challenges
- Cross-reference major property data before tenant committee formation

**Safe Data Usage**:
- Use verified individual property data for initial outreach
- Use geographic clustering for neighborhood organizing
- Use aggregate statistics for policy advocacy

---

## 6. Clark County Scaling Readiness Assessment

### 6.1 Current Readiness: NOT READY

**Blockers for Scaling**:
1. **Critical data extraction pipeline failure** must be resolved
2. **No validation processes** implemented
3. **Systematic errors** in corporate landlord analysis
4. **Unverified data quality** throughout system

### 6.2 Prerequisites for Clark County

**Before Clark County Implementation**:
1. ✅ Fix Washoe County corporate landlord extraction
2. ✅ Implement validation processes
3. ✅ Verify data accuracy for top 50 organizing targets
4. ✅ Establish legal standards compliance
5. ✅ Document reliable data collection methodology

**Timeline Impact**: 2-3 weeks additional development before Clark County scaling

---

## 7. Immediate Action Plan

### Phase 1.1.1 - Critical Data Repair (Week 1)

**Day 1-2**: Fix corporate landlord extraction pipeline
- Repair JSON extraction queries
- Re-run corporate landlord analysis
- Validate top 10 corporate entities

**Day 3-5**: Implement basic validation
- Smarty Address API integration  
- Secretary of State business lookup
- Sample ownership verification

**Day 6-7**: Quality assurance testing
- Re-run organizing intelligence report
- Verify corporate landlord portfolio analysis
- Test data accuracy for campaign planning

### Phase 1.1.2 - Validation Implementation (Week 2)

**Data Quality Infrastructure**:
- Automated validation pipelines
- Legal standards documentation
- Audit trail implementation
- Quality gates for organizing campaigns

---

## 8. Success Metrics for Phase 1.1.1

### 8.1 Data Quality Targets

**Corporate Landlord Analysis**:
- ✅ 15+ major corporate landlords identified and verified
- ✅ Portfolio analysis functional for top 10 landlords
- ✅ Ownership verification for properties >100 units

**Address Accuracy**:
- ✅ 95%+ address verification success rate
- ✅ <5% false positive rate for organizing targets
- ✅ Geographic clustering validated through field verification

### 8.2 Organizing Campaign Readiness

**Legal Standards**:
- ✅ Data meets evidentiary standards for legal challenges
- ✅ Chain of custody documented for all organizing data
- ✅ Legal aid integration functional

**Organizer Confidence**:
- ✅ Organizers can rely on data for campaign planning
- ✅ Portfolio campaigns possible against verified corporate landlords
- ✅ Risk mitigation processes protect organizers from bad data

---

## Conclusion

**Phase 1.1 achieved comprehensive data collection but failed at critical data extraction and validation**. The "0 corporate landlords" finding reveals systematic pipeline failures that would severely compromise organizing campaigns.

**Immediate repair is essential before scaling to Clark County or launching any organizing campaigns based on this data.**

The good news: **the underlying data exists and is comprehensive**. The corporate landlords are in the database - we just need to fix the extraction pipeline and implement proper validation processes.

**Recommendation: Invest 2-3 weeks in Phase 1.1.1 data quality improvements before any scaling or campaign launch.**