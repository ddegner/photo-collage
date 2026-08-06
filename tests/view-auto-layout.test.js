/**
 * Frontend auto-layout coverage: view.js seed/floor contract with
 * data-pc-geometry, the exact measured solve, and the reveal handshake.
 */

const defineMetric = ( element, property, descriptor ) => {
	Object.defineProperty( element, property, {
		configurable: true,
		...descriptor,
	} );
};

const createFrontendFixture = ( { geometry, itemTop, itemContentHeight } ) => {
	const container = document.createElement( 'div' );
	container.className = 'wp-block-photo-collage-container';
	container.dataset.heightMode = 'auto';
	container.dataset.pcAutoState = 'pending';
	container.style.visibility = 'hidden';
	if ( geometry ) {
		container.dataset.pcGeometry = JSON.stringify( geometry );
	}

	const currentHeight = () =>
		Number.parseFloat( container.style.height ) || 200;

	defineMetric( container, 'clientHeight', { get: currentHeight } );
	defineMetric( container, 'offsetHeight', { get: currentHeight } );
	defineMetric( container, 'clientWidth', { value: 1000 } );
	container.getBoundingClientRect = () => ( {
		top: 0,
		bottom: currentHeight(),
		left: 0,
		right: 1000,
		width: 1000,
		height: currentHeight(),
	} );

	const item = document.createElement( 'div' );
	item.className = 'wp-block-photo-collage-image';
	item.style.position = 'absolute';
	item.style.top = itemTop;
	const topFraction = Number.parseFloat( itemTop ) / 100;
	item.getBoundingClientRect = () => ( {
		top: topFraction * currentHeight(),
		bottom: topFraction * currentHeight() + itemContentHeight,
		left: 0,
		right: 400,
		width: 400,
		height: itemContentHeight,
	} );

	container.appendChild( item );
	document.body.appendChild( container );
	return container;
};

describe( 'frontend auto layout (view.js)', () => {
	let rafCallbacks;

	beforeEach( () => {
		rafCallbacks = [];
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation(
			( callback ) => {
				rafCallbacks.push( callback );
				return rafCallbacks.length;
			}
		);
		jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation(
			() => {}
		);
		jest.spyOn( window, 'setTimeout' ).mockImplementation( () => 0 );
		window.wp = undefined;
	} );

	afterEach( () => {
		document.body.replaceChildren();
		jest.restoreAllMocks();
		jest.resetModules();
	} );

	const bootView = () => {
		// document.readyState is 'complete' under jsdom, so init runs on
		// import; isolateModules lets each test attach to a fresh fixture.
		jest.isolateModules( () => {
			require( '../src/blocks/container/view.js' );
		} );
		let flushed = 0;
		while ( rafCallbacks.length > 0 && flushed < 20 ) {
			rafCallbacks.shift()( 0 );
			flushed += 1;
		}
	};

	it( 'refines above the precomputed seed with the exact solve and reveals', () => {
		// Seed: constraint 0.35 * 1000 = 350. Measurement: a top: 10% item
		// with 400px of content needs 400/0.9 = 444.45 -> ceil 445, which
		// wins over the seed floor.
		const container = createFrontendFixture( {
			geometry: {
				minHeight: 200,
				constraints: [ [ '0.35', '0' ] ],
			},
			itemTop: '10%',
			itemContentHeight: 400,
		} );

		bootView();

		expect( container.style.height ).toBe( '445px' );
		expect( container.style.visibility ).toBe( '' );
		expect( container.dataset.pcAutoState ).toBe( 'ready' );
	} );

	it( 'keeps the precomputed solve as a floor over smaller measurements', () => {
		// Seed 0.6 * 1000 = 600 while the measured item only needs
		// 100/0.9 = 112: the floor must win (images may not have loaded).
		const container = createFrontendFixture( {
			geometry: {
				minHeight: 200,
				constraints: [ [ '0.6', '0' ] ],
			},
			itemTop: '10%',
			itemContentHeight: 100,
		} );

		bootView();

		expect( container.style.height ).toBe( '600px' );
		expect( container.dataset.pcAutoState ).toBe( 'ready' );
	} );

	it( 'solves by measurement alone when no geometry payload exists', () => {
		const container = createFrontendFixture( {
			geometry: null,
			itemTop: '90%',
			itemContentHeight: 300,
		} );

		bootView();

		// 300/(1 - 0.9) = 3000 — the case the old iterative loop stalled on.
		expect( container.style.height ).toBe( '3000px' );
	} );
} );
