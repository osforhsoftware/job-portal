# HR & Recruitment Bidding Platform

A comprehensive recruitment platform connecting candidates, agencies, and companies with a transparent bidding system.

## 🎯 Features

### ✅ Completed Features

#### 1. **Database & Authentication System**
- File-based database system (`lib/db.ts`)
- User authentication with role-based access
- Super admin account created (username: `shabeeb`, password: `shabeeb255.`)
- Database initialization on startup

#### 2. **Admin Control Panel**
- Admin login page (`/admin/login`)
- Admin dashboard with statistics (`/admin/dashboard`)
- Agency management (`/admin/agencies`)
- Company management (`/admin/companies`)
- Candidate management (`/admin/candidates`)
- Subscription plans management (`/admin/plans`)
- System settings configuration

#### 3. **Candidate Module**
- Enhanced registration wizard with 7 steps
- Visual job category selector with emoji icons
- Salary range slider
- Visa category selection
- Video profile recording/upload
- Document upload (CV, Photo, Passport)
- Mobile-first responsive design

#### 4. **Agency Module**
- Agency registration (`/register/agency`)
- Agency login (`/login/agency`)
- Agency dashboard (`/agency/dashboard`)
- Unique referral link generation
- Subscription plans (Basic, Silver, Gold, Platinum)
- Plan limits tracking (CV uploads, bids, job offers, sub-agencies)

#### 5. **Company Module**
- Company registration (existing)
- Company login (existing)
- Company dashboard (existing)
- Subscription plans (Bronze, Silver, Gold)
- Corporate company special access

#### 6. **Payment Integration**
- Demo payment gateway component
- Payment processing simulation
- Transaction ID generation

#### 7. **API Routes**
- `/api/auth/login` - User authentication
- `/api/init` - Database initialization
- `/api/register/candidate` - Candidate registration
- `/api/register/agency` - Agency registration
- `/api/admin/stats` - Admin statistics
- `/api/admin/plans` - Plan management
- `/api/admin/agencies` - Agency management
- `/api/admin/companies` - Company management
- `/api/admin/candidates` - Candidate management
- `/api/agency/[id]` - Agency data retrieval

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database (runs automatically on first API call):
```bash
# Visit http://localhost:3000/api/init to initialize
# Or it will auto-initialize on first login
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Super Admin Login

- **URL**: `/admin/login`
- **Username**: `shabeeb`
- **Password**: `shabeeb255.`

## 📁 Project Structure

```
recruitment-bidding-platform/
├── app/
│   ├── admin/              # Admin pages
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── agencies/
│   │   ├── companies/
│   │   ├── candidates/
│   │   └── plans/
│   ├── agency/             # Agency pages
│   │   └── dashboard/
│   ├── api/                # API routes
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── register/
│   │   └── agency/
│   ├── register/           # Registration pages
│   │   ├── candidate/
│   │   └── agency/
│   └── login/              # Login pages
├── components/
│   ├── candidate/          # Candidate components
│   │   ├── registration-wizard.tsx
│   │   ├── job-category-selector.tsx
│   │   └── steps/
│   ├── payment/            # Payment components
│   └── ui/                 # UI components
├── lib/
│   ├── db.ts               # Database layer
│   ├── auth.ts             # Authentication helpers
│   └── utils.ts            # Utilities
└── data/                   # JSON database files (auto-created)
```

## 🔐 User Roles

1. **Super Admin** - Full system access
2. **Admin** - System management
3. **Agency** - Recruitment agencies with subscription plans
4. **Company** - Hiring companies (Bronze/Silver/Gold plans)
5. **Corporate** - Special free access companies
6. **Candidate** - Job seekers

## 💳 Subscription Plans

### Agency Plans
- **Basic**: $99/month - 50 CV uploads, 20 bids, 10 job offers
- **Silver**: $199/month - 150 CV uploads, 60 bids, 30 job offers
- **Gold**: $399/month - 500 CV uploads, 200 bids, 100 job offers
- **Platinum**: $799/month - Unlimited everything

### Company Plans
- **Bronze**: $149/month - 25 CV downloads
- **Silver**: $299/month - 100 CV downloads
- **Gold**: $599/month - Unlimited CV downloads

## 🎨 Key Features

### Visual Registration
- Emoji-based job category selection
- Icon-driven UI for non-educated users
- Minimal text input
- Mobile-first design

### Bidding System
- Companies bid for candidates
- Agencies earn commission
- Candidate status tracking (Available, Under Bidding, Interviewed, Selected, On Hold)
- Auto-lock on selection

### Referral System
- Unique agency referral links
- Auto-tagging of candidates to agencies
- Commission tracking

## 🐛 Known Issues & TODO

### Pending Features
1. **Bidding System UI** - Frontend for bidding workflow
2. **Interview Video Platform** - Integrated video interview system
3. **Chat System** - Real-time messaging between parties
4. **Reports & Analytics** - Detailed dashboards and reports
5. **File Upload Handling** - Actual file storage (currently simulated)
6. **Email Notifications** - Automated email system
7. **Search & Filter** - Advanced candidate/company search
8. **Corporate Company Registration** - Special registration flow

### Improvements Needed
1. Replace file-based DB with PostgreSQL/MongoDB for production
2. Implement proper password hashing (bcrypt)
3. Add JWT authentication tokens
4. Implement file storage (AWS S3, Cloudinary, etc.)
5. Add email service integration
6. Implement real payment gateway (Stripe/PayPal)
7. Add comprehensive error handling
8. Add input validation and sanitization
9. Add rate limiting
10. Add comprehensive testing

## 🔧 Configuration

### Database
The system uses a file-based JSON database stored in the `data/` directory. Files are auto-created on first use.

### Environment Variables
Create a `.env.local` file for production:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PAYMENT_API_KEY=your_payment_key

# Email (Nodemailer SMTP only — no separate API key)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Your App Name <your-account@gmail.com>"
```

## 📝 API Documentation

### Authentication
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: boolean, user: User }
```

### Candidate Registration
```typescript
POST /api/register/candidate
Body: CandidateFormData
Response: { success: boolean, user: User, candidate: Candidate }
```

### Agency Registration
```typescript
POST /api/register/agency
Body: { name, email, phone, password, subscriptionPlan }
Response: { success: boolean, user: User, agency: Agency }
```

## 🎯 Next Steps

1. Complete bidding system UI
2. Implement interview video platform
3. Add chat functionality
4. Build comprehensive reports
5. Add file upload handling
6. Implement email notifications
7. Add search and filtering
8. Complete corporate company features

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, contact the development team.

---

**Note**: This is a development version. For production deployment, ensure all security measures are implemented, including proper password hashing, JWT tokens, HTTPS, and database security.
