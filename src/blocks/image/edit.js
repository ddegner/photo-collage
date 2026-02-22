import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	RichText,
	LinkControl as LinkControlBase,
	AlignmentToolbar,
	getTypographyClassesAndStyles,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';

import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	// WordPress core currently exposes UnitControl only via this export.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
	Button,
	SelectControl,
	Popover,
	ToolbarGroup,
	ToolbarDropdownMenu,
	TextareaControl,
	ExternalLink,
} from '@wordpress/components';
import { link as linkIcon } from '@wordpress/icons';
import './editor.scss';
import CaptionPositionControl from './components/caption-position-control';
import BackgroundControls from '../components/BackgroundControls';
import AbsolutePositionControls from '../components/AbsolutePositionControls';
import { getBackgroundStyle } from '../utils/background-styles';
import { getBlockStyles } from '../utils/positioning-styles';

const LinkControl = LinkControlBase;

/**
 * Get flex-direction based on caption placement.
 * Side placements (left-*, right-*) use row layout.
 * Top/bottom placements use column layout.
 *
 * @param {string} placement Caption placement value.
 * @return {string} CSS flex-direction value.
 */
export const getFlexDirection = ( placement ) => {
	if ( placement.startsWith( 'left-' ) || placement.startsWith( 'right-' ) ) {
		return 'row';
	}
	return 'column';
};

/**
 * Get align-items based on caption placement suffix.
 * Maps placement alignment to CSS align-items value.
 *
 * @param {string} placement Caption placement value.
 * @return {string} CSS align-items value.
 */
export const getAlignItems = ( placement ) => {
	// Extract the suffix after the hyphen
	const suffix = placement.split( '-' )[ 1 ];

	// Map suffix to align-items value
	switch ( suffix ) {
		case 'left':
		case 'top':
			return 'flex-start';
		case 'center':
			return 'center';
		case 'right':
		case 'bottom':
			return 'flex-end';
		default:
			return 'flex-start';
	}
};

/**
 * Safely extract string value from a potentially corrupted attribute.
 * WordPress media objects return {raw, rendered} structure, but attributes
 * should be strings. This handles both cases.
 *
 * @param {string|Object} value The attribute value.
 * @return {string} The string value.
 */
const safeStringValue = ( value ) => {
	if ( typeof value === 'string' ) {
		return value;
	}
	if ( typeof value === 'object' && value !== null ) {
		return value.rendered || value.raw || '';
	}
	return '';
};

/**
 * Parse a CSS declaration string into a React style object.
 *
 * @param {string} inlineStyle CSS declarations (e.g. "color:red; font-size:14px").
 * @return {Object} React style object.
 */
