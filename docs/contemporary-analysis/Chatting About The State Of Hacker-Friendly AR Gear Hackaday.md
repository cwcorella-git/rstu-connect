---
title: Chatting About The State Of Hacker-Friendly AR Gear
category: contemporary-analysis
tags: []
---

## [hackaday.com](https://hackaday.com/2023/06/02/chatting-about-the-state-of-hacker-friendly-ar-gear/)

## Chatting About The State Of Hacker-Friendly AR Gear

5-6 minutes

There are many in the hacker community who would love to experiment with augmented reality (AR), but the hardware landscape isn't exactly overflowing with options that align with our goals and priorities. Commercial offerings, from Google's Glass to the Microsoft Holo Lens and Magic Leap 2 are largely targeting medical and aerospace customers, and have price tags to match. On the hobbyist side of the budgetary spectrum we're left with various headsets that let you slot in a standard smartphone, but like their virtual reality (VR) counterparts, they can hardly compare with purpose-built gear.

But there's hope — Brilliant Labs are working on AR devices that tick all of our boxes: affordable, easy to interface with, and best of all, developed to be as open as possible from the start. Admittedly their first product, Monocle, it somewhat simplistic compared to what the Big Players are offering. But for our money, we'd much rather have something that's built to be hacked and experimented with. What good is all the latest features and capabilities when you can't even get your hands on the official SDK?

This week we invited Brilliant Lab's Head of Engineering [Raj](https://hackaday.io/event/190941-open-source-ar-hack-chat) [Nakaraja to the Hack Chat](https://hackaday.io/event/190941-open-source-ar-hack-chat) to talk about AR, Monocle, and the future of open source in this space that's dominated by proprietary hardware and software.

## ![](_page_1_Picture_3.jpeg)

## Raj Nakaraja

Naturally the Chat started off with questions about how the Monocle works, and specifically, what exactly it looks like when you're wearing it. Compared to other devices which attempt to fill your entire field of view with high resolution graphics, the Monocle uses a tiny Sony ECX336CN 640 x 400 OLED shining down through a beam splitter placed in front of the user's eye. The end result is an experience that Raj describes looking like a "tablet screen at arm's length" sitting a few degrees down from the center of your vision. Viewing what's on the Monocle is fairly natural it's a bit like glancing down from a movie to see your phone.

For a commercial product, the [documentation for Monocle](https://docs.brilliant.xyz/monocle/monocle/) is nothing short of outstanding. We could only dream of a world in which all the hardware we purchased came with this sort of information. Schematics and 3D models are available, and there's extensive guidance available for the software side of things, going as far as explaining how you can craft your own over-the-air (OTA) upgrades.

That said, you'd be hard pressed to actually build a Monocle yourself. Raj says the manufacturing aspect was a considerable challenge, and it took them awhile to find a partner that could actually produce the optics required. Multiple injection molded optics components need to be bonded to themselves and the OLED itself with a special optical glue. Brilliant Labs has this part of the Monocle patented, but Raj says this was mainly to fend off the patent trolls, and invited those in the Chat to check it out if they wanted to read more about the work that went into it.

## ![](_page_2_Picture_3.jpeg)

Despite its small size, there's an impressive amount of hardware packed into the Monocle, including an FPGA used to provide graphics acceleration. All those components consume a fair amount of energy, and even with the built-in power management, the device's internal 70 m Ah battery will only get you so far.

Raj says you can get about 45 minutes of runtime out of the Monocle under normal use, and roughly half that if you're recording using its 5 MP Omnivision OV5640 camera. On the plus side, the Monocle comes with a charging case that has enough capacity to recharge the device six times.

Hardware details aside, several in the Chat asked what kind of things hackers could realistically do with AR. Naturally, this is where some imagination is required. But at least in the case of the

Monocle, all of the software is essentially Python, so it's very easy to plug into whatever you want. Raj points to a few examples, such as one user that [tied their Monocle to ChatGPT](https://twitter.com/bryanhpchiang/status/1639830383616487426) — the device would listen to what was being said to the user, feed it into the language model, and covertly display the appropriate response on the display. Obviously it was a tongue in cheek project, but with a little tweaking, it could be used as a universal translator of sorts.

We'd like to thank Raj Nakaraja for taking the time to talk with the Hackaday community this week. We've seen interest in hackable AR and VR hardware for years, but it's always been frustratingly out of reach. With devices the Monocle, it seems like there's finally a change in the wind, and we can't wait to see what hackers come up with as the hardware becomes more widespread.

The Hack Chat is a weekly online chat session hosted by leading experts from all corners of the hardware hacking universe. It's a great way for hackers connect in a fun and informal way, but if you can't make it live, these overview posts as well as the [transcripts](https://hackaday.io/event/190941-open-source-ar-hack-chat) [posted to Hackaday.io](https://hackaday.io/event/190941-open-source-ar-hack-chat) make sure you don't miss out.
