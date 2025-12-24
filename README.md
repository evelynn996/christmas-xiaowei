# Christmas Tree

A 3D interactive Christmas tree greeting card built with React Three Fiber.

![Preview](docs/preview.gif)

## Features

- Interactive 3D Christmas tree with particle effects
- Customizable recipient name (supports Chinese & English)
- Shareable greeting links
- Click to scatter/assemble animation
- Snow, glow, and dreamy visual effects

## Demo

[Live Demo](https://your-domain.com)

## Usage

### Create a Greeting

1. Visit the website
2. Enter the recipient's name
3. Choose "赠送给TA" to copy a shareable link, or "仅预览" to preview locally

### Share a Greeting

Send the generated link to someone:
```
https://your-domain.com/?to=Name
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment

### Docker

```bash
docker build -t christmas-tree .
docker run -p 80:80 christmas-tree
```

### Docker Compose

```yaml
version: '3'
services:
  christmas-tree:
    build: .
    ports:
      - "80:80"
```

## Tech Stack

- [React](https://react.dev/) - UI framework
- [Three.js](https://threejs.org/) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Vite](https://vite.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
