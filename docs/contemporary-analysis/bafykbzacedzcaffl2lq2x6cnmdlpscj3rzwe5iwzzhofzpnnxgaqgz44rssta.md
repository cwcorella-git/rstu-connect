# FREE EBOOK 100 GAME DESIGN TIPS & TRICKS

## ![](_page_0_Picture_1.jpeg)

# 100 GAME DESIGN TIPS & TRICKS

# WLAD MARHULETS

the developer of

## DARQ

Unfold Games, LLC
## California

# Copyright

#### Copyright © 2020 by Wlad Marhulets

All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, without prior written permission.

## ![](_page_2_Picture_3.jpeg)

Unfold Games, LLC 5042 Wilshire Blvd, #39434, Los Angeles, CA 90036 USA

This book is designed to provide helpful information on the subjects discussed solely for educational and entertainment purposes. The author is not offering it as legal, accounting, or other professional services advice. While best efforts have been used in preparing this book, the author makes no representations or warranties of any kind and assumes no liabilities of any kind with respect to the accuracy or completeness of the contents and specifically disclaim any implied warranties of merchantability or fitness of use for a particular purpose. The author shall not be held liable or responsible to any person or entity with respect to any loss or incidental or consequential damages caused, or alleged to have been caused, directly or indirectly, by the information or strategies contained herein. Every company is different, and the advice and strategies contained herein may not be suitable for your situation. You should seek the services of a competent professional.

Some screenshots used in this book are copyrighted material the use of which has not always been specifically authorized by the copyright owner. We are making such material available in an effort to advance understanding of Game Design and we believe this constitutes a 'fair use' of any such copyrighted material as provided for in section 107 of the US Copyright Law. In accordance with Title 17 U. S. C. Section 107, the material in this Ebook is distributed without profit to those who have expressed a prior interest in receiving the included information for research and educational purposes. For more information, email publishing@unfoldgames.org

## ISBN: 978-1-7352325-4-6 (Ebook)

#### Intro

