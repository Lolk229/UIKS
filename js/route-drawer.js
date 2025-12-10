// Отрисовка маршрута.
// Добавлено ортогональное "L-соединение" для Door↔Corridor сегментов.

class RouteDrawer {
  constructor(map) {
    this.map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    // Сначала удаляем старую линию
    if (this. routeLine) {
      this.map. removeLayer(this.routeLine);
      this.routeLine = null;
    }

    if (!path || path. length === 0) return;

    // Фильтруем узлы текущего этажа
    const keys = path.filter((k) => {
      const parts = k.split("_");
      const floor = Number(parts[parts.length - 1]);
      return floor === currentFloor;
    });

    if (keys.length < 1) {
      console.log(`На этаже ${currentFloor} нет точек маршрута`);
      return;
    }

    const nodes = this.getPathNodes(keys, currentFloor);
    if (nodes. length < 1) {
      console. log(`Не удалось получить узлы для этажа ${currentFloor}`);
      return;
    }

    // Строим маршрут с ортогональными сегментами
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

      // Если сегмент Door↔Corridor — вставляем ортогональное "L-соединение"
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
        weight: 2,
      }).addTo(this. map);
      return;
    }

    this.routeLine = L.polyline(poly, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathNodes(pathKeys, floor) {
    const result = [];

    for (const key of pathKeys) {
      const parts = key.split("_");
      const floorFromKey = Number(parts[parts.length - 1]);

      // Если этаж не совпадает - пропускаем
      if (floorFromKey !== floor) continue;

      // ID может содержать подчёркивания, поэтому берём всё кроме последнего элемента
      const id = parts.slice(0, -1).join("_");

      // Ищем в points
      let node = CONFIG.points[floor]?.find((p) => p.id === id);
      if (node) {
        result.push({
          id: node.id,
          type: node.type,
          coords:  node.coords
        });
        continue;
      }

      // Ищем в corridorNodes
      node = CONFIG.corridorNodes[floor]?.find((n) => n.id === id);
      if (node) {
        result.push({
          id:  node.id,
          type: node. type || "corridor",
          coords: node.coords
        });
        continue;
      }

      console.warn(`⚠️ Узел не найден:  key="${key}", id="${id}", floor=${floor}`);
    }

    return result;
  }

  samePoint(a, b) {
    if (! a || !b) return false;
    return Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
  }

  highlightFloorButtons(path) {
    // Сбрасываем подсветку всех кнопок
    const floorButtons = ["floor1", "floor2", "floor3", "floor4", "floor5"];
    floorButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.backgroundColor = "";
        btn.classList.remove("route-start", "route-end", "route-through");
      }
    });

    if (! path || path.length === 0) return;

    // Собираем этажи, через которые проходит маршрут
    const floorsInPath = new Set();
    path.forEach((key) => {
      const parts = key. split("_");
      const floor = Number(parts[parts. length - 1]);
      if (! isNaN(floor)) floorsInPath. add(floor);
    });

    if (floorsInPath.size === 0) return;

    const floorsArray = Array. from(floorsInPath).sort((a, b) => a - b);

    // Определяем начальный и конечный этажи
    const startParts = path[0]. split("_");
    const endParts = path[path. length - 1]. split("_");
    const startFloor = Number(startParts[startParts.length - 1]);
    const endFloor = Number(endParts[endParts.length - 1]);

    // Подсвечиваем кнопки этажей
    floorsArray.forEach(floor => {
      const btn = document. getElementById(`floor${floor}`);
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
    });
  }
}
