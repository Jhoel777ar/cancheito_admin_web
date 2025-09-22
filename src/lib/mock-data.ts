import { User, Company, JobOffer } from '@/lib/types';
import { subDays, format } from 'date-fns';

const now = new Date();

export const mockUsers: User[] = [
  { id: 'usr_1', fullName: 'Elena Rodriguez', email: 'elena.rodriguez@example.com', registrationDate: format(subDays(now, 5), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/1/100/100', isVerified: true },
  { id: 'usr_2', fullName: 'Marcus Chen', email: 'marcus.chen@example.com', registrationDate: format(subDays(now, 12), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/2/100/100', isVerified: true },
  { id: 'usr_3', fullName: 'Aisha Khan', email: 'aisha.khan@example.com', registrationDate: format(subDays(now, 25), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/3/100/100', isVerified: false },
  { id: 'usr_4', fullName: 'David Smith', email: 'david.smith@example.com', registrationDate: format(subDays(now, 45), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/4/100/100', isVerified: true },
  { id: 'usr_5', fullName: 'Sophia Dubois', email: 'sophia.dubois@example.com', registrationDate: format(subDays(now, 60), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/5/100/100', isVerified: false },
  { id: 'usr_6', fullName: 'Carlos Gomez', email: 'carlos.gomez@example.com', registrationDate: format(subDays(now, 90), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/6/100/100', isVerified: true },
  { id: 'usr_7', fullName: 'Freya Andersen', email: 'freya.andersen@example.com', registrationDate: format(subDays(now, 120), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/7/100/100', isVerified: true },
  { id: 'usr_8', fullName: 'Kenji Tanaka', email: 'kenji.tanaka@example.com', registrationDate: format(subDays(now, 150), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/8/100/100', isVerified: false },
  { id: 'usr_9', fullName: 'Olivia Martinez', email: 'olivia.martinez@example.com', registrationDate: format(subDays(now, 180), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/9/100/100', isVerified: true },
  { id: 'usr_10', fullName: 'Liam O\'Connell', email: 'liam.oconnell@example.com', registrationDate: format(subDays(now, 200), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/10/100/100', isVerified: true },
  { id: 'usr_11', fullName: 'Suspended User', email: 'suspended@admin.com', registrationDate: format(subDays(now, 210), 'yyyy-MM-dd'), profileUrl: 'https://picsum.photos/seed/11/100/100', isVerified: false },
];

export const mockCompanies: Company[] = [
  { id: 'com_1', name: 'Innovatech Solutions', industry: 'Technology', location: 'San Francisco, USA', foundedDate: '2015-06-01', website: 'innovatech.com' },
  { id: 'com_2', name: 'QuantumLeap AI', industry: 'Artificial Intelligence', location: 'London, UK', foundedDate: '2018-11-20', website: 'quantumleap.ai' },
  { id: 'com_3', name: 'BioGen Corp', industry: 'Biotechnology', location: 'Boston, USA', foundedDate: '2012-03-15', website: 'biogen.corp' },
  { id: 'com_4', name: 'GreenScape Energy', industry: 'Renewable Energy', location: 'Berlin, Germany', foundedDate: '2019-01-10', website: 'greenscape.energy' },
  { id: 'com_5', name: 'Nexus Robotics', industry: 'Robotics', location: 'Tokyo, Japan', foundedDate: '2017-09-05', website: 'nexusrobotics.jp' },
  { id: 'com_6', name: 'FinSecure', industry: 'FinTech', location: 'Singapore', foundedDate: '2020-02-28', website: 'finsecure.sg' },
];

export const mockJobOffers: JobOffer[] = [
  { id: 'job_1', title: 'Senior Frontend Developer', companyName: 'Innovatech Solutions', location: 'Remote', type: 'Full-time', postedDate: format(subDays(now, 7), 'yyyy-MM-dd'), status: 'Open' },
  { id: 'job_2', title: 'AI Research Scientist', companyName: 'QuantumLeap AI', location: 'London, UK', type: 'Full-time', postedDate: format(subDays(now, 14), 'yyyy-MM-dd'), status: 'Open' },
  { id: 'job_3', title: 'Lab Technician', companyName: 'BioGen Corp', location: 'Boston, USA', type: 'Contract', postedDate: format(subDays(now, 21), 'yyyy-MM-dd'), status: 'Closed' },
  { id: 'job_4', title: 'Solar Panel Installer', companyName: 'GreenScape Energy', location: 'Berlin, Germany', type: 'Part-time', postedDate: format(subDays(now, 30), 'yyyy-MM-dd'), status: 'Open' },
  { id: 'job_5', title: 'Robotics Engineer', companyName: 'Nexus Robotics', location: 'Tokyo, Japan', type: 'Full-time', postedDate: format(subDays(now, 45), 'yyyy-MM-dd'), status: 'Open' },
  { id: 'job_6', title: 'Cybersecurity Analyst', companyName: 'FinSecure', location: 'Singapore', type: 'Full-time', postedDate: format(subDays(now, 60), 'yyyy-MM-dd'), status: 'Closed' },
];

export const dashboardStats = {
  totalUsers: mockUsers.length,
  activeCompanies: mockCompanies.length,
  openJobOffers: mockJobOffers.filter(j => j.status === 'Open').length,
  newUsersThisMonth: mockUsers.filter(u => new Date(u.registrationDate) > subDays(now, 30)).length,
};

export const userSignupsData = [
  { date: format(subDays(now, 6), 'MMM d'), signups: 2 },
  { date: format(subDays(now, 5), 'MMM d'), signups: 1 },
  { date: format(subDays(now, 4), 'MMM d'), signups: 3 },
  { date: format(subDays(now, 3), 'MMM d'), signups: 2 },
  { date: format(subDays(now, 2), 'MMM d'), signups: 4 },
  { date: format(subDays(now, 1), 'MMM d'), signups: 3 },
  { date: format(now, 'MMM d'), signups: 5 },
];
