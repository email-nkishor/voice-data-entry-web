export type CertificateType = 'achievement' | 'completion' | 'participation' | 'merit' | 'other';
export type CertificateStatus = 'draft' | 'issued' | 'revoked';
export type AwardCategory = 'academic' | 'sports' | 'attendance' | 'custom';
export type AwardStatus = 'recommended' | 'approved' | 'issued' | 'revoked';

export interface CertificateTemplate {
  id: number;
  organizationId: number;
  name: string;
  description: string | null;
  certificateType: CertificateType;
  templateUrl: string | null;
  isActive: boolean;
  createdBy: number | null;
  createdByName?: string | null;
  clientId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRecord {
  id: number;
  organizationId: number;
  studentId: number;
  studentName?: string | null;
  templateId: number | null;
  templateName?: string | null;
  certificateNumber: string;
  certificateType: CertificateType;
  title: string;
  description: string | null;
  issueDate: string;
  issuedBy: string;
  attachmentUrl: string | null;
  verificationCode: string | null;
  status: CertificateStatus;
  revokedAt?: string | null;
  revokeReason?: string | null;
  createdByName?: string | null;
  clientId?: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending';
}

export interface AwardRecord {
  id: number;
  organizationId: number;
  studentId: number;
  studentName?: string | null;
  category: AwardCategory;
  title: string;
  description: string | null;
  awardDate: string;
  issuedBy: string | null;
  attachmentUrl: string | null;
  certificateId: number | null;
  status: AwardStatus;
  recommendedByName?: string | null;
  verificationCode?: string | null;
  createdByName?: string | null;
  clientId?: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending';
}

export interface CertificateInput {
  studentId: number;
  templateId?: number | null;
  certificateType?: CertificateType;
  title: string;
  description?: string | null;
  issueDate: string;
  issuedBy: string;
  attachmentUrl?: string | null;
  status?: CertificateStatus;
  clientId?: number | null;
}

export interface AwardInput {
  studentId: number;
  category: AwardCategory;
  title: string;
  description?: string | null;
  awardDate: string;
  issuedBy?: string | null;
  attachmentUrl?: string | null;
  status?: AwardStatus;
  clientId?: number | null;
}

export interface StudentAchievementSummary {
  studentId: number;
  studentName: string;
  totalCertificates: number;
  totalAwards: number;
  certificatesByType: Record<string, number>;
  awardsByCategory: Record<string, number>;
  recentCertificates: CertificateRecord[];
  recentAwards: AwardRecord[];
}

export const CERTIFICATE_TYPES: CertificateType[] = ['achievement', 'completion', 'participation', 'merit', 'other'];
export const AWARD_CATEGORIES: AwardCategory[] = ['academic', 'sports', 'attendance', 'custom'];
