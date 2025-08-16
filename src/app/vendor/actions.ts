
'use server';

import { moderateVendorProfile } from "@/ai/flows/moderate-vendor-profile-flow";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function updateVendorProfile(
    vendorId: string, 
    data: { name: string, bio: string }
): Promise<{ success: boolean; message: string }> {
    
    // First, moderate the bio content
    const moderationResult = await moderateVendorProfile({ profileText: data.bio });

    if (!moderationResult.isAllowed) {
        return { success: false, message: moderationResult.reason || "Your profile description contains forbidden content." };
    }

    try {
        const vendorRef = doc(db, "users", vendorId);
        await updateDoc(vendorRef, {
            name: data.name,
            bio: data.bio
        });
        return { success: true, message: "Profile updated successfully!" };
    } catch (error) {
        console.error("Error updating vendor profile:", error);
        return { success: false, message: "Failed to update profile. Please try again." };
    }
}
