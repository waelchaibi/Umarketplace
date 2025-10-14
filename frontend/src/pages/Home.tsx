import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { IMG_URL } from '../config'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

export default function Home() {
	const [category, setCategory] = useState<string>('')
	const [condition, setCondition] = useState<string>('')
	const [minPrice, setMinPrice] = useState<string>('')
	const [maxPrice, setMaxPrice] = useState<string>('')
	const [sort, setSort] = useState<string>('createdAt')
	const [order, setOrder] = useState<string>('DESC')
	const [page, setPage] = useState<number>(1)
	const [limit, setLimit] = useState<number>(12)

	const queryParams = useMemo(() => ({ category: category || undefined, condition: condition || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, sort, order, page, limit }), [category, condition, minPrice, maxPrice, sort, order, page, limit])

	const { data, isLoading, isError, refetch, isFetching } = useQuery({
		queryKey: ['products', queryParams],
		queryFn: async () => (await axios.get('/products', { params: queryParams })).data.data,
		keepPreviousData: true
	})

	const auctionsQuery = useQuery({
		queryKey: ['auctions'],
		queryFn: async () => (await axios.get('/auctions')).data.data
	})

	const categoriesQuery = useQuery({
		queryKey: ['categories'],
		queryFn: async () => (await axios.get('/products/categories')).data.data
	})

	useEffect(() => { setPage(1) }, [category, condition, minPrice, maxPrice, sort, order, limit])

	if (isError) return <div className="p-6">Error loading products.</div>

	const items = (data?.items || []) as any[]

	return (
		<div className="p-6">
			{/* Hero */}
			<section className="mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-transparent border border-white/10">
				<div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-8 items-center">
					<div>
						<h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight mb-4">Discover Unique 1-of-1 Pieces</h1>
						<p className="text-gray-600 dark:text-gray-300 text-lg mb-6">A curated marketplace for rare, authenticated items. Bid live, buy instantly, and trade securely.</p>
						<div className="flex gap-3">
							<a className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow" href="#featured">Shop Featured</a>
							<a className="px-5 py-3 rounded-xl bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10" href="#auctions">Live Auctions</a>
						</div>
					</div>
					<div className="hidden lg:block">
						<div className="h-60 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-glass backdrop-blur-md flex items-center justify-center text-gray-500">Premium Banner</div>
					</div>
				</div>
			</section>

			{/* Selling points */}
			<section className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
				{[
					{ t: 'Authenticity', d: 'Each item is 1-of-1 and verified.' },
					{ t: 'Secure Wallet', d: 'Mock wallet with instant settlement.' },
					{ t: 'Live Auctions', d: 'Real-time bidding and updates.' },
					{ t: 'Trading', d: 'Offer item-for-item with cash adjustments.' }
				].map((c) => (
					<div key={c.t} className="rounded-2xl p-5 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card"><div className="font-semibold mb-1">{c.t}</div><div className="text-sm text-gray-600 dark:text-gray-300">{c.d}</div></div>
				))}
			</section>

			{/* Categories */}
			<section className="max-w-6xl mx-auto mb-10">
				<h2 className="text-2xl font-display font-semibold mb-4">Browse by Category</h2>
				<ul className="flex flex-wrap gap-2">
					{(categoriesQuery.data || []).map((cat: string) => (
						<li key={cat}><button className={`px-4 py-2 rounded-full text-sm ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/10'}`} onClick={() => setCategory(category === cat ? '' : cat)}>{cat}</button></li>
					))}
				</ul>
			</section>

			{/* Filters */}
			<section className="max-w-6xl mx-auto mb-6">
				<div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
					<div>
						<label className="block text-xs mb-1">Condition</label>
						<select className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={condition} onChange={e => setCondition(e.target.value)}>
							<option value="">Any</option>
							<option value="mint">mint</option>
							<option value="excellent">excellent</option>
							<option value="good">good</option>
							<option value="fair">fair</option>
						</select>
					</div>
					<div>
						<label className="block text-xs mb-1">Min Price</label>
						<input className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
					</div>
					<div>
						<label className="block text-xs mb-1">Max Price</label>
						<input className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
					</div>
					<div>
						<label className="block text-xs mb-1">Sort</label>
						<select className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={sort} onChange={e => setSort(e.target.value)}>
							<option value="createdAt">Newest</option>
							<option value="currentPrice">Price</option>
						</select>
					</div>
					<div>
						<label className="block text-xs mb-1">Order</label>
						<select className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={order} onChange={e => setOrder(e.target.value)}>
							<option value="DESC">Desc</option>
							<option value="ASC">Asc</option>
						</select>
					</div>
					<div>
						<label className="block text-xs mb-1">Per Page</label>
						<select className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={limit} onChange={e => setLimit(Number(e.target.value))}>
							<option value={12}>12</option>
							<option value={24}>24</option>
							<option value={48}>48</option>
						</select>
					</div>
				</div>
			</section>

			{/* Featured products */}
			<section id="featured" className="max-w-6xl mx-auto mb-10">
				<h2 className="text-2xl font-display font-semibold mb-4">Featured</h2>
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{(isLoading || isFetching) && Array.from({ length: limit }).map((_, i) => (
						<li key={`s-${i}`} className="rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card animate-pulse">
							<div className="aspect-[4/3] bg-gray-100 dark:bg-white/10" />
							<div className="p-4 space-y-2">
								<div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-2/3" />
								<div className="h-3 bg-gray-100 dark:bg白/10 rounded w-1/2" />
							</div>
						</li>
					))}
					{!isLoading && items.map((p, i) => (
						<li key={p.id} className="group rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
							{(() => { const img = (Array.isArray(p.images) && p.images[0]) ? (p.images[0].startsWith('/uploads') ? `${IMG_URL}${p.images[0]}` : p.images[0]) : null; return img ? (
								<div className="aspect-[4/3] overflow-hidden">
									<img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
								</div>
							) : <div className="aspect-[4/3] bg-gray-100 dark:bg-white/10" /> })()}
							<div className="p-4">
								<h3 className="font-semibold mb-1">{p.title}</h3>
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Price: {p.currentPrice ?? p.originalPrice ?? '-'}</p>
							<Link className="inline-block text-blue-600 dark:text-accent-blue hover:underline" to={`/products/${p.id}`}>View</Link>
							</div>
						</li>
					))}
				</ul>
				{/* Pagination */}
				{data?.pages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-6">
						<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 disabled:opacity-50">Prev</button>
						<div className="text-sm">Page {page} / {data.pages}</div>
						<button disabled={page >= data.pages} onClick={() => setPage((p) => Math.min(data.pages, p + 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 disabled:opacity-50">Next</button>
					</div>
				)}
			</section>

			{/* Live auctions */}
			<section id="auctions" className="max-w-6xl mx-auto mb-10">
				<h2 className="text-2xl font-display font-semibold mb-4">Live Auctions</h2>
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{(auctionsQuery.data || []).slice(0, 6).map((a: any, i: number) => (
						<li key={a.id} className="rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
							{(() => { const img = (Array.isArray(a.product?.images) && a.product.images[0]) ? (a.product.images[0].startsWith('/uploads') ? `${IMG_URL}${a.product.images[0]}` : a.product.images[0]) : null; return img ? (
								<div className="aspect-[4/3] overflow-hidden">
									<img src={img} alt={a.product?.title || `Auction #${a.id}`} className="w-full h-full object-cover" />
								</div>
							) : <div className="aspect-[4/3] bg-gray-100 dark:bg-white/10" /> })()}
							<div className="p-5">
								<div className="font-semibold mb-1">{a.product?.title || `Auction #${a.id}`}</div>
							<div className="text-sm text-gray-600 dark:text-gray-300 mb-3">Current bid: {a.currentBid ?? a.startingPrice}</div>
							<Link className="text-blue-600 dark:text-accent-blue hover:underline" to={`/auctions/${a.id}`}>Bid now</Link>
							</div>
						</li>
					))}
				</ul>
			</section>

			{/* CTA banner */}
			<section className="max-w-6xl mx-auto">
				<div className="rounded-2xl p-8 bg-gradient-to-r from-accent-purple/30 to-accent-blue/30 border border-white/10 text-center">
					<h3 className="text-2xl font-display font-semibold mb-2">Have a rare piece to sell?</h3>
					<p className="text-gray-700 dark:text-gray-200 mb-4">List it now and reach collectors globally.</p>
					<a className="inline-block px-5 py-3 rounded-xl bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10" href="/my-products">List Your Item</a>
				</div>
			</section>
		</div>
	)
}
