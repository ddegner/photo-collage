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

/**
 * Assert two floats match within a tolerance.
 *
 * @param float  $expected Expected value.
 * @param float  $actual   Actual value.
 * @param string $message  Failure message.
 * @return void
 */
function photo_collage_test_assert_close( float $expected, float $actual, string $message ): void {
	photo_collage_test_assert(
		abs( $expected - $actual ) < 0.01,
		$message . " (expected {$expected}, got {$actual})"
	);
}

/**
 * Build an absolute child block array for constraint tests.
 *
 * @param string               $block_name Block name.
 * @param array<string, mixed> $attrs      Block attributes.
 * @return array<string, mixed>
 */
function photo_collage_test_child( string $block_name, array $attrs ): array {
	return array(
		'blockName' => $block_name,
		'attrs'     => array_merge( array( 'useAbsolutePosition' => true ), $attrs ),
	);
}

// --- Auto-height constraint solver ---------------------------------------

// Percentage top over a pixel-height base keeps the closed form b / (1 - p).
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/frame',
			array(
				'width'  => '40%',
				'height' => '300px',
				'top'    => '20%',
			)
		),
	)
);
photo_collage_test_assert( 1 === count( $constraints ), 'Percent-top frame must yield one constraint.' );
photo_collage_test_assert_close( 0.0, $constraints[0][0], 'Percent-top frame slope term must stay zero.' );
photo_collage_test_assert_close( 375.0, $constraints[0][1], 'Percent-top frame constraint must solve 300 / 0.8.' );

// Pixel offsets stay additive with no factor applied.
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/frame',
			array(
				'width'  => '40%',
				'height' => '300px',
				'top'    => '100px',
			)
		),
	)
);
photo_collage_test_assert_close( 400.0, $constraints[0][1], 'Pixel-top frame constraint must stay additive.' );

// A percentage height folds into the factor: top 100px + height 30% needs
// height >= 100 / (1 - 0.3).
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/frame',
			array(
				'width'  => '40%',
				'height' => '30%',
				'top'    => '100px',
			)
		),
	)
);
photo_collage_test_assert( 1 === count( $constraints ), 'Percent-height frame with a pixel top must yield a constraint.' );
photo_collage_test_assert_close( 142.857, $constraints[0][1], 'Percent-height factor must divide the pixel offset.' );

// A fully percentage-vertical child cannot constrain the container, and a
// percentage-height image must never fall back to attachment metadata (this
// stub environment has no wp_get_attachment_metadata, so a regression here
// is a fatal error, not just a wrong number).
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/image',
			array(
				'id'          => 5,
				'aspectRatio' => 'auto',
				'width'       => '50%',
				'height'      => '25%',
				'top'         => '10%',
			)
		),
	)
);
photo_collage_test_assert( array() === $constraints, 'Fully percentage-vertical children must yield no constraint.' );

// Combined fractions at or past the solver guard are skipped entirely.
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/frame',
			array(
				'width'  => '40%',
				'height' => '300px',
				'top'    => '99.6%',
			)
		),
	)
);
photo_collage_test_assert( array() === $constraints, 'Offsets past the 99.5% guard must yield no constraint.' );

// Bottom anchors share the same combined factor.
$constraints = Photo_Collage_Renderer::get_auto_height_constraints(
	array(
		photo_collage_test_child(
			'photo-collage/frame',
			array(
				'width'  => '40%',
				'height' => '300px',
				'bottom' => '10%',
			)
		),
	)
);
photo_collage_test_assert_close( 333.333, $constraints[0][1], 'Bottom-anchored constraint must solve 300 / 0.9.' );

echo "Container wrapper regression tests passed.\n";
