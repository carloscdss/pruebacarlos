const FPS_FLOOR_Y = 0.06;
const player = {
  pos: new THREE.Vector3(0, FPS_FLOOR_Y + 1.64, 15),
  vel: new THREE.Vector3(),
  yaw: 0, pitch: 0,
  onGround: true,
  height: 1.64, radius: 0.35,
  speed: 5.5, runMult: 1.8,
  jumpVel: 5.2, gravity: -18
};

const fpsMode = { value: false };
const keys = {};

const fpsRay = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);
let hoveredId = null;

const crosshair   = document.getElementById('crosshair');
const fpsHelp    = document.getElementById('fps-help');
const playOverlay= document.getElementById('play-overlay');
const fpsBar     = document.getElementById('fps-bar');
const teleportMenu = document.getElementById('teleport-menu');
const touchControls = document.getElementById('touch-controls');

let joyX = 0, joyY = 0;
let isDraggingJoy = false;
const knob = document.getElementById('joystick-knob');
const joyZone = document.getElementById('joystick-zone');

const colliders = [];

function addCollider(minX, maxX, minZ, maxZ, minY, maxY){ 
  colliders.push({minX,maxX,minZ,maxZ,minY,maxY}); 
}

function setupColliders(RX0,RX1,RZ0,RZ1,RH){
  addCollider(RX0-0.3, RX0, RZ0-0.3, RZ1+0.3, 0, RH); // Pared Izq
  addCollider(RX1, RX1+0.3, RZ0-0.3, RZ1+0.3, 0, RH); // Pared Der
  addCollider(RX0-0.3, RX1+0.3, RZ0-0.3, RZ0, 0, RH); // Pared Fondo
  // La pared frontal (RZ1) tiene un hueco para la puerta.
  // Colisión izquierda de la puerta
  addCollider(RX0-0.3, -0.55, RZ1, RZ1+0.3, 0, RH);
  // Colisión derecha de la puerta
  addCollider(0.55, RX1+0.3, RZ1, RZ1+0.3, 0, RH);
  
  // Colisiones Gabinetes
  addCollider(-2.4, -1.6, RZ0+0.18, RZ0+1.0, 0, 2.2);
  addCollider(1.6, 2.4, RZ0+0.18, RZ0+1.0, 0, 2.2);
  
  // Colisiones Campo
  addCollider(-14.25, -7.75, -3.25, 3.25, 0, 9);
  addCollider(-6.65, -0.15, -3.25, 3.25, 0, 9);
  addCollider(13.3, 18.7, 9.3, 14.7, 0, 10);
  addCollider(20.3, 25.7, 9.3, 14.7, 0, 10);
  addCollider(-39, -15, -1.2, 1.2, 0, 2.8);
  addCollider(-39.5, -22.5, 11.5, 14.5, 0, 6.5);
  addCollider(-39.5, -22.5, 20, 23, 0, 6.5);
  addCollider(5.5, 36.5, -3.5, -1.5, 0, 1.5);
  addCollider(-7.1, -5.9, -7.1, -5.9, 0, 2.6);
}

function buildTeleportMenu(cams){
  const grid = document.getElementById('tp-grid');
  if(!grid) return;
  const TELEPORTS = [
    ['sala','Sala de Control'],['gab1','Gabinete N°1'],['gab2','Gabinete N°2'],
    ['campo','Panel de Campo'],['filtros','Filtros D-951'],
    ['interc','Intercambiadores'],['bombas','Bombas']
  ];
  grid.innerHTML = TELEPORTS.map(([k,l]) => `<button onclick="irAEquipo('${k}', window.cams)">${l}</button>`).join('');
}

