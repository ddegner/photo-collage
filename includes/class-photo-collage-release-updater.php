<?php
/**
 * Release channel updater for Photo Collage plugin.
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Routes stable updates through WordPress.org and beta updates through GitHub releases.
 */
final class Photo_Collage_Release_Updater {

	/**
	 * Option name for the selected release channel.
	 */
	public const OPTION_NAME = 'photo_collage_release_channel';

	/**
	 * Cache key for latest beta release metadata.
	 */
	public const BETA_RELEASE_TRANSIENT = 'photo_collage_beta_release_data';

	/**
	 * Plugin slug.
	 */
	private const PLUGIN_SLUG = 'photo-collage';

	/**
	 * GitHub repository URL.
	 */
	private const GITHUB_REPOSITORY_URL = 'https://github.com/ddegner/photo-collage';

	/**
	 * GitHub releases API endpoint.
	 */
	private const GITHUB_RELEASES_API_URL = 'https://api.github.com/repos/ddegner/photo-collage/releases?per_page=20';

	/**
	 * Plugin minimum WordPress version.
	 */
	private const REQUIRES_WP = '6.8';

	/**
	 * Plugin minimum PHP version.
	 */
	private const REQUIRES_PHP = '8.3';

	/**
	 * Cache duration for successful beta lookups.
	 */
	private const BETA_RELEASE_CACHE_TTL = 10 * MINUTE_IN_SECONDS;

	/**
	 * Cache duration when no beta release is available.
	 */
	private const EMPTY_BETA_CACHE_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * Hook into WordPress update APIs.
	 */
	public function __construct() {
		add_filter( 'pre_set_site_transient_update_plugins', $this->inject_beta_update( ... ) );
		add_filter( 'plugins_api', $this->filter_plugin_information( ... ), 20, 3 );
		add_filter( 'upgrader_source_selection', $this->normalize_upgrade_source( ... ), 10, 4 );
	}

	/**
	 * Clear cached beta release data.
	 */
	public static function clear_cached_beta_release(): void {
		delete_site_transient( self::BETA_RELEASE_TRANSIENT );
	}

	/**
	 * Inject beta update metadata when beta channel is selected.
	 *
	 * @param mixed $transient Update transient object.
	 * @return mixed
	 */
	public function inject_beta_update( mixed $transient ): mixed {
		if ( ! $this->is_beta_channel_enabled() ) {
			return $transient;
		}

		if ( ! is_object( $transient ) || ! isset( $transient->checked ) || ! is_array( $transient->checked ) ) {
			return $transient;
		}

		$plugin_file     = plugin_basename( PHOTO_COLLAGE_PLUGIN_FILE );
		$current_version = isset( $transient->checked[ $plugin_file ] ) ? (string) $transient->checked[ $plugin_file ] : PHOTO_COLLAGE_VERSION;

		$beta_release = $this->get_latest_beta_release();
		if ( null === $beta_release ) {
			return $transient;
		}

		if ( ! $this->is_newer_beta_version( $beta_release['version'], $current_version ) ) {
			return $transient;
		}

		$existing_update_version = $this->extract_existing_update_version( $transient, $plugin_file );
		if ( '' !== $existing_update_version && version_compare( $existing_update_version, $beta_release['version'], '>=' ) ) {
			return $transient;
		}

		if ( ! isset( $transient->response ) || ! is_array( $transient->response ) ) {
			$transient->response = array();
		}

		$transient->response[ $plugin_file ] = $this->build_update_payload(
			version: $beta_release['version'],
			package_url: $beta_release['download_url'],
			details_url: $beta_release['html_url']
		);

		if ( isset( $transient->no_update ) && is_array( $transient->no_update ) ) {
			unset( $transient->no_update[ $plugin_file ] );
		}

		return $transient;
	}

