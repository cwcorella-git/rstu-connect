Digitally signed by TeAM
        YYePG
        DN: cn=TeAM YYePG,
        c=US, o=TeAM YYePG,
        ou=TeAM YYePG,
TeAM email=yyepg@msn.com
        Reason: I attest to the
YYePG accuracy and integrity of this
        document
        Date: 2005.04.07 11:01:18
        +08'00'
Game Interface Design
## Brent Fox

© 2005 by Thomson Course Technology PTR. All rights reserved. No part of this book may be reproduced SVP, Thomson Course or transmitted in any form or by any means, electronic or mechanical, including photocopying, record- Technology PTR: ing, or by any information storage or retrieval system without written permission from Thomson Course Andy Shafran Technology PTR, except for the inclusion of brief quotations in a review. Publisher: The Premier Press and Thomson Course Technology PTR logo and related trade dress are trademarks of Stacy L. Hiquet Thomson Course Technology PTR and may not be used without written permission. Senior Marketing Manager: Trial version of Flash MX 2004 is Copyright © Macromedia® Flash™ MX 2004. Macromedia, Inc. and its Sarah O’Donnell suppliers. All rights reserved. Marketing Manager: All other trademarks are the property of their respective owners. Heather Hurley Important: Thomson Course Technology PTR cannot provide software support. Please contact the appro- Manager of Editorial Services: priate software manufacturer’s technical support line or Web site for assistance. Heather Talbot Thomson Course Technology PTR and the author have attempted throughout this book to distinguish Senior Acquisitions Editor: proprietary trademarks from descriptive terms by following the capitalization style used by the manufac- Emi Smith turer. Senior Editor: Information contained in this book has been obtained by Thomson Course Technology PTR from sources Mark Garvey believed to be reliable. However, because of the possibility of human or mechanical error by our sources, Associate Marketing Manager: Thomson Course Technology PTR, or others, the Publisher does not guarantee the accuracy, adequacy, or Kristin Eisenzopf completeness of any information and is not responsible for any errors or omissions or the results obtained from use of such information. Readers should be particularly aware of the fact that the Internet is an ever- Marketing Coordinator: changing entity. Some facts may have changed since this book went to press. Jordan Casey
Educational facilities, companies, and organizations interested in multiple copies or licensing of this book Project Editor/Copy Editor: should contact the publisher for quantity discount information. Training manuals, CD-ROMs, and por- Estelle Manticas tions of this book are also available individually or can be tailored for specific needs. Technical Reviewer: ISBN: 1-59200-593-4 Les Pardew
Library of Congress Catalog Card Number: 2004111222 PTR Editorial Services
                                                                                                               Coordinator:
Printed in the United States of America Elizabeth Furbish 04 05 06 07 08 BU 10 9 8 7 6 5 4 3 2 1 Interior Layout Tech:
## William Hartman
                                                                                                               Cover Designer:
## Mike Tanamachi
                                                                                                               CD-ROM Producer:
## Brandon Penticuff
                                                                                                               Indexer:
## Kelly Talbot

                               Thomson Course Technology PTR, a division of Thomson Course Technology Proofreader:
                               25 Thomson Place ■ Boston, MA 02210 ■ http://www.courseptr.com Gene Redding
         For my wife Amy, a beautiful and intelligent woman.
Without her support and patience, I would not be the person I am today.

## Acknowledgments

## I also want to give a special thanks to
            any people worked hard
## my family for their patience while I
            to make this book possi-
## spent many hours away from them
            ble. Steve Taylor helped
## working on this book.
M immensely with the content; he provided technical information and even some early editing. I thank my editor, Estelle Manticas, for the many hours she spent helping me through the writing process. Thanks to Les Pardew, my technical editor and an all around good guy. Also, thanks go to Emi Smith and the entire team at Premier Press, who not only provided the opportunity to write this book, but also shared their expertise with me.

## About the Author

## Brent has not only created art for the
        rent Fox worked his way
## games he has worked on, but he has
        through college as an art
## also served as project manager and art
        director for a package design
## director on many other games as well.
B company. While in college, he took a class in 3D animation and was
## He has managed development teams
## with up to 28 team members. He has
hooked. Brent received his degree
## created artwork for games published
in Graphic Design from Brigham
## by Blizzard, EA, Midway, 3DO, and
Young University, and shortly after
## Konami, just to name a few. His pubgraduation he began creating video
## lished title list includes games such as
games. He has worked in the video
## Brood War (a Starcraft expansion set),
game industry for more than eight
                                        Army Men: Sarge’s Heroes, and many
years, and he has worked on games
## more.
for a wide variety of platforms. His title list includes games on the PC, Game Boy Color, PlayStation, Nintendo 64, Dreamcast, PlayStation 2, and GameCube.

## Contents at a Glance

Introduction ..............................................................................................................xv
Chapter 1 Introduction to Video Games....................................................................................1 Chapter 2 Planning Menu Flow..................................................................................................7 Chapter 3 The Look and Feel of Your Interface......................................................................27
Chapter 4 Basic Design Principles .............................................................................................43
Chapter 5 Console or PC? .........................................................................................................61
Chapter 6 Button States............................................................................................................73 Chapter 7 Creating a Focal Point .............................................................................................81

## Contents at a Glance vii

Chapter 8 Using Text in Your Interface....................................................................................87
Chapter 9 Technical Requirements and Tricks .........................................................................99
Chapter 10 Tools of the Trade ..................................................................................................113
Chapter 11 Using Animation ....................................................................................................125 Chapter 12 Icons, Icons, Icons ...................................................................................................139
Chapter 13 Designing the HUD ................................................................................................145
Chapter 14 Designing an Interface ..........................................................................................155 Chapter 15 Creating an Interactive Mock-Up..........................................................................179
Index .......................................................................................................................199

## Contents

Introduction . . . . . . . . . . . . . . . . . . . . . . . . . . . .xv Game Design Goals . . . . . . . . . . . . . . . . . . . . . . . . . . . .10
                                                                                       Possible Game Goals . . . . . . . . . . . . . . . . . . . . . . .11
Chapter 1 Breaking Down Your Goal into Specifics . . . . . . .12 Introduction to Video Games . . . . . . . . . . . . . . .1 How Priorities Affect Decision-Making . . . . . . . . .12 The Importance of the Interface . . . . . . . . . . . . . . . . . . .1 Charting Methods . . . . . . . . . . . . . . . . . . . . . . . . . . . . .13 Real-Life Game Development . . . . . . . . . . . . . . . . . . . . .2 Button Types . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .17 Working with a Team . . . . . . . . . . . . . . . . . . . . . . . . . . .3 Sliders . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .19
     Listen to Others . . . . . . . . . . . . . . . . . . . . . . . . . . .4 Toggle Switches . . . . . . . . . . . . . . . . . . . . . . . . . . .19
     Ask Questions . . . . . . . . . . . . . . . . . . . . . . . . . . . . .4 Lists . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .20
A Career in Video Games . . . . . . . . . . . . . . . . . . . . . . . . .4 Input Text . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .20 The Publisher / Developer Relationship . . . . . . . . . . . . . .5 Drop-Down Menus . . . . . . . . . . . . . . . . . . . . . . . .22
                                                                                       Other Variations . . . . . . . . . . . . . . . . . . . . . . . . . .22
Chapter 2 Common Menu Screens . . . . . . . . . . . . . . . . . . . . . . . . .23 Planning Menu Flow . . . . . . . . . . . . . . . . . . . . . .7 Simplicity versus Depth . . . . . . . . . . . . . . . . . . . . . . . . .23 Why Is Planning So Valuable? . . . . . . . . . . . . . . . . . . . . .7 Planning for HUD . . . . . . . . . . . . . . . . . . . . . . . . . . . . .24 Creativity in Planning . . . . . . . . . . . . . . . . . . . . . . . . . . .8 Creativity versus Conventional Methods . . . . . . . . . . . .25 Getting Approval . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .9 Interface Planning Helps Game Design . . . . . . . . . . . . .10

## Contents ix

Chapter 3 Finding Complementary Colors . . . . . . . . . . . . . . .45 The Look and Feel of Your Interface . . . . . . . . .27 Using More Than Two Colors . . . . . . . . . . . . . . . .47 Define a Look . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .27 Subjective Color . . . . . . . . . . . . . . . . . . . . . . . . . .48
       Create a Mock-Up . . . . . . . . . . . . . . . . . . . . . . . . .27 Balancing Color Strength . . . . . . . . . . . . . . . . . . .49
       Working with Logos . . . . . . . . . . . . . . . . . . . . . . .29 Warm and Cold Colors . . . . . . . . . . . . . . . . . . . . .49
       Define a Color Scheme . . . . . . . . . . . . . . . . . . . . .29 Color on a Monitor or TV . . . . . . . . . . . . . . . . . . .50
Express Yourself in the Design . . . . . . . . . . . . . . . . . . . .31 Creating Digital Colors . . . . . . . . . . . . . . . . . . . . .51 Research and Inspiration . . . . . . . . . . . . . . . . . . . . . . . .32 Visual Organization . . . . . . . . . . . . . . . . . . . . . . . . . . . .53
       Make Lists . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .32 Unity and Variation . . . . . . . . . . . . . . . . . . . . . . . . . . . .54
       Search for Images . . . . . . . . . . . . . . . . . . . . . . . . .32 Negative Space . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .55
Thumbnails . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .33 Movement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .55
       Work Quickly . . . . . . . . . . . . . . . . . . . . . . . . . . . . .34 Eye Movement . . . . . . . . . . . . . . . . . . . . . . . . . . .56
       Push for Variation . . . . . . . . . . . . . . . . . . . . . . . . .34 Balance and Weight . . . . . . . . . . . . . . . . . . . . . . . . . . .57
Creativity versus Standards . . . . . . . . . . . . . . . . . . . . . .35 Unbalancing Your Design to Create Tension . . . .58 Using Photographs . . . . . . . . . . . . . . . . . . . . . . . . . . . .35 Odd Numbers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .59 Illustrations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .37 Dividing an Image . . . . . . . . . . . . . . . . . . . . . . . . . . . . .59 3D Solutions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .38 Intersections . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .60
       Pre-Rendered 2D Art . . . . . . . . . . . . . . . . . . . . . . .38 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .60
       Involve the Programmers . . . . . . . . . . . . . . . . . . .39
       Combining 3D and 2D . . . . . . . . . . . . . . . . . . . . . .39 Chapter 5
       3D Challenges . . . . . . . . . . . . . . . . . . . . . . . . . . . .39 Console or PC? . . . . . . . . . . . . . . . . . . . . . . . . . .61
Don’t Get Too Attached to Your Ideas . . . . . . . . . . . . .40 Bad Conversions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .61 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .41 Console Development . . . . . . . . . . . . . . . . . . . . . . . . . .62
## Console Hardware Manufacturers . . . . . . . . . . . .62
Chapter 4 Developer Approval . . . . . . . . . . . . . . . . . . . . . . .62 Basic Design Principles . . . . . . . . . . . . . . . . . . . .43 Concept Approval . . . . . . . . . . . . . . . . . . . . . . . . .63 Getting Back to Basics . . . . . . . . . . . . . . . . . . . . . . . . . .43 Technical Approval . . . . . . . . . . . . . . . . . . . . . . . .63
     Really See Your Design . . . . . . . . . . . . . . . . . . . . .44 Console Game Cost . . . . . . . . . . . . . . . . . . . . . . . .64
     Using Color . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .44 Effect on the Interface . . . . . . . . . . . . . . . . . . . . .64
     Creating Color Harmony . . . . . . . . . . . . . . . . . . . .45 Handheld Development . . . . . . . . . . . . . . . . . . . . . . . . .65

## x Contents

PC Development . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .65 PC Button States . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .77
     Minimum Requirements for PC Games . . . . . . . . .65 Other States . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .77
The Controller . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .66 Animated States . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .78
     Getting the Timing Right . . . . . . . . . . . . . . . . . . .67 Workload . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .79
     Limiting Buttons . . . . . . . . . . . . . . . . . . . . . . . . . .68 Saving Time . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .79
     Displaying Navigation Information . . . . . . . . . . . .68 Audio . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .80
The Mouse . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .68 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .80
     Keep the Design Simple . . . . . . . . . . . . . . . . . . . .69
     Image-Based Interfaces . . . . . . . . . . . . . . . . . . . . .69 Chapter 7
Resolution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .70 Creating a Focal Point . . . . . . . . . . . . . . . . . . . .81
     PC Game Resolution . . . . . . . . . . . . . . . . . . . . . . .70 The Most Important Element . . . . . . . . . . . . . . . . . . . .81
     Front-End Menu Resolution . . . . . . . . . . . . . . . . .70 Size Variation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .83
     Standard TV Resolution . . . . . . . . . . . . . . . . . . . .70 Color . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .84
     PAL versus NTSC Television . . . . . . . . . . . . . . . . . .71 Value . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .85
TV Color . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .71 Movement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .85
     Interlace Flicker . . . . . . . . . . . . . . . . . . . . . . . . . . .72 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .86
     Color Variation . . . . . . . . . . . . . . . . . . . . . . . . . . .72
Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .72 Chapter 8
                                                                                       Using Text in Your Interface . . . . . . . . . . . . . . .87
Chapter 6 Using Text Wisely . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .87 Button States . . . . . . . . . . . . . . . . . . . . . . . . . . .73 Type Anatomy . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .88 Controller Button States . . . . . . . . . . . . . . . . . . . . . . . .74 Serif versus Sans-Serif . . . . . . . . . . . . . . . . . . . . . .88
     The Standard Button State . . . . . . . . . . . . . . . . . .74 Ascenders and Descenders . . . . . . . . . . . . . . . . . .89
     The Selected Button State . . . . . . . . . . . . . . . . . .74 Uppercase and Lowercase . . . . . . . . . . . . . . . . . . .90
     The Pressed Button State . . . . . . . . . . . . . . . . . . .75 Points and Picas . . . . . . . . . . . . . . . . . . . . . . . . . . .90
     The Active Button State . . . . . . . . . . . . . . . . . . . .75 File Size and DPI . . . . . . . . . . . . . . . . . . . . . . . . . .91
     The Active-Selected Button State . . . . . . . . . . . . .76 Kerning . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .92
     The Disabled Button State . . . . . . . . . . . . . . . . . .77 Thicks and Thins . . . . . . . . . . . . . . . . . . . . . . . . . .92
                                                                                            Scaling Fonts . . . . . . . . . . . . . . . . . . . . . . . . . . . . .93

## Contents xi

Font Choice . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .93 Chapter 10
      Theme Fonts . . . . . . . . . . . . . . . . . . . . . . . . . . . . .94 Tools of the Trade . . . . . . . . . . . . . . . . . . . . . .113
      Multiple Fonts . . . . . . . . . . . . . . . . . . . . . . . . . . . .95 Tools for Creating Mock-Ups . . . . . . . . . . . . . . . . . . . .113
Know Your Fonts . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .95 Asset Management . . . . . . . . . . . . . . . . . . . . . . . . . . .114 Creating a Game Font . . . . . . . . . . . . . . . . . . . . . . . . . .95 Adjusting Game Properties . . . . . . . . . . . . . . . . . . . . .115 Icons in Fonts . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .97 Using Custom Tools . . . . . . . . . . . . . . . . . . . . . . . . . . .115 Font Effects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .97 Plug-Ins . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .116 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .98 Stand-Alone Software . . . . . . . . . . . . . . . . . . . . .116
                                                                                               In-Game Tools . . . . . . . . . . . . . . . . . . . . . . . . . . .117
Chapter 9 Advantages of Using Custom Tools . . . . . . . . . . . . . . .117 Technical Requirements and Tricks . . . . . . . . . .99 Disadvantages of Using Custom Tools . . . . . . . . . . . . .117 File Sizes . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .99 Commercial Tools . . . . . . . . . . . . . . . . . . . . . . . . . . . . .118
      Limited RAM . . . . . . . . . . . . . . . . . . . . . . . . . . . .100 Advantages of Using Commercial Tools . . . . . . .118
      Disk Space . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .101 Disadvantages of Using Commercial Tools . . . . .118
      Load Time . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .102 Middleware . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .119
      Online Content . . . . . . . . . . . . . . . . . . . . . . . . . .102 Commonly Used Commercial Software . . . . . . . . . . . .119
      File Compression . . . . . . . . . . . . . . . . . . . . . . . . .102 Features of Good Tools . . . . . . . . . . . . . . . . . . . . . . . .121
      Using Palettes . . . . . . . . . . . . . . . . . . . . . . . . . . .103 The Ideal Situation versus Reality . . . . . . . . . . . .122
      Using Programmer Art . . . . . . . . . . . . . . . . . . . .105 Software or the Artist? . . . . . . . . . . . . . . . . . . . . . . . .122
      Texture Size . . . . . . . . . . . . . . . . . . . . . . . . . . . . .106 3D Tools . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .123
Scalable Objects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .106 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .124 Tiling Textures . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .108 Alpha Channels . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .108 Chapter 11 Localization . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .110 Using Animation . . . . . . . . . . . . . . . . . . . . . . .125 Source Files . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .110 Movement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .125 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .111 How Animation Works . . . . . . . . . . . . . . . . . . . . . . . .125
                                                                                              Frame Rate . . . . . . . . . . . . . . . . . . . . . . . . . . . . .126
                                                                                              Interface Frame Rates . . . . . . . . . . . . . . . . . . . . .126
                                                                                         Key Frames and Tweening . . . . . . . . . . . . . . . . . . . . . .127
                                                                                              Interpolation . . . . . . . . . . . . . . . . . . . . . . . . . . . .127

## xii Contents

Animation Principles . . . . . . . . . . . . . . . . . . . . . . . . . .129 Chapter 13
     Squash and Stretch . . . . . . . . . . . . . . . . . . . . . . .129 Designing the HUD . . . . . . . . . . . . . . . . . . . . .145
     Anticipation . . . . . . . . . . . . . . . . . . . . . . . . . . . .130 Screen Space . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .145
     Ease In and Ease Out . . . . . . . . . . . . . . . . . . . . . .130 In-Game Information . . . . . . . . . . . . . . . . . . . . .147
     Follow Through . . . . . . . . . . . . . . . . . . . . . . . . . .131 Pop-Up Menus . . . . . . . . . . . . . . . . . . . . . . . . . . .148
     Arcs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .132 Dynamic Content . . . . . . . . . . . . . . . . . . . . . . . .148
     Exaggeration . . . . . . . . . . . . . . . . . . . . . . . . . . . .132 Combining Information . . . . . . . . . . . . . . . . . . .149
Designing Transitions . . . . . . . . . . . . . . . . . . . . . . . . . .132 Legibility . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .150
     Consider Experienced Users . . . . . . . . . . . . . . . .134 Eye Movement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .150
Properties That Can Be Animated . . . . . . . . . . . . . . . .134 Ease of Use . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .151
     Translation, Rotation, and Scale . . . . . . . . . . . . .134 Making HUD Look Cool . . . . . . . . . . . . . . . . . . . . . . . .151
     Transparency and Color . . . . . . . . . . . . . . . . . . . .135 Game-Play Adjustments . . . . . . . . . . . . . . . . . . . . . . . .151
Using Effects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .136 Graphic Information Display . . . . . . . . . . . . . . . . . . . .152
     Overlaid Animations . . . . . . . . . . . . . . . . . . . . . .136 Standard Elements versus Non-Standard Elements . . .153
     Particle Systems . . . . . . . . . . . . . . . . . . . . . . . . . .137 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .154
     Other In-Game Effects . . . . . . . . . . . . . . . . . . . . .137
Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .138 Chapter 14
                                                                                     Designing an Interface . . . . . . . . . . . . . . . . . . .155
Chapter 12 Nomad Design Goals . . . . . . . . . . . . . . . . . . . . . . . . . .155 Icons, Icons, Icons . . . . . . . . . . . . . . . . . . . . . . .139 The Rough Sketches . . . . . . . . . . . . . . . . . . . . . . . . . . .156 Use Text Sparingly . . . . . . . . . . . . . . . . . . . . . . . . . . . .139 Temporary Art . . . . . . . . . . . . . . . . . . . . . . . . . . .159
     Budget Constraints . . . . . . . . . . . . . . . . . . . . . . .140 Re-Do’s . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .160
Using Icons Instead of Text . . . . . . . . . . . . . . . . . . . . .140 Nomad Colors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .160
     Image Choice . . . . . . . . . . . . . . . . . . . . . . . . . . . .140 Using Color as a Tool . . . . . . . . . . . . . . . . . . . . . .161
     Standard Icons . . . . . . . . . . . . . . . . . . . . . . . . . . .141 Creating the Art . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .163
     Non-Game Standard Icons . . . . . . . . . . . . . . . . .141 Breaking Up the Art . . . . . . . . . . . . . . . . . . . . . .163
Every Pixel Counts . . . . . . . . . . . . . . . . . . . . . . . . . . . .143 Selected Rows . . . . . . . . . . . . . . . . . . . . . . . . . . .167 Photo Reference . . . . . . . . . . . . . . . . . . . . . . . . . . . . .144 Photoshop Techniques . . . . . . . . . . . . . . . . . . . . . . . . .167 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .144

## Contents xiii

Step-by-Step Art Creation . . . . . . . . . . . . . . . . . . . . . .169
     The Ship Information Panel . . . . . . . . . . . . . . . .169
     The Trade Dialog Box . . . . . . . . . . . . . . . . . . . . .173
The Big Change . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .177 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .178
Chapter 15 Creating an Interactive Mock-Up . . . . . . . . . . .179 The Ideal Situation . . . . . . . . . . . . . . . . . . . . . . . . . . . .180 Realizing Your Vision . . . . . . . . . . . . . . . . . . . . . . . . . .180
     Experimentation . . . . . . . . . . . . . . . . . . . . . . . . .180
Commercial Tools . . . . . . . . . . . . . . . . . . . . . . . . . . . . .181
     Why Flash? . . . . . . . . . . . . . . . . . . . . . . . . . . . . .181
Introduction to Flash . . . . . . . . . . . . . . . . . . . . . . . . . .182
     Using Frames . . . . . . . . . . . . . . . . . . . . . . . . . . . .182
     Animation in Flash . . . . . . . . . . . . . . . . . . . . . . .186
     Playback Speed . . . . . . . . . . . . . . . . . . . . . . . . . .188
     Using Scripting . . . . . . . . . . . . . . . . . . . . . . . . . .188
     Creating Buttons in Flash . . . . . . . . . . . . . . . . . .190
     Putting Scripts on Buttons . . . . . . . . . . . . . . . . .192
     Seeing Your Button Work . . . . . . . . . . . . . . . . . .193
     Publishing Files . . . . . . . . . . . . . . . . . . . . . . . . . .194
     Flash Summary . . . . . . . . . . . . . . . . . . . . . . . . . .195
The Sample Flash File . . . . . . . . . . . . . . . . . . . . . . . . . .195
     Actions on Frames . . . . . . . . . . . . . . . . . . . . . . . .196
     Actions on Buttons . . . . . . . . . . . . . . . . . . . . . . .196
Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .198 Index . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .199

## This page intentionally left blank

## Introduction

                                            and I couldn’t hope to cover it all. Who Should Read This
         n interface, as you no doubt
## This book will, however, cover all of
         already know, is the part of Book?
## the basics you need to know in order
         the game that allows the user If you are just getting started in the
## to design your own game interface.
A to interact with the game. Interaction is what makes a video game different An interface has many pieces. This
## game industry, this book will serve as
## a great introduction to interface
from a movie. When playing a video book will cover the interface from the design. It will also provide a little game, the user can make choices and first image that appears on the screen insight into the video game industry respond to events. An interface is the to the information displayed on itself. connection between the user and the screen during game-play. The player game, and a well-designed interface of your game interacts with buttons, Game development is a unique and makes the video game experience sliders, menus, and many other com- interesting field. It is fun, rewarding, more fun. ponents of an interface, and this book and a lot of hard work. In this book
                                            will show you how and when to use you will get a glimpse at the developer
Interface design is a creative, exciting, and publisher relationship, as well as
## each of these input methods.
and challenging subject. The purpose at the schedules, budget constraints, of this book is to introduce you to the I hope that this book inspires you to and politics that are found in the game interface design principles and create better and more effective game video game development industry. concepts used in the game industry. interfaces. You are capable of making There is a huge amount of informa- a great, unique interface. Don’t limit tion to learn about interface design, your vision by what has been done in
## the past.

## xvi Introduction

Even if you are an experienced inter- I will also walk you through the early I will also show you how to avoid face designer, this book will provide planning stages for a game interface using too much text in your interface hints and tricks that can help you in and present methods for crafting a and how to replace as much text as your daily tasks. After reading this unique look and feel for your inter- possible with images and icons. This book, you will be able to better evalu- face. Creating icons, animation, and is not always an easy task, but a good ate the effectiveness of an interface, buttons will be covered. use of icons can separate an extraorand you will be aware of the areas in dinary interface from a mediocre one.
## Basic design and art principles are
which you can improve. A screen full of text will turn users
## essential for any interface designer to
## away; learn about methods you can
The application of the principles I will understand. As you read through
## use to communicate with the user
show you in this book will help these pages, you will learn about these
## without text.
improve your design skills. It will also basic concepts and how they can provide inspiration to go beyond the guide you through the design process. Make it move! Animations can be a norm and create interfaces that capti- You can use these design principles to game interface designer’s greatest vate and entertain the user. effectively evaluate your own design asset. I’m not just talking about a
                                           and identify areas for improvement. spinning logo, but about serious aniYou will begin to understand how mation. Understanding and applying
What’s in This Book? much skill and talent is needed to solid animation techniques can bring Great interfaces never happen by acci- produce a great interface. It’s hard a static interface to life. Learn these dent. They require a lot of planning. work, but it’s worth it. animation principles and how you This book will outline the steps to can use them in an interface. good planning. You will be encour- In this book, you will also explore aged to define goals that will guide the world of interface buttons. This Chapter 14 will walk you through the you through the design process and simple-sounding topic is actually step-by-step process of creating an be shown how to plan and chart your very complex. I will explain the con- interface. You will see how an intermenus before you begin to create art. cept of button states and teach you face is created using Photoshop. You will learn how to be innovative how to make a functioning button for This process will help you understand and creative in the planning stages of a game interface. You’ll learn how to how complex serious interface design the design process. create buttons that are easy to use and can be.
## that look cool.

## Introduction xvii

In Chapter 15, you’ll learn how to use Flash to create an interface with real interactivity. This software provides an effective method to mock-up and test a game interface design. Don’t wait for a programmer to write code to see your design in action. You can do it yourself. Learn how to use Flash to make buttons function and objects move.
What’s on the CD? This book also comes with a CD containing images and examples. You will have access to many of the images in this book. You will also be able to open the Flash file created in the last chapter of the book and see it move. The CD also includes a free game demo and trial version of Macromedia Flash.

## This page intentionally left blank

## Chapter 1

Introduction to
## Video Games

                                          The Importance of the visual quality of a game is very imporelcome to the world of
## tant; it is hard to sell a game if it looks
             interface design for video Interface bad, even if the game-play is fun.
W games. Of course, the Too often, video game interfaces are best instruction you can receive is an afterthought. Sufficient time is not Great art can do amazing things to real-life experience. No matter how scheduled for interface design because boost game sales. Many game pubgood a game artist is before he begins too many project managers assume lishers claim that their number-one developing video games, he learns a anyone can whip up an interface. priority is game-play, but I’ve seen lot during the development process. They feel that interface design does these same publishers look at a game Gaining this experience will take time. not require any particular talent or and respond with “that looks great,” In the meantime, I hope to share a lit- very much time, so they assign the even though they never picked up a tle of my experience with you and give new guy to work on the interface. This controller or mouse. If a game doesn’t you a head start. is a big mistake, and when it happens, look good, no one may ever play it
                                          it’s apparent to anyone who plays the and find out if the game-play is good.
                                          game. It isn’t hard for the user to Consumers are used to seeing great
                                          immediately see poor quality. The art, and they demand high quality in
2 Chapter 1 ■ Introduction to Video Games
any game they play. Great visuals can “player editor”? Changing character restrictions goes something like, “The actually make a game more fun to outfits, hair, skin color, and tattoos Marketing Department says the game play. can be a lot of fun. All of this takes will sell better if the colors are
                                           place in the menu. Without ever start- brighter.” Who can argue with that?
Even more important than the visual
## ing the core game, the user feels like
aspect of interface design is the func- Artists who are new to video game
## he is already playing.
tionality. A poor interface can ruin the development often believe that the entire video game experience. The perfect conditions I mentioned might game experience will be negative if Real-Life Game actually exist. When these conditions the user is confused and can’t figure Development don’t exist at their current company, out how to navigate the front-end they assume that other developers at menu or if he can’t understand where In this book, I will discuss interface other companies have this freedom. to find information while playing the design for video games under perfect These inexperienced interface designgame. The more the user has to search conditions—if there is no limit on ers don’t understand all of the factors for information and think about how time or budget. I will assume that you that contribute to final decisions when to play, the less enjoyable the game have been given total creative freedom developing games. Unfortunately, becomes. The interface is a vital com- and, as the interface designer, you can total creative freedom is not usually ponent of a game and should not be make decisions. In an ideal situation, given to most interface designers. treated as a component that is unre- a producer or designer won’t mandate Because of the restrictions that exist lated to the game or as an unimpor- that the interface should look like a while making a game, I have rarely fintant task. previous version of the game (most ished a game and felt like I had creatlikely designed by a less-competent ed the very best interface I was capable On the other hand, a great interface artist and designer than you) or direct of creating. I feel satisfied if it was the can significantly enhance the experi- that the interface must be in his best I could do under the circumence. A simple-to-use and visually favorite color. Too often, someone at stances and restrictions I was given. appealing menu can set the tone for your company notes that a competing the game. The first thing that the user game has a hair-color option in the Many factors apply to real-life intersees when he starts a game is the player editor and demands that your face design. Time and budget can front-end menu. A good-looking game must have the same feature. It greatly affect the amount of effort interface with a lot of well-designed then becomes a requirement that this that can be applied. The bottom line features can actually be fun to use and feature must be implemented exactly is that budgets and schedules may even seem like a game itself. Have you how it was done in the other game. have been set that may not allow ever played around with a quality Another one of my least-favorite for full 3D models to be used in the

## Working with a Team 3

interface or for trips to a junkyard to time. Telling everyone that you always this game, we had to make some carecollect photo references. Although the know better than they do won’t ful decisions about what to leave out extra effort may result in a better inspire others to join your cause (even and what to add. If we had had a biginterface, not working under the if after reading this book you really do ger budget and more time, I would restrictions of the game can have dis- know better). have done many things differently. I astrous results. am proud of this game, not because it
## Don’t be afraid to explain that you
## is the best game in the world, but
I have worked on many games that don’t agree with feedback, but make
## because it was made really quickly by
were canceled before they were fin- sure you can explain why. “It will look
## a few artists and programmers. It still
ished. These games were cancelled for better” is not as convincing as offering
## is very fun, and it got some great
many reasons—most of them out of the explanation that serif fonts are
## reviews.
my control. If the game publisher hard to read at low resolutions. Don’t thinks that they can’t complete the be shy—offer constructive options, game within the budget, they have a and tactfully point out potential Working with a Team decision to make: They can try to problems. After a focus group has Video game development requires a come up with the extra money to found a flaw in the design, you won’t team effort. This is especially true complete the game or they can cut be very convincing when you try to with the really cool, big-budget their losses and cancel the game. A explain that you knew it should have games. While there may be few examsurprising number of publishers been done differently but didn’t want ples of a group of three or four people decided to cancel the game. to say anything. who make an entire game, these are Choose your battles and work well Don’t ever let these real-world limita- rare exceptions, and it is often evident with others. Feedback and direction tions keep you from designing amaz- in the final product if a full team did can actually make the completed ing interfaces, though. Let them serve not work on the game. The triple-A game better. Sometimes the guys in as a challenge. Learn to work your blockbuster games often involve charge actually know what they are best under these conditions. They amazingly large teams. The members talking about! If you are closed to aren’t an excuse for poor design—if of these big teams must learn to work ideas and suggestions, you may pass you really are good, you can still cre- well with one another. up some really good advice. Your ate great interfaces. Often, problems occur during game skills and abilities will be trusted development because team members
## I have worked on games with very
more as you demonstrate your skills just can’t get along. Fighting and
## small budgets. One such game is on
and you learn more about the game arguing can cause just as many prob-
## the CD that comes with this book. On
development process. This will take lems as incompetence. Because of
4 Chapter 1 ■ Introduction to Video Games
this, putting 20 people who do not Ask Questions of the conversation understanding work well together on the same team If someone has an idea that you think why he made his decision, even if they may not be twice as effective as is wrong, the best thing to do is ask did not agree with it. putting 10 people together who do. questions. Good questions require a The bottom line is that working in a On the other hand, putting 20 people lot of thought and effort on your part. team is essential for game developwho work really well together on the These questions can demonstrate that ment. Don’t be a problem in the game same team can produce more than you understand their point of view. development process. Even if you are twice the results of a 10-person team. Try to get all of the information you talented, you need to work well in a Cooperation is key. can. Make sure you completely under- team.
## stand the opposing point of view
Listen to Others before you offer your suggestion. If You may actually be right. You might you feel that an idea has flaws, polite- A Career in Video even know more than the decision- ly ask if the person you are talking to Games makers. Your ideas may be better. But has considered these problems. They Reading about the potential obstacles this doesn’t mean that you should may have a solution to the problems may make video game development argue. Express your opinion politely that they just have not described well. sound like a terrible experience. In when it is appropriate to do so. If you Or they may see the flaws and change reality, making video games is great! It have an “I’m right, you’re wrong” atti- their mind without an argument. is not easy, but that’s one of the reatude, you won’t get far. I once worked with a great game sons it’s so rewarding. If it were easy,
                                             designer who was really good at this. anyone could do it.
Whether you have the authority over your co-workers or they have the abil- Everyone liked him, and no one was The game industry is not easy to ity to enforce their ideas, the best thing afraid to approach him with a sugges- break into. The best way to get into you can do is listen. Take the time to tion. The great thing was that when he the industry is to be really good. You listen to their ideas and seriously con- made a decision, he was usually right. will also need to be able to demonsider what they are telling you. The If anyone disagreed, he would talk strate how good you are. This is why a best game and interface designers are things through with them and ask a good portfolio is key. Having a great not afraid to change things if they lot of questions, like: “Have you portfolio is essential to getting your come across a better idea. They are thought about . . .” or “Why do you first job in the game industry. able to recognize good ideas, even if think that it would be better to do it
                                             that way?” Because of his great com- Interface design is important when
the ideas are not their own.
                                             munication skills, everyone came out developing games, but only big studios

## The Publisher / Developer Relationship 5

can afford to have an interface expert first job in the game development aren’t willing to work on. A wide variwho spends all of his time creating industry. I found a company that was ety of games exist, from those that interfaces. It may be harder to land a looking for someone to fill the role of involve pornography and gambling to job at these bigger developers because art lead. I had more than just art religious and educational games. If they have more experienced artists skills, and that is why I got the job. you want to work on a particular type who are applying for the same job. of game, it is a good idea to develop a
## You should do something you love for
The way to combat this problem is to portfolio that fits with the kind of
## a living. The best artists are the ones
diversify. Make sure you have other game you want to make.
## who have a passion for making great
skills that can be used when developart and great games. The game indus- After you have broken into the indusing video games. Smaller developtry is too demanding if you don’t love try, you should continue to build your ment studios may have the same guy
                                           it. It is very rewarding to see your portfolio. Improve your skills and
designing the interface and building
                                           game on the shelf in a store, but it is find a way to prove you can do the
3D models. If you are trying to break
                                           not easy to get it there. Many late job. The most important thing for
into the industry as an interface
                                           nights must be spent and tedious your next job is your title list. The
designer, you might want to choose
                                           tasks must be completed during the most important game on your title list
another area of game development
                                           game-development process. If the is the last one you worked on. Because
and develop these skills along with
                                           process is not fun and rewarding for games take so long to make, it is not
your interface design skills.
                                           you, it will be hard to push through easy to build this list. The experience
I was lucky that a discerning art direc- the tough spots. you gain in making a game in invalutor saw my potential. When I think able.
## I always get a good reaction when I
back to my portfolio when I first
## tell teenagers what I do for a living,
graduated from college and started
## but I don’t always get the same enthu- The Publisher /
looking for a job, I am not sure that I
                                           siastic response from their parents. Developer Relationship
would have hired myself! I worked my
## Many people assume that because
way through college at a company Most of my experience has been
## some video games contain offensive
that did packaging. I was hired just as developing video games for consoles.
## material, all games are bad. This is
the company was creating a Design The most common model for console
## tantamount to declaring that all
department. By the time I graduated, development is that a game publisher
## movies are bad because some movies
I had been promoted to the Art provides all (or part) of the funding
## are violent. If you plan on working in
Director position. This management to develop a game. The publisher also
## the game industry, it is a good idea to
experience is what helped me get my funds marketing, packaging, and
## decide early on what you are and

6 Chapter 1 ■ Introduction to Video Games
distribution. Because the publisher is games and are, in essence, their own paying for the game, they have the publisher. Many publishers do their final say. The power is in the money. own internal development. Even in Publishers often give a developer a these instances, there is often a person great deal of creative freedom, but or group in charge of giving direction they always have the final say. They and making final decisions. This perare taking the financial risk and, son or group fills the role of publishtherefore, they have the right to get er. Every developer would like to what they want. make these decisions himself, but it is
## very expensive to develop a game. The
The publisher typically pays for devel-
## reality is that most developers do not
opment by giving the developer pay-
## have the money to produce the big
ments along the development process.
## budget games on their own dime.
A milestone schedule is created at the beginning of development that outlines what will need to be completed for each milestone. The developer then presents these items to the publisher on the date they are due. If the publisher approves these milestones, then they make a payment to the developer. Because money is tied to each payment, getting these approvals from a publisher becomes very important to the developer. In this book, I will refer to the publisher/developer relationship often. I will assume that a publisher is providing funding and that the publisher makes any final decisions. This is not always the case. Many independent game developers fund their own

## Chapter 2

## Planning Menu Flow

                                            Why Is Planning So Without good planning, it is hard to
         lanning is vital to a successful
## know what needs to be done. It is easy
         interface. If budget or time Valuable? for artists to waste time creating art
         requirements are tight and The best way to speed up the design for things that will never appear in the
P corners must be cut, then cut something else. If you cut out the planning
                                            process is to only do things once, and game. How many screens are needed?
                                            careful planning gives you a shot at What pieces of art can be re-used in
stage, your project will probably end getting things right the first time. It different areas? What information up taking longer and costing more may seem impossible to get a perfect must be displayed in game? All of than it would have with careful plan- interface on the first attempt, but if these questions should be answered in ning. If you really want to complete you don’t plan your process, then you the planning stage. Good planning an interface design quickly, spend almost guarantee that things will need will generate a list of assets that are more time planning. A large-budget to be redone. You know that you will needed and there will never be a quesproject may afford the luxury of more make changes, but that doesn’t mean tion of what art needs to be created. experimentation and trials, but with a you should avoid planning. If you lean project, you need to get it right don’t plan, you will end up having to Just like with everything else in the the first time. make even more changes. game development process, you
## should strive for the best but plan for

## 8 Chapter 2 ■ Planning Menu Flow

the worst. In the ideal scenario, all of If I know how many screens will be can be greatly reduced by smart planthe details can be planned in advance needed for the front-end menu, then I ning early in a project. This will only and never changed. But in reality, can simply do a little math and know be beneficial if you are willing and some changes will always be neces- how much time I have for each indi- able to react and adjust to the risks sary. Plan time for revisions but do all vidual screen. This will make it easy to you identify early in the project. you can to avoid them. A trap many determine if I am on schedule or if I interface designers fall into is, when am falling behind. You will need to they see that time is planned for mak- ramp up and expect that the first tasks
## Creativity in Planning
ing changes, they use this “extra” time will take longer than the tasks at the At first glance, the planning process to justify incomplete work. “I can end. If you have designed five other may not seem very creative. It might always fix it later,” is a bad attitude. screens, it will be easy to make a sixth even seem boring. Charts and graphs What usually happens in these cases is screen that fits into the design of the that are kept intentionally visually that the final polish is never added, first five. Of course, make sure not to plain are often used in the planning and the game ships with an inferior cut it too tight—add some time for stage. Little or no art is being created, interface. revisions and adjustments. Without a and it can seem very tedious to somegood plan, it is difficult to know how one who is bursting with creative Solid planning can also help deter- energy.
## much time you can spend on a task
mine schedules. If the design requires
                                           and if you are ahead or behind. If you have a complete understanding
100 screens, each with unique art, it may just take too long to create a fully Accurate scheduling can reduce the of the entire interface design process, animated 3D scene for each of these panic level at the end of the project. this attitude will vanish. There are screens. If the design can be simplified There will always be a push at the end some very important and potentially and the resulting design only requires of the project, but you will be able to creative decisions that are made in the a handful of screens, then more time better manage things if you have a planning process. Truly creative and and attention can be given to each plan early on—you can attack prob- innovative ideas can be conceived at screen. More time will be required if lems early. A common result of poor this point. You can ask questions like, the game design is so complicated planning is a string of “all-nighters” at “What if we tried it this way?” that a large number of options and a the end of a project. This is one of the Arguably, these ideas can be more lot of information must be displayed. situations that cause your significant important to the ultimate game than You can make more reliable time esti- other to insist you find a job outside pretty art. It may be more important mates if the quantity of art needed for the video game industry. While that you decide to have a 3D animatthe game can be determined. crunch time is part of the industry it ed character guiding the user through
## the interface than it will be if you take

## Getting Approval 9

the same approach as in every other offers the game designer, project Getting approval can avoid your game and just make a cool logo. In the manger, or other team members the being blamed later because you can planning stage, you can make these opportunity to give the go-ahead or always refer back to the approved types of decisions. You are choosing voice concerns. Time can be wasted if plan. Once you have received the most important places in which to the decision-makers decide halfway approval, it should never be used as a put your time and effort. If a 3D guide through the project that everything threat. This will make everyone hesiis not going to significantly add to the should be done differently. A produc- tant to give you approval. You don’t user’s experience, you may find it bet- er could decide that the user should want to give the impression that you ter to spend your time creating cool, be able to choose a weapon before will fight against any reasonable animated transitions between screens. starting a level. If the producer has a changes after your plan has received
                                           chance to review the plan early, he approval, but the person giving
An interface designer who truly
                                           could point this out. approval needs to understand that
understands interface design can plan
## there is a certain level of commitment
for creative and elegant concepts in You won’t be able to avoid changes
## in the approval.
the planning stage. It is much harder from the person in charge, but you to find a designer who understands can reduce the amount of changes Get as much information as you can this concept and can come up with you get. You can make it much easier before you even start to plan. This will creative ideas that are also possible for the producer to give you direction help you get approval faster. If you under the budget. These designers are early if you present him with a good understand the expectations, it is more valuable than those who can plan. He may not even know what he much easier to get approval. The create only cool-looking art. Creative wants himself, and planning can help more difficult problem comes when planning is an area wherein an inter- him to figure it out. the publisher or producer doesn’t face designer can become truly great. know or can’t articulate what he
## As you are presenting your plan to
If you can come up with great ideas wants. This is where good communi-
## your boss or publisher, make sure that
and you can skillfully execute these cation skills come in. It is your job to
## he understands that you are seeking
ideas, you will be in demand. understand what the producers or
## approval and that this is the best stage
## publishers are looking for and give it
## to provide feedback. If the person in
## to them, even if they don’t know what
Getting Approval charge glosses over the plan, it can
## they want.
Another reason for good planning is cause problems later. If you can make to get proper approval before starting adjustments now, everything will go After a plan has been laid out, suffito create art. A well-planned interface much more smoothly. cient time must be spent evaluating
## the details of this plan. This should be

## 10 Chapter 2 ■ Planning Menu Flow

done by anyone who has veto power. ingly simple screen wherein the user programmer. If you plan on playing You can help make this clear by asking chooses an environment can prompt full-motion video in your menu while something like, “I need to get your questions that will help determine the animating buttons on top of the approval on this layout to make sure game’s ultimate design. Will the user movie, you will need to see if the that everything is the way you want it. be able to choose between different engine has this capability. If you plan This will help avoid changes.” A polite environments? How many choices on using real-time 3D in the frontrequest like this one conveys the idea will he have? Will some environments end menu, the programmer will need that you expect this to be final be locked and not available to the user to make this possible. Do your best to approval. Just because flow charts until he completes certain tasks? Can work well with the programmer. Both don’t look pretty doesn’t mean they the user choose an environment in of you will have to work as a team to don’t deserve serious consideration. every mode of the game or are there get a functional interface—No one
                                          some modes that will dictate environ- can go it alone.
## ment choice? Will environment
Interface Planning choices, in the menu, be affected by Helps Game Design other choices made during game-
## Game Design Goals
A detailed plan for a video game play? The questions could go on and A good way to for a game designer to interface can really help drive game on. They are questions that affect the make decisions about the features of a design. Fleshing out all of the details flow of the menu. It is easy to see how game is to have goals. If the interface in the menus and the HUD will force game-play can be affected when seri- designer also understands these goals, many game-play decisions to be made ous thought is given the interface. It is it will be much easier for him to make early. It may also bring up important difficult to have a solid plan if the decisions about the interface. It’s not issues that may not have been consid- game design is underdeveloped. always easy to define the overall game ered until later in the game-creation goals, but if the game designer takes
                                          Don’t forget to show your plan to a the time to create concise goals for the
process. The game designer may programmer. The planning stage is a change actual game-play based on entire game and the interface designgreat time to get feedback and sugges- er clearly understands these, many serious consideration of the interface tions from the programmer who will design. decisions will be easy to make. Goalbe working on the interface code. The oriented design produces great You can ask a lot of good questions in features planned in an interface great- results. the planning stage. These questions ly affect the programming schedule. can stimulate the imagination of the Something that may seem easy to an You may be wondering, “What kind of game designer. For example, a seem- artist can provide a big headache for a goals do I need to set when designing
## an interface?” Make the coolest inter-

## Game Design Goals 11

face ever may be the first thing that choose a completely different art style ■ Continue a successful series. comes to mind. This goal sounds because of this goal. You might use a ■ Sell another product (other great, but it probably shouldn’t be the little less rust and grunge than you than the game itself). first priority. As much as everyone would use in a game aimed at hard- ■ Promote a moral issue. wants a cool interface, there may be core gamers, for example.
## ■ Create a buzz using controversy.
other things that are more important. If you are making a kids’ game, for ■ Create an educational experi-
## Possible Game Goals
example, it might be more important ence.
## Below is a list of possible goals that a
that the menu is easy for a six-year- ■ Pass the approval process of the
## developer or publisher may have.
old to use than that it looks cool. console manufacturer.
## These goals may not match perfectly
Prioritization is key to using these ■ Please the Marketing depart-
## with your personal goals, but it is
goals to guide your design. ment.
## important to understand the goals of
The game designer, publisher, and the guy in charge. This list is by no ■ Tell a story.
project manager may need to work means a complete list of goals that
## Don’t treat goals lightly. As an interout the game goals. Everyone will could ever be used for game design. In
## face designer, if you are not given
need to agree on the goals. Each of fact, it is a very brief list. This list is
## goals for the game, you might want to
these people has a different role and just meant to stimulate thought about
## present the goals that you think everymay have a different prospective. If the real goals of your next game.
## one would agree on. This will give you
they can agree on a prioritized list of
                                             ■ Promote an existing license or a chance to see if you understand
goals, it can help everyone work
                                               famous personality. what everyone else is expecting. Ask
together.
                                             ■ Capitalize on an existing license questions about the target market,
Some goals may not be what you or famous personality. subject matter of the game, budget, would expect. For example, the first schedule requirements, what the most
## ■ Meet a particular schedule.
goal of the game may be to reach a important feature of the game is,
## ■ Reach a particular audience.
broad market. If you are creating an what makes the game unique, what online game that will be used to pro- ■ Create something completely other games might be similar, and so mote soap, the client’s goal may be to unique. on. A clear understanding of all reach a broad audience. This goal may ■ Outdo a competing game. aspects of the game will make it much not lend itself to the type of design ■ Capitalize on the success of a easier to understand the overall goals that hard-core gamers might consider competing game. of the game.
## the coolest interface ever. You might

## 12 Chapter 2 ■ Planning Menu Flow

If you have input on creating the Breaking Down Your Goal al and teach kids about animals. A game goals, be honest with yourself. into Specifics secondary goal is to make the interGet honest information from the Avoid the temptation to set one large face intuitive and easy to use. This game publisher. It may take a little goal that is actually several goals in secondary goal is important, but it is coaxing to get a publisher to give you one. This is often the easy way out—it lower on the priority list. If you are the direction you need. It is, however, is more difficult to articulate specific armed with this information about very important to understand the goals than it is to generalize. But a the game’s priorities, decisions will be publisher’s vision. He is paying for the goal like “Make a cool game” is not easier to make. For example, a lot of project, and therefore his goals and nearly as clear as “Add three new and text describing the difference between opinions are always the most impor- creative features that are not found in amphibians and reptiles may be used tant. It won’t do any good to pretend competing racing games.” You could in the interface. Using all of this text that the number-one goal of the game even break down this goal into sever- may not support the goal of a simple is to be innovative when the number al more detailed goals: Create one new interface, but as the first goal of eduone goal of the publisher really is to feature that appeals to avid racing cation is more important, the text reach a sales goal. game fans and add two new features must be kept. This does not mean that
                                           that appeal to the more casual gamer. the lesser goal of a simple interface
If you are working on a game that has
                                           All of these goals could be a subhead- can be dumped. There may be ways to
a movie tie-in, the number-one goal
                                           ing of “Create a game that will sell work around the text and create the
may be to get the game on the shelf at
                                           more copies than the last version.” best possible solutions that includes
the same time as the movie is released.
## The point is to define useful goals that the text.
This may be more important than adding cool new features. In such a will provide direction during devel- In the case described above, you may case, the schedule should rule. Any opment. Understanding the motive need to be a little creative and include feature that has the potential to delay behind the goal is very important. the necessary text but not clutter an the project may need to be scrapped, interface. One solution could be to even if it would make the game “super How Priorities Affect create an information button with a cool.” When making decisions, it will Decision-Making recognizable icon. This button could be easy to throw out anything that Now think about how priorities can be placed next to animals. When the would jeopardize the schedule and affect decisions. Let’s say that the first information button is selected, a popchoose the features wisely. priority of a game is to be education- up window appears with all of the
## text. This window can be closed and

## Charting Methods 13

other information buttons can be of a flow chart. Don’t worry about e-mail, and it was much harder to selected. This way, the user can easily what the chart looks like so much as make changes to them. access all of the information, but the what information and options will be
## I have come up with a charting
screens with the images of the animals displayed on each screen. Just get the
## method that works well for me. There
can be kept simple. flow on paper and make it easy to
## are many other methods that would
## understand. You can waste time mak-
## work equally well, but I’ll share my
## ing pretty borders and cool-looking
Charting Methods method as an example. Feel free to
## backgrounds. Simplicity and clarity
The menu system that appears before develop your own methods and sym-
## should be the governing factors.
the game begins is often referred to as bols. The important thing is that your the front-end. This term helps distin- There are many software programs chart includes all of the information guish this menu from all of the in- that can help you create charts. I pre- discussed here and is easy for others game and pause menus that can fer to use Adobe Illustrator because I to understand. appear in a game. The best way to know it well and use it for other parts
## Start by creating a box that represents
plan and organize a front-end menu of game development. There are pro-
## the first screen that is seen when the
is to create a flow chart. This will give grams, like Visio, that are specifically
## user starts the game. Make a box that
you the chance to organize your ideas. made for creating flow charts. These
## is large enough to fit several lines of
Once you have a chart, it is also easy programs can be much more efficient
## text. All of the options for that screen
to give this information to others for than a standard art program. Making
## should be listed in this box. Place a
approval or feedback. A great flow changes should be easy. If you don’t
## title at the top. As you choose the size
chart can even allow the programmer plan on using a program that was
## of the document and the size of all of
to begin programming the interface made for creating flow charts, I would
## the elements that appear in this flowwith temporary art, before the final strongly suggest at least using a vector
## chart, you should take several things
art is completed. A flow chart makes it program, like Illustrator, and not a
## into account. Most likely, this chart
easy to see what tasks need to be done. raster program such as Photoshop.
## will be printed at some point. The text
## Vector files will be much more flexible
The important thing to remember and images will need to be large
## when it comes to editing; they create
when charting a menu is to be consis- enough to be easily read on paper.
## smaller files and print clearly. I have
tent and clear. The purpose of creat- Think about the total number of
## seen some cool-looking flow charts
ing a flow chart is to be organized. screens that will appear in the flow
## created in Photoshop, but they were
Clear communication of the flow of chart, and make sure that the spacing
## big files that were hard to send in an
the interface is the number one goal and size will allow for all of these
## items to fit (See Figure 2.1).

## 14 Chapter 2 ■ Planning Menu Flow

                             Figure 2.1 screens, you may discover something the Back buttons. Use a different colCreate a box that that will cause you to come back to ored arrow to represent the transition
## represents the
                             title screen. the first screen and make changes. when the user presses a Back button.
                             Carefully plan the This is a natural part of the charting This will help keep things clear.
## size and spacing process.
                             of your chart. Video games often have items that are
                                                  Once you’ve listed the options, you locked and are only accessible after
                                                  need to decide where each of these certain tasks have been performed in
                                                  buttons will take the user. Create new the game. Levels may need to be
                                                  boxes, just like the first box, for each unlocked by completing a previous
Tip of these new screens. Type in all the level. The user may only have access to
                                                  options that should appear on these certain cars until he has won enough
      Your menu may become too compliscreens and decide where each of the races. Most games have some items
      cated to fit on one page. Most software
      programs provide the option to print
                                                  buttons in these menus will send the that are not available, or locked, at the
      one document on multiple pages— user. Use this method to chart out the beginning of the game. This is a good
      when the chart is printed, these pages entire front-end menu. If important time to identify these items. Once an
      can be pasted together to make one information or images (such as a item is identified as one that is initialbig chart. tournament bracket in a sports game) ly locked, it will be easier to visually
                                                  will need to be displayed, make sure to design this screen later. (See Figure
                                                  list these items. Make sure that they 2.3.) If you know that in the end 20
Charting may not be easy. It is very
                                                  are visually distinct from the items different soccer fields will be available,
likely that you’ll have questions that
                                                  that will be interactive. I have created but in the beginning the user can only
aren’t easily answered during this
                                                  a sample of a chart that could be used play in one of the three available
charting process, and you’ll need to
                                                  for a sports game interface. All of the fields, this will affect your design.
make changes to your chart once
## items that are not interactive have
these decisions have been made. You may want to let the user know
## been italicized in this example. (See
Don’t let this intimidate you. The best how many options are possible to
## Figure 2.2.)
way to root out problems is just to get unlock. In the example above, you started. Take your best guess at the The next thing you need to do is cre- might want to display all 20 fields and options that should appear in this ate arrows that show the flow of the just mark some as locked. This is first menu and type them into your interface. Use these arrows to connect important to know before you start to chart. As you move onto other all of the various screens. Don’t forget design these screens.

## Charting Methods 15

Figure 2.2 Create boxes for every screen in the menu and list all of the options on each of the screens.

## 16 Chapter 2 ■ Planning Menu Flow

Figure 2.3 Notice the transitions and the locked items. This is a relatively simple menu.

## Button Types 17

The charting process may seem sim- A common technique, used to avoid I will assume that the user will be ple, but it can take a lot of thought to confusion, is to darken the previous using a mouse or a controller as an get it right. This first example is rela- menu, which is in the background. input device. There are, however, tively simple and straightforward. It This way, the user does not think that many other options. Voice recognidoesn’t take long for a menu to the buttons on that part of the menu tion technology has improved and become very complex, however. Take are active. Occasionally, a pop-up there are some games that use a a look at Figure 2.4 and see how this menu can advance a user onto a microphone as an input device. Some same game, but with a bigger budget brand-new screen, but it is much systems use other input devices such and more features, is more complex more common to have these pop-up as guns or drums. Not as many interand will take more time to plan. menus close and return the user to the faces have taken advantage of these
                                            screen he just came from—they are interesting input devices. This does
Notice another type of screen in
                                            sort of “dead ends” in the menu flow. not mean that there are not any great
Figure 2.4. These are pop-up menus.
                                            Because they are often small, they typ- solutions that use this non-standard
The traditional pop-up menu is dif-
## ically do not contain as many options hardware.
ferent from a regular screen in two
## and information as a full screen does.
important ways. These menus are not The way to get input from the user is stand-alone screens; they appear on to detect which buttons have been top of the current screen. When they Button Types chosen by the user. The user makes are activated, they “pop up” over the This is a good stage at which to exam- choices that advance him through the current screen. The screen that was ine the interactive aspects of the menu. Every time the user makes a visible before the pop-up appeared menu. How does the user make selection, the game engine detects can often be seen in the background. adjustments or choices? Most menus these choices and the appropriate The pop-up menu only covers part of have several different ways of accept- changes are made when the game the screen. Pop-up menus often ing user input. Buttons, sliders, and starts. Simply put, the user chooses appear when there is a small amount toggles are very common and are all features such as Single Player mode of information that needs to be dis- used in many menus. The trick is to and Easy difficulty level by pressing played and this information does not choose the appropriate input method the buttons or pressing Select on the justify a full-screen menu. for each item. What information does controller. When the game starts,
                                            the user need to input, and what is these settings take effect.
## the simplest method to get this infor-
## mation?

## 18 Chapter 2 ■ Planning Menu Flow

Figure 2.4 It is easy to see why a flow chart is necessary to visualize how the menu will work.

## Button Types 19

Sliders instinctively knows what to do with box is checked or the button filled, Sliders are a great way to adjust values it. (See Figure 2.5.) this means that the state represented that have a wide range of possibilities. is on. If it is empty, the state is off. For If the value that is being adjusted only example, a radio button may be has a small number of distinct choic- placed next to a line of text that reads es, such as Easy, Moderate, and “High Level of Detail.” If the circle is Difficult, then other methods work empty, then High Level is off. If a dot better. Numeric values like a range appears in the circle, then this option from 1 to 10 or 0 to 100 percent work is turned on. A radio button does not great for sliders. Music volume is always have be a circle with a dot. For another good example of an input that example, the same functionality could could use a slider—the user can move be accomplished with a check box. It the slider left and right and get a wide is important that the empty version range of volumes. When using sliders, looks empty and the filled version
## Figure 2.5 Be creative when designing
the settings are typically remembered the look of sliders. Just be sure not to looks filled. The user should be able to by the game engine. If the user sets the confuse the user! recognize it as a radio button. volume at 3, and leaves the menu, the Changing a toggle switch can be volume should remain at 3. If the accomplished using several different
## Toggle Switches
game system has a method to save methods. When playing a console information on the hard drive or on a You can use a toggle input method
## game, the user can make a change by
memory card, this setting should also when there are two possible states,
## moving the control stick left and right
remain the next time the user plays. such as On and Off. Methods for dis-
## when the option is highlighted. The
## playing these two states and getting
Just because you’re using the stan- toggle can also change as the user
## the user input can vary. As the word
dard input method for a slider does- presses the Select button when the
## toggle implies, the user can change
n’t mean there isn’t any creativity from one state to the other by toggling involved. All sliders don’t need to or changing the switch. look the same. This is another area where you are only limited by your A radio button is a commonly used creative ability—the only thing that toggle switch that is placed next to is important is that the user recog- text or an icon. The text or icon repre- Figure 2.6 These are some standard nizes the control as a slider and sents one of the two states. When the looks for a radio button.

## 20 Chapter 2 ■ Planning Menu Flow

option is highlighted. Look at the If there are too many options to dis- same direction, then the selection methods used by other games and see play all at once, you can handle the indicator remains still while the what will work best for your game. situation in a couple of different ways. options move onscreen. (See Figure The goals are to use what you think One method is to keep the selection 2.9.) will come naturally to the user, and to indicator stationary and the options be consistent throughout the entire scroll on and off screen and move into Input Text menu. place. (See Figure 2.8.)
## In some cases, the user may need to
                                             You can use a combination method, input text. For example, the user may
Lists but this can become confusing if it’s be given the option to enter a name Lists are used in many different ways. not executed well. In the combination for his character. This can be a simple If all of the screen options can be seen method, the cursor moves from process when playing a game on a PC, on the screen at once, then the user option to option if it is visible on but it can become very complicated can move the selection indicator to screen. Once the selection reaches the the option he wants and the options last visible option on the screen, and remain in place. (See Figure 2.7.) the user continues to move it in the
            Figure 2.7 The selection indicator moves, Figure 2.8 The selection indicator remains
            and the options stay stationary. still and the options move.

## Button Types 21

without a keyboard, as when playing a pre-determined). One of the letters is method is that it can take a long time game on a console. always highlighted, and the user can to enter a name—it is much slower
                                                move this highlight left, right, up, and than typing. Figure 2.10 shows an
This challenge has been addressed in
                                                down. When the correct letter is high- example of this method for entering
basically the same way ever since the
## lighted, the user presses the Select text.
old arcade games asked the user to
## button on the controller and this letenter initials after receiving a high Another approach is to start with one
## ter is added. If the user makes a misscore. The most common method is letter blinking. If the user moves the
## take, he can select the Delete button
to make three or four rows of text. joystick up, the list cycles backward
## and delete one letter. Each time the
This list should include every letter of through the alphabet. If the user
## Delete button is selected, another letthe alphabet and any characters that moves the joystick down, it moves
## ter is deleted. This method is effective
can be used for input. There are also forward through the alphabet. In both
## and it can work with a very simple
two additional options: Delete and cases, the letter cycling wraps around
## controller, such as a joystick and one
Done (the Done button is only need- and continues when at the end or
## button. The problem with this
ed if the number of characters is not beginning of the alphabet. When the
           Figure 2.9 The selection indicator moves
           until it reaches the edge, and then the options
           move onto the screen
                                                                          Figure 2.10 This is the traditional solution for entering text
## on a console or arcade machine.

## 22 Chapter 2 ■ Planning Menu Flow

                                                                    up with a better text- the user selects the correct option.
## entry solution for a Drop-down menus are a common
                                                                    console game, but I solution in most PC operating sys-
## do so with caution. A tems and are very standard with
                                                                    new method can application software. There aren’t
                                                                    cause confusion and many software applications that don’t
## frustration in users. It use drop-down menus extensively.
## must be very intuitive
## While drop-down menus can be use-
## or explained really
## ful, remember that you are making a
## well. Neither of the
## game. A lot of the Windows conven-
## methods described
## tions may be very familiar to the user,
## here is simple. The
## but they aren’t much fun. In general,
## first time someone
## it is better to get away from the feel of
## uses these methods to
## the operating system and make your
Figure 2.11 This solution is also common. The advantage to enter text, he is usual-
## game feel like a game. Drop-down
this solution is that it uses much less space than the one shown ly a bit confused. in Figure 2.10.
## menus typically don’t make you feel
## These methods do,
## like you’re playing.
## however, have a huge
user moves the joystick right, another advantage: Almost everyone who’s If you determine that a drop-down letter is added. When the user moves played a game has used one of these menu is still best for your game, you the joystick left, a letter is deleted. methods and is familiar with them— can at least do some variations. These Pressing the Select button on the con- in fact, users have come to expect menus can drop to the side or “drop” troller finalizes the input and them. up. Interesting animations used for advances the menu. the transitions can also help give these These are just some of the most com- Drop-Down Menus menus a fun look. Just remember that mon solutions for allowing users to you are making a game.
## Drop-down menus are commonly
input text. There are many more that used as an input method in PC games, have been used, and I have heard but they are seldom used on a console Other Variations some solutions described that would game. Technically, a drop-down menu Not all of the methods for accepting make the entry process much faster. I is just another way to use a list of input are listed in this book. In fact, challenge interface designers to come items as input. It is just hidden until there are many still waiting to be con-

## Simplicity versus Depth 23

ceived. This is an area where vision Below is a list of some commonly ■ Title screen. The name of the and creativity can have a great impact used menu screens. Again, this is by game appears here. It can also on game design. Just be very careful no means an exhaustive list. There are include interactive options. when implementing new methods— many other screens that appear in ■ Options. An option screen if a new method makes the interface many games. Looking at this list may allows the user to change many confusing, then it is not a better solu- help you to begin to make a flow chart game settings. tion, even if it looks really cool. The for your next game. Think about ■ Credits. This is where everyone user should know what to do without which of these menus could be used
## who worked on the game is
having to think very much. Stick with in your game and what your game
## listed.
generally accepted methods most of might need that is not listed here.
## ■ Environment or level select.
the time; the user is familiar with ■ Legal screen. This can be a This is used in games where the these methods and will expect them.
                                               short sentence or a screen full user can choose a level of locaUse new and innovative methods
## of text. It will include legal tion to play.
sparingly and only when they will
                                               issues like copyright notices. ■ Player editor. A player editor
have a positive impact on the design.
## ■ Publisher logo screen. It can be
## will allow the user to change
                                               a requirement to show this the look and attributes of charCommon Menu screen before the developer acters in the game.
Screens logo. There may also be a ■ Information. This screen can
Some of the sample menus that were requirement for how long it
## have extra information, such as
charted previously were simple. A big- needs to be displayed before the
## story, maps, and so on.
budget game with a lot of options can user can move on.
## ■ Save / Load game. This screen
## ■ Developer logo screen. This is
get very complicated. Take a look at lists how many games are saved Figure 2.4. You can see that creating a where your company logo is
## and allows the user to load and
flow chart for a menu like this can be seen.
## save games.
complicated. I’ve worked on games ■ Console logo screen. Some
that had interfaces that are even more consoles require or encourage complicated than this sample. developers to display the system Simplicity versus Depth
                                               logo. After you have created a flow chart,
## it’s time to evaluate the flow of your

## 24 Chapter 2 ■ Planning Menu Flow

menu. Before you move on to creating any one screen. These two goals option such as Multiplayer that will art is a good time to make changes to sometimes conflict, and you must bal- be used often but does not fall in this the flow. It is much easier to change ance your solution. The user does not default path, how easy is it to choose your chart than to change elements want to be forced to go through a lot this option and get into the game? after art is created and is working in of screens to accomplish what he
## Make sure that the user is only forced
the game. The goal is always to make wants to do. At the same time, if too
## to back up (go back to a previous
the menu simple and easy to use. Ask many options are listed on a single
## screen) when he is adjusting options
yourself the following questions: screen, the menu can be more diffi-
## that most likely will not be accessed
     ■
## cult to negotiate. It is much easier to
       How many options appear on often. For example, music volume
## quickly understand small amounts of
       each screen? may only be set once and then left at
## information. This applies to both
     ■ Are they logically grouped? the same level every time the user
## console and PC games, but too many
     ■
## plays the game. Another option is to
       How fast can a new player get options on a console can be even
## allow the user to start a game from
       into a game? more problematic than on a PC. If
## what would be a dead end without a
     ■ How fast can an experienced there are too many options, screen
## Start Game option. This doesn’t
       player get into the game? resolution limitations can make them
## always make sense, and it will only
     ■ Which options will the player
## hard to read; it can also be tedious to
## work if there aren’t any other options
       want to adjust often? scroll through a long list of items with
## that need to be selected before begin-
## a controller. A mouse allows the user
     ■ Which options will be changed ning a game.
## to go directly to the option he is lookrarely?
## ing for. (The user will still need to
     ■ How does this menu compare
## read and comprehend all of the Planning for HUD
       with similar games? options on a PC game.) What is HUD? It is not a replacement
     ■ How many dead-ends are there?
                                         A good test to see if your interface is for a swear word. HUD is short for
       (When the user must back up Heads Up Display, which refers to the
                                         designed well is this: When a user
       to start the game.) interface that is displayed during
## begins your game and just hits the
When designing interfaces, you Enter button repeatedly, can he get game play—stuff like the radar, health should try to limit the number of into the game? How many presses will meters, and score. screens you present. You should also it take to get into a game? Which Because of the nature of the HUD, a try to limit the number of options on options will be chosen with this flow chart is not typically necessary,
## default method? If your game has an

## Creativity versus Conventional Methods 25

but organization is important. You until the game is at a stage where it to chart the flow HUD. Just because will need to know all of the informa- can be played. You will need to be the HUD is a little harder to plan does tion that will need to be displayed flexible and even look for ways to not mean it should be left until later. during game play and you will need to improve the HUD. Get all of the information you can. know any options that might need to List everything that could be possibly
## I have changed the HUD partway
be accessed in a Pause menu. You may displayed! Prioritize all of the display
## through the development process on
need to get the information from a items and determine how the user will
## most of the games I have worked on.
game designer. Get it as soon as possi- access information that is not typical-
## A great example is a change we made
ble. Many other screens may be need- ly displayed on-screen. Determine
## to the game demo on the CD of this
ed for a game. Pop-up menus may what will be automatically displayed
## book. We began by displaying a numoccur at various stages and the player and what will require a separate
## ber as a percentage for the rating of
may need access to other information menu. Identify any game events that
## the station. We later discovered that
that is not visible in the HUD while will change the HUD. Organize all of
## this number was confusing—the test
playing the game. The user may need the information to be displayed into
## users were not sure what the number
to check inventory or look at a map, logical categories, and plan as much
## meant. We changed to a five star sysfor example. Do your best to get all of as possible!
## tem. I created five empty stars and the
the information and list all of the pos-
## stars filled in as the rating increased.
sibilities that could occur during the
                                           The disadvantage is that the user did Creativity versus
entire game.
                                           not know if he was at 3.2 or 3.3 stars, Conventional Methods
Because of the nature of the HUD, no but this information could be checked matter how well you plan in the in the Goals pop-up menu. We found Most interface designers are bursting beginning, the game will change at that this was a much better solution. with creativity. They want to do least a little before you’re done. It All of the users seem to intuitively things better than has been done in changes because of the close tie with understand what three stars meant. the past. They want to discover and game-play. You will discover that the implement original ideas—this is
                                           Get our your pencil and begin to what makes the video game industry
user needs information that you did
                                           sketch your HUD early. What you fun! The passion and desire to continnot anticipate displaying. You may
                                           need to design will vary greatly from ually improve are essential.
also learn that when playing the
## game to game. It also can be a little
game, some information is not neces- When designing an interface (or
## harder to design than the front-end
sary and should be removed. Many of working on any aspect of a game),
## interface, because there are fewer ways
these problems won’t be discovered remember that thousands of creative

## 26 Chapter 2 ■ Planning Menu Flow

people have been doing the same thing for a long time. Most likely, someone else has already thought up what seems like a new idea to you. If it has never been implemented, then there might be a good reason. Be cautious when trying out new ideas—use your creativity wisely. Video-game players have also come to expect the thing they have already experienced. Take advantage of this often by using these conventional methods. Don’t give up on creativity, but don’t think that something is better just because it is different. Make sure it really is better.

## Chapter 3

The Look and Feel of
## Your Interface

                                          process. Artist and designers with a users will remember. If the functionhis chapter will discuss the
                                          passion for creativity look forward to ality of an interface is good, the user
         best way to make a coolthis stage of development. The early won’t even notice it. If you don’t enjoy
         looking interface. I will disconcept stage is the fun part of the designing the look of a game, you may
T cuss how to decide what the interface should look like and will give you
                                          process. The hard work comes at the not be cut out for interface design.
## end of a project, after you have been
some hints on how to find inspira-
## working for months and you are told, Create a Mock-Up
tion. I will also explain thumbnail
## for instance, to change the highlight
sketches and what is a good use of The best way to define a distinctive
## color for the entire interface for the
photographs and illustrations. The look for your game is to create sample
## fourth time.
use of real-time 3D in an interface art, or a mock-up of the interface. The will also be covered. When working on the look and feel of goal of creating this sample art is not
                                          a game, have fun and take the oppor- to have a final product but to define
                                          tunity to be creative. This is a great and visualize the look and feel of the
Define a Look place to experiment and to come up entire interface. Don’t worry about Defining the look and feel of an inter- with something totally unique. The having the right options listed. It is face is the fun part of the design look of the design is what the end more important to show what your
28 Chapter 3 ■ The Look and Feel of Your Interface
buttons will look like than it is to get feel of the sample art. The entire might want to include in the mock-up the right button. By creating art that interface should look and feel just like phase. You don’t need every detail to looks like a real interface, you make it this sample art. It will be much faster establish your interface style. Often, easy for anyone who needs to review to design the rest of the interface once the best screen to mock-up is the title and approve your design. It does not you have set the look and feel. Much screen. Legal screens, company logo require a lot of imagination or guess- less experimentation is needed once screens, and even the opening cinework on the part of the producer or you’ve found the style for your inter- matic sequence may appear before art director to get the idea if they can face. Figure 3.1 shows an example of a this title screen in the final game, but simply see it. mock-up. typically the title screen is the first in
## which options appear for the user.
A mock-up can guide your design A mock-up of a single screen of the
## There are some games that have a septhroughout the process. Once your interface and just a few more pieces of
## arate title screen from the main menu,
mock-up has been created, reviewed, art, such as some important buttons
## but it is usually the first screen with
and approved, a standard has been from other screens, is all you need to
## active buttons, and it will often conset. The rest of the interface can be define a look. Figure 3.2 shows a cou-
## tain the game logo, as well. Because it
designed to fit in with the look and ple of these extra elements that you

## Figure 3.2 Creating a few more interface elements helps to
## better establish the look of the interface.

Figure 3.1 The mock-up of the title screen defines the colors and style of the entire interface.

## Define a Look 29

contains so many important ele- match the cool, new ments, the title screen is ideal to use as logo. Even if the new a mock-up screen. logo is cool looking, if
## it doesn’t mach the
Working with Logos rest of the interface,
## it can mean you’ll
Working with publishers and their
## have to spend weeks
game logos can be tricky business.
## reworking the art.
The game publisher often provides
## Figure 3.3 shows how
the logo, and it is important to get this
## a logo can be out of
logo as early as you can. Too often, the
## place if the interface
publisher waits until near the end of
## was not designed
the project to even decide on the
## around the look of
name of the game, much less the
## the logo.
design logo.
                                                                        Figure 3.3 The colors in this logo don’t go well with the rest
If the publisher is dragging its feet on Define a Color of the interface. coming up with a logo, create a tem- Scheme porary logo that captures the feel that
                                             Color is a very important part of an When creating a color chart, make
will be used in the final logo. This may
                                             interface. What color is your game? sure it feels like you want your game
not be easy to guess, but it is better to
                                             This is a good question to answer to feel. If you are working on a game
have some reference, however flawed,
                                             early. Anyone who looks at your inter- for young children, for example, then
than to have no reference.
                                             face should be able to see at a glance bright, saturated colors may be
Try to establish the look of the logo the color scheme of the entire game. appropriate. The colors would probaearly, even if the name must change Keeping the colors consistent bly be very different for a game based later. Communicate with the publish- throughout the game creates a unified on a horror story. In such a game, the er and make sure they agree with the look. Everything from the box cover colors should look like they belong in direction you’re taking. It is always a to the in-game interface should reflect a horror movie—a lot of black with pain when, say, the game has a black- this color scheme and help define orange or green accents may be a and-orange interface and the publish- your game. Too many dramatic good choice for such a scary game. er brings you a green and purple logo changes in color from screen to screen Take a look at Figure 3.4 and compare at the end of the project and asks you will make the game feel inconsistent. the two color charts to see how a feel to change the entire interface to can be created using only color.
30 Chapter 3 ■ The Look and Feel of Your Interface
                                             then adjust the image to match your Take a look at the color chart in
                                             color scheme. This way, you have Figure 3.5 and see how the yellow
                                             made the color choice independent of color is much smaller than the green
                                             the colors in an image. tones. Now look at the final interface
## screen in Figure 3.6 and see how the
## A good way to separate the color
## color is balanced similarly to the color
## choice from all of the other decisions
## chart.
## is to make a color chart. Create a file
## that is made up of the colors you will
## use in the interface. This color chart
Figure 3.4 Just by looking at these two should not only contain the colors different color schemes, you can tell what you will use in the design, but it kind of games they might be used for. should also have the correct propor-
## tions of each of the colors. It should
The subject matter of the game can roughly represent the amount of each Figure 3.5 This color chart establishes often direct the color choice. If you color you will use in the actual inter- the colors of an interface. are working on a game that takes face. If an accent place in a jungle, green is probably the color is used in the wise color choice. If you are working design, it should only on a game with demons and gar- take up a small goyles, then red and black may be a amount of space on logical choice. Your colors should feel the color chart. This like they fit with the subject matter. way, the colors in Images sometimes actually get in the your chart will feel way of making a color choice. If you like the final interhave an illustration or photo of a face. Make sure to cool-looking red car, you may be refer to this chart influenced to choose red as one of the when working on the colors for your interface, even if red interface, so that you isn’t the best color choice. It is better don’t lose the color to make the color choice first and balance you’ve established. Figure 3.6 Compare the color chart with this final interface.

## Express Yourself in the Design 31

Express Yourself in styles, colors, cars, and kitchen appli- plants, cloth patterns, or anything
                                              ances that were used in the 1950s. that imparts the feel you’re striving
the Design Choose some of the elements that for. Go for it! Make your design unique. capture the feeling you are looking This is your chance to really express Take a look at Figure 3.7 to see how a
## for. A button on a radio or the grill of
your creativity. The best interface design is less effective if a theme is
## a car may inspire the shape, color, and
designs push the feel of the game. If only partially implemented. Then
## design of your interface. If the game
you decide to design an interface with take a look at Figure 3.8 and see how
## takes place in ancient Japan and you
a retro, 1950s-America feel, then this same theme produces a much
## decide to design the interface with a
make sure that all of the elements fit more interesting design when it is
## classic Japanese feel, then go all the
together. Don’t just design a standard pushed further. Choose an art direc-
## way. Look at ancient Japanese art and
interface that has a few elements that tion and go with it—don’t get caught
## calligraphy. Choose a font that looks
fit the 1950s theme—make it really with just an average design.
## Asian or like calligraphy. Use colors,
## feel like the 1950s. Look at clothing

Figure 3.7 There may be nothing wrong with this interface, Figure 3.8 This menu takes advantage of the interesting but it could be more interesting. images offered by the subject matter of the game.
32 Chapter 3 ■ The Look and Feel of Your Interface
Research and Inspiration Coming up with ideas for your design is not always easy. It’s not uncommon to hit a creative roadblock when designing an interface. When you feel like you can’t come up with any good ideas, there are a couple of techniques that you can use to help inspire yourself. Don’t let a slump hold you back for long!
Make Lists A common and very effective brainstorming method is to create lists. Sit down and just start writing. Write down good ideas and even ideas that may not seem so good at the Figure 3.9 These are lists that were created for a children’s game about a family of moment—just let them flow. Create monsters that live in the jungle. several lists. List objects associated with the game. List emotions associat- the beginnings of a brainstorming Search for Images ed with the game. List actions associ- list. Another great creativity-inspiring ated with the game. Create as many
## technique is searching the Internet
categories as you can. Combine differ- Tip
## for cool, interesting, or thoughtent words and phrases from different Some of the most creative ideas come provoking images. You can go on a
lists and see what you can come up from mixing words from two very dif-
## virtual field trip anywhere in world
with. You may come up with some ferent lists that, at first, may not seem
## to work together. Don’t be afraid to
## and see what things—buildings,
unexpected solutions using this techexperiment. See if you can come up clothing, flora, fauna, and so on— nique. Figure 3.9 shows an example of
                                                with something really interesting. look like. If you are unfamiliar with
## the subject, you can quickly find

## Thumbnails 33

visuals to help you approximate the any photos if you don’t have the copy- sketchbook in my hand, ready to caplook you’re going for in your design. right on them. If you really need a ture any inspiring image I see. When creating an interface for a specific photo, you may be able to
## Check out your competition. Find out
Formula One racing game, for exam- purchase the rights to use it. Stock
## what they came up with when conple, you could search the Internet for photography vendors will be happy to
## fronted with a similar design chalphotographs of the cars, the crowds, help you out.
## lenge. See what you’re competing
the tracks, and the drivers. You may
                                                 You can find inspiration in other against and learn if any unique and
find images of elements you wouldn’t
                                                 places, as well. Art galleries, libraries, interesting design solutions have
have thought of without looking at
                                                 and the theater can all be places where appeared in other games. Understand
photos. Skid marks on the track, dentyou can find inspiration. Constantly what users have come to expect of ed railing along the track, and helmets
                                                 keep your eyes open. On my drive games in the genre you’re working in.
worn by the drivers may all provide
## into the office, I pass several old factoinspiration and direction—and you Avoid any urge to copy the design of
## ries with rusted metal walls, steel, and
may not have thought of them if you other games, though. It’s easy to make
## rivets. I think of how many great
hadn’t searched for images online. a game that looks only slightly differ-
## images and textures that can be found
## ent to a competing game. Playing a
Tip in these old, beat-up buildings. I often
## game like this won’t be very enjoyable
## carry a digital camera so that I can
      The Web site http://www.google.com or impressive for users. Make your
## stop and take a picture of anything
      offers a great way to search for images. design original. Don’t sell your own
      Click on the Images heading and enter visually arresting I come across dur-
## abilities short—even if a competitor
      any subject to find images on the Inter- ing the day.
## has a great interface design, their
      net. You may want to have some sort of Another place I find a lot of inspira- design doesn’t represent the only
      filtering turned on—you never know
                                                 tion is at the movies. There are so great solution available.
      what you may see!
## many visually stunning movies. For
## example, if I am working on a game
An amazingly large amount of infor- that takes place in ancient Egypt, I will
## Thumbnails
mation and photos can be found on rent (or go see, if there is anything Thumbnails are very small sketches. the Internet. Be very careful not to out) a great movie that shows archi- They are often only an inch or two violate any copyright laws, though. tecture and art from Egypt. Animated wide. They are used to quickly run Use the photos and images you find movies are also great for inspiration. I through a bunch of concepts. These for inspiration, but don’t actually use have watched many movies with a little sketches can be very useful when
34 Chapter 3 ■ The Look and Feel of Your Interface
designing an interface. When I skip unnecessary detail will slow you down use to print borders for thumbnail thumbnails and go straight to work- and can distract you from finishing sketches. Figure 13.10 shows a page ing on a full size image, most of the the basic layout. full of thumbnails sketches. time I end up getting stuck and hav-
## Make your thumbnails quickly and
ing to go back and create the thumb- Push for Variation
## keep them rough. They should be
nails after all.
                                          used for internal direction and should It is a good idea to push yourself to
It is easy to get too excited about an not be shown to a publisher until they create more thumbnails than you’re interface and either skip or spend too have been cleaned up. Spending extra initially inclined to make. You will little time on the thumbnail sketch time creating tight thumbnails can be often be more creative the further you stage. Be patient, and make a lot of a waste. Even without the details, it is go into the thumbnail process. At thumbnails. Thumbnails are easy and amazing how much information you first, you may tend to create thumbfast to make, and they can allow you can convey in a small thumbnail. The nails that look similar to other interto try out literally hundreds of ideas best way to make thumbnails is the faces you have created. Once you have quickly. If you dig right in and start old fashioned way—with a pencil and run through your standard set of creating full-size color layouts before paper. It is hard to match the speed of ideas, you will be forced to come up you make thumbnails, you’ll only be using a pencil for thumbnail sketches. with more creative ideas. Don’t stop able to try a limited number of Speed is the key with thumbnail when it starts to become difficult to approaches. Take advantage of the sketches. You want to try a lot of ideas come up with another idea. This is ease of creating thumbnails and create quickly. often the point when new ideas a lot of them. appear. When you get stuck, you can
## Some artists struggle to maintain a
                                          small scale and to get the screen pro- create variations on each design. It is
Work Quickly portions correct. The best way to also a good idea to create many comsolve this problem is to print out a pletely new layouts. Keep your thumbnail designs small and simple. As the name implies, page of small, blank boxes that are the Although it’s good practice to create a thumbnails are typically small, and correct size and proportions. These lot of thumbnails, it’s often a mistake they do not contain much detail; they boxes can then be used as borders for to present hundreds of ideas to the are simply meant to help you arrange hand-drawn thumbnails. I have publisher for approval. The publisher the basic layout. If they are drawn too included a digital file on the CD may legally own all of the art created large, you may be tempted to add too included with this book that you can in association with the game, but they much unnecessary detail. Such seldom require that you show them

## Using Photographs 35

## Creativity versus
## Standards
## Creativity is essential, but make sure
## that you use it in the right place. You
## must balance new and original ideas
## with standard approaches. Gamers
## have come to expect certain stan-
## dards, and in many cases, it is better if
## they don’t have to think too much
## about a new approach. Just because
## you think it will be cool to, say, have
## the “highlighted” button grow dark
## instead of light up does not mean it is
## necessarily a good idea; it may con-
## fuse the user and take him longer to
## understand which button is selected.
## This does not mean that darkening
## the selected button will never work.
## You just need to consider what the
## user is expecting to see and under-
## stand that if your menu does someFigure 3.10 Keep thumbnail sketches small and simple.
## thing different, then it may make it
## harder for the user to navigate.
every scribble and sketch. Not only scribbling to the magic beneath. As I does it take longer for the publisher to said before, most thumbnails should sort through a large number of only be used internally; if a publisher Using Photographs thumbnails, but inevitably the pub- requests to see thumbnails, it is a good Photographs can be very useful and lisher will choose the one you like the idea to clean up and present one or cool-looking in your interface, but least. Not everyone has the ability to two sketches. Choose the thumbnails they must be used correctly or they envision a finished product from a that you have already determined to will hurt your design. In some cases, thumbnail. Don’t run the risk that a be the best solutions. using photos may be the very best publisher can’t see past your pencil solution or even a requirement. If you
36 Chapter 3 ■ The Look and Feel of Your Interface
are making a game that uses the name If your budget is tight, of course, you no need to spend money on a profesof the latest sports star, you may need may need to use photos instead of sional photographer or purchase to include a photo of the athlete on illustrations. You need to be aware stock photography. Many designers the box and in the interface. A game that this may be a weak point in your think, “I can take a picture of my own with a movie license may also require interface if you don’t take the extra football and get it just the way I want a photo of the star. In many other time to use the photos well. Making it.” But in reality, the shot they end up instances, photos can be a crutch and your own collage of several photos, with is not nearly as good as a profescan make a very bad or uninteresting using filters and effects, and making sional photographer could do. Photos interface. Photos should only be used other adjustments to these photos can you have taken yourself are great for when they are the logical solution, really help. Do your best to choose reference, but they must be high qualand not just because it’s easier to use a your photos wisely. I have seen some ity if you want to use them in your photo than an illustration or to create instances wherein an interface design- interface. Figure 3.11 is a photo that I your own background. It is very obvi- er used photos and it resulted in a took that is a little washed out. It is ous when an interface designer uses a quality interface, but these instances not a high-quality photo. bunch of stock photographs that have are rare. not been properly touched up just to
## If you use phosave time. It just looks bad.
## tographs in your
I have a personal preference for using design, make sure illustrations over photos. I usually they are of good qualavoid photos in an interface. Other ity. A digital camera than when you need to show a like- can be incredibly useness of a famous person, I suggest ful when making always using an illustration. It will games. The problem take more time and require more that comes along skill, but I think that a quality illustra- with using digital tion has the potential to look much cameras, however, is better than a photo. You will find that that they are so easy only a small percentage of the big, to use that everyone triple-A games use photos in the thinks that he or she interface. Photos rarely fit well with is a great photogra-
## Figure 3.11 Digital photos that are not taken by a
the art in the game. pher and that there is professional can hurt an interface design.

## Illustrations 37

Don’t be afraid to take digital photos, just understand your limits. There are many, many uses for photos. For example, they can serve as great references, as they capture details that you might not be able to remember without them. They can also provide a great start for textures. They can be used the same way the Internet can be used for research. Photos that are to be used in your game can be touched up and edited. It’s hard to fix a bad photo, but it’s easy to improve a good photo. Whether you took the photos or they were taken by a professional photographer, there are many techniques that can be used to make the photo more interesting. Simple adjustments include changing the image levels and saturation. You can also try tech- Figure 3.12 An average photo has been adjusted in several different way to help enhance niques like colorizing the photos or the photo and make it more suitable for use in an interface. adding other filters. If you plan on using photos often, learn as many to use. For example, while a sports techniques as you can to get the most
## Illustrations
## game may be a great place to use a
out of your photos. Figure 3.12 shows In place of a photograph, you might
## photograph of all the players, an illusa photo that has been touched up want to consider using an illustration.
## tration may be much better solution
using several different methods. This approach can really improve the
## for a fantasy game. The style of illus-
## look of an interface. The subject mat-
## trations used in an interface can help
## ter of your game can determine which
## define the look and feel of a game. Are

38 Chapter 3 ■ The Look and Feel of Your Interface
the illustrations stylized or realistic, illustration style does not fit the game Pre-Rendered 2D Art detailed or simple, colorful or de- does not make you a bad illustrator. One way to get the look of a 3D intersaturated? As with photographs, poor Don’t force your illustration or illus- face without all of the hassle is to use illustrations will hurt a design, but tration style into a design if it doesn’t pre-rendered 3D instead of real-time great illustrations can improve an work just because you want the design 3D. This option does not offer all of interface significantly. to be “all yours.” Figure 3.13 shows a the advantages of a real-time 3D
                                                  sample of an illustration that would interface, but it certainly simplifies
If you are confident in your skills as
                                                  be hard to beat with a photograph. things. A pre-rendered 3D interface
an illustrator, then you should do your own illustrations. If you can’t actually is just a 2D interface in which produce top-notch illustrations in the 3D Solutions the 2D artwork is created using a 3D style that would best fit your interface, program. This approach doesn’t allow
## 3D interfaces can be very compelling,
get an illustrator with the style you for camera movement, but small
## and the idea of creating a 3D interface
need for your game. Just because your objects can be animated and rendered
## seems really cool. 3D interfaces can
## in a 3D package and these frames can
## also be very expensive
## be played back. These animations typ-
## and time-consuming,
## ically need to be small because of
## though. Make sure to
## memory limitations, but they can also
## schedule plenty of
## look really cool.
## time and prepare for
                                                                   the extra work that a I used this technique when making a
                                                                   3D interface will Tiger Woods golf game for the N64.
                                                                   demand. It will This game had an arcade feel, and we
                                                                   always take longer wanted to have a cool effect when the
                                                                   than you think, and ball was hit perfectly. We wanted the
                                                                   you will run into 3D ball to morph and warp while in
                                                                   more unanticipated flight. The game engine would not
                                                                   problems than you have been able to handle the polygons
                                                                   would in creating a needed to make this kind of anima2D interface. tion in 3D. We instead rendered really
Figure 3.13 Using an illustration instead of a photo here cool animations and placed these 2D allowed for brighter colors. This image would have been difficult rendered animations over the ball to photograph. when the effect happened.

## 3D Solutions 39

This same effect can be used in the biggest benefit. For example, many will not be able to see the 3D model interface. You can use a 3D model to games offer a player editor wherein until everything works in the game render a spinning animation of a but- the user can make changes to the engine. ton. These rendered frames can then character in the game. Many options, be played back in the menu. It appears including clothes, hair, skin color, and 3D Challenges to be 3D even thought it is pre-ren- even tattoos can be adjusted in these
## Making big changes to a 3D interface
dered. editors. Player editors often use the
## can be more difficult than making
## same models and textures that are
## changes to a 2D interface. It can take a
Involve the Programmers used in the game. This way, the user
## long time to build geometry and cre-
## can make adjustments and see the
Programmers should be involved ate textures for a 3D interface, and if
## results instantly. In this combined
from the beginning when you’re con- you make too many changes you can
## approach, the 3D model is drawn on
sidering an interface that involves waste a lot of precious time. Because
## top of a 2D interface.
real-time 3D. Real-time 3D involves a each piece of art takes longer to crelot of technology, and the game Cars in a racing game are an example ate, changing or replacing this art is engine must support all of the fea- of a common use of a 3D model on also more time-consuming. Spend a tures that you plan to put in the inter- top of a 2D background. The user can fair amount of time planning and face. Good communication, tools, often see the 3D model of the car he is designing before building a 3D model and patience are even more important choosing, right in the interface. One for an interface—and make sure you when creating a real-time 3D inter- way to take advantage of 3D models have solid concept designs. face than when creating a 2D inter- that are used in an interface is to ani-
## This book covers many design princiface. mate them or spin them around. This
## ples. Principles like color balance, and
## kind of movement would be very dif-
## eye movement should not be discardCombining 3D and 2D ficult with a 2D-only menu but it is
## ed because your interface is done in
## simple when using a 3D model.
A common approach nowadays is to 3D. All of the same principles apply to use real-time 3D in just a small part of This can be a challenge when creating 3D menus, just as they do to a 2D the interface. 3D models are used in the 2D section of these menus. You menu. Don’t ignore any design prinimportant areas where they are most will often need to guess at what the ciples just because you are using 3D. effective. The trick is to determine menu will look like after the 3D where 3D models can provide the model has been incorporated. You
40 Chapter 3 ■ The Look and Feel of Your Interface
Even though the source of the image Don’t Get Too design will turn out if you’re not on the screen may be a real-time 3D afraid to make dramatic changes. model, the end result is a 2D image on
## Attached to Your Ideas
                                             A big mistake that many designers In a game I worked on, we created an
a computer or TV screen. This final
                                             often make is to get too attached to an interface splash screen early in the
image should be designed to take into
                                             idea early in the design process—they process. It had a look and feel that we
account all the design principles for
                                             latch on to an idea that sounds felt was appropriate for the game—a
2D art.
                                             appealing and then try to create the bright color scheme and a little bit of
One of the big advantages of a com- rest of the design around this ele- a retro feel to it. Our goal was to repletely real-time 3D interface is the ment. It can be hard to do, but if an create the look of an old scienceability to move the camera. Take idea doesn’t work well, you may need fiction movie. The game was goofy advantage of this ability but do not to scrap it. and fun. Both the game and the interabuse it. Too much movement can face were created with the intention of disorient the user. If the camera For example, while working on a rac- appealing to a wide audience and not movement is too slow and takes too ing game, a designer may decide that just to hard-core gamers. long, it can cause annoying delays in using tires for buttons sounds really
                                             cool. But the black tires may stick out The problem came when we showed
the game-play. Camera movement
                                             and not look good with the blue and the game to publishers and friends.
can be a benefit, but it can also be a
                                             yellow colors (which must be used They immediately thought that it was
challenge. As soon as you begin movbecause they are the colors of the a game aimed at really young chiling the camera, you will need to spend
                                             sponsors) in the interface. The round dren. The game was a little too coma lot of time trying to get it just right.
                                             shape of the button may not fit in well plex for really young players, and we
Making these camera changes can
                                             with the rest of the design, either. did not want to scare off teenagers or
take a lot of time.
                                             Rather than use a different image for adults, so we decided to scrap this
Creating 3D interfaces can be a com- the buttons, though, the designer interface and make adjustments that plex task. Experience is the best wastes a lot of time changing every- made it feel a little more sophisticatteacher. A good understanding of how thing else to match the tires. ed. The new interface still has the 3D works in other aspects of the game goofy cartoon characters, but because is a must when using 3D in an inter- If any element of the design is causing of the desaturated colors, it has a face. I have seen some incredible- problems, just grit your teeth and slightly more grown-up feel. Figure looking interfaces that use 3D. If you throw it out. When something is bro- 3.14 shows the old design that was have the time and the budget, these ken, don’t be afraid to fix it. You will drastically changed before release. 3D interfaces can be very cool. be surprised how much better a

## Summary 41

Figure 3.14 This interface design appeared to be a little too Figure 3.15 A slightly more mature interface replaced the young for the target audience. previous design.
Summary ing. Armed with the techniques dis-
## cussed in this chapter and your perThe best interfaces have a very dis-
## sonal creativity, you can create the
tinctive style. They capture the appro-
## best interface ever conceived by man.
priate feel for the game. Great interfaces have a unique look and feel. These interfaces do not happen by accident. They are often a result of a lot of hard work. Good research and a lot of thumbnail sketches can really help you in this creative process. If you get stuck, do some brainstorm-

## This page intentionally left blank

## Chapter 4

## Basic Design Principles

                                           interfaces. The best interface design- the shapes and colors created by the
          othing will improve your
                                           ers apply these principles every day. car in the composition. It is easy to get
          design skills better than an
## lost in the illustration or photo of the
          understanding of basic
## car and not see how it works as a
N design principles. Many interface designers learn these principles in col-
## Getting Back to Basics design element.
## I graduated from the design departlege or a specialized art school but ment of a large university. In my first As you create your design game interthey forget them later—it is easy to go year of college, I didn’t get to design face, try to look past any images of
out and find a job in the industry, anything “real.” All of my early assign- concrete objects, such as a ball, gun, start working on real games, and just ments focused on abstract shapes and or zombie, and look at the pure get sort of rusty on design basics. color because understanding how to design. What shapes and colors are in Ignoring or forgetting basic design design with abstract images will help your design, and how pleasing—or principles will adversely affect your you design anything better. Images of not—are they? If the images and text design ability. Once you have learned real objects can actually get in the way in your design were changed to basic design principles, keep using of seeing the real design. If you are abstract shapes and colors, would the them to evaluate and improve your looking at a racecar, it is harder to see design still have the right feel? Treat
44 Chapter 4 ■ Basic Design Principles
images and text in your interface as design elements. Be aware of their shape and color, and place them thoughtfully. Figure 4.1 demonstrates how you can look at all of the text and images in a design as shapes. This will help you better see the design and not be distracted by the basketball.
Really See Your Design
                                             Figure 4.1 This design is easier to evaluate when you look at text and images as shapes.
Looking past the images and focusing on the pure design may sound simple enough, but it is often difficult to do. zontally. Shrink it down so it is really express emotion and set an atmosIt is especially difficult for the design- small or look at the image from across phere. Colors are often linked to emoer who has spent hours composing a the room. This will help you to ignore tions—you’ve heard the phrases “feeldesign. Because of this, it is always the details and look at the overall ing blue” or “green with envy.” You easier to evaluate a design done by design—these details can be hard to can probably picture what these colsomeone else. I have had the experi- ignore if you have spent a lot of time ors look like. The blue color is not ence of not being able to evaluate my adjusting them. You want to make very bright and saturated. It would own design until it was being your viewing experience closer to that most likely be a very gray-blue color. reviewed by the art director. As soon of a first-time viewer. It is surprising Gray, cloudy skies have a sad feeling as I saw my design on his computer how problem areas will jump out at associated with them. A design that screen, I could see flaws that I didn’t you when you use one of these meth- uses a lot of neutral gray and very desee on my computer monitor. ods to get a fresh look at your design. saturated colors can also have the
## same sad feeling. On the other hand,
Try to get a fresh look on a design that
                                             Using Color bright yellows and blues feel very
you have been working on for a long
## cheerful. What colors do you associate
time by squinting your eyes and mak- Color can be a very powerful design
## with a birthday party?
ing everything blurry, or by turning tool. Never underestimate the ability an image upside down. Flip it hori- of color to set a mood. Color can

## Getting Back to Basics 45

In order to harness the power of color, Creating Color Harmony Finding Complementary you need to have an understanding of One of the major challenges when Colors how color works. Color is a complex working with color is finding a set of It is easy for someone without a subject and there is much more to colors that work well together. When strong art background to confuse learn about it than I can possibly colors look good together, the effect is color terms. Harmonious colors are cover in this book. I will briefly dis- often referred to as color harmony. colors that look good together. This cuss a few of the important concepts This subject has been studied for a can include colors that are similar to in the next sections, though. long time and there are many interest- one another. For example, a range of Johannes Itten published a book ing facts that have been discovered. If blue colors can look good together. about color theory in Germany in you understand the basic concepts of The term harmonious colors also 1961; check it out if you want to learn color harmony, it is easy to find colors includes a set of colors referred to as more about color. It is a very compre- that go well together. complementary colors. These are a spehensive and scientific approach to cial sub-set of harmonious colors.
## Color harmony can be defined in a
color and has been translated into way that is very scientific and much If you need to use two colors that many languages. The English version less subjective than you may expect. work well together, complementary of the original book, The Art of Color, There are scientific reasons that cer- colors are always a good choice. is not light reading, but there is a con- tain colors work well together. Color Complementary colors are the two densed version, called Itten, The theory has been studies in depth by colors opposite each other on the Elements of Color – A Treatise On The many people. Johannes Itten, whom I color wheel. Pick any color and draw Color System Of Johannes Itten Based mentioned in the last section, is a a line to the exact opposite side on the On His Book The Art Of Color. This great example of someone who has color wheel to find the complemenbook contains just about everything devoted his life to the study of color. tary color. (See Figure 4.2.) It is helpyou would want to know about color He is considered by many people to be ful to know the complementary color theory. Of course, every good library the greatest authority on color in of all of the primary and secondary or book store carries other books on modern times. He and many others colors, as you may not always have a color and color theory. Pick up a few have discovered that color harmony color wheel handy. of these to become an expert at wield- can be explained scientifically—color ing color effectively in any situation. harmony is not just based on person-
## al color preference.

46 Chapter 4 ■ Basic Design Principles

## further away from neutral gray, the
## tougher time the human eye has see-
## ing the color clearly. Think of how
## you would feel in a room with every
## wall painted a bright yellow. If the
## color is too strong, it can be hard to
## look at. Your eye (actually your brain,
## of course) reacts to colors by trying to
## adjust what it sees. Your eyes always
## try to shift colors as close as possible
## to this neutral gray.
## In the room full of bright yellow
## walls, you could help out confused
## eyes by adding the complementary
## color. Adding a lot of purple can help
## counterbalance the bright yellow. A
## strong purple color would help your
## eyes better adjust to the yellow color.
## This counterbalancing effect is one of
## the reasons that complementary col-
## ors work well together. Yellow and
## purple may not be the best set of colFigure 4.2 Complementary colors are found directly opposite each other on the color wheel. ors for interior decorating, but they
## might look good on a box of laundry
## detergent. Very saturated compleWhen you use very saturated comple- There is a reason that complementary mentary colors are very lively and
mentary colors together, they not only colors are pleasing to the eye when may be too powerful for every situago well together but they impart a they are used together: If you mix two tion. However a soft yellow and a very lively feel to your design. If you are complementary colors together, the calm purple might work well as an looking for a less lively color scheme, result is a neutral gray color. This neu- interior color scheme. you can use less saturated versions of tral gray color is easy on the eye. The these complementary colors.

## Getting Back to Basics 47

Afterimages are no longer looking at a block of were mixed, they would create the Stare at the box of color in Figure 4.3 color. The afterimage reveals a little gray color that your eye is striving for about 15 seconds, and then close about what your eyes are doing while for—your eyes don’t have to work as your eyes tightly. For a couple of sec- you are looking the block of color— hard to do the counterbalancing. It is onds after you close your eyes, you attempting to counteract the color in probably no surprise that a neutral should see a box in the complemen- the square. gray square does not produce any tary color; this image is referred to as afterimage.
## What you will see in the afterimage of
an afterimage. Your eyes have not had a red square is a green square. The a chance to adjust to the fact that you afterimage of a blue square is orange. Using More Than Two Colors
                                                               Your eyes are trying to The same concept of finding colors
                                                               counterbalance the that are pleasing to the eye can be
                                                               color you’re staring at, applied to a color scheme with more
                                                               and so when you close than two colors. If you need three colyour eyes, you’ll always ors that work well together, you can
                                                               “see” the complemen- use a color wheel and either an isoscetary color. If you are les or equilateral triangle to find
                                                               looking at a black them. (See Figure 4.4.) By drawing a
                                                               square, then the after- triangle inside the color wheel, you
                                                               image will be white, can find a set of colors that work well
                                                               and if you are looking together by using the colors at each of
                                                               at a white square, the the three angles in the triangle. You
                                                               afterimage will be can also find four colors that go well
                                                               black. together by drawing a square or rec-
## Complementary col- tangle in the middle of the color
                                                                ors look good together wheel. The principle is that when you
                                                                because they are natu- mix all of the colors in any one of
                                                                rally counterbalancing these color sets together they create a
                                                                one another. If these neutral gray color. (See Figure 4.5.)
## complementary colors
Figure 4.3 Stare at this color, close your eyes, and see what color the afterimage is.
48 Chapter 4 ■ Basic Design Principles
Figure 4.4 Using either type of triangle, you can find three colors Figure 4.5 Using a rectangle or square, you can find four colors that will mix to a neutral gray. Spin the triangles to see all of the that will mix to a neutral gray. Spin the square or rectangle to see all possible color combinations. of the possible color combination
Subjective Color preference, but it is interesting to that include black. (Obviously, this is Each person has his or her own per- learn the results of research done in not universal, and undoubtedly other sonal color preference. This can have this area. Some studies indicate that factors apply to color preference.) a big effect on the colors that you find color preferences have a slight tenden- These results would suggest that color pleasing. You may assume that color cy to correlate with eye and hair preference is, at least partially, tied to preferences are a manifestation of color—blondes with blue eyes have a the function of the eye. Blue-eyed one’s individuality, but this may not slight tendency to prefer very pure blonds have different pigmentation in be entirely true. Past experiences and colors and brunettes with dark eyes the eye and possibly see color differpersonality do play a role in color tend to prefer color combinations ently than brunettes with dark-col-
## ored eyes.

## Getting Back to Basics 49

Balancing Color Strength You should consider the balance and being warm or cold. Yellow, red and Some colors have more visual strength of each of the colors in your orange are said to be warm colors. strength than others. For instance, design. An exact balance between col- Colors like purple, blue, and green are colors like yellow, red, and orange ors is seldom the goal, but you must said to be cool colors. Images that use have more visual strength than the be aware that even small amounts of a these colors effectively can actually colors on the opposite side of the very strong color can have a big make the viewer perceive different color wheel. When two colors of impact on your design. Figures 4.6 temperatures in an illustration. Along unequal visual strength are used in and 4.7 demonstrate how colors can with temperatures, emotions tend to physically equal amounts—that is, differ in visual strength. be associated with these colors. Warm half and half—the stronger color will colors are perceived as happy, cheerappear to take over and will attract Warm and Cold Colors ful, and loud, while cool colors are more attention than the other color. more calm and quiet.
## Color “temperature” can be used to
The saturation level of a color has a create a mood in your design. Certain If your game takes place at night, or in big effect on the visual strength of a colors seem to have visual tempera- the middle of Winter, blues and purcolor. A pure blue, for example, is ture, and they are often referred to as ples may be appropriate for the intermuch stronger than a gray-blue. face. These colors will help the users
## feel more like they are in the game
## world. Not only are these colors good
## for the interface, but also blue lighting
## can make a scene look cold. If your
## game takes place at midday on a trop-
## ical island, on the other hand, yellow
## and oranges can help set the mood.
## The lighting in a hot scene should also
## be bright and warm. Figures 4.8 and
## 4.9 demonstrate color temperature.
Figure 4.6 The yellow and purple cover Figure 4.7 The yellow and purple don’t an equal amount of space, but the yellow cover an equal amount of space. There is overpowers the purple. now less yellow, but the design is much
## closer to balancing visually.

## 50 Chapter 4 ■ Basic Design Principles

Figure 4.8 These blue colors have a cool temperature and feel Figure 4.9 These orange colors are much warmer and feel very calm. cheerful.
Color on a Monitor or TV Working with colors that are pro- Technically speaking, when you’re Color on a computer monitor or a TV duced with light is very different from working with paint, light still creates is created by three colors of light. Red, working with paint. When working color. The difference is that you are green, and blue lights are projected with light, the more light you add, the not adjusting the light; you’re adjustonto your screen and combinations of closer the color is to white; the less ing the material that reflects the light. these three colors produce all of the light you add, the closer to black. A When a white light hits colored paint, colors you see on your monitor. All pure white color occurs when all col- some of the light rays are absorbed by three colors at their full intensity pro- ors of light are present, and black is the paint and others are reflected back duce a pure white. The absence of all the result of the absence of light. This to the eye. The color you see is the three colors produces black. is why RGB values work the way they color of the light rays that are reflectdo. I’ll discuss RGB colors in more ed back to your eye.
## detail next.

## Getting Back to Basics 51

Creating Digital Colors RGB system comes in understanding how When creating colors digitally, there RGB stands for red, green and blue. to adjust the values to get the color are several color systems you can use. The RGB system allows you to adjust you want. It is often counter-intuitive Various software packages allow you the values for each color from 0 to to adjust the RGB values because they to make these color adjustments in 255. Televisions and computer moni- function like light. Unlike with paint different ways. The most common tors use the red, green, and blue lights, and ink, adding more color makes the color systems include RGB, CMYK, just like the RGB system. Because tele- color brighter and less color makes and HSB, but several other color sys- visions and monitors are using light, the color darker. Figure 4.11 shows tems, such as PANTONE, do exist. they can produce a much broader how RGB values can be adjusted in These other systems are used mainly range of color than can be produced Adobe Photoshop. in printing, and there is little need to in the printing process. Because inks use them in designing game inter- are not capable of reflecting every faces. Figure 4.10 is Adobe color back to the eye, they are limited Photoshop’s Color Picker. You can as to the amount of colors they can choose any of these methods to produce. This is great for game develchoose a color. opers—they can take advantage of the
## broader range of values that
## can be produced with light.
## This wide range of colors
## you get with RGB is not
## found in the CMYK system,
## and it is the advantage of
                                                       using the RGB color system Figure 4.11 Adobe Photoshop users can
                                                       to define digital colors. The adjust colors using RGB sliders.
## RGB color system will offer
## the broadest range of colors.
## The difficulty with the RGB

Figure 4.10 Adobe Photoshop’s Color Picker allows you to choose between several different methods for mixing color.
52 Chapter 4 ■ Basic Design Principles
Tip CMYK The CMYK color system is derived
      Using the RGB color system can result Everyone mixed paint as a kid. If you from the printing process. Printers
      in an unprintable color. Adobe Photo- are an artist (and even if you aren’t), use cyan, magenta, yellow, and black
      shop warns you when a color falls out- your finger painting mess may have inks to print full-color images. Small
      side the printable range. If you click on been beneficial to your understanding dot patterns are printed in each of
      the exclamation point that appears these colors. The dots are printed in a
## of colors and color mixing. And
      when these out-of-range colors are cre- range of sizes across the image. The
      ated, the printable color closest to the artists who have worked with traditional media understand mixing paint eye then mixes the colors, and it
      non-printable color will be selected.
      (See Figure 4.12.) Not all software will and ink even better than your average appears that the image contains a
      warn you when you fall out of the kid. These experiences make the wide range of colors.
      printable range. If you are creating art CMYK system a little easier to under- If you take any full-color, printed
      that will be printed, you may need to stand because CMYK works just like image and look at it through a poweraccount for this discrepancy. mixing paint. ful magnifying glass, you can see the
                                                  Paint and ink actually absorb some dot pattern. It is much more visible in
                                                  light and reflect back the rest. The col- lighter areas because the dots are
                                                  ors that are reflected are what the eye smaller and further apart. Many home
                                                  can see. This is why mixing ink or printers also use CMYK ink. They also
                                                  paint produces a darker color. When print using these small dots. Printers
                                                  the colors mix, the colors absorbed by will often tout their printing capabilithe two individual colors are now all ties by giving you a number for DPI.
                                                  absorbed by the new color. Less light DPI stands for Dots Per Iinch. The
                                                  is reflected back to the eye, and the more dots a printer can print in an
                                                  resulting color is darker. inch, the smaller the dots must be. The
## smaller the dots, the harder they are to
## see and the better the image looks.
Figure 4.12 Adobe Photoshop alerts the user when a color has been created that is out of the printable range.

## Visual Organization 53

Understanding how the CMYK sys- HSB tem works can make it much easier to The HSB system offers the same range mix colors. The problem with this of colors as the RGB system and is color system is it can’t produce a wide easier to understand. HSB stands for range of colors like the RGB system hue, saturation, and brightness. If you can. Figure 4.13 shows you what understand these terms, it can be easy Photoshop’s CMYK mixing system to mix colors using the HSB system. looks like.
## Hue is what most people think of
## when they use the word color.
## Changing the hue can change a color
## from red to blue. Saturation defines
                                             how powerful the color is. When satu- Figure 4.14 HSB may be the easiest
                                             ration is low, the color is closer to color system to understand.
## gray. When saturation is high, the
                                             color is much closer to the full color. Visual Organization
                                             Brightness works like it sounds: The
## A good rule when creating an inter-
## higher the brightness value, the closer
## face is to space elements evenly and
## to white the color is; the lower the
## align them well. Paying attention to
## brightness value, the closer to black.
## spacing and alignment results in visu-
## Figure 4.14 shows Photoshop’s HSB
Figure 4.13 Adobe Photoshop also offers al organization. If the elements in
## mixing system.
the option of mixing colors using the CMYK your design are scattered and the system. spacing between them isn’t consistent,
## your design will appear unorganized.
## This is displeasing to the user. Most
## people are attracted to organization.

## 54 Chapter 4 ■ Basic Design Principles

If your design calls for objects that are In Figure 4.15, the upper set of shapes there is no unity. If all of the elements not aligned, then make sure that these is evenly spaced and aligned along the in your design are a different shape or elements are not positioned only bottom of all three shapes. The mid- color, then the composition will slightly off-alignment with other dle set of shapes is center aligned. appear to be thrown together and it objects—in other word, move them This improves the alignment but even will lack the cohesiveness found in far enough out of alignment that though they are technically spaced good design. On the other hand, if all there is no doubt that it was inten- evenly, the circle seems a little too far of the colors and shapes in your tional. It can be very disconcerting to away. The bottom set of shapes is design are exactly the same, then your the user if objects look like they visually spaced correctly. design won’t be very visually interestshould be aligned but they aren’t. ing. A little variation is required to Many designs can be improved by make a design pleasing to the eye. simply fixing the spacing between
## The best approach is to start with
objects.
## unity. Everything should feel like it
Use your eyes and not your ruler fits together. Unity in your design is when creating spacing between accomplished by repeating visual eleobjects. Visual spacing may not always ments such as color, shape, and size. be exactly the same as the actual phys- An obvious place to start is color. Use ical spacing. For example, elements color consistently throughout the with circular edges may need to be interface. Look at the rest of the elecloser than objects with square edges. ments in your design and make sure
## Figure 4.15 The bottom image is visually
The important thing is that every- spaced correctly.
## that shapes, sizes, and other elements
thing appears evenly spaced. Trust repeat often. If you are using circular your eyes. It is often helpful to imag- shapes in your design, then be sure to ine that you will fill the space between Unity and Variation use these curved shapes throughout two objects with sand. If the spacing is When you’re creating an interface the design. A square shape with harsh visually correct, the amount of sand design, one of the biggest challenges is edges may not fit with the rest of your between each object should be rough- striking a balance between unity and design. ly equal. variation. If your design is composed
## of a group of unrelated elements, then

## Movement 55

When you’ve achieved visual unity, At first, it may be difficult to see the Movement then you can create some variations negative space. It may take practice
## Even if an image is static—without
that will create visual interest. If your before you are able to instinctively
## any animation—it can still impart the
design consists of circular shapes, you notice the shapes created in the nega-
## feeling of movement. Certain shapes
can make them different sizes or col- tive space. Your natural reaction is to
## have an inherent movement, while
ors. If you are using square shapes, only see the positive space. Figure 4.16
## others appear to be stationary. Angled
you can set them at different angles. illustrates negative space.
## lines give the feeling of motion, for
The difficult part is striking the balance between making the variation different enough to be interesting and not losing the unity of the design.
Negative Space When placing an element in your design, you should be aware of the negative space that is created by the object. Negative space is the empty area around an object—not the shape of the object itself, but the shape of the background. Negative space is just as important a design element as the shape of the object. The negative shape will contribute to the overall feeling of your design just as the positive space does.
                                                Figure 4.16 The fancy F creates a negative shape. Part of this shape can be seen in
## red in the smaller image.

56 Chapter 4 ■ Basic Design Principles
example. The more visual space and you have a design that seems too stat- Figure 4.18 demonstrates how these power the angled object has, the ic, you might improve the design by lines have a feeling of stability. stronger the feeling of motion. Figure simply tilting the entire menu at an
4.17 demonstrates how angled lines angle. Eye Movement
have an inherent motion. You can also
                                               If you are working on a city simula- In addition to the inherent motion of
line objects up in a way that together
                                               tion game, it may be more important the shapes in an image, you should
they produce an angle with motion.
                                               to give a feeling of power and stability think about eye movement. Eye moveIf you are working on a racing game, than a feeling of motion. A feeling of ment refers to the order in which a
you might want to consider a design stability comes from lines that are ver- viewer looks at an image. What is the with a strong angled line. If move- tical or horizontal. These lines do not first thing the viewer sees? Is this the ment and speed are important ele- have much movement, but they feel most important object in the scene? ments of your game, then angles may much more solid. If your interface Where is his eye drawn next? At any be much better than vertical lines. If needs to feel strong and stable, verti- point is the viewer drawn out of the
## cal or horizontal lines can really help.

Figure 4.17 These angled lines create a feeling of motion. Figure 4.18 The solid vertical lines give the appearance of
## strength and stability.

## Balance and Weight 57

design and off the screen, rather than on the page than Figure 4.20 does. To tributed. Look to see where the heavy on to the next item? As the designer, test your own designs you will need to areas are located in relationship to the you can control the user’s eye move- learn how to recognize your own eye light areas. Visual weight can be ment with the composition of ele- movement. affected by the color, size, and shape ments. of an object. Many attributes of the objects in your Balance and Weight If all of the elements in your design scene can contribute to eye move- Shapes and objects in any image have appear to have equal visual weight, ment. Size, color, and shape can all a visual weight. Dark areas appear your design may not have enough attract attention and control the heavier than thin, light-colored variation to be interesting. Not all movement of the user’s eye. You can objects. When designing an interface, designs require dramatic differences see how your eye moves across the pay attention to the overall layout and in visual weight, but if your design image in Figure 4.19. Figure 4.19 does control how the visual weight is dis- lacks energy, you can try adjusting a better job of keeping the viewer’s eye visual weight.
Figure 4.19 The eye movement starts at the large shape, Figure 4.20 This design is similar to that in Figure 4.19, but moves to the medium shape, and then the curved line draws the the curved line now draws the viewer’s eye off the screen before eye to the shapes in the bottom-right. it reaches the shapes in the bottom-right.
58 Chapter 4 ■ Basic Design Principles
In the real world, physical objects that even more dramatic if the visual used to informally balance your are unbalanced don’t stay that way weight is off-center. Figure 4.21 is a design. A darker item may be used to very long. They fall over. We are used design that is not balanced. It seems balance several lighter items. It is to seeing objects in a balanced state. It like it is just about to fall over. much harder to achieve balance using is the same with visual weight within informal balance. When using formal
## There are two types of balance that
a design. We expect to see visual balance, you can simply mirror the
## can be used in a design. The first is
weight distributed in a way that feels image. Informal balance requires
## formal, or symmetrical, balance. If
stable. When objects with more visual more planning and skill, but it also
## you can draw a line down the center
weight appear at the bottom of an can be much more visually interesting
## of the screen, all the objects on one
image, it brings a feeling of stability. and appealing.
## side of the screen are mirrored on the
When these objects appear at the top
## other side. All of the objects do not
of an image, the design can appear a Unbalancing Your Design to
## need to be exact copies of the objects
little top-heavy. This effect can appear Create Tension
## on the other side, but they may be
## similar in size, If you understand how to use visual
                                                                   shape, and color. balance, you can use this knowledge to
## create a feeling of tension. If a design
## The second type of
## is very top-heavy, it can appear as
## balance is informal,
## though the objects in your scene are
## or asymmetrical,
## about to fall over. A feeling of stability
## balance. If you
## is not always what you’re shooting for.
## divide the screen,
## Many times, you can correct a design
## when using infor-
## by making changes in the visual
## mal balance, a large
## weight of objects that result in a stable
## item on one side
## and grounded-feeling design. Other
## balances several
## times, you can make an interface that
## smaller items on the
## is a little boring much more dynamic
## other side. Size is
## by shifting the visual weight into a
## not the only
## position that appears unbalanced.
## attribute that can be
Figure 4.21 This design is top-heavy. It looks as though it would be easy to tip over.

## Dividing an Image 59

Odd Numbers Dividing an image evenly can make it
## much more pleasing to the eye. If an
When placing repeating objects into
## image is divided near the center but
your design, you will find that having
## the division is not centered, it may
an odd numbers of objects is more
## look like a mistake. Good places to
visually pleasing than an even num-
## divide an image are in the center, at
bers of objects. One of the reasons
## the two-thirds point, and at the quarthat odd numbers are appealing is
## ter point. A two-thirds division tends
that they have a center object. This is
## to be particularly visually pleasing.
more comfortable to look at. Even
## Figure 4.23 illustrates how even divinumbers of objects can work if they
                                          Figure 4.22 Notice how the odd sion is visually pleasing.
are well placed, but if you have a numbers seem more interesting. choice, it is good to remember the odd-even rule. It is easiest to see the effect of odd Dividing an Image numbers when working with a small When introducing an element into number of items. Three or five objects your design that divides the image, is much more visually interesting make sure to carefully place the divithan two, four, or six objects. Once sion. Any object that stretches the the number of objects in your design length or height of the screen could gets much past seven, it is harder for possibly divide your image. The diviyour eye to even detect if there is an sion doesn’t have to completely divide even or odd amount of objects. Figure the screen. You should treat a division
## Figure 4.23 The images on the left are
4.22 demonstrates how odd numbers that covers a large portion of the divided in half and in thirds. Notice how
look best. screen in the same way you treat a this is more visually pleasing then dividing
                                          complete division, though. an image at positions that are a little off.

## 60 Chapter 4 ■ Basic Design Principles

Intersections Summary When objects intersect, it is particu- If your interface does not boast as larly important to make sure that good of a visual design as you would there is nothing that looks like a mis- like, it might be helpful to go through take. If two objects intersect in such a a checklist of basic design principles. way that they do not line up perfectly If you follow these basic design prinbut are close to lining up, make some ciples, you can create great interfaces. adjustments—either make them line These principles apply to everyone— up perfectly with one another or no one becomes a good designer and move them so they are far enough off then can ignore these principles. that no one thinks you tried to line Following the guidelines presented in them up and missed. Figure 4.24 this chapter makes an interface demonstrates how alignment can be designer effective. important to your design.

## Figure 4.24 The top image looks as if
## the designer tried to align the boxes and
## just messed up. The bottom image looks
## better because the two boxes are clearly
## not intended to be aligned.

## Chapter 5

Console or PC?
                                         Bad Conversions An interface designed for a mouse
         ig differences exist between
## may be very difficult to navigate with
         video game development for The differences between a console
## a controller. Buttons can be placed
         consoles and development for and a PC are most apparent when a
## almost anywhere on the screen in a
B PC games. Each platform has its benefits and drawbacks. One of the
## PC game is converted to a console
## game. PC games are often converted
## PC game. They don’t need be placed
## the same way they are placed on a
biggest and most apparent differences to a console, but the conversion is not
## console. Often, this means that a PC
between the PC and a console is that always successful. Most PC games
## interface needs to be redesigned for
they use different input devices. A have been created so that both the
## the console.
mouse is very different from a con- interface and game-play work well troller. The entire game can change if with a mouse. When these games are When converting a PC game to conit is on a console instead of a PC. converted to console without all of sole, it is imperative that the entire Understanding these differences can the necessary adjustments, a great PC game, including the interface, be help an interface designer create a game can become difficult or impos- modified to work well with a conbetter interface for either platform. sibly hard to play. troller. It is not always easy to switch a
62 Chapter 5 ■ Console or PC?
game from mouse control to console- interfaces. I will give you a little back- The console game developer is not the style control without changing the ground about how games are made only one who must comply with all of core game mechanics. In some con- and explain how this can have an the guidelines set by the hardware versions, an attempt has been made to effect on the interface. Some of the manufacturer—the game publisher turn the controller into a mouse. A differences between PC games and must also work around the hardware cursor appears on the screen, and the console games are not only a result of manufacturer’s schedule. This can get user moves the cursor around with the differences between a mouse and a really tricky when everyone is trying the joystick or d-pad as if it were a controller, but are a result of the dif- to get games out for Christmas and mouse. This is seldom a good solu- ferences in the development process they all need to get approval and have tion. It can be very tedious to move as well. the disks created at one company. the cursor completely across the This can cause a bottleneck, and it can screen using a joystick because the Console Hardware take a lot longer to get a game into the joystick can’t move as fast—but if it Manufacturers stores. Because of this potential delay, moved fast, the cursor would be hard PC games often have a much quicker
## The current major hardware manuto control. It is much easier to move a turnaround time from completion to
## facturers for console systems are
mouse around your desk at varying the shelf. This means that delays in
## Nintendo, Sony, and Microsoft.
speeds than it is to use a controller to console development can be even
## Because these companies manufacmove a cursor like a mouse. A con- more detrimental and harder to over-
## ture the consoles and all of the games
troller can’t easily vary the speed of come than they might be for a PC
## that can be played on their game sysmovement. Moving a mouse is much game. Console games cannot be man-
## tems, they make the rules. Even if
faster than it is to fake mouse control ufactured overnight.
## another company has actually develwith a controller.
## oped the game, the hardware manufacturers themselves actually make Developer Approval
Console Development the game disks. The only way to get a Before a developer can use developThe more you know about the entire game on the market for one of these ment hardware and gain access to the game-development process, the more console systems is to learn and follow technical information he needs to effective you will be at creating great the manufacturer’s rules. make a game for a console, the hard-
## ware manufacturer must approve the

## Console Development 63

company. This approval is not simple If the game concept does not appear Each hardware manufacturer proto obtain. One of the only ways for a up to the standards of the hardware vides a lot of documentation and new developer to get such approval is manufacturer, it will not be approved. online help. All of these guidelines are to find an experienced publisher that This decision is completely up to the listed in this documentation. Even is willing to pay a less-experienced hardware manufacturer—they and with all of the documentation they developer to make a game. The pub- they alone decide if your game is good provide, you may come across situalisher can then ask the hardware man- enough. The game is judged on a tion in which you are unsure what to ufacturer to approve the developer. number of factors, including depth, do. When this happens, you can ask The problem is that publishers are quality, target audience, competing questions. But you must be an looking for experienced developers products, release schedule, expected approved developer to have access to who are already approved. Yes, this is sales, and whether they believe that it this information. as complicated as it sounds. will be good enough for their system.
## When developing a game for a con-
## sole, make sure to follow the manuConcept Approval Technical Approval facturer’s guidelines strictly. Even one
Even after a developer has received Each hardware manufacturer has tiny mistake can cause a game to be approval, he can’t just make any game stringent technical requirements that rejected and result in costly delays. he wants. Most of the console manu- must be met before a completed game The problems will need to be fixed facturers require a concept approval can be approved for final manufactur- and the game re-submitted. Even if for each game. Because of this con- ing. These requirements affect the the developer can make the changes cept approval requirement, most pub- programmers, and they also affect the and have the game ready the next day, lishers hesitate to invest money into a interface design. For example, saving it can take anywhere from a couple of concept that has not been approved. and loading games usually must be days up to a couple of weeks for the Even after the concept is approved done in a specific way. Often there are game to be reviewed again. and the game is complete, the game also specific text requirements that You will save time if you read and folstill needs to meet certain technical need to be met in the interface. I’ve low these requirements from the requirements. had a game rejected because I didn’t beginning of a project. Rejection can
                                          use a capital letter when referring to a come as a nasty surprise at the end of
                                          piece of hardware. a project, especially for inexperienced
64 Chapter 5 ■ Console or PC?
developers who planned on getting from the hardware manufacturers Not only is the actual development approval quickly. You should do your and some of them cost more than cost higher for console games, but best on your first game submission to your car—especially right after a new also it is more expensive to actually a console manufacturer, but prepare console has been released. Often, spe- produce the final game disks. The to be rejected—a high percentage of cial hardware is used to burn the CDs game publisher must pay the hardgames don’t pass on the first attempt. that can only run on special versions ware manufacturer a fee for every disk
                                            of the consoles. All of this hardware is that is produced. This is how the
Console Game Cost expensive and can only be obtained hardware manufacturers make
                                            by approved developers. Even the money. Because of this extra cost, it is
It typically costs a lot more to make a
                                            disks needed for a final submission much more expensive for the publishconsole game than it does to make
                                            are costly. er to get a console game on the shelf
most PC games. And because the cost
## than to release a PC game.
is higher, the stakes are also higher. Another reason for the high cost of While console games average more console game development is that sales, the higher costs of development these games must meet the standards Effect on the Interface can still make them a bigger risk. of the hardware manufacturers. This A publisher may ask you to design Because of this bigger risk, it is diffi- often means that console games need your interface exactly like that of cult to convince a publisher to make a more features than a PC game. The another game that has already been new and original game. Publishers are hardware manufacturer may not approved. This may be frustrating, looking for guaranteed successes. approve your game if the feature set is especially when what you really want
                                            not up their standards. If you have is to try something new. UnderOne of the reasons for the higher cost
                                            made a kids’ dodge-ball game and you standing the approval process can
of developing console games is that
                                            only have 10 characters to choose help you understand why the publishthe development equipment is
                                            from, you may be obliged to bump er wants you to design something
extremely expensive. A lot of equipthe number of characters up to 30 or tried-and-true—any small deviation ment is needed to program and test a
                                            40 before the game will be approved. may cause the game to be rejected. If
console game. Each programmer may
                                            No matter what your budget is, you you don’t pass on your first submisneed a special development system
                                            will be compared with all of the other sion because of this change, it will
that allows him to actually program
                                            big games on the market. More fea- take time to correct the problem. This
and run the game on the console systures means a bigger team, and large time-delay could cause the game to tem. These systems come directly
                                            teams can be expensive. miss shipping in the correct quarter.

## PC Development 65

It would be great to be able to design smaller than for console games. The This is dramatically different for PC your game interface without thinking hardware and the price of the games games. A huge variety of computers about the business side of game devel- have limited the amount of money will be used to play your game—there opment, but unfortunately, business that can be spent on development. are countless types of video cards decisions do often directly affect an This may change in the future. alone. Compound this with sound interface designer. cards, RAM, operating systems, and
## Both Sony and Nintendo’s latest
## so on and you’ve got thousands of
The biggest business question is, of handheld systems will add their own
## possible configurations for a personal
course: How many copies of the game new twist. The PSP will be very pow-
## PC. When creating PC games, the
will be sold? This may have an effect erful for a handheld game system, and
## developer must be aware and design
on your design. The Marketing the DS will introduce a new control
## the game to run on large variety of
department may have a different idea system with both a touch screen and a
## these possible configurations.
of what will sell than you do. You may second screen. need to follow their advice even if you think your idea is much cooler than Minimum Requirements for what the Marketing department
## PC Development PC Games
thinks will sell best. If they feel that Developing video games for the PC PC games list the minimum hardware the ability to scan your own face and presents its own unique challenges. requirements needed to run the game put it on the player is the hottest new Many of the differences from console right on the box. The lower the minitechnology, you may have to build the development are a result of the varia- mum requirement, the bigger the interface to do this. tion in PC hardware. When you’re potential audience for the game—
                                           developing for a console, you can meaning more people may buy it.
                                           count on the hardware remaining the Because of this reality, many publishHandheld same on every system—every ers want the minimum requirements
Development Playstation2 has the same video card, to be kept low. These lower requireHandheld development is much like for example. There are no variations. ments limit the kinds of features you console development. The control is You can’t buy a Playstation2 with a can have in the game. often similar to a console, and the better processor or video card than all
                                           of the other Playstation2 systems. The minimum requirements for a
approval process is also similar. The
                                           They are all identical. If the game game can directly affect its interface
difference is that traditionally, the
                                           works on one GameCube, it will work design. The video card affects the
game sizes and budgets have been
## on all GameCubes.

66 Chapter 5 ■ Console or PC?
amount, size, and shape of the tex- Find out what the minimum require- between all of the buttons by moving tures that can be used in an interface. ments are early and learn the limita- the onscreen cursor in a single direcOnce the minimum requirements are tions of the low-end hardware. Create tion by pressing buttons on the conestablished, work with the program- the best interface you can under the troller. All of the options should be mers to see how they affect the inter- restrictions. Establish any special accessible by moving the cursor either face. advanced features that your game up and down or left and right, but not
                                            will support, and determine whether in both directions. If the buttons are
Often, big-budget PC games support
                                            these features will affect the interface. stacked vertically, so that moving the
cool features that are only in the latest
                                            Early planning will prevent time- onscreen cursor up and down moves
video cards, but they must still supconsuming changes to the interface the player from option to option, then port much lower minimum requirelater. moving the controller left and right ments. In these cases, the game may
## should change the settings for the
require different art for high-end
## selected option. In this case, if you
machines. The questions that must be The Controller have difficulty levels selected, moving answered early in development are: One of the big challenges for develop- left or right should cycle through What percentage of end users will ers who are familiar with PC games Difficult, Medium, and Easy. have good enough PCs to see the but have never designed an interface advanced effects, and are they worth for a console game is to create menus In addition to moving the controller the effort? The target market of the that work well with a controller. left and right, the user could also game can greatly the answers to these Controllers have many buttons, but change some options by using the questions. If you are developing a they do not give you the freedom of button on the controller that is desigfirst-person shooter game that is movement you get with a mouse. A nated as the Select button. The Select directly aimed at hard-core gamers, mouse can be moved around a com- button can also be used to advance then you can safely assume that much puter screen rapidly, so the location of the user to the next screen. Figures 5.1 better hardware will be used to play it. the buttons onscreen is much less and 5.2 demonstrate how buttons If you are creating a puzzle game that important than when using a con- should be aligned in a row. They don’t may be played mostly by middle-aged troller. need to be perfectly aligned, but the people, then you’ll need to account user should recognize that moving for the fact that older people tend to The basic principle when designing the button down will change options, own older computers. interfaces for a controller is to place it won’t make changes to the currentall of the onscreen buttons in a row. ly selected option.
## The user should be able to cycle

## The Controller 67

Figure 5.1 Moving up and down moves the selection from Figure 5.2 Moving left and right moves the selection from button to button. Moving left and right makes changes. button to button. Moving up and down makes changes.
Getting the Timing Right are several viable options, but I sug- It is sometimes tough to get the timChanging options by moving the stick gest using the most common ing right. When the button on the or direction pad can cause problems if approach. If the user presses the con- controller is held down, the cursor the speed of this change is not imple- troller in one direction and holds the changes the first time it pauses on the mented properly. Game programmers d-pad or joystick down, the onscreen next selection for an instant. This often address most of the problems selection should change once. After pause should hold long enough so that can occur with bad timing, but it the selection stays on this new option that the user does not accidentally is important to understand how for just under a second, the selection move further than he wants to. If the changing highlighted options in your should change again, and it should pause is too brief, the user could accimenu should function. then continue to change fairly rapidly dentally hold the button on the conuntil the button on the controller is troller too long and move two spaces The challenge of getting the timing released. instead of one. It should also not correct comes in adjusting how the pause so long that if he wants to move
## stick or directional pad works. There

68 Chapter 5 ■ Console or PC?
                                             more than one space, he feels as if the they are manageable on a console.
Power Controller Users controls are unresponsive. The Striking the perfect balance is not At the same time that you make the option-changing speed should be easy. interface easier for new gamers to nav- rapid enough that the user can change igate, you can also make the interface options quickly but still be able to Displaying Navigation easy for the expert gamer, too. Consider stop at his desired location. The Information allowing the user to use the shoulder options shouldn’t change so fast that
## Because the controls for navigating an
buttons (the buttons on the top-side of the player overshoots the one he
## interface in a console game are not
the controller) to pick minimum and wants.
## necessarily as intuitive as clicking on
maximum option settings, for instance, or provide shortcuts for jumping from
## buttons with a mouse, it’s often
                                             Limiting Buttons important to display more help inforscreen to screen.
                                             Another rule for console interfaces is mation in a console interface than
A well-designed console interface can
                                             to use only a limited number of but- you would in a PC game interface.
actually be quicker for a power console
                                             tons on each screen. Too many Some console games display a list of
user to navigate than for a user with a
                                             buttons on a single screen can make buttons and their associated actions.
mouse. For instance, a few quick button presses can bring up a menu to which a navigation tedious. Because the user Some designate a Help button that, mouse user would have to carefully nav- must cycle through all of the buttons, when pushed, shows a new window igate using movement and clicks. Don’t it can take an unacceptable amount of summarizing the functionality of the just adapt to the limitations of the con- time to get from an option at the top buttons on the current screen. sole controller—embrace the advan- of the screen to an option at the bottages of it, including the directness, tom. With a mouse, a player can skip
## all of the intermediate buttons and go
## The Mouse
simplicity, and feel.
                                             directly to the correct button, but The mouse opens up a lot more
In addition, take into account the
                                             with a controller he can’t. If a screen opportunities for interface layout. The
uniqueness of a given console’s conbegins to have too many options, you ability of a mouse to move the cursor troller compared to the controllers on
                                             should probably create another quickly to any spot on the screen
other console systems. Play other games on the specific target hardware screen and move several of these allows much more freedom of design and decide what you like and don’t like options to it. and layout. Buttons do not necessarily about how the designers implemented need to be positioned in a row as they
                                             You also don’t want to have too many do when using a controller.
navigation and control using that spe-
## screens. You may have to work to
cific hardware.
## reduce the total number of options so

## The Mouse 69

Keep the Design Simple Image-Based Interfaces glance should reveal all of the options The design freedom a mouse affords A common approach to designing a and tell the user where to click. is no excuse for a disorganized layout PC interface is to use a detailed image A game menu is not a good place to or having too many options on the as the interface. In such a design, the play hide and seek. The screen should screen. Simplicity and organization buttons are actually objects in the include a clear visual identification of should still be your design goal. The image. As the user moves the mouse each clickable area. This can be done user will enjoy being able to look at a over the image, areas light up for each in many ways. For example, a brightly screen and instantly know what to do. option. For example, an image of a colored border around each clickable Keep your design simple. locker room might be used for a foot- object will clearly indicate their locaball game; as the user moves the tions onscreen. It is also helpful to If there is a chance that the game will
                                           mouse over the chalkboard, it lights make each clickable object relate logibe converted to a console game in the
                                           up, and if he clicks on it he can create cally to the option. It wouldn’t make
future, it is a good idea to design an
                                           and modify plays. As the user moves much sense if objects led to random
interface that is simple to convert.
                                           the mouse over the team logo, it lights options that had no real correlation to
Design the menu as though you were
## up, and if he clicks on
designing it for a console. Think
## it he can switch
about how the menu would work
## teams.
with a controller. This will prepare your menu to be converted and it will This approach can help keep your PC game menu simple create a very interestand easy to understand. ing interface, but it
## also can be problemConsole interfaces tend to be much
## atic—images can
easier to convert to the PC. If the lay-
## look really cool, but
out works well for a controller, it is
## they can make it easy
easy to turn the console buttons
## for a user to get lost.
into buttons that can be selected
## The user should
with a mouse. Converting the game-
## never have to stop
play mechanics can be a little more
## and figure out what
difficult.
                                           (or where) all of the
                                           options are. A quick Figure 5.3 An interface that uses images as buttons can be
                                                                     interesting, but you need to make sure that it is still easy to use.
70 Chapter 5 ■ Console or PC?
the object. If your interface was an to work. Often, the game developers remains at a fixed resolution no matillustration of a rural village, and an make the choice to support various ter what game resolution the player image of a well was a button that led resolutions in one game. In these cases, chooses—only the in-game resoluto game options and an image of a the user can change the game resolu- tion changes. The HUD (or in-game donkey led to the scenario select tion in the options menu. If the user interface) is much more affected by screen, the user could get really con- chooses an option that is too high for changes in resolution than the frontfused. It requires a lot of creativity to his computer, he may experience slug- end menu. The simple way to handle design an interface that has the cor- gish game play. Allowing the user to resolution changes is to design the rect combination of objects to fit all of change the resolutions allows the game HUD for the lowest resolution; if the the options. to be played on a larger variety of com- game runs at a higher resolution, then
                                             puters. Slower computers can simply the HUD elements appear proporrun the game at a lower resolution. tionately smaller. When you are creatResolution ing mock-ups and making final art,
PC monitors and televisions are very Most PC games don’t run any lower
## create and design your interface at the
different from one another. One of the than 640×480 and some offer very
## smallest game resolution. If you work
big differences between a television large resolutions, such as 1024×768 or
## at larger resolutions and then reduce
and a computer monitor is resolution. higher. The resolution of a game can
## the size later, critical detail can be lost.
Resolution refers to the number of col- affect game-play. For example, if you
## You need to know if text can be read
ored dots that are used to make up the are playing a network first-person
## and that everything is clear at the lowimage on the screen. The more colored shooter against a buddy with a com-
## est resolution. If you create art that is
dots, the sharper the picture. The more puter that can’t handle the resolution
## too small and it is scaled larger, it will
of these dot or pixels that are displayed, that your computer can handle, you
## become blurry. This applies to both
the higher the resolution. A standard will have the advantage. You will be
## the front-end interface and the HUD.
TV resolution is 640×480, and a com- able to see more, as objects in the disputer monitor can display a resolution tance will be comprised of more pixels than on your buddy’s computer. Standard TV Resolution like 1280×1024 or even higher.
                                             These resolution changes often only Traditionally, the resolution of a teleaffect the in-game resolution. vision has been really low. A standard
PC Game Resolution TV in North America has a resolution The resolution capability of a PC of 640×480. This is smaller than the
## Front-End Menu Resolution
depends on the video card in the com- lowest resolution of most PC games. puter. The more pixels that are dis- In PC games that offer changes in res-
## This low resolution can pose a
played, the harder the computer needs olution, typically, the front-end menu

## TV Color 71

challenge for console game develop- The PAL television has a resolution of help keep your colors within a range ers, as there is not much room to 640×512. that works well on a television. For work with. Fonts can’t be too small, example, Adobe Photoshop has an and icons may need to be displayed Overscan NTSC colors filter. This filter is found with a limited number of pixels. Every The term overscan refers to the fact under the Filter/Video/NTSC color. It pixel is very important on a television that not all of an image is displayed will take any of the colors in your and you can’t hide anything. As on a TV screen. Almost no television image that are out of the color range HDTV becomes more popular, more displays the entire available image. All for television and convert them to console games will support higher four edges of the image that the con- colors that work well on a TV. This filresolutions. The need to also support sole is sending to the TV are cut off. ter is helpful in many cases, but it can standard TV resolutions will remain The amount that is cut off varies from also produce some unexpected in place for a long time. Console TV to TV. When working with con- results. When the colors are convertgames will need to look good at 640 × sole games, it’s essential that you ed, they may not look good with the 480 even as HD resolutions become account for overscan and do not put other colors in your image. It is always more common. It is important to important information on the very best to work within a safe color range determine whether your game will edges of the screen. In fact, console rather than working in a broader support a higher resolution even if it hardware manufacturers require you range of color and running this filter. is a console game. to keep critical data away from the You can’t rely on the NTSC filter to fix
                                          edges, and will usually not approve all of your images.
PAL versus NTSC Television your title if a piece of text, for exam- Figure 5.4 demonstrates how the When designing your interface, you’ll ple, is too close to the edge. Review bright colors in the image were darkneed to take into account the fact that the specific approval requirements for ened by the NTSC Color filter. there are several different television the target platform to make sure your
                                          design and final work take overscan There are two color issues to rememstandards in the world, not counting ber when creating an interface for a
HDTV. The two most common stan- into account.
## console game. The first is that saturatdards are NTSC, which is used mostly ed colors in the range of yellow to red
in North America and Japan, and TV Color should be used sparingly. Even if your PAL, which is used primarily in colors fall within the NTSC range,
## Computer monitors have the capabilEurope. Among other differences, these colors can bleed, and the edges
## ity to display a much broader color
NTSC and PAL televisions have dif- of these brightly colored objects can
## range than a television can. Many
ferent refresh rates and resolutions. become very fuzzy on a television
## software packages provide filters that

72 Chapter 5 ■ Console or PC?
                                                                  the PAL standard) and displayed on a television. Every televithe other half in the sion will also display colors slightly
                                                                  next update. This is differently. It is essential that you
                                                                  called interlacing. review your work. Make sure to look
                                                                  Some console systems at your menu on many different tele-
## have hardware that visions and not depend on how it
                                                                  reduce the effect. It’s looks on a computer monitor. If slight
                                                                  important to check color changes on various TVs cause
## your art as displayed problems, you may need to adjust
                                                                  by the target hardware your colors so they work well across a
## on a television. Your variety of televisions.
## development team
## should have test
## machines or develop-
## Summary
Figure 5.4 This filter can help but if you use too many colors ment hardware that Learn the differences between console that are out of the NTSC range, the filter may not be enough to you can use to check game development and PC game fix the problem. your art before you development. Understanding these
                                                                   commit to a specific differences can help you design for
screen. The second thing to remem- look. either system. Don’t assume that ber is that any high-contrast colors, because you have developed for one
                                                 If your images flicker, you will need to of these platforms you can automatisuch as pure black on pure white, may
                                                 make adjustments. The problem is cally develop for the other. Consider
also bleed on a TV. Small white text
                                                 most visible when the contrasting the resolution of your game when
on a black background can be much
                                                 areas become a pixel or smaller. In designing the interface and be careful
harder to read than light gray text on
                                                 such a case, you can make the con- to use safe colors when working on a
a dark gray background.
                                                 trasting areas larger and less contrast- game that will be displayed on a TV.
                                                 ing. This will help the flicker. You must look at your art on the final
Interlace Flicker
## platform before you know how it will
Small, high-contrast lines and text can Color Variation really look. flicker on a television screen because
## Colors vary greatly from television to
most televisions actually display half
## television. What you see on your
the lines of an image in one 1/60th of a
## monitor is different from what will be
second update (1/50th of a second in

## Chapter 6

## Button States

                                            Everyone has used buttons. At an Buttons change appearance when
     n this chapter, I will be discussing
                                            early age, we all learn that buttons they are selected or when they are
     buttons. When I use the word
                                            should be pressed. If you hand a tod- pressed. Each of these changes is
     button, I am referring to anything
                                            dler a television remote or telephone referred to as a button state. Although
I that can be used to make a selection in a game interface. I call these controls
                                            that she has never seen before, she will the three button states (standard,
                                            instantly begin pressing the buttons. selected, and pressed) may seem to
buttons because they often appear to
                                            This does not mean that images that cover every possible situation, there
be a button that can be pressed. They
                                            don’t look like buttons can’t be used are many more possibilities, some of
are shaped, colored, and appear to be
                                            in an interface. Images that look like a which you will read about in this
raised like a button on a VCR or dishbullet or space ship can be used as chapter. You should carefully consider washer. These buttons also often
                                            buttons. The player will still need to what button states will be needed for
function like a button. When they are
                                            know that they function like buttons. your interface. The number of states
pressed, they give the illusion that
                                            In the rest of this chapter, I will refer needed for an interface can vary.
they are moving down. Using art that
## to any image that can be clicked or
looks like a button helps the player
## selected to navigate the interface as a
understand how to use the interface.
## button.

## 74 Chapter 6 ■ Button States

Controller Button The Standard Button State States A standard state of a button is just
## what it sounds like. This is the normal
When you are designing an interface Figure 6.1 This is a
## state of a button when nothing has
that will rely on a controller to navi- button in a standard
                                               happened—meaning the player has state. This is what it looks
gate it, you must include some basic
                                               not pressed or selected it. A button in like when no action has
button states. However, it isn’t always
                                               this state should appear to be a button been taken.
necessary to support all button states
                                               (or something clickable) so that the
for every game. Look at all of the
                                               player knows that it can be clicked. of a button. Each icon helps the playscreens that will appear in your menu
                                               This state should be designed with the er understand what each button does.
and decide what will be necessary for
## other states in mind. Think about
your game. The only two states that
## what the button will look like in all of
are always necessary are standard and The Selected Button State
## the other states. If you want the butselected. It is possible to create a very
                                               ton to glow when it is selected, you The selected state is the state of a butsimple interface using only these two
                                               will need to make sure that the button ton after it has been selected. This
button states.
                                               is designed in a way that the glow does state is often referred to as “highlightSome button states make the interface not obscure anything important. If ed” because typically the button
look better, and some button states you want the button to appear to appears to glow or appears in a provide information that will help the move down when it is pressed, you brighter color. The player’s eye should player navigate the interface. The fol- will want to design a button that has a be drawn to the selected button first. lowing is a list of the basic button component that looks like it can be The selected button state should be states for a controller interface: pressed down. the most visually powerful state of all
     ■
## of the buttons on the screen—there
         Standard Figure 6.1 shows a set of buttons in a should be no doubt that this button is
     ■ Selected standard state. Each of the three selected.
     ■ Pressed images has been placed on a box with
                                               rounded corners. This box has slight- Because of the importance of this
     ■ Active
                                               ly beveled edges that provide a little state, the selected effect is often ani-
     ■ Active-selected mated. When the highlighted button
## visual depth and have the appearance
     ■ Disabled is moving, it can really catch your eye.

## Controller Button States 75

It tells the player to look here and pressed state is usually only necessary Tip make a decision. A simple pulsing when there is a delayed reaction from Audio clues can really improve an glow can be effective. Figure 6.2 shows the time of selection until the player interface. Adding a sound to a button the center button in a selected state. sees the change. If the player presses selection event helps the player to recthe button on the controller and there ognize that a button has been selected.
## is no visual change on the screen, he
                Figure 6.2 The may think that something is wrong.
                selected button state is Some option selections may require
## used when the current
                button has been selected the game to load something from a Figure 6.3 The pressed
                (or when the mouse disk, and this can causes a delay. For button state is used right
                curser moves over the example, if the player chooses to start after the player presses
                button on a PC). a game and nothing moves on the the Select button on the
## controller (or clicks the
                                           screen, he won’t know if the button mouse on a PC).
The Pressed Button State press worked. That’s where the
## pressed state comes in handy. The
The pressed button state occurs when Figure 6.3 shows the middle button in
## delay may not be long enough to justhe player presses the Select button on the pressed state. It looks as though
## tify a loading bar, but the wait may be
the controller. The highlighted button the button has been pressed down.
## long enough to cause confusion. Even
often appears to move down. The lighting has changed to create
## a one-second delay can seem like a
Darkening this button is also a com- this illusion.
## long time when you’re expecting an
mon effect used for a pressed button
## instant reaction. Without the visual
state. This change tells the player that
                                           feedback indicated by the pressed The Active Button State
the game recognized that a controller
                                           button state, it may appear to the Some menus are designed so that butbutton was pressed.
                                           player that his selection did not regis- tons can be active even when other
The pressed button state is frequently ter. He might even become confused buttons are selected (or highlighted). included in games, often just because and try to select the option again if he For example, a soccer game may it looks good. This is a state that can does not see any change. include the option to choose between usually be left out of a game. The 15 different stadiums. The player

## 76 Chapter 6 ■ Button States

needs to know which stadium is cur- player recognize that this button is The active-selected state can help the rently active, even when the Start active. Figure 6.5 has a small arrow to appearance of the interface and at the Game button is selected. The Current the side of the button to make it clear same time provide more information Stadium button should appear as if it that the button is active. for the player. The problem with not is active. Figure 6.4 shows a button in using an active-selected button state is the active state. that it may not be clear to the player
## that the selected button is also active.
                                                             Figure 6.5 When a The only way the player will know
                                                             button has been selected that the selected button is also active
                 Figure 6.4 When a but the player has moved is if he remembers that the button was
                 button has been selected to another button, the
## active button state is
## active before it was selected.
## but the player has moved
                 to another button, the used. This may sound confusing in print,
                 active button state is but everyone has seen the activeused. selected button state in action, and
## The Active-Selected Button
                                             State when it is executed well, it is not conThe active state should be second in fusing at all—The active button state
visual power, after the selected state. It The active-selected button state
## is very common in many software
should be clear that that this button occurs when the player selects the
## programs. For example, the latest veror option is active, but it shouldn’t button that is also active. The active-
## sion of Internet Explorer uses the
overpower the selected button. If you selected state is optional. It provides
## active-selected button state. When the
are using a glowing and brightening more information, but it is only nec-
## Search button is active (it has been
effect for the selected button state, essary when an item can be active.
## pressed) and then the player moves
then the effect on the active item Even in this case, it is not completely
## the mouse over it and it becomes
shouldn’t be as bright. Another com- necessary. The normal selected state
## selected, the highlight effect is differmon method is to place a marker can be used in place of active-selected
## ent from the highlighted state when
object around or next to the active if the active button is similar to the
## the button is not active.
button. This extra image is helpful selected state. when other effects in the active button state are subtle because it can help the

## Other States 77

Figure 6.6 is a button in the active- the advantage of using the disabled PC Button States selected state. The glow around the button state is that the player can see
## Many of the button states for a PC
effect has a green tint that is similar to how many levels are left to play.
## game are the same as those for a game
the active state, but it is brighter than
                                                 The disabled button state is not only with a controller. There are some
the active state so that the player will
                                                 for options that need to be unlocked; slight differences, though. It is less
know it is selected. Visually, it is a
                                                 it can also be used when other choic- important to draw attention to the
combination of the active and selectes limit the options that are available. selected button state, for example. ed button states.
                                                 For example, if the player chooses the The selected button will always be
                                                 single-player option, then multi-play- under the mouse cursor. For this reaFigure 6.6 The active- er levels become disabled. son, the selected state in a PC game is
                 selected button state is often called the mouseover state.
                 used when a button has Buttons in a disabled state should not
                 been selected previously appear to be click-able. A common
                 so it is active and it is the solution for creating disabled buttons Other States
                 selected button (the is to have the programmers cover the
                 mouse is hovering over You might need to design for unique
                 this button on the PC). button with a gray color at 50 percent button states in your game. There are
                                                 opacity or make the button itself many cases in which a button state
                                                 semi-transparent. Because of the that is not one of the standard states
The Disabled Button State appearance of the buttons when using described in this book could be useWhen certain options are not avail- these techniques, these buttons are ful. For example, there may be a need able but the player needs to be aware often referred to as being “grayed to select a button that is disabled. If that they still exist, a disabled button out.” you display information about a level state can be used. When the player when it is selected and you want to must play through the game levels in display this information about levels order—say, he can’t skip to a higher that are locked, you will need to allow level but is allowed to go back and the player to select the disabled levels. play a previous level—the levels that In this case, a disabled-selected state
## Figure 6.7 When a
can’t be played yet are disabled. You might be appropriate. If you are mak-
## button can’t be selected,
could simply not show the buttons for the disabled button state ing a multi-player sports game and the levels that can’t be played yet, but should be used. you allow both players to move

## 78 Chapter 6 ■ Button States

around the Team Select screen at the same time, you will need a Player One button select state and a Player Two button select state. You might even want to have a new button state if
## Figure 6.8 The arrow
both players have one team selected at
## next to the button
the same time. pulsates. There is no real limit to the number of button states that could be used in an The most logical place to use an ani- programmer and determine how interface. You may come up with mation is in the selected button state. many frames you can use. An animamany innovative ways to give the This is where you want the player to tion created by the artists instead of player more information by creating look first, as it is the most important by the programmer allows for 3D new button states. Don’t be limited to location on the screen. Movement on rotation and other impressive effects, the states listed above. Let your game the selected button will let the player even if everything in the interface is dictate how many button states you know that this is the location where a really just 2D. will use. choice can be made.
## The game programmers can also do
                                              One way to create animated buttons is some of the animations; this can save
Animated States for the artist to actually create all of time and file space. They may be able
                                              the frames and give these frames to to animate the opacity, position, rotaAnimation can add a lot of impact to
                                              the programmer. The game engine tion, or scale of any piece of 2D art
an interface. Movement is always
                                              then cycles through these frames to you give them. For example, if you
more interesting than a static screen.
                                              create the animation. A simple, give the programmer a button and
Movement can also be very effective
                                              cycling animation is usually the best. then give him a separate glowing
in attracting attention (see Figure
                                              In cycling animation, when the engine highlight, he can place this highlight
6.8). While animation can be a powerreaches the last frame in the anima- over the button. He then can animate
ful tool, if it is used incorrectly, it can
                                              tion it starts over at the beginning. If the opacity of the highlight and make
also cause problems. For example, if
                                              the animation is created correctly, the it appear to pulsate.
every button is animating in the stan-
## transition is smooth. The number of
dard button state, the interface can One advantage of having a program-
## frames you can use in the animation
become confusing. Be sure that but- mer do the animation is that if it is
## will usually be limited—talk to the
ton animation does not conflict with done correctly, a programmer can any background animation.

## Workload 79

make adjustments like changing the Another solution for creating animat- I recently worked on a game that was animation speed of all of the buttons ed buttons is to use real-time 3D a modification of another game. One at once. These types of adjustments geometry instead of 2D art. You could of the changes we made to the new can be made easily, and a large use an actual 3D model as a button, game was to change the colors in the amount of time that it would take an for example. It is a greater technical interface. The game had a lot of butartist to create animations can also be challenge to use 3D elements in an tons and a lot of states for each butcut out. The problem with this solu- interface, but it can provide more ton. It took me a lot of time to get tion is that the interface designer gives options. For example, longer anima- them all switched to the correct color. up a little control. You will need to tions can be used because they do not rely on the programmer to set the require a lot of 2D frames. Also, a Saving Time speed and amount of movement in an greater number of animations can be
## There are some techniques you can
animation. Unless the animation is used because of the small file size of
## use to greatly reduce the workload
done using good software, it will also 3D animations. 3D interface elements
## when designing for button states. For
limit the effects that can be animated. can also rotate and move in 3D space.
## example, if you design the buttons
## These effects are much more difficult
If you are creating a game using a pro- correctly, you create one piece of art
## to accomplish in a totally 2D interface.
gram like Macromedia Flash, you may for a new button state rather than a have more control over animations. new piece of art for every button in Even if you are working with a pro- Workload the game. If you design the buttons in grammer who will be doing the When making the decision about how your interface so that the background scripting, this tool offers you the abil- many button states you will support of the button is always the same, and ity to animate interfaces right in the in your interface, make sure to con- text or icons are placed on top of the game environment. Many of the high- sider the workload added for every background in the game, the proend 3D game engines also have tools button state. If your interface has 50 grammer can combine art to create for creating interfaces. In both of buttons and you add just two more different button states. This way, you these instances, the artists may have states, this could mean you have 100 create one piece of art for each state more control over the final look of new buttons to create. Your schedule and a different icon for each button. animations than they would if they may limit the amount of button states Everything is put together in the are in a situation where the program- you can support. game. If you decide that the selection mer is creating animations. button state should be a little brighter,
## you only have to change one piece of

## 80 Chapter 6 ■ Button States

art and all of the buttons change. The Audio Summary disadvantage to this technique is that
                                           Good audio can really add to an inter- Examine the button states of your
the icons do not change for each butface. Interface designers typically do favorite game or software. If they have ton state. If you want the icon to light
                                           not have complete control over the been designed correctly, you may not
up or darken in any of the button
                                           audio used in an interface, but they have noticed before how many are
states, the method of combining art
                                           can make suggestions for creating the used but you still understood how to
will not work.
                                           audio or making it better. When cre- use the interface. Button states should
The programmers can use several ating the art, it can be helpful to pic- provide information that will help the techniques to limit the amount of art ture what the object you are creating player. Evaluate your game and deterthat needs to be created. They can might sound like. Do your buttons mine how many button states are nectake the standard state button and use beep or honk when they are selected? essary for your game. Some of the transparency to create a disabled state When your screens transition, does most common button states are stanso that the artist does not need to cre- the player hear a whoosh sound or a dard, selected, pressed, active, activeate a disabled button state, for exam- ding? You don’t need to stick with a selected, and disabled. You will use ple. Or the pressed buttons can be a traditional click for your buttons. Pick these states a lot, but you will also darkened version of the standard but- a sound that helps set the mood of the now and then need to come up with ton that is created in the game engine. game. more useful button states that are While these techniques can save time, specifically designed for your game.
## As always, the number one goal is to
again they also limit the variety of
## make the interface player-friendly.
visual effects that can be used. If you
## Don’t confuse the player by adding
want the pressed button to actually
## too many sounds. The sounds need to
look like a button that has been
## seem right for the actions they are
pressed down, you may need to create
## attached to. This may mean that
the art yourself.
## sound effects for a button in a select-
## ed state may need to be subtle, so that
## the button-press sound will stand out
## more.

## Chapter 7

## Creating a Focal Point

                                           The Most Important Put careful thought into determining
         he concept of creating a focal
## the most important element on your
         point and creating a compo- Element screen. The most important element
         sition that leads the eye is a When designing an interface, you may not always be obvious, and the
T common art and design principle. Painters, illustrators, and designers
                                           should figure out what is the most decision might be difficult to make.
                                           important object on screen, and then For example, should the game title be
pay close attention to the focal point determine what is the second most the most prominent or the Select butin their art. The principles discussed important object, and so on. Your ton? A natural reaction might be to in this chapter are even more impor- design should correlate with this hier- have the name of the game the tant for video game interfaces. archy of importance. A well-designed biggest, brightest image on the screen, Because the player must interact with interface will help the player quickly but is the name really the most a game interface, it is critical that he find the most important element on important item on the screen? The knows where to look and what to do. screen without having to search. player usually knows what game he is
                                           Good design will lead the player’s eye playing before he gets to the title
                                           where you want it to go. screen. If the Start Game button is

## 82 Chapter 7 ■ Creating a Focal Point

selected, it might be more important interface will be harder to navigate. you use bold text too often, nothing to let the player that know if he press- You don’t need to fear that everything will stand out. I have seen many peoes the Select button on the controller, other than the main element will be ple make half of the text on the page the game will start. lost. Just because the visual impact of bold because they believe that everythe second object is not as strong as thing is important. If you use bold Don’t fall into the trap of making no
                                              the first does not mean that it will be text on only one phrase on the entire
one element stand out because you
                                              overlooked. In fact, I would suggest it page, this phrase will immediately
think several elements carry equal
                                              is more likely to be seen if there is a catch the reader’s eye. Figure 7.1 illusimportance—this will seriously limit
                                              clear path for the player to follow. trates how much more effective a bold
the visual power of your design. You
## phrase is if it is the only bold text on
should always have one element that This concept of creating a visual hier-
## the page.
is undoubtedly the most prominent archy can be applied to all kinds of element on the screen. If you included design and layout, including text doc- It is easy to find examples of bad docthree elements that have equal visual uments. If you are typing a proposal ument design. I get them delivered to weight because you can’t decide or design document, you can apply my house every week—my mailbox is which to make prominent, then the this design principle. For example, if filled with poorly designed coupons.
Figure 7.1 Notice how the bold phrase stands out on the second page.

## Size Variation 83

The designers of these ads seem to Figure 7.2 is a fictional advertisement Size Variation think that everything is terribly that is similar to some of the junk
## One of the obvious ways to get the
important, and so they make all of the mail I routinely receive. The sad thing
## player to look where you want him to
text the same size or surrounded by a is that I have even seen worse design
## look is to adjust the size of the visual
different bright color. When every- than this! In Figure 7.3 you can see
## elements. Usually the largest object
thing is highlighted, nothing stands how much the same advertisement
## gets the most attention, so make the
out. This visual confusion can cause can be improved by creating focal
## most important object the biggest
people to stop reading because they point. The ad still includes basically
                                                                                           (see Figure 7.4). Make the size differdon’t know what to look at next and the same colors and text; the only
## ences dramatic to show the importhey can’t be bothered to search for major change is that a visual hierarchy
## tance of one element over another.
the main point. The average viewer’s has been created. It still may not be attention span (and patience) is short, great design, but it looks much better and in a split-second of confusion the than in Figure 7.2. viewer can give up.
Figure 7.2 This ad is poorly designed—everything has the Figure 7.3 This may not be great design, but look how much same visual strength and nothing stands out. better the advertisement looks when there is more variation in
## the visual weight of the elements.

## 84 Chapter 7 ■ Creating a Focal Point

In cases where a group of objects need only way to draw attention. For exam- establishing a focal point, color is to be the same size, other properties ple, changing color may be a good most effective when it is used dracan be changed to give more or less option in a multiple-icon scenario. matically and should be reserved for visual impact. If you have a row of only the most important items on the icons across the bottom of the screen screen. In Figure 7.5, a white outline in the HUD, these icons may need to
                                                 Color is used to attract attention. The title
be small, and they are likely to all be Color can be a great way to highlight gets the attention first and the highthe same size. Once an icon is selected, important objects in your menu. lighted button next. The white color it should stand out so that the player Even small objects that are a vibrant stands out on this screen because all knows where to look. You may not color can really attract attention. of the other colors are darker and have enough room to make the high- Using complementary colors can very saturated. The white outline is lighted button bigger when it is select- really make an item stand out. Just used sparingly. ed. Size is important, but it is not the as with the other techniques for
Figure 7.4 The first thing that catches your eye in this design Figure 7.5 Color can be used to grab attention. is the biggest object.

## Movement 85

Value Movement tion, TV commercials move even
## faster than they did in the past.
Just like color, value can help you Use animation, or movement, on
## Images flash rapidly in front of your
attract attention. The brightness or every screen. A static screen is much
## eyes—it is amazing how much a viewdarkness of an image can help create a less interesting than a moving screen.
## er can comprehend in a split second.
focal point. When using value to Movement brings life to your inter-
## Video game players have also come to
guide the player’s eye, the key is to face. Animation will attract attention,
## expect movement in their games. A
have a lot of contrast. Bright objects so you need to use it wisely—choose
## static screen can be very boring; it is
stand out much more on a dark back- important elements to animate and
## harder and harder to get attract attenground, and dark objects stand out avoid animating unimportant back-
## tion in a game without using movebetter on a light background. Figure ground images. If possible, the player
## ment.
7.6 doesn’t have any color, but the should never have to look at a static
selected button stands out because it screen. Creating animation is not a Movement can easily add visual is so much brighter than the rest of trivial task. Creating good animation power to anything on screen. the screen. requires a lot more effort than a Animation is by far the best way to get
                                                                 motionless screen, attention. Even if you use some or all
## but it is worth it. Even of the other techniques that can
                                                                 simple animations attract attention, the player will
                                                                 can liven up your almost always see the movement first.
                                                                 interface. A small and simple animation can be
## powerful, and a dramatic animation
## We are inundated by
## can overpower everything else on the
## movement onscreen
## screen.
## every day. Web pages
                                                                and Internet adver- Imagine a slow-moving fog in the
                                                                tisements often move. background of your interface. This
                                                                And of course, televi- could be really cool as long as the
## sion images move. In movement is slow and does not
                                                                an attempt to push detract from the rest of the interface.
                                                                more information Highlighted buttons should attract
                                                                and grab your atten- attention so that you can really make
Figure 7.6 Even without color, value can be used to create a focal point.

## 86 Chapter 7 ■ Creating a Focal Point

them move. A simple, pulsating glow Be careful to only use animations on Summary is a common approach, but you can important elements. Because of the
## Creating a focal point will help your
get more creative than that. The but- power of movement, the player can
## design and also help the player know
ton could bounce, spin, scale up, or be easily distracted from other
## how to navigate the interface. You can
ripple like water. Decide what kind of important elements on the screen.
## use several techniques to attract attenmotion would fit your subject matter. The most important object on the
## tion. You can use size, color, value,
In a basketball game, for instance, screen can be a great place for an ani-
## and movement to designate the area
basketball-shaped icons could spin on mation. If you use background ani-
## on the screen where you want the
a finger when they are highlighted. mations, make them subtle so as not
## player to look. The most important
Figure 7.7 shows how a spinning ani- to distract the player from quickly
## item will not stand out by accident.
mation could be used to emphasize using the interface.
## Carefully plan your interface with a
the highlighted button.
## focal point in mind.

Figure 7.7 A spinning ball would really attract attention.

## Chapter 8

Using Text in
## Your Interface

                                           size, placement, color, and type effects ty when using text is legibility—if the
        ext is a powerful tool that is
                                           can greatly improve the design of an information is so important that you
        often overlooked or at least
                                           interface. Become a type expert and must put it in the interface, then it
        underestimated by designers
                                           take the time to tweak your fonts until needs to be easy to read. If text is hard
T working on game interfaces. The style of text in an interface can set the
                                           they are perfect. There is a lot more to to read because it is too small or blurlearn on this subject than I can pre- ry onscreen, the user is likely to just
mood of the game. Each font has a
                                           sent in one chapter. Consider this a ignore it and move on.
personality. A font that is handwritten
## quick overview and learn more every
and “scratched up-looking” might be In some instances, however, legibility
## chance you get.
a great choice for an extreme sports may not be so important. Text can be game. A smooth, flowing script font used in the background merely as a might be great for a horse riding game Using Text Wisely design element. The purpose of this targeted at young girls. No one likes to read a lot of text when background text is to set a mood.
                                           playing a video game; therefore, text Remember, you can’t use text like this
It is possible to make a great interface
                                           should only be used when it absolute- if you expect the user to read the text.
design using only text. Font choice,
## ly necessary. Your number-one priori-

88 Chapter 8 ■ Using Text in Your Interface
                                                                  It is well worth your Fonts without serifs are called sanstime to study typog- serif fonts. Arial and Helvetica are
                                                                  raphy. Understanding examples of popular sans-serif fonts.
                                                                  the structure of type Sans-serif fonts are considered “modwill help you to make ern,” and are becoming more popular
                                                                  effective adjustments and widely used; people are getting
                                                                  to fonts. Figure 8.2 better at, and more accustomed to,
## shows many of the reading them.
## important pieces of a
## The rules for using text in an interface
## font labeled.
## are different than they are for printed
                                                                  In the following sec- text. The reason for the difference lies
                                                                  tions, I’ll discuss in the way text is drawn on a computsome of the most er monitor or a TV. When choosing a
                                                                  important compo- font that will be displayed at a small
Figure 8.1 Text is used in the background of this image, but it nents of type and size in your interface, it is best to is there just for looks.
                                                                  how to use them in choose a sans-serif font. Because there
                                                                  your interface design. are so few pixels that can be used to
Figure 8.1 shows a lot of text in the
## display these small fonts, serifs just
background. None of this text was
                                                Serif versus Sans-Serif make it harder to read—the serifs can
intended to provide information; it is
## be less than one pixel and will make
just decorative. Serifs are the little “feet” on the ends of
## the text appear blurry and harder to
## letters, such as on the letter H. Printed
## read than would a sans-serif font.
## fonts that have serifs are easier to read
Type Anatomy because the serifs guide the eye along Arial and Helvetica may seem like It is important to understand the ele- the line. Serifs are found on the classic plain fonts with less personality than ments that make up text style. You font, Times Roman. This book is many other fonts, but they are easy to should know the terminology so that printed in a serif font. Figure 8.3 read in an interface. If you choose a you can talk about fonts intelligently. shows a letter that has serifs. font with serifs, you must make sure it It also makes using software to is still very easy to read in the smallest manipulate your font design much version you will use. easier when you know what all of the adjustments do.

## Type Anatomy 89

Figure 8.2 It will be very helpful to learn all of the terms used to describe text. Figure 8.3 The little strokes on the
## end of letters are called serifs.

Ascenders and Descenders have 18 pixels for Figure 8.4 diagrams several font your font, this terms. Ascenders are letters that small space will extend above the cap line, the high need to include point on most uppercase letters. room for both Descenders are letters that extend ascenders and below the base line, the bottom of descenders. One most upper and lowercase letters. of the best ways These letters are important because to get more out they affect the entire alphabet when of these 18 pixels Figure 8.4 When working with fonts, you need to consider all of creating a font for a game. If you only is to use a font the different vertical heights in a single font.
90 Chapter 8 ■ Using Text in Your Interface
wherein the descenders do not extend Many people think a bold font with Points and Picas very far below the base line. This will all uppercase letters will stand out The system for measuring fonts give you more room for the space more, but the truth is that they may allows for very precise measurement. between the base line and the mean not. The faster and easier it is to dis- This system uses points and picas as line (the x height). This is where a tinguish between letters, the easier it the basic units of measurement. Most majority of the letters of the alphabet is to read text. Capital letters are more software packages use points to meawill fall. If you can’t find a font that similar to one another than lowercase sure fonts, rarely picas. Picas are 12 fits this description, you can always letters are. It is easier for your eye points tall. A printer who is working make your own. This is a very com- to see the different shapes of with large text may use a pica as a mon solution for video game inter- letters when reading a mix of upper- measurement. faces. There are some good fonts that case and lowercase letters. Uppercase can become great solutions for inter- letters used in conjunction with low- Points measure an actual physical disfaces with some minor changes. ercase letters help to visually signify tance, like centimeters or inches. This
                                            the beginning of sentences. An all- can become confusing when working
                                            uppercase font does not give this with digital fonts. When working in a
Uppercase and Lowercase
                                            same visual signal at the beginning of raster format (images that use pixels),
Another way to avoid taking up valu- there are two numbers that are often
## each sentence. An all-uppercaseable pixel space for descenders is to used to adjust the “size” of a file—
## letters font is particularly hard to read
use an all-uppercase font. Some fonts points and pixels. These two numbers
## in block text. Figure 8.5 demonstrates
only have uppercase letters. (This is are very different, but they work
## the difference between a line of text
more common with free or inexpen- together. Understanding both of these
## that uses all uppercase letters and one
sive fonts.) You can also, of course, use numbers can help you understand
## that uses a mixture.
only the uppercase letters in a font that has both uppercase and lowercase letters. The problem with alluppercase fonts is that they are naturally harder to read than a font that uses a mix of uppercase and lowercase letters.
## Figure 8.5 It is harder to read a font that is all caps.

## Type Anatomy 91

how point size of text works in your A second number is commonly used out of large blocks of color. If you image. in conjunction with file sizes. The sec- took this image and changed only the
                                             ond number is the DPI (Dots Per DPI to 320 and left the image at 640 ×
Points are really only used in the softInch). This term comes from the 480, then the image would only be ware used to create the art for an
                                             printing industry. During the printing two inches wide, but it would look
interface, such as Photoshop. Game
                                             process, small dots of ink are laid really good because every inch would
engines are only concerned with the
## down on the paper. The more dots have 320 dots.
number of pixels. If a font is 16 pixels
## used in an inch, the smaller the dots
tall, the physical size of the text The relation of resolution, DPI, and
## must be and the crisper the image will
onscreen will vary. The size of the size becomes even more confusing
## appear to the eye. When adjusting this
television or the size and resolution of when printing. Each printer prints
## number, you are really adjusting the
the monitor will dictate how large the images at a particular DPI. This is
## physical size of an image and not the
text will appear. The size of a pixel will actually referring to the quality of the
## amount of pixels used in the entire
vary in every situation. printer and doesn’t have anything to
## image. In many cases, you can just
## do with the DPI of the image. A print-
## ignore the DPI when working with
File Size and DPI er who prints at 600 DPI is actually
## interfaces. However, if you are using
## putting down 600 dots of ink in every
When trying to manage file sizes, the physical sizes—like points and inch-
## inch. This does not mean a printer
first thing you should look at is the es—in your software, you will need to
## can improve on an image that only
pixel dimension of your image. This understand how these sizes relate to
## has 100 DPI. The printer can’t add
defines the number of pixels used in DPI. If you ignore the DPI, you also
## more color information than exists in
your images. A standard TV can dis- have to ignore any measurements that
## the file. In this case, the printer will
play 640×480. Computer monitor res- refer to physical size.
## use six dots of ink to print each of the
olutions vary. The more pixels in your
                                             If you have an image that is 640×480 larger pixels of color in the 100 DPI
file, the more space it will take up on
                                             at 64 DPI, and you printed it on a image. The image will still only look
your hard drive. More pixels result in
                                             piece of paper, the image would be 10 like a 100 DPI image when it is printa more detailed image but it also
                                             inches wide. Only 10 pixels would be ed. This concept can be hard to
means that there is more information
                                             used for every inch, so the image will understand, but it will be important
in the file and therefore bigger files.
                                             appear very pixilated—it would only if you must print your interface
                                             appear as if the image were created images. When using the image for a
92 Chapter 8 ■ Using Text in Your Interface
game interface, the only thing that is Kerning important is the image resolution. The space between individWhen these files are used in a game, ual letters is called kerning. the DPI of the file does not matter. If the amount of space What does all of this have to do with between letters is exactly type size? Understanding these rela- the same for every letter in tionships will help you understand a font, then the font is
## Figure 8.6 Letters should be spaced for maximum
how a 16-point font in Photoshop referred to as a monospaced readability, even if that means the letters are not equally will turn out in your interface. Points font. Monospaced fonts are spaced. (or other type measurements, such as hard to read, and therefore inches) are a physical size, so the they are seldom used. They Figure 8.6 shows how the spacing number of pixels a font uses changes are, however, much easier to imple- between letters varies, but the text still when the DPI of an image changes. ment in a game engine. If you notice looks as if it is evenly spaced. Text This means that point size does not that the engine is spacing using a generated by most software packages always correlate with pixel size. If you monospaced font, you may want to is typically spaced correctly; however, have an image that is 640×480 at 72 recommend an improvement to the if you plan on using large text, you DPI and you have a font that is 72 font system that adjusts the kerning. may need to do a little hand-adjusting points tall (one inch) the font will be Most game engines actually adjust to the kerning. 72 pixels tall. If you change the DPI to kerning so the fonts are more legible. 144, then a 72-point (one inch) font If you take a close look at text that is Thicks and Thins will be 144 pixels tall. typed on a computer, you will notice Most fonts have variations in the One of the best solutions to all of this that there are small differences in the thickness of the strokes that make up confusion when working with spacing between each letter. If you the letters. Times Roman is a great Photoshop is to change the units for measure between letters, the spaces example of a popular font that has fonts in Photoshop’s Preferences. If are not actually equal. Even though thick and thin parts in the letters. If you never need to print, you will only the distance between the letters is not you look closely, you can see that the need to worry about the number of consistent, the letters do appear to be font in this book has variations of pixels you are using and you won’t spaced correctly. thickness in each letter. have to deal with the DPI of an image.

## Font Choice 93

These thicks and thins are remnants of hand-written fonts. In the precomputer, pre-typewriter “old days,” text was often written with pens (and before that, with quills) with wide metal tips dipped in ink. The angle at which these metal tips were held as they touched the paper determined where the lines varied in thickness. The important thing is to keep this Figure 8.7 Keep the variations in thickness of the strokes consistent. angle consistent even when creating your own digital fonts or making adjustments to existing fonts. If the way the thick and thin parts of the lines are drawn changes from letter to letter, the font won’t be pleasing to the eye, and it will be harder to read. Figure 8.7 shows a script font that has very dramatic thicks and thins.
Scaling Fonts Avoid scaling fonts in one direction
                                            Figure 8.8 A font stretched in only one direction often doesn’t look quite right. It’s usually
and not the other. Many art probetter to choose a font that has the look you’re going for right from the beginning. grams, such as Photoshop, give you the ability to non-uniformly scale fonts. This usually makes a font hard- designed ratio of thick to thin. Fonts Font Choice er to read. If you want a tall, skinny that have been scaled this way look
## Choosing a font can be a big decision,
font, you should find a font that is like they have been stretched. Figure
## and it can take a long time to find just
designed tall and skinny rather than 8.8 demonstrates how bad a stretched
## the right font for your game. Great
stretch another font. Dispropor- font can look.
## software, such as Macromedia
tionate scaling changes the carefully Fontographer, has made it very easy
94 Chapter 8 ■ Using Text in Your Interface
for anyone to create a font, and as a were made out of bamboo or water Figure 8.9 shows several fonts that are result, there are thousands of bad puddles. Just because you are making hard to read and would not look good fonts floating around on the Internet. a Wild West game and you find a font in a game interface. There are several Web sites out there that looks like it was made out of
## You must choose the font used to disoffering a huge number of free, or wood does not mean it is a good
## play body text in a game carefully. It is
almost free, fonts. The problem with choice. In fact, a theme font is much
## more important to use a legible font
many of these sites is that there may more likely to be a bad font.
## for text than it is for headlines
only be a couple of good fonts on the
                                           There are so many bad theme fonts because body text will be smaller, and
entire site. You will probably need to
                                           out there for the simple reason that there will usually be more of it. Fonts
sort through a thousand bad fonts
                                           good theme fonts are hard to create. It used in a logo or as a heading can be
before you find a good one. Looking
                                           is much harder to create an easily larger than body text and will thereat so many bad fonts can make an
                                           readable font made out of paper clips fore offer a little more freedom. For
average-quality font look much better
                                           than it would be to just make an ordi- example, you might be able to get
than it really is.
                                           nary readable font. You can find good away with using a theme-style font in
If you are willing to purchase a font theme fonts but you need to be aware the game logo, but probably not in package, you can get hold of some that a high percentage of these fonts body text. great fonts. For example, Adobe has a are hard to read and very cheesy. variety of great fonts that can be used to achieve many different effects. If you don’t want to buy an entire font package, you can often just purchase a single font.
Theme Fonts An inexperienced designer is easily enticed into choosing a bad, “theme” font. These fonts use letters that appear to be constructed from a material that fits a theme—for example, a font designed to look as if it Figure 8.9 These fonts are hard to read.

## Creating a Game Font 95

When making a logo, I often adjust they should match, and so their slight you should be able to quickly find the letters from the standard font. I differences appear to be a mistake. one. It is also helpful to recall the font like to fine-tune the letters. Such name from memory. You can save a
## The mark of a bad designer is an
adjustments can improve a logo, but lot of time if you are familiar with a
## interface filled with a ton of different
can be dangerous—if you are not handful of good fonts that can work
## fonts. I’m sure you have had a friend
experienced with fonts, adjusting for a variety of needs.
## who gets a bunch of new fonts, and
thickness, kerning and so on can actusuddenly every document he pro- It will be helpful to have a favorite ally make a font worse. If you adjust
                                            duces has a different font on every font for a variety of styles like a script
curves of a letter, they may no longer
                                            line. Such documents are difficult and font or serif font. This knowledge can
match and look out of place. Even
                                            annoying to read. I use a pretty basic save hours of time searching for fonts.
subtle differences will be noticed.
                                            and standard font for body text in You will find that a small set of qualimost of the menus I create. I like ty fonts will work for 90 percent of the
Multiple Fonts Helvetica or Arial and use them often. things you do. Using multiple fonts in one interface I often choose another font to use for can make it more difficult to get the larger captions and buttons, and I right look—not only do you need to make sure to choose a font that won’t
## Creating a Game Font
choose good fonts, but you must also be mistaken for Helvetica or Arial. If Most game engines require that an consider whether the fonts work this second font is substantially differ- artist create all of the fonts. Some together. If you need to use two fonts, ent, then there is less chance of a con- advanced engines have tools that can it is usually best to use a standard font flict with my body text. This second take a standard font and convert it to like Helvetica or Arial with a more font is often the font that shows the the game format. Even in these cases, stylistic font. Finding two distinctive “personality” of the game. it is good to understand how a font fonts that work well together can be works because often it is helpful to very difficult, and if you don’t make a edit the font directly. You might be good choice, the results can be disasKnow Your Fonts able to make some adjustments that trous—the two fonts end up fighting You don’t need to know the name of are better than those the tool can each other. They just don’t work well every font in existence, but you make automatically. together, either because they are too should get to know a handful of fonts
## The most common format for a game
different from one another or because really well. Collect a small set of versa-
## font is white text placed in a grid. The
they are so similar that they look as if tile fonts. When a publisher or art
## files are usually square, and the
## director asks for a “retro style” font,

96 Chapter 8 ■ Using Text in Your Interface
dimensions of the entire file are a ter. The font system will then place You can hand-create each letter in power of two (128, 256, or 512). The space between this letter and the next Photoshop, but it would take much important thing to determine is how letter. If the letter extends the entire longer to do. many pixels each letter will use. Will width of the grid square, the font sys-
## Even when starting with a good font,
you create a 10-pixel tall font or an tem will stop at the last pixel in the
## you may need to touch up many let18-pixel tall font? Find out how much grid.
## ters. Very small changes to individual
space has been allotted for fonts and
                                             Transparency information must be pixels can make letters crisper and
how big your files can be. When you
                                             saved with your font file. Only certain easier to read. Look at your final font
choose the font size, make sure that
                                             file formats contain transparency and see if there is any adjustments you
there is enough room in the file for all
                                             information. This transparency infor- can make to improve readability. Get
of the letters and images that you will
                                             mation will make the file slightly larg- up close and make adjustments at the
need. You will also need to think
                                             er. If an option appears allowing you pixel level. The right touch-ups can
about how tall each letter will be on
                                             to choose the bit depth when you save really improve your font.
the screen. How much text will need
## your file, save your image at 32 bits, as
to be displayed, and how much screen Figure 8.10 shows a close up on the
## 24-bit images usually don’t contain
space will this text take up? letter S. Making slight changes to this
## transparency information. Work with
The first thing to do is set a grid to the your programmers to determine what proper size. You can then type the let- type of files the game engine will supters of the alphabet in all uppercase port. and then in lowercase. Make sure that
## You will also need to make sure your
every letter fits in the box—they can’t
## letters line up vertically. If you have
extend past the edges of the grid even
## descenders in your font, you will need
slightly. The game engine will most
## to leave space at the bottom of all of
likely look at your file and find the
## the letters. The space between letters
first pixel, moving left to right, that is
## will change, but the letters will be
not 100 percent transparent. It will
## placed in the same vertical location
consider this the start of the letter. It
## that they are in within the grid.
will then move right until it reaches a vertical row of pixels in the grid Using a standard font in a program square that is completely transparent. like Adobe Photoshop can really It will consider this the end of the let- speed up the font-creation process. Figure 8.10 Adjust the font down to the
## pixel level.

## Font Effects 97

letter can affect its appearance. If let- Typically, a text file is used to tell the Font Effects ter looks a little flat on top at regular game engine where each letter is
## Typically, it is best to leave the font in
size, you can make it appear slightly located in the font file. Numbers can
## your font file plain and white.
more round by adding a dark gray be used in this file to identify a grid
## Remember that the goal is legibility.
pixel or two above the letter. Notice square. When this number is used in
## The programmers can color this font
how these gray pixels appear at the the game, the icon will appear in this
## in the game and use the same font to
bottom of the S. spot. As always, the font system will
## create a variety of colors. If you have
## vary from game engine to game
## enough pixels in your file, then you
## engine. Talk with the programmers
Icons in Fonts can add small effects, such as a drop
## and figure out how it works in your
Fonts can be a great place to put all shadow or an outline. Just make sure
## game.
kinds of images. Numbers, dashes, that these effects don’t detract from symbols, and icons can all be put into Figure 8.11 shows a font that includes the legibility of the font. a font file. These icons and images can several icons. be used in the game just like a font. A common example of using icons in a font is when you’re creating a console game and you place small images of the controller buttons in the font. You can use these images just like a font. Directions on how to play the game can be given by simply using the font. If you have ever see a line of text like “Press [image of a button] to select,” there is a good chance the image was in the font.
                                            Figure 8.11 This font has both an outline and a drop shadow.
98 Chapter 8 ■ Using Text in Your Interface
Summary Creating good fonts is an art. Give the fonts in your interface the attention they deserve. Paying attention to the details can really help your font to be legible. Learn all you can about fonts, as you will use the information you learn often when working on video games.

## Chapter 9

Technical Requirements
## and Tricks

## learn about making video games, and File Sizes
         reating art for video games
## practical experience is the best way to
         requires a lot of technical Keeping file sizes small is key when
## go about it. Many new artist and
         expertise. This may not be you’re creating video games. Small
## designers think that they know a lot
C the fun part of making games, but it is very important. Just because you can
## because they have played a lot of
## files are advantageous for many rea-
## sons. In some cases, file size may not
## games or even made one or two. All of
create great art does not mean it will be a critical issue, but it is always good
## these artists seem to look back after
work in the game. If your art won’t to think about conserving space. If
## they have made a handful of games
work, it doesn’t matter how good it is. you can do anything to reduce the file
## and realize how little they really knew.
## size, you should. Large files can cause
You need to have both artistic skills
                                           Though creating interface art is a little unexpected problems later, and small
and technical skills to create effective
                                           less technical than modeling and cre- files can help you avoid these probart for games. The ideal game artist
                                           ating animation, there is still a lot to lems. This section will describe some
has both artistic and technical skills.
                                           learn and understand. I will cover a of these problems and suggest ways to
This may not come naturally to all
## few important technical issues in this avoid them.
artists. I have learned hundreds of
## chapter.
tricks over the years—there is a lot to
100 Chapter 9 ■ Technical Requirements and Tricks
Limited RAM amount of memory for the minimum Tip A limited amount of memory is avail- requirements for your game. Even if Just because you are allocated a cerable for use in loading all of the ele- your game is really best played on tain size does not mean you must use it ments in a game. The amount of powerful PCs, you may need to make all. When you get toward the end of the
                                          your game run on older computers as project, it seems there is always one
memory available depends on the
                                          well. Communicate with your pro- more thing to add that you didn’t think
hardware. The RAM in your PC and of before. If you have used all the space in your video card limits the size of grammers and see how big your inter-
## available to you, you’ll have to cut or
the files that can be loaded at one face files can be on the minimum
## reduce another element before you can
time. It is the same for a console or specs. add something new. handheld system. No matter how In a console game, typically smaller much memory the hardware has, amounts of memory are available for
## Being efficient with file sizes is not
there is always a limit. textures. Some systems have a block of
## always easy. It can take a lot more
There are many ways for the game memory that can be divided up how-
## time for both the artist and the proengine to use this memory. You will ever the programmer needs to divide
## grammer to make files smaller than it
need to talk to a programmer who it. You may need to share space in this
## would to just be lazy and leave large
understands how your game engine memory with sound, animations, and
## files. Breaking files into smaller pieces
works and how big your files can be in other files. In other cases, the console
## and getting palettes just right can
your game engine. Typically, a plan is has a set amount of texture memory
## take weeks—or even longer—if you
made early on, and a particular size that can only be used for textures, and
## have a lot of files. Programmers can
chunk of memory is allocated to each files such as sounds, 3D models, and
## write programs to help speed up
of the items that will need to be animations can’t be stored in this
## many of these processes, but these
loaded. You will want to know how memory. Find out how much texture
## tools don’t come free, as they require
many files you can use in an interface memory is available for your game
## a lot of time for a programmer to creand how big they can be. and keep your interface within these
## ate and modify.
## limits. Remember that other 2D files
Memory limitation on a PC is also an may need to be loaded in this same It can also take the programmer a issue of minimum requirements. Your memory. long time to write the code that will interface must fit into the allotted put together interfaces that have been
## dissected into small pieces. It is always

## File Sizes 101

faster for the programmer to take one asking too much of him, but I know it Early in the project, you need to figure big image and put it in the back- is possible to make a good game with out how much room you have for the ground, but it can really waste space. a small file size—I have created full interface. How big can your files be?
                                           3D games on consoles like the N64 Find out if the game will be on a CD
When making decisions about how to
                                           and the PS1. These consoles had very or on a DVD or how big the cartridge
create your interface and deal with file
                                           tight limits, and yet some amazingly will be, if it is a handheld game.
sizes, don’t base your decision on lazibig games ran on them. Artists always Discuss whether files other than the ness. Make sure that your approach
                                           want bigger files to create better art. game files will be on the disk.
will not limit you later or cause prob-
## The really skilled artists can create
lems. Some game-development PC games are usually distributed on
## amazing art and still keep the file sizes
schedules may call for shortcuts, but standard-sized disks, but they can also
## down.
be aware that using these shortcuts be put on a DVD. Console games are may mean that your demo level may often distributed on special disks that result in a huge download size or not Disk Space are made specifically for that console. enough room on the CD for the cool Disk space can become an issue with These disks may be different sizes Making Of video. If the game looks large-size games because, of course, than a standard CD or DVD. On a good, no one will complain because a the entire game must fit onto a CD or console, there is also often both a CD file is too small. DVD. With a PC game, many files also and a DVD. The user might not see
## need to be copied to the user’s hard the difference.
A game interface can quickly become a big space hog. If you use a new, full- drive. While many users have large You might think that the best choice size background on every screen in hard drives, you should still try to would be to use the larger disk, but your interface, your files can become limit the amount of space that is used. more space can cost the publisher big very quickly. Animations are I personally hate when games take up more money. Even a small amount of another place where file sizes can a large amount of space. Even with a extra space can add up when a lot of shoot up and quickly become out-of- big hard drive, I am often limited in copies of the game are produced. Your control. It takes some skill to produce the number of games I can have publisher will always be happy to hear an interface that looks great and is installed on my computer at once. If that your game fits on a smaller disk. small. Such an interface is something your game is taking up space on my
                                           hard drive, it better be for good rea- It is always funny to me when new
to be extra proud of.
                                           son—not just because it was faster to artists, upon learning their size restricWhen I give a new artist a file size create big files. tions, groan and complain. They seem
limit, he often responds as if I were to think that it is impossible to create
102 Chapter 9 ■ Technical Requirements and Tricks
anything good that is so small. I like to It can take a long time for the game can result in really small files because point out the history of video games engine to look in a bunch of different of the compression used in this forto such artists: Old gaming systems locations on the disk for a file or files. mat. The problem is that the comhad very little disk or cartridge space The time the game engine spends pression used in a JPG file can be for large files, and yet some of these looking for files is referred to as seek lossy. This means that some informagames were quite complicated. I have time, and it contributes to the overall tion is lost, and the files may not look worked on several projects wherein load time of the game. as good. When you save a JPG file, you the entire game had to fit on a 12M can control the amount of comprescartridge. Yes, the entire game! Online Content sion and the quality of the image.
## After being compressed, the image is
## If your game will be downloaded on
Load Time not exactly the same. Depending on
## the Internet, you need to consider
## the way the file is compressed, it can
Even if you have room on a disk to use download time and file size—this can
## affect the image differently. Colors
huge files in your interface, it may be a huge issue. This is true for small
## may slightly change or files may
take a long time to load all of these shareware games and for big PC
## become blurry.
images, and that’s not good. Have you games that have a free, downloadable ever had to sit and watch a loading bar demo. Too many developers think Be careful when using a compression for a seemingly endless amount of their game is so cool that the user will format that loses data. Once it has time before a game began? This can be willing to wait forever for it to been lost, you can’t get it back. Figure be very annoying and frustrating. download. While it might be true that 9.1 shows the difference in a file Keeping your load times fast can real- some games are worth the wait, think before and after compression. ly improve the user’s game experi- how much happier the player would Not all files use compression, and not ence. No matter how cool the game is, be if he only had to wait half as long. all compression techniques lose data. no one likes to wait a long time for it Everyone will be happier with smaller A .PNG file uses compression that to load. download sizes. results in a much smaller file, but no Loading time is not all about file size. data is ever lost. Because of this fact, There are some tricks that the pro- File Compression .PNG is a popular format for games. grammers can use to load files faster, One way to reduce size is to use com- In the future, new and improved file but the basic rule for you as an artist pression. There are many ways to do formats will no doubt be introduced is to keep files as small as you can. It is so. Some file types have built-in com- that will be even more efficient. also good to use fewer files, if possible. pression. For instance, using a JPG file

## File Sizes 103

## project, the colors are off slightly,
## banding appears, and you see other
## problems in your image, you might
## want to check and see if the files have
## been compressed. If they have, you
## might want to talk it over with the
## programmers and see how much com-
## pression is really needed and if there is
## a way to preserve more quality. While
## programmers are often efficient, they
## may not always care about the look of
## the game as much as you do.
## Compression can allow you to use
## more and bigger files in your inter-
## face, but it also can be a trade-off. If
## the programmers plan on using com-
## pression, don’t wait until the day
## before you ship the game to look at
## your interface after it has gone
Figure 9.1 You can see that the quality has been lowered in the compressed file. through the compression process. You
## don’t want the interface to look bad,
When making a game, compression is These files may need to be uncom- but you may have to sacrifice a tiny bit not only used on individual files. The pressed when they are loaded and still of quality to get more out of your art. programmers can also use compres- take up the same amount of memory. sion to make files smaller before they Using Palettes
## Even if you use a format that does not
are put on the disk. The game engine In the past, game artists were required
## lose information, when game files are
can often open files directly from this to use a palette, or small set of specif-
## later compressed it can result in a loss
compressed format. Good compres- ic colors, for every piece of art in a
## of quality in your interface. If your
sion may allow you to have bigger game. It had to be done this way so
## interface looks good while you are
files, which is always good. It will have that the whole game could fit on the
## designing, it but then, at the end of the
the biggest impact on disk space. cartridge or in memory. Cartridge
104 Chapter 9 ■ Technical Requirements and Tricks
sizes were small and the amount of entry (the color position in the Although Photoshop does a good job memory was also very limited, so palette) for every pixel. The palette of choosing colors for your palette, it there wasn’t much room for big files. can be attached to this file or even a is best, when you are creating an The need for paletted images has been separate file. The palette contains all image that will later be converted to a reduced greatly as hardware becomes of the color information. It might be palletized image, to not use a wide better. Some video cards don’t even hard to imagine creating an image variety of colors. If most of the colors support paletted images. There are with only 16 colors. 256 colors may in the image are similar, it will look still many cases where palettes can be even seem like a pretty big limitation. much better when it is converted. used, and they can be very useful. Figure 9.2 shows an image that uses a
## The images that use palettes are typiEven if you don’t use them often, it is palette. You can see all of the colors
## cally created using many more colors,
good to understand how they work. that are used in the image.
## and then they are converted to an
The color of every pixel must be image that uses a palette. There are Currently, a more common approach stored in a saved image file. When you some tools that do this conversion. than using an image with a small save a file and open it up again, the Adobe Photoshop does a great job palette is to choose a bit depth. The color of every pixel in the image must and has several be displayed. An image that uses a conversion wide variety of colors has a lot of method options. information to store when the file is Photoshop also saved. When an image is changed has the ability to from a full-color image to a paletted batch-conver t image, a specific number of colors is files (convert as used in the image. Every pixel in the many as you image must be one of the colors in the want in one palette. Typically, there are 16, 32, 64, action) for when 128, or 256 colors in a palette. The you need to confewer colors there are, the smaller the vert a bunch of file. files to images
## that use palettes
One palette can also be used for many
## so that file sizes
images. When files share a palette, the
## can be reduced.
only information the image file needs to keep for each pixel is the palette Figure 9.2 When you look at the palette, you can see all of the
## colors in the image.

## File Sizes 105

number of colors used in your image solid-color lines or solid-color boxes, The space savings of using programcan be affected by the choice of bit can be created by a programmer. Art mer art is often worth the effort. If depth. The smaller the number, the like this can be created in code and it you are creating art that could easily fewer colors will be used in your may not actually require the artist to be replaced by art that is generated by image. However, when choosing a 16-, save a file. If you need a big, blue the game engine, you might want to 24-, or 32-bit depth image, you do not background with a small image in the consider having the game engine do need to worry about which colors to center, you can have the programmer the work for you. Code used to create use, as this will be calculated for you. set the background color and you can the visual on-screen is much smaller A 16-bit image uses a limited amount provide just the small piece of art for than is a file created by an artist. of colors. A 24-bit image gives you a the center of the screen. There is no
## Good tools can help avoid the probfull range of colors. A 32-bit image reason to waste space in an image file
## lem of a programmer needing to
gives you the same range of colors as a on a solid color when it can be drawn
## make artistic changes. The rule I like
24-bit image, but it contains other by the game engine.
## to use is that if an artist must change
information, such as alpha (transWorking with the programmer to something more than once, then the parency). Of course, the bigger bit
                                           have the game engine generate images programmer should give the artist the
depth images are also bigger files.
                                           requires some effort. It is usually easi- ability to go ahead and make the
                                           er for the programmer to just use a change himself, without even telling a
Using Programmer Art piece of art from a file that was gener- programmer. The programmer can You can save space if you use pro- ated by an artist. It will take more create a tool that will allow the artist grammer art. Typically, when I use the time for the programmer to set a to make the change without writing phrase programmer art, I am referring background color or draw a thin line any code. to an image or set of images that looks across the screen than it would for
## In our background color example, the
as if it was created by someone with- him to use an image you have created.
## programmer could create a menu that
out much artistic talent, but in this This may not sound like it would take
## shows up in the game when a button
case I am referring to useful art gener- much effort for the programmer, but
## is pressed. (This only works in develated by the game engine and not by imagine if you wanted to change the
## opment, not in the final game.)
artists. background from blue to green—you
## Sliders appear that allow the artist to
## no longer have control of the backProgrammers are not known for cre- change the color and see the changes
## ground color and you have to wait for
ating great art. However, there are right in the game. Creating this tool
## the programmer to take time to
actually some good uses for program- can take the programmer even longer
## change it.
mer art. Simple pieces of art, such as than changing the color once, but it
106 Chapter 9 ■ Technical Requirements and Tricks
will result in a better game because If you are using only square textures One trick you can use to avoid this the artist can tweak things until they and you have an image this is not wasted space is to divide one texture are perfect rather than stopping when square, you may need to leave extra into several smaller pieces. If you have he believes that all the changes are space in a texture so that it fits these an image that must be 70 pixels wide, annoying the programmer. This is size requirements. You can avoid then you can cut it into a 64-pixel just a simple example. Tools written some of the problems that arise when wide image and then create an 8-pixel by the programmers can be very elab- you are meeting the texture require- wide image that contains the extra six orate. ments by planning ahead. If you pixels (two pixels of extra space). The
                                            design a button that is 33 pixels tall, it programmer will then need to put
Texture Size will require a 64-pixel tall texture. If these two images in the right place in
                                            you can design that same button one the game so that they seem like one
Texture sizes typically need to follow
                                            pixel smaller, you can save a lot of full-size image. Again, this can take a
certain rules. One of the most comwasted space. This problem is com- little more programmer effort, but it mon restrictions is the texture size.
                                            pounded at larger sizes. A 129-pixel can save a lot of wasted space.
Some PC video cards and many con-
## tall image adds another 128 pixels in
soles require that every texture
## height over a 128-pixel tall image.
dimension is a power of two. This Scalable Objects means textures can be 2, 4, 8, 16, 32, Figure 9.3 shows how you can fit a An even more advanced approach to 64, 128, 256, 512, or 1024 pixels large. non-square piece of art into a square meeting texture requirements than Often there is a size limit, and a single file. simply cutting up an image and texture can’t be bigger than 512 pixels. putting it back together is to re-use a You will also find that there are some section of art many times. A simple consoles that require square textures. example of this technique would be to Many times, the engine and the hard- create a button with a right and left ware will support a texture that is 128 end piece and a very small middle that pixels wide and only 32 tall. Your tex- is repeated. If you design your button tures do not always need to be square. in a way that there is no variation in Just remember that this could cause the middle section of the button, this problems if you ever convert the game can be a very effective method to to a platform (or support a video reduce file sizes. If you have a lot of card) that requires square textures. variation in the middle of your but-
## Figure 9.3 Notice the extra space that is
                                            needed for this piece of art. ton, this approach may not be useful.

## Scalable Objects 107

Figure 9.4 shows a simple example of ple of a scalable butpieces of art that can be put back ton, when the length together. of the button is spec-
## ified, the engine puts
## the pieces together in
## Figure 9.4 Look at
                 the small pieces that a way so that it end Figure 9.5 This button is made up of three pieces. These
                 are used to create this up with a button that pieces can be put together to make any size button.
## button. is the correct size. You
                                           can pick any length and the button quarter is left blank. The game then
I call this type of image scalable will be created out of the single piece grabs all of these pieces and can make because they offer another advantage of art. Your artwork becomes scalable. an image any width using this art. besides than small file size. The engine Figure 9.5 shows a scalable button.
## In the ideal situation, the programcan use these scalable files to create mer will have time to write a custom The second type of scalable object is
images of varying sizes. The middle tool and the interface designer can more like a box. It can be scaled both section can be repeated many times to open this tool and adjust the size of in width and height. It is very useful make the button longer or fewer times these buttons by dragging a handle. for pop-up menus. It is composed of to make it shorter. In essence, the This can all be done right in the game nine pieces, and. like the button, it can objects become saleable in the engine. engine using a small piece of art. restrict the type of box that you can The programmer can manually place design. The sides, top, bottom, left,
                                           There are two basic types of scalable and right function like the bar object
these images where they belong, but objects. The first is bar- or rectanglethere is an even more effective described above. They can’t have any
                                           shaped, with a right, middle, and left variation within the sides. The middle
method. The programmer can give piece. The file that is created by the the artist a set of parameters for sev- also needs to be pretty plain. This type
                                           artist is divided into four equal pieces of art also requires good planning. It
eral types of objects that will be and only the first three are used. The placed using method described above. works best if the corners and sides fit
                                           quarter on the far left is the left side, into a convenient size, like 32×32.
You then can create artwork that fits the next quarter is the middle of the these guidelines. The programmer Figure 9.6 show all the pieces that can
                                           button, and the third section is the be used to create a dialog box of any
can write code that supports several right end of the image. The far right of these types of images. In the exam- size.
108 Chapter 9 ■ Technical Requirements and Tricks
                                             or 160 pixels wide, using this restric- If you already have an image and you
                                             tion would allow a little more free- want to make it tile, turn on this same
                                             dom to make variations in the middle option. If you then hold down Shift
                                             section. The same principle can be and the Spacebar and click and drag
                                             applied to the box type of scalable art with the left mouse button, you can
                                             to allow the middle section to have move the image. It will wrap around
                                             more variation. The center piece to create a tiling image. If you move
                                             would have to be a perfectly tiling tex- the edges to the middle of the image
                                             ture that tiled on all four sides. you will see the seam. Simply paint
## over this seam and you will have a
## seamless, tiling image. Figure 9.7
                                             Tiling Textures shows you where to find the Define
                                             The edges of a tiling texture match up Pattern option in Painter.
Figure 9.6 This button is made up of in a way such that if you place multinine sections that can be put together to ple copies of this same texture side by Creating good tiling textures requires make many different-sized boxes. side, they will appear to be one con- a lot of skill and practice. If you make
                                             tinuous image. No visual seams will a distinctive pattern and repeat it
                                             appear. many times, the texture will look
You can add more variations to both
## tiled, even if you can’t see the seams.
of these types of scalable art if you are There are many techniques for creat- Good textures will not appear to tile. willing to limit the scaling size to ing tiling textures. I prefer the Figure 9.8 shows a texture that will increments of your grid. In a scalable approach used by Painter. This pro- not tile well. Figure 9.9 will look button scenario, the programmer gram makes it incredibly easy to cre- much better when tiled. could scale the image just a couple of ate tiling textures. If you turn on the pixels larger by using only a couple of Define Pattern option under the pixels from the middle piece. This Pattern roll out, everything you paint Alpha Channels requires all of the horizontal pixels in will tile perfectly. As you paint off the Images that include transparent pixels this middle section to be the same. In side of the image, the brush will wrap use an alpha channel. This is the part this same scenario, if the middle sec- around and begin painting on the of the file that contains the information was 32 pixels wide and the but- other side of the image. You can’t tion on which pixels are transparent ton scale was restricted to 64, 96, 128, mess up now. and which are opaque.

## Alpha Channels 109

                                                                     Figure 9.8 This texture does not tile well. You can easily see
## the repeating pattern.

Figure 9.7 Once you turn on the Define Pattern option, everything you paint will create a tiling texture.
## Figure 9.9 This
Different software handles alpha image is lost in the transparent area, texture will tile much
## better.
channel information in different and you can’t get it back. ways. Some actually show you the
## Another way to work with alphas is to
transparency in the image; the advan- transparency, so a mid-range gray
## display another black and white
tage of this approach is that you can color can be 50 percent transparent.
## image. Black represents the transparsee what the transparency will look The advantage to such a format is that
## ent sections and white represents the
like—you can see through the image. you can retain the entire image, even
## opaque. There are some file formats
The problem with this approach is the stuff in the transparent area, but
## that only store completely black and
that the part of the image that is you can’t see what it looks like with
## white images. The pixel is either 100
transparent is usually missing from the transparency added.
## percent transparent or 100 percent
the file. You can’t go back and make a
## white. Other formats store a range of
## transparent section opaque. The

110 Chapter 9 ■ Technical Requirements and Tricks
If you need transparency in your Localization piece of art will need to be created for image, you will need to save your file every new language. If the program-
## Localization is a term used when a
in a format that has the transparency mer has set things up correctly, and all
## game is changed to adapt to a differinformation. Check with the pro- text uses the font system, all of the
## ent area of the world. The biggest part
grammers to see which file formats current text can easily be replaced.
## of this change is usually a change in
the game supports that contain this
                                            language. When a game is localized, it Often, when a word or phrase is
information. If you save into a file
                                            usually must be translated into sever- translated, the results are longer than
that doesn’t have this information, the
                                            al different languages. This can be a the English version. This can cause a
transparency will be lost and the
                                            simple or a very complex process. It is lot of problems if there is no extra
entire image will become opaque. If
                                            best to plan from the very beginning room in your interface design. The
you convert a file without transparento make translation easy by setting up best way to avoid running out of cy to a file that saves this information,
                                            the game correctly. If it takes a lot of space is to leave a lot of extra room
the transparency will not magically
                                            effort to change a language, it will be wherever text appears in our interface
reappear.
                                            much more expensive to create the even in the English version. If the text
Some engines save space by using a new version. This may discourage the is tight, be aware that this might be color key instead of saving the trans- publisher from putting money into problematic in other languages. parency information. Instead of sav- creating multiple versions of the ing this extra information—which game, resulting in fewer sales. If there makes the file bigger—the engine rec- is even a remote chance that your
## Source Files
ognizes a certain color as transparent. game will need to be translated, it is Source files are art files used to create Solid black is sometimes used, but it best to work in a way that will make the final assets that go into the game. can cause problems because you can translation easy. Final assets are the files actually used never use solid black in your image, as by the game engine. You may typicalThe best way for an interface designer ly work in Photoshop using many layit will become transparent. Another
                                            to prepare for localization is to never ers and effects; then, when you are
solution is to use a color you will
                                            put any text in the art. Make sure all finished with your design, you will
never find in your game, such as hot
                                            text is in the font and the text is gen- need to save it to a file that will be
pink, and use this color as a color key.
                                            erated by the game engine. This may used in the game. For example, the
A limitation with this format is that
                                            limit some of your text effects, but it is game may actually use a PNG file.
the transparency has a harsh edge.
                                            well worth it. If you put anything that This final file does not contain all of
Every pixel is either 100 percent trans-
## needs to be translated in the art, a new
parent or 100 percent opaque.

## Summary 111

the layer and other information that Summary may be contained in the Photoshop
## Technical issues abound when creatfile. This source Photoshop file should
## ing an interface for a game. File size
never be placed with the final assets
## has a big effect on your game, and
that get shipped with the final game
## there are a lot of ways to reduce file
because it would take up unnecessary
## size. Reducing file size has an effect on
space, but it should always be saved in
## what can be loaded in the game, loadanother location. You will probably
## ing speed, how much disk space is
need to make changes, and it will be
## used, and download times. You will
much easier to go back to the original
## need to make sure that all of your 2D
file to make changes than it will be to
## art works under the restrictions of the
adjust the final asset.
## game engine.
It may not be necessary to have a source file for every final asset in the game. In fact, it can be very efficient to have multiple final assets come from one source file. If you create a button that will be re-used throughout the game but different images, icons, and effects will be used on this same button, you can put them all in one file. By turning on and off layers, you create all of the final assets.

## This page intentionally left blank

     Chapter
       10

## Tools of the Trade

## they help speed up the process and Tools for Creating
         s an interface designer, the
## produce a better final game, they will
         only way to get your job done Mock-Ups
## pay for themselves very quickly. This
         right is to have good tools at The term mock-up refers to a piece of
## does not justify buying extra software
A your disposal. I am not talking about a hammer or a wrench—I am talking
                                            for fun, but you should get the tools art that is created to look like an interyou need. face. The reason for creating a mockabout powerful software that can help up is not to have art that is ready to be
you prepare artwork for a video game. This chapter will cover information used in the game, but to establish Software alone won’t create a great about software tools that can help you what the interface will look like. You interface—solid design skills are a when you’re designing interfaces. can create a mock-up without even must—but without good software There are several commercial tools knowing what options will appear in applications, you won’t get far in this that can be quite useful, but they may the final game. business. not do everything you need to do.
                                            Custom-written tools can do amazing Creating mock-ups early in the design
Good software can be very expensive. process can save time and ensure that
## things. You may be able to have better
Commercial software can come with everyone has the same vision of the
## tools created for you if you know
a big price tag, and internally written final product. Mock-ups are invalu-
## what to ask for.
software can cost a lot to create, but if

## 114 Chapter 10 ■ Tools of the Trade

able—not only do they allow you to a mock-up with movement that looks Asset Management solidify your design, but they also give and even functions just the way you
## Asset management is a large, complex
you something visual to present to want it to can be particularly useful
## topic, and the methods and theories
anyone who needs to approve the art. when you are in a situation where the
## behind asset management for video
You can get approval before the art is programmer will have control over
## game development could easily fill an
actually in the game engine. A mock- motion. In a situation wherein you do
## entire book. I will simply give you a
up can also help to pacify those who not have the software and tools to
## brief introduction and describe some
may be concerned about the quality control the movement in the game
## of the tools that might be used by an
of temporary art. If a producer or art interface, and you have to rely on a
## interface designer.
director happens to see incomplete programmer to make the motion look art in the game, you can assure him good, an interactive mock-up can By the time a game is completed, a that it will look like the mock-up help. If the only thing you will give the truckload of assets have been created when the game is complete. Anyone programmer is motionless 2D art, he along the way—including all of the can look at a mock-up and know what will have to make his best guess at files used in the final game and all of the final art will look like before it is what the motion should look like. the other files used during the develever implemented in the game engine. opment process. All of these files need
## When creating an interactive mock-
## to be backed up and distributed to the
Many commercial tools can be used up, the interface designer can work
## entire team working on the game. If
to create a great mock-up. Use the out animation and button behavior.
## you’re working on a team of 15, and I
software that you know best and that You can get everything just the way
## change 30 files in the interface, then
allows for quick and easy adjust- you want it. The programmer can
## all 14 other people on your team need
ments. Adobe Photoshop is one of my refer to this mock-up, and there will
## to get these 30 files working in the
favorites. It is easy to keep everything be no question how the interface
## game. Hand-adding all of the changes
is separate layers and easily make should be done. It is always a better
## for each of the 14 team members
adjustments. situation when the interface designer
## could take forever. At the same time,
## has direct control and can change
When most people think of a mock- you need to collect and keep track of
## things in the game, but if this is not
up, they picture a still, 2D image. all of the changes the 14 other people
## possible, an interactive mock-up can
Mock-ups can go beyond the still might make to the game every day. All
## solve a lot of problems. Chapter 15
image. Tools such as Macromedia of this falls under the category of asset
## will describe how to use Flash to creFlash will allow you to mock up management.
## ate an interactive mock-up.
## movement and interactivity. Creating

## Using Custom Tools 115

There are commercial tools, such as transfers all of my changes to a central This is the area wherein custom tools Alienbrain, that are made for art asset location where everyone else on the for interfaces seem to be the weakest management. These tools are great team has access to them. When I am in the game industry. There aren’t and are much more stable than cus- ready, I can get all of the changes from many tools that I have seen that do tom tools. The problem is that they the other team members by pressing this very well. There may be some can’t do anything specific for your yet another button in the tool. great tools that work directly with the game engine. Custom tools not only game engine, but for the most part,
## This is a simple description of a commanage your files, but they can do everything is a modification or use of
## plex tool. It is just important to
specific tasks that relate to your game. a commercial tool.
## understand the basic concept because
A custom tool could distribute your
## when you make a game, it is likely that
changes to everyone on the team and
                                            you will need to use a similar tool. Using Custom Tools
could rename files when they are copied to a final directory, so that they Some of the best tools for working will work properly in the game Adjusting Game with interfaces are created specifically engine. for the game engine. An internally
                                            Properties developed tool can be a simple
The company I currently work for has Another common type of tool in exporter that helps get information a comprehensive file-management game development is one that edits from commercial software into the system. It is a great example of how a and changes things in the game. A game format. Many game developers custom tool can be used by an inter- level editor is a great example of this hire programmers specifically to creface designer. I create new files and kind of tool for level designers. An ate tools for making games. These can make changes to the interface on my example of this kind of tool for an be art tools, tools for level design, or computer. I can then press one button interface designer would be a tool even audio tools. Custom tools can be and see the changes in the game. with which the interface designer developed for just about anything. A These changes only affect the game on could place buttons, create interface tool can be a very complex piece of my computer; this is good because I animations, control the flow of the software that is used for creation, anidon’t want to change something and menu, and adjust many other game mation, or adding functionality, or it mess up the game for everyone else. properties. This data could then be can be a simple script that moves files Once I have made all the changes that put directly into the game and any from one directory to another. This I want and I am satisfied with the changes would be in the game. software is owned by the development results, I hit another button that company or the publisher that pays

## 116 Chapter 10 ■ Tools of the Trade

for its development. Typically, these names these files for you, there is example, a custom menu could tools are developed for internal use much less chance of a mistake. appear that would allow you to select only, but occasionally a developer Another good use for custom tools is a property of a piece of art for the decides to sell a tool to another devel- to perform tasks that can’t be done game. You could set a button to blink, opment company. with a commercial tool. If you want and it would automatically blink in
## something different than is offered by the game.
Unfortunately, tools for interfaces
## a commercial software application, it
seem to be less common and a lower The disadvantage to adding anything
## may be a good idea to consider develpriority than tools for other parts of a more than properties that need to be
## oping your own internal tools.
game. Many game engines have a level exported in a plug-in is that if someeditor and exporters in which a lot of It is impossible to describe all of the thing changes later in the developgame-specific properties can be set, possibilities for custom tools, and it is ment process, you may need to rebut very few seem to have robust also impossible to tell you how to use export every file in order to change a interface creation tools. them. Every custom tool is different, property. If you use a separate tool to
                                            and they vary from company to com- set these properties, then it is much
Many different tools could be custompany. The important thing to under- easier to make changes later. You written for use when working specifistand is that you can get what you won’t even need to open up the comcally with interfaces. It is important to
                                            want. If you need a custom tool or are mercial tool to make the changes.
think about the possibilities and
## already working with one that doesn’t
determine how useful a custom tool
                                            quite suit your needs, make sure you Stand-Alone Software
would be. You can waste time doing
## let your wishes be known. The prothings by hand that could be more A stand-alone software tool is a soft-
## grammer may not know what would
quickly done with a tool, but on the ware application that is not a plug-in
## help you the most.
other hand, you also could use valu- or a part of a commercial tool and is able programmer time to create a tool not directly a part of the game engine. that does not save much time. Plug-Ins The best example of this kind of tool Using tools to do repetitive tasks can One approach to creating custom is, again, a level editor. A tool that also improve your accuracy. For tools is to create a plug-in for a com- could load up 2D files created in a example, when you have to save a mercial software program. The obvi- program like Photoshop and allow hundred files and name them all cor- ous use of a plug-in is to save the file the interface designer to place these rectly, it is easy to make a mistake. into the proper format. This is a great files in the correct locations, add With an exporter that saves and place to put a lot of control. For movement, and set the behavior of

## Disadvantages of Using Custom Tools 117

each button would be a great example know it will work in the game. For bugs and problems than do commerof a stand-alone tool for interface example, you usually won’t find a cially tested tools. Custom tools are design. The resulting file would then Drop Shadow feature that won’t work often under constant development be saved or exported for use in the in the game. The interface and pro- and features are added frequently. game. This tool could be very limited gram are created specifically to help New features may have just been or very comprehensive depending on you create game interfaces and the added yesterday, and so they haven’t how well it was developed. same software is not used to create existed long enough to be fully tested.
                                          Web pages. You won’t run across extra A new version of the interface tool
In-Game Tools features that you would find in com- may have a lot of cool new features,
                                          mercial software. but if it crashes every time you export
There are many tools that would be
## something, your progress in finishing
most effective if they were accessed If you work with the programmer
## a game interface will be severely
from within the game engine. This who is making the tool, you can ask
## impeded.
type of tool is most effective for him to make the tool work the way changes that can take immediate you want it to and to add the features Custom tools can also be much hardeffect in the game. If, while playing you need. Most internal tools are er to learn for a new designer, and the game, you could bring up a menu always changing, and features can be they may come with little or no docuto make a change in the game it could easily added. If you take advantage of mentation. If you’ve been working save time. The tool described in the the opportunities custom software with a custom tool from the begin- “Stand-Alone Software” section could presents, you can really speed up your ning of game development, you may be actually integrated into the game workflow. find it easy to use, but if you are handengine. ed a tool late in development you may
## have to scramble to learn how to use it
                                          Disadvantages of effectively. With some tools, there are
Advantages of Using Using Custom Tools often important steps that must be Custom Tools One disadvantage of custom tools is followed in order to accomplish cerOne of the advantages of working that they can be expensive to develop. tain tasks, but no way to know what with highly developed, custom tools is It may cost less to purchase a com- those steps are unless someone who that they usually have the exact fea- mercial tool than it would to pay a knows them shows them to you. ture set that is supported by the game. programmer to develop a custom Sometimes, experienced designers If you can do it with the tool, you tool. They often have many more have gone through the process so

## 118 Chapter 10 ■ Tools of the Trade

many times that they forget to tell the find very few custom tools that are help you create a great interface. A new guy about a critical step. The used for painting 2D images. product like Photoshop is a great game may crash because new inter- Commercial tools are a great solution example of a tool that is used by many face art has been added and a rule has for painting pixels. game developers. You can take advanbeen broken. It can be as simple as not tage of any publicly released plug-ins putting a colon in front of the name Advantages of Using that have been created by other game of every button or checking the Commercial Tools developers. wrong check box in an exporter.
                                          Commercial tools are usually very sta- In addition to the plug-ins available
                                          ble. They are usually heavily tested for purchase, there are many free
Commercial Tools before release, and most bugs and plug-ins. When working with custom A commercial tool is software that is crashes are found and corrected. software, the only extras you can get available for purchase by anyone. It is will need to be created in-house.
## Commercial software can be expennot created specifically for your game sive, but if you compare the cost of
engine, and when it comes to inter- commercial software to the cost of Disadvantages of Using faces, the tools may not have been paying a programmer to create a tool Commercial Tools made specifically for game interface in-house, buying commercial soft- Commercial tools don’t always creation. There are many commercial ware actually seems quite inexpensive. include the exact functionality that tools that can be used for creating an Buying and using a commercial tool you need for your game. When using interface, such as Photoshop, Flash, can often save money in the long run, commercial software, you may need or Painter. Rarely does an interface even if custom exporters need to be to work around the existing features. designer create an interface from written so the tool can be used. You may need to find ways to get start to finish without using at least functionality from the software that it
## Many of the big commercial tools
one commercial tool. In many cases, was not created to do.
## have additional support from other
a commercial tool may be the only
                                          companies. Other companies provide I have used Photoshop to perform
tool used by the artist to create an
                                          extra features that you can add on to tasks not intended by the original
interface.
                                          the base software. These features usu- software developers. I named layers in
It may not be smart to use a custom ally come in the form of a plug-in that such a way that the exporter could tool to do something that a commer- is simple to add. Plug-ins can do all recognize what they should be used cial tool already does well. You will kinds of cool effects that can really for. A button in the normal state may

## Commonly Used Commercial Software 119

be on one layer and the highlighted Middleware not in the actual game. This can be state on the other. An exporter was helpful when, for instance, you need
## Software options exist that are sort of
written that recognized each layer that to figure out whether something not
## in-between custom software and
was named correctly and saved it in working correctly is a problem with
## commercial software. Game engines
the correct format. Solutions like this the art or with the game engine.
## can be purchased and used to create
can be a good workaround, but a cus-
## games. Most of these game engines
tom tool could make this process
## come with exporters and other tools Commonly Used
much easier. The artist wouldn’t need
                                           that are used during development. Commercial Software
to remember exactly how to name
## These products are technically comevery layer, and a typo wouldn’t cause There are many options for commer-
## mercial tools because they are sold
problems. Instead, the custom tool cial software you can use to create
## and used by many game developers.
could have a check box for each layer. interfaces. Each has a different way of
## They are similar to custom tools in
You can use many features in com- that they are written specifically for doing things and has advantages and mercial software that may not be sup- making games. Often, you can also get disadvantages. There is no one best ported in the game engine. For exam- the source code that will allow a pro- solution. The best tool is usually the ple, the Renderware engine can use grammer to make any changes that one that the artist knows best. It is Flash files to create interfaces, but it are needed. These game engines and much easier to be efficient if you does not support any of the features tools are often called middleware. already know how to use the software. in the latest version, and only a very There is one important benefit to
## The tools that come with the middlelimited set of the old features will using the most common software in
## ware engines can be simple exporters
work in the game. Because the soft- the game industry, though: Files can
## or very refined tools. There is a wide
ware was not written specifically for easily be transferred to anyone else
## variety in the quality and flexibility of
the engine, it can become confusing. with the same software. Often a pub-
## these tools. Some are much more like
You will need to be aware of the game lisher will have art created by other
## commercial software and others are
engine limitations and make sure that artists from a previous version of a
## exactly like something made inall of the art created in the software game or even a similar game, and it is
## house. Most of the big-name engines
will work in the game. more likely that you will be able to use
## have really great tools. They come
                                           with exporters from most major soft- these files if you have the standard
                                           ware applications. They have tools for software. It is also easier to find a job
                                           viewing art with the game engine but when you have experience in the soft-
## ware that is used by most studios.

## 120 Chapter 10 ■ Tools of the Trade

The most common commercial tool Another very popular tool for creat- Renderware, that have tools to conused to create interfaces is Adobe ing interface interactivity and anima- vert Flash files into game format and Photoshop. It has been around for a tions is Macromedia Flash. Like get the animation and interactive long time, and it has a lot of useful Photoshop, Flash is a commonly used information from the Flash file into features. It is overwhelmingly popular software and I know it well. There are the game. Figure 10.2 shows in the video game industry, and is also some middleware tools, like Macromedia Flash. used heavily in many other industries like Graphic Design, Photography, and Illustration. If you make video game interfaces, you will use Photoshop at some point.
Note
      I do use other tools for specific tasks,
      and I don’t mean to rule out any other
      options, but I will describe techniques
      used in Photoshop later in this book
      because I know it well and I believe it
      will be the most useful tool for you as
      an interface designer. Figure 10.1
      shows Adobe Photoshop.
                                                 Figure 10.1 Photoshop is a great tool for creating interface art.

## Features of Good Tools 121

## Features of Good Tools
## The mark of a good tool is that a new
## artist can use it to get art working in
## the game engine without help from
## anyone else. A good tool should have
## a user-friendly interface—the easier
## the tool is to learn, the greater the
## chance it will be fully utilized. A fea-
## ture that is hard to use may simply be
## avoided. It should be simple to make
## changes and get things just right in
## the game. You should be able to make
## all the changes you want and instant-
## ly see how it works in the game. This
## will speed up production and encour-
## age fine-tuning that will improve the
## game.
## The shorter the time from art creation
## until the art is actually in the game the
## better. In the ultimate situation, the
Figure 10.2 Flash is a great tool for creating animation and interactivity for interfaces. artist could hit one button and
## instantly see the art in the game. Once
## it has been set up properly, the artist
## would not even have to choose a des-
## tination or name of a file—it would
## all happen automatically. It should
## also be easy to get art into the final
## game. No other team member should
## have to stop what he is doing to put
## new art in the game.

## 122 Chapter 10 ■ Tools of the Trade

Good tools do save you time. As an interface designer, you’ll rarely would really speed up the process or Efficiency is the purpose of tools. The get to use perfect tools—there may be help produce a better final result, you extra speed that tools provide should no such thing. This shouldn’t discour- should not hesitate to buy it. It is simnot only apply to the first time a piece age you, though. Even if you can’t ply important to understand that of art is created and put into the work under perfect circumstances, it great software does not create art by game, but the tool should allow for helps to know what could be possible itself any more than a great painteasy adjustment. A tool that is capable and try to improve the tools and brush paints a picture by itself. In the of this type of efficiency often process anytime you can. end, the skill of the artist is what matincludes features such as easy to use ters most. batch file processing. If the same
                                           Software or the Artist? You could spend all of your time tryadjustment needs to be made to hunI have heard so many artists say that ing out every new plug-in and all the
dreds of individual pieces of art, batch
                                           they could create perfect art if they newly released software. It is good to
processing can be a lifesaver.
                                           just had one more piece of expensive know what is available and to keep
                                           software. They are convinced that one current, but it is important to spend
The Ideal Situation versus your time on the relevant software
## specific plug-in will solve all of their
Reality and, most importantly, to develop
## problems and improve their art. I
As it is with many other parts of game have also seen many of these artists good design skills. Many artists waste development, few interface artists get the new piece of software and still their time learning new software and have access to the perfect tools and have all of the old problems—expen- trying out new techniques and never ideal processes for creating game sive and cool software can’t turn a bad really produce any great art. I am interface art. The ideal situation artist into a good one. On the other much more impressed with a portfowould be to have bug-free, easy-to- hand, I have seen good artists create lio full of art than I am with a list of use custom software that has a com- some amazing art with really bad soft- programs that you have used. Anyone plete set of relevant features—all the ware. Software does not create art, can learn to use software in a short advantages of commercial software. artists do. period of time. It is much more diffiSuch an ideal situation only occurs at cult to learn good art and design companies that have enough I don’t mean to imply that software skills. resources and money to create this can’t help in the development process.
                                           Software is essential and very impor- It is also important to keep software
ideal tool. Even though the tools you
                                           tant, and if there is some software that from driving the creative process. A
will use often have shortcomings, they
## new plug-in that creates a cool neon
can be very useful.

## Software or the Artist? 123

glow effect may be perfect for the If you want to improve your inter- that are creating art for the rest of interface of a game that takes place in faces, the best place to start is with your game. In fact, it may be even Las Vegas. This same effect may not be your design skills. Study some of the harder for you to use 3D art in an great for an underwater submarine basics of design. It also helps to look interface than it is to use this art in the game. Even if it looks cool, make sure at a lot of great art and design. Games game. You may need a couple of feait also works well with your game. Too are not the only resource. I subscribe tures that are specific to the interface. often, an artist gets a new plug-in and to magazines like Communication Art For example, you might need to conuses it on everything. and buy design and illustration annu- trol the camera paths for the interface,
                                               als. Take the time to understand why and camera paths may not be used
Some people seem to think that a
                                               the art and design you discover is so anywhere else in the game. If the progood piece of software does all the
                                               effective—if you can define why it is grammers are going to grant you this
work for the artist. When I tell such
                                               so much better than mediocre art and control, they may need to upgrade the
people that I have painted a picture
                                               design, you can apply these principles exporter to get this information out
digitally, they act as if it is much less of
                                               to your own art. Develop the ability to of your 3D software and into the
an accomplishment than if I’d used
## critique your own art. It can be very game.
paint and a paintbrush. I have to
## easy to find problems with the work
admit that there are some serious The struggle to determine the best 3D
## of others, but much harder to see the
advantages to producing art digitally. software can be brutal. Many 3D soft-
## faults in our own work. Remember
For example, contrast, color and ware users are very loyal to their
## that art and design skills are more
brightness can be easily adjusted after favorite software package and they
## important than software.
the image has been created. Mistakes take offense at anyone else who are much less permanent. Even with expresses a different opinion. But the these digital art advantages, good art 3D Tools argument is pointless, as there is realrequires good art skills. I am just as When you create a 3D interface, most ly no one piece of 3D software that is impressed with an artist who has likely you will use the same tools used better than another. The current top learned how to use a pressure-sensi- to get the 3D models and animation two most popular packages are tive tablet to paint a picture as I am into the rest of the game. Using 3D art 3Dstudio Max and Maya. Each has its with an artist who can use a paint- is inherently much more complicated pros and cons. It is impossible to realbrush. than creating 2D art, and you will ly know which is best for your game
                                               encounter all of the obstacles that unless you are an expert in both.
## exist for the modelers and animators

## 124 Chapter 10 ■ Tools of the Trade

Many artists are enticed into learning The bottom line is that there is a lot of and using just one of these tools great 3D software. As I’ve said, the because it was used for a particular best tool is the one you can use the movie or because it was used on a best. If you know it better, it is better particular game. I would suggest that for you. There may be an instance you avoid professing your ignorance when you need to do something very by claiming that the software you use specific and a particular piece of softis better unless you really know both ware actually is more efficient in this well. If you want to learn 3D but you area than the one you usually use. If can’t decide which software to learn, I so (and often it is more about not would suggest learning the product knowing how to do it in the other used by the game development studio software), you also need to consider at which you want to work. the learning curve—will you really
## save time by changing? Go with what
In order to make a fair comparison of
## you know.
software, you need to be an expert in the current versions of the programs you want to compare. Of course, it is Summary hard to be an expert in both software You should always do your best to packages because there is so much to work with the most efficient tools learn. I have heard convincing argu- possible. You will still need art and ment for both 3DStudio Max and design skills but good tools can save Maya. You can’t compare the latest you time. In most cases, you will use a version of Maya with a version of Max combination of commercial software that you used several years ago or vise applications and custom software versa. They both have undoubtedly written specifically for your game. added new features in the latest ver- Both have advantages and disadvansions. tages. You should make the most out
## of the tools at your disposal.

     Chapter
       11

## Using Animation

                                          Movement ment on the screen. Animating intern this chapter, I will describe
## faces can take a lot of time, so includsome basic animation principles. Movement carries great visual power.
## ing animation on small-budget games
     Artists creating traditional hand- If something moves, it will catch the
## is not always possible. But if you have
I drawn animations first conceived these principles, but they can be
## viewer’s eye. Movement will usually
## draw more attention than any other
## time, make it move. Animations can
## bring your interface to life. Still
applied any time you use an anima- technique. Remember this when you
## screens are boring, and a game, of
tion in an interface. Understanding are animating an interface—think
## course, should be entertaining.
animation can really help you to cre- about what you want the user to see, ate movement in your interface. The and don’t create extra animations that animation in your interface could be draw the user away from actually How Animation Works as complicated as a full 3D-animated using the interface. Animation, as you probably know, is character or as simple as a button that When designing a game interface, you an illusion. Nothing is really moving. slides on and off the screen. should do your best to never have a During animation, a bunch of still
                                          static screen. Always have some move- images are flashing in front of your

## 126 Chapter 11 ■ Using Animation

eyes so fast that it looks as if the image (NTSC). When playing video games, Interface Frame Rates is moving. This is the same way that it is very important that the game A game interface is not the most film works: Movie cameras take a reacts quickly and all of the anima- important place to have a high frame bunch of still photographs every sec- tions look very smooth. Because the rate. Because the user does not need ond, and when they are played back, it user is watching every movement to react to the animations in the interlooks like the objects or people in the intensely, even slight differences in the face, the animations can usually run film are moving. These images are frame rate can be seen. A game that at a slower frame rate. It is still imporplayed back so fast that the human eye runs at 60 frames per second appears tant to know at what speed the intercan’t tell that they are actually still even smoother than one running at face will run. If you are creating indiimages. 30 fps. Frame rates faster than 60 fps vidual frames for an animation, then
                                              are not really detectable by the human you will need to know how fast they
Frame Rate eye. will be played back. One thing to Some of the terms that we use in dig- So why doesn’t every game run at 60 remember is that an animation can be ital animation come from the begin- fps? Well, it takes computing power to played back more slowly than the nings of animation and live-action draw each screen. The more calcula- game engine is actually running. For film. Each of the still images in a tions that must be made for each example, if one image is displayed for movie is called a frame. During a frame, the longer it takes to draw the two frames, the animation can run at game, images are drawn on the screen. Every polygon, animation, 15 fps, even though the interface is screen. Each one of these images is a texture, and effect in a game requires actually running at 30 fps. motionless image is also called a a calculation to be made by the hard- The reason for playing back an animaframe. The speed at which these ware processor. The more of these ele- tion at a slower frame rate is to save images are played back is called t ments that are used in a game, the space. This is effective when you have he frame rate. The frame rate actually slower the game runs. If every game pre-rendered frames that play back in represents the number of these ran at 60 fps, the game would have your interface. A one-second animastill images that are displayed every fewer polygons, textures, and anima- tion at 15 frames per second can be second. tions. Many games run at 30 fps and half the size of a 30-frame animation
                                              still look great. If a game drops below that also only lasts one second.
Standard video is shot at 30 frames a
## 30 fps, though, the movement
second. A television is capable of
## becomes choppy.
updating up to 60 times a second

## Key Frames and Tweening 127

Key Frames and became known as tweening and the Interpolation
                                             frames became know as tweens. The term used to describe what the
Tweening Tweens made smooth transitions computer does when it calculates the Back when animations were all drawn between the key frames. Creating frames in between the key frames by hand, animators would choose the tweens was time-consuming, but (tweens) is interpolation. Most animaimportant frames and they would actually required less skill than defin- tion software packages’ default draw the character poses at these ing the key frames. If the key frames method for calculating the tween important frames. These important were done well, the animation looked frames is referred to as ease in and ease frames are what defined the object’s good. out. In real life, most motion does not movement, and so they became
                                             Modern animation software works in start and stop abruptly. It starts slowknown as key frames. Creating good
                                             very much the same way. The impor- ly and then speeds up. It reaches full
key frames was one of the most
                                             tant task for the animator is to set key speed in the middle of the motion,
important aspects in creating a good
                                             frames. The object’s position, rota- and then there is usually a slowdown
animation. The experienced artists on
                                             tion, and scale (along with any other at the end, before the object in motion
an animation project were given the
                                             animated properties) are defined at comes to a complete stop.
responsibility of drawing these key frames. each key frame. The computer does Figure 11.1 shows all of the frames
                                             all of the tweening. The animator will that might appear in a simple animaLess experienced artists would then also have some control of how the tion that is easing in and out of the
draw all of the frames that appeared computer does the tweening between key frames. The frames that are closer in between the key frames. This the key frames. together will appear to move slower.
Figure 11.1 The motion changes speed during the animation.

## 128 Chapter 11 ■ Using Animation

The frames in the middle are further of the four quarters of the circle, the right half of Figure 11.2 shows you apart and will appear to move faster. default settings will not be smooth. what would happen in this same situThe motion will start slow and end ation without ease in and ease out. Most animation software applications
## slow at each of these key frames. In
allow the user to adjust the amount of Tip
## this case, you wouldn’t want any ease
ease in and ease out that is used to calin and ease out. You would want the Most animation software allows you to culate the tween frames. Usually the
                                              software to use what is called linear create a path (a circle) and move an
default ease in and ease out works object along this path when you want
## interpolation. In the left half of Figure
well, but this is not always what you an object to travel in a circular motion.
## 11.2, you can see what would happen
want. For example, if you want an This would be a much better solution
## if you set a key frame at the point of
object to spin smoothly around in a than creating key frames.
## each of the red circles. The motion
circle, and you set key frames at each
## would speed up and slow down. The

Figure 11.2 The motion on the left would seem jerky, not smooth.

## Animation Principles 129

Animation Principles remains perfectly round during the becomes thinner and taller. Once it
                                            entire animation, it will not look con- reaches the peak, it returns to the
Back in the 1930s, Disney animators
## vincing—it would not seem very round shape.
came up with a list of animation prin-
## bouncy. In real life, when a rubber ball
ciples. These principles were meant When you’re creating an interface,
## comes in contact with the ground, it
for character animation, but many of using squash and stretch can help give
## squashes down and becomes wider
them can be applied to game interface your animations a lot of personality.
## and shorter. As the ball bounces off
animation as well. In the next sec- If your interface includes a character
## the ground and begins to move
tions, I will cover the principles that bouncing a ball, the application of
## upward, it returns to the round shape.
are the most useful for interface ani- this principle may be obvious (see
## On the way back to the peak of the
mation. Figure 11.3). But squash and stretch
## bounce, the ball actually stretches and
## can be used in many other ways. Any
Squash and Stretch When some objects move, they change shape. This change in shape can be caused by the motion or because the object has come in contact with another object. This change in shape is called squash and stretch. Many objects are not rigid and solid. The softer the object, the more change there is in the shape of the object. This change in shape can really add life to an animation. An object that doesn’t change shape can seem as if it is made of metal or stone. If an object really changes shape a lot, it can seem as if it were filled with water. The classic example of the squash and stretch is a bouncing ball. If the ball
## Figure 11.3 The ball changes shape during the animation.

## 130 Chapter 11 ■ Using Animation

of the animated shapes or objects made—a sort of “wind up” before Just by adding a couple of frames of could change shape as they collide or making a big move. The bigger the anticipation, you make the animation come to a stop. You could even give motion, the more exaggerated the more interesting to watch. Figure 11.4 your buttons a different feel as they anticipation should be. Anticipation shows motion with anticipation slide onto the screen. Once they reach is a great way to emphasise move- applied to an interface button. their final destination, they could ment. stretch a little and then return to the Ease In and Ease Out
## The classic example of anticipation is
regular shape to give them a squishy
                                            the wind up before a cartoon charac- Most motion in real life does not
feel. The bigger the shape change and
                                            ter takes off running. The character move at the same rate during the
the more times an object bounces
                                            rears back and poses briefly before entire movement. It is a matter of
back and forth before it returns the
                                            shifting all his weight forward and physics. It eases in to the movement
original shape, the squishier it feels.
                                            beginning to run. This anticipation and eases out. When a movement
This type of animation can also create pose can almost be more important starts, it takes a while to get up to full a very fun and cartoon-like feeling. than the run. speed. Movements also can’t stop What kind of material do you want instantly. They must slow down as the
## Anticipation is typically found in
the user to believe the animated motion comes to a stop. This is the
## human or animal animation.
object is made of? Your answer will reason why many software packages
## Applying this principle properly can
determine how much squash and have this type of movement as a
## really add life to an animation. Even
stretch you will use. If your buttons default. (See the beginning of this
## an inanimate object can come to life
are made of metal, they may not chapter.)
## with a little anticipation. Anticipation
change shape at all. If they are made
                                            implies that the object that is moving If your software does not have an ease
of a rubber filled with thick goo, they
                                            is thinking about the next movement. in and ease out setting, you may need
may deform a lot, but may move
                                            It is “anticipating” this next move. to control this by hand. Even a button
slower than a water balloon would.
                                            A simple application of anticipation that flies onto the screen and stops
                                            in an interface would be to add a little suddenly will look strange. You can’t
Anticipation have a button moving full speed in
## bit of anticipation to the movement
Anticipation is movement in the of a button. Once a button has been one frame and completely motionless opposite direction of the main move- selected, you can move it backward in the other without the stop looking ment, just before the main moment is before sliding it forward offscreen. abrupt to the viewer.

## Animation Principles 131

## and hair keep moving for a moment
## before swinging back into a resting
## position. Not only do the appendages
## keep moving for a while, but even the
## object itself moves beyond the mark
## and then returns back to the final
## position. The distance the objects
## move beyond the mark and the
## amount of time it takes to return to
## the final target position are based on
## the speed and size of the object.
## Animating objects a little beyond the
## final mark and then having them set-
## tle into position can make motion
## look very realistic. When deciding
## how exaggerated to make the follow-
## through animation, you will need to
## consider how heavy the object should
## appear and how fast it will be moving.

Figure 11.4 Moving the button back and then forward gives the movement more life. Tip
## In real life, if a heavy object stops sud-
## denly, there is usually strong impact. If
Follow Through stops suddenly, your head wants to
## two large metal blocks collide, there
There is another basic law of physics: continue moving until you can stop it would be a lot of power behind the colWhen objects or people are set in with your neck muscles or it is lision even if they do stop abruptly. If motion, they are hard to stop. Anyone stopped by the dashboard. Heavy you want to give the impression of a who has ever been in a car when it objects are harder to stop than light large collision, a loud sound effect and
                                             objects, and the faster an object is a screen shake can help. If everything
stopped suddenly understands how
                                             moving, the harder it is to stop. on the screen bounces, it will feel like
this principle works in real life. When there was a big impact. you are riding in a car, both you and This principle is seen also when a perthe car are moving. When the car son stops short and his or her arms

## 132 Chapter 11 ■ Using Animation

Arcs applications also have a feature to When people move, they do not do so draw a path and move another object mechanically. Human movement along this path. Using this method, does not occur in straight lines. you could ensure that your object Instead, natural motion occurs in moves in smooth arcs. arcs. If you were to trace the motion of parts of the human body, such as Exaggeration hands, hips, or even the head, you When animating, it is almost always would notice that the motion creates better to make the motion a little bigsmooth arcs and not sharp turns and ger and more exaggerated than one angles. would expect. You will always be surUsing arcs when animating an inter- prised at how normal an exaggerated face provides the illusion of natural motion will look in the game. Choose motion. This may not always be the the most important aspects of your desired effect, of course. If you want animation and exaggerate them. In an interface to appear mechanical, traditional animation, the extreme then it is much better to keep the ani- poses were often exaggerated. When a mation linear and avoid arcs. If you fist was moved back for a punch, it understand the effect of both went way back. If you stick with approaches, then you can better con- motion that appears to be closer to trol the look of your interface. realism, you may run the risk of creatFigure 1.5 Different types of motion. ing drab and boring motion. You Figure 11.5 shows three positions of a almost can’t exaggerate too much. circle. If the motion between these three positions were linear, as in the
## This arcing movement is often the
top part of Figure 11.5, it would seem
## default method for interpolation
## Designing Transitions
very stiff and mechanical. If the Many interfaces pop from one screen
## between key frames in most animamotion were more of a smooth arch, to the next. This is the simplest way to
## tion software. If it is not the default
like at the bottom of Figure 11.5, it change screens, and it can save a lot of
## motion, you may need to add this arc
would seem much more smooth and time and money. If you really want to
## by hand. Many animation software
lifelike. add the quality touch to your anima-

## Designing Transitions 133

tions, a great transition between these create a custom animation for the from button to button or stagger the screens can do the trick. Adding a transition between every screen. This start from top to bottom. transition will take more time and type of animation can take a lot of
## There are many cool possibilities for
effort, but the results will be well time, but it can look quite impressive.
## transitions. You could make all of the
worth the work. The motion must be organized,
## objects at the top of the screen begin
## though. This is not always a case of
Transitions should be quick so that to fall, and as they collide with the
## the more animation the better, but
the user is not left waiting. There are objects below them, the second set of
## small variations can add a lot. If you
few things more annoying in a game objects begins to fall. In the end,
## decide to slide all of the buttons offthan a slow-moving transition. A everything falls off the screen.
## screen, it’ll look really cool if they
cool-looking but long transition may Animating all of the falling and col-
## don’t all start sliding at the same time.
be impressive the first few times it is liding in a way that everything
## You can add a frame or two delay
seen, but after that is just becomes appeared to have weight and impact frustrating. I would recommend keeping all transitions to less than a second. Don’t Make Them Wait Transitions can vary in complexity. A One of the big mistakes that new interface animators make is to create animations that simple transition solution is a fade. take too long. The user should never feel as if he is waiting around for an animation. The fade is often done by the pro- Slow animations can be particularly painful to endure with transitions, as I’ve said. Get grammers and does not take much them there fast. It doesn’t matter how cool an animation looks—if it takes too long, time or effort for the artist. A fade in don’t use it. and fade out often looks much better
                                             If you are new at animation, it is important to learn and understand just how fast fast is.
and more smooth than a pop between
                                             One second is a really long time to wait for an animation during a game. Count “one, one
screens. Using fades is a way to have a
                                             thousand” and think about how much could happen in that second. If your transition
transition without spending too
                                             takes longer than one second, it is probably taking too long. You can make it much
much time and money. shorter and still have a very interesting animation. Some very complex solutions—that It is amazing how much the human eye can perceive in a single second. If you watch a really look good—are possible. For commercial or video clip that rapidly flashes images, you will notice that your eye can example, all of the objects on the pick up dozens of images every second. Gamers have been exposed to this type of rapid screen can animate in different direc- stimulation and have even come to expect it. Give them this fast-paced action. Don’t be tions or at varying speeds. You can afraid to make things happen quickly.

## 134 Chapter 11 ■ Using Animation

would be very complicated, but it feel you must include that cool, long understand these three types of could be really fun to watch. transition, you could maybe skip the motion. The animation data that is
                                             animation when the user presses a typically stored in the files used in the
Be creative when creating transitions.
                                             button during the transition. Just game falls into these three categories.
The best thing to do is to look at the
                                             jump to the next screen. No matter These animation types can be used
still screen that you are starting from
                                             what you do, you want to make the separately or animated at the same
and the screen where you want to end
                                             interface quick to navigate. As you are time. Space-efficient file formats leave
up and think about how to get from
                                             designing, time yourself and see how out unnecessary information. If you
one to the other. There is no limit to
                                             fast you can get the settings you want never animate the scale of an object,
the things you can come up with.
                                             and start a game when you are very the scale animations data is not put
                                             familiar with the interface. into the final file. The absence of data
Consider Experienced Users means that the scale does not change. You want a user to play your game
                                             Properties That Can Translation is what most people think
over and over, right? After a user has
                                             Be Animated of when they think of animation. It is
played a game a lot, he knows what he
## one of the very basic animation propwants to do right away. He knows Many properties of an object can be erties. Translation refers to the posiwhich options he wants, and he wants animated or changed over time in an tion of an object. Translation is even
to get into the game quickly. Such interface. Some of the most common called position in some software. experienced users should not be properties are translation, rotation, When you move things around on the slowed down because you wanted to scale, and color. Learn which of these screen, you are animating translation. show a really cool animation that properties your game engine will suptakes forever to play out. Experienced port and take advantage of these fea- Rotation is just what it sounds like. If players often memorize the pattern of tures. you spin an object or turn it upside button presses that will get them into down, you are animating the rotation. the game. They can press the buttons When animating rotation, it is impor-
## Translation, Rotation, and
as fast as your interface design will let tant to establish the pivot point. This
## Scale
them. Consider these experienced will be the center of the rotation. It
                                             There are three basic properties that does not have to be in the center of
gamers when designing the interface.
                                             can be animated: translation, rota- the object. In fact, it can be far away
Short transitions and quick reactions tion, and scale. It will help you from the object. The location of the to button presses are a must. If you become a better animator if you pivot point can greatly affect how the

## Properties That Can Be Animated 135

object behaves as it is rotated. Figure a 2D graphic is that if you scale it too tion, and scale. Transparency refers to
11.6 illustrates how different an ani- large, it will become blurry. If you how see-through an object is. An
mation can be if the pivot point is want a big image at one point in your object can be totally opaque or it can moved to a different location. animation, make the image big and be just barely visible and mostly seescale it down during the rest of the through. This property can usually be When you animate the scale of an
                                                 animation. animated and changed over time. A
object, you are changing the size of
## simple way to create a fadeout is to
the object. Most software and game
                                                 Transparency and Color place a solid black box over an object
engines will let you distort an object
## and animate the transparency from
by scaling more in one direction than Transparency and color are two other
## 100 percent transparent to 100 perthe other. The important thing to common properties that can be ani-
## cent opaque. Another common use of
remember when changing the scale of mated in addition to translation, rota-
## animated transparency is to place a
## highlighted version of an object
## directly on top of an un-highlighted
## version. The transparency of the high-
## lighted version could be animated to
## make the button appear to pulsate.
## Many game engines offer the ability to
## animate the color of a 2D image. This
## can be a little trickier than animating
## other properties of an object.
## Typically, you will need to save an
## image in the right format for a game
## engine in order to change the color. As
## you can imagine, if you change the
## color of an already colored image, it
## could look really strange. The best
## way to use color animation is to
## produce a grayscale image, with no
## color, and let the game engine do the
Figure 11.6 The location of the pivot point can really change the effect of a rotating animation.

## 136 Chapter 11 ■ Using Animation

coloring. This technique will not simple or elaborate, and they can be Note allow you to use multiple colors in an impressive to behold. There are many As I mentioned previously, in order to image at once because the entire different techniques and methods to save space, these animation may need grayscale image will be colored using create these effects; I will cover some to be kept small, and they might even only one color, but it will be easy to of these techniques in the sections to be played back at a low frame rate. animate a color change. follow. It is best to decide what kind of Animations that require playback of
                                            effect you want and then decide on pre-rendered frames can take up a lot
Transparency and color are both of space.
## the best way to pull it off.
aspects of an interface that a programmer can often control. If the programmer animates these proper- Overlaid Animations A huge variety of animated effects can ties using the game engine—instead A common and simple effect tech- be created by playing one of these of giving him multiple 2D frames that nique is to play a sequence of semi- sequences. Objects onscreen could he plays back—it can save file space. transparent frames over the interface. melt, shatter, squirt water, or do anyFor example, when a button becomes thing else you can think of. Use your As I mentioned in the chapter on imagination and come up with anitools, good software can allow the highlighted, a little sparkle could
                                            appear. These frames can be a pre- mations that look cool and fit well
artist to control the animation of with your interface. Some of the best transparency and color in the same rendered animation created in a 3D
                                            program, or they could be hand- effects are those that fit well with the
way the programmer would change it theme of the game. If you are making in the code. The tool would simply animated in 2D software. In either
                                            case, there are a number of files that a game that takes place underwater,
provide a user interface to make these bubbles could come out of your butchanges and provide a way to save will be played back by the game
                                            engine. The concept is simple, but the tons when they are selected. If you are
them in a format the game could read. making a gangster game, machine
## possibilities are endless. There are so
                                            many ways to create this type of ani- gun bullet holes could cover the
Using Effects mation that I can’t begin to list them screen when a user leaves it. You will
                                            here. Any software or method that only be limited by time and file-size
In addition to the basic animation,
## will generate a series of numbered constraints.
there are countless animated effects that you can use when creating an files (in the right format for your interface. These effects can be either game engine) for each frame of your
## animation will work.

## Using Effects 137

Particle Systems system. These vary greatly from parti- particles onscreen. These parameters Many game engines support particle cle system to particle system. can often be randomized to produce a systems. Particle systems use 2D Changing these parameters changes natural effect. Particle systems can be images created by the artist and the the way that the particles (2D textures very complicated, but they can progame engine then animates these tex- created by the artist) behave. There is duce great effects. tures based on the settings for that really no limit to the number of
## Because every game engine has a difparticular effect. Many small versions effects that can be created with a par-
## ferent particle system, I can’t tell you
of these 2D images move around, ticle system, but some of the common
## how the system works in your game
scale, change transparency, change effects you’ll see are smoke, fireflies,
## engine. If this technology exists in
color, and blend with other particles explosions, and moving water. Figure
## your game, you might be able to use it
in a way that produces the overall 11.7 shows a spaceship with a trail of
## in the interface. The technology and
effect. There are a number of parame- smoke and flame. This trail was creat-
## features will vary greatly from game
ters that are supported by the particle ed with a particle system.
## engine to game engine. If you want to
                                                                   These particle take advantage of these effects in your
                                                                   systems have a interface, then you will need to learn
## variety of proper- how the particle system in your game
## ties that affect works. If you take the time to learn
                                                                   the animation. how to use this feature, it can become
## Some of the com- a powerful tool.
## mon parameters
## not already dis- Other In-Game Effects
## cussed in this
## Many other in-game effects can be
## chapter are life
## used in your interface—you are not
                                                                   (how long they
## limited to particle effects. If you know
## last onscreen),
## all of the effects that are planned for
## decay (how long
## the game, you should also ask the pro-
## they take to dis-
## grammers if these same effects could
## appear), and the
## be easily used in the interface. If the
## way they blend
## work is already done to support these
## with the other
Figure 11.7 These flames are created with an in-game particle system.

## 138 Chapter 11 ■ Using Animation

effects, you might as well take advantage of them. A great example of this would be a screen shake. If the screen shakes in the game when there is a large explosion, this effect can also be used in the interface. Again, these features are very game-dependent. You will need to see what your game engine can do. If you see something you would like to use, don’t hesitate to ask if you can use it. Most likely, it won’t be hard to do it in the interface if it can be done in the game.
Summary The best interfaces use great animation. Learn the basic principles of animation and apply them to your interface. Think big and create interfaces with amazing movement. Use the power of movement to attract the user and help guide him through the interface.
     Chapter
       12
Icons, Icons, Icons
                                           Use Text Sparingly Gamers don’t like to read too much
      cons are an important method of
## while playing a game. I have seen
      communication in an interface. Text should always be used sparingly
## countless gamers glance at a page of
      Displaying information graphi- in a game interface. (I jokingly say
## text and immediately hit the button to
I cally is always more interesting than displaying a lot of text. If you must
## that I promote illiteracy in my
## games.) If you can leave text out of an
## skip the screen. It doesn’t matter how
## important the information is, they
show an amount of money, consider interface, then by all means leave it
## will skip it—or try to, anyway.
using gold coins instead of a number out. I believe an interface is only finamount. If you must display the ished when there is nothing else that It does not matter how cool your amount of energy your character has can be taken out. If you must use text story is—if there are too many words, left, consider using a fill bar. You can in your interface, do everything you your interface will suffer. It is always use icons for almost everything in can to reduce its length. Short sen- better to impart important story eleyour interface. They usually take a lot tences and phrases are much more ments using music, voiceover, and more time to create than would a likely to be read than a large para- images. If you went to see a movie and paragraph of straight text, but they graph of text. found you had to read the story while make your game a whole lot more only a few images drifted by onscreen, fun.
140 Chapter 12 ■ Icons, Icons, Icons
you’d probably feel cheated—if you’d I recently designed an interface for a Using Icons Instead wanted to read a book you would game with a small budget. The develhave stayed at home! You expect a opment team did not have time to
## of Text
movie to be a visual experience, and make movies or even enough money You may be wondering, “How can I players expect the same from a video to record voice actors, but we had a create an interface that doesn’t require game. Many great video games have great story that was important to the user to read?” The user needs to gorgeous cinematic sequences—sort communicate to the user. In this case, understand how to navigate and conof mini-movies—that use sound I had no choice but to use text to tell trol the interface and the game, and effects, music, voiceover, and anima- the story, but we went to great lengths he must understand what every buttion to tell a compelling story. to leave out extraneous detail and ton does. Using icons that indicate the
                                              only use text to tell the most impor- functionality of a button or control is
There is nothing wrong with includ- often a good solution.
## tant pieces of the story. We broke the
ing text in your interface to support
                                              story up into little online pieces and Great icons can accommodate the
the visuals. Doing so can help gamers
                                              presented these lines throughout the game to the user without text. Text
who prefer to play without sound.
                                              level, and we spent a lot of time re- can be used to reinforce an icon, but
Just make sure that players aren’t
                                              writing to make sentences and phras- the better the icons are, the less this
required to read text in order underes shorter—sometimes by just a cou- text will be needed. It is not easy to stand what is going on in the game.
                                              ple of words. In this way, we spared create great icons, but it can be done.
## the player from as much unnecessary
Budget Constraints reading as possible.
## Image Choice
Once again, budget and time constraints will affect your ability to Note The key to creating great icons is deliver the perfect product. An inter- A truly great interface can be navi- choosing the right image to represent face with a lot of text is often a sign of gated by a user who doesn’t speak the the functionality. What image will a small budget because, of course, it is language in which the text is written. communicate the concept to the playeasier and cheaper to use text instead Imagining that your players don’t read er without any reading? Choosing the
                                                  English is a great way to make sure right image is not as easy as it may
of creating custom art and icons.
                                                  you’re communicating the necessary seem—it can be quite difficult to find
There will be times when you must information without relying on text. take shortcuts in order to meet a bud- an image for an abstract concept. For
## What would the user assume each butget or hit a deadline, but resist giving instance, for a button that allows the
## ton does?
up and filling the screen with text. player to build things, a hammer icon

## Using Icons Instead of Text 141

may be a great solution, but what You will also need to consider your When creating icons for games, you about a button that is used to display target audience when you design can draw on these same universally a character attribute, such as bravery? icons. You should consider what understood symbols. Why reinvent
                                             games your players have probably something that already works well?
Standard Icons played before. You can expect a com- Use red for a button that stops an
                                             pletely different type of user with dif- action and green for a button that
Many standard icons, or icons that
                                             ferent experiences depending on the starts an action. Use a plus sign to add
always mean the same thing, are used
                                             type of game you are making. You a knight to your army or a minus sign
in video games. Players already know
                                             may not be able to assume previous to drop a flask from your inventory.
what these icons mean and can get up
## game experience if you are making an
to speed more quickly if these stan- Software—other than games—is a
## educational game that is aimed at
dard icons appear in your game. For great source from which to draw stan-
## young gamers. If you are working on
example, many game have a Save fea- dard icons. It is safe to assume that
## a space combat game, it is likely that
ture, and a common icon for the Save anyone playing video games has used
## the user will have played many video
feature is a floppy disk. (This is sort of a computer for other tasks, and there
## games.
funny, as no one really saves games on are many standard icons used by a floppy disk anymore.) A charac- operating systems and software that ter/player’s health in the game is Non-Game Standard Icons can be used in your game. For examsometimes represented by a box with A red octagon means stop. Green ple, a magnifying glass with a plus or a red cross, which symbolizes a first- means go. It is not hard to figure out a minus is often used to zoom in and aid kit. Hearts also often represent which bathroom to use, even if there out. A lowercase “i” often means inforhealth of a character. A shield often is no text on the door. Symbols are all mation. Figures 12.1 and 12.2 both can be used as an icon for a defensive around us, and we learn early in life show a number of buttons from comaction and a sword for attack. what these symbols mean. Many icons monly used software.
                                             and images that have nothing to do Many of these icons would be a little
Take advantage of players’ past experiwith software and games are great ref- bland for a game if they looked exactence by using images that they are
                                             erences for creating icons for games. ly like the icons in a common software
probably already familiar with. Even if
                                             Think of all the buttons in your car, application, but the concept might
you use an object that is commonly
                                             on your DVD player, and on your still be good—you can take the idea
used in other games, you can cuskitchen appliances—most people can and improve on it. Figure 12.3 shows tomize it to fit the look of your game.
                                             figure out what these buttons are for how a standard icon of a magnifying
## even if they aren’t labeled.

142 Chapter 12 ■ Icons, Icons, Icons

## glass with a plus sign can be improved
## to look more like it belongs in a game.
## Be consistent. If you use a red octagon
## for a Stop button in one location,
## make sure you don’t change to a black
## square (the audio symbol for Stop) in
## another location. The user will learn
## what the symbols mean in your game.
## If the player can perform the same
## action from two different places in
## your menu, make sure the icon is the
## same in both locations.
## Use color wisely. Defining groups of
## similar icons and keeping color con-
## sistent within the groups to help the
## user learn and use your interface. For
## instance, make all of the icons that
## result in player action green and all of
Figure 12.1 These are icons and symbols found in Microsoft Windows 2000, the preference icons (like sound, Windows Media Player, Adobe Photoshop, Adobe Acrobat Reader, and Nero Express. Just by looking at these icons you might be able to guess what each button does. effects, and game resolution) blue. Be
## careful not to make it confusing by
## changing icons and icon colors ran-
## domly.

Figure 12.2 The symbols for playing audio and video are Figure 12.3 This is an well known. These are the buttons found in the Apple Quick icon you have seen many Time Player. These symbols have been used on radios and times, but this version VCRs for many years. looks more like it belongs
## in a game.

## Every Pixel Counts 143

Note Every Pixel Counts Figure 12.4 shows how a large image
    Never actually use copyrighted artwork can become blurry when it is reduced.
## Their small size is one of the things
    that is used in other games for your It also demonstrates how a little hand
## that make icons such great tools in a
    icons—it is illegal. Besides, using editing of the reduced image can
## game—they don’t take up a lot of
    someone else’s art is never as reward- sharpen up the lines.
    ing as creating your own. This does not screen space. When you’re working at
    mean you should not look at other TV resolution, you must keep icons
    games and use their solutions to help small. It can be quite difficult to make
    yours, though. Build on the strengths of a recognizable image when you only
    the art done for other games. Many have a 24×24 pixel (or smaller) area to
    artists have spent a lot of time deter- work with. The smaller the icon, the
    mining what symbols to use for each less space it takes up. Keeping your
    icon.
## icons small is particularly important
## for in-game icons. The more screen
If you aren’t sure if an icon you creat- space left open—not covered by intered works well, show someone the icon face buttons and controls—the better. and ask what he or she thinks it repre- The player needs to be able to see the Figure 12.4 When it is reduced, the sents. This person doesn’t need to be action in the game. image in the upper-right corner becomes
## blurry. This can be easily cleaned up once
another artist—after all, you aren’t After you have decided what symbol the image is reduced, as has been done to looking for information on how pret- to use for your button or control, the the image in the lower right. ty it is. You’re just trying to determine next big challenge is to create an whether the symbol communicates image that fits into a limited number Your pixel limitation may affect the what you want it to. of pixels. Many novice icon designers subject matter of your icon. The
                                               simply take a large image and reduce image will need to be small enough to
                                               it down to make a button icon. This be an icon, but still be recognizable. I
                                               might work in some cases, but often have had a publisher sit and describe
                                               most of the image detail will be lost to me an icon that was to depict a
                                               and images will become blurry. If the complex scene that needed to be recsmall details are important, these ognizable in 32 pixels. It is impossible
                                               details may need to be exaggerated so to show a Ferrari driven by a smiling
                                               that they can still be seen when the man with one missing tooth all in a
## image is reduced.

144 Chapter 12 ■ Icons, Icons, Icons
small icon. The driver’s head may to repaint all of the details before it only be a couple of pixels big, even if will make a good icon. Photos can still you do crop out most of the Ferrari. help you know what the object really Think big, simple shapes when looks like. designing icons. If the driver’s missing tooth is the key concept, then you might just use a smile with a missing
## Summary
tooth, not even the driver’s whole Great icons can make for a great interface. face. Keep away from text by using
## symbols and icons to let the user
When editing icons, you will need to know how to use your interface. Hone make adjustments at the pixel level. your icon-creating skills. The ability Zoom way in on the icon and make to create a great icon is a very valuable changes. It can be hard to see what skill when creating game interfaces. these changes look like at actual size You might be surprised how much when you are zoomed in, so it is a more fun the interface seems to be good idea to constantly zoom in and when you use icons in place of text. out while working on your icons. Slight changes to a pixel can make a big difference.
Photo Reference Very rarely will you be able to use a photo for an icon without changing it drastically, but photos can give you ideas for good silhouettes. Finding a good silhouette is the key when using
## photos. You will almost always need

     Chapter
       13

## Designing the HUD

                                           Many of the same principles that Players want to see what is going on in
        he acronym HUD stands for
                                           apply to the front-end menu also the game. If you cover the screen with
        Heads-Up Display. HUD
                                           work for HUD. In this chapter, I will a distracting interface, it can be like
        refers to the interface and discover the aspects that are specific to looking out of a car windshield that is
T play information that is onscreen while the game is in progress. This inthe in-game interface. covered with stickers. Designing
## HUD for multiplayer games that use
game interface is very important
## split screens is even more difficult
because it affects game-play. If the Screen Space than designing for console games HUD is hard to understand and use, One of the basic rules to follow when because, of course, the screen space is then the game will also be hard to creating HUD is to take up as little cut in half. understand and play. screen space as possible. With PC
                                           games, screen space is always limited; When it comes to HUD, less is more.
HUD design is a very complex subspace is even more limited in a con- The trick is to display a lot of inforject—an entire book could be written
                                           sole game that is played on a televi- mation in a very little space. Try not
on it. This chapter will give you only
                                           sion. to fill up the screen with unnecessary
an introduction to designing HUD.
## information—it is all too easy to end

## 146 Chapter 13 ■ Designing the HUD

up filling up a lot of space with HUD and getting in the way of game-play with cool-looking but unimportant details. If the player does not need the information to play the game, you should consider taking it out of the HUD. There are many ways to organize the HUD on the screen. Think about the shape of the screen that is not covered by the HUD. If you want a wide screen, you may want to place the HUD at the top or bottom of the screen. If you prefer a screen that is closer to a square shape, you can put the HUD on the left or right of the screen. You can also spread the HUD into every corner. Figure 13.1 shows several different types of layouts that you can use. The black areas represent possible locations for the HUD. Figure 13.1 Here are several different basic layouts that you could use when designing
## the HUD.
When you’re working with HUD, it is good to keep the extra stuff small. There is no need to use a lot of pixels; Again, if it is not absolutely necessary Part of your HUD will be decora- it is amazing what you can do with a to display the information onscreen tive—the beveled edges on buttons two- or three-pixel border. (See during play, then put it in another and rivets in the rusty metal are there Figure 13.2.) location. For instance, one small butjust for looks—you want your HUD ton in the HUD could open a page of to look cool, but you don’t want this Figure 13.2 A lot of detail information or options that are rarely extraneous detail to be too large. can be added with only a few needed while playing the game. This
## pixels.

## Screen Space 147

approach still provides the player another icon (or the same one in a his super strength, but an in-game access to this information when he different color) when he is sad. effect such as the muscles on the chardoes want it. Instead of displaying in the HUD the acter beginning to bulge or shrink
                                            number of bullets that your character would be much more impressive. You
In-Game Information has left, you could change the 3D will need to work within the budget of
                                            model in the game so that the player your game, of course, and find ways to
A great way to reduce the amount of
                                            can see the ammunition on the char- put as much information into actual
information that is displayed in the
                                            acter’s belt. game-play as you can.
interface is to put more information into the actual game and take it out of It is much easier to display informa- You can also allow the player to select the interface. For example, if a charac- tion in the HUD than it is to develop in-game objects instead of automatiter in a game is becoming fatigued, more game content to display infor- cally putting an interface element you might indicate this to the player mation; that is why you see so many onscreen. Once the player selects the by changing the character’s anima- games with cluttered or boring objects he wants, the important infortions rather than by displaying a HUDs. Putting an icon in the HUD to mation can be displayed. The in-game fatigue bar in the interface. This tech- show that the player is carrying a objects basically become the buttons nique works best when the player jewel is much easier than actually that might normally appear in the does not need the specific details. If putting a jewel in the character’s HUD. If the player needs information the player needs to know only that he hand, but it doesn’t look as good. If it about the prices of objects in a magic is not at full strength and not his exact is a big jewel, you might have to shop, for example, you could allow numerical fatigue amount, then hav- change the run animation so that the the player to select the objects by ing three sets of animations—one character uses two hands to carry the walking around in the game world. each for energetic, tired, and super jewel. Several animations would need Once the object is selected, you could tired—may be enough information. to be created, and it may be expensive display the price and item descrip-
## and time-consuming to do so—but it tion.
Many games use icons in the actual
## would be much more fun for the playgame environment. Rather than put a An even better but more difficult way
## er to see the character carrying a huge
2D piece of art in the HUD to display to reduce the amount of information
## jewel than it would be to stare at a 2D
the mood of a character, you could displayed in the HUD would be to
## image of a jewel in the corner of the
place a 3D icon that floats over the allow the player to get all of the infor-
## screen. It is always easier to throw up
character’s head when he is mad, and mation he needs just by looking at the
## another icon when the player is using

## 148 Chapter 13 ■ Designing the HUD

character. A character’s facial expres- have information pop sion can reveal his mood, the anima- up to help him. It can tions can give information about his be really effective energy level, and when the character when the game can is selected, a voice can tell the player tell when to pop the what the character wants. menus up. For exam-
## ple, if the player
All of these options take much more
## seems to be confused
time to create, and so they cost the
## and is not progresspublisher more money, but they are
## ing through the game
more interesting than a set of boring
## at a certain rate, the
bars on the screen.
## game could pop up a
## menu offering hints.
Pop-Up Menus Figure 13.3 shows a Pop-up menus are just what the name pop-up menu that Figure 13.3 A pop-up menu provides extra information. implies. When the player presses a appears early in the button in the HUD, an in-game object game to teach the is selected, and a menu can pop up new player how to play. subsided and the player’s shields have with new information. The game can returned to full power, the shieldpause or continue in the background. strength information could disappear.
## Dynamic Content
Using pop-up menus is a great way to Obviously, the amount of oxygen a
## The basic idea behind dynamic conkeep the screen clear—if the player player has left should only be dis-
## tent is that the HUD changes dependneeds to know about the status of a played when the character is under-
## ing on the game situation. Only the
character, he can press the small char- water, and the amount of ammuni-
## information that is important at the
acter status button and up pops a tion a player has left should only be
## moment is displayed. When the situawhole page of information. displayed onscreen when the player
## tion changes, the HUD changes to
A great place to use a pop-up menu is match. For example, the player’s has his weapon out. The player may in a tutorial. When a player is first shield strength may only appear not know how much oxygen is left in learning how to play a game, you can onscreen when meteors are hitting his tank when he is on dry ground,
                                           him. Once the meteor shower has and he may not know how many

## Screen Space 149

bullets he has when his gun is put remains on the screen for a short time Combining Information away, but this information is not and then fades away. This saves screen You can combine information in important at these times. space and really improves the game order to have fewer objects on the
                                             experience. screen. When playing your game, the
You might think that it is important for the player to know how much A very simple example of dynamic player may need information, but he health he has at all times. I have HUD can be seen in Figure 13.4. The may not need all of the details. In a played several games that brilliantly HUD in the bottom-right corner of game where the player controls a take another approach: The health the screen only shows up when a ship theme park and tries to make visitors meter only appears when the charac- is selected. It contains information happy, it is important to know how a ter loses some health. This meter about the currently selected ship. visitor is feeling, but it may not be
                                                             When no ships are important to know all of the details
## selected, nothing that make up the happiness. The
                                                             appears in this spot. game may keep track of a lot of infor-
## mation in the background, but not all
## Evaluate your inter-
## of it needs to be displayed. If the play-
## face and decide
## er just ate a hamburger and it made
## whether you really
## him happy, but then he couldn’t find
## need all of the infor-
## a drink, rather than displaying all of
## mation onscreen all
## this information, you could just dis-
## the time. If you think
## play the a bar that says his hunger is
## that there may be
## half filled.
## times when some
                                                             information is need- The choices you make of what to dised and other times play not only affect the HUD, but they
                                                             when it is not needed, also have a lot to do with basic gamechange your interface play. In the theme park example, for
                                                             to fit the situation. instance, do you want to spell everyFigure 13.4 An interface with a dynamic HUD that only
appears when the player needs it.
## thing out for the player or let him

## 150 Chapter 13 ■ Designing the HUD

discover how to please this visitor on concentration because it is hard to see Eye Movement his own? If possible, reduce the something in the HUD.
## As I’ve said, the information displayed
amount of information on the screen
                                              You can get a pretty good idea of the in the HUD should be vital to the
by making logical combinations.
                                              clarity of your image during the cre- player; if it’s not, it should be disation process, but the best place to test played elsewhere. Important informaLegibility it is in the game on the target plat- tion should be clearly visible, and the
All HUD elements should be as small form. See how your art looks in the player should be able to read it quickas possible, but it is also very impor- game engine. It can often look very ly. The player does not have time, in tant that they are clear and legible. If a different in the game engine than it the heat of battle, to search the screen player can’t tell what it is, then there is does in Photoshop. for information on how much health no use putting it on the screen. In he has left—he needs to know this
## If you are working on a console game,
order to achieve the right balance of immediately. The HUD design should
## you must also check your art on a
smallness and legibility, you must communicate such information
## television. There is often a huge difoften test and re-test your design, and quickly and clearly.
## ference between what you see on a
you may have to adjust the art after computer monitor and what you see When designing the HUD, consider you see it in the game. on a television. Some colors are hard- the player’s eye movement. Where will I have already discussed the fact that er to see on a television. Because there he be looking and how easy or hard gamers don’t like to read text. If the are a limited number of pixels on a will it be for him to see the informaHUD is fuzzy and hard to read, they television screen, even small images tion? Placing information into groups will be even less likely to read it. While may appear much larger than you with similar information can help the this same concept applies to a front- expect. This can reveal flaws that may player find the information he needs end interface, it is even more impor- not have been seen on a computer quickly, as he will only have to look in tant in the game. Usually, the game monitor. Just because everything is one place. Looking back and forth does not pause so that the player can clear and legible on your computer across the entire screen over and over read the information and the player does not mean it will be clear and leg- can take valuable seconds and be can only pay half attention to the ible in the game. quite frustrating. HUD because he is busy playing the In an RTS game, the player might game. Don’t make the player break his need to build units and buildings. It is
## helpful for the player to find all of the

## Game-Play Adjustments 151

building actions in one location. ing a weapon, it is helpful to show an Making HUD Look Cool Other interface buttons, such as but- image of the current weapon after the
## With all this talk of functionality,
tons used to control the action of a change.
## don’t forget to make your HUD look
selected unit or units, could be placed
                                            Use all of the same techniques that are cool. A good-looking interface can
near each other in another location.
                                            used in the front-end menu to get the really add to the game. Make sure the
Attack, Patrol, and Guard are actions
                                            player’s attention. Color, size, and HUD fits the look and feel of the
that might go well together. It would
## movement can all help the player see entire game.
be awkward for a player to have to
## what is important. (These concepts
push a button in the upper-left corner If the front-end interface has success-
## are discussed in Chapter 7.) Your goal
to attack and another button in the fully captured the feel of the game,
## is to help the player understand how
bottom-right to guard an area. then this is a great place to start when
## the HUD works and understand all of
## designing the HUD. If you can pull off
## the information. You are communi-
## a good theme, it can really add to the
Ease of Use cating with the player through the
## feel of the game. If the game is in
A well-designed HUD should be easy interface. Don’t distract the player
## space, for example, make sure that
to understand and use. The player from game-play, but if you are going
## your HUD feels like space—dark,
should know how to navigate the to display something important on
## star-filled backgrounds with lots of
interface without thinking. When screen, make sure the player notices.
## glowing lights may be appropriate for
designing for a PC game, think about Organize the interface. For example, such a game. If you are working on a how far the player will need to move placing all of the information about fishing game, you might go with a the mouse. How many clicks will it the player’s character in the right- backwoods, rustic look, with a lot of take to perform a common action? Is hand corner and all of the informa- wood grain and “hand-painted” text. it obvious to a new player what to do? tion about the enemy in the left corUse as many visual clues as you can to ner of the screen will lessen any con-
## fusion about whose health meter the Game-Play
help the player understand the interface. Small interface animations can player is looking at. It is also helpful if Adjustments help the player understand the effect all the information onscreen is orga- The design of your HUD will be of pressing the buttons. If the player is nized according to color—the player’s greatly affected by any changes made spending money, it can be helpful to character data can appear in blue and to the game-play during the developsee animated dollar signs pop up after the enemy’s can appear in red, for ment process. Unfortunately, it is hard every purchase. If the player is chang- instance.

## 152 Chapter 13 ■ Designing the HUD

to make all of the decisions about ship’s shields in a space combat game, Use visuals that will help the player game-play before a game is made and for example, you may need to make better understand the information in not make changes during develop- some adjustments to the HUD so that the HUD. Instead of labeling a health ment. it is easy to understand how to turn meter with text that says High and
                                          on the shields. A good icon might Low, for example, you can change the
As the game gets to a point where it is
                                          really help. color of the bar from green when the
playable for the first time, testing
## player’s health is high to red when it is
begins and so do the changes. The While you should do your best to
## low.
game designers may decide that the avoid having to make changes to the player may need a lasso in addition to HUD, knowing before testing that In Figure 13.5 you can see how a lot of a gun, and you may need to fit in an changes are probably inevitable will information can be displayed in a interface that is used to throw a lasso help you resign yourself to making graph. The icons on the left side of into the HUD you have already improvements when the time comes. this piece of the HUD represent each designed. If the game designer finds Willingness to make a change is par- of the desires that visiting spaceships that the game needs to display the ticularly important when there is con- have. The green section of the fill bar number of enemies in the game, new sensus on your team or among test represents how much of that desire interface elements may be required. If players that a problem exists. No mat- your space station is capable of meetthe decision is made to allow the char- ter how much you love your HUD, if ing; the red section of the fill bar repacter to pick up and carry game items, the testers are all having trouble with resents the amount of the desire that you will need to add this functionali- it, it’s got to go. you cannot fill. Using this graph, it is ty to your HUD. These items in the simple for the player to see how well player’s possession may need to be he is doing. Even when the scene is displayed in the HUD.
                                          Graphic Information filled with ships, a glance at this menu
                                          Display will give him a lot of information. The
When the game is finally playable, you
                                          Display as much information as you more green sections displayed, the
will have a chance to test out your
                                          can graphically. It is much more inter- better he is doing—this is much easiinterface. You will often find that new
                                          esting to see information displayed in er to understand than it would be if
players are confused by elements that
                                          a fill bar than as a number amount. numbers were used to show the same
you thought were going to be painful-
## There are many ways to take informa- information.
ly obvious. If no one who plays your game can figure out how to turn the tion and turn it into an icon, chart, or
## graph.

                                                                   Standard Elements versus Non-Standard Elements 153
                                                               create an interface mately worked, but it was not easy to
                                                               that is easy to use. design. We tried many different interLearn about all of the face elements to tell the player how to
                                                               standards for your swing. Before we settled on the final
                                                               game genre and stick mechanic and HUD, we tried all kinds
                                                               with them in most of three-dimensional meters that sat
                                                               instances. in the club’s path. In the end, these
## meters did not work well for game-
## When you vary from
## play.
## a standard interface,
                                                                it can result in much We ultimately took away a great deal
                                                                more work. It can be of the interface and created a particle
                                                                risky, as well. When blur behind the club. The color of the
## making a golf game motion blur changed as the player
                                                                one time, I and the neared the sweet spot; we even added
Figure 13.5 You can display a lot of information in a simple other game designers a little ding sound so the player would way if your HUD is designed well.
                                                                decided that it would know when he should swing forward.
                                                                be cool to change A small club head also displayed a
Standard Elements how the basic swing mechanic number that represented the percentworked. Most golf games at that time age of the full-power swing. This versus Non-Standard used a gauge at the bottom of the number animated as the player took Elements screen, and the player would simply his back swing so he would know There are many standards for in-game click as the meter reached the correct when to swing forward. It would have interfaces. Familiarize yourself with point in the animation. This worked been a lot easier to use the same type your competition, as players may be well, but we decided that a new way to of meter that had been used in other familiar with and like the way inter- swing could make our game even golf games. faces in other similar games work. more fun.
## You can make cool innovations to
Play the other games in the same
                                               We wanted the player to pull back and your HUD, but you must understand
genre and pay attention to how their
                                               push forward on the joystick so that it how much longer it takes to come up
designers have designed their HUD.
                                               felt more like swinging a club. It ulti- with a new solution compared with
## Using this information can help you

## 154 Chapter 13 ■ Designing the HUD

something you know will work because you have seen it done in a thousand other games. When you decide to innovate, don’t throw out the baby with the bath water—only change the one item, don’t change the whole menu’s functionality. If you present the player with too many new tasks and unfamiliar functionality, he may get confused.
Summary Many of the basic design principles and techniques used for the rest of the interface can also be applied to the HUD. The HUD is the part of the interface that is tied closely to gameplay. Make the HUD easy to use and understand and don’t forget to make it look cool.
     Chapter
       14

## Designing an Interface

                                           As I go through the design process, I book. If you need a Photoshop tutorp to this point, I have been
                                           will explain how I created an interface ial, pick up another book on the prodiscussing interface design
## using Adobe Photoshop. I will not try gram.
           principles. This chapter will
## to teach you how to use Photoshop.
U provide a real-life example of how these principles can be applied, by
## Instead, I will demonstrate basic tech-
## Nomad Design Goals
## niques that I use and show you the
taking you through the steps of In this chapter will show you the
## design process.
designing an interface. This “tutorial” process I recently went through as I will, I hope, help you understand how In this chapter, I assume that you have designed an interface. Because the complex and difficult it can be to cre- a basic understanding of Photoshop. game is not complete at the time of ate a good interface. Good design is But even if you don’t know the soft- this writing, I’ll refer to the game with not easy to create—it is just easy to ware, you’ll still be able to understand a code name—Nomad. This game is a use. The best interfaces require plan- the design concepts—and I will focus space trading game at the core. ning and careful thought. You can’t more on the concepts than on the The player can fly from space station just whip them out in a couple of specifics of Photoshop. I can’t cover to space station, trading goods for hours. all of the details of Photoshop in this

## 156 Chapter 14 ■ Designing an Interface

profit, accepting secret missions, pur- art style for Nomad is already set. The elements of our game was trading chasing weapons, and upgrading his game must not break completely from goods. The player would spend a great ship. the previously created Kaloki uni- deal of time using the Trading menu.
                                            verse, but this does not mean we can’t It was very important that this interThis game may sound familiar to
                                            improve on what was done for that face be easy to understand for an
you—many space trading games out
                                            game. Nomad shouldn’t have the inexperienced player; simplicity was
there fit a similar description. Nomad
                                            exact same look as Outpost Kaloki but the major goal here. This interface
does have several new and innovative
                                            will retain the feel. also needed to be flexible enough that
features that aren’t found in compet-
## it could handle the most difficult sceing games, but what really sets this Play Outpost Kaloki if you want to
## nario the game would present. If we
game apart is that it is accessible and familiarize yourself with its look and
## did not get this part of the interface
easy to learn. It is deep enough for feel. A demo version can be found on
## right, the whole game could suffer.
hard-core gamers, but it will not scare the CD that is included with this off a casual gamer. Most of the exist- book. You will be able to see how the We first looked at many similar games ing trading games are aimed specifi- interface design for Nomad fits into to see how their trading interfaces cally at hard-core gamers. They can be the Kaloki universe. were implemented. We found that this very technical and often require a lot part of the interface was one of the of time to learn. Nomad is much more biggest problems in many competing simple to understand. This was a priThe Rough Sketches games; the trading interface was often mary design goal for Nomad—make I started my work on Nomad by sit- a screen full of text and data that was the game easy to play. This is always a ting down with the game designer, difficult to understand. Consequently, difficult goal to meet, but if you can and together we began to work out these games often had a high learning meet it, you will have a successful the HUD design. We determined that curve—they were very difficult to game. we should first design the most understand at first, and a new player
                                            important part of the interface. We had to be willing to spend a signifiNomad is based on an existing intel- could then use this to guide us in the cant amount of time learning how to
lectual property (IP) that was used in design of the rest of the interface. play. Many players would probably a previous game. The characters and
                                            We needed to identify the piece of the look at these screens and decide,
ships were originally created for
                                            interface that would be seen the most based only on the visual complexity,
another game, Outpost Kaloki.
                                            and could potentially cause the most that the game itself is too hard to
Because it is based on this IP, the basic
## confusion. One of the core game-play bother with.

## The Rough Sketches 157

Nevertheless, the game designer and I point. Figure 14.1 shows some of the easier to understand?” We moved elebegan by sketching some very rough sketches we came up with. ments around on the paper. We scriblayouts that were similar to the inter- bled on a whiteboard.
## These sketches are probably illegible
faces in other trading games. We then
                                             to anyone who was not present when All of this moving and scribbling
asked ourselves the question, “How
                                             they were jotted down on paper. The helped us determine that there was
can we make this interface easy to
                                             purpose was to quickly see potential some basic information that was
understand and use?” What was really
                                             layouts. We explained to one another important for the player to underimportant and what could be left out?
                                             what each scribble represented, but stand:
How could we remove as much text as
## we did not waste time trying to make ■
possible? Amount of money he has
## a pretty sketch.
## ■ Number of holds he has in
We started with the basic layout that
                                             We then began the stage I call the which to store items
seemed to be the most common in
                                             “what if ” stage. We would continue to ■ Quantity and type of items he
competing games. We were not com-
## scribble on paper and ask each other
pletely satisfied with this approach, is carrying
## things like, “What if we left this out
but we needed to use it as a starting ■ Items that he can buy
## and moved this over here? Would it be
## ■ Cost to purchase items
## ■ Price at which to sell items
## ■ How these current prices com-
## pare to a standard
## This last item is interesting. Many of
## the games we looked at required the
## player to remember if a price was high
## or low before deciding whether it was
## a good idea to sell or buy. Tracking
## this price information in your head
## did not seem fun—it seemed like too
## much work. We decided that it would
## be much more fun to get this inforFigure 14.1 These are very rough sketches. mation quickly and spend the extra
## time determining trading strategies.

## 158 Chapter 14 ■ Designing an Interface

We also decided that the game would be colored in a way that the player The buttons for purchasing items did be much easier to play if the player would instinctively know what to do. not need to be displayed all of the could easily understand whether each time. We decided that it would be a
## We then moved on to sketches of a
purchase was a good deal or if he good idea to have these buttons pop
## different approach. We were still not
could make money by selling off up on the side of the menu when an
## at a point where we needed to have
items. Competing games displayed item was selected that could be
## pretty sketches. If we could look at a
enough information that the player bought or sold. This would also help
## sketch and understand the layout,
could calculate how good of a deal the player better understand what the
## then it was good enough. Figure 14.2
each price was—if he could remem- Purchase and Sell buttons did. The
## shows a rough sketch of a vertical layber the details—but this information highlight would move down to the
## out.
was not always displayed in the cur- row where the item was located. The rent trade dialog box and often Purchase button would not just visurequired a lot of calculation. There ally signify purchase, but purchase this. wasn’t a good reason why we should-
## Figure 14.3 is a very rough sketch of
n’t make this information simple to
## the buttons appearing to the side of
find.
## the highlighted object.
We also decided that it was important to display this information graphically rather than using text. We needed an icon or another way of indicating whether the price was high or low. After the player processed all of the information displayed in the HUD, he needed to do one of three things: buy, sell, or leave. The player should clearly understand how to buy, sell, or close the dialog box and move on. The Figure 14.2 This vertical menu buttons for these actions needed to be approach seemed to take up less big enough to see easily and needed to screen space and it could naturally
                                           grow out of the ship information Figure 14.3 These sketches are still very loose.
                                           that would already be on the screen. The purpose was to quickly see potential layouts.

## The Rough Sketches 159

Temporary Art Spending time on polished artwork is mer even made some of the art himBefore spending much time on final a big temptation—it is really reward- self. Making bad temporary art is art, the game designer and I began ing to look at pretty art in the game. I sometimes a good idea—if you make creating some temporary art. The have worked with many producers temporary art really ugly, then there is interface programmer was then able and publishers who want something no doubt that it is temporary. If we to take this temporary art and put it cool to show off—they want to show a were dealing with less experienced in the game. He could start displaying version of the game to the press or to directors, we might not have taken this information and making buttons their boss, so they ask for polished art approach—they may have believed work. The game began to be playable early. While creating finished art early that the art was final if it looked too at this point—the player could buy on is sometimes a necessity, you good. The goal here was just to test out and sell things and make money. should realize that doing so will create the game’s functionality.
## extra work when things need to be
Of course, this was a long way from a Figure 14.4 shows some temporary
## redone. It also can take the focus off
fun, finished game, but it afforded us art used to test the functionality of the
## the game’s functionality and put it on
the opportunity to do some early eval- interface.
## the quality of the art. In these early
uation. We handed the game to new stages, it is better to get players and tested whether they could the functionality corquickly understand the interface. We rect. You can then folalso could begin to see whether this low up with pretty art. approach made it fun to trade items. If trading was tedious, we had to change On Nomad, we used how it was done because trading was some pieces of art what the player would be engaged in from a previous game throughout the game. The only way to and created some new know if a game is fun is to try it. An art. Luckily, we were experienced game designer can make working with experisome good assumptions about the rel- enced game developative enjoyableness of a game, but ers who understood there is no substitution for an actual what they were looktrial involving new players. Because it ing at. Some of the art was so early in the process, we knew we used was purposely we’d have to make many changes. bad—the program- Figure 14.4 You can see the poorly drawn Purchase buttons
## and the general poor quality of the art here.

## 160 Chapter 14 ■ Designing an Interface

Re-Do’s in action and see how other players Nomad Colors There is one area in which we did play the game, it seems I always find
## The game designer and I tried several
waste a little time—re-do’s. We tried ways to improve it. If there is time and
## color combinations for the trade
hard to avoid spend time on re-do’s, budget to make it better, then I want
## interface in Nomad. This color decibut it is almost impossible to avoid to do so. I have seen too many game
## sion would also affect the entire game,
completely. and interface designers get an idea
## as all of the HUD and front-end inter-
## and cling to it tightly. This can be
The programmer set up the tempo- face would follow this same color
## damaging to the final game.
rary art and made it work in the scheme. These colors might also have game. As we reviewed it, we came up The early stages of a game are the best been used on the box cover. What we with a better solution than we had places to make changes. When I am were really deciding was what the implemented at first. This new solu- told that the direction of a design is color of the game should be. tion meant that the artwork must be set and it cannot change—simply
## The colors used in Outpost Kaloki
done differently, and the programmer because it is the way the designer
## were fairly saturated colors. We needwould have to make the changes. If we wants it and not because of time or
## ed the color scheme for Nomad to
had guessed correctly the first time, budget constraints—I assume the
## match the already-established look of
the temporary art would have only game will not end up as good as it
## the in-game art. The spaceships in the
needed to be replaced with final art, could be. If you fear change, you
## game were bright and had sort of a
and it would have taken little or no might miss out on opportunities to
## cartoonish look. This bright, cheerful
programmer time. The programmer make a better game.
## look was not an accident; it was carespent time setting the art up the way Don’t come away from this book fully chosen. We believed that this
that seemed best at the moment—he thinking you should demand radical look would help Nomad appeal to a just had to take his best guess. This is interface changes late in the game broad market. one of the reasons for using tempo- process or when there is not enough rary art; at least I did not waste time Neither of the two common styles for
## time or budget to make the changes.
creating final art and then have to space games—rusted metal with dirt
## Be open to new ideas but wise about
change it. and grime or clean, glowing, and
## your schedule. In real life, an unfin-
## high-tech—was perfect for our target
I try hard to get an interface com- ished game is worse than an imperfect
## audience. These two art styles might
pletely right the first time, but I don’t game. An unfinished game can’t be
## appeal to the serious gamer, but they
think I have ever actually done so. sold. (Although I have seen a couple
## might also scare off the casual gamer.
This is because I am always open to of games that have made me question
## Our goal for Nomad was, you’ll recall,
improvement. Once I see an interface that statement!)

## Nomad Colors 161

## about color in this early stage also
## helped us to visualize the final prod-
## uct.
## We decided that it was important for
## the player to understand what items
## he had in his ship and what items
## were in the store. As items were pur-
## chased and sold, they would change
## from one side of the Trading menu to
## the other. As always, we did not want
## to rely on text to solve this problem.
Figure 14.5 These are some color schemes that we Figure 14.6 The final colors looked at for the game. are a little more edgy than in The standard solution is simply to
                                                     Kaloki, but they still fit well label the top of the columns of items
to reach this casual gamer while still within the look and feel of the Ship or Store, but we wanted to leave
                                                     Kaloki world. such labels off the screen. If our labelappealing to the hard-core gamer. The
interface colors played an important less approach turned out to be
                                            stand out, but it also fit well in the unclear, we could always add text
part in reaching this goal.
                                            Kaloki universe. We hoped that these later. We wanted the player to know
Two possible color schemes for colors would become recognizable as what was in his ship without having Nomad are shown in Figure 14.5. the colors of Nomad. The final color to read a single label, so we used color
                                            choice can be seen in Figure 14.6. to provide visual clues.
In Nomad, we added combat elements that did not exist in Outpost Kaloki. Some information, such as the Nomad was going to be slightly edgier Using Color as a Tool
## amount of money the player had and
than Outpost Kaloki, and the look The game designer and I made a deci- how much space was left to carry could therefore be a little more geared sion to use color as a tool to help the items, needed to be displayed all of for the serious gamer. We came up player. Our simple sketches didn’t the time. We decided it would be a with a predominantly gray and purple have color, but we began discussing good idea to have a small portrait of interface with bright orange accents. ways we could use color to make the the ship next to this information. This This was a very non-traditional color interface easy to understand while would make it clear that this was choice for an interface. It would really making these crude sketches. Talking information about the player’s ship.

## 162 Chapter 14 ■ Designing an Interface

This small piece of HUD with the portrait of the ship was mostly purple. We therefore decided that all of the icons and information about the ship should appear on a purple background. Any of the items in the virtual store would appear on a gray background. We also decided to make a visual connection between the pieces of HUD that were displayed all of the time and the store interface that appeared only when the player parked at a space station. We wanted this art Figure 14.7 You can see how the basic to appear to be one big piece—the ship information seems to connect to the
## list of items carried in the ship.
player may never have consciously noticed that the ship information
## would learn to instantly recognize
always appeared on purple, but we
## that a blue gate was a place to exit the
hoped that it would give him intuitive
## area and warp to another. Figure 14.8
clues.
## shows the chart we made for the use
Figure 14.7 shows how all of the of color in the game. information about the ship had a pur- Figure 14.8 This chart was made not
                                          A great place to use this color-coding only for the interface, but also as a guide
ple background.
                                          was in the mini-map. The mini-map for the entire game.
We listed all of the important items displayed a bunch of moving dots that that we thought would appear in the represented a number of objects in game. We then assigned each item a the world. The player would need to been a solution here too, but they color. If we kept these colors consis- look at the mini-map and instantly would have made the mini-map tent, the player would eventually learn understand what all of the dots on the much harder to understand than it what the colors meant. If warp gates map represented. Labels could have would be if we colored-coded the were always blue, then the player dots.

## Creating the Art 163

A good use of color in the mini-map might appear to save time at first, it is in order to avoid having to re-do the went a long way. If all of the enemies usually a poor solution, and in the art several times. Taking out a little appeared as red dots in the mini-map long run it will take longer. Although variation in the middle of the menu but the space station was also red, breaking up the files into smaller and squaring off a rounded corner then the player would have a hard pieces will require more effort for the reduced the number of pieces that time telling the space station from the artist and more programmer time at was needed to create a dynamically enemies in the mini-map. But if the first, it will actually save time. scaling menu. enemies appeared as red dots and
                                           Once this initial work has been done, The art needed to be flexible. The
nothing else onscreen was red, then
                                           this one piece of art can be used in Trade dialog box needed to be
the player would have no trouble
                                           many different locations at various dynamic and change for each situaspotting them.
                                           sizes. If a solid piece were used instead tion. Each store where this dialog box
                                           of a file that could be scaled, file sizes would appear included different items
Creating the Art would end up being much larger than to sell, and every store could sell a difOnce the initial pencil sketches were needed because a new file would be ferent number of items. The player done and the temporary art had been needed for each different-size menu. also had a varying number of items tested, it was time to create some A piece of HUD that can be scaled aboard his ship. The size and shape of good-looking art. This was our first also allows a lot more flexibility. the dialog box needed to change for shot at art that might be final. While each of these situations. The two sides
## We examined the Nomad design and
we understood that the art would of the dialog box, the ship inventory
## decided how to break the art up into
probably change again later, we side and the store inventory side,
## the smallest and most flexible pieces
attempted to create art that could be needed to change independently. The
## possible. It wasn’t easy to arrive at the
final if it worked well. You never side on the left, which included the
## best solution. Finding the most effiknow—you might get certain parts store items, needed to change to
## cient way to break up the menu also
perfect. That was the goal, anyway. accommodate the number of items in
## required some very slight changes to
## the store. The side on the right need-
## the design. These changes were small,
## ed to change to accommodate the
Breaking Up the Art and making them allowed us to use
## number of items carried in the ship.
## fewer pieces of art.
It may have been faster to simply cre-
## The same art we created for the Trade
ate the entire piece of art needed for At the time, it seemed like we were
## dialog box would also be used in the
the trade interface and give this to the doing more talking than creating art,
## dialog box for accepting missions.
programmer. While this technique but all that discussion was necessary

## 164 Chapter 14 ■ Designing an Interface

This Mission dialog box would have If I designed it correctly, the the same basic layout and be based on interface would be easy to the same concepts as the Trade dialog break up into powers of two. box, but the amount of information For example, the horizontal would be different. More information rows in my mock-up are all needed to be displayed in the right 32 pixels tall. As I sketched side of the dialog box, as this was them, I made the assumption where the information about the mis- that I would have 32 pixels of sions the player had already accepted space. If I needed more, I would be displayed. knew I would need to jump
                                           to a 64-pixel tall row. If I’d Figure 14.9 Different situations required different
Figure 14.9 shows two different sizes sizes for the Trade interface. It was designed to be
## had a 34-pixel tall row, those flexible.
of the Trade dialog box that can be
## extra two pixels would have
created with the same art.
## actually added another 32
It is always best to design an interface pixels to the height. with breaking up the art in mind.
## After a lot of thought, the game
Even when doing the rough pencil
## designer and I came up with
sketches, I was thinking about how it
## what we felt was the most effiwould be best to break up the art, and
## cient way to create the art for this
so I designed it accordingly. This
## interface. This plan required six
meant that I needed to think about
## pieces of art. If you look at Figure
pixel sizes of each element in the
## 14.11, you can see our crude
design in powers of two, as most game
## sketch that we scribbled on the
engines require that pixel dimensions
## whiteboard—I added the green
of each piece of art be a power of two
## stuff digitally to help identify the
(see Figure 14.10). There are ways to
                                           different pieces. All of the pieces Figure 14.10 Each section had to be created in
work around this by leaving extra
                                           of art are labeled with an R to a size that was a power of two.
space in the file, but it is much more
## indicate that they need to be
efficient to have art that works well with this limitation.

## Creating the Art 165

## Both pieces 1 and 2 were made to look
## as though they connected to the pur-
## ple ship information box that
## appeared at the top of the dialog box.
## Both of these pieces of art were 32
## pixels tall and 128 pixels wide. The left
## 32×32 pixel square served as the end
## piece. The second 32×32 block was
## the tiling center. The third 32×32 sec-
## tion was the right end piece and the
## last 32×32 section was blank. You can
## see more about how this scaleable art
## works in Chapter 9. You can see what
## this art looks like in Figure 14.12.

## Figure 14.12 These two pieces of art are
## the final ones used for the top row on the
Figure 14.11 This is the final sketch on our whiteboard; it shows how the interface would Trade dialog box. be pieced together.
## The pieces labeled 3 and 4 in Figure
dynamically re-scaled. (The size of the tion; this is the section where the title 14.11 are also 32 pixels tall and they dialog can change based on how many will appear. The piece of art labeled 2 are scaleable because they can be tiled pieces of art are tiled together.) The will be at the top of the list of items in and made any size, just like the two pieces marked with an H need to have the ship. It will be all purple except for pieces of art above them. This is a highlighted state. a small corner piece that will round where the store items and the ship
                                               off the transition from the purple to items will be located. If there are five
The piece of art labeled 1 will be items in the ship, piece number 4 will
## gray.
mostly purple but will also include be duplicated five times. the transition to the gray store sec166 Chapter 14 ■ Designing an Interface
In order to make the interface clear, I cerned about file size because we put a line to separate each row. These planned on creating a downloadable lines were placed at the top of each demo. The entire download needed to
## Figure 14.14 These two pieces of art
section, and they appeared as though work like the others, but they are much be as small as possible. In the end, we they connected across both pieces of smaller. They form the cap on the end of didn’t have many files and they were art. You can see what the final art the vertical columns. all small. The file size of the total looks like in Figure 14.13. game was also small.
## As you can probably tell by this
## description, creating the initial art for
## the Trade interface was not a quick
Figure 14.13 These two pieces of art are process, but doing it this way actually the final pieces used for the middle rows on saved time in the end. I created six the Trade dialog box.
## pieces of art and with these six pieces
## of art we were able to create a dialog
The pieces labeled 5 and 6 in Figure box that scaled to every situation.
14.11 are only eight pixels tall and 32 Breaking the art up into small pieces
pixels wide. They are scaleable bars, not only saved space, it also allowed just like pieces 3 and 4, but they are for a lot more flexibility. broken up into 8×8 sections. These pieces of art are purely decorative. Figure 14.15 This is what it looks like Many different dialog box boxes were
                                               when all of the pieces are put together. needed for the game. We could not
They create the bottom caps on the Trade dialog box. Pieces number 5 have anticipated all the different sizes and 6 also included a bar at the top. I have worked with several program- that would be needed in the game, The line on this bottom piece of art mers who always want the art in one and even if we could have, creating all separated this piece of art from the big piece. Often, this is a sign of inex- the various size dialog boxes would horizontal row above it. You can see perience. There may be a rare case have required a lot more art. Scaleable the final art for the bottom piece in when submitting the art in one piece art allowed the programmer to adjust Figure 14.14 and everything put is actually the best solution, but most the size of the dialog box to fit the together in Figure 14.15. of the time it is worth the effort to amount of information that needed
                                               break files up into pieces, as it saves to be displayed.
## space. In our game, we were very con-

## Photoshop Techniques 167

Selected Rows know what he was buying when he The pieces of art that are labeled 3 pressed the Purchase button. In order and 4 in Figure 14.11 are items the to make this clear to the player, we player can select in the game. These needed to make the buttons look as two pieces of art were placed next to though they could be pressed; the each other to form horizontal rows. buttons also needed to communicate The entire horizontal row could be what would happen when they were selected by the player at once. Because pressed. this entire row could be selected, a As I mentioned previously, the backhighlighted state was needed for both ground of these additional pieces of of these pieces of art, just as is needed art was gray so it was similar to all of for a button. the art used for the items in the store.
## Figure 14.16 When each row is
More art was created for this dialog The information was about the items selected, it highlights and more box. When each row was selected for purchase, and the gray color was information is displayed in the additional
## used to make this fact clear. We used dialog box.
more information was displayed to the left of the row. The Purchase but- buttons with an arrowhead shape to tons appeared and information about indicate which way the selected item
                                            would move if the button were Photoshop Techniques
the item that could be purchased was
                                            pressed. It would either move from I created all of the art for this section
displayed. All of this art had to work
                                            the store into the ship or from the of the HUD using Adobe Photoshop.
well together.
                                            ship into the store. This is my favorite program for creatIt was important that the player ing interface art with this look. Other
understand what the Purchase but- Figure 14.6 shows the highlighted bar, software has a lot of the same features, tons could be used for and that it be the Purchase buttons, and an area but Photoshop is by far the most easy for the player to connect the where information could be dis- commonly used software in the information to the item that was played. industry, and I know it best. available for purchase. He needed to Photoshop includes many features
## that I am familiar with that make
## tasks easy and fast. I will show you
## how I used Photoshop.

168 Chapter 14 ■ Designing an Interface
When it comes to creating interface The green circle in Figure 14.17 indi- style, it will appear in the Styles menu. art, my favorite features in Photoshop cates the button in Photoshop used to It can be applied by simply clicking on are the layer effects that can be creat- access the layer effects. it when the correct layer is selected. ed using the Add Layer Style button.
                                                   A big advantage to using the layer You can see where to add a new style
These features should not limit your
                                                   effects is that it is easy to maintain a in Figure 14.18.
vision, though—that is, you should
## consistent look throughout your
not rely on the layer effects so much I used the Bevel and Emboss effect on
## entire interface. Once you have creatthat you don’t create anything that the Nomad interface. You can see this
## ed a layer effect and adjusted it just
doesn’t use one of them. If a layer effect on the purple areas of the inter-
## the way you want it, you can easily use
effect gives you the look you want, face. I first created this effect on the
## this same effect through your entire
then go for it. Ship Information panel. Once it was
## interface. After you save the layer

Figure 14.17 This little button gives you access to a lot of different effects that can be very helpful when creating art for an Figure 14.18 Once you have an effect adjusted just the way you interface. want it, you can save it and use it in other places in your interface.

## Step-by-Step Art Creation 169

created, I saved it and used it on all of much more difficult if I had created curve, the first pixel in the next 32×32 the purple pieces in the Ship section the bevel effect by hand. is slightly lighter than the rest of the of the Trade interface. I also used the drop shadow. You can see in the lower
## Using the effects in Photoshop not
same effect, saved in the Styles menu, part of Figure 14.19 how this shows
## only allows me to keep the same look
for a great deal of the HUD and even up when it is tiled.
## across the entire interface, but it also
in the front-end interface. This
## offers precision and consistency
allowed me to be very accurate—I
                                                   across a single piece of art. This is very Step-by-Step Art
could add the same two-pixel bevel
## important when you’re creating art Creation
with the lighting coming from a con-
## that is tiled and pieced together in the
sistent angle to any piece of art with a In this next section, I will take you
## game. If there is any variation in a
single click. This would have been thorough the step-by-step process I
## drop shadow, for example, it can look bad when used to create the art for the Trade
                                                                 tiled, so you will still need interface. I hope that reading about
                                                                 to be careful. this process will reveal more informa-
## tion that you can use in your interface
## For example, a curve that design.
## gets too close to a middle
## section can cause prob-
## The Ship Information Panel
## lems—a slight difference
                                                                in the color of a pixel As I previously mentioned, I began by
                                                                becomes much more creating the art for the Ship
                                                                noticeable when it is Information panel. I created the shape
                                                                repeated. Figure 14.19 of the top orange bar. As I made this
                                                                shows how this can hap- top bar, I knew that this entire section
                                                                pen. You can see how a would be created out of a scaleable
                                                                curved area comes very box (see Chapter 9 for more informaclose to the right edge of tion). Because it was a scalable box, all
                                                                the first 32×32 section of four corners had to fit within a 32×32
                                                                the art. Because the drop box, and the top edge had to be
Figure 14.19 A very slight difference, even in only one repeatable. I filled it with the orange pixel, can be visible when this section is repeated several shadow is affected by this times in a game.
170 Chapter 14 ■ Designing an Interface
color and applied a layer effect to give like with a raster level. (You can Note it the beveled edge. You can see this always right-click on the layer in the Photoshop is a raster-based program. decorative bar in Figure 14.2 Layer window and convert it using the This means that most features and the
                                             Rasterise option.) I applied a bevel final file are based on the use of pixels.
                                             that made it appear like a little bump There are a few vector features. This
                                             or rivet. I made copies of this layer means that the shapes created using
                                             and positioned one in each of the bot- these features are not pixel-dependent.
Figure 14.20 This decorative bar at the top of this piece of the HUD is created in They can be scaled and moved easily.
## tom corners. You can see these rivets
such a way that it can work with a Only when the file is saved in a format
                                             in Figure 14.22. other than a PSD or when the layer is
scaleable box.
## “rasterized” by right-clicking on the
I then created a new layer below the layer and choosing this option are
## these shapes converted to pixels.
orange bar. I created a square selection that was not quite as wide as the top bar. I inset this box several pixels I saved this file in a Photoshop forfrom the edge of the top bar so that mat. This format retains all of the the top bar would extend past the Figure 14.21 The purple box is on a layer and layer effect information so edge of the box slightly. When I saved separate layer and has the same bevel that I could always open this file and the final file, I made sure that the file effect applied to it as the bar above. easily make edits. Another benefit is format supported transparency so that you can use the separate layers in that the player could see through other areas. If I need a rivet in anoththese pixels to the game. I placed the er file, I can open the Photoshop file same bevel effect on this layer that I and drag this layer onto the new file. placed on the bar above. Figure 14.21 Whenever I need a bar similar to the shows the box behind the top bar. top bar in this file, I can drag this layer I then used the Ellipse tool to create a and place it into a new file. The layer
## Figure 14.22 I added small circles that
small circle. The advantage to using a appeared to be some sort of rivets. effect will also be transferred. vector shape is that it could be easily scaled, yet you can apply effects just

## Step-by-Step Art Creation 171

I then merged all of the visible layers. I then coped 32×32 sections of this The ship needed to be larger than a This makes it possible to select and merged art and pasted them into a 32×32 so that I would have plenty of copy pieces from all of the layers. new 128×128 file. I copied the four room. A 32×32 image was not enough After all of the layers have been corners, the sides, the top, the bottom, to see the ship clearly so I had to jump merged, when I select and copy the and the middle. I then placed these to the next size, 64×64. I only needed only layer the layer effects are includ- nine sections into the correct spots in a few more pixels so the ship image ed. Before the layer is flattened, the the new file in order to create a did not fill this entire file, so—I left Copy and Paste functions ignore the scaleable box. The tricky part about extra transparent space. The prolayer effects. If you don’t merge layers, this art was that the sides and bottom grammer placed this box based on the you will only copy the base art. corners had to be inset so they would upper-right corner of the file, so the
                                                           line up correctly. Figure extra space ended up at the left and
## 14.23 shows the final art. bottom of the file.
                                                           Next, I needed to create the First I created the render of the 3D
                                                           box with the ship logo in it. model and used it to determine the
                                                           I created the background right size for the ship image. The playbox and gave it to the pro- er needed to recognize the ship. I tried
                                                           grammer so that he could several sizes until I found the smallest
                                                           place it where it belonged. size where the details of the ship were
                                                           The image of the ship was a reasonably recognizable. There was
                                                           separate image—I created a no need to take up space with a ship
                                                           new ship image for every image that was too large. I then knew
                                                           ship possibility in the game. how big this file was and I used this
                                                           These ship images were information to determine how big the
                                                           small renders of the actual box in the background should have
                                                           3D model. We did it this been. I created a square selection that
                                                           way so that the ship image was the size of this outer box. I used
                                                           would change as the players the Smooth Selection option in the
                                                           ship changed during the Select/Modify menu to round off the
Figure 14.23 This is the final art used for the Ship game. corners of my selection. Once I had Information panel.
172 Chapter 14 ■ Designing an Interface
the proper selection shape, I filled it Selection dialog box and then hit the I placed the ship icons in a 64×64 file with a dark purple color. I added a Delete key. This created a two-pixel to match the background. These icons Pillow Emboss effect to this layer. border around the background. I were transparent around the ship. The
                                                   added a two-pixel bevel to this layer to ship was placed in the right location
Next, I duplicated this layer, locked
                                                   give the border a little depth. in this file so that if it the ship icon file
the transparency, and filled it with the
## were laid over the background file, it
menu’s orange color. I left-clicked on You can see where to lock the trans-
## would be positioned correctly. This
this layer in the Layer window while parency of the selected layer in Figure
## made it easy for the programmer to
holding down the Ctrl button; this 14.24. You can see the final result in
## position the image of the ship over
gave me a selection around the edge Figure 14.25; Figure 14.26 shows the
## the background. He simply put these
of the layer. final piece of art for the background
## two pieces of art in the same location
## of the ship icon. Notice the extra
I again used the Select/Modify menu, and the ship was in the right spot. You
## space.
but this time I chose the Contract can see this in Figure 14.27.
## option. I entered 2 in the Contract

## Figure 14.25 The
## background and border are
## each on a separate layer
## with different layer effects
## applied to each layer.

Figure 14.24 If you lock the transparency and then press the Alt + Delete, the opaque portions of the layer will fill with your Figure 14.26 This is Figure 14.27 The ship icon appears to be in foreground color. the final art for the ship a weird spot in the file, but this will allow it to
                                                                     image background. be positioned correctly over the background.

## Step-by-Step Art Creation 173

The Trade Dialog Box The next step was to create the title The next step was to complete the bar area for my design. I created a new Trade dialog box that would be locat- empty layer on top of the gray layer I ed under the Ship Information bar I had just created. I changed the grid in just created. I began to create the the options to have two subdivisions Trade dialog box by starting with the in every 32-pixels and used this grid Photoshop file that I had just com- to see how tall each section would pleted. It contained the art used in the need to be. I wanted to create a purple Ship Information bar. I started with section in this layer that did not comthis file so that I could see both the pletely fill the 32-pixel tall section. In completed Ship Information box and this new layer, I made a rectangular at the same time see the Trade dialog selection just below the Ship box I was working on. This way, I Information bar. This selection was could make sure that both pieces the same width as the entire gray secworked well together. tion of the background. The selection
                                            was 24 pixels tall, so it was short Figure 14.28 The gray area needed to be
I started by creating a new layer below enough that a small portion of gray big enough to fit this curve. all of the existing layers. I made a rec- would fit into the 32-pixel height. The tangular selection the same width as gray area needed to be big enough to the Ship Information bar that was have the curved area circled in green already in this file. I then rounded the in Figure 14.28. corners of this selection by using the Select/Modify/Smooth option, with a I needed enough gray at the bottom radius of 6. I filled this selection with of this 32-pixel tall section to create the gray color. I did not worry about this curve, but I also needed enough the three corners that did not need to room on the purple area for a title. be rounded because they would all be Once I had the right selection, I filled covered up. The only corner that real- it with the purple color. I then roundly needed to be rounded was the ed the selection with the Smooth lower-left corner. option and then inverted the selec- Figure 14.29 This is the
                                            tion. I used the Eraser tool to round of first block of purple I added
                                            the bottom-left corner of this purple to the lower section.
## selection (see Figure 14.29).

174 Chapter 14 ■ Designing an Interface
This curve needed to fit within the 32- I added the same bevel effect as on the was not visible because it was the pixel height, which is marked in Ship Information bar. I also added the same color as the image behind it. I green, but I also needed room to place same rivet-looking circle as the Ship then added a one-pixel bevel to this a title in the area marked with yellow. Information bar. I was able to dupli- line and duplicated it several times. I
                                               cate the layers that contained the moved each copy down 32 pixels.
Next, I made a large rectangular selecother rivets and move them down Each line would be placed at the top tion that started at the left edge of the
                                               into position. (See Figure 14.32.) of the 32-pixel row. Placing these lines
gray area and then I selected beyond
## at the top of each row rather than the
the area where I wanted the lower half The next step was to add lines to sep-
## bottom meant that a line would need
to be (see Figure 14.30). I then made arate each row. I created a new layer
## to be placed at the top of the bottom
another selection with the left side above the purple layer. I made a two-
## caps.
right where I wanted the edge of the pixel tall selection the entire width of lower section to be. I smoothed this both the purple and gray area and I had already created the bottom cap selection and deleted part of the pur- then filled it with the gray color. I with the rounded corner when I creple area, leaving a rounded edge (see selected the part of the line that was ated the gray background area. The Figure 14.31). over purple background area, locked bottom of the purple side of the menu
                                               the opacity, and filled this part of the was still needed. I went back to the
## line with purple. At this point, the line

Figure 14.30 This Figure 14.31 Smoothing Figure 14.33 These lines addition is a little wider the selection and deleting have a bevel effect and than the final goal. I will the extra purple leaves a Figure 14.32 I added have been spaced 32 pixels use the selection to delete rounded inside corner. the bevel and rivets. apart. the rounded corner.

## Step-by-Step Art Creation 175

purple layer and made a rectangular information that is not in the selection that was the width of the final format. Once I had saved purple area and was eight pixels tall. I this file, I needed to break it up rounded the selection using the into pieces. The easiest way to Smooth option. do this was to merge all of the
## visible layers, select each secThe problem with this selection was
## tion, and then paste them into
that I only wanted the bottom corners Figure 14.34
                                            the correct size files. I also put Smoothing the
rounded, so I added these corners
                                            the art in the correct layout so selection and deleting
back to the selection by holding down
                                            that it could be used as scale- the extra purple leaves
the Shift button while using the a rounded inside
## able bars. You can see all the
Selection Marquee tool. Once I had corner.
## final pieces in Figure 14.35.
the selection shape I wanted, I filled this selection with purple. I then used the Select/Modify/Contract option with a setting of 2 and deleted the area in this selection. Without changing the selection shape I just used, I selected the gray layer and filled the selection with gray. This entire bottom piece was only created to make the dialog box look better—it is a way to add a smooth corner. This is why it was only eight pixels tall. You can see the final effect of the bottomright section of the dialog box in Figure 14.34. I saved this file so that I could make changes to it later. The final art used in the game would not have the layers Figure 14.35 This is what each of the final pieces of art looked like. This is the art and layer effects that could be easily actually used by the game engine.
## changed. A Photoshop file stores this

## 176 Chapter 14 ■ Designing an Interface

Showing Selection separate the rows. Just placing a glow I then pasted a copy of the line on top The next step was to create a highlight on each piece of art would also cause of this art so that it was not covered by for the entire row that actually the effect to separate the two halves the Inner Glow effect. If you look at extended out past the row. I also because the row was actually com- Figure 14.36, you will see that the two needed an area in which extra infor- posed of the purple half and the gray highlighted halves look as though mation about the item for sale could half, each on separate levels. What I they could be combined. be placed. The horizontal row was wanted was for the glow effect to made up of two halves, a gray half and appear to affect the entire row, not the a purple half. I needed to make a two halves. I got around the problem highlight for each of these pieces of by putting the glow effect on a new Figure 14.36 These two pieces of art art that fit together to look like one layer that extended past the center were used in the game. long row. area, where the two halves met. I then
                                           added a blank layer above this piece of When a row was selected in the Trade
I used the Inner Glow effect to make art, linked the two layers, and then interface, the bar extended further to the bar look as though it were high- merged them. I merged the layers the left. I created the piece of art for lighted. This effect also enabled me to because this merge embedded the this extension of the row. I used the use the same-size art as on the un- glow effect in the layer. The layer same technique that I used for the highlighted row because the glow did effect looked the same, but it was no other two pieces, but I added a piece not extend beyond the row. The Inner longer really a layer effect. This of art that served as an end cap on the Glow effect also did not cover any allowed me to select and delete the left. Just like the other pieces I just information on the rows above and extra glow effect that I had created created, I had to create the glow effect below. If I wanted to use an Outer past the center where the two halves on a larger piece of art and then cut it Glow effect, it wouldn’t have fit into met. If I left the inner glow effect and down to size. The entire piece of art the 32-pixel tall selection. the image in the layer would have that was place to the left of the row I needed to pull a couple of tricks to been the correct size, the glow effect was also created as a scaleable bar so make the inner glow work. If I had would have split the two halves. that the size could easily be adjusted. just put the inner glow in the existing art, it would cover up the lines used to

## The Big Change 177

Figure 14.37 shows the highlighted effect before the art was cropped. You can see the final art in Figure 14.38.
Figure 14.37 This is the side piece before it was cut down to size. It includes Figure 14.39 This is the unwanted glow effect on the right the final art for the edge. scalable information
## box.

Figure 14.38 I removed the left edge in the final art so that it would visually connect to the rest of the row.
The last piece of art I needed was a Figure 14.40 This is what all of the art looked like when it
## was put together.
background for more information about the item for sale. Just as for the area I created for the ship informa- Notice in Figure 14.39 that this piece art for the Trade dialog box. We ended tion, I created a scalable box so the of art had a gray background because up using this art in other areas, like size of this background also could be it contained information about the for the Accept Mission dialog box. adjusted. This way, it was easy for the items in the store. You can see how it Why didn’t we use the art for the size of this box to dynamically change is all put together in Figure 14.40. Trade dialog box? Well, we put the art depending on the amount of infor- in the game and tested it out, and mation that was displayed for each despite all of our careful planning, it item.
                                              The Big Change was still difficult for new players to
                                              After all of this work, the game figure out, and we still had to do a lot
                                              designer and I decided not to use this of explaining. We realized that Nomad

## 178 Chapter 14 ■ Designing an Interface

still would have required a complicat- opment and basically redo the game Summary ed tutorial. This new interface was to make it better. If you have a huge
## I hope that reading about some of the
better than any of the other trading budget, you can get a great game with
## challenges I had in creating this small
games we had played, but we had not this method. It is always difficult to
## piece of an entire interface helped you
gone far enough. It was very impor- leave something behind after you’ve
## to have a better understanding of how
tant to make this game easy to under- spend a lot of time on it, but hanging
## complex the interface design process
stand and fun to play. on to a flawed solution can limit your
## can be. Don’t let technical limitation
## game. We worked out the new
After watching a new player struggle dictate the final look of your interface.
## method for “trading.” This new soluto understand Nomad, the game Design it first and then find a way to
## tion made Nomad easier to underdesigner came up with a great idea: create it.
## stand and more fun to play. The basic
Get rid of the Trade dialog box alto-
## trading action was simplified, and the
gether. If it isn’t working, then why
## boring part, in which the player comuse it? Skip the interface and put the
## pared numbers in the old style of
ability to pick up and sell stuff right
## menu trading, was gone.
into the 3D game world. This new idea limited the amount of informa- Willingness to make improvements is tion we could easily display in the 3D the only way to develop better games. game world, but it also really simpli- You need to make changes to the fied trading. It was more fun. There important areas. It is important to was no longer a break from the game make sure that the basic game-play is world into a dialog box. fun—adding more stuff to a game
## won’t fix a problem with basic gameI chose to share this example because
## play. It is important to identify this
I feel that this is an important part of
## core game-play early so that the extras
game design. Many of the big, block-
## don’t distract you. As in this case, the
buster titles are done this way. Some
## menu and HUD had a big effect on
of these developers have an almost
## the game-play and getting this right
finished game halfway through devel-
## was very important.

     Chapter
       15
Creating an Interactive
## Mock-Up

                                           when you need it most. Once you Instead, I will do my best to give you a
      n this chapter, I will show you
                                           know how to create such a mock-up, brief introduction to ways in which
      how to create a simple yet effecyou will want to do so every time you Flash can be used for game interfaces.
      tive interactive mock-up.
## design an interface, I guarantee.
I Creating something more than just a still mock-up can be incredibly help- There is so much software out there
## I will keep things simple in this chap-
## ter, and will give you only a brief
ful—you can see your design in action that can be incredibly useful to you explanation of how Flash works. The before it is put into the game. when you’re designing interfaces. purpose of this explanation is to help
                                           Many applications are so deep that it you understand how Flash, or a simiCreating interactive mock-ups can
                                           is almost impossible to master every lar program, can aid you in interface
help you in many ways and is well
## aspect of them. In this chapter, I will design.
worth the effort to learn. Not only can
## use Macromedia Flash. This chapter is
you work on the details of the inter- This chapter may not contain enough
## not meant to teach you how to use
face yourself, but also others can see information to begin using Flash if
## Flash, though—Flash is a complex
your interface in action and give you you have never used similar software.
## application, and it would require an
input in the early stages of the design, However, when you combine this
## entire book to teach even the basics.

180 Chapter 15 ■ Creating an Interactive Mock-Up
information with other material— Realizing Your Vision give you the influence over the look of such as a Flash primer book or maybe screen items you might lack without
## It is very satisfying to have control of
your existing knowledge of a similar the mock-up. The programmer does-
## the animation in your game and be
application—you’ll be on your way to n’t have to pick your brain—he can
## able to make the buttons actually go
using Flash to create super cool video just check the mock-up to see how
## to the right screen yourself, without
game interfaces in no time. you want things to function and
## the help of a programmer. If the pro-
## move. There is little room for confu-
## grammer controls the animation and
## sion when he can see it.
The Ideal Situation interactivity of an interface, you will In the ideal situation, you would be rarely get exactly what you want. The
## programmer may not understand Experimentation
able to control all of the movement and interactivity of the interface in what you mean when you say some- If you can control motion and interthe final game. You would be able to thing like, “Have the buttons scale up activity, you can experiment with create the art and get it completely and down and look bouncy.” He may your design. You can easily try things ready for the final game—you’d con- envision something totally different out and see how they look. It is much trol animation, button behavior, and than what you see in your head. harder to experiment when it takes a everything else. Sometimes the programmer just long time to go from concept to the
                                           doesn’t care about your vision—he point where you can click through a
You could control all of the features of menu in the game engine. Creating your game using a software tool, and might do what you ask him to, but he
                                           really doesn’t think how a button the art in Photoshop and then going
then you’d simply press a button and through all of the steps—including export a file, run the game, and see bounces is really all that important.
                                           To him, the simple animation you’re opening the file up in another prothe changes. The programmer would- gram, converting it to a different forn’t even know how the buttons move asking for does not show off any new
                                           and cool technology, and it isn’t near- mat, saving it with a different file
and highlight until he saw them name, and so on—to prepare it for working in the game. Be grateful if ly as fun and rewarding to create.
## the game can take a lot of valuable
you are in such an ideal situation— It would be great to have complete time (and it’s tedious, to boot). This is most of us will have to count on the control, but as I’ve said, you rarely especially true when the process programmer to animate our inter- will. Handing the programmer an involves another person; if you need faces and make the buttons function interactive mock-up can help you to wait for a programmer to put the correctly. show him exactly what you want, and

## Commercial Tools 181

art in the game, you might have to that, in the future, more and more Using a program like Flash is great, wait a long time before you can see it engines will allow interface designers but rarely can you use all the features in action. to use commercial tools effectively. in Flash in the game. There are often
## many limitations in the engine that
When it is hard or takes too long to It’s not easy to use a program like
## are not in the software. This is the case
try out new ideas, most designers will Flash to create interfaces for a game. It
## with RenderWare. Make sure you
be inclined to do what they already usually requires a lot of technical
## understand what you can and can’t
know works. Creativity is discouraged understanding and a lot of time. This
## do, as you will need to work within
by complex processes. It might be dif- may be why some designers choose
## these limitations.
ficult to explain to a programmer not to use programs like Flash to crethat, after all the effort that you and ate final assets. It can be tricky to learn Even with the possible difficulties of he put into a ripple effect, you think it how to give information to the game communicating with the game engine looks dumb and you want to try engine. If the player chooses Expert and determining which features will something else. mode, the game engine will need this work in the game, it is worth it to
                                            information. If there are three saved spend the time to use some commerThe ability to create an interactive
                                            games, the interface will need to dis- cial tools. Doing so can result in a
mock-up can provide you the opporplay these saved games, and it will much better interface than if you left tunity to be more creative because it
                                            need to know how many games are it up to someone else.
can be much easier to experiment.
## saved and maybe even the name of the
## saved game. In these cases, you will Why Flash?
Commercial Tools need to give the programmer (or
## I will use Macromedia Flash to create
Many game engines use commercial game engine) the ability to affect the
## my mock-up. I chose Flash because of
tools. For example, the RenderWare interface. The interface will need to
## the flexibility and control it gives me.
engine has the ability to export change, based on direction the game
## It is one of the most popular and fully
Macromedia Flash files and use them engine gives the interface. This can be
## featured tools on the market today for
in the game. Many interface designers the toughest part of this approach,
## creating all kinds of interactivity.
who are using RenderWare don’t even but it can be done. It just requires
## Flash is powerful enough that you can
know that they can use Flash. When good planning and communication
## make an entire game start to finish
you use Flash, you can animate and with the programmer who is working
## using it. You don’t need to know how
design the menu flow. My guess is on the interface.
182 Chapter 15 ■ Creating an Interactive Mock-Up
to use all of these features in Flash, it. If you don’t have this basic knowl- Because Flash is interactive, you can though, to create a simple interactive edge, then learning a program’s new stop on a single frame, move backmock-up. features is pointless. ward, and jump around. The concept
## of time even gets a little more compliWhen you use Flash, it is easy to let
                                          Using Frames cated than that. You can have several
others check out your results. Flash
## frames of a movie clip or a button
has the ability to export an EXE file The terms used by Flash will be famil-
## within a single frame of the basic
that will run on just about any iar to anyone who has used animation
## timeline. This allows you to have an
Windows PC. You can export into software, as it uses the same terminol-
## animated button that has a fiveMac format or even into HTML that ogy and logic found in the animation
## frame animation appear in one frame
can be used in any Web browser (with industry. As you probably know, ani-
                                                                                     (or screen) of the overall timeline.
the appropriate plug-ins). The profes- mation is really a bunch of still pic-
## Understanding this concept is key to
sional versions of Flash allow you to tures, called frames, that are played
## understanding Flash.
export into PDA and cell phone for- back rapidly so that they appear to mats. move. Flash’s use of this approach Note Compatibility is seldom an issue makes it logical. One thing that might
## It may be helpful to follow along in
when you’re using Flash. You can send be a bit confusing is that the term Flash as I walk you through the your interface to a computer-illiterate frame is used in Flash even if objects process. It will be much easier to producer, and he can review it with- in the scene do not move—for exam- understand how this mock-up was creout installing anything. ple, if you jump from one screen or ated if you try it yourself in Flash. You
                                          page to another, you are changing will find a trial version of Flash on the
                                          frames in Flash. A frame is a basic unit CD that comes with this book.
Introduction to Flash of time if the file is moving forward. The most difficult part of learning You can stop on a single frame. When you first open Flash, you will new software is simply figuring out Images, text, and objects all exist have one empty frame. If you look at the basic logic of the program. Even if within a frame. the timeline across the top of the you don’t know all the features or However, a frame in Flash is a little screen, you will see a red rectangle understand what every button does, if different from those in an animation. with a thin, red line extending down. you understand the program’s In an animated movie, frames are This is how you move through the approach, then you can begin to use played back at a constant rate. frames in your scene. As you start, you

## Introduction to Flash 183

only have one frame, so you can’t drag ing changes because nothing is in way saves file space because it does this slider. Once you add more frames either frame. not need to be saved multiple times. to your scene, you can use this slider After you have imported your images,
## You now can put something in both
to move around. (See Figure 15.1.) you can open a Library window and
## of these frames. There are tools for
## see all of the objects in your library.
If you insert a single frame by select- creating vector objects within Flash,
## You can then drag these images and
ing Insert/Timeline/Frame from the but when working on interfaces for
## drop them onto your page.
menu across the very top of the screen games, most often you will use images (or by pressing F5), you will see the created in other programs (like Once you have placed an image into white block under the red indicator Photoshop) and import them into the scene, the two frames in the top of get twice as big. You now can click and Flash. You can do this using the your screen turn gray (see Figure drag on the red time slider and move File/Import/Import to Library option 15.2). They were white when there between these two frames, but noth- from the top menu. This will place the was nothing in the scene, but they
## image into a turn gray to indicate that there is
## library associat- something in that frame.
## ed with this file.
## There is still no difference between
## In order to save the two frames in your scene because
## space, Flash will the image is in both frames. If you
## import one want to see a difference between
## image into the frames, you will need to place a sec-
## library. You then ond image in the second frame but
## can use this not in the first frame. The best way to
## image as many do this is to create a new layer.
## times and in as
## many places as Using Layers
## you want In Flash, layers function much like
## throughout your they do in other programs, such as
## file. Re-using Photoshop. Any object on a higher
## images in this layer will cover an object on a lower
## layer. You can put many objects into
Figure 15.1 This file contains only one blank frame. You will need to add more frames before you can move from frame to frame.
184 Chapter 15 ■ Creating an Interactive Mock-Up
Figure 15.2 Once you have imported an image into the library, Figure 15.3 This button will create a new layer. you can drag it into your scene. Once you have done this, the frames turn gray in the timeline.
one layer, but it is easier to keep track you can add a new image to it. Figure You can select the layer by either clickof all of the images and to animate 15.3 shows you where the button is to ing on the bar with the layer’s name them if you keep them all on separate add a new layer. (by default, Layer 2) or by clicking layers. onto the frame in the time line. This
## Now you will need to put an object in
## will put the object into the proper
You can create a new layer by pressing the second layer. You can import
## layer.
the Add Layer button, the icon that another image into your library and looks like a page with a corner turned drag it into the scene. This time, when Figure 15.4 shows the correct layer up. It has a plus sign next to it and is you drag the image into the scene, selected. located in the upper-left section of the make sure that the correct layer is screen. Once your new layer appears, selected.

## Introduction to Flash 185

Figure 15.4 Select the layer before you drag an object into your Figure 15.5 Layer 2 is empty in frame 1 and includes an image in scene. The object will be placed on the selected layer. frame 2.
The frames in this layer will turn gray first frame, on Layer 2. Once this Finally, the two frames are different. once they contain an image. Like frame has been selected, you can click You can drag the red bar back and before, the frames are still the same— again and drag this circle into the sec- forth to see the differences between there is no difference between frames ond frame. You can use this click-and- the two frames. 1 and 2. Both placed images are in drag method to extend or shorten the
## Working with Flash can, of course,
both frames. life of the images in a layer.
## become much more complicated, but
You can remove the image on the sec- Layer 1 is empty in frame 1 and this is the basic idea—create a bunch ond layer from the first frame by includes the image in frame 2. You can of frames (screens) and move from clicking once on the black circle in the see which frame is empty in Figure frame to frame, based on input from
## 15.5. the user.

186 Chapter 15 ■ Creating an Interactive Mock-Up
Animation in Flash rotation, scale, and any other attribut- example, I made the animation last 20 Working with animation in Flash can es that can be animated (such as frames. be very complex. I will keep this dis- transparency). After you set the next
## Figure 15.6 shows what the timeline
cussion simple and describe only key frame, you can tell Flash to create
## looks like when it is extended for 20
some of the basics—the principles the frames in between the key frames.
## frames.
that you will often use when working Flash refers to this as motion tweening.
## Once you have enough frames to
with game interfaces. I covered some Before you can create an animation in
## work with, you can tell Flash that you
of this material in Chapter 11, you Flash, you will need to extend the
## want the object to animate by rightmight recall, but I think it bears layer so it lasts the entire length of the
## clicking on the section in the timeline
repeating here. animation. There are several ways to
## and choosing Create Motion Tween.
A common term in animation is key do this. The simplest way is to select
## You can select any of the area between
frame. This term has its roots in tradi- the black dot in the timeline that rep-
## the black dot on the left and the
tional hand-drawn animation. A key resents the frame was an important frame drawn image in your by the animator. Usually, the more scene. When you experienced animators would draw select the image these frames. in the timeline,
## notice that the
These experienced animators would image is also also specify the amount of frames in selected in the between these key frames, and less scene below. You experienced artists would then draw can add one the frames that blended between the frame at a time key frames. This process became by pressing the known as tweening. F5 button. Just Flash uses these same terms. Like in keep pressing F5 traditional animation, you can create to make the layer key frames in Flash. In these key as long as you frames, you set an image’s position, need for your
                                           interface. In my Figure 15.6 There are now 20 frames in the entire timeline.

## Introduction to Flash 187

empty box on the right. When a tween and changes must be made to the If you simply move the image to a has been added to an image, the back- image at the point of this key frame. new position in your scene, you will ground turns blue and a dotted line Simply select the frame where you create an animation. Once you have appears. want to add a key frame. Select the done this, you can drag the red slider
                                            last frame in the blue area with a dot- back and forth and watch your image
You can see the change in the timeline
                                            ted line. (The shortcut to add a key move (see Figure 15.8).
in Figure 15.7.
## frame is F6.) You can then make
Even though a tween has been added, adjustments to the image on this nothing moves yet. A key frame must frame. be added at the end of the animation,
Figure 15.7 A dotted line appears when a motion tween has Figure 15.8 Once a key frame has been added and the been applied to an image. positioned changed on this frame, you can see movement.
188 Chapter 15 ■ Creating an Interactive Mock-Up
Playback Speed parameters. Figure 15.9 shows you Using Scripting The frame rate of an animation is just where this box is located. You control the interactivity of anywhat it sounds like. It is a number that Changing the frame rate will have a thing in Flash through scripting. refers to the number of frames that big effect on the speed of your anima- Scripting allows you to give directions are played every second. Most game tions. You should adjust this frame on what to do when buttons are interfaces run at 30 frames per second rate before creating any animations. If pressed or when the file arrives at a (30fps). By default, Flash is set to you change it from 12fps to 30fps particular frame. These directions, or 12fps. This is easy to adjust. The cur- after you have created animations, scripts, can be located on a frame or rent frame rate is displayed just below then everything will move more than on an object like a button. If the script the timeline. If you left-click the box twice as fast as the default 12fps. is on a frame, the file will do whatevwith the frame rate displayed, you will Everything will look smoother at er the script directs when the file find a variety of parameters that can 30fps. reaches that frame. If the script is on a be adjusted. Frame rate is one of these button, it will execute the orders when
## the button is pressed. Again, scripting
## can be very complex and powerful,
## and I will present only the basics here.
## With a few simple commands—such
## as stop, Play, and Go to Frame—you
## can create some basic interactivity for
## the images in your scene. These com-
## mands are pretty straightforward, and
## do what you’d expect. Flash has many
## other capabilities, but I would suggest
## concentrating on the Stop, Play, and
## Go to Frame actions first.

Figure 15.9 Left-click this box to adjust the frame rate.

## Introduction to Flash 189

If you want to add a script to a frame, frame term and concept are still used, window, located at the bottom section the best method is to create a new even though this key frame will not of the screen, then hit the plus icon layer that will contain all of the have anything to do with animation. (+). Choose the Global actions placed on a frame. You can Functions/Timeline Control/Stop
## For this example, you can add a
put these actions in layers that also option. This will add the Stop action
## keyframe on frame number 2, as
contain other images, but it is much to this frame. When the scene arrives
## shown in Figure 15.10.
easier if you keep things organized at this frame, it will play until it comes and use a separate layer for all actions I wanted to add a Stop action to the to a Stop action. placed on any frame in the file. Once second frame. When you have the key
## You can see how to get to the Stop
this layer has been added, you will frame in the correct spot in your
## action in Figure 15.11.
need to select the frame where you action layer, you can add an action to want to put the action and add a key this frame. Select the key frame in the frame. This is a case where the key second frame in the Actions-Frame
Figure 15.10 You will need to add a key frame before you can Figure 15.11 This selection will add a Stop action to the selected add an action. frame.
190 Chapter 15 ■ Creating an Interactive Mock-Up
When an action script is added to a also name your button in the same ton are slightly dimmed. This way, frame, a small letter A will appear in dialog box where you choose the but- you can tell what is actually part of the timeline. These small letters can ton option. the button. If you look at the title bar be hard to see; this is one of the rea- at the very top of the screen, just
## You can see where to select the
sons to create a new layer for your above the timeline section, you will
## Convert to Symbol option in Figure
action scripts. It is even more difficult notice a change—you will see the
## 15.12.
when other images are on the same name of the entire scene followed by layer. It is also a good technique to Once you have converted an image to the name of your button. You are space still frames a fair distance apart, a symbol, the image becomes a but- always working inside the last item on even if the frames in the middle are ton. This means it has certain func- this list. In this case, you are inside the not being used. If you have a little tionality that it did not have before. If button. You can return to the main more room between two frames, it is you look in your library, you will see scene by selecting the text in this title much easier to see what is going on. both a new button and the old image. bar. In Figure 15.13 you can see the Keep your files organized. The image can still be used in your extra name in the title bar.
## scene in its non-button form, but at
## When creating simple interfaces you
Creating Buttons in Flash the same time, that same image is also
## will not need to go deeper than what
## used inside your new button and the
Like everything in Flash, the basic I’ve presented here; but it can get even
## button appears as a second object in
button concept is fairly straightfor- more confusing—you can put a
## your library. This image is currently
ward, but because of the depth of the movie or another button inside of a
## contained within the button.
program, working with buttons can button. Although the multiple levels become complicated. The easiest way Now this is where it may get a little can be hard to navigate, the ability to create a button is to select an image confusing. If you double-click on the Flash offers to put an animation or that you want to use as a button, button in your scene, you will open button inside of a button can be a right-click that image, and choose the up the button. In essence, you will be powerful feature. For example, you Convert to Symbol option that inside the button. The confusing part can place a looping animation in a appears in the menu that appears is that everything still looks very sim- button in the mouseover state. This when you right-click the image. ilar to the scene you were just in. The movie will play when a button is highSeveral options appear in this menu; only visual difference is that the items lighted. choose the Button option. You can that are not contained within the but-

## Introduction to Flash 191

Figure 15.12 This option will convert an image into a button. Figure 15.13 These icons and text let you know that you are
## working inside of a button.

Because this animation exists inside You might have noticed another back and forth to see these different the button, the whole button— change when you opened the button: states. Check out Figure 15.13 including the animation—can be the timeline changed. You can no again—it shows a button open so that placed in one frame of the overall longer see the timeline of the entire you can see how the timeline timeline, even when there are many file; instead, you see the components changed. Layers can also be added frames in the animation. Just remem- of the button. A button is a specific within a button, just like in the timeber to look at the text at the top of the type of object in Flash and it has some line for the entire file. screen if you get lost. Click on the text unique properties. Each button has
## As I said, even though there may not
to get back to the level where you three button states (Up, Over, and
## be any animation inside a button, the
want to be. For now, you can stay Down) and a hit area that can be all
## concept of key frames is used when
inside the button. adjusted in the timeline. Just like with
## working with buttons. If an image
## the overall timeline, you can scrub

192 Chapter 15 ■ Creating an Interactive Mock-Up
changes from frame to frame, you image with a highlighted version for problem is to create a box in the hit must add a key frame to make a the Over frame and a pushed-in- frame that encompasses the entire change. For example, if you want the looking version for the Down frame. button. button to look different in the Over
## You can also use the ability to have a
state (when the mouse moves over the The Hit Area
## different image in the hit frame, even
button), you will need to set a key The hit area is the location that will more creatively. For example, you frame in the frame below the word trigger the button. When the user could have an image that looks like a over and then make your change to moves the mouse over a hit area, the button and use this same art in both the image in that frame. I usually just button will change to the Over frame. the Hit and Up frames. You could replace the normal button image used If the user clicks on the hit area, the then have an image in the Over frame in the Up frame with another image, button will be triggered. The simple that was in a completely different created in Photoshop, in the Over solution for a hit area is to use the location and did not seem to be a part frame. It is always easiest to use same art you used in the Up frame. of the button. When the player moved images that are the same size for every This is what you will do most of the his mouse over the button, it could state. This way, they all go in the same time. However, the ability that Flash highlight a totally different location place and they work together perfect- gives the user to designate a hit area on the screen. ly. Make all of the images as large as that is different from the image in the the largest image—you may need to Up frame allows you to do many difaccount for the size of the outer glow Putting Scripts on Buttons
## ferent things.
or drop shadow in the highlighted Once you have created a button, you state. There are times when using the same can place an action script on the butimage for both the Up and the Hit ton rather than on a frame. The A simple approach is to place the frames can be problematic. For exam- action will then be triggered when the image for the Up state in the spot ple, using text in both the Up and the button is released. This is the default where you want it. Then select each of hit area can create problems because action, but there are several other the other frames and press F6 to cre- the spaces in between the letters do options when placing an action on a ate a key frame for every state. Drag not count a hit area and so the high- button. For example, you can trigger the time slider around and make lighted state can flicker on and off as an action when the mouse moves over changes to each of these frames. If you the user moves the mouse across the a button or even when it moves off of have created the art in another pro- button. The simple solution to this a button. You may not use these other gram, you can just replace the old

## Introduction to Flash 193

events as often as the button release option. A dialog box will appear; leave The option right below the Go to and event, but it is good to know that they everything at the defaults in this dia- Play option is Go to and Stop. Use the are available. log box and just enter the number of Stop option if you don’t want the
                                             the frame to which you want to go. scene to play when it jumps to the
To put an action on a button, start by
## frame number you entered. Use the
single-clicking to select the button in Once you have placed an action on a
## Go to and Play option if you want the
your scene. (Double-clicking on the button, you can see it in the Behaviors
## frames to advance after arriving at the
button will open it.) With the button window every time you select the but-
## specified frame. This action will be
selected, open the Behaviors panel on ton. It also can be modified here. You
## executed first, and then any action on
the right side of the Flash interface. can see where to do this in Figure
## the frame will be executed. If there is
Click on the blue plus sign in the 15.14.
## no Stop action at the end of the scene,
upper-left corner of this panel.
## the file will start over at the beginChoose the Movieclip/Go to and Play
## ning. The file will loop continuously if
## you do not stop it.

## Seeing Your Button Work
## When you’re working in Flash in the
## Standard mode, you will not be able
## to see how your button works. When
## you move your mouse over the but-
## ton, it does not highlight and you
## can’t press it. The reason for this is
## that you will probably need to select
## and modify this button, and these
## behaviors would get in the way. The
## button will work just fine when it has
## been published and saved in the final
## format, but it won’t work when you’re
Figure 15.14 You can add a Go To action to your button.
## editing the Flash file. Flash has a way

194 Chapter 15 ■ Creating an Interactive Mock-Up
around this: You can turn on the sim- The Publish option is found under mat appears. You can specify the ple functions of a button to test them File/Publish in the main menu. You name of the files that will be saved out by choosing Control/Enable can adjust the setting that will take when you publish, and if you click on Simple Buttons from the menu across effect every time you publish your file. the folder icon, you can choose the the top of the screen; the buttons will These settings can be found in the location of these files. then function like buttons should. File/Publish Settings option in the
## Once you have made all of these
Once you are done testing the button, main menu; there you will see a num-
## adjustments, all you need to do is
you can switch back by de-selecting ber of file formats that you can
## choose the Publish option and all the
the same option. choose. Every time you check one of
## files you specified will be saved. You
## these boxes, a new tab that contains all
## can see the Publish Settings dialog
Publishing Files of the settings specific to that file for-
## box in Figure 15.15.
Once you have completed your interface, you will need to save it in a format that other people can use. When you save your file using the File/Save option in the main menu, you save a FLA file that can be opened by anyone who has Flash. Saving a file in another, final, format is called publishing. These files can’t be opened and edited in Flash the way a FLA file can, but they don’t require Flash to be opened.
                                                                 Figure 15.15 There are a variety of options for a final file format.

## The Sample Flash File 195

Flash Summary The Sample Flash File the final Nomad game. There are sevYou can create simple interactive eral features that do not even work in
## Now that you have a glimpse of how
interfaces by creating all of your the mock-up I created.
## Flash works, it may be helpful to take
screens on different frames. You can a look at a file created in Flash. I used The menu in this mock-up was creatmove back and forth in these frames this file for some early tests on the ed to test the validity of the approach using the Go to and Stop action Trade interface for Nomad, described that the game designer and I came up placed on a button. When you are in Chapter 14. I will give you a quick with. We did not want to painstakingready to see the file in the final for- explanation of how this file works, ly create a perfectly functioning menu mat, you can publish it and get results and will assume that you have read only to have to reproduce it in the in many different file formats. the “Introduction to Flash” section of game. We just wanted to know if I left out a lot of the details of Flash this chapter and have a little under- pressing the Buy and Sell buttons and have described concepts and standing of how Flash works. seemed like the logical way to buy and actions that I wish someone would sell things in the game. On this partic-
## This file is created in a very simple
have described to me when I was ular project, there were a couple of
## way. There are more efficient ways to
starting out with Flash. As I began key aspects that we wanted to test and
## use Flash to create this exact interface
learning how to use Flash, it took a lot perfect; these aspects were important
## than those I’ll explain in this book,
of reading for me to figure out these enough that we spent a little time to
## but they would require quite a bit of
basic concepts. I hope that, with this make this mock-up.
## knowledge about Flash. The method
brief introduction and the help of used for this file is good for an intro- Mock-ups are great for testing. It is other information and tutorials avail- duction to Flash—it was intentionally always a good idea to test with a funcable about Flash, you will be able to created using only the principles dis- tional menu; a user can get a lot more learn the program much faster than I cussed earlier in this chapter. This information when he can see movedid. Consider this chapter a jump- example will give you a hint of how ment and buttons that highlight. It is start to learning Flash. much you can do with only a few sim- much harder to show someone a
                                           ple techniques. menu in a flat, concept image and
## know if he is really going to under-
## The mock-up I created is not a com-
## stand how to use the menu. No mat-
## plete interface mock-up. The way the
## ter how well you can envision some-
## menu functions in the mock-up is not
## thing in your head, it is always a little
## exactly the way the menu worked in
## different when you actually see it
## working.

196 Chapter 15 ■ Creating an Interactive Mock-Up
The CD that comes with this book Frames 1, 15, and 23 all have a Stop on this frame until the button is includes several files named Trade action. These three different frames pressed. Then the Go to and Play Mock-Up. You can open any of these are the three different possible looks action on this button will send the file files. There is a self-contained file for for the interface. All of the frames in to the next frame and begin playing. both Windows (EXE) and Macintosh between these frames are part of the The file will play until it reaches the (HQX). You can also open the HTML transitions. Stop action located on frame 15. The file with any browser that has the cor- frames between frame 1 and frame 15
## Frames 31 and 46 have an action that
rect files. (This HTML file refers to contain the transition of the trade
## moves the file to another frame and
the SWF file, and it must be in the interface opening up.
## then stops. These Stop actions are
same directory.) I have also included
                                            located at the end of transitions. In the game, this menu and animathe original Flash file. If you have
## tion will be triggered when your ship
Flash installed, you can open this file
                                            Actions on Buttons docks at a trading post. This button
up and see how it was made.
## was created just as a way to trigger this
## There are four buttons that control
## transition. You can see the action on
Actions on Frames the interface in this file (located on
## the button, created out of the ship
## the CD). The main Ship tab that
Most of the actions in Figure 15.16 information bar, in Figure 15.17.
## appears on frame 1 is a button. There
have been placed on the actions layer. There is a key frame on the layer that
## is a Purchase and Sell button and a
The lowercase “a” designates a loca- contains the ship box, at frame 15.
## Close Dialog button. It is pretty simtion that contains a script. If you Key frames are added, as I’ve said, so
## ple, yet there is still a lot of stuff going
select these lowercase a’s, you can changes can be made. Visually, there is
## on. If you have too many buttons and
examine the script. When you’ve no change in this layer from frame 1
## animations, as I’ve said before, your
selected one of these frames, open the to frame 15; the difference is in the
## interface can become very confusing.
Actions-Frame window. As the name button. The same button is in frames
## Organization is the key.
implies, this is where the actions are 1 and 15, but the action has been created and edited for a frame. You If you scrub the timeline to frame 1
## removed from the button on frame
can see how the file should behave and select the Ship Information box,
## 15. In the first frame, the script on the
when it reaches this frame. This file is you will see that it has been converted
## button goes to frame 2 and opens the
located on the CD if you want to open into a button. You can see the script
## dialog box. Once it is open, you don’t
it up and look at it. You can see the applied to this button in the
## want this button to do anything, so I
actions in Figure 15.16. Behaviors window on the right. There
## removed the script at this point.
## is a stop on frame 1. The file will stay

## The Sample Flash File 197

Figure 15.16 If you select a frame that contains an action, you Figure 15.17 Select the button in the scene and you can see the can see the script in the Actions-Frame window. action on the button in the Behaviors window.
Once the dialog is open and the file Behaviors window. This button The Purchase button looks like an has stopped on frame 15, the two but- should do the same thing on every orange arrow. On frame 15, it contons become available. A Close Dialog frame where it appears. tains an action that directs the file to button appears in the upper-right go to the next frame and plays the ani-
## At the end of this transition, on frame
corner of the Trade dialog. If this but- mation. The file will stop on frame 23.
## 46, there is an action. This action
ton is pressed, the file goes to frame 32 On frame 23, the Purchase button is
## directs the file back to frame 1. This
and plays to frame 46. This is the close very transparent and does not contain
## happens as soon as the animation
animation where the menu slides up. any actions. Once the item has been
## arrives at frame 46. Because this frame
You can see this script by selecting the purchased, it can’t be purchased
## looks exactly like frame 1, the user
Close button on any frame where the again.
## will never notice anything amiss.
button appears and looking in the
198 Chapter 15 ■ Creating an Interactive Mock-Up
Just as with the Purchase button, the Poke around in this file and see how I hope that you have been inspired to Sell button is not always available. everything was done. You can see the improve your skills and in turn Because you don’t have any of the movement by scrubbing the red box improve your interface designs. I have selected items in your ship on frame in the timeline. You can also see the seen some amazing interfaces, but 15, you can’t sell anything. Once the final result by opening any of the files that does not mean that you can’t crePurchase button has been pressed and that have been published. ate an interface that is even better. the item has been purchased, the file Aim high!
## This file may be simple, but it is easy
moves to frame 23. On this frame in
## to see how useful it is. You can try and
the layer with the Purchase button,
## test all kinds of things using Flash.
there is a key frame. The button con-
## Creating iterative files is a great way to
tains a script that sends the file to the
## build a strong portfolio with funcnext frame and plays. On frame 31,
## tional art. You can also make an
the file reaches the end of this anima-
## incredibly strong presentation of a
tion and is redirected to frame 15.
## new concept—no programmers
You will notice that if a purchase is needed! made, the dialog is closed and then reopened, then the item does not show up in the ship. There are ways in Flash
## Summary
to retain this information even when You now have the basic skills that will the dialog has been closed, but these allow you to design a game interface. methods all require more complicated Review the principles in this book scripting. Making this work like it often and continue to learn more. should have worked in the final game There is always more to learn. Get as was not important for the test that we much real-life experience by designneeded to do. ing interfaces for games as you can—
## the best teacher is experience.

## INDEX

Numbers frame rates, 126, 188 exaggeration, 132 2D interpolation, 127–128, 130 follow through, 131
     interfaces, 38–39 key frames, 127–128, 130, 186–187 squash, 129–130
     state (buttons), 78–79 mock-ups, 182–190 stretch, 129–130
3D number, 127–128, 130 screens interfaces, 38–40 speed, 126, 188 speed, 133 programs, 122–123 tweening, 127–128, 130, 186–187 transitions, 132–134 state (buttons), 78–79 graphics state (buttons), 78–79 3D Studio Max, 123 color, 135–136 stopping, 131
## effects, 136–138 winding up, 130–131
                                             explosions, 138 anticipation (animation principles), 130
A overlays, 136 applications. See programs active-selected state (buttons), 76–77 particle systems, 137 approval active state (buttons), 75–76 pivot points, 134–135 console games, 62–63 Adobe. See Photoshop position, 134 producers, 9–10 advantages/disadvantages properties, 134–136 arcs (animation principles), 132
    commercial programs, 118–119 rotation, 134–135 arrows
    custom programs, 117–118 screen shakes, 138 menu screen flow charts, 14–16
afterimages, 47 size, 134–135 state (buttons), 76 alignment. See also balance translation, 134 art. See graphics; mock-ups
    composition, 53–54 transparency, 135–136 ascenders (fonts), 89–90
    controllers, 66–68 trembling, 138 Asian monitor resolution, 71
alpha channels, 108–110 impact, 131 asset management, 114–115 alternatives (state), 77–78 interfaces assets animation. See also motion; navigation fades, 133 asset management, 114–115
    bouncing, 129–130 transitions, 132–134 final assets, 110–111
    frames overview, 125–126 attention span (focal points), 82–83
       calculating, 127–128, 130 principles, 129–132 audio (buttons state), 75, 80
       ease in/ease out, 127–128, 130 anticipation, 130
## arcs, 132

## 200 Index

B PC games C Back buttons (menu screen flow charts), mouse, 68–70 calculating frames, 127–128, 130
       14–16 state, 77 cameras. See photos
background (fonts), 87–88 pressing, 192 cancelling projects, 3 balance. See also alignment radio button input, 19–20 cap line (fonts), 89–90 color, 49 state careers composition, 57–60 2D, 78–79 budgets, 2–3 elements, 57–60 3D, 78–79 communication, 2–4 symmetry, 58 active-selected state, 76–77 creative freedom, 2 bars (HUDs), 152–153 active state, 75–76 focus, 5 base line (fonts), 89–90 alternatives, 77–78 fonts, 95 benefits animation, 78–79 Marketing Department, 2 commercial programs, 118–119 arrows, 76 paths, 4–5 custom programs, 117–118 brightness, 74–76 portfolios, 4–5 blurriness. See resolution color, 77, 79 publishers, 5–6 borrowing. See copyrights controllers, 74–77 realities, 2–3 bouncing animation, 129–130 creativity, 77–78 schedules, 2–6 boxes (flow charts), 13–16 disabled state, 77 skills, 5 brainstorming, 32–33 flashing, 74–75, 78–79 success, 3 brightness flickering, 74–75, 78–79 teamwork, 4, 10 color, 53 gray, 77 charting. See flow charts focal points, 85 highlighted, 74–75 choosing state (buttons), 74–76 light, 74–79 fonts, 93–94 budgets markers, 76 icons, 140–141 careers, 2–3 motion, 78–79 clicking buttons, 192 development (console games), 64 mouseover state, 77 CMYK (cyan, magenta, yellow, black), 52–53 icons, 140 number, 79 cold colors, 49–50 projects, 2–3 overview, 73 color buttons PC games, 77 color charts, 29–30 Back buttons, 14–16 pressed state, 75 designing clicking, 192 programmers, 78–80 afterimages, 47 controllers, 66–68, 74–77 schedules, 79–80 balance, 49 graphics, reusing, 106–108 selected state, 74–75 brightness, 53 hit area, 192 sound, 75, 80 CMYK, 52–53 input, 17 standard state, 74 cold colors, 49–50 mock-ups, 190–194 tips, 79–80 color harmony, 45 overview, 73 transparency, 77 color wheel, 45–48
## buying fonts, 93–94

## Index 201

       complementary colors, 45–48 communication overview, 81
       HSB, 53 approval size, 83–84
       HUDs, 161–162 console games, 62–63 fonts, 87–88
       hues, 53 producers, 9–10 sketches
       interfaces, 29–30, 160–163 careers, 2–4 HUDs, 156–158
       Itten, Johannes, 45 planning, 10 interfaces, 37–38, 156–160
       light, 50, 53 projects, 2–4 thumbnails, 33–35
       monitors, 50, 70–72 teamwork, 4, 10 text, 139–140
       overview, 44–45 competition, 33 comprehension
       paint, 50 complementary colors, 45–48 HUDs, 150–151
       preferences, 48 composition interfaces, 110, 139–140
       printable range, 51–52 boxes (flow charts), 13–16 compression, 102–103
       RGB, 51–52 color. See color computers
       saturation, 49, 53 designing minimum requirements, 65–66
       strength, 49 alignment, 53–54 monitors, 50, 70–72
       subjectivity, 48 balance, 57–60 mouse
       systems, 51–53 dividing elements, 59 buttons, 68–70, 77
       theory, 45 elements. See elements games, 68–70
       warm colors, 49–50 evaluating, 44 menu screens, 68–70
flow charts (menu screens), 14–16 eye movement, 56–57 PC games focal points, 84 intersecting elements, 60 buttons, 68–70, 77 fonts, 97 motion, 55–57 converting, 61–62, 69–72, 110 graphics, 135–136 negative space, 55 development process, 65–66 HUDs, 70, 152–153, 161–162 number of elements, 59 localization, 110 icons, 142–143 overlapping elements, 60 menu screens, 68–70 palettes, 103–105 overview, 43–44 minimum requirements, 65–66 resolution space, 53–54 monitor resolution, 70–71
       HUDs, 70 tension, 58 mouse, 68–70
       icons, 142–143 unity, 54–55 overview, 61
       menu screens, 70 variation, 54–55 concept approval, 63
       monitors, 70–72 weight, 57–60 consistency (icons), 142
state (buttons), 77, 79 focal points console games color charts, 29–30 attention span, 82–83 alignment, 66–68 color harmony, 45 brightness, 85 buttons, 66–68 color wheel, 45–48 color, 84 concept approval, 63 commercial programs hierarchy, 81–83 controllers, 66–68 advantages/disadvantages, 118–119 motion, 85 converting, 61–62, 69–72 overview, 118–120 creative control, 64–65

## 202 Index

developer approval, 62–63 HUDs, 153–154 light, 50, 53 development cost, 64 interfaces, 25–26, 32–33, 35, 40–41 monitors, 50, 70–72 development process, 62–65 planning, 8–9 overview, 44–45 documentation, 63 programs, 121–123 paint, 50 guidelines, 63 state (buttons), 77–78 preferences, 48 hardware, 62–65 Credits screen, 23 printable range, 51–52 HUDs, 150 criticism RGB, 51–52 manufacturers, 62–65 HUDs, 151–152, 177–178 saturation, 49, 53 Marketing Department, 65 icons, 142 strength, 49 menu screens, 66–68 interfaces, 40–41, 159, 177–178 subjectivity, 48 motion, 66–68 custom programs systems, 51–53 navigation, 68 advantages/disadvantages, 117–118 theory, 45 overview, 61 in-game, 117 warm colors, 49–50 publishers, 62–65 overview, 115–116 composition. See composition schedules, 62–65 plug-ins, 116 elements. See elements technical approval, 63 stand-alone, 116–117 flow charts (menu screens), 13–17 television monitors, 50, 70–72 cyan, magenta, yellow, black (CMYK), 52–53 fonts, 95–97 timing, 67–68 game design, 10 Console Logo screen, 23, 29 D HUDs controllers color, 161–162
## decision-making, 12–13
button state, 74–77 creating, 169–177
## defining goals, 12
console games, 66–68 development process, 163–167
## descenders (fonts), 89–90
controls. See buttons; controllers feedback, 177–178
## designing. See also planning
converting PC games Photoshop, 167–169
## color
console games, 61–62, 69–72 sketches, 156–158
## afterimages, 47
localization, 110 interfaces
## balance, 49
copyrights 2D, 38–39
## brightness, 53
icons, 142 3D, 38–40
## CMYK, 52–53
interfaces, 33 brainstorming, 32–33
## cold colors, 49–50
cost. See budgets color, 29–30, 160–163
## color harmony, 45
creating color charts, 29–30
## color wheel, 45–48
fonts, 95–97 competition, 33
## complementary colors, 45–48
HUDs, 169–177 copyrights, 33
## HSB, 53
interfaces, 169–177 creating, 169–177
## HUDs, 161–162
creativity creativity, 25–26, 32–33, 35, 40–41
## hues, 53
careers, 2 development process, 163–167
## interfaces, 29–30, 160–163
console games, 64–65 evaluating, 23–24
## Itten, Johannes, 45

## Index 203

      feedback, 40–41, 159, 177–178 development process motion, 55–57
      flexibility, 40–41 console games, 62–65 negative space, 55
      importance, 1–2 developer approval (console games), number of, 59
      lists, 32 62–63 overlapping, 60
      logos, 29 development cost (console games), 64 space, 53–54
      menu screens, 39 handheld games, 65 tension, 58
      mini-map, 162–163 HUDs, 151–152, 163–167 unity, 54–55
      mock-ups, 27–29, 113–114 interfaces, 163–167 variation, 54–55
      motion, 40 PC games, 65–66 weight, 57–60
      overview, 27, 155–156 devices (input), 17 focal points
      photos, 35–37 digital photos. See photos attention span, 82–83
      Photoshop, 167–169 disabled state (buttons), 77 brightness, 85
      programmers, 39 disk space (file size), 101–102 color, 84
      programs, 121–123 dividing elements, 59 hierarchy, 81–83
      research, 32–33 documentation, 63 motion, 85
      revisions, 160 dots per inch (DPI), 91–92 overview, 81
      sketches, 37–38, 156–160 downloading, 102 size, 83–84
      standards, 35 down-sides employment. See careers
      themes, 31 commercial programs, 118–119 Environment Select screen, 23
      thumbnails, 33–35 custom programs, 117–118 European monitor resolution, 71
menu screens (flow charts), 13–17 DPI (dots per inch), 91–92 evaluating mock-ups drafts. See mock-ups; sketches composition, 44
      buttons, 190–194 drop-down menu screens, 22 interfaces, 23–24
      frame rates, 188 dynamic content (HUDs), 148–149 menu screens, 23–24
      frames, 182–190 planning, 9–10, 23–24
      interfaces, 27–29, 113–114 E exaggeration (animation principles), 132
      key frames, 186–187 ease in/ease out (frames), 127–128, 130 explosions (animation), 138
      layers, 183–185 editors, 2, 115 eye movement
      overview, 179–182, 195–198 effects composition, 56–57
      programs, 181 fonts, 97 HUDs, 150–151
      publishing, 194 graphics, 136–138
      scripts, 188–193 elements. See also graphics F
      tweening, 186–187 designing fades (interface animation), 133
principles, 43–44 alignment, 53–54 feedback developer approval (console games), 62–63 balance, 57–60 HUDs, 151–152, 177–178 Developer Logo screen, 23 dividing, 59 icons, 142 development cost (console games), 64 eye movement, 56–57 interfaces, 40–41, 159, 177–178
## intersecting, 60

## 204 Index

files flow charts (menu screens). See also naviga- graphics, 97
    asset management, 114–115 tion icons, 97
    final assets, 110–111 arrows, 14–16 kerning, 92
    publishing, 194 Back buttons, 14–16 knowledge, 95
    size boxes, 13–16 lowercase, 90
        compression, 102–103 color, 14–16 mean line, 89–90
        disk space, 101–102 designing, 13–17 mixing, 95
        downloading, 102 locked items, 14–16 monospace, 92
        fonts, 90–93 planning, 13 multiple, 95
        graphics, reusing, 106–108 pop-up menu screens, 17–18 picas, 90–91
        Internet, 102 programs, 13, 23–24 points, 90–91
        loading time, 102 size, 13–14 research, 93–94
        overview, 99–100 space, 13–14 sans-serif, 88–89
        palettes, 103–105 Title screen, 13–14 schedules, 95
        programmers, 105–106 focal points selecting, 93–94
        quality, 102–103 attention span, 82–83 serif, 88–89
        RAM, 100–101 brightness, 85 size, 90–93
        seeking time, 102 color, 84 space, 92
        textures, 106 hierarchy, 81–83 stretching, 93
    source files, 110–111 motion, 85 symbols, 97
final assets, 110–111 overview, 81 themes, 94–95 Flash, 120 size, 83–84 thickness, 92–93
    buttons, 190–194 follow through (animation principles), 131 types, 93–94
    frame rates, 188 fonts uppercase, 90
    frames, 182–190 ascenders, 89–90 fps. See frame rates
    key frames, 186–187 background, 87–88 frame rates
    layers, 183–185 base line, 89–90 animation, 126, 188
    overview, 181–182, 195–198 buying, 93–94 mock-ups, 188
    publishing, 194 cap line, 89–90 speed, 126, 188
    scripts, 188–193 careers, 95 frames
    tweening, 186–187 color, 97 calculating, 127–128, 130
flashing state (buttons), 74–75, 78–79 composition, 87–88 ease in/ease out, 127–128, 130 flexibility, 40–41 creating, 95–97 frame rates flickering descenders, 89–90 animation, 126, 188
    state (buttons), 74–75, 78–79 designing, 95–97 mock-ups, 188
    television monitors, 72 DPI, 91–92 speed, 126, 188
                                             effects, 97 interpolation, 127–128, 130
## file size, 90–93

## Index 205

key frames, 127–128, 130, 186–187 television monitors, 50, 70–72 size, 134–135 mock-ups, 182–190 timing, 67–68 translation, 134
      frame rates, 188 copyrights transparency, 135–136
      key frames, 186–187 icons, 142 trembling, 138
      tweening, 186–187 interfaces, 33 buttons. See buttons
number, 127–128, 130 design, planning, 10 color. See color tweening, 127–128, 130, 186–187 editors, 115 copyrights frames per second. See frame rates files. See files icons, 142 functionality, interfaces, 2 gameplay, 1 interfaces, 33
## handheld games, 65 fonts, 97
G PC games HUDs, 152–153
## buttons, 68–70, 77 icons
gameplay, 1
## converting, 61–62, 69–72, 110 budgets, 140
games
## development process, 65–66 color, 142
asset management, 114–115
## localization, 110 consistency, 142
console games
## menu screens, 68–70 copyrights, 142
      alignment, 66–68
## minimum requirements, 65–66 feedback, 142
      buttons, 66–68
## monitor resolution, 70–71 fonts, 97
      concept approval, 63
## mouse, 68–70 graphics, 140–141
      controllers, 66–68
## overview, 61 overview, 139
      converting, 61–62, 69–72
## speed, 102 photos, 143
      creative control, 64–65
## goals pixels, 142–143
      developer approval, 62–63
                                          decision-making, 12–13 resolution, 142–143
      development cost, 64
## defining, 12 selecting, 140–141
      development process, 62–65
## overview, 10–12 silhouettes, 143
      documentation, 63
## priorities, 12–13 size, 142–143
      guidelines, 63
                                       graphics. See also elements standard, 141–142
      hardware, 62–65
## animation symbols, 141–142
      HUDs, 150
## color, 135–136 text, 139–140
      manufacturers, 62–65
                                              effects, 136–138 layers (Photoshop), 167–169
      Marketing Department, 65
                                              explosions, 138 menu screens. See menu screens
      menu screens, 66–68
                                              overlays, 136 pop-up menu screens, 106–108
      motion, 66–68
                                              particle systems, 137 quality (compression), 102–103
      navigation, 68
## pivot points, 134–135 reusing, 106–108
      overview, 61
## position, 134 textures, 106–108
      publishers, 62–65
## properties, 134–136 tiling, 108
      schedules, 62–65
                                              rotation, 134–135 transparency (alpha channels), 108–110
      technical approval, 63
## screen shakes, 138

## 206 Index

graphs (HUDs), 152–153 planning, 24–25, 145–150 Information screen, 23 gray state (buttons), 77 pop-up menu screens, 148 in-game custom programs, 117 guidelines, console games, 63 resolution, 70 input
## size, 145–150 buttons, 17
H space, 145–148 devices, 17
                                                standard, 153–154 drop-down menu screens, 22
handheld game development process, 65
## text, 150, 152–153 lists, 20–21
hardware, console games, 62–65
                                             hue, saturation, brightness (HSB), 53 radio buttons, 19–20
harmonious colors, 45
## hues, 53 sliders, 19
HDTV monitor resolution, 71
## text, 20–22
Heads Up Displays. See HUDs
                                             I toggle switches, 19–20
hierarchy, composition focal points, 81–83
## types, 17–23
highlighted state (buttons), 74–75 icons
## inspiration, 32–33
hit area (buttons), 192 budgets, 140
## interfaces
HSB (hue, saturation, brightness), 53 color, 142
## asset management, 114–115
HUDs (Heads Up Displays), 24 consistency, 142
## color. See color
    bars, 152–153 copyrights, 142
## composition. See composition
    color, 152–153, 161–162 feedback, 142
## comprehension, 110, 139–140
    comprehension, 150–151 fonts, 97
## designing
    console games, 150 graphics, 140–141
## 2D, 38–39
    creativity, 153–154 overview, 139
## 3D, 38–40
    designing photos, 143
## brainstorming, 32–33
        color, 161–162 pixels, 142–143
## color, 29–30, 160–163
        creating, 169–177 resolution, 142–143
## color charts, 29–30
        development process, 151–152, selecting, 140–141
        163–167 competition, 33
## silhouettes, 143
        feedback, 151–152, 177–178 copyrights, 33
## size, 142–143
        Photoshop, 167–169 creating, 169–177
## standard, 141–142
        sketches, 156–158 creativity, 25–26, 32–33, 35, 40–41
## symbols, 141–142
    development process, 151–152, 163–167 development process, 163–167
## text, 139–140
    dynamic content, 148–149 evaluating, 23–24
## ideas, 32–33
    eye movement, 150–151 feedback, 40–41, 159, 177–178
## illustrations. See sketches
    feedback, 151–152, 177–178 flexibility, 40–41
## images. See graphics
    graphics, 152–153 importance, 1–2
## impact (animation), 131
    graphs, 152–153 lists, 32
## information gathering
    interfaces, 145–148 logos, 29
## fonts, 93–94
    navigation, 151 menu screens, 39
## interfaces, 32–33
    overview, 145 mini-map, 162–163
## planning, 9

## Index 207

        mock-ups, 27–29, 113–114 J–K logos, 29
        motion, 40 Japan, monitor resolution, 71 lowercase fonts, 90
        overview, 27, 155–156 jobs. See careers
        photos, 35–37 kerning, 92 M
        Photoshop, 167–169 key frames Macromedia. See Flash
        programmers, 39 animation, 127–128, 130, 186–187 manufacturers (console games), 62–65
        programs, 121–123 mock-ups, 186–187 markers (button state), 76
        research, 32–33
## Marketing Department
        revisions, 160
## L careers, 2
        sketches, 37–38, 156–160
                                       languages, 110, 140 console games, 65
        standards, 35
## layers Maya, 123
        themes, 31
                                           graphics (Photoshop), 167–169 mean line (fonts), 89–90
        thumbnails, 33–35
## mock-ups (Flash), 183–185 memory (file size)
    editors, 115
                                       legal issues disk space, 101–102
    fades, 133
## icons, 142 RAM, 100–101
    functionality importance, 2
## interfaces, 33 menu screens
    gameplay, 1
                                       Legal screen, 23 Console Logo screen, 23, 29
    graphics importance, 1–2
                                       level editors, 115 controllers, 66–68
    HUDs. See HUDs
                                       Level Select screen, 23 Credits screen, 23
    languages, 110, 140
                                       light Developer Logo screen, 23
    menu screens. See menu screens
                                           brightness drop-down menu screens, 22
    mock-ups. See mock-ups
                                               color, 53 Environment Select screen, 23
    navigation, 140
## focal points, 85 evaluating, 23–24
    overview, 1
## state (buttons), 74–76 flow charts
    player editors, 2
                                           color, 50, 53 arrows, 14–16
    programs. See programs
                                           flashing state (buttons), 74–75, 78–79 Back buttons, 14–16
    publishing, 194
## flickering boxes, 13–16
    quality, 1–2
## state (buttons), 74–75, 78–79 color, 14–16
    screen shakes, 138
## television monitors, 72 designing, 13–17
    text. See text
                                           state (buttons), 74–79 locked items, 14–16
    transitions, 132–134
                                       lists planning, 13
interlacing, television monitors, 72
                                           designing, 32 pop-up menu screens, 17–18
Internet, file size, 102
                                           input, 20–21 programs, 13, 23–24
interpolation, frames, 127–128, 130
                                       loading time, 102 size, 13–14
intersecting elements, 60
                                       localization (converting games), 110 space, 13–14
Itten, Johannes, 45
                                       locked items (menu screen flow charts), Title screen, 13–14
## 14–16

## 208 Index

HUDs. See HUDs mock-ups. See also sketches mouse Information screen, 23 designing mouseover state, 77 input buttons, 190–194 PC games, 68–70
      buttons, 17 frame rates, 188 mouseover state, 77
      devices, 17 frames, 182–190 multiple fonts, 95
      drop-down menu screens, 22 interfaces, 27–29, 113–114
      lists, 20–21 key frames, 186–187 N
      radio buttons, 19–20 layers, 183–185
## navigation. See also flow charts; motion
      sliders, 19 overview, 179–182, 195–198
## controllers, 68
      text, 20–22 programs, 181
## HUDs, 151
      toggle switches, 19–20 publishing, 194
## interfaces, 140
      types, 17–23 scripts, 188–193
## Navigation screen, 68
interfaces, 39 tweening, 186–187
## negative space (composition), 55
Legal screen, 23 Flash
## norms. See standard
Level Select screen, 23 buttons, 190–194
## North America monitor resolution, 71–72
mock-ups, 28–29 frame rates, 188
## NTSC monitor resolution, 71–72
mouse, 68–70 frames, 182–190
## number
Navigation screen, 68 key frames, 186–187
## elements, 59
Options screen, 23 layers, 183–185
## frames, 127–128, 130
Player Editor screen, 23 overview, 181–182, 195–198
## pixels. See resolution
pop-up menu screens publishing, 194
## state (buttons), 79
      flow charts, 17–18 scripts, 188–193
      graphics, reusing, 107–108 tweening, 186–187
      HUDs, 148 menu screens (Title screen), 28–29 O
Publisher Logo screen, 23 monitors, 50, 70–72 objects. See elements; graphics resolution, 70 monospace fonts, 92 opacity. See transparency Save/Load Game screen, 23 motion. See also animation; navigation opinions Title screen composition HUDs, 151–152, 177–178
      flow charts, 13–14 designing, 55–57 icons, 142
      mock-ups, 28–29 focal points, 85 interfaces, 40–41, 159, 177–178
      planning, 23 controllers, 66–68 Options screen, 23
types, 23 eye movement overlapping elements, 60 menus. See menu screens composition, 56–57 overlays (animation), 136 middleware programs, 119 HUDs, 150–151 mini-maps, 162–163 interfaces, 40 minimum requirements (PC games), 65–66 state (buttons), 78–79 mixing fonts, 95

## Index 209

P goals points (fonts), 90–91 paint, 50 decision-making, 12–13 pop-up menu screens PAL monitor resolution, 71 defining, 12 flow charts, 17–18 palettes, 103–105 overview, 10–12 graphics, reusing, 107–108 particle systems, 137 priorities, 12–13 HUDs, 148 PC games HUDs, 24–25, 145–150 portfolios, 4–5 buttons importance, 7 position (graphics), 134
       mouse, 68–70 information gathering, 9 preferences (color), 48
       state, 77 input types, 17–23 pressed state (buttons), 75
converting, 61–62, 69–72, 110 menu screens pressing buttons, 192 development process, 65–66 Console Logo screen, 23, 29 principles localization, 110 Credits screen, 23 animation, 129–132 menu screens, 68–70 Developer Logo screen, 23 anticipation, 130 minimum requirements, 65–66 Environment Select screen, 23 arcs, 132 monitor resolution, 70–71 evaluating, 23–24 exaggeration, 132 mouse, 68–70 flow charts, 13 follow through, 131 overview, 61 Information screen, 23 squash, 129–130 photos Legal screen, 23 stretch, 129–130 icons, 143 Level Select screen, 23 designing, 43–44 interfaces, 35–37 Navigation screen, 68 printing, 51–52 Photoshop, 120 Options screen, 23 priorities, 12–13 color, printable range, 51–52 Player Editor screen, 23 producers approval, 9–10 HUDs, 167–169 Publisher Logo screen, 23 professionalism. See careers layers, 167–169 Save/Load Game screen, 23 programmers physics. See animation, principles Title screen, 23 file size, 105–106 picas (fonts), 90–91 types, 23 interfaces, 39 pictures. See graphics; photos producers approval, 9–10 planning, 10 pivot points, 134–135 programmers, 10 state (buttons), 78–80 pixels. See resolution research, 9 programs planning. See also designing schedules, 7–9 3D, 122–123 communication, 10 teamwork, 4, 10 3D Studio Max, 123 creativity, 8–9 Player Editor screen asset management, 114–115 evaluating, 9–10 interfaces, 2 commercial game design, 10 menu screens, 23 advantages/disadvantages, 118–119
                                     plug-ins, 116 overview, 118–120
                                     pluses/minuses creativity, 121–123
## commercial programs, 118–119
## custom programs, 117–118

## 210 Index

custom publishing files, 194 planning, 7–9
       advantages/disadvantages, 117–118 pulsating state (buttons), 74–75, 78–79 projects, 2–3
       in-game, 117 purchasing fonts, 93–94 publishers, 5–6
       overview, 115–116 state (buttons), 79–80
       plug-ins, 116 Q–R screen shakes, 138
       stand-alone, 116–117 screens
## quality
editors, 115 menu screens. See menu screens
## compression, 102–103
Flash, 120 monitors, 50, 70–72
## interfaces, 1–2
       buttons, 190–194 screen shakes, 138
## radio buttons, 19–20
       frame rates, 188 transitions
## RAM, 100–101
       frames, 182–190 animation, 132–134
## red, green, blue (RGB), 51–52
       key frames, 186–187 speed, 133
## research
       layers, 183–185 scripts (mock-ups), 188–193
## fonts, 93–94
       overview, 181–182, 195–198 seeking time, 102
## interfaces, 32–33
       publishing, 194 selected state (buttons), 74–75
## planning, 9
       scripts, 188–193 selecting
## resolution
       tweening, 186–187 fonts, 93–94
## HUDs, 70
interfaces, 121–123 icons, 140–141
## icons, 142–143
Maya, 123 serif fonts, 88–89
## menu screens, 70
menu screen flow charts, 13, 23–24 shapes. See composition; elements
## monitors, 70–72
middleware, 119 silhouettes (icons), 143
## returning (menu screen flow charts), 14–16
mock-ups, 113–114, 181 size
## reusing graphics, 106–108
particle systems, 137 composition, 83–84
## revisions, 160
Photoshop, 120 elements, 83–84
## RGB (red, green, blue), 51–52
       color, printable range, 51–52 files
## rotation, 134–135
       HUDs, 167–169 compression, 102–103
## rough drafts. See mock-ups; sketches
       layers, 167–169 disk space, 101–102
using, 121–123 downloading, 102 properties (graphics), 134–136 S fonts, 90–93 pros/cons sample art. See mock-ups graphics, reusing, 106–108 commercial programs, 118–119 sans-serif fonts, 88–89 Internet, 102 custom programs, 117–118 saturation, 49, 53 loading time, 102 Publisher Logo screen, 23 Save/Load Game screen, 23 overview, 99–100 publishers scaling. See size palettes, 103–105 careers, 5–6 schedules programmers, 105–106 console games, 62–65 careers, 2–6 quality, 102–103 schedules, 5–6 console games, 62–65 RAM, 100–101
## fonts, 95

## Index 211

        seeking time, 102 spinning, 134–135 sound, 75, 80
        textures, 106 squares (flow charts), 13–16 standard state, 74
    focal points, 83–84 squash (animation principles), 129–130 tips, 79–80
    fonts, 90–93 stand-alone custom programs, 116–117 transparency, 77
    graphics properties, 134–135 standard stealing
    HUDs, 145–150 button state, 74 icons, 142
    icons, 142–143 HUDs, 153–154 interfaces, 33
    menu screen flow charts, 13–14 icons, 141–142 stopping animation, 131
sketches. See also mock-ups interfaces, 35 strength (color), 49
    HUDs, 156–158 state (buttons) stretching
    interfaces, 37–38, 156–160 2D, 78–79 animation principles, 129–130
    thumbnails, 33–35 3D, 78–79 fonts, 93
sliders (input), 19 active-selected state, 76–77 subjectivity (color), 48 software. See programs active state, 75–76 symbols sound (button state), 75, 80 alternatives, 77–78 fonts, 97 source files, 110–111 animation, 78–79 icons, 141–142 space arrows, 76 symmetry. See alignment; balance
    composition brightness, 74–76 system requirements (PC games), 65–66
        designing, 53–54 color, 77, 79 systems (color), 51–53
        negative space, 55 controllers, 74–77
    disk space (file size), 101–102 creativity, 77–78 T
    elements, 53–54 disabled state, 77
## teamwork, 4, 10
    fonts, 92 flashing, 74–75, 78–79
## technical approval (console games), 63
    HUDs, 145–148 flickering, 74–75, 78–79
## television monitors, 50, 70–72
    menu screen flow charts, 13–14 gray, 77
## temperature (colors), 49–50
special effects highlighted, 74–75
## tension (composition), 58
    fonts, 97 light, 74–79
## testing
    graphics, 136–138 markers, 76
## HUDs, 151–152, 177–178
speed motion, 78–79
## icons, 142
    animation mouseover state, 77
## interfaces, 40–41, 159, 177–178
        frame rates, 126, 188 number, 79
## text
        interfaces, 133 overview, 73
## composition, 87–88, 139–140
    downloading, 102 PC games, 77
## fonts
    Internet, 102 pressed state, 75
## ascenders, 89–90
    loading time, 102 programmers, 78–80
## background, 87–88
    screens schedules, 79–80
## base line, 89–90
        transitions, 133 selected state, 74–75
## buying, 93–94
    seeking time, 102

## 212 Index

      cap line, 89–90 HUDs, 150, 152–153 tweening
      careers, 95 icons, 97, 139–140 frames, 127–128, 130, 186–187
      color, 97 input, 20–22 mock-ups, 186–187
      composition, 87–88 interfaces, 139–140 typeface. See fonts
      creating, 95–97 languages, 110, 140 types
      descenders, 89–90 textures fonts, 93–94
      designing, 95–97 file size, 106 input, 17–23
      DPI, 91–92 tiling, 108 menu screens, 23
      effects, 97 themes
      file size, 90–93 fonts, 94–95 U
      graphics, 97 interfaces, 31
## unity, composition, 54–55
      icons, 97 theory, color, 45
## uppercase fonts, 90
      kerning, 92 thickness (fonts), 92–93
## usability. See functionality
      knowledge, 95 thumbnails, 33–35
## using programs, 121–123
      lowercase, 90 tiling textures, 108
      mean line, 89–90 time. See schedules
      mixing, 95 timing (controllers), 67–68 V–Z
      monospace, 92 tips (button state), 79–80 variation, composition, 54–55
      multiple, 95 Title screen warm colors, 49–50
      picas, 90–91 flow charts, 13–14 weight, composition, 57–60
      points, 90–91 mock-ups, 28–29 wheel. See color wheel
      research, 93–94 planning, 23 winding up, 130–131
      sans-serif, 88–89 toggle switches (input), 19–20 workload. See schedules
      schedules, 95 tools. See programs
      selecting, 93–94 tradition. See standard
      serif, 88–89 transitions, 132–134
      size, 90–93 translation (properties), 134
      space, 92 transparency
      stretching, 93 graphics
      symbols, 97 alpha channels, 108–110
      themes, 94–95 properties, 135–136
      thickness, 92–93 state (buttons), 77
      types, 93–94 trembling animation, 138
      uppercase, 90

## Professional ■ Trade ■ Reference

    CREATE AMAZING GRAPHICS AND
COMPELLING STORYLINES FOR YOUR GAMES!
      The Dark Side of Game Texturing Shaders for Game Programmers Character Development and Storytelling
                  ISBN: 1-59200-350-8 ■ $39.99 and Artists for Games
Charred ruins, bullet holes, rusted metal—if you ’re a fan of 3D ISBN: 1-59200-092-4 ■ $39.99 ISBN: 1-59200-353-2 ■ $39.99 first-person-shooter games, then you ’re familiar with those Shaders for Game Programmers and Artists—the title says it Character Development and Storytelling for Games begins amazing, ominous textures that draw you into your character’s all. This book does something that other shader books don’t. with a history of dramatic writing and entertainment in media surroundings. Get ready to analyze—and re-create—the textures It focuses solely on shaders and their creation. You’ll use ATI’s outside the realm of games. It then segues into writing for and graphics used in these games. All you need is a decent PC, RenderMonkey platform, giving you an easy-to-use framework games, revealing that while proven techniques in linear media Photoshop, and a digital camera. Once you learn how to create for shader development and allowing you to focus your energy can be translated to games, games offer many new challenges the textures within this book, you can create any texture for any on shader development rather than the development of frame- on their own such as interactivity, non-linearity, player input, and game. Not a born artist? That’s okay. You’ll learn how to let work applications. Cover simple techniques, from the basics of more. It introduces elements of the craft of writing that are Photoshop do most of the work. Begin with texturing basics, color filters to more advanced topics, such as depth of field, particularly unique to interactive media, taking you from the including pixel sizes, color modes, and alpha channels. Then jump heat shimmer, and high-dynamic range rendering. Extensive relatively secure confines of single-player games to the vast right into hearty texture tutorials as you create everything from excercises at the end of each chapter allow you to test your open spaces of virtual worlds and examining player-created sci-fi backgrounds and molten lava to medieval castle walls and skills by expanding upon the shader you’ve just developed. stories. dragon skin. If you’re ready to travel to the grim back alleys Whether you are an engineer or a technically minded artist, of your imagination, then you’re ready for The Dark Side of you’ve finally found the ideal guide for mastering shaders! Game Texturing.

## Call 1.800.354.9706 to order
## Order online at www.courseptr.com

## License Agreement/Notice of Limited Warranty

By opening the sealed disc container in this book, you agree to the following terms and conditions. If, upon reading the following license agreement and notice of limited warranty, you cannot agree to the terms and conditions set forth, return the unused book with unopened disc to the place where you purchased it for a refund.
License: The enclosed software is copyrighted by the copyright holder(s) indicated on the software disc. You are licensed to copy the software onto a single computer for use by a single user and to a backup disc. You may not reproduce, make copies, or distribute copies or rent or lease the software in whole or in part, except with written permission of the copyright holder(s). You may transfer the enclosed disc only together with this license, and only if you destroy all other copies of the software and the transferee agrees to the terms of the license. You may not decompile, reverse assemble, or reverse engineer the software.
Notice of Limited Warranty: The enclosed disc is warranted by Thomson Course Technology PTR to be free of physical defects in materials and workmanship for a period of sixty (60) days from end user’s purchase of the book/disc combination. During the sixty-day term of the limited warranty, Thomson Course Technology PTR will provide a replacement disc upon the return of a defective disc.
Limited Liability: THE SOLE REMEDY FOR BREACH OF THIS LIMITED WARRANTY SHALL CONSIST ENTIRELY OF REPLACEMENT OF THE DEFECTIVE DISC. IN NO EVENT SHALL THOMSON COURSE TECHNOLOGY PTR OR THE AUTHOR BE LIABLE FOR ANY OTHER DAMAGES, INCLUDING LOSS OR CORRUPTION OF DATA, CHANGES IN THE FUNCTIONAL CHARACTERISTICS OF THE HARDWARE OR OPERATING SYSTEM, DELETERIOUS INTERACTION WITH OTHER SOFTWARE, OR ANY OTHER SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES THAT MAY ARISE, EVEN IF THOMSON COURSE TECHNOLOGY PTR AND/OR THE AUTHOR HAS PREVIOUSLY BEEN NOTIFIED THAT THE POSSIBILITY OF SUCH DAMAGES EXISTS.
Disclaimer of Warranties: THOMSON COURSE TECHNOLOGY PTR AND THE AUTHOR SPECIFICALLY DISCLAIM ANY AND ALL OTHER WARRANTIES, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, SUITABILITY TO A PARTICULAR TASK OR PURPOSE, OR FREEDOM FROM ERRORS. SOME STATES DO NOT ALLOW FOR EXCLUSION OF IMPLIED WARRANTIES OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THESE LIMITATIONS MIGHT NOT APPLY TO YOU.
Other: This Agreement is governed by the laws of the State of Massachusetts without regard to choice of law principles. The United Convention of Contracts for the International Sale of Goods is specifically disclaimed. This Agreement constitutes the entire agreement between you and Thomson Course Technology PTR regarding use of the software.