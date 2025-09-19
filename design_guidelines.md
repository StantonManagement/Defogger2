# Design Guidelines for OneDrive Integration Web App

## Design Approach
**Selected Approach**: Design System (Material Design)
**Justification**: This is a utility-focused productivity tool requiring clear authentication flows and reliable file management interface. Material Design provides excellent patterns for progressive disclosure and authentication states.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 220 75% 56% (Microsoft blue-inspired)
- Secondary: 220 15% 95% (subtle gray backgrounds)
- Success: 142 71% 45% (connection status)
- Error: 0 65% 51% (authentication errors)
- Surface: 0 0% 100% (white backgrounds)

**Dark Mode:**
- Primary: 220 75% 65% (lighter blue for contrast)
- Secondary: 220 10% 15% (dark surfaces)
- Success: 142 65% 55% (brighter success)
- Error: 0 60% 60% (softer error red)
- Surface: 220 8% 8% (dark background)

### B. Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 600 weight, larger sizes for hierarchy
- **Body**: 400 weight, 16px base size
- **Buttons/UI**: 500 weight for clarity

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, and 8 (8px, 16px, 24px, 32px)
- Consistent padding: p-6 for cards, p-4 for buttons
- Margins: m-4 between sections, m-2 for small gaps
- Container max-width with centered content

### D. Component Library

**Authentication Card**
- Centered card layout with rounded corners (rounded-lg)
- Elevated appearance with subtle shadow
- Clear visual hierarchy: title → status → actions

**Connection Status Indicator**
- Prominent visual feedback with icon + text
- Green checkmark for connected state
- Neutral state for disconnected
- Loading spinner during authentication

**Button Hierarchy**
- Primary: Solid blue for main actions ("Connect to OneDrive")
- Secondary: Outline style for secondary actions ("Test Connection")
- Disabled state: Reduced opacity with clear visual feedback

**File List Display**
- Clean table/list layout with proper spacing
- File icons and names with clear typography
- Responsive design for mobile compatibility

**Error/Success Messages**
- Toast-style notifications or inline alerts
- Color-coded with appropriate icons
- Auto-dismiss for success, persistent for errors requiring action

### E. Page Layout
**Single-page application** with progressive disclosure:
1. **Header**: Simple app title and connection status
2. **Main Content**: Centered authentication card
3. **Connected State**: Transform to show file management interface
4. **Footer**: Minimal, optional branding

### F. Interaction Patterns
- **Loading States**: Skeleton loaders and spinners during API calls
- **Progressive Enhancement**: Show/hide sections based on authentication state
- **Error Recovery**: Clear error messages with actionable next steps
- **Responsive Design**: Mobile-first approach with touch-friendly targets

### G. Visual Hierarchy
- Clear distinction between authenticated and unauthenticated states
- Prominent call-to-action buttons
- Subtle visual cues for connection status
- Consistent spacing and alignment throughout

**Key Design Principle**: Clarity over decoration - prioritize user understanding of authentication state and available actions while maintaining a polished, professional appearance suitable for a productivity tool.