## JEFF CHARUAT

# Prince of Persia 2

## August 8, 1991

## © 1991 Jordan Mechner All rights reserved

### Author's Note July 30, 1991

I've tried to organize this document so that, when read straight through, it will give the reader an approximation of what it would be like to actually play the game. That is, I've presented the game's features in the order in which the player would normally encounter them.

At the end of the document are a number of appendices which discuss the more general features of the game such as the player controls, ability to save and restore games in progress, etc., to which the reader may wish to refer from time to time.

Please bear in mind that this document is meant not only to be read, but also to serve as the primary reference for the entire development team, including the programmer, animators, graphic artists, and sound designer. Therefore, it's a safe bet that almost everyone who reads it will find themselves skimming through a certain percentage of the material.

The current document supersedes all previous editions of the game design. Subsequent updates will come in the form of inserts and replacement pages.

## JM 7/30/91

## ![](_page_1_Picture_7.jpeg)

## ![](_page_2_Picture_1.jpeg)

The following chapters are missing from this version and will be inserted later:

## 2.4 Sound Effects: Level 1

## 4.2 Sound Effects: Level 2

## 16.3 Sound Effects: Levels 6 & 7

## 21.3 Sound Effects: Levels 8, 9, 10 & 11

## 23.4 Sound Effects: Level 12

## H Sound Effects Summary and Index

## J Music

Also, many portions of the game design are rather thinly illustrated. I'll try to add more storyboards and sketches later. The major things missing are the sketches for Background Set #3 (Temple) and the storyboard for the "Happy Ending" sequence.

## JM 8/8/91

#### Author's Note October 8, 1991

This is to summarize the changes to *Prince 2* since the August 8 version of the game design.

The hour figures referred to below represent *unpadded* estimates -- that is, they reflect the graphics department's actual estimates, *without* the "safety factor" of 1.25 by which I have multiplied the graphics time estimates for the entire product.

#### 1.0 Opening Title Sequence

Shot 1: The Prince is not shown entering the room. The shot ends while he is standing still.

Shot 2: A wider shot, so that it can use the same camera angle as Shot 4.

Shot 4: Instead of the curtains moving, the Prince merely steps forward from the shadows into the light.

Shot 6: The False Prince's line has been shortened to: "Seize him!" The False Prince's lips should move accordingly.

Shot 7: The Prince's line has been deleted.

Shot 8: Omitted.

Shot 9: Same angle as Shot 6.

Shots 10-13: Omitted.

Shot 14: A slightly wider shot than illustrated, so that the running guards & Prince are not so large in the frame.

Shot 15: False Prince's line deleted.

#### 2.0 Level 1: Palace Rooftops

Page 2.1.2: The courtyard screen, with the people looking up, has been deleted. When the Prince falls from the rooftops, he falls offscreen and we hear his scream and the sound of the impact below.

Page 2.1.5: The number of full-screen backgrounds has been reduced from 20 to 10. (Note: Although we have allowed 32 hours of graphics time for each full-screen background, we have allotted 50% of this amount for the 10 screens on this level, because of the large number of common elements among the different screens.)

#### 3.0 On the Ship

Shot 3: The mouse scurries over to within a few feet of the Prince and stops there, looking up at him.

Shot 4: Omitted.

Shot 6: Same angle as Shot 3. Alarmed by the lightning, the mouse runs up to the Prince and jumps into his pocket.

#### 4.0 Level 2: Desert Island

The "Beach #1" screen has been deleted, reducing the number of full-screen backgrounds from 4 to 3. The cliff that marks the far right end of the beach is visible on Beach #2 (the screen where the Prince is washed up).

There is no pressure plate atop the stone wall. The stepping stones rise automatically when you approach the quicksand.

#### 5.0 Jaffar's Tyranny

This non-interactive sequence is omitted in its entirety. In its place, a full-screen title card will be placed at the beginning of the Princess's Discovery sequence. The title card will inform the player that the Sultan has departed to fight the war, leaving the kingdom in the hands of his son-in-law the Prince, who promptly initiates a reign of terror that brings to mind the bad old days of Jaffar.

#### 6.0 Princess's Discovery

Shot 3: Instead of drawing out the mirror, the Princess draws aside her robe to reveal the mirror beneath.

#### 10.0 Level 3: Caverns

The pool room and flooding chamber have been deleted, along with all the associated water animations.

The number of full-screen backgrounds has been reduced to 2.

