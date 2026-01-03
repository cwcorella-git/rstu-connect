# Workplace Rhythm Variability and Emotional Distress in Information Workers

[Subigya Nepal](https://orcid.org/0000-0002-4314-9505)<sup>∗</sup> Dartmouth College Hanover, NH, USA sknepal@cs.dartmouth.edu

Mehrab Bin Morshed Georgia Institute of Technology Atlanta, GA, USA mehrab.morshed@gatech.edu

Javier Hernandez Microsoft Research Cambridge, MA, USA javierh@microsoft.com

Robert Lewis MIT Media Lab Cambridge, MA, USA roblewis@media.mit.edu

Mary Czerwinski Microsoft Research Redmond, WA, USA marycz@microsoft.com Judith Amores Fernandez Microsoft Research Redmond, WA, USA judithamores@microsoft.com

Hemma Prafullchandra Microsoft Mountain View, CA, USA hemmap@microsoft.com

![](_page_0_Picture_9.jpeg)

## ![](_page_0_Figure_10.jpeg)

Figure 1: We examine workplace rhythms by taking a holistic approach to the potential impact on workers' social, biological, and behavioral rhythms. In particular, we analyze outcome variables for depression, stress, and anxiety with passively collected digital activity as well as self-reports and their variance over the course of a four-week naturalistic study.

## ABSTRACT

Regularity in daily activities has been linked to positive well-being outcomes, but previous studies have mainly focused on clinical populations and traditional daily activities such as sleep and exercise. This research extends prior work by examining the regularity of both self-reported and digital activities of 49 information workers in a 4-week naturalistic study. Our findings suggest that greater variability in self-reported mood, job demands, lunch time, and sleep quality may be associated with increased stress, anxiety, and depression. However, when it comes to digital activity-based measures, greater variability in rhythm is associated with reduced emotional distress. This study expands our understanding of workers and the potential insights that can be gained from analyzing technology interactions and well-being.

## CCS CONCEPTS

- Human-centered computing → Human computer interaction (HCI); Collaborative and social computing;

## KEYWORDS

Social Computing, Passive Sensing, Future of Work, Information Workers, Routine, Workplace Rhythm, Well-being, Regularity

## 1 INTRODUCTION

Maintaining a consistent structure in everyday life has several benefits – it can alleviate anxiety, promote healthy habits, help combat burnout, and can be especially helpful in times of unpredictability, uncertainty, and stress. We term this consistent daily structure as 'rhythm'. It is defined as a predictable and repeatable pattern that brings about comfort and well-being, be it emotionally, mentally, or physically. Most prior work studying rhythm or regular daily schedules reports that it is an integral part of a healthy lifestyle \[3, [35\]](#page-6-0). Irregularity in different social and behavioral rhythms has been found to be associated with adverse health outcomes, decreased

<sup>∗</sup>Work performed during an internship at Microsoft Research.

productivity, and diminishing life satisfaction in people \[20, [33\]](#page-6-2). Studies report, for instance, that too much variation in behavioral rhythms, such as one's sleep schedule, physical activity, and eating behavior, is associated with poorer well-being \[25, [36\]](#page-6-4) and performance \[15, [39\]](#page-6-6). It is important to note that, whereas most of these studies focus on the clinical population, we emphasize rhythms associated with the workplace in this current study. While work is an integral part of our daily lives, it has also been identified as one of the significant sources of human stress [\[31\]](#page-6-7). Therefore, we draw insight into this critical aspect of work that has been found to play an essential role in overall worker well-being.

In this work, we study N=49 information workers during four weeks of regular work. For the purpose of this study, we define an information worker as an individual who engages in tasks that involve acquiring, manipulating, and generating information [\[16\]](#page-6-8). While the majority of the prior work that studies workplace rhythm or routine patterns typically relies on self-reports \[5, 26, [38\]](#page-6-10), in this work, we use custom developed logging software to collect digital activity-based workplace rhythm from the information workers, in addition to the more typical self-reported data. Such passivelysensed digital activities are objective and can offer insights into workplace rhythm that may not be available from self-reports. We argue that one cannot get a complete picture of workers' workplace rhythm without capturing their digital activity, especially since the participants in our study are information workers who spend most of their time working on the computer. We perform a series of analyses to identify relationships between the self-reported emotional distress of the participants (e.g., stress, anxiety, and depression) and deviations in their workplace rhythm derived from their digital footprint. Our study expands on the literature around workplace rhythm in the following ways: first, our results identify linkages between the variability in workplace rhythm of information workers' behaviors and well-being that have not been explored previously; and second, while the majority of the prior studies examined clinical populations in relation to rhythm or routines, we study information workers as they go about their everyday lives. Our work can act as a proof-of-concept towards supporting the relationship between digital traces of behavior and the subjective well-being perceived by information workers. It enables us to envision a system that infers the well-being of information workers and detects the early onset of chronic issues on the job, such as burnout.

# 2 RELATED WORK

Much of the past work studying work rhythms has focused on the time demand aspect of the work, such as the variability in time pressure [\[26\]](#page-6-9) and work schedule [\[38\]](#page-6-10). Variability in sleep [\[34\]](#page-6-11) as well as dietary habits \[27, 34, [44\]](#page-6-13) such as mealtimes, have also been explored either as mediators, or direct antecedents of poorer mental well-being at work. Previous work has also shown how irregularity in social rhythms [\[23\]](#page-6-14) is linked to stress, anxiety, depression, and even bipolar disorder [\[21\]](#page-6-15). Biological or circadian rhythms that control functions like sleep are influenced by workplace stress, and their disruption has direct implications for mood regulation and mental health. The irregularity or lag in synchronizing these internal rhythms to environmental or workplace rhythms disrupts sleep and causes mood swings, daytime fatigue, hormonal changes, and might even cause gastrointestinal problems \[37, [43\]](#page-6-17). Similarly, night-time workers such as nurses, who also suffer from mood changes, report higher anxiety levels, poorer work performance and higher risk of accidents [\[12\]](#page-6-18). With information workers (IWs), passive sensing can be used to gain a more objective understanding of their workplace behavior \[8, 22, 28, [30\]](#page-6-22) and how they relate to well-being [\[29\]](#page-6-23).

Some studies on workers' "routineness" used digital activity or sensing data. Brdiczka et al. [\[5\]](#page-5-1) shadowed ten knowledge workers over 29 days, writing down the details about user tasks and task start/end times. The authors concluded that the routineness of tasks correlates with the workers' perceived workload, autonomy, and productivity. Tag et al. [\[41\]](#page-6-24) used electrooculography sensors integrated into regular glasses' frames to unobtrusively and continuously monitor alertness levels throughout the day. In a different study, Amon et al. [\[2\]](#page-5-2) used a wearable sensor to measure the health regularity of 483 information workers. The authors reported that greater regularity in health was associated with higher neuroticism, lower agreeableness, and greater interpersonal and organizational deviance. Other studies have focussed on sleep, affect [\[6\]](#page-6-25) as well as psychological constructs, such as mood \[1, [18\]](#page-6-26). In our study, we report on the association between variability in workplace rhythm and the mental well-being of information workers by utilizing their digital activity and several self-reported metrics.

Compared to previous research, one of the primary contributions of this work is that by using passive-sensing techniques, we can examine workplace rhythms more holistically. By studying the relationship between telemetry data such as the number of emails sent, meetings attended, working hours, mouse movement, keyboard, and application activity (amongst many others); we can extract patterns that are common in everyday rhythms and that affect workers, such as behavioral, social, and biological rhythms (as shown in Figure 1\).

# 3 METHODOLOGY

## 3.1 Study Design

We conducted a naturalistic study of 49 information workers at a large technology company in the United States for four weeks during the summer of 2021. Participants installed a custom data logging software and completed daily, and weekly surveys, with daily responses used to generate work rhythms. Emotional distress was self-reported weekly and the study was approved by the institutional review board. Baseline demographic information was also collected, and participants received a \$300 gift card for completing the study. The software used for logging purposes was custom-built to capture digital manifestations of emotional distress and collect information on computer-based activities and behaviors. Table 1 shows the list of behaviors we collected. While we discuss important and relevant information from the study regarding workplace rhythm, please refer to [\[24\]](#page-6-27) for full study details.

## 3.2 Demographics

We have an almost even split of participants who identify as females (42.86%, N=21) and males (53.06%, N=26). Two of the participants identify as non-binary (4.08%). Most participants are in the 26- 35 (36.73%, N=18) and 36-45 (36.73%, N=18) age groups. 4.08% (N=2)

Table 1: Summary of behaviors we collect from the participants to capture their workplace rhythms.

| Category | Workplace Rhythm Facet |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Self-reported | |
| Mood | Valence, arousal |
| Job demand | Ratio between job demands and job resources |
| Meal habit | Breakfast time, lunch time |
| Sleep | Bedtime, wakeup time, number of awakenings, sleep quality, sleep duration |
| Passively-sensed | |
| Mail | Number of emails sent, number of emails received, number of email threads,<br>number of CC'd emails |
| Calendar | Number of meetings attended, working hours, number of tentative meetings, busy duration |
| Mouse | Mouse movement duration, mouse movement count, mouse movement speed, |
| | mouse wheel count, mouse wheel speed, mouse wheel duration, number of mouse events |
| Keyboard | Keypress count, keypress speed, key press duration, number of keyboard events |
| Application Usage | Number of unique attention signals (i.e., number of times there was keyboard or mouse activity),<br>number of unique processes exited, |
| | number of unique status changed (i.e., number of times the user locks the screen), |
| | average task switch duration (i.e., average time spent on different apps), |
| | number of foreground applications, average application usage time, |
| | number of windows closed, number of documents started, number of unique process ids |
| | number of startups (i.e., number of times the user unlocks the screen), |
| | number of titles started (i.e., number of times a window is opened) |

have attended college, 46.94% (N=23) have a bachelor's degree, 2.04% (N=1) have some postgraduate degree, 44.90% (N=22) have a master's degree and 2.04% (N=1) have a doctorate degree. Finally, the majority of our participants work in engineering/development (59.18%, N=29) related occupation, followed by sales (14.29%, N=7), technical support (10.20%, N=5), marketing (6.12%, N=3), strategy (6.12%, N=3) and human resources (4.08%, N=2).

# 3.3 Ground Truth Emotional Distress

We used the Depression Anxiety Stress Scales (DASS) [\[14\]](#page-6-28) survey, which consists of 21 questions, to collect ground truth on emotional distress from participants. In particular, the survey assesses depression, anxiety, and stress. Participants answered on a scale of 0-3 how much each statement applied to them in the past week. We then aggregated the scores for each participant to develop an overall DASS score for each component. Figure 2 shows the distribution of these scores.

## 3.4 Measuring Variability in Workplace Rhythm

3.4.1 Inferred Workplace Rhythms. We infer the participants' workplace rhythms across multiple behaviors: their mood, their job demands at work, their meal habits, their sleep habits, and the passively sensed telemetry data collected from their computers. We discuss the inferred behaviors in more detail below.

Sleep: Participants were asked to self-report their sleep from the previous night at the start of each day. They were asked about the time they went to bed, the time they got out of bed, the number of awakenings, and the sleep quality on a scale of 1-5 (1 being poor and 5 being excellent).

Mood: We assessed participants' mood by asking them to rate their level of energy and pleasantness experienced that day, using a Likert scale from 1-5 (1 being the least and 5 being the highest). These questions captured two components of mood: valence (positive or negative) and arousal (intensity of the experience). Valence refers to whether the experience was pleasant or unpleasant, whereas arousal refers to the level of energy experienced.

Job demands and resources: Jobs have two main variables: demands and resources. Demands refer to tasks that must be done and can have a psychological or physiological cost to the worker. Resources are factors that help workers achieve their goals, deal with demands, or promote growth. The relationship between demands and resources is studied in organizational psychology. In particular, the Job demand-resources model (JD-R) [\[4\]](#page-5-4) argues that a balance between the two is important to avoid negative effects on job satisfaction, stress, and burnout [\[9\]](#page-6-29). In this study, participants were asked to rate their perceived job demands and resources at the end of the day on a scale from 1-5.

Meal habit: We also asked participants to report the kind of meal they had before the end of each working day and when they consumed each.

Digital activity: Participants installed a custom passive sensing application on their work computer for the study. The application runs in the background and generates high-level metadata based on the participants' computer usage (see Table 1\). Note that the logger does not collect any identifiable user content.

3.4.2 Variability Metric. Prior studies showed that work rhythm typically follows a weekly pattern \[19, [40\]](#page-6-31); therefore, we first generate a week-to-week variability for all the previous behaviors. We then calculate the average of the variability across all weeks to come up with an overall variability metric for each behavior and person. The calculation of the weekly variability metric is adapted from a prior work [\[11\]](#page-6-32) and can be seen in Equation 1. We use this simple frequency-based variability metric to study workplace rhythms as it is straightforward and intuitive.

![](_page_3_Figure_1.jpeg)

## ![](_page_3_Figure_2.jpeg)

## ![](_page_3_Figure_3.jpeg)

Figure 2: Distribution of stress (left), anxiety (center), and depression (right) scores across participants. The higher the participants' score on the X-axis, the higher their emotional distress. X-axis ranges from 0 to 32.5 for the different metrics.

$$Variability_{Xi} = \frac{1}{D_i} \sum_{i=1}^{D_i} \frac{STD_{Xij}}{Mean_{Xi}}$$
## (1)

where, $Variability_{Xi}$ indicates the variability of person i for behavior X, $STD_{Xij}$ indicates the standard deviation of behavior X of person i over week j, $Mean_{Xi}$ indicates the average value of behavior X of person i over D weeks of data available for person i, and $D_i$ indicates the number of weeks for which data is available for person i.

#### 4 ASSOCIATION ANALYSIS

#### 4.1 Self-reported Workplace Rhythm Variability

We created ten variables from our self-reported work-life behaviors and calculated the variability across these variables. We then correlated the variability with participants' depression, anxiety, and stress scores. The results are shown in Table 2, corrected for multiple comparisons using the Benjamini-Hochberg procedure. Correlation with raw scores was generated after calculating within-participant averages of the associated variable across all days. The statistically insignificant results are grayed out in the table. To better understand the potential relationship between variables, the table includes a *Variability* column, which shows correlations with the variability of the associated metric, and the *Raw* column, which shows correlations with the average values of the metric for each participant.

We found that high variability in the self-reported workplace rhythm is associated with higher emotional distress in the participants. Variability in valence was moderate-to-strongly correlated with participants' stress ( $\rho$ =0.45), anxiety ( $\rho$ =0.44) and depression ( $\rho$ =0.66). Similarly, arousal variability was positively associated with anxiety ( $\rho$ =0.37) and depression ( $\rho$ =0.44). We also found that higher variability in job demands is associated with higher depression ( $\rho$ =0.31). In terms of meal habits, variability in lunch time was positively correlated with the anxiety of participants ( $\rho$ =0.38). Among sleep-related variables, variability in self-reported sleep quality and stress levels are positively correlated ( $\rho$ =0.34), i.e., the higher the variability in sleep quality, the higher the stress. Some relationships were flipped when analyzing the association between raw values of self-reports rather than the variability. For example, while variability in valence was positively associated with all emotional distress metrics, raw values were negatively associated with stress ( $\rho$ =-0.40), anxiety ( $\rho$ =-0.33), and depression ( $\rho$ =-0.55). The relationship between job demands was an exception, as both its raw values ( $\rho$ =0.47) and variability ( $\rho$ =0.31) were positively associated

Table 2: Correlations between self-reports (both raw values and their variability) and participants' stress, anxiety and depression scores (\*\*\* p < .01, \*\* $.01 \le p < .05$ , \* $.05 \le p \le .10$ ).

| Metric | Stress | | Anxiety | | Depression | |
|----------------------|-------------|---------|-------------|---------|-------------|----------|
| Metric | Variability | Raw | Variability | Raw | Variability | Raw |
| Valence | 0.45*** | -0.40** | 0.44*** | -0.33** | 0.66*** | -0.55*** |
| Arousal | 0.20 | -0.22 | 0.37** | -0.26 | 0.44*** | -0.36** |
| Job demands | 0.22 | 0.36** | 0.25 | 0.26 | 0.31* | 0.47*** |
| Breakfast time | -0.08 | -0.08 | 0.13 | 0.10 | 0.01 | -0.29 |
| Lunch time | 0.21 | 0.09 | 0.38* | 0.14 | 0.29 | -0.10 |
| Bedtime | -0.04 | -0.30 | -0.01 | -0.19 | -0.04 | -0.24 |
| Wake-up time | -0.11 | 0.12 | 0.07 | 0.07 | 0.08 | 0.10 |
| Number of awakenings | 0.11 | 0.21 | 0.10 | 0.26 | 0.09 | 0.25 |
| Sleep quality | 0.34** | -0.37** | 0.28 | -0.28** | 0.13 | -0.36*** |
| Sleep duration | -0.01 | 0.26 | 0.02 | 0.44*** | 0.19 | 0.25 |

Table 3: Correlations between passively collected digital activity (both raw values and their variability) and participants' stress, anxiety and depression scores (\*\*\* p < .01, \*\* $.01 \le p < .05$ , \* $.05 \le p \le .10$ ).

| Metric | Stress | | Anxiety | | Depression | |
|------------------------------------|-------------|-------|-------------|-------|-------------|-------|
| Metric | Variability | Raw | Variability | Raw | Variability | Raw |
| Number of mail threads | -0.29* | -0.14 | -0.25 | 0.10 | -0.14 | -0.20 |
| Busy slots on calendar | -0.34** | -0.03 | -0.04 | -0.17 | -0.07 | -0.15 |
| Keypress speed | -0.30* | 0.06 | -0.16 | 0.04 | -0.20 | 0.03 |
| Average number of keypress | -0.33* | 0.04 | -0.10 | 0.16 | -0.08 | 0.00 |
| Mouse move speed | -0.33* | 0.05 | -0.16 | 0.10 | -0.22 | 0.11 |
| Average mouse moves | -0.31* | -0.02 | -0.12 | -0.07 | -0.26 | -0.14 |
| Number of unique processes exited | -0.28 | 0.18 | -0.17 | 0.03 | -0.30* | 0.19 |
| Number of unique status changed | -0.44*** | 0.34* | -0.30* | 0.11 | -0.37** | 0.27 |
| Number of foreground applications | -0.43*** | 0.34* | -0.29 | 0.11 | -0.36** | 0.27 |
| Number of startups | -0.38** | 0.07 | -0.34** | 0.19 | -0.41** | 0.12 |
| Number of titles started | -0.32* | 0.09 | -0.27 | 0.06 | -0.27 | -0.07 |
| Average task switch duration | -0.23 | 0.16 | -0.03 | 0.12 | -0.11 | 0.33* |
| Number of unique attention signals | -0.38** | 0.29 | -0.24 | 0.06 | -0.33* | 0.24 |
| Active duration | -0.19 | 0.02 | -0.40* | 0.21 | -0.17 | -0.24 |

with depression. Some variables only had a significant relationship with their variability and not with their raw values, while for some variables, only the raw values were correlated. For example, variability in arousal was positively associated with anxiety ( $\rho$ =0.37). However, its raw value was not, whereas sleep duration's raw value was significantly correlated with anxiety ( $\rho$ =0.44), but its variability was not.

#### 4.2 Digital activity-based rhythm

We repeated a similar association analysis with the digital activity data that was passively collected. We list the results in Table 3. As with the variability in self-reported rhythm, the results were corrected for multiple comparisons using the Benjamini-Hochberg procedure.

Unlike self-reported variability, the correlation results based on digital activity showed a negative relationship with emotional distress. An increase in variability of the number of foreground applications ( $\rho$ =-0.43) and the number of startups ( $\rho$ =-0.38) was associated with decreased participants' stress. We see similar relationships with mouse move speed ( $\rho$ =-0.33), average mouse move events ( $\rho$ =-0.31), the number of unique attention signals ( $\rho$ =-0.38), the number of unique status changes ( $\rho$ =-0.44), keypress speed ( $\rho$ =-0.30), the average number of keypresses ( $\rho$ =-0.33), and number of titles started ( $\rho$ =-0.32). The variability in the number of busy slots on the calendar ( $\rho$ =-0.34) and the number of email threads ( $\rho$ =-0.29) was also negatively associated with participants' stress. We see a similar association with anxiety as well-the variability in active duration (i.e., time spent working on the computer; $\rho$ =-0.40), the number of startups (i.e., number of times the user unlocks the screen; $\rho$ =-0.34), and number of unique status changed (i.e., number of times the user locks the screen; $\rho$ =-0.30) were all negatively associated with it. However, most raw digital activity variables did not significantly correlate with emotional distress. Only a few variables, such as the number of foreground applications ( $\rho$ =0.34) and average task switch duration ( $\rho$ =0.33), were significantly correlated with stress and depression scores, respectively. Note that we listed only digital activities with at least one statistically significant correlation with the emotional distress metrics after correcting the p-value for multiple comparisons.

#### 5 DISCUSSION

#### 5.1 Summary of results

Our results indicate a relationship between workplace rhythm and emotional distress. We find that higher variability in valence, arousal, lunch time, and sleep quality are associated with increased stress, anxiety, and depression. These findings are in line with existing studies that link meal time irregularity [25, 42, 45] and sleep irregularity [17, 36] to poorer mental well-being, and job demand variability to higher job strain [10] and reduced performance [13]. While variations in self-reported workplace rhythms are positively associated with stress, anxiety, and depression, the opposite is true for digital activity-based rhythms. Digital activity-based rhythms are negatively correlated with stress, anxiety, and depression.

Note that both the self-reported and objective digital activitybased variables follow a similar trend - when a metric's variability is negatively correlated with DASS scores (i.e., well-being outcomes), its raw/mean value is positively correlated with DASS scores and vice versa. This might help explain why the variability in digital activity is negatively associated with emotional distress outcomes. For example, we find that the raw value of the number of foreground applications is positively associated with stress, meaning that the higher the number of foreground applications, the higher the stress. This hints that in our observations, most participants who report high stress also exhibit a higher value for the number of foreground applications. One possible explanation could be that higher number of foreground applications might reflect participants working more or harder and this might explain why variability in digital activity is better - it may add periods with relatively less work in their work rhythm (which might offer a moment of respite or a moment to recharge after a sustained period of high workload). Hence, the reason why variability is suitable for our participants might be because they repeatedly have higher raw values for their digital activity (indicating high workload or high work activity).

We could also look at these findings in another way. Highly stressed participants may use more applications on average, resulting in high regularity (or less variability) in the number of foreground applications. Hence, the variability in the number of foreground applications is negatively related to stress. Although we take the number of foreground applications as an example, most digital activity streams (raw and their variability) show a similar relationship. These results indicate that regularity in work rhythms may not always be healthy behavior. Higher variability may provide opportunities for self-care, relaxation, breaks, and change of pace, which can help to reduce stress and improve overall well-being.

## 5.2 Implications

Our findings demonstrate that we require a more holistic approach emphasizing workplace rhythms and their absolute/average levels to improve mental well-being in the workplace. Variations in workplace habits (and lifestyle habits, in general) such as sleep, eating, job demand, resources, and emotion, as well as digital activity-based rhythms, matter, rather than simply focusing on the absolute value of these facets, independent of their variability. As a result, our findings may be useful for providing more effective and specific health guidance in the future to both employees and employers. There may be some relatively simple actions that individuals can undertake in order to improve their well-being. This could include trying to maintain consistency in one's lunch time routine or focusing on improving the quality of one's sleep. Both mealtimes and sleep are deeply associated with an individual's lifestyle. IWs can make an effort to keep them as regular as possible. In parallel with individual actions, employers could implement measures in the workplace that help promote consistency in workplace rhythm, which would be beneficial. This could be achieved by having appropriate policies, such as encouraging teams to avoid meetings or work-related tasks during employees' pre-set lunch periods.

We find that particular workplace rhythm patterns are associated with specific emotional distress outcomes. Intervening HCI designs could use these findings to detect behaviors or disruptions in rhythms that relate to adverse mental well-being outcomes early on. Early detection of disruptions to work rhythm would help offer appropriate interventions to prevent poor chronic health conditions from developing. In addition, knowing the relationship between particular workplace rhythms and well-being enables us to design technologies in a preventative way \[7, [32\]](#page-6-39). In other words, we should design workplace policies to support well-being by making achieving an individual or team's optimal workplace rhythm more likely and effortless.

## 5.3 Privacy and Ethical Considerations

In conducting this study, we took measures to protect the confidentiality of the participants by collecting only high-level digital activity data. We obtained informed consent from the participants, explaining the purpose and use of the study. We also ensured that the participants had the right to withdraw from the study at any time without penalty. All the data were anonymized and de-identified for the analysis. We also securely store the data, limiting access only to authorized personnel. We acknowledge that the use of digital data raises concerns about data privacy and security, and we were careful to adhere to data protection regulations and best practices. Furthermore, we emphasize the importance of using these results responsibly and ethically to support the well-being of workers and the promotion of a healthy workplace culture.

## 5.4 Limitations and Future Work

Although we collected data from 49 IWs, they all belonged to the same company, which may have influenced some findings. Further research is necessary to assess generalizability by examining larger populations and different companies. In addition, the four-week enrollment period limited our ability to capture slow-changing baselines and longer-term variability, which could be addressed in future studies by examining participants for more extended periods and at various times of the year. While this study used a frequency-based variability metric, more complex metrics, and granular data could provide additional insights into workplace rhythms and their relationship with worker well-being. We analyzed only high-level metadata to protect the privacy and did not consider content. However, considering meeting content, such as its importance or controversy, may provide valuable insights into how routines affect workers' well-being. Furthermore, future studies should gather qualitative insights from participants to clarify the meaning of higher variability. Other sensing modalities, such as wearables and phones, could also be used to capture a more comprehensive view of workplace rhythms and well-being.

## 6 CONCLUSION

This study examined the relationship between the variability of information workers' workplace rhythms and their self-reported emotional distress. We used self-reports and digital activity to generate our metric of workplace rhythm and found that less variability in self-reported mood, job demands, meal habits, and sleep quality was linked to better well-being. In contrast, less variability in digital activity was linked to more emotional distress, indicating that higher variability in digital activities was associated with better well-being outcomes. This may signal that not all habits or consistent behaviors are beneficial. We hope our research contributes to understanding the connection between workplace rhythms and well-being in the workplace.

## REFERENCES

- [1] Muhammad Johan Alibasa and Rafael A. Calvo. 2019. Supporting Mood Introspection from Digital Footprints. In 2019 8th International Conference on Affective Computing and Intelligent Interaction (ACII). IEEE. [https://doi.org/10.1109/acii.](https://doi.org/10.1109/acii.2019.8925436) [2019.8925436](https://doi.org/10.1109/acii.2019.8925436)
- [2] Mary Jean Amon, Stephen Mattingly, Aaron Necaise, Gloria Mark, Nitesh Chawla, Anind Dey, and Sidney D'mello. 2022. Flexibility Versus Routineness in Multimodal Health Indicators: A Sensor-based Longitudinal in Situ Study of Information Workers. ACM Transactions on Computing for Healthcare 3, 3 (jul 2022), 1–27.<https://doi.org/10.1145/3514259>
- [3] Katherine R Arlinghaus and Craig A Johnston. 2019. The importance of creating habits and routine. American journal of lifestyle medicine 13, 2 (2019), 142–144.
- [4] Arnold B. Bakker and Evangelia Demerouti. 2007. The Job Demands-Resources model: state of the art. Journal of Managerial Psychology 22, 3 (April 2007), 309–328.<https://doi.org/10.1108/02683940710733115>
- [5] Oliver Brdiczka, Norman Makoto Su, and Bo Begole. 2009. Using Temporal Patterns (t-Patterns) to Derive Stress Factors of Routine Tasks. In CHI '09 Extended Abstracts on Human Factors in Computing Systems (Boston, MA, USA) (CHI EA '09). Association for Computing Machinery, New York, NY, USA, 4081–4086. <https://doi.org/10.1145/1520340.1520621>

- [6] Thomas Breideband, Gonzalo J. Martinez, Poorna Talkad Sukumar, Megan Caruso, Sidney D'Mello, Aaron D. Striegel, and Gloria Mark. 2022. Sleep Patterns and Sleep Alignment in Remote Teams during COVID-19. Proc. ACM Hum.-Comput. Interact. 6, CSCW2, Article 326 (nov 2022), 31 pages. [https:](https://doi.org/10.1145/3555217) [//doi.org/10.1145/3555217](https://doi.org/10.1145/3555217)
- [7] Rafael A Calvo and Dorian Peters. 2014. Positive Computing: Technology for well-being and Human Potential. The MIT Press.
- [8] Vedant Das Swain, Koustuv Saha, Hemang Rajvanshy, Anusha Sirigiri, Julie M Gregg, Suwen Lin, Gonzalo J Martinez, Stephen M Mattingly, Shayan Mirjafari, Raghu Mulukutla, et al. 2019. A multisensor person-centered approach to understand the role of daily activities in job performance with organizational personas. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies 3, 4 (2019), 1–27.
- [9] Evangelia Demerouti, Arnold B. Bakker, Friedhelm Nachreiner, and Wilmar B. Schaufeli. 2001. The job demands-resources model of burnout. Journal of Applied Psychology 86, 3 (2001), 499–512.<https://doi.org/10.1037/0021-9010.86.3.499>
- [10] Patrick E. Downes, Cody J. Reeves, Brian W. Mc Cormick, Wendy R. Boswell, and Marcus M. Butts. 2020. Incorporating Job Demand Variability Into Job Demands Theory: A Meta-Analysis. Journal of Management 47, 6 (may 2020), 1630–1656. <https://doi.org/10.1177/0149206320916767>
- [11] Haram Eom, Dongmin Lee, Yoonkung Cho, and Junghoon Moon. 2022. The association between meal regularity and weight loss among women in commercial weight loss programs. Nutrition Research and Practice 16, 2 (2022), 205. <https://doi.org/10.4162/nrp.2022.16.2.205>
- [12] Elisabeth Flo, Ståle Pallesen, Nils Magerøy, Bente Elisabeth Moen, Janne Grønli, Inger Hilde Nordhus, and Bjørn Bjorvatn. 2012. Shift work disorder in nurses– assessment, prevalence and related health problems. PloS one 7, 4 (2012), e33981.
- [13] Erica L. Hauck, Lori Anderson Snyder, and Luz-Eugenia Cox-Fuenzalida. 2008. Workload Variability and Social Support: Effects on Stress and Performance. Current Psychology 27, 2 (apr 2008), 112–125. [https://doi.org/10.1007/s12144-](https://doi.org/10.1007/s12144-008-9026-x) [008-9026-x](https://doi.org/10.1007/s12144-008-9026-x)
- [14] Julie D. Henry and John R. Crawford. 2005. The short-form version of the Depression Anxiety Stress Scales (DASS-21): Construct validity and normative data in a large non-clinical sample. British Journal of Clinical Psychology 44, 2 (jun 2005), 227–239.<https://doi.org/10.1348/014466505x29657>
- [15] Keita Kamijo and Yuji Takeda. 2010. Regular physical activity improves executive function during task switching in young adults. International Journal of Psychophysiology 75, 3 (2010), 304–311.
- [16] Carol Collier Kuhlthau. 1999. The Role of Experience in the Information Search Process of an Early Career Information Worker: Perceptions of Uncertainty, Complexity, Construction, and Sources. J. Am. Soc. Inf. Sci. 50, 5 (apr 1999), 399–412.
- [17] Sakari Lemola, Thomas Ledermann, and Elliot M. Friedman. 2013. Variability of Sleep Duration Is Related to Subjective Sleep Quality and Subjective Well-Being: An Actigraphy Study. PLoS ONE 8, 8 (Aug. 2013), e71292. [https://doi.org/10.](https://doi.org/10.1371/journal.pone.0071292) [1371/journal.pone.0071292](https://doi.org/10.1371/journal.pone.0071292)
- [18] Yee Mei Lim, Aladdin Ayesh, and Martin Stacey. 2019. Continuous Stress Monitoring under Varied Demands Using Unobtrusive Devices. International Journal of Human–Computer Interaction 36, 4 (jul 2019), 326–340. [https:](https://doi.org/10.1080/10447318.2019.1642617) [//doi.org/10.1080/10447318.2019.1642617](https://doi.org/10.1080/10447318.2019.1642617)
- [19] Denisa Luta, Deborah M. Powell, and Jeffrey R. Spence. 2019. Entrained Engagement? Investigating If Work Engagement Follows a Predictable Pattern across the Work Week and the Role of Personality in Shaping Its Pattern. In Research on Emotion in Organizations. Emerald Publishing Limited, 89–109. <https://doi.org/10.1108/s1746-979120190000015009>
- [20] Jürgen Margraf, Kristen Lavallee, Xiao Chi Zhang, and Silvia Schneider. 2016. Social Rhythm and Mental Health: A Cross-Cultural Comparison. PLOS ONE 11, 3 (03 2016), 1–16.<https://doi.org/10.1371/journal.pone.0150312>
- [21] Jürgen Margraf, Kristen Lavallee, Xiao Chi Zhang, and Silvia Schneider. 2016. Social rhythm and mental health: a cross-cultural comparison. PloS one 11, 3 (2016), e0150312.
- [22] Shayan Mirjafari, Kizito Masaba, Ted Grover, Weichen Wang, Pino Audia, Andrew T Campbell, Nitesh V Chawla, Vedant Das Swain, Munmun De Choudhury, Anind K Dey, et al. 2019. Differentiating higher and lower job performers in the workplace using mobile sensing. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies 3, 2 (2019), 1–24.
- [23] Timothy H. Monk, Joseph F. Flaherty, Ellen Frank, Kathleen Hoskinson, and David J. Kupfer. 1990. The Social Rhythm Metric An Instrument to Quantify the Daily Rhythms of Life. The Journal of Nervous and Mental Disease 178, 2 (Feb. 1990), 120–126.<https://doi.org/10.1097/00005053-199002000-00007>
- [24] Mehrab Bin Morshed, Javier Hernandez, Daniel Mc Duff, Jina Suh, Esther Howe, Kael Rowan, Marah Abdin, Gonzalo Ramos, Tracy Tran, and Mary Czerwinski. 2022. Advancing the Understanding and Measurement of Workplace Stress in Remote Information Workers from Passive Sensors and Behavioral Data. In 2022 10th International Conference on Affective Computing and Intelligent Interaction (ACII). IEEE, 1–8.
- [25] Mehrab Bin Morshed, Samruddhi Shreeram Kulkarni, Koustuv Saha, Richard Li, Leah G. Roper, Lama Nachman, Hong Lu, Lucia Mirabella, Sanjeev Srivastava,

- Kaya de Barbaro, Munmun De Choudhury, Thomas Plötz, and Gregory Abowd. 2022. Food, Mood, Context: Examining College Students' Eating Context and Mental Well-Being. ACM Trans. Comput. Healthcare (apr 2022). [https://doi.org/](https://doi.org/10.1145/3533390) [10.1145/3533390](https://doi.org/10.1145/3533390)
- [26] Maren Mühlenmeier, Thomas Rigotti, Anja Baethge, and Tim Vahle-Hinz. 2022. The ups and downs of the week: A person-centered approach to the relationship between time pressure trajectories and well-being. Journal of Occupational Health Psychology 27, 3 (jun 2022), 286–298.<https://doi.org/10.1037/ocp0000306>
- [27] Fiona M. Nea, John Kearney, M. Barbara E. Livingstone, L. Kirsty Pourshahidi, and Clare A. Corish. 2015. Dietary and lifestyle habits and the associated health risks in shift workers. Nutrition Research Reviews 28, 2 (2015), 143–166. [https:](https://doi.org/10.1017/S095442241500013X) [//doi.org/10.1017/S095442241500013X](https://doi.org/10.1017/S095442241500013X)
- [28] Subigya Nepal, Gonzalo J Martinez, Shayan Mirjafari, Stephen Mattingly, Vedant Das Swain, Aaron Striegel, Pino G Audia, and Andrew T Campbell. 2021. Assessing the Impact of Commuting on Workplace Performance Using Mobile Sensing. IEEE Pervasive Computing 20, 4 (2021), 52–60.
- [29] Subigya Nepal, Gonzalo J Martinez, Shayan Mirjafari, Koustuv Saha, Vedant Das Swain, Xuhai Xu, Pino G Audia, Munmun De Choudhury, Anind K Dey, Aaron Striegel, et al. 2022. A Survey of Passive Sensing in the Workplace. ar Xiv preprint ar Xiv:2201.03074 (2022).
- [30] Subigya Nepal, Shayan Mirjafari, Gonzalo J Martinez, Pino Audia, Aaron Striegel, and Andrew T Campbell. 2020. Detecting job promotion in information workers using mobile sensing. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies 4, 3 (2020), 1–28.
- [31] The American Institute of Stress. 2022. Workplace stress. [https://www.stress.](https://www.stress.org/workplace-stress) [org/workplace-stress](https://www.stress.org/workplace-stress)
- [32] Dorian Peters, Rafael A. Calvo, and Richard M. Ryan. 2018. Designing for Motivation, Engagement and well-being in Digital Experience. Frontiers in Psychology 9 (may 2018).<https://doi.org/10.3389/fpsyg.2018.00797>
- [33] Andrew J K Phillips, William M Clerx, Conor S O'Brien, Akane Sano, Laura K Barger, Rosalind W Picard, Steven W Lockley, Elizabeth B Klerman, and Charles A Czeisler. 2017. Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing. Sci. Rep. 7, 1 (June 2017), 3216.
- [34] June J. Pilcher and Drew M. Morris. 2020. Sleep and Organizational Behavior: Implications for Workplace Productivity and Safety. Frontiers in Psychology 11 (jan 2020).<https://doi.org/10.3389/fpsyg.2020.00045>
- [35] James M Rippe. 2018. Lifestyle medicine: the health promoting power of daily habits and practices. American journal of lifestyle medicine 12, 6 (2018), 499–512.
- [36] Sahar M. Sabet, Natalie D. Dautovich, and Joseph M. Dzierzewski. 2021. The Rhythm is Gonna Get You: Social Rhythms, Sleep, Depressive, and Anxiety Symptoms. Journal of Affective Disorders 286 (2021), 197–203. [https://doi.org/](https://doi.org/10.1016/j.jad.2021.02.061) [10.1016/j.jad.2021.02.061](https://doi.org/10.1016/j.jad.2021.02.061)
- [37] Robert L Sack. 2010. Jet lag. New England Journal of Medicine 362, 5 (2010), 440–447.
- [38] Daniel Schneider and Kristen Harknett. 2019. Consequences of Routine Work-Schedule Instability for Worker Health and Well-Being. American Sociological Review 84, 1 (feb 2019), 82–114.<https://doi.org/10.1177/0003122418823184>
- [39] M. B. Spencer. 1987. The influence of irregularity of rest and activity on performance: a model based on time since sleep and time of day. Ergonomics 30, 9 (1987), 1275–1286.<https://doi.org/10.1080/00140138708966022> ar Xiv[:https://doi.org/10.1080/00140138708966022](https://arxiv.org/abs/https://doi.org/10.1080/00140138708966022)
- [40] Jay Stewart, , and Harley Frazis and. 2019. The importance and challenges of measuring work hours. IZA World of Labor (2019). [https://doi.org/10.15185/](https://doi.org/10.15185/izawol.95.v2) [izawol.95.v2](https://doi.org/10.15185/izawol.95.v2)
- [41] Benjamin Tag, Andrew W. Vargo, Aman Gupta, George Chernyshov, Kai Kunze, and Tilman Dingler. 2019. Continuous Alertness Assessments: Using EOG Glasses to Unobtrusively Monitor Fatigue Levels In-The-Wild. In Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems (Glasgow, Scotland Uk) (CHI '19). Association for Computing Machinery, New York, NY, USA, 1–12.<https://doi.org/10.1145/3290605.3300694>
- [42] Yu Tahara, Saneyuki Makino, Takahiko Suiko, Yuki Nagamori, Takao Iwai, Megumi Aono, and Shigenobu Shibata. 2021. Association between irregular meal timing and the mental health of Japanese workers. Nutrients 13, 8 (Aug. 2021), 2775.
- [43] William H Walker, James C Walton, A Courtney De Vries, and Randy J Nelson. 2020. Circadian rhythm disruption and mental health. Translational psychiatry 10, 1 (2020), 1–13.
- [44] Tenshi Watanabe, Jiro Masuya, Shogo Hashimoto, Mina Honyashiki, Miki Ono, Yu Tamada, Yota Fujimura, Takeshi Inoue, and Akiyoshi Shimura. 2022. Long Working Hours Indirectly Affect Psychosomatic Stress Responses via Complete Mediation by Irregular Mealtimes and Shortened Sleep Duration: A Cross-Sectional Study. International Journal of Environmental Research and Public Health 19, 11 (may 2022), 6715.<https://doi.org/10.3390/ijerph19116715>
- [45] Yvonne H. C. Yau and Marc N. Potenza. 2013. Stress and eating behaviors. Minerva Endocrinol. 38, 3 (Sept. 2013), 255–267.
