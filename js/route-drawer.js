// Отрисовка маршрута: берём узлы пути на текущем этаже и рисуем ломаную без «искусственных» смещений.
// Важно: сам граф уже гарантирует движение по оси коридора.

class RouteDrawer {
  constructor(map) {
    this.map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (!path || path.length === 0) return;

    // Оставляем ключи пути текущего этажа
    const floorKeys = path.filter(key => {
      const [, floor] = key.split("_");
      return Number(floor) === currentFloor;
    });

    if (floorKeys.length === 0) return;

    const coords = this.getPathCoordinates(floorKeys, currentFloor);
    if (coords.length === 0) return;

    if (coords.length === 1) {
      this.routeLine = L.circleMarker(coords[0], {
        radius: 7,
        color: "green",
        fillColor: "green",
        fillOpacity: 0.6,
        weight: 2
      }).addTo(this.map);
      return;
    }

    // Прямая отрисовка ломаной по узлам пути
    this.routeLine = L.polyline(coords, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathCoordinates(pathKeys, floor) {
    return pathKeys.map(key => {
      const [id] = key.split("_");

      // 1) пробуем найти в points
      let p = CONFIG.points[floor]?.find(pt => pt.id === id);
      if (p) return p.coords;

      // 2) иначе ищем среди corridorNodes (door или corridor)
      const c = CONFIG.corridorNodes[floor]?.find(n => n.id === id);
      return c ? c.coords : null;
    }).filter(Boolean);
  }

  // Подсветка кнопок этажей как было
  highlightFloorButtons(path) {
    document.getElementById("floor1").style.backgroundColor = "";
    document.getElementById("floor2").style.backgroundColor = "";

    if (!path || path.length === 0) return;

    const floors = new Set();
    path.forEach(key => {
      const [, floor] = key.split("_");
      floors.add(Number(floor));
    });
    const arr = Array.from(floors).sort();

    if (arr.length > 1) {
      const startFloor = Number(path[0].split("_")[1]);
      const endFloor = Number(path[path.length - 1].split("_")[1]);
      const startBtn = document.getElementById(`floor${startFloor}`);
      const endBtn = document.getElementById(`floor${endFloor}`);
      if (startBtn) startBtn.style.backgroundColor = "#ffcccc";
      if (endBtn) endBtn.style.backgroundColor = "#ccffcc";
    }
  }
}