#### 11.0 Level 4: Caverns

Number of background screens reduced to 2.

#### 13.0 Level 5: Ruins

Number of background screens reduced to 1.

#### 14.0 Level 6: Ruins

Section 14.2: Shot 1 of the Second Dream sequence is omitted. The 3 shots of this sequence can be rendered as static full-screen pictures, perhaps with a sort of blur or haze about them to suggest that they are visions and are not really happening. For budgeting purposes, I have included these 3 screens in the total of 4 full-screen backgrounds for the level.

#### 15.0 Level 7: Ruins

The similarity among the 5 plateau screens (and especially between screens 2 & 4, which are virtually identical) is great enough that I feel safe in allowing 4 x 32, or 128 hours, for these 5 screens instead of the 5 x 32 which we originally allotted.

#### 18.0 Level 8: Temple

Page 18.1.5: Water pipe deleted, along with the flooding chambers.

Page 18.2.2: Number of backgrounds reduced from 3 to 2.

#### 19.0 Level 9: Temple

Page 19.1.2: Number of backgrounds reduced from 3 to 1.

#### 20.0 Level 10: Temple

Number of backgrounds reduced from 3 to 2.

#### 21.0 Level 11: Final Temple Level

Page 21.1.1 erratum: The inscription on the wall should read: "He who would steal the sacred flame must die."

Page 21.1.3: Number of backgrounds reduced from 6 to 5.

#### 23.0 Level 12: Battle with Jaffar

Page 23.1.2: Assassins are replaced by the normal palace guards from Level 1, perhaps with differently colored uniforms. They can fight better than normal guards, but do not have the ability to jump over the Prince.

Page 23.1.3 erratum: Second line from the bottom of the page should read: ". . . and all the empty spaces are really floorpieces."

Page 23.1.6: Number of full-screen backgrounds will be scaled down, and certain backgrounds rendered more simply, in order to bring the total amount of background graphics hours for this level down to $8 \times 32 = 256$ hours.

#### 24.0 Happy Ending

Note: Although this sequence has not yet been storyboarded, I have allotted 56 background graphics hours and 96 animation hours, using our time estimates for the other non-interactive sequences as a guide.

#### Appendix A: Player controls

Page A.4: No swimming.

#### Appendix B: Prince

All the animations relating to swimming have been cut, and certain other animations have been reduced, as follows:

## Turning while floating - omitted (save 6 frames)

## Throwing - reduced to 5 frames (save 5 frames)

Sinking below surface, treading water, shake dry - omitted (save 16 frames total)

## Disappear -reduced to 3 frames (save 3 frames)

These cuts reduce the total number of new Prince animation frames from 100 to 70.

#### Appendix E: Timing of NIS's

Note that the Jaffar's Tyranny sequence has been cut.

#### Appendix F: Types of Background Graphics

Page F.2: There will be no multi-plane scrolling.

#### **Contents**

| 1.0 | Openin | g Title | Sequ | ence |
|-----|--------|---------|------|------|
## |-----|--------|---------|------|------|

- 1.1 Storyboard: Part 1
- 1.2 Storyboard: Part 2

#### 2.0 Level 1: Palace Rooftops

- 2.1 Overview: Level 1
- 2.2 Animated Character: Palace Guard
- 2.3 Animated Character: White Mouse
- 2.4 Sound Effects: Level 1
- 3.0 Storyboard: On the Ship

#### 4.0 Level 2 (Mini-Level): Desert Island

- 4.1 Overview: Level 2
- 4.2 Sound Effects: Level 2
- 5.0 Storyboard: Jaffar's Tyranny
- 6.0 Storyboard: Princess's Discovery
- 7.0 DELETED
- 8.0 Storyboard: Tree Check
- 9.0 Storyboard: Tragic Ending
- 10.0 Level 3: Caverns
 - 10.1 Background Set 1: Caverns
 - 10.2 Overview: Level 3
 - 10.3 Animated Character: Fighting Skeleton

#### 11.0 Level 4: Caverns

- 11.1 Overview: Level 4
- 11.2 Sound Effects: Levels 3 & 4
- 12.0 Storyboard: Flying Carpet

#### 13.0 Level 5: Ruins

- 13.1 Background Set 2: Ruins
- 13.2 Overview: Level 5
- 13.3 Animated Character: Goblin Heads
- 13.4 Animated Character: Snake

#### 14.0 Level 6: Ruins

