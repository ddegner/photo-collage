<?php
/**
 * Collage Converter Service for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/enums.php';
require_once __DIR__ . '/class-photo-collage-block-attributes.php';
require_once __DIR__ . '/class-photo-collage-renderer.php';

/**
 * Service responsible for converting collage blocks during uninstall.
 */
final class Photo_Collage_Collage_Converter {
	/**
	 * Convert blocks in a post
	 *
	 * @param int                                       $post_id Post ID.
	 * @param string|Photo_Collage_Uninstall_Preference $preference Conversion preference.
	 * @return bool Success.
	 */
	public function convert_post( int $post_id, string|Photo_Collage_Uninstall_Preference $preference ): bool {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return false;
		}

		if ( is_string( $preference ) ) {
			$preference = Photo_Collage_Uninstall_Preference::from_string( $preference );
		}

		if ( ! has_blocks( $post->post_content ) ) {
			return true; // Nothing to convert.
		}

		$blocks           = parse_blocks( $post->post_content );
		$converted_blocks = $this->convert_blocks_recursive( $blocks, $preference );

		$new_content = serialize_blocks( $converted_blocks );

		// Only update if changed.
		if ( $new_content !== $post->post_content ) {
			$updated = wp_update_post(
				array(
					'ID'           => $post_id,
					'post_content' => $new_content,
				)
			);
			return ! is_wp_error( $updated );
		}

