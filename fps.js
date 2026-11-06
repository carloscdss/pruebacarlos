// First-person navigation and touch controls for the plant viewer.
// This file intentionally uses the existing classic-script globals from engine.js.
const player = {
  pos: new THREE.Vector3(0, 1.7, 15),
  vel: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  onGround: true,
  height: 1.7,
  radius: 0.35,
  speed: 5.5,
  runMult: 1.8,
  jumpVel: 5.2,
  gravity: -18
};

const fpsMode = { value: false };
const keys = Object.create(null);
const fpsRay = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);
let hoveredId = null;

const crosshair = document.getElementById('crosshair');
const fpsHelp = document.getElementById('fps-help');
const playOverlay = document.getElementById('play-overlay');
const fpsBar = document.getElementById('fps-bar');
const teleportMenu = document.getElementById('teleport-menu');
const touchControls = document.getElementById('touch-controls');
const knob = document.getElementById('joystick-knob');
const joyZone = document.getElementById('joystick-zone');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
let joyX = 0;
let joyY = 0;
let joyPointerId = null;
let lookPointerId = null;
let lookLastX = 0;
let lookLastY = 0;
let lookMoved = false;
let tapStart = null;
const colliders = [];

function addCollider(minX, maxX, minZ, maxZ, minY, maxY) {
  colliders.push({ minX, maxX, minZ, maxZ, minY, maxY });
}
function setupColliders(RX0, RX1, RZ0, RZ1, RH) {
  colliders.length = 0;
  addCollider(RX0 - 0.3, RX0, RZ0 - 0.3, RZ1 + 0.3, 0, RH);
  addCollider(RX1, RX1 + 0.3, RZ0 - 0.3, RZ1 + 0.3, 0, RH);
  addCollider(RX0 - 0.3, RX1 + 0.3, RZ0 - 0.3, RZ0, 0, RH);
  addCollider(RX0 - 0.3, RX1 + 0.3, RZ1, RZ1 + 0.3, 0, RH);
  addCollider(-2.4, -1.6, RZ0 + 0.18, RZ0 + 1.0, 0, 2.2);
  addCollider(1.6, 2.4, RZ0 + 0.18, RZ0 + 1.0, 0, 2.2);
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

function buildTeleportMenu(cams) {
  const grid = document.getElementById('tp-grid');
  if (!grid) return;
  const places = [
    ['sala', 'Sala de Control'], ['gab1', 'Gabinete N°1'],
    ['gab2', 'Gabinete N°2'], ['campo', 'Panel de Campo'],
    ['filtros', 'Filtros D-951'], ['interc', 'Intercambiadores'],
    ['bombas', 'Bombas']
  ];
  grid.replaceChildren();
  places.forEach(([key, label]) => {
    if (!cams || !cams[key]) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => irAEquipo(key, cams));
    grid.appendChild(button);
  });
}

function ensureTouchButtons() {
  if (!touchControls || document.getElementById('btn-teleport')) return;
  // Additional touch actions are created here to keep the existing HTML usable.
  const teleport = document.createElement('button');
  teleport.id = 'btn-teleport';
  teleport.type = 'button';
  teleport.className = 'touch-utility';
  teleport.textContent = '↗';
  teleport.setAttribute('aria-label', 'Abrir viaje rápido');
  teleport.addEventListener('click', () => teleportMenu && teleportMenu.classList.toggle('visible'));

  const exit = document.createElement('button');
  exit.id = 'btn-exit-fps';
  exit.type = 'button';
  exit.className = 'touch-utility';
  exit.textContent = '×';
  exit.setAttribute('aria-label', 'Salir de primera persona');
  exit.addEventListener('click', salirFPS);

  touchControls.append(teleport, exit);
}

