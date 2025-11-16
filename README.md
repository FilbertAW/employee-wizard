# Employee Wizard

A 2-step role-based wizard form application for managing employee data with async autocomplete, file upload, auto-generated IDs, draft auto-save, and bulk async submit.

## 🌐 Live Demo

**Production URL**: [https://employee-wizard.vercel.app/](https://employee-wizard.vercel.app/)

> **⚠️ Important Note About the Live Demo**
>
> The deployed version on Vercel is **fully functional** with localStorage-based persistence for employee data.
>
> **What works on the live demo:**
> - ✅ UI/UX and responsive design (360px - 1440px)
> - ✅ Form validation
> - ✅ Async autocomplete for Department and Location (uses fallback data)
> - ✅ Draft auto-save to localStorage
> - ✅ File upload with Base64 preview
> - ✅ Employee ID auto-generation
> - ✅ Navigation and routing
> - ✅ Full wizard flow for both Admin and Ops roles
> - ✅ Employee data persistence via **browser localStorage** (not server-side)
> - ✅ Employee list with submitted data (stored in localStorage)
>
> **📌 Storage Mechanism:**
> - **On deployed version**: Data is stored in your **browser's localStorage** (client-side only)
> - **On local development**: Data is stored in **json-server** (simulated backend)
> - **Note**: On the deployed version, clearing your browser data or using a different browser/device will reset the employee list
>
> **To test with persistent server-side storage** using json-server, please follow the [Setup & Installation](#setup--installation) instructions below to run the project locally.

## Features

✅ **Role-Based Wizard**
- Admin: Access to Step 1 (Basic Info) + Step 2 (Details)
- Ops: Access to Step 2 (Details) only
- Role selection via URL query parameter (`?role=admin` or `?role=ops`)

✅ **Step 1 - Basic Information (Admin Only)**
- Full Name input
- Email with inline validation
- Department async autocomplete
- Role selection
- Auto-generated Employee ID (format: `<3-letter dept>-<3-digit sequence>`)

✅ **Step 2 - Details & Submit (Admin + Ops)**
- Photo upload with preview and Base64 conversion
- Employment Type selection
- Office Location async autocomplete
- Notes textarea
- Sequential POST simulation with progress tracking

✅ **Advanced Features**
- **Draft Auto-Save**: All form data auto-saves to localStorage every 2 seconds (debounced)
- **Data Caching**: API responses cached for 5 minutes to improve performance
- **Data Merging**: Employee list merges data from two separate endpoints
- **Pagination**: Employee list with pagination support
- **Smart Fallback**: Automatically uses localStorage when json-server is unavailable (deployed version)

✅ **Employee List Page**
- Display merged employee data
- Columns: Photo, Name, Department, Role, Location, Employee ID
- Pagination with page navigation
- "+ Add Employee" button

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v6
- **Mock API**: json-server (2 instances on ports 4001 & 4002)
- **Styling**: Vanilla CSS (no frameworks)
- **Build Tool**: Vite

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher, personally I use v20.19.3 on development process)
- yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-wizard
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Run the application**
   ```bash
   yarn start
   ```
   This command will:
   - Start the Vite dev server on `http://localhost:5173`
   - Start json-server for Step 1 on `http://localhost:4001`
   - Start json-server for Step 2 on `http://localhost:4002`

### Alternative: Run Servers Separately

If you prefer to run servers separately:

```bash
# Terminal 1: Run frontend
yarn dev

# Terminal 2: Run mock APIs
yarn server
```

Or run each server individually:
```bash
# Terminal 1: Frontend
yarn dev

# Terminal 2: Step 1 API
yarn server:step1

# Terminal 3: Step 2 API
yarn server:step2
```

## Usage

### Access the Application

1. **Wizard (Admin)**: `http://localhost:5173/wizard?role=admin`
   - Access both Step 1 and Step 2
   - Fill in basic info, then proceed to details

2. **Wizard (Ops)**: `http://localhost:5173/wizard?role=ops`
   - Access Step 2 only (Details form)
   - Submit details without basic info

3. **Employee List**: `http://localhost:5173/employees`
   - View all employees with merged data
   - Navigate through paginated results
   - Click "+ Add Employee" to open wizard

### Draft Auto-Save

- Form data automatically saves to localStorage every 2 seconds
- Separate drafts for Admin (`draft_admin`) and Ops (`draft_ops`)
- Drafts restore automatically on page reload
- Use "Clear Draft" button to reset current role's draft

### Data Flow

1. **Submit Flow** (Admin):
   - Complete Step 1 → Data stored temporarily
   - Complete Step 2 → Sequential POST:
     - POST to `/basicInfo` (port 4001) with 3s delay
     - POST to `/details` (port 4002) with 3s delay
   - **Fallback**: If API unavailable, stores complete employee data (basicInfo + details) to localStorage
   - Progress bar shows real-time status
   - Redirect to Employee List on completion

2. **Submit Flow** (Ops):
   - Complete Step 2 only
   - POST to `/details` (port 4002) with 3s delay
   - **Fallback**: If API unavailable, stores details with placeholder basicInfo to localStorage (role shown as "Ops")
   - Redirect to Employee List on completion

3. **Data Persistence**:
   - **Local Development**: Data persists in json-server database files
   - **Deployed Version**: Data persists in browser's localStorage (client-side only)
   - Employee list reads from localStorage when API is unavailable

### Caching

The application implements in-memory caching for API requests:
- Cache duration: 5 minutes
- Cached endpoints:
  - Department searches
  - Location searches
  - Employee basic info
  - Employee details
- Cache clears after mutations (POST requests)

## Project Structure

```
employee-wizard/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Autocomplete.tsx
│   │       ├── Button.tsx
│   │       ├── FileUpload.tsx
│   │       ├── Input.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Select.tsx
│   │       └── Textarea.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── pages/
│   │   ├── wizard/
│   │   │   ├── Step1BasicInfo.tsx
│   │   │   ├── Step2Details.tsx
│   │   │   └── Wizard.tsx
│   │   └── EmployeeList.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── employeeStorage.ts
│   ├── styles/
│   │   ├── Autocomplete.css
│   │   ├── Button.css
│   │   ├── EmployeeList.css
│   │   ├── FileUpload.css
│   │   ├── Input.css
│   │   ├── ProgressBar.css
│   │   ├── Select.css
│   │   ├── Step1.css
│   │   ├── Step2.css
│   │   ├── Textarea.css
│   │   └── Wizard.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── db-step1.json
├── db-step2.json
├── package.json
└── README.md
```

## API Endpoints

### Step 1 API (Port 4001)
- `GET /departments` - Get all departments
- `GET /departments?name_like={query}` - Search departments
- `GET /basicInfo` - Get all basic info
- `GET /basicInfo?_page={page}&_limit={limit}` - Get paginated basic info
- `POST /basicInfo` - Create basic info

### Step 2 API (Port 4002)
- `GET /locations` - Get all locations
- `GET /locations?name_like={query}` - Search locations
- `GET /details` - Get all details
- `GET /details?_page={page}&_limit={limit}` - Get paginated details
- `POST /details` - Create details

## Development Notes

### TypeScript
All components are fully typed with comprehensive TypeScript interfaces. No `any` types are used.

### Form Validation
- Email validation with regex
- Required field validation
- Real-time error feedback
- Submit button disabled until form is valid

### Performance Optimizations
- Debounced auto-save (2 seconds)
- API response caching (5 minutes)
- Debounced autocomplete searches
- Optimized re-renders with proper React hooks

### CSS Architecture
- Vanilla CSS with component-level stylesheets
- Consistent naming conventions
- No CSS frameworks or libraries
- Reusable component styles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
