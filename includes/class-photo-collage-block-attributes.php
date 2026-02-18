<?php
/**
 * Block Attributes Class for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Readonly class for block attributes using PHP 8.3 constructor property promotion.
 */
final class Photo_Collage_Block_Attributes {



	/**
	 * Constructor with property promotion.
	 *
	 * @param string $url                   Image URL.
	 * @param int    $id                    Image attachment ID.
	 * @param string $href                  Link URL.
	 * @param string $link_target           Link target (e.g. _blank).
	 * @param string $rel                   Link rel attribute.
	 * @param string $link_class            Link CSS class.
	 * @param string $alt                   Image alt text.
	 * @param string $aspect_ratio          Aspect ratio.
	 * @param string $size_slug             Image size slug.
	 * @param string $anchor                HTML anchor.
	 * @param bool   $is_decorative         Whether image is decorative.
	 * @param bool   $use_absolute_position Whether to use absolute positioning.
	 * @param int    $z_index               Z-Index.
	 * @param string $width                 Width (e.g. 50%).
	 * @param string $height                Height (e.g. auto).
	 * @param string $object_fit            Object fit (contain/cover).
	 * @param int    $rotation              Rotation in degrees.
	 * @param float  $opacity               Opacity (0-1).
	 * @param string $top                   Top position.
	 * @param string $right                 Right position.
	 * @param string $bottom                Bottom position.
	 * @param string $left                  Left position.
	 * @param string $margin_top            Top margin.
	 * @param string $margin_right          Right margin.
	 * @param string $margin_bottom         Bottom margin.
	 * @param string $margin_left           Left margin.
	 * @param string $caption               Caption text.
	 * @param string $title                 Title text.
	 * @param string $description           Description text.
	 * @param string $align                 Alignment.
	 * @param bool   $show_caption          Whether to show caption.
	 * @param string $caption_align         Caption text alignment.
	 * @param string $caption_width         Caption width.
	 * @param string $caption_placement     Caption placement.
	 * @param array  $lightbox              Lightbox settings.
	 * @param string $img_class             Custom image class.
	 * @param string $img_style             Custom image style.
	 * @param string $caption_class         Custom caption class.
	 * @param string $caption_style         Custom caption style.
	 * @param string $background_type       Background type.
	 * @param string $background_color      Background color.
	 * @param string $gradient              Gradient background.
	 * @param int    $background_image_id   Background image ID.
	 * @param string $background_image_url  Background image URL.
	 * @param string $background_size       Background size.
	 * @param string $background_position   Background position.
	 * @param bool   $background_repeat     Background repeat.
	 * @param bool   $has_native_background Whether native background is used.
	 */
	public function __construct(
		public string $url = '',
		public int $id = 0,
		public string $href = '',
		public string $link_target = '',
		public string $rel = '',
		public string $link_class = '',
		public string $alt = '',
		public string $aspect_ratio = '',
		public string $size_slug = 'large',
		public string $anchor = '',
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
		public string $caption = '',
		public string $title = '',
		public string $description = '',
		public string $align = '',
		public bool $show_caption = true,
		public string $caption_align = 'left',
		public string $caption_width = '100%',
		public string $caption_placement = 'bottom-left',
		public array $lightbox = array(),
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
		public bool $has_native_background = false,
	) {
	}

