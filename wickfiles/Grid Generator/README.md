# ALL CREDIT GOES TO BLUECAKE
Here's the description as described by bluecake:
I wanted to share some Javascript code that can be used to generate a grid, like this:
![1-basic](https://forum.wickeditor.com/uploads/default/original/2X/0/0dab8229be5b0b809ddb49972ddb4d794ec6f2c6.png)
There are many ways to use grids in various projects. I’ll include an example of a grid-based game further down.
This code can also be used to generated any kind of evenly-spaced objects, for patterns and such. For now, here is the basic project just focused on the code:
/grid-generator.wick
Some notes for using this code:

<details>
<summary>The most essential parts of the code (only a few lines)</summary>
This code generates a grid by cloning a clip. In this case, the clip is named tile. When adapting this into your own project, you need to make sure to replace all instances of “tile” in the code with the name of clip you’ll be using (or you could just name your clip tile).

The only other lines of code you will probably change in most projects are these four, which are all located at the top of the script:

```javascript
startX = 100; //set how far left grid starts
startY = 0; //set how far down grid starts
totalRows = 4; //set number of rows
totalCols = 4; //set number of columns
```

The startX and startY variables determine where the top leftmost cell of your grid starts (all other grid squares expand right and downwards from it). You can change the numbers to change the overall position of your grid.
</details>
<details>
<summary>Tips for creating different grid types (or patterns)</summary>
Your “tile” clip can be any kind of shape or image. For grids, you’d probably want to use a square tile, but rectangles could also function just as well:
![2-diffshapes](https://forum.wickeditor.com/uploads/default/original/2X/b/b28fb025267c17e99c34246f070ac7534234f13c.png)
I also included a line of code to demonstrate grid cells having different appearances from each other:

gridCellsArray[i].gotoAndStop(random.integer(1, 3));

By default this code is commented out. Uncommenting it will tell each cell to stop on a random frame. In this case, the tile has three frames, each with a different color, so the result will be something like this:
![3-diffcolors](https://forum.wickeditor.com/uploads/default/original/2X/4/4b8ac9b3c0cb4b1f351cfd98a66d47b044c17c68.png)
When creating patterns rather than grids, you will probably want to add some amount of spacing in-between objects. By default, these two lines of code determine the spacing between objects.

startX+=tile.width;
startY+=tile.height;

Since this code is designed for a grid, the result is tiles that are lined up side by side with no spacing. But if you were to increase tile.width and tile.height to larger values (by multiplying them, for example), you’d be increasing the distance between objects, and you’d be left with gaps as a result. For example, by multiplying both values by 2, like this:

startX+=tile.width*2;
startY+=tile.height*2;

You’d get this result:
![gaps](https://forum.wickeditor.com/uploads/default/original/2X/0/0c14c2d5cb1aa66abdea8370fb55e9562a78e0c1.png)
</details>

Lastly, I wanted to provide an example of how this code could be adapted into a game, so here’s a little project I came up with:
/grid-game.wick
![dog grid game](https://forum.wickeditor.com/uploads/default/original/2X/8/8505cea6e4de88784b3288bedf5da09fb81b0e5e.png)
