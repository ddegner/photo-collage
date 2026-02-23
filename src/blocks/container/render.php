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
$sanitize_auto_height_hint = static function ($value) {
    if (!is_scalar($value)) {
        return '';
    }

    $hint = strtolower(trim((string) $value));
    return 1 === preg_match('/^\d+(?:\.\d+)?(?:px|%)$/', $hint) ? $hint : '';
};
$auto_height_hint = $sanitize_auto_height_hint($attributes['autoHeightHint'] ?? '');
$height_mode = $attributes['heightMode'] ?? 'fixed';
$has_saved_auto_height_hint = ('auto' === $height_mode && '' !== $auto_height_hint);
$should_hide_until_lock = ('auto' === $height_mode);

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
if ($has_saved_auto_height_hint) {
    $style .= "height: " . esc_attr($auto_height_hint) . "; ";
}
$style .= "min-height: 200px; ";
if ($should_hide_until_lock) {
    $style .= "visibility: hidden; ";
}

// Append background styles
$style .= $bg_style_string;

$wrapper_args = [
    'class' => $classes,
    'style' => $style,
    'data-height-mode' => $height_mode,
];

if ($has_saved_auto_height_hint) {
    $wrapper_args['data-auto-height-hint'] = $auto_height_hint;
}
if ($should_hide_until_lock) {
    $wrapper_args['data-auto-height-initial-hidden'] = '1';
}

$wrapper_attributes = get_block_wrapper_attributes($wrapper_args);

echo sprintf(
    '<div %s>%s</div>',
    $wrapper_attributes,
    $content
);
