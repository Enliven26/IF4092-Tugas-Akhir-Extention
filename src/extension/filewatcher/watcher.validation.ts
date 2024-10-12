import * as vscode from 'vscode';
import path from 'path';
import { WarningMessages } from '../../core/constants/messages';
import { SecretKeys } from '../../core/constants/enums';
import { InMemoryState } from '../models';
import { isFileIsTrackedByGitAsync, isGitIsIntializedAsync } from '../../core/services/gitservice';

export const validateFileChangesAsync = async (
    context: vscode.ExtensionContext, 
    event: vscode.TextDocumentChangeEvent,
    inMemoryState: InMemoryState): Promise<boolean> => {
    if (event.contentChanges.length === 0) {
        return false;
    }

    const documentUri = event.document.uri;

    if (documentUri.scheme !== 'file') {
        return false;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        return false; 
    }

    const isGitExist = await isGitIsIntializedAsync(workspaceFolder.uri.fsPath);

    const secrets: vscode.SecretStorage = context.secrets;
    const existingApiKey = await secrets.get(SecretKeys.ApiKey);
    const isApiKeyProvided = existingApiKey !== undefined;

    if (!isGitExist || !isApiKeyProvided) {
        warnUser(inMemoryState, isGitExist, isApiKeyProvided);
        return false;
    }

    const isTracked = await isFileIsTrackedByGitAsync(documentUri.fsPath, workspaceFolder.uri.fsPath);

    if (!isTracked) {
        console.log(`File ${path.basename(documentUri.fsPath)} is not tracked by Git.`);
        return false;
    }

    return true;
};

const warnUser = (
    inMemoryState: InMemoryState, 
    isGitProvided: boolean, 
    isApiKeyProvided: boolean) => {
    if (!isGitProvided && !inMemoryState.hasWarnedGitNotInitialized) {
        
        vscode.window.showWarningMessage(WarningMessages.GitNotInitialized);
        inMemoryState.hasWarnedGitNotInitialized = true;
        return;
    }

    if (!isApiKeyProvided && !inMemoryState.hasWarnedApiKeyNotProvided) {
        vscode.window.showWarningMessage(WarningMessages.ApiKeyNotProvided);
        inMemoryState.hasWarnedApiKeyNotProvided = true;
        
        return;
    }  
};

