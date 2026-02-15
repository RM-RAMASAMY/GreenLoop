import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Image, MapPin, MoreHorizontal, TrendingUp, Users, Flame, Award, ThumbsUp, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// --- Fake community data ---
const FAKE_USERS = [
    { id: 'u1', name: 'Priya Sharma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', level: 12, badge: '🌿 Eco Warrior' },
    { id: 'u2', name: 'Marcus Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', level: 8, badge: '🌱 Seedling' },
    { id: 'u3', name: 'Aisha Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha', level: 15, badge: '🌳 Tree Guardian' },
    { id: 'u4', name: 'Jordan Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', level: 6, badge: '♻️ Recycler' },
    { id: 'u5', name: 'Elena Kowalski', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', level: 10, badge: '💧 Water Saver' },
    { id: 'u6', name: 'David Okafor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', level: 20, badge: '🏆 Champion' },
    { id: 'u7', name: 'Mia Tanaka', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', level: 9, badge: '🚲 Commuter' },
];

const FAKE_POSTS = [
    {
        id: 'p1', user: FAKE_USERS[0], time: '2h ago',
        text: 'Just planted 3 oak saplings at Golden Gate Park! 🌳 The weather was perfect and we had about 15 volunteers show up. Love this community!',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=500&fit=crop',
        likes: 42, comments: 8, shares: 3, tag: 'Planting',
    },
    {
        id: 'p2', user: FAKE_USERS[1], time: '4h ago',
        text: 'Week 3 of biking to work instead of driving. Already saved 47kg of CO₂ according to GreenLoop! 🚲💨 Who else is doing the green commute challenge?',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop',
        likes: 67, comments: 15, shares: 7, tag: 'Commute',
    },
    {
        id: 'p3', user: FAKE_USERS[2], time: '6h ago',
        text: 'Our neighborhood cleanup crew collected 12 bags of trash from Ocean Beach today! 🧹🌊 Shoutout to everyone who came out. The beach looks amazing now.',
        image: 'https://images.unsplash.com/photo-1617953141700-ace03c481036?w=800&h=500&fit=crop',
        likes: 128, comments: 24, shares: 15, tag: 'Cleanup',
    },
    {
        id: 'p4', user: FAKE_USERS[3], time: '8h ago',
        text: 'Switched from plastic wrap to beeswax wraps for all my food storage. Small change but it feels great knowing I\'m not adding to landfills anymore! ♻️',
        image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&h=500&fit=crop',
        likes: 35, comments: 6, shares: 2, tag: 'Swap',
    },
    {
        id: 'p5', user: FAKE_USERS[4], time: '12h ago',
        text: 'Installed a rainwater collection system this weekend! Expected to save around 2,000 gallons per year. Here\'s the setup if anyone wants to try it 💧',
        image: 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?w=800&h=500&fit=crop',
        likes: 89, comments: 19, shares: 11, tag: 'Water',
    },
    {
        id: 'p6', user: FAKE_USERS[5], time: '1d ago',
        text: 'Hit Level 20 on GreenLoop! 🏆 What a journey. Started 6 months ago with just recycling and now I\'m running community planting events. This platform changed my perspective on sustainability.',
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=500&fit=crop',
        likes: 203, comments: 45, shares: 22, tag: 'Milestone',
    },
    {
        id: 'p7', user: FAKE_USERS[6], time: '1d ago',
        text: 'Found this beautiful monarch butterfly in my garden today! Planted milkweed last spring specifically for them and it\'s working 🦋🌸',
        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=500&fit=crop',
        likes: 156, comments: 31, shares: 9, tag: 'Nature',
    },
    {
        id: 'p8', user: FAKE_USERS[0], time: '2d ago',
        text: 'Our composting workshop at the community center was a huge success! Over 30 people learned how to start home composting. GreenLoop XP for everyone 🌍',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop',
        likes: 71, comments: 12, shares: 5, tag: 'Compost',
    },
];

const TRENDING_TOPICS = [
    { tag: '#PlantATree', posts: '2.4k', trend: 'up' },
    { tag: '#ZeroWaste2026', posts: '1.8k', trend: 'up' },
    { tag: '#BikeToWork', posts: '945', trend: 'up' },
    { tag: '#OceanCleanup', posts: '3.1k', trend: 'up' },
    { tag: '#SustainableLiving', posts: '5.2k', trend: 'up' },
];

const TAG_COLORS = {
    Planting: 'bg-emerald-100 text-emerald-700',
    Commute: 'bg-blue-100 text-blue-700',
    Cleanup: 'bg-amber-100 text-amber-700',
    Swap: 'bg-purple-100 text-purple-700',
    Water: 'bg-cyan-100 text-cyan-700',
    Milestone: 'bg-yellow-100 text-yellow-700',
    Nature: 'bg-green-100 text-green-700',
    Compost: 'bg-orange-100 text-orange-700',
};

function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
}

export default function CommunityPage() {
    const [posts, setPosts] = useState(FAKE_POSTS);
    const [newPost, setNewPost] = useState('');
    const [liked, setLiked] = useState({});
    const [saved, setSaved] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');

    const toggleLike = (postId) => {
        setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, likes: liked[postId] ? p.likes - 1 : p.likes + 1 } : p
        ));
    };

    const toggleSave = (postId) => {
        setSaved(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const filters = ['all', 'Planting', 'Commute', 'Cleanup', 'Swap', 'Water', 'Nature'];
    const filteredPosts = activeFilter === 'all' ? posts : posts.filter(p => p.tag === activeFilter);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex gap-6">
                {/* Main Feed */}
                <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Users className="h-7 w-7 text-primary" />
                            </div>
                            Community
                        </h1>
                        <p className="text-muted-foreground mt-1">Share your eco journey and inspire others</p>
                    </div>

                    {/* Compose Box */}
                    <Card className="border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    You
                                </div>
                                <div className="flex-1 space-y-3">
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="Share your eco win today... 🌱"
                                        className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px] resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                <Image size={14} /> Photo
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                <MapPin size={14} /> Location
                                            </button>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="gap-1.5 px-4"
                                            disabled={!newPost.trim()}
                                            onClick={() => {
                                                if (newPost.trim()) {
                                                    setPosts([{
                                                        id: `p-new-${Date.now()}`,
                                                        user: { id: 'me', name: 'You', avatar: null, level: 5, badge: '🌱 Seedling' },
                                                        time: 'Just now',
                                                        text: newPost,
                                                        image: null,
                                                        likes: 0, comments: 0, shares: 0, tag: 'Nature',
                                                    }, ...posts]);
                                                    setNewPost('');
                                                }
                                            }}
                                        >
                                            <Send size={14} /> Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === f
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {f === 'all' ? '🌍 All' : f}
                            </button>
                        ))}
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-5">
                        {filteredPosts.map(post => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <CardContent className="p-0">
                                    {/* Post Header */}
                                    <div className="flex items-center justify-between px-5 pt-4 pb-3">
                                        <div className="flex items-center gap-3">
                                            {post.user.avatar ? (
                                                <img
                                                    src={post.user.avatar}
                                                    alt={post.user.name}
                                                    className="w-10 h-10 rounded-full bg-muted"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {post.user.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{post.user.name}</span>
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                        Lv.{post.user.level}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{post.user.badge}</span>
                                                    <span>•</span>
                                                    <span>{post.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {post.tag && (
                                                <Badge className={`text-[10px] ${TAG_COLORS[post.tag] || 'bg-gray-100 text-gray-600'}`}>
                                                    {post.tag}
                                                </Badge>
                                            )}
                                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Text */}
                                    <div className="px-5 pb-3">
                                        <p className="text-sm leading-relaxed">{post.text}</p>
                                    </div>

                                    {/* Post Image */}
                                    {post.image && (
                                        <div className="relative">
                                            <img
                                                src={post.image}
                                                alt="Post"
                                                className="w-full max-h-[400px] object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Interaction Bar */}
                                    <div className="px-5 py-3 flex items-center justify-between border-t border-border">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${liked[post.id]
                                                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                                        : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                                                    }`}
                                            >
                                                <Heart size={16} className={liked[post.id] ? 'fill-red-500' : ''} />
                                                {formatCount(post.likes)}
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all">
                                                <MessageCircle size={16} />
                                                {post.comments}
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-all">
                                                <Share2 size={16} />
                                                {post.shares}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => toggleSave(post.id)}
                                            className={`p-1.5 rounded-lg transition-all ${saved[post.id]
                                                    ? 'text-amber-500 hover:bg-amber-50'
                                                    : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                                                }`}
                                        >
                                            {saved[post.id] ? <BookmarkCheck size={18} className="fill-amber-500" /> : <Bookmark size={18} />}
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-72 flex-shrink-0 space-y-5 hidden lg:block">
                    {/* Trending */}
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <TrendingUp size={16} className="text-primary" />
                                Trending Topics
                            </h3>
                            <div className="space-y-2.5">
                                {TRENDING_TOPICS.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div>
                                            <div className="text-sm font-semibold text-primary group-hover:underline">{t.tag}</div>
                                            <div className="text-xs text-muted-foreground">{t.posts} posts</div>
                                        </div>
                                        <Flame size={14} className="text-orange-400" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Contributors */}
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <Award size={16} className="text-amber-500" />
                                Top Contributors
                            </h3>
                            <div className="space-y-3">
                                {FAKE_USERS.slice(0, 5).map((u, i) => (
                                    <div key={u.id} className="flex items-center gap-3">
                                        <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                            {i + 1}
                                        </span>
                                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-muted" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{u.name}</div>
                                            <div className="text-xs text-muted-foreground">Level {u.level}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Stats */}
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                                <Users size={16} />
                                Community Impact
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-700">1,247</div>
                                    <div className="text-[10px] text-emerald-600/80 font-medium">MEMBERS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-700">8,432</div>
                                    <div className="text-[10px] text-emerald-600/80 font-medium">TREES PLANTED</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-700">24.5t</div>
                                    <div className="text-[10px] text-emerald-600/80 font-medium">CO₂ SAVED</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-700">156</div>
                                    <div className="text-[10px] text-emerald-600/80 font-medium">CLEANUPS</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