function entrarFPS(){
  fpsMode.value = true;
  if(typeof controls !== 'undefined' && controls) controls.enabled = false;
  document.querySelectorAll('.presets button').forEach(b => b.classList.remove('on'));
  
  const sidebar = document.getElementById('sidebar');
  const report = document.getElementById('report');
  const info = document.getElementById('info');
  
  if(sidebar) sidebar.style.display = 'none';
  if(report) report.classList.remove('visible');
  if(info) {
    info.style.display = ''; 
    info.style.bottom = '120px'; // Subimos el panel de info
    info.style.left = '50%';     // Lo centramos
    info.style.transform = 'translateX(-50%)'; // Centrado real
    info.style.width = '320px';  // Un poco más ancho
    info.style.zIndex = '100';   // Aseguramos que esté encima
  }

  if(crosshair) crosshair.classList.add('visible');
  if(fpsHelp) fpsHelp.classList.add('visible');
  if(fpsBar) fpsBar.classList.add('visible');
  if(touchControls) touchControls.style.display = 'block';

  // Posición inicial de la cámara
  player.pos.set(0, FPS_FLOOR_Y + player.height, 15);
  player.yaw = 0; player.pitch = 0;
  player.vel.set(0,0,0);
  player.onGround = true;
  if(typeof scene !== 'undefined' && scene.fog) {
    scene.fog.near = 30; 
    scene.fog.far = 220;
  }
  if(playOverlay) playOverlay.classList.add('visible');
  
  // Solicitamos capturar el mouse (Pointer Lock) al hacer clic en el overlay
  if(playOverlay) {
    playOverlay.onclick = () => {
      playOverlay.classList.remove('visible');
      if(!('ontouchstart' in window)) { // Solo si no es móvil
        renderer.domElement.requestPointerLock();
      }
    };
  }
}

function salirFPS(){
  fpsMode.value = false;
  if(typeof controls !== 'undefined' && controls) controls.enabled = true;
  if(crosshair) crosshair.classList.remove('visible');
  if(fpsHelp) fpsHelp.classList.remove('visible');
  if(fpsBar) fpsBar.classList.remove('visible');
  if(playOverlay) playOverlay.classList.remove('visible');
  if(teleportMenu) teleportMenu.classList.remove('visible');
  
  const sidebar = document.getElementById('sidebar');
  const info = document.getElementById('info');
  const report = document.getElementById('report');

  if(sidebar) sidebar.style.display = '';
  if(info) { 
    info.style.display = ''; 
    info.style.bottom = '8px'; 
    info.style.left = '8px'; 
    info.style.transform = 'none'; 
    info.style.width = '250px';
  }
  if(report) report.classList.add('visible');
  if(touchControls) touchControls.style.display = 'none';

  if(typeof scene !== 'undefined' && scene.fog) {
    scene.fog.near = 150; 
    scene.fog.far = 340;
  }
  
  // Salir del pointer lock si está activo
  if(document.pointerLockElement) {
    document.exitPointerLock();
  }
  
  if(typeof irA === 'function') irA('overview');
}

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if(e.code === 'Escape' && fpsMode.value) salirFPS(); // Tecla Esc configurada
  if(e.code === 'KeyT' && fpsMode.value) viajarAObjetoAim();
  if(e.code === 'KeyM' && fpsMode.value && teleportMenu) teleportMenu.classList.toggle('visible');
});

document.addEventListener('keyup', e => { 
  keys[e.code] = false; 
});

// --- LÓGICA DE MOUSE (Pointer Lock) ---
let isDragging = false, lastMouseX = 0, lastMouseY = 0;
const mouseSensitivity = 0.005;

if(typeof renderer !== 'undefined' && renderer && renderer.domElement) {
  renderer.domElement.addEventListener('mousedown', e => { 
    if(fpsMode.value) { 
      if(!document.pointerLockElement && !('ontouchstart' in window)) {
        renderer.domElement.requestPointerLock();
      } else {
        isDragging = true; 
        lastMouseX = e.clientX; 
        lastMouseY = e.clientY; 
      }
    } 
  });
}

document.addEventListener('mouseup', () => { 
  isDragging = false; 
});

