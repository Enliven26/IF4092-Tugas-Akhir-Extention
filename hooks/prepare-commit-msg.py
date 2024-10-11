# prepare-commit-msg.py
# This file is part of githook setup from autocommit extension

import sys
from datetime import datetime
import subprocess


def get_current_branch_name():
    return (
        subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"])
        .decode("utf-8")
        .strip()
    )


def main(commit_msg_file):
    branch_name = get_current_branch_name()
    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    message = f"[{current_date}] Committing changes from lol branch '{branch_name}'\n"

    with open(commit_msg_file, "a") as f:
        f.write(message)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: prepare-commit-msg <commit_msg_file>")
        sys.exit(1)

    main(sys.argv[1])
