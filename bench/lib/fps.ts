export function fpsRunner() {
  let frameCount = 0;
  let start = 0;
  let running = false;

  const frameCounter = function () {
    if (running) {
      frameCount++;
      requestAnimationFrame(frameCounter);
    }
  };

  return {
    start() {
      running = true;
      start = performance.now();
      requestAnimationFrame(frameCounter);
    },
    stop() {
      const end = performance.now();
      return frameCount / ((end - start) / 1000);
    },
  };
}
