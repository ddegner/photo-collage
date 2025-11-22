<?php
// This file is generated. Do not modify it manually.
return array(
	'container' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'photo-collage/container',
		'version' => '0.4.0',
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
			)
		),
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'image' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'photo-collage/image',
		'version' => '0.4.0',
		'title' => 'Collage Image',
		'category' => 'design',
		'icon' => 'format-image',
		'description' => 'An image block with advanced positioning controls.',
		'parent' => array(
			'photo-collage/container'
		),
		'supports' => array(
			'html' => false
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
			'id' => array(
				'type' => 'number'
			),
			'isDecorative' => array(
				'type' => 'boolean',
				'default' => false
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
			'paddingTop' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'paddingRight' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'paddingBottom' => array(
				'type' => 'string',
				'default' => '0%'
			),
			'paddingLeft' => array(
				'type' => 'string',
				'default' => '0%'
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
			'caption' => array(
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
			)
		)
	)
);
