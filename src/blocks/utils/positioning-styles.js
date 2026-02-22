/**
 * Shared utility for generating positioning styles from block attributes.
 */

const SPACING_PRESET_PREFIX = 'var:preset|spacing|';
const LEGACY_MARGIN_KEYS = {
	top: 'marginTop',
	right: 'marginRight',
	bottom: 'marginBottom',
	left: 'marginLeft',
};

/**
 * Convert WordPress preset token values into valid CSS vars.
 *
 * @param {string} value Raw margin value.
 * @return {string} CSS-ready value.
 */
const normalizeSpacingValue = ( value ) => {
	if (
		typeof value !== 'string' ||
		! value.startsWith( SPACING_PRESET_PREFIX )
	) {
		return value;
	}

	const slug = value
		.slice( SPACING_PRESET_PREFIX.length )
		.split( '|' )
		.join( '--' );
	return `var(--wp--preset--spacing--${ slug })`;
};

/**
 * Resolve native margin value for one side.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} side       Margin side: top|right|bottom|left.
 * @return {string|undefined} Native margin value if present.
 */
const getNativeMarginValue = ( attributes, side ) => {
	const nativeMargin = attributes?.style?.spacing?.margin;

	if ( typeof nativeMargin === 'string' && nativeMargin !== '' ) {
		return normalizeSpacingValue( nativeMargin );
	}

	if (
		nativeMargin &&
		typeof nativeMargin === 'object' &&
		typeof nativeMargin[ side ] === 'string' &&
		nativeMargin[ side ] !== ''
	) {
		return normalizeSpacingValue( nativeMargin[ side ] );
	}

	return undefined;
};

/**
 * Resolve legacy custom margin value for one side.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} side       Margin side: top|right|bottom|left.
 * @return {string|undefined} Legacy margin value if present.
 */
const getLegacyMarginValue = ( attributes, side ) => {
	const key = LEGACY_MARGIN_KEYS[ side ];
	const value = attributes?.[ key ];
	return typeof value === 'string' && value !== '' ? value : undefined;
};

/**
 * Resolve margin by preferring native spacing values with legacy fallback.
 *
 * @param {Object} attributes Block attributes.
 * @param {string} side       Margin side.
 * @return {string|undefined} Resolved margin value.
 */
const getResolvedMarginValue = ( attributes, side ) => {
	return (
		getNativeMarginValue( attributes, side ) ??
		getLegacyMarginValue( attributes, side )
	);
};

/**
 * Determine if a margin value is effectively CSS zero.
 *
 * @param {string|undefined} value Margin value.
 * @return {boolean} True when value is zero-like.
 */
const isZeroMarginValue = ( value ) => {
	if ( typeof value !== 'string' ) {
		return false;
	}

	return /^0(?:\.0+)?(?:[a-z%]+)?$/i.test( value.trim() );
};

/**
 * Get positioning styles based on absolute or relative positioning mode.
 *
 * @param {Object} attributes Block attributes containing positioning settings.
 * @return {Object} Style object for CSS positioning.
 */
export const getPositioningStyles = ( attributes ) => {
	const { useAbsolutePosition, top, right, bottom, left, align } = attributes;

	if ( useAbsolutePosition ) {
		return {
			position: 'absolute',
			top: top && top !== 'auto' ? top : undefined,
			right: right && right !== 'auto' ? right : undefined,
			bottom: bottom && bottom !== 'auto' ? bottom : undefined,
			left: left && left !== 'auto' ? left : undefined,
		};
	}

	const marginTop = getResolvedMarginValue( attributes, 'top' );
	const marginRight = getResolvedMarginValue( attributes, 'right' );
	const marginBottom = getResolvedMarginValue( attributes, 'bottom' );
	const marginLeft = getResolvedMarginValue( attributes, 'left' );

	const hasCustomMargins =
		( marginTop && ! isZeroMarginValue( marginTop ) ) ||
		( marginRight && ! isZeroMarginValue( marginRight ) ) ||
		( marginBottom && ! isZeroMarginValue( marginBottom ) ) ||
		( marginLeft && ! isZeroMarginValue( marginLeft ) );

	if ( align && ! hasCustomMargins ) {
		return {
			position: 'relative',
		};
	}

	const resolvedMarginTop =
		marginTop !== undefined && marginTop !== '' ? marginTop : '0%';
	const resolvedMarginRight =
		marginRight !== undefined && marginRight !== '' ? marginRight : '0%';
	const resolvedMarginBottom =
		marginBottom !== undefined && marginBottom !== '' ? marginBottom : '0%';
	const resolvedMarginLeft =
		marginLeft !== undefined && marginLeft !== '' ? marginLeft : '0%';

	return {
		position: 'relative',
		// Keep explicit 0% margins in editor so Gutenberg flow gap does not
		// introduce phantom top offsets between collage items.
		marginTop: resolvedMarginTop,
		marginRight: resolvedMarginRight,
		marginBottom: resolvedMarginBottom,
		marginLeft: resolvedMarginLeft,
	};
};

/**
 * Get dimension and effect styles.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object for dimensions and effects.
 */
export const getDimensionStyles = ( attributes ) => {
	const {
		width,
		height,
		zIndex,
		rotation = 0,
		opacity = 1,
		align,
	} = attributes;

	const styles = {
		width: ! align || width !== '50%' ? width : undefined,
		height,
		zIndex,
		opacity,
	};

	// Add rotation transform
	if ( rotation !== 0 ) {
		styles.transform = `rotate(${ rotation }deg)`;
	}

	return styles;
};

/**
 * Get combined block styles (positioning + dimensions + background).
 *
 * @param {Object}   attributes         Block attributes.
 * @param {Function} getBackgroundStyle Optional background style function.
 * @return {Object} Combined style object.
 */
export const getBlockStyles = ( attributes, getBackgroundStyle = null ) => {
	const styles = {
		...getPositioningStyles( attributes ),
		...getDimensionStyles( attributes ),
	};

	if ( getBackgroundStyle ) {
		Object.assign( styles, getBackgroundStyle( attributes ) );
	}

	return styles;
};
