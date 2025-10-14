'use client';

import { useState } from 'react';
import { MembershipRole } from '@prisma/client';
import { UserPlus, MoreVertical, Trash2, Shield } from 'lucide-react';

interface Member {
  id: string;
  userId: string;
  role: MembershipRole;
  status: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  joinedAt: Date;
  invitedBy?: string;
}

interface MemberListProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: MembershipRole;
  onRoleChange: (memberId: string, newRole: MembershipRole) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onInviteMember: () => void;
}

const ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<MembershipRole, string> = {
  OWNER: 'Full access including billing',
  ADMIN: 'Full access except billing',
  MANAGER: 'Team management and operations',
  MEMBER: 'Standard user access',
  VIEWER: 'Read-only access',
};

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemoveMember,
  onInviteMember,
}: MemberListProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const canManageMembers = ['OWNER', 'ADMIN'].includes(currentUserRole);
  const canRemoveMembers = ['OWNER', 'ADMIN'].includes(currentUserRole);

  const handleRoleChange = async (memberId: string, newRole: MembershipRole) => {
    setLoading(memberId);
    try {
      await onRoleChange(memberId, newRole);
    } finally {
      setLoading(null);
      setSelectedMember(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setLoading(memberId);
    try {
      await onRemoveMember(memberId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600">{members.length} members</p>
        </div>
        {canManageMembers && (
          <button
            onClick={onInviteMember}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Joined
              </th>
              {canManageMembers && (
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isOwner = member.role === 'OWNER';

              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                        {member.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user.fullName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">(You)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {canManageMembers && !isOwner && !isCurrentUser ? (
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as MembershipRole)}
                          disabled={loading === member.id}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isOwner && <Shield className="h-4 w-4 text-yellow-500" />}
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {ROLE_LABELS[member.role]}
                        </span>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {ROLE_DESCRIPTIONS[member.role]}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'INVITED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  {canManageMembers && (
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {canRemoveMembers && !isOwner && !isCurrentUser && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading === member.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
