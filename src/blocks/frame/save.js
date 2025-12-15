import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getBlockStyles } from '../utils/positioning-styles';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		style: getBlockStyles( attributes ),
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
