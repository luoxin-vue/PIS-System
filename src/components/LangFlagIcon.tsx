import type { CSSProperties } from 'react';
import { CN, US } from 'country-flag-icons/react/3x2';
import type { LocaleCode } from '../i18n';

type Props = {
  locale: LocaleCode;
  /** 宽度（3:2 国旗比例） */
  width?: number;
  className?: string;
};

/**
 * 矢量国旗，各系统显示一致（不依赖系统 Emoji 字体）
 */
export function LangFlagIcon({ locale, width = 22, className }: Props) {
  const height = Math.round((width * 2) / 3);
  const style: CSSProperties = {
    width,
    height,
    display: 'block',
    borderRadius: 3,
    flexShrink: 0,
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)',
  };

  if (locale === 'zh-CN') {
    return <CN className={className} title="中文" style={style} aria-hidden />;
  }
  return <US className={className} title="English" style={style} aria-hidden />;
}
