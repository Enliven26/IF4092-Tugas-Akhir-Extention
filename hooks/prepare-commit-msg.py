# prepare-commit-msg.py
# This file is part of githook setup from autocommit extension

import os
import sys

from autocommit.core.chains import (
    CommitMessageGenerationChain,
    HighLevelContextChain,
    HighLevelContextCommitMessageGenerationChain,
    HighLevelContextDiffClassifierChain,
)
from autocommit.core.constants import (
    DEFAULT_CMG_TEMPERATURE,
    DEFAULT_DIFF_CLASSIFIER_TEMPERATURE,
    DEFAULT_LLM_QUERY_TEXT_TEMPERATURE,
    DEFAULT_LLM_RETRIEVAL_FILTER_TEMPERATURE,
    FEW_SHOT_HIGH_LEVEL_CONTEXT_CMG_PROMPT_TEMPLATE,
)
from autocommit.core.parsers import diff_parser
from autocommit.core.parsers.language import java_code_parser
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from generators import CommitMessageGenerator
from git import ExtensionGit

CONTEXT_FOLDER = "contexts"


def initialize_generator() -> CommitMessageGenerator:
    git = ExtensionGit()
    generator = CommitMessageGenerator(git, diff_parser, java_code_parser)
    return generator


def initialize_open_ai_chain() -> CommitMessageGenerationChain:
    open_ai_llm_model = os.getenv("OPENAI_LLM_MODEL")
    open_ai_embedding_model = os.getenv("OPEN_AI_EMBEDDING_MODEL")

    if not open_ai_llm_model or not open_ai_embedding_model:
        raise ValueError("OPENAI_LLM_MODEL and OPEN_AI_EMBEDDING_MODEL must be set")
    
    open_ai_diff_classifier_chat_model = ChatOpenAI(
        model=open_ai_llm_model, temperature=DEFAULT_DIFF_CLASSIFIER_TEMPERATURE
    )

    open_ai_cmg_chat_model = ChatOpenAI(
        model=open_ai_llm_model, temperature=DEFAULT_CMG_TEMPERATURE
    )
    open_ai_query_text_chat_model = ChatOpenAI(
        model=open_ai_llm_model, temperature=DEFAULT_LLM_QUERY_TEXT_TEMPERATURE
    )
    open_ai_filter_chat_model = ChatOpenAI(
        model=open_ai_llm_model, temperature=DEFAULT_LLM_RETRIEVAL_FILTER_TEMPERATURE
    )
    open_ai_embeddings = OpenAIEmbeddings(model=open_ai_embedding_model)

    open_ai_high_level_context_diff_classifier_chain = (
        HighLevelContextDiffClassifierChain(open_ai_diff_classifier_chat_model)
    )

    open_ai_high_level_context_chain = HighLevelContextChain(
        open_ai_query_text_chat_model, open_ai_filter_chat_model, open_ai_embeddings
    )

    open_ai_few_shot_high_level_context_cmg_chain = (
        HighLevelContextCommitMessageGenerationChain(
            open_ai_high_level_context_diff_classifier_chain,
            open_ai_high_level_context_chain,
            open_ai_cmg_chat_model,
            FEW_SHOT_HIGH_LEVEL_CONTEXT_CMG_PROMPT_TEMPLATE,
        )
    )

    return open_ai_few_shot_high_level_context_cmg_chain


def main(commit_msg_file: str, repo_path: str):
    generator = initialize_generator()
    chain = initialize_open_ai_chain()

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
        print("Usage: prepare-commit-msg <commit_msg_file> <repo_path> <open_ai_api_key>")
        sys.exit(1)

    os.environ["OPENAI_API_KEY"] = sys.argv[3]

    main(sys.argv[1], sys.argv[2])