const parseInlineStyle = ( inlineStyle ) => {
	if ( ! inlineStyle || typeof inlineStyle !== 'string' ) {
		return {};
	}

	return inlineStyle.split( ';' ).reduce( ( style, declaration ) => {
		const separatorIndex = declaration.indexOf( ':' );
		if ( separatorIndex === -1 ) {
			return style;
		}

		const rawProperty = declaration.slice( 0, separatorIndex );
		const rawValue = declaration.slice( separatorIndex + 1 );
		if ( ! rawProperty || ! rawValue ) {
			return style;
		}

		const property = rawProperty
			.trim()
			.replace( /-([a-z])/g, ( _, char ) => char.toUpperCase() );
		const value = rawValue.trim();
		if ( ! property || ! value ) {
			return style;
		}

		style[ property ] = value;
		return style;
	}, {} );
};

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const {
		url,
		alt,
		id,
		aspectRatio = '',
		sizeSlug = 'large',
		anchor = '',
		isDecorative,
		useAbsolutePosition,
		top,
		right,
		bottom,
		left,
		zIndex,
		width,
		height,
		rotation = 0,
		opacity = 1,
		caption: rawCaption = '',
		title: rawTitle = '',

		href,
		linkTarget,
		linkDestination = 'none',
		showCaption = true,
		captionAlign = 'left',
		captionWidth = '100%',
		captionPlacement = 'bottom-left',
		lightbox = { enabled: false },
		divClass = '',
		divStyle = '',
		imgClass = '',
		imgStyle = '',
		captionClass = '',
		captionStyle = '',
	} = attributes;

	const instanceId = useInstanceId( Edit );

	// Safely extract string values from potentially corrupted attributes
	const caption = safeStringValue( rawCaption );
	const title = safeStringValue( rawTitle );

	const [ isLinkPopoverOpen, setIsLinkPopoverOpen ] = useState( false );

	const onSetLink = ( { url: newUrl, opensInNewTab } ) => {
		setAttributes( {
			href: newUrl,
			linkTarget: opensInNewTab ? '_blank' : undefined,
			rel: opensInNewTab ? 'noreferrer noopener' : undefined,
			lightbox: { enabled: false },
		} );
		setIsLinkPopoverOpen( false );
		setAttributes( { linkDestination: 'custom' } );
	};

	const onRemoveLink = () => {
		setAttributes( {
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			linkDestination: 'none',
			lightbox: { enabled: false },
		} );
	};

	const onLinkToMedia = () => {
		if ( ! media || ! media.source_url ) {
			return;
		}
		setAttributes( {
			href: media.source_url,
			linkDestination: 'media',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: false },
		} );
	};

	const onLinkToAttachment = () => {
		if ( ! media || ! media.link ) {
			return;
		}
		setAttributes( {
			href: media.link,
			linkDestination: 'attachment',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: false },
		} );
	};

	const onEnlargeOnClick = () => {
		setAttributes( {
			href: undefined,
			linkDestination: 'none',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: true },
		} );
	};

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}

		setAttributes( {
			url: media.url,
			alt: media.alt || '',
			id: media.id,
			title: media.title?.rendered || media.title || '',
			caption: media.caption?.rendered || media.caption || '',
			linkDestination: 'none',
			href: undefined,
			lightbox: { enabled: false },
		} );
	};

	// Fetch media object for link functionality and legacy recovery
	const media = useSelect(
		( select ) =>
			id
				? select( 'core' ).getEntityRecord(
						'postType',
						'attachment',
						id
				  )
				: null,
		[ id ]
	);

	useEffect( () => {
		// Only auto-recover if URL is missing
		if ( ! url && media && media.source_url ) {
			setAttributes( {
				url: media.source_url,
				alt: media.alt_text || alt,
				title: media.title?.rendered || media.title || title,
				caption: media.caption?.rendered || media.caption || caption,
			} );
		}
	}, [ media, url, alt, title, caption, setAttributes ] );

	const onCaptionPlacementChange = ( newPlacement ) => {
		const newAttributes = { captionPlacement: newPlacement };

		const isSide = ( p ) =>
			p.startsWith( 'left-' ) || p.startsWith( 'right-' );
		const isNewSide = isSide( newPlacement );
		const isOldSide = isSide( captionPlacement );

		// Switching to side layout with default 100% width -> reset to 30%
		if ( isNewSide && ! isOldSide && captionWidth === '100%' ) {
			newAttributes.captionWidth = '30%';
		}

		// Switching from side layout to top/bottom with 30% width -> reset to 100%
		if ( ! isNewSide && isOldSide && captionWidth === '30%' ) {
			newAttributes.captionWidth = '100%';
		}

		setAttributes( newAttributes );
	};

	const onChangeAlt = ( newAlt ) => {
		setAttributes( { alt: newAlt } );
	};

	const onToggleDecorative = () => {
		setAttributes( {
			isDecorative: ! isDecorative,
			alt: ! isDecorative ? '' : alt,
		} );
	};

	const typographyClassesAndStyles =
		getTypographyClassesAndStyles( attributes ) || {};
	const typographyStyle = attributes.style?.typography || {};
	const captionClassName = [
		'photo-collage-image-caption',
		'wp-element-caption',
		attributes.fontSize ? `has-${ attributes.fontSize }-font-size` : '',
		attributes.fontFamily
			? `has-${ attributes.fontFamily }-font-family`
			: '',
		typographyClassesAndStyles.className || '',
		captionClass || '',
	]
		.filter( Boolean )
		.join( ' ' );
	const captionInlineStyle = {
		textAlign: captionAlign,
		width: captionWidth,
		flex: `0 0 ${ captionWidth }`,
		fontSize: typographyStyle.fontSize,
		fontWeight: typographyStyle.fontWeight,
		fontStyle: typographyStyle.fontStyle,
		lineHeight: typographyStyle.lineHeight,
		fontFamily: typographyStyle.fontFamily,
		textDecoration: typographyStyle.textDecoration,
		textTransform: typographyStyle.textTransform,
		letterSpacing: typographyStyle.letterSpacing,
		...( typographyClassesAndStyles.style || {} ),
		...parseInlineStyle( captionStyle ),
	};

	const isSideCaption =
		showCaption &&
		( captionPlacement.startsWith( 'left-' ) ||
			captionPlacement.startsWith( 'right-' ) );
	const isVerticalCaption =
		showCaption &&
		( captionPlacement.startsWith( 'top-' ) ||
			captionPlacement.startsWith( 'bottom-' ) );
	const normalizedHeight = height && height !== '' ? height : 'auto';
	let imageSizeStyle = { width: '100%', height: '100%' };

	if ( isSideCaption ) {
		imageSizeStyle =
			normalizedHeight === 'auto'
				? { width: '100%', height: 'auto' }
				: { width: 'auto', height: '100%' };
	} else if ( isVerticalCaption ) {
		imageSizeStyle = { width: '100%', height: 'auto' };
	}

	const blockProps = useBlockProps( {
		id: anchor,
		style: getBlockStyles( attributes, getBackgroundStyle ),
	} );

	if ( ! url ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="format-image"
					onSelect={ onSelectImage }
					accept="image/*"
					allowedTypes={ [ 'image' ] }
					multiple={ false }
					labels={ { title: __( 'Collage Image', 'photo-collage' ) } }
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon={ linkIcon }
						label={ __( 'Link', 'photo-collage' ) }
						controls={ [
							{
								title: __(
									'Link to image file',
									'photo-collage'
								),
								icon:
									linkDestination === 'media'
										? 'yes'
										: undefined,
								onClick: onLinkToMedia,
								isDisabled: ! media || ! media.source_url,
							},
							{
								title: __(
									'Link to attachment page',
									'photo-collage'
								),
								icon:
									linkDestination === 'attachment'
										? 'yes'
										: undefined,
								onClick: onLinkToAttachment,
								isDisabled: ! media || ! media.link,
							},
							{
								title: __(
									'Enlarge on click',
									'photo-collage'
								),
								icon:
									linkDestination === 'none' &&
									lightbox?.enabled
										? 'yes'
										: undefined,
								onClick: onEnlargeOnClick,
							},
							{
								title: __( 'Custom URL', 'photo-collage' ),
								icon:
									linkDestination === 'custom'
										? 'yes'
										: undefined,
								onClick: () => setIsLinkPopoverOpen( true ),
							},
						] }
					/>
				</ToolbarGroup>
			</BlockControls>
			{ isLinkPopoverOpen && (
				<Popover
					placement="bottom"
					onClose={ () => setIsLinkPopoverOpen( false ) }
				>
					<LinkControl
						className="wp-block-navigation-link__inline-link-input"
						value={ {
							url: href,
							opensInNewTab: linkTarget === '_blank',
						} }
						onChange={ onSetLink }
						onRemove={ onRemoveLink }
						forceIsEditingLink={ isLinkPopoverOpen }
					/>
				</Popover>
			) }
			<BlockControls>
				<ToolbarGroup>
					<MediaReplaceFlow
						mediaId={ id }
						mediaURL={ url }
						allowedTypes={ [ 'image' ] }
						accept="image/*"
						onSelect={ onSelectImage }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Settings', 'photo-collage' ) }
					initialOpen={ true }
				>
					{ ! isDecorative && (
						<>
							<TextareaControl
								label={ __(
									'Alternative Text',
									'photo-collage'
								) }
								value={ alt }
								onChange={ onChangeAlt }
								help={
									<>
										<ExternalLink href="https://www.w3.org/WAI/tutorials/images/decision-tree">
											{ __(
												'Describe the purpose of the image',
												'photo-collage'
											) }
										</ExternalLink>
										{ __(
											'Leave empty if decorative.',
											'photo-collage'
										) }
									</>
								}
								__nextHasNoMarginBottom={ true }
							/>
						</>
					) }
					<SelectControl
						label={ __( 'Aspect Ratio', 'photo-collage' ) }
						value={ aspectRatio }
						options={ [
							{
								label: __( 'Original', 'photo-collage' ),
								value: 'auto',
							},
							{
								label: __( 'Square (1:1)', 'photo-collage' ),
								value: '1/1',
							},
							{
								label: __( 'Standard (4:3)', 'photo-collage' ),
								value: '4/3',
							},
							{
								label: __( 'Portrait (3:4)', 'photo-collage' ),
								value: '3/4',
							},
							{
								label: __( 'Classic (3:2)', 'photo-collage' ),
								value: '3/2',
							},
							{
								label: __(
									'Classic Portrait (2:3)',
									'photo-collage'
								),
								value: '2/3',
							},
							{
								label: __( 'Wide (16:9)', 'photo-collage' ),
								value: '16/9',
							},
							{
								label: __( 'Tall (9:16)', 'photo-collage' ),
								value: '9/16',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { aspectRatio: value } )
						}
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
					<div
						className="photo-collage-dimensions-row"
						style={ { display: 'flex', gap: '10px' } }
					>
						<UnitControl
							label={ __( 'Width', 'photo-collage' ) }
							value={ width }
							onChange={ ( value ) =>
								setAttributes( { width: value } )
							}
							__next40pxDefaultSize={ true }
						/>
						<UnitControl
							label={ __( 'Height', 'photo-collage' ) }
							value={ height }
							onChange={ ( value ) =>
								setAttributes( { height: value } )
							}
							__next40pxDefaultSize={ true }
						/>
					</div>
					<SelectControl
						label={ __( 'Resolution', 'photo-collage' ) }
						value={ sizeSlug }
						options={ [
							{
								label: __( 'Thumbnail', 'photo-collage' ),
								value: 'thumbnail',
							},
							{
								label: __( 'Medium', 'photo-collage' ),
								value: 'medium',
							},
							{
								label: __( 'Large', 'photo-collage' ),
								value: 'large',
							},
							{
								label: __( 'Full Size', 'photo-collage' ),
								value: 'full',
							},
						] }
						onChange={ ( value ) => {
							setAttributes( { sizeSlug: value } );
							if (
								media &&
								media.media_details &&
								media.media_details.sizes &&
								media.media_details.sizes[ value ]
							) {
								setAttributes( {
									url: media.media_details.sizes[ value ]
										.source_url,
								} );
							} else if (
								value === 'full' &&
								media &&
								media.source_url
							) {
								setAttributes( { url: media.source_url } );
							}
						} }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Caption', 'photo-collage' ) }
					initialOpen={ false }
				>
					{ ! isDecorative && (
						<TextControl
							label={ __( 'Title', 'photo-collage' ) }
							value={ title }
							onChange={ ( value ) =>
								setAttributes( { title: value } )
							}
							help={ __(
								'Optional. Appears as a tooltip when hovering over the image.',
								'photo-collage'
							) }
							__next40pxDefaultSize={ true }
							__nextHasNoMarginBottom={ true }
						/>
					) }
					<TextareaControl
						label={ __( 'Caption', 'photo-collage' ) }
						value={ caption }
						onChange={ ( value ) =>
							setAttributes( { caption: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>
					<div
						className="components-base-control"
						style={ {
							borderTop: '1px solid #ddd',
							marginTop: '16px',
							paddingTop: '16px',
						} }
					></div>
					<p
						className="components-base-control__label"
						style={ { marginBottom: '8px' } }
					>
						{ __( 'Caption Position', 'photo-collage' ) }
					</p>
					<CaptionPositionControl
						value={ captionPlacement }
						onChange={ onCaptionPlacementChange }
					/>
					<SelectControl
						label={ __( 'Text Alignment', 'photo-collage' ) }
						value={ captionAlign }
						options={ [
							{
								label: __( 'Left', 'photo-collage' ),
								value: 'left',
							},
							{
								label: __( 'Center', 'photo-collage' ),
								value: 'center',
							},
							{
								label: __( 'Right', 'photo-collage' ),
								value: 'right',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { captionAlign: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<UnitControl
						label={ __( 'Caption Width', 'photo-collage' ) }
						value={ captionWidth }
						onChange={ ( value ) =>
							setAttributes( { captionWidth: value } )
						}
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Advanced', 'photo-collage' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'HTML Anchor', 'photo-collage' ) }
						value={ anchor }
						onChange={ ( value ) =>
							setAttributes( { anchor: value } )
						}
						help={ __(
							'Enter a word or two — without spaces — to make a unique web address just for this block, called an "anchor".',
							'photo-collage'
						) }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<ToggleControl
						label={ __( 'Mark as decorative', 'photo-collage' ) }
						checked={ isDecorative }
						onChange={ onToggleDecorative }
						help={
							isDecorative
								? __(
										'This image will be hidden from screen readers.',
										'photo-collage'
								  )
								: __(
										'This image requires alt text for screen readers.',
										'photo-collage'
								  )
						}
						__nextHasNoMarginBottom={ true }
					/>

					<div
						style={ {
							height: '16px',
							borderTop: '1px solid #ddd',
							margin: '16px 0',
						} }
					/>

					<p className="components-base-control__label">
						{ __( 'Wrapper Styles', 'photo-collage' ) }
					</p>
					<TextControl
						label={ __( 'DIV CSS Classes', 'photo-collage' ) }
						value={ divClass }
						onChange={ ( value ) =>
							setAttributes( { divClass: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<TextareaControl
						label={ __( 'DIV Inline Style', 'photo-collage' ) }
						value={ divStyle }
						onChange={ ( value ) =>
							setAttributes( { divStyle: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>

					<div style={ { height: '16px' } } />
					<p className="components-base-control__label">
						{ __( 'Image Styles', 'photo-collage' ) }
					</p>
					<TextControl
						label={ __( 'Image CSS Class', 'photo-collage' ) }
						value={ imgClass }
						onChange={ ( value ) =>
							setAttributes( { imgClass: value } )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<TextareaControl
						label={ __( 'Image Inline Style', 'photo-collage' ) }
						value={ imgStyle }
						onChange={ ( value ) =>
							setAttributes( { imgStyle: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>

					{ showCaption && (
						<>
							<div style={ { height: '16px' } } />
							<p className="components-base-control__label">
								{ __( 'Caption Styles', 'photo-collage' ) }
							</p>
							<TextControl
								label={ __(
									'Caption CSS Class',
									'photo-collage'
								) }
								value={ captionClass }
								onChange={ ( value ) =>
									setAttributes( { captionClass: value } )
								}
								__next40pxDefaultSize={ true }
								__nextHasNoMarginBottom={ true }
							/>
							<TextareaControl
								label={ __(
									'Caption Inline Style',
									'photo-collage'
								) }
								value={ captionStyle }
								onChange={ ( value ) =>
									setAttributes( { captionStyle: value } )
								}
								__nextHasNoMarginBottom={ true }
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Layout', 'photo-collage' ) }
					initialOpen={ true }
				>
					<ToggleControl
						label={ __(
							'Use Absolute Positioning',
							'photo-collage'
						) }
						id={ `inspector-image-absolute-position-${ instanceId }` }
						help={ __(
							'Position image relative to container edges instead of using margins.',
							'photo-collage'
						) }
						checked={ useAbsolutePosition }
						onChange={ ( value ) =>
							setAttributes( { useAbsolutePosition: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>
					{ useAbsolutePosition && (
						<AbsolutePositionControls
							top={ top }
							right={ right }
							bottom={ bottom }
							left={ left }
							setAttributes={ setAttributes }
							instanceId={ instanceId }
							idPrefix="inspector-image"
						/>
					) }
					<div className="photo-collage-z-index-control">
						<RangeControl
							label={ __(
								'Z-Index (Layer Order)',
								'photo-collage'
							) }
							id={ `inspector-image-z-index-${ instanceId }` }
							value={ zIndex }
							onChange={ ( value ) =>
								setAttributes( { zIndex: value } )
							}
							min={ -10 }
							max={ 100 }
							help={ __(
								'Higher numbers are on top.',
								'photo-collage'
							) }
							__next40pxDefaultSize={ true }
							__nextHasNoMarginBottom={ true }
						/>
						<div className="photo-collage-z-index-buttons">
							<Button
								variant="secondary"
								size="small"
								onClick={ () =>
									setAttributes( { zIndex: zIndex - 1 } )
								}
								icon="minus"
								label={ __( 'Move Backward', 'photo-collage' ) }
							/>
							<Button
								variant="secondary"
								size="small"
								onClick={ () =>
									setAttributes( { zIndex: zIndex + 1 } )
								}
								icon="plus"
								label={ __( 'Move Forward', 'photo-collage' ) }
							/>
						</div>
					</div>
				</PanelBody>

				<PanelBody
					title={ __( 'Effects', 'photo-collage' ) }
					initialOpen={ true }
				>
					<div
						style={ {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: '8px',
						} }
					>
						<span
							style={ {
								fontSize: '11px',
								fontWeight: '500',
								textTransform: 'uppercase',
								color: '#1e1e1e',
							} }
						>
							{ __( 'Rotation', 'photo-collage' ) }
						</span>
						{ rotation !== 0 && (
							<Button
								size="small"
								variant="tertiary"
								onClick={ () =>
									setAttributes( { rotation: 0 } )
								}
							>
								{ __( 'Reset', 'photo-collage' ) }
							</Button>
						) }
					</div>
					<RangeControl
						value={ rotation }
						id={ `inspector-image-rotation-${ instanceId }` }
						onChange={ ( value ) =>
							setAttributes( { rotation: value } )
						}
						min={ -180 }
						max={ 180 }
						help={
							rotation !== 0
								? `${ rotation }°`
								: __( 'No rotation applied', 'photo-collage' )
						}
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
					<RangeControl
						label={ __( 'Opacity', 'photo-collage' ) }
						id={ `inspector-image-opacity-${ instanceId }` }
						value={ opacity }
						onChange={ ( value ) =>
							setAttributes( { opacity: value } )
						}
						min={ 0 }
						max={ 1 }
						step={ 0.01 }
						help={ `${ Math.round( opacity * 100 ) }%` }
						__next40pxDefaultSize={ true }
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Background Image', 'photo-collage' ) }
					initialOpen={ false }
				>
					<BackgroundControls
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<figure
					className="photo-collage-image-figure"
					style={ {
						display: showCaption ? 'flex' : undefined,
						flexDirection: showCaption
							? getFlexDirection( captionPlacement )
							: undefined,
						alignItems: showCaption
							? getAlignItems( captionPlacement )
							: undefined,
					} }
				>
					{ /* Caption before image for left-* and top-* placements */ }
					{ showCaption &&
						( captionPlacement.startsWith( 'left-' ) ||
							captionPlacement.startsWith( 'top-' ) ) &&
						( ! RichText.isEmpty( caption ) || isSelected ) && (
							<>
								<BlockControls>
									<AlignmentToolbar
										value={ captionAlign }
										onChange={ ( value ) =>
											setAttributes( {
												captionAlign: value,
											} )
										}
									/>
								</BlockControls>
								<RichText
									tagName="figcaption"
									className={ captionClassName }
									placeholder={ __(
										'Write caption…',
										'photo-collage'
									) }
									value={ caption }
									onChange={ ( value ) =>
										setAttributes( { caption: value } )
									}
									inlineToolbar
									allowedFormats={ [
										'core/bold',
										'core/italic',
										'core/link',
										'core/strikethrough',
										'core/text-color',
										'core/subscript',
										'core/superscript',
									] }
									style={ captionInlineStyle }
								/>
							</>
						) }
					<img
						src={ url }
						alt={ alt }
						style={ {
							objectFit:
								aspectRatio && aspectRatio !== 'auto'
									? 'cover'
									: 'contain',
							aspectRatio:
								aspectRatio && aspectRatio !== 'auto'
									? aspectRatio
									: undefined,
							...imageSizeStyle,
							flex: showCaption ? '1' : undefined,
							minWidth: showCaption ? '0' : undefined,
							minHeight: showCaption ? '0' : undefined,
						} }
					/>
					{ /* Caption after image for right-* and bottom-* placements */ }
					{ showCaption &&
						( captionPlacement.startsWith( 'right-' ) ||
							captionPlacement.startsWith( 'bottom-' ) ) &&
						( ! RichText.isEmpty( caption ) || isSelected ) && (
							<>
								<BlockControls>
									<AlignmentToolbar
										value={ captionAlign }
										onChange={ ( value ) =>
											setAttributes( {
												captionAlign: value,
											} )
										}
									/>
								</BlockControls>
								<RichText
									tagName="figcaption"
									className={ captionClassName }
									placeholder={ __(
										'Write caption…',
										'photo-collage'
									) }
									value={ caption }
									onChange={ ( value ) =>
										setAttributes( { caption: value } )
									}
									inlineToolbar
									allowedFormats={ [
										'core/bold',
										'core/italic',
										'core/link',
										'core/strikethrough',
										'core/text-color',
										'core/subscript',
										'core/superscript',
									] }
									style={ captionInlineStyle }
								/>
							</>
						) }
				</figure>
			</div>
		</>
	);
}
