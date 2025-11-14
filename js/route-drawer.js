// Отрисовка маршрута.
// Добавлено ортогональное "L-соединение" для Door↔Corridor сегментов.

class RouteDrawer {
  constructor(map) {
    this.map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (!path || path.length === 0) return;

    // Фильтруем узлы текущего этажа
    // ИСПРАВЛЕНО: этаж - это ПОСЛЕДНИЙ элемент после split("_")
    const keys = path.filter((k) => {
      const parts = k.split("_");
      const floor = Number(parts[parts.length - 1]);
      return floor === currentFloor;
    });
    if (keys.length < 1) return;

    const nodes = this.getPathNodes(keys, currentFloor);
    if (nodes.length < 1) return;

    // Строим маршрут с ортогональными сегментами
    const poly = [];
    for (let i = 0; i < nodes.length; i++) {
      const cur = nodes[i];
      const prev = nodes[i - 1];

      if (!prev) {
        poly.push(cur.coords);
        continue;
      }

      const isDoorPrev = prev.type === "door";
      const isDoorCur = cur.type === "door";
      const isCorrPrev = prev.type === "corridor";
      const isCorrCur = cur.type === "corridor";

      // Если сегмент Door↔Corridor — вставляем ортогональное "L-соединение"
      if ((isDoorPrev && isCorrCur) || (isCorrPrev && isDoorCur)) {
        const elbow = [prev.coords[0], cur.coords[1]]; // [door.y, corridor.x]
        if (!this.samePoint(poly[poly.length - 1], prev.coords)) poly.push(prev.coords);
        if (!this.samePoint(poly[poly.length - 1], elbow)) poly.push(elbow);
        if (!this.samePoint(poly[poly.length - 1], cur.coords)) poly.push(cur.coords);
      } else {
        // Обычные сегменты маршрута
        if (!this.samePoint(poly[poly.length - 1], cur.coords)) poly.push(cur.coords);
      }
    }

    if (poly.length === 1) {
      this.routeLine = L.circleMarker(poly[0], {
        radius: 7,
        color: "green",
        fillColor: "green",
        fillOpacity: 0.6,
        weight: 2,
      }).addTo(this.map);
      return;
    }

    this.routeLine = L.polyline(poly, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathNodes(pathKeys, floor) {
    return pathKeys.map((key) => {
      // ИСПРАВЛЕНО: ID - это всё кроме последнего элемента после split("_")
      const parts = key.split("_");
      const id = parts.slice(0, -1).join("_");
      
      let node = CONFIG.points[floor]?.find((p) => p.id === id);
      if (node) return { id, type: node.type, coords: node.coords };
      node = CONFIG.corridorNodes[floor]?.find((n) => n.id === id);
      if (node) return { id, type: node.type || "corridor", coords: node.coords };
      return null;
    }).filter(Boolean);
  }

  samePoint(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }

  highlightFloorButtons(path) {
    document.getElementById("floor1").style.backgroundColor = "";
    document.getElementById("floor2").style.backgroundColor = "";
    if (!path || path.length === 0) return;

    const floors = new Set();
    path.forEach((k) => {
      const parts = k.split("_");
      floors.add(Number(parts[parts.length - 1]));
    });
    const arr = Array.from(floors).sort();
    if (arr.length > 1) {
      const sParts = path[0].split("_");
      const eParts = path[path.length - 1].split("_");
      const s = Number(sParts[sParts.length - 1]);
      const e = Number(eParts[eParts.length - 1]);
      const sb = document.getElementById(`floor${s}`);
      const eb = document.getElementById(`floor${e}`);
      if (sb) sb.style.backgroundColor = "#ffcccc";
      if (eb) eb.style.backgroundColor = "#ccffcc";
    }
  }
}