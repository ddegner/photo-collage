import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    Button,
    GradientPicker,
    ColorPalette,
    ColorPicker,
} from '@wordpress/components';
import {
    MediaUploadCheck,
    MediaUpload,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Preset gradients for quick selection
 */
const PRESET_GRADIENTS = [
    {
        name: __('Sunset', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        slug: 'sunset',
    },
    {
        name: __('Ocean', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
        slug: 'ocean',
    },
    {
        name: __('Forest', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
        slug: 'forest',
    },
    {
        name: __('Fire', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #f85032 0%, #e73827 100%)',
        slug: 'fire',
    },
    {
        name: __('Purple Dream', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
        slug: 'purple-dream',
    },
    {
        name: __('Blue Sky', 'photo-collage'),
        gradient:
            'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
        slug: 'blue-sky',
    },
];

/**
 * BackgroundControls component
 * Provides UI controls for setting block backgrounds (color, gradient, image)
 *
 * @param {Object} props Component props
 * @param {Object} props.attributes Block attributes
 * @param {Function} props.setAttributes Function to update block attributes
 * @return {JSX.Element} Background controls UI
 */
export default function BackgroundControls({ attributes, setAttributes }) {
    const {
        backgroundType = 'none',
        backgroundColor,
        gradient,
        backgroundImageId,
        backgroundImageUrl,
        backgroundSize = 'cover',
        backgroundPosition = 'center center',
        backgroundRepeat = false,
    } = attributes;

    // Get theme colors and gradients from editor settings
    const { colors, gradients } = useSelect((select) => {
        const settings = select('core/block-editor').getSettings();
        return {
            colors: settings.colors || [],
            gradients:
                settings.__experimentalFeatures?.color?.gradients?.theme ||
                settings.gradients ||
                [],
        };
    }, []);

    // Combine theme gradients with preset gradients
    const allGradients = [...gradients, ...PRESET_GRADIENTS];

    const onSelectImage = (media) => {
        if (!media || !media.url) {
            return;
        }
        setAttributes({
            backgroundImageId: media.id,
            backgroundImageUrl: media.url,
        });
    };

    const removeImage = () => {
        setAttributes({
            backgroundImageId: undefined,
            backgroundImageUrl: undefined,
        });
    };

    return (
        <>
            <SelectControl
                label={__('Background Type', 'photo-collage')}
                value={backgroundType}
                options={[
                    { label: __('None', 'photo-collage'), value: 'none' },
                    {
                        label: __('Solid Color', 'photo-collage'),
                        value: 'color',
                    },
                    {
                        label: __('Gradient', 'photo-collage'),
                        value: 'gradient',
                    },
                    {
                        label: __('Tiling Image', 'photo-collage'),
                        value: 'tiling-image',
                    },
                    {
                        label: __('Full Image', 'photo-collage'),
                        value: 'full-image',
                    },
                ]}
                onChange={(value) =>
                    setAttributes({ backgroundType: value })
                }
                __nextHasNoMarginBottom={true}
                __next40pxDefaultSize={true}
            />

            {backgroundType === 'color' && (
                <>
                    <p style={{ marginTop: '12px', marginBottom: '8px' }}>
                        {__('Background Color', 'photo-collage')}
                    </p>
                    <ColorPalette
                        colors={colors}
                        value={backgroundColor}
                        onChange={(color) =>
                            setAttributes({ backgroundColor: color })
                        }
                    />
                    <div style={{ marginTop: '12px' }}>
                        <p style={{ marginBottom: '8px' }}>
                            {__('Custom Color', 'photo-collage')}
                        </p>
                        <ColorPicker
                            color={backgroundColor}
                            onChangeComplete={(value) =>
                                setAttributes({ backgroundColor: value.hex })
                            }
                            disableAlpha
                        />
                    </div>
                </>
            )}

            {backgroundType === 'gradient' && (
                <div style={{ marginTop: '12px' }}>
                    <GradientPicker
                        gradients={allGradients}
                        value={gradient}
                        onChange={(value) =>
                            setAttributes({ gradient: value })
                        }
                    />
                </div>
            )}

            {(backgroundType === 'tiling-image' ||
                backgroundType === 'full-image') && (
                    <div style={{ marginTop: '12px' }}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectImage}
                                allowedTypes={['image']}
                                value={backgroundImageId}
                                render={({ open }) => (
                                    <>
                                        {!backgroundImageUrl ? (
                                            <Button
                                                variant="secondary"
                                                onClick={open}
                                            >
                                                {__(
                                                    'Select Background Image',
                                                    'photo-collage'
                                                )}
                                            </Button>
                                        ) : (
                                            <>
                                                <div
                                                    style={{
                                                        marginBottom: '8px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <img
                                                        src={backgroundImageUrl}
                                                        alt={__(
                                                            'Background',
                                                            'photo-collage'
                                                        )}
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            display: 'block',
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        onClick={open}
                                                    >
                                                        {__(
                                                            'Replace Image',
                                                            'photo-collage'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        isDestructive
                                                        onClick={removeImage}
                                                    >
                                                        {__(
                                                            'Remove Image',
                                                            'photo-collage'
                                                        )}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            />
                        </MediaUploadCheck>

                        {backgroundImageUrl &&
                            backgroundType === 'full-image' && (
                                <>
                                    <SelectControl
                                        label={__(
                                            'Background Size',
                                            'photo-collage'
                                        )}
                                        value={backgroundSize}
                                        options={[
                                            {
                                                label: __(
                                                    'Cover',
                                                    'photo-collage'
                                                ),
                                                value: 'cover',
                                            },
                                            {
                                                label: __(
                                                    'Contain',
                                                    'photo-collage'
                                                ),
                                                value: 'contain',
                                            },
                                            {
                                                label: __(
                                                    'Auto',
                                                    'photo-collage'
                                                ),
                                                value: 'auto',
                                            },
                                        ]}
                                        onChange={(value) =>
                                            setAttributes({
                                                backgroundSize: value,
                                            })
                                        }
                                        style={{ marginTop: '12px' }}
                                        __nextHasNoMarginBottom={true}
                                        __next40pxDefaultSize={true}
                                    />
                                    <SelectControl
                                        label={__(
                                            'Background Position',
                                            'photo-collage'
                                        )}
                                        value={backgroundPosition}
                                        options={[
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
                                        ]}
                                        onChange={(value) =>
                                            setAttributes({
                                                backgroundPosition: value,
                                            })
                                        }
                                        __nextHasNoMarginBottom={true}
                                        __next40pxDefaultSize={true}
                                    />
                                </>
                            )}

                        {backgroundImageUrl &&
                            backgroundType === 'tiling-image' && (
                                <p
                                    style={{
                                        fontSize: '12px',
                                        color: '#757575',
                                        marginTop: '8px',
                                    }}
                                >
                                    {__(
                                        'Image will repeat to fill the background.',
                                        'photo-collage'
                                    )}
                                </p>
                            )}
                    </div>
                )}
        </>
    );
}
