(()=>{
"use strict";
const root=document.querySelector("#mapleGame .game-world");
if(!root||!window.THREE)return;
const host=document.getElementById("maple3d");
if(!host)return;
host.innerHTML="";

const T=THREE,scene=new T.Scene();
scene.background=new T.Color(0xc4d7a2);
const camera=new T.PerspectiveCamera(48,1,.1,5000);camera.position.set(0,330,360);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
host.appendChild(renderer.domElement);
const skyLight=new T.HemisphereLight(0xffffff,0x82966b,2.1);scene.add(skyLight);
const sun=new T.DirectionalLight(0xffffff,1.8);sun.position.set(-260,420,180);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.camera.left=-520;sun.shadow.camera.right=520;sun.shadow.camera.top=520;sun.shadow.camera.bottom=-520;sun.shadow.camera.near=1;sun.shadow.camera.far=1200;sun.shadow.bias=-0.00018;scene.add(sun);
const nightFill=new T.AmbientLight(0x536b9a,0);scene.add(nightFill);
const daySky=new T.Color(0xc4d7a2),nightSky=new T.Color(0x101b38),duskSky=new T.Color(0x9b7890);
const daySun=new T.Color(0xffffff),nightSun=new T.Color(0x8296cf);
const clockEl=document.getElementById("gameClock");
const saskatoonFormatter=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Regina",hour:"numeric",minute:"2-digit",hour12:true});
const saskatoonParts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Regina",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",hourCycle:"h23"});
function solarElevation(date){
 const parts=Object.fromEntries(saskatoonParts.formatToParts(date).map(p=>[p.type,Number(p.value)]));
 const dayOfYear=Math.floor((Date.UTC(parts.year,parts.month-1,parts.day)-Date.UTC(parts.year,0,0))/86400000);
 const hour=parts.hour+parts.minute/60+parts.second/3600;
 const gamma=2*Math.PI/365*(dayOfYear-1+(hour-12)/24);
 const eq=229.18*(0.000075+0.001868*Math.cos(gamma)-0.032077*Math.sin(gamma)-0.014615*Math.cos(2*gamma)-0.040849*Math.sin(2*gamma));
 const decl=0.006918-0.399912*Math.cos(gamma)+0.070257*Math.sin(gamma)-0.006758*Math.cos(2*gamma)+0.000907*Math.sin(2*gamma)-0.002697*Math.cos(3*gamma)+0.00148*Math.sin(3*gamma);
 const solarMinutes=hour*60+eq+4*(-106.67)+360;
 const ha=(solarMinutes/4-180)*Math.PI/180,lat=52.1332*Math.PI/180;
 return Math.asin(Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(ha))*180/Math.PI;
}
function updateSaskatoonLighting(){
 const now=new Date(),elevation=solarElevation(now);
 const daylight=T.MathUtils.clamp((elevation+6)/12,0,1);
 const sunLevel=T.MathUtils.clamp((elevation+2)/32,0,1);
 const dusk=T.MathUtils.clamp(1-Math.abs(elevation+1)/7,0,1);
 const night=1-daylight;
 const timeText=saskatoonFormatter.format(now)||now.toLocaleTimeString("en-CA",{timeZone:"America/Regina",hour:"numeric",minute:"2-digit"});
 if(clockEl){clockEl.textContent=(elevation>-6?"☀️ ":"🌙 ")+timeText+" · "+(elevation>0?"DAYTIME":elevation>-6?"TWILIGHT":"NIGHT");clockEl.dataset.phase=elevation>0?"day":elevation>-6?"twilight":"night";}
 scene.background=daySky.clone().lerp(duskSky,dusk*.42).lerp(nightSky,night*.92);
 skyLight.intensity=.28+daylight*1.85;
 skyLight.color.set(0x9eb4d5).lerp(new T.Color(0xffffff),daylight);
 skyLight.groundColor.set(0x17213b).lerp(new T.Color(0x82966b),daylight);
 sun.intensity=.08+sunLevel*1.85;
 sun.color.copy(nightSun).lerp(daySun,sunLevel);
 sun.position.set(-45+Math.cos((elevation+10)*Math.PI/180)*30,Math.max(5,15+elevation*2),35);
 nightFill.intensity=.12+night*.48;
 renderer.toneMappingExposure=.48+daylight*.58;
}
updateSaskatoonLighting();
setInterval(updateSaskatoonLighting,15000);
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
function cube(parent,x,y,z,w,h,d,m){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function slab(x,z,w,d,m,y=-.25,h=.5){return cube(scene,x,y,z,w,h,d,m);}
// Saskatoon-scale playable footprint: approximately 18 km x 13 km.
// At 10 metres per world unit, the footprint represents about 234 km².
const WORLD_W=1800,WORLD_D=1300,UNIT_METRES=10;
const terrain=slab(0,0,WORLD_W,WORLD_D,M.land,-.6,1);terrain.receiveShadow=true;
const localRoad=mat(0x657078),arterialRoad=mat(0x505b63),curb=mat(0xd4d0c2);
// A dense 200-metre street grid with wider arterial roads every kilometre.
for(let x=-880;x<=880;x+=20){
 const major=Math.abs(x%200)<.01;
 slab(x,0,major?3.2:1.35,WORLD_D-20,major?arterialRoad:localRoad,-.08,.18);
 if(major){slab(x-2.2,0,.45,WORLD_D-20,curb,.015,.1);slab(x+2.2,0,.45,WORLD_D-20,curb,.015,.1);}
}
for(let z=-630;z<=630;z+=20){
 const major=Math.abs(z%200)<.01;
 slab(0,z,WORLD_W-20,major?3.2:1.35,major?arterialRoad:localRoad,-.08,.18);
 if(major){slab(0,z-2.2,WORLD_W-20,.45,curb,.015,.1);slab(0,z+2.2,WORLD_W-20,.45,curb,.015,.1);}
}
// South Saskatchewan River and its riverbank paths.
slab(0,0,WORLD_W,25,M.water,-.04,.24);
slab(0,-13.2,WORLD_W,.65,M.waterLight,.03,.08);
slab(0,13.2,WORLD_W,.65,M.waterLight,.03,.08);
slab(0,-17,WORLD_W,3.5,M.path,.05,.15);
slab(0,17,WORLD_W,3.5,M.path,.05,.15);
for(const x of [-200,0,200]){
 slab(x,0,9,34,M.bridge,.18,.5);
 for(let z=-13;z<=13;z+=6)cube(scene,x,.48,z,9.4,.12,.45,M.white);
}
function park(x,z,w,d){
 slab(x,z,w,d,M.grass2,-.02,.22);
 slab(x,z,w*.7,.8,M.path,.14,.12);
 slab(x,z,w*.8,.8,M.path,.14,.12).rotation.y=Math.PI/2;
}
park(-350,220,85,75);park(370,180,95,82);park(190,-300,90,78);
park(-360,-280,90,82);park(60,280,80,65);park(-170,300,75,70);
park(610,420,110,95);park(-650,-420,115,90);
// Building and rooftop silhouettes
function building(x,z,w,d,h,color,roofColor=0x59616b,style="block"){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 const wallMat=mat(color),roofMat=mat(roofColor),windowMat=new T.MeshStandardMaterial({color:0x9bc6d0,roughness:.28,metalness:.12});
 cube(g,0,h/2,0,w,h,d,wallMat);
 cube(g,0,h+.18,0,w+1.4,.38,d+1.4,roofMat);
 if(style==="tower"||h>14){cube(g,0,h+.95,0,w*.48,1.5,d*.48,wallMat);cube(g,0,h+1.78,0,w*.52,.22,d*.52,roofMat);}
 else if(style==="heritage"||style!=="modern"){
  const roof=new T.Mesh(new T.ConeGeometry(Math.max(w,d)*.68,Math.max(2.4,h*.2),4),roofMat);roof.position.set(0,h+1,0);roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
 }
 const rows=Math.max(1,Math.floor(h/3.8)),cols=Math.max(2,Math.floor(w/3.6));
 for(let row=0;row<rows;row++){
  const yy=2+row*(h-2.8)/rows;
  for(let col=0;col<cols;col++){
   const xx=-w/2+(col+.5)*w/cols;
   cube(g,xx,yy,d/2+.025,Math.min(1.45,w/cols*.52),Math.min(1.65,h/rows*.55),.07,windowMat);
   cube(g,xx,yy,-d/2-.025,Math.min(1.45,w/cols*.52),Math.min(1.65,h/rows*.55),.07,windowMat);
  }
  const sideCols=Math.max(2,Math.floor(d/3.8));
  for(let col=0;col<sideCols;col++){
   const zz=-d/2+(col+.5)*d/sideCols;
   cube(g,w/2+.025,yy,zz,.07,Math.min(1.65,h/rows*.55),Math.min(1.45,d/sideCols*.52),windowMat);
   cube(g,-w/2-.025,yy,zz,.07,Math.min(1.65,h/rows*.55),Math.min(1.45,d/sideCols*.52),windowMat);
  }
 }
 cube(g,0,1.3,d/2+.08,Math.min(2.4,w*.18),2.6,.16,mat(0x475a52));
 cube(g,0,2.8,d/2+.45,Math.min(4,w*.36),.35,1,roofMat);
 return g;
}
function trees(x,z,count=4,spread=10){
 for(let i=0;i<count;i++){
  const px=x+(i%2?1:-1)*(spread*.3)+(i%3-1)*spread*.12;
  const pz=z+(i%2?-.5:.5)*spread*.35;
  const g=new T.Group();g.position.set(px,0,pz);scene.add(g);
  cube(g,0,.28,0,.18,.56,.18,M.trunk);
  const crown=cube(g,0,.72,0,.65,.65,.65,i%2?M.tree:M.tree2);
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
for(const p of places){p.x*=4;p.z*=4;}
places.push(
 {id:"stonebridge",name:"Stonebridge",short:"Stonebridge",x:330,z:-430,emoji:"🏘",type:"neighbourhood"},
 {id:"evergreen",name:"Evergreen",short:"Evergreen",x:650,z:480,emoji:"🌲",type:"neighbourhood"},
 {id:"lawson",name:"Lawson Heights",short:"Lawson Heights",x:-650,z:430,emoji:"🏡",type:"neighbourhood"},
 {id:"sutherland",name:"Sutherland",short:"Sutherland",x:570,z:80,emoji:"🏘",type:"neighbourhood"},
 {id:"nutana",name:"Nutana",short:"Nutana",x:270,z:-150,emoji:"🏡",type:"neighbourhood"},
 {id:"caswell",name:"Caswell Hill",short:"Caswell Hill",x:-270,z:160,emoji:"🏘",type:"neighbourhood"},
 {id:"brighton",name:"Brighton",short:"Brighton",x:780,z:-300,emoji:"🏡",type:"neighbourhood"},
 {id:"hampton",name:"Hampton Village",short:"Hampton Village",x:-760,z:-230,emoji:"🏘",type:"neighbourhood"}
);
// Distinctive landmark silhouettes inspired by Saskatoon's real buildings.
function landmarkDetails(p){
 const x=p.x,z=p.z;
 if(p.id==="bessborough"){
  building(x,z,18,15,16,0xd8c7a7,0x526c58,"heritage");
  cube(scene,x,17.2,z,5,3,5,mat(0x53634f));
  for(const [dx,dz] of [[-7,-5],[7,-5],[-7,5],[7,5]]){
   cube(scene,x+dx,8,z+dz,3.2,16,3.2,mat(0xd9c8a8));
   const roof=new T.Mesh(new T.ConeGeometry(2.6,5,4),mat(0x425a4b));roof.position.set(x+dx,18.5,z+dz);scene.add(roof);
  }
  for(let i=-2;i<=2;i++)cube(scene,x+i*3,11,z+7.65,1.2,5,.25,M.glass);
  return;
 }
 if(p.id==="remai"){
  const copper=mat(0x9a6245),copper2=mat(0xb87950);
  cube(scene,x,3.2,z,25,6,18,copper);cube(scene,x+2,7.2,z-1,20,2,15,copper2);
  cube(scene,x-2,9,z+1,15,2,12,copper);cube(scene,x,1.5,z+9.2,22,2.8,.35,M.glass);
  cube(scene,x+12,4,z,1,8,17,M.glass);return;
 }
 if(p.id==="midtown"){
  building(x,z,30,24,8,0xe1e0d8,0x777b7b,"modern");
  cube(scene,x,9,z,12,3,10,M.glass);
  for(let i=-2;i<=2;i++)cube(scene,x+i*5,3,z+12.2,3,3,.25,M.glass);
  return;
 }
 if(p.id==="ru hospital"){
  building(x,z,17,15,20,0xe8e8e1,0x657782,"tower");
  building(x-10,z+9,10,10,10,0xd9e0df,0x647985,"modern");
  cube(scene,x,22,z+7.8,4,2,.4,mat(0xb64c4c));cube(scene,x,22,z+7.8,.8,4,.45,M.white);return;
 }
 if(p.id==="university"){
  building(x,z,20,15,8,0xc9c1ae,0x555b58,"heritage");
  cube(scene,x,13,z,6,10,6,mat(0x777568));
  const roof=new T.Mesh(new T.ConeGeometry(4.2,5,4),mat(0x46534c));roof.position.set(x,20,z);scene.add(roof);
  for(let i=-3;i<=3;i++)cube(scene,x+i*2.5,5,z+7.7,1.1,4,.25,M.glass);return;
 }
 if(p.id==="diefenbaker"){
  building(x,z,17,13,7,0xd8d2c2,0x66665f,"heritage");
  for(let i=-3;i<=3;i++)cube(scene,x+i*2.2,4,z+6.7,.8,4,.2,M.glass);
  cube(scene,x,8,z,6,1.2,5,mat(0x7b786c));return;
 }
 if(p.id==="farmers"){
  building(x,z,21,16,5,0xd8d0b9,0x9a6749,"market");
  const canopy=new T.Mesh(new T.ConeGeometry(12,4,4),mat(0x9b6849));canopy.rotation.y=Math.PI/4;canopy.position.set(x,8,z);scene.add(canopy);
  for(let i=-3;i<=3;i++)cube(scene,x+i*2.5,2.7,z+8.2,1.2,4,.2,M.glass);return;
 }
 if(p.id==="westernmuseum"){
  building(x,z,22,14,6,0xb99b75,0x5c5146,"heritage");cube(scene,x,7,z,7,3,15,mat(0x725d49));return;
 }
 if(p.type==="neighbourhood"){
  const palette=[0xd9c5a7,0xc8d2c4,0xd9b7a5,0xc4cbd3,0xe3d8c2];
  for(let i=0;i<5;i++)building(x+(i-2)*13,z+(i%2)*12,7+(i%3),6+(i%2),4+(i%3),palette[i],0x665c53,i%2?"heritage":"block");
  return;
 }
 if(p.type==="park"){trees(x,z,7,18);return;}
 if(p.type==="museum"){building(x,z,17,13,7,0xe5e2d8,0x515960,"modern");cube(scene,x,8,z,8,1.5,4,M.glass);return;}
 if(p.type==="district"){
  const colours=[0xd9b99a,0xc98f78,0xe2cda8,0xc4d1c4,0xd8b9a7];
  for(let i=0;i<7;i++)building(x+(i-3)*8,z+(i%2)*9,6,6,4+i%3,colours[i%5],0x665d55,i%2?"heritage":"block");
  return;
 }
 if(p.type==="hotel"){building(x,z,14,12,13,0xd9c8aa,0x536a58,"heritage");return;}
 if(p.type==="shopping"){building(x,z,23,17,7,0xe3e0d7,0x77736a,"modern");return;}
 building(x,z,12,10,6,0xd8d1c2,0x65666a,"block");
}
for(const p of places){
 landmarkDetails(p);
 if(p.type!=="park"&&p.type!=="neighbourhood")trees(p.x-22,p.z+20,3,8);
 label(p.short,p.x,p.z-24,p.emoji);
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
const player={x:0,z:-112,yaw:0};const avatar=new T.Group();scene.add(avatar);
cube(avatar,0,1,0,1,1.2,.65,mat(0x368dc4));
cube(avatar,0,1.95,0,.78,.75,.7,mat(0xc9906d));
cube(avatar,0,2.35,0,.8,.2,.72,mat(0x302b29));
cube(avatar,-.27,.3,0,.34,.65,.42,mat(0x35415d));cube(avatar,.27,.3,0,.34,.65,.42,mat(0x35415d));
const locationById=Object.fromEntries(places.map(p=>[p.id,p]));
const placeLabels=[],placeHitAreas=[];
for(const p of places){
 const labelSprite=scene.children.find(o=>o.isSprite && o.position.x===p.x && (o.position.z===p.z-9||o.position.z===p.z-8));
 if(labelSprite){labelSprite.material.opacity=0;labelSprite.material.transparent=true;labelSprite.scale.set(0,0,1);placeLabels.push({place:p,sprite:labelSprite,active:false});}
 const hit=new T.Mesh(new T.PlaneGeometry(48,42),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
 hit.rotation.x=-Math.PI/2;hit.position.set(p.x,.18,p.z);hit.userData.placeId=p.id;scene.add(hit);placeHitAreas.push(hit);
}
const hoverRaycaster=new T.Raycaster(),pointerNdc=new T.Vector2();
let hoveredPlace=null,pointerX=0,pointerY=0,viewOffsetX=0,viewOffsetZ=0,cameraAngle=0;
const canvas=renderer.domElement;
canvas.style.cursor="crosshair";
// Track the pointer at window level so looking continues when it reaches the edge
// of the 3D canvas. Clamp to the canvas bounds instead of resetting on pointerleave.
window.addEventListener("pointermove",e=>{
 const rect=canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 pointerX=T.MathUtils.clamp(((e.clientX-rect.left)/rect.width-.5)*2,-1,1);
 pointerY=T.MathUtils.clamp(((e.clientY-rect.top)/rect.height-.5)*2,-1,1);
 const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
 if(inside){
  pointerNdc.set(pointerX,-pointerY);
  hoverRaycaster.setFromCamera(pointerNdc,camera);
  const hit=hoverRaycaster.intersectObjects(placeHitAreas,false)[0];
  hoveredPlace=hit?places.find(p=>p.id===hit.object.userData.placeId)||null:null;
  canvas.style.cursor=hoveredPlace?"pointer":"crosshair";
 }else{
  hoveredPlace=null;
 }
});
window.addEventListener("blur",()=>{
 pointerX=0;pointerY=0;hoveredPlace=null;canvas.style.cursor="crosshair";
});

function resize(){
 const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
 renderer.setSize(r.width,r.height,false);
 camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);resize();
function nearest(){
 let best=null,d=1e9;
 for(const p of places){const n=Math.hypot(player.x-p.x,player.z-p.z);if(n<d){d=n;best=p;}}
 return d<5?best:null;
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
 if(len){dx/=len;dz/=len;const speed=keys.ShiftLeft||keys.ShiftRight?.55:.22;
 player.x=T.MathUtils.clamp(player.x+dx*speed*dt,-880,880);
 player.z=T.MathUtils.clamp(player.z+dz*speed*dt,-630,630);walk+=dt*speed;
 player.yaw=Math.atan2(dx,dz);
 }
 avatar.position.set(player.x,0,player.z);avatar.rotation.y=player.yaw;
 avatar.position.y=Math.abs(Math.sin(walk*1.6))*.06;
 const lookAheadX=pointerX*125,lookAheadZ=pointerY*95;
 viewOffsetX+=(lookAheadX-viewOffsetX)*Math.min(1,dt*3.2);
 viewOffsetZ+=(lookAheadZ-viewOffsetZ)*Math.min(1,dt*3.2);
 const targetX=player.x+viewOffsetX,targetZ=player.z+viewOffsetZ;
 camera.position.set(targetX+Math.sin(cameraAngle)*245,285,targetZ+Math.cos(cameraAngle)*285);
 camera.lookAt(targetX,3,targetZ);
 for(const item of placeLabels){
  const active=!!hoveredPlace&&hoveredPlace.id===item.place.id;
  if(active!==item.active)item.active=active;
  const target=active?1:0;
  const current=item.sprite.material.opacity;
  item.sprite.material.opacity+= (target-current)*Math.min(1,dt*12);
  const scale=31*item.sprite.material.opacity;
  item.sprite.scale.set(scale,9.5*item.sprite.material.opacity,1);
  if(active){item.sprite.position.y=32+Math.sin(t*.006)*1.2;}
  else item.sprite.position.y=29;
 }
 renderer.render(scene,camera);
 const near=nearest(),hint=document.getElementById("gameInteract");
 if(hint){hint.classList.toggle("visible",!!near);hint.innerHTML=near?"Press <b>E</b> to explore "+near.name:"";}
 const loc=document.getElementById("gameLocation");
 if(loc)loc.textContent="📍 "+(near?near.name:"SASKATOON · SASKATCHEWAN")+"  ·  CITY MAP ~18 × 13 KM";

}
requestAnimationFrame(frame);
})();