/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// InspectionView.jsx
import React from 'react';
import {
    Card,
    Descriptions,
    Space,
    Tag,
    Table,
    Typography,
    Divider,
    Row,
    Col,
    Timeline,
    Statistic
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    InboxOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const StatusTag = ({ status }) => {
    const config = {
        pending: { color: 'gold', icon: <ClockCircleOutlined /> },
        in_progress: { color: 'blue', icon: <ClockCircleOutlined /> },
        completed: { color: 'green', icon: <CheckCircleOutlined /> },
        pass: { color: 'green', icon: <CheckCircleOutlined /> },
        fail: { color: 'red', icon: <ClockCircleOutlined /> },
        conditional: { color: 'orange', icon: <ClockCircleOutlined /> }
    };

    return (
        <Tag icon={config[status]?.icon} color={config[status]?.color}>
            {status?.replace(/_/g, ' ').toUpperCase()}
        </Tag>
    );
};

const InspectionView = ({ inspection }) => {
    const parameterColumns = [
        {
            title: 'Parameter',
            dataIndex: 'parameterName',
            key: 'parameterName',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Result',
            dataIndex: 'result',
            key: 'result',
            render: (result) => <StatusTag status={result} />
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (remarks) => remarks || '-'
        }
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header Card */}
            <Card>
                <Row gutter={[24, 24]}>
                    <Col span={16}>
                        <Descriptions
                            title={
                                <Space>
                                    <FileTextOutlined />
                                    <span>Inspection Information</span>
                                </Space>
                            }
                            bordered
                            column={2}
                        >
                            <Descriptions.Item label="Inspection Number">
                                {inspection.inspectionNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="GRN Number">
                                {inspection.grn?.grnNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Start Date">
                                {new Date(inspection.startDate).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Completion Date">
                                {inspection.completionDate ?
                                    new Date(inspection.completionDate).toLocaleDateString() :
                                    '-'
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="Inspector">
                                <Space>
                                    <UserOutlined />
                                    {inspection.inspector?.username || 'N/A'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Vendor">
                                {inspection.grn?.vendor?.name || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={8}>
                        <Card className='mt-11'>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Statistic
                                    title="Status"
                                    value={" "}
                                    prefix={<StatusTag status={inspection.status} />}
                                />
                                <Statistic
                                    title="Overall Result"
                                    value={" "}
                                    prefix={<StatusTag status={inspection.overallResult} />}
                                />
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* Items Section */}
            <Card
                title={
                    <Space>
                        <InboxOutlined />
                        <span>Inspection Items</span>
                    </Space>
                }
            >
                {inspection.items.map((item, index) => (
                    <Card
                        key={item._id || index}
                        type="inner"
                        title={`${item.itemDetails?.itemName || 'Item'} (${item.partCode})`}
                        style={{ marginBottom: 16 }}
                        extra={<StatusTag status={item.result} />}
                    >
                        <Row gutter={[24, 24]}>
                            <Col span={24}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Received Quantity"
                                            value={item.receivedQuantity}
                                            suffix={item.itemDetails?.measurementUnit || 'Units'}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Accepted Quantity"
                                            value={item.acceptedQuantity}
                                            suffix={item.itemDetails?.measurementUnit || 'Units'}
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Rejected Quantity"
                                            value={item.rejectedQuantity}
                                            suffix={item.itemDetails?.measurementUnit || 'Units'}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            {item.remarks && (
                                <Col span={24}>
                                    <Paragraph type="secondary">
                                        <strong>Remarks:</strong> {item.remarks}
                                    </Paragraph>
                                </Col>
                            )}

                            {item.parameters && item.parameters.length > 0 && (
                                <Col span={24}>
                                    <Divider orientation="left">Parameters</Divider>
                                    <Table
                                        columns={parameterColumns}
                                        dataSource={item.parameters}
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                </Col>
                            )}
                        </Row>
                    </Card>
                ))}
            </Card>

            {/* Remarks Section */}
            {inspection.remarks && (
                <Card
                    title={
                        <Space>
                            <FileTextOutlined />
                            <span>Overall Remarks</span>
                        </Space>
                    }
                >
                    <Paragraph>{inspection.remarks}</Paragraph>
                </Card>
            )}
        </Space>
    );
};

export default InspectionView;


// /* eslint-disable react/prop-types */
// // InspectionView.jsx
// import React, { useState } from 'react';
// import {
//     Card,
//     Descriptions,
//     Space,
//     Tag,
//     Table,
//     Typography,
//     Divider,
//     Row,
//     Col,
//     Statistic,
//     Steps,
//     Badge,
//     Progress,
//     Alert,
//     Tooltip,
//     Button,
//     Empty,
//     Collapse,
//     Timeline,
//     List
// } from 'antd';
// import {
//     CheckCircleOutlined,
//     ClockCircleOutlined,
//     FileTextOutlined,
//     UserOutlined,
//     CalendarOutlined,
//     InboxOutlined,
//     WarningOutlined,
//     FileSearchOutlined,
//     PrinterOutlined,
//     DownloadOutlined,
//     BarChartOutlined,
//     FileProtectOutlined,
//     ExclamationCircleOutlined,
//     InfoCircleOutlined,
//     AuditOutlined,
//     SyncOutlined
// } from '@ant-design/icons';

// const { Title, Text, Paragraph } = Typography;
// const { Panel } = Collapse;

// const StatusBadge = ({ status, size = 'default' }) => {
//     const config = {
//         pending: { color: 'warning', icon: <ClockCircleOutlined spin />, text: 'Pending' },
//         in_progress: { color: 'processing', icon: <SyncOutlined spin />, text: 'In Progress' },
//         completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
//         pass: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pass' },
//         fail: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Failed' },
//         conditional: { color: 'warning', icon: <WarningOutlined />, text: 'Conditional' }
//     };

//     return (
//         <Badge
//             status={config[status]?.color}
//             text={
//                 <Space>
//                     {config[status]?.icon}
//                     <Text strong>{config[status]?.text}</Text>
//                 </Space>
//             }
//             size={size}
//         />
//     );
// };

// const InspectionView = ({ inspection }) => {
//     const [activeTab, setActiveTab] = useState('details');

//     // Calculate inspection statistics
//     const totalItems = inspection.items.length;
//     const passedItems = inspection.items.filter(item => item.result === 'pass').length;
//     const passRate = (passedItems / totalItems) * 100;

//     const inspectionSteps = [
//         {
//             title: 'Initiated',
//             description: new Date(inspection.startDate).toLocaleDateString(),
//             icon: <FileTextOutlined />
//         },
//         {
//             title: 'In Progress',
//             description: 'Quality Check',
//             icon: <FileSearchOutlined />
//         },
//         {
//             title: 'Completed',
//             description: inspection.completionDate ? new Date(inspection.completionDate).toLocaleDateString() : 'Pending',
//             icon: <CheckCircleOutlined />
//         }
//     ];

//     const currentStep = inspection.status === 'completed' ? 2 :
//         inspection.status === 'in_progress' ? 1 : 0;

//     const parameterColumns = [
//         {
//             title: 'Parameter',
//             dataIndex: 'parameterName',
//             key: 'parameterName',
//             render: (text) => <Text strong>{text}</Text>
//         },
//         {
//             title: 'Value',
//             dataIndex: 'value',
//             key: 'value',
//         },
//         {
//             title: 'Result',
//             dataIndex: 'result',
//             key: 'result',
//             render: (result) => <StatusBadge status={result} />
//         },
//         {
//             title: 'Remarks',
//             dataIndex: 'remarks',
//             key: 'remarks',
//             render: (remarks) => remarks || '-'
//         }
//     ];

//     return (
//         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//             {/* Header Section with Status Timeline */}
//             <Card>
//                 <Row gutter={[24, 24]}>
//                     <Col span={16}>
//                         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                             <Title level={4}>
//                                 <Space>
//                                     <AuditOutlined />
//                                     Inspection Report
//                                 </Space>
//                             </Title>
//                             <Steps
//                                 current={currentStep}
//                                 items={inspectionSteps}
//                                 size="small"
//                                 style={{ marginBottom: 24 }}
//                             />
//                         </Space>
//                     </Col>
//                     <Col span={8}>
//                         <Space direction="vertical" style={{ width: '100%' }}>
//                             <Card className="stats-card" bordered={false}>
//                                 <Statistic
//                                     title={<Text strong>Inspection Status</Text>}
//                                     value={inspection.status}
//                                     prefix={<StatusBadge status={inspection.status} />}
//                                     valueStyle={{ display: 'none' }}
//                                 />
//                                 <Divider style={{ margin: '12px 0' }} />
//                                 <Progress
//                                     percent={passRate}
//                                     status={passRate === 100 ? "success" : "active"}
//                                     format={percent => `${percent.toFixed(1)}% Pass Rate`}
//                                 />
//                             </Card>
//                         </Space>
//                     </Col>
//                 </Row>
//             </Card>

//             {/* Main Content */}
//             <Row gutter={[16, 16]}>
//                 {/* Left Column - Details */}
//                 <Col span={16}>
//                     <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//                         {/* Basic Information */}
//                         <Card title={
//                             <Space>
//                                 <InfoCircleOutlined />
//                                 Basic Information
//                             </Space>
//                         }>
//                             <Descriptions bordered column={2} size="small">
//                                 <Descriptions.Item label="Inspection Number">
//                                     <Text copyable>{inspection.inspectionNumber}</Text>
//                                 </Descriptions.Item>
//                                 <Descriptions.Item label="GRN Number">
//                                     <Text copyable>{inspection.grn?.grnNumber}</Text>
//                                 </Descriptions.Item>
//                                 <Descriptions.Item label="Inspector">
//                                     <Space>
//                                         <UserOutlined />
//                                         {inspection.inspector?.username || 'N/A'}
//                                     </Space>
//                                 </Descriptions.Item>
//                                 <Descriptions.Item label="Vendor">
//                                     {inspection.grn?.vendor?.name || 'N/A'}
//                                 </Descriptions.Item>
//                             </Descriptions>
//                         </Card>

//                         {/* Inspection Items */}
//                         <Card title={
//                             <Space>
//                                 <InboxOutlined />
//                                 Inspection Items
//                             </Space>
//                         }>
//                             <Collapse defaultActiveKey={['0']}>
//                                 {inspection.items.map((item, index) => (
//                                     <Panel
//                                         key={index}
//                                         header={
//                                             <Space>
//                                                 <Text strong>{item.itemDetails?.itemName}</Text>
//                                                 <Text type="secondary">({item.partCode})</Text>
//                                                 <StatusBadge status={item.result} />
//                                             </Space>
//                                         }
//                                     >
//                                         <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//                                             {/* Item Statistics */}
//                                             <Row gutter={16}>
//                                                 <Col span={8}>
//                                                     <Statistic
//                                                         title="Received"
//                                                         value={item.receivedQuantity}
//                                                         suffix={item.itemDetails?.measurementUnit || 'Units'}
//                                                         prefix={<InboxOutlined />}
//                                                     />
//                                                 </Col>
//                                                 <Col span={8}>
//                                                     <Statistic
//                                                         title="Accepted"
//                                                         value={item.acceptedQuantity}
//                                                         suffix={item.itemDetails?.measurementUnit || 'Units'}
//                                                         valueStyle={{ color: '#3f8600' }}
//                                                         prefix={<CheckCircleOutlined />}
//                                                     />
//                                                 </Col>
//                                                 <Col span={8}>
//                                                     <Statistic
//                                                         title="Rejected"
//                                                         value={item.rejectedQuantity}
//                                                         suffix={item.itemDetails?.measurementUnit || 'Units'}
//                                                         valueStyle={{ color: '#cf1322' }}
//                                                         prefix={<ExclamationCircleOutlined />}
//                                                     />
//                                                 </Col>
//                                             </Row>

//                                             {/* Item Parameters */}
//                                             {item.parameters?.length > 0 ? (
//                                                 <>
//                                                     <Divider orientation="left">Quality Parameters</Divider>
//                                                     <Table
//                                                         columns={parameterColumns}
//                                                         dataSource={item.parameters}
//                                                         pagination={false}
//                                                         size="small"
//                                                         bordered
//                                                     />
//                                                 </>
//                                             ) : (
//                                                 <Empty
//                                                     image={Empty.PRESENTED_IMAGE_SIMPLE}
//                                                     description="No parameters recorded"
//                                                 />
//                                             )}

//                                             {/* Item Remarks */}
//                                             {item.remarks && (
//                                                 <Alert
//                                                     message="Item Remarks"
//                                                     description={item.remarks}
//                                                     type="info"
//                                                     showIcon
//                                                 />
//                                             )}
//                                         </Space>
//                                     </Panel>
//                                 ))}
//                             </Collapse>
//                         </Card>
//                     </Space>
//                 </Col>

//                 {/* Right Column - Summary and Actions */}
//                 <Col span={8}>
//                     <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//                         {/* Quick Actions */}
//                         <Card title={
//                             <Space>
//                                 <FileProtectOutlined />
//                                 Quick Actions
//                             </Space>
//                         }>
//                             <Space direction="vertical" style={{ width: '100%' }}>
//                                 <Button icon={<PrinterOutlined />} block>
//                                     Print Report
//                                 </Button>
//                                 <Button icon={<DownloadOutlined />} block>
//                                     Export Data
//                                 </Button>
//                             </Space>
//                         </Card>

//                         {/* Quality Metrics */}
//                         <Card title={
//                             <Space>
//                                 <BarChartOutlined />
//                                 Quality Metrics
//                             </Space>
//                         }>
//                             <Space direction="vertical" style={{ width: '100%' }}>
//                                 <Progress
//                                     type="circle"
//                                     percent={passRate}
//                                     format={percent => (
//                                         <span>
//                                             {percent}%<br />
//                                             <small>Pass Rate</small>
//                                         </span>
//                                     )}
//                                     width={120}
//                                 />
//                                 <Divider />
//                                 <Timeline>
//                                     <Timeline.Item color="green">
//                                         {passedItems} Items Passed
//                                     </Timeline.Item>
//                                     <Timeline.Item color="red">
//                                         {totalItems - passedItems} Items Failed/Pending
//                                     </Timeline.Item>
//                                 </Timeline>
//                             </Space>
//                         </Card>

//                         {/* Overall Remarks */}
//                         {inspection.remarks && (
//                             <Card title={
//                                 <Space>
//                                     <FileTextOutlined />
//                                     Overall Remarks
//                                 </Space>
//                             }>
//                                 <Paragraph>{inspection.remarks}</Paragraph>
//                             </Card>
//                         )}
//                     </Space>
//                 </Col>
//             </Row>
//         </Space>
//     );
// };

// export default InspectionView;