import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse border border-outline-variant/40 bg-surface/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
