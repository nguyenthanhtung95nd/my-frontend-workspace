# Templates — Next.js (App Router)

Copy-paste baselines that already follow the rules. Adapt to the project.

## Server Component (data fetch, default)

```tsx
// app/products/page.tsx — no "use client"; runs on the server
import { getProducts } from '@/lib/products'
import { ProductGrid } from '@/components/ProductGrid'

export default async function ProductsPage() {
  const products = await getProducts()          // server-side; secrets safe
  return <ProductGrid products={products} />
}
```

## Client Component with SWR (interactive data)

```tsx
'use client'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export function SalesChart() {
  const { data, error, isLoading } = useSWR('/api/sales', fetcher, { refreshInterval: 2000 })
  if (isLoading) return <ChartSkeleton />
  if (error)     return <ErrorState message="Couldn't load sales." />
  if (!data?.length) return <EmptyState />
  return <Chart points={data} />               // semantic <svg> + aria-labelledby
}
```

## Route handler (mutation + auth)

```tsx
// app/api/admin/users/[uid]/role/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'      // server-side RBAC

export async function PATCH(req: Request, { params }: { params: { uid: string } }) {
  try {
    await requireAdmin()                        // throws 403 if not admin
    const { role } = await req.json()
    await setUserRole(params.uid, role)
    return NextResponse.json({ ok: true, role })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }
}
```

## next/image (never raw <img>)

```tsx
<Image src={product.image} alt={product.title} width={400} height={400}
       sizes="(max-width:768px) 100vw, 25vw" className="rounded-lg object-cover" />
```

## Money formatting (SSR/CSR parity)

```tsx
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
// currency.format(product.price)  — not price.toFixed(2)
```

## Firestore RBAC rules (least privilege, deny by default)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.token.role == 'admin' || request.auth.uid == uid;
    }
    match /orders/{id} {
      allow read: if request.auth.token.role in ['admin','manager'];
      allow write: if request.auth.token.role == 'admin';
    }
    match /{document=**} { allow read, write: if false; }  // default deny
  }
}
```
