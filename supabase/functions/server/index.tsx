import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-000a47d9/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to check KV store contents
app.get("/make-server-000a47d9/debug/test-controls", async (c) => {
  try {
    const testControls = await kv.get("test-controls:list");
    return c.json({ 
      count: testControls ? testControls.length : 0,
      testControls: testControls || [],
      ids: testControls ? testControls.map((tc: any) => tc.id) : []
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== SWIMMERS ROUTES ====================

// Get all swimmers
app.get("/make-server-000a47d9/swimmers", async (c) => {
  try {
    const swimmers = await kv.get("swimmers:list");
    return c.json({ swimmers: swimmers || [] });
  } catch (error) {
    console.error("Error fetching swimmers:", error);
    return c.json({ error: "Failed to fetch swimmers", details: String(error) }, 500);
  }
});

// Add a new swimmer
app.post("/make-server-000a47d9/swimmers", async (c) => {
  try {
    const newSwimmer = await c.req.json();
    const swimmers = await kv.get("swimmers:list") || [];
    
    // Generate unique ID
    const id = `s${Date.now()}`;
    const swimmerWithId = { ...newSwimmer, id };
    
    // Add to list
    const updatedSwimmers = [...swimmers, swimmerWithId];
    await kv.set("swimmers:list", updatedSwimmers);
    
    return c.json({ swimmer: swimmerWithId }, 201);
  } catch (error) {
    console.error("Error adding swimmer:", error);
    return c.json({ error: "Failed to add swimmer", details: String(error) }, 500);
  }
});

// Update a swimmer
app.put("/make-server-000a47d9/swimmers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const swimmers = await kv.get("swimmers:list") || [];
    
    const index = swimmers.findIndex((s: any) => s.id === id);
    if (index === -1) {
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    swimmers[index] = { ...updatedData, id };
    await kv.set("swimmers:list", swimmers);
    
    return c.json({ swimmer: swimmers[index] });
  } catch (error) {
    console.error("Error updating swimmer:", error);
    return c.json({ error: "Failed to update swimmer", details: String(error) }, 500);
  }
});

// Delete a swimmer
app.delete("/make-server-000a47d9/swimmers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const swimmers = await kv.get("swimmers:list") || [];
    
    const filteredSwimmers = swimmers.filter((s: any) => s.id !== id);
    
    if (filteredSwimmers.length === swimmers.length) {
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    await kv.set("swimmers:list", filteredSwimmers);
    
    // Also delete all attendance records for this swimmer
    const attendanceKeys = await kv.getByPrefix(`attendance:${id}:`);
    if (attendanceKeys && attendanceKeys.length > 0) {
      await kv.mdel(attendanceKeys.map((item: any) => item.key));
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting swimmer:", error);
    return c.json({ error: "Failed to delete swimmer", details: String(error) }, 500);
  }
});

// ==================== ATTENDANCE ROUTES ====================

// Get all attendance records
app.get("/make-server-000a47d9/attendance", async (c) => {
  try {
    const records = await kv.getByPrefix("attendance:");
    const attendanceList = records
      ? records
          .filter((item: any) => item.key !== "attendance:list")
          .map((item: any) => item.value)
          .filter((record: any) => record && record.id && record.swimmerId && record.sessionId) // Filtrar registros inválidos
      : [];
    return c.json({ attendance: attendanceList });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return c.json({ error: "Failed to fetch attendance", details: String(error) }, 500);
  }
});

// Add attendance record
app.post("/make-server-000a47d9/attendance", async (c) => {
  try {
    const record = await c.req.json();
    const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const recordWithId = { ...record, id };
    
    // Store individual record
    await kv.set(`attendance:${record.swimmerId}:${record.sessionId}:${id}`, recordWithId);
    
    return c.json({ record: recordWithId }, 201);
  } catch (error) {
    console.error("Error adding attendance:", error);
    return c.json({ error: "Failed to add attendance", details: String(error) }, 500);
  }
});

// Update attendance record
app.put("/make-server-000a47d9/attendance/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    
    // Find the record by searching all attendance keys
    const allRecords = await kv.getByPrefix("attendance:");
    const recordItem = allRecords?.find((item: any) => item.value?.id === id);
    
    if (!recordItem) {
      return c.json({ error: "Attendance record not found" }, 404);
    }
    
    const updatedRecord = { ...updatedData, id };
    await kv.set(recordItem.key, updatedRecord);
    
    return c.json({ record: updatedRecord });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return c.json({ error: "Failed to update attendance", details: String(error) }, 500);
  }
});

// Delete attendance record
app.delete("/make-server-000a47d9/attendance/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("🔍 Attempting to delete attendance record with ID:", id);
    
    // Find and delete the record
    const allRecords = await kv.getByPrefix("attendance:");
    console.log("📋 Total attendance records found:", allRecords?.length || 0);
    
    // Log all record IDs for debugging
    if (allRecords && allRecords.length > 0) {
      console.log("📝 Available record IDs:", allRecords.map((item: any) => item.value?.id).filter(Boolean));
    }
    
    const recordItem = allRecords?.find((item: any) => item.value?.id === id);
    
    if (!recordItem) {
      console.log("❌ Record not found with ID:", id);
      // Return success even if not found to avoid UI errors
      return c.json({ success: true, message: "Record not found or already deleted" });
    }
    
    console.log("✅ Found record to delete:", recordItem.key);
    await kv.del(recordItem.key);
    console.log("✅ Attendance record deleted successfully");
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return c.json({ error: "Failed to delete attendance", details: String(error) }, 500);
  }
});