function entrarFPS() {
  fpsMode.value = true;
  if (typeof controls !== 'undefined' && controls) controls.enabled = false;
  document.querySelectorAll('.presets button').forEach(button => button.classList.remove('on'));
  document.getElementById('stage')?.classList.add('fps-mode');
  document.getElementById('sidebar')?.classList.add('fps-hidden');
  document.getElementById('info')?.classList.add('fps-hidden');
  document.getElementById('report')?.classList.remove('visible');
  crosshair?.classList.add('visible');
  fpsHelp?.classList.add('visible');
  fpsBar?.classList.add('visible');
  ensureTouchButtons();
  if (touchControls && isTouchDevice) touchControls.classList.add('visible');
  player.pos.set(0, player.height, 15);
  player.yaw = 0;
  player.pitch = 0;
  player.vel.set(0, 0, 0);
  if (scene.fog) { scene.fog.near = 30; scene.fog.far = 220; }
  playOverlay?.classList.add('visible');
}

function salirFPS() {
  fpsMode.value = false;
  if (typeof controls !== 'undefined' && controls) controls.enabled = true;
  document.getElementById('stage')?.classList.remove('fps-mode');
  document.getElementById('sidebar')?.classList.remove('fps-hidden');
  document.getElementById('info')?.classList.remove('fps-hidden');
  crosshair?.classList.remove('visible');
  fpsHelp?.classList.remove('visible');
  fpsBar?.classList.remove('visible');
  playOverlay?.classList.remove('visible');
  teleportMenu?.classList.remove('visible');
  touchControls?.classList.remove('visible');
  joyX = 0; joyY = 0; joyPointerId = null; lookPointerId = null;
  if (knob) knob.style.transform = 'translate(-50%, -50%)';
  if (scene.fog) { scene.fog.near = 150; scene.fog.far = 340; }
  if (typeof irA === 'function') irA('overview');
}

function clampPitch(value) {
  return Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, value));
}
function lookBy(dx, dy) {
  player.yaw -= dx * (isTouchDevice ? 0.006 : 0.005);
  player.pitch = clampPitch(player.pitch - dy * (isTouchDevice ? 0.006 : 0.005));
}

// Desktop keyboard and pointer look. Pointer events cover mouse, pen, and touch.
document.addEventListener('keydown', event => {
  keys[event.code] = true;
  if (!fpsMode.value) return;
  if (event.code === 'Escape') salirFPS();
  if (event.code === 'KeyT') viajarAObjetoAim();
  if (event.code === 'KeyM') teleportMenu?.classList.toggle('visible');
  if (event.code === 'KeyE') inspeccionarFPS();
});
document.addEventListener('keyup', event => { keys[event.code] = false; });
window.addEventListener('blur', () => {
  Object.keys(keys).forEach(code => { keys[code] = false; });
  joyPointerId = null; joyX = 0; joyY = 0;
});

if (renderer?.domElement) {
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', event => {
    if (!fpsMode.value || event.button > 0) return;
    lookPointerId = event.pointerId;
    lookLastX = event.clientX;
    lookLastY = event.clientY;
    lookMoved = false;
    tapStart = { x: event.clientX, y: event.clientY };
    if (event.pointerType === 'touch') event.preventDefault();
    try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* capture unsupported */ }
  });
  canvas.addEventListener('pointermove', event => {
    if (!fpsMode.value || event.pointerId !== lookPointerId) return;
    const dx = event.clientX - lookLastX;
    const dy = event.clientY - lookLastY;
    if (Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y) > 8) lookMoved = true;
    if (lookMoved) lookBy(dx, dy);
    lookLastX = event.clientX;
    lookLastY = event.clientY;
    if (event.pointerType === 'touch') event.preventDefault();
  });
  canvas.addEventListener('pointerup', event => {
    if (event.pointerId !== lookPointerId) return;
    if (fpsMode.value && !lookMoved && tapStart) inspectAtPoint(event.clientX, event.clientY, canvas);
    lookPointerId = null;
    tapStart = null;
  });
  canvas.addEventListener('pointercancel', () => { lookPointerId = null; tapStart = null; });
}

