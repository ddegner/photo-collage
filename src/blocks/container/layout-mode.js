export const COLLAGE_LAYOUT_STATE = {
	RESPONSIVE: 'responsive',
	MIXED: 'mixed',
	FREEFORM: 'freeform',
};

const POSITIONABLE_BLOCKS = new Set( [
	'photo-collage/image',
	'photo-collage/frame',
] );

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
