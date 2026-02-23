import { attachAutoHeight } from './auto-height';

const AUTO_HEIGHT_SELECTOR =
	'.wp-block-photo-collage-container[data-height-mode="auto"]';

const activeAutoHeight = new WeakMap();

const registerContainer = ( container ) => {
	if ( activeAutoHeight.has( container ) ) {
		return;
	}

	const cleanup = attachAutoHeight( container, {
		watchMutations: false,
		watchResize: true,
	} );
	activeAutoHeight.set( container, cleanup );
};

const unregisterContainer = ( container ) => {
	const cleanup = activeAutoHeight.get( container );
	if ( cleanup ) {
		cleanup();
		activeAutoHeight.delete( container );
	}
};

const forEachMatchingContainer = ( node, callback ) => {
	if ( ! ( node instanceof window.Element ) ) {
		return;
	}

	if ( node.matches( AUTO_HEIGHT_SELECTOR ) ) {
		callback( node );
	}

	node.querySelectorAll( AUTO_HEIGHT_SELECTOR ).forEach( ( container ) => {
		callback( container );
	} );
};

const registerWithinNode = ( node ) =>
	forEachMatchingContainer( node, registerContainer );

const unregisterWithinNode = ( node ) => {
	forEachMatchingContainer( node, unregisterContainer );
};

const initAutoHeight = () => {
	document
		.querySelectorAll( AUTO_HEIGHT_SELECTOR )
		.forEach( ( container ) => {
			registerContainer( container );
		} );

	if ( typeof window.MutationObserver !== 'function' || ! document.body ) {
		return;
	}

	const documentObserver = new window.MutationObserver( ( mutations ) => {
		mutations.forEach( ( mutation ) => {
			mutation.addedNodes.forEach( ( node ) => {
				registerWithinNode( node );
			} );

			mutation.removedNodes.forEach( ( node ) => {
				unregisterWithinNode( node );
			} );
		} );
	} );

	documentObserver.observe( document.body, {
		childList: true,
		subtree: true,
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAutoHeight, {
		once: true,
	} );
} else {
	initAutoHeight();
}
