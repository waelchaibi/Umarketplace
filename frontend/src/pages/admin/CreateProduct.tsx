import { useState } from 'react'
import axios from '../../config/axios'

export default function CreateProduct() {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('')
	const [originalPrice, setOriginalPrice] = useState<number | ''>('')
	const [currentPrice, setCurrentPrice] = useState<number | ''>('')
	const [condition, setCondition] = useState('excellent')
	const [files, setFiles] = useState<FileList | null>(null)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		const fd = new FormData()
		fd.append('title', title)
		fd.append('description', description)
		fd.append('category', category)
		if (originalPrice !== '') fd.append('originalPrice', String(originalPrice))
		if (currentPrice !== '') fd.append('currentPrice', String(currentPrice))
		fd.append('condition', condition)
		if (files) Array.from(files).forEach(f => fd.append('images', f))
		await axios.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
		alert('Created')
	}

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Create Product</h1>
			<form onSubmit={submit} className="space-y-4 rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
				<div className="grid md:grid-cols-2 gap-4">
					<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
					<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
					<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="number" placeholder="Original Price" value={originalPrice as any} onChange={e => setOriginalPrice(Number(e.target.value))} />
					<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="number" placeholder="Current Price" value={currentPrice as any} onChange={e => setCurrentPrice(Number(e.target.value))} />
				</div>
				<textarea className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
				<div className="grid md:grid-cols-2 gap-4 items-center">
					<select className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={condition} onChange={e => setCondition(e.target.value)}>
						<option value="mint">mint</option>
						<option value="excellent">excellent</option>
						<option value="good">good</option>
						<option value="fair">fair</option>
					</select>
					<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} />
				</div>
				<button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white">Create</button>
			</form>
		</div>
	)
}
