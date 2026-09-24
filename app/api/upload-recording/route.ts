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

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const interviewId = (formData.get("interviewId") as string) || "";
        const durationSeconds = Number(formData.get("durationSeconds") || 0);

        if (!file || typeof file !== "object" || !("arrayBuffer" in file) || file.size === 0) {
            return NextResponse.json({ error: "Invalid video recording file payload" }, { status: 400 });
        }

        if (!interviewId) {
            return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });
        }

        const userId = user.id || user.primaryEmailAddress?.emailAddress || "user";
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const fileName = `interview_${interviewId}_${recordingId}.webm`;
        const fileSize = file.size;

        let recordingUrl = "";
        let storageProvider = "server";

        // Provider 1: Supabase Storage
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && supabaseUrl !== "dummy" && !supabaseUrl.includes("dummy")) {
            try {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const bucketName = "interview-recordings";
                const filePath = `${userId}/${fileName}`;

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, buffer, {
                        contentType: "video/webm",
                        upsert: true
                    });

                if (!error && data) {
                    const { data: publicUrlData } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    recordingUrl = publicUrlData.publicUrl;
                    storageProvider = "supabase";
                } else {
                    console.warn("Supabase upload notice:", error?.message);
                }
            } catch (supaErr) {
                console.warn("Supabase upload exception:", supaErr);
            }
        }

        // Provider 2: ImageKit Object Storage Fallback
        if (
            !recordingUrl &&
            process.env.IMAGEKIT_URL_PUBLIC_KEY &&
            process.env.IMAGEKIT_URL_PRIVATE_KEY &&
            process.env.IMAGEKIT_URL_PRIVATE_KEY !== "private_dummy"
        ) {
            try {
                const uploadResponse = await imagekit.upload({
                    file: buffer,
                    fileName: fileName,
                    folder: `/recordings/${userId}`,
                    isPrivateFile: false,
                    useUniqueFileName: true,
                });
                if (uploadResponse?.url) {
                    recordingUrl = uploadResponse.url;
                    storageProvider = "imagekit";
                }
            } catch (imgErr) {
                console.warn("ImageKit upload exception:", imgErr);
            }
        }

        // Provider 3: Persistent Server Disk Storage Fallback
        if (!recordingUrl) {
            try {
                const uploadsDir = path.join(process.cwd(), "public", "uploads", "recordings");
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const savePath = path.join(uploadsDir, fileName);
                fs.writeFileSync(savePath, buffer);

                // Construct accessible persistent URL
                const origin = req.nextUrl.origin || "http://localhost:3000";
                recordingUrl = `${origin}/uploads/recordings/${fileName}`;
                storageProvider = "server";
            } catch (fsErr) {
                console.error("Server disk write exception:", fsErr);
                return NextResponse.json({ error: "Failed to persist recording file" }, { status: 500 });
            }
        }

        return NextResponse.json({
            status: 200,
            recordingUrl,
            recordingId,
            fileSize,
            durationSeconds,
            storageProvider,
            createdAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Recording upload endpoint error:", error);
        return NextResponse.json({ error: error.message || "Upload processing error" }, { status: 500 });
    }
}
