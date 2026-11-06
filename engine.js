const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.domElement.id = 'cv';
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xb9c8d4, 150, 340);

const camera = new THREE.PerspectiveCamera(55, 1.6, 0.05, 900);
camera.position.set(62, 44, 78);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.maxPolarAngle = Math.PI/2 - 0.02;
controls.minDistance = 1.2; controls.maxDistance = 240;
controls.target.set(0, 4, 8);

(function sky(){
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const x = c.getContext('2d'); const g = x.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#3f79b3'); g.addColorStop(.45,'#93b6d4');
  g.addColorStop(.74,'#d6dfe4'); g.addColorStop(1,'#eae2d4');
  x.fillStyle = g; x.fillRect(0,0,4,256);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(430, 24, 16),
    new THREE.MeshBasicMaterial({map:t, side:THREE.BackSide, fog:false})
  ));
})();

scene.add(new THREE.HemisphereLight(0xc8dcf2, 0x7a7263, 0.95));
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
sun.position.set(50, 72, 42); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-78, right:78, top:78, bottom:-78, near:1, far:250});
sun.shadow.bias = -0.0007; scene.add(sun);
const rim = new THREE.DirectionalLight(0xa8cdf0, 0.4);
rim.position.set(-55, 34, -62); scene.add(rim);

const M = {
  suelo:new THREE.MeshStandardMaterial({color:0x918d80,roughness:0.97}),
  asfalto:new THREE.MeshStandardMaterial({color:0x606266,roughness:0.95}),
  concreto:new THREE.MeshStandardMaterial({color:0xaba79e,roughness:0.9}),
  pared:new THREE.MeshStandardMaterial({color:0xdcdad3,roughness:0.85}),
  paredExt:new THREE.MeshStandardMaterial({color:0xc3c7ca,roughness:0.9}),
  techo:new THREE.MeshStandardMaterial({color:0xe8e7e3,roughness:0.92}),
  epoxi:new THREE.MeshStandardMaterial({color:0x7f8c90,roughness:0.22,metalness:0.12}),
  acero:new THREE.MeshStandardMaterial({color:0x9aa3ab,roughness:0.42,metalness:0.72}),
  galv:new THREE.MeshStandardMaterial({color:0xb6bec4,roughness:0.5,metalness:0.55}),
  inox:new THREE.MeshStandardMaterial({color:0xd0d7db,roughness:0.28,metalness:0.88}),
  inoxP:new THREE.MeshStandardMaterial({color:0xe4e9eb,roughness:0.14,metalness:0.95}),
  gabinete:new THREE.MeshStandardMaterial({color:0xd9dde1,roughness:0.36,metalness:0.32}),
  pintEp:new THREE.MeshStandardMaterial({color:0xbac3c9,roughness:0.45,metalness:0.28}),
  negro:new THREE.MeshStandardMaterial({color:0x22272c,roughness:0.62,metalness:0.2}),
  vidrio:new THREE.MeshPhysicalMaterial({color:0xdfeef7,transparent:true,opacity:0.24,roughness:0.05,transmission:0.92,side:THREE.DoubleSide,depthWrite:false}),
  blanco:new THREE.MeshStandardMaterial({color:0xf2f4f5,roughness:0.5}),
  azul:new THREE.MeshStandardMaterial({color:0x1f5fa8,roughness:0.45}),
  ambar:new THREE.MeshStandardMaterial({color:0xd99b1f,roughness:0.4}),
  rojo:new THREE.MeshStandardMaterial({color:0xb6372f,roughness:0.42}),
  verde:new THREE.MeshStandardMaterial({color:0x2f7d4f,roughness:0.42}),
  pvc:new THREE.MeshStandardMaterial({color:0xdcd3b8,roughness:0.75}),
  cobre:new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.35,metalness:0.85}),
  cable:new THREE.MeshStandardMaterial({color:0x1b1f24,roughness:0.8}),
  cableAz:new THREE.MeshStandardMaterial({color:0x1d4ed8,roughness:0.75}),
  cableGr:new THREE.MeshStandardMaterial({color:0x15803d,roughness:0.75}),
  fibra:new THREE.MeshStandardMaterial({color:0xf5b42a,roughness:0.6}),
  ledOn:new THREE.MeshBasicMaterial({color:0xdff3ff}),
  pantalla:new THREE.MeshBasicMaterial({color:0x0b6ea8}),
  ledV:new THREE.MeshBasicMaterial({color:0x25e06a}),
  ledR:new THREE.MeshBasicMaterial({color:0xf2453a}),
  ledA:new THREE.MeshBasicMaterial({color:0xf5c518}),
  filtro:new THREE.MeshStandardMaterial({color:0x6f7a83,roughness:0.55,metalness:0.6}),
  
  // 🔥 NUEVOS MATERIALES PARA EL GABINETE SYNnor
  gabinetePerlado: new THREE.MeshStandardMaterial({color:0xe8eaed, roughness:0.3, metalness:0.4}),
  baseNegra: new THREE.MeshStandardMaterial({color:0x111213, roughness:0.7, metalness:0.2}),
  rejillaMetal: new THREE.MeshStandardMaterial({color:0x55595c, roughness:0.6, metalness:0.8}),
  manijaNegra: new THREE.MeshStandardMaterial({color:0x1e2022, roughness:0.5, metalness:0.6}),
  argollaMetal: new THREE.MeshStandardMaterial({color:0x888c8f, roughness:0.4, metalness:0.9})
};

const reg = {};
const pickables = [];
const medido = {};

function tag(obj, id, n){
  if(!reg[id]) reg[id] = [];
  const c = n || 1;
  for(let i=0;i<c;i++) reg[id].push(obj);
  obj.traverse(o => {
    if(o.isMesh && !o.userData.renglon){ o.userData.renglon = id; pickables.push(o); }
  });
  return obj;
}
function med(id, m){ medido[id] = (medido[id]||0) + m; }

function box(w,h,d,mat,x,y,z,parent){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true;
  (parent||scene).add(m); return m;
}
function cyl(rt,rb,h,mat,x,y,z,parent,seg){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), mat);
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true;
  (parent||scene).add(m); return m;
}
function grupo(x,y,z,parent){
  const g = new THREE.Group(); g.position.set(x,y,z);
  (parent||scene).add(g); return g;
}
function rotulo(txt, w, h){
  const c = document.createElement('canvas'); c.width = 512; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#dfe3e6'; x.fillRect(0,0,512,96);
  x.fillStyle = '#12171c'; x.font = '700 34px Arial';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(txt, 256, 50);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  const mat = new THREE.MeshStandardMaterial({map:t, roughness:0.5, metalness:0.1});
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}
