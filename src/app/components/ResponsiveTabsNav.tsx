import { TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dumbbell, Calendar, Users, Medal, Clipboard, Crown, 
  Award, ClipboardList, Shield
} from 'lucide-react';

interface ResponsiveTabsNavProps {
  userRole?: 'admin' | 'coach' | 'swimmer';
}

export function ResponsiveTabsNav({ userRole }: ResponsiveTabsNavProps) {
  return (
    <div className="bg-white rounded-[10px] sm:rounded-xl shadow-md sm:shadow-lg px-[4px] sm:px-4 md:px-6 py-4 md:py-5 mb-16 sm:mb-16 lg:mb-20 mt-2 sm:mt-4 border-b-2 border-blue-200 flex items-center justify-center">
      <TabsList className={`
        grid w-full
        ${userRole === "admin" 
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9" 
          : "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8"
        }
        gap-0.5 sm:gap-1 md:gap-1.5 bg-transparent
      `}>
        {/* Pestaña: Entrenamientos */}
        <TabsTrigger 
          value="entrenamientos" 
          className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 sm:py-2 md:py-2 sm:px-1 md:px-1.5 min-w-0 transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:bg-blue-50 text-gray-700"
        >
          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Entrenos</span>
        </TabsTrigger>

        {/* Pestaña: Calendario */}
        <TabsTrigger 
          value="calendario" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-blue-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-blue-50
            text-gray-700
          "
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Calendario</span>
        </TabsTrigger>

        {/* Pestaña: Nadadores */}
        <TabsTrigger 
          value="nadadores" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-blue-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-blue-50
            text-gray-700
          "
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Nadadores</span>
        </TabsTrigger>

        {/* Pestaña: Competencias */}
        <TabsTrigger 
          value="competencias" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-blue-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-blue-50
            text-gray-700
          "
        >
          <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Compet.</span>
        </TabsTrigger>

        {/* Pestaña: Test Control */}
        <TabsTrigger 
          value="test-control" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-blue-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-blue-50
            text-gray-700
          "
        >
          <Clipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Tests</span>
        </TabsTrigger>

        {/* Pestaña: Récords */}
        <TabsTrigger 
          value="records" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-yellow-500 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-yellow-50
            text-gray-700
          "
        >
          <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Récords</span>
        </TabsTrigger>

        {/* Pestaña: Logros */}
        <TabsTrigger 
          value="logros" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-green-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-green-50
            text-gray-700
          "
        >
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Logros</span>
        </TabsTrigger>

        {/* Pestaña: Asistencia */}
        <TabsTrigger 
          value="asistencia" 
          className="
            flex flex-col items-center justify-center
            gap-0.5 sm:gap-1
            py-1.5 sm:py-2 md:py-2
            px-0.5 sm:px-1 md:px-1.5
            min-w-0
            rounded-md
            transition-all duration-200
            data-[state=active]:bg-purple-600 
            data-[state=active]:text-white 
            data-[state=active]:shadow-md
            data-[state=active]:scale-[1.02]
            hover:bg-purple-50
            text-gray-700
          "
        >
          <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Asistencia</span>
        </TabsTrigger>

        {/* Pestañas Administrativas - Solo para Administradores */}
        {userRole === "admin" && (
          <>
            {/* Pestaña: Usuarios */}
            <TabsTrigger 
              value="usuarios" 
              className="
                flex flex-col items-center justify-center
                gap-0.5 sm:gap-1
                py-1.5 sm:py-2 md:py-2
                px-0.5 sm:px-1 md:px-1.5
                min-w-0
                rounded-md
                transition-all duration-200
                data-[state=active]:bg-red-600 
                data-[state=active]:text-white 
                data-[state=active]:shadow-md
                data-[state=active]:scale-[1.02]
                hover:bg-red-50
                text-gray-700
              "
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
              <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Usuarios</span>
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </div>
  );
}