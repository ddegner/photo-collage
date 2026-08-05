import {
	captureFreeformSnapshot,
	createFreeformUpdatePlan,
} from '../src/blocks/utils/canvas-freeform';

const defineGeometry = ( element, geometry ) => {
	Object.entries( geometry ).forEach( ( [ property, value ] ) => {
		Object.defineProperty( element, property, {
			configurable: true,
			value,
		} );
	} );
};

const createBlockElement = (
	clientId,
	{ left, top, width, height, display, visibility } = {}
) => {
	const element = document.createElement( 'div' );
	element.dataset.block = clientId;
	element.style.display = display || 'block';
	element.style.visibility = visibility || 'visible';
	defineGeometry( element, {
		offsetHeight: height,
		offsetLeft: left,
		offsetTop: top,
		offsetWidth: width,
	} );
	return element;
};

const createFixture = () => {
	const container = document.createElement( 'div' );
	container.className = 'wp-block-photo-collage-container';
	container.style.position = 'relative';
	container.style.boxSizing = 'border-box';
	container.style.border = '10px solid transparent';
	container.style.padding = '40px 50px';
	defineGeometry( container, {
		clientWidth: 1000,
		offsetWidth: 1020,
	} );

	const imageElement = createBlockElement( 'image-a', {
		left: 140,
		top: 60,
		width: 380,
		height: 240,
	} );
	imageElement.className = 'wp-block-photo-collage-image';

	const frameElement = createBlockElement( 'frame-b', {
		left: 520,
		top: 80,
		width: 300,
		height: 200,
	} );
	frameElement.className = 'wp-block-photo-collage-frame';
	const nestedParagraph = document.createElement( 'p' );
	nestedParagraph.dataset.block = 'nested-paragraph';
	nestedParagraph.textContent = 'Nested frame content';
	frameElement.appendChild( nestedParagraph );

	const absoluteElement = createBlockElement( 'image-c', {
		left: 700,
		top: 260,
		width: 200,
		height: 150,
	} );
	absoluteElement.className = 'wp-block-photo-collage-image';

	container.append( imageElement, frameElement, absoluteElement );
	document.body.appendChild( container );

	const blocks = [
		{
			clientId: 'image-a',
			name: 'photo-collage/image',
			attributes: {
				align: 'wide',
				alt: 'A retained alt description',
				caption: 'A retained caption',
				height: 'auto',
				lock: { remove: false },
				style: {
					color: { background: '#123456' },
					spacing: {
						blockGap: '12px',
						margin: {
							top: '6%',
							right: '2%',
							bottom: '4%',
							left: '14%',
						},
						padding: { left: '18px', right: '18px' },
					},
				},
				url: 'https://example.test/image-a.jpg',
				useAbsolutePosition: false,
				width: '50%',
			},
			innerBlocks: [],
		},
		{
			clientId: 'frame-b',
			name: 'photo-collage/frame',
			attributes: {
				backgroundColor: 'contrast',
				height: '40%',
				style: {
					border: { width: '2px' },
					spacing: {
						margin: {
							top: '2%',
							right: '0%',
							bottom: '5%',
							left: '2%',
						},
						padding: '24px',
					},
				},
				useAbsolutePosition: false,
				width: '300px',
			},
			innerBlocks: [
				{
					clientId: 'nested-paragraph',
					name: 'core/paragraph',
					attributes: { content: 'Nested frame content' },
					innerBlocks: [],
				},
			],
		},
		{
			clientId: 'image-c',
			name: 'photo-collage/image',
			attributes: {
				alt: 'Absolute image',
				bottom: 'auto',
				caption: 'Existing absolute caption',
				height: 'auto',
				left: '70%',
				lock: { remove: false },
				right: 'auto',
				top: '260px',
				useAbsolutePosition: true,
				width: '20%',
				zIndex: 3,
			},
			innerBlocks: [],
		},
	];

	return {
		absoluteElement,
		blocks,
		container,
		frameElement,
		imageElement,
		parentAttributes: {
			containerHeight: '   ',
			heightMode: 'fixed',
			stackOnMobile: true,
		},
	};
};

