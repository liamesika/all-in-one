'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  FolderKanban,
  CheckSquare,
  Users
} from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
}

export function ProductionsHeader({ userName = 'User', userAvatar }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard/production/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">P</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Productions</span>
            </Link>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-2xl mx-6 hidden md:block">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, tasks, clients... (Ctrl + K)"
                className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                onFocus={() => setShowSearch(true)}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Create Button */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 px-4 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </button>

              <AnimatePresence>
                {showCreateMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCreateMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          href="/dashboard/production/projects?new=true"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <FolderKanban size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">New Project</div>
                            <div className="text-xs text-gray-500">Create a new project</div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/production/dashboard?newTask=true"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <CheckSquare size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">New Task</div>
                            <div className="text-xs text-gray-500">Add a quick task</div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/production/company?newClient=true"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <Users size={16} className="text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">New Client</div>
                            <div className="text-xs text-gray-500">Add a client</div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="font-semibold text-gray-900">Notifications</div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-900 font-medium">Project deadline approaching</div>
                              <div className="text-xs text-gray-500 mt-1">Tech Conference 2024 - Due in 3 days</div>
                              <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 text-center text-sm text-gray-500">
                          No more notifications
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-gray-900">{userName}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="font-medium text-gray-900">{userName}</div>
                        <div className="text-xs text-gray-500 mt-1">Production Manager</div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard/production/team"
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/production/dashboard?settings=true"
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <button
                          onClick={() => {/* Handle logout */}}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
