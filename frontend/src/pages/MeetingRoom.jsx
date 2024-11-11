import { useEffect, useRef, useState } from "react";
import { Chat } from "../components/Chat";
import { Avatar, Button } from "@nextui-org/react";
import { CameraIcon } from "../components/CameraIcon";
import { MicrophoneIcon } from "../components/MicrophoneIcon";
import { Snippet } from "@nextui-org/snippet";
import { io } from "socket.io-client";


export const MeetingRoom = ({ username }) => {
    const userVideoRef = useRef();
    const remoteVideoRef = useRef();
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [sendingPc, setSendingPc] = useState(null);
    const [receivingPc, setReceivingPc] = useState(null);
    const [socket, setSocket] = useState(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState(null);

    const configuration = {
        iceServers: [
            {
                urls: ["stun:stun2.l.google.com:5349"]
            },
        ],
        iceCandidatePoolSize: 20,
    };

    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: isVideoOn,
                    audio: isAudioOn,
                });
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = stream;
                }
                setLocalStream(stream);
            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        initializeMedia();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
            setLocalStream(null);
        };
    }, [isVideoOn, isAudioOn]);



    useEffect(() => {
        const socket = io("ws://localhost:3000", {
            transports: ["websocket"]
        });
        socket.on('connect', function () {
            console.log('connected!');
        });
        socket.on("send-offer", async ({ meetingCode }) => {
            console.log("receiving offer to join the call in meetingroom.jsx");

            const pc = new RTCPeerConnection(configuration);

            setSendingPc(pc);

            // localStream?.getTracks().forEach(track => {
            //     pc.addTrack(track);  
            // });

            localStream?.getVideoTracks().forEach(videoTrack => {
                videoTrack.enabled = isVideoOn;
            });

            localStream?.getAudioTracks().forEach(audioTrack => {
                audioTrack.enabled = isAudioOn;
            });

            pc.onicecandidate = async (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        meetingCode
                    });
                }
            };

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    meetingCode
                })
            }
        });

        socket.on("offer", async ({ sdp: remoteSdp, meetingCode }) => {
            console.log("Received an offer from another user line 98");
            const pc = new RTCPeerConnection(configuration);
            setReceivingPc(pc);

            await pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            await pc.setLocalDescription(sdp);

            const remoteStream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }

            setRemoteMediaStream(remoteStream);
            window.pcr = pc;

            pc.ontrack = (e) => {
                remoteStream.addTrack(e.track);
            };

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        meetingCode
                    });
                }
            };

            socket.emit("answer", {
                meetingCode,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }

                remoteVideoRef.current.srcObject.addTrack(track1)
                remoteVideoRef.current.srcObject.addTrack(track2)
                remoteVideoRef.current.play();

            }, 2000)
        });


        socket.on("answer", ({ meetingCode, sdp: remoteSdp }) => {
            console.log("connection established line 136")

            setSendingPc((pc) => {
                pc?.setRemoteDescription(new RTCSessionDescription(remoteSdp));
                return pc;
            });
        });

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            console.log("connection established line 143")
            if (type == "sender") {
                setReceivingPc((pc) => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc((pc) => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
        return () => {
            socket.disconnect();
            sendingPc?.close();
            receivingPc?.close();
        };
    }, [username]);


    const toggleVideo = () => {
        setIsVideoOn((prev) => {
            const newState = !prev;
            localStream?.getVideoTracks().forEach(track => {
                track.enabled = newState;
            });
            return newState;
        });
    };

    const toggleAudio = () => {
        setIsAudioOn((prev) => {
            const newState = !prev;
            localStream?.getAudioTracks().forEach(track => {
                track.enabled = newState;
            });
            return newState;
        });
    };

    const MeetingCode = window.location.pathname.replace('/meeting/', '');
    return (
        <div className="h-screen flex pt-4 pb-4">
            <div className="bg-gray-800 mr-2 rounded-md p-6 ml-4 w-[70%]">

                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full rounded-lg"
                    id="remoteVideoRef"
                />
            </div>
            <div className="grid grid-rows-2 gap-2 mr-2 w-[30%]">
                <div className="bg-gray-800 rounded-md justify-center flex flex-wrap items-center">
                    {isVideoOn ? (
                        <video
                            ref={userVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full rounded-lg"
                            id="userVideoRef"
                        />
                    ) : (
                        <Avatar
                            name={username[0] ? username[0] : "?"}
                            size="lg"
                            className="mr-auto ml-auto text-2xl"
                        />
                    )}
                </div>

                <Chat username={username} />
            </div>
            <div>
                <Button
                    onClick={toggleVideo}
                    color={isVideoOn ? "secondary" : "warning"}
                    size="sm"
                    className="mr-2"
                >
                    <CameraIcon />
                </Button>
                <Button
                    onClick={toggleAudio}
                    color={isAudioOn ? "secondary" : "warning"}
                    size="sm"

                >
                    <MicrophoneIcon />
                </Button>
                <Snippet symbol="" className="mt-2">{MeetingCode}</Snippet>
            </div>
        </div>
    );
};
