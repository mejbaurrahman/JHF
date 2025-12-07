import { User, UserRole, Event, EventType, Donation, DonationMethod, DonationStatus, Fee, CommitteeMember } from '../types';

export const MOCK_USERS: User[] = [
  {
    _id: '1',
    id: '1',
    name: 'Admin User',
    email: 'admin@gmail.com',
    role: UserRole.ADMIN,
    phone: '01700000000',
    joinDate: '2023-01-01'
  },
  {
    _id: '2',
    id: '2',
    name: 'Normal Member',
    email: 'user@gmail.com',
    role: UserRole.USER,
    phone: '01800000000',
    joinDate: '2023-05-15'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    _id: '101',
    id: '101',
    title: 'Annual Tafsirul Quran Mahfil 2024',
    slug: 'annual-tafsirul-quran-mahfil-2024',
    date: '2024-12-25',
    startDate: '2024-12-25',
    description: 'Our biggest annual event featuring renowned scholars from across the country. Join us for an evening of spiritual enlightenment and community bonding.',
    location: 'Village Eidgah Field',
    type: EventType.MAHFIL,
    manager: 'Abdullah Al Mamun',
    totalDonations: 150000,
    totalExpenses: 120000,
    status: 'upcoming' as any
  },
  {
    _id: '102',
    id: '102',
    title: 'Winter Blanket Distribution',
    slug: 'winter-blanket-distribution-2024',
    date: '2024-01-10',
    startDate: '2024-01-10',
    description: 'Distributing warm clothes and blankets to the poor people of the village. We aim to reach 500 families this winter.',
    location: 'Community Center',
    type: EventType.CHARITY,
    manager: 'Rahim Uddin',
    totalDonations: 50000,
    totalExpenses: 45000,
    status: 'completed' as any
  },
  {
    _id: '103',
    id: '103',
    title: 'Weekly Quran Learning Class',
    slug: 'weekly-quran-class',
    date: '2024-11-15',
    startDate: '2024-11-15',
    description: 'Every Friday morning, we host Quran learning sessions for children and adults.',
    location: 'Village Mosque',
    type: EventType.MEETING,
    manager: 'Imam Sahib',
    totalDonations: 5000,
    totalExpenses: 2000,
    status: 'upcoming' as any
  }
];

export const MOCK_DONATIONS: Donation[] = [
  {
    _id: 'd1',
    id: 'd1',
    donorName: 'Karim Hasan',
    amount: 5000,
    paymentMethod: DonationMethod.BKASH,
    method: 'bkash',
    transactionId: 'TRX738292',
    status: DonationStatus.CONFIRMED,
    date: '2024-10-01',
    eventId: '101'
  },
  {
    _id: 'd2',
    id: 'd2',
    donorName: 'Anonymous',
    amount: 1000,
    paymentMethod: DonationMethod.NAGAD,
    method: 'nagad',
    transactionId: 'NGD99283',
    status: DonationStatus.PENDING,
    date: '2024-10-05',
    eventId: '102'
  }
];

export const MOCK_FEES: Fee[] = [
  {
    _id: 'f1',
    id: 'f1',
    userId: '2',
    month: 1,
    year: 2024,
    amount: 100,
    status: 'paid',
    paymentMethod: 'bkash',
    isPaid: true
  },
  {
    _id: 'f2',
    id: 'f2',
    userId: '2',
    month: 2,
    year: 2024,
    amount: 100,
    status: 'pending',
    paymentMethod: 'cash',
    isPaid: false
  }
];

export const MOCK_COMMITTEE_MEMBERS: CommitteeMember[] = [
  { _id: '1', name: 'Md. Abdul Karim', roleKey: 'president', order: 1 },
  { _id: '2', name: 'Sheikh Rahim', roleKey: 'vicePresident', order: 2 },
  { _id: '3', name: 'Ahmed Ali', roleKey: 'generalSecretary', order: 3 },
  { _id: '4', name: 'Mustafa Kamal', roleKey: 'treasurer', order: 4 },
  { _id: '5', name: 'Hassan Mahmud', roleKey: 'organizingSecretary', order: 5 },
  { _id: '6', name: 'Ziaur Rahman', roleKey: 'member', order: 6 },
];

export const MOCK_SITE_CONTENT = {
  home: {
    organizationName: "Jesobantapur Hilful Fuzul",
    organizationSuffix: "Youth Association",
    heroAyahArabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ",
    heroAyah: "And cooperate in righteousness and piety, but do not cooperate in sin and aggression.",
    logoUrl: "/logo.png",
  },
  about: {
    aboutDesc: "Established in 2023, Jesobantapur Hilful Fuzul Youth Association is dedicated to serving humanity and fostering Islamic values.",
    missionDesc: "To unite the youth of Jesobantapur village under the banner of social welfare and spiritual growth.",
    visionDesc: "A village where no one goes hungry, every child receives education, and the community is bonded by brotherhood and faith.",
    impacts: [
      { value: "500+", label: "Families Supported", icon: "heart", color: "red" },
      { value: "120+", label: "Students Sponsored", icon: "book", color: "teal" },
      { value: "50+", label: "Active Volunteers", icon: "users", color: "emerald" }
    ]
  }
};
