import React, { useState, useEffect } from 'react';
import { Upload, Play, Heart, MessageCircle, Share2, Search, Plus, Trash2 } from 'lucide-react';

export default function VideoPlatform() {
  const [videos, setVideos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'movie',
    thumbnail: '',
    duration: '',
    videoFile: null
  });

  const categories = [
    { id: 'all', name: 'Všetko' },
    { id: 'movie', name: '🎬 Filmy' },
    { id: 'series', name: '📺 Seriály' },
    { id: 'gaming', name: '🎮 Gaming' },
    { id: 'gameplay', name: '🕹️ Gameplay' }
  ];

  // Načítanie videí z databázy
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const result = await window.storage.get('videos-db');
      if (result && result.value) {
        setVideos(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Prázdna databáza - začíname s novými videami');
    }
  };

  const saveVideos = async (updatedVideos) => {
    try {
      await window.storage.set('videos-db', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Chyba pri ukladaní:', error);
    }
  };

  const handleUpload = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Prosím vyplň názov a popis!');
      return;
    }

    if (!formData.videoFile) {
      alert('Prosím vyber video súbor!');
      return;
    }

    // Konverzia videa na base64
    const videoBase64 = await fileToBase64(formData.videoFile);
    let thumbnailBase64 = '';

    if (formData.thumbnail && typeof formData.thumbnail !== 'string') {
      thumbnailBase64 = await fileToBase64(formData.thumbnail);
    }

    const newVideo = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      videoData: videoBase64,
      thumbnailData: thumbnailBase64,
      videoFileName: formData.videoFile.name,
      likes: 0,
      comments: 0,
      views: 0,
      uploadDate: new Date().toLocaleDateString('sk-SK'),
      userLiked: false,
      duration: formData.duration
    };

    const updatedVideos = [...videos, newVideo];
    await saveVideos(updatedVideos);
    
    setFormData({
      title: '',
      description: '',
      category: 'movie',
      thumbnail: '',
      duration: '',
      videoFile: null
    });
    setShowUpload(false);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'video/mp4') {
      setFormData({...formData, videoFile: file});
    } else {
      alert('Prosím vyber len MP4 video!');
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setFormData({...formData, thumbnail: file});
    } else {
      alert('Prosím vyber len PNG alebo JPG obrázok!');
    }
  };

  const deleteVideo = async (id) => {
    const updatedVideos = videos.filter(v => v.id !== id);
    await saveVideos(updatedVideos);
  };

  const toggleLike = async (id) => {
    const updatedVideos = videos.map(v => {
      if (v.id === id) {
        return {
          ...v,
          userLiked: !v.userLiked,
          likes: v.userLiked ? v.likes - 1 : v.likes + 1
        };
      }
      return v;
    });
    await saveVideos(updatedVideos);
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryEmoji = (cat) => {
    const emojis = {
      movie: '🎬',
      series: '📺',
      gaming: '🎮',
      gameplay: '🕹️'
    };
    return emojis[cat] || '📹';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-red-500" fill="currentColor" />
              <h1 className="text-2xl font-bold text-white">StreamHub</h1>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              Nahrať video
            </button>
          </div>

          {/* Search a kategórie */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Hľadaj filmy, seriály, gameplay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Kategórie */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1 rounded-full whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload panel */}
        {showUpload && (
          <div className="mb-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Nahrať nové video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Názov videa*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Zadaj názov..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Popis*</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Popíš svoje video..."
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Kategória</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="movie">🎬 Film</option>
                    <option value="series">📺 Seriál</option>
                    <option value="gaming">🎮 Gaming</option>
                    <option value="gameplay">🕹️ Gameplay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Dĺžka videa (min)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Napr. 120"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Video súbor (MP4)*</label>
                <input
                  type="file"
                  accept="video/mp4,.mp4"
                  onChange={(e) => handleVideoUpload(e)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
                {formData.videoFile && <p className="text-green-400 text-sm mt-2">✓ Video pripravené: {formData.videoFile.name}</p>}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Miniatúra (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg"
                  onChange={(e) => handleThumbnailUpload(e)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
                {formData.thumbnail && <p className="text-green-400 text-sm mt-2">✓ Miniatúra pripravená</p>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Nahrať video
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 group">
                {/* Miniatúra */}
                <div className="relative bg-slate-700 h-40 overflow-hidden">
                  {video.thumbnailData ? (
                    <img
                      src={video.thumbnailData}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs font-bold">
                    {video.duration || '--'}m
                  </div>
                  <button
                    onClick={() => window.open(video.videoData, '_blank')}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition hover:bg-black/60"
                  >
                    <Play className="w-12 h-12 text-white" fill="white" />
                  </button>
                </div>

                {/* Obsah */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryEmoji(video.category)}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {categories.find(c => c.id === video.category)?.name.split(' ')[1]}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-red-500 transition">
                    {video.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Štatistika */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span>{video.views.toLocaleString()} zobrazení</span>
                    <span>•</span>
                    <span>{video.uploadDate}</span>
                  </div>

                  {/* Tlačidlá */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLike(video.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded transition ${
                        video.userLiked
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={video.userLiked ? 'currentColor' : 'none'} />
                      <span className="text-xs">{video.likes}</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{video.comments}</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="px-3 py-2 rounded bg-slate-700 text-red-400 hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Zatiaľ nie sú žiadne videá v tejto kategórii</p>
            <p className="text-slate-500 text-sm mt-2">Buď prvý a nahraj svoje video!</p>
          </div>
        )}
      </div>
    </div>
  );
}