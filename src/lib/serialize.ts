import type { CampusDTO, Category, ItemDTO, MemberDTO, Status, WeeklyReportDTO } from "@/lib/types";

type PrismaItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  assignee: string | null;
  dueDate: Date | null;
  meetingWeek: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { comments: number };
};

export function serializeItem(item: PrismaItem): ItemDTO {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category as Category,
    status: item.status as Status,
    assignee: item.assignee,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    meetingWeek: item.meetingWeek ? item.meetingWeek.toISOString() : null,
    createdBy: item.createdBy,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    _count: item._count,
  };
}

export function serializeMember(member: { id: string; name: string; createdAt: Date }): MemberDTO {
  return {
    id: member.id,
    name: member.name,
    createdAt: member.createdAt.toISOString(),
  };
}

export function serializeCampus(campus: { id: string; name: string; createdAt: Date }): CampusDTO {
  return {
    id: campus.id,
    name: campus.name,
    createdAt: campus.createdAt.toISOString(),
  };
}

type PrismaWeeklyReport = {
  meetingWeek: Date;
  campusId: string | null;
  targetBySummer: number | null;
  currentCount: number | null;
  trialCount: number | null;
  concreteActions: string | null;
  internalActions: string | null;
};

export function serializeWeeklyReport(
  report: PrismaWeeklyReport,
  meetingWeek: Date,
  isDraft: boolean
): WeeklyReportDTO {
  return {
    meetingWeek: meetingWeek.toISOString(),
    campusId: report.campusId,
    targetBySummer: report.targetBySummer,
    currentCount: report.currentCount,
    trialCount: report.trialCount,
    concreteActions: report.concreteActions,
    internalActions: report.internalActions,
    isDraft,
  };
}
