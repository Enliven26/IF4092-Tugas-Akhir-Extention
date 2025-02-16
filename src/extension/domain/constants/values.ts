import * as path from 'path';

export const backgroundTaskInterval = 10000;
export const gitHookVenvFolderName = 'autocommit_venv';

const gitFolderName = ".git";
const gitHookFolderName = "hooks";

export const projectHookFolderPath = "hooks";

export const gitHookRelativeFolderPath = path.join(gitFolderName, gitHookFolderName);

export const gitHookSetupLockRelativePath = path.join(gitHookRelativeFolderPath, 'autocommit_setup_lock');

export const gitHookContextFolderRelativePath = path.join(gitHookRelativeFolderPath, 'autocommit_context');

export const gitHookRequirementFileName = 'autocommit_requirements.txt';

export const contextSeparator = "--- RETRIEVED DOCUMENT SPLIT END ---";

export const contextFileName = 'context.txt';