import * as CommonSelectors from "../lib/common_selectors.ts";
import { mouseEventPoint } from "../lib/mouse_event_point.ts";
import { createSupplementaryPoints } from "../lib/create_supplementary_points.ts";
import { StringSet } from "../lib/string_set.ts";
import { doubleClickZoom } from "../lib/double_click_zoom.ts";
import { moveFeatures } from "../lib/move_features.ts";
import * as Constants from "../constants.ts";
import { ModeInterface } from "./mode_interface.ts";
import { modes } from "../constants.ts";
import type { MultiFeat } from "../feature_types/multi_feature.ts";
import type Point from "@mapbox/point-geometry";
import type { PointLike } from "maplibre-gl";
import { ModeBase } from "./mode_base.ts";

export class SimpleSelect extends ModeBase implements ModeInterface {
  onSetup(opts) {
    const state = {
      dragMoveLocation: null,
      boxSelectStartLocation: null,
      boxSelectElement: undefined,
      boxSelecting: false,
      canBoxSelect: false,
      dragMoving: false,
      canDragMove: false,
      initialDragPanState: this.map.dragPan.isEnabled(),
      initiallySelectedFeatureIds: opts.featureIds || [],
    };

    this.setSelected(
      state.initiallySelectedFeatureIds.filter(
        (id) => this.getFeature(id) !== undefined,
      ),
    );
    this.fireActionable();

    this.setActionableState({
      combineFeatures: true,
      uncombineFeatures: true,
      trash: true,
    });

    return state;
  }

  fireUpdate() {
    this.fire(Constants.events.UPDATE, {
      action: Constants.updateActions.MOVE,
      features: this.getSelected().map((f) => f.toGeoJSON()),
    });
  }

  fireActionable() {
    const selectedFeatures = this.getSelected();

    const multiFeatures = selectedFeatures.filter((feature) =>
      this.isInstanceOf("MultiFeature", feature)
    );

    let combineFeatures = false;

    if (selectedFeatures.length > 1) {
      combineFeatures = true;
      const featureType = selectedFeatures[0].type.replace("Multi", "");
      selectedFeatures.forEach((feature) => {
        if (feature.type.replace("Multi", "") !== featureType) {
          combineFeatures = false;
        }
      });
    }

    const uncombineFeatures = multiFeatures.length > 0;
    const trash = selectedFeatures.length > 0;

    this.setActionableState({
      combineFeatures,
      uncombineFeatures,
      trash,
    });
  }

  getUniqueIds(allFeatures) {
    if (!allFeatures.length) return [];
    const ids = allFeatures
      .map((s) => s.properties.id)
      .filter((id) => id !== undefined)
      .reduce((memo, id) => {
        memo.add(id);
        return memo;
      }, new StringSet());

    return ids.values();
  }

  stopExtendedInteractions(state) {
    if (state.boxSelectElement) {
      if (state.boxSelectElement.parentNode) {
        state.boxSelectElement.parentNode.removeChild(state.boxSelectElement);
      }
      state.boxSelectElement = null;
    }

    if (
      (state.canDragMove || state.canBoxSelect) &&
      state.initialDragPanState === true
    ) {
      this.map.dragPan.enable();
    }

    state.boxSelecting = false;
    state.canBoxSelect = false;
    state.dragMoving = false;
    state.canDragMove = false;
  }

  onStop() {
    doubleClickZoom.enable(this);
  }

  onMouseMove(state, e) {
    const isFeature = CommonSelectors.isFeature(e);
    if (isFeature && state.dragMoving) this.fireUpdate();

    this.stopExtendedInteractions(state);

    return true;
  }

  onMouseOut(state) {
    if (state.dragMoving) return this.fireUpdate();

    return true;
  }

  onTap(state, e) {
    if (CommonSelectors.noTarget(e)) return this.clickAnywhere(state, e);
    if (CommonSelectors.isOfMetaType(Constants.meta.VERTEX)(e)) {
      return this.clickOnVertex(state, e);
    }
    if (CommonSelectors.isFeature(e)) return this.clickOnFeature(state, e);
  }

  onClick(state, e) {
    if (CommonSelectors.noTarget(e)) return this.clickAnywhere(state, e);
    if (CommonSelectors.isOfMetaType(Constants.meta.VERTEX)(e)) {
      return this.clickOnVertex(state, e);
    }
    if (CommonSelectors.isFeature(e)) return this.clickOnFeature(state, e);
  }

  clickAnywhere(state, _e) {
    const wasSelected = this.getSelectedIds();
    if (wasSelected.length) {
      this.clearSelectedFeatures();
      wasSelected.forEach((id) => this.doRender(id));
    }
    doubleClickZoom.enable(this);
    this.stopExtendedInteractions(state);
  }

