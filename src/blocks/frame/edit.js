import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import { PanelBody, RangeControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import BackgroundControls from '../components/BackgroundControls';
import CanvasParentNotice from '../components/CanvasParentNotice';
import CanvasTransformControls from '../components/CanvasTransformControls';
import PositionSizeControls from '../components/PositionSizeControls';
import useCanvasParent from '../components/useCanvasParent';
import { getBackgroundStyle } from '../utils/background-styles';
import { requestArrangeFreely } from '../utils/canvas-events';
import { getBlockStyles } from '../utils/positioning-styles';
import './editor.scss';

export default function Edit( {
	attributes,
	setAttributes,
	isSelected,
	clientId,
} ) {
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
	const blockRef = useRef( null );
	const { isDirectCanvasChild, parentClientId } = useCanvasParent( clientId );
	const onArrangeFreely = () =>
		requestArrangeFreely( blockRef.current, {
			containerClientId: parentClientId,
			sourceClientId: clientId,
		} );

	const blockProps = useBlockProps( {
		ref: blockRef,
		...( isDirectCanvasChild ? { draggable: false } : {} ),
		className: useAbsolutePosition ? 'is-pc-absolute' : undefined,
		style: getBlockStyles( attributes, getBackgroundStyle ),
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		// allow any blocks inside frame
	} );
	const { children: innerBlocks, ...innerBlocksRootProps } = innerBlocksProps;

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
						lock={ attributes.lock }
						rotation={ rotation }
						setAttributes={ setAttributes }
						onArrangeFreely={
							isDirectCanvasChild ? onArrangeFreely : undefined
						}
						instanceId={ instanceId }
						idPrefix="inspector-frame"
						positioningHelp={
							useAbsolutePosition
								? __(
										'Place this frame freely on the collage canvas. Turn this off to return this item to the responsive layout.',
										'photo-collage'
								  )
								: __(
										'Keep frames responsive and reorderable. Enabling this preserves every item in place and makes the collage freeform.',
										'photo-collage'
								  )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksRootProps }>
				<CanvasParentNotice
					isDirectCanvasChild={ isDirectCanvasChild }
					itemName={ __( 'frame', 'photo-collage' ) }
				/>
				{ innerBlocks }
				<CanvasTransformControls
					attributes={ attributes }
					clientId={ clientId }
					parentClientId={ parentClientId }
					isSelected={ isSelected }
					blockRef={ blockRef }
					itemName={ __( 'frame', 'photo-collage' ) }
				/>
			</div>
		</>
	);
}
