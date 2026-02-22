#!/usr/bin/env node

const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WP_PATH = '/Users/degner/Local Sites/avif-testing/app/public';
const BASE_URL = 'http://avif-testing.local';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const EDIT_JS_PATH =
	'/Users/degner/Local Sites/avif-testing/app/public/wp-content/plugins/photo-collage/src/blocks/container/presets.js';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(
	'/Users/degner/Local Sites/avif-testing/app/public/wp-content/plugins/photo-collage/research/qa-artifacts',
	timestamp + '-templates'
);
fs.mkdirSync(outDir, { recursive: true });

const templateOrder = [
	{ id: 'floating-editorial-mosaic', label: 'Floating Mosaic' },
	{ id: 'split-screen-asymmetric', label: 'Split Asymmetric' },
	{ id: 'hero-satellite-images', label: 'Hero + Satellites' },
	{ id: 'modular-project-grid', label: 'Modular Grid' },
	{ id: 'minimal-project-index-thumbs', label: 'Minimal Index + Thumbs' },
	{ id: 'editorial-storytelling-stream', label: 'Story Stream' },
	{ id: 'dense-contact-sheet-grid', label: 'Contact Sheet' },
	{ id: 'side-by-side', label: 'Side by Side' },
	{ id: 'three-columns', label: 'Three Columns' },
	{ id: 'overlap-left', label: 'Overlap Left' },
	{ id: 'overlap-right', label: 'Overlap Right' },
	{ id: 'three-grid', label: 'Three Grid' },
	{ id: 'offset-grid', label: 'Offset Grid' },
	{ id: 'scatter', label: 'Scatter' },
	{ id: 'hero-layered', label: 'Hero Layered' },
	{ id: 'vertical-wave', label: 'Vertical Wave' },
	{ id: 'staggered-story', label: 'Staggered Story' },
	{ id: 'offset-gallery', label: 'Offset Gallery' },
	{ id: 'center-overlay', label: 'Center Overlay' },
];

const expectedHeights = {
	'split-screen-asymmetric': '1650px',
	'hero-satellite-images': '1300px',
	'minimal-project-index-thumbs': '1600px',
	scatter: '1500px',
	'vertical-wave': '1200px',
	'staggered-story': '1200px',
	'offset-gallery': '1400px',
};

function stripWpDeprecations(output) {
	return output
		.split('\n')
		.filter(
			(line) =>
				!line.startsWith('PHP Deprecated:') &&
				!line.startsWith('Deprecated:')
		)
		.join('\n')
		.trim();
}

function runWp(args) {
	const result = spawnSync('wp', [`--path=${WP_PATH}`, ...args], {
		encoding: 'utf8',
		maxBuffer: 20 * 1024 * 1024,
	});

	const stdout = stripWpDeprecations(result.stdout || '');
	const stderr = stripWpDeprecations(result.stderr || '');

	if (result.status !== 0) {
		throw new Error(
			`WP-CLI failed (${result.status})\nargs: ${args.join(' ')}\nstdout:\n${stdout}\nstderr:\n${stderr}`
		);
	}

	return stdout;
}

function getAttachments(limit = 40) {
	const csv = runWp([
		'post',
		'list',
		'--post_type=attachment',
		'--post_status=inherit',
		'--orderby=ID',
		'--order=DESC',
		'--fields=ID,guid',
		'--format=csv',
	]);

	const rows = csv
		.split('\n')
		.slice(1)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const firstComma = line.indexOf(',');
			if (firstComma === -1) {
				return null;
			}
			const id = Number(line.slice(0, firstComma));
			const guid = line.slice(firstComma + 1);
			if (!id || !guid) {
				return null;
			}
			return { id, url: guid };
		})
		.filter(Boolean)
		.slice(0, limit);

	if (rows.length < 20) {
		throw new Error(`Expected at least 20 media items, got ${rows.length}`);
	}

	return rows;
}

function loadPresetsFromSource() {
	const source = fs.readFileSync(EDIT_JS_PATH, 'utf8');
	const startToken = 'export const PRESETS = {';
	const endToken = '\n};\n\nconst clamp';
	const start = source.indexOf(startToken);
	const end = source.indexOf(endToken, start);

	if (start === -1 || end === -1) {
		throw new Error('Could not parse PRESETS from edit.js');
	}

	const objectLiteral = source.slice(start + 'const PRESETS = '.length, end + 2);
	// eslint-disable-next-line no-new-func
	return new Function(`return (${objectLiteral});`)();
}

