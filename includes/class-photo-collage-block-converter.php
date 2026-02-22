<?php
/**
 * Legacy Block Converter Facade for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/enums.php';
require_once __DIR__ . '/class-photo-collage-collage-scanner.php';
require_once __DIR__ . '/class-photo-collage-collage-converter.php';

/**
 * Backward-compatible facade around scanner + converter services.
 */
final class Photo_Collage_Block_Converter {

	/**
	 * Scanner dependency.
	 *
	 * @var Photo_Collage_Collage_Scanner
	 */
	private Photo_Collage_Collage_Scanner $scanner;

	/**
	 * Converter dependency.
	 *
	 * @var Photo_Collage_Collage_Converter
	 */
	private Photo_Collage_Collage_Converter $converter;

	/**
	 * Constructor.
	 *
	 * @param Photo_Collage_Collage_Scanner|null   $scanner Scanner dependency.
	 * @param Photo_Collage_Collage_Converter|null $converter Converter dependency.
	 */
	public function __construct(
		?Photo_Collage_Collage_Scanner $scanner = null,
		?Photo_Collage_Collage_Converter $converter = null
	) {
		$this->scanner   = $scanner ?? new Photo_Collage_Collage_Scanner();
		$this->converter = $converter ?? new Photo_Collage_Collage_Converter();
	}

	/**
	 * Get all post IDs that contain collage blocks.
	 *
	 * @return array<int>
	 */
	public static function get_posts_with_collage_blocks(): array {
		return ( new Photo_Collage_Collage_Scanner() )->get_posts_with_collage_blocks();
	}

	/**
	 * Get post content for posts containing collage blocks.
	 *
	 * @return array<string>
	 */
	public static function get_collage_post_content(): array {
		return ( new Photo_Collage_Collage_Scanner() )->get_collage_post_content();
	}

	/**
	 * Get detailed post records containing collage blocks.
	 *
	 * @return array<object{ID:int,post_title:string,post_content:string,post_type:string}>
	 */
	public static function get_posts_with_collage_blocks_details(): array {
		return ( new Photo_Collage_Collage_Scanner() )->get_posts_with_collage_blocks_details();
	}

	/**
	 * Scan all posts for collage blocks.
	 *
	 * @return array<int>
	 */
	public function scan_all_posts(): array {
		return $this->scanner->get_posts_with_collage_blocks();
	}

	/**
	 * Convert blocks in a post.
	 *
	 * @param int                                       $post_id Post ID.
	 * @param string|Photo_Collage_Uninstall_Preference $preference Conversion preference.
	 * @return bool
	 */
	public function convert_post( int $post_id, string|Photo_Collage_Uninstall_Preference $preference ): bool {
		return $this->converter->convert_post( $post_id, $preference );
	}
}
