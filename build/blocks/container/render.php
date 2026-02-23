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

$stack_on_mobile = $attributes['stackOnMobile'] ?? true;
$height = $attributes['containerHeight'] ?? '';
$auto_height_ratio = isset($attributes['autoHeightRatio']) ? (float) $attributes['autoHeightRatio'] : 0.0;
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
if ('auto' === $height_mode && is_finite($auto_height_ratio) && $auto_height_ratio > 0) {
    $style .= "aspect-ratio: " . esc_attr((string) $auto_height_ratio) . "; ";
}
$style .= "min-height: 200px; ";

// Append background styles
$style .= $bg_style_string;

$wrapper_attributes = get_block_wrapper_attributes(
    [
        'class' => $classes,
        'style' => $style,
        'data-height-mode' => $height_mode,
    ]
);

echo sprintf(
    '<div %s>%s</div>',
    $wrapper_attributes,
    $content
);
