<?php
/**
 * Server-side rendering for the Image block
 *
 * @package PhotoCollage
 */

// phpcs:ignoreFile WordPress.NamingConventions.PrefixAllGlobals

if (!defined('ABSPATH')) {
    exit;
}

$attributes = $attributes ?? [];

// Return early if no URL is set.
if (empty($attributes['url'])) {
    return;
}

// Use shared renderer
// normalize_attributes returns Photo_Collage_Block_Attributes object
$normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attributes);
$styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
$bg_styles = Photo_Collage_Renderer::get_background_styles($normalized_attrs);

// Merge styles
$styles = array_merge($styles, $bg_styles);

$style_string = Photo_Collage_Renderer::build_style_string($styles);

// Render skip-serialized support values (padding, border, native color).
// Core's get_block_wrapper_attributes() skips these when block.json sets
// __experimentalSkipSerialization, so they must be emitted here.
$support_style_definitions = array_filter(
    [
        'spacing' => array_filter(['padding' => $attributes['style']['spacing']['padding'] ?? null]),
        'border'  => $attributes['style']['border'] ?? null,
        'color'   => array_filter(
            [
                'background' => $attributes['style']['color']['background'] ?? null,
                'gradient'   => $attributes['style']['color']['gradient'] ?? null,
            ]
        ),
    ]
);
$support_styles = !empty($support_style_definitions)
    ? wp_style_engine_get_styles($support_style_definitions)
    : [];

$support_classes = [];
if (!empty($support_styles['classnames'])) {
    $support_classes[] = $support_styles['classnames'];
}

// Preset color/gradient slugs share attribute names with the legacy custom
// background system; backgroundType claims them for the legacy path.
$background_type = $attributes['backgroundType'] ?? 'none';
if (!empty($attributes['backgroundColor']) && 'color' !== $background_type) {
    $support_classes[] = 'has-background';
    $support_classes[] = 'has-' . _wp_to_kebab_case((string) $attributes['backgroundColor']) . '-background-color';
}
if (!empty($attributes['gradient']) && 'gradient' !== $background_type) {
    $support_classes[] = 'has-background';
    $support_classes[] = 'has-' . _wp_to_kebab_case((string) $attributes['gradient']) . '-gradient-background';
}

if (!empty($support_styles['css'])) {
    $style_string .= ' ' . $support_styles['css'];
}

// Get custom div class and style
$div_class = !empty($attributes['divClass']) ? $attributes['divClass'] : '';
$div_style = !empty($attributes['divStyle']) ? $attributes['divStyle'] : '';

// Merge custom div style with computed styles
if (!empty($div_style)) {
    $style_string = $style_string . ' ' . $div_style;
}

$wrapper_attributes = get_block_wrapper_attributes(
    [
        'style' => trim($style_string),
        'class' => trim(implode(' ', array_filter(array_merge($support_classes, [$div_class])))),
    ]
);

// Extract typography classes and styles for caption
// This is required because WordPress applies typography classes to the wrapper,
// but we need them directly on the figcaption element for proper styling.
$typography_classes = [];
$typography_styles = [];

// Handle preset font size (e.g., "small", "medium", "large", "xx-large")
if (!empty($attributes['fontSize'])) {
    $typography_classes[] = 'has-' . $attributes['fontSize'] . '-font-size';
}

// Handle preset font family
if (!empty($attributes['fontFamily'])) {
    $typography_classes[] = 'has-' . $attributes['fontFamily'] . '-font-family';
}

// Handle inline typography styles from style.typography
if (!empty($attributes['style']['typography'])) {
    $typo = $attributes['style']['typography'];
    if (!empty($typo['fontSize'])) {
        $typography_styles['font-size'] = $typo['fontSize'];
    }
    if (!empty($typo['fontWeight'])) {
        $typography_styles['font-weight'] = $typo['fontWeight'];
    }
    if (!empty($typo['fontStyle'])) {
        $typography_styles['font-style'] = $typo['fontStyle'];
    }
    if (!empty($typo['lineHeight'])) {
        $typography_styles['line-height'] = $typo['lineHeight'];
    }
    if (!empty($typo['fontFamily'])) {
        $typography_styles['font-family'] = $typo['fontFamily'];
    }
    if (!empty($typo['textDecoration'])) {
        $typography_styles['text-decoration'] = $typo['textDecoration'];
    }
    if (!empty($typo['textTransform'])) {
        $typography_styles['text-transform'] = $typo['textTransform'];
    }
    if (!empty($typo['letterSpacing'])) {
        $typography_styles['letter-spacing'] = $typo['letterSpacing'];
    }
}

// Render inner content with typography applied to caption
$inner_html = Photo_Collage_Renderer::render_inner_html(
    $normalized_attrs,
    implode(' ', $typography_classes),
    Photo_Collage_Renderer::build_style_string($typography_styles)
);

echo sprintf(
    '<div %s>%s</div>',
    $wrapper_attributes,
    $inner_html
);