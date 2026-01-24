import { TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dumbbell, Calendar, Users, Medal, Clipboard, Crown, 
  Award, ClipboardList, Shield, Settings 
} from 'lucide-react';

interface ResponsiveTabsNavProps {
  userRole?: 'admin' | 'coach' | 'swimmer';
}

export function ResponsiveTabsNav({ userRole }: ResponsiveTabsNavProps) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-1.5 sm:p-2 mb-4 sm:mb-6 lg:mb-8">
      {/* Scroll horizontal en móvil, grid en tablet/desktop */}
      <div className="overflow-x-auto scrollbar-hide">
        <TabsList className={`
          flex sm:grid w-full sm:w-full
          ${userRole === "admin" 
            ? "sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10" 
            : "sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8"
          }
          gap-1.5 sm:gap-2 bg-transparent
          min-w-max sm:min-w-0
        `}>
          {/* Pestaña: Entrenamientos */}
          <TabsTrigger 
            value="entrenamientos" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-blue-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-blue-50
              text-gray-700
            "
          >
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Entrenos</span>
          </TabsTrigger>

          {/* Pestaña: Calendario */}
          <TabsTrigger 
            value="calendario" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-blue-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-blue-50
              text-gray-700
            "
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Calendario</span>
          </TabsTrigger>

          {/* Pestaña: Nadadores */}
          <TabsTrigger 
            value="nadadores" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-blue-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-blue-50
              text-gray-700
            "
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Nadadores</span>
          </TabsTrigger>

          {/* Pestaña: Competencias */}
          <TabsTrigger 
            value="competencias" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-blue-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-blue-50
              text-gray-700
            "
          >
            <Medal className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Compet.</span>
          </TabsTrigger>

          {/* Pestaña: Test Control */}
          <TabsTrigger 
            value="test-control" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-blue-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-blue-50
              text-gray-700
            "
          >
            <Clipboard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Tests</span>
          </TabsTrigger>

          {/* Pestaña: Récords */}
          <TabsTrigger 
            value="records" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-yellow-500 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-yellow-50
              text-gray-700
            "
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Récords</span>
          </TabsTrigger>

          {/* Pestaña: Logros */}
          <TabsTrigger 
            value="logros" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-green-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-green-50
              text-gray-700
            "
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Logros</span>
          </TabsTrigger>

          {/* Pestaña: Asistencia */}
          <TabsTrigger 
            value="asistencia" 
            className="
              flex flex-col items-center justify-center
              gap-1 sm:gap-1.5
              py-2 sm:py-2.5 md:py-3
              px-3 sm:px-2 md:px-3
              min-w-[70px] sm:min-w-0
              rounded-md sm:rounded-lg
              transition-all duration-200
              data-[state=active]:bg-purple-600 
              data-[state=active]:text-white 
              data-[state=active]:shadow-md
              data-[state=active]:scale-[1.02]
              hover:bg-purple-50
              text-gray-700
            "
          >
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Asistencia</span>
          </TabsTrigger>

          {/* Pestañas Administrativas - Solo para Administradores */}
          {userRole === "admin" && (
            <>
              {/* Pestaña: Usuarios */}
              <TabsTrigger 
                value="usuarios" 
                className="
                  flex flex-col items-center justify-center
                  gap-1 sm:gap-1.5
                  py-2 sm:py-2.5 md:py-3
                  px-3 sm:px-2 md:px-3
                  min-w-[70px] sm:min-w-0
                  rounded-md sm:rounded-lg
                  transition-all duration-200
                  data-[state=active]:bg-red-600 
                  data-[state=active]:text-white 
                  data-[state=active]:shadow-md
                  data-[state=active]:scale-[1.02]
                  hover:bg-red-50
                  text-gray-700
                "
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">Usuarios</span>
              </TabsTrigger>

              {/* Pestaña: PWA */}
              <TabsTrigger 
                value="pwa" 
                className="
                  flex flex-col items-center justify-center
                  gap-1 sm:gap-1.5
                  py-2 sm:py-2.5 md:py-3
                  px-3 sm:px-2 md:px-3
                  min-w-[70px] sm:min-w-0
                  rounded-md sm:rounded-lg
                  transition-all duration-200
                  data-[state=active]:bg-gray-700 
                  data-[state=active]:text-white 
                  data-[state=active]:shadow-md
                  data-[state=active]:scale-[1.02]
                  hover:bg-gray-50
                  text-gray-700
                "
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">PWA</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </div>
    </div>
  );
}
