<?php
/**
 * Block Converter Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/enums.php';
require_once __DIR__ . '/class-renderer.php';

final class Photo_Collage_Block_Converter
{
    /**
     * Scan all posts for collage blocks
     *
     * @return array<int> Array of post IDs.
     */
    public function scan_all_posts(): array
    {
        global $wpdb;

        // Use a LIKE query to find posts with the block
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $post_ids = $wpdb->get_col(
            "SELECT ID FROM {$wpdb->posts} 
            WHERE post_content LIKE '%wp:photo-collage/container%' 
            AND post_status IN ('publish', 'draft', 'pending', 'future', 'private') 
            AND post_type IN ('post', 'page')"
        ) ?? [];

        return array_map('intval', $post_ids);
    }

    /**
     * Convert blocks in a post
     *
     * @param int $post_id Post ID.
     * @param string|UninstallPreference $preference Conversion preference.
     * @return bool Success.
     */
    public function convert_post(int $post_id, string|UninstallPreference $preference): bool
    {
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        if (is_string($preference)) {
            $preference = UninstallPreference::fromString($preference);
        }

        if (!has_blocks($post->post_content)) {
            return true; // Nothing to convert
        }

        $blocks = parse_blocks($post->post_content);
        $converted_blocks = $this->convert_blocks_recursive($blocks, $preference);

        $new_content = serialize_blocks($converted_blocks);

        // Only update if changed
        if ($new_content !== $post->post_content) {
            $updated = wp_update_post([
                'ID' => $post_id,
                'post_content' => $new_content,
            ]);
            return !is_wp_error($updated);
        }

        return true;
    }

    /**
     * Recursively convert blocks
     *
     * @param array $blocks Array of blocks.
     * @param UninstallPreference $preference Preference.
     * @return array Converted blocks.
     */
    private function convert_blocks_recursive(array $blocks, UninstallPreference $preference): array
    {
        $new_blocks = [];

        foreach ($blocks as $block) {
            if (($block['blockName'] ?? '') === 'photo-collage/container') {
                // Convert this block using match expression
                $new_blocks[] = match ($preference) {
                    UninstallPreference::STATIC_HTML => $this->convert_to_static_html($block),
                    UninstallPreference::CORE_BLOCKS => $this->convert_to_core_blocks($block),
                    default => $block,
                };
            } else {
                // Recursively check inner blocks
                if (!empty($block['innerBlocks'])) {
                    $block['innerBlocks'] = $this->convert_blocks_recursive($block['innerBlocks'], $preference);
                }
                $new_blocks[] = $block;
            }
        }

        return $new_blocks;
    }

    /**
     * Convert collage container to Static HTML
     *
     * @param array $block Block data.
     * @return array New block data (HTML block).
     */
    private function convert_to_static_html(array $block): array
    {
        $attributes = $block['attrs'] ?? [];
        $inner_blocks = $block['innerBlocks'] ?? [];

        $height = $attributes['containerHeight'] ?? '500px';
        $stack_on_mobile = $attributes['stackOnMobile'] ?? true;

        $classes = 'wp-block-photo-collage-container';
        if ($stack_on_mobile) {
            $classes .= ' is-stack-on-mobile';
        }

        $style = '';
        if (!empty($height)) {
            $style .= "height: " . esc_attr($height) . "; ";
        }
        $style .= "min-height: 200px; position: relative; display: flex; flex-wrap: wrap; width: 100%; box-sizing: border-box;";

        $html = sprintf('<div class="%s" style="%s">', esc_attr($classes), esc_attr($style));

        foreach ($inner_blocks as $inner_block) {
            if (($inner_block['blockName'] ?? '') === 'photo-collage/image') {
                $html .= $this->generate_image_html($inner_block);
            }
        }

        $html .= '</div>';

        return [
            'blockName' => 'core/html',
            'attrs' => [],
            'innerBlocks' => [],
            'innerHTML' => $html,
            'innerContent' => [$html],
        ];
    }

    /**
     * Generate HTML for a single image (used by static HTML conversion)
     *
     * @param array $image_block Image block.
     * @return string Generated HTML.
     */
    private function generate_image_html(array $image_block): string
    {
        $attrs = $image_block['attrs'] ?? [];

        if (empty($attrs['url'])) {
            return '';
        }

        // Use shared renderer
        // normalize_attributes now returns Photo_Collage_Block_Attributes object
        $normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attrs);

        // get_container_styles accepts object
        $styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
        $style_string = Photo_Collage_Renderer::build_style_string($styles);

        // Render inner content (accepts object)
        $inner_html = Photo_Collage_Renderer::render_inner_html($normalized_attrs);

        // Wrap with static class
        $html = sprintf(
            '<div class="photo-collage-image-static" style="%s; box-sizing: border-box;">',
            esc_attr($style_string)
        );

        $html .= $inner_html;
        $html .= '</div>';

        return $html;
    }

    /**
     * Convert collage to Core Group with Image blocks
     *
     * @param array $block Block data.
     * @return array New block data (Group block).
     */
    private function convert_to_core_blocks(array $block): array
    {
        $inner_blocks = $block['innerBlocks'] ?? [];
        $new_inner_blocks = [];

        foreach ($inner_blocks as $inner_block) {
            if (($inner_block['blockName'] ?? '') === 'photo-collage/image') {
                $attrs = $inner_block['attrs'] ?? [];
                if (empty($attrs['url'])) {
                    continue;
                }

                $image_attrs = [
                    'url' => $attrs['url'],
                    'alt' => $attrs['alt'] ?? '',
                    'caption' => $attrs['caption'] ?? '',
                    'title' => $attrs['title'] ?? '',
                    'id' => $attrs['id'] ?? null,
                ];

                // Create core/image block using WP_HTML_Tag_Processor
                // Start with figure and img skeleton
                $tags = new WP_HTML_Tag_Processor('<figure class="wp-block-image"><img /></figure>');

                // Configure img
                $tags->next_tag('img');
                $tags->set_attribute('src', $attrs['url']);
                $tags->set_attribute('alt', $attrs['alt'] ?? '');

                if (isset($attrs['id'])) {
                    $tags->set_attribute('class', 'wp-image-' . $attrs['id']);
                }

                $img_html = $tags->get_updated_html();

                $new_inner_blocks[] = [
                    'blockName' => 'core/image',
                    'attrs' => $image_attrs,
                    'innerBlocks' => [],
                    'innerHTML' => $img_html,
                    'innerContent' => [$img_html],
                ];
            }
        }

        // Return a Group block containing the images
        return [
            'blockName' => 'core/group',
            'attrs' => ['layout' => ['type' => 'flex', 'orientation' => 'vertical']],
            'innerBlocks' => $new_inner_blocks,
            'innerHTML' => '<div class="wp-block-group"></div>',
            'innerContent' => ['<div class="wp-block-group">', null, '</div>'],
        ];
    }
}
