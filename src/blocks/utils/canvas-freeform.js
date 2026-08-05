import {
	createFlowToFreeformAttributes,
	createFreeformContainerAttributes,
	mergeMoveLock,
} from './canvas-geometry';

const POSITIONABLE_BLOCKS = new Set( [
	'photo-collage/image',
	'photo-collage/frame',
] );

const isFiniteNumber = ( value ) =>
	typeof value === 'number' && Number.isFinite( value );

const findDirectBlockElement = ( container, clientId ) => {
	for ( const child of container.children ) {
		if ( child.dataset?.block === clientId ) {
			return child;
		}
	}

	for ( const candidate of container.querySelectorAll( '[data-block]' ) ) {
		if (
			candidate.dataset.block === clientId &&
			candidate.closest( '.wp-block-photo-collage-container' ) ===
				container
		) {
			return candidate;
		}
	}

	return null;
};

/**
 * Capture every direct positionable child before promoting flow layout.
 *
 * Absolute children do not need geometry captured because their coordinates
 * remain unchanged. Every flow child must be measurable and movable; otherwise
 * the whole conversion is rejected so siblings can never partially reflow.
 *
 * @param {Object}   options                  Capture options.
 * @param {Element}  options.container        Container DOM element.
 * @param {string}   options.parentClientId   Container client ID.
 * @param {Object}   options.parentAttributes Container attributes.
 * @param {Array}    options.blocks           Direct block-editor children.
 * @param {Function} options.canMoveBlock     Core movement permission selector.
 * @return {{snapshot?: Object, error?: string}} Capture result.
 */
export const captureFreeformSnapshot = ( {
	container,
	parentClientId,
	parentAttributes = {},
	blocks = [],
	canMoveBlock = () => true,
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

	const items = [];

	for ( const block of blocks ) {
		if ( ! POSITIONABLE_BLOCKS.has( block?.name ) ) {
			continue;
		}

		const attributes = block.attributes || {};
		const isAbsolute = attributes.useAbsolutePosition === true;
		const item = {
			attributes: { ...attributes },
			clientId: block.clientId,
			isAbsolute,
		};

		if ( isAbsolute ) {
			items.push( item );
			continue;
		}

		if ( ! canMoveBlock( block.clientId ) ) {
			return { error: 'child-locked' };
		}

		const element = findDirectBlockElement( container, block.clientId );
		if ( ! element ) {
			return { error: 'child-unavailable' };
		}

		const computedStyle = ownerWindow.getComputedStyle( element );
		const borderRect = {
			left: element.offsetLeft,
			top: element.offsetTop,
			width: element.offsetWidth,
			height: element.offsetHeight,
		};
		const isHidden =
			computedStyle.display === 'none' ||
			computedStyle.visibility === 'hidden';

		if (
			isHidden ||
			! isFiniteNumber( borderRect.left ) ||
			! isFiniteNumber( borderRect.top ) ||
			! isFiniteNumber( borderRect.width ) ||
			borderRect.width <= 0 ||
			! isFiniteNumber( borderRect.height ) ||
			borderRect.height < 0
		) {
			return { error: 'child-unmeasurable' };
		}

		items.push( {
			...item,
			borderRect,
			element,
		} );
	}

	if ( items.length === 0 ) {
		return { error: 'empty-collage' };
	}

	return {
		snapshot: {
			blocks,
			container,
			containerWidth,
			items,
			parentAttributes: { ...parentAttributes },
			parentClientId,
			promotedCount: items.filter( ( item ) => ! item.isAbsolute ).length,
		},
	};
};

/**
 * Create one per-client attribute map for a freeform conversion.
 *
 * @param {Object} options                   Plan options.
 * @param {Object} options.snapshot          Captured collage state.
 * @param {string} [options.movedClientId]   Flow child moved in this transaction.
 * @param {Object} [options.movedBorderRect] Moved child's final border rectangle.
 * @return {{promotedCount: number, updatesByClientId: Object}|null} Update plan.
 */
export const createFreeformUpdatePlan = ( {
	snapshot,
	movedClientId,
	movedBorderRect,
} ) => {
	if ( ! snapshot ) {
		return null;
	}

	const updatesByClientId = {};

	for ( const item of snapshot.items ) {
		const lock = mergeMoveLock( item.attributes.lock );

		if ( item.isAbsolute ) {
			if ( item.attributes.lock?.move !== true ) {
				updatesByClientId[ item.clientId ] = { lock };
			}
			continue;
		}

		const borderRect =
			item.clientId === movedClientId && movedBorderRect
				? movedBorderRect
				: item.borderRect;
		const promotion = createFlowToFreeformAttributes( {
			attributes: item.attributes,
			borderRect,
			containerWidth: snapshot.containerWidth,
		} );

		if ( ! promotion ) {
			return null;
		}

		updatesByClientId[ item.clientId ] = {
			...promotion,
			lock,
		};
	}

	if ( snapshot.promotedCount > 0 ) {
		const containerUpdate = createFreeformContainerAttributes(
			snapshot.parentAttributes
		);
		if ( containerUpdate ) {
			updatesByClientId[ snapshot.parentClientId ] = containerUpdate;
		}
	}

	return {
		promotedCount: snapshot.promotedCount,
		updatesByClientId,
	};
};
