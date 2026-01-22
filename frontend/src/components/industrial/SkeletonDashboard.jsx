import React from 'react';
import Card from '../ui/Card';

const SkeletonDashboard = () => {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-12 w-32 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
                    <div className="h-12 w-48 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
                </div>
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="p-8 h-48 bg-slate-200/50 dark:bg-white/5 border-transparent"></Card>
                ))}
            </div>

            {/* Banner Skeleton */}
            <div className="h-32 w-full bg-slate-200/50 dark:bg-white/5 rounded-3xl"></div>

            {/* Grid Skeleton */}
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="p-6 h-56 bg-white/50 dark:bg-white/5 border-transparent"></Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkeletonDashboard;
