
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronsLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type AdminSidebarContextType = {
    isCollapsed: boolean
}

const AdminSidebarContext = React.createContext<AdminSidebarContextType | null>(null)

function useAdminSidebar() {
    const context = React.useContext(AdminSidebarContext)
    if (!context) {
        throw new Error("useAdminSidebar must be used within a AdminSidebar component.")
    }
    return context
}

const AdminSidebar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(({ className, open, onOpenChange, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    const isCollapsed = isMobile ? false : !open;

    return (
        <TooltipProvider delayDuration={0}>
            <AdminSidebarContext.Provider value={{ isCollapsed }}>
                <div
                    ref={ref}
                    className={cn(
                        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-20" : "w-64",
                        className
                    )}
                    data-collapsed={isCollapsed}
                    {...props}
                >
                    {children}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1/2 -right-5 h-8 w-8 rounded-full border bg-background text-foreground hover:bg-muted"
                        onClick={() => onOpenChange?.(!open)}
                    >
                        <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>
             </AdminSidebarContext.Provider>
        </TooltipProvider>
    )
})
AdminSidebar.displayName = "AdminSidebar"


const AdminSidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useAdminSidebar();
  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn("flex flex-col gap-2 p-2 overflow-hidden", className)}
      {...props}
    />
  )
})
AdminSidebarHeader.displayName = "AdminSidebarHeader"

const AdminSidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
        className
      )}
      {...props}
    />
  )
})
AdminSidebarContent.displayName = "AdminSidebarContent"

const AdminSidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-auto flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
AdminSidebarFooter.displayName = "AdminSidebarFooter"

const AdminSidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
AdminSidebarMenu.displayName = "AdminSidebarMenu"

const AdminSidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
AdminSidebarMenuItem.displayName = "AdminSidebarMenuItem"


const AdminSidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: React.ComponentProps<typeof TooltipContent>
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isCollapsed } = useAdminSidebar();

    const buttonContent = (
      <Button
        ref={ref}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full h-10 flex items-center gap-2",
            isCollapsed ? "justify-center" : "justify-start",
            className
        )}
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
    )

    if (isCollapsed && tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right" align="center" {...tooltip} />
            </Tooltip>
        );
    }
    
    return buttonContent
  }
)
AdminSidebarMenuButton.displayName = "AdminSidebarMenuButton"


const AdminSidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { isCollapsed } = useAdminSidebar()

    if (isCollapsed) return null;

    return (
      <div
        ref={ref}
        className={cn("ml-auto text-xs font-medium", className)}
        {...props}
      />
    )
})
AdminSidebarMenuBadge.displayName = "AdminSidebarMenuBadge"


export {
  AdminSidebar,
  AdminSidebarHeader,
  AdminSidebarContent,
  AdminSidebarFooter,
  AdminSidebarMenu,
  AdminSidebarMenuItem,
  AdminSidebarMenuButton,
  AdminSidebarMenuBadge
}
