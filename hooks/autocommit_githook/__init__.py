import os

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

from autocommit_githook.generators import CommitMessageGenerator
from autocommit_githook.git import ExtensionGit


def _initialize_generator() -> CommitMessageGenerator:
    git = ExtensionGit()
    generator = CommitMessageGenerator(git, diff_parser, java_code_parser)
    return generator


def _initialize_open_ai_chain() -> CommitMessageGenerationChain:
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


generator = _initialize_generator()
chain = _initialize_open_ai_chain()
