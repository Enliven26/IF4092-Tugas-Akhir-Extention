# prepare-commit-msg.py
# This file is part of githook setup from autocommit extension

import os
import sys

from autocommit_githook import chain, generator

CONTEXT_FOLDER = "contexts"
CONTEXT_FILE = "context.txt"
CONTEXT_NOT_FOUND_MESSAGE = "#AutoCommit context not found. Please do context setup using `setup context` command\n"


def main(commit_msg_file: str, repo_path: str):
    context_path = os.path.join(CONTEXT_FOLDER, CONTEXT_FILE)

    message = ""

    if not os.path.exists(context_path):
        message = CONTEXT_NOT_FOUND_MESSAGE

    else:
        message = generator.generate(
            chain,
            repo_path,
            CONTEXT_FOLDER,
            [".java"],
        )

    with open(commit_msg_file, "a") as f:
        f.write(message)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(
            "Usage: prepare-commit-msg <commit_msg_file> <repo_path> <open_ai_api_key>"
        )
        sys.exit(1)

    os.environ["OPENAI_API_KEY"] = sys.argv[3]

    main(sys.argv[1], sys.argv[2])
