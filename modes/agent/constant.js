

export const defaultAgentConfig = () => ({
  codebasePath: process.cwd(),
  maxFileSizeToRead: 1024 * 1024,
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '*.log',
    '.env*',
  ],
  tools: {
    allowShellExecution: true,
    allowFileModification: true,
    allowFileCreation: true,
    allowFolderCreation: true,
  },
});

export function isMutationType(t) {
  return (
    t === 'file_create' ||
    t === 'file_modify' ||
    t === 'file_delete' ||
    t === 'folder_create' ||
    t === 'tool_execute'
  );
}