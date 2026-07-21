import { IconRenderer } from '@/components/ui/IconRenderer';

export function ComingSoon({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-20 text-text-dim">
      <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary">
        <IconRenderer name={icon} size={26} />
      </div>
      <h2 className="font-display font-semibold text-text text-lg">{title}</h2>
      <p className="text-sm max-w-xs">{description}</p>
    </div>
  );
}
