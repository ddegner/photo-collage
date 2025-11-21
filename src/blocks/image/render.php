<?php
/**
 * Server-side rendering for the Image block
 *
 * @package PhotoCollage
 */

$attributes = isset($attributes) ? $attributes : array();

// Return early if no URL is set.
if (empty($attributes['url'])) {
    return;
}

// Use shared renderer
$normalized_attrs = Photo_Collage_Renderer::normalize_attributes($attributes);
$styles = Photo_Collage_Renderer::get_container_styles($normalized_attrs);
$style_string = Photo_Collage_Renderer::build_style_string($styles);

$wrapper_attributes = get_block_wrapper_attributes(
    array(
        'style' => $style_string,
    )
);

// Render inner content
$inner_html = Photo_Collage_Renderer::render_inner_html($normalized_attrs);

?>
<div <?php echo $wrapper_attributes; ?>>
    <?php echo $inner_html; ?>
</div>
