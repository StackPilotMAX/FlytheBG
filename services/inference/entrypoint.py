from __future__ import annotations

import os
import pwd
from pathlib import Path


def chown_tree(path: Path, uid: int, gid: int) -> None:
    path.mkdir(parents=True, exist_ok=True)
    os.chown(path, uid, gid)
    for root, directories, files in os.walk(path):
        os.chown(root, uid, gid)
        for name in directories:
            os.chown(os.path.join(root, name), uid, gid)
        for name in files:
            os.chown(os.path.join(root, name), uid, gid)


def prune_obsolete_model_cache(model_dir: Path) -> None:
    """Remove abandoned BiRefNet trial binaries while keeping calibration data.

    The production service runs the memory-safe two-pass IS-Net precision pipeline.
    Failed BiRefNet trial files are no longer needed and would only consume the
    intentionally small persistent model volume. IS-Net and all JSON calibration
    files are preserved.
    """
    provider = os.getenv("MODEL_PROVIDER", "").strip()
    for candidate in model_dir.iterdir() if model_dir.exists() else ():
        is_birefnet_binary = candidate.name.startswith("birefnet-lite-") and (
            candidate.name.endswith(".onnx") or candidate.name.endswith(".part")
        )
        if provider != "birefnet_onnx" and is_birefnet_binary:
            try:
                candidate.unlink()
                print(f"model_cache_pruned path={candidate}", flush=True)
            except FileNotFoundError:
                pass


def main() -> None:
    account = pwd.getpwnam("app")
    model_dir = Path(os.getenv("MODEL_DIR", "/models"))
    model_dir.mkdir(parents=True, exist_ok=True)
    prune_obsolete_model_cache(model_dir)
    chown_tree(model_dir, account.pw_uid, account.pw_gid)

    os.initgroups(account.pw_name, account.pw_gid)
    os.setgid(account.pw_gid)
    os.setuid(account.pw_uid)

    port = os.getenv("PORT", "8000")
    os.execvp(
        "uvicorn",
        ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port, "--workers", "1"],
    )


if __name__ == "__main__":
    main()
