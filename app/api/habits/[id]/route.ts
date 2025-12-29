import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import User from '@/models/User'; // Import User to update wins
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const habit = await Habit.findOne({ _id: id })
        .populate('userId', 'username wins avatarEmoji avatarColor')
        .populate('sharedWith', 'username wins avatarEmoji avatarColor')
        .populate({ path: 'chat.sender', select: 'username avatarEmoji avatarColor', strictPopulate: false })
        .populate({ path: 'billboard.userId', select: 'username avatarEmoji avatarColor', strictPopulate: false });

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    // PROACTIVE RESET: If date is not today, reset it
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().split('T')[0];
    const progressDate = habit.dailyProgress?.date ? new Date(habit.dailyProgress.date).toISOString().split('T')[0] : null;

    if (!progressDate || progressDate !== todayIso) {
        console.log(`[Proactive Reset Single] Resetting habit ${habit._id} for new day ${todayIso}`);
        habit.dailyProgress = {
            date: today,
            completedBy: []
        };
        await habit.save();
    }

    // Check access
    const isOwner = habit.userId._id.toString() === user.userId;
    const isShared = habit.sharedWith.some((u: any) => u._id.toString() === user.userId);
    
    console.log(`[GET Habit] ID: ${id}, User: ${user.userId}, Owner: ${habit.userId._id}, Shared: ${isShared}`);

    if (!isOwner && !isShared) {
        console.log('[GET Habit] Unauthorized access attempt');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const habit = await Habit.findOneAndDelete({ _id: id, userId: user.userId });

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Habit deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await params;
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      const user = token ? await verifyJWT(token) : null;
  
      if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const body = await req.json();
      const { action, targetUsername } = body;
  
      await dbConnect();
      const habit = await Habit.findOne({ _id: id });
  
      if (!habit) {
        return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
      }

      // Check access
      if (habit.userId.toString() !== user.userId && !habit.sharedWith.includes(user.userId)) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
  
      if (action === 'complete') {
        // Calculate unique total members
        const uniqueMembers = new Set([habit.userId.toString(), ...habit.sharedWith.map((id: any) => id.toString())]);
        const totalMembers = uniqueMembers.size;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString().split('T')[0];

        // Initialize or Reset Daily Progress if new day
        const progressDate = habit.dailyProgress?.date ? new Date(habit.dailyProgress.date).toISOString().split('T')[0] : null;

        if (!progressDate || progressDate !== todayIso) {
            console.log(`[Reset] Daily progress reset for ${habit._id}. Old: ${progressDate}, New: ${todayIso}`);
            habit.dailyProgress = {
                date: today,
                completedBy: []
            };
        }

        // Check if user already marked today
        const userAlreadyCompleted = habit.dailyProgress.completedBy.some((id: any) => id.toString() === user.userId);
        
        if (userAlreadyCompleted) {
            // UNMARK / UNDO
            habit.dailyProgress.completedBy = habit.dailyProgress.completedBy.filter((id: any) => id.toString() !== user.userId);
            
            // Remove today from completedDates
            habit.completedDates = habit.completedDates.filter((d: any) => {
                const dateStr = typeof d === 'string' ? d : new Date(d).toISOString().split('T')[0];
                return dateStr !== todayIso;
            });
            
            // Recalculate streak more safely (optional but better)
            // For now just decrement if it was pushed
            if (habit.streak > 0) habit.streak -= 1;

            await habit.save();
            await User.findByIdAndUpdate(user.userId, { $inc: { wins: -1 } });
            console.log(`[Undo] User: ${user.userId} undid completion for ${habit._id}. Progress now: ${habit.dailyProgress.completedBy.length}/${totalMembers}`);
        } else {
            // MARK COMPLETE
            habit.dailyProgress.completedBy.push(user.userId);
            
            console.log(`[Complete] User: ${user.userId} marked ${habit._id}. Progress: ${habit.dailyProgress.completedBy.length}/${totalMembers}`);

            // If ALL members completed, increment streak and push to completedDates
            if (habit.dailyProgress.completedBy.length >= totalMembers) {
                const alreadyRecorded = habit.completedDates.some((d: any) => {
                    const dateStr = typeof d === 'string' ? d : new Date(d).toISOString().split('T')[0];
                    return dateStr === todayIso;
                });

                if (!alreadyRecorded) {
                    console.log(`[Complete] Team fully completed ${habit._id}! Pushing date ${todayIso}`);
                    habit.completedDates.push(todayIso);
                    habit.streak += 1;
                }
            }
            
            await habit.save();
            await User.findByIdAndUpdate(user.userId, { $inc: { wins: 1 } });
        }
      } else if (action === 'chat') {
          const { message } = body;
          console.log(`[API Chat] Received message from ${user.userId}: ${message}`);
          
          if (!habit.chat) {
              console.log('[API Chat] Initializing chat array');
              habit.chat = [];
          }
          
          habit.chat.push({
              sender: user.userId,
              message
          });
          
          const saved = await habit.save();
          console.log('[API Chat] Message saved. Chat length:', saved.chat.length);
      } else if (action === 'share') {
          console.log('Sharing with:', targetUsername);
          const targetUser = await User.findOne({ username: targetUsername });
          if (!targetUser) {
              return NextResponse.json({ message: 'User not found' }, { status: 404 });
          }
          if (!habit.sharedWith.includes(targetUser._id)) {
              habit.sharedWith.push(targetUser._id);
              await habit.save();
          }
      } else if (action === 'capsule') {
          const { text } = body;
          if (!text) return NextResponse.json({ message: 'Text is required' }, { status: 400 });

          if (!habit.timeCapsule) habit.timeCapsule = { messages: [], unlockStreak: 30 };
          
          // Check if user already has a message
          const existingIndex = habit.timeCapsule.messages.findIndex((m: any) => m.userId.toString() === user.userId);
          
          if (existingIndex > -1) {
              habit.timeCapsule.messages[existingIndex].text = text;
              habit.timeCapsule.messages[existingIndex].createdAt = new Date();
          } else {
              habit.timeCapsule.messages.push({
                  userId: user.userId,
                  text,
                  createdAt: new Date()
              });
          }
          await habit.save();
      } else if (action === 'billboard') {
          const { text, color } = body;
          if (!text) return NextResponse.json({ message: 'Text is required' }, { status: 400 });

          if (!habit.billboard) habit.billboard = [];
          
          habit.billboard.push({
              userId: user.userId,
              text,
              color: color || 'yellow',
              createdAt: new Date()
          });

          // Keep only last 10 notes to keep board clean
          if (habit.billboard.length > 10) {
              habit.billboard = habit.billboard.slice(-10);
          }

          await habit.save();
      }
  
      return NextResponse.json({ habit });
    } catch (error) {
        console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
