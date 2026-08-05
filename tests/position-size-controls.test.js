// React is supplied transitively by the WordPress test runtime.
// eslint-disable-next-line import/no-extraneous-dependencies
import { act, createElement } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot } from 'react-dom/client';

jest.mock(
	'@wordpress/i18n',
	() => ( {
		__: ( value ) => value,
	} ),
	{ virtual: true }
);

jest.mock(
	'@wordpress/components',
	() => {
		// React is supplied transitively by the WordPress test runtime.
		// eslint-disable-next-line import/no-extraneous-dependencies
		const { createElement: createMockElement } =
			jest.requireActual( 'react' );

		return {
			Button: ( { label, onClick } ) =>
				createMockElement(
					'button',
					{ 'aria-label': label, onClick, type: 'button' },
					label
				),
			RangeControl: () => null,
			ToggleControl: ( { checked, help, label, onChange } ) =>
				createMockElement(
					'label',
					null,
					label,
					createMockElement( 'input', {
						'aria-label': label,
						checked,
						onChange: ( event ) => onChange( event.target.checked ),
						type: 'checkbox',
					} ),
					help && createMockElement( 'span', null, help )
				),
			__experimentalUnitControl: () => null,
		};
	},
	{ virtual: true }
);

import PositionSizeControls from '../src/blocks/components/PositionSizeControls';

const BASE_PROPS = {
	width: '50%',
	height: 'auto',
	useAbsolutePosition: false,
	top: 'auto',
	right: 'auto',
	bottom: 'auto',
	left: 'auto',
	zIndex: 1,
	lock: undefined,
	rotation: 0,
	setAttributes: jest.fn(),
	instanceId: 1,
	idPrefix: 'test',
	positioningHelp: 'Position help',
};

describe( 'PositionSizeControls', () => {
	let container;
	let root;

	beforeEach( () => {
		window.IS_REACT_ACT_ENVIRONMENT = true;
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		act( () => root.unmount() );
		container.remove();
		delete window.IS_REACT_ACT_ENVIRONMENT;
		jest.clearAllMocks();
	} );

	const renderControls = ( props = {} ) => {
		act( () => {
			root.render(
				createElement( PositionSizeControls, {
					...BASE_PROPS,
					...props,
				} )
			);
		} );
	};

	const toggleFreePositioning = () => {
		const toggle = container.querySelector(
			'input[aria-label="Free positioning"]'
		);

		act( () => {
			toggle.dispatchEvent(
				new window.MouseEvent( 'click', { bubbles: true } )
			);
		} );
	};

	it( 'requests whole-collage arrangement instead of setting one direct flow item', () => {
		const setAttributes = jest.fn();
		const onArrangeFreely = jest.fn();
		renderControls( { setAttributes, onArrangeFreely } );

		toggleFreePositioning();

		expect( onArrangeFreely ).toHaveBeenCalledTimes( 1 );
		expect( setAttributes ).not.toHaveBeenCalled();
	} );

	it( 'clears only the native move lock when free positioning is disabled', () => {
		const setAttributes = jest.fn();
		const onArrangeFreely = jest.fn();
		renderControls( {
			useAbsolutePosition: true,
			lock: {
				move: true,
				remove: true,
				edit: false,
				futureLock: 'keep',
			},
			setAttributes,
			onArrangeFreely,
		} );

		toggleFreePositioning();

		expect( onArrangeFreely ).not.toHaveBeenCalled();
		expect( setAttributes ).toHaveBeenCalledTimes( 1 );
		expect( setAttributes ).toHaveBeenCalledWith( {
			useAbsolutePosition: false,
			lock: {
				remove: true,
				edit: false,
				futureLock: 'keep',
			},
		} );
	} );

	it( 'explains why a rotated flow item cannot be resized on canvas', () => {
		renderControls( { rotation: 12 } );

		expect( container.textContent ).toContain(
			'Enable free positioning before resizing a rotated item on the canvas.'
		);
	} );
} );
