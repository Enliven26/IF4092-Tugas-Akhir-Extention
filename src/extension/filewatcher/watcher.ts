import * as vscode from 'vscode';
import { validateFileChangesAsync } from './watcher.validation';
import { handleFileChangesAsync } from './watcher.handler';
import { InMemoryState } from '../models';

export const watchFileChangesAsync = async (
    context: vscode.ExtensionContext, 
    event: vscode.TextDocumentChangeEvent,
    inMemoryState: InMemoryState) => {
    var isValid = await validateFileChangesAsync(context, event, inMemoryState);

    if (!isValid){
        return;
    }
    
    await handleFileChangesAsync(context, event);
};