- 14.1 Overview: Level 6
- 14.2 Storyboard: Second Dream

## 15.0 DELETED 16.0 Level 7: Ruins

## 16.1 Overview: Level 7

## 16.2 Animated Character: Horse

## 16.3 Sound Effects: Levels 6 & 7

## 17.0 Storyboard: On Horseback

## 18.0 Level 8: First Temple Level

## 18.1 Background Set 3: Temple

## 18.2 Overview: Level 8

## 18.3 Animated Character: Bird-Headed Guard

## 19.0 Level 9: Second Temple Level

## 19.1 Overview: Level 9

## 19.2 Animated Character: Jinnee

## 20.0 Level 10: Third Temple Level

## 20.1 Overview: Level 10

## 20.2 Animated Character: Flaming Sword

## 21.0 Level 11: Final Temple Level

## 21.1 Overview: Level 11

## 21.2 Animated Character: Shadowman

## 21.3 Sound Effects: Levels 8, 9, 10 & 11

## 22.0 Storyboard: Flying Horse

## 23.0 Level 12: Battle with Jaffar

## 23.1 Overview: Level 12

## 23.2 Animated Character: Jaffar

## 23.3 Animated Character: Assassin

## 23.4 Sound Effects: Level 12

## 24.0 Storyboard: Happy Ending

## \_\_ APPENDICES

- A Player Controls
- B Animated Character: Prince
- C Life and Death
- D About Non-Interactive Sequences
- E Timing of Non-Interactive Sequences
- F Types of Background Graphics
- G Graphics Summary & Index
- H Sound Effects Summary & Index
- J Music

## 1.0 Opening Title Sequence

## 1.1 Opening Title Sequence, Part 1

## 1.2

## Opening Title Sequence, Part 2

## Storyboard: Opening Title Sequence (Part 1)

The events of *Prince 1* are summarized in a series of sepia-tone stills, accompanied by text, and separated by fades. The overall effect should be reminiscent of turning the pages of an illustrated storybook.

Since this sequence is composed entirely of still pictures, the artist should feel free to forget about the animation window, and to compose for the entire screen. The actual illustrations, however, should be small enough so as to create a balanced composition when combined with the accompanying text. One option would be to have the illustrations trail off into a blank page, like pencil sketches, rather than enclosing them in a hard rectangle. Also, the shape and position of the different illustrations need not be consistent from one screen to the next.

The text, of course, should be in a consistent size and font. The initial capital letter of each page could be quite ornate.

There are no sound effects, but this entire sequence should be underscored by MUSIC. We might consider using the epilogue music from *Prince 1*.

This sequence leads directly into Opening Title Sequence, Part 2.

## ![](_page_12_Picture_1.jpeg)

## ![](_page_12_Picture_3.jpeg)

## ![](_page_13_Picture_1.jpeg)

## ![](_page_13_Picture_3.jpeg)

## ![](_page_14_Picture_1.jpeg)

But the Princess's entreaties swayed the Sultan, and finally he
consented to the marriage. And the entire kingdom rejoiced and sang
the praises of the young couple.

## ![](_page_14_Picture_3.jpeg)

- As MUSIC ENDS, sepia-tone picture gradually turns to COLOR and comes to life. In the silence, stars twinkle, water shimmers, etc.
- 7. TITLE MUSIC HITS -- as we SUPERIMPOSE TITLE.

## Storyboard: Opening Title Sequence (Part 2)

Part 2 of the opening title sequence is fully animated, in color, with sound effects and music.

(Note: In the following storyboards, the False Prince is drawn to look somewhat distinct from the Prince. In the finished sequence, however, the False Prince and Prince should be like identical twins. The only difference between them should be in their clothing -- and, of course, their personalities.)

## ![](_page_16_Picture_1.jpeg)

## ![](_page_16_Picture_3.jpeg)

## ![](_page_17_Picture_1.jpeg)

... transforming his princely garments to rags.

## ![](_page_17_Picture_3.jpeg)

At the same moment, the doors swing open to reveal the magnificent throne room; we hear the ambient noise of a large hall filled with chattering people. The Princess and Sultan are seated on a dais at the end of the hall.

As soon as the doors are open, the crowd murmur stops. There is dead silence as the Prince enters the throne room.

## ![](_page_18_Picture_1.jpeg)

## ![](_page_18_Picture_3.jpeg)

## ![](_page_19_Picture_1.jpeg)

