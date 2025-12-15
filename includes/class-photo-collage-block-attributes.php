<?php
/**
 * Block Attributes Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Readonly class for block attributes using PHP 8.3 constructor property promotion.
 */
final readonly class Photo_Collage_Block_Attributes
{
	/**
	 * Constructor with property promotion.
	 */
	public function __construct(
		public string $url = '',
		public int $id = 0,
		public string $href = '',
		public string $link_target = '',
		public string $rel = '',
		public string $link_class = '',
		public string $alt = '',
		public bool $is_decorative = false,
		public bool $use_absolute_position = false,
		public int $z_index = 1,
		public string $width = '50%',
		public string $height = 'auto',
		public string $object_fit = 'contain',
		public int $rotation = 0,
		public float $opacity = 1.0,
		public string $top = 'auto',
		public string $right = 'auto',
		public string $bottom = 'auto',
		public string $left = 'auto',
		public string $margin_top = '0%',
		public string $margin_right = '0%',
		public string $margin_bottom = '0%',
		public string $margin_left = '0%',
		public string $padding_top = '0%',
		public string $padding_right = '0%',
		public string $padding_bottom = '0%',
		public string $padding_left = '0%',
		public string $caption = '',
		public string $title = '',
		public string $description = '',
		public string $align = '',
		public bool $show_caption = true,
		public string $caption_align = 'center',
		public string $caption_width = '100%',
		public string $caption_placement = 'bottom-left',
		public array $lightbox = [],
		public string $img_class = '',
		public string $img_style = '',
		public string $caption_class = '',
		public string $caption_style = '',
		public string $background_type = 'none',
		public string $background_color = '',
		public string $gradient = '',
		public int $background_image_id = 0,
		public string $background_image_url = '',
		public string $background_size = 'cover',
		public string $background_position = 'center center',
		public bool $background_repeat = false,
	) {}

	/**
	 * Create instance from attributes array.
	 *
	 * @param array $attributes Block attributes.
	 * @return self
	 */
	public static function from_array(array $attributes): self
	{
		return new self(
			url: (string) ($attributes['url'] ?? ''),
			id: (int) ($attributes['id'] ?? 0),
			href: (string) ($attributes['href'] ?? ''),
			link_target: (string) ($attributes['linkTarget'] ?? ''),
			rel: (string) ($attributes['rel'] ?? ''),
			link_class: (string) ($attributes['linkClass'] ?? ''),
			alt: (string) ($attributes['alt'] ?? ''),
			is_decorative: (bool) ($attributes['isDecorative'] ?? false),
			use_absolute_position: (bool) ($attributes['useAbsolutePosition'] ?? false),
			z_index: (int) ($attributes['zIndex'] ?? 1),
			width: (string) ($attributes['width'] ?? '50%'),
			height: (string) ($attributes['height'] ?? 'auto'),
			object_fit: (string) ($attributes['objectFit'] ?? 'contain'),
			rotation: max(-180, min(180, (int) ($attributes['rotation'] ?? 0))),
			opacity: (float) ($attributes['opacity'] ?? 1.0),
			top: (string) ($attributes['top'] ?? 'auto'),
			right: (string) ($attributes['right'] ?? 'auto'),
			bottom: (string) ($attributes['bottom'] ?? 'auto'),
			left: (string) ($attributes['left'] ?? 'auto'),
			margin_top: (string) ($attributes['marginTop'] ?? '0%'),
			margin_right: (string) ($attributes['marginRight'] ?? '0%'),
			margin_bottom: (string) ($attributes['marginBottom'] ?? '0%'),
			margin_left: (string) ($attributes['marginLeft'] ?? '0%'),
			padding_top: (string) ($attributes['paddingTop'] ?? '0%'),
			padding_right: (string) ($attributes['paddingRight'] ?? '0%'),
			padding_bottom: (string) ($attributes['paddingBottom'] ?? '0%'),
			padding_left: (string) ($attributes['paddingLeft'] ?? '0%'),
			caption: (string) ($attributes['caption'] ?? ''),
			title: (string) ($attributes['title'] ?? ''),
			description: (string) ($attributes['description'] ?? ''),
			align: (string) ($attributes['align'] ?? ''),
			show_caption: (bool) ($attributes['showCaption'] ?? true),
			caption_align: (string) ($attributes['captionAlign'] ?? 'center'),
			caption_width: (string) ($attributes['captionWidth'] ?? '100%'),
			caption_placement: (string) ($attributes['captionPlacement'] ?? 'bottom-left'),
			lightbox: (array) ($attributes['lightbox'] ?? []),
			img_class: (string) ($attributes['imgClass'] ?? ''),
			img_style: (string) ($attributes['imgStyle'] ?? ''),
			caption_class: (string) ($attributes['captionClass'] ?? ''),
			caption_style: (string) ($attributes['captionStyle'] ?? ''),
			background_type: (string) ($attributes['backgroundType'] ?? 'none'),
			background_color: (string) ($attributes['backgroundColor'] ?? ''),
			gradient: (string) ($attributes['gradient'] ?? ''),
			background_image_id: (int) ($attributes['backgroundImageId'] ?? 0),
			background_image_url: (string) ($attributes['backgroundImageUrl'] ?? ''),
			background_size: (string) ($attributes['backgroundSize'] ?? 'cover'),
			background_position: (string) ($attributes['backgroundPosition'] ?? 'center center'),
			background_repeat: (bool) ($attributes['backgroundRepeat'] ?? false),
		);
	}
}