function bindJoystick() {
  if (!joyZone || !knob) return;
  joyZone.style.touchAction = 'none';
  const update = (event) => {
    const rect = joyZone.getBoundingClientRect();
    const radius = Math.max(1, rect.width * 0.38);
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.min(Math.hypot(dx, dy), radius);
    const scale = distance ? distance / Math.hypot(dx, dy) : 0;
    const px = dx * scale;
    const py = dy * scale;
    joyX = px / radius;
    joyY = py / radius;
    knob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
  };
  joyZone.addEventListener('pointerdown', event => {
    if (!fpsMode.value || joyPointerId !== null) return;
    event.preventDefault();
    joyPointerId = event.pointerId;
    joyZone.setPointerCapture(event.pointerId);
    update(event);
  });
  joyZone.addEventListener('pointermove', event => {
    if (event.pointerId === joyPointerId) { event.preventDefault(); update(event); }
  });
  const release = event => {
    if (event.pointerId !== joyPointerId) return;
    joyPointerId = null; joyX = 0; joyY = 0;
    knob.style.transform = 'translate(-50%, -50%)';
  };
  joyZone.addEventListener('pointerup', release);
  joyZone.addEventListener('pointercancel', release);
}
bindJoystick();

playOverlay?.addEventListener('pointerdown', event => {
  // Dismiss the instruction card on touch/click without requiring a second gesture.
  if (event.target === playOverlay || event.target.closest('.card')) {
    playOverlay.classList.remove('visible');
  }
});
document.getElementById('btn-action')?.addEventListener('click', () => {
  if (!fpsMode.value) return;
  if (!toggleNearbyCabinet()) inspeccionarFPS();
});

function irAEquipo(camKey, cams) {
  teleportMenu?.classList.remove('visible');
  if (!fpsMode.value || !cams?.[camKey]) return;
  const target = cams[camKey][1];
  const offsets = {
    sala: [0, 0, 6], gab1: [-2, 0, 3], gab2: [2, 0, 3],
    campo: [0, 0, 3], filtros: [0, 0, 6], interc: [0, 0, 6], bombas: [0, 0, 5]
  };
  const offset = offsets[camKey] || [0, 0, 5];
  player.pos.set(target[0] + offset[0], player.height, target[2] + offset[2]);
  player.vel.set(0, 0, 0);
  player.yaw = Math.atan2(-(target[0] - player.pos.x), -(target[2] - player.pos.z));
  player.pitch = -0.1;
}

function toggleNearbyCabinet() {
  if (typeof estadoPuertas === 'undefined') return false;
  const candidates = [
    { key: 'gab1', x: -2, z: 22.58 },
    { key: 'gab2', x: 2, z: 22.58 }
  ];
  let nearest = null;
  let nearestDistance = Infinity;
  candidates.forEach(cabinet => {
    const distance = Math.hypot(player.pos.x - cabinet.x, player.pos.z - cabinet.z);
    if (distance < nearestDistance) { nearest = cabinet; nearestDistance = distance; }
  });
  if (!nearest || nearestDistance > 3.2) return false;
  estadoPuertas[nearest.key] = !estadoPuertas[nearest.key];
  return true;
}

function viajarAObjetoAim() {
  if (!hoveredId || typeof reg === 'undefined' || !reg[hoveredId]) return;
  const box = new THREE.Box3().setFromObject(reg[hoveredId][0]);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.length() * 1.5, 2.5);
  player.pos.set(center.x + distance, player.height, center.z + distance);
  player.vel.set(0, 0, 0);
  player.yaw = Math.atan2(-(center.x - player.pos.x), -(center.z - player.pos.z));
  player.pitch = -0.15;
}

function inspectAtPoint(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
  fpsRay.setFromCamera(ndc, camera);
  fpsRay.far = 12;
  const hits = fpsRay.intersectObjects(pickables, false);
  if (hits.length) handlePickedObject(hits[0].object);
}
function handlePickedObject(object) {
  const id = object?.userData?.renglon;
  if (id && typeof seleccionar === 'function') seleccionar(id);
  else {
    const poi = object?.userData?.poiData || object?.parent?.userData;
    if (poi?.esPOI) {
      document.getElementById('i-tag').textContent = `📖 ${poi.titulo}`;
      document.getElementById('i-desc').textContent = poi.texto;
      document.getElementById('i-meta').textContent = 'Punto de Interés del Proceso';
    }
  }
}
function inspeccionarFPS() {
  if (hoveredId && typeof seleccionar === 'function') { seleccionar(hoveredId); return; }
  fpsRay.setFromCamera(centerNDC, camera);
  fpsRay.far = 12;
  const hits = fpsRay.intersectObjects(pickables, false);
  if (hits.length) handlePickedObject(hits[0].object);
}