// ==================== COMPETITIONS ROUTES ====================

// Get all competitions
app.get("/make-server-000a47d9/competitions", async (c) => {
  try {
    const competitions = await kv.get("competitions:list");
    return c.json({ competitions: competitions || [] });
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return c.json({ error: "Failed to fetch competitions", details: String(error) }, 500);
  }
});

// ==================== WORKOUTS ROUTES ====================

// Get all workouts
app.get("/make-server-000a47d9/workouts", async (c) => {
  try {
    const workouts = await kv.get("workouts:list");
    // Filtrar solo los no eliminados por defecto
    const activeWorkouts = (workouts || []).filter((w: any) => !w.deleted);
    return c.json({ workouts: activeWorkouts });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return c.json({ error: "Failed to fetch workouts", details: String(error) }, 500);
  }
});

// Get deleted workouts (trash)
app.get("/make-server-000a47d9/workouts/trash", async (c) => {
  try {
    const workouts = await kv.get("workouts:list");
    const deletedWorkouts = (workouts || []).filter((w: any) => w.deleted);
    return c.json({ workouts: deletedWorkouts });
  } catch (error) {
    console.error("Error fetching deleted workouts:", error);
    return c.json({ error: "Failed to fetch deleted workouts", details: String(error) }, 500);
  }
});

// Add a new workout
app.post("/make-server-000a47d9/workouts", async (c) => {
  try {
    const newWorkout = await c.req.json();
    const workouts = await kv.get("workouts:list") || [];
    
    // Generate unique ID
    const id = `w${Date.now()}`;
    const workoutWithId = { ...newWorkout, id };
    
    // Add to list
    const updatedWorkouts = [...workouts, workoutWithId];
    await kv.set("workouts:list", updatedWorkouts);
    
    return c.json({ workout: workoutWithId }, 201);
  } catch (error) {
    console.error("Error adding workout:", error);
    return c.json({ error: "Failed to add workout", details: String(error) }, 500);
  }
});

// Update a workout
app.put("/make-server-000a47d9/workouts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const workouts = await kv.get("workouts:list") || [];
    
    const index = workouts.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return c.json({ error: "Workout not found" }, 404);
    }
    
    workouts[index] = { ...updatedData, id };
    await kv.set("workouts:list", workouts);
    
    return c.json({ workout: workouts[index] });
  } catch (error) {
    console.error("Error updating workout:", error);
    return c.json({ error: "Failed to update workout", details: String(error) }, 500);
  }
});

// Delete a workout (soft delete)
app.delete("/make-server-000a47d9/workouts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const workouts = await kv.get("workouts:list") || [];
    
    const index = workouts.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return c.json({ error: "Workout not found" }, 404);
    }
    
    // Soft delete: marcar como eliminado
    workouts[index] = {
      ...workouts[index],
      deleted: true,
      deletedAt: new Date().toISOString()
    };
    
    await kv.set("workouts:list", workouts);
    
    console.log(`🗑️ Workout soft-deleted: ${id}`);
    return c.json({ success: true, message: "Workout moved to trash" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return c.json({ error: "Failed to delete workout", details: String(error) }, 500);
  }
});

