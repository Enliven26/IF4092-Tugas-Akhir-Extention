import * as vscode from 'vscode';
import { gitHookRelativeFolderPath, gitHookContextFolderRelativePath, contextSeparator, contextFileName } from '../domain/constants/values';
import { ErrorMessages, InformationMessages, PromptMessages } from '../../core/domain/constants/messages';
import * as path from 'path';
import * as fs from 'fs';
import { isGitIsIntializedAsync } from '../../core/services/gitservice';
import { getJiraTicketContentAsync, isJiraUrlValidAsync } from '../../core/services/jiraservice';
import { ContextType } from '../domain/enums';

const writeContextFile = async (contextFolderPath: string, contents: string[]) => {
    const contextFilePath = path.join(contextFolderPath, contextFileName);
    const contextContent = contents.join(contextSeparator);

    fs.writeFileSync(contextFilePath, contextContent);
};

const setContextFromJira = async (context: vscode.ExtensionContext) => {
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

    const gitHookContextFolderPath = path.join(workspaceFolder, gitHookContextFolderRelativePath);

    if (fs.existsSync(gitHookContextFolderPath)) {
        fs.rmdirSync(gitHookContextFolderPath, { recursive: true });
    }

    fs.mkdirSync(gitHookContextFolderPath, { recursive: true });

    const jiraUrl = await vscode.window.showInputBox({
        placeHolder: 'Enter Jira URL'
    });

    if (!jiraUrl) {
        vscode.window.showInformationMessage(InformationMessages.ContextSetupCancelled);
        return;
    }

    if (!await isJiraUrlValidAsync(jiraUrl)) {
        vscode.window.showErrorMessage(ErrorMessages.InvalidJiraUrl);
        return;
    }

    const submitChoice = 'Limit';
    const cancelChoice = 'Don\'t limit';

    const userChoice = await vscode.window.showQuickPick([submitChoice, cancelChoice], {
        placeHolder: PromptMessages.SubmitJiraTicketIds,
        ignoreFocusOut: true
    });

    if (userChoice === cancelChoice) {
        return;
    }

    const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select Jira ticket ID collection file',
        filters: {
            'JSON files': ['json']
        }
    });

    if (!fileUri) {
        vscode.window.showInformationMessage(InformationMessages.ContextSetupCancelled);
        return;
    }
    
    const filePath = fileUri[0].fsPath;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jiraTicketIds = JSON.parse(fileContent);

    if (!jiraTicketIds || !Array.isArray(jiraTicketIds)) {
        vscode.window.showErrorMessage(ErrorMessages.InvalidJiraIdCollectionFileContent);
        return;
    }

    const validJiraTicketIds = jiraTicketIds.filter((id: any) => typeof id === 'string');
    const jiraTicketContents = await getJiraTicketContentAsync(jiraUrl!, validJiraTicketIds);

    await writeContextFile(gitHookContextFolderPath, jiraTicketContents);

    vscode.window.showInformationMessage(InformationMessages.ContextSetupSuccess);
};

export const setContext = async (context: vscode.ExtensionContext) => {
    const contextTypes = [ContextType.Jira];

    const selectedContextType = await vscode.window.showQuickPick(contextTypes, {
        placeHolder: 'Select context type',
        ignoreFocusOut: true
    });

    if (!selectedContextType) {
        vscode.window.showInformationMessage(InformationMessages.ContextSetupCancelled);
        return;
    }

    switch (selectedContextType) {
        case ContextType.Jira:
            await setContextFromJira(context);
            break;
        default:
            vscode.window.showErrorMessage(ErrorMessages.InvalidContextType);
            break;
    }
};