<?php
/**
 * Collage Exporter Service for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-photo-collage-collage-scanner.php';

/**
 * Service responsible for exporting collage data.
 */
final class Photo_Collage_Collage_Exporter {

	/**
	 * Scanner service.
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
	 * Build the export payload.
	 *
	 * @return array<string, mixed>
	 */
	public function build_export_data(): array {
		$export_data = array(
			'exported_at' => current_time( 'mysql' ),
			'site_url'    => get_site_url(),
			'collages'    => array(),
		);

		$posts = $this->scanner->get_posts_with_collage_blocks_details();

		foreach ( $posts as $post ) {
			if ( ! has_blocks( $post->post_content ) ) {
				continue;
			}

			$blocks         = parse_blocks( $post->post_content );
			$collage_blocks = $this->extract_collage_blocks( $blocks );
			if ( empty( $collage_blocks ) ) {
				continue;
			}

			$export_data['collages'][] = array(
				'post_id'    => $post->ID,
				'post_title' => $post->post_title,
				'post_type'  => $post->post_type,
				'permalink'  => get_permalink( $post->ID ),
				'blocks'     => $collage_blocks,
			);
		}

		return $export_data;
	}

	/**
	 * Output export payload as downloadable JSON.
	 */
	public function send_json_export(): void {
		nocache_headers();
		header( 'Content-Type: application/json' );
		header( 'Content-Disposition: attachment; filename="photo-collage-backup-' . gmdate( 'Y-m-d' ) . '.json"' );
		echo wp_json_encode( $this->build_export_data(), JSON_PRETTY_PRINT );
	}

	/**
	 * Extract collage blocks from blocks array.
	 *
	 * @param array $blocks Array of blocks to search.
	 * @return array
	 */
	private function extract_collage_blocks( array $blocks ): array {
		$collage_blocks = array();

		foreach ( $blocks as $block ) {
			if ( ( $block['blockName'] ?? '' ) === 'photo-collage/container' ) {
				$collage_blocks[] = $block;
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$collage_blocks = array_merge( $collage_blocks, $this->extract_collage_blocks( $block['innerBlocks'] ) );
			}
		}

		return $collage_blocks;
	}
}
