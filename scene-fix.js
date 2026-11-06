/*
 * Correcciones de geometría para la sala de control.
 * Se carga después de builders.js y fps.js, antes de main.js.
 */
(function () {
  const buildAllOriginal = buildAll;

  function fixSala(sala) {
    if (!sala) return;

    const remove = [];
    const meshes = [];
    sala.traverse(object => {
      if (!object.isMesh || !object.geometry) return;
      const p = object.geometry.parameters || {};

      // Este bloque de pared de 11 x 0.55 x 7 estaba en el centro de la sala,
      // a ras del piso, y ocultaba las patas y la mayor parte del mobiliario.
      if (
        object.material === M.paredExt &&
        p.width === 11 && p.height === 0.55 && p.depth === 7 &&
        Math.abs(object.position.y - 0.4) < 1e-6
      ) {
        remove.push(object);
        return;
      }

      meshes.push(object);
    });
    remove.forEach(mesh => mesh.removeFromParent());

    // Las patas de ambas mesas deben comenzar justo sobre el epóxico (y=0.06).
    meshes.forEach(mesh => {
      const p = mesh.geometry && mesh.geometry.parameters;
      if (!p || !mesh.material) return;
      if (
        mesh.material === M.acero &&
        ((p.width === 0.06 && p.height === 0.75 && p.depth === 0.06) ||
         (p.width === 0.05 && p.height === 0.75 && p.depth === 0.05)) &&
        mesh.position.y === 0.38
      ) {
        mesh.position.y = 0.435;
      }
    });
  }

  buildAll = function () {
    const result = buildAllOriginal();
    fixSala(result && result.sala);
    return result;
  };
})();
