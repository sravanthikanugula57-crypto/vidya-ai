import React from 'react';
import { DedicatedVideoPlayerModal, DedicatedVideoItem } from './DedicatedVideoPlayerModal';

export interface VideoItem extends DedicatedVideoItem {}

interface VideoModalPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
  allLessons?: VideoItem[];
  userId?: string;
  onMarkCompleted?: () => void;
  isCompleted?: boolean;
}

export const VideoModalPlayer: React.FC<VideoModalPlayerProps> = ({
  isOpen,
  onClose,
  video,
  allLessons,
  userId = 'std_101',
  onMarkCompleted,
  isCompleted = false
}) => {
  return (
    <DedicatedVideoPlayerModal
      isOpen={isOpen}
      onClose={onClose}
      video={video}
      allLessons={allLessons}
      userId={userId}
      onMarkCompleted={onMarkCompleted}
      isCompleted={isCompleted}
    />
  );
};

