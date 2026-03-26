import {
  SystemDevice,
  StudentCard,
  Attendance,
} from './types';

// Mock data store
export const mockDevices: Map<string, SystemDevice> = new Map([
  [
    'device-001',
    {
      id: 'device-001',
      device_name: 'Main Entrance',
      device_id: 'device-001',
      location: 'Building A - Ground Floor',
      status: 'active',
      created_at: new Date('2024-01-15'),
      last_heartbeat: new Date(),
    },
  ],
  [
    'device-002',
    {
      id: 'device-002',
      device_name: 'Library Access',
      device_id: 'device-002',
      location: 'Library - Level 2',
      status: 'active',
      created_at: new Date('2024-01-20'),
      last_heartbeat: new Date(),
    },
  ],
]);

export const mockCards: Map<string, StudentCard> = new Map([
  [
    'RFID-001',
    {
      id: 'card-001',
      student_id: 'STU-2024-001',
      rfid_code: 'RFID-001',
      card_status: 'active',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
    },
  ],
  [
    'RFID-002',
    {
      id: 'card-002',
      student_id: 'STU-2024-002',
      rfid_code: 'RFID-002',
      card_status: 'active',
      created_at: new Date('2024-01-16'),
      updated_at: new Date('2024-01-16'),
    },
  ],
  [
    'RFID-003',
    {
      id: 'card-003',
      student_id: 'STU-2024-003',
      rfid_code: 'RFID-003',
      card_status: 'active',
      created_at: new Date('2024-01-17'),
      updated_at: new Date('2024-01-17'),
    },
  ],
]);

export const mockAttendance: Attendance[] = [
  {
    id: 'att-001',
    device_id: 'device-001',
    student_id: 'STU-2024-001',
    rfid_code: 'RFID-001',
    check_in_time: new Date('2024-03-20T08:30:00'),
    check_out_time: new Date('2024-03-20T17:00:00'),
    date: '2024-03-20',
    duration_minutes: 510,
  },
  {
    id: 'att-002',
    device_id: 'device-001',
    student_id: 'STU-2024-002',
    rfid_code: 'RFID-002',
    check_in_time: new Date('2024-03-20T08:45:00'),
    check_out_time: new Date('2024-03-20T17:15:00'),
    date: '2024-03-20',
    duration_minutes: 510,
  },
  {
    id: 'att-003',
    device_id: 'device-002',
    student_id: 'STU-2024-001',
    rfid_code: 'RFID-001',
    check_in_time: new Date('2024-03-21T09:00:00'),
    check_out_time: new Date('2024-03-21T16:30:00'),
    date: '2024-03-21',
    duration_minutes: 450,
  },
];

// Helper functions
export function getDeviceById(deviceId: string): SystemDevice | undefined {
  return mockDevices.get(deviceId);
}

export function getCardByRfid(rfidCode: string): StudentCard | undefined {
  return mockCards.get(rfidCode);
}

export function addDevice(device: SystemDevice): void {
  mockDevices.set(device.id, device);
}

export function updateDevice(id: string, updates: Partial<SystemDevice>): void {
  const device = mockDevices.get(id);
  if (device) {
    mockDevices.set(id, { ...device, ...updates });
  }
}

export function deleteDevice(id: string): void {
  mockDevices.delete(id);
}

export function addCard(card: StudentCard): void {
  mockCards.set(card.rfid_code, card);
}

export function updateCard(rfidCode: string, updates: Partial<StudentCard>): void {
  const card = mockCards.get(rfidCode);
  if (card) {
    mockCards.set(rfidCode, { ...card, ...updates });
  }
}

export function deleteCard(rfidCode: string): void {
  mockCards.delete(rfidCode);
}

export function addAttendance(attendance: Attendance): void {
  mockAttendance.push(attendance);
}

export function getAttendanceByDevice(deviceId: string): Attendance[] {
  return mockAttendance.filter((a) => a.device_id === deviceId);
}

export function getAttendanceByStudent(studentId: string): Attendance[] {
  return mockAttendance.filter((a) => a.student_id === studentId);
}

export function getAttendanceByDate(date: string): Attendance[] {
  return mockAttendance.filter((a) => a.date === date);
}

export function getAllAttendance(): Attendance[] {
  return [...mockAttendance];
}
