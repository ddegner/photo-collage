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

// Backward compatibility: some stored content includes the dynamic block's
// wrapper. Strip it before emitting the canonical server-rendered wrapper.
if (
	is_string( $content ) &&
	preg_match(
		'/^\s*<div\b[^>]*class=(["\'])[^"\']*\bwp-block-photo-collage-container\b[^"\']*\1[^>]*>(.*)<\/div>\s*$/is',
		$content,
		$matches
	)
) {
	$content = (string) $matches[2];
}

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
    $inner_blocks = [];

    if (
        isset($block) &&
        is_object($block) &&
        isset($block->parsed_block['innerBlocks']) &&
        is_array($block->parsed_block['innerBlocks'])
    ) {
        $inner_blocks = $block->parsed_block['innerBlocks'];
    }

    $geometry_constraints = array_map(
        static function (array $constraint): array {
            return [
                number_format($constraint[0], 6, '.', ''),
                number_format($constraint[1], 3, '.', ''),
            ];
        },
        Photo_Collage_Renderer::get_auto_height_constraints($inner_blocks)
    );

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
