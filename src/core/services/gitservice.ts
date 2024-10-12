import { simpleGit } from 'simple-git';
import { DiffLineModel, FileChangeModel, GitDiffModel } from '../models';

export const isGitIsIntializedAsync = async (workspacePath: string): Promise<boolean> => {
    const git = simpleGit(workspacePath);
    return await git.checkIsRepo();
};

export const isFileIsTrackedByGitAsync = async (filePath: string, workspacePath: string): Promise<boolean> => {
    const git = simpleGit(workspacePath);
    const isIgnored = await git.checkIgnore(filePath);
    return isIgnored.length === 0;
};

export const getGitDiffsAsync = async (
    workspacePath: string, 
    fileChanges: Array<FileChangeModel>
): Promise<Array<GitDiffModel>> => {
    const git = simpleGit(workspacePath);
    const result = new Array<GitDiffModel>();

    for (const fileChange of fileChanges) {
        const diff = await git.diff([fileChange.uri]);
        const lines = diff.split(/\r\n|\r|\n/);

        const diffLines = new Array<DiffLineModel>();
        
        

        result.push({ uri: fileChange.uri, diff: diffLines });
    }

    return result;
};