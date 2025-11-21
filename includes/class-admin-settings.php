<?php
/**
 * Admin Settings Page for Photo Collage Plugin
 *
 * Provides settings interface for configuring uninstall behavior
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

require_once __DIR__ . '/enums.php';

/**
 * Class Photo_Collage_Admin_Settings
 *
 * Handles the admin settings page for the Photo Collage plugin
 */
final class Photo_Collage_Admin_Settings
{
    /**
     * Option name for storing uninstall preference
     */
    public const string OPTION_NAME = 'photo_collage_uninstall_preference';

    /**
     * Initialize the admin settings
     */
    public function __construct()
    {
        add_action('admin_menu', $this->add_settings_page(...));
        add_action('admin_init', $this->register_settings(...));
        add_filter('plugin_action_links_photo-collage/photo-collage.php', $this->add_settings_link(...));
    }

    /**
     * Add settings page to WordPress admin
     */
    public function add_settings_page(): void
    {
        add_options_page(
            page_title: __('Photo Collage Settings', 'photo-collage'),
            menu_title: __('Photo Collage', 'photo-collage'),
            capability: 'manage_options',
            menu_slug: 'photo-collage-settings',
            callback: $this->render_settings_page(...)
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings(): void
    {
        register_setting(
            option_group: 'photo_collage_settings',
            option_name: self::OPTION_NAME,
            args: [
                'type' => 'string',
                'default' => UninstallPreference::STATIC_HTML->value,
                'sanitize_callback' => $this->sanitize_preference(...),
            ]
        );
    }

    /**
     * Sanitize the preference value
     *
     * @param string $value The value to sanitize.
     * @return string Sanitized value.
     */
    public function sanitize_preference(string $value): string
    {
        return UninstallPreference::fromString($value)->value;
    }

    /**
     * Add settings link to plugin row
     *
     * @param array<string> $links Existing plugin action links.
     * @return array<string> Modified links.
     */
    public function add_settings_link(array $links): array
    {
        $settings_link = '<a href="' . admin_url('options-general.php?page=photo-collage-settings') . '">' . __('Configure Uninstall', 'photo-collage') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Scan all posts for photo collage blocks
     *
     * @return int Number of collage blocks found.
     */
    private function scan_collage_blocks(): int
    {
        // Check transient first
        $cached_count = get_transient('photo_collage_block_count');
        if ($cached_count !== false) {
            return (int) $cached_count;
        }

        global $wpdb;

        // Efficiently count posts with the block using LIKE
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $posts_with_blocks = $wpdb->get_col(
            "SELECT post_content FROM {$wpdb->posts}
            WHERE post_content LIKE '%wp:photo-collage/container%'
            AND post_status IN ('publish', 'draft', 'pending', 'future', 'private')
            AND post_type IN ('post', 'page')"
        ) ?? [];

        $count = 0;
        foreach ($posts_with_blocks as $content) {
            // Quick string count instead of full parse
            $count += substr_count($content, '<!-- wp:photo-collage/container');
        }

        // Cache for 1 hour
        set_transient('photo_collage_block_count', $count, HOUR_IN_SECONDS);

        return $count;
    }

    /**
     * Recursively count collage blocks
     *
     * @param array $blocks Array of blocks to search.
     * @return int Number of collage blocks found.
     */
    private function count_collage_blocks(array $blocks): int
    {
        $count = 0;

        foreach ($blocks as $block) {
            if (($block['blockName'] ?? '') === 'photo-collage/container') {
                $count++;
            }

            if (!empty($block['innerBlocks'])) {
                $count += $this->count_collage_blocks($block['innerBlocks']);
            }
        }

        return $count;
    }

    /**
     * Render the settings page
     */
    public function render_settings_page(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }

        $current_preference = UninstallPreference::fromString(
            (string) get_option(self::OPTION_NAME, UninstallPreference::STATIC_HTML->value)
        );
        $block_count = $this->scan_collage_blocks();

        // Handle form submission
        if (isset($_POST['photo_collage_settings_nonce'])) {
            if (!wp_verify_nonce($_POST['photo_collage_settings_nonce'], 'photo_collage_uninstall_options')) {
                throw new RuntimeException('Security check failed');
            }

            if (isset($_POST[self::OPTION_NAME])) {
                $value = sanitize_text_field(wp_unslash($_POST[self::OPTION_NAME]));
                update_option(self::OPTION_NAME, $this->sanitize_preference($value));
                echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Settings saved successfully.', 'photo-collage') . '</p></div>';
                $current_preference = UninstallPreference::fromString((string) get_option(self::OPTION_NAME));
            }
        }

        // Handle export
        if (isset($_GET['action']) && $_GET['action'] === 'export') {
             if (!check_admin_referer('photo_collage_export', 'nonce')) {
                 throw new RuntimeException('Security check failed');
             }
            $this->export_collage_data();
            exit;
        }

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Photo Collage Uninstall Settings', 'photo-collage'); ?></h1>

            <div class="notice notice-warning">
                <p>
                    <strong><?php esc_html_e('⚠️ Important:', 'photo-collage'); ?></strong>
                    <?php esc_html_e('When you uninstall this plugin, your collage blocks will be converted based on the option you choose below. This conversion is irreversible.', 'photo-collage'); ?>
                </p>
            </div>

            <div class="notice notice-info">
                <p>
                    <strong><?php esc_html_e('Collage Blocks Found:', 'photo-collage'); ?></strong>
                    <?php
                    if ($block_count === 0) {
                        esc_html_e('No collage blocks found in your content.', 'photo-collage');
                    } else {
                        /* translators: %d: number of collage blocks */
                        printf(esc_html(_n('%d collage block found', '%d collage blocks found', $block_count, 'photo-collage')), absint($block_count));
                    }
                    ?>
                </p>
            </div>

            <form method="post" action="">
                <?php wp_nonce_field('photo_collage_uninstall_options', 'photo_collage_settings_nonce'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <?php esc_html_e('Conversion Method', 'photo-collage'); ?>
                        </th>
                        <td>
                            <fieldset>
                                <legend class="screen-reader-text">
                                    <span><?php esc_html_e('Choose conversion method', 'photo-collage'); ?></span>
                                </legend>

                                <label>
                                    <input type="radio" name="<?php echo esc_attr(self::OPTION_NAME); ?>" value="<?php echo esc_attr(UninstallPreference::STATIC_HTML->value); ?>"
                                        <?php checked($current_preference->value, UninstallPreference::STATIC_HTML->value); ?>>
                                    <strong><?php esc_html_e('Convert to Static HTML (Recommended)', 'photo-collage'); ?></strong>
                                    <p class="description">
                                        <?php esc_html_e('Preserves the exact visual appearance of your collages including layout, positioning, rotation, and opacity. Blocks will become HTML blocks that cannot be edited visually, but will look exactly the same.', 'photo-collage'); ?>
                                    </p>
                                </label>

                                <br>

                                <label>
                                    <input type="radio" name="<?php echo esc_attr(self::OPTION_NAME); ?>" value="<?php echo esc_attr(UninstallPreference::CORE_BLOCKS->value); ?>"
                                        <?php checked($current_preference->value, UninstallPreference::CORE_BLOCKS->value); ?>>
                                    <strong><?php esc_html_e('Convert to Core Image Blocks', 'photo-collage'); ?></strong>
                                    <p class="description">
                                        <?php esc_html_e('Converts collages to standard WordPress image blocks inside a group block. Images will be editable but will lose advanced positioning, rotation, z-index, and layout features. Images will stack vertically.', 'photo-collage'); ?>
                                    </p>
                                </label>

                                <br>

                                <label>
                                    <input type="radio" name="<?php echo esc_attr(self::OPTION_NAME); ?>" value="<?php echo esc_attr(UninstallPreference::KEEP_AS_IS->value); ?>"
                                        <?php checked($current_preference->value, UninstallPreference::KEEP_AS_IS->value); ?>>
                                    <strong><?php esc_html_e('Keep As-Is (Reversible)', 'photo-collage'); ?></strong>
                                    <p class="description">
                                        <?php esc_html_e('Leaves block data intact. Content will not display while the plugin is uninstalled, but will be fully restored if you reinstall the plugin.', 'photo-collage'); ?>
                                    </p>
                                </label>
                            </fieldset>
                        </td>
                    </tr>
                </table>

                <h2><?php esc_html_e('Feature Comparison', 'photo-collage'); ?></h2>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th><?php esc_html_e('Feature', 'photo-collage'); ?></th>
                            <th><?php esc_html_e('Static HTML', 'photo-collage'); ?></th>
                            <th><?php esc_html_e('Core Image Blocks', 'photo-collage'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><?php esc_html_e('Preserves layout', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>❌</td>
                        </tr>
                        <tr class="alternate">
                            <td><?php esc_html_e('Preserves positioning', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>❌</td>
                        </tr>
                        <tr>
                            <td><?php esc_html_e('Preserves rotation', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>❌</td>
                        </tr>
                        <tr class="alternate">
                            <td><?php esc_html_e('Preserves z-index (layering)', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>❌</td>
                        </tr>
                        <tr>
                            <td><?php esc_html_e('Editable after uninstall', 'photo-collage'); ?></td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr class="alternate">
                            <td><?php esc_html_e('Image URL preserved', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td><?php esc_html_e('Alt text preserved', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr class="alternate">
                            <td><?php esc_html_e('Caption preserved', 'photo-collage'); ?></td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                    </tbody>
                </table>

                <?php submit_button(); ?>
            </form>

            <?php if ($block_count > 0): ?>
                <h2><?php esc_html_e('Backup Your Data', 'photo-collage'); ?></h2>
                <p><?php esc_html_e('Before uninstalling, we recommend exporting your collage data as a backup.', 'photo-collage'); ?>
                </p>
                <a href="<?php echo esc_url(wp_nonce_url(admin_url('options-general.php?page=photo-collage-settings&action=export'), 'photo_collage_export', 'nonce')); ?>"
                    class="button button-secondary">
                    <?php esc_html_e('Export Collage Data (JSON)', 'photo-collage'); ?>
                </a>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Export collage data as JSON
     */
    private function export_collage_data(): void
    {
        global $wpdb;

        $export_data = [
            'exported_at' => current_time('mysql'),
            'site_url' => get_site_url(),
            'collages' => [],
        ];

        // Only fetch posts that actually have the block
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $posts = $wpdb->get_results(
            "SELECT ID, post_title, post_content, post_type FROM {$wpdb->posts}
            WHERE post_content LIKE '%wp:photo-collage/container%'
            AND post_status IN ('publish', 'draft', 'pending', 'future', 'private')
            AND post_type IN ('post', 'page')"
        ) ?? [];

        foreach ($posts as $post) {
            if (has_blocks($post->post_content)) {
                $blocks = parse_blocks($post->post_content);
                $collage_blocks = $this->extract_collage_blocks($blocks);

                if (!empty($collage_blocks)) {
                    $export_data['collages'][] = [
                        'post_id' => $post->ID,
                        'post_title' => $post->post_title,
                        'post_type' => $post->post_type,
                        'permalink' => get_permalink($post->ID),
                        'blocks' => $collage_blocks,
                    ];
                }
            }
        }

        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="photo-collage-backup-' . gmdate('Y-m-d') . '.json"');
        echo wp_json_encode($export_data, JSON_PRETTY_PRINT);
    }

    /**
     * Extract collage blocks from blocks array
     *
     * @param array $blocks Array of blocks to search.
     * @return array Array of collage blocks.
     */
    private function extract_collage_blocks(array $blocks): array
    {
        $collage_blocks = [];

        foreach ($blocks as $block) {
            if (($block['blockName'] ?? '') === 'photo-collage/container') {
                $collage_blocks[] = $block;
            }

            if (!empty($block['innerBlocks'])) {
                $collage_blocks = array_merge($collage_blocks, $this->extract_collage_blocks($block['innerBlocks']));
            }
        }

        return $collage_blocks;
    }
}

