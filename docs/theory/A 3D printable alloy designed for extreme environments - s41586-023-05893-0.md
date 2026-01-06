---
title: "A 3D printable alloy designed for extreme environments"
category: "theory"
---

# A 3D printable alloy designed for extreme environments

https://doi.org/10.1038/s41586-023-05893-0

Received: 7 October 2022

Accepted: 27 February 2023

Published online: 19 April 2023

Open access

![](_page_0_Picture_7.jpeg)

Timothy M. Smith1⊠, Christopher A. Kantzos1, Nikolai A. Zarkevich2, Bryan J. Harder1, Milan Heczko3, Paul R. Gradl4, Aaron C. Thompson5, Michael J. Mills3, Timothy P. Gabb1 & John W. Lawson2

Multiprincipal-element alloys are an enabling class of materials owing to their impressive mechanical and oxidation-resistant properties, especially in extreme environments1,2. Here we develop a new oxide-dispersion-strengthened NiCoCrbased alloy using a model-driven alloy design approach and laser-based additive manufacturing. This oxide-dispersion-strengthened alloy, called GRX-810, uses laser powder bed fusion to disperse nanoscale Y2O3 particles throughout the microstructure without the use of resource-intensive processing steps such as mechanical or in situ alloying3,4. We show the successful incorporation and dispersion of nanoscale oxides throughout the GRX-810 build volume via high-resolution characterization of its microstructure. The mechanical results of GRX-810 show a twofold improvement in strength, over 1,000-fold better creep performance and twofold improvement in oxidation resistance compared with the traditional polycrystalline wrought Ni-based alloys used extensively in additive manufacturing at 1,093 °C5,6. The success of this alloy highlights how model-driven alloy designs can provide superior compositions using far fewer resources compared with the 'trial-and-error' methods of the past. These results showcase how future alloy development that leverages dispersion strengthening combined with additive manufacturing processing can accelerate the discovery of revolutionary materials.

High-entropy alloys, also commonly referred to as multi-principal element alloys (MPEAs), are a class of materials that are currently of interest among the metallurgical community1,2,7-9. In the past decade numerous scientific investigations have uncovered remarkable properties exhibited by these alloys 7,10-13. One of the most heavily investigated MPEA family is the Cantor alloy CoCrFeMnNi and its derivatives2,8,14. This group of alloys showed excellent strain hardening, resulting in high tensile strength and ductility 7,15–18. Overcoming the strength–ductility trade-off is a result of atomic-scale deformation mechanisms16, such as locally variable stacking-fault energies19 and magnetically driven phase transformations20. This class of alloys has also proven to be robust, resisting hydrogen environment embrittlement21, exhibiting improved irradiation properties22 and providing superior strength at cryogenic temperatures23. As a result, these alloys show great potential for numerous aerospace and energy applications in elevated-temperature and corrosive environments, allowing for weight reduction and higher performance operation.

One Cantor alloy derivative of special interest is the medium-entropy alloy NiCoCr. This alloy family provides the highest strength at room temperature among the Cantor alloy and its derivatives2,24. Recently, this alloy was shown to provide impressive tensile properties (1,100 MPa room temperature yield strength) when undergoing partial recrystallization heat treatment after cold rolling17. These properties are also attributed to strain-induced, face-centred cubic (FCC) to hexagonal

close-packed (HCP) phase transformations and local stacking-fault variations. Alloying and doping of NiCoCr with refractory elements and interstitials have also been explored recently. Seol et al. found that doping the high-entropy alloy, NiCoCrFeMn, with 30 ppm of boron resulted in significant improvements in strength and ductility attributed to both grain boundary and interstitial strengthening from the boron25. Recent studies have also found that the addition of carbon to MPEAs resulted in improved strength26-28. Lastly, Wu et al.29 found that three atomic percentage (at.%) additions of W in NiCoCr created a finer grain structure (average grain size 1 µm), resulting in a large increase in yield strength of the alloy (over 1,000 MPa, compared with 500 MPa for nonalloyed NiCoCr) while maintaining exceptional ductility of over 50% (ref. 29). These results suggest that significant improvements in FCC MPEA systems can still be realized through additional alloving.

Investigations of oxide-dispersion-strengthened (ODS) MPEAs have shown improved high-temperature properties (strength and creep)4 and irradiation properties30. Similarly, multiple recent studies have successfully produced ODS alloys through laser powder bed fusion (L-PBF) using a variety of techniques3,4,31. These methods have relied on mechanical alloying4,31, in situ alloying3 or chemical reactions32 to introduce and incorporate oxides into the three-dimensional (3D) printed matrix. However, all these processes introduce complexity and repeatability issues when trying to produce similar material through

![](_page_1_Figure_1.jpeg)

Fig. 1 | Modelling of GRX-810 and the NiCoCr compositional space.

a, Predicted phase stability in GRX-810. b, Calculated NiCoCr ternary phase diagram at 0 K. a, The body-centred cubic (BCC) Cr-rich phase has lower energy than FCC or HCP above the red line; dashed blue line indicates E(HCP) = E(FCC)

for metastable HCP and FCC, which are higher in energy than BCC. Solid blue line separates the lowest energy HCP Co-rich and FCC Ni-rich phases. Points are assessed from density functional theory (DFT) as shown in Extended Data Fig. 3. Values are at.%. Table shows nominal composition of GRX-810 (in wt%).

different additive manufacturing (AM) methods or machines. Recent work by Smith et al. produced ODS NiCoCr through L-PBF in which nanoscale Y2O3 nanoparticles were coated onto NiCoCr metal powder through a high-energy mixing process that does not require any binders, fluids or chemical reactions. This process did not deform or impact powder spherical morphology, which is important in regard to high-quality AM components. Using this approach these authors produced an ODS alloy that provided a 35% increase in tensile strength and threefold improvement in ductility at 1,093 °C compared with its non-ODS counterpart33.

Building on the work and using the same coating process performed by Smith et al.33, a model-driven alloy design approach was employed to optimize the NiCoCr alloy system for high-temperature applications using AM for complex components. This effort resulted in a new composition that was built using L-PBF to include nanoscale Y2O3 dispersoids for further high-temperature strength/stability above 810 °C. The characterization of this new alloy, Glenn Research Center Extreme Temperature above 810 °C (GRX-810), showed orders of magnitude better creep strength and twofold higher tensile strength compared with commercially available high-temperature alloys used in AM34,35 and with other alloys explored in this study (NiCoCr, NiCoCr-ODS, NiCoCr-ODS with minor additions of Re (1.5 wt%) and B (0.03wt%) (ODS-ReB)). This study confirms the maturity of both model-driven alloy design and AM processes to produce next-generation materials with properties not feasible through previous, conventional manufacturing technologies.

## Microstructure characterization of GRX-810

Figure 1 provides the predicted phase equilibrium of the modeloptimized GRX-810 alloy and its composition, based on percentage by weight. A full description of the modelling approach and microstructure analysis of GRX-810 can be found in Methods. The phase diagram in Fig. 1b shows that, for a large segment of the NiCoCr compositional space, HCP is the most energetically stable phase at 0 K. However, due to the higher symmetry and entropy associated with the FCC phase, this is expected to be observed at elevated temperatures, as reported for decades in NiCoCr-based alloys36–39. Figure2 provides the high-resolution microstructural characterization of untested hot isostatic pressurized (HIP) GRX-810after the powder was coated and consolidated through AM as shown in Extended Data Figs. 1 and 2.

