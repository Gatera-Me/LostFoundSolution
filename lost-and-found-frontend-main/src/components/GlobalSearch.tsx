import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface SearchResult {
  type: 'LostItem' | 'FoundItem' | 'User' | 'Match';
  id: number;
  itemName?: string;
  description?: string;
  foundLocation?: string;
  lostItemName?: string;
  foundItemName?: string;
  username?: string;
  email?: string;
}

export const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const fetchSearchResults = async () => {
        try {
          const response = await axios.get('http://localhost:8080/search', {
            params: { q: searchQuery },
            // Removed Authorization header since security is disabled
          });
          setSearchResults(response.data);
          setIsDropdownOpen(true);
        } catch (err) {
          console.error('Failed to fetch search results:', err);
          setError('Failed to load search results. Please try again.');
          setSearchResults([]);
          setIsDropdownOpen(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleResultClick = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex-1 mx-4">
      <input
        type="text"
        placeholder="Search across the site..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
      />
      {(isDropdownOpen || isLoading || error) && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto border border-gray-200">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={
                    result.type === 'LostItem' ? `/lost-items/${result.id}` :
                    result.type === 'FoundItem' ? `/found-items/${result.id}` :
                    result.type === 'User' ? `/view-users` :
                    `/manage-claims/${result.id}`
                  }
                  onClick={handleResultClick}
                  className="block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 text-sm">
                      {result.type === 'LostItem' && `${result.itemName} (${result.description || 'Lost Item'})`}
                      {result.type === 'FoundItem' && `${result.itemName} (Found at ${result.foundLocation})`}
                      {result.type === 'User' && `${result.username} (${result.email})`}
                      {result.type === 'Match' && `Match: ${result.lostItemName} - ${result.foundItemName}`}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{result.type}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}