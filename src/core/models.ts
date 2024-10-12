export interface FileChangeModel {
    uri: string;
    startLine: number;
    endLine: number;
}

export interface GitDiffModel {
    uri: string;
    diff: Array<DiffLineModel>;
}

export interface DiffLineModel {
    line: number;
    content: string;
}