// Restore a deleted workout
app.post("/make-server-000a47d9/workouts/:id/restore", async (c) => {
  try {
    const id = c.req.param("id");
    const workouts = await kv.get("workouts:list") || [];
    
    const index = workouts.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return c.json({ error: "Workout not found" }, 404);
    }
    
    if (!workouts[index].deleted) {
      return c.json({ error: "Workout is not deleted" }, 400);
    }
    
    // Restaurar: quitar las marcas de eliminado
    const { deleted, deletedAt, ...restoredWorkout } = workouts[index];
    workouts[index] = restoredWorkout;
    
    await kv.set("workouts:list", workouts);
    
    console.log(`♻️ Workout restored: ${id}`);
    return c.json({ success: true, workout: restoredWorkout });
  } catch (error) {
    console.error("Error restoring workout:", error);
    return c.json({ error: "Failed to restore workout", details: String(error) }, 500);
  }
});

// Permanently delete a workout
app.delete("/make-server-000a47d9/workouts/:id/permanent", async (c) => {
  try {
    const id = c.req.param("id");
    const workouts = await kv.get("workouts:list") || [];
    
    const filteredWorkouts = workouts.filter((w: any) => w.id !== id);
    
    if (filteredWorkouts.length === workouts.length) {
      return c.json({ error: "Workout not found" }, 404);
    }
    
    await kv.set("workouts:list", filteredWorkouts);
    
    console.log(`🔥 Workout permanently deleted: ${id}`);
    return c.json({ success: true, message: "Workout permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting workout:", error);
    return c.json({ error: "Failed to permanently delete workout", details: String(error) }, 500);
  }
});

// ==================== CHALLENGES ROUTES ====================

// Get all challenges
app.get("/make-server-000a47d9/challenges", async (c) => {
  try {
    const challenges = await kv.get("challenges:list");
    return c.json({ challenges: challenges || [] });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return c.json({ error: "Failed to fetch challenges", details: String(error) }, 500);
  }
});

// Add a new challenge
app.post("/make-server-000a47d9/challenges", async (c) => {
  try {
    const newChallenge = await c.req.json();
    const challenges = await kv.get("challenges:list") || [];
    
    // Generate unique ID
    const id = `ch${Date.now()}`;
    const challengeWithId = { ...newChallenge, id };
    
    // Add to list
    const updatedChallenges = [...challenges, challengeWithId];
    await kv.set("challenges:list", updatedChallenges);
    
    return c.json({ challenge: challengeWithId }, 201);
  } catch (error) {
    console.error("Error adding challenge:", error);
    return c.json({ error: "Failed to add challenge", details: String(error) }, 500);
  }
});

// Update a challenge
app.put("/make-server-000a47d9/challenges/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const challenges = await kv.get("challenges:list") || [];
    
    const index = challenges.findIndex((ch: any) => ch.id === id);
    if (index === -1) {
      return c.json({ error: "Challenge not found" }, 404);
    }
    
    challenges[index] = { ...updatedData, id };
    await kv.set("challenges:list", challenges);
    
    return c.json({ challenge: challenges[index] });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return c.json({ error: "Failed to update challenge", details: String(error) }, 500);
  }
});

