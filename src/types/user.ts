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
 * School group (NRE) information
 */
export interface SchoolGroup {
  id: string;
  name: string;
  code: string | null;
}

/**
 * User institution relationship (one enrollment row).
 *
 * Every nested entity is nullable: a GENERAL_MANAGER has no school, a teacher
 * bound to a school but not to a class has no class, and so on.
 */
export interface UserInstitution {
  profile: Profile;
  institution: Institution | null;
  school: School | null;
  schoolGroup: SchoolGroup | null;
  schoolYear: SchoolYear | null;
  class: Class | null;
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
 * Identity carried by GET /auth/me. Narrower than {@link User}: the endpoint
 * only returns what is needed to render the logged-in user.
 */
export interface AccessUser {
  id: string;
  name: string;
  email: string;
  urlProfilePicture: string | null;
}

/**
 * Institution the user may read
 */
export interface AccessInstitution {
  id: string;
  name: string;
}

/**
 * School the user may read
 */
export interface AccessSchool {
  id: string;
  name: string;
  institutionId: string;
}

/**
 * School year the user may read
 */
export interface AccessSchoolYear {
  id: string;
  name: string;
  schoolId: string;
  school: School;
}

/**
 * Class the user may read
 */
export interface AccessClass {
  id: string;
  name: string;
  shift: string;
  schoolId: string;
  schoolYearId: string;
  school: School;
  schoolYear: SchoolYear;
}

/**
 * Payload of GET /auth/me, already unwrapped from the `{ message, data }`
 * envelope by the user store.
 *
 * The flat lists (`institutions` / `schools` / `schoolYears` / `classes`)
 * answer "what may I read" and are the right source for access filters. The
 * `userInstitutions` rows answer "how am I enrolled" and keep the
 * school -> grade -> class relation of each enrollment.
 */
export interface MyDataResponse {
  user: AccessUser;
  institutions: AccessInstitution[];
  schools: AccessSchool[];
  schoolYears: AccessSchoolYear[];
  classes: AccessClass[];
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
