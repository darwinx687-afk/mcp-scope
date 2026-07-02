import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "README.md",
  "README.zh-CN.md",
  "assets/logo.svg",
  "assets/banner.svg",
  "docs/README.md",
  "docs/README.zh-CN.md",
  "docs/REPO_METADATA.md",
  "docs/REPO_METADATA.zh-CN.md",
  "docs/LIMITATIONS.md",
  "docs/LIMITATIONS.zh-CN.md",
  "docs/TOOL_METADATA_EXPORT_GUIDE.md",
  "docs/TOOL_METADATA_EXPORT_GUIDE.zh-CN.md",
  "docs/SCREENSHOT_GUIDE.md",
  "docs/SCREENSHOT_GUIDE.zh-CN.md",
  "docs/FAQ.md",
  "docs/FAQ.zh-CN.md",
  "docs/LAUNCH_CHECKLIST.md",
  "docs/LAUNCH_CHECKLIST.zh-CN.md",
  "docs/FEEDBACK_GUIDE.md",
  "docs/FEEDBACK_GUIDE.zh-CN.md",
  "docs/ROADMAP_AFTER_LAUNCH.md",
  "docs/ROADMAP_AFTER_LAUNCH.zh-CN.md",
  "docs/RELEASE_DRAFT.md",
  "docs/RELEASE_DRAFT.zh-CN.md",
  "docs/REMOTE_LAUNCH_STATE.md",
  "docs/REMOTE_LAUNCH_STATE.zh-CN.md",
  "examples/README.md",
  "examples/README.zh-CN.md",
  "launch/README.md",
  "launch/README.zh-CN.md",
  "launch/CHANNEL_STRATEGY.md",
  "launch/CHANNEL_STRATEGY.zh-CN.md",
  "launch/IMAGE_ASSET_MAP.md",
  "launch/IMAGE_ASSET_MAP.zh-CN.md",
  "launch/RELEASE_REVIEW_CHECKLIST.md",
  "launch/RELEASE_REVIEW_CHECKLIST.zh-CN.md",
  "launch/POSTING_TRACKER.md",
  "launch/POSTING_TRACKER.zh-CN.md",
  "launch/FINAL_HUMAN_REVIEW.md",
  "launch/FINAL_HUMAN_REVIEW.zh-CN.md",
  "launch/FEEDBACK_MONITORING_PLAYBOOK.md",
  "launch/FEEDBACK_MONITORING_PLAYBOOK.zh-CN.md",
  "launch/FEEDBACK_TO_ROADMAP_REVIEW.md",
  "launch/FEEDBACK_TO_ROADMAP_REVIEW.zh-CN.md",
  "launch/ISSUE_TRIAGE_GUIDE.md",
  "launch/ISSUE_TRIAGE_GUIDE.zh-CN.md",
  "launch/PLATFORM_LIMITS.md",
  "launch/PLATFORM_LIMITS.zh-CN.md",
  "launch/BROWSER_POSTING_RULES.md",
  "launch/BROWSER_POSTING_RULES.zh-CN.md",
  "launch/updates/README.md",
  "launch/updates/README.zh-CN.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.zh-CN.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.zh-CN.md",
  "launch/updates/v0.2.0-preview/linkedin.md",
  "launch/updates/v0.2.0-preview/xiaohongshu.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.zh-CN.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.zh-CN.md",
  "launch/copy/github_release_final_review.md",
  "launch/copy/github_release_final_review.zh-CN.md",
  "launch/copy/xiaohongshu.md",
  "launch/copy/juejin.md",
  "launch/copy/jike.md",
  "launch/copy/v2ex.md",
  "launch/copy/wechat_group.md",
  "launch/copy/wechat_moments.md",
  "launch/copy/linkedin.md",
  "launch/copy/x_twitter.md",
  "launch/copy/devto.md",
  "launch/copy/reddit.md",
  "launch/copy/hackernews.md",
  "launch/copy/short_bio_en.md",
  "launch/copy/short_bio_zh-CN.md",
  "launch/copy/reply_templates_en.md",
  "launch/copy/reply_templates_zh-CN.md",
  "launch/assets/social-card-en.svg",
  "launch/assets/social-card-zh-CN.svg",
  "launch/assets/social-card-square-en.svg",
  "launch/assets/social-card-square-zh-CN.svg",
  "launch/assets/release-banner-en.svg",
  "launch/assets/release-banner-zh-CN.svg",
  "launch/assets/exports/social-card-en.png",
  "launch/assets/exports/social-card-zh-CN.png",
  "launch/assets/exports/social-card-square-en.png",
  "launch/assets/exports/social-card-square-zh-CN.png",
  "launch/assets/exports/release-banner-en.png",
  "launch/assets/exports/release-banner-zh-CN.png",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/false_positive.yml",
  ".github/ISSUE_TEMPLATE/false_negative.yml",
  ".github/ISSUE_TEMPLATE/docs_confusion.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config_shape_request.yml",
  ".github/ISSUE_TEMPLATE/security_signal_review.yml",
  ".github/ISSUE_TEMPLATE/config.yml"
];