Hey! My name is Wlad Marhulets, and I'm the developer of DARQ. I wanted to share with you some tips & tricks about game design I've learned over the years while working on my first game (which to my surprise became #42 most shared PC Video Game of 2019, according to Metacritic). Some of these lessons were learned by making countless mistakes, others from GDC talks, youtube videos, fellow developers, and articles. I did my best to link to sources if I managed to find them or remember them. Some tips are genre specific. Others contradict one another. It's up to you to use them or not. Ultimately, breaking rules is the prerequisite to innovation. My hope is that this little book helps you make better decisions when designing your game!

If you're looking for advice, feedback, or guidance on your gamedev journey, feel free to reach out to me on Twitter (<u>@Unfold Games</u>).

Let's go!

# 1. Give the Player Clear Goals.

Without clear goals, players won't know what to do in your game and as a result, won't feel engaged. In this <u>Unite 2016 talk</u>, Curtiss Murphy talks about 3 kinds of goals:

- 1. **Explicit Goals**: goals communicated to the player by the game itself. For example: "new objective, get from point A to point B."
- 2. **Implicit Goals**: goals that are implied by the game, but not communicated directly. For example: don't die. Win the battle. Solve a puzzle.
- 3. Player Driven Goals: these are the most interesting kind of goals. It's the player who set a goal and gets engaged in achieving it. For example: in Minecraft, you're not given a specific objective, yet you quickly find yourself working on a large project. The project invented by you. This kind of goal is the most effective in keeping the player engaged.

## ![](_page_4_Picture_6.jpeg)

Player driven goals are extremely powerful. It's incredible what people manage to create in Minecraft.

# 2. Tell the Player What to Do, But Not How to Do It

Having clear objectives is important, but give the player the freedom to complete them on their own term. As a game designer, try to think of multiple ways an objective can be reached. Allow the player to choose the playstyle they prefer and avoid linearity. Make the player feel as if they are the mastermind behind the solution they came up with, even if it was carefully engineered and thought through during the design process.

## ![](_page_5_Picture_3.jpeg)

Hitman series is known for giving the player a lot of freedom in how they approach each mission. There are always multiple ways to complete each objective.

#### 3. Reward & Punishment

Reward the player for progressing in the game. Depending on the genre, it can be new items, XP, story elements, etc. Punishment is also an important motivator, but if you overuse it, the player will likely get frustrated with your game. The Diablo series is known for striking the perfect balance between both. The player is always motivated to move forward, being rewarded by gold, and new gear. The hope of finding a rare piece of equipment makes the journey much more engaging. The punishment of death is always there, yet it never overshadows the rewards that come with the progress.

## ![](_page_6_Picture_2.jpeg)

Diablo games feel satisfying because collecting gear and unlocking new skills serves as a powerful motivator as the player progresses through the game.

# 4. Teach the Player to Play Your Game nce you introduce a game mechanic, like jumping, make sure the player has to use it to progress further. Give it some time, and test the player's ability to use it. After some time has passed, think of a way the player could utilize the mechanic in a creative way to solve a problem or overcome an obstacle. These 3 steps are a sign of good game design and ensure that the player understands and remembers how to use a mechanic. For example, Super Mario Bros first teaches the player the jump mechanic. It does it by showing the player that they can hit the bricks and get over gaps. Later, the jump mechanic is being tested by making the player jump on top of little Goombas, the first type of enemy in the game. Finally, the player is asked to use the jump mechanic creatively by utilizing a double jump to defeat the turtles, also known as Koopa Troopas.

By that time, the player has a good understanding of what can be done in the game with the jump button.

## ![](_page_7_Picture_2.jpeg)

Shigeru Miyamoto, the designer of Super Mario Bros, teaches the player stepby-step how to use the jumping mechanic.

#### 5. Reuse the Core Mechanic in Various Ways

You'll be better off having just one core mechanic. Try to find creative ways to reuse it throughout the game so that it always feels fresh. Think of Jonathan Blow's Braid, which uses the concept of rewinding time as the core mechanic. The mechanic remains the same throughout the game. Each section of the game changes something about the world that makes the mechanic feel fresh. For example, having some elements of the world be immune to the time manipulation opens up the world of possibilities for new puzzles, which Jonathan Blow explores masterfully.

## ![](_page_8_Picture_1.jpeg)

Braid is centered around a single mechanic, yet it always feels fresh thanks to clever level design that gradually introduces new ideas as the game progresses.

It's the world that evolves, not the core mechanic.

#### 6. Create Your Game Loop

Again throughout your game. Every game has a core loop that remains unchanged. Your goal is to design a game loop of actions that is engaging and contrasting in nature. For example, *Skyrim's* core game loop involves exploration, fighting, looting, and upgrading new gear. Each action has a different intensity and emotion behind it, that's why the loop remains engaging throughout hundreds of hours of gameplay. Try to create a game loop that is simple, yet varied. Making the player do too much of the same activity in the game will simply feel boring.

## ![](_page_9_Picture_1.jpeg)

Skyrim's game loop consists of just a few actions, yet it remains engaging thanks to the wide range of emotions within the loop. Fighting feels exciting.

Looting and upgrading gear feels rewarding, etc.

# 7. Surprise & Twist nce the player gets used to the gameplay, introduce a new element, or a new rule. Look for ways to surprise your players. There are many ways to achieve this. It could be done through story twists, new mechanics, unexpected events, etc. (Spoilers ahead). How engaged were you when The Stanley's Parable teleported you into a completely different world? What about the big story and gameplay twist in The Last of Us, when Joel gets injured?

# 8. Make Good Boss Fights hat makes for a good boss fight? This video makes an in-depth analysis of this subject. A good boss fight should:

- Be challenging: nobody would enjoy the sweet victory if the bosses could be defeated as easily as other enemies.

- Be fair: players respond negatively when they notice the game trying to cheat to achieve difficulty. Make your boss's behavior complex yet somewhat predictable if enough practice, patience, and observation are applied.
- Avoid false difficulty: An easy way to make your boss fight challenging would be to it a lot of health. While bosses should be more resistant to the player's attacks, it shouldn't be the main difficulty factor. If it is, the fight becomes monotonous.
- Be intimidating: Dark Souls series does it best. The design of their boss fights always prioritizes new ways to intimidate the player. It could be achieved through epic music, boss size, or anything else that can help create a sense of danger.
- Test player's skills: A boss fight can be seen as an exam, testing
the player's knowledge of all the game mechanics presented in the
game prior to the fight. Make the boss force the player to utilize all
the skills that are available at that point.
- Be a part of the story: Last but not least, make the boss fight fit well into your game's story. The player should know why they're fighting the boss. Make it personal. After all, the victory won't feel as satisfying if the boss encounter was completely random and unexpected. For example, in *The Last Of Us*, Ellie's fight with David is preceded by a lot of story elements that make the fight truly emotional. You can't help but want to hurt David as much as possible. It would have felt so differently if David didn't appear in the game before the actual fight sequence.

## ![](_page_11_Picture_1.jpeg)

Bosses from the *Dark Souls* series are usually much bigger than the player. Combined with epic music, that's a good intimidation tactic.

#### 9. Create Points of Interest

Points of interest are unique objects or structures that help the player to navigate the world. They're especially useful in open-world games where the player has the freedom of movement in all directions. Good points of interest stand out from the rest of the environment and look different from every side. You shouldn't have too many of them next to each other.

## ![](_page_11_Picture_5.jpeg)

In Journey, the player is given a point of interest since the beginning of the game. The mountain top gives the player a clear sense of direction throughout the game.

#### 10. Make Memorable Environments

Apply similar principles to your level design, so the player doesn't feel disoriented in your game. In order to achieve that, add variety to your game assets and use unique architectural elements to serve as points of interest on a smaller scale. When designing my own game DARQ, making the environment look memorable was especially important to me. It's something that I had to learn the hard way during alpha and beta testing. Since the player can walk on walls and ceilings, it was easy to get lost. I went the extra mile and made the whole environment mostly unique. There aren't many repeating assets in the game, besides small props. Whether the player is walking on the floor, walls, or the ceiling, it's a lot easier to navigate the environment without feeling disoriented since every room looks unique and has memorable elements in them.

## ![](_page_12_Picture_4.jpeg)

In DARQ, the player can walk on walls and ceilings. It allows for viewing the environment from various camera angles. That increases the need for making every room unique, featuring interesting architectural shapes that look different from every angle.

#### 11. Make the Environment Interactive

Make your world feel alive. If shooting is your main game mechanic, make sure that the player can shatter windows and leave bullet holes in walls. Not being able to interact with the world according to some basic expectations can result in a lot of frustration and the loss of immersion. Conversely, being able to affect the world and see it respond accordingly is incredibly satisfying. Destructible environments are especially important in shooters. *Bro Force* feels great, and it's mostly because almost everything you see on the screen can be destroyed.

## ![](_page_13_Picture_4.jpeg)

## Fully destructible environments in Bro Force

#### 12. Construct Your Story Arc

Whether your game is story-driven or not, you need to think about what your game's arc is going to look like. Typically, you want to gradually raise tension until the climax of the game that comes at the end (final boss battle, big story element, etc.). Other story arcs can be just as effective.

# 13. Use Light to Guide The Player

Light can be used to guide the player into the direction you want them to go. Players would naturally follow the path that leads to a lit area. Light can also serve as a warning. A flickering light or red-colored light can serve as an indication of danger.

## ![](_page_14_Picture_5.jpeg)

INSIDE masterfully uses light to attracts the player's curiosity

# 14. Use Leading Lines to Direct Player's Attention

Another way you can guide the player is by using leading lines that naturally occur when the environment is viewed from a certain perspective. Being aware of this phenomenon when designing your levels will make them feel more intuitive to navigate.

## ![](_page_15_Picture_2.jpeg)

Tomb Raider environment design example: this scene encourages the player to look up. The element that stands out the most is the orange flag that points upwards. There are also stairs and implied lines that point towards the next point of interest.

#### 15. Let the Player Breathe

E ven the most unforgiving and intense games utilize safe zones. For example, think of safe rooms in Resident Evil games. They allow the player to rest, regroup, save game, reorganize the inventory, etc. Even the most adrenaline-filled action games need the sections where the player gets to relax. Tension is only exciting when interrupted with moments of safety, no matter how short they may be.

## ![](_page_16_Picture_1.jpeg)

Resident Evil series is known for its save rooms. They let the player breathe a little before plunging back into the adrenaline-filled gameplay.

# 16. Establish Visual Language

G ames rarely benefit from realism. Establish a visual language that you'll use consistently throughout your game. Both shape and color can communicate certain information to the player. For example, in *Mirror's Edge*, the red color is used to guide the player through the fast-paced chase sequences towards the next location.

## ![](_page_16_Picture_5.jpeg)

The red color is used here to help the player navigate the environment and make quick decisions in the fast-paced sequences.

ther games utilize various shapes and objects to convey information. For example, Far Cry 4 indicates climbable ledges by utilizing hanging ropes. Since it's consistent throughout the game, the player doesn't have to second-guess if climb action is available, even when the ledge is viewed from a distance and no UI icon is displayed.

## ![](_page_17_Picture_2.jpeg)

In Far Cry 4, hanging ropes indicate ledges that the player can climb.

#### 17. Avoid Invisible Walls

As a game designer, you want to keep the player within certain boundaries of the world. Players hate being restricted without a good reason. The worst thing you can do as a designer is to create invisible walls that prevent the player from exploring further. Always have a way of justifying any restriction of movement. Establish a visual language early on to communicate to the player that they can't go further. It could be a steep mountain, a wall with spikes, or anything else that helps communicate the idea of the word boundaries.

#### 18. Utilize Familiar Design Ideas

Although games are relatively a new medium, there are design principles that have become a universal language. While innovation is the only way indie developers can grow, if you brake certain design expectations, you're likely to confuse your players. For example, red barrels are expected to explode when hit by a bullet. Green herbs are expected to heal when consumed. Red or green colored bars usually indicate health, while blue ones indicate mana. Spikes mean danger. Hearts mean lives. Unless you have a good reason to break well-established conventions that dominate your genre, try to preserve them while innovating in other areas that won't frustrate the players.

## ![](_page_18_Picture_3.jpeg)

While red barrels can be seen as a cliché, they are widely used for a good reason. They're easy to spot in the heat of a battle.

# 19. Make Your Controls Responsive

If your game relies on reflexes and dexterity, you want as little input lag as possible. Think of reducing frames of animation to the minimum, so that the player always feels like pressing a button has an immediate effect. Some game genres, such as horror, benefit from clunky controls. It makes the character feel more vulnerable, which is a desired outcome for the genre. But most games benefit from tight controls that produce an immediate response. An extreme example is *Darkest Dungeon*, where the fight animations are limited to two frames. It feels extremely satisfying to trigger an attack without animation frames in between.

## ![](_page_19_Picture_2.jpeg)

Immediate attack animations feel very responsive.

# 20. Implement Accessibility Features

When designing your game, think of people with various impairments. Unless you consider certain design guidelines, they won't be able to enjoy your creation. Thankfully, implementing most accessibility features is not that difficult.

<u>Game Accessibility Guidelines.com</u> has a comprehensive list of guidelines that will allow people with motor, cognitive, vision, hearing, and other impairments to enjoy your game.

## ![](_page_20_Picture_1.jpeg)

Sea of Thieves offers a wide variety of accessibility settings.

# 21. Balance Your Game's Difficulty Dynamically

Traditionally, the game's difficulty can only be changed at the beginning. Apart from that, the overall difficulty increases as the player progresses through the game. However, this approach is terribly flawed, since a first-time player would have no idea what difficulty level would result in the most engaging experience. Committing to a difficulty level without knowing how the game plays makes no sense. Depending on the player's skills, the game can feel boring (because it feels easy) or frustrating (because it's too hard). There's a better way to do it. Take advantage of dynamic game difficulty balancing (DGDB), which is the process of adjusting the game's parameters automatically. The game would dynamically measure player performance and adjust such parameters as the number of enemies, the complexity of their AI, the amount of ammunition, etc. Most triple-A titles seem to implement it in one way or another.

## ![](_page_21_Picture_1.jpeg)

Left 4 Dead is known to dynamically adjust the number of zombies spawned depending on the player's performance.

# 22. Don't Trust Yourself When It Comes to Balancing Your Game

As a designer, you've played your game too many times. You've lost a sense of the game's difficulty because you know your game better than anybody. During playtesting your ideas you've acquired skills that your players won't have. You can't trust yourself when it comes to balancing your game, because you are not your target audience. Your skill level doesn't match the skill level of a player who just picked up your game. Therefore you have to rely on the opinion of alpha and beta testers—trust them, especially when it comes to balancing your game and its difficulty.

# 23. Design a Killer Inventory System

There's a lot to consider when designing an inventory system:

- Players like to have access to the items they use the most without having to open the full inventory window, so allow players to access their favorite gear (usually potions, spells, etc.) instantly, usually with hotkeys (1 through 9)

- As the player finds rare and powerful items, the inventory can serve as a display of the player's progress in your game. Allow for the items to be viewed up close. If your game is 3D, allow to zoom in and move the camera around. It could be fun for the player to discover hidden details about their most valuable possessions.
- Try to have a full-body avatar of the protagonist displayed in the inventory. What can be more satisfying than seeing your character wear the most powerful armor in the game?
- If your inventory has a capacity limit (or weight limit), it can
add an extra gameplay element of "inventory management." It
can be quite satisfying to organize gear in the most efficient way
or make difficult decisions when having to choose between two
swords.

## ![](_page_22_Picture_4.jpeg)

The inventory system in "Pillars of Eternity." Shows a full-body avatar, quick items area, and allows for some inventory management fun.

# 24. Allow the Player to Make Risk vs. Reward Decisions

Good game design lets the player choose safer or riskier ways of dealing with challenges. When designing your levels, think of multiple ways of completing them. They should vary in difficulty and implied reward, so the player can decide how much risk they want to take.

## ![](_page_23_Picture_3.jpeg)

Darkest Dungeon constantly keeps the player evaluating risk vs. reward.

Before completing the mission, the player can make a decision to leave the dungeon unexplored. Doing so reduces the risk, but also leaves potential rewards behind. The longer the player stays in the dungeon, the higher the risk, and the higher the reward.

#### 25. Use Camera Shakes

When done right, camera shakes can make your game feel a lot more impactful. If this is a new concept for you, I highly recommend watching The Art of Screenshake, a talk by Jan Willem Nijman. If your game features guns, explosions, and impacts, utilizing camera shakes can make a big difference.

# 26. Make Your Camera a Storyteller

Your game's camera can be used in a variety of ways. In 3rd person games, it has the most freedom, as it can move closer or further from the character and show the action from various angles. Placing the camera behind the player's back makes the player concentrate on the environment. The closer the camera to the character, the more emotionally engaged the player becomes. Being close to the subject makes the player identify and empathize with them. The further the camera from the subject, the less personal it feels. Having the camera above the character generally makes the player feel more empowered and in control. Having the camera close to the ground feels unnatural and creates discomfort. It makes the character appear vulnerable. It's a perfect angle if you want to create tension.

## ![](_page_24_Picture_3.jpeg)

Tomb Raider's designers use close-ups to make the player more emotionally engaged when Lara is in dangerous situations.

#### 27. Use Camera Effects

Adding lens effects, such as raindrop, dust, blood overlay, can help make your game feel more realistic. In addition, such post-

processing effects as field of view, color correction, chromatic abbreviation, and bloom can significantly increase the visual appeal of your game.

# 28. Constantly Introduce New Challenges

To keep the player engaged, you have to constantly invent new challenges. For example, Assassin's Creed: Syndicate keeps the player engaged by alternating between different types of gameplay all the time. It never gets monotonous, because once the player gets used to the fighting system, there's a stealth mission that requires an entirely different approach. Once the player becomes good at stealth, the game introduces timed horse racing missions. Finally, to switch it up further, the game alternates between two characters, Jacob and Evie. Switching between them both during and outside of missions keeps the game fresh. The player can customize their skill trees differently so that the characters offer unique gameplay experiences.

## ![](_page_25_Picture_4.jpeg)

Assassin's Creed: Syndicate constantly throws new challenges at the player. It keeps the game fresh and engaging.

# 29. Use NPC's or Enemies to Communicate Important Information

NPC's or dialog exchanges between enemies can be used to convey important information to the player. For example, in *Himan 2*, you can often overhear enemies talking to each other. They often mention things that become clues to accomplishing various tasks in a mission.

## ![](_page_26_Picture_3.jpeg)

# 30. Aim to Create Unique Experiences

As a new game designer, you may want to predict all possible outcomes of your game, but linearity is not what players tend to like. Instead, try to create systems that interact with each other and can produce unexpected results. That's one of the advantages of the brilliant design behind *Spelunky*. Apart from complete randomization, *Spelunky* has numerous game systems that allow each player to have a completely unique experience, full of surprises and unexpected interactions.

## ![](_page_27_Picture_1.jpeg)

No Spelunky playthrough is the same.

#### 31. Make Player's Skill Matter

Design your game so that your player's skill is a part of the game's equation. Many games utilize skill tries that reflect their protagonist's growth. One way to overcome a challenging enemy is to get good gear and make your character drink the potion of strength. There's nothing wrong with that design approach. However, what if the video game was more about *your* skill as a player, not your character stats? Games like *Cuphead* are extremely difficult and unforgiving, but that's what makes them fun. They allow the player to enjoy the process of developing skills to overcome the challenges of the game.

## ![](_page_27_Picture_5.jpeg)

Cuphead is a difficult game and requires a lot of skill to finish. That's what makes it so satisfying.

#### 32. Be Careful with Randomization

When your game heavily relies on Random Number Generator (RNG), you need to come up with a way to restrict it in some way. For example, if the player has a 90% chance to hit the enemy, the player expects a hit. However, when using RNG, missing 10 times in a row with a 90% chance of success is not impossible. It's unlikely, but it's bound to happen sooner or later. It would surely feel as if the game is rigged against the player, so it's something you might want to avoid. There are ways to apply restrictions to the RNG algorithm, and most games do it. For example, you could prevent the RNG from generating the same outcome more than 3 times in a row. It's a simple solution of course; it can get a lot more complicated in RPG and strategy games that rely on randomization.

## ![](_page_28_Picture_4.jpeg)

The developers of XCOM: Enemy Unknown faced a backlash from their community when the players discovered that often the character would miss multiple times in a row while chances of hitting the target were high.

# 33. Make your Game Feel Fair

Pollowing the previous tip, the goal of a game designer is to create the perception of fairness, not true fairness. Many games try to help the player without making it obvious. For example, in *Bioshock*, first shot from an enemy against you always misses. While it's technically unfair, it gives the player the time to take cover and reassess the situation. If enemies could kill you before you even spot them, it would certainly *feel* unfair, wouldn't it? Following realism rarely makes for a good gaming experience.

## ![](_page_29_Picture_3.jpeg)

In Bioshock, the first bullets that an enemy fires will always miss.

# 34. Create High Stakes

Game designers know that high stakes and risky play result in more fun. However, most players would always choose slow and careful playstyle to maximize their chances of success. The designers of XCOM: Enemy Unknown were surprised to learn that most players progressed through the levels very cautiously, using the overwatch action repeatedly. Realizing that such playstyle results in a relatively boring experience, the designers introduced a lot more timed missions in the XCOM 2. Timed missions forced the players to act faster and take more risks. While it made for more exciting gameplay, many players were dissatisfied with enforcing a more risky playstyle.

## ![](_page_30_Picture_2.jpeg)

XCOM 2 introduced timed missions because the designers realized that playing it safe results in boring gameplay. They wanted the players to engage in a more risky playstyle.

# 35. Create the Perception (?) of High Stakes

If introducing high stakes is not something you want to do, consider creating the perception of risk. Jennifer Scheurle, a video game designer, revealed on Twitter:

Assassin's Creed and Doom value the last bit of health as more hit points than the rest of it to encourage a feeling of \*JUST\* surviving.

Needless to say, the feeling of "barely making it" is very thrilling, because it feels so unlikely. It's no wonder that game designers figured out a way to increase the likelihood of it happening. If your game utilizes a health bar, consider making the last bits of health allow for taking more hits than the player would think.

## ![](_page_31_Picture_1.jpeg)

"JUST" surviving it in Assassin's Creed.

# 36. Let the Player Feel the Impact of Their Actions

Make the world respond accordingly to the player's actions. If the player accomplishes something great, let the NPC's say a few words about their actions. If the player gets caught stealing, make the shop owner react appropriately and call the guards. You get the idea.

## ![](_page_31_Picture_5.jpeg)

In GTA V pedestrians react appropriately when the player pulls out a gun.

#### 37. Aim to Create a "Flow State"

According to the Flow Theory, it's a state in which the player is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity. Needless to say, as a game designer, it's a state that you want your players to be while playing your game. According to the theory proposed by Mihály Csíkszentmihályi, flow is a state that lies between boredom and anxiety. If your game becomes too easy, your player will feel bored and exit the flow state. If your game becomes too difficult, the frustration and anxiety will break the immersion and enjoyment. As a game designer, your job is to keep the player right in between boredom and anxiety: the state in which the player is fully immersed in the experience.

#### 38. Create Memorable Moments

Memorable moments are usually achieved by contrast. If you want the player to remember something about your game, make it very different from the rest of the gameplay. It could be a contrasting scene in terms of the overall mood, color, and atmosphere. One of the most memorable moments from *The Last of Us 1* for me was the scene with the giraffes. It was so unexpected and wholesome. It made me care for the characters a lot more. It was a spark of hope, or rather a reminder of normal life and beauty in the grim and hopeless world.

## ![](_page_33_Picture_1.jpeg)

This was the moment I realized how effective "The Last of Us 1" was at controlling the player's emotions. This scene made me feel so many things.

# 39. Make AI Behavior Complex, But Predictable

If your AI were to be completely realistic, there would be no way to predict how enemies would react to the player's actions. Giving the player the ability to anticipate how the enemies would respond is necessary to achieving compelling gameplay. For example, Watch Dogs 2 allows the player to attract the attention of the enemies by planting lures on surfaces. In reality, not every guard would move towards a lure. Some would be suspicious. Others would investigate other areas suspecting it could be a trap. If the game were to be realistic, it would be hardly playable. That's why you should keep the AI behavior completely predictable, no matter how complex it is.

## ![](_page_34_Picture_1.jpeg)

Watch Dogs 2: The player is getting ready to plant a lure on the wall to attract the attention of the guard. It's behavior the player can anticipate with 100% certainty. It's that certainty that allows the player to create plans and strategies when tackling a mission.

# 40. Remind the Player How Powerful They've Become Since the Game Started

In combat driven games, the player grows stronger and acquires more powerful gear as the game progresses. Needless to say, the game would quickly become boring if enemies didn't become stronger as well, to match the player's new stats and gear. If the game increases the enemy's strength and HP at the same rate as the player increases theirs, the player would never get to feel powerful. That's why it's a good idea to bring back weaker enemies from time to time, to remind the player that they've become powerful since the beginning of their journey.

## ![](_page_35_Picture_1.jpeg)

In Skyrim, you can be a high-level character with the best gear and still encounter weak enemies. Killing them effortlessly reminds you of how much you've achieved since the beginning of the game, which feels satisfying.

# 41. Allow the Player to Make Decisions Based on Morality

In your video games, you've done something right. Taking morality into account when playing a game indicates a high level of engagement and emotional attachment. If you want your players to incorporate their personal moral views into their playstyle, it's important that moral decisions don't have serious gameplay implications. For example, if "being good" is the way to gain more XP or gold, the player will always choose good actions over bad ones. It would be for the wrong reasons though, and in no way does it express the player's moral compass.

## ![](_page_36_Picture_1.jpeg)

Papers, Please constantly challenges the player's morality, as they work as an immigration inspector at the border of the fictional dystopia of Arstotzka. The decision made by the player affect the story but don't give any significant gameplay advantage or disadvantage.

Another way to approach it is to make the moral choices made by the player affect the gameplay. In this scenario, it's important to balance the consequences of both paths, so neither becomes more advantageous than the other.

## ![](_page_36_Picture_4.jpeg)

Frostpunk allows the player to create laws and make decisions that have moral consequences. They affect the gameplay in significant ways, yet no law is objectively more beneficial than the other.

# 42. Implement Ledge Forgiveness

It's especially important in the platformer genre. Many platformers allow the player to perform a jump right after they started falling off the ledge. Also known as ledge forgiveness, grace period jumping, or simply coyote time. Allow your players to perform a jump once the player is off the ledge. Needless to say, set a time limit for ledge forgiveness. A fraction of a second should be about right.

## ![](_page_37_Picture_3.jpeg)

Rayman is about to take advantage of the coyote time and perform a jump when technically there's no ground underneath his feet.

#### 43. Perfect Your Run

Every run animation consists of three parts:

- 1. Acceleration from idle to run
- 2. Run
- 3. Deceleration to back to idle

Depending on the genre, you should think about how much time the acceleration and deceleration take place. If your game is a platformer or an adventure game where locomotion plays a big part, this is something you want to spend a lot of time tweaking. Game Maker's Toolkit has a great video covering this topic. Decreasing the time acceleration and deceleration takes would make locomotion feel snappier and tighter. If you overdo it, it will feel stiff. If transitioning from idle to run and the other way around takes a significant number of frames, your locomotion would feel sloppy and imprecise.

## ![](_page_38_Picture_2.jpeg)

Super Meat Boy is known for tight controls. Analyze how long it takes for the character to go from idle to run and from run to idle.

# 44. Allow Control During Jump

Taking away control during jump feels terribly unresponsive, so allow the player to change the direction of the jump while in the air. The player should also have control over the jump velocity, so they can aim for the desired landing spot.

## ![](_page_39_Picture_1.jpeg)

Jumping in Celeste feels phenomenal. If you're making a platformer, you should analyze how it's implemented in Celeste.

# 45. Use Input Jump Buffer

Games usually detect when the character is grounded. That allows for disabling jumping when the character is in the mid-air. Naturally, jumping should only be allowed when the character is grounded, at least if you're aiming to simulate reality in some way. However, what if the player hits the jump button right before landing? The jump wouldn't execute, which would feel terrible. Sometimes just a single frame would make the character qualify as airborne instead of grounded, which would make pressing the jump button ignored. Needless to say, that would feel unresponsive and annoying to the player. That's why you need to listen for input as the character is about to land and be ready to execute the action stored in the buffer as soon as the character touches the ground.

# 46. Decide on Your Character Personality hat are the traits of your protagonist? Is your protagonist fast or slow? Are they powerful or weak? The traits of your character will ultimately determine what they will look like. Apply the traits you come up with to your sketches and try to communicate the character's personality through visual means.

## ![](_page_40_Picture_2.jpeg)

When designing Lloyd, the protagonist of my game "DARQ," it was important to me to express that he is vulnerable, fearful, gentle, lost, scared, and other things that I can't mention to keep this example spoiler-free.

#### 47. Make Your Character Small

After you design a character, you naturally want to make it read well in the game. If you're designing a platformer or a game that requires precise movement, make your character small. The smaller the character, the less your camera needs to move. If your camera is static or barely moves at all, it becomes a lot easier to control the character with high precision within the scene. All good platformers have this in common: the protagonist is very small compared to the world.

## ![](_page_41_Picture_1.jpeg)

Celeste's protagonist Madeline is tiny compared to the rest of the world.

Thanks to her size, the camera doesn't need to move a lot. In some sections of the game, the camera is completely static.

#### 48. Design Recognizable Characters

Don't be afraid to exaggerate features to create memorable and recognizable characters. A good character design prioritizes simplicity of shape with unique recognizable features. If you want to test your character design, turn it into a black silhouette. If it still reads well and is recognizable, you've done a good job as a designer.

## ![](_page_41_Picture_5.jpeg)

Iconic characters from Journey and Shovel Knight read well as silhouettes.

They still look distinct and recognizable.

#### 49. Make Your Character Stand Out

It's important to make your character stand out from the rest of the scene. In my own game, <u>DARQ</u>, I chose to make the protagonist receive more light than other objects. It allows him to stand out, no matter how dark the environment is. There are also other ways you can make your protagonist stand out from the background. Making the character wear a piece of clothing that is colored differently than the rest of the world would do the trick too.

## ![](_page_42_Picture_3.jpeg)

DARQ's protagonist reads well even in the dark environments thanks to the additional light it receives.

# 50. Fast Respawns & Incremental Progress

I fyou're designing a game in which the character is meant to die often, otherwise known as a rage game, make sure you implement fast respawns. This way, death is not perceived as a harsh punishment but as a part of the learning process. Utilize frequent checkpoints, so the player never has to repeat large sections of the game. Fast respawns allow for incremental progress, where deaths serve to educate the player about the level.

## ![](_page_43_Picture_1.jpeg)

Super Meat Boy is a challenging game, but frequent deaths don't feel overly punishing thanks to instant respawns. Leaving bloodstains on the walls is a smart design choice, which further emphasizes the concept of incremental progress: you get through the game by dying a lot and learning from the mistakes of the previous incarnations of the protagonist.

# 51. Implement Autosave

One way you can help your player is to autosave the progress when the player achieved a significant milestone or simply when they reached a new location. You will save your player a lot of frustration if the game happens to crash for whatever reason.

#### 52. Focus on One Core Emotion

Your game's core emotion should be easy to identify within seconds. The core emotion will become the primary reason a player would want to engage with your game. As a gamer, don't you play titles that reflect your current mood, or help you balance your life in a certain way? Feeling overwhelmed with daily life? Why not escape to the relaxing world of Stardew Valley? Looking for a challenge? Why not try to speedrun Hollow Knight or Cuphead? Feeling like a quick session filled with joy and fun? You could reach for *Mario Kart* or other Nintendo IP's. In other words, if your game's core emotion is unclear, your audience won't be able to easily relate to it.

## ![](_page_44_Picture_2.jpeg)

Mario Kart is very clear about its core emotion: it's fun! Every design choice is made to reinforce this core emotion.

# 53. Communicate What Enemies Are Thinking

This is especially important in games that have stealth mechanics. As you trying to sneak past enemies, you want to know how close you're to being detected. Stealth games accomplish this in various ways. You could use a UI system that indicates how close you are to being detected or a dialog system in which the enemy would say: "huh?" as you make a noise. Either way, it's important to communicate to the player what the enemy is thinking.

## ![](_page_45_Picture_1.jpeg)

In Mark of the Ninja, the player is given all the necessary information about the state of the game through the use of UI. In the screenshot above, the yellow circle indicates where the player was heard by the guard. The question mark above the guard indicates that he heard the player and is about to investigate. The Z's coming out of the dog's head indicate that the dog is asleep and did not hear the player.

#### 54. Utilize Granular Failure States

The concept of granular failure states refers to letting your player mess up without making them suffer the entirety of the consequences at once. Making a mistake would result in partial punishment with the ability to recover/hide/escape/or handle the situation in a different way. For example, this principle could be used in stealth games. Getting detected should not result in immediate death, but rather forcing the player to run, hide, or risk fighting countless guards. Granular failure is handled perfectly in the Metal Gear Solid series, where getting spotted results in partial punishment (increased risk of death), but still allows the player to handle the situation in a variety of ways. This principle is used in a variety of games, even those not involving stealth, like the GTA series.

## ![](_page_46_Picture_1.jpeg)

In GTA V, there is five stars' worth of wanted level. Getting caught red-handed results in one star only, so the player has a high chance of escaping. As the wanted level increases, the player's chances of avoiding death are increasing.

#### 55. Forget About Your Ego.

On't try to show off your game design skills to the player. If you do your job right, your game design decisions will be noticeable to the player. At the same time, a part of your job is to make the player feel good about their skills. Allow them to show off what they can do with your game. Make it a means of expression for them, not you.

#### 56. Use Power-Ups hether it's a flower in Super Mario Brothers or a potion in Pillars of Eternity, power-ups are an important design element of many game genres. If you're utilizing power-ups in your game, consider the following:

Do the effects of the power-ups stack up, or one cancels the other?
Be careful if you allow the player to reach incredible stats by drinking 10 strength potions in a row. That can result in very

- imbalanced gameplay. Consider implementing limitations to prevent abusing power-ups.
- Does the player know when the effects of the power-ups wear off?
How does the game communicate it? Make sure the player knows when the power-up stops working.

## ![](_page_47_Picture_3.jpeg)

Power-ups that the player can pick up in "Mario Kart." Please note, only one power-up can be held at a time.

# 57. Use Knowledge as In-Game Currency

Learning about your game should feel satisfying to the player. In this presentation, Jonathan Blow talks about his experience playing the game 1001 Spikes. The game seems incredibly difficult, at first. While progressing through the first level, however, the player learns that the challenges that seemed nearly impossible are actually not that difficult at all. The difficulty of the game changes when the player makes a series of discoveries about the level. The design of 1001 Spikes impressed Jonathan, as he used a similar principle in his hit puzzle game The Witness.

## ![](_page_48_Picture_1.jpeg)

In The Witness, the player stumbles upon an extremely hard puzzle right after the tutorial area. At this point, the player lacks the knowledge to solve it.

However, as the player learns more and more about various puzzle designs in the game, it later becomes possible to come back and solve it.

# 58. Trigger Player's Curiosity

The example above showcases how acquiring knowledge can result in satisfying gameplay. But it does more: it triggers the player's curiosity from the get-go. Seeing a complex puzzle shows the player how much there is to explore and learn in the game, and this happens early on. Letting the player know that your game has a lot to offer is a good design practice, and it's used a lot in different game genres. Seeing big skill tries at the beginning of the game triggers curiosity about everything that is available in the game. "Look, there's so much to experience and unlock!"

## ![](_page_49_Picture_1.jpeg)

Civilization series show the player how much there is to unlock early on in the game. It serves as a promise. It tells the player that there's so much to explore in the game, even though it might seem that there isn't much to do when the game starts.

# 59. Make Grinding Meaningful

Are would be considered "grindy" if it requires taking a lot of repetitive actions in order to progress. An example of grinding would be killing weak enemies to slowly gain XP and level up. Grinding, as a game design idea, is not inherently bad. In some cases, when done right, it can become a powerful tool to keep the players engaged and immersed in your game. In order to make grinding feel meaningful, the player needs to know what reward awaits them at the end of the grind. Leveling up, unlocking new skills, spells, locations, story elements, and other rewards can be a powerful motivator. In other words, there needs to be an end goal to grinding. If your game focuses on excessive repetition of certain activities, you need to communicate to the player what the reward would be.

## ![](_page_50_Picture_1.jpeg)

In Minecraft, players feel motivated to "grind," or in other words, spend a lot of time breaking blocks in search of diamond ore. Why? Because diamond ore can be used to craft some of the most powerful tools in the game.

# 60. Don't Rely on Words To Tell The Story

Instead, make your world do it for you. It's a lot more intriguing to have the playing wonder "what does that mean?" instead of having an NPC explain it with words. Make level design a means of storytelling that guides your players through your game's narrative.

## ![](_page_50_Picture_5.jpeg)

INSIDE: Seeing people marching in a zombie-like fashion raises a lot of questions. It also gives a clear sense of the world the player is in. There's no need for words. The game tells you everything you need to know.

# 61. Have All Elements Work Together

To make your game immersive, you need to strive to make all elements of the game work together in unison. For example, Darkest Dungeon accomplishes this masterfully. Every aspect of this game works together to evoke the unified vision of showing the player the emotional toll of dungeon crawling. The overall mood is pessimistic and dark. The art design alone is enough to convey the game's core emotion. It's worn and somber, featuring hand-painted characters with an abundance of thick black lines and shadows. It helps support the idea of the psychological damage the heroes endure as a result of your greed-driven orders. Notice that after a successful mission, the comeback to town is accompanied by grim music. The lack of checkpoints and permadeath during missions makes the stakes high, and your chances of making it through feel low.

## ![](_page_51_Picture_3.jpeg)

All elements of The Darkest Dungeon work together in unison.

#### 62. Make Your Game Fun to Watch

Chances are that more people will watch your game on You Tube or Twitch than play it. Think about it when making design choices. What makes games fun to watch?

- Beautiful visuals: players might not have the time to enjoy all the
work that was put in the visuals, but the beauty of the
environment will surely be noticed by those who watch others play
the game.
- Good Story & Plot Twists: people love seeing strong reactions of You Tubers and streamers. An interesting story with a lot of plot twists provides great entertainment value, both for the player and the audience. People who watch game playthroughs enjoy the feeling of comradery that happens between the streamer and their audience. Going on a journey together and experiencing all its twists as a group is an exciting experience.
- **Jump Scares:** audiences love seeing their favorite You Tubers and streamers get jump scared. Experiencing danger from afar, in a safe environment, without participating directly, provides a lot of entertainment value.

## ![](_page_53_Picture_1.jpeg)

"The Last of Us" is full of beautiful visuals, has an amazing story, and is filled with exciting action sequences. It makes for a fantastic viewing experience.

# 63. Use Sound to Bring Your Game To Life

Sound design might be unnoticeable when done right, but when done badly, it can ruin your game. Make sure the reverb settings match your environment. Come up with a way to cut off high frequencies of sounds that are blocked by an obstacle, like a wall. That can usually be accomplished with the use of raycasts. Sounds that are far from the player (or camera) would usually have a longer reverb tail and not as much low and high frequencies. The closer the player gets to the sound source, the more detailed it should be (i.e. less reverb, more high frequencies, etc.). Constantly check the attenuation for your sound effects, whether your game is 2D or 3D. Sometimes realism is not the only factor to consider, but if you want your world to feel believable, good sound design can help you bring it to life.

#### 64. Don't Overuse Minimaps

${f M}$ inimaps can be helpful when navigating large worlds, but they can become the point of focus during most of your gameplay. What a waste, with all the detailed 3D graphics rendered in real-time, the gameplay comes down to looking at a simplified 2D representation of what's actually happening. If your game relies heavily on the use of a minimap, consider giving your players the option to disable it. Some players are looking for an immersive experience where they have to interact with NPC's and memorize the environment in order to navigate through the world.

## ![](_page_54_Picture_2.jpeg)

Watch Dogs 2: The minimap shows a lot of information. It can make it difficult to feel immersed in the beautifully rendered 3D world when you have to focus on the simplified 2D representation of it most of the time.

# 65. Design Your Maps Correctly

If you have to have a mini-map, consider having a full-size map too, which would provide more details about the environment. Here are some thoughts to consider when creating maps:

- Use icons to indicate important locations, quests, and other points of interest
- Include a legend, so your players can easily tell what map icons mean.

- Indicate inaccessible areas in some way. The player should know which areas can be explored and which areas are purely decorative (like mountains).
- When viewing the map in full size, use a large icon to indicate
player's position. It should be the most noticeable icon since
that's the first bit of information the player would need when
viewing the map. Also, don't forget to show which direction the
player is facing.
- Allow the player to add markers, which should be also visible on the mini-map, to help guide them towards where they want to go.

## ![](_page_55_Picture_4.jpeg)

Rise of the Tomb Raider: full-size map. The icons provide a lot of useful information. Also, please note: the map clearly indicates which areas are accessible and which ones are not.

# 66. Pause the Game When Large UI Screens Are Open

You may want to pause the game when the full-size map and other large UI elements are open, such as quest journal, and maybe even inventory (it might be a game design choice not to pause the game while the inventory is open. *Baldur's Gate* series was famous for that approach).

# 67. Restrict Fast Travel in Open World Games

That's the point of building open worlds filled with content if the player has the ability to teleport to any spot? The whole point of open-world games is exploration, while fast travel takes that pleasure away. When the player is given a choice between the more or less efficient way of completing a task, they would surely choose the more efficient way, even if it results in less fun. While getting rid of fast travel all together might not be the best game design solution, fast travel can be restricted and used as a reward. For example, fast travel requires unlocking a location in the Far Cry series. Another way to enforce at least some exploration is to increase the distance between the points to which the player can fast travel. This would introduce a sense of balance between the beauty of exploration and the efficiency of navigating a large world.

## ![](_page_57_Picture_1.jpeg)

Far Cry 4: Fast travel becomes available as a reward after the outpost is liberated.

#### 68. Reward Player's Curiosity

Players love to stray off the path and explore. It's usually disappointing when the exploration doesn't lead to a satisfying discovery or a reward. Try to create optional paths and locations that are not essential to finishing your game but provide a nice distraction from the main quest. Make sure to reward the players who display curiosity and explore your game in non-obvious ways.

## ![](_page_57_Picture_5.jpeg)

Pillars of Eternity has a location called Endless Paths of Od Nua. It's a giant 15-level dungeon full of powerful monsters, challenging puzzles, and rewards.

Only the first level needs to be explored. The rest of the levels are optional and it's a great way to satisfy the players who want to do more than just complete the main quest.

# 69. Foreshadow Danger

A boss fight would not be as thrilling if the boss didn't show up several times before the actual fight. Making use of cutscenes, scripted events, and other means of foreshadowing of what's coming creates excitement and anticipation.

## ![](_page_58_Picture_3.jpeg)

In Resident Evil 2 remake, Mr. X appears way before the final confrontation in which he can be defeated. The game constantly reminds the player of the impending danger, which creates a lot of tension and anticipation before the actual boss fight.

# 70. Use Size to Communicate Danger

If your game has enemies of any sort, use size to communicate to the player how dangerous the enemies are to the player. Enemies that are shorter than the player are automatically perceived as weaker. Those that match the protagonist's height are seen as equal (unless they have added visual cues, like a powerful armor). Bigger enemies get the player's attention the most, as we're condition to perceive taller creatures as more dangerous.

## ![](_page_59_Picture_1.jpeg)

Shadow of the Colossus uses size difference to communicate danger

#### 71. Make Your Enemies' Behavior Unique

Make sure your enemies have different personalities/behaviors to make them feel unique and interesting to the player. Your enemies can differ in how aggressive they are towards the player (how long does it take before they stop chasing the player and return to their idle state?), how aggressive they become when attacked (would they risk their lives when their health falls below a certain point or would they try to escape?). Would they attack the player when unprovoked? How close would the player need to get for the enemy to attack? Your enemies can also differ in their speed, attack range, blocking skills, health. They can act more bravely and aggressively in groups than one. The possibilities are endless.

## ![](_page_60_Picture_1.jpeg)

In the classic "Pac Man," each ghost has a unique personality and unique behavior. Some players might have never realized that, but each enemy was programmed to have unique movement patterns. That's what made the game fun—learning the enemy's behaviors allowed for more strategic gameplay.

# 72. Respect Your Players' Time

Try to make every minute of your game count. Don't overuse backtracking to extend your game's length and avoid reusing ideas without putting a new twist on them. Players have a lot of games to play in their backlog. You should give them a good reason to spend their time on yours.

## ![](_page_61_Picture_1.jpeg)

INSIDE might be a short game, but it never overstays its welcome. The player is introduced to new ideas and story hints every step of the way. And when the game begins to feel repetitive, there's a giant twist that makes you say "wow." If you played it, you know what I'm talking about. If you haven't, stop reading this article and go play this game!

#### 73. Make Backtracking Interesting

If you end up having to use some backtracking in your level design, try to make it interesting to the player. It's important that the player doesn't feel like it's wasted time. You can still add new content to the environments that have been explored before. For example, in the first level of my game DARQ the player has to find three gears. Once the third gear is found, the player needs to return to the beginning of the level to activate a machine that opens the gate. There's a twist though (spoiler alert): getting the third gear disables electricity and switches off the lights. Now the player needs to backtrack in darkness. Not only that but switching off the lights attracts enemies that the player needs to sneak past.

## ![](_page_62_Picture_1.jpeg)

DARQ: backtracking introduces new challenges (enemies) and makes the environment look different (change in lighting).

#### 74. Be Conservative with Innovation

There are certain established conventions when it comes to various systems, like inventory, stealth, AI, quests, dialogs, fighting, etc. If you innovate too much and break all the player's expectations, your game will be unintuitive to play. Don't get me wrong, you should absolutely aim to innovate, but don't overdo it. Instead, add a twist to a familiar genre, or innovate within a familiar set of game design principles. For example, Braid is a puzzle-platformer with a twist: you can rewind time indefinitely. Super Hot is a first-person shooter with a twist: time moves only when you move.

## ![](_page_63_Picture_1.jpeg)

Super Hot introduces just one innovation to the established game design principles of the first-person shooter genre. One is enough. It makes for a great hook. It's memorable, fun, and easy to understand.

# 75. Keep Controls as Simple as Possible

Try to simplify your controls as much as possible. It will allow the players to learn how to play your game fast.

## ![](_page_63_Picture_5.jpeg)

In LIMBO, the controls are limited to movement, jumping, and action buttons.

#### 76. Design Good In-Game Economy

I f you have in-game currency, you have to be smart about how it's used in the world you're building. Try not to overpower the player by making them rich too quickly, but also use in-game money to reward the player as they make progress in your game. Most importantly, have a lot of items available for sale, so the player has a lot of things to spend money on. Choosing what is the best thing to buy is an equivalent of reading hundreds of reviews on Amazon to decide what is the best product—it feels good.

## ![](_page_64_Picture_2.jpeg)

In Stardew Valley you can see what money can buy way before you can afford those items (like the backpack). Additionally, new items are added to the stores as the player gets richer in the game.

# 77. Make the Best Items Impossible to Buy

A fter all, you want to encourage your players to explore the game, not just focus on acquiring in-game currency, right? The best way to motivate the player to explore dangerous areas filled with monsters is to get better items—something that one cannot buy in stores.

## ![](_page_65_Picture_1.jpeg)

In "Skyrim," Daedric Armor can only be acquired by looting tough enemies or smithing. It cannot be purchased.

#### 78. Design Smart Puzzles

Good puzzle design involves presenting clear and simple rules and challenging the player to find a solution within the given rules & limitations. It should never be the case that the player doesn't know what to do. A good puzzle should make that clear from the get-go. The question that the player needs to find the answer to is how to do it. Figuring out the "how" element is incredibly rewarding and satisfying. On the other hand, solving a puzzle without understanding its rules by trial and error is not satisfying.

## ![](_page_66_Picture_1.jpeg)

The Witness by Jonathan Blow teaches you the rules behind multiple kinds of puzzles. You're never confused about "what to do." It's always about the "how."

#### 79. Design Fair Timed Puzzles ne of the ways you can introduce a bit of excitement to your game is to have your player solve a puzzle within certain time constraints. For example, performing a set of actions before the ceiling collapses or figuring a way out of a building before it burns down. Keep the following in mind when designing such puzzles:

- The puzzle objective should be clear before or right after the time restriction is introduced
- The time designated for solving the puzzle should be tight, but allow the player to make mistakes.
- To increase excitement, consider ending the puzzle with the "barely made it" sequence. In
- other words, even if the player manages to solve the puzzle fast, the dangerous outcome the player was trying to avoid happens right after the player succeeded (i.e. the ceiling collapses just as the player solves the puzzles, or the building explodes just as the player manages to find the way out).

# 80. Design Puzzles That Fit into the Setting

In the book Level Up, Scott Rogers argues that it's relatively easy to throw a random puzzle into a game. It's much harder to make it a part of the story, or at least fit into the environment. Is opening a container in an abandoned hospital with a set of 5 golden emblems really makes sense? Wouldn't a key be a more believable way to open a container? Unless your game is set in an abstract world, putting puzzles that don't belong in the environment breaks immersion.

## ![](_page_67_Picture_3.jpeg)

Resident Evil 2 remake features a puzzle that requires using chess pieces to open the sewers door. The puzzle is quite abstract, while it's set in a realistic setting.

# 81. Don't Let Realism Get in The Way of Fun

Admittedly, this is a contradiction to the advice mentioned above. Realism rarely adds to the enjoyment of playing video games. More often than not, it gets in the way of playability. As a game designer, you should always make decisions that prioritize fun over realism.

# 82. Design a Satisfying Win State

When the player wins a battle, completes a quest, or finishes the game, make sure to reward them with visual and audible cues. To this day I remember how satisfying it felt to win a battle in Heroes III. It was a game of my childhood. The feel-good music, the sound effects, and the stats panel that showed how much experience I gained are forever engraved in my memory.

## ![](_page_68_Picture_3.jpeg)

# 83. Design an Effective Failure State

The failure state shouldn't be too long, so it doesn't feel discouraging and overly punishing to the player. Adding variety to the failure state can soften the ego blow and turn failures into an effective motivator to continue. For example, *Limbo* is known for countless ways the player can die. While the game is dark and atmospheric, dying over and over again in various ways proved to be an effective way to keep players engaged, wanting to try again and overcome the challenges.

## ![](_page_69_Picture_1.jpeg)

One of the ways you can die in Limbo.

#### 84. Be Smart About Procedural Generation

Procedural generation is a great solution to filling your game with unlimited content, which ensures endless hours of gameplay. More often than not, however, procedural generation results in bland content that quickly gets boring. Not many games manage to get procedural generation right. There are many ways to approach this topic. Spelunky is known for masterfully implementing procedural generation. Its algorithm is surprisingly not overly complicated, but extremely elegant. The beauty of procedural generation is that players would never know what rules are at play when the environment is generated. While procedural generation is hard to get right, try not to overcomplicate things if not necessary. Spelunky manages to generate environments that feel well designed, and it's because it splits them into smaller chunks, each governed by a set of rules. While this approach might not be applicable to all genres, Spelunky is worth researching and analyzing if you're making a game that utilizes procedural generation.

## ![](_page_70_Picture_1.jpeg)

Spelunky is known for its spectacular procedural generation algorithm.

Research it if you want to learn how the game manages to create satisfying caves that don't feel generic or boring.

# 85. Make Use of Predesigned Elements

If you're using procedural generation, don't forget that you have the freedom to add predesigned elements to your algorithm. In fact, you can create a lot of predesigned "building blocks" and use them in your procedurally generated world. Mixing predesigned blocks and areas that are procedurally generated from scratch can help create the illusion that the entirety of the game was designed by a human hand. You can even go one step further and create levels using predesigned areas only. You just have to have enough of them to achieve a high level of variety in the generated worlds. I might be wrong about this, but I'm guessing that the procedural generation of *Descenders* relies mostly on predesigned elements.

## ![](_page_71_Picture_1.jpeg)

Descenders is a downhill freeriding game with procedurally generated worlds.

# 86. Keep Object Scale Realistic

I f your game is set in a realistic environment, make sure that your assets are scaled properly. For example:

- Interior walls are usually 4.5 inches thick.
- Exterior walls are usually over 5 inches thick.
- The average doorway height is about 80 inches.
- The average story height is about 14 feet.

You can easily find this kind of information online. Whatever 3D modeling software you're using, make sure you stick to the realistic scale of the environment (as long as it's your goal).

# 87. Strive for Challenge Over Difficulty

The difference might seem subtle, but designing your game to be difficult focuses on punishing the player as they try to interact with it. On the other hand, a challenging game teaches the player how to overcome the obstacles by guiding the player through the process of improving their skill.

#### 88. Add Easter Eggs nce your game is finished and polished, consider adding Easter Eggs, or simply, secrets. Players love to discover things that are rare. It could be a secret object hidden somewhere in the world, a rare encounter, a collectible that doesn't quite belong in the game but has some significance, etc.

## ![](_page_72_Picture_5.jpeg)

## An Easter Egg in GTA V

# 89. Reward the Player For Finishing The Game

Rewarding the player for making progress in the game is one of the pillars of game design. What about the ultimate achievement: finishing the game? What is there you could do to reward the players for playing your game from start to finish? Think of unlockable costumes, characters, mini-games, concept art, or other things that could make the player feel that the whole journey was worth it.

#### 90. Make a Good HUD If You Need One

Hud with information through the game to communicate as much information through the game to the game to the much information through the game to the much information through the game to the much information through the gameplay itself, not icons and text.

## ![](_page_73_Picture_5.jpeg)

"Assassin's Creed Syndicate" HUD elements: mini-map, health, current objective, control hints, selected weapon.

#### 91. Make Your HUD Contextual

A void making the screen crowded with HUD icons. Only show information that is relevant to what is happening. For example, the player doesn't need to know how much ammo they have if their gun is not drawn. They don't need to know how many health bars they have left if they're interacting with an NPC and are not in danger of being attacked. In other words, aim to make your HUD contextual and only show the most relevant information. Here's an example: Assassin's Creed: Syndicate shows HUD elements before the action is performed, and hides it while the action is performed.

## ![](_page_74_Picture_3.jpeg)

## **HUD ELEMENTS PRESENT**

## HUD ELEMENTS HIDDEN WHEN ACTION IS PERFORMED

# 92. Consider Implementing Aim Assist

Assist is a common feature in first-person shooters. It is meant to make aiming easier by making the targeting reticule gravitate towards the enemy. The Aim Assist algorithm makes an assumption as to what target the player is trying to aim at and snaps the reticule to that target. That can make aiming a lot easier and make the game feel better, especially when using a controller. Not every player likes using Aim Assist, so make it optional.

## ![](_page_75_Picture_1.jpeg)

Gears of War 5, like many other FPS games, allows Aim Assist mode.

#### 93. Allow for Skipping Cutscenes

Some players like watching long cutscenes, others want to get straight to the gameplay and don't care about the story. Luckily, in this case, it's easy to please everyone. There's absolutely no reason for you to force the player to watch a cutscene. When it comes to the story, try to convey the most important story elements through gameplay.

## ![](_page_76_Picture_1.jpeg)

Max Payne 3 is infamous for having unskippable cutscenes. While some of the cutscenes might have been used while the game was loading, there's no reason to keep the cutscenes unskippable after loading was done.

# 94. Allow for Skipping Credits

This one should be obvious, yet there are still games that don't allow the player to skip the credit roll. There's absolutely no reason to do this. I'm all for having a credit roll and honoring the people who participated in the creation of a game. After all, my game has a credit roll too and I appreciate it when You Tubers and Streamers take the time to listen to the music and reflect on the game's meaning while watching the names roll by. You've got to give the player a choice though. Some simply want to go back to the start menu, and that's OK too.


Aikei Corporation, Inc.
Aoshima Bunka Kyozai, Inc.
Aoyagiuirou Co., Ltd.
ASCII MEDIA WORKS, Inc.
Always Pleasant Amenity Hotel, Inc.
EAT & CO., Ltd.
Irios, Inc.
Ishimuramanseido Co., Ltd.
## ```

Yakuza 5 credit roll lasts over 10 minutes and there's no way to skip.

# 95. Consider Using Action Icons

Otherwise known as context-sensitive prompts, they allow the player to distinguish between interactive and non-interactive objects. Most commonly, when approaching an object, an icon would appear, which indicates that the object can be interacted with. It can be accompanied by text, indicating what the action is. Depending on the genre, it may or may not be a good idea. In my game DARQ, given how detailed the environment is, I felt it was important to give the player a hint when they approached an object that allowed for interaction.

## ![](_page_77_Picture_3.jpeg)

That little circle on the middle mirror indicates that the player can interact with this object. When the player approaches the mirror, the circle expands into an actual icon that indicates what type of interaction is available.

#### 96. Provide Immediate Feedback hatever the player is trying to do, try to provide some kind of feedback. No action should leave the world of the game unchanged. If the player tries to hit the wall, make some dust particles appear. If the player collects a power-up, indicate it with a sound and a special animation. Never leave the player wondering if something has happened or hasn't happened. Make sure to show the effect of the player's actions as clearly as possible.

## ![](_page_78_Picture_2.jpeg)

Picking up items in Stardew Valley is always accompanied by a satisfying sound and a quick animation. Not only does it feel clear, but it also feels rewarding and satisfying.

#### 97. Color Palette

Adobe, but there are other tools, such as Coolors.co, Colormind.io. They're all free.

## ![](_page_79_Picture_1.jpeg)

"GRIS" uses a variety of color palettes. Each level is breathtaking when it comes to the use of color.

#### 98. Reuse Your Game Systems

Don't spend time on making game systems that aren't utilized enough during gameplay. If climbing is a part of your character's skill set, you've got to come up with multiple ways of using it throughout the game. If a system is used just a couple of times, it's not worth having. Building a climbing system is a complicated task that involves a lot of coding, animation, and inverse kinematics. You have to justify the time spent on building a complex system by finding creative ways of reusing it repeatedly. The challenge lies in inventing new ways of using the system. You can use climbing to get to a high platform, descend to a lower platform, etc. You can also use it in the chase, escape, or stealth sequences. You can build entire levels around it, where climbing is combined with other skills, like shooting or jumping. That's just a few examples—you get the idea.

## ![](_page_80_Picture_1.jpeg)

Uncharted 4: climbing system (used in a variety of ways throughout the game)

# 99. Introduce Variety to Your Gameplay

To combat boredom that naturally results from reusing game mechanics and game assets (which you should do), you need to come up with ways to introduce variety to your gameplay. Avoid linear level design. Allow players to explore the environment. Create multiple paths to reach any goal. Have a degree of randomization in various aspects of your game, such as enemy encounters, loot, power-ups, and AI behavior. Variety can also be achieved by alternating between day and night, changing the weather, switching between interior and exterior, open and closed spaces, etc.

## ![](_page_81_Picture_1.jpeg)

Hitman series is known for offering the player the freedom to complete missions in various ways. It keeps things fresh, even though the game utilizes the same game mechanics repeatedly.

#### 100. Utilize the Power Of Customization

How do you make the player care about the protagonist or a group of heroes (whatever the genre dictates)? Allow the player to customize their in-game avatar. Let the player express themselves through the character that is about to become their alter ego. The very minimum you can do is to give the player the ability to name the character. This might not apply to all games, but if it does to yours, it's a great opportunity to establish an emotional connection between the player and the character. If possible, allow further customization, such as the choice of gender, clothing, face, hairstyle, etc.

## ![](_page_82_Picture_1.jpeg)

There's a reason the "Sims" franchise is so successful. It's a life simulator of your alter-ego: a character with a name, personality traits, fashion preferences, desires, and dreams. It couldn't feel more personal. While this level of customization doesn't make sense in most games, notice how powerful it is.

Can you imagine playing Sims if all characters had randomly generated names and appearances? Would you care for them as much?

#### What Next?

I hope you enjoyed the read and the tips I shared will help you make better games! I hope you don't mind if I tell you a little bit about my other book. I believe it can provide you a lot of value, so all I ask from you is a few minutes of your time, so I can share with you why it can be beneficial to you and your gamedev journey. If you haven't read it yet, you might enjoy GAMEDEV: 10 Steps to Making Your First Game Successful.

## ![](_page_83_Picture_3.jpeg)

## ![](_page_83_Picture_4.jpeg)

As a first-time developer with no prior experience in coding, modeling, texturing, animation, game design, etc., I managed to launch DARQ to both commercial success and critical acclaim. With \$0 spent on marketing, it was featured in major media outlets, such as IGN, Kotaku, PC Gamer,

**Game Spot, Forbes**, and hundreds of others. *DARQ* won numerous awards, such as *The Best Game of the MIX / PAX*, and received a user rating of 9 out of 10. DARQ was in the TOP 50 of the most wishlisted games on Steam before launch. It made it to the "Top Selling," "New and Popular," and "Featured and Recommended" tabs on Steam. Ultimately, it became #42 Most Shared PC Video Game of 2019 (Metacritic). In this book, I describe how I did it.

## ![](_page_84_Figure_2.jpeg)

In this book, I share with you what I've learned throughout the development of DARQ and beyond. If somebody had given me this book at the beginning of my journey, it would have saved me at least a year of development time. In addition, I made a lot of strategic mistakes during the development, so it sure would have been nice to have a guide like this to warn me of all the challenges that awaited me.

## ![](_page_85_Picture_1.jpeg)

#### What is the Book About?

In 270 pages of condensed knowledge, the book guides you through a step-by-step process of making a commercial game. It teaches you how to learn all the necessary skills and covers various aspects of game development:

- **✓** Mindset
- **✓** Preproduction
- ✓ Funding
- **✓** Business
- **√** Law
- **✓** Development
- ✓ Marketing & PR
- **✓** Publishing
- Distribution
- ✓ Pre-launch, launch, and post-launch strategies.

#### **Endorsements**

"Reading this book is the shortest route toward a solid understanding of how to make indie games, both from creative and business perspectives."

—Quentin De Beukelaer | Game Designer of Assassin's Creed IV: Black Flag, Assassin's Creed Unity, Ghost Recon Breakpoint

"There are many books on game development, but none of them address the mindset you need for success. Wlad's philosophy very much reminds me of what it was like in the early days of making games for Blizzard."

—Mark Kern | Former Team Lead for World of Warcraft, Producer of Diablo II and Starcraft.

"This book is a comprehensive guide to the business of game development."

—Bjørn Jacobsen | Sound Designer of Cyberpunk 2077, Hitman

"This book captures the process and creates a valuable resource for upcoming developers and creators alike."

—Piotr Babieno | CEO of Bloober Team, Layers of Fear, Blair Witch,
## Observer, The Medium

"This book is bursting with wisdom that will move you closer to realizing your dream."

-Richard Gale | 3-time Emmy-winning director

The foreword is written by Oscar, Pulitzer Prize, and 5-time Grammy Award-winning composer John Corigliano.

#### Collaborators

The book features advice by a number of industry professionals, including:

- Mark Kern (former lead for World of Warcraft, producer of Diablo II and Starcraft)
- Quentin De Beukelaer (Game Designer of Assassin's Creed Unity)
- Bjørn Jacobsen (Sound Designer of Cyberpunk 2077)
- Austin Wintory (Grammy-nominated composer of Journey)
- Wojciech Piejko (Lead Designer of "Observer" and The Medium)
- Barbara Kciuk (Narrative Designer of Blair Witch)
- Rami Ismail (Developer of Nuclear Throne and Super Crate Box)
- Dan Adelman (Biz Dev of Chasm and Axiom Verge)
- Scott Millard (Publisher, Managing Director at Feardemic, Former Managing Director at Bandai Namco
- Stephen Mc Arthur (Video Game Attorney)
- Toms Martin (Video Game Investor)

If you want to check out the book (paperback & e Book), you can get it here:

- United States (Amazon.com)
- Canada (Amazon.ca)
- <u>United Kingdom</u> (Amazon.co.uk)
- Germany and Eastern Europe (Amazon.de)
- France (Amazon.fr)
- Spain (Amazon.es)
- Italy (Amazon.it)
- Netherlands (Amazon.nl)
- <u>Australia</u> (Amazon.au)
- India (Amazon.in)
- <u>Japan</u> (Amazon.co.jp)
- Brazil (Amazon.com.br)
- Mexico (Amazon.mx)

#### Hope you enjoyed this e Book!

If you want to keep an eye on more free gamedev tips & tricks, connect with me on Twitter. I'm very responsive, so if you ever need feedback, advice, or help with your game, I'm here for you. Also, I often share behind-the-scenes of my own development process.

## Thank you for reading! Wlad Marhulets
