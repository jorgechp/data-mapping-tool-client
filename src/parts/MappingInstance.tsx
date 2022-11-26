import {useLocation, useNavigate} from "react-router-dom";
import {Button, Col, Divider, message, Modal, Popconfirm, Row, Select, Table} from "antd";
import React, {useEffect, useState} from "react";
import InstanceService from "../services/InstanceService";
import FileService from "../services/FileService";
import OntologyService from "../services/OntologyService";
import {LockOutlined, QuestionCircleOutlined, TableOutlined, UnlockOutlined} from "@ant-design/icons";
import MappingSearchSuggestion from "./MappingSearchSuggestion";

const {Column} = Table;


interface InferenceData{
    format: string,
    name: string,
    type: string
}

const dataTypeOptions = [
    {
        value: 'string',
        label: 'String'   
    },{
        value: 'integer',
        label: 'Integer'   
    },{
        value: 'geopoint',
        label: 'Geopoint'   
    }

]

const MappingInstance = (props: any) => {

    const {state} = useLocation();
    const navigate = useNavigate()
    const {_id, _class, files, current_file}: any = state;

    const instanceService = new InstanceService();
    const ontologyService = new OntologyService();
    const fileService = new FileService();

    const [subject, setSubject] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState(current_file);
    const [columns, setColumns] = useState<any>([])
    const [sample, setSample] = useState<any>([])
    const [instance, setInstance] = useState<any>({})
    const [properties, setProperties] = useState<any>([])
    const [mapping, setMapping] = useState<any>({})
    const [inferences, setInferences] = useState<{[id: string]: InferenceData} | undefined>(undefined)

    const [lock, setLock] = useState(true);
    const [sampleVisible, setSampleVisible] = useState(false);
    const [loading, setLoading] = useState<any>({ontology: false, sample: false, instance: false})


    const getSample = (filename: string) => {
        setLoading({...instance, sample: true})
        fileService.sample(filename).then((res) => {
            setSample(res.data.sample);
            setColumns(res.data.columns.map((i: any) => {
                return {value: i, label: i, dataIndex: i, key: i, title: i}
            }));
            setLoading({...loading, sample: false});
            fileService.inferences(filename).then((resFilename) => {
                const inferenceDict: {[id: string]: InferenceData} = {};
                resFilename.data.forEach((inference: any) => {
                    inferenceDict[inference.name] = inference
                });
                setInferences(inferenceDict);
            } )
        }).catch((err) => {
            message.error(err.toString())
            setLoading({...loading, sample: false})
        })
    }

    const getInstance = () => {
        setLoading({...loading, instance: true})
        instanceService.getInstance(_id).then((res) => {
            setInstance(res.data.data);            
            if(res.data.data.mapping.hasOwnProperty(_class)){
                setMapping(res.data.data.mapping[_class].columns);
                setSubject(res.data.data.mapping[_class].subject);                      
                if(res.data.data.current_ontology.length > 0){
                    getOntology(res.data.data.current_ontology); 
                }                                
            }else{               
                defineMapping(res.data.data);
            }
            
            setLoading({...loading, instance: false});
        }).catch((err) => {
            message.error(err.toString());
            setLoading({...loading, instance: false})
        })
    }

    const getOntology = (id: string) => {
        

        setLoading({...loading, ontology: true})
        ontologyService.getProperties(id, "data", {classes: _class}).then((res) => {            
            setProperties(res.data.data)
            setLoading({...loading, ontology: false})
        }).catch((err) => {
            message.error(err.toString())
            setLoading({...loading, ontology: false})
        })
    }

    const defineMapping = (instance_response: any) => {
        instance_response.mapping[_class]  = {
            columns: {},
            fileSelected: current_file,
            status: false
        };          
    }

    const assignMappingToNewOntology = (instance_response: any, selected_value: string, dataIndex: string) =>{
        const splitted_name = selected_value.split(':');
        const domain = splitted_name[0];
        const name = splitted_name[1];

        properties.push(
            {
                domain: domain,
                name: name,
                range: "<class 'str'>",
                value: selected_value
            }
        );
        
        instance_response.mapping[_class].columns[selected_value] = dataIndex; 
        setMapping(instance_response.mapping[_class].columns)
        setProperties(properties);
    }


    const back = () => {
        navigate(-1)
    }

    const getValueForDataIndex = (dataIndex: string) => {

        const columnsMapping = instance.mapping[_class].columns;
        
    
        let value = undefined;
        
        if(Object.keys(columnsMapping).length === 0){
            return value;
        }
        const keys = Object.keys(columnsMapping);
        keys.forEach((element: any) => {           
            if(columnsMapping[element] === dataIndex){
                value = element
            }
        });

        return value;
    }

    const submit = () => {
        let newInstance = instance;       
        newInstance.mapping[_class].columns = mapping
        newInstance.mapping[_class].fileSelected = selectedFile
        newInstance.mapping[_class].subject = subject;
        instanceService.editInstances(_id, {mapping: newInstance.mapping}).catch((err) => {
            message.error(err.toString())
        })
        navigate(-1);
    }

    const onChangeTable = (selectedValue: any, ontology_value: any) => {
        setMapping({...mapping, [ontology_value.name]: selectedValue});
    }


    const onChangeSelectFile = (value: string) => {
        setSelectedFile(value);
        getSample(value);
        setSubject(null); // reset subject
        setMapping({}) // reset select
    }

    useEffect(() => {
        getSample(current_file)
        getInstance()
    }, [])

    // Modal
    const openSampleModal = () => {
        setSampleVisible(true);
    }

    const closeSampleModal = () => {
        setSampleVisible(false);
    }

    const processDataTypeComboBox = (dataType: string) => {
        if(inferences){
            const type = inferences[dataType].type;
            return <Select
                    defaultValue={type}
                    options={dataTypeOptions}
                >
            </Select>

        }
    }

    const assignAnnotation = (value: string, dataIndex: string) => {

    }

    const processAnnotation = (dataType: string) => {
        if(inferences){
            const type = inferences[dataType].type;
            if(type === 'integer'){
                return <MappingSearchSuggestion                             
                            isMeasure={true}
                            onChange={(selectedValue, option) => {
                                assignAnnotation(selectedValue, dataType)
                            }}
                            fieldName={type}>                                            
                    </MappingSearchSuggestion>
            }else{
                return <MappingSearchSuggestion 
                            defaultValue={type}
                            onChange={(selectedValue, option) => {
                                assignAnnotation(selectedValue, dataType)
                            }}
                            fieldName={type}>                                            
                    </MappingSearchSuggestion>
            }
        }
    }

    return (
        <>
            <Modal width={"200vh"} title={selectedFile} visible={sampleVisible} footer={null}
                   onCancel={closeSampleModal}>
                <Table scroll={{x: 500}} size={"small"} loading={loading.sample}
                       pagination={{defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 15]}}
                       bordered={true} dataSource={sample} columns={columns}/>
            </Modal>

            <Row style={{marginBottom: "3vh"}}>
                <Col span={22}>
                    <Select disabled={lock} style={{width: "50vh"}} options={files} loading={files.length === 0}
                            value={selectedFile}
                            onChange={(value: string) => onChangeSelectFile(value)}/>

                    <Popconfirm title="Are you sure？" onConfirm={() => {
                        setLock(!lock)
                    }}
                                icon={<QuestionCircleOutlined style={{color: 'red'}}/>}>
                        <Button type={"text"} icon={lock ? <LockOutlined/> : <UnlockOutlined/>}/>
                    </Popconfirm>
                </Col>
                <Col span={1}/>
                <Col span={1}>
                    <Button shape={"circle"} icon={<TableOutlined/>} onClick={openSampleModal}/>
                </Col>
            </Row>
            <Divider/>
            <Row>
                <Col span={10}>
                    <h4><b>Subject:</b></h4>
                    <Select showSearch style={{width: "50vh"}} options={columns}
                            placeholder={"Select Subject"} value={subject} onChange={setSubject}/>

                </Col>
            </Row>
            <Divider/>
            {true?
            <React.Fragment>
                <Row>
                    <Col span={24}>
                        <h4><b>Define Mapping:</b></h4>
                        {
                            <Table bordered={true} pagination={{defaultPageSize: 5}} loading={loading.ontology}
                                                dataSource={columns}>
                                <Column title={"Columns"} dataIndex={"dataIndex"}/>
                                <Column title={"Properties"} dataIndex={"dataIndex"} 
                                  render={(dataIndex: string) => (                                    
                                    <MappingSearchSuggestion 
                                        defaultValue={getValueForDataIndex(dataIndex)}
                                        onChange={(selectedValue, option) => {
                                            assignMappingToNewOntology(instance,selectedValue, dataIndex)
                                        }}
                                        fieldName={dataIndex}>                                            
                                    </MappingSearchSuggestion>
                                  )}
                                />
                                <Column title={"Type"} dataIndex={"dataIndex"} 
                                  render={(dataIndex: string) => (                                    
                                    processDataTypeComboBox(dataIndex)
                                  )}
                                />
                                <Column title={"Annotation"} dataIndex={"dataIndex"} 
                                  render={(dataIndex: string) => (                                    
                                    processAnnotation(dataIndex)
                                  )}
                                />

                            </Table>
                        }
                  
                    </Col>
                </Row>
            <Divider/>
            </React.Fragment>
            :
            <React.Fragment>
            <Row>
                <Col span={24}>
                    <h4><b>Mapping:</b></h4>
                    <Table bordered={true} pagination={{defaultPageSize: 5}} loading={loading.ontology}
                           dataSource={properties}>
                        <Column title={"Properties"} dataIndex={"value"}/>
                        <Column title={"Data set column"} render={(ontology_value, record, index) => {
                            return (<>
                                <Select style={{width: "50vh"}}
                                        showSearch
                                        loading={loading.instance}
                                        value={mapping[ontology_value.name]}
                                        options={columns} onChange={(selectedValue, option) => {
                                    onChangeTable(selectedValue, ontology_value)
                                }}/>
                            </>)
                        }}/>
                    </Table>
                </Col>
            </Row>
            </React.Fragment>}
            <Row>
                <Col>
                    <Button onClick={back}>Back</Button>
                    <Button disabled={!subject} type={"primary"} style={{marginLeft: "1vh"}}
                            onClick={submit}>Submit</Button>
                </Col>
            </Row>
        </>
    )

}
export default MappingInstance;
