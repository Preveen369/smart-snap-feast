/**
 * useIsMobile - Responsive design hook for mobile device detection
 * 
 * Provides real-time mobile device detection based on viewport width with
 * automatic updates on window resize. Implements efficient media query
 * listening for responsive UI behavior in Smart Snap Feast application.
 * Ensures consistent mobile experience across recipe browsing and cooking interfaces.
 * 
 * @returns boolean indicating whether current viewport is mobile-sized
 */

import * as React from "react";

/**
 * Mobile breakpoint threshold in pixels
 * Defines the maximum width considered mobile for responsive design consistency
 * Aligns with common CSS framework breakpoints (Bootstrap, Tailwind CSS)
 */
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  /**
   * Mobile state management with SSR compatibility
   * 
   * Initializes as undefined to prevent hydration mismatches in SSR environments,
   * then resolves to actual mobile state after client-side mounting.
   */
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create media query listener for efficient viewport monitoring
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    /**
     * Viewport change handler for responsive state updates
     * 
     * Updates mobile state when viewport crosses the mobile breakpoint
     * threshold, enabling reactive UI adjustments for optimal user experience.
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Register media query change listener for automatic updates
    mql.addEventListener("change", onChange);
    
    // Set initial mobile state based on current viewport width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Cleanup listener on component unmount to prevent memory leaks
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return boolean value, converting undefined to false for consistent API
  return !!isMobile;
}