// Delete a challenge
app.delete("/make-server-000a47d9/challenges/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️ Attempting to delete challenge with ID: ${id}`);
    
    const challenges = await kv.get("challenges:list") || [];
    console.log(`📋 Total challenges in list: ${challenges.length}`);
    console.log(`📋 Challenge IDs in list:`, challenges.map((ch: any) => ch.id));
    
    const filteredChallenges = challenges.filter((ch: any) => ch.id !== id);
    
    if (filteredChallenges.length === challenges.length) {
      console.log(`❌ Challenge with ID ${id} not found in list`);
      return c.json({ error: "Challenge not found" }, 404);
    }
    
    await kv.set("challenges:list", filteredChallenges);
    
    console.log(`✅ Challenge deleted successfully: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return c.json({ error: "Failed to delete challenge", details: String(error) }, 500);
  }
});

// ==================== COMPETITIONS ROUTES (continued) ====================

// Add a new competition
app.post("/make-server-000a47d9/competitions", async (c) => {
  try {
    const newCompetition = await c.req.json();
    const competitions = await kv.get("competitions:list") || [];
    
    // Generate unique ID
    const id = `comp_${Date.now()}`;
    const competitionWithId = { ...newCompetition, id };
    
    // Add to list
    const updatedCompetitions = [...competitions, competitionWithId];
    await kv.set("competitions:list", updatedCompetitions);
    
    return c.json({ competition: competitionWithId }, 201);
  } catch (error) {
    console.error("Error adding competition:", error);
    return c.json({ error: "Failed to add competition", details: String(error) }, 500);
  }
});

// Update a competition
app.put("/make-server-000a47d9/competitions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const competitions = await kv.get("competitions:list") || [];
    
    const index = competitions.findIndex((comp: any) => comp.id === id);
    if (index === -1) {
      return c.json({ error: "Competition not found" }, 404);
    }
    
    competitions[index] = { ...updatedData, id };
    await kv.set("competitions:list", competitions);
    
    return c.json({ competition: competitions[index] });
  } catch (error) {
    console.error("Error updating competition:", error);
    return c.json({ error: "Failed to update competition", details: String(error) }, 500);
  }
});

// Delete a competition
app.delete("/make-server-000a47d9/competitions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const competitions = await kv.get("competitions:list") || [];
    
    const filteredCompetitions = competitions.filter((comp: any) => comp.id !== id);
    
    if (filteredCompetitions.length === competitions.length) {
      return c.json({ error: "Competition not found" }, 404);
    }
    
    await kv.set("competitions:list", filteredCompetitions);
    
    // Also delete all swimmer participation records for this competition
    const participations = await kv.get("swimmer_competitions:list") || [];
    const filteredParticipations = participations.filter((p: any) => p.competitionId !== id);
    await kv.set("swimmer_competitions:list", filteredParticipations);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting competition:", error);
    return c.json({ error: "Failed to delete competition", details: String(error) }, 500);
  }
});

// ==================== SWIMMER COMPETITIONS ROUTES ====================

// Get all swimmer competition participations
app.get("/make-server-000a47d9/swimmer-competitions", async (c) => {
  try {
    const participations = await kv.get("swimmer_competitions:list");
    return c.json({ participations: participations || [] });
  } catch (error) {
    console.error("Error fetching swimmer competitions:", error);
    return c.json({ error: "Failed to fetch swimmer competitions", details: String(error) }, 500);
  }
});

// Add or update swimmer competition participation
app.post("/make-server-000a47d9/swimmer-competitions", async (c) => {
  try {
    const newParticipation = await c.req.json();
    const participations = await kv.get("swimmer_competitions:list") || [];
    
    // Check if participation already exists
    const existingIndex = participations.findIndex(
      (p: any) => p.swimmerId === newParticipation.swimmerId && p.competitionId === newParticipation.competitionId
    );
    
    let participationWithId;
    if (existingIndex !== -1) {
      // Update existing participation
      participationWithId = { ...newParticipation, id: participations[existingIndex].id };
      participations[existingIndex] = participationWithId;
    } else {
      // Create new participation
      const id = `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      participationWithId = { ...newParticipation, id };
      participations.push(participationWithId);
    }
    
    await kv.set("swimmer_competitions:list", participations);
    
    return c.json({ participation: participationWithId }, 201);
  } catch (error) {
    console.error("Error adding swimmer competition:", error);
    return c.json({ error: "Failed to add swimmer competition", details: String(error) }, 500);
  }
});

// Update swimmer competition participation
app.put("/make-server-000a47d9/swimmer-competitions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const participations = await kv.get("swimmer_competitions:list") || [];
    
    const index = participations.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return c.json({ error: "Swimmer competition not found" }, 404);
    }
    
    participations[index] = { ...updatedData, id };
    await kv.set("swimmer_competitions:list", participations);
    
    return c.json({ participation: participations[index] });
  } catch (error) {
    console.error("Error updating swimmer competition:", error);
    return c.json({ error: "Failed to update swimmer competition", details: String(error) }, 500);
  }
});

// Delete swimmer competition participation
app.delete("/make-server-000a47d9/swimmer-competitions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const participations = await kv.get("swimmer_competitions:list") || [];
    
    const filteredParticipations = participations.filter((p: any) => p.id !== id);
    
    if (filteredParticipations.length === participations.length) {
      return c.json({ error: "Swimmer competition not found" }, 404);
    }
    
    await kv.set("swimmer_competitions:list", filteredParticipations);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting swimmer competition:", error);
    return c.json({ error: "Failed to delete swimmer competition", details: String(error) }, 500);
  }
});

// ==================== COMPETITION RESULTS ROUTES ====================

// Helper function to convert time to seconds
function timeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
}

