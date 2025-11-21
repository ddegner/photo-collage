<?php
/**
 * Block Converter Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

if (!defined('ABSPATH')) {
    exit;
}

class Photo_Collage_Block_Converter
{
    /**
     * Scan all posts for collage blocks
     *
     * @return array Array of post IDs.
     */
    public function scan_all_posts()
    {
        global $wpdb;

        // Use a LIKE query to find posts with the block, which is much faster/lighter than loading all posts
        // Note: This might match commented out blocks or revisions, but we filter by post_status/type
        $post_ids = $wpdb->get_col(
            "SELECT ID FROM {$wpdb->posts} 
            WHERE post_content LIKE '%wp:photo-collage/container%' 
            AND post_status IN ('publish', 'draft', 'pending', 'future', 'private') 
            AND post_type IN ('post', 'page')"
        );

        return $post_ids;
    }

    /**
     * Convert blocks in a post
     *
     * @param int $post_id Post ID.
     * @param string $preference Conversion preference ('static_html' or 'core_blocks').
     * @return bool Success.
     */
    public function convert_post($post_id, $preference)
    {
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        if (!has_blocks($post->post_content)) {
            return true; // Nothing to convert
        }

        $blocks = parse_blocks($post->post_content);
        $converted_blocks = $this->convert_blocks_recursive($blocks, $preference);

        $new_content = serialize_blocks($converted_blocks);

        // Only update if changed
        if ($new_content !== $post->post_content) {
            $updated = wp_update_post(array(
                'ID' => $post_id,
                'post_content' => $new_content,
            ));
            return !is_wp_error($updated);
        }

        return true;
    }

    /**
     * Recursively convert blocks
     *
     * @param array $blocks Array of blocks.
     * @param string $preference Preference.
     * @return array Converted blocks.
     */
    private function convert_blocks_recursive($blocks, $preference)
    {
        $new_blocks = array();

        foreach ($blocks as $block) {
            if ($block['blockName'] === 'photo-collage/container') {
                // Convert this block
                if ($preference === 'static_html') {
                    $new_blocks[] = $this->convert_to_static_html($block);
                } elseif ($preference === 'core_blocks') {
                    $new_blocks[] = $this->convert_to_core_blocks($block);
                } else {
                    // Keep as is
                    $new_blocks[] = $block;
                }
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
    private function convert_to_static_html($block)
    {
        $attributes = $block['attrs'] ?? array();
        $inner_blocks = $block['innerBlocks'] ?? array();

        $height = isset($attributes['containerHeight']) ? $attributes['containerHeight'] : '500px';
        $stack_on_mobile = isset($attributes['stackOnMobile']) ? $attributes['stackOnMobile'] : true;

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
            if ($inner_block['blockName'] === 'photo-collage/image') {
                $html .= $this->generate_image_html($inner_block);
            }
        }

        $html .= '</div>';

        return array(
            'blockName' => 'core/html',
            'attrs' => array(),
            'innerBlocks' => array(),
            'innerHTML' => $html,
            'innerContent' => array($html),
        );
    }

    /**
     * Generate HTML for a single image (used by static HTML conversion)
     *
     * @param array $image_block Image block.
     * @return string Generated HTML.
     */
    private function generate_image_html($image_block)
    {
        $attrs = isset($image_block['attrs']) ? $image_block['attrs'] : array();

        if (empty($attrs['url'])) {
            return '';
        }

        // Use shared renderer
        $normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attrs);
        $styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
        $style_string = Photo_Collage_Renderer::build_style_string($styles);

        // Render inner content
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
    private function convert_to_core_blocks($block)
    {
        $inner_blocks = $block['innerBlocks'] ?? array();
        $new_inner_blocks = array();

        foreach ($inner_blocks as $inner_block) {
            if ($inner_block['blockName'] === 'photo-collage/image') {
                $attrs = $inner_block['attrs'] ?? array();
                if (empty($attrs['url']))
                    continue;

                $image_attrs = array(
                    'url' => $attrs['url'],
                    'alt' => $attrs['alt'] ?? '',
                    'caption' => $attrs['caption'] ?? '',
                    'title' => $attrs['title'] ?? '',
                    'id' => $attrs['id'] ?? null,
                );

                // Create core/image block
                // Note: core/image serialization is complex, simplified here
                $img_html = sprintf(
                    '<figure class="wp-block-image"><img src="%s" alt="%s" class="%s"/></figure>',
                    esc_url($attrs['url']),
                    esc_attr($attrs['alt'] ?? ''),
                    isset($attrs['id']) ? 'wp-image-' . $attrs['id'] : ''
                );

                $new_inner_blocks[] = array(
                    'blockName' => 'core/image',
                    'attrs' => $image_attrs,
                    'innerBlocks' => array(),
                    'innerHTML' => $img_html,
                    'innerContent' => array($img_html),
                );
            }
        }

        // Return a Group block containing the images
        return array(
            'blockName' => 'core/group',
            'attrs' => array('layout' => array('type' => 'flex', 'orientation' => 'vertical')),
            'innerBlocks' => $new_inner_blocks,
            'innerHTML' => '<div class="wp-block-group"></div>',
            'innerContent' => array('<div class="wp-block-group">', null, '</div>'),
        );
    }
}
