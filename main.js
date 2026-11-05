const { gab1, gab2, rutaGroup, campoGroup } = buildAll();

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
irA('overview');