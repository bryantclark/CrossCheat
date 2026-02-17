# CrossCheat

CrossCheat is a high-performance crossword game solver and analysis tool built with SvelteKit. It helps players find the best moves for NYT CrossPlay using the NASPA NWL23 dictionary. It was mostly built for my own curiousity on efficient algorthms after I built a brute force one and was surprised how slow it was. Front end was mostly built with Gemini flash in Google Antigravity. The code I find interesting is all in the `src/lib/solver` directory.

## Features

- **Interactive Board**: Easily input the current game state on a 15x15 grid.
- **Rack Management**: Enter your current tiles to find the best possible plays.
- **Advanced Solver**: Utilizes a Trie-based algorithm to quickly generate valid moves.
- **Move Preview**: Visualize potential moves on the board before playing them.
- **Local Storage**: Automatically saves your board and rack state so you never lose your progress.
- **Dictionary Support**: Powered by the NASPA NWL23 dictionary.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bryantclark/CrossCheat.git
   cd CrossCheat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:5173` to see the application.

### Building for Production

To create a production version of your app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
