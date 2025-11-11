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
      { id: "Б1-8", name: "Б1-8", coords: [350, 880], type: "room" },
      { id: "Б1-9", name: "Б1-9", coords: [270, 670], type: "room" },
      { id: "Б1-10", name: "Б1-10", coords: [350, 805], type: "room" },
      { id: "Б1-11", name: "Б1-11", coords: [270, 590], type: "room" },
      { id: "Б1-12", name: "Б1-12", coords: [350, 765], type: "room" },
      { id: "Туалет", name: "Туалет", coords: [350, 675], type: "toilet" },
      { id: "S1", name: "Лестница 1", coords: [320, 1075], type: "stair" },
      { id: "S2", name: "Лестница 2", coords: [310, 460], type: "stair" }
    ],
    2: [
      { id: "Б2-1", name: "Б2-1", coords: [285, 980], type: "room" },
      { id: "Б2-2", name: "Б2-2", coords: [360, 940], type: "room" },
      { id: "Б2-3", name: "Б2-3", coords: [285, 880], type: "room" },
      { id: "Б2-4", name: "Б2-4", coords: [360, 820], type: "room" },
      { id: "Б2-5", name: "Б2-5", coords: [285, 775], type: "room" },
      { id: "Б2-6", name: "Б2-6", coords: [360, 710], type: "room" },
      { id: "Б2-7", name: "Б2-7", coords: [285, 620], type: "room" },
      { id: "Б2-8", name: "Б2-8", coords: [360, 650], type: "room" },
      { id: "Б2-9", name: "Б2-9", coords: [285, 565], type: "room" },
      { id: "Туалет", name: "Туалет", coords: [360, 610], type: "toilet" },
      { id: "Б2-10", name: "Б2-10", coords: [360, 565], type: "room" },
      { id: "Б2-11", name: "Б2-11", coords: [285, 565], type: "room" },
      { id: "Б2-12", name: "Б2-12", coords: [360, 500], type: "room" },
      { id: "S1", name: "Лестница 1 (на 1 этаж)", coords: [335, 1040], type: "stair" },
      { id: "S2", name: "Лестница 2 (на 1 этаж)", coords: [325, 420], type: "stair" }
    ]
  },


   // Коридорные точки у дверей комнат для правильной навигации
corridorNodes: {
  1: [
    { id: "Door_Б1-1", coords: [300, 1060], type: "corridor", room: "Б1-1" },
    { id: "Door_Б1-2", coords: [320, 1040], type: "corridor", room: "Б1-2" },
    { id: "Door_Б1-3", coords: [300, 996], type: "corridor", room: "Б1-3" },
    { id: "Door_Б1-4", coords: [320, 980], type: "corridor", room: "Б1-4" },
    { id: "Door_Б1-5", coords: [300, 960], type: "corridor", room: "Б1-5" },
    { id: "Door_Б1-6", coords: [320, 920], type: "corridor", room: "Б1-6" },
    { id: "Door_Б1-7", coords: [300, 725], type: "corridor", room: "Б1-7" },
    { id: "Door_Б1-8", coords: [320, 880], type: "corridor", room: "Б1-8" },
    { id: "Door_Б1-9", coords: [300, 670], type: "corridor", room: "Б1-9" },
    { id: "Door_Б1-10", coords: [320, 805], type: "corridor", room: "Б1-10" },
    { id: "Door_Б1-11", coords: [300, 590], type: "corridor", room: "Б1-11" },
    { id: "Door_Б1-12", coords: [320, 765], type: "corridor", room: "Б1-12" },
    { id: "Door_Туалет1", coords: [320, 675], type: "corridor", room: "Туалет" },
    { id: "Door_S1", coords: [320, 1075], type: "corridor", room: "S1" },
    { id: "Door_S2", coords: [310, 460], type: "corridor", room: "S2" }
  ],
  2: [
    { id: "Door_Б2-1", coords: [301, 980], type: "corridor", room: "Б2-1" },
    { id: "Door_Б2-2", coords: [320, 940], type: "corridor", room: "Б2-2" },
    { id: "Door_Б2-3", coords: [301, 880], type: "corridor", room: "Б2-3" },
    { id: "Door_Б2-4", coords: [320, 820], type: "corridor", room: "Б2-4" },
    { id: "Door_Б2-5", coords: [301, 775], type: "corridor", room: "Б2-5" },
    { id: "Door_Б2-6", coords: [320, 710], type: "corridor", room: "Б2-6" },
    { id: "Door_Б2-7", coords: [301, 620], type: "corridor", room: "Б2-7" },
    { id: "Door_Б2-8", coords: [320, 650], type: "corridor", room: "Б2-8" },
    { id: "Door_Б2-9", coords: [301, 565], type: "corridor", room: "Б2-9" },
    { id: "Door_Б2-10", coords: [320, 565], type: "corridor", room: "Б2-10" },
    { id: "Door_Б2-11", coords: [301, 565], type: "corridor", room: "Б2-11" },
    { id: "Door_Б2-12", coords: [320, 500], type: "corridor", room: "Б2-12" },
    { id: "Door_Туалет2", coords: [320, 610], type: "corridor", room: "Туалет" },
    { id: "Door_S1_2", coords: [335, 1040], type: "corridor", room: "S1" },
    { id: "Door_S2_2", coords: [325, 420], type: "corridor", room: "S2" }
  ]
},

  routing: {
    maxCorridorDistance: 100,  // Максимальное расстояние между коридорными узлами
    maxRoomToCorridorDistance: 80, // Максимальное расстояние от комнаты до коридора
    stairConnectionDistance: 50,
    corridorOffset: 30 // Отступ для входа/выхода из комнат
  }
};
