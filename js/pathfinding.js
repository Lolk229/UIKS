// Алгоритм поиска пути
class PathFinder {
  constructor(points, corridorNodes) {
    this.points = points;
    this.corridorNodes = corridorNodes;
    this.edges = this.generateEdges();
  }

  generateEdges() {
    // Генерация рёбер с учетом коридорных узлов
    const edges = [];

    for (const [floor, pts] of Object.entries(this.points)) {
      const floorNum = Number(floor);
      const corridors = this.corridorNodes[floorNum] || [];

      // Соединяем комнаты с ближайшими коридорными узлами
      pts.forEach(point => {
        const nearestCorridors = this.findNearestCorridors(point, corridors, 2);
        nearestCorridors.forEach(corridor => {
          const dist = this.calculateDistance(point.coords, corridor.coords);
          edges.push({
            from: point.id,
            to: corridor.id,
            distance: dist,
            floor: floorNum,
            type: 'room_to_corridor'
          });
        });
      });

      // Соединяем коридорные узлы между собой
      for (let i = 0; i < corridors.length; i++) {
        for (let j = i + 1; j < corridors.length; j++) {
          const dist = this.calculateDistance(corridors[i].coords, corridors[j].coords);
          if (dist <= 200) { // Максимальное расстояние между коридорными узлами
            edges.push({
              from: corridors[i].id,
              to: corridors[j].id,
              distance: dist,
              floor: floorNum,
              type: 'corridor_to_corridor'
            });
          }
        }
      }
    }

    // Соединяем лестницы между этажами
    this.addStairConnections(edges);

    return edges;
  }

  findNearestCorridors(point, corridors, count = 2) {
    return corridors
      .map(corridor => ({
        corridor,
        distance: this.calculateDistance(point.coords, corridor.coords)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.corridor);
  }

  calculateDistance(coords1, coords2) {
    return Math.hypot(coords1[0] - coords2[0], coords1[1] - coords2[1]);
  }

  addStairConnections(edges) {
    // Логика соединения лестниц между этажами
    // ... существующий код
  }

  findShortestPath(startId, endId) {
    // Алгоритм Дейкстры
    // ... существующий код
  }
}