## ![](_page_0_Picture_0.jpeg)

# Unity 5.x By Example

An example based practical guide to get you up and running with Unity 5.x

## ![](_page_0_Picture_3.jpeg)

## ![](_page_1_Picture_0.jpeg)

## Table of Contents

## Chapter 1: The Coin Collection Game: Part 1

## Game Design

## 2

## Getting Started – Unity and Projects

## 2

## Projects and Project Folders

## 4

## Importing Assets

## 9

## Starting a Level

## 14

## Transformations and Navigation

## 20

## Scene Building

## 28

## Lighting and Sky

## 32

## Play Testing and the Game Tab

## Adding a Water Plane

## 46

## Adding a Coin to Collect

## 52

## Summary

## 54

Chapter 2: Project A: The Collection Game Continued 55

## Creating a Coin Material

## 56

## C# Scripting in Unity

## 66

## Counting Coins

## 70

## Comments on Code Sample 2-3

## 71

## Collecting Coins

| Comments on Code Sample 2-5 |
|-----------------------------|
| 79 |
| Coins and Prefabs |
| 79 |
| Timers and Count Downs |
| 83 |
| Comments on Code Sample 2-6 |
| 86 |
| Celebrations and Fireworks! |
| 89 |
| Comments on Code Sample 2-7 |
| 92 |
| Play Testing |
| 94 |
| Building |
| 97 |
| Summary |
## | 107 |

## **Table of Contents**

## Chapter 3: Project B: The Space Shooter

## 109

## Looking Ahead – The Completed Project

## 110

## Getting Started with a Space Shooter

## 111

## Creating a Player Object

## 118

## Player Input

## 125

## Confguring the Game Camera

## 128

## **Bounds Locking**

## 134

## Health

# Death and Particles 139 Enemies 148 Enemy Spawning 158 Summary

## **Chapter 4: Continuing the Space Shooter**

| Guns and Gun Turrets |
|-------------------------------------------|
| 164 |
| Ammo Prefabs |
| 166 |
| Ammo Spawning |
| 174 |
| User Controls |
| 185 |
| Scores and Scoring – UI and Text Objects |
| 190 |
| Working with Scores – Scripting with Text |
| 199 |
| Polishing |
| 202 |
## | Testing and Diagnosis |

## 207 Building 211 Summary 212

## Chapter 1

[ ii ]

The Coin Collection Game:

## Part 1

This chapter starts the rst project on our list, which will be a un collection game.

And remember, it doesn't matter i you've never used Unity beore. We'll go through everything necessary step by step. By the end o this chapter, you'll have pieced together a simple, but complete and unctional game. This is an important thing to achieve, because you'll get amiliar with a start to end game development workfow.

This chapter demonstrates:

- 1. Game Design
- 2. Projects and Folders
- 3. Asset Importing and Conguration
- 4. Level Design
- 5. Game Objects
- 6. Hierarchies

## [ 1 ]

## ![](_page_10_Picture_0.jpeg)

## The Coin Collection Game: Part 1

### Game Design

Let's make a coin collection game. Here, the player should control a character in rst-person mode, and they must wander the level, collecting all coins beore a time-limit runs out. I the timer runs out, the game is lost. And, i all coins are collected beore the timer expires, the game is won. The rst person controls will use the deault WASD keyboard setup, where W moves orward, A and S move let and right, and D walks backwards. Head movement is controlled using the mouse, and coins are collected by simply walking into them. See Figure 1.1, eaturing the coin collection game in action inside the Unity editor. The great benet in making this game is that it demonstrates all core Unity eatures together, and we don't need to rely on any external sotware or making assets, like textures, meshes and materials.

## Preparing for a coin collection game

The completed 'Collection Game' project, as discussed in this chapter and the next, can be ound in the book companion les, inside the

# Chapter01/Collection Game older. Getting Started – Unity and Projects

Every time you want to make a new Unity game, including coin collection games, you'll need to create a new Project. Generally speaking, Unity uses the term 'Project'

to mean a 'Game'. There are two main ways to make a new project, and it really doesn't matter which one you choose, because both end up in the same place. I

you're already inside the Unity interace, looking at an existing scene or level, you can select File > New Project rom the application menu. See Figure 1.2. It may ask i you want to save changes to the currently opened project, and you should choose either Yes or No, depending on what you need. Ater selecting the New Project option, Unity leads you to the project creation wizard.

## [ 2 ]

## ![](_page_11_Picture_7.jpeg)

## ![](_page_12_Picture_0.jpeg)

## Creating a new Project via the Main Menu

Alternatively, i you've just started Unity or the rst time, you'll probably begin at the Welcome dialog. See Figure 1.3. From here, you can access the New Project creation wizard by choosing the New Project button.

## The Unity Welcome Screen

## [ 3 ]

## ![](_page_13_Picture_5.jpeg)

## The Coin Collection Game: Part 1

On reaching the New Project creation wizard, Unity can generate a new project or you on the basis o some basic settings. Simply ll in the name o your project (Such as Collection Game), and select a older on your computer to contain the project les that will be generated automatically.

Finally, click the 3D Button to indicate that we're going to create a 3D game, as opposed to 2D, and then nally click the Create Project button to complete the project generation process. See Figure 1.4.

## Creating a new Project…

## Projects and Project Folders

Unity has now created a blank, new and empty project. This represents the starting point or any game development project and is the place where development begins.

The newly created project contains nothing initially: no meshes, textures or any other assets. You can conrm this by simply checking the Project Panel area at the bottom o the editor interace. This panel displays the complete contents o the Project Folder, which corresponds to an actual older on your local drive, created earlier by the project wizard. This older should be empty.

## [ 4 ]

## ![](_page_15_Picture_0.jpeg)

See Figure 1.5. This panel will later be populated with more items, all oổ which we can use to build a game.

The Unity Project Panel docked at the bottom of the interface...

## [5]

## ![](_page_16_Picture_4.jpeg)

## The Coin Collection Game: Part 1

Iổ your interổace looks radically diổ derent ổ rom Figure 1.5, in terms oổ its layout and arrangement, then you can reset the UI layout to its deổ aults. To do this, click the Layout drop-down menu ổ rom the top-right corner oổ the editor interőace, and choose Default.

## See gure 1.6.

## Switching to the Default interface layout

## [ 6 ]

## ![](_page_17_Picture_3.jpeg)

You can view the contents o your project older directly via either Windows Explorer or Mac Finder, by right-clicking the mouse inside the Project Panel rom the Unity editor to reveal a context menu, and rom there choose the option Show in Explorer (Windows) or Reveal in Finder (Mac). See Figure 1.7.

Displaying the Project Folder via the Project Panel

## [ 7 ]

## ![](_page_18_Picture_4.jpeg)

## The Coin Collection Game: Part 1

Clicking Show in Explorer displays the older contents inside the deault system le browser. See Figure 1.8. This view is useul or inspecting les, counting them, or backing up les. However, you shouldn't change the older contents manually this way. Don't move or delete les rom here, because doing so can corrupt your Unity project irretrievably. You should instead delete and move yes, where needed,

ổrom within the Project Panel inside the Unity editor. This way, Unity updates its meta-data as appropriate, ensuring your project continues to work properly.

Viewing the Project Panel from the OS file browser Viewing the Project Folder inside the OS yle browser will display additional yles and olders not visible inside the Project Panel: such as Library and Project Settings, and maybe a Temp older. Together, these are known as the Project Meta-data. This is not directly a part oo your project per se, but contains additional settings and preoences that Unity needs to work properly. These olders and their yles should not be edited or changed.

#### [8]

## ![](_page_19_Picture_4.jpeg)

## **Importing Assets**

Assets are the raw materials of games; the building blocks of om which they're made. Assets include: Meshes (or 3D models) like characters, props, trees, houses and more; Textures, which are image yles like JPEG sand PNGs. These determine how the suroace of a Mesh should look; and Music and Sound eooets to enhance the realism and atmosphere of your game. And ynally Scenes, which are 3D spaces or worlds where meshes, textures, sounds and music live, exist and work together holistically as part of a single system. Thus, games cannot exist without assets- they would otherwise look completely empty and lioeless. For this reason, we'll need assets to make the coin collection game we're working towards. Aoter all, we'll need an environment to walk around and coins to collect!

Unity, however, is a 'game engine' and not an 'asset creation' program. That means assets, like characters and props, are typically made urst by artists in external, third-party sootware. From here, they are exported and transoerred ready-made into Unity, and Unity is responsible only oor bringing those assets to lioe into a coherent game that can be played. Third party asset creation programs include: Blender, Maya, or 3DS Max oor making 3D models; Photoshop or GIMP oor creating textures, and Audacity oor generating audio. There're plenty oo other options too. The details oo these programs is beyond the scope oổ this book. In any case, Unity assumes you already have assets ready to go, to import ổor building a game. For the coin collection game, we'll use assets that ship with Unity. So let's import these into our project.

To do this, select Assets > Import Package rom the application menu. Then select Characters, Particle Systems, Environment, and Prototyping. See Figure 1.9.

## Importing assets via the Import Package menu

## [ 9 ]

## ![](_page_21_Picture_3.jpeg)

## The Coin Collection Game: Part 1

Each time you import a package rom the menu, you'll be presented with an Import dialog. Simply leave all settings at their deaults, and click Import. See Figure 1.10.

## Importing assets via the Import Package menu

## [ 10 ]

## ![](_page_22_Figure_1.jpeg)

By deault, Unity decompresses all les rom the Package (a library o assets) into the current project. Ater import, lots o dierent assets and data will have been added to the Project, ready or use. These les are copies o the originals. So any changes made to the imported les will not aect or invalidate the originals, which Unity maintains internally. The les include models, sounds, textures and more. These are listed inside the Unity Editor rom the Project Panel. See the ollowing screenshot.

## Browsing imported assets from the Project Panel

### [ 11 ]

