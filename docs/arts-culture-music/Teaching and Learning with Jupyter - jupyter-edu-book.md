# Teaching and Learning with Jupyter

Lorena A. Barba, Lecia J. Barker, Douglas S. Blank, Jed Brown, Allen B. Downey, Timothy George, Lindsey J. Heagy, Kyle T. Mandli, Jason K. Moore, David Lippert, Kyle E. Niemeyer, Ryan R. Watkins, Richard H. West, Elizabeth Wickes, Carol Willing, and Michael Zingale

## 2019-05-08

# Contents

| 1 | Introduction<br>5<br>Acknowledgments<br><br>6 | | |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|--|
| 2 | Why we use Jupyter notebooks<br>2.1<br>Why do we use Jupyter?<br><br>But rst,<br>2.2<br>what is Jupyter Notebook?<br>Course benets<br>2.3<br>& anecdotes<br>Student benets<br>2.4<br><br>Instructor benets<br>2.5<br><br>2.6<br>Conclusions | 7<br>7<br>7<br>9<br>15<br>16<br>16 | |
| 3 | Notebooks in teaching and learning<br>3.1<br>Oh the places your notebooks will go!<br>Beore<br>3.2<br>You Begin…<br> | 17<br>17<br>22 | |
| 4 | A catalogue o<br>pedagogical patterns<br>4.1<br>Introduction<br>Shit-Enter<br>or<br>4.2<br>the win<br><br>4.3<br>Fill in the blanks<br><br>4.4<br>Target Practice<br>Tweak, twiddle, and rob<br>4.5<br><br>4.6<br>Notebook as an app<br>4.7<br>Win-day-one<br>4.8<br>Top-down sequence<br>4.9<br>Two bites at every apple<br><br>4.10 Coding as translation<br>4.11 Symbolic math over pencil + paper<br><br>4.12 Replace analysis with numerical methods<br>4.13 The API is the lesson<br><br>4.14 Proo<br>by example, disproo<br>by counterexample<br>4.15 The world is your dataset<br>4.16 Now you try (with dierent<br>data or process)<br>4.17 Connect to external audiences<br><br>4.18 There can be only one<br>4.19 Hello, world!<br><br>4.20 Test driven development<br>4.21 Code reviews<br><br>4.22 Bug hunt<br>4.23 Adversarial programming<br> | 27<br>27<br>27<br>28<br>28<br>29<br>30<br>30<br>31<br>32<br>32<br>33<br>33<br>34<br>34<br>35<br>36<br>36<br>37<br>37<br>38<br>39<br>39<br>39 | |
| 5 | Jupyter Notebook ecosystem<br>5.1<br>Language support: kernels<br>5.2<br>Using Jupyter notebooks | 41<br>41<br>41 | |

## 4 CONTENTS

| Reerences | | | | |
|------------|----------|----------------------------------------------------------------------------------|----|--|
| 9 | Glossary | | | |
| | 8.2 | Authors at the sprint<br> | 71 | |
| | 8.1 | Project lead<br> | 71 | |
| 8 | | About the authors | 71 | |
| | 7.7 | Riemann Problems and Jupyter Solutions | 67 | |
| | 7.6 | Investigating hurricanes<br> | 67 | |
| | 7.5 | Interactive geophysics with Jupyter<br> | 67 | |
| | 7.4 | Interactivity in computer science (high school and middle school)<br> | 66 | |
| | 7.3 | Analyzing music with music21<br> | 65 | |
| | 7.2 | The "CFD Python" story: guiding learners at their own pace<br> | 64 | |
| | 7.1 | Jupyter notebooks in support o<br>scaling or<br>large enrollments | 63 | |
| 7 | | Usage case studies | 63 | |
| | 6.6 | Jupyter: a 21st Century genre o<br>Open Educational Resources and practices<br> | 61 | |
| | 6.5 | How do you create Jupyter notebooks or<br>reuse and sharing? | 60 | |
| | 6.4 | Assessing student learning with Jupyter notebooks<br> | 59 | |
| | 6.3 | Distribution and collection o<br>materials | 58 | |
| | 6.2 | Jupyter on remote servers<br> | 55 | |
| | 6.1 | Local installation on students' or lab computers<br> | 53 | |
| 6 | | Getting your class going with Jupyter | 53 | |
| | 5.5 | Gotchas<br> | 50 | |
| | 5.4 | Tips and tricks<br> | 49 | |
| | 5.3 | Authoring Jupyter notebooks<br> | 42 | |

# Chapter 1

# Introduction

This handbook is or any educator teaching a topic that includes data analysis or computation in order to support learning. It is not just or educators teaching courses in engineering or science, but also data journalism, business and quantitative economics, data-based decision sciences and policy, quantitative health sciences, and digital humanities. It aims to provide an entry point, and a broad overview o Jupyter in education. Whether you are already using Jupyter to teach, you have ound learning materials built on Jupyter that piqued your curiosity, or have never heard o Jupyter, the material in this open book can empower you to use this technology in your teaching.

Project Jupyter is a broad collaboration that develops open-source tools or interactive and exploratory computing. The tools include: over 100 computer languages (with a ocus on Python), the Jupyter Notebook, Jupyter Hub, and an ecosystem o extensions contributed by a large community. The Jupyter Notebook has exploded in popularity since late 2014, ueled by its adoption as the avorite environment or doing data science. It has also grown as a platorm to use in the classroom, to develop teaching materials, to share lessons and tutorials, and to create computational stories. Notebooks are documents containing text narratives with images and math, combined with executable code (many languages are supported) and the output o that code. This marriage o content and code makes or a powerul new orm o data-based communication. Educators everywhere are adopting Jupyter or teaching.

Educators newly adopting Jupyter can be overwhelmed by having to navigate the ecosystem o tools and content. They could study many examples, or consume a myriad o blog posts and videos o talks to distill the patterns o good practices and technical solutions to serve their students best. Several early adopters, having much experience to share, decided to begin collecting this know-how, and share open documentation about using Jupyter or teaching and learning. The result is this open book: a living document that captures the experiences o community members using Jupyter in education.

The Jupyter Community Workshop in Washington, DC (November 2018) began that process, with a book sprint aimed at producing the rst version o this handbook. The collaboratively written book consolidates explanations and examples covering key topics, including: what is Jupyter, how to try Jupyter, sharing notebooks with students, locally installing Jupyter, cloud oerings, nding example notebooks, writing lessons in Jupyter, making collections or a course, exporting to otherormats with nbconvert, writing textbooks with Jupyter, using Binder and Jupyter Hub, making assignments and auto-grading, making online courses, teaching with Jupyter in the classroom, active learning and ipped learning pedagogies with Jupyter, and guiding learners to create their own content in Jupyter. This open handbook will grow to encompass all you need to know about Jupyter in teaching and learning.

I you nd these materials helpul or inspiring, give us a shout-out on Twitter using #Jupyter4Edu. We hope you do!

# Acknowledgments

The book sprint was held at the George Washington University in Washington, DC, on 28–30 November 2018, and organized by Lorena A. Barba. Funding to support the logistics and travel o all participants was possible thanks to a grant rom Bloomberg to Project Jupyter, and managed by NumFOCUS. The group was êted at a reception sponsored by Leidos. Participants traveled rom all over the country and volunteered their precious time and hard work to give this work to the Jupyter community, with a heartelt sense o gratitude to all the contributors to the sotware projects we love and depend on. Thank you!

Git Hub repository or this book: https://github.com/jupyter4edu/jupyter-edu-book

Content under a Creative Commons Attribution CC-BY 4.0 International license.

# Chapter 2

# Why we use Jupyter notebooks

#### 2.1 Why do we use Jupyter?

As teachers we are responsible or many activities, including creating lessons, lectures, courses, assignments, and supportive environments; encouraging engagement and perormance in the classroom; helping students learn to think critically so they can become lielong learners and problem solvers; making material relevant and meaning ul to students' diverse interests and backgrounds; assessing student learning (including grading and evaluation); encouraging students to persist with emotional labor (eedback, communication, etc.); and trying out teaching and learning practices that improve our ability to do all o these things.

In short, we design learning environments and experiences.

We use Jupyter notebooks to design learning environments to help support these activities. We believe that incorporating Jupyter notebooks in our teaching has allowed us to improve students' understanding o course content, increase student engagement with material and their participation in class, and to make concepts more meaningul and relevant to students' diverse interests. We represent a variety o disciplines and have many diverse instructional goals, all o which have been supported using Jupyter notebooks. The goal o this handbook is to provide you with ideas to help you address your own instructional and pedagogical goals.

Through a series o anecdotes we will illustrate how you, as an educator, can use Jupyter notebooks to increase your students' 1) engagement, 2) participation, 3) understanding, 4) perormance, and 5) preparation or their career. These are starting places and we are condent that you will also take these examples in new and exciting directions.

# 2.2 But rst, what is Jupyter Notebook?

Project Jupyter is three things: a collection o standards, a community, and a set o sotware tools. Jupyter Notebook, one part o Jupyter, is sotware that creates a Jupyter notebook. A Jupyter notebook is a document that supports mixing executable code, equations, visualizations, and narrative text. Specically, Jupyter notebooks allow the user to bring together data, code, and prose, to tell an interactive, computational story. Whether analyzing a corpus o American Literature, creating music and art, or illustrating the engineering concepts behind Digital Signal Processing, the notebooks can combine explanations traditionally ound in textbooks with the interactivity o an application.

Jupyter is a ree, open source platorm that is an excellent learning environment or students. For teachers, it increases our efciency and decreases cognitive load so we can engage students. Notebooks can be useul or achieving your goals as a teacher in numerous environments rom STEM labs or humanities narratives, to podium lectures or ipped classrooms. We use Jupyter notebooks in small classes and or classes that have hundreds o students. Jupyter notebooks can be used or teaching part o one lecture or can be used to teach a whole course. Jupyter notebooks enable us and our students to have a conversation with a problem and link to resources, like audio, video, images,

## ![](_page_7_Figure_2.jpeg)

Figure 2.1: A Jupyter notebook, starting with a markdown cell containing a title and an explanation (including an equation rendered with La TeX). Three code cells produce the nal inline plot.

visualizations–and even allow students to mix and remix these. And yet students need to install nothing beyond a modern web browser to use this ree sotware.

Jupyter notebooks can be used to organize classroom materials and objects, store and provide access to reading materials or students, present and share lecture materials, perorm live coding, explore and interact with materials, support sel-paced learning, grade students' homework, solve homework problems, or make materials reusable to others (see Chapters 3 and 4).

Read on to nd out how we have used Jupyter notebooks or teaching and learning to benet both our students and ourselves. Jupyter notebooks support a wide range o learning goals, including learning to program, learning domain knowledge, and practicing communication skills like storytelling. The authors o this book have used Jupyter notebooks to teach:

- Sciences
 - Physics and astronomy
 - Geoscience
 - Biology
 - Cognitive Science
 - Computer science
 - Data science
 - Statistics
 - Social sciences
- Writing
 - Writing Seminar
 - Writing and technical communication
- Digital Humanities
 - Music
 - Text analysis
 - Metadata processing
- Engineering
 - Chemical engineering (kinetics and reactor design)
 - Mechanical engineering
 - Aerospace engineering
- Introduction to Programming
 - High school
 - College and university-level courses (true introductions through advanced courses)

Our other use o notebooks or education include:

- Building models/simulations (with and without programming)
- Using widgets to demonstrate and interact with simulations
- Visualizations o process and data

# 2.3 Course benets & anecdotes

#### 2.3.1 Engagement

As teachers we routinely struggle to engage our students, especially when we are constrained by the ormat o the course (e.g., online, 50-minute lecture), available technologies, students distractions, and/or other actors. Nevertheless, it is substantially our responsibility to create environments and experiences within these limits that engage students in our courses. This is where notebooks can give you another tool to break out o the mundane, and get students engaged in their learning.

Figure 2.2: From: http://go.gwu.edu/engcomp2lesson4

#### 2.3.1.1 Conversations with data

The creators o Jupyter describe it as a set o open-source tools or interactive and exploratory computing, and a platorm or creating computational narratives. Jupyter allows us, as educators, to narrate a "conversation between the student and data". Consider this example, using the data o lie expectancy o many countries over the years:

I use a short bit o code to make a graph showing the time evolution, in what is called a "spaghetti plot" (see gure). Looking at this messy graphic, I point out how most o the lines show growth over time: lie expectancy is improving all over the world. But a couple o lines show a marked dip in a given year. I can ask students: which country had that dip? What happened there? Why? With a bit more coding, we identiy that Cambodia had a shocking lie expectancy o about 30 years in 1977, and Rwanda had even worse lie expectancy in 1992. We then have the opportunity to discuss why these countries experienced a mortality crisis. The data brings to lie a meaningul discussion, with many possible paths involving history, politics, economics, and health. – Lorena Barba

Jupyter notebooks are essential tools o connection—tools that engage learners in transitions in their thinking. The opportunity o intermingling computation into a narrative, creating a conversation with data is a powerul and eective orm o communication. With Jupyter, you now have a new orm o content to create and share with learners: computable content. In a world where every subject matter can have a data-supported treatment, where computational devices are omnipresent and pervasive, the union o natural language and computation creates compelling communication and learning opportunities.

#### 2.3.2 Participation

Engaging students in your courses requires their participation and interaction with you, their peers, and/or the content (Moore, 1989). How, when, and why you use student participation in yours will, o course, depend on your goals, the specic objectives or teaching the content within your course, your students, and other actors. Using notebooks, however, encourages participation and gives you more tools or promoting participation. Notebooks can connect students to authentic external audiences as well. Students can, or example, consume notebooks rom other classes, and publish notebooks where others can read them.

#### 2.3.2.1 Real world experience – bringing concepts to lie

Notebooks are living documents, meaning they can be edited to respond to questions or input rom students and used a conversation piece during a lecture or presentation.

Our group uses Jupyter notebooks as "apps" to demonstrate concepts in geophysics. These notebookapps connect numerical simulations to widgets and relevant plots. In the classroom, we ask students to help dene input parameters based on an application or case study that they are interested in. Prior to displaying the results, we ask students to build a mental image o their expectations. I the resultant image matches their expectations, then we have reinorced a concept, and i not, it is an opportunity to learn. We as instructors can interactively engage with students' questions by updating the inputs to the simulation in order to explore concepts with them. Students have access to the same notebooks through ree web-platorms like Binder, so simply by ollowing a link, they can take the steering wheel and engage with the concepts on their own. Notebooks bring the concepts to lie and serve as a conversation piece or the interaction between learners and educators. – Lindsey Heagy

#### 2.3.2.2 Real world experience – Ticket to leave

Another example o generating participation in the classroom with Jupyter notebooks is the Activity magic, available as an extension. It creates what has been called a "ticket to leave" (or "exit ticket") via the notebook. The idea o a "ticket to leave" is an excellent way to end a class or lab. Briey, it is just a survey that you give the students (see gure). Oten, these surveys are given via a Personal Response System (also known as "clickers" or PRS) or cell phones. There are a ew uses o such surveys:

- 1. Give the instructor some eedback on the students' understanding, as a whole
- 2. Provide time and opportunity or students to review and synthesize today's materials
- 3. Allow the students to apply their recent knowledge to a novel problem
- 4. An additional instance to learn the materials

These questions do not typically require much time to answer, but are meant to capture the essence o the conversation o the class. Ater a minute or so to contemplate the question, the students select their answer (by clicking one o the buttons), and instructor shows the gestalt results (see gure).

