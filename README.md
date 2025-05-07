# 🐝 National Spelling Bee Live Participation App

A real-time, interactive web application that allows audience members to join and participate in the National Spelling Bee while contenders compete live. Built with **Next.js**, **React**, **Node.js**, **Express**, and **Socket.IO**.

## 🚀 Features

* 🏁 **Host a Game** – Admin/host can create a room for a live spelling bee session.
* 🧑‍🤝‍🧑 **Join as Audience** – Audience members can join the room via room code.
* 🔤 **Live Participation** – Participants can submit their spelling guesses in real-time.
* 🧠 **Interactive Experience** – Simulates a true spelling bee environment for viewers.
* ⚡ **Socket.IO-powered** – Instant updates between host and audience without page reloads.
* 🛡️ **Secure and Scalable** – Built for national-level event participation.

---

## 🧱 Tech Stack

| Frontend        | Backend          | Realtime Communication | Framework |
| --------------- | ---------------- | ---------------------- | --------- |
| React (Next.js) | Node.js, Express | Socket.IO              | Next.js   |

---

## 🌍 Use Case

Imagine you're in the audience of the **National Spelling Bee**. As the contestant is spelling a word live on stage, you — the audience — receive the word and can submit your own guess. Your spelling is compared to the actual spelling, and you get real-time feedback on whether you were correct.

Perfect for:

* 🏆 National competitions
* 🎓 School spelling bees
* 🧪 Interactive language learning

---


## 🌍 Snapshots

Join a room or Host:

<img width="966" alt="Screenshot 2025-05-07 at 8 48 17 AM" src="https://github.com/user-attachments/assets/50394673-44d4-4f0a-914c-a466a4c7fa40" />


Host enters words for spelling bee:


<img width="1335" alt="Screenshot 2025-05-07 at 8 56 11 AM" src="https://github.com/user-attachments/assets/9104180f-32d6-454b-87e2-e896c6ec9d57" />



--- 

## 🖼️ App Architecture

```
Client (Next.js + React)
   |
   | Socket.IO (Client)
   ▼
Backend (Node.js + Express)
   |
   | Socket.IO (Server)
   ▼
Real-Time Room Management + Guess Validation
```

---

## 🧪 Live Demo

> Coming Soon! (Can be hosted via Vercel and Render/Heroku)

---

## 🔧 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/spelling-bee-app.git
cd spelling-bee-app
```

### 2. Install dependencies

```bash
# Install client & server dependencies
npm install
cd client && npm install
cd ..
```

### 3. Start the development server

```bash
# Start Express + Socket.IO backend
npm run server

# Start Next.js frontend
npm run dev
```

---

## 🧑‍💻 Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `npm run dev`    | Starts the Next.js frontend     |
| `npm run server` | Starts the Node + Socket.IO API |

---

## 🏗️ Folder Structure

```
/client          → Next.js + React Frontend
/server          → Express + Socket.IO Backend
/shared          → Shared Types and DTOs
```

---

## 🛠️ Future Enhancements

* Leaderboard for audience participants
* Timer for word submission
* Admin dashboard for hosts
* Word difficulty levels

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License

