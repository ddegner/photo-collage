<?php
/**
 * Block Converter Class for Photo Collage Plugin
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
 * Class Photo_Collage_Block_Converter
 *
 * Handles conversion of Photo Collage blocks to other formats.
 */
final class Photo_Collage_Block_Converter {



	/**
	 * Get the base WHERE clause for finding posts with collage blocks.
	 *
	 * @return string SQL WHERE clause fragment.
	 */
	private static function get_collage_posts_where_clause(): string {
		global $wpdb;
		return "post_content LIKE '%wp:photo-collage/container%' 
            AND post_status IN ('publish', 'draft', 'pending', 'future', 'private') 
            AND post_type IN ('post', 'page')";
	}

	/**
	 * Get all post IDs that contain collage blocks.
	 *
	 * @return array<int> Array of post IDs.
	 */
	public static function get_posts_with_collage_blocks(): array {
		global $wpdb;

		$where = self::get_collage_posts_where_clause();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$post_ids = $wpdb->get_col(
			"SELECT ID FROM {$wpdb->posts} WHERE {$where}" // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		) ?? array();

		return array_map( 'intval', $post_ids );
	}

	/**
	 * Get post content for posts containing collage blocks.
	 *
	 * @return array<string> Array of post content strings.
	 */
	public static function get_collage_post_content(): array {
		global $wpdb;

		$where = self::get_collage_posts_where_clause();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_col(
			"SELECT post_content FROM {$wpdb->posts} WHERE {$where}" // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		) ?? array();
	}

	/**
	 * Scan all posts for collage blocks (legacy method, use get_posts_with_collage_blocks instead)
	 *
	 * @return array<int> Array of post IDs.
	 */
	public function scan_all_posts(): array {
		return self::get_posts_with_collage_blocks();
	}

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

		$height          = $attributes['containerHeight'] ?? '500px';
		$stack_on_mobile = $attributes['stackOnMobile'] ?? true;

		$classes = 'wp-block-photo-collage-container';
		if ( $stack_on_mobile ) {
			$classes .= ' is-stack-on-mobile';
		}

		$style = '';
		if ( ! empty( $height ) ) {
			$style .= 'height: ' . esc_attr( $height ) . '; ';
		}
		$style .= 'min-height: 200px; position: relative; display: flex; flex-wrap: wrap; width: 100%; box-sizing: border-box;';

		$html = sprintf( '<div class="%s" style="%s">', esc_attr( $classes ), esc_attr( $style ) );

		foreach ( $inner_blocks as $inner_block ) {
			if ( ( $inner_block['blockName'] ?? '' ) === 'photo-collage/image' ) {
				$html .= $this->generate_image_html( $inner_block );
			}
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
		$styles       = Photo_Collage_Renderer::get_container_styles( $normalized_attrs );
		$style_string = Photo_Collage_Renderer::build_style_string( $styles );

		// Render inner content (accepts object).
		$inner_html = Photo_Collage_Renderer::render_inner_html( $normalized_attrs );

		// Wrap with static class.
		$html = sprintf(
			'<div class="photo-collage-image-static" style="%s; box-sizing: border-box;">',
			esc_attr( $style_string )
		);

		$html .= $inner_html;
		$html .= '</div>';

		return $html;
	}

	/**
	 * Convert collage to Core Group with Image blocks
	 *
	 * @param array $block Block data.
	 * @return array New block data (Group block).
	 */
	private function convert_to_core_blocks( array $block ): array {
		$inner_blocks     = $block['innerBlocks'] ?? array();
		$new_inner_blocks = array();

		foreach ( $inner_blocks as $inner_block ) {
			if ( ( $inner_block['blockName'] ?? '' ) === 'photo-collage/image' ) {
				$attrs = $inner_block['attrs'] ?? array();
				if ( empty( $attrs['url'] ) ) {
					continue;
				}

				$image_attrs = array(
					'url'     => $attrs['url'],
					'alt'     => $attrs['alt'] ?? '',
					'caption' => $attrs['caption'] ?? '',
					'title'   => $attrs['title'] ?? '',
					'id'      => $attrs['id'] ?? null,
				);

				// Create core/image block using WP_HTML_Tag_Processor.
				// Start with figure and img skeleton.
				$tags = new WP_HTML_Tag_Processor( '<figure class="wp-block-image"><img /></figure>' );

				// Configure img.
				$tags->next_tag( 'img' );
				$tags->set_attribute( 'src', $attrs['url'] );
				$tags->set_attribute( 'alt', $attrs['alt'] ?? '' );

				if ( isset( $attrs['id'] ) ) {
					$tags->set_attribute( 'class', 'wp-image-' . $attrs['id'] );
				}

				$img_html = $tags->get_updated_html();

				$new_inner_blocks[] = array(
					'blockName'    => 'core/image',
					'attrs'        => $image_attrs,
					'innerBlocks'  => array(),
					'innerHTML'    => $img_html,
					'innerContent' => array( $img_html ),
				);
			}
		}

		// Return a Group block containing the images.
		return array(
			'blockName'    => 'core/group',
			'attrs'        => array(
				'layout' => array(
					'type'        => 'flex',
					'orientation' => 'vertical',
				),
			),
			'innerBlocks'  => $new_inner_blocks,
			'innerHTML'    => '<div class="wp-block-group"></div>',
			'innerContent' => array( '<div class="wp-block-group">', null, '</div>' ),
		);
	}
}
