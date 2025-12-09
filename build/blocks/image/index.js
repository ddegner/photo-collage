/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@wordpress/icons/build-module/library/image.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/image.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ image_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
// packages/icons/src/library/image.tsx


var image_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" }) });

//# sourceMappingURL=image.js.map


/***/ }),

/***/ "./node_modules/@wordpress/icons/build-module/library/link.js":
/*!********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/link.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ link_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
// packages/icons/src/library/link.tsx


var link_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z" }) });

//# sourceMappingURL=link.js.map


/***/ }),

/***/ "./src/blocks/image/block.json":
/*!*************************************!*\
  !*** ./src/blocks/image/block.json ***!
  \*************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"photo-collage/image","version":"0.5.1","title":"Collage Image","category":"design","icon":"format-image","description":"An image block with advanced positioning controls.","supports":{"align":true,"html":false,"interactivity":true,"lightbox":{"allowEditing":true}},"textdomain":"photo-collage","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","render":"file:./render.php","attributes":{"url":{"type":"string"},"alt":{"type":"string","default":""},"isDecorative":{"type":"boolean","default":false},"id":{"type":"number"},"marginTop":{"type":"string","default":"0%"},"marginRight":{"type":"string","default":"0%"},"marginBottom":{"type":"string","default":"0%"},"marginLeft":{"type":"string","default":"0%"},"zIndex":{"type":"number","default":1},"width":{"type":"string","default":"50%"},"height":{"type":"string","default":"auto"},"paddingTop":{"type":"string","default":"0%"},"paddingRight":{"type":"string","default":"0%"},"paddingBottom":{"type":"string","default":"0%"},"paddingLeft":{"type":"string","default":"0%"},"useAbsolutePosition":{"type":"boolean","default":false},"top":{"type":"string","default":"auto"},"right":{"type":"string","default":"auto"},"bottom":{"type":"string","default":"auto"},"left":{"type":"string","default":"auto"},"objectFit":{"type":"string","default":"contain"},"rotation":{"type":"number","default":0},"opacity":{"type":"number","default":1},"showCaption":{"type":"boolean","default":true},"caption":{"type":"string","default":""},"captionAlign":{"type":"string","default":"left"},"captionWidth":{"type":"string","default":"100%"},"captionPlacement":{"type":"string","default":"bottom-left","enum":["top-left","top-center","top-right","left-top","left-center","left-bottom","right-top","right-center","right-bottom","bottom-left","bottom-center","bottom-right"]},"imgClass":{"type":"string","default":""},"imgStyle":{"type":"string","default":""},"captionClass":{"type":"string","default":""},"captionStyle":{"type":"string","default":""},"title":{"type":"string","default":""},"description":{"type":"string","default":""},"href":{"type":"string"},"linkTarget":{"type":"string"},"rel":{"type":"string"},"linkClass":{"type":"string"},"linkDestination":{"type":"string","default":"none"}}}');

/***/ }),

/***/ "./src/blocks/image/components/caption-position-control.js":
/*!*****************************************************************!*\
  !*** ./src/blocks/image/components/caption-position-control.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CaptionPositionControl)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/image.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);
/**
 * CaptionPositionControl Component
 *
 * A visual position selector for caption placement around an image.
 * Displays a CSS Grid layout with 12 clickable position buttons arranged
 * around a center image representation.
 *
 * Valid positions:
 * - Top: top-left, top-center, top-right
 * - Left: left-top, left-center, left-bottom
 * - Right: right-top, right-center, right-bottom
 * - Bottom: bottom-left, bottom-center, bottom-right
 */





/**
 * All valid caption positions organized by edge.
 */

const POSITIONS = {
  top: ['top-left', 'top-center', 'top-right'],
  left: ['left-top', 'left-center', 'left-bottom'],
  right: ['right-top', 'right-center', 'right-bottom'],
  bottom: ['bottom-left', 'bottom-center', 'bottom-right']
};

