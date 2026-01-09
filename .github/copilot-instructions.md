# MyBizTools - Copilot Instructions

MyBizTools is a comprehensive business operating system for African entrepreneurs, built with React, TypeScript, and Vite. It provides document generation (invoices, quotations, receipts, payslips), financial tools (tax, budget, cost tracking), and an AI assistant (DEDAI).

## Architecture Overview

### Core Tech Stack
- **Frontend Framework**: React 18.3 + TypeScript 5.5 with Vite
- **Styling**: Tailwind CSS 3.4 + Framer Motion for animations
- **Export/Generation**: html2canvas + jsPDF for PDF/image exports; qrcode for QR generation
- **Forms**: React Hook Form + Yup validation
- **Charts**: Recharts for data visualization
- **Routing**: React Router v7 (client-side, no SSR)

### Project Structure Logic

```
src/components/          # Feature-specific components (organized by domain)
src/components/[feature]/ → Form.tsx, Preview.tsx, Modal.tsx patterns
src/pages/              # Page-level components (one per route)
src/layout/             # DashboardLayout wraps authenticated pages
src/services/           # authService.ts handles auth with rate-limiting
src/utils/              # Feature-specific utilities (invoiceUtils, validation, etc.)
src/types/              # TypeScript interfaces per feature (invoice.ts, receipt.ts)
src/config/             # dedaSystemPrompt.ts - DEDAI AI configuration
```

**Key Pattern**: Features are self-contained domains. Adding a new document type = create `types/feature.ts`, `components/feature/`, `pages/FeaturePage.tsx`, `utils/featureUtils.ts`.

### Data Flow & State Management
- **No Redux/Context API**: Lift state to page level, pass via props to component tree
- **Local State**: React useState for UI (forms, modals, previews)
- **localStorage**: Users data stored in localStorage (demo mode); upgrade to backend API when needed
- **Form Pattern**: Page manages form state → Form component updates via `onChange` → Preview component reads state

Example (InvoicePage):
```tsx
// Page manages state
const [invoice, setInvoice] = useState(defaultInvoice);

// Pass to form
<InvoiceForm invoice={invoice} onChange={setInvoice} />

// Pass to preview
<InvoicePreview invoice={invoice} />
```

## Critical Patterns & Conventions

### 1. Component Organization
- **Smart/Dumb Split**: Pages are smart (state/logic), components are dumb (props-driven)
- **Modal Pattern**: Use `[Feature]Modal.tsx` for overlay dialogs; state in parent page
- **Preview Pattern**: Document types have dedicated Preview components (`InvoicePreview.tsx`, etc.)
- **Form Validation**: Use `validation.ts` utilities; pass errors as props to inputs

### 2. Document Export Flow
All document generators follow this pattern:
1. User fills form (e.g., `InvoiceForm`)
2. Form state stored in page component
3. Preview component (e.g., `InvoicePreview`) with `id="invoice-preview"` renders the final document
4. Export button calls `exportToPDF('invoice-preview', 'invoice.pdf')` from `utils/exportUtils.ts`

**Critical**: Preview elements MUST have an `id` attribute for export to work.

### 3. Type Definitions
Every feature has a strict `types/feature.ts`:
- `Invoice`, `InvoiceItem`, `BusinessInfo`, `InvoiceSummary` (invoice.ts)
- `Receipt`, `ReceiptItem` (receipt.ts)
- All types are exported and used across form/preview/utils

### 4. Utility Functions
- **invoiceUtils.ts**: `generateInvoiceNumber()`, `calculateLineTotal()`, `calculateTotals()`
- **validation.ts**: `validateEmail()`, `validatePassword()`, `getPasswordStrength()`, `sanitizeInput()`
- **exportUtils.ts**: `exportToPDF()`, `exportToJPEG()`, `exportToPNG()`, `exportToSVG()`
- Create feature-specific utils (e.g., `taxUtils.ts`, `budgetUtils.ts`) for calculations

### 5. Authentication Flow
- `authService.ts` includes rate-limiting (5 attempts/60sec per email)
- Demo mode: accepts any credentials, stores users in localStorage
- Auth state in LoginPage; no global auth context
- Protected routes: manually check localStorage in component or create auth guard

