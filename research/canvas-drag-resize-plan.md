# Direct Canvas Drag and Resize Plan

## Goal

Add direct, selected-block manipulation to Collage Image and Collage Frame
without changing saved markup, introducing a second block wrapper, or relying on
private Gutenberg APIs.

## Interaction contract

1. Controls appear only while an Image or Frame that is a direct child of a
   Collage Container is selected and editable. Standalone legacy blocks and
   blocks nested inside a Frame do not show inert or incorrectly scoped handles.
2. A dedicated move handle prevents gestures from stealing image, caption, link,
   or nested Frame interactions.
3. Move dragging is available for absolutely positioned items. Flow/margin
   layouts remain in flow because converting only one child to absolute would
   make its siblings reflow into the vacated slot.
4. Resizing is available in both positioning modes:
    - Images preserve their rendered aspect ratio while `height` is `auto`.
    - Frames resize freely.
    - Holding Shift preserves the current ratio for an otherwise free resize.
5. Pointer movement previews directly in the editor and commits attributes once
   on release. Pointer capture is backed by owner-document listeners so the
   gesture still completes if Gutenberg retargets the pointer after it leaves
   the handle. Escape and pointer cancellation restore the starting geometry.
6. Arrow keys nudge the move handle or resize from the resize handle by one
   pixel; Shift changes the step to ten pixels.
7. Position and Size inspector controls remain the exact-value and non-dragging
   alternative.

## Geometry and persistence

-   Read untransformed layout geometry from `offsetLeft`, `offsetTop`,
    `offsetWidth`, and `offsetHeight`.
-   Normalize pointer deltas for a scaled editor canvas.
-   Move deltas stay screen-relative. Resize deltas are projected onto the
    block's rotated local axes.
-   Canonicalize moved absolute items to `left` + `top`, with `right` and `bottom`
    set to `auto`.
-   Preserve percentage horizontal positioning and width where already used.
-   Save vertical position in pixels in auto-height containers to avoid
    percentage-height feedback.
-   Use a 48px minimum resized dimension.
-   Keep margins intact and account for their computed leading values when
    converting measured border positions back to CSS offsets.
-   Do not clamp artistic overflow. The inspector and Undo remain recovery paths.

## WordPress integration

-   Use public `useBlockEditingMode`, `store`/`toggleSelection`, `Tooltip`, and
    `Icon` APIs available in WordPress 6.8. Determine direct parentage with the
    public `getBlockRootClientId` and `getBlockName` block-editor selectors.
-   Use browser Pointer Events and pointer capture on the actual handle.
-   Use object-form `setAttributes( { ... } )`, which is compatible with
    WordPress 6.8.
-   Keep the existing Image and Frame roots as the only block wrappers.
-   Temporarily suspend the editor auto-height observer during a gesture and
    request one measurement after completion.

## Acceptance criteria

-   Image and Frame move accurately in fixed- and auto-height absolute layouts.
-   Image resize preserves ratio; Frame resize updates width and height.
-   Rotation remains unchanged and the resize handle follows local axes.
-   Right/bottom anchored items begin without a visual jump and commit as
    left/top.
-   One drag or resize is one Undo step; Redo restores it.
-   Escape and pointer cancellation do not change attributes.
-   Caption editing, image controls, and Frame InnerBlocks remain usable.
-   Nested Image or Frame blocks inside a Frame do not receive controls scoped
    to the outer Collage Container.
-   Selected controls remain visible at low or zero block opacity, and the
    physical bottom-right resize affordance remains consistent in RTL editors.
-   Mobile stacking hides the controls without changing desktop geometry.
-   Save/reload produces no invalid-block recovery prompt.
-   Frontend geometry matches the editor and saved markup retains one wrapper.
-   Automated geometry tests, JavaScript/CSS/PHP lint, build, PHP regression
    tests, a WordPress 6.8 compatibility smoke pass, and a current-WordPress
    Local interaction pass all succeed.
