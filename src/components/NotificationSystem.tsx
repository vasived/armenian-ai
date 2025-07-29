import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Clock, CheckCircle, AlertCircle, Info, Trash2, Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // in milliseconds, default 4000
  showProgress?: boolean;
}

interface NotificationSystemProps {
  notifications: NotificationData[];
  onRemove: (id: string) => void;
}

const getNotificationConfig = (type: NotificationData['type']) => {
  switch (type) {
    case 'success':
      return {
        bgClass: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
        borderClass: "border-green-200 dark:border-green-800",
        shadowClass: "shadow-green-500/10",
        iconBg: "bg-green-500",
        statusColor: "text-green-600 dark:text-green-400",
        defaultIcon: <CheckCircle className="h-5 w-5 text-white animate-pulse" />
      };
    case 'error':
      return {
        bgClass: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
        borderClass: "border-red-200 dark:border-red-800",
        shadowClass: "shadow-red-500/10",
        iconBg: "bg-red-500",
        statusColor: "text-red-600 dark:text-red-400",
        defaultIcon: <AlertCircle className="h-5 w-5 text-white animate-pulse" />
      };
    case 'warning':
      return {
        bgClass: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30",
        borderClass: "border-yellow-200 dark:border-yellow-800",
        shadowClass: "shadow-yellow-500/10",
        iconBg: "bg-yellow-500",
        statusColor: "text-yellow-600 dark:text-yellow-400",
        defaultIcon: <AlertCircle className="h-5 w-5 text-white animate-pulse" />
      };
    case 'info':
    default:
      return {
        bgClass: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
        borderClass: "border-blue-200 dark:border-blue-800",
        shadowClass: "shadow-blue-500/10",
        iconBg: "bg-blue-500",
        statusColor: "text-blue-600 dark:text-blue-400",
        defaultIcon: <Info className="h-5 w-5 text-white animate-pulse" />
      };
  }
};

const SingleNotification = ({ notification, onRemove }: { notification: NotificationData; onRemove: (id: string) => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const duration = notification.duration || 4000;

  useEffect(() => {
    setShouldRender(true);
    // Small delay to trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  if (!shouldRender) return null;

  const config = getNotificationConfig(notification.type);

  return (
    <Card className={cn(
      "p-4 sm:p-6 w-full sm:max-w-sm pointer-events-auto mb-3",
      config.bgClass,
      config.borderClass,
      "shadow-xl",
      config.shadowClass,
      "transition-all duration-300 ease-out",
      isVisible
        ? "translate-y-0 opacity-100 scale-100"
        : "translate-y-4 opacity-0 scale-95"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.iconBg)}>
            {notification.icon || config.defaultIcon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Clock className={cn("h-3 w-3", config.statusColor)} />
              <span className={cn("text-xs font-medium", config.statusColor)}>
                {notification.type === 'success' ? 'Success' : 
                 notification.type === 'error' ? 'Error' : 
                 notification.type === 'warning' ? 'Warning' : 'Info'}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {notification.description && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {notification.description}
          </p>
        </div>
      )}

      {/* Action Button */}
      {notification.action && (
        <div className="mt-4">
          <Button
            size="sm"
            onClick={notification.action.onClick}
            className="h-8 px-4 text-xs"
          >
            {notification.action.label}
          </Button>
        </div>
      )}

      {/* Progress bar for auto-dismiss */}
      {notification.showProgress !== false && (
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all ease-linear",
              notification.type === 'success' ? "bg-gradient-to-r from-green-500 to-emerald-500" :
              notification.type === 'error' ? "bg-gradient-to-r from-red-500 to-rose-500" :
              notification.type === 'warning' ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
              "bg-gradient-to-r from-blue-500 to-indigo-500"
            )}
            style={{ 
              transitionDuration: isVisible ? `${duration}ms` : '0ms',
              width: isVisible ? '100%' : '0%'
            }}
          />
        </div>
      )}
    </Card>
  );
};

export const NotificationSystem = ({ notifications, onRemove }: NotificationSystemProps) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[100] pointer-events-none max-h-[80vh] overflow-hidden flex flex-col-reverse">
      {notifications.map((notification) => (
        <SingleNotification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      ...notification,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title: string, description?: string, options?: Partial<NotificationData>) => {
    addNotification({ type: 'success', title, description, ...options });
  };

  const error = (title: string, description?: string, options?: Partial<NotificationData>) => {
    addNotification({ type: 'error', title, description, ...options });
  };

  const warning = (title: string, description?: string, options?: Partial<NotificationData>) => {
    addNotification({ type: 'warning', title, description, ...options });
  };

  const info = (title: string, description?: string, options?: Partial<NotificationData>) => {
    addNotification({ type: 'info', title, description, ...options });
  };

  // Special notification types for common actions
  const chatAdded = (sessionTitle?: string) => {
    success(
      "New Chat Started",
      sessionTitle ? `Started "${sessionTitle}"` : "Ready to chat with HagopAI!",
      {
        icon: <Plus className="h-5 w-5 text-white animate-pulse" />,
        duration: 3000
      }
    );
  };

  const chatDeleted = (sessionTitle?: string) => {
    info(
      "Chat Deleted",
      sessionTitle ? `"${sessionTitle}" has been removed` : "Chat session has been removed",
      {
        icon: <Trash2 className="h-5 w-5 text-white animate-pulse" />,
        duration: 3000
      }
    );
  };

  const chatRenamed = (oldTitle: string, newTitle: string) => {
    success(
      "Chat Renamed",
      `"${oldTitle}" → "${newTitle}"`,
      {
        icon: <MessageSquare className="h-5 w-5 text-white animate-pulse" />,
        duration: 3000
      }
    );
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    chatAdded,
    chatDeleted,
    chatRenamed,
    NotificationComponent: () => (
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    )
  };
};
