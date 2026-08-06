import {
	captureProportionalSnapshot,
	createProportionalUpdatePlan,
} from '../src/blocks/utils/canvas-proportional';
import {
	COLLAGE_GEOMETRY_UNITS,
	getCollageGeometryUnits,
} from '../src/blocks/container/layout-mode';
import { solveMeasuredHeight } from '../src/blocks/utils/height-solver';

const CONTAINER_CLIENT_ID = 'container-client-id';

const defineGeometry = ( element, geometry ) => {
	Object.entries( geometry ).forEach( ( [ property, value ] ) => {
		Object.defineProperty( element, property, {
			configurable: true,
			value,
		} );
	} );
};

const createFixture = ( { blocks, parentAttributes } ) => {
	const container = document.createElement( 'div' );
	container.className = 'wp-block-photo-collage-container';
	defineGeometry( container, {
		clientHeight: 800,
		clientWidth: 1000,
		offsetHeight: 800,
	} );
	container.getBoundingClientRect = () => ( {
		top: 0,
		bottom: 800,
		left: 0,
		right: 1000,
		width: 1000,
		height: 800,
	} );

	blocks.forEach( ( block ) => {
		if ( block.geometry === null ) {
			return;
		}

		const element = document.createElement( 'div' );
		element.dataset.block = block.clientId;
		element.className =
			block.name === 'photo-collage/frame'
				? 'wp-block-photo-collage-frame'
				: 'wp-block-photo-collage-image';
		defineGeometry( element, {
			offsetHeight: block.geometry.height,
			offsetLeft: block.geometry.left,
			offsetTop: block.geometry.top,
			offsetWidth: block.geometry.width,
		} );
		element.getBoundingClientRect = () => ( {
			top: block.geometry.top,
			bottom: block.geometry.top + block.geometry.height,
			left: block.geometry.left,
			right: block.geometry.left + block.geometry.width,
			width: block.geometry.width,
			height: block.geometry.height,
		} );
		container.appendChild( element );
	} );
	document.body.appendChild( container );

	return {
		container,
		blocks: blocks.map( ( { geometry, ...block } ) => block ),
		parentAttributes,
	};
};

const capture = ( fixture ) =>
	captureProportionalSnapshot( {
		container: fixture.container,
		parentClientId: CONTAINER_CLIENT_ID,
		parentAttributes: fixture.parentAttributes,
		blocks: fixture.blocks,
	} );

