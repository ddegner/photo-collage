<?php
/**
 * Server-side rendering for the Image block
 *
 * @package PhotoCollage
 */

// phpcs:ignoreFile WordPress.NamingConventions.PrefixAllGlobals

$attributes = $attributes ?? [];

// Return early if no URL is set.
if (empty($attributes['url'])) {
    return;
}

// Use shared renderer
// normalize_attributes returns Photo_Collage_Block_Attributes object
$normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attributes);
$styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
$style_string = Photo_Collage_Renderer::build_style_string($styles);

$wrapper_attributes = get_block_wrapper_attributes(
    [
        'style' => $style_string,
    ]
);

// Render inner content
$inner_html = Photo_Collage_Renderer::render_inner_html($normalized_attrs);

?>
<div <?php echo wp_kses_data($wrapper_attributes); ?>>
    <?php echo $inner_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>