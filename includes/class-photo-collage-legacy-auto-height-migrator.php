<?php
/**
 * Legacy Auto Height Migration Service for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-photo-collage-collage-scanner.php';

/**
 * Handles one-time cleanup/migration for legacy auto-height collage containers.
 */
final class Photo_Collage_Legacy_Auto_Height_Migrator {

	/**
	 * Cache key for counting legacy blocks requiring recompute.
	 *
	 * @var string
	 */
	private const LEGACY_BLOCK_COUNT_TRANSIENT = 'photo_collage_legacy_auto_height_block_count';

	/**
	 * Known legacy auto-height keys that should be removed from block attributes.
	 *
	 * @var array<int, string>
	 */
	private const LEGACY_AUTO_HINT_KEYS = array(
		'autoHeightHint',
		'autoHeightRatio',
		'autoHeightAspectRatio',
		'heightHint',
		'heightRatio',
	);

	/**
	 * Scanner dependency.
	 *
	 * @var Photo_Collage_Collage_Scanner
	 */
	private Photo_Collage_Collage_Scanner $scanner;

	/**
	 * Constructor.
	 *
	 * @param Photo_Collage_Collage_Scanner|null $scanner Scanner dependency.
	 */
	public function __construct( ?Photo_Collage_Collage_Scanner $scanner = null ) {
		$this->scanner = $scanner ?? new Photo_Collage_Collage_Scanner();
	}

	/**
	 * Count legacy container blocks that would be updated by recompute.
	 *
	 * @return int
	 */
	public function count_blocks_requiring_recompute(): int {
		$cached_count = get_transient( self::LEGACY_BLOCK_COUNT_TRANSIENT );
		if ( false !== $cached_count ) {
			return (int) $cached_count;
		}

		$count = 0;
		foreach ( $this->scanner->get_collage_post_content() as $content ) {
			if ( ! has_blocks( $content ) ) {
				continue;
			}
			$count += $this->count_legacy_blocks_recursive( parse_blocks( $content ) );
		}

		set_transient( self::LEGACY_BLOCK_COUNT_TRANSIENT, $count, HOUR_IN_SECONDS );

		return $count;
	}

	/**
	 * Recompute legacy auto-height metadata across all posts with collage blocks.
	 *
	 * @return array{posts_scanned:int,posts_updated:int,blocks_updated:int,errors:int}
	 */
	public function recompute_all_posts(): array {
		$results = array(
			'posts_scanned'  => 0,
			'posts_updated'  => 0,
			'blocks_updated' => 0,
			'errors'         => 0,
		);

		foreach ( $this->scanner->get_posts_with_collage_blocks_details() as $post ) {
			++$results['posts_scanned'];

			$post_id        = (int) $post->ID;
			$original       = (string) $post->post_content;
			$updated_blocks = 0;
			$updated        = $this->recompute_content( $original, $updated_blocks );

			if ( $updated_blocks <= 0 || $updated === $original ) {
				continue;
			}

			$save_result = wp_update_post(
				array(
					'ID'           => $post_id,
					'post_content' => wp_slash( $updated ),
				),
				true
			);

			if ( is_wp_error( $save_result ) ) {
				++$results['errors'];
				continue;
			}

			++$results['posts_updated'];
			$results['blocks_updated'] += $updated_blocks;
		}

		delete_transient( self::LEGACY_BLOCK_COUNT_TRANSIENT );

		return $results;
	}

	/**
	 * Count blocks that require legacy auto-height recompute.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return int
	 */
	private function count_legacy_blocks_recursive( array $blocks ): int {
		$count = 0;

		foreach ( $blocks as $block ) {
			$block_name      = $block['blockName'] ?? '';
			$requires_update = false;
			if ( 'photo-collage/container' === $block_name && $this->container_requires_recompute( $block ) ) {
				$requires_update = true;
			}
			if ( $this->block_has_broken_unicode_escapes( $block ) ) {
				$requires_update = true;
			}
			if ( $requires_update ) {
				++$count;
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$count += $this->count_legacy_blocks_recursive( $block['innerBlocks'] );
			}
		}

		return $count;
	}

	/**
	 * Recompute a post content string.
	 *
	 * @param string $content        Post content.
	 * @param int    $updated_blocks Updated block count output.
	 * @return string
	 */
	private function recompute_content( string $content, int &$updated_blocks ): string {
		$updated_blocks = 0;
		if ( ! has_blocks( $content ) ) {
			return $content;
		}

		$blocks = parse_blocks( $content );
		$blocks = $this->recompute_blocks_recursive( $blocks, $updated_blocks );

		return serialize_blocks( $blocks );
	}

	/**
	 * Recompute blocks recursively.
	 *
	 * @param array $blocks          Parsed blocks.
	 * @param int   $updated_blocks  Updated block count output.
	 * @return array
	 */
	private function recompute_blocks_recursive( array $blocks, int &$updated_blocks ): array {
		$recomputed = array();

		foreach ( $blocks as $block ) {
			$block_name    = $block['blockName'] ?? '';
			$block_updated = false;

			if ( 'photo-collage/container' === $block_name ) {
				$updated_block = $this->recompute_container_block( $block );
				if ( null !== $updated_block ) {
					$block         = $updated_block;
					$block_updated = true;
				}
			}

			$repaired_block = $this->repair_block_unicode_escapes( $block );
			if ( null !== $repaired_block ) {
				$block         = $repaired_block;
				$block_updated = true;
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = $this->recompute_blocks_recursive( $block['innerBlocks'], $updated_blocks );
			}

			if ( $block_updated ) {
				++$updated_blocks;
			}

			$recomputed[] = $block;
		}

		return $recomputed;
	}