## ![](_page_19_Picture_3.jpeg)

## ![](_page_20_Picture_1.jpeg)

6. False Prince points at the Prince and speaks:

"Who let this beggar in here? Guards -- seize him!"

## ![](_page_20_Picture_4.jpeg)

7. Guards seize Prince.

## "Princess -- don't you know me?"

## ![](_page_21_Picture_1.jpeg)

8. Princess pleads with False Prince.

"Please don't hurt him! Can't you see he's just a poor, mad beggar?"

## ![](_page_21_Picture_4.jpeg)

9. False Prince speaks in close-up:

"Cut off his head and throw his body to the dogs."

## ![](_page_22_Picture_1.jpeg)

## ![](_page_22_Picture_3.jpeg)

## ![](_page_23_Picture_1.jpeg)

## ![](_page_23_Picture_3.jpeg)

## ![](_page_24_Picture_1.jpeg)

## ![](_page_24_Picture_3.jpeg)

## ![](_page_25_Picture_1.jpeg)

15. False Prince watches with satisfaction. The Princess, in contrast, appears upset.

## "Don't worry, my dear -- he won't get far."

## ![](_page_25_Picture_4.jpeg)

16. A flash of lightning shows us Jaffar standing in the False Prince's place . . .

## ![](_page_26_Picture_1.jpeg)

## 2.0 Level 1: Palace Rooftops

## 2.1 Overview: Level 1

## 2.2 Animated Character: Palace Guard

## 2.3 Sound Effects Summary: Level 1

## ![](_page_28_Picture_1.jpeg)

# Overview: Level 1 Palace Rooftops

Pursued by the Sultan's guards, the Prince must flee over the rooftops of the palace, and manages to escape by leaping onto a ship as it pulls away from the pier.

(Note: The following description, like all the level descriptions herein, is not meant as a blueprint; rather, it is intended to convey the *feel* of the level. The actual levels will be constructed by the level designer after the new opponents and any new traps have been implemented by the programmer.)

#### **Palace Rooftops**

The Prince jumps out of the stained-glass window of the throne room (shattering the glass) and lands on the roof of the palace. As he gets to his feet, player joystick/keyboard control takes over.

Run from right to left along the roof. The first guard is waiting for you. Draw your sword and fight him. He has three hit points and fights just like the guards in *Prince 1*.

When you succeed in killing the first guard, the difference between these guards and the *Prince 1* guards becomes apparent. A new guard *runs* onscreen and draws his sword. If you kill *this* guard, yet another one runs in to take his place; and so on. Thus, if you choose to hang around in one spot, you will be attacked by an endless succession of guards.

(For a more detailed explanation of the guards' behavior from a programming standpoint, see notes on "Guard Logic" and "Guard Corpse Disposal" below.)

These guards are all entering from a doorway a couple of screens over to the right. You can try to stem the tide of attacking guards by entering this doorway yourself, but you'll never get to see what's inside; the moment you enter, an unseen guard cuts you down on the spot and your body falls.

Anyway, there you are, fighting one guard after another. Eventually you realize that the guards will keep coming forever. So when the next guard comes charging at you, instead of fighting him, you turn and run away (to the left). He runs after you. Fortunately, a two-space gap is coming up. You jump it easily, landing on the rooftop below. Guess what? The guard comes after you -- jumping without your graceful style, perhaps, but with equal effectiveness -- and you have another fight on your hands.

If you succeed in dispatching this guard, a hail of arrows starts to rain down on you from the parapet above. You can't see the archers, but every arrow that finds its mark costs you one hit point, so you know they're up there. These are the basic ingredients of the level: Solid rooftops, empty space, unseen archers, and guards that keep coming at you. There are no gates, loose floors, pressure plates, or other traps. The progress of the level is essentially from right to left, with plenty of daring leaps and tense battles at the edge of the rooftops. If you miss your footing at any point, or a guard backs you off the edge, you plunge to your death in the courtyard below.

When you land in the courtyard, there are a few people standing around. They stand staring in surprise as your body splats on the ground -- then look up to see where you came from.

Eventually you find a place where you can climb down far enough to jump safely from the roof to the streets below. (There should be two such places, the first of which is actually a shortcut -- since it saves you from having to fight the last of the rooftop guards -- but also requires greater skill to negotiate.)

#### Guards' Jumping Ability

The guards can manage a two- or three-space running jump, but a four-space leap is too much for them. The guards don't know how to grab onto the ledge. (Maybe they didn't read the documentation.) So, when you escape a guard by means of a four-space leap, most times he will stop chasing you. Every now and then, however (say, about one time in four) he will attempt to replicate your four-space leap, and plunge to his death with a gratifying scream.

