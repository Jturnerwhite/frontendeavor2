## frontendeavor2
TLDR: Next.js app with complex client state (Redux), persisted game progress, and tested domain logic—deployed at X.

An exploration into Next.js and the /hex/ folder contains a React application puzzle game with redux for state management.
Currently no Next.js backend added, currently WIP.

### Alcahexy
A currently in progress puzzle project done in Typescript, React, and Redux.

#### Gathering
![MapProgress](/githubImages/mapProgres.PNG)

Collect ingredients on the map by selecting location hexes.
Different biomes give you different ingredients.
Ingredients have quality, and various components they are made of (which will be key in crafting with them).

#### Crafting
![MapProgress](/githubImages/selectRecipe.PNG)

From the map screen, click the center hex to go 'home' and select "Craft"
Here you will choose a recipe, then ingredients to use.

#### Alchemy
![MapProgress](/githubImages/crafting.PNG)

Here you click on components of an ingredient and add it to the hex board.
Stars link together, unlocking the full potential of the item you're trying to craft.
Progress towards the craft's outcome is shown on the right.

