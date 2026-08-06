import { __, sprintf } from '@wordpress/i18n';
import { useBlockEditingMode } from '@wordpress/block-editor';
import { Notice } from '@wordpress/components';
import './canvas-parent-notice.scss';

/**
 * Editor-only notice for collage items placed outside a Collage Container.
 *
 * Canvas move and resize handles are gated on the item being a direct child of
 * a container, because every gesture measures against that container's box.
 * Without this notice the controls are simply absent, which reads as a broken
 * plugin rather than a fixable block arrangement.
 *
 * @param {Object}  props                     Component props.
 * @param {boolean} props.isDirectCanvasChild Whether the item sits in a container.
 * @param {string}  props.itemName            Localized item name.
 * @return {Element|null} The notice, or null when the item is placed correctly.
 */
export default function CanvasParentNotice( {
	isDirectCanvasChild,
	itemName,
} ) {
	const editingMode = useBlockEditingMode();

	// Restricted editing modes cannot restructure blocks, so the instruction
	// would be noise the user has no way to act on.
	if ( isDirectCanvasChild || editingMode !== 'default' ) {
		return null;
	}

	return (
		<Notice
			className="photo-collage-parent-notice"
			status="warning"
			isDismissible={ false }
			politeness="polite"
		>
			{ sprintf(
				/* translators: %s is the collage item type. */
				__(
					'This %s is not inside a Collage Container, so the canvas move and resize handles are unavailable. Add a Collage Container block and move this item into it to position it freely.',
					'photo-collage'
				),
				itemName
			) }
		</Notice>
	);
}
