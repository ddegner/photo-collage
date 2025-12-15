<?php
/**
 * Shared Renderer Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Renderer class
 */
final class Photo_Collage_Renderer
{





	/**
	 * Normalize attributes with defaults
	 *
	 * @param array $attributes Block attributes.
	 * @return Photo_Collage_Block_Attributes Normalized attributes object.
	 */
	public static function normalize_attributes(array $attributes): Photo_Collage_Block_Attributes
	{
		return Photo_Collage_Block_Attributes::from_array($attributes);
	}

	/**
	 * Build style array for the container
	 *
	 * @param Photo_Collage_Block_Attributes $attributes Normalized attributes.
	 * @return array<string, string|int|float> Style key-value pairs.
	 */
	public static function get_container_styles(Photo_Collage_Block_Attributes $attributes): array
	{
		$styles = array(
			'width' => $attributes->width,
			'height' => $attributes->height,
			'z-index' => $attributes->z_index,
		);

		// Legacy padding support for backwards compatibility
		// WordPress native spacing (style.spacing.padding) is handled by get_block_wrapper_attributes()
		if (!empty($attributes->padding_top) && '0%' !== $attributes->padding_top) {
			$styles['padding-top'] = $attributes->padding_top;
		}
		if (!empty($attributes->padding_right) && '0%' !== $attributes->padding_right) {
			$styles['padding-right'] = $attributes->padding_right;
		}
		if (!empty($attributes->padding_bottom) && '0%' !== $attributes->padding_bottom) {
			$styles['padding-bottom'] = $attributes->padding_bottom;
		}
		if (!empty($attributes->padding_left) && '0%' !== $attributes->padding_left) {
			$styles['padding-left'] = $attributes->padding_left;
		}

		// If aligned, and width is default, remove inline width to let alignment classes handle it.
		if (!empty($attributes->align) && '50%' === $attributes->width) {
			unset($styles['width']);
		}

		if ($attributes->use_absolute_position) {
			$styles += array(
				'position' => 'absolute',
				'top' => $attributes->top,
				'right' => $attributes->right,
				'bottom' => $attributes->bottom,
				'left' => $attributes->left,
			);
		} else {
			// Only apply default margins if NOT aligned or if user explicitly set custom margins.
			// This allows standard alignment classes (aligncenter, alignleft, etc.) to work.
			$has_custom_margins = (
				'0%' !== $attributes->margin_top ||
				'0%' !== $attributes->margin_right ||
				'0%' !== $attributes->margin_bottom ||
				'0%' !== $attributes->margin_left
			);

			if (empty($attributes->align) || $has_custom_margins) {
				$styles += array(
					'position' => 'relative',
					'margin-top' => $attributes->margin_top,
					'margin-right' => $attributes->margin_right,
					'margin-bottom' => $attributes->margin_bottom,
					'margin-left' => $attributes->margin_left,
				);
			} else {
				$styles += array('position' => 'relative');
			}
		}

		if (0 !== $attributes->rotation) {
			$styles['transform'] = "rotate({$attributes->rotation}deg)";
		}

		if (1.0 !== $attributes->opacity) {
			$styles['opacity'] = $attributes->opacity;
		}

		return $styles;
	}

	/**
	 * Build background style array
	 *
	 * @param Photo_Collage_Block_Attributes $attributes Normalized attributes.
	 * @return array<string, string> Background style key-value pairs.
	 */
	public static function get_background_styles(Photo_Collage_Block_Attributes $attributes): array
	{
		$styles = array();

		switch ($attributes->background_type) {
			case 'color':
				if (!empty($attributes->background_color)) {
					$styles['background-color'] = $attributes->background_color;
				}
				break;

			case 'gradient':
				if (!empty($attributes->gradient)) {
					$styles['background-image'] = $attributes->gradient;
				}
				break;

			case 'tiling-image':
			case 'full-image':
				if (!empty($attributes->background_image_url)) {
					$styles['background-image'] = 'url(' . esc_url($attributes->background_image_url) . ')';
					
					if ('full-image' === $attributes->background_type) {
						$styles['background-size'] = $attributes->background_size;
						$styles['background-position'] = $attributes->background_position;
					}

					if ('tiling-image' === $attributes->background_type || $attributes->background_repeat) {
						$styles['background-repeat'] = 'repeat';
					} else {
						$styles['background-repeat'] = 'no-repeat';
					}
				}
				break;
		}

		return $styles;
	}

	/**
	 * Build style string from array
	 *
	 * @param array<string, string|int|float> $styles Style array.
	 * @return string CSS style string.
	 */
	public static function build_style_string(array $styles): string
	{
		$style_string = '';
		foreach ($styles as $key => $value) {
			if ('' !== $value && null !== $value) {
				$style_string .= "$key: $value; ";
			}
		}
		return trim($style_string);
	}

