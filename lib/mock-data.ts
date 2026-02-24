import { Event, User, UserRole, UserStatus } from '@/types/dashboard'

const roles: UserRole[] = ['Admin', 'User', 'Editor', 'Manager']
const statuses: UserStatus[] = [
  'Active',
  'Active',
  'Active',
  'Inactive',
  'Pending',
  'Blocked'
]

const firstNames = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Evan',
  'Fiona',
  'George',
  'Hannah',
  'Ivan',
  'Julia',
  'Kevin',
  'Laura',
  'Mike',
  'Nina',
  'Oscar',
  'Paula',
  'Quinn',
  'Rachel',
  'Steve',
  'Tina',
  'Umar',
  'Vera',
  'Will',
  'Xena',
  'Yusuf',
  'Zara',
  'Aaron',
  'Bella',
  'Carlos',
  'Daisy',
  'Eliot',
  'Faith',
  'Gavin',
  'Heidi',
  'Ian',
  'Jasmine',
  'Kyle',
  'Luna',
  'Mason',
  'Nora',
  'Owen',
  'Priya',
  'Rory',
  'Sara',
  'Tom',
  'Uma',
  'Victor',
  'Wendy',
  'Xander',
  'Yasmin',
  'Zack',
  'Amy',
  'Brian',
  'Chloe',
  'Derek',
  'Ellie',
  'Felix',
  'Grace',
  'Henry',
  'Isla',
  'Jack',
  'Kira',
  'Liam',
  'Mia',
  'Nathan',
  'Olive',
  'Peter',
  'Quinn',
  'Rose',
  'Sam',
  'Taylor',
  'Ursula'
]

const lastNames = [
  'Freeman',
  'Smith',
  'Davis',
  'Prince',
  'Wright',
  'Clarke',
  'Evans',
  'Martin',
  'Thompson',
  'Garcia',
  'Martinez',
  'Robinson',
  'Clark',
  'Lewis',
  'Lee',
  'Walker',
  'Hall',
  'Allen',
  'Young',
  'King',
  'Scott',
  'Green',
  'Baker',
  'Nelson',
  'Carter',
  'Mitchell',
  'Perez',
  'Roberts',
  'Turner',
  'Phillips',
  'Campbell',
  'Parker',
  'Edwards',
  'Collins',
  'Stewart',
  'Morris',
  'Rogers',
  'Reed',
  'Cook',
  'Morgan',
  'Bell',
  'Murphy',
  'Bailey',
  'Rivera',
  'Cooper',
  'Richardson',
  'Cox',
  'Ward',
  'Torres',
  'Peterson',
  'Gray',
  'Ramirez',
  'James',
  'Watson',
  'Brooks',
  'Kelly',
  'Sanders',
  'Price',
  'Bennett',
  'Wood',
  'Barnes',
  'Ross',
  'Henderson',
  'Coleman',
  'Jenkins',
  'Perry',
  'Powell',
  'Long',
  'Patterson',
  'Hughes',
  'Flores'
]

function generateMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[i % lastNames.length]
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const role = roles[i % roles.length]
    const status = statuses[i % statuses.length]
    const daysAgo = Math.floor(Math.random() * 30)
    const lastLogin = new Date(Date.now() - daysAgo * 86_400_000).toISOString()

    return {
      id: `usr_${String(i + 1).padStart(2, '0')}`,
      name,
      email,
      role,
      status,
      lastLogin
    }
  })
}

export const MOCK_USERS: User[] = generateMockUsers(70)

// ─── Events ──────────────────────────────────────────────────────────────────

const eventNames = [
  'Global Tech Summit 2026',
  'Community Hackathon',
  'Design & Innovation Expo',
  'Leadership Masterclass',
  'Open Source Conf',
  'AI & Future of Work Forum',
  'Digital Marketing Workshop',
  'Startup Pitch Night',
  'Women in Tech Gala',
  'Cloud Architecture Bootcamp',
  'UX Research Symposium',
  'DevSecOps Intensive',
  'Product Management Sprint',
  'Blockchain Deep Dive',
  'AR/VR Experience Day',
  'Data Science Summit',
  'CTO Roundtable',
  'Junior Developer Day',
  'Mobile World Forum',
  'Green Tech Expo',
  'Cybersecurity Awareness Week',
  'HR Tech Innovation Day',
  'E-commerce Growth Hacking',
  'Quantum Computing 101',
  'Agile Transformation Workshop',
  'Fintech Frontier Conference',
  'DevOps Days',
  'Creator Economy Summit',
  'SaaS Growth Forum',
  'Remote Work Revolution'
]

const locations = [
  'San Francisco Convention Center, CA',
  'New York Hilton Midtown, NY',
  'Austin Convention Center, TX',
  'Chicago Grand Ballroom, IL',
  'Seattle Tech Hub, WA',
  'Boston Seaport Hotel, MA',
  'Miami Beach Convention Center, FL',
  'Denver Colorado Convention Center, CO',
  'Los Angeles Convention Center, CA',
  'Online — Zoom Webinar'
]

const hostNames = [
  'James Carter',
  'Sophia Nguyen',
  'Liam Thompson',
  'Olivia Martinez',
  'Noah Williams',
  'Emma Johnson',
  'Ethan Brown',
  'Ava Davis',
  'Mason Wilson',
  'Isabella Anderson'
]

const descriptions = [
  'Join industry leaders and innovators for a full day of keynotes, workshops, and networking. Explore the latest trends shaping the future of technology.',
  'A hands-on intensive where teams collaborate to solve real-world problems over 24 hours. Prizes, mentorship, and networking included.',
  'Showcasing groundbreaking design and product innovations from startups and enterprises alike. Experience live demos and panel discussions.',
  'An immersive masterclass designed to sharpen strategic thinking and leadership skills for executives and aspiring leaders.',
  'Celebrating open-source culture with talks, contributor sprints, and community meetups spanning the entire software ecosystem.',
  'Experts and practitioners discuss how AI is transforming industries, jobs, and the workplace. Practical sessions with immediate takeaways.',
  'Tactical digital marketing workshops covering SEO, paid media, content strategy, and analytics for growth-focused teams.',
  'Entrepreneurs pitch their ideas to a panel of seasoned investors. Networking reception follows for all attendees.'
]

// picsum seeds give consistent images per event
function getEventImages(seed: number): string[] {
  return [
    `https://picsum.photos/seed/${seed}/800/450`,
    `https://picsum.photos/seed/${seed + 100}/800/450`,
    `https://picsum.photos/seed/${seed + 200}/800/450`
  ]
}

export const MOCK_EVENTS: Event[] = eventNames.map((name, i) => ({
  id: `evt_${String(i + 1).padStart(2, '0')}`,
  name,
  description: descriptions[i % descriptions.length],
  location: locations[i % locations.length],
  dateTime: new Date(
    Date.now() + (i - 5) * 5 * 86_400_000 + i * 3_600_000
  ).toISOString(),
  images: getEventImages(i + 10),
  host: {
    name: hostNames[i % hostNames.length],
    email: `${hostNames[i % hostNames.length].split(' ')[0].toLowerCase()}@events.io`,
    photo: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`
  }
}))
