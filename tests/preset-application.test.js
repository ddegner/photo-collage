import {
	applyPresetLayoutToAttributes,
	createPresetApplicationPlan,
} from '../src/blocks/container/preset-application';
import {
	COLLAGE_LAYOUT_STATE,
	getCollageLayoutState,
} from '../src/blocks/container/layout-mode';

const imageBlock = ( clientId, attributes = {} ) => ( {
	clientId,
	name: 'photo-collage/image',
	attributes,
	innerBlocks: [],
} );

const frameBlock = ( clientId ) => ( {
	clientId,
	name: 'photo-collage/frame',
	attributes: { width: '40%' },
	innerBlocks: [ { clientId: `${ clientId }-paragraph` } ],
} );

const createImageBlock = ( name, attributes ) => ( {
	clientId: `new-${ attributes.width }`,
	name,
	attributes,
	innerBlocks: [],
} );

describe( 'preset application', () => {
	it( 'preserves content and presentation attributes while changing layout', () => {
		const attributes = {
			url: 'photo.jpg',
			caption: 'Keep me',
			href: 'https://example.com',
			backgroundType: 'full-image',
			useAbsolutePosition: true,
			top: '80%',
			left: '70%',
			rotation: 24,
			style: {
				color: { background: '#fff' },
				spacing: {
					padding: { top: '12px' },
					margin: { top: '40%' },
				},
			},
		};

		const result = applyPresetLayoutToAttributes( attributes, {
			width: '33%',
			marginLeft: '6%',
			marginTop: '-10%',
			zIndex: 2,
		} );

		expect( result ).toMatchObject( {
			url: 'photo.jpg',
			caption: 'Keep me',
			href: 'https://example.com',
			backgroundType: 'full-image',
			useAbsolutePosition: false,
			top: 'auto',
			left: 'auto',
			width: '33%',
			height: 'auto',
			zIndex: 2,
			rotation: 0,
			style: {
				color: { background: '#fff' },
				spacing: {
					padding: { top: '12px' },
					margin: {
						top: '-10%',
						right: '0%',
						bottom: '0%',
						left: '6%',
					},
				},
			},
		} );
	} );

	it( 'locks native movement for absolute presets while preserving other locks', () => {
		const result = applyPresetLayoutToAttributes(
			{
				lock: {
					move: false,
					remove: true,
					edit: false,
					futureLock: 'keep',
				},
			},
			{
				useAbsolutePosition: true,
				top: '10%',
				left: '20%',
			}
		);

		expect( result.lock ).toEqual( {
			move: true,
			remove: true,
			edit: false,
			futureLock: 'keep',
		} );
	} );

	it( 'clears only the move lock for flow presets', () => {
		const result = applyPresetLayoutToAttributes(
			{
				lock: {
					move: true,
					remove: true,
					edit: false,
					futureLock: 'keep',
				},
			},
			{ width: '60%' }
		);

		expect( result.lock ).toEqual( {
			remove: true,
			edit: false,
			futureLock: 'keep',
		} );
	} );

	it( 'omits an empty lock after returning an item to flow', () => {
		const result = applyPresetLayoutToAttributes(
			{ lock: { move: true } },
			{ width: '60%' }
		);

		expect( result.lock ).toBeUndefined();
	} );

	it( 'preserves frames, image identities, and complete image attributes', () => {
		const first = imageBlock( 'image-1', {
			url: 'one.jpg',
			linkDestination: 'custom',
			divClass: 'keep-class',
		} );
		const frame = frameBlock( 'frame-1' );
		const second = imageBlock( 'image-2', {
			url: 'two.jpg',
			lightbox: { enabled: true },
		} );

		const plan = createPresetApplicationPlan(
			[ first, frame, second ],
			[ { width: '60%' }, { width: '40%' } ],
			createImageBlock
		);

		expect( plan.removedBlocks ).toEqual( [] );
		expect( plan.blocks.map( ( block ) => block.clientId ) ).toEqual( [
			'image-1',
			'frame-1',
			'image-2',
		] );
		expect( plan.blocks[ 0 ].attributes ).toMatchObject( {
			url: 'one.jpg',
			linkDestination: 'custom',
			divClass: 'keep-class',
			width: '60%',
		} );
		expect( plan.blocks[ 1 ] ).toBe( frame );
		expect( plan.blocks[ 2 ].attributes ).toMatchObject( {
			url: 'two.jpg',
			lightbox: { enabled: true },
			width: '40%',
		} );
	} );

	it( 'adds blank image slots without replacing existing content', () => {
		const first = imageBlock( 'image-1', { url: 'one.jpg' } );
		const frame = frameBlock( 'frame-1' );

		const plan = createPresetApplicationPlan(
			[ first, frame ],
			[ { width: '50%' }, { width: '25%' }, { width: '25%' } ],
			createImageBlock
		);

		expect( plan.removedBlocks ).toEqual( [] );
		expect( plan.blocks.map( ( block ) => block.name ) ).toEqual( [
			'photo-collage/image',
			'photo-collage/image',
			'photo-collage/image',
			'photo-collage/frame',
		] );
		expect( plan.blocks[ 0 ].clientId ).toBe( 'image-1' );
		expect( plan.blocks[ 3 ] ).toBe( frame );
	} );

	it( 'reports only surplus images for confirmation', () => {
		const first = imageBlock( 'image-1', { url: 'one.jpg' } );
		const second = imageBlock( 'image-2', { url: 'two.jpg' } );
		const frame = frameBlock( 'frame-1' );

		const plan = createPresetApplicationPlan(
			[ first, second, frame ],
			[ { width: '100%' } ],
			createImageBlock
		);

		expect( plan.blocks ).toHaveLength( 2 );
		expect( plan.blocks[ 0 ].clientId ).toBe( 'image-1' );
		expect( plan.blocks[ 1 ] ).toBe( frame );
		expect( plan.removedBlocks ).toEqual( [ second ] );
	} );
} );

describe( 'collage layout state', () => {
	it( 'treats empty and all-flow collages as responsive', () => {
		expect( getCollageLayoutState( [] ) ).toBe(
			COLLAGE_LAYOUT_STATE.RESPONSIVE
		);
		expect(
			getCollageLayoutState( [
				imageBlock( 'image-1' ),
				frameBlock( 'frame-1' ),
			] )
		).toBe( COLLAGE_LAYOUT_STATE.RESPONSIVE );
	} );

	it( 'derives freeform only when every positionable child is absolute', () => {
		expect(
			getCollageLayoutState( [
				imageBlock( 'image-1', { useAbsolutePosition: true } ),
				{
					...frameBlock( 'frame-1' ),
					attributes: {
						useAbsolutePosition: true,
					},
				},
			] )
		).toBe( COLLAGE_LAYOUT_STATE.FREEFORM );
	} );

	it( 'derives mixed state and ignores unknown legacy children', () => {
		expect(
			getCollageLayoutState( [
				imageBlock( 'image-1', { useAbsolutePosition: true } ),
				frameBlock( 'frame-1' ),
				{
					clientId: 'legacy',
					name: 'core/paragraph',
					attributes: {},
				},
			] )
		).toBe( COLLAGE_LAYOUT_STATE.MIXED );
	} );
} );
