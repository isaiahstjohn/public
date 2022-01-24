/*
 * This simulation calculates the phase by counting the seconds since
 * the first new moon of 2022 on Jan 17, dividing by the precise
 * period length of the moon cycle in seconds, and taking the remainder.
 * The accuracy of this simulation can be checked with the following
 * formula for the Nth full moon after the first full moon of 2020:
 *
 *   s = (20.362 + 29.530588861*N + 102.026*10^(-12)*N^2 - 0.000739 - 235*10^(-12)*N^2)*24*60*60
 *
 * (credit: en.wikipedia.org/wiki/Full_moon)
 *
 * Here, s is the number of seconds after 12 pm Jan 1, 2000 to the Nth full moon.
 * I was able to convert several of these calculations to seconds since the Unix epoch and
 * verify that this simulation shows a full moon at those dates. Note that the actual time
 * of the moon phases can differ from these ideal calculations by up to 14.5 hours.
 */
(()=>{
const DARK_SIDE_FACTOR = 0.08;
const TICKS_PER_DAY = 80;
const BLUR = 2.1; 
const RADIUS = 160;
const FADEIN_DUR = 2
const SETBACK = 24 * 60 * 60 * 3; // start clock 3 days before now

// Seconds it takes the moon to complete one full cycle
const PERIOD = 29.53058770576 * 24 * 60 * 60;
// First newmoon of 2022 in seconds from the epoch
const newmoon = Date.UTC( 2022, 0, 17, 22, 48 ) / 1000; // secs

const PI = Math.PI;
const cos = Math.cos;
const pow = Math.pow;
const sin = Math.sin;
const floor = Math.floor;
const ceil = Math.ceil;

const WAXING = 'waxing';
const WANING = 'waning';

const cvs = document.getElementById( "canvas" );
const ctx = cvs.getContext( "2d" );

// W, H: Canvas width and height
let W, H;
W = 2*RADIUS + 2*ceil(BLUR);
if(document.body.clientWidth < W) W = document.body.clientWidth;
cvs.height = cvs.width = H = W;
let rad = W/2 - ceil(BLUR);

let dateEl = document.getElementById("date");
function setDate(date, fadein_opacity){
  // Update date display
  y = date.getFullYear();
  m = date.toLocaleString('default', {month: 'long'}).slice(0, 3);
  d = date.getDate().toString();
  if(d.length === 1) d = '0' + d;
  dateEl.innerHTML = `${m} ${d}, ${y}`;
  dateEl.style.opacity = fadein_opacity;
}

let tick = 0;
let tilt = 15 * PI/180;
let fadein_start = Date.now()/1000 - SETBACK;
let fadein_opacity = 1;
let fadein_done = false;

// Main loop
draw();
function draw(){
  requestAnimationFrame( draw );
  let now = Date.now()/1000 - SETBACK; // secs from epoch UTC
  if(!fadein_done){
    let fadein_elapsed = now - fadein_start;
    fadein_opacity = pow(fadein_elapsed/FADEIN_DUR, 3);
    if(fadein_opacity >= 1){
      fadein_opacity = 1;
      fadein_done = true;
    }
  }
  now += tick * 24 * 60 * 60 / TICKS_PER_DAY // add one day each tick;
  setDate(new Date(now*1000), fadein_opacity); // set date display
  // Secs elapsed since last new moon
  let cycletime;
  if(now - newmoon >= 0){
    cycleTime = ( now - newmoon ) % PERIOD;
  }else{
    // Keep cycle consistent when going back before 2022
    cycleTime = ((now - newmoon) % PERIOD + PERIOD) % PERIOD;
  }
  // Angle of the Sun from the line passing through the Earth and Moon.
  let theta = ( cycleTime * 2 * PI ) / PERIOD;
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);
  let phase = ( theta >= PI ) ? WAXING : WANING;
  // If we project a cartesian plane onto the moon, `v` is on the x-axis
  // and `w` is on the y-axis.
  // Now we need to find the points on the curve above and below the 
  // x-axis. We can just calculate for above and use symmetry to get
  // below.

  // While we're doing this, we get the points on the circle with radius `rad`
  // for free. Which we will need since
  // ctx.arc() won't work here. It works well for slices and
  // arcs bounded by chords, but it does not do crescent moon shapes. So
  // we have to draw our own circle. Again, we can use symmetry.
  let curve = [];    // The curve that splits the moon down the middle
  let arc;           // A half circumference of the moon
  let rAtW, v;
  if( theta <= PI ){
    v = rad * cos(theta); // The position of the shadow curve on the x-axis
    arc = [ [-rad, 0] ];
  }else{
    v = rad * -cos(theta);
    arc = [ [rad, 0] ];
  }

  curve.push( [v, 0] );
  for( let w = 1; w < rad; w++ ){
    rAtW = pow( pow(rad, 2) - pow(w, 2), 0.5 );
    // We push the points in reverse order for the arc and the curve.
    // That's because when we draw the curve, we'll be going up, and 
    // then when we draw the arc, we'll be going back down.
    if (phase === "waning"){
      v = rAtW * cos( theta );
      arc.unshift( [-rAtW, w] );
      arc.push( [-rAtW, -w] );
      curve.push( [v, w] );
      curve.unshift( [v, -w] );
    } else {
      v = -rAtW * cos( theta );
      arc.unshift( [rAtW, w] );
      arc.push( [rAtW, -w] );
      curve.push( [v, w] );
      curve.unshift( [v, -w] );
    }
  }

  ctx.translate(W/2, H/2);
  ctx.rotate(-tilt);

  // draw the portion of the Moon in shadow
  ctx.beginPath();
  let shadow_opacity = DARK_SIDE_FACTOR < fadein_opacity ? DARK_SIDE_FACTOR : fadein_opacity;
  ctx.fillStyle = `rgba(255, 255, 255, ${shadow_opacity})`;
  ctx.lineWidth = 0;
  ctx.arc(0, 0, rad, 0, 2*PI);
  ctx.fill();
 
  // and draw the rest of the Moon
  ctx.beginPath();
  ctx.fillStyle = `rgba(205, 202, 187, ${fadein_opacity})`;
  ctx.filter = `blur(${BLUR}px)`;
  ctx.moveTo( 0, -rad );
  for( const pt of curve ){
    ctx.lineTo( ...pt );
  }
  ctx.lineTo( 0, rad );
  for( const pt of arc ){
    ctx.lineTo( ...pt );
  }
  ctx.lineTo( 0, -rad );
  ctx.stroke();
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  tick += 1;
}
})();

