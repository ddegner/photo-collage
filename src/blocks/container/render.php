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
$height = $attributes['containerHeight'] ?? '500px';

$classes = 'wp-block-photo-collage-container';
if ($stack_on_mobile) {
    $classes .= ' is-stack-on-mobile';
}

$style = '';
if (!empty($height)) {
    $style .= "height: " . esc_attr($height) . "; ";
}
$style .= "min-height: 200px;";

$wrapper_attributes = get_block_wrapper_attributes(
    [
        'class' => $classes,
        'style' => $style,
    ]
);

echo wp_kses(
    sprintf(
        '<div %s>%s</div>',
        $wrapper_attributes,
        $content
    ),
    Photo_Collage_Renderer::get_allowed_html()
);