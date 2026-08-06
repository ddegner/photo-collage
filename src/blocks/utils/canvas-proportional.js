import {
	MAX_VERTICAL_FRACTION,
	formatCanvasLength,
	isViewportWidthLength,
	parseCanvasLength,
} from './canvas-geometry';
import { findDirectBlockElement } from './canvas-freeform';
import {
	MIN_AUTO_HEIGHT,
	measureExtentForElement,
	parseVerticalSlope,
	solveMeasuredHeight,
} from './height-solver';

const POSITIONABLE_BLOCKS = new Set( [
	'photo-collage/image',
	'photo-collage/frame',
] );

const isFiniteNumber = ( value ) =>
	typeof value === 'number' && Number.isFinite( value );

const getUnit = ( value ) => parseCanvasLength( value )?.unit ?? null;

// A fixed container whose height is already viewport-scaled (the manual
// escape hatch, e.g. containerHeight: '141vw') keeps its height mode: the
// height already tracks the window width, and flipping it to auto would
// discard that intentional value.
const keepsFixedHeight = ( parentAttributes = {} ) =>
	( parentAttributes.heightMode || 'fixed' ) !== 'auto' &&
	isViewportWidthLength( parentAttributes.containerHeight );

/**
 * Capture every absolutely positioned child ahead of a unit conversion.
 *
 * All-or-nothing like the freeform capture: a conversion that silently
 * skipped an unmeasurable child would leave the collage half-proportional.
 * Flow children are untouched by design — a mixed collage converts only its
 * absolute subset. Move locks are not consulted: the conversion repositions
 * nothing, it re-expresses the same geometry in different units.
 *
 * @param {Object}  options                  Capture options.
 * @param {Element} options.container        Container DOM element.
 * @param {string}  options.parentClientId   Container client ID.
 * @param {Object}  options.parentAttributes Container attributes.
 * @param {Array}   options.blocks           Direct block-editor children.
 * @return {{snapshot?: Object, error?: string}} Capture result.
 */
export const captureProportionalSnapshot = ( {
	container,
	parentClientId,
	parentAttributes = {},
	blocks = [],
} ) => {
	const ownerWindow = container?.ownerDocument?.defaultView;
	const containerWidth = container?.clientWidth;

	if (
		! container ||
		! ownerWindow ||
		! isFiniteNumber( containerWidth ) ||
		containerWidth <= 0
	) {
		return { error: 'container-unavailable' };
	}

	const containerRectHeight = container.getBoundingClientRect().height;
	const scaleY =
		containerRectHeight > 0 && container.offsetHeight > 0
			? containerRectHeight / container.offsetHeight
			: 1;
	const items = [];

	for ( const block of blocks ) {
		if (
			! POSITIONABLE_BLOCKS.has( block?.name ) ||
			block.attributes?.useAbsolutePosition !== true
		) {
			continue;
		}

		const element = findDirectBlockElement( container, block.clientId );
		if ( ! element ) {
			return { error: 'child-unavailable' };
		}

		const computedStyle = ownerWindow.getComputedStyle( element );
		const rect = {
			left: element.offsetLeft,
			top: element.offsetTop,
			width: element.offsetWidth,
			height: element.offsetHeight,
		};

		if (
			computedStyle.display === 'none' ||
			computedStyle.visibility === 'hidden' ||
			! isFiniteNumber( rect.left ) ||
			! isFiniteNumber( rect.top ) ||
			! isFiniteNumber( rect.width ) ||
			rect.width <= 0 ||
			! isFiniteNumber( rect.height ) ||
			rect.height < 0
		) {
			return { error: 'child-unmeasurable' };
		}

		// The solver extent comes from the bounding box — the same
		// measurement the auto-height loops make — so rotated children
		// project correctly; the offset rect above stays the basis for the
		// attribute-value conversions.
		const { anchor, slope } = parseVerticalSlope( block.attributes );
		const extent = measureExtentForElement( container, element, {
			scaleY,
			anchor,
		} );

		items.push( {
			attributes: { ...block.attributes },
			clientId: block.clientId,
			extent: isFiniteNumber( extent ) ? extent : rect.top + rect.height,
			heightFraction: parseVerticalSlope( {
				height: block.attributes.height,
			} ).slope,
			rect,
			slope,
		} );
	}

	if ( items.length === 0 ) {
		return { error: 'nothing-to-convert' };
	}

	// A child whose explicit height is a percentage never constrains the
	// auto height (its extent is a fixed fraction of whatever the container
	// resolves to). Pixel and automatic heights both anchor the solve —
	// automatic image heights through their aspect ratio, automatic frame
	// heights through their measured content. If every child is
	// percentage-height, the converted container would collapse to its
	// minimum height. Containers that keep a viewport-scaled fixed height
	// are exempt: their height does not depend on the children.
	const hasHeightAnchor = items.some(
		( item ) => getUnit( item.attributes.height ) !== '%'
	);
	if ( ! hasHeightAnchor && ! keepsFixedHeight( parentAttributes ) ) {
		return { error: 'no-height-anchor' };
	}

	return {
		snapshot: {
			container,
			containerWidth,
			containerHeight: isFiniteNumber( container.clientHeight )
				? container.clientHeight
				: 0,
			items,
			parentAttributes: { ...parentAttributes },
			parentClientId,
		},
	};
};

