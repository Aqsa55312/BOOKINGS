import { gql } from '@apollo/client';

// ============= BOOKING MUTATIONS =============
export const CREATE_BOOKING = gql`
  mutation CreateBooking(
    $roomId: ID!
    $startTime: String!
    $endTime: String!
    $purpose: String!
    $attendees: Int
    $documentUrl: String
    $documentName: String
    $notes: String
  ) {
    createBooking(
      roomId: $roomId
      startTime: $startTime
      endTime: $endTime
      purpose: $purpose
      attendees: $attendees
      documentUrl: $documentUrl
      documentName: $documentName
      notes: $notes
    ) {
      id
      room {
        id
        name
      }
      startTime
      endTime
      purpose
      attendees
      status
      documentUrl
      documentName
      notes
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking(
    $id: ID!
    $startTime: String
    $endTime: String
    $purpose: String
    $attendees: Int
    $documentUrl: String
    $documentName: String
    $notes: String
  ) {
    updateBooking(
      id: $id
      startTime: $startTime
      endTime: $endTime
      purpose: $purpose
      attendees: $attendees
      documentUrl: $documentUrl
      documentName: $documentName
      notes: $notes
    ) {
      id
      startTime
      endTime
      purpose
      attendees
      status
      documentUrl
      documentName
      notes
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id) {
      success
      message
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      success
      message
    }
  }
`;

// ============= ROOM MUTATIONS (ADMIN) =============
export const CREATE_ROOM = gql`
  mutation CreateRoom(
    $name: String!
    $description: String
    $capacity: Int!
    $facilities: [String!]!
    $floor: String
  ) {
    createRoom(
      name: $name
      description: $description
      capacity: $capacity
      facilities: $facilities
      floor: $floor
    ) {
      id
      name
      description
      capacity
      facilities
      status
      floor
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom(
    $id: ID!
    $name: String
    $description: String
    $capacity: Int
    $facilities: [String!]
    $floor: String
    $status: RoomStatus
  ) {
    updateRoom(
      id: $id
      name: $name
      description: $description
      capacity: $capacity
      facilities: $facilities
      floor: $floor
      status: $status
    ) {
      id
      name
      description
      capacity
      facilities
      status
      floor
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id) {
      success
      message
    }
  }
`;

// ============= BOOKING MANAGEMENT (ADMIN) =============
export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus(
    $id: ID!
    $status: BookingStatus!
    $adminNote: String
    $approvedDocumentUrl: String
    $approvedDocumentName: String
  ) {
    updateBookingStatus(
      id: $id
      status: $status
      adminNote: $adminNote
      approvedDocumentUrl: $approvedDocumentUrl
      approvedDocumentName: $approvedDocumentName
    ) {
      id
      status
      adminNote
      approvedDocumentUrl
      approvedDocumentName
    }
  }
`;

export const APPROVE_BOOKING = gql`
  mutation ApproveBooking($id: ID!, $adminNote: String, $approvedDocumentUrl: String, $approvedDocumentName: String) {
    updateBookingStatus(
      id: $id
      status: APPROVED
      adminNote: $adminNote
      approvedDocumentUrl: $approvedDocumentUrl
      approvedDocumentName: $approvedDocumentName
    ) {
      id
      status
      adminNote
      approvedDocumentUrl
      approvedDocumentName
    }
  }
`;

export const COMPLETE_BOOKING = gql`
  mutation CompleteBooking($id: ID!) {
    updateBookingStatus(
      id: $id
      status: COMPLETED
    ) {
      id
      status
    }
  }
`;

export const REJECT_BOOKING = gql`
  mutation RejectBooking($id: ID!, $adminNote: String) {
    updateBookingStatus(id: $id, status: REJECTED, adminNote: $adminNote) {
      id
      status
      adminNote
    }
  }
`;

// ============= USER MANAGEMENT (ADMIN) =============
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: Role!) {
    updateUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;
