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
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg mb-12 sm:mb-16 lg:mb-20 mt-2 sm:mt-4">
      {/* Grid responsivo sin scroll */}
      <div className="px-0.5 py-1 sm:px-1.5 sm:py-2.5 md:px-2 md:py-3">
        <TabsList className={`
          grid w-full
          ${userRole === "admin" 
            ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9" 
            : "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8"
          }
          gap-1 sm:gap-2 bg-transparent
        `}>
          {/* Pestaña: Entrenamientos */}
          <TabsTrigger 
            value="entrenamientos" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Entrenos</span>
          </TabsTrigger>

          {/* Pestaña: Calendario */}
          <TabsTrigger 
            value="calendario" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Calendario</span>
          </TabsTrigger>

          {/* Pestaña: Nadadores */}
          <TabsTrigger 
            value="nadadores" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Nadadores</span>
          </TabsTrigger>

          {/* Pestaña: Competencias */}
          <TabsTrigger 
            value="competencias" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Medal className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Compet.</span>
          </TabsTrigger>

          {/* Pestaña: Test Control */}
          <TabsTrigger 
            value="test-control" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Clipboard className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Tests</span>
          </TabsTrigger>

          {/* Pestaña: Récords */}
          <TabsTrigger 
            value="records" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Récords</span>
          </TabsTrigger>

          {/* Pestaña: Logros */}
          <TabsTrigger 
            value="logros" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <Award className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Logros</span>
          </TabsTrigger>

          {/* Pestaña: Asistencia */}
          <TabsTrigger 
            value="asistencia" 
            className="
              flex flex-col items-center justify-center
              gap-0.5 sm:gap-1
              py-1 sm:py-2 md:py-2.5
              px-1 sm:px-2 md:px-2.5
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
            <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Asistencia</span>
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
                  py-1 sm:py-2 md:py-2.5
                  px-1 sm:px-2 md:px-2.5
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
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
                <span className="text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Usuarios</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </div>
    </div>
  );
}