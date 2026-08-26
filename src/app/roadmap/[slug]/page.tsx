'use client';

import { Suspense } from 'react';
import { useUserData } from '@/hooks/useUserData';
import NodeWorkspace from '@/components/roadmap/FocusedNodeWorkspace';
import { GithubStatusToast } from '@/components/roadmap/GithubStatusToast';

export default function NodeWorkspacePage({ params }: { params: { slug: string } }) {
  const data = useUserData();
  return (
    <>
      <Suspense fallback={null}>
        <GithubStatusToast />
      </Suspense>
      <NodeWorkspace data={data} slug={decodeURIComponent(params.slug)} />
    </>
  );
}
