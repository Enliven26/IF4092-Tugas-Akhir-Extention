import * as vscode from 'vscode';
import path from 'path';
import { FileChangeModel } from '../../core/models';
import { getGitDiffsAsync } from '../../core/services/gitservice';

export const handleFileChangesAsync = async (context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) => {
    const documentUri = event.document.uri;

    if (documentUri.scheme !== 'file') {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        return;
    }

    const fileChanges = getFileChanges(event);
    const diffs = await getGitDiffsAsync(workspaceFolder.uri.fsPath, fileChanges);
};

const getFileChanges = (event: vscode.TextDocumentChangeEvent): Array<FileChangeModel> => {
    const result = new Array<FileChangeModel>();

    event.contentChanges.forEach(change => {
        const text = change.text;

        const lines = text.split(/\r\n|\r|\n/);
        
        const startLine = change.range.start.line;
        const endLine = Math.max(startLine + lines.length - 1, change.range.end.line);

        result.push({ uri: event.document.uri.fsPath, startLine, endLine });
    });

    return result;
};