---
title: Focus Time for well-being and Work Engagement of Information Workers
category: contemporary-analysis
tags:
  - labor
  - unions
  - workers
---

## ![](_page_0_Picture_0.jpeg)

# Focus Time for well-being and Work Engagement of Information Workers

# [Koustuv Saha](https://orcid.org/0000-0002-8872-2934)

Microsoft Research Montreal, Quebec, Canada koustuv.saha@gmail.com

# [Shamsi T. Iqbal](https://orcid.org/0000-0002-9380-8759)

Microsoft Research Redmond, Washington, USA shamsi@microsoft.com

#### ABSTRACT

Having little time for focused work is a major challenge in information work. While research has explored computing-assisted user-facing solutions for protecting time for focused work, there is limited empirical evidence about the effectiveness of these features on well-being and work engagement. Towards this problem, we study the effects of automatically scheduling time for focused work on people's work calendars using the Focus Time feature on Outlook calendars. We conducted an experimental study over six weeks with 15 Treatment and 10 Control participants who responded to survey questions on well-being and work engagement throughout the study. We find that the Treatment participants showed higher well-being, including increased excitement, relaxation, and satisfaction, and decreased anger, frustration, tiredness, and stress. We study the needs, benefits, and challenges of scheduling focus time, and discuss the importance and design recommendations for enabling mechanisms and tools supporting focused work.

#### CCS CONCEPTS

- Human-centered computing → Empirical studies in ubiquitous and mobile computing; Empirical studies in collaborative and social computing; • Applied computing → Psychology.

## KEYWORDS

focus work, time protection, work engagement workplace, well-being, experimental study

#### ACM Reference Format:

