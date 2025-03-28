import Point from "@mapbox/point-geometry";


/**
 * Returns a Point representing a mouse event's position
 * relative to a containing element.
 *
 * @param {MouseEvent} mouseEvent
 * @param {Node} container
 * @returns {Point}
 */
export function mouseEventPoint(mouseEvent, container): Point {
  const rect = container.getBoundingClientRect();
  return new Point(
    mouseEvent.clientX - rect.left - (container.clientLeft || 0),
    mouseEvent.clientY - rect.top - (container.clientTop || 0),
  );
}
