---
layout: ../../layouts/LayoutWithSidebar/LayoutWithSidebar.astro
setup: |
  import ButtonLink from '@/components/shared/ButtonLink.astro';
  import Columns from '@/components/shared/Columns.astro';
  import ColumnLeft from '@/components/shared/ColumnLeft.astro';
  import ColumnRight from '@/components/shared/ColumnRight.astro';
sidebarFilter: true
title: Participate
color: orange
---

# Designer? Developer?<br>Love Open Source?<br>Everyone Can Participate!

### Help Design New Emoji
<Columns>
<ColumnLeft>
The next set of emojis are due to be released this year, we need your help to make them!

<ButtonLink href="https://github.com/hfg-gmuend/openmoji/issues/124">Get started</ButtonLink>
</ColumnLeft>

<ColumnRight>
![Emoji 13.0](/styleguide-emoji13.svg)
</ColumnRight>
</Columns>

### Improve Quality of Emojis
<Columns>
<ColumnLeft>
Design is subjective but we want our emoji to follow our style guide and look good.

<ButtonLink href="https://github.com/hfg-gmuend/openmoji/issues/142">Get started</ButtonLink>
</ColumnLeft>

<ColumnRight>
![Comparison polar bear emoji before and after redesign](/styleguide-emojidesign.png)
</ColumnRight>
</Columns>

### Improve Consistency with Other Platforms
<Columns>
<ColumnLeft>
To be useful for communication, emoji need to convey the same idea. 

<ButtonLink href="https://github.com/hfg-gmuend/openmoji/issues/143">Get started</ButtonLink>
</ColumnLeft>

<ColumnRight>
![Example of how other emoji libraries influence the OpenMojis](/styleguide-consistency.svg)
</ColumnRight>
</Columns>

## Styleguide
### Grid
The Grid serves as orientation for the size of the emojis. If possible your emojis **should stay inside the Grid**, but for edge cases use 4px of padding.

#### Basic Forms
<Columns>
<ColumnLeft>
The four basic forms define the possible extents, aiming to **visually balance** every icon. They don't always have to be fully filled.
</ColumnLeft>

<ColumnRight>
![The full grid](/styleguide-grid.svg)
</ColumnRight>
</Columns>

<Columns>
<ColumnLeft>
Special cases are the “Emoji Faces”. They are placed inside a smaller circle to leave space for additions, such as tears or hands.
</ColumnLeft>

<ColumnRight>
![The full grid with the center circle highlighted](/styleguide-emoji-circle.svg)
</ColumnRight>
</Columns>

<Columns>
<ColumnLeft>
**Examples**
</ColumnLeft>

<ColumnRight>
![3 examples of emoji placed within the grid](/styleguide-examples-grid.svg)
</ColumnRight>
</Columns>

#### Basic Circles
<Columns>
<ColumnLeft>
Basic circles should give a consistent look to the entire set. Parts of the circles can also be used for rounded corners or wavy forms.
</ColumnLeft>

<ColumnRight>
![Circles in various sizes from 46px to 4px](/styleguide-basic-circles.svg)
</ColumnRight>
</Columns>

<Columns>
<ColumnLeft>
**Examples**
</ColumnLeft>

<ColumnRight>
![Three emoji showing the various circle sizes in use](/styleguide-examples-basic-circles.svg)
</ColumnRight>
</Columns>

### Contour
<Columns>
<ColumnLeft>
The stroke settings are: **2px weight, round corners and ends**. Two overlapping contours should have a minimum gap of 2px.
</ColumnLeft>

<ColumnRight>
![The different types of contours and cornes: Round caps, round edges and centered contour](/styleguide-contour.svg)
</ColumnRight>
</Columns>

#### Open Contour
<Columns>
<ColumnLeft>
The open contours result in a nice dynamic look and should be used for overlapping lines or perspective.
</ColumnLeft>

