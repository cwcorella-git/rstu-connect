## Improved Collision detection and Response

Kasper Fauerby kasper@peroxide.dk http://www.peroxide.dk

## 25th July 2003

## Contents

| 1 | Introduction | | | | | | | | | | | | | 3 |
|---|---------------------------------------------------------------|---------|--|----------|--|--|--|--|----|--|----|----|--|----|
| | 1.1<br>Previous<br>work | | | | | | | | | | | | | 3 |
| | 1.2<br>The<br>algorithm | | | | | | | | | | | | | 3 |
| | 1.3<br>How<br>to<br>read<br>this<br>document | | | | | | | | | | | | | 4 |
| 2 | Vector<br>spaces | | | | | | | | | | 5 | | | |
| | Denition<br>2.1<br>of<br>a<br>vector | space | | | | | | | | | | | | 5 |
| | R3<br>2.2<br>Case<br>study: | | | | | | | | | | | | | 6 |
| | 2.3<br>Coordinates | | | | | | | | | | | | | 7 |
| | 2.4<br>Ellipsoid<br>space | | | | | | | | | | | | | 7 |
| 3 | Collision<br>detection | | | | | | | | | | | 9 | | |
| | 3.1<br>Overview | | | | | | | | | | | | | 9 |
| | 3.2<br>Checking<br>a<br>single<br>triangle | | | | | | | | | | | | | 11 |
| | 3.3<br>Colliding<br>with<br>the<br>inside | of<br>a | | triangle | | | | | | | | | | 13 |
| | 3.4<br>The<br>sweep<br>test | | | | | | | | | | | | | 14 |
| | 3.5<br>In<br>summary | | | | | | | | | | | | | 16 |
| 4 | Collision<br>response | | | | | | | | | | | 18 | | |
| | 4.1<br>The<br>sliding<br>plane | | | | | | | | | | | | | 18 |
| | 4.2<br>Sliding<br>the<br>sphere | | | | | | | | | | | | | 20 |
| | 4.3<br>Gravity | | | | | | | | | | | | | 22 |
| | 4.4<br>In<br>summary | | | | | | | | | | | | | 23 |
| 5 | Conclusions | | | | | | | | | | | | | 25 |
| A | Calculating<br>the<br>normal<br>to<br>a<br>regular<br>surface | | | | | | | | | | | 27 | | |
| B | The<br>plane<br>class | | | | | | | | | | 32 | | | |
| C | Utility<br>functions | | | | | | | | 34 | | | | | |
