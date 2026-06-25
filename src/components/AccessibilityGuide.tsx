import { useState, useEffect } from "react";
import { Icon } from "~/shared/ui";
import {
  checkAccessibilityPermission,
  requestAccessibilityPermission,
} from "~/api/tauri";

interface AccessibilityGuideProps {
  onPermissionGranted?: () => void;
}

export function AccessibilityGuide({ onPermissionGranted }: AccessibilityGuideProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkPermission = async () => {
    setIsChecking(true);
    try {
      const granted = await checkAccessibilityPermission();
      setHasPermission(granted);
      if (granted) {
        onPermissionGranted?.();
      }
    } catch (err) {
      console.error("Failed to check accessibility permission:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const handleRequestPermission = async () => {
    try {
      await requestAccessibilityPermission();
      // Check again after a delay to allow user to grant permission
      setTimeout(checkPermission, 2000);
    } catch (err) {
      console.error("Failed to request accessibility permission:", err);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin">
          <Icon name="loader" size={24} />
        </div>
      </div>
    );
  }

  if (hasPermission) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon name="alert-circle" size={24} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            需要辅助功能权限
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            macOS 需要授予辅助功能权限后，才能检测系统级划词。
            授权后回到这里重新启用助手。
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200
                rounded-md hover:bg-amber-200 dark:hover:bg-amber-700
                transition-colors duration-150"
            >
              <Icon name="settings" size={16} />
              打开系统权限设置
            </button>
            <button
              onClick={checkPermission}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                border border-gray-300 dark:border-gray-600
                rounded-md hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150"
            >
              {isChecking ? (
                <Icon name="loader" size={16} className="animate-spin" />
              ) : (
                <Icon name="refresh" size={16} />
              )}
              刷新状态
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
