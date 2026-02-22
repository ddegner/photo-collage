<?php
/**
 * Server-side rendering for the Frame block
 *
 * @package PhotoCollage
 */

// phpcs:ignoreFile WordPress.NamingConventions.PrefixAllGlobals

if (!defined('ABSPATH')) {
    exit;
}

$attributes = $attributes ?? [];
$content = $content ?? '';

// Backward compatibility: older saves included a wrapper div in save.js.
// Since this block is dynamic and render.php already outputs a wrapper,
// strip that legacy wrapper to avoid nested 50% widths on the frontend.
if (
	is_string( $content ) &&
	preg_match(
		'/^\s*<div\b[^>]*class=(["\'])[^"\']*\bwp-block-photo-collage-frame\b[^"\']*\1[^>]*>(.*)<\/div>\s*$/is',
		$content,
		$matches
	)
) {
	$content = (string) $matches[2];
}

// Use shared renderer logic for styles
$normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attributes);
$styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
$bg_styles = Photo_Collage_Renderer::get_background_styles($normalized_attrs);

// Merge styles
$styles = array_merge($styles, $bg_styles);

$style_string = Photo_Collage_Renderer::build_style_string($styles);

$wrapper_attributes = get_block_wrapper_attributes(
    array(
        'style' => $style_string,
    )
);

echo sprintf(
    '<div %s>%s</div>',
    $wrapper_attributes,
    $content
);
