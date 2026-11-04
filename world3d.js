(() => {
  "use strict";
  const canvas = document.getElementById("maple3dCanvas");
  const stage = document.getElementById("maple3dStage");
  if (!canvas || !stage || !window.THREE) {
    const status = document.getElementById("maple3dStatus");
    if (status) status.textContent = "3D graphics could not start in this browser";
    return;
  }
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa9d2e3);
  scene.fog = new THREE.Fog(0xa9d2e3, 42, 105);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const hemi = new THREE.HemisphereLight(0xe9f6ff, 0x71845c, 2.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d5, 1.35);
  sun.position.set(-18, 30, 12);
  scene.add(sun);

  const mat = (color, roughness=1) => new THREE.MeshLambertMaterial({ color, flatShading: true });
  const groundMat = mat(0x8eae78), roadMat = mat(0x525d5b), sidewalkMat = mat(0xc9c7b7);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150), groundMat);
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.08; scene.add(ground);
  function block(w,h,d,x,y,z,material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    mesh.position.set(x,y+h/2,z); scene.add(mesh); return mesh;
  }
  // Roads and pavements form a simple walkable neighbourhood grid.
  block(13,.08,110,0,0,0,roadMat);
  block(110,.08,12,0,0,0,roadMat);
  block(15,.12,110,0,.02,0,sidewalkMat);
  block(110,.12,14,0,.02,0,sidewalkMat);
  block(8,.14,110,0,.04,0,roadMat);
  block(110,.14,7,0,.04,0,roadMat);
  const lineMat=mat(0xf3e5a5);
  for(let z=-48;z<=48;z+=8) block(.16,.025,2.8,0,.09,z,lineMat);
  for(let x=-48;x<=48;x+=8) block(2.8,.025,.16,x,.09,0,lineMat);

  const buildingColors=[0xd6b99a,0xe3d8c2,0xb8c9c2,0xc9b7a5,0xd4dce0,0xc6d0b0,0xd9c2b2];
  const windowMat=mat(0x8fc0cc), darkWindow=mat(0x557783), roofMat=mat(0x596b61);
  function building(x,z,w,d,h,color,shop=false){
    const wall=mat(color);
    block(w,h,d,x,0,z,wall);
    block(w+.35,.35,d+.35,x,h,z,roofMat);
    const cols=Math.max(2,Math.floor(w/1.5));
    const rows=Math.max(1,Math.floor(h/1.65));
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const wx=x-w/2+(c+.5)*w/cols, wy=.75+r*1.55;
      if(wy<h-.35) block(.48,.62,.055,wx,wy,z+d/2+.035,shop?windowMat:darkWindow);
    }
    if(shop){
      block(w*.72,.75,.12,x,.35,z+d/2+.1,mat(0x426b55));
      block(w*.78,.13,.14,x,1.15,z+d/2+.12,mat(0xf3e6bd));
    }
  }
  building(-13,-13,8,8,7,buildingColors[0],true);
  building(13,-13,9,8,11,buildingColors[1]);
  building(-14,14,10,9,9,buildingColors[2]);
  building(14,14,8,9,6,buildingColors[3],true);
  building(-29,-9,10,11,13,buildingColors[4]);
  building(29,-11,11,10,8,buildingColors[5],true);
  building(-30,19,9,10,7,buildingColors[6],true);
  building(29,22,12,10,14,buildingColors[1]);
  building(-46,-22,10,10,9,buildingColors[2]);
  building(45,-22,10,10,12,buildingColors[0]);
  building(-45,27,11,10,8,buildingColors[3]);
  building(45,28,10,10,10,buildingColors[5]);

  const trunkMat=mat(0x79543a), leafMats=[mat(0x477d54),mat(0x5c915b),mat(0x789e5d)];
  function tree(x,z,scale=1){
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18*scale,.25*scale,1.35*scale,5),trunkMat);
    trunk.position.set(x,.68*scale,z);scene.add(trunk);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(.95*scale,2.25*scale,6),leafMats[Math.floor(Math.random()*leafMats.length)]);
    crown.position.set(x,2.05*scale,z);scene.add(crown);
    const crown2=new THREE.Mesh(new THREE.ConeGeometry(.7*scale,1.65*scale,6),leafMats[1]);
    crown2.position.set(x,2.95*scale,z);scene.add(crown2);
  }
  for(const [x,z,s] of [[-8,-22,1.2],[8,-22,1.1],[-9,22,1.1],[9,22,1.2],[-22,-2,1.3],[22,2,1.25],[-38,-3,1.2],[38,3,1.2],[-20,32,1.3],[20,-34,1.3],[-5,39,1],[6,-40,1]]) tree(x,z,s);
  // Street lamps.
  const lampMat=mat(0x3e4d4b), glowMat=new THREE.MeshBasicMaterial({color:0xffe7a5});
  for(const [x,z] of [[-7,-7],[7,-7],[-7,7],[7,7],[-25,0],[25,0]]){
    block(.12,2.8,.12,x,.1,z,lampMat);block(.8,.12,.12,x+.32,2.8,z,lampMat);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.17,6,5),glowMat);bulb.position.set(x+.65,2.7,z);scene.add(bulb);
  }
  // Player character: intentionally simple low-poly geometry for integrated graphics.
  const player=new THREE.Group();scene.add(player);
  const skin=mat(0xc88f68), shirt=mat(0x3e8061), pants=mat(0x344a5b), hair=mat(0x302a27), shoe=mat(0x28312e);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,.9,7),shirt);body.position.y=1.05;player.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,8,6),skin);head.position.y=1.78;player.add(head);
  const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.35,8,5,0,Math.PI*2,0,Math.PI*.55),hair);hairCap.position.y=1.9;player.add(hairCap);
  const legGeo=new THREE.BoxGeometry(.22,.62,.25);
  for(const x of [-.16,.16]){const leg=new THREE.Mesh(legGeo,pants);leg.position.set(x,.32,0);player.add(leg);const foot=new THREE.Mesh(new THREE.BoxGeometry(.24,.14,.38),shoe);foot.position.set(x,.08,-.06);player.add(foot);}
  const armGeo=new THREE.BoxGeometry(.18,.65,.2);
  for(const x of [-.43,.43]){const arm=new THREE.Mesh(armGeo,shirt);arm.position.set(x,1.08,0);player.add(arm);}
  player.position.set(0,0,5);

  const keys=Object.create(null);
  const status=document.getElementById("maple3dStatus");
  const positionLabel=document.getElementById("maple3dPosition");
  let yaw=0, dragging=false, lastX=0, lastY=0, pitch=.22, walkTime=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  window.addEventListener("keydown",e=>{if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code) && document.getElementById("cityView")?.classList.contains("active-view")){keys[e.code]=true;e.preventDefault();}});
  window.addEventListener("keyup",e=>{keys[e.code]=false;});
  window.addEventListener("blur",()=>Object.keys(keys).forEach(k=>keys[k]=false));
  canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.006;pitch=clamp(pitch+dy*.003,-.05,.75);});
  canvas.addEventListener("pointerup",()=>dragging=false);
  canvas.addEventListener("pointercancel",()=>dragging=false);
  document.querySelectorAll("[data-world-place]").forEach(button=>button.addEventListener("click",()=>{
    const id=button.dataset.worldPlace;
    const target=document.querySelector('[data-place="'+id+'"]');
    if(target)target.click();
    if(status)status.textContent="Destination selected: "+button.textContent.trim();
  }));
  function resize(){
    const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);resize();
  const clock=new THREE.Clock();
  function frame(){
    requestAnimationFrame(frame);
    const dt=Math.min(clock.getDelta(),.04);
    const active=document.getElementById("cityView")?.classList.contains("active-view");
    if(!active)return;
    const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
    const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    const moving=forward!==0||side!==0;
    if(moving){
      const speed=dt*7.2, dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
      const right=new THREE.Vector3(dir.z,0,-dir.x);
      player.position.addScaledVector(dir,-forward*speed);
      player.position.addScaledVector(right,side*speed);
      player.position.x=clamp(player.position.x,-52,52);player.position.z=clamp(player.position.z,-52,52);
      walkTime+=dt*10;player.rotation.y=yaw+(side?Math.atan2(side,forward||.001):0);
      player.children[3].rotation.x=Math.sin(walkTime)*.45;player.children[4].rotation.x=-Math.sin(walkTime)*.45;
      if(status)status.textContent="Exploring Maplewood…";
    } else if(status && status.textContent==="Exploring Maplewood…")status.textContent="Ready to explore";
    const look=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
    const desired=player.position.clone().add(new THREE.Vector3(0,3.1,0)).addScaledVector(look,-8.5);
    camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,player.position.y+1.2,player.position.z);
    if(positionLabel){
      const x=player.position.x,z=player.position.z;
      positionLabel.textContent=Math.abs(x)<9&&Math.abs(z)<9?"CITY SQUARE":z<-9?"NORTH MAPLEWOOD":z>9?"SOUTH MAPLEWOOD":x<0?"WEST MAPLEWOOD":"EAST MAPLEWOOD";
    }
    renderer.render(scene,camera);
  }
  frame();
  document.addEventListener("visibilitychange",()=>{if(document.hidden)Object.keys(keys).forEach(k=>keys[k]=false);});
})();