describe( 'atomic flow-to-freeform planning', () => {
	afterEach( () => {
		document.body.replaceChildren();
	} );

	it( 'pins all flow siblings without changing order, content, or existing absolute geometry', () => {
		const fixture = createFixture();
		const capture = captureFreeformSnapshot( {
			container: fixture.container,
			parentClientId: 'container-parent',
			parentAttributes: fixture.parentAttributes,
			blocks: fixture.blocks,
			canMoveBlock: () => true,
		} );

		expect( capture.error ).toBeUndefined();
		expect( capture.snapshot.containerWidth ).toBe( 1000 );
		expect( capture.snapshot.promotedCount ).toBe( 2 );
		expect(
			capture.snapshot.items.map( ( item ) => item.clientId )
		).toEqual( [ 'image-a', 'frame-b', 'image-c' ] );
		expect(
			capture.snapshot.items.find(
				( item ) => item.clientId === 'image-c'
			)
		).not.toHaveProperty( 'borderRect' );

		const plan = createFreeformUpdatePlan( {
			snapshot: capture.snapshot,
			movedClientId: 'image-a',
			movedBorderRect: {
				left: 215,
				top: 95,
				width: 380,
				height: 240,
			},
		} );

		expect( plan.promotedCount ).toBe( 2 );
		expect( plan.updatesByClientId[ 'image-a' ] ).toMatchObject( {
			align: undefined,
			bottom: 'auto',
			height: 'auto',
			left: '21.5%',
			lock: { move: true, remove: false },
			right: 'auto',
			top: '95px',
			useAbsolutePosition: true,
			width: '38%',
		} );
		expect( plan.updatesByClientId[ 'image-a' ].style ).toMatchObject( {
			color: { background: '#123456' },
			spacing: {
				blockGap: '12px',
				margin: {
					top: '0%',
					right: '0%',
					bottom: '0%',
					left: '0%',
				},
				padding: { left: '18px', right: '18px' },
			},
		} );
		expect( plan.updatesByClientId[ 'frame-b' ] ).toMatchObject( {
			bottom: 'auto',
			height: '200px',
			left: '52%',
			lock: { move: true },
			right: 'auto',
			top: '80px',
			useAbsolutePosition: true,
			width: '30%',
		} );
		expect( plan.updatesByClientId[ 'frame-b' ].style ).toMatchObject( {
			border: { width: '2px' },
			spacing: {
				margin: {
					top: '0%',
					right: '0%',
					bottom: '0%',
					left: '0%',
				},
				padding: '24px',
			},
		} );
		expect( plan.updatesByClientId[ 'image-c' ] ).toEqual( {
			lock: { move: true, remove: false },
		} );
		expect( Object.keys( plan.updatesByClientId[ 'image-c' ] ) ).toEqual( [
			'lock',
		] );
		expect( plan.updatesByClientId[ 'container-parent' ] ).toEqual( {
			containerHeight: '',
			heightMode: 'auto',
		} );

		const resultingBlocks = fixture.blocks.map( ( block ) => ( {
			...block,
			attributes: {
				...block.attributes,
				...( plan.updatesByClientId[ block.clientId ] || {} ),
			},
		} ) );

		expect( resultingBlocks.map( ( block ) => block.clientId ) ).toEqual(
			fixture.blocks.map( ( block ) => block.clientId )
		);
		expect( resultingBlocks[ 0 ].attributes ).toMatchObject( {
			alt: 'A retained alt description',
			caption: 'A retained caption',
			url: 'https://example.test/image-a.jpg',
		} );
		expect( resultingBlocks[ 1 ].attributes.backgroundColor ).toBe(
			'contrast'
		);
		expect( resultingBlocks[ 1 ].innerBlocks ).toEqual(
			fixture.blocks[ 1 ].innerBlocks
		);
		expect( resultingBlocks[ 1 ].innerBlocks[ 0 ].attributes.content ).toBe(
			'Nested frame content'
		);
		expect( resultingBlocks[ 2 ].attributes ).toMatchObject( {
			alt: 'Absolute image',
			caption: 'Existing absolute caption',
			height: 'auto',
			left: '70%',
			top: '260px',
			useAbsolutePosition: true,
			width: '20%',
			zIndex: 3,
		} );
		expect( fixture.blocks[ 0 ].attributes.style.spacing.margin.left ).toBe(
			'14%'
		);
	} );

	it.each( [
		[
			'hidden',
			{
				elementOptions: {
					left: 520,
					top: 80,
					width: 300,
					height: 200,
					visibility: 'hidden',
				},
				expectedError: 'child-unmeasurable',
				canMoveBlock: () => true,
			},
		],
		[
			'missing',
			{
				elementOptions: null,
				expectedError: 'child-unavailable',
				canMoveBlock: () => true,
			},
		],
		[
			'zero-width',
			{
				elementOptions: {
					left: 520,
					top: 80,
					width: 0,
					height: 200,
				},
				expectedError: 'child-unmeasurable',
				canMoveBlock: () => true,
			},
		],
		[
			'move-locked',
			{
				elementOptions: {
					left: 520,
					top: 80,
					width: 300,
					height: 200,
				},
				expectedError: 'child-locked',
				canMoveBlock: ( clientId ) => clientId !== 'blocked-flow',
			},
		],
	] )(
		'aborts the complete capture when a flow sibling is %s',
		( _label, { elementOptions, expectedError, canMoveBlock } ) => {
			const fixture = createFixture();
			fixture.frameElement.remove();

			if ( elementOptions ) {
				const blockedElement = createBlockElement(
					'blocked-flow',
					elementOptions
				);
				blockedElement.className = 'wp-block-photo-collage-frame';
				fixture.container.insertBefore(
					blockedElement,
					fixture.absoluteElement
				);
			}

			const blocks = [
				fixture.blocks[ 0 ],
				{
					...fixture.blocks[ 1 ],
					clientId: 'blocked-flow',
				},
				fixture.blocks[ 2 ],
			];
			const capture = captureFreeformSnapshot( {
				container: fixture.container,
				parentClientId: 'container-parent',
				parentAttributes: fixture.parentAttributes,
				blocks,
				canMoveBlock,
			} );

			expect( capture ).toEqual( { error: expectedError } );
			expect( capture.snapshot ).toBeUndefined();
			expect( fixture.blocks[ 0 ].attributes.useAbsolutePosition ).toBe(
				false
			);
			expect( fixture.blocks[ 2 ].attributes.left ).toBe( '70%' );
		}
	);
} );
