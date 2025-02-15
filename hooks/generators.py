import os
from typing import Optional

from autocommit.core.chains import CommitMessageGenerationChain
from autocommit.core.enums import DiffVersion
from autocommit.core.models import CommitMessageGenerationPromptInputModel
from autocommit.core.parsers.git import IDiffParser
from autocommit.core.parsers.language.base import ICodeParser

from git import ExtensionGit


class CommitMessageGenerator:
    CONTEXT_FILE_NAME = "contexts.txt"
    VECTOR_STORE_FOLDER_NAME = "vector_store"

    def __init__(
        self,
        git: ExtensionGit,
        diff_parser: IDiffParser,
        code_parser: ICodeParser,
    ):
        super().__init__()
        self.__git: ExtensionGit = git
        self.__diff_parser: IDiffParser = diff_parser
        self.__code_parser: ICodeParser = code_parser

    def __get_implementations(
        self,
        source_repo_path: str,
        included_file_paths: list[str],
        diff: str,
    ) -> str:

        file_diffs = self.__diff_parser.get_diff_lines(diff, included_file_paths)

        implementations: list[str] = []

        for file_diff in file_diffs:
            file_content = (
                self.__git.get_file_content(
                    source_repo_path, "HEAD", file_diff.file_path
                )
                if file_diff.version == DiffVersion.OLD
                else self.__git.get_current_file_content(
                    source_repo_path, file_diff.file_path
                )
            )

            new_implementations = self.__code_parser.get_declarations(
                file_content, file_diff.line_ranges
            )

            file_info = f"{file_diff.file_path} ({file_diff.version})"
            implementation = file_info + "\n" + new_implementations

            implementations.append(implementation)

        return "\n".join(implementations)

    def generate(
        self,
        chain: CommitMessageGenerationChain,
        repo_path: str,
        parent_context_path: str,
        included_file_extensions: Optional[list[str]] = None,
    ) -> str:
        included_file_paths = self.__git.get_changed_files(
            repo_path,
            included_file_extensions,
        )

        diff = self.__git.get_current_diff(repo_path, included_file_paths)

        relevant_source_code = self.__get_implementations(
            repo_path,
            included_file_paths,
            diff,
        )

        prompt_input = CommitMessageGenerationPromptInputModel()
        prompt_input.diff = diff
        prompt_input.source_code = relevant_source_code
        prompt_input.context_file_path = os.path.join(
            parent_context_path, self.CONTEXT_FILE_NAME
        )
        prompt_input.vector_store_path = os.path.join(
            parent_context_path, self.VECTOR_STORE_FOLDER_NAME
        )

        return chain.invoke(prompt_input)