function buildImageBlock(attrs) {
	return `<!-- wp:photo-collage/image ${JSON.stringify(attrs)} /-->`;
}

function buildContainerBlock({ heightMode = 'auto', stackOnMobile = true, layout, mediaItems }) {
	const containerAttrs = { heightMode, stackOnMobile };
	const opening = `<!-- wp:photo-collage/container ${JSON.stringify(containerAttrs)} -->`;
	const images = layout
		.map((layoutAttrs, index) => {
			const media = mediaItems[index % mediaItems.length];
			return buildImageBlock({
				id: media.id,
				url: media.url,
				alt: `Template QA image ${index + 1}`,
				...layoutAttrs,
			});
		})
		.join('\n');
	const closing = '<!-- /wp:photo-collage/container -->';
	return `${opening}\n${images}\n${closing}`;
}

function createPost({ title, content }) {
	const postId = runWp([
		'post',
		'create',
		'--post_type=post',
		'--post_status=publish',
		`--post_title=${title}`,
		`--post_content=${content}`,
		'--porcelain',
	]).trim();
	const postUrl = runWp(['post', 'url', postId]).trim();
	return { postId: Number(postId), postUrl, title };
}

async function loginIfNeeded(page) {
	if (await page.locator('#user_login').count()) {
		await page.fill('#user_login', USERNAME);
		await page.fill('#user_pass', PASSWORD);
		await page.click('#wp-submit');
		await page
			.waitForURL((url) => !url.pathname.includes('wp-login.php'), {
				timeout: 30000,
			})
			.catch(() => {});
		await page.waitForTimeout(1200);
	}
}

async function ensureEditorSidebar(page) {
	const sidebar = page.locator('.interface-complementary-area');
	if (await sidebar.count()) {
		return;
	}

	const settingsButton = page.getByRole('button', { name: /settings/i });
	if (await settingsButton.count()) {
		await settingsButton.first().click();
		await page.waitForTimeout(500);
	}
}

async function insertContainer(page) {
	await page.evaluate(() => {
		const block = window.wp.blocks.createBlock('photo-collage/container');
		window.wp.data.dispatch('core/block-editor').insertBlocks(block);
	});
	await page.waitForTimeout(450);
}

async function selectLastContainerBlock(page) {
	await page.evaluate(() => {
		const blocks = window.wp.data.select('core/block-editor').getBlocks();
		const container = [...blocks]
			.reverse()
			.find((block) => block.name === 'photo-collage/container');

		if (container) {
			window.wp.data.dispatch('core/block-editor').selectBlock(container.clientId);
		}
	});
	await page.waitForTimeout(300);
	await page.getByRole('tab', { name: /block/i }).first().click();
	await page.waitForTimeout(300);
}

async function setHeightMode(page, mode) {
	const selector = page
		.locator('.interface-complementary-area select')
		.filter({ has: page.locator('option[value="auto"]') })
		.first();
	await selector.selectOption(mode);
	await page.waitForTimeout(250);
}

async function clickTemplateButton(page, label) {
	await page
		.locator('.photo-collage-layout-button')
		.filter({ hasText: label })
		.first()
		.click();
}

async function getSelectedContainerState(page) {
	return page.evaluate(() => {
		const selectedClientId = window.wp.data
			.select('core/block-editor')
			.getSelectedBlockClientId();
		if (!selectedClientId) {
			return null;
		}

		const selected = window.wp.data
			.select('core/block-editor')
			.getBlock(selectedClientId);
		if (!selected || selected.name !== 'photo-collage/container') {
			return null;
		}

		return {
			clientId: selected.clientId,
			heightMode: selected.attributes.heightMode,
			containerHeight: selected.attributes.containerHeight || '',
			innerCount: selected.innerBlocks.length,
			absoluteCount: selected.innerBlocks.filter(
				(inner) => inner.attributes.useAbsolutePosition === true
			).length,
			nonOriginalAspectRatioCount: selected.innerBlocks.filter((inner) => {
				const value = inner.attributes.aspectRatio;
				return value && value !== '' && value !== 'auto';
			}).length,
			signature: selected.innerBlocks.map((inner) => ({
				top: inner.attributes.top,
				left: inner.attributes.left,
				width: inner.attributes.width,
				marginTop: inner.attributes.marginTop,
				marginLeft: inner.attributes.marginLeft,
				useAbsolutePosition: !!inner.attributes.useAbsolutePosition,
			})),
		};
	});
}

function pushAssertion(results, name, pass, details) {
	results.assertions.push({ name, pass, details });
}

