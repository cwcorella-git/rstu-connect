---
title: "Understanding the Impact of Open-Source Language Models"
author: "Ben Dickson (TechTalks)"
date: 2023
category: technology-digital-justice
tags:
  - AI
  - LLMs
  - open-source
  - Cerebras-GPT
  - ChatGPT
  - Ben-Dickson
  - machine-learning
---

#### [bdtechtalks.com](https://bdtechtalks.com/2023/05/29/open-source-llms-cerebras-gpt/amp/)

## Ben Dickson


Just as it seemed big tech companies were going to dominate the market for large language models [\(LLM\)](https://bdtechtalks.com/tag/large-language-models/), a new wave of [open](https://bdtechtalks.com/2023/04/17/open-source-chatgpt-alternatives/)[source LLMs](https://bdtechtalks.com/2023/04/17/open-source-chatgpt-alternatives/) proved them wrong. The open-source community has put great efforts into creating models that can meet a wide range of computation, privacy, and data demands. These models are an alternative to ChatGPT and other LLMs that are only accessible through API interfaces.

In a recent interview with Tech Talks, Andrew Feldman, CEO of Cerebras Systems, discussed the implications of closed models and the efforts to create open-source LLMs. Cerebras creates specialized processors for training and running neural networks. It recently released Cerebras-GPT, a family of open, computeefficient LLMs. Feldman shared the experience and lessons learned from creating open-source LLMs and the new applications that these models will unlock.

## Closed-source vs open-source language models

Until recently, there was a tremendous amount of publication and information-sharing among the artificial intelligence community. With growing pressure on AI labs to monetize their technology or find ways to fund their research, a segment of the community moved toward less openness. A descriptive example is the technical report for [GPT-4,](https://bdtechtalks.com/2023/03/20/gpt-4-applications-limits/) OpenAI's latest LLM, which includes very little detail on the model's architecture, training data, and costs.

"What we began to see was a fundamental change. As these large companies expended tens hundreds or even billions of dollars training these models, they became less and less willing to share," Feldman said.

The race to [dominate the market for generative AI](https://bdtechtalks.com/2023/02/13/google-vs-microsoft-ai-competition/) incentivizes big tech companies and their associated labs to keep their research secret to gain an advantage over their competitors, especially as training and testing very large models is [very costly.](https://bdtechtalks.com/2020/09/21/gpt-3-economy-business-model/) Blackbox APIs and apps gradually became the de facto model for releasing new models.


But in recent months, we have seen the release of a wave of open-source models that provide alternatives to closed commercial products such as DALL-E 2 and [ChatGPT.](https://bdtechtalks.com/2022/12/05/openai-chatgpt/) The LLM community has been especially active with the release of models such as Alpaca, Vicuna, Dolly 2, MPT-7B, and Cerebras-GPT. These models enable organizations to have more options to explore when [deploying LLMs in their applications.](https://bdtechtalks.com/2023/05/08/open-source-llms-moats/)

"I don't think companies—large enterprises or small—wish to be dependent on one or two vendors for their language models. They want to control their own destiny," Feldman said. "The super large language models are very good at many things. But what the industry has shown is that much smaller models can, in domainspecific tasks, outperform these large general models. And the ability to train and fine-tune models in the 1-40 billion parameter category on a trillion tokens is very much within reach of most companies. And so there's been an explosion of open source in part of the reaction to the closing or the threat of closing AI work."

Having control over the model, its training data, and its applications is one of the appeals of open-source language models. And as open-source models are orders of magnitude smaller than the very large LLMs, they are easier to run and customize.

"What we found is that large enterprises want to train these models with their proprietary data, and build models that are narrowly focused and domain-specific and tuned for exactly what they want," Feldman said.

### How open-source LLMs became successful


## Andrew Feldman, CEO at Cerebras

"For a long time, the industry thought that more parameters were better. And I think OpenAI sort of pioneered that thinking. And in a general sense, that's right," Feldman said. "But in the specific sense, it's dead wrong."

In 2022, [a paper by researchers at Deep Mind](https://arxiv.org/abs/2203.15556) showed that you could improve the performance of a language model by training it on more data instead of making it larger. Chinchilla, the model introduced in the paper, ranged from 16 to 70 billion parameters. Chinchilla was trained on 1.4 trillion tokens, around 20 tokens per parameter. In comparison, with 175 parameters, [GPT-3 w](https://bdtechtalks.com/2020/08/17/openai-gpt-3-commercial-ai/)as trained on 300 billion tokens, around two tokens per parameter. As a result, Chinchilla outperformed larger models such as GPT-3 on many tasks. At the same time, running and fine-tuning it for downstream tasks was much less costly.

"[Chinchilla] led to the ability to train smaller models on more data to achieve really impressive results and the creation and open sourcing of large datasets," Feldman said. "The insight that data is probably more powerful than parameters when given a fixed budget has led to a huge amount of work in the 1-40 billion parameter category and a great deal less work in the 100-500 billion parameter category in the open source community."

The success of [LLaMA,](https://ai.facebook.com/blog/large-language-model-llama-meta-ai/) a family of models released by Meta, is another example of the power of training data over model size. Building on the lessons learned from Chinchilla, Meta continued to increase the number of training tokens per model parameter.

"In the LLaMA paper, they showed that you could keep gaining advantage by using more data—50 or 100 tokens per parameter," Feldman said. "You get less bang for your buck after about 20 or 30 tokens per parameter. But if you're willing to spend the compute cycles, spend the money on training compute, your model continues to improve in accuracy."

This gives developers more flexibility on the kind of models and training regimes they can use based on their budget, application, data, and frequency of use. For example, if you want fast and frequent inference, you might want to spend your budget training a smaller model on more data. This increases the costs of training but reduces the costs of inference. Alternatively, if you're less worried about inference costs, you can reduce the costs of training by training a larger model on fewer tokens. Instead, you'll pay more at inference time.

"You have this really interesting set of tradeoffs for those who are doing production work," Feldman said.

#### Fine-tuning open-source LLMs


As opposed to scientific research, which often evaluates models on very generalized benchmarks, specialization is very important for real-world applications.

"For the most part, in production applications, generality is helpful to nobody. Most enterprises want something very specific resolved, such as a set of finance questions, tax questions, legal or biomedical questions," Feldman said. "These are very specific tasks and so the ability for the model to be general is far less important."

At the same time, many enterprises have proprietary data that they want to train their model on. One of the exciting opportunities of open-source models is the efficiency of fine-tuning. Once you train a foundation model on a very large dataset, fine-tuning it for downstream tasks will be very cost-efficient. While very large LLMs require costly compute stacks to fine-tune, many opensource LLMs can be fine-tuned at very low costs and even on consumer-grade GPUs.

Researchers have developed parameter-efficient techniques such as [low-rank adaptation](https://bdtechtalks.com/2023/05/22/what-is-lora/) (LoRA), which can perform fine-tuning at a fraction of their normal costs.

"For not a lot of money, you're able to build on top of these open source foundation models by training with very specific very clean data that is directed towards a very specific domain," Feldman said. "And not surprisingly, the model is very accurate in that particular domain. That is a powerful element, and we will see more and more domain-specific work. I think it's very much one of the directions of the future."

## Cerebras-GPT

Cerebras released [Cerebras-GPT,](https://www.cerebras.net/blog/cerebras-gpt-a-family-of-open-compute-efficient-large-language-models/) a family of seven open-source language models that range from 111 million to 13 billion parameters. The models have been pre-trained on the [open](https://pile.eleuther.ai/)[source Pile dataset.](https://pile.eleuther.ai/) The Cerebras team used the guidelines from the Chinchilla paper and techniques to scale the models efficiently. The team released the models, weights, code, and training recipe.

The models have already been downloaded more than 400,000 times and have become very popular.

A few things make Cerebras-GPT particularly interesting. First, Cerebras released the models under the Apache 2.0 license, which means there are no limits to using them for research or commercial purposes. This is in contrast to some of the other open-source models, such as LLaMA, which have more restrictive licenses.

Moreover, the Cerebras-GPT provides very interesting details on the scaling laws of LLMs and the calculations that allow you to evaluate the tradeoffs between the costs of training and inference. They have created a training and scaling formula that enables you to accurately predict the performance of models without wasting expensive resources to train them.


#### Cerebras-GPT scaling laws

And finally, Cerebras has used its AI hardware to train the models. The Cerebras compute stack uses the highly efficient CS-2 processor, which has been specially designed to address some of the biggest challenges of setting up the compute stack to train and run LLMs.

"The GPU is a relatively small machine, and you want to use 400 or 600 or 1,000 of them, you have to spend a great deal of time and effort money distributing work across them," Feldman said. "We think that that that's a bad idea all the way all the way around. What you should do is build hardware that doesn't need it."

That is what the [Cerebras hardware and software stack](https://bdtechtalks.com/2022/08/01/cerebras-large-language-models/) does. You can easily scale your model and compute nodes without worrying about distributed computing and with a single command. In many cases, adjusting the compute stack only requires a single change to a config file.

"That is how we were able to put seven models into the community with just a few weeks of work," Feldman said. "When you build infrastructure and you put it into the open source community, what you want is for people to do cool stuff with your inventions. And then you can use it to solve interesting problems and we've been so proud of what's been out there."