	/**
	 * Generate inner HTML using WP_HTML_Tag_Processor
	 *
	 * @param Photo_Collage_Block_Attributes $attributes Normalized attributes.
	 * @return string HTML content.
	 */
	public static function render_inner_html(Photo_Collage_Block_Attributes $attributes): string
	{
		if (empty($attributes->url)) {
			return '';
		}

		$has_caption = !empty($attributes->caption) && $attributes->show_caption;
		$is_decorative = $attributes->is_decorative;
		$alt_attr = $is_decorative ? '' : $attributes->alt;

		$img_style = 'object-fit: contain;';

		if ($has_caption) {
			$placement = $attributes->caption_placement;
			$is_side_caption = str_starts_with($placement, 'left-') || str_starts_with($placement, 'right-');

			if ($is_side_caption) {
				// Horizontal layout
				// If container height is auto (default), let image determine height via width/aspect ratio.
				// If container height is fixed, fit image to height and let width adjust.
				$height = isset($attributes->height) ? $attributes->height : 'auto';
				if ('auto' === $height) {
					$img_style .= ' width: 100%; height: auto;';
				} else {
					$img_style .= ' width: auto; height: 100%;';
				}
			} else {
				// Vertical layout: Image fills width, height auto-adjusts.
				$img_style .= ' width: 100%; height: auto;';
			}
			$img_style .= ' flex: 1; min-width: 0; min-height: 0;';
		} else {
			$img_style .= ' width: 100%; height: 100%;';
		}

		// Append custom image styles
		if (!empty($attributes->img_style)) {
			$img_style .= ' ' . $attributes->img_style;
		}

		$has_description = !empty($attributes->description) && !$is_decorative;
		$description_id = $has_description ? 'photo-collage-desc-' . uniqid() : '';

		// Generate IMG tag.
		if ($attributes->id > 0) {
			// Use native WordPress function for responsive images.
			$img_attributes = array(
				'style' => $img_style,
				'class' => $attributes->img_class, // Add custom class
			);

			if ($is_decorative) {
				$img_attributes['alt'] = '';
				$img_attributes['role'] = 'presentation';
			} else {
				$img_attributes['alt'] = $attributes->alt;
			}

			if (!empty($attributes->title)) {
				$img_attributes['title'] = $attributes->title;
			}

			if ($has_description) {
				$img_attributes['aria-describedby'] = $description_id;
			}

			// Add Lightbox directives if enabled.
			if (!empty($attributes->lightbox['enabled']) && empty($attributes->href)) {
				$img_attributes['data-wp-interactive'] = 'core/image';
				$img_attributes['data-wp-on--click'] = 'actions.showLightbox';
				$img_attributes['data-wp-context'] = wp_json_encode(array('lightbox' => array('enabled' => true)));
				$img_attributes['style'] .= ' cursor: zoom-in;';
			}

			$img_html = wp_get_attachment_image($attributes->id, 'full', false, $img_attributes);

			// Fallback if image ID is invalid or deleted.
			if (empty($img_html)) {
				$img_html = self::generate_fallback_img($attributes, $img_style, $alt_attr, $description_id, $has_description);
			}
		} else {
			$img_html = self::generate_fallback_img($attributes, $img_style, $alt_attr, $description_id, $has_description);
		}

		// Wrap in link if href is present.
		if (!empty($attributes->href)) {
			$link_attributes = array(
				'href' => $attributes->href,
				'class' => $attributes->link_class,
				'target' => $attributes->link_target,
				'rel' => $attributes->rel,
			);

			// Remove empty attributes.
			$link_attributes = array_filter($link_attributes);

			// Build link HTML.
			$link_tags = new WP_HTML_Tag_Processor('<a></a>');
			$link_tags->next_tag();
			foreach ($link_attributes as $attr => $value) {
				$link_tags->set_attribute($attr, $value);
			}
			// Insert image HTML inside link.
			// Note: WP_HTML_Tag_Processor doesn't support innerHTML injection easily for wrapping.
			// So we'll use sprintf.
			$link_open = $link_tags->get_updated_html();
			$link_open = str_replace('</a>', '', $link_open); // Get just the opening tag.

			$img_html = $link_open . $img_html . '</a>';
		}

		$caption_style = '';
		$figure_style = '';
		if ($has_caption) {
			$caption_style = "text-align: {$attributes->caption_align}; width: {$attributes->caption_width};";
			if (!empty($attributes->caption_style)) {
				$caption_style .= ' ' . $attributes->caption_style;
			}

			// Determine flex-direction based on placement.
			$placement = $attributes->caption_placement;
			$is_side_caption = str_starts_with($placement, 'left-') || str_starts_with($placement, 'right-');
			$flex_direction = $is_side_caption ? 'row' : 'column';

			// Determine align-items based on placement suffix.
			$parts = explode('-', $placement);
			$suffix = $parts[1] ?? 'left';

			$align_items = match ($suffix) {
				'left', 'top' => 'flex-start',
				'center' => 'center',
				'right', 'bottom' => 'flex-end',
				default => 'flex-start',
			};

			$figure_style = "display: flex; flex-direction: {$flex_direction}; align-items: {$align_items};";
		}

		// Determine caption position (before or after image).
		$caption_before_image = false;
		if ($has_caption) {
			$placement = $attributes->caption_placement;
			$caption_before_image = str_starts_with($placement, 'left-') || str_starts_with($placement, 'top-');
		}

		$html = match (true) {
			$has_caption && $caption_before_image => sprintf(
				'<figure class="photo-collage-image-figure" style="%s"><figcaption class="photo-collage-image-caption wp-element-caption %s" style="%s">%s</figcaption>%s</figure>',
				esc_attr($figure_style),
				esc_attr($attributes->caption_class),
				esc_attr($caption_style),
				wp_kses_post($attributes->caption),
				$img_html
			),
			$has_caption => sprintf(
				'<figure class="photo-collage-image-figure" style="%s">%s<figcaption class="photo-collage-image-caption wp-element-caption %s" style="%s">%s</figcaption></figure>',
				esc_attr($figure_style),
				$img_html,
				esc_attr($attributes->caption_class),
				esc_attr($caption_style),
				wp_kses_post($attributes->caption)
			),
			default => $img_html,
		};

		if ($has_description) {
			$html .= sprintf(
				'<div id="%s" class="screen-reader-text">%s</div>',
				esc_attr($description_id),
				wp_kses_post($attributes->description)
			);
		}

		return $html;
	}

