#!/usr/bin/env node
/**
 * 多仓库同步脚本（Gitee + GitHub）
 *
 * 用法：
 *   pnpm sync                      # 推送当前分支到两个仓库
 *   pnpm sync --all-branches       # 推送所有本地分支
 *   pnpm sync -b develop -b master # 只推送指定分支
 *   pnpm sync --commit             # 自动提交工作区改动后推送
 *   pnpm sync --commit --message "feat: xxx"
 *   pnpm sync --dry-run            # 只打印将要执行的命令，不实际推送
 *
 * 认证：
 *   - 默认使用 Git 凭据管理器（Windows Credential Manager / macOS Keychain）
 *   - CI 或临时环境可设置环境变量，脚本只在本次命令中使用，不写入 .git/config：
 *       GITEE_TOKEN / GITEE_USER(默认 web_akai)
 *       GITHUB_TOKEN 或 GH_TOKEN / GITHUB_USER(默认 x-access-token)
 *
 * 退出码：全部成功 0，任一失败 1
 */
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/* ============================ 目标仓库配置 ============================ */

const REPOS = [
  {
    name: "gitee",
    label: "Gitee ",
    url: "https://gitee.com/web_akai/bird-admin.git",
    tokenEnvs: ["GITEE_TOKEN"],
    tokenUser: process.env.GITEE_USER || "web_akai",
  },
  {
    name: "github",
    label: "GitHub",
    url: "https://github.com/birdadminvue3/bird-admin.git",
    tokenEnvs: ["GITHUB_TOKEN", "GH_TOKEN"],
    tokenUser: process.env.GITHUB_USER || "x-access-token",
  },
];

/* ============================== 命令行参数 ============================== */

let options;
try {
  options = parseArgs({
    allowPositionals: true,
    options: {
      branch: { type: "string", multiple: true, short: "b" },
      repo: { type: "string", multiple: true, short: "r" },
      "all-branches": { type: "boolean", default: false },
      commit: { type: "boolean", default: false },
      message: { type: "string", short: "m" },
      "allow-dirty": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  }).values;
} catch (error) {
  console.error(`参数解析失败：${error.message}`);
  process.exit(1);
}

/* ================================ 输出 ================================ */

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR && process.env.TERM !== "dumb";
const paint = code => text => (useColor ? `\u001b[${code}m${text}\u001b[0m` : String(text));
const c = {
  bold: paint("1"),
  dim: paint("90"),
  red: paint("31"),
  green: paint("32"),
  yellow: paint("33"),
  blue: paint("36"),
  magenta: paint("35"),
};

if (options.help) {
  printHelp();
  process.exit(0);
}

/** --repo 过滤：只同步指定仓库（校验名称） */
const selectedRepos = (() => {
  if (!options.repo?.length) return REPOS;
  const names = options.repo.map(v => v.trim().toLowerCase());
  const unknown = names.filter(name => !REPOS.some(repo => repo.name === name));
  if (unknown.length) {
    console.error(`未知仓库：${unknown.join(", ")}，可选值：${REPOS.map(repo => repo.name).join(" / ")}`);
    process.exit(1);
  }
  return REPOS.filter(repo => names.includes(repo.name));
})();

let stepIndex = 0;
const TOTAL_STEPS = 5;

function step(title) {
  stepIndex += 1;
  console.log(`\n${c.bold(`[${stepIndex}/${TOTAL_STEPS}] ${title}`)}`);
}
const ok = msg => console.log(`  ${c.green("✔")} ${msg}`);
const info = msg => console.log(`  ${c.dim("·")} ${msg}`);
const warn = msg => console.log(`  ${c.yellow("!")} ${msg}`);
const bad = msg => console.log(`  ${c.red("✘")} ${msg}`);

/* ============================== Git 基础封装 ============================== */

/** 优先使用当前目录；不在仓库内时回退到脚本所在项目根目录 */
function resolveProjectRoot() {
  const probe = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim();
  return path.resolve(fileURLToPath(new URL("..", import.meta.url)));
}

const ROOT = resolveProjectRoot();

function git(args, { allowFail = false, silent = true } = {}) {
  const res = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: silent ? "pipe" : "inherit",
    env: process.env,
  });
  if (res.error) {
    bad(`无法执行 git：${res.error.message}`);
    process.exit(1);
  }
  const stdout = (res.stdout || "").trim();
  const stderr = (res.stderr || "").trim();
  if (res.status !== 0 && !allowFail) {
    bad(`git ${args.join(" ")} 执行失败`);
    if (stderr) console.log(c.dim(indent(stderr)));
    process.exit(1);
  }
  return { status: res.status ?? 1, stdout, stderr };
}

const indent = text =>
  text
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");

/* ============================== 认证与脱敏 ============================== */

function tokenOf(repo) {
  for (const key of repo.tokenEnvs) {
    const value = process.env[key];
    if (value) return value;
  }
  return "";
}

/** 把 token 拼进 URL，仅用于本次 push，不落盘 */
function withToken(repo) {
  const token = tokenOf(repo);
  if (!token) return null;
  const url = new URL(repo.url);
  url.username = repo.tokenUser;
  url.password = token;
  return url.toString();
}

