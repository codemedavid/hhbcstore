import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-pink-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-12 pr-12 py-4 border border-pink-200 rounded-cute focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-sm bg-pastel-white shadow-soft placeholder-soft-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
        >
          <X className="h-5 w-5 text-pink-400 hover:text-pink-600" />
        </button>
      )}
    </div>
  );
}
