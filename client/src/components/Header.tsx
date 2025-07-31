import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Cloud, Save, User, Eye, Undo, Redo, Moon, Sun, Globe } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import { useTheme } from "@/contexts/ThemeContext";
import logoImage from "@assets/geakminds-logo_1752819827652.png";

interface HeaderProps {
  isConnected: boolean;
  onPreviewCode: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onGlobalInfo?: () => void;
}

export default function Header({ 
  isConnected, 
  onPreviewCode, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false,
  onGlobalInfo
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="GeakMinds Logo" 
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                  Terraform Automation System
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Azure Infrastructure Builder
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center space-x-1"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={onUndo}
                size="sm"
                variant="outline"
                disabled={!canUndo}
                className="flex items-center space-x-1"
              >
                <Undo className="h-4 w-4" />
                <span>Undo</span>
              </Button>
              
              <Button 
                onClick={onRedo}
                size="sm"
                variant="outline"
                disabled={!canRedo}
                className="flex items-center space-x-1"
              >
                <Redo className="h-4 w-4" />
                <span>Redo</span>
              </Button>
            </div>

            <Button 
              onClick={onPreviewCode}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview Code</span>
            </Button>
            
            <Button 
              onClick={onGlobalInfo}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Global Info</span>
            </Button>
            
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
