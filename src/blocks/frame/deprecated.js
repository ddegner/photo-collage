/**
 * Block deprecations for the Photo Collage Frame block.
 *
 * Migrate legacy custom spacing/background attributes toward native block supports.
 */

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

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
		rotation: { type: 'number', default: 0 },
		opacity: { type: 'number', default: 1 },
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
		return <InnerBlocks.Content />;
	},
};

/**
 * Deprecation for legacy custom padding attributes.
 */
const v1 = {
	attributes: {
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
		rotation: { type: 'number', default: 0 },
		opacity: { type: 'number', default: 1 },
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

	save( { attributes } ) {
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
			paddingTop,
			paddingRight,
			paddingBottom,
			paddingLeft,
			zIndex,
			width,
			height,
			rotation,
			opacity,
			align,
		} = attributes;

		const blockProps = useBlockProps.save( {
			style: {
				...( useAbsolutePosition
					? {
							position: 'absolute',
							top: top && top !== 'auto' ? top : undefined,
							right:
								right && right !== 'auto' ? right : undefined,
							bottom:
								bottom && bottom !== 'auto'
									? bottom
									: undefined,
							left: left && left !== 'auto' ? left : undefined,
					  }
					: {
							position: 'relative',
							marginTop:
								! align || marginTop !== '0%'
									? marginTop
									: undefined,
							marginRight:
								! align || marginRight !== '0%'
									? marginRight
									: undefined,
							marginBottom:
								! align || marginBottom !== '0%'
									? marginBottom
									: undefined,
							marginLeft:
								! align || marginLeft !== '0%'
									? marginLeft
									: undefined,
					  } ),
				paddingTop,
				paddingRight,
				paddingBottom,
				paddingLeft,
				width: ! align || width !== '50%' ? width : undefined,
				height,
				zIndex,
				transform: `rotate(${ rotation }deg)`,
				opacity,
			},
		} );

		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	},
};

export default [ v2, v1 ];
