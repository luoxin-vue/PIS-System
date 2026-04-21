import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Card, Space, Typography, message } from 'antd';
import { SaveOutlined, FolderOpenOutlined, PrinterOutlined, UndoOutlined } from '@ant-design/icons';
import { usePreferences } from '../context/PreferencesContext';

type HiPrintTemplate = {
  design: (selector: string) => void;
  getJson: () => unknown;
  setJson: (json: unknown) => void;
  print: (data?: unknown) => void;
  addPrintPanel?: (panel: Record<string, unknown>) => {
    addPrintText?: (cfg: { options: Record<string, unknown> }) => void;
    addPrintHline?: (cfg: { options: Record<string, unknown> }) => void;
    addPrintTable?: (cfg: { options: Record<string, unknown> }) => void;
  };
};

type HiPrintModule = typeof import('rc-hiprint');

declare global {
  interface Window {
    $?: (selector: string) => unknown;
  }
}

const STORAGE_KEY = 'pis-hiprint-template-v3';
const LEGACY_STORAGE_KEYS = ['pis-hiprint-template-v2', 'pis-hiprint-template-v1'];
let hiprintModulePromise: Promise<HiPrintModule> | null = null;

function loadHiprintModule() {
  if (!hiprintModulePromise) {
    hiprintModulePromise = import('rc-hiprint');
  }
  return hiprintModulePromise;
}

function readTemplateFromStorage(): unknown {
  for (const k of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      return JSON.parse(raw);
    } catch {
      continue;
    }
  }
  return {};
}

function shouldUseBaseTemplate(templateJson?: unknown): boolean {
  if (!templateJson) return true;
  if (typeof templateJson !== 'object') return false;
  return Object.keys(templateJson as Record<string, unknown>).length === 0;
}

function seedBaseTemplate(template: HiPrintTemplate, t: (key: string) => string): void {
  if (!template.addPrintPanel) return;
  const panel = template.addPrintPanel({
    width: 210,
    height: 297,
    paperHeader: 12,
    paperFooter: 285,
    panelPaperRule: 'none',
    panelPageRule: 'none',
    paperNumberDisabled: true,
  });

  panel?.addPrintText?.({
    options: {
      field: 'title',
      testData: t('ticket.defaultTitle'),
      top: 16,
      left: 20,
      width: 170,
      height: 28,
      fontSize: 24,
      fontWeight: 700,
      textAlign: 'center',
      hideTitle: true,
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('ticket.fieldOrderNo'),
      field: 'orderNo',
      testData: 'SO20260420',
      top: 52,
      left: 20,
      width: 170,
      height: 18,
      fontSize: 13,
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('sales.date'),
      field: 'date',
      testData: '2026-04-20',
      top: 74,
      left: 20,
      width: 170,
      height: 18,
      fontSize: 13,
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('sales.customer'),
      field: 'customer',
      testData: '粤B12345',
      top: 96,
      left: 20,
      width: 170,
      height: 18,
      fontSize: 13,
    },
  });

  panel?.addPrintHline?.({
    options: {
      top: 122,
      left: 20,
      width: 170,
      borderWidth: 0.8,
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('sales.labelItems'),
      field: 'table',
      testData: t('ticket.tablePlaceholder'),
      top: 132,
      left: 20,
      width: 170,
      height: 68,
      fontSize: 12,
      lineHeight: 1.5,
      textAlign: 'left',
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('sales.total'),
      field: 'total',
      testData: '1000.00',
      top: 214,
      left: 20,
      width: 170,
      height: 20,
      fontSize: 14,
      fontWeight: 700,
    },
  });

  panel?.addPrintText?.({
    options: {
      title: t('sales.noteLabel'),
      field: 'note',
      testData: '',
      top: 238,
      left: 20,
      width: 170,
      height: 16,
      fontSize: 12,
    },
  });
}

