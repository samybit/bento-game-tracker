'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI } from '@google/genai';

// --- NEW AUTH ACTIONS ---
export async function loginUser(username: string) {
  const cookieStore = await cookies();
  // Store the username in a cookie for 1 year
  cookieStore.set('nexus_user', username.trim().toLowerCase(), { maxAge: 60 * 60 * 24 * 365 });
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

export async function addOrUpdateGame(title: string, achievementsText: string, imageUrl: string) {
  const cookieStore = await cookies();
  const username = cookieStore.get('nexus_user')?.value;

  if (!username) {
    return { success: false, error: "Not logged in." };
  }

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

// --- Gemini AI Chat Action ---
export async function sendChatMessage(userMessage: string, history: { role: string, content: string }[]) {
  if (!userMessage) return { error: "Message is required" };

  try {
    // Map the simple history array to the format expected by the SDK
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: `You are a helpful video game assistant. 
When a user asks for achievements, a roadmap, or tasks to complete a game, you must separate your general advice from the actual tasks. 
Provide your conversational advice and tips normally as text. 
However, you MUST include the actual tasks/achievements as a strict JSON array of strings enclosed in a markdown JSON block.
Example:
Some advice here.
\`\`\`json
["Complete the tutorial", "Defeat the first boss", "Reach level 10"]
\`\`\`
Do NOT include bullet points or markdown styling inside the JSON strings.`,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message: userMessage });

    return { reply: response.text };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { error: "Failed to connect to the AI." };
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