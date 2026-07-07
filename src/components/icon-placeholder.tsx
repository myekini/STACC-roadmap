import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

// Registry blocks (e.g. @efferd) ship <IconPlaceholder lucide="..." hugeicons="..." />
// expecting the consumer to resolve an icon library. We resolve to lucide.
interface IconPlaceholderProps extends LucideProps {
  lucide: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  tabler?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IconPlaceholder({ lucide, hugeicons: _h, phosphor: _p, remixicon: _r, tabler: _t, ...props }: IconPlaceholderProps) {
  const Icon = (icons as unknown as Record<string, ComponentType<LucideProps>>)[lucide] ?? icons.CircleHelp;
  return <Icon {...props} />;
}
