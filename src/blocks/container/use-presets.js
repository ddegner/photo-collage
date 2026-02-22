import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { useCallback, useRef } from '@wordpress/element';
import { getPresetLayout, PRESET_HEIGHTS } from './presets';

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
	const innerBlocks = useSelect(
		( select ) => {
			const blocks = select( 'core/block-editor' ).getBlocks( clientId );
			return blocks || [];
		},
		[ clientId ]
	);

	const applyPreset = useCallback(
		( preset ) => {
			const config = getPresetLayout( preset );
			if ( ! config ) {
				return;
			}

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

			const newBlocks = config.map( ( attrs, index ) => {
				const existingBlock = innerBlocks[ index ];
				const imageData = existingBlock
					? {
							url: existingBlock.attributes.url,
							id: existingBlock.attributes.id,
							alt: existingBlock.attributes.alt,
							title: existingBlock.attributes.title,
							caption: existingBlock.attributes.caption,
							description: existingBlock.attributes.description,
							isDecorative: existingBlock.attributes.isDecorative,
							aspectRatio: existingBlock.attributes.aspectRatio,
					  }
					: {};

				return createBlock( 'photo-collage/image', {
					...attrs,
					...imageData,
				} );
			} );

			replaceInnerBlocks( clientId, newBlocks );
			hasAppliedPresetRef.current = true;
		},
		[
			clientId,
			containerHeight,
			heightMode,
			innerBlocks,
			replaceInnerBlocks,
			setAttributes,
		]
	);

	return {
		applyPreset,
	};
};