// Helper function to parse event name
function parseEvent(eventName: string): { distance: number; style: string } | null {
  const match = eventName.match(/(\d+)m?\s+(.+)/i);
  if (match) {
    const distance = parseInt(match[1]);
    const style = match[2].trim();
    
    const styleMap: Record<string, string> = {
      'Libre': 'Libre',
      'Espalda': 'Espalda',
      'Pecho': 'Pecho',
      'Mariposa': 'Mariposa',
      'Combinado': 'Combinado',
      'IM': 'Combinado',
      'Medley': 'Combinado'
    };
    
    const normalizedStyle = styleMap[style] || style;
    return { distance, style: normalizedStyle };
  }
  return null;
}

// Update competition results and automatically update personal bests
app.post("/make-server-000a47d9/competition-results", async (c) => {
  try {
    const { swimmerId, competitionId, events } = await c.req.json();
    
    if (!swimmerId || !competitionId || !events) {
      return c.json({ error: "Missing required fields: swimmerId, competitionId, events" }, 400);
    }
    
    // Get current data
    const swimmers = await kv.get("swimmers:list") || [];
    const participations = await kv.get("swimmer_competitions:list") || [];
    const competitions = await kv.get("competitions:list") || [];
    
    // Find swimmer
    const swimmerIndex = swimmers.findIndex((s: any) => s.id === swimmerId);
    if (swimmerIndex === -1) {
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    // Find competition
    const competition = competitions.find((c: any) => c.id === competitionId);
    if (!competition) {
      return c.json({ error: "Competition not found" }, 404);
    }
    
    const swimmer = swimmers[swimmerIndex];
    
    // Find or create participation
    let participationIndex = participations.findIndex(
      (p: any) => p.swimmerId === swimmerId && p.competitionId === competitionId
    );
    
    let participation;
    if (participationIndex === -1) {
      // Create new participation
      const id = `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      participation = {
        id,
        swimmerId,
        competitionId,
        participates: true,
        events: events
      };
      participations.push(participation);
      participationIndex = participations.length - 1;
    } else {
      // Update existing participation
      participation = participations[participationIndex];
      participation.events = events;
    }
    
    // Update personal bests and history
    const currentBests = swimmer.personalBests || [];
    const currentHistory = swimmer.personalBestsHistory || [];
    const updatedBests = [...currentBests];
    const newHistoryEntries = [];
    
    for (const event of events) {
      if (!event.time) continue; // Skip events without a time
      
      const parsed = parseEvent(event.event);
      if (!parsed) continue;
      
      const { distance, style } = parsed;
      const timeInSeconds = timeToSeconds(event.time);
      
      // Create history entry
      const historyEntry = {
        id: `pb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        distance,
        style,
        time: event.time,
        timeInSeconds,
        date: competition.startDate,
        location: competition.location,
        isPersonalBest: false
      };
      
      // Check if this is a personal best
      const existingBestIndex = updatedBests.findIndex(
        (pb: any) => pb.distance === distance && pb.style === style
      );
      
      if (existingBestIndex === -1) {
        // First time for this distance/style
        updatedBests.push({
          distance,
          style,
          time: event.time,
          date: competition.startDate,
          location: competition.location
        });
        historyEntry.isPersonalBest = true;
      } else {
        // Check if it's faster than current best
        const currentBestTime = timeToSeconds(updatedBests[existingBestIndex].time);
        if (timeInSeconds < currentBestTime) {
          updatedBests[existingBestIndex] = {
            distance,
            style,
            time: event.time,
            date: competition.startDate,
            location: competition.location
          };
          historyEntry.isPersonalBest = true;
        }
      }
      
      newHistoryEntries.push(historyEntry);
    }
    
    // Update swimmer with new bests and history
    swimmers[swimmerIndex] = {
      ...swimmer,
      personalBests: updatedBests,
      personalBestsHistory: [...currentHistory, ...newHistoryEntries]
    };
    
    // Save all updates
    await kv.set("swimmers:list", swimmers);
    await kv.set("swimmer_competitions:list", participations);
    
    console.log(`✅ Competition results updated for swimmer ${swimmerId} in competition ${competitionId}`);
    console.log(`   - ${newHistoryEntries.filter((e: any) => e.isPersonalBest).length} new personal best(s)`);
    
    return c.json({
      participation: participations[participationIndex],
      swimmer: swimmers[swimmerIndex]
    });
  } catch (error) {
    console.error("Error updating competition results:", error);
    return c.json({ error: "Failed to update competition results", details: String(error) }, 500);
  }
});

// ==================== HOLIDAYS ROUTES ====================

// Get all holidays
app.get("/make-server-000a47d9/holidays", async (c) => {
  try {
    const holidays = await kv.get("holidays:list");
    return c.json({ holidays: holidays || [] });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return c.json({ error: "Failed to fetch holidays", details: String(error) }, 500);
  }
});

