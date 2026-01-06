## ![](_page_0_Picture_0.jpeg)

# Documentation

## 2.2.0

# Thank you for buying

## Enviro – Sky and Weather

## ![](_page_1_Picture_0.jpeg)

| Getting Started | 3 |
|-----------------------|----|
| Basics | 4 |
| Profiles | 4 |
| Weather Presets | 5 |
| Enviro Sky Manager | 6 |
| URP/LWRP Support | 7 |
| Third Party Support | 9 |
| Enviro Sky Instances | 10 |
| Rendering Setup | 11 |
| Time and Location | 12 |
| Weather Controls | 13 |
| Feature Controls | 14 |
| Audio Controls | 15 |
| Enviro Zone Component | 16 |
| FAQ and Troubleshoot | 17 |
| Scripting API | 20 |
| General | 20 |
| Time and Date | 21 |
| Seasons | 22 |
| Weather | 23 |
## | Events | 24 |

## ![](_page_2_Picture_0.jpeg)

It's really easy to setup enviro in your project! Import the package and follow these easy steps to get started!

- 1. Click on "Assets" -> "Create" -> "Enviro" -> "Enviro Sky Manager". This will create a new "Game Object" in your scene with the Enviro Sky Manager component.
- 2. Now select the "Enviro Sky Manager" object in your scene. From here you can add different preconfigured enviro instances. For example click on "Create Standard Instance". After that take a look in "Instances" section by activating the checkbox. You should see a red box with your newly generated enviro instance. Click on "Activate" here.
- 3. Now we need to assign camera and if exist your player object. For a quick setup you can use the "Auto Assign" button in Enviro Sky Manager -> Instances window.

## ![](_page_2_Picture_5.jpeg)

For manual or runtime assignment you have to click on the "Show" button. Then click on the "Player & Camera Setup" checkbox. Assign your "Player" and your "Player Camera" OR check "Assign On Runtime" and choose your tags.

## ![](_page_2_Picture_7.jpeg)

4. Disable other directional lights in your scene!

## Only needed for "Standard" Enviro version. (Not needer for lite only users!):

5. You also need to add the "Enviro/Volume Light" shader to the "Always Included Shader" list in Unity graphic settings (Edit -> Project Settings -> Graphics). Otherwise volumetric lighting will break in builds.

## ![](_page_2_Picture_11.jpeg)

## ![](_page_3_Picture_0.jpeg)

# Basics

Okay now the basics! The final sky output will be controlled in two separate parts. First the global "Enviro Profile", second the current active "Weather Preset".

## Profiles

This object will hold all global information and can be saved and loaded in run- and design time!

- To create a new profile do a right click in your project folder and choose: Create -> Enviro -> Profile

You can assign your profile at the top of Enviro Sky inspector:

## ![](_page_3_Picture_7.jpeg)

Click on "Edit Profile" in Enviro Sky inspector to open the profile section.

## ![](_page_3_Picture_9.jpeg)

Here you can save and load profiles with the click on the buttons.

## Please note enviro never touches your profile directly!

Enviro only will overwrite your profile when you click on "Save To Profile" and only overwrite the runtime settings when you click on "Load from Profile"!

If you tweaked the settings in runtime and want them saved you have to save in runtime and load them when you are back in designtime!

Also worth noting is that you have to use the "Category" dropdown menu to get access to all the different settings.

## ![](_page_4_Picture_0.jpeg)

## Weather Presets

These objects will hold all information to change the look of your sky based on current weather. For example you have options to change the sky, clouds, fog and lighting. Here you also can add particle effects and audio effects to create weather that can smoothly change over time.

- To create a new weather preset do a right click in your project folder and choose: Create -> Enviro -> Weather Preset

## ![](_page_4_Picture_4.jpeg)

Enviro only can use a weather preset, once it is added to a zone! To add your weather presets to the system you have to assign it in one of your "Enviro Zone" components. There already is a default zone on the Enviro Sky object. More about zones later!

Also note that every weather preset needs a unique name to be correctly working.

## ![](_page_5_Picture_0.jpeg)

Add preconfigured enviro instances, manage them and switch between standard and lite version. You also can choose your render pipeline here and activate/add third party support integrations.

## ![](_page_5_Picture_2.jpeg)

## General:

Activate "Don't Destroy on Load" if you use enviro in multiple scenes and you want to keep them "alive" after load.

## Render Pipeline Setup:

Switch between URP/LWRP and Legacy Render Pipeline here. With the Enviro Pro upgrade you also can switch to HDRP here.

## Instance Creation:

