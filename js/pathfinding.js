// Отрисовка маршрута
class RouteDrawer {
  constructor(map) {
    this. map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    if (this.routeLine) {
      this. map.removeLayer(this.routeLine);
      this.routeLine = null;
    }

    if (!path || path. length === 0) return;

    const keys = path.filter(function(k) {
      const parts = k.split("_");
      const floor = Number(parts[parts.length - 1]);
      return floor === currentFloor;
    });

    if (keys.length < 1) return;

    const nodes = this.getPathNodes(keys, currentFloor);
    if (nodes. length < 1) return;

    const poly = [];
    for (let i = 0; i < nodes.length; i++) {
      const cur = nodes[i];
      const prev = nodes[i - 1];

      if (! prev) {
        poly.push(cur. coords);
        continue;
      }

      const isDoorPrev = prev.type === "door";
      const isDoorCur = cur.type === "door";
      const isCorrPrev = prev.type === "corridor";
      const isCorrCur = cur. type === "corridor";

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
        weight:  2
      }).addTo(this. map);
      return;
    }

    this.routeLine = L.polyline(poly, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathNodes(pathKeys, floor) {
    var result = [];
    var pointsArr = (CONFIG.points[floor] || []).filter(function(p) { return p != null; });
    var corridorArr = (CONFIG.corridorNodes[floor] || []).filter(function(n) { return n != null; });

    for (var i = 0; i < pathKeys.length; i++) {
      var key = pathKeys[i];
      var parts = key.split("_");
      var floorFromKey = Number(parts[parts. length - 1]);

      if (floorFromKey !== floor) continue;

      var id = parts.slice(0, -1).join("_");

      // Ищем в points
      var node = null;
      for (var j = 0; j < pointsArr.length; j++) {
        if (pointsArr[j].id === id) {
          node = pointsArr[j];
          break;
        }
      }

      if (node) {
        result.push({
          id: node.id,
          type: node.type,
          coords: node.coords
        });
        continue;
      }

      // Ищем в corridorNodes
      for (var k = 0; k < corridorArr. length; k++) {
        if (corridorArr[k].id === id) {
          node = corridorArr[k];
          break;
        }
      }

      if (node) {
        result. push({
          id: node.id,
          type: node.type || "corridor",
          coords: node.coords
        });
        continue;
      }
    }

    return result;
  }

  samePoint(a, b) {
    if (! a || !b) return false;
    return Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
  }

  highlightFloorButtons(path) {
    var floorButtons = ["floor1", "floor2", "floor3", "floor4", "floor5"];
    for (var i = 0; i < floorButtons.length; i++) {
      var btn = document.getElementById(floorButtons[i]);
      if (btn) {
        btn. style.backgroundColor = "";
        btn.classList.remove("route-start", "route-end", "route-through");
      }
    }

    if (! path || path.length === 0) return;

    var floorsInPath = {};
    for (var i = 0; i < path.length; i++) {
      var parts = path[i]. split("_");
      var floor = Number(parts[parts. length - 1]);
      if (!isNaN(floor)) floorsInPath[floor] = true;
    }

    var startParts = path[0].split("_");
    var endParts = path[path.length - 1].split("_");
    var startFloor = Number(startParts[startParts.length - 1]);
    var endFloor = Number(endParts[endParts.length - 1]);

    for (var floor in floorsInPath) {
      floor = Number(floor);
      var btn = document.getElementById("floor" + floor);
      if (btn) {
        if (floor === startFloor && floor === endFloor) {
          btn. style.backgroundColor = "#90EE90";
        } else if (floor === startFloor) {
          btn. style.backgroundColor = "#ffcccc";
          btn.classList.add("route-start");
        } else if (floor === endFloor) {
          btn.style.backgroundColor = "#ccffcc";
          btn.classList.add("route-end");
        } else {
          btn.style.backgroundColor = "#ffffcc";
          btn.classList.add("route-through");
        }
      }
    }
  }
}
