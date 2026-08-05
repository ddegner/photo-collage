import {
	createFlowToFreeformAttributes,
	createFreeformContainerAttributes,
	createMoveAttributes,
	createResizeAttributes,
	formatCanvasLength,
	getPreferredCanvasUnit,
	hasCanvasRectChanged,
	mergeMoveLock,
	moveCanvasRect,
	normalizePointerDelta,
	parseCanvasLength,
	pixelsToCanvasLength,
	projectDeltaToLocalAxes,
	projectLocalDeltaToCanvasAxes,
	removeMoveLock,
	resizeCanvasRect,
} from '../src/blocks/utils/canvas-geometry';

const expectRectCloseTo = ( actual, expected, precision = 5 ) => {
	Object.keys( expected ).forEach( ( property ) => {
		expect( actual[ property ] ).toBeCloseTo(
			expected[ property ],
			precision
		);
	} );
};

describe( 'canvas geometry', () => {
	describe( 'CSS lengths', () => {
		// eslint-disable-next-line jest/expect-expect
		it.each( [
			[ '12%', { value: 12, unit: '%' } ],
			[ ' -4.25px ', { value: -4.25, unit: 'px' } ],
			[ '.5PX', { value: 0.5, unit: 'px' } ],
			[ 18, { value: 18, unit: 'px' } ],
		] )( 'parses %p', ( value, expected ) => {
			expect( parseCanvasLength( value ) ).toEqual( expected );
		} );

		it.each( [
			'',
			'auto',
			'calc(50% - 2px)',
			'var(--space)',
			'2rem',
			'4vw',
			'12',
			'Infinitypx',
			null,
			undefined,
		] )( 'rejects unsupported value %p', ( value ) => {
			expect( parseCanvasLength( value ) ).toBeNull();
		} );

		it( 'formats precision without trailing or negative zeroes', () => {
			expect( formatCanvasLength( 12.34001, '%' ) ).toBe( '12.34%' );
			expect( formatCanvasLength( -0.0001, 'px' ) ).toBe( '0px' );
			expect( formatCanvasLength( Infinity, 'px' ) ).toBeNull();
			expect( formatCanvasLength( 2, 'em' ) ).toBeNull();
		} );

		it( 'converts pixels to percentages with a pixel fallback', () => {
			expect(
				pixelsToCanvasLength( 250, { unit: '%', basis: 1000 } )
			).toBe( '25%' );
			expect( pixelsToCanvasLength( 250, { unit: '%', basis: 0 } ) ).toBe(
				'250px'
			);
			expect( pixelsToCanvasLength( 20.1254, { unit: 'px' } ) ).toBe(
				'20.125px'
			);
		} );

		it( 'selects the first supported unit', () => {
			expect(
				getPreferredCanvasUnit( [ 'auto', '15%', '20px' ], 'px' )
			).toBe( '%' );
			expect( getPreferredCanvasUnit( [ 'auto', '2rem' ], '%' ) ).toBe(
				'%'
			);
		} );
	} );

	describe( 'pointer deltas', () => {
		it( 'normalizes differently scaled axes', () => {
			expect(
				normalizePointerDelta( {
					clientX: 150,
					clientY: 90,
					startClientX: 100,
					startClientY: 50,
					scaleX: 0.5,
					scaleY: 2,
				} )
			).toEqual( { x: 100, y: 20 } );
		} );

		it( 'falls back from invalid scales', () => {
			expect(
				normalizePointerDelta( {
					clientX: 15,
					clientY: 25,
					startClientX: 5,
					startClientY: 5,
					scaleX: 0,
					scaleY: Number.NaN,
				} )
			).toEqual( { x: 10, y: 20 } );
		} );

		it.each( [
			[ 0, { x: 10, y: 20 } ],
			[ 90, { x: 20, y: -10 } ],
			[ -90, { x: -20, y: 10 } ],
			[ 180, { x: -10, y: -20 } ],
		] )(
			'projects onto local axes at %d degrees',
			( rotation, expected ) => {
				const actual = projectDeltaToLocalAxes(
					{ x: 10, y: 20 },
					rotation
				);
				expect( actual.x ).toBeCloseTo( expected.x );
				expect( actual.y ).toBeCloseTo( expected.y );
			}
		);

		// eslint-disable-next-line jest/expect-expect
		it( 'round-trips canvas and local deltas', () => {
			const local = projectDeltaToLocalAxes( { x: 14, y: -9 }, 37 );
			expectRectCloseTo( projectLocalDeltaToCanvasAxes( local, 37 ), {
				x: 14,
				y: -9,
			} );
		} );
	} );

	describe( 'rectangle operations', () => {
		const rect = { left: 100, top: 80, width: 300, height: 200 };

		it( 'moves without changing dimensions', () => {
			expect( moveCanvasRect( rect, { x: -25, y: 40 } ) ).toEqual( {
				left: 75,
				top: 120,
				width: 300,
				height: 200,
			} );
		} );

		it( 'resizes a non-rotated rectangle freely', () => {
			expect(
				resizeCanvasRect( {
					rect,
					delta: { x: 50, y: -20 },
				} )
			).toEqual( {
				left: 100,
				top: 80,
				width: 350,
				height: 180,
			} );
		} );

		it( 'locks aspect ratio using the dominant relative delta', () => {
			expect(
				resizeCanvasRect( {
					rect,
					delta: { x: 60, y: 5 },
					lockAspectRatio: true,
				} )
			).toEqual( {
				left: 100,
				top: 80,
				width: 360,
				height: 240,
			} );
		} );

		it( 'enforces minimum dimensions', () => {
			expect(
				resizeCanvasRect( {
					rect,
					delta: { x: -1000, y: -1000 },
					minWidth: 48,
					minHeight: 60,
				} )
			).toEqual( {
				left: 100,
				top: 80,
				width: 48,
				height: 60,
			} );
		} );

		// eslint-disable-next-line jest/expect-expect
		it( 'keeps the rotated visual top-left fixed', () => {
			const resized = resizeCanvasRect( {
				rect,
				delta: { x: 0, y: 50 },
				rotation: 90,
			} );

			expectRectCloseTo( resized, {
				left: 75,
				top: 105,
				width: 350,
				height: 200,
			} );
		} );

		it( 'detects only meaningful changes', () => {
			expect( hasCanvasRectChanged( rect, { ...rect } ) ).toBe( false );
			expect(
				hasCanvasRectChanged( rect, { ...rect, left: 100.005 } )
			).toBe( false );
			expect(
				hasCanvasRectChanged( rect, { ...rect, left: 100.02 } )
			).toBe( true );
		} );
	} );

	describe( 'attribute commits', () => {
		const attributes = {
			useAbsolutePosition: true,
			left: '25%',
			right: 'auto',
			top: '40%',
			bottom: 'auto',
			width: '30%',
			height: 'auto',
		};

		it( 'preserves percentage axes in fixed-height mode', () => {
			expect(
				createMoveAttributes( {
					attributes,
					rect: { left: 300, top: 250, width: 300, height: 200 },
					containerWidth: 1200,
					containerHeight: 1000,
					heightMode: 'fixed',
				} )
			).toEqual( {
				useAbsolutePosition: true,
				left: '25%',
				top: '25%',
				right: 'auto',
				bottom: 'auto',
			} );
		} );

		it( 'canonicalizes vertical position to pixels in auto-height mode', () => {
			expect(
				createMoveAttributes( {
					attributes,
					rect: { left: 300, top: 250, width: 300, height: 200 },
					containerWidth: 1200,
					containerHeight: 1000,
					heightMode: 'auto',
				} )
			).toMatchObject( {
				left: '25%',
				top: '250px',
				right: 'auto',
				bottom: 'auto',
			} );
		} );

		it( 'keeps auto-height images proportional', () => {
			expect(
				createResizeAttributes( {
					attributes,
					rect: {
						left: 200,
						top: 100,
						width: 480,
						height: 320,
					},
					containerWidth: 1200,
					containerHeight: 800,
					heightMode: 'auto',
					preserveAutoHeight: true,
				} )
			).toEqual( {
				width: '40%',
				height: 'auto',
				useAbsolutePosition: true,
				left: '16.667%',
				top: '100px',
				right: 'auto',
				bottom: 'auto',
			} );
		} );

		it( 'commits free frame dimensions without positioning flow items', () => {
			expect(
				createResizeAttributes( {
					attributes: {
						...attributes,
						useAbsolutePosition: false,
						width: '50%',
						height: '200px',
					},
					rect: {
						left: 0,
						top: 0,
						width: 650,
						height: 275,
					},
					containerWidth: 1000,
					containerHeight: 800,
					heightMode: 'fixed',
					preserveAutoHeight: false,
				} )
			).toEqual( {
				width: '65%',
				height: '275px',
			} );
		} );
	} );

	describe( 'flow-to-freeform promotion', () => {
		it( 'pins the measured border box and rebases width to the absolute padding box', () => {
			const attributes = {
				align: 'wide',
				width: '50%',
				height: 'auto',
				marginTop: '-10%',
				marginRight: '3%',
				marginBottom: '4%',
				marginLeft: '12%',
				style: {
					color: { background: '#fff' },
					spacing: {
						blockGap: '8px',
						margin: {
							top: '-10%',
							right: '3%',
							bottom: '4%',
							left: '12%',
						},
						padding: { left: '20px', right: '20px' },
					},
					typography: { lineHeight: '1.4' },
				},
			};

			expect(
				createFlowToFreeformAttributes( {
					attributes,
					borderRect: {
						left: 150,
						top: 80,
						width: 400,
						height: 275,
					},
					containerWidth: 1000,
				} )
			).toEqual( {
				useAbsolutePosition: true,
				left: '15%',
				top: '80px',
				right: 'auto',
				bottom: 'auto',
				width: '40%',
				height: 'auto',
				align: undefined,
				marginTop: '0%',
				marginRight: '0%',
				marginBottom: '0%',
				marginLeft: '0%',
				style: {
					color: { background: '#fff' },
					spacing: {
						blockGap: '8px',
						margin: {
							top: '0%',
							right: '0%',
							bottom: '0%',
							left: '0%',
						},
						padding: { left: '20px', right: '20px' },
					},
					typography: { lineHeight: '1.4' },
				},
			} );

			expect( attributes.style.spacing.margin.left ).toBe( '12%' );
		} );

		it( 'persists an explicit measured height in pixels', () => {
			expect(
				createFlowToFreeformAttributes( {
					attributes: {
						width: '18rem',
						height: '35%',
					},
					borderRect: {
						left: -25,
						top: -10,
						width: 240,
						height: 165.25,
					},
					containerWidth: 800,
				} )
			).toMatchObject( {
				left: '-3.125%',
				top: '-10px',
				width: '30%',
				height: '165.25px',
			} );
		} );

		it.each( [
			[
				'missing rectangle',
				{
					attributes: {},
					borderRect: null,
					containerWidth: 1000,
				},
			],
			[
				'zero-width item',
				{
					attributes: {},
					borderRect: {
						left: 0,
						top: 0,
						width: 0,
						height: 100,
					},
					containerWidth: 1000,
				},
			],
			[
				'zero-width container',
				{
					attributes: {},
					borderRect: {
						left: 0,
						top: 0,
						width: 100,
						height: 100,
					},
					containerWidth: 0,
				},
			],
		] )( 'rejects %s', ( _label, options ) => {
			expect( createFlowToFreeformAttributes( options ) ).toBeNull();
		} );

		it( 'switches only fixed containers without an explicit height to auto', () => {
			expect(
				createFreeformContainerAttributes( {
					heightMode: 'fixed',
					containerHeight: '   ',
				} )
			).toEqual( {
				heightMode: 'auto',
				containerHeight: '',
			} );
			expect(
				createFreeformContainerAttributes( {
					heightMode: 'fixed',
					containerHeight: '800px',
				} )
			).toBeNull();
			expect(
				createFreeformContainerAttributes( {
					heightMode: 'auto',
					containerHeight: '',
				} )
			).toBeNull();
		} );
	} );

	describe( 'temporary move locks', () => {
		it( 'merges a move lock without discarding removal or custom locks', () => {
			expect(
				mergeMoveLock( {
					remove: false,
					custom: 'retained',
				} )
			).toEqual( {
				move: true,
				remove: false,
				custom: 'retained',
			} );
			expect( mergeMoveLock() ).toEqual( { move: true } );
		} );

		it( 'removes only the move lock and omits an empty lock object', () => {
			expect(
				removeMoveLock( {
					move: true,
					remove: false,
					custom: 'retained',
				} )
			).toEqual( {
				remove: false,
				custom: 'retained',
			} );
			expect( removeMoveLock( { move: true } ) ).toBeUndefined();
			expect( removeMoveLock() ).toBeUndefined();
		} );
	} );
} );
