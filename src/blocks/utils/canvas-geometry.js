const CANVAS_LENGTH_PATTERN = /^\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*(%|px)\s*$/i;
const DEFAULT_PRECISION = 3;
const DEFAULT_MIN_SIZE = 48;
const ZERO_FLOW_MARGINS = {
	top: '0%',
	right: '0%',
	bottom: '0%',
	left: '0%',
};

export const CANVAS_GEOMETRY_CHANGE_EVENT =
	'photo-collage:canvas-geometry-change';
export const CANVAS_INTERACTION_ATTRIBUTE = 'data-pc-interacting';

const isFiniteNumber = ( value ) =>
	typeof value === 'number' && Number.isFinite( value );

const normalizeZero = ( value ) => ( Object.is( value, -0 ) ? 0 : value );

const roundNumber = ( value, precision = DEFAULT_PRECISION ) => {
	const factor = 10 ** precision;
	return normalizeZero( Math.round( value * factor ) / factor );
};

const rotateVector = ( vector, rotation ) => {
	const radians = ( rotation * Math.PI ) / 180;
	const cosine = Math.cos( radians );
	const sine = Math.sin( radians );

	return {
		x: vector.x * cosine - vector.y * sine,
		y: vector.x * sine + vector.y * cosine,
	};
};

/**
 * Parse an interactive CSS length supported by the canvas controls.
 *
 * @param {string|number} value CSS length.
 * @return {{value: number, unit: '%'|'px'}|null} Parsed value.
 */
export const parseCanvasLength = ( value ) => {
	if ( isFiniteNumber( value ) ) {
		return { value, unit: 'px' };
	}

	if ( typeof value !== 'string' ) {
		return null;
	}

	const match = value.match( CANVAS_LENGTH_PATTERN );
	if ( ! match ) {
		return null;
	}

	const parsedValue = Number.parseFloat( match[ 1 ] );
	if ( ! Number.isFinite( parsedValue ) ) {
		return null;
	}

	return {
		value: parsedValue,
		unit: match[ 2 ].toLowerCase(),
	};
};

/**
 * Format a finite CSS length without trailing zeroes or negative zero.
 *
 * @param {number}   value     Numeric length.
 * @param {'%'|'px'} unit      CSS unit.
 * @param {number}   precision Decimal precision.
 * @return {string|null} Formatted CSS length.
 */
export const formatCanvasLength = (
	value,
	unit,
	precision = DEFAULT_PRECISION
) => {
	if (
		! isFiniteNumber( value ) ||
		! [ '%', 'px' ].includes( unit ) ||
		! Number.isInteger( precision ) ||
		precision < 0
	) {
		return null;
	}

	return `${ roundNumber( value, precision ) }${ unit }`;
};

/**
 * Convert a pixel length to a supported CSS unit.
 *
 * @param {number}   pixels        Pixel length.
 * @param {Object}   options       Conversion options.
 * @param {'%'|'px'} options.unit  Preferred output unit.
 * @param {number}   options.basis Percentage basis.
 * @return {string|null} Formatted CSS length.
 */
export const pixelsToCanvasLength = (
	pixels,
	{ unit = 'px', basis = 0 } = {}
) => {
	if ( ! isFiniteNumber( pixels ) ) {
		return null;
	}

	if ( unit === '%' && isFiniteNumber( basis ) && basis > 0 ) {
		return formatCanvasLength( ( pixels / basis ) * 100, '%' );
	}

	return formatCanvasLength( pixels, 'px' );
};

// Viewport-width lengths scale with the window, so a fixed-height container
// using one already behaves proportionally without auto height.
const VIEWPORT_WIDTH_LENGTH_PATTERN =
	/^\s*\d+(?:\.\d+)?\s*(?:vw|svw|lvw|dvw)\s*$/i;

/**
 * Check whether a CSS length scales with the viewport width.
 *
 * @param {string} value CSS length.
 * @return {boolean} Whether the value uses a viewport-width unit.
 */
export const isViewportWidthLength = ( value ) =>
	typeof value === 'string' && VIEWPORT_WIDTH_LENGTH_PATTERN.test( value );

