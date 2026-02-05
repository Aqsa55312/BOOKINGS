import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User (Bagian Kemahasiswaan)
  const adminPassword = await bcrypt.hash('kemahasiswaan123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'kemahasiswaan@kampus.ac.id' },
    update: {},
    create: {
      email: 'kemahasiswaan@kampus.ac.id',
      password: adminPassword,
      name: 'Bagian Kemahasiswaan',
      role: 'ADMIN',
      phone: '021-12345678',
    },
  });
  console.log('✅ Admin Kemahasiswaan created:', admin.email);

  // Create Sample Classrooms for Campus
  const classrooms = [
    {
      id: 'room-a101',
      name: 'Ruang A101',
      description: 'Ruang kelas standar untuk kuliah atau kegiatan mahasiswa',
      capacity: 40,
      facilities: ['Proyektor', 'AC', 'WiFi'],
      floor: 'Gedung A - Lantai 1',
    },
    {
      id: 'room-a201',
      name: 'Ruang A201',
      description: 'Ruang kelas standar untuk kuliah atau kegiatan mahasiswa',
      capacity: 45,
      facilities: ['Proyektor', 'AC', 'WiFi'],
      floor: 'Gedung A - Lantai 2',
    },
    {
      id: 'room-b101',
      name: 'Ruang B101',
      description: 'Ruang kelas standar untuk kuliah atau kegiatan mahasiswa',
      capacity: 35,
      facilities: ['Proyektor', 'WiFi'],
      floor: 'Gedung B - Lantai 1',
    },
    {
      id: 'lab-komputer',
      name: 'Lab Komputer 1',
      description: 'Laboratorium komputer untuk praktikum',
      capacity: 30,
      facilities: ['30 Komputer', 'Proyektor', 'AC', 'WiFi'],
      floor: 'Gedung C - Lantai 2',
    },
    {
      id: 'aula-kampus',
      name: 'Aula Serbaguna',
      description: 'Aula besar untuk seminar dan acara kampus',
      capacity: 200,
      facilities: ['Sound System', 'Proyektor', 'AC', 'Panggung'],
      floor: 'Gedung Rektorat - Lantai 1',
    },
  ];

  for (const classroom of classrooms) {
    const room = await prisma.room.upsert({
      where: { id: classroom.id },
      update: {},
      create: {
        ...classroom,
        status: 'AVAILABLE',
      },
    });
    console.log('✅ Ruang kelas created:', room.name);
  }

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 ADMIN (Bagian Kemahasiswaan):');
  console.log('   Email    : kemahasiswaan@kampus.ac.id');
  console.log('   Password : kemahasiswaan123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Admin bisa mengelola & menambah ruang kelas');
  console.log('💡 Mahasiswa harus register sendiri untuk booking');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
