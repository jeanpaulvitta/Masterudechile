import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Check, X, Search } from "lucide-react";
import type { Swimmer, AttendanceRecord } from "../data/swimmers";

interface AttendanceTableProps {
  swimmers: Swimmer[];
  attendanceRecords: AttendanceRecord[];
  schedule: "7am" | "8am" | "9pm";
}

export function AttendanceTable({
  swimmers,
  attendanceRecords,
  schedule,
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("27 de marzo");

  const filteredSwimmers = swimmers.filter(
    (s) =>
      s.schedule === schedule &&
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScheduleLabel = (schedule: string) => {
    if (schedule === "7am") return "7:00 AM";
    if (schedule === "8am") return "8:00 AM";
    if (schedule === "9pm") return "9:00 PM";
    return schedule;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Grupo {getScheduleLabel(schedule)}
            <Badge variant="outline">{filteredSwimmers.length} nadadores</Badge>
          </CardTitle>
          <div className="flex gap-4">
            <div className="w-48">
              <Label htmlFor="search" className="text-xs">
                Buscar nadador
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-40">
              <Label htmlFor="date" className="text-xs">
                Fecha
              </Label>
              <Input
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nadador</TableHead>
                <TableHead className="text-center">Asistió</TableHead>
                <TableHead className="text-right">Vol. Asignado</TableHead>
                <TableHead className="text-right">Vol. Cumplido</TableHead>
                <TableHead className="text-right">% Cumplido</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSwimmers.map((swimmer) => {
                const record = attendanceRecords.find(
                  (r) => r.swimmerId === swimmer.id && r.date === selectedDate
                );

                const completionRate = record
                  ? (record.volumeCompleted / record.volumeAssigned) * 100
                  : 0;

                return (
                  <TableRow key={swimmer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{swimmer.name}</p>
                        <p className="text-xs text-gray-500">
                          {swimmer.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {record?.attended ? (
                        <div className="flex justify-center">
                          <div className="bg-green-100 rounded-full p-1">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="bg-red-100 rounded-full p-1">
                            <X className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {record ? `${record.volumeAssigned}m` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {record ? `${record.volumeCompleted}m` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          completionRate >= 90
                            ? "text-green-600 font-semibold"
                            : completionRate >= 75
                            ? "text-yellow-600 font-semibold"
                            : "text-orange-600 font-semibold"
                        }
                      >
                        {record ? `${completionRate.toFixed(0)}%` : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {record?.notes || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}