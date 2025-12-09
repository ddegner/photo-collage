# Requirements Document

## Introduction

This feature adds new and interesting photo collage patterns to the WordPress Photo Collage plugin. The patterns provide users with creative, visually appealing layout options for displaying multiple images. Each pattern uses the existing photo-collage/container and photo-collage/image blocks with various positioning, sizing, rotation, and z-index configurations.

## Glossary

- **Pattern**: A pre-configured WordPress block pattern that users can insert into their content
- **Container**: The photo-collage/container block that holds and positions child image blocks
- **Image Block**: The photo-collage/image block with configurable width, margins, rotation, and z-index
- **Z-Index**: The stacking order of images (higher values appear on top)
- **Rotation**: The angle in degrees that an image is rotated

## Requirements

### Requirement 1: Diamond Formation Pattern

**User Story:** As a content creator, I want a diamond-shaped arrangement of images, so that I can create a visually striking geometric layout.

#### Acceptance Criteria

1. WHEN a user inserts the Diamond Formation pattern THEN the system SHALL display 4 images arranged in a diamond shape with one image at top, two in the middle row, and one at bottom
2. WHEN the Diamond Formation pattern is rendered THEN the system SHALL position images with appropriate margins to create the diamond effect
3. WHEN images overlap in the Diamond Formation THEN the system SHALL use z-index values to create depth with center images appearing on top

### Requirement 2: Polaroid Stack Pattern

**User Story:** As a content creator, I want images arranged like scattered polaroid photos, so that I can create a casual, nostalgic aesthetic.

#### Acceptance Criteria

1. WHEN a user inserts the Polaroid Stack pattern THEN the system SHALL display 4-5 images with varied rotations resembling scattered photos
2. WHEN the Polaroid Stack pattern is rendered THEN the system SHALL apply rotation values between -15 and 15 degrees to create natural variation
3. WHEN images are positioned in the Polaroid Stack THEN the system SHALL overlap images with ascending z-index values to simulate a stack

### Requirement 3: Diagonal Cascade Pattern

**User Story:** As a content creator, I want images flowing diagonally across the container, so that I can create dynamic visual movement.

#### Acceptance Criteria

1. WHEN a user inserts the Diagonal Cascade pattern THEN the system SHALL display 4 images arranged diagonally from top-left to bottom-right
2. WHEN the Diagonal Cascade pattern is rendered THEN the system SHALL progressively increase marginLeft and marginTop for each image
3. WHEN images are positioned in the Diagonal Cascade THEN the system SHALL use decreasing widths to create perspective depth

### Requirement 4: Mosaic Cluster Pattern

**User Story:** As a content creator, I want a tight cluster of varied-size images, so that I can create an artistic mosaic effect.

#### Acceptance Criteria

1. WHEN a user inserts the Mosaic Cluster pattern THEN the system SHALL display 5-6 images of varying sizes clustered together
2. WHEN the Mosaic Cluster pattern is rendered THEN the system SHALL use image widths ranging from 25% to 45% to create visual variety
3. WHEN images overlap in the Mosaic Cluster THEN the system SHALL use z-index layering to create depth without completely obscuring any image

### Requirement 5: Spotlight Focus Pattern

**User Story:** As a content creator, I want one large central image surrounded by smaller supporting images, so that I can highlight a primary photo while showing context.

#### Acceptance Criteria

1. WHEN a user inserts the Spotlight Focus pattern THEN the system SHALL display one large central image (60-70% width) with 3-4 smaller images around it
2. WHEN the Spotlight Focus pattern is rendered THEN the system SHALL position the central image with highest z-index to maintain focus
3. WHEN supporting images are positioned THEN the system SHALL place them at corners or edges with partial overlap to frame the central image
