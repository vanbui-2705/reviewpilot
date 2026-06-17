# Build Requirements

Tai lieu nay dung de kiem tra nhanh truoc khi chay project hoac build production.

## 1. Yeu cau moi truong

- Node.js 18.17+ hoac 20+
- npm di kem Node.js
- PostgreSQL dang chay local o `localhost:5432`
- Database ten `reviewpilot`
- User/password PostgreSQL khop voi `.env`

File `.env` hien tai dang tro toi:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reviewpilot"
```

Neu dung Docker, co the tao PostgreSQL local bang lenh:

```powershell
docker run --name reviewpilot-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=reviewpilot `
  -p 5432:5432 `
  -d postgres:16
```

Neu container da ton tai:

```powershell
docker start reviewpilot-postgres
```

## 2. Cai dependencies

Chay trong thu muc `reviewpilot-app`:

```powershell
npm install
```

Lenh nay bat buoc vi `package.json` co the da them package moi, vi du `bcryptjs` va `jose`. Neu chua install, build se loi:

```txt
Module not found: Can't resolve 'bcryptjs'
Module not found: Can't resolve 'jose'
```

## 3. Kiem tra database

Kiem tra port PostgreSQL:

```powershell
Test-NetConnection localhost -Port 5432
```

Ket qua dung can co:

```txt
TcpTestSucceeded: True
```

Kiem tra Prisma schema:

```powershell
npx prisma validate
```

Push schema vao database va generate Prisma Client:

```powershell
npm run db:push
```

## 4. Kiem tra TypeScript va build

Chay typecheck:

```powershell
npx tsc --noEmit
```

Chay production build:

```powershell
npm run build
```

Neu `npx tsc --noEmit` bao loi o code, phai sua truoc khi build.

## 5. Chay app local

```powershell
npm run dev
```

Mo:

```txt
http://localhost:3000
```

## 6. Thu tu preflight de tranh loi

Chay theo thu tu nay khi setup may moi hoac sau khi pull code:

```powershell
cd e:\Tools\pipeline-kim-tien\reviewpilot-app
npm install
Test-NetConnection localhost -Port 5432
npx prisma validate
npm run db:push
npx tsc --noEmit
npm run build
npm run dev
```

## 7. Loi dang can chu y

Tai thoi diem viet file nay, cac loi da thay khi kiem tra:

- `package.json` co `bcryptjs` va `jose`, nhung `node_modules`/`package-lock.json` co the chua cap nhat. Chay `npm install`.
- `lib/db-services.ts` co the bi loi cu phap tai vong `for...of` neu dong do van la type expression thay vi array runtime.
- ESLint chua duoc configure nen `npm run lint` co the hien prompt cau hinh thay vi chay lint ngay.