describe( 'Convert to proportional planning', () => {
	afterEach( () => {
		document.body.replaceChildren();
	} );

	it( 'converts a flipping fixed container position-preservingly', () => {
		// Fixed 800px container flipping to auto. Every position is
		// re-expressed to keep its rendered pixels, so the projection uses
		// height-fraction slopes only: extents 600 and 400, both slope 0,
		// project max(200, 600, 400) = 600.
		const fixture = createFixture( {
			parentAttributes: { heightMode: 'fixed', containerHeight: '800px' },
			blocks: [
				{
					clientId: 'percent-child',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '50%',
						bottom: 'auto',
						left: '10%',
						right: 'auto',
						width: '30%',
						height: '200px',
					},
					geometry: { left: 100, top: 400, width: 300, height: 200 },
				},
				{
					clientId: 'pixel-child',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '100px',
						bottom: 'auto',
						left: '450px',
						right: 'auto',
						width: '200px',
						height: '300px',
					},
					geometry: { left: 450, top: 100, width: 200, height: 300 },
				},
			],
		} );

		const { snapshot, error } = capture( fixture );
		expect( error ).toBeUndefined();

		const plan = createProportionalUpdatePlan( { snapshot } );

		expect( plan.projectedHeight ).toBe( 600 );
		expect( plan.convertedCount ).toBe( 2 );
		// The %-top child is re-expressed against the new basis so it keeps
		// its rendered 400px position: 50% of 800 becomes 66.667% of 600.
		expect( plan.updatesByClientId ).toEqual( {
			'percent-child': {
				top: '66.667%',
			},
			'pixel-child': {
				top: '16.667%',
				left: '45%',
				width: '20%',
			},
			[ CONTAINER_CLIENT_ID ]: {
				heightMode: 'auto',
				containerHeight: '',
			},
		} );
		// Heights are never converted: they anchor the auto-height solver.
		expect( plan.updatesByClientId[ 'pixel-child' ] ).not.toHaveProperty(
			'height'
		);
	} );

	it( 'keeps a binding percent-height child solvable after conversion', () => {
		// The combined top% + height% fraction of a converted child must
		// never cross the solver's 0.995 skip: child B's height is 60% and
		// its px top would convert to 40%, summing to exactly 1. The guard
		// keeps B's top in pixels so its constraint survives, and iterating
		// the solver on the post-plan attributes reproduces the projection.
		const fixture = createFixture( {
			parentAttributes: {
				heightMode: 'fixed',
				containerHeight: '1000px',
			},
			blocks: [
				{
					clientId: 'child-a',
					name: 'photo-collage/frame',
					attributes: {
						useAbsolutePosition: true,
						top: '100px',
						bottom: 'auto',
						left: '5%',
						right: 'auto',
						width: '40%',
						height: '300px',
					},
					geometry: { left: 50, top: 100, width: 400, height: 300 },
				},
				{
					clientId: 'child-b',
					name: 'photo-collage/frame',
					attributes: {
						useAbsolutePosition: true,
						top: '200px',
						bottom: 'auto',
						left: '50%',
						right: 'auto',
						width: '40%',
						height: '60%',
					},
					geometry: { left: 500, top: 200, width: 400, height: 600 },
				},
			],
		} );
		defineGeometry( fixture.container, {
			clientHeight: 1000,
			offsetHeight: 1000,
		} );
		fixture.container.getBoundingClientRect = () => ( {
			top: 0,
			bottom: 1000,
			left: 0,
			right: 1000,
			width: 1000,
			height: 1000,
		} );

		const plan = createProportionalUpdatePlan( {
			snapshot: capture( fixture ).snapshot,
		} );

		// Projection: A extent 400 slope 0; B extent 800 slope 0.6 ->
		// (800 - 600)/0.4 = 500.
		expect( plan.projectedHeight ).toBe( 500 );
		expect( plan.updatesByClientId[ 'child-a' ] ).toMatchObject( {
			top: '20%',
		} );
		// B: 200/500 + 0.6 = 1.0 >= 0.99 -> top stays px.
		expect( plan.updatesByClientId[ 'child-b' ] ).toBeUndefined();

		// Round trip: the post-plan attribute set solves back to exactly
		// the projected height (A: 0.2H + 300; B: 200 + 0.6H).
		const roundTrip = solveMeasuredHeight( {
			candidates: [
				{ extent: 0.2 * 500 + 300, slope: 0.2 },
				{ extent: 200 + 0.6 * 500, slope: 0.6 },
			],
			currentHeight: 500,
		} );
		expect( roundTrip ).toBe( plan.projectedHeight );
	} );

	it( 'omits the container update when it is already auto height', () => {
		const fixture = createFixture( {
			parentAttributes: { heightMode: 'auto', containerHeight: '' },
			blocks: [
				{
					clientId: 'pixel-child',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '120px',
						bottom: 'auto',
						left: '40px',
						right: 'auto',
						width: '500px',
						height: 'auto',
					},
					geometry: { left: 40, top: 120, width: 500, height: 280 },
				},
			],
		} );

		const plan = createProportionalUpdatePlan( {
			snapshot: capture( fixture ).snapshot,
		} );

		expect( plan.projectedHeight ).toBe( 400 );
		expect( plan.updatesByClientId ).toEqual( {
			'pixel-child': {
				top: '30%',
				left: '4%',
				width: '50%',
			},
		} );
	} );

	it( 'converts bottom-anchored children against their own basis', () => {
		const fixture = createFixture( {
			parentAttributes: { heightMode: 'auto', containerHeight: '' },
			blocks: [
				{
					clientId: 'bottom-child',
					name: 'photo-collage/frame',
					attributes: {
						useAbsolutePosition: true,
						top: 'auto',
						bottom: '40px',
						left: '5%',
						right: 'auto',
						width: '40%',
						height: '160px',
					},
					geometry: { left: 50, top: 600, width: 400, height: 160 },
				},
				{
					clientId: 'anchor-image',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '0%',
						bottom: 'auto',
						left: '50%',
						right: 'auto',
						width: '45%',
						height: 'auto',
					},
					geometry: { left: 500, top: 0, width: 450, height: 500 },
				},
			],
		} );

		const plan = createProportionalUpdatePlan( {
			snapshot: capture( fixture ).snapshot,
		} );

		// bottom-child extent: 800 - 600 = 200 with slope 0; anchor-image
		// extent 500 with slope 0 -> projected height 500.
		expect( plan.projectedHeight ).toBe( 500 );
		expect( plan.updatesByClientId[ 'bottom-child' ] ).toEqual( {
			bottom: '8%',
		} );
	} );

	it( 'keeps near-bottom pixel offsets in pixels', () => {
		const fixture = createFixture( {
			parentAttributes: { heightMode: 'auto', containerHeight: '' },
			blocks: [
				{
					clientId: 'anchor-image',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '495px',
						bottom: 'auto',
						left: '0%',
						right: 'auto',
						width: '10%',
						height: '5px',
					},
					geometry: { left: 0, top: 495, width: 100, height: 5 },
				},
			],
		} );

		const plan = createProportionalUpdatePlan( {
			snapshot: capture( fixture ).snapshot,
		} );

		// 495/500 = 0.99 crosses the solver guard: the top stays px.
		expect( plan.projectedHeight ).toBe( 500 );
		expect( plan.updatesByClientId ).not.toHaveProperty( 'anchor-image' );
	} );

	it( 'keeps a viewport-scaled fixed container fixed', () => {
		const fixture = createFixture( {
			parentAttributes: {
				heightMode: 'fixed',
				containerHeight: '141vw',
			},
			blocks: [
				{
					clientId: 'pixel-child',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '200px',
						bottom: 'auto',
						left: '10%',
						right: 'auto',
						width: '30%',
						height: '20%',
					},
					geometry: { left: 100, top: 200, width: 300, height: 160 },
				},
			],
		} );

		const { snapshot, error } = capture( fixture );
		// The all-percentage-height guard does not apply: the container's
		// height never depends on its children here.
		expect( error ).toBeUndefined();

		const plan = createProportionalUpdatePlan( { snapshot } );

		// Basis is the rendered fixed height (800), and the vw height mode
		// is preserved rather than flipped to auto.
		expect( plan.projectedHeight ).toBe( 800 );
		expect( plan.updatesByClientId ).toEqual( {
			'pixel-child': { top: '25%' },
		} );
	} );

	it.each( [
		[
			'nothing-to-convert',
			{
				parentAttributes: { heightMode: 'auto', containerHeight: '' },
				blocks: [
					{
						clientId: 'flow-child',
						name: 'photo-collage/image',
						attributes: { useAbsolutePosition: false },
						geometry: {
							left: 0,
							top: 0,
							width: 400,
							height: 300,
						},
					},
				],
			},
		],
		[
			'no-height-anchor',
			{
				parentAttributes: { heightMode: 'auto', containerHeight: '' },
				blocks: [
					{
						clientId: 'percent-height-child',
						name: 'photo-collage/frame',
						attributes: {
							useAbsolutePosition: true,
							top: '10%',
							bottom: 'auto',
							left: '10%',
							right: 'auto',
							width: '50%',
							height: '30%',
						},
						geometry: {
							left: 100,
							top: 80,
							width: 500,
							height: 240,
						},
					},
				],
			},
		],
		[
			'child-unavailable',
			{
				parentAttributes: { heightMode: 'auto', containerHeight: '' },
				blocks: [
					{
						clientId: 'detached-child',
						name: 'photo-collage/image',
						attributes: { useAbsolutePosition: true },
						geometry: null,
					},
				],
			},
		],
	] )( 'refuses with %s', ( expectedError, fixtureOptions ) => {
		const fixture = createFixture( fixtureOptions );
		expect( capture( fixture ) ).toEqual( { error: expectedError } );
	} );
} );