Good "exit ticket" questions can be domain specic questions, but can also be metacognitive questions (about one's learning style, or example), or high-level organizational questions (e.g., "what was the goal o today's discussion?"). We recommend leaving enough time at the end o class (perhaps 10 minutes) to have a ull and complete wrap-up discussion. Ater the discussion, you may wish to adjust the ollowing class meeting i you eel that not enough students had the insight you were aiming or. For more inormation on "tickets to leave" see https://www.brown.edu/sheridan/teaching-learning-resources/teaching-resources/course-design/classroom-assessment/entrance-and-exit/sample. For more on the Jupyter Notebook extension, see using and installing Calysto Activity magic.

## ![](_page_11_Figure_2.jpeg)

Figure 2.3: Dr. Douglas Oldenburg (let) engaging with a student during a short course on geophysical electromagnetics (https://geosci.xyz). Photo credit: Seogi Kang

## ![](_page_11_Figure_4.jpeg)

Figure 2.4: Example o the Activity magic seen rom the students view. A question, with multiple choice answers is shown, with buttons or their input.

## ![](_page_12_Figure_2.jpeg)

Figure 2.5: The Activity magic, rom the the instructor's perspective. The barchart is shown on the projector once all o the students have had a chance to respond.

#### 2.3.3 Increasing understanding

Within any course you will typically try to achieve a diverse set o objectives. Benjamin Bloom (https://en.wikipedia.org/wiki/Bloom%27s\_taxonomy) provided a ramework or the detailed objectives we want to achieve, ranging rom basic knowledge (such as, terminology, specic acts, trends and sequences, classications and categories, etc.) all the way to ability to evaluate and create (such as, abstract relationships, judgments but based criteria, original works). Achieving the ormer (i.e., basic knowledge and comprehension) is ar easier to achieve than understanding (i.e., evaluation and creation); yet, most oten we, as educators, are striving or increasing the complex understanding o our students on the topics we are teaching. The good news is that notebooks oer a valuable tool or teaching toward understanding – moving students, or example, rom passively viewing course content to exploring, analyzing, synthesizing, and evaluating the content in active ways.

#### 2.3.3.1 Real world experience – Guiding learners at their own pace

The undamental theory behind Computational Fluid Dynamics (CFD) used in Aerospace Engineering is based on understanding the Navier-Stokes equations. "CFD Python" is a collection o Jupyter notebooks based on a practical module that Lorena Barba began using in class in her Computational Fluid Dynamics (CFD) course at Boston University in 2009. The 5-week module develops worked examples that build on each other to incrementally guide the learner to create a program to solve the Navier–Stokes equations o uid dynamics, in 12 steps.

In 2013, I was invited to teach a 2 day mini-course in the Latin-American School in High-Perormance Computing, in Argentina. The Jupyter notebooks platorm allowed me to create a guided narrative to support learners with dierent background experience and knowledge. For that event, we wrote notebooks based on the CFD course module, to use as instructional scaolding in the minicourse. Twenty students worked through the notebooks as sel-paced lessons, while I went rom desk to desk asking and answering questions. About our o the students completed all 12 steps in the 2 days, a bulk o them achieved up to about Step 8, and a ew o them lagged behind in Steps 4 or 5 by the end o the course. For those who completed the ull module, they had achieved in 2 days what my regular students in the classroom normally took 5 weeks to do. Seeing that was an eye-opening moment: both the power o worked examples in code, and the ability to allow learners to ollow their own pace made a remarkable

## dierence in these learners. – Lorena Barba

Based on the experience developing the "CFD Python" learning module (Barba & Forsyth, 2018), this basic design pattern was adopted or creating lessons using computable content:

- 1. Break it down into small steps
- 2. Chunk small steps into bigger steps
- 3. Add narrative and connect
- 4. Link out to documentation
- 5. Interleave easy exercises
- 6. Spice with challenge questions/tasks
- 7. Publish openly online

This was particularly helpul or student understanding.

### 2.3.4 Increasing student's perormance

The goal o learning is oten actualized through the perormance o students. This is routinely most visible by what we attempt to assess during and at the end o instruction. Using notebooks we can create a variety o a perormance opportunities or students, thereby giving them more opportunities or practice and eedback, as well as more opportunities or us, as instructors, to assess their ability to perorm.

#### 2.3.4.1 Real world experience – The worked-example efect

The worked-example eect is the best known and most widely studied o the cognitive load eects (Sweller, 2006). It reers to providing ull guidance on how to solve a problem, resulting in better student perormance than problemsolving conditions with no guidance. For complex tasks, inexperienced or beginner learners benet the most rom the worked-examples procedure. One study (Chen, Kalyuga, & Sweller, 2015) concludes that: "worked example e ect occurs or complex, high-element interactivity materials that impose a heavy working memory load" and "when dealing with complex material that learners may have difculty understanding, high levels o guidance are likely to result in enhanced perormance over lower levels o guidance." This research-based guidance seems especially relevant or teaching novice programmers to use computation in the context o their subject matter (science, engineering, or other).

### 2.3.5 Increasing students' preparation or their career

In preparing students to apply what they have learned, striving to align what happens in the course with what they will experience in their career is important. From using parallel sotware to mirroring workows, we want our students to experience and be prepared or the workplace. Recognizing, o course, that workplaces are not static and the skills required or a career are always emerging, using notebooks provides a exible platorm to build skills and build portolios o what students can do.

#### 2.3.5.1 Real world experience – Publishing a data narrative as a demonstration o industry ability

For Data Science careers, a publicly shared narrative about a data analytics project goes a long way at demonstrating the student's potential at an interview. Elizabeth Wicks has her students develop a Jupyter notebook that tells the story o a data munging and analysis project done in the class. The students then publish this notebook to their Github prole pages. Being that Jupyter is one o the most popular ways in industry to communicate data science results, the students have a very valuable key to a potential career.

## TODO: Add quote rom Elizabeth

## 2.4. STUDENT BENEFITS 15

# 2.4 Student benets

Creating opportunities or students to develop as learners stretch beyond the boundaries o any specic course where you may use notebooks. By enriching their learning experience in your course, you will help them develop valuable skill-sets and mind-sets that they will take with them into other courses and into their career.

#### 2.4.1 Computational thinking

Jupyter notebooks support a wide range o learning goals. Its interactivity enables building intuitive understanding o domain knowledge, such as the understanding o a mechanical response o a system while varying parameters or understanding how an algorithm behaves. Notebooks can also help teach eective communication skills, combining prose with graphics into a strong narrative. Finally, notebooks can support teaching or strengthening programming skills, by combining code with text descriptions and visualizations. Even i a notebook is designed to be consumed passively, the exposure to code helps show students how to do something—and that they can do it themselves. This also helps demystiy coding or students who do not view themselves as traditional "computer science" types.

Using notebooks, you can create rich learning experiences that link together the core oundations o computational thinking:

- Decomposition: Breaking down data, processes, or problems into smaller, manageable parts
- Pattern Recognition: Observing patterns, trends, and regularities in data
- Abstraction: Identiying the general principles that generate these patterns
- Algorithm Design: Developing the step by step instructions or solving this and similar problems

#### 2.4.2 Open-source

Integrating notebooks into classes also exposes students to a large and growing ecosystem o open-source tools. This supports their education, but also provides experience in the same environment o tools used in industries in high demand or trained employees, such as data science and machine learning. The open-source nature o these tools also ensures that course content remains accessible and aordable to all students—including those outside the traditional university environment.

Unlike proprietary notebook technologies such as Mathematica, or specic programming languages/environments such as Matlab or C++, the barriers to entry or students learning with Jupyter notebooks can be extremely low. At a minimum, during a lecture, students can simply watch/read an interactive demo using a notebook, to replace slides or lecture notes. On their own, using a cloud service such as Binder or Jupyter Hub, students can open any modern web browser to some address and interact with a notebook (an example o this technology can be ound at https://jupyter.org/try), without needing any installation or conguration. In the most complicated case, students can install Anaconda and ollow simple instructions to install the Jupyter Notebook, which works and looks the same on all platorms—and is ree and open source.

#### 2.4.3 Active learning

Thanks to their interactivity, notebooks enable a spectrum o active learning methods, which have been shown to increase perormance in science, engineering, and mathematics (Freeman et al., 2014). To start, students can consume notebook content by reading and running notebooks, then move to editing or completing notebooks as assignments. This allows students to ocus on the content and concepts, rather than just note-taking.

At the top o Bloom's Taxonomy is pure creation, where students can, or example, author complete computational essays. In both cases, notebooks support courses where students have a wide range o experience and ability: students who need help can rely on the scaolding o prose explanations and existing code, while also providing room to stretch and explore or more-experienced students. The additional annotation and prose that accompanies code also helps support non-traditional learners and students rom underrepresented groups who may have less initial experience/comort with programming.

Instilling the habits o active learning, through the use o notebooks, will also provide benets beyond the boundaries o your course. Interactivity drives engagement, interest, and exploration o concepts. Engaged students in your course are more likely to be engaged learners in other courses and beyond.

# 2.5 Instructor benets

Notebooks can be adopted at a variety o levels and ormats, oering exibility based on the needs o a course and comort/interest level o the instructor: in-class demos, interactive labs, auxiliary material (e.g., book replacements, lecture note supplements), assignments, or ull course content in a ipped learning environment. Notebooks oer a route to active learning methods or instructors without experience o them, but do not orce a particular teaching style.

At a minimum, notebooks can be used to make publishable and interactive lecture notes that blend narrative text, images, videos with image and results to present the concepts. Furthermore, these course materials can be developed gradually, starting with a low-eort drat to a more-polished, publishable document that can be easily extended over time—and adopted by others. The growth o open-source communities around sotware tools and educational resources creates more opportunities or the re-use and adaptation o existing resources.

While many notebook authors do use Python, the Jupyter Notebook supports many languages, so students (and instructors) are not tied to one specic language. Indeed, the name Jupyter comes rom three languages: Julia, Python, and R. Furthermore, these (ree) tools have minimal barriers to entry—using a cloud inrastructure means students and instructors do not have to install anything, while in the "worst" case installations require a ew command-line excursions, but these are ree, openly available, and cross-platorm.

### 2.6 Conclusions

We hope that this chapter has illustrated that teaching with Jupyter notebooks can be valuable or you and your student. We have shown notebooks to be a tool that can increase student engagement, participation, understanding, perormance, and preparation or their careers. These are substantial accomplishments that can be achieved in a variety o disciplines and content areas. Using several real world examples, we attempted to illustrate the numerous ways teachers are using notebooks. Hopeully these, when combined with the chapters that ollow, will guide you in 1) supporting your students' learning, 2) giving you condence that you can use notebooks, 3) help you understand the necessary logistics, and 4) help give you clear expectations o what can be accomplished with Jupyter notebooks.

# Chapter 3

# Notebooks in teaching and learning

Jupyter notebooks are a valuable tool or teachers, but their value can only be leveraged i you apply them correctly within the context o your course. In this chapter, you will learn how teachers can initially structure the design o their course and then determine when and how notebooks can be used to achieve their goals.

# 3.1 Oh the places your notebooks will go!

#### 3.1.1 Introduction

In Chapter 4 you will learn about the many creative ways that notebooks can be used within the design o your course. Many times notebooks can be adapted into course activities that you are already doing, and other times notebooks will give you opportunities to extend what you have done in past to increase the engagement, participation, understanding, and perormance o your students. Jupyter notebooks can be a valuable member o your existing instruction toolkit, useul at every point in the learning environment. New adopters o Jupyter can start small, incorporating notebooks into single modules, assignments, or classroom activities. This is an excellent approach to see how your learning audience interacts with the notebook environment and explore notebook hosting systems in a low cost/risk way.

Instructors adopt Jupyter within their classrooms at a variety o levels, each making use o the strong eatures o the environment. Transitioning an existing course to any new platorm seems daunting, but Jupyter notebooks are modular and ideal or an iterative development approach o adoption. Some may nd themselves inheriting a course already built in Jupyter, while others will choose to build new courses entirely within Jupyter.

This section seeks to inspire you about the many uses o Jupyter within classroom content and presentation design, and preview how other elements o the Jupyter ecosystem can be integrated into that use. Some o these uses are quick to spin up as experiments to test the waters.

#### 3.1.2 Jupyter notebooks as textbooks

Instructors oten write Jupyter notebooks as linear narrative documents. These notebooks are to be read by students and learners, perhaps worked through, marked up and are a relatively one sided inormation consumption experience.

Most oten these notebooks exist as the readings a learner is required to do beore class, as reerence material (e.g., to review or uture assessments), or something that a learner works through on their own as a part o sel study. Jupyter notebooks can be constructed o completely static text, which can serve as a starting point or transitioning existing material into the notebook environment.

This traditional static textbook chapter or section can be extended into an active space by changing inline code text to executable code cells that support modication and experimentation. Adding prompts with suggestions or interrogating the code and examples urther extend active learning opportunities without rewriting the original content. Interactive sliders, user input sources, and manipulable visualizations are examples o how other widgets and plugins can open up more possibilities.

As you'll see in later chapters, many authors are using Jupyter notebooks as their primary authoring and publishing platorms. These materials are published on paper and online, meaning that the interactive portions o the learning experience are rst class elements within the resource.

#### 3.1.3 Notebooks as workbooks/primer

Workbooks engage students in the notebook environment by including active elements where they are asked to manipulate or create new content. This moves students rom a passive or static learning environment like a book into an active learning experience where they can engage with and critically think about the content.

You can include many pedagogical patterns (discussed in the next chapter) within a workbook, crating a completely custom learning experience. These workbooks can be assigned as independent student learning (or example, prework or ipped classroom), or as part o an in class activity or individuals or small groups.

When teaching in the technical space, the exploration o concepts in their context is an ideal environment or showcasing an authentic experience to students. Studying a concept in isolation may reduce the complexity o the problem to be more accessible, but this removes it rom the context or why it exists and may make it harder or students to put all the pieces together and synthesize it into their larger problem solving repertoire.

Retention o this context adds the complexity o expository text, technical reerence in disconnected documents, or some boilerplate code. Providing this in a large script or lengthy lists o direction can be overwhelming or students to work with. Jupyter notebooks are excellent tools or teaching these complex workows, because instead o a script with lengthy code comments or having disconnected documentation, this guiding text can be embedded exactly where it is needed where the coding is happening. This guidance material can also be ormatted as markdown cells, which are visually distinct rom code, making it easier to visually scan and opens the possibility to add helpul ormatting.

A variety o activities can be supported with the executable code cells so learners can explore the space in an interactive and iterative environment. They can see and inspect portions o the surrounding code, but aren't required to touch it, maintaining appropriate granularity or assignments and challenges. Using markdown ormatting separating sections helps scaold larger problems and help them really experience a real world workow rather than statically read about it.

#### 3.1.4 Notebooks as worksheets/drill sets

Many programming and domain tasks have specic syntaxes to be learned and eectively memorized beore they can be internalized. Akin to math homework sheets, short worksheets where learners ocus on highly granular or decontextualized problem sets lets them practice the complex syntax and procedures in an isolated and highly ocused way. A set o small targeted tasks where these complexities can be practiced without the worry o additional syntax errors or other problem solving requirements can reduce the cognitive overhead a student might be overwhelmed by.

The cell based nature o the Jupyter notebook makes interactive code-based worksheets a clean experience or students to run. Each problem prompt can be written in a markdown cell, perhaps reerencing an object or data le established in an initial cell. For example, a list or other data structure would be dened at the top and the exercises below are ocused on the relevant methods and usage syntax. Each answer would then be completed by the student in a single code cell just below that markdown cell. This means that outputs and errors stay with the code producing them, so successes or bugs are easily traceable to the source.

Usages o autograding tools or unit tests, as discussed in later chapters, can be added to give students instant eedback about their work. Example or desired outputs could also be reproduced in markdown cells with the question or urther guidance.

#### 3.1.5 Notebooks as notepaper or course packets

The ability or a notebook to represent a linear experience with human prose and working code means that these can be used a student's notepaper in class. They can capture the linear narrative structure o a lesson or lecture, and actually run the code they are taking note o. This ensures that what they have written down actually works, and makes or a strongly reusable document or them moving orward with homework.

Encouraging students to use Jupyter notebooks or taking class notes opens up urther opportunities to provide sca olding and support within the classroom. Providing notebooks with outlines o lecture content or other materials covered in class can become an useul active learning and engagement strategy. You might provide a mostly blank notebook with just topic headings, and ask them to take notes in their own style within those spaces. Or you could choose to embed reerence notes, examples, and even small activities within the notebook, asking them to both take notes and work through examples with you.

Caution should be taken to encourage students to careully maintain a linear order o their code in the notebooks. A later chapter has more inormation on Jupyter specic caveats that students should remain aware o.

#### 3.1.6 Notebooks as an app

Notebooks even have a place in non-coding classroom content or activity. Interactive user inputs like mouse or touchscreen controlled sliders, buttons, highlighting, etc. allow a notebook user to manipulate input parameters or a visualization, tool, or model without directly editing any o the code within the notebook. These strategies support interactive computational exploration, or transorm the notebook into an advanced calculator tool or students to use within their homework. These notebooks are then treated as applications that are distributed or made available or students to use during class or explore on their own.

This allows you to make an existing research workow accessible to novice students as part o a computational module o a oundational class, or mock up content rom a static textbook or reading into something or an active learning activity. The adaptability and reuse aspects o Jupyter notebooks also create opportunities or students to take this code urther and adapt it or assignments or other research.

#### 3.1.7 Notebooks as lab reports or assignments

There are a variety o assignment deliverables that programming and technical courses may require. Students may be asked to produce essays, presentations, working code, analytics, and even art or music. Many o these deliverables are directly supported within the notebook environment. Any written work could be completed within the notebook environment with markdown, which is ideal or communication content that is driven by data or incorporating code content. For example, a student could write a computational essay within a notebook, and use one o the presentation tools to present a report out in class, all using the same notebook.

Coding assignments can be submitted to a Jupyter supported learning management system and be autograded (discussed in later chapters), providing instant eedback and automating the grading process. This opens up sel paced and highly scaled options or many courses, particularly open access MOOCs or large sections. Meanwhile, the inline visualization options mean that an assignment with graphical output can be sel contained without trying to embed images within a word processing document or attaching a collection o images along with a script.

The multiple conversion and hosting options available to notebooks means that they can be shared or submitted across many ormats. For example, conversion to HTML means that there is zero overhead or viewing the content, and support or markdown and PDF opens up accessibility and other publishing platorms.

### 3.1.8 Notebooks as interactive multimedia platorms

A variety o media ormats can be embedded within a notebook, and other tools more oer platorms to more directly connect notebooks with multimedia content. Instruction content might be split up between short videos (oten or ipped classrooms) or a variety o static images might be important or an assignment. The markdown cells within the Jupyter notebook provide several ways to place hyperlinks and embed a variety o media.

Several widgets are also available or embedding playable audio and video content (including rom streaming video services) directly within the notebook. This creates a cohesive platorm experience or the student, so they don't have to exit out or change screens to work on their assignment and reerence that content.

Other tools are available or more directly connecting the notebook content to a video guide. Video lectures or content in your courses can get lengthy in running time and associated notebooks are oten just as long. Tools like Oriole provide a platorm where you can integrate video timestamps into notebooks to create interactive video experiences. You can include, or example, Youtube videos within notebooks, with text and/or coding opportunities beore/ater the video. Using timecodes, you can also guide students through the videos in tandem with the notebook text. This urther extends the ability to create a single cohesive interactive experience without the need or students to go back and orth between materials.

### 3.1.9 Notebooks as a demonstration platorm

Eventually you will have to display a notebook in class. This may be as a demonstration o how to use a notebook, presenting more a traditional style lecture, creating and editing code, or using an interactive eature to explore an experiment. Normal standards or ont sizes, organization, and accessibility stand or these cases.

Displaying actual notebook within your presentation is a natural starting point. This content may include text rom markdown and La TeX, code, and independent gures and sketches. For instance the lecturer could display the notebook, slowly scrolling through the material and interacting with cells containing code while also making use o either a digital or analog (e.g. chalkboard) sketching device. Custom styling plugins are available to change the background color, ont, and other viewing aspects o the notebook or better presentation quality and accessibility.

Several slide show tools are available, which allow you to markup notebook cell content or a more traditional slideshow presentation mode without having to exit rom your standard notebook. These slides can be scattered across notebook content into specic cells that will correspond to individual slides, with the other content ignored rom the presentation. This then can be shown alongside the usual notebook interace and can be ipped between the other orms o content.

It is natural or students to read and interact with notebooks in their standard orm, using either Jupyter Notebook or Jupyter Lab, and this can also be used or presentation. Jupyter Lab oers the convenience and uniormity o being able to open and edit source les (.py, etc.) within the same environment and without OS- or browser-specic clutter. Full screening the browser is recommended i presenting using this mode. Presentation styles vary widely and span a spectrum rom ull-prepared notebooks to blank-slate live coding.

Many nd it useul to incorporate an alternate modality such as a physical or digital "board" or ree-orm diagramming, working through a mathematical derivation, or other written procedural task. Notebooks can be a portion o these presentations or the complete environment, depending on your personal instruction style and content needs.

Care should be taken about how the notebook is presented and demonstrated. Doing a live demo gives you a ew options. You might choose to:

- Scroll through a notebook
- Step through a notebook by executing the cells in order
- Fill out details or values into a mostly complete notebook
- Tweak or esh out a notebook with some content
- Add content to a completely blank notebook

Each o these strategies have a place within a classroom, and their use should be inormed by audience needs and learning goals. For example, having a notebook with prepared challenges or the end o each module or section, but with blank cells or the content gives you the opportunity to develop code live within class, but within a structure that keeps your workow organized, and yourormative assessments coded directly into your presentation. Incorporating reerence inormation can make these documents more complete or students and answer common questions. There are many possibilities about what you can put in. Keep in mind that students will oten ask or you to share copies o these notebooks ater the class session is completed.

How much you ocus on live coding will likely be determined by the domain content o the class. Programming courses would clearly have a priority or students to have more thorough practice with writing and typing in the code. However, a conceptual class looking at computational models may interactively tweak parameters or a model and discuss only what is happening within that mathematical model. No code is written or directly changed in the process.

#### 3.1.10 Notebooks as a live coding environment

Live coding, as the name implies, involves the active writing o code within the instruction process. This might be part o a recorded screencast or an in person classroom. The process o live coding has several benets or the student and instructor.

Showing the process o building up code examples showcases the natural non-linear process o how code is crated, but walking through the logic o a code example slows instruction down and highlights the reason or inclusion o each element within the code.

Introduction o bugs (either purposeul or accidental) to the code has the added benet o giving the presenter an opportunity to work through the debugging process and demonstrating that perect code is never created on the rst go.

Live-coding can also be an opportunity to provide an active learning experience by providing notebooks with code that has not been completed beore the lecture and having students attempt to ll in the missing lines beore doing the live-coding demonstration. Feedback on where students are in this process can be a useul way to also judge what students are retaining and are struggling with leading to just-in-time teaching opportunities.

Formative assessment and prediction prompts can also be incorporated either directly into the notebook or as part o the narration o the lecture. Creating live-coding opportunities can be done anytime where a block o code exists but picking out particularly illustrative examples or key points and appropriately scaolding the example can be critical. For example, i the critical concept is inside o a or loop then only coding the inner part o the or loop can be helpul and not overwhelm the presentation with scaolding such as the setup. The reverse can also be true however. I too much complexity or scaolding is displayed learners may struggle to understand the scaolding rather than concentrating on the key concept.

Many instructors utilizing live coding will choose to have students code along with them. This allows them to practice what they are learning, see it in the natural context o their environment, make all the normal mistakes and typos, and all within an environment where they can ask questions (or pause a video). Actively coding along with the instructor also includes a requirement that they are actively listening to the instructor and engaged with the content.

Presentation styles o scrolling or shit + enter are not live coding, but live demonstrations. While these limit or negate the benets o the live coding environment, the benets o speeding up the presentation or running through code that's irrelevant to the learning goals may be more important. Removing the student's active engagement with the content may eventually lead to their disengagement with the lesson, or missing large chunks o inormation. Instructors should balance their inclusion o live coding and live demonstration to ensure that students are active and engaged with the most important aspects o the lesson.

Inormation bandwidth in the classroom during a live coding session needs to be careully managed, particularly when students are trying ollow along. The rhythm o live coding roughly has three stages: preparation, typing, and explanation. These three ollow quickly in succession but are independent phases. Preparation is the rst, where you stop and explain what you are about to do. Typing is the next phase where you should speak as you type but only say what you are typing. This ensures that what the learners are seeing on the screen and hearing rom you match. They will likely be looking back and orth between their screen and yours that they oten won't be able to stop and ollow what you are saying while they are typing. The nal stage is to stop and explain what you have typed and what has or will happen when you run the code. You may choose to execute the code and explain the results or include a ormative assessment or prediction question beore running the code. Pausing to explain the code you just wrote and walk through the results gives students time to catch up to your typing, time to consider what has happened, and a natural place to ask (and or you to as or) questions about what has happened.

Live coding does take practice to get used to, but can be extremely powerul or you to restrain your pace to your learners and to retain engagement with your students.

#### 3.1.11 Conclusion about places

As you have just seen, notebooks provide a exible tool that can be used in numerous ways to achieve your course goals. Notebooks are exible enough that you can use them rom relatively passive to very active student learning, you can use them in your lecture or in a ipped-classroom environment. There is no single best way to use notebooks in your courses, and you explore the various options you will want to start lling your use o notebooks with a variety o the pedagogical patterns described in the next chapter.

# 3.2 Beore You Begin…

This chapter ocuses on course considerations when incorporating notebooks into a class. Experienced instructors may choose to skim parts o this chapter and ocus specically on how Jupyter notebooks would change their current teaching style.

Beore you begin adding Jupyter notebooks to your course, take some time to:

- Identiy your teaching goals
- Understand your students
- Develop your content strategy
- Consider the context o the learning environment

The Jupyter notebook is a tool; its use in this context is subject to the expectations o the instruction. Setting expectations or learning depends on your goals, your students, the content, the learning environment context, and you.

### 3.2.1 Identiy Your Teaching Goals

As with the creation o a building or robot or book, it is important to begin the process with a clear goal o what you are trying to create and why. The "and why" could be the most important decision you make in the whole process and it will (or at least it should) guide all the decisions that ollow. The why here is not about why to use Jupyter notebooks, but the why is the goal you have or your students.

Is the goal to teach them critical thinking skills, or how to execute a specic set o unctions to solve a problem? Is the goal that they will be able to translate mathematical concepts into real world application, or is the goal to teach them how to code? Be specic and clear, and then let the answers guide your decisions.

#### 3.2.2 Understand Your Students

Your students are central to decisions about when and how to use notebooks alongside other tools in your instruction. An obvious illustration o these decisions would be selections made i you compare teaching 5th graders in relation to teaching graduate students. Yet, there are more subtle dierences that you will also want to be aware o and monitor. For example, within a classroom, you will have variation among the backgrounds and skill levels o the students. Depending on the domain, some students may have extensive experience with coding in multiple languages while others may be doing their rst computational explorations. Keeping students o all dierent experience levels engaged and excited is challenging.

## 3.2. BEFORE YOU BEGIN… 23

#### 3.2.2.1 Learn About Your Students

In many circumstances you will have little background inormation on your students prior to the rst day o a class or workshop. You will have to learn quickly and be prepared to adjust the instruction to t the students in attendance not the students you wish you had or anticipated having. Some key considerations to learn about your students:

- Motivation: Why are your students participating? What are their goals beyond the workshop or class? Will they be applying what they learn soon, or not or months or potentially years?
- Entry skills: What skills are students coming to the instruction with, both technical (e.g., basic computer, coding, computational) and psycho-social (collaboration, presenting, asking questions)?
- Prior topic knowledge: Specic to the content o the instruction, what do they already know coming in?
- Attitudes toward content: Are they excited to learn, or nervous about the content? How condent are they about their success in the class?
- Attitudes about the delivery ormat: Do they have attitudes, positive or negative, about the delivery ormat (e.g., lecture, ipped classroom, lab) and/or technologies (e.g., learning management systems)
- Learning preerences: Are learners comortable in active learning experiences? (e.g., working with teams, interacting with the instructor, using technology while learning, etc.)
- Group characteristics: Looking at these considerations, how diverse is the group? Have they been together or instruction beore? Do you have a small class or a very large class?

A simple online survey ahead o class can be very helpul in gaining an understanding o your audience.

#### 3.2.3 Cultivate Student Study Skills and Learning Strategies

Do not assume that your students will have acquired the necessary study skills to eectively and efciently learn rom your course. From note-taking skills (i.e., nding patterns, discerning what is worth writing down, linking to readings, etc.) to multitasking (i.e., knowing when it is ok to keep their email open while studying and when they really have to ocus) are skills that oten have to be developed during learning experiences.

For most students learning through hands on tools, such as notebooks, will be quite dierent than their previous learning experiences—especially coming out o traditional high school or large-lecture undergraduate course. Interacting actively with technologies or the express purpose o learning (i.e., not just socializing with riends) is valuable—and yet not common.

Take time to work with your students to help them build the oundations or how they can most benet rom the experiences you are creating. Talk with them early in the instruction about how notebooks will be used and how they will have to adapt their study strategies (where, when, and how they study) to best learn the content and achieve the goals o the instruction.

#### 3.2.4 Develop Your Content Strategy

The content o the instruction should support the instructional goal(s) you have identied or the course. Sometimes the goal(s) and the content are synonymous, but other times they are not. For example, i your goal is or students to be able to calculate conjoint probabilities, then your content will be synonymous and be on calculating conjoint probabilities. Whereas in other contexts, your goal may be to develop critical thinking skills in relation to logical allacies, and the content you use to achieve this is the analysis o political discourse, which is not necessarily synonymous.

In both cases, the content guides why, when, and how notebooks can be used to achieve the goals. Remember that notebooks are solutions we can use to achieve our goals; they should not be conused with the goals themselves, even then they are closely related.

The content o your instruction is not limited to what you want to teach; it involves activities, exercises, eedback opportunities, and assessments. Each o these supports your goal(s) or instruction and benets rom the use o dierent tools within and outside o Jupyter notebooks. For example, i your content goals suggest that students require some specic knowledge (such as, what is a logic allacy) beore they are prepared to move on to another content topic, then you should assess that knowledge beore you select which tools (e.g., a ll-in-the-blank item in a notebook, or a verbal question to the students in a classroom, or a sel-reection) is most appropriate or that step in your instruction.

Having a comprehensive outline o the goals and related content or the instruction is key to making good decisions about how, when, where, and why to use notebooks in your instruction.

### 3.2.5 Consider the Context o the Learning Environment

Instruction happens in many interesting contexts—but learning is not restricted to the instructional texts that we construct. Students learn beore, during, and ater instruction, and notebooks may be a integrated components or students in all those contexts (see below).

Within our instructional contexts, those times when we likely have the most inuence on student learning, we also have lots o options or how we deliver learning experiences. As an instructor you can, or example, assign notebooks as pre-work or a ipped classroom approaches; use notebooks during an in-person or online class to demo or oer student practice; and/or use notebooks or homework, assessments, and resources that students can use later long ater your instruction. All o these create dierent contexts or your use o notebooks.

Other aspects o context that you should consider when determining your use o notebooks including both those o the instructional environment and then the later perormance environment o the learners.

#### 3.2.5.1 Instructional Environment

Today the instructional environment can be quite complex and involve multiple aspects. For instance, the instruction may include online videos, short lecture in a classroom, and then group activities in a lab. Each o these are unique environments and their characteristics may inuence how, when, where, and why you use notebooks.

- Classroom: How will students be engaged with the content? Given the layout o the room (e.g., small tables, lecture hall) are there opportunities or peer engagement?
- Lab: How does the physical structure o the lab environment oer opportunities or peer learning and sharing? What are the hardware and sotware tools available to students?
- Flipped classroom: What are required knowledge and skills that students must gain rom pre-activities? What is the role o video in the ipped classroom? Are students prepared with the study skills and strategies or learning independently in the ipped classroom approach? Will all students have access to the materials (potentially in a notebook) prior to the class? Do students have access to computers outside o the classroom? How will pre-reading/pre-watching be incentivized and assessed in the course?
- Online classroom: Are students prepared with the study skills and strategies or learning independently in the online classroom?

#### 3.2.5.2 Perormance Environment

Ater the instruction your students will, hopeully, apply what you have taught them, and the environment in which they apply your instruction can vary greatly. You will want to consider how any dierences between the instructional environment and the perormance environment might impact on the ability o students to apply what they have learned.

- Organizational/Managerial Support: Will students be supported in their use o the instruction and tools that you are using?
- Social Support: I they learn through group projects, will they also be able to apply the instruction when working on their own?
- Physical Aspects: Will they have access to the same, or similar, tools and resources they have access to during the instruction? For example, i students only learn in notebooks, will they also be able apply the learning in an IDE that is used by their employer?

## 3.2. BEFORE YOU BEGIN… 25

### 3.2.6 Crating an experience: choose the right tool and approach or the task

As an instructor, you create many types o learning objects or your classroom. Jupyter notebooks can be used to present many types o inormation, rom slideshows to book chapters to homework. You can imagine the large dierences you might have with the inormation you present within a slideshow, a book chapter, a homework assignment, and a worksheet or an in class activity. Jupyter notebooks can be used or all these activities, yet this is all within the same type o document platorm.

This reedom o expression available within the Jupyter notebook environment can add a lot o pressure and decision atigue to the design process. A blank notebook you intend to make a lecture document within and a blank notebook or an in class activity each look the same when rst created.

Content and design decisions should be driven by the purpose o the lesson and the needs o the audience. How many times have you asked someone a question and had them answer it in a completely unhelpul way? Perhaps you asked about how to implement something but they answered it conceptually, or you asked or reasoning about why something existed but they gave you a syntax inormation.

Learning goals and pedagogic practice are complex and oten domain and skill specic, but decisions about them come back to the essential question: what are you trying to do here? As an instructor, you not only need to select the right technology or the learning experience, but the right activities to ulll the learning mission o the day and the course.

Students are given a variety o experiences to aid in the learning process. Some topics are conceptual that students need time to experiment with and build intuition over; others are purely syntax that requires reerence and practice to build their internalize knowledge over usage, and some all in between.

The rhythm o the learning process sees students working independently, working together, reading, producing, listening, problem solving, and struggling. Each activity should serve a purpose as part o a larger experience. The same way that restaurant or business owners crat an experience or their customer, you are crating an experience or your students.

This design o this experience is not a simple process, and something driven by your expertise o your audience, domain, and your own ability to instruct. Through it all, your core perspective should be to incorporate elements that harmonize together to make an experience leading to your desired learning goal.

Perhaps or the section above add a block diagram or word cloud visual o the major decision considerations.

### 3.2.7 Transitioning to and rom Jupyter

Although this book ocuses on using Jupyter notebooks in education, we recognize that students have dierent backgrounds and amiliarity with coding. Not all students are ready to jump right into notebooks rom a traditional lecture-based classroom; while, other students may have signicant programming experience and may be closer to being ready to transition to IDEs.

Based on your analysis o the goals and context you will want consider the appropriate instruction points or introducing and exiting rom notebooks as a tool or achieving your goals. As your students gain experience with programming, they may be more interested in using an IDE. Likewise, you may choose to introduce a more traditional IDE rst and introduce Jupyter notebooks later. Exercises that can support this transition include assignments where they do the same task in 3 or 4 dierent IDEs and then reect on those experiences as they make decisions about which environments best supports their ambitions at the time.

#### 3.2.8 Conclusion about teaching practices

In this chapter we have attempted to place the use o Jupyter notebooks into the process o good course design. Notebooks are a tool that many teachers can use to increase student engagement, participation, understanding, and perormance—but that is not to say that every course and every lesson should use notebooks. Let the goals o your course dene when and how to best use notebooks to achieve those goals.

# Chapter 4

# A catalogue o pedagogical patterns

### 4.1 Introduction

In this chapter, we present a collection o patterns that are particularly aligned with teaching and learning with Jupyter. Each pattern is targeted at specic learning goals, audiences, and teaching ormats. With those in mind we describe each pattern and its pedagogical eatures that support the learning goals, present a practical example, and close each with any potential pitalls you would want to be aware o.

# 4.2 Shit-Enter or the win

Description: Instead oreading a static chapter about a topic, the learners read and execute code, as well as potentially interact with a widget to explore concepts. Starting rom a complete notebook, the instructor or learner runs through the notebook cell-by-cell by typing SHIFT + ENTER.

Example: The notebook (or a collection o notebooks) can be used as an alternative to a static textbook on a topic.

Learning goals: This pattern can be used to introduce a topic or promote awareness about a set o tools. Additionally, it can serve as documentation that provides a tour o an application programming interace (API).

Audience(s): Depending on the style o the notebook, this pattern can be used or a spectrum o programming abilities.

Format (lecture / lab / …): This pattern can be used as an alternative to a static textbook. In a tutorial, a complete notebook can be used to provide a tour o an application programming interace (API) o a sotware package.

Features: One benet o this approach is that learners have a complete working example which they can adapt or build rom. It provides opportunity or richer interaction than a static textbook.

Pitalls: This style does not prompt much engagement with students. Having a class that interactively works through a notebook can lead to some students nishing much aster than others (e.g., racing through SHIFT + ENTER). Breaking long notebooks into many smaller ones can help with the pacing in a lecture. Having a master notebook serve as the table o contents can then help students navigate through the class. Notebooks can be linked in a markdown cell as:

## [Notebook 1](part1.ipynb)

# 4.3 Fill in the blanks

Description: To ocus attention on one aspect o a workow, the scaolding and majority o the workow can be laid out and some elements removed with the intent that students (or the instructor during a demo) ll in those pieces. The exercise might be accompanied by a small test that the code should pass, or a plot, or value which the code should generate i correct.

Example: A undamental concept in computing is the use o a or loop to accumulate a result. A ll-in-the-blank exercise demonstrating an accumulator could lay out the initialization, provide the skeleton o the or loop and include plotting code, with the aim being that students write the update step inside the or loop.

Related patterns: This pattern is similar to Target practice; a dierence is that Target Practice oten ocuses on a bigger step in a multi-step process. Fill in the Blank exercises tend to be smaller and more immediate.

Learning goals: This pattern ocuses attention on a component o a task and provides the benet o demonstrating how that component ts into the bigger picture or a larger workow. It can be an eective approach or taking students on a tour o an API, requiring that they use the documentation o the sotware, or or ocusing attention on one aspect o an multi-step computational model.

Audience(s): This approach can be used with a range o students, rom those who are rst being introduced to computing concepts to those who have signicant experience.

Format (lecture / lab / …): Assignments and labs can adopt this approach (nbgrader can be used to help with marking). It can also be used in a lecture or tutorial setting where the instructor demos how to ll in the blank.

Pitalls: Some students don't nd this approach engaging. In particular, i the exercise is too simple or the level o programming competency o the students, it can be perceived as a "make-work" task.

### 4.4 Target Practice

Description: The Target Practice pattern ocuses the learner's attention on one component o a multi-step workow. The instructor provides all workow steps except the one which is the ocus o the exercise; the student will implement the "target" step within a notebook.

Example: In a climate science assignment, the notebook that is given to students provides code or etching and parsing 20 years o hourly average temperature data rom a public database. Students are asked to design an algorithm or computing yearly average temperature and standard deviation. Following this, the plotting code which plots the yearly temperature with error-bars showing the standard deviation is also provided to the students.

Related patterns: This pattern is similar to [Fill in the Blank] exercises. Fill in the Blank exercises are typically smaller and more immediate, while Target Practice exercises tend to be larger (e.g. an entire step in a multi-step process).

Learning goals: The aim o a Target Practice exercise is to ocus attention on one component o a workow and practice skills or solving that component. It can also be used to reect on broader consequences o choices made in the target step o an integrated workow or analysis.

Audience(s): This approach assumes some programming competency as learners are typically asked to start rom scratch on the step that they are practicing.

Format (lecture / lab / …): This approach is readily used in assignments or labs. It can also be used in an in-class demo where the instructor live-codes the missing component. It is benecial i preceeding steps have been discussed in earlier lectures.

Pitalls: As there is more reedom in the implementation, this approach is typically more engaging than a Fill in the Blanks approach. However, starting rom more o a "blank slate" can require more instructor input in order to get students started. Unit tests and pointers to useul library unctions are oten helpul, but may over-constrain the space o solutions, thereby reducing the level o creativity and problem solving expected rom students. The amount o guidance should be careully calibrated to the class and can be adjusted by giving tips in response to ormative assessments. Working in small groups can help mitigate the risks o students having trouble getting started or pursuing tangents.

# 4.5 Tweak, twiddle, and rob

Description: Students are given a notebook with a working example. They start by reading the text, running the code, and interpreting the results. Then they are asked to make a series o changes and run the code again; the changes can be small (tweaks), medium-sized (twiddles), or more substantial (robs). For the origin o these terms, see The New Hacker's Dictionary (Raymond, 1996).

Oering manipulations on a range o scales allows students to interact with notebooks in ways that suit their background and styles. Students who eel overwhelmed by the technology can get started with small, sae changes, enjoy immediate success, and work their way up. Students with more experience or less patience can make more radical changes and learn by "destructive testing".

Examples: In machine learning there are many steps to implementing an eective algorithm:

- Understand a problem
- Identiy the proper machine learning algorithm to create the desired results
- Identiy data and eature sets
- Optimize the conguration o the machine learning algorithms

We can write machine learning notebooks that allow students to modiy parameters and interact at multiple levels o detail:

- twiddle hyper parameters to quickly see minor improvements in the results.
- tweak eature sets to create new models or a bigger impact
- rob by replacing the machine learning algorithm with a new algorithm or a new version

This pattern is particularly suitable or examples with a lot o parameters.

Learning goals: This pattern helps students acquire domain knowledge by seeing the relationship between parameters and the eect they have on the results. It can also help students learn new notebook use patterns

This pattern is similar to "notebook as an app"; a dierence is that in this pattern the code is more visible to the students, which can help orient them i they will make bigger changes in the uture.

Audience(s): This pattern can work with students who have no programming experience; they only need to be able to edit the contents o a cell and run a notebook. It can also work with students who have no background with the domain; they can learn about the domain by exploring the eect o parameters.

Format (lecture / lab / …): This pattern lends itsel to a workshop ormat, where students are guided through a notebook with time-boxed opportunities to experiment. It also lends itsel to pair programming, where a navigator can suggest changes and a driver can implement them.

Features: Can help students overcome anxiety about breaking code, and build comort with sel-directed exploration.

Pitalls: One hazard o this pattern is that students might have trouble getting started, so you might suggest a ew examples; however, another hazard is that, i you provide examples, students will do what they are told and ail to explore. A third hazard is that the changes a student makes might be too unorganized; in that case the eect o the parameters might be lost in the chaos.

Enabling technologies: Ideally the students should work in some kind o version control system that lets them revert to a previous version i they break something (and don't know how to x it). Note that undo and redo, Ctrl-z and Ctrl-y, can be used to traverse deep history within each cell, but not across cells.

# 4.6 Notebook as an app

Description: Notebooks can be used to rapidly generate user interaces where students and instructors can interact with code through sliders, entry boxes, and toggle buttons. The code can run numerical simulations or perorm simple computations, and the output is oten a graph or image.

Example: In geophysics, a direct current resistivity survey involves connecting two electrodes to the ground through which current is induced. Current ows through the earth and the behavior depends upon the electrical resistivity o the subsurace structures; current ows around resistors and is channeled into conductors. At interaces between conductors and resistors, charges build up, and these charges generate electric potentials which we measure at the surace o the earth. Each o these steps can be demonstrated through a simulation where students or the instructor builds a model, and views the currents, charges and electric potentials.

## Related patterns: Top-down sequence

Learning goals: This approach can be eective or ocusing on domain-specic knowledge and acilitating the exploration o models or computations.

Audience(s): This style can be eective or students with minimal programming experience as they do not have to read, write, or see the code.

Format (lecture / lab / …): In lecture, this style o notebook can be used by an instructor to methodically walk through a concept step-by-step. It is also useul or promoting in-class engagement as students can suggest dierent parameter choices and instructors can adapt the input parameters based on students' questions.

In a lab or assignment, the notebook can be used as a "app" around which questions and exercises are built.

Features: Notebooks as apps can be used to promote engagement with students in lecture. In labs, assignments or in-class activities, this approach lowers the barrier-to-entry or students to explore complex models.

Pitalls: It is important to have well-structured exercises and questions or students to address with the app. As with any app, simply asking students to play with it does not promote productive engagement.

In structuring an exercise or students, we recommend putting instructions and questions in a separate document rather than in the notebook. I students view the notebook as an app, they oten want to interact with it rather than read it. By having instructions and questions that go alongside the notebook, they can have the app in view while reading.

This approach is not intended to be used or developing students' programming skills.

Enabling technologies: Widgets, domain-specic libraries such as simulation tools.

# 4.7 Win-day-one

Description: A win-day-one exercise brings learners to the answer quickly and concisely, almost like a magic trick, and then breaks down and methodically works through each o the steps, revealing the magician's tricks. It generally involves multiple notebooks: the rst notebook being the "win" which shows the workow end-to-end, and subsequent notebooks breaking down the details o each component o the workow.

Example: To solve a numerical simulation using a nite volume approach, a mesh must be designed, dierential operators ormed, boundary conditions set, a right-hand side generated and then the system solved. Naturally, there are important considerations or each step. For even a moderately sized problem, sparse matrices are necessary in order to keep memory usage contained, the mesh must be appropriately designed in order to satisy boundary conditions, and the solver needs to be compatible with the structure o the system matrix. These details are critical or assembling a numerical computation, but i introduced upront, they can overwhelm the conversation.

In a win-day-one approach, learners are rst shown a concise example, in which many o the details are abstracted away in unctions or objects. For example, methods such as get\_mesh, get\_pde, and solve abstract away the details o mesh design, creating dierential operators and solving the set o equations. In subsequent notebooks, the workow is tackled methodically, and the inner workings o each component discussed.

Related patterns: Top-down sequence, Proo by example, disproo by counterexample

Learning goals: This can be an eective approach or introducing complex processes, providing context or how each o the components ts together, and ocusing attention.

Audience(s): This style can be eective or a spectrum o student audiences rom those with some programming experience to those with signicant experience.

Format (lecture / lab / …): This can be eective or tutorials and workshops, and can be used over multiple lectures. This can be useul when introducing new topics to help hook students because they accomplish signicant results early in the learning process.

Pitalls: One hazard o the "win-day-one" is that the "win" is overwhelming (too much detail) or too magical (too little detail). An appropriate level o detail needs to be selected so that each o the components o the workow is demonstrated, but at a high-level.

#### 4.8 Top-down sequence

Description: Particularly in STEM, the deault sequence o presentation is bottom-up, meaning that we teach students how things work (and sometimes prove that they work), beore students learn how to use them, or what they are or.

Notebooks aord the opportunity to present topics top-down; that is, students learn what a tool is or and how to use it, beore they learn how it works.

#### Examples

- In digital signal processing, one o the most important ideas is the discrete Fourier transorm, which depends on complex arithmetic; in a bottom-up approach, we would have to start by teaching or reviewing complex numbers, which is not particularly engaging.
 - In contrast to writing the mathematics on paper, in a notebook students can use a library that does the discrete Fourier transorm or them, so they understand what it is used or, and see the value o learning about it, beore we ask them to do the work o understanding it.
- Some important methods are intrinsically leaky abstractions that require user expertise to use eectively and reliably. This is oten because truly reliable solutions (i they exist) are disproportionately expensive or common cases. Numerical integration and methods or discretizing and solving dierential equations oten all in this category. In addition to gaining intuition beore diving into the details, the top-down pattern can be used to expose these leaks as motivation to understand the methods well enough to explain and correct or the shortcomings. For example, one can motivate convergence analysis and verication (Roache, 2004) by showing a solver that passes some consistency tests, but does not converge (or converges suboptimally) in general; or motivate conservative/compatible discretizations by showing a solver that has been veried or smooth solutions produce erroneous results or problems with singularities or discontinuities. Consider, or example, Gibbs and Runge phenomena, instability or Gram-Schmidt (Treethen & Bau, 1997), entropy principles (Le Veque, 2002), eddy viscosity (Mishra & Spinolo, 2015), and LBB/in-sup stability and "variational crimes" (Brenner & Scott, 2008; Chapelle & Bathe, 1993).

Learning goals: This pattern is useul or building intuition, context, and motivation beore introducing technical domain content instead o building up in a setting where implementation details oten take center stage.

Audience(s): This pattern can be eective with students who have limited programming skills, as they can use a library and see the results without writing much, i any, code.

Format (lecture / lab / …): This pattern can be used in a single class session or homework, or spread out over the duration o a course; or example, students could use a tool on the rst day and nd out how it works on the last.

Features: Shows students value and rewards their attention quickly (see Win-day-one).

Pitalls: A potential hazard o this pattern is that students might be less motivated to learn how the tool works i they think they have already understood what it is or and how to use it. This hazard can be mitigated by making obvious the additional benet o understanding how it works (assuming that there actually is one—it is not enough to assert that knowing how it works is necessarily better). "Interesting" ailure modes (see examples above) discovered by students while trying to solve a problem are great or motivating deeper understanding.

#### 4.9 Two bites at every apple

Description: This pattern involves writing an activity that can address multiple audiences rom dierent perspectives at the same time. This can be powerul when addressing a mixed audience o students.

Example: Say you have a group o students, some o whom are computer science students and some o whom are physics students, and ask them to come up with two expressions or computing the centroid o an area. The computer science students will be tasked with a description that involves adding up discrete pieces o areas with or loops and the physics students tasked with using the integral denition. When the students come up with their expressions they can then pair up with someone rom the other background where they can attempt to explain how their approach matches the other and compare their nal answers.

Learning goals: Ability to translate rom one eld/language to another. Explain complex topics to someone rom a dierent eld.

Audience(s): Groups which are composed o disparate backgrounds.

Format: This ormat involves both individual and group work but can be used in a lab or lecture setting. The basic notebook would include an overview o the problem and then pose questions whose answer is the same but is worded or the dierent audiences. There can be a single notebook that contains both questions so that students can ll in their peers solution once they understand it or there can be separate notebooks or each group so they do not get distracted by the other question.

Features: Group work and peer teaching has been shown to be eective at not only reinorcing student knowledge but also at introducing students to new concepts.

Pitalls: It can be difcult to construct questions or each audience that require equal amounts o difculty.

# 4.10 Coding as translation

Description: Converting mathematics to code is a critical skill today that many students, especially those without strong programming backgrounds, struggle to do. Explicitly taking an equation and translating it step-by-step to the code can help these students make the transition to attaining this skill.

Example: Say you wanted to show the translation o matrix-vector multiplication rom equation to a numerical computation. This would involve setting up and explaining the mathematics and suggesting replacing the sums with loops and initializing the sum properly.

Learning goals: Translating mathematics to code (and vice versa)

Audience(s): Learners who understand the theory but struggle with the programming side o things.

Format: This type o pattern is oten best served as a notebook with some explanatory text and possibly some sca olded code so that a student can ocus on the critical areas. This can be done as easily as a lab exercise or in lecture with perhaps some time held out or the students to solve it themselves beore moving orward. It is critical to this pattern that there is a clear connection between the mathematical symbols (such as the summation) to the code (such as the or loops).

Features: This pattern can work to lower the barrier or students with low programming knowledge to take on more complex tasks.

Pitalls: I the exercise is not properly scaolded, namely it is too complex, students can be turned o. This is especially true i the code example is too complex with too many steps. For instance avoiding compound operators in the example above (+=) can help student retention.

### 4.11 Symbolic math over pencil + paper

Description: Your objective is to convey an understanding o a physical system governed by a complicated mathematical system. Working out the algebra is necessary to uncover the undamental behavior o the system, but how to do the algebra is not the goal o the lesson. In this case, you want to see the algebraic result and then teach the students the underlying meaning o the system,

Example: The Euler equations or hydrodynamics are a system o partial dierential equations governing conservation o mass, momentum, and energy. Their mathematical character admits wave solutions, and the eigenvalues and eigenvectors o the system in matrix orm are important to understanding the physical behavior o the density, pressure, velocity, etc., in the system. Working out the eigenvalues with pencil and paper is tedious, and not the objective o the lesson. In this case, we can use a symbolic math library like Sym Py (Meurer et al., 2017) to do the mathematical analysis or us, nding the eigenvalues and eigenvectors o the system, and we can then use this result to continue our theoretical discussion o the system.

Learning goals: Students will see how to do symbolic math that arises in their theoretical analysis.

Audience(s): STEM students that want to ocus on understanding a mathematical system without worrying about the algebraic details.

Format: This works well as a notebook that acts as a supplement to the main lecture. Since the goal o the lecture is the theory, the notebook can [TODO: complete]

Features: Abstracts the details o mathematics that is secondary to the discussion at hand into a separate unit that students can explore on their own.

Pitalls: This only works well in the case that the algebra is not essential to the main learning goals, but rather is simply something that must be done to get to the main goal.

# 4.12 Replace analysis with numerical methods

Description: Some ideas that are hard to understand with mathematical analysis are easy to understand with computer simulation and numerical methods.

In the usual presentation, students see and learn to do mathematical analysis on a series o simple examples, and resort to numerical methods only when necessary. In an alternative pattern, students skip the analysis and start with simulation and numerical methods, optionally visiting analysis ater gaining practical experience.

Examples: In statistics, hypothesis testing is a central idea that is notoriously difcult or students to understand. Students learn methods or computing p-values in a series o special cases, but many o them never understand the ramework, or what a p-value means. The alternative is to compute sampling distributions and p-values by simulation; anecdotally, many students report that this approach makes the ramework much clearer. Such simulation can also be used to drive home points about misconceptions held by most students and instructors (Haller & Krauss, 2002).

Similarly, in queueing theory, there are a ew analytic results that apply under narrow conditions; when those conditions don't apply, there are no analytic solutions. However, queueing systems lend themselves to simulation and visualization, and in simulation it is easy to explore a wide range o conditions.

And again, with dierential equations, there are only a ew special cases that have analytic solutions; the large majority o interesting, realistic problems don't.

Learning goals: This pattern is primarily about helping students see the big ideas o the domain more clearly, but it is also a chance to develop their programming skills. It also provides students with tools that are likely to be needed i they encounter similar problems in the real world, where analytic methods are oten inapplicable, ragile, or complicated to use eectively.

Audience(s): This pattern requires students to have some comort with programming, although it would be possible or them to get some o the benet rom seeing examples without implementing them. Non-programmers can use this pattern via prepared notebooks; see Win Day One.

Format (lecture / lab / …): This pattern can be used or in-class activities or homework.

Features: Students can understand general ideas without getting bogged down in the details o special cases; and they are able to explore more interesting and realistic examples.

Pitalls: I students are not comortable programmers, they can get bogged down in implementation details and debugging problems, and miss the domain content entirely. It is important to scope the implementation eort to suit the ull range o students in the class. Pair programming can help mitigate these problems, especially i every pair has at least one student with programming skills, and i students are coached to pair program eectively (without letting the more experienced student dominate).

# 4.13 The API is the lesson

Description: When students work with a sotware library, they are exposed to unctions and objects that make up an application programming interace (API). Learning an API can be cognitive overhead; that is, material students have to learn to get work done computationally, but which does not contribute to their understanding o the subject matter. But the API can also be the lesson; that is, by learning the API, students are implicitly learning the intended content.

Example: In digital signal processing, one o the most important ideas is the relationship between two representations o a signal: as a wave in the time domain and as a spectrum in the requency domain. Suppose the API provides two objects, called Wave and Spectrum, and two unctions, one that takes a Wave and returns a Spectrum, and another that takes a Spectrum and returns a Wave. By using this API, students implicitly learn that a Wave and a Spectrum are equivalent representations o the same inormation; given either one, you can compute the other.

## Related patterns: Top-down sequence

Learning goals: This pattern is useul or shiting students' ocus rom implementation details to domain content.

Audience(s): This pattern is most eective i students have some experience using libraries and exploring APIs.

Format (lecture / lab / …): This pattern TODO: complete

Pitalls: A hazard o this pattern is that students sometimes perceive the costs o learning the API and do not perceive the benets. It might be necessary to help them see that learning the API is part o the lesson and not just overhead.

# 4.14 Proo by example, disproo by counterexample

Description: In many classes, students see general results derived or proved, and then use those results in programs. Notebooks can help students understand how these results work in practice, when they apply, and how they ail when they do not.

Example: In statistics, the Central Limit Theorem (CLT) gives the conditions when the sum o random variables converge to a Gaussian distribution. Students can generate random variables rom a variety o distributions and test whether the sums converge and how quickly.

The classical Gram–Schmidt is unstable while the modied method is stable. Students can nd matrices or which this instability produces obviously unusable results. They can also nd matrices or which modied Gram-Schmidt produces unusable results due to its lack o backward stability, and this can be used to motivate Householder actorization and discussion o backward stability.

Some numerical methods or PDE converge with an assumption on smoothness o coefcients. Students can show how violating these assumptions leads to erroneous solutions, thus motivating discussion o conservative/compatible methods that can converge in such circumstances.

Learning goals: This pattern is primarily useul or developing mathematical or domain knowledge, but students might also develop programming experience by writing code to run the examples and test the outcomes. This is especially true i the space o (counter-)examples is "small", such that principled exploration (e.g., by nding an eigenvector, running an optimization algorithm, or searching a dictionary) is benecial.

Audience(s): This pattern requires students to have some programming experience.

Format (lecture / lab / …): This pattern can be used or in-class activities or homework.

Features: Helps students translate rom theoretical results to practical implications, and to remember the assumptions and limitations o theory.

Pitalls: This pattern requires additional time and student eort on a topic that might not deserve the additional resources.

#### 4.15 The world is your dataset

Description: Notebooks provide several ways to connect students with the world beyond the classroom: one simple way is to collect data rom external sources. Data is available in many dierent ormats that require dierent sotware tools to collect and parse.

I a dataset is available in a standard ormat, like CSV, it can be downloaded rom inside the notebook, which demonstrates a good practice or data integrity (going to the source rather than working with a copy) and demysties the source o the data.

For data in tabularorm on a web page, it is oten possible to use Pandas to parse the HTML and generate a Data Frame. Also, or less structured sources, tools like Scrapy can be used to extract data, "scrape", rom sources that would be hard to collect manually, and to automate cleaning and validation steps.

Examples: Datasets like the National Survey o Family Growth are available in les that can be downloaded directly rom their website, but the terms o use orbid redistributing the data. So the best way or an instructor to share this data is to provide students with code to input into a notebook cell, which, when executed, will download the data set the rst time the student runs the notebook.

Many Wikipedia pages contain data in HTML tables; most o them can be imported easily into a notebook using Pandas.

Sources o sports-related statistics are oten embedded in large networks o linked web pages. Tools like Scrapy can navigate these networks to collect data in orms more amenable to automated analysis.

Audience(s): Students with limited programming experience can work with datasets in standard ormats, but scraping data might require more programming experience.

Format (lecture / lab / …): This pattern lends itsel to more open-ended project work where students are responsible or identiying data sources, collecting data, cleaning, and validating, but it can be adapted to more scaolded work (see Target Practice).

Features: Contributes to students' eelings o autonomy and connectedness.

Pitalls: A hazard o this pattern is that students can spend too much time looking or data that is not available. They might need coaching about how to make do with the data they can get, even i it is not ideal.

Enabling technologies: Pandas, Scrapy, R, ROpen Sci packages

### 4.16 Now you try (with diferent data or process)

Description: Students start with a complete working example provided by an instructor and then they change the dataset or process to apply the notebook to an area o their own choosing. This method can allow more or less uctuation depending on the skills o the students. For example we can allow students to select new datasets rom a list that ensures the cells o the notebook will all still work or we can give them reedom to try new data structures or add new processes to break the notebooks and learn as they go through the process o xing the broken cells.

Example: An instructor designs a lesson in exploratory data analysis to scrape the critics' reviews or a specic movie rom a particular movie review website and then provide some simple visualizations. The students have a ew options:

- 1. Green Circle replace the movie name and pick any movie they want and then step through the new notebook and see the new results.
- 2. Blue Square adjust the notebook to scrape users' reviews rather than critics' reviews and then x any data parsing problems.
- 3. Black Diamond add dierent visualizations tailored to explore the user reviews (as opposed to the initial visualizations that are tailored or the critics' reviews).

There are various ways to test the properties o numerical methods. For example, students can use the method o manuactured solutions to test the order o accuracy or a dierential equation solver. They can also measure cost as the resolution is increased and present the results in a way that would help an analyst decide which method to use given external requirements (e.g., using accuracy versus cost tradeo curves).

## Related patterns: Top-down sequence

Learning goals: This pattern allows students to apply their knowledge

Audience(s): This pattern can be tailored or students with more or less experience even in the same course.

Format (lecture / lab / …): This pattern is best in a lab or an interactive tutorial

Pitalls: A hazard o this pattern is that students may go completely o the rails and chose datasets or new processes that have not been tested and will not work in the timerame allowed.

# 4.17 Connect to external audiences

Description: This is in some sense the opposite o "the world is your dataset." Here the goal is to take a workow or computational exploration and share it with the world so others can see it, learn rom it, reuse and remix it.

Examples: Your students are doing an observational astronomy lab where they take data rom a telescope o a transiting exoplanet (a planet around a star other than our Sun) and they examine the lightcurve to learn about the planet. The students present the lab as a Jupyter notebook with a reproducible workow that starts with reading in their data (images), walks through cleaning and reducing the images, and then perorms photometry on the host star to produce a lightcurve. The end product is a plot showing the star's brightness, dimming just slightly as the unseen planet comes between the star and earth. Elated with their result, the students want to share their data and workow so anyone else can redo the analysis.

Learning goals: Reproducibility is an important part o the scientic process. Having completed the primary scientic analysis that was the goal o the lab (obtaining a lightcurve o a transiting exoplanet), the students now can learn reproducible science practices by hosting their notebook on a webserver (e.g., Github) along with the data. An essential part o making the notebook reproducible will be ensuring that the notebook clearly lists the needed dependencies.

Audience(s): All students—everyone should learn about reproducibility.

## 4.18. THERE CAN BE ONLY ONE 37

Format: A sel-contained notebook hosted on a webserver.

Features: Teaches students about reproducible science workows.

Pitalls: You need to be clear about the library requirements needed to run the notebook. Also, since the data les are likely separate rom the notebook, it is possible or copies o the notebook to get shared without the data. Students may also be shy or earul o showing their work publicly, so explaining the benets may be needed to curtail their worries.

#### 4.18 There can be only one

Description: This pattern involves creating a competition between individual students or teams o students. Clear goals and metrics need to be dened and then students submit notebooks that are scored and evaluated. Competitions can span months or be completed in a single class.

The Jupyter ecosystem support or reproducibility and data sharing make it a great environment or creating healthy competitions. Kaggle is a site that hosts many machine learning competitions using Jupyter as its underlying inrastructure and is a great place or advanced students to extend their knowledge with a chance o winning cash prizes and solving current world problems.

Examples: Identiy a machine learning problem and a labeled dataset your students can use to train their model. Then select an evaluation metric and detail your problem statement and rules. Finally, launch your competition and allow your students to submit their notebooks and post their results on a public leaderboard.

Learning goals: Creative problem solving is a key aspect o this pattern. In addition, i the competition is team-based then the students will learn how to work in groups and communicate eectively and share responsibilities.

Audience(s): Students can benet rom healthy competition and working in teams, however it is critical that a sae, un, and engaging environment is created. Advanced students can be pointed toward kaggle or other public competitions that may be in their area o interest and give them a chance to test their skills in the real world.

Format: A competition can be dened with any metrics and rules and can be run in multiple ways. The students can help dene the rules or a simple vote can decide the winners. For a more ormal competition instructor can host ree competitions or their class hosted by Kaggle. https://www.kaggle.com/about/inclass/overview

Features: Teaches students about creative problem solving and teamwork.

Pitalls: Creating a air competition is not trivial and considerations regarding data, metrics, rules, and scoring may be time consuming. Competition is risky business and eort should be made to ensure both winners and losers enjoy the experience.

#### 4.19 Hello, world!

Description: In some situations (such as the rst day o class o a very introductory course) you may wish to do no more (and no less) than build condence in the students' abilities to be able to write a rst computer program. Traditionally, the rst program written was a "hello, world" program: a program that did nothing but display the text "hello, world" on the screen. However, these days students can have much more un, and step ully into the creative world o computing with very little instruction.

Example: Draw a rectangle. Change the numbers, run it again, and see what happens.

Learning goals: Reduce stress, build condence, connect onto their personal lives. Requires that they do learn the basics o Jupyter including: log in, open a new notebook, enter the provided code, and execute it. Oten leads to a very animated, active learning classroom activity ("How can I change the colors?", "How do I draw a circle?", etc.)

Audience(s): Beginning students.

## ![](_page_37_Picture_2.jpeg)

Figure 4.1: Figure: a rst sketch using Calysto Processing, a Java-based language designed or creating art.

Format (lecture / lab / …): First day o class, in-class exercise. Build on what students already know rom typing and reading (e.g., cut and paste, read top-to-bottom).

Features: Open ended, creative, un.

Pitalls: Works best when used with a pre-installed Jupyter (see the relevant chapter). Rather than telling students that they can do it, just do it. As a rst assignment, to cut down on the vast possibilities, we suggest limiting the palette o options. For example, restrict their drawings to use only a single shape, such as rectangle or triangle. We suggest having the students draw something in their lie that is important or meaningul to them. We suggest discussing the coordinate grid or the rst assignment and sketching an idea on paper rst.

# 4.20 Test driven development

Description: The instructor provides tests written in a unit testing ramework like unittest or doctest; students write code to make the tests pass.

Example: TODO: Necessary?

Learning goals: Helps students learn a good sotware development process.

Audience(s): This pattern requires students to have some programming experience.

Format (lecture / lab / …): This pattern can be used or in-class activities or homework.

Features: Helps students ocus on the task at hand and know when they are done (at least to the degree that the tests are complete).

Pitalls: Some Python unit testing rameworks are not designed to work with notebooks, and can be awkward to use. On the other hand, nbgrader [TODO: add cross reerence to nbgrader] supports automated testing o the code students write in notebooks; in that environment, the tests are not visible to students, which may or may not be a bug.

This pattern requires the overhead o teaching students about the unit testing ramework. Students working to make tests pass can lose their view o the big picture, and eel like they have been robbed o autonomy. This type o exercise is best used sparingly.

## 4.21. CODE REVIEWS 39

# 4.21 Code reviews

Code reviews involve a student or instructor providing eedback on someone else's code. This pattern involves peer work as well as a means or providing eedback to students on topics other than correctness o their code but also on code readability and styling.

Example: Present a problem to students that they must write a solution to, say computing the square root o a number without using a built-in unction but have them write a test or their unction that uses a built-in unction to compute the answer. Ater they are nished have the students pair up and perorm peer reviews o each other's code, commenting not only on the way they solved the problem, such as making up a list o pros and cons o their approaches, but also on the readability o the code.

Learning goals: Learn to read and understand someone else's code. Learn to write readable code.

Audience(s): Any group o students who are involved in coding.

Format: Once a suitable problem is ormulated in a notebook (or simply a script) then in-class review, as with the above example, can work or peer reviews. Alternatively students can upload their notebooks/scripts to a platorm such as Git Hub and the code reviews can be done using the tools available there. Sufcient scaolding must be provided so that students understand the process, how to make constructive comments and why the process is important. I an instructor wants to review and provide eedback notebooks/scripts can be collected and commented on with a similar explanation to students as to how they are going to be graded (i they are).

Features: This pattern leads to not just eedback or the person who wrote the code but also or the reader. Code review is also a critical piece o the sotware development process used in industry providing students with a view o the process. This can also have the result o making sure that a student's code is readable via appropriate code styling, commenting and documentation.

Pitalls: Students need to be properly inormed as to how the code reviews will impact their grades, especially i peer review is used. Notebooks on Git Hub are not as easily reviewed as scripts.

# 4.22 Bug hunt

Description: The instructor provides a notebook with code that contains deliberate bugs. The students are asked to nd and x the bugs. Automated tests might be provided to help students know whether some bugs remain unxed.

## Example: TODO

Learning goals: This pattern helps students develop programming skills, especially debugging (o course); it also gives the practice reading other people's code, which can be an opportunity to demonstrate good practice, or warn against bad practice. It can also be used to teach students how to use debugging tools.

Audience(s): This pattern requires students to have some programming experience.

Format (lecture / lab / …): This pattern can be used or in-class activities or homework.

Features: Can be engaging and un; develops important meta-skills.

Pitalls: The bugs need to be calibrated to the ability o the students: i they are too easy, they are not engaging; i they are too hard, they are likely to be rustrating.

# 4.23 Adversarial programming

Description: This pattern involves participants writing a solution to a problem and tests that attempt to make the written solution ail. This pattern can be done in many ways including having students complete the tasks and pair up and exchange solutions/tests or having the instructor writing the solution and the students then write the tests.

Example: Students are tasked to write a unction that nds the roots o a polynomial specied via some appropriate input. They are also asked to write a set o tests that their unction passes and ails on. When students have completed these tasks they then exchange their notebooks and use the tests they wrote on their peer's unction. Finally they will discuss any dierences in their approaches and whether they can come up with ways to not ail each other's tests or i the tests provided are invalid.

Learning goals: Learn to write unit tests. Think critically on how an adversary might break their solution.

Audience(s): Any group o students who are involved in coding.

Format: Decide on a sufciently complex problem that may have non-trivial tests written or it and write up the question in a notebook. Then as an in-class activity or lab start the discussion regarding the tests. I appropriate the instructor can collect notable tests written by students and also share those.

Features: Provides a means or students to think critically about a problem they are solving and how someone might break their solution. Also can provide a learning activity with a orm o competition involved, which can then lead to an award system i desired.

Pitalls: With competition come dangers i students are not properly scaolded so that they can provide constructive eedback. Some problems and/or solution strategies are vulnerable to many corner cases, leading to tedious whacka-mole or atalism that may distract rom learning objectives.

# Chapter 5

# Jupyter Notebook ecosystem

#### 5.1 Language support: kernels

The Jupyter system supports over 100 programming languages (called "kernels" in the Jupyter ecosystem) including Python, Java, R, Julia, Matlab, Octave, Scheme, Processing, Scala, and many more. Out o the box, Jupyter will only run the IPython kernel, but additional kernels may be installed. Language support continues to be added by the open source community and the best source or an up-to-date list is the wiki page maintained by the project: https:// github.com/jupyter/jupyter/wiki/Jupyter-kernels. These projects are developed and maintained by the open source community and exist in various levels o support. Some kernels may be supported by a vast number o active (and even paid) developers, while others may be a single person's pet project. When trying out a new kernel, we suggest exploring a kernel's community o users and documentation to see i it has an appropriate level o support or your (and your students') use.

Jupyter's kernel exibility allows instructors to pick the right language or a particular context. For example instructors may use Python to teach programming, while switching to R to teach statistics, and then perhaps Scala to teach big-data processing. Regardless o the language chosen, the Jupyter interace remains the same. Thus, some cognitive load can be lessened when using multiple languages within or across courses (e.g., the user interace stays the same between the student's Digital Humanities and Biology courses). Students oten appreciate consistent use o the same language within a course, however.

# 5.2 Using Jupyter notebooks

When using Jupyter notebooks on the data projector or large screen monitor in the classroom, we recommend giving the students specic instructions on the meaning o the user interace o the notebook. It is not exactly intuitive.

The rst and most salient component o the notebook is the cell. Indeed, the entire contents o a notebook is composed o only cells. These cells can take one o two orms: text or code. We will descibe the authoring o a notebook in the ollowing section; however, here we identiy some o the subtle, yet important components o a code cell.

Code cells are composed o three areas: the input area, the display area, and the output area. The input area is identied by the In []: prompt to the let o the cell. Between the brackets o the In prompt can be one o three items: a number, an asterisk, or a blank. A number indicates that this cell has been executed and the value o the number indicates the order o execution. For example, normally, ater you execute the rst cell ater opening a notebook, its prompt will read In [1]:.

## ![](_page_40_Picture_9.jpeg)

## Pro Tip

When teaching with notebooks, you oten will want to reer to a cell my name. You could reer to a cell by its input prompt number. However, keep in mind that this number will change i you excecute the cell again, or that students may have dierent numbers i they, too, are executing their own copy o the notebook. A better way o reerring to a cell may be to reer to the text right above the cell as that won't change while you execute cells. For reerring to lines o code, see the ollowing section on Tips and Tricks.

Beore executing a cell, the input prompt number area will be blank. Thereore, you can tell at a glance that that cell has not been executed yet. It may also be the case that i an input prompt does have a number in it, then the cell has been run in the past. However, the cell may not have been run during this session, and thus the output may be showing old results. We recommend running rom the menu: Cell, All outputs, Clear at the beginning o a presentation. That initializes all cell inputs to the blank state.

During the execution o a cell, the input prompt will contain an asterisk. I it seems that too much time has passed and you still see In [\*]: your code may be in an innite loop, or you have lost communication with the kernel. You may have to interrupt or restart the kernel. This is discussed below.

Finally, it is important to keep separate the display and output areas below the input cell. The dierence between these two areas is subtle and conusing, but is very important in some instances. The display area is reserved or any item that code has produced or viewing. That includes simple text (i.e., print("hello, world")) or gures rom a plot. The output area is reserved or items that the cell "returns." This is why in many notebooks you may see a variable assignment ollowed immediately by the variable, like this:

```
x = 2434 + 33476
x
## ```

In this example, you wouldn't actually see the value computed unless you print it to the display area, or return the value. Here, we return it as the last value o the cell.

## ![](_page_41_Picture_8.jpeg)

Keep in mind that the bottom portion o the notebook on the screen or monitor may not be visible to students in the back o the room. Make sure that the ont size is large enough, and that you don't go too ast when demonstrating code that students don't have access to. We also recommend that you hide the Jupyter toolbar and header to get more room or the actual notebook (select Toggle Header and Toggle View under the Jupyter View menu).

# 5.3 Authoring Jupyter notebooks

Beore embarking on writing notebooks or your course, we recommend that you look around on the internet or related courses. A similar course or which an instructor has already generated notebooks could exist or you to use or adapt or your course. Notebook authors oten are happy to collaborate on open source educational resources or have their resources be used by other instructors. The ollowing sections ocus on Python simply because it is currently the language with the largest Jupyter eature support.

#### 5.3.1 Accessing documentation in the notebook

One o the best eatures o quality libraries is their documentation, which students and other users will likely consult regularly. From a notebook cell, the TAB key autocompletes (or gives completion tips) and SHIFT-TAB brings up ull documentation. Similarly, using a question-mark ater a method or unction will bring up the documentation ater the cell is run, as shown in Figure 5.1.

Using this eature in class during live coding or while explaining how code works helps make students comortable o working eectively with libraries.

Figure 5.1: A question mark used ater a method or unction brings up the documentation ater executing the cell.

#### 5.3.2 Widgets

Widgets provide the opportunity or learners and instructors to interact with code outputs, such as charts and tables. Widgets are "mini" Graphical User Interaces (GUI) that give the notebook user access to slide bars, toggle buttons, and text-boxes. They can be used in conjunction with code, allowing a change o mindset rom programming as a primary goal to exploring a model or computation as the primary goal. Alternatively, the code can be hidden and the widgets used to create a notebook "app" that might connect input parameters with a simulation and a plot.

Currently, only a small subset o kernels have widget unctionality. The reerence implementation o widgets are the Jupyter-Python widgets (https://ipywidgets.rtd.io). It includes widget components to generate and display sliders, progress bars, text boxes, check boxes, toggle buttons, etc. Many popular visualization tools, such as Matplotlib, Plotly, leaet.js, three.js, have Jupyter-Python widget implementations. The documentation contains an up-to-date list o all o the widgets and their variations. The interact method allows you to wrap a unction, which might be a simple computation or a complex simulation that produces a plot, and provides widgets or each o the inputs to the unction. Figure 5.2 shows a simple example o a sinusoid plot whose requency is controlled by a slide-bar. Another kernel that has some widget unctionality is C++ (https://github.com/QUant Stack/xwidgets).

In addition to the IPywidgets library, the ipyleaet library (https://ipylealet.rtd.io) displays an interactive map in a notebook.

#### Example

```
from ipyleaflet import Map
Map(center=[34.6252978589571, -77.34580993652344], zoom=10)
## ```

For the ambitions reader, there are resources available or you to write your your own custom widgets. The widget cookie cutter project (https://ipywidgets.rtd.io) is a good place to start.

#### 5.3.3 Magics

Magics are meta-commands that only unction within Jupyter and allow a user to access language/kernel-specic eatures. For instance, the IPython kernel provides a number o magics that can be useul while developing Jupyter notebooks using Python as the primary language. These are documented and we will only call out a ew o these here. Many other magics are available or dierent kernels but they are specic to Jupyter so may not be usable in a stand-alone script in that language outside o Jupyter. In some instances, you may want to use magics sparingly to avoid obuscating these meta-commands with the actual commands in the language you are teaching. Magics always

## ![](_page_43_Figure_2.jpeg)

Figure 5.2: Here, a slider allows the user to interactively change the variable k in our unction as we plot it.

## ![](_page_44_Figure_2.jpeg)

Figure 5.3: Interactive map widget with ipyleafletalt\_text.

begin with either a single % or single-line commands or with %% or applying a command to an entire cell. Some magics can be used with single or double %, but some cannot.

#### Examples

- Matplotlib is a common choice or visualization. In Jupyter, the magic %matplotlib allows the resulting gures to be displayed in the notebook: %matplotlib inline produces static images embedded in the notebook, and %matplotlib notebook produces interactive images (with zooming, panning, etc.).
- The %run magic allows running external scripts (and other notebooks), captures output and displays it in the notebook, e.g., %run my\_script.py. The %run magic is one answer to "how do I import one notebook into another?"
- The %time magic times the execution o the Python expression ollowing it, e.g., %time sum(range(1000)).
- The %timeit magic is similar to %time, but it runs the expression multiple times and reports the average execution time.
- The %reset magic deletes all user-dened variables along with input and output. Magics oten have "ags," ollowing the Unix command pattern. For example, %reset -s is a sot reset and only removes user-dened variables. These commands can be useul to avoid problems with out-o-order execution problems.
- The %debug magic is used ater code has stopped due to an exception (i.e., "the program has crashed"). Enter the %debug magic immediately ater the crash, and you will be placed into the environment that caused the problem. From there you can explore variables and nd the cause o the problem.

A good example o a magic operating on the entire contents o cell is the %%HTML magic, orcing the cell to be interpreted as HTML and rendered appropriately. You can also use magics to call other languages while running the IPython kernel. For example, you can run R code rom within an IPython notebook by using the %%R magic.

## ![](_page_44_Picture_13.jpeg)

#### Pro Tip

In the IPython kernel you can also use the %shell magic. This is oten abbreviated as ! and can run and return results rom the shell/terminal. In IPython, you can also mix magics with regular Python code. For example, files = ! ls will use the ls (list les) command in the terminal, return the list, and set the Python variable files to that list.

#### 5.3.4 Notebooks under version control

Keeping notebooks under version control is a great way to not only keep track o changes to your content, but also or sharing it. In a course where multiple people are contributing to the development o notebooks or the course, using version control in conjunction with a platorm like Git Hub, allows authorship to be tracked and provides communication tools or reviewing new contributions or outlining requested development or a new assignment, activity, etc. Another advantage o using version control is that some services will provide rendered views o notebooks that you have made public. Git Hub shows a rendered version o the notebook, rather than the ASCII text that a notebook is comprised o. Some pitalls with La TeX rendering may occur, as platorms do not always render the notebooks the same as they would appear in an active Jupyter interace.

We should mention a ew caveats to keeping notebooks under version control. The code output, including images, is stored in the repository, unless you clear the output beore committing changes. This can make reviewing changes difcult, as changes in output will be detected even when nothing has actually changed content-wise. The tracked notebooks also can become large i output is tracked. Even when clearing the output, reviewing changes can be awkward due to the ormat o the notebook (notebooks are plain-text les and the le ormat is represented as JSON). The community is actively developing tools to make it easier to use version control with Jupyter notebooks; one such tool is nbdime (see box).

## ![](_page_45_Picture_6.jpeg)

nbdime nbdime.readthedocs.io/

nbdime includes a set o tools or reviewing the changes ("dis") and merging changes in Jupyter notebooks. You can compare versions o a notebook using the terminal, view the changes richly rendered on a browser, and merge in various ways. Because nbdime understands the structure o notebook documents, it can make smart "difng and merging" decisions.

Another option to improve your version-control experience is to export a Jupyter notebook to a markdown document, or example using the jupytext tool. Then you can review dis in the usual way or plain-text les.

#### 5.3.5 Testing notebooks

Beore distributing notebooks, and in particular i you are working with multiple contributors to the course material, testing the notebooks beore they are distributed to students or used in a live demo can help mitigate unexpected bugs. At a minimum, you can test that the notebook executes cleanly rom top to bottom by restarting the kernel and running all cells rom top to bottom. This can be done rom the menu (Restart + Run all).

Though it requires a bit more setup, tests can be run automatically using a continuous integration service, such as TravisCI (https://travis-ci.org). This will require executing the entire notebook via the command line, or example jupyter nbconvert --Execute Preprocessor.enabled=True --to=html my\_notebook.ipynb will execute the notebook (same as pressing "Restart + Run All") and then convert it to HTML. These services can be connected to Git Hub so that any time that the notebooks are changed, the tests are run automatically. Simpliying this process is an area that is under development in the open source community. The package https://github.com/opengeophysics/testipynb provides an easy way to test notebooks.

#### 5.3.6 Essential Python libraries

The purpose o this section is to introduce some o the most widely used packages within the Python ecosystem. As mentioned beore, over 100 kernels enable dierent programming languages in Jupyter. But Python is a common choice in many disciplines, due to its large open-source community which develops and maintains an ecosystem o over 150,000 sotware packages.

The core Python library (https://docs.python.org) contains basic data types such as lists and dictionaries, as well as core unctionality such as arithmetic operators and simple le parsers. Most tasks can be achieved with core Python. They are oten made easier, however, with higher-level libraries. This particularly applies or scientic computing with Python. Among the vast number o packages in the Python ecosystem, Num Py, Scipy, Matplotlib and Pandas are among the most commonly used. A good resource or getting amiliar with these libraries is the Scipy Lecture Notes https://scipy-lectures.org/.

- Numpy (http://www.numpy.org/) is a undamental library or numerical and scientic computing with Python. It contains data structures or numerical arrays, tools or linear algebra, random number capabilities, and much more.
- Sci Py (https://docs.scipy.org/) oers a varied set o unctions or scientic computing, such as optimization, interpolation, statistics and signal processing. It also includes undamental constants rom many disciplines such as the speed o light as well as data structures or sparse matrices.
- Matplotlib (https://matplotlib.org/) is the core plotting library or Python and can be used inline in the notebook with the %matplotlib notebook or %matplotlib inline cell magics.
- Pandas (https://pandas.pydata.org/) provides resources or data analysis and a exible data structures or labeled tabular data.

#### 5.3.7 Advanced topic: extensions

There are many community contributed extensions that add unctionality to Jupyter notebooks. Extensions vary rom displaying an automated table o contents or a notebook, or prettiy code, or hiding/showing solution cells. Here is the link or how to install and enable extensions: https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/install.html

Here is a list o a collection o extensions that are bundled together: https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/nbextensions.html

Creating custom extensions is a way to extend or customize Jupyter to add a capability that is not currently available with current extensions or out o the box. These extensions may be targeted or a specic kernel. Here are instructions or how to create and install custom extensions: https://jupyter-notebook.readthedocs.io/en/stable/extending/rontend\_extensions.html

Figure X shows shows how Google Collaboratory, one o many tools to interact with Jupyter notebooks, leverages the power o Jupyter extensions or custom interaction and presentation.

The set o extensions or Jupyter is constantly evolving. Educators are exploring new and interesting methods o using notebooks in pedagogy. While the list o current extensions is ar too long to list, you can interactively experience some o the most useul extensions through this live Binder notebook (Binder is described in detail in the ollowing chapter). This live notebook demonstrates the ollowing:

- Turning on line numbers in code cells (makes it easier to reer to a line o code)
- Code olding extension (hide code blocks to help ocus attention)
- Locked and rozen cells extension (prevent changes to cells)
- An extension or a better user interace or error messages
- A "turtle" extension (draws in a canvas in the notebook)
- Block-based programming extension

The block-based programming extension (called Jigsaw) allows users to program using drag-and-drop blocks o code that can be integrated with other cells in a Jupyter Notebook (see gure). The advantages (and disadvantages) o blocked-based languages are active research topics in computer education research (see, or example, Mark Guzdial's excellent Computing Education Research Blog, specically those posts on block-based languages).

$$\begin{bmatrix} 1. & 1. & 1. \\ 1. & 1. & 1. \end{bmatrix}$$
+ $\begin{bmatrix} 1. & 2. & 3. \\ 4. & 5. & 6. \end{bmatrix}$ = $\begin{bmatrix} 2. & 3. & 4. \\ 5. & 6. & 7. \end{bmatrix}$ 

Figure 5.4: Google Collaboratory uses Jupyter extensions to customize Jupyter or their users. The run/play icon to the let o the code cell is created using extensions. This is not present in the standard Jupyter sotware. Tensor Flow is a library or creating Machine Learning experiments in Python.

## ![](_page_47_Figure_7.jpeg)

Figure 5.5: Example o incorporating Jigsaw, a block-based extension, in a Jupyter Notebook. The extension allows the user to assemble code blocks that can then be translated into Python or Java, and executed.

## 5.4. TIPS AND TRICKS 49

# 5.4 Tips and tricks

#### 5.4.1 Reminders

I you are using a single notebook as a standalone exercise in a traditional class (i.e., this is the only computational component o your class), then it is helpul to have a ew cells at the top o that notebook that reviews how to navigate through the notebook and how to insert cells, etc.

#### 5.4.2 Feedback

How do we get eedback rom students in an interactive session to see i students have completed an exercise?

A low tech solution is to give students sticky notes o dierent colors, one meaning "nished" and one meaning "need help", that they can stick on the back o their computers. The instructor can then quickly look up to take a survey o the state o the class and decide how to proceed.

Projecting Slack or a similar chat group on a screen and having student copy-paste solutions (provided they are short unctions) is a nice way to let everyone in the class see one another's solutions. A positive aspect o having multiple student solutions projected is that it can show the variety o ways to solve a problem. This gives an opportunity to talk about the readability o solutions and their efciency. A downside is that in a large class, the sheer volume o posts can make it overwhelming. Instead polling can be used to aggregate student answers and provide some orm o eedback to the instructor. Nbgrader or travis-CI can also be options here, requiring students to submit completed code where it is assessed automatically. These will however require more setup and can take some time to complete.

#### 5.4.3 Explaining each cell

Consider moving the comments or a code block into a markdown cell either directly above or below the code cell. Comments in a markdown cell oten read much better and give you more exibility in discussing or describing the code. However, short comments in a block o code can still be useul.

#### 5.4.4 How to structure code cells

How much code should you put in a cell? You will develop your own style o writing noteooks with experience. Typically, you will want to keep the number o lines low so that it is easy to ollow, and you can have useul comments above the cell. However, we recommend putting code that "goes together as a meaningul unit" into a single cell. For example, i you have lines o code that are highly dependent on each other, then you might want to put them together. As an example, consider two lines o code: one that opens a le, and the second that reads the data rom the le. It is probably a good idea to put those into the same cell so that they are always executed together. Otherwise, the student may encounter errors i they execute cells independently a second time (e.g., there are no more data).

Specically, messing up the dependencies between cells is where most o the conusion using notebooks comes rom with new users. For example, i you change a variable's name (without restarting the notebook), then the ollowing code cells may continue to use the old variable's name (and value). Later, when running the notebook again, the notebook may ail in unexpected ways because the old variable no longer exists. This is sometimes reerred to as "the hidden state problem." This is an open research problem, and researchers are exploring various possible solutions. For example, trying searching the internet or "jupyter dependency graph" or "jupyter dataow notebook."

## ![](_page_48_Picture_13.jpeg)

## Pro Tip

You can easily split a cell into two parts at the cursor using the keystroke CONTROL + SHIFT + -. You can also merge multiple cells with SHIFT + m. Both o these are also available rom the menu under Edit.

On the other hand, it is oten a useul idea to separate lines o code where you want to provide the student a place to interactively add cells, and examine the state at that particular point in the process. Asking probing questions in a Socratic method is a very useul technique or engaging the reader and encouraging them to become more than a reader. Students do not naturally know to insert cells and explore items in a notebook. You will need to explicitly teach this skill. In act, teaching students how to eectively weave code into their own notebook stories is an important component o teaching with notebooks.

#### 5.4.5 Custom styling

New notebook creators oten try to centrally manage the ormatting o headings, equations, and other textual items. For example, rather than using a standard markdown heading, a creator may over-design the headings by using HTML styles. This may create two problems:

- 1. The rendering o the notebook markdown may change and your ormatted HTML header may not maintain the same look over time.
- 2. Headers created using markdown can be used by notebook tools, such as automatically creating a Table o Contents.

Our recommendation is to resist the desire to customize the styling and simply use the deault representations. I you want to do customization (or example i you want to color certain cells) you can use CSS.

### 5.4.6 Length o notebooks

Notebook authors sometimes make the notebooks very long with many topics and sections. Notebook sections and cells are currently not easily reused in a copy/paste sense or mixing intra-notebook content. Until this unctionality is available, we recommend that authors make short, sel-contained notebooks around short topics. This allows other notebooks authors to mix and match notebooks to create curriculum.

### 5.5 Gotchas

# 5.5.1 Programming language ̸= Jupyter

Teaching a class entirely with Jupyter can give the sense to students that this is the way all computational exploration is done. In particular, students can be conused into thinking that programming requires the notebook, instead o understanding that a notebook is just one way to interact with a particular language. This point should be made clear periodically. A good way to reinorce this is to show how to take a unction that has been developed and debugged in a notebook and cut-paste it into a script (such as a le ending in .py or Python) and then import it into the notebook to regain that unctionality. Also, the Integrated Development Environment (IDE), Spyder, has a plugin (https://github.com/spyder-ide/spyder-notebook) that allows notebooks to be displayed alongside Python scripts and a python terminal which can be useul or showing this dichotomy.

#### 5.5.2 Restart, restart, restart…

Oten, students may need to stop a computation, and this can be accomplished by pressing the "Interrupt" button in the toolbar. However, students should also be made aware o how to restart the kernel in a notebook, and what this means. There are several instances when students might need to do this. Sometimes students write code that can go into an innite loop. The visual cues that notebooks give in this case are subtle, and students may not realize this and don't understand why the notebook is non-responsive. In live-coding situations, it can be useul to demonstrate this to students and show them how to restart the kernel and carry on.

## 5.5. GOTCHAS 51

## ![](_page_50_Figure_1.jpeg)

Figure 5.6: Jupyter notebook displayed in a window pane inside Spyder.

A second instance o where restarting a kernel might be needed is due to how the notebook stores the state o the computation. We like to think that, since the notebook is laid out in a linear ashion, that the state will always reect what would happen i the notebook was run rom the start up to that point. However, it is common to work in a notebook out o order, or instance i students ask a question about some previous example. I the variable has been changed in subsequent cells, then its value might not reect what you expect when you rerun a cell earlier in the notebook. Restarting the kernel is sometimes the only solution.

#### 5.5.3 Notebook hygiene

Many gotchas can be mitigated by developing notebooks that will be robust to incremental and non-linear execution. The main principle is to minimize side-eects o executing a cell and maniests itsel somewhat dierently in dierent languages; our suggestions here will be relevant to Python and may need to be adapted or other languages. Notebooks should generally be able to execute sequentially, such as via "restart kernel and run all cells". (An exception is when a notebook is intentionally incomplete or the purpose o live coding or student exercises, see nbgrader or the exercise estnations or more elegant ways to handle this.) Variable mutation is the most common way in which a notebook may malunction when executing cells in a non-linear way (e.g., in response to student questions or when comparing and contrasting dierent methodologies). Sometimes this mutation is incidental, through dummy variables that were not meant to have signicance outside the scope o the cell in which they are used. Their scope can be limited by placing them in a unction, even i that unction is only called once. Redenition o unctions can oten be avoided by parameterizing the desired unctionality as would typically be done i designing a library (though this may be a distracting sotware design or novice programmers). Function denitions should have little or no dependency on variables rom their enclosing scope. When modiying cells or demos and ormative assessments during class, it is useul to either copy the cell or modiy/execute such that a conorming implementation remains present when moving on to other cells where it may be used. Additionally, you can minimize these issues by grouping code in a single cell that should always be executed sequentially, because code within a cell will always be sequential.

# Chapter 6

# Getting your class going with Jupyter

You have several options on how to get Jupyter notebooks to your students. You can ask students to install Jupyter on their own computers, install Jupyter on lab computers or students to use, or run Jupyter on a remote server that your students access on the internet.

### 6.1 Local installation on students' or lab computers

"Local installation" means that each computer is running the sotware that includes the Jupyter Notebook. Typically, this requires installing a distribution that includes Jupyter, Python, and possibly other language kernels.

A popular sotware distribution that includes Jupyter is Anaconda, which is easy to install on Windows, Mac, and Linux. Because it can install everything with user level permissions, it does not require the user to have administrator (or root) access to the computer. Anaconda includes over 1500 sotware packages providing most, i not all, needed sotware or learners. Jupyter notebooks can be opened by launching Jupyter or by opening them through the Spyder IDE. These attributes make it attractive or both personal use and or installation on institution controlled computers.

## ![](_page_52_Picture_6.jpeg)

#### What is Anaconda?

You will see the Anaconda distribution recommended by many educators and course authors. Anaconda is a package manager, an environment manager, a Python distribution, a collection o over 1,500+ open source packages, including Jupyter. It is ree to download, open source, and easy to install, on any computer system (Windows, Mac OS X or Linux). It also includes the conda packaging utility to update and install new packages o the Python and R ecosystems, and to manage computational environments. According to the company's webpage, Anaconda has more than 6 million users; see: What is Anaconda?. The Sotware Carpentry project provides installation instructions or Anaconda, with videos.

Two other easily installable sotware packages that can run Jupyter notebooks are nteract and Hydrogen. nteract is installed by downloading a binary installer rom their website and double-clicking the installation le. nteract's simple user interace make it an excellent choice or students new to computer programming. Once nteract is installed, any Jupyter notebook on a student's local system with a graphical interace can be double-clicked and it will open within nteract. Hydrogen is a very popular plugin or the open source Atom editor; it's currently used by over 700,000 people. Hydrogen lets a user edit, display, and execute a notebook within the Atom editor.

You can ask students to install Jupyter on their own computer or make it possible or them to use it on lab computers. These can also be combined: give students the instructions to install it on their own, but also tell them that it's available in the lab i they can't get it to work on their laptop. This way you don't need a large enough computer lab or everyone, and don't need to worry that not everyone can get it to work on their own.

#### 6.1.1 Jupyter on student-owned computers

The benets o installation on student-owned computers include:

- Once students have the sotware on their computers, they always have access to it; they can work anywhere, and they can use it or internships, jobs, and other non-school activities.
- It is easy or them to install additional packages later.
- Students learn to install and set up Jupyter, and sotware in general, which is a skill they are likely to need.
- The total computing power or the class scales with the number o students, as long as each student has enough CPU power and memory to support the intended applications.
- You can adopt Jupyter without support or resources rom your institution.
- Students learn to use Jupyter on their preerred OS, e.g. Linux, Mac, or Windows, which means they are already amiliar with the basic idioms o their OS.

#### Drawbacks include:

- This approach is only possible i every student owns a computer with enough capacity.
- Students with less powerul computers might be at an unair disadvantage.
- Although installation is generally easy, it still takes time. The time you spend at the beginning o a class can be worthwhile or a semester-long course that uses Jupyter throughout, but it is a barrier to using Jupyter or a single module or one-o assignment in a course about something else.
- Also, the amount o time spent debugging esoteric problems scales with the number o students: a class o 25 students is bound to have a ew people with 32-bit processors, incompatible libraries, out-o-date operating systems, over-zealous virus checkers, etc., and a class with 100 students will have our times as many. One work-around is to have students work in pairs: the probability that more than hal o the students cannot get it working is reduced.
- Discrepancies in installed library versions can cause issues or students and may lead to dierent behaviors when students run code.

Although Jupyter is cross-platorm and ideally behaves the same on Windows, Mac, or Linux, and distributions such as Anaconda also behave very similarly on all platorms, the instructions or installing and launching it are slightly dierent on each operating system, so ne-grained instructions such as "double click here" or "type this command" need dierent versions or Linux, Mac, and Windows users, which can be challenging when the instructor presenting the material has only one platorm at their disposal. It is worth developing detailed instructions that the students can go through at their own pace, rather than relying only on a live demo in class that will only apply to a raction o the students.

#### 6.1.2 Jupyter on lab computers

Using lab computers instead o student-owned computers has the benets o uniormity and improved equity. Each student will have exactly the same setup, and the instructions will work the same or everyone. This reduces the amount o individual tech support required and guarantees that all students have access to enough computational power.

However, this deployment has some disadvantages:

- Depending on how much control you have o the computer lab, you might need institutional permission and support.
- Students might be limited to working on assignments only when they are on campus and when computer labs are open, which might be an unair disadvantage or non-resident students or those with ull time jobs.

- It might be difcult to install additional packages as the need arises, and students might not be allowed to install packages they need or projects.
- Even in a computer lab, it can be difcult to maintain consistency across machines, and to keep all installations unctional.

# 6.2 Jupyter on remote servers

Even when Jupyter runs locally, it runs as a web application; that is, it runs in a browser connected to a server. In a local installation, the browser and the server run on the same machine. But it is also possible to run the server remotely.

In that case, students don't have to install anything; they only have to run a browser and load a URL.

There are several ways to run Jupyter on a remote server:

- 1. You can run Jupyter on a server owned by you or your institution.
- 2. You can run Jupyter in a temporary environment running in the cloud.
- 3. You can run Jupyter in a persistent environment running in the cloud.

Running Jupyter remotely has many o the advantages o running in a lab: you can provide a consistent environment and guarantee that all students have access to sufcient computation resources. And it mitigates one o the drawbacks o a lab installation, since students have access to cloud resources rom anywhere, not just on campus.

Working in the cloud also means that students do not have to manage their own backups o a laptop hard drive. Although a student could still inadvertently overwrite, delete, or destroy the contents o a notebook stored in the cloud, they will not lose their entire work i a laptop is damaged or lost.

For simple, one-o uses o Jupyter (say, or a single assignment or in-class activity) the cloud option is very attractive as it requires little in-class time to discuss installation o additional sotware.

#### 6.2.1 Running in a temporary environment in the cloud

The easiest option or running Jupyter in the cloud is to use a cloud service that provides temporary environments. Some o these services are ree o cost, and you can use them without installing anything.

These environments are well-suited or short examples in classes that do not use Jupyter extensively. Students can open a notebook and start running with the push o a button.

However, there are some limitations to these services:

- I your notebooks depend on particular packages, or particular versions o packages, it can be difcult to satisy these requirements.
- These services run notebooks in a temporary environment that disappears i it is let idle. So they might not be suitable or managing student work.
- Some o these services do not guarantee a level o service and may not be as reliable as you need or a class or workshop.

## ![](_page_54_Picture_21.jpeg)

#### Binder mybinder.org

Binder is an open-source service provided by Project Jupyter. It allows the owner o a set o notebooks residing in a public repository to pre-build an image in the Binder service, and get a shareable link that any visitor can use to obtain a working instance o Jupyter Hub, pre-loaded with the notebooks in the repository. The session is temporary (any changes the user makes will be deleted when closing the tab or window), but it's ully interactive. Binder is currently one o the avorite services or running one-o workshops or tutorials.

#### 6.2.2 Running on servers you control

I you have access to a server or cluster with enough computing power to support your class—including CPU and especially memory—you can provide a Jupyter as a service using Jupyter Hub.

Jupyter Hub is open-source sotware that provides a cloud-based Jupyter application or each user in a group. Each user has their own account and home directory on the server. The Hub, Jupyter Hub's central system, allows authenticating users and starting individual Jupyter notebook servers. Programs that start notebook servers can use a variety o technical solutions. For more details, see https://github.com/jupyterhub/jupyterhub/wiki/Spawners

Once the Hub starts a user's notebook server, the Jupyter Notebook running in the cloud behaves just like Jupyter does when installed on an individual's computer, but Jupyter Hub will be running notebooks and storing les on a remote cloud computer. Students can download notebooks stored in the cloud to their local computer i they wish to work with a local installation as well. Additionally, students can upload notebooks (and other les) rom their local computer to the cloud.

While anyone can run a Jupyter Hub server on their own Linux or Mac computer, installing and conguring Jupyter-Hub requires sophisticated knowledge spanning the Linux/Unix operating system, system administration, and networking. For more inormation, see:

- https://github.com/jupyterhub/jupyterhub(the basic Jupyter Hub project, which can be installed on a baremetal server, a virtual private server (VPS), or a commercial cloud cluster)
- https://github.com/jupyterhub/the-littlest-jupyterhub(a simplied installation o Jupyter Hub on a remote server or VPS)
- https://github.com/jupyterhub/zero-to-jupyterhub-k8s(a step-by-step guide to install Jupyter Hub on a Kubernetes cloud system)

Providing a Jupyter Hub service oers several benets. First, students get up and running immediately—they spend no time installing sotware. They navigate to a web URL, log in to Jupyter Hub, and begin using Jupyter. This ability to quickly log in and begin computing is a powerul way to get students to engage with the lesson, builds condence, and avoids the sometimes-stressul experience o installing sotware on the student's computer.

However, running Jupyter Hub on your own server has drawbacks:

- Getting started is not easy; most instructors would require (or at least benet rom) institutional support that may not be available.
- It can be difcult to scale: i the number o students increases, you might need more computing power. And the load students generate can be uneven; or example, i everyone runs a computationally-intensive example at the same time, your server might not be able to handle it.
- This option can be expensive, unless you already have servers with sufcient power.

#### 6.2.3 Running Jupyter in the cloud

I you or your institution don't own computing hardware with the power to support your class, you can run Jupyter-Hub on virtual servers provided by cloud services like AWS and Microsot Azure. In those environment, you can install Jupyter Hub as described in the previous section

Commercial oerings also exist to use Jupyter in the cloud, some o which provide ree trials or a "reemium" pricing model. They include:

- Co Calc (previously Sage Math Cloud) (https://cocalc.com) is an online open source computing environment with rst class support or Jupyter notebooks supported by Sage Math, Inc. It is one o the ew services that allows multiple users to edit a Jupyter notebook simultaneously. It also allows the notebook user to cycle through the revision history o a notebook and provides a number o popular kernels by deault. The service includes the ability to share les with project collaborators. It is ree to use and greater computational resources can be obtained by paying the monthly, yearly, or course based subscription ees. Instructors can pay or resources or an entire class or ask students to pay and subscribe or a semester. Instructors can make use o the course management system or assignment distribution, collection, grading, and more. The ree version limits access to the internet to prevent abuse, eectively blocking use o standard package managers. While an instructor could work around this limitation by uploading les to the service or requesting the company to install sotware, this is likley onerous or many users. Paid versions lit this limitation and allow use o standard package managers (e.g. pip, conda, R, Julia, etc).

- Gryd (https://gryd.us) is another subscription service with a ree tier. It includes course-management eatures, like a way to create a course, invite students, and deploy auto-graded assignments.
- Hub Hero (https://hubhero.net) provides proessionally congured Jupyter Hub servers or teachers. For courses o up to about 30 students they oer the community install which gets you your own Jupyter Hub on your own hardware or a cloud provider o your choice. For larger courses or ully managed deployments hosted solutions are available as well. Hub Hero is owned by Tim Head a project lead or https://mybinder.organd contributor to Jupyter Hub.
- Kaggle Kernels (https://kaggle.com/kernels) are ree hosted Python and R notebooks with access to substantial computational resources (quad-core, 16GB RAM, GPU, Internet connected, up to 6h runtime per session). All notebooks have also seamless access to datasets hosted on Kaggle Datasets. Instructors can use one o the thousands o datasets available on Kaggle Datasets (perect or implementing the The world is your dataset pedagogical pattern) or upload their own data (up to 10GB per dataset). Kaggle can also help implementing the There can be only one pattern with In-class competitions a eature that allows instructors to easily set up competitions with automatic leaderboards. All o the work students do on Kaggle is saved and available to them beyond the duration o the course/workshop. Additional sotware dependencies can be installed within notebooks via !pip or included in the common environment by sending a Pull Request to Kaggle Dockerle.
- codio (https://codio.com/eatures/ide)
- Microsot Azure notebooks (https://notebooks.azure.com/ )
- Amazon Sagemaker (https://docs.aws.amazon.com/sagemaker/latest/dg/ex1-prepare.html)
- Gradient by Paperspace (https://www.paperspace.com/gradient)
- Google Colaboratory (https://colab.research.google.com/ )

The biggest advantage o these services is that they require no installation and minimal setup by instructors, and some o them provide eatures that integrate with learning management systems. However, instructors generally have to create student accounts and set up student environments.

These services are highly scalable; that is, they can handle large numbers o students and uneven loads. However, they are not inallible; they might require some tending to make sure students have access to enough resources.

The biggest drawback o these services is that they can be expensive. Some charge on a per-student basis, with limits on computation and memory use. Some charge on the basis o actual use, which can be unpredictable (and might require instructors to enorce limits on student activities).

#### Other drawbacks include:

- It may be difcult or impossible to install packages you need, or particular versions o packages.
- Some o these services impose limits on what students can do; or example, they might have limited ability to access external services.
- Many o these services are relatively new, and they sometimes expose instructors and students to rough edges.
- Students generally lose access to their accounts when the class ends (or a limited time ater).
- There may be privacy concerns with sharing student inormation on commercial servers. Some institutions have agreements with one or more o these providers that address privacy.

# 6.3 Distribution and collection o materials

You may want to distribute course materials to and collect them rom students. A variety o options are available. Some important things to consider:

- Do you want to share your notebooks publicly, or do they require privacy?
- Can the notebooks that the students create or edit be public? Or do they require privacy?
- How do you plan to assess collected notebooks?
- Do you need integration with your LMS?
- Do you need integration with a le-sharing system?
- Do you want to distribute with the cell output showing?
- Do students need sotware that is not easily available on their own (or laboratory) computers?

Jupyter notebooks are plain text computer les, so you can distribute them to students and collect them using any system that handles text les, including Git Hub, Google Drive, and (as a last resort) email attachment.

#### 6.3.1 Learning management systems

Many instructors use a Learning Management System (LMS) to communicate with students. These tools oer private le sharing and assignments that connect to the students' institutional computing accounts and they can be used to distribute and collect notebooks as text les. However, most LMS tools are not yet notebook-aware, so they don't render notebooks or make it easy or instructors to comment on or grade them.

Some tools and workows are being actively developed to connect the Jupyter ecosystem to the LMS ecosystem using the Learning Tools Interoperability (LTI) standard. By the time you read this, you might nd that the options have improved.

#### 6.3.2 Web hosting

Notebooks can be publicly hosted on any website, so students can download the les by clicking on a link. Most webhosting sotware is not notebook-aware, but you can use nbviewer to share public notebooks, rendered as a static web page.

## ![](_page_57_Picture_17.jpeg)

nbviewer nbviewer.jupyter.org nbviewer is a web service provided by Project Jupyter. You can enter the URL o any publicly hosted notebook, and get a web page with the content o the notebook ully rendered. Some browser extensions and add-ons let you open a notebook in nbviewer with a button click. See: Open in nbviewer.

#### 6.3.3 Git Hub

One o the popular tools or distributing and collecting notebooks is Git Hub, a hosting and collaboration platorm or sotware. Git Hub is based on git, a version-control system. Files under version control are oten hosted on services like Git Hub, Git Lab, or Bitbucket, all o which are notebook-aware. For example, when you view a notebook on Git Hub, you see a rendered notebook that includes ormatted text, typeset mathematics, code highlighting, and the output o the code, including gures.

Git Hub Pages (and other similar services) can also be used to host rendered notebooks, and continuous integration services can build the web pages rom the notebooks and then display the content. See: Jupyter Book and use o doctr to do this.

Educators at academic institutions can use Git Hub Classroom, which allows instructors to set up assignments or a class. Students click on a link or an assignment and a copy o the assignment repository is created and initialized with the assignment content, which can be a notebook. Each student's repository can be made private, with access only granted or the student and instructor. This can be an efcient way to distribute assignments to a large class.

A drawback o git is that it is hard to use. It might be worth spending time in your class to teach git, i it is valuable or students to learn about version control. But i this is not one o the learning goals or your class, you can minimize the students' exposure to git using graphical interaces like Git Hub Desktop and git or Windows.

The deault git tools or comparing les and merging changes do not work well with Jupyter notebooks. However, some specialized tools can help with these tasks (see Notebooks Under Version Control).

#### 6.3.4 Jupyter Hub

I your students are using Jupyter Hub, you can place notebooks and any related les directly into the students' directories manually or via a script. I nbgrader is available on your Jupyter Hub instance you can use it to collect and distribute notebooks (whether or not you choose to use nbgrader's assessment eatures). This allows you to develop the notebooks and incrementally make them visible to the students or them to "etch". They can then edit the notebooks or create new ones in the directory created in their storage space, and then publish their notebooks back to you or downloading, viewing, or assessing with the nbgrader tools (see the next section or details on this tool).

## ![](_page_58_Picture_7.jpeg)

#### nbgrader nbgrader is a tool or creating, handling, and automatically grading assignments based on Jupyter notebooks. It works as a Jupyter extension that the course creator installs on their computer. nbgrader is a exible project in the Jupyter ecosystem that allows the distribution and collection o materials. As its name implies, it also can grade assignments; it can be used in a distributed manner where each student is running Jupyter on their own computers, or in a centralized manner, or example, i the students each have an account on a Jupyter Hub installation. (More details in the Assessment section.) https://nbgrader.readthedocs.io

#### 6.3.5 Using an LMS and nbgrader together:

Integration o nbgrader with learning management systems is still primitive, but the ollowing is a strategy that works with current tools.

- 1. The instructor creates an assignment notebook using nbgrader, then distributes the assignment to students via an LMS.
- 2. Students complete the assignment and upload the solution to the LMS.
- 3. The instructor downloads the completed assignments as a zip le and extracts the students' solutions in a Jupyter environment.
- 4. Instructors and graders use nbgrader to grade the assignment and save the grades to a CSV le.
- 5. The CSV le is then uploaded to the LMS.

Some tools that make this workow easier include the Extractor plugin to the Zip Collect eature in nbgrader.

# 6.4 Assessing student learning with Jupyter notebooks

Many educators develop course-assessment activities as Jupyter notebooks. This includes exams, in-class activities, homework assignments, and projects.

Simple ways to handle the assessment o a notebook-based submission: have students either print them out, email them, submit them as a standard electronic document (say, into the LMS), or drop them into a shared older. At that point, the instructor can mark and grade them in a traditional manner, or example by writing comments on a printout or adding annotations to a PDF.

## ![](_page_59_Picture_3.jpeg)

#### Pro Tip

Printing out a notebook can sometimes result in wasted space on pages, especially or notebooks with many images or gures. Converting to PDF requires large/complex La TeX installations. Exporting to HTML and then printing oten gives a better result.

nbgrader allows code cells in a notebook to be marked to be auto-graded or manually graded. An instructor can then create an assignment that can be completely auto-graded, requiring little work ater the notebook has been created. This makes grading much easier and scales well with large class sizes. However, creating such an auto-graded notebook in nbgrader can be quite time-consuming. In addition, pedagogically a completely auto-graded notebook may have serious downsides. For example, studies suggest that students learn better when they can actively connect a topic to their own interests [CITATION NEEDED]. One method o encouraging this is to have a "reection" question on each submission. Such a reection question can encourage students to comment on the material in a personal way, but it cannot be auto-graded. Another downside is that simply autograding code with unit tests is unlikely to assess many o the learning objectives you might have or an assignment, e.g., ability to use specic sotware-design patterns. To address this, you can create manually graded cells or a portion o an assignment and provide written eedback to the student.

## ![](_page_59_Picture_7.jpeg)

#### Caution

At the time o this writing, nbgrader has some limitations that require careul use. For example, using it in a multi-class setting (say, on Jupyter Hub) requires that instructors coordinate the naming o assignments so that they do not collide.

nbgrader is a sophisticated tool that can be set up to allow multiple graders, teaching assistants, and more. For more inormation on using nbgrader, see https://github.com/jupyter/nbgrader.

Some third-party notebook-based assessment solutions do exist. For example Co Calc, Vocareum, and Gryd provide a cloud notebook platorm that can also grade assessments similar to or using nbgrader.

[TODO] \_For example, cocalc.com oers… [are there other third-party course management notebook-oriented solutions?] and Berkeley uses Data Hub or their large Data8 course. Vocareum (https://www.vocareum.com) TODO

# 6.5 How do you create Jupyter notebooks or reuse and sharing?

As you create notebooks or your lectures, computational essays, or homework assignments, you may wish to think about how to make it possible that they can be reused by yoursel and others.

First, you may want to make the materials openly accessible and ndable via the internet. This suggests avoiding keeping the notebooks behind a "walled garden," such as a Course Management System. That is, users may have access to some material, but be prevented rom seeing other materials. You will have to decide whether you want others to have ull access. For example, many teachers do not want students to be able to see notebooks that may have solutions, or hints o solutions and thereore limit their access.

To share your notebook with others you can submit it to https://www.engage-csedu.org/. This curated collection o open educational computing resources is maintained by the National Center or Women in Inormation Technology (NCWIT).

I you decide to make your notebooks reusable by others, make it clear under which license the materials can be used. For example, you can include a Creative Commons attribution and share-alike statement at the bottom o your notebook. Adding a license allows people to reuse your materials without asking or permission explicitly.

Git Hub may be the most common service to host and share notebooks, where they can be viewed (including rendering), downloaded, or orked by others. (Private repositories can also be used to limit visibility to colleagues, students, or other organizations.). Make sure to be aware o some o the pitalls o keeping notebooks version controlled however (see Notebooks Under Version Control or details).

Another potential issue with sharing deals with external les that you may want to include in your notebook. This is in contrast with content (say a plot) that can be directly created by the notebook's code. Possible content includes data, images and videos using code and embedding tags in markdown or HTML. The implication is that i you share your notebook you must include the external les along with the notebook. This can be done a number o ways including using a version control repository, a zip-le, or a le sharing service. Another external dependency issue with sharing notebooks involves sotware libraries. In this case you share a conguration le that a user can use to setup the same environment. Examples o these les include a conda env.yml, a pip requirements.txt, or dockerfile.

Because Jupyter notebooks embed the output o cells into the ipynb le itsel (e.g., images, videos, etc.), the les can grow large. To make it possible to display the cell output via the renderers on Github, Gitlab, or nbviewer, save the notebook ater it is executed and then upload to those services. I instead you want to reduce le size and provide the notebooks to someone with the code cell output cleared, choose this option in the notebook's dropdown interace. Then the user will need to execute the notebook themselves to see the output.

# 6.6 Jupyter: a 21st Century genre o Open Educational Resources and practices

Educators create teaching and learning materials. With the appearance o the internet, a community o educators began producing open access traditional teaching materials. In parallel, a community o sotware developers began creating open source sotware. Each community developed their own development patterns. In particular open source sotware communities gravitated to the bazaar style1 o distributed and collaborative work. Jupyter notebooks may be the rst time that these communities are merging. Jupyter notebook authors are applying the content creation patterns they use to the creation o open educational resources that teach computation or teach through computation.

Open Education encompasses a large community, with its own conerences and journals, with leaders and advocated practices. The most visible eorts are related to Open Educational Resources (OER): the creation and adoption o openly licensed learning materials. In 1994, Wayne Hodgins coined the term "learning object" and the idea spread that digital materials could be designed and made to be reused. This was ollowed by eorts to develop metadata standards, content exchanges, and so on (addressing the concern o how to nd the objects to reuse them). In 1998, David Wiley coined the term "open content" and spread the idea that principles o Free and Open Source Sotware (FOSS) could be applied to content on the World Wide Web (Open Content, 1998). The Creative Commons non-prot organization was ounded in 2001 to provide ready-made license agreements or sharing content and served a vital inrastructure role on the spread o OER. The Creative Commons licenses are now the most widely used licensing ramework or open education. The year 2001 also saw the launch o MIT Open Course Ware (OCW). MIT promised ree public access or non-commercial uses o their course materials. It was a unique commitment at an institutional level, strengthened by the MIT brand. Other universities joined the OCW movement: Rice with the Open Stax project (now ormerly Connexion), CMU with the Open Learning Initiative (OLI), Utah State University with the Center or Open and Sustainable Learning, and so on. Today, the Open Education Consortium has hundreds o members rom around the world. The recurrent topics in OER are: reducing costs or students buying textbooks, increasing access, and dealing with copyright and licenses.

In the last ew years, educators using Jupyter have been creating and sharing all kinds o educational materials in the orm o notebooks, typically under a Creative Commons Attribution license (CC-BY). In act, Jupyter is a new genre o OER. But in addition to creating open content, educators using Jupyter oten take active part in the Jupyter community and adopt the culture o open-source sotware. This is a culture with strong ethical commitments, related to reedom o access, transparency, and governance (Coleman, 2012). The content they create has the value o giving access (the

<sup>1</sup>The bazaar style is a method o collectively creating sotware that isn't top down directed like a traditional company hierarchy.

very denition o OER), under an open model. But open-source culture also promotes a culture o collaboration. In this regard, engaging in teaching with Jupyter opens new possibilities or educators to engage in open development and collaborate with others in producing lessons, tutorials, courses, and even books.

## ![](_page_61_Picture_3.jpeg)

#### Pro Tip

A way to share educational notebooks, gain eedback on them and receive credit or your work is to publish with the Journal o Open Source Education. This is a peer-reviewed journal aimed at educators developing OERs that use code to teach. In addition to receiving a publication advertising your work, the peer-review process will result in higher quality sotware, code, and educational material.

# Chapter 7

# Usage case studies

Contributors to this chapter: you may increase adoption by new users i you integrate inormation about some o the ollowing into your case:

- 1. Demonstrate that you can increase students' ability to:
 - 1. Engage material & participate in class
 - 2. Understand material and perorm well
 - 3. prep their or career
 - 4. Enjoy learning this way
- 2. describe:
 - 1. how it ts with how their students learn
 - 2. how it connects to how they teach
 - 3. the needed resources (support, hardware, etc.)
 - 4. the necessary logistics (e.g., how much time will it take? Be honest: time is a consideration, and an important reason that people do not adopt new practices, but is not a reason that they stopped using one)
 - 5. what Jupyter does in terms o promoting learning, instructor aordances

# 7.1 Jupyter notebooks in support o scaling or large enrollments

#### 7.1.1 Supporting large enrollment courses at UC Berkeley

The University o Caliornia at Berkeley started a pilot course titled "Foundations in Data Science" (also known as Data-8) or about 100 incoming undergraduate students in Fall 2015. Data-8, the astest growing course in Berkeley's history, is entirely Jupyter-based, allowing the program to scale the course to 1,400 students in 2018. This scale is made possible by Jupyter's shared computational environment. In particular, Jupyter allowed "browser-based computation, avoiding the need or students to install sotware, transer les, or update libraries" (see The Course o the Future and the Technology Behind It [https://data.berkeley.edu/news/courseuture]). Data-8 is powered by Jupyter Hub and all the course materials are published openly (http://data8.org).

#### 7.1.2 Large-scale adoption: Jupyter across Canada

Recognizing the importance o data science, computational research, and educational resources, the Pacic Institute or the Mathematical Sciences (PIMS), in partnership with Compute Canada and Cybera, have launched Jupyter-Hub platorms (under the project name Syzygy) to support researchers and educators across Canada. Syzygy (http: //syzygy.ca) provides access to cloud-hosted Jupyter resources using existing institutional credentials and encourages the development o computational and data science skills. It is currently accessible at 16 institutions across the country (Mc Master, Queen's, SFU, UAlberta, UBC, UCalgary, ULethbridge, UNew Brunswick, UOttawa, URegina, USask, UToronto, UVic, UWashington (US), UWaterloo, Yorku) and has been used by over 11,000 people at those institutions.

Syzygy is extensively used or teaching, but is also being used or research activities. One notable example is a scientic sotware seminar at the University o British Columbia, where graduate students and post-doctoral researchers meet to share and learn data science techniques with their peers. Initiatives are also underway, as part o syzygy, to deepen its relevance into research by providing seamless access to larger and more varied types o resources (GPUs, parallel machines, dierent language kernels etc.).

Callysto (https://callysto.ca/) is a related project, also launched by PIMS and Cybera, to bring Jupyter to students in Canadian middle and high schools (grades 5-12). Callysto ocuses on creating and curating open content (https: //github.com/callysto). This content orms the basis o project workshops, where teachers can work through the materials interactively, beore taking them back to their classrooms. The content links to a supporting Jupyter Hub installation (integrated with the authentication systems or the networks o school districts) allowing easy access to the materials and a Jupyter environment to learn and create in.

## – Ian Allison

#### 7.1.3 Quick switch: moving an existing course to Python and Jupyter (at the last minute)

For many years, our chemical engineering kinetics course had used sotware or dierential equation and nonlinear simultaneous equation solving to simulate reactors and solve design problems. The sotware, recommended and described by the textbook, was installed in the college's computer labs, but licenses or student-owned computers were expensive and it was only available or Windows. In Spring 2015, I was inormed my class now had 52 students, but the largest computer lab had room or only 40. As the semester progressed and we neared the chapters that required numerical simulation, I rewrote the examples using Python and Sci Py and created Jupyter notebooks, walking students through the steps involved in setting up and solving the problems. I ound Lorena Barba's open-source MOOC materials online, and adapted these or my "getting started" notebooks. I had students install Anaconda on their own computers, and got everyone up and running without any central inrastructure or support rom the college's IT sta. I ound the Jupyter Notebook ormat o including "lecture note" style commentary along with short, unintimidating, snippets o code, to be extremely eective. A couple o years later I passed on the course to a new instructor, who took my course materials, taught himsel some Python, and continued to use Jupyter notebooks or content delivery and assignments.

The rst year was a bit rough around the edges as I introduced it quite late in the semester. Still, it is clear that the approach resonated with students. An alumnus rom my 2016 course wrote, "I thought that your course was very successul, especially the use o Jupyter Notebook as a classroom and assignment tool. I still remember specic problems that we went over in class (e.g., the microuidic reactor array with heterogeneous catalysis), and I eel that the use o Python to solve problems throughout the course greatly beneted my understanding o undamental concepts. I went on to use Python [in the pharmaceutical industry], where I built tools or bioinormatics data analysis, mutation network proling or protein engineering experiments, and RNA structure prediction rom experimental data and molecular thermodynamics."

## – Richard West

# 7.2 The "CFD Python" story: guiding learners at their own pace

"CFD Python" is a collection o Jupyter notebooks based on a practical module that I began using in class in my Computational Fluid Dynamics (CFD) course at Boston University in 2009. The 5-week module develops worked examples that build on each other to incrementally guide the learner to create a program to solve the Navier-Stokes equations o uid mechanics, in 12 steps. In 2013, I was invited to teach a mini-course in the Latin-American School in High-Perormance Computing, in Argentina. The Jupyter notebooks platorm allowed me to create a guided narrative to support learners with dierent background experience and knowledge. For that event, we wrote notebooks based on the CFD course module, to use as instructional scaolding in the 2-ull-days o minicourse. Twenty students worked through the notebooks as sel-paced lessons, while I went rom desk to desk asking and answering questions. About our o the students completed all the lessons in the 2 days, a bulk o them achieved up to about Step 8, and a ew o them lagged behind in Steps 4 or 5 by the end o the course. For those who completed the ull module, they had achieved in 2 days what my regular students in the classroom normally took 5 weeks to do. Seeing that was an eye-opening moment: both the power o worked examples in code, and the ability to allow learners to ollow their own pace made a remarkable dierence in these learners.

REF — Barba, Lorena A., and Forsyth, Gilbert F. (2018). CFD Python: the 12 steps to Navier–Stokes equations. Journal o Open Source Education, 1(9), 21, https://doi.org/10.21105/jose.00021

Based on the experience developing the "CFD Python" learning module, we adopted this basic design pattern or creating lessons using computable content:

- 1. Break it down into small steps
- 2. Chunk small steps into bigger steps
- 3. Add narrative and connect
- 4. Link out to documentation
- 5. Interleave easy exercises
- 6. Spice with challenge questions/tasks
- 7. Publish openly online
- Lorena A. Barba

#### 7.3 Analyzing music with music21

I became interested in learning more about Python in 2013 ater reading a tutorial by Luciano Ramalho as he was writing Fluent Python. Since I tend to seek out projects that match my outside interests (music, art, and nature) I was looking or Python projects with music and came across Myke Cuthbert's music21 project. Music21, an open source music theory and analysis library maintained by Proessor Michael Cuthbert at MIT, provides a set o tools to answer questions about music quickly and simply. Users can create, analyze, and share music with just a ew lines o code. Myke's use o the notebook hooked me. Unlike many things that I had worked on beore, the notebooks made it easy to get started and to write small code snippets that did real work! The more I used the notebooks and showed them to people that I taught at Fab Lab San Diego, the more that I saw the power o the notebook to engage a user and empower them to explore and learn.

Music, a universal language, appeals to learners o all origins, ages, education levels, and interests. As a subject that casts a wide appeal, music oers the opportunity to engage and delight learners. It's an accessible subject that has a low barrier to entry or learners rom disciplines beyond computer science and engineering.

## – Carol Willing

#### Education benets

- lessons notebooks can be tailored to age appropriate content within music
- multisensory
- ability in K12 to align with the standards
- possibilities or bringing in multi-subject learning
 - writing
 - history
 - math
 - science
- accessibility through audio and braille

Misc quotes (perhaps pick a couple?):

"I think o music21 as being composed o two parts. The rst is inrastructure, routines or reading, writing, and manipulating musical scores, while the second consists o a higher-level analytical toolkit—generating a Roman numeral rom a chord and key, putting chords into normal orm, checking or parallel ths, identiying scales containing a given pitch or chord, and so on." —Bruce Tymoczko, Proessor o Music, Princeton

#### Inclusive

"It's not exclusive, but inclusive, which is the whole spirit o jazz." — Herbie Hancock

#### Education

"So, you can't stay in one place, no matter how comortable that place is. It's all about growing."—Mavis Staples

#### Universal

"Music in the soul can be heard by the universe."—Lao Tzu

#### Communication

Music is the greatest communication in the world. Even i people don't understand the language that you're singing in, they still know good music when they hear it."—Lou Rawls

"In the beginner's mind there are many possibilities. In the expert's mind there are ew." –Shunryu Suzuki

### 7.4 Interactivity in computer science (high school and middle school)

#### Who

High school and middle school students at Cal Poly SLO's EPIC program completed a two hour workshop on Interactivity in Computer Science. The workshop participants included dual language learners (English as a Second Language) and students who have had limited access to computers prior to the workshop.

#### Why

Providing early access to at-risk groups who may not see themselves as capable o learning to code or use computation

Illustrate that there are many skills beyond math and science that are needed to create sotware applications

#### What

Two hour workshop that maximizes "hands on" exploration with the goal o building an ongoing interest in computer science

- short lectures
 - interactive discussion LISTEN
 - hands on DO/APPLY This section is sel-paced to engage dierent learning styles and prior knowledge
 - recap DISCUSS
- 8 or so projects with achievements outlined
- modern curriculum including p5.js, jupyter, binder, deep learning and machine learning with Tensor Flow and Magenta (art and music)
- Goal is to empower students to understand that they CAN use CS to solve real world problems

#### Instructor Approach

- Start with high quality engaging content
- Sel contained notebooks
- Use widgets to add additional interactivity

### 7.5 Interactive geophysics with Jupyter

The Geo Sci.xyz project (https://geosci.xyz) is an eort to develop a community o scientists and educators around learning resources and sotware or the geosciences. The project includes multiple open-source textbooks, each which have associated Jupyter notebook "apps" that serve as interactive simulation engines or exploring concepts in geophysics. We have used these resources in an undergraduate course on applied geophysics at the University o British Columbia; this course is primarily taken by by geologists and engineers (non-geophysics majors). In 2017, we delivered a 2 day short course or proessionals, graduate students, and researchers in 26 dierent countries around the world (https://disc2017.geosci.xyz). In both o these courses, the goal is to provide learners with an overview o the various geophysical methods (e.g. magnetics, gravity, seismic, electromagnetics) and concepts governing the physics; we do not dive into details o the math nor do we expect students to program or write any lines o code. The role o Jupyter notebooks in these courses is to serve as a tool or visualizing and exploring the physics.

During a lecture, the notebooks as a presentation medium lend to a dynamic presentation style, where we as instructors can select model parameters based on student input. Concepts are reinorced as students then use these same notebooks in labs and assignments. We have ound that the notebook apps are most eective when students are rst asked to critically think about what they expect to see and then visualize the result. I the resultant image matches their expectation, then they understand the concept, and i not, it is an opportunity to learn and urther explore.

## – Lindsey Heagy

# 7.6 Investigating hurricanes

#### Who

Middle school and high school students visiting Columbia's School o Engineering and Applied Sciences on a eld trip

#### Why

Students oten come through looking to tour labs and experience some o the research that is being done at the school. Unortunately certain elds, in this case computational mathematics and hurricane research, do not lend themselves to these types o events.

#### What

Instead o a lab or lecture a computer lab was reserved or an hour and a Jupyter notebook used to walk students through some basic visualizations and data analysis encouraging students to change the code displayed to answer questions such as "Where did Hurricane Sandy go?" and "What storms occurred during 1981?". This includes a number o visualizations o hurricane tracks, coloring by strength o storms, and an analysis o average number o storms per year. Notebook is available at https://github.com/applied-math/demos.

## – Kyle T. Mandli

# 7.7 Riemann Problems and Jupyter Solutions

We rst envisioned this project as a teaching aid to interactively illustrate difcult concepts or a graduate course in numerical methods or conservation laws. These are physical laws in the orm o rst-order hyperbolic partial dierential equations that arise in wave propagation applications such as uid dynamics, trafc ow, water waves (like tsunamis), and electromagnetic waves among others. The Riemann problem corresponds to a conservation law with a piecewise constant initial condition such that the problem is relatively simple to solve, while still capturing the characteristic dynamics o the conservation law. Due to its discrete nature, its simplicity and its capability to encode the dynamics, the Riemann problem is the key ingredient in modern numerical methods or conservation laws.

## ![](_page_67_Figure_2.jpeg)

Figure 7.1: Notebook "app" or exploring the direct current resistivity experiment over a two layer earth (https://em.geosci.xyz/apps.html).

## ![](_page_68_Figure_2.jpeg)

Figure 7.2: Visualization rom the notebook at https://github.com/applied-math/demosdemonstrating the paths o Atlantic hurricane tracks rom 1950-2012 with coloring demonstrating category o storm.

## ![](_page_69_Figure_2.jpeg)

Figure 7.3: Visualization rom the acoustics equations chapter o the book at https://github.com/clawpack/riemann\_book It shows an interactive visualization o the solution to the Riemann problem or acoustics equations, where the initial condition emulates a shock tube.

The project naturally evolved into Jupyter notebooks with the idea o compiling an interactive book. Each chapter aims to solve the Riemann problem or a specic application such as acoustics, shallow-water equations, and Euler equations. We urther wanted to use our book to encourage the reading and publication o interactive notebooks. Thereore, we decided that our book should also have a printed and an HTML version in addition to notebooks available or downloading, to attract more readers and to encourage more authors and publishers to explore this interactive platorm.

As one would expect, several new problems arose regarding how to make a book that is somewhat compatible across all the dierent platorms in which we wanted to present the book, particularly since the notebooks make heavy use o interactive widgets and animations. With the help o our publisher (SIAM) and several developers working on Jupyter-based tools or publishing interactive books, we are close to nalizing the project. We are happy to say that this project promoted the development o some o these tools and that is encouraging our publisher to delve more into interactive book publication.

This book should be completed in the next ew months, and the current state can be viewed at http://www.clawpack.org/riemann\_book/index.html.

– David I. Ketcheson, Randall J. Le Veque, and Mauricio J. del Razo

# Chapter 8

# About the authors

#### 8.1 Project lead

#### Lorena A. Barba

- George Washington University
- labarba@email.gwu.edu
- @LorenaABarba

Lorena A. Barba is Associate Proessor o Mechanical and Aerospace Engineering at the George Washington University. She adopted Jupyter in 2013 and since then used it in every course she teaches. Her open course materials are well known and used by thousands o learners: CFD Python and Numerical MOOC are the best examples.

# 8.2 Authors at the sprint

#### Lecia J. Barker

- University o Colorado Boulder
- lecia.barker@colorado.edu
- @leciab

Lecia Barker is an Associate Proessor and Associate Chair o Undergraduate Studies in the Department o Inormation Science at the University o Colorado Boulder. She is also a Senior Research Scientist or the National Center or Women & IT. Her research group is studying the diusion and adoption o teaching practices in undergraduate computer science. Lecia holds a Ph. D. in Communication rom CU Boulder and an MBA in Marketing rom San Diego State University.

#### Douglas Blank

- Bryn Mawr College
- dblank@brynmawr.edu
- @dougblank

Douglas Blank is Associate Proessor in the Department o Computer Science at Bryn Mawr College, a small, allwomen's college outside o Philadelphia, PA, USA. He has a joint Ph. D. in Cognitive Science and Computer Science rom Indiana University, Bloomington. For over 20 years, Douglas has taught all levels o Computer Science. For the last 4 years, he has used Jupyter notebooks exclusively in the classroom. Douglas has published in the areas o Computer Science Education, Robotics, Articial Intelligence, and Deep Learning. He is on the advisory board o Engage-CSEdu.org, a joint project between Google and the National Center or Women and Inormation Technology (NCWIT). Douglas also writes text and code at his website douglasblank.com.

#### Jed Brown

- University o Colorado Boulder
- jed@jedbrown.org
- @ve9a2

Jed Brown is an Assistant Proessor o Computer Science at the University o Colorado Boulder. He has been teaching numerical and scientic computing courses using Jupyter Notebook and nbgrader or three years, and leads a research group that develops computational methods and community sotware or computational science.

#### Allen Downey

- Olin College
- downey@allendowney.com
- @Allen Downey

Allen Downey is a proessor o Computer Science at Olin College and the author o a series o open-source textbooks related to sotware and data science, including Think Python, Think Bayes, and Think Complexity, published by O'Reilly Media. These books, and the classes based on them, use Jupyter notebooks extensively. Pro Downey holds a Ph. D. in computer science rom U. C. Berkeley, and M. S. and B. S. degrees rom MIT.

#### Tim George

- Project Jupyter
- tgeorgeux@gmail.com

Timothy George is the Lead UI/UX Designer or Project Jupyter, ocusing primarily on Jupyter Lab. In addition to his ormal duties, Tim is also in working with Jupyter on design strategy, uture products, governance, diversity and inclusion. He studied HCI at UC Irvine's Donald Bren School o Inormatics and Computer Science where he received a Master's Degree.

#### Lindsey Heagy

- University o Caliornia Berkeley
- lindseyheagy@gmail.com
- @lindsey\_jh

Lindsey Heagy is a Postdoctoral Researcher at the University o Caliornia Berkeley working on Project Jupyter and Jupyter in the geosciences. She recently completed her PhD at the University o British Columbia in geophysics. She is a project leader o Geo Sci.xyz, an eort to build collaborative, interactive, web-based textbooks in the geosciences, and a core contributor to SimPEG, an open source ramework or geophysical simulation and inversions. The Geo Sci.xyz project relies heavily on Jupyter or making the content come to lie.

#### Kyle Mandli

- Columbia University
- kyle.mandli@columbia.edu

## 8.2. AUTHORS AT THE SPRINT 73

#### • @Kyle Mandli

Kyle Mandli is an Assistant Proessor in the Department o Applied Physics and Applied Mathematics at Columbia University. He has developed a set o openly available course notes centered around Jupyter notebooks and uses Jupyter or homework in conjunction with nbgrader. His other research interests include development o computational methods or coastal hazards such as storm surge and tsunamis.

#### Jason K. Moore

- University o Caliornia, Davis
- jkm@ucdavis.edu
- @moorepants

Jason K. Moore is an Assistant Teaching Proessor o Mechanical and Aerospace Engineering at the University o Caliornia, Davis. He currently teaches dynamics and mechanical design related courses. He utilizes Jupyter notebooks to teach modeling and simulation and is working on a textbook about Mechanical Vibrations. He is responsible or the Jupyter related eatures in the Libre Texts project and is also a core developer o the Sym Py and Py Dy projects which utilizes Jupyter or training workshops, e.g. Py Dy Tutorial and Sym Py Code Generation Tutorial. Jason has PhD, MSc, and BSc degrees in mechanical engineering rom UC Davis and Old Dominion University.

#### David Lippert

- Leidos

David Lippert is a sotware engineer at Leidos in Arlington, Virginia. He utilizes Jupyter notebooks primarily or exploratory data analysis and or training and evaluating machine learning algorithms. He has written Jupyter notebooks to create new Dr. Seuss sonnets and to evaluate i the Rotten Tomatoes Tomatometer can be trusted. He has a BA in computer science rom Middlebury College.

#### Kyle E. Niemeyer

- Oregon State University
- kyle.niemeyer@oregonstate.edu
- @kyleniemeyer

Kyle Niemeyer is an Assistant Proessor o Mechanical Engineering in the School o Mechanical, Industrial, and Manu acturing Engineering at Oregon State University. He teaches courses in numerical and analytical methods or solving dierential equations as well as gas dynamics, and recently developed a graduate course on sotware development or engineering research. His research group develops and applies methods or modeling combustion and chemically reacting uid ows. He is also on the steering committee o the Cantera open-source project or chemical kinetics, thermodynamics, and transport processes.

#### Ryan Watkins

- George Washington University
- rwatkins@gwu.edu
- @parsingscience

Ryan Watkins is a Proessor o Educational Technology at George Washington University in Washington DC. He leads the Human-Technology Collaboration (HTC) PhD program area, and he teaches courses in needs assessment, instructional design, and research methods. Ryan's research ocuses on how people and organizations dene and assess needs. He is co-host o Parsing Science, a podcast where researchers share the stories behind their science. He also developed the We Share Science platorm or sharing video abstracts o research.

#### Richard H. West

- Northeastern University
- R. West@northeastern.edu
- @richardhwest

Richard West is Associate Proessor o Chemical Engineering at Northeastern University in Boston. He leads a research group in computational modeling or complex reacting systems like combustion or catalysis. He is a core member o the Cantera open-source project. As well as in an elective on "computational modeling in chemical engineering", he has integrated Python and Jupyter into core classes on chemical kinetics and reactor design, at both the undergraduate and graduate levels. As part o his NSF CAREER award, he is developing modules to teach students to use Python and Sci Py to solve chemical engineering problems.

#### Elizabeth Wickes

- University o Illinois at Urbana-Champaign
- wickes1@illinois.edu
- @elliewix

Elizabeth Wickes is a Lecturer at the School o Inormation Sciences at the University o Illinois at Urbana-Champaign. She teaches oundational programming rom an inormation and data sciences perspective, as well as other coursework on open data and reproducibility. Her programming course lectures are written in Jupyter notebooks and the class is taught via live coding.

#### Carol Willing

- Cal Poly San Luis Obispo
- willingc@gmail.com
- @Willing Carol

Carol Willing is a Research Sotware Engineer at Cal Poly San Luis Obispo working ull-time on Project Jupyter. She is a Python Sotware Foundation Fellow and ormer Director; a Project Jupyter Steering Council member; and a core developer on CPython and Jupyter. Carol has an M. S. in Management rom MIT and a B. S. E. in Electrical Engineering rom Duke.

#### Michael Zingale

- Stony Brook University
- Michael. Zingale@stonybrook.edu
- @Michael\_Zingale

Michael Zingale is an Associate Proessor and computational astrophysicist at Stony Brook University. He has a PhD rom University o Chicago (2000). He requently teaches numerical methods and Python or scientic computing graduate courses, relying on Jupyter notebooks and python or much o the presentation. He is an advocate or open educational resources, as a ounder o the Open Astrophysics Bookshel project where he hosts his Introduction to Computational Astrophysical Hydrodynamics text.

# Chapter 9

# Glossary

Anaconda: a ree, open-source package manager, environment manager, Python distribution, and collection o over 1,500+ open source packages including and also Jupyter. https://www.anaconda.com/what-is-anaconda/

API (Application Programming Interace): a specication o what a programmer must write or dene to interact with a sotware library.

Binder: a hosted service that allows anyone to launch their own sandboxed notebook environment rom a Git repository. https://mybinder.org cell: the area in a Jupyter notebook where you can enter markdown, or computer code.

cloud, in the: used to describe sotware or documents hosted on a remote computer accessed over the internet.

CSV (Comma Separated Values): reerring to a comma-separated value le. A plain-text le ormat such that each line is a list o data separated by commas.

Data Frame A common tabular data structure with rows and columns available in R and in Python through Pandas.

execute: technical term or having the computer perorm the instructions o your program. Alias or "run it."

extension, Jupyter: in this instance, it is not a request or more time. Rather, a Jupyter extension is a bit o code, oten developed by a third-party, that adds additional unctionality to Jupyter. For example, a popular extension is a Table o Contents creator.

ipped classroom: a teaching style where students work on their own outside o class to learn new material (sometimes by watching recorded lectures or reading descriptive/interactive notebooks) and the come together in the classroom to practice what they've learned through exercises or experiments.

Git: a popular version control system (VCS) used or keeping track o changes o les over time.

IDE (Integrated Development Environment): sotware that assists in the development o additional sotware.

Jupyter: The term "Jupyter" may reer to one o a couple o dierent things: a community o users and developers ocused on the open source sotware; the collection o tools and standards that, together, allow projects like the Jupyter Notebook to operate. The name reers to the three core programming languages supported: Julia, Python, and R.

Jupyter Hub: a cloud service that can provide access to Jupyter notebooks and environments to multiple users via a modern web browser. http://jupyter.org/hub kernel: In Jupyter, a kernel is the packaging up o a language, and related programs needed to run it. For example, Python2 and Python3 are separate kernels.

LMS (Learning Management System): a cloud service that helps instructors manage aspects o classrooms.

load: how many students can a computer support?

## 76 CHAPTER 9. GLOSSARY

Markdown: a text ormat that allows or basic ormatting (headers, text styles, links) mixed inline with the text. Markdown les usually have the extension .md and can be rendered natively by Git Hub and other tools.

magic: a meta-command typically starting with one or two percent signs. Changes the meaning o the contents o a line (one percent sign, %) or the cell (two percent signs, %%) rom code to a particular meta-instruction. For example, %%R indicates that the cell contents will be interpreted as commands to the R language. Magics are kernel-specic (e.g., vary with the kernel in use).

nbgrader: a tool or creating, handling, and automatically grading assignments based on Jupyter notebooks. https: //nbgrader.readthedocs.io nbviewer: a web application or rendering Jupyter notebooks as static web pages, providing a URL to share and view them with a modern web browser. https://nbviewer.jupyter.org nbconvert: a tool or converting Jupyter notebooks into other ormats such as PDF, HTML, La TeX, Markdown, re-Structured Text, and others. https://nbconvert.readthedocs.io notebook hidden state: a technical term reerring to the value o variables that may have surprising results due to cells having been executed in a non-sequential order.

open source: sotware and documents that are created in a manner that give you rights to be able to use, and reproduce.

pattern: A "pattern" is a technical term reerring to an abstract description o a labeled process. For example, "wash, rinse, repeat" is a common pattern or cleaning various objects.

scafold: A teaching and learning pattern that provides steps in the learning process that build on prior learned knowledge.

script: a colloquial term or a computer program.

service, Jupyter Hub: Jupyter Hub can take advantage o additional separate, but integrated, sotware extensions. These are called "services."

sotware distribution: A collection o sotware that is typically installed in bulk and is designed to ensure interoperability.

unit test: a technical term or a "test" or checking to see i sotware is operating correctly.

URL (Universal Resource Locator): the address o a resource (e.g., webpage) on the internet.

widget: a user interace (such as buttons, sliders, and checkboxes) that allow the easy control o hidden computer code.

# Reerences

Barba, L., & Forsyth, G. (2018). CFD Python: The 12 steps to Navier–Stokes equations. Journal o Open Source Education, 1(9), 21. https://doi.org/10.21105/jose.00021

Brenner, S. C., & Scott, L. R. (2008). The mathematical theory o nite element methods. Springer Verlag.

Chapelle, D., & Bathe, K. J. (1993). The in-sup test. Computers and Structures, 47, 537–537. https://doi.org/10.1016/0045-7949(93)90340-J

Chen, O., Kalyuga, S., & Sweller, J. (2015). The worked example eect, the generation eect, and element interactivity. Journal o Educational Psychology, 107(3), 689. https://doi.org/10.1037/edu0000018

Coleman, E. G. (2012). Coding reedom: The ethics and aesthetics o hacking. Princeton University Press.

Freeman, S., Eddy, S. L., Mc Donough, M., Smith, M. K., Okoroaor, N., Jordt, H., & Wenderoth, M. P. (2014). Active learning increases student perormance in science, engineering, and mathematics. Proceedings o the National Academy o Sciences, 111(23), 8410–8415. https://doi.org/10.1073/pnas.1319030111

Haller, H., & Krauss, S. (2002). Misinterpretations o signicance: A problem students share with their teachers. Methods o Psychological Research, 7(1), 1–20. Retrieved rom http://www.dgps.de/achgruppen/methoden/mpr-online/issue16/art1/haller.pd

Le Veque, R. J. (2002). Finite volume methods or hyperbolic problems. Cambridge University Press.

Meurer, A., Smith, C. P., Paprocki, M., Čertı́k, O., Kirpichev, S. B., Rocklin, M., … Scopatz, A. (2017). Sym Py: Symbolic computing in Python. PeerJ Computer Science, 3, e103. https://doi.org/10.7717/peerj-cs.103

Mishra, S., & Spinolo, L. V. (2015). Accurate numerical schemes or approximating initial-boundary value problems or systems o conservation laws. Journal o Hyperbolic Diferential Equations, 12(01), 61–86. https://doi.org/10.1142/S0219891615500034

Moore, M. G. (1989). Editorial: Three types o interaction. American Journal o Distance Education. https://doi.org/10.1080/08923648909526659

Open Content. (1998). About opencontent. Retrieved 18 December 2002 rom http://opencontent.org/.

Raymond, E. S. (1996). The new hacker's dictionary. MIT Press.

Roache, P. J. (2004). Building PDE codes to be veriable and validatable. Computing in Science & Engineering, 6(5), 30–38. https://doi.org/10.1109/MCSE.2004.33

Sweller, J. (2006). The worked example eect and human cognition. Learning and Instruction, 16(2), 165–169. https: //doi.org/10.1016/j.learninstruc.2006.02.005

Treethen, L. N., & Bau, D. (1997). Numerical linear algebra. Society or Industrial Mathematics.
