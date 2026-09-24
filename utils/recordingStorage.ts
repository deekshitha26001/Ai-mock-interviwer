/**
 * MAPD Unified Persistent Recording Storage Manager
 * Uploads MediaRecorder video blobs to persistent cloud / server storage,
 * while maintaining a local IndexedDB buffer for zero-loss offline resilience.
 */

const DB_NAME = "MAPD_Interview_Recordings_DB";
const STORE_NAME = "recordings";
const DB_VERSION = 1;

export type RecordingStorageType = "cloud" | "local";

export interface RecordingUploadResult {
    recordingUrl: string;
    recordingId?: string;
    fileSize?: number;
    storageType: RecordingStorageType;
    storageProvider?: string;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !("indexedDB" in window)) {
            reject(new Error("IndexedDB is not supported"));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db: IDBDatabase = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event: any) => {
            resolve(event.target.result);
        };

        request.onerror = (event: any) => {
            reject(event.target.error);
        };
    });
}

/**
 * Save video blob into local IndexedDB buffer.
 */
export async function saveRecordingBlob(interviewId: string, videoBlob: Blob): Promise<string> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(videoBlob, interviewId);

            request.onsuccess = () => {
                resolve(`idb://${interviewId}`);
            };

            request.onerror = (e: any) => {
                reject(e.target.error);
            };
        });
    } catch (err) {
        console.warn("Failed to save to local IndexedDB:", err);
        return "";
    }
}

/**
 * Retrieve Blob from local IndexedDB.
 */
export async function getRecordingBlob(interviewId: string): Promise<Blob | null> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(interviewId);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    } catch (err) {
        return null;
    }
}

/**
 * Upload MediaRecorder video blob to persistent cloud / server storage with progress tracking.
 * Retains local IndexedDB buffer if upload fails so the user can retry without losing their video.
 */
export async function uploadRecordingToCloud(
    interviewId: string,
    videoBlob: Blob,
    durationSeconds: number,
    onProgress?: (progressPercent: number) => void
): Promise<RecordingUploadResult> {
    // Save to local IndexedDB first as a non-destructive backup
    await saveRecordingBlob(interviewId, videoBlob);

    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", videoBlob, `interview_${interviewId}.webm`);
        formData.append("interviewId", interviewId);
        formData.append("durationSeconds", String(durationSeconds));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload-recording", true);

        if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        recordingUrl: data.recordingUrl,
                        recordingId: data.recordingId,
                        fileSize: data.fileSize || videoBlob.size,
                        storageType: "cloud",
                        storageProvider: data.storageProvider
                    });
                } catch (e) {
                    reject(new Error("Invalid server response format"));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error during video upload"));
        };

        xhr.send(formData);
    });
}

/**
 * Get video playback URL (<video src="...">).
 */
export async function getRecordingPlaybackUrl(interviewId: string, fallbackUrl?: string | null): Promise<string | null> {
    if (fallbackUrl && (fallbackUrl.startsWith("http://") || fallbackUrl.startsWith("https://"))) {
        return fallbackUrl;
    }

    const blob = await getRecordingBlob(interviewId);
    if (blob && blob.size > 0) {
        return URL.createObjectURL(blob);
    }

    if (fallbackUrl && (fallbackUrl.startsWith("blob:") || fallbackUrl.startsWith("data:"))) {
        return fallbackUrl;
    }

    return null;
}

/**
 * Delete recording from persistent cloud storage AND local IndexedDB buffer.
 */
export async function deleteCloudRecording(
    interviewId: string,
    recordingUrl?: string | null,
    recordingId?: string | null,
    storageProvider?: string | null
): Promise<boolean> {
    // Delete local IndexedDB blob
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(interviewId);
    } catch (e) {}

    // Send delete request to server
    try {
        const res = await fetch("/api/delete-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                interviewId,
                recordingUrl,
                recordingId,
                storageProvider
            })
        });
        const data = await res.json();
        return data.status === 200;
    } catch (err) {
        console.warn("Cloud recording deletion error:", err);
        return false;
    }
}
