/**
 * FILE HANDOFF
 *
 * Carries files from the homepage drop zone into the tool the user picks,
 * so choosing a tool after dropping a file doesn't ask for the same file
 * again.
 *
 * A module-level slot rather than context or props: the tool component is
 * mounted several layers below the router by `renderTool()`, and threading
 * a File array through every view would touch a lot of unrelated code for
 * one transient value.
 *
 * The slot holds at most one handoff and is consumed exactly once, so a
 * later visit to another tool never picks up a stale file.
 */

interface Handoff {
  toolId: string;
  files: File[];
}

let pending: Handoff | null = null;

/** Stage files for the tool about to be opened. Replaces any previous stage. */
export function stageFiles(toolId: string, files: File[]): void {
  pending = files.length ? { toolId, files } : null;
}

/**
 * Claim files staged for `toolId`, clearing the slot.
 * Returns an empty array when nothing was staged for this tool.
 */
export function takeStagedFiles(toolId: string): File[] {
  if (!pending || pending.toolId !== toolId) return [];
  const { files } = pending;
  pending = null;
  return files;
}

/** Drop anything staged, used when navigating away without opening a tool. */
export function clearStagedFiles(): void {
  pending = null;
}
