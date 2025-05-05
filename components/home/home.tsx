"use client";

import { Button } from "../ui/button";
import { DartAnimation } from "./dart-animation";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="relative h-[50vh] rounded-tl-[50%_20%] rounded-tr-[50%_20%]">
        <section className="relative flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 lg:py-32 ">
          {/* Circular Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden "
          >
            <DartAnimation />
          </motion.div>
          {/* Text Content */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-6 dark:text-white"
          >
            Dart App
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-600 mt-4 max-w-xl"
          >
            Welcome to the Dart App! This is a simple and elegant app that helps you manage your darts and track your scores.
          </motion.p>

          {/* CTA Button */}
          <Button className="mt-6 px-6 py-3 text-lg font-semibold">
            See Fines
          </Button>
        </section>
      </main>
    </div>
  );
}
