"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface HoverEffectItem {
  title: string;
  description: string;
  link: string;
  image: string;
}

export const HoverEffect = ({
  items,
  className,
}: {
  items: HoverEffectItem[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, idx) => (
        <motion.div
          key={item.link}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <a
            href={item.link}
            className="group relative block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setFocusedIndex(idx)}
            onBlur={() => setFocusedIndex(null)}
            aria-label={`Read more about ${item.title}`}
          >
            {/* Enhanced hover background */}
            <AnimatePresence>
              {(hoveredIndex === idx || focusedIndex === idx) && (
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.2 },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>

            {/* Enhanced card with better hover effects */}
            <motion.div
              className="relative z-10 h-full"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardImage
                  src={item.image}
                  alt={item.title}
                  priority={idx < 3} // Load first 3 images with priority
                />
                <div className="flex flex-col gap-3 pt-4">
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>

                  {/* Added CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    Read more →
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </a>
        </motion.div>
      ))}
    </div>
  );
};

const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 group-hover:border-neutral-300 group-hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:group-hover:border-neutral-700",
        className,
      )}
    >
      {children}
    </div>
  );
};

const CardImage = ({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="aspect-[16/10] w-full animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <Image
          width={400}
          height={240}
          src={src}
          alt={alt}
          priority={priority}
          className={cn(
            "aspect-[16/10] w-full object-cover transition-opacity duration-300",
            isLoading && "opacity-0",
            className,
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </motion.div>
    </div>
  );
};

const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.h3
      className={cn(
        "text-lg leading-tight font-semibold text-neutral-900 group-hover:text-neutral-700 dark:text-neutral-100 dark:group-hover:text-neutral-300",
        className,
      )}
      initial={{ opacity: 0.9 }}
      whileHover={{ opacity: 1 }}
    >
      {children}
    </motion.h3>
  );
};

const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400",
        className,
      )}
    >
      {children}
    </p>
  );
};