document.addEventListener('mousemove', e => {
  if(!fpsMode.value) return;
  
  if(document.pointerLockElement === renderer.domElement) {
    // Mouse capturado (movimiento relativo)
    player.yaw -= e.movementX * mouseSensitivity;
    player.pitch -= e.movementY * mouseSensitivity;
    player.pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, player.pitch));
  } else if(isDragging) {
    // Mouse suelto (arrastrar normal)
    player.yaw -= (e.clientX - lastMouseX) * mouseSensitivity;
    player.pitch -= (e.clientY - lastMouseY) * mouseSensitivity;
    player.pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, player.pitch));
    lastMouseX = e.clientX; lastMouseY = e.clientY;
  }
});

// Soporte Táctil (Móvil)
if(typeof renderer !== 'undefined' && renderer && renderer.domElement) {
  let lastTouchX = 0, lastTouchY = 0;
  renderer.domElement.addEventListener('touchstart', e => {
    if(!fpsMode.value) return;
    if(e.target === renderer.domElement && e.touches.length > 0) {
      lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
    }
  }, {passive: false});
  
  renderer.domElement.addEventListener('touchmove', e => {
    if(!fpsMode.value) return;
    if(e.target === renderer.domElement && e.touches.length > 0) {
      e.preventDefault();
      player.yaw -= (e.touches[0].clientX - lastTouchX) * 0.01;
      player.pitch -= (e.touches[0].clientY - lastTouchY) * 0.01;
      player.pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, player.pitch));
      lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
    }
  }, {passive: false});
}

if(joyZone) {
  joyZone.addEventListener('touchstart', e => { e.preventDefault(); isDraggingJoy = true; updateJoy(e.touches[0]); }, {passive: false});
  joyZone.addEventListener('touchmove', e => { e.preventDefault(); if(isDraggingJoy && e.touches.length > 0) updateJoy(e.touches[0]); }, {passive: false});
  joyZone.addEventListener('touchend', e => { e.preventDefault(); isDraggingJoy = false; joyX = 0; joyY = 0; if(knob) knob.style.transform = `translate(-50%, -50%)`; }, {passive: false});
}

function updateJoy(touch) {
  if(!joyZone || !knob) return;
  const rect = joyZone.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxDist = rect.width / 2;
  
  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;
  const dist = Math.min(Math.hypot(dx, dy), maxDist);
  const angle = Math.atan2(dy, dx);
  
  joyX = Math.cos(angle) * (dist / maxDist);
  joyY = Math.sin(angle) * (dist / maxDist);
  
  knob.style.transform = `translate(calc(-50% + ${joyX * maxDist * 0.8}px), calc(-50% + ${joyY * maxDist * 0.8}px))`;
}

const btnAction = document.getElementById('btn-action');
if(btnAction) {
  btnAction.addEventListener('click', () => { inspeccionarFPS(); });
}

if(playOverlay) {
  playOverlay.onclick = () => { 
    playOverlay.classList.remove('visible'); 
  };
}

function irAEquipo(camKey, cams){
  if(teleportMenu) teleportMenu.classList.remove('visible');
  if(!fpsMode.value || !cams || !cams[camKey]) return;
  const c = cams[camKey][1];
  let offset = new THREE.Vector3(0, 0, 5);
  if(camKey === 'sala') offset.set(0, 0, 6);
  if(camKey === 'gab1') offset.set(-2, 0, 3);
  if(camKey === 'gab2') offset.set(2, 0, 3);
  if(camKey === 'campo') offset.set(0, 0, 3);
  if(camKey === 'filtros') offset.set(0, 0, 6);
  if(camKey === 'interc') offset.set(0, 0, 6);
  if(camKey === 'bombas') offset.set(0, 0, 5);
  player.pos.set(c[0] + offset.x, FPS_FLOOR_Y + player.height, c[2] + offset.z);
  player.vel.set(0,0,0);
  player.onGround = true;
  const dx = c[0] - player.pos.x;
  const dz = c[2] - player.pos.z;
  player.yaw = Math.atan2(-dx, -dz);
  player.pitch = -0.1;
}

