import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useBlockProps, InspectorControls, MediaPlaceholder, BlockControls, MediaReplaceFlow, RichText } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, ToggleControl, __experimentalUnitControl as UnitControl, Button } from '@wordpress/components';
import './editor.scss';

const BoxControl = ({ values, onChange, centerLabel = 'M', isDashed = true }) => (
	<div className="photo-collage-box-control">
		{/* Top */}
		<div className="photo-collage-box-row is-center">
			<UnitControl
				label={__('Top', 'photo-collage')}
				labelPosition="top"
				value={values.top}
				onChange={(value) => onChange('top', value)}
				className="photo-collage-unit-control-small"
			/>
		</div>

		{/* Middle row: Left, Center symbol, Right */}
		<div className="photo-collage-box-row is-space-between">
			<UnitControl
				label={__('Left', 'photo-collage')}
				labelPosition="top"
				value={values.left}
				onChange={(value) => onChange('left', value)}
				className="photo-collage-unit-control-small"
			/>

			<div className={`photo-collage-box-center ${isDashed ? 'is-dashed' : 'is-solid'}`}>
				{centerLabel}
			</div>

			<UnitControl
				label={__('Right', 'photo-collage')}
				labelPosition="top"
				value={values.right}
				onChange={(value) => onChange('right', value)}
				className="photo-collage-unit-control-small"
			/>
		</div>

		{/* Bottom */}
		<div className="photo-collage-box-row is-center">
			<UnitControl
				label={__('Bottom', 'photo-collage')}
				labelPosition="top"
				value={values.bottom}
				onChange={(value) => onChange('bottom', value)}
				className="photo-collage-unit-control-small"
			/>
		</div>
	</div>
);

