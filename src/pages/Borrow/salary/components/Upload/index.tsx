import { Modal, Space, Upload, App } from 'antd';
import db from '@/utils/db';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useState } from 'react';
import styles from './index.module.less';
import { UploadOutlined } from '@ant-design/icons';
import { getTemplate, sendTemplateName } from '@/api/borrow';

type Props = {
    visible: boolean;
    onCancel: () => void;
}

// 上传、下载
const UploadCom: React.FC<Props> = ({
    visible,
    onCancel
}) => {

    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    // 获取上传oss后的文件名
    const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
        setLoading(false);
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            const { code, data, message: msg } = info.file.response;
            if (code !== 200) {
                message.error(msg || '上传失败，请重试');
                setLoading(false);
                return;
            }

            const { code: sCode } = await sendTemplateName(data?.split('com/')[1]);
            setLoading(false);

            if (sCode !== 200) {
                message.error('上传失败，请重试');
                return;
            }

            message.success('上传成功');
        }
    };

    // 下载模板
    const downloadTemplate = async () => {
        const { data, code } = await getTemplate();
        if (code !== 200) return;

        try {
            const elink = document.createElement('a');
            elink.style.display = 'none';
            elink.href = 'https://zwhr-1322923821.cos.ap-guangzhou.myqcloud.com/' + data;
            document.body.appendChild(elink);
            elink.click();
            document.body.removeChild(elink);
        } catch (err) {
            window.alert('下载失败');
        }
    }

    return <Modal
        open={visible}
        title="导入数据"
        onCancel={onCancel}
        footer={null}
    >
        <Space direction='vertical' align='center' style={{ width: '100%' }}>
            <Upload
                name="file"
                headers={{
                    Authorization: 'Bearer ' + db.get('ACCESS_TOKEN') as string,
                    'platform': 'admin',
                }}
                showUploadList={false}
                action={'https://enzezhonghr.com/api/' + 'oss/upload'}
                onChange={handleChange}
                disabled={loading}
            >
                <div className={styles.uploadDiv}>
                    <UploadOutlined />
                    点击上传模板
                    <p>支持csv、xls、xlsx</p>
                </div>
            </Upload>

            <a onClick={() => downloadTemplate()}>
                点击下载模板
            </a>
        </Space>
    </Modal>

}

export default UploadCom;