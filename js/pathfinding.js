// Навигатор по зданию:  граф "комната → дверь → ось коридора → дверь → комната"
// Координаты ВСЕХ точек в CONFIG заданы в формате [y, x] (Leaflet:  lat, lng)

class PathFinder {
  constructor(points, corridorNodes) {
    this.points = points;
    this.corridorNodes = corridorNodes;
    this.graph = this.buildGraph();
  }

  static dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

  static addEdge(graph, aId, bId, distance) {
    if (!graph.has(aId) || !graph.has(bId)) return;
    const A = graph.get(aId);
    const B = graph.get(bId);
    if (!A. neighbors. some(n => n.id === bId)) A.neighbors.push({ id: bId, distance });
    if (!B.neighbors.some(n => n.id === aId)) B.neighbors.push({ id: aId, distance });
  }

  buildGraph() {
    const graph = new Map();

    const {
      maxCorridorDistance = (CONFIG?. routing?.maxCorridorDistance ??  120),
      maxRoomToCorridorDistance = (CONFIG?.routing?.maxRoomToCorridorDistance ?? 80),
      stairConnectionDistance = (CONFIG?.routing?.stairConnectionDistance ?? 50),
      axisTolerance = (CONFIG?.routing?. axisTolerance ?? 18),
      doorAlignTolerance = (CONFIG?.routing?. doorAlignTolerance ?? 16),
    } = CONFIG?.routing || {};

    // 1) Регистрируем комнаты/лестницы/туалеты
    Object.entries(this.points).forEach(([floor, arr]) => {
      const f = Number(floor);
      arr.forEach(p => {
        const id = `${p.id}_${f}`;
        graph.set(id, { id:  p.id, floor: f, type: p.type, coords: p.coords, neighbors: [] });
      });
    });

    // 2) Регистрируем corridorNodes (door + corridor)
    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      arr.forEach(n => {
        const id = `${n.id}_${f}`;
        graph.set(id, {
          id: n.id,
          floor: f,
          type: n.type || 'corridor',
          room: n.room || null,
          coords: n. coords,
          neighbors: []
        });
      });
    });

    // 3) Комната → (все её) двери
    Object.entries(this.points).forEach(([floor, arr]) => {
      const f = Number(floor);
      const doors = (this.corridorNodes[f] || []).filter(n => n.type === 'door');
      arr.forEach(room => {
        doors.filter(d => d.room === room.id).forEach(door => {
          PathFinder.addEdge(
            graph,
            `${room.id}_${f}`,
            `${door.id}_${f}`,
            PathFinder.dist(room.coords, door.coords)
          );
        });
      });
    });

    // 4) Дверь → коридор
    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      const doors = arr.filter(n => n.type === 'door');
      const corridors = arr.filter(n => n.type === 'corridor');

      doors.forEach(d => {
        const dId = `${d.id}_${f}`;
        const aligned = corridors
          .map(c => {
            const dX = Math.abs(d.coords[1] - c.coords[1]);
            const dY = Math. abs(d.coords[0] - c.coords[0]);
            return {
              c,
              d:  PathFinder.dist(d.coords, c.coords),
              aligned: (dX <= doorAlignTolerance) || (dY <= doorAlignTolerance)
            };
          })
          .filter(o => o. d <= maxRoomToCorridorDistance && o.aligned)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);

        aligned.forEach(n => {
          PathFinder. addEdge(graph, dId, `${n.c.id}_${f}`, n.d);
        });
      });
    });

    // 5) Corridor → corridor
    Object.entries(this. corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      const corridors = arr.filter(n => n.type === 'corridor');

      const groupsH = [];
      corridors.forEach(c => {
        let g = groupsH.find(g => Math.abs(g.y - c.coords[0]) <= axisTolerance);
        if (!g) { g = { y: c.coords[0], items: [] }; groupsH.push(g); }
        g.items.push(c);
      });
      groupsH.forEach(g => {
        g.items.sort((a, b) => a.coords[1] - b.coords[1]);
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder.addEdge(graph, `${A.id}_${f}`, `${B.id}_${f}`, d);
          }
        }
      });

      const groupsV = [];
      corridors.forEach(c => {
        let g = groupsV.find(g => Math. abs(g.x - c. coords[1]) <= axisTolerance);
        if (!g) { g = { x: c. coords[1], items: [] }; groupsV.push(g); }
        g.items. push(c);
      });
      groupsV.forEach(g => {
        g.items. sort((a, b) => a.coords[0] - b. coords[0]);
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder. addEdge(graph, `${A.id}_${f}`, `${B.id}_${f}`, d);
          }
        }
      });
    });

    // 6) Лестницы между этажами
    const floors = Object.keys(this. points).map(Number).sort();
    for (let i = 0; i < floors.length - 1; i++) {
      const f1 = floors[i], f2 = floors[i + 1];
      const stairs1 = this.points[f1].filter(p => p. type === 'stair');
      const stairs2 = this. points[f2].filter(p => p. type === 'stair');

      stairs1.forEach(s1 => {
        stairs2.forEach(s2 => {
          if (s1.id === s2.id) {
            PathFinder.addEdge(graph, `${s1.id}_${f1}`, `${s2.id}_${f2}`, 10);
            console.log(`Связаны лестницы: ${s1.id}_${f1} <-> ${s2.id}_${f2}`);
          }
        });
      });
    }

    console.log("Граф построен (узлов):", graph.size);
    return graph;
  }

  // НОВЫЙ МЕТОД: findPath для совместимости с main.js
  findPath(fromId, toId) {
    let startKeys = [];
    let endKeys = [];

    this.graph.forEach((node, key) => {
      if (node.id === fromId) startKeys.push(key);
      if (node.id === toId) endKeys.push(key);
    });

    if (startKeys.length === 0) {
      return { path: null, error: `Точка "${fromId}" не найдена` };
    }
    if (endKeys.length === 0) {
      return { path: null, error: `Точка "${toId}" не найдена` };
    }

    console. log(`Ищем маршрут от ${fromId} до ${toId}`);

    // Используем существующий BFS метод
    const path = this.findShortestPath(fromId, toId);

    if (!path || path.length === 0) {
      return { path: null, error: 'Маршрут не найден' };
    }

    // Вычисляем длину маршрута
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const nodeA = this.graph.get(path[i]);
      const nodeB = this.graph.get(path[i + 1]);
      if (nodeA && nodeB) {
        distance += PathFinder.dist(nodeA.coords, nodeB.coords);
      }
    }

    console.log(`Маршрут найден! Длина: ${distance.toFixed(1)}, узлов: ${path.length}`);
    return { path, distance };
  }

  // BFS
  findShortestPath(startId, endId) {
    console.log(`Поиск пути от ${startId} до ${endId}`);

    let startNodeId = null;
    for (const [id, node] of this.graph.entries()) {
      if (node.id === startId) { startNodeId = id; break; }
    }
    if (! startNodeId) {
      console.error(`Начальная точка "${startId}" не найдена в графе`);
      return [];
    }

    const queue = [startNodeId];
    const visited = new Set();
    const parent = new Map();

    while (queue.length) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);

      const node = this.graph.get(cur);
      if (!node) continue;

      if (node.id === endId) {
        const path = [];
        let u = cur;
        while (u) { path.unshift(u); u = parent.get(u); }
        console.log("Путь найден:", path);
        return path;
      }

      node.neighbors.forEach(n => {
        if (!visited.has(n.id) && !parent.has(n.id)) {
          parent.set(n.id, cur);
          queue.push(n.id);
        }
      });
    }

    console.warn(`Путь от "${startId}" до "${endId}" не найден`);
    return [];
  }
}
