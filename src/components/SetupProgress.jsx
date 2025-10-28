"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { label: "Restaurant Details", path: "/owner/restaurant-details" },
  { label: "Categories & Menu", path: "/owner/menu" },
  { label: "Generate QR", path: "/owner/dashboard" },
];

export default function SetupProgress() {
  const pathname = usePathname();
  const router = useRouter();

  const currentStep = steps.findIndex((step) => pathname.startsWith(step.path));
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full transform -translate-x-1/2 max-w-3xl mx-auto mt-8 px-4">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-black dark:bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>

      {/* Step Circles + Labels */}
      <div className="flex justify-between mt-5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step.label}
              onClick={() => router.push(step.path)}
              className="flex flex-col items-center cursor-pointer select-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isActive ? "active" + index : "inactive" + index}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 transition-all duration-300 
                    ${
                      isCompleted || isActive
                        ? "bg-black dark:bg-white text-gray-100 dark:text-black border-black dark:border-white"
                        : "border-gray-400 text-gray-500"
                    }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </motion.div>
              </AnimatePresence>

              <span
                className={`text-xs text-center w-24 ${
                  isActive ? "text-black dark:text-gray-100 font-semibold" : ""
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