describe( 'getCollageGeometryUnits', () => {
	const absoluteImage = ( attributes ) => ( {
		name: 'photo-collage/image',
		attributes: { useAbsolutePosition: true, ...attributes },
	} );

	it( 'returns null without absolutely positioned children', () => {
		expect( getCollageGeometryUnits( [], {} ) ).toBeNull();
		expect(
			getCollageGeometryUnits(
				[
					{
						name: 'photo-collage/image',
						attributes: { useAbsolutePosition: false },
					},
				],
				{ heightMode: 'auto' }
			)
		).toBeNull();
	} );

	it( 'classifies all-percentage collages in auto containers as proportional', () => {
		expect(
			getCollageGeometryUnits(
				[
					absoluteImage( {
						top: '5%',
						left: '10%',
						width: '40%',
						height: '200px',
					} ),
				],
				{ heightMode: 'auto', containerHeight: '' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.PROPORTIONAL );
	} );

	it( 'ignores explicit heights but not positions', () => {
		expect(
			getCollageGeometryUnits(
				[
					absoluteImage( {
						top: '250px',
						left: '10%',
						width: '40%',
					} ),
				],
				{ heightMode: 'auto' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.MIXED );
	} );

	it( 'treats a pixel fixed height as pixel-bound geometry', () => {
		expect(
			getCollageGeometryUnits(
				[ absoluteImage( { top: '5%', left: '10%', width: '40%' } ) ],
				{ heightMode: 'fixed', containerHeight: '800px' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.MIXED );
		expect(
			getCollageGeometryUnits(
				[
					absoluteImage( {
						top: '100px',
						left: '20px',
						width: '300px',
					} ),
				],
				{ heightMode: 'fixed', containerHeight: '800px' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.PIXEL );
	} );

	it( 'recognizes the viewport-height manual fix as proportional', () => {
		expect(
			getCollageGeometryUnits(
				[
					absoluteImage( {
						top: '5%',
						left: '10%',
						width: '40%',
					} ),
				],
				{ heightMode: 'fixed', containerHeight: '141vw' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.PROPORTIONAL );
	} );

	it( 'reads the active anchor sides', () => {
		expect(
			getCollageGeometryUnits(
				[
					absoluteImage( {
						top: 'auto',
						bottom: '10%',
						left: 'auto',
						right: '5%',
						width: '40%',
					} ),
				],
				{ heightMode: 'auto' }
			)
		).toBe( COLLAGE_GEOMETRY_UNITS.PROPORTIONAL );
	} );
} );
