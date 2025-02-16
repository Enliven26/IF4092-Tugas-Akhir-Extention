import subprocess
from typing import Optional

from autocommit.core.git import Git


class ExtensionGit(Git):
    def get_changed_files(
        self, repo_path: str, included_file_extensions: Optional[list[str]] = None
    ) -> list[str]:
        changed_files = subprocess.run(
            ["git", "-C", repo_path, "diff", "--name-only"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.split("\n")

        if not included_file_extensions:
            return changed_files

        return [
            f
            for f in changed_files
            if f and any(f.endswith(ext) for ext in included_file_extensions)
        ]

    def get_current_diff(
        self, repo_path: str, included_file_paths: list[str] = []
    ) -> str:
        command = ["git", "-C", repo_path, "diff"]

        if included_file_paths:
            command.append("--")
            command.extend(included_file_paths)

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout

    def get_current_file_content(self, repo_path: str, file_path: str) -> str:
        result = subprocess.run(["git", "-C", repo_path, "show", f":{file_path}"])
        return result.stdout