export default function Edit({ attributes, setAttributes, isSelected }) {
    const {
        url,
        alt,
        id,
        isDecorative,
        useAbsolutePosition,
        top,
        right,
        bottom,
        left,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        zIndex,
        width,
        height,
        objectFit = 'cover',
        rotation = 0,
        opacity = 1,
        caption = '',
        title = '',
        description = ''
    } = attributes;

    const onSelectImage = (media) => {
        if (!media || !media.url) {
            return;
        }

        setAttributes({
            url: media.url,
            alt: media.alt || '',
            id: media.id,
            title: media.title || '',
            caption: media.caption || '',
            description: media.description || '',
        });
    };

    // Auto-recover URL from ID if missing (fixes legacy data issue)
    const media = useSelect(
        (select) => (id && !url ? select('core').getMedia(id) : null),
        [id, url]
    );

    useEffect(() => {
        if (media && media.source_url) {
            setAttributes({
                url: media.source_url,
                alt: media.alt_text || alt,
                title: media.title?.rendered || title,
                caption: media.caption?.rendered || caption,
            });
        }
    }, [media, url, alt, title, caption]);

    const onChangeAlt = (newAlt) => {
        setAttributes({ alt: newAlt });
    };

    const onToggleDecorative = () => {
        setAttributes({
            isDecorative: !isDecorative,
            alt: !isDecorative ? '' : alt,
        });
    };

    const blockProps = useBlockProps({
        style: {
            ...(useAbsolutePosition ? {
                position: 'absolute',
                top: top && top !== 'auto' ? top : undefined,
                right: right && right !== 'auto' ? right : undefined,
                bottom: bottom && bottom !== 'auto' ? bottom : undefined,
                left: left && left !== 'auto' ? left : undefined,
            } : {
                position: 'relative',
                marginTop,
                marginRight,
                marginBottom,
                marginLeft,
            }),
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            width,
            height,
            zIndex,
            transform: `rotate(${rotation}deg)`,
            opacity,

        },
    });

    if (!url) {
        return (
            <div {...blockProps}>
                <MediaPlaceholder
                    icon="format-image"
                    onSelect={onSelectImage}
                    accept="image/*"
                    allowedTypes={['image']}
                    multiple={false}
                    labels={{ title: __('Collage Image', 'photo-collage') }}
                />
            </div>
        );
    }

    return (
        <>
            <BlockControls>
                <MediaReplaceFlow
                    mediaId={id}
                    mediaURL={url}
                    allowedTypes={['image']}
                    accept="image/*"
                    onSelect={onSelectImage}
                />
            </BlockControls>
            <InspectorControls>
                <PanelBody title={__('Dimensions', 'photo-collage')} initialOpen={true}>
                    <UnitControl
                        label={__('Width', 'photo-collage')}
                        value={width}
                        onChange={(value) => setAttributes({ width: value })}
                    />
                    <UnitControl
                        label={__('Height', 'photo-collage')}
                        value={height}
                        onChange={(value) => setAttributes({ height: value })}
                    />

                    <ToggleControl
                        label={__('Cover (crop to fit)', 'photo-collage')}
                        help={objectFit === 'cover'
                            ? __('Image will fill the space and crop if needed.', 'photo-collage')
                            : __('Image will fit within the space without cropping.', 'photo-collage')
                        }
                        checked={objectFit === 'cover'}
                        onChange={(value) => setAttributes({ objectFit: value ? 'cover' : 'contain' })}
                    />
                </PanelBody>

                <PanelBody title={__('Positioning', 'photo-collage')} initialOpen={false}>
                    <ToggleControl
                        label={__('Use Absolute Positioning', 'photo-collage')}
                        help={__('Position image relative to container edges instead of using margins.', 'photo-collage')}
                        checked={useAbsolutePosition}
                        onChange={(value) => setAttributes({ useAbsolutePosition: value })}
                    />
                    {useAbsolutePosition && (
                        <>
                            <p className="photo-collage-help-text">
                                {__('Click an anchor point to pin the image to that corner.', 'photo-collage')}
                            </p>
                            <div className="photo-collage-anchor-control">
                                <div className="photo-collage-anchor-grid">
                                    {/* Top Left */}
                                    <Button
                                        className={`photo-collage-anchor-btn ${top !== 'auto' && left !== 'auto' ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ top: '0%', left: '0%', bottom: 'auto', right: 'auto' })}
                                        icon="arrow-left-alt2"
                                        style={{ transform: 'rotate(45deg)' }}
                                        label={__('Top Left', 'photo-collage')}
                                    />
                                    {/* Top Right */}
                                    <Button
                                        className={`photo-collage-anchor-btn ${top !== 'auto' && right !== 'auto' ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ top: '0%', right: '0%', bottom: 'auto', left: 'auto' })}
                                        icon="arrow-up-alt2"
                                        style={{ transform: 'rotate(45deg)' }}
                                        label={__('Top Right', 'photo-collage')}
                                    />
                                    {/* Bottom Left */}
                                    <Button
                                        className={`photo-collage-anchor-btn ${bottom !== 'auto' && left !== 'auto' ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ bottom: '0%', left: '0%', top: 'auto', right: 'auto' })}
                                        icon="arrow-down-alt2"
                                        style={{ transform: 'rotate(45deg)' }}
                                        label={__('Bottom Left', 'photo-collage')}
                                    />
                                    {/* Bottom Right */}
                                    <Button
                                        className={`photo-collage-anchor-btn ${bottom !== 'auto' && right !== 'auto' ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ bottom: '0%', right: '0%', top: 'auto', left: 'auto' })}
                                        icon="arrow-right-alt2"
                                        style={{ transform: 'rotate(45deg)' }}
                                        label={__('Bottom Right', 'photo-collage')}
                                    />
                                </div>
                            </div>

                            <div className="photo-collage-position-controls">
                                <div className="photo-collage-position-row is-center">
                                    <UnitControl
                                        label={__('Top', 'photo-collage')}
                                        value={top}
                                        onChange={(value) => {
                                            const newValue = value || 'auto';
                                            setAttributes({
                                                top: newValue,
                                                bottom: newValue !== 'auto' ? 'auto' : bottom
                                            });
                                        }}
                                    />
                                </div>
                                <div className="photo-collage-position-row is-space-between">
                                    <UnitControl
                                        label={__('Left', 'photo-collage')}
                                        value={left}
                                        onChange={(value) => {
                                            const newValue = value || 'auto';
                                            setAttributes({
                                                left: newValue,
                                                right: newValue !== 'auto' ? 'auto' : right
                                            });
                                        }}
                                    />
                                    <UnitControl
                                        label={__('Right', 'photo-collage')}
                                        value={right}
                                        onChange={(value) => {
                                            const newValue = value || 'auto';
                                            setAttributes({
                                                right: newValue,
                                                left: newValue !== 'auto' ? 'auto' : left
                                            });
                                        }}
                                    />
                                </div>
                                <div className="photo-collage-position-row is-center">
                                    <UnitControl
                                        label={__('Bottom', 'photo-collage')}
                                        value={bottom}
                                        onChange={(value) => {
                                            const newValue = value || 'auto';
                                            setAttributes({
                                                bottom: newValue,
                                                top: newValue !== 'auto' ? 'auto' : top
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {!useAbsolutePosition && (
                        <BoxControl
                            values={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
                            onChange={(side, value) => {
                                const key = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
                                setAttributes({ [key]: value });
                            }}
                            centerLabel="M"
                            isDashed={true}
                        />
                    )}
                    <div className="photo-collage-z-index-control">
                        <RangeControl
                            label={__('Z-Index (Layer Order)', 'photo-collage')}
                            value={zIndex}
                            onChange={(value) => setAttributes({ zIndex: value })}
                            min={-10}
                            max={100}
                            help={__('Higher numbers are on top.', 'photo-collage')}
                        />
                        <div className="photo-collage-z-index-buttons">
                            <Button
                                variant="secondary"
                                isSmall
                                onClick={() => setAttributes({ zIndex: zIndex - 1 })}
                                icon="minus"
                                label={__('Move Backward', 'photo-collage')}
                            />
                            <Button
                                variant="secondary"
                                isSmall
                                onClick={() => setAttributes({ zIndex: zIndex + 1 })}
                                icon="plus"
                                label={__('Move Forward', 'photo-collage')}
                            />
                        </div>
                    </div>
                </PanelBody>

                <PanelBody title={__('Padding', 'photo-collage')} initialOpen={false}>
                    <BoxControl
                        values={{ top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft }}
                        onChange={(side, value) => {
                            const key = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
                            setAttributes({ [key]: value });
                        }}
                        centerLabel="P"
                        isDashed={false}
                    />
                </PanelBody>

                <PanelBody title={__('Effects', 'photo-collage')} initialOpen={false}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', color: '#1e1e1e' }}>
                            {__('Rotation', 'photo-collage')}
                        </span>
                        {rotation !== 0 && (
                            <Button
                                isSmall
                                variant="tertiary"
                                onClick={() => setAttributes({ rotation: 0 })}
                            >
                                {__('Reset', 'photo-collage')}
                            </Button>
                        )}
                    </div>
                    <RangeControl
                        value={rotation}
                        onChange={(value) => setAttributes({ rotation: value })}
                        min={-180}
                        max={180}
                        help={rotation !== 0 ? `${rotation}°` : __('No rotation applied', 'photo-collage')}
                    />
                    <RangeControl
                        label={__('Opacity', 'photo-collage')}
                        value={opacity}
                        onChange={(value) => setAttributes({ opacity: value })}
                        min={0}
                        max={1}
                        step={0.01}
                        help={`${Math.round(opacity * 100)}%`}
                    />
                </PanelBody>

                <PanelBody title={__('Accessibility', 'photo-collage')} initialOpen={false}>
                    <ToggleControl
                        label={__('Mark as decorative', 'photo-collage')}
                        help={isDecorative
                            ? __('This image will be hidden from screen readers.', 'photo-collage')
                            : __('This image requires alt text for screen readers.', 'photo-collage')
                        }
                        checked={isDecorative}
                        onChange={onToggleDecorative}
                    />
                    {!isDecorative && (
                        <>
                            <TextControl
                                label={__('Alt Text', 'photo-collage')}
                                value={alt}
                                onChange={onChangeAlt}
                                help={__('Describe what the image shows and its purpose in the collage.', 'photo-collage')}
                                placeholder={__('Enter image description...', 'photo-collage')}
                            />
                            <TextControl
                                label={__('Title', 'photo-collage')}
                                value={title}
                                onChange={(value) => setAttributes({ title: value })}
                                help={__('Optional. Appears as a tooltip when hovering over the image.', 'photo-collage')}
                                placeholder={__('Enter image title...', 'photo-collage')}
                            />
                            <TextControl
                                label={__('Description', 'photo-collage')}
                                value={description}
                                onChange={(value) => setAttributes({ description: value })}
                                help={__('Optional. Extended description for additional context.', 'photo-collage')}
                                placeholder={__('Enter extended description...', 'photo-collage')}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls >
            <div {...blockProps}>
                <img
                    src={url}
                    alt={alt}
                    style={{
                        objectFit,
                        width: '100%',
                        height: '100%',

                    }}
                />
                {(!RichText.isEmpty(caption) || isSelected) && (
                    <RichText
                        tagName="figcaption"
                        className="photo-collage-image-caption wp-element-caption"
                        placeholder={__('Write caption…', 'photo-collage')}
                        value={caption}
                        onChange={(value) => setAttributes({ caption: value })}
                        inlineToolbar
                        allowedFormats={['core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'core/text-color', 'core/subscript', 'core/superscript']} 
                    />
                )}
            </div>
        </>
    );
}