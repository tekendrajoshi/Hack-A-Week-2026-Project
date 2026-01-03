import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
} from 'lucide-react';

interface VideoCallProps {
  isInCall: boolean;
  isCalling: boolean;
  isReceivingCall: boolean;
  callerName: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isInCall,
  isCalling,
  isReceivingCall,
  callerName,
  isAudioEnabled,
  isVideoEnabled,
  localVideoRef,
  remoteVideoRef,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
}) => {
  // Incoming call modal
  if (isReceivingCall) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-6 max-w-sm w-full mx-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Phone className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Incoming Call</h3>
              <p className="text-muted-foreground">{callerName || 'Someone'} is calling you</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={onRejectCall}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600"
                onClick={onAcceptCall}
              >
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Active call view
  if (isInCall || isCalling) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Video container */}
        <div className="flex-1 relative bg-muted">
          {/* Remote video (full screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg overflow-hidden shadow-lg bg-muted">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Calling indicator */}
          {isCalling && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-lg font-medium">Calling...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex justify-center gap-4">
            <Button
              variant={isAudioEnabled ? 'secondary' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={onToggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant={isVideoEnabled ? 'secondary' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={onToggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={onEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VideoCall;
