import { __ } from '@wordpress/i18n';
import {
	FloatingEditorialMosaicIcon,
	SplitScreenAsymmetricIcon,
	HeroSatelliteIcon,
	ModularProjectGridIcon,
	MinimalIndexThumbsIcon,
	EditorialStoryStreamIcon,
	DenseContactSheetIcon,
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

export const PRESETS = {
	'floating-editorial-mosaic': [
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '3%',
			left: '7%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '32%',
			top: '10%',
			left: '35%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '12%',
			top: '22%',
			left: '76%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '24%',
			top: '31%',
			left: '13%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '16%',
			top: '39%',
			left: '50%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '16.5%',
			top: '48%',
			left: '69%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '28%',
			top: '57%',
			left: '28%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '12%',
			top: '65%',
			left: '9%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '19%',
			top: '74%',
			left: '58%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '84%',
			left: '34%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '16.5%',
			top: '90%',
			left: '79%',
			zIndex: 1,
		},
	],
	'split-screen-asymmetric': [
		{
			useAbsolutePosition: true,
			width: '50%',
			top: '7%',
			left: '6%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '24%',
			top: '9%',
			left: '64%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '20%',
			top: '26%',
			left: '72%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '29%',
			top: '40%',
			left: '14%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '23%',
			top: '53%',
			left: '47%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '26%',
			top: '66%',
			left: '66%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '32%',
			top: '77%',
			left: '20%',
			zIndex: 1,
		},
	],
	'hero-satellite-images': [
		{
			useAbsolutePosition: true,
			width: '68%',
			top: '4%',
			left: '6%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '18%',
			top: '2%',
			left: '78%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '20%',
			top: '36%',
			left: '73%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '17%',
			top: '55%',
			left: '10%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '26%',
			top: '69%',
			left: '29%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '79%',
			left: '67%',
			zIndex: 2,
		},
	],
	'modular-project-grid': [
		{
			width: '48%',
			marginLeft: '0%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '48%',
			marginLeft: '2%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '31%',
			marginLeft: '0%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '31%',
			marginLeft: '3.5%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '31%',
			marginLeft: '3.5%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '58%',
			marginLeft: '0%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '40%',
			marginLeft: '2%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '40%',
			marginLeft: '0%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '26%',
			marginLeft: '2%',
			marginTop: '2%',
			zIndex: 1,
		},
		{
			width: '30%',
			marginLeft: '2%',
			marginTop: '2%',
			zIndex: 1,
		},
	],
	'minimal-project-index-thumbs': [
		{
			useAbsolutePosition: true,
			width: '22%',
			top: '4%',
			left: '10%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '9%',
			left: '62%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '18%',
			left: '62%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '27%',
			left: '62%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '32%',
			top: '40%',
			left: '14%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '50%',
			left: '62%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '59%',
			left: '62%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '24%',
			top: '72%',
			left: '22%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '14%',
			top: '80%',
			left: '62%',
			zIndex: 1,
		},
	],
	'editorial-storytelling-stream': [
		{
			width: '62%',
			marginLeft: '0%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '30%',
			marginLeft: '8%',
			marginTop: '6%',
			zIndex: 1,
		},
		{
			width: '48%',
			marginLeft: '12%',
			marginTop: '8%',
			zIndex: 1,
		},
		{
			width: '26%',
			marginLeft: '18%',
			marginTop: '7%',
			zIndex: 1,
		},
		{
			width: '58%',
			marginLeft: '6%',
			marginTop: '10%',
			zIndex: 1,
		},
		{
			width: '34%',
			marginLeft: '40%',
			marginTop: '8%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '10%',
			marginTop: '10%',
			zIndex: 1,
		},
		{
			width: '52%',
			marginLeft: '22%',
			marginTop: '8%',
			zIndex: 1,
		},
	],
	'dense-contact-sheet-grid': [
		{
			width: '24%',
			marginLeft: '0%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '0%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '0%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '0%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '0%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
		{
			width: '24%',
			marginLeft: '1.3%',
			marginTop: '1.2%',
			zIndex: 1,
		},
	],
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
			useAbsolutePosition: true,
			width: '24%',
			top: '6%',
			left: '10%',
			rotation: -7,
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '20%',
			top: '11%',
			left: '43%',
			rotation: 6,
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '22%',
			top: '19%',
			left: '67%',
			rotation: -5,
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '34%',
			top: '35%',
			left: '18%',
			rotation: 4,
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '18%',
			top: '56%',
			left: '58%',
			rotation: -6,
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '28%',
			top: '69%',
			left: '31%',
			rotation: 5,
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '16%',
			top: '84%',
			left: '70%',
			rotation: -4,
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
		{
			useAbsolutePosition: true,
			width: '30%',
			top: '4%',
			left: '8%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '18%',
			top: '6%',
			left: '43%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '24%',
			top: '13%',
			left: '64%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '32%',
			top: '29%',
			left: '13%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '20%',
			top: '38%',
			left: '51%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '28%',
			top: '50%',
			left: '63%',
			zIndex: 1,
		},
		{
			useAbsolutePosition: true,
			width: '24%',
			top: '67%',
			left: '24%',
			zIndex: 2,
		},
		{
			useAbsolutePosition: true,
			width: '18%',
			top: '78%',
			left: '56%',
			zIndex: 1,
		},
	],
	'center-overlay': [
		{ width: '100%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
		{ width: '50%', marginLeft: '25%', marginTop: '-40%', zIndex: 2 },
	],
};

const clamp = ( value, min, max ) => Math.min( max, Math.max( min, value ) );

const parsePercent = ( value ) => {
	if ( typeof value !== 'string' ) {
		return 0;
	}

	const parsed = Number.parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : 0;
};

const formatPercent = ( value ) =>
	`${ Math.round( clamp( value, 0, 100 ) * 10 ) / 10 }%`;

const randomBetween = ( min, max ) => min + Math.random() * ( max - min );

const getRandomizedFloatingMosaic = () => {
	const baseLayout = PRESETS[ 'floating-editorial-mosaic' ] || [];
	let previousTop = 0;

	return baseLayout.map( ( attrs, index ) => {
		const baseWidth = parsePercent( attrs.width );
		const baseTop = parsePercent( attrs.top );
		const baseLeft = parsePercent( attrs.left );
		const isAnchor = baseWidth >= 26;

		const width = clamp(
			baseWidth + randomBetween( -2.5, 2.5 ),
			isAnchor ? 20 : 9,
			isAnchor ? 38 : 24
		);

		const topCandidate = clamp(
			baseTop + randomBetween( -2.5, 2.5 ),
			1,
			93
		);
		const minGap = index === 0 ? 0 : randomBetween( 3.5, 7.5 );
		const resolvedTop = clamp(
			index === 0
				? topCandidate
				: Math.max( topCandidate, previousTop + minGap ),
			1,
			93
		);
		previousTop = resolvedTop;

		const maxLeft = clamp( 98 - width, 2, 88 );
		const resolvedLeft = clamp(
			baseLeft + randomBetween( -6, 6 ),
			2,
			maxLeft
		);

		const zIndex = Math.random() > 0.82 ? 2 : attrs.zIndex || 1;

		return {
			...attrs,
			width: formatPercent( width ),
			top: formatPercent( resolvedTop ),
			left: formatPercent( resolvedLeft ),
			zIndex,
		};
	} );
};

export const PRESET_BUTTONS = [
	{
		id: 'floating-editorial-mosaic',
		icon: FloatingEditorialMosaicIcon,
		label: __( 'Floating Mosaic', 'photo-collage' ),
	},
	{
		id: 'split-screen-asymmetric',
		icon: SplitScreenAsymmetricIcon,
		label: __( 'Split Asymmetric', 'photo-collage' ),
	},
	{
		id: 'hero-satellite-images',
		icon: HeroSatelliteIcon,
		label: __( 'Hero + Satellites', 'photo-collage' ),
	},
	{
		id: 'modular-project-grid',
		icon: ModularProjectGridIcon,
		label: __( 'Modular Grid', 'photo-collage' ),
	},
	{
		id: 'minimal-project-index-thumbs',
		icon: MinimalIndexThumbsIcon,
		label: __( 'Minimal Index + Thumbs', 'photo-collage' ),
	},
	{
		id: 'editorial-storytelling-stream',
		icon: EditorialStoryStreamIcon,
		label: __( 'Story Stream', 'photo-collage' ),
	},
	{
		id: 'dense-contact-sheet-grid',
		icon: DenseContactSheetIcon,
		label: __( 'Contact Sheet', 'photo-collage' ),
	},
	{
		id: 'side-by-side',
		icon: SideBySideIcon,
		label: __( 'Side by Side', 'photo-collage' ),
	},
	{
		id: 'three-columns',
		icon: ThreeColumnsIcon,
		label: __( 'Three Columns', 'photo-collage' ),
	},
	{
		id: 'overlap-left',
		icon: OverlapLeftIcon,
		label: __( 'Overlap Left', 'photo-collage' ),
	},
	{
		id: 'overlap-right',
		icon: OverlapRightIcon,
		label: __( 'Overlap Right', 'photo-collage' ),
	},
	{
		id: 'three-grid',
		icon: ThreeGridIcon,
		label: __( 'Three Grid', 'photo-collage' ),
	},
	{
		id: 'offset-grid',
		icon: OffsetGridIcon,
		label: __( 'Offset Grid', 'photo-collage' ),
	},
	{
		id: 'scatter',
		icon: ScatterIcon,
		label: __( 'Scatter', 'photo-collage' ),
	},
	{
		id: 'hero-layered',
		icon: HeroLayeredIcon,
		label: __( 'Hero Layered', 'photo-collage' ),
	},
	{
		id: 'vertical-wave',
		icon: VerticalWaveIcon,
		label: __( 'Vertical Wave', 'photo-collage' ),
	},
	{
		id: 'staggered-story',
		icon: StaggeredStoryIcon,
		label: __( 'Staggered Story', 'photo-collage' ),
	},
	{
		id: 'offset-gallery',
		icon: OffsetGalleryIcon,
		label: __( 'Offset Gallery', 'photo-collage' ),
	},
	{
		id: 'center-overlay',
		icon: CenterOverlayIcon,
		label: __( 'Center Overlay', 'photo-collage' ),
	},
];

export const PRESET_HEIGHTS = {
	'floating-editorial-mosaic': '2400px',
	'split-screen-asymmetric': '1650px',
	'hero-satellite-images': '1300px',
	'minimal-project-index-thumbs': '1600px',
	scatter: '1500px',
	'vertical-wave': '1200px',
	'staggered-story': '1200px',
	'offset-gallery': '1400px',
};

export const getPresetLayout = ( preset ) => {
	if ( preset === 'floating-editorial-mosaic' ) {
		return getRandomizedFloatingMosaic();
	}

	return PRESETS[ preset ] || null;
};