One notable observation in Fig.2a is the presence of carbon segregation along some, but not all, oxide–matrix interfaces. The additional low-angle annular dark-field (LAADF)–STEM DCI analysis shown in Fig. 2b shows a representative defect microstructure. It consists of network of 1/2 dislocations mostly dissociated into observable intrinsic stacking faults bound by 1/6 Shockley partials. Dissociated dislocations mutually interact and form numerous extended stacking-fault node configurations. The density of these dissociated dislocations and grain structure of GRX-810is better shown in the lower resolution microstructural characterization shown in Extended data Fig. 4. In addition, the presence of numerous stacking-fault tetrahedra and prevalent dislocation interaction with oxides is observed. Stacking-fault tetrahedra have been found to further inhibit dislocation motion and may further improve the creep and tensile properties of this alloy40. Figure2c,d shows solute segregation of Cr, W and Re at the grain boundary, with Ni and Co depleted. The EDS map in Fig. 2c also shows the presence of Nb/Ti-rich metal carbides predicted by the thermodynamic models to be stable up to alloy melting temperature.This analysis was further validated through SEMas shown in Extended Data Fig. 5. High-resolution high-angle annular dark-field (HAADF)–STEM analysis of the GRX-810 lattice was performed to explore whether local chemical ordering exists in this alloy, as has been found in other high-entropy alloys41,42. The analysis in Fig. 2e,f shows that, despite possessing L12-forming elements such as Al, Ti and Nb, the lattice maintained a perfect solid solution with no short-range elemental ordering present43.

## Mechanical properties of GRX-810

Five different MPEA alloys (NiCoCr, NiCoCr-ODS, ODS-ReB, GRX-810 and non-ODS GRX-810) under both as-built and HIP conditions were tensile and/or creep tested at 1,093 °C to compare their overall high-temperature mechanical properties. Tests were also performed on AM 718, AM 625 and wrought Haynes 230 for comparison with conventional wrought superalloys used extensively in AM. Figure 3 shows the tensile and 20 MPa creep performance of these alloys at 1,093 °C.

Figure 3a shows the elevated-temperature tensile tests (1,093 °C) that highlight the strength and elongation differences of the five alloys tested. The non-ODS NiCoCr sample was found to have lower strength and ductility than the NiCoCr-ODS sample. In fact, by simply incorporating Y2O3 particles the strength of NiCoCr was increased and ductility improved twofold. This highlights the strengthening effect provided by these oxides at elevated temperatures. The minor additions of Re

![](_page_2_Figure_0.jpeg)

Fig. 2 | High-resolution characterization of GRX-810 microstructure. a, Scanning transmission electron microscopy–energy dispersive X-ray spectroscopy (STEM–EDS) combined Y and C map showing C segregation at the oxide–matrix interface. b, BF–STEM diffraction contrast image (DCI) micrograph (electron beam is parallel with [001] zone axis of matrix) of dislocation interaction with oxides (black arrows) and the presence of stacking-fault tetrahedra (red arrows). c, STEM–EDS combined W and Re map showing segregation at grain boundary and surrounding the carbide. d, Integrated line scans (at.%), from the rectangle outlined in c, showing segregation of Cr, W and Re and depletion of Co and Ni at the grain boundary. Elements not measuring any change across the boundary are not shown. e, Atomic resolution [011] zone axis HAADF–STEM image of GRX-810 lattice. f, Fast Fourier transformation of the image in e showing the absence of any additional superlattice spots. Both d and e suggest that local chemical ordering is not present.

and B to NiCoCr-ODS appear to have improved the strength of the alloy marginally. Notably, GRX-810 showed higher strength and ductility when compared with the other ODS alloys; indeed, compared with NiCoCr (where this study began33), GRX-810 provided twice the strength and over three times the ductility, making it a much more robust high-temperature alloy. One surprising result is the strength of non-ODS GRX-810, which appears to be comparable to that of as-built GRX-810 although it has limited ductility (comparable to the non-ODS NiCoCr alloy). This finding suggests that the improvement in strength is due to base composition, whereas the oxides are the source of improved ductility. Additional alloys are compared in Fig. 3b, showing the strength of GRX-810 and non-ODS GRX-810 compared with the wrought Haynes 230 tested in this study (Supplementary Fig. 1), and compared with wrought 625 and 718 from the literature44. Extended Data Fig. 6a,b shows the as-built room temperature tensile tests. These curves present little difference in regard to strength and elongation between the different alloys, although GRX-810 did provide slightly higher tensile strength compared with the three other alloys. The HIP room temperature tests provide some variation in strength, because the ODS alloys were able to retain higher strength after this processing step. This is most probably attributed to the finer grain structure maintained in the ODS alloys compared with the larger grain growth and more equi-axed grain structure in the non-ODS NiCoCr sample45. Notably, the transverse (x–y) GRX-810 sample provided significantly higher strength compared with those tested in the vertical (z) direction, a typical result found with L-PBF materials46. This finding highlights the anisotropy present in the AM samples that can not be recrystallized through conventional means such as a HIP step, but also suggests that print direction provides less strength than other orientations for these ODS materials. Lastly, Extended Data Table1 shows the tensile properties of as-built and HIP GRX-810 at varying temperatures. Two notable observations are shown in this table. First, as-built GRX-810 consistently offers higher strength compared with HIP GRX-810; and second, GRX-810 provides unexpected cryogenic tensile properties (as-built GRX-810 provides 1.3 GPa of tensile strength), showing that nanoscale oxides are not detrimental to alloy strength at these low temperatures. These high cryogenic strengths have been noted in NiCoCr in past studies, and are suggested to be due to a FCC-to-HCP phase transformation13,20,23. The data in Extended Data Table 1 also show that GRX-810 remains ductile from cryogenic to elevated (1,093 °C) temperature.

Creep tests were also performed at 1,093 °C to compare the properties of these alloys, and are shown in Fig. 3c,d. Figure 3c,d also shows the impact of the combination of the oxide-strengthening and model-driven composition of GRX-810 for high-temperature creep strength. At 1,093 °C and 20 MPa, HIP GRX-810 ruptured after 6,500 h of creep whereas the as-built test was terminated at 1% strain (over 2,800 h). All other non-ODS alloys considered, namely NiCoCr, AM superalloy 718, AM superalloy 625 (at 14MPa) and wrought Haynes 230, ruptured in under 40 h. The orders of magnitude improvement in creep performance by GRX-810 is also shown in Table1, with time to reach 1% strain at 1,093 °C under 20 MPa of stress for each alloy5,47–49.

From Table1 it can be seen that as-built GRX-810 required more than 500-fold longer to reach 1% strain compared with wrought Haynes 230, and over 1,000-fold longer compared with AM superalloy 718. Also, as observed from the tensile results, as-built GRX-810 exhibited better high-temperature properties compared with HIP GRX-810. GRX-810 even provided better creep strength in this regime compared with wrought Nb-based alloy C-103 tested in a high-vacuum environment50. At the higher 31 MPa stress level shown in Extended Data Fig. 6c,d, as-built GRX-810 lasted for almost 2,500 h compared with NiCoCr, which lasted just over 1 h—an almost 2,000-fold improvement in life span.

