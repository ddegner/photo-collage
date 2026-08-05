import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

export const COLLAGE_CONTAINER_BLOCK = 'photo-collage/container';

/**
 * Resolve whether a block is a direct child of a Collage Container.
 *
 * @param {string} clientId Block editor client ID.
 * @return {{isDirectCanvasChild: boolean, parentClientId: string|null}} Parent context.
 */
export default function useCanvasParent( clientId ) {
	return useSelect(
		( select ) => {
			if ( ! clientId ) {
				return {
					isDirectCanvasChild: false,
					parentClientId: null,
				};
			}

			const { getBlockName, getBlockRootClientId } =
				select( blockEditorStore );
			const parentClientId = getBlockRootClientId( clientId );
			const isDirectCanvasChild =
				Boolean( parentClientId ) &&
				getBlockName( parentClientId ) === COLLAGE_CONTAINER_BLOCK;

			return {
				isDirectCanvasChild,
				parentClientId: isDirectCanvasChild ? parentClientId : null,
			};
		},
		[ clientId ]
	);
}
