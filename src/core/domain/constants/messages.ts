export enum PromptMessages {
    NewApiKey = "Please enter your API key",
    ExistingApiKey = "An API key already exists. Do you want to replace it?",
    ReplaceExistingHook = "Do you want to replace current existing commit message hook?",
    SubmitJiraTicketIds = "Do you want to limit the JiRA ticket ID collection to a file?",
}

export enum InformationMessages {
    ApiKeySaved = "API key has been saved securely!",
    ApiKeySetupCancelled = "Api key setup has been cancelled.",
    GitHookSetupSuccess = "Git hook setup has been completed!",
    ContextSetupSuccess = "Context setup has been completed!",
    ContextSetupCancelled = "Context setup has been cancelled.",
    ApiKeyRemoved = "API key has been removed."
}

export enum WarningMessages {
    ApiKeyNotProvided = "No API key was provided. AutoCommit will not work until an API key is provided.",
    GitNotInitialized = "Git is not initialized in the current workspace. AutoCommit will not work until Git is initialized.",
    GitHookSetupIsBeingLocked = "Git hook setup is ongoing. Please wait until it is completed.",
}

export enum ErrorMessages {
    NoWorkspaceFolder = "Workspace folder not found.",
    MultipleWorkspaceFolders = "Multiple workspace folders are not supported.",
    GitHookSetupFailedExistingHook = "Failed to setup Git Hook. Please remove existing commit message hook or modify it manually.",
    GitHookSetupFailedError = "Failed to setup Git Hook: {}",
    GitNotInitialized = "Initialize Git first before setting up AutoCommit.",
    InvalidJiraIdCollectionFileContent = "IJira ID collection file should be a JSON array of strings.",
    InvalidContextType = "Invalid context type. Please provide a valid context type.",
    InvalidJiraUrl = "Invalid Jira URL. Please provide a valid Jira URL.",
    FeatureNotImplemented = "Feature not implemented yet.",
    ContextSetupFailed = "Failed to setup context: {}",
}