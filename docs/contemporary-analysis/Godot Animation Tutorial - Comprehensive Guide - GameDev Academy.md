---
title: "Godot Animation Tutorial - Comprehensive Guide - Game Dev Academy"
category: "contemporary-analysis"
---

[gamedevacademy.org](https://gamedevacademy.org/godot-animation-tutorial/)

# **Godot Animation Tutorial - Comprehensive Guide - Game Dev Academy**

## Daniel Buckley

14–17 minutes

## **You can access the full course here:** [DEVELOP A COMBAT](https://academy.zenva.com/product/godot-combat-system/) [SYSTEM IN GODOT 4](https://academy.zenva.com/product/godot-combat-system/)

Get ready to bring your game scenes to life with Godot animation magic – the ultimate technique for adding dynamic movement in your projects!

While animation can be a complex and intensive endeavor, even simple animations can enhance your game project's overall look and feel. Through this [Godot tutorial,](https://gamedevacademy.org/godot-4-tutorial/) we will be delving into Godot animation in the easiest way possible – by teaching you how to add and animate a sword for melee combat. The tutorial will guide you through the processes of state machine connection, equipping the player's ability to attack, and, most importantly, animating the player's sword.

This tutorial expects the reader to have a basic understanding of handling the [Godot](https://gamedevacademy.org/what-is-godot/) Engine. You can explore our full course, [Develop a Combat System in Godot 4,](https://academy.zenva.com/product/godot-combat-system/) which covers not just Godot animation, but a more thorough and in-depth study of combat systems.

Ready to equip your player with a shiny blade to cut the competition down – all while learning Godot animation? Let's start!

## Table of contents

- [Project Files](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Project_Files)
- [Animating the Player Sword](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Animating_the_Player_Sword)
- [Connecting the State Machine](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Connecting_the_State_Machine)
- [Setting Up Player's Ability to Attack](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Setting_Up_Players_Ability_to_Attack)
- [Creating the Equipable Object](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Creating_the_Equipable_Object)
- [Animating the Sword](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Animating_the_Sword)
- [Godot Animation Wrap-Up](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Godot_Animation_Wrap-Up)
- [Transcript Animating the Player Sword](about:reader?url=https%3A%2F%2Fgamedevacademy.org%2Fgodot-animation-tutorial%2F#Transcript_%E2%80%93_Animating_the_Player_Sword)

## **Project Files**

The Godot animation tutorial comes with some required project files. You can download a complete set of the assets used in the tutorial by clicking the link provided:

## Download Project Files Here

## ![](_page_1_Picture_16.jpeg)

## ![](_page_2_Picture_2.jpeg)

## FREE COURSES AT ZENVA

## LEARN GAME DEVELOPMENT, PYTHON AND MORE

#### [ACCESS FOR FREE](https://academy.zenva.com/product-category/free-courses/?utm_source=gamedevacademy&utm_medium=blogs&utm_campaign=zva_blog_incontent_top&utm_content=zva_blog_incontent_top_https://gamedevacademy.org/godot-animation-tutorial/)

## AVAILABLE FOR A LIMITED TIME ONLY

### **Animating the Player Sword**

To start this Godot animation tutorial, we will learn how to give the player the ability to damage the enemy in Godot Engine. We will also learn how to connect a state machine, create an equip controller, and animate a sword for the player. As already mentioned, this Godot animation tutorial assumes you have a basic understanding of Godot Engine.

#### **Connecting the State Machine**

The first step is to connect our state machine to the enemy's [navigation agent 3D](https://gamedevacademy.org/navigationagent3d-in-godot-complete-guide/) node. This can be done by selecting the navigation agent 3D node, going to the inspector, selecting the node panel, and then going to signals.

## ![](_page_3_Figure_2.jpeg)

From here, find 'Target reached', double click it and scroll down until you find state machine. Click pick, find the 'on target reached' [function,](https://gamedevacademy.org/what-are-functions/) and hit okay. Now, this function will be called when the enemy has reached the end of the path (and gives us something to attack with our sword after we get the Godot animation part done).

## ![](_page_3_Figure_4.jpeg)

## ![](_page_4_Picture_2.jpeg)

#### **Setting Up Player's Ability to Attack**

Next, we will set up the player's ability to attack so we can get a better feel of the effectiveness of Godot animation. This will be done through equipables. The player will be able to pick up an item, equip it in their inventory, and then use it as a weapon. For this tutorial, we will create a sword.

- Create a new script called 'Equip Controller' under combat.
- Create another script called 'Equip Object'.
- Create a third script called 'Equip Sword'.

## ![](_page_5_Picture_2.jpeg)

Next, open up the player scene and create a new empty node called 'equip controller'.

## ![](_page_5_Picture_4.jpeg)

Attach the equip controller script to this node. This script will manage which object the player has equipped at the current moment.

## ![](_page_5_Picture_6.jpeg)

#### **Creating the Equipable Object**

To create the equipable object (the sword), open up the camera and create a new child node called 'Equip origin'. Every object that we want the player to be able to hold in their hands will be set as a child of Equip origin. Create another node 3D called 'equip object sword' and another one called 'visual' as a child of this.

## ![](_page_6_Picture_2.jpeg)

Next, drag the sword model into the visual node and position it correctly.

## ![](_page_6_Picture_4.jpeg)

You can use the 'cinematic preview' option under 'perspective' to see how the sword looks from the camera's perspective. You'll definitely want to utilize this as you work on your Godot animation.

## ![](_page_6_Picture_6.jpeg)

## ![](_page_7_Picture_2.jpeg)

#### **Animating the Sword**

Now, we will [animate the sword using the Godot animation](https://gamedevacademy.org/animationplayer-in-godot-complete-guide/) [player](https://gamedevacademy.org/animationplayer-in-godot-complete-guide/) node, which we'll add as a child to the Equip Object\_Sword in the hierarchy.

## ![](_page_7_Picture_5.jpeg)

Create a new Godot animation called 'Attack'.

## ![](_page_7_Picture_7.jpeg)

Add tracks for 3D position and 3D rotation for the visual node.

## ![](_page_8_Picture_2.jpeg)

Then, insert initial keyframes which will contain the [Vector3](https://gamedevacademy.org/vector3-in-godot-complete-guide/) data for the object. You can do this by right-clicking and selecting "Insert Key". We want these to be at position 0 to start so our Godot animation knows where the object needs to be at the start of the animation.

## ![](_page_9_Picture_3.jpeg)

Now we need to animate it. Before we start, be aware that we can use the magnifying glass in the right corner to zoom closer to our timeline track. We can also use the value next to the stopwatch in the top left to change the duration of our Godot animation (we'll be leaving it at 1 second, however).

## ![](_page_9_Picture_5.jpeg)

To animate, we can move the playhead and adjust the position and rotation of the sword to create a swinging motion. Once you find a position/rotation you like, you'll need to insert a keyframe at the time marker so the animation can move between the two points over time. You can design the Godot animation however you want, but here's how ours looks:

Now if we press play, we should see the swing animation in action!

## **Godot Animation Wrap-Up**

Through this tutorial, we've successfully added a new dimension to our game by empowering the player with the ability to attack, equip a sword, and even use it with high precision and animated finesse. Leveraging the Godot animation player node for the sword gives you added power to make your game more interactive and exciting to play.

However, there is a lot more to explore and learn with Godot animation. Try animating more weapons, try animation characters, or create cinematic cutscenes that will wow you audience. All that's limiting you now is your own creativity. Of course, there's also more to learn about animation. For example, this [free tutorial below](https://www.youtube.com/watch?v=oa Er1rUN1_A) will help you further cement your understanding of the Godot Timeline!

The culmination of this tutorial comes with a promise of more exciting [game development](https://gamedevacademy.org/how-to-learn-coding-for-beginners/) lessons in the future. Zenva is well-equipped to take you forward in the remarkable journey of game development with courses and tutorials covering various genres and platforms. In particular, you can explore [Develop a](https://academy.zenva.com/product/godot-combat-system/) [Combat System in Godot 4](https://academy.zenva.com/product/godot-combat-system/) – a course which fully explores combat systems while making use of the concepts taught here.

We hope the tutorial was enlightening and a step forward in your game development journey. Keep [coding,](https://gamedevacademy.org/learn-to-code-what-is-coding/) keep learning, and keep creating breathtaking Godot games!

## **Did you come across any errors in this tutorial? Please let us know by completing** [this form](https://forms.zenva.com/zenvaptyltd/form/GDATutorial Issue Report Form/formperma/Nd WczhxqU_LGb2Lk6VH0b6T4DTD0CWcfw2pmX3-WWR4) **and we'll look into it!**

## ![](_page_11_Picture_3.jpeg)

## **Transcript – Animating the Player Sword**

Welcome back everyone. In this lesson, we are going to start actually giving the player the ability to damage the enemy. But one more thing we need to do, first of all with our enemy is to connect our state machine.

If we go to the state machine here and open up the script, you'll notice that we have this on target reached function. Now, this is a signal that we are connecting to the enemy's navigation agent 3D node here. So what I'm going to do is I'm going to select that navigation agent 3D node, go to the inspector, go up to the node panel, go to signals, and go down to Target reached. We're going to double click that. We're going to scroll down until we find state machine, click pick and we're going to find the on target reached function. Hit okay, connect, and there we go.

So now this function is going to be called when we have reached the end of the path of the enemy. So let's get started on setting up the player's ability to attack. Now this is going to be done through applicables.

So pretty much what the player is going to be able to do is pick up an item and then inside of their inventory they will be able to equip it. And this basically means that it'll appear in their hand and we can then use it as a weapon or pretty much whatever. These equip objects will be able to be anything. You could have a lantern, a torch, any sort of thing, a note, a map. But for us, we are going to have a weapon, a sort that we can swing.

So to begin, what we are going to do is we are going to create a number of different scripts. So here in combat, what we're going to do is we're going to write click and we're going to create a new script called Equip Controller. We are then going to create another script, and this one is going to be called Equip Object. We're going to create another script and this one is going to be called Equip Sword.

Now with these three scripts, what we're going to do is we are first of all going to open up the player, the player scene here, and we are going to create a brand new empty node. So add child node, and we are going to call this one equip controller. And on this node we are going to attach the equip controller script. This script is pretty much just going to manage which object or which item the player has equipped at that current moment. It'll manage equipping it, unequipping it, and communicating with the inventory that way.

So next what we need to do is actually create the equipable object that the player is going to hold, and this is going to be the sword. So what we're going to do is we're going to open up our camera here. We've already got one child object, but we're going to create another.

So we're going to right-click on camera, add child node, and we are going to create a node 3D. And this one is going to be called equip origin. So pretty much every object that we want the player to be able to hold in their hands, we will set as a child of equip origin. Think of this as just a container, a parent object.

Then as a child of this we'll create another node 3d, and we are going to call this one equip object sword. And then what we can do is we can create one more node 3d, and we are going to rename this one to be called visual.

Then we need to give it a model so we can actually see it. So inside of the combat models folder we have sword, and inside we have short sword dot obj. We'll drag that in, we'll find the short sword here, we'll make that a child of visual. And on the short sword we'll just set that position to be 0, 0, 0. We also have a short sword [material](https://gamedevacademy.org/material-in-godot-complete-guide/) which we can drag on like that. And then what we need to do is position the sword in the correct place. So I'm going to select the visual node here, and I'm just going to position this roughly where we think it might be.

Okay, compress E to go to the rotate tool. Now, when positioning this, you'll probably want to press play to see what it looks like. But the thing of that is it can take time and it's overall going to be a pretty slow process of actually figuring out what is the correct orientation for the sword.

So the way we can easily see what our camera is looking at is by going up to where here at the top here where we have view, and we'll change this to two viewports. Then we can click on where it says perspective in the bottom one and go down to where it says cinematic preview. And as you can see, we can then see a preview of our camera. There's sort of orangey, yellowish, green boxier.

So now with the visual selected, we can position our sword where we see fit, we might want to orientate it in the way that we want something like this. There we go.

So now when we press play, we have our sword in hand here. Now the next thing we want to do is actually animate this sword. We want this sword to be able to swing and hit stuff. So the way we're going to do this is by using the animation player node. So what we're going to do is we're going to right-click on the equip object sword, add child node, and we're going to search for animation player.

Now, this is Godot's animation system, which basically allows us to change the value of properties over time. So over time we can change our position, our rotation, our scale, even variables in scripts.

Now with the animation player as a child of equip object sword, we're going to go down and select it, and you should see the animation panel down here open up. Then what we're going to do is we're going to click on the animation button, go new, and we'll give the animation a name called Attack. Now here we are inside of the animation editor.

Pretty much what we do here is we have a timeline at the top and we can drag our mouse cursor to change the playhead value. So you can see if we click on this button right here or shortcut D, that will play the animation, we can press it again, it'll play the animation, but we don't really have anything at the moment that is animated.

So what we're going to do is we're going to click add track 3D position and select the visual node right here. Hit okay, and that is going to add that track down here on the timeline.

Now, what we need to do then is add a keyframe, and that is basically how the animation system works, is we add keyframes. And as the timeline progresses, it transitions from one key frame to the next, and each keyframe basically contains the state of the track. So for example, with this position track, each keyframe is going to contain a vector three representing the object's position. And if we have two different keyframes, it is going to transition between them, thus we can animate our object.

So I'm then going to right-click on the track down here and click insert key, and that is our first key added down there. Now what we can do is if we move the track forward a bit here by just clicking and dragging, we select the visual, let's then just have a little test here. We'll then move it forward like that. Then down the timeline, we can right-click again, insert key, and look what happens when we play it. Okay. And there we go. We can then bring it back to its original position by selecting those two first keyframes here, moving the play head over and rightclicking duplicate keys.

Now, this is what it looks like. We probably want to hold it there as well. So I'm going to copy and paste. I'm going to select these two keys When we're at the end, move forward a bit, I am then going to duplicate those keys and probably bring these ones back a bit here. So now this is what our animation looks like. Okay? Pretty simple, but you can of course go in and tweak that however you wish. So that is our animation done. We can save that.

And the next lesson, we are going to be looking at how we can actually then make this animation play as well as damaging the enemy. So thanks for watching, and I'll see you all then.

**Eager to continue? Discover our** [all-access plan](https://academy.zenva.com/product/subscription/) **featuring 300+ courses, guided learning pathways, monthly new releases, and more!**