	/**
	 * Create instance from attributes array.
	 *
	 * @param array $attributes Block attributes.
	 * @return self
	 */
	public static function from_array( array $attributes ): self {
		return new self(
			url: (string) ( $attributes['url'] ?? '' ),
			id: (int) ( $attributes['id'] ?? 0 ),
			href: (string) ( $attributes['href'] ?? '' ),
			link_target: (string) ( $attributes['linkTarget'] ?? '' ),
			rel: (string) ( $attributes['rel'] ?? '' ),
			link_class: (string) ( $attributes['linkClass'] ?? '' ),
			alt: (string) ( $attributes['alt'] ?? '' ),
			aspect_ratio: (string) ( $attributes['aspectRatio'] ?? '' ),
			size_slug: (string) ( $attributes['sizeSlug'] ?? 'large' ),
			anchor: (string) ( $attributes['anchor'] ?? '' ),
			is_decorative: (bool) ( $attributes['isDecorative'] ?? false ),
			use_absolute_position: (bool) ( $attributes['useAbsolutePosition'] ?? false ),
			z_index: (int) ( $attributes['zIndex'] ?? 1 ),
			width: (string) ( $attributes['width'] ?? '50%' ),
			height: (string) ( $attributes['height'] ?? 'auto' ),
			object_fit: (string) ( $attributes['objectFit'] ?? 'contain' ),
			rotation: max( -180, min( 180, (int) ( $attributes['rotation'] ?? 0 ) ) ),
			opacity: (float) ( $attributes['opacity'] ?? 1.0 ),
			top: (string) ( $attributes['top'] ?? 'auto' ),
			right: (string) ( $attributes['right'] ?? 'auto' ),
			bottom: (string) ( $attributes['bottom'] ?? 'auto' ),
			left: (string) ( $attributes['left'] ?? 'auto' ),
			margin_top: self::get_margin_value( $attributes, 'top' ),
			margin_right: self::get_margin_value( $attributes, 'right' ),
			margin_bottom: self::get_margin_value( $attributes, 'bottom' ),
			margin_left: self::get_margin_value( $attributes, 'left' ),
			caption: (string) ( $attributes['caption'] ?? '' ),
			title: (string) ( $attributes['title'] ?? '' ),
			description: (string) ( $attributes['description'] ?? '' ),
			align: (string) ( $attributes['align'] ?? '' ),
			show_caption: (bool) ( $attributes['showCaption'] ?? true ),
			caption_align: (string) ( $attributes['captionAlign'] ?? 'left' ),
			caption_width: (string) ( $attributes['captionWidth'] ?? '100%' ),
			caption_placement: (string) ( $attributes['captionPlacement'] ?? 'bottom-left' ),
			lightbox: (array) ( $attributes['lightbox'] ?? array() ),
			img_class: (string) ( $attributes['imgClass'] ?? '' ),
			img_style: (string) ( $attributes['imgStyle'] ?? '' ),
			caption_class: (string) ( $attributes['captionClass'] ?? '' ),
			caption_style: (string) ( $attributes['captionStyle'] ?? '' ),
			background_type: (string) ( $attributes['backgroundType'] ?? 'none' ),
			background_color: (string) ( $attributes['backgroundColor'] ?? '' ),
			gradient: (string) ( $attributes['gradient'] ?? '' ),
			background_image_id: (int) ( $attributes['backgroundImageId'] ?? 0 ),
			background_image_url: (string) ( $attributes['backgroundImageUrl'] ?? '' ),
			background_size: (string) ( $attributes['backgroundSize'] ?? 'cover' ),
			background_position: (string) ( $attributes['backgroundPosition'] ?? 'center center' ),
			background_repeat: (bool) ( $attributes['backgroundRepeat'] ?? false ),
			has_native_background: ! empty( $attributes['style']['color']['background'] ) || ! empty( $attributes['style']['color']['gradient'] ) || ( ! empty( $attributes['backgroundColor'] ) && is_string( $attributes['backgroundColor'] ) && ! str_starts_with( $attributes['backgroundColor'], '#' ) ),
		);
	}

	/**
	 * Read margin values from legacy custom attributes or native spacing support.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $side       Margin side (top|right|bottom|left).
	 * @return string
	 */
	private static function get_margin_value( array $attributes, string $side ): string {
		$legacy_key = 'margin' . ucfirst( $side );
		if ( isset( $attributes[ $legacy_key ] ) && is_string( $attributes[ $legacy_key ] ) ) {
			return $attributes[ $legacy_key ];
		}

		$native_margin = $attributes['style']['spacing']['margin'] ?? null;
		if ( is_array( $native_margin ) && isset( $native_margin[ $side ] ) && is_string( $native_margin[ $side ] ) ) {
			return $native_margin[ $side ];
		}

		if ( is_string( $native_margin ) ) {
			return $native_margin;
		}

		return '0%';
	}
}
