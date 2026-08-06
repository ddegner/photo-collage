import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	// WordPress core currently exposes ConfirmDialog only via this export.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalConfirmDialog as ConfirmDialog,
	// WordPress core currently exposes UnitControl only via this export.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import BackgroundControls from '../components/BackgroundControls';
import { getBackgroundStyle } from '../utils/background-styles';
import { CANVAS_ARRANGE_FREELY_REQUEST_EVENT } from '../utils/canvas-events';
import {
	CANVAS_INTERACTION_ATTRIBUTE,
	CANVAS_GEOMETRY_CHANGE_EVENT,
} from '../utils/canvas-geometry';
import {
	captureFreeformSnapshot,
	createFreeformUpdatePlan,
} from '../utils/canvas-freeform';
import {
	captureProportionalSnapshot,
	createProportionalUpdatePlan,
} from '../utils/canvas-proportional';
import { attachAutoHeight, clearAutoHeight } from './auto-height';
import {
	COLLAGE_GEOMETRY_UNITS,
	COLLAGE_LAYOUT_STATE,
	getCollageGeometryUnits,
	getCollageLayoutState,
} from './layout-mode';
import { PRESET_BUTTONS } from './presets';
import { usePresets } from './use-presets';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'photo-collage/image', 'photo-collage/frame' ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { stackOnMobile, containerHeight, heightMode = 'fixed' } = attributes;
	const containerRef = useRef( null );
	// Height to seed the container with when a conversion flips it to auto:
	// applied in the layout effect below, after React's own style diff has
	// removed the fixed height but before the browser paints.
	const pendingProjectedHeightRef = useRef( null );
	const { blocks, canMoveByClientId, layoutState, positionableCount } =
		useSelect(
			( select ) => {
				const { canMoveBlock, getBlocks } = select( blockEditorStore );
				const directChildren = getBlocks( clientId ) || [];
				const positionable = directChildren.filter( ( block ) =>
					ALLOWED_BLOCKS.includes( block.name )
				);
				const movable = {};

				positionable.forEach( ( block ) => {
					movable[ block.clientId ] = canMoveBlock( block.clientId );
				} );

				return {
					blocks: positionable,
					canMoveByClientId: movable,
					layoutState: getCollageLayoutState( directChildren ),
					positionableCount: positionable.length,
				};
			},
			[ clientId ]
		);
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const { createErrorNotice, createSuccessNotice } =
		useDispatch( noticesStore );
	const { undo } = useDispatch( coreStore );

	// Derived from live attributes, never stored, so it cannot drift.
	const geometryUnits = getCollageGeometryUnits( blocks, attributes );

	const backgroundStyle = getBackgroundStyle( attributes );
	const containerClassName = [
		stackOnMobile ? 'is-stack-on-mobile' : '',
		heightMode === 'auto' ? 'is-height-auto' : '',
	]
		.filter( Boolean )
		.join( ' ' );

	const blockProps = useBlockProps( {
		ref: containerRef,
		className: containerClassName,
		'data-height-mode': heightMode,
		style: {
			height: heightMode === 'fixed' ? containerHeight : undefined,
			minHeight: '200px',
			...backgroundStyle,
		},
	} );

	const { applyPreset, pendingRemovalCount, confirmPreset, cancelPreset } =
		usePresets( {
			clientId,
			heightMode,
			containerHeight,
			setAttributes,
		} );

	useLayoutEffect( () => {
		const containerElement = containerRef.current;
		if ( ! containerElement ) {
			return undefined;
		}

		if ( heightMode !== 'auto' ) {
			pendingProjectedHeightRef.current = null;
			// Re-apply the fixed height instead of clearing it: React committed
			// it via blockProps before this effect runs, and it won't re-apply
			// an unchanged value on later renders once removed from the DOM.
			if ( heightMode === 'fixed' && containerHeight ) {
				containerElement.style.height = containerHeight;
			} else {
				clearAutoHeight( containerElement );
			}
			return undefined;
		}

		if ( pendingProjectedHeightRef.current !== null ) {
			containerElement.style.height = `${ pendingProjectedHeightRef.current }px`;
			pendingProjectedHeightRef.current = null;
		}

		return attachAutoHeight( containerElement, {
			watchMutations: true,
			watchResize: true,
		} );
	}, [ heightMode, containerHeight, stackOnMobile, clientId ] );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: [ [ 'photo-collage/image' ], [ 'photo-collage/image' ] ],
		orientation: 'horizontal',
	} );

	/**
	 * Apply a per-client update map as one undoable transaction.
	 *
	 * Auto-height measurement is held until the new coordinates have painted,
	 * then resumed through the geometry-change event.
	 */
	const commitPlanUpdates = useCallback(
		( container, updatesByClientId, successMessage ) => {
			const clientIds = Object.keys( updatesByClientId );
			if ( clientIds.length === 0 ) {
				return false;
			}

			container.setAttribute( CANVAS_INTERACTION_ATTRIBUTE, 'true' );
			updateBlockAttributes( clientIds, updatesByClientId, true );
			container.ownerDocument.defaultView.requestAnimationFrame( () => {
				container.removeAttribute( CANVAS_INTERACTION_ATTRIBUTE );
				container.dispatchEvent(
					new container.ownerDocument.defaultView.CustomEvent(
						CANVAS_GEOMETRY_CHANGE_EVENT
					)
				);
			} );

			if ( successMessage ) {
				createSuccessNotice( successMessage, {
					type: 'snackbar',
					actions: [
						{ label: __( 'Undo', 'photo-collage' ), onClick: undo },
					],
				} );
			}

			return true;
		},
		[ createSuccessNotice, undo, updateBlockAttributes ]
	);

	/**
	 * Promote every direct child to canvas coordinates in one transaction.
	 *
	 * Lives on the container because that is what owns both the DOM element the
	 * geometry is measured from and the child list the plan is built over.
	 */
	const arrangeFreely = useCallback( () => {
		const container = containerRef.current;
		const { snapshot, error } = captureFreeformSnapshot( {
			container,
			parentClientId: clientId,
			parentAttributes: attributes,
			blocks,
			canMoveBlock: ( blockClientId ) =>
				canMoveByClientId[ blockClientId ] !== false,
		} );

		if ( ! snapshot ) {
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
			return;
		}

		const plan = createFreeformUpdatePlan( { snapshot } );
		if ( ! plan ) {
			return;
		}

		commitPlanUpdates(
			container,
			plan.updatesByClientId,
			plan.promotedCount > 0
				? __(
						'Free positioning enabled. Undo restores the responsive layout.',
						'photo-collage'
				  )
				: null
		);
	}, [
		attributes,
		blocks,
		canMoveByClientId,
		clientId,
		commitPlanUpdates,
		createErrorNotice,
	] );

	/**
	 * Re-express stored pixel positions as percentages in one transaction.
	 *
	 * The layout is visually unchanged at the current width; it simply starts
	 * scaling with the container from here on.
	 */
	const convertToProportional = useCallback( () => {
		const container = containerRef.current;
		const { snapshot, error } = captureProportionalSnapshot( {
			container,
			parentClientId: clientId,
			parentAttributes: attributes,
			blocks,
		} );

		if ( ! snapshot ) {
			const messages = {
				'nothing-to-convert': __(
					'Position an image or frame on the canvas before converting.',
					'photo-collage'
				),
				'no-height-anchor': __(
					'Give at least one item an automatic or pixel height first — an all-percentage collage would collapse to its minimum height.',
					'photo-collage'
				),
			};

			createErrorNotice(
				messages[ error ] ||
					__(
						'The collage could not be converted because one of its items is hidden or unavailable.',
						'photo-collage'
					),
				{ type: 'snackbar' }
			);
			return;
		}

		const plan = createProportionalUpdatePlan( { snapshot } );
		if ( ! plan ) {
			return;
		}

		// Seed the projected height so children never paint at percentages
		// of the stale fixed height: React's style diff clears the inline
		// fixed height in the same commit, so the seed must be re-applied
		// from the layout effect, not written to the DOM here.
		if ( plan.updatesByClientId[ clientId ]?.heightMode === 'auto' ) {
			pendingProjectedHeightRef.current = plan.projectedHeight;
		}

		const committed = commitPlanUpdates(
			container,
			plan.updatesByClientId,
			__(
				'Proportional sizing enabled — positions now scale with the container width. Undo restores the previous layout.',
				'photo-collage'
			)
		);

		if ( ! committed ) {
			pendingProjectedHeightRef.current = null;
			createErrorNotice(
				__(
					'Nothing could be converted — the remaining pixel offsets sit too close to the container edge to become percentages.',
					'photo-collage'
				),
				{ type: 'snackbar' }
			);
		}
	}, [ attributes, blocks, clientId, commitPlanUpdates, createErrorNotice ] );

	// Child blocks ask for the conversion by dispatching on this element, which
	// keeps their inspector controls independent of the container component.
	useEffect( () => {
		const container = containerRef.current;
		if ( ! container ) {
			return undefined;
		}

		const onRequest = ( event ) => {
			if (
				event.detail?.containerClientId &&
				event.detail.containerClientId !== clientId
			) {
				return;
			}

			event.stopImmediatePropagation();
			arrangeFreely();
		};

		container.addEventListener(
			CANVAS_ARRANGE_FREELY_REQUEST_EVENT,
			onRequest
		);
		return () => {
			container.removeEventListener(
				CANVAS_ARRANGE_FREELY_REQUEST_EVENT,
				onRequest
			);
		};
	}, [ arrangeFreely, clientId ] );

	const layoutStateLabels = {
		[ COLLAGE_LAYOUT_STATE.RESPONSIVE ]: __(
			'Responsive layout',
			'photo-collage'
		),
		[ COLLAGE_LAYOUT_STATE.MIXED ]: __(
			'Mixed positioning',
			'photo-collage'
		),
		[ COLLAGE_LAYOUT_STATE.FREEFORM ]: __(
			'Freeform layout',
			'photo-collage'
		),
	};

	return (
		<>
			<ConfirmDialog
				isOpen={ pendingRemovalCount > 0 }
				title={ __( 'Apply layout?', 'photo-collage' ) }
				confirmButtonText={ __( 'Remove and Apply', 'photo-collage' ) }
				cancelButtonText={ __(
					'Keep Current Layout',
					'photo-collage'
				) }
				onConfirm={ confirmPreset }
				onCancel={ cancelPreset }
			>
				<p>
					{ sprintf(
						/* translators: %d: number of image blocks that will be removed */
						_n(
							'This layout has fewer image positions than the current collage. Applying it will remove %d image block. Frames and all other content will be kept.',
							'This layout has fewer image positions than the current collage. Applying it will remove %d image blocks. Frames and all other content will be kept.',
							pendingRemovalCount,
							'photo-collage'
						),
						pendingRemovalCount
					) }
				</p>
			</ConfirmDialog>
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
								<span>{ btn.label }</span>
							</Button>
						) ) }
					</div>
				</PanelBody>
				<PanelBody
					title={ __( 'Container Settings', 'photo-collage' ) }
				>
					<p className="photo-collage-layout-mode-help">
						{ sprintf(
							/* translators: %s: current collage layout mode */
							__( 'Positioning: %s', 'photo-collage' ),
							layoutStateLabels[ layoutState ]
						) }
					</p>
					{ positionableCount > 0 &&
						layoutState !== COLLAGE_LAYOUT_STATE.FREEFORM && (
							<Button
								variant="secondary"
								onClick={ arrangeFreely }
								data-pc-arrange-freely
							>
								{ __(
									'Arrange collage freely',
									'photo-collage'
								) }
							</Button>
						) }
					{ geometryUnits !== null &&
						geometryUnits !==
							COLLAGE_GEOMETRY_UNITS.PROPORTIONAL && (
							<>
								<Button
									variant="secondary"
									onClick={ convertToProportional }
									data-pc-convert-proportional
								>
									{ __(
										'Convert to proportional',
										'photo-collage'
									) }
								</Button>
								<p className="photo-collage-layout-mode-help">
									{ __(
										'Rewrites pixel positions as percentages so the layout keeps its proportions at every screen width.',
										'photo-collage'
									) }
								</p>
							</>
						) }
					{ /* Future direction (deferred by design): an aspect-ratio
					     height mode that fixes the canvas to width * ratio
					     without depending on child geometry. */ }
					<SelectControl
						label={ __( 'Height Mode', 'photo-collage' ) }
						value={ heightMode }
						options={ [
							{
								label: __( 'Fixed Height', 'photo-collage' ),
								value: 'fixed',
							},
							{
								label: __( 'Auto Height', 'photo-collage' ),
								value: 'auto',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { heightMode: value } )
						}
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
					{ heightMode === 'fixed' ? (
						<UnitControl
							label={ __( 'Container Height', 'photo-collage' ) }
							value={ containerHeight }
							onChange={ ( value ) =>
								setAttributes( { containerHeight: value } )
							}
							__next40pxDefaultSize={ true }
							help={ __(
								'Set an explicit canvas height for absolute layouts. A pixel height does not scale when the page width changes; use Auto Height (or a vw value) for a proportional collage.',
								'photo-collage'
							) }
						/>
					) : (
						<p className="photo-collage-height-mode-help">
							{ __(
								'Automatically sizes the container to fit absolute-positioned items.',
								'photo-collage'
							) }
						</p>
					) }
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
						__nextHasNoMarginBottom={ true }
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Background Image', 'photo-collage' ) }
					initialOpen={ true }
				>
					<BackgroundControls
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
