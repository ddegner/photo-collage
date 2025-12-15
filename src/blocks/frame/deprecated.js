/**
 * Block Deprecations for Photo Collage Frame Block
 *
 * Handles migration from legacy padding attributes to WordPress native spacing.
 *
 * @package PhotoCollage
 */

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * Deprecation for v0.1.x that used custom padding attributes.
 * Migrates paddingTop/Right/Bottom/Left to style.spacing.padding.
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
	},

	/**
	 * Check if block needs migration.
	 *
	 * @param {Object} attributes Block attributes.
	 * @return {boolean} Whether migration is needed.
	 */
	isEligible( attributes ) {
		// Check if block has legacy padding attributes with non-default values
		return (
			( attributes.paddingTop && attributes.paddingTop !== '0%' ) ||
			( attributes.paddingRight && attributes.paddingRight !== '0%' ) ||
			( attributes.paddingBottom && attributes.paddingBottom !== '0%' ) ||
			( attributes.paddingLeft && attributes.paddingLeft !== '0%' )
		);
	},

	/**
	 * Migrate legacy padding attributes to native spacing.
	 *
	 * @param {Object} attributes Old attributes.
	 * @return {Object} New attributes with native spacing.
	 */
	migrate( attributes ) {
		const {
			paddingTop,
			paddingRight,
			paddingBottom,
			paddingLeft,
			...restAttributes
		} = attributes;

		// Build native spacing object
		const padding = {};
		if ( paddingTop && paddingTop !== '0%' ) {
			padding.top = paddingTop;
		}
		if ( paddingRight && paddingRight !== '0%' ) {
			padding.right = paddingRight;
		}
		if ( paddingBottom && paddingBottom !== '0%' ) {
			padding.bottom = paddingBottom;
		}
		if ( paddingLeft && paddingLeft !== '0%' ) {
			padding.left = paddingLeft;
		}

		// Only add style if there's padding to migrate
		if ( Object.keys( padding ).length > 0 ) {
			return {
				...restAttributes,
				style: {
					...( restAttributes.style || {} ),
					spacing: {
						...( restAttributes.style?.spacing || {} ),
						padding,
					},
				},
			};
		}

		return restAttributes;
	},

	/**
	 * Legacy save function for the frame block.
	 *
	 * @param {Object} props Block props.
	 * @return {JSX.Element} Block save output.
	 */
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

export default [ v1 ];
