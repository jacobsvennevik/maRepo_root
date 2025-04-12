# Frontend Development Instructions

## Project Overview
This is a Next.js frontend application built with TypeScript. The project follows modern web development practices and includes features like server-side rendering, static site generation, and API routes.

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Git

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with necessary environment variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url_here
   ```

### Development
1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure
```
frontend/
├── src/              # Source files
│   ├── app/         # App router pages and layouts
│   ├── components/  # Reusable components
│   ├── lib/         # Utility functions and libraries
│   └── styles/      # Global styles
├── public/          # Static assets
└── ...
```

## Development Guidelines

### Component Development
- Create components in the `src/components` directory
- Use TypeScript for type safety
- Follow the component naming convention: PascalCase
- Implement proper error boundaries
- Use React hooks responsibly

### Styling
- Use CSS Modules for component-specific styles
- Global styles should be placed in `src/styles`
- Follow the BEM naming convention for CSS classes

### State Management
- Use React Context for global state
- Implement proper loading and error states
- Follow the principle of least privilege for state access

### API Integration
- API calls should be made through dedicated service functions
- Implement proper error handling
- Use TypeScript interfaces for API responses

## Testing
1. Run unit tests:
   ```bash
   npm run test
   # or
   yarn test
   ```

2. Run end-to-end tests:
   ```bash
   npm run test:e2e
   # or
   yarn test:e2e
   ```

## Building for Production
1. Create a production build:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

## Code Quality
- Follow ESLint rules defined in `eslint.config.mjs`
- Run linting:
   ```bash
   npm run lint
   # or
   yarn lint
   ```

## Deployment
- The application is configured for Vercel deployment
- Environment variables must be set in the deployment platform
- Ensure all required environment variables are documented

## Troubleshooting

### Common Issues
1. **Build Errors**
   - Clear the `.next` directory and node_modules
   - Run `npm install` or `yarn install` again
   - Check for TypeScript errors

2. **Development Server Issues**
   - Ensure no other process is using port 3000
   - Check for syntax errors in the code
   - Verify all environment variables are set correctly

### Getting Help
- Check the Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Review the project's README.md for additional information
- Contact the development team for specific issues

## Contributing
1. Create a new branch for your feature
2. Follow the established coding standards
3. Write tests for new functionality
4. Submit a pull request with a clear description of changes
