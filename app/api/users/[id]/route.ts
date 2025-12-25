import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Habit from '@/models/Habit';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Auth check (optional for public? let's require login)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token || !await verifyJWT(token)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(id).select('username wins createdAt');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get public habits (assuming all are public for this MVP, or add isPrivate later)
    const habits = await Habit.find({ userId: id }).sort({ createdAt: -1 });

    return NextResponse.json({ user, habits });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
