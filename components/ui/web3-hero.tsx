"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StarBorder } from "@/components/ui/star-border";
import { MorphingText } from "@/components/ui/morphing-text";

function CryptoShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-gray-500/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-gray-700/[0.3]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

function Web3Hero({
    badge = "Web3 Analytics",
    title1 = "Real-Time Crypto",
    title2 = "Analytics Platform",
    description = "Track 20,000+ tokens, analyze whale movements, and discover opportunities in the decentralized ecosystem with professional-grade tools.",
    onLaunchApp,
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    description?: string;
    onLaunchApp?: () => void;
}) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/[0.05] via-transparent to-gray-600/[0.05] blur-3xl" />

            {/* Floating Crypto Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <CryptoShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-gray-600/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />

                <CryptoShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-gray-700/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />

                <CryptoShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-gray-500/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />

                <CryptoShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-gray-800/[0.15]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />

                <CryptoShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-gray-600/[0.15]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/[0.5] border border-gray-700/[0.5] mb-8 md:mb-12 backdrop-blur-sm"
                    >
                        {/* Online indicator with pulsing animation */}
                        <div className="relative flex items-center">
                            <motion.div
                                className="absolute w-3 h-3 bg-green-400 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                        </div>
                        <Activity className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-300 tracking-wide">
                            {badge} • Live
                        </span>
                    </motion.div>

                    {/* Main Title with Morphing Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 3, delay: 1.5 }}
                        className="mb-6 md:mb-8"
                    >
                        <MorphingText 
                            texts={[
                                "Real-Time Crypto Analytics",
                                "Track Project trends",
                                "Discover DeFi trends",
                                "Smart Money Moves",
                            ]}
                            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl"
                        />
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 2 }}
                    >
                        <br /><br /><br /><br /><br /><br />
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.0 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onLaunchApp}
                            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white rounded-xl border border-gray-600 transition-all duration-300 shadow-2xl hover:shadow-gray-500/25"
                        >
                            Launch App
                        </motion.button>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 5 }}
                    >
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
                            {description}
                    </p>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
        </div>
    );
}

export { Web3Hero }
