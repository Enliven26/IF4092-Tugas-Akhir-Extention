import * as path from 'path';

export const backgroundTaskInterval = 10000;
export const gitHookVenvFolderName = 'autocommit_venv';

export const projectHookFolderPath = "hooks";
export const gitHookRelativeFolderPath = path.join(".git", "hooks");
export const gitHookSetupLockRelativePath = path.join(gitHookRelativeFolderPath, 'autocommit_setup_lock');
export const gitHookContextFolderRelativePath = path.join(gitHookRelativeFolderPath, 'autocommit_context');
export const gitHookRequirementFileName = 'autocommit_requirements.txt';
export const gitHookSettingsFileName = 'autocommit_settings.json';

export const contextSeparator = "--- RETRIEVED DOCUMENT SPLIT END ---";
export const contextFileName = 'context.txt';
