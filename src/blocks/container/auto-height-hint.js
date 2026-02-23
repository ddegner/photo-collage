const AUTO_HEIGHT_HINT_PATTERN = /^\d+(?:\.\d+)?(?:px|%)$/i;

export const normalizeAutoHeightHint = ( value ) => {
	if ( typeof value !== 'string' ) {
		return '';
	}

	const normalizedValue = value.trim().toLowerCase();
	return AUTO_HEIGHT_HINT_PATTERN.test( normalizedValue )
		? normalizedValue
		: '';
};

export const isValidAutoHeightHint = ( value ) =>
	'' !== normalizeAutoHeightHint( value );

export const toPixelAutoHeightHint = ( height ) => {
	if ( ! Number.isFinite( height ) || height <= 0 ) {
		return '';
	}

	return `${ Math.ceil( height ) }px`;
};
