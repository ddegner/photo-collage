#!/usr/bin/env node

const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WP_PATH = '/Users/degner/Local Sites/avif-testing/app/public';
const BASE_URL = 'http://avif-testing.local';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(
	'/Users/degner/Local Sites/avif-testing/app/public/wp-content/plugins/photo-collage/research/qa-artifacts',
	`${timestamp}-native-attrs`
);
fs.mkdirSync(outDir, { recursive: true });

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

function getAttachments(limit = 12) {
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

	if (rows.length < 3) {
		throw new Error(`Expected at least 3 media items, got ${rows.length}`);
	}

	return rows;
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

function buildImage(attrs) {
	return `<!-- wp:photo-collage/image ${JSON.stringify(attrs)} /-->`;
}

function buildFrame(attrs, innerBlocks) {
	return [
		`<!-- wp:photo-collage/frame ${JSON.stringify(attrs)} -->`,
		...innerBlocks,
		'<!-- /wp:photo-collage/frame -->',
	].join('\n');
}

function buildContainer(attrs, innerBlocks) {
	return [
		`<!-- wp:photo-collage/container ${JSON.stringify(attrs)} -->`,
		...innerBlocks,
		'<!-- /wp:photo-collage/container -->',
	].join('\n');
}

function normalizeStyleText(text) {
	return String(text || '')
		.toLowerCase()
		.replace(/\s+/g, '')
		.trim();
}

function includesStyle(styleText, snippet) {
	return normalizeStyleText(styleText).includes(normalizeStyleText(snippet));
}

function toSlug(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function pushAssertion(results, name, pass, details) {
	results.assertions.push({ name, pass, details });
}

async function inspectScenario(page, scenario, created, results) {
	await page.goto(created.postUrl, { waitUntil: 'networkidle' });
	await page.waitForTimeout(350);

	const data = await page.evaluate((selector) => {
		const target = document.querySelector(selector);
		const container = document.querySelector('.wp-block-photo-collage-container');
		return {
			targetFound: !!target,
			styleAttr: target ? target.getAttribute('style') || '' : '',
			className: target ? target.className || '' : '',
			containerStyleAttr: container ? container.getAttribute('style') || '' : '',
			containerClassName: container ? container.className || '' : '',
		};
	}, scenario.selector);

	const screenshotPath = path.join(outDir, `${toSlug(scenario.id)}.png`);
	await page.screenshot({ path: screenshotPath, fullPage: true });

	results.screenshots[scenario.id] = screenshotPath;
	results.measurements[scenario.id] = data;

	pushAssertion(
		results,
		`${scenario.id}: target element exists`,
		data.targetFound,
		data
	);

	for (const rule of scenario.assertions) {
		const haystack =
			rule.target === 'containerStyle'
				? data.containerStyleAttr
				: rule.target === 'className'
				? data.className
				: rule.target === 'containerClassName'
				? data.containerClassName
				: data.styleAttr;

		let pass = false;
		if (rule.type === 'includes') {
			pass = includesStyle(haystack, rule.value);
		} else if (rule.type === 'excludes') {
			pass = !includesStyle(haystack, rule.value);
		}

		pushAssertion(results, `${scenario.id}: ${rule.name}`, pass, {
			rule,
			haystack,
		});
	}
}

async function run() {
	const mediaItems = getAttachments(12);
	const [img1, img2, img3] = mediaItems;

	const scenarios = [
		{
			id: 'image-native-margin-color',
			selector: '.wp-block-photo-collage-image',
			content: buildImage({
				id: img1.id,
				url: img1.url,
				alt: 'Native margin color',
				width: '42%',
				style: {
					spacing: {
						margin: {
							top: '-12%',
							right: '5%',
							bottom: '0',
							left: '2rem',
						},
					},
					color: {
						background: '#112233',
					},
				},
				backgroundType: 'none',
			}),
			assertions: [
				{ name: 'native margin top applied', type: 'includes', target: 'style', value: 'margin-top: -12%;' },
				{ name: 'native margin left applied', type: 'includes', target: 'style', value: 'margin-left: 2rem;' },
				{ name: 'native color applied', type: 'includes', target: 'style', value: 'background-color:#112233;' },
			],
		},
		{
			id: 'image-native-gradient',
			selector: '.wp-block-photo-collage-image',
			content: buildImage({
				id: img2.id,
				url: img2.url,
				alt: 'Native gradient',
				width: '45%',
				style: {
					color: {
						gradient: 'linear-gradient(135deg,#ff0080,#00d4ff)',
					},
				},
				backgroundType: 'none',
			}),
			assertions: [
				{ name: 'native gradient applied', type: 'includes', target: 'style', value: 'linear-gradient(135deg,#ff0080,#00d4ff)' },
			],
		},
		{
			id: 'image-native-precedence-over-legacy',
			selector: '.wp-block-photo-collage-image',
			content: buildImage({
				id: img3.id,
				url: img3.url,
				alt: 'Native precedence',
				marginTop: '25%',
				style: {
					spacing: {
						margin: {
							top: '-8%',
						},
					},
				},
			}),
			assertions: [
				{ name: 'native margin beats legacy margin', type: 'includes', target: 'style', value: 'margin-top: -8%;' },
				{ name: 'legacy margin not rendered', type: 'excludes', target: 'style', value: 'margin-top: 25%;' },
			],
		},
		{
			id: 'frame-native-margin-color',
			selector: '.wp-block-photo-collage-frame',
			content: buildFrame(
				{
					width: '62%',
					style: {
						spacing: {
							margin: {
								top: '3%',
								left: '-4%',
							},
						},
						color: {
							background: '#334455',
						},
					},
					backgroundType: 'none',
				},
				[
					buildImage({
						id: img1.id,
						url: img1.url,
						alt: 'Frame native color',
					})
				]
			),
			assertions: [
				{ name: 'frame native left margin applied', type: 'includes', target: 'style', value: 'margin-left: -4%;' },
				{ name: 'frame native background color applied', type: 'includes', target: 'style', value: 'background-color:#334455;' },
			],
		},
		{
			id: 'frame-native-gradient',
			selector: '.wp-block-photo-collage-frame',
			content: buildFrame(
				{
					width: '58%',
					style: {
						color: {
							gradient: 'linear-gradient(180deg,#102030,#405060)',
						},
					},
					backgroundType: 'none',
				},
				[
					buildImage({
						id: img2.id,
						url: img2.url,
						alt: 'Frame gradient',
					})
				]
			),
			assertions: [
				{ name: 'frame native gradient applied', type: 'includes', target: 'style', value: 'linear-gradient(180deg,#102030,#405060)' },
			],
		},
		{
			id: 'container-native-color',
			selector: '.wp-block-photo-collage-container',
			content: buildContainer(
				{
					heightMode: 'fixed',
					containerHeight: '460px',
					stackOnMobile: true,
					style: {
						color: {
							background: '#223344',
						},
					},
					backgroundType: 'none',
				},
				[
					buildImage({ id: img1.id, url: img1.url, alt: 'Container color 1', width: '48%' }),
					buildImage({ id: img2.id, url: img2.url, alt: 'Container color 2', width: '48%', marginLeft: '2%' }),
				]
			),
			assertions: [
				{ name: 'container native background color applied', type: 'includes', target: 'style', value: '#223344' },
			],
		},
		{
			id: 'container-native-gradient',
			selector: '.wp-block-photo-collage-container',
			content: buildContainer(
				{
					heightMode: 'fixed',
					containerHeight: '460px',
					stackOnMobile: true,
					style: {
						color: {
							gradient: 'linear-gradient(90deg,#220022,#002244)',
						},
					},
					backgroundType: 'none',
				},
				[
					buildImage({ id: img2.id, url: img2.url, alt: 'Container grad 1', width: '48%' }),
					buildImage({ id: img3.id, url: img3.url, alt: 'Container grad 2', width: '48%', marginLeft: '2%' }),
				]
			),
			assertions: [
				{ name: 'container native gradient applied', type: 'includes', target: 'style', value: 'linear-gradient(90deg,#220022,#002244)' },
			],
		},
		{
			id: 'legacy-image-fallback',
			selector: '.wp-block-photo-collage-image',
			content: buildImage({
				id: img1.id,
				url: img1.url,
				alt: 'Legacy fallback',
				marginTop: '-15%',
				marginLeft: '6%',
				backgroundType: 'color',
				backgroundColor: '#445566',
			}),
			assertions: [
				{ name: 'legacy margin fallback still works', type: 'includes', target: 'style', value: 'margin-top: -15%;' },
				{ name: 'legacy background fallback still works', type: 'includes', target: 'style', value: 'background-color: #445566;' },
			],
		},
	];

	const results = {
		timestamp,
		outDir,
		createdPosts: [],
		screenshots: {},
		measurements: {},
		assertions: [],
	};

	for (const scenario of scenarios) {
		const created = createPost({
			title: `QA Native Attr ${scenario.id} ${timestamp}`,
			content: scenario.content,
		});
		results.createdPosts.push({ scenario: scenario.id, ...created });
	}

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
	const page = await context.newPage();

	for (const scenario of scenarios) {
		const created = results.createdPosts.find(
			(entry) => entry.scenario === scenario.id
		);
		await inspectScenario(page, scenario, created, results);
	}

	await context.close();
	await browser.close();

	results.summary = {
		total: results.assertions.length,
		passed: results.assertions.filter((assertion) => assertion.pass).length,
		failed: results.assertions.filter((assertion) => !assertion.pass).length,
	};

	const reportPath = path.join(outDir, 'native-attributes-report.json');
	results.reportPath = reportPath;
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
