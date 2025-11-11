function generateEdges(pointsByFloor, maxDistance = 150) {
  const edges = [];

  // Создаем рёбра внутри каждого этажа
  for (const [floor, pts] of Object.entries(pointsByFloor)) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        const dist = Math.hypot(a.coords[0] - b.coords[0], a.coords[1] - b.coords[1]);
        if (dist <= maxDistance) {
          edges.push({
            from: a.id,
            to: b.id,
            distance: dist,
            floor: Number(floor),
            type: 'same_floor'
          });
        }
      }
    }
  }

  // Создаем связи между лестницами на разных этажах
  const floors = Object.keys(pointsByFloor).map(Number).sort();
  for (let i = 0; i < floors.length - 1; i++) {
    const floor1 = floors[i];
    const floor2 = floors[i + 1];

    const stairs1 = pointsByFloor[floor1].filter(p => p.type === 'stair');
    const stairs2 = pointsByFloor[floor2].filter(p => p.type === 'stair');

    // Связываем лестницы с похожими именами или координатами
    stairs1.forEach(stair1 => {
      stairs2.forEach(stair2 => {
        // Проверяем по расстоянию между координатами (лестницы должны быть примерно в одном месте)
        const coordDistance = Math.hypot(
          stair1.coords[0] - stair2.coords[0],
          stair1.coords[1] - stair2.coords[1]
        );

        // Если лестницы находятся близко друг к другу (в пределах 50 пикселей)
        if (coordDistance <= 50) {
          edges.push({
            from: stair1.id,
            to: stair2.id,
            fromFloor: floor1,
            toFloor: floor2,
            distance: 10, // Условное расстояние для перехода между этажами
            type: 'between_floors'
          });
        }
      });
    });
  }

  return edges;
}