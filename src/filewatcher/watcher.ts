import * as vscode from 'vscode';
import path from 'path';
import { simpleGit } from 'simple-git';

export const watchFileChanges = async (event: vscode.TextDocumentChangeEvent) => {
    const documentUri = event.document.uri;

    if (documentUri.scheme !== 'file') {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        return; 
    }

    if (event.contentChanges.length === 0) {
        return;
    }

    const isTracked = await checkIfFileIsTrackedByGit(documentUri.fsPath, workspaceFolder.uri.fsPath);

    if (!isTracked) {
        console.log(`File ${path.basename(documentUri.fsPath)} is not tracked by Git.`);
        return;
    }

    console.log(`File ${path.basename(documentUri.fsPath)} is tracked by Git and has changed.`);
};

const checkIfFileIsTrackedByGit = async (filePath: string, workspacePath: string): Promise<boolean> => {
    const git = simpleGit(workspacePath);
    const isIgnored = await git.checkIgnore(filePath);
    return isIgnored.length === 0;
};