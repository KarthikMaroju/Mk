@tailwind base;
@tailwind components;
@tailwind utilities;

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Global styles */
body {
  @apply bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white;
}
