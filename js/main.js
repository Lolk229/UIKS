// Главный файл - инициализация и обработчики событий
let mapRenderer;
let pathFinder;
let routeDrawer;
let currentPath = [];
let currentFloor = 1;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Создаем экземпляры классов
  mapRenderer = new MapRenderer(CONFIG.map);
  pathFinder = new PathFinder(CONFIG.points, CONFIG.corridorNodes);
  routeDrawer = new RouteDrawer(mapRenderer.map);

  // Загружаем первый этаж
  mapRenderer.loadFloor(1);

  // Устанавливаем обработчики событий
  setupEventListeners();

  console.log("Система навигации инициализирована");
  console.log("Коридорные узлы:", CONFIG.corridorNodes);
  console.log("Рёбра графа:", pathFinder.edges);
});

function setupEventListeners() {
  document.getElementById("findRoute").onclick = () => {
    const from = document.getElementById("fromRoom").value.trim();
    const to = document.getElementById("toRoom").value.trim();

    if (!from || !to) {
      alert("Пожалуйста, введите начальную и конечную точки");
      return;
    }

    console.log(`Поиск маршрута от ${from} до ${to}`);
    currentPath = pathFinder.findShortestPath(from, to);

    if (currentPath.length > 0) {
      routeDrawer.drawRoute(currentPath, currentFloor);
      routeDrawer.highlightFloorButtons(currentPath);
      console.log("Маршрут найден:", currentPath);
    } else {
      console.log("Маршрут не найден");
      alert(`Маршрут от ${from} до ${to} не найден`);
    }
  };

  document.getElementById("floor1").onclick = () => {
    currentFloor = 1;
    mapRenderer.loadFloor(1);
    if (currentPath.length > 0) {
      routeDrawer.drawRoute(currentPath, currentFloor);
    }
  };

  document.getElementById("floor2").onclick = () => {
    currentFloor = 2;
    mapRenderer.loadFloor(2);
    if (currentPath.length > 0) {
      routeDrawer.drawRoute(currentPath, currentFloor);
    }
  };

  // Очистка маршрута по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      currentPath = [];
      if (routeDrawer.routeLine) {
        routeDrawer.map.removeLayer(routeDrawer.routeLine);
        routeDrawer.routeLine = null;
      }
      routeDrawer.highlightFloorButtons([]);
      console.log("Маршрут очищен");
    }
  });
}
