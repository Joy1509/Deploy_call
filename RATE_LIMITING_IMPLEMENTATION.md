# Login Rate Limiting Implementation

## Overview
This implementation provides a comprehensive login rate limiting system that tracks failed login attempts by IP address and implements progressive lockout periods.

## Features

### 1. **Initial Attempts**
- Users get **5 initial login attempts**
- Each failed login (wrong username OR password) decreases attempts by 1

### 2. **Progressive Lockout System**
When all 5 attempts are exhausted, the system implements progressive lockouts:

**Lockout Sequence:**
1. 1 minute → 2 attempts
2. 3 minutes → 2 attempts  
3. 5 minutes → 2 attempts
4. 10 minutes → 2 attempts
5. 15 minutes → 2 attempts
6. 30 minutes → 2 attempts
7. 1 hour → 2 attempts
8. 2 hours → 2 attempts
9. 4 hours → 2 attempts
10. 8 hours → 2 attempts
11. 16 hours → 2 attempts
12. 32 hours → 2 attempts
13. Continues doubling...

### 3. **24-Hour Reset**
- After 24 hours of inactivity, the system resets to 5 attempts
- If user was in lockout cycle, it resets to 3-minute lockout level

### 4. **Successful Login Reset**
- Any successful login immediately resets all counters to default (5 attempts)

## Technical Implementation

### Backend Components

#### 1. **Database Model** (`LoginAttempt`)
```prisma
model LoginAttempt {
  id              Int      @id @default(autoincrement())
  ipAddress       String   @unique
  attempts        Int      @default(5)
  lockedUntil     DateTime?
  lockoutLevel    Int      @default(0)
  lastAttemptAt   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 2. **Rate Limiting Service** (`rateLimitService.ts`)
- `checkLoginAttempts(ipAddress)` - Check current status
- `recordFailedAttempt(ipAddress)` - Record failed login
- `recordSuccessfulLogin(ipAddress)` - Reset on success

#### 3. **Auth Controller Updates**
- Added IP address extraction
- Integrated rate limiting checks
- Added `/auth/login-status` endpoint

### Frontend Components

#### 1. **Login Component Updates**
- Real-time status checking
- Countdown timer display
- Attempt counter display
- Disabled state during lockout

#### 2. **Auth Service Updates**
- Added `checkLoginStatus()` method
- Enhanced error handling for rate limiting

#### 3. **Auth Store Updates**
- localStorage caching for immediate feedback
- Enhanced login error handling

## API Endpoints

### `GET /auth/login-status`
Returns current login status for the requesting IP.

**Response:**
```json
{
  "blocked": false,
  "remainingAttempts": 3,
  "remainingTime": null
}
```

### `POST /auth/login`
Enhanced with rate limiting checks.

**Rate Limited Response (429):**
```json
{
  "error": "Too many failed attempts. Please try again later.",
  "blocked": true,
  "remainingTime": 180
}
```

## UI Features

### 1. **Status Indicators**
- 🔒 **Account Locked** - Red alert with countdown timer
- ⚠️ **Warning** - Yellow alert showing remaining attempts
- ✅ **Normal** - No special indicators

### 2. **Countdown Timer**
- Displays remaining lockout time in MM:SS or HH:MM:SS format
- Updates in real-time
- Automatically checks status when timer expires

### 3. **Form Behavior**
- Inputs disabled during lockout
- Button shows "Account Locked" state
- Visual feedback for disabled state

## Testing

### Test Scripts
```bash
# Test rate limiting functionality
npm run test:rate-limit

# Clean up rate limiting data
npm run cleanup:rate-limit
```

### Manual Testing Steps
1. Make 5 failed login attempts
2. Verify account gets locked
3. Wait for lockout to expire
4. Verify 2 attempts are given
5. Test successful login reset

## Security Considerations

### 1. **IP-Based Tracking**
- Tracks by IP address for security
- Handles proxy headers (`X-Forwarded-For`)
- Fallback to connection IP

### 2. **Data Storage**
- Backend database for persistence
- Frontend localStorage for UX
- Automatic cleanup of old records

### 3. **Progressive Penalties**
- Exponentially increasing lockout times
- Prevents brute force attacks
- Balances security with usability

## Configuration

### Environment Variables
No additional environment variables required. The system uses existing database configuration.

### Customization Points
- `LOCKOUT_DURATIONS` array in `rateLimitService.ts`
- Timer display format in Login component
- UI messages and styling

## Deployment Notes

### Database Migration
The system automatically creates the `LoginAttempt` table when you run:
```bash
npx prisma db push
```

### Production Considerations
- Monitor lockout patterns for potential attacks
- Consider implementing CAPTCHA after multiple failures
- Log suspicious activity for security analysis
- Ensure proper IP detection behind load balancers

## Troubleshooting

### Common Issues
1. **Timer not updating** - Check WebSocket connection
2. **Status not syncing** - Verify API endpoint accessibility
3. **Lockout not working** - Check database connectivity

### Debug Commands
```bash
# Check database records
npx prisma studio

# View server logs
npm run dev

# Test API directly
curl http://localhost:4000/auth/login-status
```