// Vertical percentages whose combined fraction (offset plus any percentage
// height) reaches ~1 defeat the auto-height solver: its 1/(1 - fraction)
// closed form diverges and both the JS and PHP solvers skip such children at
// 99.5%. Writes against a solved auto basis keep the exact position as
// pixels instead. Fixed-height bases have no solver to protect, so the guard
// must not fire there.
export const MAX_VERTICAL_FRACTION = 0.99;

/**
 * Convert a vertical pixel length, guarding solver-degenerate percentages.
 *
 * @param {number}      pixels                       Pixel length.
 * @param {Object}      options                      Conversion options.
 * @param {'%'|'px'}    options.unit                 Preferred output unit.
 * @param {number}      options.basis                Percentage basis.
 * @param {number|null} options.solverHeightFraction Post-commit percentage
 *                                                   height fraction when the basis is a solved auto
 *                                                   height; null when the basis is fixed (no guard).
 * @return {string|null} Formatted CSS length.
 */
const pixelsToVerticalCanvasLength = (
	pixels,
	{ unit = 'px', basis = 0, solverHeightFraction = null }
) => {
	if (
		unit === '%' &&
		isFiniteNumber( solverHeightFraction ) &&
		isFiniteNumber( basis ) &&
		basis > 0 &&
		pixels / basis + solverHeightFraction >= MAX_VERTICAL_FRACTION
	) {
		return formatCanvasLength( pixels, 'px' );
	}

	return pixelsToCanvasLength( pixels, { unit, basis } );
};

/**
 * Normalize a pointer delta from rendered pixels into canvas layout pixels.
 *
 * @param {Object} options              Pointer and scale values.
 * @param {number} options.clientX      Current horizontal pointer coordinate.
 * @param {number} options.clientY      Current vertical pointer coordinate.
 * @param {number} options.startClientX Initial horizontal pointer coordinate.
 * @param {number} options.startClientY Initial vertical pointer coordinate.
 * @param {number} options.scaleX       Horizontal editor canvas scale.
 * @param {number} options.scaleY       Vertical editor canvas scale.
 * @return {{x: number, y: number}} Normalized delta.
 */
export const normalizePointerDelta = ( {
	clientX,
	clientY,
	startClientX,
	startClientY,
	scaleX = 1,
	scaleY = 1,
} ) => {
	const safeScaleX = isFiniteNumber( scaleX ) && scaleX > 0 ? scaleX : 1;
	const safeScaleY = isFiniteNumber( scaleY ) && scaleY > 0 ? scaleY : 1;

	return {
		x: ( clientX - startClientX ) / safeScaleX,
		y: ( clientY - startClientY ) / safeScaleY,
	};
};

/**
 * Project a canvas-space delta onto a rotated block's local axes.
 *
 * @param {{x: number, y: number}} delta    Canvas-space delta.
 * @param {number}                 rotation Rotation in degrees.
 * @return {{x: number, y: number}} Local-axis delta.
 */
export const projectDeltaToLocalAxes = ( delta, rotation = 0 ) =>
	rotateVector( delta, -rotation );

/**
 * Project a block-local delta back into canvas axes.
 *
 * @param {{x: number, y: number}} delta    Local-axis delta.
 * @param {number}                 rotation Rotation in degrees.
 * @return {{x: number, y: number}} Canvas-axis delta.
 */
export const projectLocalDeltaToCanvasAxes = ( delta, rotation = 0 ) =>
	rotateVector( delta, rotation );

/**
 * Apply a move delta to a layout rectangle.
 *
 * @param {{left: number, top: number, width: number, height: number}} rect  Starting rectangle.
 * @param {{x: number, y: number}}                                     delta Move delta.
 * @return {{left: number, top: number, width: number, height: number}} Moved rectangle.
 */
export const moveCanvasRect = ( rect, delta ) => ( {
	...rect,
	left: rect.left + delta.x,
	top: rect.top + delta.y,
} );

