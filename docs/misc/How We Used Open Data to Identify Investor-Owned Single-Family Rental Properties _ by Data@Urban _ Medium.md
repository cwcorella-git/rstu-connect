# How We Used Open Data to Identify Investor-Owned Single-Family Rental Properties _ by Data@Urban _ Medium

*Converted from: `./How We Used Open Data to Identify Investor-Owned Single-Family Rental Properties _ by Data@Urban _ Medium.pdf`*  
*Total pages: 19*  
*File size: 5592839 bytes*  
*Converted: Mon Sep  8 02:05:01 PM PDT 2025*

---

## Page 1

### Figures and Images (6 found)

#### Figure: img-000.png
![Figure from page 1](images/page_001_content/img-000.png)

#### Figure: img-001.png
![Figure from page 1](images/page_001_content/img-001.png)

#### Figure: img-002.png
![Figure from page 1](images/page_001_content/img-002.png)

#### Figure: img-003.png
![Figure from page 1](images/page_001_content/img-003.png)

#### Figure: img-004.png
![Figure from page 1](images/page_001_content/img-004.png)

#### Figure: img-005.png
![Figure from page 1](images/page_001_content/img-005.png)

---

### Complete Page View
![Page 1 Complete](images/page_001_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...                https://urban-institute.medium.com/how-we-used-open-...



          Open in app                                                                              Sign up   Sign in


                                         Search


                                                  Writing is for everyone.
                                                  Register for Medium Day




                                        Illustration by Cheri Marshall for the Urban Institute



          How We Used Open Data to Identify Investor-
          Owned Single-Family Rental Properties
          Lessons Learned from Exploring the Landscape of Landlords in the Twin Cities

          9 min read · Jul 1, 2021

                 Data@Urban          Follow



                 Listen              Share



          In North Minneapolis, renters living in single-family homes owned by real estate
          investment trusts and private equity firms reported poor housing conditions,
          unexpected fees, and unresponsive management staff. Many of the tenants are also
          preparing to fight eviction filings from these owners that they worry will follow the
          end of state and city eviction moratoriums passed during the COVID-19 pandemic.
          These tenants are not alone. Having an investor or corporation as a landlord has
          become increasingly common, with nearly 40 percent of all rental units nationwide



1 of 19                                                                                                      9/8/25, 12:23 PM
```

---

## Page 2

### Complete Page View
![Page 2 Complete](images/page_002_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...



          owned by anonymous shell entities.

          Researchers, housing advocates, and politicians aiming to promote equitable
          housing and economic recovery are concerned that the growth of speculative
          investment in single-family homes will exacerbate racial inequity in the housing
          market for both homeowners and tenants. Our team partnered with organizations in
          the Twin Cities to conduct research that would support their agendas for informed
          and equitable housing policy decisionmaking. The Twin Cities already has the
          country’s largest racial homeownership gap and a rental market that is unaffordable
          for low-income renters and renters of color.

          These investors often form anonymous shell entities, like limited liability
          companies (LLCs) and limited partnerships (LPs), making it nearly impossible to
          track down who is behind these investments. The lack of legally mandated
          transparent ownership data has implications for housing research and policy. It is
          difficult to discern the individuals behind these single-family rental purchases and
          to determine where and to what extent this investment occurs at the local level.

          Our partners at the Alliance, the Family Housing Fund, and the Center for Economic
          Inclusion wanted property- and neighborhood-level trends to advocate for equitable
          and targeted policy solutions. We worked with researchers at the Center for Urban
          and Regional Affairs (CURA) in Minneapolis to use publicly available county
          assessment data to identify LLC and corporate single-family rental owners in
          Hennepin and Ramsey Counties in 2005, 2010, 2015, and 2020.

          We created new key ownership variables, including “form of ownership,” “owner
          location,” and “portfolio size.” We found that the share of corporate-owned single-
          family rentals more than tripled between 2005 and 2020, from 4 percent to 14
          percent. We demonstrated that these investor-owned single-family rentals were
          disproportionately located in neighborhoods with higher shares of residents of color
          and low-income residents.

          We outline key lessons below in hopes that they might be useful to researchers,
          advocates, and organizations interested in understanding their landscape of
          landlords.



2 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 3

### Complete Page View
![Page 3 Complete](images/page_003_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...




          Lessons learned from attempting to disentangle the web of corporate
          landlords in the Twin Cities:
          1. Partner with local leaders to create analyses that support ongoing research and
          organizing efforts

          Renters, housing organizers and advocates, and local researchers are housing
          experts. They understand their local housing markets, the landscape of landlords,
          and the equity implications of shifting trends, so we partnered with CURA, a local
          research organization. Its input and support were vital to making our analysis
          relevant to research and advocacy in the Twin Cities region. Our teams created the
          key search terms list and code we used to text-mine the assessment data. For
          example, CURA suggested including the name of the nonprofit developer Urban
          Homeworks in the nonprofit class, excluding properties owned by utility companies
          and those owned by private education institutions like the University of Minnesota,
          all seen in the ownership class keyword code below. These iterative conversations
          helped flag key investor-owners in the region that our initial text mining would have
          missed. The conversations also minimized the possibility of accidentally classifying
          owners like local nonprofits or public housing authorities as investors.

          Below is the R script we used to examine property records from both counties to
          identify and categorize investor-owners of single-family homes.




3 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 4

### Complete Page View
![Page 4 Complete](images/page_004_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...




          CURA and our partners were also interested in understanding where these landlords
          were located in relation to their property holdings. Their researchers had heard
          anecdotally that corporate landlord absenteeism made repair requests and positive
          landlord-tenant relationships difficult. We used geocoded taxpayer addresses using
          Urban’s geocoder to get an approximate location for each parcel owner and to create
          a clean and unified owner address field. Property tax records often have data entry
          errors, such as misspellings, and the many departments involved in the data



4 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 5

### Complete Page View
![Page 5 Complete](images/page_005_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...



          collection might not be compatible or consistent. Geocoding our taxpayer data thus
          reduced the number of unique owner addresses of single-family rentals in 2020
          from 520,000 to 476,000.

          Geocoding the taxpayer addresses helped us highlight transfers of wealth, in the
          form of rent, from low-income neighborhoods and neighborhoods of color to
          investors outside the region. But our partners also emphasized that local ownership
          did not equate to equitable economic growth. We used this feedback to create a
          subanalysis that evaluated intraregional ownership trends and found that 25 percent
          of local single-family rental owners lived in high-income majority-white
          neighborhoods, while only 16 percent lived in neighborhoods with high shares of
          low-income residents or residents of color. This knowledge-sharing partnership
          made our analysis more relevant to local concerns about inequitable capital flows.

          1. Identify gaps and supplementary data sources early on

          We found gaps in data quality and completeness in the parcel assessment data
          between counties and over time for important variables, like those that specified
          parcel unit count. There was also no variable for designating whether a parcel was a
          rental property. This meant we had to use parcel assessment data to identify
          institutional owners and to determine whether a parcel was even a single-family
          home or a single-family rental property. We initially considered increasing the data
          accuracy by shrinking the geographic scope to cover only a point-in-time snapshot
          in Minneapolis or St. Paul, but our partners emphasized the importance of
          understanding changes in investor ownership over time and particularly in first-
          ring suburbs.

          Conversations with the Hennepin and Ramsey county assessor and property tax
          division offices gave us background on tax exemptions in the data, like
          homesteading, that we used to determine whether a parcel was likely a rental
          property. We then worked with CURA to create a proxy variable for designating
          properties as rentals using information about owner and taxpayer addresses, the
          homestead tax exemption, and land-use designations, which allowed us to generally
          know whether a parcel was an owner-occupied single-family home or a likely rental.
          We refined the accuracy of this proxy by testing it against a rental property license


5 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 6

### Complete Page View
![Page 6 Complete](images/page_006_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...         https://urban-institute.medium.com/how-we-used-open-...



          dataset in Minneapolis and rental registration data in St. Paul and by comparing our
          estimates with those produced by the US Census Bureau.


                                   Get Data@Urban’s stories in your inbox
                                  Join Medium for free to get updates from this writer.


                                       Enter your email


                                                       Subscribe




          2. Use clustering and fuzzy matching to make manual cleaning less painful

          The most difficult task was trying to disentangle the web of LLCs, LPs, and real
          estate investment trusts. Investor owners frequently create these shell entities that
          make understanding the true size and scope of their portfolio difficult. For example,
          Invitation Homes, formerly owned by Blackstone, had multiple owner and taxpayer
          names (e.g., “IH3 Property Minnesota LP,” “IH2 Property Illinois LP,” and “IH4
          Property Minnesota LP”) associated with a single taxpayer address in Dallas.
          Manually cleaning ownership information for tens of thousands of parcels was not
          feasible and would have taken a lot of time, so we used other string manipulation
          approaches to determine the extent of the portfolio of these investor owners.

          After conducting some baseline cleaning, we used fuzzy matching to reduce the
          number of slight variations between the recorded owner name and taxpayer name
          in the assessor data. We used the Jaro-Winkler (JW) method in the R stringdist
          package to produce a measure between 0 and 1 for each owner and taxpayer name
          pair, with 0 being an exact match and 1 meaning there is no similarity between the
          names. Jaro-Winkler is commonly used to compare short strings, like names, where
          scores are based on character similarity, spacing, and distance, along with
          weighting for differences at the beginning and end of strings. We then manually
          created JW score cutoffs for landlord names in each year by eyeing which score
          seemed to be a conservative cutoff between different spellings and different owners.

          You can see an example of similar owner name and taxpayer names, along with JW


6 of 19                                                                                              9/8/25, 12:23 PM
```

---

## Page 7

### Figures and Images (2 found)

#### Figure: img-000.png
![Figure from page 7](images/page_007_content/img-000.png)

#### Figure: img-001.png
![Figure from page 7](images/page_007_content/img-001.png)

---

### Complete Page View
![Page 7 Complete](images/page_007_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...



          scores, in in the table below. Our team would have used matches with JW scores less
          than 0.216667, highlighted in red below, for our conservative cutoff, even though
          other owners and taxpayers were likely the same.




          A part of the R code we used to fuzzy-match is below.




7 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 8

### Complete Page View
![Page 8 Complete](images/page_008_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...




          Then, we used a basic unsupervised cluster method to further decrease the number
          of names within our new “clean_name” variable. We started by creating a distance
          matrix using the Jaro-Winkler edit distance metric. Then, we used an unsupervised
          machine learning algorithm called hierarchical clustering. This algorithm started by
          treating each clean name as its own individual cluster and gradually combined
          increasingly similar names into larger clusters until it reached our predefined
          number of clusters. We shifted our cluster count (K in the code below) until we saw



8 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 9

### Complete Page View
![Page 9 Complete](images/page_009_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...



          that the names within each cluster were likely to be a single owner.




          The R script example below was done using a base data table of landlord names for
          all likely rental properties in both counties in a single year and allowed us to reduce
          the number of unique landlord names from 11,089 to 10,500.

          As a last step, we looked through the data and created a few additional manual
          cleaning rules, like grouping by taxpayer address, to reduce the number of
          variations and to more accurately understand how many properties were in an


9 of 19                                                                                        9/8/25, 12:23 PM
```

---

## Page 10

### Complete Page View
![Page 10 Complete](images/page_010_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...



           owner’s portfolio. This was important because we created a cutoff for “corporate
           ownership” that excluded small-scale owners with fewer than three total properties.

           This preliminary analysis gave us a broad understanding of where and when
           investor owners bought single-family rentals, but there were limitations in our data
           cleaning and analysis. Our text mining and clustering methods could not be tested
           for accuracy because it was an unsupervised method. Our team is sure there were
           missing keywords in our word search, owner name spelling variations, and missing
           data that likely made our estimates of the scope and scale of investor ownership
           conservative. We also know that our lack of a concrete rental property designation
           variable limits what we can say about this phenomenon. We hope others can refine
           our methods or potentially pair these data with other sources, like rental licenses,
           eviction records, and actual rent data, to better understand the actual implications
           and outcomes for renters in these properties.

           Advocates and policymakers need data like these to make more informed, equitable,
           and targeted housing policies. Housing policies, like taxes or caps on single-family
           rental portfolios of a certain size or rent control based on total properties owned,
           are only as effective as the data used to enforce them. Until clear enunciation of
           property ownership is legally required to be publicly accessible, we hope our
           preliminary techniques and approaches can help others looking to understand their
           landscape of landlords. While there were limitations, especially our use of publicly
           available assessment data,[1] we hope this can build on efforts to increase rental
           property ownership transparency for renters. Renters deserve to know who is
           responsible and should be held accountable for their properties.

           [1] NOTICE: The Geographic Information System (GIS) Data to which this notice is
           attached are made available pursuant to the Minnesota Government Data Practices
           Act (Minnesota Statutes Chapter 13). THE GIS DATA ARE PROVIDED TO YOU AS IS
           AND WITHOUT ANY WARRANTY AS TO THEIR PERFORMANCE,
           MERCHANTABILITY, OR FITNESS FOR ANY PARTICULAR PURPOSE. The GIS Data
           were developed by the counties of Anoka, Carver, Dakota, Hennepin, Ramsey, Scott
           and Washington and the Metropolitan Council for their own internal business
           purposes. These organizations do not represent or warrant that the GIS Data or the
           data documentation are error-free, complete, current, or accurate. You are


10 of 19                                                                                       9/8/25, 12:23 PM
```

---

## Page 11

### Figures and Images (2 found)

#### Figure: img-000.png
![Figure from page 11](images/page_011_content/img-000.png)

#### Figure: img-001.png
![Figure from page 11](images/page_011_content/img-001.png)

---

### Complete Page View
![Page 11 Complete](images/page_011_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...     https://urban-institute.medium.com/how-we-used-open-...



           responsible for any consequences resulting from your use of the GIS Data or your
           reliance on the GIS Data. You should consult the data documentation for this
           particular GIS Data to determine the limitations of the GIS Data and the precision
           with which the GIS Data may depict distance, direction, location, or other
           geographic features. If you transmit or provide the GIS Data (or any portion of it) to
           another user, it is recommended that the GIS Data include a copy of this disclaimer
           and metadata.

           WARRANTY AS TO THEIR PERFORMANCE, MERCHANTABILITY, OR FITNESS FOR
           ANY PARTICULAR PURPOSE. The GIS Data were developed by the counties of
           Anoka, Carver, Dakota, Hennepin, Ramsey, Scott and Washington and the
           Metropolitan Council for their own internal business purposes. These organizations
           do not represent or warrant that the GIS Data or the data documentation are error-
           free, complete, current, or accurate. You are responsible for any consequences
           resulting from your use of the GIS Data or your reliance on the GIS Data. You should
           consult the data documentation for this particular GIS Data to determine the
           limitations of the GIS Data and the precision with which the GIS Data may depict
           distance, direction, location, or other geographic features. If you transmit or
           provide the GIS Data (or any portion of it) to another user, it is recommended that
           the GIS Data include a copy of this disclaimer and metadata.

           -Eleanor Noble

           -Yipeng Su

           -Yonah Freemark

           Want to learn more? Sign up for the Data@Urban newsletter.

             Open Data      Landlords    Rental Property    Minneapolis      Real Estate




11 of 19                                                                                         9/8/25, 12:23 PM
```

---

## Page 12

### Figures and Images (3 found)

#### Figure: img-000.png
![Figure from page 12](images/page_012_content/img-000.png)

#### Figure: img-001.png
![Figure from page 12](images/page_012_content/img-001.png)

#### Figure: img-002.png
![Figure from page 12](images/page_012_content/img-002.png)

---

### Complete Page View
![Page 12 Complete](images/page_012_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...              https://urban-institute.medium.com/how-we-used-open-...



                                                                                                             Follow



           Written by Data@Urban
           2.3K followers · 57 following

           Data@Urban is a place to explore the code, data, products, and processes that bring Urban Institute
           research to life.




           No responses yet

                  Write a response


            What are your thoughts?




           More from Data@Urban




12 of 19                                                                                                         9/8/25, 12:23 PM
```

---

## Page 13

### Figures and Images (5 found)

#### Figure: img-000.png
![Figure from page 13](images/page_013_content/img-000.png)

#### Figure: img-001.png
![Figure from page 13](images/page_013_content/img-001.png)

#### Figure: img-002.png
![Figure from page 13](images/page_013_content/img-002.png)

#### Figure: img-003.png
![Figure from page 13](images/page_013_content/img-003.png)

#### Figure: img-004.png
![Figure from page 13](images/page_013_content/img-004.png)

---

### Complete Page View
![Page 13 Complete](images/page_013_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...         https://urban-institute.medium.com/how-we-used-open-...




               Data@Urban


           Choosing the Right OCR Service for Extracting Text Data
           Optical character recognition, or OCR, is a key tool for people who want to build or collect text
           data. OCR uses machine learning to…

           Mar 25, 2022     19




13 of 19                                                                                               9/8/25, 12:23 PM
```

---

## Page 14

### Figures and Images (5 found)

#### Figure: img-000.png
![Figure from page 14](images/page_014_content/img-000.png)

#### Figure: img-001.png
![Figure from page 14](images/page_014_content/img-001.png)

#### Figure: img-002.png
![Figure from page 14](images/page_014_content/img-002.png)

#### Figure: img-003.png
![Figure from page 14](images/page_014_content/img-003.png)

#### Figure: img-004.png
![Figure from page 14](images/page_014_content/img-004.png)

---

### Complete Page View
![Page 14 Complete](images/page_014_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...          https://urban-institute.medium.com/how-we-used-open-...


               Data@Urban


           Exploring AI: How Urban Is Piloting Guidelines around Using AI in Our
           Research and Policy Work
           Everyone I talk to these days is thinking about artificial intelligence (AI). My peers at research
           organizations, nonprofits, government…

           May 23, 2024     8




               Data@Urban


           Designing a New Access Measure for the Spatial Equity Data Tool API
           The Urban Institute’s Spatial Equity Data Tool (SEDT) is a free, powerful software that allows
           users to upload point spatial data — such as…

           Feb 25     61




14 of 19                                                                                                 9/8/25, 12:23 PM
```

---

## Page 15

### Figures and Images (3 found)

#### Figure: img-000.png
![Figure from page 15](images/page_015_content/img-000.png)

#### Figure: img-001.png
![Figure from page 15](images/page_015_content/img-001.png)

#### Figure: img-002.png
![Figure from page 15](images/page_015_content/img-002.png)

---

### Complete Page View
![Page 15 Complete](images/page_015_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...       https://urban-institute.medium.com/how-we-used-open-...




               Data@Urban


           Using Multiprocessing to Make Python Code Faster
           Everyone could use more time, especially here at the Urban Institute, where researchers
           regularly analyze large datasets. Because we can’t…

           Sep 18, 2018     1.6K   8




                                               See all from Data@Urban




           Recommended from Medium




15 of 19                                                                                             9/8/25, 12:23 PM
```

---

## Page 16

### Figures and Images (4 found)

#### Figure: img-000.png
![Figure from page 16](images/page_016_content/img-000.png)

#### Figure: img-001.png
![Figure from page 16](images/page_016_content/img-001.png)

#### Figure: img-002.png
![Figure from page 16](images/page_016_content/img-002.png)

#### Figure: img-003.png
![Figure from page 16](images/page_016_content/img-003.png)

---

### Complete Page View
![Page 16 Complete](images/page_016_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...      https://urban-institute.medium.com/how-we-used-open-...




               In Runner's Life by Stephen Hands


           The Mid-Run Form Check
           The simple habit that can prevent injury and make you a better runner

           4d ago     16      1




16 of 19                                                                                          9/8/25, 12:23 PM
```

---

## Page 17

### Figures and Images (3 found)

#### Figure: img-000.png
![Figure from page 17](images/page_017_content/img-000.png)

#### Figure: img-001.png
![Figure from page 17](images/page_017_content/img-001.png)

#### Figure: img-002.png
![Figure from page 17](images/page_017_content/img-002.png)

---

### Complete Page View
![Page 17 Complete](images/page_017_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...                        https://urban-institute.medium.com/how-we-used-open-...


               Nikulsinh Rajput


           DuckDB: The Future of Lightweight Analytics
           A zero-ops, in-process OLAP engine that turns files into fast answers — right on your laptop or
           inside your app.

               2d ago        1




               In Artificial Intelligence in Plain English by Vipul Thukral


           AI-driven Dispatch Planning & Optimisation System
           Introduction

               Jun 22        253




17 of 19                                                                                                            9/8/25, 12:23 PM
```

---

## Page 18

### Figures and Images (3 found)

#### Figure: img-000.png
![Figure from page 18](images/page_018_content/img-000.png)

#### Figure: img-001.png
![Figure from page 18](images/page_018_content/img-001.png)

#### Figure: img-002.png
![Figure from page 18](images/page_018_content/img-002.png)

---

### Complete Page View
![Page 18 Complete](images/page_018_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...   https://urban-institute.medium.com/how-we-used-open-...




              Tracy Cranford


           Little Owl
           When little girls grow up and move away

               Aug 15     1.1K   18




18 of 19                                                                                       9/8/25, 12:23 PM
```

---

## Page 19

### Figures and Images (3 found)

#### Figure: img-000.png
![Figure from page 19](images/page_019_content/img-000.png)

#### Figure: img-001.png
![Figure from page 19](images/page_019_content/img-001.png)

#### Figure: img-002.png
![Figure from page 19](images/page_019_content/img-002.png)

---

### Complete Page View
![Page 19 Complete](images/page_019_full.png)

### Extracted Text

```
How We Used Open Data to Identify Investor-Owned Si...              https://urban-institute.medium.com/how-we-used-open-...


               In Coding Nexus by Civil Learning


           I Handed ChatGPT $100 to Trade Stocks—Here’s What Happened in 2
           Months.
           What happens when you let a chatbot play Wall Street? It’s up 29% while the S&P 500 lags at
           4%.

               5d ago       384       2




               In Grief Book Club by Dana Lyn


           How I Became the Collateral Damage of My Family
           Putting the broken parts of me into a life that I love

               6d ago       54




                                                   See more recommendations




19 of 19                                                                                                  9/8/25, 12:23 PM
```

---

