import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import User from '@/models/User'; // Import User to update wins
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

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
  
      const { action } = await req.json(); // action: 'complete'
  
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

        // Check if already completed today
        const completedToday = habit.completedDates.some((date: Date) => {
            const d = new Date(date);
            d.setHours(0,0,0,0);
            return d.getTime() === today.getTime();
        });

        if (!completedToday) {
            habit.completedDates.push(new Date());
            habit.streak += 1; // Simplistic streak logic
            await habit.save();

            // Update User Wins
            await User.findByIdAndUpdate(user.userId, { $inc: { wins: 1 } });
        }
      } else if (action === 'share') {
          const { targetUsername } = await req.json();
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
