# Contributing to Events Management Application

Thank you for considering contributing to the Events Management Application! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Events-Management-Application.git
cd Events-Management-Application
```

### 2. Set up Development Environment
```bash
# Install all dependencies
npm run install-all

# Set up environment variables
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your configuration

# Create sample data
npm run setup
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b bugfix/issue-description
```

## 🛠️ Development Guidelines

### Code Style
- **JavaScript**: Use ES6+ features, async/await, and modern syntax
- **React**: Functional components with hooks
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for functions and complex logic

### File Organization
- **Components**: Place reusable components in `Frontend/src/components/`
- **Pages**: Place page components in `Frontend/src/pages/[role]/`
- **Services**: Place API services in `Frontend/src/services/`
- **Controllers**: Place backend controllers in `Backend/controllers/[role]/`
- **Models**: Place MongoDB models in `Backend/models/`

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(brochure): add AI-enhanced course description generation
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
style(ui): improve button styling consistency
refactor(api): optimize database queries
test(auth): add login functionality tests
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

### Manual Testing
- Test all user roles (HOD, Coordinator, Participant)
- Verify document generation (brochures, certificates)
- Check responsive design on different screen sizes
- Test API endpoints with different data scenarios

## 📋 Pull Request Process

### 1. Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated (if applicable)
- [ ] No merge conflicts with main branch
- [ ] Feature is tested manually

### 2. Pull Request Template
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested manually
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### 3. Review Process
1. Automated checks must pass
2. At least one maintainer review required
3. Address feedback and update PR
4. Maintainer will merge when approved

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Verify bug exists in latest version
- Test with fresh installation

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js version: [e.g., 16.14.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Any alternative solutions considered

**Additional Context**
Any other relevant information
```

## 🏗️ Development Setup

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Git

### Environment Variables
Create `Backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/events-management
JWT_SECRET=your-jwt-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Running Development Servers
```bash
# Both servers simultaneously
npm run dev

# Backend only
npm run backend

# Frontend only
npm run frontend
```

## 📁 Project Structure Guide

### Backend Structure
```
Backend/
├── config/           # Database and app configuration
├── controllers/      # Route handlers
│   ├── auth/        # Authentication
│   ├── coordinator/ # Coordinator functionality
│   ├── hod/         # HOD functionality
│   └── participant/ # Participant functionality
├── middleware/       # Custom middleware
├── models/          # MongoDB schemas
├── routes/          # API route definitions
└── server.js        # Main server file
```

### Frontend Structure
```
Frontend/src/
├── components/      # Reusable components
├── context/         # React context providers
├── pages/           # Page components
│   ├── Auth/       # Login, registration
│   ├── coordinator/# Coordinator dashboard
│   ├── HOD/        # HOD dashboard
│   └── Participants/# Participant pages
├── services/        # API calls and utilities
└── styles/          # CSS files
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Medium Priority
- [ ] Additional PDF templates
- [ ] Advanced search and filtering
- [ ] Data export functionality
- [ ] User profile management
- [ ] Event calendar integration

### Low Priority
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with external APIs
- [ ] Mobile app development

## 🔒 Security Guidelines

### Data Protection
- Never commit sensitive data (passwords, API keys)
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication checks

### Code Security
- Follow OWASP guidelines
- Use parameterized queries
- Implement rate limiting
- Regular dependency updates

## 📚 Learning Resources

### Technologies Used
- **React**: https://reactjs.org/docs
- **Node.js**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Material-UI**: https://mui.com/

### Best Practices
- **React Patterns**: https://reactpatterns.com/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **JavaScript Style Guide**: https://github.com/airbnb/javascript

## 🎉 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Given credit in commit messages
- Invited to maintainer discussions (for significant contributions)

## 📞 Support

### Get Help
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Email**: dhanush@annauniv.edu for direct contact

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Follow the code of conduct
- Provide constructive feedback

## 📝 License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to the Events Management Application! 🎓
