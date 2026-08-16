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
    """Free only obsolete model binaries before the app user starts.

    Keep IS-Net and calibration JSON for rollback. Remove failed 1024px BiRefNet
    caches because the production service now uses the memory-safe 512px FP16 export.
    """
    if os.getenv("MODEL_PROVIDER", "").strip() != "birefnet_onnx":
        return

    obsolete_names = {
        "birefnet-lite-1024.onnx",
        "birefnet-lite-1024-fp16.onnx",
    }
    for candidate in model_dir.iterdir() if model_dir.exists() else ():
        is_partial_birefnet = candidate.name.startswith("birefnet-lite-") and candidate.name.endswith(".part")
        if candidate.name in obsolete_names or is_partial_birefnet:
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
