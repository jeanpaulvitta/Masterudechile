import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from 'npm:@supabase/supabase-js@^2';

const app = new Hono();

// Crear cliente de Supabase con SERVICE ROLE para operaciones de administración
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`⏱️ TIMEOUT: ${errorMessage} (${timeoutMs}ms)`);
      reject(new Error(errorMessage));
    }, timeoutMs);
    
    // Clear timeout if promise resolves
    promise.finally(() => clearTimeout(timeoutId));
  });
  
  return Promise.race([promise, timeoutPromise]);
}

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

// Middleware to catch early errors
app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('❌ Middleware caught error:', error);
    return c.json({
      error: 'Request processing error',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error('❌ Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    details: String(err)
  }, 500);
});

// Not found handler
app.notFound((c) => {
  console.log('❌ 404 Not Found:', c.req.url);
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.url} not found`
  }, 404);
});

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

// Debug endpoint to check specific swimmer data
app.get("/make-server-000a47d9/debug/swimmer/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const swimmers = await kv.get("swimmers:list") || [];
    const swimmer = swimmers.find((s: any) => s.id === id);
    
    if (!swimmer) {
      return c.json({ error: "Swimmer not found", id }, 404);
    }
    
    return c.json({ 
      swimmer: {
        id: swimmer.id,
        name: swimmer.name,
        email: swimmer.email,
        hasPersonalBests: !!swimmer.personalBests,
        personalBestsCount: swimmer.personalBests?.length || 0,
        personalBests: swimmer.personalBests || [],
        hasPersonalBestsHistory: !!swimmer.personalBestsHistory,
        personalBestsHistoryCount: swimmer.personalBestsHistory?.length || 0,
        personalBestsHistory: swimmer.personalBestsHistory || [],
        hasGoals: !!swimmer.goals,
        goalsCount: swimmer.goals?.length || 0,
        goals: swimmer.goals || []
      }
    });
  } catch (error) {
    console.error("Error in debug swimmer endpoint:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== SWIMMERS ROUTES ====================

// Get all swimmers
app.get("/make-server-000a47d9/swimmers", async (c) => {
  try {
    console.log("🏊 Fetching swimmers - START");
    const startTime = Date.now();
    
    console.log("📊 Creating KV promise...");
    const swimmersPromise = kv.get("swimmers:list");
    
    console.log("⏱️ Awaiting with 30s timeout...");
    const swimmers = await withTimeout(
      swimmersPromise,
      30000, // Aumentar timeout a 30 segundos
      'Timeout fetching swimmers'
    );
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Swimmers fetched: ${swimmers?.length || 0} items in ${elapsed}ms`);
    
    return c.json({ swimmers: swimmers || [] });
  } catch (error) {
    const elapsed = Date.now();
    console.error(`❌ Error fetching swimmers after ${elapsed}ms:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error details:", errorMessage);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack');
    
    // Retornar array vacío en lugar de error 500
    return c.json({ swimmers: [] }, 200);
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
    
    console.log(`📝 Actualizando nadador ${id}`);
    console.log(`📊 Datos recibidos:`, {
      hasPersonalBests: !!updatedData.personalBests,
      personalBestsCount: updatedData.personalBests?.length || 0,
      hasPersonalBestsHistory: !!updatedData.personalBestsHistory,
      historyCount: updatedData.personalBestsHistory?.length || 0,
      hasGoals: !!updatedData.goals,
      goalsCount: updatedData.goals?.length || 0
    });
    
    const swimmers = await kv.get("swimmers:list") || [];
    
    const index = swimmers.findIndex((s: any) => s.id === id);
    if (index === -1) {
      console.error(`❌ Nadador ${id} no encontrado`);
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    // Preservar datos existentes que no vienen en updatedData
    const currentSwimmer = swimmers[index];
    swimmers[index] = { ...currentSwimmer, ...updatedData, id };
    
    await kv.set("swimmers:list", swimmers);
    
    console.log(`✅ Nadador ${id} actualizado exitosamente`);
    console.log(`📊 Datos guardados:`, {
      hasPersonalBests: !!swimmers[index].personalBests,
      personalBestsCount: swimmers[index].personalBests?.length || 0,
      hasPersonalBestsHistory: !!swimmers[index].personalBestsHistory,
      historyCount: swimmers[index].personalBestsHistory?.length || 0
    });
    
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
    const swimmersPromise = kv.get("swimmers:list");
    const swimmers = await withTimeout(swimmersPromise, 30000, 'Timeout fetching swimmers') || [];
    
    const filteredSwimmers = swimmers.filter((s: any) => s.id !== id);
    
    if (filteredSwimmers.length === swimmers.length) {
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    const savePromise = kv.set("swimmers:list", filteredSwimmers);
    await withTimeout(savePromise, 30000, 'Timeout saving swimmers');
    
    // Also delete all attendance records for this swimmer
    const attendanceKeysPromise = kv.getByPrefix(`attendance:${id}:`);
    const attendanceKeys = await withTimeout(attendanceKeysPromise, 30000, 'Timeout fetching attendance keys');
    
    if (attendanceKeys && attendanceKeys.length > 0) {
      const deletePromise = kv.mdel(attendanceKeys.map((item: any) => item.key));
      await withTimeout(deletePromise, 30000, 'Timeout deleting attendance records');
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
    const recordsPromise = kv.getByPrefix("attendance:");
    const records = await withTimeout(
      recordsPromise,
      30000,
      'Timeout fetching attendance records'
    );
    
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
    
    // Find and delete the record with timeout
    const allRecordsPromise = kv.getByPrefix("attendance:");
    const allRecords = await withTimeout(
      allRecordsPromise,
      30000,
      'Timeout while searching for attendance record'
    );
    
    console.log("📋 Total attendance records found:", allRecords?.length || 0);
    
    const recordItem = allRecords?.find((item: any) => item.value?.id === id);
    
    if (!recordItem) {
      console.log("❌ Record not found with ID:", id);
      // Return success even if not found to avoid UI errors
      return c.json({ success: true, message: "Record not found or already deleted" });
    }
    
    console.log("✅ Found record to delete:", recordItem.key);
    
    const deletePromise = kv.del(recordItem.key);
    await withTimeout(
      deletePromise,
      5000,
      'Timeout while deleting attendance record'
    );
    
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
    console.log("🏆 Fetching competitions...");
    const competitions = await withTimeout(
      kv.get("competitions:list"),
      5000,
      "Competitions fetch timeout"
    ).catch(err => {
      console.warn("⚠️ Competitions fetch error:", err);
      return null;
    });
    
    const result = competitions || [];
    console.log(`✅ Competitions fetched: ${result.length} items`);
    return c.json({ competitions: result });
  } catch (error) {
    console.error("❌ Error fetching competitions:", error);
    return c.json({ competitions: [] });
  }
});

// ==================== WORKOUTS ROUTES ====================

// Get all workouts
app.get("/make-server-000a47d9/workouts", async (c) => {
  try {
    const workoutsPromise = kv.get("workouts:list");
    const workouts = await withTimeout(workoutsPromise, 30000, 'Timeout fetching workouts');
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

// Clear ALL workouts (admin only - use with caution)
// IMPORTANT: This route must be BEFORE routes with :id parameters
app.delete("/make-server-000a47d9/workouts/clear-all", async (c) => {
  try {
    await kv.set("workouts:list", []);
    console.log(`🧹 ALL workouts cleared from database`);
    return c.json({ success: true, message: "All workouts cleared" });
  } catch (error) {
    console.error("Error clearing all workouts:", error);
    return c.json({ error: "Failed to clear all workouts", details: String(error) }, 500);
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
    console.log(`🗑️ Attempting to delete workout: ${id}`);
    
    // Get workouts with error handling
    let workouts = [];
    try {
      workouts = await kv.get("workouts:list") || [];
      console.log(`📊 Loaded ${workouts.length} workouts from KV store`);
    } catch (kvError) {
      console.error("❌ Error loading workouts from KV:", kvError);
      return c.json({ error: "Failed to load workouts", details: String(kvError) }, 500);
    }
    
    const index = workouts.findIndex((w: any) => w.id === id);
    if (index === -1) {
      console.warn(`⚠️ Workout not found: ${id}`);
      return c.json({ error: "Workout not found" }, 404);
    }
    
    // Soft delete: marcar como eliminado
    workouts[index] = {
      ...workouts[index],
      deleted: true,
      deletedAt: new Date().toISOString()
    };
    
    console.log(`💾 Saving ${workouts.length} workouts back to KV store...`);
    
    // Save with error handling
    try {
      await kv.set("workouts:list", workouts);
      console.log(`✅ Workout soft-deleted successfully: ${id}`);
    } catch (kvError) {
      console.error("❌ Error saving workouts to KV:", kvError);
      return c.json({ error: "Failed to save workout deletion", details: String(kvError) }, 500);
    }
    
    return c.json({ success: true, message: "Workout moved to trash" });
  } catch (error) {
    console.error("❌ Unexpected error deleting workout:", error);
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

// Bulk delete workouts (permanently delete multiple by IDs)
app.delete("/make-server-000a47d9/workouts/bulk-delete", async (c) => {
  try {
    const { ids } = await c.req.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "Invalid or empty IDs array" }, 400);
    }
    
    console.log(`🗑️ Bulk delete request for ${ids.length} workouts`);
    
    const workouts = await kv.get("workouts:list") || [];
    const filteredWorkouts = workouts.filter((w: any) => !ids.includes(w.id));
    
    const deletedCount = workouts.length - filteredWorkouts.length;
    
    await kv.set("workouts:list", filteredWorkouts);
    
    console.log(`✅ Bulk deleted ${deletedCount} workouts permanently`);
    return c.json({ 
      success: true, 
      message: `${deletedCount} workouts permanently deleted`,
      deletedCount 
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return c.json({ error: "Failed to bulk delete workouts", details: String(error) }, 500);
  }
});

// ==================== CHALLENGES ROUTES ====================

// Get all challenges
app.get("/make-server-000a47d9/challenges", async (c) => {
  try {
    console.log("🎯 Fetching challenges...");
    
    // Intentar obtener challenges con timeout más largo
    const challenges = await withTimeout(
      kv.get("challenges:list"),
      10000, // Aumentar timeout a 10 segundos
      "Challenges fetch timeout"
    ).catch(err => {
      console.warn("⚠️ Challenges fetch error (returning empty array):", err);
      return [];
    });
    
    // Asegurar que siempre sea un array
    const result = Array.isArray(challenges) ? challenges : [];
    console.log(`✅ Challenges fetched: ${result.length} items`);
    
    return c.json({ challenges: result }, 200);
  } catch (error) {
    console.error("❌ Error fetching challenges (returning empty array):", error);
    // Siempre devolver 200 con array vacío en lugar de error 500
    return c.json({ challenges: [] }, 200);
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
    console.log("🏅 Fetching swimmer competitions...");
    const participations = await withTimeout(
      kv.get("swimmer_competitions:list"),
      5000,
      "Swimmer competitions fetch timeout"
    ).catch(err => {
      console.warn("⚠️ Swimmer competitions fetch error:", err);
      return null;
    });
    
    const result = participations || [];
    console.log(`✅ Swimmer competitions fetched: ${result.length} items`);
    return c.json({ participations: result });
  } catch (error) {
    console.error("❌ Error fetching swimmer competitions:", error);
    return c.json({ participations: [] });
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
    
    // Get current data with timeouts
    const swimmersPromise = kv.get("swimmers:list");
    const participationsPromise = kv.get("swimmer_competitions:list");
    const competitionsPromise = kv.get("competitions:list");
    
    const [swimmers, participations, competitions] = await Promise.all([
      withTimeout(swimmersPromise, 30000, 'Timeout fetching swimmers'),
      withTimeout(participationsPromise, 30000, 'Timeout fetching participations'),
      withTimeout(competitionsPromise, 30000, 'Timeout fetching competitions')
    ]);
    
    const swimmersList = swimmers || [];
    const participationsList = participations || [];
    const competitionsList = competitions || [];
    
    // Find swimmer
    const swimmerIndex = swimmersList.findIndex((s: any) => s.id === swimmerId);
    if (swimmerIndex === -1) {
      return c.json({ error: "Swimmer not found" }, 404);
    }
    
    // Find competition
    const competition = competitionsList.find((c: any) => c.id === competitionId);
    if (!competition) {
      return c.json({ error: "Competition not found" }, 404);
    }
    
    const swimmer = swimmersList[swimmerIndex];
    
    // Find or create participation
    let participationIndex = participationsList.findIndex(
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
      participationsList.push(participation);
      participationIndex = participationsList.length - 1;
    } else {
      // Update existing participation
      participation = participationsList[participationIndex];
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
    swimmersList[swimmerIndex] = {
      ...swimmer,
      personalBests: updatedBests,
      personalBestsHistory: [...currentHistory, ...newHistoryEntries]
    };
    
    // Save all updates with timeouts
    const saveSwimmersPromise = kv.set("swimmers:list", swimmersList);
    const saveParticipationsPromise = kv.set("swimmer_competitions:list", participationsList);
    
    await Promise.all([
      withTimeout(saveSwimmersPromise, 30000, 'Timeout saving swimmers'),
      withTimeout(saveParticipationsPromise, 30000, 'Timeout saving participations')
    ]);
    
    console.log(`✅ Competition results updated for swimmer ${swimmerId} in competition ${competitionId}`);
    console.log(`   - ${newHistoryEntries.filter((e: any) => e.isPersonalBest).length} new personal best(s)`);
    
    return c.json({
      participation: participationsList[participationIndex],
      swimmer: swimmersList[swimmerIndex]
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
    console.log("📅 Fetching holidays...");
    
    // Intentar obtener holidays con timeout más largo
    const holidays = await withTimeout(
      kv.get("holidays:list"),
      10000, // Aumentar timeout a 10 segundos
      "Holidays fetch timeout"
    ).catch(err => {
      console.warn("⚠️ Holidays fetch error (returning empty array):", err);
      return [];
    });
    
    // Asegurar que siempre sea un array
    const result = Array.isArray(holidays) ? holidays : [];
    console.log(`✅ Holidays fetched: ${result.length} items`);
    
    return c.json({ holidays: result }, 200);
  } catch (error) {
    console.error("❌ Error fetching holidays (returning empty array):", error);
    // Siempre devolver 200 con array vacío en lugar de error 500
    return c.json({ holidays: [] }, 200);
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
    console.log("📋 Fetching test controls...");
    
    // Add timeout to prevent hanging
    const testControls = await withTimeout(
      kv.get("test-controls:list"),
      5000,
      "Test controls fetch timeout"
    ).catch(err => {
      console.warn("⚠️ Test controls fetch error:", err);
      return null;
    });
    
    const result = testControls || [];
    console.log(`✅ Test controls fetched: ${result.length} items`);
    
    return c.json({ testControls: result });
  } catch (error) {
    console.error("❌ Error fetching test controls:", error);
    // Return empty array instead of error to not block app loading
    return c.json({ testControls: [] });
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
    console.log("📋 Fetching test results...");
    
    // Simplify: just get the data without extra timeout wrapper
    let testResults = [];
    try {
      const data = await kv.get("test-results:list");
      testResults = data || [];
    } catch (kvError) {
      console.warn("⚠️ KV error fetching test results, returning empty array:", kvError);
      testResults = [];
    }
    
    console.log(`✅ Test results fetched: ${testResults.length} items`);
    
    return c.json({ testResults });
  } catch (error) {
    console.error("❌ Error fetching test results:", error);
    // Return empty array instead of error to not block app loading
    return c.json({ testResults: [] });
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

// Reset admin password (for recovery)
app.post("/make-server-000a47d9/users/reset-admin", async (c) => {
  try {
    const users = await kv.get("users:list") || [];
    
    // Find admin
    const adminIndex = users.findIndex((u: any) => u.email === "admin@uch.cl");
    
    if (adminIndex === -1) {
      // Create admin if doesn't exist
      const adminUser = {
        id: "user_admin_1",
        email: "admin@uch.cl",
        password: "admin123",
        name: "Administrador UCH",
        role: "admin"
      };
      users.push(adminUser);
      await kv.set("users:list", users);
      console.log("✅ Admin user created");
      return c.json({ message: "Admin user created", credentials: { email: "admin@uch.cl", password: "admin123" } });
    }
    
    // Reset admin password
    users[adminIndex].password = "admin123";
    await kv.set("users:list", users);
    
    console.log("✅ Admin password reset to default");
    return c.json({ message: "Admin password reset", credentials: { email: "admin@uch.cl", password: "admin123" } });
  } catch (error) {
    console.error("Error resetting admin:", error);
    return c.json({ error: "Failed to reset admin", details: String(error) }, 500);
  }
});

// ==================== SUPABASE AUTH ROUTES ====================

// Initialize admin in Supabase Auth
app.post("/make-server-000a47d9/auth/init-admin", async (c) => {
  try {
    console.log("🔧 Initializing admin in Supabase Auth...");
    
    // Check if admin already exists in Supabase Auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }
    
    const adminExists = existingUsers.users.find((u: any) => u.email === "admin@uch.cl");
    
    if (adminExists) {
      console.log("✅ Admin already exists in Supabase Auth");
      return c.json({ message: "Admin already exists", userId: adminExists.id });
    }
    
    // Create admin user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@uch.cl",
      password: "admin123",
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: "Administrador UCH",
        role: "admin"
      }
    });
    
    if (createError) {
      console.error("Error creating admin:", createError);
      throw createError;
    }
    
    console.log("✅ Admin user created in Supabase Auth:", authData.user.id);
    return c.json({ 
      message: "Admin user created successfully",
      userId: authData.user.id,
      email: "admin@uch.cl"
    });
  } catch (error) {
    console.error("Error initializing admin:", error);
    return c.json({ error: "Failed to initialize admin", details: String(error) }, 500);
  }
});

// Reset admin password in Supabase Auth
app.post("/make-server-000a47d9/auth/reset-admin", async (c) => {
  try {
    console.log("🔧 Resetting admin password in Supabase Auth...");
    
    // Check if admin exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }
    
    const adminUser = existingUsers.users.find((u: any) => u.email === "admin@uch.cl");
    
    if (!adminUser) {
      // Create admin if doesn't exist
      console.log("Admin not found, creating...");
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@uch.cl",
        password: "admin123",
        email_confirm: true,
        user_metadata: {
          name: "Administrador UCH",
          role: "admin"
        }
      });
      
      if (createError) {
        console.error("Error creating admin:", createError);
        throw createError;
      }
      
      console.log("✅ Admin user created");
      return c.json({ 
        message: "Admin user created successfully",
        email: "admin@uch.cl",
        password: "admin123"
      });
    }
    
    // Reset password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      { password: "admin123" }
    );
    
    if (updateError) {
      console.error("Error resetting admin password:", updateError);
      throw updateError;
    }
    
    console.log("✅ Admin password reset successfully");
    return c.json({ 
      message: "Admin password reset successfully",
      email: "admin@uch.cl",
      password: "admin123"
    });
  } catch (error) {
    console.error("Error resetting admin:", error);
    return c.json({ error: "Failed to reset admin", details: String(error) }, 500);
  }
});

// Create a new user in Supabase Auth (called when approving password requests)
app.post("/make-server-000a47d9/auth/create-user", async (c) => {
  try {
    const { email, name, role, swimmerId } = await c.req.json();
    
    console.log("📝 Creating user in Supabase Auth:", { email, name, role });
    
    if (!email || !name || !role) {
      return c.json({ error: "Missing required fields: email, name, role" }, 400);
    }
    
    // Generate a secure random password
    const password = `${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
    
    // Create user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since we don't have email server configured
      user_metadata: {
        name,
        role,
        swimmerId: swimmerId || null
      }
    });
    
    if (createError) {
      console.error("Error creating user in Supabase Auth:", createError);
      throw createError;
    }
    
    console.log("✅ User created in Supabase Auth:", authData.user.id);
    
    // Return user data with generated password (to show to admin)
    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role,
        swimmerId
      },
      password // Return password so admin can share it with the user
    }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user", details: String(error) }, 500);
  }
});

