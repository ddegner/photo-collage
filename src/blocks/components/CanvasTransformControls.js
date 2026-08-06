import { __, sprintf } from '@wordpress/i18n';
import {
	store as blockEditorStore,
	useBlockEditingMode,
} from '@wordpress/block-editor';
import { Icon, Tooltip } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import {
	CANVAS_GEOMETRY_CHANGE_EVENT,
	CANVAS_INTERACTION_ATTRIBUTE,
	createMoveAttributes,
	createResizeAttributes,
	getPreferredCanvasUnit,
	hasCanvasRectChanged,
	moveCanvasRect,
	normalizePointerDelta,
	projectLocalDeltaToCanvasAxes,
	resizeCanvasRect,
} from '../utils/canvas-geometry';
import {
	captureFreeformSnapshot,
	createFreeformUpdatePlan,
} from '../utils/canvas-freeform';
import {
	MIN_AUTO_HEIGHT,
	collectMeasuredCandidates,
	getCollageItems,
	measureExtentForElement,
	parseVerticalSlope,
	solveMeasuredHeight,
} from '../utils/height-solver';
import './canvas-transform-controls.scss';

const COLLAGE_CONTAINER_SELECTOR = '.wp-block-photo-collage-container';
const POSITIONABLE_BLOCKS = new Set( [
	'photo-collage/image',
	'photo-collage/frame',
] );
const POINTER_ACTIVATION_THRESHOLD = 3;
const KEYBOARD_STEP = 1;
const KEYBOARD_LARGE_STEP = 10;
const MIN_RESIZE_SIZE = 48;
const EMPTY_CANVAS_CONTEXT = {
	blocks: [],
	canMoveByClientId: {},
	parentAttributes: {},
};
const MOVE_CANVAS_ICON = (
	<svg
		aria-hidden="true"
		focusable="false"
		viewBox="0 0 24 24"
		width="24"
		height="24"
	>
		<path d="m12 2 3 3h-2v5h5V8l3 3-3 3v-2h-5v5h2l-3 3-3-3h2v-5H6v2l-3-3 3-3v2h5V5H9l3-3Z" />
	</svg>
);

const getNumericStyleValue = ( value ) => {
	const parsed = Number.parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : 0;
};

const getElementStyles = ( element ) => ( {
	width: element.style.width,
	height: element.style.height,
	top: element.style.top,
	right: element.style.right,
	bottom: element.style.bottom,
	left: element.style.left,
	transform: element.style.transform,
	willChange: element.style.willChange,
} );

const restoreElementStyles = ( element, styles ) => {
	Object.entries( styles ).forEach( ( [ property, value ] ) => {
		element.style[ property ] = value;
	} );
};

const getCanvasSnapshot = ( element, attributes ) => {
	const container = element.closest( COLLAGE_CONTAINER_SELECTOR );
	const ownerWindow = element.ownerDocument.defaultView;

	if ( ! container || ! ownerWindow ) {
		return null;
	}

	const computedStyle = ownerWindow.getComputedStyle( element );
	const containerStyle = ownerWindow.getComputedStyle( container );
	const marginLeft = getNumericStyleValue( computedStyle.marginLeft );
	const marginTop = getNumericStyleValue( computedStyle.marginTop );
	const paddingHorizontal =
		getNumericStyleValue( containerStyle.paddingLeft ) +
		getNumericStyleValue( containerStyle.paddingRight );
	const paddingVertical =
		getNumericStyleValue( containerStyle.paddingTop ) +
		getNumericStyleValue( containerStyle.paddingBottom );
	const containerRect = container.getBoundingClientRect();
	const layoutWidth = container.offsetWidth || container.clientWidth;
	const layoutHeight = container.offsetHeight || container.clientHeight;
	const paddingBoxWidth = container.clientWidth || layoutWidth;
	const paddingBoxHeight = container.clientHeight || layoutHeight;
	const contentWidth = Math.max( 0, paddingBoxWidth - paddingHorizontal );
	const contentHeight = Math.max( 0, paddingBoxHeight - paddingVertical );
	const scaleX =
		layoutWidth > 0 && containerRect.width > 0
			? containerRect.width / layoutWidth
			: 1;
	const scaleY =
		layoutHeight > 0 && containerRect.height > 0
			? containerRect.height / layoutHeight
			: scaleX;
	let borderLeft;
	let borderTop;

	if ( element.offsetParent === container ) {
		borderLeft = element.offsetLeft;
		borderTop = element.offsetTop;
	} else {
		const elementRect = element.getBoundingClientRect();
		borderLeft =
			( elementRect.left + elementRect.width / 2 - containerRect.left ) /
				scaleX -
			element.offsetWidth / 2;
		borderTop =
			( elementRect.top + elementRect.height / 2 - containerRect.top ) /
				scaleY -
			element.offsetHeight / 2;
	}

	return {
		element,
		container,
		ownerWindow,
		attributes: { ...attributes },
		borderRect: {
			left: borderLeft,
			top: borderTop,
			width: element.offsetWidth,
			height: element.offsetHeight,
		},
		rect: {
			left: borderLeft - marginLeft,
			top: borderTop - marginTop,
			width: element.offsetWidth,
			height: element.offsetHeight,
		},
		containerWidth: attributes.useAbsolutePosition
			? paddingBoxWidth
			: contentWidth || paddingBoxWidth,
		containerHeight: attributes.useAbsolutePosition
			? paddingBoxHeight
			: contentHeight || paddingBoxHeight,
		// A missing dataset must resolve to fixed: the fixed path commits
		// against the measured height, which is always safe, while the auto
		// path projects a post-commit height that only auto containers apply.
		heightMode: container.dataset.heightMode || 'fixed',
		scaleX,
		scaleY,
		styles: getElementStyles( element ),
	};
};