/**
 * Human-readable labels for each position.
 */
const POSITION_LABELS = {
  'top-left': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top Left', 'photo-collage'),
  'top-center': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top Center', 'photo-collage'),
  'top-right': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top Right', 'photo-collage'),
  'left-top': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left Top', 'photo-collage'),
  'left-center': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left Center', 'photo-collage'),
  'left-bottom': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left Bottom', 'photo-collage'),
  'right-top': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right Top', 'photo-collage'),
  'right-center': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right Center', 'photo-collage'),
  'right-bottom': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right Bottom', 'photo-collage'),
  'bottom-left': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom Left', 'photo-collage'),
  'bottom-center': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom Center', 'photo-collage'),
  'bottom-right': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom Right', 'photo-collage')
};

/**
 * CaptionPositionControl component.
 *
 * @param {Object}   props          Component props.
 * @param {string}   props.value    Current caption placement value.
 * @param {Function} props.onChange Callback when position changes.
 * @return {JSX.Element} The position control component.
 */
function CaptionPositionControl({
  value,
  onChange
}) {
  /**
   * Renders a position button.
   *
   * @param {string} position The position value.
   * @return {JSX.Element} Button element.
   */
  const renderPositionButton = position => {
    const isActive = value === position;
    const label = POSITION_LABELS[position];
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      className: `caption-position-btn ${isActive ? 'is-active' : ''}`,
      onClick: () => onChange(position),
      "aria-label": `${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption position:', 'photo-collage')} ${label}`,
      "aria-pressed": isActive,
      title: label
    }, position);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: "caption-position-control",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "caption-position-top",
      children: POSITIONS.top.map(renderPositionButton)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "caption-position-left",
      children: POSITIONS.left.map(renderPositionButton)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "caption-position-center",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
        className: "caption-position-center-icon",
        children: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "caption-position-right",
      children: POSITIONS.right.map(renderPositionButton)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "caption-position-bottom",
      children: POSITIONS.bottom.map(renderPositionButton)
    })]
  });
}

/***/ }),

/***/ "./src/blocks/image/edit.js":
/*!**********************************!*\
  !*** ./src/blocks/image/edit.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit),
/* harmony export */   getAlignItems: () => (/* binding */ getAlignItems),
/* harmony export */   getFlexDirection: () => (/* binding */ getFlexDirection)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/link.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/image/editor.scss");
/* harmony import */ var _components_caption_position_control__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/caption-position-control */ "./src/blocks/image/components/caption-position-control.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);










const LinkControl = _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.LinkControl || _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.__experimentalLinkControl;
const UnitControl = _wordpress_components__WEBPACK_IMPORTED_MODULE_5__.UnitControl || _wordpress_components__WEBPACK_IMPORTED_MODULE_5__.__experimentalUnitControl;

/**
 * Get flex-direction based on caption placement.
 * Side placements (left-*, right-*) use row layout.
 * Top/bottom placements use column layout.
 *
 * @param {string} placement Caption placement value.
 * @return {string} CSS flex-direction value.
 */
const getFlexDirection = placement => {
  if (placement.startsWith('left-') || placement.startsWith('right-')) {
    return 'row';
  }
  return 'column';
};

/**
 * Get align-items based on caption placement suffix.
 * Maps placement alignment to CSS align-items value.
 *
 * @param {string} placement Caption placement value.
 * @return {string} CSS align-items value.
 */
const getAlignItems = placement => {
  // Extract the suffix after the hyphen
  const suffix = placement.split('-')[1];

  // Map suffix to align-items value
  switch (suffix) {
    case 'left':
    case 'top':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'right':
    case 'bottom':
      return 'flex-end';
    default:
      return 'flex-start';
  }
};

/**
 * Safely extract string value from a potentially corrupted attribute.
 * WordPress media objects return {raw, rendered} structure, but attributes
 * should be strings. This handles both cases.
 *
 * @param {string|Object} value The attribute value.
 * @return {string} The string value.
 */
