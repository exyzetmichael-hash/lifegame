import { IconRenderer } from '@/components/ui/IconRenderer';

export function ComingSoon({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20 text-text-2">
      <IconRenderer name={icon} size={64} className="text-text-3" strokeWidth={1.5} />
      <div>
        <h3 className="serif text-2xl font-medium text-text mb-1.5">{title}</h3>
        <p className="text-sm max-w-xs">{description}</p>
      </div>
    </div>
  );
}
