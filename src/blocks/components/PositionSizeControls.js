import { __ } from '@wordpress/i18n';
import {
	Button,
	RangeControl,
	ToggleControl,
	// WordPress core currently exposes UnitControl only via this export.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import AbsolutePositionControls from './AbsolutePositionControls';
import { removeMoveLock } from '../utils/canvas-geometry';
import './position-size-controls.scss';

/**
 * Shared position and size controls for collage images and frames.
 *
 * @param {Object}   props                     Component props.
 * @param {string}   props.width               Block width.
 * @param {string}   props.height              Block height.
 * @param {boolean}  props.useAbsolutePosition Whether absolute positioning is enabled.
 * @param {string}   props.top                 Top position.
 * @param {string}   props.right               Right position.
 * @param {string}   props.bottom              Bottom position.
 * @param {string}   props.left                Left position.
 * @param {number}   props.zIndex              Layer order.
 * @param {Object}   props.lock                Core block lock settings.
 * @param {number}   props.rotation            Rotation in degrees.
 * @param {Function} props.setAttributes       Block attribute setter.
 * @param {Function} props.onArrangeFreely     Safe whole-collage conversion.
 * @param {string}   props.instanceId          Unique control instance id.
 * @param {string}   props.idPrefix            Control id prefix.
 * @param {string}   props.positioningHelp     Help text for positioning mode.
 * @return {Element} Position and size controls.
 */
export default function PositionSizeControls( {
	width,
	height,
	useAbsolutePosition,
	top,
	right,
	bottom,
	left,
	zIndex,
	lock,
	rotation = 0,
	setAttributes,
	onArrangeFreely,
	instanceId,
	idPrefix,
	positioningHelp,
} ) {
	const onChangePositioning = ( value ) => {
		if ( value && ! useAbsolutePosition && onArrangeFreely ) {
			onArrangeFreely();
			return;
		}

		setAttributes( {
			useAbsolutePosition: value,
			...( value ? {} : { lock: removeMoveLock( lock ) } ),
		} );
	};

	return (
		<>
			<div
				className="photo-collage-dimensions-row"
				style={ { display: 'flex', gap: '10px' } }
			>
				<UnitControl
					label={ __( 'Width', 'photo-collage' ) }
					id={ `${ idPrefix }-width-${ instanceId }` }
					value={ width }
					onChange={ ( value ) => setAttributes( { width: value } ) }
					__next40pxDefaultSize={ true }
				/>
				<UnitControl
					label={ __( 'Height', 'photo-collage' ) }
					id={ `${ idPrefix }-height-${ instanceId }` }
					value={ height }
					onChange={ ( value ) => setAttributes( { height: value } ) }
					__next40pxDefaultSize={ true }
				/>
			</div>
			<ToggleControl
				label={ __( 'Free positioning', 'photo-collage' ) }
				id={ `${ idPrefix }-absolute-position-${ instanceId }` }
				help={ positioningHelp }
				checked={ useAbsolutePosition }
				onChange={ onChangePositioning }
				__nextHasNoMarginBottom={ true }
			/>
			{ ! useAbsolutePosition &&
				Math.abs( rotation ) > Number.EPSILON && (
					<p className="components-base-control__help">
						{ __(
							'Enable free positioning before resizing a rotated item on the canvas.',
							'photo-collage'
						) }
					</p>
				) }
			{ useAbsolutePosition && (
				<AbsolutePositionControls
					top={ top }
					right={ right }
					bottom={ bottom }
					left={ left }
					setAttributes={ setAttributes }
					instanceId={ instanceId }
					idPrefix={ idPrefix }
				/>
			) }
			<div className="photo-collage-z-index-control">
				<RangeControl
					label={ __( 'Z-Index (Layer Order)', 'photo-collage' ) }
					id={ `${ idPrefix }-z-index-${ instanceId }` }
					value={ zIndex }
					onChange={ ( value ) => setAttributes( { zIndex: value } ) }
					min={ -10 }
					max={ 100 }
					help={ __( 'Higher numbers are on top.', 'photo-collage' ) }
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
		</>
	);
}