const safeStringValue = value => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    return value.rendered || value.raw || '';
  }
  return '';
};
const BoxControl = ({
  values,
  onChange,
  centerLabel = 'M',
  isDashed = true
}) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
  className: "photo-collage-box-control",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
    className: "photo-collage-box-row is-center",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top', 'photo-collage'),
      labelPosition: "top",
      value: values.top,
      onChange: value => onChange('top', value),
      className: "photo-collage-unit-control-small",
      __next40pxDefaultSize: true
    })
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
    className: "photo-collage-box-row is-space-between",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left', 'photo-collage'),
      labelPosition: "top",
      value: values.left,
      onChange: value => onChange('left', value),
      className: "photo-collage-unit-control-small",
      __next40pxDefaultSize: true
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      className: `photo-collage-box-center ${isDashed ? 'is-dashed' : 'is-solid'}`,
      children: centerLabel
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right', 'photo-collage'),
      labelPosition: "top",
      value: values.right,
      onChange: value => onChange('right', value),
      className: "photo-collage-unit-control-small",
      __next40pxDefaultSize: true
    })]
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
    className: "photo-collage-box-row is-center",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom', 'photo-collage'),
      labelPosition: "top",
      value: values.bottom,
      onChange: value => onChange('bottom', value),
      className: "photo-collage-unit-control-small",
      __next40pxDefaultSize: true
    })
  })]
});
function Edit({
  attributes,
  setAttributes,
  isSelected
}) {
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
    rotation = 0,
    opacity = 1,
    caption: rawCaption = '',
    title: rawTitle = '',
    description: rawDescription = '',
    align,
    href,
    linkTarget,
    rel,
    // eslint-disable-line no-unused-vars
    linkClass,
    // eslint-disable-line no-unused-vars
    linkDestination = 'none',
    showCaption = true,
    captionAlign = 'left',
    captionWidth = '100%',
    captionPlacement = 'bottom-left',
    lightbox = {
      enabled: false
    },
    imgClass = '',
    imgStyle = '',
    captionClass = '',
    captionStyle = ''
  } = attributes;
  const instanceId = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.useInstanceId)(Edit);

  // Safely extract string values from potentially corrupted attributes
  const caption = safeStringValue(rawCaption);
  const title = safeStringValue(rawTitle);
  const description = safeStringValue(rawDescription);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const onSetLink = ({
    url: newUrl,
    opensInNewTab
  }) => {
    setAttributes({
      href: newUrl,
      linkTarget: opensInNewTab ? '_blank' : undefined,
      rel: opensInNewTab ? 'noreferrer noopener' : undefined,
      lightbox: {
        enabled: false
      }
    });
    setIsLinkPopoverOpen(false);
    setAttributes({
      linkDestination: 'custom'
    });
  };
  const onRemoveLink = () => {
    setAttributes({
      href: undefined,
      linkTarget: undefined,
      rel: undefined,
      linkClass: undefined,
      linkDestination: 'none',
      lightbox: {
        enabled: false
      }
    });
  };
  const onLinkToMedia = () => {
    if (!media || !media.source_url) {
      return;
    }
    setAttributes({
      href: media.source_url,
      linkDestination: 'media',
      linkTarget: undefined,
      rel: undefined,
      linkClass: undefined,
      lightbox: {
        enabled: false
      }
    });
  };
  const onLinkToAttachment = () => {
    if (!media || !media.link) {
      return;
    }
    setAttributes({
      href: media.link,
      linkDestination: 'attachment',
      linkTarget: undefined,
      rel: undefined,
      linkClass: undefined,
      lightbox: {
        enabled: false
      }
    });
  };
  const onEnlargeOnClick = () => {
    setAttributes({
      href: undefined,
      linkDestination: 'none',
      linkTarget: undefined,
      rel: undefined,
      linkClass: undefined,
      lightbox: {
        enabled: true
      }
    });
  };
  const onSelectImage = media => {
    if (!media || !media.url) {
      return;
    }
    setAttributes({
      url: media.url,
      alt: media.alt || '',
      id: media.id,
      title: media.title?.rendered || media.title || '',
      caption: media.caption?.rendered || media.caption || '',
      description: media.description?.rendered || media.description || '',
      linkDestination: 'none',
      href: undefined,
      lightbox: {
        enabled: false
      }
    });
  };

  // Fetch media object for link functionality and legacy recovery
  const media = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => id ? select('core').getEntityRecord('postType', 'attachment', id) : null, [id]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    // Only auto-recover if URL is missing
    if (!url && media && media.source_url) {
      setAttributes({
        url: media.source_url,
        alt: media.alt_text || alt,
        title: media.title?.rendered || media.title || title,
        caption: media.caption?.rendered || media.caption || caption
      });
    }
  }, [media, url, alt, title, caption, setAttributes]);
  const onCaptionPlacementChange = newPlacement => {
    const newAttributes = {
      captionPlacement: newPlacement
    };
    const isSide = p => p.startsWith('left-') || p.startsWith('right-');
    const isNewSide = isSide(newPlacement);
    const isOldSide = isSide(captionPlacement);

    // Switching to side layout with default 100% width -> reset to 30%
    if (isNewSide && !isOldSide && captionWidth === '100%') {
      newAttributes.captionWidth = '30%';
    }

    // Switching from side layout to top/bottom with 30% width -> reset to 100%
    if (!isNewSide && isOldSide && captionWidth === '30%') {
      newAttributes.captionWidth = '100%';
    }
    setAttributes(newAttributes);
  };
  const onChangeAlt = newAlt => {
    setAttributes({
      alt: newAlt
    });
  };
  const onToggleDecorative = () => {
    setAttributes({
      isDecorative: !isDecorative,
      alt: !isDecorative ? '' : alt
    });
  };
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockProps)({
    style: {
      ...(useAbsolutePosition ? {
        position: 'absolute',
        top: top && top !== 'auto' ? top : undefined,
        right: right && right !== 'auto' ? right : undefined,
        bottom: bottom && bottom !== 'auto' ? bottom : undefined,
        left: left && left !== 'auto' ? left : undefined
      } : {
        position: 'relative',
        marginTop: !align || marginTop !== '0%' ? marginTop : undefined,
        marginRight: !align || marginRight !== '0%' ? marginRight : undefined,
        marginBottom: !align || marginBottom !== '0%' ? marginBottom : undefined,
        marginLeft: !align || marginLeft !== '0%' ? marginLeft : undefined
      }),
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      width: !align || width !== '50%' ? width : undefined,
      height,
      zIndex,
      transform: `rotate(${rotation}deg)`,
      opacity
    }
  });
  if (!url) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.MediaPlaceholder, {
        icon: "format-image",
        onSelect: onSelectImage,
        accept: "image/*",
        allowedTypes: ['image'],
        multiple: false,
        labels: {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Collage Image', 'photo-collage')
        }
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.BlockControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarGroup, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarDropdownMenu, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link', 'photo-collage'),
          controls: [{
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to image file', 'photo-collage'),
            icon: linkDestination === 'media' ? 'yes' : undefined,
            onClick: onLinkToMedia,
            isDisabled: !media || !media.source_url
          }, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link to attachment page', 'photo-collage'),
            icon: linkDestination === 'attachment' ? 'yes' : undefined,
            onClick: onLinkToAttachment,
            isDisabled: !media || !media.link
          }, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enlarge on click', 'photo-collage'),
            icon: linkDestination === 'none' && lightbox?.enabled ? 'yes' : undefined,
            onClick: onEnlargeOnClick
          }, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom URL', 'photo-collage'),
            icon: linkDestination === 'custom' ? 'yes' : undefined,
            onClick: () => setIsLinkPopoverOpen(true)
          }]
        })
      })
    }), isLinkPopoverOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Popover, {
      placement: "bottom",
      onClose: () => setIsLinkPopoverOpen(false),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(LinkControl, {
        className: "wp-block-navigation-link__inline-link-input",
        value: {
          url: href,
          opensInNewTab: linkTarget === '_blank'
        },
        onChange: onSetLink,
        onRemove: onRemoveLink,
        forceIsEditingLink: isLinkPopoverOpen
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.BlockControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarGroup, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.MediaReplaceFlow, {
          mediaId: id,
          mediaURL: url,
          allowedTypes: ['image'],
          accept: "image/*",
          onSelect: onSelectImage
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Dimensions', 'photo-collage'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Width', 'photo-collage'),
          id: `inspector-image-width-${instanceId}`,
          value: width,
          onChange: value => setAttributes({
            width: value
          }),
          __next40pxDefaultSize: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Height', 'photo-collage'),
          id: `inspector-image-height-${instanceId}`,
          value: height,
          onChange: value => setAttributes({
            height: value
          }),
          __next40pxDefaultSize: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Positioning', 'photo-collage'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Use Absolute Positioning', 'photo-collage'),
          id: `inspector-image-absolute-position-${instanceId}`,
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Position image relative to container edges instead of using margins.', 'photo-collage'),
          checked: useAbsolutePosition,
          onChange: value => setAttributes({
            useAbsolutePosition: value
          }),
          __nextHasNoMarginBottom: true
        }), useAbsolutePosition && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "photo-collage-help-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Click an anchor point to pin the image to that corner.', 'photo-collage')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
            className: "photo-collage-anchor-control",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
              className: "photo-collage-anchor-grid",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
                className: `photo-collage-anchor-btn ${top !== 'auto' && left !== 'auto' ? 'is-active' : ''}`,
                onClick: () => setAttributes({
                  top: '0%',
                  left: '0%',
                  bottom: 'auto',
                  right: 'auto'
                }),
                icon: "arrow-left-alt2",
                style: {
                  transform: 'rotate(45deg)'
                },
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top Left', 'photo-collage')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
                className: `photo-collage-anchor-btn ${top !== 'auto' && right !== 'auto' ? 'is-active' : ''}`,
                onClick: () => setAttributes({
                  top: '0%',
                  right: '0%',
                  bottom: 'auto',
                  left: 'auto'
                }),
                icon: "arrow-up-alt2",
                style: {
                  transform: 'rotate(45deg)'
                },
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top Right', 'photo-collage')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
                className: `photo-collage-anchor-btn ${bottom !== 'auto' && left !== 'auto' ? 'is-active' : ''}`,
                onClick: () => setAttributes({
                  bottom: '0%',
                  left: '0%',
                  top: 'auto',
                  right: 'auto'
                }),
                icon: "arrow-down-alt2",
                style: {
                  transform: 'rotate(45deg)'
                },
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom Left', 'photo-collage')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
                className: `photo-collage-anchor-btn ${bottom !== 'auto' && right !== 'auto' ? 'is-active' : ''}`,
                onClick: () => setAttributes({
                  bottom: '0%',
                  right: '0%',
                  top: 'auto',
                  left: 'auto'
                }),
                icon: "arrow-right-alt2",
                style: {
                  transform: 'rotate(45deg)'
                },
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom Right', 'photo-collage')
              })]
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "photo-collage-position-controls",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "photo-collage-position-row is-center",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Top', 'photo-collage'),
                id: `inspector-image-top-${instanceId}`,
                value: top,
                onChange: value => {
                  const newValue = value || 'auto';
                  setAttributes({
                    top: newValue,
                    bottom: newValue !== 'auto' ? 'auto' : bottom
                  });
                },
                __next40pxDefaultSize: true
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
              className: "photo-collage-position-row is-space-between",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left', 'photo-collage'),
                id: `inspector-image-left-${instanceId}`,
                value: left,
                onChange: value => {
                  const newValue = value || 'auto';
                  setAttributes({
                    left: newValue,
                    right: newValue !== 'auto' ? 'auto' : right
                  });
                },
                __next40pxDefaultSize: true
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right', 'photo-collage'),
                id: `inspector-image-right-${instanceId}`,
                value: right,
                onChange: value => {
                  const newValue = value || 'auto';
                  setAttributes({
                    right: newValue,
                    left: newValue !== 'auto' ? 'auto' : left
                  });
                },
                __next40pxDefaultSize: true
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
              className: "photo-collage-position-row is-center",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Bottom', 'photo-collage'),
                id: `inspector-image-bottom-${instanceId}`,
                value: bottom,
                onChange: value => {
                  const newValue = value || 'auto';
                  setAttributes({
                    bottom: newValue,
                    top: newValue !== 'auto' ? 'auto' : top
                  });
                },
                __next40pxDefaultSize: true
              })
            })]
          })]
        }), !useAbsolutePosition && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(BoxControl, {
          values: {
            top: marginTop,
            right: marginRight,
            bottom: marginBottom,
            left: marginLeft
          },
          onChange: (side, value) => {
            const key = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
            setAttributes({
              [key]: value
            });
          },
          centerLabel: "M",
          isDashed: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          className: "photo-collage-z-index-control",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.RangeControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Z-Index (Layer Order)', 'photo-collage'),
            id: `inspector-image-z-index-${instanceId}`,
            value: zIndex,
            onChange: value => setAttributes({
              zIndex: value
            }),
            min: -10,
            max: 100,
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Higher numbers are on top.', 'photo-collage'),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
            className: "photo-collage-z-index-buttons",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
              variant: "secondary",
              size: "small",
              onClick: () => setAttributes({
                zIndex: zIndex - 1
              }),
              icon: "minus",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move Backward', 'photo-collage')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
              variant: "secondary",
              size: "small",
              onClick: () => setAttributes({
                zIndex: zIndex + 1
              }),
              icon: "plus",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move Forward', 'photo-collage')
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Padding', 'photo-collage'),
        initialOpen: true,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(BoxControl, {
          values: {
            top: paddingTop,
            right: paddingRight,
            bottom: paddingBottom,
            left: paddingLeft
          },
          onChange: (side, value) => {
            const key = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
            setAttributes({
              [key]: value
            });
          },
          centerLabel: "P",
          isDashed: false
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Effects', 'photo-collage'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("span", {
            style: {
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'uppercase',
              color: '#1e1e1e'
            },
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Rotation', 'photo-collage')
          }), rotation !== 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
            size: "small",
            variant: "tertiary",
            onClick: () => setAttributes({
              rotation: 0
            }),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset', 'photo-collage')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.RangeControl, {
          value: rotation,
          id: `inspector-image-rotation-${instanceId}`,
          onChange: value => setAttributes({
            rotation: value
          }),
          min: -180,
          max: 180,
          help: rotation !== 0 ? `${rotation}°` : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No rotation applied', 'photo-collage'),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Opacity', 'photo-collage'),
          id: `inspector-image-opacity-${instanceId}`,
          value: opacity,
          onChange: value => setAttributes({
            opacity: value
          }),
          min: 0,
          max: 1,
          step: 0.01,
          help: `${Math.round(opacity * 100)}%`,
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility', 'photo-collage'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Mark as decorative', 'photo-collage'),
          id: `inspector-image-is-decorative-${instanceId}`,
          help: isDecorative ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This image will be hidden from screen readers.', 'photo-collage') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('This image requires alt text for screen readers.', 'photo-collage'),
          checked: isDecorative,
          onChange: onToggleDecorative,
          __nextHasNoMarginBottom: true
        }), !isDecorative && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Alt Text', 'photo-collage'),
            id: `inspector-image-alt-${instanceId}`,
            value: alt,
            onChange: onChangeAlt,
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Describe what the image shows and its purpose in the collage.', 'photo-collage'),
            placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enter image description…', 'photo-collage'),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Title', 'photo-collage'),
            id: `inspector-image-title-${instanceId}`,
            value: title,
            onChange: value => setAttributes({
              title: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Optional. Appears as a tooltip when hovering over the image.', 'photo-collage'),
            placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enter image title…', 'photo-collage'),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Description', 'photo-collage'),
            id: `inspector-image-description-${instanceId}`,
            value: description,
            onChange: value => setAttributes({
              description: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Optional. Extended description for additional context.', 'photo-collage'),
            placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enter extended description…', 'photo-collage'),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption Settings', 'photo-collage'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show Caption', 'photo-collage'),
          id: `inspector-image-show-caption-${instanceId}`,
          checked: showCaption,
          onChange: () => setAttributes({
            showCaption: !showCaption
          }),
          __nextHasNoMarginBottom: true
        }), showCaption && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "components-base-control__label",
            style: {
              marginBottom: '8px'
            },
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption Position', 'photo-collage')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_components_caption_position_control__WEBPACK_IMPORTED_MODULE_8__["default"], {
            value: captionPlacement,
            onChange: onCaptionPlacementChange
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Alignment', 'photo-collage'),
            id: `inspector-image-caption-align-${instanceId}`,
            value: captionAlign,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left', 'photo-collage'),
              value: 'left'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center', 'photo-collage'),
              value: 'center'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right', 'photo-collage'),
              value: 'right'
            }],
            onChange: value => setAttributes({
              captionAlign: value
            }),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(UnitControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption Width', 'photo-collage'),
            id: `inspector-image-caption-width-${instanceId}`,
            value: captionWidth,
            onChange: value => setAttributes({
              captionWidth: value
            }),
            __next40pxDefaultSize: true
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom Styles', 'photo-collage'),
        initialOpen: false,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
          className: "components-base-control__label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Image Styles', 'photo-collage')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Image CSS Class', 'photo-collage'),
          value: imgClass,
          onChange: value => setAttributes({
            imgClass: value
          }),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add custom CSS classes to the image element.', 'photo-collage'),
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextareaControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Image Inline Style', 'photo-collage'),
          value: imgStyle,
          onChange: value => setAttributes({
            imgStyle: value
          }),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add custom inline CSS styles to the image element (e.g., border: 1px solid red;).', 'photo-collage'),
          __nexthasNoMarginBottom: true
        }), showCaption && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
            style: {
              height: '20px'
            }
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("p", {
            className: "components-base-control__label",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption Styles', 'photo-collage')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption CSS Class', 'photo-collage'),
            value: captionClass,
            onChange: value => setAttributes({
              captionClass: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add custom CSS classes to the caption element.', 'photo-collage'),
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextareaControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Caption Inline Style', 'photo-collage'),
            value: captionStyle,
            onChange: value => setAttributes({
              captionStyle: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add custom inline CSS styles to the caption element.', 'photo-collage'),
            __nexthasNoMarginBottom: true
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("figure", {
        className: "photo-collage-image-figure",
        style: {
          display: showCaption ? 'flex' : undefined,
          flexDirection: showCaption ? getFlexDirection(captionPlacement) : undefined,
          alignItems: showCaption ? getAlignItems(captionPlacement) : undefined
        },
        children: [showCaption && (captionPlacement.startsWith('left-') || captionPlacement.startsWith('top-')) && (!_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.RichText.isEmpty(caption) || isSelected) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.BlockControls, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.AlignmentToolbar, {
              value: captionAlign,
              onChange: value => setAttributes({
                captionAlign: value
              })
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.RichText, {
            tagName: "figcaption",
            className: "photo-collage-image-caption wp-element-caption",
            placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Write caption…', 'photo-collage'),
            value: caption,
            onChange: value => setAttributes({
              caption: value
            }),
            inlineToolbar: true,
            allowedFormats: ['core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'core/text-color', 'core/subscript', 'core/superscript'],
            style: {
              textAlign: captionAlign,
              width: captionWidth
            }
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("img", {
          src: url,
          alt: alt,
          style: {
            objectFit: 'contain',
            width: showCaption && (captionPlacement.startsWith('left-') || captionPlacement.startsWith('right-')) ? 'auto' : '100%',
            height: showCaption && (captionPlacement.startsWith('top-') || captionPlacement.startsWith('bottom-')) ? 'auto' : '100%',
            flex: showCaption ? '1' : undefined,
            minWidth: showCaption ? '0' : undefined,
            minHeight: showCaption ? '0' : undefined
          }
        }), showCaption && (captionPlacement.startsWith('right-') || captionPlacement.startsWith('bottom-')) && (!_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.RichText.isEmpty(caption) || isSelected) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.BlockControls, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.AlignmentToolbar, {
              value: captionAlign,
              onChange: value => setAttributes({
                captionAlign: value
              })
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.RichText, {
            tagName: "figcaption",
            className: "photo-collage-image-caption wp-element-caption",
            placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Write caption…', 'photo-collage'),
            value: caption,
            onChange: value => setAttributes({
              caption: value
            }),
            inlineToolbar: true,
            allowedFormats: ['core/bold', 'core/italic', 'core/link', 'core/strikethrough', 'core/text-color', 'core/subscript', 'core/superscript'],
            style: {
              textAlign: captionAlign,
              width: captionWidth
            }
          })]
        })]
      })
    })]
  });
}

