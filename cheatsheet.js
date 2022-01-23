// Reset transformations like ctx.translate and ctx.rotate
ctx.setTransform(1, 0, 0, 1, 0, 0);

// fps counter
const FPS = (()=>{
  let N = 5;
  let THRESHOLD = 3;
  let times = [];
  let cur = 0;
  let on = -1;
  document.addEventListener("keypress", e => {
    if (e.keyCode == 102) on = -on;
  });
  return (ctx)=>{
    if(on < 0 || !SHOW_FPS) return;
    times.push(Date.now());
    if(times.length > N){
      times.shift();
    }
    ans = 1000 / ((times[times.length - 1] - times[0]) / (times.length-1));
    ans = Math.floor(ans);
    if (Math.abs(ans - cur) >= THRESHOLD) cur = ans;
    ctx.fillStyle = "white";
    ctx.fillRect(5, 5, 85, 35)
    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${cur}`, 45, 33);
  }
})();

// resize listener
let width, height;
function resize (){
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  if (window.devicePixelRatio > 1){
    cvs.width = cvs.clientWidth * 2;
    cvs.height = cvs.clientHeight * 2;
    ctx.scale(2, 2);
  } else {
    cvs.width = width;
    cvs.height = height;
  }
}
resize();
window.addEventListener ('resize', resize, false);

// left pad
function leftpad(arr){
  // left pads elements such that all are right aligned
  const mx = Math.max(...Array.from(arr, s => s.length));
  let a = arr.map(s => Array.from(new Array(mx - s.length), _ => '&nbsp;'));
  a.forEach((a, i) => a.push(...arr[i].split('')));
  a = a.map((a) => a.join(''));
  return a;
