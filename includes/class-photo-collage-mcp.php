<?php
/**
 * Tell WP MCP Guard how these blocks save, so an AI client can compose them.
 *
 * @package PhotoCollage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A block's saved markup comes from its JavaScript save(), which PHP never
 * runs, so a tool composing block markup server-side cannot discover the shape
 * on its own. Being PHP-rendered does not settle it either: all three of these
 * blocks declare a render callback, yet only two of them save nothing of their
 * own. The declaration therefore has to live next to the save() it describes,
 * which is here — kept in step with src/blocks/{container,frame,image}/save.js.
 *
 * Nothing outside this class knows the answer: frame saved a wrapper div until
 * its v1 deprecation, so a copy of this recorded in another plugin would now be
 * describing markup this one stopped writing.
 *
 * The filter belongs to WP MCP Guard. With that plugin absent this file does
 * nothing at all, which costs one unused hook.
 */
final class Photo_Collage_MCP {
	/**
	 * Hook the declaration up.
	 */
	public static function register(): void {
		add_filter( 'wp_mcp_guard_block_save_shapes', array( __CLASS__, 'save_shapes' ) );
	}

	/**
	 * Declare how each block saves.
	 *
	 * @param array<string,mixed> $shapes Declared shapes.
	 * @return array<string,mixed>
	 */
	public static function save_shapes( array $shapes ): array {
		// Both return exactly <InnerBlocks.Content />: children, no wrapper.
		$shapes['photo-collage/container'] = 'children';
		$shapes['photo-collage/frame']     = 'children';

		// The image builds real markup, so it needs the composer's serializer.
		if ( method_exists( '\WPMCPGuard\Block_Composer', 'save_element' ) ) {
			$shapes['photo-collage/image'] = array( __CLASS__, 'image_markup' );
		}

		return $shapes;
	}

	/**
	 * Reproduce src/blocks/image/save.js.
	 *
	 * That save() is:
	 *
	 *     const { url, alt, id } = attributes;
	 *     if ( ! url ) { return null; }
	 *     return <img src={ url } alt={ alt || '' }
	 *         className={ id ? `wp-image-${ id }` : undefined } />;
	 *
	 * Returning '' stands in for that null, so an image with no source still
	 * serializes to the self-closing delimiter the editor writes for it.
	 *
	 * Attribute order matters and is src, alt, class: the serializer walks
	 * props in order, and a different order is different saved markup. Escaping
	 * is left to save_element(), because Gutenberg does not escape attributes
	 * the way esc_attr() does.
	 *
	 * @param array<string,mixed> $attributes Block attributes.
	 */
	public static function image_markup( array $attributes ): string {
		$url = isset( $attributes['url'] ) ? (string) $attributes['url'] : '';
		if ( '' === $url ) {
			return '';
		}

		$id = isset( $attributes['id'] ) ? (int) $attributes['id'] : 0;

		return \WPMCPGuard\Block_Composer::save_element(
			'img',
			array(
				'src'   => $url,
				'alt'   => isset( $attributes['alt'] ) ? (string) $attributes['alt'] : '',
				'class' => $id ? 'wp-image-' . $id : null,
			)
		);
	}
}
