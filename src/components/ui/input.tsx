import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-11 w-full rounded-control border border-input bg-surface-container-low px-3 py-2 text-base text-on-surface transition-[border-color,box-shadow,background-color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-on-surface-variant focus-visible:border-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/25 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
