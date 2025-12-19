import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { IMG_URL } from '../config'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

export default function Home() {
	const navigate = useNavigate()
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
			{/* Hero — Rinato Editorial */}
			<section className="mb-12">
				<div className="max-w-6xl mx-auto overflow-hidden rinato-card">
					<div className="px-6 py-14 grid lg:grid-cols-2 gap-10 items-center">
						<div>
							<div className="rinato-eyebrow mb-2">Maison de Rework</div>
							<h1 className="rinato-h1 mb-4">Chaque pièce renaît.</h1>
							<p className="text-slateLight/80 text-base md:text-lg mb-6 max-w-prose">
								Découvrez des pièces uniques, retravaillées avec exigence. Entre atelier et éditorial, le rework comme un art.
							</p>
							<div className="flex gap-3">
								<a className="rinato-cta" href="#featured">Collection</a>
								<a className="rinato-cta" href="#auctions">Enchères</a>
							</div>
						</div>
						<div className="hidden lg:block">
							<div className="h-64 rounded-lg bg-midnight rinato-blueprint border border-white/10 flex items-center justify-center">
								<div className="h-0.5 w-2/3 bg-rinato-metal" />
							</div>
						</div>
					</div>
					<div className="h-px w-full bg-rinato-metal" />
				</div>
			</section>

			{/* Categories */}
			<section className="max-w-6xl mx-auto mb-10">
				<h2 className="rinato-h2 mb-3">Catégories</h2>
				<ul className="flex flex-wrap gap-2">
					{(categoriesQuery.data || []).map((cat: string) => (
						<li key={cat}><button className={`px-4 py-2 text-sm uppercase tracking-[0.08em] ${category === cat ? 'bg-rinato-copper text-white' : 'bg-white/5 border border-white/10'}`} onClick={() => setCategory(category === cat ? '' : cat)}>{cat}</button></li>
					))}
				</ul>
			</section>

			{/* Filters - compact inline */}
			<section className="max-w-6xl mx-auto mb-4">
				<div className="grid grid-cols-2 md:grid-cols-6 gap-2">
					<div>
						<label htmlFor="f-cond" className="sr-only">Condition</label>
						<select id="f-cond" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight" value={condition} onChange={e => setCondition(e.target.value)}>
							<option value="">Condition</option>
							<option value="mint">mint</option>
							<option value="excellent">excellent</option>
							<option value="good">good</option>
							<option value="fair">fair</option>
						</select>
					</div>
					<div>
						<label htmlFor="f-min" className="sr-only">Min Price</label>
						<input id="f-min" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
					</div>
					<div>
						<label htmlFor="f-max" className="sr-only">Max Price</label>
						<input id="f-max" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
					</div>
					<div>
						<label htmlFor="f-sort" className="sr-only">Sort</label>
						<select id="f-sort" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight" value={sort} onChange={e => setSort(e.target.value)}>
							<option value="createdAt">Newest</option>
							<option value="currentPrice">Price</option>
						</select>
					</div>
					<div>
						<label htmlFor="f-order" className="sr-only">Order</label>
						<select id="f-order" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight" value={order} onChange={e => setOrder(e.target.value)}>
							<option value="DESC">Desc</option>
							<option value="ASC">Asc</option>
						</select>
					</div>
					<div>
						<label htmlFor="f-limit" className="sr-only">Per Page</label>
						<select id="f-limit" className="w-full h-9 px-2 text-sm border border-white/10 bg-white/5 text-slateLight" value={limit} onChange={e => setLimit(Number(e.target.value))}>
							<option value={12}>12</option>
							<option value={24}>24</option>
							<option value={48}>48</option>
						</select>
					</div>
				</div>
			</section>

			{/* Featured products */}
			<section id="featured" className="max-w-6xl mx-auto mb-12">
				<h2 className="rinato-h2 mb-4">Sélection</h2>
				<ul className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{(isLoading || isFetching) && Array.from({ length: limit }).map((_, i) => (
						<li key={`s-${i}`} className="rinato-card overflow-hidden animate-pulse">
							<div className="aspect-[4/3] bg-white/5" />
							<div className="p-4 space-y-2">
								<div className="h-4 bg-white/10 rounded w-2/3" />
								<div className="h-3 bg-white/10 rounded w-1/2" />
							</div>
						</li>
					))}
					{!isLoading && items.map((p, i) => (
						<li
							key={p.id}
							className="group rinato-product ultra animate-fadeInUp cursor-pointer"
							style={{ animationDelay: `${i * 40}ms` }}
							role="link"
							tabIndex={0}
							onClick={() => navigate(`/products/${p.id}`)}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/products/${p.id}`) } }}
						>
							{(() => { const img = (Array.isArray(p.images) && p.images[0]) ? (p.images[0].startsWith('/uploads') ? `${IMG_URL}${p.images[0]}` : p.images[0]) : null; return img ? (
								<div className="aspect-[4/5] overflow-hidden">
									<img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
								</div>
							) : <div className="aspect-[4/5] bg-white/10" /> })()}
							<div className="p-2">
								<h3 className="title mb-1">{p.title}</h3>
								<p className="price mb-2">€ {p.currentPrice ?? p.originalPrice ?? '-'}</p>
								<Link className="rinato-cta rinato-cta--sm" to={`/products/${p.id}`} onClick={(e)=>e.stopPropagation()}>Voir</Link>
							</div>
						</li>
					))}
				</ul>
				{/* Pagination */}
				{data?.pages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-6">
						<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-50">Préc.</button>
						<div className="text-sm text-slateLight/80">Page {page} / {data.pages}</div>
						<button disabled={page >= data.pages} onClick={() => setPage((p) => Math.min(data.pages, p + 1))} className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-50">Suiv.</button>
					</div>
				)}
			</section>

			{/* Live auctions */}
			<section id="auctions" className="max-w-6xl mx-auto mb-12">
				<h2 className="rinato-h2 mb-4">Enchères</h2>
				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{(auctionsQuery.data || []).slice(0, 6).map((a: any, i: number) => (
						<li key={a.id} className="rinato-card overflow-hidden animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
							{(() => { const img = (Array.isArray(a.product?.images) && a.product.images[0]) ? (a.product.images[0].startsWith('/uploads') ? `${IMG_URL}${a.product.images[0]}` : a.product.images[0]) : null; return img ? (
								<div className="aspect-[4/3] overflow-hidden">
									<img src={img} alt={a.product?.title || `Auction #${a.id}`} className="w-full h-full object-cover" />
								</div>
							) : <div className="aspect-[4/3] bg-white/10" /> })()}
							<div className="p-5">
								<div className="font-display text-lg mb-1">{a.product?.title || `Auction #${a.id}`}</div>
								<div className="text-sm text-slateLight/80 mb-3">Enchère actuelle: € {a.currentBid ?? a.startingPrice}</div>
								<Link className="rinato-cta" to={`/auctions/${a.id}`}>Participer</Link>
							</div>
						</li>
					))}
				</ul>
			</section>

			{/* Selling points (moved below grids to preserve product discoverability) */}
			<section className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
				{[
					{ t: 'Patron', d: 'Chaque structure est pensée et maîtrisée.' },
					{ t: 'Atelier', d: 'Savoir-faire technique et finitions couture.' },
					{ t: 'Éditorial', d: 'Une vision mode, une écriture singulière.' },
					{ t: 'Pièce unique', d: 'Rareté authentifiée et traçabilité.' }
				].map((c) => (
					<div key={c.t} className="rinato-card p-5">
						<div className="font-display text-lg mb-1">{c.t}</div>
						<div className="text-sm text-slateLight/80">{c.d}</div>
					</div>
				))}
			</section>

			{/* CTA banner */}
			<section className="max-w-6xl mx-auto">
				<div className="rinato-card p-8 text-center">
					<h3 className="rinato-h3 mb-2">Une pièce à sublimer ?</h3>
					<p className="text-slateLight/80 mb-4">Confiez-la à l’Atelier. RINATO, c’est l’upcycling haute couture.</p>
					<a className="rinato-cta" href="/my-products">Proposer ma pièce</a>
				</div>
			</section>
		</div>
	)
}
