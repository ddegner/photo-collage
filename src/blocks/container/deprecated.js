/**
 * Block deprecations for the Photo Collage Container block.
 *
 * Migrate legacy custom color/gradient background attributes to native styles.
 */

import { InnerBlocks } from '@wordpress/block-editor';

const hasStringValue = ( value ) =>
	typeof value === 'string' && value.trim() !== '';

const v1 = {
	attributes: {
		align: {
			type: 'string',
			default: 'wide',
		},
		stackOnMobile: {
			type: 'boolean',
			default: true,
		},
		containerHeight: {
			type: 'string',
			default: '',
		},
		heightMode: {
			type: 'string',
			default: 'fixed',
		},
		backgroundType: {
			type: 'string',
			default: 'none',
		},
		backgroundColor: {
			type: 'string',
		},
		gradient: {
			type: 'string',
		},
		backgroundImageId: {
			type: 'number',
		},
		backgroundImageUrl: {
			type: 'string',
		},
		backgroundSize: {
			type: 'string',
			default: 'cover',
		},
		backgroundPosition: {
			type: 'string',
			default: 'center center',
		},
		backgroundRepeat: {
			type: 'boolean',
			default: false,
		},
		style: {
			type: 'object',
		},
	},

	isEligible( attributes ) {
		return (
			( attributes.backgroundType === 'color' &&
				hasStringValue( attributes.backgroundColor ) ) ||
			( attributes.backgroundType === 'gradient' &&
				hasStringValue( attributes.gradient ) )
		);
	},

	migrate( attributes ) {
		const { backgroundColor, gradient, ...restAttributes } = attributes;
		const style = {
			...( restAttributes.style || {} ),
		};
		const color = {
			...( style.color || {} ),
		};

		let backgroundMigrated = false;

		if (
			! hasStringValue( color.background ) &&
			attributes.backgroundType === 'color' &&
			hasStringValue( backgroundColor )
		) {
			color.background = backgroundColor;
			backgroundMigrated = true;
		}

		if (
			! hasStringValue( color.gradient ) &&
			attributes.backgroundType === 'gradient' &&
			hasStringValue( gradient )
		) {
			color.gradient = gradient;
			backgroundMigrated = true;
		}

		if ( Object.keys( color ).length > 0 ) {
			style.color = color;
		}

		const migratedAttributes = {
			...restAttributes,
			style,
		};

		if (
			backgroundMigrated &&
			( migratedAttributes.backgroundType === 'color' ||
				migratedAttributes.backgroundType === 'gradient' )
		) {
			migratedAttributes.backgroundType = 'none';
		}

		return migratedAttributes;
	},

	save() {
		return <InnerBlocks.Content />;
	},
};

export default [ v1 ];
