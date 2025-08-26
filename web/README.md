# OpenManus Web Interface

This directory contains the web interface for OpenManus, designed to be deployed on Cloudflare Pages.

## Files

- **`index.html`** - Main HTML file with the chat interface
- **`script.js`** - JavaScript functionality for the chat system
- **`_headers`** - Cloudflare Pages security headers and caching rules
- **`_redirects`** - URL routing and redirect configuration
- **`package.json`** - Project metadata and build configuration

## Features

- **Modern UI**: Built with Tailwind CSS for a responsive, beautiful interface
- **Chat Interface**: Interactive chat system with typing indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Security Headers**: Configured with proper security policies
- **Performance Optimized**: Includes caching rules and optimizations

## Local Development

To run the web interface locally:

```bash
cd web
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deployment

This interface is designed to be deployed on Cloudflare Pages. See the main `DEPLOYMENT.md` file for detailed deployment instructions.

## Customization

- **Colors**: Modify the CSS variables in `index.html`
- **Logo**: Replace the robot icon with your own logo
- **Branding**: Update text and links to match your organization
- **Functionality**: Extend the JavaScript to add more features

## Integration

To connect this interface to your OpenManus backend:

1. Update the `callOpenManusAPI` function in `script.js`
2. Replace the simulated responses with actual API calls
3. Add authentication if required
4. Implement real-time updates using WebSockets if needed

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see the main project LICENSE file for details.