const issueTemplates = [
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/false_positive.yml",
  ".github/ISSUE_TEMPLATE/false_negative.yml",
  ".github/ISSUE_TEMPLATE/docs_confusion.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config_shape_request.yml",
  ".github/ISSUE_TEMPLATE/security_signal_review.yml"
];

const forbiddenChinesePhrases = ["赋能", "闭环", "矩阵", "生态", "革新", "企业级"];
const zhLaunchFiles = [
  "README.zh-CN.md",
  "LAUNCH_NOTES.zh-CN.md",
  "docs/README.zh-CN.md",
  "docs/REPO_METADATA.zh-CN.md",
  "docs/LIMITATIONS.zh-CN.md",
  "docs/TOOL_METADATA_EXPORT_GUIDE.zh-CN.md",
  "docs/LAUNCH_CHECKLIST.zh-CN.md",
  "docs/FEEDBACK_GUIDE.zh-CN.md",
  "docs/ROADMAP_AFTER_LAUNCH.zh-CN.md",
  "docs/RELEASE_DRAFT.zh-CN.md",
  "docs/REMOTE_LAUNCH_STATE.zh-CN.md",
  "docs/SCREENSHOT_GUIDE.zh-CN.md",
  "docs/FAQ.zh-CN.md",
  "examples/README.zh-CN.md",
  "launch/README.zh-CN.md",
  "launch/CHANNEL_STRATEGY.zh-CN.md",
  "launch/IMAGE_ASSET_MAP.zh-CN.md",
  "launch/RELEASE_REVIEW_CHECKLIST.zh-CN.md",
  "launch/POSTING_TRACKER.zh-CN.md",
  "launch/FINAL_HUMAN_REVIEW.zh-CN.md",
  "launch/FEEDBACK_MONITORING_PLAYBOOK.zh-CN.md",
  "launch/FEEDBACK_TO_ROADMAP_REVIEW.zh-CN.md",
  "launch/ISSUE_TRIAGE_GUIDE.zh-CN.md",
  "launch/PLATFORM_LIMITS.zh-CN.md",
  "launch/BROWSER_POSTING_RULES.zh-CN.md",
  "launch/updates/README.zh-CN.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.zh-CN.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.zh-CN.md",
  "launch/updates/v0.2.0-preview/xiaohongshu.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.zh-CN.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.zh-CN.md",
  "launch/copy/github_release_final_review.zh-CN.md",
  "launch/copy/xiaohongshu.md",
  "launch/copy/juejin.md",
  "launch/copy/jike.md",
  "launch/copy/v2ex.md",
  "launch/copy/wechat_group.md",
  "launch/copy/wechat_moments.md",
  "launch/copy/short_bio_zh-CN.md",
  "launch/copy/reply_templates_zh-CN.md"
];

