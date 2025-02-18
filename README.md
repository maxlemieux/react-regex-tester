# React Regex Tester

A single-page application (SPA) built with React and NodeJS that allows testing of Golang-flavored regular expressions. More flavors of regex may be included in future.

## Features

- Test Go regex patterns in real-time
- Multiple match types (simple match, find submatch, find all submatches)
- Syntax highlighting with Monaco Editor
- Dark/light mode toggle
- Pre-loaded example patterns
- Detailed match results including capturing groups
- Responsive design

## Requirements

- Node.js (v14+)
- Go (v1.16+)

## Installation

1. Clone the repository
```
git clone https://github.com/maxlemieux/react-regex-tester.git
cd react-regex-tester
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

## Production Build

```
npm run build
npm start
```

## How It Works

Example for Golang:

1. The React frontend allows users to input regex patterns and test text
2. When the user clicks "Test Regex", the pattern and text are sent to the NodeJS backend
3. The backend generates a temporary Go program that tests the regex using Go's native regexp package
4. The Go program is executed and returns the results as JSON
5. The results are displayed in the frontend UI

## License

MIT

