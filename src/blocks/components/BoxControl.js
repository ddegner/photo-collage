/**
 * BoxControl Component
 *
 * A visual box control for margin/padding input with four sides.
 *
 * @package PhotoCollage
 */

import { __ } from '@wordpress/i18n';
import { __experimentalUnitControl as UnitControl } from '@wordpress/components';

/**
 * BoxControl component.
 *
 * @param {Object}   props             Component props.
 * @param {Object}   props.values      Object with top, right, bottom, left values.
 * @param {Function} props.onChange    Callback when a value changes (side, value).
 * @param {string}   props.centerLabel Label to display in center (default: 'M').
 * @param {boolean}  props.isDashed    Whether to use dashed border (default: true).
 * @return {JSX.Element} The box control component.
 */
export default function BoxControl( {
	values,
	onChange,
	centerLabel = 'M',
	isDashed = true,
} ) {
	return (
		<div className="photo-collage-box-control">
			{ /* Top */ }
			<div className="photo-collage-box-row is-center">
				<UnitControl
					label={ __( 'Top', 'photo-collage' ) }
					labelPosition="top"
					value={ values.top }
					onChange={ ( value ) => onChange( 'top', value ) }
					className="photo-collage-unit-control-small"
					__next40pxDefaultSize={ true }
				/>
			</div>

			{ /* Middle row: Left, Center symbol, Right */ }
			<div className="photo-collage-box-row is-space-between">
				<UnitControl
					label={ __( 'Left', 'photo-collage' ) }
					labelPosition="top"
					value={ values.left }
					onChange={ ( value ) => onChange( 'left', value ) }
					className="photo-collage-unit-control-small"
					__next40pxDefaultSize={ true }
				/>

				<div
					className={ `photo-collage-box-center ${
						isDashed ? 'is-dashed' : 'is-solid'
					}` }
				>
					{ centerLabel }
				</div>

				<UnitControl
					label={ __( 'Right', 'photo-collage' ) }
					labelPosition="top"
					value={ values.right }
					onChange={ ( value ) => onChange( 'right', value ) }
					className="photo-collage-unit-control-small"
					__next40pxDefaultSize={ true }
				/>
			</div>

			{ /* Bottom */ }
			<div className="photo-collage-box-row is-center">
				<UnitControl
					label={ __( 'Bottom', 'photo-collage' ) }
					labelPosition="top"
					value={ values.bottom }
					onChange={ ( value ) => onChange( 'bottom', value ) }
					className="photo-collage-unit-control-small"
					__next40pxDefaultSize={ true }
				/>
			</div>
		</div>
	);
}
