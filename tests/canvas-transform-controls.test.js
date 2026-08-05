// React is supplied transitively by the WordPress test runtime.
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, createElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

const mockToggleSelection = jest.fn();
const mockUpdateBlockAttributes = jest.fn();
const mockUndo = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockCreateSuccessNotice = jest.fn();
const mockCanMoveBlock = jest.fn();
const mockGetBlockAttributes = jest.fn();
const mockGetBlocks = jest.fn();

jest.mock(
	'@wordpress/block-editor',
	() => ( {
		store: 'block-editor',
		useBlockEditingMode: () => 'default',
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/components',
	() => ( {
		Icon: () => null,
		Tooltip: ( { children } ) => children,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/data',
	() => ( {
		useDispatch: ( store ) => {
			if ( store === 'block-editor' ) {
				return {
					toggleSelection: mockToggleSelection,
					updateBlockAttributes: mockUpdateBlockAttributes,
				};
			}
			if ( store === 'core-data' ) {
				return { undo: mockUndo };
			}
			if ( store === 'notices' ) {
				return {
					createErrorNotice: mockCreateErrorNotice,
					createSuccessNotice: mockCreateSuccessNotice,
				};
			}
			return {};
		},
		useSelect: ( mapSelect ) =>
			mapSelect( ( store ) => {
				if ( store !== 'block-editor' ) {
					return {};
				}
				return {
					canMoveBlock: mockCanMoveBlock,
					getBlockAttributes: mockGetBlockAttributes,
					getBlocks: mockGetBlocks,
				};
			} ),
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/core-data',
	() => ( {
		store: 'core-data',
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/notices',
	() => ( {
		store: 'notices',
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/i18n',
	() => ( {
		__: ( value ) => value,
		sprintf: ( template, value ) => template.replace( '%s', value ),
	} ),
	{ virtual: true }
);

import CanvasTransformControls from '../src/blocks/components/CanvasTransformControls';

const PARENT_CLIENT_ID = 'container-client-id';
const ZERO_MARGINS = {
	top: '0%',
	right: '0%',
	bottom: '0%',
	left: '0%',
};
const BASE_ATTRIBUTES = {
	useAbsolutePosition: true,
	left: '10%',
	right: 'auto',
	top: '80px',
	bottom: 'auto',
	width: '30%',
	height: 'auto',
	rotation: 0,
};

const createAbsoluteSpecs = () => [
	{
		clientId: 'image-one',
		name: 'photo-collage/image',
		attributes: {
			...BASE_ATTRIBUTES,
			lock: { remove: false },
		},
		geometry: {
			left: 100,
			top: 80,
			width: 300,
			height: 200,
		},
	},
	{
		clientId: 'image-two',
		name: 'photo-collage/image',
		attributes: {
			...BASE_ATTRIBUTES,
			left: '50%',
			top: '240px',
			width: '20%',
		},
		geometry: {
			left: 500,
			top: 240,
			width: 200,
			height: 150,
		},
	},
	{
		clientId: 'frame-three',
		name: 'photo-collage/frame',
		attributes: {
			...BASE_ATTRIBUTES,
			left: '72%',
			top: '400px',
			width: '18%',
			lock: { move: true, remove: true },
		},
		geometry: {
			left: 720,
			top: 400,
			width: 180,
			height: 120,
		},
	},
];

const createFlowSpecs = () => [
	{
		clientId: 'image-one',
		name: 'photo-collage/image',
		attributes: {
			useAbsolutePosition: false,
			align: 'wide',
			width: '25%',
			height: 'auto',
			rotation: 0,
			lock: { remove: false },
			style: {
				color: { background: '#fff' },
				spacing: { blockGap: '12px' },
			},
		},
		geometry: {
			left: 20,
			top: 30,
			width: 250,
			height: 180,
		},
	},
	{
		clientId: 'frame-two',
		name: 'photo-collage/frame',
		attributes: {
			useAbsolutePosition: false,
			width: '32%',
			height: '210px',
			rotation: 0,
		},
		geometry: {
			left: 300,
			top: 40,
			width: 320,
			height: 210,
		},
	},
	{
		clientId: 'image-three',
		name: 'photo-collage/image',
		attributes: {
			useAbsolutePosition: false,
			width: '50%',
			height: '240px',
			rotation: 0,
			lock: { remove: true },
			style: {
				typography: { lineHeight: '1.4' },
			},
		},
		geometry: {
			left: 100,
			top: 260,
			width: 500,
			height: 240,
		},
	},
];

const defineGeometry = ( element, geometry ) => {
	Object.entries( geometry ).forEach( ( [ property, value ] ) => {
		Object.defineProperty( element, property, {
			configurable: true,
			value,
		} );
	} );
};

const createPointerEvent = (
	type,
	{ clientX, clientY, buttons, pointerId = 1, shiftKey = false }
) => {
	const event = new window.MouseEvent( type, {
		bubbles: true,
		button: 0,
		buttons,
		cancelable: true,
		clientX,
		clientY,
		shiftKey,
	} );

	Object.defineProperties( event, {
		isPrimary: {
			value: true,
		},
		pointerId: {
			value: pointerId,
		},
	} );
	return event;
};

const createKeyboardEvent = (
	type,
	key,
	{ repeat = false, shiftKey = false } = {}
) =>
	new window.KeyboardEvent( type, {
		bubbles: true,
		cancelable: true,
		key,
		repeat,
		shiftKey,
	} );

const createFixture = ( {
	specs = createAbsoluteSpecs().slice( 0, 1 ),
	selectedClientId = specs[ 0 ].clientId,
	parentAttributes = {
		heightMode: 'fixed',
		containerHeight: '600px',
	},
} = {} ) => {
	const container = document.createElement( 'div' );
	const elements = new Map();
	let mount = null;

	container.className = 'wp-block-photo-collage-container';
	container.dataset.heightMode = parentAttributes.heightMode || 'fixed';
	container.style.position = 'relative';
	defineGeometry( container, {
		clientHeight: 600,
		clientWidth: 1000,
		offsetHeight: 600,
		offsetWidth: 1000,
	} );
	container.getBoundingClientRect = () => ( {
		bottom: 600,
		height: 600,
		left: 0,
		right: 1000,
		top: 0,
		width: 1000,
		x: 0,
		y: 0,
	} );

	const blocks = specs.map( ( spec ) => {
		const element = document.createElement( 'div' );
		const { left, top, width, height } = spec.geometry;

		element.className =
			spec.name === 'photo-collage/frame'
				? 'wp-block-photo-collage-frame'
				: 'wp-block-photo-collage-image';
		element.dataset.block = spec.clientId;
		element.style.position = spec.attributes.useAbsolutePosition
			? 'absolute'
			: 'relative';
		element.style.left = `${ left }px`;
		element.style.top = `${ top }px`;
		element.style.width = `${ width }px`;
		element.style.height = `${ height }px`;
		defineGeometry( element, {
			offsetHeight: height,
			offsetLeft: left,
			offsetParent: container,
			offsetTop: top,
			offsetWidth: width,
		} );
		element.getBoundingClientRect = () => ( {
			bottom: top + height,
			height,
			left,
			right: left + width,
			top,
			width,
			x: left,
			y: top,
		} );

		if ( spec.clientId === selectedClientId ) {
			mount = document.createElement( 'div' );
			element.appendChild( mount );
		}

		container.appendChild( element );
		elements.set( spec.clientId, element );
		return {
			attributes: spec.attributes,
			clientId: spec.clientId,
			name: spec.name,
		};
	} );

	if ( ! mount ) {
		throw new Error( 'The selected fixture block must exist.' );
	}

	document.body.appendChild( container );
	mockGetBlocks.mockImplementation( ( clientId ) =>
		clientId === PARENT_CLIENT_ID ? blocks : []
	);
	mockGetBlockAttributes.mockImplementation( ( clientId ) =>
		clientId === PARENT_CLIENT_ID ? parentAttributes : {}
	);

	return {
		blocks,
		container,
		elements,
		mount,
		parentAttributes,
		selectedClientId,
		selectedElement: elements.get( selectedClientId ),
	};
};

const getControl = ( fixture, operation ) =>
	fixture.mount.querySelector( `[data-pc-canvas-control="${ operation }"]` );

describe( 'CanvasTransformControls', () => {
	let animationFrames;
	let nextAnimationFrameId;
	let reactRoot;

	beforeAll( () => {
		global.IS_REACT_ACT_ENVIRONMENT = true;
	} );

	beforeEach( () => {
		animationFrames = new Map();
		nextAnimationFrameId = 0;
		[
			mockToggleSelection,
			mockUpdateBlockAttributes,
			mockUndo,
			mockCreateErrorNotice,
			mockCreateSuccessNotice,
			mockCanMoveBlock,
			mockGetBlockAttributes,
			mockGetBlocks,
		].forEach( ( mockFunction ) => mockFunction.mockReset() );
		mockCanMoveBlock.mockReturnValue( true );
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation(
			( callback ) => {
				nextAnimationFrameId += 1;
				animationFrames.set( nextAnimationFrameId, callback );
				return nextAnimationFrameId;
			}
		);
		jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation(
			( animationFrameId ) => {
				animationFrames.delete( animationFrameId );
			}
		);
	} );

	afterEach( () => {
		if ( reactRoot ) {
			act( () => reactRoot.unmount() );
			reactRoot = null;
		}
		document.body.replaceChildren();
		jest.restoreAllMocks();
	} );

	const renderControls = (
		fixture,
		{
			attributes,
			isSelected = true,
			parentClientId = PARENT_CLIENT_ID,
			preserveAutoHeight = true,
		} = {}
	) => {
		const selectedBlock = fixture.blocks.find(
			( block ) => block.clientId === fixture.selectedClientId
		);

		act( () => {
			if ( ! reactRoot ) {
				reactRoot = createRoot( fixture.mount );
			}
			reactRoot.render(
				createElement( CanvasTransformControls, {
					attributes: attributes || selectedBlock.attributes,
					blockRef: { current: fixture.selectedElement },
					clientId: fixture.selectedClientId,
					isSelected,
					itemName:
						selectedBlock.name === 'photo-collage/frame'
							? 'frame'
							: 'image',
					parentClientId,
					preserveAutoHeight,
				} )
			);
		} );
	};

	const flushNextAnimationFrame = () => {
		const entry = animationFrames.entries().next().value;

		expect( entry ).toBeDefined();
		animationFrames.delete( entry[ 0 ] );
		act( () => entry[ 1 ]( 0 ) );
	};

	const flushAllAnimationFrames = () => {
		let flushCount = 0;

		while ( animationFrames.size > 0 ) {
			flushNextAnimationFrame();
			flushCount += 1;
			if ( flushCount > 20 ) {
				throw new Error( 'Animation frame queue did not settle.' );
			}
		}
	};

	it( 'commits absolute pointer movement as one bulk update with unique client IDs', () => {
		const fixture = createFixture( {
			specs: createAbsoluteSpecs(),
			selectedClientId: 'image-one',
		} );
		renderControls( fixture );
		const moveHandle = getControl( fixture, 'move' );

		act( () => {
			moveHandle.dispatchEvent(
				createPointerEvent( 'pointerdown', {
					clientX: 100,
					clientY: 100,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointermove', {
					clientX: 120,
					clientY: 110,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointermove', {
					clientX: 150,
					clientY: 125,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointerup', {
					clientX: 150,
					clientY: 125,
					buttons: 0,
				} )
			);
		} );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		const [ clientIds, updatesByClientId, unique ] =
			mockUpdateBlockAttributes.mock.calls[ 0 ];

		// Siblings the user never touched must stay out of the transaction.
		expect( clientIds ).toEqual( [ 'image-one' ] );
		expect( updatesByClientId ).toEqual( {
			'image-one': {
				useAbsolutePosition: true,
				left: '15%',
				top: '105px',
				right: 'auto',
				bottom: 'auto',
			},
		} );
		expect( unique ).toBe( true );
		expect( mockToggleSelection.mock.calls ).toEqual( [
			[ false ],
			[ true ],
		] );

		flushAllAnimationFrames();
		expect( fixture.container.hasAttribute( 'data-pc-interacting' ) ).toBe(
			false
		);
		expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
	} );

	it( 'atomically promotes all three flow siblings on the first drag without reordering them', () => {
		const specs = createFlowSpecs();
		const fixture = createFixture( {
			specs,
			selectedClientId: 'frame-two',
			parentAttributes: {
				heightMode: 'fixed',
				containerHeight: '',
			},
		} );
		const originalBlocks = JSON.parse( JSON.stringify( fixture.blocks ) );
		const originalOrder = fixture.blocks.map( ( block ) => block.clientId );

		renderControls( fixture );
		const moveHandle = getControl( fixture, 'move' );
		act( () => {
			moveHandle.dispatchEvent(
				createPointerEvent( 'pointerdown', {
					clientX: 100,
					clientY: 100,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointermove', {
					clientX: 150,
					clientY: 125,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointerup', {
					clientX: 150,
					clientY: 125,
					buttons: 0,
				} )
			);
		} );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		const [ clientIds, updatesByClientId, unique ] =
			mockUpdateBlockAttributes.mock.calls[ 0 ];

		expect( clientIds ).toEqual( [
			'image-one',
			'frame-two',
			'image-three',
			PARENT_CLIENT_ID,
		] );
		expect( updatesByClientId ).toEqual( {
			'image-one': {
				useAbsolutePosition: true,
				left: '2%',
				top: '30px',
				right: 'auto',
				bottom: 'auto',
				width: '25%',
				height: 'auto',
				align: undefined,
				marginTop: '0%',
				marginRight: '0%',
				marginBottom: '0%',
				marginLeft: '0%',
				style: {
					color: { background: '#fff' },
					spacing: {
						blockGap: '12px',
						margin: ZERO_MARGINS,
					},
				},
				lock: { remove: false, move: true },
			},
			'frame-two': {
				useAbsolutePosition: true,
				left: '35%',
				top: '65px',
				right: 'auto',
				bottom: 'auto',
				width: '32%',
				height: '210px',
				align: undefined,
				marginTop: '0%',
				marginRight: '0%',
				marginBottom: '0%',
				marginLeft: '0%',
				style: {
					spacing: { margin: ZERO_MARGINS },
				},
				lock: { move: true },
			},
			'image-three': {
				useAbsolutePosition: true,
				left: '10%',
				top: '260px',
				right: 'auto',
				bottom: 'auto',
				width: '50%',
				height: '240px',
				align: undefined,
				marginTop: '0%',
				marginRight: '0%',
				marginBottom: '0%',
				marginLeft: '0%',
				style: {
					typography: { lineHeight: '1.4' },
					spacing: { margin: ZERO_MARGINS },
				},
				lock: { remove: true, move: true },
			},
			[ PARENT_CLIENT_ID ]: {
				heightMode: 'auto',
				containerHeight: '',
			},
		} );
		expect( unique ).toBe( true );
		expect( fixture.blocks ).toEqual( originalBlocks );
		expect(
			Array.from( fixture.container.children ).map(
				( child ) => child.dataset.block
			)
		).toEqual( originalOrder );

		expect( mockCreateSuccessNotice ).toHaveBeenCalledTimes( 1 );
		const [ message, noticeOptions ] =
			mockCreateSuccessNotice.mock.calls[ 0 ];
		expect( message ).toBe(
			'Free positioning enabled. Undo restores the responsive layout.'
		);
		expect( noticeOptions ).toMatchObject( {
			type: 'snackbar',
			actions: [
				{
					label: 'Undo',
					onClick: mockUndo,
				},
			],
		} );
		noticeOptions.actions[ 0 ].onClick();
		expect( mockUndo ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not persist a pointer movement below the activation threshold', () => {
		const fixture = createFixture();
		renderControls( fixture );
		const moveHandle = getControl( fixture, 'move' );

		act( () => {
			moveHandle.dispatchEvent(
				createPointerEvent( 'pointerdown', {
					clientX: 100,
					clientY: 100,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointermove', {
					clientX: 102,
					clientY: 100,
					buttons: 1,
				} )
			);
			document.dispatchEvent(
				createPointerEvent( 'pointerup', {
					clientX: 102,
					clientY: 100,
					buttons: 0,
				} )
			);
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
		expect( mockCreateErrorNotice ).not.toHaveBeenCalled();
		flushAllAnimationFrames();
	} );

	it.each( [ 'Escape', 'pointercancel' ] )(
		'cancels an active pointer gesture with %s without persisting it',
		( cancellation ) => {
			const fixture = createFixture();
			renderControls( fixture );
			const moveHandle = getControl( fixture, 'move' );

			act( () => {
				moveHandle.dispatchEvent(
					createPointerEvent( 'pointerdown', {
						clientX: 100,
						clientY: 100,
						buttons: 1,
					} )
				);
				document.dispatchEvent(
					createPointerEvent( 'pointermove', {
						clientX: 150,
						clientY: 125,
						buttons: 1,
					} )
				);
			} );
			flushNextAnimationFrame();
			expect( fixture.selectedElement.style.transform ).toBe(
				'translate3d(50px, 25px, 0)'
			);

			act( () => {
				if ( cancellation === 'Escape' ) {
					document.dispatchEvent(
						createKeyboardEvent( 'keydown', 'Escape' )
					);
					return;
				}
				document.dispatchEvent(
					createPointerEvent( 'pointercancel', {
						clientX: 150,
						clientY: 125,
						buttons: 0,
					} )
				);
			} );

			expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
			expect( fixture.selectedElement.style.transform ).toBe( '' );
			expect(
				fixture.container.hasAttribute( 'data-pc-interacting' )
			).toBe( false );

			act( () => {
				document.dispatchEvent(
					createPointerEvent( 'pointerup', {
						clientX: 180,
						clientY: 160,
						buttons: 0,
					} )
				);
			} );
			expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
			flushAllAnimationFrames();
		}
	);

	it( 'accumulates held keyboard movement and commits once on keyup', () => {
		const fixture = createFixture();
		renderControls( fixture );
		const moveHandle = getControl( fixture, 'move' );

		act( () => {
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keydown', 'ArrowRight' )
			);
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keydown', 'ArrowRight', {
					repeat: true,
				} )
			);
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keydown', 'ArrowDown', {
					shiftKey: true,
				} )
			);
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		expect( fixture.selectedElement.style.transform ).toBe(
			'translate3d(2px, 10px, 0)'
		);

		act( () => {
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keyup', 'ArrowDown' )
			);
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keyup', 'ArrowRight' )
			);
		} );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateBlockAttributes ).toHaveBeenCalledWith(
			[ 'image-one' ],
			{
				'image-one': {
					useAbsolutePosition: true,
					left: '10.2%',
					top: '90px',
					right: 'auto',
					bottom: 'auto',
				},
			},
			true
		);
		expect( mockToggleSelection ).not.toHaveBeenCalled();
		flushAllAnimationFrames();
	} );

	it( 'cancels an in-progress keyboard sequence with Escape', () => {
		const fixture = createFixture();
		renderControls( fixture );
		const moveHandle = getControl( fixture, 'move' );

		act( () => {
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keydown', 'ArrowRight', {
					shiftKey: true,
				} )
			);
		} );
		expect( fixture.selectedElement.style.transform ).toBe(
			'translate3d(10px, 0px, 0)'
		);

		act( () => {
			document.dispatchEvent(
				createKeyboardEvent( 'keydown', 'Escape' )
			);
			moveHandle.dispatchEvent(
				createKeyboardEvent( 'keyup', 'ArrowRight' )
			);
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		expect( fixture.selectedElement.style.transform ).toBe( '' );
		expect( mockToggleSelection ).not.toHaveBeenCalled();
		flushAllAnimationFrames();
	} );

	it( 'hides resize for a rotated flow item while leaving move available', () => {
		const specs = createFlowSpecs();
		specs[ 0 ].attributes.rotation = 7;
		const fixture = createFixture( { specs } );

		renderControls( fixture );

		expect( getControl( fixture, 'move' ) ).not.toBeNull();
		expect( getControl( fixture, 'resize' ) ).toBeNull();
	} );

	it( 'removes gesture listeners when unmounted', () => {
		const fixture = createFixture();
		const documentAddEventListener = jest.spyOn(
			document,
			'addEventListener'
		);
		const documentRemoveEventListener = jest.spyOn(
			document,
			'removeEventListener'
		);

		renderControls( fixture );

		const moveHandle = getControl( fixture, 'move' );
		act( () => {
			moveHandle.dispatchEvent(
				createPointerEvent( 'pointerdown', {
					clientX: 100,
					clientY: 100,
					buttons: 1,
				} )
			);
		} );

		const gestureListeners = new Map();
		[ 'keydown', 'pointermove', 'pointerup', 'pointercancel' ].forEach(
			( type ) => {
				const listenerCall = documentAddEventListener.mock.calls.find(
					( [ addedType, , options ] ) =>
						addedType === type && options === true
				);
				expect( listenerCall ).toBeDefined();
				gestureListeners.set( type, listenerCall[ 1 ] );
			}
		);

		act( () => reactRoot.unmount() );
		reactRoot = null;

		gestureListeners.forEach( ( listener, type ) => {
			expect( documentRemoveEventListener ).toHaveBeenCalledWith(
				type,
				listener,
				true
			);
		} );
		expect( mockToggleSelection.mock.calls ).toEqual( [
			[ false ],
			[ true ],
		] );
		expect( fixture.container.hasAttribute( 'data-pc-interacting' ) ).toBe(
			false
		);

		act( () => {
			document.dispatchEvent(
				createPointerEvent( 'pointerup', {
					clientX: 180,
					clientY: 160,
					buttons: 0,
				} )
			);
		} );
		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		flushAllAnimationFrames();
	} );

	it( 'does not render controls without a direct container parent', () => {
		const fixture = createFixture();

		renderControls( fixture, { parentClientId: '' } );

		expect(
			fixture.mount.querySelector( '[data-pc-canvas-control]' )
		).toBeNull();
	} );
} );
