import React, { useState } from 'react';
import { MapPin, Phone, Clock, Star, ExternalLink, Sprout, ArrowUpRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const NURSERIES = [
    {
        id: 1,
        name: 'Flora & Fauna Garden Center',
        address: '1355 Market St, San Francisco, CA',
        phone: '(415) 555-0142',
        rating: 4.8,
        reviews: 234,
        hours: 'Open - Closes 7 PM',
        distance: '0.3 mi',
        specialties: ['Native Plants', 'Succulents', 'Organic Soil'],
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=250&fit=crop',
        featured: true,
        description: 'Bay Area premier native plant nursery. Family-owned since 1998, specializing in drought-tolerant California natives.',
        promo: '15% off for GreenLoop members'
    },
    {
        id: 2,
        name: 'Urban Roots Nursery',
        address: '890 Valencia St, San Francisco, CA',
        phone: '(415) 555-0198',
        rating: 4.6,
        reviews: 189,
        hours: 'Open - Closes 6 PM',
        distance: '0.8 mi',
        specialties: ['Indoor Plants', 'Herbs', 'Planters'],
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop',
        featured: false,
        description: 'Curated collection of indoor plants, perfect for apartments and urban living. Expert advice on plant care.',
        promo: null
    },
    {
        id: 3,
        name: 'Bay Bloom Plant Shop',
        address: '2100 Irving St, San Francisco, CA',
        phone: '(415) 555-0256',
        rating: 4.9,
        reviews: 312,
        hours: 'Open - Closes 8 PM',
        distance: '1.2 mi',
        specialties: ['Rare Plants', 'Bonsai', 'Workshops'],
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=250&fit=crop',
        featured: true,
        description: 'Rare and exotic plant specialists. Monthly workshops on bonsai, terrarium building, and plant propagation.',
        promo: 'Free workshop with any purchase over $50'
    },
    {
        id: 4,
        name: 'Green Thumb Depot',
        address: '550 Clement St, San Francisco, CA',
        phone: '(415) 555-0311',
        rating: 4.4,
        reviews: 156,
        hours: 'Open - Closes 6 PM',
        distance: '1.5 mi',
        specialties: ['Trees', 'Shrubs', 'Landscaping'],
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=250&fit=crop',
        featured: false,
        description: 'Full-service garden center with a wide selection of trees, shrubs, and landscaping supplies for every project.',
        promo: null
    },
    {
        id: 5,
        name: 'Sunset Garden Nursery',
        address: '3820 Judah St, San Francisco, CA',
        phone: '(415) 555-0487',
        rating: 4.7,
        reviews: 278,
        hours: 'Open - Closes 5 PM',
        distance: '2.1 mi',
        specialties: ['Flowers', 'Seasonal', 'Delivery'],
        image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=250&fit=crop',
        featured: false,
        description: 'Beautiful seasonal flowers and arrangements. Same-day delivery available throughout San Francisco.',
        promo: 'Free delivery on orders over $30'
    },
    {
        id: 6,
        name: 'EcoPlant Co-op',
        address: '1200 Divisadero St, San Francisco, CA',
        phone: '(415) 555-0523',
        rating: 4.5,
        reviews: 142,
        hours: 'Open - Closes 7 PM',
        distance: '0.9 mi',
        specialties: ['Organic', 'Composting', 'Community'],
        image: 'https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=400&h=250&fit=crop',
        featured: false,
        description: 'Community-driven plant cooperative. All organic and sustainably sourced. Composting supplies and classes.',
        promo: '10% off for first-time visitors'
    }
];

const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <Star
                key={star}
                size={14}
                className={star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
            />
        ))}
        <span className="text-sm font-semibold ml-1">{rating}</span>
        <span className="text-xs text-muted-foreground">({rating > 4.5 ? '200+' : '100+'} reviews)</span>
    </div>
);

export default function NurseriesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNurseries = NURSERIES.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const featured = filteredNurseries.filter(n => n.featured);
    const regular = filteredNurseries.filter(n => !n.featured);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sprout className="h-8 w-8 text-emerald-600" /> Plant Nurseries
                    </h1>
                    <p className="text-muted-foreground">Find nurseries near you and grow your green impact.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search nurseries, specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-input bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {/* Featured Section */}
            {featured.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">⭐ Featured Partners</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {featured.map(nursery => (
                            <Card key={nursery.id} className="overflow-hidden border-emerald-200 hover:shadow-lg transition-shadow">
                                <div className="relative h-40 overflow-hidden">
                                    <img src={nursery.image} alt={nursery.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md">
                                            GreenLoop Partner
                                        </Badge>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow">
                                        {nursery.distance}
                                    </div>
                                </div>
                                <CardContent className="p-5 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{nursery.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{nursery.description}</p>
                                    </div>
                                    <StarRating rating={nursery.rating} />
                                    <div className="flex flex-wrap gap-2">
                                        {nursery.specialties.map(spec => (
                                            <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin size={14} /> {nursery.address}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock size={14} /> {nursery.hours}
                                    </div>
                                    {nursery.promo && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 font-medium">
                                            🎉 {nursery.promo}
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            className="flex-1 gap-2"
                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nursery.address)}`, '_blank')}
                                        >
                                            <MapPin size={14} /> Directions
                                        </Button>
                                        <Button variant="outline" className="gap-2" onClick={() => window.open(`tel:${nursery.phone}`)}>
                                            <Phone size={14} /> Call
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Nurseries */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">🌿 All Nearby Nurseries</h2>
                <div className="space-y-3">
                    {(regular.length > 0 ? regular : filteredNurseries).map(nursery => (
                        <Card key={nursery.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex">
                                    <div className="w-32 md:w-48 flex-shrink-0">
                                        <img src={nursery.image} alt={nursery.name} className="w-full h-full object-cover rounded-l-lg" />
                                    </div>
                                    <div className="flex-1 p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-base">{nursery.name}</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{nursery.distance}</span>
                                        </div>
                                        <StarRating rating={nursery.rating} />
                                        <p className="text-sm text-muted-foreground line-clamp-2">{nursery.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {nursery.specialties.map(spec => (
                                                <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {nursery.address}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {nursery.hours}</span>
                                        </div>
                                        {nursery.promo && (
                                            <div className="text-xs text-emerald-700 font-medium">🎉 {nursery.promo}</div>
                                        )}
                                        <div className="flex gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                className="text-xs gap-1 h-8"
                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nursery.address)}`, '_blank')}
                                            >
                                                <MapPin size={12} /> Directions
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-xs gap-1 h-8" onClick={() => window.open(`tel:${nursery.phone}`)}>
                                                <Phone size={12} /> Call
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