function actualizarFPS(dt) {
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const wish = new THREE.Vector3();
  if (keys.KeyW || keys.ArrowUp) wish.add(forward);
  if (keys.KeyS || keys.ArrowDown) wish.sub(forward);
  if (keys.KeyD || keys.ArrowRight) wish.add(right);
  if (keys.KeyA || keys.ArrowLeft) wish.sub(right);
  if (joyY) wish.addScaledVector(forward, -joyY);
  if (joyX) wish.addScaledVector(right, joyX);
  if (wish.lengthSq() > 1) wish.normalize();

  const running = keys.ShiftLeft || keys.ShiftRight || Math.hypot(joyX, joyY) > 0.82;
  const speed = player.speed * (running ? player.runMult : 1);
  const acceleration = player.onGround ? 14 : 4;
  player.vel.x += (wish.x * speed - player.vel.x) * Math.min(1, acceleration * dt);
  player.vel.z += (wish.z * speed - player.vel.z) * Math.min(1, acceleration * dt);
  if (keys.Space && player.onGround) { player.vel.y = player.jumpVel; player.onGround = false; }
  player.vel.y += player.gravity * dt;

  const next = player.pos.clone();
  next.x += player.vel.x * dt;
  if (colisiona(next.x, player.pos.y, player.pos.z)) { next.x = player.pos.x; player.vel.x = 0; }
  next.z += player.vel.z * dt;
  if (colisiona(next.x, player.pos.y, next.z)) { next.z = player.pos.z; player.vel.z = 0; }
  next.y += player.vel.y * dt;
  if (colisiona(next.x, next.y, next.z)) {
    if (player.vel.y < 0) player.onGround = true;
    next.y = player.pos.y; player.vel.y = 0;
  } else if (player.vel.y < -0.5) player.onGround = false;
  next.x = THREE.MathUtils.clamp(next.x, -75, 75);
  next.z = THREE.MathUtils.clamp(next.z, -20, 48);
  player.pos.copy(next);
  if (player.pos.y < player.height) { player.pos.y = player.height; player.vel.y = 0; player.onGround = true; }

  camera.position.copy(player.pos);
  const direction = new THREE.Vector3(
    -Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch)
  );
  camera.lookAt(player.pos.clone().add(direction));
  if (fpsBar) fpsBar.style.transform = `scaleX(${Math.min(1, Math.hypot(player.vel.x, player.vel.z) / 9)})`;

  if (pickables?.length) {
    fpsRay.setFromCamera(centerNDC, camera);
    fpsRay.far = 10;
    const hits = fpsRay.intersectObjects(pickables, false);
    hoveredId = hits.length ? hits[0].object.userData.renglon : null;
    const tag = document.getElementById('i-tag');
    const desc = document.getElementById('i-desc');
    const meta = document.getElementById('i-meta');
    if (hoveredId && MAP[hoveredId]) {
      if (tag) tag.textContent = `Renglón ${hoveredId} · T viajar · E inspeccionar`;
      if (desc) desc.textContent = MAP[hoveredId].d;
      if (meta) meta.textContent = `Unidad: ${MAP[hoveredId].u} · Cómputo: ${MAP[hoveredId].q}`;
    } else {
      if (tag) tag.textContent = 'Modo primera persona';
      if (desc) desc.textContent = isTouchDevice ? 'Joystick para moverte · arrastra para mirar · toca para inspeccionar.' : 'WASD para moverte · arrastra para mirar · E para inspeccionar.';
      if (meta) meta.textContent = '';
    }
  }
}

function colisiona(x, y, z) {
  const feet = y - player.height;
  for (const collider of colliders) {
    if (x + player.radius > collider.minX && x - player.radius < collider.maxX &&
        z + player.radius > collider.minZ && z - player.radius < collider.maxZ &&
        y > collider.minY && feet < collider.maxY) return true;
  }
  return false;
}
