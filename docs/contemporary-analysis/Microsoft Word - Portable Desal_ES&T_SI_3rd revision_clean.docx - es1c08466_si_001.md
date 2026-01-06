---
title: "Supporting Information"
category: "contemporary-analysis"
---

# Supporting Information

## Portable Seawater Desalination System for Generating Drinkable Water in Remote Locations

Junghyo Yoona , Hyukjin J. Kwona , Sung Ku Kangb , Eric Brack c,\*, and Jongyoon Hana,\*

a Department of Electrical Engineering and Computer Science, Massachusetts Institute of Technology, 77 Massachusetts Avenue, Cambridge, MA 02139, USA

b Department of Civil and Environmental Engineering, Northeastern University, 360 Huntington Avenue, Boston, MA 02115, USA

c U. S. Army Combat Capabilities Development Command (DEVCOM) - Soldier Center, 10 General Greene Ave, Natick, MA 01760, USA

\*Corresponding authors.

E-mail address: eric.m.brack.civ@army.mil (E. Brack) and jyhan@mit.edu (J. Han)

| List
of
Supporting
Information |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| S1.
Development
of
the
predictive
model
with
machine
learning
4 |
| S2.
Various
configurations
of
multistage
electromembrane
process
and
prediction
of
optimized
operating
system
and
condition

6 |
| S3.
Portable
desalination
unit

7 |
| Figure
S1.
(a)
The
change
in
current
utilization
of
ICP
(CUICP)
as
a
function
of
current
on
the
(I)
system
with
respect
to
the
change
flow
rate
of
diluate
stream
(,).
(b)
The
voltage
drop
by
electrode
pair
(Velec)
8 |
| Figure
S2.
Experiment
set
up
and
result
of
(a)
ICP
and
(b)
ED.

9 |
| Figure
S3.
(a)
An
example
of
a
2-stage
electromembrane
process.
(b)
The
intermediate
responses
to
be
identified
for
the
efficient
evaluation
of
the
configuration
10 |
| Figure
S4.
The
overall
process
of
machine
learning
model
construction
and
its
utilization
to
predict
Vcell
and
SD:
(a)
Data
collection
via
simple
single-stage
ICP
and
ED
experiments;
(b)
training
machine
learning
model
using
the
experimental
data;
(c)
utilization
of
machine
learning
model
to
predict
intermediate
response
and
ultimately
overall
performance
of
a
multi-layer
stacked
desalination
device
10 |
| Figure
S5.
The
detailed
schematic
diagram
of
three
proposed
configurations
of
multistage
electromembrane
process,
+nICP,
nICP,
and
nICP/ED
11 |
| Figure
S6.
The
flow
chart
to
obtain
EPIR
for
the
corresponding
N-stage
electromembrane
process.

11 |
| Figure
S7.
Various
multistage
configurations
and
corresponding
energy
per
ion
removal
(EPIR).

12 |
| Figure
S8.
(a)
The
change
in
EPIR
of
2ICP/ED
as
a
function
of
the
number
of
cells
for
stage
1
(mS1)
and
stage
2
(mS2).
The
change
in
EPIR
as
a
function
of
(b)
mS1,
(c)
mS2,
and
(d)
Qsys,
D.

12 |
| Figure
S9.
The
change
in
salinity
of
outlets
and
the
salt
removal
rate
(SRRate)
of
each
stage
in
the
2ICP/ED
process
as
a
function
of
(a)
mS1,
(b)
mS2,
and
(c)
Qsys,
D.

