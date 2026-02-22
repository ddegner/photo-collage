/**
 * Block deprecations for the Photo Collage Image block.
 *
 * Migrate legacy custom spacing/background attributes toward native block supports.
 */

const hasStringValue = ( value ) =>
	typeof value === 'string' && value.trim() !== '';

const isNonDefaultLegacyValue = ( value ) =>
	hasStringValue( value ) && value.trim() !== '0%';

const migrateLegacySpacingAndBackground = (
	attributes,
	{ includeLegacyPadding = false } = {}
) => {
	const {
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		backgroundColor,
		gradient,
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
		...restAttributes
	} = attributes;

	const style = {
		...( restAttributes.style || {} ),
	};

	const spacing = {
		...( style.spacing || {} ),
	};

	if ( ! spacing.margin ) {
		const margin = {};
		if ( hasStringValue( marginTop ) ) {
			margin.top = marginTop;
		}
		if ( hasStringValue( marginRight ) ) {
			margin.right = marginRight;
		}
		if ( hasStringValue( marginBottom ) ) {
			margin.bottom = marginBottom;
		}
		if ( hasStringValue( marginLeft ) ) {
			margin.left = marginLeft;
		}
		if ( Object.keys( margin ).length > 0 ) {
			spacing.margin = margin;
		}
	}

	if ( includeLegacyPadding && ! spacing.padding ) {
		const padding = {};
		if ( isNonDefaultLegacyValue( paddingTop ) ) {
			padding.top = paddingTop;
		}
		if ( isNonDefaultLegacyValue( paddingRight ) ) {
			padding.right = paddingRight;
		}
		if ( isNonDefaultLegacyValue( paddingBottom ) ) {
			padding.bottom = paddingBottom;
		}
		if ( isNonDefaultLegacyValue( paddingLeft ) ) {
			padding.left = paddingLeft;
		}
		if ( Object.keys( padding ).length > 0 ) {
			spacing.padding = padding;
		}
	}

	if ( Object.keys( spacing ).length > 0 ) {
		style.spacing = spacing;
	}

	let backgroundMigrated = false;
	const color = {
		...( style.color || {} ),
	};

	if (
		! hasStringValue( color.background ) &&
		attributes.backgroundType === 'color' &&
		hasStringValue( backgroundColor )
	) {
		color.background = backgroundColor;
		backgroundMigrated = true;
	}

	if (
		! hasStringValue( color.gradient ) &&
		attributes.backgroundType === 'gradient' &&
		hasStringValue( gradient )
	) {
		color.gradient = gradient;
		backgroundMigrated = true;
	}

	if ( Object.keys( color ).length > 0 ) {
		style.color = color;
	}

	const migratedAttributes = {
		...restAttributes,
		style,
	};

	if (
		backgroundMigrated &&
		( migratedAttributes.backgroundType === 'color' ||
			migratedAttributes.backgroundType === 'gradient' )
	) {
		migratedAttributes.backgroundType = 'none';
	}

	return migratedAttributes;
};

const hasLegacyMarginOrBackground = ( attributes ) =>
	isNonDefaultLegacyValue( attributes.marginTop ) ||
	isNonDefaultLegacyValue( attributes.marginRight ) ||
	isNonDefaultLegacyValue( attributes.marginBottom ) ||
	isNonDefaultLegacyValue( attributes.marginLeft ) ||
	( attributes.backgroundType === 'color' &&
		hasStringValue( attributes.backgroundColor ) ) ||
	( attributes.backgroundType === 'gradient' &&
		hasStringValue( attributes.gradient ) );

/**
 * Deprecation for custom margin/background attributes before native migration.
 */
