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
    var result = new Array<FileChangeModel>();

    event.contentChanges.forEach(change => {
        var text = change.text;

        var lines = text.split(/\r\n|\r|\n/);
        
        var startLine = change.range.start.line;
        var endLine = Math.max(startLine + lines.length - 1, change.range.end.line);

        result.push({ uri: event.document.uri.fsPath, startLine, endLine });
    });

    return result;
};