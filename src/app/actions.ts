'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';

// --- NEW AUTH ACTIONS ---
export async function loginUser(username: string) {
  const cookieStore = await cookies();
  // Encode the Arabic characters into a URL-safe ASCII string
  const safeUsername = encodeURIComponent(username.trim().toLowerCase());
  // Store for one year
  cookieStore.set('nexus_user', safeUsername, { maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('nexus_user');
  revalidatePath('/');
}

// Initialize the client.
const ai = new GoogleGenAI({});

// --- CheapShark API Integration ---
export async function searchGameImage(query: string): Promise<string | null> {
  if (!query || query.length < 3) return null;

  try {
    const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=1`;

    // Add a real browser User-Agent to prevent AWS/Vercel from being blocked
    // Add cache: 'no-store' to prevent Next.js from caching a failed request
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NexusGameBoard/1.0 (nexus@example.com)'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`CheapShark API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      let imgUrl = data[0].thumb;

      if (imgUrl) {
        // Force HTTPS. Handle both '//' protocols and explicit 'http://' protocols
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('http://')) {
          imgUrl = imgUrl.replace(/^http:\/\//i, 'https://');
        }
        return imgUrl;
      }
    }
  } catch (error) {
    console.error("Error fetching from CheapShark:", error);
  }

  return null;
}

// --- Database Mutations ---
// DECODE the cookie for language safety
export async function addOrUpdateGame(title: string, achievementsText: string, imageUrl: string) {
  const cookieStore = await cookies();
  const rawUsername = cookieStore.get('nexus_user')?.value;

  if (!rawUsername) {
    return { success: false, error: "Not logged in." };
  }

  // Decode the URL-safe string back into readable Arabic text
  const username = decodeURIComponent(rawUsername);

  // Normalize title spacing
  const cleanTitle = title.replace(/\s+/g, ' ').trim();

  // Parse achievements from textarea (split by newline, remove empty lines)
  const newAchievements = achievementsText
    .split('\n')
    .map(a => a.trim())
    .filter(a => a !== '');

  if (newAchievements.length === 0) return { error: "No achievements provided" };

  try {
    // Check if the game already exists (exact match)
    const existingGame = await prisma.game.findUnique({
      where: { title: cleanTitle }
    });

    if (existingGame) {
      // GAME EXISTS: Merge the new achievements
      await prisma.achievement.createMany({
        data: newAchievements.map(name => ({
          name,
          completed: false,
          gameId: existingGame.id
        }))
      });

      // Update image if a new one was found and the game didn't have one
      if (imageUrl && !existingGame.imageUrl) {
        await prisma.game.update({
          where: { id: existingGame.id },
          data: { imageUrl }
        });
      }
    } else {
      // BRAND NEW GAME: Insert normally
      await prisma.game.create({
        data: {
          title: cleanTitle,
          imageUrl: imageUrl || null,
          username,
          achievements: {
            create: newAchievements.map(name => ({
              name,
              completed: false
            }))
          }
        }
      });
    }

    // Refresh the server component data automatically
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to save game data" };
  }
}

export async function deleteGame(id: number) {
  try {
    await prisma.game.delete({
      where: { id }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Failed to delete game" };
  }
}

export async function toggleAchievement(id: number, currentStatus: boolean) {
  try {
    await prisma.achievement.update({
      where: { id },
      data: { completed: !currentStatus }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "Failed to update achievement" };
  }
}

// --- AI Chat System Instruction ---
const CHAT_SYSTEM_INSTRUCTION = `You are a strict video game assistant. Your sole purpose is to discuss video games, achievements, roadmaps, and gaming strategies.

CRITICAL GUARDRAIL: You MUST NOT answer questions outside the domain of video games (e.g., cooking recipes, politics, general trivia, coding). If a user asks a non-gaming question in ANY language (including Arabic, English, etc.), you must politely decline and state that you are a Nexus Board assistant focused exclusively on gaming.

OUTPUT FORMAT INSTRUCTIONS:
- Directly answer the user without printing any internal reasoning, scratchpad, analysis, or step-by-step thinking steps (do NOT write "1. Analyze the Request", "2. Information Retrieval", etc.).
- When the user asks for achievements, a roadmap, or tasks to complete a game, you MUST include the actual tasks as a strict JSON array of strings enclosed in a markdown JSON block at the very end of your response.
- The JSON array MUST contain ONLY plain strings representing each task/achievement. Do NOT use JSON objects or key-value pairs.

Example format:
Here are the achievements for the game:
\`\`\`json
["Lending a Hand: Complete all optional Honor story missions", "Friends With Benefits: Complete a companion activity in camp", "It Was THIS Big!: Catch a fish weighing at least 19 lbs"]
\`\`\``;

// Fireworks AI fallback using DeepSeek V4 Flash model
async function callFireworksAI(userMessage: string, history: { role: string; content: string }[]) {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new Error("FIREWORKS_API_KEY environment variable is not set.");
  }

  const messages = [
    { role: 'system', content: CHAT_SYSTEM_INSTRUCTION },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'accounts/fireworks/models/deepseek-v4-flash',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    }),
    cache: 'no-store'
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401 || res.status === 404) {
      throw new Error(`Invalid or unauthorized Fireworks API Key (HTTP ${res.status}). Please check FIREWORKS_API_KEY in .env.`);
    }
    throw new Error(`Fireworks API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Fireworks API returned empty response.");
  }

  return content;
}

// --- Gemini AI Chat Action with Fireworks Fallback ---
export async function sendChatMessage(userMessage: string, history: { role: string, content: string }[]) {
  if (!userMessage) return { error: "Message is required" };

  // 1. Try Gemini API if key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite',
        config: {
          systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        },
        history: formattedHistory
      });

      const response = await chat.sendMessage({ message: userMessage });
      if (response.text) {
        return { reply: response.text };
      }
    } catch (geminiError) {
      console.warn("Gemini API call failed, falling back to Fireworks AI:", geminiError);
    }
  }

  // 2. Fallback to Fireworks AI
  try {
    const reply = await callFireworksAI(userMessage, history);
    return { reply };
  } catch (fireworksError: unknown) {
    console.error("Fireworks AI Error:", fireworksError);
    const errorMessage = fireworksError instanceof Error ? fireworksError.message : "Failed to connect to the AI services.";
    return { error: errorMessage };
  }
}


export async function getTrendingGames(): Promise<string[]> {
  try {
    // Fetch top 100 played games in the last 2 weeks (Zero auth required)
    const res = await fetch('https://steamspy.com/api.php?request=top100in2weeks', {
      next: { revalidate: 86400 } // Cache for 24 hour to prevent API spam
    });

    if (!res.ok) return [];

    const data = await res.json();

    // SteamSpy returns an object with AppIDs as keys, so we convert to an array
    const gamesArray = Object.values(data) as { name: string }[];

    // Shuffle the array and pick the top 4
    const shuffled = gamesArray.sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 4).map(game => game.name);

    return suggestions;
  } catch (error) {
    console.error("Error fetching trending games:", error);
    // Silent fallback if API fails
    return ['Elden Ring', 'Cyberpunk 2077', 'Helldivers 2', 'Baldur\'s Gate 3'];
  }
}