const v2 = {
	attributes: {
		url: { type: 'string' },
		alt: { type: 'string', default: '' },
		isDecorative: { type: 'boolean', default: false },
		id: { type: 'number' },
		aspectRatio: { type: 'string', default: '' },
		sizeSlug: { type: 'string', default: 'large' },
		anchor: { type: 'string', default: '' },
		marginTop: { type: 'string', default: '0%' },
		marginRight: { type: 'string', default: '0%' },
		marginBottom: { type: 'string', default: '0%' },
		marginLeft: { type: 'string', default: '0%' },
		zIndex: { type: 'number', default: 1 },
		width: { type: 'string', default: '50%' },
		height: { type: 'string', default: 'auto' },
		useAbsolutePosition: { type: 'boolean', default: false },
		top: { type: 'string', default: 'auto' },
		right: { type: 'string', default: 'auto' },
		bottom: { type: 'string', default: 'auto' },
		left: { type: 'string', default: 'auto' },
		objectFit: { type: 'string', default: 'contain' },
		rotation: { type: 'number', default: 0 },
		opacity: { type: 'number', default: 1 },
		showCaption: { type: 'boolean', default: true },
		caption: { type: 'string', default: '' },
		captionAlign: { type: 'string', default: 'left' },
		captionWidth: { type: 'string', default: '100%' },
		captionPlacement: { type: 'string', default: 'bottom-left' },
		divClass: { type: 'string', default: '' },
		divStyle: { type: 'string', default: '' },
		imgClass: { type: 'string', default: '' },
		imgStyle: { type: 'string', default: '' },
		captionClass: { type: 'string', default: '' },
		captionStyle: { type: 'string', default: '' },
		title: { type: 'string', default: '' },
		description: { type: 'string', default: '' },
		href: { type: 'string' },
		linkTarget: { type: 'string' },
		rel: { type: 'string' },
		linkClass: { type: 'string' },
		linkDestination: { type: 'string', default: 'none' },
		backgroundType: { type: 'string', default: 'none' },
		backgroundColor: { type: 'string' },
		gradient: { type: 'string' },
		backgroundImageId: { type: 'number' },
		backgroundImageUrl: { type: 'string' },
		backgroundSize: { type: 'string', default: 'cover' },
		backgroundPosition: { type: 'string', default: 'center center' },
		backgroundRepeat: { type: 'boolean', default: false },
		style: { type: 'object' },
	},

	isEligible( attributes ) {
		return hasLegacyMarginOrBackground( attributes );
	},

	migrate( attributes ) {
		return migrateLegacySpacingAndBackground( attributes );
	},

	save() {
		return null;
	},
};

/**
 * Deprecation for legacy custom padding attributes.
 */
const v1 = {
	attributes: {
		url: { type: 'string' },
		alt: { type: 'string', default: '' },
		isDecorative: { type: 'boolean', default: false },
		id: { type: 'number' },
		marginTop: { type: 'string', default: '0%' },
		marginRight: { type: 'string', default: '0%' },
		marginBottom: { type: 'string', default: '0%' },
		marginLeft: { type: 'string', default: '0%' },
		zIndex: { type: 'number', default: 1 },
		width: { type: 'string', default: '50%' },
		height: { type: 'string', default: 'auto' },
		paddingTop: { type: 'string', default: '0%' },
		paddingRight: { type: 'string', default: '0%' },
		paddingBottom: { type: 'string', default: '0%' },
		paddingLeft: { type: 'string', default: '0%' },
		useAbsolutePosition: { type: 'boolean', default: false },
		top: { type: 'string', default: 'auto' },
		right: { type: 'string', default: 'auto' },
		bottom: { type: 'string', default: 'auto' },
		left: { type: 'string', default: 'auto' },
		objectFit: { type: 'string', default: 'contain' },
		rotation: { type: 'number', default: 0 },
		opacity: { type: 'number', default: 1 },
		showCaption: { type: 'boolean', default: true },
		caption: { type: 'string', default: '' },
		captionAlign: { type: 'string', default: 'left' },
		captionWidth: { type: 'string', default: '100%' },
		captionPlacement: { type: 'string', default: 'bottom-left' },
		imgClass: { type: 'string', default: '' },
		imgStyle: { type: 'string', default: '' },
		captionClass: { type: 'string', default: '' },
		captionStyle: { type: 'string', default: '' },
		title: { type: 'string', default: '' },
		description: { type: 'string', default: '' },
		href: { type: 'string' },
		linkTarget: { type: 'string' },
		rel: { type: 'string' },
		linkClass: { type: 'string' },
		linkDestination: { type: 'string', default: 'none' },
		backgroundType: { type: 'string', default: 'none' },
		backgroundColor: { type: 'string' },
		gradient: { type: 'string' },
		backgroundImageId: { type: 'number' },
		backgroundImageUrl: { type: 'string' },
		backgroundSize: { type: 'string', default: 'cover' },
		backgroundPosition: { type: 'string', default: 'center center' },
		backgroundRepeat: { type: 'boolean', default: false },
		style: { type: 'object' },
	},

	isEligible( attributes ) {
		return (
			hasLegacyMarginOrBackground( attributes ) ||
			isNonDefaultLegacyValue( attributes.paddingTop ) ||
			isNonDefaultLegacyValue( attributes.paddingRight ) ||
			isNonDefaultLegacyValue( attributes.paddingBottom ) ||
			isNonDefaultLegacyValue( attributes.paddingLeft )
		);
	},

	migrate( attributes ) {
		return migrateLegacySpacingAndBackground( attributes, {
			includeLegacyPadding: true,
		} );
	},

	save() {
		return null;
	},
};

export default [ v2, v1 ];