Koustuv Saha and Shamsi T. Iqbal. 2023. Focus Time for well-being and Work Engagement of Information Workers. In Extended Abstracts of the 2023 CHI Conference on Human Factors in Computing Systems (CHI EA '23), April 23–28, 2023, Hamburg, Germany. ACM, New York, NY, USA, 11 pages.

#### 1 INTRODUCTION AND BACKGROUND

Managing time better at workplaces is one of the key interests of researchers and practitioners [\[16\]](#page-6-0). Workplaces have forever been evolving, and recently, we have seen an increasing prevalence of remote and hybrid work as stimulated by the COVID-19 pandemic \[15, [49\]](#page-6-2). While such work settings have enabled more flexibility and remote collaborations for information work [\[56\]](#page-7-0),

Permission to make digital or hard copies of part or all of this work for personal or classroom use is granted without fee provided that copies are not made or distributed for profit or commercial advantage and that copies bear this notice and the full citation on the first page. Copyrights for third-party components of this work must be honored. For all other uses, contact the owner/author(s).

CHI EA '23, April 23–28, 2023, Hamburg, Germany © 2023 Copyright held by the owner/author(s). ACM ISBN 978-1-4503-9422-2/23/04.

these have also added complexities in terms of the increased number of meetings, longer work hours, blurred work-life boundaries, more multi-tasking, and disrupted work-life balance \[15, 28, [46\]](#page-6-4). These complexities have simultaneously added limits to an individual's ability and time to do self-focused work, and affected well-being \[11, [51\]](#page-6-6). Prior work has noted the costs of task switching and disruptions due to notifications towards depleted productivity and well-being \[5, 13, 21, 29, 32, [37\]](#page-6-11). Kushlev and Dunn found that limiting email checking reduced stress, and Mark et al. noted that self-interruptions of emails lead to better productivity than notification-based interruptions. Other work found blocking notifications enhanced focused work and reduced multitasking and distractions \[34, [38\]](#page-6-13). Research has also noted the importance of focused work in improving productivity and well-being \[14, 19, 34, [43\]](#page-6-16). Focused work is found to associate with cognitive absorption, which not only significantly impacts an individual's deep involvement, learning [\[1\]](#page-5-1), and creativity [\[9\]](#page-6-17), but also helps them be more relaxed and perceive greater control \[31, [42\]](#page-6-19).

To help individuals dedicate more time to focused work, HCI research has explored methods such as better notifications, timeprotection tools, and other interventions \[10, 17, 20, 22, 25, 27, [53\]](#page-7-1). However, there is a lack of evidence about the in-practice effectiveness and utility of these tools, i.e., how people actually use them in the wild and if these tools achieve the desired goals in the longterm. Towards this goal, this study examines the usage of a tool (Viva Focus Time) that programmatically schedules focus time on an information worker's work calendar and pauses notifications during these periods so that they can dedicate these times for focused work. We leverage validated metrics from organizational behavior research to measure the impact of automatic scheduling of focus time on the eudaimonic well-being in the workplace, or the well-being derived from realizing one's potential [\[8\]](#page-6-26). Our work asks the following research questions:

- RQ1: Immediate well-being and work engagement changes: What are the expected and observed well-being changes of scheduling time for focused work in the short term (each week)?
- RQ2: Overall impact on well-being and work engagement: Does scheduling focus time impact long-term workplace well-being and work engagement?
- RQ3: Use, benefits, and challenges of scheduling focus time: How is the time set aside for focused work used in practice, and what are the perceived benefits and challenges of protecting time as such?

To answer these questions, we conducted a six-week long study with an experimental (Treatment) group who used the Focus Time feature for those six weeks to schedule a time to focus on their calendar on a daily basis to the extent possible. We collected their subjective feedback about their experience, and compared responses on validated workplace well-being measures before and after the study. We also compared the Treatment group with a Control group that did not use Focus Time but filled out the same questionnaires.

We find that, in comparison to the Control, the Treatment individuals showed an increase in their weekly feelings of bursting with energy and a decrease in weekly feelings of stress and difficulty in detaching from work. The Treatment individuals showed also improved well-being in several metrics, including affective attributes like anger, excitement, relaxation, frustration, satisfaction, and tiredness, and workplace engagement attributes such as eagerness to go to work happiness during intense work, learning, and resilience. These observations point out improvements in the well-being of Treatment individuals following the use of Focus Time feature. We also examine what people did during the focus time periods and what are their needs, benefits, and challenges about using this feature. Our results suggest the importance for organizations to facilitate their workers to set aside time to focus on their calendars to improve overall long-term well-being and productivity of the workers. We discuss the implications of this research in designing tools to enable better use of focus time and how to overcome the current challenges with missing notifications and high-priority communications during focus time and emphasizing the transparency about using the Focus Time feature.

#### 2 STUDY AND METHODS

#### 2.1 Scheduling Focus Time in Work Calendar

We investigate the use and effectiveness of an automated service that schedules time on an information worker's work calendar. We work with the Viva Focus Time [\[40\]](#page-6-27) service that comes integrated with Microsoft Outlook's enterprise solutions. When someone enables Focus Time, they can use it to regularly block time for selfconsidered top-priority work by scheduling up to four hours daily to focus. During these Focus Time slots, they appear "busy" on their calendars, and the service can additionally silence notifications of chats and emails on their desktop / mobile work device. Figure 1 shows example figures of configuring Focus Time on someone's outlook calendar. For the study, we asked individuals who had not used the service before to use it to schedule a time to focus on their calendar and see if such a computing-assisted time protection feature would help their well-being and work engagement.

#### 2.2 Recruitment

Our study included two groups of participants — 1) Treatment participants, who would be asked to enable and use Focus Time feature on their work calendars, and 2) Control participants, who would not use Focus Time feature. Both groups responded to the same surveys with minor modifications—an entry survey, weekly check-in surveys, and an exit survey that includes questionnaires on well-being and work engagement.

We conducted our study with U. S.-based information workers through the Dscout platform. Dscout is a qualitative remote research platform [\[55\]](#page-7-2), where individuals can sign-up as "scouts" to participate in various research studies (or "missions") posted by research and product teams. First, we included a screening survey

![](_page_1_Picture_10.jpeg)

## ![](_page_1_Picture_11.jpeg)

Figure 1: Example figures to demonstrate configuring and using Focus Time feature on Outlook calendar.

Table 1: Demographic distribution of study participants.

| Question | Treatment | Control | | |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|--|--|
| Age | 20-30: 2, 30-40: 9, 40-50: 2,
50-60: 1, 60-70: 1 | 20-30: 3, 30-40: 1, 40-50: 5,
50-60: 1 | | |
| Gender | Man: 8, Woman: 7 | Man: 4, Woman: 5, Non
binary: 1 | | |
| Education
Level | College graduate: 9, Post
graduate: 6 | Some college: 1, College
graduate: 4, Post-graduate:
5 | | |
| Household
Income | \$50K-\$75K: 1, \$75K-\$100K:
3, \$100K-\$125K: 3, \$125K-
\$150K: 3, \$150K+: 7 | \$75K-\$100K:
3,
\$100K-
\$125K: 2, \$125K-\$150K: 2,
\$150K: 3 | | |
| Industry | Financial: 3, Software: 3,
Telecom.: 1, Automative:
2, Technology: 1, Sales: 1,
Consulting: 1, Real Estate:
1, Service: 1, Healthcare: 1 | Financial: 3, Healthcare: 2,
Technology: 2, Manufactur
ing: 2, Legal: 1 | | |

to filter in eligible participants. The screening survey included questions related to participant demographics (age, gender, education, ethnicity, employment status, income) and employment attributes (employment status, industry, type of work, computer use, availability of Focus Time feature on workplace email and calendar, etc.). After the screening survey was up on the Dscout platform for over a week, we received 1,579 responses, among which—47 individuals satisfied some core requirements for our study—1) they responded "all or most of my day is spent on computer", 2) they had access to the Focus Time feature, 3) had never used it before, and 4) were willing to try it out for the study. From these 47 individuals, we randomly selected a sample of 25 participants (15 for Treatment and 10 for Control). One Treatment and two Control participants dropped out in the first two weeks and were substituted with three other participants (also randomly selected from the same pool of 47 participants). Each participant stayed in the study for a period of six weeks in July and August 2022 and responded to an intake survey, weekly check-in surveys, and an exit survey. The compensation for completing the study included USD \$100 for Treatment participants and USD \$75 for Control participants. Table 1 presents the demographic distribution of the 25 participants who stayed for the entire study duration.

![](_page_2_Figure_2.jpeg)

Figure 2: Treatment and Control individuals' weekly changes over the study (week 0 is intake and week 7 is exit).

#### 2.3 Self-Reported Surveys

