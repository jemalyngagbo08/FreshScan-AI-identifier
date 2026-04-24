# FreshScan AI Identifier

FreshScan AI is a React + Vite web app that helps users identify whether a fruit or vegetable is fresh or rotten using a Google Teachable Machine image model.

Users can:
- scan produce with a live webcam
- upload an image for prediction
- review prediction confidence
- save recent scan history in the browser
- plug in a custom Teachable Machine model URL

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TensorFlow.js
- Google Teachable Machine image model
- Vitest

## Getting Started

### Prerequisites

- Node.js 20+ or newer
- npm

### Install dependencies

```bash
npm install --legacy-peer-deps
```

Note:
`@teachablemachine/image` currently has an older peer dependency expectation for TensorFlow.js, so `--legacy-peer-deps` is used for a smooth install.

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## How It Works

1. The app loads a Teachable Machine image model from a saved or user-provided model URL.
2. Users classify an image either through the webcam feed or an uploaded image.
3. TensorFlow.js runs inference in the browser.
4. The app summarizes the prediction as fresh or rotten and stores recent results in local history.

## Project Structure

```text
src/
  components/      UI and feature components
  hooks/           reusable hooks including model loading/inference
  pages/           route-level pages
  test/            test setup and sample tests
  lib/             shared utilities
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow that automatically deploys the app to GitHub Pages whenever `main` is updated.

Expected Pages URL:

```text
https://jemalyngagbo08.github.io/FreshScan-AI-identifier/
```

### Enable GitHub Pages

In your GitHub repository:

1. Open `Settings`
2. Go to `Pages`
3. Set `Source` to `GitHub Actions`

After that, every push to `main` will trigger a fresh deployment.

## Notes

- Scan history and model URL are stored in `localStorage`
- The app is client-side only
- A Teachable Machine model must be accessible from the browser for predictions to work
