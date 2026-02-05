import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import pkg from 'graphql';
const { GraphQLError } = pkg;

const bcrypt = bcryptjs;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'ADMIN_SECRET_2026';

// Helper function to get user from token
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const resolvers = {
  Query: {
    // User Queries
    me: async (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await prisma.user.findUnique({ where: { id: user.id } });
    },

    user: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await prisma.user.findUnique({ where: { id } });
    },

    users: async (_, { role }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      const where = role ? { role } : {};
      return await prisma.user.findMany({ where });
    },

    // Room Queries
    room: async (_, { id }) => {
      return await prisma.room.findUnique({ where: { id } });
    },

    rooms: async (_, { status, limit, offset }) => {
      const where = status ? { status } : {};
      const query = { where };
      if (limit) query.take = limit;
      if (offset) query.skip = offset;
      return await prisma.room.findMany(query);
    },

    availableRooms: async (_, { startTime, endTime }) => {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const bookedRoomIds = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'PROCESSING', 'APPROVED'] },
          OR: [
            { startTime: { lte: start }, endTime: { gt: start } },
            { startTime: { lt: end }, endTime: { gte: end } },
            { startTime: { gte: start }, endTime: { lte: end } },
          ],
        },
        select: { roomId: true },
      });

      const bookedIds = bookedRoomIds.map((b) => b.roomId);
      return await prisma.room.findMany({
        where: {
          id: { notIn: bookedIds },
          status: 'AVAILABLE',
        },
      });
    },

    // Booking Queries
    booking: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await prisma.booking.findUnique({ where: { id } });
    },

    bookings: async (_, { userId, roomId, status }, { user }) => {
      // Admin can see all bookings
      // Regular users can only see bookings for specific room (to check availability)
      if (!user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      
      const where = {};
      
      // If roomId is provided, anyone can query (for checking room availability)
      if (roomId) {
        where.roomId = roomId;
        // Only show active bookings (not cancelled/rejected) for availability checking
        where.status = { in: ['PENDING', 'PROCESSING', 'APPROVED'] };
      } else {
        // For queries without roomId, only admin can access
        if (user.role !== 'ADMIN') {
          throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
        }
        if (userId) where.userId = userId;
        if (status) where.status = status;
      }
      
      const bookings = await prisma.booking.findMany({ 
        where, 
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          room: true
        },
        orderBy: { startTime: 'desc' } 
      });

      // Sort by status priority: PENDING > PROCESSING > APPROVED > REJECTED > CANCELLED > COMPLETED
      const statusPriority = {
        'PENDING': 1,
        'PROCESSING': 2,
        'APPROVED': 3,
        'REJECTED': 4,
        'CANCELLED': 5,
        'COMPLETED': 6
      };

      return bookings.sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;
        // If same status, sort by startTime (newest first)
        return new Date(b.startTime) - new Date(a.startTime);
      });
    },

    myBookings: async (_, { status }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const where = { userId: user.id };
      if (status) where.status = status;
      return await prisma.booking.findMany({ 
        where, 
        include: {
          room: true
        },
        orderBy: { startTime: 'desc' } 
      });
    },

    upcomingBookings: async (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await prisma.booking.findMany({
        where: {
          userId: user.id,
          startTime: { gte: new Date() },
          status: { in: ['PENDING', 'APPROVED'] },
        },
        orderBy: { startTime: 'asc' },
      });
    },

    // Schedule Queries
    schedule: async (_, { id }) => {
      return await prisma.schedule.findUnique({ where: { id } });
    },

    schedules: async (_, { roomId }) => {
      const where = roomId ? { roomId } : {};
      return await prisma.schedule.findMany({ where });
    },

    roomSchedules: async (_, { roomId }) => {
      return await prisma.schedule.findMany({ where: { roomId } });
    },

    // Notification Queries
    notifications: async (_, { userId }, { user }) => {
      if (!user || (user.role !== 'ADMIN' && user.id !== userId)) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    },

    myNotifications: async (_, { isRead }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const where = { userId: user.id };
      if (typeof isRead === 'boolean') where.isRead = isRead;
      return await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    },

    unreadNotificationCount: async (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
    },

    // Statistics Queries
    dashboardStats: async (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      
      const totalBookings = await prisma.booking.count({ where: { userId: user.id } });
      
      // Active bookings = PROCESSING + APPROVED (sedang diproses atau sudah disetujui tapi belum selesai)
      const activeBookings = await prisma.booking.count({
        where: {
          userId: user.id,
          status: { in: ['PROCESSING', 'APPROVED'] }
        }
      });
      
      const completedBookings = await prisma.booking.count({
        where: { userId: user.id, status: 'COMPLETED' }
      });
      
      // Pending = menunggu diproses admin
      const pendingBookings = await prisma.booking.count({
        where: { userId: user.id, status: 'PENDING' }
      });
      
      const cancelledBookings = await prisma.booking.count({
        where: { userId: user.id, status: { in: ['CANCELLED', 'REJECTED'] } }
      });

      return {
        totalBookings,
        activeBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings
      };
    },

    adminStats: async (_, __, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      const totalUsers = await prisma.user.count();
      const totalRooms = await prisma.room.count();
      const totalBookings = await prisma.booking.count();
      
      // Pending approvals = booking yang perlu diproses admin (PENDING + PROCESSING)
      const pendingApprovals = await prisma.booking.count({ 
        where: { status: { in: ['PENDING', 'PROCESSING'] } } 
      });
      
      // Active bookings = PROCESSING + APPROVED (sedang diproses atau sudah disetujui)
      const activeBookings = await prisma.booking.count({
        where: {
          status: { in: ['PROCESSING', 'APPROVED'] }
        }
      });
      
      const availableRooms = await prisma.room.count({ where: { status: 'AVAILABLE' } });
      const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0;

      return {
        totalUsers,
        totalRooms,
        totalBookings,
        totalRevenue: 0, // Not implemented yet
        pendingApprovals,
        activeBookings,
        availableRooms,
        occupancyRate
      };
    },
  },

  Mutation: {
    // Auth Mutations
    register: async (_, { email, password, name, phone, adminSecretKey }) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new GraphQLError('Email already exists', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user wants to register as admin
      let role = 'USER';
      if (adminSecretKey && adminSecretKey === ADMIN_SECRET_KEY) {
        role = 'ADMIN';
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role,
        },
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return { token, user };
    },

    // User Mutations
    updateUser: async (_, { id, name, phone, avatar }, { user }) => {
      if (!user || (user.id !== id && user.role !== 'ADMIN')) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      const data = {};
      if (name) data.name = name;
      if (phone) data.phone = phone;
      if (avatar) data.avatar = avatar;

      return await prisma.user.update({ where: { id }, data });
    },

    updateUserRole: async (_, { id, role }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.user.update({ where: { id }, data: { role } });
    },

    deleteUser: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.user.delete({ where: { id } });
      return { success: true, message: 'User deleted successfully' };
    },

    // Room Mutations
    createRoom: async (_, args, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.room.create({ data: { ...args, status: 'AVAILABLE' } });
    },

    updateRoom: async (_, { id, ...data }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.room.update({ where: { id }, data });
    },

    deleteRoom: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.room.delete({ where: { id } });
      return { success: true, message: 'Room deleted successfully' };
    },

    // Booking Mutations
    createBooking: async (_, { roomId, startTime, endTime, purpose, attendees, documentUrl, documentName, notes }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new GraphQLError('Format waktu tidak valid', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (end <= start) {
        throw new GraphQLError('Waktu selesai harus setelah waktu mulai', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const now = new Date();
      if (start < now) {
        throw new GraphQLError('Waktu mulai tidak boleh di masa lalu', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Get room
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        throw new GraphQLError('Kelas tidak ditemukan', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check for conflicts - booking overlaps if:
      // 1. New booking starts during existing booking
      // 2. New booking ends during existing booking
      // 3. New booking completely contains existing booking
      const conflicts = await prisma.booking.findMany({
        where: {
          roomId,
          status: { in: ['PENDING', 'PROCESSING', 'APPROVED'] },
          OR: [
            { startTime: { lte: start }, endTime: { gt: start } },
            { startTime: { lt: end }, endTime: { gte: end } },
            { startTime: { gte: start }, endTime: { lte: end } },
          ],
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (conflicts.length > 0) {
        const conflict = conflicts[0];
        const conflictStart = new Date(conflict.startTime);
        const conflictEnd = new Date(conflict.endTime);
        
        const formatDate = (date) => {
          return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        };
        
        const formatTime = (date) => {
          return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        const isSameDay = conflictStart.toDateString() === conflictEnd.toDateString();
        
        let timeInfo;
        if (isSameDay) {
          timeInfo = `${formatDate(conflictStart)} pukul ${formatTime(conflictStart)} - ${formatTime(conflictEnd)}`;
        } else {
          timeInfo = `${formatDate(conflictStart)} pukul ${formatTime(conflictStart)} sampai ${formatDate(conflictEnd)} pukul ${formatTime(conflictEnd)}`;
        }
        
        throw new GraphQLError(
          `⚠️ Ruangan sudah dibooking oleh ${conflict.user?.name || 'pengguna lain'} pada ${timeInfo}. Silakan pilih waktu lain.`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      return await prisma.booking.create({
        data: {
          userId: user.id,
          roomId,
          startTime: start,
          endTime: end,
          purpose,
          attendees: attendees || 1,
          documentUrl,
          documentName,
          notes,
          status: 'PENDING',
        },
      });
    },

    updateBooking: async (_, { id, startTime, endTime, purpose, attendees, documentUrl, documentName, notes }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking || (booking.userId !== user.id && user.role !== 'ADMIN')) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      const data = {};
      if (startTime) data.startTime = new Date(startTime);
      if (endTime) data.endTime = new Date(endTime);
      if (purpose) data.purpose = purpose;
      if (attendees) data.attendees = attendees;
      if (documentUrl !== undefined) data.documentUrl = documentUrl;
      if (documentName !== undefined) data.documentName = documentName;
      if (notes !== undefined) data.notes = notes;

      return await prisma.booking.update({ where: { id }, data });
    },

    updateBookingStatus: async (_, { id, status, adminNote, approvedDocumentUrl, approvedDocumentName }, { user }) => {
      if (!user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new GraphQLError('Booking tidak ditemukan', { extensions: { code: 'NOT_FOUND' } });
      }

      // User can only mark their own booking as COMPLETED
      if (user.role !== 'ADMIN') {
        if (booking.userId !== user.id) {
          throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
        }
        if (status !== 'COMPLETED') {
          throw new GraphQLError('User hanya bisa menyelesaikan booking mereka sendiri', { extensions: { code: 'FORBIDDEN' } });
        }
        if (booking.status !== 'APPROVED') {
          throw new GraphQLError('Booking harus dalam status APPROVED untuk bisa diselesaikan', { extensions: { code: 'BAD_USER_INPUT' } });
        }
      }

      const data = { status };
      if (adminNote) data.adminNote = adminNote;
      if (approvedDocumentUrl !== undefined) data.approvedDocumentUrl = approvedDocumentUrl;
      if (approvedDocumentName !== undefined) data.approvedDocumentName = approvedDocumentName;
      return await prisma.booking.update({ where: { id }, data });
    },

    cancelBooking: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new GraphQLError('Booking tidak ditemukan', { extensions: { code: 'NOT_FOUND' } });
      }
      
      if (booking.userId !== user.id && user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
      return { success: true, message: 'Booking cancelled successfully' };
    },

    deleteBooking: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.booking.delete({ where: { id } });
      return { success: true, message: 'Booking deleted successfully' };
    },

    // Schedule Mutations
    createSchedule: async (_, args, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.schedule.create({ data: args });
    },

    updateSchedule: async (_, { id, ...data }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.schedule.update({ where: { id }, data });
    },

    deleteSchedule: async (_, { id }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.schedule.delete({ where: { id } });
      return { success: true, message: 'Schedule deleted successfully' };
    },

    // Notification Mutations
    createNotification: async (_, args, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      return await prisma.notification.create({ data: args });
    },

    markNotificationAsRead: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification || notification.userId !== user.id) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      return await prisma.notification.update({ where: { id }, data: { isRead: true } });
    },

    markAllNotificationsAsRead: async (_, { userId }, { user }) => {
      if (!user || user.id !== userId) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return { success: true, message: 'All notifications marked as read' };
    },

    deleteNotification: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification || (notification.userId !== user.id && user.role !== 'ADMIN')) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      await prisma.notification.delete({ where: { id } });
      return { success: true, message: 'Notification deleted successfully' };
    },
  },

  // Field Resolvers
  User: {
    bookings: async (parent) => {
      return await prisma.booking.findMany({ where: { userId: parent.id } });
    },
  },

  Room: {
    bookings: async (parent) => {
      return await prisma.booking.findMany({ where: { roomId: parent.id } });
    },
    schedules: async (parent) => {
      return await prisma.schedule.findMany({ where: { roomId: parent.id } });
    },
  },

  Booking: {
    user: async (parent) => {
      return await prisma.user.findUnique({ where: { id: parent.userId } });
    },
    room: async (parent) => {
      return await prisma.room.findUnique({ where: { id: parent.roomId } });
    },
  },

  Schedule: {
    room: async (parent) => {
      return await prisma.room.findUnique({ where: { id: parent.roomId } });
    },
  },
};

export { getUserFromToken };