		return true;
	}

	/**
	 * Recursively convert blocks
	 *
	 * @param array                              $blocks Array of blocks.
	 * @param Photo_Collage_Uninstall_Preference $preference Preference.
	 * @return array Converted blocks.
	 */
	private function convert_blocks_recursive( array $blocks, Photo_Collage_Uninstall_Preference $preference ): array {
		$new_blocks = array();

		foreach ( $blocks as $block ) {
			if ( ( $block['blockName'] ?? '' ) === 'photo-collage/container' ) {
				// Convert this block using match expression.
				$new_blocks[] = match ( $preference ) {
					Photo_Collage_Uninstall_Preference::STATIC_HTML => $this->convert_to_static_html( $block ),
					Photo_Collage_Uninstall_Preference::CORE_BLOCKS => $this->convert_to_core_blocks( $block ),
					default => $block,
				};
			} else {
				// Recursively check inner blocks.
				if ( ! empty( $block['innerBlocks'] ) ) {
					$block['innerBlocks'] = $this->convert_blocks_recursive( $block['innerBlocks'], $preference );
				}
				$new_blocks[] = $block;
			}
		}

		return $new_blocks;
	}

	/**
	 * Convert collage container to Static HTML
	 *
	 * @param array $block Block data.
	 * @return array New block data (HTML block).
	 */
	private function convert_to_static_html( array $block ): array {
		$attributes   = $block['attrs'] ?? array();
		$inner_blocks = $block['innerBlocks'] ?? array();

		$height            = $attributes['containerHeight'] ?? '';
		$height_mode       = $attributes['heightMode'] ?? 'fixed';
		$auto_height_hint  = $this->sanitize_auto_height_hint( $attributes['autoHeightHint'] ?? '' );
		$stack_on_mobile   = $attributes['stackOnMobile'] ?? true;
		$normalized_attrs  = Photo_Collage_Renderer::normalize_attributes( $attributes );
		$background_styles = $this->get_static_background_styles( $attributes, $normalized_attrs );

		if ( ! in_array( $height_mode, array( 'fixed', 'auto' ), true ) ) {
			$height_mode = 'fixed';
		}

		$classes = 'wp-block-photo-collage-container';
		if ( $stack_on_mobile ) {
			$classes .= ' is-stack-on-mobile';
		}
		if ( 'auto' === $height_mode ) {
			$classes .= ' is-height-auto';
		}

		$style = '';
		if ( 'fixed' === $height_mode && ! empty( $height ) ) {
			$style .= 'height: ' . esc_attr( $height ) . '; ';
		} elseif ( 'auto' === $height_mode && '' !== $auto_height_hint ) {
			$style .= 'height: ' . esc_attr( $auto_height_hint ) . '; ';
		}
		$style .= 'min-height: 200px; position: relative; display: flex; flex-wrap: wrap; width: 100%; box-sizing: border-box;';
		$style .= ' ' . Photo_Collage_Renderer::build_style_string( $background_styles );

		$html = sprintf( '<div class="%s" style="%s">', esc_attr( $classes ), esc_attr( $style ) );

		foreach ( $inner_blocks as $inner_block ) {
			$html .= $this->render_static_inner_block( $inner_block );
		}

		$html .= '</div>';

		return array(
			'blockName'    => 'core/html',
			'attrs'        => array(),
			'innerBlocks'  => array(),
			'innerHTML'    => $html,
			'innerContent' => array( $html ),
		);
	}

	/**
	 * Generate HTML for a single image (used by static HTML conversion)
	 *
	 * @param array $image_block Image block.
	 * @return string Generated HTML.
	 */
	private function generate_image_html( array $image_block ): string {
		$attrs = $image_block['attrs'] ?? array();

		if ( empty( $attrs['url'] ) ) {
			return '';
		}

		// Use shared renderer.
		// normalize_attributes now returns Photo_Collage_Block_Attributes object.
		$normalized_attrs = Photo_Collage_Renderer::normalize_attributes( $attrs );

		// get_container_styles accepts object.
		$styles            = Photo_Collage_Renderer::get_container_styles( $normalized_attrs );
		$background_styles = $this->get_static_background_styles( $attrs, $normalized_attrs );
		$style_string      = Photo_Collage_Renderer::build_style_string( array_merge( $styles, $background_styles ) );
		if ( ! empty( $attrs['divStyle'] ) ) {
			$style_string .= ' ' . $attrs['divStyle'];
		}

		// Render inner content (accepts object).
		$inner_html = Photo_Collage_Renderer::render_inner_html( $normalized_attrs );

		// Wrap with static class.
		$wrapper_class = trim( 'photo-collage-image-static ' . (string) ( $attrs['divClass'] ?? '' ) );
		$html          = sprintf(
			'<div class="%s" style="%s; box-sizing: border-box;">',
			esc_attr( $wrapper_class ),
			esc_attr( $style_string )
		);

		$html .= $inner_html;
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render an inner block as static HTML.
	 *
	 * @param array $inner_block Parsed block.
	 * @return string
	 */
	private function render_static_inner_block( array $inner_block ): string {
		$block_name = $inner_block['blockName'] ?? '';

		return match ( $block_name ) {
			'photo-collage/image' => $this->generate_image_html( $inner_block ),
			'photo-collage/frame' => $this->generate_frame_html( $inner_block ),
			default => render_block( $inner_block ),
		};
	}

	/**
	 * Generate static HTML for a frame block.
	 *
	 * @param array $frame_block Frame block data.
	 * @return string
	 */
	private function generate_frame_html( array $frame_block ): string {
		$attrs        = $frame_block['attrs'] ?? array();
		$inner_blocks = $frame_block['innerBlocks'] ?? array();

		$normalized_attrs = Photo_Collage_Renderer::normalize_attributes( $attrs );
		$styles           = Photo_Collage_Renderer::get_container_styles( $normalized_attrs );
		$background       = $this->get_static_background_styles( $attrs, $normalized_attrs );
		$style_string     = Photo_Collage_Renderer::build_style_string( array_merge( $styles, $background ) );
		$wrapper_class    = trim( 'photo-collage-frame-static ' . (string) ( $attrs['className'] ?? '' ) );

		$html = sprintf(
			'<div class="%s" style="%s; box-sizing: border-box;">',
			esc_attr( $wrapper_class ),
			esc_attr( $style_string )
		);

		foreach ( $inner_blocks as $inner_block ) {
			$html .= $this->render_static_inner_block( $inner_block );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Get background styles for static conversion.
	 *
	 * Dynamic rendering gets native style support values via wrapper attributes.
	 * For static HTML conversion we must merge those values ourselves.
	 *
	 * @param array                          $attrs            Raw block attributes.
	 * @param Photo_Collage_Block_Attributes $normalized_attrs Normalized attributes.
	 * @return array<string, string>
	 */
	private function get_static_background_styles( array $attrs, Photo_Collage_Block_Attributes $normalized_attrs ): array {
		$styles = Photo_Collage_Renderer::get_background_styles( $normalized_attrs );

		$native_background = $attrs['style']['color']['background'] ?? '';
		if ( is_string( $native_background ) && '' !== $native_background ) {
			$styles['background-color'] = $this->normalize_preset_value( $native_background, 'color' );
		}

		$native_gradient = $attrs['style']['color']['gradient'] ?? '';
		if ( is_string( $native_gradient ) && '' !== $native_gradient ) {
			$styles['background-image'] = $this->normalize_preset_value( $native_gradient, 'gradient' );
		}

		return $styles;
	}

	/**
	 * Sanitize a saved auto-height hint value.
	 *
	 * @param mixed $value Raw hint value.
	 * @return string
	 */
	private function sanitize_auto_height_hint( mixed $value ): string {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$hint = strtolower( trim( (string) $value ) );
		if ( 1 === preg_match( '/^\d+(?:\.\d+)?(?:px|%)$/', $hint ) ) {
			return $hint;
		}

		return '';
	}

	/**
	 * Convert preset token values to valid CSS variables.
	 *
	 * @param string $value       Raw value.
	 * @param string $preset_type Preset type (color|gradient).
	 * @return string
	 */
	private function normalize_preset_value( string $value, string $preset_type ): string {
		$prefix = "var:preset|{$preset_type}|";
		if ( ! str_starts_with( $value, $prefix ) ) {
			return $value;
		}

		$slug = str_replace( '|', '--', substr( $value, strlen( $prefix ) ) );
		if ( '' === $slug ) {
			return $value;
		}

		return "var(--wp--preset--{$preset_type}--{$slug})";
	}

	/**
	 * Convert collage to Core Group with converted inner blocks.
	 *
	 * @param array $block Block data.
	 * @return array New block data (Group block).
	 */
	private function convert_to_core_blocks( array $block ): array {
		$inner_blocks = $block['innerBlocks'] ?? array();
		return $this->build_core_group_block( $this->convert_inner_blocks_to_core( $inner_blocks ) );
	}

	/**
	 * Convert child blocks to core equivalents for uninstall conversion.
	 *
	 * @param array $inner_blocks Child blocks.
	 * @return array
	 */
	private function convert_inner_blocks_to_core( array $inner_blocks ): array {
		$new_inner_blocks = array();
		foreach ( $inner_blocks as $inner_block ) {
			$block_name = $inner_block['blockName'] ?? '';

			if ( 'photo-collage/image' === $block_name ) {
				$converted_image = $this->convert_image_to_core_image( $inner_block );
				if ( null !== $converted_image ) {
					$new_inner_blocks[] = $converted_image;
				}
				continue;
			}

			if ( 'photo-collage/frame' === $block_name ) {
				$frame_inner_blocks = $inner_block['innerBlocks'] ?? array();
				$new_inner_blocks[] = $this->build_core_group_block(
					$this->convert_inner_blocks_to_core( $frame_inner_blocks )
				);
				continue;
			}

			$new_inner_blocks[] = $inner_block;
		}

		return $new_inner_blocks;
	}

	/**
	 * Convert a collage image block to core/image.
	 *
	 * @param array $image_block Image block data.
	 * @return array|null
	 */
	private function convert_image_to_core_image( array $image_block ): ?array {
		$attrs = $image_block['attrs'] ?? array();
		if ( empty( $attrs['url'] ) ) {
			return null;
		}

		$image_attrs = array(
			'url'      => (string) $attrs['url'],
			'alt'      => (string) ( $attrs['alt'] ?? '' ),
			'sizeSlug' => (string) ( $attrs['sizeSlug'] ?? 'full' ),
		);
		if ( ! empty( $attrs['id'] ) ) {
			$image_attrs['id'] = (int) $attrs['id'];
		}
		if ( ! empty( $attrs['href'] ) ) {
			$image_attrs['href']            = (string) $attrs['href'];
			$image_attrs['linkDestination'] = 'custom';
			if ( ! empty( $attrs['linkTarget'] ) ) {
				$image_attrs['linkTarget'] = (string) $attrs['linkTarget'];
			}
			if ( ! empty( $attrs['rel'] ) ) {
				$image_attrs['rel'] = (string) $attrs['rel'];
			}
		}

		$img_tags = new WP_HTML_Tag_Processor( '<img />' );
		$img_tags->next_tag();
		$img_tags->set_attribute( 'src', (string) $attrs['url'] );
		$img_tags->set_attribute( 'alt', (string) ( $attrs['alt'] ?? '' ) );
		if ( ! empty( $attrs['id'] ) ) {
			$img_tags->set_attribute( 'class', 'wp-image-' . (int) $attrs['id'] );
		}
		if ( ! empty( $attrs['title'] ) ) {
			$img_tags->set_attribute( 'title', (string) $attrs['title'] );
		}

		$image_html = $img_tags->get_updated_html();
		if ( ! empty( $attrs['href'] ) ) {
			$link_tags = new WP_HTML_Tag_Processor( '<a></a>' );
			$link_tags->next_tag();
			$link_tags->set_attribute( 'href', (string) $attrs['href'] );
			if ( ! empty( $attrs['linkTarget'] ) ) {
				$link_tags->set_attribute( 'target', (string) $attrs['linkTarget'] );
			}
			if ( ! empty( $attrs['rel'] ) ) {
				$link_tags->set_attribute( 'rel', (string) $attrs['rel'] );
			}
			$link_open  = str_replace( '</a>', '', $link_tags->get_updated_html() );
			$image_html = $link_open . $image_html . '</a>';
		}

		$caption_html = '';
		if ( ! empty( $attrs['caption'] ) ) {
			$caption_html = sprintf(
				'<figcaption class="wp-element-caption">%s</figcaption>',
				wp_kses_post( (string) $attrs['caption'] )
			);
		}

		$figure_html = sprintf(
			'<figure class="wp-block-image">%s%s</figure>',
			$image_html,
			$caption_html
		);

		return array(
			'blockName'    => 'core/image',
			'attrs'        => $image_attrs,
			'innerBlocks'  => array(),
			'innerHTML'    => $figure_html,
			'innerContent' => array( $figure_html ),
		);
	}

	/**
	 * Build a core/group wrapper with correctly matched innerContent placeholders.
	 *
	 * @param array $inner_blocks Inner block list.
	 * @return array
	 */
	private function build_core_group_block( array $inner_blocks ): array {
		$inner_content = array_merge(
			array( '<div class="wp-block-group">' ),
			array_fill( 0, count( $inner_blocks ), null ),
			array( '</div>' )
		);

		return array(
			'blockName'    => 'core/group',
			'attrs'        => array(
				'layout' => array(
					'type'        => 'flex',
					'orientation' => 'vertical',
				),
			),
			'innerBlocks'  => $inner_blocks,
			'innerHTML'    => '<div class="wp-block-group"></div>',
			'innerContent' => $inner_content,
		);
	}
}
