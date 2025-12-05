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
 * Readonly class for block attributes
 */
final class Photo_Collage_Block_Attributes {




	/**
	 * Image URL
	 *
	 * @var string
	 */
	public string $url;

	/**
	 * Image ID
	 *
	 * @var int
	 */
	public int $id;

	/**
	 * Link HREF
	 *
	 * @var string
	 */
	public string $href;

	/**
	 * Link Target
	 *
	 * @var string
	 */
	public string $link_target;

	/**
	 * Link Rel
	 *
	 * @var string
	 */
	public string $rel;

	/**
	 * Link Class
	 *
	 * @var string
	 */
	public string $link_class;

	/**
	 * Image Alt Text
	 *
	 * @var string
	 */
	public string $alt;

	/**
	 * Is Decorative
	 *
	 * @var bool
	 */
	public bool $is_decorative;

	/**
	 * Use Absolute Position
	 *
	 * @var bool
	 */
	public bool $use_absolute_position;

	/**
	 * Z-Index
	 *
	 * @var int
	 */
	public int $z_index;

	/**
	 * Width
	 *
	 * @var string
	 */
	public string $width;

	/**
	 * Height
	 *
	 * @var string
	 */
	public string $height;

	/**
	 * Object Fit
	 *
	 * @var string
	 */
	public string $object_fit;

	/**
	 * Rotation
	 *
	 * @var int
	 */
	public int $rotation;

	/**
	 * Opacity
	 *
	 * @var float
	 */
	public float $opacity;

	/**
	 * Top position
	 *
	 * @var string
	 */
	public string $top;

	/**
	 * Right position
	 *
	 * @var string
	 */
	public string $right;

	/**
	 * Bottom position
	 *
	 * @var string
	 */
	public string $bottom;

	/**
	 * Left position
	 *
	 * @var string
	 */
	public string $left;

	/**
	 * Margin Top
	 *
	 * @var string
	 */
	public string $margin_top;

	/**
	 * Margin Right
	 *
	 * @var string
	 */
	public string $margin_right;

	/**
	 * Margin Bottom
	 *
	 * @var string
	 */
	public string $margin_bottom;

	/**
	 * Margin Left
	 *
	 * @var string
	 */
	public string $margin_left;

	/**
	 * Padding Top
	 *
	 * @var string
	 */
	public string $padding_top;

	/**
	 * Padding Right
	 *
	 * @var string
	 */
	public string $padding_right;

	/**
	 * Padding Bottom
	 *
	 * @var string
	 */
	public string $padding_bottom;

	/**
	 * Padding Left
	 *
	 * @var string
	 */
	public string $padding_left;

	/**
	 * Caption
	 *
	 * @var string
	 */
	public string $caption;

	/**
	 * Title
	 *
	 * @var string
	 */
	public string $title;

	/**
	 * Description
	 *
	 * @var string
	 */
	public string $description;

	/**
	 * Alignment
	 *
	 * @var string
	 */
	public string $align;

	/**
	 * Show Caption
	 *
	 * @var bool
	 */
	public bool $show_caption;

	/**
	 * Caption Alignment
	 *
	 * @var string
	 */
	public string $caption_align;

	/**
	 * Caption Width
	 *
	 * @var string
	 */
	public string $caption_width;

	/**
	 * Caption Placement
	 *
	 * @var string
	 */
	public string $caption_placement;

	/**
	 * Lightbox settings
	 *
	 * @var array
	 */
	public array $lightbox;

	/**
	 * Constructor
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( array $attributes ) {
		$this->url         = (string) ( $attributes['url'] ?? '' );
		$this->id          = (int) ( $attributes['id'] ?? 0 );
		$this->href        = (string) ( $attributes['href'] ?? '' );
		$this->link_target = (string) ( $attributes['linkTarget'] ?? '' );
		$this->rel         = (string) ( $attributes['rel'] ?? '' );
		$this->link_class  = (string) ( $attributes['linkClass'] ?? '' );
		$this->alt         = (string) ( $attributes['alt'] ?? '' );
		$this->align       = (string) ( $attributes['align'] ?? '' );

		$this->show_caption          = (bool) ( $attributes['showCaption'] ?? true );
		$this->caption_align         = (string) ( $attributes['captionAlign'] ?? 'center' );
		$this->caption_width         = (string) ( $attributes['captionWidth'] ?? '100%' );
		$this->caption_placement     = (string) ( $attributes['captionPlacement'] ?? 'bottom-left' );
		$this->is_decorative         = (bool) ( $attributes['isDecorative'] ?? false );
		$this->use_absolute_position = (bool) ( $attributes['useAbsolutePosition'] ?? false );
		$this->z_index               = (int) ( $attributes['zIndex'] ?? 1 );
		$this->width                 = (string) ( $attributes['width'] ?? '50%' );
		$this->height                = (string) ( $attributes['height'] ?? 'auto' );
		$this->object_fit            = (string) ( $attributes['objectFit'] ?? 'contain' );
		$this->rotation              = (int) ( $attributes['rotation'] ?? 0 );
		$this->opacity               = (float) ( $attributes['opacity'] ?? 1 );
		$this->top                   = (string) ( $attributes['top'] ?? 'auto' );
		$this->right                 = (string) ( $attributes['right'] ?? 'auto' );
		$this->bottom                = (string) ( $attributes['bottom'] ?? 'auto' );
		$this->left                  = (string) ( $attributes['left'] ?? 'auto' );
		$this->margin_top            = (string) ( $attributes['marginTop'] ?? '0%' );
		$this->margin_right          = (string) ( $attributes['marginRight'] ?? '0%' );
		$this->margin_bottom         = (string) ( $attributes['marginBottom'] ?? '0%' );
		$this->margin_left           = (string) ( $attributes['marginLeft'] ?? '0%' );
		$this->padding_top           = (string) ( $attributes['paddingTop'] ?? '0%' );
		$this->padding_right         = (string) ( $attributes['paddingRight'] ?? '0%' );
		$this->padding_bottom        = (string) ( $attributes['paddingBottom'] ?? '0%' );
		$this->padding_left          = (string) ( $attributes['paddingLeft'] ?? '0%' );
		$this->caption               = (string) ( $attributes['caption'] ?? '' );
		$this->title                 = (string) ( $attributes['title'] ?? '' );
		$this->description           = (string) ( $attributes['description'] ?? '' );
		$this->lightbox              = (array) ( $attributes['lightbox'] ?? array() );
	}
}
