#### [github.com](https://github.com/godotengine/godot-docs/blob/master/tutorials/animation/animation_tree.rst)

# **godot-docs/tutorials/animation/ animation\_tree.rst at master · godotengine/godot-docs**

## Calinou

18–23 minutes

## **Using Animation Tree**

## **Introduction**

With [:ref:`Animation Player <class\\_Animation Player>`,](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id1) Godot has one of the most flexible animation systems that you can find in any game engine. It is pretty much unique in its ability to animate almost any property in any node or resource, and its dedicated transform, bezier, function calling, audio, and subanimation tracks.

However, the support for blending those animations via Animation Player is limited, as you can only set a fixed crossfade transition time.

[:ref:`Animation Tree <class\\_Animation Tree>`](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id3) is a node designed to deal with advanced transitions.

# **Animation Tree and Animation Player**

Before starting, know that an Animation Tree node does not contain its own animations. Instead, it uses animations contained in an Animation Player node. You create, edit, or import your animations in an Animation Player and then use an Animation Tree to control the playback.

Animation Player and Animation Tree can be used in both 2D and 3D scenes. When importing 3D scenes and their animations, you can use [name suffixes](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/node_type_customization.html#animation-loop-loop-cycle) to simplify the process and import with the correct properties. At the end, the imported Godot scene will contain the animations in an Animation Player node. Since you rarely use imported scenes directly in Godot (they are either instantiated or inherited from), you can place the Animation Tree node in your new scene which contains the imported one. Afterwards, point the Animation Tree node to the Animation Player that was created in the imported scene.

This is how it's done in the [Third Person Shooter demo,](https://godotengine.org/asset-library/asset/678) for reference:

## ![](_page_1_Picture_5.jpeg)

A new scene was created for the player with a Character Body3D as root. Inside this scene, the original .dae (Collada) file was instantiated and an Animation Tree node was created.

# **Creating a tree**

To use an Animation Tree, you have to set a root node. An animation root node is a class that contains and evaluates subnodes and outputs an animation. There are 3 types of subnodes:

- 1. Animation nodes, which reference an animation from the linked Animation Player.
- 2. Animation Root nodes, which are used to blend sub-nodes and can be nested.
- 3. Animation Blend nodes, which are used in an Animation Node Blend Tree, a 2D graph of nodes. Blend nodes take multiple input ports and give one output port.

A few types of root nodes are available:

## ![](_page_2_Picture_9.jpeg)

- Animation Node Animation: Selects an animation from the list and plays it. This is the simplest root node, and generally not used as a root.
- Animation Node Blend Tree: Contains multiple nodes as children in a graph. Many blend nodes are available, such as mix, blend2, blend3, one shot, etc.

- Animation Node Blend Space1D: Allows linear blending between two animation nodes. Control the blend position in a 1D blend space to mix between animations.
- Animation Node Blend Space2D: Allows linear blending between three animation nodes. Control the blend position in a 2D blend space to mix between animations.
- Animation Node State Machine: Contains multiple nodes as children in a graph. Each node is used as a state, with multiple functions used to alternate between states.

# **Blend tree**

When you make an Animation Node Blend Tree, you get an empty 2d graph in the bottom panel, under the Animation Tree tab. It contains only an Output node by default.

## ![](_page_3_Figure_8.jpeg)

In order for animations to play, a node has to be connected to the output. You can add nodes from the **Add Node..** menu or by right clicking an empty space:

## ![](_page_4_Picture_2.jpeg)

The simplest connection to make is to connect an Animation node to the output directly, which will just play back the animation.

## ![](_page_4_Picture_4.jpeg)

Following is a description of the other available nodes:

## **Blend2 / Blend3**

These nodes will blend between two or three inputs by a userspecified blend value:

## ![](_page_4_Picture_8.jpeg)

## ![](_page_5_Picture_2.jpeg)

Blending can use **filters** to control individually which tracks get blended and which do not. This can be useful for layering animations on top of each other.

## ![](_page_5_Picture_4.jpeg)

## ![](_page_6_Picture_2.jpeg)

For more complex blending, it is recommended to use blend spaces instead.

## **One Shot**

This node will execute an animation once and return when it finishes. You can customize blend times for fading in and out, as well as filters.

## ![](_page_6_Picture_6.jpeg)

.. tabs::

## .. code-tab:: gdscript GDScript

# Play child animation connected to "shot" port. animation\_tree.set("parameters/One Shot/request", Animation Node One Shot. ONE\_SHOT\_REQUEST\_FIRE)


 # Alternative syntax (same result).
 animation_tree["parameters/One Shot/request"] = 
Animation Node One Shot. ONE_SHOT_REQUEST_FIRE
 # Abort child animation connected to "shot" port.
 animation_tree.set("parameters/One Shot/request", 
Animation Node One Shot. ONE_SHOT_REQUEST_ABORT)
 # Alternative syntax (same result).
 animation_tree["parameters/One Shot/request"] = 
Animation Node One Shot. ONE_SHOT_REQUEST_ABORT
 # Get current state (read-only).
 animation_tree.get("parameters/One Shot/active"))
 # Alternative syntax (same result).
 animation_tree["parameters/One Shot/active"]
 .. code-tab:: csharp
 // Play child animation connected to "shot" port.
 animation Tree. Set("parameters/One Shot/request", 
(int)Animation Node One Shot. One Shot Request. Fire);
 // Abort child animation connected to "shot" port.
 animation Tree. Set("parameters/One Shot/request", 
(int)Animation Node One Shot. One Shot Request. Abort);
 // Get current state (read-only).
 animation Tree. Get("parameters/One Shot/active");
