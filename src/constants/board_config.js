export const boardConfig = {
  size: { width: 24, height: 25 },

  rooms: {
    kitchen: {
      id: "kitchen",
      areas: [{ start: { x: 0, y: 0 }, end: { x: 5, y: 6 } }],
      doors: [{ x: 4, y: 7 }],
    },

    ballroom: {
      id: "ballroom",
      areas: [
        { start: { x: 10, y: 0 }, end: { x: 13, y: 1 } },
        { start: { x: 8, y: 2 }, end: { x: 15, y: 7 } },
      ],
      doors: [
        { x: 9, y: 8 },
        { x: 16, y: 5 },
      ],
    },

    conservatory: {
      id: "conservatory",
      areas: [
        { start: { x: 18, y: 0 }, end: { x: 23, y: 4 } },
        { start: { x: 19, y: 5 }, end: { x: 23, y: 5 } },
      ],
      doors: [{ x: 18, y: 5 }],
    },

    dining_room: {
      id: "dining_room",
      areas: [
        { start: { x: 0, y: 9 }, end: { x: 4, y: 9 } },
        { start: { x: 0, y: 10 }, end: { x: 7, y: 15 } },
      ],
      doors: [{ x: 6, y: 16 }],
    },

    lounge: {
      id: "lounge",
      areas: [{ start: { x: 0, y: 19 }, end: { x: 6, y: 24 } }],
      doors: [{ x: 6, y: 18 }],
    },

    hall: {
      id: "hall",
      areas: [{ start: { x: 9, y: 18 }, end: { x: 14, y: 24 } }],
      doors: [{ x: 12, y: 17 }],
    },

    study: {
      id: "study",
      areas: [{ start: { x: 17, y: 21 }, end: { x: 23, y: 24 } }],
      doors: [{ x: 17, y: 20 }],
    },

    library: {
      id: "library",
      areas: [
        { start: { x: 17, y: 15 }, end: { x: 17, y: 17 } },
        { start: { x: 18, y: 14 }, end: { x: 23, y: 18 } },
      ],
      doors: [{ x: 16, y: 16 }],
    },

    billiard_room: {
      id: "billiard_room",
      areas: [{ start: { x: 18, y: 8 }, end: { x: 23, y: 12 } }],
      doors: [{ x: 17, y: 9 }],
    },

    cluedo: {
      id: "cluedo",
      areas: [{ start: { x: 10, y: 10 }, end: { x: 14, y: 16 } }],
      doors: [],
    },
  },

  walls: [
    { start: { x: 6, y: 0 }, end: { x: 8, y: 0 } },
    { start: { x: 6, y: 1 }, end: { x: 6, y: 1 } },
    { start: { x: 15, y: 0 }, end: { x: 17, y: 0 } },
    { start: { x: 17, y: 1 }, end: { x: 17, y: 1 } },
    { start: { x: 0, y: 8 }, end: { x: 0, y: 8 } },
    { start: { x: 0, y: 16 }, end: { x: 0, y: 16 } },
    { start: { x: 0, y: 18 }, end: { x: 0, y: 18 } },
    { start: { x: 8, y: 24 }, end: { x: 8, y: 24 } },
    { start: { x: 15, y: 24 }, end: { x: 15, y: 24 } },
    { start: { x: 23, y: 20 }, end: { x: 23, y: 20 } },
    { start: { x: 23, y: 13 }, end: { x: 23, y: 13 } },
    { start: { x: 23, y: 7 }, end: { x: 23, y: 7 } },
  ],

  secretPassages: {
    kitchen: "study",
    study: "kitchen",
    lounge: "conservatory",
    conservatory: "lounge",
  },

  startingPositions: {
    mustard: { x: 0, y: 17 },
    scarlet: { x: 7, y: 24 },
    plum: { x: 23, y: 19 },
    peacock: { x: 23, y: 6 },
    green: { x: 14, y: 0 },
    white: { x: 9, y: 0 },
  },
};
