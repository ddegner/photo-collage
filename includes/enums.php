<?php
/**
 * Enums for Photo Collage Plugin
 *
 * @package PhotoCollage
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enum for uninstall preference options
 */
enum UninstallPreference: string
{
    case STATIC_HTML = 'static_html';
    case CORE_BLOCKS = 'core_blocks';
    case KEEP_AS_IS = 'keep_as_is';

    public static function fromString(string $value): self
    {
        return self::tryFrom($value) ?? self::STATIC_HTML;
    }
}


