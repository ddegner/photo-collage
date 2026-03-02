<?php
/**
 * Admin Settings Page Controller for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/enums.php';
require_once __DIR__ . '/class-photo-collage-collage-scanner.php';
require_once __DIR__ . '/class-photo-collage-collage-exporter.php';

if ( defined( 'PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH' ) && PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH ) {
	$release_channel_enum_file = __DIR__ . '/enum-photo-collage-release-channel.php';
	if ( file_exists( $release_channel_enum_file ) ) {
		require_once $release_channel_enum_file;
	}
}

/**
 * Handles the admin settings page for the Photo Collage plugin.
 */
final class Photo_Collage_Admin_Settings {

	/**
	 * Option name for storing uninstall preference.
	 */
	public const OPTION_NAME = 'photo_collage_uninstall_preference';

	/**
	 * Option name for storing release channel preference.
	 */
	public const RELEASE_CHANNEL_OPTION_NAME = 'photo_collage_release_channel';

	/**
	 * Scanner dependency.
	 *
	 * @var Photo_Collage_Collage_Scanner
	 */
	private Photo_Collage_Collage_Scanner $scanner;

	/**
	 * Exporter dependency.
	 *
	 * @var Photo_Collage_Collage_Exporter
	 */
	private Photo_Collage_Collage_Exporter $exporter;

	/**
	 * Initialize the admin settings.
	 *
	 * @param Photo_Collage_Collage_Scanner|null  $scanner Scanner dependency.
	 * @param Photo_Collage_Collage_Exporter|null $exporter Exporter dependency.
	 */
	public function __construct(
		?Photo_Collage_Collage_Scanner $scanner = null,
		?Photo_Collage_Collage_Exporter $exporter = null
	) {
		$this->scanner  = $scanner ?? new Photo_Collage_Collage_Scanner();
		$this->exporter = $exporter ?? new Photo_Collage_Collage_Exporter( $this->scanner );

		add_action( 'admin_menu', $this->add_settings_page( ... ) );
		add_action( 'admin_init', $this->register_settings( ... ) );
		add_action( 'admin_post_photo_collage_export', $this->handle_export_request( ... ) );
		add_action( 'admin_post_photo_collage_resave_blocks', $this->handle_resave_request( ... ) );
		add_filter( 'plugin_action_links_' . plugin_basename( PHOTO_COLLAGE_PLUGIN_FILE ), $this->add_settings_link( ... ) );
	}

	/**
	 * Add settings page to WordPress admin.
	 */
	public function add_settings_page(): void {
		add_options_page(
			page_title: __( 'Photo Collage Settings', 'photo-collage' ),
			menu_title: __( 'Photo Collage', 'photo-collage' ),
			capability: 'manage_options',
			menu_slug: 'photo-collage-settings',
			callback: $this->render_settings_page( ... )
		);
	}

	/**
	 * Register plugin settings.
	 */
	public function register_settings(): void {
		register_setting(
			option_group: 'photo_collage_settings',
			option_name: self::OPTION_NAME,
			args: array(
				'type'              => 'string',
				'default'           => Photo_Collage_Uninstall_Preference::STATIC_HTML->value,
				'sanitize_callback' => $this->sanitize_preference( ... ),
			)
		);

		if ( $this->is_release_channel_feature_enabled() ) {
			register_setting(
				option_group: 'photo_collage_settings',
				option_name: self::RELEASE_CHANNEL_OPTION_NAME,
				args: array(
					'type'              => 'string',
					'default'           => Photo_Collage_Release_Channel::STABLE->value,
					'sanitize_callback' => $this->sanitize_release_channel( ... ),
				)
			);
		}
	}

	/**
	 * Sanitize the preference value.
	 *
	 * @param string $value The value to sanitize.
	 * @return string Sanitized value.
	 */
	public function sanitize_preference( string $value ): string {
		return Photo_Collage_Uninstall_Preference::from_string( $value )->value;
	}

	/**
	 * Sanitize the release channel value.
	 *
	 * @param string $value The value to sanitize.
	 * @return string Sanitized value.
	 */
	public function sanitize_release_channel( string $value ): string {
		return Photo_Collage_Release_Channel::from_string( $value )->value;
	}

