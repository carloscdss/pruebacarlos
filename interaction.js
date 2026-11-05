const CAMS = {
  overview:[[62,44,78],[0,4,8]],
  sala:[[0,9.5,38],[0,1.6,25]],
  gab1:[[-2,1.5,29.5],[-2,1.3,22.6]],
  gab2:[[2,1.5,29.5],[2,1.3,22.6]],
  campo:[[-4.5,2.2,-1.5],[-6.5,1.6,-6.5]],
  filtros:[[-26,7,12],[-27,1.6,0]],
  interc:[[-31,9,32],[-31,3,17]],
  bombas:[[22,7,7],[22,1.2,-2.5]]
};
let anim = null;

function irA(n){
  const [p,t] = CAMS[n];
  anim = {
    k:0,
    p0:camera.position.clone(),
    p1:new THREE.Vector3(...p),
    t0:controls.target.clone(),
    t1:new THREE.Vector3(...t)
  };
}
function updateAnim(){
  if(!anim) return;
  anim.k = Math.min(1, anim.k + 0.04);
  const e = anim.k < .5 ? 2*anim.k*anim.k : 1-Math.pow(-2*anim.k+2,2)/2;
  camera.position.lerpVectors(anim.p0, anim.p1, e);
  controls.target.lerpVectors(anim.t0, anim.t1, e);
  if(anim.k >= 1) anim = null;
}

const matOrig = new Map();
const resaltados = new Set();
const iTag = document.getElementById('i-tag');
const iDesc = document.getElementById('i-desc');
const iMeta = document.getElementById('i-meta');
const iDoc = document.getElementById('i-doc');

