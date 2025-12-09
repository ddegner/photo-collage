/**
 * CaptionPositionControl Component
 *
 * A visual position selector for caption placement around an image.
 * Displays a CSS Grid layout with 12 clickable position buttons arranged
 * around a center image representation.
 *
 * Valid positions:
 * - Top: top-left, top-center, top-right
 * - Left: left-top, left-center, left-bottom
 * - Right: right-top, right-center, right-bottom
 * - Bottom: bottom-left, bottom-center, bottom-right
 */

import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { image as imageIcon } from '@wordpress/icons';

/**
 * All valid caption positions organized by edge.
 */
const POSITIONS = {
	top: [ 'top-left', 'top-center', 'top-right' ],
	left: [ 'left-top', 'left-center', 'left-bottom' ],
	right: [ 'right-top', 'right-center', 'right-bottom' ],
	bottom: [ 'bottom-left', 'bottom-center', 'bottom-right' ],
};

/**
 * Human-readable labels for each position.
 */
const POSITION_LABELS = {
	'top-left': __( 'Top Left', 'photo-collage' ),
	'top-center': __( 'Top Center', 'photo-collage' ),
	'top-right': __( 'Top Right', 'photo-collage' ),
	'left-top': __( 'Left Top', 'photo-collage' ),
	'left-center': __( 'Left Center', 'photo-collage' ),
	'left-bottom': __( 'Left Bottom', 'photo-collage' ),
	'right-top': __( 'Right Top', 'photo-collage' ),
	'right-center': __( 'Right Center', 'photo-collage' ),
	'right-bottom': __( 'Right Bottom', 'photo-collage' ),
	'bottom-left': __( 'Bottom Left', 'photo-collage' ),
	'bottom-center': __( 'Bottom Center', 'photo-collage' ),
	'bottom-right': __( 'Bottom Right', 'photo-collage' ),
};

/**
 * CaptionPositionControl component.
 *
 * @param {Object}   props          Component props.
 * @param {string}   props.value    Current caption placement value.
 * @param {Function} props.onChange Callback when position changes.
 * @return {JSX.Element} The position control component.
 */
export default function CaptionPositionControl( { value, onChange } ) {
	/**
	 * Renders a position button.
	 *
	 * @param {string} position The position value.
	 * @return {JSX.Element} Button element.
	 */
	const renderPositionButton = ( position ) => {
		const isActive = value === position;
		const label = POSITION_LABELS[ position ];

		return (
			<Button
				key={ position }
				className={ `caption-position-btn ${
					isActive ? 'is-active' : ''
				}` }
				onClick={ () => onChange( position ) }
				aria-label={ `${ __(
					'Caption position:',
					'photo-collage'
				) } ${ label }` }
				aria-pressed={ isActive }
				title={ label }
			/>
		);
	};

	return (
		<div className="caption-position-control">
			{ /* Top row */ }
			<div className="caption-position-top">
				{ POSITIONS.top.map( renderPositionButton ) }
			</div>

			{ /* Left column */ }
			<div className="caption-position-left">
				{ POSITIONS.left.map( renderPositionButton ) }
			</div>

			{ /* Center image representation */ }
			<div className="caption-position-center">
				<span className="caption-position-center-icon">
					{ imageIcon }
				</span>
			</div>

			{ /* Right column */ }
			<div className="caption-position-right">
				{ POSITIONS.right.map( renderPositionButton ) }
			</div>

			{ /* Bottom row */ }
			<div className="caption-position-bottom">
				{ POSITIONS.bottom.map( renderPositionButton ) }
			</div>
		</div>
	);
}
