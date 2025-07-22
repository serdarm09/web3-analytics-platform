// Framer Motion Animation Variants

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Transition presets
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

export const quickTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition 
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: quickTransition 
  },
};

// Card hover animation
export const cardHover = {
  rest: {
    scale: 1,
    transition: smoothTransition,
  },
  hover: {
    scale: 1.02,
    transition: springTransition,
  },
  tap: {
    scale: 0.98,
    transition: quickTransition,
  },
};

// Floating animation
export const floating = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};