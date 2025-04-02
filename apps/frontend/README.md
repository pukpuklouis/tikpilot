# TikPilot Frontend

A modern web interface for TikPilot built with Remix, TailwindCSS, and shadcn/ui components.

## Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with TailwindCSS and shadcn/ui components
- **State Management**: Uses Zustand for efficient state management
- **API Integration**: Configured API client for backend communication

## Tech Stack

- [Remix](https://remix.run/docs) - Full stack web framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Reusable UI components
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide React](https://lucide.dev/) - Icon library

## Project Structure

```
app/
├── components/       # UI components
│   ├── ui/           # shadcn/ui components
│   └── layout/       # Layout components
├── lib/              # Utility functions and shared code
│   ├── api.ts        # API client for backend communication
│   ├── store.ts      # Zustand store for state management
│   └── utils.ts      # Utility functions
└── routes/           # Application routes
    ├── _app.tsx      # Main application layout
    ├── _app._index.tsx   # Dashboard page
    ├── _app.emulators.tsx # Emulator setup page
    ├── _app.actions.tsx   # Action control page
    └── _app.settings.tsx  # Settings page
```

## Development

Run the development server:

```bash
npm run dev
```

This will start the Remix development server at [http://localhost:3000](http://localhost:3000).

## Building for Production

Build the application for production:

```bash
npm run build
```

Then run the application in production mode:

```bash
npm start
```

## Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

For example:

```bash
npx shadcn@latest add dialog
```

## API Integration

The frontend is configured to communicate with the backend API. The API client is located at `app/lib/api.ts`. By default, it connects to `http://localhost:3001/api`, but this can be configured in the settings page.
