<?php
/**
 * Assets Manager for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

if (!defined('ABSPATH')) {
    exit;
}

class Photo_Collage_Assets
{
    /**
     * Initialize asset registration
     */
    public static function init()
    {
        add_action('init', array(__CLASS__, 'register_block_assets'));
    }

    /**
     * Register block assets with inline styles
     */
    public static function register_block_assets()
    {
        self::register_inline_style('container');
        self::register_inline_style('image');
    }

    /**
     * Register a block's style as inline
     *
     * @param string $block_name The name of the block folder (e.g., 'container', 'image').
     */
    private static function register_inline_style($block_name)
    {
        $handle = "photo-collage-{$block_name}-inline";
        $file_path = plugin_dir_path(dirname(__FILE__)) . "build/blocks/{$block_name}/style-index.css";

        if (file_exists($file_path)) {
            $css = file_get_contents($file_path);
            // Register a dummy handle to attach inline styles to
            wp_register_style($handle, false);
            wp_add_inline_style($handle, $css);
        }
    }
}

