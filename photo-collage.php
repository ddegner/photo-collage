<?php
/**
 * Plugin Name:       Photo Collage
 * Description:       Blocks for creating freeform photo layouts with more natural and chaotic structures that can overlap.
 * Version:           0.5.8
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

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Plugin version constant
 */
define('PHOTO_COLLAGE_VERSION', '0.5.8');

/**
 * Registers the blocks.
 */
function photo_collage_block_init(): void
{
	register_block_type(
		block_type: plugin_dir_path(__FILE__) . 'build/blocks/container/block.json'
	);
	register_block_type(
		block_type: plugin_dir_path(__FILE__) . 'build/blocks/image/block.json'
	);
	register_block_type(
		block_type: plugin_dir_path(__FILE__) . 'build/blocks/frame/block.json'
	);
}
add_action('init', photo_collage_block_init(...));

/**
 * Load admin settings page
 */
function photo_collage_load_admin(): void
{
	if (is_admin()) {
		require_once plugin_dir_path(__FILE__) . 'includes/class-photo-collage-admin-settings.php';
		new Photo_Collage_Admin_Settings();
	}
}
add_action('plugins_loaded', photo_collage_load_admin(...));

/**
 * Load renderer
 */
require_once plugin_dir_path(__FILE__) . 'includes/class-photo-collage-block-attributes.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-photo-collage-renderer.php';