	/**
	 * Generate fallback IMG tag using HTML API
	 *
	 * @param Photo_Collage_Block_Attributes $attributes Attributes.
	 * @param string                         $img_style Style string.
	 * @param string                         $alt_attr Alt text.
	 * @param string                         $description_id Description ID.
	 * @param bool                           $has_description Has description.
	 * @return string
	 */
	private static function generate_fallback_img(
		Photo_Collage_Block_Attributes $attributes,
		string $img_style,
		string $alt_attr,
		string $description_id,
		bool $has_description
	): string {
		$tags = new WP_HTML_Tag_Processor('<img />');
		$tags->next_tag();
		$tags->set_attribute('src', $attributes->url);
		$tags->set_attribute('alt', $alt_attr);
		$tags->set_attribute('loading', 'lazy');
		if (!empty($attributes->img_class)) {
			$tags->set_attribute('class', $attributes->img_class);
		}
		$tags->set_attribute('style', $img_style);

		if (!empty($attributes->title)) {
			$tags->set_attribute('title', $attributes->title);
		}

		if ($has_description) {
			$tags->set_attribute('aria-describedby', $description_id);
		}

		// Add Lightbox directives if enabled for fallback images too.
		if (!empty($attributes->lightbox['enabled']) && empty($attributes->href)) {
			$tags->set_attribute('data-wp-interactive', 'core/image');
			$tags->set_attribute('data-wp-on--click', 'actions.showLightbox');
			$tags->set_attribute('data-wp-context', wp_json_encode(array('lightbox' => array('enabled' => true))));
			$current_style = $tags->get_attribute('style');
			$tags->set_attribute('style', $current_style . ' cursor: zoom-in;');
		}

		return $tags->get_updated_html();
	}

	/**
	 * Get allowed HTML for kses with Interactivity API support
	 *
	 * @return array Allowed HTML tags and attributes.
	 */
	public static function get_allowed_html(): array
	{
		$allowed_html = wp_kses_allowed_html('post');

		// Add Interactivity API attributes to img tag.
		if (isset($allowed_html['img'])) {
			$allowed_html['img']['data-wp-interactive'] = true;
			$allowed_html['img']['data-wp-on--click'] = true;
			$allowed_html['img']['data-wp-context'] = true;
		}

		// Add Interactivity API attributes to div tag (if needed for container or wrappers).
		if (isset($allowed_html['div'])) {
			$allowed_html['div']['data-wp-interactive'] = true;
			$allowed_html['div']['data-wp-on--click'] = true;
			$allowed_html['div']['data-wp-context'] = true;
			$allowed_html['div']['style'] = true;
			$allowed_html['div']['class'] = true;
		} else {
			$allowed_html['div'] = array(
				'data-wp-interactive' => true,
				'data-wp-on--click' => true,
				'data-wp-context' => true,
				'style' => true,
				'class' => true,
			);
		}

		// Ensure figcaption allows style attribute for caption positioning.
		if (isset($allowed_html['figcaption'])) {
			$allowed_html['figcaption']['style'] = true;
		} else {
			$allowed_html['figcaption'] = array(
				'style' => true,
				'class' => true,
			);
		}

		// Ensure figure allows style attribute for Flexbox positioning.
		if (isset($allowed_html['figure'])) {
			$allowed_html['figure']['style'] = true;
		} else {
			$allowed_html['figure'] = array(
				'style' => true,
				'class' => true,
			);
		}

		return $allowed_html;
	}
}