We designed our study not to ask for specific feedback for the tool used by participants but to understand the effects of protecting time for focused work on their calendars. We employed multiple surveys that measure an individual's well-being and engagement at work. These surveys were conducted at the entry (week 0), weekly (week 1 to 6), and exit (week 7) of the study. The surveys administered in week 0 collected baseline data on people's self-perceptions of their workplace well-being and work engagement factors. The same survey questions were asked during exit, to see if six weeks of using automatically scheduled focus time for the Treatment group resulted in any changes in the same factors. For survey questions, we drew on organizational research on the impact of focused work on eudaimonic well-being and workplace engagement-related constructs \[1, 8, 9, 31, [42\]](#page-6-19). We adopted the survey questionnaires from the Utrecht Job Engagement Scale [\[47\]](#page-6-28), Work and Meaning Inventory [\[50\]](#page-6-29), and Job-related Affective well-being scale [\[54\]](#page-7-3). A1 in Appendix provides the survey questions administered at different stages of the study. The weekly check-in surveys were geared towards understanding how well participants could focus at work that week and a few questions on well-being. In addition, the weekly and exit survey questions included qualitative and open-ended survey questions on what the participants did during the Focus Time periods and their perceived benefits and challenges with the feature.

#### 3 FINDINGS

We examine the changes in the well-being measures during the course of the study for the Treatment and Control groups. First, comparing the differences in the two groups during intake of the study, we note that both the groups are well-distributed in demographic parameters \(Table 1\). We also compare the differences in the intake survey for the two groups, which could be considered to be their baseline measures (before any study intervention was conducted). We conduct independent sample -tests to compare the differences to find no significant difference across all the measures in Table A1, except the small significant difference in frustrated (=2.35, - | Treatment were happier during intense work. |
| Stress | 2.38 | 1.08 | 2.92 | 1.29 | -0.45 | -2.77*** | Treatment felt lower stress. |
| Strong and Vigorous | 3.44 | 0.93 | 3.21 | 0.95 | 0.24 | 1.48· | Treatment felt more strong and vigorous. |
| Time Flies | 3.73 | 0.96 | 3.50 | 1.10 | 0.22 | 1.33 | |
| Work Detachment Difficulty | 2.33 | 1.09 | 2.79 | 1.44 | -0.36 | -2.24** | Treatment found it easier to detach from work. |
| Work Immersion | 3.80 | 0.99 | 3.55 | 0.93 | 0.27 | 1.59. | Treatment were more immersed in work. |
| | Work comparison | | | | | | |
| Work Hours | 42.36 | 6.91 | 41.69 | 7.60 | 0.09 | 0.56 | |
| Work Hours Deviation from Norm | 1.91 | 0.57 | 1.97 | 0.62 | -0.09 | -0.57 | |
| Focus Time Quantity | 2.60 | 0.57 | 2.34 | 0.76 | 0.39 | 2.45** | Treatment were able to dedicate more time to focus. |

energy (d=0.38), eagerness to go to work (d=0.24), and work immersion (d=0.27), whereas lower forgetting everything else during work (d=0.44), stress (d=0.45), and difficulty to detach from work (d=0.36). We also note that there was no significant difference in the work hours and the (self-reported) deviation of work hours from typical work hours between the Treatment and Control individuals. So, the directionalities in measures are indicative of positive short-term impact every week among the Treatment individuals than the Control individuals. The Treatment individuals also self-reported a better ability to dedicate time for focused work than the Control individuals; this plausibly validates the use of Focus Time—that the Treatment individuals were actually able to use the feature during the study period.

# 3.2 How well-being measures changed at the end of the study compared to the beginning?

To study RQ2, we conduct a within-person examination of changes from the entry to exit of the study, and measure the average treatment effect (ATE) computed as the mean difference in changes in Treatment and Control groups. Table 3 summarizes the within-person changes, along with ATE and paired-sample *t*-tests. Among affect categories, we find that the Treatment individuals show lowered *anger*, *frustration*, and *tiredness* and increased *excitement*, *relaxation*, and *satisfaction*. Additionally, the Treatment group also got benefited with increased *energy*, *eagerness to go to work*, *happiness during intense work*, and *resilience*, and decreased *feeling tired after waking up*. The other positive changes are hard to be confirmed due to the lack of significance. Overall, we find significant positive results in how the Treatment individuals showed longer-term well-being improvements at the end of the six-weeks study.

#### 3.3 How was Focus Time used during the study?

Finally, for RQ3, we examine the qualitative and open-ended survey components. The following paragraphs report our findings on the use and perceived benefits and challenges of Focus Time.

What people do during Focus Time? The weekly surveys asked the participants, "Out of the booked focus time on your calendar, please check which of the following you recall using it for

(select all that apply." Table 4 shows the distribution of activities that people chose; we find that participants used the feature for several purposes, with maximum responses about focused deep work, catching up on backlogged work, and email and communications.

We also followed this question with "Think about the previous question. Did you plan your activity during the focus time periods?", to which the responses were yes (23), somewhat (53), and no (15). This

Table 4: Activities and quantity of self-reported responses received using Focus Time periods.

| Focused deep work Personal errands Exercise Taking a break Email and communications Catching up on backlogged work Other | 69
22
21
41
61
62
0 |
|--------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
|--------------------------------------------------------------------------------------------------------------------------|---------------------------------------|

indicates that there are several instances that activities during Focus Time can be unplanned or unanticipated apriori.

**Need of Focus Time.** The exit reflection survey asked the Treatment participants about their likelihood to continue using Focus Time, to which 13 participants responded positively (5 responded *extremely likely* and 2 responded *quite likely*), and 2 responded negatively (1 responded *unlikely* and 1 responded *extremely unlikely*). We also asked the Control participants about their desire to use an automated service that could help block times on their calendars on a scale of 1 (I do not want it at all) to 5 (I would very much like to have it), where the average response is 3.4, showing a slight inclination towards the desire to such a service.

Benefits of Focus Time. We asked the Treatment participants about the benefits of having Focus Time on their calendars. A majority of the responses included participants' appreciation for self-time on calendars, and not being disrupted by others booking times for meetings. One participant expressed, "It forced me to keep a block of time open for "me". I mean that it won't let me book my whole day up and not give me time to do the things I need to do."

Another participant described the feature as a "safe haven": "It's so nice to be able to get away from constant meetings. Calendar blocks feel like a safe haven from having to listen to people ask for more and more of your time. It's also so nice to be able to work through a to-do list and actually see the amount I have left to do go

Table 3: Summary of within-person changes in well-being measures from intake to exit of the study for Treatment individuals, along with Average Treatment Effect (ATE), and paired-sample -tests (. <0.1, \* <0.05, \*\* p<0.01, \*\*\*p<0.001). Bar lengths are proportional to ATE magnitude, and for significant rows, pink bars indicate a decrease in Treatment individuals' measure and green bars indicate an an increase in Treatment individuals' measure. The interpretations are only provided for statistically significant rows as per -test; Length of grey bars indicate the magnitude of ATE in non-significant rows.

| Measure | Mean 𝛿Tr. | ATE | 𝑑 | t-test | Interpretation for Treatment individuals |
|----------------------------|-----------|-------|-------|----------|------------------------------------------|
| Angry | -0.53 | -0.48 | 0.61 | 2.26* | Anger decreased |
| Anxious | -0.33 | -0.93 | 0.47 | 1.16 | |
| Excited | 0.73 | 0.93 | -0.92 | -2.13* | Excitement increased |
| Relaxed | 0.60 | 0.70 | -0.95 | -3.67*** | Relaxation increased |
| Frustrated | -0.47 | -0.52 | 0.75 | 2.82** | Frustration decreased |
| Satisfied | 0.47 | 0.47 | -0.51 | -2.43* | Satisfaction increased |
| Tired | -0.47 | -0.67 | 0.67 | 2.17* | Tiredness decreased |
| Bursting Energy | 1.00 | 0.30 | -0.91 | -3.62*** | Bursting with energy increased |
| Carried Away | 0.00 | 0.02 | 0.00 | 0.00 | |
| Continue Long Work | 0.40 | 0 | -0.24 | -0.81 | |
| Eagerness to go to Work | 0.73 | 0.78 | -0.48 | -1.98. | Eagerness to go to work increased |
| Forget Everything Else | 0.40 | 0.35 | -0.25 | -1.19 | |
| Happy During Intense Work | 0.93 | 0.63 | -0.66 | -1.79. | Happiness during intense work increased |
| Time Flies | 0.13 | -0.47 | -0.09 | -0.32 | |
| Learning | 0.07 | 0.32 | -0.05 | -0.17 | |
| Meaningfulness | 0.20 | -0.30 | -0.16 | -0.61 | |
| Perseverance | 0.20 | -0.45 | -0.23 | -0.76 | |
| Personal Growth | 0.40 | 0.50 | -0.29 | -1.38 | |
| Resilience | 0.87 | 0.67 | -0.62 | -2.48* | Resilience increased |
| Self-fulfilment | 0.47 | 0.52 | -0.33 | -1.61 | |
| Self-improvement | -0.20 | -0.30 | 0.15 | 0.51 | |
| Strong and Vigorous | 0.73 | 0.07 | -0.71 | -2.05* | Feeling strong and vigorous increased |
| Tired After Waking Up | -0.93 | -1.03 | 0.61 | 1.90. | Feeling tired after waking up decreased |
| Work Detachment Difficulty | -0.67 | -1.57 | 0.35 | 1.01 | |
| Work Immersion | 0.40 | 0 | -0.25 | -1.87 | |
| Worn Out | -0.27 | -0.22 | 0.19 | 0.55 | |
| Working Too Hard | -0.13 | -0.93 | 0.08 | 0.31 | |

down." Similarly, people reflected on minimizing distractions and being able to do focused work: "Teammates will not book meetings at that time. I know I can get time to do what I need to get done without distractions. I feel more relaxed at this time."

Challenges of Focus Time. Treatment participants responded to what are the drawbacks and challenges of using Focus Time, where we got a variety of responses. Participants were concerned about the misalignment in the actual and their necessary scheduling of time to focus. Two participants expressed that Focus Time schedule might not always coincide with their readiness to focus, such as one expressed: "I felt that the focus time came up so quickly some days that I wasn't prepared to take it at that specific time. I felt that the focus time was too short as well."

Two participants expressed the challenge that others would still be able to book meetings during their Focus Time, and two found it challenging that they had to sometimes schedule meetings during Focus Time: "The challenge of having time blocked is I was not always able to utilize the focus time due to scheduling conflicts."

Five participants expressed that they would like some transparency with specific team members so that they can schedule high-priority meetings even during focus time. A participant was not happy that they were not alerted about the meetings booked during focus time and how they "accidentally missed a meeting with their boss." Similarly, participants also expressed they would like more control over the feature and the ability to personalize what notifications they block or receive during Focus Time, such as, one participant expressed: "I like having time blocked but I disliked the computer doing it for me. I want to do it at different times for different durations vs. ceding control of my calendar."

What can be improved for Focus Time? Finally, we asked the participants if they would like specific things to be improved for Focus Time. Related to the drawbacks expressed above, a majority of the responses were about the desire for more control and the ability to select Focus Time, in terms of scheduling Focus Time at the start of every week and the ability to control the notifications from specific individuals, such as: "I wish I could grant access to a few people to book time during my focus time. But just a few people and blocked off from the others."

Multiple participants also desired for a better visual identifier for Focus Time which is different from "available" and "busy" status on internal communication platform (Teams) and email (outlook) interface: "Come up with an easily identified universal visual indication of focus time, whether that's a color, a line shape, or something like that, so that it is easily identified at a glance by all users."

#### 4 DISCUSSION AND CONCLUSION

#### 4.1 Implications

This study provides empirical insights into the effectiveness of a computing-assisted time protection service (Focus Time) in scheduling time to focus, and how that impacts the eudaimonic well-being and work engagement of information workers. Our findings show promising evidence of how such a service improves worker well-being. The findings largely support prior research about the efficacy of digital time protection, including how dedicating time to oneself without notification disruptions can help improve a worker's stress levels, well-being, and engagement \[13, 14, 36, [37\]](#page-6-11). Our study suggests heterogeneity in characterizing "focus" in Focus Time varying responses across focused deep work, personal errands, exercise, taking a break, emails, and catching up with backlogged work. It is plausible that focus time can be used in other ways depending on the needs and desires of a worker and a specific situation. This motivates further research into understanding how self-focus time is used. Our findings reveal new insights into how the definition of "focused work" may have evolved over changing work settings—Mark et al. noted that focused work is associated with higher stress; however, our findings reveal that information workers' stress is reduced after using Focus Time.

We found that some participants desired more control in scheduling Focus Time, and some expressed the misalignment between when they want and when the system schedules Focus Time. This motivates building tools accounting for both user control and semiautomated personalized approaches leveraging user behaviors and context (as seen in \[12, 39, [44\]](#page-6-34)). Additionally, dedicating time for focus work might seem too generic, and individuals may not realize the purpose of these periods (as also observed in our study). This calls for designing and evaluating tools that are more specific with recommendations on how a user could use the time (e.g., recommending "exercise time", "email communications time").

Our work also noted the challenges individuals faced with using Focus Time. While these challenges and mitigation strategies not only provide new insights into designing Focus Time-related features but also opens up new discussions on how better transparency, awareness, and explainability about the feature could help prevent some of the concerns, borrowing from anticipatory ethics research \[2, [6\]](#page-6-35). For instance, can we think of information guides that come with these tools which not only inform the users about the information and usecase about the technology but also the likely "side-effects" of using the technologies, such as how these are described in medication guides that come with prescription drugs? It would be interesting to study if such approaches could help prevent some of the potential challenges.

This work also bears organizational and policy-facing implications, especially showing how productivity and well-being benefits are intertwined. Our work provides empirical insights into how dedicating time to an individual's focused work can help them improve their well-being. Therefore, organizations can also include dedicated, focused time work as a part of the employees' work schedules. This can be along the lines of what organizations have recently been exploring the policies of no-meeting day, no-meeting week, and flexible work-week to enhance worker well-being \[30, [48\]](#page-6-37). Further, we observed that participants expressed challenges that others would still schedule meetings during Focus Time or they would feel the necessity to prioritize meetings over focused work during these periods. Some of these practices may not necessarily be technology-driven but rather systemic—organizations can promote culture and norms of respecting each others' focus times to facilitate a thriving environment. Together, these approaches can help workers manage their workload better and be happier and more productive at work.

It would be interesting to examine if features such as Focus Time can be gamified. Employers can be worried that workers could misuse these features for "me-time" when they are on their employers' time and evade work-related responsibilities. Employers can build these features to gather more transparency about what employees do during Focus Time periods. However, such tools will cause workplace surveillance and bossware-related concerns \[3, 7, 18, [45\]](#page-6-40). It remains essential to navigate these tensions between employee privacy and employer transparency needs. Therefore, this work motivates gathering multi-stakeholder perspectives about these technologies from organizational leaders, HR and policymakers, AI builders, and worker data subjects, and co-designing exercises of what improvements can be made with services such as Focus Time. While this study was specifically about focus work features on work devices, there are similar features on other devices, such as smartphones that block notifications during specific times of the day (e.g., during sleep or focused work). It would be interesting to examine the effectiveness of such features on digital well-being.

#### 4.2 Limitations and Future Directions

While the findings are promising, we acknowledge that our pool is small (25), for a short duration (six weeks), and limited to U. S. information workers. Therefore, we cannot make conclusive generalizability claims. Our study is also not immune to novelty effects [\[26\]](#page-6-41), i.e., it is possible that the participants found the feature exciting and used it during the study. Interestingly, participants did not complain about the burden of using a service, an expected issue in the design and deployment of new HCI tools [\[33\]](#page-6-42). However, the long-term user burden and acceptance of the feature remains unknown [\[23\]](#page-6-43). Therefore, our work motivates future research in evaluating the effectiveness on a larger scale and longer duration. While it was out of scope from the current study, we also noted some positive improvements in the Control individuals, which could be attributed to the advantages of personal journaling and self-reflections \[4, [52\]](#page-6-44) that these participants periodically did when responding to weekly surveys. In addition, our participants may have been subjected to observer effect [\[41\]](#page-6-45) and our study likely suffers from self-selection biases—we only studied participants willing to use Focus Time and participate in the study. Studies through passive sensing could be a means to mitigate some of these limitations. However, such research or real-world experiments could raise ethical and privacy-related concerns [\[24\]](#page-6-46). This provokes discussion in designing research that balances privacy-related concerns but obtains holistic findings about the need and efficacy of such computing-assisted technologies at workplaces.

#### REFERENCES

- [1] Ritu Agarwal and Elena Karahanna. 2000. Time flies when you're having fun: Cognitive absorption and beliefs about information technology usage. MIS quarterly (2000), 665–694.
- [2] Matthew Arnold, Rachel KE Bellamy, Michael Hind, Stephanie Houde, Sameep Mehta, Aleksandra Mojsilović, Ravi Nair, K Natesan Ramamurthy, Alexandra Olteanu, David Piorkowski, et al. 2019. Fact Sheets: Increasing trust in AI services through supplier's declarations of conformity. IBM Journal of Research and Development 63, 4/5 (2019), 6–1.
- [3] Kirstie Ball. 2021. Electronic Monitoring and Surveillance in the Workplace. Publications Office of the European Union, Luxembourg, doi 10 (2021), 5137.
- [4] Eric PS Baumer, Vera Khovanskaya, Mark Matthews, Lindsay Reynolds, Victoria Schwanda Sosik, and Geri Gay. 2014. Reviewing reflection: on the use of reflection in interactive system design. In Proceedings of the 2014 conference on Designing interactive systems. 93–102.
- [5] Piotr Bialowolski, Eileen Mc Neely, Tyler J Vander Weele, and Dorota Weziak-Bialowolska. 2020. Ill health and distraction at work: Costs and drivers for productivity loss. Plos one 15, 3 (2020), e0230562.

- [6] Margarita Boyarskaya, Alexandra Olteanu, and Kate Crawford. 2020. Overcoming failures of imagination in AI infused system development and deployment. ar Xiv preprint ar Xiv:2011.13416 (2020).
- [7] danah boyd and Kate Crawford. 2012. Critical questions for big data: Provocations for a cultural, technological, and scholarly phenomenon. Information, communication & society 15, 5 (2012), 662–679.
- [8] Steven P Brown. 1996. A meta-analysis and review of organizational research on job involvement. Psychological bulletin 120, 2 (1996), 235.
- [9] Aldijana Bunjak, Matej Černe, and Aleš Popovič. 2021. Absorbed in technology but digitally overloaded: Interplay effects on gig workers' burnout and creativity. Information & Management 58, 8 (2021), 103533.
- [10] Scott A Cambo, Daniel Avrahami, and Matthew L Lee. 2017. Break Sense: Combining physiological and location sensing to promote mobility during work-breaks. In Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems. 3595–3607.
- [11] Hancheng Cao, Chia-Jung Lee, Shamsi Iqbal, Mary Czerwinski, Priscilla NY Wong, Sean Rintel, Brent Hecht, Jaime Teevan, and Longqi Yang. 2021. Large scale analysis of multitasking behavior during remote meetings. In Proc. CHI.
- [12] Farhan Asif Chowdhury, Yozen Liu, Koustuv Saha, Nicholas Vincent, Leonardo Neves, Neil Shah, and Maarten W Bos. 2021. CEAM: the effectiveness of cyclic and ephemeral attention models of user behavior on social platforms. In Proceedings of the international AAAI conference on web and social media.
- [13] Mary Czerwinski, Eric Horvitz, and Susan Wilhite. 2004. A diary study of task switching and interruptions. In Proceedings of the SIGCHI conference on Human factors in computing systems. 175–182.
- [14] Vedant Das Swain, Javier Hernandez, Brian Houck, Koustuv Saha, Jina Suh, Ahad Chaudhry, Tenny Cho, Wendy Guo, Shamsi Iqbal, and Mary Czerwinski. 2023. Focused Time Saves Nine: Evaluating Computer-Assisted Protected Time for Hybrid Information Work. In Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems.
- [15] Vedant Das Swain, Koustuv Saha, Gregory D Abowd, and Munmun De Choudhury. 2020. Social media and ubiquitous technologies for remote worker well-being and productivity in a post-pandemic world. In 2020 IEEE Second International Conference on Cognitive Machine Intelligence (CogMI). IEEE, 121–130.
- [16] Edeltraud Egger and Ina Wagner. 1992. Time-Management: A Case for CSCW. In Proceedings of the 1992 ACM Conference on Computer-Supported Cooperative Work (Toronto, Ontario, Canada) (CSCW '92). New York, NY, USA.
- [17] Daniel A Epstein, Daniel Avrahami, and Jacob T Biehl. 2016. Taking 5: Workbreaks, productivity, and opportunities for personal informatics for knowledge workers. In Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems. 673–684.
- [18] Saby Ghoshray. 2013. Employer surveillance versus employee privacy: The new reality of social media and workplace privacy. N. Ky. L. Rev. 40 (2013), 593.
- [19] Ted Grover, Kael Rowan, Jina Suh, Daniel Mc Duff, and Mary Czerwinski. 2020. Design and evaluation of intelligent agent prototypes for assistance with focus and productivity at work. In Proceedings of the 25th International Conference on Intelligent User Interfaces. 390–400.
- [20] Esther Howe, Jina Suh, Mehrab Bin Morshed, Daniel Mc Duff, Kael Rowan, Javier Hernandez, Marah Ihab Abdin, Gonzalo Ramos, Tracy Tran, and Mary P Czerwinski. 2022. Design of Digital Workplace Stress-Reduction Intervention Systems: Effects of Intervention Type and Timing. In CHI Conference on Human Factors in Computing Systems. 1–16.
- [21] Shamsi T Iqbal and Eric Horvitz. 2007. Disruption and recovery of computing tasks: field study, analysis, and directions. In Proceedings of the SIGCHI conference on Human factors in computing systems. 677–686.
- [22] Shamsi T Iqbal and Eric Horvitz. 2010. Notifications and awareness: a field study of alert usage and preferences. In Proceedings of the 2010 ACM conference on Computer supported cooperative work. 27–30.
- [23] Bahar Irfan, Aditi Ramachandran, Samuel Spaulding, Dylan F Glas, Iolanda Leite, and Kheng Lee Koay. 2019. Personalization in long-term human-robot interaction. In 2019 14th ACM/IEEE International Conference on Human-Robot Interaction (HRI). IEEE, 685–686.
- [24] Jukka Jouhki, Epp Lauk, Maija Penttinen, Niina Sormanen, and Turo Uskali. 2016. Facebook's emotional contagion experiment as a challenge to research ethics. Media and Communication 4 (2016).
- [25] Everlyne Kimani, Kael Rowan, Daniel Mc Duff, Mary Czerwinski, and Gloria Mark. 2019. A conversational agent in support of productivity and well-being at work. In 2019 8th international conference on affective computing and intelligent interaction (ACII). IEEE, 1–7.
- [26] Michael Koch, Kai von Luck, Jan Schwarzer, and Susanne Draheim. 2018. The novelty effect in large display deployments–Experiences and lessons-learned for evaluating prototypes. In Proceedings of 16th European conference on computersupported cooperative work-exploratory papers. European Society for Socially Embedded Technologies (EUSSET).
- [27] Seyma Kucukozer-Cavdar, Tugba Taskaya-Temizel, Abhinav Mehrotra, Mirco Musolesi, and Peter Tino. 2021. Designing Robust Models for Behaviour Prediction Using Sparse Data from Mobile Sensing: A Case Study of Office Workers' Availability for Well-being Interventions. ACM Transactions on Computing for

- Healthcare 2, 4 (2021), 1–33.
- [28] Andrew Kun, Orit Shaer, and Shamsi Iqbal. 2021. The Future of Work: COVID-19 and Beyond. IEEE Pervasive Computing 20, 04 (2021), 7–8.
- [29] Kostadin Kushlev and Elizabeth W Dunn. 2015. Checking email less frequently reduces stress. Computers in Human Behavior 43 (2015), 220–228.
- [30] Ben Laker, Vijay Pereira, Pawan Budhwar, and Ashish Malik. 2022. The surprising impact of meeting-free days. MIT Sloan Management Review (2022).
- [31] Pierre-Majorique Léger, Fred D Davis, Timothy Paul Cronan, and Julien Perret. 2014. Neurophysiological correlates of cognitive absorption in an enactive training context. Computers in Human Behavior 34 (2014), 273–283.
- [32] Kevin P Madore, Anna M Khazenzon, Cameron W Backes, Jiefeng Jiang, Melina R Uncapher, Anthony M Norcia, and Anthony D Wagner. 2020. Memory failure predicted by attention lapsing and media multitasking. Nature 587, 7832 (2020), 87–91.
- [33] Nikola Marangunić and Andrina Granić. 2015. Technology acceptance model: a literature review from 1986 to 2013. Universal access in the information society 14, 1 (2015), 81–95.
- [34] Gloria Mark, Shamsi Iqbal, and Mary Czerwinski. 2017. How blocking distractions affects workplace focus and productivity. In Proceedings of the 2017 ACM International Joint Conference on Pervasive and Ubiquitous Computing and Proceedings of the 2017 ACM International Symposium on Wearable Computers. 928–934.
- [35] Gloria Mark, Shamsi T Iqbal, Mary Czerwinski, and Paul Johns. 2014. Bored mondays and focused afternoons: The rhythm of attention and online activity in the workplace. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems. ACM, 3025–3034.
- [36] Gloria Mark, Shamsi T Iqbal, Mary Czerwinski, Paul Johns, and Akane Sano. 2016. Neurotics can't focus: An in situ study of online multitasking in the workplace. In Proceedings of the 2016 CHI conference on human factors in computing systems. 1739–1744.
- [37] Gloria Mark, Shamsi T Iqbal, Mary Czerwinski, Paul Johns, Akane Sano, and Yuliya Lutchyn. 2016. Email duration, batching and self-interruption: Patterns of email use on productivity and stress. In Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems. ACM, 1717–1728.
- [38] Gloria Mark, Stephen Voida, and Armand Cardello. 2012. " A pace not dictated by electrons" an empirical study of work without email. In Proceedings of the SIGCHI conference on human factors in computing systems. 555–564.
- [39] Abhinav Mehrotra, Fani Tsapeli, Robert Hendley, and Mirco Musolesi. 2017. My Traces: Investigating correlation and causation between users' emotional states and mobile phone interaction. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies 1, 3 (2017), 1–21.
- [40] Microsoft. 2023. Focus plan, Microsoft Viva Insights. [https://learn.microsoft.com/](https://learn.microsoft.com/en-us/viva/insights/personal/use/focus-plan) [en-us/viva/insights/personal/use/focus-plan.](https://learn.microsoft.com/en-us/viva/insights/personal/use/focus-plan) Accessed: 2023-01-19.
- [41] David Oswald, Fred Sherratt, and Simon Smith. 2014. Handling the Hawthorne effect: The challenges surrounding a participant observer. Review of social studies 1, 1 (2014), 53–73.
- [42] Iris Reychav and Dezhi Wu. 2015. Are your users actively involved? A cognitive absorption perspective in mobile training. Computers in Human Behavior 44 (2015), 335–346.
- [43] Daniel Russo, Paul HP Hanel, Seraphina Altnickel, and Niels van Berkel. 2021. Predictors of well-being and productivity among software professionals during the COVID-19 pandemic–a longitudinal study. Empirical Software Engineering 26, 4 (2021), 1–63.
- [44] Koustuv Saha, Yozen Liu, Nicholas Vincent, Farhan Asif Chowdhury, Leonardo Neves, Neil Shah, and Maarten W Bos. 2021. Adver Timing Matters: Examining User Ad Consumption for Effective Ad Allocations on Social Media. In Proc. CHI.
- [45] Koustuv Saha, Manikanta D Reddy, Stephen Mattingly, Edward Moskal, Anusha Sirigiri, and Munmun De Choudhury. 2019. Libra: On linkedin based role ambiguity and its relationship with well-being and job performance. Proceedings of the ACM on Human-Computer Interaction 3, CSCW (2019), 1–30.
- [46] Advait Sarkar, Sean Rintel, Damian Borowiec, Rachel Bergmann, Sharon Gillett, Danielle Bragg, Nancy Baym, and Abigail Sellen. 2021. The promise and peril of parallel chat in video meetings for work. In Extended Abstracts of the 2021 CHI Conference on Human Factors in Computing Systems. 1–8.
- [47] Wilmar B Schaufeli, Arnold B Bakker, and Marisa Salanova. 2003. Utrecht work engagement scale-9. Educational and Psychological Measurement (2003).
- [48] David A Shore. 2013. Fewer. Shorter. Better: Effective and efficient meetings for higher performing organizations. Journal of health communication 18, 11 (2013), 1275–1278.
- [49] Danijela Sokolic. 2022. Remote work and hybrid work organizations. Economic and social development: Book of proceedings (2022), 202–213.
- [50] Michael F Steger, Bryan J Dik, and Ryan D Duffy. 2012. Measuring meaningful work: The work and meaning inventory (WAMI). Journal of career Assessment 20, 3 (2012), 322–337.
- [51] Shaun Subel, Martin Stepanek, and Thomas Roulet. 2022. How shifts in remote behavior affect employee well-being. MIT Sloan Management Review 63, 3 (2022), 1–6.
- [52] Alice Thudt, Uta Hinrichs, Samuel Huron, and Sheelagh Carpendale. 2018. Selfreflection and personal physicalization construction. In Proceedings of the 2018

- CHI Conference on Human Factors in Computing Systems. 1–13.
- [53] Vincent W-S Tseng, Matthew L Lee, Laurent Denoue, and Daniel Avrahami. 2019. Overcoming distractions during transitions from break to work using a conversational website-blocking system. In Proceedings of the 2019 CHI conference on human factors in computing systems. 1–13.
- [54] Paul T Van Katwyk, Suzy Fox, Paul E Spector, and E Kevin Kelloway. 2000. Using the Job-Related Affective Well-Being Scale (JAWS) to investigate affective responses to work stressors. Journal of occupational health psychology 5, 2 (2000),
- 219.
- [55] Michael Winnick. 2012. dscout. In Ethnographic Praxis in Industry Conference Proceedings, Vol. 2012. Wiley Online Library, 378–378.
- [56] Longqi Yang, David Holtz, Sonia Jaffe, Siddharth Suri, Shilpi Sinha, Jeffrey Weston, Connor Joyce, Neha Shah, Kevin Sherman, Brent Hecht, et al. 2022. The effects of remote work on collaboration among information workers. Nature human behaviour 6, 1 (2022), 43–54.

### A APPENDIX

Table A1: List of survey questions on worker well-being and work engagement and their occurrence in the study.

| Keyword | Question | Response | When? |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|---------------------|
| Angry | Over the last 30 days, how often have you felt angry at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Anxious | Over the last 30 days, how often have you felt anxious at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Excited | Over the last 30 days, how often have you felt excited at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Relaxed | Over the last 30 days, how often have you felt relaxed at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Frustrated | Over the last 30 days, how often have you felt frustrated
at work? | 1 (never) to 5 (always) | Entry, Exit |
| Satisfied | Over the last 30 days, how often have you felt satisfied at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Tired | Over the last 30 days, how often have you felt tired at
work? | 1 (never) to 5 (always) | Entry, Exit |
| Tired after waking up | I feel tired as soon as I get up in the morning and see a
new working day stretched out in front of me. | 1 (never) to 7 (always) | Entry, Exit |
| Self-fulfillment | I have achieved many rewarding objectives at work | 1 (never) to 7 (always) | Entry, Exit |
| Personal growth | I view my work as contributing to my personal growth | 1 (absolutely untrue) to 5 (absolutely true) | Entry, Exit |
| Meaningfulness | I have a good sense of what makes my job meaningful | 1 (absolutely untrue) to 5 (absolutely true) | Entry, Exit |
| Bursting with energy | At work, I feel bursting with energy. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Carried away | I get carried away when I am working. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Continue long work | I can continue working for very long periods at a time. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Eagerness to go to work | When I get up in the morning, I feel like going to work. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Forget everything else | When I am working, I forget everything else around me. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Happy at intense work | I feel happy when I am working intensely. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Stress | At the end of the week, I felt stressed. | 1 (strongly disagree) to 5 (strongly agree) | Weekly |
| Strong and Vigorous | At work, I feel strong and vigorous. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Work detachment difficulty | It is difficult to detach myself from my work. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Work immersion | I am immersed in my work. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Time flies | Time flies when I am working. | 1 (never) to 7 (always) | Entry, Weekly, Exit |
| Resilience | At my job, I am very resilient, mentally. | 1 (never) to 7 (always) | Entry, Exit |
| Perseverence | At my work, I always persevere, even when things do not
go well. | 1 (never) to 7 (always) | Entry, Exit |
| Learning | I continue to learn more and more as time goes by. | 1 (strongly disagree) to 7 (strongly agree) | Entry, Exit |
| Self-improvement | I see myself continually improving. | 1 (strongly disagree) to 7 (strongly agree) | Entry, Exit |
| Worn out | I feel worn out at the end of a working day. | 1 (never) to 7 (always) | Entry, Exit |
| Focus Time Quantity | For Treatment: How often did you use the Focus blocks
set by the focus time plan?
For Control: Please look at your calendar for the past 5
work days. How much time in total have you blocked for
yourself to focus on heads-down work? | Open Textbox on hours | Weekly, Exit |

![](_page_10_Figure_2.jpeg)

Figure A1: Comparison of Treatment and Control individuals' distribution of responses. Dotted lines represent the mean of the distribution of respective colors.
