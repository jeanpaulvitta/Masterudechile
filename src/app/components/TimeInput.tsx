import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  distance?: number;
  style?: string;
}

export function TimeInput({ value, onChange, label = "Tiempo", distance, style }: TimeInputProps) {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [centiseconds, setCentiseconds] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Parse initial value
  useEffect(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      const mins = parts[0];
      const secsParts = parts[1]?.split('.');
      const secs = secsParts?.[0] || '';
      const centis = secsParts?.[1] || '';
      
      setMinutes(mins);
      setSeconds(secs);
      setCentiseconds(centis);
    }
  }, []);

  // Validate and update
  const updateTime = (mins: string, secs: string, centis: string) => {
    setMinutes(mins);
    setSeconds(secs);
    setCentiseconds(centis);

    // Validate
    const minsNum = parseInt(mins) || 0;
    const secsNum = parseInt(secs) || 0;
    const centisNum = parseInt(centis) || 0;

    if (secsNum >= 60) {
      setIsValid(false);
      return;
    }

    if (centisNum > 99) {
      setIsValid(false);
      return;
    }

    // Build time string
    if (mins || secs || centis) {
      const formattedMins = mins.padStart(2, '0');
      const formattedSecs = secs.padStart(2, '0');
      const formattedCentis = centis.padStart(2, '0');
      const timeString = `${formattedMins}:${formattedSecs}.${formattedCentis}`;
      
      setIsValid(true);
      onChange(timeString);
    } else {
      setIsValid(null);
      onChange('');
    }
  };

  // Handle input changes with validation
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    updateTime(val, seconds, centiseconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    updateTime(minutes, val, centiseconds);
  };

  const handleCentisecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    updateTime(minutes, seconds, val);
  };

  // Get reference times for guidance
  const getReferenceTime = () => {
    if (!distance || !style) return null;
    
    // Referencias completas por distancia y estilo
    const references: Record<number, Record<string, { world: string; good: string; avg: string }>> = {
      50: {
        "Libre": { world: "00:20.91", good: "00:28.00", avg: "00:35.00" },
        "Espalda": { world: "00:23.71", good: "00:32.00", avg: "00:40.00" },
        "Pecho": { world: "00:25.95", good: "00:35.00", avg: "00:45.00" },
        "Mariposa": { world: "00:22.27", good: "00:31.00", avg: "00:40.00" }
      },
      100: {
        "Libre": { world: "00:46.91", good: "01:00.00", avg: "01:20.00" },
        "Espalda": { world: "00:51.85", good: "01:10.00", avg: "01:30.00" },
        "Pecho": { world: "00:56.88", good: "01:18.00", avg: "01:40.00" },
        "Mariposa": { world: "00:49.45", good: "01:08.00", avg: "01:30.00" },
        "Combinado": { world: "00:51.94", good: "01:10.00", avg: "01:35.00" }
      },
      200: {
        "Libre": { world: "01:42.00", good: "02:15.00", avg: "02:50.00" },
        "Espalda": { world: "01:51.92", good: "02:30.00", avg: "03:10.00" },
        "Pecho": { world: "02:05.95", good: "02:50.00", avg: "03:30.00" },
        "Mariposa": { world: "01:50.73", good: "02:28.00", avg: "03:10.00" },
        "Combinado": { world: "01:54.00", good: "02:30.00", avg: "03:15.00" }
      },
      400: {
        "Libre": { world: "03:40.07", good: "05:00.00", avg: "06:30.00" },
        "Combinado": { world: "04:03.84", good: "05:30.00", avg: "07:00.00" }
      },
      800: {
        "Libre": { world: "07:32.12", good: "10:30.00", avg: "13:00.00" }
      },
      1500: {
        "Libre": { world: "14:31.02", good: "20:00.00", avg: "25:00.00" }
      }
    };

    return references[distance]?.[style] || null;
  };

  const refTime = getReferenceTime();

  // Get style color for reference box
  const getStyleColor = () => {
    switch (style) {
      case "Libre": return "from-blue-50 to-cyan-50 border-blue-200";
      case "Espalda": return "from-purple-50 to-indigo-50 border-purple-200";
      case "Pecho": return "from-green-50 to-emerald-50 border-green-200";
      case "Mariposa": return "from-orange-50 to-amber-50 border-orange-200";
      case "Combinado": return "from-pink-50 to-rose-50 border-pink-200";
      default: return "from-purple-50 to-indigo-50 border-purple-200";
    }
  };

  // Get style icon emoji
  const getStyleIcon = () => {
    switch (style) {
      case "Libre": return "🏊";
      case "Espalda": return "🏊‍♂️";
      case "Pecho": return "🐸";
      case "Mariposa": return "🦋";
      case "Combinado": return "🎯";
      default: return "🏊";
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-xs sm:text-sm font-medium">{label}</Label>
        {isValid === true && (
          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
        )}
        {isValid === false && (
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
        )}
      </div>

      {/* Input Fields */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="00"
            value={minutes}
            onChange={handleMinutesChange}
            className={`text-center text-base sm:text-lg font-mono h-10 sm:h-11 ${
              isValid === false && minutes ? 'border-red-500' : ''
            }`}
            maxLength={2}
          />
          <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-0.5">min</p>
        </div>
        
        <span className="text-xl sm:text-2xl font-bold text-gray-400 pb-4 sm:pb-5">:</span>
        
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="00"
            value={seconds}
            onChange={handleSecondsChange}
            className={`text-center text-base sm:text-lg font-mono h-10 sm:h-11 ${
              isValid === false && seconds ? 'border-red-500' : ''
            } ${parseInt(seconds) >= 60 ? 'border-red-500' : ''}`}
            maxLength={2}
          />
          <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-0.5">seg</p>
        </div>
        
        <span className="text-xl sm:text-2xl font-bold text-gray-400 pb-4 sm:pb-5">.</span>
        
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="00"
            value={centiseconds}
            onChange={handleCentisecondsChange}
            className={`text-center text-base sm:text-lg font-mono h-10 sm:h-11 ${
              isValid === false && centiseconds ? 'border-red-500' : ''
            }`}
            maxLength={2}
          />
          <p className="text-[9px] sm:text-[10px] text-gray-500 text-center mt-0.5">cs</p>
        </div>
      </div>

      {/* Validation Messages */}
      {isValid === false && (
        <div className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-red-600 bg-red-50 p-2 sm:p-2.5 rounded">
          <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 flex-shrink-0" />
          <div>
            {parseInt(seconds) >= 60 && <p>Los segundos deben ser menor a 60</p>}
            {parseInt(centiseconds) > 99 && <p>Las centésimas deben ser 00-99</p>}
          </div>
        </div>
      )}

      {/* Time Preview */}
      {isValid === true && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-blue-900">
              Tiempo: {minutes.padStart(2, '0')}:{seconds.padStart(2, '0')}.{centiseconds.padStart(2, '0')}
            </p>
          </div>
        </div>
      )}

      {/* Reference Times Guide */}
      {refTime && distance && style && (
        <div className={`bg-gradient-to-r ${getStyleColor()} rounded-lg p-2.5 sm:p-3 space-y-1.5 sm:space-y-2`}>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-base sm:text-lg">{getStyleIcon()}</span>
            <p className="text-[11px] sm:text-xs font-semibold text-gray-800 flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Referencia para</span>
              <span className="xs:hidden">Ref.</span>
              {distance}m {style}
            </p>
          </div>
          
          {/* Desktop: 3 columns */}
          <div className="hidden sm:grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-white rounded p-1.5 text-center">
              <p className="text-gray-500 mb-0.5">Récord Mundial</p>
              <p className="font-mono font-bold text-purple-900">{refTime.world}</p>
            </div>
            <div className="bg-white rounded p-1.5 text-center">
              <p className="text-gray-500 mb-0.5">Tiempo Bueno</p>
              <p className="font-mono font-bold text-blue-900">{refTime.good}</p>
            </div>
            <div className="bg-white rounded p-1.5 text-center">
              <p className="text-gray-500 mb-0.5">Promedio</p>
              <p className="font-mono font-bold text-gray-900">{refTime.avg}</p>
            </div>
          </div>

          {/* Mobile: Stacked */}
          <div className="sm:hidden space-y-1.5">
            <div className="bg-white rounded p-2 flex justify-between items-center">
              <p className="text-[10px] text-gray-600">🥇 Récord Mundial</p>
              <p className="font-mono font-bold text-xs text-purple-900">{refTime.world}</p>
            </div>
            <div className="bg-white rounded p-2 flex justify-between items-center">
              <p className="text-[10px] text-gray-600">💪 Tiempo Bueno</p>
              <p className="font-mono font-bold text-xs text-blue-900">{refTime.good}</p>
            </div>
            <div className="bg-white rounded p-2 flex justify-between items-center">
              <p className="text-[10px] text-gray-600">📈 Promedio</p>
              <p className="font-mono font-bold text-xs text-gray-900">{refTime.avg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-2.5 space-y-1">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-700">💡 Ejemplos de formato:</p>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-gray-600">
          <p>• 50m Libre: <span className="font-mono font-bold">00:28.50</span></p>
          <p>• 100m Libre: <span className="font-mono font-bold">01:02.30</span></p>
          <p>• 200m Libre: <span className="font-mono font-bold">02:18.75</span></p>
          <p>• 1500m Libre: <span className="font-mono font-bold">18:45.20</span></p>
        </div>
      </div>
    </div>
  );
}