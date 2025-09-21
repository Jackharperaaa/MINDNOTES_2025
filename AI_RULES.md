# AI Rules for Mind Notes Application

This document outlines the core technologies and best practices for developing the Mind Notes application.

## Tech Stack Overview

*   **Frontend Framework:** React with TypeScript, powered by Vite for a fast development experience.
*   **Styling:** Tailwind CSS for utility-first styling, complemented by `shadcn/ui` for accessible and customizable UI components.
*   **Animations:** Framer Motion for smooth and engaging user interface animations.
*   **State Management:** `localStorage` for client-side data persistence, and `@tanstack/react-query` for server state management and data fetching.
*   **Routing:** React Router for declarative client-side routing.
*   **AI Integration:** OpenRouter API for all AI-powered features, specifically using the DeepSeek Chat model.
*   **Icons:** Lucide React for a consistent and extensive icon set.
*   **Form Handling:** React Hook Form with Zod for robust form validation and management.
*   **Date Utilities:** `date-fns` for efficient date manipulation.
*   **Toast Notifications:** `sonner` for elegant and user-friendly toast messages.
*   **Multi-Platform:** Built as both a Progressive Web App (PWA) and a Chrome Extension (Manifest V3).

## Library Usage Guidelines

To maintain consistency, performance, and ease of development, please adhere to the following rules when using libraries:

*   **Styling (Tailwind CSS):** Always use Tailwind CSS classes for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for very specific, non-Tailwind-addressable cases (which should be rare).
*   **UI Components (shadcn/ui):** Prioritize `shadcn/ui` components for common UI elements (buttons, inputs, dialogs, etc.). **Do not modify the files within `src/components/ui` directly.** If a `shadcn/ui` component needs customization beyond its props, create a new component that wraps or extends it, or build a new component from scratch in `src/components/`.
*   **Animations (Framer Motion):** Use Framer Motion for all interactive animations and transitions.
*   **Data Persistence (localStorage):** For client-side data storage, use the `useLocalStorage` hook.
*   **Server State (React Query):** For fetching, caching, and updating server data (e.g., AI responses if they were persisted), use `@tanstack/react-query`.
*   **Routing (React Router):** Manage all application routes using React Router. Keep the main route definitions in `src/App.tsx`.
*   **Icons (Lucide React):** All icons should come from the `lucide-react` library.
*   **Forms (React Hook Form & Zod):** For any form creation and validation, use React Hook Form for form state management and Zod for schema validation.
*   **Date Operations (date-fns):** Use `date-fns` for any date formatting, parsing, or manipulation.
*   **Notifications (sonner):** Implement all toast notifications using the `sonner` library.
*   **AI Interactions (OpenRouter API):** All calls to AI models must go through the OpenRouter API. Ensure API keys are handled securely (e.g., via environment variables, not hardcoded).