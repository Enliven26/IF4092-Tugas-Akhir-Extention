export enum PromptMessages {
    ApiKeyPrompt = "Please enter your API key",
    ReplaceExistingHook = "Do you want to replace current existing commit message hook?"
}

export enum InformationMessages {
    ApiKeySaved = "API key has been saved securely!",
    GitHookSetupSuccess = "Git hook setup has been completed!"
}

export enum WarningMessages {
    ApiKeyNotProvided = "No API key was provided."
}

export enum ErrorMessages {
    NoWorkspaceFolder = "Workspace folder not found.",
    GitHookSetupFailedExistingHook = "Failed to setup Git Hook. Please remove existing commit message hook or modify it manually.",
    GitHookSetupFailedError = "Failed to setup Git Hook: {}"
}