	/**
	 * Add settings link to plugin row.
	 *
	 * @param array<string> $links Existing plugin action links.
	 * @return array<string> Modified links.
	 */
	public function add_settings_link( array $links ): array {
		$settings_link = '<a href="' . esc_url( admin_url( 'options-general.php?page=photo-collage-settings' ) ) . '">' . esc_html__( 'Settings', 'photo-collage' ) . '</a>';
		array_unshift( $links, $settings_link );
		return $links;
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$settings_updated                = $this->handle_settings_submission();
		$current_preference              = Photo_Collage_Uninstall_Preference::from_string(
			(string) get_option( self::OPTION_NAME, Photo_Collage_Uninstall_Preference::STATIC_HTML->value )
		);
		$release_channel_feature_enabled = $this->is_release_channel_feature_enabled();
		$current_release_channel         = null;
		if ( $release_channel_feature_enabled ) {
			$current_release_channel = Photo_Collage_Release_Channel::from_string(
				(string) get_option( self::RELEASE_CHANNEL_OPTION_NAME, Photo_Collage_Release_Channel::STABLE->value )
			);
		}
		$block_count = $this->scan_collage_blocks();
		$export_url  = wp_nonce_url(
			admin_url( 'admin-post.php?action=photo_collage_export' ),
			'photo_collage_export',
			'nonce'
		);
		$resave_url  = wp_nonce_url(
			admin_url( 'admin-post.php?action=photo_collage_resave_blocks' ),
			'photo_collage_resave_blocks',
			'nonce'
		);
		$resaved_count = isset( $_GET['resaved'] ) ? absint( $_GET['resaved'] ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		require __DIR__ . '/admin/views/settings-page.php';
	}

	/**
	 * Handle settings form submission.
	 *
	 * @return bool True when settings were updated.
	 */
	private function handle_settings_submission(): bool {
		if ( ! isset( $_POST['photo_collage_settings_nonce'] ) ) {
			return false;
		}

		check_admin_referer( 'photo_collage_uninstall_options', 'photo_collage_settings_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'photo-collage' ) );
		}

		$updated = false;

		if ( isset( $_POST[ self::OPTION_NAME ] ) ) {
			$value = sanitize_text_field( wp_unslash( $_POST[ self::OPTION_NAME ] ) );
			update_option( self::OPTION_NAME, $this->sanitize_preference( $value ) );
			$updated = true;
		}

		if ( $this->is_release_channel_feature_enabled() && isset( $_POST[ self::RELEASE_CHANNEL_OPTION_NAME ] ) ) {
			$channel = $this->sanitize_release_channel( sanitize_text_field( wp_unslash( $_POST[ self::RELEASE_CHANNEL_OPTION_NAME ] ) ) );
			$current = Photo_Collage_Release_Channel::from_string(
				(string) get_option( self::RELEASE_CHANNEL_OPTION_NAME, Photo_Collage_Release_Channel::STABLE->value )
			)->value;

			update_option( self::RELEASE_CHANNEL_OPTION_NAME, $channel );
			if ( $current !== $channel ) {
				delete_site_transient( 'update_plugins' );
				if ( class_exists( 'Photo_Collage_Release_Updater' ) ) {
					Photo_Collage_Release_Updater::clear_cached_beta_release();
				}
			}

			$updated = true;
		}

		return $updated;
	}

	/**
	 * Determine whether release channel settings should be available.
	 *
	 * @return bool True when release channel feature is enabled.
	 */
	private function is_release_channel_feature_enabled(): bool {
		return defined( 'PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH' ) &&
			PHOTO_COLLAGE_HAS_RELEASE_CHANNEL_SWITCH &&
			enum_exists( 'Photo_Collage_Release_Channel', false );
	}

	/**
	 * Handle JSON export action routed through admin-post.php.
	 */
	public function handle_export_request(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'photo-collage' ) );
		}

		check_admin_referer( 'photo_collage_export', 'nonce' );
		$this->exporter->send_json_export();
		exit;
	}

	/**
	 * Handle the resave blocks request.
	 */
	public function handle_resave_request(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'photo-collage' ) );
		}

		check_admin_referer( 'photo_collage_resave_blocks', 'nonce' );

		$updated = $this->resave_collage_posts();

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'photo-collage-settings',
					'resaved' => $updated,
				),
				admin_url( 'options-general.php' )
			)
		);
		exit;
	}

	/**
	 * Re-save all posts containing collage blocks to update stored block markup.
	 *
	 * @return int Number of posts updated.
	 */
	private function resave_collage_posts(): int {
		$post_ids = $this->scanner->get_posts_with_collage_blocks();
		$updated  = 0;

		foreach ( $post_ids as $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post instanceof WP_Post ) {
				continue;
			}

			$blocks   = parse_blocks( $post->post_content );
			$modified = false;
			$blocks   = $this->add_img_to_image_blocks( $blocks, $modified );

			if ( $modified ) {
				wp_update_post(
					array(
						'ID'           => $post_id,
						'post_content' => serialize_blocks( $blocks ),
					)
				);
				++$updated;
			}
		}

		return $updated;
	}

	/**
	 * Recursively add img innerHTML to collage image blocks that lack it.
	 *
	 * @param array<array<string, mixed>> $blocks Parsed block array.
	 * @param bool                        $modified Reference flag set when any block is changed.
	 * @return array<array<string, mixed>> Updated blocks.
	 */
	private function add_img_to_image_blocks( array $blocks, bool &$modified ): array {
		foreach ( $blocks as &$block ) {
			if (
				'photo-collage/image' === ( $block['blockName'] ?? '' )
				&& '' === trim( $block['innerHTML'] ?? '' )
			) {
				$attrs = $block['attrs'] ?? array();
				$url   = $attrs['url'] ?? '';
				$alt   = $attrs['alt'] ?? '';
				$id    = (int) ( $attrs['id'] ?? 0 );

				if ( '' !== $url ) {
					$class_attr = $id > 0 ? ' class="wp-image-' . $id . '"' : '';
					$img        = '<img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '"' . $class_attr . ' />';

					$block['innerHTML']    = $img;
					$block['innerContent'] = array( $img );
					$modified              = true;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = $this->add_img_to_image_blocks( $block['innerBlocks'], $modified );
			}
		}

		return $blocks;
	}

	/**
	 * Scan all posts for photo collage blocks.
	 *
	 * @return int Number of collage blocks found.
	 */
	private function scan_collage_blocks(): int {
		$cached_count = get_transient( 'photo_collage_block_count' );
		if ( false !== $cached_count ) {
			return (int) $cached_count;
		}

		$posts_with_blocks = $this->scanner->get_collage_post_content();

		$count = 0;
		foreach ( $posts_with_blocks as $content ) {
			$count += substr_count( $content, '<!-- wp:photo-collage/container' );
		}

		set_transient( 'photo_collage_block_count', $count, HOUR_IN_SECONDS );

		return $count;
	}
}
