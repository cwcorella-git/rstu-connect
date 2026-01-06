---
title: "## Say Goodbye to Costly Auto-GPT and Lang Chain Runs: Meet ReWOO - The Game-Changing Modular Paradi"
category: "technology-digital-justice"
---

## [marktechpost.com](https://www.marktechpost.com/2023/06/04/say-goodbye-to-costly-auto-gpt-and-langchain-runs-meet-rewoo-the-game-changing-modular-paradigm-that-cuts-token-consumption-by-detaching-reasoning-from-external-observations/?amp)

## Say Goodbye to Costly Auto-GPT and Lang Chain Runs: Meet ReWOO - The Game-Changing Modular Paradigm that Cuts Token Consumption by Detaching Reasoning from External Observations

## Tanya Malhotra

5-6 minutes

## ![](_page_0_Figure_6.jpeg)

https://arxiv.org/abs/2305.18323

Large Language Models (LLMs) have successfully catered their way into the challenging areas of Artificial Intelligence. With their amazing ability to produce unique and creative content with great linguistic accuracy and consistency, LLMs are helping out in every industry. Large Language Models are often augmented with reasoning skills and the ability to use different tools. Augmentation basically refers to enhancing or expanding by adding additional elements or features. Augmented LLMs are the ones that are added with external tools and skills in order to increase their performance so that they perform beyond their inherent capabilities.

Applications like Auto-GPT for autonomous task execution have been made possible by Augmented Language Models (ALMs) only. Current ALM attempts mostly rely on the prompting paradigm with interleaved verbal reasoning and tool-calling, which have been effective but also imposes certain limitations. When connecting with external tools, it first necessitates the regular execution and suspension of LLMs, which causes delays and increases token usage. Secondly, LLMs generate tokens based on the previous context, and when halted for tool response, they resume token generation by feeding all historical tokens, which results in significant prompt redundancy leading to high cost in terms of token consumption for commercial LLM services.

To address the challenges, recently, a team of researchers has proposed ReWOO (Reasoning With Out Observation), a modular paradigm to reduce token consumption. The idea behind ReWOO is to separate the reasoning process of the LLM from external observations, which would help reduce the token consumption significantly. ReWOO minimizes the computational load associated with repeated prompts by separating the reasoning process from external observations.

The key components of an ALM are step-wise reasoning, tool calls, and summarization, which ReWOO divides into three separate modules: Planner, Worker, and Solver. The Planner breaks down a task and formulates a blueprint of interdependent plans, which are each assigned to a Worker. The Worker retrieves external knowledge from tools to provide evidence, and the Solver synthesizes all the plans and evidence to produce the final answer to the initial task to be completed.

To evaluate ReWOO's performance, the team has carried out a thorough analysis across six open Natural Language Processing (NLP) benchmarks and a curated dataset. The results consistently showed improvements with the proposed methodology, with ReWOO achieving a 5× token efficiency gain and a 4% accuracy improvement on the HotpotQA benchmark, which involves multistep reasoning tasks. ReWOO also proved to be robust in situations where the external tools had failure issues.

The decoupling of parametric modules from nonparametric tool calls not only increases prompt efficiency but also enables instruction fine-tuning in ReWOO. A 175B parameter GPT3.5 can have its reasoning capability offloaded to a smaller language model, 7B LLaMA, through fine-tuning, leading to a significant reduction in model parameters, which highlights the possibility of developing effective and scalable ALMs.

Consequently, ReWOO is a promising modular paradigm for ALMs as, for the first time, it overcomes the challenges of redundant prompts and computation complexity.

Check Out The [Paper](https://arxiv.org/abs/2305.18323) and [Github link](https://github.com/billxbf/ReWOO). Don't forget to join [our](https://pxl.to/8mbuwy) [22k+ ML Sub Reddit](https://pxl.to/8mbuwy)[,](https://pxl.to/8mbuwy) [Discord Channel](https://pxl.to/8mbuwy)[,](https://pxl.to/8mbuwy) and [Email Newsletter,](https://marktechpost-newsletter.beehiiv.com/subscribe) where we share the latest AI research news, cool AI projects, and more. If you have any questions regarding the above article or if we missed anything, feel free to email us at Asif@marktechpost.com

##  [Check Out 100's AI Tools in AI Tools Club](https://pxl.to/ydl0hc)

## ![](_page_3_Picture_4.jpeg)

## [Tanya Malhotra](https://www.marktechpost.com/author/tanyamalhotra/?amp)

Tanya Malhotra is a final year undergrad from the University of Petroleum & Energy Studies, Dehradun, pursuing BTech in Computer Science Engineering with a specialization in Artificial Intelligence and Machine Learning.

She is a Data Science enthusiast with good analytical and critical thinking, along with an ardent interest in acquiring new skills, leading groups, and managing work in an organized manner.
