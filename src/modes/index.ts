import { SimpleSelect } from './simple_select.ts';
import { DirectSelect } from './direct_select.ts';
import { DrawPoint } from './draw_point.ts';
import { DrawPolygon } from './draw_polygon.ts';
import { DrawLineString } from './draw_line_string.ts';
import StaticMode from './static_mode.ts';

export const ALL_MODES = {
	simple_select: SimpleSelect,
	direct_select: DirectSelect,
	draw_point: DrawPoint,
	draw_polygon: DrawPolygon,
	draw_line_string: DrawLineString,
	static: StaticMode
};
