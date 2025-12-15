/**
 * Shared utility for generating background styles from block attributes.
 *
 * @package PhotoCollage
 */

/**
 * Get background styles from attributes.
 *
 * @param {Object} attributes Block attributes containing background settings.
 * @return {Object} Style object for CSS.
 */
export const getBackgroundStyle = ( attributes ) => {
	const {
		backgroundType,
		backgroundColor,
		gradient,
		backgroundImageUrl,
		backgroundSize,
		backgroundPosition,
		backgroundRepeat,
	} = attributes;

	const style = {};

	switch ( backgroundType ) {
		case 'color':
			if ( backgroundColor ) {
				style.backgroundColor = backgroundColor;
			}
			break;

		case 'gradient':
			if ( gradient ) {
				style.backgroundImage = gradient;
			}
			break;

		case 'tiling-image':
		case 'full-image':
			if ( backgroundImageUrl ) {
				style.backgroundImage = `url(${ backgroundImageUrl })`;
				style.backgroundSize =
					backgroundType === 'full-image'
						? backgroundSize || 'cover'
						: 'auto';
				style.backgroundPosition =
					backgroundPosition || 'center center';
				style.backgroundRepeat =
					backgroundType === 'tiling-image' || backgroundRepeat
						? 'repeat'
						: 'no-repeat';
			}
			break;

		default:
			break;
	}

	return style;
};
