export enum PromptMessages {
    NewApiKey = "Please enter your API key",
    ExistingApiKey = "An API key already exists. Do you want to replace it?",
    ReplaceExistingHook = "Do you want to replace current existing commit message hook?"
}

export enum InformationMessages {
    ApiKeySaved = "API key has been saved securely!",
    ApiKeySetupCancelled = "Api key setup has been cancelled.",
    GitHookSetupSuccess = "Git hook setup has been completed!",
    ApiKeyRemoved = "API key has been removed."
}

export enum WarningMessages {
    ApiKeyNotProvided = "No API key was provided."
}

export enum ErrorMessages {
    NoWorkspaceFolder = "Workspace folder not found.",
    GitHookSetupFailedExistingHook = "Failed to setup Git Hook. Please remove existing commit message hook or modify it manually.",
    GitHookSetupFailedError = "Failed to setup Git Hook: {}"
}