"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function WelcomeScreen({ path }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8,
          }}
          className="flex flex-col items-center justify-center space-y-5"
        >
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-3xl"
            >
              🍽️
            </motion.div>

            {path === "/owner/restaurant-details" && (
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
              >
                Welcome to{" "}
                <span className="text-black dark:text-gray-100">
                  Scan & Dine
                </span>
              </motion.h1>
            )}

            {path === "/owner/menu" && (
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
              >
                Great job!{" "}
                <span className="text-black dark:text-gray-100">
                  You are officially set up!
                </span>
              </motion.h1>
            )}
          </div>

          {path === "/owner/banking-details" && (
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
            >
              Wow!
              <span className="text-black dark:text-gray-100">
                You have a digital menu now!
              </span>
            </motion.h1>
          )}

          {path === "/owner/restaurant-details" && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 text-center max-w-sm"
            >
              <span className="font-semibold underline">
                {" "}
                Let’s set up your restaurant details{" "}
              </span>{" "}
              and start serving your customers smarter.
            </motion.p>
          )}

          {path === "/owner/menu" && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 text-center max-w-sm"
            >
              <span className="font-semibold underline">
                {" "}
                Let’s add your menu items{" "}
              </span>{" "}
              and start adding delicious dishes for your customers digitally.
            </motion.p>
          )}

          {path === "/owner/banking-details" && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 text-center max-w-sm"
            >
              <span className="font-semibold underline">
                {" "}
                Let’s set up your banking details{" "}
              </span>{" "}
              and start receiving payments directly to your account.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
