=== Photo Collage ===
Contributors:      The WordPress Contributors
Tags:              block
Tested up to:      6.7
Stable tag:        0.3.0
Requires at least: 6.4
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A block for creating photo collages with overlapping images.

== Description ==

Create beautiful photo collages with overlapping images using an intuitive block editor interface. This plugin adds a "Photo Collage" block to your WordPress editor, allowing you to easily arrange images in creative layouts without writing any code.

**Features:**

* **Quick Layout Presets** - Start with pre-configured layouts (side-by-side, overlapping, grid, scatter, and more).
* **Flexible Positioning** - Use relative margins or absolute positioning for precise control.
* **Image Fit Options** - Choose between cover (crop to fit) or contain (fit without cropping).
* **Mobile Responsive** - Automatically stack images on mobile devices.
* **Z-Index Control** - Layer images in any order.
* **Accessibility Ready** - Full alt text and decorative image support.
* **Visual Editor** - See your collage as you build it.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/photo-collage` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to a post or page and add the "Photo Collage" block.

== Frequently Asked Questions ==

= Can I use this with any theme? =

Yes, the Photo Collage block is designed to work with any WordPress theme that supports the block editor.

= Is it responsive? =

Yes, you can enable the "Stack on Mobile" option to automatically arrange images vertically on smaller screens.

== Screenshots ==

1. The Photo Collage block in the editor.
2. Selecting a Quick Layout preset.

== Changelog ==

= 0.3.0 =
* Added quick layout presets (side-by-side, overlap, grid)
* Added object-fit control to prevent image distortion
* Improved mobile stacking with complete position reset
* Removed unused server-side rendering code
* Added minimum container height for better visibility
* Simplified image styles for better performance
* Enhanced editor preview to match front-end exactly

= 0.2.0 =
* SECURITY: Added server-side rendering and sanitization to prevent XSS attacks
* SECURITY: Implemented CSS value validation to prevent injection attacks
* Fixed deprecated API usage (__experimentalUnitControl replaced with stable UnitControl)
* Added alt text validation for accessibility
* Added error handling for failed image loads
* Removed !important flags from CSS for better theme compatibility
* Updated mobile breakpoint to WordPress standard (782px)
* Requires WordPress 6.8+ and PHP 8.0+

= 0.1.0 =
* Release


