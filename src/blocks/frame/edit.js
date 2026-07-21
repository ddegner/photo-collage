import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import { PanelBody, RangeControl } from '@wordpress/components';
import BackgroundControls from '../components/BackgroundControls';
import PositionSizeControls from '../components/PositionSizeControls';
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
					title={ __( 'Effects', 'photo-collage' ) }
					initialOpen={ true }
				>
					<RangeControl
						label={ __( 'Rotation', 'photo-collage' ) }
						value={ rotation }
						onChange={ ( value ) =>
							setAttributes( { rotation: value } )
						}
						min={ -180 }
						max={ 180 }
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
					title={ __( 'Background Image', 'photo-collage' ) }
					initialOpen={ false }
				>
					<BackgroundControls
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody
					title={ __( 'Position and Size', 'photo-collage' ) }
					initialOpen={ true }
					className="photo-collage-position-size-panel"
				>
					<PositionSizeControls
						width={ width }
						height={ height }
						useAbsolutePosition={ useAbsolutePosition }
						top={ top }
						right={ right }
						bottom={ bottom }
						left={ left }
						zIndex={ zIndex }
						setAttributes={ setAttributes }
						instanceId={ instanceId }
						idPrefix="inspector-frame"
						positioningHelp={ __(
							'Position frame relative to container edges instead of using margins.',
							'photo-collage'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
