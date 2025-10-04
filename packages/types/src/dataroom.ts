export interface DataRoom {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  settings: {
    allowDownload: boolean;
    requireAuth: boolean;
    expiresAt?: string;
  };
}

export interface DataRoomAccess {
  id: string;
  dataRoomId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export interface CreateDataRoomRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  settings?: Partial<DataRoom['settings']>;
}

export interface UpdateDataRoomRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  settings?: Partial<DataRoom['settings']>;
}

export interface DataRoomInvite {
  id: string;
  dataRoomId: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  token: string;
  used: boolean;
}