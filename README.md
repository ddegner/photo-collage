# Photo Collage WordPress Plugin

[![WordPress](https://img.shields.io/badge/WordPress-6.8%2B-blue.svg)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-purple.svg)](https://php.net/)
[![License](https://img.shields.io/badge/License-GPL%20v2-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

Create stunning photo collages with overlapping images, advanced positioning controls, and professional layout presets—all within the WordPress block editor.

![Photo Collage Plugin Banner](https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=Photo+Collage+WordPress+Plugin)

## 🎯 Overview

**Built by a photographer for photographers.** Photo Collage transforms the way you display images in WordPress. Build beautiful, magazine-style photo collages with overlapping images, custom positioning, and professional layout presets—all within the familiar block editor interface.

Perfect for photographers, designers, and content creators who want to showcase images in creative, eye-catching arrangements without touching a single line of code.

## ✨ Key Features

- **12 Professional Layout Presets** - Choose from Side by Side, Three Columns, Overlap Left/Right, Grid, Scatter, Hero Layered, Vertical Wave, Staggered Story, Offset Gallery, and Center Overlay
- **Advanced Image Controls** - Fine-tune each image with rotation, opacity, padding, margins, and z-index layering
- **Dual Positioning Modes** - Use relative positioning with margins for flexible layouts, or absolute positioning for pixel-perfect control
- **No Image Cropping** - Images are never cropped, preserving your entire composition
- **Mobile-First Responsive** - Enable automatic stacking on mobile devices with a single toggle
- **Accessibility Built-In** - Full support for alt text, image titles, descriptions, and decorative image marking
- **Live Visual Editing** - See exactly how your collage will look as you build it
- **Caption Support** - Add captions to individual images within your collage
- **Theme Compatible** - Works seamlessly with any WordPress theme that supports the block editor

## 🎨 Perfect For

- Photography portfolios
- Before/after comparisons
- Product showcases
- Travel blogs
- Creative storytelling
- Magazine-style layouts
- Event galleries

## 🚀 Installation

### Automatic Installation (WordPress.org)

1. Log in to your WordPress dashboard
2. Navigate to **Plugins → Add New**
3. Search for "Photo Collage"
4. Click **Install Now** and then **Activate**

### Manual Installation

1. Download the plugin zip file from the [releases page](https://github.com/ddegner/photo-collage/releases)
2. Log in to your WordPress dashboard
3. Navigate to **Plugins → Add New → Upload Plugin**
4. Choose the downloaded zip file and click **Install Now**
5. Activate the plugin through the 'Plugins' screen

### From Source

```bash
# Clone the repository
git clone https://github.com/ddegner/photo-collage.git

# Navigate to the plugin directory
cd photo-collage

# Install dependencies
npm install

# Build the plugin
npm run build
```

## 📖 Getting Started

1. Edit any post or page
2. Click the **+** button to add a new block
3. Search for **"Photo Collage"** and select it
4. Choose a Quick Layout preset or customize your own
5. Click on image placeholders to upload your photos
6. Use the sidebar settings to fine-tune positioning, rotation, and other properties

## 🛠️ Development

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- WordPress 6.8 or higher
- PHP 8.1 or higher

### Build Commands

```bash
# Start development mode with hot reload
npm start

# Build for production
npm run build

# Format code
npm run format

# Lint JavaScript
npm run lint:js

# Lint CSS
npm run lint:css

# Create plugin zip file
npm run plugin-zip

# Update WordPress packages
npm run packages-update
```

### Project Structure

```
photo-collage/
├── build/                  # Compiled assets (generated)
├── includes/               # PHP classes and server-side code
│   ├── class-photo-collage-admin-settings.php
│   ├── class-photo-collage-block-converter.php
│   ├── class-photo-collage-renderer.php
│   ├── class-photo-collage-block-attributes.php
│   ├── class-photo-collage-assets.php
│   └── enums.php
├── src/                    # Source files
│   ├── blocks/             # Block definitions
│   │   ├── container/      # Collage container block
│   │   └── image/          # Collage image block
│   └── editor.scss         # Editor styles
├── patterns/               # Block patterns
├── photo-collage.php       # Main plugin file
├── uninstall.php           # Uninstall handler
└── readme.txt              # WordPress.org readme
```

## 📋 Requirements

- **WordPress:** 6.8 or higher
- **PHP:** 8.3 or higher
- **Block Editor:** Required (does not work with Classic Editor)

## ❓ FAQ

### Can I use this with any WordPress theme?

Yes! Photo Collage is designed to work with any WordPress theme that supports the block editor (Gutenberg). The collages are built using standard WordPress blocks and will inherit your theme's styling.

### Is it responsive on mobile devices?

Absolutely. You can enable the **"Stack on Mobile"** option to automatically arrange images vertically on screens smaller than 782px. This ensures your collages look great on all devices.

### How many images can I add to a collage?

You can add as many images as you need. The Quick Layout presets range from 2 to 6 images, but you can manually add more images to any collage.

### Can I adjust the position of individual images?

Yes! Each image has extensive positioning controls including margins, padding, absolute positioning (top/right/bottom/left), rotation, opacity, and z-index layering.

### Can I convert existing collages if I uninstall the plugin?

Yes! The plugin includes an uninstall settings page where you can choose to convert your Photo Collage blocks to either static HTML (preserving the visual layout) or core WordPress image blocks (preserving editability) before uninstalling.

### Are there any performance concerns?

Photo Collage is optimized for performance. It uses modern CSS for positioning and transforms, avoiding heavy JavaScript. Images are loaded using WordPress's native media handling, which includes lazy loading support.

## 📝 Changelog

### 0.5.1
- **IMPROVEMENT:** Refactored PHP codebase to adhere to WordPress Coding Standards
- **IMPROVEMENT:** Improved code organization by splitting renderer and attribute classes
- **DEV:** Renamed class files for better PSR-4 and WP standard compliance
- **DEV:** Fixed various coding standard violations (whitespace, yoda conditions, doc blocks)

### 0.5.0
- **IMPROVEMENT:** Updated Collage Image block link options to mirror native WordPress Image block
- **IMPROVEMENT:** Added "Link to attachment page" and "Enlarge on click" (Lightbox) support
- **IMPROVEMENT:** Added toggle for image captions in the toolbar
- **IMPROVEMENT:** Rearranged toolbar buttons to match native standards
- **FIX:** Fixed fallback rendering logic for images with Lightbox enabled
- **COMPATIBILITY:** Tested up to WordPress 6.9

### 0.4.0
- **MODERNIZATION:** Updated requirements to PHP 8.3+ and WordPress 6.8+
- **PERFORMANCE:** Implemented strict typing and readonly classes for better performance
- **SECURITY:** Switched to WordPress HTML API for safer HTML generation
- **DEV EXPERIENCE:** Refactored codebase with modern PHP 8.3 features (Enums, Match expressions)
- **COMPATIBILITY:** Full support for latest WordPress features

### 0.3.0
- Added 12 professional Quick Layout presets
- Added rotation and opacity controls for individual images
- Added caption, title, and description support for images
- Images never crop - designed for photographers to preserve entire compositions
- Improved mobile stacking with complete position reset
- Enhanced positioning controls with custom margin/padding UI
- Added minimum container height for better visibility in editor
- Simplified image styles for better performance
- Enhanced editor preview to match front-end rendering exactly
- Added uninstall settings page with block conversion options
- Removed unused server-side rendering code

### 0.2.0
- **SECURITY:** Added server-side rendering and sanitization to prevent XSS attacks
- **SECURITY:** Implemented CSS value validation to prevent injection attacks
- Fixed deprecated API usage (`__experimentalUnitControl` replaced with stable `UnitControl`)
- Added alt text validation for accessibility
- Added error handling for failed image loads
- Removed `!important` flags from CSS for better theme compatibility
- Updated mobile breakpoint to WordPress standard (782px)
- Requires WordPress 6.4+ and PHP 7.4+

### 0.1.0
- Initial release
- Basic photo collage functionality with overlapping images
- Z-index layering support
- Mobile responsive options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GPL v2 or later - see the [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html) file for details.

## 👤 Author

**David Degner**  
[daviddegner.com](https://www.daviddegner.com)

## 🔗 Links

- [GitHub Repository](https://github.com/ddegner/photo-collage)
- [WordPress Plugin Directory](https://wordpress.org/plugins/photo-collage/) *(coming soon)*
- [Report Issues](https://github.com/ddegner/photo-collage/issues)

---

Made with ❤️ for photographers and visual storytellers
