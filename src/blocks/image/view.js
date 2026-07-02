/**
 * Frontend lightbox for the Collage Image block.
 *
 * Images rendered with the `data-pc-lightbox` attribute open a full-screen
 * overlay showing the full-size source (`data-pc-lightbox-src` when present).
 */

const TRIGGER_SELECTOR = 'img[data-pc-lightbox]';

let overlay = null;
let overlayImage = null;
let closeButton = null;
let lastTrigger = null;

const closeLightbox = () => {
	if ( ! overlay || overlay.hidden ) {
		return;
	}

	overlay.hidden = true;
	overlayImage.removeAttribute( 'src' );
	document.body.style.removeProperty( 'overflow' );
	document.removeEventListener( 'keydown', onKeydown, true );

	if ( lastTrigger && lastTrigger.isConnected ) {
		lastTrigger.focus();
	}
	lastTrigger = null;
};

const onKeydown = ( event ) => {
	if ( event.key === 'Escape' ) {
		event.preventDefault();
		closeLightbox();
	}

	// Keep focus on the close button while the overlay is open.
	if ( event.key === 'Tab' ) {
		event.preventDefault();
		closeButton.focus();
	}
};

const ensureOverlay = () => {
	if ( overlay ) {
		return;
	}

	overlay = document.createElement( 'div' );
	overlay.className = 'pc-lightbox-overlay';
	overlay.hidden = true;
	overlay.setAttribute( 'role', 'dialog' );
	overlay.setAttribute( 'aria-modal', 'true' );

	closeButton = document.createElement( 'button' );
	closeButton.type = 'button';
	closeButton.className = 'pc-lightbox-close';
	closeButton.setAttribute(
		'aria-label',
		( window.wp &&
			window.wp.i18n &&
			window.wp.i18n.__( 'Close', 'photo-collage' ) ) ||
			'Close'
	);
	closeButton.innerHTML = '&times;';
	closeButton.addEventListener( 'click', closeLightbox );

	overlayImage = document.createElement( 'img' );
	overlayImage.className = 'pc-lightbox-image';

	overlay.append( closeButton, overlayImage );
	overlay.addEventListener( 'click', ( event ) => {
		// Close on any click that is not on the enlarged image itself.
		if ( event.target !== overlayImage ) {
			closeLightbox();
		}
	} );

	document.body.appendChild( overlay );
};

const openLightbox = ( trigger ) => {
	ensureOverlay();

	const fullSrc =
		trigger.getAttribute( 'data-pc-lightbox-src' ) ||
		trigger.currentSrc ||
		trigger.src;
	if ( ! fullSrc ) {
		return;
	}

	overlayImage.src = fullSrc;
	overlayImage.alt = trigger.alt || '';
	overlay.hidden = false;
	document.body.style.overflow = 'hidden';
	document.addEventListener( 'keydown', onKeydown, true );

	lastTrigger = trigger;
	closeButton.focus();
};

const onDocumentClick = ( event ) => {
	const trigger =
		event.target instanceof window.Element &&
		event.target.closest( TRIGGER_SELECTOR );
	if ( ! trigger ) {
		return;
	}

	event.preventDefault();
	openLightbox( trigger );
};

const onDocumentKeydown = ( event ) => {
	if ( event.key !== 'Enter' && event.key !== ' ' ) {
		return;
	}

	const trigger =
		event.target instanceof window.Element &&
		event.target.closest( TRIGGER_SELECTOR );
	if ( ! trigger ) {
		return;
	}

	event.preventDefault();
	openLightbox( trigger );
};

const init = () => {
	if ( ! document.querySelector( TRIGGER_SELECTOR ) ) {
		return;
	}

	document.addEventListener( 'click', onDocumentClick );
	document.addEventListener( 'keydown', onDocumentKeydown );
};

if ( window.wp && typeof window.wp.domReady === 'function' ) {
	window.wp.domReady( init );
} else if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init, { once: true } );
} else {
	init();
}
