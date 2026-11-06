// Se elimina/corrige geometría de la sala que se define en builders.js antes de
// crear los colisionadores y el loop de renderizado.
function corregirGeometriaSala(sala) {
  const retirar = [];
  const mallas = [];

  sala.traverse(obj => {
    if (!obj.isMesh || !obj.geometry) return;
    const p = obj.geometry.parameters || {};

    // Este bloque sólido ocupaba casi todo el espacio de la sala, desde el piso
    // hasta y=0.675, y tapaba las patas y la base de los muebles.
    if (
      obj.material === M.paredExt &&
      p.width === 11 && p.height === 0.55 && p.depth === 7 &&
      Math.abs(obj.position.y - 0.4) < 1e-6
    ) {
      retirar.push(obj);
      return;
    }

    mallas.push(obj);
  });

  retirar.forEach(obj => obj.removeFromParent());

  // Las patas de las mesas llegan del piso terminado (y=0.06) a la cara
  // inferior de la cubierta (y=0.72): alto 0.66, centro y=0.39.
  mallas.forEach(obj => {
    const p = obj.geometry && obj.geometry.parameters;
    if (!p || obj.material !== M.acero || Math.abs(obj.position.y - 0.38) > 1e-6) return;

    const esPataMesa =
      (p.width === 0.06 && p.height === 0.75 && p.depth === 0.06) ||
      (p.width === 0.05 && p.height === 0.75 && p.depth === 0.05);
    if (!esPataMesa) return;

    obj.geometry = new THREE.BoxGeometry(p.width, 0.66, p.depth);
    obj.position.y = 0.39;
  });

  // Apoya las cinco patas de la silla sobre el epóxico y sube la base del
  // gabinete hasta el nivel del piso terminado.
  mallas.forEach(obj => {
    const p = obj.geometry && obj.geometry.parameters;
    if (!p) return;

    if (
      obj.material === M.acero && p.width === 0.24 && p.height === 0.03 &&
      p.depth === 0.04 && Math.abs(obj.position.y - 0.05) < 1e-6
    ) {
      obj.position.y = 0.075;
    }

    if (
      obj.material === M.negro && p.width === 0.86 && p.height === 0.1 &&
      p.depth === 0.86 && Math.abs(obj.position.y - 0.08) < 1e-6
    ) {
      obj.position.y = 0.11;
    }
  });
}

const { sala, gab1, gab2, rutaGroup, campoGroup } = buildAll();
corregirGeometriaSala(sala);

setupColliders(RX0, RX1, RZ0, RZ1, RH);
buildTeleportMenu(CAMS);
window.cams = CAMS; // Necesario para el menú

buildHUD({ gab1, gab2, rutaGroup, campoGroup });
buildSidebar();
buildReporte();

function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

const reloj = new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);
  const dt = Math.min(reloj.getDelta(), 0.05);
  const t = reloj.getElapsedTime();

  animarPuertas(dt);

  if(window.pois) {
    window.pois.forEach((anillo, i) => {
      anillo.rotation.z = t * 2 + i;
      anillo.position.y = Math.sin(t * 3 + i) * 0.2;
    });
  }

  if(fpsMode.value){
    actualizarFPS(dt);
  } else {
    updateAnim();
    controls.update();
  }
  lucesSala.forEach((l,i) => l.intensity = 0.58 + Math.sin(t*1.5+i)*0.05);
  renderer.render(scene, camera);
}
loop();

// Asegura que se ejecute irA una vez cargado el entorno sin detener la consola
window.addEventListener('load', () => {
  if (typeof irA === 'function') {
    irA('overview');
  }
});
