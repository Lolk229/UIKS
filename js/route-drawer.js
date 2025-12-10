// Отрисовка маршрута.
// Добавлено ортогональное "L-соединение" для Door↔Corridor сегментов.

class RouteDrawer {
  constructor(map) {
    this.map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }

    if (!path || path.length === 0) return;

    const keys = path.filter((k) => {
      const parts = k.split("_");
      const floor = Number(parts[parts.length - 1]);
      return floor === currentFloor;
    });

    if (keys.length < 1) {
      console.log("Этаж " + currentFloor + ": нет точек маршрута");
      return;
    }

    const nodes = this.getPathNodes(keys, currentFloor);
    if (nodes.length < 1) {
      console.log("Этаж " + currentFloor + ":  не удалось получить узлы");
      return;
    }

    const poly = [];
    for (let i = 0; i < nodes.length; i++) {
      const cur = nodes[i];
      const prev = nodes[i - 1];

      if (! prev) {
        poly.push(cur.coords);
        continue;
      }

      const isDoorPrev = prev.type === "door";
      const isDoorCur = cur.type === "door";
      const isCorrPrev = prev.type === "corridor";
      const isCorrCur = cur.type === "corridor";

      if ((isDoorPrev && isCorrCur) || (isCorrPrev && isDoorCur)) {
        const elbow = [prev.coords[0], cur.coords[1]];
        if (! this.samePoint(poly[poly.length - 1], prev.coords)) poly.push(prev.coords);
        if (!this.samePoint(poly[poly.length - 1], elbow)) poly.push(elbow);
        if (!this.samePoint(poly[poly.length - 1], cur.coords)) poly.push(cur.coords);
      } else {
        if (!this.samePoint(poly[poly.length - 1], cur.coords)) poly.push(cur.coords);
      }
    }

    if (poly.length === 0) return;

    if (poly.length === 1) {
      this.routeLine = L.circleMarker(poly[0], {
        radius: 7,
        color: "green",
        fillColor: "green",
        fillOpacity:  0.6,
        weight:  2,
      }).addTo(this.map);
      return;
    }

    this.routeLine = L.polyline(poly, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathNodes(pathKeys, floor) {
    const result = [];

    for (const key of pathKeys) {
      const parts = key.split("_");
      const floorFromKey = Number(parts[parts.length - 1]);

      if (floorFromKey !== floor) continue;

      const id = parts.slice(0, -1).join("_");

      const pointsArr = CONFIG.points[floor] || [];
      let node = pointsArr.find((p) => p.id === id);
      if (node) {
        result.push({
          id: node.id,
          type: node.type,
          coords: node.coords
        });
        continue;
      }

      const corridorArr = CONFIG.corridorNodes[floor] || [];
      node = corridorArr.find((n) => n.id === id);
      if (node) {
        result.push({
          id:  node.id,
          type: node.type || "corridor",
          coords: node.coords
        });
        continue;
      }

      console.warn("Узел не найден:  key=" + key + ", id=" + id + ", floor=" + floor);
    }

    return result;
  }

  samePoint(a, b) {
    if (! a || !b) return false;
    return Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
  }

  highlightFloorButtons(path) {
    const floorButtons = ["floor1", "floor2", "floor3", "floor4", "floor5"];
    floorButtons.forEach(function(id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.backgroundColor = "";
        btn.classList.remove("route-start", "route-end", "route-through");
      }
    });

    if (! path || path.length === 0) return;

    const floorsInPath = new Set();
    path.forEach(function(key) {
      const parts = key.split("_");
      const floor = Number(parts[parts.length - 1]);
      if (! isNaN(floor)) floorsInPath.add(floor);
    });

    if (floorsInPath.size === 0) return;

    const floorsArray = Array.from(floorsInPath).sort(function(a, b) { return a - b; });

    const startParts = path[0].split("_");
    const endParts = path[path.length - 1].split("_");
    const startFloor = Number(startParts[startParts.length - 1]);
    const endFloor = Number(endParts[endParts.length - 1]);

    floorsArray.forEach(function(floor) {
      const btn = document.getElementById("floor" + floor);
      if (btn) {
        if (floor === startFloor && floor === endFloor) {
          btn.style.backgroundColor = "#90EE90";
        } else if (floor === startFloor) {
          btn.style.backgroundColor = "#ffcccc";
          btn.classList.add("route-start");
        } else if (floor === endFloor) {
          btn.style.backgroundColor = "#ccffcc";
          btn.classList.add("route-end");
        } else {
          btn.style.backgroundColor = "#ffffcc";
          btn.classList.add("route-through");
        }
      }
    });
  }
}
