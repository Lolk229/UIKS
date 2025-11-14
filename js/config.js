// Конфигурация всего проекта
const CONFIG = {
  map: {
    imageHeight: 1440,
    floorImages: {
      1: { url: "images/1Этаж.png", size: [1440, 2560] },
      2: { url: "images/2Этаж.png", size: [1440, 2560] }
    },
    settings: {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2
    }
  },

  points: {
    1: [
      { id: "Б1-1",  name: "Б1-1",  coords: [270, 1060], type: "room" },
      { id: "Б1-2",  name: "Б1-2",  coords: [350, 1040], type: "room" },
      { id: "Б1-3",  name: "Б1-3",  coords: [270, 996],  type: "room" },
      { id: "Б1-4",  name: "Б1-4",  coords: [350, 980],  type: "room" },
      { id: "Б1-5",  name: "Б1-5",  coords: [270, 960],  type: "room" },
      { id: "Б1-6",  name: "Б1-6",  coords: [350, 920],  type: "room" },
      { id: "Б1-7",  name: "Б1-7",  coords: [270, 725],  type: "room" },
      { id: "Б1-8",  name: "Б1-8",  coords: [350, 880],  type: "room" },
      { id: "Б1-9",  name: "Б1-9",  coords: [270, 670],  type: "room" },
      { id: "Б1-10", name: "Б1-10", coords: [350, 805],  type: "room" },
      { id: "Б1-11", name: "Б1-11", coords: [270, 590],  type: "room" },
      { id: "Б1-12", name: "Б1-12", coords: [350, 765],  type: "room" },
      { id: "Туалет", name: "Туалет", coords: [350, 675], type: "toilet" },
      { id: "S1", name: "Лестница 1", coords: [340, 1075], type: "stair" },
      { id: "S2", name: "Лестница 2", coords: [310, 450],  type: "stair" }
    ],
    2: [
      { id: "Б2-1",  name: "Б2-1",  coords: [285, 1050], type: "room" },
      { id: "Б2-2",  name: "Б2-2",  coords: [340, 1030], type: "room" },
      { id: "Б2-3",  name: "Б2-3",  coords: [285, 920],  type: "room" },
      { id: "Б2-4",  name: "Б2-4",  coords: [340, 880],  type: "room" },
      { id: "Б2-5",  name: "Б2-5",  coords: [285, 800],  type: "room" },
      { id: "Б2-6",  name: "Б2-6",  coords: [340, 800],  type: "room" },
      { id: "Б2-7",  name: "Б2-7",  coords: [285, 660],  type: "room" },
      { id: "Б2-8",  name: "Б2-8",  coords: [340, 760],  type: "room" },
      { id: "Б2-9",  name: "Б2-9",  coords: [285, 600],  type: "room" },
      { id: "Туалет", name: "Туалет", coords: [340, 650], type: "toilet" },
      { id: "Тот же Туалет", name: "Тот же Туалет", coords: [340, 690], type: "toilet" },
      { id: "Б2-10", name: "Б2-10", coords: [340, 615], type: "room" },
      { id: "Б2-11", name: "Б2-11", coords: [285, 600], type: "room" },
      { id: "Б2-12", name: "Б2-12", coords: [340, 550], type: "room" },
      { id: "S1", name: "Лестница 1 (на 1 этаж)", coords: [340, 1075], type: "stair" },
      { id: "S2", name: "Лестница 2 (на 1 этаж)", coords: [310, 450],  type: "stair" }
    ]
  },

  // Коридорные точки (формат координат везде [y, x])
  corridorNodes: {
    1: [
      // Двери (type: door)
      { id: "Door_Б1-1",    type: "door", room: "Б1-1",    coords: [295, 1060] },
      { id: "Door_Б1-2",    type: "door", room: "Б1-2",    coords: [325, 1040] },
      { id: "Door_Б1-3",    type: "door", room: "Б1-3",    coords: [295, 996]  },
      { id: "Door_Б1-4",    type: "door", room: "Б1-4",    coords: [325, 980]  },
      { id: "Door_Б1-5",    type: "door", room: "Б1-5",    coords: [295, 960]  },
      { id: "Door_Б1-6",    type: "door", room: "Б1-6",    coords: [325, 920]  },
      { id: "Door_Б1-7",    type: "door", room: "Б1-7",    coords: [295, 725]  },
      { id: "Door_Б1-8",    type: "door", room: "Б1-8",    coords: [325, 880]  },
      { id: "Door_Б1-9",    type: "door", room: "Б1-9",    coords: [295, 670]  },
      { id: "Door_Б1-10",   type: "door", room: "Б1-10",   coords: [325, 805]  },
      { id: "Door_Б1-11",   type: "door", room: "Б1-11",   coords: [295, 590]  },
      { id: "Door_Б1-12",   type: "door", room: "Б1-12",   coords: [325, 765]  },
      { id: "Door_Туалет1", type: "door", room: "Туалет",  coords: [325, 675]  },
      { id: "Door_S1",      type: "door", room: "S1",      coords: [320, 1075] },
      { id: "Door_S2",      type: "door", room: "S2",      coords: [310, 460]  },

      // Ось коридора (горизонталь) — одинаковый Y=310, X убывает с шагом ≈50
      { id: "C1_h1",  type: "corridor", coords: [310, 1075] },
      { id: "C1_h2",  type: "corridor", coords: [310, 1025] },
      { id: "C1_h3",  type: "corridor", coords: [310,  975] },
      { id: "C1_h4",  type: "corridor", coords: [310,  925] },
      { id: "C1_h5",  type: "corridor", coords: [310,  875] },
      { id: "C1_h6",  type: "corridor", coords: [310,  825] },
      { id: "C1_h7",  type: "corridor", coords: [310,  775] },
      { id: "C1_h8",  type: "corridor", coords: [310,  725] },
      { id: "C1_h9",  type: "corridor", coords: [310,  675] },
      { id: "C1_h10", type: "corridor", coords: [310,  625] },
      { id: "C1_h11", type: "corridor", coords: [310,  575] },
      { id: "C1_h12", type: "corridor", coords: [310,  525] },

      // Угол: ровно в точке пересечения осей (Y=310, X=480)
      { id: "C1_turn1", type: "corridor", coords: [310, 480] },

      // Ось коридора (вертикаль) — одинаковый X=480, Y растёт с шагом ≈50
      { id: "C1_v1", type: "corridor", coords: [360, 480] },
      { id: "C1_v2", type: "corridor", coords: [410, 480] },
      { id: "C1_v3", type: "corridor", coords: [460, 480] },
      { id: "C1_v4", type: "corridor", coords: [510, 480] },
      { id: "C1_v5", type: "corridor", coords: [560, 480] }
    ],

    2: [
      // Двери (type: door)
      { id: "Door_Б2-1",    type: "door", room: "Б2-1",    coords: [305, 1050] },
      { id: "Door_Б2-2",    type: "door", room: "Б2-2",    coords: [320, 1030] },
      { id: "Door_Б2-3",    type: "door", room: "Б2-3",    coords: [305, 920]  },
      { id: "Door_Б2-4",    type: "door", room: "Б2-4",    coords: [320, 880]  },
      { id: "Door_Б2-5",    type: "door", room: "Б2-5",    coords: [305, 800]  },
      { id: "Door_Б2-6",    type: "door", room: "Б2-6",    coords: [320, 800]  },
      { id: "Door_Б2-7",    type: "door", room: "Б2-7",    coords: [305, 660]  },
      { id: "Door_Б2-8",    type: "door", room: "Б2-8",    coords: [320, 760]  },
      { id: "Door_Б2-9",    type: "door", room: "Б2-9",    coords: [305, 600]  },
      { id: "Door_Б2-10",   type: "door", room: "Б2-10",   coords: [320, 805]  },
      { id: "Door_Б2-11",   type: "door", room: "Б2-11",   coords: [305, 600]  },
      { id: "Door_Б2-12",   type: "door", room: "Б2-12",   coords: [320, 550]  },
      { id: "Door_Туалет2_1", type: "door", room: "Туалет",          coords: [320, 650] },
      { id: "Door_Туалет2_2", type: "door", room: "Тот же Туалет",   coords: [320, 690] },
      { id: "Door_S1_2",   type: "door", room: "S1",      coords: [320, 1075] },
      { id: "Door_S2_2",   type: "door", room: "S2",      coords: [310, 460]  },

      // Ось коридора (горизонталь) — Y=310, шаг ≈50 по X
      { id: "C2_h1",  type: "corridor", coords: [310, 1075] },
      { id: "C2_h2",  type: "corridor", coords: [310, 1025] },
      { id: "C2_h3",  type: "corridor", coords: [310,  975] },
      { id: "C2_h4",  type: "corridor", coords: [310,  925] },
      { id: "C2_h5",  type: "corridor", coords: [310,  875] },
      { id: "C2_h6",  type: "corridor", coords: [310,  825] },
      { id: "C2_h7",  type: "corridor", coords: [310,  775] },
      { id: "C2_h8",  type: "corridor", coords: [310,  725] },
      { id: "C2_h9",  type: "corridor", coords: [310,  675] },
      { id: "C2_h10", type: "corridor", coords: [310,  625] },
      { id: "C2_h11", type: "corridor", coords: [310,  575] },
      { id: "C2_h12", type: "corridor", coords: [310,  525] },

      // Угол
      { id: "C2_turn1", type: "corridor", coords: [310, 480] },

      // Ось коридора (вертикаль) — X=480, шаг ≈50 по Y
      { id: "C2_v1", type: "corridor", coords: [360, 480] },
      { id: "C2_v2", type: "corridor", coords: [410, 480] },
      { id: "C2_v3", type: "corridor", coords: [460, 480] },
      { id: "C2_v4", type: "corridor", coords: [510, 480] },
      { id: "C2_v5", type: "corridor", coords: [560, 480] }
    ]
  },

  // Параметры построения графа
  routing: {
    // между соседними corridor‑узлами вдоль оси (шаг ≈50 → ставим 60–120)
    maxCorridorDistance: 100,

    // дверь → ось (до ближайших corridor‑точек)
    maxRoomToCorridorDistance: 40,

    // группировка узлов по оси (насколько «одинаковы» Y для горизонтального и X для вертикального)
    axisTolerance: 25,

    // дверь связываем с осью только если почти вертикально/горизонтально (по одной из осей разница ≤ 24)
    doorAlignTolerance: 24,

    // лестницы между этажами
    stairConnectionDistance: 50,

    // использовалось в прежней отрисовке — сейчас не нужно, но оставим
    corridorOffset: 30
  }
};
