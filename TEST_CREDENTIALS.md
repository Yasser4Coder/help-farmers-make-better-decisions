# Test User Credentials

## 👨‍🌾 Farmer Credentials

**Email:** `farmer@test.com`  
**Username:** `testfarmer`  
**Password:** `Farmer123!`

**Login Endpoint:**

```
POST https://help-farmers-make-better-decisions.onrender.com/api/auth/farmer/login
```

**Request Body:**

```json
{
  "username": "farmer@test.com",
  "password": "Farmer123!"
}
```

---

## 👨‍💻 Engineer (Ing) Credentials

**Email:** `engineer@test.com`  
**Username:** `testengineer`  
**Password:** `Engineer123!`

**Login Endpoint:**

```
POST https://help-farmers-make-better-decisions.onrender.com/api/auth/ing/login
```

**Request Body:**

```json
{
  "username": "engineer@test.com",
  "password": "Engineer123!"
}
```

---

## 🚀 How to Create Test Users

Run the script to create both test users in your database:

```bash
cd backend
npm run create-test-users
```

The script will:

- Connect to your database
- Create a test farmer (if it doesn't exist)
- Create a test engineer (if it doesn't exist)
- Display the credentials for both users

---

## 📝 Notes

- If the users already exist, the script will notify you and display the existing credentials
- Passwords are automatically hashed using bcrypt when created
- You can use either email or username to login
- The script handles the missing `fcm_token` column gracefully
