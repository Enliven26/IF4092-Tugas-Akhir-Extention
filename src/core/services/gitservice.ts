import { simpleGit } from 'simple-git';

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
): Promise<string> => {
    const git = simpleGit(workspacePath);
    return await git.diff(['HEAD']);
};