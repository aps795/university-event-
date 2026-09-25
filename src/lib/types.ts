export type UserRole = "STUDENT" | "ORGANIZER" | "ADMIN";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentNumber?: string | null;
  course?: string | null;
  department?: string | null;
  semester?: string | null;
  phone?: string | null;
}

export interface DepartmentItem {
  id: string;
  name: string;
  school: string;
  description?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string | null;
  departmentId: string;
  organizerId: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  maxParticipants: number;
  eligibility?: string | null;
  rules?: string | null;
  speakerGuest?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  requiredDocuments?: string | null;
  posterUrl?: string | null;
  status: string;
  isFeatured: boolean;
  isPast: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  department?: DepartmentItem;
  organizer?: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
  };
  _count?: {
    registrations: number;
    attendance: number;
  };
}

export interface RegistrationItem {
  id: string;
  eventId: string;
  studentId: string;
  registrationId: string;
  qrCode: string;
  status: string;
  registeredAt: string | Date;
  notes?: string | null;
  event: EventItem;
  student?: {
    id: string;
    name: string;
    email: string;
    enrollmentNumber?: string | null;
    course?: string | null;
    department?: string | null;
    semester?: string | null;
    phone?: string | null;
  };
  attendance?: {
    id: string;
    checkInTime: string | Date;
    status: string;
  }[];
}

export interface CertificateItem {
  id: string;
  eventId: string;
  studentId: string;
  certificateId: string;
  certificateUrl?: string | null;
  issuedAt: string | Date;
  event: EventItem;
  student: {
    id: string;
    name: string;
    enrollmentNumber?: string | null;
    course?: string | null;
    department?: string | null;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ALERT";
  readStatus: boolean;
  link?: string | null;
  createdAt: string | Date;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  timestamp: string | Date;
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}
