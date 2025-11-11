// Координаты карты (по пикселям изображения)
const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 2
});

// Размер изображения (пример: 2000x1000 пикселей)
const floorImages = {
  1: { url: "images/1Этаж.png", size: [1440, 2560] },
  2: { url: "images/2Этаж.png", size: [1440, 2560] }
};

// Координаты точек (аудитории, лестницы и т.п.)
const points = {
  1: [
    { id: "Б1-1", name: "Б1-1", coords: [270, 1060], type: "room" },
    { id: "Б1-2", name: "Б1-2", coords: [350, 1040], type: "room" },
    { id: "Б1-3", name: "Б1-3", coords: [270, 996], type: "room" },
    { id: "Б1-4", name: "Б1-4", coords: [350, 980], type: "room" },
    { id: "Б1-5", name: "Б1-5", coords: [270, 960], type: "room" },
    { id: "Б1-6", name: "Б1-6", coords: [350, 920], type: "room" },
    { id: "Б1-7", name: "Б1-7", coords: [270, 725], type: "room" },
    { id: "Б1-8", name: "Б1-8", coords: [350, 882], type: "room" },
    { id: "Б1-9", name: "Б1-9", coords: [270, 670], type: "room" },
    { id: "Б1-10", name: "Б1-10", coords: [350, 805], type: "room" },
    { id: "Б1-11", name: "Б1-11", coords: [270, 592], type: "room" },
    { id: "Б1-12", name: "Б1-12", coords: [350, 765], type: "room" },
    { id: "Туалет", name: "Туалет", coords: [350, 675], type: "toilet" },
    { id: "S1", name: "Лестница 1", coords: [320, 1075], type: "stair" },
    { id: "S2", name: "Лестница 2", coords: [310, 460], type: "stair" }
  ],
  2: [
    { id: "Б2-1", name: "Б2-1", coords: [285, 980], type: "room" },
    { id: "Б2-2", name: "Б2-2", coords: [360, 943], type: "room" },
    { id: "Б2-3", name: "Б2-3", coords: [285, 883], type: "room" },
    { id: "Б2-4", name: "Б2-4", coords: [360, 820], type: "room" },
    { id: "Б2-5", name: "Б2-5", coords: [285, 775], type: "room" },
    { id: "Б2-6", name: "Б2-6", coords: [360, 713], type: "room" },
    { id: "Б2-7", name: "Б2-7", coords: [285, 623], type: "room" },
    { id: "Б2-8", name: "Б2-8", coords: [360, 652], type: "room" },
    { id: "Б2-9", name: "Б2-9", coords: [285, 565], type: "room" },
    { id: "Туалет", name: "Туалет", coords: [360, 613], type: "toilet" },
    { id: "Б2-10", name: "Б2-10", coords: [360, 565], type: "room" },
    { id: "Б2-11", name: "Б2-11", coords: [285, 565], type: "room" },
    { id: "Б2-12", name: "Б2-12", coords: [360, 500], type: "room" },
    { id: "S1", name: "Лестница 1 (на 1 этаж)", coords: [335, 1040], type: "stair" },
    { id: "S2", name: "Лестница 2 (на 1 этаж)", coords: [325, 420], type: "stair" }
  ]
};

// Рёбра графа (связи)
// Создаём карту, добавляем слои, инициализируем этаж
let currentFloor = 1;
let overlay;
let markers = [];
let routeLine;

const edges = generateEdges(points, 200);
console.log(edges);
renderPoints(1);


// Выделение разными точками разных типов кабинетов
function renderPoints(floor) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  points[floor].forEach(p => {
    let color;
    switch (p.type) {
      case "room": color = "red"; break;
      case "stair": color = "blue"; break;
      case "toilet": color = "green"; break;
      default: color = "gray";
    }

    const marker = L.circleMarker(p.coords, {
      radius: 6,
      color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`${p.name}`);
    markers.push(marker);
  });
}

// Функция загрузки этажа
function loadFloor(floor) {
  const { url, size } = floorImages[floor];
  const bounds = [[0, 0], size];
  if (overlay) map.removeLayer(overlay);
  overlay = L.imageOverlay(url, bounds).addTo(map);
  map.fitBounds(bounds);
  renderPoints(floor);
}

