import {
	CANVAS_ARRANGE_FREELY_REQUEST_EVENT,
	requestArrangeFreely,
} from '../src/blocks/utils/canvas-events';

describe( 'canvas events', () => {
	it( 'dispatches one cancelable, bubbling owner-window request with detail', () => {
		const container = document.createElement( 'div' );
		container.className = 'wp-block-photo-collage-container';
		const source = document.createElement( 'button' );
		container.appendChild( source );
		document.body.appendChild( container );
		const detail = {
			containerClientId: 'container-id',
			sourceClientId: 'image-id',
		};
		const receivedEvents = [];

		container.addEventListener(
			CANVAS_ARRANGE_FREELY_REQUEST_EVENT,
			( event ) => {
				receivedEvents.push( event );
				event.preventDefault();
			}
		);

		expect( requestArrangeFreely( source, detail ) ).toBe( true );
		expect( receivedEvents ).toHaveLength( 1 );

		const [ event ] = receivedEvents;
		expect( event ).toBeInstanceOf(
			container.ownerDocument.defaultView.CustomEvent
		);
		expect( event.type ).toBe( CANVAS_ARRANGE_FREELY_REQUEST_EVENT );
		expect( event.bubbles ).toBe( true );
		expect( event.cancelable ).toBe( true );
		expect( event.defaultPrevented ).toBe( true );
		expect( event.detail ).toBe( detail );

		container.remove();
	} );

	it( 'returns false without a collage container', () => {
		const detachedSource = document.createElement( 'div' );

		expect(
			requestArrangeFreely( detachedSource, { sourceClientId: 'x' } )
		).toBe( false );
		expect( requestArrangeFreely( null ) ).toBe( false );
	} );
} );