const claimFiles = [
  "README.md",
  "README.zh-CN.md",
  "LAUNCH_NOTES.md",
  "LAUNCH_NOTES.zh-CN.md",
  "docs/README.md",
  "docs/README.zh-CN.md",
  "docs/REPO_METADATA.md",
  "docs/REPO_METADATA.zh-CN.md",
  "docs/LIMITATIONS.md",
  "docs/LIMITATIONS.zh-CN.md",
  "docs/TOOL_METADATA_EXPORT_GUIDE.md",
  "docs/TOOL_METADATA_EXPORT_GUIDE.zh-CN.md",
  "docs/LAUNCH_CHECKLIST.md",
  "docs/LAUNCH_CHECKLIST.zh-CN.md",
  "docs/FEEDBACK_GUIDE.md",
  "docs/FEEDBACK_GUIDE.zh-CN.md",
  "docs/ROADMAP_AFTER_LAUNCH.md",
  "docs/ROADMAP_AFTER_LAUNCH.zh-CN.md",
  "docs/RELEASE_DRAFT.md",
  "docs/RELEASE_DRAFT.zh-CN.md",
  "docs/REMOTE_LAUNCH_STATE.md",
  "docs/REMOTE_LAUNCH_STATE.zh-CN.md",
  "docs/SCREENSHOT_GUIDE.md",
  "docs/SCREENSHOT_GUIDE.zh-CN.md",
  "docs/FAQ.md",
  "docs/FAQ.zh-CN.md",
  "examples/README.md",
  "examples/README.zh-CN.md",
  "launch/README.md",
  "launch/README.zh-CN.md",
  "launch/CHANNEL_STRATEGY.md",
  "launch/CHANNEL_STRATEGY.zh-CN.md",
  "launch/IMAGE_ASSET_MAP.md",
  "launch/IMAGE_ASSET_MAP.zh-CN.md",
  "launch/RELEASE_REVIEW_CHECKLIST.md",
  "launch/RELEASE_REVIEW_CHECKLIST.zh-CN.md",
  "launch/POSTING_TRACKER.md",
  "launch/POSTING_TRACKER.zh-CN.md",
  "launch/FINAL_HUMAN_REVIEW.md",
  "launch/FINAL_HUMAN_REVIEW.zh-CN.md",
  "launch/FEEDBACK_MONITORING_PLAYBOOK.md",
  "launch/FEEDBACK_MONITORING_PLAYBOOK.zh-CN.md",
  "launch/FEEDBACK_TO_ROADMAP_REVIEW.md",
  "launch/FEEDBACK_TO_ROADMAP_REVIEW.zh-CN.md",
  "launch/ISSUE_TRIAGE_GUIDE.md",
  "launch/ISSUE_TRIAGE_GUIDE.zh-CN.md",
  "launch/PLATFORM_LIMITS.md",
  "launch/PLATFORM_LIMITS.zh-CN.md",
  "launch/BROWSER_POSTING_RULES.md",
  "launch/BROWSER_POSTING_RULES.zh-CN.md",
  "launch/updates/README.md",
  "launch/updates/README.zh-CN.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.zh-CN.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.zh-CN.md",
  "launch/updates/v0.2.0-preview/linkedin.md",
  "launch/updates/v0.2.0-preview/xiaohongshu.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.zh-CN.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.zh-CN.md",
  "launch/copy/github_release_final_review.md",
  "launch/copy/github_release_final_review.zh-CN.md",
  "launch/copy/xiaohongshu.md",
  "launch/copy/juejin.md",
  "launch/copy/jike.md",
  "launch/copy/v2ex.md",
  "launch/copy/wechat_group.md",
  "launch/copy/wechat_moments.md",
  "launch/copy/linkedin.md",
  "launch/copy/x_twitter.md",
  "launch/copy/devto.md",
  "launch/copy/reddit.md",
  "launch/copy/hackernews.md",
  "launch/copy/short_bio_en.md",
  "launch/copy/short_bio_zh-CN.md",
  "launch/copy/reply_templates_en.md",
  "launch/copy/reply_templates_zh-CN.md"
];

