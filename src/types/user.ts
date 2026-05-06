/**
 * User information from backend API
 */
export interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Additional user information and profile data
 */
export interface UserInfos {
  id: string;
  userId: string;
  urlProfilePicture: string | null;
  genre: string | null;
  facebook: string | null;
  instagram: string | null;
  studentNumber: string | null;
  street: string | null;
  streetNumber: string | null;
  neighborhood: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  timeSpent: number;
  lastInteraction: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User institution profile information
 */
export interface Profile {
  id: string;
  name: string;
  description: string;
  position: number;
}

/**
 * Institution information
 */
export interface Institution {
  id: string;
  name: string;
  type: string;
}

/**
 * School information
 */
export interface School {
  id: string;
  name: string;
}

/**
 * School year information
 */
export interface SchoolYear {
  id: string;
  name: string;
}

/**
 * Class information
 */
export interface Class {
  id: string;
  name: string;
}

/**
 * User institution relationship
 */
export interface UserInstitution {
  profile: Profile;
  institution: Institution;
  school: School;
  schoolYear: SchoolYear;
  class: Class;
}

/**
 * Subject information
 */
export interface Subject {
  id: string;
  name: string;
}

/**
 * Subject teacher topic class relationship
 */
export interface SubTeacherTopicClass {
  subject: Subject;
  class: Class;
}

/**
 * Complete user data response from GET /auth/me endpoint
 */
export interface MyDataResponse {
  message: string;
  user: User;
  userInfos: UserInfos;
  userInstitutions: UserInstitution[];
  subTeacherTopicClasses: SubTeacherTopicClass[];
}

/**
 * Update user data request body for PATCH /user/me endpoint
 */
export interface UpdateMyDataRequest {
  name: string;
  email: string;
  urlProfilePicture?: string;
  genre?: string;
  facebook?: string;
  instagram?: string;
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * User telemetry data for student performance analytics
 */
export interface UserTelemetryData {
  timeSpent: number;
  lastInteraction: string | null;
  accessCount: number;
}

/**
 * Response from GET /user/:userId endpoint for student details
 */
export interface StudentDetailsResponse {
  message: string;
  data: {
    user: User;
    userInfos: UserInfos;
    userInstitutions: UserInstitution[];
    teacherTopicClasses: SubTeacherTopicClass[];
    userDependents: unknown[];
    telemetry: UserTelemetryData | null;
  };
}
