<?php
/**
 * Title: Center Overlay
 * Slug: photo-collage/center-overlay
 * Categories: gallery, featured
 * Description: An image overlaid in the center of another.
 *
 * @package PhotoCollage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:photo-collage/container {"heightMode":"auto"} -->
	<!-- wp:photo-collage/image {"width":"100%","zIndex":1} /-->
	<!-- wp:photo-collage/image {"width":"50%","useAbsolutePosition":true,"top":"25%","left":"25%","zIndex":2} /-->
<!-- /wp:photo-collage/container -->
