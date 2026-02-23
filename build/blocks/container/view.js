(() => {
	'use strict';

	const AUTO_CONTAINER_SELECTOR =
		'.wp-block-photo-collage-container[data-height-mode="auto"]';
	const ITEM_SELECTOR = [
		'wp-block-photo-collage-image',
		'wp-block-photo-collage-frame',
	]
		.map( ( className ) => `.${ className }` )
		.join( ', ' );

	const MIN_HEIGHT = 200;
	const MAX_MEASURE_PASSES = 6;
	const FAILSAFE_REVEAL_MS = 1400;
	const MOBILE_STACK_MEDIA_QUERY = '(max-width: 782px)';

	const cleanupByContainer = new WeakMap();

	const getDirectItems = ( container ) =>
		Array.from( container.querySelectorAll( ITEM_SELECTOR ) ).filter( ( item ) => {
			if ( item.closest( '.wp-block-photo-collage-container' ) !== container ) {
				return false;
			}

			const nestedItem = item.parentElement?.closest( ITEM_SELECTOR );
			return ! nestedItem;
		} );

	const parseUnitValue = ( value, unit ) => {
		if ( typeof value !== 'string' ) {
			return null;
		}
		const trimmed = value.trim().toLowerCase();
		if ( ! trimmed.endsWith( unit ) ) {
			return null;
		}
		const numeric = Number.parseFloat( trimmed.slice( 0, -unit.length ) );
		return Number.isFinite( numeric ) ? numeric : null;
	};

	const parsePercent = ( value ) => parseUnitValue( value, '%' );
	const parsePixels = ( value ) => parseUnitValue( value, 'px' );

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

	const getItemWidthPixels = ( item, containerWidth ) => {
		const percentWidth = parsePercent( item.style.width );
		if ( percentWidth !== null && Number.isFinite( containerWidth ) && containerWidth > 0 ) {
			return ( containerWidth * percentWidth ) / 100;
		}

		const pixelWidth = parsePixels( item.style.width );
		if ( pixelWidth !== null ) {
			return pixelWidth;
		}

		const rectWidth = item.getBoundingClientRect().width || item.offsetWidth;
		if ( Number.isFinite( rectWidth ) && rectWidth > 0 ) {
			return rectWidth;
		}

		return null;
	};

	const getImageAspectRatio = ( item ) => {
		const image = item.querySelector( 'img' );
		if ( ! image ) {
			return null;
		}

		const width =
			Number.parseFloat( image.getAttribute( 'width' ) || '' ) || image.naturalWidth;
		const height =
			Number.parseFloat( image.getAttribute( 'height' ) || '' ) || image.naturalHeight;

		if ( ! Number.isFinite( width ) || width <= 0 ) {
			return null;
		}
		if ( ! Number.isFinite( height ) || height <= 0 ) {
			return null;
		}

		return height / width;
	};

	const getItemHeightEstimate = ( item, containerWidth ) => {
		const explicitHeightPx = parsePixels( item.style.height );
		if ( explicitHeightPx !== null ) {
			return explicitHeightPx;
		}

		const rectHeight = item.getBoundingClientRect().height || item.offsetHeight;

		const itemWidth = getItemWidthPixels( item, containerWidth );
		const aspectRatio = getImageAspectRatio( item );
		if (
			Number.isFinite( itemWidth ) &&
			itemWidth > 0 &&
			Number.isFinite( aspectRatio ) &&
			aspectRatio > 0
		) {
			const ratioHeight = itemWidth * aspectRatio;
			if ( Number.isFinite( rectHeight ) && rectHeight > 0 ) {
				return Math.max( ratioHeight, rectHeight );
			}
			return ratioHeight;
		}

		if ( Number.isFinite( rectHeight ) && rectHeight > 0 ) {
			return rectHeight;
		}

		return null;
	};

	const getRequiredHeightFromPosition = ( item, itemHeight ) => {
		if ( ! Number.isFinite( itemHeight ) || itemHeight <= 0 ) {
			return null;
		}

		let required = null;

		const topPercent = parsePercent( item.style.top );
		if ( topPercent !== null && topPercent < 99.5 ) {
			required = Math.max( required || 0, itemHeight / ( 1 - topPercent / 100 ) );
		}

		const topPixels = parsePixels( item.style.top );
		if ( topPixels !== null ) {
			required = Math.max( required || 0, topPixels + itemHeight );
		}

		const bottomPercent = parsePercent( item.style.bottom );
		if ( bottomPercent !== null && bottomPercent < 99.5 ) {
			required = Math.max(
				required || 0,
				itemHeight / ( 1 - bottomPercent / 100 )
			);
		}

		const bottomPixels = parsePixels( item.style.bottom );
		if ( bottomPixels !== null ) {
			required = Math.max( required || 0, bottomPixels + itemHeight );
		}

		return Number.isFinite( required ) && required > 0 ? required : null;
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

	const solveAutoHeight = ( container, items ) => {
		const containerWidth = getContainerWidth( container );

		let estimatedHeight = MIN_HEIGHT;

		items.forEach( ( item ) => {
			const itemHeight = getItemHeightEstimate( item, containerWidth );
			const requiredHeight = getRequiredHeightFromPosition( item, itemHeight );
			if ( Number.isFinite( requiredHeight ) && requiredHeight > 0 ) {
				estimatedHeight = Math.max( estimatedHeight, requiredHeight );
			}
		} );
		estimatedHeight = Math.max( MIN_HEIGHT, estimatedHeight );

		let nextHeight = estimatedHeight;

		for ( let pass = 0; pass < MAX_MEASURE_PASSES; pass += 1 ) {
			const passHeight = Math.max( MIN_HEIGHT, nextHeight );
			container.style.height = `${ passHeight }px`;

			const measuredBottom = Math.max(
				MIN_HEIGHT,
				measureAbsoluteBottom( container, items )
			);
			const resolvedHeight = Math.max( measuredBottom, estimatedHeight );

			if ( Math.abs( resolvedHeight - passHeight ) <= 1 ) {
				nextHeight = resolvedHeight;
				break;
			}

			nextHeight = resolvedHeight;
		}

		return Math.max( MIN_HEIGHT, Math.ceil( nextHeight ) );
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

		const solvedHeight = solveAutoHeight( container, items );
		if ( Number.isFinite( solvedHeight ) && solvedHeight > 0 ) {
			container.style.height = `${ solvedHeight }px`;
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
		let lastSolvedHeight = null;
		let stablePasses = 0;
		const startTime = window.performance.now();

		const schedule = () => {
			if ( frame !== null ) {
				return;
			}
			frame = window.requestAnimationFrame( () => {
				frame = null;
				const result = applyAutoLayout( container );
				if ( ! result || result.mode !== 'auto' ) {
					if ( ! hasRevealed ) {
						revealContainer( container );
						hasRevealed = true;
					}
					return;
				}

				const solvedHeight = result.height;
				if ( Number.isFinite( solvedHeight ) ) {
					if (
						Number.isFinite( lastSolvedHeight ) &&
						Math.abs( solvedHeight - lastSolvedHeight ) <= 1
					) {
						stablePasses += 1;
					} else {
						stablePasses = 0;
					}
					lastSolvedHeight = solvedHeight;
				}

				if ( ! hasRevealed ) {
					const elapsed = window.performance.now() - startTime;
					if ( stablePasses >= 2 || elapsed >= FAILSAFE_REVEAL_MS ) {
						revealContainer( container );
						hasRevealed = true;
					} else {
						schedule();
					}
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
					if ( record.type === 'attributes' && record.target !== container ) {
						shouldMeasure = true;
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
				attributeFilter: [ 'style', 'src', 'width', 'height' ],
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
})();
