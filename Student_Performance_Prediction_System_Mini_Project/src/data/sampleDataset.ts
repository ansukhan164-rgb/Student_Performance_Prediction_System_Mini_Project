/**
 * Ansar Student Performance AI - Persistent Data & User Management
 * Roles: Teacher & Student
 */

import { User } from '../types';

export const INITIAL_USER: User = {
  id: 'u_teacher_1',
  username: 'teacher',
  email: 'prof.sharma@ansarai.edu',
  fullName: 'Dr. Ramesh Sharma',
  role: 'teacher',
  assignedClass: 'BCA 5th Semester',
  assignedSection: 'Section A',
  teacherId: 'TCH-2024-08',
  active: true,
  createdAt: '2026-02-15'
};

export const INITIAL_STUDENT_USER: User = {
  id: 'u_student_1',
  username: 'student',
  email: 'aarav.sharma@student.ansarai.edu',
  fullName: 'Aarav Sharma',
  role: 'student',
  studentId: 'STD2024-001',
  assignedClass: 'BCA 5th Semester',
  assignedSection: 'Section A',
  active: true,
  createdAt: '2026-03-01'
};

export const INITIAL_USERS: User[] = [INITIAL_USER, INITIAL_STUDENT_USER];
