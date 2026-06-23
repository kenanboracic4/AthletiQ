'use client'
import { use } from "react";
import ChatApp from "@/components/Chat/ChatApp";

export default function ChatPage({ params }) {
    const { id } = use(params);
    return <ChatApp initialChatId={id} />;
}
