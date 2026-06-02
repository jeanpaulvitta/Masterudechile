import { TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dumbbell, Calendar, Users, Medal, Clipboard, Crown, 
  Award, ClipboardList, Shield
} from 'lucide-react';

interface ResponsiveTabsNavProps {
  userRole?: 'admin' | 'coach' | 'swimmer';
}

const TAB_CLASS = `
  flex flex-col items-center justify-center
  gap-0.5 sm:gap-1
  py-1.5 sm:py-2
  px-0.5 sm:px-1 md:px-1.5
  min-w-0 rounded-md
  transition-all duration-200
  text-gray-500
  hover:text-[#003366] hover:bg-blue-50
  data-[state=active]:bg-[#003366]
  data-[state=active]:text-white
  data-[state=active]:shadow-sm
`;

export function ResponsiveTabsNav({ userRole }: ResponsiveTabsNavProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-1 sm:px-4 md:px-6 py-3 md:py-4 mb-16 sm:mb-16 lg:mb-20 mt-2 sm:mt-4 border border-gray-100 flex items-center justify-center">
      <TabsList className={`
        grid w-full
        ${userRole === "admin"
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9"
          : "grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8"
        }
        gap-0.5 sm:gap-1 md:gap-1.5 bg-transparent
      `}>
        <TabsTrigger value="entrenamientos" className={TAB_CLASS}>
          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Entrenos</span>
        </TabsTrigger>

        <TabsTrigger value="calendario" className={TAB_CLASS}>
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Calendario</span>
        </TabsTrigger>

        <TabsTrigger value="nadadores" className={TAB_CLASS}>
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Nadadores</span>
        </TabsTrigger>

        <TabsTrigger value="competencias" className={TAB_CLASS}>
          <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Compet.</span>
        </TabsTrigger>

        <TabsTrigger value="test-control" className={TAB_CLASS}>
          <Clipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Tests</span>
        </TabsTrigger>

        <TabsTrigger value="records" className={TAB_CLASS}>
          <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Récords</span>
        </TabsTrigger>

        <TabsTrigger value="logros" className={TAB_CLASS}>
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Logros</span>
        </TabsTrigger>

        <TabsTrigger value="asistencia" className={TAB_CLASS}>
          <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Asistencia</span>
        </TabsTrigger>

        {userRole === "admin" && (
          <TabsTrigger value="usuarios" className={TAB_CLASS}>
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap">Usuarios</span>
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  );
}