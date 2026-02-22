/**
 * Shared utility for generating positioning styles from block attributes.
 */

/**
 * Get positioning styles based on absolute or relative positioning mode.
 *
 * @param {Object} attributes Block attributes containing positioning settings.
 * @return {Object} Style object for CSS positioning.
 */
export const getPositioningStyles = ( attributes ) => {
	const {
		useAbsolutePosition,
		top,
		right,
		bottom,
		left,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		align,
	} = attributes;

	if ( useAbsolutePosition ) {
		return {
			position: 'absolute',
			top: top && top !== 'auto' ? top : undefined,
			right: right && right !== 'auto' ? right : undefined,
			bottom: bottom && bottom !== 'auto' ? bottom : undefined,
			left: left && left !== 'auto' ? left : undefined,
		};
	}

	const hasCustomMargins =
		( marginTop && marginTop !== '0%' ) ||
		( marginRight && marginRight !== '0%' ) ||
		( marginBottom && marginBottom !== '0%' ) ||
		( marginLeft && marginLeft !== '0%' );

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
