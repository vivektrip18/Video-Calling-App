let GLOBAL_ROOM_ID = 1;

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(user, meetingCode) {
        const roomExists = this.rooms.has(meetingCode);
        const existingRoom = this.rooms.get(meetingCode);

        if (roomExists) {

            if (this.isRoomFull(meetingCode)) {
                user.socket.emit("room-full", { message: "This room is already full. Please try another." });
                return null;
            } else {
                if (existingRoom.user1) {
                    existingRoom.user2 = user;
                } else {
                    existingRoom.user1 = user;
                }
                this.rooms.set(meetingCode, existingRoom);
                return existingRoom;
            }

        } else {
            const newRoom = { user1: user, user2: null };
            this.rooms.set(meetingCode, newRoom);
            return newRoom;
        }
    }


    getRoomByCode(meetingCode) {
        return this.rooms.get(meetingCode);
    }

    isRoomFull(meetingCode) {
        const room = this.rooms.get(meetingCode);
        return room && room.user1 !== null && room.user2 !== null;
    }

    onOffer(meetingCode, sdp, senderSocketId) {
        const room = this.rooms.get(meetingCode);
        if (!room) return;

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        if (receivingUser) {
            receivingUser.socket.emit("offer", { sdp, meetingCode });
        }
    }

    onAnswer(meetingCode, sdp, senderSocketId) {
        const room = this.rooms.get(meetingCode);
        if (!room) return;

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        if (receivingUser) {
            receivingUser.socket.emit("answer", { sdp, meetingCode });
        }
    }

    onIceCandidates(meetingCode, senderSocketId, candidate, type) {
        const room = this.rooms.get(meetingCode);
        if (!room) return;

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        if (receivingUser) {
            receivingUser.socket.emit("add-ice-candidate", { candidate, type });
        }
    }

   
}
