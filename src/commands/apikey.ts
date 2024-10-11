import * as vscode from 'vscode';
import { SecretStorage } from "vscode";
import { SecretKeys } from '../constants/enums';
import { InformationMessages, PromptMessages, WarningMessages } from '../constants/messages';

export const setApiKey = async (context: vscode.ExtensionContext) => {
	const apiKey = await vscode.window.showInputBox({
        prompt: PromptMessages.ApiKeyPrompt,
        ignoreFocusOut: true,
        password: true
    });

    if (apiKey) {
        const secrets: SecretStorage = context.secrets;
        await secrets.store(SecretKeys.ApiKey, apiKey);
        vscode.window.showInformationMessage(InformationMessages.ApiKeySaved);
    } else {
        vscode.window.showWarningMessage(WarningMessages.ApiKeyNotProvided);
    }
};