One explanation for the improved tensile and creep properties of GRX-810 may be the improvement observed in oxidation resistance compared with Superalloy 718. In Fig. 4, the results from cyclic oxidation tests conducted on GRX-810 and Superalloy 718 are shown up to 35 h at 1,100 and 1,200 °C. During exposure at 1,093 °C, the weight loss observed for each alloy was attributed to oxide spallation on air quenching from the test temperature. Nevertheless, the results shown here indicate that GRX-810 has oxidative durability superior to AM superalloy 718 at 1,093 °C, and significantly better at 1,200 °C, in which AM superalloy 718 offered little to no life. More complete oxidation analysis is provided in Extended Data Fig. 7.

## Comparison with current SOA AM alloys

Figure 3 and Extended Data Fig. 6 show that GRX-810 exhibits markedly improved creep rupture properties over baseline NiCoCr

![](_page_3_Figure_1.jpeg)

Fig. 3 | Mechanical testing of NiCoCr-based alloys. a, Engineering stress– strain curves at 1,093 °C for as-built and HIP alloys. b, Comparison of ultimate tensile strength between different alloys. Wrought 718 and 625 strengths were provided by the literature.44 c, 1,093 °C creep curves for as-built and HIP

NiCoCr, NiCoCr-ODS and ODS-ReB at 20 MPa. d, The same tests with GRX-810 curves included. Additional tests of AM 718, 625 and H230 are shown at 20 MPa for a better comparison with conventional high-temperature superalloys. Error bars correspond to 1 s.d.

Table 1 | Time to reach 1% creep strain for GRX-810

| Alloy    | NiCoCr                                                | AM 718 | AM 625a | Haynes 230 | ODS-ReB | C-103 (vacuum)  | As-built GRX-810 | HIP GRX-810 |
|----------|-------------------------------------------------------|--------|---------|------------|---------|-----------------|------------------|-------------|
| Time (h) | 0.35                                                  | 2.2    | 10      | 5          | 9       | 1,170 (ref. 50) | 2,804            | 2,122       |
| a        | Superalloy 625 testing was performed at 14MPa5,47–49. |        |         |            |         |                 |                  |             |

![](_page_3_Figure_6.jpeg)

Fig. 4 | Cyclic oxidation results at 1,093 and 1,200 °C. a,b, Cyclic oxidation results for GRX-810 and superalloy 718 at 1,093 °C (a) and 1,200 °C (b) for up to 35 h. c, Optical images of oxidation samples after 100 h at 1,093 °C and 3 h at

1,200 °C, at which the superalloy 718 sample presented catastrophic oxidation. The three samples above are all GRX-810. d, GRX-810 samples after thermal cycling for 100 h at 1,093 and 1,200 °C. Error bars represent 1 s.d.

![](_page_4_Figure_0.jpeg)

Fig. 5 | Creep rupture life of as-built GRX-810 compared with current SOA AM superalloys. Scatter plot of superalloy creep rupture life at 1,093 °C. GRX-810 presents superior creep properties compared with wrought alloys currently used in 3D printed high-temperature applications.

and NiCoCr-ODS alloys. Furthermore, compared with current state-of-the-art (SOA) AM high-temperature alloys (superalloy 718, superalloy 625 and Haynes 230), GRX-810 can provide orders of magnitude better creep life at 1,093 °C. To further illustrate this improvement, the 1,093 °C creep rupture lives of these alloys and other commercially available superalloys are plotted together in Fig. 5 (refs. 44,51–55).

The plot in Fig.5 compares the high-temperature properties of both NiCoCr-ODS (green) and NiCoCr with Re and B additions (ODS-ReB) (blue), GRX-810 (gold) and conventional wrought superalloys used commonly in AM (red). In Fig. 3, although GRX-810 clearly shows improvement in tensile strength, its creep performance is even more pronounced and notable. Additional creep tests were performed, and results can be found in Extended Data Fig. 8. It is evident that the addition of nanoscale oxide dispersoids provided sufficient strength in the matrix to avoid dislocation motion (Supplementary Fig. 2), thereby leading to improvement in both mechanical and oxidation properties. However, STEM analysis of ODS-ReB and GRX-810 did not show any significant differences in oxide size or spatial distributions that could explain the differences in creep performance between the two alloys. Therefore, to better explain the creep strength of GRX-810, longitudinal sections taken from two 1,093 °C air creep tests at 20 MPa were analysed, as shown in Extended Data Fig.9. Whereas other ODS alloys (for example, ODS-ReB) failed through a combination of grain boundary creep void coalescence and shear failure, GRX-810 appears to have suppressed these failure mechanisms because no apparent grain boundary voids/defects were observed after much longer test times. One contributory factor is that non-ODS GRX-810 has higher strength than even previous ODS alloys, and thus creep stress is a lower fraction of the alloy's yield stress. Nevertheless, the grain boundary failure modes in other ODS alloys suggest that in GRX-810 the stable MC carbides and solute segregation of W, Cr and Re along grain boundaries are factors contributing significantly to the protection of the alloy from grain boundary failure mechanisms. Previous studies have suggested that carbide stability at high temperature will influence grain boundary crack initiation during creep56. In addition, grain boundary diffusivity was reported to be correlated to the rate of void formation during creep57,58. Therefore, the addition of W and Re (known slow diffusors) should further inhibit creep void formation along grain boundaries whereas Cr segregation is expected to improve grain boundary corrosion and oxidation properties59. Stress-induced nitride formation was also observed in both the ODS-ReB (Cr-rich nitrides) and GRX-810 (Al- and Cr-rich nitrides) alloys. Whereas the formation of these internal nitrides is considered detrimental to both alloys' properties60, the nitrides in GRX-810 did not appear to contribute to grain boundary failure as observed in the ODS-ReB alloy.

In conclusion we present the design, characterization and properties of a new NiCoCr-based ODS alloy, GRX-810, which provides superior performance in extreme environments compared with current AM alloys. The use of computational modelling in alloy design led to a composition that balances properties and processability, with advanced characterization giving insights into the underlying microstructure and mechanisms. Creep performance of GRX-810 at 1,093 °C showed orders of magnitude improvement compared with currently used high-temperature alloys, thereby enabling the use of AM for complex components in extreme environments.

## Online content

Any methods, additional references, Nature Portfolio reporting summaries, source data, extended data, supplementary information, acknowledgements, peer review information; details of author contributions and competing interests; and statements of data and code availability are available at https://doi.org/10.1038/s41586-023-05893-0.