// Login endpoint (verify credentials and return session)
app.post("/make-server-000a47d9/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log("🔐 Login attempt for:", email);
    
    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }
    
    // Sign in with Supabase Auth with timeout
    const authResult = await withTimeout(
      supabaseAdmin.auth.signInWithPassword({
        email,
        password
      }),
      10000, // 10 second timeout
      'Login timeout - please try again'
    );
    
    const { data: authData, error: signInError } = authResult;
    
    if (signInError) {
      console.error("Login failed:", signInError.message);
      return c.json({ error: "Invalid email or password" }, 401);
    }
    
    console.log("✅ Login successful for:", email);
    
    // Get user metadata
    const { name, role, swimmerId } = authData.user.user_metadata || {};
    
    // Return user data and session
    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name || email,
        role: role || "swimmer",
        swimmerId: swimmerId || null
      },
      session: authData.session
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed", details: String(error) }, 500);
  }
});

// Get user by access token
app.get("/make-server-000a47d9/auth/user", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid authorization header" }, 401);
    }
    
    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return c.json({ error: "Invalid or expired token" }, 401);
    }
    
    const { name, role, swimmerId } = userData.user.user_metadata || {};
    
    return c.json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: name || userData.user.email,
        role: role || "swimmer",
        swimmerId: swimmerId || null
      }
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return c.json({ error: "Failed to verify token", details: String(error) }, 500);
  }
});

