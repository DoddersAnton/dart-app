"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { DartAnimation } from "./dart-animation";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

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
            className="relative w-40 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden "
          >
            <DartAnimation />
          </motion.div>
          {/* Text Content */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-12 dark:text-white"
          >
            Dart App
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-600 mt-4 max-w-xl"
          >
            Welcome to the Dart App! This is a simple app that helps you manage your dart fines and, maybe one day, track your scores.
          </motion.p>

          {/* CTA Button */}
          <Link
                href="/fines"
                className="flex justify-center"
              >
                <Button size="lg" className="mt-4" variant="outline">
                  See Fines <Target className="ml-2" size={16} />
                </Button>
              </Link>
        </section>
      </main>
    </div>
  );
}