	/**
	 * Recompute a single container block.
	 *
	 * @param array $block Container block.
	 * @return array|null Updated block or null when unchanged.
	 */
	private function recompute_container_block( array $block ): ?array {
		$attrs = $block['attrs'] ?? array();
		if ( ! is_array( $attrs ) ) {
			$attrs = array();
		}

		$original_attrs = $attrs;

		$legacy_hint_present = false;
		foreach ( self::LEGACY_AUTO_HINT_KEYS as $key ) {
			if ( ! array_key_exists( $key, $attrs ) ) {
				continue;
			}
			unset( $attrs[ $key ] );
			$legacy_hint_present = true;
		}

		$height_mode = $attrs['heightMode'] ?? null;
		if ( ! $this->is_valid_height_mode( $height_mode ) ) {
			if ( $legacy_hint_present || $this->is_empty_height( $attrs['containerHeight'] ?? null ) ) {
				$attrs['heightMode'] = 'auto';
			}
		}

		if ( $attrs === $original_attrs ) {
			return null;
		}

		$block['attrs'] = $attrs;
		return $block;
	}

	/**
	 * Determine whether a container block requires recompute.
	 *
	 * @param array $block Container block.
	 * @return bool
	 */
	private function container_requires_recompute( array $block ): bool {
		$attrs = $block['attrs'] ?? array();
		if ( ! is_array( $attrs ) ) {
			$attrs = array();
		}

		foreach ( self::LEGACY_AUTO_HINT_KEYS as $key ) {
			if ( array_key_exists( $key, $attrs ) ) {
				return true;
			}
		}

		$height_mode = $attrs['heightMode'] ?? null;
		if ( $this->is_valid_height_mode( $height_mode ) ) {
			return false;
		}

		return $this->is_empty_height( $attrs['containerHeight'] ?? null );
	}

	/**
	 * Check if a height mode value is valid.
	 *
	 * @param mixed $height_mode Height mode value.
	 * @return bool
	 */
	private function is_valid_height_mode( mixed $height_mode ): bool {
		return is_string( $height_mode ) && in_array( $height_mode, array( 'auto', 'fixed' ), true );
	}

	/**
	 * Check if a height value should be treated as empty.
	 *
	 * @param mixed $height Height value.
	 * @return bool
	 */
	private function is_empty_height( mixed $height ): bool {
		return ! is_string( $height ) || '' === trim( $height );
	}

	/**
	 * Determine whether a block has malformed unicode escapes in string attributes.
	 *
	 * @param array $block Parsed block.
	 * @return bool
	 */
	private function block_has_broken_unicode_escapes( array $block ): bool {
		$block_name = (string) ( $block['blockName'] ?? '' );
		if ( ! str_starts_with( $block_name, 'photo-collage/' ) ) {
			return false;
		}

		$attrs = $block['attrs'] ?? array();
		if ( ! is_array( $attrs ) ) {
			return false;
		}

		foreach ( $attrs as $value ) {
			if ( ! is_string( $value ) ) {
				continue;
			}

			if ( $this->string_has_broken_unicode_escapes( $value ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Repair malformed unicode escapes in photo-collage block string attributes.
	 *
	 * @param array $block Parsed block.
	 * @return array|null Repaired block or null when unchanged.
	 */
	private function repair_block_unicode_escapes( array $block ): ?array {
		$block_name = (string) ( $block['blockName'] ?? '' );
		if ( ! str_starts_with( $block_name, 'photo-collage/' ) ) {
			return null;
		}

		$attrs = $block['attrs'] ?? array();
		if ( ! is_array( $attrs ) || empty( $attrs ) ) {
			return null;
		}

		$updated = false;
		foreach ( $attrs as $key => $value ) {
			if ( ! is_string( $value ) ) {
				continue;
			}

			$decoded = $this->decode_broken_unicode_escapes( $value );
			if ( $decoded === $value ) {
				continue;
			}

			$attrs[ $key ] = $decoded;
			$updated       = true;
		}

		if ( ! $updated ) {
			return null;
		}

		$block['attrs'] = $attrs;
		return $block;
	}

	/**
	 * Check whether a string has unslashed unicode escape tokens (e.g. u003c).
	 *
	 * @param string $value Attribute value.
	 * @return bool
	 */
	private function string_has_broken_unicode_escapes( string $value ): bool {
		return 1 === preg_match( '/(?<!\\\\)u[0-9a-fA-F]{4}/', $value );
	}

	/**
	 * Decode unslashed unicode escape tokens back to UTF-8 characters.
	 *
	 * @param string $value Attribute value.
	 * @return string
	 */
	private function decode_broken_unicode_escapes( string $value ): string {
		if ( ! $this->string_has_broken_unicode_escapes( $value ) ) {
			return $value;
		}

		$decoded = preg_replace_callback(
			'/(?<!\\\\)u([0-9a-fA-F]{4})/',
			static function ( array $matches ): string {
				$char = html_entity_decode( '&#x' . strtolower( $matches[1] ) . ';', ENT_QUOTES | ENT_HTML5, 'UTF-8' );
				return '' === $char ? $matches[0] : $char;
			},
			$value
		);

		return is_string( $decoded ) ? $decoded : $value;
	}
}
