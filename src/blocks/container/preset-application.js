const IMAGE_BLOCK_NAME = 'photo-collage/image';

const LAYOUT_DEFAULTS = {
	useAbsolutePosition: false,
	top: 'auto',
	right: 'auto',
	bottom: 'auto',
	left: 'auto',
	width: '50%',
	height: 'auto',
	zIndex: 1,
	rotation: 0,
};

const MARGIN_DEFAULTS = {
	top: '0%',
	right: '0%',
	bottom: '0%',
	left: '0%',
};

/**
 * Keep native block movement aligned with the applied positioning model.
 *
 * Absolute items use the plugin's canvas mover, so native source-order moving
 * is locked. Flow items return movement to WordPress by removing only the move
 * lock while retaining removal, editing, and future lock properties.
 *
 * @param {Object|undefined} lock                Existing block lock.
 * @param {boolean}          useAbsolutePosition Applied positioning mode.
 * @return {Object|undefined} Updated lock, or undefined when no locks remain.
 */
const getPositioningLock = ( lock, useAbsolutePosition ) => {
	const nextLock =
		lock && typeof lock === 'object' && ! Array.isArray( lock )
			? { ...lock }
			: {};

	if ( useAbsolutePosition ) {
		nextLock.move = true;
	} else {
		delete nextLock.move;
	}

	return Object.keys( nextLock ).length > 0 ? nextLock : undefined;
};

/**
 * Apply only layout-owned preset attributes while preserving all block content
 * and presentation attributes that the preset does not control.
 *
 * @param {Object} attributes       Existing image attributes.
 * @param {Object} presetAttributes Preset layout attributes.
 * @return {Object} Merged image attributes.
 */
export const applyPresetLayoutToAttributes = (
	attributes = {},
	presetAttributes = {}
) => {
	const {
		marginTop = MARGIN_DEFAULTS.top,
		marginRight = MARGIN_DEFAULTS.right,
		marginBottom = MARGIN_DEFAULTS.bottom,
		marginLeft = MARGIN_DEFAULTS.left,
		...layoutAttributes
	} = presetAttributes;

	const style = attributes.style || {};
	const spacing = style.spacing || {};
	const useAbsolutePosition = layoutAttributes.useAbsolutePosition === true;

	return {
		...attributes,
		...LAYOUT_DEFAULTS,
		...layoutAttributes,
		lock: getPositioningLock( attributes.lock, useAbsolutePosition ),
		style: {
			...style,
			spacing: {
				...spacing,
				margin: {
					top: marginTop,
					right: marginRight,
					bottom: marginBottom,
					left: marginLeft,
				},
			},
		},
	};
};

/**
 * Build the exact child block list for a preset without silently destroying
 * non-image blocks or image data.
 *
 * Existing images keep their client ids, complete attributes, and inner blocks.
 * Frames and other non-image children remain in their original positions. Blank
 * image blocks are added when the preset has more slots than the collage. When
 * the preset has fewer slots, surplus images are reported for confirmation.
 *
 * @param {Array<Object>} innerBlocks      Existing direct child blocks.
 * @param {Array<Object>} presetLayout     Preset image layout attributes.
 * @param {Function}      createImageBlock Creates a new image block.
 * @return {{blocks: Array<Object>, removedBlocks: Array<Object>}} Application plan.
 */
export const createPresetApplicationPlan = (
	innerBlocks,
	presetLayout,
	createImageBlock
) => {
	if ( ! Array.isArray( presetLayout ) || presetLayout.length === 0 ) {
		return { blocks: innerBlocks, removedBlocks: [] };
	}

	const blocks = [];
	let imageIndex = 0;
	let insertionIndex = 0;

	innerBlocks.forEach( ( block ) => {
		if ( block.name !== IMAGE_BLOCK_NAME ) {
			blocks.push( block );
			return;
		}

		const presetAttributes = presetLayout[ imageIndex ];
		imageIndex += 1;

		if ( ! presetAttributes ) {
			return;
		}

		blocks.push( {
			...block,
			attributes: applyPresetLayoutToAttributes(
				block.attributes,
				presetAttributes
			),
		} );
		insertionIndex = blocks.length;
	} );

	for ( ; imageIndex < presetLayout.length; imageIndex += 1 ) {
		const newBlock = createImageBlock(
			IMAGE_BLOCK_NAME,
			applyPresetLayoutToAttributes( {}, presetLayout[ imageIndex ] )
		);
		blocks.splice( insertionIndex, 0, newBlock );
		insertionIndex += 1;
	}

	const retainedClientIds = new Set(
		blocks.map( ( block ) => block.clientId ).filter( Boolean )
	);
	const removedBlocks = innerBlocks.filter(
		( block ) => block.clientId && ! retainedClientIds.has( block.clientId )
	);

	return { blocks, removedBlocks };
};
