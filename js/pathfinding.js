// Навигатор по зданию: добавлено создание JSON-файла.

class PathFinder {
  constructor(points, corridorNodes) {
    this.points = points;
    this.corridorNodes = corridorNodes;
    this.graph = this.buildGraph();
  }

  static dist(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }

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
      maxCorridorDistance = CONFIG?.routing?.maxCorridorDistance ?? 140,
      maxRoomToCorridorDistance = CONFIG?.routing?.maxRoomToCorridorDistance ?? 90,
      stairConnectionDistance = CONFIG?.routing?.stairConnectionDistance ?? 50
    } = CONFIG?.routing || {};

    // Добавляем узлы в граф
    Object.entries(this.points).forEach(([floor, arr]) => {
      const f = Number(floor);
      arr.forEach(p => {
        const id = `${p.id}_${f}`;
        graph.set(id, { id: p.id, floor: f, type: p.type, coords: p.coords, neighbors: [] });
      });
    });

    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const f = Number(floor);
      arr.forEach(n => {
        const id = `${n.id}_${f}`;
        graph.set(id, {
          id: n.id,
          floor: f,
          type: n.type || "corridor",
          room: n.room || null,
          coords: n.coords,
          neighbors: [],
        });
      });
    });

    // Добавляем связи
    Object.entries(this.points).forEach(([floor, arr]) => {
      const doors = this.corridorNodes[floor]?.filter(n => n.type === "door") || [];
      arr.forEach(room => {
        doors.filter(d => d.room === room.id).forEach(door => {
          PathFinder.addEdge(
            graph,
            `${room.id}_${floor}`,
            `${door.id}_${floor}`,
            PathFinder.dist(room.coords, door.coords)
          );
        });
      });
    });

    Object.entries(this.corridorNodes).forEach(([floor, arr]) => {
      const doors = arr.filter(n => n.type === "door");
      const corridors = arr.filter(n => n.type === "corridor");

      doors.forEach(d => {
        const connectedCorridors = corridors
          .map(c => ({
            c,
            dist: PathFinder.dist(d.coords, c.coords),
          }))
          .filter(n => n.dist <= maxRoomToCorridorDistance)
          .slice(0, 2);

        connectedCorridors.forEach(n => {
          PathFinder.addEdge(graph, `${d.id}_${floor}`, `${n.c.id}_${floor}`, n.dist);
        });
      });
    });

    // Лестницы между этажами
    const floors = Object.keys(this.points).map(Number).sort();
    for (let i = 0; i < floors.length - 1; i++) {
      const currentFloor = floors[i];
      const nextFloor = floors[i + 1];
      const stairs1 = this.points[currentFloor]?.filter(p => p.type === "stair") || [];
      const stairs2 = this.points[nextFloor]?.filter(p => p.type === "stair") || [];
      stairs1.forEach(s1 => {
        stairs2.forEach(s2 => {
          const dist = PathFinder.dist(s1.coords, s2.coords);
          if (dist <= stairConnectionDistance) {
            PathFinder.addEdge(
              graph,
              `${s1.id}_${currentFloor}`,
              `${s2.id}_${nextFloor}`,
              dist
            );
          }
        });
      });
    }

    console.log("Граф построен (узлов):", graph.size);
    return graph;
  }

  findShortestPath(startId, endId) {
    let startNode = null;
    for (const [id, node] of this.graph.entries()) {
      if (node.id === startId) {
        startNode = id;
        break;
      }
    }
    if (!startNode) {
      console.error(`Начало пути "${startId}" не найдено`);
      return [];
    }

    const queue = [startNode];
    const visited = new Set();
    const parent = new Map();

    while (queue.length > 0) {
      const curr = queue.shift();
      visited.add(curr);

      const currNode = this.graph.get(curr);
      if (currNode.id === endId) {
        const path = [];
        let tmp = curr;
        while (tmp) {
          path.unshift(tmp);
          tmp = parent.get(tmp);
        }
        console.log("Путь найден:", path);
        this.savePathAsJson(path);
        return path;
      }
      currNode.neighbors.forEach(({ id }) => {
        if (!visited.has(id) && !queue.includes(id)) {
          queue.push(id);
          parent.set(id, curr);
        }
      });
    }
    console.error("Маршрут не найден");
    return [];
  }

  // Сохранение данных пути в JSON
  savePathAsJson(path) {
    const fs = window.require("fs"); // Убедитесь, что окружение поддерживает FS.
    const filePath = "./path-buffer.json";
    const jsonData = path.map(key => {
      const [id, floor] = key.split("_");
      return { id, floor: Number(floor) };
    });
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log(`Маршрут сохранён в файл: ${filePath}`);
  }
}
