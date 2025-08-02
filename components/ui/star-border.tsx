import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--foreground))"

  return (
    <Component 
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-lg",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )} 
      {...props}
    >
      <div
        className={cn(
          "absolute w-[200%] h-[200%] animate-spin-slow z-0",
          "opacity-30" 
        )}
        style={{
          background: `conic-gradient(from 0deg, transparent, ${defaultColor}, transparent)`,
          animationDuration: speed,
        }}
      />
      <div className={cn(
        "relative z-10 w-full h-full flex items-center justify-center text-center text-sm font-medium px-4 py-2 rounded-lg",
        "bg-gray-900/90 border border-gray-700/50",
        "hover:bg-gray-800/90 hover:border-gray-600/50 transition-all duration-200"
      )}>
        {children}
      </div>
    </Component>
  )
}