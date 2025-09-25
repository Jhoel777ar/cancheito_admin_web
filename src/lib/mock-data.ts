import { User, Company, JobOffer } from '@/lib/types';
import { subDays, format } from 'date-fns';

const now = new Date();

// This data is now fetched from Firebase in app/(dashboard)/dashboard/users/page.tsx
export const mockUsers: User[] = [];

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

// This is no longer used for dashboard stats, they are now fetched live.
export const dashboardStats = {
  totalUsers: 0,
  activeCompanies: mockCompanies.length,
  openJobOffers: mockJobOffers.filter(j => j.status === 'Open').length,
  newUsersThisMonth: 0,
};

// This data is now fetched from Firebase in app/(dashboard)/dashboard/page.tsx
export const userSignupsData = [];
