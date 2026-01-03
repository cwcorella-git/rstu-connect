#### [writings.stephenwolfram.com](https://writings.stephenwolfram.com/2023/03/chatgpt-gets-its-wolfram-superpowers/)

# **ChatGPT Gets Its "Wolfram Superpowers"!**

32–40 minutes

## ![](_page_0_Figure_5.jpeg)

To enable the functionality described here, select and install the Wolfram plugin from within ChatGPT.

Note that this capability is so far available only to some ChatGPT Plus users; for more information, see [OpenAI's announcement.](https://openai.com/blog/chatgpt-plugins)

# **In Just Two and a Half Months…**

[Early in January I wrote about](https://writings.stephenwolfram.com/2023/01/wolframalpha-as-the-way-to-bring-computational-knowledge-superpowers-to-chatgpt/) the possibility of connecting [ChatGPT](https://chat.openai.com/chat) to [Wolfram|Alpha.](https://www.wolframalpha.com/) And today—just two and a half months later—I'm excited to announce that [it's happened!](https://openai.com/blog/chatgpt-plugins) Thanks to some heroic software engineering by [our team](https://www.wolfram.com/) and by [OpenAI,](https://openai.com/) ChatGPT can now call on Wolfram|Alpha—and [Wolfram Language](https://www.wolfram.com/language/) as well—to give it what we might think of as "computational superpowers". It's still very early days for all of this, but it's already very impressive—and one can begin to see how amazingly powerful (and perhaps even revolutionary) what we can call "ChatGPT + Wolfram" can be.

Back in January, I made the point that, as an [LLM neural net,](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) ChatGPT—for all its remarkable prowess in textually generating material "like" what it's read from the web, etc.[—can't itself be](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) [expected to do actual nontrivial computations,](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) or to systematically produce correct (rather than just "looks roughly right") data, etc. But when it's connected to the Wolfram plugin it can do these things. So here's my (very simple) first example from January, but now done by ChatGPT with "Wolfram superpowers" installed:

## ![](_page_1_Figure_4.jpeg)

It's a correct result (which in January it wasn't)—found by actual computation. And here's a bonus: immediate visualization:

## ![](_page_2_Picture_2.jpeg)

