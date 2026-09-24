import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
    }),

    InterviewSessionTable: defineTable({
        interviewQuestions: v.any(),
        resumeUrl: v.union(v.string(), v.null()),
        userId: v.id('UserTable'),
        status: v.string(),
        jobTitle: v.union(v.string(), v.null()),
        jobDescription: v.union(v.string(), v.null()),
        experienceLevel: v.optional(v.union(v.string(), v.null())),
        techStack: v.optional(v.union(v.string(), v.null())),
        feedback: v.optional(v.any()),
        recordingUrl: v.optional(v.union(v.string(), v.null())),
        recordingId: v.optional(v.union(v.string(), v.null())),
        recordingStorageId: v.optional(v.union(v.string(), v.null())),
        fileSize: v.optional(v.union(v.number(), v.null())),
        durationSeconds: v.optional(v.union(v.number(), v.null())),
        storageProvider: v.optional(v.union(v.string(), v.null())),
        questionTimestamps: v.optional(v.any()),
        candidateAnswers: v.optional(v.any()),
        weakTopics: v.optional(v.any()),
        interviewerGender: v.optional(v.union(v.string(), v.null()))
    })
})