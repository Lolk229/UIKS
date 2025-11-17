// Конфигурация всего проекта
const CONFIG = {
  map: {
    imageHeight: 1440,
    floorImages: {
      1: { url: "images/1floor_pdf_to_svg.svg", size: [2867, 3840] },
      2: { url: "images/2Этаж.png", size: [1440, 2560] },
      3: { url: "images/1floor_max_quality.png", size: [3824, 5120] },
      4: { url: "images/1floor_pdf_to_svg.svg", size: [2867, 3840] },
      5: { url: "images/1floor.svg", size: [1440, 2560] },
    },
    settings: {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2
    }
  },

  points: {
    1: [
      { id: "Б1-1",  name: "Б1-1",  coords: [680, 1535], type: "room" },
      { id: "Б1-2",  name: "Б1-2",  coords: [760, 1535], type: "room" },
      { id: "Б1-3",  name: "Б1-3",  coords: [680, 1380],  type: "room" },
      { id: "Б1-4",  name: "Б1-4",  coords: [760, 1485],  type: "room" },
      { id: "Б1-5",  name: "Б1-5",  coords: [680, 1265],  type: "room" },
      { id: "Б1-6",  name: "Б1-6",  coords: [760, 1380],  type: "room" },
      { id: "Б1-7",  name: "Б1-7",  coords: [680, 1095],  type: "room" },
      { id: "Б1-8",  name: "Б1-8",  coords: [760, 1335],  type: "room" },
      { id: "Б1-9",  name: "Б1-9",  coords: [680, 980],  type: "room" },
      { id: "Б1-10", name: "Б1-10", coords: [760, 1210],  type: "room" },
      { id: "Б1-11", name: "Б1-11", coords: [680, 920],  type: "room" },
      { id: "Б1-12", name: "Б1-12", coords: [760, 1150],  type: "room" },
      { id: "Б1-13", name: "Б1-13", coords: [680, 735],  type: "room" },
      { id: "Б1-14", name: "Б1-14", coords: [775, 760],  type: "room" },
      { id: "Б1-15", name: "Б1-15", coords: [680, 735],  type: "room" },
      { id: "Б1-16", name: "Б1-16", coords: [940, 760],  type: "room" },
      { id: "Б1-17", name: "Б1-17", coords: [680, 735],  type: "room" },
      { id: "Б1-18", name: "Б1-18", coords: [1120, 760],  type: "room" },
      { id: "Б1-19", name: "Б1-19", coords: [800, 680],  type: "room" },
      { id: "Б1-20",  name: "Б1-20",  coords: [1575, 755], type: "room" },
      { id: "Б1-21", name: "Б1-21", coords: [940, 680],  type: "room" },
      { id: "Б1-22",  name: "Б1-22",  coords: [1575, 755], type: "room" },
      { id: "Б1-23", name: "Б1-23", coords: [1120, 680],  type: "room" },
      { id: "Б1-24",  name: "Б1-24",  coords: [1725, 755], type: "room" },
      { id: "Б1-25",  name: "Б1-25",  coords: [1410, 680], type: "room" },
      { id: "Б1-26",  name: "Б1-26",  coords: [1875, 755], type: "room" },
      { id: "Б1-27",  name: "Б1-27",  coords: [1555, 680], type: "room" },
      { id: "Б1-28",  name: "Б1-28",  coords: [2130, 755], type: "room" },
      { id: "Б1-29",  name: "Б1-29",  coords: [1720, 680], type: "room" },
      { id: "Б1-30",  name: "Б1-30",  coords: [2125, 1030], type: "room" },
      { id: "Б1-31",  name: "Б1-31",  coords: [1790, 680], type: "room" },
      { id: "Б1-32",  name: "Б1-32",  coords: [2125, 1090], type: "room" },
      { id: "Б1-33",  name: "Б1-33",  coords: [1850, 680], type: "room" },
      { id: "Б1-34",  name: "Б1-34",  coords: [2125, 1240], type: "room" },
      { id: "Б1-35",  name: "Б1-35",  coords: [1965, 680], type: "room" },
      { id: "Б1-36",  name: "Б1-36",  coords: [2125, 1350], type: "room" },
      { id: "Б1-37",  name: "Б1-37",  coords: [2100, 680], type: "room" },
      { id: "Б1-38",  name: "Б1-38",  coords: [2125, 1575], type: "room" },
      { id: "Б1-39",  name: "Б1-39",  coords: [2200, 800], type: "room" },
      { id: "Б1-40",  name: "Б1-40",  coords: [2200 , 1135], type: "room" },
      { id: "Б1-41",  name: "Б1-41",  coords: [2200 , 970], type: "room" },
      { id: "Б1-42",  name: "Б1-42",  coords: [2200 , 1135], type: "room" },
      { id: "Б1-43",  name: "Б1-43",  coords: [2200 , 1135], type: "room" },
      { id: "Б1-45",  name: "Б1-45",  coords: [2200 , 1350], type: "room" },
      { id: "Б1-47",  name: "Б1-47",  coords: [2200 , 1350], type: "room" },
      { id: "Б1-49",  name: "Б1-49",  coords: [2200 , 1575], type: "room" },
      { id: "Б1-54",  name: "Б1-54",  coords: [2125, 2265], type: "room" },
      { id: "Б1-64",  name: "Б1-64",  coords: [1960, 3075], type: "room" },
      { id: "Б1-67",  name: "Б1-67",  coords: [2195, 2640], type: "room" },
      { id: "Б1-84",  name: "Б1-84",  coords: [765, 3035], type: "room" },
      { id: "Б1-87",  name: "Б1-87",  coords: [1175, 3155], type: "room" },
      { id: "Б1-95",  name: "Б1-95",  coords: [680, 3125], type: "room" },
      { id: "Б1-107",  name: "Б1-107",  coords: [685, 2300], type: "room" },
      { id: "Туалет", name: "Туалет", coords: [760, 1035], type: "toilet" },
      { id: "Туалет",  name: "Туалет",  coords: [2125, 970], type: "toilet" },
      { id: "S1", name: "Лестница 1", coords: [760, 1590], type: "stair" },
      { id: "S2", name: "Лестница 2", coords: [730, 665],  type: "stair" },
      { id: "S3", name: "Лестница 3", coords: [1405, 770],  type: "stair" },
      { id: "S4", name: "Лестница 4", coords: [2160, 675],  type: "stair" },
      { id: "S5", name: "Лестница 5", coords: [2075, 1915],  type: "stair" },
      { id: "S6", name: "Лестница 6", coords: [2160, 3170],  type: "stair" },
      { id: "S7", name: "Лестница 7", coords: [1400, 3060],  type: "stair" },
      { id: "S8", name: "Лестница 8", coords: [825, 3175],  type: "stair" },
      { id: "S9", name: "Лестница 9", coords: [775, 2520],  type: "stair" },
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
      { id: "Door_Б1-1",    type: "door", room: "Б1-1",    coords: [700, 1535] },
      { id: "Door_Б1-2",    type: "door", room: "Б1-2",    coords: [740, 1535] },
      { id: "Door_Б1-3",    type: "door", room: "Б1-3",    coords: [700, 1380] },
      { id: "Door_Б1-4",    type: "door", room: "Б1-4",    coords: [740, 1485]  },
      { id: "Door_Б1-5",    type: "door", room: "Б1-5",    coords: [700, 1265] },
      { id: "Door_Б1-6",    type: "door", room: "Б1-6",    coords: [740, 1380]  },
      { id: "Door_Б1-7",    type: "door", room: "Б1-7",    coords: [700, 1095] },
      { id: "Door_Б1-8",    type: "door", room: "Б1-8",    coords: [740, 1335]  },
      { id: "Door_Б1-9",    type: "door", room: "Б1-9",    coords: [700, 980]  },
      { id: "Door_Б1-10",   type: "door", room: "Б1-10",   coords: [740, 1210]  },
      { id: "Door_Б1-11",   type: "door", room: "Б1-11",   coords: [700, 920]  },
      { id: "Door_Б1-12",   type: "door", room: "Б1-12",   coords: [740, 1150]  },
      { id: "Door_Б1-13",   type: "door", room: "Б1-13",   coords: [700, 735]  },
      { id: "Door_Б1-14",   type: "door", room: "Б1-14",   coords: [775, 745]  },
      { id: "Door_Б1-15",   type: "door", room: "Б1-15",   coords: [700, 735]  },
      { id: "Door_Б1-16",   type: "door", room: "Б1-16",   coords: [940, 745]  },
      { id: "Door_Б1-17",   type: "door", room: "Б1-17",   coords: [700, 735]  },
      { id: "Door_Б1-18",   type: "door", room: "Б1-18",   coords: [1120, 745]  },
      { id: "Door_Б1-19",   type: "door", room: "Б1-19",   coords: [800, 700]  },
      { id: "Door_Б1-20",   type: "door", room: "Б1-20",   coords: [325, 765]  },
      { id: "Door_Б1-21",   type: "door", room: "Б1-21",   coords: [940, 700]  },
      { id: "Door_Б1-22",   type: "door", room: "Б1-22",   coords: [325, 765]  },
      { id: "Door_Б1-23",   type: "door", room: "Б1-23",   coords: [1120, 700]  },
      { id: "Туалет", name: "Туалет", coords: [740, 1035], type: "toilet" },

      // Ось коридора (горизонталь) — одинаковый Y=310, X убывает с шагом ≈50
      // Ось коридора
      { id: "C1_h1",  type: "corridor", coords: [720, 1570] },
      { id: "C1_h2",  type: "corridor", coords: [720, 1520] },
      { id: "C1_h3",  type: "corridor", coords: [720, 1470] },
      { id: "C1_h4",  type: "corridor", coords: [720, 1420] },
      { id: "C1_h5",  type: "corridor", coords: [720, 1370] },
      { id: "C1_h6",  type: "corridor", coords: [720, 1320] },
      { id: "C1_h7",  type: "corridor", coords: [720, 1270] },
      { id: "C1_h8",  type: "corridor", coords: [720, 1220] },
      { id: "C1_h9",  type: "corridor", coords: [720, 1170] },
      { id: "C1_h10", type: "corridor", coords: [720, 1120] },
      { id: "C1_h11", type: "corridor", coords: [720, 1070] },
      { id: "C1_h12", type: "corridor", coords: [720, 1020] },
      { id: "C1_h13", type: "corridor", coords: [720, 970] },
      { id: "C1_h14", type: "corridor", coords: [720, 920] },
      { id: "C1_h15", type: "corridor", coords: [720, 870] },
      { id: "C1_h16", type: "corridor", coords: [720, 820] },
      { id: "C1_h17", type: "corridor", coords: [720, 770] },
      { id: "C1_h18", type: "corridor", coords: [770, 725] },
      { id: "C1_h19", type: "corridor", coords: [820, 725] },
      { id: "C1_h20", type: "corridor", coords: [870, 725] },
      { id: "C1_h21", type: "corridor", coords: [920, 725] },
      { id: "C1_h22", type: "corridor", coords: [970, 725] },
      { id: "C1_h23", type: "corridor", coords: [1020, 725] },
      { id: "C1_h24", type: "corridor", coords: [1070, 725] },
      { id: "C1_h25", type: "corridor", coords: [1120, 725] },
      { id: "C1_h25", type: "corridor", coords: [1400, 725] },
      { id: "C1_h26", type: "corridor", coords: [1450, 725] },
      { id: "C1_h27", type: "corridor", coords: [1500, 725] },
      { id: "C1_h28", type: "corridor", coords: [1550, 725] },
      { id: "C1_h29", type: "corridor", coords: [1600, 725] },
      { id: "C1_h30", type: "corridor", coords: [1650, 725] },
      { id: "C1_h31", type: "corridor", coords: [1700, 725] },
      { id: "C1_h32", type: "corridor", coords: [1750, 725] },
      { id: "C1_h33", type: "corridor", coords: [1800, 725] },
      { id: "C1_h34", type: "corridor", coords: [1850, 725] },
      { id: "C1_h35", type: "corridor", coords: [1900, 725] },
      { id: "C1_h36", type: "corridor", coords: [1950, 725] },
      { id: "C1_h37", type: "corridor", coords: [2000, 725] },
      { id: "C1_h38", type: "corridor", coords: [2050, 725] },
      { id: "C1_h39", type: "corridor", coords: [2100, 725] },
      { id: "C1_h40", type: "corridor", coords: [2150, 725] },
      { id: "C1_h41", type: "corridor", coords: [2160, 760] },
      { id: "C1_h42", type: "corridor", coords: [2160, 810] },
      { id: "C1_h43", type: "corridor", coords: [2160, 860] },
      { id: "C1_h44", type: "corridor", coords: [2160, 910] },
      { id: "C1_h45", type: "corridor", coords: [2160, 960] },
      { id: "C1_h46", type: "corridor", coords: [2160, 1010] },
      { id: "C1_h47", type: "corridor", coords: [2160, 1060] },
      { id: "C1_h48", type: "corridor", coords: [2160, 1110] },
      { id: "C1_h49", type: "corridor", coords: [2160, 1160] },
      { id: "C1_h50", type: "corridor", coords: [2160, 1210] },
      { id: "C1_h51", type: "corridor", coords: [2160, 1260] },
      { id: "C1_h52", type: "corridor", coords: [2160, 1310] },
      { id: "C1_h53", type: "corridor", coords: [2160, 1360] },
      { id: "C1_h54", type: "corridor", coords: [2160, 1410] },
      { id: "C1_h55", type: "corridor", coords: [2160, 1460] },
      { id: "C1_h56", type: "corridor", coords: [2160, 1510] },
      { id: "C1_h57", type: "corridor", coords: [2160, 1560] },


      // Угол: ровно в точке пересечения осей (Y=310, X=480)
      { id: "C1_turn1", type: "corridor", coords: [720, 725] },
      { id: "C1_turn2", type: "corridor", coords: [2160, 725] },

      // Ось коридора (вертикаль) — одинаковый X=480, Y растёт с шагом ≈50
      { id: "C1_v1", type: "corridor", coords: [360, 485] },
      { id: "C1_v2", type: "corridor", coords: [410, 485] },
      { id: "C1_v3", type: "corridor", coords: [460, 485] },
      { id: "C1_v4", type: "corridor", coords: [510, 485] },
      { id: "C1_v5", type: "corridor", coords: [560, 485] }
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
