'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const springConfig = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

const containerVariants: Variants = {
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  closed: {
    x: -50,
    scale: 0.95,
    opacity: 0,
  },
  open: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: springConfig,
  },
};

interface MobileMenuWrapperProps {
  children: ReactNode;
  isOpen: boolean;
}

export function MobileMenuWrapper({ children, isOpen }: MobileMenuWrapperProps) {
  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedNavItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AnimatedNavItem({ children, onClick, className }: AnimatedNavItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={springConfig}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}
