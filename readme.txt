=== Photo Collage ===
Contributors:      ddegner
Tags:              block, photo collage, image gallery, overlapping images, visual design
Tested up to:      6.9
Stable tag:        0.5.3
Requires at least: 6.8
Requires PHP:      8.3
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Create stunning photo collages with overlapping images, advanced positioning controls, and professional layout presets.

== Description ==

Photo Collage transforms the way you display images in WordPress. Build beautiful, magazine-style photo collages with overlapping images, custom positioning, and professional layout presets—all within the familiar block editor interface.

**Built by a photographer for photographers.** This plugin is specifically designed for creating compelling photo story layouts that bring your visual narratives to life. Whether you're showcasing a wedding, documenting a journey, or telling any story through images, Photo Collage gives you the creative control you need.

Perfect for photographers, designers, and content creators who want to showcase images in creative, eye-catching arrangements without touching a single line of code.

**GitHub Repository:** [https://github.com/ddegner/photo-collage](https://github.com/ddegner/photo-collage)

= Source Code & Build Tools =

**All source code is included in this plugin and publicly available.**

This plugin uses modern JavaScript build tools to compile block editor code:
* **Source Files:** Located in the `src/` directory (included in this plugin)
* **Compiled Files:** Located in the `build/` directory
* **Build Tools:** npm and webpack (via @wordpress/scripts)
* **Build Configuration:** `package.json` and `package-lock.json` (included in this plugin)

**To build from source:**
1. Install Node.js and npm
2. Navigate to the plugin directory
3. Run `npm install` to install dependencies
4. Run `npm run build` to compile the assets

**Full source code repository:** [https://github.com/ddegner/photo-collage](https://github.com/ddegner/photo-collage)

= Key Features =

* **12 Professional Layout Presets** - Choose from Side by Side, Three Columns, Overlap Left/Right, Grid, Scatter, Hero Layered, Vertical Wave, Staggered Story, Offset Gallery, and Center Overlay
* **Advanced Image Controls** - Fine-tune each image with rotation, opacity, padding, margins, and z-index layering
* **Dual Positioning Modes** - Use relative positioning with margins for flexible layouts, or absolute positioning for pixel-perfect control
* **No Image Cropping** - Images are never cropped, preserving your entire composition
* **Mobile-First Responsive** - Enable automatic stacking on mobile devices with a single toggle
* **Accessibility Built-In** - Full support for alt text, image titles, descriptions, and decorative image marking
* **Live Visual Editing** - See exactly how your collage will look as you build it
* **Caption Support** - Add captions to individual images within your collage
* **Theme Compatible** - Works seamlessly with any WordPress theme that supports the block editor

= Perfect For =

* Photography portfolios
* Before/after comparisons
* Product showcases
* Travel blogs
* Creative storytelling
* Magazine-style layouts
* Event galleries

= How It Works =

1. Add the Photo Collage block to any post or page
2. Choose a Quick Layout preset or start from scratch
3. Upload your images and customize positioning, rotation, and opacity
4. Adjust responsive settings for mobile devices
5. Publish and enjoy your stunning photo collage

== Installation ==

= Automatic Installation =

1. Log in to your WordPress dashboard
2. Navigate to Plugins → Add New
3. Search for "Photo Collage"
4. Click "Install Now" and then "Activate"

= Manual Installation =

1. Download the plugin zip file
2. Log in to your WordPress dashboard
3. Navigate to Plugins → Add New → Upload Plugin
4. Choose the downloaded zip file and click "Install Now"
5. Activate the plugin through the 'Plugins' screen

= Getting Started =

1. Edit any post or page
2. Click the '+' button to add a new block
3. Search for "Photo Collage" and select it
4. Choose a Quick Layout preset or customize your own
5. Click on image placeholders to upload your photos
6. Use the sidebar settings to fine-tune positioning, rotation, and other properties

== Frequently Asked Questions ==

= Can I use this with any WordPress theme? =

Yes! Photo Collage is designed to work with any WordPress theme that supports the block editor (Gutenberg). The collages are built using standard WordPress blocks and will inherit your theme's styling.

= Is it responsive on mobile devices? =

Absolutely. You can enable the "Stack on Mobile" option to automatically arrange images vertically on screens smaller than 782px. This ensures your collages look great on all devices.

= How many images can I add to a collage? =

You can add as many images as you need. The Quick Layout presets range from 2 to 6 images, but you can manually add more images to any collage.

= Can I adjust the position of individual images? =

Yes! Each image has extensive positioning controls including margins, padding, absolute positioning (top/right/bottom/left), rotation, opacity, and z-index layering.

= Does it work with the classic editor? =

No, Photo Collage requires the block editor (Gutenberg). If you're still using the classic editor, you'll need to switch to the block editor to use this plugin.

= Can I convert existing collages if I uninstall the plugin? =

Yes! The plugin includes an uninstall settings page where you can choose to convert your Photo Collage blocks to either static HTML (preserving the visual layout) or core WordPress image blocks (preserving editability) before uninstalling.

= Are there any performance concerns? =

Photo Collage is optimized for performance. It uses modern CSS for positioning and transforms, avoiding heavy JavaScript. Images are loaded using WordPress's native media handling, which includes lazy loading support.

== Screenshots ==

1. The Photo Collage block in the editor with Quick Layout presets
2. Advanced positioning controls for individual images
3. Example of an overlapping photo collage on the front-end
4. Mobile-responsive stacking in action

== Changelog ==

= 0.5.3 =
* FIX: Fixed WordPress.org SVN tag deployment
* IMPROVEMENT: Removed obsolete development files
* IMPROVEMENT: Updated distribution configuration

= 0.5.2 =
* SECURITY: Enhanced security with comprehensive output escaping and nonce checks
* SECURITY: Added sanitization for all register_settings calls
* FIX: Fixed PHP syntax errors for better compatibility
* FIX: Fixed issue where pasting images replaced existing content
* IMPROVEMENT: Refactored caption settings for better control and placement
* IMPROVEMENT: Added composer linting to build process
* IMPROVEMENT: Fixed caption spacing consistency between editor and frontend

= 0.5.1 =
* IMPROVEMENT: Refactored PHP codebase to adhere to WordPress Coding Standards
* IMPROVEMENT: Improved code organization by splitting renderer and attribute classes
* DEV: Renamed class files for better PSR-4 and WP standard compliance
* DEV: Fixed various coding standard violations (whitespace, yoda conditions, doc blocks)

= 0.5.0 =
* IMPROVEMENT: Updated Collage Image block link options to mirror native WordPress Image block
* IMPROVEMENT: Added "Link to attachment page" and "Enlarge on click" (Lightbox) support
* IMPROVEMENT: Added toggle for image captions in the toolbar
* IMPROVEMENT: Rearranged toolbar buttons to match native standards
* FIX: Fixed fallback rendering logic for images with Lightbox enabled
* COMPATIBILITY: Tested up to WordPress 6.9

= 0.4.0 =
* MODERNIZATION: Updated requirements to PHP 8.3+ and WordPress 6.8+
* PERFORMANCE: Implemented strict typing and readonly classes for better performance
* SECURITY: Switched to WordPress HTML API for safer HTML generation
* DEV EXPERIENCE: Refactored codebase with modern PHP 8.3 features (Enums, Match expressions)
* COMPATIBILITY: Full support for latest WordPress features

= 0.3.0 =
* Added 12 professional Quick Layout presets (Side by Side, Three Columns, Overlap Left/Right, Grid, Scatter, Hero Layered, Vertical Wave, Staggered Story, Offset Gallery, Center Overlay)
* Added rotation and opacity controls for individual images
* Added caption, title, and description support for images
* Images never crop - designed for photographers to preserve entire compositions
* Improved mobile stacking with complete position reset
* Enhanced positioning controls with custom margin/padding UI
* Added minimum container height for better visibility in editor
* Simplified image styles for better performance
* Enhanced editor preview to match front-end rendering exactly
* Added uninstall settings page with block conversion options
* Removed unused server-side rendering code

= 0.2.0 =
* SECURITY: Added server-side rendering and sanitization to prevent XSS attacks
* SECURITY: Implemented CSS value validation to prevent injection attacks
* Fixed deprecated API usage (__experimentalUnitControl replaced with stable UnitControl)
* Added alt text validation for accessibility
* Added error handling for failed image loads
* Removed !important flags from CSS for better theme compatibility
* Updated mobile breakpoint to WordPress standard (782px)
* Requires WordPress 6.4+ and PHP 7.4+

= 0.1.0 =
* Initial release
* Basic photo collage functionality with overlapping images
* Z-index layering support
* Mobile responsive options
