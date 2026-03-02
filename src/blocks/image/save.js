export default function save( { attributes } ) {
	const { url, alt, id } = attributes;
	if ( ! url ) {
		return null;
	}
	return (
		<img
			src={ url }
			alt={ alt || '' }
			className={ id ? `wp-image-${ id }` : undefined }
		/>
	);
}
