'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />;
}

export { toast, Toaster };
