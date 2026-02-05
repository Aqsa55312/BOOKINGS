# 🛠️ Troubleshooting Guide

## Error: "Response not successful: Received status code 400"

### Penyebab
Error ini terjadi karena aplikasi frontend tidak bisa terkoneksi ke backend GraphQL server.

### Solusi

#### ✅ Option 1: Gunakan Demo Mode (Recommended untuk Preview)

1. Buka aplikasi di browser: `http://localhost:3000`
2. Login dengan kredensial (jika sudah ada)
3. Di Dashboard, klik **"Demo Mode"** 
4. Anda akan melihat tampilan lengkap dengan mock data

**Demo Mode Features:**
- ✅ Browse semua ruangan dengan mock data
- ✅ Filter & Search
- ✅ Grid/List view toggle
- ✅ Tampilan UI lengkap
- ❌ Tidak bisa booking (backend required)

#### ✅ Option 2: Setup Backend GraphQL Server

1. **Clone & Install Backend**
   ```bash
   git clone <your-backend-repo>
   cd booking-backend
   npm install
   ```

2. **Setup Database**
   - Buat database PostgreSQL/MySQL/MongoDB
   - Copy `.env.example` ke `.env`
   - Isi konfigurasi database

3. **Run Backend**
   ```bash
   npm run dev
   # Backend akan berjalan di http://localhost:4000/graphql
   ```

4. **Update Frontend .env**
   ```env
   VITE_GRAPHQL_URL=http://localhost:4000/graphql
   ```

5. **Restart Frontend**
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   ```

#### ✅ Option 3: Gunakan Remote Backend

Jika backend sudah deployed:

1. Edit file `.env`:
   ```env
   VITE_GRAPHQL_URL=https://your-backend-api.com/graphql
   ```

2. Restart dev server

---

## Common Issues

### 1. CORS Error
**Error:** `Access to fetch at 'xxx' from origin 'xxx' has been blocked by CORS`

**Solution:**
Tambahkan CORS configuration di backend:
```javascript
// Express
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});
```

### 2. Network Error
**Error:** `Network error: Failed to fetch`

**Cek:**
- ✅ Backend server sudah running?
- ✅ URL di `.env` sudah benar?
- ✅ Port tidak diblok firewall?

### 3. Authentication Error
**Error:** `401 Unauthorized`

**Solution:**
- Pastikan token JWT valid
- Cek format Authorization header di apolloClient.js
- Login ulang untuk refresh token

### 4. GraphQL Schema Mismatch
**Error:** `Cannot query field "xxx" on type "xxx"`

**Solution:**
- Pastikan backend schema sesuai dengan queries/mutations di frontend
- Lihat dokumentasi backend untuk schema yang benar

---

## Development Tips

### Enable GraphQL Playground
Backend biasanya menyediakan GraphQL Playground di:
```
http://localhost:4000/graphql
```

Test queries di sini sebelum implementasi di frontend.

### Check Network Tab
1. Buka Chrome DevTools (F12)
2. Tab Network
3. Filter: XHR
4. Lihat request/response GraphQL

### Apollo Client DevTools
Install extension:
- [Chrome](https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/)

---

## Quick Checklist

Sebelum mulai development:

- [ ] Backend server running
- [ ] Database connected
- [ ] .env file configured
- [ ] CORS enabled di backend
- [ ] GraphQL endpoint accessible
- [ ] Frontend dev server running

Untuk testing tanpa backend:
- [ ] Gunakan Demo Mode di Dashboard
- [ ] Browse mock data di `/dashboard/rooms-demo`

---

## Contact

Butuh bantuan? 
- Check README.md untuk dokumentasi lengkap
- Lihat issues di GitHub repository
- Contact: [your-email]

**Happy Coding!** 🚀
