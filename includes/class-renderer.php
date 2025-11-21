<?php
/**
 * Shared Renderer Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Readonly class for block attributes
 */
final readonly class Photo_Collage_Block_Attributes
{
    public string $url;
    public string $alt;
    public bool $isDecorative;
    public bool $useAbsolutePosition;
    public int $zIndex;
    public string $width;
    public string $height;
    public string $objectFit;
    public int $rotation;
    public float $opacity;
    public string $top;
    public string $right;
    public string $bottom;
    public string $left;
    public string $marginTop;
    public string $marginRight;
    public string $marginBottom;
    public string $marginLeft;
    public string $paddingTop;
    public string $paddingRight;
    public string $paddingBottom;
    public string $paddingLeft;
    public string $caption;
    public string $title;
    public string $description;

    public function __construct(array $attributes)
    {
        $this->url = (string) ($attributes['url'] ?? '');
        $this->alt = (string) ($attributes['alt'] ?? '');
        $this->isDecorative = (bool) ($attributes['isDecorative'] ?? false);
        $this->useAbsolutePosition = (bool) ($attributes['useAbsolutePosition'] ?? false);
        $this->zIndex = (int) ($attributes['zIndex'] ?? 1);
        $this->width = (string) ($attributes['width'] ?? '50%');
        $this->height = (string) ($attributes['height'] ?? 'auto');
        $this->objectFit = (string) ($attributes['objectFit'] ?? 'contain');
        $this->rotation = (int) ($attributes['rotation'] ?? 0);
        $this->opacity = (float) ($attributes['opacity'] ?? 1);
        $this->top = (string) ($attributes['top'] ?? 'auto');
        $this->right = (string) ($attributes['right'] ?? 'auto');
        $this->bottom = (string) ($attributes['bottom'] ?? 'auto');
        $this->left = (string) ($attributes['left'] ?? 'auto');
        $this->marginTop = (string) ($attributes['marginTop'] ?? '0%');
        $this->marginRight = (string) ($attributes['marginRight'] ?? '0%');
        $this->marginBottom = (string) ($attributes['marginBottom'] ?? '0%');
        $this->marginLeft = (string) ($attributes['marginLeft'] ?? '0%');
        $this->paddingTop = (string) ($attributes['paddingTop'] ?? '0%');
        $this->paddingRight = (string) ($attributes['paddingRight'] ?? '0%');
        $this->paddingBottom = (string) ($attributes['paddingBottom'] ?? '0%');
        $this->paddingLeft = (string) ($attributes['paddingLeft'] ?? '0%');
        $this->caption = (string) ($attributes['caption'] ?? '');
        $this->title = (string) ($attributes['title'] ?? '');
        $this->description = (string) ($attributes['description'] ?? '');
    }
}

final class Photo_Collage_Renderer
{
    /**
     * Normalize attributes with defaults
     *
     * @param array $attributes Block attributes.
     * @return Photo_Collage_Block_Attributes Normalized attributes object.
     */
    public static function normalize_attributes(array $attributes): Photo_Collage_Block_Attributes
    {
        return new Photo_Collage_Block_Attributes($attributes);
    }

    /**
     * Build style array for the container
     *
     * @param Photo_Collage_Block_Attributes $attributes Normalized attributes.
     * @return array<string, string|int|float> Style key-value pairs.
     */
    public static function get_container_styles(Photo_Collage_Block_Attributes $attributes): array
    {
        $styles = [
            'width' => $attributes->width,
            'height' => $attributes->height,
            'z-index' => $attributes->zIndex,
            'padding-top' => $attributes->paddingTop,
            'padding-right' => $attributes->paddingRight,
            'padding-bottom' => $attributes->paddingBottom,
            'padding-left' => $attributes->paddingLeft,
        ];

        if ($attributes->useAbsolutePosition) {
            $styles += [
                'position' => 'absolute',
                'top' => $attributes->top,
                'right' => $attributes->right,
                'bottom' => $attributes->bottom,
                'left' => $attributes->left,
            ];
        } else {
            $styles += [
                'position' => 'relative',
                'margin-top' => $attributes->marginTop,
                'margin-right' => $attributes->marginRight,
                'margin-bottom' => $attributes->marginBottom,
                'margin-left' => $attributes->marginLeft,
            ];
        }

        if ($attributes->rotation !== 0) {
            $styles['transform'] = "rotate({$attributes->rotation}deg)";
        }

        if ($attributes->opacity !== 1.0) {
            $styles['opacity'] = $attributes->opacity;
        }

        return $styles;
    }

    /**
     * Build style string from array
     *
     * @param array<string, string|int|float> $styles Style array.
     * @return string CSS style string.
     */
    public static function build_style_string(array $styles): string
    {
        $style_string = '';
        foreach ($styles as $key => $value) {
            if ($value !== '' && $value !== null) {
                $style_string .= "$key: $value; ";
            }
        }
        return trim($style_string);
    }

    /**
     * Generate inner HTML using WP_HTML_Tag_Processor
     *
     * @param Photo_Collage_Block_Attributes $attributes Normalized attributes.
     * @return string HTML content.
     */
    public static function render_inner_html(Photo_Collage_Block_Attributes $attributes): string
    {
        if (empty($attributes->url)) {
            return '';
        }

        $img_style = "object-fit: contain; width: 100%; height: 100%;";

        $has_caption = !empty($attributes->caption);
        $is_decorative = $attributes->isDecorative;
        $alt_attr = $is_decorative ? '' : $attributes->alt;

        $has_description = !empty($attributes->description) && !$is_decorative;
        $description_id = $has_description ? 'photo-collage-desc-' . uniqid() : '';

        // Generate IMG tag using HTML API
        $tags = new WP_HTML_Tag_Processor('<img />');
        $tags->next_tag();
        $tags->set_attribute('src', $attributes->url);
        $tags->set_attribute('alt', $alt_attr);
        $tags->set_attribute('loading', 'lazy');
        $tags->set_attribute('style', $img_style);

        if (!empty($attributes->title)) {
            $tags->set_attribute('title', $attributes->title);
        }

        if ($has_description) {
            $tags->set_attribute('aria-describedby', $description_id);
        }

        $img_html = $tags->get_updated_html();

        $html = match(true) {
            $has_caption => sprintf(
                '<figure class="photo-collage-image-figure">%s<figcaption class="photo-collage-image-caption wp-element-caption">%s</figcaption></figure>',
                $img_html,
                wp_kses_post($attributes->caption)
            ),
            default => $img_html,
        };

        if ($has_description) {
            $html .= sprintf(
                '<div id="%s" class="screen-reader-text">%s</div>',
                esc_attr($description_id),
                wp_kses_post($attributes->description)
            );
        }

        return $html;
    }
}
