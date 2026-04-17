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
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
      let imgUrl = data[0].thumb;
      // FIX: CheapShark sometimes forgets the 'https:' part of the UR
      if (imgUrl && imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      }
      return imgUrl;
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