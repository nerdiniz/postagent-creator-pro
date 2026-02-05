
export type View = 'dashboard' | 'shorts' | 'videos' | 'channels' | 'history';

export interface VideoFile {
  id: string;
  name: string;
  size: string;
  resolution: string;
  status: 'Draft' | 'Scheduled' | 'Uploading' | 'Error' | 'Ready' | 'Pending';
  thumbnailUrl: string;
  duration?: string;
  progress?: number;
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  status: 'Connected' | 'Disconnected';
  isActive: boolean;
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

export interface HistoryItem {
  id: string;
  title: string;
  type: 'Video' | 'Short';
  channel: string;
  channelAvatar: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Published' | 'Scheduled' | 'Failed' | 'Pending';
  duration: string;
  thumbnailColor: string;
}
