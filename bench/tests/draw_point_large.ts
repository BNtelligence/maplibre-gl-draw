"use strict";

import { Evented } from "../lib/evented.ts";
import { formatNumber } from "../lib/format_number";
import { fpsRunner } from "../lib/fps";
import { DrawMouse } from "../lib/mouse_draw";

const START = { x: 189, y: 293 };

export class Benchmark extends Evented {
  constructor(options) {
    super();

    const out = options.createMap({ width: 1024 });

    // eslint-disable-next-line new-cap
    const dragMouse = DrawMouse(START, out.map);

    const progressDiv = document.getElementById("progress");
    out.map.on("progress", (e) => {
      progressDiv.style.width = `${e.done}%`;
    });

    out.map.on("load", () => {
      out.map.on("draw.modechange", (e) => {
        if (e.mode === "simple_select") {
          out.draw.changeMode("draw_point");
        }
      });
      out.draw.changeMode("draw_point");

      setTimeout(() => {
        const FPSControl = fpsRunner();
        FPSControl.start();
        dragMouse(() => {
          const fps = FPSControl.stop();
          if (fps < 55) {
            this.fire("fail", {
              message: `${formatNumber(fps)} fps - expected 55fps or better`,
            });
          } else {
            this.fire("pass", { message: `${formatNumber(fps)} fps` });
          }
          out.draw.changeMode("simple_select");
        });
      }, 2000);
    });
  }
}