// heightFraction non-null enables the solver guard: a percentage whose
// combined fraction with the child's preserved percentage height reaches ~1
// would be skipped by the auto-height solvers, so such offsets stay pixels.
const convertOffset = ( value, basis, { heightFraction = null } = {} ) => {
	const parsed = parseCanvasLength( value );

	if ( ! parsed || parsed.unit !== 'px' || ! basis || basis <= 0 ) {
		return undefined;
	}

	const fraction = parsed.value / basis;
	if (
		heightFraction !== null &&
		fraction + heightFraction >= MAX_VERTICAL_FRACTION
	) {
		return undefined;
	}

	return formatCanvasLength( fraction * 100, '%' );
};

// Re-express an existing percentage offset against a new basis so the child
// keeps its rendered position when a fixed container flips to auto height.
// Falls back to the equivalent pixel offset when the rescaled percentage
// would be solver-degenerate.
const rescalePercentOffset = ( value, fromBasis, toBasis, heightFraction ) => {
	const parsed = parseCanvasLength( value );

	if (
		! parsed ||
		parsed.unit !== '%' ||
		! fromBasis ||
		fromBasis <= 0 ||
		! toBasis ||
		toBasis <= 0
	) {
		return undefined;
	}

	const pixels = ( parsed.value / 100 ) * fromBasis;
	if ( pixels / toBasis + heightFraction >= MAX_VERTICAL_FRACTION ) {
		return formatCanvasLength( pixels, 'px' );
	}

	const rescaled = formatCanvasLength( ( pixels / toBasis ) * 100, '%' );
	return rescaled === value ? undefined : rescaled;
};

/**
 * Build the single-dispatch update map that makes a collage proportional.
 *
 * Position attributes stored in pixels are re-expressed as percentages —
 * horizontal against the container width, vertical against the height the
 * container settles at once it is auto-sized. When a fixed container flips
 * to auto its height changes, so existing percentage positions are also
 * re-expressed (by the basis ratio) to keep their rendered pixels; in
 * already-auto containers they are left untouched. Explicit heights are
 * never converted — they are the solver's anchors — which means a
 * percentage-height child keeps its stored fraction and its rendered size
 * follows the new solved height.
 *
 * @param {Object} options          Plan options.
 * @param {Object} options.snapshot Captured collage state.
 * @return {{convertedCount: number, projectedHeight: number, updatesByClientId: Object}|null} Update plan.
 */
export const createProportionalUpdatePlan = ( { snapshot } ) => {
	if ( ! snapshot ) {
		return null;
	}

	const heightMode = snapshot.parentAttributes?.heightMode || 'fixed';
	const staysFixed = keepsFixedHeight( snapshot.parentAttributes );
	const flipsToAuto = heightMode !== 'auto' && ! staysFixed;
	let projectedHeight = snapshot.containerHeight;

	if ( heightMode === 'auto' ) {
		// Already auto: the basis is the equilibrium of the current
		// geometry, solved with each child's pre-conversion slope.
		projectedHeight = solveMeasuredHeight( {
			candidates: snapshot.items.map( ( item ) => ( {
				extent: item.extent,
				slope: item.slope,
			} ) ),
			currentHeight: snapshot.containerHeight,
			minHeight: MIN_AUTO_HEIGHT,
		} );
	} else if ( flipsToAuto ) {
		// Flipping fixed to auto: the conversion re-expresses every
		// position to preserve its rendered pixels, so after the flip only
		// percentage HEIGHTS still scale with the container. Projecting
		// with those slopes alone yields the height the converted collage
		// actually settles at.
		projectedHeight = solveMeasuredHeight( {
			candidates: snapshot.items.map( ( item ) => ( {
				extent: item.extent,
				slope: item.heightFraction,
			} ) ),
			currentHeight: snapshot.containerHeight,
			minHeight: MIN_AUTO_HEIGHT,
		} );
	}

	const updatesByClientId = {};
	let convertedCount = 0;

	snapshot.items.forEach( ( item ) => {
		const { attributes } = item;
		const update = {};
		// Fixed viewport-scaled containers have no solver to protect.
		const guardHeightFraction = staysFixed ? null : item.heightFraction;
		const converted = {
			top: convertOffset( attributes.top, projectedHeight, {
				heightFraction: guardHeightFraction,
			} ),
			bottom: convertOffset( attributes.bottom, projectedHeight, {
				heightFraction: guardHeightFraction,
			} ),
			left: convertOffset( attributes.left, snapshot.containerWidth ),
			right: convertOffset( attributes.right, snapshot.containerWidth ),
			width: convertOffset( attributes.width, snapshot.containerWidth ),
		};

		if ( flipsToAuto ) {
			// Existing percentage positions resolved against the old fixed
			// height; keep their rendered pixels against the new basis.
			if ( converted.top === undefined ) {
				converted.top = rescalePercentOffset(
					attributes.top,
					snapshot.containerHeight,
					projectedHeight,
					item.heightFraction
				);
			}
			if ( converted.bottom === undefined ) {
				converted.bottom = rescalePercentOffset(
					attributes.bottom,
					snapshot.containerHeight,
					projectedHeight,
					item.heightFraction
				);
			}
		}

		Object.entries( converted ).forEach( ( [ property, value ] ) => {
			if ( value !== undefined ) {
				update[ property ] = value;
			}
		} );

		if ( Object.keys( update ).length > 0 ) {
			updatesByClientId[ item.clientId ] = update;
			convertedCount += 1;
		}
	} );

	if ( flipsToAuto ) {
		updatesByClientId[ snapshot.parentClientId ] = {
			heightMode: 'auto',
			containerHeight: '',
		};
	}

	return {
		convertedCount,
		projectedHeight,
		updatesByClientId,
	};
};
