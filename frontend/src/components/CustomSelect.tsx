import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import './CustomSelect.css';

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  maxHeight?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  searchPlaceholder = 'Pesquisar...',
  showSearch = true,
  maxHeight = '300px',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.group && option.group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group options by group
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || '';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const visibleOptions = Object.values(groupedOptions).flat();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < visibleOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < visibleOptions.length) {
            onChange(visibleOptions[focusedIndex].value);
            setIsOpen(false);
          } else if (focusedIndex === -1 && visibleOptions.length > 0) {
            // If nothing is focused, select the first option
            onChange(visibleOptions[0].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, groupedOptions, onChange]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  return (
    <div className={`custom-select ${className}`} ref={wrapperRef}>
      <div 
        className={`select-header ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
          setFocusedIndex(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
            setSearchTerm('');
          }
        }}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption ? selectedOption.label : placeholder}
      >
        <span className="selected-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="select-dropdown" style={{ maxHeight }}>
          {showSearch && (
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFocusedIndex(-1);
                }}
                className="search-input"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="options-container">
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <React.Fragment key={group || 'no-group'}>
                {group && <div className="option-group">{group}</div>}
                {groupOptions.map((option, index) => {
                  const optionIndex = Object.keys(groupedOptions)
                    .slice(0, Object.keys(groupedOptions).indexOf(group))
                    .reduce((acc, key) => acc + groupedOptions[key].length, 0) + index;
                    
                  return (
                    <div
                      key={option.value}
                      className={`option ${
                        value === option.value ? 'selected' : ''
                      } ${focusedIndex === optionIndex ? 'focused' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setFocusedIndex(optionIndex)}
                      role="option"
                      aria-selected={value === option.value}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onChange(option.value);
                          setIsOpen(false);
                        }
                      }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="no-results">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
