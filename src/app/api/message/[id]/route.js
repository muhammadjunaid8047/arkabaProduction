import { connect } from '@/lib/mongodb/mongoose';
import Message from '@/lib/models/Message';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await connect();
  const body = await req.json();
  const updated = await Message.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ message: updated });
}

export async function DELETE(req, { params }) {
  await connect();
  await Message.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