// Update user password
app.post("/make-server-000a47d9/auth/update-password", async (c) => {
  try {
    const { userId, newPassword } = await c.req.json();
    
    if (!userId || !newPassword) {
      return c.json({ error: "Missing userId or newPassword" }, 400);
    }
    
    // Update password in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    
    if (error) {
      console.error("Error updating password:", error);
      throw error;
    }
    
    console.log("✅ Password updated for user:", userId);
    return c.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return c.json({ error: "Failed to update password", details: String(error) }, 500);
  }
});

// Delete user from Supabase Auth
app.delete("/make-server-000a47d9/auth/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    console.log("🗑️ Deleting user from Supabase Auth:", userId);
    
    // Delete user from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
    
    console.log("✅ User deleted from Supabase Auth:", userId);
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user", details: String(error) }, 500);
  }
});

// Wrap app.fetch to ensure proper response handling
const handler = async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const reqId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${reqId}] 📥 ${req.method} ${new URL(req.url).pathname}`);
    
    // Aumentar el timeout y asegurar que la respuesta se complete
    const responsePromise = app.fetch(req);
    const timeoutPromise = new Promise<Response>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 55 seconds')), 55000)
    );
    
    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`[${reqId}] 📤 ${req.method} ${new URL(req.url).pathname} - Status: ${response.status} - Duration: ${duration}ms`);
    
    // Asegurar que el body se lea completamente antes de responder
    if (response.body) {
      const responseBody = await response.text();
      
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Length': responseBody.length.toString()
        }
      });
    }
    
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${reqId}] ❌ Fatal error in request handler (${duration}ms):`, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorResponse = JSON.stringify({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error),
      requestId: reqId,
      duration
    });
    
    return new Response(errorResponse, { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Length': errorResponse.length.toString()
      }
    });
  }
};

Deno.serve(handler);