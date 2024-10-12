import * as vscode from 'vscode';
import { setApiKey, clearApiKey } from './extension/commands/apikey';
import { setUpGitHook } from './extension/commands/githook';
import { watchFileChangesAsync, watchFileRenameAsync } from './extension/filewatcher/watcher';
import { Commands } from './extension/constants/enums';
import { InMemoryState } from './extension/models';
import { ErrorMessages } from './core/constants/messages';

const inMemoryState: InMemoryState = {
	hasWarnedGitNotInitialized: false,
	hasWarnedApiKeyNotProvided: false
};

const registerCommands = (context: vscode.ExtensionContext) => {
	const disposables = [
		vscode.commands.registerCommand(Commands.GitHookCommand, () => setUpGitHook(context)),
		vscode.commands.registerCommand(Commands.ApiKeyCommand, () => setApiKey(context)),
		vscode.commands.registerCommand(Commands.ClearApiKeyCommand, () => clearApiKey(context))
	];

	disposables.forEach(disposable => context.subscriptions.push(disposable));
};

const registerFileWatcher = (context: vscode.ExtensionContext, inMemoryState: InMemoryState) => {
	const disposables = [
		vscode.workspace.onDidChangeTextDocument(
			(event) => watchFileChangesAsync(context, event, inMemoryState)),
		vscode.workspace.onDidRenameFiles(
		(event) => watchFileRenameAsync(context, event, inMemoryState))
	];
		
	disposables.forEach(disposable => context.subscriptions.push(disposable));
};


export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);

	const workspaces = vscode.workspace.workspaceFolders;

	if (!workspaces) {
		vscode.window.showErrorMessage(ErrorMessages.NoWorkspaceFolder);
		return;
	}

	if (workspaces.length > 1) {
		vscode.window.showWarningMessage(ErrorMessages.MultipleWorkspaceFolders);
		return;
	}

	registerFileWatcher(context, inMemoryState);
}

export function deactivate() {
}
