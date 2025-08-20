
"use client";

import Link from "next/link";
import Image from "next/image";
import { Gavel, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useBidRequest } from "@/context/bid-request-context";
import { useUser } from "@/context/user-context";
import type { DisplayProduct } from "@/lib/types";

export function BidPreview() {
    const { bidItems, removeFromBid, totalItems } = useBidRequest();
    const { commissionRates } = useUser();

    const getFinalPrice = (product: DisplayProduct) => {
        const commissionRule = commissionRates?.corporate?.[product.category];
        let finalPrice = product.price;
        if (commissionRule && commissionRule.buffer) {
            if (commissionRule.buffer.type === 'fixed') {
                finalPrice += commissionRule.buffer.value;
            } else {
                finalPrice *= (1 + (commissionRule.buffer.value / 100));
            }
        }
        return finalPrice;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open bid request list" className="relative">
                    <Gavel className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Bid Request List</h4>
                        <p className="text-sm text-muted-foreground">
                           {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for bidding.
                        </p>
                    </div>
                    <div className="grid gap-4">
                       {bidItems.length > 0 ? (
                            <>
                                <div className="max-h-[22rem] overflow-y-auto pr-2 space-y-4">
                                {bidItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Link href={`/corporate/products/${item.id}`} className="text-sm font-medium leading-tight hover:text-primary">{item.name}</Link>
                                            <p className="text-xs text-muted-foreground">{item.category}</p>
                                            <p className="text-xs text-muted-foreground">Est. Price: ${getFinalPrice(item).toFixed(2)}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeFromBid(item.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                </div>
                                <Separator />
                                <Button asChild className="w-full">
                                    <Link href="/corporate/bids/new">Create Bid Request</Link>
                                </Button>
                            </>
                       ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">Add products to start a bid request.</p>
                       )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