Create new instances here. You have to delete an instance to create a new one of the same type.

## Instances:

Shows you Instances. You can activate or deactivate, start and stop or delete instances here. Jump to instance configuration with a click on "Show" button.

## ![](_page_6_Picture_0.jpeg)

Activate and setup Enviro for use in LWRP/URP.

## Requirements:

Unity 2019.1+ with LWRP/URP 5. X or higher.

## Setup:

- 1. Setup enviro described in "Getting Started" section.
- 2. Click on Enviro Sky Manager in your scene and activate LWRP/URP Support in Render Pipeline section.

## ![](_page_6_Picture_7.jpeg)

3. Import the LWRP/URP support files for the enviro version you would like to use.

## ![](_page_6_Figure_9.jpeg)

## ![](_page_7_Picture_0.jpeg)

4. Open your LWRP/URP Quality Settings. (Edit -> Project Settings -> Graphics)

## ![](_page_7_Picture_2.jpeg)

5. Set "Render Type" to "Custom" and assign the "Enviro Standard URP Renderer" or "Enviro Lite URP Renderer".

## ![](_page_7_Figure_4.jpeg)

6. Repeat step 5 with your other LWRP/URP quality settings. You're done now and can use Enviro in LWRP/URP.

## ![](_page_8_Picture_0.jpeg)

Activate and deactivate third party support here.

## ![](_page_8_Figure_2.jpeg)

Click on "Activate" and project will recompile with integration component active.

After that you will see a new button to actually add the integration component.

## Please note:

Some Integrations will auto detect if third party asset is installed, so you don't need to activate them by hand.

## Attention!

If you activate an integration you don't have in your project you will get errors! Click on "Deactivate" to fix these and import the third party asset before you are activating enviro support for it.

## ![](_page_9_Picture_0.jpeg)

This is the heart of each enviro sky instance where you can configure visuals, control time and weather or activate and deactivate features.

## ![](_page_9_Figure_2.jpeg)

## Edit Profile:

You can assign a profile at the top here and work on that with a click on "Edit Profile". Please check the "Profile" section for more information.

## Player and Camera Setup:

Assign your camera and player here. If you already done setup nothing special to do here anymore.

## Component Setup:

Just all needed components are referenced here. Normally you don't need to change here anything as everything should be setup already. However if something goes very wrong you can reassign components here.

## ![](_page_10_Picture_0.jpeg)

The "Rendering Setup" section includes a few additional setup settings that you may want to change for your projects.

| ✓ Rendering Setup | |
|------------------------|---|
| Camera Settings | |
| Set Camera Clear Flags | ▼ |
| Layer Setup | |
| Satellites Layers | ŧ |
| Virtual Reality | |
## | Single Pass VR | |

HDR: That option will enable HDR rendering in your camera and enviro effects.

Set Camera Flags: Disable when you want to set your own camera clear flag. (Not recommended)

Satellites Layers: This layer will only be used if you added additional satellites.

## (Deactivated by default)

Single Pass VR: If you are working on a VR project and using "Single-Pass Rendering"

you have to set this to enabled! Disable if you are not working on VR

or using the "Multi-Pass Mode".

## ![](_page_11_Picture_0.jpeg)

## Time and Location

In this section you can control the time progressing, current time of day and date, simulation speed and location based on longitude and latitude.

## ![](_page_11_Picture_3.jpeg)

- Progress Time: "Simulated": This mode will progress time based on the Day and Night Length in Minutes settings.
 - "One Day": Works like "Simulated" but will not progressing days or years.
 - "System Time": Uses the user system time and keep them in sync.
 - "None": Disables time progressing.

Please note! You have to set the "Progress Time Mode" to "None" if you want to change the time in runtime over inspector sliders! But you still can change time over scripting API without modifying the "Progress Time Mode".

Seasons: Seasons will be used by various utility components like vegetation growth or season based material/gameobject swap components. If you enable "Calc Season" the current season will be chosen based on day of year. Please check the Profile -> Season settings to configure season lengths.

Location: Here you can setup your location based on latitude and latitude and choose your time-zone.

## ![](_page_12_Picture_0.jpeg)

## Weather Controls

In this section you can control the current active weather, start weather and quickly edit the active weather preset. You also can disable automatic weather changes for all your zones here (Update Weather option).

## ![](_page_12_Picture_3.jpeg)

## Tipps:

- If you enabled "Scene Preview" you can change the preview by assigning different weather presets in "Start Weather Preset". This will allow you to work on your scenes with enviro effects enabled to better showcase how your scene will look in runtime.
- In runtime you also can quickly change the current weather in current zone here!

