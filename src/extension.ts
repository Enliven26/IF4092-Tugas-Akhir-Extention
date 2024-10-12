import * as vscode from 'vscode';
import { Commands } from './constants/enums';
import { setApiKey, clearApiKey } from './commands/apikey';
import { setUpGitHook } from './commands/githook';
import path from 'path';
import { watchFileChanges } from './filewatcher/watcher';

const registerCommands = (context: vscode.ExtensionContext) => {
	const disposables = [
		vscode.commands.registerCommand(Commands.GitHookCommand, () => setUpGitHook(context)),
		vscode.commands.registerCommand(Commands.ApiKeyCommand, () => setApiKey(context)),
		vscode.commands.registerCommand(Commands.ClearApiKeyCommand, () => clearApiKey(context))
	];

	disposables.forEach(disposable => context.subscriptions.push(disposable));
};

const registerFileWatcher = (context: vscode.ExtensionContext) => {
	const fileWatcher = vscode.workspace.onDidChangeTextDocument(watchFileChanges);
    context.subscriptions.push(fileWatcher);
};

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
	registerFileWatcher(context);
}

export function deactivate() {}
