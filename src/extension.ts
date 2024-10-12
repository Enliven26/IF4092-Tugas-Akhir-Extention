import * as vscode from 'vscode';
import { setApiKey, clearApiKey } from './extension/commands/apikey';
import { setUpGitHook } from './extension/commands/githook';
import { watchFileChangesAsync } from './extension/filewatcher/watcher';
import { Commands } from './extension/constants/enums';
import { InMemoryState } from './extension/models';

var inMemoryState: InMemoryState = {
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
	const fileWatcher = vscode.workspace.onDidChangeTextDocument(
		(event) => watchFileChangesAsync(context, event, inMemoryState));
		
    context.subscriptions.push(fileWatcher);
};


export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
	registerFileWatcher(context, inMemoryState);
}

export function deactivate() {
}
