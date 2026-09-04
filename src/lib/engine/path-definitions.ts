import { TAU } from "./pattern-paths";
import type { PathDefinition } from "./pattern-paths";
import type { PatternId } from "./types";

export const pathDefinitions: Partial<Record<PatternId, PathDefinition>> = {
  clover: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      const petal = 0.58 + 0.3 * Math.cos(angle * 4);
      return [
        centerX + Math.cos(angle) * radiusX * petal,
        centerY + Math.sin(angle) * radiusY * petal,
      ];
    },
    samples: 160,
  },
  cornerTour: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom, width, height }) => {
      const insetX = width * 0.18;
      const insetY = height * 0.18;
      switch (index) {
        case 0: {
          return [left, top];
        }
        case 1: {
          return [right - insetX, top + insetY];
        }
        case 2: {
          return [right, bottom];
        }
        default: {
          return [left + insetX, bottom - insetY];
        }
      }
    },
    samples: 4,
  },
  diamondLoop: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom, centerX, centerY }) => {
      switch (index) {
        case 0: {
          return [centerX, top];
        }
        case 1: {
          return [right, centerY];
        }
        case 2: {
          return [centerX, bottom];
        }
        default: {
          return [left, centerY];
        }
      }
    },
    samples: 4,
  },
  ellipse: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.cos(angle) * radiusX,
        centerY + Math.sin(angle) * radiusY,
      ];
    },
    samples: 160,
  },
  figureEight: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.sin(angle) * radiusX,
        centerY + Math.sin(angle * 2) * radiusY * 0.72,
      ];
    },
    samples: 180,
  },
  hourglass: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      const vertical = Math.sin(angle);
      const pinch = 0.22 + 0.74 * Math.abs(vertical);
      return [
        centerX + Math.sin(angle * 2) * radiusX * pinch,
        centerY + vertical * radiusY,
      ];
    },
    samples: 160,
  },
  lissajous: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.sin(angle * 3 + Math.PI / 2) * radiusX,
        centerY + Math.sin(angle * 2) * radiusY,
      ];
    },
    samples: 180,
  },
  perimeterLoop: {
    kind: "polyline",
    pointAt: (index, { left, top, right, bottom }) => {
      switch (index) {
        case 0: {
          return [left, top];
        }
        case 1: {
          return [right, top];
        }
        case 2: {
          return [right, bottom];
        }
        default: {
          return [left, bottom];
        }
      }
    },
    samples: 4,
  },
  stairStep: {
    kind: "polyline",
    pointAt: (index, { left, top, width, height }) => {
      const row = index % 4;
      const column = Math.floor(index / 4) % 5;
      return [left + (column * width) / 4, top + (row * height) / 3];
    },
    samples: 20,
  },
  wave: {
    kind: "curve",
    pointAt: (phase, { centerX, centerY, radiusX, radiusY }) => {
      const angle = phase * TAU;
      return [
        centerX + Math.cos(angle) * radiusX,
        centerY + Math.sin(angle * 3) * radiusY * 0.42,
      ];
    },
    samples: 120,
  },
  zigZag: {
    kind: "polyline",
    pointAt: (index, { left, top, right, height }) => [
      index % 2 === 0 ? left : right,
      top + (height * index) / 4,
    ],
    samples: 5,
  },
};
