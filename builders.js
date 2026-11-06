/* =====================================================================
   BUILDERS — construcción de sala, gabinetes, campo, rutas
   ===================================================================== */

const RX0=-5, RX1=5, RZ0=22, RZ1=28, RH=3.3;
const lucesSala = [];
const puertas = { gab1: null, gab2: null };
const estadoPuertas = { gab1: false, gab2: false };

function buildTerreno(){
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 280), M.suelo);
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(126, 66), M.concreto);
  pad.rotation.x = -Math.PI/2; pad.position.set(-4, 0.02, 6);
  pad.receiveShadow = true; scene.add(pad);
  const via = new THREE.Mesh(new THREE.PlaneGeometry(160, 9), M.asfalto);
  via.rotation.x = -Math.PI/2; via.position.set(0, 0.03, 37);
  via.receiveShadow = true; scene.add(via);
  const g = grupo(0,0,0);
  for(let x=-72; x<=72; x+=6){ cyl(0.07,0.07,2.4,M.galv,x,1.2,-18,g,6); cyl(0.07,0.07,2.4,M.galv,x,1.2,46,g,6); }
  for(let z=-18; z<=46; z+=6){ cyl(0.07,0.07,2.4,M.galv,-72,1.2,z,g,6); cyl(0.07,0.07,2.4,M.galv,72,1.2,z,g,6); }
}

