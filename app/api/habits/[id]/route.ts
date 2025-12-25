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
        .populate('userId', 'username wins')
        .populate('sharedWith', 'username wins')
        .populate({ path: 'chat.sender', select: 'username', strictPopulate: false });

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Initialize or Reset Daily Progress if new day
        const progressDate = habit.dailyProgress?.date ? new Date(habit.dailyProgress.date) : null;
        if (progressDate) progressDate.setHours(0,0,0,0);

        if (!progressDate || progressDate.getTime() !== today.getTime()) {
            habit.dailyProgress = {
                date: today,
                completedBy: []
            };
        }

        // Check if user already marked today
        const userAlreadyCompleted = habit.dailyProgress.completedBy.some((id: any) => id.toString() === user.userId);
        
        if (!userAlreadyCompleted) {
            habit.dailyProgress.completedBy.push(user.userId);
            
            // Calculate total members (Owner + SharedWith)
            const totalMembers = 1 + habit.sharedWith.length;
            
            console.log(`[Complete] User: ${user.userId}, Completed: ${habit.dailyProgress.completedBy.length}/${totalMembers}`);

            // If ALL members completed, increment streak and push to completedDates
            if (habit.dailyProgress.completedBy.length >= totalMembers) {
                habit.completedDates.push(new Date());
                habit.streak += 1;
            }
            
            await habit.save();

            // Update User Wins (Keep individual wins? Yes, individual effort counts)
            await User.findByIdAndUpdate(user.userId, { $inc: { wins: 1 } });
        }
      } else if (action === 'chat') {
          const { message } = body;
          if (!habit.chat) habit.chat = [];
          habit.chat.push({
              sender: user.userId,
              message
          });
          await habit.save();
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
      }
  
      return NextResponse.json({ habit });
    } catch (error) {
        console.error(error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
