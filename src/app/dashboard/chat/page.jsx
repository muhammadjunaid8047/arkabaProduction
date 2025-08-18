'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ text: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (pageNum = 1) => {
    setLoading(true);
    const res = await fetch(`/api/message?page=${pageNum}&limit=10`);
    const data = await res.json();
    if (data.messages.length < 10) setHasMore(false);
    setMessages((prev) => [...data.messages, ...prev]); // Append older at top
    setLoading(false);
  };

  useEffect(() => {
    loadMessages(page);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMessages(nextPage);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/message/${id}`, { method: 'DELETE' });
    setMessages(messages.filter((m) => m._id !== id));
  };

  const handleEdit = (message) => {
    setEditId(message._id);
    setEditData({ text: message.text });
  };

  const handleSave = async () => {
    const res = await fetch(`/api/message/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    const updated = await res.json();
    setMessages(messages.map((m) => (m._id === editId ? updated.message : m)));
    setEditId(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Chat Management</h1>
      <p className="text-gray-600 mt-2 mb-6">View, edit, or delete user messages.</p>

     

      <div className="space-y-4">
        {[...messages].reverse().map((msg) => (
          <div key={msg._id} className="border p-4 rounded shadow flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs text-gray-400">
                <span className="font-medium text-gray-800">
                  {msg.fullName || 'Anonymous'}
                </span>{' '}
                • {msg.email || 'No Email'} •{' '}
                {new Date(msg.createdAt).toLocaleString()}
              </p>
              {editId === msg._id ? (
                <Textarea
                  value={editData.text}
                  onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                  className="mt-2"
                />
              ) : (
                <p className="text-sm mt-2">{msg.text}</p>
              )}
            </div>
            <div className="ml-4 space-x-2">
              {editId === msg._id ? (
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handleEdit(msg)}>
                  Edit
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(msg._id)}>
                Delete
              </Button>
            </div>
            
          </div>
          
        ))}
         {hasMore && (
        <Button onClick={loadMore} disabled={loading} className="mb-4">
          {loading ? 'Loading...' : 'Load older messages'}
        </Button>
      )}
      </div>
    </div>
  );
}
