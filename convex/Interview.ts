import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const SaveInterviewQuestion = mutation({
    args: {
        questions: v.any(),
        uid: v.id('UserTable'),
        resumeUrl: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
        jobDescription: v.optional(v.string()),
        experienceLevel: v.optional(v.string()),
        techStack: v.optional(v.string()),
        interviewerGender: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.insert('InterviewSessionTable', {
            interviewQuestions: args.questions,
            resumeUrl: args.resumeUrl ?? null,
            userId: args.uid,
            status: 'draft',
            jobTitle: args.jobTitle ?? null,
            jobDescription: args.jobDescription ?? null,
            experienceLevel: args.experienceLevel ?? null,
            techStack: args.techStack ?? null,
            interviewerGender: args.interviewerGender ?? 'female',
        });
        return result;
    }
});

export const GetInterviewQuestions = query({
    args: {
        interviewRecordId: v.id('InterviewSessionTable'),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable')
            .filter(q => q.eq(q.field('_id'), args.interviewRecordId))
            .collect();

        const record = result[0];
        if (!record) return null;

        // If user ID is passed, enforce server-side authorization check
        if (args.uid && record.userId !== args.uid) {
            console.warn(`Unauthorized access attempt to record ${args.interviewRecordId} by user ${args.uid}`);
            return null;
        }

        return record;
    }
});

export const UpdateFeedback = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        feedback: v.any(),
        durationSeconds: v.optional(v.number()),
        questionTimestamps: v.optional(v.any()),
        candidateAnswers: v.optional(v.any()),
        weakTopics: v.optional(v.any()),
        recordingUrl: v.optional(v.string()),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.recordId);
        if (!existing) {
            throw new Error("Interview session record not found");
        }

        if (args.uid && existing.userId !== args.uid) {
            throw new Error("Unauthorized: Session belongs to another user");
        }

        const patchData: any = {
            feedback: args.feedback,
            status: 'complete'
        };

        if (args.durationSeconds !== undefined) patchData.durationSeconds = args.durationSeconds;
        if (args.questionTimestamps !== undefined) patchData.questionTimestamps = args.questionTimestamps;
        if (args.candidateAnswers !== undefined) patchData.candidateAnswers = args.candidateAnswers;
        if (args.weakTopics !== undefined) patchData.weakTopics = args.weakTopics;
        if (args.recordingUrl !== undefined) patchData.recordingUrl = args.recordingUrl;

        const result = await ctx.db.patch(args.recordId, patchData);
        return result;
    }
});

export const SaveInterviewRecording = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        recordingUrl: v.string(),
        recordingId: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        durationSeconds: v.optional(v.number()),
        storageProvider: v.optional(v.string()),
        questionTimestamps: v.optional(v.any()),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.recordId);
        if (!existing) {
            throw new Error("Interview session record not found");
        }

        if (args.uid && existing.userId !== args.uid) {
            throw new Error("Unauthorized to modify this recording reference");
        }

        const patchData: any = {
            recordingUrl: args.recordingUrl
        };
        if (args.recordingId !== undefined) patchData.recordingId = args.recordingId;
        if (args.fileSize !== undefined) patchData.fileSize = args.fileSize;
        if (args.durationSeconds !== undefined) patchData.durationSeconds = args.durationSeconds;
        if (args.storageProvider !== undefined) patchData.storageProvider = args.storageProvider;
        if (args.questionTimestamps !== undefined) patchData.questionTimestamps = args.questionTimestamps;

        const result = await ctx.db.patch(args.recordId, patchData);
        return result;
    }
});

export const DeleteInterviewRecording = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.recordId);
        if (!existing) {
            return false;
        }

        if (args.uid && existing.userId !== args.uid) {
            throw new Error("Unauthorized to delete recording reference");
        }

        await ctx.db.patch(args.recordId, {
            recordingUrl: null,
            recordingId: null,
            fileSize: null,
            storageProvider: null
        });

        return true;
    }
});

export const GetInterviewList = query({
    args: {
        uid: v.id('UserTable')
    },
    handler: async (ctx, args) => {
        if (!args.uid) return [];
        const result = await ctx.db.query('InterviewSessionTable')
            .filter(q => q.eq(q.field('userId'), args.uid))
            .order('desc')
            .collect();

        return result;
    }
});

export const DeleteInterview = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.recordId);
        if (!existing) {
            return false;
        }

        if (args.uid && existing.userId !== args.uid) {
            throw new Error("Unauthorized to delete this interview session");
        }

        await ctx.db.delete(args.recordId);
        return true;
    }
});

export const UpdateInterviewerGender = mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        interviewerGender: v.string(),
        uid: v.optional(v.id('UserTable'))
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.recordId);
        if (!existing) {
            throw new Error("Interview session not found");
        }
        if (args.uid && existing.userId !== args.uid) {
            throw new Error("Unauthorized to update interviewer choice");
        }
        await ctx.db.patch(args.recordId, {
            interviewerGender: args.interviewerGender
        });
        return true;
    }
});

export const GenerateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    }
});