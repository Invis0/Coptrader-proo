import * as React from "react"
import { cn } from "@/lib/utils"  // Updated import path

interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  className?: string
  children?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-gray-800 text-white border-gray-700",
      destructive: "bg-red-900/20 text-red-500 border-red-500/50",
      warning: "bg-yellow-900/20 text-yellow-500 border-yellow-500/50",
      success: "bg-green-900/20 text-green-500 border-green-500/50"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement, 
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))

AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))

AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }