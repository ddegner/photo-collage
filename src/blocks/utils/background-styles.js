/**
 * Shared utility for generating background styles from block attributes.
 */

const PRESET_PREFIXES = {
	color: 'var:preset|color|',
	gradient: 'var:preset|gradient|',
};

/**
 * Convert WordPress preset token values into valid CSS vars.
 *
 * @param {string} value      Raw style value.
 * @param {string} presetType Preset type: color|gradient.
 * @return {string} CSS-ready value.
 */
const normalizePresetValue = ( value, presetType ) => {
	const prefix = PRESET_PREFIXES[ presetType ];
	if (
		typeof value !== 'string' ||
		! prefix ||
		! value.startsWith( prefix )
	) {
		return value;
	}

	const slug = value.slice( prefix.length ).split( '|' ).join( '--' );
	return `var(--wp--preset--${ presetType }--${ slug })`;
};

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
	const nativeBackground = attributes?.style?.color?.background;
	const nativeGradient = attributes?.style?.color?.gradient;

	if ( typeof nativeBackground === 'string' && nativeBackground !== '' ) {
		style.backgroundColor = normalizePresetValue(
			nativeBackground,
			'color'
		);
	}

	if ( typeof nativeGradient === 'string' && nativeGradient !== '' ) {
		style.backgroundImage = normalizePresetValue(
			nativeGradient,
			'gradient'
		);
	}

	switch ( backgroundType ) {
		case 'color':
			if ( ! nativeBackground && backgroundColor ) {
				style.backgroundColor = normalizePresetValue(
					backgroundColor,
					'color'
				);
			}
			break;

		case 'gradient':
			if ( ! nativeGradient && gradient ) {
				style.backgroundImage = normalizePresetValue(
					gradient,
					'gradient'
				);
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
