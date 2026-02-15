import React, { useState } from 'react';
import { Newspaper, Globe, MapPin, Flag, ArrowUpRight, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/Button';

const NEWS_DATA = {
    local: [
        {
            id: 1,
            title: 'San Francisco Launches $50M Urban Forest Expansion Plan',
            source: 'SF Chronicle',
            time: '2 hours ago',
            summary: 'Mayor announces ambitious plan to plant 50,000 new trees across the city by 2028, focusing on underserved neighborhoods and heat islands.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Policy',
            trending: true
        },
        {
            id: 2,
            title: 'Bay Area Community Gardens See 300% Growth Post-Pandemic',
            source: 'KQED',
            time: '5 hours ago',
            summary: 'A new report shows community garden participation has tripled since 2020, with waitlists growing across all nine Bay Area counties.',
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Community',
            trending: false
        },
        {
            id: 3,
            title: 'Golden Gate Park Solar Panels Now Power 2,000 Homes',
            source: 'SF Gate',
            time: '8 hours ago',
            summary: 'The park\'s new solar array has reached full capacity, generating enough clean energy to power thousands of nearby residences annually.',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Energy',
            trending: true
        },
        {
            id: 4,
            title: 'Local Startup Turns Food Waste Into Compost at Scale',
            source: 'TechCrunch',
            time: '1 day ago',
            summary: 'SF-based ReCircle raises $12M to expand its AI-powered composting network, diverting 500 tons of food waste from landfills monthly.',
            image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Startups',
            trending: false
        }
    ],
    national: [
        {
            id: 5,
            title: 'EPA Announces Strictest-Ever Emissions Standards for Power Plants',
            source: 'AP News',
            time: '3 hours ago',
            summary: 'The new regulations require coal and gas plants to reduce carbon emissions by 90% by 2035, marking a historic shift in U.S. climate policy.',
            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Policy',
            trending: true
        },
        {
            id: 6,
            title: 'Electric Vehicle Sales Surpass Gasoline Cars for First Time',
            source: 'Reuters',
            time: '6 hours ago',
            summary: 'Q4 2025 data shows EVs outsold traditional gas-powered vehicles in the US for the first time, driven by falling battery costs and new models.',
            image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Transport',
            trending: true
        },
        {
            id: 7,
            title: 'National Parks Report Record Reforestation: 10M Trees Planted',
            source: 'NPR',
            time: '12 hours ago',
            summary: 'The National Park Service\'s Replant America initiative has exceeded its goal, planting 10 million native trees across 120 parks nationwide.',
            image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Conservation',
            trending: false
        },
        {
            id: 8,
            title: 'Congress Passes Landmark $200B Green Infrastructure Bill',
            source: 'Washington Post',
            time: '1 day ago',
            summary: 'Bipartisan legislation allocates funding for renewable energy grid upgrades, EV charging networks, and urban green spaces across all 50 states.',
            image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Legislation',
            trending: false
        }
    ],
    global: [
        {
            id: 9,
            title: 'Global Carbon Emissions Decline for First Time in Decades',
            source: 'BBC',
            time: '1 hour ago',
            summary: 'The Global Carbon Project reports a 2.1% decline in worldwide CO₂ emissions in 2025, attributed to rapid renewable energy adoption in China and India.',
            image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Climate',
            trending: true
        },
        {
            id: 10,
            title: 'Amazon Rainforest Deforestation Drops to 15-Year Low',
            source: 'The Guardian',
            time: '4 hours ago',
            summary: 'Brazil reports a 62% reduction in Amazon deforestation compared to 2023, following aggressive enforcement and indigenous land protections.',
            image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Conservation',
            trending: true
        },
        {
            id: 11,
            title: 'EU Achieves 50% Renewable Energy Milestone',
            source: 'Euronews',
            time: '10 hours ago',
            summary: 'The European Union hits a historic milestone as renewables now generate over half of its total electricity, led by offshore wind expansion.',
            image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Energy',
            trending: false
        },
        {
            id: 12,
            title: 'Great Barrier Reef Shows Signs of Recovery After Coral Restoration',
            source: 'Nature',
            time: '1 day ago',
            summary: 'Scientists report a 40% increase in coral coverage in restored sections of the reef, offering hope for marine biodiversity worldwide.',
            image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=200&fit=crop',
            url: '#',
            tag: 'Ocean',
            trending: false
        }
    ]
};

const tagColorMap = {
    Policy: 'bg-blue-100 text-blue-800',
    Community: 'bg-purple-100 text-purple-800',
    Energy: 'bg-yellow-100 text-yellow-800',
    Startups: 'bg-cyan-100 text-cyan-800',
    Transport: 'bg-indigo-100 text-indigo-800',
    Conservation: 'bg-emerald-100 text-emerald-800',
    Legislation: 'bg-rose-100 text-rose-800',
    Climate: 'bg-orange-100 text-orange-800',
    Ocean: 'bg-teal-100 text-teal-800',
};

const tabIcons = {
    local: <MapPin size={16} />,
    national: <Flag size={16} />,
    global: <Globe size={16} />,
};

const tabLabels = {
    local: 'Local (SF Bay Area)',
    national: 'National (USA)',
    global: 'Global'
};

export default function NewsPage() {
    const [activeTab, setActiveTab] = useState('local');
    const articles = NEWS_DATA[activeTab] || [];

    const heroArticle = articles.find(a => a.trending) || articles[0];
    const restArticles = articles.filter(a => a.id !== heroArticle?.id);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Newspaper className="h-8 w-8 text-blue-600" /> Eco News
                </h1>
                <p className="text-muted-foreground">Latest environmental impact highlights from around the world.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-muted/50 p-1.5 rounded-xl">
                {Object.keys(NEWS_DATA).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab
                                ? "bg-white shadow-sm text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tabIcons[tab]} {tabLabels[tab]}
                    </button>
                ))}
            </div>

            {/* Hero Article */}
            {heroArticle && (
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-56 md:h-72 overflow-hidden">
                        <img
                            src={heroArticle.image}
                            alt={heroArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${tagColorMap[heroArticle.tag] || 'bg-gray-100 text-gray-800'} text-xs`}>
                                    {heroArticle.tag}
                                </Badge>
                                {heroArticle.trending && (
                                    <Badge className="bg-red-500 text-white text-xs gap-1">
                                        <TrendingUp size={10} /> Trending
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2">{heroArticle.title}</h2>
                            <p className="text-sm text-white/80 line-clamp-2">{heroArticle.summary}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                                <span className="font-semibold text-white/80">{heroArticle.source}</span>
                                <span className="flex items-center gap-1"><Clock size={10} /> {heroArticle.time}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Article Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {restArticles.map(article => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="relative h-36 overflow-hidden">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2">
                                <Badge className={`${tagColorMap[article.tag] || 'bg-gray-100 text-gray-800'} text-xs shadow-sm`}>
                                    {article.tag}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-2">
                            <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                <span className="font-medium">{article.source}</span>
                                <span className="flex items-center gap-1"><Clock size={10} /> {article.time}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* More News CTA */}
            <div className="text-center py-4">
                <Button variant="outline" className="gap-2">
                    <ExternalLink size={14} /> Browse More Eco News
                </Button>
            </div>
        </div>
    );
}
