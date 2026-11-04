(()=>{"use strict";
const canvas=document.getElementById("mapleCityCanvas"),mini=document.getElementById("mapleMiniMap");if(!canvas)return;
const ctx=canvas.getContext("2d"),mc=mini?.getContext("2d"),W=28,H=24,TW=72,TH=36;
let w=1,h=1,dpr=1,last=0,panX=0,panY=0,drag=false,lastPt=null;
const player={x:13.5,y:14.5,face:1,walk:0},keys={};
const places=[
{id:"cafe",label:"NORTHSTAR CAFÉ",x:7,y:7,color:"#d95b48",kind:"cafe"},
{id:"jobs",label:"JOB CENTRE",x:20,y:6,color:"#3479b9",kind:"office"},
{id:"market",label:"MAPLE MARKET",x:5,y:16,color:"#e3a72e",kind:"shop"},
{id:"home-life",label:"YOUR HOME",x:22,y:17,color:"#d7a66e",kind:"house"},
{id:"park",label:"EVERGREEN PARK",x:13,y:4,color:"#4d9b50",kind:"park"},
{id:"library",label:"PUBLIC LIBRARY",x:23,y:10,color:"#8663b7",kind:"library"},
{id:"police",label:"POLICE STATION",x:3,y:9,color:"#3977b5",kind:"police"},
{id:"square",label:"CITY SQUARE",x:14,y:11,color:"#e6bd55",kind:"square"},
{id:"wallet",label:"MAPLE BANK",x:17,y:19,color:"#348f80",kind:"bank"}];
const trees=[[2,3],[5,3],[9,3],[17,3],[22,3],[25,4],[2,13],[9,13],[18,13],[25,14],[3,21],[8,21],[15,22],[19,22],[25,21],[11,8],[16,8],[11,17],[18,17]];
const road=new Set();for(let x=0;x<W;x++){road.add(x+",10");road.add(x+",18");}for(let y=0;y<H;y++){road.add("10,"+y);road.add("19,"+y);}
function iso(x,y){return{x:(x-y)*TW/2,y:(x+y)*TH/2};}
function poly(a,c,stroke){ctx.beginPath();ctx.moveTo(...a[0]);a.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();ctx.fillStyle=c;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function diamond(x,y,c){const p=iso(x,y);poly([[p.x,p.y-TH/2],[p.x+TW/2,p.y],[p.x,p.y+TH/2],[p.x-TW/2,p.y]],c);}
function tree(x,y){const p=iso(x,y);ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#805332";ctx.fillRect(-5,-29,10,30);poly([[-18,-28],[0,-55],[18,-28],[0,-10]],"#258b48");poly([[-14,-45],[0,-68],[14,-45],[0,-27]],"#48b94f");poly([[-8,-57],[0,-78],[8,-57],[0,-42]],"#78d65c");ctx.restore();}
function building(p){const q=iso(p.x,p.y),x=q.x,y=q.y,w=p.kind==="house"?48:60,h=p.kind==="house"?48:68;
ctx.fillStyle="#244a3438";ctx.beginPath();ctx.ellipse(x,y+15,42,13,0,0,Math.PI*2);ctx.fill();
poly([[x-w/2,y-h/2],[x,y],[x,y+30],[x-w/2,y-h/2+30]],p.kind==="house"?"#b77d52":"#477caa");
poly([[x,y],[x+w/2,y-h/2],[x+w/2,y-h/2+30],[x,y+30]],p.color);
poly([[x-w/2,y-h/2],[x,y-h],[x+w/2,y-h/2],[x,y]],p.kind==="house"?"#5d627b":"#f4cf83");
ctx.fillStyle="#bce8ef";ctx.fillRect(x-18,y-26,11,14);ctx.fillRect(x+7,y-35,11,14);ctx.fillStyle="#684a36";ctx.fillRect(x-3,y-2,9,22);
ctx.fillStyle="#fff";ctx.font="900 9px Arial";ctx.textAlign="center";ctx.fillText(p.label,x,y-h-8);
ctx.fillStyle=p.color;ctx.fillRect(x-26,y-h/2-2,52,8);}
function park(p){const q=iso(p.x,p.y);diamond(p.x,p.y,"#66b95b");ctx.fillStyle="#e7f3c5";ctx.font="bold 13px Arial";ctx.textAlign="center";ctx.fillText("🌳",q.x,q.y-10);}
function fountain(p){const q=iso(p.x,p.y);diamond(p.x,p.y,"#d9cba7");ctx.fillStyle="#558cbd";ctx.beginPath();ctx.ellipse(q.x,q.y-7,29,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#8ee5f4";ctx.beginPath();ctx.ellipse(q.x,q.y-10,22,9,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#d6fbff";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x,q.y-12);ctx.quadraticCurveTo(q.x-8,q.y-38,q.x,q.y-45);ctx.stroke();}
function car(x,y,color){const p=iso(x,y);ctx.save();ctx.translate(p.x,p.y);poly([[-22,-5],[0,-18],[22,-5],[0,7]],color,"#243d4d");poly([[-16,-7],[0,-16],[16,-7],[0,0]],"#b9e6f1");poly([[-22,-5],[0,7],[0,14],[-22,2]],"#344f66");poly([[0,7],[22,-5],[22,2],[0,14]],"#233e57");ctx.restore();}
function avatar(){const p=iso(player.x,player.y);ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#29425b55";ctx.beginPath();ctx.ellipse(0,7,17,8,0,0,Math.PI*2);ctx.fill();const step=Math.sin(player.walk)*2;ctx.fillStyle="#e6e8ed";ctx.fillRect(-11,step,9,10);ctx.fillRect(3,-step,9,10);ctx.fillStyle="#344b68";ctx.fillRect(-10,-13+step,9,15);ctx.fillRect(3,-13-step,9,15);ctx.fillStyle="#202e43";ctx.fillRect(-14,-37,28,25);ctx.fillStyle="#b9784f";ctx.fillRect(-10,-57,20,20);ctx.fillStyle="#24212a";ctx.fillRect(-11,-61,22,9);ctx.fillRect(-12,-56,5,9);ctx.fillRect(7,-56,5,7);ctx.fillStyle="#fff";ctx.fillRect(player.face>0?3:-7,-49,3,3);ctx.restore();}
function nearest(){let best=null,d=99;places.forEach(p=>{const n=Math.hypot(player.x-p.x,player.y-p.y);if(n<d){d=n;best=p;}});return d<2.7?best:null;}
function miniMap(){if(!mc||!mini)return;const r=mini.getBoundingClientRect(),mw=r.width,mh=r.height;mc.clearRect(0,0,mw,mh);mc.fillStyle="#9bce8b";mc.fillRect(0,0,mw,mh);mc.strokeStyle="#657d76";mc.lineWidth=5;mc.beginPath();mc.moveTo(0,mh*.45);mc.lineTo(mw,mh*.45);mc.moveTo(mw*.37,0);mc.lineTo(mw*.37,mh);mc.moveTo(mw*.72,0);mc.lineTo(mw*.72,mh);mc.stroke();places.forEach(p=>{mc.fillStyle=p.color;mc.fillRect(p.x/W*mw-4,p.y/H*mh-4,8,8);});mc.fillStyle="#fff";mc.strokeStyle="#173e68";mc.lineWidth=2;mc.beginPath();mc.arc(player.x/W*mw,player.y/H*mh,5,0,7);mc.fill();mc.stroke();}
function render(){ctx.clearRect(0,0,w,h);const scale=Math.min(w/1050,h/650,1.25),c=iso(player.x,player.y),ox=w/2-c.x*scale+panX,oy=h*.52-c.y*scale+panY;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
for(let i=0;i<13;i++){const x=-850+i*140,y=-510-(i%3)*22;ctx.fillStyle=["#7aa7bb","#6895b0","#8cb3c1"][i%3];ctx.fillRect(x,y,58,110+(i%4)*24);}
for(let sum=0;sum<W+H;sum++)for(let x=0;x<W;x++){const y=sum-x;if(y<0||y>=H)continue;const is=road.has(x+","+y);diamond(x,y,is?"#596c70":["#83c96a","#79c05f","#8bcf70"][(x*7+y*3)%3]);}
const q=iso(14,11);poly([[q.x,q.y-40],[q.x+72,q.y],[q.x,q.y+40],[q.x-72,q.y]],"#d9cba7");
const objs=[...trees.map(([x,y])=>({x,y,type:"tree"})),...places.map(p=>({...p,type:p.id==="park"?"park":p.id==="square"?"fountain":"building"}))].sort((a,b)=>a.x+a.y-b.x-b.y);
objs.forEach(o=>{if(o.type==="tree")tree(o.x,o.y);else if(o.type==="park")park(o);else if(o.type==="fountain")fountain(o);else building(o);});
car(8,10,"#df5144");car(18,10,"#327bb9");car(10,18,"#e6b23f");avatar();ctx.restore();miniMap();
const p=nearest(),hint=document.getElementById("gameInteract");if(hint){hint.classList.toggle("visible",!!p);hint.innerHTML=p?"Press <b>E</b> to visit "+p.label:"";}
const loc=document.getElementById("gameLocation");if(loc)loc.textContent="📍 "+(player.x<9?"WEST MAPLEWOOD":player.x>19?"EAST MAPLEWOOD":player.y<8?"NORTH MAPLEWOOD":"MAPLEWOOD DOWNTOWN");}
function move(dt){let dx=0,dy=0;if(keys.KeyA||keys.ArrowLeft)dx--;if(keys.KeyD||keys.ArrowRight)dx++;if(keys.KeyW||keys.ArrowUp)dy--;if(keys.KeyS||keys.ArrowDown)dy++;if(dx||dy){const l=Math.hypot(dx,dy);dx/=l;dy/=l;player.x=Math.max(1,Math.min(W-2,player.x+dx*dt*5));player.y=Math.max(1,Math.min(H-2,player.y+dy*dt*5));player.face=dx>=0?1:-1;player.walk+=dt*12;}}
function interact(){const p=nearest();if(p)document.dispatchEvent(new CustomEvent("maple:interact",{detail:{id:p.id}}));else document.dispatchEvent(new CustomEvent("maple:game-toast",{detail:{message:"Explore the city to find somewhere to visit."}}));}
function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}new ResizeObserver(resize).observe(canvas);resize();
window.addEventListener("keydown",e=>{if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)){keys[e.code]=true;if(!e.target.closest("input,textarea,select"))e.preventDefault();}if(e.code==="KeyE"&&!e.repeat){interact();e.preventDefault();}if(/^Digit[1-5]$/.test(e.code)&&!e.repeat)document.querySelector('[data-hotbar="'+["phone","eat","coffee","rest","inventory"][Number(e.code.slice(-1))-1]+'"]')?.click();});
window.addEventListener("keyup",e=>keys[e.code]=false);window.addEventListener("blur",()=>Object.keys(keys).forEach(k=>keys[k]=false));
canvas.addEventListener("pointerdown",e=>{drag=true;lastPt={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(drag&&lastPt){panX+=e.clientX-lastPt.x;panY+=e.clientY-lastPt.y;lastPt={x:e.clientX,y:e.clientY};}});canvas.addEventListener("pointerup",()=>{drag=false;lastPt=null;});canvas.addEventListener("pointercancel",()=>{drag=false;lastPt=null;});
document.querySelectorAll("[data-move]").forEach(b=>{const k={up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"}[b.dataset.move];b.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true;});["pointerup","pointerleave","pointercancel"].forEach(n=>b.addEventListener(n,()=>keys[k]=false));});
function frame(t){const dt=Math.min(.04,(t-last)/1000||0);last=t;move(dt);render();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();