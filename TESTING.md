# Testing the API

## Understanding Swagger Documentation

When you see a response in Swagger UI, it's showing you an **EXAMPLE** of what the response structure looks like, **NOT** an actual API response.

### To Test the Actual API:

1. Click the **"Try it out"** button in Swagger UI
2. Fill in the request body
3. Click **"Execute"**
4. You'll see the **actual response** from your API

## Current Status

### Empty Database

If your database is empty and you try to login, you should get:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid username/email or password"
}
```

This is the **correct behavior** - it means the API is working properly!

## Creating a Test Farmer

### Option 1: Using the Script (Recommended)

Run the script to create a test farmer:

```bash
cd backend
npm run create-test-farmer
```

This will create a test farmer with:
- **Email**: `test@farmer.com`
- **Username**: `testfarmer`
- **Password**: `Test123!`

### Option 2: Manual Database Insert

You can manually insert a farmer into your database. Make sure to:
1. Hash the password using bcrypt (cost factor 10)
2. Include all required fields

## Testing the Login Endpoint

### Using Swagger UI

1. Go to: `https://help-farmers-make-better-decisions.onrender.com/api-docs`
2. Find the **Farmer Auth** section
3. Click on **POST /api/auth/farmer/login**
4. Click **"Try it out"**
5. Enter:
   ```json
   {
     "username": "test@farmer.com",
     "password": "Test123!"
   }
   ```
6. Click **"Execute"**
7. You should see a **real response** with actual data

### Using curl

```bash
curl -X POST https://help-farmers-make-better-decisions.onrender.com/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@farmer.com",
    "password": "Test123!"
  }'
```

### Using Postman

1. Create a new POST request
2. URL: `https://help-farmers-make-better-decisions.onrender.com/api/auth/farmer/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "username": "test@farmer.com",
     "password": "Test123!"
   }
   ```

## Expected Responses

### ✅ Success (200)

```json
{
  "statusCode": 200,
  "data": {
    "farmer": {
      "id": 1,
      "fullName": "Test Farmer",
      "email": "test@farmer.com",
      "username": "testfarmer",
      "phoneNumber": "1234567890",
      "fcmToken": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Farmer logged in successfully",
  "success": true
}
```

### ❌ Invalid Credentials (401)

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid username/email or password"
}
```

### ❌ Validation Error (400)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username or email is required"
    }
  ]
}
```

## Troubleshooting

### Getting 401 with correct credentials?

1. Make sure you ran the migration to add `fcm_token` column
2. Check that the farmer exists in the database
3. Verify the password is correct

### Getting 500 errors?

1. Check that the `fcm_token` column exists (run migration)
2. Check server logs for detailed error messages
3. Verify database connection is working

