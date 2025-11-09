'use client';

import { useState } from 'react';
import { X, Plus, Edit, Trash } from 'lucide-react';

interface AgentsPanelProps {
  agents: any[];
  onClose: () => void;
  onAgentsChange: () => void;
}

export default function AgentsPanel({ agents, onClose, onAgentsChange }: AgentsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'AGENT' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/real-estate/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ name: '', email: '', phone: '', role: 'AGENT' });
        setShowForm(false);
        onAgentsChange();
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-[#1A2F4B] border-l border-gray-200 dark:border-[#2979FF]/20 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Agents</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-4 px-4 py-2 bg-[#2979FF] text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 dark:bg-[#0E1A2B] rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
            <button type="submit" className="w-full px-4 py-2 bg-[#2979FF] text-white rounded-lg">
              Create
            </button>
          </form>
        )}

        <div className="space-y-2">
          {agents.map((agent) => (
            <div key={agent.id} className="p-4 bg-gray-50 dark:bg-[#0E1A2B] rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{agent.email}</p>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                    {agent.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {agent._count?.assignedTasks || 0} tasks
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
