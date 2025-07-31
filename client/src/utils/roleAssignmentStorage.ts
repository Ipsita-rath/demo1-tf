const sessionCounts: Record<string, number> = {};

export function resetSessionRoleCount(subscriptionId: string) {
  sessionCounts[subscriptionId] = 0;
}

export function getRoleAssignmentCount(subscriptionId: string): number {
  return sessionCounts[subscriptionId] || 0;
}

export function incrementRoleAssignmentCount(subscriptionId: string): number {
  sessionCounts[subscriptionId] = (sessionCounts[subscriptionId] || 0) + 1;
  return sessionCounts[subscriptionId];
}


