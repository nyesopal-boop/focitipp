import { prisma } from "@/lib/prisma";

export async function getUserSubscription(userId?: string) {
  if (!userId) return null;
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function isUserPro(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const sub = await getUserSubscription(userId);
  if (!sub || sub.status !== "active" || !sub.currentPeriodEnd) return false;
  return sub.currentPeriodEnd > new Date();
}

export function daysLeft(currentPeriodEnd?: Date | null) {
  if (!currentPeriodEnd) return 0;
  const ms = currentPeriodEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isPro(subscription?: { status: string; currentPeriodEnd?: Date | null } | null): boolean {
  if (!subscription || subscription.status !== 'active' || !subscription.currentPeriodEnd) {
    return false;
  }
  return subscription.currentPeriodEnd > new Date();
}