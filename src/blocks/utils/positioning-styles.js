/**
 * Shared utility for generating positioning styles from block attributes.
 *
 * @package PhotoCollage
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

	return {
		position: 'relative',
		marginTop: ! align || marginTop !== '0%' ? marginTop : undefined,
		marginRight: ! align || marginRight !== '0%' ? marginRight : undefined,
		marginBottom:
			! align || marginBottom !== '0%' ? marginBottom : undefined,
		marginLeft: ! align || marginLeft !== '0%' ? marginLeft : undefined,
	};
};

/**
 * Get dimension and effect styles.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object for dimensions and effects.
 */
export const getDimensionStyles = ( attributes ) => {
	const { width, height, zIndex, rotation = 0, opacity = 1, align } =
		attributes;

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
