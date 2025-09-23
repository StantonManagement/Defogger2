// Mock data structure for task management
export interface TaskFile {
  filename: string;
  title: string;
  content: string;
  for?: string;
  days?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowFolder {
  name: string;
  path: string;
  count: number;
  tasks: TaskFile[];
}

export interface WorkflowStats {
  inbox: number;
  ready: number;
  assigned: number;
  archived: number;
}

// Mock workflow documentation
export const mockWorkflowDocs = {
  README: `# Task Management Workflow

## Overview
This system manages the flow from ideas to GitHub issues through a structured workflow.

### Process Steps
1. **Ideas** → INBOX folder
2. **Review & Format** → READY_TO_ASSIGN folder  
3. **Assignment** → GitHub Issues
4. **Completion** → ARCHIVE folder

## Getting Started
- Check INBOX daily for new ideas
- Format tasks using the template
- Assign priority levels
- Push to GitHub when ready

### Priority Levels
- 🔴 **High**: Critical bugs, security issues
- 🟡 **Medium**: Feature requests, improvements
- 🟢 **Low**: Nice-to-have, documentation

## Templates
Use the standard task template for consistency.`,

  FULL_WORKFLOW: `# Complete Workflow Documentation

## Detailed Process

### 1. INBOX Processing
Raw ideas and conversations get dumped here. Review daily to:
- Extract actionable tasks
- Eliminate duplicates
- Group related items

### 2. Task Formatting
Convert INBOX items to structured tasks:

\`\`\`markdown
# Task: [Clear Title]

**For:** [Developer Name]  
**Days:** [Estimated time]  
**Priority:** [High/Medium/Low]

## What needs to be built
[Clear description of requirements]

## Success looks like
- [ ] Specific criteria 1
- [ ] Specific criteria 2
- [ ] Specific criteria 3

## Technical notes
[Implementation details, constraints, dependencies]
\`\`\`

### 3. GitHub Integration
- Create issues from READY tasks
- Include all task details
- Assign to appropriate developer
- Add priority labels

### 4. Tracking Progress
- Monitor GitHub issues
- Update task status
- Move completed work to ARCHIVE

## Best Practices
1. Keep task descriptions clear and actionable
2. Include all necessary context
3. Set realistic time estimates
4. Review priority regularly`,

  QUICK_REFERENCE: `# Quick Reference Guide

## Keyboard Shortcuts
- \`?\` - Show help
- \`Ctrl+F\` - Search tasks
- \`Ctrl+N\` - New task

## Folder Structure
- **INBOX/** - Raw ideas (review daily)
- **READY_TO_ASSIGN/** - Formatted tasks
- **ASSIGNED/** - Active GitHub issues  
- **ARCHIVE/** - Completed work

## Task Template
\`\`\`
# Task: [Title]
**For:** [Developer]
**Days:** [Time]
**Priority:** [Level]

## Description
[What to build]

## Success Criteria
- [ ] Item 1
- [ ] Item 2
\`\`\`

## Priority Guidelines
- **High**: Security, bugs blocking users
- **Medium**: Features, improvements
- **Low**: Nice-to-have, documentation

## Status Colors
- 🔵 INBOX (Blue)
- 🟢 READY (Green)  
- 🟠 ASSIGNED (Orange)
- 🔘 ARCHIVED (Gray)`
};

// Mock task data
export const mockTasks: Record<string, TaskFile[]> = {
  INBOX: [
    {
      filename: "2025-01-17-oauth-ideas.md",
      title: "OAuth Implementation Ideas",
      content: `# OAuth Implementation Ideas

From conversation with team about improving auth flow.

## Key Points
- Current token system is manual
- Need GitHub OAuth for multiple users
- Session management needed
- Logout functionality missing

## Rough Ideas
- Implement OAuth flow
- Store tokens securely
- Session persistence
- User profile display`,
      createdAt: "2025-01-17T10:00:00Z",
      updatedAt: "2025-01-17T10:00:00Z"
    },
    {
      filename: "2025-01-17-ui-improvements.md", 
      title: "Dashboard UI Improvements",
      content: `# Dashboard UI Improvements

Notes from user feedback session.

## Feedback
- Dashboard feels empty
- Need better visual hierarchy
- Task cards too plain
- Missing workflow visualization

## Ideas
- Add workflow diagram
- Improve card design
- Better color coding
- Visual progress indicators`,
      createdAt: "2025-01-17T11:00:00Z",
      updatedAt: "2025-01-17T11:00:00Z"
    }
  ],
  
  READY_TO_ASSIGN: [
    {
      filename: "task-001-oauth.md",
      title: "Implement GitHub OAuth",
      for: "Christian Sumoba",
      days: 3,
      priority: "high",
      content: `# Task: Implement GitHub OAuth

**For:** Christian Sumoba  
**Days:** 3  
**Priority:** High

## What needs to be built
Update the authentication system to use GitHub OAuth instead of personal access tokens. This will allow multiple users to log in with their GitHub accounts.

## Success looks like
- [ ] Users can click "Login with GitHub" button
- [ ] OAuth flow completes successfully  
- [ ] User info displayed in dashboard
- [ ] Sessions persist across refreshes
- [ ] Logout functionality works

## Technical notes
- Use existing OAuth implementation as reference
- Store tokens securely in sessions
- Implement refresh token logic
- Handle edge cases (expired tokens, network errors)

## Dependencies
- GitHub OAuth App credentials
- Session storage setup`,
      createdAt: "2025-01-16T14:00:00Z",
      updatedAt: "2025-01-16T14:00:00Z"
    },
    {
      filename: "task-002-task-cards.md",
      title: "Redesign Task Cards",
      for: "Gabriel Jerdhy Lapuz",
      days: 2,
      priority: "medium",
      content: `# Task: Redesign Task Cards

**For:** Gabriel Jerdhy Lapuz  
**Days:** 2  
**Priority:** Medium

## What needs to be built
Improve the visual design of task cards to be more informative and visually appealing.

## Success looks like
- [ ] Cards show priority with color coding
- [ ] Developer assignment clearly visible
- [ ] Time estimates displayed prominently
- [ ] Hover effects for interactivity
- [ ] Responsive on mobile

## Technical notes
- Use Tailwind for styling
- Implement hover animations
- Ensure accessibility compliance
- Test across different screen sizes`,
      createdAt: "2025-01-16T15:00:00Z",
      updatedAt: "2025-01-16T15:00:00Z"
    }
  ],

  ASSIGNED: [
    {
      filename: "issue-123-api-optimization.md",
      title: "API Performance Optimization",
      for: "Paul Limbo",
      days: 5,
      priority: "high",
      content: `# Issue #123: API Performance Optimization

**For:** Paul Limbo  
**Days:** 5  
**Priority:** High  
**GitHub:** https://github.com/StantonManagement/Defogger2/issues/123

## What needs to be built
Optimize API endpoints that are currently slow and causing user experience issues.

## Success looks like
- [ ] Response times under 200ms
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Load testing completed
- [ ] Monitoring setup

## Technical notes
- Profile current performance
- Identify bottlenecks
- Implement database indexing
- Add Redis caching layer`,
      createdAt: "2025-01-15T09:00:00Z",
      updatedAt: "2025-01-15T09:00:00Z"
    }
  ],

  ARCHIVE: [
    {
      filename: "completed-user-auth.md",
      title: "User Authentication System",
      for: "Alex Korallus-Shapiro",
      days: 4,
      priority: "high",
      content: `# Completed: User Authentication System

**For:** Alex Korallus-Shapiro  
**Days:** 4 (completed in 3)  
**Priority:** High  
**Status:** ✅ Completed  
**GitHub:** https://github.com/StantonManagement/Defogger2/issues/98

## What was built
Complete user authentication system with login, registration, and session management.

## Success criteria met
- [x] User registration with email validation
- [x] Login with username/password
- [x] Session persistence
- [x] Password reset functionality
- [x] Security best practices implemented

## Final notes
Completed ahead of schedule. Security audit passed. Ready for production.`,
      createdAt: "2025-01-10T08:00:00Z",
      updatedAt: "2025-01-14T17:00:00Z"
    }
  ]
};

// Mock workflow statistics
export const mockWorkflowStats: WorkflowStats = {
  inbox: mockTasks.INBOX.length,
  ready: mockTasks.READY_TO_ASSIGN.length,
  assigned: mockTasks.ASSIGNED.length,
  archived: mockTasks.ARCHIVE.length
};

// Mock folder structure
export const mockFolders: WorkflowFolder[] = [
  {
    name: "INBOX",
    path: "/inbox",
    count: mockTasks.INBOX.length,
    tasks: mockTasks.INBOX
  },
  {
    name: "READY_TO_ASSIGN", 
    path: "/ready",
    count: mockTasks.READY_TO_ASSIGN.length,
    tasks: mockTasks.READY_TO_ASSIGN
  },
  {
    name: "ASSIGNED",
    path: "/assigned", 
    count: mockTasks.ASSIGNED.length,
    tasks: mockTasks.ASSIGNED
  },
  {
    name: "ARCHIVE",
    path: "/archive",
    count: mockTasks.ARCHIVE.length,
    tasks: mockTasks.ARCHIVE
  }
];