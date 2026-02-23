<?php
/**
 * Release channel enum for Photo Collage plugin.
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enum for release channel options.
 */
enum Photo_Collage_Release_Channel: string {
	case STABLE = 'stable';
	case BETA   = 'beta';

	/**
	 * Create enum from string, defaulting to STABLE.
	 *
	 * @param string $value Enum value.
	 * @return self
	 */
	public static function from_string( string $value ): self {
		return self::tryFrom( $value ) ?? self::STABLE;
	}
}