// Алгоритм Дейкстры
function findShortestPath(startId, endId) {
  const allNodes = [];
  Object.keys(points).forEach(floor => {
    points[floor].forEach(p => allNodes.push({ ...p, floor: Number(floor) }));
  });

  const distances = {};
  const prev = {};
  const queue = [];

  allNodes.forEach(n => {
    const key = `${n.id}_${n.floor}`;
    distances[key] = Infinity;
    queue.push(key);
  });

  const startNode = allNodes.find(n => n.id === startId);
  const startKey = `${startNode.id}_${startNode.floor}`;
  distances[startKey] = 0;

  while (queue.length > 0) {
    const u = queue.reduce((min, n) =>
      distances[n] < distances[min] ? n : min
    );
    queue.splice(queue.indexOf(u), 1);

    const [uId, uFloor] = u.split("_");
    const uFloorNum = Number(uFloor);

    edges.forEach(e => {
      if (e.floor && e.floor !== uFloorNum) return;
      let neighbor, neighborFloor = uFloorNum;

      if (e.from === uId && e.floor === uFloorNum) neighbor = e.to;
      else if (e.to === uId && e.floor === uFloorNum) neighbor = e.from;
      else if (e.from === uId && e.fromFloor === uFloorNum) {
        neighbor = e.to;
        neighborFloor = e.toFloor;
      } else if (e.to === uId && e.toFloor === uFloorNum) {
        neighbor = e.from;
        neighborFloor = e.fromFloor;
      } else return;

      const vKey = `${neighbor}_${neighborFloor}`;
      const alt = distances[u] + e.distance;
      if (alt < distances[vKey]) {
        distances[vKey] = alt;
        prev[vKey] = u;
      }
    });
  }

  const endNode = allNodes.find(n => n.id === endId);
  const possibleEnds = Object.keys(distances).filter(k => k.startsWith(endId));
  const bestEnd = possibleEnds.reduce((a, b) =>
    distances[a] < distances[b] ? a : b
  );

  const path = [];
  let u = bestEnd;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }
  return path;
}

function drawRoute(path) {
  if (routeLine) map.removeLayer(routeLine);

  const coords = path.map(key => {
    const [id, floor] = key.split("_");
    const p = points[floor].find(pt => pt.id === id);
    return p ? p.coords : null;
  }).filter(Boolean);

  routeLine = L.polyline(coords, { color: "green", weight: 3 }).addTo(map);
}

// Слушатели
document.getElementById("findRoute").onclick = () => {
  const from = document.getElementById("fromRoom").value.trim();
  const to = document.getElementById("toRoom").value.trim();
  const path = findShortestPath(from, to);
  drawRoute(path);
  console.log("Маршрут:", path);
};

document.getElementById("floor1").onclick = () => { currentFloor = 1; loadFloor(1); };
document.getElementById("floor2").onclick = () => { currentFloor = 2; loadFloor(2); };



// === 🧭 Инструмент для получения координат при клике ===

// Размер твоего изображения (обязательно укажи реальную высоту!)
const imageHeight = 1440; // <-- подставь реальную высоту изображения в пикселях

map.on("click", function (e) {
  // Получаем координаты Leaflet (в CRS.Simple)
  const leafletY = e.latlng.lat;
  const leafletX = e.latlng.lng;

  // Переводим обратно в "координаты Photoshop"
  const photoshopY = imageHeight - leafletY;
  const photoshopX = leafletX;

  console.log(`Leaflet coords: [${leafletY.toFixed(1)}, ${leafletX.toFixed(1)}]`);
  console.log(`Photoshop coords: x=${photoshopX.toFixed(1)}, y=${photoshopY.toFixed(1)}`);

  // Создаём временный маркер, чтобы визуально видеть точку
  const tempMarker = L.circleMarker([leafletY, leafletX], {
    radius: 4,
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.8
  }).addTo(map);

  tempMarker.bindPopup(
    `<b>Leaflet:</b> [${leafletY.toFixed(1)}, ${leafletX.toFixed(1)}]<br>
     <b>Photoshop:</b> x=${photoshopX.toFixed(1)}, y=${photoshopY.toFixed(1)}`
  ).openPopup();

  // Удаляем временный маркер через 5 секунд
  setTimeout(() => map.removeLayer(tempMarker), 5000);
});





loadFloor(currentFloor);
