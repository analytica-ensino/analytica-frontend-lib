import type {
  User,
  UserInfos,
  Profile,
  Institution,
  School,
  SchoolYear,
  Class,
  UserInstitution,
  Subject,
  SubTeacherTopicClass,
  MyDataResponse,
  UpdateMyDataRequest,
  UserTelemetryData,
  StudentDetailsResponse,
} from './user';

/**
 * Type tests for user types
 * These tests verify that types are correctly defined and can be used as expected
 */
describe('User Types', () => {
  describe('User', () => {
    it('should accept valid user object', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        active: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.active).toBe(true);
    });
  });

  describe('UserInfos', () => {
    it('should accept valid user infos object', () => {
      const userInfos: UserInfos = {
        id: '1',
        userId: '1',
        urlProfilePicture: 'https://example.com/photo.jpg',
        genre: 'male',
        facebook: '@user',
        instagram: '@user_insta',
        studentNumber: '123456',
        street: 'Main St',
        streetNumber: '123',
        neighborhood: 'Downtown',
        complement: 'Apt 1',
        city: 'City',
        state: 'ST',
        zipCode: '12345678',
        timeSpent: 3600,
        lastInteraction: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(userInfos.id).toBe('1');
      expect(userInfos.urlProfilePicture).toBe('https://example.com/photo.jpg');
      expect(userInfos.timeSpent).toBe(3600);
    });

    it('should accept null for optional fields', () => {
      const userInfos: UserInfos = {
        id: '1',
        userId: '1',
        urlProfilePicture: null,
        genre: null,
        facebook: null,
        instagram: null,
        studentNumber: null,
        street: null,
        streetNumber: null,
        neighborhood: null,
        complement: null,
        city: null,
        state: null,
        zipCode: null,
        timeSpent: 0,
        lastInteraction: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(userInfos.urlProfilePicture).toBeNull();
      expect(userInfos.genre).toBeNull();
    });
  });

  describe('Profile', () => {
    it('should accept valid profile object', () => {
      const profile: Profile = {
        id: '1',
        name: 'Teacher',
        description: 'Teacher profile',
        position: 1,
      };

      expect(profile.id).toBe('1');
      expect(profile.name).toBe('Teacher');
      expect(profile.position).toBe(1);
    });
  });

  describe('Institution', () => {
    it('should accept valid institution object', () => {
      const institution: Institution = {
        id: '1',
        name: 'Test Institution',
        type: 'school',
      };

      expect(institution.id).toBe('1');
      expect(institution.name).toBe('Test Institution');
      expect(institution.type).toBe('school');
    });
  });

  describe('School', () => {
    it('should accept valid school object', () => {
      const school: School = {
        id: '1',
        name: 'Test School',
      };

      expect(school.id).toBe('1');
      expect(school.name).toBe('Test School');
    });
  });

  describe('SchoolYear', () => {
    it('should accept valid school year object', () => {
      const schoolYear: SchoolYear = {
        id: '1',
        name: '2023',
      };

      expect(schoolYear.id).toBe('1');
      expect(schoolYear.name).toBe('2023');
    });
  });

  describe('Class', () => {
    it('should accept valid class object', () => {
      const classObj: Class = {
        id: '1',
        name: '3A',
      };

      expect(classObj.id).toBe('1');
      expect(classObj.name).toBe('3A');
    });
  });

  describe('Subject', () => {
    it('should accept valid subject object', () => {
      const subject: Subject = {
        id: '1',
        name: 'Mathematics',
      };

      expect(subject.id).toBe('1');
      expect(subject.name).toBe('Mathematics');
    });
  });

  describe('UserInstitution', () => {
    it('should accept valid user institution object', () => {
      const userInstitution: UserInstitution = {
        profile: { id: '1', name: 'Student', description: 'Student', position: 1 },
        institution: { id: '1', name: 'School', type: 'school' },
        school: { id: '1', name: 'School' },
        schoolYear: { id: '1', name: '2023' },
        class: { id: '1', name: '3A' },
      };

      expect(userInstitution.profile.name).toBe('Student');
      expect(userInstitution.school.name).toBe('School');
      expect(userInstitution.class.name).toBe('3A');
    });
  });

  describe('SubTeacherTopicClass', () => {
    it('should accept valid sub teacher topic class object', () => {
      const subTeacherTopicClass: SubTeacherTopicClass = {
        subject: { id: '1', name: 'Mathematics' },
        class: { id: '1', name: '3A' },
      };

      expect(subTeacherTopicClass.subject.name).toBe('Mathematics');
      expect(subTeacherTopicClass.class.name).toBe('3A');
    });
  });

  describe('MyDataResponse', () => {
    it('should accept valid my data response object', () => {
      const response: MyDataResponse = {
        message: 'Success',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          active: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        userInfos: {
          id: '1',
          userId: '1',
          urlProfilePicture: null,
          genre: null,
          facebook: null,
          instagram: null,
          studentNumber: null,
          street: null,
          streetNumber: null,
          neighborhood: null,
          complement: null,
          city: null,
          state: null,
          zipCode: null,
          timeSpent: 0,
          lastInteraction: '2023-01-01T00:00:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        userInstitutions: [],
        subTeacherTopicClasses: [],
      };

      expect(response.message).toBe('Success');
      expect(response.user.name).toBe('Test User');
      expect(response.userInstitutions).toEqual([]);
    });
  });

  describe('UpdateMyDataRequest', () => {
    it('should accept valid update request with required fields', () => {
      const request: UpdateMyDataRequest = {
        name: 'New Name',
        email: 'new@example.com',
      };

      expect(request.name).toBe('New Name');
      expect(request.email).toBe('new@example.com');
    });

    it('should accept valid update request with optional fields', () => {
      const request: UpdateMyDataRequest = {
        name: 'New Name',
        email: 'new@example.com',
        urlProfilePicture: 'https://example.com/new-photo.jpg',
        genre: 'female',
        facebook: '@newuser',
        instagram: '@newuser_insta',
        street: 'New St',
        streetNumber: '456',
        neighborhood: 'New Area',
        complement: 'Suite 2',
        city: 'New City',
        state: 'NC',
        zipCode: '87654321',
      };

      expect(request.urlProfilePicture).toBe('https://example.com/new-photo.jpg');
      expect(request.city).toBe('New City');
    });
  });

  describe('UserTelemetryData', () => {
    it('should accept valid telemetry data', () => {
      const telemetry: UserTelemetryData = {
        timeSpent: 7200,
        lastInteraction: '2023-06-01T12:00:00Z',
        accessCount: 50,
      };

      expect(telemetry.timeSpent).toBe(7200);
      expect(telemetry.accessCount).toBe(50);
    });

    it('should accept null for lastInteraction', () => {
      const telemetry: UserTelemetryData = {
        timeSpent: 0,
        lastInteraction: null,
        accessCount: 0,
      };

      expect(telemetry.lastInteraction).toBeNull();
    });
  });

  describe('StudentDetailsResponse', () => {
    it('should accept valid student details response', () => {
      const response: StudentDetailsResponse = {
        message: 'Success',
        data: {
          user: {
            id: '1',
            email: 'student@example.com',
            name: 'Student Name',
            active: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          userInfos: {
            id: '1',
            userId: '1',
            urlProfilePicture: null,
            genre: null,
            facebook: null,
            instagram: null,
            studentNumber: '12345',
            street: null,
            streetNumber: null,
            neighborhood: null,
            complement: null,
            city: null,
            state: null,
            zipCode: null,
            timeSpent: 1800,
            lastInteraction: '2023-06-01T10:00:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          userInstitutions: [],
          teacherTopicClasses: [],
          userDependents: [],
          telemetry: {
            timeSpent: 1800,
            lastInteraction: '2023-06-01T10:00:00Z',
            accessCount: 25,
          },
        },
      };

      expect(response.message).toBe('Success');
      expect(response.data.user.name).toBe('Student Name');
      expect(response.data.telemetry?.accessCount).toBe(25);
    });

    it('should accept null telemetry', () => {
      const response: StudentDetailsResponse = {
        message: 'Success',
        data: {
          user: {
            id: '1',
            email: 'student@example.com',
            name: 'Student Name',
            active: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          userInfos: {
            id: '1',
            userId: '1',
            urlProfilePicture: null,
            genre: null,
            facebook: null,
            instagram: null,
            studentNumber: null,
            street: null,
            streetNumber: null,
            neighborhood: null,
            complement: null,
            city: null,
            state: null,
            zipCode: null,
            timeSpent: 0,
            lastInteraction: '2023-01-01T00:00:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          userInstitutions: [],
          teacherTopicClasses: [],
          userDependents: [],
          telemetry: null,
        },
      };

      expect(response.data.telemetry).toBeNull();
    });
  });
});
