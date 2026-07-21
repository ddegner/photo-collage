import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
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
import { useEffect, useRef } from '@wordpress/element';
import BackgroundControls from '../components/BackgroundControls';
import { getBackgroundStyle } from '../utils/background-styles';
import { attachAutoHeight, clearAutoHeight } from './auto-height';
import { PRESET_BUTTONS } from './presets';
import { usePresets } from './use-presets';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'photo-collage/image', 'photo-collage/frame' ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { stackOnMobile, containerHeight, heightMode = 'fixed' } = attributes;
	const containerRef = useRef( null );

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

	useEffect( () => {
		const containerElement = containerRef.current;
		if ( ! containerElement ) {
			return undefined;
		}

		if ( heightMode !== 'auto' ) {
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

		return attachAutoHeight( containerElement, {
			watchMutations: true,
			watchResize: true,
		} );
	}, [ heightMode, containerHeight, stackOnMobile, clientId ] );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: [ [ 'photo-collage/image' ], [ 'photo-collage/image' ] ],
	} );

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