- 1. Cantor, B., Chang, I. T. H., Knight, P. & Vincent, A. J. B. Microstructural development in equiatomic multicomponent alloys. Mater. Sci. Eng. A 375–377, 213–218 (2004).
- 2. Miracle, D. B. & Senkov, O. N. A critical review of high entropy alloys and related concepts. Acta Mater. 122, 448–511 (2017).
- 3. Chen, P., Yang, C., Li, S., Attallah, M. M. & Yan, M. In-situ alloyed, oxide-dispersion-strengthened CoCrFeMnNi high entropy alloy fabricated via laser powder bed fusion. Mater. Des. 194, 108966 (2020).
- 4. Hadraba, H. et al. Oxide dispersion strengthened CoCrFeNiMn high-entropy alloy. Mater. Sci. Eng. A 689, 252–256 (2017).
- 5. Amato, K. et al. Microstructure and mechanical behavior of Inconel 718 fabricated by selective laser melting. Act Mater. 60, 2229–2239 (2012).
- 6. Blakey-Milner, B. et al. Metal additive manufacturing in aerospace: a review. Mater. Des. 209, 110008 (2021).
- 7. Gali, A. & George, E. P. Tensile properties of high- and medium-entropy alloys. Intermetallics 39, 74–78 (2013).
- 8. Miracle, D. B. et al. Exploration and development of high entropy alloys for structural applications. Entropy 16, 494–525 (2014).
- 9. Miracle, D. B. High entropy alloys as a bold step forward in alloy development. Nat. Commun. 10, 1805 (2019).
- 10. Wu, Z., Bei, H., Pharr, G. M. & George, E. P. Temperature dependence of the mechanical properties of equiatomic solid solution alloys with face-centered cubic crystal structures. Acta Mater. 81, 428–441 (2014).
- 11. Senkov, O. N., Wilks, G. B., Scott, J. M. & Miracle, D. B. Mechanical properties of Nb25Mo25Ta25W25 and V20Nb20Mo20Ta20W20 refractory high entropy alloys. Intermetallics 19, 698–706 (2011).
- 12. Zaddach, A. J., Niu, C., Koch, C. C. & Irving, D. L. Mechanical properties and stacking fault energies of NiFeCrCoMn high-entropy alloy. JOM 65, 1780–1789 (2013).
- 13. Gludovatz, B. et al. A fracture-resistant high-entropy alloy for cryogenic applications. Science 345, 1153–1158 (2014).
- 14. Coury, F. G., Zepon, G. & Bolfarini, C. Multi-principal element alloys from the CrCoNi family: outlook and perspectives. J. Mater. Res. Technol. 15, 3461–3480 (2021).
- 15. Jin, K., Gao, Y. F. & Bei, H. Intrinsic properties and strengthening mechanism of monocrystalline Ni-containing ternary concentrated solid solutions. Mater. Sci. Eng. A 695, 74–79 (2017).
- 16. Miao, J. et al. The evolution of the deformation substructure in a Ni-Co-Cr equiatomic solid solution alloy. Acta Mater. 132, 35–48 (2017).
- 17. Slone, C. E., Miao, J., George, E. P. & Mills, M. J. Achieving ultra-high strength and ductility in equiatomic CrCoNi with partially recrystallized microstructures. Acta Mater. 165, 496–507 (2019).
- 18. Slone, C. E. et al. Inluence of deformation induced nanoscale twinning and FCC-HCP transformation on hardening and texture development in medium-entropy CrCoNi alloy. Acta Mater. 158, 38–52 (2018).
- 19. Smith, T. M. et al. Atomic-scale characterization and modeling of 60 dislocations in a high-entropy alloy. Acta Mater. 110, 352–363 (2016).
- 20. Niu, C., LaRosa, C. R., Miao, J., Mills, M. J. & Ghazisaeidi, M. Magnetically-driven phase transformation strengthening in high entropy alloys. Nat. Commun. 9, 1363 (2018).
- 21. Luo, H., Li, Z. & Raabe, D. Hydrogen enhances strength and ductility of an equiatomic high-entropy alloy. Sci. Rep. 7, 9892 (2017).
- 22. Granberg, F. et al. Mechanism of radiation damage reduction in equiatomic multicomponent single phase alloys. Phys. Rev. Lett. 116, 135504 (2016).
- 23. Gludovatz, B. et al. Exceptional damage-tolerance of a medium-entropy alloy CrCoNi at cryogenic temperatures. Nat. Commun. 7, 10602 (2016).
- 24. Laplanche, G. et al. Reasons for the superior mechanical properties of medium-entropy CrCoNi compared to high-entropy CrMnFeCoNi. Acta Mater. 128, 292–303 (2017).
- 25. Seol, J. B. et al. Boron doped ultrastrong and ductile high-entropy alloys. Acta Mater. 151, 366–376 (2018).

- 26. Zhou, R. et al. Microstructures and mechanical properties of C-containing FeCoCrNi highentropy alloy fabricated by selective laser melting. Intermetallics 94, 165–171 (2018).
- 27. Huang, T. et al. Effect of carbon addition on the microstructure and mechanical properties of CoCrFeNi high entropy alloy. Sci. China Technol. Sci. 61, 117–123 (2018).
- 28. Wu, Z., Parish, C. M. & Bei, H. Nano-twin mediated plasticity in carbon-containing FeNiCoCrMn high entropy alloys. J. Alloys Compd. 647, 815–822 (2015).
- 29. Wu, Z. et al. Enhanced strength and ductility of a tungsten-doped CoCrNi medium-entropy alloy. J. Mater. Res. 33, 3301–3309 (2018).
- 30. Lu, C. et al. High radiation tolerance of an ultrastrong nanostructured NiCoCr alloy with stable dispersed nanooxides and ine grain structure. J. Nucl. Mater. 557, 153316 (2021).
- 31. Li, M., Guo, Y., Li, W., Zhang, Y. & Chang, Y. Property enhancement of CoCrNi mediumentropy alloy by introducing nano-scale features. Mater. Sci. Eng. A 817, 141368 (2021).
- 32. Martin, J. H. et al. 3D printing of high-strength aluminium alloys. Nature 549, 365–369 (2017).
- 33. Smith, T. M., Thompson, A. C., Gabb, T. P., Bowman, C. L. & Kantzos, C. A. Eficient production of a high-performance dispersion element alloy. Sci. Rep. 10, 9663 (2020).
- 34. GaoLe, Z., XiaoAn, H., Jia, H., JinWu, W. & Yun, W. High-temperature mechanical properties of nickel-based superalloys manufactured by additive manufacturing. Mater. Sci. Technol. 36, 1523–1533 (2020).
- 35. Schneider, J., Lund, B. & Fullen, M. Effect of heat treatment variations on the mechanical properties of Inconel 718 selective laser melted specimens. Addit. Manuf. 21, 248–254 (2018).
- 36. Sims, C. T. A history of superalloy metallurgy for superalloy metallurgists. Superalloys https://doi.org/10.7449/1984/Superalloys\_1984\_399\_419 (1984).
- 37. Sabol, G. P. & Stickler, R. Microstructure of nickel-based superalloys. Phys. Status Solidi B Basic Solid State Phys. 35, 11–52 (1969).
- 38. Jena, A. K. & Chaturvedi, M. C. The role of alloying elements in the design of nickel-base superalloys. J. Mater. Sci. 19, 3121–3139 (1984).
- 39. Reed, R. The Superalloys (Cambridge Univ. Press, 2006).
- 40. Wirth, B. D., Bulatov, V. V. & Diaz de la Rubia, T. Dislocation-stacking fault tetrahedron interactions in Cu. J. Eng. Mater. Technol. 124, 329–334 (2002).
- 41. Zhang, R. et al. Short-range order and its impact on the CrCoNi medium-entropy alloy. Nature 581, 283–287 (2020).
- 42. Walsh, F., Asta, M. & Ritchie, R. O. Magnetically driven short-range order as an explanation for anomalous measurements in CrCoNi. Proc. Natl Acad. Sci. USA 118, e2020540118 (2020).
- 43. Miao, J. et al. Ordering effects on deformation substructures and strain hardening behavior of a CrCoNi based medium entropy alloy. Acta Mater. 210, 116829 (2021).
- 44. The International Nickel Company. in High Temperature, High Strength Nickel Base Alloys 1–19 (Nickel Development Institute, 1995).
- 45. Dunstan, D. J. & Bushby, A. J. Grain size dependence of the strength of metals: the Hall-Petch effect does not scale as the inverse square root of grain size. Int. J. Plast. 53, 56–65 (2014).
- 46. Gradl, P. R., Mireles, O. R., Protz, C. S. & Garcia, C. P. Metal Additive Manufacturing for Propulsion Applications (American Institute of Aeronautics and Astronautics, 2022).