	/**
	 * Provide plugin information panel details for beta updates.
	 *
	 * @param mixed  $result Existing plugin information result.
	 * @param string $action Plugin API action.
	 * @param mixed  $args   Plugin API arguments.
	 * @return mixed
	 */
	public function filter_plugin_information( mixed $result, string $action, mixed $args ): mixed {
		if ( ! $this->is_beta_channel_enabled() ) {
			return $result;
		}

		if ( 'plugin_information' !== $action ) {
			return $result;
		}

		if ( ! is_object( $args ) || ! isset( $args->slug ) || self::PLUGIN_SLUG !== (string) $args->slug ) {
			return $result;
		}

		$beta_release = $this->get_latest_beta_release();
		if ( null === $beta_release ) {
			return $result;
		}

		$release_notes = trim( $beta_release['body'] );
		if ( '' === $release_notes ) {
			$release_notes = __( 'No release notes were provided for this beta build.', 'photo-collage' );
		}

		return (object) array(
			'name'           => __( 'Photo Collage (Beta Channel)', 'photo-collage' ),
			'slug'           => self::PLUGIN_SLUG,
			'version'        => $beta_release['version'],
			'author'         => '<a href="https://profiles.wordpress.org/ddegner/">David Degner</a>',
			'author_profile' => 'https://profiles.wordpress.org/ddegner/',
			'homepage'       => self::GITHUB_REPOSITORY_URL,
			'download_link'  => $beta_release['download_url'],
			'requires'       => self::REQUIRES_WP,
			'requires_php'   => self::REQUIRES_PHP,
			'tested'         => (string) get_bloginfo( 'version' ),
			'last_updated'   => $beta_release['published_at'],
			'external'       => true,
			'sections'       => array(
				'description' => wpautop(
					wp_kses_post(
						__( 'You are using the beta update channel. Updates come from GitHub prereleases and may contain unfinished changes.', 'photo-collage' )
					)
				),
				'changelog'   => wpautop( wp_kses_post( $release_notes ) ),
			),
		);
	}

	/**
	 * Ensure downloaded GitHub package folder matches plugin slug.
	 *
	 * @param mixed $source        Source directory.
	 * @param mixed $remote_source Remote source directory.
	 * @param mixed $upgrader      Upgrader instance.
	 * @param mixed $hook_extra    Extra hook data.
	 * @return mixed
	 */
	public function normalize_upgrade_source( mixed $source, mixed $remote_source, mixed $upgrader, mixed $hook_extra ): mixed {
		unset( $upgrader );

		if ( ! $this->is_beta_channel_enabled() ) {
			return $source;
		}

		if ( ! is_array( $hook_extra ) || ! isset( $hook_extra['plugin'] ) ) {
			return $source;
		}

		if ( plugin_basename( PHOTO_COLLAGE_PLUGIN_FILE ) !== (string) $hook_extra['plugin'] ) {
			return $source;
		}

		if ( ! is_string( $source ) || ! is_string( $remote_source ) ) {
			return $source;
		}

		$source_directory = untrailingslashit( $source );
		if ( self::PLUGIN_SLUG === basename( $source_directory ) ) {
			// Preserve trailing slash for Plugin_Upgrader::check_package() glob checks.
			return trailingslashit( $source_directory );
		}

		$target_directory = trailingslashit( $remote_source ) . self::PLUGIN_SLUG;
		global $wp_filesystem;

		if ( ! is_object( $wp_filesystem ) ) {
			return $source;
		}

		if ( $wp_filesystem->exists( $target_directory ) ) {
			$wp_filesystem->delete( $target_directory, true );
		}

		if ( $wp_filesystem->move( $source_directory, $target_directory, true ) ) {
			// Preserve trailing slash for Plugin_Upgrader::check_package() glob checks.
			return trailingslashit( $target_directory );
		}

		return $source;
	}

	/**
	 * Determine whether beta channel is currently enabled.
	 *
	 * @return bool True when beta updates are enabled.
	 */
	private function is_beta_channel_enabled(): bool {
		if ( ! enum_exists( 'Photo_Collage_Release_Channel', false ) ) {
			return false;
		}

		$channel = Photo_Collage_Release_Channel::from_string(
			(string) get_option( self::OPTION_NAME, Photo_Collage_Release_Channel::STABLE->value )
		);

		return Photo_Collage_Release_Channel::BETA === $channel;
	}

