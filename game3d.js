(()=>{
"use strict";
const root=document.querySelector("#mapleGame .game-world");
if(!root||!window.THREE)return;
const host=document.getElementById("maple3d");
if(!host)return;
host.innerHTML="";

const T=THREE,scene=new T.Scene();
scene.background=new T.Color(0xc4d7a2);
const camera=new T.OrthographicCamera(-70,70,48,-48,.1,400);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
renderer.shadowMap.enabled=false;
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
host.appendChild(renderer.domElement);
scene.add(new T.HemisphereLight(0xffffff,0x82966b,2.1));
const sun=new T.DirectionalLight(0xffffff,1.8);sun.position.set(-45,100,35);scene.add(sun);
const mat=c=>new T.MeshLambertMaterial({color:c});
const M={
land:mat(0xb9d99a),grass:mat(0x8fc879),grass2:mat(0xa8d58b),road:mat(0x59636a),
roadEdge:mat(0xe5dfc9),water:mat(0x258fca),waterLight:mat(0x72d0e5),
path:mat(0xe8dfc8),roof:mat(0x46515b),roof2:mat(0x786b61),
wall:mat(0xe6dfc9),white:mat(0xf4efdf),glass:mat(0x8bb9c4),
brick:mat(0xb66e50),dark:mat(0x343c40),tree:mat(0x368b58),
tree2:mat(0x68a66d),trunk:mat(0x82664a),sign:mat(0x18252b),
bridge:mat(0xb9b7a8),parking:mat(0x9da39b)
};
const unit=new T.BoxGeometry(1,1,1);
function cube(parent,x,y,z,w,h,d,m){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);parent.add(o);return o;}
function slab(x,z,w,d,m,y=-.25,h=.5){return cube(scene,x,y,z,w,h,d,m);}
slab(0,0,260,190,M.land,-.6,1);
// Neighbourhood grass blocks and road grid, in a rotated schematic city map
const roadX=[-100,-68,-36,0,36,68,100],roadZ=[-72,-42,-12,18,48,78];
for(const x of roadX){slab(x,0,7,185,M.road,-.08,.18);slab(x-4.1,0,1.1,185,M.roadEdge,-.03,.12);slab(x+4.1,0,1.1,185,M.roadEdge,-.03,.12);}
for(const z of roadZ){slab(0,z,255,7,M.road,-.08,.18);slab(0,z-4.1,255,1.1,M.roadEdge,-.03,.12);slab(0,z+4.1,255,1.1,M.roadEdge,-.03,.12);}
// Painted lane dividers, pedestrian crossings and sidewalks
const lanePaint=mat(0xf5e9b9),crossPaint=mat(0xf7f4e8),sidewalk=mat(0xc9c5b3);
for(const x of roadX){for(let z=-82;z<=82;z+=12)slab(x,z,.22,5.2,lanePaint,.045,.035);slab(x-5.2,0,1.1,185,sidewalk,.02,.12);slab(x+5.2,0,1.1,185,sidewalk,.02,.12);}
for(const z of roadZ){for(let x=-118;x<=118;x+=12)slab(x,z,5.2,.22,lanePaint,.045,.035);slab(0,z-5.2,255,1.1,sidewalk,.02,.12);slab(0,z+5.2,255,1.1,sidewalk,.02,.12);}
function crosswalk(x,z,vertical){for(let i=-3;i<=3;i++)slab(x+(vertical?i*1.05:0),z+(vertical?0:i*1.05),vertical?.62:7,vertical?7:.62,crossPaint,.06,.045);}
for(const x of [-68,-36,0,36,68])for(const z of [-42,-12,18,48])crosswalk(x,z,true);
for(const z of [-42,-12,18,48])for(const x of [-68,-36,0,36,68])crosswalk(x,z,false);
// South Saskatchewan River runs through the centre of the map
slab(0,0,260,25,M.water,-.05,.22);
slab(0,-13.2,260,.65,M.waterLight,.03,.08);
slab(0,13.2,260,.65,M.waterLight,.03,.08);
// Riverbank walkways and green edges
slab(0,-16.2,260,3.5,M.path,.05,.15);
slab(0,16.2,260,3.5,M.path,.05,.15);
// Three bridges across the river
for(const x of [-78,0,78]){
 slab(x,0,8,33,M.bridge,.18,.5);
 for(let z=-13;z<=13;z+=6)cube(scene,x,.48,z,8.4,.12,.45,M.white);
}
// Parks and green spaces
function park(x,z,w,d){
 slab(x,z,w,d,M.grass2,-.02,.22);
 slab(x,z,w*.7,.8,M.path,.14,.12);
 slab(x,z,w*.8,.8,M.path,.14,.12).rotation.y=Math.PI/2;
}
park(-92,49,25,23);park(93,45,28,26);park(48,-49,27,24);park(-91,-47,28,25);
park(12,49,28,22);park(-42,48,22,22);
// Building and rooftop silhouettes
function building(x,z,w,d,h,color,roofColor=0x59616b,style="block"){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 cube(g,0,h/2,0,w,h,d,mat(color));
 cube(g,0,h+.18,0,w+.7,.35,d+.7,mat(roofColor));
 if(style==="tower"){
   cube(g,0,h+.85,0,w*.58,1.2,d*.58,mat(color));
   cube(g,0,h+1.5,0,w*.22,.22,d*.22,mat(roofColor));
 }
 if(style==="heritage"){
   cube(g,0,h+.45,0,w*.28,.65,d*.28,mat(roofColor));
   cube(g,-w*.28,h*.55,d/2+.08,w*.23,h*.55,.12,M.glass);
   cube(g,w*.28,h*.55,d/2+.08,w*.23,h*.55,.12,M.glass);
 }
 for(let xx=-w*.32;xx<=w*.32;xx+=w*.32){
   cube(g,xx,h*.55,d/2+.08,Math.max(.8,w*.19),Math.max(1,h*.28),.13,M.glass);
 }
 return g;
}
function trees(x,z,count=4,spread=10){
 for(let i=0;i<count;i++){
  const px=x+(i%2?1:-1)*(spread*.3)+(i%3-1)*spread*.12;
  const pz=z+(i%2?-.5:.5)*spread*.35;
  const g=new T.Group();g.position.set(px,0,pz);scene.add(g);
  cube(g,0,1.1,0,.55,2.2,.55,M.trunk);
  const crown=cube(g,0,2.8,0,2.5,2.5,2.5,i%2?M.tree:M.tree2);
  crown.rotation.y=.25;
 }
}
function label(text,x,z,emoji=""){
 const c=document.createElement("canvas");c.width=512;c.height=128;
 const ctx=c.getContext("2d");ctx.clearRect(0,0,512,128);
 const title=emoji?emoji+"  "+text:text;
 ctx.font="bold 35px Arial";const width=Math.min(490,Math.max(180,ctx.measureText(title).width+54));
 const left=(512-width)/2;ctx.fillStyle="#17242b";ctx.beginPath();ctx.roundRect(left,23,width,82,38);ctx.fill();
 ctx.strokeStyle="#4e5b5d";ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(title,256,65,width-30);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
 sprite.position.set(x,7,z);sprite.scale.set(17,4.25,1);sprite.renderOrder=20;scene.add(sprite);
 return sprite;
}
const places=[
{id:"university",name:"University of Saskatchewan",short:"U of S",x:42,z:67,emoji:"🏛",type:"campus"},
{id:"ru hospital",name:"Royal University Hospital",short:"Royal University Hospital",x:68,z:69,emoji:"✚",type:"hospital"},
{id:"diefenbaker",name:"Diefenbaker Canada Centre",short:"Diefenbaker Centre",x:14,z:67,emoji:"🏛",type:"museum"},
{id:"kinsmen",name:"Kinsmen Park",short:"Kinsmen Park",x:-8,z:46,emoji:"🌳",type:"park"},
{id:"playland",name:"Nutrien Playland",short:"Nutrien Playland",x:-22,z:48,emoji:"🎡",type:"park"},
{id:"bessborough",name:"Delta Bessborough",short:"Delta Bessborough",x:-7,z:19,emoji:"🏨",type:"hotel"},
{id:"kiwanis",name:"Kiwanis Memorial Park",short:"Kiwanis Park",x:-30,z:18,emoji:"🌳",type:"park"},
{id:"riverlanding",name:"River Landing",short:"River Landing",x:17,z:-20,emoji:"📍",type:"attraction"},
{id:"remai",name:"Remai Modern",short:"Remai Modern",x:35,z:-25,emoji:"🎨",type:"museum"},
{id:"midtown",name:"Midtown Plaza",short:"Midtown Plaza",x:5,z:-48,emoji:"🛍",type:"shopping"},
{id:"farmers",name:"Saskatoon Farmers' Market",short:"Farmers' Market",x:-30,z:-48,emoji:"🥕",type:"market"},
{id:"broadway",name:"Broadway District",short:"Broadway",x:85,z:-42,emoji:"🎭",type:"district"},
{id:"victoria",name:"Victoria Park",short:"Victoria Park",x:-85,z:-47,emoji:"🌳",type:"park"},
{id:"riversdale",name:"Riversdale",short:"Riversdale",x:-62,z:-18,emoji:"🏘",type:"district"},
{id:"westernmuseum",name:"Western Development Museum",short:"Western Development Museum",x:-98,z:-77,emoji:"🚂",type:"museum"},
{id:"forestry",name:"Forestry Farm Park & Zoo",short:"Forestry Farm Zoo",x:100,z:80,emoji:"🦉",type:"park"},
{id:"wanuskewin",name:"Wanuskewin Heritage Park",short:"Wanuskewin",x:-108,z:80,emoji:"🦬",type:"heritage"}
];
// Build location-specific miniature models and labels
for(const p of places){
 if(p.type==="park"){trees(p.x,p.z,5,10);label(p.short,p.x,p.z-8,p.emoji);continue;}
 if(p.type==="campus"){
  building(p.x,p.z,17,12,8,0xd6d0bd,0x625c55,"heritage");
  building(p.x-10,p.z-8,8,7,5,0xc7c1ad,0x5b5550);
  building(p.x+11,p.z+7,9,8,6,0xd7d1c0,0x5a554e);
 }else if(p.type==="hospital"){
  building(p.x,p.z,13,12,11,0xe4e3dc,0x5b6870,"tower");
  cube(scene,p.x,p.z+6.1,p.z,0.1,.1,.1,M.white);
 }else if(p.type==="hotel"){
  building(p.x,p.z,13,10,14,0xe0d3b7,0x496b59,"heritage");
 }else if(p.type==="museum"){
  building(p.x,p.z,14,11,7,0xe8e5dc,0x474d55,"modern");
  cube(scene,p.x,p.z+4,p.z,5,1,2,M.white);
 }else if(p.type==="shopping"||p.type==="market"){
  building(p.x,p.z,19,14,6,0xe2e0d8,0x77736a,p.type==="shopping"?"modern":"block");
 }else if(p.type==="district"){
  for(let i=0;i<5;i++)building(p.x+(i-2)*6,p.z+(i%2)*6,5,5,4+i%2,[0xd9b99a,0xc98f78,0xe2cda8,0xc4d1c4,0xd8b9a7][i],0x6c6259,"heritage");
 }else{
  building(p.x,p.z,12,10,6,0xd8d1c2,0x65666a);
 }
 if(p.type!=="park")trees(p.x-8,p.z+7,2,4);
 label(p.short,p.x,p.z-9,p.emoji);
}
// Local street boards along main roads
function roadSign(x,z,txt){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 cube(g,0,1.1,0,.25,2.2,.25,M.dark);
 cube(g,0,2.2,0,6.8,1.35,.22,M.sign);
 const c=document.createElement("canvas");c.width=512;c.height=128;const ctx=c.getContext("2d");
 ctx.fillStyle="#eaf0d9";ctx.fillRect(0,0,512,128);ctx.fillStyle="#263a35";ctx.font="bold 48px Arial";ctx.textAlign="center";ctx.fillText(txt,256,82);
 const tex=new T.CanvasTexture(c);const face=new T.Mesh(new T.PlaneGeometry(6.4,1.25),new T.MeshBasicMaterial({map:tex}));face.position.set(0,2.2,.13);g.add(face);
}
roadSign(-46,-34,"DOWNTOWN");roadSign(56,-34,"BROADWAY");roadSign(-49,35,"UNIVERSITY");
trees(-50,64,7,14);trees(54,46,7,14);trees(-92,8,7,12);trees(94,-8,7,12);
// Player marker with simple blocky avatar
const player={x:0,z:-28,yaw:0};const avatar=new T.Group();scene.add(avatar);
cube(avatar,0,1,0,1,1.2,.65,mat(0x368dc4));
cube(avatar,0,1.95,0,.78,.75,.7,mat(0xc9906d));
cube(avatar,0,2.35,0,.8,.2,.72,mat(0x302b29));
cube(avatar,-.27,.3,0,.34,.65,.42,mat(0x35415d));cube(avatar,.27,.3,0,.34,.65,.42,mat(0x35415d));
const locationById=Object.fromEntries(places.map(p=>[p.id,p]));
const placeLabels=[],placeHitAreas=[];
for(const p of places){
 const labelSprite=scene.children.find(o=>o.isSprite && o.position.x===p.x && o.position.z===p.z-9);
 if(labelSprite){labelSprite.material.opacity=0;labelSprite.material.transparent=true;labelSprite.scale.set(0,0,1);placeLabels.push({place:p,sprite:labelSprite,active:false});}
 const hit=new T.Mesh(new T.PlaneGeometry(22,20),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
 hit.rotation.x=-Math.PI/2;hit.position.set(p.x,.18,p.z);hit.userData.placeId=p.id;scene.add(hit);placeHitAreas.push(hit);
}
const hoverRaycaster=new T.Raycaster(),pointerNdc=new T.Vector2();
let hoveredPlace=null,dragging=false,dragMoved=false,lastPointerX=0,lastPointerY=0,viewOffsetX=0,viewOffsetZ=0,cameraAngle=0;
const canvas=renderer.domElement;
canvas.style.cursor="grab";
canvas.addEventListener("pointerdown",e=>{
 if(e.button!==0)return;
 dragging=true;dragMoved=false;lastPointerX=e.clientX;lastPointerY=e.clientY;
 canvas.setPointerCapture(e.pointerId);canvas.style.cursor="grabbing";
});
canvas.addEventListener("pointermove",e=>{
 const rect=canvas.getBoundingClientRect();
 pointerNdc.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 if(dragging){
  const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;
  if(Math.abs(dx)+Math.abs(dy)>2)dragMoved=true;
  const scale=104/Math.max(1,rect.height)/Math.max(.65,camera.zoom);
  viewOffsetX-=dx*scale;viewOffsetZ+=dy*scale;
  lastPointerX=e.clientX;lastPointerY=e.clientY;
  hoveredPlace=null;canvas.style.cursor="grabbing";
 }else{
  hoverRaycaster.setFromCamera(pointerNdc,camera);
  const hit=hoverRaycaster.intersectObjects(placeHitAreas,false)[0];
  hoveredPlace=hit?places.find(p=>p.id===hit.object.userData.placeId)||null:null;
  canvas.style.cursor=hoveredPlace?"pointer":"grab";
 }
});
function stopDrag(e){if(!dragging)return;dragging=false;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor=hoveredPlace?"pointer":"grab";}
canvas.addEventListener("pointerup",stopDrag);
canvas.addEventListener("pointercancel",stopDrag);
canvas.addEventListener("pointerleave",e=>{if(!dragging)hoveredPlace=null;});

function resize(){
 const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
 renderer.setSize(r.width,r.height,false);
 const aspect=r.width/r.height,viewH=104;
 camera.left=-viewH*aspect/2;camera.right=viewH*aspect/2;
 camera.top=viewH/2;camera.bottom=-viewH/2;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);resize();
function nearest(){
 let best=null,d=1e9;
 for(const p of places){const n=Math.hypot(player.x-p.x,player.z-p.z);if(n<d){d=n;best=p;}}
 return d<15?best:null;
}
function interact(){
 const p=nearest();
 if(p)document.dispatchEvent(new CustomEvent("maple:interact",{detail:{id:p.id}}));
 else document.dispatchEvent(new CustomEvent("maple:game-toast",{detail:{message:"Explore the map and walk closer to a landmark."}}));
}
let keys={},walk=0,last=performance.now();
window.addEventListener("keydown",e=>{
 if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)){
  keys[e.code]=true;if(!e.target.closest("input,textarea,select"))e.preventDefault();
 }
 if(e.code==="KeyE"&&!e.repeat)interact();
 if(/^Digit[1-5]$/.test(e.code))document.querySelector('[data-hotbar="'+["phone","eat","coffee","rest","inventory"][Number(e.code.slice(-1))-1]+'"]')?.click();
});
window.addEventListener("keyup",e=>keys[e.code]=false);window.addEventListener("blur",()=>keys={});
renderer.domElement.addEventListener("wheel",e=>{
 e.preventDefault();camera.zoom=T.MathUtils.clamp(camera.zoom+(e.deltaY<0?.12:-.12),.65,2.3);camera.updateProjectionMatrix();
},{passive:false});
document.querySelectorAll("[data-move]").forEach(b=>{
 const k={up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"}[b.dataset.move];
 b.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true;});
 ["pointerup","pointerleave","pointercancel"].forEach(n=>b.addEventListener(n,()=>keys[k]=false));
});

