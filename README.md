# Autocommit Extension

The Autocommit Extension is a VSCode extension that interfaces with the [AutoCommit library](https://github.com/Enliven26/IF4092-Tugas-Akhir) to generate commit messages by leveraging high-level context from the software project using LLM.

## Requirements
- Python 3.13
- Java 23

## Configurations
- **Embedding model**: Utilized for converting submitted context into a vectorstore database.
- **LLM model**: Utilized for the LLM in the commit message generation (CMG) workflow. Currently, only OpenAI models are supported.

## Commands
- **Setup Githook**: Allows users to set up a githook to leverage AutoCommit in any console.
- **Setup Context**: Enables users to submit the high-level context needed for CMG. Currently, the extension only supports submitting a Jira host URL with limited ticket IDs.