	/**
	 * Fetch latest beta release metadata from cache or GitHub API.
	 *
	 * @return array<string,string>|null
	 */
	private function get_latest_beta_release(): ?array {
		$cached_release = get_site_transient( self::BETA_RELEASE_TRANSIENT );
		if ( is_array( $cached_release ) && $this->is_valid_cached_release( $cached_release ) ) {
			return $cached_release;
		}

		if ( 'none' === $cached_release ) {
			return null;
		}

		$response = wp_remote_get(
			self::GITHUB_RELEASES_API_URL,
			array(
				'timeout' => 15,
				'headers' => array(
					'Accept'     => 'application/vnd.github+json',
					'User-Agent' => $this->build_user_agent(),
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			$this->cache_empty_beta_release();
			return null;
		}

		if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			$this->cache_empty_beta_release();
			return null;
		}

		$raw_body = wp_remote_retrieve_body( $response );
		$releases = json_decode( $raw_body, true );

		if ( ! is_array( $releases ) ) {
			$this->cache_empty_beta_release();
			return null;
		}

		foreach ( $releases as $release ) {
			if ( ! is_array( $release ) || ! $this->is_beta_release( $release ) ) {
				continue;
			}

			$version = $this->extract_release_version( $release );
			if ( '' === $version ) {
				continue;
			}

			$download_url = $this->extract_download_url( $release );
			if ( '' === $download_url ) {
				continue;
			}

			$normalized_release = array(
				'version'      => $version,
				'tag_name'     => (string) ( $release['tag_name'] ?? '' ),
				'name'         => (string) ( $release['name'] ?? '' ),
				'download_url' => $download_url,
				'html_url'     => (string) ( $release['html_url'] ?? self::GITHUB_REPOSITORY_URL ),
				'published_at' => (string) ( $release['published_at'] ?? '' ),
				'body'         => (string) ( $release['body'] ?? '' ),
			);

			if ( '' === $normalized_release['name'] ) {
				$normalized_release['name'] = $normalized_release['tag_name'];
			}

			set_site_transient(
				self::BETA_RELEASE_TRANSIENT,
				$normalized_release,
				self::BETA_RELEASE_CACHE_TTL
			);

			return $normalized_release;
		}

		$this->cache_empty_beta_release();
		return null;
	}

	/**
	 * Extract existing plugin update version from the core transient.
	 *
	 * @param mixed  $transient   Update transient object.
	 * @param string $plugin_file Plugin basename.
	 * @return string Existing update version or empty string.
	 */
	private function extract_existing_update_version( mixed $transient, string $plugin_file ): string {
		if ( ! is_object( $transient ) || ! isset( $transient->response ) || ! is_array( $transient->response ) ) {
			return '';
		}

		if ( ! isset( $transient->response[ $plugin_file ] ) ) {
			return '';
		}

		$entry = $transient->response[ $plugin_file ];
		if ( is_object( $entry ) && isset( $entry->new_version ) && is_string( $entry->new_version ) ) {
			return $entry->new_version;
		}

		if ( is_array( $entry ) && isset( $entry['new_version'] ) && is_string( $entry['new_version'] ) ) {
			return $entry['new_version'];
		}

		return '';
	}

	/**
	 * Validate cached release payload shape.
	 *
	 * @param array<mixed> $cached_release Cached release payload.
	 * @return bool True when payload has required fields.
	 */
	private function is_valid_cached_release( array $cached_release ): bool {
		$required_fields = array(
			'version',
			'tag_name',
			'name',
			'download_url',
			'html_url',
			'published_at',
			'body',
		);

		foreach ( $required_fields as $field ) {
			if ( ! isset( $cached_release[ $field ] ) || ! is_string( $cached_release[ $field ] ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Cache an empty beta response for a short period.
	 */
	private function cache_empty_beta_release(): void {
		set_site_transient( self::BETA_RELEASE_TRANSIENT, 'none', self::EMPTY_BETA_CACHE_TTL );
	}

	/**
	 * Determine whether a GitHub release should be treated as beta.
	 *
	 * @param array<mixed> $release GitHub release payload.
	 * @return bool True when release is a beta/prerelease.
	 */
	private function is_beta_release( array $release ): bool {
		if ( ! empty( $release['draft'] ) ) {
			return false;
		}

		if ( ! empty( $release['prerelease'] ) ) {
			return true;
		}

		$tag_name = (string) ( $release['tag_name'] ?? '' );
		if ( '' === $tag_name ) {
			return false;
		}

		if ( str_starts_with( $tag_name, 'beta-' ) ) {
			return true;
		}

		return 1 === preg_match( '/(?:^|[\.-])beta(?:[\.-]|$)/i', $tag_name );
	}

	/**
	 * Extract release version from GitHub release metadata.
	 *
	 * @param array<mixed> $release GitHub release payload.
	 * @return string Parsed semantic version or empty string.
	 */
	private function extract_release_version( array $release ): string {
		$candidates = array(
			(string) ( $release['tag_name'] ?? '' ),
			(string) ( $release['name'] ?? '' ),
		);

		$assets = $release['assets'] ?? null;
		if ( is_array( $assets ) ) {
			foreach ( $assets as $asset ) {
				if ( is_array( $asset ) ) {
					$candidates[] = (string) ( $asset['name'] ?? '' );
				}
			}
		}

		foreach ( $candidates as $candidate ) {
			$version = $this->extract_version_from_string( $candidate );
			if ( '' !== $version ) {
				return $version;
			}
		}

		return '';
	}

	/**
	 * Extract plugin version from a tag-like string.
	 *
	 * @param string $value Tag, name, or filename string.
	 * @return string Parsed semantic version or empty string.
	 */
	private function extract_version_from_string( string $value ): string {
		$normalized_tag = trim( $value );
		if ( '' === $normalized_tag ) {
			return '';
		}

		if ( str_starts_with( strtolower( $normalized_tag ), 'v' ) ) {
			$normalized_tag = substr( $normalized_tag, 1 );
		}

		if ( str_starts_with( strtolower( $normalized_tag ), 'beta-' ) ) {
			$normalized_tag = substr( $normalized_tag, 5 );
		}

		if ( 1 === preg_match( '/\d+\.\d+\.\d+(?:-[0-9A-Za-z\.-]+)?/', $normalized_tag, $matches ) ) {
			return $matches[0];
		}

		return '';
	}

	/**
	 * Extract downloadable ZIP URL from release payload.
	 *
	 * @param array<mixed> $release GitHub release payload.
	 * @return string Download URL or empty string.
	 */
	private function extract_download_url( array $release ): string {
		$assets = $release['assets'] ?? null;
		if ( is_array( $assets ) ) {
			foreach ( $assets as $asset ) {
				if ( ! is_array( $asset ) || ! isset( $asset['browser_download_url'] ) ) {
					continue;
				}

				$asset_url  = (string) $asset['browser_download_url'];
				$asset_name = (string) ( $asset['name'] ?? '' );
				if ( '' === $asset_url ) {
					continue;
				}

				if ( str_ends_with( strtolower( $asset_name ), '.zip' ) ) {
					return $asset_url;
				}
			}
		}

		return (string) ( $release['zipball_url'] ?? '' );
	}

	/**
	 * Determine whether candidate beta version should be offered over current version.
	 *
	 * WordPress semver treats prereleases (for example 1.2.3-beta.1) as lower than
	 * stable (1.2.3). For beta channel users we still want to offer same-base betas.
	 *
	 * @param string $candidate_version Candidate beta version.
	 * @param string $current_version   Current installed version.
	 * @return bool True when candidate should be offered.
	 */
	private function is_newer_beta_version( string $candidate_version, string $current_version ): bool {
		if ( version_compare( $candidate_version, $current_version, '>' ) ) {
			return true;
		}

		if ( $candidate_version === $current_version ) {
			return false;
		}

		$candidate_base = $this->extract_base_semver( $candidate_version );
		$current_base   = $this->extract_base_semver( $current_version );
		if ( '' === $candidate_base || '' === $current_base ) {
			return false;
		}

		if ( $candidate_base !== $current_base ) {
			return false;
		}

		// If we reach here, both versions share the same base and candidate was not
		// strictly greater via version_compare(). This means the candidate is either
		// the same effective version or a downgrade (e.g. offering 0.5.16-beta.1 to
		// a user already on stable 0.5.16). Never offer a downgrade.
		return false;
	}

	/**
	 * Extract x.y.z base version from a semantic version string.
	 *
	 * @param string $version Version string.
	 * @return string Base semantic version or empty string.
	 */
	private function extract_base_semver( string $version ): string {
		if ( 1 === preg_match( '/^v?(\d+\.\d+\.\d+)/', trim( $version ), $matches ) ) {
			return $matches[1];
		}

		return '';
	}

	/**
	 * Determine whether a version string is a prerelease.
	 *
	 * @param string $version Version string.
	 * @return bool True when version contains prerelease suffix.
	 */
	private function is_prerelease_version( string $version ): bool {
		return str_contains( trim( $version ), '-' );
	}

	/**
	 * Build plugin update payload object for transient responses.
	 *
	 * @param string $version     Target version.
	 * @param string $package_url Package download URL.
	 * @param string $details_url Release details URL.
	 * @return stdClass
	 */
	private function build_update_payload( string $version, string $package_url, string $details_url ): stdClass {
		return (object) array(
			'id'           => self::GITHUB_REPOSITORY_URL,
			'slug'         => self::PLUGIN_SLUG,
			'plugin'       => plugin_basename( PHOTO_COLLAGE_PLUGIN_FILE ),
			'new_version'  => $version,
			'url'          => $details_url,
			'package'      => $package_url,
			'tested'       => (string) get_bloginfo( 'version' ),
			'requires'     => self::REQUIRES_WP,
			'requires_php' => self::REQUIRES_PHP,
		);
	}

	/**
	 * Build a user agent for GitHub API requests.
	 *
	 * @return string
	 */
	private function build_user_agent(): string {
		$host = wp_parse_url( home_url( '/' ), PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			$host = 'wordpress-site';
		}

		return 'Photo-Collage-Updater/' . PHOTO_COLLAGE_VERSION . '; ' . $host;
	}
}
