// Класс для отрисовки маршрутов по коридорам
class RouteDrawer {
  constructor(map) {
    this.map = map;
    this.routeLine = null;
  }

  drawRoute(path, currentFloor) {
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (path.length === 0) return;

    // Фильтруем путь для текущего этажа
    const currentFloorPath = path.filter(key => {
      const [, floor] = key.split("_");
      return Number(floor) === currentFloor;
    });

    if (currentFloorPath.length === 0) return;

    // Получаем координаты всех точек пути
    const pathCoords = this.getPathCoordinates(currentFloorPath, currentFloor);

    if (pathCoords.length < 2) {
      if (pathCoords.length === 1) {
        this.routeLine = L.circleMarker(pathCoords[0], {
          radius: 8,
          color: "green",
          fillColor: "green",
          fillOpacity: 0.5,
          weight: 3
        }).addTo(this.map);
      }
      return;
    }

    // Создаем маршрут с правильными входами/выходами
    const corridorRoute = this.createCorridorRoute(pathCoords);
    this.routeLine = L.polyline(corridorRoute, { color: "green", weight: 3 }).addTo(this.map);
  }

  getPathCoordinates(pathKeys, floor) {
    return pathKeys.map(key => {
      const [id] = key.split("_");

      // Ищем в обычных точках
      let point = CONFIG.points[floor]?.find(pt => pt.id === id);

      // Если не найдено, ищем в коридорных узлах
      if (!point) {
        point = CONFIG.corridorNodes[floor]?.find(node => node.id === id);
      }

      return point ? point.coords : null;
    }).filter(Boolean);
  }

  createCorridorRoute(pathCoords) {
    if (pathCoords.length < 2) return pathCoords;

    const corridorRoute = [];
    const offset = CONFIG.routing.corridorOffset;

    for (let i = 0; i < pathCoords.length; i++) {
      const current = pathCoords[i];
      const isStart = (i === 0);
      const isEnd = (i === pathCoords.length - 1);

      if (isStart) {
        // Выход из начальной точки вниз
        corridorRoute.push(current);
        if (pathCoords.length > 1) {
          corridorRoute.push([current[0], current[1] + offset]);
        }
      } else if (isEnd) {
        // Заход в конечную точку сверху
        const prev = pathCoords[i - 1];
        corridorRoute.push([current[0], current[1] - offset]);
        corridorRoute.push(current);
      } else {
        // Промежуточные точки
        corridorRoute.push(current);
      }
    }

    return this.optimizeCorridorRoute(corridorRoute);
  }

  optimizeCorridorRoute(route) {
    if (route.length < 3) return route;

    const optimized = [route[0]];

    for (let i = 1; i < route.length - 1; i++) {
      const prev = route[i - 1];
      const current = route[i];
      const next = route[i + 1];

      // Создаем L-образные повороты
      if (Math.abs(prev[0] - current[0]) < 5) {
        // Вертикальное движение, поворачиваем горизонтально
        optimized.push([current[0], current[1]]);
        optimized.push([next[0], current[1]]);
      } else if (Math.abs(prev[1] - current[1]) < 5) {
        // Горизонтальное движение, поворачиваем вертикально
        optimized.push([current[0], current[1]]);
        optimized.push([current[0], next[1]]);
      } else {
        optimized.push(current);
      }
    }

    optimized.push(route[route.length - 1]);
    return optimized;
  }

  highlightFloorButtons(path) {
    // Сбрасываем подсветку
    document.getElementById("floor1").style.backgroundColor = "";
    document.getElementById("floor2").style.backgroundColor = "";

    if (path.length === 0) return;

    // Определяем этажи в маршруте
    const floors = new Set();
    path.forEach(key => {
      const [, floor] = key.split("_");
      floors.add(Number(floor));
    });

    const floorsArray = Array.from(floors).sort();

    if (floorsArray.length > 1) {
      const startFloor = Number(path[0].split("_")[1]);
      const endFloor = Number(path[path.length - 1].split("_")[1]);

      // Красным подсвечиваем начальный этаж, зеленым - конечный
      document.getElementById(`floor${startFloor}`).style.backgroundColor = "#ffcccc";
      document.getElementById(`floor${endFloor}`).style.backgroundColor = "#ccffcc";
    }
  }
}