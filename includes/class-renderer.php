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
    public int $id;
    public string $href;
    public string $linkTarget;
    public string $rel;
    public string $linkClass;
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
    public string $align;
    public bool $showCaption;
    public array $lightbox;

    public function __construct(array $attributes)
    {
        $this->url = (string) ($attributes['url'] ?? '');
        $this->id = (int) ($attributes['id'] ?? 0);
        $this->href = (string) ($attributes['href'] ?? '');
        $this->linkTarget = (string) ($attributes['linkTarget'] ?? '');
        $this->rel = (string) ($attributes['rel'] ?? '');
        $this->linkClass = (string) ($attributes['linkClass'] ?? '');
        $this->alt = (string) ($attributes['alt'] ?? '');
        $this->align = (string) ($attributes['align'] ?? '');
        $this->showCaption = (bool) ($attributes['showCaption'] ?? true);
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
        $this->lightbox = (array) ($attributes['lightbox'] ?? []);
    }

    /**
     * Create a modified copy of the immutable object
     * Uses PHP 8.3's ability to modify readonly properties in __clone
     *
     * @param array $changes Array of properties to change
     * @return self
     */
    public function with(array $changes): self
    {
        $vars = get_object_vars($this);
        $new_vars = array_merge($vars, $changes);
        return new self($new_vars);
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

        // If aligned, and width is default, remove inline width to let alignment classes handle it.
        if (!empty($attributes->align) && $attributes->width === '50%') {
            unset($styles['width']);
        }

        if ($attributes->useAbsolutePosition) {
            $styles += [
                'position' => 'absolute',
                'top' => $attributes->top,
                'right' => $attributes->right,
                'bottom' => $attributes->bottom,
                'left' => $attributes->left,
            ];
        } else {
            // Only apply default margins if NOT aligned or if user explicitly set custom margins.
            // This allows standard alignment classes (aligncenter, alignleft, etc.) to work.
            $has_custom_margins = (
                $attributes->marginTop !== '0%' ||
                $attributes->marginRight !== '0%' ||
                $attributes->marginBottom !== '0%' ||
                $attributes->marginLeft !== '0%'
            );

            if (empty($attributes->align) || $has_custom_margins) {
                $styles += [
                    'position' => 'relative',
                    'margin-top' => $attributes->marginTop,
                    'margin-right' => $attributes->marginRight,
                    'margin-bottom' => $attributes->marginBottom,
                    'margin-left' => $attributes->marginLeft,
                ];
            } else {
                $styles += ['position' => 'relative'];
            }
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

        $has_caption = !empty($attributes->caption) && $attributes->showCaption;
        $is_decorative = $attributes->isDecorative;
        $alt_attr = $is_decorative ? '' : $attributes->alt;

        $has_description = !empty($attributes->description) && !$is_decorative;
        $description_id = $has_description ? 'photo-collage-desc-' . uniqid() : '';

        // Generate IMG tag
        if ($attributes->id > 0) {
            // Use native WordPress function for responsive images
            $img_attributes = [
                'style' => $img_style,
                'class' => '', // Prevent default classes if needed, or let WP add them
            ];

            if ($is_decorative) {
                $img_attributes['alt'] = '';
                $img_attributes['role'] = 'presentation';
            } else {
                $img_attributes['alt'] = $attributes->alt;
            }

            if (!empty($attributes->title)) {
                $img_attributes['title'] = $attributes->title;
            }

            if ($has_description) {
                $img_attributes['aria-describedby'] = $description_id;
            }

        // Add Lightbox directives if enabled
        if (!empty($attributes->lightbox['enabled']) && empty($attributes->href)) {
            $img_attributes['data-wp-interactive'] = 'core/image';
            $img_attributes['data-wp-on--click'] = 'actions.showLightbox';
            $img_attributes['data-wp-context'] = wp_json_encode(['lightbox' => ['enabled' => true]]);
            $img_attributes['style'] .= ' cursor: zoom-in;';
        } else {
             // If lightbox is NOT enabled, or if there is a custom HREF, ensure we don't output lightbox attrs.
             // However, if fallback image is used, it generates its own tag below.
             // If wp_get_attachment_image is used, it might add some attributes if filtered, but we are manually building $img_attributes.
        }

            $img_html = wp_get_attachment_image($attributes->id, 'full', false, $img_attributes);

            // Fallback if image ID is invalid or deleted
            if (empty($img_html)) {
                $img_html = self::generate_fallback_img($attributes, $img_style, $alt_attr, $description_id, $has_description);
            }
        } else {
            $img_html = self::generate_fallback_img($attributes, $img_style, $alt_attr, $description_id, $has_description);
        }

        // Wrap in link if href is present
        if (!empty($attributes->href)) {
            $link_attributes = [
                'href' => $attributes->href,
                'class' => $attributes->linkClass,
                'target' => $attributes->linkTarget,
                'rel' => $attributes->rel,
            ];

            // Remove empty attributes
            $link_attributes = array_filter($link_attributes);

            // Build link HTML
            $link_tags = new WP_HTML_Tag_Processor('<a></a>');
            $link_tags->next_tag();
            foreach ($link_attributes as $attr => $value) {
                $link_tags->set_attribute($attr, $value);
            }
            // Insert image HTML inside link
            // Note: WP_HTML_Tag_Processor doesn't support innerHTML injection easily for wrapping.
            // So we'll use sprintf.
            $link_open = $link_tags->get_updated_html();
            $link_open = str_replace('</a>', '', $link_open); // Get just the opening tag

            $img_html = $link_open . $img_html . '</a>';
        }

        $html = match (true) {
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

    /**
     * Generate fallback IMG tag using HTML API
     * 
     * @param Photo_Collage_Block_Attributes $attributes
     * @param string $img_style
     * @param string $alt_attr
     * @param string $description_id
     * @param bool $has_description
     * @return string
     */
    private static function generate_fallback_img(
        Photo_Collage_Block_Attributes $attributes,
        string $img_style,
        string $alt_attr,
        string $description_id,
        bool $has_description
    ): string {
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

         // Add Lightbox directives if enabled for fallback images too
         if (!empty($attributes->lightbox['enabled']) && empty($attributes->href)) {
            $tags->set_attribute('data-wp-interactive', 'core/image');
            $tags->set_attribute('data-wp-on--click', 'actions.showLightbox');
            $tags->set_attribute('data-wp-context', wp_json_encode(['lightbox' => ['enabled' => true]]));
            $current_style = $tags->get_attribute('style');
            $tags->set_attribute('style', $current_style . ' cursor: zoom-in;');
        }

        return $tags->get_updated_html();
    }
}
