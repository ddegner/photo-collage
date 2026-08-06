// React is supplied transitively by the WordPress test runtime.
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, createElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

const mockUseBlockProps = jest.fn( ( props ) => props );
const mockUseCanvasParent = jest.fn();

jest.mock(
	'@wordpress/i18n',
	() => ( {
		__: ( value ) => value,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/block-editor',
	() => {
		const NullComponent = () => null;

		return {
			BlockControls: NullComponent,
			InspectorControls: NullComponent,
			LinkControl: NullComponent,
			MediaPlaceholder: NullComponent,
			MediaReplaceFlow: NullComponent,
			getTypographyClassesAndStyles: () => ( {} ),
			useBlockProps: ( ...args ) => mockUseBlockProps( ...args ),
			useInnerBlocksProps: ( props ) => ( {
				...props,
				children: null,
			} ),
			__experimentalGetSpacingClassesAndStyles: () => ( {} ),
			__experimentalUseBorderProps: () => ( {} ),
			__experimentalUseColorProps: () => ( {} ),
		};
	},
	{ virtual: true }
);

jest.mock(
	'@wordpress/components',
	() => {
		const NullComponent = () => null;

		return {
			Button: NullComponent,
			ExternalLink: NullComponent,
			PanelBody: NullComponent,
			Popover: NullComponent,
			RangeControl: NullComponent,
			SelectControl: NullComponent,
			TextareaControl: NullComponent,
			TextControl: NullComponent,
			ToggleControl: NullComponent,
			ToolbarDropdownMenu: NullComponent,
			ToolbarGroup: NullComponent,
			__experimentalUnitControl: NullComponent,
		};
	},
	{ virtual: true }
);

jest.mock(
	'@wordpress/compose',
	() => ( {
		useInstanceId: () => 1,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/data',
	() => ( {
		useSelect: () => null,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/icons',
	() => ( {
		link: 'link',
	} ),
	{ virtual: true }
);

jest.mock(
	'../src/blocks/image/components/caption-position-control',
	() => () => null
);
jest.mock( '../src/blocks/image/components/caption-editor', () => () => null );
jest.mock( '../src/blocks/components/BackgroundControls', () => () => null );
jest.mock( '../src/blocks/components/CanvasParentNotice', () => () => null );
jest.mock(
	'../src/blocks/components/CanvasTransformControls',
	() => () => null
);
jest.mock( '../src/blocks/components/PositionSizeControls', () => () => null );
jest.mock( '../src/blocks/components/useCanvasParent', () => ( {
	__esModule: true,
	default: ( ...args ) => mockUseCanvasParent( ...args ),
} ) );
jest.mock( '../src/blocks/utils/background-styles', () => ( {
	getBackgroundStyle: () => ( {} ),
} ) );
jest.mock( '../src/blocks/utils/canvas-events', () => ( {
	requestArrangeFreely: jest.fn(),
} ) );
jest.mock( '../src/blocks/utils/positioning-styles', () => ( {
	getBlockStyles: () => ( {} ),
} ) );

import FrameEdit from '../src/blocks/frame/edit';
import ImageEdit from '../src/blocks/image/edit';

const IMAGE_ATTRIBUTES = {
	url: 'https://example.com/photo.jpg',
	alt: '',
	width: '50%',
	height: 'auto',
	top: 'auto',
	right: 'auto',
	bottom: 'auto',
	left: 'auto',
	zIndex: 1,
	useAbsolutePosition: false,
	rotation: 0,
	opacity: 1,
	captionPlacement: 'bottom-left',
	captionAlign: 'left',
	captionWidth: '100%',
	showCaption: false,
	style: {},
};

const FRAME_ATTRIBUTES = {
	width: '50%',
	height: 'auto',
	top: 'auto',
	right: 'auto',
	bottom: 'auto',
	left: 'auto',
	zIndex: 1,
	useAbsolutePosition: false,
	rotation: 0,
	opacity: 1,
};

describe( 'editor native draggable contract', () => {
	let container;
	let root;

	beforeEach( () => {
		window.IS_REACT_ACT_ENVIRONMENT = true;
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		mockUseBlockProps.mockClear();
		mockUseCanvasParent.mockReset();
	} );

	afterEach( () => {
		act( () => root.unmount() );
		container.remove();
		delete window.IS_REACT_ACT_ENVIRONMENT;
		jest.clearAllMocks();
	} );

	const renderEditor = ( Component, attributes, isDirectCanvasChild ) => {
		mockUseCanvasParent.mockReturnValue( {
			isDirectCanvasChild,
			parentClientId: isDirectCanvasChild ? 'container-id' : undefined,
		} );

		act( () => {
			root.render(
				createElement( Component, {
					attributes,
					clientId: 'item-id',
					isSelected: true,
					setAttributes: jest.fn(),
				} )
			);
		} );

		return mockUseBlockProps.mock.calls.at( -1 )[ 0 ];
	};

	it.each( [
		[ 'image', ImageEdit, IMAGE_ATTRIBUTES ],
		[ 'frame', FrameEdit, FRAME_ATTRIBUTES ],
	] )(
		'disables native dragging on a direct %s root',
		( _name, Component, attributes ) => {
			const blockProps = renderEditor( Component, attributes, true );

			expect( blockProps ).toHaveProperty( 'draggable', false );
			expect(
				container.firstElementChild.getAttribute( 'draggable' )
			).toBe( 'false' );
		}
	);

	it.each( [
		[ 'image', ImageEdit, IMAGE_ATTRIBUTES ],
		[ 'frame', FrameEdit, FRAME_ATTRIBUTES ],
	] )(
		'does not suppress native dragging on a non-direct %s root',
		( _name, Component, attributes ) => {
			const blockProps = renderEditor( Component, attributes, false );

			expect(
				Object.prototype.hasOwnProperty.call( blockProps, 'draggable' )
			).toBe( false );
			expect(
				container.firstElementChild.hasAttribute( 'draggable' )
			).toBe( false );
		}
	);

	it( 'disables native image dragging independently of root nesting', () => {
		renderEditor( ImageEdit, IMAGE_ATTRIBUTES, false );

		const image = container.querySelector( 'img' );
		expect( image.getAttribute( 'draggable' ) ).toBe( 'false' );
		expect( image.draggable ).toBe( false );
	} );
} );