const launchCopyFiles = [
  "launch/copy/github_release_final_review.md",
  "launch/copy/github_release_final_review.zh-CN.md",
  "launch/copy/xiaohongshu.md",
  "launch/copy/juejin.md",
  "launch/copy/jike.md",
  "launch/copy/v2ex.md",
  "launch/copy/wechat_group.md",
  "launch/copy/wechat_moments.md",
  "launch/copy/linkedin.md",
  "launch/copy/x_twitter.md",
  "launch/copy/devto.md",
  "launch/copy/reddit.md",
  "launch/copy/hackernews.md",
  "launch/copy/short_bio_en.md",
  "launch/copy/short_bio_zh-CN.md",
  "launch/copy/reply_templates_en.md",
  "launch/copy/reply_templates_zh-CN.md"
];

const launchSvgFiles = [
  "launch/assets/social-card-en.svg",
  "launch/assets/social-card-zh-CN.svg",
  "launch/assets/social-card-square-en.svg",
  "launch/assets/social-card-square-zh-CN.svg",
  "launch/assets/release-banner-en.svg",
  "launch/assets/release-banner-zh-CN.svg"
];

const launchPngFiles = [
  "launch/assets/exports/social-card-en.png",
  "launch/assets/exports/social-card-zh-CN.png",
  "launch/assets/exports/social-card-square-en.png",
  "launch/assets/exports/social-card-square-zh-CN.png",
  "launch/assets/exports/release-banner-en.png",
  "launch/assets/exports/release-banner-zh-CN.png"
];

const trackerPlatforms = [
  "GitHub release",
  "Xiaohongshu",
  "Juejin",
  "Jike",
  "V2EX",
  "WeChat group",
  "WeChat moments",
  "LinkedIn",
  "X / Twitter",
  "Dev.to",
  "Reddit",
  "Hacker News"
];

const chineseTrackerRows = [
  ["Juejin", "launch/assets/exports/release-banner-zh-CN.png"],
  ["Xiaohongshu", "launch/assets/exports/social-card-square-zh-CN.png"],
  ["Jike", "launch/assets/exports/social-card-zh-CN.png"],
  ["WeChat group", "launch/assets/exports/social-card-zh-CN.png"],
  ["WeChat moments", "launch/assets/exports/social-card-square-zh-CN.png"]
];

const englishTrackerRows = [
  ["LinkedIn", "launch/assets/exports/social-card-en.png"],
  ["X / Twitter", "launch/assets/exports/social-card-en.png"],
  ["Dev.to", "launch/assets/exports/release-banner-en.png"]
];

const zhChineseTrackerRows = [
  ["掘金", "launch/assets/exports/release-banner-zh-CN.png"],
  ["小红书", "launch/assets/exports/social-card-square-zh-CN.png"],
  ["即刻", "launch/assets/exports/social-card-zh-CN.png"],
  ["微信群", "launch/assets/exports/social-card-zh-CN.png"],
  ["朋友圈", "launch/assets/exports/social-card-square-zh-CN.png"]
];

const docsIndexRequired = [
  "LIMITATIONS",
  "TOOL_METADATA_EXPORT_GUIDE",
  "REPORT_GUIDE",
  "REPORT_SCHEMA",
  "VIEWER_GUIDE",
  "GITHUB_ACTION",
  "APPROVAL_MEMORY",
  "ECOSYSTEM_COMPATIBILITY",
  "DISCOVERY",
  "SCREENSHOT_GUIDE",
  "FAQ",
  "REPO_METADATA",
  "REMOTE_LAUNCH_STATE",
  "../SECURITY.md",
  "../CONTRIBUTING.md",
  "../examples/README.md"
];

