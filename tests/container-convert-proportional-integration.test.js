/**
 * Integration contract for the container's "Convert to proportional" button:
 * one bulk dispatch, single-undo semantics, interaction hold, and gating.
 */

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
		// Panels must render for the button to exist in this suite.
		InspectorControls: ( { children } ) => children || null,
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
	() => {
		// eslint-disable-next-line import/no-extraneous-dependencies
		const { createElement: h } = require( 'react' );
		return {
			Button: ( { children, variant, ...props } ) =>
				h( 'button', { type: 'button', ...props }, children ),
			PanelBody: ( { children } ) => children || null,
			SelectControl: () => null,
			ToggleControl: () => null,
			__experimentalConfirmDialog: () => null,
			__experimentalUnitControl: () => null,
			SVG: () => null,
			Rect: () => null,
		};
	},
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

jest.mock( '../src/blocks/container/presets', () => ( {
	PRESET_BUTTONS: [],
	PRESET_HEIGHTS: {},
} ) );

// eslint-disable-next-line import/first
import ContainerEdit from '../src/blocks/container/edit';

const CONTAINER_CLIENT_ID = 'container-client-id';

const defineGeometry = ( element, geometry ) => {
	Object.entries( geometry ).forEach( ( [ property, value ] ) => {
		Object.defineProperty( element, property, {
			configurable: true,
			value,
		} );
	} );
};

const createChildren = () => [
	{
		clientId: 'pixel-image',
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
	{
		clientId: 'percent-image',
		name: 'photo-collage/image',
		attributes: {
			useAbsolutePosition: true,
			top: '10%',
			bottom: 'auto',
			left: '60%',
			right: 'auto',
			width: '30%',
			height: 'auto',
		},
		geometry: { left: 600, top: 60, width: 300, height: 200 },
	},
];

describe( 'Collage container "Convert to proportional" integration', () => {
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

	const render = ( {
		children = createChildren(),
		attributes = {
			heightMode: 'auto',
			containerHeight: '',
			stackOnMobile: false,
		},
	} = {} ) => {
		mockGetBlocks.mockImplementation( ( clientId ) =>
			clientId === CONTAINER_CLIENT_ID
				? children.map( ( spec ) => ( {
						attributes: spec.attributes,
						clientId: spec.clientId,
						name: spec.name,
				  } ) )
				: []
		);

		const renderEdit = () =>
			reactRoot.render(
				createElement( ContainerEdit, {
					attributes,
					setAttributes: () => {},
					clientId: CONTAINER_CLIENT_ID,
				} )
			);

		act( () => {
			reactRoot = createRoot( mountPoint );
			renderEdit();
		} );

		containerElement = document.createElement( 'div' );
		containerElement.className = 'wp-block-photo-collage-container';
		defineGeometry( containerElement, {
			clientWidth: 1000,
			clientHeight: 600,
			offsetWidth: 1000,
			offsetHeight: 600,
		} );
		containerElement.getBoundingClientRect = () => ( {
			top: 0,
			bottom: 600,
			left: 0,
			right: 1000,
			width: 1000,
			height: 600,
		} );
		children.forEach( ( spec ) => {
			const child = document.createElement( 'div' );
			child.dataset.block = spec.clientId;
			child.className = 'wp-block-photo-collage-image';
			defineGeometry( child, {
				offsetLeft: spec.geometry.left,
				offsetTop: spec.geometry.top,
				offsetWidth: spec.geometry.width,
				offsetHeight: spec.geometry.height,
			} );
			child.getBoundingClientRect = () => ( {
				top: spec.geometry.top,
				bottom: spec.geometry.top + spec.geometry.height,
				left: spec.geometry.left,
				right: spec.geometry.left + spec.geometry.width,
				width: spec.geometry.width,
				height: spec.geometry.height,
			} );
			containerElement.appendChild( child );
		} );
		document.body.appendChild( containerElement );

		act( () => {
			capturedContainerRef.current = containerElement;
			renderEdit();
		} );
	};

	it( 'converts through one bulk dispatch with a single-undo snackbar', () => {
		render();

		const button = document.querySelector(
			'[data-pc-convert-proportional]'
		);
		expect( button ).not.toBeNull();

		act( () => {
			button.click();
		} );

		expect( mockUpdateBlockAttributes ).toHaveBeenCalledTimes( 1 );
		const [ clientIds, updatesByClientId, unique ] =
			mockUpdateBlockAttributes.mock.calls[ 0 ];

		// Already-auto container: no container entry, only the px child.
		// Basis: max(200, 120 + 280, 60 + 200) = 400.
		expect( clientIds ).toEqual( [ 'pixel-image' ] );
		expect( updatesByClientId[ 'pixel-image' ] ).toEqual( {
			top: '30%',
			left: '4%',
			width: '50%',
		} );
		expect( unique ).toBe( true );

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

		expect( mockCreateSuccessNotice ).toHaveBeenCalledTimes( 1 );
		const [ , noticeOptions ] = mockCreateSuccessNotice.mock.calls[ 0 ];
		expect( noticeOptions.type ).toBe( 'snackbar' );
		expect( noticeOptions.actions[ 0 ].label ).toBe( 'Undo' );
		noticeOptions.actions[ 0 ].onClick();
		expect( mockUndo ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'hides the button once the collage is fully proportional', () => {
		render( {
			children: [
				{
					clientId: 'percent-image',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '10%',
						bottom: 'auto',
						left: '60%',
						right: 'auto',
						width: '30%',
						height: 'auto',
					},
					geometry: { left: 600, top: 60, width: 300, height: 200 },
				},
			],
		} );

		expect(
			document.querySelector( '[data-pc-convert-proportional]' )
		).toBeNull();
	} );

	it( 'surfaces an error notice when nothing is convertible', () => {
		// A lone near-bottom px offset is kept by the solver guard, so the
		// plan is empty; the user must hear that instead of a silent no-op.
		render( {
			children: [
				{
					clientId: 'edge-image',
					name: 'photo-collage/image',
					attributes: {
						useAbsolutePosition: true,
						top: '595px',
						bottom: 'auto',
						left: '10%',
						right: 'auto',
						width: '30%',
						height: 'auto',
					},
					geometry: { left: 100, top: 595, width: 300, height: 5 },
				},
			],
		} );

		act( () => {
			document.querySelector( '[data-pc-convert-proportional]' ).click();
		} );

		expect( mockUpdateBlockAttributes ).not.toHaveBeenCalled();
		expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
		expect( mockCreateErrorNotice ).toHaveBeenCalledTimes( 1 );
	} );
} );
