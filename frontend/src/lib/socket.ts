import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '../config'

let socket: Socket | null = null

export function getSocket(): Socket | null {
	return socket
}

export function connectSocket(userId?: number | string) {
	if (!socket) {
		socket = io(SOCKET_URL, { withCredentials: true, autoConnect: true })
		socket.on('connect', () => {
			if (userId) socket?.emit('register:user', userId)
		})
	}
	return socket
}

export function joinAuction(auctionId: number | string) {
	if (!socket) return
	socket.emit('join:auction', auctionId)
}

export function onNewBid(handler: (payload: any) => void) {
	socket?.on('auction:new_bid', handler)
}
export function offNewBid(handler: (payload: any) => void) {
	socket?.off('auction:new_bid', handler)
}

export function onAuctionEnded(handler: (payload: any) => void) {
	socket?.on('auction:ended', handler)
}
export function offAuctionEnded(handler: (payload: any) => void) {
	socket?.off('auction:ended', handler)
}

export function onMessage(handler: (payload: any) => void) {
	socket?.on('message:received', handler)
}
export function offMessage(handler: (payload: any) => void) {
	socket?.off('message:received', handler)
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect()
		socket = null
	}
}