const setInteractionState = ( snapshot, isInteracting, operation = '' ) => {
	if ( isInteracting ) {
		snapshot.container.setAttribute( CANVAS_INTERACTION_ATTRIBUTE, 'true' );
		snapshot.container.classList.add( 'is-photo-collage-interacting' );
		snapshot.element.classList.add(
			'is-photo-collage-transforming',
			`is-photo-collage-${ operation }`
		);
		return;
	}

	snapshot.container.removeAttribute( CANVAS_INTERACTION_ATTRIBUTE );
	snapshot.container.classList.remove( 'is-photo-collage-interacting' );
	snapshot.element.classList.remove(
		'is-photo-collage-transforming',
		'is-photo-collage-move',
		'is-photo-collage-resize'
	);
};

const requestGeometryMeasure = ( snapshot ) => {
	snapshot.ownerWindow.requestAnimationFrame( () => {
		snapshot.container.dispatchEvent(
			new snapshot.ownerWindow.CustomEvent( CANVAS_GEOMETRY_CHANGE_EVENT )
		);
	} );
};

const applyMovePreview = ( gesture, delta ) => {
	const translation = `translate3d(${ delta.x }px, ${ delta.y }px, 0)`;
	const transform = gesture.snapshot.styles.transform;

	gesture.snapshot.element.style.transform = transform
		? `${ translation } ${ transform }`
		: translation;
	gesture.snapshot.element.style.willChange = 'transform';
};

const applyResizePreview = (
	gesture,
	rect,
	{ preserveAutoHeight = false } = {}
) => {
	const { element, attributes } = gesture.snapshot;

	element.style.width = `${ rect.width }px`;
	element.style.height = preserveAutoHeight ? 'auto' : `${ rect.height }px`;
	element.style.willChange = 'width, height, left, top';

	if ( attributes.useAbsolutePosition ) {
		element.style.left = `${ rect.left }px`;
		element.style.top = `${ rect.top }px`;
		element.style.right = 'auto';
		element.style.bottom = 'auto';
	}
};

const applyAutoHeightResizePreview = ( gesture, proposedRect, rotation ) => {
	const { element, rect } = gesture.snapshot;

	element.style.width = `${ proposedRect.width }px`;
	element.style.height = 'auto';

	const measuredHeight = Math.max( MIN_RESIZE_SIZE, element.offsetHeight );
	const exactSizeDelta = projectLocalDeltaToCanvasAxes(
		{
			x: proposedRect.width - rect.width,
			y: measuredHeight - rect.height,
		},
		rotation
	);
	const resultRect = resizeCanvasRect( {
		rect,
		delta: exactSizeDelta,
		rotation,
		minWidth: MIN_RESIZE_SIZE,
		minHeight: MIN_RESIZE_SIZE,
	} );

	applyResizePreview( gesture, resultRect, {
		preserveAutoHeight: true,
	} );
	return resultRect;
};

