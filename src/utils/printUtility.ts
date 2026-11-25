/**
 * Dedicated A4 Print Utility for Official Documents & Forwarding Letters
 * Creates an isolated off-screen iframe to guarantee true multi-page A4 printing
 * without modal clipping, fixed parent constraints, or inner scrollbars.
 */

export function generatePrintDocumentHtml(
  contentHtml: string,
  title: string = ''
): string {
  // Collect parent style tags to preserve Tailwind styles, sanitizing any residual margin directives
  const rawParentStyles =
    typeof document !== 'undefined'
      ? Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map((el) => el.outerHTML)
          .join('\n')
      : '';
  const parentStyles = rawParentStyles.replace(
    /@page\s*\{[^}]*\}/gi,
    '@page { size: A4 portrait; margin: 14mm 12mm 14mm 12mm !important; }'
  );

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${parentStyles}
  <style>
    /* Physical A4 multi-page margin configuration: guarantees uniform margins and dynamic page numbering */
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm !important;
      @top-left { content: "" !important; }
      @top-center { content: "" !important; }
      @top-right { content: "" !important; }
      @bottom-left { content: "" !important; }
      @bottom-center { content: "" !important; }
      @bottom-right {
        content: "पृष्ठ / Page " counter(page) !important;
        font-family: ui-monospace, monospace;
        font-size: 8.5pt;
        color: #475569;
      }
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      overflow: visible !important;
      height: auto !important;
      min-height: auto !important;
    }

    /* Print Document Container with unconstrained flow for multi-page printing */
    #printable-forwarding-letter {
      position: static !important;
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 2px !important;
      box-sizing: border-box !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
      height: auto !important;
    }

    .overflow-x-auto,
    .overflow-y-auto {
      overflow: visible !important;
      max-height: none !important;
      height: auto !important;
      padding: 0 !important;
    }

    /* Multi-Page Table Break Handling — Scoped strictly to #printable-forwarding-letter */
    #printable-forwarding-letter table,
    table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      border: 1px solid #1e293b !important;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
      box-sizing: border-box !important;
      page-break-inside: auto !important;
      break-inside: auto !important;
      margin-top: 6px;
      margin-bottom: 6px;
      margin-left: 0 !important;
      margin-right: auto !important;
    }

    thead {
      display: table-header-group !important;
    }

    tfoot {
      display: table-footer-group !important;
    }

    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: auto !important;
      break-after: auto !important;
    }

    th, td {
      border: none !important;
      border-top: 1px solid #1e293b !important;
      border-left: 1px solid #1e293b !important;
      padding: 5px 8px !important;
      font-size: 9.5pt !important;
      text-align: left;
      vertical-align: top;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
      white-space: normal !important;
      box-sizing: border-box !important;
    }

    thead tr:first-child th {
      border-top: none !important;
      background-color: #f1f5f9 !important;
      font-weight: 700 !important;
      color: #0f172a !important;
    }

    th:first-child,
    td:first-child {
      border-left: none !important;
    }

    /* Prevent Institutional Header & Signature Block from Slicing */
    .avoid-break,
    .signature-block,
    .hindi-header {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .signature-block {
      margin-top: 24px;
      padding-top: 12px;
    }

    /* Suppress static on-screen preview footer in print in favor of dynamic @bottom-right counter */
    .print-page-footer {
      display: none !important;
    }

    /* Hide any buttons or interactive controls */
    .no-print {
      display: none !important;
    }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;
}

export function printElementById(
  elementId: string,
  title: string = ''
): Promise<boolean> {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Print utility: Element #${elementId} not found.`);
      resolve(false);
      return;
    }

    // Clone element and strip any .no-print nodes
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print').forEach((node) => node.remove());

    const docHtml = generatePrintDocumentHtml(clone.outerHTML, title);

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error('Print utility: Unable to access iframe document.');
      document.body.removeChild(iframe);
      // Fallback to standard window.print()
      const origTitle = document.title;
      try {
        document.title = '';
        window.print();
      } finally {
        document.title = origTitle;
      }
      resolve(true);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(docHtml);
    iframeDoc.close();
    try {
      iframeDoc.title = '';
    } catch {
      // ignore
    }

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve(true);
      } catch (err) {
        console.error('Print utility: Execution error', err);
        window.print();
        resolve(false);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }
    };

    // Wait for content and styles to fully load
    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint;
      // Safety timeout in case onload does not fire
      setTimeout(triggerPrint, 350);
    } else {
      triggerPrint();
    }
  });
}