function viajarAObjetoAim(){
  if(!hoveredId || typeof reg === 'undefined' || !reg[hoveredId]) return;
  const obj = reg[hoveredId][0];
  const caja = new THREE.Box3().setFromObject(obj);
  if(caja.isEmpty()) return;
  const c = caja.getCenter(new THREE.Vector3());
  const size = caja.getSize(new THREE.Vector3());
  const dist = Math.max(size.length() * 1.5, 2.5);
  player.pos.set(c.x + dist, FPS_FLOOR_Y + player.height, c.z + dist);
  player.vel.set(0,0,0);
  player.onGround = true;
  const dx = c.x - player.pos.x;
  const dz = c.z - player.pos.z;
  player.yaw = Math.atan2(-dx, -dz);
  player.pitch = -0.15;
}

function inspeccionarFPS(){
  if(!camera) return;
  
  fpsRay.setFromCamera(centerNDC, camera);
  fpsRay.far = 6;
  
  const h = fpsRay.intersectObjects(pickables, false);
  
  if(h.length > 0) {
    let objTocado = h[0].object;
    
    if(objTocado.userData.esPuerta) {
      const idPuerta = objTocado.userData.esPuerta;
      
      if(idPuerta === 'sala') {
        estadoPuertas.sala = !estadoPuertas.sala;
        const iTag = document.getElementById('i-tag');
        if(iTag) iTag.textContent = estadoPuertas.sala ? "Abriendo Puerta Principal..." : "Cerrando Puerta Principal...";
      } else {
        estadoPuertas[idPuerta] = !estadoPuertas[idPuerta];
        const estadoTexto = estadoPuertas[idPuerta] ? 'Abriendo' : 'Cerrando';
        const iTag = document.getElementById('i-tag');
        if(iTag) iTag.textContent = "🚪 " + estadoTexto + " Gabinete " + (idPuerta === 'gab1' ? 'N°1' : 'N°2');
      }
      return;
    }
    
    if(objTocado.userData.renglon && typeof seleccionar === 'function') {
      seleccionar(objTocado.userData.renglon);
    }
  }
}