const getPointerValues = ( event ) => ( {
	clientX: event.clientX,
	clientY: event.clientY,
	shiftKey: event.shiftKey,
} );

const getKeyboardMoveDelta = ( key, step ) => {
	switch ( key ) {
		case 'ArrowLeft':
			return { x: -step, y: 0 };
		case 'ArrowRight':
			return { x: step, y: 0 };
		case 'ArrowUp':
			return { x: 0, y: -step };
		case 'ArrowDown':
			return { x: 0, y: step };
		default:
			return null;
	}
};

/**
 * Project the auto height the container resolves to after this commit.
 *
 * Committing a percentage top against the pre-commit height would let the
 * post-commit solve shift the item: the drop changes the container height,
 * which changes what the percentage resolves to. Solving the same system the
 * auto-height solver will see — siblings at their attribute-driven slopes,
 * the transformed element as a fixed pixel extent — yields a basis the solver
 * reproduces exactly, so the item stays where it was dropped.
 *
 * Must run while the gesture preview styles are still applied; the dragged
 * element is measured from its live bounding rectangle.
 *
 * @param {Object} snapshot Gesture snapshot.
 * @return {number} Predicted container padding-box height in pixels.
 */
const getAutoHeightCommitBasis = ( snapshot ) => {
	const { container, element, scaleY, attributes } = snapshot;
	const siblings = getCollageItems( container ).filter(
		( item ) => item !== element
	);
	const { candidates, currentHeight } = collectMeasuredCandidates(
		container,
		siblings,
		{ scaleY }
	);

	// A child whose committed vertical unit and height are both percentages
	// can never constrain the auto height (its extent is a fixed fraction of
	// whatever the container resolves to); modeling it as a fixed pixel
	// extent would overshoot the basis and shift the item after the solve.
	const verticalUnit = getPreferredCanvasUnit(
		[ attributes.top, attributes.bottom ],
		'%'
	);
	const heightFraction = parseVerticalSlope( {
		height: attributes.height,
	} ).slope;

	if ( verticalUnit !== '%' || heightFraction === 0 ) {
		candidates.push( {
			extent: measureExtentForElement( container, element, { scaleY } ),
			slope: 0,
		} );
	}

	return solveMeasuredHeight( {
		candidates,
		currentHeight,
		minHeight: MIN_AUTO_HEIGHT,
	} );
};

const releaseInteractionAfterCommit = ( snapshot ) => {
	snapshot.ownerWindow.requestAnimationFrame( () => {
		setInteractionState( snapshot, false );
		requestGeometryMeasure( snapshot );
	} );
};

const finishGestureDom = ( gesture, deferInteractionRelease = false ) => {
	const {
		snapshot,
		handle,
		pointerId,
		escapeHandler,
		pointerMoveHandler,
		pointerUpHandler,
		pointerCancelHandler,
	} = gesture;

	// An aborted preview can re-enter finishGesture while the outer call is
	// still unwinding; teardown must only run for the first of them.
	if ( gesture.isFinished ) {
		return;
	}
	gesture.isFinished = true;

	if ( gesture.animationFrameId !== null ) {
		snapshot.ownerWindow.cancelAnimationFrame( gesture.animationFrameId );
		gesture.animationFrameId = null;
	}

	if ( escapeHandler ) {
		snapshot.element.ownerDocument.removeEventListener(
			'keydown',
			escapeHandler,
			true
		);
	}
	if ( pointerMoveHandler ) {
		snapshot.element.ownerDocument.removeEventListener(
			'pointermove',
			pointerMoveHandler,
			true
		);
	}
	if ( pointerUpHandler ) {
		snapshot.element.ownerDocument.removeEventListener(
			'pointerup',
			pointerUpHandler,
			true
		);
	}
	if ( pointerCancelHandler ) {
		snapshot.element.ownerDocument.removeEventListener(
			'pointercancel',
			pointerCancelHandler,
			true
		);
	}
	restoreElementStyles( snapshot.element, snapshot.styles );

	if ( handle?.hasPointerCapture && handle.hasPointerCapture( pointerId ) ) {
		handle.releasePointerCapture( pointerId );
	}

	if ( gesture.didDisableSelection ) {
		gesture.toggleSelection( true );
	}

	if ( deferInteractionRelease ) {
		releaseInteractionAfterCommit( snapshot );
	} else {
		setInteractionState( snapshot, false );
		requestGeometryMeasure( snapshot );
	}
};

