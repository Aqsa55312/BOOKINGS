import { gql } from '@apollo/client';

// ============= ROOM QUERIES =============
export const GET_ROOMS = gql`
  query GetRooms($status: RoomStatus, $limit: Int, $offset: Int) {
    rooms(status: $status, limit: $limit, offset: $offset) {
      id
      name
      description
      capacity
      facilities
      status
      floor
      createdAt
    }
  }
`;

export const GET_ROOMS_WITH_BOOKINGS = gql`
  query GetRoomsWithBookings($status: RoomStatus) {
    rooms(status: $status) {
      id
      name
      description
      capacity
      facilities
      status
      floor
      createdAt
    }
  }
`;

export const GET_ROOM_BY_ID = gql`
  query GetRoomById($id: ID!) {
    room(id: $id) {
      id
      name
      description
      capacity
      facilities
      status
      floor
      createdAt
    }
  }
`;

export const GET_ROOM_BOOKINGS = gql`
  query GetRoomBookings($roomId: String!, $status: BookingStatus) {
    bookings(roomId: $roomId, status: $status) {
      id
      user {
        name
      }
      startTime
      endTime
      status
    }
  }
`;

// ============= BOOKING QUERIES =============
export const GET_MY_BOOKINGS = gql`
  query GetMyBookings($status: BookingStatus) {
    myBookings(status: $status) {
      id
      room {
        id
        name
        floor
      }
      startTime
      endTime
      purpose
      attendees
      status
      documentUrl
      documentName
      approvedDocumentUrl
      approvedDocumentName
      adminNote
      notes
      createdAt
    }
  }
`;

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings($userId: String, $roomId: String, $status: BookingStatus) {
    bookings(userId: $userId, roomId: $roomId, status: $status) {
      id
      user {
        id
        name
        email
      }
      room {
        id
        name
        floor
      }
      startTime
      endTime
      purpose
      attendees
      status
      documentUrl
      documentName
      approvedDocumentUrl
      approvedDocumentName
      adminNote
      notes
      createdAt
    }
  }
`;

export const GET_BOOKING_BY_ID = gql`
  query GetBookingById($id: ID!) {
    booking(id: $id) {
      id
      room {
        id
        name
        description
        images
        location
        floor
      }
      startTime
      endTime
      purpose
      attendees
      status
      documentUrl
      documentName
      adminNote
      notes
      createdAt
    }
  }
`;

// ============= STATISTICS QUERIES =============
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalBookings
      activeBookings
      completedBookings
      pendingBookings
      cancelledBookings
    }
  }
`;

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminStats {
      totalUsers
      totalRooms
      totalBookings
      totalRevenue
      pendingApprovals
      activeBookings
      availableRooms
      occupancyRate
    }
  }
`;

// ============= USER QUERIES =============
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      phone
      role
      avatar
      createdAt
    }
  }
`;
