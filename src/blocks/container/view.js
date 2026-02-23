
	const AUTO_CONTAINER_SELECTOR =
		'.wp-block-photo-collage-container[data-height-mode="auto"]';
	const ITEM_SELECTOR = [
		'wp-block-photo-collage-image',
		'wp-block-photo-collage-frame',
	]
		.map( ( className ) => `.${ className }` )
		.join( ', ' );

	const MIN_HEIGHT = 200;
	const FAILSAFE_REVEAL_MS = 350;
	const MOBILE_STACK_MEDIA_QUERY = '(max-width: 782px)';

	const cleanupByContainer = new WeakMap();
	const geometryByContainer = new WeakMap();

	const getDirectItems = ( container ) =>
		Array.from( container.querySelectorAll( ITEM_SELECTOR ) ).filter( ( item ) => {
			if ( item.closest( '.wp-block-photo-collage-container' ) !== container ) {
				return false;
			}

			const nestedItem = item.parentElement?.closest( ITEM_SELECTOR );
			return ! nestedItem;
		} );

	const getContainerWidth = ( container ) => {
		const rectWidth = container.getBoundingClientRect().width;
		if ( Number.isFinite( rectWidth ) && rectWidth > 0 ) {
			return rectWidth;
		}

		const offsetWidth = container.offsetWidth || container.clientWidth;
		if ( Number.isFinite( offsetWidth ) && offsetWidth > 0 ) {
			return offsetWidth;
		}

		return 0;
	};

	const toFiniteNumber = ( value ) => {
		const numeric =
			typeof value === 'number' ? value : Number.parseFloat( value || '' );
		return Number.isFinite( numeric ) ? numeric : null;
	};

	const parseConstraint = ( constraint ) => {
		if ( Array.isArray( constraint ) && constraint.length >= 2 ) {
			const a = toFiniteNumber( constraint[ 0 ] );
			const b = toFiniteNumber( constraint[ 1 ] );

			if ( Number.isFinite( a ) || Number.isFinite( b ) ) {
				return [ a || 0, b || 0 ];
			}

			return null;
		}

		if ( constraint && typeof constraint === 'object' ) {
			const a = toFiniteNumber( constraint.a );
			const b = toFiniteNumber( constraint.b );

			if ( Number.isFinite( a ) || Number.isFinite( b ) ) {
				return [ a || 0, b || 0 ];
			}
		}

		return null;
	};

	const getPrecomputedGeometry = ( container ) => {
		if ( geometryByContainer.has( container ) ) {
			return geometryByContainer.get( container );
		}

		const raw = container.dataset.pcGeometry;
		if ( typeof raw !== 'string' || raw.trim() === '' ) {
			geometryByContainer.set( container, null );
			return null;
		}

		let parsed;
		try {
			parsed = JSON.parse( raw );
		} catch {
			geometryByContainer.set( container, null );
			return null;
		}

		const minHeight = Math.max(
			MIN_HEIGHT,
			toFiniteNumber( parsed?.minHeight ) || MIN_HEIGHT
		);
		const constraints = Array.isArray( parsed?.constraints )
			? parsed.constraints
					.map( parseConstraint )
					.filter( ( constraint ) => Array.isArray( constraint ) )
			: [];

		const geometry =
			constraints.length > 0
				? {
						minHeight,
						constraints,
				  }
				: null;

		geometryByContainer.set( container, geometry );
		return geometry;
	};

	const solvePrecomputedHeight = ( container ) => {
		const geometry = getPrecomputedGeometry( container );
		if ( ! geometry ) {
			return null;
		}

		const containerWidth = getContainerWidth( container );
		if ( ! Number.isFinite( containerWidth ) || containerWidth <= 0 ) {
			return null;
		}

		let solvedHeight = Math.max( MIN_HEIGHT, geometry.minHeight || MIN_HEIGHT );

		geometry.constraints.forEach( ( [ a, b ] ) => {
			const candidate = a * containerWidth + b;
			if ( Number.isFinite( candidate ) && candidate > 0 ) {
				solvedHeight = Math.max( solvedHeight, candidate );
			}
		} );

		return Math.max( MIN_HEIGHT, Math.ceil( solvedHeight ) );
	};

	const measureAbsoluteBottom = ( container, items ) => {
		const containerRect = container.getBoundingClientRect();
		let maxBottom = 0;

		items.forEach( ( item ) => {
			const itemRect = item.getBoundingClientRect();
			maxBottom = Math.max( maxBottom, itemRect.bottom - containerRect.top );
		} );

		return maxBottom;
	};

	const hasAbsoluteItems = ( items ) =>
		items.some( ( item ) => window.getComputedStyle( item ).position === 'absolute' );

	const isStackedOnMobile = ( container ) =>
		container.classList.contains( 'is-stack-on-mobile' ) &&
		window.matchMedia( MOBILE_STACK_MEDIA_QUERY ).matches;

	const revealContainer = ( container ) => {
		container.style.removeProperty( 'visibility' );
		container.dataset.pcAutoState = 'ready';
	};

	const clearContainerHeight = ( container ) => {
		container.style.removeProperty( 'height' );
	};

	const applyAutoLayout = ( container ) => {
		if ( ! container || ! container.isConnected ) {
			return { mode: 'skip', height: null };
		}

		if ( container.dataset.heightMode && container.dataset.heightMode !== 'auto' ) {
			clearContainerHeight( container );
			return { mode: 'skip', height: null };
		}

		if ( isStackedOnMobile( container ) ) {
			clearContainerHeight( container );
			return { mode: 'skip', height: null };
		}

		const items = getDirectItems( container );
		if ( items.length === 0 ) {
			clearContainerHeight( container );
			return { mode: 'skip', height: null };
		}

		if ( ! hasAbsoluteItems( items ) ) {
			clearContainerHeight( container );
			return { mode: 'skip', height: null };
		}

		const precomputedHeight = solvePrecomputedHeight( container );
		let solvedHeight = Number.isFinite( precomputedHeight ) ? precomputedHeight : null;

		// Set precomputed height first so absolute children resolve against a stable box.
		if ( Number.isFinite( solvedHeight ) && solvedHeight > 0 ) {
			container.style.height = `${ solvedHeight }px`;
		}

		const measuredBottom = Math.max(
			MIN_HEIGHT,
			measureAbsoluteBottom( container, items )
		);

		if ( Number.isFinite( solvedHeight ) ) {
			solvedHeight = Math.max( solvedHeight, measuredBottom );
		} else {
			solvedHeight = measuredBottom;
		}

		if ( Number.isFinite( solvedHeight ) && solvedHeight > 0 ) {
			const roundedHeight = Math.max( MIN_HEIGHT, Math.ceil( solvedHeight ) );
			container.style.height = `${ roundedHeight }px`;
			solvedHeight = roundedHeight;
		}

		return {
			mode: 'auto',
			height: Number.isFinite( solvedHeight ) ? solvedHeight : null,
		};
	};

	const attachAutoLayout = ( container ) => {
		if ( ! container || typeof window === 'undefined' ) {
			return () => {};
		}

		let frame = null;
		let resizeObserver;
		let mutationObserver;
		let mobileMediaQuery;
		let failSafeTimer = null;
		let hasRevealed = false;

		const schedule = () => {
			if ( frame !== null ) {
				return;
			}

			frame = window.requestAnimationFrame( () => {
				frame = null;
				applyAutoLayout( container );

				if ( ! hasRevealed ) {
					revealContainer( container );
					hasRevealed = true;
				}
			} );
		};

		const reconnectResizeObserver = () => {
			if ( ! resizeObserver ) {
				return;
			}

			resizeObserver.disconnect();
			resizeObserver.observe( container );
			getDirectItems( container ).forEach( ( item ) => {
				resizeObserver.observe( item );
			} );
		};

		if ( typeof window.ResizeObserver === 'function' ) {
			resizeObserver = new window.ResizeObserver( () => {
				schedule();
			} );
			reconnectResizeObserver();
		}

		if ( typeof window.MutationObserver === 'function' ) {
			mutationObserver = new window.MutationObserver( ( records ) => {
				let reconnectObservers = false;
				let shouldMeasure = false;

				records.forEach( ( record ) => {
					if ( record.type === 'childList' ) {
						reconnectObservers = true;
						shouldMeasure = true;
						return;
					}

					if ( record.type === 'attributes' ) {
						if (
							record.target === container &&
							record.attributeName === 'data-pc-geometry'
						) {
							geometryByContainer.delete( container );
							shouldMeasure = true;
							return;
						}

						if ( record.target !== container ) {
							shouldMeasure = true;
						}
					}
				} );

				if ( reconnectObservers ) {
					reconnectResizeObserver();
				}

				if ( shouldMeasure ) {
					schedule();
				}
			} );

			mutationObserver.observe( container, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [ 'style', 'src', 'width', 'height', 'data-pc-geometry' ],
			} );
		}

		const onLoad = ( event ) => {
			if ( event.target instanceof window.HTMLImageElement ) {
				schedule();
			}
		};

		const onWindowResize = () => {
			schedule();
		};

		const onMobileMediaChange = () => {
			schedule();
		};

		container.addEventListener( 'load', onLoad, true );
		window.addEventListener( 'resize', onWindowResize );

		mobileMediaQuery = window.matchMedia( MOBILE_STACK_MEDIA_QUERY );
		if ( typeof mobileMediaQuery.addEventListener === 'function' ) {
			mobileMediaQuery.addEventListener( 'change', onMobileMediaChange );
		} else if ( typeof mobileMediaQuery.addListener === 'function' ) {
			mobileMediaQuery.addListener( onMobileMediaChange );
		}

		failSafeTimer = window.setTimeout( () => {
			if ( ! hasRevealed ) {
				revealContainer( container );
				hasRevealed = true;
			}
		}, FAILSAFE_REVEAL_MS );

		schedule();

		return () => {
			if ( frame !== null ) {
				window.cancelAnimationFrame( frame );
			}

			if ( failSafeTimer !== null ) {
				window.clearTimeout( failSafeTimer );
			}

			container.removeEventListener( 'load', onLoad, true );
			window.removeEventListener( 'resize', onWindowResize );

			if ( mobileMediaQuery ) {
				if ( typeof mobileMediaQuery.removeEventListener === 'function' ) {
					mobileMediaQuery.removeEventListener( 'change', onMobileMediaChange );
				} else if ( typeof mobileMediaQuery.removeListener === 'function' ) {
					mobileMediaQuery.removeListener( onMobileMediaChange );
				}
			}

			if ( resizeObserver ) {
				resizeObserver.disconnect();
			}

			if ( mutationObserver ) {
				mutationObserver.disconnect();
			}

			geometryByContainer.delete( container );
		};
	};

	const attachContainer = ( container ) => {
		if ( cleanupByContainer.has( container ) ) {
			return;
		}

		const cleanup = attachAutoLayout( container );
		cleanupByContainer.set( container, cleanup );
	};

	const detachContainer = ( container ) => {
		const cleanup = cleanupByContainer.get( container );
		if ( ! cleanup ) {
			return;
		}

		cleanup();
		cleanupByContainer.delete( container );
	};

	const visitAutoContainers = ( node, callback ) => {
		if ( ! ( node instanceof window.Element ) ) {
			return;
		}

		if ( node.matches( AUTO_CONTAINER_SELECTOR ) ) {
			callback( node );
		}

		node.querySelectorAll( AUTO_CONTAINER_SELECTOR ).forEach( callback );
	};

	const init = () => {
		document.querySelectorAll( AUTO_CONTAINER_SELECTOR ).forEach( ( container ) => {
			attachContainer( container );
		} );

		if ( typeof window.MutationObserver === 'function' && document.body ) {
			new window.MutationObserver( ( records ) => {
				records.forEach( ( record ) => {
					record.addedNodes.forEach( ( node ) => {
						visitAutoContainers( node, attachContainer );
					} );

					record.removedNodes.forEach( ( node ) => {
						visitAutoContainers( node, detachContainer );
					} );
				} );
			} ).observe( document.body, {
				childList: true,
				subtree: true,
			} );
		}
	};

	if ( window.wp && typeof window.wp.domReady === 'function' ) {
		window.wp.domReady( init );
	} else if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init, { once: true } );
	} else {
		init();
	}
