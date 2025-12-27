import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { db } from '../db/connection.ts';
import { habits, entries, habitTags } from '../db/schema.ts';
import { eq, and, desc, inArray } from 'drizzle-orm';

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx.insert(habits).values({
        userId: req.user.id,
        name,
        description,
        frequency,
        targetCount,
      }).returning();

      if (tagIds && tagIds.length > 0) {
      const habitTagsValue = tagIds.map((tagId: string) => ({
        habitId: newHabit.id,
        tagId,
      }));
      await tx.insert(habitTags).values(habitTagsValue);
      }

      return newHabit;
    });

    res.status(201).json({ message: 'Habit created successfully', habit: result });

  } catch (error) {
    console.error('Error creating habit', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

export const getHabits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    });

    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((tag) => tag.tag),
      habitTags: undefined,
    }));

    res.status(200).json({ habits: habitsWithTags });
  } catch (error) {
    console.error('Error getting habits', error);
    res.status(500).json({ error: 'Failed to get habits' });
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
        entries: {
          orderBy: [desc(entries.completionDate)],
          limit: 10, // Recent entries only
        },
      },
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    // Transform the data
    const habitWithTags = {
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }

    res.json({
      habit: habitWithTags,
    })
  } catch (error) {
    console.error('Get habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { tagIds, ...updates } = req.body;

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx.update(habits).set({
        ...updates,
        updatedAt: new Date(),
      }).where(and(eq(habits.id, id), eq(habits.userId, req.user.id))).returning();

      if(!updatedHabit) {
        return res.status(404).end();
      }

      if (tagIds !== undefined ) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, updatedHabit.id));

        if (tagIds.length > 0) {
          const habitTagsValue = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }));
          await tx.insert(habitTags).values(habitTagsValue);
        }
      }

      return updatedHabit;
    });

    res.status(200).json({ message: 'Habit updated successfully', habit: result });
  } catch (error) {
    console.error('Error updating habit', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    res.json({
      message: 'Habit deleted successfully',
    })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}