  clickOnVertex(_state, e) {
    this.changeMode(modes.direct_select, {
      featureId: e.featureTarget.properties.parent,
      coordPath: e.featureTarget.properties.coord_path,
      startPos: e.lngLat,
    });
    this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  }

  startOnActiveFeature(state, e) {
    this.stopExtendedInteractions(state);

    this.map.dragPan.disable();

    this.doRender(e.featureTarget.properties.id);

    state.canDragMove = true;
    state.dragMoveLocation = e.lngLat;
  }

  clickOnFeature(state, e) {
    doubleClickZoom.disable(this);
    this.stopExtendedInteractions(state);

    const isShiftClick = CommonSelectors.isShiftDown(e);
    const selectedFeatureIds = this.getSelectedIds();
    const featureId = e.featureTarget.properties.id;
    const isFeatureSelected = this.isSelected(featureId);

    if (
      !isShiftClick &&
      isFeatureSelected &&
      this.getFeature(featureId)?.type !== Constants.geojsonTypes.POINT
    ) {
      return this.changeMode(modes.direct_select, {
        featureId,
      });
    }

    if (isFeatureSelected && isShiftClick) {
      this.deselect(featureId);
      this.updateUIClasses({ mouse: Constants.cursors.POINTER });
      if (selectedFeatureIds.length === 1) {
        doubleClickZoom.enable(this);
      }
    } else if (!isFeatureSelected && isShiftClick) {
      this.select(featureId);
      this.updateUIClasses({ mouse: Constants.cursors.MOVE });
    } else if (!isFeatureSelected && !isShiftClick) {
      selectedFeatureIds.forEach((id) => this.doRender(id));
      this.setSelected(featureId);
      this.updateUIClasses({ mouse: Constants.cursors.MOVE });
    }

    this.doRender(featureId);
  }

  onMouseDown(state, e) {
    state.initialDragPanState = this.map.dragPan.isEnabled();
    if (CommonSelectors.isActiveFeature(e)) {
      return this.startOnActiveFeature(state, e);
    }
    if (this.drawConfig.boxSelect && CommonSelectors.isShiftMousedown(e)) {
      return this.startBoxSelect(state, e);
    }
  }

  startBoxSelect(state, e) {
    this.stopExtendedInteractions(state);
    this.map.dragPan.disable();
    state.boxSelectStartLocation = mouseEventPoint(
      e.originalEvent,
      this.map.getContainer(),
    );
    state.canBoxSelect = true;
  }

  onTouchStart(state, e) {
    if (CommonSelectors.isActiveFeature(e)) {
      return this.startOnActiveFeature(state, e);
    }
  }

  onDrag(state, e) {
    if (state.canDragMove) return this.dragMove(state, e);
    if (this.drawConfig.boxSelect && state.canBoxSelect) {
      return this.whileBoxSelect(state, e);
    }
  }

  whileBoxSelect(state, e) {
    state.boxSelecting = true;
    this.updateUIClasses({ mouse: Constants.cursors.ADD });

    if (!state.boxSelectElement) {
      state.boxSelectElement = document.createElement("div");
      state.boxSelectElement.classList.add(Constants.classes.BOX_SELECT);
      this.map.getContainer().appendChild(state.boxSelectElement);
    }

    const current = mouseEventPoint(e.originalEvent, this.map.getContainer());
    const minX = Math.min(state.boxSelectStartLocation.x, current.x);
    const maxX = Math.max(state.boxSelectStartLocation.x, current.x);
    const minY = Math.min(state.boxSelectStartLocation.y, current.y);
    const maxY = Math.max(state.boxSelectStartLocation.y, current.y);
    const translateValue = `translate(${minX}px, ${minY}px)`;
    state.boxSelectElement.style.transform = translateValue;
    state.boxSelectElement.style.WebkitTransform = translateValue;
    state.boxSelectElement.style.width = `${maxX - minX}px`;
    state.boxSelectElement.style.height = `${maxY - minY}px`;
  }

  dragMove(state, e) {
    state.dragMoving = true;
    e.originalEvent.stopPropagation();

    const delta = {
      lng: e.lngLat.lng - state.dragMoveLocation.lng,
      lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };

    moveFeatures(this.getSelected(), delta);

    state.dragMoveLocation = e.lngLat;
  }