## ```

#### **Time Seek**

This node allows you to seek to a time in the animation connected to its in input. Use this node to play an Animation starting from a certain playback position. Note that the seek request value is measured in seconds, so if you would like to play an animation from the beginning, set the value to 0.0, or if you would like to play an animation from 3 seconds in, set the value to 3.0.

## ![](_page_8_Picture_3.jpeg)

.. tabs::

## .. code-tab:: gdscript GDScript

# Play child animation from the start. animation\_tree.set("parameters/Time Seek/seek\_request", 0.0) # Alternative syntax (same result).

animation\_tree["parameters/Time Seek/seek\_request"] = 0.0

# Play child animation from 12 second timestamp. animation\_tree.set("parameters/Time Seek/seek\_request", 12.0)

# Alternative syntax (same result). animation\_tree["parameters/Time Seek/seek\_request"] = 12.0

.. code-tab:: csharp


 // Play child animation from the start.
 animation Tree. Set("parameters/Time Seek/seek_request", 
0.0);
## ```

// Play child animation from 12 second timestamp. animation Tree. Set("parameters/Time Seek/seek\_request", 12.0);

#### **Time Scale**

This node allows you to scale the speed of the animation connected to its in input. The speed of the animation will be multiplied by the number in the scale parameter. Setting the scale to 0 will pause the animation. Setting the scale to a negative number will play the animation backwards.

## ![](_page_9_Picture_6.jpeg)

#### **Transition**

This node is a simplified version of a State Machine. You connect animations to the inputs, and the current state index determines which animation to play. You may specify a crossfade transition time. In the Inspector, you may change the number of input ports, rearrange inputs, or delete inputs.

## ![](_page_10_Figure_2.jpeg)

.. tabs::

