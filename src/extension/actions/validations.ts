import * as vscode from 'vscode';
import { WarningMessages } from '../../core/domain/constants/messages';
import { InMemoryState } from '../models';
import { isGitIsIntializedAsync } from '../../core/services/gitservice';
import { SecretKeys } from '../../core/domain/enums';

export const validateInitializations = async (
    context: vscode.ExtensionContext,
	inMemoryState: InMemoryState) => {
    const workspaceFolder = vscode.workspace.workspaceFolders![0];
	const isGitExist = await isGitIsIntializedAsync(workspaceFolder.uri.fsPath);
	
	const secrets: vscode.SecretStorage = context.secrets;
	const existingApiKey = await secrets.get(SecretKeys.ApiKey);
	const isApiKeyProvided = existingApiKey !== undefined;
	console.log(existingApiKey);
	if (!isGitExist && !inMemoryState.hasWarnedGitNotInitialized) {
		
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