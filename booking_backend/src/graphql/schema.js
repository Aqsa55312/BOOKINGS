import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # User Types
  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    avatar: String
    phone: String
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
  }

  # Room Types
  type Room {
    id: ID!
    name: String!
    description: String
    capacity: Int!
    facilities: [String!]!
    floor: String
    status: RoomStatus!
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
    schedules: [Schedule!]!
  }

  # Booking Types
  type Booking {
    id: ID!
    userId: String!
    roomId: String!
    startTime: String!
    endTime: String!
    purpose: String!
    attendees: Int!
    documentUrl: String
    documentName: String
    approvedDocumentUrl: String
    approvedDocumentName: String
    status: BookingStatus!
    notes: String
    adminNote: String
    createdAt: String!
    updatedAt: String!
    user: User!
    room: Room!
  }

  # Schedule Types
  type Schedule {
    id: ID!
    roomId: String!
    dayOfWeek: Int!
    startTime: String!
    endTime: String!
    isAvailable: Boolean!
    notes: String
    createdAt: String!
    updatedAt: String!
    room: Room!
  }

  # Notification Types
  type Notification {
    id: ID!
    userId: String!
    title: String!
    message: String!
    type: NotificationType!
    isRead: Boolean!
    createdAt: String!
  }

  # Enums
  enum Role {
    USER
    ADMIN
  }

  enum RoomStatus {
    AVAILABLE
    MAINTENANCE
    UNAVAILABLE
  }

  enum BookingStatus {
    PENDING
    PROCESSING
    APPROVED
    REJECTED
    CANCELLED
    COMPLETED
  }

  enum NotificationType {
    INFO
    SUCCESS
    WARNING
    ERROR
    BOOKING_APPROVED
    BOOKING_REJECTED
    BOOKING_REMINDER
  }

  # Statistics Types
  type DashboardStats {
    totalBookings: Int!
    activeBookings: Int!
    completedBookings: Int!
    pendingBookings: Int!
    cancelledBookings: Int!
  }

  type AdminStats {
    totalUsers: Int!
    totalRooms: Int!
    totalBookings: Int!
    totalRevenue: Float!
    pendingApprovals: Int!
    activeBookings: Int!
    availableRooms: Int!
    occupancyRate: Float!
  }

  # Auth Response
  type AuthPayload {
    token: String!
    user: User!
  }

  # Generic Response
  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  # Queries
  type Query {
    # User Queries
    me: User
    user(id: ID!): User
    users(role: Role): [User!]!

    # Room Queries
    room(id: ID!): Room
    rooms(status: RoomStatus, limit: Int, offset: Int): [Room!]!
    availableRooms(startTime: String!, endTime: String!): [Room!]!

    # Booking Queries
    booking(id: ID!): Booking
    bookings(userId: String, roomId: String, status: BookingStatus): [Booking!]!
    myBookings(status: BookingStatus): [Booking!]!
    upcomingBookings: [Booking!]!

    # Schedule Queries
    schedule(id: ID!): Schedule
    schedules(roomId: String): [Schedule!]!
    roomSchedules(roomId: ID!): [Schedule!]!

    # Notification Queries
    notifications(userId: String): [Notification!]!
    myNotifications(isRead: Boolean): [Notification!]!
    unreadNotificationCount: Int!

    # Statistics Queries
    dashboardStats: DashboardStats!
    adminStats: AdminStats!
  }

  # Mutations
  type Mutation {
    # Auth Mutations
    register(email: String!, password: String!, name: String!, phone: String, adminSecretKey: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # User Mutations
    updateUser(id: ID!, name: String, phone: String, avatar: String): User!
    updateUserRole(id: ID!, role: Role!): User!
    deleteUser(id: ID!): SuccessResponse!

    # Room Mutations
    createRoom(
      name: String!
      description: String
      capacity: Int!
      facilities: [String!]!
      floor: String
    ): Room!
    updateRoom(
      id: ID!
      name: String
      description: String
      capacity: Int
      facilities: [String!]
      floor: String
      status: RoomStatus
    ): Room!
    deleteRoom(id: ID!): SuccessResponse!

    # Booking Mutations
    createBooking(
      roomId: ID!
      startTime: String!
      endTime: String!
      purpose: String!
      attendees: Int
      documentUrl: String
      documentName: String
      notes: String
    ): Booking!
    updateBooking(
      id: ID!
      startTime: String
      endTime: String
      purpose: String
      attendees: Int
      documentUrl: String
      documentName: String
      notes: String
    ): Booking!
    updateBookingStatus(id: ID!, status: BookingStatus!, adminNote: String, approvedDocumentUrl: String, approvedDocumentName: String): Booking!
    cancelBooking(id: ID!): SuccessResponse!
    deleteBooking(id: ID!): SuccessResponse!

    # Schedule Mutations
    createSchedule(
      roomId: ID!
      dayOfWeek: Int!
      startTime: String!
      endTime: String!
      isAvailable: Boolean
      notes: String
    ): Schedule!
    updateSchedule(
      id: ID!
      dayOfWeek: Int
      startTime: String
      endTime: String
      isAvailable: Boolean
      notes: String
    ): Schedule!
    deleteSchedule(id: ID!): SuccessResponse!

    # Notification Mutations
    createNotification(
      userId: String!
      title: String!
      message: String!
      type: NotificationType
    ): Notification!
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead(userId: String!): SuccessResponse!
    deleteNotification(id: ID!): SuccessResponse!
  }
`;