13 |
| Figure
S10.
The
change
in
(a)
actually
applied
and
theoretically
required
currents
and
the
linear
regression
curve
for
the
applied
current
and
(b)
SEC
per
salt
removal
(SECsalt,
k Wh/kg)
to
produce
drinking
water
as
a
function
of
feed
salinity
14 |
| Figure
S11.
The
properties,
(a)
size
and
(b)
zeta
potential,
of
total
suspended
solids
(TSS,
formazin
particles.)
14 |
| Figure
S12.
The
suspended
solids
removal
by
single-stage
ICP
(1ICP),
two-stage
ICP
(2ICP),
and
2ICP/ED.
The
gray
shaded
area
indicates
the
range
of
crystal-clear
water
(0 (= 298.15 K) is the room temperature, respectively. ,(= 35 g/L) and ,(≈ 0.5 g/L) are the salinity of feed and diluate streams of the system, respectively. is the number of stages of the system. is the number of cells for the nth-stage. Specifically, to evaluate the performance of the 2-stage electromembrane process in Figure S3a, it is necessary to identify the intermediate responses V, V= V,, V(= V), ,= ,, and ,= ,. To predict the intermediate responses in an arbitrary condition, we define the functions , , ℎ, , and , which represent the intermediate response based on sets of input parameters as follows and shown in Figure S3b.

| Function
expression | Input
parameters | Output
parameters |
|--------------------------------------------------------------|-----------------------------------------|----------------------|
| =

 |  |  |
| =
,
,,,,
, | ,
,,,, | , |
| =
ℎ,
,,,,,,,
, | ,
,,,,,,, | , |
| =
,
,,,,
, | ,
,,,, | , |
| =
,
,,,,,,,
, | ,
,,,,,,, | , |

In this work, we used machine learning models to approximate the functions , , ℎ, , , such that one can efficiently predict the performance of a multi-layer stacked desalination device, as shown in Figure S3a. Figure S4 shows the overall process of machine learning model construction and its utilization to predict V and . First, experimental data (i.e., pairs of independent variables and a response variable) are collected via single-stage experiments. Then a machine learning model is trained using the experimental data to approximate a function representing the intermediate response (i.e., f, g, h, j, or k), such that it can predict the intermediate response for an arbitrary condition. Lastly, using a set of machine learning models, intermediate responses are predicted to evaluate the overall performance of an arbitrary desalination multistage configuration. This contributes to efficiently filtering out un-promising configurations, such that physical experiments for different configurations can be performed in a significantly narroweddown design space. It should be noted that this approach is founded upon the assumption that the interactions between stacked stages for multistage process, due to the change in current distribution, do not significantly affect the overall performance of the multistage process. For the case where the interactions between stacked stages are not negligible, it is necessary to model the interactions as well to obtain precise prediction results.

In this work, several machine learning algorithms have been tested and compared with linear interpolation/extrapolation using single-cell experiments (12 measurements for $V_{elec.}$ , 81 measurements from ED cell, and 263 measurements from ICP cell).

Table S2 and Table S3 present the mean and standard deviation of root mean square error (RMSE) and normalized RMSE (NRMSE) of the algorithms, derived through 20 repetitions of 5-fold cross-validation for each setting. Here, NRMSE is derived by dividing RMSE with the range of observation values (*i.e.*, experimental values), which represents a fraction of the overall range resolved by the model (Table S3). The configuration for each algorithm is as follows:

- Support Vector Regression:
 - Kernel function $K(x, x') = x^T x'$ ··· Linear function
- Gaussian Process Regression:
 - O Basis function H(X) = [1, X] ... Linear function kernel with automatic relevance determination (ARD), where

- $\sigma_f$ : Standard deviation of the response
- d: The number of independent variables where m = 1, 2, ... d
- $\sigma_m$ : Separate length scale for each independent variable
- Feedforward Network:
 - 2 hidden layers where the number of hidden nodes is tuned via Bayesian optimization.

The results imply that linear interpolation/extrapolation can predict the intermediate responses following a simple linear trend ( $V_{\rm elec}$ , $S_{\rm ICP,D}$ , and $S_{\rm ED,D}$ ), but machine learning algorithms can provide more reliable results in predicting the intermediate responses with more complex behavior ( $V_{\rm ED}$ and $V_{\rm ICP, cell}$ ). Considering the complexity of the underlying physical process, we assume that machine learning algorithms will provide better predictability than interpolation/extrapolation in most cases. This advantage justifies the use of machine learning algorithms to predict an optimal configuration of desalination devices. In this work, we used Gaussian process regression to narrow down the design space for physical experiments, as it provided the most reliable and accurate results. However, as the size of the dataset is relatively small to train an artificial neural network, we believe an artificial neural network-based algorithm can outperform Gaussian process regression, in case there are enough amount of training data.

S2. Various configurations of multistage electromembrane process and prediction of optimized operating system and condition

Three configurations of multistage electromembrane process are suggested in Figure S5: (i) serial connection of n ICP processes with individual electrode pairs (+nICP), (ii) sequential stack of n ICP processes between one electrode pair (nICP), and (iii) sequential stack of n ICP processes with 1 cell of ED at the last stage (nICP/ED). It is necessary to set standard conditions for EPIR analysis since there are countless flow rate conditions and the number of cells to be evaluated. The standard conditions are described in Table S4. Figure S6 shows the flow chart to obtain EPIR of n-stage electromembrane process. The corresponding EPIR values up to n=4 are calculated in Figure S7. The EPIR of +2ICP (= 226) and +3ICP (= 207) decreases by ~ 42% and ~39%, respectively, compared to that of 1ICP (= 534). This is because +nICP facilitates an operation with lower EPIR for each stage (Figure S2), even though +nICP entails a loss of diluate stream from the previous stage. The change in EPIR of +nICP starts to increase from +4ICP. The second configuration, nICP, allows eliminating additional EPIR of the electrode (EPIRelec) in +nICP due to the sequentially stacked stages between one pair of electrodes. The EPIRelec of 3ICP (= 30) reduces by ~33% compared to that of +3ICP (= 91). The third configuration, nICP/ED, allows for a further reduction of EPIR, minimizing EPIR at 2ICP/ED (= 127). The decrease in EPIR can be explained in two ways by comparing 3ICP and 2ICP/ED. 2ICP/ED has an equivalent number of the stage with 3ICP, but the recovery rate of 2ICP/ED (= 25%) is higher than that of 3ICP (= 12.5%) because the dilaute and concentrate streams from the second ICP stage are reused in ED. In addition, in ICP, thicker diffusion layers from concentrate and diluate streams may lead to an undesired internal mixing or a desalted flow leakage because concentrated and diluate streams appear in the same spacer. The deployment of ED spacer in the end-stage allows avoiding the problems arising from ICP because two streams are separated by ion-exchange membrane, providing complete desalination.

Figure S8a shows the change in EPIR of 2ICP/ED in stages 1 (m) and 2 (m). The two minimal points in EPIR for m and m (Figure S8b and c) represent an overall minimal EPIR (= 109.3 with m = 10 and m = 4) within a certain range of m and m values (110% of minimum EPIR with 6 3 (Axi Gear, US): a 114 Wh Li-Ion battery (Portable Power Bank 30Ah, Baseus 65W, Baseus, China), a 2ICP/ED module, a diaphragm pump (a16061400ux0550, Uxcell, US) for feed (inflow pump), a double head peristaltic pump (G328D, Aibecy, US) for diluate and concentrate outflows (outflow pump), a TDS sensor (KS0429, Keyestudio, US), and a customized DESAL controller including control and monitoring systems as well as a user-friendly mobile interface.

Figure S13a shows a flowchart illustrating the operational process of the DESAL controller. The DESAL controller is designed to allow various power sources by adopting the USB-C power delivery (PD) protocol. The ESP32 (Espressif Systems, China), which is a low-cost and low-power system on a chip microcontroller with integrated Wi-Fi and Bluetooth, was used for the DESAL controller enabling smartphone access in a real-time manner. A DC buck converter (MP1584EN, MPS, USA) is used to power the 2ICP/ED module and two pumps, and the voltage and current are measured with a digital potentiometer (AD8400, Analog Device, USA). The salinity of product flow is monitored by the TDS sensor. The DESAL controller has a power switch and a start/stop button, with a display showing the salinity, power consumption, and status of the desalination procedure for the intuitive control. As shown in Figure S13b, each component of the DESAL controller is compactly assembled with a dimension of 90 mm ⨉ 60 mm ⨉ 25 mm. It has a power connector for the 2ICP/ED module and pumps and pins for the buttons and status screen. We can turn on the briefcase desalination unit by pressing the power button and starting the initializing stage. Then, the desalting stage is initiated by pressing the start button on the unit or the smartphone. In the desalting stage, the DESAL controller automatically executes the flushing process for the 2ICP/ED module with a maximum power of 11 V for both pumps. After that, the voltage of the outflow pump is lowered to 3.25V, so that the production rate reaches 0.33 L/h. For the 2ICP/ED module, the voltage is applied with a 0.5V step from 0.5V to 7.5V. Each step is allowed to reach a steady state for 20 seconds to achieve better stability. Once the salinity reaches the drinking level (\* Note: Extrapolation failed for 13-14% of data on average, which makes it difficult to generalize the results.

## Table S3. NRMSE: Mean (Standard Deviation)

| | V | V | V, | , | , |
|-------------------------------------------|--------------------|---------------------|---------------------|----------------------|--------------------|
| Linear
interpolation/extrapo
lation | 0.0075
(0.0011) | 0.7440
(0.1165)* | 0.2633
(0.0376)* | 0.0166
(0.001406) | 0.0269
(0.0029) |
| Support
Vector | 0.0157 | 1.0254 | 0.8026 | 0.0640 | 0.1353 |
| Regression | (0.0018) | (0.0872) | (0.0451) | (0.0008) | (0.0042) |
| Gaussian
Process | 0.018125 | 0.078611 | 0.022499 | 0.008976 | 0.011034 |
| Regression | (0.002307) | (0.005082) | (0.002596) | (0.000636) | (0.000708) |
| Feedforward | 0.0185 | 0.5466 | 0.2484 | 0.0456 | 0.0362 |
| Network | (0.0141) | (0.1630) | (0.0518) | (0.0431) | (0.0326) |

\* Note: Extrapolation failed for 13-14% of data on average, which makes it difficult to generalize the results.

Table S4. The standard conditions for multistage electromembrane process.

| Symbol | Condition |
|---------------------------------------------------|--------------------------------------|
| , | 5
ml/m |
| , | 2 ×
, |
| , | 
0.48
g/L |
| , | 35
g/L |
| Recovery
rate
of
ICP
process | 50
% |
| The
cell
number
of
nth ICP
process | ∙ 2
3 |

Table S5. The number of sets to evaluate the scalability of production rate.

| Number
of
sets | 1
set | 2
sets | 3
sets |
|-------------------------------------|---------------------------------|----------------------------------|----------------------------------|
| m | 6 | 12 | 18 |
| m | 3 | 6 | 9 |
| m | 1 | 2 | 3 |
| , | 0.33
L/h | 0.67
L/h | 1.00
L/h |
| Weight | ~
3.6
kg | ~
4.5
kg | ~
5.4
kg |
| Size
(Length⨉Wide
⨉Thickness) | 31
cm
⨉
15cm
⨉7.7cm | 31
cm
⨉
15cm
⨉10.7cm | 31
cm
⨉
15cm
⨉13.6cm |

Table S6. The composition of feed, brine, and product water.

| Solute | Standard
seawater
[10] | Feed
(Seawater
from
Carson
beach) | Brine | Product
water |
|--------|------------------------------|-----------------------------------------------|---------|------------------|
| Cl | 19261.9 | 19228.0 | 19606.0 | 114.2 |
| Na | 10730.9 | 10027.5 | 10237.5 | 149.5 |
| S | 2699.6 | 2704.3 | 2834.3 | 204.5 |
| Mg | 1277.7 | 1137.0 | 1155.8 | 24.1 |
| Ca | 410.2 | 369.6 | 392.9 | 5.1 |
| K | 397.2 | 678.7 | 688.8 | 2.8 |
| B | 27.3 | 2.7 | 2.7 | 2.4 |
| Sr | 7.9 | 3.8 | 4.0 | 0.1 |
## | Sum | 34812.6 | 34151.6 | 34921.9 | 502.7 |

Table S7. The technical parameters for power consumption.

| Component | Voltage | Current | Power
consumption | Ref. |
|----------------------------|--------------------------|---------------------|----------------------------|------|
| Microcontroller
(ESP32) | 3.3
V | 20
~
25
mA | 66
~
82.5
mW | 7 |
| Potentiometer
(AD8400) | 3.3
V | N. A | 27.5
µW
*
3
EA | 8 |
| TDS
sensor
(KS0429) | 3.3
V | 3~6
mA | 9.9
~
19.8
mW | 9 |
## | | 76.0
~
102.5
mW | | | |

## SI References

- 1. Yoon, Junghyo, Vu Q. Do, Van-Sang Pham, and Jongyoon Han. "Return flow ion concentration polarization desalination: A new way to enhance electromembrane desalination." Water research 159 (2019): 501-510.
- 2. Kim, Bumjoo, Hyukjin Kwon, Sung Hee Ko, Geunbae Lim, and Jongyoon Han. "Partial desalination of hypersaline brine by lab-scale ion concentration polarization device." Desalination 412 (2017): 20-31.
- 3. Rainman 12 Volt DC (Electric) Water Maker. Enjoy fresh water anywhere., (n.d.). https://www.rainmandesal.com/12vdc-watermaker/(accessed June 10, 2021).
- 4. Ventura 150, (n.d.). https://www.spectrawatermakers.com/us/us/11123-ventura-150(accessed June 10, 2021).
- 5. Aquifer 200 DC, (n.d.). https://www.spectrawatermakers.com/us/us/11139-aquifer-200#product-description(accessed June 10, 2021).

- 6. Portable Emergency Seawater Desalination Watermaker 150GPD | 560LPD, (n.d.). https://www.ampac1.com/portable-emergency-seawater-desalination-watermaker-150gpd-560lpd-sw150.html(accessed June 10, 2021).
- 7. ESP32 Series Data sheet, (n.d.). https://www.espressif.com/sites/default/files/documentation/esp32\_datasheet\_en.pdf(accessed June 10, 2021).
- 8. Analog Device Digital Potentiometers, (n.d.). https://www.analog.com/media/en/technical-documentation/data-sheets/AD8400\_8402\_8403.pdf(accessed June 10, 2021).
- 9. KS0429 keyestudio TDS Meter V1.0 Keyestudio Wiki, (n.d.). https://wiki.keyestudio.com/KS0429\_keyestudio\_TDS\_Meter\_V1.0(accessed June 10, 2021).
- 10. Millero, Frank J., Rainer Feistel, Daniel G. Wright, and Trevor J. Mc Dougall. "The composition of Standard Seawater and the definition of the Reference-Composition Salinity Scale." Deep Sea Research Part I: Oceanographic Research Papers 55, no. 1 (2008): 50-72.
