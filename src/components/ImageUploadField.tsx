import { useEffect, useState } from 'react';
import { Image, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export type UploadImageResult = { url: string };

interface ImageUploadFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  uploadRequest: (file: File) => Promise<UploadImageResult>;
  resolveUrl?: (url: string) => string;
  maxCount?: number;
  buttonText?: string;
  invalidTypeText?: string;
  uploadFailedText?: string;
  allowedTypes?: string[];
}

export function ImageUploadField({
  value,
  onChange,
  uploadRequest,
  resolveUrl,
  maxCount = 1,
  buttonText = 'Upload',
  invalidTypeText = 'Invalid file type',
  uploadFailedText = 'Upload failed',
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadFieldProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const url = value?.trim();
    if (!url) {
      setFileList([]);
      return;
    }
    const displayUrl = resolveUrl ? resolveUrl(url) : url;
    setFileList([
      {
        uid: 'current',
        name: 'image',
        status: 'done',
        url: displayUrl,
      },
    ]);
  }, [value, resolveUrl]);

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: nextFileList }) => {
    const latest = nextFileList.slice(-maxCount);
    setFileList(latest);
    if (latest.length === 0) onChange?.('');
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (allowedTypes.includes(file.type)) return true;
    message.warning(invalidTypeText);
    return Upload.LIST_IGNORE;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    try {
      const file = options.file as File;
      const uploaded = await uploadRequest(file);
      const rawUrl = uploaded.url;
      const displayUrl = resolveUrl ? resolveUrl(rawUrl) : rawUrl;
      setFileList([
        {
          uid: String(Date.now()),
          name: file.name,
          status: 'done',
          url: displayUrl,
        },
      ]);
      onChange?.(rawUrl);
      options.onSuccess?.(uploaded);
    } catch (e) {
      message.error(e instanceof Error ? e.message : uploadFailedText);
      options.onError?.(e as Error);
    }
  };

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        maxCount={maxCount}
      >
        {fileList.length >= maxCount ? null : (
          <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{buttonText}</div>
          </button>
        )}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible: boolean) => setPreviewOpen(visible),
            afterOpenChange: (visible: boolean) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
}
