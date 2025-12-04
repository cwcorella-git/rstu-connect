## Tenant Union Federation (TUF)
                                    2024 Database of Government-Sponsored Enterprise (GSE) Properties
Database Overview This database represents our best estimate of every property in the US that has active mortgage financing from one of the GSEs, Freddie Mac or Fannie Mae. In total, there are over 62,000 properties in this database, representing close to 8 million units. The data comes from two sources: Freddie Mac's Multifamily Services Investor Access portal (https://fm-msia.com/) and Fannie Mae's DUS Disclose portal (https://mfdusdisclose.fanniemae.com/). GSEs Overview Freddie Mac and Fannie Mae do not themselves originate mortgages to landlords, but instead purchase mortgagaes that are originated by third-party lenders. The GSEs then package groups of the mortgages they acquire into "securitized pools", or financial instruments that investors can invest in, at different levels of risk and reward. These instruments are known as commercial mortgage-backed securities (CMBS), as rental housing is considered 'commercial real estate', like office, industrial, or retail properties. Over the years, a growing percentage of all landlord mortgages have been bought and packaged into CMBS by Freddie and Fannie; as of 2024, the GSEs account for close to half of all active multifamily mortgage debt. Using the Database The purpose of this database is to help local tenant organizing groups identify GSE-financed properties by geography. To filter by geographic columns, like state, city, county, or zip code, click on the dropdown for a column, uncheck "(Select All)" and then click on all the specific geographies you want to see, which you can find either by scrolling or by entering the category into the search bar of the dropdown. In the future, we will be providing additional database that can connect to this one, with more information about the loans these properties received and how landlords operate them. Important Notes (i) This data was compiled in May 2024, and identifies all multifamily mortgages actively held by Freddie Mac or Fannie Mae. However, loans can get paid off or landlords find new financing from a non-GSE lender at any time. To be certain about whether a property is GSE-backed, use the portals linked in the 'Database Overview'. (ii) This spreadsheet is protected, meaning that users are limited to certain functions, which helps ensure that the data stays in the correct format. If you need to be able to edit the sheet, you can unprotect it with the password 'tufstuff'. (iii) There are duplicate addresses in the data, which come up when one property has received multiple loans from the GSEs. In this case, you should see each row of the address associated with a unique Loan ID. (iv) You will sometimes find missing data or seemingly incorrect data. These are a result of imperfections in the data sources that we pull from, and can often be investigated by searching for details about the property online.

## DATA DICTIONARY

         Column Name Column Description
        Fannie / Freddie Whether the mortgage on the property is held by Fannie Mae or Freddie Mac.
             Deal ID
                                   The securitized pool that the mortgage has been placed into. This is also known as a "Transaction ID" in the Freddie and Fannie data portals.
             Loan ID The unique identified provided to the mortgage within the Freddie and Fannie securitized pools. Fannie calls these identifiers CUSIPs, and
## Freddie calls them Loan IDs.
         Property Name The name of the property that received the mortgage.
          Full Address The full address of the property, which is a combination of the below four columns.
            Address The street number and street name of the property.
            City The city where the property is located.
            State The state where the property is located.
          Zip Code The zip code where the property is located.
           County The county where the property is located.
          Year Built The year the property was built.
           # Units The number of residential units in the property.
                                 For Fannie mortgages, we are able to identify a number of categories for the property, including whether it receives any additional
                                 government subsidy. These are noted here. For Freddie mortgages, no such data exists. However, Freddie loans are securitized by program,
        Property Type so the Deal ID is often an indicator of the kind of property being loaned to. See this link for detail about Freddie Mac's loan programs: https:
## //mf.freddiemac.com/investors/presentations.

                                 The assumed value of the property when the mortgage was originated. This is a useful indicator, especially when divided by the number of
       Property Value units, to think through how the landlord and lender understood the financial potential of the property, especially when compared to other
## rental housing in the same area or city.
                                 The total mortgage amount provided to the landlord at the time the mortgage was issued. NOTE: If loan principals seem abnormally large,
Loan Principal at Issuance this may be the result of a "portfolio loan", or a loan issued across multiple properties. In these cases, it is best to look up the properties on
## the investor portals linked above.

                                 The total principal of the mortgage that remains unpaid at the moment we compiled this database. Note that, in many cases, even loans that
Loan Principal Current Balance are a number of years old have very little principal paid off. Landlord mortgages are structured so that mostly interest is paid over the life of
                                 the loan, and the vast majority of principal is only due at the end of the mortgage term.
                                 The date that the mortgage is originated. For Freddie Mac loans, we do not have access to the exact date of origination, so use a proxy date,
    Loan Origination Date which is the date cut-off that the financials of the property were provided to the lender for the purposes of underwriting. This tracks very
## closely with the date of origination.
                                 The date that the mortgage term ends, or where the landlord borrower must pay off all remaining principal or get the loan refinanced. There is
     Loan Maturity Date significant amounts of missing in this column, as well as instances where the maturity date seems to have already passed. In these cases, it
                                 makes sense to check the data in the actual Fannie and Freddie data portals linked in the 'Database Overview' above.
     Property Value Date The date that the property value was assigned.
Geocode Match Address The address produced by running the data through a geocoder. This can sometimes be slightly different than the address provided in the
                                 Freddie and Fannie portals, and can be thought of as a standardized address, for comparison against other sources.
       Geocode Score The level of confidence that the geocoder produced accurate data, from 0-100. We only included results from the geocoder with a score over
                                 90. If geocoded data is blank, it may still be possible to identify the actual address by looking it up manually.
           Latitude The latitude of the property address.
          Longitude The longitude of the property address.