<?php
/**
 * Enums for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enum for uninstall preference options
 */
enum Photo_Collage_Uninstall_Preference: string {



	case STATIC_HTML = 'static_html';
	case CORE_BLOCKS = 'core_blocks';
	case KEEP_AS_IS  = 'keep_as_is';

	/**
	 * Create enum from string, defaulting to STATIC_HTML
	 *
	 * @param string $value Enum value.
	 * @return self
	 */
	public static function from_string( string $value ): self {
		return self::tryFrom( $value ) ?? self::STATIC_HTML;
	}
}
