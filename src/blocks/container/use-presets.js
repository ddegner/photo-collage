import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { useCallback, useRef, useState } from '@wordpress/element';
import { getPresetLayout, PRESET_HEIGHTS } from './presets';
import { createPresetApplicationPlan } from './preset-application';

/**
 * Manage quick layout preset application for the container block.
 *
 * @param {Object}   options                 Hook options.
 * @param {string}   options.clientId        Current container block client id.
 * @param {string}   options.heightMode      Current height mode.
 * @param {string}   options.containerHeight Current fixed container height.
 * @param {Function} options.setAttributes   Block setAttributes callback.
 * @return {Object} Hook API with the applyPreset callback.
 */
export const usePresets = ( {
	clientId,
	heightMode,
	containerHeight,
	setAttributes,
} ) => {
	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const hasAppliedPresetRef = useRef( false );
	const [ pendingApplication, setPendingApplication ] = useState( null );
	const innerBlocks = useSelect(
		( select ) => {
			const blocks = select( 'core/block-editor' ).getBlocks( clientId );
			return blocks || [];
		},
		[ clientId ]
	);

	const commitPreset = useCallback(
		( preset, blocks ) => {
			const hasExplicitHeight =
				typeof containerHeight === 'string'
					? containerHeight.trim() !== ''
					: Boolean( containerHeight );

			if (
				heightMode === 'fixed' &&
				! hasExplicitHeight &&
				! hasAppliedPresetRef.current
			) {
				setAttributes( {
					heightMode: 'auto',
					containerHeight: '',
				} );
			} else if ( heightMode === 'fixed' ) {
				setAttributes( {
					containerHeight: PRESET_HEIGHTS[ preset ] ?? '',
				} );
			}

			replaceInnerBlocks( clientId, blocks );
			hasAppliedPresetRef.current = true;
		},
		[
			clientId,
			containerHeight,
			heightMode,
			replaceInnerBlocks,
			setAttributes,
		]
	);

	const applyPreset = useCallback(
		( preset ) => {
			const config = getPresetLayout( preset );
			if ( ! config ) {
				return;
			}

			const application = createPresetApplicationPlan(
				innerBlocks,
				config,
				createBlock
			);

			if ( application.removedBlocks.length > 0 ) {
				setPendingApplication( { preset, ...application } );
				return;
			}

			commitPreset( preset, application.blocks );
		},
		[ commitPreset, innerBlocks ]
	);

	const confirmPreset = useCallback( () => {
		if ( ! pendingApplication ) {
			return;
		}

		commitPreset( pendingApplication.preset, pendingApplication.blocks );
		setPendingApplication( null );
	}, [ commitPreset, pendingApplication ] );

	const cancelPreset = useCallback( () => {
		setPendingApplication( null );
	}, [] );

	return {
		applyPreset,
		pendingRemovalCount: pendingApplication?.removedBlocks.length ?? 0,
		confirmPreset,
		cancelPreset,
	};
};