function buildSala(){
  const sala = grupo(0,0,0);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(10,6), M.epoxi);
  piso.rotation.x = -Math.PI/2; piso.position.set(0,0.06,25); piso.receiveShadow = true;
  tag(piso,"4.2"); med("4.2",30); sala.add(piso);
  box(10.4,0.06,6.4,M.concreto,0,0.03,25,sala);

  box(10.7,0.3,6.7,M.techo,0,RH+0.15,25,sala);
  const muro = (w,d,x,z) => box(w,RH,d,M.pared,x,RH/2+0.06,z,sala);
  muro(0.26,6.7,RX0-0.13,25); muro(0.26,6.7,RX1+0.13,25); muro(10.7,0.26,0,RZ0-0.13);
  box(3.95,RH,0.26,M.pared,-3.05,RH/2+0.06,RZ1+0.13,sala);
  box(3.95,RH,0.26,M.pared, 3.05,RH/2+0.06,RZ1+0.13,sala);
  box(2.8,RH-2.2,0.26,M.pared,0,2.2+(RH-2.2)/2+0.06,RZ1+0.13,sala);
  box(11,0.55,7,M.paredExt,0,0.4,25,sala);

  const puertaG = grupo(0,0,RZ1+0.13);
  box(1.1,2.2,0.09,M.acero,0,1.16,0,puertaG);
  box(0.9,1.95,0.02,M.pintEp,0,1.15,0.06,puertaG);
  box(0.05,0.16,0.06,M.acero,0.4,1.06,0.09,puertaG);
  sala.add(puertaG);
  box(1.3,0.09,0.24,M.concreto,0,0.1,RZ1+0.3,sala);

  box(0.16,1.2,2.3,M.acero,RX0-0.1,1.78,24.2,sala);
  const vd = new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.1), M.vidrio);
  vd.rotation.y = Math.PI/2; vd.position.set(RX0-0.02,1.78,24.2); sala.add(vd);

  [[-2.6,24],[-2.6,26],[0,24],[0,26],[2.6,24],[2.6,26]].forEach(([x,z]) => {
    tag(box(0.74,0.05,0.74,M.acero,x,RH-0.05,z,sala),"4.5");
    const dif = new THREE.Mesh(new THREE.PlaneGeometry(0.64,0.64), M.ledOn);
    dif.rotation.x = Math.PI/2; dif.position.set(x,RH-0.08,z); sala.add(dif);
    const p = new THREE.PointLight(0xf2f8ff, 0.6, 8, 2);
    p.position.set(x,RH-0.4,z); sala.add(p); lucesSala.push(p);
  });
  [[-4.55,22.6],[4.55,27.4]].forEach(([x,z]) => {
    tag(box(0.26,0.12,0.12,M.blanco,x,2.6,z,sala),"4.5");
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.08), M.ledV);
    l.position.set(x,2.6,z+0.07); sala.add(l);
  });
  [[-4.75,23.2],[-4.75,26.8],[4.75,23.4],[4.75,27.0]]
    .forEach(([x,z]) => tag(box(0.09,0.16,0.12,M.blanco,x,1.05,z,sala),"4.5"));

  const panelEl = grupo(RX1-0.13,0,23.4);
  box(0.18,0.9,0.62,M.gabinete,0,1.7,0,panelEl);
  box(0.02,0.8,0.52,M.blanco,-0.1,1.7,0,panelEl);
  for(let i=0;i<7;i++) box(0.03,0.09,0.13,M.negro,-0.12,2.0-i*0.1,0,panelEl);
  tag(panelEl,"4.6"); sala.add(panelEl);

  (function(){
    const g = grupo(RX1-0.5,2.5,24.6); g.rotation.y = -Math.PI/2;
    box(1.05,0.32,0.24,M.blanco,0,0,0,g);
    box(1.0,0.06,0.07,M.negro,0,-0.19,0.1,g);
    for(let i=-5;i<=5;i++) box(0.018,0.17,0.02,M.blanco,i*0.09,0.03,0.13,g);
    box(0.1,0.1,0.1,M.acero,0.44,0.21,-0.05,g);
    cyl(0.024,0.024,0.45,M.cobre,0.44,0.46,-0.05,g,8);
    cyl(0.024,0.024,0.45,M.pvc,0.33,0.46,-0.05,g,8);
    tag(g,"4.4"); sala.add(g);
    const ev = grupo(RX1+0.62,0.36,24.6);
    box(0.84,0.66,0.3,M.blanco,0,0,0,ev);
    for(let i=-3;i<=3;i++) box(0.07,0.02,0.28,M.blanco,i*0.1,0.32,0,ev);
    const h = cyl(0.13,0.13,0.04,M.negro,0,0.15,0.16,ev,16); h.rotation.x = Math.PI/2;
    sala.add(ev);
  })();

  (function(){
    const g = grupo(3.9,0,27.4);
    box(0.64,1.3,0.8,M.negro,0,0.65,0,g);
    box(0.52,0.36,0.02,M.pantalla,0,1.05,0.41,g);
    [-0.12,0,0.12].forEach((dx,i) => box(0.07,0.05,0.02, i===0?M.ledV:M.ledA, dx,0.8,0.41,g));
    box(0.44,0.05,0.52,M.acero,0,0.02,0,g);
    tag(g,"7.3"); sala.add(g);
  })();

  (function(){
    const g = grupo(3.5,0,24.3);
    box(1.55,0.06,0.74,M.blanco,0,0.75,0,g);
    [[-0.68,-0.3],[0.68,-0.3],[-0.68,0.3],[0.68,0.3]]
      .forEach(([x,z]) => box(0.06,0.75,0.06,M.acero,x,0.38,z,g));
    box(1.55,0.44,0.04,M.pintEp,0,0.55,-0.35,g);
    box(0.64,0.4,0.03,M.negro,0,1.07,-0.16,g);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.36), M.pantalla);
    s.position.set(0,1.07,-0.14); g.add(s);
    box(0.2,0.02,0.16,M.negro,0,0.79,-0.2,g);
    box(0.44,0.015,0.14,M.negro,0,0.785,0.16,g);
    box(0.06,0.02,0.09,M.negro,0.33,0.785,0.16,g);
    tag(g,"7.4"); sala.add(g);
    const silla = grupo(3.5,0,25.6);
    cyl(0.24,0.24,0.05,M.negro,0,0.46,0,silla,16);
    box(0.42,0.42,0.05,M.negro,0,0.74,-0.2,silla);
    cyl(0.03,0.03,0.4,M.acero,0,0.24,0,silla,8);
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      const p=box(0.24,0.03,0.04,M.acero,Math.cos(a)*0.12,0.05,Math.sin(a)*0.12,silla);
      p.rotation.y=-a;
    }
    sala.add(silla);
  })();

  (function(){
    const g = grupo(-3.6,0,24.2);
    box(1.25,0.06,0.64,M.blanco,0,0.75,0,g);
    [[-0.54,-0.26],[0.54,-0.26],[-0.54,0.26],[0.54,0.26]]
      .forEach(([x,z]) => box(0.05,0.75,0.05,M.acero,x,0.38,z,g));
    box(0.44,0.03,0.32,M.acero,0,0.79,0,g);
    box(0.42,0.02,0.3,M.negro,0,0.81,0.02,g);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.38,0.26), M.pantalla);
    s.rotation.x = -Math.PI/2+0.4; s.position.set(0,0.87,0.03); g.add(s);
    tag(g,"7.5"); sala.add(g);
  })();

  (function(){
    const g = grupo(-4.85,0,26.9); g.rotation.y = Math.PI/2;
    tag(box(0.95,0.09,0.06,M.cobre,0,1.4,0,g),"4.8");
    for(let i=-2;i<=2;i++) cyl(0.03,0.03,0.06,M.negro,i*0.2,1.34,0,g,8);
    const g2 = grupo(-4.85,0,26.3); g2.rotation.y = Math.PI/2;
    tag(box(0.95,0.09,0.06,M.cobre,0,1.4,0,g2),"4.9");
    sala.add(g); sala.add(g2);
    tag(box(0.06,0.62,0.04,M.cable,-4.82,1.08,26.6,sala),"5.7");
  })();

  (function(){
    [[6.4,21.2],[6.4,25],[6.4,29]].forEach(([x,z]) => {
      const g = grupo(x,0,z);
      tag(cyl(0.06,0.06,2.6,M.cobre,0,1.3,0,g,10),"4.11");
      box(0.44,0.15,0.44,M.concreto,0,0.075,0,g);
      box(0.36,0.03,0.36,M.acero,0,0.17,0,g);
    });
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.9,2.6,26.9), new THREE.Vector3(-6.5,2.6,26.9),
      new THREE.Vector3(-7.4,1.4,26.9), new THREE.Vector3(-7.4,0.35,26.9),
      new THREE.Vector3(-7.4,0.35,25.0), new THREE.Vector3(-7.4,0.35,21.2)
    ]);
    const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, 48, 0.036, 6, false), M.cable);
    tubo.castShadow = true; tag(tubo,"4.10"); med("4.10",9.9); sala.add(tubo);
  })();

  (function(){
    const g = grupo(RX1-0.13,0,22.6);
    box(0.18,0.52,0.44,M.gabinete,0,1.95,0,g);
    for(let i=0;i<4;i++) box(0.03,0.42,0.07,M.ambar,-0.1,1.95,-0.15+i*0.1,g);
    tag(g,"4.13"); sala.add(g);
  })();

  for(let i=0;i<6;i++){
    const g = grupo(-2.5+i*1.0,0,RZ0-0.13);
    tag(box(0.36,0.36,0.32,M.rojo,0,2.6,0,g),"4.3");
    box(0.16,0.16,0.36,M.negro,0,2.6,0,g);
  }
  return sala;
}

