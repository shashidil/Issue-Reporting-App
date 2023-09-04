import React, {useState, useEffect, useCallback} from 'react'
import {Space, Table, Button, Modal, Form, Select, Input, SelectProps} from 'antd';
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

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [issueList, setIssueList] = useState<DataType[]>([]);
    const [formData, setFormData] = useState({title: '', description: '', status: {id: '', name: ''}});
    const [editingIssue, setEditingIssue] = useState({
        issueId:'',
        title: '',
        description: '',
        status: {id: '', name: ''}
    });
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
        setEditingIssue({issueId: '', title: '', description: '', status: {id: '', name: ''}});
    };

    const handleOk = () => {
        setIsModalOpen(false);
        form.submit();
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
            title: '',
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

            if (null == editingIssue) {
                axios.post('http://localhost:8080/api/issue-report/new-issue', issuedto)
                    .then((response) => {
                        if (response.status === 201) {
                            fetchData();
                            console.log('Data sent successfully');
                        } else {
                            console.error('Failed to send data to the backend');
                        }
                    })
                    .catch((error) => {
                        console.error('Error sending data to the backend', error);
                    });
            } else {
                const baseURL = `http://localhost:8080/api/issue-report/update/${editingIssue.issueId}`;
                console.log(editingIssue.issueId);
                editingIssue.title = issuedto.title;
                editingIssue.description = issuedto.description;
                editingIssue.status.id = issuedto.status.id;

                axios.put(baseURL, issuedto)
                    .then((response) => {
                        if (response.status === 200) {
                            fetchData();
                            console.log('Data updated successfully');
                        } else {
                            console.error('Failed to update data to the backend');
                        }
                    })
                    .catch((error) => {
                        console.error('Error updating data to the backend', error);
                    });
            }
        } catch (error) {
            console.error('Error sending/updating data to the backend', error);
        } finally {
            setFormData({title: '', description: '', status: {id: '', name: ''}});
            setEditingIssue({issueId: '', title: '', description: '', status: {id: '', name: ''}});
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
                        console.log('Item deleted successfully');
                    } else {
                        console.error('Failed to delete the item');
                    }
                }).catch((error) => {
                    console.error('Error deleting the item', error);
                });
            },
            onCancel: () => {
                console.log('Deletion canceled');
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
        const baseURL = `http://localhost:8080/api/issue-report/${record.issueId}`;
        axios.get(baseURL)
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data;
                    const updatedData = {
                        issueId: data.issueId,
                        title: data.title,
                        description: data.description,
                        status: {
                            id: data.status.id,
                            name: data.status.name,
                        },
                    };
                    setFormData(updatedData);
                    setEditingIssue(data);
                    showModal(false);
                    setIsUpdate(true);
                } else {
                    console.error('Failed to fetch data by issueId');
                }
            })
            .catch((error) => {
                console.error('Error fetching data by issueId', error);
            });
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
            console.log(commaSeparatedValues);

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


    const filteredIssueList = issueList.filter((issue) => selectedStatus.includes(issue.status.id.toString()));

    return (
        <>
            <Space style={{ width: '100%' }} direction="vertical">
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    value={selectedStatus}
                    onChange={handleChange}
                    options={statusOptions.map((statusOption) => ({
                        label: statusOption.name,
                        value: statusOption.id, // Assuming 'id' is a string
                    }))}
                />
            </Space>
            <Button type="primary" onClick={() => showModal(false)}>
                Add New Issue
            </Button>
            <Modal title="Add New Issue" open={isModalOpen} onCancel={handleCancel} onOk={handleOk}  >
                <Form
                    labelCol={{span: 4}}
                    wrapperCol={{span: 14}}
                    layout="horizontal"
                    style={{maxWidth: 600}}
                    onFinish={handleFormSubmit}
                    form={form}
                >

                    <Form.Item label="Issue Name" name="title" initialValue={formData.title}>
                        <Input
                            placeholder="Put a title here"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}

                        />
                    </Form.Item>
                    <Form.Item label="Description" name="description" initialValue={formData.description}>
                        <Input
                            placeholder="Enter some description "
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </Form.Item>
                    <Form.Item label="Status" name="status" initialValue={formData.status.name}>
                        <Select
                            placeholder="Select a status"
                            value={formData.status}
                            onChange={(value) => setFormData((prevData) => ({ ...prevData, status: value }))}
                        >
                            {isUpdate ? (
                                <Select.Option value="5">Test</Select.Option>
                            ) : null}
                            <Select.Option value="1" disabled={isUpdate ? formData.status.id !== "1" : false}>
                                Open
                            </Select.Option>
                            <Select.Option value="2" disabled={isUpdate ? formData.status.id !== "1" && formData.status.id !== "2" : false}>
                                Progress
                            </Select.Option>
                            <Select.Option value="3" disabled={isUpdate ? formData.status.id !== "1" && formData.status.id !== "3" : false}>
                                Waiting
                            </Select.Option>
                            <Select.Option value="4" disabled={isUpdate ? formData.status.id === "4" : false}>
                                Resolved
                            </Select.Option>
                        </Select>
                    </Form.Item>
                    {/*<Form.Item wrapperCol={{offset: 4, span: 14}}>*/}
                    {/*    <Button type="primary" htmlType="submit">*/}
                    {/*        Submit*/}
                    {/*    </Button>*/}
                    {/*</Form.Item>*/}
                </Form>
            </Modal>
                    <Table columns={columns} dataSource={issueList}></Table>
        </>
    );


}
