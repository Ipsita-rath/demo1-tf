import { useState } from "react";
import { User, Settings, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Cloud Architect",
    company: "Tech Corp",
    avatarUrl: ""
  });



  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials(profileData.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex flex-col space-y-4 p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
                  <AvatarFallback className="bg-blue-500 text-white text-lg">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Full Name"
                        className="h-8"
                      />
                      <Input
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Email"
                        className="h-8"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold">{profileData.name}</h3>
                      <p className="text-sm text-gray-500">{profileData.email}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="role" className="text-xs">Role</Label>
                    <Input
                      id="role"
                      value={profileData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="Your Role"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-xs">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Company Name"
                      className="h-8"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Role:</span>
                    <Badge variant="secondary" className="text-xs">{profileData.role}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Company:</span>
                    <Badge variant="outline" className="text-xs">{profileData.company}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="flex-1">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}