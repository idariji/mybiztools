/**
 * Safe printing utility functions
 * Provides secure methods for printing HTML content
 */

/**
 * Sanitize HTML content by removing potentially dangerous elements and attributes
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
function sanitizeHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script tags
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove event handlers from all elements
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove inline event handlers
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Remove potentially dangerous elements
  const dangerousElements = doc.querySelectorAll('iframe, object, embed, form, input, button');
  dangerousElements.forEach(el => el.remove());

  return doc.body.innerHTML;
}

/**
 * Safely open a print window with sanitized HTML content
 * @param title - The document title
 * @param elementId - The ID of the element to print
 * @param additionalStyles - Additional CSS styles to include
 * @returns true if print dialog opened successfully, false otherwise
 */
export function safePrint(
  title: string,
  elementId: string,
  additionalStyles: string = ''
): boolean {
  const previewElement = document.getElementById(elementId);
  if (!previewElement) {
    console.error(`Element with id "${elementId}" not found`);
    return false;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window - popup may be blocked');
    return false;
  }

  // Sanitize the HTML content
  const sanitizedContent = sanitizeHTML(previewElement.innerHTML);

  // Build the print document
  const printDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          @media print {
            body {
              padding: 0;
            }
          }
          ${additionalStyles}
        </style>
      </head>
      <body>
        ${sanitizedContent}
      </body>
    </html>
  `;

  printWindow.document.write(printDocument);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };

  // Fallback for browsers that don't fire onload properly
  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.print();
    }
  }, 500);

  return true;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text - The text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
