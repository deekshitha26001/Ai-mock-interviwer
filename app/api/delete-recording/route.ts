import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY || "dummy",
    privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY || "dummy",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
});

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { recordingUrl, recordingId, storageProvider } = body;

        if (!recordingUrl && !recordingId) {
            return NextResponse.json({ error: "Missing recording identifier" }, { status: 400 });
        }

        const userId = user.id || user.primaryEmailAddress?.emailAddress || "user";
        let deletedFromCloud = false;

        // Provider 1: Supabase Deletion
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (recordingUrl && recordingUrl.includes("supabase.co") && supabaseUrl && supabaseKey) {
            try {
                const supabase = createClient(supabaseUrl, supabaseKey);
                // Extract relative object path from URL
                const parts = recordingUrl.split("/interview-recordings/");
                if (parts[1]) {
                    const objectPath = parts[1];
                    // Authorize ownership: check if objectPath starts with userId
                    if (!objectPath.startsWith(userId)) {
                        return NextResponse.json({ error: "Unauthorized to delete this recording object" }, { status: 403 });
                    }
                    const { error } = await supabase.storage.from("interview-recordings").remove([objectPath]);
                    if (!error) deletedFromCloud = true;
                }
            } catch (supaErr) {
                console.warn("Supabase delete notice:", supaErr);
            }
        }

        // Provider 2: ImageKit Deletion
        if (
            recordingId &&
            process.env.IMAGEKIT_URL_PRIVATE_KEY &&
            process.env.IMAGEKIT_URL_PRIVATE_KEY !== "private_dummy"
        ) {
            try {
                await imagekit.deleteFile(recordingId);
                deletedFromCloud = true;
            } catch (imgErr) {
                console.warn("ImageKit delete notice:", imgErr);
            }
        }

        // Provider 3: Persistent Server Disk Deletion
        if (recordingUrl && (recordingUrl.includes("/uploads/recordings/") || storageProvider === "server")) {
            try {
                const filename = recordingUrl.split("/uploads/recordings/").pop();
                if (filename) {
                    const filePath = path.join(process.cwd(), "public", "uploads", "recordings", filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        deletedFromCloud = true;
                    }
                }
            } catch (fsErr) {
                console.warn("Server file delete notice:", fsErr);
            }
        }

        return NextResponse.json({
            status: 200,
            message: "Recording file deleted permanently from storage",
            deletedFromCloud
        });

    } catch (error: any) {
        console.error("Delete recording endpoint error:", error);
        return NextResponse.json({ error: error.message || "Delete request error" }, { status: 500 });
    }
}
