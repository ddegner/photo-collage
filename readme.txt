=== Photo Collage ===
Contributors:      The WordPress Contributors
Tags:              block
Tested up to:      6.7
Stable tag:        0.1.0
Requires at least: 6.4
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A block for creating photo collages with overlapping images.

== Description ==

Create beautiful photo collages with overlapping images using an intuitive block editor interface.

**Features:**

* **Quick Layout Presets** - Start with pre-configured layouts (side-by-side, overlapping, grid)
* **Flexible Positioning** - Use relative margins or absolute positioning for precise control
* **Image Fit Options** - Choose between cover (crop to fit) or contain (fit without cropping)
* **Mobile Responsive** - Automatically stack images on mobile devices
* **Z-Index Control** - Layer images in any order
* **Accessibility Ready** - Full alt text and decorative image support
* **Visual Editor** - See your collage as you build it

== Installation ==

This section describes how to install the plugin and get it working.

e.g.

1. Upload the plugin files to the `/wp-content/plugins/.` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress


== Frequently Asked Questions ==

= A question that someone might have =

An answer to that question.

= What about foo bar? =

Answer to foo bar dilemma.

== Screenshots ==

1. This screen shot description corresponds to screenshot-1.(png|jpg|jpeg|gif). Note that the screenshot is taken from
the /assets directory or the directory that contains the stable readme.txt (tags or trunk). Screenshots in the /assets
directory take precedence. For example, `/assets/screenshot-1.png` would win over `/tags/4.3/screenshot-1.png`
(or jpg, jpeg, gif).
2. This is the second screen shot

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