function mask(text) {
  let out = String(text);
  for (const repo of REPOS) {
    const token = tokenOf(repo);
    if (token) out = out.split(token).join("***");
  }
  return out.replace(/\/\/[^/\s@]+@/g, "//***@");
}

/* ================================ 工具 ================================ */

function normalizeUrl(url) {
  return String(url)
    .replace(/^https?:\/\/[^@/]*@/i, "https://")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function listRemotes() {
  const raw = git(["remote", "-v"], { allowFail: true }).stdout;
  const map = new Map();
  for (const line of raw.split("\n")) {
    const matched = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
    if (matched && !map.has(matched[1])) map.set(matched[1], matched[2]);
  }
  return map;
}

function currentBranch() {
  const { stdout } = git(["rev-parse", "--abbrev-ref", "HEAD"], { allowFail: true });
  return stdout && stdout !== "HEAD" ? stdout : "";
}

function localBranches() {
  const { stdout } = git(["for-each-ref", "--format=%(refname:short)", "refs/heads"]);
  return stdout.split("\n").map(v => v.trim()).filter(Boolean);
}

function shortHead() {
  return git(["rev-parse", "--short", "HEAD"], { allowFail: true }).stdout;
}

function failureHint(text) {
  if (/non-fast-forward|fetch first|\[rejected\]/i.test(text)) {
    return "远端存在本地没有的提交，请先执行：git pull --rebase <remote> <branch>";
  }
  if (/authentication failed|could not read username|terminal prompts disabled|invalid username or password|\b403\b/i.test(text)) {
    return "认证失败，请配置 Git 凭据，或设置 GITEE_TOKEN / GITHUB_TOKEN 环境变量后重试";
  }
  if (/repository not found|\b404\b/i.test(text)) {
    return "仓库不存在或当前账号无权限，请核对仓库地址与账号";
  }
  if (/protected branch|pre-receive hook declined/i.test(text)) {
    return "远端分支已受保护，需要在平台上调整保护规则或改用 Pull Request";
  }
  return "";
}

/* ================================ 主流程 ================================ */

console.log(c.bold(c.blue("\nBirdAdmin · 多仓库同步")));
console.log(c.dim(`项目目录：${ROOT}`));

/* ---- 1. 环境检查 ---- */
step("检查 Git 环境");
const version = git(["rev-parse", "--is-inside-work-tree"], { allowFail: true });
if (version.status !== 0 || version.stdout !== "true") {
  bad(`${ROOT} 不是 Git 仓库`);
  process.exit(1);
}
ok(`git ${git(["--version"]).stdout.replace(/^git version\s+/, "")}`);

/* ---- 2. 工作区检查 ---- */
step("检查工作区状态");
const dirty = git(["status", "--porcelain"]).stdout;
if (dirty) {
  const files = dirty.split("\n");
  warn(`存在 ${files.length} 个未提交的改动：`);
  console.log(c.dim(indent(files.slice(0, 10).join("\n") + (files.length > 10 ? `\n... 其余 ${files.length - 10} 个` : ""))));

  if (options.commit) {
    if (options["dry-run"]) {
      info("--dry-run 模式下不执行提交");
    } else {
      git(["add", "-A"]);
      const message = options.message || `chore: sync ${new Date().toLocaleString("zh-CN", { hour12: false })}`;
      git(["commit", "-m", message]);
      ok(`已提交：${message}`);
    }
  } else if (!options["allow-dirty"]) {
    bad("工作区不干净，已中止");
    info("可以用 --commit 自动提交，或用 --allow-dirty 只推送已提交的内容");
    process.exit(1);
  } else {
    warn("按 --allow-dirty 继续，未提交的改动不会被推送");
  }
} else {
  ok("工作区干净");
}

/* ---- 3. 分支解析 ---- */
step("解析目标分支");
let branches;
if (options["all-branches"]) {
  branches = localBranches();
} else if (options.branch?.length) {
  branches = options.branch.map(v => v.trim()).filter(Boolean);
  const all = localBranches();
  const missing = branches.filter(v => !all.includes(v));
  if (missing.length) {
    bad(`本地不存在分支：${missing.join(", ")}`);
    info(`当前本地分支：${all.join(", ")}`);
    process.exit(1);
  }
} else {
  const branch = currentBranch();
  if (!branch) {
    bad("当前处于游离 HEAD 状态，请先切换到具体分支，或用 -b 指定分支");
    process.exit(1);
  }
  branches = [branch];
}
ok(`将推送 ${branches.length} 个分支：${branches.join(", ")}`);
info(`提交：${shortHead() || "unknown"}${options["dry-run"] ? c.yellow("（dry-run，不会真正推送）") : ""}`);

/* ---- 4. 远端配置 ---- */
step("配置远端仓库");
const remotes = listRemotes();
const targets = selectedRepos.map(repo => {
  const normalized = normalizeUrl(repo.url);
  const matched = [...remotes.entries()].find(([, url]) => normalizeUrl(url) === normalized);
  if (matched) {
    ok(`${matched[0]} → ${repo.url}（已存在，复用）`);
    return { ...repo, remote: matched[0] };
  }
  if (remotes.has(repo.name)) {
    if (options["dry-run"]) {
      info(`git remote set-url ${repo.name} ${repo.url}`);
    } else {
      git(["remote", "set-url", repo.name, repo.url]);
    }
    warn(`${repo.name} → ${repo.url}（${options["dry-run"] ? "将更新地址" : "地址已更新"}）`);
    return { ...repo, remote: repo.name };
  }
  if (options["dry-run"]) {
    info(`git remote add ${repo.name} ${repo.url}`);
  } else {
    git(["remote", "add", repo.name, repo.url]);
  }
  ok(`${repo.name} → ${repo.url}（${options["dry-run"] ? "将新建" : "新建"}）`);
  return { ...repo, remote: repo.name };
});

/* ---- 5. 逐个推送 ---- */
step("推送到远端");
const results = [];
for (const repo of targets) {
  for (const branch of branches) {
    const refspec = `refs/heads/${branch}:refs/heads/${branch}`;
    const authUrl = withToken(repo);
    const pushTarget = authUrl || repo.remote;
    const displayTarget = authUrl ? mask(authUrl) : repo.remote;

    console.log(`\n  ${c.magenta("→")} ${c.bold(repo.label)} ${branch}  ${c.dim(`git push ${displayTarget} ${refspec}`)}`);

    if (options["dry-run"]) {
      results.push({ repo, branch, ok: true, skipped: true, detail: "" });
      info("dry-run 跳过");
      continue;
    }

    const res = spawnSync("git", ["push", pushTarget, refspec], {
      cwd: ROOT,
      encoding: "utf8",
      env: process.env,
    });
    const stderr = mask(res.stderr || "").trim();
    const stdout = mask(res.stdout || "").trim();

    if (res.status === 0) {
      const upToDate = /Everything up-to-date/i.test(stdout + stderr);
      results.push({ repo, branch, ok: true, detail: upToDate ? "已是最新" : "推送成功" });
      ok(`${repo.label} ${branch} ${upToDate ? "已是最新" : "推送成功"}`);
      if (!upToDate && stdout) console.log(c.dim(indent(stdout)));
    } else {
      results.push({ repo, branch, ok: false, detail: stderr || stdout });
      bad(`${repo.label} ${branch} 推送失败`);
      if (stderr) console.log(c.dim(indent(stderr.split("\n").slice(-8).join("\n"))));
      const hint = failureHint(stderr + stdout);
      if (hint) warn(hint);
    }
  }
}

/* ---- 汇总 ---- */
const success = results.filter(item => item.ok).length;
const failed = results.length - success;
console.log(`\n${c.dim("─".repeat(56))}`);
console.log(c.bold("同步结果"));
for (const item of results) {
  const flag = item.ok ? c.green("✔") : c.red("✘");
  const detail = item.skipped ? "dry-run 跳过" : item.ok ? item.detail : "推送失败";
  console.log(`  ${flag} ${item.repo.label}  ${item.branch.padEnd(12)} ${c.dim(detail)}`);
}
console.log(`\n共 ${results.length} 项：${c.green(`${success} 成功`)}，${failed ? c.red(`${failed} 失败`) : "0 失败"}`);
if (options["dry-run"]) {
  console.log(c.yellow("\n以上为 dry-run 结果，没有实际推送。去掉 --dry-run 即会真正执行。"));
}
if (failed) {
  console.log(c.dim("\n提示：修复对应问题后重新执行 pnpm sync 即可，脚本会跳过已同步的提交。"));
}
console.log("");

process.exitCode = failed ? 1 : 0;

/* ================================ 帮助 ================================ */

function printHelp() {
  console.log(`
${c.bold("多仓库同步脚本")}  Gitee + GitHub

${c.bold("用法")}
  pnpm sync                        推送当前分支到两个仓库
  pnpm sync --all-branches         推送全部本地分支
  pnpm sync -b develop -b master   只推送指定分支（可多次）
  pnpm sync -r github              只同步指定仓库（gitee / github，可多次）
  pnpm sync --commit               自动提交工作区改动后推送
  pnpm sync --commit -m "feat: x"  自动提交并指定提交信息
  pnpm sync --allow-dirty          允许带着未提交改动推送（仅推送已提交内容）
  pnpm sync --dry-run              只打印将要执行的命令，不实际推送
  pnpm sync -h                     查看帮助

${c.bold("认证")}
  默认使用系统 Git 凭据管理器。CI 场景可设置环境变量（仅本次命令使用，不写入 .git/config）：
    GITEE_TOKEN（可选 GITEE_USER，默认 web_akai）
    GITHUB_TOKEN 或 GH_TOKEN（可选 GITHUB_USER，默认 x-access-token）

${c.bold("目标仓库")}
${REPOS.map(repo => `  ${repo.label} ${repo.url}`).join("\n")}

${c.bold("常见问题")}
  non-fast-forward            远端有新提交：git pull --rebase <remote> <branch>
  Authentication failed       配置凭据或设置 Token 环境变量
  Repository not found        核对仓库地址与账号权限
`);
}
