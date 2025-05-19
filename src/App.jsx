import { useState, useEffect } from 'react';
import { Search, Globe, Languages } from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState('es'); // Default to Spanish
  const [targetLanguage, setTargetLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError('');
    setArticleContent('');
    
    try {
      // Use the Wikipedia API with origin=* to handle CORS
      const url = `https://${language}.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&format=json&exintro=&titles=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Extract content from response
      const { pages } = data.query;
      const pageIds = Object.keys(pages);
      
      if (pageIds.length > 0 && pages[pageIds[0]].extract) {
        // Set content directly - it contains HTML
        setArticleContent(pages[pageIds[0]].extract);
      } else {
        setError(`No article found for "${searchTerm}" in ${languages.find(l => l.code === language).name}`);
      }
    } catch (err) {
      setError('Error fetching Wikipedia article. Please try again.');
      console.error('Error fetching Wikipedia article:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  // Try different API endpoints if one fails
const translateText = async () => {
  if (!selectedText) return;

  setIsLoading(true);
  setTranslatedText('');
  setError('');

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: selectedText,
        toLanguages: [targetLanguage], // can send multiple like ['es','de']
      }),
    });

    const data = await response.json();

    if (data.translations?.[0]?.translated?.[0]) {
      setTranslatedText(data.translations[0].translated[0]);
    } else {
      throw new Error('No translation found');
    }
  } catch (err) {
    setError('Translation failed. Please try again later.');
    setTranslatedText(`[Unable to translate: ${selectedText}]`);
    console.error(err);
  }

  setIsLoading(false);
};




useEffect(() => {
  if (selectedText) {
    translateText();
  }
}, [selectedText]);


  return (
    <div className="flex flex-col p-4 max-w-6xl mx-auto h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Globe className="mr-2" /> Wikipedia Translator
      </h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Article Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Target Language</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Wikipedia article..."
          className="flex-1 p-2 border rounded-l-md"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded-r-md flex items-center"
          disabled={isLoading}
        >
          <Search size={18} />
        </button>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        <div 
          className="flex-1 border rounded-md p-4 overflow-y-auto bg-gray-50"
          onMouseUp={handleTextSelection}
        >
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Languages className="mr-2" size={18} />
            Article ({languages.find(l => l.code === language)?.name})
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : articleContent ? (
            <div dangerouslySetInnerHTML={{ __html: articleContent }}></div>
          ) : (
            <div className="text-gray-500 italic">
              Search for an article to see content here
            </div>
          )}
        </div>
        
        <div className="flex-1 border rounded-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Translation</h2>
          {selectedText && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Selected Text:</h3>
              <div className="border-l-4 border-blue-500 pl-2 py-1 bg-blue-50">
                {selectedText}
              </div>
            </div>
          )}
          {translatedText && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Translated to {languages.find(l => l.code === targetLanguage)?.name}:</h3>
              <div className="border-l-4 border-green-500 pl-2 py-1 bg-green-50">
                {translatedText}
              </div>
            </div>
          )}
          {!selectedText && !translatedText && (
            <div className="text-gray-500 italic">
              Select text from the article to see translation here
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Powered by Wikipedia and LibreTranslate APIs. Select text in the article to translate it.
      </div>
    </div>
  );
}