## ![](_page_12_Picture_7.jpeg)

- "Edit current Weather Preset" will select the currently playing weather preset for quick edits!

## ![](_page_13_Picture_0.jpeg)

## Feature Controls

In "Feature Controls" section you can quickly enable and disable enviro effects like clouds, volumetric lighting and lightshafts.

| 1 |
|---|
| 1 |
| |
| |
| |
| |
| |
| |
| 1 |
| 1 |
| 1 |
| 1 |
| 1 |
## | |

Settings should be self-explaining. But I want to point out the "Scene View Preview".

Enable or disable these to show or hide enviro effects in your scene view while working on your scene. Sometimes you may want to disable these to have better editor performance, or if you don't need to have your scene fogged or clouds in sky.

## ![](_page_14_Picture_0.jpeg)

## Audio Controls

In "Audio Controls" section you can set the volume of sound effects used by enviro for ambient and weather.

## ![](_page_14_Picture_3.jpeg)

Nothing special here, but you may want to globally set the volume of enviro ambient and weather sfx for your project here.

## ![](_page_15_Picture_0.jpeg)

## Enviro Zone Component

The "Enviro Zone" component handles your weather presets and initiate the weather changing. There always is one zone added to the "Enviro Sky" object. That one is your default zone and will be used whenever your player/camera is in no other manual added zones. "Manual added zones"? Yes, you can add as many zones as you want to your game world, each with their own weather list and current active weather! Once your player/camera enters an additional zone the weather will smoothly change to the

- To create a new zone create an empty Game Object (Right-click in hierarchy -> "Create Empty") and add the "Enviro Zone" component to It ("Components" -> "Enviro" -> "Weather Zone").

current active weather in that zone. Use this to have multiple biomes in your game.

- Now just set the scale and add your weather presets. That's all!

## ![](_page_15_Picture_5.jpeg)

## ![](_page_16_Picture_0.jpeg)

Short answers on frequently asked questions and issues that may happen.

## • How to tweak enviro curves and gradients?

Most curves and gradients are evaluated based on sun altitude in sky. It ranges from 0 -> midnight, ~0.5 -> dawn/dusk, 1 -> midday.

## ![](_page_16_Figure_4.jpeg)

- How to make nights brigher or darker? (scene lighting)

Select your Enviro Sky Instance -> Edit Profile -> Lighting category:

## ![](_page_16_Figure_7.jpeg)

Set left half of gradients and curves marked in screenshot darker/lower or brighter/higher.

## ![](_page_17_Picture_0.jpeg)

## • How to make nights brigher or darker? (Sky)

Select your Enviro Sky Instance -> Edit Profile -> Sky category:

## ![](_page_17_Figure_3.jpeg)

Tweak left half of marked curves. Higher values in "Sky Luminance" will make sky brighter. Higher values in "Sky Color Power" will make sky darker while colors stronger.

## • Clouds and Sky are over brighten and look bad.

With default shipped settings Enviro does not limit the colors brightness. This is needed for some post effects to work correctly. For example Bloom. And it also will give you best results and HDR compability. However you need to use some tonemapping to get best results. For example using the Unity Post Processing -> Color Grading tonemapping.

So download and import Unity Post Processing through the Unity Package Manager and setup in your scenes.

https://docs.unity3d.com/Packages/com.unity.postprocessing@2.1/manual/Quickstart.html

Now in your post processing volume profile, add the Color Grading module and activate Tonemapping here. Personally I use the "ACES" mode here.

## ![](_page_17_Picture_10.jpeg)

## ![](_page_18_Picture_0.jpeg)

- Scene renders black in combination with Unity Post Processing (Unity 2019).

Please take a look in your Post Processing Layer component on your camera. Make sure that "Directly To Camera Target" option is disabled. That option will break legacy image effects that using the "On Render Image" function.

## ![](_page_19_Picture_0.jpeg)

Usefull functions and api calls to communicate with enviro in your own scripts.

## General

## Assign your Camera and Player and start Enviro systems:

Enviro Sky Mgr.instance. Assign And Start (Game Object player, Camera Camera);

## Start Enviro in headless server mode:

Enviro Sky Mgr.instance. Start AsServer();

## Change camera and player in runtime:

Enviro Sky Mgr.instance. Change Focus (Game Object player, Camera Camera);

## Activate or deactivate features:


