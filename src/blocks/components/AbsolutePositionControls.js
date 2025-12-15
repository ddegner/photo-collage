/**
 * Absolute Position Controls Component
 *
 * Provides anchor grid and position input controls for absolute positioning.
 *
 * @package PhotoCollage
 */

import { __ } from '@wordpress/i18n';
import {
	Button,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

/**
 * AbsolutePositionControls component.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.top          Top position value.
 * @param {string}   props.right        Right position value.
 * @param {string}   props.bottom       Bottom position value.
 * @param {string}   props.left         Left position value.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {string}   props.instanceId   Unique instance ID for form elements.
 * @param {string}   props.idPrefix     ID prefix for form elements (default: 'inspector').
 * @return {JSX.Element} The position controls component.
 */
export default function AbsolutePositionControls( {
	top,
	right,
	bottom,
	left,
	setAttributes,
	instanceId,
	idPrefix = 'inspector',
} ) {
	return (
		<>
			<p className="photo-collage-help-text">
				{ __(
					'Click an anchor point to pin the element to that corner.',
					'photo-collage'
				) }
			</p>
			<div className="photo-collage-anchor-control">
				<div className="photo-collage-anchor-grid">
					{ /* Top Left */ }
					<Button
						className={ `photo-collage-anchor-btn ${
							top !== 'auto' && left !== 'auto' ? 'is-active' : ''
						}` }
						onClick={ () =>
							setAttributes( {
								top: '0%',
								left: '0%',
								bottom: 'auto',
								right: 'auto',
							} )
						}
						icon="arrow-left-alt2"
						style={ { transform: 'rotate(45deg)' } }
						label={ __( 'Top Left', 'photo-collage' ) }
					/>
					{ /* Top Right */ }
					<Button
						className={ `photo-collage-anchor-btn ${
							top !== 'auto' && right !== 'auto'
								? 'is-active'
								: ''
						}` }
						onClick={ () =>
							setAttributes( {
								top: '0%',
								right: '0%',
								bottom: 'auto',
								left: 'auto',
							} )
						}
						icon="arrow-up-alt2"
						style={ { transform: 'rotate(45deg)' } }
						label={ __( 'Top Right', 'photo-collage' ) }
					/>
					{ /* Bottom Left */ }
					<Button
						className={ `photo-collage-anchor-btn ${
							bottom !== 'auto' && left !== 'auto'
								? 'is-active'
								: ''
						}` }
						onClick={ () =>
							setAttributes( {
								bottom: '0%',
								left: '0%',
								top: 'auto',
								right: 'auto',
							} )
						}
						icon="arrow-down-alt2"
						style={ { transform: 'rotate(45deg)' } }
						label={ __( 'Bottom Left', 'photo-collage' ) }
					/>
					{ /* Bottom Right */ }
					<Button
						className={ `photo-collage-anchor-btn ${
							bottom !== 'auto' && right !== 'auto'
								? 'is-active'
								: ''
						}` }
						onClick={ () =>
							setAttributes( {
								bottom: '0%',
								right: '0%',
								top: 'auto',
								left: 'auto',
							} )
						}
						icon="arrow-right-alt2"
						style={ { transform: 'rotate(45deg)' } }
						label={ __( 'Bottom Right', 'photo-collage' ) }
					/>
				</div>
			</div>

			<div className="photo-collage-position-controls">
				<div className="photo-collage-position-row is-center">
					<UnitControl
						label={ __( 'Top', 'photo-collage' ) }
						id={ `${ idPrefix }-top-${ instanceId }` }
						value={ top }
						onChange={ ( value ) => {
							const newValue = value || 'auto';
							setAttributes( {
								top: newValue,
								bottom: newValue !== 'auto' ? 'auto' : bottom,
							} );
						} }
						__next40pxDefaultSize={ true }
					/>
				</div>
				<div className="photo-collage-position-row is-space-between">
					<UnitControl
						label={ __( 'Left', 'photo-collage' ) }
						id={ `${ idPrefix }-left-${ instanceId }` }
						value={ left }
						onChange={ ( value ) => {
							const newValue = value || 'auto';
							setAttributes( {
								left: newValue,
								right: newValue !== 'auto' ? 'auto' : right,
							} );
						} }
						__next40pxDefaultSize={ true }
					/>
					<UnitControl
						label={ __( 'Right', 'photo-collage' ) }
						id={ `${ idPrefix }-right-${ instanceId }` }
						value={ right }
						onChange={ ( value ) => {
							const newValue = value || 'auto';
							setAttributes( {
								right: newValue,
								left: newValue !== 'auto' ? 'auto' : left,
							} );
						} }
						__next40pxDefaultSize={ true }
					/>
				</div>
				<div className="photo-collage-position-row is-center">
					<UnitControl
						label={ __( 'Bottom', 'photo-collage' ) }
						id={ `${ idPrefix }-bottom-${ instanceId }` }
						value={ bottom }
						onChange={ ( value ) => {
							const newValue = value || 'auto';
							setAttributes( {
								bottom: newValue,
								top: newValue !== 'auto' ? 'auto' : top,
							} );
						} }
						__next40pxDefaultSize={ true }
					/>
				</div>
			</div>
		</>
	);
}
