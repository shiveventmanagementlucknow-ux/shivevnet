/**
 * Performance Monitoring Utilities
 * Tracks and optimizes website performance
 */

// Report Web Vitals for performance monitoring
export const reportWebVitals = (metric) => {
    if (import.meta.env.MODE === 'development') {
        console.log(`${metric.name}: ${metric.value}ms`);
    }
};

// Intersection Observer for lazy loading
export const observeElement = (element, callback, options = {}) => {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);

    if (element) {
        observer.observe(element);
    }

    return observer;
};

// Debounce function for performance optimization
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for performance optimization
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Prefetch link for faster navigation
export const prefetchLink = (href) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
};

// Measure performance timing
export const measurePerformance = (name, fn) => {
    if (import.meta.env.MODE !== 'development') return fn();

    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`⏱️  ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
};

// Monitor long tasks
export const monitorLongTasks = (threshold = 50) => {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > threshold) {
                        console.warn(`⚠️  Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // PerformanceObserver might not support longtask in all browsers
        }
    }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Disable animations if user prefers reduced motion
export const getAnimationSettings = () => {
    const prefersReduced = prefersReducedMotion();
    return {
        duration: prefersReduced ? 0 : 300,
        enabled: !prefersReduced,
    };
};

// Report performance metrics
export const reportMetrics = () => {
    if ('web-vital' in window) {
        // Use web-vitals library if available
        return;
    }

    // Fallback: Use Performance API
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    if (import.meta.env.MODE === 'development') {
        console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
        console.log(`📊 Connect Time: ${connectTime}ms`);
        console.log(`📊 Render Time: ${renderTime}ms`);
    }

    // Send to analytics (optional)
    // ga('send', 'timing', 'Page', 'Load', pageLoadTime);
};

export default {
    reportWebVitals,
    observeElement,
    debounce,
    throttle,
    prefetchLink,
    preloadResource,
    measurePerformance,
    monitorLongTasks,
    prefersReducedMotion,
    getAnimationSettings,
    reportMetrics,
};
