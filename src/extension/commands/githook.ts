import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorMessages, InformationMessages, PromptMessages, WarningMessages } from '../../core/domain/constants/messages';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { GitHookVenvFolderName } from '../domain/constants/values';

const exec = promisify(childProcess.exec);

const gitFolderName = ".git";
const gitHookFolderName = "hooks";
const projectHookFolderName = "hooks";

const installGitHookRequirements = async (gitHookFolderPath: string, venvPath: string) => {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Setting up Git hook environment",
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: "Creating virtual environment..." });
            
            let pythonCommand = 'python3';

            try {
                await exec('python3 --version');
            } catch {
                pythonCommand = 'python';
            }

            if (fs.existsSync(venvPath)) {
                fs.rmSync(venvPath, { recursive: true, force: true });
            }

            await exec(`${pythonCommand} -m venv "${venvPath}"`);

            progress.report({ message: "Installing requirements..." });
            
            const requirementsPath = path.join(gitHookFolderPath, 'requirements.txt');

            if (!fs.existsSync(requirementsPath)) {
                throw new Error('requirements.txt not found in hook folder');
            }

            const pipPath = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'pip')
                : path.join(venvPath, 'bin', 'pip');

            await exec(`"${pipPath}" install -r "${requirementsPath}"`);

            vscode.window.showInformationMessage(InformationMessages.GitHookSetupSuccess);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown";
            throw new Error(`Python setup failed: ${errorMessage}`);
        }
    });
};

export const setUpGitHook = async (context: vscode.ExtensionContext) => {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage(ErrorMessages.NoWorkspaceFolder);
        return;
    }

    const gitHookFolderPath = path.join(workspaceFolder, gitFolderName, gitHookFolderName);
    const hookSourceFolderPath = path.join(context.extensionPath, projectHookFolderName);

    const sourceFiles = fs.readdirSync(hookSourceFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

    const existingFiles = sourceFiles.filter(file => 
        fs.existsSync(path.join(gitHookFolderPath, file))
    );

    if (existingFiles.length > 0) {
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
        if (!fs.existsSync(gitHookFolderPath)) {
            fs.mkdirSync(gitHookFolderPath, { recursive: true });
        }

        sourceFiles.forEach(file => {
            const sourcePath = path.join(hookSourceFolderPath, file);
            const targetPath = path.join(gitHookFolderPath, file);
            
            fs.copyFileSync(sourcePath, targetPath);
            fs.chmodSync(targetPath, '755');
        });

        const venvPath = path.join(gitHookFolderPath, GitHookVenvFolderName);
        
        await installGitHookRequirements(gitHookFolderPath, venvPath);

        vscode.window.showInformationMessage(InformationMessages.GitHookSetupSuccess);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown";
        vscode.window.showErrorMessage(
            ErrorMessages.GitHookSetupFailedError.replace("{}", errorMessage)
        );
    }
};