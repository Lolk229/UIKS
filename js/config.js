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
      { id: "Б1-1", name: "Б1-1", coords: [270, 1060], type: "room" },
      { id: "Б1-2", name: "Б1-2", coords: [350, 1040], type: "room" },
      { id: "Б1-3", name: "Б1-3", coords: [270, 996], type: "room" },
      { id: "Б1-4", name: "Б1-4", coords: [350, 980], type: "room" },
      { id: "Б1-5", name: "Б1-5", coords: [270, 960], type: "room" },
      { id: "Б1-6", name: "Б1-6", coords: [350, 920], type: "room" },
      { id: "Б1-7", name: "Б1-7", coords: [270, 725], type: "room" },
      { id: "Б1-8", name: "Б1-8", coords: [350, 882], type: "room" },
      { id: "Б1-9", name: "Б1-9", coords: [270, 670], type: "room" },
      { id: "Б1-10", name: "Б1-10", coords: [350, 805], type: "room" },
      { id: "Б1-11", name: "Б1-11", coords: [270, 592], type: "room" },
      { id: "Б1-12", name: "Б1-12", coords: [350, 765], type: "room" },
      { id: "Туалет", name: "Туалет", coords: [350, 675], type: "toilet" },
      { id: "S1", name: "Лестница 1", coords: [320, 1075], type: "stair" },
      { id: "S2", name: "Лестница 2", coords: [310, 460], type: "stair" }
    ],
    2: [
      { id: "Б2-1", name: "Б2-1", coords: [285, 980], type: "room" },
      { id: "Б2-2", name: "Б2-2", coords: [360, 943], type: "room" },
      { id: "Б2-3", name: "Б2-3", coords: [285, 883], type: "room" },
      { id: "Б2-4", name: "Б2-4", coords: [360, 820], type: "room" },
      { id: "Б2-5", name: "Б2-5", coords: [285, 775], type: "room" },
      { id: "Б2-6", name: "Б2-6", coords: [360, 713], type: "room" },
      { id: "Б2-7", name: "Б2-7", coords: [285, 623], type: "room" },
      { id: "Б2-8", name: "Б2-8", coords: [360, 652], type: "room" },
      { id: "Б2-9", name: "Б2-9", coords: [285, 565], type: "room" },
      { id: "Туалет", name: "Туалет", coords: [360, 613], type: "toilet" },
      { id: "Б2-10", name: "Б2-10", coords: [360, 565], type: "room" },
      { id: "Б2-11", name: "Б2-11", coords: [285, 565], type: "room" },
      { id: "Б2-12", name: "Б2-12", coords: [360, 500], type: "room" },
      { id: "S1", name: "Лестница 1 (на 1 этаж)", coords: [335, 1040], type: "stair" },
      { id: "S2", name: "Лестница 2 (на 1 этаж)", coords: [325, 420], type: "stair" }
    ]
  },

  // Коридорные узлы для правильной навигации
  corridorNodes: {
    1: [
      { id: "C1_1", coords: [310, 1075], type: "corridor" }, // возле лестницы 1
      { id: "C1_2", coords: [310, 1000], type: "corridor" }, // центральный коридор 1
      { id: "C1_3", coords: [310, 800], type: "corridor" },  // центральный коридор 2
      { id: "C1_4", coords: [310, 600], type: "corridor" },  // центральный коридор 3
      { id: "C1_5", coords: [310, 465], type: "corridor" },  // возле лестницы 2
    ],
    2: [
      { id: "C2_1", coords: [310, 1075], type: "corridor" }, // возле лестницы 1
      { id: "C2_2", coords: [310, 1000], type: "corridor" }, // центральный коридор 1
      { id: "C2_3", coords: [310, 800], type: "corridor" },  // центральный коридор 2
      { id: "C2_4", coords: [310, 600], type: "corridor" },  // центральный коридор 3
      { id: "C2_5", coords: [310, 470], type: "corridor" },  // возле лестницы 2
    ]
  },

  routing: {
    maxCorridorDistance: 100,  // Максимальное расстояние между коридорными узлами
    maxRoomToCorridorDistance: 80, // Максимальное расстояние от комнаты до коридора
    stairConnectionDistance: 50,
    corridorOffset: 30 // Отступ для входа/выхода из комнат
  }
};