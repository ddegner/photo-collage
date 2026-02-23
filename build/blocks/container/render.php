<?php
/**
 * Server-side rendering for the Container block
 *
 * @package PhotoCollage
 */

// phpcs:ignoreFile WordPress.NamingConventions.PrefixAllGlobals

if (!defined('ABSPATH')) {
    exit;
}

$attributes = $attributes ?? [];
$content = $content ?? '';
$min_auto_height = 200;

$stack_on_mobile = $attributes['stackOnMobile'] ?? true;
$height = $attributes['containerHeight'] ?? '';
$height_mode = $attributes['heightMode'] ?? 'fixed';

if (!in_array($height_mode, array('fixed', 'auto'), true)) {
    $height_mode = 'fixed';
}

// Normalize attributes and get background styles
$normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attributes);
$bg_styles = Photo_Collage_Renderer::get_background_styles($normalized_attrs);
$bg_style_string = Photo_Collage_Renderer::build_style_string($bg_styles);

$classes = 'wp-block-photo-collage-container';
if ($stack_on_mobile) {
    $classes .= ' is-stack-on-mobile';
}
if ('auto' === $height_mode) {
    $classes .= ' is-height-auto';
}

$style = '';
if ('fixed' === $height_mode && !empty($height)) {
    $style .= "height: " . esc_attr($height) . "; ";
}
$style .= "min-height: {$min_auto_height}px; ";

if ('auto' === $height_mode) {
    $style .= 'visibility: hidden; ';
}

// Append background styles
$style .= $bg_style_string;

$wrapper_attribute_args = [
    'class' => $classes,
    'style' => $style,
    'data-height-mode' => $height_mode,
];

