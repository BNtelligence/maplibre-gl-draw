import type { DrawContext } from "../context.ts";
import { Feat } from "./feature.ts";

export class PointFeat extends Feat {
  override coordinates: GeoJSON.Position;

  constructor(ctx: DrawContext, geojson: GeoJSON.Feature<GeoJSON.Point>) {
    super(ctx, geojson);
    this.coordinates = geojson.geometry.coordinates;
  }

  override isValid() {
    return (
      typeof this.coordinates[0] === "number" &&
      typeof this.coordinates[1] === "number"
    );
  }

  updateCoordinate(pathOrLng: number | string, lngOrLat: number, lat?: number) {
    if (lat) {
      this.coordinates = [lngOrLat as number, lat];
    } else {
      this.coordinates = [pathOrLng as number, lngOrLat as number];
    }
    this.changed();
  }

  override getCoordinate() {
    return this.getCoordinates();
  }
}
