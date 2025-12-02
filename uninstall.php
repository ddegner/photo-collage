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

/**
 * Main uninstall process
 */
function photo_collage_uninstall(): void {
	// Get user's conversion preference.
	$preference_value = (string) get_option( 'photo_collage_uninstall_preference', 'static_html' );
	$preference       = Photo_Collage_Uninstall_Preference::tryFrom( $preference_value ) ?? Photo_Collage_Uninstall_Preference::STATIC_HTML;

	// Only convert if preference is not 'keep_as_is'.
	if ( Photo_Collage_Uninstall_Preference::KEEP_AS_IS !== $preference ) {
		// Load the converter class.
		require_once plugin_dir_path( __FILE__ ) . 'includes/class-photo-collage-block-converter.php';
		// Enums are required by the converter, and might be required here if we use them.
		require_once plugin_dir_path( __FILE__ ) . 'includes/enums.php';

		$converter = new Photo_Collage_Block_Converter();

		// Get all posts with collage blocks.
		$post_ids = $converter->scan_all_posts();

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
	delete_transient( 'photo_collage_block_count' );
}

// Load Enum definition if not already loaded (uninstall context).
if ( ! class_exists( 'Photo_Collage_Uninstall_Preference' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'includes/enums.php';
}

// Run the uninstall process.
photo_collage_uninstall();
