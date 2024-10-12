import * as vscode from 'vscode';

export interface FileChangeModel {
    uri: vscode.Uri;
    startLine: number;
    endLine: number;
}