// =========================================================================
// GABINETE AUTOPORTANTE (ESCANEADO DEL CSS 3D)
// =========================================================================
function gabinete(x, tipo){
  const g = grupo(x,0,RZ0+0.58);
  
  // Medidas exactas basadas en la simulación (escala 1 unidad = 1 metro aprox)
  const W = 0.8, H = 2.0, D = 0.8;
  const zocaloH = 0.13;

  // 1. ZÓCALO INFERIOR (Base negra industrial)
  box(W, zocaloH, D, M.negro, 0, zocaloH/2, 0, g);
  // Detalle de tornillos del zócalo
  [[-0.25,-0.25],[0.25,-0.25]].forEach(([dx,dz]) => cyl(0.015,0.015,0.01,M.acero,dx,zocaloH-0.01,dz,g,8));

  // 2. CUERPO METÁLICO (Paredes)
  const yBase = zocaloH;
  // Pared Izquierda
  tag(box(0.04, H, D, M.gabinete, -W/2, yBase + H/2, 0, g), tipo==='a'?"5.1":"6.1");
  // Pared Derecha (con rejilla)
  tag(box(0.04, H, D, M.gabinete, W/2, yBase + H/2, 0, g), tipo==='a'?"5.1":"6.1");
  // Pared Trasera
  tag(box(W, H, 0.04, M.gabinete, 0, yBase + H/2, -D/2, g), tipo==='a'?"5.1":"6.1");
  
  // 3. REJILLAS DE VENTILACIÓN (En la pared derecha, como en el CSS)
  for(let i=0; i<5; i++){
    const yLouver = yBase + 0.3 + i*0.05;
    box(0.02, 0.02, 0.2, M.negro, W/2 + 0.01, yLouver, D/2 - 0.15, g); // Lado derecho
  }

  // 4. TECHO (Con Cáncamos de izamiento)
  box(W, 0.04, D, M.gabinete, 0, yBase + H, 0, g);
  // Cáncamos (Aros metálicos)
  [[-0.25, -0.25], [0.25, -0.25]].forEach(([dx, dz]) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), M.acero);
    t.rotation.x = Math.PI/2;
    t.position.set(dx, yBase + H + 0.04, dz);
    g.add(t);
  });

  // 5. INTERIOR (Placa de montaje)
  tag(box(W-0.1, H-0.1, 0.02, M.pintEp, 0, yBase + H/2, -D/2 + 0.05, g), tipo==='a'?"5.1":"6.1");
  
  // Etiqueta del gabinete
  const p = rotulo("GABINETE N° "+(tipo==='a'?1:2), 0.35, 0.08);
  p.position.set(0, yBase + H + 0.08, D/2); g.add(p); tag(p,"7.8");

  // Luz interior
  const luz = new THREE.PointLight(0xeaf6ff, 1.5, 3.0, 2);
  luz.position.set(0, yBase + H/2, 0); g.add(luz);

  // --- Componentes internos ---
  const zFrente = -D/2 + 0.1; 

  if(tipo === 'a'){
    // PLC
    const y = 1.75;
    [y, y-0.5].forEach(yy => {
      tag(box(0.5,0.18,0.12,M.filtro,0,yy,zFrente,g),"5.8");
      for(let i=0;i<5;i++) box(0.08,0.15,0.08, i<2?M.azul:M.verde, -0.2+i*0.1, yy, zFrente+0.04, g);
    });
    // Módulos E/S
    [["5.12",0.25,M.verde],["5.12",0.15,M.verde],["5.13",0.05,M.ambar],
     ["5.15",-0.05,M.azul],["5.17",-0.15,M.rojo],["5.19",-0.25,M.negro]].forEach(([id,dx,mat]) => {
      tag(box(0.08,0.15,0.08,mat,dx,y-0.5,zFrente,g),id);
    });
    // Rieles DIN
    [0.5, 0.9, 1.3, 1.7].forEach(yy => box(W-0.15, 0.03, 0.04, M.acero, 0, yy, zFrente-0.02, g));
  } else {
    // Gabinete 2: Marshalling
    for(let r=0;r<12;r++) for(let i=0;i<6;i++){
      box(0.06,0.06,0.08, r<6?M.azul:M.negro, -0.2+i*0.08, 1.8-r*0.1, zFrente, g);
    }
    for(let yy=0.5; yy<=1.8; yy+=0.2) box(W-0.15, 0.02, 0.03, M.acero, 0, yy, zFrente-0.02, g);
  }

  // 6. PUERTA DELANTERA (Con marco, ventana y cerradura)
  const puertaPivot = new THREE.Group();
  puertaPivot.position.set(-W/2, yBase, D/2); 
  g.add(puertaPivot);

  const puertaPanel = new THREE.Group();
  puertaPanel.position.set(W/2, H/2, 0); 
  puertaPivot.add(puertaPanel);

  // Hoja de la puerta (Gradiente simulado con relieve)
  tag(box(W-0.02, H-0.02, 0.04, M.gabinete, 0, 0, 0, puertaPanel), tipo==='a'?"5.1":"6.1");
  box(W-0.06, H-0.06, 0.02, M.pintEp, 0, 0, 0.02, puertaPanel);
  
  // Ventana de vidrio
  const v = new THREE.Mesh(new THREE.PlaneGeometry(W*0.6, H*0.4), M.vidrio);
  v.position.set(0, H*0.15, 0.032); puertaPanel.add(v);

  // Manilla industrial de palanca (Basada en el CSS)
  const manijaG = grupo(W/2 - 0.07, 0, 0.04, puertaPanel);
  box(0.04, 0.2, 0.04, M.negro, 0, 0, 0, manijaG); // Caja base
  box(0.02, 0.1, 0.06, M.acero, 0, 0.05, 0.03, manijaG); // Palanca

  // HMI montado en la puerta (Gabinete 1)
  if(tipo === 'a'){
    const hmiGroup = grupo(0, 0.5, 0.04, puertaPanel); 
    tag(box(0.3,0.2,0.03,M.negro,0,0,0,hmiGroup),"5.22");
    const hs = new THREE.Mesh(new THREE.PlaneGeometry(0.24,0.14), M.pantalla);
    hs.position.set(0,0,0.02); hmiGroup.add(hs);
  } else {
    // Porta-planos en la puerta (Gabinete 2)
    box(0.15, 0.2, 0.02, M.blanco, 0, 0.5, 0.04, puertaPanel);
    box(0.12, 0.03, 0.03, M.acero, 0, 0.62, 0.05, puertaPanel);
  }

  if(tipo === 'a') puertas.gab1 = puertaPivot;
  else puertas.gab2 = puertaPivot;

  return g;
}

