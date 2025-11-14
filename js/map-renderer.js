// Класс для управления картой и отрисовки точек
class MapRenderer {
  constructor(config) {
    this.config = config;
    this.map = this.initializeMap();
    this.overlay = null;
    this.markers = [];
    this.setupClickHandler();
  }

  initializeMap() {
    return L.map("map", this.config.settings);
  }

  loadFloor(floor) {
    const { url, size } = this.config.floorImages[floor];
    const bounds = [[0, 0], size];

    if (this.overlay) this.map.removeLayer(this.overlay);
    this.overlay = L.imageOverlay(url, bounds).addTo(this.map);
    this.map.fitBounds(bounds);

    this.renderPoints(floor);
  }

  renderPoints(floor) {
    // Удаляем старые маркеры
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    // Добавляем маркеры для текущего этажа (только видимые точки)
    CONFIG.points[floor].forEach(p => {
      const marker = this.createMarker(p);
      this.markers.push(marker);
    });

    // Опционально: показываем коридорные узлы для отладки (закомментировано)
     this.renderCorridorNodes(floor);
  }

  renderCorridorNodes(floor) {
    // Для отладки - показываем коридорные узлы
    const corridorNodes = CONFIG.corridorNodes[floor] || [];
    corridorNodes.forEach(node => {
      const marker = L.circleMarker(node.coords, {
        radius: 3,
        color: "yellow",
        fillColor: "yellow",
        fillOpacity: 0.5
      }).addTo(this.map);
      marker.bindPopup(`Коридор: ${node.id}`);
      this.markers.push(marker);
    });
  }

  createMarker(point) {
    let color;
    switch (point.type) {
      case "room": color = "red"; break;
      case "stair": color = "blue"; break;
      case "toilet": color = "green"; break;
      default: color = "gray";
    }

    const marker = L.circleMarker(point.coords, {
      radius: 6,
      color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(this.map);

    marker.bindPopup(point.name);
    return marker;
  }

  setupClickHandler() {
    this.map.on("click", (e) => {
      const leafletY = e.latlng.lat;
      const leafletX = e.latlng.lng;
      const photoshopY = this.config.imageHeight - leafletY;
      const photoshopX = leafletX;

      console.log(`Leaflet coords: [${leafletY.toFixed(1)}, ${leafletX.toFixed(1)}]`);
      console.log(`Photoshop coords: x=${photoshopX.toFixed(1)}, y=${photoshopY.toFixed(1)}`);

      const tempMarker = L.circleMarker([leafletY, leafletX], {
        radius: 4,
        color: "orange",
        fillColor: "orange",
        fillOpacity: 0.8
      }).addTo(this.map);

      tempMarker.bindPopup(
        `<b>Leaflet:</b> [${leafletY.toFixed(1)}, ${leafletX.toFixed(1)}]<br>
         <b>Photoshop:</b> x=${photoshopX.toFixed(1)}, y=${photoshopY.toFixed(1)}`
      ).openPopup();

      setTimeout(() => this.map.removeLayer(tempMarker), 5000);
    });
  }
}