if ('auto' === $height_mode) {
    $parse_unit_value = static function ($value, string $unit): ?float {
        if (!is_string($value) || '' === trim($value)) {
            return null;
        }

        $pattern = '/^\s*(-?\d+(?:\.\d+)?)\s*' . preg_quote($unit, '/') . '\s*$/i';
        if (1 !== preg_match($pattern, $value, $matches)) {
            return null;
        }

        $numeric = (float) $matches[1];
        return is_finite($numeric) ? $numeric : null;
    };

    $parse_image_aspect_ratio = static function ($value): ?float {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ('' === $trimmed || 'auto' === strtolower($trimmed)) {
            return null;
        }

        if (str_contains($trimmed, '/')) {
            [$width, $height] = array_map('trim', explode('/', $trimmed, 2));
            $width_value = is_numeric($width) ? (float) $width : 0.0;
            $height_value = is_numeric($height) ? (float) $height : 0.0;
            if ($width_value > 0 && $height_value > 0) {
                return $height_value / $width_value;
            }
            return null;
        }

        if (!is_numeric($trimmed)) {
            return null;
        }

        $ratio = (float) $trimmed;
        return $ratio > 0 ? 1 / $ratio : null;
    };

    $attachment_ratio_cache = [];
    $normalize_constraint_value = static function (float $value, int $precision): string {
        return number_format($value, $precision, '.', '');
    };
    $get_image_aspect_ratio = static function (array $item_attrs) use (
        $parse_image_aspect_ratio,
        &$attachment_ratio_cache
    ): ?float {
        $aspect_ratio = $parse_image_aspect_ratio($item_attrs['aspectRatio'] ?? '');
        if (null !== $aspect_ratio && $aspect_ratio > 0) {
            return $aspect_ratio;
        }

        $attachment_id = isset($item_attrs['id']) ? (int) $item_attrs['id'] : 0;
        if ($attachment_id <= 0) {
            return null;
        }

        if (array_key_exists($attachment_id, $attachment_ratio_cache)) {
            return $attachment_ratio_cache[$attachment_id];
        }

        $ratio = null;
        $metadata = wp_get_attachment_metadata($attachment_id);
        if (is_array($metadata)) {
            $width_value = isset($metadata['width']) ? (float) $metadata['width'] : 0.0;
            $height_value = isset($metadata['height']) ? (float) $metadata['height'] : 0.0;
            if ($width_value > 0 && $height_value > 0) {
                $ratio = $height_value / $width_value;
            }
        }

        $attachment_ratio_cache[$attachment_id] = $ratio;
        return $ratio;
    };

    $geometry_constraints = [];
    $inner_blocks = [];

    if (
        isset($block) &&
        is_object($block) &&
        isset($block->parsed_block['innerBlocks']) &&
        is_array($block->parsed_block['innerBlocks'])
    ) {
        $inner_blocks = $block->parsed_block['innerBlocks'];
    }

    foreach ($inner_blocks as $inner_block) {
        if (!is_array($inner_block)) {
            continue;
        }

        $block_name = $inner_block['blockName'] ?? '';
        if (!in_array($block_name, ['photo-collage/image', 'photo-collage/frame'], true)) {
            continue;
        }

        $item_attrs = isset($inner_block['attrs']) && is_array($inner_block['attrs'])
            ? $inner_block['attrs']
            : [];
        if (empty($item_attrs['useAbsolutePosition'])) {
            continue;
        }

        $item_width = isset($item_attrs['width']) ? (string) $item_attrs['width'] : '50%';
        $width_percent = $parse_unit_value($item_width, '%');
        $width_pixels = $parse_unit_value($item_width, 'px');

        $item_height = isset($item_attrs['height']) ? (string) $item_attrs['height'] : 'auto';
        $explicit_height_pixels = $parse_unit_value($item_height, 'px');

        $base_a = 0.0;
        $base_b = 0.0;
        $has_base = false;

        if (null !== $explicit_height_pixels && $explicit_height_pixels > 0) {
            $base_b = $explicit_height_pixels;
            $has_base = true;
        } else {
            $aspect_ratio = null;
            if ('photo-collage/image' === $block_name) {
                $aspect_ratio = $get_image_aspect_ratio($item_attrs);
            }

            if (null !== $aspect_ratio && $aspect_ratio > 0) {
                if (null !== $width_percent) {
                    $base_a = $aspect_ratio * ($width_percent / 100);
                    $has_base = true;
                } elseif (null !== $width_pixels) {
                    $base_b = $aspect_ratio * $width_pixels;
                    $has_base = true;
                }
            }
        }

        if (!$has_base) {
            continue;
        }

        $top_value = isset($item_attrs['top']) ? (string) $item_attrs['top'] : 'auto';
        $bottom_value = isset($item_attrs['bottom']) ? (string) $item_attrs['bottom'] : 'auto';

        $offset_candidates = [];
        $top_percent = $parse_unit_value($top_value, '%');
        $top_pixels = $parse_unit_value($top_value, 'px');
        $bottom_percent = $parse_unit_value($bottom_value, '%');
        $bottom_pixels = $parse_unit_value($bottom_value, 'px');

        if (null !== $top_percent || null !== $top_pixels) {
            $offset_candidates[] = [$top_percent, $top_pixels];
        }
        if (null !== $bottom_percent || null !== $bottom_pixels) {
            $offset_candidates[] = [$bottom_percent, $bottom_pixels];
        }

        if (empty($offset_candidates)) {
            $offset_candidates[] = [0.0, 0.0];
        }

        foreach ($offset_candidates as $candidate) {
            $constraint_a = $base_a;
            $constraint_b = $base_b;

            $percent_offset = $candidate[0];
            if (null !== $percent_offset) {
                if ($percent_offset >= 99.5) {
                    continue;
                }

                $factor = 1 / (1 - ($percent_offset / 100));
                $constraint_a *= $factor;
                $constraint_b *= $factor;
            }

            $pixel_offset = $candidate[1];
            if (null !== $pixel_offset) {
                $constraint_b += $pixel_offset;
            }

            if (
                !is_finite($constraint_a) ||
                !is_finite($constraint_b) ||
                ($constraint_a <= 0 && $constraint_b <= 0)
            ) {
                continue;
            }

            $geometry_constraints[] = [
                $normalize_constraint_value($constraint_a, 6),
                $normalize_constraint_value($constraint_b, 3),
            ];
        }
    }

    if (!empty($geometry_constraints)) {
        $geometry_payload = wp_json_encode(
            [
                'minHeight' => $min_auto_height,
                'constraints' => array_values($geometry_constraints),
            ]
        );
        if (is_string($geometry_payload) && '' !== $geometry_payload) {
            $wrapper_attribute_args['data-pc-geometry'] = $geometry_payload;
        }
    }

    $wrapper_attribute_args['data-pc-auto-state'] = 'pending';
}

$wrapper_attributes = get_block_wrapper_attributes($wrapper_attribute_args);

echo sprintf(
    '<div %s>%s</div>',
    $wrapper_attributes,
    $content
);
