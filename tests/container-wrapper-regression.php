<?php
/**
 * Regression coverage for container wrapper rendering and bundled patterns.
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

define( 'ABSPATH', dirname( __DIR__ ) . '/' );

require_once dirname( __DIR__ ) . '/includes/class-photo-collage-block-attributes.php';
require_once dirname( __DIR__ ) . '/includes/class-photo-collage-renderer.php';

/**
 * Escape a value for an HTML attribute in the standalone test environment.
 *
 * @param mixed $value Attribute value.
 * @return string
 */
function esc_attr( mixed $value ): string {
	return htmlspecialchars( (string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

/**
 * Encode JSON in the standalone test environment.
 *
 * @param mixed $value Value to encode.
 * @return string|false
 */
function wp_json_encode( mixed $value ): string|false {
	// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode -- This is the standalone WordPress stub.
	return json_encode( $value );
}

/**
 * Build block wrapper attributes in the standalone test environment.
 *
 * @param array<string, mixed> $attributes Wrapper attributes.
 * @return string
 */
function get_block_wrapper_attributes( array $attributes = array() ): string {
	$pairs = array();
	foreach ( $attributes as $name => $value ) {
		$pairs[] = sprintf( '%s="%s"', esc_attr( $name ), esc_attr( $value ) );
	}

	return implode( ' ', $pairs );
}

/**
 * Fail the regression test when a condition is false.
 *
 * @param bool   $condition Condition to evaluate.
 * @param string $message   Failure message.
 * @throws RuntimeException When the condition is false.
 * @return void
 */
function photo_collage_test_assert( bool $condition, string $message ): void {
	if ( ! $condition ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Test failure messages are local CLI output.
		throw new RuntimeException( $message );
	}
}

/**
 * Render the container template with isolated inputs.
 *
 * @param string               $render_file Render template path.
 * @param array<string, mixed> $block_attrs Block attributes.
 * @param string               $inner_html  Stored inner HTML.
 * @return string
 */
function photo_collage_test_render_container( string $render_file, array $block_attrs, string $inner_html ): string {
	$attributes = $block_attrs;
	$content    = $inner_html;
	$block      = null;

	ob_start();
	include $render_file;

	return (string) ob_get_clean();
}

/**
 * Count actual container elements in rendered markup.
 *
 * @param string $html Rendered HTML.
 * @return int
 */
function photo_collage_test_count_containers( string $html ): int {
	return preg_match_all(
		'/<div\b[^>]*class=(["\'])[^"\']*\bwp-block-photo-collage-container\b[^"\']*\1[^>]*>/i',
		$html
	);
}

$render_files = array(
	dirname( __DIR__ ) . '/src/blocks/container/render.php',
	dirname( __DIR__ ) . '/build/blocks/container/render.php',
);
$child_markup = '<div class="wp-block-photo-collage-image">Image</div>';
$fixed_attrs  = array(
	'containerHeight' => '900px',
	'heightMode'      => 'fixed',
);

foreach ( $render_files as $render_file ) {
	$canonical = photo_collage_test_render_container( $render_file, $fixed_attrs, $child_markup );
	photo_collage_test_assert(
		1 === photo_collage_test_count_containers( $canonical ),
		"Canonical markup rendered more than one container in {$render_file}."
	);
	photo_collage_test_assert(
		str_contains( $canonical, $child_markup ),
		"Canonical child markup was lost in {$render_file}."
	);

	$legacy_wrapper = '<div class="wp-block-photo-collage-container alignfull">' . $child_markup . '</div>';
	$legacy_render  = photo_collage_test_render_container( $render_file, $fixed_attrs, $legacy_wrapper );
	photo_collage_test_assert(
		1 === photo_collage_test_count_containers( $legacy_render ),
		"Legacy markup retained a nested container in {$render_file}."
	);
	photo_collage_test_assert(
		str_contains( $legacy_render, $child_markup ),
		"Legacy child markup was lost in {$render_file}."
	);

	$single_quoted_wrapper = "<div data-test='legacy' class='legacy wp-block-photo-collage-container'>{$child_markup}</div>";
	$single_quoted_render  = photo_collage_test_render_container( $render_file, $fixed_attrs, $single_quoted_wrapper );
	photo_collage_test_assert(
		1 === photo_collage_test_count_containers( $single_quoted_render ),
		"Single-quoted legacy markup retained a nested container in {$render_file}."
	);
}

$pattern_files = glob( dirname( __DIR__ ) . '/patterns/*.php' );
photo_collage_test_assert( false !== $pattern_files && array() !== $pattern_files, 'Expected bundled patterns.' );

foreach ( $pattern_files as $pattern_file ) {
	ob_start();
	include $pattern_file;
	$pattern_content = (string) ob_get_clean();

	photo_collage_test_assert(
		0 === photo_collage_test_count_containers( $pattern_content ),
		"Bundled pattern stores a redundant container wrapper: {$pattern_file}."
	);
}

echo "Container wrapper regression tests passed.\n";
