import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export type IconName = keyof typeof Icons;

interface IconRendererProps extends LucideProps {
  name: string;
}

export function IconRenderer({ name, ...props }: IconRendererProps) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!Cmp) return <Icons.Circle {...props} />;
  return <Cmp {...props} />;
}

export const ACTIVITY_ICON_CHOICES = [
  'BookOpen', 'Bookmark', 'Dumbbell', 'BrainCircuit', 'PenLine', 'Sparkles',
  'Target', 'Droplet', 'Home', 'Code2', 'Music', 'Briefcase',
  'GraduationCap', 'Utensils', 'Bed', 'Bike', 'Guitar', 'Camera', 'Languages',
  'Palette', 'Gamepad2', 'Heart', 'Leaf', 'Coffee',
];
