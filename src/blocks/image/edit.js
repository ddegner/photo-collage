import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	RichText,
	__experimentalLinkControl as LinkControl,
	AlignmentControl,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
	Button,
	SelectControl,
	ToolbarButton,
	Popover,
	ToolbarDropdownMenu,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	link as linkIcon,
	unlink,
	caption as captionIcon,
} from '@wordpress/icons';
import './editor.scss';

const BoxControl = ({
	values,
	onChange,
	centerLabel = 'M',
	isDashed = true,
}) => (
	<div className="photo-collage-box-control">
		{ /* Top */}
		<div className="photo-collage-box-row is-center">
			<UnitControl
				label={__('Top', 'photo-collage')}
				labelPosition="top"
				value={values.top}
				onChange={(value) => onChange('top', value)}
				className="photo-collage-unit-control-small"
			/>
		</div>

		{ /* Middle row: Left, Center symbol, Right */}
		<div className="photo-collage-box-row is-space-between">
			<UnitControl
				label={__('Left', 'photo-collage')}
				labelPosition="top"
				value={values.left}
				onChange={(value) => onChange('left', value)}
				className="photo-collage-unit-control-small"
			/>

			<div
				className={`photo-collage-box-center ${isDashed ? 'is-dashed' : 'is-solid'
					}`}
			>
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

		{ /* Bottom */}
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
		objectFit = 'contain',
		rotation = 0,
		opacity = 1,
		caption = '',
		title = '',
		description = '',
		align,

		href,
		linkTarget,
		rel,
		linkClass,
		linkDestination = 'none',
		showCaption = true,
		captionAlign = 'left',
		captionWidth = '100%',
		captionPlacement = 'bottom-left',
		lightbox = { enabled: false },
	} = attributes;

	const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

	const onSetLink = ({ url, opensInNewTab }) => {
		setAttributes({
			href: url,
			linkTarget: opensInNewTab ? '_blank' : undefined,
			rel: opensInNewTab ? 'noreferrer noopener' : undefined,
			lightbox: { enabled: false },
		});
		setIsLinkPopoverOpen(false);
		setAttributes({ linkDestination: 'custom' });
	};

	const onRemoveLink = () => {
		setAttributes({
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			linkDestination: 'none',
			lightbox: { enabled: false },
		});
	};

	const onLinkToMedia = () => {
		if (!media || !media.source_url) return;
		setAttributes({
			href: media.source_url,
			linkDestination: 'media',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: false },
		});
	};

	const onLinkToAttachment = () => {
		if (!media || !media.link) return;
		setAttributes({
			href: media.link,
			linkDestination: 'attachment',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: false },
		});
	};

	const onEnlargeOnClick = () => {
		setAttributes({
			href: undefined,
			linkDestination: 'none',
			linkTarget: undefined,
			rel: undefined,
			linkClass: undefined,
			lightbox: { enabled: true },
		});
	};

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
			linkDestination: 'none',
			href: undefined,
			lightbox: { enabled: false },
		});
	};

	// Fetch media object for link functionality and legacy recovery
	const media = useSelect(
		(select) => (id ? select('core').getMedia(id) : null),
		[id]
	);

	useEffect(() => {
		// Only auto-recover if URL is missing
		if (!url && media && media.source_url) {
			setAttributes({
				url: media.source_url,
				alt: media.alt_text || alt,
				title: media.title?.rendered || title,
				caption: media.caption?.rendered || caption,
			});
		}
	}, [media, url]);

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
			...(useAbsolutePosition
				? {
					position: 'absolute',
					top: top && top !== 'auto' ? top : undefined,
					right: right && right !== 'auto' ? right : undefined,
					bottom:
						bottom && bottom !== 'auto' ? bottom : undefined,
					left: left && left !== 'auto' ? left : undefined,
				}
				: {
					position: 'relative',
					marginTop:
						!align || marginTop !== '0%'
							? marginTop
							: undefined,
					marginRight:
						!align || marginRight !== '0%'
							? marginRight
							: undefined,
					marginBottom:
						!align || marginBottom !== '0%'
							? marginBottom
							: undefined,
					marginLeft:
						!align || marginLeft !== '0%'
							? marginLeft
							: undefined,
				}),
			paddingTop,
			paddingRight,
			paddingBottom,
			paddingLeft,
			width: !align || width !== '50%' ? width : undefined,
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
				<ToolbarDropdownMenu
					icon={linkIcon}
					label={__('Link', 'photo-collage')}
					controls={[
						{
							title: __('Link to image file', 'photo-collage'),
							icon:
								linkDestination === 'media' ? 'yes' : undefined,
							onClick: onLinkToMedia,
							isDisabled: !media || !media.source_url,
						},
						{
							title: __(
								'Link to attachment page',
								'photo-collage'
							),
							icon:
								linkDestination === 'attachment'
									? 'yes'
									: undefined,
							onClick: onLinkToAttachment,
							isDisabled: !media || !media.link,
						},
						{
							title: __('Enlarge on click', 'photo-collage'),
							icon:
								linkDestination === 'none' && lightbox?.enabled
									? 'yes'
									: undefined,
							onClick: onEnlargeOnClick,
						},
						{
							title: __('Custom URL', 'photo-collage'),
							icon:
								linkDestination === 'custom'
									? 'yes'
									: undefined,
							onClick: () => setIsLinkPopoverOpen(true),
						},
					]}
				/>
				{isLinkPopoverOpen && (
					<Popover
						position="bottom center"
						onClose={() => setIsLinkPopoverOpen(false)}
					>
						<LinkControl
							className="wp-block-navigation-link__inline-link-input"
							value={{
								url: href,
								opensInNewTab: linkTarget === '_blank',
							}}
							onChange={onSetLink}
							onRemove={onRemoveLink}
							forceIsEditingLink={isLinkPopoverOpen}
						/>
					</Popover>
				)}
			</BlockControls>
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
				<PanelBody
					title={__('Dimensions', 'photo-collage')}
					initialOpen={true}
				>
					<UnitControl
						label={__('Width', 'photo-collage')}
						value={width}
						onChange={(value) =>
							setAttributes({ width: value })
						}
					/>
					<UnitControl
						label={__('Height', 'photo-collage')}
						value={height}
						onChange={(value) =>
							setAttributes({ height: value })
						}
					/>
				</PanelBody>

				<PanelBody
					title={__('Positioning', 'photo-collage')}
					initialOpen={true}
				>
					<ToggleControl
						label={__(
							'Use Absolute Positioning',
							'photo-collage'
						)}
						help={__(
							'Position image relative to container edges instead of using margins.',
							'photo-collage'
						)}
						checked={useAbsolutePosition}
						onChange={(value) =>
							setAttributes({ useAbsolutePosition: value })
						}
					/>
					{useAbsolutePosition && (
						<>
							<p className="photo-collage-help-text">
								{__(
									'Click an anchor point to pin the image to that corner.',
									'photo-collage'
								)}
							</p>
							<div className="photo-collage-anchor-control">
								<div className="photo-collage-anchor-grid">
									{ /* Top Left */}
									<Button
										className={`photo-collage-anchor-btn ${top !== 'auto' && left !== 'auto'
											? 'is-active'
											: ''
											}`}
										onClick={() =>
											setAttributes({
												top: '0%',
												left: '0%',
												bottom: 'auto',
												right: 'auto',
											})
										}
										icon="arrow-left-alt2"
										style={{ transform: 'rotate(45deg)' }}
										label={__(
											'Top Left',
											'photo-collage'
										)}
									/>
									{ /* Top Right */}
									<Button
										className={`photo-collage-anchor-btn ${top !== 'auto' && right !== 'auto'
											? 'is-active'
											: ''
											}`}
										onClick={() =>
											setAttributes({
												top: '0%',
												right: '0%',
												bottom: 'auto',
												left: 'auto',
											})
										}
										icon="arrow-up-alt2"
										style={{ transform: 'rotate(45deg)' }}
										label={__(
											'Top Right',
											'photo-collage'
										)}
									/>
									{ /* Bottom Left */}
									<Button
										className={`photo-collage-anchor-btn ${bottom !== 'auto' && left !== 'auto'
											? 'is-active'
											: ''
											}`}
										onClick={() =>
											setAttributes({
												bottom: '0%',
												left: '0%',
												top: 'auto',
												right: 'auto',
											})
										}
										icon="arrow-down-alt2"
										style={{ transform: 'rotate(45deg)' }}
										label={__(
											'Bottom Left',
											'photo-collage'
										)}
									/>
									{ /* Bottom Right */}
									<Button
										className={`photo-collage-anchor-btn ${bottom !== 'auto' &&
											right !== 'auto'
											? 'is-active'
											: ''
											}`}
										onClick={() =>
											setAttributes({
												bottom: '0%',
												right: '0%',
												top: 'auto',
												left: 'auto',
											})
										}
										icon="arrow-right-alt2"
										style={{ transform: 'rotate(45deg)' }}
										label={__(
											'Bottom Right',
											'photo-collage'
										)}
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
												bottom:
													newValue !== 'auto'
														? 'auto'
														: bottom,
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
												right:
													newValue !== 'auto'
														? 'auto'
														: right,
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
												left:
													newValue !== 'auto'
														? 'auto'
														: left,
											});
										}}
									/>
								</div>
								<div className="photo-collage-position-row is-center">
									<UnitControl
										label={__(
											'Bottom',
											'photo-collage'
										)}
										value={bottom}
										onChange={(value) => {
											const newValue = value || 'auto';
											setAttributes({
												bottom: newValue,
												top:
													newValue !== 'auto'
														? 'auto'
														: top,
											});
										}}
									/>
								</div>
							</div>
						</>
					)}
					{!useAbsolutePosition && (
						<BoxControl
							values={{
								top: marginTop,
								right: marginRight,
								bottom: marginBottom,
								left: marginLeft,
							}}
							onChange={(side, value) => {
								const key = `margin${side.charAt(0).toUpperCase() +
									side.slice(1)
									}`;
								setAttributes({ [key]: value });
							}}
							centerLabel="M"
							isDashed={true}
						/>
					)}
					<div className="photo-collage-z-index-control">
						<RangeControl
							label={__(
								'Z-Index (Layer Order)',
								'photo-collage'
							)}
							value={zIndex}
							onChange={(value) =>
								setAttributes({ zIndex: value })
							}
							min={-10}
							max={100}
							help={__(
								'Higher numbers are on top.',
								'photo-collage'
							)}
						/>
						<div className="photo-collage-z-index-buttons">
							<Button
								variant="secondary"
								isSmall
								onClick={() =>
									setAttributes({ zIndex: zIndex - 1 })
								}
								icon="minus"
								label={__('Move Backward', 'photo-collage')}
							/>
							<Button
								variant="secondary"
								isSmall
								onClick={() =>
									setAttributes({ zIndex: zIndex + 1 })
								}
								icon="plus"
								label={__('Move Forward', 'photo-collage')}
							/>
						</div>
					</div>
				</PanelBody>

				<PanelBody
					title={__('Padding', 'photo-collage')}
					initialOpen={true}
				>
					<BoxControl
						values={{
							top: paddingTop,
							right: paddingRight,
							bottom: paddingBottom,
							left: paddingLeft,
						}}
						onChange={(side, value) => {
							const key = `padding${side.charAt(0).toUpperCase() + side.slice(1)
								}`;
							setAttributes({ [key]: value });
						}}
						centerLabel="P"
						isDashed={false}
					/>
				</PanelBody>

				<PanelBody
					title={__('Effects', 'photo-collage')}
					initialOpen={true}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: '8px',
						}}
					>
						<span
							style={{
								fontSize: '11px',
								fontWeight: '500',
								textTransform: 'uppercase',
								color: '#1e1e1e',
							}}
						>
							{__('Rotation', 'photo-collage')}
						</span>
						{rotation !== 0 && (
							<Button
								isSmall
								variant="tertiary"
								onClick={() =>
									setAttributes({ rotation: 0 })
								}
							>
								{__('Reset', 'photo-collage')}
							</Button>
						)}
					</div>
					<RangeControl
						value={rotation}
						onChange={(value) =>
							setAttributes({ rotation: value })
						}
						min={-180}
						max={180}
						help={
							rotation !== 0
								? `${rotation}°`
								: __('No rotation applied', 'photo-collage')
						}
					/>
					<RangeControl
						label={__('Opacity', 'photo-collage')}
						value={opacity}
						onChange={(value) =>
							setAttributes({ opacity: value })
						}
						min={0}
						max={1}
						step={0.01}
						help={`${Math.round(opacity * 100)}%`}
					/>
				</PanelBody>

				<PanelBody
					title={__('Accessibility', 'photo-collage')}
					initialOpen={true}
				>
					<ToggleControl
						label={__('Mark as decorative', 'photo-collage')}
						help={
							isDecorative
								? __(
									'This image will be hidden from screen readers.',
									'photo-collage'
								)
								: __(
									'This image requires alt text for screen readers.',
									'photo-collage'
								)
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
								help={__(
									'Describe what the image shows and its purpose in the collage.',
									'photo-collage'
								)}
								placeholder={__(
									'Enter image description...',
									'photo-collage'
								)}
							/>
							<TextControl
								label={__('Title', 'photo-collage')}
								value={title}
								onChange={(value) =>
									setAttributes({ title: value })
								}
								help={__(
									'Optional. Appears as a tooltip when hovering over the image.',
									'photo-collage'
								)}
								placeholder={__(
									'Enter image title...',
									'photo-collage'
								)}
							/>
							<TextControl
								label={__('Description', 'photo-collage')}
								value={description}
								onChange={(value) =>
									setAttributes({ description: value })
								}
								help={__(
									'Optional. Extended description for additional context.',
									'photo-collage'
								)}
								placeholder={__(
									'Enter extended description...',
									'photo-collage'
								)}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody
					title={__('Caption Settings', 'photo-collage')}
					initialOpen={true}
				>
					<ToggleControl
						label={__('Show Caption', 'photo-collage')}
						checked={showCaption}
						onChange={() =>
							setAttributes({ showCaption: !showCaption })
						}
					/>
					{showCaption && (
						<>
							<SelectControl
								label={__(
									'Caption Placement',
									'photo-collage'
								)}
								value={captionPlacement}
								options={[
									{
										label: __('Bottom Left', 'photo-collage'),
										value: 'bottom-left',
									},
									{
										label: __('Bottom Center', 'photo-collage'),
										value: 'bottom-center',
									},
									{
										label: __('Bottom Right', 'photo-collage'),
										value: 'bottom-right',
									},
								]}
								onChange={(value) =>
									setAttributes({ captionPlacement: value })
								}
							/>
							<SelectControl
								label={__(
									'Text Alignment',
									'photo-collage'
								)}
								value={captionAlign}
								options={[
									{
										label: __('Left', 'photo-collage'),
										value: 'left',
									},
									{
										label: __('Center', 'photo-collage'),
										value: 'center',
									},
									{
										label: __('Right', 'photo-collage'),
										value: 'right',
									},
								]}
								onChange={(value) =>
									setAttributes({ captionAlign: value })
								}
							/>
							<UnitControl
								label={__('Caption Width', 'photo-collage')}
								value={captionWidth}
								onChange={(value) =>
									setAttributes({ captionWidth: value })
								}
							/>
						</>
					)}
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<figure
					className="photo-collage-image-figure"
					style={{
						display: showCaption ? 'flex' : undefined,
						flexDirection: showCaption ? 'column' : undefined,
						alignItems: showCaption
							? captionPlacement === 'bottom-center'
								? 'center'
								: captionPlacement === 'bottom-right'
									? 'flex-end'
									: 'flex-start'
							: undefined,
					}}
				>
					<img
						src={url}
						alt={alt}
						style={{
							objectFit: 'contain',
							width: '100%',
							height: '100%',
						}}
					/>
					{showCaption &&
						(!RichText.isEmpty(caption) || isSelected) && (
							<>
								<BlockControls group="block">
									<AlignmentControl
										value={captionAlign}
										onChange={(value) =>
											setAttributes({
												captionAlign: value,
											})
										}
									/>
								</BlockControls>
								<RichText
									tagName="figcaption"
									className="photo-collage-image-caption wp-element-caption"
									placeholder={__(
										'Write caption…',
										'photo-collage'
									)}
									value={caption}
									onChange={(value) =>
										setAttributes({ caption: value })
									}
									inlineToolbar
									allowedFormats={[
										'core/bold',
										'core/italic',
										'core/link',
										'core/strikethrough',
										'core/text-color',
										'core/subscript',
										'core/superscript',
									]}
									style={{
										textAlign: captionAlign,
										width: captionWidth,
									}}
								/>
							</>
						)}
				</figure>
			</div>
		</>
	);
}