function buildGabinetes(sala){
  const gab1 = gabinete(-2.0,'a');
  const gab2 = gabinete(2.0,'b');
  sala.add(gab1); sala.add(gab2);

  const g = grupo(0,2.4,RZ0+0.22);
  const c = cyl(0.05,0.05,3.6,M.galv,0,0,0.1,g,10);
  c.rotation.z = Math.PI/2;
  tag(c,"7.7"); med("7.7",3.6);
  box(0.12,0.12,0.12,M.galv,-0.5,0,0.1,g);
  box(0.12,0.12,0.12,M.galv,0.5,0,0.1,g);
  sala.add(g);
  tag(box(8.6,0.06,0.44,M.galv,0,2.82,RZ0+0.42,sala),"3.1");
  box(9.6,0.05,0.95,M.epoxi,0,0.09,27.4,sala);

  return { gab1, gab2 };
}

function buildRuta(){
  const rutaGroup = grupo(0,0,0);
  const RUTA = [
    new THREE.Vector3(-24,0,6), new THREE.Vector3(-24,5.0,6),
    new THREE.Vector3(0,5.0,6), new THREE.Vector3(0,5.0,21.4),
    new THREE.Vector3(0,3.4,21.4)
  ];
  function tramo(a,b,mat,radio,id){
    const dir = new THREE.Vector3().subVectors(b,a); const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radio,radio,len,8), mat);
    m.position.copy(a).addScaledVector(dir,0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    m.castShadow = true; rutaGroup.add(m);
    if(id){ tag(m,id); med(id,len); }
    return m;
  }
  const p = [];
  for(let x=-24;x<=0;x+=4) p.push([x,6]);
  for(let z=10;z<=21;z+=4) p.push([0,z]);
  p.forEach(([x,z]) => {
    const g = grupo(x,0,z);
    const poste = box(0.12,5.2,0.12,M.galv,0,2.6,0,g);
    tag(poste,"3.1"); med("3.1", 5.2*6.2);
    box(1.5,0.1,0.12,M.galv,0,5.0,0,g);
    box(1.5,0.1,0.12,M.galv,0,4.5,0,g);
    for(let i=-2;i<=2;i++) tag(box(0.07,0.09,0.07,M.galv,i*0.32,5.09,0,g),"3.8");
  });
  for(let i=0;i<RUTA.length-1;i++){
    const a = RUTA[i].clone(), b = RUTA[i+1].clone();
    const dir = new THREE.Vector3().subVectors(b,a); const len = dir.length();
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.66,0.05,len), M.galv);
    tray.position.copy(a).addScaledVector(dir,0.5);
    tray.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), dir.clone().normalize());
    tray.castShadow = true; rutaGroup.add(tray);
  }
  for(let i=0;i<RUTA.length-1;i++){
    const a = RUTA[i].clone(), b = RUTA[i+1].clone();
    const a1 = a.clone(); a1.y += 0.09; a1.x -= 0.19;
    const b1 = b.clone(); b1.y += 0.09; b1.x -= 0.19;
    tramo(a1,b1,M.galv,0.048,"3.2");
    const a2 = a.clone(); a2.y += 0.09; a2.x += 0.19;
    const b2 = b.clone(); b2.y += 0.09; b2.x += 0.19;
    tramo(a2,b2,M.galv,0.038,"3.2");
    [[-0.08,M.cableAz,"3.9"],[-0.02,M.cable,"3.9"],[0.04,M.cable,"3.10"],
     [0.1,M.cableGr,"3.10"],[0.16,M.fibra,"9.5"]].forEach(([dz,mat,id]) => {
      const c1 = a.clone(); c1.y -= 0.02; c1.z += dz;
      const c2 = b.clone(); c2.y -= 0.02; c2.z += dz;
      tramo(c1,c2,mat,0.016,id);
    });
  }
  [[-20,6],[-12,6],[-4,6]].forEach(([x,z]) =>
    tag(box(0.22,0.24,0.22,M.pvc,x,5.06,z,rutaGroup),"3.3"));
  [[0,12],[0,17]].forEach(([x,z]) =>
    tag(box(0.28,0.3,0.28,M.pvc,x,5.06,z,rutaGroup),"3.4"));
  for(let i=0;i<8;i++)
    tag(cyl(0.09,0.09,0.3,M.pvc,-0.19,5.06,7.4+i*1.9,rutaGroup,10),"3.5");
  for(let i=0;i<10;i++)
    tag(cyl(0.085,0.085,0.16,M.acero,-0.19,5.22,7.9+i*1.5,rutaGroup,10),"3.6");
  tag(cyl(0.1,0.1,0.2,M.galv,-0.19,3.2,21.4,rutaGroup,10),"3.7");
  tag(cyl(0.1,0.1,0.2,M.galv, 0.19,3.2,21.4,rutaGroup,10),"3.7");
  for(let i=0;i<10;i++)
    tag(box(0.05,0.09,0.05,M.blanco,-0.1,4.86,7+i*1.4,rutaGroup),"3.12");
  scene.add(rutaGroup);
  return rutaGroup;
}

