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
		public string $aspect_ratio = 'auto',
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
		$attributes = self::repair_broken_unicode_in_attributes( $attributes );

		return new self(
			url: (string) ( $attributes['url'] ?? '' ),
			id: (int) ( $attributes['id'] ?? 0 ),
			href: (string) ( $attributes['href'] ?? '' ),
			link_target: (string) ( $attributes['linkTarget'] ?? '' ),
			rel: (string) ( $attributes['rel'] ?? '' ),
			link_class: (string) ( $attributes['linkClass'] ?? '' ),
			alt: (string) ( $attributes['alt'] ?? '' ),
			aspect_ratio: (string) ( $attributes['aspectRatio'] ?? 'auto' ),
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
			background_color: self::get_background_color( $attributes ),
			gradient: self::get_gradient_value( $attributes ),
			background_image_id: (int) ( $attributes['backgroundImageId'] ?? 0 ),
			background_image_url: (string) ( $attributes['backgroundImageUrl'] ?? '' ),
			background_size: (string) ( $attributes['backgroundSize'] ?? 'cover' ),
			background_position: (string) ( $attributes['backgroundPosition'] ?? 'center center' ),
			background_repeat: (bool) ( $attributes['backgroundRepeat'] ?? false ),
			has_native_background: self::has_native_background( $attributes ),
		);
	}

	/**
	 * Read margin values from native spacing support with legacy fallback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $side       Margin side (top|right|bottom|left).
	 * @return string
	 */
	private static function get_margin_value( array $attributes, string $side ): string {
		$native_margin = $attributes['style']['spacing']['margin'] ?? null;
		if ( is_array( $native_margin ) && isset( $native_margin[ $side ] ) && is_string( $native_margin[ $side ] ) ) {
			return self::normalize_preset_value( $native_margin[ $side ], 'spacing' );
		}

		if ( is_string( $native_margin ) ) {
			return self::normalize_preset_value( $native_margin, 'spacing' );
		}

		$legacy_key = 'margin' . ucfirst( $side );
		if ( isset( $attributes[ $legacy_key ] ) && is_string( $attributes[ $legacy_key ] ) ) {
			return self::normalize_preset_value( $attributes[ $legacy_key ], 'spacing' );
		}

		return '0%';
	}

	/**
	 * Detect whether native background support values are present.
	 *
	 * @param array $attributes Block attributes.
	 * @return bool
	 */
	private static function has_native_background( array $attributes ): bool {
		$background = $attributes['style']['color']['background'] ?? '';
		$gradient   = $attributes['style']['color']['gradient'] ?? '';

		return ( is_string( $background ) && '' !== $background ) || ( is_string( $gradient ) && '' !== $gradient );
	}

	/**
	 * Resolve background color from native style first, then legacy fallback.
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	private static function get_background_color( array $attributes ): string {
		$native_background = $attributes['style']['color']['background'] ?? '';
		if ( is_string( $native_background ) && '' !== $native_background ) {
			return self::normalize_preset_value( $native_background, 'color' );
		}

		$legacy_background = $attributes['backgroundColor'] ?? '';
		if ( is_string( $legacy_background ) && '' !== $legacy_background ) {
			return self::normalize_preset_value( $legacy_background, 'color' );
		}

		return '';
	}

	/**
	 * Resolve gradient from native style first, then legacy fallback.
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	private static function get_gradient_value( array $attributes ): string {
		$native_gradient = $attributes['style']['color']['gradient'] ?? '';
		if ( is_string( $native_gradient ) && '' !== $native_gradient ) {
			return self::normalize_preset_value( $native_gradient, 'gradient' );
		}

		$legacy_gradient = $attributes['gradient'] ?? '';
		if ( is_string( $legacy_gradient ) && '' !== $legacy_gradient ) {
			return self::normalize_preset_value( $legacy_gradient, 'gradient' );
		}

		return '';
	}

	/**
	 * Convert preset token values to valid CSS variables.
	 *
	 * @param string $value       Raw value.
	 * @param string $preset_type Preset type (spacing|color|gradient).
	 * @return string
	 */
	private static function normalize_preset_value( string $value, string $preset_type ): string {
		$prefix = "var:preset|{$preset_type}|";
		if ( ! str_starts_with( $value, $prefix ) ) {
			return $value;
		}

		$slug = str_replace( '|', '--', substr( $value, strlen( $prefix ) ) );
		if ( '' === $slug ) {
			return $value;
		}

		return "var(--wp--preset--{$preset_type}--{$slug})";
	}

	/**
	 * Repair broken JavaScript unicode escapes in all string attribute values.
	 *
	 * @param array<string, mixed> $attributes Raw block attributes.
	 * @return array<string, mixed> Attributes with repaired string values.
	 */
	private static function repair_broken_unicode_in_attributes( array $attributes ): array {
		foreach ( $attributes as $key => $value ) {
			if ( is_string( $value ) ) {
				$attributes[ $key ] = self::repair_broken_unicode_escapes( $value );
			}
		}
		return $attributes;
	}

	/**
	 * Repair broken JavaScript unicode escape sequences in a string value.
	 *
	 * JavaScript's block serializer escapes <, >, ", and & as \u003c, \u003e,
	 * \u0022, and \u0026 in block comment JSON. If backslashes are lost during
	 * a save cycle, the escapes degrade to bare literals (e.g. u003c) that
	 * json_decode treats as plain text instead of the intended characters.
	 *
	 * @param string $value Raw attribute value.
	 * @return string Repaired value.
	 */
	public static function repair_broken_unicode_escapes( string $value ): string {
		if ( ! str_contains( $value, 'u00' ) ) {
			return $value;
		}

		return preg_replace_callback(
			'/u([0-9a-fA-F]{4})/',
			static function ( array $matches ): string {
				$codepoint = (int) hexdec( $matches[1] );
				// Only fix codepoints produced by JavaScript's block serializer.
				return match ( $codepoint ) {
					0x003C, 0x003E, 0x0022, 0x0026 => mb_chr( $codepoint, 'UTF-8' ),
					default => $matches[0],
				};
			},
			$value
		) ?? $value;
	}
}
