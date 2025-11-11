// js/generator_edge.js
function generateEdges(pointsByFloor, maxDistance = 150) {
  const edges = [];
  for (const [floor, pts] of Object.entries(pointsByFloor)) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        const dist = Math.hypot(a.coords[0] - b.coords[0], a.coords[1] - b.coords[1]);
        if (dist < maxDistance) {
          edges.push({ from: a.id, to: b.id, distance: dist, floor: Number(floor) });
        }
      }
    }
  }
  return edges;
}
