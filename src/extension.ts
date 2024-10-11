import * as vscode from 'vscode';
import { Commands } from './constants/enums';
import { setApiKey } from './commands/apikey';
import { setUpGitHook } from './commands/githook';

const registerCommands = (context: vscode.ExtensionContext) => {
	const disposables = [
		vscode.commands.registerCommand(Commands.GitHookCommand, () => setUpGitHook(context)),
		vscode.commands.registerCommand(Commands.ApiKeyCommand, () => setApiKey(context)),
	];

	disposables.forEach(disposable => context.subscriptions.push(disposable));
};

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
}

export function deactivate() {}