function actualizarFPS(dt){
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const wish = new THREE.Vector3();
  
  if(keys['KeyW'] || keys['ArrowUp']) wish.add(forward);
  if(keys['KeyS'] || keys['ArrowDown']) wish.sub(forward);
  if(keys['KeyD'] || keys['ArrowRight']) wish.add(right);
  if(keys['KeyA'] || keys['ArrowLeft']) wish.sub(right);
  
  if(joyY !== 0) wish.add(forward.clone().multiplyScalar(-joyY));
  if(joyX !== 0) wish.add(right.clone().multiplyScalar(joyX));

  if(wish.lengthSq() > 0) wish.normalize();

  const running = keys['ShiftLeft'] || keys['ShiftRight'] || Math.hypot(joyX, joyY) > 0.8;
  const speed = player.speed * (running ? player.runMult : 1);
  const targetVelX = wish.x * speed;
  const targetVelZ = wish.z * speed;
  const accel = player.onGround ? 14 : 4;
  player.vel.x += (targetVelX - player.vel.x) * Math.min(1, accel * dt);
  player.vel.z += (targetVelZ - player.vel.z) * Math.min(1, accel * dt);

  if(keys['Space'] && player.onGround){ player.vel.y = player.jumpVel; player.onGround = false; }
  player.vel.y += player.gravity * dt;

  // COLISIONES DINÁMICAS (Revisa si la puerta de la sala está abierta)
  const isSalaOpen = estadoPuertas && estadoPuertas.sala;

  const newPos = player.pos.clone();
  newPos.x += player.vel.x * dt;
  if(colisiona(newPos.x, player.pos.y, player.pos.z, isSalaOpen)){ newPos.x = player.pos.x; player.vel.x = 0; }
  newPos.z += player.vel.z * dt;
  if(colisiona(newPos.x, player.pos.y, newPos.z, isSalaOpen)){ newPos.z = player.pos.z; player.vel.z = 0; }

  newPos.y += player.vel.y * dt;
  const minEyeY = FPS_FLOOR_Y + player.height;
  if(newPos.y <= minEyeY){
    newPos.y = minEyeY;
    player.vel.y = 0;
    player.onGround = true;
  } else if(colisiona(newPos.x, newPos.y, newPos.z, isSalaOpen)){
    if(player.vel.y < 0) player.onGround = true;
    newPos.y = player.pos.y;
    player.vel.y = 0;
  } else if(player.vel.y < -0.5){
    player.onGround = false;
  }

  newPos.x = Math.max(-75, Math.min(75, newPos.x));
  newPos.z = Math.max(-20, Math.min(48, newPos.z));
  player.pos.copy(newPos);

  if(typeof camera !== 'undefined') {
    camera.position.copy(player.pos);
    const dir = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    );
    camera.lookAt(player.pos.clone().add(dir));
  }

  const spd = Math.hypot(player.vel.x, player.vel.z);
  if(fpsBar) fpsBar.style.transform = `scaleX(${Math.min(1, spd/9)})`;

  if(typeof camera !== 'undefined' && typeof pickables !== 'undefined' && pickables.length > 0) {
    fpsRay.setFromCamera(centerNDC, camera);
    fpsRay.far = 10;
    const h = fpsRay.intersectObjects(pickables, false);
    
    let objAim = h.length ? h[0].object : null;
    let tagId = objAim && objAim.userData.renglon ? objAim.userData.renglon : null;

    const iTag = document.getElementById('i-tag');
    const iDesc = document.getElementById('i-desc');
    const iMeta = document.getElementById('i-meta');
    const iDoc = document.getElementById('i-doc');

    if (objAim && objAim.userData.esPuerta) {
      if(iTag) iTag.textContent = "🚪 Puerta interactiva";
      if(iDesc) iDesc.textContent = "Apunta y toca el botón 🎯 para abrir/cerrar.";
      if(iMeta) iMeta.textContent = "";
      if(iDoc) iDoc.style.display = 'none';
    } else if (tagId && typeof MAP !== 'undefined' && MAP[tagId]) {
      if(iTag) iTag.textContent = "Renglón " + tagId;
      if(iDesc) iDesc.textContent = MAP[tagId].d;
      if(iMeta) iMeta.textContent = "Unidad: " + MAP[tagId].u + " · Cómputo: " + MAP[tagId].q;
      if(iDoc) iDoc.style.display = MAP[tagId].doc ? 'block' : 'none';
      if(iDoc && MAP[tagId].doc) iDoc.innerHTML = `<b>ℹ️ Info Técnica:</b><br>${MAP[tagId].doc}`;
    } else {
      if(iTag) iTag.textContent = 'Modo FPS';
      if(iDesc) iDesc.textContent = 'Mueve el joystick. Apunta a un equipo o puerta y toca 🎯';
      if(iMeta) iMeta.textContent = '';
      if(iDoc) iDoc.style.display = 'none';
    }
  }
}

function colisiona(x, y, z, isSalaOpen){
  const feet = y - player.height;
  const head = y;
  
  // Si la puerta de la sala está abierta, ignoramos la colisión del marco
  for(const c of colliders){
    // Chequeo especial para la pared frontal de la sala (RZ1)
    if (isSalaOpen && c.minZ >= 28 && c.maxZ <= 28.3) {
       // Si la puerta está abierta y estamos en el hueco de la puerta, no colisionar
       if (x > -0.5 && x < 0.5) continue; 
    }
    
    if(x + player.radius > c.minX && x - player.radius < c.maxX &&
       z + player.radius > c.minZ && z - player.radius < c.maxZ &&
       head > c.minY && feet < c.maxY){
      return true;
    }
  }
  return false;
}
