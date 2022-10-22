import React, {Fragment, useEffect, useState} from "react";
import OntologyService from "../services/OntologyService";
import {Button, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tooltip, Upload} from "antd";
import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    GlobalOutlined,
    InboxOutlined,
    LockOutlined,
    PlusOutlined,
    QuestionCircleOutlined, SearchOutlined
} from "@ant-design/icons";
import {useForm} from "antd/lib/form/Form";
import ConfigService from "../services/ConfigService";
import AuthService from "../services/AuthService";
import {Option} from "antd/lib/mentions";
import fileDownload from "js-file-download";
import {alphabeticalSort} from "../utils/sorter";

const {Dragger} = Upload;
const {Column} = Table;

const ListOntologies = () => {
    const ontologyService = new OntologyService();
    const authService = new AuthService();
    const configService = new ConfigService().getConfig();

    const [dataSource, setDataSource] = useState<any>([])
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<any>({ontologies: false})
    const [currentRecord, setCurrentRecord] = useState<any>(null)
    const [fileAccess, setFileAccess] = useState<any>("")

    const [createOntology, setCreateOntology] = useState<boolean>(false)
    const [editOntology, setEditOntology] = useState<boolean>(false)
    const [createForm] = useForm();
    const [editForm] = useForm();

    const gatherOntologies = () => {
        setLoading({...loading, ontologies: true})

        ontologyService.getOntologies().then((res) => {
            setData(res.data.data)
            setDataSource(res.data.data)
            setLoading({...loading, ontologies: false})
        }).catch(err => {
            message.error(err.toString())
            setLoading({...loading, ontologies: false})
        })

    }

    const create = () => {
        setCreateOntology(true)
    }

    const closeCreateModal = () => {
        createForm.resetFields()
        setCreateOntology(false);
        gatherOntologies()
    }

    const closeEditModal = () => {
        editForm.resetFields()
        setEditOntology(false)
        gatherOntologies()
    }

    const edit = () => {

        ontologyService.editOntology(currentRecord._id, editForm.getFieldsValue()).then((res) => {
            closeEditModal();
        }).catch((err) => {
            message.error(err.toString())
        })

    }

    const onChangeDragger = (info: any) => {
        const {status} = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`, 2);
        }
    }

    const remove = (id: string) => {
        ontologyService.removeOntology(id).then(res => gatherOntologies()).catch(err => message.error(err.toString()))
    }

    const downloadOntology = (record: any) => {
        let id = record._id;

        ontologyService.downloadOntology(id).then((res) => {
            fileDownload(JSON.stringify(res.data.data), `${record.ontology_name}.owl`)
        }).catch(err => message.error(err.toString()))
    }

    useEffect(() => {
        gatherOntologies()
    }, [])

    const handleSearch = (value: string, property: string) => {
        value === '' ? setDataSource(data) : setDataSource(data.filter((i: any) => i[property].includes(value)))
    }


    return (<>

        <Modal visible={editOntology} onCancel={closeEditModal} onOk={editForm.submit} width={"100vh"}>
            <Form form={editForm} layout={"vertical"} onFinish={edit}>
                <Row>
                    <Col span={11}>

                        <Form.Item name={"ontology_name"} label={"Name"} rules={[{required: true}]} hasFeedback>
                            <Input placeholder={"Ontology Name"}/>
                        </Form.Item>

                        <Form.Item name={"filename"} label={"Filename"}>
                            <Input disabled/>
                        </Form.Item>

                        <Form.Item name={"description"} label={"Description"}>
                            <Input.TextArea maxLength={280}/>
                        </Form.Item>
                    </Col>
                    <Col span={1}/>
                    <Col span={11}>
                        <Form.Item name={"visibility"} label={"Visibility"}>
                            <Select>
                                <Option value={"public"}>Public <GlobalOutlined/> </Option>
                                <Option value={"private"}>Private <LockOutlined/> </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>


            </Form>
        </Modal>

        <Modal visible={createOntology} onCancel={closeCreateModal} onOk={createForm.submit} width={"100vh"}>
            <Form form={createForm} layout={"vertical"} onFinish={closeCreateModal}>
                <Row>
                    <Col span={10}>
                        <Form.Item name={"ontology_name"} label={"Name"} rules={[{required: true}]} hasFeedback>
                            <Input placeholder={"Ontology Name"} onChange={() => {
                                setFileAccess(createForm.getFieldValue("ontology_name"))
                            }}/>
                        </Form.Item>
                    </Col>
                    <Col span={2}/>
                    <Col span={10}>
                        <Form.Item name={"file"} label={"Upload Ontology"}
                                   rules={[{required: true}]}>
                            <Dragger accept={".owl"}
                                     disabled={fileAccess == ""}
                                     action={configService.api_url + "/ontology/" + createForm.getFieldValue("ontology_name")}
                                     headers={{Authorization: "Bearer " + authService.hasCredentials()}}
                                     onChange={onChangeDragger}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined/>
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">
                                    Support for a single or bulk upload. Strictly prohibit from uploading company
                                    data or other
                                    band files.
                                </p>
                            </Dragger>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

        </Modal>

        <Row>
            <Col span={23}/>
            <Col span={1}>
                <Button type={"primary"} shape="circle" icon={<PlusOutlined/>} onClick={create}/>
            </Col>
        </Row>
        <Row style={{marginTop: "3vh"}}>
            <Col span={24}>
                <Table size={"middle"} dataSource={dataSource}
                       loading={loading.ontologies}
                       pagination={{defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: [5, 10]}}
                       bordered={true}
                       rowKey={record => record._id}
                       scroll={{x: 1300}}>
                    <Column align={"center"} title="Ontology Name" dataIndex="ontology_name" key="ontology_name"
                            sorter={{
                                compare: (a: any, b: any) => alphabeticalSort(a.ontology_name, b.ontology_name),
                                multiple: 3
                            }}
                            filterIcon={() => <SearchOutlined/>}
                            filterDropdown={() => {
                                return (
                                    <div style={{padding: 8}}>
                                        <Input.Search
                                            allowClear={true}
                                            onSearch={id => handleSearch(id, "ontology_name")}
                                            defaultValue={""}
                                            placeholder={`Search Reference`}
                                            style={{marginBottom: 8, display: 'block'}}
                                        />
                                    </div>
                                );
                            }}/>
                    <Column align={"center"} title="Description" dataIndex="description" key="description"/>
                    <Column align={"center"} title="Visibility" dataIndex="visibility" key="visibility"
                            sortDirections={['descend', 'ascend']}
                            filters={[{text: "Public", value: "public"}, {text: "Private", value: "private"}]}
                            onFilter={((value, record) => record.visibility === value)}
                            sorter={{
                                compare: (a: any, b: any) => alphabeticalSort(a.visibility, b.visibility),
                                multiple: 2
                            }}
                            render={(value, record, index) => {
                                return value === 'private' ? <LockOutlined/> : <GlobalOutlined/>

                            }}/>

                    <Column align={"center"} title="Actions" fixed={"right"}
                            render={(value, record, index) => (
                                <Fragment>
                                    <Space size={"large"}>
                                        <Tooltip title="Edit">
                                            <Button shape="circle" icon={<EditOutlined/>} onClick={() => {
                                                setCurrentRecord(record)
                                                setEditOntology(true)
                                                editForm.setFieldsValue(record)
                                            }}/>
                                        </Tooltip>

                                        <Tooltip title="Download">
                                            <Button shape="circle" icon={<DownloadOutlined/>} onClick={() => {
                                                downloadOntology(record)
                                            }}/>
                                        </Tooltip>

                                        <Popconfirm title="Are you sure？" onConfirm={() => {
                                            remove(value._id)
                                        }}
                                                    icon={<QuestionCircleOutlined style={{color: 'red'}}/>}>
                                            <a href="#"><Button shape="circle" icon={<DeleteOutlined/>}/></a>
                                        </Popconfirm>
                                    </Space>
                                </Fragment>)}/>
                </Table>

            </Col>
        </Row>
    </>)
}

export default ListOntologies;