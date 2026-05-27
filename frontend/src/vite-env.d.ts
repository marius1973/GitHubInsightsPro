/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Fallbacks in case the upstream type packages aren't installed yet.
// Once `npm install` finishes, the proper d.ts files in node_modules take over.
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'html2canvas' {
  interface Options {
    scale?: number;
    backgroundColor?: string | null;
    useCORS?: boolean;
    logging?: boolean;
    windowWidth?: number;
    [key: string]: any;
  }
  const html2canvas: (element: HTMLElement, options?: Options) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  export interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape' | 'p' | 'l';
    unit?: 'mm' | 'cm' | 'in' | 'pt' | 'px';
    format?: string | number[];
    compress?: boolean;
  }
  export class jsPDF {
    constructor(options?: JsPDFOptions);
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
    addImage(
      imageData: string,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number
    ): jsPDF;
    addPage(): jsPDF;
    setPage(n: number): jsPDF;
    getNumberOfPages(): number;
    setFontSize(size: number): jsPDF;
    setTextColor(r: number, g?: number, b?: number): jsPDF;
    text(text: string, x: number, y: number): jsPDF;
    save(filename: string): jsPDF;
  }
}
