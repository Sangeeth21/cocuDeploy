
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Building, LifeBuoy } from "lucide-react"
import Link from "next/link"

export function ContactDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-muted-foreground hover:text-primary p-0 h-auto font-normal">Contact Us</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Contact Co & Cu</DialogTitle>
          <DialogDescription>
            We're here to help! Reach out to us through any of the channels below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                    <h4 className="font-semibold">Email Support</h4>
                    <a href="mailto:support@coandcu.com" className="text-sm text-primary hover:underline">support@coandcu.com</a>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                    <h4 className="font-semibold">Phone Support</h4>
                    <a href="tel:+1234567890" className="text-sm text-primary hover:underline">+1 (234) 567-890</a>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                <div>
                    <h4 className="font-semibold">Help Center</h4>
                    <p className="text-sm text-muted-foreground">Visit our FAQ for quick answers.</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                    <h4 className="font-semibold">Corporate Office</h4>
                    <p className="text-sm text-muted-foreground">123 Market St, San Francisco, CA</p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
