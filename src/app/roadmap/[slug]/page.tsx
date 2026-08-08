'use client';

import { useUserData } from '@/hooks/useUserData';
import NodeWorkspace from '@/components/roadmap/NodeWorkspace';

export default function NodeWorkspacePage({ params }: { params: { slug: string } }) {
  const data = useUserData();
  return <NodeWorkspace data={data} slug={decodeURIComponent(params.slug)} />;
}
