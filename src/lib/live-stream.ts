/**
 * In-memory Live Lounge message store + SSE event bus.
 *
 * Designed for a true "live" chat feel: messages are ephemeral and only live
 * in server memory. They are broadcast to connected SSE clients in real time
 * and are cleared on server restart (or page reload for new viewers).
 *
 * Single-server deployment (next start, one Node.js process) so an in-memory
 * store is sufficient. For serverless/multi-instance, replace with a shared
 * store (e.g., Redis/pub-sub).
 */

export interface LiveMessagePayload {
  id: string;
  channel: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  hearts: number;
  heartedByMe: boolean;
  createdAt: string;
}

export type LiveStreamEvent =
  | { type: 'message'; payload: LiveMessagePayload }
  | { type: 'heart'; payload: { id: string; hearts: number; heartedByMe: boolean } };

export interface LiveSEEClient {
  channel: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  closed: boolean;
}

const MAX_MESSAGES_PER_CHANNEL = 200;

// channel -> ordered messages (oldest first). Bounded to MAX_MESSAGES_PER_CHANNEL.
const channelMessages = new Map<string, LiveMessagePayload[]>();

// messageId -> Set of userIds who hearted it (used to enforce unique hearts & heartedByMe).
const messageHearts = new Map<string, Set<string>>();

// channel -> connected SSE clients.
const clientsMap = new Map<string, Set<LiveSEEClient>>();

// ip -> number of open SSE connections (DoS guard).
const connectionCountByIp = new Map<string, number>();

// Max concurrent SSE connections per IP.
export const MAX_CONNECTIONS_PER_IP = 5;

let messageCounter = 0;

function nowIso(): string {
  return new Date().toISOString();
}

export function channelMessageCount(channel: string): number {
  return channelMessages.get(channel)?.length ?? 0;
}

export function getChannelMessages(channel: string, currentUserId: string | null | undefined): LiveMessagePayload[] {
  const list = channelMessages.get(channel) ?? [];
  return list.map((m) => ({
    ...m,
    heartedByMe: currentUserId ? (messageHearts.get(m.id)?.has(currentUserId) ?? false) : false,
  }));
}

export function addChannelMessage(
  channel: string,
  input: { userId?: string; userName: string; userAvatar: string | null; content: string }
): LiveMessagePayload {
  const id = 'msg-' + (++messageCounter).toString(36) + '-' + Date.now().toString(36);
  const message: LiveMessagePayload = {
    id,
    channel,
    userName: input.userName,
    userAvatar: input.userAvatar,
    content: input.content,
    hearts: 0,
    heartedByMe: false,
    createdAt: nowIso(),
  };

  let list = channelMessages.get(channel);
  if (!list) {
    list = [];
    channelMessages.set(channel, list);
  }
  list.push(message);
  if (list.length > MAX_MESSAGES_PER_CHANNEL) {
    const removed = list.splice(0, list.length - MAX_MESSAGES_PER_CHANNEL);
    // Drop removed hearts from memory to avoid leaks.
    for (const r of removed) messageHearts.delete(r.id);
  }

  return message;
}

export function toggleMessageHeart(
  channel: string,
  messageId: string,
  userId: string
): { hearts: number; heartedByMe: boolean } | null {
  const list = channelMessages.get(channel);
  if (!list) return null;
  const msg = list.find((m) => m.id === messageId);
  if (!msg) return null;

  let set = messageHearts.get(messageId);
  if (!set) {
    set = new Set();
    messageHearts.set(messageId, set);
  }

  let heartedByMe: boolean;
  if (set.has(userId)) {
    set.delete(userId);
    msg.hearts = Math.max(0, msg.hearts - 1);
    heartedByMe = false;
  } else {
    set.add(userId);
    msg.hearts += 1;
    heartedByMe = true;
  }

  if (set.size === 0) messageHearts.delete(messageId);

  return { hearts: msg.hearts, heartedByMe };
}

export function acquireConnectionSlot(ip: string): boolean {
  const current = connectionCountByIp.get(ip) ?? 0;
  if (current >= MAX_CONNECTIONS_PER_IP) return false;
  connectionCountByIp.set(ip, current + 1);
  return true;
}

export function releaseConnectionSlot(ip: string): void {
  const current = connectionCountByIp.get(ip) ?? 0;
  if (current <= 1) {
    connectionCountByIp.delete(ip);
  } else {
    connectionCountByIp.set(ip, current - 1);
  }
}

// ── SSE client registration / broadcasting ───────────────────────────────────

export function registerLiveClient(
  channel: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): () => void {
  const client: LiveSEEClient = { channel, controller, encoder, closed: false };
  if (!clientsMap.has(channel)) clientsMap.set(channel, new Set());
  clientsMap.get(channel)!.add(client);

  return () => {
    client.closed = true;
    clientsMap.get(channel)?.delete(client);
    if (clientsMap.get(channel)?.size === 0) clientsMap.delete(channel);
  };
}

export function broadcastLiveEvent(channel: string, event: LiveStreamEvent): void {
  const clients = clientsMap.get(channel);
  if (!clients) return;
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    if (client.closed) continue;
    try {
      client.controller.enqueue(encoder.encode(data));
    } catch {
      client.closed = true;
      clients.delete(client);
    }
  }
}
