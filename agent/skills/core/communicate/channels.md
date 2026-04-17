# Channel Reference

How the agent communicates depends on which channel carries the conversation. Each channel has unique constraints, capabilities, and conventions.

## CLI (Command Line Interface)

| Property       | Value                          |
|----------------|--------------------------------|
| Input format   | stdin (plain text)             |
| Output format  | stdout (markdown supported)    |
| Context        | Session-based (persists until exit) |
| Length limit    | None                           |
| Media support  | Text only, code blocks         |
| Authentication | Local user (no auth needed)    |

**Conventions:**
- Use markdown formatting freely (headers, lists, code blocks)
- Long responses are fine — the user can scroll
- Session context lives in memory; no persistence between sessions unless explicitly saved

## Telegram

| Property       | Value                          |
|----------------|--------------------------------|
| Input format   | Text, photos, voice messages, documents |
| Output format  | Text (limited markdown), photos, documents |
| Context        | Chat-based (persists per chat) |
| Length limit    | 4096 characters per message    |
| Media support  | Photos, voice, documents, stickers |
| Authentication | Bot token (via BotFather)      |

**Conventions:**
- Keep messages under 4096 chars — split long responses into multiple messages
- Use Telegram-flavored markdown (bold, italic, code, links)
- Respect rate limits: max 30 messages/second globally, 1 message/second per chat
- Voice messages require transcription before processing
- Photos may need vision/OCR processing

**Rate Limits:**
- 30 messages/second across all chats
- 20 messages/minute to the same chat
- 1 message/second to the same chat (recommended)

## Webhook (HTTP)

| Property       | Value                          |
|----------------|--------------------------------|
| Input format   | HTTP POST, JSON body           |
| Output format  | JSON response                  |
| Context        | Stateless (no session)         |
| Length limit    | Practical limit ~1MB           |
| Media support  | JSON payloads, URLs            |
| Authentication | API key, webhook secret, or HMAC |

**Conventions:**
- Every request is independent — include all needed context in the payload
- Respond with structured JSON, not free text
- Include status codes and error messages in responses
- Validate webhook signatures before processing
- Respond within timeout (typically 30 seconds)

**Expected payload format:**
```json
{
  "event": "message",
  "source": "integration-name",
  "content": "the message or data",
  "metadata": {}
}
```

**Response format:**
```json
{
  "status": "ok",
  "response": "the agent's reply",
  "actions": []
}
```