### 6. DEDAI Integration
- Floating chat widget at bottom-right: `DEDAChat.tsx` (always present via `<DEDAChat />` in App.tsx)
- System prompt in `config/dedaSystemPrompt.ts` defines DEDAI's capabilities (financial, strategy, operations)
- DEDAI can guide users to specific features or perform calculations
- Hidden on `/dashboard/dedai` full-page route

### 7. Responsive Design
- **Tailwind-first**: All breakpoints use sm:, md:, lg: prefixes
- **DashboardLayout**: Sidebar collapses on mobile; TopBar has hamburger menu
- **Design Colors**: Primary Navy `#1e3a8a`, Accent Orange `#FF8A2B`, Background `#F0F3F5`
- Mobile-first CSS (defaults for small screens, use sm: and up)

## Development Workflow

### Build & Run
```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server (http://localhost:5173)
npm run build         # Production build → dist/
npm run preview       # Preview production build locally
npm run lint          # ESLint check (use flags: --fix to auto-correct)
```

### Adding a New Document Type
1. Create `src/types/newdoc.ts` with interfaces
2. Create `src/components/newdoc/NewdocForm.tsx` and `NewdocPreview.tsx`
3. Create `src/pages/NewdocGeneratorPage.tsx`
4. Create `src/utils/newdocUtils.ts` with calculation functions
5. Add route in `App.tsx`: `<Route path="/dashboard/newdoc/create" element={<NewdocGeneratorPage />} />`
6. Add sidebar link in `src/layout/Sidebar.tsx`

### Common Tasks
- **Add a form field**: Update type definition → add input in Form → pass to Preview
- **Fix export issues**: Check Preview component has correct `id` attribute; verify `exportToPDF()` is called with exact id
- **Style component**: Use Tailwind classes; reference color vars from README (Navy, Orange, etc.)
- **Add validation**: Create validation function in `validation.ts` or feature utils; call in Form onChange

## Important Gotchas & Dependencies

### External Libraries
- **html2canvas**: Converts DOM to canvas; works for print-friendly HTML (invoices, receipts)
- **jsPDF**: Creates PDF from canvas; dimensions matter for business cards (85.6x53.98mm)
- **Framer Motion**: Used for DEDAChat animations and transitions
- **Lucide React**: Icon library (Bot, Send, X, Plus, Trash2, etc.)

### Compatibility Notes
- Vite uses ES modules; no CommonJS exports
- React Router v7: useNavigate/useLocation work in functional components
- Tailwind 3.4: No breaking changes from v2, but dark mode disabled in config
- QRCode library: `qrcode` (not `qrcode.react`); used for vCard/URL encoding

### Known Limitations
- No backend API yet (localStorage only); upgrade path documented in DEPLOYMENT_CHECKLIST.md
- DEDAChat is UI-only (simulated responses); production requires LLM integration
- PDF export may fail for complex animations; use static Preview HTML
- Mobile: drag-and-drop for business cards not implemented (future feature)

## Code Quality Standards

- **TypeScript**: Strict mode; all types defined in `types/`; no `any` except justified
- **Component Naming**: PascalCase for components, camelCase for utilities/functions
- **Props Pattern**: Explicit interfaces for all prop shapes (see `InvoiceFormProps`)
- **Error Handling**: Try-catch in export functions; provide user feedback via toast notifications
- **Console**: No console.log in production code; use `useToast` hook for user messages

## Testing & Deployment

- **Build Checks**: Run `npm run build` locally to catch TypeScript/lint errors before push
- **Feature Testing**: Test all export formats (PDF, PNG, JPEG) before deploying
- **Responsive Testing**: Check mobile (< 640px), tablet, and desktop in browser DevTools
- **Browser Support**: Chrome/Edge primary; Safari tested for production
- **Lighthouse**: Target > 90 score (optimize images, enable code splitting in Vite)

## Questions & File References

- **Architecture questions**: See IMPLEMENTATION_GUIDE.md for feature patterns
- **Deployment**: Check DEPLOYMENT_CHECKLIST.md for env setup and hosting
- **Feature details**: Each feature has a README in its component folder (if available)
- **Design system**: Color palette and typography in README.md (Project Overview section)
