---
title: tomshardware.com
category: technology-digital-justice
tags:
  - technology
  - digital rights
---

## [tomshardware.com](https://www.tomshardware.com/news/openai-shap-e-creates-3d-models)

## **OpenAI's Shap-E Model Makes 3D Objects From Text or Images**

## *Avram Piltch*

10–13 minutes

Recently, we've seen AI models that produce [detailed text-to-video](https://www.tomshardware.com/news/runway-gen2-text-to-video-via-chat) or use run a [chatbot on your phone.](https://www.tomshardware.com/news/mlc-ai-lightweight-chatbot) Now, OpenAI, the company behind ChatGPT, has introduced Shap-E, a model that generates 3D objects you can open in [Microsoft](https://www.tomshardware.com/tag/microsoft) Paint 3D or even convert into an STL file you can output on one of the [best 3D printers.](https://www.tomshardware.com/best-picks/best-3d-printers)

The Shap-E model is available for [free on Git Hub](https://github.com/openai/shap-e/) and it runs locally on your PC. Once all of the files and models are downloaded, it doesn't need to ping the Internet. And best of all, it doesn't require an OpenAI API key so you won't be charged for using it.

It is a huge challenge actually getting Shap-E to run. OpenAI provides almost no instructions, just telling you to use the Python pip command to

## 1 of 16 10/1/24, 5:51 PM

install it. However, the company fails to mention the dependencies you need to make it work and that many of the latest versions of them just won't work. I spent more than 8 hours getting this running and I'll share what worked for me below.

Once I finally got Shap-E installed, I found that the default way to access it is via Jupyter Notebook, which lets you view and execute the sample code in small chunks to see what it does. There are three sample [notebooks](https://www.tomshardware.com/tag/notebooks) which demonstrate "text-to-3d" (using a text prompt), "image-to-3d" (turning a 2D image into a 3D object) and "encode\_model" which takes an existing 3D model and uses Blender (which you need installed) to transform it into something else and re-render it. I tested the first two of these as the third (using Blender with existing 3D objects) was beyond my skillset.

## **How Shap-E Text-to-3D Looks**

Like so many AI models we test these days, Shap-E is full of potential but the current output is so-so at best. I tried the text-to-video with a few different prompts. In most cases, I got the objects that I asked for but they were low res and missing key details.

When I used the sample\_text\_to\_3d notebook, I got two kinds of output: color animated GIFs which displayed in my browser and monochrome

## 2 of 16 10/1/24, 5:51 PM
