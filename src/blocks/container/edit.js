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
import {
	normalizeAutoHeightHint,
	toPixelAutoHeightHint,
} from './auto-height-hint';
import { PRESET_BUTTONS } from './presets';
import { usePresets } from './use-presets';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'photo-collage/image', 'photo-collage/frame' ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		stackOnMobile,
		containerHeight,
		heightMode = 'fixed',
		autoHeightHint = '',
	} = attributes;
	const containerRef = useRef( null );
	const pendingAutoHeightHintRef = useRef( '' );
	const hasPersistedForCurrentSaveRef = useRef( false );
	const normalizedAutoHeightHint = normalizeAutoHeightHint( autoHeightHint );

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

	const blockProps = useBlockProps( {
		ref: containerRef,
		className: containerClassName,
		'data-height-mode': heightMode,
		style: {
			height:
				heightMode === 'fixed'
					? containerHeight
					: normalizedAutoHeightHint || undefined,
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
		pendingAutoHeightHintRef.current = normalizedAutoHeightHint;
	}, [ normalizedAutoHeightHint ] );

	const handleAutoHeightResolved = useCallback(
		( { height } ) => {
			if ( heightMode !== 'auto' ) {
				return;
			}

			pendingAutoHeightHintRef.current = toPixelAutoHeightHint( height );
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

		const pendingHint = normalizeAutoHeightHint(
			pendingAutoHeightHintRef.current
		);

		if ( ! pendingHint || pendingHint === normalizedAutoHeightHint ) {
			return;
		}

		setAttributes( { autoHeightHint: pendingHint } );
	}, [
		heightMode,
		isAutosavingPost,
		isSavingPost,
		normalizedAutoHeightHint,
		setAttributes,
	] );

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
