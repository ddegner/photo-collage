import {
	collectMeasuredCandidates,
	getCollageItems,
	measureExtentForElement,
	parseVerticalSlope,
	solveMeasuredHeight,
} from '../src/blocks/utils/height-solver';

describe( 'parseVerticalSlope', () => {
	it( 'reads percentage tops as extent slope', () => {
		expect( parseVerticalSlope( { top: '35%' } ) ).toEqual( {
			anchor: 'top',
			slope: 0.35,
		} );
	} );

	it( 'treats pixel and auto values as slope zero', () => {
		expect(
			parseVerticalSlope( { top: '250px', height: 'auto' } )
		).toEqual( { anchor: 'top', slope: 0 } );
		expect( parseVerticalSlope( {} ) ).toEqual( {
			anchor: 'top',
			slope: 0,
		} );
		expect( parseVerticalSlope( { top: '', bottom: '' } ) ).toEqual( {
			anchor: 'top',
			slope: 0,
		} );
	} );

	it( 'anchors to bottom only when top is not a length', () => {
		expect( parseVerticalSlope( { top: 'auto', bottom: '0%' } ) ).toEqual( {
			anchor: 'bottom',
			slope: 0,
		} );
		expect( parseVerticalSlope( { top: 'auto', bottom: '40px' } ) ).toEqual(
			{ anchor: 'bottom', slope: 0 }
		);
		expect( parseVerticalSlope( { top: 'auto', bottom: '25%' } ) ).toEqual(
			{
				anchor: 'bottom',
				slope: 0.25,
			}
		);
		expect( parseVerticalSlope( { top: '10%', bottom: '25%' } ) ).toEqual( {
			anchor: 'top',
			slope: 0.1,
		} );
	} );

	it( 'adds percentage heights to the anchor fraction', () => {
		expect( parseVerticalSlope( { top: '20%', height: '30%' } ) ).toEqual( {
			anchor: 'top',
			slope: 0.5,
		} );
		expect(
			parseVerticalSlope( { top: 'auto', bottom: '10%', height: '15%' } )
		).toEqual( { anchor: 'bottom', slope: 0.25 } );
	} );
} );

describe( 'solveMeasuredHeight', () => {
	it( 'solves a percentage top exactly in one pass', () => {
		// top: 90% child measured 480px deep while the container is 200px tall
		// resolves to 300/(1 - 0.9) = 3000 — the old measure-and-retry loop
		// stalled near 1800 after eight iterations.
		expect(
			solveMeasuredHeight( {
				candidates: [ { extent: 480, slope: 0.9 } ],
				currentHeight: 200,
			} )
		).toBe( 3000 );
	} );

	it( 'predicts the post-commit height for a dropped item', () => {
		// Dragged image released with its bottom at 1050px, sibling at top: 20%
		// measured 600px deep in a 1000px container: the sibling relaxes to
		// (600 - 200)/0.8 = 500 and the dropped item binds at 1050.
		expect(
			solveMeasuredHeight( {
				candidates: [
					{ extent: 1050, slope: 0 },
					{ extent: 600, slope: 0.2 },
				],
				currentHeight: 1000,
			} )
		).toBe( 1050 );
	} );

	it( 'constrains bottom-anchored children by their extent', () => {
		// bottom: 0% child of measured height 340: the container must keep at
		// least the child's own extent regardless of its current height.
		expect(
			solveMeasuredHeight( {
				candidates: [ { extent: 340, slope: 0 } ],
				currentHeight: 900,
			} )
		).toBe( 340 );
		// bottom: 40px + height: 25%: extent measured 460 at 800px solves to
		// (460 - 0.25 * 800)/0.75 = 346.67 -> 347.
		expect(
			solveMeasuredHeight( {
				candidates: [ { extent: 460, slope: 0.25 } ],
				currentHeight: 800,
			} )
		).toBe( 347 );
	} );

	it( 'floors at the minimum height', () => {
		expect(
			solveMeasuredHeight( {
				candidates: [ { extent: 120, slope: 0 } ],
				currentHeight: 300,
			} )
		).toBe( 200 );
		expect(
			solveMeasuredHeight( {
				candidates: [ { extent: 120, slope: 0 } ],
				currentHeight: 300,
				minHeight: 50,
			} )
		).toBe( 120 );
	} );

	it( 'skips degenerate and unmeasurable candidates', () => {
		expect(
			solveMeasuredHeight( {
				candidates: [
					{ extent: 500, slope: 0.995 },
					{ extent: 500, slope: 1 },
					{ extent: NaN, slope: 0 },
					{ extent: 480, slope: 0.5 },
				],
				currentHeight: 400,
			} )
		).toBe( 560 );
		expect(
			solveMeasuredHeight( { candidates: [], currentHeight: 400 } )
		).toBe( 200 );
	} );
} );

