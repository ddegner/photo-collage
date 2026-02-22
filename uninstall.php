<?php
/**
 * Photo Collage Plugin Uninstall Script
 *
 * Handles plugin uninstallation and block conversion
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Load enum definition in uninstall context.
if ( ! enum_exists( 'Photo_Collage_Uninstall_Preference', false ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/enums.php';
}

/**
 * Main uninstall process
 */
function photo_collage_uninstall(): void {
	// Get user's conversion preference.
	$preference_value = (string) get_option( 'photo_collage_uninstall_preference', 'static_html' );
	$preference       = Photo_Collage_Uninstall_Preference::tryFrom( $preference_value ) ?? Photo_Collage_Uninstall_Preference::STATIC_HTML;

	// Only convert if preference is not 'keep_as_is'.
	if ( Photo_Collage_Uninstall_Preference::KEEP_AS_IS !== $preference ) {
		// Load conversion services.
		require_once plugin_dir_path( __FILE__ ) . 'includes/class-photo-collage-collage-scanner.php';
		require_once plugin_dir_path( __FILE__ ) . 'includes/class-photo-collage-collage-converter.php';

		$scanner   = new Photo_Collage_Collage_Scanner();
		$converter = new Photo_Collage_Collage_Converter();

		// Get all posts with collage blocks.
		$post_ids = $scanner->get_posts_with_collage_blocks();

		if ( ! empty( $post_ids ) ) {
			foreach ( $post_ids as $post_id ) {
				try {
					$converter->convert_post( $post_id, $preference );
				} catch ( Exception ) {
					// Silently fail individual post conversions during uninstall.
					continue;
				}
			}
		}
	}

	// Clean up plugin options.
	delete_option( 'photo_collage_uninstall_preference' );
	delete_option( 'photo_collage_scan_cache_version' );
	delete_transient( 'photo_collage_block_count' );
}

// Run the uninstall process.
photo_collage_uninstall();
