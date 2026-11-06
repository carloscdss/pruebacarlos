/* =====================================================================
   BUILDERS — construcción de sala, gabinetes, campo, rutas
   ===================================================================== */

const RX0=-5, RX1=5, RZ0=22, RZ1=28, RH=3.3;
const lucesSala = [];
const puertas = { gab1: null, gab2: null };
const estadoPuertas = { gab1: false, gab2: false, sala: false };

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
  
  // Puerta principal de la Sala
  const puertaG = grupo(0,0,RZ1+0.13);
  puertaG.userData.esPuerta = 'sala';
  box(1.1,2.2,0.09,M.acero,0,1.16,0,puertaG);
  box(0.9,1.95,0.02,M.pintEp,0,1.15,0.06,puertaG);
  box(0.05,0.16,0.06,M.acero,0.4,1.06,0.09,puertaG);
  puertaG.traverse(o => { if(o.isMesh) { o.userData.esPuerta = 'sala'; if(!pickables.includes(o)) pickables.push(o); } });
  sala.add(puertaG);
  window.puertaSalaPivot = puertaG; 
  puertaG.position.set(0.55, 0, RZ1+0.13); 
  
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

function gabinete(x, tipo){
  const g = grupo(x,0,RZ0+0.58);
  const W=0.8, H=2.0, D=0.8; // 800x2000x800 mm
  
  // 1. Bases/Soportes en las 4 esquinas (Zócalo)
  const baseH = 0.1;
  const bw = 0.08; // grosor del perfil
  // Esquinas
  box(bw, baseH, bw, M.baseNegra, -W/2+bw/2, baseH/2,  D/2-bw/2, g);
  box(bw, baseH, bw, M.baseNegra,  W/2-bw/2, baseH/2,  D/2-bw/2, g);
  box(bw, baseH, bw, M.baseNegra, -W/2+bw/2, baseH/2, -D/2+bw/2, g);
  box(bw, baseH, bw, M.baseNegra,  W/2-bw/2, baseH/2, -D/2+bw/2, g);
  // Laterales frontales y traseros
  box(W-2*bw, baseH, bw, M.baseNegra, 0, baseH/2,  D/2-bw/2, g);
  box(W-2*bw, baseH, bw, M.baseNegra, 0, baseH/2, -D/2+bw/2, g);
  // Laterales izquierdo y derecho
  box(bw, baseH, D-2*bw, M.baseNegra, -W/2+bw/2, baseH/2, 0, g);
  box(bw, baseH, D-2*bw, M.baseNegra,  W/2-bw/2, baseH/2, 0, g);

  // 2. Cuerpo del Gabinete (Blanco Perlado)
  box(W+0.02, H, D+0.02, M.gabinetePerlado, 0, H/2+baseH, 0, g);
  
  // 3. Techo con Cáncamos de izamiento
  box(W+0.04, 0.05, D+0.04, M.gabinetePerlado, 0, H+baseH+0.025, 0, g);
  
  // Cáncamos (Argollas) en el techo
  const argollaGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
  const argolla1 = new THREE.Mesh(argollaGeo, M.argollaMetal);
  argolla1.position.set(-W/2+0.15, H+baseH+0.1, 0);
  argolla1.rotation.x = Math.PI/2;
  g.add(argolla1);
  
  const argolla2 = new THREE.Mesh(argollaGeo, M.argollaMetal);
  argolla2.position.set(W/2-0.15, H+baseH+0.1, 0);
  argolla2.rotation.x = Math.PI/2;
  g.add(argolla2);

  // 4. Rejillas de ventilación (Laterales)
  const crearRejilla = (posX, posY, posZ, rotY) => {
    const rg = grupo(posX, posY, posZ, g);
    rg.rotation.y = rotY;
    // Marco de la rejilla
    box(0.16, 0.16, 0.02, M.rejillaMetal, 0, 0, 0, rg);
    // Ranuras
    for(let i=0;i<5;i++) {
      box(0.14, 0.015, 0.025, M.baseNegra, 0, 0.05 - i*0.025, 0.005, rg);
    }
  };
  
  // Rejilla en el lateral derecho (abajo)
  crearRejilla(W/2+0.01, baseH + 0.4, 0, Math.PI/2);
  // Rejilla en el lateral izquierdo (arriba)
  crearRejilla(-W/2-0.01, baseH + H - 0.3, 0, -Math.PI/2);

  // 5. Etiqueta
  const p = rotulo("GABINETE N° "+(tipo==='a'?1:2), 0.44, 0.085);
  p.position.set(0,H+baseH+0.1,D/2+0.03); g.add(p); tag(p,"7.8");

  // Luz interior
  const luz = new THREE.PointLight(0xeaf6ff,1.2,4.0,2);
  luz.position.set(0,H/2,0); g.add(luz);

  // 6. Componentes Internos (Solo para el gabinete A)
  if(tipo === 'a'){
    const y = baseH + 1.64;
    [y, y-0.62].forEach(yy => {
      tag(box(0.66,0.2,0.15,M.filtro,0,yy,0,g),"5.8");
      for(let i=0;i<6;i++) box(0.09,0.17,0.1, i<2?M.azul:M.verde, -0.26+i*0.105, yy, 0.05, g);
    });
    tag(box(0.1,0.19,0.1,M.negro,-0.3,y,0,g),"5.11");
    tag(box(0.11,0.18,0.1,M.azul,-0.37,y-0.02,0,g),"5.9");
    tag(box(0.09,0.14,0.1,M.acero,-0.3,y-0.02,0,g),"5.10");
    [["5.12",0.35,M.verde],["5.12",0.24,M.verde],["5.12",0.13,M.verde],["5.13",0.02,M.ambar],
     ["5.14",-0.09,M.ambar],["5.15",-0.2,M.azul],["5.16",-0.31,M.azul],["5.17",-0.42,M.rojo],
     ["5.18",-0.53,M.rojo],["5.19",-0.64,M.negro]].forEach(([id,dx,mat]) => {
      tag(box(0.09,0.17,0.1,mat,dx,y-0.62,0,g),id);
      box(0.075,0.02,0.01,M.ledV,dx,y-0.56,0.06,g);
    });
  } else {
    const g12 = grupo(0,0,0,g), g13 = grupo(0,0,0,g);
    for(let r=0;r<8;r++) for(let i=0;i<7;i++){
      box(0.075,0.09,0.1, r<4?M.pintEp:M.negro, -0.26+i*0.088, baseH+1.7-r*0.14, 0, r<4?g12:g13);
      box(0.05,0.012,0.01,M.ledV,-0.26+i*0.088,baseH+1.74-r*0.14,0.06, r<4?g12:g13);
    }
    tag(g12,"6.12"); tag(g13,"6.13");
  }

  // 7. Puerta Abatible (Blanco Perlado, sin vidrio)
  const puertaPivot = new THREE.Group();
  puertaPivot.position.set(-W/2, 0, D/2); 
  g.add(puertaPivot);

  const puertaPanel = new THREE.Group();
  puertaPanel.position.set(W/2, H/2+baseH, 0); 
  puertaPivot.add(puertaPanel);

  // El panel de la puerta (liso, color perlado)
  tag(box(W-0.02, H-0.02, 0.04, M.gabinetePerlado, 0, 0, 0, puertaPanel), tipo==='a'?"5.1":"6.1");
  
  // Manija Industrial (Palanca)
  const manijaGroup = grupo(W/2-0.1, 0, 0.05, puertaPanel);
  box(0.05, 0.3, 0.02, M.manijaNegra, 0, 0, 0, manijaGroup); // Base de la manija
  box(0.02, 0.25, 0.06, M.manijaNegra, -0.02, -0.05, 0.03, manijaGroup); // Palanca

  // 🔥 ETIQUETAMOS LA PUERTA
  if(tipo === 'a') { puertas.gab1 = puertaPivot; puertaPivot.userData.esPuerta = 'gab1'; }
  else { puertas.gab2 = puertaPivot; puertaPivot.userData.esPuerta = 'gab2'; }
  
  puertaPivot.traverse(o => { if(o.isMesh) { o.userData.esPuerta = puertaPivot.userData.esPuerta; if(!pickables.includes(o)) pickables.push(o); } });

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

  crearPOI(-45, 3, 0, "Captación y Filtración", "El agua del río Sanchón (1050 GPM) es succionada por las bombas G-951 y G-952 hacia los filtros a presión (D-960, D-961).");
  crearPOI(-31, 6, 17, "Trenes Desmineralizadores", "El agua pasa por los 3 trenes (M-7451). Catiónico retiene Ca/Mg (H+). Aniónico retiene sulfatos/cloruros (OH-).");
  crearPOI(-26, 4, 4, "Regeneración Química", "Resinas saturadas se regeneran con H2SO4 (Skid Ácido D-7456) al 2-8% y Soda Cáustica (M-7451-F5A).");
  crearPOI(19, 10, 12, "Almacenamiento (33X1/2)", "Agua desmineralizada almacenada en tanques 33X1 y 33X2 (33.000 barriles c/u). Lazo 74LV-52 controla nivel.");
  crearPOI(25, 3, -2.5, "Distribución y Bombeo", "Bombas G-7451 A/B/C envían agua al Desaereador D-7451, que alimenta las calderas de la refinería.");

  (function(){
    const g = grupo(-30, 0, 6, campoGroup);
    const tk = cyl(0.8, 0.8, 3.5, M.acero, 0, 1.8, 0, g, 20); tk.rotation.z = Math.PI/2; tag(tk, "10.25");
    cyl(0.4, 0.4, 1.5, M.acero, 1.5, 1.8, 1.2, g, 16);
    tag(box(0.6, 0.5, 0.6, M.ambar, 1.5, 0.25, 0, g), "10.25");
    const p = rotulo("SKID ÁCIDO (H2SO4)", 1.8, 0.25); p.position.set(0, 3.0, 0); p.rotation.x = -Math.PI/2; g.add(p);
  })();

  (function(){
    const g = grupo(-22, 0, 6, campoGroup);
    const tk = cyl(1.0, 1.0, 2.0, M.azul, 0, 1.0, 0, g, 20); tag(tk, "10.26");
    tag(box(0.6, 0.5, 0.6, M.ambar, 1.5, 0.25, 0, g), "10.26");
    const p = rotulo("SKID SODA (NaOH)", 1.8, 0.25); p.position.set(0, 2.5, 0); p.rotation.x = -Math.PI/2; g.add(p);
  })();

  for(let i=0;i<11;i++){
    const g = grupo(-38+i*2.1,0,0,campoGroup);
    [-0.45,0.45].forEach(dx => box(0.24,0.95,1.0,M.concreto,dx,0.48,0,g));
    const c = cyl(0.62,0.62,1.9,M.filtro,0,1.55,0,g,20);
    c.rotation.z = Math.PI/2; tag(c,"10.1");
    [-0.95,0.95].forEach(dx => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.62,18,12), M.filtro);
      s.position.set(dx,1.55,0); g.add(s);
    });
    cyl(0.1,0.1,1.2,M.acero,0,2.6,0,g,10);
    cyl(0.22,0.22,0.12,M.acero,0,2.2,0,g,12);
    [-0.3,0.3].forEach(dz => {
      const m = cyl(0.09,0.09,0.06,M.blanco,0.3,2.15,dz,g,14);
      m.rotation.x = Math.PI/2; tag(m,"10.1");
      cyl(0.012,0.012,0.35,M.acero,0.3,1.98,dz,g,8);
    });
    const orf = cyl(0.24,0.24,0.1,M.acero,-1.15,1.55,0,g,14);
    orf.rotation.z = Math.PI/2; tag(orf,"10.1");
    tag(box(0.14,0.14,0.14,M.blanco,-1.15,2.0,0,g),"10.1");
    const tp = rotulo("D-95"+(i+1),0.42,0.09);
    tp.position.set(0,1.05,0.67); g.add(tp); tag(tp,"10.17");
    const cp = cyl(0.11,0.11,1.9,M.acero,0,1.55,0.78,g,10);
    cp.rotation.z = Math.PI/2;
  }

  function tanque(x,z,d,h,txt){
    const g = grupo(x,0,z,campoGroup);
    cyl(d/2,d/2,h,M.acero,0,h/2+0.3,0,g,26);
    cyl(d/2+0.08,d/2+0.08,0.3,M.acero,0,0.15,0,g,26);
    const t = new THREE.Mesh(new THREE.SphereGeometry(d/2,26,10,0,Math.PI*2,0,Math.PI/2.6), M.acero);
    t.position.set(0,h+0.3,0); t.castShadow = true; g.add(t);
    for(let i=0;i<Math.floor(h);i++) box(0.5,0.04,0.05,M.galv,d/2+0.18,0.8+i*0.55,0,g);
    box(0.04,h,0.04,M.galv,d/2+0.18,h/2,-0.28,g);
    box(0.04,h,0.04,M.galv,d/2+0.18,h/2, 0.28,g);
    for(let i=0;i<3;i++) tag(cyl(0.05,0.05,1.2,M.vidrio,-d/2-0.12,1.5+i*0.9,0.4,g,8),"10.2");
    tag(cyl(0.1,0.1,0.22,M.blanco,-d/2-0.16,h*0.8,-0.5,g,12),"10.2");
    tag(cyl(0.1,0.1,0.22,M.blanco, d/2+0.1,1.2,0.5,g,12),"10.2");
    tag(cyl(0.11,0.11,0.24,M.blanco,d/2+0.2,1.0,-0.4,g,12),"10.2");
    for(let i=0;i<3;i++){
      const m = cyl(0.08,0.08,0.05,M.blanco,-d/2-0.1,2.2+i*0.3,-0.9+i*0.2,g,12);
      m.rotation.x = Math.PI/2; tag(m,"10.2");
    }
    tag(box(0.12,0.16,0.12,M.blanco,d/2+0.14,1.7,0.2,g),"10.2");
    for(let i=0;i<2;i++){
      const v = cyl(0.14,0.14,0.24,M.azul,d/2+0.3,1.4,0.4+i*0.9,g,12);
      v.rotation.z = Math.PI/2; tag(v,"10.2");
      box(0.2,0.2,0.18,M.negro,d/2+0.3,1.62,0.4+i*0.9,g);
    }
    tag(box(0.14,0.14,0.14,M.ambar,-d/2-0.2,1.0,0.7,g),"10.2");
    const p = rotulo(txt,1.0,0.2); p.position.set(0,h*0.55,d/2+0.06); g.add(p);
  }
  tanque(-11,0,6.5,8.5,"F-954");
  tanque(-3.4,0,6.5,8.5,"F-959");
  tanque(16,12,5.4,9.5,"T-33X1");
  tanque(23,12,5.4,9.5,"T-33X2");

  function bomba(x,z,etq,id,grande){
    const g = grupo(x,0,z,campoGroup);
    box(grande?2.6:2.0,0.22,1.0,M.concreto,0,0.11,0,g);
    box(grande?2.4:1.8,0.35,0.85,M.negro,0,0.4,0,g);
    const v = cyl(0.34,0.34,0.42,M.verde,grande?-0.55:-0.4,0.85,0,g,18);
    v.rotation.z = Math.PI/2; tag(v,id);
    cyl(0.16,0.16,0.6,M.acero,grande?-0.55:-0.4,1.2,0,g,12);
    const mo = cyl(0.3,0.3,0.95,M.azul,grande?0.6:0.45,0.85,0,g,18);
    mo.rotation.z = Math.PI/2; tag(mo,id);
    for(let i=0;i<7;i++){
      const a = cyl(0.33,0.33,0.03,M.azul,grande?0.15+i*0.13:0.05+i*0.11,0.85,0,g,16);
      a.rotation.z = Math.PI/2;
    }
    box(0.24,0.34,0.34,M.ambar,grande?0.1:0.02,0.85,0,g);
    const s = cyl(0.14,0.14,1.2,M.acero,grande?-1.1:-0.9,0.85,0,g,12);
    s.rotation.z = Math.PI/2;
    const m = cyl(0.085,0.085,0.05,M.blanco,grande?-0.55:-0.4,1.55,0.22,g,12);
    m.rotation.x = Math.PI/2; tag(m,id);
    tag(box(0.13,0.17,0.13,M.blanco,grande?-0.55:-0.4,1.5,-0.22,g),id);
    const p = rotulo(etq,0.85,0.18); p.position.set(0,1.95,0); g.add(p);
  }
  bomba(7,-2.5,"G-7152-A","10.3",true); bomba(11,-2.5,"G-7152-B","10.3",true);
  bomba(15,-2.5,"G-7152-C","10.4",false); bomba(19.5,-2.5,"G-953B","10.5",false);
  bomba(23.5,-2.5,"G-954","10.5",false); bomba(28,-2.5,"G-7154-A","10.6",false);
  bomba(32,-2.5,"G-7154-B","10.6",false); bomba(36,-2.5,"G-7154-C","10.6",false);

  function interc(x,z,etq,id,anion){
    const g = grupo(x,0,z,campoGroup);
    cyl(0.05,0.05,0.5,M.concreto,-0.9,0.25,0,g,8);
    cyl(0.05,0.05,0.5,M.concreto,0.9,0.25,0,g,8);
    const mat = anion?M.azul:M.verde;
    tag(cyl(1.15,1.15,4.6,mat,0,2.8,0,g,24),id);
    const d = new THREE.Mesh(new THREE.SphereGeometry(1.15,24,12,0,Math.PI*2,0,Math.PI/2), mat);
    d.position.set(0,5.1,0); d.castShadow = true; g.add(d);
    cyl(1.15,1.15,0.25,M.acero,0,0.6,0,g,24);
    const man = cyl(0.09,0.09,3.2,M.acero,0,5.6,0,g,10);
    man.rotation.z = Math.PI/2;
    for(let i=0;i<5;i++){
      tag(box(0.22,0.3,0.22,M.rojo,-1.3+i*0.65,5.6,0,g),id);
      cyl(0.03,0.03,0.4,M.acero,-1.3+i*0.65,5.9,0,g,8);
    }
    for(let i=0;i<3;i++) tag(box(0.15,0.16,0.15,M.ambar,-0.9+i*0.9,4.4,1.2,g),id);
    tag(box(0.3,0.4,0.24,M.blanco,1.35,2.2,0,g),id);
    if(anion) tag(box(0.3,0.4,0.24,M.blanco,1.35,1.5,0,g),id);
    tag(cyl(0.1,0.1,0.2,M.blanco,-1.4,2.0,0.6,g,12),id);
    for(let i=0;i<2;i++){
      const m = cyl(0.08,0.08,0.05,M.blanco,1.2,3.2+i*0.5,0.7,g,12);
      m.rotation.x = Math.PI/2; tag(m,id);
    }
    tag(box(0.12,0.18,0.12,M.blanco,-1.2,3.4,-0.7,g),id);
    for(let i=0;i<8;i++) box(0.45,0.04,0.05,M.galv,0,0.8+i*0.55,1.28,g);
    box(0.04,4.4,0.04,M.galv,-0.24,2.8,1.28,g); box(0.04,4.4,0.04,M.galv,0.24,2.8,1.28,g);
    const p = rotulo(etq,1.1,0.22); p.position.set(0,3.9,1.18); g.add(p);
  }
  interc(-38,13,"M-7451-F1","10.7",false);
  interc(-31,13,"M-7451-F2","10.8",false);
  interc(-24,13,"M-7451-F3","10.9",false);
  interc(-38,21.5,"M-7451-F4","10.10",true);
  interc(-31,21.5,"M-7451-F5","10.11",true);
  interc(-24,21.5,"M-7451-F6","10.12",true);

  [[-14.5,-3.5],[-6,-3.5],[4,6.5],[26,6.5]].forEach(([x,z]) => {
    const g = grupo(x,0,z,campoGroup);
    cyl(0.06,0.06,1.4,M.inox,0,0.7,0,g,10);
    tag(box(0.5,0.6,0.3,M.inoxP,0,1.55,0,g),"10.15");
    box(0.02,0.5,0.24,M.blanco,0.26,1.55,0,g);
  });

  [[-20,3.2],[-13,3.2]].forEach(([x,z]) => {
    const g = grupo(x,0,z,campoGroup);
    const c = cyl(0.3,0.3,0.7,M.acero,0,0.9,0,g,16); c.rotation.z = Math.PI/2;
    cyl(0.14,0.14,0.3,M.azul,0,1.3,0,g,12);
    tag(box(0.3,0.34,0.22,M.blanco,0.42,1.15,0,g),"10.14");
    box(0.26,0.2,0.02,M.pantalla,0.42,1.15,0.12,g);
    const p = rotulo("74FT572",0.8,0.16); p.position.set(0,1.75,0); g.add(p);
  });

  (function(){
    const g = grupo(-6.5,0,-6.5,campoGroup);
    box(0.95,0.1,0.95,M.concreto,0,0.05,0,g);
    cyl(0.11,0.11,1.0,M.inoxP,-0.3,0.55,0,g,12);
    cyl(0.11,0.11,1.0,M.inoxP, 0.3,0.55,0,g,12);
    tag(box(0.98,1.18,0.46,M.inoxP,0,1.68,0,g),"8.1");
    box(0.88,1.06,0.02,M.inox,0,1.68,0.24,g);
    tag(box(1.18,0.05,0.68,M.inoxP,0,2.34,0.06,g),"8.2");
    box(1.18,0.12,0.05,M.inoxP,0,2.28,0.38,g);
    tag(box(0.36,0.42,0.18,M.inoxP,0,2.04,-0.32,g),"8.3");
    box(0.28,0.06,0.02,M.negro,0,1.94,-0.41,g);
    tag(box(0.05,0.3,0.04,M.cobre,-0.4,1.55,-0.17,g),"8.5");
    tag(box(0.05,0.3,0.04,M.cobre,-0.4,1.18,-0.17,g),"8.6");
    tag(box(0.04,0.5,0.03,M.cable,-0.44,1.35,-0.19,g),"8.7");

    const g8 = grupo(0,0,0,g);
    for(let i=0;i<12;i++){
      const x = -0.36+(i%6)*0.145, y = 2.02-Math.floor(i/6)*0.24;
      const b = cyl(0.042,0.042,0.05, i%2?M.verde:M.rojo, x,y,0.27,g8,12);
      b.rotation.x = Math.PI/2;
    }
    tag(g8,"8.8");
    const g9 = grupo(0,0,0,g);
    for(let i=0;i<6;i++){
      const x = -0.32+i*0.13;
      const s = cyl(0.045,0.045,0.05,M.negro,x,1.48,0.27,g9,12);
      s.rotation.x = Math.PI/2;
      box(0.025,0.06,0.02,M.blanco,x,1.5,0.3,g9);
    }
    tag(g9,"8.9");
    const g10 = grupo(0,0,0,g);
    const cols = [M.ledV,M.ledR,M.ledA];
    for(let i=0;i<18;i++){
      const x = -0.36+(i%6)*0.145, y = 1.26-Math.floor(i/6)*0.11;
      const l = cyl(0.03,0.03,0.04,cols[i%3],x,y,0.27,g10,10);
      l.rotation.x = Math.PI/2;
    }
    tag(g10,"8.10");
    const g11 = grupo(0,0,0,g);
    [[-0.36,0.98],[0.36,0.98]].forEach(([x,y]) => {
      const a = cyl(0.06,0.06,0.07,M.ambar,x,y,0.28,g11,14); a.rotation.x = Math.PI/2;
      const b = cyl(0.075,0.075,0.05,M.rojo,x,y,0.32,g11,16); b.rotation.x = Math.PI/2;
    });
    tag(g11,"8.11");
    tag(box(0.6,0.12,0.08,M.negro,0,1.02,-0.13,g),"8.12");
    const p = rotulo("PANEL DE CAMPO",0.7,0.16); p.position.set(0,2.48,0); g.add(p);
  })();

  for(let i=0;i<14;i++){
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.25,0.014,6,14,Math.PI), M.acero);
    c.position.set(-16+i*1.4,0.35,3.6); c.rotation.z = Math.PI;
    campoGroup.add(c); tag(c,"10.16");
  }

  (function(){
    const g = grupo(6.8,0,27.6,campoGroup);
    cyl(0.05,0.05,7,M.galv,0,3.5,0,g,8);
    cyl(0.03,0.03,1.2,M.cobre,0,7.4,0,g,8);
    box(0.3,0.06,0.3,M.galv,0,0.03,0,g);
    tag(g,"4.14");
  })();

  return campoGroup;
}

