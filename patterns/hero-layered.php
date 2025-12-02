<?php
/**
 * Title: Hero Layered
 * Slug: photo-collage/hero-layered
 * Categories: gallery, featured
 * Description: A large hero image with a smaller layered image.
 *
 * @package PhotoCollage
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:photo-collage/container -->
<div class="wp-block-photo-collage-container" style="min-height: 200px;">
	<!-- wp:photo-collage/image {"width":"70%","marginLeft":"0%","marginTop":"0%","zIndex":1} /-->
	<!-- wp:photo-collage/image {"width":"40%","marginLeft":"55%","marginTop":"-20%","zIndex":2} /-->
</div>
<!-- /wp:photo-collage/container -->

