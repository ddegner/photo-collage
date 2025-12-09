<?php
/**
 * Title: Scatter Collage
 * Slug: photo-collage/scatter
 * Categories: gallery, featured
 * Description: A scattered layout of 3 images.
 *
 * @package PhotoCollage
 */

if (!defined('ABSPATH')) {
	exit;
}
?>
<!-- wp:photo-collage/container {"containerHeight":"600px"} -->
<div class="wp-block-photo-collage-container" style="height: 600px; min-height: 200px;">
	<!-- wp:photo-collage/image {"width":"40%","useAbsolutePosition":true,"top":"5%","left":"10%","rotation":-5,"zIndex":1} /-->
	<!-- wp:photo-collage/image {"width":"40%","useAbsolutePosition":true,"top":"35%","left":"15%","rotation":5,"zIndex":2} /-->
	<!-- wp:photo-collage/image {"width":"35%","useAbsolutePosition":true,"top":"60%","left":"35%","rotation":0,"zIndex":3} /-->
</div>
<!-- /wp:photo-collage/container -->