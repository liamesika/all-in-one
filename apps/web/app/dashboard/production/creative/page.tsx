// apps/web/app/dashboard/production/creative/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CreativeProject {
  id: string;
  name: string;
  status: string;
  objective?: string;
  dueDate?: string;
  _count?: {
    tasks: number;
    assets: number;
    renders: number;
    reviews: number;
  };
}

export default function CreativeProductionsPage() {
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/creative-projects');
      // const data = await response.json();
      // setProjects(data);

      // Mock data for now
      setProjects([
        {
          id: '1',
          name: 'Summer Campaign 2025',
          status: 'IN_PROGRESS',
          objective: 'Create social media content for summer product launch',
          _count: { tasks: 5, assets: 12, renders: 3, reviews: 2 },
        },
        {
          id: '2',
          name: 'Product Demo Video',
          status: 'DRAFT',
          objective: 'Professional demo video for landing page',
          _count: { tasks: 3, assets: 8, renders: 1, reviews: 0 },
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Creative Productions
            </h1>
            <p className="mt-2 text-gray-600">
              Manage video and ad production projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Projects</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {projects.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">In Progress</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {projects.filter(p => p.status === 'IN_PROGRESS').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Assets</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {projects.reduce((sum, p) => sum + (p._count?.assets || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Renders</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {projects.reduce((sum, p) => sum + (p._count?.renders || 0), 0)}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {projects.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No projects yet. Create your first project to get started!
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {project.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          project.status,
                        )}`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {project.objective && (
                      <p className="mt-1 text-sm text-gray-600">
                        {project.objective}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span>📋 {project._count?.tasks || 0} tasks</span>
                      <span>🎨 {project._count?.assets || 0} assets</span>
                      <span>🎬 {project._count?.renders || 0} renders</span>
                      <span>✅ {project._count?.reviews || 0} reviews</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/production/creative/${project.id}`}
                    className="ml-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feature Flag Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Phase 11: Productions Production Mode
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Full data-driven workflow with internal usage tracking. This is a feature-complete implementation
              without billing logic.
            </p>
          </div>
        </div>
      </div>

      {/* Create Project Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Project
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Project creation form will be implemented in the next iteration.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