How did this work? Under the hood, ChatGPT is formulating a query for Wolfram|Alpha—then [sending it to Wolfram|Alpha for](https://www.wolfram.com/resources/tools-for-AIs/) [computation,](https://www.wolfram.com/resources/tools-for-AIs/) and then "deciding what to say" based on reading the results it got back. You can see this back and forth by clicking the "Used Wolfram" box (and by looking at this you can check that ChatGPT didn't "make anything up"):

## ![](_page_2_Figure_4.jpeg)

There are lots of nontrivial things going on here, on both the ChatGPT and Wolfram|Alpha sides. But the upshot is a good, correct result, knitted into a nice, flowing piece of text.

Let's try another example, also from what I wrote in January:

## ![](_page_3_Figure_5.jpeg)

A fine result, [worthy of our technology.](https://www.wolframalpha.com/input?i=What+is+the+integral+of+x%5E2+cos%282x%29) And again, we can get a bonus:

## ![](_page_3_Figure_7.jpeg)

## ![](_page_4_Picture_2.jpeg)

In January, I noted that ChatGPT ended up just "making up" plausible (but wrong) data when given this prompt:

## ![](_page_4_Figure_4.jpeg)

But now it calls the Wolfram plugin and gets a [good, authoritative](https://reference.wolfram.com/language/ref/entity/Country.html) [answer.](https://reference.wolfram.com/language/ref/entity/Country.html) And, as a bonus, we can also make a visualization:

## ![](_page_4_Figure_6.jpeg)

# Another example from back in January that now comes out correctly is:

## ![](_page_5_Figure_3.jpeg)

If you actually try these examples, don't be surprised if they work differently (sometimes better, sometimes worse) from what I'm showing here. Since [ChatGPT uses randomness](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) in generating its responses, different things can happen even when you ask it the exact same question (even in a fresh session). It feels "very human". But different from the solid "right-answer-and-it-doesn'tchange-if-you-ask-it-again" experience that one gets in Wolfram|Alpha and Wolfram Language.

Here's an example where we saw ChatGPT (rather impressively) "having a conversation" with the Wolfram plugin, after at first finding out that it got the "wrong Mercury":

## ![](_page_5_Figure_6.jpeg)

One particularly significant thing here is that ChatGPT isn't just using us to do a "dead-end" operation like show the content of a webpage. Rather, we're acting much more like a true "brain implant" for ChatGPT—where it asks us things whenever it needs to, and we give responses that it can weave back into whatever it's doing. It's rather impressive to see in action. And—although there's definitely much more polishing to be done—what's already there goes a long way towards (among other things) giving ChatGPT the ability to deliver accurate, curated knowledge and data—as well as correct, nontrivial computations.

But there's more too. We already saw examples where we were able to provide custom-created visualizations to ChatGPT. And with our computation capabilities we're routinely able to make "truly original" content—computations that have simply never been done before. And there's something else: while "pure ChatGPT" is [restricted to things it "learned during its training",](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/#the-training-of-chatgpt) by calling us it can get up-to-the-moment data.

This can be based on our real-time data feeds (here we're getting called twice; once for each place):

## ![](_page_7_Figure_2.jpeg)

#### Or it can be based on "science-style" predictive computations:

## ![](_page_7_Figure_4.jpeg)

#### Or both:

## ![](_page_8_Figure_4.jpeg)

# **Some of the Things You Can Do**

There's a lot that [Wolfram|Alpha](https://www.wolframalpha.com/) and [Wolfram Language](https://reference.wolfram.com/language/) cover:

## ![](_page_8_Figure_7.jpeg)

## ![](_page_9_Figure_2.jpeg)

And now (almost) all of this is accessible to ChatGPT—opening up a tremendous breadth and depth of new possibilities. And to give some sense of these, here are a few (simple) examples:

## ![](_page_10_Picture_2.jpeg)

[Algorithms](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Algorithms.png)

## ![](_page_11_Figure_3.jpeg)

[Audio](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Audio.png)

## ![](_page_12_Figure_2.jpeg)

[Currency conversion](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Currency-conversion.png)

## ![](_page_13_Figure_3.jpeg)

[Function plotting](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Function-plotting.png)

## ![](_page_14_Figure_4.jpeg)

[Genealogy](https://content.wolfram.com/uploads/sites/43/2023/04/sw032423img Genealogy-v2.png)

## ![](_page_15_Figure_3.jpeg)

[Geo data](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Geo-data.png)

## ![](_page_16_Figure_2.jpeg)

$$\zeta(s) = \sum_{n=1}^\infty rac{1}{n^s}$$

[Mathematical functions](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Mathematical-functions.png)

## ![](_page_17_Picture_2.jpeg)

[Music](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Music.png)

## ![](_page_18_Picture_3.jpeg)

### [Pokémon](https://content.wolfram.com/uploads/sites/43/2023/03/sw032423img Pokemon.png)

# **A Modern Human + AI Workflow**

ChatGPT is built to be able to have back-and-forth conversation with humans. But what can one do when that conversation has actual computation and computational knowledge in it? Here's an example. Start by asking a "world knowledge" question:

And, yes, by "opening the box" one can check that the right question was asked to us, and what the raw response we gave was. But now we can go on and ask for a map:

## ![](_page_19_Figure_4.jpeg)

But there are "prettier" map projections we could have used. And with ChatGPT's "general knowledge" based on its reading of the web, etc. we can just ask it to use one:

## ![](_page_20_Figure_2.jpeg)

But maybe we want a heat map instead. Again, we can just ask it to produce this—underneath using our technology:

## ![](_page_20_Figure_4.jpeg)

Let's change the projection again, now asking it again to pick it using its "general knowledge":

## ![](_page_21_Figure_3.jpeg)

And, yes, it got the projection "right". But not the centering. So let's ask it to fix that:

## ![](_page_21_Figure_5.jpeg)

## ![](_page_22_Figure_2.jpeg)

OK, so what do we have here? We've got something that we "collaborated" to build. We incrementally said what we wanted; the AI (i.e. ChatGPT + Wolfram) progressively built it. But what did we actually get? Well, it's a piece of Wolfram Language code—which we could see by "opening the box", or just asking ChatGPT for:

## ![](_page_22_Figure_4.jpeg)

If we copy the code out into a [Wolfram Notebook,](https://www.wolfram.com/notebooks/) we can immediately run it, and we find it has a nice "luxury feature"—as ChatGPT claimed in its description, there are dynamic tooltips giving the name of each country:

## ![](_page_23_Figure_3.jpeg)

(And, yes, it's a slight pity that this code just has explicit numbers in it, rather than the original symbolic query about beef production. And this happened because ChatGPT asked the original question to Wolfram|Alpha, then fed the results to Wolfram Language. But I consider the fact that this whole sequence works at all extremely impressive.)

# **How It Works—and Wrangling the AI**

What's happening "under the hood" with ChatGPT and the Wolfram plugin? Remember that the [core of ChatGPT is a "large](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) [language model" \(LLM\)](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) that's trained from the web, etc. to generate a "reasonable continuation" from any text it's given. But as a final part of its training ChatGPT is also taught how to "hold conversations", and when to "ask something to someone else" where that "someone" might be a human, or, for that matter, a plugin. And in particular, it's been taught when to reach out to the Wolfram plugin.

The Wolfram plugin actually has two entry points: a Wolfram|Alpha one and a Wolfram Language one. The Wolfram|Alpha one is in a sense the "easier" for ChatGPT to deal with; the Wolfram Language one is ultimately the more powerful. The reason the Wolfram|Alpha one is easier is that what it takes as input is just natural language—which is exactly what ChatGPT routinely deals with. And, more than that, Wolfram|Alpha is built to be forgiving and in effect to [deal with "typical human-like input",](https://www.wolfram.com/natural-language-understanding/) more or less however messy that may be.

Wolfram Language, on the other hand, is set up to be precise and well defined—and capable of being used to build arbitrarily sophisticated towers of computation. Inside Wolfram|Alpha, what it's doing is to translate natural language to precise Wolfram Language. In effect it's catching the "imprecise natural language" and "funneling it" into precise Wolfram Language.

When ChatGPT calls the Wolfram plugin it often just feeds natural language to Wolfram|Alpha. But ChatGPT has by this point learned a certain amount about writing Wolfram Language itself.

And in the end, as we'll discuss later, that's a more flexible and powerful way to communicate. But it doesn't work unless the Wolfram Language code is exactly right. To get it to that point is partly a matter of training. But there's another thing too: given some candidate code, the Wolfram plugin can run it, and if the results are obviously wrong (like they generate lots of errors), ChatGPT can attempt to fix it, and try running it again. (More elaborately, ChatGPT can try to generate tests to run, and change the code if they fail.)

There's more to be developed here, but already one sometimes sees ChatGPT go back and forth multiple times. It might be rewriting its Wolfram|Alpha query (say simplifying it by taking out irrelevant parts), or it might be deciding to switch between Wolfram|Alpha and Wolfram Language, or it might be rewriting its Wolfram Language code. Telling it how to do these things is a matter for the initial "plugin prompt".

And writing this prompt is a strange activity—perhaps our first serious experience of trying to ["communicate with an alien](https://writings.stephenwolfram.com/category/language-and-communication/) [intelligence"](https://writings.stephenwolfram.com/category/language-and-communication/). Of course it helps that the "alien intelligence" has been trained with a vast corpus of human-written text. So, for example, it knows English (a bit like all those corny science fiction aliens…). And we can tell it things like "If the user input is in a language other than English, translate to English and send an appropriate query to Wolfram|Alpha, then provide your response in the language of the original input."

Sometimes we've found we have to be quite insistent (note the all caps): "When writing Wolfram Language code, NEVER use snake case for variable names; ALWAYS use camel case for variable names." And even with that insistence, ChatGPT will still sometimes do the wrong thing. The whole process of "prompt engineering" feels a bit like animal wrangling: you're trying to get ChatGPT to do what you want, but it's hard to know just what it will take to achieve that.

Eventually this will presumably be handled in training or in the prompt, but as of right now, ChatGPT sometimes doesn't know when the Wolfram plugin can help. For example, ChatGPT guesses that this is supposed to be a DNA sequence, but (at least in this session) doesn't immediately think the Wolfram plugin can do anything with it:

## ![](_page_26_Figure_4.jpeg)

Say "Use Wolfram", though, and it'll send it to the Wolfram plugin, which indeed handles it nicely:

## ![](_page_26_Figure_6.jpeg)

(You may sometimes also want to say specifically "Use Wolfram|Alpha" or "Use Wolfram Language". And particularly in the Wolfram Language case, you may want to look at the actual code it sent, and tell it things like not to use functions whose names it came up with, but which don't actually exist.)

When the Wolfram plugin is given Wolfram Language code, what it does is basically just to evaluate that code, and return the result —perhaps as a graphic or math formula, or just text. But when it's given Wolfram|Alpha input, this is sent to a special [Wolfram|Alpha](https://www.wolfram.com/resources/tools-for-AIs/) ["for LLMs" API](https://www.wolfram.com/resources/tools-for-AIs/) endpoint, and the result comes back as text intended to be "read" by ChatGPT, and effectively used as an additional prompt for further text ChatGPT is writing. Take a look at this example:

## ![](_page_27_Figure_6.jpeg)

The result is a nice piece of text containing the answer to the question asked, along with some other information ChatGPT decided to include. But "inside" we can see what the Wolfram

#### plugin (and the Wolfram|Alpha "LLM endpoint") actually did:

## ![](_page_28_Figure_3.jpeg)

There's quite a bit of additional information there (including some nice pictures!). But ChatGPT "decided" just to pick out a few pieces to include in its response.

By the way, something to emphasize is that if you want to be sure you're getting what you think you're getting, always check what ChatGPT actually sent to the Wolfram plugin—and what the plugin returned. One of the important things we're adding with the Wolfram plugin is a way to "factify" ChatGPT output—and to know when ChatGPT is "using its imagination", and when it's delivering solid facts.

Sometimes in trying to understand what's going on it'll also be useful just to take what the Wolfram plugin was sent, and enter it as direct input on the Wolfram|Alpha website, or in a Wolfram Language system (such as the [Wolfram Cloud\)](https://www.wolframcloud.com/).

# **Wolfram Language as the Language for Human-AI Collaboration**

One of the great (and, frankly, unexpected) things about ChatGPT is its ability to start from a rough description, and generate from it a polished, finished output—such as an essay, letter, legal document, etc. In the past, one might have tried to achieve this "by hand" by starting with "boilerplate" pieces, then modifying them, "gluing" them together, etc. But ChatGPT has [all but made this](https://writings.stephenwolfram.com/2023/03/will-ais-take-all-our-jobs-and-end-human-history-or-not-well-its-complicated/) [process obsolete.](https://writings.stephenwolfram.com/2023/03/will-ais-take-all-our-jobs-and-end-human-history-or-not-well-its-complicated/) In effect, it's "absorbed" a huge range of boilerplate from what it's "read" on the web, etc.—and now it typically does a good job at seamlessly "adapting it" to what you need.

So what about code? In traditional programming languages writing code tends to involve a lot of "boilerplate work"—and in practice many programmers in such languages spend lots of their time building up their programs by copying big slabs of code from the web. But now, suddenly, it seems as if ChatGPT can make much of this obsolete. Because it can effectively put together essentially any kind of boilerplate code automatically—with only a little "human input".

Of course, there has to be some human input—because otherwise ChatGPT wouldn't know what program it was supposed to write.

But—one might wonder—why does there have to be "boilerplate" in code at all? Shouldn't one be able to have a language where just at the level of the language itself—all that's needed is a small amount of human input, without any of the "boilerplate dressing"?

Well, here's the issue. Traditional programming languages are centered around telling a computer what to do in the computer's terms: set this variable, test that condition, etc. But it doesn't have to be that way. And instead one can start from the other end: take things people naturally think in terms of, then try to represent these computationally—and effectively automate the process of getting them actually implemented on a computer.

Well, this is what I've now spent more than four decades working on. And it's the foundation of what's now Wolfram Language —which I now feel justified in calling a ["full-scale computational](https://writings.stephenwolfram.com/2019/05/what-weve-built-is-a-computational-language-and-thats-very-important/) [language"](https://writings.stephenwolfram.com/2019/05/what-weve-built-is-a-computational-language-and-thats-very-important/). What does this mean? It means that right in the language there's a computational representation for both abstract and real things that we talk about in the world, whether those are [graphs](https://reference.wolfram.com/language/guide/Graphs And Networks.html) or [images](https://reference.wolfram.com/language/guide/Image Processing.html) or [differential equations—](https://reference.wolfram.com/language/guide/Differential Equations.html)or [cities](https://reference.wolfram.com/language/ref/entity/City.html) or [chemicals](https://reference.wolfram.com/language/ref/entity/Chemical.html) or [companies](https://reference.wolfram.com/language/ref/entity/Company.html) or [movies.](https://reference.wolfram.com/language/ref/entity/Movie.html)

Why not just start with natural language? Well, that works up to a point—as the success of Wolfram|Alpha demonstrates. But once one's trying to specify something more elaborate, natural language becomes (like "legalese") at best unwieldy—and one really needs a more structured way to express oneself.

There's a big example of this historically, in mathematics. Back before about 500 years ago, pretty much the only way to "express math" was in natural language. But then mathematical notation was invented, and math took off—with the development of algebra, calculus, and eventually all the various mathematical sciences.

My big goal with the Wolfram Language is to create a computational language that can do the same kind of thing for anything that can be "expressed computationally". And to achieve this we've needed to build a language that both automatically does a lot of things, and intrinsically knows a lot of things. But the result is a language that's set up so that people can conveniently "express themselves computationally", much as traditional mathematical notation lets them "express themselves mathematically". And a critical point is that—unlike traditional programming languages—Wolfram Language is intended not just for computers, but also for humans, to read. In other words, it's intended as a structured way of "communicating computational ideas", not just to computers, but also to humans.

But now—with ChatGPT—this suddenly becomes even more important than ever before. Because—as we began to see above—ChatGPT can work with Wolfram Language, in a sense building up computational ideas just using natural language. And part of what's then critical is that Wolfram Language can directly represent the kinds of things we want to talk about. But what's also critical is that it gives us a way to "know what we have"—because we can realistically and economically read Wolfram Language code that ChatGPT has generated.

The whole thing is beginning to work very nicely with the Wolfram plugin in ChatGPT. Here's a simple example, where ChatGPT can readily generate a Wolfram Language version of what it's being asked:

## ![](_page_32_Figure_2.jpeg)

## ![](_page_32_Figure_4.jpeg)

## ![](_page_32_Picture_7.jpeg)

## ![](_page_32_Figure_10.jpeg)

## ![](_page_33_Figure_2.jpeg)

And the critical point is that the "code" is something one can realistically expect to read (if I were writing it, I would use the slightly more compact [Roman Numeral](https://reference.wolfram.com/language/ref/Roman Numeral.html) function):

Here's another example:

## ![](_page_34_Figure_2.jpeg)

I might have written the code a little differently, but this is again something very readable:

# It's often possible to use a pidgin of Wolfram Language and English to say what you want:

## ![](_page_35_Figure_3.jpeg)

## ![](_page_36_Figure_2.jpeg)

Here's an example where ChatGPT is again successfully constructing Wolfram Language—and conveniently shows it to us so we can confirm that, yes, it's actually computing the right thing:

## ![](_page_36_Figure_4.jpeg)

And, by the way, to make this work it's critical that the Wolfram Language is in a sense "self-contained". This piece of code is just standard generic Wolfram Language code; it doesn't depend on anything outside, and if you wanted to, you could look up the definitions of everything that appears in it in the [Wolfram Language](https://reference.wolfram.com/language/) [documentation.](https://reference.wolfram.com/language/)

### OK, one more example:

## ![](_page_37_Figure_5.jpeg)

Obviously ChatGPT had trouble here. But—as it suggested—we can just run the code it generated, directly in a notebook. And because Wolfram Language is symbolic, we can explicitly see results at each step:

So close! Let's help it a bit, telling it we need an actual list of European countries:

And there's the result! Or at least, a result. Because when we look at this computation, it might not be quite what we want. For example, we might want to pick out multiple dominant colors per country, and see if any of them are close to purple. But the whole Wolfram Language setup here makes it easy for us to "collaborate with the AI" to figure out what we want, and what to do.

So far we've basically been starting with natural language, and building up Wolfram Language code. But we can also start with pseudocode, or code in some low-level programming language. And ChatGPT tends to do a remarkably good job of taking such things and producing well-written Wolfram Language code from them. The code isn't always exactly right. But one can always run it (e.g. with the Wolfram plugin) and see what it does, potentially (courtesy of the symbolic character of Wolfram Language) line by line. And the point is that the high-level computational language nature of the Wolfram Language tends to allow the code to be sufficiently clear and (at least locally) simple that (particularly after seeing it run) one can readily understand what it's doing—and then potentially iterate back and forth on it with the AI.

When what one's trying to do is sufficiently simple, it's often realistic to specify it—at least if one does it in stages—purely with natural language, using Wolfram Language "just" as a way to see what one's got, and to actually be able to run it. But it's when things get more complicated that Wolfram Language really comes into its own—providing what's basically the only viable humanunderstandable-yet-precise representation of what one wants.

And when I was writing my book *[An Elementary Introduction to the](https://www.wolfram.com/language/elementary-introduction) [Wolfram Language](https://www.wolfram.com/language/elementary-introduction)* this became particularly obvious. At the beginning of the book I was easily able to make up exercises where I described what was wanted in English. But as things started getting more complicated, this became more and more difficult. As a "fluent" user of Wolfram Language I usually immediately knew how to express what I wanted in Wolfram Language. But to describe it purely in English required something increasingly involved and complicated, that read like legalese.

But, OK, so you specify something using Wolfram Language. Then one of the remarkable things ChatGPT is often able to do is to recast your Wolfram Language code so that it's easier to read. It doesn't (yet) always get it right. But it's interesting to see it make different tradeoffs from a human writer of Wolfram Language code. For example, humans tend to find it difficult to come up with good names for things, making it usually better (or at least less confusing) to avoid names by having sequences of nested functions. But ChatGPT, with its command of language and meaning, has a fairly easy time making up reasonable names. And although it's something I, for one, did not expect, I think using these names, and "spreading out the action", can often make Wolfram Language code even easier to read than it was before, and indeed read very much like a formalized analog of natural language—that we can understand as easily as natural language, but that has a precise meaning, and can actually be run to generate computational results.

## **Cracking Some Old Chestnuts**

If you "know what computation you want to do", and you can describe it in a short piece of natural language, then Wolfram|Alpha is set up to directly do the computation, and present the results in a way that is "visually absorbable" as easily as possible. But what if you want to describe the result in a narrative, textual essay? Wolfram|Alpha has never been set up to do that. But ChatGPT is.

Here's a result from Wolfram|Alpha:

## ![](_page_41_Picture_6.jpeg)

## ![](_page_42_Figure_2.jpeg)

And here within ChatGPT we're asking for this same

# Wolfram|Alpha result, but then telling ChatGPT to "make an essay out of it":

## S

Write an essay comparing altair and betelguese using data from wolfram

## ![](_page_43_Picture_5.jpeg)

## Used Wolfram

## Title: A Comparison of Altair and Betelgeuse

#### Introduction

Altair and Betelgeuse are two well-known stars in the night sky, each with distinct characteristics. Altair is the brightest star in the constellation Aquila, while Betelgeuse is a prominent star in the constellation Orion. This essay will compare the properties of these two stars, including their distance from Earth, apparent and absolute magnitudes, spectral classes, effective temperatures, masses, main sequence lifetimes, end states, and variable star properties.

## Distance from Earth

Altair is much closer to Earth than Betelgeuse, with a distance of 16.77 light-years (ly) compared to Betelgeuse's 548 ly.

## Apparent and Absolute Magnitudes

Both stars are easily visible to the naked eye, with Altair having an apparent magnitude of +0.76 and Betelgeuse having an apparent magnitude of +0.45. In terms of absolute magnitude, Altair has a visual absolute magnitude of +2.2, while Betelgeuse has a much brighter visual absolute magnitude of -6.02.

## Spectral Classes and Effective Temperatures

Altair is classified as an A7V main sequence star, while Betelgeuse is an M1.5lab supergiant. The effective temperature of Altair is 7,800 K, significantly hotter than Betelgeuse's 3,600 K.

## Masses and Main Sequence Lifetimes

Altair has a mass of 1.8 solar masses (M\_sun), while Betelgeuse is much more massive at 18 M\_sun. Due to its lower mass, Altair has a longer main sequence lifetime of 2.2 billion years, compared to Betelgeuse's 7.3 million years.

## **End States**

Altair is expected to and its life as a carbon-ovuren white dwarf while Retaleques will mital to expected to end its ille as a carbon exygen write awart, write beteigease v likely become a neutron star or black hole.

## Variable Star Properties

Both Altair and Betelgeuse are variable stars, with Altair being a Delta Scuti type and Betelgeuse being a semiregular late-type supergiant. Altair has a variability period of 0.06342 days, while Betelgeuse has a much longer period of 2,335 days.

#### Conclusion

In summary, Altair and Betelgeuse are two distinct stars with notable differences in their properties. Altair is closer to Earth, has a lower mass, and a longer main sequence lifetime. Betelgeuse, on the other hand, is more massive, brighter in absolute magnitude, and has a shorter main sequence lifetime. Both stars are variable, with different types and periods of variability. These differences highlight the diversity of stars in our universe and provide a fascinating glimpse into the life cycles of celestial objects.

Another "old chestnut" for Wolfram|Alpha is math word problems. Given a "crisply presented" math problem, Wolfram|Alpha is likely to do very well at solving it. But what about a "woolly" word problem? Well, ChatGPT is pretty good at "unraveling" such things, and turning them into "crisp math questions"—which then the Wolfram plugin can now solve. Here's an example:

## S

A boy on being asked the age of himself and of his sister replied:

"Three years ago I was seven times as old as my sister; two years ago I was four times as old; last year I was three times as old; and this year I am two and one-half times as old." What are their ages?

## ![](_page_44_Picture_12.jpeg)

Let's denote the boy's age as B and the sister's age as S. We are given four pieces of information:

- 1. Three years ago: B 3 = 7 \* (S 3)
- 2. Two years ago: B 2 = 4 \* (S 2)
- 3. Last year: B 1 = 3 \* (S 1)
- 4. This year: B = 2.5 \* S

We can set up a system of equations and solve for B and S.

## Used Wolfram ~

Here's a slightly more complicated case, including a nice use of "common sense" to recognize that the number of turkeys cannot be negative:

## ![](_page_45_Figure_4.jpeg)

Beyond math word problems, another "old chestnut" now addressed by ChatGPT + Wolfram is what physicists tend to call "Fermi problems": order-of-magnitude estimates that can be made on the basis of quantitative knowledge about the world. Here's an example:

## ![](_page_46_Picture_2.jpeg)

## ![](_page_46_Picture_3.jpeg)

The average mass of a cow ranges from 147 kg to 1363 kg (320 to 3000 pounds). The population of the United States is estimated to be around 331 million people as of 2020. There are approximately 93.8 million cows in the US as of 2020.

To estimate the total mass of cows and people in the US, we can use the average mass of a cow and the average mass of a person. The average mass of a person is around 62 kg (137 pounds).

Let's calculate the total mass of cows and people in the US:

Total mass of cows = number of cows \* average mass of a cow

Total mass of people = population of the US \* average mass of a person

We'll use the lower and upper bounds of the average mass of a cow for our calculations.

## ![](_page_46_Picture_9.jpeg)

Using the lower bound of the average mass of a cow (147 kg), the total mass of cows in the US is approximately $1.379 \times 10^7$ metric tons. Using the upper bound of the average mass of a cow (1363 kg), the total mass of cows in the US is approximately $1.278 \times 10^8$ metric tons.

The total mass of people in the US, using an average mass of 62 kg per person, is approximately 20.52 billion kg or 2.052 x 10^7 metric tons.

Now, let's compare the total mass of cows and people in the US:

- 1. Lower bound of total mass of cows: 1.379 x 10^7 metric tons
- 2. Upper bound of total mass of cows: 1.278 x 10^8 metric tons
- 3. Total mass of people: 2.052 x 10^7 metric tons

Using the lower bound of the average mass of a cow, the total mass of cows is slightly less than the total mass of people in the US. However, using the upper bound of the average mass of a cow, the total mass of cows is significantly greater than the total mass of people

# **How to Get Involved**

ChatGPT + Wolfram is something very new—really a completely new kind of technology. And as happens whenever a new kind of technology arrives, it's opening up tremendous new opportunities. Some of these we can already begin to to see—but lots of others will emerge over the weeks, months and years to come.

So how can you get involved in what promises to be an exciting period of rapid technological—and conceptual—growth? The first thing is just to explore ChatGPT + Wolfram. ChatGPT and Wolfram are each on their own vast systems; the combination of them is something that it'll take years to fully plumb. But the first step is just to get a sense of what's possible.

Find examples. [Share them.](https://community.wolfram.com/) Try to identify successful patterns of usage. And, most of all, try to find workflows that deliver the highest value. Those workflows could be quite elaborate. But they could also be quite simple—cases where once one sees what can be done, there's an immediate "aha".

How can you best implement a workflow? Well, we're trying to work out the best workflows for that. Within Wolfram Language we're setting up flexible ways to call on things like ChatGPT, both [purely programmatically,](https://resources.wolframcloud.com/Paclet Repository/resources/1e47aeaf-9015-4ce7-bfdd-aae85980ca40/) and in the context of the notebook interface.

But what about from the ChatGPT side? Wolfram Language has a very open architecture, where a user can add or modify pretty much whatever they want. But how can you use this from ChatGPT? One thing is just to tell ChatGPT to include some specific piece of "initial" Wolfram Language code (maybe together with documentation)—then use something like the pidgin above to talk to ChatGPT about the functions or other things you've defined in that initial code.

We're planning to build increasingly streamlined tools for handling and sharing Wolfram Language code for use through ChatGPT. But one approach that already works is to submit functions for publication in the [Wolfram Function Repository,](https://resources.wolframcloud.com/Function Repository) then—once they're published—refer to these functions in your conversation with ChatGPT.

OK, but what about within ChatGPT itself? What kind of prompt engineering should you do to best interact with the Wolfram plugin? Well, we don't know yet. It's something that has to be explored—in effect as an exercise in AI education or AI psychology. A typical approach is to give some "pre-prompts" earlier in your ChatGPT session, then hope it's "still paying attention" to those later on. (And, yes, it has a limited "attention span", so sometimes things have to get repeated.)

We've tried to give an overall prompt to tell ChatGPT basically how to use the Wolfram plugin—and we fully expect this prompt to evolve rapidly, as we learn more, and as the ChatGPT LLM is updated. But you can add your own general pre-prompts, saying things like "When using Wolfram always try to include a picture" or "Use SI units" or "Avoid using complex numbers if possible".

You can also try setting up a pre-prompt that essentially "defines a function" right in ChatGPT—something like: "If I give you an input consisting of a number, you are to use Wolfram to draw a polygon with that number of sides". Or, more directly, "If I give you an input consisting of numbers you are to apply the following Wolfram function to that input …", then give some explicit Wolfram Language code.

But these are very early days, and no doubt there'll be other powerful mechanisms discovered for "programming" ChatGPT + Wolfram. And I think we can confidently expect that the next little while will be an exciting time of high growth, where there's lots of valuable "low-hanging fruit" to be picked by those who chose to get involved.

# **Some Background & Outlook**

Even a week ago it wasn't clear what ChatGPT + Wolfram was going to be like—or how well it was going to work. But these things that are now moving so quickly are built on decades of earlier development. And in some ways the arrival of ChatGPT + Wolfram finally marries the two main approaches historically taken to AI that have long been viewed as disjoint and incompatible.

[ChatGPT is basically a very large neural network,](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) trained to follow the "statistical" patterns of text it's seen on the web, etc. The concept of neural networks—in a form surprisingly close to what's used in ChatGPT—originated all the way back in the 1940s. But after some enthusiasm in the 1950s, interest waned. There was a resurgence in the early 1980s (and indeed I myself first looked at neural nets then). But it wasn't until 2012 that serious excitement began to build about what might be possible with neural nets. And now a decade later—in a development whose success came as a big surprise even to those involved—we have ChatGPT.

Rather separate from the "statistical" tradition of neural nets is the

"symbolic" tradition for AI. And in a sense that tradition arose as an extension of the process of formalization developed for mathematics (and mathematical logic), particularly near the beginning of the twentieth century. But what was critical about it was that it aligned well not only with abstract concepts of computation, but also with actual digital computers of the kind that started to appear in the 1950s.

The successes in what could really be considered "AI" were for a long time at best spotty. But all the while, the general concept of computation was showing tremendous and growing success. But how might "computation" be related to ways people think about things? For me, a crucial development was [my idea at the](https://writings.stephenwolfram.com/2016/04/my-life-in-technology-as-told-at-the-computer-history-museum/) [beginning of the 1980s](https://writings.stephenwolfram.com/2016/04/my-life-in-technology-as-told-at-the-computer-history-museum/) (building on earlier formalism from mathematical logic) that transformation rules for symbolic expressions might be a good way to represent computations at what amounts to a "human" level.

At the time my main focus was on [mathematical and technical](https://writings.stephenwolfram.com/2013/06/there-was-a-time-before-mathematica/) [computation,](https://writings.stephenwolfram.com/2013/06/there-was-a-time-before-mathematica/) but I soon began to wonder whether similar ideas might be applicable to "general AI". I suspected something like neural nets might have a role to play, but at the time I only figured out a bit about what would be needed—and not how to achieve it. Meanwhile, the core idea of transformation rules for symbolic expressions became the foundation for what's now the Wolfram Language—and made possible the decades-long process of developing the full-scale computational language that we have today.

Starting in the 1960s there'd been efforts among AI researchers to develop systems that could "understand natural language", and "represent knowledge" and answer questions from it. Some of what was done turned into less ambitious but practical applications. But generally success was elusive. Meanwhile, as a result of what amounted to a [philosophical conclusion of basic](https://www.wolframscience.com/nks/chap-12--the-principle-of-computational-equivalence/) [science](https://www.wolframscience.com/nks/chap-12--the-principle-of-computational-equivalence/) I'd done in the 1990s, [I decided around 2005 to make an](https://writings.stephenwolfram.com/2016/04/my-life-in-technology-as-told-at-the-computer-history-museum/) [attempt](https://writings.stephenwolfram.com/2016/04/my-life-in-technology-as-told-at-the-computer-history-museum/) to build a general "computational knowledge engine" that could broadly answer factual and computational questions posed in natural language. It wasn't obvious that such a system could be built, but we discovered that—with our underlying computational language, and with a lot of work—it could. And in 2009 we were able to release [Wolfram|Alpha.](https://www.wolframalpha.com/)

And in a sense what made Wolfram|Alpha possible was that internally it had a clear, formal way to represent things in the world, and to compute about them. For us, "understanding natural language" wasn't something abstract; it was the concrete process of translating natural language to structured computational language.

Another part was assembling all the data, methods, models and algorithms needed to "know about" and "compute about" the world. And while we've greatly automated this, we've still always found that to ultimately "get things right" there's no choice but to have actual human experts involved. And while there's a little of what one might think of as "statistical AI" in the natural language understanding system of Wolfram|Alpha, the vast majority of Wolfram|Alpha—and Wolfram Language—operates in a hard, symbolic way that's at least reminiscent of the tradition of symbolic AI. (That's not to say that individual functions in Wolfram Language don't use machine learning and statistical techniques; in recent years more and more do, and the Wolfram Language also has a whole built-in [framework for doing machine learning.](https://www.wolfram.com/language/core-areas/machine-learning/))

As I've [discussed elsewhere,](https://writings.stephenwolfram.com/2023/01/wolframalpha-as-the-way-to-bring-computational-knowledge-superpowers-to-chatgpt/) what seems to have emerged is that "statistical AI", and particularly neural nets, are well suited for tasks that we humans "do quickly", including—as we learn from ChatGPT—natural language and the "thinking" that underlies it. But the symbolic and in a sense "more rigidly computational" approach is what's needed when one's building larger "conceptual" or computational "towers"—which is what happens in math, exact science, and now all the "computational X" fields.

And now ChatGPT + Wolfram can be thought of as the first truly large-scale statistical + symbolic "AI" system. In Wolfram|Alpha (which became an original core part of things like the Siri intelligent assistant) there was for the first time broad natural language understanding—with "understanding" directly tied to actual computational representation and computation. And now, 13 years later, we've seen in ChatGPT that pure "statistical" neural net technology, when trained from almost the entire web, etc. can do remarkably well at "statistically" generating "human-like" "meaningful language". And in ChatGPT + Wolfram we're now able to leverage the whole stack: from the pure "statistical neural net" of ChatGPT, through the "computationally anchored" natural language understanding of Wolfram|Alpha, to the whole computational language and computational knowledge of Wolfram Language.

When we were first building Wolfram|Alpha we thought that perhaps to get useful results we'd have no choice but to engage in a conversation with the user. But we discovered that if we immediately generated rich, "visually scannable" results, we only needed a simple "Assumptions" or "Parameters" interaction—at least for the kind of information and computation seeking we expected of our users. (In [Wolfram|Alpha Notebook Edition](https://www.wolfram.com/wolfram-alpha-notebook-edition/) we nevertheless have a powerful example of how multistep computation can be done with natural language.)

[Back in 2010 we were already experimenting](https://writings.stephenwolfram.com/2010/11/programming-with-natural-language-is-actually-going-to-work/) with generating not just the Wolfram Language code of typical Wolfram|Alpha queries from natural language, but also "whole programs". At the time, however—without modern LLM technology—that didn't get all that far. But what we discovered was that—in the context of the symbolic structure of the Wolfram Language—even having small fragments of what amounts to code be generated by natural language was extremely useful. And indeed I, for example, use the [ctrl=](https://reference.wolfram.com/language/workflow/Enter Free Form Input.html) [mechanism](https://reference.wolfram.com/language/workflow/Enter Free Form Input.html) in [Wolfram Notebooks](https://www.wolfram.com/notebooks/) countless times almost every day, for example to construct symbolic entities or quantities from natural language. We don't yet know quite what the modern "LLM-enabled" version of this will be, but it's likely to involve the rich human-AI "collaboration" that we discussed above, and that we can begin to see in action for the first time in ChatGPT + Wolfram.

I see what's happening now as a historic moment. For well over half a century the statistical and symbolic approaches to what we might call "AI" evolved largely separately. But now, in ChatGPT + Wolfram they're being brought together. And while we're still just at the beginning with this, I think we can reasonably expect tremendous power in the combination—and in a sense a new paradigm for "AI-like computation", made possible by the arrival of ChatGPT, and now by its combination with Wolfram|Alpha and Wolfram Language in ChatGPT + Wolfram.
