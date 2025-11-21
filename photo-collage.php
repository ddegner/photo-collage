<?php
/**
 * Plugin Name:       Photo Collage
 * Description:       A block for creating photo collages with overlapping images.
 * Version:           0.1.0
 * Requires at least: 6.4
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       photo-collage
 *
 * @package PhotoCollage
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Load the plugin text domain.
 */
function photo_collage_textdomain()
{
	load_plugin_textdomain('photo-collage', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', 'photo_collage_textdomain');

/**
 * Registers the blocks.
 */
function photo_collage_block_init()
{
	register_block_type(__DIR__ . '/build/blocks/container/block.json', array(
		'style' => 'photo-collage-container-inline',
	));
	register_block_type(__DIR__ . '/build/blocks/image/block.json', array(
		'style' => 'photo-collage-image-inline',
	));
}
add_action('init', 'photo_collage_block_init');

/**
 * Load asset manager
 */
require_once plugin_dir_path(__FILE__) . 'includes/class-assets.php';
Photo_Collage_Assets::init();

/**
 * Load admin settings page
 */
function photo_collage_load_admin()
{
	if (is_admin()) {
		require_once plugin_dir_path(__FILE__) . 'includes/class-admin-settings.php';
	}
}
add_action('plugins_loaded', 'photo_collage_load_admin');

/**
 * Load renderer
 */
require_once plugin_dir_path(__FILE__) . 'includes/class-renderer.php';
