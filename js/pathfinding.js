// Навигатор по зданию: граф "комната → дверь → ось коридора → дверь → комната"
// Ожидаемые данные (CONFIG):
// - CONFIG.points[floor]: [{ id, type: 'room'|'stair'|'toilet', coords: [x,y] }, ...]
// - CONFIG.corridorNodes[floor]:
//     двери:   { id, type: 'door',     room: '<id из points>', coords: [x,y] }
//     коридор: { id, type: 'corridor',                         coords: [x,y] }
// - CONFIG.routing (необязательно):
//   { maxCorridorDistance, maxRoomToCorridorDistance, stairConnectionDistance,
//     axisTolerance, doorAlignTolerance }

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
    if (!A.neighbors.some(n => n.id === bId)) A.neighbors.push({ id: bId, distance });
    if (!B.neighbors.some(n => n.id === aId)) B.neighbors.push({ id: aId, distance });
  }

  buildGraph() {
    const graph = new Map();

    const {
      maxCorridorDistance = (CONFIG?.routing?.maxCorridorDistance ?? 140),
      maxRoomToCorridorDistance = (CONFIG?.routing?.maxRoomToCorridorDistance ?? 90),
      stairConnectionDistance = (CONFIG?.routing?.stairConnectionDistance ?? 50),
      axisTolerance = (CONFIG?.routing?.axisTolerance ?? 18),
      doorAlignTolerance = (CONFIG?.routing?.doorAlignTolerance ?? 16)
    } = CONFIG?.routing || {};

    // 1) Регистрируем комнаты/лестницы/туалеты
    Object.entries(this.points).forEach(([floor, arr]) => {
      const f = Number(floor);
      arr.forEach(p => {
        const id = `${p.id}_${f}`;
        graph.set(id, {
          id: p.id, floor: f, type: p.type, coords: p.coords, neighbors: []
        });
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
          coords: n.coords,
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

    // 4) Дверь → ближайшие 1–2 corridor-точки (только с выравниванием по X или Y)
    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      const doors = arr.filter(n => n.type === 'door');
      const corridors = arr.filter(n => n.type === 'corridor');

      doors.forEach(d => {
        const dId = `${d.id}_${f}`;
        const aligned = corridors
          .map(c => {
            const dx = Math.abs(d.coords[0] - c.coords[0]);
            const dy = Math.abs(d.coords[1] - c.coords[1]);
            return {
              c,
              d: PathFinder.dist(d.coords, c.coords),
              aligned: (dx <= doorAlignTolerance) || (dy <= doorAlignTolerance)
            };
          })
          .filter(o => o.d <= maxRoomToCorridorDistance && o.aligned)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        aligned.forEach(n => {
          PathFinder.addEdge(graph, dId, `${n.c.id}_${f}`, n.d);
        });
      });
    });

    // 5) Corridor → corridor: только последовательные связи в группах по оси
    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      const corridors = arr.filter(n => n.type === 'corridor');

      // Горизонтальные группы (почти одинаковый Y)
      const groupsH = [];
      corridors.forEach(c => {
        let g = groupsH.find(g => Math.abs(g.y - c.coords[1]) <= axisTolerance);
        if (!g) { g = { y: c.coords[1], items: [] }; groupsH.push(g); }
        g.items.push(c);
      });
      groupsH.forEach(g => {
        g.items.sort((a, b) => a.coords[0] - b.coords[0]); // по X
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder.addEdge(graph, `${A.id}_${f}`, `${B.id}_${f}`, d);
          }
        }
      });

      // Вертикальные группы (почти одинаковый X)
      const groupsV = [];
      corridors.forEach(c => {
        let g = groupsV.find(g => Math.abs(g.x - c.coords[0]) <= axisTolerance);
        if (!g) { g = { x: c.coords[0], items: [] }; groupsV.push(g); }
        g.items.push(c);
      });
      groupsV.forEach(g => {
        g.items.sort((a, b) => a.coords[1] - b.coords[1]); // по Y
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder.addEdge(graph, `${A.id}_${f}`, `${B.id}_${f}`, d);
          }
        }
      });
    });

    // 6) Лестницы между этажами
    const floors = Object.keys(this.points).map(Number).sort();
    for (let i = 0; i < floors.length - 1; i++) {
      const f1 = floors[i], f2 = floors[i + 1];
      const stairs1 = this.points[f1].filter(p => p.type === 'stair');
      const stairs2 = this.points[f2].filter(p => p.type === 'stair');
      stairs1.forEach(s1 => {
        stairs2.forEach(s2 => {
          const d = PathFinder.dist(s1.coords, s2.coords);
          if (d <= stairConnectionDistance) {
            PathFinder.addEdge(graph, `${s1.id}_${f1}`, `${s2.id}_${f2}`, 10);
          }
        });
      });
    }

    console.log("Граф построен (узлов):", graph.size);
    return graph;
  }

  // BFS
  findShortestPath(startId, endId) {
    console.log(`Поиск пути от ${startId} до ${endId}`);

    let startNodeId = null;
    for (const [id, node] of this.graph.entries()) {
      if (node.id === startId) { startNodeId = id; break; }
    }
    if (!startNodeId) {
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
