import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.remove('dark'); // Ensure we use the premium light theme
  }, []);
  return null;
}
