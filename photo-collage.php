<?php
/**
 * Plugin Name:       Photo Collage
 * Description:       Blocks for creating freeform photo layouts with more natural and chaotic structures that can overlap.
 * Version:           0.5.15-beta.1
 * Requires at least: 6.8
 * Requires PHP:      8.3
 * Author:            David Degner
 * Author URI:        https://www.daviddegner.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       photo-collage
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Plugin version constant
 */
define( 'PHOTO_COLLAGE_VERSION', '0.5.15-beta.1' );
define( 'PHOTO_COLLAGE_PLUGIN_FILE', __FILE__ );
define( 'PHOTO_COLLAGE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Load runtime classes needed by server-side block rendering.
 */
require_once PHOTO_COLLAGE_PLUGIN_DIR . 'includes/class-photo-collage-block-attributes.php';
require_once PHOTO_COLLAGE_PLUGIN_DIR . 'includes/class-photo-collage-renderer.php';

$release_channel_enum_file = PHOTO_COLLAGE_PLUGIN_DIR . 'includes/enum-photo-collage-release-channel.php';
$release_updater_file      = PHOTO_COLLAGE_PLUGIN_DIR . 'includes/class-photo-collage-release-updater.php';
$has_release_channel_files = file_exists( $release_channel_enum_file ) && file_exists( $release_updater_file );

if ( $has_release_channel_files ) {
	require_once $release_channel_enum_file;
	require_once $release_updater_file;
}

define( 'PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH', $has_release_channel_files );

/**
 * Registers plugin blocks.
 *
 * Uses the generated metadata manifest when available (WordPress 6.8+),
 * with a direct registration fallback for resilience.
 */
function photo_collage_register_blocks(): void {
	$blocks_dir    = PHOTO_COLLAGE_PLUGIN_DIR . 'build/blocks';
	$manifest_path = PHOTO_COLLAGE_PLUGIN_DIR . 'build/blocks-manifest.php';

	if (
		file_exists( $manifest_path ) &&
		function_exists( 'wp_register_block_metadata_collection' ) &&
		function_exists( 'wp_register_block_types_from_metadata_collection' )
	) {
		wp_register_block_metadata_collection( $blocks_dir, $manifest_path );
		wp_register_block_types_from_metadata_collection( $blocks_dir, $manifest_path );
		return;
	}

	foreach ( array( 'container', 'image', 'frame' ) as $block_name ) {
		register_block_type( $blocks_dir . '/' . $block_name );
	}
}
add_action( 'init', photo_collage_register_blocks( ... ) );

/**
 * Load release updater.
 */
function photo_collage_load_release_updater(): void {
	if ( ! PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH || ! class_exists( 'Photo_Collage_Release_Updater' ) ) {
		return;
	}

	new Photo_Collage_Release_Updater();
}
add_action( 'plugins_loaded', photo_collage_load_release_updater( ... ), 5 );

/**
 * Load admin settings page.
 */
function photo_collage_load_admin_settings(): void {
	if ( is_admin() ) {
		require_once PHOTO_COLLAGE_PLUGIN_DIR . 'includes/class-photo-collage-admin-settings.php';
		new Photo_Collage_Admin_Settings();
	}
}
add_action( 'plugins_loaded', photo_collage_load_admin_settings( ... ) );

/**
 * Invalidate cached collage scan counts when post content changes.
 *
 * @param int $post_id Post ID from the action.
 */
function photo_collage_invalidate_scan_cache( int $post_id = 0 ): void {
	if ( $post_id > 0 && ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) ) {
		return;
	}

	delete_transient( 'photo_collage_block_count' );

	$cache_version = max( 1, (int) get_option( 'photo_collage_scan_cache_version', 1 ) );
	update_option( 'photo_collage_scan_cache_version', $cache_version + 1, false );
}
add_action( 'save_post', photo_collage_invalidate_scan_cache( ... ), 10, 1 );
add_action( 'deleted_post', photo_collage_invalidate_scan_cache( ... ), 10, 1 );
add_action( 'trashed_post', photo_collage_invalidate_scan_cache( ... ), 10, 1 );
add_action( 'untrashed_post', photo_collage_invalidate_scan_cache( ... ), 10, 1 );
