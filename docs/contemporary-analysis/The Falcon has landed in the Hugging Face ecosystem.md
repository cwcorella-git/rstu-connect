#### [huggingface.co](https://huggingface.co/blog/falcon)

# The Falcon has landed in the Hugging Face ecosystem

14-18 minutes

#### [Back to blog](https://huggingface.co/blog)

## Introduction

Falcon is a new family of state-of-the-art language models created by the [Technology Innovation Institute](https://www.tii.ae/) in Abu Dhabi, and released under the Apache 2.0 license. Notably, [Falcon-40B](https://huggingface.co/tiiuae/falcon-40b) is the first "truly open" model with capabilities rivaling many current closed-source models. This is fantastic news for practitioners, enthusiasts, and industry, as it opens the door for many exciting use cases.

In this blog, we will be taking a deep dive into the Falcon models: first discussing what makes them unique and then showcasing how easy it is to build on top of them (inference, quantization, finetuning, and more) with tools from the Hugging Face ecosystem.

## Table of Contents

- [The Falcon models](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#the-falcon-models)
- [Demo](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#demo)
- [Inference](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#inference)
- [Evaluation](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#evaluation)
- [Fine-tuning with PEFT](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#fine-tuning-with-peft)
- [Conclusion](about:reader?url=https%3A%2F%2Fhuggingface.co%2Fblog%2Ffalcon#conclusion)

# The Falcon models

The Falcon family is composed of two base models: [Falcon-40B](https://huggingface.co/tiiuae/falcon-40b) and its little brother [Falcon-7B.](https://huggingface.co/tiiuae/falcon-7b) The 40B parameter model currently tops the charts of the [Open LLM Leaderboard](https://huggingface.co/spaces/Hugging FaceH4/open_llm_leaderboard), while the 7B model is the best in its weight class.

Falcon-40B requires ~90GB of GPU memory — that's a lot, but still less than LLaMA-65B, which Falcon outperforms. On the other hand, Falcon-7B only needs ~15GB, making inference and finetuning accessible even on consumer hardware. (Later in this blog, we will discuss how we can leverage quantization to make Falcon-40B accessible even on cheaper GPUs!)

TII has also made available instruct versions of the models, [Falcon-](https://huggingface.co/tiiuae/falcon-7b-instruct)[7B-Instruct](https://huggingface.co/tiiuae/falcon-7b-instruct) and [Falcon-40B-Instruct.](https://huggingface.co/tiiuae/falcon-40b-instruct) These experimental variants have been finetuned on instructions and conversational data; they thus lend better to popular assistant-style tasks. If you are just looking to quickly play with the models they are your best shot. It's also possible to build your own custom instruct version, based on the plethora of datasets built by the community—keep reading for a step-by-step tutorial!

Falcon-7B and Falcon-40B have been trained on 1.5 trillion and 1 trillion tokens respectively, in line with modern models optimising for inference. The key ingredient for the high quality of the Falcon models is their training data, predominantly based (>80%) on Refi[ned Web](https://arxiv.org/abs/2306.01116) — a novel massive web dataset based on Common Crawl. Instead of gathering scattered curated sources, TII has focused on scaling and improving the quality of web data, leveraging large-scale deduplication and strict filtering to match the quality of other corpora. The Falcon models still include some curated sources in their training (such as conversational data from Reddit), but significantly less so than has been common for stateof-the-art LLMs like GPT-3 or PaLM. The best part? TII has publicly released a 600 billion tokens extract of Refi[ned Web](https://huggingface.co/datasets/tiiuae/falcon-refinedweb) for the

Another interesting feature of the Falcon models is their use of community to use in their own LLMs!

[multiquery attention](https://arxiv.org/abs/1911.02150). The vanilla multihead attention scheme has one query, key, and value per head; multiquery instead shares one key and value across all heads.

## ![](_page_2_Figure_3.jpeg)

This trick doesn't significantly influence pretraining, but it greatly [improves the scalability of inference:](https://arxiv.org/abs/2211.05102) indeed, the K,V-cache kept during autoregressive decoding is now significantly smaller (10-100 times depending on the specific of the architecture), reducing memory costs and enabling novel optimizations such as statefulness.

| Model | License | Commercial<br>use? | Pretraining<br>length<br>[tokens] | Pretraining<br>compute<br>[PF-days] | Leaderboard<br>score | K,V<br>cache<br>size for<br>a 2.048<br>context |
|----------------------|------------------|--------------------|-----------------------------------|-------------------------------------|----------------------|------------------------------------------------|
| StableLM<br>Alpha-7B | CC-BY<br>SA-4.0 | �� | 1,500B | 700 | 38.3* | 800MB |
| LLaMA-7B | LLaMA<br>license | � | 1,000B | 500 | 47.6 | 1,100MB |
| MPT-7B | Apache | �� | 1,000B | 500 | 48.6 | 1,100MB |

| Model | License | Commercial<br>use? | Pretraining<br>length<br>[tokens] | Pretraining<br>compute<br>[PF-days] | Leaderboard<br>score | K,V<br>cache<br>size for<br>a 2.048<br>context |
|------------|------------------|--------------------|-----------------------------------|-------------------------------------|----------------------|------------------------------------------------|
| | 2.0 | | | | | |
| Falcon-7B | Apache<br>2.0 | �� | 1,500B | 700 | 48.8 | 20MB |
| LLaMA-33B | LLaMA<br>license | � | 1,500B | 3200 | 56.9 | 3,300MB |
| LLaMA-65B | LLaMA<br>license | � | 1,500B | 6300 | 58.3 | 5,400MB |
| Falcon-40B | Apache<br>2.0 | �� | 1,000B | 2800 | 60.4 | 240MB |

<sup>\*</sup>score from the base version not available, we report the tuned version instead.

## Demo

You can easily try the Big Falcon Model (40 billion parameters!) in [this Space](https://huggingface.co/spaces/Hugging FaceH4/falcon-chat) or in the playground embedded below:

## Type an input and press Enter

Click on any example and press Enter in the input textbox!

Under the hood, this playground uses Hugging Face's [Text](https://github.com/huggingface/text-generation-inference) [Generation Inference,](https://github.com/huggingface/text-generation-inference) a scalable Rust, Python, and gRPC server for fast & efficient text generation. It's the same technology that powers [Hugging Chat.](https://huggingface.co/chat/)

We've also built a Core ML version of the 7B instruct model, and this is how it runs on an M1 Mac Book Pro:

No video with supported format and MIME type found.

The video shows a lightweight app that leverages a Swift library for the heavy lifting: model loading, tokenization, input preparation, generation, and decoding. We are busy building this library to empower developers to integrate powerful LLMs in all types of applications without having to reinvent the wheel. It's still a bit rough, but we can't wait to share it with you. Meanwhile, you can download the [Core ML weights](https://huggingface.co/tiiuae/falcon-7b-instruct/tree/main/coreml/text-generation) from the repo and explore them yourself!

## Inference

You can use the familiar transformers APIs to run the models on your own hardware, but you need to pay attention to a couple of details:

- The models were trained using the bfloat16 datatype, so we recommend you use the same. This requires a recent version of CUDA and works best on modern cards. You may also try to run inference using float16, but keep in mind that the models were evaluated using bfloat16.
- You need to allow remote code execution. This is because the models use a new architecture that is not part of transformers yet - instead, the code necessary is provided by the model authors in the repo. Specifically, these are the files whose code will be used if you allow remote execution (using falcon-7b-instruct as an example): confi[guration\\_RW.py,](https://huggingface.co/tiiuae/falcon-7b-instruct/blob/main/configuration_RW.py) [modelling\\_RW.py.](https://huggingface.co/tiiuae/falcon-7b-instruct/blob/main/modelling_RW.py)

With these considerations, you can use the transformers pipeline API to load the 7B instruction model like this:

from transformers import Auto Tokenizer import transformers import torch


model = "tiiuae/falcon-7b-instruct"
tokenizer = Auto Tokenizer.from_pretrained(model)
pipeline = transformers.pipeline(
 "text-generation",
 model=model,
 tokenizer=tokenizer,
 torch_dtype=torch.bfloat16,
 trust_remote_code=True,
 device_map="auto",
)
## 
And then, you'd run text generation using code like the following:


sequences = pipeline(
 "Write a poem about Valencia.",
 max_length=200,
 do_sample=True,
 top_k=10,
 num_return_sequences=1,
 eos_token_id=tokenizer.eos_token_id,
)
for seq in sequences:
 print(f"Result: {seq['generated_text']}")
## 
And you may get something like the following:


Valencia, city of the sun
The city that glitters like a star
A city of a thousand colors
Where the night is illuminated by stars
Valencia, the city of my heart
Where the past is kept in a golden chest
## 
#### Inference of Falcon 40B

Running the 40B model is challenging because of its size: it doesn't fit in a single A100 with 80 GB of RAM. Loading in 8-bit mode, it is possible to run in about 45 GB of RAM, which fits in an A6000 (48 GB) but not in the 40 GB version of the A100. This is how you'd do it:


from transformers import Auto Tokenizer,
Auto Model For CausalLM
import transformers
import torch
model_id = "tiiuae/falcon-40b-instruct"
tokenizer =
Auto Tokenizer.from_pretrained(model_id)
model = Auto Model For CausalLM.from_pretrained(
 model_id,
 torch_dtype=torch.bfloat16,
 trust_remote_code=True,
 load_in_8bit=True,
 device_map="auto",
)
pipeline = transformers.pipeline(
 "text-generation",
 model=model,
 tokenizer=tokenizer,
)
## 
Note, however, that mixed 8-bit inference will use torch.float16 instead of torch.bfloat16, so make sure you test the results thoroughly.

If you have multiple cards and accelerate installed, you can take advantage of device\_map="auto" to automatically distribute the model layers across various cards. It can even offload some layers to the CPU if necessary, but this will impact inference speed.

There's also the possibility to use [4-bit loading](https://huggingface.co/blog/4bit-transformers-bitsandbytes) using the latest version of bitsandbytes, transformers and accelerate. In this case, the 40B model takes ~27 GB of RAM to run. Unfortunately, this is slightly more than the memory available in cards such as 3090 or 4090, but it's enough to run on 30 or 40 GB cards.

#### Text Generation Inference

[Text Generation Inference](https://github.com/huggingface/text-generation-inference) is a production ready inference container developed by Hugging Face to enable easy deployment of large language models.

Its main features are:

- Continuous batching
- Token streaming using Server-Sent Events (SSE)
- Tensor Parallelism for faster inference on multiple GPUs
- Optimized transformers code using custom CUDA kernels
- Production ready logging, monitoring and tracing with Prometheus and Open Telemetry

Since v0.8.2, Text Generation Inference supports Falcon 7b and 40b models natively without relying on the Transformers "trust remote code" feature, allowing for airtight deployments and security audits. In addition, the Falcon implementation includes custom CUDA kernels to significantly decrease end-to-end latency.

## ![](_page_7_Figure_12.jpeg)

Text Generation Inference is now integrated inside Hugging Face's [Inference Endpoints.](https://huggingface.co/inference-endpoints) To deploy a Falcon model, go to the [model](https://huggingface.co/tiiuae/falcon-7b-instruct) [page](https://huggingface.co/tiiuae/falcon-7b-instruct) and click on the [Deploy -> Inference Endpoints](https://ui.endpoints.huggingface.co/new?repository=tiiuae/falcon-7b-instruct) widget.

For 7B models, we advise you to select "GPU [medium] - 1x Nvidia A10G".

For 40B models, you will need to deploy on "GPU [xlarge] - 1x Nvidia A100" and activate quantization: Advanced configuration -> Serving Container -> Int-8 Quantization. Note: You might need to request a quota upgrade via email to [api](mailto:api-enterprise@huggingface.co)[enterprise@huggingface.co](mailto:api-enterprise@huggingface.co)

# Evaluation

So how good are the Falcon models? An in-depth evaluation from the Falcon authors will be released soon, so in the meantime we ran both the base and instruct models through our [open LLM](https://huggingface.co/spaces/Hugging FaceH4/open_llm_leaderboard) [benchmark.](https://huggingface.co/spaces/Hugging FaceH4/open_llm_leaderboard) This benchmark measures both the reasoning capabilities of LLMs and their ability to provide truthful answers across the following domains:

- [AI2 Reasoning Challenge](https://allenai.org/data/arc) (ARC): Grade-school multiple choice science questions.
- [Hella Swag:](https://arxiv.org/abs/1905.07830) Commonsense reasoning around everyday events.
- [MMLU:](https://github.com/hendrycks/test) Multiple-choice questions in 57 subjects (professional & academic).
- [TruthfulQA:](https://arxiv.org/abs/2109.07958) Tests the model's ability to separate fact from an adversarially-selected set of incorrect statements.

The results show that the 40B base and instruct models are very strong, and currently rank 1st and 2nd on the [LLM leaderboard](https://huggingface.co/spaces/Hugging FaceH4/open_llm_leaderboard) ����!

| Mode1 | Revision A | Average 🔝 🔺 | ARC (25-shot) 🔝 🔺 | Hella Swag (10-shot) 🔝 🔺 | MMLU (5-shot) 🔝 🔺 |
|--------------------------------|------------|-------------|-------------------|-------------------------|-------------------|
| tiiuae/falcon-40b-instruct | main | 63.2 | 61.6 | 84.4 | 54.1 |
| tiiuae/falcon-40b | main | 60.4 | 61.9 | 85.3 | 52.7 |
| ausboss/llama-30b-supercot | main | 59.8 | 58.5 | 82.9 | 44.3 |
| llama-65b | main | 58.3 | 57.8 | 84.2 | 48.8 |
| MetaIX/GPT4-X-Alpasta-30b | main | 57.9 | 56.7 | 81.4 | 43.6 |
| Aeala/Vic Unlocked-alpaca-30b | main | 57.6 | 55 | 80.8 | 44 |
| digitous/Alpacino39b | main | 57.4 | 57.1 | 82.6 | 46.1 |
| Aeala/GPT4-x-Alpaca Dente2-30b | main | 57.2 | 56.1 | 79.8 | 44 |
| The Bloke/dromedary-65b-lora-HF | main | 57 | 57.8 | 80.8 | 50.8 |

As noted by [Thomas Wolf,](https://www.linkedin.com/posts/thom-wolf_open-llm-leaderboard-a-hugging-face-space-activity-7070334210116329472-x6ek?utm_source=share&utm_medium=member_desktop) one surprisingly insight here is that the 40B models were pretrained on around half the compute needed for LLa Ma 65B (2800 vs 6300 petaflop days), which suggests we haven't quite hit the limits of what's "optimal" for LLM pretraining.

For the 7B models, we see that the base model is better than llama-7b and edges out MosaicML's mpt-7b to become the current best pretrained LLM at this scale. A shortlist of popular models from the leaderboard is reproduced below for comparison:

Although the open LLM leaderboard doesn't measure chat capabilities (where human evaluation is the gold standard), these preliminary results for the Falcon models are very encouraging!

Let's now take a look at how you can fine-tune your very own Falcon models - perhaps one of yours will end up on top of the leaderboard ����.

# Fine-tuning with PEFT

Training 10B+ sized models can be technically and computationally challenging. In this section we look at the tools available in the Hugging Face ecosystem to efficiently train extremely large models on simple hardware and show how to fine-tune the Falcon-7b on a single NVIDIA T4 (16GB - Google Colab).

Let's see how we can train Falcon on the [Guanaco dataset](https://huggingface.co/datasets/timdettmers/openassistant-guanaco) a highquality subset of the [Open Assistant dataset](https://huggingface.co/datasets/Open Assistant/oasst1) consisting of around 10,000 dialogues. With the [PEFT library](https://github.com/huggingface/peft) we can use the recent [QLoRA](https://arxiv.org/abs/2305.14314) approach to fine-tune adapters that are placed on top of the frozen 4-bit model. You can learn more about the integration of 4-bit quantized models [in this blog post.](https://huggingface.co/blog/4bit-transformers-bitsandbytes)

Because just a tiny fraction of the model is trainable when using Low Rank Adapters (LoRA), both the number of learned parameters and the size of the trained artifact are dramatically reduced. As shown in the screenshot below, the saved model has only 65MB for the 7B parameters model (15GB in float16).

## ![](_page_10_Figure_2.jpeg)

The final repository has only 65MB of weights - compared to the original model that has approximately 15GB in half precision

More specifically, after selecting the target modules to adapt (in practice the query / key layers of the attention module), small trainable linear layers are attached close to these modules as illustrated below). The hidden states produced by the adapters are then added to the original states to get the final hidden state.

## ![](_page_10_Figure_5.jpeg)

# (left) are augmented by a low rank adapter comprised of weight matrices A and B (right).

Once trained, there is no need to save the entire model as the base model was kept frozen. In addition, it is possible to keep the model in any arbitrary dtype (int8, fp4, fp16, etc.) as long as the output hidden states from these modules are casted to the same dtype as the ones from the adapters - this is the case for bitsandbytes modules (Linear8bit Lt and Linear4bit ) that return hidden states with the same dtype as the original unquantized module.

We fine-tuned the two variants of the Falcon models (7B and 40B) on the Guanaco dataset. We fine-tuned the 7B model on a single NVIDIA-T4 16GB, and the 40B model on a single NVIDIA A100 80GB. We used 4bit quantized base models and the QLoRA method, as well as [the recent](https://huggingface.co/docs/trl/main/en/sft_trainer) [SFTTrainer](https://huggingface.co/docs/trl/main/en/sft_trainer) [from the TRL library.](https://huggingface.co/docs/trl/main/en/sft_trainer)

The full script to reproduce our experiments using PEFT is available [here,](https://gist.github.com/pacman100/1731b41f7a90a87b457e8c5415ff1c14) but only a few lines of code are required to quickly run the SFTTrainer (without PEFT for simplicity):


from datasets import load_dataset
from trl import SFTTrainer
from transformers import Auto Tokenizer,
Auto Model For CausalLM
dataset = load_dataset("imdb", split="train")
model_id = "tiiuae/falcon-7b"
tokenizer =
Auto Tokenizer.from_pretrained(model_id)
model =
Auto Model For CausalLM.from_pretrained(model_id,
trust_remote_code=True)
trainer = SFTTrainer(
 model,
## 

 tokenizer=tokenizer
 train_dataset=dataset,
 dataset_text_field="text",
 max_seq_length=512,
)
trainer.train()
## 
Check out the [original qlora repository](https://github.com/artidoro/qlora/) for additional details about evaluating the trained models.

#### Fine-tuning Resources

- Colab notebook to fi[ne-tune Falcon-7B on Guanaco dataset using](https://colab.research.google.com/drive/1Bi Qiw31DT7-c Dp1-0ySXvvhzqom TdI-o?usp=sharing) [4bit and PEFT](https://colab.research.google.com/drive/1Bi Qiw31DT7-c Dp1-0ySXvvhzqom TdI-o?usp=sharing)
- [Training code](https://gist.github.com/pacman100/1731b41f7a90a87b457e8c5415ff1c14)
- [40B model adapters](https://huggingface.co/smangrul/falcon-40B-int4-peft-lora-sfttrainer) [\(logs\)](https://wandb.ai/smangrul/huggingface/runs/3hpqq08s/workspace?workspace=user-younesbelkada)
- [7B model adapters](https://huggingface.co/ybelkada/falcon-7b-guanaco-lora) [\(logs\)](https://wandb.ai/younesbelkada/huggingface/runs/2x4zi72j?workspace=user-younesbelkada)

## Conclusion

Falcon is an exciting new large language model which can be used for commercial applications. In this blog post we showed its capabilities, how to run it in your own environment and how easy to fine-tune on custom data within in the Hugging Face ecosystem. We are excited to see what the community will build with it!
