/*
 * Correcciones de escena para la maqueta.
 * Se carga después de builders.js y fps.js, y antes de main.js.
 */
(function () {
  const FLOOR_Y = 0.06;
  const EYE_HEIGHT = 1.64;

  // El bloque exterior de 11 x 0.55 x 7 estaba colocado dentro de la sala,
  // tapando visualmente las patas de las mesas y la base de las sillas.
  const buildAllOriginal = buildAll;
  buildAll = function () {
    const result = buildAllOriginal();
    const sala = result && result.sala;

    if (sala) {
      const meshesToRemove = [];
      sala.traverse(object => {
        const p = object.geometry && object.geometry.parameters;
        if (
          object.isMesh &&
          object.material === M.paredExt &&
          p && p.width === 11 && p.height === 0.55 && p.depth === 7 &&
          Math.abs(object.position.y - 0.4) < 1e-6
        ) {
          meshesToRemove.push(object);
        }
      });
      meshesToRemove.forEach(mesh => mesh.removeFromParent());
    }

    return result;
  };

  // player.pos.y es la altura de los ojos, no la altura de los pies.
  // El piso terminado está en y=0.06, así que los ojos no pueden bajar de
  // piso + altura de ojos. La corrección posterior también cubre saltos,
  // teletransportes y la resolución de colisiones existente.
  player.height = EYE_HEIGHT;
  const actualizarFPSOriginal = actualizarFPS;
  actualizarFPS = function (dt) {
    actualizarFPSOriginal(dt);

    const minEyeY = FLOOR_Y + player.height;
    if (player.pos.y < minEyeY) {
      player.pos.y = minEyeY;
      if (player.vel.y < 0) player.vel.y = 0;
      player.onGround = true;
    }

    if (typeof camera !== 'undefined') {
      camera.position.y = player.pos.y;
    }
  };
})();