// Add a new holiday
app.post("/make-server-000a47d9/holidays", async (c) => {
  try {
    const newHoliday = await c.req.json();
    const holidays = await kv.get("holidays:list") || [];
    
    // Generate unique ID
    const id = `h${Date.now()}`;
    const holidayWithId = { ...newHoliday, id };
    
    // Add to list
    const updatedHolidays = [...holidays, holidayWithId];
    await kv.set("holidays:list", updatedHolidays);
    
    return c.json({ holiday: holidayWithId }, 201);
  } catch (error) {
    console.error("Error adding holiday:", error);
    return c.json({ error: "Failed to add holiday", details: String(error) }, 500);
  }
});

// Update a holiday
app.put("/make-server-000a47d9/holidays/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const holidays = await kv.get("holidays:list") || [];
    
    const index = holidays.findIndex((h: any) => h.id === id);
    if (index === -1) {
      return c.json({ error: "Holiday not found" }, 404);
    }
    
    holidays[index] = { ...updatedData, id };
    await kv.set("holidays:list", holidays);
    
    return c.json({ holiday: holidays[index] });
  } catch (error) {
    console.error("Error updating holiday:", error);
    return c.json({ error: "Failed to update holiday", details: String(error) }, 500);
  }
});

// Delete a holiday
app.delete("/make-server-000a47d9/holidays/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const holidays = await kv.get("holidays:list") || [];
    
    const filteredHolidays = holidays.filter((h: any) => h.id !== id);
    
    if (filteredHolidays.length === holidays.length) {
      return c.json({ error: "Holiday not found" }, 404);
    }
    
    await kv.set("holidays:list", filteredHolidays);
    
    return c.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return c.json({ error: "Failed to delete holiday", details: String(error) }, 500);
  }
});

// ==================== TEST CONTROL ROUTES ====================

// Get all test controls
app.get("/make-server-000a47d9/test-controls", async (c) => {
  try {
    const testControls = await kv.get("test-controls:list");
    return c.json({ testControls: testControls || [] });
  } catch (error) {
    console.error("Error fetching test controls:", error);
    return c.json({ error: "Failed to fetch test controls", details: String(error) }, 500);
  }
});

// Add a new test control
app.post("/make-server-000a47d9/test-controls", async (c) => {
  try {
    const newTestControl = await c.req.json();
    console.log("📝 Creating new test control:", newTestControl);
    
    const testControls = await kv.get("test-controls:list") || [];
    console.log("📋 Existing test controls before add:", testControls.length);
    
    // Generate unique ID
    const id = `tc${Date.now()}`;
    const testControlWithId = { 
      ...newTestControl, 
      id,
      createdAt: new Date().toISOString()
    };
    
    console.log("🆕 New test control with ID:", { id, name: testControlWithId.name });
    
    // Add to list
    const updatedTestControls = [...testControls, testControlWithId];
    await kv.set("test-controls:list", updatedTestControls);
    
    // Verify it was saved
    const verification = await kv.get("test-controls:list") || [];
    console.log("✅ Test controls after save:", verification.length, "items");
    console.log("📋 All test control IDs:", verification.map((tc: any) => tc.id));
    
    return c.json({ testControl: testControlWithId }, 201);
  } catch (error) {
    console.error("Error adding test control:", error);
    return c.json({ error: "Failed to add test control", details: String(error) }, 500);
  }
});

// Update a test control
app.put("/make-server-000a47d9/test-controls/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const testControls = await kv.get("test-controls:list") || [];
    
    const index = testControls.findIndex((tc: any) => tc.id === id);
    if (index === -1) {
      return c.json({ error: "Test control not found" }, 404);
    }
    
    testControls[index] = { ...updatedData, id, createdAt: testControls[index].createdAt };
    await kv.set("test-controls:list", testControls);
    
    return c.json({ testControl: testControls[index] });
  } catch (error) {
    console.error("Error updating test control:", error);
    return c.json({ error: "Failed to update test control", details: String(error) }, 500);
  }
});

