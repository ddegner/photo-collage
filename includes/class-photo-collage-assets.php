<?php
/**
 * Assets Manager for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Photo_Collage_Assets
 *
 * Handles asset registration and management.
 */
final class Photo_Collage_Assets {

	/**
	 * Initialize asset registration
	 */
	public static function init(): void {
		add_action( 'init', self::register_block_assets( ... ) );
	}

	/**
	 * Register block assets with inline styles
	 */
	public static function register_block_assets(): void {
		self::register_inline_style( 'container' );
		self::register_inline_style( 'image' );
	}

	/**
	 * Register a block's style as inline
	 *
	 * @param string $block_name The name of the block folder (e.g., 'container', 'image').
	 */
	private static function register_inline_style( string $block_name ): void {
		$handle    = "photo-collage-{$block_name}-inline";
		$file_path = plugin_dir_path( __DIR__ ) . "build/blocks/{$block_name}/style-index.css";

		if ( file_exists( $file_path ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$css = (string) file_get_contents( $file_path );
			// Register a dummy handle to attach inline styles to.
			$version = defined( 'PHOTO_COLLAGE_VERSION' ) ? PHOTO_COLLAGE_VERSION : '0.5.1';
			wp_register_style(
				handle: $handle,
				src: false,
				deps: array(),
				ver: $version
			);
			wp_add_inline_style( $handle, wp_strip_all_tags( $css ) );
		}
	}
}
