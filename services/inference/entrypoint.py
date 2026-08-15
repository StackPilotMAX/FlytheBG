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


def main() -> None:
    account = pwd.getpwnam("app")
    model_dir = Path(os.getenv("MODEL_DIR", "/models"))
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
