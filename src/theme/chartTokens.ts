/** 随深/浅主题切换的 ECharts 颜色 */
export function getChartTheme(isDark: boolean) {
  if (isDark) {
    return {
      text: '#94a3b8',
      legend: '#cbd5e1',
      axisLine: '#3d4a5c',
      axisLabel: '#94a3b8',
      splitLine: 'rgba(148, 163, 184, 0.12)',
      tooltipBg: 'rgba(20, 25, 34, 0.96)',
      tooltipBorder: '#2a3344',
      tooltipText: '#e2e8f0',
      line1: '#818cf8',
      line1Item: '#a5b4fc',
      line1Area: 'rgba(129, 140, 248, 0.12)',
      line2: '#2dd4bf',
      line2Item: '#5eead4',
      line2Area: 'rgba(45, 212, 191, 0.1)',
      bar1: '#6366f1',
      bar1Em: '#818cf8',
      bar2: '#14b8a6',
      bar2Em: '#2dd4bf',
    };
  }
  return {
    text: '#64748b',
    legend: '#475569',
    axisLine: '#cbd5e1',
    axisLabel: '#64748b',
    splitLine: 'rgba(100, 116, 139, 0.15)',
    tooltipBg: 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: '#e2e8f0',
    tooltipText: '#0f172a',
    line1: '#6366f1',
    line1Item: '#4f46e5',
    line1Area: 'rgba(99, 102, 241, 0.12)',
    line2: '#0d9488',
    line2Item: '#14b8a6',
    line2Area: 'rgba(13, 148, 136, 0.1)',
    bar1: '#6366f1',
    bar1Em: '#818cf8',
    bar2: '#0d9488',
    bar2Em: '#14b8a6',
  };
}
