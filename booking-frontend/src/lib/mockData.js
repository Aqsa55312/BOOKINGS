// Mock data untuk development tanpa backend

export const mockRooms = [
  {
    id: '1',
    name: 'Meeting Room A',
    description: 'Ruangan meeting modern dengan fasilitas lengkap untuk rapat tim kecil hingga menengah',
    capacity: 10,
    facilities: ['WiFi', 'Projector', 'Whiteboard', 'AC', 'TV Display'],
    pricePerHour: 150000,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    status: 'AVAILABLE',
    location: 'Gedung A',
    floor: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Conference Room B',
    description: 'Ruangan konferensi besar untuk acara presentasi dan seminar',
    capacity: 50,
    facilities: ['WiFi', 'Projector', 'Sound System', 'AC', 'Stage'],
    pricePerHour: 500000,
    images: [
      'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800',
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800'
    ],
    status: 'AVAILABLE',
    location: 'Gedung B',
    floor: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Training Room C',
    description: 'Ruangan training dengan kapasitas besar dan fasilitas multimedia',
    capacity: 30,
    facilities: ['WiFi', 'Projector', 'Whiteboard', 'AC', 'Microphone'],
    pricePerHour: 300000,
    images: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'
    ],
    status: 'AVAILABLE',
    location: 'Gedung A',
    floor: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Small Meeting Room D',
    description: 'Ruangan meeting kecil untuk diskusi tim atau interview',
    capacity: 6,
    facilities: ['WiFi', 'TV Display', 'AC', 'Whiteboard'],
    pricePerHour: 100000,
    images: [
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800'
    ],
    status: 'AVAILABLE',
    location: 'Gedung A',
    floor: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Executive Meeting Room',
    description: 'Ruangan meeting eksklusif untuk pertemuan level executive',
    capacity: 8,
    facilities: ['WiFi', '4K TV', 'Video Conference', 'AC', 'Coffee Machine'],
    pricePerHour: 400000,
    images: [
      'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=800'
    ],
    status: 'MAINTENANCE',
    location: 'Gedung B',
    floor: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Workshop Room',
    description: 'Ruangan workshop dengan layout fleksibel untuk berbagai kegiatan',
    capacity: 25,
    facilities: ['WiFi', 'Projector', 'Sound System', 'AC', 'Movable Chairs'],
    pricePerHour: 250000,
    images: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800'
    ],
    status: 'AVAILABLE',
    location: 'Gedung C',
    floor: 1,
    createdAt: new Date().toISOString()
  }
];

export const mockBookings = [
  {
    id: '1',
    room: mockRooms[0],
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 93600000).toISOString(),
    purpose: 'Team Meeting - Sprint Planning',
    attendees: 8,
    status: 'PENDING',
    totalPrice: 300000,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    room: mockRooms[1],
    startTime: new Date(Date.now() + 172800000).toISOString(), // 2 days later
    endTime: new Date(Date.now() + 187200000).toISOString(),
    purpose: 'Company Presentation',
    attendees: 45,
    status: 'APPROVED',
    totalPrice: 2000000,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    room: mockRooms[2],
    startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    endTime: new Date(Date.now() - 79200000).toISOString(),
    purpose: 'Technical Training',
    attendees: 25,
    status: 'COMPLETED',
    totalPrice: 600000,
    createdAt: new Date().toISOString()
  }
];

export const mockDashboardStats = {
  totalBookings: 15,
  activeBookings: 3,
  completedBookings: 10,
  pendingBookings: 2,
  cancelledBookings: 0
};

export const mockAdminStats = {
  totalUsers: 42,
  totalRooms: 6,
  totalBookings: 15,
  totalRevenue: 7500000,
  pendingApprovals: 2,
  activeBookings: 3,
  availableRooms: 5,
  occupancyRate: 65
};
