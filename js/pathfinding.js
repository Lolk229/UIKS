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
    if (!A.neighbors.some(function(n) { return n.id === bId; })) A.neighbors.push({ id: bId, distance:  distance });
    if (!B.neighbors.some(function(n) { return n.id === aId; })) B.neighbors.push({ id: aId, distance:  distance });
  }

  buildGraph() {
    const graph = new Map();
    const self = this;

    const routing = CONFIG.routing || {};
    const maxCorridorDistance = routing.maxCorridorDistance || 120;
    const maxRoomToCorridorDistance = routing.maxRoomToCorridorDistance || 80;
    const axisTolerance = routing.axisTolerance || 18;
    const doorAlignTolerance = routing.doorAlignTolerance || 16;

    // 1) Регистрируем комнаты/лестницы/туалеты
    Object.entries(this.points).forEach(function(entry) {
      const floor = entry[0];
      const arr = entry[1];
      const f = Number(floor);
      arr.forEach(function(p) {
        const id = p.id + "_" + f;
        graph.set(id, { id: p.id, floor: f, type:  p.type, coords: p.coords, neighbors: [] });
      });
    });

    // 2) Регистрируем corridorNodes (door + corridor)
    Object.entries(this.corridorNodes).forEach(function(entry) {
      const floor = entry[0];
      const arr = entry[1];
      const f = Number(floor);
      arr.forEach(function(n) {
        const id = n.id + "_" + f;
        graph.set(id, {
          id: n.id,
          floor: f,
          type: n.type || 'corridor',
          room: n.room || null,
          coords:  n.coords,
          neighbors: []
        });
      });
    });

    // 3) Комната → (все её) двери
    Object.entries(this.points).forEach(function(entry) {
      const floor = entry[0];
      const arr = entry[1];
      const f = Number(floor);
      const doors = (self.corridorNodes[f] || []).filter(function(n) { return n.type === 'door'; });
      arr.forEach(function(room) {
        doors.filter(function(d) { return d.room === room.id; }).forEach(function(door) {
          PathFinder.addEdge(
            graph,
            room.id + "_" + f,
            door.id + "_" + f,
            PathFinder.dist(room.coords, door.coords)
          );
        });
      });
    });

    // 4) Дверь → коридор
    Object.entries(this.corridorNodes).forEach(function(entry) {
      const floor = entry[0];
      const arr = entry[1];
      const f = Number(floor);
      const doors = arr.filter(function(n) { return n.type === 'door'; });
      const corridors = arr.filter(function(n) { return n.type === 'corridor'; });

      doors.forEach(function(d) {
        const dId = d.id + "_" + f;
        const aligned = corridors
          .map(function(c) {
            const dX = Math.abs(d.coords[1] - c.coords[1]);
            const dY = Math.abs(d.coords[0] - c.coords[0]);
            return {
              c: c,
              d: PathFinder.dist(d.coords, c.coords),
              aligned: (dX <= doorAlignTolerance) || (dY <= doorAlignTolerance)
            };
          })
          .filter(function(o) { return o.d <= maxRoomToCorridorDistance && o.aligned; })
          .sort(function(a, b) { return a.d - b.d; })
          .slice(0, 2);

        aligned.forEach(function(n) {
          PathFinder.addEdge(graph, dId, n.c.id + "_" + f, n.d);
        });
      });
    });

    // 5) Corridor → corridor
    Object.entries(this.corridorNodes).forEach(function(entry) {
      const floor = entry[0];
      const arr = entry[1];
      const f = Number(floor);
      const corridors = arr.filter(function(n) { return n.type === 'corridor'; });

      const groupsH = [];
      corridors.forEach(function(c) {
        let g = groupsH.find(function(g) { return Math.abs(g.y - c.coords[0]) <= axisTolerance; });
        if (!g) { g = { y:  c.coords[0], items: [] }; groupsH.push(g); }
        g.items.push(c);
      });
      groupsH.forEach(function(g) {
        g.items.sort(function(a, b) { return a.coords[1] - b.coords[1]; });
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder.addEdge(graph, A.id + "_" + f, B.id + "_" + f, d);
          }
        }
      });

      const groupsV = [];
      corridors.forEach(function(c) {
        let g = groupsV.find(function(g) { return Math.abs(g.x - c.coords[1]) <= axisTolerance; });
        if (!g) { g = { x: c.coords[1], items: [] }; groupsV.push(g); }
        g.items.push(c);
      });
      groupsV.forEach(function(g) {
        g.items.sort(function(a, b) { return a.coords[0] - b.coords[0]; });
        for (let i = 0; i < g.items.length - 1; i++) {
          const A = g.items[i], B = g.items[i + 1];
          const d = PathFinder.dist(A.coords, B.coords);
          if (d <= maxCorridorDistance) {
            PathFinder.addEdge(graph, A.id + "_" + f, B.id + "_" + f, d);
          }
        }
      });
    });

    // 6) Лестницы между этажами
    const floors = Object.keys(this.points).map(Number).sort();
    for (let i = 0; i < floors.length - 1; i++) {
      const f1 = floors[i], f2 = floors[i + 1];
      const stairs1 = this.points[f1].filter(function(p) { return p.type === 'stair'; });
      const stairs2 = this.points[f2].filter(function(p) { return p.type === 'stair'; });

      stairs1.forEach(function(s1) {
        stairs2.forEach(function(s2) {
          if (s1.id === s2.id) {
            PathFinder.addEdge(graph, s1.id + "_" + f1, s2.id + "_" + f2, 10);
            console.log("Связаны лестницы:  " + s1.id + "_" + f1 + " <-> " + s2.id + "_" + f2);
          }
        });
      });
    }

    console.log("Граф построен (узлов):", graph.size);
    return graph;
  }

  findPath(fromId, toId) {
    const self = this;
    let startKeys = [];
    let endKeys = [];

    this.graph.forEach(function(node, key) {
      if (node.id === fromId) startKeys.push(key);
      if (node.id === toId) endKeys.push(key);
    });

    if (startKeys.length === 0) {
      return { path: null, error: "Точка \"" + fromId + "\" не найдена" };
    }
    if (endKeys.length === 0) {
      return { path: null, error: "Точка \"" + toId + "\" не найдена" };
    }

    console.log("Ищем маршрут от " + fromId + " до " + toId);

    const path = this.findShortestPath(fromId, toId);

    if (! path || path.length === 0) {
      return { path: null, error:  'Маршрут не найден' };
    }

    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const nodeA = this.graph.get(path[i]);
      const nodeB = this.graph.get(path[i + 1]);
      if (nodeA && nodeB) {
        distance += PathFinder.dist(nodeA.coords, nodeB.coords);
      }
    }

    console.log("Маршрут найден!  Длина:  " + distance.toFixed(1) + ", узлов: " + path.length);
    return { path: path, distance: distance };
  }

  findShortestPath(startId, endId) {
    const self = this;
    console.log("Поиск пути от " + startId + " до " + endId);

    let startNodeId = null;
    for (const entry of this.graph.entries()) {
      const id = entry[0];
      const node = entry[1];
      if (node.id === startId) { startNodeId = id; break; }
    }
    if (!startNodeId) {
      console.error("Начальная точка \"" + startId + "\" не найдена в графе");
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

      node.neighbors.forEach(function(n) {
        if (!visited.has(n.id) && ! parent.has(n.id)) {
          parent.set(n.id, cur);
          queue.push(n.id);
        }
      });
    }

    console.warn("Путь от \"" + startId + "\" до \"" + endId + "\" не найден");
    return [];
  }
}
