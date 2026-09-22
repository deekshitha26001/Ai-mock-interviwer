import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

type Props = {
    feedbackInfo: FeedbackInfo
}

export type FeedbackInfo = {
    feedback: string,
    rating: number,
    suggestions: string[]
}

function FeedbackDialog({ feedbackInfo }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full">Feedback</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className='font-bold text-2xl text-slate-900 dark:text-white'>Interview Feedback</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-4 text-slate-700 dark:text-slate-300 mt-3 text-sm">
                            <div>
                                <h3 className='font-bold text-base text-slate-900 dark:text-white'>Feedback:</h3>
                                <p className='text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed'>{feedbackInfo?.feedback}</p>
                            </div>
                            <div>
                                <h3 className='font-bold text-base text-slate-900 dark:text-white mt-3'>Suggestions:</h3>
                                <div className="space-y-2 mt-2">
                                    {feedbackInfo?.suggestions?.map((item, index) => (
                                        <div key={index} className='p-3 bg-slate-50 dark:bg-slate-900 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2'>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span className='font-bold text-base text-slate-900 dark:text-white'>Rating:</span>
                                <span className='font-extrabold text-xl text-indigo-600 dark:text-indigo-400'>{feedbackInfo?.rating} / 10</span>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default FeedbackDialog