#### **Potions**

Unlike the dungeons, where there were plenty of strength potions lying around in plain sight, on the rooftops there are none. However, there is a way to get strength potions. When you are standing beside a dead guard, press the joystick down. This will cause you to crouch and -- surprise -- search the guard's body. Any potion that the guard was carrying will then appear on the ground next to the guard, and you can (if you wish) drink it by pressing Button A.

Not all of the guards carry potions, but many of them do. They can also carry poison potions, so be careful. And one guard, somewhere on the level, carries a *super life* potion which will boost you from three to four hit points.

#### Waterfront

You jump down from the rooftop and land in the street. There is no way to get back up. Almost immediately after you have landed, a guard jumps down, and engages you in battle. If you try to flee to the right, you will find another guard waiting for you. Sandwiched between two guards, you won't last long. In any case, there is a dead end off to the right, so this is not the way you want to go.

The more sensible course is to keep moving to the left. Guards will continue to enter from the right and chase you. They will keep coming indefinitely. Also, arrows are raining down on you from the parapet above, so you don't want to prolong this phase of the level too much.

When you knock a guard off the pier, a few moments later, you hear a *splash* as the guard hits the water far below, out of sight. (The water level is rather low at the moment.) Aside from giving the player a satisfying little thrill every time he dispatches a guard, this device is a convenient way for us to prevent guards' bodies from piling up in the street.

The pier ends at (A) (Fig. 1). If you jump off the pier (or fall off), you land in the water yourself, offscreen, with a great splash. *Press button to continue*.

The only escape is to take a running jump and land on the ship at (B) (Fig.2) as it is pulling away from the pier. If you just miss the ship, it is possible to grab onto it (by pressing the joystick button) just as you would grab onto a ledge, and climb on board. A guard will run up to the end of the pier, stand there for a moment taking a good look at you, then run off (presumably to inform Jaffar of your escape).

