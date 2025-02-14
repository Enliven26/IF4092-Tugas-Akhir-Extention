import * as vscode from 'vscode';
import { setApiKey, clearApiKey } from './extension/commands/apikey';
import { setUpGitHook } from './extension/commands/githook';
import { Commands } from './extension/domain/enums';
import { InMemoryState } from './extension/models';
import { ErrorMessages } from './core/domain/constants/messages';
import { BackgroundTaskInterval } from './extension/domain/constants/values';
import { validateInitializations } from './extension/actions/validations';

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

const registerBackgroundTasks = (context: vscode.ExtensionContext, inMemoryState: InMemoryState) => {
	const interval = setInterval(() => {
        validateInitializations(context, inMemoryState);
    }, BackgroundTaskInterval);

	const disposables = [
		vscode.workspace.onDidChangeTextDocument(
			(_) => new vscode.Disposable(() => clearInterval(interval)))
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

	registerBackgroundTasks(context, inMemoryState);
}

export function deactivate() {
}

