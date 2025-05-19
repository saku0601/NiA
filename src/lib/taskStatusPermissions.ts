import { TaskStatus, UserRole } from '@prisma/client';

// デフォルトのステータス遷移ルール
const defaultStatusTransitions = [
  // assignee（担当者）は作業関連のステータス遷移のみ許可
  {
    fromStatus: 'accepted',
    toStatus: 'inProgress',
    allowedRoles: ['assignee'],
  },
  {
    fromStatus: 'inProgress',
    toStatus: 'completed',
    allowedRoles: ['assignee'],
  },
  // requester（依頼者）はキャンセルのみ許可
  {
    fromStatus: 'pending',
    toStatus: 'cancelled',
    allowedRoles: ['requester'],
  },
];

// ステータス遷移が許可されているかチェック
export function isStatusTransitionAllowed(
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
  userRole: UserRole
): boolean {
  const transition = defaultStatusTransitions.find(
    (t) => t.fromStatus === fromStatus && t.toStatus === toStatus
  );
  if (!transition) return false;
  return transition.allowedRoles.includes(userRole);
}

// ユーザーが実行可能なステータス遷移を取得
export function getAllowedStatusTransitions(
  currentStatus: TaskStatus,
  userRole: UserRole
): TaskStatus[] {
  return defaultStatusTransitions
    .filter((t) => t.fromStatus === currentStatus && t.allowedRoles.includes(userRole))
    .map((t) => t.toStatus as TaskStatus);
} 