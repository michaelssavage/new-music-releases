import { useEffect, useState } from "react";

export const useInView = (rootMargin: string) => {
  const [element, setElement] = useState<Element | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, rootMargin]);

  return { ref: setElement, isInView };
};
