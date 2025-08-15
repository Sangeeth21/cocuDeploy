
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Package, MessageSquare, ListChecks, ShieldAlert, User, CheckCircle, X, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, query, where, orderBy, limit, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

type NotificationAction = {
    label: string;
    href?: string;
    variant?: "default" | "destructive" | "outline" | "secondary";
    onClick?: () => void;
}

type Notification = {
    id: string;
    type: string;
    text: string;
    timestamp: any;
    href: string;
    isRead: boolean;
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

export function NotificationPopover({ forAdmin = false }: { notifications?: any[], forAdmin?: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // This is a placeholder for user/vendor ID. In a real app, you'd get this from context.
        const targetId = forAdmin ? "admin" : "VDR001";
        const q = query(
            collection(db, "notifications"), 
            where(forAdmin ? "forAdmin" : "vendorId", "==", targetId),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [forAdmin]);

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        const batch = writeBatch(db);
        unreadIds.forEach(id => {
            const notifRef = doc(db, "notifications", id);
            batch.update(notifRef, { isRead: true });
        });
        await batch.commit();
    };

    const handleDismissNotification = async (id: string) => {
        // For simplicity, we'll mark as read which will make it disappear for now.
        // A better implementation might have a "dismissed" flag.
        const notifRef = doc(db, "notifications", id);
        await updateDoc(notifRef, { isRead: true });
    };
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <button onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-primary" disabled={unreadCount === 0}>Mark all as read</button>
                    </div>
                    <div className="grid gap-4 max-h-[22rem] overflow-y-auto pr-2">
                       {notifications.length > 0 ? (
                           notifications.map(item => {
                                const Icon = notificationIcons[item.type] || notificationIcons.default;
                                const timestamp = item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleTimeString() : 'Just now';
                                return (
                                     <div key={item.id} className="group relative flex items-start gap-4">
                                        {!item.isRead && <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />}
                                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDismissNotification(item.id)}>
                                            <X className="h-4 w-4"/>
                                            <span className="sr-only">Dismiss notification</span>
                                        </Button>
                                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                                            <Icon className="h-5 w-5 text-primary"/>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm pr-6"><Link href={item.href || '#'} className="font-medium hover:underline">{item.text}</Link></p>
                                            <p className="text-xs text-muted-foreground">{timestamp}</p>
                                             {item.actions && (
                                                <div className="flex gap-2">
                                                    {item.actions.map((action, index) => (
                                                        <Button
                                                            key={index}
                                                            size="sm"
                                                            variant={action.variant || "secondary"}
                                                            asChild={!!action.href}
                                                            onClick={action.onClick}
                                                        >
                                                           {action.href ? <Link href={action.href}>{action.label}</Link> : action.label}
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