/**
 * Resize a rectangle from its bottom-right corner.
 *
 * The returned left/top adjustment keeps the rotated visual top-left corner
 * fixed while width and height change around CSS's default center transform
 * origin.
 *
 * @param {Object}  options                 Resize options.
 * @param {Object}  options.rect            Starting layout rectangle.
 * @param {Object}  options.delta           Canvas-space pointer delta.
 * @param {number}  options.rotation        Rotation in degrees.
 * @param {number}  options.minWidth        Minimum width in pixels.
 * @param {number}  options.minHeight       Minimum height in pixels.
 * @param {boolean} options.lockAspectRatio Whether to preserve proportions.
 * @return {{left: number, top: number, width: number, height: number}} Resized rectangle.
 */
export const resizeCanvasRect = ( {
	rect,
	delta,
	rotation = 0,
	minWidth = DEFAULT_MIN_SIZE,
	minHeight = DEFAULT_MIN_SIZE,
	lockAspectRatio = false,
} ) => {
	const localDelta = projectDeltaToLocalAxes( delta, rotation );
	let width = rect.width + localDelta.x;
	let height = rect.height + localDelta.y;

	if ( lockAspectRatio && rect.width > 0 && rect.height > 0 ) {
		const widthScale = width / rect.width;
		const heightScale = height / rect.height;
		let scale =
			Math.abs( widthScale - 1 ) >= Math.abs( heightScale - 1 )
				? widthScale
				: heightScale;
		const minimumScale = Math.max(
			minWidth / rect.width,
			minHeight / rect.height
		);

		scale = Math.max( scale, minimumScale );
		width = rect.width * scale;
		height = rect.height * scale;
	} else {
		width = Math.max( minWidth, width );
		height = Math.max( minHeight, height );
	}

	const halfSizeDelta = {
		x: ( width - rect.width ) / 2,
		y: ( height - rect.height ) / 2,
	};
	const rotatedHalfSizeDelta = rotateVector( halfSizeDelta, rotation );

	return {
		left: rect.left + rotatedHalfSizeDelta.x - halfSizeDelta.x,
		top: rect.top + rotatedHalfSizeDelta.y - halfSizeDelta.y,
		width,
		height,
	};
};

/**
 * Choose the first supported unit from a list of CSS values.
 *
 * @param {Array<string|number>} values   Candidate values.
 * @param {'%'|'px'}             fallback Fallback unit.
 * @return {'%'|'px'} Preferred unit.
 */
export const getPreferredCanvasUnit = ( values, fallback = 'px' ) => {
	for ( const value of values ) {
		const parsed = parseCanvasLength( value );
		if ( parsed ) {
			return parsed.unit;
		}
	}

	return fallback;
};

/**
 * Build the canonical attribute update for an absolute move.
 *
 * Units are preserved per axis so stored pixel layouts stay pixel layouts;
 * never-positioned axes fall back to percentages, which keep the layout
 * proportional when the container width changes. In auto-height containers
 * the percentage basis must be the height the container will resolve to
 * after this commit, not the pre-commit height — callers are responsible
 * for passing that predicted height.
 *
 * @param {Object}      options                      Commit options.
 * @param {Object}      options.attributes           Starting block attributes.
 * @param {Object}      options.rect                 Resulting layout rectangle.
 * @param {number}      options.containerWidth       Container width in pixels.
 * @param {number}      options.containerHeight      Vertical percent basis in pixels.
 * @param {number|null} options.solverHeightFraction Post-commit percentage height
 *                                                   fraction when committing against a solved auto height;
 *                                                   null for fixed bases.
 * @return {Object} Block attribute update.
 */
export const createMoveAttributes = ( {
	attributes,
	rect,
	containerWidth,
	containerHeight,
	solverHeightFraction = null,
} ) => {
	const horizontalUnit = getPreferredCanvasUnit(
		[ attributes.left, attributes.right ],
		'%'
	);
	const verticalUnit = getPreferredCanvasUnit(
		[ attributes.top, attributes.bottom ],
		'%'
	);

	return {
		useAbsolutePosition: true,
		left: pixelsToCanvasLength( rect.left, {
			unit: horizontalUnit,
			basis: containerWidth,
		} ),
		top: pixelsToVerticalCanvasLength( rect.top, {
			unit: verticalUnit,
			basis: containerHeight,
			solverHeightFraction,
		} ),
		right: 'auto',
		bottom: 'auto',
	};
};

