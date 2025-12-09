# Requirements Document

## Introduction

This feature expands the caption placement options for the Collage Image block. Currently, captions can only be placed below the image (bottom-left, bottom-center, bottom-right). This enhancement adds the ability to position captions to the left or right side of the image, enabling more flexible magazine-style layouts that photographers and photojournalists commonly use in photo books and editorial designs.

## Glossary

- **Collage Image Block**: The `photo-collage/image` WordPress block that displays an image with positioning controls within a collage container
- **Caption**: Text displayed alongside an image providing context, credit, or description
- **Caption Placement**: The position of the caption relative to the image (bottom, left, or right)
- **Caption Alignment**: The text alignment within the caption area (left, center, right)
- **Flexbox Direction**: CSS property controlling the flow direction of flex container children

## Requirements

### Requirement 1

**User Story:** As a photographer, I want to place captions around my images using a visual selector, so that I can intuitively create magazine-style layouts where text sits beside, above, or below the photo with precise alignment control.

#### Acceptance Criteria

1. WHEN a user opens caption settings in the block inspector THEN the Collage Image Block SHALL display a visual position selector showing all twelve caption positions around a center image representation
2. WHEN a user clicks a position in the visual selector THEN the Collage Image Block SHALL update the caption placement to that position
3. WHEN a user selects any "left-*" or "right-*" placement THEN the Collage Image Block SHALL display the caption beside the image using a horizontal (row) flexbox layout
4. WHEN a user selects any "top-*" or "bottom-*" placement THEN the Collage Image Block SHALL display the caption above or below the image using a vertical (column) flexbox layout
5. WHEN caption placement is set to a "-left" or "-top" aligned position THEN the caption SHALL align to the start of its container axis
6. WHEN caption placement is set to a "-center" aligned position THEN the caption SHALL align to the center of its container axis
7. WHEN caption placement is set to a "-right" or "-bottom" aligned position THEN the caption SHALL align to the end of its container axis

### Requirement 2

**User Story:** As a content creator, I want to control the width of side-positioned captions, so that I can balance the visual weight between the image and its accompanying text.

#### Acceptance Criteria

1. WHEN caption placement is set to left or right THEN the Collage Image Block SHALL display a caption width control in the settings panel
2. WHEN a user adjusts caption width for side placement THEN the Collage Image Block SHALL apply the specified width to the caption area
3. WHEN caption width is set for side placement THEN the image SHALL occupy the remaining available width within the container

### Requirement 3

**User Story:** As a designer, I want the visual position selector to clearly indicate the current caption position, so that I can quickly understand and modify the layout.

#### Acceptance Criteria

1. WHEN a caption position is active THEN the corresponding button in the visual selector SHALL display a highlighted/selected state
2. WHEN hovering over a position button THEN the Collage Image Block SHALL display a hover state indicating the button is interactive
3. WHEN the center cell of the grid is displayed THEN it SHALL show an image icon and SHALL NOT be clickable

### Requirement 4

**User Story:** As a user, I want the editor preview to match the front-end rendering, so that I can see exactly how my caption placement will appear on the published page.

#### Acceptance Criteria

1. WHEN a user changes caption placement in the editor THEN the Collage Image Block SHALL immediately reflect the new layout in the editor preview
2. WHEN the page is rendered on the front-end THEN the caption placement SHALL match the editor preview exactly
3. WHEN caption placement is left or right THEN the server-side renderer SHALL generate the correct flexbox styles

### Requirement 5

**User Story:** As a mobile user, I want side captions to adapt gracefully on small screens, so that the layout remains readable when the container is narrow.

#### Acceptance Criteria

1. WHEN the collage container has "Stack on Mobile" enabled AND caption placement is left or right THEN the Collage Image Block SHALL stack the caption below the image on mobile viewports
2. WHEN stacking occurs on mobile THEN the caption SHALL maintain its text alignment setting
