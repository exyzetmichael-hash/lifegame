import type { Priority, Project } from '@/types';

export interface ParsedQuickAdd {
  title: string;
  priority: Priority | null;
  due: 'today' | 'tomorrow' | null;
  projectId: string | null;
}

/** Pulls "p1".."p4", "сегодня"/"завтра", and "#project-name" out of free-typed quick-add text. */
export function parseQuickAdd(text: string, projects: Project[]): ParsedQuickAdd {
  let title = text;
  let priority: Priority | null = null;
  let due: 'today' | 'tomorrow' | null = null;
  let projectId: string | null = null;

  const pMatch = title.match(/\bp([1-4])\b/i);
  if (pMatch) {
    priority = `p${pMatch[1]}` as Priority;
    title = title.replace(pMatch[0], '');
  }

  if (/завтра/i.test(title)) {
    due = 'tomorrow';
    title = title.replace(/завтра/i, '');
  } else if (/сегодня/i.test(title)) {
    due = 'today';
    title = title.replace(/сегодня/i, '');
  }

  const hMatch = title.match(/#(\S+)/);
  if (hMatch) {
    const key = hMatch[1].toLowerCase();
    const match = projects.find(
      (p) => p.name.toLowerCase().replace(/\s+/g, '') === key || p.name.toLowerCase().startsWith(key)
    );
    if (match) projectId = match.id;
    title = title.replace(hMatch[0], '');
  }

  title = title.replace(/\s+/g, ' ').trim();
  return { title, priority, due, projectId };
}

export function dueToIsoDate(due: 'today' | 'tomorrow' | null): string | null {
  if (!due) return null;
  const d = new Date();
  if (due === 'tomorrow') d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
