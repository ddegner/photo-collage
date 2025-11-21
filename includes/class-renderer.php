<?php
/**
 * Shared Renderer Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

if (!defined('ABSPATH')) {
    exit;
}

class Photo_Collage_Renderer
{
    /**
     * Normalize attributes with defaults
     *
     * @param array $attributes Block attributes.
     * @return array Normalized attributes.
     */
    public static function normalize_attributes($attributes)
    {
        return array_merge(array(
            'url' => '',
            'alt' => '',
            'isDecorative' => false,
            'useAbsolutePosition' => false,
            'zIndex' => 1,
            'width' => '50%',
            'height' => 'auto',
            'objectFit' => 'contain',
            'rotation' => 0,
            'opacity' => 1,
            'top' => 'auto',
            'right' => 'auto',
            'bottom' => 'auto',
            'left' => 'auto',
            'marginTop' => '0%',
            'marginRight' => '0%',
            'marginBottom' => '0%',
            'marginLeft' => '0%',
            'paddingTop' => '0%',
            'paddingRight' => '0%',
            'paddingBottom' => '0%',
            'paddingLeft' => '0%',
            'caption' => '',
            'title' => '',
            'description' => '',
        ), $attributes);
    }

    /**
     * Build style array for the container
     *
     * @param array $attributes Normalized attributes.
     * @return array Style key-value pairs.
     */
    public static function get_container_styles($attributes)
    {
        $styles = array(
            'width' => $attributes['width'],
            'height' => $attributes['height'],
            'z-index' => $attributes['zIndex'],
            'padding-top' => $attributes['paddingTop'],
            'padding-right' => $attributes['paddingRight'],
            'padding-bottom' => $attributes['paddingBottom'],
            'padding-left' => $attributes['paddingLeft'],
        );

        // Position
        if ($attributes['useAbsolutePosition']) {
            $styles['position'] = 'absolute';
            $styles['top'] = $attributes['top'];
            $styles['right'] = $attributes['right'];
            $styles['bottom'] = $attributes['bottom'];
            $styles['left'] = $attributes['left'];
        } else {
            $styles['position'] = 'relative';
            $styles['margin-top'] = $attributes['marginTop'];
            $styles['margin-right'] = $attributes['marginRight'];
            $styles['margin-bottom'] = $attributes['marginBottom'];
            $styles['margin-left'] = $attributes['marginLeft'];
        }

        // Transform
        if (!empty($attributes['rotation']) && $attributes['rotation'] != 0) {
            $styles['transform'] = "rotate({$attributes['rotation']}deg)";
        }

        // Opacity
        if (isset($attributes['opacity']) && $attributes['opacity'] != 1) {
            $styles['opacity'] = $attributes['opacity'];
        }

        return $styles;
    }

    /**
     * Build style string from array
     *
     * @param array $styles Style array.
     * @return string CSS style string.
     */
    public static function build_style_string($styles)
    {
        $style_string = '';
        foreach ($styles as $key => $value) {
            if ($value !== null && $value !== '') {
                $style_string .= "$key: $value; ";
            }
        }
        return trim($style_string);
    }

    /**
     * Generate inner HTML (img, figure, caption)
     *
     * @param array $attributes Normalized attributes.
     * @return string HTML content.
     */
    public static function render_inner_html($attributes)
    {
        if (empty($attributes['url'])) {
            return '';
        }

        $img_style = "object-fit: contain; width: 100%; height: 100%;";

        $has_caption = !empty($attributes['caption']);
        $is_decorative = $attributes['isDecorative'];
        $alt_attr = $is_decorative ? '' : $attributes['alt'];

        $has_description = !empty($attributes['description']) && !$is_decorative;
        $description_id = $has_description ? 'photo-collage-desc-' . uniqid() : '';

        $img_html = sprintf(
            '<img src="%s" alt="%s"%s%s loading="lazy" style="%s" />',
            esc_url($attributes['url']),
            esc_attr($alt_attr),
            !empty($attributes['title']) ? ' title="' . esc_attr($attributes['title']) . '"' : '',
            $has_description ? ' aria-describedby="' . esc_attr($description_id) . '"' : '',
            esc_attr($img_style)
        );

        $html = '';

        if ($has_caption) {
            $html .= '<figure class="photo-collage-image-figure">';
            $html .= $img_html;
            // Add inline style for caption if converting (optional, but good for static HTML)
            $html .= sprintf(
                '<figcaption class="photo-collage-image-caption wp-element-caption">%s</figcaption>',
                wp_kses_post($attributes['caption'])
            );
            $html .= '</figure>';
        } else {
            $html .= $img_html;
        }

        if ($has_description) {
            $html .= sprintf(
                '<div id="%s" class="screen-reader-text">%s</div>',
                esc_attr($description_id),
                wp_kses_post($attributes['description'])
            );
        }

        return $html;
    }
}

