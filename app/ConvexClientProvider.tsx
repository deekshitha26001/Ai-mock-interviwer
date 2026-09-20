"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import Provider, { FallbackProvider } from "./Provider";

const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidConvexUrl =
    Boolean(rawConvexUrl) &&
    typeof rawConvexUrl === "string" &&
    rawConvexUrl.startsWith("https://") &&
    !rawConvexUrl.includes("dummy.convex.cloud") &&
    !rawConvexUrl.includes("placeholder");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    const convexClient = useMemo(() => {
        if (!isValidConvexUrl || !rawConvexUrl) return null;
        try {
            return new ConvexReactClient(rawConvexUrl);
        } catch (e) {
            console.warn("ConvexReactClient initialization warning:", e);
            return null;
        }
    }, []);

    if (!convexClient) {
        return <FallbackProvider>{children}</FallbackProvider>;
    }

    return (
        <ConvexProvider client={convexClient}>
            <Provider>{children}</Provider>
        </ConvexProvider>
    );
}