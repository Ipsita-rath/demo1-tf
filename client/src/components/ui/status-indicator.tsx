import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "pending";
  message?: string;
  className?: string;
}

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const config = {
    success: {
      icon: CheckCircle,
      className: "text-green-500",
      bgClassName: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    },
    error: {
      icon: XCircle,
      className: "text-red-500",
      bgClassName: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    },
    warning: {
      icon: AlertCircle,
      className: "text-yellow-500",
      bgClassName: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
    },
    pending: {
      icon: Clock,
      className: "text-blue-500",
      bgClassName: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  };

  const { icon: Icon, className: iconClassName, bgClassName } = config[status];

  return (
    <div className={cn("flex items-center gap-2 p-3 rounded-lg border", bgClassName, className)}>
      <Icon className={cn("h-4 w-4", iconClassName)} />
      {message && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{message}</span>
      )}
    </div>
  );
}