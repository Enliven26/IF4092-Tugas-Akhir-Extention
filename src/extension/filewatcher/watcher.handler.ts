import * as vscode from 'vscode';
import path from 'path';
import { FileChangeModel } from '../../core/models';

export const handleFileChangesAsync = async (context: vscode.ExtensionContext, event: vscode.TextDocumentChangeEvent) => {
    const fileChanges = getFileChanges(event);

    fileChanges.forEach(async change => {
        console.log(`File ${path.basename(change.uri.fsPath)} has been changed. Start line: ${change.startLine}, End line: ${change.endLine}`);
    });
};

const getFileChanges = (event: vscode.TextDocumentChangeEvent): Array<FileChangeModel> => {
    var result = new Array<FileChangeModel>();

    event.contentChanges.forEach(change => {
        var text = change.text;

        var lines = text.split(/\r\n|\r|\n/);
        
        var startLine = change.range.start.line;
        var endLine = Math.max(startLine + lines.length - 1, change.range.end.line);

        result.push({ uri: event.document.uri, startLine, endLine });
    });

    return result;
};