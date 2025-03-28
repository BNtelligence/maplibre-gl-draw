export const classes = {
  CANVAS: "maplibregl-canvas",
  CONTROL_BASE: "maplibregl-ctrl",
  CONTROL_PREFIX: "maplibregl-ctrl-",
  CONTROL_BUTTON: "maplibre-gl-draw_ctrl-draw-btn",
  CONTROL_BUTTON_LINE: "maplibre-gl-draw_line",
  CONTROL_BUTTON_POLYGON: "maplibre-gl-draw_polygon",
  CONTROL_BUTTON_POINT: "maplibre-gl-draw_point",
  CONTROL_BUTTON_TRASH: "maplibre-gl-draw_trash",
  CONTROL_BUTTON_COMBINE_FEATURES: "maplibre-gl-draw_combine",
  CONTROL_BUTTON_UNCOMBINE_FEATURES: "maplibre-gl-draw_uncombine",
  CONTROL_GROUP: "maplibregl-ctrl-group",
  ATTRIBUTION: "maplibregl-ctrl-attrib",
  ACTIVE_BUTTON: "active",
  BOX_SELECT: "maplibre-gl-draw_boxselect",
};

export const controls = {
  line_string: true,
  point: true,
  polygon: true,
  trash: true,
};

export const sources = {
  HOT: "maplibre-gl-draw-hot",
  COLD: "maplibre-gl-draw-cold",
};

export const cursors = {
  ADD: "add",
  MOVE: "move",
  DRAG: "drag",
  POINTER: "pointer",
  NONE: "none",
};

export const types = {
  POLYGON: "polygon",
  LINE: "line_string",
  POINT: "point",
};

export const geojsonTypes = {
  FEATURE: "Feature",
  POLYGON: "Polygon",
  LINE_STRING: "LineString",
  POINT: "Point",
  FEATURE_COLLECTION: "FeatureCollection",
  MULTI_PREFIX: "Multi",
  MULTI_POINT: "MultiPoint",
  MULTI_LINE_STRING: "MultiLineString",
  MULTI_POLYGON: "MultiPolygon",
};

export const events = {
  CREATE: "draw.create",
  DELETE: "draw.delete",
  UPDATE: "draw.update",
  SELECTION_CHANGE: "draw.selectionchange",
  MODE_CHANGE: "draw.modechange",
  ACTIONABLE: "draw.actionable",
  RENDER: "draw.render",
  COMBINE_FEATURES: "draw.combine",
  UNCOMBINE_FEATURES: "draw.uncombine",
};

export const updateActions = {
  MOVE: "move",
  CHANGE_COORDINATES: "change_coordinates",
};

export const meta = {
  FEATURE: "feature",
  MIDPOINT: "midpoint",
  VERTEX: "vertex",
};

export const activeStates = {
  ACTIVE: "true",
  INACTIVE: "false",
};

export const interactions = [
  "scrollZoom",
  "boxZoom",
  "dragRotate",
  "dragPan",
  "keyboard",
  "doubleClickZoom",
  "touchZoomRotate",
];

export const LAT_MIN = -90;
export const LAT_RENDERED_MIN = -85;
export const LAT_MAX = 90;
export const LAT_RENDERED_MAX = 85;
export const LNG_MIN = -270;
export const LNG_MAX = 270;

// export const modes = {
//   ...MapLibreDraw.constants.modes,
//   DRAW_CIRCLE: 'draw_circle'
// };

// export const properties = {
//   CIRCLE_RADIUS: 'circleRadius',
//   CIRCLE_HANDLE_BEARING: 'circleHandleBearing'
// };


export const modes = {
  simple_select:"simple_select",
  draw_line_string:"draw_line_string",
  draw_polygon:"draw_polygon",
  draw_rectangle:"draw_rectangle",
  draw_assisted_rectangle:"draw_assisted_rectangle",
  draw_point:"draw_point",
  direct_select:"direct_select",
  static:"static",
};
