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
        'class' => $div_class,
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