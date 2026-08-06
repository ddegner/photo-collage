import {
	isViewportWidthLength,
	parseCanvasLength,
} from '../utils/canvas-geometry';

export const COLLAGE_LAYOUT_STATE = {
	RESPONSIVE: 'responsive',
	MIXED: 'mixed',
	FREEFORM: 'freeform',
};

export const COLLAGE_GEOMETRY_UNITS = {
	PROPORTIONAL: 'proportional',
	PIXEL: 'pixel',
	MIXED: 'mixed',
};

const POSITIONABLE_BLOCKS = new Set( [
	'photo-collage/image',
	'photo-collage/frame',
] );

const getLengthUnit = ( value ) => parseCanvasLength( value )?.unit ?? null;

/**
 * Derive a collage's positioning state from its direct positionable children.
 *
 * Empty collages are responsive by default. Unknown legacy children are
 * ignored because they do not participate in Photo Collage positioning.
 *
 * @param {Array<Object>} directChildren Direct child block records.
 * @return {'responsive'|'mixed'|'freeform'} Current collage layout state.
 */
export const getCollageLayoutState = ( directChildren = [] ) => {
	const positionableChildren = directChildren.filter( ( block ) =>
		POSITIONABLE_BLOCKS.has( block?.name )
	);

	if ( positionableChildren.length === 0 ) {
		return COLLAGE_LAYOUT_STATE.RESPONSIVE;
	}

	const absoluteCount = positionableChildren.filter(
		( block ) => block.attributes?.useAbsolutePosition === true
	).length;

	if ( absoluteCount === 0 ) {
		return COLLAGE_LAYOUT_STATE.RESPONSIVE;
	}

	if ( absoluteCount === positionableChildren.length ) {
		return COLLAGE_LAYOUT_STATE.FREEFORM;
	}

	return COLLAGE_LAYOUT_STATE.MIXED;
};

/**
 * Derive whether a collage's geometry scales with the container width.
 *
 * Inspects the position attributes (active vertical anchor, horizontal
 * anchor, width) of absolutely positioned children plus the container's own
 * height behavior. Explicit child heights are deliberately ignored: pixel
 * heights are the anchors the auto-height solver derives the container
 * height from, so they are part of the proportional model, not a violation
 * of it. Derived, never stored — it can't drift from the actual units.
 *
 * @param {Array<Object>} directChildren      Direct child block records.
 * @param {Object}        containerAttributes Container block attributes.
 * @return {'proportional'|'pixel'|'mixed'|null} Geometry units state, or
 *                                              null without absolute children.
 */
export const getCollageGeometryUnits = (
	directChildren = [],
	containerAttributes = {}
) => {
	const absoluteChildren = directChildren.filter(
		( block ) =>
			POSITIONABLE_BLOCKS.has( block?.name ) &&
			block.attributes?.useAbsolutePosition === true
	);

	if ( absoluteChildren.length === 0 ) {
		return null;
	}

	let hasPercent = false;
	let hasPixel = false;
	const recordUnit = ( unit ) => {
		hasPercent = hasPercent || unit === '%';
		hasPixel = hasPixel || unit === 'px';
	};

	absoluteChildren.forEach( ( block ) => {
		const attributes = block.attributes || {};

		recordUnit(
			getLengthUnit( attributes.top ) ??
				getLengthUnit( attributes.bottom )
		);
		recordUnit(
			getLengthUnit( attributes.left ) ??
				getLengthUnit( attributes.right )
		);
		recordUnit( getLengthUnit( attributes.width ) );
	} );

	const heightMode = containerAttributes.heightMode || 'fixed';
	const containerScalesWithWidth =
		heightMode === 'auto' ||
		isViewportWidthLength( containerAttributes.containerHeight );

	if ( ! containerScalesWithWidth ) {
		hasPixel = true;
	}

	if ( hasPixel ) {
		return hasPercent
			? COLLAGE_GEOMETRY_UNITS.MIXED
			: COLLAGE_GEOMETRY_UNITS.PIXEL;
	}

	return COLLAGE_GEOMETRY_UNITS.PROPORTIONAL;
};
