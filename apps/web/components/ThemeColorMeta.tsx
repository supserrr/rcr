"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Sets theme-color meta tag based on current theme from next-themes
 * for seamless iOS Safari overscroll area blending
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    // Remove any existing theme-color meta tags
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    existingTags.forEach(tag => tag.remove());

    // Create theme-color meta tag based on current resolved theme
    const themeColorTag = document.createElement('meta');
    themeColorTag.name = 'theme-color';
    themeColorTag.content = resolvedTheme === 'dark' ? '#0f0f0f' : '#fafaf9';
    
    // Add to head
    document.head.appendChild(themeColorTag);

    // Cleanup
    return () => {
      themeColorTag.remove();
    };
  }, [resolvedTheme]);

  return null;
}