  onTouchEnd(state: {dragMoving: boolean, boxSelecting: boolean, boxSelectStartLocation: Point}, e) {
    if (state.dragMoving) {
      this.fireUpdate();
    } else if (state.boxSelecting) {
      const bbox: [PointLike,
        PointLike] = [
        state.boxSelectStartLocation,
        mouseEventPoint(e.originalEvent, this.map.getContainer()),
      ];
      const featuresInBox = this.featuresAt(undefined, bbox, "click");
      const idsToSelect = this.getUniqueIds(featuresInBox).filter(
        (id) => !this.isSelected(id),
      );

      if (idsToSelect.length) {
        this.select(idsToSelect);
        idsToSelect.forEach((id) => this.doRender(id));
        this.updateUIClasses({ mouse: Constants.cursors.MOVE });
      }
    }
    this.stopExtendedInteractions(state);
  }

  onMouseUp(state, e) {
    if (state.dragMoving) {
      this.fireUpdate();
    } else if (state.boxSelecting) {
      const bbox: [PointLike, PointLike] = [
        state.boxSelectStartLocation,
        mouseEventPoint(e.originalEvent, this.map.getContainer()),
      ];
      const featuresInBox = this.featuresAt(undefined, bbox, "click");
      const idsToSelect = this.getUniqueIds(featuresInBox).filter(
        (id) => !this.isSelected(id),
      );

      if (idsToSelect.length) {
        this.select(idsToSelect);
        idsToSelect.forEach((id) => this.doRender(id));
        this.updateUIClasses({ mouse: Constants.cursors.MOVE });
      }
    }
    this.stopExtendedInteractions(state);
  }

  toDisplayFeatures(_state, geojson, display) {
    geojson.properties.active = this.isSelected(geojson.properties.id)
      ? Constants.activeStates.ACTIVE
      : Constants.activeStates.INACTIVE;
    display(geojson);
    this.fireActionable();
    if (
      geojson.properties.active !== Constants.activeStates.ACTIVE ||
      geojson.geometry.type === Constants.geojsonTypes.POINT
    ) {
      return;
    }
    createSupplementaryPoints(geojson).forEach(display);
  }

  onTrash() {
    this.deleteFeature(this.getSelectedIds());
    this.fireActionable();
  }

  onCombineFeatures() {
    const selectedFeatures = this.getSelected();

    if (selectedFeatures.length === 0 || selectedFeatures.length < 2) return;

    const coordinates: any[] = [],
      featuresCombined: any[] = [];
    const featureType = selectedFeatures[0].type.replace("Multi", "");

    for (let i = 0; i < selectedFeatures.length; i++) {
      const feature = selectedFeatures[i];

      if (feature.type.replace("Multi", "") !== featureType) {
        return;
      }
      if (feature.type.includes("Multi")) {
        feature.getCoordinates().forEach((subcoords) => {
          coordinates.push(subcoords);
        });
      } else {
        coordinates.push(feature.getCoordinates());
      }

      featuresCombined.push(feature.toGeoJSON());
    }

    if (featuresCombined.length > 1) {
      const multiFeature = this.newFeature({
        type: Constants.geojsonTypes.FEATURE as "Feature",
        properties: featuresCombined[0].properties,
        geometry: {
          type: `Multi${featureType}` as "MultiPolygon"| "MultiLineString" | "MultiPoint",
          coordinates,
        },
      });

      this.addFeature(multiFeature);
      this.deleteFeature(this.getSelectedIds(), { silent: true });
      this.setSelected([multiFeature.id]);

      this.fire(Constants.events.COMBINE_FEATURES, {
        createdFeatures: [multiFeature.toGeoJSON()],
        deletedFeatures: featuresCombined,
      });
    }
    this.fireActionable();
  }

  onUncombineFeatures() {
    const selectedFeatures = this.getSelected();
    if (selectedFeatures.length === 0) return;

    const createdFeatures: any[] = [];
    const featuresUncombined: any[] = [];

    for (let i = 0; i < selectedFeatures.length; i++) {
      const feature = selectedFeatures[i];

      if (this.isInstanceOf("MultiFeature", feature)) {

        

        (feature as MultiFeat ).getFeatures().forEach((subFeature) => {
          this.addFeature(subFeature);
          subFeature.properties = feature.properties;
          createdFeatures.push(subFeature.toGeoJSON());
          this.select([subFeature.id]);
        });
        this.deleteFeature(feature.id, { silent: true });
        featuresUncombined.push(feature.toGeoJSON());
      }
    }

    if (createdFeatures.length > 1) {
      this.fire(Constants.events.UNCOMBINE_FEATURES, {
        createdFeatures,
        deletedFeatures: featuresUncombined,
      });
    }
    this.fireActionable();
  }
}

// For backwards compatibility
export default SimpleSelect;
