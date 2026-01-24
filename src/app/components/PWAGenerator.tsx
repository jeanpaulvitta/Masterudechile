import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Upload, Download, Copy, Check } from 'lucide-react';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

export function PWAGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [manifestCode, setManifestCode] = useState('');
  const [faviconCode, setFaviconCode] = useState('');
  const [iconCode, setIconCode] = useState('');
  const [activeTab, setActiveTab] = useState<'manifest' | 'favicon' | 'icon'>('manifest');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor selecciona una imagen válida (PNG, JPG, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAll = async () => {
    if (!uploadedImage) return;

    setGenerating(true);
    setProgress(0);
    setProgressText('Iniciando generación...');

    try {
      // Crear imagen
      const img = new Image();
      img.src = uploadedImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Generar íconos en base64
      setProgressText('Generando íconos en todos los tamaños...');
      const icons = [];

      for (let i = 0; i < SIZES.length; i++) {
        const size = SIZES[i];
        const progressPercent = ((i + 1) / SIZES.length) * 50;

        setProgress(progressPercent);
        setProgressText(`Generando ${size}x${size}... (${i + 1}/${SIZES.length})`);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          const base64 = canvas.toDataURL('image/png');

          icons.push({
            src: base64,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: size >= 192 ? 'any maskable' : 'any'
          });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generar manifest.json
      setProgress(60);
      setProgressText('Creando manifest.json...');

      const manifest = {
        name: "Natación Master UCH",
        short_name: "Master UCH",
        description: "Aplicación PWA para el equipo de Natación Master de la Universidad de Chile",
        start_url: "/",
        display: "standalone",
        background_color: "#003366",
        theme_color: "#003366",
        orientation: "portrait",
        icons: icons,
        categories: ["sports", "health", "lifestyle"],
        lang: "es",
        dir: "ltr"
      };

      setManifestCode(JSON.stringify(manifest, null, 2));

      // Generar SVG simple
      setProgress(80);
      setProgressText('Creando SVG optimizados...');

      const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
  <rect width="150" height="150" fill="#003366"/>
  <text x="75" y="75" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">MASTER</text>
  <text x="75" y="95" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-size="16">UCH</text>
</svg>`;

      setFaviconCode(svgCode);
      setIconCode(svgCode);

      // Completar
      setProgress(100);
      setProgressText('¡Completado! ✅');

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async (code: string, tabName: string) => {
    try {
      // Intentar usar el Clipboard API moderno
      await navigator.clipboard.writeText(code);
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      // Fallback: Método clásico con textarea temporal
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        setCopiedTab(tabName);
        setTimeout(() => setCopiedTab(null), 2000);
      } catch (fallbackErr) {
        console.error('Error al copiar:', fallbackErr);
        alert('❌ No se pudo copiar automáticamente. Por favor, selecciona el texto manualmente y presiona Ctrl+C (o Cmd+C en Mac)');
      }
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], {
      type: filename.endsWith('.json') ? 'application/json' : 'image/svg+xml'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🎨 Generador PWA Completo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Master UCH - Sube tu logo y genera todo automáticamente
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>💡 Sin archivos en Git:</strong><br />
              Sube la imagen del logo desde tu computadora. El generador creará:<br />
              ✅ Íconos en todos los tamaños<br />
              ✅ Manifest.json con íconos embebidos<br />
              ✅ Todo listo para copiar y pegar - ¡Sin push de imágenes!
            </p>
          </div>

          {/* Upload Area */}
          {!uploadedImage ? (
            <div
              className="border-3 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#003366] hover:bg-gray-50 transition-all cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-semibold mb-2">
                Arrastra aquí el logo de Master UCH
              </p>
              <p className="text-gray-500 text-sm mb-4">
                o haz clic para seleccionar
              </p>
              <Button variant="outline">Seleccionar Imagen</Button>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-gray-400 text-xs mt-4">
                Formatos: PNG, JPG, SVG (recomendado: 512x512px o mayor)
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-[#003366] mb-4">Vista Previa del Logo</h3>
              <img
                src={uploadedImage}
                alt="Vista previa"
                className="max-w-[200px] max-h-[200px] mx-auto rounded-lg shadow-md mb-4"
              />
              <p className="text-gray-600 text-sm">{imageName}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setUploadedImage(null);
                  setImageName('');
                  setManifestCode('');
                  setFaviconCode('');
                  setIconCode('');
                }}
              >
                Cambiar Imagen
              </Button>
            </div>
          )}

          {/* Generate Button */}
          {uploadedImage && !manifestCode && (
            <Button
              className="w-full bg-[#003366] hover:bg-[#0055aa]"
              onClick={generateAll}
              disabled={generating}
            >
              {generating ? '⏳ Generando...' : '🚀 Generar Manifest PWA Completo'}
            </Button>
          )}

          {/* Progress */}
          {generating && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#003366] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">{progressText}</p>
            </div>
          )}

          {/* Results */}
          {manifestCode && (
            <>
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ ¡Manifest generado exitosamente! Copia el código de abajo.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
                    activeTab === 'manifest'
                      ? 'bg-[#003366] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('manifest')}
                >
                  📄 manifest.json
                </button>
                <button
                  className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
                    activeTab === 'favicon'
                      ? 'bg-[#003366] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('favicon')}
                >
                  🔖 favicon.svg
                </button>
                <button
                  className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
                    activeTab === 'icon'
                      ? 'bg-[#003366] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('icon')}
                >
                  🎨 icon.svg
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                {activeTab === 'manifest' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#003366]">
                      📄 Código para /public/manifest.json
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[300px] text-xs font-mono">
                      {manifestCode}
                    </pre>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => copyCode(manifestCode, 'manifest')}
                      >
                        {copiedTab === 'manifest' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar manifest.json
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadFile('manifest.json', manifestCode)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'favicon' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#003366]">
                      🔖 Código para /public/icons/favicon.svg
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[300px] text-xs font-mono">
                      {faviconCode}
                    </pre>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => copyCode(faviconCode, 'favicon')}
                      >
                        {copiedTab === 'favicon' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar favicon.svg
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadFile('favicon.svg', faviconCode)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'icon' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#003366]">
                      🎨 Código para /public/icons/icon.svg
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[300px] text-xs font-mono">
                      {iconCode}
                    </pre>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => copyCode(iconCode, 'icon')}
                      >
                        {copiedTab === 'icon' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar icon.svg
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadFile('icon.svg', iconCode)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">📝 Instrucciones:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
                  <li>Copia el código de <strong>manifest.json</strong> y pégalo en <code className="bg-yellow-100 px-1 rounded">/public/manifest.json</code></li>
                  <li>Copia el código de <strong>favicon.svg</strong> y pégalo en <code className="bg-yellow-100 px-1 rounded">/public/icons/favicon.svg</code></li>
                  <li>Copia el código de <strong>icon.svg</strong> y pégalo en <code className="bg-yellow-100 px-1 rounded">/public/icons/icon.svg</code></li>
                  <li>Haz <code className="bg-yellow-100 px-1 rounded">git push</code> - ¡Solo 3 archivos pequeños, sin imágenes PNG!</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}