/**
 * Build the attribute update for a bottom-right resize.
 *
 * Explicit heights preserve their stored unit but fall back to pixels: a
 * percentage height consumes the same container fraction at every width, so
 * it can never anchor the auto-height solver the way a pixel height or an
 * aspect-driven automatic height does.
 *
 * @param {Object}  options                    Commit options.
 * @param {Object}  options.attributes         Starting block attributes.
 * @param {Object}  options.rect               Resulting layout rectangle.
 * @param {number}  options.containerWidth     Container width in pixels.
 * @param {number}  options.containerHeight    Vertical percent basis in pixels.
 * @param {boolean} options.preserveAutoHeight Whether to retain automatic height.
 * @param {boolean} options.isAutoBasis        Whether containerHeight is a solved
 *                                             auto height (enables the vertical solver guard).
 * @return {Object} Block attribute update.
 */
export const createResizeAttributes = ( {
	attributes,
	rect,
	containerWidth,
	containerHeight,
	preserveAutoHeight,
	isAutoBasis = false,
} ) => {
	const widthUnit = getPreferredCanvasUnit( [ attributes.width ], '%' );
	const heightUnit = getPreferredCanvasUnit( [ attributes.height ], 'px' );
	const keepsAutoHeight =
		preserveAutoHeight &&
		( ! attributes.height || attributes.height === 'auto' );
	const updates = {
		width: pixelsToCanvasLength( rect.width, {
			unit: widthUnit,
			basis: containerWidth,
		} ),
		// Heights are never guarded: a preserved percentage height is a
		// deliberate stored unit, and the solver guard exists only to keep
		// positions solvable.
		height: keepsAutoHeight
			? 'auto'
			: pixelsToCanvasLength( rect.height, {
					unit: heightUnit,
					basis: containerHeight,
			  } ),
	};

	if ( attributes.useAbsolutePosition ) {
		const committedHeightFraction =
			! keepsAutoHeight &&
			heightUnit === '%' &&
			isFiniteNumber( containerHeight ) &&
			containerHeight > 0
				? rect.height / containerHeight
				: 0;

		Object.assign(
			updates,
			createMoveAttributes( {
				attributes,
				rect,
				containerWidth,
				containerHeight,
				solverHeightFraction: isAutoBasis
					? committedHeightFraction
					: null,
			} )
		);
	}

	return updates;
};

/**
 * Add the core block move lock while retaining any other lock settings.
 *
 * @param {Object|undefined} lock Existing core block lock.
 * @return {Object} Lock with movement disabled.
 */
export const mergeMoveLock = ( lock ) => ( {
	...( lock && typeof lock === 'object' && ! Array.isArray( lock )
		? lock
		: {} ),
	move: true,
} );

/**
 * Remove only the core block move lock.
 *
 * Returning undefined when no lock settings remain lets callers clear the
 * attribute instead of persisting an empty lock object.
 *
 * @param {Object|undefined} lock Existing core block lock.
 * @return {Object|undefined} Remaining lock settings.
 */
export const removeMoveLock = ( lock ) => {
	if ( ! lock || typeof lock !== 'object' || Array.isArray( lock ) ) {
		return undefined;
	}

	const { move: _move, ...remainingLock } = lock;
	return Object.keys( remainingLock ).length > 0 ? remainingLock : undefined;
};

/**
 * Build canonical attributes that pin a measured flow item to the canvas.
 *
 * The supplied rectangle is the item's untransformed border box measured in
 * the absolute containing block's coordinate system. Flow percentages use a
 * different basis in padded containers, so both the horizontal position and
 * width are recalculated against the absolute padding-box width.
 *
 * @param {Object}  options                 Promotion options.
 * @param {Object}  options.attributes      Starting block attributes.
 * @param {Object}  options.borderRect      Measured border-box rectangle.
 * @param {number}  options.containerWidth  Absolute padding-box width.
 * @param {number}  options.containerHeight Vertical percent basis in pixels.
 * @param {boolean} options.isAutoBasis     Whether containerHeight is a solved
 *                                          auto height (enables the vertical solver guard).
 * @return {Object|null} Per-block update, or null for invalid geometry.
 */
