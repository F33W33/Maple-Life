(()=>{
"use strict";
const root=document.querySelector("#mapleGame .game-world");
if(!root||!window.THREE)return;
const host=document.getElementById("maple3d");
if(!host)return;
host.innerHTML="";
const mini=document.getElementById("mapleMiniMap"),mc=mini?.getContext("2d");
const T=THREE,scene=new T.Scene();
scene.background=new T.Color(0x9edcf4);
scene.fog=new T.Fog(0x9edcf4,90,230);
const camera=new T.OrthographicCamera(-24,24,18,-18,.1,300); camera.zoom=1;
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
renderer.shadowMap.enabled=false;
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
host.appendChild(renderer.domElement);
scene.add(new T.HemisphereLight(0xffffff,0x8da77b,2.0));
const sun=new T.DirectionalLight(0xfff2d8,2.0);sun.position.set(-55,90,45);scene.add(sun);
const mat=(c,rough=.9)=>new T.MeshLambertMaterial({color:c});
const M={
 grass:mat(0x72b957),grass2:mat(0x82c965),road:mat(0x454b52),asphalt:mat(0x535b63),
 curb:mat(0xd4d0c6),concrete:mat(0xcac8be),white:mat(0xf5f0e5),
 trim:mat(0xfaf7ed),glass:mat(0x8dcbdc),glassDark:mat(0x5b91a4),
 wood:mat(0x91613e),door:mat(0x805238),roof:mat(0x45434b),
 roofBlue:mat(0x465b70),roofRed:mat(0x774a43),leaf:mat(0x4e9849),
 leaf2:mat(0x72b95b),trunk:mat(0x765039),black:mat(0x24272b),
 yellow:mat(0xf4d77d),brick:mat(0xc77f68),stone:mat(0xaaa69a)
};
const unit=new T.BoxGeometry(1,1,1);
function cube(parent,x,y,z,w,h,d,material){const o=new T.Mesh(unit,material);o.position.set(x,y,z);o.scale.set(w,h,d);parent.add(o);return o;}
function slab(x,z,w,d,material,y=-.13,h=.25){return cube(scene,x,y,z,w,h,d,material);}
function roofPanel(g,x,y,z,w,h,d,rot,material){const p=cube(g,x,y,z,w,h,d,material);p.rotation.z=rot;return p;}
slab(0,-5,220,220,M.grass,-.42,.6);
for(let i=-100;i<=100;i+=40){
 slab(i,0,10,220,M.asphalt,-.08,.18);
 slab(i-6.2,0,2.2,220,M.concrete,-.03,.16);
 slab(i+6.2,0,2.2,220,M.concrete,-.03,.16);
 for(let z=-105;z<110;z+=12)cube(scene,i,.025,z, .18,.025,5,M.yellow);
}
for(let z=-100;z<=100;z+=40){
 slab(0,z,220,10,M.asphalt,-.08,.18);
 slab(0,z-6.2,220,2.2,M.concrete,-.03,.16);
 slab(0,z+6.2,220,2.2,M.concrete,-.03,.16);
 for(let x=-105;x<110;x+=12)cube(scene,x,.025,z,5,.025,.18,M.yellow);
}
function path(x,z,w,d){slab(x,z,w,d,M.concrete,-.025,.12);}
// Residential lots with landscaped lawns and paths
const lots=[
{x:-27,z:-27,w:24,d:24},{x:27,z:-27,w:24,d:24},
{x:-27,z:27,w:24,d:24},{x:27,z:27,w:24,d:24},
{x:-67,z:-27,w:24,d:24},{x:67,z:-27,w:24,d:24},
{x:-67,z:27,w:24,d:24},{x:67,z:27,w:24,d:24}
];
for(const l of lots){slab(l.x,l.z,l.w,l.d,M.grass2,-.08,.18);path(l.x,l.z+l.d*.37,3,l.d*.26);}
function windowUnit(g,x,y,z,w=1.7,h=1.5,front=true){
 const dep=.13;
 cube(g,x,y,z,w+.25,h+.25,dep,M.trim);
 cube(g,x,y,z+(front?.09:-.09),w,h,dep*.55,M.glass);
 cube(g,x,y,z+(front?.17:-.17),.09,h,M.trim);
 cube(g,x,y,z+(front?.17:-.17),w,.09,M.trim);
 cube(g,x,y,z+(front?.18:-.18),.07,h,M.trim);
 cube(g,x,y,z+(front?.18:-.18),w,.07,M.trim);
}
function makeHouse(p){
 const g=new T.Group();g.position.set(p.x,0,p.z);scene.add(g);
 const w=p.w||11,d=p.d||9,h=p.h||5.4;
 const wall=mat(p.wall),siding=mat(p.siding||0xf3eee2),roofmat=mat(p.roof||0x4a4c55);
 // foundation, walls, baseboards
 cube(g,0,.25,0,w+.35,.5,d+.35,M.stone);
 cube(g,0,h/2,0,w,h,d,wall);
 cube(g,0,.52,d/2+.025,w,.22,.16,siding);
 // front facade siding strips
 for(let y=1.05;y<h-.25;y+=.48)cube(g,0,y,d/2+.045,w-.12,.035,.055,siding);
 // front door and porch
 cube(g,-w*.2,1.55,d/2+.11,1.45,3.1,.2,M.door);
 cube(g,-w*.2,1.55,d/2+.23,.12,2.75,.035,M.wood);
 cube(g,-w*.2+.49,1.5,d/2+.27,.08,.08,.05,M.yellow);
 cube(g,-w*.2,3.18,d/2+.13,1.6,.16,.3,M.trim);
 // porch steps and posts
 cube(g,-w*.2,.2,d/2+.85,2.6,.25,1.25,M.concrete);
 cube(g,-w*.2-1.15,1.45,d/2+.9,.18,2.9,.18,M.trim);
 cube(g,-w*.2+1.15,1.45,d/2+.9,.18,2.9,.18,M.trim);
 cube(g,-w*.2,2.95,d/2+.9,2.5,.18,.2,M.trim);
 // windows front and sides
 for(const x of [-w*.34,w*.12,w*.36])windowUnit(g,x,3.25,d/2+.09,1.55,1.55,true);
 windowUnit(g,w/2+.08,3.15,-d*.18,1.55,1.55,false);
 windowUnit(g,-w/2-.08,3.15,-d*.18,1.55,1.55,false);
 // window sills
 for(const x of [-w*.34,w*.12,w*.36])cube(g,x,2.38,d/2+.2,1.85,.13,.3,M.trim);
 // gable roof as two sloped thick panels
 const half=Math.sqrt((w/2)*(w/2)+2.7*2.7),angle=Math.atan2(2.7,w/2);
 roofPanel(g,-w/4,h+1.25,0,half,.32,d+1.1,angle,roofmat);
 roofPanel(g,w/4,h+1.25,0,half,.32,d+1.1,-angle,roofmat);
 cube(g,0,h+2.62,0,.35,.35,d+1.15,roofmat);
 // fascia and chimney
 cube(g,-w/2-.12,h+.05,0,.22,.28,d+1.1,siding);
 cube(g,w/2+.12,h+.05,0,.22,.28,d+1.1,siding);
 cube(g,w*.28,h+2.7,-d*.2,.9,2.3,.9,mat(0x9b6252));
 cube(g,w*.28,h+3.9,-d*.2,1.15,.22,1.15,M.trim);
 // front garden flower beds
 cube(g,0,.18,d/2+2.2,w*.72,.32,1.15,mat(0x75533d));
 for(let i=0;i<9;i++){const x=-w*.31+i*w*.078;cube(g,x,.43,d/2+2.2,.22,.22,.22,mat([0xe56e76,0xf2d15c,0xa98bd4][i%3]));}
 // garage attached for selected homes
 if(p.garage){cube(g,w*.52,1.7,-.3,4.4,3.4,d,M.white);cube(g,w*.52,1.5,d/2+.08,3.8,2.8,.16,mat(0xd4d8d7));for(let y=.45;y<2.8;y+=.48)cube(g,w*.52,y,d/2+.18,3.8,.055,.06,M.trim);}
 return g;
}
const homes=[
{x:-27,z:-27,wall:0xe8d9c1,siding:0xf7f1e6,roof:0x514b50,w:11,d:9,h:5.4,garage:true},
{x:27,z:-27,wall:0xd5e1e6,siding:0xffffff,roof:0x47586b,w:11,d:9,h:5.4,garage:true},
{x:-27,z:27,wall:0xd8c1a7,siding:0xf8e8d5,roof:0x674a43,w:11,d:9,h:5.4},
{x:27,z:27,wall:0xd5dfc8,siding:0xf7f6e9,roof:0x4a5148,w:11,d:9,h:5.4},
{x:-67,z:-27,wall:0xe7c9bf,siding:0xffeee8,roof:0x55505c,w:11,d:9,h:5.4},
{x:67,z:-27,wall:0xe6d9a9,siding:0xfff5d8,roof:0x66554a,w:11,d:9,h:5.4},
{x:-67,z:27,wall:0xc8d9e5,siding:0xf2f8fc,roof:0x46586a,w:11,d:9,h:5.4},
{x:67,z:27,wall:0xd8cbb8,siding:0xfaf3e8,roof:0x514c47,w:11,d:9,h:5.4}
];
homes.forEach(makeHouse);
// Shops and civic buildings around central Maplewood
const places=[
{id:"cafe",name:"NORTHSTAR CAFE",x:-18,z:-58,c:0xe58b70,w:12,d:9,h:6},
{id:"jobs",name:"JOB CENTRE",x:18,z:-58,c:0x8eb9d5,w:13,d:10,h:7},
{id:"market",name:"MAPLE MARKET",x:-58,z:18,c:0xe6c56e,w:13,d:10,h:6},
{id:"home-life",name:"YOUR HOME",x:58,z:18,c:0xe2b48b,w:11,d:9,h:5},
{id:"library",name:"PUBLIC LIBRARY",x:58,z:-58,c:0xb5a0d2,w:14,d:11,h:7},
{id:"police",name:"POLICE STATION",x:-58,z:-58,c:0x9cb8d4,w:14,d:11,h:6},
{id:"park",name:"EVERGREEN PARK",x:0,z:65,c:0x79bb69,w:24,d:20,h:1}
];
for(const p of places){
 if(p.id==="home-life"){makeHouse({x:p.x,z:p.z,wall:p.c,siding:0xf9eee1,roof:0x80514b,w:p.w,d:p.d,h:5.4,garage:true});continue;}
 if(p.id==="park"){slab(p.x,p.z,p.w,p.d,mat(0x83c96a),-.02,.2);continue;}
 const g=new T.Group();g.position.set(p.x,0,p.z);scene.add(g);
 const w=p.w,d=p.d,h=p.h;
 cube(g,0,.25,0,w+.5,.5,d+.5,M.stone);cube(g,0,h/2,0,w,h,d,mat(p.c));
 cube(g,0,h+.2,0,w+.8,.4,d+.8,mat(0x554f4d));
 for(let x=-w*.34;x<=w*.34;x+=w*.34)windowUnit(g,x,h*.58,d/2+.08,2,2,true);
 cube(g,0,1.5,d/2+.12,1.7,3,.2,M.door);
 const board=document.createElement("canvas");board.width=512;board.height=128;const ctx=board.getContext("2d");ctx.fillStyle="#fff7e8";ctx.fillRect(0,0,512,128);ctx.fillStyle="#344b58";ctx.font="bold 42px Arial";ctx.textAlign="center";ctx.fillText(p.name,256,80);
 const texture=new T.CanvasTexture(board);const sign=new T.Mesh(new T.PlaneGeometry(w*.82,1.8),new T.MeshBasicMaterial({map:texture}));sign.position.set(0,h*.78,d/2+.19);g.add(sign);
}
// Park paths, benches, flower beds
slab(0,65,2.5,18,M.concrete,-.005,.12);slab(0,65,18,2.5,M.concrete,-.005,.12);
function tree(x,z,scale=1){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 cube(g,0,1.4,0,.65*scale,2.8*scale,.65*scale,M.trunk);
 const leaves=mat(0x4e9849);cube(g,0,3.55*scale,0,3.2*scale,3.2*scale,3.2*scale,leaves);
 cube(g,-.8*scale,3.35*scale,.2*scale,1.65*scale,1.7*scale,1.65*scale,M.leaf2);
 cube(g,.85*scale,3.45*scale,-.15*scale,1.7*scale,1.7*scale,1.7*scale,M.leaf);
}
for(const [x,z,s] of [[-40,-42,1],[40,-42,1],[-40,42,1],[40,42,1],[-78,-42,1],[78,-42,1],[-78,42,1],[78,42,1],[-9,72,.9],[9,72,.9],[-9,58,.9],[9,58,.9],[-48,0,.9],[48,0,.9]])tree(x,z,s);
function streetLamp(x,z){const g=new T.Group();g.position.set(x,0,z);scene.add(g);cube(g,0,2.5,0,.16,5,.16,M.black);cube(g,.55,4.9,0,1.2,.13,.13,M.black);cube(g,1.05,4.72,0,.55,.32,.55,M.yellow);}
for(let z=-90;z<=90;z+=40){streetLamp(-7,z);streetLamp(7,z);}
for(let x=-90;x<=90;x+=40){streetLamp(x,-7);streetLamp(x,7);}
// A few parked cars with visible wheels and windows
function car(x,z,color){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 cube(g,0,.65,0,2.5,1,4.5,mat(color));cube(g,0,1.35,-.25,1.9,.85,2.35,M.glass);
 for(const xx of [-1.15,1.15])for(const zz of [-1.45,1.45]){const wh=new T.Mesh(new T.CylinderGeometry(.38,.38,.22,10),M.black);wh.rotation.z=Math.PI/2;wh.position.set(xx,.4,zz);g.add(wh);}
 cube(g,0,.9,2.27,1.9,.2,.12,M.white);
}
car(-11,-13,0xd65c50);car(11,13,0x4b8fc2);car(-51,11,0xe7bd51);
const player={x:0,z:5,yaw:Math.PI,pitch:0};
const avatar=new T.Group();scene.add(avatar);
const avatarSkin=mat(0xc98c68),avatarShirt=mat(0x35a0d2),avatarPants=mat(0x344c78),avatarHair=mat(0x342a28);
cube(avatar,0,.9,0,.85,1.05,.52,avatarShirt);
cube(avatar,-.25,.28,0,.3,.65,.38,avatarPants);cube(avatar,.25,.28,0,.3,.65,.38,avatarPants);
cube(avatar,-.55,.92,0,.25,.8,.3,avatarShirt);cube(avatar,.55,.92,0,.25,.8,.3,avatarShirt);
cube(avatar,0,1.72,0,.72,.72,.68,avatarSkin);cube(avatar,0,2.1,0,.75,.2,.7,avatarHair);
cube(avatar,-.17,1.78,.35,.08,.08,.035,M.black);cube(avatar,.17,1.78,.35,.08,.08,.035,M.black);
let keys={},walk=0,last=performance.now(),near=null;
function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height;const viewH=38;camera.left=-viewH*aspect/2;camera.right=viewH*aspect/2;camera.top=viewH/2;camera.bottom=-viewH/2;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
function nearest(){let best=null,dist=1e9;for(const p of places){const d=Math.hypot(player.x-p.x,player.z-p.z);if(d<dist){dist=d;best=p;}}return dist<12?best:null;}
function interact(){near=nearest();if(near)document.dispatchEvent(new CustomEvent("maple:interact",{detail:{id:near.id}}));else document.dispatchEvent(new CustomEvent("maple:game-toast",{detail:{message:"Walk closer to a building to interact."}}));}
window.addEventListener("keydown",e=>{if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)){keys[e.code]=true;if(!e.target.closest("input,textarea,select"))e.preventDefault();}if(e.code==="KeyE"&&!e.repeat)interact();if(/^Digit[1-5]$/.test(e.code))document.querySelector('[data-hotbar="'+["phone","eat","coffee","rest","inventory"][Number(e.code.slice(-1))-1]+'"]')?.click();});
window.addEventListener("keyup",e=>keys[e.code]=false);window.addEventListener("blur",()=>keys={});
renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();camera.zoom=T.MathUtils.clamp(camera.zoom+(e.deltaY<0?.12:-.12),.65,2.1);camera.updateProjectionMatrix();},{passive:false});
document.querySelectorAll("[data-move]").forEach(b=>{const k={up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"}[b.dataset.move];b.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true;});["pointerup","pointerleave","pointercancel"].forEach(n=>b.addEventListener(n,()=>keys[k]=false));});
function miniDraw(){if(!mc||!mini)return;const r=mini.getBoundingClientRect();if(!r.width)return;mc.clearRect(0,0,r.width,r.height);mc.fillStyle="#8bc977";mc.fillRect(0,0,r.width,r.height);mc.strokeStyle="#657078";mc.lineWidth=4;for(let n=0;n<5;n++){mc.beginPath();mc.moveTo(n*r.width/4,0);mc.lineTo(n*r.width/4,r.height);mc.moveTo(0,n*r.height/4);mc.lineTo(r.width,n*r.height/4);mc.stroke();}places.forEach(p=>{mc.fillStyle="#e5a46b";mc.fillRect((p.x+110)/220*r.width-3,(p.z+110)/220*r.height-3,6,6);});mc.fillStyle="#fff";mc.beginPath();mc.arc((player.x+110)/220*r.width,(player.z+110)/220*r.height,4,0,7);mc.fill();}
function frame(t){
 requestAnimationFrame(frame);const dt=Math.min(.04,(t-last)/1000);last=t;
 let forward=0,side=0;if(keys.KeyW||keys.ArrowUp)forward+=1;if(keys.KeyS||keys.ArrowDown)forward-=1;if(keys.KeyA||keys.ArrowLeft)side-=1;if(keys.KeyD||keys.ArrowRight)side+=1;
 const len=Math.hypot(forward,side);if(len){forward/=len;side/=len;const speed=keys.ShiftLeft||keys.ShiftRight?8:5.2;player.x+=side*speed*dt;player.z-=forward*speed*dt;player.x=T.MathUtils.clamp(player.x,-103,103);player.z=T.MathUtils.clamp(player.z,-103,103);walk+=dt*speed;player.yaw=Math.atan2(side,forward);}
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;avatar.position.y=Math.abs(Math.sin(walk*1.4))*.035;
 camera.position.set(player.x,58,player.z+29);camera.lookAt(player.x,0,player.z);
 renderer.render(scene,camera);near=nearest();
 const hint=document.getElementById("gameInteract");if(hint){hint.classList.toggle("visible",!!near);hint.innerHTML=near?"Press <b>E</b> to visit "+near.name:"";}
 const loc=document.getElementById("gameLocation");if(loc)loc.textContent="📍 "+(near?near.name:"MAPLEWOOD · CANADA");
 miniDraw();
}
requestAnimationFrame(frame);
})();