As the ship pulls away, we see a little white mouse (the Princess's friend) perched on the rail, waiting for you. This is a hint that you want to be on the boat. When you actually jump onto the boat, the mouse drops out of sight.

#### Technical notes

#### **Guard Logic**

Whereas in *Prince 1* there could be only two characters on the screen at any time, in *Prince 2* we would like to be able to have up to three -- that is, the player and two guards.

Guards have three modes of behavior -- running mode, waiting mode, and fighting mode. (In *Prince 1*, the guards had only two modes -- waiting mode and fighting mode.)

The level designer should be able to specify certain places as "guard generation points." A guard generation point may face either to the left or the right. If it faces to the right, this means that, at the appropriate moment, a new guard will be generated that will start running to the right. Ditto for the left.

In addition, the level designer should be able to place "waiting guards" in certain places, as in *Prince 1*. These guards, in "waiting mode," will just stand there and wait for the player to arrive -- until something triggers the guard to go into "running mode."

A guard in waiting mode will wait for the player to come within "en garde" range — that is, until they are both on the same stretch of floor, with no obstacles in between them, and within the specified en garde distance — and, at that point, the guard will draw his sword and attack the player.

Like the Prince 1 guards, once these guards are engaged in battle with the player, they will keep fighting until either the guard or the player is dead. If in the course of battle the player backs off a ledge and lands safely on the level below, the guard will follow him without leaving fighting mode. If, however, the player somehow escapes from the guard in the course of battle -- say, by turning tail and fleeing, or by otherwise doing something that the guard is unable to reproduce within fighting mode -- the guard will put away his own sword and go into running mode, chasing the player according to the guard's normal running logic.

When in running mode, a guard will continue running, crossing screen boundaries as it comes to them, until it encounters either the player or an obstacle.

- If the obstacle is a one, two, or three-space gap, the guard will simply jump over it and keep running.
- If the obstacle is a wall, or a gap of five or more spaces, or a gap with no way to jump it (for instance, if the floor on the opposite side of the gap is higher than the floor on this side), the guard will consider this to be an *impassable obstacle*. He will stop a good distance away from the obstacle (about five spaces) and go into waiting mode.
- If the obstacle is a four-space gap, most times the guard will treat it as an impassable obstacle. However, a certain percentage of the time, the guard will attempt to jump the gap, and of course fail, plunging to his death with a horrible scream. The likelihood that a given guard will attempt to jump a four-space gap could vary for different guards, but for now let's make it a consistent 25% probability for all the guards.

#### **Guard Corpse Disposal**

All this raises the problem of how we will dispose of all the dead guards. The first guard that is killed on a given screen will simply fall dead in a heap, like the Prince 1 guards. In Prince 1, a dead guard was still considered to be "active"; that is, the program had to continue keeping track of its coordinates and status, and it had to be redrawn every frame. In *Prince 2*, this won't be practical. It would be more efficient, when a guard drops dead in a certain spot, to "flag" that spot, noting the exact position, color, type, and orientation of the guard. Then the guard becomes part of the background and doesn't need to be redrawn unless the player exits and re-enters that screen. When the player enters a screen, the program must check to see if any spots have been flagged, and draw any necessary dead guards.

Even with this change, however, maintaining the dead guards' corpses involves a certain amount of overhead. We would like to keep the number of dead guards on one screen at one time down to a maximum of three -- more than that would look silly. Also, it would look strange to have two dead guards overlapping with each other. Therefore, we have a second option for disposing of dead guards. Instead of dropping in a heap, the guard can fall over the edge of the parapet, and plunge out of sight, and out of our hair.

When you kill a guard, the program makes the determination as to whether the guard should drop dead or fall off the edge. The first guard to die on a screen will almost always drop dead. ("Almost" means about 75% of the time -- a certain random element is desirable to keep the player from perceiving the artificialness of the pattern. The remaining 25% of the time, the guard will fall off the edge.) Subsequent guards -- that is, any guard that dies when there is already a corpse somewhere on the screen -- will have about a 50% chance of dropping dead, *if possible*. ("If possible" means, if the guard is not so close to an existing corpse that the two corpses would overlap in a way that would look silly.) When there are two dead guards on screen, the chance of dropping dead will drop to 25%; and when there are three dead guards, to zero. This means, in practice, that the player will have to kill a lot of guards on a single screen in order to accumulate three corpses.

#### **Guard's Potions**

The determination as to which guards carry which potions is made at the point of the guard's death. (Logically, it should be made at the point of the guard's generation, but what the player doesn't know doesn't hurt him. This way, the player won't be cheated of a potion if the guard happens to fall to his death, where he can't be searched.)

The distribution of the various potions will be decided after the new guards have been implemented, the level constructed, etc. The potion distribution will obviously have a considerable influence on the difficulty or ease of completing the level.

#### **Technical Summary**

#### Characters:

Prince
## Palace Guards

#### Backgrounds:

20 custom-drawn full-screen backgrounds, based on 3 key screens.

Key screens: 3
Rooftop
Courtyard
## Waterfront

## Variation screens: 17

(based on 3 key screens)

#### Special animated effects:

- Window shatters & glass shards fall
- Hail of arrows rained down on you from above
- Bystanders in courtyard look up
- Ship pulling away from pier

#### Special sound effects:

- Window shatters & pieces tinkle on the roof below
- Guard screams as he plunges to his death
- Splash when body lands in water

#### **Scheduling Notes**

Because this level consists entirely of custom-drawn full-screen backgrounds and does not use a modular background set, the task of drawing the backgrounds should in this case be saved for last.

Step 1: (Animator) Create the new palace guard animations.

Step 2: (Programmer) Install new guard animations. Implement new guard logic, including chasing & fighting behavior.

Step 3: (Level designer) Create the level map, using only solid blocks and solid floorpieces. Specify placement of guards and potions. Play-test and debug level, paying special attention to pacing and difficulty.

Step 4: (Background artist) Only when level map is final: Create a custom background screen for each of the screens in the level map.

## ![](_page_35_Picture_1.jpeg)

## ![](_page_35_Picture_2.jpeg)

## Animated Character: Palace Guard

#### **Character Description**

Essentially the old familiar palace guard from *Prince 1*, with new costumes and some new moves. Like the *Prince 1* guards, these guards' uniforms should come in at least 6 different colors. The costumes should be similar in style to the *Prince 1* guard costumes, but need not be identical.

Appears on level: 1.

Note: These same animations can be re-used virtually intact, simply by changing the guards' costumes and headdress, for the Bird-Headed Guards and Assassins.

#### **Estimated Total # of Frames**

## Existing frames: 23 New frames: 46

