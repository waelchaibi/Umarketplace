import { useState } from 'react'
import toast from 'react-hot-toast'
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
		try {
		const fd = new FormData()
		fd.append('title', title)
		fd.append('description', description)
		fd.append('category', category)
		if (originalPrice !== '') fd.append('originalPrice', String(originalPrice))
		if (currentPrice !== '') fd.append('currentPrice', String(currentPrice))
		fd.append('condition', condition)
		if (files) Array.from(files).forEach(f => fd.append('images', f))
		await axios.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
			toast.success('Produit créé')
		} catch (e: any) {
			toast.error(e?.response?.data?.error || 'Échec de création')
		}
	}

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="rinato-h2 mb-6">Créer une pièce</h1>
			<form onSubmit={submit} className="space-y-4 rinato-card p-6">
				<div className="grid md:grid-cols-2 gap-4">
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required />
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" placeholder="Catégorie" value={category} onChange={e => setCategory(e.target.value)} />
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="Prix d’origine" value={originalPrice as any} onChange={e => setOriginalPrice(Number(e.target.value))} />
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="Prix actuel" value={currentPrice as any} onChange={e => setCurrentPrice(Number(e.target.value))} />
				</div>
				<textarea className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
				<div className="grid md:grid-cols-2 gap-4 items-center">
					<select className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight" value={condition} onChange={e => setCondition(e.target.value)}>
						<option value="mint">mint</option>
						<option value="excellent">excellent</option>
						<option value="good">good</option>
						<option value="fair">fair</option>
					</select>
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight" type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} />
				</div>
				<button type="submit" className="rinato-cta">Créer</button>
			</form>
		</div>
	)
}
