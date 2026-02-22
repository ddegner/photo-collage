<?php
/**
 * Collage Scanner Service for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Service responsible for locating posts containing collage blocks.
 */
final class Photo_Collage_Collage_Scanner {

	/**
	 * Cache group for collage scan query results.
	 *
	 * @var string
	 */
	private const COLLAGE_SCAN_CACHE_GROUP = 'photo_collage';

	/**
	 * Cache TTL for collage scan query results.
	 *
	 * @var int
	 */
	private const COLLAGE_SCAN_CACHE_TTL = 300;

	/**
	 * Option key used to version scan cache keys for fast invalidation.
	 *
	 * @var string
	 */
	private const COLLAGE_SCAN_CACHE_VERSION_OPTION = 'photo_collage_scan_cache_version';

	/**
	 * Get all post IDs that contain collage blocks.
	 *
	 * @return array<int>
	 */
	public function get_posts_with_collage_blocks(): array {
		$posts = $this->get_collage_posts();

		return array_map(
			static function ( WP_Post $post ): int {
				return (int) $post->ID;
			},
			$posts
		);
	}

	/**
	 * Get post content for posts containing collage blocks.
	 *
	 * @return array<string>
	 */
	public function get_collage_post_content(): array {
		$posts = $this->get_collage_posts();

		return array_map(
			static function ( WP_Post $post ): string {
				return (string) $post->post_content;
			},
			$posts
		);
	}

	/**
	 * Get detailed post records containing collage blocks.
	 *
	 * @return array<object{ID:int,post_title:string,post_content:string,post_type:string}>
	 */
	public function get_posts_with_collage_blocks_details(): array {
		$posts = $this->get_collage_posts();

		return array_map(
			static function ( WP_Post $post ): object {
				return (object) array(
					'ID'           => (int) $post->ID,
					'post_title'   => (string) $post->post_title,
					'post_content' => (string) $post->post_content,
					'post_type'    => (string) $post->post_type,
				);
			},
			$posts
		);
	}

	/**
	 * Get public post types we should scan for collage blocks.
	 *
	 * @return array<string>
	 */
	private function get_supported_post_types(): array {
		$post_types = get_post_types( array( 'public' => true ), 'names' );
		$excluded   = array(
			'attachment',
			'wp_block',
			'wp_navigation',
			'wp_template',
			'wp_template_part',
			'wp_font_face',
			'wp_global_styles',
		);

		return array_values( array_diff( $post_types, $excluded ) );
	}

	/**
	 * Get all posts that contain photo collage blocks.
	 *
	 * @return array<WP_Post>
	 */
	private function get_collage_posts(): array {
		$post_types = $this->get_supported_post_types();
		if ( empty( $post_types ) ) {
			return array();
		}

		$cache_seed = wp_json_encode( $post_types );
		if ( false === $cache_seed ) {
			$cache_seed = implode( '|', $post_types );
		}

		$cache_key    = 'collage_posts_' . $this->get_cache_version() . '_' . md5( $cache_seed );
		$cached_posts = wp_cache_get( $cache_key, self::COLLAGE_SCAN_CACHE_GROUP );

		if ( false !== $cached_posts && is_array( $cached_posts ) ) {
			return $cached_posts;
		}

		$posts = get_posts(
			array(
				'post_type'      => $post_types,
				'post_status'    => array( 'publish', 'draft', 'pending', 'future', 'private' ),
				'posts_per_page' => -1,
				'orderby'        => 'ID',
				'order'          => 'ASC',
				's'              => 'wp:photo-collage/container',
				'search_columns' => array( 'post_content' ),
				'no_found_rows'  => true,
			)
		);

		$collage_posts = array_values(
			array_filter(
				$posts,
				static function ( $post ): bool {
					return $post instanceof WP_Post && str_contains( (string) $post->post_content, 'wp:photo-collage/container' );
				}
			)
		);

		wp_cache_set( $cache_key, $collage_posts, self::COLLAGE_SCAN_CACHE_GROUP, self::COLLAGE_SCAN_CACHE_TTL );

		return $collage_posts;
	}

	/**
	 * Get current cache version.
	 *
	 * @return int
	 */
	private function get_cache_version(): int {
		$version = (int) get_option( self::COLLAGE_SCAN_CACHE_VERSION_OPTION, 1 );

		return max( 1, $version );
	}
}
