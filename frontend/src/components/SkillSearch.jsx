// src/components/SkillSearch.jsx (Updated)
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus, FiX, FiTag } from 'react-icons/fi';

// Common skills suggestions
const COMMON_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS',
  'TypeScript', 'Next.js', 'Vue.js', 'Angular', 'PHP', 'Laravel',
  'Django', 'Flask', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
  'Git', 'GitHub', 'GitLab', 'GraphQL', 'REST API', 'Firebase',
  'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Figma', 'Adobe XD',
  'UI/UX Design', 'Web Design', 'Mobile Development', 'iOS', 'Android',
  'Swift', 'Kotlin', 'Flutter', 'React Native', 'Machine Learning',
  'Data Science', 'AI', 'Blockchain', 'Solidity', 'Web3', 'DevOps',
  'CI/CD', 'Testing', 'Jest', 'Cypress', 'Selenium', 'Agile', 'Scrum'
];

const SkillSearch = ({ 
  selectedSkills = [], 
  onAddSkill, 
  onRemoveSkill,
  onAddCustomSkill,
  placeholder = "Search for skills...",
  maxSuggestions = 6,
  allowCustomSkills = true
}) => {
  const [search, setSearch] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter skills based on search input
  useEffect(() => {
    if (search.trim()) {
      const filtered = COMMON_SKILLS.filter(skill =>
        skill.toLowerCase().includes(search.toLowerCase()) &&
        !selectedSkills.includes(skill)
      ).slice(0, maxSuggestions);
      setFilteredSkills(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  }, [search, selectedSkills, maxSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleAddSuggestedSkill = (skill) => {
    onAddSkill(skill);
    setSearch('');
    setShowSuggestions(false);
  };

  const handleAddCustomSkill = () => {
    const skillToAdd = search.trim();
    if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
      if (onAddCustomSkill) {
        onAddCustomSkill(skillToAdd);
      } else {
        onAddSkill(skillToAdd);
      }
      setSearch('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        handleAddSuggestedSkill(filteredSkills[0]);
      } else if (search.trim() && allowCustomSkills) {
        handleAddCustomSkill();
      }
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar with Add Button */}
      <div className="relative mb-4" ref={searchRef}>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={() => search.trim() && setShowSuggestions(true)}
              className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              placeholder={placeholder}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
          {allowCustomSkills && (
            <button
              type="button"
              onClick={handleAddCustomSkill}
              disabled={!search.trim()}
              className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Custom</span>
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSkills.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Suggested Skills
              </div>
              {filteredSkills.map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddSuggestedSkill(skill)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <FiTag className="w-4 h-4 text-gray-400 mr-3 group-hover:text-blue-500" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">{skill}</span>
                  </div>
                  <FiPlus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </button>
              ))}
              
              {/* Custom skill option */}
              {allowCustomSkills && search.trim() && !filteredSkills.includes(search) && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center">
                      <FiPlus className="w-4 h-4 text-gray-400 mr-3 group-hover:text-green-500" />
                      <div>
                        <span className="font-medium text-gray-700 group-hover:text-green-600">
                          Add "{search}"
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Custom skill</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Custom</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Skills Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Selected Skills ({selectedSkills.length})
          </span>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => selectedSkills.forEach(skill => onRemoveSkill(skill))}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-h-[30px] p-2 bg-gray-50 rounded-xl border border-gray-200">
          {selectedSkills.map((skill, index) => {
            const isCustomSkill = !COMMON_SKILLS.includes(skill);
            return (
              <div
                key={index}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium border transition-colors group ${
                  isCustomSkill 
                    ? 'bg-green-50 text-green-700 border-green-100 hover:border-green-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-200'
                }`}
              >
                <FiTag className={`w-4 h-4 mr-2 ${isCustomSkill ? 'text-green-500' : 'text-blue-500'}`} />
                {skill}
                {isCustomSkill && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                    Custom
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  className={`ml-2 p-0.5 rounded-full ${
                    isCustomSkill 
                      ? 'hover:bg-green-100 text-green-400 hover:text-green-600' 
                      : 'hover:bg-blue-100 text-blue-400 hover:text-blue-600'
                  } transition-colors`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {selectedSkills.length === 0 && (
            <div className="w-full py-3 text-center">
              <span className="text-gray-400 text-sm italic">
                No skills selected. Search above or add custom skills.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillSearch;