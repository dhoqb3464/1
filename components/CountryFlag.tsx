'use client';

import { useState, useEffect, memo } from 'react';
import { Icon } from '@/components/Icon';

// 国旗组件缓存
const flagComponentCache = new Map<string, React.ComponentType<any> | null>();

// 动态导入国旗库（按需加载）
const loadFlagIcon = async (countryCode: string): Promise<React.ComponentType<any> | null> => {
  // 检查缓存
  if (flagComponentCache.has(countryCode)) {
    return flagComponentCache.get(countryCode) || null;
  }

  try {
    const flags = await import('country-flag-icons/react/3x2');
    const FlagComponent = flags[countryCode as keyof typeof flags];
    if (FlagComponent && typeof FlagComponent === 'function') {
      flagComponentCache.set(countryCode, FlagComponent);
      return FlagComponent;
    }
    flagComponentCache.set(countryCode, null);
    return null;
  } catch {
    flagComponentCache.set(countryCode, null);
    return null;
  }
};

interface CountryFlagProps {
  countryCode: string;
  className?: string;
  showFallback?: boolean;
}

export const CountryFlag = memo(({
  countryCode,
  className = "w-8 h-6",
  showFallback = true
}: CountryFlagProps) => {
  const [FlagComponent, setFlagComponent] = useState<React.ComponentType<any> | null>(
    () => flagComponentCache.get(countryCode) || null
  );
  const [isLoading, setIsLoading] = useState(!flagComponentCache.has(countryCode));

  useEffect(() => {
    // 如果已经有缓存，直接使用
    if (flagComponentCache.has(countryCode)) {
      setFlagComponent(flagComponentCache.get(countryCode) || null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadFlagIcon(countryCode)
      .then((component) => {
        setFlagComponent(component);
      })
      .catch(() => {
        setFlagComponent(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [countryCode]);

  // 加载中或加载失败时显示占位符
  if ((isLoading || !FlagComponent) && showFallback) {
    return (
      <div className={`${className} bg-gradient-to-br from-[#007AFF] to-[#0055b3] rounded flex items-center justify-center shrink-0`}>
        <Icon name="globe" className="w-4 h-4 text-white" />
      </div>
    );
  }

  // 加载成功，显示国旗
  if (FlagComponent) {
    return (
      <div className={`${className} rounded overflow-hidden shadow-md border border-white/20 shrink-0`}>
        <FlagComponent className="w-full h-full object-cover" />
      </div>
    );
  }

  return null;
});

CountryFlag.displayName = 'CountryFlag';
