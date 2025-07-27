
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Package, MessageSquare, ListChecks, ShieldAlert, User, CheckCircle, X, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type NotificationAction = {
    label: string;
    href?: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    onClick?: () => void;
}

type Notification = {
    type: string;
    id: string;
    text: string;
    time: string;
    href: string;
    actions?: NotificationAction[];
};

const notificationIcons: { [key: string]: React.ElementType } = {
    'order': ListChecks,
    'message': MessageSquare,
    'stock': Package,
    'confirmation': Bell,
    'user_report': ShieldAlert,
    'new_vendor': User,
    'order_shipped': Truck,
    'request_approved': CheckCircle,
    'request_denied': X,
    default: Bell
};

export function NotificationPopover({ notifications: initialNotifications }: { notifications: Notification[] }) {
    const [notifications, setNotifications] = useState(initialNotifications);

    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.preventDefault();
        setNotifications([]);
    };

    const handleDismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <button onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-primary">Mark all as read</button>
                    </div>
                    <div className="grid gap-4 max-h-[22rem] overflow-y-auto pr-2">
                       {notifications.length > 0 ? (
                           notifications.map(item => {
                                const Icon = notificationIcons[item.type] || notificationIcons.default;
                                return (
                                     <div key={item.id} className="group relative flex items-start gap-4">
                                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDismissNotification(item.id)}>
                                            <X className="h-4 w-4"/>
                                            <span className="sr-only">Dismiss notification</span>
                                        </Button>
                                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                                            <Icon className="h-5 w-5 text-primary"/>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm pr-6"><Link href={item.href} className="font-medium hover:underline">{item.text}</Link></p>
                                            <p className="text-xs text-muted-foreground">{item.time}</p>
                                             {item.actions && (
                                                <div className="flex gap-2">
                                                    {item.actions.map((action, index) => (
                                                        <Button key={index} size="sm" variant={action.variant || "secondary"} asChild={!!action.href}>
                                                           {action.href ? <Link href={action.href}>{action.label}</Link> : <button onClick={action.onClick}>{action.label}</button>}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                       ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">You have no new notifications.</p>
                       )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