| · Aller | A Pro-New York | van de la | es 110 |
|------------------------|----------------------|-----------------|---------|
| | WNLOAD INS | and the same of | |
| lease notes. System re | guirements Unity,5 u | iograde guide | |
| 24 AUG 2015 | 5.1.3 | 636KB | WINDOWS |
| FOR WINDOWS T | | | |
| Unity Editor (64 bit) | | _ | |
| Sansy Editor (32-bit) | | | |
| Built in shaders | | | |
| Standard Amels (A. | | | |
| | | | |
## | Example Project | | | |

## The Coin Collection Game: Part 1

When selecting Assets > Import rom the application menu, i you don't see all, or any, asset packages listed, you can download and install them separately rom the Unity website at https://unity3d.com/From the

Downloads page, choose the option Additional Downloads, and then select the Standard Assets package. See Figure 1.12.

### Downloading the Standard Assets Package

The imported assets don't exist yet in our game. They don't appear on screen, and they won't 'do anything', yet! Rather, they're simply added to the Project Panel, which behaves as a library or repository o assets, rom which we can pick and choose to build up a game. The assets imported thus ar are built-into Unity and we'll be continually using them in subsequent sections to make a unctional coin collection game. To get more inormation about each asset, you can select the asset by clicking it with the mouse, and asset-specic details will be shown on the right-hand side o the Unity Editor; inside the Object Inspector. The Object Inspector is a property sheet editor that appears on the right-hand side o the interace. It is context sensitive and always changes to display properties or the selected object. See Figure 1.13.

## [ 12 ]

## ![](_page_25_Picture_0.jpeg)

The Object Inspector displays all properties for the currently selected object

## [ 13 ]

## ![](_page_26_Picture_3.jpeg)

## The Coin Collection Game: Part 1

### Starting a Level

We've now created a Unity project and imported a large library o assets via the Unity standard asset packages, including architectural meshes or walls, foors, ceilings and stairs. This means we're now ready to build our rst level using those assets! Remember, in Unity, a Scene means a Level. The word 'Scene' and 'Level'

can be used interchangeably here. It reoers simply to a 3D space. That is, the space-time oổ the game world; the place where 'things' exist. Since all games happen in space and time, we'll thereoer need a scene of the coin collection game. To create a new Scene, select File > New Scene of the application menu, or press Ctrl + N on the keyboard. When you do this, a new and empty scene is created. You can see a visualization or preview of the scene via the Scene tab, which occupies the largest part of the Unity interoace. See Figure 1.14.

## The Scene tab displays a preview of a 3D world

#### [ 14 ]

## ![](_page_27_Figure_3.jpeg)

As shown in Figure 1.14, other tabs beside Scene are visible and available in Unity. These include: a Game tab, and an Animator tab; and, in some cases, there could be more as well. For now, we can ignore all tabs except Scene. The Scene tab is designed or quick and easy previewing o a level during its construction.

Each new scene begins empty; well, almost empty. By deault, each new scene begins with two objects. Specically: a Light, to illuminate any other objects that are added, and a Camera to display and render the contents o the scene rom a specic vantage point. You can view a complete list o all objects existing in the scene by using the Hierarchy Panel, which is docked to the let-side o the Unity interace. See Figure 1.15. This panel displays the name o every Game Object in the scene. In Unity, the word 'Game Object' simply reers to a single, independent and unique 'thing' that lives within the scene, whether visible or not: meshes, lights, cameras, props and more. Thus, the Hierarchy Panel tells us about everything in the scene.

## The Scene tab displays a preview of a 3D world

## [ 15 ]

## ![](_page_29_Picture_0.jpeg)

## The Coin Collection Game: Part 1

You can even select objects in the scene by clicking on their name inside the Hierarchy Panel

Next, let's add a foor to the scene. Ater all, the player needs something to stand on!

We could build a foor mesh rom scratch using third party modelling sotware, like Maya, 3DS Max or Blender. However, the Unity Standard Asset packages, which were imported earlier, contain foor meshes we can use. This is very convenient.

These meshes are part o the Prototyping package. To access them via the Project Panel, open the Standard Assets older by double-clicking it, and then access the Prototyping

> Prefabs older. From here, you can select objects and preview them rom the Object Inspector. See Figure 1.16.

You could also quickly add a foor to the scene by choosing Game Object > 3D Object > Plane rom the application menu. But this adds just a dull, grey foor, which isn't very interesting. O course, you could change its appearance. As we'll see later, Unity lets you do that. But, or this tutorial, we'll use a specically modelled foor mesh via the Standard Assets Package, rom the Project Panel…

The Standard Assets/Protyping Package contains many meshes for quick scene building

### [ 16 ]

## ![](_page_30_Picture_4.jpeg)

The mesh named Floor Prototype64x01x64 (As shown in Figure 1.16) is suitable as a foor. To add this mesh to the scene, simply drag and drop the object rom the Project Panel into the Scene view, and then release the mouse. See Figure 1.17. When you do this, notice how the Scene view changes to display the newly added mesh within 3D

space, and the mesh name also appears as a listing in the Hierarchy Panel.

Dragging and Dropping mesh assets from the Project Panel to the Scene view will add them to the scene

### [ 17 ]

## ![](_page_31_Figure_5.jpeg)

## The Coin Collection Game: Part 1

The foor mesh asset rom the Project Panel has now been instantiated as a Game Object in the scene. This means a copy or clone o the mesh asset, based on the original in the Project Panel, has been added to the scene as a separate Game Object. The Instance (or Game Object) o the foor inside the scene still Depends on the foor asset in the Project Panel, however. Although, the Asset does not depend on the Instance. This means that, by deleting the foor in the scene, you will not delete the asset. But, i you delete the asset, you will delete or invalidate the Game Object. You can also create more foors in the Scene, i you want, by dragging and dropping the foor asset many times, rom the Project Panel to the scene view. Each time a new instance o the foor is created in the scene as a separate and unique game object, although all the added instances will still depend on the single foor asset in the Project Panel. See Figure 1.18.

Adding multiple instances of the floor mesh to the scene…

## [ 18 ]

## ![](_page_33_Figure_0.jpeg)

We don't actually need the duplicate foor pieces, however. So let's delete them.

Just click the duplicates in the Scene view and then press Delete on the keyboard to remove them. Remember, you can also select and delete objects by clicking their name inside the hierarchy panel and pressing Delete. Either way, this leaves us with a single foor piece and a solid start to building our scene. One remaining problem, though, concerns the foor and its name. By looking careully in the Hierarchy panel, we see the foor name is Floor Prototype64x01x64. This name is long, obtuse and unwieldy. We should change it to something more manageable and meaningul.

This is not technically essential but is good practice to keep our work clean and organized. To rename an object, rst select it and then enter a new name into the name eld, inside the Object Inspector. I'll rename it to World Floor See Figure 1.19.

## Renaming the floor mesh

## [ 19 ]

## ![](_page_35_Picture_0.jpeg)

## The Coin Collection Game: Part 1

#### Transformations and Navigation

A scene with a foor mesh has been established, but this alone is uninteresting. We need to add more, such as buildings, stairs, columns, and perhaps more foor pieces.

Otherwise, they'd be no world or the player to explore. Beore building upon what we've got however, let's make sure the existing foor piece is centered at the world origin. Every point and location within a scene is uniquely identied by a Coordinate, measured as an (X, Y, Z) oset rom the world center (Origin). The current position or the selected object is always visible rom the Object Inspector. In act, the position, rotation and scale o an object are grouped together under a category (Component) called Transform. The Position indicates how ar an object should be moved in three axes rom the world center. The Rotation indicates how much an object should be turned or rotated around its central axes. And Scale indicates how much an object should be shrunk or expanded to smaller or larger sizes. A deault Scale o 1 means an object should appear at normal size; 2 means twice the size, and 0.5 means hal the size, and so on. Together, the Position, Rotation and Scale o an object constitute its Transormation. To change the position o the selected object, you can simply type new values into the X, Y and Z elds or Position. To move an object to the world center, simply enter (0, 0, and 0). As shown in Figure 1.20.

#### Centering an Object to the World Origin

#### [ 20 ]

## ![](_page_36_Picture_3.jpeg)

Setting the position oổ an object, as we've done here, by typing numerical values is acceptable and appropriate ổor specióying exact positions. However, it's oổten more intuitive to move objects using mouse-based controls. To do that, let's add a second foor piece and position it away ổrom the urst instance. Drag and drop a foor piece

ổrom the Project Panel into the Scene to create a second foor Game Object. Then click the new foor piece to select it, and then switch to the Translate tool. To do that, press W on the keyboard, or click the Translate tool icon ổrom the toolbar, at the top oổ the Editor interőace. The Translate tool allows you to reposition objects in the scene. See Figure 1.21.

## Accessing the Translate Tool

#### [21]

## ![](_page_37_Picture_5.jpeg)

## The Coin Collection Game: Part 1

When the Translate tool is active and an object is selected, a Gizmo appears centered on the Object. The Translate Gizmo appears as three colored and perpendicular axes; Red, Green and Blue corresponding to X, Y, and Z respectively. To move an object, hover your cursor over one o the three axes, and then click and hold the mouse while moving it to slide the object in that direction. You can repeat this process as oten as needed to ensure your objects are positioned where you need them to be. Use the Translate tool to move the second foor piece away rom the rst. See Figure 1.22.

Translate an object using the Translate Gizmo You can also Rotate and Scale Objects using the mouse, as with Translate. Press E

to access the Rotate tool, or R to access the Scale tool; or you can activate these tools using their tool bar icons respectively rom the top o the Editor. When these tools are activated, a Gizmo appears centered on the object, and you can click and drag the mouse over each specic axis to rotate or scale objects as needed. See Figure 1.23.

## [ 22 ]

## ![](_page_39_Picture_0.jpeg)

## Accessing the Rotate and Scale tools…

Being able to Translate, Rotate and Scale objects quickly through mouse and keyboard combinations is very important when working inside Unity. For this reason, make using the keyboard shortcuts a habit, as opposed to accessing the tools continually rom the tool bar. However, in addition to moving, rotating and scaling objects, you'll requently need to move around yoursel inside the Scene view, to see the world rom dierent positions, angles and perspectives. That is, you'll requently need to reposition the scene preview camera inside the world. You'll want to zoom in and zoom out o the world to get a better view o objects, and to change your viewing angle to see how objects align and t together properly. To do this, you'll need to make extensive use o both the keyboard and mouse together.

### [ 23 ]

## ![](_page_40_Picture_4.jpeg)

## ![](_page_41_Picture_0.jpeg)

## The Coin Collection Game: Part 1

To Zoom closer or urther rom the object you're looking at, simply scroll the mouse wheel up or down. Up zooms in, and Down zooms out. See Figure 1.24.

### Zooming in and out…

To Pan the Scene view let or right, or up or down, hold down the middle mouse button while moving the mouse in the appropriate direction. Alternatively, you can access the Pan tool rom the application tool bar (or Press Q on the keyboard) and then simply click and drag inside the Scene view while the tool is active. Pan does not zoom in or out; it simply slides the camera let or right, or up or down.

## Accessing the Pan Tool

## [ 24 ]

## ![](_page_42_Picture_0.jpeg)

Sometimes while building levels you'll lose sight entirely oổ the object you need. For example, your viewport camera could be ổocusing on a completely diổoerent place orom the object you really want to click or see. In this case, you'll ooten want to shiot the viewport camera automatically, to oocus on that speciuc object. Speciucally, you'll want to reposition and rotate the viewport as necessary, to bring a desired object to the center oo view. To do this automatically, select the object to Focus on (or Frame) by clicking its name orom the Hierarchy Panel. And then press the F key on the keyboard.

Alternatively, you can double click its name in the Hierarchy Panel. See Figure 1.26.

## Framing a selected object

## [ 25 ]

## ![](_page_44_Picture_0.jpeg)

## The Coin Collection Game: Part 1

Ater Framing an Object, you'll oten want to rotate around it, to quickly and easily view it rom all important angles. To achieve this, hold down the Alt key on the keyboard while clicking and dragging the mouse to rotate the view. See Figure 1.27.

## Rotating around the Framed Object

Lastly, it's helpul to navigate a level in the Scene view using First Person Controls.

That is, controls which mimic how rst-person games are played. This helps you experience the scene a more personal and immersive level. To do this, hold down the right-mouse button, and use the WASD keys on the keyboard to control orwards, backwards and strang movement. And movement o the mouse controls head orientation. You can also hold down the Shift key while moving to increase movement speed. See Figure 1.28.

## [ 26 ]

## ![](_page_45_Picture_2.jpeg)

## Using First Person Controls…

The great thing about learning the versatile Transormation and Navigation controls is that, on understanding them, you can move and orient practically any object in any way, and you can move and view the world rom almost any position and angle.

Being able to do this is critically important or building quality levels quickly. All o these controls, along with some others we'll soon see, will be used requently throughout this book or creating scenes and or working within Unity generally.

### [ 27 ]

## ![](_page_46_Picture_5.jpeg)

## The Coin Collection Game: Part 1

## Scene Building

Now we've seen how to transorm objects and navigate the scene viewport successully, let's proceed to complete our rst level or the coin collection game.

Let's separate the two foor meshes apart in space, leaving a gap between them that we'll x by creating a bridge, which the player will be able to cross, moving between the foor spaces like islands. We can use the Translate tool (W) to move objects around. See Figure 1.29.

## Separating the floor meshes into islands

I you want to create more foor objects, you can use the method we've seen already by dragging and dropping the mesh asset in the Project Panel into the Scene Viewport. Or, alternatively, you can duplicate the selected object in the viewport by pressing Ctrl + D on the keyboard.

Both methods produce the same result.

## [ 28 ]

## ![](_page_48_Figure_0.jpeg)

Next we'll add some props and obstacles to the scene. Drag and drop some house objects onto the foor. The house object (House Prototype16x16x24) is ound inside the older Assets > Standard Assets > Prototyping > Prefabs. See Figure 1.30.

## Adding house props to the scene

On dragging and dropping the house into the scene, it may align to the foor nicely with the bottom against the foor, or it may not align like that. I it does, that's splendid and great luck! But we shouldn't rely on luck every time, because we're proessional game developers! Thankully, we can make any two mesh objects align easily inside Unity, by using Vertex Snapping. This eature works by orcing two objects into positional alignment within the scene, by overlapping their vertices at a specic and common point.

## [ 29 ]

## ![](_page_50_Picture_0.jpeg)

## The Coin Collection Game: Part 1

For example, consider Figure 1.31. Here, a house object hovers awkwardly above the foor, and we naturally want it to align level with the foor, and perhaps over to the foor corner. To achieve this, start by selecting the house object (click it, or select it rom the Hierarchy Panel). The object to be selected is the one that should move to align, and not the destination (which is the foor), which should remain in place.

Misaligned objects can be snapped into place with Vertex Snapping…

Next, activate the Translate tool (W) and hold down the V key, or Vertex Snapping.

With V held down, move the cursor around and see how the Gizmo cursor sticks to the nearest vertex o the selected mesh. See Figure 1.32. Unity is asking you to pick a source vertex or snapping.

## ![](_page_51_Picture_0.jpeg)

## ![](_page_51_Picture_1.jpeg)

## Hold down V to activate Vertex Snapping

With V held down, move the cursor to the bottom-corner o the house, and then click and drag rom the corner to the foor mesh corner. The house will then snap align to the foor, corner to corner. When aligned this way, release the V key and now the two meshes are aligned exactly at the vertices. See Figure 1.33.

## Align together two meshes by vertices

## [ 31 ]

## ![](_page_52_Picture_5.jpeg)

## The Coin Collection Game: Part 1

Now you can assemble a complete scene using the mesh assets included in the Prototyping package. Drag and drop props into the scene, and by using

Translate, Rotate and Scale you can reposition, re-align and rotate those objects; and by using Vertex Snapping you can align them wherever you need. Give this some practice.

See Figure 1.34 oor the scene arrangement I made using only these tools and assets.

Building a complete level...

#### Lighting and Sky

The basic level has been created, in terms oổ architectural models and layout; and this was achieved using only a ổew mesh assets and some basic tools. Nevertheless, these tools are powerổul and oổ er us a multitude oổ combinations and options ổor creating great variety and believability in game worlds. One important ingredient is missing ổor us, however. That ingredient is Lighting. You'll notice ổrom Figure 1.34 that everything looks relatively fat, with no highlights, shadows or light or dark areas. This is because scene lighting is not properly conugured ổor best results, even though we already have a light in the scene, which was created initially by deổ ault.

## [ 32 ]

## ![](_page_54_Picture_0.jpeg)

Let's start setting the scene ổor the coin collection game by enabling the Sky, iổ it's not already enabled. To do that, click the Extras drop-down menu ổrom the top toolbar in the Scene viewport. From the context menu, select Skybox to enable Skybox viewing. A Skybox simply reổers to a large cube that surrounds the whole scene. Each interior side has a continuous texture (image) applied to simulate the appearance oổ a surrounding sky. For this reason, clicking the Skybox option displays a deổault sky inside the Scene viewport. See Figure 1.35.

Enabling the sky...

#### [ 33 ]

## ![](_page_55_Picture_4.jpeg)

## The Coin Collection Game: Part 1

Now, although the Skybox is now enabled and the scene looks better than before, it's still not being illuminated properly- the objects lack shadows and highlights. To ux this, be sure that Lighting is enabled for the scene, by toggling on the Lighting icon at the top of the Scene viewport. See Figure 1.36. This setting is for display purposes only. It only affects whether lighting effects are shown in the Scene viewport, and not whether lighting is truly enabled for the unal game.

## Enabling Scene Lighting inside the Scene Viewport

#### [34]

## ![](_page_56_Picture_3.jpeg)

Enabling Lighting display ổor the viewport will result in some diổ derences to the scene appearance, and, again, the scene should look better than be ổore. You can conurm that scene lighting is taking a ổ dect by selecting the Directional Light ổ rom the Hierarchy Panel and rotating it. Doing this controls the time oổ day; rotating the light cycles between day and night, changing the light intensity and mood.

This changes how models are rendered. See Figure 1.37.

Rotating the Scene Directional Light changes the time of day

## [ 35 ]

## ![](_page_57_Figure_5.jpeg)

## The Coin Collection Game: Part 1

Let's undo any rotations to the directional light, by pressing Ctrl + Z on the keyboard. To prepare oor unal and optimal lighting, all non-movable objects in the scene (like walls, foors, chairs, tables, ceilings, grass, hills, towers and more) should be marked as Static. This signifies to Unity that the objects will never move, no matter what happens during gameplay. By marking non-movable objects ahead of time, you can help Unity optimize the way it renders and lights a scene. To mark objects as static, simply select all non-movable objects (which includes practically the entire level so oar), and then enable the Static check box via the Object Inspector.

Note: you don't need to enable the Static setting of each object separately. Rather, by holding down the Shift key while selecting objects, you can select multiple objects together, allowing you to adjust their properties as a batch through the Object Inspector. See Figure 1.38.

Enabling the Static option for multiple non-movable Objects improves lighting and performance When you enable the Static check box oor geometry, Unity auto-calculates scene lighting in the background- eooets such as shadows, indirect-illumination and more.

It generates a batch oổ data called the GI Cache, ổeaturing Light Propagation Paths, which instructs Unity how light rays should bounce and move around the scene to achieve greater realism. Even so, enabling the static check box as we've done, still won't produce cast shadows ổor objects, and this seriously detracts ổrom realism.

This happens because most mesh objects have the Cast Shadows option disabled.

## [ 36 ]

## ![](_page_59_Figure_0.jpeg)

To ux this, select all meshes in the scene. Then, ổrom the Object Inspector, click the Cast Shadows check box ổrom the Mesh Renderer component, and choose the option On ổrom the context menu. When you do this, all mesh objects should be casting shadows. See Figure 1.39.

Enabling Cast Shadows from the Mesh Renderer Component And voila! Your meshes now cast shadows. Splendid work: in reaching this ổar you've created a new project, populated a scene with meshes, and successổully illuminated them with directional lighting. That's excellent. But, it'd be even better iổ

we could explore our environment in First Person mode. And we'll see how next.

#### [ 37 ]

## ![](_page_60_Picture_5.jpeg)

## ![](_page_61_Figure_0.jpeg)

## The Coin Collection Game: Part 1

## Play Testing and the Game Tab

The environment created thus ar or the coin collection game has been assembled using only mesh assets included with the native Prototyping Package. My environment, as shown in Figure 1.40, eatures two main foor islands with houses, and the islands themselves are connected together by a stepping stone bridge. Your version may be slightly dierent, and that's ne.

The Scene created so far contains two island areas…

Over all, the scene is good work. It's well worth saving. To save the scene, press Ctrl+S on the keyboard, or else choose File > Save Scene rom the application menu.

See Figure 1.41. I you're saving the scene or rst time, Unity displays a pop-up Save dialog, prompting you to name the scene descriptively (I called it: Level\_01).

## Saving a Scene...

## [ 38 ]

## ![](_page_62_Picture_2.jpeg)

Aổter saving the scene it becomes a Scene Asset oổ the Project, and appears in the Project Panel. See Figure 1.42. This means the scene is now a genuine and integral part oổ the project, and not just a temporary 'work-in-progress' as it was beổore.

Notice also that saving a scene is conceptually different orom saving a project.

For example, the application menu has entries oor Save Scene and Save Project.

Remember, a Project is a collection oổ yles and ổolders, including assets and scenes.

A scene, by contrast is one asset within the project, and represents a complete 3D

map that may be populated by other assets, such as meshes, textures and sounds.

Saved scenes are added as assets within your project See ổrom Figure 1.42 that I've saved my scene inside a ổolder, named Scenes. Folders can be created in your project by right-clicking on any empty area in the Project Panel, and choosing New Folder ổrom the context menu. Or else choose Assets > Create > Folder ổrom the application menu. You can easily move and rearrange assets among oolders by simply dragging and dropping them.

## ![](_page_64_Picture_0.jpeg)

## The Coin Collection Game: Part 1

Now, the level as it stands contains nothing really 'playable'. It's simply a static, lioeless and non-interactive 3D environment made using the Editor tools. Let's correct that by making our scene 'playable'; allowing the player to wander around and explore the world in urst person mode, controlled using the standard WASD keys on the keyboard. To achieve this, we'll add a First Person Character Controller to the scene.

This is a ready-made asset, included with Unity, which contains everything necessary to create quick and eoooccure urst person controls. Open the oolder Standard Assets > Characters > First Person Character > Prefabs.

## Then drag and drop the FPSController asset rom the Project Panel into the Scene. See Figure 1.43.

## Adding an FPS Controller to the Scene…

## [ 40 ]

## ![](_page_65_Picture_3.jpeg)

Ater adding the First Person Controller, click the Play button rom the Unity tool bar to play test the game in First Person Mode. See Figure 1.44.

Unity scenes can be play tested by clicking the Play button from the toolbar On clicking Play, Unity automatically switches rom the Scene tab to the Game tab.

As we've seen, the scene tab is a 'Director Eye View' o the active scene; it's where a scene is edited, crated and designed. In contrast, the Game tab is where the active scene is played and tested, rom the perspective of the gamer. From this view, the scene is displayed through the main game camera.

## [ 41 ]

## ![](_page_67_Picture_0.jpeg)

## The Coin Collection Game: Part 1

While Play mode is active, you can play test your game using the deault game controls, provided the Game tab is 'in ocus'. The rst person controller uses the WASD keys on the keyboard, and mouse movement controls head orientation.

See Figure 1.45.

## Play testing levels inside the Game Tab

You can switch back to the Scene tab while in Play mode. And you can even edit the scene, and change and move and delete objects there too! However, any and all scene changes made during Play mode will automatically revert back to their original settings when Play mode ends. This behavior is intentional. It lets you edit properties during gameplay to observe their eects and debug any issues, without permanently changing the scene.

## ![](_page_68_Figure_1.jpeg)

Congratulations! Your level should now be walkable in urst person mode. When completed, you can easily stop playback by clicking the Play button again, or by pressing Ctrl + P on the keyboard. Doing this will return you to the Scene tab. You should notice that, on playing the level with a urst person controller, you receive an information message printed to the Console Window. By default, this Window appears at the bottom of the Unity Editor, docked beside the Project Panel. This Window is also accessible manually from the application menu Window > Console.

The Console Window is where all encountered errors or warnings are displayed oor your review, as well as information messages. Errors are printed in red and Warnings in yellow, and information messages appear as a default grey. Sometimes a message appears just once, or sometimes it appears many times repeatedly. See Figure 1.46.

The Console outputs information, warnings and errors...

## [ 43 ]

## ![](_page_70_Picture_0.jpeg)

## The Coin Collection Game: Part 1

As mentioned, the Console Window outputs three distinct types oổ messages: inổormation, warnings and errors. Inổormation messages are typically Unity's way oổ

making best-practice recommendations or suggestions based on how your project is currently working. Warnings are slightly more serious and represent problems either in your code or in your scene, which (iổ not corrected) could result in unexpected behaviors and sub-optimal perổormance. And unally, Errors describe areas in your scene or code which require careoul and immediate attention. Sometimes errors will prevent your game ổrom working altogether, and sometimes errors happen at runtime and can result in game crashes or ổreezes. The Console Window thereoore is helpoul, because it helps us debug and address issues with our games. Figure 1.46

has identived an issue concerning duplicated 'audio listeners'. An Audio Listener is a Component attached to a Camera object. Specivcally, each and every Camera, by deault, has an Audio Listener component attached. This represents an 'ear point'; that is, the ability to hear sound within the scene, rom the position o the camera.

Unortunately, Unity doesn't support multiple active Audio Listeners in the same scene; which means you can only hear audio rom one place at any one time. This problem happens because our scene now contains two cameras, one which was added automatically when the scene was created, and the other, which is included in the First Person Controller. To conrm this: select the First Person Controller object in the hierarchy panel, and click the Triangle icon beside its name to reveal more objects underneath, which are part o the First Person Controller. See Figure 1.47.

## Finding the Camera on a First Person Controller

## [ 44 ]

## ![](_page_71_Figure_4.jpeg)

Select the First Person Character object, which is underneath the FPSController object (as shown in Figure 1.47). The First Person Character object is a Child o the FPSController, which is the Parent. This is because FPSController contains or encloses the First Person Character object in the hierarchy panel. From the Object Inspector, you can see the object has an Audio Listener component. See Figure 1.48.

The First Person Controller object contains an Audio Listener component

## [ 45 ]

## ![](_page_73_Picture_5.jpeg)

## The Coin Collection Game: Part 1

We could remove the Audio Listener component orom the FPSController, but this would prevent the player hearing sound in urst person perspective. So instead, we'll delete the original camera created by deoault in the scene. To do this, select the original camera object in the hierarchy and press Delete on the keyboard.

See Figure 1.49. This removes the Audio Listener warning in the Console during gameplay. Now give the game a play test!

Deleting a Camera Object...

## Adding a Water Plane

The Collection Game is making excellent progress. We now have something playable insoổar as we can run around and explore the environment in urst person mode.

But, the environment could beneut ổrom additional polish. Right now, ổor example, the foor meshes appear suspended in mid-air with nothing beneath them to oổ ổer support. See Figure 1.50. Further, it's possible to walk over the edge and ổall into an inunite drop. So let's add some water beneath the foors, to complement the scene as a complete environment.

## [ 46 ]

## ![](_page_75_Picture_0.jpeg)

## ![](_page_75_Figure_1.jpeg)

The world floor appears to float and have no support To add water, we can use another ready-made Unity asset, included in the Project Panel. Open the ổolder Standard Assets > Environment > Water > Water > Prefabs. Then drag and drop the asset Water Pro Daytime ổrom the Project Panel into the scene. See Figure 1.51. This appears as a circular object, which is initially smaller than needed.

Adding water to the environment...

## [47]

## ![](_page_76_Picture_4.jpeg)

## The Coin Collection Game: Part 1

Aổter adding the Water preổab, position it below the foor level and use the Scale tool (R) to increase its planar size (X, Z) to ull the environment outwards into the distant horizon. This creates the eel that the foor meshes are smaller islands within an expansive world o water. See Figure 1.52.

## Scaling and sizing water for the environment

## [ 48 ]

## ![](_page_77_Picture_3.jpeg)

Now let's take another test run in the Game tab. Press Play on the tool bar and navigate the character around in urst person mode. See Figure 1.53. You should see the water in the level. Oổ course, you can't walk on the water! Neither can you swim or dive beneath it. Iổ you try walking on it you'll simply ổall through it, descending into inunity, as though the water had never been there. Right now, the water is an entirely cosmetic ổeature, but it makes the scene look much better.

## Testing the environment with water in FPS mode

## [49]

## ![](_page_78_Picture_4.jpeg)

## The Coin Collection Game: Part 1

The water is really a substance-less, ethereal object through which the player can pass easily. Unity doesn't recognize it as a solid or even a semisolid object. As we'll see in more detail later, you can make an object solid very quickly by attaching a Box Collider component to it. Colliders and Physics is covered in more depth orom Chapter 3 onwards. For now, however, we can add solidity to the water by urst selecting the Water object orom the Hierarchy Panel (or in the scene viewport) and then by choosing Component > Physics > Box Collider orom the application menu. See Figure 1.54. Attaching a component to the selected object changes the object itselő; changes how it behaves. Essentially, components add behavior and ounctionality to objects; making them behave in diooerent ways. Even so, resist the temptation to simply add lots of components to an object without reason and with the view that it makes them more versatile or poweroul. Better is to have as oew components on an object as necessary. This strategy oổ prederring relevant simplicity keeps your workfow neater, simpler and optimized.

## Attaching a Box Collider to Water Object

## [ 50 ]

## ![](_page_80_Picture_0.jpeg)

When a Box Collider is added to the water, a surrounding green cage or mesh appears. This approximates the volume and shape oổ the water object, and represents its physical volume; namely, the volume oổ the object that Unity recognizes as solid.

See Figure 1.55.

## Box Colliders approximate physical volume

#### [51]

## ![](_page_81_Picture_5.jpeg)

## The Coin Collection Game: Part 1

Iổ you play the game now your character will walk on water as opposed to oalling through. True, the character should properly be able to swim-but walking might be better than oalling. To achieve oull swimming behavior would require significantly more work and is not covered here. Io you want to remove the Box Collider ounctionality and return the water back to its original, ethereal state, then select the water object, and click the Cog icon on the box collider component, and then choose Remove Component of om the context menu. See Figure 1.56.

## Removing a Component

## Adding a Coin to Collect

On reaching this ổar our game has many ổeatures, namely a complete environment, a urst person controller and water. However, we're supposed to be making a coin collection game, and there aren't yet any coins ổor the player to collect. Now, to achieve ổully collectible coins we'll need to write some C# script, which will happen in the next chapter oổ this book. But, we can at least get started here at creating the coin object itselổ. To do that, we'll use a Cylinder primitive that's scaled to ổorm a coin looking shape. To create a cylinder, select Game Object > 3D Object > Cylinder

ổrom the application menu.

## [ 52 ]

## ![](_page_83_Picture_0.jpeg)

## ![](_page_83_Picture_1.jpeg)

## Create a Cylinder

Initially, the Cylinder looks nothing like a coin. But this is easily changed by scaling non-uniormly in the Z axis to make the cylinder thinner. Switch to the Scale tool (R) and then scale the Cylinder inwards. See Figure 1.58.

## Scaling the Cylinder to make a Collectible Coin

## [ 53 ]

## ![](_page_84_Picture_5.jpeg)

## The Coin Collection Game: Part 1

Ater re-scaling the coin, its collider no longer represents its volume. It appears much larger than it should do (See Figure 1.58). By deault the Cylinder is created with a Capsule Collider, as opposed to a Box Collider. You can change the size o the Capsule Collider component by adjusting the Radius eld rom the Object Inspector, when the coin is selected. Lower the Radius eld to shrink the Collider to a more representative size and volume. See Figure 1.59. Alternatively, you could remove the Capsule Collider altogether and add a Box Collider instead. Either way is ne. The colliders will be used in script in the next chapter, to detect when the player collides with the coin to collect them.

## Adjusting the Capsule Collider for the coin…

And there we are! We now have the basic shape and structure or a coin. We will, o course improve it careully and critically in many ways in the next chapter. For example: we'll make it collectible and assign it a material to make it look shiny. But, here, by using only a basic Unity primitive and the Scale tool, we're able to generate a shape that truly resembles a coin.

### Summary

Congratulations! On reaching this point you have laid the oundations or a coin collection game that will be completed and unctional in the next chapter. Here, we've seen how to create a Unity project rom scratch and populate it with assets, like meshes, textures and scenes. In addition, we've seen how to create a scene or our game and use a range o assets to populate it with useul unctionality that ships out-o-the-box with the Unity engine, such as Water, First Person Controllers, and Environment Prototyping assets. In the next chapter, we'll resume work rom where we ended here by making a coin that is collectible, and by establishing a set o rules and logic or the game, making it possible to win and lose.

## [ 54 ]

## Chapter 2

## Project A: The Collection

## Game Continued

This chapter continues rom the previous by building a collection game with Unity.

In this game, the player wanders an environment in rst person mode, searching or and collecting all coins in a scene beore a global timer expires. I all coins are collected beore timer expiry, the game is won. However, i the timer expires beore all coins are collected, the game is lost. The project created so ar eatures a complete environment, with a foor, props and water, and it also eatures a rst person controller, along with a basic coin object, which looks correct in shape and orm but still cannot be collected. This chapter completes the project by creating a coin object to collect, and adding a timer system to determine whether the total game time has elapsed. In essence, this chapter is about dening a system o logic and rules governing the game. To achieve this, we'll need to code in C#, and so this chapter requires a basic understanding o programming. This book is about Unity and developing games with that engine. The basics o programming as a subject is, however, beyond the scope o this book. So I'll assume you already have a working knowledge o coding generally but have simply not coded in Unity beore. Overall this chapter demonstrates:

- 1. Material Creation
- 2. Preabs
- 3. Coding with C#
- 4. Writing Script Files
- 5. Using Particle Systems

### 6. Building and Compiling Games

#### [ 55 ]

## ![](_page_87_Picture_2.jpeg)

## Project A: The Collection Game Continued

### Creating a Coin Material

The previous chapter closed by creating a basic coin object rom a nonuniormly scaled cylinder primitive. This object was created by selecting Game Object > 3D

Object > Cylinder rom the application menu. See Figure 2.1. The coin object as a concept represents a basic or undamental unit in our game logic, because the player character should be actively searching the level looking or coins to collect beore a timer runs out. This means the coin is more than mere 'appearance'; its purpose in-game is not simply eye-candy, but is functional. It makes an immerse dierence to the game outcome whether or not the coin is collected by the player. Thereore, the coin object, as it stands, is lacking in two important respects. Firstly, it looks dull and grey- it doesn't really stand out and grab the player's attention. And secondly, the coin cannot actually be collected yet. Certainly, the player can walk into the coin, but nothing appropriate happens in response.

## The coin object so far…

The completed 'Collection Game' project, as discussed in this chapter and the next, can be ound in the book companion les, inside the Chapter02/Collection Game older.

### [ 56 ]

## ![](_page_88_Picture_4.jpeg)

In this section we'll oocus on improving the coin appearance using a Material. A material deunes an algorithm (or instruction set) specioying how the coin should be rendered. A material doesn't just say what the coin should look like in terms oo color; it deunes how shiny or smooth a suroace is, as opposed to rough and dioous. This is important to recognize, and is why a Texture and Material reoer to diooernt things.

A Texture is simply an image well loaded in memory, which can be wrapped around 3D Object via its UV Mapping. In contrast, a Material dewnes how one or more textures can be combined together and applied to an object to shape its appearance.

To create a new Material asset in Unity, right-click on an empty area in the Project Panel, and ổrom the context menu choose Create > Material. See Figure 2.2. You can also choose Assets > Create > Material ổrom the application menu.

## Creating a material

## [57]

## ![](_page_90_Picture_0.jpeg)

## Project A: The Collection Game Continued

A material is sometimes called a Shader. I needed, you can create custom materials using a Shader Language, or you can use a Unity Add-On, such as Shader Forge

Ater creating a new material, assign it an appropriate name rom the Project Panel.

Since I'm aiming or a gold look, I'll name the material mat\_Gold Coin. Prexing the asset name with mat helps me know, just rom the asset name, that it's a material asset. Simply type a new name into the text edit eld to name the material. You can also click the material name twice to edit the name at any time later. See Figure 2.3.

## Naming a Material Asset

## ![](_page_91_Figure_1.jpeg)

Next, select the Material Asset in the Project Panel, i it's not already selected, and its properties display immediately in the Object Inspector. There're lots o properties listed! In addition, a material preview displays at the bottom o the Object Inspector, showing you how the material would look, based on its current settings, if it were applied to a 3D object, like a sphere. As you change material settings rom the Inspector, the preview panel updates automatically to refect your changes, oering instant eedback on how the material would look. See Figure 2.4.

Material properties are changed from the Object Inspector

## [ 59 ]

## ![](_page_92_Picture_4.jpeg)

## Project A: The Collection Game Continued

Let's now create a gold material or the coin. When creating any material, the rst setting to choose is the Shader type, because this setting eects all other parameters available to you. The Shader type determines which algorithm will be used to shade your object. There are many dierent choices, but most material types can be approximated using either the Standard Shader, or the Standard (Specular Setup).

For the gold coin, we can leave the Shader as Standard. See Figure 2.5.

## Setting the material Shader Type

Right now, the preview panels displays the material as a dull grey, which is ar rom what we need. To dene a gold color, we must speciy the Albedo Channel. To do this, click the Albedo Color slot to display a color picker, and rom the Color Picker dialog select a gold color. The material preview updates in response to refect the changes.

See Figure 2.6.

## [ 60 ]

## ![](_page_94_Figure_0.jpeg)

## Selecting a Gold Color for the Albedo Channel

## [ 61 ]

## ![](_page_95_Picture_3.jpeg)

## Project A: The Collection Game Continued

The coin material is looking better than it did, but it's still supposed to represent a metallic surace, which tends to be shiny and refective. To add this quality to our material, click and drag the Metallic Slider in the Object Inspector to the right-hand side, setting its value to 1. This indicates that the material represents a ully metal surace, as opposed to a diuse surace like cloth or hair. Again, the preview panel will update to refect the change. See Figure 2.7.

### Creating a Metallic Material

### [ 62 ]

## ![](_page_96_Picture_3.jpeg)

We now have a Gold material created, and it's looking good in the Preview Panel.

I needed, you can change the kind o object used or a preview. By deault, Unity assigns the created material to a sphere, but other primitive objects are allowed, including Cubes, Cylinders, and a Torus. This helps you preview materials under dierent conditions. You can change objects by clicking the geometry button directly above the preview panel to cycle through them. See Figure 2.8.

## Previewing a Material on an Object

## [ 63 ]

## ![](_page_98_Picture_0.jpeg)

## Project A: The Collection Game Continued

When your material is ready, you can assign it directly to meshes in your scene just by dragging and dropping. Let's assign the coin material to the coin. Click and drag the material rom the Project Panel onto the Coin object in the scene. On dropping the material, the coin will change appearance. See Figure 2.9.

### Assigning the material to the Coin

You can conrm that material assignment occurred successully, and can even identiy which material was assigned, by selecting the coin object in the scene and viewing its Mesh Renderer Component rom the Object Inspector. The Mesh Renderer component is responsible or making sure a mesh object is actually visible in the scene when the camera is looking. The Mesh Renderer component contains a Materials eld. This lists all materials currently assigned to the object. By clicking the material name rom the Materials eld, Unity automatically selects the material in the Project Panel, making it quick and simple to locate materials. See Figure 2.10.

### [ 64 ]

## ![](_page_99_Figure_2.jpeg)

Mesh objects may have multiple materials, with dierent materials assigned to dierent aces. For best in-game perormance, use as ew unique materials on an object as necessary.

Make the extra eort to share materials across multiple objects, i possible. Doing so can signicantly enhance the perormance o your game. For more inormation on optimizing rendering perormance, see the online documentation here: http://docs.unity3d.com/

## Manual/Optimizing Graphics Performance.html

The Mesh Renderer Component lists all materials assigned to an object And that's it! You now have a complete and unctional gold material or the collectible coin. It's looking good. But, we're still not nished with the coin overall.

The coin looks right, but it doesn't behave right. Specically, it doesn't disappear when touched, and we don't yet keep track o how many coins the player has collected overall. To address this, then, we'll need to script.

## [ 65 ]

## ![](_page_101_Picture_0.jpeg)

## Project A: The Collection Game Continued

### C# Scripting in Unity

Dening game logic, rules and behavior oten requires scripting. Specically, to transorm a static and lieless scene with objects into an environment that 'does something', requires a developer to code behaviors. It requires someone to dene how things should act and react under specic conditions. The coin collection game is no exception to this. In particular it requires three main eatures: 1. To know when the player collects a coin 2. To keep track o how many coins are collected during gameplay 3. To determine whether a timer has expired.

There's no deault 'out o the box' unctionality included with Unity to handle this scenario. So we must write some code to achieve it. Unity supports two languages, namely Unity Script (sometimes called Java Script), and C#. Both are capable and useul languages, but this book uses C#. Let's start coding these three eatures in sequence. To create a new script le, right-click on an empty area inside the Project Panel, and rom the context menu choose Create > C# Script. Alternatively, you can select Assets > Create > C# Script rom the application menu. See Figure 2.11.

### Creating a new C# Script

### [ 66 ]

## ![](_page_102_Picture_3.jpeg)

Ater the le is created, you'll need to assign it a descriptive name. I'll call it Coin.cs.

In Unity, each script le represents a single, discrete class o matching name. Hence, the le Coin.cs encodes the class Coin. The coin class will encapsulate the behavior o a coin object and will, eventually, be attached to the coin object in the scene. See Figure 2.12.

## Naming a Script File

Double-click the Coin.cs le rom the Object Inspector to open it or editing inside Mono Develop, a third party IDE application that ships with Unity. This program lets you edit and write code or your games. Once opened in Mono Develop, the source

```
le will appear as shown in Code Sample 2.1.
using Unity Engine;
using System. Collections;
public class Coin : Mono Behaviour
{
// Use this for initialization
void Start () {}
// Update is called once per frame
## ```

```
void Update () {}
}
[ 67 ]
## ```

## ![](_page_104_Picture_1.jpeg)

## Project A: The Collection Game Continued

By deault, all newly created classes derive rom Mono Behaviour, which denes a common set o unctionality shared by all Components. The Coin class eatures two auto-generated unctions, namely Start and Update. These unctions are events invoked automatically by Unity. Start is called once as soon as the Game Object (to which the script is attached) is created in the scene. Update is called once per rame on the object to which the script is attached. Start is useul or initialization code, and Update is useul or creating behaviors over time, such as motion and change.

Now, beore moving any urther, let's attach the newly created Script le to the Coin object in the scene. To do that, drag and drop the Coin.cs script le rom the Project Panel onto the Coin Object. When you do this, a new Coin component is added to the Object. This means the script is instantiated and lives on the object. See Figure 2.13.

## Attaching a Script File to an Object

When a Script is attached to an Object, it exists on the object as a Component. A Script le can normally be added to multiple objects, and can even be added to the same object multiple times. Each Component represents a separate and unique instantiation o the class. When a Script is attached in this way, Unity automatically invokes its events, like Start and Update. You can conrm your script is working as normal by including a Debug. Log statement in the Start unction. This prints a debug message to the Console Window when the Game Object is created in the scene. Consider the ollowing code in Sample 2.2, which achieves this.

using Unity Engine;

using System. Collections;

## [ 68 ]

## ![](_page_105_Picture_6.jpeg)

## public class Coin : Mono Behaviour

```
{
// Use this for initialization
void Start () {
Debug. Log ("Object Created");
}
// Update is called once per frame
void Update () {
}
}
## ```

I you press Play (Ctrl+P) on the toolbar to run your game with the above script attached to an object, you will see the message "Object Created" printed to the Console Window, once or each instantiation o the class. See Figure 2.14.

## Printing messages to the Console Window

Good work! We've now created a basic script or the coin class and attached it to the Coin. Next, let's dene its unctionality to keep track o coins as they are collected.

### Project A: The Collection Game Continued Counting Coins

The coin collection game wouldn't really be much o a 'game' i there were only one coin. The central idea is that a level should eature many coins, all o which the player should collect beore a timer expires. Now, to know whether all coins have been collected, we'll need to know how many coins there are in total in the scene.

Ater all, i we don't know how many coins there are, then we can't know i we've collected them all. So, our rst task in scripting is to congure the coin class so we can know, easily, the total number o coins in the scene at any moment. Consider Code Sample 2.3, which adapts the Coin class to achieve this. Comments ollow.

| // |
|-----------------------------------------------------------------------------|
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Coin : Mono Behaviour |
| { |
| // |
| //Keeps track of total coin count in scene public static int Coin Count = 0; |
| // |
## | // Use this for initialization |

```
void Start ()
{
//Object created, increment coin count
++Coin. Coin Count;
}
//-------------------------
//Called when object is destroyed
void On Destroy()
{
//Decrement coin count
--Coin. Coin Count;
//Check remaining coins
if(Coin. Coin Count <= 0)
{
//We have won
}
}
//-------------------------
## ```

## } //------------------------- [ 70 ]

## Chapter 2

## Comments on Code Sample 2-3

- 

The Coin class maintains a static member variable Coin Count, which, in being static, is shared across all instances o the class. This variable keeps count o the total number o coins in the scene, and each instance has access to it.

- 

The Start unction is called once per Coin instance when the object is created in the scene. For Coins that are present when the scene begins, the Start event is called at scene startup. This unction increments the Coin Count variable by 1 per instance, thus keeping count o all coins.

- 

The On Destroy unction is called once per instance when the object is destroyed. This decrements the Coin Count variable, reducing the count or each coin destroyed.

Altogether Code Sample 2-3 maintains a Coin Count variable. In short, this variable allows us to always keep track o the total coin count. We can query it easily to determine how many coins remain. This is good, but is only the rst step towards completing the coin collection unctionality.

### Collecting Coins

Previously, we developed a coin counting variable, telling us how many coins are in the scene. But regardless o the count, the player still can't collect the coins during gameplay. Let's x that now. To start, we need to think about Collisions. Thinking careully, we know that a coin is considered collected whenever the player walks into it. That is, a coin is collected when the player and the coin intersect, or collide.

### [ 71 ]

## ![](_page_110_Picture_3.jpeg)

## Project A: The Collection Game Continued

To determine when a Collision happens like that, we must approximate the volume o both the player and a coin, to determine when the two volumes overlap in space. This is achieved in Unity through Colliders. Colliders are special physics objects attached to meshes. They tell us when two meshes intersect. The FPSController object (First Person Controller) already has a Collider on it, through its Character Controller component.

This approximates the physical body o a generic person. This can be conrmed by selecting the FPSController in the Scene and examining the green wirerame-cage surrounding the main camera. It is capsule-shaped. See Figure 2.15.

The Character Controller features a Collider to approximate the Player Body The FPSController eatures a Character Controller component attached, which is congured by deault with Radius, Height and Center settings, dening the physical extents o the character in the scene. See Figure 2.16. These settings can be let unchanged or our game.

### [ 72 ]

## ![](_page_111_Figure_3.jpeg)

## ![](_page_112_Figure_0.jpeg)

The FPSController features a character controller The Coin Object, in contrast, eatures only a Capsule Collider component, which was added automatically when we created the Cylinder primitive earlier to resemble a coin. This approximates the Coin's physical volume in the scene, without adding any additional eatures specic to characters and motion as ound in the Character Controller component. This is ne, because the coin is a static object as opposed to a moving and dynamic object, like the FPS Controller. See Figure 2.17.

Cylinder Primitives feature a Capsule Collider Component

#### [ 73 ]

## ![](_page_113_Figure_4.jpeg)

## ![](_page_114_Picture_0.jpeg)

## Project A: The Collection Game Continued

For this project, I'll stick to using a Capsule Collider component or the coin object.

However, i you wanted to change the attached collider to a dierent shape instead, like a box or a sphere, you can do that by rst removing any existing collider components on the Coin: click the Cog icon o the component in the Object Inspector, and then select Remove Component rom the context menu. See Figure 2.18.

### Removing a Component from an Object

You may then add a new Collider Component to the selected object, by choosing Component > Physics rom the application menu, and then choose a suitable shaped collider. See Figure 2.19.

## Adding a Component to the selected object

#### [ 74 ]

## ![](_page_115_Figure_1.jpeg)

Regardless o the collider type used, there's a minor problem. I you play the game now and try to run through the coin, it'll block your path. The coin acts as a solid, physical object through which the FPSController cannot pass. But, or our purposes, this isn't how the coin should behave. It's supposed to be a collectible object. The idea is that: when walk through it, the coin is collected and disappears. We can x this easily, by selecting the Coin object and enabling the Is Trigger check box inside the Collider Component, in the Object Inspector. The Is Trigger setting appears or almost all collider types. It lets us detect collisions and intersections with other colliders while allowing them to pass through. See Figure 2.20.

The Is Trigger setting allows objects to pass through colliders

## [ 75 ]

Project A: The Collection Game Continued I you play the game now, the FPSController will easily walk through all coin objects in the scene. This is a good start. However, the coins don't actually disappear when touched; they still don't get collected. To achieve that, we'll need to add more script to the Coin.cs le. Specically, we'll add an On Trigger Enter unction. This unction is called automatically when an object, like the player, enters a collider. For now, we'll add a Debug. Log statement to print a Debug message when the player enters the collider, just or test purposes. See Code Sample 2.4.

| // |
|---------------------------|
| using Unity Engine; |
## | using System. Collections; |

```
//-------------------------
public class Coin : Mono Behaviour
{
//-------------------------
public static int Coin Count = 0;
//-------------------------
// Use this for initialization
void Start () {
//Object created, increment coin count
++Coin. Coin Count;
}
//-------------------------
void On Trigger Enter(Collider Col)
{
Debug. Log ("Entered Collider");
}
//-------------------------
//Called when object is destroyed
## ```

```
void On Destroy()
{
//Decrement coin count
--Coin. Coin Count;
//Check remaining coins
if(Coin. Coin Count <= 0)
{
//We have won
}
}
//-------------------------
}
//-------------------------
[ 76 ]
## ```

## ![](_page_119_Figure_0.jpeg)

More inormation on the On Trigger Enter unction can be ound at the online Unity documentation here: http://docs.unity3d.com/

Script Reference/Mono Behaviour. On Trigger Enter.html Test the code in Sample 2.4 by pressing Play on the toolbar. When you run into a coin, the On Trigger Enter unction will be executed and the message displayed.

However, the question remains as to what object initiated this unction in the rst place. It's true that something collided with the coin, but what exactly? Was it the player, an enemy, a alling brick, or something else? To check this, we'll use Tags.

The Tag eature lets you mark specic objects in the scene with specic tags or labels, allowing those objects to be easily identied in code so we can quickly check that the player, rather than other objects, are colliding with the coins. Ater all, it should only be the player that can collect coins. So, rstly, we'll tag the player object with a tag called 'Player'. To do this, select the FPSController object in the scene, and then click the tag dropdown box in the Object Inspector. From here, select the Player tag. This marks the FPSController as the Player object. See Figure 2.21.

## Tagging the FPSController as 'Player'

## [ 77 ]

Project A: The Collection Game Continued With the FPSController now tagged as Player, we can rene the Coin.cs le as shown in Code Sample 2.5. This handles coin collection, making the coin disappear on touch and decreasing the coin count. Comments ollow.

```
//-------------------------
using Unity Engine;
using System. Collections;
//-------------------------
public class Coin : Mono Behaviour
{
//-------------------------
public static int Coin Count = 0;
//-------------------------
// Use this for initialization
void Start () {
//Object created, increment coin count
++Coin. Coin Count;
}
//-------------------------
void On Trigger Enter(Collider Col)
{
//If player collected coin, then destroy object if(Col. Compare Tag("Player"))
## ```

```
Destroy(game Object);
}
//-------------------------
//Called when object is destroyed
void On Destroy()
{
//Decrement coin count
--Coin. Coin Count;
//Check remaining coins
if(Coin. Coin Count <= 0)
{
//We have won
}
}
//-------------------------
}
//-------------------------
[ 78 ]
## ```

## Comments on Code Sample 2-5

- 

On Trigger Enter is called once automatically by Unity each time the FPSController intersects the Coin collider

- 

When On Trigger Enter is called, the argument Col contains inormation about the object that entered the collider on this occasion

- 

The Compare Tag unction is used to determine i the colliding object is the Player, as opposed to a dierent object

- 

The Destroy unction is called to destroy the coin object itsel, represented internally by the inherited member variable game Object

- 

When the Destroy unction is called, the On Destroy event is invoked automatically. This decrements the Coin Count.

Excellent work! You've just created your rst working coin. The player can now run into the coin, collecting it and removing it rom the scene. This is a great beginning, but the scene should contain more than one coin. We could solve this by duplicating the existing coin many times and repositioning each duplicate to a dierent place.

## But there's a better way, as we'll see next…

#### Coins and Prefabs

The basic coin unctionality is now created. But the scene needs more than one coin.

The problem with simply duplicating a coin and scattering the duplicates is that, i we make a change later to one coin and need to propagate that change to all other coins, we'd need to delete the ormer duplicates and manually replace those with newer and amended duplicates. To avoid this tedious repetition, we can use Prefabs.

#### [ 79 ]

## ![](_page_124_Picture_6.jpeg)

## Project A: The Collection Game Continued

Preabs let you convert an object in the scene to an Asset in the Project Panel. This can be instantiated in the scene as requently as needed, as though it were a mesh asset. The advantage is that changes made to the asset are automatically applied to all instances automatically, even across multiple scenes. This makes it easier to work with custom assets; so let's Preab the coin right now. To do this, select the coin object in the scene, and then drag and drop it into the Project Panel. When this happens, a new Preab is created. The object in the scene is automatically updated to be an Instance o the Preab. This means that, i the Asset is deleted rom the Project Panel, the instance will become invalidated. See Figure 2.22.

### Creating a Coin Prefab

### [ 80 ]

## ![](_page_125_Picture_4.jpeg)

Ater the preab is created, you can add more instances o the coin easily to the level, by dragging and dropping the Preab rom the Project Panel into the scene. Each instance is linked to the original preab asset, which means that all changes made to the asset will immediately be made to all instances. With this in mind, go ahead now and add as many coin preabs to the level as suitable or your coin collection game.

See gure 2.23 below or my arrangement.

## Adding coins prefabs to the level…

### [ 81 ]

## ![](_page_127_Picture_5.jpeg)

## Project A: The Collection Game Continued

One question that naturally arises is how you can transorm a preab back into an independent Game Object that is no longer connected to the Preab asset. This is useul to do i you want some objects to be based on the preab but to deviate rom it slightly. To achieve this, select a Preab instance in the scene, and then choose Game Object > Break Prefab Instance rom the application menu. See Figure 2.24.

#### Breaking the prefab instance

TIP. If you add a Prefab instance to the scene and make changes to it that you like and want to distribute upstream back to the Prefab asset, then select the object and choose Game Object > Apply Changes to Prefab.

#### [ 82 ]

## ![](_page_128_Picture_4.jpeg)

#### **Timers and Count Downs**

You should now have a level complete with geometry and coin objects. And thanks to our newly added Coin.cs script, the coins are both countable and collectible.

But even so, the level still poses little or no challenge to the player, because there's no way the level can be won or lost. Speciucally, there's nothing oor the player to achieve. This is why a time-limit is important oor the game: it deunes a win and loss condition. Namely: collecting all coins be oore the timer expires results in a win condition, and oailing to achieve this results in a loss condition. Let's get started at creating a timer countdown oor the level. To do this, create a new and empty game object by selecting Game Object > Create Empty, and rename this to Level Timer. See Figure 2.25.

#### Renaming the Timer Object

REMEMBER. Empty game objects cannot be seen by the player because they have no mesh renderer component. They especially useful for creating functionality and behaviors that don't directly correspond to physical and visible entities, such as timers, managers and game logic controllers.

## [ 83 ]

## ![](_page_130_Picture_0.jpeg)

## Project A: The Collection Game Continued

Next, create a new Script le named Timer.cs and add it to the Level Timer Object in the scene. By doing this the Timer unctionality will exist in the scene. Make sure, however, that the Timer script is added to one object, and no more than one.

Otherwise, there will eectively be multiple, competing timers in the same scene.

You can always search a scene to nd all components o a specied type by using the Hierarchy Panel. To do this, click inside the Hierarchy Search box and type: t:Timer. Then press Enter on the keyboard to conrm the search. This searches the scene or all objects with a component attached o type Timer, and the results are displayed in the Hierarchy Panel. Specically, the hierarchy panel is ltered to show only the matching objects. The prex t in the search string indicates a search by type operation. See Figure 2.26.

Searching for Objects with a component of matching type…

## ![](_page_131_Picture_0.jpeg)

You can easily cancel a search and return the hierarchy panel back to its original state by clicking the small cross icon, aligned to the right-hand side o the search eld.

This button can be tricky to spot. See Figure 2.27.

## Cancelling a type search

The timer script itsel must also be coded i it's to be useul. The ull source code or the Timer.cs le is given in Code Sample 2.6 below, and then comments ollow.

This source code is highly important i you've never scripted in Unity beore. It demonstrates so many critical eatures. See the comments or a uller explanation.

| • |
|------------------------------------|
| // |
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Timer : Mono Behaviour |
## | { |

```
//-------------------------
//Maximum time to complete level (in seconds) public float Max Time =
60f;
//-------------------------
//Countdown
[ 85 ]
Project A: The Collection Game Continued
[Serialize Field]
private float Count Down = 0;
//-------------------------
// Use this for initialization
void Start ()
{
Count Down = Max Time;
}
//-------------------------
// Update is called once per frame
void Update ()
{
## ```

```
//Reduce time
Count Down -= Time.delta Time;
//Restart level if time runs out
if(Count Down <= 0)
{
//Reset coin count
Coin. Coin Count=0;
Application. Load Level(Application.loaded Level);
}
}
//-------------------------
}
//-------------------------
Comments on Code Sample 2-6
- 
On Trigger Enter is called once automatically by Unity each time the
FPSController intersects the Coin collider
## ```

- 

In Unity, class variables declared as public (such as public float Max Time) are displayed as editable elds inside the Object Inspector o the editor. This applies only to a range o supported data types, however, but it's a highly useul eature. It means developers can monitor and set public variables or classes directly rom the inspector, as opposed to changing and recompiling code every time a change is needed. Private variables, in contrast, are hidden rom the Inspector by deault. However, you can orce them to be visible, i needed, by using the Serialize Field attribute. Private variables prexed with this attribute, such as variable Count Down, will display in the Object Inspector just like a public variable, even though the variable's scope still remains private.

## [ 86 ]

## Chapter 2

- 

The Update unction is a Unity native Event supported or all classes derived rom Mono Behaviour. Update is invoked automatically once per frame or all active Game Objects in the scene. This means that all active game objects are notied about rame change events. In short, Update is thereore called many times per second; the game FPS is a general indicator as to how many times on each second. The actual number o calls will vary in practice, rom second to second. In any case, Update is especially useul or animating, updating and changing objects over time. In the case o a

Count Down class, it'll be useul or keeping track o time as it passes away, second by second.

More inormation on the Update unction can be ound at the online Unity documentation here: https://unity3d.com/learn/tutorials/modules/

beginner/scripting/update-and-fixedupdate

In addition to the Update function, called on each frame, Unity also supports two other related functions, namely Fixed Update and Late Update.

Fixed Update is used when coding with Physics, as we'll see later, and is called a xed number o times per rame. Late Update is called once per frame for each active object, but the Late Update call will always happen after every object has received an Update event. Thus it happens after the Update cycle; making it a late update. There are reasons for this late update, and we'll see them later in the book. More information on Fixed Update can be found in the Online Unity Documentation here: http://docs.unity3d.

com/Script Reference/Mono Behaviour. Fixed Update.

html. More information on the Late Update function can be found in the Online Unity Documentation here: http://docs.unity3d.com/

## Script Reference/Mono Behaviour. Late Update.html

- 

When scripting, the static Time.delta Time variable is constantly available and is updated automatically by Unity. It always describes the amount o time (in seconds) that has passed since the previous rame ended. For example, i your game has a rame rate o 2 FPS (a very low rame rate!) then delta Time will be 0.5. This is because, in each second, there would be two rames, and thus each rame would be hal a second. delta Time is useul because, i added over time, it tells you how much time in total has elapsed or passed since the game began. For this reason, delta Time is used heavily inside the Update unction or the Timer, to subtract the elapsed time rom the countdown total. More inormation can be ound on delta Time at the online documentation here: http://docs.unity3d.com/Script Reference/Timedelta Time.html

### [ 87 ]

## ![](_page_137_Picture_3.jpeg)

## Project A: The Collection Game Continued

- 

The static unction Application. Load Level may be called anywhere in code to change the active scene at run time. Thus, this unction is useul or moving the gamer rom one level to another. It causes Unity to terminate the active, destroying all its contents, and to load in a new scene. It can also be used to restart the active scene, simply by loading the active level again.

Application. Load Level is most appropriate or games with clearly dened levels that a separate rom each other and have clearly dened beginnings and endings. It is not, however, suitable or large open-world games in which large sprawling environments stretch on, seemingly without any breakage or disconnection. More inormation on Application. Load Level can be ound at the online Unity Documentation here: http://docs.unity3d.com/

Script Reference/Application. Load Level.html Ater the timer script is created, select the Level Timer object in the scene. From the Object Inspector, you can set the maximum time (in seconds) the player is allowed or completing the level. See Figure 2.28. I've set the total time to 60 seconds. This means all coins must be completed within 60 seconds rom the level start. I the timer expires, the level is restarted.

## Setting the level total time

Great work! You should now have a completed level with a countdown that works.

You can collect coins, and the timer can expire. There is a urther problem, however, which we'll address next. But overall, the game is taking shape.

## [ 88 ]

## ![](_page_139_Figure_0.jpeg)

#### Celebrations and Fireworks!

The coin collection game is nearly unished. Coins can be collected and a timer expires, but the win condition itselő is not truly handled. That is, when all coins are collected beőore time expiry, nothing actually happens to show the player they've won. The countdown still proceeds and even restarts the level as though the win condition hadn't been satisued at all. Let's ux that now. Speciucally, when the win scenario happens, we should delete the timer object to prevent ourther countdown, and show visual oeedback to signioy that the level has been completed. In this case, I'll add some ureworks! So, let's start by creating the ureworks. You can add these easily orom the Unity 5 Particle System packages. Open the oolder Standard Assets > Particle Systems > Prefabs. Then drag and drop the Fireworks Particle System into the scene. Add a second, or even a third one io you want.

## Adding two Fireworks Prefabs

## [ 89 ]

## ![](_page_141_Picture_0.jpeg)

## Project A: The Collection Game Continued

By deoault, all wrework particle systems will play when the level begins. You can test that by pressing Play on the toolbar. This is not the behavior we want. We only want the wreworks to play when the win condition has been satisfied. To disable playback on level start-up, select the Particle System object in the scene, and orom the Object Inspector disable the Play on Awake check box, which can be of ound in the Particle System Component. See Figure 2.30.

#### Disabling Play on Awake

Disabling Play on Awake prevents particle systems playing automatically at level start-up. This is une, but iổ they are ever to play at all something must manually start them at the right time. We can achieve this through code. Beổore resorting to a coding solution, however, we'll urst mark all urework objects with an appropriate tag. The reason ổor this is that, in code, we'll want to search ổor all urework objects in the scene and trigger them to play when needed. To isolate the urework objects ổrom all other objects, we'll use tags. So, let's create a new Firework tag and assign them to only the rework objects in the scene. Tags were created earlier in this chapter when conguring the player character or coin collisions. See Figure 2.31.

## [ 90 ]

## ![](_page_142_Picture_2.jpeg)

## Tagging firework objects

With the rework objects now tagged, we can rene the Coin.cs script class to handle a win condition or the scene, as shown in Code Sample 2.7. Comments ollow.

```
//-------------------------
using Unity Engine;
using System. Collections;
//-------------------------
public class Coin : Mono Behaviour
{
//-------------------------
public static int Coin Count = 0;
//-------------------------
// Use this for initialization
void Awake ()
{
//Object created, increment coin count
## ```

```
++Coin. Coin Count;
}
//-------------------------
void On Trigger Enter(Collider Col)
{
//If player collected coin, then destroy object if(Col. Compare Tag("Player"))
Destroy(game Object);
}
[ 91 ]
Project A: The Collection Game Continued
//-------------------------
void On Destroy()
{
--Coin. Coin Count;
//Check remaining coins
if(Coin. Coin Count <= 0)
{
//Game is won. Collected all coins
## ```

```
//Destroy Timer and launch fireworks
Game Object Timer = Game Object. Find("Level Timer"); Destroy(Timer);
Game Object[] Firework Systems = Game Object. Find Game Obj
ects With Tag("Fireworks");
foreach(Game Object GO in Firework Systems)
GO. Get Component<Particle System>(). Play();
}
}
//-------------------------
}
//-------------------------
Comments on Code Sample 2-7
## ```

The On Destroy unction is critical. It occurs when a coin is collected, and it eatures an if statement to determine when all coins are collected (the win scenario).

- 

- 

When a win scenario happens, the unction Game Object. Find is called to search the complete scene hierarchy or any active object named "Level Timer".

I ound, the object is deleted. This happens to delete the timer and prevent any urther count down when the level is won. I the scene contains multiple objects o matching name, then only the rst object is returned. This is one reason why the scene should contain one and only one timer.

## [ 92 ]

### Chapter 2

TIP. Avoid using the Game Object. Find function wherever possible.

It's slow for performance. Instead, use Find Game Objects With Tag instead. It's been used here only to demonstrate its existence and purpose.

Sometimes, you'll need to use it or nding a single, miscellaneous object that has no specic tag.

- 

In addition to deleting the Level Timer object, the On Destroy unction all nds all rework objects in the scene and initiates them. It nds all objects o a matching tag by using the Game Object. Find Game Objects With Tag unction. This unction returns an array o all objects with the "Fireworks" tag, and the Particle System is initiated or each object by calling the Play unction.

As mentioned, each Game Object in Unity is really made from a collection of attached and related components. An object is the sum of its components. For example, a standard cube (created using Game Object > 3D Object > Cube) is made from a Transform Component, a Mesh Filter Component, a Mesh Renderer Component, and a Box Collider Component. These components together make the cube what it is and behave how it does. The Get Component function can be called in script to retrieve a reference to any specified component, giving you direct access to its public properties. The On Destroy function in Code Sample 2.7 uses Get Component to retrieve a reference to the Particle System component attached to the object. Get Component is a highly useful and important function. More information on Get Component can be found at the online Unity Documentation here: http://docs.unity3d.

## com/Script Reference/Game Object. Get Component.html

### [ 93 ]

## ![](_page_147_Picture_3.jpeg)

## Project A: The Collection Game Continued

### Play Testing

You've now completed your rst game in Unity! It's time to take it or a test run, and then nally to build it. Testing in Unity rstly consists o pressing Play on the toolbar and simply playing your game to see that it works as intended, rom the perspective o a gamer. In addition to playing, you can also enable Debugging mode rom the Object Inspector to keep a watchul eye on all public and private variables during runtime; making sure no variable is assigned an unexpected value. To activate Debug mode, click the menu icon at the top-right corner o the Object Inspector, and rom the context menu that appears, select the option Debug. See Figure 2.32.

Activating Debug Mode from the Object Inspector Ater activating debug mode, the appearance o some variables and components in the Object Inspector may change. Typically, you'll get a more detailed and accurate view o your variables; and you'll also be able to see most private variables. See Figure 2.33 or the Transorm Component in Debug Mode.

#### [ 94 ]

## ![](_page_148_Figure_3.jpeg)

## ![](_page_148_Figure_4.jpeg)

Viewing the Transform Component in Debug Mode Another useul debugging tool at runtime is the Stats panel. This can be accessed rom the Game tab, by clicking the Stats button rom the toolbar. See Figure 2.34.

## Accessing the Stats panel from the Game Tab

## [ 95 ]

## ![](_page_149_Picture_5.jpeg)

## Project A: The Collection Game Continued

The Stats Panel is only useul during Play mode. In this mode, it details the critical perormance statistics or your game, such as Frame Rate (FPS) and memory usage.

This lets you diagnose or determine whether any problems may be aecting your game. The FPS represents the total number o rames (ticks or cycles) per second that your game can sustain on average. There is no right or wrong or magical FPS

per se; but higher values are better than lower ones. Higher values represent better perormance, because it means your game can sustain more cycles in one second.

I your FPS alls below 20 or 15, it's likely your game will appear choppy or 'laggy', as the perormance weight o each cycle means it takes longer to process. Many variables can aect FPS, some internal and some external to your game. Internal actors include the number o lights in a scene, the vertex density o meshes, the number o instructions and complexity o code. Some external actors include the quality o your computer's hardware, the number o other applications and processes running at the same time, the amount o hard drive space, among others. In short, i your FPS is low, then it indicates a problem that needs attention. The solution to that problem varies depending on the context, and you'll need to use judgement, or example: are your meshes too complex? Do they have too many vertices? Are your textures too large? Are there too many sounds playing? See Figure 2.35 or the coin collection game up and running. The completed game can be ound in the book companion les, in the Chapter02/End older.

Testing the Coin Collection Game...

## [ 96 ]

## ![](_page_151_Picture_0.jpeg)

## **Building**

So now it's time to Build the game! That is, to compile and package the game into a stand-alone and selő-executing őorm, which the gamer can run and play without needing to use the Unity editor. Typically, when developing games you'll reach a decision about your target platổorm (such as Windows, iOS, Android etc.) during the design phase, and not at the end oổ development. It's oổten said that Unity is a

'develop once, deploy everywhere' tool. This slogan can conjure up the unoortunate image that, aoter a game is made, it'll work just as eooortlessly on every platoorm supported by Unity as it does on the desktop. Unoortunately, things are not so simple: games that work well on desktop systems don't necessarily peroorm equally well on mobiles, and vice versa. This is due largely to the great diooerences in target hardware, and in the industry standards that hold between them. Because oo these diooerences, I'll oocus our attention here to the Windows and Mac Desktop platoorms, ignoring mobiles and consoles and other platoorms. To create a Build oor Desktop platoorms, select File > Build Settings or on the File menu.

## Accessing the Build Settings for the Project

## [ 97 ]

## ![](_page_153_Picture_0.jpeg)

## Project A: The Collection Game Continued

The Build Settings dialog then displays, and its interoace consists of three main areas.

The Scenes in Build list is a complete list oổ all scenes to be included in the build, regardless oổ whether the gamer will actually visit them in game. It represents the totality oổ all scenes that could ever be visited in the game. In short, iổ you want or need a scene in your game, then it needs to be in this list. Initially, the list is empty.

See Figure 2.37.

## The Build Settings Dialog

## ![](_page_154_Figure_1.jpeg)

You can easily add scenes to the list, simply by dragging and dropping the scene asset rom the Project Panel into the Scenes in Build list. For the coin collection game, I'll drag and drop the Level\_01 scene into the list. As scenes are added, Unity automatically assigns them a number, depending on their order in the list. 0 represents the topmost item, 1 the next item, and so on. This number is important insoar as the 0 item is concerned. The topmost scene (Scene 0) will always be the starting the scene. That is, when the build runs, Unity automatically begins execution rom Scene 0. Thus Scene 0 will typically be your Splash or Intro scene. See Figure 2.38.

## Adding a Level to the Build Settings Dialog

## [ 99 ]

## ![](_page_155_Picture_5.jpeg)

## Project A: The Collection Game Continued

Next, be sure to select your target platổorm ổrom the Platổorm list at the bottom-leổt side oổ the Build Settings dialog. For desktop platổorms, choose Pc, Mac & Linux Standalone, which should be selected by deổault. And then ổrom the options, set the Target Platform drop down list to either Windows, Linux or Mac, depending on your system. See Figure 2.39.

#### Choosing a Target Build Platform

Iổ you've previously been testing your game ổor multiple platổorms, or trying out other platổorms, like Android and i Os, the button Switch Platform (at the bottom-leổt oổ the Build Settings dialog) might become activate when you select the Standalone option. Iổ

it does, click the Switch Platform button to conurm to Unity that you intended building

óor the selected platóorm. On clicking this, Unity may spend a óew minutes congguring your assets óor the selected platóorm.

### [ 100 ]

## ![](_page_156_Picture_6.jpeg)

## ![](_page_157_Picture_0.jpeg)

## Switching platforms…

Beore building or the rst time, you'll probably want to view the Player Settings options to ne tune important build parameters, such as game resolution, quality settings, executable icon and inormation, among other settings. To access the Player Settings, you can simply click the Player Settings button rom the Build Dialog. This displays the Player Settings inside the Object Inspector. The same settings can also be accessed via the application menu, by choosing Edit > Project Settings > Player.

See Figure 2.41.

## Accessing the Player Settings options

## [ 101 ]

## ![](_page_158_Picture_6.jpeg)

### Project A: The Collection Game Continued

From the Player Settings options, set a Company Name and Product Name, as this inormation is baked and stored within the built executable. You can also speciy an icon image or the executable, as well as a deault mouse cursor, i one is required.

For the collection game, however, these latter two settings will be let empty. See Figure 2.42.

## Setting an Publisher and Product name…

#### [ 102 ]

## ![](_page_159_Picture_5.jpeg)

The Resolution and Presentation tab is especially important, as it species the game screen size and whether a deault splash screen (Resolution Dialog) should appear at application start-up. From this tab, ensure the option Default is Full Screen is enabled, meaning the game will run at the complete size o the system's screen, as opposed to in a smaller and movable window. In addition, enable the drop-down list Display Resolution Dialog. See Figure 2.43. When this is enabled, your application will display an options screen at start-up, allowing the user to select a target resolution and screen size, and to customize controls. For a nal build, you'll probably want to disable this option, presenting the same settings through your own customized options screen in-game instead. But or test builds, the Resolution Dialog can be a great help. It lets you test your build easily at dierent sizes.

## Enabling the Resolution Dialog

## [ 103 ]

## ![](_page_161_Picture_0.jpeg)

## Project A: The Collection Game Continued

Now you're ready to make your urst compiled Build. So click the Build button or om the Build Settings Dialog, or else choose File > Build and Run or om the application menu. When you do this, Unity presents you with a Save Dialog, asking you to specious a target location on your computer where the Build should be made. Select a location and choose Save, and the build process will complete. Occasionally, this process can generate errors, which are printed in red inside the Console Window.

This can happen, ổor example, when you save to a read-only drive, or have insuổucient hard drive space, or don't have the necessary administration privileges on your computer. But generally, the Build Process succeeds iổ your game runs properly in the Editor. See Figure 2.44.

## Building and Running a Game

## [ 104 ]

## ![](_page_162_Picture_0.jpeg)

Ater the Build is completed, Unity generates new les at your destination location.

For Windows, it generates an executable le, and a Data older. See Figure 2.45. Both are essential and interdependent. That is, i you want to distribute your game and have other people play it without needing to install Unity, then you'll need to send users both the executable le and the associated data older and all its contents.

## Unity builds several files

On running your game, the Resolution Dialog will show, assuming you enabled the Show Resolution Dialog option rom the Player Settings. From here, users can select game resolution, quality, output monitor, and can congure player controls.

## [ 105 ]

## ![](_page_164_Picture_0.jpeg)

## ![](_page_164_Picture_1.jpeg)

## Project A: The Collection Game Continued

Preparing to run your game from the Resolution Dialog On clicking the Play! Button, your game will run by deault in ull screen mode.

Congratulations! Your game is now completed and built, and you can send it to your riends and amily or play testing! See Figure 2.47.

Running the coin collection game in full screen mode But wait! How do you exit your game when you're nished playing? There's no quit button or main menu option in game. For Windows, you just need to press Alt+F4 on the keyboard. For Mac, you press Cmd+Q, and or Ubuntu it's Ctrl+Q.

## [ 106 ]

## Chapter 2

## Summary

Excellent work!On reaching this point you've completed the Coin Collection Game, as well as your rst game in you Unity. In achieving this, you've seen a wide range o

Unity eatures, including: level editing and design, preabs, particle systems, meshes, components, script les, and build settings. That's a lot! O course, there's a lot more to be said and explored or all these areas, but nevertheless, we've pulled them together to make a game. Next, we'll get stuck in with a dierent game altogether; and in doing this we'll see a creative reuse o the same eatures, as well as the introduction o completely new eatures. In short, we're going to move rom the world o beginner level Unity development to intermediate...

## [ 107 ]

## Chapter 3

### Project B: The Space Shooter

This chapter enters new territory now as we begin development work on our second game, which is a twin-stick space shooter. The twin-stick genre simply reers to any game in which the player input or motion spans two dimensions or axes, typically one axis or movement and one or rotation. Example twin-stick games include: Zombies Ate My Neighbors and Geometry Wars. Our game will rely heavily on coding in C#, as we'll see. The primary purpose o this is to demonstrate by example just how much can be achieved with Unity procedurally (that is, via script), even without using the editor and level building tools. We'll still use those tools to some extent, but not as much here, and that's a deliberate and not an incidental move. Consequently, this chapter assumes you not only completed the game project created in the previous two chapters, but have a good, basic knowledge o C# scripting generally, though not necessarily inside Unity. So let's roll up our sleeves, i we any, and get stuck in making a twin-stick shooter. This chapter covers the ollowing important topics, as well as others:

- 1. Spawning and Preabs
- 2. Twin-Stick Controls and Axial Movement
- 3. Player Controllers and Shooting Mechanics 4. Basic Enemy Movement and AI

Remember to see the game created here, and its related work, in abstract terms; that is, as general tools and concepts with multiple applications. For your own projects, you may not want to make a twin-stick shooter, and that's ne. I cannot possibly know every kind o game you want to make. But it's important to see the ideas and tools used here as being transerrable; as being the kind o things you can creative use dierently or your own games. Being able to see this is very important when working with Unity.

### [ 109 ]

## ![](_page_167_Picture_2.jpeg)

## Project B: The Space Shooter

Beore getting stuck in with the Twin Stick Shooter game, let's see what the completed project looks like and how it works. See Figure 3.1. The game to be created will contain one scene only. In that scene the player controls a space ship that can shoot oncoming enemies. The directional keyboard arrows, and WASD, move the space ship around the level, and it will always turn to ace the mouse pointer. And clicking the let mouse button will re ammo. 00000000000

## The completed twin stick shooter game

The completed 'Twin Stick Shooter' project, as discussed in this chapter and the next, can be ound in the book companion les, inside the Chapter03/Twin Stick Shooter older.

Most assets or this game (including sound and textures) were sourced rom the reely accessible site Open Game Art.org Here you can nd many game assets available through the public domain, or creative commons licenses, or other licenses.

### [ 110 ]

## ![](_page_168_Picture_3.jpeg)

### Getting Started with a Space Shooter

To get started, create a blank Unity 3D project without any packages or specic assets. Details about creating new projects is included in Chapter 1. We'll be coding everything rom scratch this time around. Once a project is generated, create some basic olders to structure and organize the project assets rom the outset. This is very important or keeping track o your les as you work. Create olders or Textures, Scenes, Materials, Audio, Preabs, and Scripts. See Figure 3.2.

## Create folders for structure and organization

### [ 111 ]

## ![](_page_169_Picture_5.jpeg)

## Project B: The Space Shooter

Next, our game will depend on some graphical and audio assets. These are included in the book companion les in the Chapter03/Assets older, but can also be downloaded online rom Open Game Art.org. Let's start with textures or the player space ship, enemy space ships, and star-eld background. Drag and drop the textures rom Windows Explorer or Finder into the Unity Project Panel, inside the Textures older. Unity imports and congures the textures automatically. See Figure 3.3.

Importing Texture assets for the space ship, enemies, star background and ammo

### [ 112 ]

## ![](_page_170_Picture_3.jpeg)

NOTE. Use o the provided assets is optional. You can create your own, i you preer. Just drag and drop your own textures in place o the included assets, and you can still ollow along with the tutorial just ne…

By deault Unity imports image les as regular textures or use on 3D objects, and it assumes their pixel dimensions are a power-2 size (4, 8, 16, 32, 64, 128, 256 etc.). I the size is not actually one o these, then Unity will up-scale or down-scale the texture to the nearest valid size. This is not appropriate behavior however or a 2D top-down space shooter game, in which imported textures should appear at their native (imported) size, without any scaling or automatic adjustment. To x this, select all the imported textures and, rom the Object Inspector, change their Texture Type rom Texture to Sprite (2D and UI). Once changed, click the Apply button to update the settings, and the textures will retain their imported dimensions. See Figure 3.4.

## Changing the Texture Type for imported Textures

## [ 113 ]

## ![](_page_172_Picture_0.jpeg)

## Project B: The Space Shooter

Ater changing the Texture Type setting to Sprite, also remove the check mark rom the box Generate Mip Maps, i this box is enabled. This will prevent Unity rom automatically downgrading the quality o textures based on their distance rom the camera in the scene. This ensures your textures retain their highest quality.

More inormation 2D Texture settings, and Mip Maps, can be ound at the online Unity documentation, available here:

http://docs.unity3d.com/Manual/class-Texture Importer.html. See Figure 3.5.

## Removing Mip Mapping from Imported Textures

## [ 114 ]

## ![](_page_173_Figure_0.jpeg)

Now you can easily drag and drop your textures into the scene, adding them as sprite objects. You can't drag and drop them rom the project panel into the viewport, but you can drag and drop them rom the Project Panel into the Hierarchy Panel. When you do this, the texture will automatically be added as a sprite object in the scene. We'll make requent use o this eature as we work or creating space ship objects. See Figure 3.6.

## Adding Sprites to the Scene…

## [ 115 ]

## ![](_page_175_Picture_0.jpeg)

## Project B: The Space Shooter

Next, let's import music and sound eects, which are also included in the book companion les in the older Chapter03/Assets/Audio. These assets were downloaded rom Open Game Art.org. To import the audio, simply drag and drop the les rom Windows Explorer or Mac Finder into the Project Panel. When you do this, Unity automatically imports and congures the assets. You can give the audio a test rom within the Unity Editor, by pressing Play on the preview tool bar rom the Object Inspector. See Figure 3.7.

## Previewing Audio from the Object Inspector

#### [ 116 ]

## ![](_page_176_Figure_1.jpeg)

As with texture les, Unity imports audio les using a set o deault parameters. These parameters are typically suitable or short sound eects like ootsteps, gun shots and explosions, but or longer tracks like music they can be problematic, causing long level loading times. To x this, select the music track in the Project Panel, and rom the Object Inspector disable the check box Preload Audio Data. And or the Load Type drop down box, select the option Streaming. This ensures the music track is streamed as opposed to loaded whole into memory at level start up. See Figure 3.8.

#### Configuring Music Tracks for Streaming

#### [ 117 ]

## ![](_page_177_Picture_4.jpeg)

### Project B: The Space Shooter

### Creating a Player Object

We've now imported most assets or the twin stick shooter, and we're ready to create a player space ship object. That is, the object which the player will control and move around. Creating this might seem a trivial matter o simply dragging and dropping the relevant player sprite rom the Project Panel into the Scene, but things are not so simple. The player is a complex object with many dierent behaviors, as we'll see.

For this reason, much more care needs to be taken about creating the player. To get started, create an Empty Game Object in the scene by selecting Game Object > Create Empty rom the application menu, and name the object Player. See Figure 3.9.

#### Starting to create the player

### [ 118 ]

## ![](_page_178_Picture_6.jpeg)

The newly created object may or may not be centered at the world origin oổ

(0, 0, 0) and its rotation properties may not be consistently 0 across X, Y and Z.

To ensure a completely zeroed transorm you could manually set the values to 0, by entering them directly into the Transorm component of the object inside the Object Inspector. However, you can set them all to 0 automatically, by clicking the cog icon, at the top-leot corner of the Transorm component, and selecting Reset of the context menu. See Figure 3.10.

Resetting the Transform Component...

### [ 119 ]

## ![](_page_179_Figure_6.jpeg)

## Project B: The Space Shooter

Next, drag and drop the Player drop ship sprite (inside the Textures older) rom the Project Panel into the Hierarchy Panel, making it a child o the empty player object.

Then rotate the drop ship sprite by 90 degrees in X, and -90 degrees in Y. This makes the sprite oriented in the direction o its parent's orward vector, and also fattened onto the ground plane. The game camera will take a top-down view. See Figure 3.11.

## Aligning the Player Ship

## [ 120 ]

## ![](_page_180_Picture_5.jpeg)

You can conurm the ship sprite has been aligned correctly in relation to its parent, by selecting the Player object and viewing the blue of orward vector arrow. The of of the ship sprite and the blue of orward vector should be pointing in the same direction. Io they're not, then continue to rotate the sprite by 90 degrees until they're in alignment.

This will be important later when coding player movement, of making the ship travel in the direction it's looking. See Figure 3.12.

## The blue arrow is called the 'Forward Vector'

#### [ 121 ]

## ![](_page_181_Picture_6.jpeg)

## Project B: The Space Shooter

Next, the player object should react to physics- that is, the player object is solid and eected by physical orces. It must collide with other solids, and also take damage rom enemy ammo when hit. To acilitate this, two additional components should be added to the player object; specically a Rigid Body and a Collider. To do this, select the Player Object (not the sprite object), and choose Component > Physics > Rigidbody rom the application menu. And then choose Component > Physics > Capsule Collider rom the menu. This adds both a Rigidbody and a Collider. See Figure 3.13.

Adding a Rigidbody and Capsule Collider to the Player Object

### [ 122 ]

## ![](_page_182_Figure_6.jpeg)

The Collider Component is used to approximate the volume oổ the object, and the Rigibody Component uses the Collider to determine how physical ổorces should be applied realistically. Let's adjust the Capsule Collider a little, because the deổault settings typically do not match up with the Player Sprite as intended. Speciucally, adjust the Direction, Radius and Height values until Capsule encompasses the Player Sprite and represents the volume oổ the player. See Figure 3.14.

## Adjusting the Space Ship Capsule Collider

#### [ 123 ]

## ![](_page_184_Figure_4.jpeg)

## Project B: The Space Shooter

By deoault, the Rigidbody component is congurred to approximate objects that are aooected by gravity and which oall to the ground, bumping into and reacting to other solids in the scene. This is not appropriate oor a space ship that fies around.

Consequently, the Rigidbody should be adjusted. Speciucally: remove the Use Gravity check mark, to prevent the object orom oalling to the ground. And also enable the Freeze Position Y check box, and the Freeze Rotation Z check box, to prevent the space ship moving and rotating around axes that are undesirable in a 2D top-down game. See Figure 3.15.

Configuring the Rigidbody Component for the Player Space Ship Excellent work! We've now successoully congured the Player Space Ship object. Oổ

course, it still doesn't move or do anything speciuc in-game. That's simply because we haven't added any code yet. That's something we'll turn to next; making the player object respond to user input.

#### [ 124 ]

## ![](_page_185_Picture_5.jpeg)

## Player Input

The Player Object is now created in the scene, congured both with a Rigidbody and Collider component. However, this object doesn't respond to player controls. In a twin stick shooter, the player provides input on two axes, and can typically shoot a weapon. This oten means that keyboard WASD buttons guide player movement up, down, let and right. In addition, mouse movement controls the direction in which the player is looking and aiming; and the let mouse button typically res a weapon.

This is the control scheme required or our game. To implement this, we'll need to create a Player Controller script le. Right-click inside the Scripts older o the Project Panel, and create a new C# script le named Player Controller.cs. See Figure 3.16.

Creating a Player Controller C# Script File Inside the Player Controller.cs script le the ollowing code (as shown in Code Sample 3.1) should be eatured. Comments ollow this sample.

| // |
|-----------------------------------------------|
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Player Controller : Mono Behaviour |
## | { |

```
[ 125 ]
Project B: The Space Shooter
//------------------------------
private Rigidbody This Body = null;
private Transform This Transform = null;
public bool Mouse Look = true;
public string Horz Axis = "Horizontal"; public string Vert Axis = "Vertical";
public string Fire Axis = "Fire1"; public float Max Speed = 5f;
//------------------------------
// Use this for initialization
void Awake ()
{
This Body = Get Component<Rigidbody>(); This Transform =
Get Component<Transform>();
}
//------------------------------
// Update is called once per frame
## ```

## void Fixed Update ()

## {

```
//Update movement
float Horz = Input. Get Axis(Horz Axis);
float Vert = Input. Get Axis(Vert Axis);
Vector3 Move Direction = new Vector3(Horz, 0.0f, Vert);
This Body. Add Force(Move Direction.normalized * Max Speed);
//Clamp speed
This Body.velocity = new Vector3(Mathf. Clamp(This Body.
velocity.x, -Max Speed, Max Speed),
Mathf. Clamp(This Body.
velocity.y, -Max Speed, Max Speed),
Mathf. Clamp(This Body.
velocity.z, -Max Speed, Max Speed));
//Should look with mouse?
if(Mouse Look)
{
//Update rotation - turn to face mouse pointer Vector3 Mouse Pos World =
Camera.main.
Screen ToWorld Point(new Vector3(Input.mouse Position.x, Input.
mouse Position.y, 0.0f));
## ```

```
Mouse Pos World = new Vector3(Mouse Pos World.x, 0.0f,
Mouse Pos World.z);
//Get direction to cursor
Vector3 Look Direction = Mouse Pos World -
This Transform.position;
[ 126 ]
Chapter 3
//Fixed Update rotation
This Transform.local Rotation = Quaternion.
Look Rotation(Look Direction.normalized,Vector3.up);
}
}
}
//------------------------------
Comments on Code Sample 3-1
- 
The Player Controller class should be attached to the Player object in the
## ```

scene. Overall it accepts input rom the player, and will control movement o the space ship

- 

The Awake unction is called once when the object is created at the level start.

During this unction, two components are retrieved, namely the Transorm component or controller player rotation, and the Rigidbody Component or controller Player Movement. The Transform component can be used to control player movement through the Position property, but this ignores collisions and solid objects. The Rigidbody component, in contrast, prevents the player object rom passing through other solids.

- 

The Fixed Update unction is called once on each update o the physics system, which is a xed number o times per second. Fixed Update diers rom Update, which is called once per rame and can vary on a per second basis as the rame rate fuctuates. I you ever need to control an object through the physics system, by using components like Rigidbody, then you should always do so in Fixed Update and not Update. This is a Unity convention that you should remember or best results.

- 

The Input. Get Axis unction is called on each Fixed Update to read axial input data rom an input device, like the keyboard or gamepad. This unction reads rom two named axes, Horizontal (let-right) and Vertical (up-down). These work in a normalized space o -1 to 1. This means that, when the let key is pressed and held down, the Horizontal axis returns -1, and when the right key is being pressed and held down, the Horizontal axis returns 1. A value o

0 indicates either that no relevant key is being pressed, or both let and right are being pressed together, cancelling each other. A Similar principle applies or the vertical axis. Up reers to 1, down to -1, and no key-press relates to 0. More inormation on the Get Axis unction can be ound online at the Unity documentation here: http://docs.unity3d.com/Script Reference/

## Input. Get Axis.html

## [ 127 ]

## Project B: The Space Shooter

- 

The Rigidbody. Add Force unction is used to apply a physical orce to the player object, moving it in a specic direction. Add Force encodes a velocity: moving the object in a specic direction by a specic strength. The direction is encoded inside the Move Direction vector, which is based on player input rom both the Horizontal and Vertical axes. This direction is multiplied by our maximum speed to ensure the object travels as ast as needed. For more inormation on Add Force, see the online Unity documentation here: http://

docs.unity3d.com/Script Reference/Rigidbody. Add Force.html

- 

The Camera. Screen ToWorld Point unction is used to convert the screen position o the mouse cursor within the game window into a position inside the game world, giving the player a target destination to look at. This code is responsible or making the player always look at the mouse cursor.

However, as we'll see soon, some urther tweaking is required to make this code work properly. For more inormation on Screen ToWorld Point, see the Unity online documentation here: http://docs.unity3d.com/Script Reference/

#### Camera. Screen ToWorld Point.html

### Confguring the Game Camera

Code Sample 3.1, as given in the preceding section, allows you to control the player object, but there are some problems. One o them is that the player doesn't seem to ace the position o the mouse cursor, even though our code is designed to achieve this behavior. The reason is because the camera, by deault, is not congured as it needs to be or a top-down 2D game. We'll x that in this section. To get started, the scene camera should have a top-down view o the scene. To achieve this, switch the scene viewport to a top-down 2D view by clicking the View Cube; the up arrow in the top-right hand corner o the scene viewport. This switches your viewport to a top view. See Figure 3.17.

### [ 128 ]

## ![](_page_192_Picture_6.jpeg)

## ![](_page_193_Picture_0.jpeg)

The viewcube can changes viewport perspective...

You can conurm the viewport is in a top view because the viewcube will list Top, as the current view. See Figure 3.18.

## Top View in the Scene Viewport

#### [ 129 ]

## ![](_page_194_Picture_5.jpeg)

## Project B: The Space Shooter

From here, you can have the scene camera conoorm to the viewport camera exactly, giving you an instant top-down view oor your game. To do this, select the Camera in the scene (or or or the Hierarchy Panel), and then choose Game Object > Align with View rom the application menu. See Figure 3.19.

## Aligning the camera to the scene viewport

## [ 130 ]

## ![](_page_195_Picture_3.jpeg)

This makes your game look much better than beore, but there's still a problem.

When the game is running, the space ship still doesn't look at the mouse cursor as intended. This is because the camera is a Perspective camera, and the conversion between a screen point and world point is leading to unexpected results. We can x this by changing the camera into an Orthographic camera, which is a truly 2D

camera that allows no perspective distortion. To do this, select the Camera in the scene, and rom the Object Inspector change the Projection setting rom Perspective to Orthographic.

## Changing the Camera to Orthographic Mode

## [ 131 ]

## ![](_page_197_Picture_0.jpeg)

## Project B: The Space Shooter

Every Orthographic camera has a Size eld in the Object Inspector, which is not present or Perspective Cameras. This eld controls how many units in the world view corresponds to pixels on the screen. We want a 1:1 ratio or relationship between world units to pixels, to ensure our textures appear at the correct size and that cursor movement has the intended eect. The target resolution or our game will be Full HD, which is 1920x1080, and this has an Aspect Ratio o 16:9. For this resolution, the Orthographic Size should be 5.4. The reasons or that value are beyond the scope o this book, but the ormula to arrive at it is Screen Height (in pixels) / 2 / 100. Thereore: 1080 / 2 / 100 = 5.4. See Figure 3.21.

Changing Orthographic Size for a 1:1 Pixel-To-Screen Ratio Finally, make sure your Game tab view is congured to display the game at 16:9

aspect ratio. I it isn't, click on the Aspect drop-down list at the top-let corner o the Game view, and choose the 16:9 option. See Figure 3.22.

#### [ 132 ]

## ![](_page_198_Figure_3.jpeg)

## ![](_page_199_Picture_0.jpeg)

Displaying the game at a 16:9 Aspect Ratio Now try running the game, and you have a player space ship that moves based on WASD input, and also turns to ace the mouse cursor. Great work! See Figure 3.23.

The game is really taking shape. But, there's lots more work to do.

Turning to face the cursor!

### [ 133 ]

## ![](_page_200_Picture_5.jpeg)

## Project B: The Space Shooter

## Bounds Locking

On previewing the game thus ar the space ship probably looks too large. We can x this easily by just changing the scale o the player object. I've used a value o 0.5 or the X, Y and Z axes. See Figure 3.24. But, even with a more sensible scale, a problem remains. Specically, it's possible to move the player outside the boundaries o the screen, without limit. This means the player can fy o into the distance, out o view, and never be seen again. Instead, the camera should remain still and the player movement should be limited to the camera view or bounds so it never exits view.

## Rescaling the Player

There are dierent ways to achieve bounds locking, most o which involve scripting.

One way is to simply clamp the positional values o the player object between a specied range; a minimum and maximum. Consider code sample 3.2 or a new C# class called Bounds Lock. This script le should be attached to the player.

| // |
|------------------------------------------|
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Bounds Lock : Mono Behaviour |
| { |
| // |
| private Transform This Transform = null; |
| public Vector2 Horz Range = Vector2.zero; |
| public Vector2 Vert Range = Vector2.zero; |
## | // |

```
[ 134 ]
Chapter 3
// Use this for initialization
void Awake ()
{
This Transform = Get Component<Transform>();
}
//------------------------------
// Update is called once per frame
void Late Update ()
{
//Clamp position
This Transform.position = new Vector3(Mathf.
Clamp(This Transform.position.x, Horz Range.x, Horz Range.y),
This Transform.
position.y,
Mathf.
Clamp(This Transform.position.z, Vert Range.x, Vert Range.y));
}
## ```

| // |
|----|
| } |
## | // |

## Comments on Code Sample 3-2

- 

The Late Update unction is always called ater all Fixed Update and Update calls, allowing an object to modiy its position beore it's rendered to the screen.

- 

The Mathf. Clamp unction ensures a specied value is capped between a minimum and maximum range.

### [ 135 ]

## ![](_page_203_Picture_7.jpeg)

### Project B: The Space Shooter

To use the Bounds Lock script, simply drag and drop the le onto the Player Object and speciy minimum and maximum values or its position. These values are specied in world position coordinates, and can be determined by temporarily moving the player object to the camera extremes and recording its position rom the Transorm component.

### Setting Bounds Lock

Now take the game or a test run by pressing Play on the tool bar. The player space ship should remain in view and be unable to move o screen. Splendid!

## [ 136 ]

## Chapter 3

#### Health

Both the player space ship and the enemies need health. Health is a measure o a character's presence and legitimacy in the scene; typically scored as a value between 0-100. 0 means death, and 100 means ull health. Now, although health is in many respects specic to each instance (the player has a unique health bar, and each enemy has theirs) there are nevertheless so many things in common, in terms o behavior, between player and enemy health that it makes sense to code health as a separate component and class that can be attached to all objects that need health. Consider Code Sample 3.3, which should be attached to the player, and all enemies or objects that need health. Comments ollow.

using Unity Engine;

using System. Collections;

```
//------------------------------
public class Health : Mono Behaviour
{
public Game Object Death Particles Prefab = null; private Transform
This Transform = null;
public bool Should Destroy OnDeath = true;
//------------------------------
void Start()
{
This Transform = Get Component<Transform>();
}
//------------------------------
public float Health Points
{
get
{
return _Health Points;
}
set
## ```

```
{
_Health Points = value;
if(_Health Points <= 0)
{
Send Message("Die", Send Message Options.
Dont Require Receiver);
if(Death Particles Prefab != null)
[ 137 ]
Project B: The Space Shooter Instantiate(Death Particles Prefab,
This Transform.position, This Transform.rotation);
if(Should Destroy OnDeath)Destroy(game Object);
}
}
}
//------------------------------
[Serialize Field]
private float _Health Points = 100f;
}
//------------------------------
## ```

### Comments on Code Sample 3-3

- 

The health class maintains object health through a private variable \_

Health Points, which is accessed through a C# Property Health Points.

This property eatures both Get and Set accessor, to return and set the health variable.

- 

The \_Health Points variable is declared as a Serialized Field, allowing its value to be visible in the Object Inspector.

- 

The Health class is an example o Event Driven Programming. This is because the class could have continually checked the status o object health during an Update unction; checking to see i the object had died by its health alling below 0. But instead, the check or death is made during the C# Property Set method. This makes sense because Set is the only place where health will ever change. This means Unity is saved rom a lot o work each rame. That's a great perormance saving!

- 

This class uses the Send Message unction. This unction lets you call any other public function on any component attached to the object by speciying the unction name as a string. In this case, a unction called Die will be executed on every component attached to the object (i such a unction

### exists). I no unction o matching name exists, then nothing happens or that component.

This is a quick and easy way to run customized behavior on an object in a type-agnostic way without using any polymorphism. The disadvantage is that Send Message internally uses a process called Refection, which is slow and perormance prohibitive. For this reason, Send Message should be used only inrequently or death events and similar events, but not requently, such as every rame. More inormation on Send Message can be ound at the online Unity documentation here:

http://docs.unity3d.com/Script Reference/

### Game Object. Send Message.html

### [ 138 ]

## ![](_page_208_Picture_6.jpeg)

- 

When health oalls below 0, triggering a death condition, the code will instantiate a death particle system, to show an eooet on death, io a particle system is specified (more on this shortly).

When the Health script is attached to the player space ship it appears as a component in the Object Inspector. It contains a weld oor a Death Particle System. This is an optional weld (it can be null), specioying a particle system to be spawned when the object dies. This lets you easily create explosion or blood splatter eooects when objects die. See Figure 3.26.

#### Attaching the Health Script

#### Death and Particles

In this twin stick shooter game both the player and enemies are space ships. When they're destroyed they should explode in a yery ball. This is really the only kind oổ

eổểct that would be believable. To achieve explosions we can use a Particle System.

This simply reoers to a special kind oo object that oeatures two main parts, namely a Hose (or Emitter) and Particles. The Emitter reoers to the part which spawns or generates new Particles into the world, and the Particles are many small objects or pieces that, once spawned, move and travel along their own trajectories. In short, Particle Systems are ideal of creating rain, snow, oog, sparkles, and explosions.

## ![](_page_210_Picture_1.jpeg)

## Project B: The Space Shooter

We can create our own Particle Systems orom scratch, using the menu option Game Object > Particle System, or we can use any pre-made particle system included with Unity. Let's use some of the pre-made particle systems. To do this, import the Particle System package into the Project, by selecting Assets > Import Package > Particle Systems orom the application menu. See Figure 3.27.

Importing Particle Systems into the Project Aổter the Import Dialog appears, leave all settings at their deổaults, and simply click Import to import the complete package, including all particle systems. The Particle Systems will be added to the Project Panel, in the ổolder Standard Assets > Particle Systems > Prefabs. See Figure 3.28. You can test each oổ the Particle Systems by simply dragging and dropping each Preổab into the scene. Note, you can only preview a Particle System in the Scene viewport while it is selected.

## [ 140 ]

## ![](_page_211_Picture_1.jpeg)

Particles Systems imported into the Project Panel Notice rom Figure 3.28 above that an Explosion system is included among the deault assets, which is great news! To test, we can just drag and drop the explosion into the scene, press Play on the tool bar, and see the explosion in action. Good. We're almost done, but there's still a bit more work. We've now seen that an appropriate Particle System is available, and we could just drag and drop that system into the Death Particle System slot in the Health Component, in the Object Inspector. That will work technically: when a player or enemy dies, the explosion system will be spawned, creating an explosion eect. But, the particle system will never be destroyed! This is problematic because, on each enemy death a new particle system will be spawned. And this raises the possibility that, ater many deaths, the scene will be ull o disused particle systems. We don't want that: it's bad or perormance and memory usage to have a scene ull o unused objects lingering around.

## [ 141 ]

## ![](_page_213_Picture_0.jpeg)

## Project B: The Space Shooter

To x this, we'll modiy the explosion system slightly, creating a new and modied preab that'll suit our needs. To create this, drag and drop the existing explosion system anywhere into the scene, and position it at the world origin. See Figure 3.29.

Adding an Explosion System to the Scene for Modification Next, we must rene the particle system to destroy itsel soon ater instantiation.

By making a preab rom this arrangement, each and every generated explosion will eventually destroy itsel. To make an object destroy itsel ater a specied interval, we'll create a new C# Script. I'll name this script Time Destroy.cs. See the ollowing code in Sample 3.4.

## //------------------------------

using Unity Engine;

```
using System. Collections;
//------------------------------
public class Timed Destroy : Mono Behaviour
{
public float Destroy Time = 2f;
[ 142 ]
Chapter 3
//------------------------------
// Use this for initialization
void Start ()
{
Invoke("Die", Destroy Time);
}
// Update is called once per frame
void Die ()
{
Destroy(game Object);
}
## ```

```
//------------------------------
}
//------------------------------
## ```

## Comments on Code Sample 3-4

- 

The Time Destroy class simply destroys the object to which it's attached ater a specied interval (Destroy Time) has elapsed.

- 

The unction Invoke is called inside the Start event. Invoke will execute a unction o the specied name once and only once, ater a specied interval has elapsed. The interval is measured in seconds.

- 

Like Send Message, the Invoke unction relies on Refection. For this reason it should be used sparingly or best perormance.

- 

The Die unction will be executed by Invoke ater a specied interval to destroy the Game Object (such as a Particle System).

## [ 143 ]

## ![](_page_216_Picture_0.jpeg)

## Project B: The Space Shooter

Now drag and drop the Timed Destroy script le onto the explosion Particle System in the scene, and then press Play on the tool bar to test that the code works; that the object is destroyed ater the specied interval, which can be adjusted rom the Object Inspector. See Figure 3.30.

Adding a Time Destroy script to an explosion Particle System

## [ 144 ]

## ![](_page_217_Figure_0.jpeg)

The Time Destroy Script should remove the explosion particle system ater the delay expires. So let's create a new and separate Preab rom this modied version. To do that rename the explosion system in the Hierarchy Panel Explosion Destroy, and then drag and drop the system rom the Hierarchy into the Project Panel, inside the Prefabs older. Unity automatically creates a new Preab, representing the modied particle system. See Figure 3.31.

## Create a Timed Explosion Prefab

### [ 145 ]

## ![](_page_218_Picture_4.jpeg)

## Project B: The Space Shooter

Now drag and drop the newly created preab rom the Project Panel into the Death Particle System slot on the Health Component or the Player, in the Object Inspector.

This ensures the preab is instantiated when the player dies. See Figure 3.32.

### Configuring the Health Script

I you now run the game, you'll see that you cannot initiate a player death event to test the particle system generation. Nothing exists in the scene to destroy or damage the player, and you cannot manually set the Health Points to 0 rom the Inspector in a way that is detected by the C# property set unction. For now, however, we can insert some test death unctionality into the health script that triggers an instant kill when the space bar is pressed. See Code Sample 3.5 or the modied Health Script.

```
//------------------------------
using Unity Engine;
using System. Collections;
//------------------------------
public class Health : Mono Behaviour
{
public Game Object Death Particles Prefab = null; private Transform
This Transform = null;
public bool Should Destroy OnDeath = true;
//------------------------------
void Start()
{
## ```

```
[ 146 ]
Chapter 3
This Transform = Get Component<Transform>();
}
//------------------------------
public float Health Points
{
get
{
return _Health Points;
}
set
{
_Health Points = value;
if(_Health Points <= 0)
{
Send Message("Die", Send Message Options.
Dont Require Receiver);
## ```

```
if(Death Particles Prefab != null)
Instantiate(Death Particles Prefab,
This Transform.position, This Transform.rotation);
if(Should Destroy OnDeath)Destroy(game Object);
}
}
}
//------------------------------
void Update()
{
if(Input. Get Key Down(Key Code. Space))
Health Points = 0;
}
//------------------------------
[Serialize Field]
private float _Health Points = 100f;
}
//------------------------------
[ 147 ]
## ```

## ![](_page_222_Picture_0.jpeg)

## Project B: The Space Shooter

On running the game now, with the modied health script, you can trigger an instant player death by pressing the space bar key on the keyboard. When you do this, the player object is destroyed and the particle system is generated until the timer destroys that too. Excellent work. We now have a playable, controllable player character that supports health and death unctionality. Things are looking good. See Figure 3.33.

## Trigger the Explosion Particle System…

#### Enemies

The next step is to create something or the player to shoot and destroy, and which can also destroy us- namely enemy characters. These take the orm o roaming space ships that will be spawned into the scene at regular intervals and will ollow the player, drawing nearer and nearer. Essentially, each enemy represents a complex o multiple behaviors working together, and these should be implemented as separate scripts. Let's consider them in turn.

- 

#### Health

- 

Each enemy supports health unctionality. They begin the scene with a specied amount o health and will be destroyed when that health alls below 0. We already have a health script created to handle this behavior.

- 

#### Movement

#### [ 148 ]

## ![](_page_223_Picture_7.jpeg)

- 

Each enemy will constantly be in motion, travelling in a straight line along a dorward trajectory. That is, each enemy will continually travel dorwards in the direction it is looking.

- 

### Turning

- 

Each enemy will rotate and turn towards the player, even when the player moves. This ensures the enemy always oaces the player and, in combination with the movement ounctionality, will always be travelling towards the player.

- 

#### Scoring

- 

Each enemy rewards the player with a score value when destroyed.

Thus, the death oổ an enemy will increase the player score.

- 

### Damage

Each enemy causes damage to the player on collision. Enemies cannot shoot, but will harm the player on proximity.

Now we've identied the range o behaviors applicable to an enemy, let's create an enemy in the scene. We'll make one specic enemy, create a preab rom that, and use it as the basis or instantiating many enemies. Start by selecting the player character in the scene and duplicate the object with Ctrl + D, or select Edit > Duplicate rom the application menu. This initially creates a second player. See Figure 3.34.

## Duplicating the Player Object

### [ 149 ]

## ![](_page_226_Picture_6.jpeg)

## ![](_page_227_Picture_0.jpeg)

## Project B: The Space Shooter

Rename the object to Enemy, and ensure it is not tagged as Player; as there should be one and only one object in the scene with the Player tag- namely, the real player.

In addition, temporarily disable the Player game object, allowing us to occus more clearly in the enemy object in the scene tab. See Figure 3.35.

Removing a Player tag from the enemy, if applicable Select the sprite child object oổ the duplicated enemy, and ổrom the Object Inspector click inside the Sprite weld oổ the Sprite Renderer component to pick a new sprite. Pick one oổ the darker imperial ships ổor the enemy character, and the sprite will update of or the object in the viewport. See Figure 3.36.

Selecting a Sprite for the Sprite Renderer component

## [ 150 ]

## ![](_page_228_Figure_1.jpeg)

## ![](_page_228_Figure_2.jpeg)

Ater changing the sprite to an enemy character you may need to adjust the rotation values to align the sprite to the parent orward vector; ensuring the sprite is looking in the same direction as the orward vector. See Figure 3.37.

## Adjusting enemy sprite rotation…

Now select the parent object or the enemy, and remove the Rigid Body component, and the Player Controller and Bounds Lock Components, but keep the Health component as the enemy should support health. See Figure 3.38. In addition, eel ree to resize the Capsule Collider component to better approximate the enemy object.

## Adjusting enemy sprite rotation…

## [ 151 ]

Project B: The Space Shooter Let's start coding the enemy, ocusing on movement. Specically, the enemy should continually move in the orward direction at a specied speed. To achieve this, create a new script le, named Mover.cs. This should be attached to the enemy object. The code or this class is included in Code Sample 3.6.

| // |
|---------------------------|
| using Unity Engine; |
| using System. Collections; |
## | // |

```
public class Mover : Mono Behaviour
{
//------------------------------
private Transform This Transform = null;
public float Max Speed = 10f;
//------------------------------
// Use this for initialization
void Awake ()
{
This Transform = Get Component<Transform>();
}
//------------------------------
// Update is called once per frame
void Update ()
{
This Transform.position += This Transform.forward * Max Speed *
Time.delta Time;
}
## ```

| // | |
|----|--|
| } | |
## | // | |

## Comments on Code Sample 3-6

- 

The Mover Script moves an object at a specied speed (Max Speed/Per Second) along its orward vector. To do that, it uses the Transorm component.

- 

The Update unction is responsible or updating the position o the object.

In short, it multiplies the orward vector by the object speed, and adds that onto its existing position to move the object urther along its line o sight. The value Time.delta Time is used to make the motion rame rate independent; moving the object per second, as opposed to per rame. More inormation on delta Time can be ound at the online Unity documentation here: http://docs.unity3d.com/Script Reference/Time-delta Time.html

## [ 152 ]

## ![](_page_232_Figure_0.jpeg)

Press Play on the tool bar to test run your code. It's always good practice to requently test code like this. Your enemy may move too slow, or too ast. I so, stop playback to exit game mode, and select the enemy in the scene. From the Object Inspector, adjust the Max Speed value o the Mover component. See Figure 3.39.

## Adjusting enemy speed

In addition to moving in a straight line, the enemy should also continually turn to ace the player wherever they move. To achieve this, we'll need another script le that works similarly to the player controller script. Whereas the player turns to ace the cursor, the enemy turns to ace the player. This unctionality should be encoded in a new script le, called Obj Face.cs. This script should be attached to the enemy.

| See Code Sample 3.7. |
|--------------------------------------|
| // |
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Obj Face : Mono Behaviour |
## | [ 153 ] |

```
Project B: The Space Shooter
{
//------------------------------
public Transform Obj ToFollow = null;
public bool Follow Player = false;
private Transform This Transform = null;
//------------------------------
// Use this for initialization
void Awake ()
{
//Get local transform
This Transform = Get Component<Transform>();
//Should face player?
if(!Follow Player)return;
//Get player transform
Game Object Player Obj = Game Object. Find Game Object With Tag("Pla yer");
if(Player Obj != null) Obj ToFollow = Player Obj.
Get Component<Transform>();
## ```

```
}
//------------------------------
// Update is called once per frame
void Update ()
{
//Follow destination object
if(Obj ToFollow==null)return;
//Get direction to follow object
Vector3 Dir ToObject = Obj ToFollow.position - This Transform.
position;
if(Dir ToObject != Vector3.zero)
This Transform.local Rotation = Quaternion.
Look Rotation(Dir ToObject.normalized,Vector3.up);
}
//------------------------------
}
//------------------------------
Comments on Code Sample 3-7
## ```

- 

The Obj Face Script will always rotate an object so that its orward vector points towards a destination point in the scene.

- 

Inside the Awake event, the unction Find Game Object With Tag is called to retrieve a reerence to the one and only object in the scene tagged as a player, which should be the player space ship. The player represents the deault look-at destination or an enemy object.

#### [ 154 ]

## ![](_page_236_Figure_5.jpeg)

- 

The Update unction is called automatically once per rame, and will generate a displacement vector rom the object location to the destination location, and this represents the direction in which the object should be looking. The Quaternion. Look Rotation unction accepts a direction vector and will rotate an object to align the orward vector with the supplied direction. This keeps the object looking towards the destination.

More inormation on Look Rotation can be ound at the online Unity documentation here: http://docs.unity3d.com/Script Reference/

### Quaternion. Look Rotation.html

This is looking excellent! But beore testing this code, make sure the Player object in the scene is tagged as Player, and is enabled, and that the enemy is oset away rom the player. Be sure to enable the check box Follow Player rom the Obj Face component in the Object Inspector. When you do this, the enemy will always turn to ace the player. See Figure 3.40.

## Enemy space ship moving towards player…

## [ 155 ]

## ![](_page_238_Picture_0.jpeg)

## Project B: The Space Shooter

Now, i and when the enemy nally collides with the player, it should deal damage and potentially kill the player. To achieve this, a collision between the enemy and player must be detected. Let's start by conguring the enemy. Select the enemy object, and rom the Object Inspector enable the check box Is Trigger in the Capsule Collider component. This changes the Capsule Collider component to allow or a true intersection between the player and enemy, prevent Unity rom blocking the collision. See Figure 3.41.

## Changing the Enemy Collider to a Trigger

Next, we'll create a script that detects collisions and will continually deal damage to the player as and when they occur, and or as long as the collision state remains. See the ollowing Code Sample 3.8 (Proxy Damage.cs), which should be attached to the enemy character.

## //------------------------------

using Unity Engine;

### using System. Collections;

## //----

## public class Proxy Damage: Mono Behaviour

## {

## [ 156 ]

## ![](_page_239_Picture_5.jpeg)

```
//------------------------------
//Damage per second
public float Damage Rate = 10f;
//------------------------------
void On Trigger Stay(Collider Col)
{
Health H = Col.game Object. Get Component<Health>(); if(H == null)return;
H. Health Points -= Damage Rate * Time.delta Time;
}
//------------------------------
}
//------------------------------
## ```

## Comments on Code Sample 3-8

- 

The script Proxy Damage should be attached to an enemy character, and it will deal damage to any colliding object with a health component.

- 

The event On Trigger Stay is called once every rame or as long as an intersection state persists.

Ater attaching the Proxy Damage script to an enemy, use the Object Inspector to set the Damage Rate o the Proxy Damage component. This represents how much health should be reduced on the player, per second, during a collision. For a challenge, I've set the value to 100 health points. See Figure 3.42.

Setting the Damage Rage for a Proxy Damage Component

### [ 157 ]

## ![](_page_241_Picture_4.jpeg)

## Project B: The Space Shooter

Now let's give things a test run. Press Play on the toolbar and attempt a collision between the player and enemy. Ater 1 second, the player should be destroyed.

Things are coming along well. But, we'll need more than one enemy to make things challenging…

### Enemy Spawning

To make the level un and challenging we'll need more than simply one enemy.

In act, or a game that's essentially endless we'll need to continually add enemies.

These should be added gradually over time. Essentially, we'll need either regular or intermittent spawning o enemies, and this section will add that unctionality. Beore we can do that, however, we'll need to make a preab rom the enemy object. That can be achieved easily: select the enemy in the Hierarchy Panel, and then drag and drop it into the Project Panel, in the Preabs older. This creates an Enemy Preab.

See Figure 3.43.

## Creating an Enemy Prefab

Now we'll make a new script (Spawner.cs) that spawns new enemies in the scene over time, within a specied radius rom the Player Space ship. This script should be attached to a new, empty game object inside the scene. See Code Sample 3.9.

| // |
|--------------------------------------|
| using Unity Engine; |
| using System. Collections; |
| // |
| public class Spawner : Mono Behaviour |
| [ 158 ] |
## | Chapter 3 |

```
{
public float Max Radius = 1f;
public float Interval = 5f;
public Game Object Obj ToSpawn = null;
private Transform Origin = null;
//------------------------------
void Awake()
{
Origin = Game Object. Find Game Object With Tag("Player").
Get Component<Transform>();
}
//------------------------------
// Use this for initialization
void Start ()
{
Invoke Repeating("Spawn", 0f, Interval);
}
//------------------------------
## ```

```
void Spawn ()
{
if(Origin == null)return;
Vector3 Spawn Pos = Origin.position + Random.on Unit Sphere *
Max Radius;
Spawn Pos = new Vector3(Spawn Pos.x, 0f, Spawn Pos.z);
Instantiate(Obj ToSpawn, Spawn Pos, Quaternion.identity);
}
//------------------------------
}
//------------------------------
Comments on Code Sample 3-9
## ```

The Spawner class will spawn instances o Obj ToSpawn on each interval o

Interval. The interval is measured in seconds. The spawned objects will be created within a random radius rom a center point Origin.

- 

- 

During the Start event, the unction Invoke Repeating is called to continually execute the Spawn unction on every interval.

The Spawn unction will create instances o the enemy in the scene, at a random radius rom an origin point. Once spawned, the enemy will behave as normal, heading towards the player.

#### [ 159 ]

## ![](_page_245_Picture_3.jpeg)

## Project B: The Space Shooter

The Spawner class is a global behavior that applies scene wide. It does not depend on the player specically, and nor on any specic enemy. For this reason it should be attached to an empty game object. Create one o these by selecting Game Object > Create Empty rom the application menu. Name this Spawner, and attach the Spawner script to it. See Figure 3.44.

### Creating an Empty Game Object

Once added to the scene, rom the Object Inspector drag and drop the Enemy preab into the Obj To Spawn eld in the Spawner component. Set the interval to 2 seconds and increase the Radius to 5. See Figure 3.45.

### [ 160 ]

## ![](_page_246_Figure_2.jpeg)

## ![](_page_246_Picture_3.jpeg)

## Configuring the Spawner for Enemy Objects

And now (drum roll) let's try the level. Press Play on the tool bar and take the game or a test run. You should now have a level with a ully controllable player character surrounding by a growing army o tracking enemy ships! Excellent work.

See Figure 3.46.

## Spawned enemy objects moving towards the player

## [ 161 ]

## Project B: The Space Shooter Summary

Good job on reaching this ar The space shooter is really taking shape now, eaturing a controllable player character that relies on native physics, twinstick mechanics, enemy ships, and a scene wide spawner or enemies. All these ingredients together still don't make a game: we can't shoot, we can't increase the score, and we can't destroy enemies. These issues will need to be addressed, alongside other technical issues that we'll certainly encounter. Nevertheless, we now have a solid oundation or moving urther, and in the next chapter we'll complete the shooter.

## [ 162 ]

## Chapter 4

## Continuing the

### Space Shooter

This chapter continues rom the previous in creating a twin stick space shooter game. At this stage, we have a working game. At least, the gamer can control a space ship using two axes: movement and rotation. WASD keys on the keyboard control movement (up, down, let and right), and the mouse cursor controls rotation; the space ship always rotates to ace the cursor. In addition to player controls, the level eatures enemy characters that spawn at regular intervals, fy around the level, and move towards the player with hostile intent. And nally, both the player and enemies support a Health component, which means both are susceptible to damage and can be destroyed. Right now, however, the player lacks two important eatures: they cannot re a weapon and they cannot increase their score. This chapter tackles these issues and more. Firing weapons, as we'll see, represents a particularly interesting problem. Overall, this chapter considers:

- 

## Weapons and Spawning Ammo

- 

## Memory Management and Pooling

- 

## Sound and Audio

- 

## Scoring

- 

### Debugging and Testing

- 

### Building and Distribution

The completed project so ar can be ound in the book companion iles, in the Chapter04/Start older. You can start here and ollow along with this chapter, i you don't have your own project already

### [ 163 ]

## ![](_page_249_Picture_6.jpeg)

## Continuing the Space Shooter

#### Guns and Gun Turrets

Let's start tackling weapons in detail. Specically, the level contains a player and enemy ships. The player must shoot enemies but, right now, cannot do so. See Figure 4.1. On thinking careully about weapons we identiy three main concepts or 'things'

which needs development: First, there's the spawner or generator- the object that actually res ammo into the scene when the re button is pressed. Second, there's the ammo itsel which, once generated, travels through the level on its own. And third, there's the ability or ammo to collide with other objects and to damage them.

## The game so far…

#### [ 164 ]

## ![](_page_250_Picture_4.jpeg)

Tackling each area in order, we begin with turrets- the points where bullets are spawned and ured. For this game, the player will have only one turret; but ideally the game should support the addition oổ more, iổ desired, allowing the player to dual-ure, or more! To create the urst turret, add a new Empty game object to the scene by selecting Game Object > Create Empty ổrom the application menu. Name this Turret. Then position the turret object to the ổront oổ the space ship, making sure the blue ổorward-vector arrow is pointing ahead, in the direction that ammo will be ured. Then unally make the turret a child oổ the space ship by dragging and dropping inside the hierarchy panel. See Figure 4.2.

Positioning a Turret Object as a child of the Space Ship Creating a turret object of the ammo as a spawn location is a splendid beginning, but of ammo to actually be ured, we'll need an ammo object. Speciucally, we'll create an ammo preoab that can be instantiated as ammo, when needed. We'll do that next.

## [ 165 ]

## ![](_page_252_Picture_0.jpeg)

#### Continuing the Space Shooter

#### Ammo Prefabs

When the player presses the wre button, the spaceship should shoot ammo objects into the scene. These objects will be based on an ammo preoab. Let's create that preoab now. To start, we'll convigure the texture to be used as an ammo graphic.

Open the Textures oolder inside the Project Panel, and select the Ammo Texture.

This texture ổeatures several diổ ổerent versions oổ an ammo sprite, aligned in a row side by side. See Figure 4.3. When ammo is ured we don't want to show the complete texture; instead, we want to show either just one oổ the images or the images played as animation sequence, ổrame by ổrame.

## Preparing to create an Ammo Prefab

## [ 166 ]

## ![](_page_253_Figure_2.jpeg)

Presently, Unity recognizes the texture (and each ammo element) as a complete unit. We can use the Sprite Editor, however, to separate each part. To do that, select the Texture in the Project (iổ it's not already selected), and then (ổrom the Object Inspector) change the Sprite Mode drop-down ổrom Single to Multiple. This signiues that more than one sprite is contained within the texture space. See Figure 4.4.

Select Multiple Sprites for textures featuring more than one sprite

#### [ 167 ]

## ![](_page_254_Figure_4.jpeg)

### Continuing the Space Shooter

Click the Apply button, and then click the Sprite Editor button orom the Object Inspector. This opens the sprite editor, allowing you to separate each sprite. To do this, click and drag your mouse to box-select each individual sprite, making sure the pivot is aligned to the object center. See Figure 4.5. Then Click Apply to accept the changes.

Separating multiple sprites within the Sprite Editor Aoter accepting the changes inside the Sprite Editor, Unity automatically cuts the relevant sprites into separate units, each oo which can now be selected as a separate object inside the Project Panel. Click the right-arrow at the side oo the texture, and all sprites within will expand outwards. See Figure 4.6.

#### [ 168 ]

## ![](_page_255_Picture_3.jpeg)

## ![](_page_256_Figure_0.jpeg)

## Expand all sprites within a texture

Now drag and drop one o the sprites rom the Project Panel into the Scene, via the Hierarchy Panel. On doing this, it will be added as a sprite object. This represents the beginning o our ammo preab. The sprite itsel may not initially be oriented to ace upwards at the game camera. I so, rotate the sprite by 90 degrees until it looks correct. See Figure 4.7.

## Aligning the ammo sprite

#### [ 169 ]

## ![](_page_257_Picture_6.jpeg)

### Continuing the Space Shooter

Now create a new, empty game object in the scene (Game Object > Create Empty rom the application menu), and rename it to Ammo. Make this new object a parent o the ammo sprite, and ensure its local orward vector is pointing in the direction the ammo should travel. We'll soon reuse the Mover script (Created in the previous chapter) on the ammo to make it move.

### Building an Ammo Object

Drag and drop the Mover.cs script rom the Project Panel onto the Ammo parent object, via the Hierarchy Panel, to add it as a component. Then select the Ammo object and, rom the Object Inspector, change the ammo Max Speed in the Mover component to 7. And nally, add a box collider to the object or approximating its volume (Component > Physics > Box Collider rom the application menu), and then test this all in the viewport by pressing Play on the toolbar. The Ammo object should shoot orwards, as though red rom a weapon. I it incorrectly moves up or down, then make sure the parent object is rotated so that its blue, orward vector really is pointing orwards. See Figure 4.9.

#### [ 170 ]

## ![](_page_258_Figure_4.jpeg)

## ![](_page_259_Figure_0.jpeg)

Moving forwards with an Ammo Prefab (Mover and Collider) Next, add a Rigid Body component to the ammo, to make it part o the Unity physics system. To do this, select the Ammo object and choose Component > Physics > Rigidbody rom the application menu. Then, rom the Rigidbody component in the Object Inspector, disable the check box Use Gravity, to prevent the ammo rom alling to the ground during gameplay. For our purposes, gravity need not apply to the ammo, since it should simply travel along and eventually be destroyed. This highlights an important point in game development generally: real world physics need not apply to every object accurately. We only need enough physics to make objects appear correct to the player when they're looking. See Figure 4.10.

## Removing Gravity from the Ammo Object

## [ 171 ]

Continuing the Space Shooter In addition to adding a mover script and physics components, we also need the ammo to behave distinctly. Specically, it should damage the objects with which it collides, and it should also destroy or disable itsel on collision. To achieve this, a new script le must be created, Ammo.cs. The ull code or this is included in Sample 4-1 below.

| // |
|---------------------------|
| using Unity Engine; |
## | using System. Collections; |

```
//------------------------------
public class Ammo : Mono Behaviour
{
public float Damage = 100f;
public float Life Time = 2f;
//------------------------------
void On Enable()
{
Cancel Invoke();
Invoke("Die", Life Time);
}
//------------------------------
// Update is called once per frame
void On Trigger Enter(Collider Col)
{
//Get health component
Health H = Col.game Object. Get Component<Health>(); if(H == null)return;
H. Health Points -= Damage;
## ```

```
//----
void Die()
{
    game Object. Set Active(false);
}
//------
}
//-----------------------
## ```

## [ 172 ]

## ![](_page_262_Figure_2.jpeg)

## Comments on Code Sample 4-1

- 

The Ammo class should be attached to the Ammo preab object, and will be instantiated or all ammo objects created. Its main purpose is to damage any objects with which it collides

- 

The On Trigger Enter unction is invoked or the ammo when it enters a trigger attached to a moveable unit, like the player or enemies. Specically, it retrieves the Health component attached to the object, i it has one, and reduces its health by the Damage amount. The Health component was created in the previous chapter

- 

Notice also that each ammo object will have a Lifetime. This represents the amount o time in seconds or which the ammo should remain 'alive' and

'active' ater it is red and generated in the scene. Ater the lietime expires, the ammo should either be destroyed entirely, or deactivated (more on this shortly).

- 

The Invoke unction is used to deactivate the ammo object ater the Lifetime interval. This happens during the On Enable event. This is called automatically by Unity each time an Object is activated (that is, changed rom being disabled to enabled).

Now drag and drop the Ammo script le rom the Scripts older in the Project Panel onto the Ammo object, and then nally drag and drop the whole Ammo object in the scene back into the Project Panel, inside the Prefabs older, to create a new Ammo Preab, See Figure 4.11.

### Creating an Ammo Prefab

#### [ 173 ]

Continuing the Space Shooter Congratulations! You've now created an Ammo Preab, which can be spawned rom weapon points to attack enemies directly. This is good, but we've still not handled the spawning process itsel, and we'll address that next.

### Ammo Spawning

The Ammo preab created so ar presents us with a technical problem which, i not taken seriously, has the potential to cause some serious perormance penalties or our game. Specically, when the space ship weapon is red, we'll need to generate ammo that launches into the scene and destroys the enemies on collision. This is ne in general, but the problem is that the player could potentially press the re button many times in quick succession, and could even hold down the re button or long periods o time, and thereby spawn potentially hundreds o ammo preabs.

We could, o course, use the Instantiate unction seen already to generate those preabs dynamically, but this is problematic because instantiate is computationally expensive. When used to generate many items in succession, it will typically cause a nightmarish slow-down that'll reduce the FPS to unacceptable levels. We need to avoid this!

The solution is known as 'Pooling', or 'Object Pooling' or 'Object Caching'. In essence, it means we must spawn a large and recyclable batch o ammo objects at the level start-up (a pool o objects) which, initially, begin hidden or deactivated, and we simply activate the objects as and when needed (when the player res a weapon).

When the ammo collides with an enemy, or when its lietime expires, we don't destroy the object entirely; we simply deactivate it again, returning it to the pool or re-use later i needed. In this way, we avoid all calls to Instantiate and simply re-cycle all ammo objects that we have. To get started at coding this unctionality, we'll make an Ammo Manager class. This class will be responsible or two eatures:

rst, generating a pool o ammo objects at scene start-up; and second, or giving us a valid and available ammo object rom the pool on demand, such as on weapon-re.

Consider the ollowing Ammo Manager code in Sample 4.2 to achieve this, as below.

| // | |
|-----------------------------------|--|
| using Unity Engine; | |
| using System. Collections; | |
## | using System. Collections. Generic; | |

```
//------------------------------
public class Ammo Manager : Mono Behaviour
{
//------------------------------
//Reference to ammo prefab
public Game Object Ammo Prefab = null;
[ 174 ]
Chapter 4
//Ammo pool count
public int Pool Size = 100;
public Queue<Transform> Ammo Queue = new Queue<Transform>();
//Array of ammo objects to generate
private Game Object[] Ammo Array;
public static Ammo Manager Ammo Manager Singleton = null;
//------------------------------
// Use this for initialization
void Awake ()
{
## ```

```
if(Ammo Manager Singleton != null)
{
Destroy(Get Component<Ammo Manager>()); return;
}
Ammo Manager Singleton = this;
Ammo Array = new Game Object[Pool Size];
for(int i=0; i<Pool Size; i++)
{
Ammo Array[i] = Instantiate(Ammo Prefab, Vector3.zero,
Quaternion.identity) as Game Object;
Transform Obj Transform = Ammo Array[i].
Get Component<Transform>();
Obj Transform.parent = Get Component<Transform>();
Ammo Queue. Enqueue(Obj Transform);
Ammo Array[i]. Set Active(false);
}
}
//------------------------------
public static Transform Spawn Ammo(Vector3 Position, Quaternion
Rotation)
## ```

```
{
//Get ammo
Transform Spawned Ammo = Ammo Manager Singleton. Ammo Queue.
Dequeue();
Spawned Ammo.game Object. Set Active(true);
Spawned Ammo.position = Position;
Spawned Ammo.local Rotation = Rotation;
[ 175 ]
Continuing the Space Shooter
//Add to queue end
Ammo Manager Singleton. Ammo Queue. Enqueue(Spawned Ammo);
//Return ammo
return Spawned Ammo;
}
//------------------------------
}
//------------------------------
Comments on Code Sample 4-2
## ```

- 

The Ammo Manager eatures an Ammo Array member variable, which holds a complete list o all ammo objects generated at start-up (during the Awake event).

- 

The Ammo Array will be sized to Pool Size. This reers to the total number o ammo objects to be generated.

- 

Once generated, each ammo object is deactivated with Set Active(false) and is held in the pool until needed.

- 

Ammo Manager uses the class Queue, rom the Mono Library, to manage how specic ammo objects are selected rom the pool to be activated when re is pressed. The queue works as a FIFO object (First in, First out). That is, ammo objects are added to the queue, one at a time, and can be removed when selected to be activated. The object removed rom the queue is always the object at the ront. More inormation on the Queue class can be ound online here: https://msdn.microsoft.com/en-us/

library/7977ey2c%28v=vs.110%29.aspx

- 

The Enqueue unction o the Queue object is called during Awake to add objects initially into the queue, one by one, as they are generated.

- 

The Spawn Ammo unction should be called to generate a new item o ammo in the scene. This unction does not rely on the Instantiate unction, but uses the Queue object instead. It removes the rst ammo object rom the queue, activates it, and then adds it to the end o the queue again, behind all the other ammo objects. In this way, a cycle o generation and regeneration happens, allowing all ammo objects to be recycled.

- 

The Ammo Manager is coded as a Singleton Object, meaning that one and only one instance o the object should exist in the scene at any one time. This unctionality is achieved through the static member Ammo Manager Singleton.

For more inormation on Singleton Objects, see my Packt book 'Mastering Unity Scripting;: https://www.packtpub.com/game-development/

mastering-unity-5x-scripting

## [ 176 ]

## ![](_page_271_Figure_0.jpeg)

To use this class, create a new Game Object in the scene, called Ammo Manager, by selecting Game Object > Create Empty rom the application menu. Then drag and drop the Ammo Manager script rom the Project Panel onto the Object in the scene. Once created, drag and drop the Ammo Preab, rom the preabs older, into the Ammo Prefab slot or the Ammo Manager component in the Object Inspector See Figure 4.12.

## Adding the Ammo Manager to an Object

Now the scene eatures an Ammo Manager object or holding an Ammo Pool, o screen and hidden. But still nothing about our existing unctionality actually connects a re button press, rom the gamer, with the generation o ammo in the scene. That is, we have no code to actually make the ammo visible and working!

This connection should now be made, via the Player Controller script that we started in the previous chapter. This class should now be amended to handle ammo generation. The recoded Player Controller class is included in code sample 4-3 below.

| Amendments are highlighted. |
|-----------------------------|
| // |
| using Unity Engine; |
## | using System. Collections; |

```
//------------------------------
public class Player Controller : Mono Behaviour
{
//------------------------------
private Rigidbody This Body = null;
[ 177 ]
Continuing the Space Shooter private Transform This Transform = null;
public bool Mouse Look = true;
public string Horz Axis = "Horizontal"; public string Vert Axis = "Vertical";
public string Fire Axis = "Fire1"; public float Max Speed = 5f;
public float Reload Delay = 0.3f;
public bool Can Fire = true;
public Transform[] Turret Transforms;
//------------------------------
// Use this for initialization
void Awake ()
{
This Body = Get Component<Rigidbody>(); This Transform =
Get Component<Transform>();
## ```

```
}
//------------------------------
// Update is called once per frame
void Fixed Update ()
{
//Update movement
float Horz = Input. Get Axis(Horz Axis);
float Vert = Input. Get Axis(Vert Axis);
Vector3 Move Direction = new Vector3(Horz, 0.0f, Vert);
This Body. Add Force(Move Direction.normalized * Max Speed);
//Clamp speed
This Body.velocity = new Vector3(Mathf. Clamp(This Body.
velocity.x, -Max Speed, Max Speed),
Mathf. Clamp(This Body.
velocity.y, -Max Speed, Max Speed),
Mathf. Clamp(This Body.
velocity.z, -Max Speed, Max Speed));
//Should look with mouse?
if(Mouse Look)
## ```

```
{
//Update rotation - turn to face mouse pointer Vector3 Mouse Pos World =
Camera.main.
Screen ToWorld Point(new Vector3(Input.mouse Position.x, Input.
mouse Position.y, 0.0f));
[ 178 ]
Chapter 4
Mouse Pos World = new Vector3(Mouse Pos World.x, 0.0f,
Mouse Pos World.z);
//Get direction to cursor
Vector3 Look Direction = Mouse Pos World -
This Transform.position;
//Fixed Update rotation
This Transform.local Rotation = Quaternion.
Look Rotation(Look Direction.normalized,Vector3.up);
}
//Check fire control
if(Input. Get Button Down(Fire Axis) && Can Fire)
{
## ```

```
foreach(Transform T in Turret Transforms)
Ammo Manager. Spawn Ammo(T.position, T.rotation); Can Fire = false;
Invoke ("Enable Fire", Reload Delay);
}
}
//------------------------------
void Enable Fire()
{
Can Fire = true;
}
//------------------------------
public void Die()
{
Destroy(game Object);
}
}
//------------------------------
## ```

## Comments on Code Sample 4-3

- 

Player Controller now eatures an array variable Turret Transform, listing all child empties being used as turret spawn locations.

- 

During the Update unction, the Player Controller checks or Fire button presses. I detected, the code cycles through all turrets and spawns one ammo object at each turret location.

- 

Once ammo is red, a Reload Delay is engaged. This means the delay must rst expire beore new ammo can be red again.

## [ 179 ]

## ![](_page_278_Figure_0.jpeg)

### Continuing the Space Shooter

Ater adding this code to the Player Controller, select the Player object in the scene and then drag and drop the Turret empty into the Turret Transform slot. This example uses only one turret, but you could add more i desired. See Figure 4.13.

Configuring the Turret Transforms for spawning ammo And now you're ready to play-test and re ammo. By playing the scene and pressing Fire on the keyboard or mouse (let-click), ammo will be generated. Excellent! But on testing this, you may notice two main problems. First, the ammo appears too big or too small. And second, the ammo sometimes bounces, or fips, or reacts to the player spaceship. Let's x these in turn.

I the ammo appears wrongly sized, you can simply change the scale o the preab.

Select the Ammo preab in the Project Panel, and rom the Object Inspector enter a new scale into the Transorm component. See Figure 4.14.

### [ 180 ]

## ![](_page_279_Figure_3.jpeg)

## ![](_page_279_Figure_4.jpeg)

## Changing the Ammo Prefab Scale

I the ammo appears to bounce or react to the player spaceship, then we'll need to make the ammo 'immune' or 'unresponsive' to the player. To achieve this, we can use Physics Layers. In short, both the Player Space Ship and Ammo should be added to a single Layer, and all objects on this layer should be dened as immune rom each other in terms o physical reactions. First, select the Player Object in the scene. Then rom the Object Inspector, click the Layer Drop Down, and choose Add Layer rom the context menu. See Figure 4.15.

## Creating a New Layer for Physics Exclusions

## [ 181 ]

## ![](_page_281_Picture_0.jpeg)

#### Continuing the Space Shooter

Name the Layer Player. This is to indicate that all objects attached to the layer are associated with the Player. See Figure 4.16.

Creating a New Layer for Physics Exclusions Now assign both the Player object in the scene, and the Ammo Preab in the Project Panel, to the newly created Player layer. Select each, and simply click the Layer dropdown, selecting the Player option. See Figure 4.17. I prompted with a popup dialog, choose to Change Children also. This makes sure all child objects are also associated with the same Layer as the parent.

## [ 182 ]

## ![](_page_282_Figure_0.jpeg)

## ![](_page_283_Picture_0.jpeg)

Assigning the Player and Ammo to the Player layer…

Both the Player and Ammo have now been assigned to the same layer. From here we can make all objects in the same layer immune rom each other insoar as Physics applies. To do this, select Edit > Project Settings > Physics rom the application menu.

See Figure 4.18.

## Accessing Physics Options

#### [ 183 ]

## ![](_page_284_Picture_6.jpeg)

### Continuing the Space Shooter

The global Physics Settings appear inside the Object Inspector. At the bottom o the Inspector, the layer collision matrix displays how layers aect each other.

Intersecting layers with a check mark can and will aect each other. For this reason, remove the check mark or the Player layer to prevent collisions occurring between objects on this layer. See Figure 4.19.

Setting the Layer Collision Matrix for improved collisions

#### [ 184 ]

## ![](_page_285_Picture_6.jpeg)

With the Layer Collision Matrix set orom the Object Inspector, test run the game so oar by pressing Play on the toolbar. When you do this, and press ure, ammo will issue orom the turrets and no longer react to the player spaceship. The ammo should however collide with, and destroy, the enemies. See Figure 4.20.

Destroying enemies by shooting guns!

Excellent work! We now have a spaceship that can we weapons and destroy enemies; and the physics works as expected. But maybe you'd like to customize player controls a little- or perhaps you want to use a gamepad. The next section will explore this issue ourther.

#### **User Controls**

Maybe you don't like the deoault controls and the key combinations associated to the input axes "Horizontal", "Vertical" and "Fire1". Maybe you want to change them.

These input axis are read using the Input. Get Axis ounction (shown earlier) and are specified by human readable names, but it's not immediately clear how unity maps specific input buttons and devices to these virtual axes. Here, we'll see briefy how to customize these.

## [ 185 ]

## ![](_page_287_Picture_0.jpeg)

## Continuing the Space Shooter

To get started, let's access the Input settings, by selecting Edit > Project Settings > Input rom the application menu. See Figure 4.21.

## Accessing the Input Menu…

## [ 186 ]

## ![](_page_288_Picture_0.jpeg)

On selecting this option, a collection o custom-dened input axes appear as a list in the Object Inspector. See Figure 4.22. This denes all axes used by the input system.

The axes 'Horizontal' and 'Vertical' should be listed here.

## Exploring the input axes

## [ 187 ]

## ![](_page_289_Picture_5.jpeg)

## Continuing the Space Shooter

By expanding each axis in the Object Inspector you can easily customize how user input is mapped. That is, how specic keys and controls on hardware devices, like a keyboard and a mouse, will map to an axis. The Horizontal Axis, or example, is dened twice. For the rst denition, Horizontal is mapped to the left, right, and A and D keys on the keyboard. Right and D are mapped as Positive buttons because, when pressed, they produce positive foating-point values orom the Input. Get Axis ounction (between 0-1). Left and A are mapped as Negative buttons because, when pressed, they result in negative foating-points values oor Input. Get Axis. This makes it easy to move objects leot and right; by using negative and positive numbers. See Figure 4.23.

#### Configuring an Input Axis

Notice that Horizontal is deuned twice in the Object Inspector, once near the top oổ

the list and once near the bottom. These two deunitions are accumulative, and not contradictory- they stack atop one another. They allow you to map multiple devices to the same axis, giving you cross-platổorm and multidevice control over your games. By deổault, Horizontal is mapped in the urst deunition to the left, right, A and D keys on the keyboard; and in the second deunition to joystick motion. Both deunitions are valid and work together. You can have as many deunitions ổor the same axis as you need; depending on the controls you need to support. See Figure 4.24.

## [ 188 ]

## ![](_page_291_Figure_0.jpeg)

## Defining two Horizontal Axes

For this project the controls will remain at their deaults, but go ahead and change or add additional controls i you want to support dierent congurations.

More inormation on Player Input and customizing controls can be ound at the online Unity documentation here: http://docs.unity3d.com/Manual/class-Input Manager.html

## [ 189 ]

## ![](_page_292_Picture_5.jpeg)

## Continuing the Space Shooter

### Scores and Scoring – UI and Text Objects

Let's move onto to the scoring system and, in creating this, we'll create a Game Controller. The Game Controller is simply a script or class that manages all game-wide and overarching behavior. This includes the Score because, or this game, the score reers to one, single and global number representing the achievements and progress o the player. Beore jumping into implementation, start by creating a simple GUI or displaying the game score. GUI is an acronym or Graphic User Interace, and this reers to all the 2D graphical elements that sit atop the game window and provide inormation to the player. To create this, create a new GUI canvas object by selecting Game Object > UI > Canvas rom the application menu. See Figure 4.25.

## Adding a Canvas Object to the Scene…

### [ 190 ]

## ![](_page_293_Picture_4.jpeg)

The Canvas object degrees the total suroace or area inside which the GUI lives, including all buttons, text and other widgets. On being generated in the scene, the Canvas also oeatures in the Hierarchy panel. Initially, the Canvas may be too large or too small to be seen clearly inside the viewport; so select the Canvas object in the hierarchy panel and press the F key on the keyboard to oocus the object. It should appear as a large vertically aligned rectangle. See Figure 4.26.

Examining the Canvas Object in the Viewport The Canvas object is not visible itselő inside the Game tab. Rather, it acts simply as a container. Even so, it strongly infuences how contained objects appear on screen, in terms oổ size, position and scale. For this reason, beổore adding objects and reuning the design oổ an interőace, it's helpổul to conugure your canvas object urst.

## [ 191 ]

## ![](_page_295_Picture_0.jpeg)

### Continuing the Space Shooter

To do this, select the Canvas Object in the scene, and rom the Object Inspector, click the UI Scale Mode drop-down option rom the Canvas Scaler Component. From the drop-down list, choose the option Scale with Screen Size, and enter a HD resolution into the Reference Resolution Field. That is, speciy 1920 or the X eld, and 1080 or the Y Field. See Figure 4.27.

## Adjusting the Canvas Scaler Component

## [ 192 ]

## ![](_page_296_Figure_0.jpeg)

By adjusting the canvas scaler to Scale with Screen Size, the User Interoace of the game will automatically stretch and shrink (up and down-scale) to ut the target resolution, ensuring each element is scaled to the same proportions, maintaining the overall look and of eel. This is a quick and easy method of creating a UI once and to have it adjust size to ut nearly any resolution. It may not always be the best solution to maintaining the highest quality graphical udelity, but it's of ounctional and suitable in many cases. In any case, before proceeding with UI design, it's helpoul to see both the Scene Viewport and Game Tab side by side in the interoace (or across two monitors, io you have a multi-monitor conuguration). This allows us to build the interoace inside the scene viewport, and then to preview its eooects in the Game Tab.

You can rearrange the Scene and Game tabs simply by dragging and dropping the Game Tab beside the Scene Tab in the Unity Editor. See Figure 4.28.

Docking the Scene and Game tabs side by side...

## [ 193 ]

## ![](_page_298_Picture_0.jpeg)

#### Continuing the Space Shooter

Next, let's add the text widget to the GUI oor displaying the game score. To do this, select the Canvas object in the hierarchy panel, and then right-click that object (in the hierarchy panel) to display a context menu. From here, select UI > Text. This creates a new text object as a child oo the Canvas object, as opposed to a top-level object with no parent. See Figure 4.29. The text object is useful or drawing text on-screen with a specific color, size and on setting.

#### Creating a text object for the UI

By deoault, the text object may not initially appear visible in either the scene or the viewport, even though it's listed as an object in the Hierarchy Panel. However, look more closely in the scene and you're likely to see very small and dark text, which appears both inside the Canvas and in the Game tab. See Figure 4.30. By deault, new text objects eature black text at a small ont size. For this project, these settings will need to be changed.

## [ 194 ]

## ![](_page_299_Picture_2.jpeg)

## ![](_page_299_Picture_3.jpeg)

Newly created text objects can sometimes be difficult to see…

Select the text object in the hierarchy panel, i it's not already selected, and rom the Object Inspector (in the Text Component), change the text color to white, and the size to 20. See Figure 4.31.

## Changing text size and color

#### [ 195 ]

## ![](_page_300_Picture_5.jpeg)

#### Continuing the Space Shooter

The text however still appears too small, even ater changing its size. I you increase the size urther, however, the text may disappear rom view. This happens because each text object has a rectangular boundary, dening its limits, and when the ont size increases beyond what can t inside the boundary, the text automatically hides altogether. To x this, we'll increase the text boundary. To do that, switch to the Rect Transform tool with T, or select the tool rom the Tool bar. See Figure 4.32.

### Selecting the Rect Transform Tool

On activating the Rect Transorm Tool, a clearly dened boundary will be drawn around the selected text object in the Scene viewport, indicating its rectangular extents. Let's increase the boundary size to accommodate larger text. To do this, simply click and drag on the boundary edges with the mouse to extend them as needed. See Figure 4.33. This will increase the boundary size, and now you can increase the ont size to improve text readability.

#### [ 196 ]

## ![](_page_301_Picture_4.jpeg)

## ![](_page_302_Picture_0.jpeg)

Adjust the Text Rectangle to support larger font sizes In addition to setting the text boundary size, the text can also be vertically aligned to the boundary center. Simply click the center alignment button of the vertical group.

For horizontal alignment, the text should remain leổt-aligned, to allow ổor the score display. See Figure 4.34.

## Aligning Text within the Boundary

#### [ 197 ]

## ![](_page_303_Picture_5.jpeg)

### Continuing the Space Shooter

Although the text is now aligned vertically within its containing boundary, we'll still need to align it as a whole to the Canvas container, to ensure it remains on-screen at the same position and orientation, even iổ the Game window is resized and realigned. To do this, we'll use Anchors. To start, use the Transổorm tool (W) to reposition the text object to the top-right corner oổ the screen, at the location where the score should appear. The object will automatically move within a 2D plane, as opposed to within 3D space. As you move the text object in the Scene Viewport, check its appearance in the Game tab to ensure it looks correct and appropriate.

See Figure 4.35.

Positioning the Score Text within the Game Tab To secure the position oổ the text object on-screen (preventing it ổrom sliding or moving), even iổ the Game tab is resized by the user, we can set the Object's anchor position to the top-right corner oổ the screen. This ensures the text is always positioned as a constant, proportional oổổset ổrom its anchor. To do this, click the Anchor preset button, inside the Rect Transform component, in the Object Inspector.

When you do this, a preset menu appears, ổrom which you can choose a range oổ alignment locations. Each present is graphically presented as a small diagram, including a red dot at the location oổ anchor alignment. Select the top-right preset.

See Figure 4.36.

## [ 198 ]

## ![](_page_305_Picture_0.jpeg)

## Aligning the text object to the screen…

Excellent work! The text object is now created and ready to use. O course, in play mode, the text remains unchanged and doesn't display a real score. That's because we need to add some code. But, overall, the text object is in place and we can move on…

## Working with Scores – Scripting with Text

To display a score in the GUI, we'll rst need score unctionality; that is, code to create a score system. Essentially, the score unctionality will be added to a general, overarching Game Controller class, responsible or all game-wide logic and eatures.

The code or the Game Controller and its score eature set is included in Code Sample 4-4, as below. This le should be added to the Scripts older o the project.

```
using Unity Engine;
using System. Collections;
using Unity Engine. UI;
//------------------------------
public class Game Controller : Mono Behaviour
{
//Game score
## ```

```
public static int Score;
[ 199 ]
Continuing the Space Shooter
//Prefix
public string Score Prefix = string. Empty;
//Score text object
public Text Score Text = null;
//Game over text
public Text Game Over Text = null;
public static Game Controller This Instance = null;
//------------------------------
void Awake()
{
This Instance = this;
}
//------------------------------
void Update()
{
## ```

```
//Update score text
if(Score Text!=null)
Score Text.text = Score Prefix + Score. To String();
}
//------------------------------
public static void Game Over()
{
if(This Instance. Game Over Text!=null)
This Instance. Game Over Text.game Object. Set Active(true);
}
//------------------------------
}
Comments on Code Sample 4-4
## ```

The Game Controller class uses the namespace Unity Engine.ui. This is important because it includes access to all the UI classes and objects within Unity. I you don't include this namespace inside your source les, then you cannot use UI objects rom that script.

- 

- 

The Game Controller class eatures two Text public members, namely Score Text and Game Over Text. These reer to two text objects, both o which are optional insoar as the Game Controller code will work just ne, even i the members are null. Score Text is a reerence to a text GUI object or displaying score text; and the Game Over Text is or displaying any message when a game over condition occurs.

### [ 200 ]

## ![](_page_309_Picture_2.jpeg)

To use the Game Controller code, create a new, empty object in the scene, named Game Controller. Then drag and drop the Game Controller Script le onto that object.

Once added, drag and drop the 'Score Text' object into the Score Text eld or the Game Controller, in the Object Inspector. See Figure 4.37. In the Score Prex eld, enter the text that should prex the score itsel. The score on its own is simply a number (such as 1000). The prex allows you to add text to the ront o that score, indicating to the player what the numbers mean.

Creating a Game Controller for maintaining Game Score…

Now take the game or a test run, and you'll see the score display at the topright corner o the Game tab, using the GUI text object. This is ne, but the score always remains at 0 right now. This is because we have no code, yet, to increase the score.

For our game, the score should increase when an Enemy object is destroyed. To achieve that, we'll create a new Script le Score OnDestroy. This is included in Code Sample 4-5, as below.

| using Unity Engine; |
|---------------------------------------------|
| using System. Collections; |
| // |
## | public class Score OnDestroy : Mono Behaviour |

```
{
//------------------------------
public int Score Value = 50;
//------------------------------
void On Destroy()
{
Game Controller. Score += Score Value;
}
//------------------------------
}
//------------------------------
[ 201 ]
## ```

## ![](_page_312_Picture_0.jpeg)

### Continuing the Space Shooter

The script should be attached to any object that assigns you points when it's destroyed, such as the enemies. The total number o points assigned is specied by Score Value.

To attach the script to the enemy preab, select the Preab in the Project Panel, and rom the Object Inspector click the button Add Component. Then type Score OnDestroy into the search eld to add the component to the preab. Once added, speciy the total number o points to be allocated or destroying an enemy. For this game, a value o 50 points is assigned. See Figure 4.38.

Adding a Score component to the Enemy prefab Great work! You now have destroyable enemies that assign you points on destruction. This means you can nally have an in-game score, and could even extend gameplay to include high-score eatures and leaderboards. This also means our game is almost nished and ready to build. Next, we'll add some nal touches.

### Polishing

In this section we'll add the nal touches to the game. First on the agenda is to x the game background! Until now, the background has simply displayed the deault background color associated with the game camera. But, since the game is set in space, we should display a space background. To do this, create a new Quad object in the scene that'll display a space image. Choose Game Object > 3D Object > Quad rom the menu. Then rotate the object and move it downwards so it displays a fat, vertically aligned backdrop. You may need to scale the object to look correct. See Figure 4.39.

### [ 202 ]

## ![](_page_313_Picture_4.jpeg)

## ![](_page_314_Figure_0.jpeg)

Creating a backdrop for the level; building a Quad Now drag and drop the space texture rom the Project Panel onto the Quad in the scene, to apply it as a material. Once assigned, select the Quad, and change the tiling settings rom the material properties in the Object Inspector. Increase the X and Y

tiling to 3. See Figure 4.40.

## Configuring Texture Tiling

## [ 203 ]

## ![](_page_315_Picture_5.jpeg)

## ![](_page_316_Picture_0.jpeg)

### Continuing the Space Shooter

I texture tiling seems broken or you, then be sure to check the Texture Importing settings. To do that, select the texture in the Project Panel, and rom the Object Inspector, ensure the Texture Type is set to Texture, and the Wrap mode is set to Repeat. See Figure 4.41.

### Configuring a texture for seamless tiling

Now the level has a suitable background. Let's add some background music, which will play on a loop. To do this, rst select the music track in the Project Panel, inside the Audio Folder. When selected, make sure the music Load Type, rom the Object Inspector, is set to Streaming, and urther that Preload Audio Data is disabled. See Figure 4.42. This improves loading times, as Unity will not need to load all music data into memory as the scene begins.

## Configuring Audio Data ready for Playback

## [ 204 ]

## ![](_page_317_Figure_0.jpeg)

Next, create a new, empty Game Object in the scene named Music, and then drag and drop the music track rom the Project Panel onto the Music object, adding it as an Audio Source Component. Audio Source components playback sound eects and music. See Figure 4.43.

Creating a Game Object with an Audio Source component From the Audio Source Component in the Object Inspector, enable the check boxes Play on Awake, and Loop to ensure the music is played rom the level beginning and loops endlessly or as long as the game is running. The Spatial Blend eld should be set to 0, meaning 2D. In short, 2D Sounds have a consistent volume throughout the level regardless o the player position. This is because 2D sounds are not spatially located.

#### [ 205 ]

## ![](_page_318_Figure_4.jpeg)

## ![](_page_319_Picture_0.jpeg)

#### Continuing the Space Shooter

3D Sounds, in contrast, are used of gunshots, of ootsteps, explosions and other sounds that exist in 3D space and whose volume should change based on how close the player is standing to them when they play. See Figure 4.44.

### Looping a Music Track

And now, let's take the game oor a test run! Click the Play button on the tool bar and test it out. Io the music doesn't seem to play, check that the Mute Audio button is not enabled or the Game Tab. See Figure 4.45.

## Playing a Game – disabling Mute Audio, if needed

## [ 206 ]

## ![](_page_320_Figure_0.jpeg)

## Testing and Diagnosis

With practically all games you'll need to spend considerable time testing and debugging heavily to reduce bugs and errors as ar as humanly possible. With this sample program very little debugging and testing has been required or you, but that's not because the game is simple. It's because I've already pre-checked and pre-tested most o the code and unctionality beore presenting the material to you in this book; ensuring that you get a 'smooth learning experience'. For your own projects, however, you'll need to do lots o testing. One way to get started, is by using the Stats panel. To open this, click the Stats button on the Game Tab. See Figure 4.46.

Viewing Game Performance Information via the Stats Panel More details on the Stats panel is included in Chapter 2 o this book, and more inormation can be ound online at the Unity Documentation here: http://docs.

## unity3d.com/Manual/Rendering Statistics.html

## [ 207 ]

## ![](_page_322_Picture_0.jpeg)

### Continuing the Space Shooter

Another Debugging tool is the Proler. This is useul when the Stats panel has already helped you identiy a general problem, such as a low FPS, and you want to dig deeper to nd where the problem might be located. More details on the Proler are included later, in Chapter 6, but a short introduction is worth including here.

To access the Proler tool, select Window > Proler rom the application menu.

This displays the Proler window. See Figure 4.47.

## Accessing the Profiler Window

## [ 208 ]

## ![](_page_323_Figure_0.jpeg)

With the Proler Window open, click Play on the toolbar to play test your game.

When you do this, the Proler Window lls with color-coded perormance data, in a graph. See Figure 4.48. Green represents the perormance o rendering (graphical) data. Reading and understanding the graph requires some experience, but as a general rule, watch out or 'mountains and peaks'. That is, watch out or sharp fuctuations in the graph (sharp ups and downs), as this could indicate a problem, especially when it roughly coincides with rame rate drops.

During gameplay the Profiler populates with data I you want to investigate urther, simply Pause the game, and then click inside the graph. The horizontal axis (X axis) represents the most recent Frames, and the Vertical axis represents workload. When you click in the graph, a line marker is added to indicate the rame under investigation. Beneath the graph, a list o all main processes or that rame are presented, typically ordered rom top to bottom in the heaviness o their workload the proportion o rame time or which the process accounted.

## [ 209 ]

## ![](_page_325_Figure_0.jpeg)

### Continuing the Space Shooter

Heavier process are listed at the top. See Figure 4.49.

Investigating performance data with the Profiler More inormation on the Proler can be ound at the Online Unity Documentation here: http://docs.unity3d.com/Manual/

## Profiler.html

## [ 210 ]

## ![](_page_326_Figure_0.jpeg)

## Building

Now, nally, we're ready to Build our game into a stand-alone orm ready to send o to riends, amily and testers! The process or doing this is the same as that detailed in Chapter 2, or building the coin collection game. From the application menu, choose File > Build Settings. From the Build Dialog, add our level to the level list, by simply clicking the button Add Current. Or else, drag and drop the level rom the Project Panel into the level list. See Figure 4.50.

## Preparing to Build the Space Shooter

## [ 211 ]

## ![](_page_327_Figure_6.jpeg)

#### Continuing the Space Shooter

For this game, the Target Platổorm will be Windows. Consequently, select the option PC, Mac and Linux Standalone ổrom the Platổorm list, iổ it's not selected already. Iổ the Switch Platổorm button (at the bottom-leổt) is not disabled, then you will need to press that button, congrming to Unity that it should build ổor the selected platổorm, as opposed to a diổổerent platổorm. And then click the Build and Run button. On clicking this, Unity prompts you to select a ổolder on your computer where the built vile will be output and saved. Once generated, double click the executable to run it and test. See Figure 4.51.

Test running the game as a standard Windows executable Summary

Great work! We're really on a roll now, having completed two solid Unity projects.

The urst project was a coin collection game, and the second a twin stick shooter.

Both are, ultimately, simple games in that they don't rely on advanced mechanics or display sophisticated ổeatures. But, even very sophisticated games, when boiled down to their ổundamental ingredients, can be ổound to rest on a similar ổoundation oổ essential concepts, such as the ones we've covered so ổar. That's why our projects are so critical to understanding Unity in a deep way. Next, we'll move onto creating a more 2D ổocused game, considering interổaces, sprites, and physics, and lot's more!

## [212]
