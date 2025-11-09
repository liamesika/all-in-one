'use client';

import { useState } from 'react';
import { X, Send, Trash, Edit, Paperclip } from 'lucide-react';

interface TaskDetailPanelProps {
  task: any;
  agents: any[];
  onClose: () => void;
  onTaskUpdate: (task: any) => void;
  onTaskDelete: (id: string) => void;
}

export default function TaskDetailPanel({ task, agents, onClose, onTaskUpdate, onTaskDelete }: TaskDetailPanelProps) {
  const [progress, setProgress] = useState(task.progress || 0);
  const [sending, setSending] = useState(false);

  const handleProgressUpdate = async (newProgress: number) => {
    setProgress(newProgress);
    try {
      const response = await fetch('/api/real-estate/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, progress: newProgress }),
      });
      if (response.ok) {
        const { task: updated } = await response.json();
        onTaskUpdate(updated);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleSendReminder = async () => {
    setSending(true);
    try {
      await fetch(`/api/real-estate/tasks/${task.id}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Reminder for task: ${task.title}` }),
      });
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await fetch(`/api/real-estate/tasks?id=${task.id}`, { method: 'DELETE' });
      onTaskDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-[#1A2F4B] border-l border-gray-200 dark:border-[#2979FF]/20 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{task.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {task.priority}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {task.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {task.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Progress ({progress}%)</h3>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-[#2979FF] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {task.assignees?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Assigned To</h3>
            <div className="space-y-2">
              {task.assignees.map((a: any) => (
                <div key={a.agentId} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0E1A2B] rounded">
                  <div className="w-8 h-8 rounded-full bg-[#2979FF] text-white flex items-center justify-center">
                    {a.agent?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{a.agent?.name}</div>
                    <div className="text-xs text-gray-500">{a.agent?.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.dueDate && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Due Date</h3>
            <p className="text-sm">{new Date(task.dueDate).toLocaleString()}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSendReminder}
            disabled={sending}
            className="flex-1 px-4 py-2 bg-[#2979FF] text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Reminder
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
