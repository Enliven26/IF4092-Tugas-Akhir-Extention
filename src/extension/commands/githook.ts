import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ErrorMessages, InformationMessages, PromptMessages, WarningMessages } from '../../core/domain/constants/messages';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { gitHookVenvFolderName, gitHookRelativeFolderPath, gitHookSetupLockRelativePath, projectHookFolderPath, gitHookRequirementFileName, gitHookSettingsFileName } from '../domain/constants/values';
import { isGitIsIntializedAsync } from '../../core/services/gitservice';

const exec = promisify(childProcess.exec);

const installGitHookRequirements = async (
    progress: vscode.Progress<{ message?: string }>,
    gitHookFolderPath: string, 
    venvPath: string) => {
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
        
        const requirementsPath = path.join(gitHookFolderPath, gitHookRequirementFileName);

        if (!fs.existsSync(requirementsPath)) {
            throw new Error(`Requirements file not found at ${requirementsPath}`);
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
};

const writeSettingsFile = (
    progress: vscode.Progress<{ message?: string }>,
    gitHookFolderPath: string) => {

    progress.report({ message: "Writing settings file..." });

    const settingsPath = path.join(gitHookFolderPath, gitHookSettingsFileName);
    const config = vscode.workspace.getConfiguration('autocommit.apiConfiguration');

    const settings = {
        "openaiLlmModel": config.get('llmModel') || "",
        "openaiEmbeddingsModel": config.get('embeddingsModel') || "",
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
};

export const setUpGitHook = async (context: vscode.ExtensionContext) => {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage(ErrorMessages.NoWorkspaceFolder);
        return;
    }

    const isGitExist = await isGitIsIntializedAsync(workspaceFolder);

    if (!isGitExist) {
        vscode.window.showErrorMessage(ErrorMessages.GitNotInitialized);
        return;
    }

    const gitHookFolderPath = path.join(workspaceFolder, gitHookRelativeFolderPath);
    const gitHookSetupLockPath = path.join(workspaceFolder, gitHookSetupLockRelativePath);

    if (fs.existsSync(gitHookSetupLockPath)) {
        vscode.window.showWarningMessage(WarningMessages.GitHookSetupIsBeingLocked);
        return;
    }

    fs.writeFileSync(gitHookSetupLockPath, '');

    const hookSourceFolderPath = path.join(context.extensionPath, projectHookFolderPath);
    const allowedFolderPrefix = "autocommit_";

    const sourceFiles = fs.readdirSync(hookSourceFolderPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile() || (dirent.isDirectory() && dirent.name.startsWith(allowedFolderPrefix)))
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

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Setting up Autocommit Git hook",
        cancellable: false
    }, async (progress) => {

        writeSettingsFile(progress, gitHookFolderPath);

        try {
            if (!fs.existsSync(gitHookFolderPath)) {
                fs.mkdirSync(gitHookFolderPath, { recursive: true });
            }

            progress.report({ message: "Copying hook files..." });

            sourceFiles.forEach(file => {
                const sourcePath = path.join(hookSourceFolderPath, file);
                const targetPath = path.join(gitHookFolderPath, file);
                
                if (fs.lstatSync(sourcePath).isDirectory()) {
                    if (fs.existsSync(targetPath)) {
                        fs.rmSync(targetPath, { recursive: true });
                    }
                    fs.mkdirSync(targetPath, { recursive: true });

                    fs.readdirSync(sourcePath).forEach(subFile => {
                        fs.copyFileSync(path.join(sourcePath, subFile), path.join(targetPath, subFile));
                        fs.chmodSync(path.join(targetPath, subFile), '755');
                    });
                }
                else {
                    fs.copyFileSync(sourcePath, targetPath);
                    fs.chmodSync(targetPath, '755');
                }
            });

            const venvPath = path.join(gitHookFolderPath, gitHookVenvFolderName);
            
            await installGitHookRequirements(progress, gitHookFolderPath, venvPath);

            vscode.window.showInformationMessage(InformationMessages.GitHookSetupSuccess);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown";
            vscode.window.showErrorMessage(
                ErrorMessages.GitHookSetupFailedError.replace("{}", errorMessage)
            );
        } finally {
            fs.rmSync(gitHookSetupLockPath);
        }
    });
};