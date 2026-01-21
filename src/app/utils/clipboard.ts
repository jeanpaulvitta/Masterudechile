// Utilidad robusta para copiar al portapapeles que funciona en todos los navegadores

export async function copyToClipboard(text: string): Promise<void> {
  // Método 1: Fallback con textarea y execCommand (más compatible, especialmente en iframes)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Hacer invisible pero accesible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
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
      textArea.focus();
      textArea.select();
    }
    
    // Copiar
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('✅ Texto copiado con execCommand');
      return Promise.resolve();
    }
    
    // Si execCommand no funcionó, intentar con Clipboard API
    throw new Error('execCommand no pudo copiar');
  } catch (err) {
    console.warn('⚠️ execCommand falló, intentando Clipboard API:', err);
    
    // Método 2: Clipboard API moderna (si está disponible y permitida)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        console.log('✅ Texto copiado con Clipboard API');
        return Promise.resolve();
      } catch (clipboardErr) {
        console.error('❌ Clipboard API error:', clipboardErr);
        // No lanzar error aquí, intentar otro método
      }
    }
    
    // Método 3: Último intento - crear un evento de copia manual
    try {
      const listener = (e: ClipboardEvent) => {
        e.clipboardData?.setData('text/plain', text);
        e.preventDefault();
      };
      
      document.addEventListener('copy', listener);
      const successful = document.execCommand('copy');
      document.removeEventListener('copy', listener);
      
      if (successful) {
        console.log('✅ Texto copiado con evento de copia');
        return Promise.resolve();
      }
    } catch (eventErr) {
      console.error('❌ Evento de copia error:', eventErr);
    }
    
    // Si todo falló, mostrar un mensaje útil
    throw new Error('No se pudo copiar automáticamente. Por favor, selecciona y copia el texto manualmente.');
  }
}

// Función para verificar si el portapapeles está disponible
export function isClipboardAvailable(): boolean {
  return !!(
    document.queryCommandSupported?.('copy') || 
    (navigator.clipboard && navigator.clipboard.writeText)
  );
}