function buildAll(){
  buildTerreno();
  const sala = buildSala();
  const { gab1, gab2 } = buildGabinetes(sala);
  const rutaGroup = buildRuta();
  const campoGroup = buildCampo();
  return { sala, gab1, gab2, rutaGroup, campoGroup };
}

function animarPuertas(dt) {
  const velocidad = 3.0;
  const maxAngulo = -Math.PI / 2.2; 
  
  ['gab1', 'gab2'].forEach(key => {
    const pivot = puertas[key];
    if(!pivot) return;
    const objetivo = estadoPuertas[key] ? maxAngulo : 0;
    const actual = pivot.rotation.y;
    if(Math.abs(objetivo - actual) > 0.001) {
      pivot.rotation.y += Math.sign(objetivo - actual) * velocidad * dt;
      if(estadoPuertas[key] && pivot.rotation.y < maxAngulo) pivot.rotation.y = maxAngulo;
      if(!estadoPuertas[key] && pivot.rotation.y > 0) pivot.rotation.y = 0;
    }
  });

  if (window.puertaSalaPivot) {
    const pivot = window.puertaSalaPivot;
    const objetivo = estadoPuertas.sala ? -Math.PI / 2 : 0; 
    const actual = pivot.rotation.y;
    if (Math.abs(objetivo - actual) > 0.001) {
      pivot.rotation.y += Math.sign(objetivo - actual) * velocidad * dt;
      if (estadoPuertas.sala && pivot.rotation.y < objetivo) pivot.rotation.y = objetivo;
      if (!estadoPuertas.sala && pivot.rotation.y > 0) pivot.rotation.y = 0;
    }
  }
}
