import {
	applyAutoHeight,
	attachAutoHeight,
} from '../src/blocks/container/auto-height';
import {
	CANVAS_GEOMETRY_CHANGE_EVENT,
	CANVAS_INTERACTION_ATTRIBUTE,
} from '../src/blocks/utils/canvas-geometry';

const createAutoHeightFixture = () => {
	const container = document.createElement( 'div' );
	const item = document.createElement( 'div' );

	container.className = 'wp-block-photo-collage-container';
	container.dataset.heightMode = 'auto';
	item.className = 'wp-block-photo-collage-image';
	item.style.position = 'absolute';
	container.appendChild( item );
	document.body.appendChild( container );

	Object.defineProperty( container, 'offsetHeight', {
		configurable: true,
		value: 200,
	} );
	container.getBoundingClientRect = () => ( {
		top: 40,
		bottom: 240,
		left: 0,
		right: 1000,
		width: 1000,
		height: 200,
	} );
	item.getBoundingClientRect = () => ( {
		top: 190,
		bottom: 360,
		left: 0,
		right: 300,
		width: 300,
		height: 170,
	} );

	return { container, item };
};

describe( 'auto-height canvas interaction coordination', () => {
	afterEach( () => {
		document.body.replaceChildren();
		jest.restoreAllMocks();
	} );

	it( 'measures the lowest absolute collage item', () => {
		const { container } = createAutoHeightFixture();

		expect( applyAutoHeight( container ) ).toBe( 320 );
		expect( container.style.height ).toBe( '320px' );
	} );

	it( 'defers measurement during a gesture and resumes on its event', () => {
		const { container } = createAutoHeightFixture();
		const frames = [];
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation(
			( callback ) => {
				frames.push( callback );
				return frames.length;
			}
		);
		jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation(
			() => {}
		);

		const detach = attachAutoHeight( container, {
			watchMutations: false,
			watchResize: false,
		} );

		expect( frames ).toHaveLength( 1 );
		container.setAttribute( CANVAS_INTERACTION_ATTRIBUTE, 'true' );
		frames.shift()();
		expect( container.style.height ).toBe( '' );

		container.removeAttribute( CANVAS_INTERACTION_ATTRIBUTE );
		container.dispatchEvent(
			new CustomEvent( CANVAS_GEOMETRY_CHANGE_EVENT )
		);
		expect( frames ).toHaveLength( 1 );
		frames.shift()();
		expect( container.style.height ).toBe( '320px' );

		detach();
	} );
} );
