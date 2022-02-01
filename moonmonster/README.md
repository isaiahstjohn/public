# Moon Monster
[Moon Monster](https://themoon.monster) is a simple HTML5 Canvas app 
I created that shows how the phases of the Moon will change over time. It has
no dependencies.

## How it works
I was able to get a precise figure for the number of seconds in a
full cycle from Wikipedia. I use that and the precise date and time
of the first new Moon of 2022 to calculate the angle of the sun
relative to the Earth and Moon at any date in the past or future.

From there, I used some simple trigonometry to calculate the line 
between light and dark on the surface of the Moon. I had to manually
calculate the the line that forms the circumference of the Moon, too,
since the Canvas API's `arc` method seems to only work with shapes
that are pie shaped or circles when using `fill`.

## Future work
Instead of calculating the angle of rotation as a function of time,
it would be better to calculate time as a function of the angle of
rotation and number of full rotations. Then I could easily cache
calculations for each angle and avoid any intensive number crunching
after the first full revolution.

I also found that the date is currently not visible on some small
devices. So I would like to improve the responsiveness. Unfortunately,
canvas resizing isn't straightforward. It should be possible to simply
resize based on `canvas.clientHeight` and `canvas.clientWidth` in
a window resize event handler, but this doesn't work. It seems that
the browser is not providing accurate dimensions. I believe the best
workaround is likely to be that taken by https://github.com/swevans/canvas-resizer , 
which is to remove the canvas from the document, detect the
parent element's size, resize the canvas to match, and finally
add it back to the document.