## Total frames: 79

#### **Animations**

Sword fighting
Run
Stop
Running jump & landing
Fall off edge
Drop dead
## Turn while fighting

#### Sword fighting.

All sword fighting frames taken directly from Prince 1.

Est. # of frames: 23.

Run.

A full run.

Est. # of frames: 8.

#### Stop.

From a full run: stop, draw sword, and assume fighting stance.

Est. # of frames: 8.

#### Running jump & landing.

Like the Prince, a guard can jump a three-space gap but not a four-space gap. Unlike the Prince, the guard doesn't know how to save himself by grabbing on to the edge.

Est. # of frames: 12.

#### Fall off edge.

Stagger to edge of parapet (back edge), and fall off.

Est. # of frames: 6.

#### Drop dead.

The guard is killed by the Prince's sword and lands dead on the floor. (We're so tired of looking at the *Prince 1* "drop dead" sequence, it's about time for a new one.)

Est. # of frames: 6.

#### Turn while fighting

Just a few in-between frames to smooth the guard's "about-face" while fighting. He begins by facing "en garde" to the left, and ends in the same "en garde" position, but facing to the right. In *Prince 1*, the guards flipped instantly from left to right without any in-between frames, but this always looked cheesy.

## Est. # of frames: 6

#### Reference materials

Prince 1 guard swordfighting animations; Prince's own running and jumping animations; additional video footage?

## ![](_page_38_Figure_2.jpeg)

## Animated Character: White Mouse

#### **Character Description**

The little white mouse from Prince 1.

Appears on level: 1.

#### **Estimated Total # of Frames**

## Existing frames: 3 New frames: 0 Total frames: 3

#### Reference materials

Prince 1 mouse.

## ![](_page_40_Picture_2.jpeg)

## ![](_page_42_Picture_1.jpeg)

- The ship sets out to sea.
- 2. Full-screen title card.

The Prince leaves Persia as he arrived -- a ragged stowaway on a merchant ship: known to no one, scorned by all.

## ![](_page_42_Picture_5.jpeg)

3. Prince sits on deck looking forlorn and miserable. White mouse runs up and jumps up onto the Prince's shoulder.

## ![](_page_43_Picture_1.jpeg)

4. Close-up of Prince asleep.

## ![](_page_43_Picture_3.jpeg)

Prince's dream: Queen speaks to Prince from a magnificent marble hall. The hall has a distinctive architectural look that is very different from the Sultan's palace.

## <sup>&</sup>quot;Come to me!"

## ![](_page_44_Picture_1.jpeg)

## ![](_page_44_Picture_3.jpeg)

## ![](_page_45_Picture_1.jpeg)

# Overview: Level 2 Desert Island (Mini-Level)

Awakening to find himself lying on the beach (SOUND of the surf rolling in), the Prince gets to his feet, at which point joystick control takes over.

You can run left or right along the beach. If you run to the right, eventually you will run out of beach; a sheer cliff blocks your further progress.

If, instead, you run to the left, you will pass a crumbling stone wall with an Arabic number carved into its surface. Further along, you will encounter a wide patch of quicksand. On the far side of the quicksand is a massive stone door which looks like it might be the entrance to a cavern. If you try to cross the quicksand, you are sucked down into its depths. (SOUND of the Prince being sucked into quicksand. It shouldn't be a big splash, more like a "plop.") *Press button to continue*.

It's possible to climb up onto the stone wall and run along the top of it. At the far left end of the stone wall is a tile which, if you step on it, triggers a subterranean mechanism that causes a series of stepping-stones to rise up from the quicksand. Each stone has an Arabic character carved into its surface. (Fig. 1)

By leaping from one stepping-stone to another, you can make it to the other side of the quicksand. You can stand on a given stepping-stone as long as you like; but the moment you step off the stone, it sinks beneath the quicksand without a trace.

When you reach the other side, all the remaining stepping stones sink at once. You find yourself stranded in front of the closed door, with all the stepping-stones gone and no way to get back to the other side. You've blown it -- suicide is the only way out.

If you succeed in raising the stepping stones, but die in the quicksand anyway, you will be presented with a full-screen title card (with appropriately solemn music):

Such is the fate of those who do not know the Book of Shahyizar.

This rather portentious message is accompanied by an illustration of a book open to the first page. The design on this page is identical to the design on the first page of the *Prince 2* user's manual. If the player still doesn't get it, there's always Tech Support.

The way to cross the stepping stones is to step on them in the correct order to spell out the magic word that will open the door. To learn the magic word, you must look up the appropriate page in the Book of Shayizar -- that is, the page of the user's manual corresponding to the number inscribed on the stone wall. (If the number written on the wall is 12, turn to page 12.) Every page contains four magic words, one in each corner, as part of the border design. Only one out of the four words is possible with a given set of stepping-stones. For example, if the stepping stones are C W H E L, and the four magic words on page 12 are RTH, CEP, WHT, and CHL, it should be obvious that the only word you can spell out with these stepping-stones is CHL. (Note: In this example, I've used the Roman alphabet, but the actual game will use Arabic -- well, pseudo-Arabic -- characters.)

