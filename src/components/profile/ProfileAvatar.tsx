import { useState, useRef } from "react";
import { UserCircle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onAvatarChange?: (file: File) => void;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const iconSizes = {
  sm: 24,
  md: 40,
  lg: 56,
};

export const ProfileAvatar = ({ 
  avatarUrl, 
  displayName, 
  size = "md",
  editable = false,
  onAvatarChange 
}: ProfileAvatarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = () => {
    if (editable && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onAvatarChange?.(file);
    }
  };

  const displayImage = preview || avatarUrl;
  const initials = displayName?.slice(0, 2).toUpperCase();

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        sizeClasses[size],
        editable && "cursor-pointer group"
      )}
      onClick={handleClick}
    >
      {displayImage ? (
        <img 
          src={displayImage} 
          alt={displayName || "Avatar"} 
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-semibold" style={{ fontSize: iconSizes[size] * 0.4 }}>
            {initials}
          </span>
        </div>
      ) : (
        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
          <UserCircle size={iconSizes[size]} className="text-primary" />
        </div>
      )}
      
      {editable && (
        <>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={size === "lg" ? 24 : 16} className="text-white" />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};