export function TicketTemplate() {
  const { t } = usePreferences();
  const templateRef = useRef<HiPrintTemplate | null>(null);

  const toolItems = useMemo(
    () => [
      { tid: 'defaultModule.title', label: t('ticket.tool.title') },
      { tid: 'defaultModule.text', label: t('ticket.tool.text') },
      { tid: 'defaultModule.barcode', label: t('ticket.tool.barcode') },
      { tid: 'defaultModule.qrcode', label: t('ticket.tool.qrcode') },
      { tid: 'defaultModule.hline', label: t('ticket.tool.hline') },
      { tid: 'defaultModule.emptyTable', label: t('ticket.tool.table') },
    ],
    [t]
  );

  const initDesigner = useCallback(
    async (templateJson?: unknown) => {
      const settingEl = document.getElementById('PrintElementOptionSetting');
      const designEl = document.getElementById('hiprint-printTemplate');
      if (!settingEl || !designEl) return;

      settingEl.innerHTML = '';
      designEl.innerHTML = '';

      const hiprintModule = await loadHiprintModule();
      const hiprint = hiprintModule.default;
      const { defaultElementTypeProvider, disAutoConnect } = hiprintModule;

      if (!window.$) {
        message.error('jQuery is not available for hiprint.');
        return;
      }

      disAutoConnect();
      hiprint.init({
        providers: [new (defaultElementTypeProvider as unknown as new () => unknown)()],
      });

      (hiprint as any).PrintElementTypeManager.buildByHtml(window.$('.hiprint-tool-item'));

      const template = new (hiprint as any).PrintTemplate({
        template: templateJson ?? {},
        settingContainer: '#PrintElementOptionSetting',
        paginationContainer: '.hiprint-printPagination',
      }) as HiPrintTemplate;
      try {
        if (shouldUseBaseTemplate(templateJson)) {
          seedBaseTemplate(template, t);
        }
        template.design('#hiprint-printTemplate');
        templateRef.current = template;
      } catch {
        const fallback = new (hiprint as any).PrintTemplate({
          template: {},
          settingContainer: '#PrintElementOptionSetting',
          paginationContainer: '.hiprint-printPagination',
        }) as HiPrintTemplate;
        seedBaseTemplate(fallback, t);
        fallback.design('#hiprint-printTemplate');
        templateRef.current = fallback;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback.getJson()));
        message.warning(t('ticket.templateRecovered'));
      }
    },
    [t]
  );

  useEffect(() => {
    const parsed = readTemplateFromStorage();
    void initDesigner(parsed);
  }, [initDesigner]);

  const handleSave = () => {
    const tpl = templateRef.current;
    if (!tpl) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl.getJson()));
      message.success(t('ticket.saved'));
    } catch {
      message.error(t('ticket.saveFailed'));
    }
  };

  const handleLoad = async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      message.warning(t('ticket.nothingToLoad'));
      return;
    }
    try {
      await initDesigner(JSON.parse(raw));
      message.success(t('ticket.loaded'));
    } catch {
      message.error(t('ticket.loadFailed'));
    }
  };

  const handleReset = async () => {
    await initDesigner({});
    message.info(t('ticket.resetDone'));
  };

  const handlePrint = () => {
    const tpl = templateRef.current;
    if (!tpl) return;
    tpl.print({
      title: t('ticket.defaultTitle'),
      barcode: 'SO20260420',
      qrcode: 'SO20260420',
      customText: t('ticket.defaultText'),
      table: [
        { id: 1, name: 'AT-01', gender: '', count: 2, amount: 680 },
        { id: 2, name: 'AT-02', gender: '', count: 1, amount: 320 },
      ],
    });
  };

  return (
    <div className="hiprint-designer-page">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('ticket.title')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t('ticket.hiprintHint')}</Typography.Paragraph>

      <Space className="no-print" wrap style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          {t('ticket.save')}
        </Button>
        <Button icon={<FolderOpenOutlined />} onClick={() => void handleLoad()}>
          {t('ticket.load')}
        </Button>
        <Button icon={<UndoOutlined />} onClick={() => void handleReset()}>
          {t('ticket.resetCanvas')}
        </Button>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
          {t('ticket.print')}
        </Button>
      </Space>

      <div className="hiprint-designer-grid no-print">
        <Card title={t('ticket.toolboxTitle')} size="small">
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
            {t('ticket.toolboxHint')}
          </Typography.Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toolItems.map((item) => (
              <div
                className="hiprint-tool-item ep-draggable-item"
                key={item.tid}
                ref={(el) => {
                  if (el) el.setAttribute('tid', item.tid);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </Card>

        <div className="ticket-print-area">
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
            {t('ticket.preview')}
          </Typography.Text>
          <div id="hiprint-printTemplate" className="hiprint-printTemplate" />
          <div className="hiprint-printPagination" />
        </div>

        <Card title={t('ticket.settingsTitle')} size="small" className="hiprint-setting-card">
          <div id="PrintElementOptionSetting" className="hiprint-setting-panel" />
        </Card>
      </div>
    </div>
  );
}
