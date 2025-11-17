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
});

function setupEventListeners() {
  // ===== ГАМБУРГЕР-МЕНЮ (мобильные) =====
  const toggleBtn = document.getElementById("togglePanel");
  const panel = document.getElementById("panel");

  if (toggleBtn && panel) {
    toggleBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      panel.classList.toggle("panel-collapsed");
      toggleBtn.classList.toggle("active");
      console.log("Панель переключена:", !panel.classList.contains("panel-collapsed") ? "открыта" : "закрыта");
    });
  }

  // ===== КНОПКИ БЫСТРОГО ДОСТУПА =====
  const quickButtons = document.querySelectorAll(".quick-btn");
  quickButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const roomId = this.getAttribute("data-room");
      const toInput = document.getElementById("toRoom");

      // Заполняем поле "Куда"
      toInput.value = roomId;
      toInput.focus();

      // Если есть начальная точка - сразу строим маршрут
      const fromInput = document.getElementById("fromRoom");
      if (fromInput.value.trim()) {
        findAndDrawRoute();
      }

      console.log(`Быстрый доступ: ${roomId}`);
    });
  });

  // ===== ПОСТРОЕНИЕ МАРШРУТА =====
  const findRouteBtn = document.getElementById("findRoute");
  if (findRouteBtn) {
    findRouteBtn.addEventListener("click", findAndDrawRoute);
  }

  // ===== ОЧИСТКА МАРШРУТА =====
  const clearBtn = document.getElementById("clearRoute");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearRoute);
  }

  // ===== ПЕРЕКЛЮЧАТЕЛЬ ЭТАЖЕЙ =====
  const floor1Btn = document.getElementById("floor1");
  const floor2Btn = document.getElementById("floor2");
  const floor3Btn = document.getElementById("floor3");
  const floor4Btn = document.getElementById("floor4");
  const floor5Btn = document.getElementById("floor5");

  if (floor1Btn) {
    floor1Btn.addEventListener("click", function() {
      switchFloor(1);
    });
  }

  if (floor2Btn) {
    floor2Btn.addEventListener("click", function() {
      switchFloor(2);
    });
  }

  if (floor3Btn) {
    floor3Btn.addEventListener("click", function() {
      switchFloor(3);
    });
  }

  if (floor4Btn) {
    floor4Btn.addEventListener("click", function() {
      switchFloor(4);
    });
  }

  if (floor5Btn) {
    floor5Btn.addEventListener("click", function() {
      switchFloor(5);
    });
  }

  // ===== ОЧИСТКА МАРШРУТА ПО ESCAPE =====
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      clearRoute();
    }
  });
}

// Функция построения маршрута
function findAndDrawRoute() {
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

    // Автозакрытие панели на мобильных (опционально)
    if (window.innerWidth <= 768) {
      setTimeout(function() {
        const panel = document.getElementById("panel");
        const toggleBtn = document.getElementById("togglePanel");
        if (panel && !panel.classList.contains("panel-collapsed")) {
          panel.classList.add("panel-collapsed");
          if (toggleBtn) toggleBtn.classList.remove("active");
        }
      }, 1500);
    }
  } else {
    console.log("Маршрут не найден");
    alert(`Маршрут от ${from} до ${to} не найден. Проверьте правильность названий аудиторий.`);
  }
}

// Функция очистки маршрута
function clearRoute() {
  currentPath = [];

  // Удаляем линию маршрута
  if (routeDrawer.routeLine) {
    routeDrawer.map.removeLayer(routeDrawer.routeLine);
    routeDrawer.routeLine = null;
  }

  // Сбрасываем подсветку кнопок этажей
  routeDrawer.highlightFloorButtons([]);

  // Очищаем поля ввода
  document.getElementById("fromRoom").value = "";
  document.getElementById("toRoom").value = "";

  console.log("Маршрут очищен");
}

// Функция переключения этажа
function switchFloor(floor) {
  currentFloor = floor;
  mapRenderer.loadFloor(floor);

  // Обновляем активное состояние кнопок
  const floor1Btn = document.getElementById("floor1");
  const floor2Btn = document.getElementById("floor2");
  const floor3Btn = document.getElementById("floor3");
  const floor4Btn = document.getElementById("floor4");
  const floor5Btn = document.getElementById("floor5");

  if (floor1Btn) floor1Btn.classList.toggle("active", floor === 1);
  if (floor2Btn) floor2Btn.classList.toggle("active", floor === 2);
  if (floor3Btn) floor3Btn.classList.toggle("active", floor === 3);
  if (floor4Btn) floor4Btn.classList.toggle("active", floor === 4);
  if (floor5Btn) floor5Btn.classList.toggle("active", floor === 5);

  // Перерисовываем маршрут если он есть
  if (currentPath.length > 0) {
    routeDrawer.drawRoute(currentPath, currentFloor);
  }

  console.log(`Переключено на этаж ${floor}`);
}
