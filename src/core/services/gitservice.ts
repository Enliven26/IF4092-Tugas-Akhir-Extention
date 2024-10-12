import { simpleGit } from 'simple-git';
import { DiffRangeModel, FileChangeModel, GitDiffModel } from '../models';
import parseGitDiff from 'parse-git-diff';
import { AnyFileChange } from 'parse-git-diff';

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
        const diff = await git.diff(['HEAD', '--', fileChange.uri]);
        const parsedDiff = parseGitDiff(diff);

        for (const file of parsedDiff.files) {
            const diffRanges = new Array<DiffRangeModel>();

            result.push({ uri: fileChange.uri, diff: diffRanges });
        }
    }

    return result;
};

// const getDiffRanges = (file: AnyFileChange): Array<DiffRangeModel> => {
//     const diffLines = new Array<DiffRangeModel>();
//         for (const chunk of file.chunks) {
//             const minLine 
//         }
// };