import logging
import subprocess
from typing import Optional

from autocommit.core.git import Git


class ExtensionGit(Git):
    def get_changed_files(
        self, repo_path: str, included_file_extensions: Optional[list[str]] = None
    ) -> list[str]:
        changed_files = subprocess.run(
            ["git", "-C", repo_path, "diff", "HEAD", "--name-only"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.split("\n")

        changed_files = [changed_file for changed_file in changed_files if changed_file]

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
        if len(included_file_paths) == 0:
            return ""

        command = ["git", "-C", repo_path, "diff", "HEAD"]

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
        command = ["git", "-C", repo_path, "show", f":{file_path}"]
        try:
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            return result.stdout

        except subprocess.CalledProcessError:
            logging.exception("Error while retrieving file content:")
            return ""
