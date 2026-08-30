---
name: git-commit
description: 把工作区未提交的改动按逻辑分组为多个可独立构建的提交（grouped commits），提交信息遵循 Conventional Commits。
---

# 分组提交代码

把当前未提交的改动拆成多个逻辑清晰、各自可构建的 git 提交，而不是一个大提交。

## 步骤

1. 先看改动范围：`git status`、`git diff --stat`
2. 按「主题」分组，每个提交是一块内聚的改动；跨多个功能的共享文件（如 `config.mts`、`index.mts`、`CLAUDE.md`）归到它主要服务的那个提交
3. `git reset` 撤销已暂存，再逐组 `git add -A -- <files>` + `git commit`
4. 每组提交后确认它能独立构建（`pnpm docs:build`）
5. 完成后 `git status` 应干净

## 提交规范（必须遵守）

1. 语义独立的提交：把当前未提交的改动拆成多个逻辑清晰、各自可构建的 git 提交，每个提交只包含一个逻辑改动
2. 提交信息 **必须遵循** [Conventional Commits](https://www.conventionalcommits.org/)：`type(scope): description`，type 用英文（如 `feat` / `fix` / `chore` / `docs` / `refactor`）
3. 每个提交的 body **必须包含** `Signed-off-by: latercomer <latercomer@qq.com>`
4. **严禁添加** `Co-Authored-By: Claude Code` 或任何 Claude/AI 署名

## 其他约束

- 提交到当前分支（通常是 master），不自动 push
- 每个提交尽量自洽可构建，避免引用尚未提交的文件
- 重命名文件时，删除的旧路径与新增路径要同时 `git add`，让 git 记录为 rename
