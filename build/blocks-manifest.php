<?php
// This file is generated. Do not modify it manually.
return array(
	'container' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'photo-collage/container',
		'version' => '0.5.3',
		'title' => 'Collage Container',
		'category' => 'design',
		'icon' => 'grid-view',
		'description' => 'A container for creating freeform photo layouts.',
		'supports' => array(
			'align' => array(
				'wide',
				'full'
			),
			'html' => false,
			'spacing' => array(
				'margin' => true,
				'padding' => true
			),
			'layout' => array(
				'allowEditing' => false
			)
		),
		'textdomain' => 'photo-collage',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'attributes' => array(
			'align' => array(
				'type' => 'string',
				'default' => 'wide'
			),
			'stackOnMobile' => array(
				'type' => 'boolean',
				'default' => true
			),
			'containerHeight' => array(
				'type' => 'string',
				'default' => ''
			),
			'backgroundType' => array(
				'type' => 'string',
				'default' => 'none',
				'enum' => array(
					'none',
					'color',
					'gradient',
					'tiling-image',
					'full-image'
				)
			),
			'backgroundColor' => array(
				'type' => 'string'
			),
			'gradient' => array(
				'type' => 'string'
			),
			'backgroundImageId' => array(
				'type' => 'number'
			),
			'backgroundImageUrl' => array(
				'type' => 'string'
			),
			'backgroundSize' => array(
				'type' => 'string',
				'default' => 'cover',
				'enum' => array(
					'cover',
					'contain',
					'auto'
				)
			),
			'backgroundPosition' => array(
				'type' => 'string',
				'default' => 'center center'
			),
			'backgroundRepeat' => array(
				'type' => 'boolean',
				'default' => false
			)
		),
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'frame' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'photo-collage/frame',
		'version' => '0.1.0',
		'title' => 'Collage Frame',
		'category' => 'design',
		'icon' => 'layout',
		'description' => 'A wrapper block for positioning any content within a Collage Container.',
		'supports' => array(
			'align' => true,
			'html' => false,
			'reusable' => false,
			'spacing' => array(
				'padding' => true
			)
		),
		'textdomain' => 'photo-collage',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'attributes' => array(
			'marginTop' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginRight' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginBottom' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginLeft' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'zIndex' => array(
				'type' => 'number',
				'default' => 1
			),
			'width' => array(
				'type' => 'string',
				'default' => '50%'
			),
			'height' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'useAbsolutePosition' => array(
				'type' => 'boolean',
				'default' => false
			),
			'top' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'right' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'bottom' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'left' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'rotation' => array(
				'type' => 'number',
				'default' => 0
			),
			'opacity' => array(
				'type' => 'number',
				'default' => 1
			),
			'backgroundType' => array(
				'type' => 'string',
				'default' => 'none',
				'enum' => array(
					'none',
					'color',
					'gradient',
					'tiling-image',
					'full-image'
				)
			),
			'backgroundColor' => array(
				'type' => 'string'
			),
			'gradient' => array(
				'type' => 'string'
			),
			'backgroundImageId' => array(
				'type' => 'number'
			),
			'backgroundImageUrl' => array(
				'type' => 'string'
			),
			'backgroundSize' => array(
				'type' => 'string',
				'default' => 'cover',
				'enum' => array(
					'cover',
					'contain',
					'auto'
				)
			),
			'backgroundPosition' => array(
				'type' => 'string',
				'default' => 'center center'
			),
			'backgroundRepeat' => array(
				'type' => 'boolean',
				'default' => false
			)
		)
	),
	'image' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'photo-collage/image',
		'version' => '0.5.1',
		'title' => 'Collage Image',
		'category' => 'design',
		'icon' => 'format-image',
		'description' => 'An image block with advanced positioning controls.',
		'supports' => array(
			'align' => true,
			'html' => false,
			'interactivity' => true,
			'lightbox' => array(
				'allowEditing' => true
			),
			'spacing' => array(
				'padding' => true
			)
		),
		'textdomain' => 'photo-collage',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'attributes' => array(
			'url' => array(
				'type' => 'string'
			),
			'alt' => array(
				'type' => 'string',
				'default' => ''
			),
			'isDecorative' => array(
				'type' => 'boolean',
				'default' => false
			),
			'id' => array(
				'type' => 'number'
			),
			'marginTop' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginRight' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginBottom' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'marginLeft' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'zIndex' => array(
				'type' => 'number',
				'default' => 1
			),
			'width' => array(
				'type' => 'string',
				'default' => '50%'
			),
			'height' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'useAbsolutePosition' => array(
				'type' => 'boolean',
				'default' => false
			),
			'top' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'right' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'bottom' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'left' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'objectFit' => array(
				'type' => 'string',
				'default' => 'contain'
			),
			'rotation' => array(
				'type' => 'number',
				'default' => 0
			),
			'opacity' => array(
				'type' => 'number',
				'default' => 1
			),
			'showCaption' => array(
				'type' => 'boolean',
				'default' => true
			),
			'caption' => array(
				'type' => 'string',
				'default' => ''
			),
			'captionAlign' => array(
				'type' => 'string',
				'default' => 'left'
			),
			'captionWidth' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'captionPlacement' => array(
				'type' => 'string',
				'default' => 'bottom-left',
				'enum' => array(
					'top-left',
					'top-center',
					'top-right',
					'left-top',
					'left-center',
					'left-bottom',
					'right-top',
					'right-center',
					'right-bottom',
					'bottom-left',
					'bottom-center',
					'bottom-right'
				)
			),
			'imgClass' => array(
				'type' => 'string',
				'default' => ''
			),
			'imgStyle' => array(
				'type' => 'string',
				'default' => ''
			),
			'captionClass' => array(
				'type' => 'string',
				'default' => ''
			),
			'captionStyle' => array(
				'type' => 'string',
				'default' => ''
			),
			'title' => array(
				'type' => 'string',
				'default' => ''
			),
			'description' => array(
				'type' => 'string',
				'default' => ''
			),
			'href' => array(
				'type' => 'string'
			),
			'linkTarget' => array(
				'type' => 'string'
			),
			'rel' => array(
				'type' => 'string'
			),
			'linkClass' => array(
				'type' => 'string'
			),
			'linkDestination' => array(
				'type' => 'string',
				'default' => 'none'
			),
			'backgroundType' => array(
				'type' => 'string',
				'default' => 'none',
				'enum' => array(
					'none',
					'color',
					'gradient',
					'tiling-image',
					'full-image'
				)
			),
			'backgroundColor' => array(
				'type' => 'string'
			),
			'gradient' => array(
				'type' => 'string'
			),
			'backgroundImageId' => array(
				'type' => 'number'
			),
			'backgroundImageUrl' => array(
				'type' => 'string'
			),
			'backgroundSize' => array(
				'type' => 'string',
				'default' => 'cover',
				'enum' => array(
					'cover',
					'contain',
					'auto'
				)
			),
			'backgroundPosition' => array(
				'type' => 'string',
				'default' => 'center center'
			),
			'backgroundRepeat' => array(
				'type' => 'boolean',
				'default' => false
			)
		)
	)
);