export const createFlowToFreeformAttributes = ( {
	attributes = {},
	borderRect,
	containerWidth,
	containerHeight,
	isAutoBasis = false,
} ) => {
	if (
		! borderRect ||
		! isFiniteNumber( borderRect.left ) ||
		! isFiniteNumber( borderRect.top ) ||
		! isFiniteNumber( borderRect.width ) ||
		borderRect.width <= 0 ||
		! isFiniteNumber( borderRect.height ) ||
		borderRect.height < 0 ||
		! isFiniteNumber( containerWidth ) ||
		containerWidth <= 0
	) {
		return null;
	}

	const style =
		attributes.style &&
		typeof attributes.style === 'object' &&
		! Array.isArray( attributes.style )
			? attributes.style
			: {};
	const spacing =
		style.spacing &&
		typeof style.spacing === 'object' &&
		! Array.isArray( style.spacing )
			? style.spacing
			: {};
	const normalizedHeight =
		typeof attributes.height === 'string'
			? attributes.height.trim().toLowerCase()
			: attributes.height;
	const hasAutoHeight =
		normalizedHeight === undefined ||
		normalizedHeight === null ||
		normalizedHeight === '' ||
		normalizedHeight === 'auto';

	return {
		useAbsolutePosition: true,
		left: pixelsToCanvasLength( borderRect.left, {
			unit: '%',
			basis: containerWidth,
		} ),
		// pixelsToCanvasLength keeps this in pixels when no valid height
		// basis is available, matching the pre-proportional behavior.
		// Promotion always persists explicit heights in pixels, so the
		// solver-guard fraction is the offset fraction alone.
		top: pixelsToVerticalCanvasLength( borderRect.top, {
			unit: '%',
			basis: containerHeight,
			solverHeightFraction: isAutoBasis ? 0 : null,
		} ),
		right: 'auto',
		bottom: 'auto',
		width: pixelsToCanvasLength( borderRect.width, {
			unit: '%',
			basis: containerWidth,
		} ),
		height: hasAutoHeight
			? 'auto'
			: pixelsToCanvasLength( borderRect.height ),
		align: undefined,
		marginTop: ZERO_FLOW_MARGINS.top,
		marginRight: ZERO_FLOW_MARGINS.right,
		marginBottom: ZERO_FLOW_MARGINS.bottom,
		marginLeft: ZERO_FLOW_MARGINS.left,
		style: {
			...style,
			spacing: {
				...spacing,
				margin: { ...ZERO_FLOW_MARGINS },
			},
		},
	};
};

/**
 * Plan the container change needed when flow children become absolute.
 *
 * A fixed container without an explicit height previously received its height
 * from normal flow. Switch it to auto height so pinning its children cannot
 * collapse it to the frontend minimum.
 *
 * @param {Object} attributes Container attributes.
 * @return {Object|null} Container update, or null when no change is needed.
 */
export const createFreeformContainerAttributes = ( attributes = {} ) => {
	const heightMode = attributes.heightMode || 'fixed';
	const hasExplicitHeight =
		typeof attributes.containerHeight === 'string'
			? attributes.containerHeight.trim() !== ''
			: Boolean( attributes.containerHeight );

	if ( heightMode !== 'fixed' || hasExplicitHeight ) {
		return null;
	}

	return {
		heightMode: 'auto',
		containerHeight: '',
	};
};

/**
 * Check whether two rectangles differ enough to persist.
 *
 * @param {Object} first     First rectangle.
 * @param {Object} second    Second rectangle.
 * @param {number} tolerance Pixel tolerance.
 * @return {boolean} Whether the rectangles differ.
 */
export const hasCanvasRectChanged = ( first, second, tolerance = 0.01 ) =>
	[ 'left', 'top', 'width', 'height' ].some(
		( property ) =>
			Math.abs( first[ property ] - second[ property ] ) > tolerance
	);
