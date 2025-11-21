<?php
/**
 * Server-side rendering for the Container block
 *
 * @package PhotoCollage
 */

// phpcs:ignoreFile WordPress.NamingConventions.PrefixAllGlobals

$attributes = isset($attributes) ? $attributes : array();
$content = isset($content) ? $content : '';

$stack_on_mobile = isset($attributes['stackOnMobile']) ? $attributes['stackOnMobile'] : true;
$height = isset($attributes['containerHeight']) ? $attributes['containerHeight'] : '500px';

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
    array(
        'class' => $classes,
        'style' => $style,
    )
);
?>
<div <?php echo wp_kses_data($wrapper_attributes); ?>>
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>