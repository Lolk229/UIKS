// Класс для поиска пути с использованием коридорной сети
class PathFinder {
  constructor(points, corridorNodes) {
    this.points = points;
    this.corridorNodes = corridorNodes;
    this.edges = this.generateEdges();
    this.allNodes = this.getAllNodes();
  }
  
  getAllNodes() {
    const nodes = [];
    
    // Добавляем все комнаты, лестницы, туалеты
    Object.keys(this.points).forEach(floor => {
      this.points[floor].forEach(p => nodes.push({ ...p, floor: Number(floor) }));
    });
    
    // Добавляем коридорные узлы
    Object.keys(this.corridorNodes).forEach(floor => {
      const floorNum = Number(floor);
      if (this.corridorNodes[floorNum]) {
        this.corridorNodes[floorNum].forEach(node => {
          nodes.push({ ...node, floor: floorNum });
        });
      }
    });
    
    return nodes;
  }
  
  generateEdges() {
    const edges = [];
    
    // Создаем связи для каждого этажа
    for (const [floor, pts] of Object.entries(this.points)) {
      const floorNum = Number(floor);
      const corridors = this.corridorNodes[floorNum] || [];
      
      // 1. Соединяем комнаты ТОЛЬКО с их дверными коридорными точками
      pts.forEach(point => {
        const doorPoint = corridors.find(c => c.room === point.id);
        if (doorPoint) {
          const dist = this.calculateDistance(point.coords, doorPoint.coords);
          edges.push({
            from: point.id,
            to: doorPoint.id,
            distance: dist,
            floor: floorNum,
            type: 'room_to_door'
          });
        }
      });
      
      // 2. Соединяем все коридорные точки между собой (создаем полную сеть коридоров)
      for (let i = 0; i < corridors.length; i++) {
        for (let j = i + 1; j < corridors.length; j++) {
          const dist = this.calculateDistance(corridors[i].coords, corridors[j].coords);
          // Увеличиваем максимальное расстояние для соединения коридорных точек
          if (dist <= 400) {
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
    
    // 3. Соединяем лестницы между этажами
    this.addStairConnections(edges);
    
    return edges;
  }

  calculateDistance(coords1, coords2) {
    return Math.hypot(coords1[0] - coords2[0], coords1[1] - coords2[1]);
  }

  addStairConnections(edges) {
    const floors = Object.keys(this.points).map(Number).sort();
    
    for (let i = 0; i < floors.length - 1; i++) {
      const floor1 = floors[i];
      const floor2 = floors[i + 1];
      
      const stairs1 = this.points[floor1].filter(p => p.type === 'stair');
      const stairs2 = this.points[floor2].filter(p => p.type === 'stair');
      
      stairs1.forEach(stair1 => {
        stairs2.forEach(stair2 => {
          const coordDistance = this.calculateDistance(stair1.coords, stair2.coords);
          
          if (coordDistance <= 50) {
            edges.push({
              from: stair1.id,
              to: stair2.id,
              fromFloor: floor1,
              toFloor: floor2,
              distance: 10,
              type: 'between_floors'
            });
          }
        });
      });
    }
  }

  findShortestPath(startId, endId) {
    if (!this.allNodes || this.allNodes.length === 0) {
      console.error("Узлы не инициализированы");
      return [];
    }

    const distances = {};
    const prev = {};
    const queue = [];

    // Инициализация
    this.allNodes.forEach(n => {
      const key = `${n.id}_${n.floor}`;
      distances[key] = Infinity;
      queue.push(key);
    });

    const startNode = this.allNodes.find(n => n.id === startId);
    if (!startNode) {
      console.error(`Начальная точка ${startId} не найдена`);
      return [];
    }
    
    const startKey = `${startNode.id}_${startNode.floor}`;
    distances[startKey] = 0;

    // Алгоритм Дейкстры
    while (queue.length > 0) {
      const u = queue.reduce((min, n) =>
        distances[n] < distances[min] ? n : min
      );
      queue.splice(queue.indexOf(u), 1);

      if (distances[u] === Infinity) break;

      const [uId, uFloor] = u.split("_");
      const uFloorNum = Number(uFloor);

      this.edges.forEach(e => {
        let neighbor, neighborFloor;
        
        if (e.type === 'room_to_door' || e.type === 'corridor_to_corridor') {
          if (e.floor !== uFloorNum) return;
          
          if (e.from === uId) {
            neighbor = e.to;
            neighborFloor = uFloorNum;
          } else if (e.to === uId) {
            neighbor = e.from;
            neighborFloor = uFloorNum;
          } else {
            return;
          }
        } else if (e.type === 'between_floors') {
          if (e.from === uId && e.fromFloor === uFloorNum) {
            neighbor = e.to;
            neighborFloor = e.toFloor;
          } else if (e.to === uId && e.toFloor === uFloorNum) {
            neighbor = e.from;
            neighborFloor = e.fromFloor;
          } else {
            return;
          }
        } else {
          return;
        }

        const vKey = `${neighbor}_${neighborFloor}`;
        if (!queue.includes(vKey)) return;
        
        const alt = distances[u] + e.distance;
        if (alt < distances[vKey]) {
          distances[vKey] = alt;
          prev[vKey] = u;
        }
      });
    }

    // Находим путь к конечной точке
    const possibleEnds = Object.keys(distances).filter(k => k.startsWith(endId + '_'));
    if (possibleEnds.length === 0) {
      console.error(`Конечная точка ${endId} не найдена`);
      return [];
    }
    
    const bestEnd = possibleEnds.reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );

    if (distances[bestEnd] === Infinity) {
      console.error(`Путь от ${startId} до ${endId} не найден`);
      return [];
    }

    // Восстанавливаем путь
    const path = [];
    let u = bestEnd;
    while (u) {
      path.unshift(u);
      u = prev[u];
    }
    
    return path;
  }
}