/**
 * Selected-block controls for direct canvas movement and resizing.
 *
 * @param {Object}  props                    Component props.
 * @param {Object}  props.attributes         Block attributes.
 * @param {string}  props.clientId           Block editor client ID.
 * @param {boolean} props.isSelected         Whether the block is selected.
 * @param {Object}  props.blockRef           Ref for the existing block root.
 * @param {string}  props.parentClientId     Direct container client ID.
 * @param {string}  props.itemName           Localized item name.
 * @param {boolean} props.lockAspectRatio    Whether resize preserves the ratio.
 * @param {boolean} props.preserveAutoHeight Whether height remains automatic.
 * @return {Element|null} Canvas controls.
 */
export default function CanvasTransformControls( {
	attributes,
	clientId,
	isSelected,
	blockRef,
	parentClientId,
	itemName,
	lockAspectRatio = false,
	preserveAutoHeight = false,
} ) {
	const editingMode = useBlockEditingMode();
	const { toggleSelection, updateBlockAttributes } =
		useDispatch( blockEditorStore );
	const { createErrorNotice, createSuccessNotice } =
		useDispatch( noticesStore );
	// core-data owns the undo stack; @wordpress/editor only delegates to it and
	// pulling that package in would load the post editor on the widgets screen.
	const { undo } = useDispatch( coreStore );
	// Only the selected block can start a gesture, so unselected siblings must
	// not subscribe: a fresh object here re-renders every collage child on any
	// store change, including typing elsewhere in the post.
	const canvasContext = useSelect(
		( select ) => {
			if ( ! clientId || ! parentClientId || ! isSelected ) {
				return EMPTY_CANVAS_CONTEXT;
			}

			const { canMoveBlock, getBlockAttributes, getBlocks } =
				select( blockEditorStore );
			const blocks = ( getBlocks( parentClientId ) || [] ).filter(
				( block ) => POSITIONABLE_BLOCKS.has( block.name )
			);
			const canMoveByClientId = {};

			blocks.forEach( ( block ) => {
				canMoveByClientId[ block.clientId ] = canMoveBlock(
					block.clientId
				);
			} );

			return {
				blocks,
				canMoveByClientId,
				parentAttributes: getBlockAttributes( parentClientId ) || {},
			};
		},
		[ clientId, parentClientId, isSelected ]
	);
	const gestureRef = useRef( null );
	const finishGestureRef = useRef( null );
	const isDirectCanvasChild = Boolean( parentClientId );
	const canMove =
		attributes.useAbsolutePosition === true ||
		canvasContext.canMoveByClientId[ clientId ] !== false;
	const canResize =
		attributes.useAbsolutePosition === true ||
		Math.abs( attributes.rotation || 0 ) < Number.EPSILON;
	const controlsVisible =
		isSelected && editingMode === 'default' && isDirectCanvasChild;

	const showArrangementError = useCallback(
		( error ) => {
			const messages = {
				'child-locked': __(
					'Unlock the responsive collage items before arranging them freely.',
					'photo-collage'
				),
				'empty-collage': __(
					'Add an image or frame before arranging the collage.',
					'photo-collage'
				),
			};

			createErrorNotice(
				messages[ error ] ||
					__(
						'The collage could not be arranged because one of its items is hidden or unavailable.',
						'photo-collage'
					),
				{ type: 'snackbar' }
			);
		},
		[ createErrorNotice ]
	);

	const showFreeformNotice = useCallback( () => {
		createSuccessNotice(
			__(
				'Free positioning enabled. Undo restores the responsive layout.',
				'photo-collage'
			),
			{
				type: 'snackbar',
				actions: [
					{
						label: __( 'Undo', 'photo-collage' ),
						onClick: undo,
					},
				],
			}
		);
	}, [ createSuccessNotice, undo ] );

	const captureCurrentFreeformSnapshot = useCallback(
		( container ) =>
			captureFreeformSnapshot( {
				container,
				parentClientId,
				parentAttributes: canvasContext.parentAttributes,
				blocks: canvasContext.blocks,
				canMoveBlock: ( blockClientId ) =>
					canvasContext.canMoveByClientId[ blockClientId ] !== false,
			} ),
		[
			canvasContext.blocks,
			canvasContext.canMoveByClientId,
			canvasContext.parentAttributes,
			parentClientId,
		]
	);

	const calculateGestureResultFromDelta = (
		gesture,
		delta,
		shiftKey = false
	) => {
		if ( gesture.operation === 'move' ) {
			gesture.lockAspectRatio = false;
			gesture.resultRect = moveCanvasRect( gesture.snapshot.rect, delta );
			gesture.resultBorderRect = moveCanvasRect(
				gesture.snapshot.borderRect,
				delta
			);
			applyMovePreview( gesture, delta );
			return;
		}

		gesture.lockAspectRatio = lockAspectRatio || shiftKey;
		const rotation = attributes.rotation || 0;
		const proposedRect = resizeCanvasRect( {
			rect: gesture.snapshot.rect,
			delta,
			rotation,
			minWidth: MIN_RESIZE_SIZE,
			minHeight: MIN_RESIZE_SIZE,
			lockAspectRatio: gesture.lockAspectRatio,
		} );
		gesture.resultRect = preserveAutoHeight
			? applyAutoHeightResizePreview( gesture, proposedRect, rotation )
			: proposedRect;
		if ( ! preserveAutoHeight ) {
			applyResizePreview( gesture, gesture.resultRect );
		}
	};

	const calculateGestureResult = ( gesture, pointerValues ) => {
		const delta = normalizePointerDelta( {
			...pointerValues,
			startClientX: gesture.startClientX,
			startClientY: gesture.startClientY,
			scaleX: gesture.snapshot.scaleX,
			scaleY: gesture.snapshot.scaleY,
		} );

		calculateGestureResultFromDelta(
			gesture,
			delta,
			pointerValues.shiftKey
		);
	};

	const flushGesturePreview = ( gesture ) => {
		if ( gesture.input !== 'pointer' || gesture.isInvalid ) {
			return;
		}

		if ( gesture.animationFrameId !== null ) {
			gesture.snapshot.ownerWindow.cancelAnimationFrame(
				gesture.animationFrameId
			);
			gesture.animationFrameId = null;
		}

		if ( ! gesture.latestPointerValues ) {
			return;
		}

		const visualDeltaX =
			gesture.latestPointerValues.clientX - gesture.startClientX;
		const visualDeltaY =
			gesture.latestPointerValues.clientY - gesture.startClientY;

		if (
			! gesture.isActive &&
			Math.hypot( visualDeltaX, visualDeltaY ) <
				POINTER_ACTIVATION_THRESHOLD
		) {
			return;
		}

		if (
			! gesture.isActive &&
			gesture.requiresFreeformSnapshot &&
			! gesture.freeformSnapshot
		) {
			const result = captureCurrentFreeformSnapshot(
				gesture.snapshot.container
			);
			if ( ! result.snapshot ) {
				gesture.isInvalid = true;
				showArrangementError( result.error );
				finishGestureRef.current?.( false );
				return;
			}
			gesture.freeformSnapshot = result.snapshot;
		}

		gesture.isActive = true;
		calculateGestureResult( gesture, gesture.latestPointerValues );
	};

	const scheduleGesturePreview = ( gesture ) => {
		if ( gesture.animationFrameId !== null ) {
			return;
		}

		gesture.animationFrameId =
			gesture.snapshot.ownerWindow.requestAnimationFrame( () => {
				gesture.animationFrameId = null;
				flushGesturePreview( gesture );
			} );
	};

	const finishGesture = ( shouldCommit, pointerValues = null ) => {
		const gesture = gestureRef.current;
		if ( ! gesture ) {
			return;
		}

		if ( pointerValues ) {
			gesture.latestPointerValues = pointerValues;
		}
		if ( gesture.input === 'pointer' ) {
			flushGesturePreview( gesture );
		}
		gestureRef.current = null;

		let promotedCount = 0;
		let updatesByClientId = null;
		if (
			shouldCommit &&
			gesture.isActive &&
			gesture.resultRect &&
			hasCanvasRectChanged( gesture.snapshot.rect, gesture.resultRect )
		) {
			// Only the dragged block changes here. The move lock is owned by the
			// transitions that make an item absolute (promotion, preset, the
			// inspector toggle), so a gesture must not rewrite it on siblings
			// the user never touched.
			if (
				gesture.operation === 'move' &&
				! gesture.snapshot.attributes.useAbsolutePosition
			) {
				const plan = createFreeformUpdatePlan( {
					snapshot: gesture.freeformSnapshot,
					movedClientId: clientId,
					movedBorderRect: gesture.resultBorderRect,
				} );
				if ( plan ) {
					updatesByClientId = plan.updatesByClientId;
					promotedCount = plan.promotedCount;
				}
			} else {
				const isAutoBasis = gesture.snapshot.heightMode === 'auto';
				const verticalBasis = isAutoBasis
					? getAutoHeightCommitBasis( gesture.snapshot )
					: gesture.snapshot.containerHeight;

				if ( gesture.operation === 'move' ) {
					updatesByClientId = {
						[ clientId ]: createMoveAttributes( {
							attributes: gesture.snapshot.attributes,
							rect: gesture.resultRect,
							containerWidth: gesture.snapshot.containerWidth,
							containerHeight: verticalBasis,
							solverHeightFraction: isAutoBasis
								? parseVerticalSlope( {
										height: gesture.snapshot.attributes
											.height,
								  } ).slope
								: null,
						} ),
					};
				} else {
					updatesByClientId = {
						[ clientId ]: createResizeAttributes( {
							attributes: gesture.snapshot.attributes,
							rect: gesture.resultRect,
							containerWidth: gesture.snapshot.containerWidth,
							containerHeight: verticalBasis,
							preserveAutoHeight,
							isAutoBasis,
						} ),
					};
				}
			}
		}

		const updateClientIds = updatesByClientId
			? Object.keys( updatesByClientId )
			: [];
		const hasUpdates = updateClientIds.length > 0;
		finishGestureDom( gesture, hasUpdates );

		if ( hasUpdates ) {
			updateBlockAttributes( updateClientIds, updatesByClientId, true );
			if ( promotedCount > 0 ) {
				showFreeformNotice();
			}
		}
	};

	finishGestureRef.current = finishGesture;

	const startGesture = ( operation, event ) => {
		if (
			event.button !== 0 ||
			event.isPrimary === false ||
			( operation === 'move' && ! canMove ) ||
			( operation === 'resize' && ! canResize ) ||
			gestureRef.current
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const element = blockRef.current;
		const snapshot = element
			? getCanvasSnapshot( element, attributes )
			: null;
		if ( ! snapshot ) {
			showArrangementError( 'child-unavailable' );
			return;
		}

		event.currentTarget.focus( { preventScroll: true } );

		const gesture = {
			input: 'pointer',
			operation,
			snapshot,
			blocks: canvasContext.blocks,
			freeformSnapshot: null,
			requiresFreeformSnapshot:
				operation === 'move' && attributes.useAbsolutePosition !== true,
			toggleSelection,
			handle: event.currentTarget,
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startClientY: event.clientY,
			latestPointerValues: getPointerValues( event ),
			resultRect: snapshot.rect,
			resultBorderRect: snapshot.borderRect,
			lockAspectRatio,
			preserveAutoHeight,
			isActive: false,
			isInvalid: false,
			isFinished: false,
			animationFrameId: null,
			escapeHandler: null,
			pointerMoveHandler: onPointerMove,
			pointerUpHandler: onPointerUp,
			pointerCancelHandler: onPointerCancel,
			didDisableSelection: true,
		};

		gesture.escapeHandler = ( keyboardEvent ) => {
			if ( keyboardEvent.key !== 'Escape' ) {
				return;
			}

			keyboardEvent.preventDefault();
			keyboardEvent.stopPropagation();
			finishGestureRef.current?.( false );
		};

		gestureRef.current = gesture;
		setInteractionState( snapshot, true, operation );
		toggleSelection( false );
		snapshot.element.ownerDocument.addEventListener(
			'keydown',
			gesture.escapeHandler,
			true
		);
		snapshot.element.ownerDocument.addEventListener(
			'pointermove',
			gesture.pointerMoveHandler,
			true
		);
		snapshot.element.ownerDocument.addEventListener(
			'pointerup',
			gesture.pointerUpHandler,
			true
		);
		snapshot.element.ownerDocument.addEventListener(
			'pointercancel',
			gesture.pointerCancelHandler,
			true
		);

		if ( event.currentTarget.setPointerCapture ) {
			event.currentTarget.setPointerCapture( event.pointerId );
		}
	};

	const onPointerMove = ( event ) => {
		const gesture = gestureRef.current;
		if ( ! gesture || gesture.pointerId !== event.pointerId ) {
			return;
		}

		event.preventDefault();
		gesture.latestPointerValues = getPointerValues( event );
		scheduleGesturePreview( gesture );
	};

	const onPointerUp = ( event ) => {
		const gesture = gestureRef.current;
		if ( ! gesture || gesture.pointerId !== event.pointerId ) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		finishGesture( true, getPointerValues( event ) );
	};

	const onPointerCancel = ( event ) => {
		const gesture = gestureRef.current;
		if ( ! gesture || gesture.pointerId !== event.pointerId ) {
			return;
		}

		finishGesture( false );
	};

	const previewKeyboardOperation = ( operation, event ) => {
		const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
		const keyboardDelta = getKeyboardMoveDelta( event.key, step );

		if (
			! keyboardDelta ||
			( operation === 'move' && ! canMove ) ||
			( operation === 'resize' && ! canResize )
		) {
			return;
		}

		if (
			gestureRef.current &&
			( gestureRef.current.input !== 'keyboard' ||
				gestureRef.current.operation !== operation )
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		let gesture = gestureRef.current;
		if ( ! gesture ) {
			const element = blockRef.current;
			const snapshot = element
				? getCanvasSnapshot( element, attributes )
				: null;
			if ( ! snapshot ) {
				showArrangementError( 'child-unavailable' );
				return;
			}

			let freeformSnapshot = null;
			if (
				operation === 'move' &&
				attributes.useAbsolutePosition !== true
			) {
				const result = captureCurrentFreeformSnapshot(
					snapshot.container
				);
				if ( ! result.snapshot ) {
					showArrangementError( result.error );
					return;
				}
				freeformSnapshot = result.snapshot;
			}

			gesture = {
				input: 'keyboard',
				operation,
				snapshot,
				blocks: canvasContext.blocks,
				freeformSnapshot,
				toggleSelection,
				handle: event.currentTarget,
				resultRect: snapshot.rect,
				resultBorderRect: snapshot.borderRect,
				lockAspectRatio,
				preserveAutoHeight,
				isActive: true,
				isFinished: false,
				animationFrameId: null,
				escapeHandler: null,
				pointerMoveHandler: null,
				pointerUpHandler: null,
				pointerCancelHandler: null,
				didDisableSelection: false,
				keyboardDelta: { x: 0, y: 0 },
				pressedKeys: new Set(),
			};
			gesture.escapeHandler = ( keyboardEvent ) => {
				if ( keyboardEvent.key !== 'Escape' ) {
					return;
				}
				keyboardEvent.preventDefault();
				keyboardEvent.stopPropagation();
				finishGestureRef.current?.( false );
			};
			gestureRef.current = gesture;
			setInteractionState( snapshot, true, operation );
			snapshot.element.ownerDocument.addEventListener(
				'keydown',
				gesture.escapeHandler,
				true
			);
		}

		gesture.pressedKeys.add( event.key );
		gesture.keyboardDelta = {
			x: gesture.keyboardDelta.x + keyboardDelta.x,
			y: gesture.keyboardDelta.y + keyboardDelta.y,
		};
		const canvasDelta =
			operation === 'resize'
				? projectLocalDeltaToCanvasAxes(
						gesture.keyboardDelta,
						attributes.rotation || 0
				  )
				: gesture.keyboardDelta;
		calculateGestureResultFromDelta( gesture, canvasDelta, event.shiftKey );
	};

	const finishKeyboardOperation = ( operation, event ) => {
		const gesture = gestureRef.current;
		if (
			! getKeyboardMoveDelta( event.key, KEYBOARD_STEP ) ||
			! gesture ||
			gesture.input !== 'keyboard' ||
			gesture.operation !== operation
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		gesture.pressedKeys.delete( event.key );
		if ( gesture.pressedKeys.size === 0 ) {
			finishGesture( true );
		}
	};

	const commitKeyboardOperationOnBlur = () => {
		if ( gestureRef.current?.input === 'keyboard' ) {
			finishGesture( true );
		}
	};

	useEffect( () => {
		return () => {
			const gesture = gestureRef.current;
			if ( ! gesture ) {
				return;
			}

			gestureRef.current = null;
			finishGestureDom( gesture );
		};
	}, [] );

	useLayoutEffect( () => {
		const element = blockRef.current;
		if ( ! element || ! controlsVisible ) {
			return undefined;
		}

		element.classList.add( 'has-photo-collage-canvas-controls' );
		return () => {
			element.classList.remove( 'has-photo-collage-canvas-controls' );
		};
	} );

	if ( ! controlsVisible ) {
		return null;
	}

	const moveHelp =
		attributes.useAbsolutePosition === true
			? sprintf(
					/* translators: %s is the collage item type. */
					__(
						'Move %s on canvas. Drag, or use arrow keys for precise movement.',
						'photo-collage'
					),
					itemName
			  )
			: sprintf(
					/* translators: %s is the collage item type. */
					__(
						'Move %s on canvas. This makes the collage freeform while keeping every other item in place. Use arrow keys for precise movement.',
						'photo-collage'
					),
					itemName
			  );
	let resizeHelp;
	if ( lockAspectRatio ) {
		resizeHelp = sprintf(
			/* translators: %s is the collage item type. */
			__(
				'Drag to resize %s proportionally. Use arrow keys for precise resizing.',
				'photo-collage'
			),
			itemName
		);
	} else {
		resizeHelp = sprintf(
			/* translators: %s is the collage item type. */
			__(
				'Drag to resize %s. Use arrow keys for precise resizing. Hold Shift to preserve its proportions.',
				'photo-collage'
			),
			itemName
		);
	}
	const counterRotation = `${ -( attributes.rotation || 0 ) }deg`;
	const sharedPointerHandlers = {
		onPointerMove,
		onPointerUp,
		onPointerCancel,
	};
	const instructionsId = `photo-collage-canvas-instructions-${ clientId }`;

	return (
		<div
			className="photo-collage-canvas-controls"
			style={ {
				'--photo-collage-control-counter-rotation': counterRotation,
			} }
			data-pc-canvas-controls
		>
			<span id={ instructionsId } className="screen-reader-text">
				{ __(
					'Arrow keys change the item by one pixel. Hold Shift for ten pixels. Escape cancels the current change.',
					'photo-collage'
				) }
			</span>
			{ canMove && (
				<Tooltip text={ moveHelp }>
					<span className="photo-collage-canvas-control-tooltip">
						<button
							type="button"
							className="photo-collage-canvas-control photo-collage-canvas-control--move"
							aria-label={ moveHelp }
							aria-describedby={ instructionsId }
							data-pc-canvas-control="move"
							onDragStart={ ( event ) => {
								event.preventDefault();
								event.stopPropagation();
							} }
							onPointerDown={ ( event ) =>
								startGesture( 'move', event )
							}
							onKeyDown={ ( event ) =>
								previewKeyboardOperation( 'move', event )
							}
							onKeyUp={ ( event ) =>
								finishKeyboardOperation( 'move', event )
							}
							onBlur={ commitKeyboardOperationOnBlur }
							{ ...sharedPointerHandlers }
						>
							<Icon icon={ MOVE_CANVAS_ICON } size={ 18 } />
						</button>
					</span>
				</Tooltip>
			) }
			{ canResize && (
				<Tooltip text={ resizeHelp }>
					<span className="photo-collage-canvas-control-tooltip photo-collage-canvas-control-tooltip--resize">
						<button
							type="button"
							className="photo-collage-canvas-control photo-collage-canvas-control--resize"
							aria-label={ resizeHelp }
							aria-describedby={ instructionsId }
							data-pc-canvas-control="resize"
							onDragStart={ ( event ) => {
								event.preventDefault();
								event.stopPropagation();
							} }
							onPointerDown={ ( event ) =>
								startGesture( 'resize', event )
							}
							onKeyDown={ ( event ) =>
								previewKeyboardOperation( 'resize', event )
							}
							onKeyUp={ ( event ) =>
								finishKeyboardOperation( 'resize', event )
							}
							onBlur={ commitKeyboardOperationOnBlur }
							{ ...sharedPointerHandlers }
						/>
					</span>
				</Tooltip>
			) }
		</div>
	);
}
