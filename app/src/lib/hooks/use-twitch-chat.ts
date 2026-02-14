"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type ChatMessage = {
    id: string
    username: string
    message: string
    color: string
    isAction: boolean
}

interface UseTwitchChatProps {
    channel: string
    onCommand?: (command: string, username: string) => void
}

export function useTwitchChat({ channel, onCommand }: UseTwitchChatProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const clientRef = useRef<any>(null) // Using any to avoid complex type issues with tmi.js dynamic import

    const connect = useCallback(async () => {
        if (!channel) return

        try {
            // Dynamically import tmi.js (client-side only)
            const tmi = (await import("tmi.js")).default

            const client = new tmi.Client({
                channels: [channel],
                connection: {
                    secure: true,
                    reconnect: true
                }
            })

            // @ts-ignore
            client.on("message", (target, context, msg, self) => {
                if (self) return // Ignore messages from the bot itself

                const newMessage: ChatMessage = {
                    id: context.id || String(Date.now()),
                    username: context["display-name"] || context.username || "Anonymous",
                    message: msg,
                    color: context.color || "#A855F7",
                    isAction: context["message-type"] === "action"
                }

                setMessages(prev => [newMessage, ...prev].slice(0, 50)) // Keep last 50

                // Detect commands starting with "!"
                if (msg.startsWith("!") && onCommand) {
                    const command = msg.split(" ")[0].toLowerCase()
                    onCommand(command, newMessage.username)
                }
            })

            // @ts-ignore
            client.on("connected", () => {
                setIsConnected(true)
                console.log(`Connected to Twitch channel: ${channel}`)
            })

            // @ts-ignore
            client.on("disconnected", () => {
                setIsConnected(false)
                console.log("Disconnected from Twitch")
            })

            await client.connect()
            clientRef.current = client
        } catch (err) {
            console.error("Failed to connect to Twitch:", err)
            setIsConnected(false)
        }
    }, [channel, onCommand])

    const disconnect = useCallback(async () => {
        if (clientRef.current) {
            try {
                await clientRef.current.disconnect()
            } catch (e) {
                console.warn("Disconnect error", e)
            }
            clientRef.current = null
            setIsConnected(false)
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect().catch(() => { })
            }
        }
    }, [])

    return {
        isConnected,
        messages,
        connect,
        disconnect
    }
}
