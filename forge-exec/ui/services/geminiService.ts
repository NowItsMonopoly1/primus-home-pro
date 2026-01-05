
import { GoogleGenAI, Type } from "@google/genai";
import { ExecutionEvent, JobState } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

/**
 * Validates execution events using the Primus Kernel logic.
 */
export async function validateKernelEvent(event: ExecutionEvent, currentJobState: JobState) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Validate this event for the ForgeExec engine.
      Current Job State: ${currentJobState}
      Event Type: ${event.type}
      Payload: ${JSON.stringify(event.payload)}
      
      Rules:
      1. Job states must follow: LEAD_RECEIVED -> SCHEDULED -> DISPATCHED -> ON_SITE -> WORK_COMPLETED -> INSPECTION_PASSED -> INVOICED -> CLOSED.
      2. No skipping states.
      3. No backwards movement.
      4. Events like MATERIALS_LOGGED or PHOTO_CAPTURED are allowed only in ON_SITE state.
      
      Respond in JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accepted: { type: Type.BOOLEAN },
            newState: { type: Type.STRING, description: "The next state if transition occurs, otherwise current state." },
            message: { type: Type.STRING },
            error: { type: Type.STRING }
          },
          required: ["accepted", "newState", "message"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Kernel Validation Error:", error);
    return { accepted: false, newState: currentJobState, message: "Kernel offline. Simulation failed.", error: "API_ERROR" };
  }
}

/**
 * Uses Google Search Grounding to find relevant NEC codes or local regulations.
 */
export async function searchElectricalRegulations(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find specific NEC (National Electrical Code) requirements or local SF Bay Area electrical regulations for: ${query}. Provide a concise summary for an electrician on site.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || []
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Search currently unavailable.", sources: [] };
  }
}

/**
 * Uses Google Maps Grounding to find nearby electrical supply stores.
 */
export async function findNearbySupplyStores(lat: number, lng: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List the nearest 3 electrical supply stores (like Platt, CED, or Grainger) with their current status and contact info.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.maps) || []
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "Maps service currently unavailable.", sources: [] };
  }
}

/**
 * Uses Gemini Pro for complex job analysis and material estimation from job notes.
 */
export async function analyzeJobComplexity(jobDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze this electrical job description and provide:
      1. Estimated difficulty (1-10)
      2. Likely required materials
      3. Potential safety hazards.
      
      Job: ${jobDescription}`,
      config: {
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });

    return response.text;
  } catch (error) {
    return "Analysis failed.";
  }
}