function buildCampo(){
  const campoGroup = grupo(0,0,0);
  window.pois = [];

  const crearPOI = (x, y, z, titulo, texto) => {
    const g = grupo(x, y, z, campoGroup);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 8, 24), M.ledA);
    anillo.rotation.x = Math.PI / 2; g.add(anillo);
    const rayo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 8), M.ledA);
    rayo.position.y = -1; g.add(rayo);
    const luz = new THREE.PointLight(0xfbbf24, 1.5, 6); luz.position.set(0, 0.5, 0); g.add(luz);
    
    g.userData = { esPOI: true, titulo: titulo, texto: texto };
    g.traverse(o => { if(o.isMesh) { o.userData.esPOI = true; o.userData.poiData = g.userData; pickables.push(o); } });
    
    window.pois.push(anillo);
    return g;
  };

  crearPOI(-45, 3, 0, "Captación y Filtración", "El agua del río Sanchón (1050 GPM) es succionada por las bombas G-951 y G-952 hacia los filtros a presión (D-960, D-961). Eliminan sólidos, olores y cloro.");
  crearPOI(-31, 6, 17, "Trenes Desmineralizadores", "El agua pasa por los 3 trenes (M-7451). Catiónico retiene Ca/Mg (H+). Aniónico retiene sulfatos/cloruros (OH-).");
  crearPOI(-26, 4, 4, "Regeneración Química", "Resinas saturadas se regeneran con H2SO4 (Skid Ácido D-
