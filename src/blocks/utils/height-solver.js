import { parseCanvasLength } from './canvas-geometry';

export const MIN_AUTO_HEIGHT = 200;

// A child whose vertical percentages consume (almost) the whole container
// cannot constrain the container's height: its required extent approaches the
// height itself and the closed form 1/(1 - slope) diverges. Mirrors the PHP
// solver's 99.5% guard in Photo_Collage_Renderer::get_auto_height_constraints.
export const MAX_SOLVER_SLOPE = 0.995;

const COLLAGE_ITEM_SELECTOR = [
	'wp-block-photo-collage-image',
	'wp-block-photo-collage-frame',
]
	.map( ( className ) => `.${ className }` )
	.join( ', ' );

const percentFraction = ( value ) => {
	const parsed = parseCanvasLength( value );
	return parsed && parsed.unit === '%' ? parsed.value / 100 : 0;
};

const isParseableLength = ( value ) => parseCanvasLength( value ) !== null;

/**
 * Collect a container's direct collage items, excluding nested collages.
 *
 * @param {Element} container Collage container element.
 * @return {Element[]} Direct image and frame elements.
 */
export const getCollageItems = ( container ) =>
	Array.from( container.querySelectorAll( COLLAGE_ITEM_SELECTOR ) ).filter(
		( item ) => {
			if (
				item.closest( '.wp-block-photo-collage-container' ) !==
				container
			) {
				return false;
			}

			const parentCollageItem = item.parentElement?.closest(
				COLLAGE_ITEM_SELECTOR
			);
			return ! parentCollageItem;
		}
	);

/**
 * Derive how a child's required vertical extent grows with container height.
 *
 * The extent of a top-anchored child (container top to child bottom) grows by
 * its percentage top plus its percentage height per container pixel; a
 * bottom-anchored child's extent (child top to container bottom) grows by its
 * percentage bottom plus its percentage height. Pixel and auto values
 * contribute nothing. Accepts block attributes and inline-style values alike.
 *
 * @param {Object} values        Vertical CSS lengths.
 * @param {string} values.top    Top offset.
 * @param {string} values.bottom Bottom offset.
 * @param {string} values.height Explicit height.
 * @return {{anchor: 'top'|'bottom', slope: number}} Extent growth per height pixel.
 */
export const parseVerticalSlope = ( { top, bottom, height } = {} ) => {
	const anchor =
		! isParseableLength( top ) && isParseableLength( bottom )
			? 'bottom'
			: 'top';
	const anchorFraction = percentFraction(
		anchor === 'bottom' ? bottom : top
	);

	return {
		anchor,
		slope: anchorFraction + percentFraction( height ),
	};
};

/**
 * Solve the container height every child fits in, from one measurement pass.
 *
 * Each child's required extent is affine in the container height H:
 * extent(H) = extent(currentHeight) + slope * (H - currentHeight), so the
 * smallest height satisfying H >= extent(H) is
 * (extent - slope * currentHeight) / (1 - slope). Percentage tops make the
 * naive measure-and-retry loop converge only geometrically; this closed form
 * is exact in a single pass for every parseable slope.
 *
 * @param {Object} options               Solve input.
 * @param {Array}  options.candidates    Items as { extent, slope } pairs.
 * @param {number} options.currentHeight Container height the extents were measured at.
 * @param {number} options.minHeight     Height floor.
 * @return {number} Required container height in pixels.
 */
export const solveMeasuredHeight = ( {
	candidates = [],
	currentHeight = 0,
	minHeight = MIN_AUTO_HEIGHT,
} ) => {
	let required = minHeight;

	candidates.forEach( ( candidate ) => {
		const slope = Number.isFinite( candidate?.slope ) ? candidate.slope : 0;
		const extent = candidate?.extent;

		if ( ! Number.isFinite( extent ) || slope >= MAX_SOLVER_SLOPE ) {
			return;
		}

		const candidateHeight =
			( extent - slope * currentHeight ) / ( 1 - slope );
		if ( Number.isFinite( candidateHeight ) ) {
			required = Math.max( required, candidateHeight );
		}
	} );

	// Sub-pixel float noise from the division must not leak into the ceil.
	return Math.ceil( Math.round( required * 1000 ) / 1000 );
};

const getPaddingBoxEdges = ( container, scaleY ) => {
	const containerRect = container.getBoundingClientRect();
	const top = containerRect.top + container.clientTop * scaleY;

	return {
		top,
		bottom: top + container.clientHeight * scaleY,
	};
};

const safeScale = ( scaleY ) =>
	Number.isFinite( scaleY ) && scaleY > 0 ? scaleY : 1;

/**
 * Measure one element's required extent in container padding-box pixels.
 *
 * Percentage offsets resolve against the padding box, so extents are measured
 * from the padding edges rather than the border-box rectangle.
 *
 * @param {Element}        container      Collage container element.
 * @param {Element}        element        Child element.
 * @param {Object}         options        Measurement options.
 * @param {number}         options.scaleY Editor canvas scale.
 * @param {'top'|'bottom'} options.anchor Active vertical anchor.
 * @return {number} Extent in unscaled layout pixels.
 */
export const measureExtentForElement = (
	container,
	element,
	{ scaleY = 1, anchor = 'top' } = {}
) => {
	const scale = safeScale( scaleY );
	const edges = getPaddingBoxEdges( container, scale );
	const elementRect = element.getBoundingClientRect();

	return anchor === 'bottom'
		? ( edges.bottom - elementRect.top ) / scale
		: ( elementRect.bottom - edges.top ) / scale;
};

/**
 * Build solver candidates for a container's rendered items.
 *
 * Slopes come from each item's inline styles, which both the editor and the
 * frontend renderer emit verbatim from block attributes; anything that is not
 * a parseable percentage degrades to slope zero, i.e. plain measurement.
 *
 * @param {Element}   container      Collage container element.
 * @param {Element[]} items          Direct collage items.
 * @param {Object}    options        Measurement options.
 * @param {number}    options.scaleY Editor canvas scale.
 * @return {{candidates: Array, currentHeight: number}} Solver input.
 */
export const collectMeasuredCandidates = (
	container,
	items,
	{ scaleY = 1 } = {}
) => {
	const scale = safeScale( scaleY );

	return {
		candidates: items.map( ( item ) => {
			const { anchor, slope } = parseVerticalSlope( {
				top: item.style.top,
				bottom: item.style.bottom,
				height: item.style.height,
			} );

			return {
				extent: measureExtentForElement( container, item, {
					scaleY: scale,
					anchor,
				} ),
				slope,
			};
		} ),
		currentHeight: container.clientHeight,
	};
};
