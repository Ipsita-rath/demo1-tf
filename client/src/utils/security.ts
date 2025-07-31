// Client-side security system for preventing unauthorized access to developer tools
export class SecurityManager {
  private static instance: SecurityManager;
  private isInitialized = false;
  private originalConsoleLog: typeof console.log;
  private originalConsoleWarn: typeof console.warn;
  private originalConsoleError: typeof console.error;
  private devToolsWarningShown = false;

  private constructor() {
    this.originalConsoleLog = console.log;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    // COMMENTED OUT: Developer tools blocking for debugging purposes
    // this.preventKeyboardShortcuts();
    // this.preventRightClick();
    // this.preventTextSelection();
    // this.detectDevTools();
    // this.setupConsoleInterception();
    // this.addSecurityCSS();
    
    this.isInitialized = true;
    console.log('Security system initialized successfully');
  }

  private preventKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      try {
        const key = e.key;
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;

        // Check individual keys
        if (key === 'F12') {
          e.preventDefault();
          this.showSecurityWarning('Developer tools access blocked');
          return false;
        }

        // Check combinations for developer tools
        if (ctrl && shift && (key === 'I' || key === 'J' || key === 'C' || key === 'K')) {
          e.preventDefault();
          this.showSecurityWarning('Developer tools access blocked');
          return false;
        }

        // Block view source
        if (ctrl && key === 'U') {
          e.preventDefault();
          this.showSecurityWarning('View source blocked');
          return false;
        }
      } catch (error) {
        // Silently handle errors to prevent app crashes
        console.warn('Security system: Keyboard handler error', error);
      }
    });
  }

  private preventRightClick(): void {
    document.addEventListener('contextmenu', (e) => {
      try {
        // Allow right-click on elements with data-allow-drag attribute (for drag and drop)
        const target = e.target;
        if (target && target instanceof HTMLElement) {
          if (target.hasAttribute('data-allow-drag') || target.closest('[data-allow-drag]')) {
            return; // Allow context menu for drag and drop elements
          }
        }
        
        e.preventDefault();
        this.showSecurityWarning('Right-click disabled');
        return false;
      } catch (error) {
        // Silently handle errors to prevent app crashes
        console.warn('Security system: Right-click handler error', error);
      }
    });
  }

  private preventTextSelection(): void {
    document.addEventListener('selectstart', (e) => {
      try {
        // Allow text selection in input fields and text areas
        const target = e.target;
        if (target && target instanceof HTMLElement) {
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
          }
          
          // Allow text selection in elements with data-allow-select attribute
          if (target.hasAttribute('data-allow-select') || target.closest('[data-allow-select]')) {
            return;
          }
        }
        
        e.preventDefault();
        return false;
      } catch (error) {
        // Silently handle errors to prevent app crashes
        console.warn('Security system: Text selection handler error', error);
      }
    });

    // Add CSS to prevent text selection
    const style = document.createElement('style');
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea, [contenteditable="true"], [data-allow-select] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      [data-allow-drag] {
        cursor: grab;
      }
      
      [data-allow-drag]:active {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(style);
  }

  private detectDevTools(): void {
    let devtools = false;
    
    // Method 1: Window size detection (safer approach)
    setInterval(() => {
      try {
        const threshold = 200;
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        if (heightDiff > threshold || widthDiff > threshold) {
          if (!devtools) {
            devtools = true;
            this.showDevToolsWarning();
          }
        } else {
          devtools = false;
        }
      } catch (error) {
        // Silently handle errors
        console.warn('Security system: DevTools detection error', error);
      }
    }, 3000);
  }

  private setupConsoleInterception(): void {
    // Intercept console methods to prevent unauthorized access
    console.log = (...args: any[]) => {
      if (this.isAllowedConsoleCall(args)) {
        this.originalConsoleLog(...args);
      }
    };

    console.warn = (...args: any[]) => {
      if (this.isAllowedConsoleCall(args)) {
        this.originalConsoleWarn(...args);
      }
    };

    console.error = (...args: any[]) => {
      if (this.isAllowedConsoleCall(args)) {
        this.originalConsoleError(...args);
      }
    };
  }

  private isAllowedConsoleCall(args: any[]): boolean {
    // Allow specific console calls from our application
    const allowedPrefixes = [
      'Security system',
      'Shared storage',
      'Terraform',
      'Azure',
      'WebSocket',
      '[vite]',
      '[HMR]',
      'DevTools',
    ];

    const message = args.join(' ');
    return allowedPrefixes.some(prefix => message.includes(prefix));
  }

  private addSecurityCSS(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Security styles */
      body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Allow interaction with form elements */
      input, textarea, select, button, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Drag and drop elements */
      [data-allow-drag] {
        cursor: grab !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      [data-allow-drag]:active {
        cursor: grabbing !important;
      }
      
      /* Hide potential security indicators */
      .security-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .security-overlay.active {
        display: flex;
      }
      
      .security-warning {
        text-align: center;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
      }
    `;
    document.head.appendChild(style);
  }

  private showSecurityWarning(message: string): void {
    // Security protection active - no notifications shown to user
    // console.warn(`Security: ${message}`);
  }

  private showDevToolsWarning(): void {
    if (this.devToolsWarningShown) return;
    
    this.devToolsWarningShown = true;
    // Security protection active - no notifications shown to user
    // console.warn('Developer tools detected - unauthorized access attempt logged');
  }

  public destroy(): void {
    if (this.isInitialized) {
      console.log = this.originalConsoleLog;
      console.warn = this.originalConsoleWarn;
      console.error = this.originalConsoleError;
      this.isInitialized = false;
    }
  }
}

// Initialize security system when the module is loaded
const securityManager = SecurityManager.getInstance();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    securityManager.initialize();
  });
} else {
  securityManager.initialize();
}

export default securityManager;