<ColumnRight>
![Two examples showing the open contour](/styleguide-open-contour.svg)
</ColumnRight>
</Columns>

#### Contour and Fill
<Columns>
<ColumnLeft>
The fill should continue as if the contour was still there
</ColumnLeft>

<ColumnRight>
![Two examples the expected fill style](/styleguide-open-contour-color.svg)
</ColumnRight>
</Columns>

#### Perspective
<Columns>
<ColumnLeft>
All objects should be displayed **2-dimensionally** from the front. In exceptional cases use an isometric projection for better distinction.
</ColumnLeft>

<ColumnRight>
![Example for dos and don'ts regarding perspective](/styleguide-perspective.svg)
</ColumnRight>
</Columns>

### Color
Please aim to mainly use the **primary colors**. Use the lighter colours as default colours and reserve the darker colors for shadowing. The four **secondary colors** should only be used in special cases.

<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette.svg">OpenMoji Color Palette (.svg)</ButtonLink>

<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette-inkscape.gpl">Inkscape Palette (.gpl)</ButtonLink>

<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette-adobe-illustrator.ase">Illustrator Palette (.ase)</ButtonLink>

<Columns>
<ColumnLeft>
**Primary Colors**
</ColumnLeft>

<ColumnRight>
![The primary colors: Two shades of blue, red, green and yellow and a range from white to black with 3 grays in between](/styleguide-primary-colors.svg)
</ColumnRight>
</Columns>

<Columns>
<ColumnLeft>
**Secondary Colors**
</ColumnLeft>

<ColumnRight>
![The secondary colors: Two shades of rose, lavender, orange and brown](/styleguide-secondary-colors.svg)
</ColumnRight>
</Columns>

### Shadow
<Columns>
<ColumnLeft>
The lighter color should be used for the fill, the darker color for the shading.
</ColumnLeft>

<ColumnRight>
![Two examples showing the shading](/styleguide-shadows.svg)
</ColumnRight>
</Columns>

### Typography
<Columns>
<ColumnLeft>
We provide a custom font for emojis which have to contain typographic elements. Please use it for all text.
<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-abc.svg">openmoji-abc.svg</ButtonLink>
</ColumnLeft>

<ColumnRight>
![A sample of the custom openmoji font](/styleguide-typography.svg)
</ColumnRight>
</Columns>

### Topics
#### People
![Multiple examples of people-emojis](/styleguide-people.svg)

##### Full Body
<Columns>
<ColumnLeft>
People are pictured without clothing. Narrow their legs at the bottom. Arms are drawn as a single line. Static people are portrayed from the front, moving people from the side. Complex objects with a lot of overlapping forms should be simplified.
</ColumnLeft>

<ColumnRight>
![Examples of full body emojis](/styleguide-full-body.svg)
</ColumnRight>
</Columns>

##### Bust
<Columns>
<ColumnLeft>
The face is elliptical. There is no neck, but there is a gap between head and shoulders. The eyes are in the middle of the head. For a neutral look, the mouth should align to the center point of the eyes.
</ColumnLeft>

<ColumnRight>
![Examples of emoji where only the bust is visible](/styleguide-bust.svg)
</ColumnRight>
</Columns>

##### Hands
<Columns>
<ColumnLeft>
The thumb converges slightly at the end. The lower side of the hand is rounded. Fingers have a width of 7px.
</ColumnLeft>

<ColumnRight>
![Examples of hand-emojis](/styleguide-hands.svg)
</ColumnRight>
</Columns>

#### Arrows
<Columns>
<ColumnLeft>
The arrow head is made out of one basic form.
</ColumnLeft>

<ColumnRight>
![Examples of arrow-emojis](/styleguide-arrows.svg)
</ColumnRight>
</Columns>

<Columns>
<ColumnLeft>
Arrows use double lines for every emoji. For special cases (e.g. icons for user interfaces), a single line is possible as well.
</ColumnLeft>

<ColumnRight>
![Example of how to translate from a double line emoji to a single line emoji](/styleguide-arrows-2.svg)
</ColumnRight>
</Columns>

#### Buildings
<Columns>
<ColumnLeft>
Buildings are shown **from the front** with an entrance door. Details should be reduced strongly.
</ColumnLeft>

<ColumnRight>
![Examples of buildings](/styleguide-buildings.svg)
</ColumnRight>
</Columns>

#### Animals and Plants
<Columns>
<ColumnLeft>
Plants are illustrated **organically**. Stems should always be a single line. Animals with a big body are illustrated from the side. The body shape should be organic, but not simplified too much.
</ColumnLeft>

<ColumnRight>
![Examples of animal-emojis and plant-emojis](/styleguide-plants-animals.svg)
</ColumnRight>
</Columns>

#### Vehicles
<Columns>
<ColumnLeft>
Vehicles should be deduced from the shapes of **real world models** to avoid a toyish look. Vehicles are illustrated from the side. Tires are placed on the bottom line of the vehicle.
</ColumnLeft>

<ColumnRight>
![Examples of vehicle-emojis](/styleguide-vehicles.svg)
</ColumnRight>
</Columns>

### Submission
#### SVG File Specification
<Columns>
<ColumnLeft>
File Name: **Unicode.svg**
<br><br>
Example: **1F469-200D-1F680.svg**
<br><br>
Mandatory layers:
- **line**
- **hair**
- **skin-shadow**
- **color**
- **grid**

</ColumnLeft>

<ColumnRight>
![Screenshot of Adobe Illustrator with the correct layers](/styleguide-submission-layer-structure.png)
</ColumnRight>
</Columns>

#### Special Layers
You might run into situations where you need special layers such as **color-foreground** or **line-supplement**. Both are optional and should only be used if really necessary.

##### color-foreground
<Columns>
<ColumnLeft>
The red frame of the bike has to be in the foreground. Therefore, add a "color-foreground" layer and put it before "line" layer.
</ColumnLeft>

<ColumnRight>
![Explanation on how to structure the file](/styleguide-bicycles.svg)
</ColumnRight>
</Columns>

##### line-supplement
<Columns>
<ColumnLeft>
The black line of the exploding head has to be underneath the "color" layer. Therefore, add a "line-supplement" layer and put it behind the "color" layer.
</ColumnLeft>

<ColumnRight>
![Explanation on how to structure the file](/styleguide-explodinghead.svg)
</ColumnRight>
</Columns>

#### Export
##### Adobe Illustrator
<Columns>
<ColumnLeft>
1. Click File > Export > Export for Screens
2. Click "gear" icon
3. Set "Format Settings" for SVG
</ColumnLeft>

<ColumnRight>
![Screenshot from Adobe Illustrator with the correct export settings](/styleguide-Export.png)
</ColumnRight>
</Columns>

##### Inkscape
<Columns>
<ColumnLeft>
1. Click File > Save As
2. Click Save as type: > Optimised SVG > Save
3. Set "Optimised SVG Output" Settings
</ColumnLeft>

<ColumnRight>
![Screenshots from Inkscape with the correct export settings](/styleguide-ExportInkscape.png)
</ColumnRight>
</Columns>


##### Figma
<Columns>
<ColumnLeft>
1. Select frame
2. In the export pane select SVG and set `.figma` as suffix
3. Make sure *Contents Only* and *Include "id" Attribute* is checked
4. Run `node helpers/prettyfy-figma-svg.js`
</ColumnLeft>

<ColumnRight>
![Screenshot from Figma with the correct export settings](/styleguide-ExportFigma.png)
</ColumnRight>
</Columns>


#### Templates

<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-template.ai">openmoji-template.ai</ButtonLink>

<ButtonLink href="https://openmoji.org/php/download_asset.php?type=url&target_url=https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-template.svg">openmoji-template.svg</ButtonLink>