- 47. Sudbrack, C. K. et al. Impact of powder variability on the microstructure and mechanical behavior of selective laser melted alloy 718. Miner. Met. Mater. Ser. 2018-June, 89–113 (2018).
- 48. Gradl, P. R. & Protz, C. S. Technology advancements for channel wall nozzle manufacturing in liquid rocket engines. Acta Astronaut. 174, 148–158 (2020).
- 49. Gradl, P. et al. Robust metal additive manufacturing process selection and development for aerospace components. J. Mater. Eng. Perform. 31, 6013–6044 (2022).
- 50. Titran, R. H. & Klopp, W. D. Long-time creep behavior of the niobium alloy C-103. NASA Tech. Pap. 1727, 1–9 (1980).
- 51. Davis, J. R. Heat-Resistant Materials (ASM Int., 1999).
- 52. Moon, J.-H., Yoon, M.-G. & Ha, T. K. Microstructure and high temperature deformation behavior of cast 310S alloy. Int. J. Ind. Manuf. Eng. 8, 533–536 (2014).
- 53. Korb, G., Ruhle, M. & Martinz, H.-P. New iron-based ODS-superalloys for high demanding applications. Am. Soc. Mech. Eng. 91, 1–8 (1991).
- 54. Special Metals. Product Handbook of High-Performance Nickel Alloys 1–43 (https://www. specialmetals.com/documents/nickel-alloy-handbook.pdf; 2019).
- 55. Millan, P. P. & Mays, J. C. Oxide-dispersion-strengthened turbine blades (MA6000). NASA Contract. Rep. (1986).
- 56. Yang, J., Zheng, Q., Sun, X., Guan, H. & Hu, Z. Relative stability of carbides and their effects on the properties of K465 superalloy. Mater. Sci. Eng. A 429, 341–347 (2006).
- 57. Garosshen, T. J., Tillman, T. D. & Mccarthy, G. P. Effects of B, C, and Zr on the structure and properties of a PM nickel base superalloy. Metall. Trans. A 18, 69–77 (1987).
- 58. Kontis, P. et al. On the effect of boron on grain boundary character in a new polycrystalline superalloy. Acta Mater. 103, 688–699 (2016).
- 59. Joshi, A. & Stein, D. F. Chemistry of grain boundaries and its relation to intergranular corrosion of austenitic stainless steel. Corrosion 28, 321–330 (1972).
- 60. Wang, Y. et al. Internal nitridation during creep of IN617 superalloy. Corros. Sci. 209, 110763 (2022).

Publisher's note Springer Nature remains neutral with regard to jurisdictional claims in published maps and institutional afiliations.

![](_page_5_Picture_37.jpeg)

Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate

credit to the original author(s) and the source, provide a link to the Creative Commons licence, and indicate if changes were made. The images or other third party material in this article are included in the article's Creative Commons licence, unless indicated otherwise in a credit line to the material. If material is not included in the article's Creative Commons licence and your intended use is not permitted by statutory regulation or exceeds the permitted use, you will need to obtain permission directly from the copyright holder. To view a copy of this licence, visit http://creativecommons.org/licenses/by/4.0/.

© This is a U.S. Government work and not under copyright protection in the US; foreign copyright protection may apply 2023

## Methods

## Materials

Three batches of pre-alloyed, gas-atomized powder feedstock (compositions given in Supplementary Table 1) were purchased from Praxair, Inc. The powders were sieved using +270 and −325 mesh (10–53 μm) to acquire an average particle diameter of around 15 μm as determined using a Horiba PSA300 Static Image Analysis System. The dispersoid used in the AM process was nanoscale Y2O3 powder (diameter 100– 200 nm; American Elements). The powder was certified 99.999% pure yttrium oxide. These dispersoids were subsequently coated onto the base alloy powder using a high-energy acoustic mixer. Examples of powder morphology pre- and postmixed (coated), using the method described in ref. 33, are shown in Extended Data Fig. 1. Postmixed powder was then sieved using a 230 mesh screen to remove any large oxide or metallic powder particles. Unmixed powder (NiCoCr), mixed NiCoCr (NiCoCr-ODS) powder, NiCoCr-ReB (ODS-ReB), mixed GRX-810 and unmixed GRX-810 (non-ODS) samples were built using powder bed fusion to produce microstructural and mechanical test components on an EOS M100 L-PBF machine (40 μm beam diameter). For GRX-810 builds on the EOS M280, optimal densities were achieved with a laser energy density of 90–110 J mm–3. Vertical test specimens (height 55.0 mm, diameter 6.35 mm) were built on 304 stainless steel build plates. All samples were then removed from the build plates using electrical discharge machining. Supplementary Table 1 provides a list of each alloy and its corresponding composition.

### Mechanical testing

After removal of test coupons from their respective build plates, selected specimens underwent a HIP cycle at 1,185 °C while wrapped in Ta foil to mitigate oxidation. The HIP cycle also had the benefit of removal of residual stresses. This provides a better comparison between ODS and non-ODS samples because residual stress has been shown to convolute structure–property relationships61. Both as-built and HIP specimens of each alloy type were tensile tested at room and elevated temperature using a cylindrical specimen with a 3.175-mm-diameter-gauge section. Cryogenic tensile testing at liquid N temperature (−196 °C) was also performed on GRX-810 samples. Testing was performed at Metcut Research, Inc. Tensile tests were performed at room temperature, at 0.127 mm min–1 for the first 1.5% strain followed by an increase to 1.016 mm s–1 until failure in accordance with the ASTM E8/E8M-21 standard, and at 1,093 °C at a constant strain rate of 1.016 mm min–1 in accordance with the ASTM E21-17 standard. Following tensile tests, creep tests were performed at 1,093 °C by Metcut in accordance with the ASTM E139-11 standard. Testing of creep samples was continued until rupture (unless otherwise stated), after which they were then rapidly air cooled to maintain the fracture surface. All specimens were tested in the print direction unless otherwise specified in the description.

#### Oxidation testing

Samples of AM 718 and the GRX-810 alloy were cut into samples of nominal size 12.5 × 12.5 × 3.5 mm3 , which provided a total surface area of around 487.5 mm2 . Surfaces were polished to a smooth finish with 1 μm diamond paste. Samples were oxidized in a laboratory airbox furnace at 1,093 °C for progressively longer dwell times. Exposure started at 1 h intervals for the first 10 h then at 5 h intervals for the next 25 h, followed by a 25 h duration and finally a 40 h duration for a total of 100 h at that temperature. Sample weights were measured after each interval for a total of 18 data points for each sample over the entire thermal exposure. After samples had reached the conclusion of the 100 h test at 1,093 °C, half underwent a second oxidation heat treatment at 1,200 °C for the same time period and intervals as the 1,093 °C test.

At 1,093 °C, the AM superalloy 718 and GRX-810 both underwent similar mass gain over the first few hours, indicating oxidation. However, both samples had exhibited mass loss by 7 h, which was accompanied by a spallation of oxide during each subsequent air quench to room temperature by removal from the box furnace. Specific weight change appeared to be linear in both AM superalloy 718 and GRX-810 from 5 to 10 h, with the rate of loss in the former roughly twice that of the latter. From 10–40 h, 5 h intervals were implemented and specific weight change per hour slowed, supporting the observation of oxide spallation during air quench to room temperature. The rate of loss in specific weight for AM superalloy 718 was again roughly twice that of GRX-810. Over the 25 and 40 h cycles shown in Extended Data Fig. 7, specific weight change rate slowed further and both alloys underwent equivalent weight change after air quenching to room temperature. A more significant level of spallation was observed at these longer intervals (as indicated by the larger drop in specific weight), but specific weight change per hour was lower than for the 1 and 5 h intervals.

After the 1,093 °C tests, half of the samples were removed and the remainder underwent additional progressive oxidation exposure at 1,200 °C following the same approach. In the case of AM superalloy 718, the sample lasted for only three 1 h cycles before undergoing catastrophic oxidation and complete disintegration and thus testing was ended. Runaway oxidation in the AM superalloy:718 sample can be seen in Fig.4c, with significant weight gain observed after 1 h. The GRX-810 alloy exhibited similar behaviour to that at 1,093 °C exposure, although the specific weight change rate was around 40-fold more rapid over the 1 h heat treatment cycle. Over the 5, 25 and 40 h cycles, specific weight was only three- to fourfold more rapid than that at 1,093 °C over the same time intervals.

#### Microstructural characterization

For SEM analysis, samples were polished using SiC grit paper followed by 0.5 μm diamond suspension. Afterwards, a final polish using 50 nm colloidal silica for 24 h was employed on samples used for electron backscatter diffraction (EBSD) analysis. EBSD orientation mapping was performed using an EDAX Hikari EBSD detector with 800 nm spot size. Postprocessing of maps was completed using TSL OIM Data Collection 7 software. High-resolution SEM imaging of the Y2O3 coating on NiCoCr powder was performed using a Tescan MAIA3 in ultrahigh-resolution configuration at 15 kV. Chemical maps were obtained with an Oxford Ultim Max Silicon Drift Detector and Aztec Software, and were used to determine phases in postcrept samples. STEM disc samples (diameter 3 mm) were extracted from metallographic samples of GRX-810 and ODS-ReB. STEM samples were thinned manually to 130 μm using 600 grit SiC polishing paper. To achieve electron transparency, polished STEM discs were electropolished with a solution of 90% methanol and 10% perchloric acid at −40 °C and 12 V using a Struers twin-jet polisher. Microstructural analysis was performed on an FEI Talos at 200 kV using a HAADF detector. Defect analysis was performed using S-CORR probe aberration-corrected and monochromated Thermo Fisher Scientific Themis-Z STEM at an acceleration voltage of 300 kV. STEM diffraction contrast imaging was performed with BF and HAADF detectors by selection of the appropriate camera length. Atomic resolution of the microstructure was performed by tilting of the thin disc foils into specific low-index crystallographic zones. High-resolution EDS data were collected by a Super-X energy dispersive X-ray spectroscopy detector in Themis-Z. Data were collected and processed using Thermo Fisher Scientific Velox software. In particular, raw data in the original spectral maps were quantified using standard Cliff–Lorimer (k-factor) fit (default k-factors available in Velox were used, as well as the Brown– Powell empirical ionization cross-section model) including background subtraction. STEM micrographs were corrected for potential sample drift and scanning beam distortions using the drift-corrected frame integration function of Velox.

The Archimedes method with deionized water as the immersion fluid was used to determine the density of the additively manufactured GRX-810 material. Specimens with surface-breaching networks of cracks

and porosity allow water infiltration that can be observed as bubbling during submersion; no bubbling was observed during submersion of GRX-810. Measurements of a part's mass in air  $(M_{\rm a})$  and in water  $(M_{\rm w})$  were taken on a Mettler Toledo XS205 system. Density of the AM part was calculated by

$$p = \left(\frac{M_{\rm a}}{(M_{\rm a} - M_{\rm w})}\right) \times (p_{\rm w} - p_{\rm o}) + p_{\rm o} \tag{1}$$

where  $p_{\rm w}$  is the temperature-dependent density of water and  $p_{\rm 0}$  is air density. The reported density value is an average of three independent measurements.

Powder feedstock (15-45 µm) of the optimized composition shown in Fig. 1 was obtained, coated with Y2O3 nanoparticles and built with L-PBF using the steps detailed above. Successful production of GRX-810 using AM L-PBF allowed for the characterization of GRX-810 in both as-built and post-HIP states. Extended Data Fig. 2 shows the high density (over 99.97%) that can be achieved with optimized print parameters for GRX-810 based on optical microscopy analysis. Relative density measurements further confirmed this value, showing 99.96% density value for the same sample. From the SEM analysis shown in Extended Data Fig. 5, the major difference in microstructure between as-built and HIP GRX-810 samples is the presence of fine MC carbides along grain boundaries after the HIP processing step. These grain boundary phases were confirmed as Ti/Nb-rich carbides through both SEM and TEM EDS, for which the results of the former can be found in Supplementary Fig. 3. No other phases were present in either material state, validating the accuracy of thermodynamic calculations in prediction of stable microstructures in the compositional space. The intragranular dark contrast 'dot-like' features observed in Extended Data Fig. 5b are Y2O3 particles sufficiently large to be observed by SEM using secondary electron imaging mode. The lack of bulk oxide formation provides further evidence that the coated GRX-810 powder can be successfully printed using L-PBF to form an optimized oxide dispersion-strengthened alloy.

From Extended Data Fig. 4a, little to no variations in grain structure and average grain diameter between as-built and HIP conditions were observed in GRX-810. This finding suggests that the distribution of fine oxides sufficiently suppresses dislocation and grain boundary movement at high temperatures. The grain texture usually associated with AM melting processes is apparent between the x-y and x-z planes  $^{23,46}$ . Extended Data Fig. 4b illustrates LAADF–STEM DCI showing defect configurations and corresponding EDS chemical maps. The yttrium map confirms the presence of  $Y_2O_3$  particles evenly distributed throughout the GRX-810 matrix. In fact, this distribution of oxides appears to have pinned the dislocations produced during the L-PBF build step as a high-dislocation density that can be observed in the LAADF–STEM DCI micrograph. The Cr and Ni maps represent chemical maps of the other elements, showing no local segregation or ordering at 500 nm length scale.

#### Modelling of the next-generation MPEA

Thermodynamic modelling (CALPHAD) was employed to produce a superior composition using equi-atomic NiCoCr as a foundation 62,63. Simulations were completed adding specific elements (for example, B, C, Al, Ti, V, Mn, Fe, Zr, Nb, Mo, Hf, Ta, W and Re) to an equi-atomic composition of NiCoCr. Therefore, as new elements were included in the simulation, the atomic percentages of Ni, Co and Cr remained equal. Thresholds were used to better constrain the models and guide optimization. The thresholds included (1) maximized solid solution strengthening; (2) the FCC solid-solution matrix should be maintained; for this constraint it was assumed that any undesired phases stable above 810 °C would not be acceptable; (3) enabling of MC carbide formation along grain boundaries stable above 1,200 °C; and (4) the temperature difference associated with a composition solidification temperature range (STR) must remain below 100 °C for AM printability.

This reduction in STR has been used by welding engineers to predict an alloy's susceptibility to solidification cracking, dendritic segregation (which requires remedial postprocessing), residual stress and hot cracking  $^{33.64}$ . These constraints allowed the alloy compositional space to be manageable and reduced the number of overall simulations, thereby leading to the optimized composition and predicted equilibrium phases shown in Fig. 1a. Simulations were performed using Thermo-Calc v.2020b with the Ni alloy database TCNI8. Upwards of  $10^7$  equilibrium calculations were performed across composition and temperature space. Y and O were not considered in the composition search, because the  $\rm Y_2O_3$  phase is expected to be inert and is not well described in the TCNI8 database  $^{62}$ . The  $\rm Y_2O_3$  line shown in Fig. 1 is approximate and is included here for visual clarity.

To better understand the phase stability and properties of the NiCoCr compositional space, a full overview using DFT calculations was performed65. Extended Data Fig. 3 shows the computed electronic spin density of states of the FCC (A1), BCC (A2) and HCP (A3) phases of the equi-atomic NiCoCr alloy system. Interestingly, from Extended Data Fig. 3, the formation energy of equi-atomic NiCoCr (relative to elemental solids) is positive. At this composition, energies of the FCC and HCP phases are quite comparable, suggesting there is a crossover from the HCP to FCC ground state nearby. Both FCC and HCP phases are close packed and the computed equilibrium volumes per atom for FCC and HCP at any composition are rather close, with the equilibrium volume of BCC differing significantly. In the close-packed phase (such as FCC), the stacking-fault energy increases with the absolute value of the energy difference E(HCP) - E(FCC). Creep properties are influenced by stacking-fault energy, which depends on composition. For future guidance on NiCoCr-based alloy development, the results from Extended Data Fig. 3 are organized into a predicted ternary phase diagram at 0 K in Fig. 1b. Although this phase diagram may not represent stable phases at high temperatures due to entropy, these calculations have important implications in the properties of the NiCoCr system at cryogenic temperatures. Recent papers have found excellent mechanical properties for NiCoCr-based medium-entropy alloys at these low temperatures in which the phase transformation from FCC to HCP during deformation isthe principal contributing factor23,66. Therefore, these low-temperature properties may be further improved by moving the composition of NiCoCr into the more stable HCP phase regime while maintaining an FCC phase. Future work is planned to explore this possibility.

## **DFT calculations**

For this study, the all-electron DFT KKR-coherent potential approximation (CPA) Green's function code67 was employed to calculate energies of disordered structures. Within the KKR method68,69, atomic sphere approximation70 was used with periodic boundary corrections71. The basis of atomic orbitals within the atomic sphere approximation spheres included s, p, d and f orbitals ( $l_{max} = 3$ ). In addition, the PBEsol  $GGA-type\ exchange\ correlation\ functional^{72}was\ used.\ Self-consistency$ was achieved using a modified Broyden's second method73. Integration in a complex energy plane was performed using the Chebyshev quadrature semicircular contour with 20 points. Homogeneous atomic disorder was addressed by CPA65. Crystal structures considered included A1 (FCC), A2 (BCC) and A3 (HCP). The ideal  $c/a = (8/3)^{1/2} = 1.632993$  was chosen for the HCP phase. A special k-point mesh74 for Brillouin zone integration included 183 k-points for FCC and BCC one-atom primitive cells and  $16 \times 16 \times 8$  for the HCP two-atom unit cell; an auxiliary secondary  $12^3$  mesh was used for FCC and BCC and  $10 \times 10 \times 6$  for HCP in KKR-CPA code67.

## **Data availability**

The experimental data that support the findings of this study are available from the corresponding author on reasonable request. Source data are provided with this paper.

- 61. Chen, W. et al. Microscale residual stresses in additively manufactured stainless steel. Nat. Commun. 10, 4338 (2019).
- 62. Andersson, J. O., Helander, T., Höglund, L., Shi, P. & Sundman, B. Thermo-Calc & DICTRA, computational tools for materials science. CALPHAD 26, 273–312 (2002).
- 63. Andersson, J. O., Helander, T., Hoglund, L., Shi, P. F. & Sundman, B. Thermo-Calc and Dictra, computational tools for materials science. CALPHAD 26, 273–312 (2016).
- 64. Thavamani, R., Balusamy, V., Nampoothiri, J., Subramanian, R. & Ravi, K. R. Mitigation of hot cracking in Inconel 718 superalloy by ultrasonic vibration during gas tungsten arc welding. J. Alloys Compd. 740, 870–878 (2018).
- 65. Johnson, D. D., Nicholson, D. M., Pinski, F. J., Gyorffy, B. L. & Stocks, G. M. Density-functional theory for random alloys: total energy within the coherent-potential approximation. Phys. Rev. Lett. 56, 2088–2091 (1986).
- 66. Liu, D. et al. Exceptional fracture toughness of CrCoNi-based medium- and high-entropy alloys at 20 Kelvin. Science 983, 978–983 (2022).
- 67. Johnson, D. D., Smirnov, A. V. & Khan, S. N. MECCA: Multiple-Scattering Electronic-Structure Calculations for Complex Alloys (KKR-CPA Program, ver. 2.0) (Iowa State University and Ames Laboratory, 2015).
- 68. Kohn, W. & Rostoker, N. Solution of the Schrödinger equation in periodic lattices with an application to metallic lithium. Phys. Rev. 94, 1111–1120 (1954).
- 69. Korringa, J. On the calculations of the energy of a Bloch wave in a metal. Phys. XIII 6–7, 392–400 (1947).
- 70. Alam, A. & Johnson, D. D. Optimal site-centered electronic structure basis set from a displaced-center expansion: Improved results via a priori estimates of saddle points in the density. Phys. Rev. B 80, 125123 (2009).
- 71. Christensen, N. E. & Satpathy, S. Pressure-induced cubic to tetragonal transition in Csl. Phys. Rev. Lett. 55, 600–603 (1985).
- 72. Perdew, J. P. et al. Restoring the density-gradient expansion for exchange in solids and surfaces. Phys. Rev. Lett. 100, 136406 (2008).

- 73. Johnson, D. D. Modiied Broyden's method for accelerating convergence oin self-consistent calculations. Phys. Rev. Lett. 38, 12807–12813 (1988).
- 74. Monkhorst, H. J. & Pack, J. D. Special points for Brillouin-zone integrations. Phys. Rev. B 13, 5188–5192 (1976).

Acknowledgements Funding for this study was provided by NASA's Aeronautics Research Mission Directorate—Transformational Tools and Technologies Project Ofice and NASA's Space Technology Mission Directorate Game Changing Development Program under the optimized and Repeatable Components in Additive Manufacturing project. M.H. and M.J.M. acknowledge the support of the National Science Foundation and the DMREF programme under grant no. 1922239. For more information on this technology, and to discuss licencing and partnering opportunities, please contact grc-techtransfer@mail.nasa.gov and reference LEW-19886-1 and LEW-20020-1.

Author contributions T.M.S. wrote the manuscript. T.M.S., C.A.K., T.P.G. and P.R.G. designed experiments and performed microstructural/mechanical characterization. T.M.S., M.H. and M.J.M. performed TEM analysis. T.M.S. produced the powder feedstock, both coated and uncoated. A.C.T. operated the EOS M100 and developed the build parameters. B.J.H. performed cyclic oxidation tests. C.A.K., N.A.Z. and J.W.L. performed the CALPAHD and DFT models.

Competing interests The authors declare no competing interests.

#### Additional information

Supplementary information The online version contains supplementary material available at https://doi.org/10.1038/s41586-023-05893-0.

Correspondence and requests for materials should be addressed to Timothy M. Smith. Peer review information Nature thanks Meurig Thomas and the other, anonymous, reviewer(s) for their contribution to the peer review of this work. Peer reviewer reports are available. Reprints and permissions information is available at http://www.nature.com/reprints.

![](_page_9_Picture_1.jpeg)

Extended Data Fig. 1 | Powder Characterization. a,b, Secondary electron SEM images of an uncoated ReB metal powder particle (a) and a coated ReB metal powder particle (b). c, A higher-resolution image of the coating in b.

![](_page_10_Picture_0.jpeg)

Extended Data Fig. 2 | Defect characterization of As-built GRX-810. Optical microscopy image of as-built GRX-810 with optimized print parameters. Image segmentation analysis suggests thatthe density of the as-built part is above 99.97%.

![](_page_11_Figure_1.jpeg)

 $\textbf{Extended Data Fig. 3} | \textbf{Density functional theory computed formation energies of the Ni-Co-Cr system. a-i,} Computed formation energies of A1 (FCC), A2 (BCC), and A3 (HCP) phases at zero pressure versus composition along the selected lines (a) for: b, quaternary (NiCoCr)_{(1:x)/3}Re_x; c-f, ternary; and g, i, binary alloys.$ 

![](_page_12_Figure_0.jpeg)

Extended Data Fig. 4 | Microstructural characterization of HIP GRX-810. a, Electron back scatter diffraction (EBSD) inverse pole figure maps of the X-Y build plane and the Y-Z build plane where the Z-axis represents the build direction. Represented are maps from as-built and HIP samples. No significant

difference was observed between the as-built and post-HIP grain structure. b, STEM-EDS Y, Cr, and Ni maps and corresponding LAADF-DCI micrograph of untested HIP GRX-810.

![](_page_13_Picture_1.jpeg)

Extended Data Fig. 5 | Scanning electron microscopy analysis of asbuilt and HIP GRX-810. a,b, Secondary electron SEM images revealing the microstructure of (a) as-built GRX-810 and (b) HIP GRX-810 transverse to the

build direction (X-Y). In the higher resolution image in b, both MC carbides and nanoscale Y2O3 particles can be observed.

![](_page_14_Figure_0.jpeg)

Extended Data Fig. 6 | Mechanical tests of NiCoCr-based alloys.

a,b, Engineering stress-strain curves at room temperature for the as-built alloys (a) and for HIP alloys (b). The step between 1 % and 2 % strain results from an increase in the tensile strain rate which is consistent with ASTM E8 standard. c, 1,093 °C creep curves for as-built and HIP NiCoCr, NiCoCr-ODS, ODS-ReB at 30MPa. d, The same tests with GRX-810 curves included.

![](_page_15_Figure_1.jpeg)

Extended Data Fig. 7 | Cyclic oxidation results at 1,093 °C and 1,200 °C. a,b,Cyclic oxidation results for GRX-810 and superalloy 718 at 1,093 °C (a) and 1,200 °C (b) up to 100 h. Error bars correspond to 1 standard deviation.

![](_page_16_Figure_0.jpeg)

Extended Data Fig. 8 | Creep results at 1,093 °C / 41MPa. Creep results at higher stress. Creep curves of ReB-ODS and HIP GRX-810 at 41 MPa / 1,093 °C.

![](_page_17_Figure_1.jpeg)

Extended Data Fig. 9 | Optical analysis of creep deformation. a, An optical cross-section of the as-built ODS-ReB sample tested at 1,093 °C / 20 MPa. b, Creep pores/overload cracking along with a Cr-rich nitride in a high plasticity region of the sample. c, A region removed from the fracture surface that reveals creep void formation and lack of nitride formation. d, A representative micrograph of the microstructure in the as-built GRX-810 sample tested at

1,093 °C / 20 MPa that was terminated at 1% strain after 2,800 h. No creep void formation is observed but the presence of Al-rich and Cr-rich nitride phases along grain boundaries can be seen. e, A representative micrograph of the microstructure from the grip section of the same as-built GRX-810 sample revealing that nitrides did not form in an area under no stress. These results suggest that the nitride phases are creep induced.

## Extended Data Table 1 | Overview of tensile results for As-built and HIP GRX-810

| Temperature
(C) | As-Built Tensile
Strength (MPa) | As-built Yield
Strength (MPa) | As-built
Elongation (%) | HIP Tensile
Strength (MPa) | HIP Yield
Strength (MPa) | HIP Elongation (%) |
|--------------------|------------------------------------|----------------------------------|----------------------------|-------------------------------|-----------------------------|--------------------|
| -195.6             | 1,303.1                            | 910.1                            | 39.6                       | 1,227.3                       | 723.9                       | 49                 |
| 21.1               | 882.5                              | 641.2                            | 33                         | 848.1                         | 515                         | 43                 |
| 426.7              | 710.2                              | 527.4                            | 33.3                       | 655                           | 410.2                       | 40                 |
| 648.9              | 675.7                              | 479.2                            | 32.1                       | 630.9                         | 368.9                       | 43                 |
| 871.1              | 292.3                              | 249.6                            | 56.1                       | 262.7                         | 206.2                       | 62                 |
| 1000               | х                                  | х                                | х                          | 164.1                         | 161.3                       | 44                 |
| 1093.3             | 128.9                              | 127.6                            | 22                         | 119.3                         | 115.8                       | 32                 |

Tensile results of as-built and HIP GRX-810 at varying temperatures.
