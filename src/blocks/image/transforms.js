/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

const transforms = {
    from: [
        {
            type: 'block',
            blocks: ['core/image'],
            transform: (attributes) => {
                return createBlock('photo-collage/image', {
                    url: attributes.url,
                    alt: attributes.alt,
                    id: attributes.id,
                    title: attributes.title,
                    caption: attributes.caption,
                    href: attributes.href,
                    linkTarget: attributes.linkTarget,
                    rel: attributes.rel,
                    linkClass: attributes.linkClass,
                    // Default collage attributes
                    width: '50%',
                    height: 'auto',
                });
            },
        },
    ],
    to: [
        {
            type: 'block',
            blocks: ['core/image'],
            transform: (attributes) => {
                return createBlock('core/image', {
                    url: attributes.url,
                    alt: attributes.alt,
                    id: attributes.id,
                    title: attributes.title,
                    caption: attributes.caption,
                    href: attributes.href,
                    linkTarget: attributes.linkTarget,
                    rel: attributes.rel,
                    linkClass: attributes.linkClass,
                });
            },
        },
    ],
};

export default transforms;
