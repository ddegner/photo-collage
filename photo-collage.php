<?php
/**
 * Plugin Name:       Photo Collage
 * Description:       A block for creating photo collages with overlapping images.
 * Version:           0.4.0
 * Requires at least: 6.8
 * Requires PHP:      8.1
 * Author:            David Degner
 * Author URI:        https://www.daviddegner.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       photo-collage
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the blocks.
 */
function photo_collage_block_init(): void
{
	register_block_type(
		block_type: __DIR__ . '/build/blocks/container/block.json',
		args: [
			'style' => 'photo-collage-container-inline',
		]
	);
	register_block_type(
		block_type: __DIR__ . '/build/blocks/image/block.json',
		args: [
			'style' => 'photo-collage-image-inline',
		]
	);
}
add_action('init', photo_collage_block_init(...));

/**
 * Load asset manager
 */
require_once plugin_dir_path(__FILE__) . 'includes/class-assets.php';
Photo_Collage_Assets::init();

/**
 * Load admin settings page
 */
function photo_collage_load_admin(): void
{
	if (is_admin()) {
		require_once plugin_dir_path(__FILE__) . 'includes/class-admin-settings.php';
        new Photo_Collage_Admin_Settings();
	}
}
add_action('plugins_loaded', photo_collage_load_admin(...));

/**
 * Load renderer
 */
require_once plugin_dir_path(__FILE__) . 'includes/class-renderer.php';
