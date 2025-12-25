import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { text } = await req.json();
    
    // Add new task
    const user = await User.findById(payload.userId);
    user.dailyPlan.push({ text, completed: false });
    await user.save();

    return NextResponse.json({ dailyPlan: user.dailyPlan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const { taskId } = await req.json();

    const user = await User.findById(payload.userId);
    const task = user.dailyPlan.id(taskId);
    if (task) {
        task.completed = !task.completed;
        await user.save();
    }

    return NextResponse.json({ dailyPlan: user.dailyPlan });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      await dbConnect();
      const cookieStore = await cookies();
      const token = cookieStore.get('token');
  
      if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const payload = await verifyJWT(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
      const { taskId } = await req.json();
  
      const user = await User.findById(payload.userId);
      user.dailyPlan.pull({ _id: taskId });
      await user.save();
  
      return NextResponse.json({ dailyPlan: user.dailyPlan });
    } catch (error) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
  }
