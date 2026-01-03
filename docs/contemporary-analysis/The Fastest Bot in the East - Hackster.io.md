## [hackster.io](https://www.hackster.io/news/the-fastest-bot-in-the-east-cc56c33b7809.amp)

## **The Fastest Bot in the East**

4–6 minutes

## ![](_page_0_Picture_5.jpeg)

Members of the research team with their robot arm ( : Jodi Hilton)

Do you consider yourself to be a planner? Do you like to map out your entire day, knowing exactly what you will be doing, and when? That fact of the matter is, no matter how detailed your plans may be, they pale in comparison to the plans of a robot. Even when it comes to the simplest of tasks, a robot needs a plan a mile long to carry it out.

Consider picking a cup up from the surface of a table, for example. How can this be achieved? Well, just reach and grab it, obviously. Nothing to it. Unless you happen to be a robot, in which case it is a Herculean feat. First an image of the scene needs to be captured and processed by a planning algorithm, which determines the minute motions of every single joint in the robot's arm and fingers to move into exactly the right position, and grasp the cup with just the right amount of force.

This system works pretty well when the environment is highly structured, as might be the case for a robot assembling products in an industrial setting. But people's homes, and most other places in the real world, are far less structured. The future is also much less predictable in these environments, which causes many problems for a robot that plans everything out in intricate detail before taking action. What if the cup gets moved to a different place on the table between the time the robot captures its image and begins executing its plan?

## ![](_page_2_Picture_2.jpeg)

Grabbing items from a cluttered shelf ( : A. Sa Loutos et al.) Because of the delays introduced by the computationally-intensive planning algorithms, this is not an uncommon scenario. In such a case, the robot would carry out the original plan, missing the cup. Then it would have to take another picture, and start the process all over again. This is by no means efficient, and is one of the reasons that no one has a Rosie the Robot in their home yet.

It may still be in the prototype stages, but a team of engineers from MIT's Biomimetic Robotics Laboratory have developed a system that allows robots to [adapt to changing conditions](https://news.mit.edu/2023/speedy-robo-gripper-reflexively-organizes-spaces-0427) and act in a more human-like way, seemingly reflexively. This new method still begins with the usual process of analyzing imaging data and calculating a detailed motion plan, but if things do not go exactly according to that plan, adaptation is possible without going back to the drawing board and running computationally expensive, and slow, algorithms.

The team developed a lightweight, agile robotic arm with seven degrees of freedom. Rather than having actuators at the joints, the movements are driven by motors at the base of the arm that pull on a system of cables. This makes the platform very fast, and able to quickly adapt.

A gripper was added to the arm that is made up of two fingers, each being equipped with contact force, location, and proximity sensors. In contrast with the image data used in creating the initial motion plan, this data can be sampled and processed at a very fast pace.

## ![](_page_4_Picture_2.jpeg)

If the robot fails in carrying out the initial plan, these finger sensors spring into action. By running a lightweight reflexive grasping algorithm informed by the sensor data, the robot is able to roll, palm, or pinch its way into finding a better grip to pick up the object and complete the task.

A series of experiments were conducted to determine how well the system would perform under real-world conditions. In one case, a cluttered shelf containing a variety of objects was set up, and the robot was tasked with
