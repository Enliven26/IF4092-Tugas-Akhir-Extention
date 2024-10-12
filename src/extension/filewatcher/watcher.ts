import * as vscode from 'vscode';
import { validateFileChangesAsync, validateFileRenameAsync } from './watcher.validation';
import { handleFileChangesAsync } from './watcher.handler';
import { InMemoryState } from '../models';

export const watchFileChangesAsync = async (
    context: vscode.ExtensionContext, 
    event: vscode.TextDocumentChangeEvent,
    inMemoryState: InMemoryState) => {
    const isValid = await validateFileChangesAsync(context, event, inMemoryState);

    if (!isValid){
        return;
    }
    
    await handleFileChangesAsync(context, event);
};

export const watchFileRenameAsync = async (
    context: vscode.ExtensionContext,
    event: vscode.FileRenameEvent,
    inMemoryState: InMemoryState) => {
        const validationResultMap = await validateFileRenameAsync(context, event, inMemoryState);

};