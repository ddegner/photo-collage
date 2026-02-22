import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	AlignmentToolbar,
	RichText,
} from '@wordpress/block-editor';

const ALLOWED_CAPTION_FORMATS = [
	'core/bold',
	'core/italic',
	'core/link',
	'core/strikethrough',
	'core/text-color',
	'core/subscript',
	'core/superscript',
];

export default function CaptionEditor( {
	caption,
	isSelected,
	captionAlign,
	onChangeCaption,
	onChangeCaptionAlign,
	captionClassName,
	captionInlineStyle,
} ) {
	if ( RichText.isEmpty( caption ) && ! isSelected ) {
		return null;
	}

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ captionAlign }
					onChange={ onChangeCaptionAlign }
				/>
			</BlockControls>
			<RichText
				tagName="figcaption"
				className={ captionClassName }
				placeholder={ __( 'Write caption…', 'photo-collage' ) }
				value={ caption }
				onChange={ onChangeCaption }
				inlineToolbar
				allowedFormats={ ALLOWED_CAPTION_FORMATS }
				style={ captionInlineStyle }
			/>
		</>
	);
}
