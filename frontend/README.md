# DoDay 🎯

**Your Daily Productivity Companion**

DoDay is a modern, intuitive productivity app that helps you set daily goals, track progress, and stay focused on what matters most. Built with React, Firebase, and beautiful animations to make productivity enjoyable.

## ✨ Features

- **🎯 Smart Goal Management** - Add multiple goals with comma separation
- **📊 Real-time Progress Tracking** - Visual progress bars and completion stats
- **🔥 Firebase Integration** - Secure authentication and persistent data storage
- **🌓 Dark/Light Mode** - Beautiful themes with preference memory
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚡ Live Goal Preview** - See your goals as you type them
- **🎨 Smooth Animations** - Powered by Framer Motion for delightful interactions
- **📅 Daily Focus** - Automatically shows only today's goals

## 🛠️ Built With

- **Frontend:** React 18, Vite, TailwindCSS v4
- **Backend:** Firebase (Auth + Firestore)
- **Animations:** Framer Motion
- **Icons:** Heroicons
- **Deployment:** Vercel (or your chosen platform)

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
2. **Install dependencies**
3. **Set up Firebase**
- Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
- Enable Authentication (Google provider)
- Enable Firestore Database
- Copy your Firebase config

4. **Environment setup**
Add your Firebase configuration to `.env.local`:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

5. **Start the development server**
Navigate to `http://localhost:5173`

## 📖 Usage

1. **Sign in** with your Google account
2. **Add goals** by typing them in the input field (separate multiple goals with commas)
3. **Track progress** as you complete goals throughout the day
4. **Switch themes** using the toggle in the header
5. **Sign out** when you're done

### Example Goal Input
Finish quarterly report, call 3 clients, organize workspace, review budget

This creates 4 separate goals that you can complete individually.

## 🏗️ Project Structure
src/
├── components/ # React components
│ ├── GoalInput.jsx # Goal input form with live preview
│ ├── TaskBreakdown.jsx # Individual goal items
│ ├── ProgressSummary.jsx # Progress tracking
│ ├── GroupedGoals.jsx # Goal organization
│ └── ThemeToggle.jsx # Dark/light mode toggle
├── contexts/ # React contexts
│ └── ThemeContext.jsx # Theme management
├── utils/ # Utility functions
│ └── firestoreUtils.js # Firebase operations
├── firebase.js # Firebase configuration
├── App.jsx # Main application component
└── main.jsx # Application entry point

## 🔧 Configuration

### Firebase Rules

Set up Firestore security rules:
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId}/goals/{goalId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

### TailwindCSS v4

This project uses TailwindCSS v4 with custom dark mode configuration in `src/index.css`:
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

## 🚀 Deployment

### Deploy to Vercel

1. **Build the project**
npm run build

2. **Deploy to Vercel**
npx vercel --prod

3. **Set environment variables** in Vercel dashboard

### Deploy to Netlify

1. **Build the project**
2. **Deploy the `dist` folder** to Netlify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Firebase](https://firebase.google.com/) for backend services
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Heroicons](https://heroicons.com/) for beautiful icons

---

**Made with ❤️ and ☕ for productive people everywhere**



