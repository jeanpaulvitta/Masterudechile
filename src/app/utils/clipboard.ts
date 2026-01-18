// Utilidad robusta para copiar al portapapeles que funciona en todos los navegadores

export async function copyToClipboard(text: string): Promise<void> {
  // Método 1: Intentar con execCommand (más compatible)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Hacer invisible pero accesible
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Seleccionar el texto
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      // iOS requiere un enfoque diferente
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }
    
    // Copiar
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return Promise.resolve();
    }
    
    // Si execCommand falló, intentar con Clipboard API
    throw new Error('execCommand failed');
  } catch (err) {
    // Método 2: Intentar con Clipboard API moderna (si está disponible)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return Promise.resolve();
      } catch (clipboardErr) {
        console.error('Clipboard API error:', clipboardErr);
        throw new Error('No se pudo copiar al portapapeles. Por favor, copia manualmente.');
      }
    }
    
    throw new Error('No se pudo copiar al portapapeles. Por favor, copia manualmente.');
  }
}

// Función para verificar si el portapapeles está disponible
export function isClipboardAvailable(): boolean {
  return !!(
    document.queryCommandSupported?.('copy') || 
    (navigator.clipboard && navigator.clipboard.writeText)
  );
}