## .. code-tab:: gdscript GDScript


 # Play child animation connected to "state_2" port.
 animation_tree.set("parameters/Transition/
transition_request", "state_2")
 # Alternative syntax (same result).
 animation_tree["parameters/Transition/transition_request"] = 
"state_2"
## ```

# Get current state name (read-only). animation\_tree.get("parameters/Transition/current\_state")


 # Alternative syntax (same result).
 animation_tree["parameters/Transition/current_state"]
 # Get current state index (read-only).
 animation_tree.get("parameters/Transition/current_index"))
 # Alternative syntax (same result).
 animation_tree["parameters/Transition/current_index"]
 .. code-tab:: csharp
 // Play child animation connected to "state_2" port.
 animation Tree. Set("parameters/Transition/
transition_request", "state_2");
 // Get current state name (read-only).
 animation Tree. Get("parameters/Transition/current_state");
 // Get current state index (read-only).
 animation Tree. Get("parameters/Transition/current_index");
## ```

## **State Machine**

When you make an Animation Node State Machine, you get an empty 2d graph in the bottom panel, under the Animation Tree tab. It contains a Start and End state by default.

## ![](_page_12_Picture_2.jpeg)

To add states, right click or use the **create new nodes** button, whose icon is a plus in a box. You can add animations, blendspaces, blendtrees, or even another State Machine. To edit one of these more complex sub-nodes, click on the pencil icon on the right of the state. To return to the original State Machine, click **Root** on the top left of the panel.

Before the State Machine can do anything useful, the states must be connected with transitions. To add a transition, click the **connect nodes** button, which is a line with a right-facing arrow, and drag between two states. You can create 2 transitions between states, one going in each direction.

## ![](_page_12_Figure_5.jpeg)

## ![](_page_13_Picture_2.jpeg)

## There are 3 types of transitions:

## ![](_page_13_Picture_4.jpeg)

- Immediate: Will switch to the next state immediately.
- Sync: Will switch to the next state immediately, but will seek the new state to the playback position of the old state.
- At End: Will wait for the current state playback to end, then switch to the beginning of the next state animation.

Transitions also have a few properties. Click a transition and it will be displayed in the inspector:

## ![](_page_13_Picture_9.jpeg)

- Xfade Time is the time to cross-fade between this state and the next.

- Xfade Curve is a cross-fade following a curve rather than a linear blend.
- Reset determines whether the state you are switching into plays from the beginning (true) or not (false).
- Priority is used together with the travel() function from code (more on this later). Lower priority transitions are preferred when travelling through the tree.
- Switch Mode is the transition type (see above). It can be changed after creation here.
- Advance Mode determines the advance mode. If Disabled, the transition will not be used. If Enabled, the transition will only be used during travel(). If Auto, the transition will be used if the advance condition and expression are true, or if there are no advance conditions/expressions.

## **Advance Condition and Advance Expression**

The last 2 properties in a State Machine transition are Advance Condition and Advance Expression. When the Advance Mode is set to Auto, these determine if the transition will advance or not.

Advance Condition is a true/false check. You may put a custom variable name in the text field, and when the State Machine reaches this transition, it will check if your variable is true. If so, the transition continues. Note that the advance condition **only** checks if a variable is true, and it cannot check for falseness.

This gives the Advance Condition a very limited capability. If you wanted to make a transition back and forth based on one property, you would need to make 2 variables that have opposite values, and check if either of them are true. This is why, in Godot 4, the Advance Expression was added.

The Advance Expression works similar to the Advance Condition, but instead of checking if one variable is true, it evaluates any expression. An expression is anything you could put in an if statement. These are all examples of expressions that would work in the Advance Expression:

- is\_walking
- is\_walking == true
- is\_walking && !is\_idle
- velocity > 0
- player.is\_on\_floor()

Here is an example of an improperly-set-up State Machine transition using Advance Condition:

## ![](_page_15_Picture_10.jpeg)

## ![](_page_16_Picture_2.jpeg)

This is not working because there is a ! variable in the Advance Condition, which cannot be checked.

Here is the same example, set up properly, using two opposite variables:

## ![](_page_16_Picture_5.jpeg)

## ![](_page_17_Picture_2.jpeg)

Here is the same example, but using Advance Expression rather than Advance Condition, which eliminates the need for two variables:

## ![](_page_17_Figure_4.jpeg)

## ![](_page_18_Picture_2.jpeg)

In order to use Advance Expressions, the Advance Expression Base Node has to be set from the Inspector of the

Animation Tree node. By default, it is set to the Animation Tree node itself, but it needs to point to whatever node contains the script with your animation variables.

#### **State Machine travel**

One of the nice features in Godot's State Machine implementation is the ability to travel. You can instruct the graph to go from the current state to another one, while visiting all the intermediate ones. This is done via the A\* algorithm. If there is no path of transitions starting at the current state and finishing at the destination state, the graph teleports to the destination state.

To use the travel ability, you should first retrieve the [:ref:`Animation Node State Machine Playback](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id5) [<class\\_Animation Node State Machine Playback>`](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id5) object from the Animation Tree node (it is exported as a property), and then call one of its many functions:


.. tabs::
## ```

## .. code-tab:: gdscript GDScript var state\_machine = animation\_tree["parameters/playback"] state\_machine.travel("Some State")

.. code-tab:: csharp

Animation Node State Machine Playback state Machine = (Animation Node State Machine Playback)animation Tree. Get("parameters/ playback");

state Machine. Travel("Some State");

The State Machine must be running before you can travel. Make sure to either call start() or connect a node to **Start**.

## **Blend Space2D and Blend Space1D**

Blend Space2D is a node to do advanced blending in two dimensions. Points representing animations are added to a 2D space and then a position between them is controlled to determine the blending:

## ![](_page_20_Picture_5.jpeg)

You may place these points anywhere on the graph by right clicking or using the **add point** button, whose icon is a pen and point. Wherever you place the points, the triangle between them will be generated automatically using Delaunay. You may also control and label the ranges in X and Y.

## ![](_page_21_Picture_3.jpeg)

Finally, you may also change the blend mode. By default, blending happens by interpolating points inside the closest triangle. When dealing with 2D animations (frame by frame), you may want to switch to Discrete mode. Alternatively, if you want to keep the current play position when switching between discrete animations, there is a Carry mode. This mode can be changed in the Blend menu:

## ![](_page_21_Picture_5.jpeg)

Blend Space1D works just like Blend Space2D, but in one dimension (a line). Triangles are not used.

## ![](_page_22_Figure_2.jpeg)

# **For better blending**

For the blending results to be deterministic (reproducible and always consistent), the blended property values must have a specific initial value. For example, in the case of two animations to be blended, if one animation has a property track and the other does not, the blended animation is calculated as if the latter animation had a property track with the initial value.

When using Position/Rotation/Scale 3D tracks for Skeleton3D bones, the initial value is Bone Rest. For other properties, the initial value is 0 and if the track is present in the RESET animation, the value of its first keyframe is used instead.

For example, the following Animation Player has two animations, but one of them lacks a Property track for Position.

## ![](_page_22_Picture_7.jpeg)

This means that the animation lacking that will treat those Positions as Vector2(0, 0).

## ![](_page_23_Picture_3.jpeg)

This problem can be solved by adding a Property track for Position as an initial value to the RESET animation.

## ![](_page_23_Picture_5.jpeg)

#### Note

Be aware that the RESET animation exists to define the default pose when loading an object originally. It is assumed to have only one frame and is not expected to be played back using the timeline.

Also keep in mind that the Rotation 3D tracks and the Property tracks for 2D rotation with Interpolation Type set to Linear Angle or Cubic Angle will prevent rotations greater than 180 degrees from the initial value as blended animation.

This can be useful for Skeleton3Ds to prevent the bones penetrating the body when blending animations. Therefore, Skeleton3D's Bone Rest values should be as close to the midpoint of the movable range as possible. **This means that for humanoid models, it is preferable to import them in a T-pose**.

## ![](_page_24_Picture_4.jpeg)

You can see that the shortest rotation path from Bone Rests is prioritized rather than the shortest rotation path between animations.

If you need to rotate Skeleton3D itself more than 180 degrees by blend animations for movement, you can use Root Motion.

## **Root motion**

When working with 3D animations, a popular technique is for animators to use the root skeleton bone to give motion to the rest of the skeleton. This allows animating characters in a way where steps actually match the floor below. It also allows precise interaction with objects during cinematics.

When playing back the animation in Godot, it is possible to select this bone as the root motion track. Doing so will cancel the bone transformation visually (the animation will stay in place).

## ![](_page_25_Picture_3.jpeg)

Afterwards, the actual motion can be retrieved via the [:ref:`Animation Tree <class\\_Animation Tree>`](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id7) API as a transform:

.. tabs::

## .. code-tab:: gdscript GDScript


 # Get the motion delta.
 animation_tree.get_root_motion_position()
 animation_tree.get_root_motion_rotation()
 animation_tree.get_root_motion_scale()
## ```

# Get the actual blended value of the animation. animation\_tree.get\_root\_motion\_position\_accumulator() animation\_tree.get\_root\_motion\_rotation\_accumulator() animation\_tree.get\_root\_motion\_scale\_accumulator()

.. code-tab:: csharp

// Get the motion delta. animation Tree. Get Root Motion Position();


 animation Tree. Get Root Motion Rotation();
 animation Tree. Get Root Motion Scale();
## ```

// Get the actual blended value of the animation. animation Tree. Get Root Motion Position Accumulator(); animation Tree. Get Root Motion Rotation Accumulator(); animation Tree. Get Root Motion Scale Accumulator();

This can be fed to functions such as [:ref:`Character Body3D.move\\_and\\_slide](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id9) [<class\\_Character Body3D\\_method\\_move\\_and\\_slide>`](about:reader?url=https%3A%2F%2Fgithub.com%2Fgodotengine%2Fgodot-docs%2Fblob%2Fmaster%2Ftutorials%2Fanimation%2Fanimation_tree.rst#id9) to control the character movement.

There is also a tool node, Root Motion View, you can place a scene that will act as a custom floor for your character and animations (this node is disabled by default during the game).

## ![](_page_26_Picture_6.jpeg)

## ![](_page_27_Picture_2.jpeg)

## **Controlling from code**

After building the tree and previewing it, the only question remaining is "How is all this controlled from code?".

Keep in mind that the animation nodes are just resources, so they are shared between all instances using them. Setting values in the nodes directly will affect all instances of the scene that uses this Animation Tree. This is generally undesirable, but does have some cool use cases, e.g. you can copy and paste parts of your animation tree, or reuse nodes with a complex layout (such as a State Machine or blend space) in different animation trees.

The actual animation data is contained in the Animation Tree node and is accessed via properties. Check the "Parameters" section of the Animation Tree node to see all the parameters that can be modified in real-time:

## ![](_page_27_Figure_7.jpeg)

This is handy because it makes it possible to animate them from an Animation Player, or even the Animation Tree itself, allowing very complex animation logic.

To modify these values from code, you must obtain the property path. You can find them by hovering your mouse over any of the parameters:

## ![](_page_28_Picture_4.jpeg)

Then you can set or read them:

.. tabs::

## .. code-tab:: gdscript GDScript animation\_tree.set("parameters/eye\_blend/blend\_amount", 1.0)

# Alternate syntax (same result) animation\_tree["parameters/eye\_blend/blend\_amount"] = 1.0

.. code-tab:: csharp animation Tree. Set("parameters/eye\_blend/blend\_amount",

1.0);

#### Note

Advance Expressions from a State Machine will not be found under the parameters. This is because they are held in another script rather than the Animation Tree itself. Advance Conditions will be found under parameters.
