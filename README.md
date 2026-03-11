# 👋 Welcome to CuriOS

**CuriOS** is a *Conversational OS* — an operating system where the primary interface is **chat**. Instead of clicking through menus, users type what they want, and CuriOS routes the message through conversational flows to produce the next response.

---

## 🧠 What is a Conversational OS?

A Conversational OS is an interface pattern where:

- **Chat is the UI** — commands, settings, onboarding, and "apps" are invoked through natural language
- **State is explicit** — the system remembers where you are in a flow (e.g., signing in, setting a provider, updating a password)
- **The system does the orchestration** — it turns free-form text into deterministic actions via rule-based commands and/or an LLM-powered intent classifier

In practice, CuriOS behaves like a small operating layer that lives inside a chat thread.

---

## ✨ Core Capabilities

- **Session-based conversations** — context persists across turns
- **Onboarding flows** — guided auth and provider configuration
- **Provider abstraction** — swap between LLM backends without changing the OS logic
- **Intent handling** — map user messages to a controlled set of system actions
- **Message history** — store and retrieve conversation messages with secret redaction

---

## 💬 Common things you can say

| Intent | Example |
|--------|---------|
| Help | `"help"` |
| Settings | `"show my settings"` |
| Profile | `"change my name"` |
| Security | `"change my password"` |
| Providers | `"change provider"` |
| Account | `"delete my user"` |

---

## 🗂️ Repositories

| Repo | Description |
|------|-------------|
| [curios-browser](https://github.com/curi-os/curios-browser) | The front-end browser interface for CuriOS, built with React + TypeScript |
| [docs](https://github.com/curi-os/docs) | Documentation covering architecture, flows, and project concepts |

---

## 🚀 How It Works

1. **You send a message** (e.g., `"help"`, `"sign in"`, `"change provider"`)
2. CuriOS **resolves your session context** — who you are, where you are in the flow, what's configured
3. Your message is routed through a **state machine**:
   - Not authenticated → auth / onboarding flow
   - No AI provider configured → provider setup flow
   - Otherwise → ready state, where commands and intents are handled
4. CuriOS returns the next reply and **persists** updated state and message history

---

## 🗺️ Roadmap Ideas

- More "apps" (notes, files, browser automation) behind conversational intents
- Tool / plugin system with structured tool calls and safety checks
- Fine-grained permissions per intent and app
- Better session replay and debugging tools

---

> **CuriOS** — making chat interactions reliable, stateful, and OS-like.