const examplesIndexRequired = [
  "clients/",
  "tools/",
  "reports/",
  "viewer/",
  "discovery/",
  "snapshots/",
  "diffs/"
];

const v02UpdateFiles = [
  "launch/updates/README.md",
  "launch/updates/README.zh-CN.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.md",
  "launch/updates/v0.2.0-preview/RELEASE_NOTES.zh-CN.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.md",
  "launch/updates/v0.2.0-preview/FINAL_REVIEW.zh-CN.md",
  "launch/updates/v0.2.0-preview/linkedin.md",
  "launch/updates/v0.2.0-preview/xiaohongshu.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_CHECKLIST.zh-CN.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.md",
  "launch/updates/v0.2.0-preview/UPDATE_POSTING_TRACKER.zh-CN.md"
];

function fail(message) {
  console.error(`Launch package check failed: ${message}`);
  process.exitCode = 1;
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

for (const file of requiredFiles) {
  try {
    if (!statSync(join(root, file)).isFile()) {
      fail(`required file is not a file: ${file}`);
    }
  } catch {
    fail(`missing required file: ${file}`);
  }
}

for (const svgFile of ["assets/logo.svg", "assets/banner.svg", ...launchSvgFiles]) {
  const svg = read(svgFile);
  const externalReferencePattern = /<image\b|(?:xlink:)?href=["']https?:|url\(["']?https?:|@import/i;
  if (externalReferencePattern.test(svg)) {
    fail(`${svgFile} references external resources`);
  }
}

for (const pngFile of launchPngFiles) {
  try {
    if (statSync(join(root, pngFile)).size <= 0) {
      fail(`${pngFile} is empty`);
    }
  } catch {
    fail(`missing PNG export: ${pngFile}`);
  }
}

for (const template of issueTemplates) {
  const content = read(template).toLowerCase();
  if (!content.includes("secret")) {
    fail(`${template} does not warn about secrets`);
  }
}

const docsIndex = read("docs/README.md");
for (const marker of docsIndexRequired) {
  if (!docsIndex.includes(marker)) {
    fail(`docs/README.md is missing ${marker}`);
  }
}

const zhDocsIndex = read("docs/README.zh-CN.md");
for (const marker of ["LIMITATIONS", "TOOL_METADATA_EXPORT_GUIDE", "REPO_METADATA", "SCREENSHOT_GUIDE", "FAQ", "REMOTE_LAUNCH_STATE", "../SECURITY.md", "../CONTRIBUTING.md", "../examples/README.zh-CN.md"]) {
  if (!zhDocsIndex.includes(marker)) {
    fail(`docs/README.zh-CN.md is missing ${marker}`);
  }
}

const readme = read("README.md");
if (!readme.includes("Languages: English | [简体中文](README.zh-CN.md)")) {
  fail("README.md is missing the top language switch");
}
const zhReadme = read("README.zh-CN.md");
if (!zhReadme.includes("语言：简体中文 | [English](README.md)")) {
  fail("README.zh-CN.md is missing the top language switch");
}

const limitationsDoc = read("docs/LIMITATIONS.md");
for (const marker of ["Current Limitations", "What v0.2 Will Improve", "Future Version Candidates", "Still Non-Goals"]) {
  if (!limitationsDoc.includes(marker)) {
    fail(`docs/LIMITATIONS.md is missing ${marker}`);
  }
}
const toolMetadataGuide = read("docs/TOOL_METADATA_EXPORT_GUIDE.md");
for (const marker of ["JSON-RPC `tools/list` Response", "Portable Local Manifest", "mcp-scope scan --config <config> --tools <tools.json>", "Do not run unknown MCP servers"]) {
  if (!toolMetadataGuide.includes(marker)) {
    fail(`docs/TOOL_METADATA_EXPORT_GUIDE.md is missing ${marker}`);
  }
}
const repoMetadata = read("docs/REPO_METADATA.md");
for (const topic of ["Local-first MCP transparency reports | MCP 配置与工具元数据透明化报告", "model-context-protocol", "github-action", "local-first"]) {
  if (!repoMetadata.includes(topic)) {
    fail(`docs/REPO_METADATA.md is missing ${topic}`);
  }
}
for (const file of v02UpdateFiles) {
  const content = read(file);
  if (!content.includes("v0.2.0-preview")) {
    fail(`${file} is missing v0.2.0-preview`);
  }
}
const v02Linkedin = read("launch/updates/v0.2.0-preview/linkedin.md");
if (!v02Linkedin.includes("https://github.com/darwinx687-afk/mcp-scope") || !/Do not post automatically/i.test(v02Linkedin)) {
  fail("v0.2 LinkedIn draft must include repo link and do-not-post reminder");
}
const v02Xiaohongshu = read("launch/updates/v0.2.0-preview/xiaohongshu.md");
if (!v02Xiaohongshu.includes("https://github.com/darwinx687-afk/mcp-scope") || !v02Xiaohongshu.includes("不要自动发布")) {
  fail("v0.2 Xiaohongshu draft must include repo link and do-not-post reminder");
}

const examplesIndex = read("examples/README.md");
for (const marker of examplesIndexRequired) {
  if (!examplesIndex.includes(marker)) {
    fail(`examples/README.md is missing ${marker}`);
  }
}

for (const copyFile of launchCopyFiles) {
  const content = read(copyFile);
  if (!content.includes("https://github.com/darwinx687-afk/mcp-scope")) {
    fail(`${copyFile} is missing the GitHub repo link`);
  }
  if (!/do not post automatically|不要自动发布/i.test(content)) {
    fail(`${copyFile} is missing a do-not-post-automatically reminder`);
  }
}

const postingTracker = read("launch/POSTING_TRACKER.md");
for (const platform of trackerPlatforms) {
  if (!postingTracker.includes(platform)) {
    fail(`launch/POSTING_TRACKER.md is missing platform: ${platform}`);
  }
}
for (const [platform, asset] of chineseTrackerRows) {
  const pattern = new RegExp(`\\| ${platform} \\| zh-CN \\| (?:posted|ready-to-post|manual-needed) \\|[^\\n]*${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (!pattern.test(postingTracker)) {
    fail(`launch/POSTING_TRACKER.md must map ${platform} to zh-CN and ${asset}`);
  }
}
for (const [platform, asset] of englishTrackerRows) {
  const pattern = new RegExp(`\\| ${platform} \\| en \\| (?:posted|ready-to-post|manual-needed) \\|[^\\n]*${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (!pattern.test(postingTracker)) {
    fail(`launch/POSTING_TRACKER.md must map ${platform} to en and ${asset}`);
  }
}
if (!/\| GitHub release \| en \| posted \| 2026-07-01 \| https:\/\/github\.com\/darwinx687-afk\/mcp-scope\/releases\/tag\/v0\.1\.0-preview \| none \|/.test(postingTracker)) {
  fail("launch/POSTING_TRACKER.md must record the public GitHub prerelease URL as posted");
}
if (!/\| V2EX \| zh-CN \| skipped \|/.test(postingTracker)) {
  fail("launch/POSTING_TRACKER.md must mark V2EX as skipped");
}
if (!/\| Hacker News \| en \| ready-to-post \|[^\n]*\| none \|/.test(postingTracker)) {
  fail("launch/POSTING_TRACKER.md must keep Hacker News text-only unless manually changed");
}
if (!/\| Reddit \| en \| skipped \|[^\n]*\| none \|/.test(postingTracker)) {
  fail("launch/POSTING_TRACKER.md must keep Reddit skipped and image-free by default");
}
const zhPostingTracker = read("launch/POSTING_TRACKER.zh-CN.md");
for (const platform of ["GitHub release", "小红书", "掘金", "即刻", "V2EX", "微信群", "朋友圈", "LinkedIn", "X / Twitter", "Dev.to", "Reddit", "Hacker News"]) {
  if (!zhPostingTracker.includes(platform)) {
    fail(`launch/POSTING_TRACKER.zh-CN.md is missing platform: ${platform}`);
  }
}
if (!/\| V2EX \| zh-CN \| skipped \|/.test(zhPostingTracker)) {
  fail("launch/POSTING_TRACKER.zh-CN.md must mark V2EX as skipped");
}
if (!/\| GitHub release \| en \| posted \| 2026-07-01 \| https:\/\/github\.com\/darwinx687-afk\/mcp-scope\/releases\/tag\/v0\.1\.0-preview \| none \|/.test(zhPostingTracker)) {
  fail("launch/POSTING_TRACKER.zh-CN.md must record the public GitHub prerelease URL as posted");
}
for (const [platform, asset] of zhChineseTrackerRows) {
  const pattern = new RegExp(`\\| ${platform} \\| zh-CN \\| (?:posted|ready-to-post|manual-needed) \\|[^\\n]*${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (!pattern.test(zhPostingTracker)) {
    fail(`launch/POSTING_TRACKER.zh-CN.md must map ${platform} to zh-CN and ${asset}`);
  }
}
for (const [platform, asset] of englishTrackerRows) {
  const pattern = new RegExp(`\\| ${platform} \\| en \\| (?:posted|ready-to-post|manual-needed) \\|[^\\n]*${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (!pattern.test(zhPostingTracker)) {
    fail(`launch/POSTING_TRACKER.zh-CN.md must map ${platform} to en and ${asset}`);
  }
}

const browserRules = read("launch/BROWSER_POSTING_RULES.md").toLowerCase();
for (const marker of ["manual login", "captcha", "2fa", "do not save passwords", "random album images", "preview the post"]) {
  if (!browserRules.includes(marker)) {
    fail(`launch/BROWSER_POSTING_RULES.md is missing rule marker: ${marker}`);
  }
}
const zhBrowserRules = read("launch/BROWSER_POSTING_RULES.zh-CN.md");
for (const marker of ["登录", "captcha", "2FA", "不保存密码", "随机相册图片", "发布前先预览"]) {
  if (!zhBrowserRules.includes(marker)) {
    fail(`launch/BROWSER_POSTING_RULES.zh-CN.md is missing rule marker: ${marker}`);
  }
}

for (const file of zhLaunchFiles) {
  const content = read(file);
  for (const phrase of forbiddenChinesePhrases) {
    if (content.includes(phrase)) {
      fail(`${file} contains banned Chinese phrase: ${phrase}`);
    }
  }
}

const falseClaimPatterns = [
  /is published to GitHub Marketplace/i,
  /available (?:on|from) GitHub Marketplace/i,
  /npm install mcp-scope/i,
  /is published to npm/i,
  /available (?:on|from) npm/i,
  /guarantees safety/i,
  /guaranteed detection/i,
  /complete protection/i,
  /production-ready security (?:scanner|product|protection)/i,
  /is an official integration/i,
  /officially integrated/i
];

for (const file of claimFiles) {
  const content = read(file);
  for (const pattern of falseClaimPatterns) {
    if (pattern.test(content)) {
      fail(`${file} contains a possible false launch/security claim: ${pattern.source}`);
    }
  }
}

const packageJson = JSON.parse(read("package.json"));
if (packageJson.private !== true) {
  fail("package.json should remain private before npm publication");
}
if ("repository" in packageJson) {
  fail("package.json should not include a repository URL before the public remote is known");
}
if (!Array.isArray(packageJson.keywords) || !packageJson.keywords.includes("local-first")) {
  fail("package.json keywords should include local-first");
}

if (process.exitCode) {
  process.exit();
}

console.log("Launch package check passed.");
