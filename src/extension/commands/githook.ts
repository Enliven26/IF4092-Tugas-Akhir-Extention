import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorMessages, InformationMessages, PromptMessages, WarningMessages } from '../../core/constants/messages';

const gitFolderName = ".git";
const gitHookFolderName = "hooks";
const projectHookFolderName = "hooks";
const hookName = "prepare-commit-msg";
const pythonHookName = "prepare-commit-msg.py";

export const setUpGitHook = async (context: vscode.ExtensionContext) => {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage(ErrorMessages.NoWorkspaceFolder);
        return;
    }

    const gitHookPath = path.join(workspaceFolder, gitFolderName, gitHookFolderName, hookName);
    const pythonGitHookPath = path.join(workspaceFolder, gitFolderName, gitHookFolderName, pythonHookName);

    const extensionPath = context.extensionPath;
    const hookSourcePath = path.join(extensionPath, projectHookFolderName, hookName);
    const pythonHookSourcePath = path.join(extensionPath, projectHookFolderName, pythonHookName);

    if (fs.existsSync(gitHookPath)) {
        const replaceChoice = 'Replace';
        const cancelChoice = 'Cancel';

        const userChoice = await vscode.window.showWarningMessage(
            PromptMessages.ReplaceExistingHook,
            replaceChoice, cancelChoice
        );

        if (userChoice === cancelChoice) {
            vscode.window.showErrorMessage(ErrorMessages.GitHookSetupFailedExistingHook);
            return;
        }
    }

    try {
        fs.copyFileSync(hookSourcePath, gitHookPath);
        fs.copyFileSync(pythonHookSourcePath, pythonGitHookPath);
        fs.chmodSync(gitHookPath, '755');
        fs.chmodSync(pythonHookSourcePath, '755');
        vscode.window.showInformationMessage(InformationMessages.GitHookSetupSuccess);
    } catch (error) {
        var errorMessage = "Unknown";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        vscode.window.showErrorMessage(ErrorMessages.GitHookSetupFailedError.replace("{}", errorMessage));
    }
};