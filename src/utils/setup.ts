import type { MapLibreDrawOptions } from "../types.ts";
import { ModeClasses } from "../modes.ts";
import { modes } from "../constants.ts";
import { theme } from "../lib/theme.ts";
import * as Constants from "../constants.ts";

const defaultOptions: MapLibreDrawOptions = {
  defaultMode: modes.simple_select,
  keybindings: true,
  touchEnabled: true,
  clickBuffer: 2,
  touchBuffer: 25,
  boxSelect: true,
  displayControlsDefault: true,
  styles: theme,
  modes: ModeClasses,
  controls: {},
  userProperties: false,
};

const showControls = {
  point: true,
  line_string: true,
  polygon: true,
  trash: true,
  combine_features: true,
  uncombine_features: true,
};

const hideControls = {
  point: false,
  line_string: false,
  polygon: false,
  trash: false,
  combine_features: false,
  uncombine_features: false,
};

function addSources(styles, sourceBucket) {
  return styles.map((style) => {
    if (style.source) return style;
    return Object.assign({}, style, {
      id: `${style.id}.${sourceBucket}`,
      source: sourceBucket === "hot" ? Constants.sources.HOT : Constants.sources.COLD,
    });
  });
}

export function setupOptions(options: MapLibreDrawOptions = {}) {
  let withDefaults = Object.assign({}, options);

  if (!options.controls) {
    withDefaults.controls = {};
  }

  if (options.displayControlsDefault === false) {
    withDefaults.controls = Object.assign({}, hideControls, options.controls);
  } else {
    withDefaults.controls = Object.assign({}, showControls, options.controls);
  }

  withDefaults = Object.assign({}, defaultOptions, withDefaults);

  // Layers with a shared source should be adjacent for performance reasons
  withDefaults.styles = addSources(withDefaults.styles, "cold").concat(
    addSources(withDefaults.styles, "hot"),
  );

  return withDefaults;
}