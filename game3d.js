(()=>{"use strict";
const root=document.querySelector("#mapleGame .game-world");if(!root||!window.THREE)return;
const host=document.createElement("div");host.id="maple3d";host.setAttribute("aria-label","Maple Life 3D city");const old=document.getElementById("mapleCityCanvas");old.replaceWith(host);
const mini=document.getElementById("mapleMiniMap"),mc=mini?.getContext("2d");
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8bd6f3);scene.fog=new THREE.Fog(0x8bd6f3,48,115);
const camera=new THREE.PerspectiveCamera(48,1,.1,180);const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x83a46b,2.1));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-25,40,20);scene.add(sun);
const mat=c=>new THREE.MeshLambertMaterial({color:c});const mats={grass:mat(0x83cf70),road:mat(0x535f68),line:mat(0xf8e8a2),sidewalk:mat(0xd7d1b9),white:mat(0xffffff),window:mat(0x9be0ee),dark:mat(0x34495b)};
const geo=new THREE.BoxGeometry(1,1,1);
function box(x,y,z,sx,sy,sz,m,parent=scene){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
function ground(x,z,sx,sz,m){return box(x,-.22,z,sx,.4,sz,m);}
ground(0,-2,100,100,mats.grass);
for(let x=-48;x<=48;x+=12){ground(x,0,5,100,mats.road);for(let z=-48;z<=48;z+=8)box(x,0,z, .18,.025,2.5,mats.line);}
for(let z=-48;z<=48;z+=12){ground(0,z,100,5,mats.road);for(let x=-48;x<=48;x+=8)box(x,.01,z,2.5,.025,.18,mats.line);}
for(let x=-48;x<=48;x+=12)for(let z=-48;z<=48;z+=12)if((x+z)%24!==0)ground(x+3,z+3,6,6,mats.sidewalk);
function tree(x,z){box(x,.8,z,.45,1.6,.45,mat(0x96613c));const crown=box(x,2.2,z,2.2,2.2,2.2,mat(0x36a957));crown.rotation.y=.2;box(x-.65,2.65,z+.2,1.3,1.3,1.3,mat(0x57c75f));}
for(let i=0;i<34;i++){let x=((i*17)%88)-44,z=((i*29)%88)-44;if(Math.abs(x%12)>4&&Math.abs(z%12)>4)tree(x,z);}
const places=[
{id:"cafe",name:"NORTHSTAR CAFE",x:-18,z:-18,c:0xef7957,w:7,d:6,h:5},
{id:"jobs",name:"JOB CENTRE",x:22,z:-24,c:0x4b91d1,w:8,d:7,h:8},
{id:"market",name:"MAPLE MARKET",x:-24,z:20,c:0xf2b83f,w:8,d:7,h:5},
{id:"home-life",name:"YOUR HOME",x:24,z:24,c:0xe3a36b,w:7,d:7,h:5},
{id:"library",name:"PUBLIC LIBRARY",x:36,z:0,c:0xa47bd3,w:8,d:7,h:7},
{id:"police",name:"POLICE STATION",x:-36,z:0,c:0x5d91c9,w:8,d:7,h:6},
{id:"park",name:"EVERGREEN PARK",x:0,z:-35,c:0x62bd61,w:9,d:8,h:1}
];
const signMat=mat(0xfff0c8);
for(const p of places){if(p.id==="park"){ground(p.x,p.z,15,14,mat(0x73c96d));for(let i=0;i<5;i++)tree(p.x-5+i*2.5,p.z+2);continue;}
box(p.x,p.h/2,p.z,p.w,p.h,p.d,mat(p.c));box(p.x,p.h+.2,p.z,p.w+.7,.45,p.d+.7,mat(p.id==="home-life"?0xb64f47:0xf2d18a));
for(let i=-1;i<=1;i++){box(p.x+i*2,p.h*.58,p.z+p.d/2+.035,1.25,1.35,.09,mats.window);box(p.x+i*2,p.h*.58,p.z-p.d/2-.035,1.25,1.35,.09,mats.window);}
box(p.x,p.h*.27,p.z+p.d/2+.08,1.3,2,.15,mat(0x76503b));
const canvas=document.createElement("canvas");canvas.width=512;canvas.height=96;const cx=canvas.getContext("2d");cx.fillStyle="#fff1cf";cx.fillRect(0,0,512,96);cx.fillStyle="#29485e";cx.font="bold 46px Arial";cx.textAlign="center";cx.fillText(p.name,256,64);const tex=new THREE.CanvasTexture(canvas);const sign=new THREE.Mesh(new THREE.PlaneGeometry(p.w*.9,1.1),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(p.x,p.h*.77,p.z+p.d/2+.12);scene.add(sign);
}
function makeAvatar(){const g=new THREE.Group(),skin=mat(0xc98c68),shirt=mat(0x36a0d0),pants=mat(0x304b72),hair=mat(0x342a28);
box(0,.65,0,.75,1.05,.42,shirt,g);box(-.23,.13,0,.28,.7,.34,pants,g);box(.23,.13,0,.28,.7,.34,pants,g);box(-.49,.68,0,.22,.8,.24,skin,g);box(.49,.68,0,.22,.8,.24,skin,g);box(0,1.48,0,.68,.68,.62,skin,g);box(0,1.82,0,.72,.2,.66,hair,g);box(.18,1.53,.315,.07,.07,.03,mat(0x222222),g);return g;}
const player=makeAvatar();player.position.set(0,0,8);scene.add(player);
function car(x,z,color){const g=new THREE.Group();box(0,.55,0,2.4,.8,4,mat(color),g);box(0,1.12,-.2,1.8,.65,2,mat(0xa8dce9),g);for(const x of [-1,1])for(const z of [-1.25,1.25]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.22,8),mat(0x20252b));wh.rotation.z=Math.PI/2;wh.position.set(x*1.1,.32,z);g.add(wh);}g.position.set(x,0,z);scene.add(g);}
car(-12,0,0xe65348);car(12,12,0x3888ca);car(-12,24,0xf1bd42);
let yaw=0,camDist=12,keys={},walk=0,near=null,last=performance.now();
function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();
function nearest(){let best=null,d=99;for(const p of places){const n=Math.hypot(player.position.x-p.x,player.position.z-p.z);if(n<d){d=n;best=p;}}return d<7?best:null;}
function miniDraw(){if(!mc||!mini)return;const r=mini.getBoundingClientRect();if(!r.width)return;mc.clearRect(0,0,r.width,r.height);mc.fillStyle="#91cb79";mc.fillRect(0,0,r.width,r.height);mc.strokeStyle="#65747a";mc.lineWidth=5;for(let n=0;n<5;n++){mc.beginPath();mc.moveTo(n*r.width/4,0);mc.lineTo(n*r.width/4,r.height);mc.moveTo(0,n*r.height/4);mc.lineTo(r.width,n*r.height/4);mc.stroke();}places.forEach(p=>{mc.fillStyle="#e4a35d";mc.fillRect((p.x+50)/100*r.width-3,(p.z+50)/100*r.height-3,6,6);});mc.fillStyle="#fff";mc.beginPath();mc.arc((player.position.x+50)/100*r.width,(player.position.z+50)/100*r.height,5,0,7);mc.fill();}
function interact(){near=nearest();if(near)document.dispatchEvent(new CustomEvent("maple:interact",{detail:{id:near.id}}));else document.dispatchEvent(new CustomEvent("maple:game-toast",{detail:{message:"Walk closer to a building to interact."}}));}
window.addEventListener("keydown",e=>{if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)){keys[e.code]=true;if(!e.target.closest("input,textarea,select"))e.preventDefault();}if(e.code==="KeyE"&&!e.repeat)interact();if(/^Digit[1-5]$/.test(e.code))document.querySelector('[data-hotbar="'+["phone","eat","coffee","rest","inventory"][Number(e.code.slice(-1))-1]+'"]')?.click();});
window.addEventListener("keyup",e=>keys[e.code]=false);window.addEventListener("blur",()=>keys={});
let drag=false,lastX=0;renderer.domElement.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener("pointermove",e=>{if(drag){yaw-=(e.clientX-lastX)*.006;lastX=e.clientX;}});renderer.domElement.addEventListener("pointerup",()=>drag=false);renderer.domElement.addEventListener("pointercancel",()=>drag=false);
document.querySelectorAll("[data-move]").forEach(b=>{const k={up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"}[b.dataset.move];b.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true;});["pointerup","pointerleave","pointercancel"].forEach(n=>b.addEventListener(n,()=>keys[k]=false));});
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.04,(t-last)/1000);last=t;let dx=0,dz=0;if(keys.KeyW||keys.ArrowUp)dz-=1;if(keys.KeyS||keys.ArrowDown)dz+=1;if(keys.KeyA||keys.ArrowLeft)dx-=1;if(keys.KeyD||keys.ArrowRight)dx+=1;const len=Math.hypot(dx,dz);if(len){dx/=len;dz/=len;const rx=dx*Math.cos(yaw)-dz*Math.sin(yaw),rz=dx*Math.sin(yaw)+dz*Math.cos(yaw);player.position.x=THREE.MathUtils.clamp(player.position.x+rx*dt*8,-46,46);player.position.z=THREE.MathUtils.clamp(player.position.z+rz*dt*8,-46,46);player.rotation.y=Math.atan2(rx,rz);walk+=dt*12;player.position.y=Math.abs(Math.sin(walk))*.06;}
const target=new THREE.Vector3(player.position.x,1.3,player.position.z);const offset=new THREE.Vector3(Math.sin(yaw)*camDist,camDist*.8,Math.cos(yaw)*camDist);camera.position.copy(target).add(offset);camera.lookAt(target);renderer.render(scene,camera);near=nearest();const hint=document.getElementById("gameInteract");if(hint){hint.classList.toggle("visible",!!near);hint.innerHTML=near?"Press <b>E</b> to visit "+near.name:"";}const loc=document.getElementById("gameLocation");if(loc)loc.textContent="📍 "+(near?near.name:"MAPLEWOOD · CANADA");miniDraw();}
requestAnimationFrame(frame);
})();