/***/ }),

/***/ "./src/blocks/image/editor.scss":
/*!**************************************!*\
  !*** ./src/blocks/image/editor.scss ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/blocks/image/index.js":
/*!***********************************!*\
  !*** ./src/blocks/image/index.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./src/blocks/image/style.scss");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit */ "./src/blocks/image/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./save */ "./src/blocks/image/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./block.json */ "./src/blocks/image/block.json");
/* harmony import */ var _transforms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./transforms */ "./src/blocks/image/transforms.js");






(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_4__, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_2__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_3__["default"],
  transforms: _transforms__WEBPACK_IMPORTED_MODULE_5__["default"]
});

/***/ }),

/***/ "./src/blocks/image/save.js":
/*!**********************************!*\
  !*** ./src/blocks/image/save.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
function save() {
  return null;
}

/***/ }),

/***/ "./src/blocks/image/style.scss":
/*!*************************************!*\
  !*** ./src/blocks/image/style.scss ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/blocks/image/transforms.js":
/*!****************************************!*\
  !*** ./src/blocks/image/transforms.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/**
 * WordPress dependencies
 */

const transforms = {
  from: [{
    type: 'block',
    blocks: ['core/image'],
    transform: attributes => {
      return (0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.createBlock)('photo-collage/image', {
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
        height: 'auto'
      });
    }
  }],
  to: [{
    type: 'block',
    blocks: ['core/image'],
    transform: attributes => {
      return (0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.createBlock)('core/image', {
        url: attributes.url,
        alt: attributes.alt,
        id: attributes.id,
        title: attributes.title,
        caption: attributes.caption,
        href: attributes.href,
        linkTarget: attributes.linkTarget,
        rel: attributes.rel,
        linkClass: attributes.linkClass
      });
    }
  }]
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (transforms);

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/primitives":
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["primitives"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"blocks/image/index": 0,
/******/ 			"blocks/image/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkphoto_collage"] = globalThis["webpackChunkphoto_collage"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["blocks/image/style-index"], () => (__webpack_require__("./src/blocks/image/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map