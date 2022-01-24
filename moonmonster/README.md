# Moon Monster
[Moon Monster](https://themoon.monster) is a simple HTML5 Canvas app 
that shows how the phases of the Moon will change over time. It has
no dependencies.

## How it works
I was able to get a precise figure for the number of seconds in a
full cycle from Wikipedia. I use that and the precise date and time
of the first New Moon of 2022 to calculate the angle of the sun
relative to the Earth and Moon at any date in the past or future.

From there, I used some simple trigonometry to calculate the line 
between light and dark on the surface of the Moon. I had to manually
calculate the the line that forms the circumference of the Moon, too,
since the Canvas API's `arc` method seems to only work with shapes
that are pie shaped or circles when using `fill`.

## Future work
There is one performance improvement I have in mind that might be
worth looking at if performance ever became a problem. Currently,
I calculate and draw the points for the full Moon. I use the 
horizontal symmetry to simplify those calculations, but I think I
could be even more efficient if I didn't even draw those points. 
Instead, I could just draw the top half of the Moon and then 
use `transform` to flip it for the bottom of the Moon. For now, it
runs perfectly fine, even if I calculate 500 times more points than
I do currently.
