import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	SideBySideIcon,
	ThreeColumnsIcon,
	OverlapLeftIcon,
	OverlapRightIcon,
	ThreeGridIcon,
	OffsetGridIcon,
	ScatterIcon,
	HeroLayeredIcon,
	VerticalWaveIcon,
	StaggeredStoryIcon,
	OffsetGalleryIcon,
	CenterOverlayIcon,
} from './icons';
import './editor.scss';

const PRESETS = {
	'side-by-side': [
		{ width: '50%', marginLeft: '0%', marginTop: '0%' },
		{ width: '50%', marginLeft: '0%', marginTop: '0%' },
	],
	'three-columns': [
		{ width: '33.33%', marginLeft: '0%', marginTop: '0%' },
		{ width: '33.33%', marginLeft: '0%', marginTop: '0%' },
		{ width: '33.33%', marginLeft: '0%', marginTop: '0%' },
	],
	'overlap-left': [
		{ width: '75%', marginLeft: '0%', marginTop: '0%', zIndex: 2 },
		{ width: '75%', marginLeft: '25%', marginTop: '-15%', zIndex: 1 },
	],
	'overlap-right': [
		{ width: '75%', marginLeft: '25%', marginTop: '0%', zIndex: 2 },
		{ width: '75%', marginLeft: '0%', marginTop: '-15%', zIndex: 1 },
	],
	'three-grid': [
		{ width: '50%', marginLeft: '0%', marginTop: '0%' },
		{ width: '50%', marginLeft: '0%', marginTop: '0%' },
		{ width: '100%', marginLeft: '0%', marginTop: '0%' },
	],
	'offset-grid': [
		{ width: '45%', marginLeft: '0%', marginTop: '0%' },
		{ width: '45%', marginLeft: '55%', marginTop: '20%' }, // Shifted down
	],
	scatter: [
		{
			width: '40%',
			marginLeft: '10%',
			marginTop: '0%',
			rotation: -5,
			zIndex: 1,
		},
		{
			width: '40%',
			marginLeft: '10%',
			marginTop: '-15%',
			rotation: 5,
			zIndex: 2,
		},
		{
			width: '35%',
			marginLeft: '30%',
			marginTop: '-10%',
			rotation: 0,
			zIndex: 3,
		},
	],
	'hero-layered': [
		{ width: '70%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '40%', marginLeft: '55%', marginTop: '-20%', zIndex: 2 },
	],
	'vertical-wave': [
		{ width: '30%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '30%', marginLeft: '5%', marginTop: '-10%', zIndex: 2 },
		{ width: '30%', marginLeft: '5%', marginTop: '-15%', zIndex: 1 },
		{ width: '30%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '30%', marginLeft: '5%', marginTop: '-10%', zIndex: 2 },
		{ width: '30%', marginLeft: '5%', marginTop: '-15%', zIndex: 1 },
		{ width: '30%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '30%', marginLeft: '5%', marginTop: '-10%', zIndex: 2 },
	],
	'staggered-story': [
		{ width: '28%', marginLeft: '2%', marginTop: '0%', zIndex: 1 },
		{ width: '28%', marginLeft: '6%', marginTop: '-5%', zIndex: 2 },
		{ width: '28%', marginLeft: '6%', marginTop: '-10%', zIndex: 1 },
		{ width: '28%', marginLeft: '2%', marginTop: '0%', zIndex: 1 },
		{ width: '28%', marginLeft: '6%', marginTop: '-5%', zIndex: 2 },
		{ width: '28%', marginLeft: '6%', marginTop: '-10%', zIndex: 1 },
		{ width: '28%', marginLeft: '2%', marginTop: '0%', zIndex: 1 },
		{ width: '28%', marginLeft: '6%', marginTop: '-5%', zIndex: 2 },
		{ width: '28%', marginLeft: '6%', marginTop: '-10%', zIndex: 1 },
	],
	'offset-gallery': [
		{ width: '35%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '25%', marginLeft: '5%', marginTop: '-8%', zIndex: 2 },
		{ width: '30%', marginLeft: '5%', marginTop: '-12%', zIndex: 1 },
		{ width: '40%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '30%', marginLeft: '25%', marginTop: '-8%', zIndex: 2 },
		{ width: '35%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '25%', marginLeft: '5%', marginTop: '-8%', zIndex: 2 },
	],
	'center-overlay': [
		{ width: '100%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '50%', marginLeft: '25%', marginTop: '-40%', zIndex: 2 },
	],
};

const PRESET_BUTTONS = [
	{ id: 'side-by-side', icon: SideBySideIcon, label: 'Side by Side' },
	{ id: 'three-columns', icon: ThreeColumnsIcon, label: 'Three Columns' },
	{ id: 'overlap-left', icon: OverlapLeftIcon, label: 'Overlap Left' },
	{ id: 'overlap-right', icon: OverlapRightIcon, label: 'Overlap Right' },
	{ id: 'three-grid', icon: ThreeGridIcon, label: 'Three Grid' },
	{ id: 'offset-grid', icon: OffsetGridIcon, label: 'Offset Grid' },
	{ id: 'scatter', icon: ScatterIcon, label: 'Scatter' },
	{ id: 'hero-layered', icon: HeroLayeredIcon, label: 'Hero Layered' },
	{ id: 'vertical-wave', icon: VerticalWaveIcon, label: 'Vertical Wave' },
	{
		id: 'staggered-story',
		icon: StaggeredStoryIcon,
		label: 'Staggered Story',
	},
	{ id: 'offset-gallery', icon: OffsetGalleryIcon, label: 'Offset Gallery' },
	{ id: 'center-overlay', icon: CenterOverlayIcon, label: 'Center Overlay' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { stackOnMobile, containerHeight } = attributes;
	const blockProps = useBlockProps( {
		className: stackOnMobile ? 'is-stack-on-mobile' : '',
		style: {
			height: containerHeight,
			minHeight: '200px', // Ensure container is visible
		},
	} );
	const ALLOWED_BLOCKS = [ 'photo-collage/image' ];

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const innerBlocks = useSelect(
		( select ) => {
			const blocks = select( 'core/block-editor' ).getBlocks( clientId );
			return blocks || [];
		},
		[ clientId ]
	);

	const updateImageCount = ( newCount ) => {
		const currentCount = innerBlocks.length;

		if ( newCount > currentCount ) {
			const blocksToAdd = newCount - currentCount;
			const newBlocks = Array.from( { length: blocksToAdd } ).map( () =>
				createBlock( 'photo-collage/image' )
			);
			replaceInnerBlocks( clientId, [ ...innerBlocks, ...newBlocks ] );
		} else if ( newCount < currentCount ) {
			const newBlocks = innerBlocks.slice( 0, newCount );
			replaceInnerBlocks( clientId, newBlocks );
		}
	};

	const applyPreset = ( preset ) => {
		const config = PRESETS[ preset ];
		if ( ! config ) return;

		// Auto-adjust container height for vertical layouts
		if (
			[ 'vertical-wave', 'staggered-story', 'offset-gallery' ].includes(
				preset
			)
		) {
			setAttributes( { containerHeight: '1200px' } );
		} else if (
			[
				'overlap-left',
				'overlap-right',
				'offset-grid',
				'scatter',
				'hero-layered',
				'center-overlay',
			].includes( preset )
		) {
			setAttributes( { containerHeight: '' } );
		} else if (
			[ 'side-by-side', 'three-columns', 'three-grid' ].includes( preset )
		) {
			setAttributes( { containerHeight: '' } );
		}

		// Create new blocks with preset layout, but preserve existing image data
		const newBlocks = config.map( ( attrs, index ) => {
			// If there's an existing block at this index, preserve its image data
			const existingBlock = innerBlocks[ index ];
			const imageData = existingBlock
				? {
						url: existingBlock.attributes.url,
						id: existingBlock.attributes.id,
						alt: existingBlock.attributes.alt,
						title: existingBlock.attributes.title,
						caption: existingBlock.attributes.caption,
						description: existingBlock.attributes.description,
						isDecorative: existingBlock.attributes.isDecorative,
				  }
				: {};

			// Merge preset layout attributes with preserved image data
			return createBlock( 'photo-collage/image', {
				...attrs,
				...imageData,
			} );
		} );
		replaceInnerBlocks( clientId, newBlocks );
	};

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: [ [ 'photo-collage/image' ], [ 'photo-collage/image' ] ],
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Quick Layouts', 'photo-collage' ) }
					initialOpen={ true }
				>
					<div className="photo-collage-quick-layouts">
						{ PRESET_BUTTONS.map( ( btn ) => (
							<Button
								key={ btn.id }
								variant="secondary"
								onClick={ () => applyPreset( btn.id ) }
								className="photo-collage-layout-button"
							>
								{ btn.icon }
								<span>
									{ __( btn.label, 'photo-collage' ) }
								</span>
							</Button>
						) ) }
					</div>
				</PanelBody>
				<PanelBody
					title={ __( 'Container Settings', 'photo-collage' ) }
				>
					<UnitControl
						label={ __( 'Container Height', 'photo-collage' ) }
						value={ containerHeight }
						onChange={ ( value ) =>
							setAttributes( { containerHeight: value } )
						}
						help={ __(
							'Fixed height is required for absolute positioning and overlapping effects.',
							'photo-collage'
						) }
					/>
					<RangeControl
						label={ __( 'Number of Images', 'photo-collage' ) }
						value={ innerBlocks.length }
						onChange={ updateImageCount }
						min={ 1 }
						max={ 10 }
						help={
							innerBlocks.length === 1
								? __( '1 image in collage', 'photo-collage' )
								: `${ innerBlocks.length } ${ __(
										'images in collage',
										'photo-collage'
								  ) }`
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Responsive Settings', 'photo-collage' ) }
				>
					<ToggleControl
						label={ __( 'Stack on Mobile', 'photo-collage' ) }
						help={ __(
							'Automatically stack images vertically on mobile devices.',
							'photo-collage'
						) }
						checked={ stackOnMobile }
						onChange={ ( value ) =>
							setAttributes( { stackOnMobile: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
