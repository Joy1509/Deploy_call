# CORS Error Fix

## Quick Solutions:

### 1. Ensure Backend is Running
```bash
cd backend
npm run dev
# or
npm start
```

### 2. Verify Backend is Accessible
Open browser and go to: http://localhost:4000/api/v1/health

### 3. If still getting CORS errors, update app.ts with more permissive CORS:

```typescript
// Replace the existing CORS configuration with:
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 4. Add preflight handling:
```typescript
// Add before other routes
app.options('*', cors());
```