export interface FileChangeModel {
    uri: string;
    startLine: number;
    endLine: number;
}

export interface GitDiffModel {
    uri: string;
    diff: Array<DiffRangeModel>;
}

export interface DiffRangeModel {
    startLine: number;
    endLine: number;
    content: string;
}