const defineMetric = ( element, property, value ) => {
	Object.defineProperty( element, property, {
		configurable: true,
		value,
	} );
};

const createMeasuredFixture = ( {
	containerTop = 100,
	clientTop = 0,
	clientHeight = 400,
} = {} ) => {
	const container = document.createElement( 'div' );
	container.className = 'wp-block-photo-collage-container';
	document.body.appendChild( container );

	defineMetric( container, 'clientTop', clientTop );
	defineMetric( container, 'clientHeight', clientHeight );
	container.getBoundingClientRect = () => ( {
		top: containerTop,
		bottom: containerTop + clientTop + clientHeight,
		left: 0,
		right: 800,
		width: 800,
		height: clientTop + clientHeight,
	} );

	const addItem = ( { top, bottom, height, rectTop, rectBottom } ) => {
		const item = document.createElement( 'div' );
		item.className = 'wp-block-photo-collage-image';
		if ( top !== undefined ) {
			item.style.top = top;
		}
		if ( bottom !== undefined ) {
			item.style.bottom = bottom;
		}
		if ( height !== undefined ) {
			item.style.height = height;
		}
		item.getBoundingClientRect = () => ( {
			top: rectTop,
			bottom: rectBottom,
			left: 0,
			right: 100,
			width: 100,
			height: rectBottom - rectTop,
		} );
		container.appendChild( item );
		return item;
	};

	return { container, addItem };
};

describe( 'collectMeasuredCandidates', () => {
	afterEach( () => {
		document.body.replaceChildren();
	} );

	it( 'measures extents from the padding-box edges with style slopes', () => {
		const { container, addItem } = createMeasuredFixture( {
			containerTop: 100,
			clientTop: 5,
			clientHeight: 400,
		} );
		addItem( { top: '35%', rectTop: 245, rectBottom: 505 } );
		addItem( { bottom: '10%', rectTop: 305, rectBottom: 465 } );

		const { candidates, currentHeight } = collectMeasuredCandidates(
			container,
			getCollageItems( container )
		);

		expect( currentHeight ).toBe( 400 );
		// Padding-box top edge sits at 100 + 5 = 105; bottom edge at 505.
		expect( candidates[ 0 ] ).toEqual( { extent: 400, slope: 0.35 } );
		expect( candidates[ 1 ] ).toEqual( { extent: 200, slope: 0.1 } );
	} );

	it( 'normalizes scaled editor canvases back to layout pixels', () => {
		const { container, addItem } = createMeasuredFixture( {
			containerTop: 50,
			clientHeight: 400,
		} );
		const item = addItem( { top: '50%', rectTop: 150, rectBottom: 250 } );

		const { candidates } = collectMeasuredCandidates( container, [ item ], {
			scaleY: 0.5,
		} );

		expect( candidates[ 0 ] ).toEqual( { extent: 400, slope: 0.5 } );
		expect(
			measureExtentForElement( container, item, { scaleY: 0.5 } )
		).toBe( 400 );
	} );
} );

describe( 'getCollageItems', () => {
	afterEach( () => {
		document.body.replaceChildren();
	} );

	it( 'ignores nested collages and nested items', () => {
		const { container, addItem } = createMeasuredFixture();
		const direct = addItem( { top: '10%', rectTop: 0, rectBottom: 100 } );

		const nestedContainer = document.createElement( 'div' );
		nestedContainer.className = 'wp-block-photo-collage-container';
		const nestedItem = document.createElement( 'div' );
		nestedItem.className = 'wp-block-photo-collage-image';
		nestedContainer.appendChild( nestedItem );
		container.appendChild( nestedContainer );

		const innerItem = document.createElement( 'div' );
		innerItem.className = 'wp-block-photo-collage-frame';
		direct.appendChild( innerItem );

		expect( getCollageItems( container ) ).toEqual( [ direct ] );
	} );
} );
