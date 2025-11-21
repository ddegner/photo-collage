<?php
/**
 * Photo Collage Plugin Uninstall Script
 *
 * Handles plugin uninstallation and block conversion
 *
 * @package PhotoCollage
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

/**
 * Main uninstall process
 */
function photo_collage_uninstall()
{
    // Get user's conversion preference
    $preference = get_option('photo_collage_uninstall_preference', 'static_html');

    // Only convert if preference is not 'keep_as_is'
    if ($preference !== 'keep_as_is') {
        // Load the converter class
        require_once plugin_dir_path(__FILE__) . 'includes/class-block-converter.php';
        $converter = new Photo_Collage_Block_Converter();

        // Get all posts with collage blocks
        $post_ids = $converter->scan_all_posts();

        if (!empty($post_ids)) {
            // Log start
            error_log(sprintf(
                'Photo Collage: Starting %s conversion for %d posts',
                $preference,
                count($post_ids)
            ));

            $success_count = 0;
            $error_count = 0;

            foreach ($post_ids as $post_id) {
                try {
                    if ($converter->convert_post($post_id, $preference)) {
                        $success_count++;
                    } else {
                        $error_count++;
                        error_log(sprintf(
                            'Photo Collage: Failed to convert post ID %d',
                            $post_id
                        ));
                    }
                } catch (Exception $e) {
                    $error_count++;
                    error_log(sprintf(
                        'Photo Collage: Exception converting post ID %d: %s',
                        $post_id,
                        $e->getMessage()
                    ));
                }
            }

            // Log results
            error_log(sprintf(
                'Photo Collage: Conversion complete. Success: %d, Errors: %d',
                $success_count,
                $error_count
            ));
        } else {
            error_log('Photo Collage: No collage blocks found to convert');
        }
    } else {
        error_log('Photo Collage: User chose to keep blocks as-is, skipping conversion');
    }

    // Clean up plugin options
    delete_option('photo_collage_uninstall_preference');

    // Log completion
    error_log('Photo Collage: Uninstall complete');
}

// Run the uninstall process
photo_collage_uninstall();
