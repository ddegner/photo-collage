#!/usr/bin/env node

const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WP_PATH = '/Users/degner/Local Sites/avif-testing/app/public';
const BASE_URL = 'http://avif-testing.local';
const USERNAME = 'admin';
const PASSWORD = 'admin';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(
	'/Users/degner/Local Sites/avif-testing/app/public/wp-content/plugins/photo-collage/research/qa-artifacts',
	timestamp
);
fs.mkdirSync(outDir, { recursive: true });

const floatingMosaicLayout = [
	{ useAbsolutePosition: true, width: '14%', top: '3%', left: '7%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '32%', top: '10%', left: '35%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '12%', top: '22%', left: '76%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '24%', top: '31%', left: '13%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '16%', top: '39%', left: '50%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '11%', top: '48%', left: '69%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '28%', top: '57%', left: '28%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '12%', top: '65%', left: '9%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '19%', top: '74%', left: '58%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '14%', top: '84%', left: '34%', zIndex: 1 },
	{ useAbsolutePosition: true, width: '11%', top: '90%', left: '79%', zIndex: 1 },
];

const modularGridLayout = [
	{ width: '48%', marginLeft: '0%', marginTop: '0%', zIndex: 1 },
	{ width: '48%', marginLeft: '2%', marginTop: '0%', zIndex: 1 },
	{ width: '31%', marginLeft: '0%', marginTop: '2%', zIndex: 1 },
	{ width: '31%', marginLeft: '3.5%', marginTop: '2%', zIndex: 1 },
	{ width: '31%', marginLeft: '3.5%', marginTop: '2%', zIndex: 1 },
	{ width: '58%', marginLeft: '0%', marginTop: '2%', zIndex: 1 },
	{ width: '40%', marginLeft: '2%', marginTop: '2%', zIndex: 1 },
	{ width: '40%', marginLeft: '0%', marginTop: '2%', zIndex: 1 },
	{ width: '26%', marginLeft: '2%', marginTop: '2%', zIndex: 1 },
	{ width: '30%', marginLeft: '2%', marginTop: '2%', zIndex: 1 },
];

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
		maxBuffer: 10 * 1024 * 1024,
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

function getAttachments(limit = 20) {
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

	if (rows.length < 12) {
		throw new Error(`Expected at least 12 media items, got ${rows.length}`);
	}

	return rows;
}

function buildImageBlock(attrs) {
	return `<!-- wp:photo-collage/image ${JSON.stringify(attrs)} /-->`;
}

function buildContainerBlock({ heightMode, containerHeight, stackOnMobile, layout, mediaItems }) {
	const containerAttrs = { heightMode, stackOnMobile };
	if (heightMode === 'fixed' && containerHeight) {
		containerAttrs.containerHeight = containerHeight;
	}

	const opening = `<!-- wp:photo-collage/container ${JSON.stringify(containerAttrs)} -->`;
	const images = layout
		.map((layoutAttrs, index) => {
			const media = mediaItems[index % mediaItems.length];
			return buildImageBlock({
				id: media.id,
				url: media.url,
				alt: `QA image ${index + 1}`,
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
		await page.waitForTimeout(1000);
	}
}

async function ensureEditorSidebar(page) {
	const sidebar = page.locator('.interface-interface-skeleton__sidebar');
	if (await sidebar.count()) {
		return;
	}

	const settingsButton = page.getByRole('button', { name: /settings/i });
	if (await settingsButton.count()) {
		await settingsButton.first().click();
		await page.waitForTimeout(500);
	}
}

async function testEditorTemplateBehavior(page, results) {
	await page.goto(`${BASE_URL}/wp-admin/post-new.php`, { waitUntil: 'domcontentloaded' });
	await loginIfNeeded(page);
	await page.waitForSelector('iframe[name="editor-canvas"]', { timeout: 30000 });

	const closeWelcome = page.getByRole('button', { name: /close dialog/i });
	if (await closeWelcome.count()) {
		await closeWelcome.first().click({ timeout: 1000 }).catch(() => {});
	}

	await ensureEditorSidebar(page);

	const canvasFrame = page.frameLocator('iframe[name="editor-canvas"]');
	await canvasFrame
		.locator('.block-editor-default-block-appender__content')
		.first()
		.click();
	await page.keyboard.type('/Collage Container');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(1200);

	await page.evaluate(() => {
		const containerBlock = window.wp.data
			.select('core/block-editor')
			.getBlocks()
			.find((block) => block.name === 'photo-collage/container');

		if (containerBlock) {
			window.wp.data
				.dispatch('core/block-editor')
				.selectBlock(containerBlock.clientId);
		}
	});
	await page.waitForTimeout(600);
	await page.getByRole('tab', { name: /block/i }).first().click();
	await ensureEditorSidebar(page);

	const heightModeSelect = page
		.locator('.interface-complementary-area select')
		.filter({ has: page.locator('option[value="auto"]') })
		.first();
	await heightModeSelect.selectOption('auto');
	await page.getByRole('button', { name: /Floating Mosaic/i }).click();
	await page.waitForTimeout(700);

	const autoAttrs = await page.evaluate(() => {
		const block = window.wp.data
			.select('core/block-editor')
			.getBlocks()
			.find((b) => b.name === 'photo-collage/container');
		if (!block) {
			return null;
		}
		return {
			heightMode: block.attributes.heightMode,
			containerHeight: block.attributes.containerHeight,
			innerCount: block.innerBlocks.length,
			allAbsolute: block.innerBlocks.every(
				(inner) => inner.attributes.useAbsolutePosition === true
			),
		};
	});

	if (!autoAttrs) {
		throw new Error('Could not find container block in editor state');
	}

	results.editor.autoTemplate = autoAttrs;
	results.assertions.push({
		name: 'Editor: auto mode keeps containerHeight empty after Floating Mosaic apply',
		pass:
			autoAttrs.heightMode === 'auto' &&
			(!autoAttrs.containerHeight || autoAttrs.containerHeight === ''),
		details: autoAttrs,
	});

	await page.evaluate(() => {
		const containerBlock = window.wp.data
			.select('core/block-editor')
			.getBlocks()
			.find((block) => block.name === 'photo-collage/container');

		if (containerBlock) {
			window.wp.data
				.dispatch('core/block-editor')
				.selectBlock(containerBlock.clientId);
		}
	});
	await page.waitForTimeout(500);
	await heightModeSelect.selectOption('fixed');
	await page.getByRole('button', { name: /Floating Mosaic/i }).click();
	await page.waitForTimeout(700);

	const fixedAttrs = await page.evaluate(() => {
		const block = window.wp.data
			.select('core/block-editor')
			.getBlocks()
			.find((b) => b.name === 'photo-collage/container');
		if (!block) {
			return null;
		}
		return {
			heightMode: block.attributes.heightMode,
			containerHeight: block.attributes.containerHeight,
			innerCount: block.innerBlocks.length,
		};
	});

	results.editor.fixedTemplate = fixedAttrs;
	results.assertions.push({
		name: 'Editor: fixed mode sets Floating Mosaic preset height to 2400px',
		pass: fixedAttrs && fixedAttrs.heightMode === 'fixed' && fixedAttrs.containerHeight === '2400px',
		details: fixedAttrs,
	});

	const editorScreenshot = path.join(outDir, 'editor-height-mode-template-check.png');
	await page.screenshot({ path: editorScreenshot, fullPage: true });
	results.screenshots.editor = editorScreenshot;
}

async function measureFrontend(page, postUrl, label, results, screenshotName) {
	await page.goto(postUrl, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);

	const metrics = await page.evaluate(() => {
		const container = document.querySelector('.wp-block-photo-collage-container');
		if (!container) {
			return null;
		}

		const childItems = Array.from(
			container.querySelectorAll('.wp-block-photo-collage-image, .wp-block-photo-collage-frame')
		).filter((item) => item.closest('.wp-block-photo-collage-container') === container);

		const absoluteCount = childItems.filter(
			(item) => window.getComputedStyle(item).position === 'absolute'
		).length;

		const firstItemPosition = childItems[0]
			? window.getComputedStyle(childItems[0]).position
			: null;

		return {
			datasetHeightMode: container.dataset.heightMode || null,
			inlineHeight: container.style.height || '',
			inlineMinHeight: container.style.minHeight || '',
			computedHeight: Math.round(container.getBoundingClientRect().height),
			absoluteCount,
			itemCount: childItems.length,
			firstItemPosition,
		};
	});

	if (!metrics) {
		throw new Error(`No collage container found on frontend for ${label}`);
	}

	results.frontend[label] = metrics;

	const screenshotPath = path.join(outDir, screenshotName);
	await page.screenshot({ path: screenshotPath, fullPage: true });
	results.screenshots[label] = screenshotPath;
	return metrics;
}

async function run() {
	const results = {
		createdPosts: [],
		editor: {},
		frontend: {},
		screenshots: {},
		assertions: [],
	};

	const media = getAttachments(20);

	const autoFloatingPost = createPost({
		title: `QA Auto Height Floating Mosaic ${timestamp}`,
		content: buildContainerBlock({
			heightMode: 'auto',
			stackOnMobile: true,
			layout: floatingMosaicLayout,
			mediaItems: media,
		}),
	});

	const fixedFloatingPost = createPost({
		title: `QA Fixed Height Floating Mosaic ${timestamp}`,
		content: buildContainerBlock({
			heightMode: 'fixed',
			containerHeight: '2400px',
			stackOnMobile: true,
			layout: floatingMosaicLayout,
			mediaItems: media,
		}),
	});

	const autoModularPost = createPost({
		title: `QA Auto Height Modular Grid ${timestamp}`,
		content: buildContainerBlock({
			heightMode: 'auto',
			stackOnMobile: false,
			layout: modularGridLayout,
			mediaItems: media,
		}),
	});

	results.createdPosts.push(autoFloatingPost, fixedFloatingPost, autoModularPost);

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
	const page = await context.newPage();

	await testEditorTemplateBehavior(page, results);

	const autoFloatingDesktop = await measureFrontend(
		page,
		autoFloatingPost.postUrl,
		'autoFloatingDesktop',
		results,
		'auto-floating-desktop.png'
	);

	results.assertions.push({
		name: 'Frontend auto floating: data-height-mode is auto',
		pass: autoFloatingDesktop.datasetHeightMode === 'auto',
		details: autoFloatingDesktop,
	});
	results.assertions.push({
		name: 'Frontend auto floating: inline height is computed in px and > 200',
		pass:
			/px$/.test(autoFloatingDesktop.inlineHeight) &&
			autoFloatingDesktop.computedHeight > 200,
		details: autoFloatingDesktop,
	});
	results.assertions.push({
		name: 'Frontend auto floating: uses absolute-positioned children',
		pass: autoFloatingDesktop.absoluteCount > 0,
		details: autoFloatingDesktop,
	});

	const fixedFloatingDesktop = await measureFrontend(
		page,
		fixedFloatingPost.postUrl,
		'fixedFloatingDesktop',
		results,
		'fixed-floating-desktop.png'
	);

	results.assertions.push({
		name: 'Frontend fixed floating: data-height-mode is fixed',
		pass: fixedFloatingDesktop.datasetHeightMode === 'fixed',
		details: fixedFloatingDesktop,
	});
	results.assertions.push({
		name: 'Frontend fixed floating: keeps explicit 2400px height',
		pass: fixedFloatingDesktop.inlineHeight === '2400px',
		details: fixedFloatingDesktop,
	});

	const autoModularDesktop = await measureFrontend(
		page,
		autoModularPost.postUrl,
		'autoModularDesktop',
		results,
		'auto-modular-desktop.png'
	);

	results.assertions.push({
		name: 'Frontend auto modular: no absolute children',
		pass: autoModularDesktop.absoluteCount === 0,
		details: autoModularDesktop,
	});
	results.assertions.push({
		name: 'Frontend auto modular: no forced inline height',
		pass: autoModularDesktop.inlineHeight === '',
		details: autoModularDesktop,
	});

	const mobileContext = await browser.newContext({ viewport: { width: 375, height: 900 } });
	const mobilePage = await mobileContext.newPage();
	await measureFrontend(
		mobilePage,
		autoFloatingPost.postUrl,
		'autoFloatingMobile',
		results,
		'auto-floating-mobile.png'
	);

	const mobileMetrics = results.frontend.autoFloatingMobile;
	results.assertions.push({
		name: 'Frontend auto floating mobile: stacked layout sets first item position static',
		pass: mobileMetrics.firstItemPosition === 'static',
		details: mobileMetrics,
	});
	results.assertions.push({
		name: 'Frontend auto floating mobile: no inline height while stacked',
		pass: mobileMetrics.inlineHeight === '',
		details: mobileMetrics,
	});

	await mobileContext.close();
	await context.close();
	await browser.close();

	results.summary = {
		passed: results.assertions.filter((a) => a.pass).length,
		failed: results.assertions.filter((a) => !a.pass).length,
		total: results.assertions.length,
	};

	const reportPath = path.join(outDir, 'auto-height-test-report.json');
	fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

	console.log(JSON.stringify({ outDir, reportPath, summary: results.summary, posts: results.createdPosts }, null, 2));

	if (results.summary.failed > 0) {
		process.exit(1);
	}
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
