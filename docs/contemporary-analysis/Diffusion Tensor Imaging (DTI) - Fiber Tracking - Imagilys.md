---
title: "Diffusion Tensor Imaging (DTI) - Fiber Tracking"
category: "contemporary-analysis"
tags:
  - analysis
  - current-events
---

#### [imagilys.com](https://www.imagilys.com/diffusion-tensor-imaging-dti/)

# Diffusion Tensor Imaging (DTI) - Fiber Tracking

4-6 minutes

# Diffusion Weighted Imaging

Water molecules, in our body, undergo random translational motion. In physics, this motion is called "Brownian Motion", or simply "Diffusion". If we apply special diffusion-encoding gradients, the magnetic resonance (MR) images can be made sensitive to this motion. The technique is called diffusion weighted imaging (DWI). The extend to which the image is weighted by diffusion is controlled by the b-value. When the b-value equals zero, the images are not weighted by diffusion (left). When the b-value is greater than zero (e.g. b=1,000), the images are diffusion-weighted (right).

In voxels in which the diffusion is free, the spins acquire random phases, leading the a signal loss. Hence, the black appearance of the ventricles on diffusion-weighted images. When the diffusion is hindered (by the cellular membranes, by the myelin shield, etc.), the signal is higher. Hence, the gray appearance of the brain parenchyma on diffusion-weighted images.

## ![](_page_1_Picture_2.jpeg)

Magnetic resonance image without (B=0) and with (B=1,000) diffusion weighting.

# Diffusion Tensor Imaging

The architecture of the axons in parallel bundles and their myelin shield facilitate the diffusion of the water molecules along their main direction. If we apply diffusion gradients in at least 6 noncollinear directions, it is possible to calculate, for each pixel, a diffusion tensor (i.e. a 3\*3 matrix) that describes this diffusion anisotropy.

The fiber's direction is indicated by the tensor's main eigenvector. This vector can be color-coded, yielding a cartography of the tracts' position, direction (red for right-left, blue for foot-head, green for anterior-posterior), and anisotropy (as indicated by the tract's brightness). The brain's main white matter tracts can be recognized (White Matter Atlas).

In addition, the apparent diffusion coefficient (ADC) and fractional anisotropy (FA) can be quantified.

## ![](_page_2_Picture_2.jpeg)

#### Fiber Tracking

Fiber tracking uses the diffusion tensor to track fibers along their whole length. Starting from a seed region of interest (ROI), generally defined manually, the fiber tracking algorithm looks for adjacent voxels whose main diffusion direction is in the continuity of the previous one. In clinical practice, the most tracked fiber bundle is the cortico-spinal tract. However, fiber tracking can identify most of the brain's white matter tracts. In this image, the arcuate fasciculus has been tracked, between Broca's and Wernicke's areas of language.

## ![](_page_2_Picture_5.jpeg)

## Limitations

The diffusion tensor imaging model assumes that, in each voxel, there is a unique orientation of the fibers, the direction of which is represented by the tensor's main eigenvector (Mori and Tournier, 2013). This assumption is not valid in case of crossing fibers. The term "crossing fibers" generally refers to regions in which the fibers' orientation is not unique, i.e. when the fibers are interdigitating, brushing past each other, curving, bending or diverging (Mori and Tournier, 2013). Higher order models, such as constrained spherical deconvolution, have been developed in order to address the issue of crossing fibers.

### Applications

Tract-specific localization of white matter lesions Localization of tumors in relation to the white matter tracts (infiltration, deflection, oedema, destruction) Localization of the main white matter tracts for neurosurgical planning Assessment of the white matter maturation

## Watch Brain Magix tutorial videoarrow\_forward

## References

Hermoye, Mori et al. Pediatric diffusion tensor imaging: normal database and observation of the white matter maturation in early childhood. Neuroimage 2006, 29:493-504.

Le Bihan. Looking into the functional architecture of the brain with diffusion MRI. Nat Rev Neurosci. 2003, 4:469-80.

Lemaire, Hermoye et al. White matter anatomy of the human deep brain revisited with high resolution DTI fibre tracking. Neurochirurgie 2011, 57:52-67.

Mori and Tournier Introduction to Diffusion Tensor Imaging: And Higher Order Models. Academic Press 2013.

Mori and van Zijl. Fiber tracking: principles and strategies - a technical review. NMR Biomed. 2002,15:468-80.

Wakana et al. Fiber tract-based atlas of human white matter anatomy. Radiology 2004, 230:77-87.

Tournier et al. Diffusion tensor imaging and beyond. Magn Reson Med. 2011, 65:1532-56.
