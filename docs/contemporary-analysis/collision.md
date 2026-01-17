---
title: "Improved Collision detection and Response"
category: "contemporary-analysis"
---

## Improved Collision detection and Response

Kasper Fauerby kasper@peroxide.dk http://www.peroxide.dk

## 25th July 2003

## Contents

| 1 | Introduction | | | | | | | | | | | | | 3 |
|---|---------------------------------------------------------------|---------|--|----------|--|--|--|--|----|--|----|----|--|----|
| | 1.1
Previous
work | | | | | | | | | | | | | 3 |
| | 1.2
The
algorithm | | | | | | | | | | | | | 3 |
| | 1.3
How
to
read
this
document | | | | | | | | | | | | | 4 |
| 2 | Vector
spaces | | | | | | | | | | 5 | | | |
| | Denition
2.1
of
a
vector | space | | | | | | | | | | | | 5 |
| | R3
2.2
Case
study: | | | | | | | | | | | | | 6 |
| | 2.3
Coordinates | | | | | | | | | | | | | 7 |
| | 2.4
Ellipsoid
space | | | | | | | | | | | | | 7 |
| 3 | Collision
detection | | | | | | | | | | | 9 | | |
| | 3.1
Overview | | | | | | | | | | | | | 9 |
| | 3.2
Checking
a
single
triangle | | | | | | | | | | | | | 11 |
| | 3.3
Colliding
with
the
inside | of
a | | triangle | | | | | | | | | | 13 |
| | 3.4
The
sweep
test | | | | | | | | | | | | | 14 |
| | 3.5
In
summary | | | | | | | | | | | | | 16 |
| 4 | Collision
response | | | | | | | | | | | 18 | | |
| | 4.1
The
sliding
plane | | | | | | | | | | | | | 18 |
| | 4.2
Sliding
the
sphere | | | | | | | | | | | | | 20 |
| | 4.3
Gravity | | | | | | | | | | | | | 22 |
| | 4.4
In
summary | | | | | | | | | | | | | 23 |
| 5 | Conclusions | | | | | | | | | | | | | 25 |
| A | Calculating
the
normal
to
a
regular
surface | | | | | | | | | | | 27 | | |
| B | The
plane
class | | | | | | | | | | 32 | | | |
| C | Utility
functions | | | | | | | | 34 | | | | | |