When you have spelled out the last letter of the word, the stone door opens, and you can enter the cavern. (Should you make a mistake in spelling, the door will never open, and you will wind up in the quicksand.)

This copy protection system is, in a sense, rather forgiving, in that the player can keep trying again and again until he gets it right. His chance of guessing the right sequence of 3 out of the five stepping stones is 1 in 60 (I think).

#### **Technical Summary**

#### Characters:

## Prince

#### Backgrounds:

4 custom-drawn full-screen backgrounds:

## Beach #1 (far right end of beach)

## Beach #2 (place where you are washed up)

## Beach #3 (stone wall)

## Beach #4 (quicksand -- see Fig. 1)

#### Special animated effects:

- Stone door sliding open.
- Quicksand "plop" when Prince falls in.
- Stepping stones rising from quicksand.
- Stepping stones sinking beneath quicksand.
- Pressure plate atop wall sinks down when stepped on.

#### Special sound effects:

- Stone door sliding open.
- Quicksand "plop" when Prince falls in.
- Sound of waves rolling into shore.
- "Snick" when you step on pressure plate that activates mechanism.
- Hidden mechanism sound as stepping stones rise from quicksand.
- Little "plop" as each stepping stone sinks beneath quicksand.

## ![](_page_49_Picture_0.jpeg)

## ![](_page_49_Figure_2.jpeg)

### Storyboard: Jaffar's Tyranny

This sequence tells us what has been going on back in Persia while the player is having his various adventures. It is not tied to the completion of a specific level, but is presented after a certain amount of time has elapsed, independent of the player's activities. (For more information on the timing of this sequence and the other non-interactive sequences, see Appendix, "Timing of Non-Interactive Sequences.")

This sequence is preceded by a full-screen title card:

1. Meanwhile, back in Persia . . . the death of the Sultan plunges the kingdom into mourning.

## ![](_page_52_Picture_1.jpeg)

Princess and False Prince standing over the Sultan's body.
Princess is sobbing. False Prince puts his arm around her in a comforting gesture.

## FULL-SCREEN TITLE CARD

Seizing power, the new 'Prince' orders hundreds of the Sultan's 'enemies' arrested . . . and the streets run red with blood. The people soon begin to long for the days of the old tyrant, Jaffar.

## ![](_page_53_Picture_1.jpeg)

4. Princess staring out window. False Prince is standing in the room behind her.

"Why do you look so sad, my love? Is there no one I can put to death to cheer you up?"

## ![](_page_53_Picture_4.jpeg)

Princess looking out window at lush tree in garden.

## "I wish I were dead myself."

# Storyboard: Princess's Discovery

Like "Jaffar's Tyranny," this sequence is not tied to the completion of a specific level, but shows us what is happening back in Persia. (For more information, see Appendix E, "Timing of Non-Interactive Sequences.")

This sequence leads directly into sequence 8.0, "Tree Check."

## ![](_page_56_Picture_1.jpeg)

## ![](_page_56_Picture_3.jpeg)

## ![](_page_57_Picture_1.jpeg)

3. Close-up of the Princess's hand as she pulls a jewelled *mirror* out of her robe.

## ![](_page_57_Picture_3.jpeg)

(Princess's POV) The Prince asleep in bed. As the Princess's hand brings the mirror down into frame, we see her own face reflected in the mirror.

As the Princess starts to tilt the mirror . . .

## ![](_page_58_Picture_1.jpeg)

## ![](_page_58_Picture_3.jpeg)

## ![](_page_59_Picture_1.jpeg)

## ![](_page_59_Picture_3.jpeg)

## ![](_page_60_Picture_1.jpeg)

## ![](_page_60_Picture_3.jpeg)
