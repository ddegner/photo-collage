/**
 * Dispatched from a Collage Container DOM element when the editor requests
 * conversion of its direct children to freeform canvas positioning.
 *
 * Listeners should read `event.detail.containerClientId` and
 * `event.detail.layoutState`. Keeping this as a DOM event lets the container
 * request the conversion without depending on gesture or geometry code.
 */
export const CANVAS_ARRANGE_FREELY_REQUEST_EVENT =
	'photo-collage:arrange-freely-request';

/**
 * Ask the nearest Collage Container to promote its direct children atomically.
 *
 * @param {Element|null} sourceElement Element inside the target container.
 * @param {Object}       detail        Plain event detail for validation.
 * @return {boolean} Whether the request was dispatched.
 */
export const requestArrangeFreely = ( sourceElement, detail = {} ) => {
	const container = sourceElement?.closest(
		'.wp-block-photo-collage-container'
	);
	const EventConstructor = container?.ownerDocument?.defaultView?.CustomEvent;

	if ( ! container || ! EventConstructor ) {
		return false;
	}

	container.dispatchEvent(
		new EventConstructor( CANVAS_ARRANGE_FREELY_REQUEST_EVENT, {
			bubbles: true,
			cancelable: true,
			detail,
		} )
	);

	return true;
};