Enviro Sky Mgr.instance.use Volume Lighting = true;
Enviro Sky Mgr.instance.use Volume Clouds = true;
Enviro Sky Mgr.instance.use Flat Clouds = true;
Enviro Sky Mgr.instance.use Particle Clouds = true;
Enviro Sky Mgr.instance.use Sun Shafts = true;
Enviro Sky Mgr.instance.use Moon Shafts = true;
## ```

Enviro Sky Mgr.instance.use Distance Blur = true;

## Change clouds quality:

Enviro Sky.instance. Apply Volume Clouds Quality Preset(Enviro Volume Clouds Quality quality Preset);

## ![](_page_20_Picture_0.jpeg)

## Get current Time:


int current Second = Enviro Sky Mgr.instance. Time. Seconds;
int current Minute = Enviro Sky Mgr.instance. Time. Minutes;
int current Hour = Enviro Sky Mgr.instance. Time. Hours;
int current Day = Enviro Sky Mgr.instance. Time. Days;
int current Month = Enviro Sky Mgr.instance. Get Current Month();
int current Year = Enviro Sky Mgr.instance. Time. Years;
float time OfDay = Enviro Sky Mgr.instance. Get Time OfDay();
## ```

## Get current sun and moon "time" (0-1). Usefull to use in curves and gradient to evaluate values:


float solar Time = Enviro Sky Mgr.instance. Time.solar Time;
float lunar Time = Enviro Sky Mgr.instance. Time.lunar Time;
## ```

## Get a time string to be used in your UI:


string time String = Enviro Sky Mgr.instance. Get Time String();
string time String With Seconds = Enviro Sky Mgr.instance. Get Time String With Seconds();
## ```

## Set time of enviro:


Enviro Sky Mgr.instance. Set Time OfDay(float tod);
Enviro Sky Mgr.instance. Set Time(int year, int day, int hour, int minute, int second);
Enviro Sky Mgr.instance. Set Time(System. Date Time date Time);
## ```

## Set time progress mode of enviro:

Enviro Sky Mgr.instance. Time. Progress Time = Enviro Time. Time Progress Mode. None;

## ![](_page_21_Picture_0.jpeg)

## Season enum:

## Enviro Seasons. Seasons. Spring

## Enviro Seasons. Seasons. Summer

## Enviro Seasons. Seasons. Autumn

## Enviro Seasons. Seasons. Winter

## Activate/deactivate auto season changes:

Enviro Sky Mgr.instance. Seasons.calc Seasons = false;

## Get current season:

Enviro Seasons. Seasons season = Enviro Sky Mgr.instance. Seasons.current Seasons;

## Set current season:

Enviro Sky Mgr.instance. Change Season(Enviro Seasons. Seasons. Spring);

## ![](_page_22_Picture_0.jpeg)

## Get current active weather:

Enviro Weather Preset weather = Enviro Sky Mgr.instance. Weather.current Active Weather Preset;

## Get a list of all available weather presets:

List<Enviro Weather Preset> presets = Enviro Sky Mgr.instance. Weather.weather Presets;

## Get current active weather zone:

Enviro Zone zone = Enviro Sky Mgr.instance. Weather.current Active Zone;

## Get snow and wetness intensity:

float current Wetness = Enviro Sky Mgr.instance. Weather.cur Wetness; float current Snow = Enviro Sky Mgr.instance. Weather.cur Snow Strength;

## Set current active weather with smooth transition:

Enviro Sky Mgr.instance. Change Weather(int weatherID);

Enviro Sky Mgr.instance. Change Weather(Enviro Weather Preset weather Preset);

## Set current active weather without transition:

Enviro Sky Mgr.instance. Change Weather Instant(int id);

Enviro Sky Mgr.instance. Change Weather Instant(Enviro Weather Preset weather Preset);

## ![](_page_23_Picture_0.jpeg)

## Events


Enviro Sky Mgr.instance. On Weather Changed += (Enviro Weather Prefab type) =>
{
Debug. Log("Weather changed to: " + type. Name);
};
Enviro Sky Mgr.instance. On Season Changed += (Enviro Seasons. Seasons season) =>
{
Debug. Log("Season changed");
};
Enviro Sky Mgr.instance. On Hour Passed += () =>
{
Debug. Log("Hour Passed!");
};
Enviro Sky Mgr.instance. On Day Passed += () =>
{
Debug. Log("New Day!");
};
Enviro Sky Mgr.instance. On Year Passed += () =>
{
Debug. Log("New Year!");
};
Enviro Sky Mgr.instance. On Day += () =>
{
Debug. Log("Day!");
};
Enviro Sky Mgr.instance. On Night += () =>
{
Debug. Log("Night!");
};
## ```
