// React is supplied transitively by the WordPress test runtime.
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, createElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

const mockUpdateBlockAttributes = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockCreateSuccessNotice = jest.fn();
const mockUndo = jest.fn();
const mockCanMoveBlock = jest.fn();
const mockGetBlocks = jest.fn();

let capturedContainerRef = null;

jest.mock(
	'@wordpress/block-editor',
	() => ( {
		store: 'block-editor',
		InspectorControls: () => null,
		useBlockProps: ( props = {} ) => {
			capturedContainerRef = props.ref || null;
			return props;
		},
		useInnerBlocksProps: ( blockProps = {} ) => ( {
			...blockProps,
			children: null,
		} ),
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/components',
	() => ( {
		Button: () => null,
		PanelBody: ( { children } ) => children || null,
		SelectControl: () => null,
		ToggleControl: () => null,
		__experimentalConfirmDialog: () => null,
		__experimentalUnitControl: () => null,
		// Preset icons build SVG trees this suite never renders.
		SVG: () => null,
		Rect: () => null,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/data',
	() => ( {
		useDispatch: ( store ) => {
			if ( store === 'block-editor' ) {
				return { updateBlockAttributes: mockUpdateBlockAttributes };
			}
			if ( store === 'notices' ) {
				return {
					createErrorNotice: mockCreateErrorNotice,
					createSuccessNotice: mockCreateSuccessNotice,
				};
			}
			if ( store === 'core-data' ) {
				return { undo: mockUndo };
			}
			return {};
		},
		useSelect: ( mapSelect ) =>
			mapSelect( ( store ) =>
				store === 'block-editor'
					? {
							canMoveBlock: mockCanMoveBlock,
							getBlocks: mockGetBlocks,
					  }
					: {}
			),
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/core-data', () => ( { store: 'core-data' } ), {
	virtual: true,
} );
jest.mock( '@wordpress/notices', () => ( { store: 'notices' } ), {
	virtual: true,
} );

jest.mock(
	'@wordpress/i18n',
	() => ( {
		__: ( value ) => value,
		_n: ( single ) => single,
		sprintf: ( template, value ) => template.replace( '%s', value ),
	} ),
	{ virtual: true }
);

jest.mock(
	'../src/blocks/container/use-presets',
	() => ( {
		usePresets: () => ( {
			applyPreset: () => {},
			pendingRemovalCount: 0,
			confirmPreset: () => {},
			cancelPreset: () => {},
		} ),
	} ),
	{ virtual: true }
);

// eslint-disable-next-line import/first
import ContainerEdit from '../src/blocks/container/edit';
// eslint-disable-next-line import/first
import { requestArrangeFreely } from '../src/blocks/utils/canvas-events';

const CONTAINER_CLIENT_ID = 'container-client-id';

const defineGeometry = ( element, geometry ) => {
	Object.entries( geometry ).forEach( ( [ property, value ] ) => {
		Object.defineProperty( element, property, {
			configurable: true,
			value,
		} );
	} );
};

const createChildren = () =>
	[
		{
			clientId: 'image-one',
			name: 'photo-collage/image',
			attributes: { useAbsolutePosition: false, width: '25%' },
			geometry: { left: 20, top: 30, width: 250, height: 180 },
		},
		{
			clientId: 'frame-two',
			name: 'photo-collage/frame',
			attributes: { useAbsolutePosition: false, width: '32%' },
			geometry: { left: 300, top: 40, width: 320, height: 210 },
		},
	].map( ( spec ) => spec );

describe( 'Collage container "Arrange collage freely"', () => {
	let reactRoot;
	let mountPoint;
	let containerElement;
	let animationFrames;

	beforeAll( () => {
		global.IS_REACT_ACT_ENVIRONMENT = true;
	} );

	beforeEach( () => {
		animationFrames = [];
		capturedContainerRef = null;
		[
			mockUpdateBlockAttributes,
			mockCreateErrorNotice,
			mockCreateSuccessNotice,
			mockUndo,
			mockCanMoveBlock,
			mockGetBlocks,
		].forEach( ( mockFunction ) => mockFunction.mockReset() );
		mockCanMoveBlock.mockReturnValue( true );
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation(
			( callback ) => {
				animationFrames.push( callback );
				return animationFrames.length;
			}
		);
		mountPoint = document.createElement( 'div' );
		document.body.appendChild( mountPoint );
	} );

	afterEach( () => {
		if ( reactRoot ) {
			act( () => reactRoot.unmount() );
			reactRoot = null;
		}
		document.body.replaceChildren();
		jest.restoreAllMocks();
	} );

	const render = ( { children = createChildren() } = {} ) => {
		mockGetBlocks.mockImplementation( ( clientId ) =>
			clientId === CONTAINER_CLIENT_ID
				? children.map( ( spec ) => ( {
						attributes: spec.attributes,
						clientId: spec.clientId,
						name: spec.name,
				  } ) )
				: []
		);

		act( () => {
			reactRoot = createRoot( mountPoint );
			reactRoot.render(
				createElement( ContainerEdit, {
					attributes: {
						heightMode: 'fixed',
						containerHeight: '',
						stackOnMobile: false,
					},
					setAttributes: () => {},
					clientId: CONTAINER_CLIENT_ID,
				} )
			);
		} );

		// The component owns the container element through useBlockProps' ref;
		// build the DOM the geometry is measured from around that same node.
		containerElement = document.createElement( 'div' );
		containerElement.className = 'wp-block-photo-collage-container';
		defineGeometry( containerElement, {
			clientWidth: 1000,
			clientHeight: 600,
			offsetWidth: 1000,
			offsetHeight: 600,
		} );
		children.forEach( ( spec ) => {
			const child = document.createElement( 'div' );
			child.dataset.block = spec.clientId;
			child.className =
				spec.name === 'photo-collage/frame'
					? 'wp-block-photo-collage-frame'
					: 'wp-block-photo-collage-image';
			defineGeometry( child, {
				offsetLeft: spec.geometry.left,
				offsetTop: spec.geometry.top,
				offsetWidth: spec.geometry.width,
				offsetHeight: spec.geometry.height,
			} );
			containerElement.appendChild( child );
		} );
		document.body.appendChild( containerElement );

		act( () => {
			capturedContainerRef.current = containerElement;
			// Re-render so the listener effect binds to the populated element.
			reactRoot.render(
				createElement( ContainerEdit, {
					attributes: {
						heightMode: 'fixed',
						containerHeight: '',
						stackOnMobile: false,
					},
					setAttributes: () => {},
					clientId: CONTAINER_CLIENT_ID,
				} )
			);
		} );
	};

	it( 'promotes every child when a descendant requests the conversion', () => {
		render();

		act( () => {
			requestArrangeFreely( containerElement, {
				containerClientId: CONTAINER_CLIENT_ID,
			} );
		} );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		const [ clientIds, updatesByClientId, unique ] =
			mockUpdateBlockAttributes.mock.calls[ 0 ];

		expect( clientIds ).toEqual( [
			'image-one',
			'frame-two',
			CONTAINER_CLIENT_ID,
		] );
		expect( updatesByClientId[ 'image-one' ] ).toMatchObject( {
			useAbsolutePosition: true,
			left: '2%',
			top: '30px',
			width: '25%',
		} );
		expect( updatesByClientId[ 'frame-two' ] ).toMatchObject( {
			useAbsolutePosition: true,
			left: '30%',
			top: '40px',
			width: '32%',
		} );
		expect( updatesByClientId[ CONTAINER_CLIENT_ID ] ).toEqual( {
			heightMode: 'auto',
			containerHeight: '',
		} );
		expect( unique ).toBe( true );
		expect( mockCreateSuccessNotice ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores a request addressed to a different container', () => {
		render();

		act( () => {
			requestArrangeFreely( containerElement, {
				containerClientId: 'some-other-container',
			} );
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
	} );

	it( 'surfaces an error instead of silently doing nothing when a child is locked', () => {
		mockCanMoveBlock.mockImplementation(
			( clientId ) => clientId !== 'frame-two'
		);
		render();

		act( () => {
			requestArrangeFreely( containerElement, {
				containerClientId: CONTAINER_CLIENT_ID,
			} );
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'Unlock the responsive collage items before arranging them freely.',
			{ type: 'snackbar' }
		);
	} );

	it( 'holds auto-height measurement until the new coordinates have painted', () => {
		render();

		act( () => {
			requestArrangeFreely( containerElement, {
				containerClientId: CONTAINER_CLIENT_ID,
			} );
		} );

		expect( containerElement.hasAttribute( 'data-pc-interacting' ) ).toBe(
			true
		);

		const geometryEvents = [];
		containerElement.addEventListener(
			'photo-collage:canvas-geometry-change',
			() => geometryEvents.push( true )
		);
		act( () => {
			animationFrames.forEach( ( callback ) => callback( 0 ) );
		} );

		expect( containerElement.hasAttribute( 'data-pc-interacting' ) ).toBe(
			false
		);
		expect( geometryEvents ).toHaveLength( 1 );
	} );
} );
