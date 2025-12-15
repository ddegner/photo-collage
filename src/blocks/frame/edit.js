import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import BackgroundControls from '../components/BackgroundControls';
import AbsolutePositionControls from '../components/AbsolutePositionControls';
import BoxControl from '../components/BoxControl';
import { getBackgroundStyle } from '../utils/background-styles';
import { getBlockStyles } from '../utils/positioning-styles';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const {
		useAbsolutePosition,
		top,
		right,
		bottom,
		left,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		zIndex,
		width,
		height,
		rotation = 0,
		opacity = 1,
	} = attributes;

	const instanceId = useInstanceId( Edit );

	const blockProps = useBlockProps( {
		style: getBlockStyles( attributes, getBackgroundStyle ),
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		// allow any blocks inside frame
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Dimensions', 'photo-collage' ) }
					initialOpen={ true }
				>
					<UnitControl
						label={ __( 'Width', 'photo-collage' ) }
						id={ `inspector-frame-width-${ instanceId }` }
						value={ width }
						onChange={ ( value ) =>
							setAttributes( { width: value } )
						}
						__next40pxDefaultSize={ true }
					/>
					<UnitControl
						label={ __( 'Height', 'photo-collage' ) }
						id={ `inspector-frame-height-${ instanceId }` }
						value={ height }
						onChange={ ( value ) =>
							setAttributes( { height: value } )
						}
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Positioning', 'photo-collage' ) }
					initialOpen={ true }
				>
					<ToggleControl
						label={ __(
							'Use Absolute Positioning',
							'photo-collage'
						) }
						id={ `inspector-frame-absolute-position-${ instanceId }` }
						help={ __(
							'Position frame relative to container edges instead of using margins.',
							'photo-collage'
						) }
						checked={ useAbsolutePosition }
						onChange={ ( value ) =>
							setAttributes( { useAbsolutePosition: value } )
						}
						__nextHasNoMarginBottom={ true }
					/>
					{ useAbsolutePosition && (
						<AbsolutePositionControls
							top={ top }
							right={ right }
							bottom={ bottom }
							left={ left }
							setAttributes={ setAttributes }
							instanceId={ instanceId }
							idPrefix="inspector-frame"
						/>
					) }
					{ ! useAbsolutePosition && (
						<BoxControl
							values={ {
								top: marginTop,
								right: marginRight,
								bottom: marginBottom,
								left: marginLeft,
							} }
							onChange={ ( side, value ) => {
								const key = `margin${
									side.charAt( 0 ).toUpperCase() +
									side.slice( 1 )
								}`;
								setAttributes( { [ key ]: value } );
							} }
							centerLabel="M"
							isDashed={ true }
						/>
					) }
					<div className="photo-collage-z-index-control">
						<RangeControl
							label={ __(
								'Z-Index (Layer Order)',
								'photo-collage'
							) }
							id={ `inspector-frame-z-index-${ instanceId }` }
							value={ zIndex }
							onChange={ ( value ) =>
								setAttributes( { zIndex: value } )
							}
							min={ -10 }
							max={ 100 }
							help={ __(
								'Higher numbers are on top.',
								'photo-collage'
							) }
							__next40pxDefaultSize={ true }
							__nextHasNoMarginBottom={ true }
						/>
						<div className="photo-collage-z-index-buttons">
							<Button
								variant="secondary"
								size="small"
								onClick={ () =>
									setAttributes( { zIndex: zIndex - 1 } )
								}
								icon="minus"
								label={ __( 'Move Backward', 'photo-collage' ) }
							/>
							<Button
								variant="secondary"
								size="small"
								onClick={ () =>
									setAttributes( { zIndex: zIndex + 1 } )
								}
								icon="plus"
								label={ __( 'Move Forward', 'photo-collage' ) }
							/>
						</div>
					</div>
				</PanelBody>

				<PanelBody
					title={ __( 'Effects', 'photo-collage' ) }
					initialOpen={ true }
				>
					<RangeControl
						label={ __( 'Rotation', 'photo-collage' ) }
						value={ rotation }
						onChange={ ( value ) =>
							setAttributes( { rotation: value } )
						}
						min={ -360 }
						max={ 360 }
						__next40pxDefaultSize={ true }
					/>
					<RangeControl
						label={ __( 'Opacity', 'photo-collage' ) }
						value={ opacity }
						onChange={ ( value ) =>
							setAttributes( { opacity: value } )
						}
						min={ 0 }
						max={ 1 }
						step={ 0.1 }
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Background', 'photo-collage' ) }
					initialOpen={ false }
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
