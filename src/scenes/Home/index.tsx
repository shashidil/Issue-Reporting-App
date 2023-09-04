import React, {useState, useEffect, useCallback} from 'react'
import {Space, Table, Button, Modal, Form, Select, Input, notification,Col, Row} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import axios from 'axios';

interface DataType {
    issueId: number;
    title: string;
    description: string;
    status: {
        id: number;
        name: string;
        description: string;
    };
};

let issueId!: any;

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [issueList, setIssueList] = useState<DataType[]>([]);
    const [formData, setFormData] = useState({title: '', description: '', status: {id: '', name: ''}});
    const [editingIssue, setEditingIssue] = useState<any>({});
    const [originalStatus, setOriginalStatus] = useState<number | null>(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [statusOptions, setStatusOptions] = useState<{ id: number; name: string }[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [isSearch, setIsSearch] = useState(false);
    const FormItem = Form.Item;
    const [form] = Form.useForm();
    const resetFormData = () => {
        setFormData({title: '', description: '', status: {id: '', name: ''}});
    };
    const showModal = (isUpdate:boolean) => {
        setIsUpdate(isUpdate);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        resetFormData();
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'Issue Name',
            dataIndex: 'title',
            key: 'title',
            render: (text) => text,
        },
        {
            title: ' Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text,
        },
        {
            title: ' Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => record.status.name,
        },
        {
            title: 'Action',
            dataIndex: 'update',
            key: 'update',
            render: (_, record) => (
                <a onClick={() => handleUpdateClick(record)}>Update</a>
            )
        },
        {
            title: '',
            dataIndex: 'delete',
            key: 'delete',
            render: (_, record) => (
                <a onClick={() => handleDelete(record)}>Delete</a>
            ),
        },
    ]
    const fetchData = () => {
        const baseURL = "http://localhost:8080/api/issue-report/list";
        axios.get(baseURL).then((response) => {
            const updatedData = response.data.map((item: any) => ({
                key: item.issueId,
                ...item,
                status: {...item.status, name: item.status.name},
            }));
            setIssueList(updatedData);
        });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormSubmit = useCallback((values: any) => {
        console.log(values);
        try {
            const getStatusName = (statusValue: string) => {
                switch (statusValue) {
                    case "1":
                        return 'open';
                    case "2":
                        return 'inprogress';
                    case "3":
                        return 'waiting';
                    case "4":
                        return 'resolved';
                }
            };

            const issuedto = {
                title: values.title,
                description: values.description,
                status: {
                    id: values.status,
                    name: getStatusName(values.status)
                }
            };

            if (!issueId ) {
                axios.post('http://localhost:8080/api/issue-report/new-issue', issuedto)
                    .then((response) => {
                        if (response.status === 201) {
                            fetchData();
                            notification.success({
                                message: 'Success',
                                description: 'Data sent successfully',
                            });
                        } else {
                            notification.error({
                                message: 'Error',
                                description: 'Failed to send data to the backend',
                            });
                        }
                    })
                    .catch((error) => {
                        notification.error({
                            message: 'Error',
                            description: 'Error sending data to the backend',
                        });
                    });
            } else {
                const baseURL = `http://localhost:8080/api/issue-report/update/${issueId}`;
                console.log(editingIssue.issueId);
                axios.put(baseURL, issuedto)
                    .then((response) => {
                        if (response.status === 200) {
                            fetchData();
                            notification.success({
                                message: 'Success',
                                description: 'Data sent successfully',
                            });
                        } else {
                            // notification.error({
                            //     message: 'Error',
                            //     description: 'Failed to update data to the backend',
                            // });
                        }
                    })
                    .catch((error) => {
                        notification.error({
                            message: 'Error',
                            description: 'Failed to update data to the backend',
                        });
                    });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Error sending/updating data to the backend',
            });
        } finally {
            setFormData({title: '', description: '', status: {id: '', name: ''}});
            setEditingIssue({issueId: '', title: '', description: '', status: {id: '', name: ''}});
            showModal(false);
        }
    }, []);


    const handleDelete = (record: DataType) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this item?',
            onOk: () => {
                const baseURL = `http://localhost:8080/api/issue-report/${record.issueId}`;
                axios.delete(baseURL).then((response) => {
                    if (response.status === 204) {
                        const updatedList = issueList.filter((item) => item.issueId !== record.issueId);
                        setIssueList(updatedList);
                        notification.success({
                            message: 'Success',
                            description: 'Item deleted successfully',
                        });
                    } else {
                        notification.error({
                            message: 'Error',
                            description: 'Failed to delete the item',
                        });
                    }
                }).catch((error) => {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to delete the item',
                    });
                });
            },
            onCancel: () => {
                notification.info({
                    message: 'Info',
                    description: 'Deletion canceled',
                });
            },
        });
    };

    const handleInputChange = useCallback((e: { target: { name: any; value: any; }; }) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }, []);

    const handleUpdateClick = (record: DataType) => {
        issueId = record.issueId;
        setEditingIssue(record);
        setOriginalStatus(record.status.id);
        setFormData({
            title: record.title,
            description: record.description,
            status: {
                id: record.status.id.toString(),
                name: record.status.name,
            },
        });
        showModal(true);
    };

    const fetchStatusOptions = () => {
        axios.get('http://localhost:8080/issue-report/status/list')
            .then((response) => {
                const statusOptionsData = response.data;
                setStatusOptions(statusOptionsData);
            })
            .catch((error) => {
                console.error('Error fetching status options', error);
            });
    };

    useEffect(() => {
        fetchData();
        fetchStatusOptions();
    }, []);
    const handleChange = (value: string[]) => {
        setSelectedStatus(value);
        handleSearch(value);
    };


    const handleSearch = (values: string[]) => {
        try {
            const commaSeparatedValues = values.join(',');

            const baseURL = "http://localhost:8080/api/issue-report/search-list";
            axios.get(baseURL, {
                params: {
                    id: commaSeparatedValues
                }
            }).then((response) => {
                setIssueList(response.data);
            });
        } catch (error) {
            console.error('Error searching for issues', error);
        }
    }


    //const filteredIssueList = issueList.filter((issue) => selectedStatus.includes(issue.status.id.toString()));


    return (
        <>
            <Row>
                <Col span={12}>
                    <Space style={{ width: '50%' ,marginLeft:'80%',marginTop:'20px'}} direction="vertical">
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            value={selectedStatus}
                            onChange={handleChange}
                            options={statusOptions.map((statusOption) => ({
                                label: statusOption.name,
                                value: statusOption.id,
                            }))}
                        />
                    </Space>
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={() => {
                        showModal(false);
                        issueId = '';
                        form.resetFields();
                    }} style={{ marginLeft: '20px',marginTop:'20px' }}>
                        Add New Issue
                    </Button>
                </Col>
            </Row>


            <Modal title="Add New Issue" open={isModalOpen} onCancel={handleCancel} okButtonProps={{ style: { display: 'none' } }} cancelButtonProps={{ style: { display: 'none' } }} destroyOnClose={true} >
                <Form
                    labelCol={{span: 6}}
                    wrapperCol={{span: 14}}
                    layout="horizontal"
                    style={{maxWidth: 600}}
                    onFinish={handleFormSubmit}
                    form={form}
                >
                    <Form.Item label="Issue Name" name="title"   initialValue={formData.title} rules={[{ required: true }]}>
                        <Input
                            placeholder="Put a title here"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                    </Form.Item>
                    <Form.Item label="Description" name="description" initialValue={formData.description} rules={[{ required: true }]}>
                        <Input
                            placeholder="Enter some description "
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}

                        />
                    </Form.Item>
                    <Form.Item label="Status" name="status" initialValue={formData.status.name} rules={[{ required: true }]}>
                        <Select
                            placeholder="Select a status"
                            value={formData.status}
                            onChange={(value) =>
                                setFormData((prevData) => ({ ...prevData, status: value }))
                            }
                        >
                            {isUpdate ? (
                                <>
                                    <Select.Option value="1" disabled={true}>
                                        Open
                                    </Select.Option>
                                    <Select.Option value="2" disabled={originalStatus === 2 || originalStatus === 4}>
                                        Progress
                                    </Select.Option>
                                    <Select.Option value="3" disabled={originalStatus === 1 || originalStatus === 3 || originalStatus === 4}>
                                        Waiting
                                    </Select.Option>
                                    <Select.Option value="4" disabled={originalStatus === 1 || originalStatus === 4}>
                                        Resolved
                                    </Select.Option>
                                </>
                            ) : (
                                <>
                                    <Select.Option value="1">Open</Select.Option>
                                    <Select.Option value="2">Progress</Select.Option>
                                    <Select.Option value="3">Waiting</Select.Option>
                                    <Select.Option value="4">Resolved</Select.Option>
                                </>
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item wrapperCol={{offset: 4, span: 14}}>
                    <Button type="primary" htmlType="submit">
                           Submit
                    </Button>
                    </Form.Item>
                </Form>
            </Modal>
                    <Table columns={columns} dataSource={issueList} style={{ padding: '20px' ,margin:'10px'}}></Table>

        </>
    );


}