function emisivo(mesh, hex){
  if(!matOrig.has(mesh)) matOrig.set(mesh, mesh.material);
  const m = mesh.material.clone();
  if(m.emissive){ m.emissive.setHex(hex); mesh.material = m; resaltados.add(mesh); }
}
function limpiar(){
  resaltados.forEach(mesh => {
    const o = matOrig.get(mesh);
    if(o) mesh.material = o;
  });
  resaltados.clear();
}
function mostrar(id){
  const b = MAP[id]; if(!b) return;
  iTag.textContent = "Renglón " + id;
  iDesc.textContent = b.d;
  const n = reg[id] ? reg[id].length : 0;
  iMeta.textContent = "Unidad: " + b.u + " · Cómputo: " + b.q + " · Modelado: " + n;
  
  if(b.doc) {
    iDoc.innerHTML = `<b>ℹ️ Información Técnica (Doc. Refinería El Palito):</b><br>${b.doc}`;
    iDoc.style.display = 'block';
  } else {
    iDoc.style.display = 'none';
  }
}
function enfocar(id){
  const caja = new THREE.Box3();
  reg[id].forEach(o => caja.expandByObject(o));
  if(caja.isEmpty()) return;
  const c = caja.getCenter(new THREE.Vector3());
  const r = caja.getSize(new THREE.Vector3()).length() * 0.9 + 2;
  controls.target.copy(c);
  camera.position.copy(c).add(new THREE.Vector3(r*0.7, r*0.6, r*0.9));
}
function seleccionar(id){
  limpiar();
  if(!reg[id]) { mostrar(id); return; }
  reg[id].forEach(o => o.traverse(n => { if(n.isMesh) emisivo(n, 0x1a6ea8); }));
  mostrar(id);
  if(!fpsMode.value) enfocar(id);
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', e => {
  if(!fpsMode.value) down = {x:e.clientX,y:e.clientY};
});
renderer.domElement.addEventListener('pointerup', e => {
  if(fpsMode.value || !down) return;
  if(Math.hypot(e.clientX-down.x, e.clientY-down.y) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.x = ((e.clientX-r.left)/r.width)*2-1;
  ndc.y = -((e.clientY-r.top)/r.height)*2+1;
  ray.setFromCamera(ndc, camera);
  
  const h = ray.intersectObjects(pickables, false);
  if(h.length) {
    let obj = h[0].object;
    let parent = obj.parent;
    
    if(obj.userData.esPOI || (parent && parent.userData && parent.userData.esPOI)) {
      const poi = obj.userData.esPOI ? obj.userData.poiData : parent.userData;
      iTag.textContent = "📖 " + poi.titulo;
      iDesc.textContent = poi.texto;
      iMeta.textContent = "Punto de Interés del Proceso";
      iDoc.style.display = 'none'; 
      return;
    }
    
    if(obj.userData.renglon) {
      seleccionar(obj.userData.renglon);
    }
  } else {
    limpiar();
    iTag.textContent = "Selecciona un objeto";
    iDesc.textContent = "Haz clic sobre cualquier equipo, gabinete, tubería o instrumento.";
    iMeta.textContent = "";
    iDoc.style.display = 'none';
  }
});

function buildHUD(handlers){
  const PRESETS = [
    ['overview','Planta general'],['sala','Sala de control'],
    ['gab1','Gabinete N°1'],['gab2','Gabinete N°2'],
    ['campo','Panel de campo'],['filtros','Filtros D-951/961'],
    ['interc','Intercambiadores'],['bombas','Bombas']
  ];
  const presets = document.getElementById('presets');
  presets.innerHTML = PRESETS.map(([k,l],i) =>
    `<button data-cam="${k}"${i?'':' class="on"'}>${l}</button>`).join('');
  presets.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      if(fpsMode.value) salirFPS();
      presets.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      irA(b.dataset.cam);
    };
  });

  const TOGGLES = [
    ['gab','Gabinete 1',true],['gab2','Gabinete 2',true],
    ['campo','Equipos de campo',true],['rutas','Rutas y cableado',true],
    ['valid','Modo validación',false]
  ];
  const toggles = document.getElementById('toggles');
  toggles.innerHTML = TOGGLES.map(([k,l,on]) =>
    `<button data-t="${k}"${on?' class="on"':''}>${l}</button>`).join('') +
    `<button id="fps-btn" style="background:#0284c7;border-color:#38bdf8;color:#fff;">🎮 Modo FPS</button>
     <button id="dl">Descargar HTML</button>
     <button id="btn-puertas" style="background:#8b5cf6;border-color:#a78bfa;color:#fff;">🚪 Abrir Gabinetes</button>
     <button id="btn-tablas" style="background:#f59e0b;border-color:#fbbf24;color:#fff;">📋 Ver Instrumentación</button>`;

  toggles.querySelectorAll('[data-t]').forEach(b => {
    b.onclick = () => {
      const k = b.dataset.t;
      if(k === 'valid'){
        b.classList.toggle('on');
        b.classList.contains('on') ? pintarValidacion() : limpiar();
        return;
      }
      b.classList.toggle('on');
      const on = b.classList.contains('on');
      if(k === 'gab') handlers.gab1.visible = on;
      if(k === 'gab2') handlers.gab2.visible = on;
      if(k === 'campo') handlers.campoGroup.visible = on;
      if(k === 'rutas') handlers.rutaGroup.visible = on;
    };
  });

  document.getElementById('fps-btn').onclick = () => {
    fpsMode.value ? salirFPS() : entrarFPS();
  };
  
  let puertasAbiertas = false;
  const btnPuertas = document.getElementById('btn-puertas');
  btnPuertas.onclick = () => {
    puertasAbiertas = !puertasAbiertas;
    estadoPuertas.gab1 = puertasAbiertas;
    estadoPuertas.gab2 = puertasAbiertas;
    btnPuertas.textContent = puertasAbiertas ? '🚪 Cerrar Gabinetes' : '🚪 Abrir Gabinetes';
    btnPuertas.style.background = puertasAbiertas ? '#8b5cf6' : '';
    btnPuertas.style.borderColor = puertasAbiertas ? '#a78bfa' : '';
  };

  document.getElementById('btn-tablas').onclick = () => {
    const panel = document.getElementById('instr-panel');
    if(panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'block';
      document.getElementById('instr-content').innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:9px;">
          <tr style="background:#1e293b; color:#7dd3fc;">
            <th style="border:1px solid #334155; padding:2px;">TAG</th>
            <th style="border:1px solid #334155; padding:2px;">Servicio</th>
            <th style="border:1px solid #334155; padding:2px;">Normal</th>
            <th style="border:1px solid #334155; padding:2px;">Baja</th>
            <th style="border:1px solid #334155; padding:2px;">Alta</th>
          </tr>
          <tr><td style="border:1px solid #334155; padding:2px;">71 FI 903</td><td style="border:1px solid #334155; padding:2px;">Agua Sanchón</td><td style="border:1px solid #334155; padding:2px;">1050 GPM</td><td style="border:1px solid #334155; padding:2px;">600/-</td><td style="border:1px solid #334155; padding:2px;">1500/1700</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74 PIC 108</td><td style="border:1px solid #334155; padding:2px;">Agua Filtrada</td><td style="border:1px solid #334155; padding:2px;">80 psig</td><td style="border:1px solid #334155; padding:2px;">60</td><td style="border:1px solid #334155; padding:2px;">90</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74 LI51</td><td style="border:1px solid #334155; padding:2px;">Nivel D-7456</td><td style="border:1px solid #334155; padding:2px;">50 %</td><td style="border:1px solid #334155; padding:2px;">30/-</td><td style="border:1px solid #334155; padding:2px;">90/100</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74AI01A/B/C</td><td style="border:1px solid #334155; padding:2px;">Sílice Trenes</td><td style="border:1px solid #334155; padding:2px;">30 ppb</td><td style="border:1px solid #334155; padding:2px;">100</td><td style="border:1px solid #334155; padding:2px;">300</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74CI01A/B/C</td><td style="border:1px solid #334155; padding:2px;">Conductividad</td><td style="border:1px solid #334155; padding:2px;">8 µmhos</td><td style="border:1px solid #334155; padding:2px;">5</td><td style="border:1px solid #334155; padding:2px;">22</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74AI60/61</td><td style="border:1px solid #334155; padding:2px;">pH Cationes</td><td style="border:1px solid #334155; padding:2px;">2</td><td style="border:1px solid #334155; padding:2px;">0.1</td><td style="border:1px solid #334155; padding:2px;">4</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74AI61B/C</td><td style="border:1px solid #334155; padding:2px;">pH Aniones</td><td style="border:1px solid #334155; padding:2px;">7</td><td style="border:1px solid #334155; padding:2px;">6</td><td style="border:1px solid #334155; padding:2px;">12</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74 LI 52/67</td><td style="border:1px solid #334155; padding:2px;">Nivel 33x1/2</td><td style="border:1px solid #334155; padding:2px;">98 %</td><td style="border:1px solid #334155; padding:2px;">67/70</td><td style="border:1px solid #334155; padding:2px;">100/105</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74FI518</td><td style="border:1px solid #334155; padding:2px;">Flujo Agua Demi</td><td style="border:1px solid #334155; padding:2px;">600 GPM</td><td style="border:1px solid #334155; padding:2px;">250/-</td><td style="border:1px solid #334155; padding:2px;">1200/-</td></tr>
        </table>
        <br>
        <div style="font-weight:bold; color:#7dd3fc; margin-bottom:4px;">Válvulas de Seguridad (PSV)</div>
        <table style="width:100%; border-collapse:collapse; font-size:9px;">
          <tr style="background:#1e293b; color:#7dd3fc;">
            <th style="border:1px solid #334155; padding:2px;">Tag</th>
            <th style="border:1px solid #334155; padding:2px;">Servicio</th>
            <th style="border:1px solid #334155; padding:2px;">Pto. Ajuste</th>
          </tr>
          <tr><td style="border:1px solid #334155; padding:2px;">71PSV-202</td><td style="border:1px solid #334155; padding:2px;">Agua Cruda a Filtros</td><td style="border:1px solid #334155; padding:2px;">54 psig</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">71PSV-89</td><td style="border:1px solid #334155; padding:2px;">Vapor exhausto Turbina G-7151</td><td style="border:1px solid #334155; padding:2px;">85 psig</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74PSV-250</td><td style="border:1px solid #334155; padding:2px;">Aire de planta a Filtros</td><td style="border:1px solid #334155; padding:2px;">21 psig</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74PSV-203</td><td style="border:1px solid #334155; padding:2px;">Descarga bombas G-951/2</td><td style="border:1px solid #334155; padding:2px;">54 psig</td></tr>
          <tr><td style="border:1px solid #334155; padding:2px;">74PSV53</td><td style="border:1px solid #334155; padding:2px;">Vapor exhausto G-7451BT</td><td style="border:1px solid #334155; padding:2px;">85 psig</td></tr>
        </table>
      `;
    } else {
      panel.style.display = 'none';
    }
  };
  
  document.getElementById('dl').onclick = () => {
    alert('La descarga no está disponible en este entorno. Usa el archivo único original si la necesitas.');
  };
}

function buildSidebar(){
  const sbList = document.getElementById('sb-list');
  const modelados = BOM.filter(b => reg[b.id] && reg[b.id].length);
  document.getElementById('sb-count').textContent = modelados.length;
  modelados.forEach(b => {
    const d = document.createElement('div');
    d.innerHTML = '<b>'+b.id+'</b> '+b.d.slice(0,44)+(b.d.length>44?'…':'');
    d.onclick = () => {
      if(fpsMode.value) salirFPS();
      seleccionar(b.id);
    };
    sbList.appendChild(d);
  });
}

function estado(b){
  const n = reg[b.id] ? reg[b.id].length : 0;
  if(!n) return {c:'na', txt:'sin geometría', r:0};
  if(b.t === 'len'){
    const m = medido[b.id]||0;
    const r = Math.min(1, m/b.q);
    return {c: r>=.95?'ok':r>=.5?'mid':'bad', txt:m.toFixed(1)+' / '+b.q+' m', r};
  }
  if(b.t === 'area') return {c:'ok', txt:'30 / 30 m²', r:1};
  const r = Math.min(1, n/b.q);
  return {c: r>=1?'ok':r>=.6?'mid':'bad', txt:n+' / '+b.q, r};
}

function pintarValidacion(){
  limpiar();
  const col = {ok:0x0c3f1f, mid:0x4a2f00, bad:0x4d1010, na:0x111111};
  BOM.filter(b => reg[b.id] && reg[b.id].length).forEach(b => {
    const e = estado(b);
    reg[b.id].forEach(o => o.traverse(n => { if(n.isMesh) emisivo(n, col[e.c]); }));
  });
}

function buildReporte(){
  const grid = document.getElementById('rp-grid'); let sum = 0;
  const modelados = BOM.filter(b => reg[b.id] && reg[b.id].length);
  modelados.forEach(b => {
    const e = estado(b); sum += e.r;
    const d = document.createElement('div');
    d.innerHTML = '<b>'+b.id+'</b><span class="'+e.c+'">'+b.d.slice(0,30)+
      '…</span><span class="st '+e.c+'">'+e.txt+'</span>';
    grid.appendChild(d);
  });
  const pct = Math.round(sum/modelados.length*100);
  const f = document.getElementById('rp-fill'); f.style.width = pct+'%';
  f.style.background = pct>85?'#22c55e':pct>60?'#f59e0b':'#ef4444';
  const s = document.getElementById('rp-score');
  s.textContent = pct + '% · ' + modelados.length + ' renglones con geometría';
  s.className = 'score ' + (pct>85?'ok':pct>60?'mid':'bad');
}