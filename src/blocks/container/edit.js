import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	// WordPress core currently exposes UnitControl only via this export.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import BackgroundControls from '../components/BackgroundControls';
import { getBackgroundStyle } from '../utils/background-styles';
import { attachAutoHeight, clearAutoHeight } from './auto-height';
import { PRESET_BUTTONS } from './presets';
import { usePresets } from './use-presets';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'photo-collage/image', 'photo-collage/frame' ];
const AUTO_RATIO_PRECISION = 1000000;
const AUTO_RATIO_TOLERANCE = 0.0005;

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		stackOnMobile,
		containerHeight,
		heightMode = 'fixed',
		autoHeightRatio = 0,
	} = attributes;
	const containerRef = useRef( null );
	const pendingAutoRatioRef = useRef( 0 );
	const lastPersistedAutoRatioRef = useRef( 0 );
	const hasPersistedForCurrentSaveRef = useRef( false );

	const { isSavingPost, isAutosavingPost } = useSelect( ( select ) => {
		const editorStore = select( 'core/editor' );
		return {
			isSavingPost: editorStore?.isSavingPost?.() ?? false,
			isAutosavingPost: editorStore?.isAutosavingPost?.() ?? false,
		};
	}, [] );

	const backgroundStyle = getBackgroundStyle( attributes );
	const containerClassName = [
		stackOnMobile ? 'is-stack-on-mobile' : '',
		heightMode === 'auto' ? 'is-height-auto' : '',
	]
		.filter( Boolean )
		.join( ' ' );
	const hasAutoHeightRatio =
		Number.isFinite( autoHeightRatio ) && autoHeightRatio > 0;

	const blockProps = useBlockProps( {
		ref: containerRef,
		className: containerClassName,
		'data-height-mode': heightMode,
		style: {
			height: heightMode === 'fixed' ? containerHeight : undefined,
			aspectRatio:
				heightMode === 'auto' && hasAutoHeightRatio
					? String( autoHeightRatio )
					: undefined,
			minHeight: '200px',
			...backgroundStyle,
		},
	} );

	const { applyPreset } = usePresets( {
		clientId,
		heightMode,
		containerHeight,
		setAttributes,
	} );

	useEffect( () => {
		const persistedRatio = hasAutoHeightRatio ? autoHeightRatio : 0;
		lastPersistedAutoRatioRef.current = persistedRatio;
		if ( pendingAutoRatioRef.current <= 0 ) {
			pendingAutoRatioRef.current = persistedRatio;
		}
	}, [ autoHeightRatio, hasAutoHeightRatio ] );

	const handleAutoHeightResolved = useCallback(
		( { ratio } ) => {
			if (
				heightMode !== 'auto' ||
				! Number.isFinite( ratio ) ||
				ratio <= 0
			) {
				return;
			}

			const roundedRatio =
				Math.round( ratio * AUTO_RATIO_PRECISION ) /
				AUTO_RATIO_PRECISION;
			pendingAutoRatioRef.current = roundedRatio;
		},
		[ heightMode ]
	);

	useEffect( () => {
		if ( ! isSavingPost ) {
			hasPersistedForCurrentSaveRef.current = false;
			return;
		}

		if ( hasPersistedForCurrentSaveRef.current ) {
			return;
		}
		hasPersistedForCurrentSaveRef.current = true;

		if ( isAutosavingPost || heightMode !== 'auto' ) {
			return;
		}

		const pendingRatio = pendingAutoRatioRef.current || 0;
		const lastPersistedRatio = lastPersistedAutoRatioRef.current || 0;

		if (
			! Number.isFinite( pendingRatio ) ||
			pendingRatio <= 0 ||
			Math.abs( pendingRatio - lastPersistedRatio ) < AUTO_RATIO_TOLERANCE
		) {
			return;
		}

		lastPersistedAutoRatioRef.current = pendingRatio;
		setAttributes( { autoHeightRatio: pendingRatio } );
	}, [ heightMode, isAutosavingPost, isSavingPost, setAttributes ] );

	useEffect( () => {
		const containerElement = containerRef.current;
		if ( ! containerElement ) {
			return undefined;
		}

		if ( heightMode !== 'auto' ) {
			clearAutoHeight( containerElement );
			return undefined;
		}

		return attachAutoHeight( containerElement, {
			watchMutations: true,
			watchResize: true,
			onHeightResolved: handleAutoHeightResolved,
		} );
	}, [ heightMode, stackOnMobile, clientId, handleAutoHeightResolved ] );

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
								<span>{ btn.label }</span>
							</Button>
						) ) }
					</div>
				</PanelBody>
				<PanelBody
					title={ __( 'Container Settings', 'photo-collage' ) }
				>
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
								'Set an explicit canvas height for absolute layouts.',
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
