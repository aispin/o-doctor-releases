#!/usr/bin/env bash
#
# 发布一个新的 O Doctor 版本：
#   1. 在宿主仓库跑 tauri build（产出 .app.tar.gz + .sig）
#   2. 把产物与 latest.json 放进落地页的 public/downloads
#   3. 构建落地页并发布到 gh-pages
#
# 用法（在宿主仓库根目录）：
#   ODOCTOR_VERSION=0.1.1 ./scripts/release.sh
#
# 前置条件：
#   - 宿主仓库的 .secrets/odoctor.key 存在（签名私钥）
#   - 落地页仓库与本仓库同级
#
# 为什么这个脚本放在 releases 仓库而不是宿主仓库：
# 发布是「发行」职责，产物与清单都在这里；宿主仓库只管写代码、打 tag。

set -euo pipefail

HOST_DIR="${HOST_DIR:-../x-tools}"
LANDING_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/apps/landing"
KEY_FILE="${HOST_DIR}/apps/o-doctor/.secrets/odoctor.key"

VERSION="${ODOCTOR_VERSION:-}"
if [ -z "${VERSION}" ]; then
  # 没指定就用宿主仓库 Cargo.toml 里的版本
  VERSION="$(awk -F'"' '/^version = /{print $2; exit}' \
    "${HOST_DIR}/apps/o-doctor/src-tauri/Cargo.toml")"
  echo "未指定 ODOCTOR_VERSION，取 Cargo.toml 的版本：${VERSION}"
fi

[ -d "${HOST_DIR}" ] || { echo "找不到宿主仓库：${HOST_DIR}"; exit 1; }
[ -f "${KEY_FILE}" ] || {
  echo "找不到签名私钥：${KEY_FILE}"
  echo "先在宿主仓库执行：pnpm tauri signer generate -w .secrets/odoctor.key --ci"
  exit 1
}

echo "==> 1/4 构建 ${VERSION}"
cd "${HOST_DIR}/apps/o-doctor"
# Tauri 打包时用私钥签名更新产物
TAURI_SIGNING_PRIVATE_KEY="$(cat "${KEY_FILE}")" \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD="" \
  pnpm tauri build

BUNDLE_DIR="${HOST_DIR}/apps/o-doctor/src-tauri/target/release/bundle"
TARBALL="$(find "${BUNDLE_DIR}/macos" -name '*.app.tar.gz' | head -1)"
SIGFILE="${TARBALL}.sig"
DMG="$(find "${BUNDLE_DIR}/dmg" -name '*.dmg' | head -1)"

[ -f "${TARBALL}" ] || { echo "没找到更新包 tar.gz"; exit 1; }
[ -f "${SIGFILE}" ] || { echo "没找到签名文件 .sig"; exit 1; }

echo "==> 2/4 拷贝产物到落地页"
DL_DIR="${LANDING_DIR}/public/downloads"
mkdir -p "${DL_DIR}"
cp "${TARBALL}" "${DL_DIR}/O-Doctor.app.tar.gz"
cp "${SIGFILE}" "${DL_DIR}/O-Doctor.app.tar.gz.sig"
[ -f "${DMG}" ] && cp "${DMG}" "${DL_DIR}/O-Doctor.dmg"

echo "==> 3/4 生成 latest.json"
# Tauri updater 清单格式。platforms 下的 key 必须与 target triple 对应，
# 否则应用在对应架构上找不到更新。
PUB_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
SIGNATURE="$(cat "${SIGFILE}")"
SIZE="$(stat -f%z "${TARBALL}")"
URL="https://aispin.github.io/o-doctor-releases/downloads/O-Doctor.app.tar.gz"

# 一条 tarball 供两个 macOS 架构用（universal build）。
# 若将来拆成 x64/aarch64 两份，这里要展开成两条。
cat > "${LANDING_DIR}/public/latest.json" <<JSON
{
  "version": "${VERSION}",
  "notes": "见 https://github.com/aispin/o-doctor-releases/releases/tag/v${VERSION}",
  "pub_date": "${PUB_DATE}",
  "platforms": {
    "darwin-aarch64": {
      "signature": "${SIGNATURE}",
      "url": "${URL}"
    },
    "darwin-x86_64": {
      "signature": "${SIGNATURE}",
      "url": "${URL}"
    },
    "darwin-universal": {
      "signature": "${SIGNATURE}",
      "url": "${URL}"
    }
  },
  "size": ${SIZE}
}
JSON

echo "     latest.json 已生成（${SIZE} bytes）"

echo "==> 4/4 构建并发布落地页"
cd "${LANDING_DIR}/../.."
pnpm build
cd apps/landing
pnpm deploy

echo
echo "完成。"
echo "  更新清单：https://aispin.github.io/o-doctor-releases/latest.json"
echo "  落地页：https://aispin.github.io/o-doctor-releases/"
echo
echo "下一步（可选）："
echo "  gh release create v${VERSION} --title v${VERSION} --notes '...' \\"
echo "    ${DMG:-<dmg>} ${TARBALL}"