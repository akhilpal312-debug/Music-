#!/usr/bin/env bash
# Build Comfort from this checkout with the portable toolchain in ./toolchain.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="$ROOT/toolchain/jdk"
export ANDROID_HOME="$ROOT/toolchain/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export RUSTUP_HOME="$ROOT/toolchain/rustup"
export CARGO_HOME="$ROOT/toolchain/cargo"
export PATH="$JAVA_HOME/bin:$CARGO_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
cd "$ROOT"
exec ./gradlew "$@"
