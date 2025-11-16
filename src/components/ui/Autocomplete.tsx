import React, { useState, useEffect, useRef } from "react";
import "../../styles/Autocomplete.css";

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<{ id: number; name: string }[]>;
  error?: string;
  placeholder?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  value,
  onChange,
  onSearch,
  error,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [selectedValue, setSelectedValue] = useState(value);
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        // Reset to selected value if user didn't select from dropdown
        if (inputValue !== selectedValue) {
          setInputValue(selectedValue);
          onChange(selectedValue);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, selectedValue, onChange]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    if (query.trim().length > 0) {
      setLoading(true);
      try {
        const results = await onSearch(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedValue("");
      onChange("");
    }
  };

  const handleSelectSuggestion = (suggestion: { id: number; name: string }) => {
    setInputValue(suggestion.name);
    setSelectedValue(suggestion.name);
    onChange(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div className='autocomplete-wrapper' ref={wrapperRef}>
      <label className='autocomplete-label'>{label}</label>
      <input
        type='text'
        className={`autocomplete-input ${error ? "autocomplete-error" : ""}`}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      {error && <span className='autocomplete-error-message'>{error}</span>}

      {showSuggestions && (
        <div className='autocomplete-suggestions'>
          {loading && <div className='autocomplete-loading'>Loading...</div>}
          {!loading && suggestions.length === 0 && (
            <div className='autocomplete-no-results'>No results found</div>
          )}
          {!loading && suggestions.length > 0 && (
            <ul className='autocomplete-list'>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className='autocomplete-item'
                  onClick={() => handleSelectSuggestion(suggestion)}>
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