// Delete a test control
app.delete("/make-server-000a47d9/test-controls/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const testControls = await kv.get("test-controls:list");
    const list = testControls || [];
    
    const filtered = list.filter((tc: any) => tc.id !== id);
    
    if (filtered.length === list.length) {
      // Test control not found - responder con 404 silenciosamente
      return c.json({ error: "Test control not found" }, 404);
    }
    
    // Delete the test control
    await kv.set("test-controls:list", filtered);
    
    // Also delete associated test results
    const testResults = await kv.get("test-results:list") || [];
    const filteredResults = testResults.filter((tr: any) => tr.testId !== id);
    const deletedResultsCount = testResults.length - filteredResults.length;
    
    if (deletedResultsCount > 0) {
      await kv.set("test-results:list", filteredResults);
      console.log(`✅ Deleted ${deletedResultsCount} associated test results`);
    }
    
    return c.json({ success: true, deletedResults: deletedResultsCount });
  } catch (error) {
    console.error("❌ Error deleting test control:", error);
    return c.json({ error: "Failed to delete test control", details: String(error) }, 500);
  }
});

// ==================== TEST RESULTS ROUTES ====================

// Get all test results
app.get("/make-server-000a47d9/test-results", async (c) => {
  try {
    const testResults = await kv.get("test-results:list");
    return c.json({ testResults: testResults || [] });
  } catch (error) {
    console.error("Error fetching test results:", error);
    return c.json({ error: "Failed to fetch test results", details: String(error) }, 500);
  }
});

// Add a new test result
app.post("/make-server-000a47d9/test-results", async (c) => {
  try {
    const newTestResult = await c.req.json();
    const testResults = await kv.get("test-results:list") || [];
    
    // Generate unique ID
    const id = `tr${Date.now()}`;
    const testResultWithId = { 
      ...newTestResult, 
      id,
      createdAt: new Date().toISOString()
    };
    
    // Add to list
    const updatedTestResults = [...testResults, testResultWithId];
    await kv.set("test-results:list", updatedTestResults);
    
    return c.json({ testResult: testResultWithId }, 201);
  } catch (error) {
    console.error("Error adding test result:", error);
    return c.json({ error: "Failed to add test result", details: String(error) }, 500);
  }
});

// Update a test result
app.put("/make-server-000a47d9/test-results/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const testResults = await kv.get("test-results:list") || [];
    
    const index = testResults.findIndex((tr: any) => tr.id === id);
    if (index === -1) {
      return c.json({ error: "Test result not found" }, 404);
    }
    
    testResults[index] = { ...updatedData, id, createdAt: testResults[index].createdAt };
    await kv.set("test-results:list", testResults);
    
    return c.json({ testResult: testResults[index] });
  } catch (error) {
    console.error("Error updating test result:", error);
    return c.json({ error: "Failed to update test result", details: String(error) }, 500);
  }
});

// Delete a test result
app.delete("/make-server-000a47d9/test-results/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const testResults = await kv.get("test-results:list") || [];
    
    const filteredTestResults = testResults.filter((tr: any) => tr.id !== id);
    
    if (filteredTestResults.length === testResults.length) {
      return c.json({ error: "Test result not found" }, 404);
    }
    
    await kv.set("test-results:list", filteredTestResults);
    
    return c.json({ message: "Test result deleted successfully" });
  } catch (error) {
    console.error("Error deleting test result:", error);
    return c.json({ error: "Failed to delete test result", details: String(error) }, 500);
  }
});

// ==================== PASSWORD REQUESTS ROUTES ====================

// Get all password requests
app.get("/make-server-000a47d9/password-requests", async (c) => {
  try {
    const requests = await kv.get("password-requests:list");
    return c.json({ requests: requests || [] });
  } catch (error) {
    console.error("Error fetching password requests:", error);
    return c.json({ error: "Failed to fetch password requests", details: String(error) }, 500);
  }
});

// Add a new password request
app.post("/make-server-000a47d9/password-requests", async (c) => {
  try {
    const newRequest = await c.req.json();
    const requests = await kv.get("password-requests:list") || [];
    
    // Generate unique ID
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const requestWithId = { ...newRequest, id };
    
    // Add to list
    const updatedRequests = [...requests, requestWithId];
    await kv.set("password-requests:list", updatedRequests);
    
    console.log("✅ Password request created:", requestWithId);
    return c.json({ request: requestWithId }, 201);
  } catch (error) {
    console.error("Error adding password request:", error);
    return c.json({ error: "Failed to add password request", details: String(error) }, 500);
  }
});