function frame(t){
 requestAnimationFrame(frame);const dt=Math.min(.04,(t-last)/1000);last=t;
 let dx=0,dz=0;if(keys.KeyW||keys.ArrowUp)dz-=1;if(keys.KeyS||keys.ArrowDown)dz+=1;
 if(keys.KeyA||keys.ArrowLeft)dx-=1;if(keys.KeyD||keys.ArrowRight)dx+=1;
 const len=Math.hypot(dx,dz);
 if(len){dx/=len;dz/=len;const speed=keys.ShiftLeft||keys.ShiftRight?12:7;
 player.x=T.MathUtils.clamp(player.x+dx*speed*dt,-124,124);
 player.z=T.MathUtils.clamp(player.z+dz*speed*dt,-88,88);walk+=dt*speed;
 player.yaw=Math.atan2(dx,dz);
 }
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;
 avatar.position.y=Math.abs(Math.sin(walk*1.6))*.06;
 const targetX=player.x+viewOffsetX,targetZ=player.z+viewOffsetZ;
 camera.position.set(targetX+Math.sin(cameraAngle)*38,100,targetZ+Math.cos(cameraAngle)*38);
 camera.lookAt(targetX,0,targetZ);
 for(const item of placeLabels){
  const active=!!hoveredPlace&&hoveredPlace.id===item.place.id;
  if(active!==item.active)item.active=active;
  const target=active?1:0;
  const current=item.sprite.material.opacity;
  item.sprite.material.opacity+= (target-current)*Math.min(1,dt*12);
  const scale=17*item.sprite.material.opacity;
  item.sprite.scale.set(scale,4.25*item.sprite.material.opacity,1);
  if(active){item.sprite.position.y=7.2+Math.sin(t*.006)*.42;}
  else item.sprite.position.y=7;
 }
 renderer.render(scene,camera);
 const near=nearest(),hint=document.getElementById("gameInteract");
 if(hint){hint.classList.toggle("visible",!!near);hint.innerHTML=near?"Press <b>E</b> to explore "+near.name:"";}
 const loc=document.getElementById("gameLocation");
 if(loc)loc.textContent="📍 "+(near?near.name:"SASKATOON · SASKATCHEWAN");

}
requestAnimationFrame(frame);
})();