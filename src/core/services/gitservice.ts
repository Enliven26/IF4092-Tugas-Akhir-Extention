import { simpleGit } from 'simple-git';

export const isGitIsIntializedAsync = async (workspacePath: string): Promise<boolean> => {
    const git = simpleGit(workspacePath);
    return await git.checkIsRepo();
};