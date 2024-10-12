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

    const validationResultMap = await validateFileEventAsync(
        context, [event.document.uri], inMemoryState);

    if (!validationResultMap.get(event.document.uri.fsPath)) {
        return false;
    }

    const documentUri = event.document.uri;

    const workspaceFolder = vscode.workspace.workspaceFolders![0];

    const isTracked = await isFileIsTrackedByGitAsync(documentUri.fsPath, workspaceFolder.uri.fsPath);

    if (!isTracked) {
        console.log(`File ${path.basename(documentUri.fsPath)} is not tracked by Git.`);
        return false;
    }

    return true;
};

export const validateFileRenameAsync = async (
    context: vscode.ExtensionContext,
    event: vscode.FileRenameEvent,
    inMemoryState: InMemoryState): Promise<Map<string, Boolean>> => {
        const uris = event.files.map(file => file.oldUri);
        uris.push(...event.files.map(file => file.newUri));

        const validationResultMap = await validateFileEventAsync(
            context, uris, inMemoryState);

        for (const file of event.files) {
            const firstUri = file.oldUri;
            const secondUri = file.newUri;

            if (!validationResultMap.get(firstUri.fsPath) 
                || !validationResultMap.get(secondUri.fsPath)) {
                continue;
            }

            const workspace = vscode.workspace.workspaceFolders![0];

            var isEitherTracked = false;

            for (const uri of [firstUri, secondUri]) {
                    const isTracked = await isFileIsTrackedByGitAsync(uri.fsPath, workspace.uri.fsPath);

                    if (isTracked) {
                        isEitherTracked = true;
                        break;
                    }
            }

            if (!isEitherTracked) {
                validationResultMap.set(firstUri.fsPath, false);
                validationResultMap.set(secondUri.fsPath, false);
            }
        }

        return validationResultMap;
};

export const validateFileEventAsync = async (
    context: vscode.ExtensionContext, 
    documentUri: Array<vscode.Uri>,
    inMemoryState: InMemoryState): Promise<Map<string, Boolean>> => {
    const resultMap = new Map<string, Boolean>();

    if (documentUri.length === 0) {
        return resultMap;
    }

    for (const uri of documentUri) {
        resultMap.set(uri.fsPath, true);
    }

    for (const uri of documentUri) {
        if (uri.scheme !== 'file') {
            resultMap.set(uri.fsPath, false);
            continue;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders![0];

        const isGitExist = await isGitIsIntializedAsync(workspaceFolder.uri.fsPath);

        const secrets: vscode.SecretStorage = context.secrets;
        const existingApiKey = await secrets.get(SecretKeys.ApiKey);
        const isApiKeyProvided = existingApiKey !== undefined;

        if (!isGitExist || !isApiKeyProvided) {
            warnUser(inMemoryState, isGitExist, isApiKeyProvided);
            resultMap.set(uri.fsPath, false);
        }
    }

    return resultMap;
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