function sanitizeSlug(text) {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function runEditorTemplateChecks(page, results, presets) {
	await page.goto(`${BASE_URL}/wp-admin/post-new.php`, { waitUntil: 'domcontentloaded' });
	await loginIfNeeded(page);
	await page.waitForSelector('iframe[name="editor-canvas"]', { timeout: 30000 });
	await ensureEditorSidebar(page);

	await insertContainer(page);
	await selectLastContainerBlock(page);
	await setHeightMode(page, 'fixed');

	const buttonCount = await page.locator('.photo-collage-layout-button').count();
	pushAssertion(results, 'Editor: all layout buttons visible', buttonCount === templateOrder.length, {
		buttonCount,
		expected: templateOrder.length,
	});

	for (const template of templateOrder) {
		await selectLastContainerBlock(page);
		await setHeightMode(page, 'fixed');
		await clickTemplateButton(page, template.label);
		await page.waitForTimeout(450);

		const state = await getSelectedContainerState(page);
		results.editor.fixed[template.id] = state;

		const expectedCount = presets[template.id].length;
		const expectedAbsolute = presets[template.id].filter((attrs) => attrs.useAbsolutePosition === true)
			.length;
		const expectedHeight = expectedHeights[template.id] || '';

		pushAssertion(
			results,
			`Editor fixed ${template.label}: image count`,
			state && state.innerCount === expectedCount,
			{ expectedCount, actual: state }
		);
		pushAssertion(
			results,
			`Editor fixed ${template.label}: absolute count`,
			state && state.absoluteCount === expectedAbsolute,
			{ expectedAbsolute, actual: state }
		);
		pushAssertion(
			results,
			`Editor fixed ${template.label}: container height`,
			state && state.containerHeight === expectedHeight,
			{ expectedHeight, actual: state }
		);
		pushAssertion(
			results,
			`Editor fixed ${template.label}: no forced non-original aspect ratio`,
			state && state.nonOriginalAspectRatioCount === 0,
			state
		);
	}

	// Floating Mosaic randomization check
	await selectLastContainerBlock(page);
	await setHeightMode(page, 'fixed');
	await clickTemplateButton(page, 'Floating Mosaic');
	await page.waitForTimeout(450);
	const firstFloating = await getSelectedContainerState(page);
	await clickTemplateButton(page, 'Floating Mosaic');
	await page.waitForTimeout(450);
	const secondFloating = await getSelectedContainerState(page);

	const randomized = firstFloating.signature.some((item, index) => {
		const next = secondFloating.signature[index];
		return (
			item.top !== next.top ||
			item.left !== next.left ||
			item.width !== next.width
		);
	});

	pushAssertion(results, 'Editor: Floating Mosaic randomizes on repeated apply', randomized, {
		first: firstFloating.signature.slice(0, 5),
		second: secondFloating.signature.slice(0, 5),
	});

	// Auto mode check on a fresh container to ensure presets do not set fixed height.
	await insertContainer(page);
	await selectLastContainerBlock(page);
	await setHeightMode(page, 'auto');

	for (const template of templateOrder) {
		await selectLastContainerBlock(page);
		await setHeightMode(page, 'auto');
		await clickTemplateButton(page, template.label);
		await page.waitForTimeout(350);
		const state = await getSelectedContainerState(page);
		results.editor.auto[template.id] = state;
		pushAssertion(
			results,
			`Editor auto ${template.label}: containerHeight remains unset`,
			state && state.containerHeight === '',
			state
		);
	}

	const editorShot = path.join(outDir, 'editor-all-templates-check.png');
	await page.screenshot({ path: editorShot, fullPage: true });
	results.screenshots.editor = editorShot;
}

async function measureContainer(page, url, screenshotPath) {
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.waitForTimeout(350);

	const metrics = await page.evaluate(() => {
		const container = document.querySelector('.wp-block-photo-collage-container');
		if (!container) {
			return null;
		}

		const allItems = Array.from(
			container.querySelectorAll('.wp-block-photo-collage-image, .wp-block-photo-collage-frame')
		).filter((item) => item.closest('.wp-block-photo-collage-container') === container);

		const absoluteCount = allItems.filter(
			(item) => window.getComputedStyle(item).position === 'absolute'
		).length;

		const first = allItems[0] ? window.getComputedStyle(allItems[0]).position : null;

		return {
			datasetHeightMode: container.dataset.heightMode || null,
			inlineHeight: container.style.height || '',
			computedHeight: Math.round(container.getBoundingClientRect().height),
			itemCount: allItems.length,
			absoluteCount,
			firstItemPosition: first,
		};
	});

	await page.screenshot({ path: screenshotPath, fullPage: true });
	return metrics;
}

async function runFrontendChecks(presets, mediaItems, results) {
	for (const template of templateOrder) {
		const content = buildContainerBlock({
			heightMode: 'auto',
			stackOnMobile: true,
			layout: presets[template.id],
			mediaItems,
		});
		const created = createPost({
			title: `QA Template ${template.label} ${timestamp}`,
			content,
		});
		results.createdPosts.push({ template: template.id, ...created });
	}

	const desktop = await chromium.launch({ headless: true });
	const desktopContext = await desktop.newContext({ viewport: { width: 1440, height: 1200 } });
	const desktopPage = await desktopContext.newPage();

	for (const created of results.createdPosts) {
		const template = templateOrder.find((item) => item.id === created.template);
		const shot = path.join(
			outDir,
			`frontend-desktop-${sanitizeSlug(template.label)}.png`
		);
		const metrics = await measureContainer(desktopPage, created.postUrl, shot);
		results.frontend.desktop[created.template] = metrics;
		results.screenshots.desktop[created.template] = shot;

		const expectedCount = presets[created.template].length;
		const expectedAbsolute = presets[created.template].filter(
			(attrs) => attrs.useAbsolutePosition === true
		).length;

		pushAssertion(
			results,
			`Frontend desktop ${template.label}: item count`,
			metrics && metrics.itemCount === expectedCount,
			{ expectedCount, metrics }
		);
		pushAssertion(
			results,
			`Frontend desktop ${template.label}: absolute count`,
			metrics && metrics.absoluteCount === expectedAbsolute,
			{ expectedAbsolute, metrics }
		);
		pushAssertion(
			results,
			`Frontend desktop ${template.label}: auto mode marker`,
			metrics && metrics.datasetHeightMode === 'auto',
			metrics
		);
		if ( expectedAbsolute > 0 ) {
			pushAssertion(
				results,
				`Frontend desktop ${template.label}: computed auto height`,
				metrics && /px$/.test(metrics.inlineHeight) && metrics.computedHeight > 200,
				metrics
			);
		} else {
			pushAssertion(
				results,
				`Frontend desktop ${template.label}: no forced inline height`,
				metrics && metrics.inlineHeight === '',
				metrics
			);
		}
	}

	await desktopContext.close();
	await desktop.close();

	const mobile = await chromium.launch({ headless: true });
	const mobileContext = await mobile.newContext({ viewport: { width: 375, height: 900 } });
	const mobilePage = await mobileContext.newPage();

	for (const created of results.createdPosts) {
		const template = templateOrder.find((item) => item.id === created.template);
		const shot = path.join(
			outDir,
			`frontend-mobile-${sanitizeSlug(template.label)}.png`
		);
		const metrics = await measureContainer(mobilePage, created.postUrl, shot);
		results.frontend.mobile[created.template] = metrics;
		results.screenshots.mobile[created.template] = shot;

		pushAssertion(
			results,
			`Frontend mobile ${template.label}: stacked first item static`,
			metrics && metrics.firstItemPosition === 'static',
			metrics
		);
		pushAssertion(
			results,
			`Frontend mobile ${template.label}: no inline height`,
			metrics && metrics.inlineHeight === '',
			metrics
		);
	}

	await mobileContext.close();
	await mobile.close();
}

async function run() {
	const presets = loadPresetsFromSource();
	const mediaItems = getAttachments(50);

	const results = {
		timestamp,
		createdPosts: [],
		editor: {
			fixed: {},
			auto: {},
		},
		frontend: {
			desktop: {},
			mobile: {},
		},
		screenshots: {
			editor: null,
			desktop: {},
			mobile: {},
		},
		assertions: [],
	};

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
	const page = await context.newPage();
	await runEditorTemplateChecks(page, results, presets);
	await context.close();
	await browser.close();

	await runFrontendChecks(presets, mediaItems, results);

	results.summary = {
		total: results.assertions.length,
		passed: results.assertions.filter((assertion) => assertion.pass).length,
		failed: results.assertions.filter((assertion) => !assertion.pass).length,
	};

	const reportPath = path.join(outDir, 'template-regression-report.json');
	fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

	console.log(
		JSON.stringify(
			{
				outDir,
				reportPath,
				summary: results.summary,
				createdPosts: results.createdPosts.length,
			},
			null,
			2
		)
	);

	if (results.summary.failed > 0) {
		process.exit(1);
	}
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
