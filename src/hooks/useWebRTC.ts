import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CallState {
  isInCall: boolean;
  isCalling: boolean;
  isReceivingCall: boolean;
  callerId: string | null;
  callerName: string | null;
  remoteUserId: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useWebRTC = (userId: string | undefined) => {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCalling: false,
    isReceivingCall: false,
    callerId: null,
    callerName: null,
    remoteUserId: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const sendSignal = async (receiverId: string, signalType: string, signalData: any) => {
    if (!userId) return;
    
    await supabase.from('call_signals').insert({
      caller_id: userId,
      receiver_id: receiverId,
      signal_type: signalType,
      signal_data: signalData,
    } as any);
  };

  // Setup realtime subscription for call signals
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('call-signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const signal = payload.new as any;
          console.log('Received signal:', signal.signal_type);

          switch (signal.signal_type) {
            case 'offer':
              await handleIncomingCall(signal);
              break;
            case 'answer':
              await handleAnswer(signal);
              break;
            case 'ice-candidate':
              await handleIceCandidate(signal);
              break;
            case 'call-ended':
            case 'call-rejected':
              endCallInternal();
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createPeerConnection = (remoteUserId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await sendSignal(remoteUserId, 'ice-candidate', event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      remoteStream.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCallInternal();
      }
    };

    return pc;
  };

  const handleIncomingCall = async (signal: any) => {
    // Get caller name
    const { data: profile } = await supabase
      .from('public_profiles')
      .select('username')
      .eq('id', signal.caller_id)
      .single();

    setCallState((prev) => ({
      ...prev,
      isReceivingCall: true,
      callerId: signal.caller_id,
      callerName: profile?.username || 'Unknown',
    }));

    // Store the offer for when user accepts
    peerConnection.current = createPeerConnection(signal.caller_id);
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(signal.signal_data)
    );
  };

  const handleAnswer = async (signal: any) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(signal.signal_data)
      );
    }
  };

  const handleIceCandidate = async (signal: any) => {
    if (peerConnection.current && signal.signal_data) {
      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(signal.signal_data)
        );
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const endCallInternal = () => {
    // Stop all tracks
    localStream.current?.getTracks().forEach((track) => track.stop());
    remoteStream.current?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    peerConnection.current?.close();

    // Reset refs
    localStream.current = null;
    remoteStream.current = null;
    peerConnection.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallState({
      isInCall: false,
      isCalling: false,
      isReceivingCall: false,
      callerId: null,
      callerName: null,
      remoteUserId: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
    });
  };

  const startCall = useCallback(
    async (remoteUserId: string, videoEnabled = true) => {
      if (!userId) return;

      try {
        setCallState((prev) => ({ 
          ...prev, 
          isCalling: true, 
          isVideoEnabled: videoEnabled,
          remoteUserId: remoteUserId,
        }));

        // Get local media
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: videoEnabled,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }

        // Create peer connection
        peerConnection.current = createPeerConnection(remoteUserId);

        // Add local tracks
        localStream.current.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, localStream.current!);
        });

        // Create and send offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        await sendSignal(remoteUserId, 'offer', offer);

        // Create notification for receiver
        await supabase.from('notifications').insert({
          user_id: remoteUserId,
          type: 'call',
          title: 'Incoming call',
          message: 'Someone is calling you',
        } as any);

        setCallState((prev) => ({ ...prev, isInCall: true, isCalling: false }));
      } catch (error) {
        console.error('Error starting call:', error);
        setCallState((prev) => ({ ...prev, isCalling: false }));
      }
    },
    [userId]
  );

  const acceptCall = useCallback(async () => {
    if (!peerConnection.current || !callState.callerId || !userId) return;

    try {
      // Get local media
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.isVideoEnabled,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Add local tracks
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });

      // Create and send answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      await sendSignal(callState.callerId, 'answer', answer);

      setCallState((prev) => ({
        ...prev,
        isReceivingCall: false,
        isInCall: true,
        remoteUserId: prev.callerId,
      }));
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  }, [callState.callerId, callState.isVideoEnabled, userId]);

  const rejectCall = useCallback(async () => {
    if (!callState.callerId || !userId) return;

    await sendSignal(callState.callerId, 'call-rejected', null);

    setCallState((prev) => ({
      ...prev,
      isReceivingCall: false,
      callerId: null,
      callerName: null,
    }));
  }, [callState.callerId, userId]);

  const endCall = useCallback(async () => {
    const remoteId = callState.remoteUserId || callState.callerId;
    
    if (remoteId && userId) {
      await sendSignal(remoteId, 'call-ended', null);
    }

    endCallInternal();
  }, [callState.remoteUserId, callState.callerId, userId]);

  const toggleAudio = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState((prev) => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, []);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};
