import { motion } from 'framer-motion';

export function LoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F1A]"
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Animated Logo Container */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative w-32 h-32 md:w-40 md:h-40"
                >
                    <img
                        src="/logo.png"
                        alt="Vortex Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    />

                    {/* Pulsing Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-accent rounded-full"
                    />
                </motion.div>

                <div className="flex flex-col items-center gap-3">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2"
                    >
                        VORTEX
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">
                            Establishing Secure Link
                        </p>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1.5 h-1.5 rounded-full bg-accent"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-10 flex flex-col items-center gap-1"
            >
                <span className="text-white/20 text-[10px] uppercase tracking-widest font-semibold">
                    P2P Serverless Mesh
                </span>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span className="text-white/40 text-[9px] font-mono">ENCRYPTED_SESSION_ACTIVE</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
