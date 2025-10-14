'use client';

import { MembershipRole, FeatureAccess } from '@prisma/client';
import { ROLE_PERMISSIONS, PERMISSION_DESCRIPTIONS } from '@/config/permissions';
import { Check, X } from 'lucide-react';

const ROLE_DISPLAY_ORDER: MembershipRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'];

const PERMISSION_CATEGORIES = {
  'Leads Management': [
    'LEADS_READ',
    'LEADS_WRITE',
    'LEADS_DELETE',
    'LEADS_EXPORT',
    'LEADS_BULK_ACTIONS',
    'LEADS_ASSIGN',
  ] as FeatureAccess[],
  'Properties': [
    'PROPERTIES_READ',
    'PROPERTIES_WRITE',
    'PROPERTIES_DELETE',
    'PROPERTIES_PUBLISH',
    'PROPERTIES_ASSIGN_AGENT',
    'PROPERTIES_IMPORT',
  ] as FeatureAccess[],
  'Campaigns': [
    'CAMPAIGNS_READ',
    'CAMPAIGNS_WRITE',
    'CAMPAIGNS_DELETE',
    'CAMPAIGNS_ACTIVATE',
    'CAMPAIGNS_VIEW_ANALYTICS',
    'CAMPAIGNS_MANAGE_BUDGET',
  ] as FeatureAccess[],
  'Automations': [
    'AUTOMATIONS_READ',
    'AUTOMATIONS_WRITE',
    'AUTOMATIONS_DELETE',
    'AUTOMATIONS_EXECUTE',
  ] as FeatureAccess[],
  'Integrations': [
    'INTEGRATIONS_READ',
    'INTEGRATIONS_WRITE',
    'INTEGRATIONS_DELETE',
    'INTEGRATIONS_SYNC',
  ] as FeatureAccess[],
  'Reports': [
    'REPORTS_VIEW_BASIC',
    'REPORTS_VIEW_ADVANCED',
    'REPORTS_EXPORT',
    'REPORTS_SCHEDULE',
    'REPORTS_CUSTOM',
  ] as FeatureAccess[],
  'Organization': [
    'ORG_SETTINGS',
    'ORG_BILLING',
    'ORG_MEMBERS_READ',
    'ORG_MEMBERS_WRITE',
    'ORG_MEMBERS_DELETE',
    'ORG_INVITE_MEMBERS',
  ] as FeatureAccess[],
  'Advanced Features': [
    'API_ACCESS',
    'WHITE_LABEL',
    'CUSTOM_INTEGRATIONS',
    'DEDICATED_SUPPORT',
    'BULK_OPERATIONS',
    'ADVANCED_ANALYTICS',
  ] as FeatureAccess[],
};

interface PermissionMatrixProps {
  highlightRole?: MembershipRole;
  compact?: boolean;
}

export function PermissionMatrix({ highlightRole, compact = false }: PermissionMatrixProps) {
  const hasPermission = (role: MembershipRole, permission: FeatureAccess): boolean => {
    return ROLE_PERMISSIONS[role].includes(permission);
  };

  if (compact) {
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Permission
                </th>
                {ROLE_DISPLAY_ORDER.map((role) => (
                  <th
                    key={role}
                    className={`border border-gray-200 px-4 py-2 text-center text-xs font-medium ${
                      highlightRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                <>
                  <tr key={category} className="bg-gray-100">
                    <td
                      colSpan={ROLE_DISPLAY_ORDER.length + 1}
                      className="border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900"
                    >
                      {category}
                    </td>
                  </tr>
                  {permissions.map((permission) => (
                    <tr key={permission} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 text-xs text-gray-600">
                        {permission.replace(/_/g, ' ')}
                      </td>
                      {ROLE_DISPLAY_ORDER.map((role) => (
                        <td
                          key={role}
                          className={`border border-gray-200 text-center ${
                            highlightRole === role ? 'bg-blue-50' : ''
                          }`}
                        >
                          {hasPermission(role, permission) ? (
                            <Check className="mx-auto h-4 w-4 text-green-600" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-gray-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
        <div key={category}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">{category}</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Permission
                  </th>
                  {ROLE_DISPLAY_ORDER.map((role) => (
                    <th
                      key={role}
                      className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                        highlightRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-500'
                      }`}
                    >
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {permissions.map((permission) => (
                  <tr key={permission} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {permission.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </div>
                    </td>
                    {ROLE_DISPLAY_ORDER.map((role) => (
                      <td
                        key={role}
                        className={`px-6 py-4 text-center ${
                          highlightRole === role ? 'bg-blue-50' : ''
                        }`}
                      >
                        {hasPermission(role, permission) ? (
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <X className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
