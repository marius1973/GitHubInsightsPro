import { useRef } from 'react';
import { usePdfExport } from '../hooks/usePdfExport';

interface Props {
  /** Function returning the DOM node to export. Allows lazy resolution. */
  getTarget: () => HTMLElement | null;
  filename?: string;
  title?: string;
  label?: string;
}

export function ExportButton({ getTarget, filename, title, label = 'Export PDF' }: Props) {
  const { exportToPdf, exporting } = usePdfExport();
  const clicked = useRef(false);

  const handleClick = async () => {
    if (clicked.current || exporting) return;
    clicked.current = true;
    try {
      await exportToPdf(getTarget(), { filename, title });
    } catch (err) {
      console.error('[ExportButton] failed to export', err);
      alert('Sorry, could not export the PDF. Check console for details.');
    } finally {
      clicked.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200
                 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-700
                 transition disabled:opacity-60 disabled:cursor-wait"
    >
      {exporting ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" />
          </svg>
          Exporting…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
