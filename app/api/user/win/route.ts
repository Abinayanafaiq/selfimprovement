import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a date string for today (YYYY-MM-DD) to avoid duplicate wins in the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today is already in completedDays
    const alreadyWon = user.completedDays.some((d: Date) => {
        const date = new Date(d);
        date.setHours(0,0,0,0);
        return date.getTime() === today.getTime();
    });

    if (alreadyWon) {
        return NextResponse.json({ message: 'Daily win already secured', completedDays: user.completedDays });
    }

    user.completedDays.push(today);
    user.wins += 1;
    await user.save();

    return NextResponse.json({ message: 'Daily win secured!', completedDays: user.completedDays, wins: user.wins });
  } catch (error: any) {
    console.error('Error securing daily win:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