// Update a password request
app.put("/make-server-000a47d9/password-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const requests = await kv.get("password-requests:list") || [];
    
    const index = requests.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return c.json({ error: "Password request not found" }, 404);
    }
    
    requests[index] = { ...requests[index], ...updatedData };
    await kv.set("password-requests:list", requests);
    
    console.log("✅ Password request updated:", requests[index]);
    return c.json({ request: requests[index] });
  } catch (error) {
    console.error("Error updating password request:", error);
    return c.json({ error: "Failed to update password request", details: String(error) }, 500);
  }
});

// Delete a password request
app.delete("/make-server-000a47d9/password-requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const requests = await kv.get("password-requests:list") || [];
    
    const filteredRequests = requests.filter((r: any) => r.id !== id);
    
    if (filteredRequests.length === requests.length) {
      return c.json({ error: "Password request not found" }, 404);
    }
    
    await kv.set("password-requests:list", filteredRequests);
    
    console.log("✅ Password request deleted:", id);
    return c.json({ message: "Password request deleted successfully" });
  } catch (error) {
    console.error("Error deleting password request:", error);
    return c.json({ error: "Failed to delete password request", details: String(error) }, 500);
  }
});

// ==================== USERS ROUTES ====================

// Get all users (excluding passwords for security)
app.get("/make-server-000a47d9/users", async (c) => {
  try {
    const users = await kv.get("users:list") || [];
    // No devolver contraseñas en el listado
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      swimmerId: u.swimmerId
    }));
    return c.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users", details: String(error) }, 500);
  }
});

// Get a single user by ID (including password for auth)
app.get("/make-server-000a47d9/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const users = await kv.get("users:list") || [];
    
    const user = users.find((u: any) => u.id === id);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user", details: String(error) }, 500);
  }
});

// Find user by email (for login)
app.post("/make-server-000a47d9/users/find-by-email", async (c) => {
  try {
    const { email } = await c.req.json();
    const users = await kv.get("users:list") || [];
    
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.error("Error finding user by email:", error);
    return c.json({ error: "Failed to find user", details: String(error) }, 500);
  }
});

// Add a new user
app.post("/make-server-000a47d9/users", async (c) => {
  try {
    const newUser = await c.req.json();
    const users = await kv.get("users:list") || [];
    
    // Verificar si el email ya existe
    if (users.some((u: any) => u.email === newUser.email)) {
      return c.json({ error: "Email already exists" }, 400);
    }
    
    // Generate unique ID if not provided
    const id = newUser.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const userWithId = { ...newUser, id };
    
    // Add to list
    const updatedUsers = [...users, userWithId];
    await kv.set("users:list", updatedUsers);
    
    console.log("✅ User created:", { id, email: userWithId.email, role: userWithId.role });
    return c.json({ user: userWithId }, 201);
  } catch (error) {
    console.error("Error adding user:", error);
    return c.json({ error: "Failed to add user", details: String(error) }, 500);
  }
});

// Update a user
app.put("/make-server-000a47d9/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();
    const users = await kv.get("users:list") || [];
    
    const index = users.findIndex((u: any) => u.id === id);
    if (index === -1) {
      return c.json({ error: "User not found" }, 404);
    }
    
    users[index] = { ...users[index], ...updatedData };
    await kv.set("users:list", users);
    
    console.log("✅ User updated:", { id, email: users[index].email });
    return c.json({ user: users[index] });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Failed to update user", details: String(error) }, 500);
  }
});

// Delete a user
app.delete("/make-server-000a47d9/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const users = await kv.get("users:list") || [];
    
    const filteredUsers = users.filter((u: any) => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      return c.json({ error: "User not found" }, 404);
    }
    
    await kv.set("users:list", filteredUsers);
    
    console.log("✅ User deleted:", id);
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user", details: String(error) }, 500);
  }
});

// Initialize admin user (called on first server start)
app.post("/make-server-000a47d9/users/init-admin", async (c) => {
  try {
    const users = await kv.get("users:list") || [];
    
    // Check if admin already exists
    const adminExists = users.some((u: any) => u.email === "admin@uch.cl");
    
    if (adminExists) {
      return c.json({ message: "Admin already exists" });
    }
    
    // Create default admin
    const adminUser = {
      id: "user_admin_1",
      email: "admin@uch.cl",
      password: "admin123",
      name: "Administrador UCH",
      role: "admin"
    };
    
    const updatedUsers = [...users, adminUser];
    await kv.set("users:list", updatedUsers);
    
    console.log("✅ Admin user initialized");
    return c.json({ message: "Admin user created", user: { email: adminUser.email, role: adminUser.role } });
  } catch (error) {
    console.error("Error initializing admin:", error);
    return c.json({ error: "Failed to initialize admin", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);