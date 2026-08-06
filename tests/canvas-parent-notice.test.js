// React is supplied transitively by the WordPress test runtime.
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, createElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

const mockUseBlockEditingMode = jest.fn();

jest.mock(
	'@wordpress/i18n',
	() => ( {
		__: ( value ) => value,
		sprintf: ( format, ...args ) =>
			format.replace( /%s/g, () => args.shift() ),
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/block-editor',
	() => ( {
		useBlockEditingMode: ( ...args ) => mockUseBlockEditingMode( ...args ),
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/components',
	() => {
		// jest.mock factories are hoisted above the imports, so React has to be
		// pulled in lazily here rather than closed over from module scope.
		// eslint-disable-next-line import/no-extraneous-dependencies, global-require
		const { createElement: create } = require( 'react' );

		return {
			Notice: ( { children, className } ) =>
				create( 'div', { className, 'data-notice': true }, children ),
		};
	},
	{ virtual: true }
);

import CanvasParentNotice from '../src/blocks/components/CanvasParentNotice';

const renderNotice = ( props ) => {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );

	act( () => {
		root.render(
			createElement( CanvasParentNotice, {
				itemName: 'image',
				...props,
			} )
		);
	} );

	const notice = container.querySelector( '[data-notice]' );

	act( () => {
		root.unmount();
	} );
	container.remove();

	return notice;
};

describe( 'CanvasParentNotice', () => {
	beforeEach( () => {
		window.IS_REACT_ACT_ENVIRONMENT = true;
		mockUseBlockEditingMode.mockReset();
		mockUseBlockEditingMode.mockReturnValue( 'default' );
	} );

	afterEach( () => {
		delete window.IS_REACT_ACT_ENVIRONMENT;
	} );

	it( 'warns when the item is not a direct canvas child', () => {
		const notice = renderNotice( { isDirectCanvasChild: false } );

		expect( notice ).not.toBeNull();
		expect( notice.className ).toContain( 'photo-collage-parent-notice' );
		expect( notice.textContent ).toContain( 'Collage Container' );
		expect( notice.textContent ).toContain( 'image' );
	} );

	it( 'stays silent when the item sits inside a container', () => {
		expect( renderNotice( { isDirectCanvasChild: true } ) ).toBeNull();
	} );

	it( 'names the item type it was given', () => {
		const notice = renderNotice( {
			isDirectCanvasChild: false,
			itemName: 'frame',
		} );

		expect( notice.textContent ).toContain( 'frame' );
	} );

	// Restricted editing modes cannot restructure blocks, so the instruction
	// would be advice the user has no way to act on.
	it.each( [ 'contentOnly', 'disabled' ] )(
		'stays silent in %s editing mode',
		( editingMode ) => {
			mockUseBlockEditingMode.mockReturnValue( editingMode );

			expect( renderNotice( { isDirectCanvasChild: false } ) ).toBeNull();
		}
	);
} );
