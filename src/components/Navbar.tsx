import { Brain } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            FutuBOT
          </h1>
        </div>
      </div>
    </nav>
  );
}