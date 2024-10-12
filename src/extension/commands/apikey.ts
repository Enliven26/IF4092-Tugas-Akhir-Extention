import * as vscode from 'vscode';
import { SecretStorage } from "vscode";
import { SecretKeys } from '../../core/constants/enums';
import { InformationMessages, PromptMessages, WarningMessages } from '../../core/constants/messages';

export const setApiKey = async (context: vscode.ExtensionContext) => {
    const secrets: SecretStorage = context.secrets;
    const existingApiKey = await secrets.get(SecretKeys.ApiKey);

    if (existingApiKey) {
        const replaceKey = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: PromptMessages.ExistingApiKey,
            ignoreFocusOut: true
        });

        if (replaceKey === 'No') {
            vscode.window.showInformationMessage(InformationMessages.ApiKeySetupCancelled);
            return;
        }
    }

	const apiKey = await vscode.window.showInputBox({
        prompt: PromptMessages.NewApiKey,
        ignoreFocusOut: true,
        password: true
    });

    if (apiKey) {
        await secrets.store(SecretKeys.ApiKey, apiKey);
        vscode.window.showInformationMessage(InformationMessages.ApiKeySaved);
    } else if (existingApiKey) {
        vscode.window.showInformationMessage(InformationMessages.ApiKeySetupCancelled);
    } else {
        vscode.window.showWarningMessage(WarningMessages.ApiKeyNotProvided);
    }
};

export const clearApiKey = async (context: vscode.ExtensionContext) => {
    const secrets: SecretStorage = context.secrets;
    await secrets.delete(SecretKeys.ApiKey);
    vscode.window.showInformationMessage(InformationMessages.ApiKeyRemoved);
};