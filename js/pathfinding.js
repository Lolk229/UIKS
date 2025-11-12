// Класс для поиска пути с использованием коридорной сети
class PathFinder {
  constructor(points, corridorNodes) {
    this.points = points;
    this.corridorNodes = corridorNodes;
    this.graph = this.buildGraph();
  }

  buildGraph() {
    const graph = new Map();

    console.log("Строим граф навигации...");

    // Инициализируем граф для всех узлов
    Object.keys(this.points).forEach(floor => {
      const floorNum = Number(floor);

      // Добавляем комнаты
      this.points[floor].forEach(point => {
        const nodeId = `${point.id}_${floorNum}`;
        graph.set(nodeId, {
          ...point,
          floor: floorNum,
          neighbors: []
        });
      });

      // Добавляем коридорные точки
      if (this.corridorNodes[floorNum]) {
        this.corridorNodes[floorNum].forEach(corridor => {
          const nodeId = `${corridor.id}_${floorNum}`;
          graph.set(nodeId, {
            ...corridor,
            floor: floorNum,
            neighbors: []
          });
        });
      }
    });

    // Создаем связи
    Object.keys(this.points).forEach(floor => {
      const floorNum = Number(floor);
      const corridors = this.corridorNodes[floorNum] || [];

      // 1. Соединяем комнаты с их дверными точками
      this.points[floor].forEach(point => {
        const doorPoint = corridors.find(c => c.room === point.id);
        if (doorPoint) {
          const roomId = `${point.id}_${floorNum}`;
          const doorId = `${doorPoint.id}_${floorNum}`;

          const distance = this.calculateDistance(point.coords, doorPoint.coords);

          // Двусторонняя связь
          if (graph.has(roomId)) {
            graph.get(roomId).neighbors.push({ id: doorId, distance });
          }
          if (graph.has(doorId)) {
            graph.get(doorId).neighbors.push({ id: roomId, distance });
          }

          console.log(`Связь: ${point.id} <-> ${doorPoint.id}, расстояние: ${Math.round(distance)}`);
        }
      });

      // 2. Соединяем все коридорные точки между собой
      for (let i = 0; i < corridors.length; i++) {
        for (let j = i + 1; j < corridors.length; j++) {
          const corridor1Id = `${corridors[i].id}_${floorNum}`;
          const corridor2Id = `${corridors[j].id}_${floorNum}`;

          const distance = this.calculateDistance(corridors[i].coords, corridors[j].coords);

          // Двусторонняя связь
          if (graph.has(corridor1Id)) {
            graph.get(corridor1Id).neighbors.push({ id: corridor2Id, distance });
          }
          if (graph.has(corridor2Id)) {
            graph.get(corridor2Id).neighbors.push({ id: corridor1Id, distance });
          }
        }
      }
    });

    // 3. Соединяем лестницы между этажами
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
            const stair1Id = `${stair1.id}_${floor1}`;
            const stair2Id = `${stair2.id}_${floor2}`;

            // Двусторонняя связь между этажами
            if (graph.has(stair1Id)) {
              graph.get(stair1Id).neighbors.push({ id: stair2Id, distance: 10 });
            }
            if (graph.has(stair2Id)) {
              graph.get(stair2Id).neighbors.push({ id: stair1Id, distance: 10 });
            }

            console.log(`Межэтажная связь: ${stair1.id} (${floor1}) <-> ${stair2.id} (${floor2})`);
          }
        });
      });
    }

    console.log(`Граф построен: ${graph.size} узлов`);

    // Отладка для Door_Б1-10
    const doorB110 = graph.get('Door_Б1-10_1');
    if (doorB110) {
      console.log(`Door_Б1-10 имеет ${doorB110.neighbors.length} соседей:`,
        doorB110.neighbors.slice(0, 5).map(n => n.id));
    }

    return graph;
  }

  calculateDistance(coords1, coords2) {
    return Math.hypot(coords1[0] - coords2[0], coords1[1] - coords2[1]);
  }

  findShortestPath(startId, endId) {
    console.log(`Поиск пути от ${startId} до ${endId}`);

    // Находим начальную точку на любом этаже
    let startNodeId = null;
    for (const [nodeId, node] of this.graph.entries()) {
      if (node.id === startId) {
        startNodeId = nodeId;
        break;
      }
    }

    if (!startNodeId) {
      console.error(`Начальная точка ${startId} не найдена`);
      return [];
    }

    // BFS поиск
    const queue = [startNodeId];
    const visited = new Set();
    const parent = new Map();

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const currentNode = this.graph.get(currentId);
      if (!currentNode) continue;

      console.log(`Обрабатываем: ${currentId} (соседей: ${currentNode.neighbors.length})`);

      // Проверяем, достигли ли цели
      if (currentNode.id === endId) {
        console.log(`✅ Цель найдена: ${currentId}`);

        // Восстанавливаем путь
        const path = [];
        let nodeId = currentId;
        while (nodeId) {
          path.unshift(nodeId);
          nodeId = parent.get(nodeId);
        }

        console.log(`Путь найден (${path.length} шагов):`, path);
        return path;
      }

      // Обрабатываем соседей
      currentNode.neighbors.forEach(neighbor => {
        if (!visited.has(neighbor.id) && !parent.has(neighbor.id)) {
          parent.set(neighbor.id, currentId);
          queue.push(neighbor.id);
        }
      });
    }

    console.error(`❌ Путь от ${startId} до ${endId} не найден`);
    console.log(`Посещено узлов: ${visited.size}`);
    return [];
  }
}
