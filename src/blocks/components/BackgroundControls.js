import { __ } from '@wordpress/i18n';
import { SelectControl, Button } from '@wordpress/components';
import { MediaUploadCheck, MediaUpload } from '@wordpress/block-editor';

export default function BackgroundControls( { attributes, setAttributes } ) {
	const {
		backgroundType = 'none',
		backgroundImageId,
		backgroundImageUrl,
		backgroundSize = 'cover',
		backgroundPosition = 'center center',
	} = attributes;

	const onSelectImage = ( media ) => {
		if ( ! media || ! media.url ) {
			return;
		}
		setAttributes( {
			backgroundImageId: media.id,
			backgroundImageUrl: media.url,
		} );
	};

	const removeImage = () => {
		setAttributes( {
			backgroundImageId: undefined,
			backgroundImageUrl: undefined,
		} );
	};

	return (
		<>
			<SelectControl
				label={ __( 'Background Type', 'photo-collage' ) }
				value={ backgroundType }
				options={ [
					{ label: __( 'None', 'photo-collage' ), value: 'none' },
					{
						label: __( 'Tiling Image', 'photo-collage' ),
						value: 'tiling-image',
					},
					{
						label: __( 'Full Image', 'photo-collage' ),
						value: 'full-image',
					},
				] }
				onChange={ ( value ) =>
					setAttributes( { backgroundType: value } )
				}
				__nextHasNoMarginBottom={ true }
				__next40pxDefaultSize={ true }
			/>

			{ ( backgroundType === 'tiling-image' ||
				backgroundType === 'full-image' ) && (
				<div style={ { marginTop: '12px' } }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImage }
							allowedTypes={ [ 'image' ] }
							value={ backgroundImageId }
							render={ ( { open } ) => (
								<>
									{ ! backgroundImageUrl ? (
										<Button
											variant="secondary"
											onClick={ open }
										>
											{ __(
												'Select Background Image',
												'photo-collage'
											) }
										</Button>
									) : (
										<>
											<div
												style={ {
													marginBottom: '8px',
													border: '1px solid #ddd',
													borderRadius: '4px',
													overflow: 'hidden',
												} }
											>
												<img
													src={ backgroundImageUrl }
													alt={ __(
														'Background',
														'photo-collage'
													) }
													style={ {
														width: '100%',
														height: 'auto',
														display: 'block',
													} }
												/>
											</div>
											<div
												style={ {
													display: 'flex',
													gap: '8px',
												} }
											>
												<Button
													variant="secondary"
													onClick={ open }
												>
													{ __(
														'Replace Image',
														'photo-collage'
													) }
												</Button>
												<Button
													variant="secondary"
													isDestructive
													onClick={ removeImage }
												>
													{ __(
														'Remove Image',
														'photo-collage'
													) }
												</Button>
											</div>
										</>
									) }
								</>
							) }
						/>
					</MediaUploadCheck>

					{ backgroundImageUrl && backgroundType === 'full-image' && (
						<>
							<SelectControl
								label={ __(
									'Background Size',
									'photo-collage'
								) }
								value={ backgroundSize }
								options={ [
									{
										label: __( 'Cover', 'photo-collage' ),
										value: 'cover',
									},
									{
										label: __( 'Contain', 'photo-collage' ),
										value: 'contain',
									},
									{
										label: __( 'Auto', 'photo-collage' ),
										value: 'auto',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( {
										backgroundSize: value,
									} )
								}
								style={ { marginTop: '12px' } }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
							<SelectControl
								label={ __(
									'Background Position',
									'photo-collage'
								) }
								value={ backgroundPosition }
								options={ [
									{
										label: __(
											'Center Center',
											'photo-collage'
										),
										value: 'center center',
									},
									{
										label: __(
											'Top Left',
											'photo-collage'
										),
										value: 'top left',
									},
									{
										label: __(
											'Top Center',
											'photo-collage'
										),
										value: 'top center',
									},
									{
										label: __(
											'Top Right',
											'photo-collage'
										),
										value: 'top right',
									},
									{
										label: __(
											'Center Left',
											'photo-collage'
										),
										value: 'center left',
									},
									{
										label: __(
											'Center Right',
											'photo-collage'
										),
										value: 'center right',
									},
									{
										label: __(
											'Bottom Left',
											'photo-collage'
										),
										value: 'bottom left',
									},
									{
										label: __(
											'Bottom Center',
											'photo-collage'
										),
										value: 'bottom center',
									},
									{
										label: __(
											'Bottom Right',
											'photo-collage'
										),
										value: 'bottom right',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( {
										backgroundPosition: value,
									} )
								}
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
						</>
					) }

					{ backgroundImageUrl &&
						backgroundType === 'tiling-image' && (
							<p
								style={ {
									fontSize: '12px',
									color: '#757575',
									marginTop: '8px',
								} }
							>
								{ __(
									'Image will repeat to fill the background.',
									'photo-collage'
								) }
							</p>
						) }
				</div>
			) }
		</>
	);
}
