import React, {useState} from 'react';
import './App.css'
import {Col, Layout, Menu, Row} from "antd";
import logo from "./assets/beegroup_logo.png";
import CustomHeader from "./parts/CustomHeader";
import NoFound from "./pages/NoFound";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import HomaPage from "./pages/HomaPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import {Roles} from "./utils/Roles";
import {Provider} from "react-redux";
import store from "./store";
import {BranchesOutlined, NodeIndexOutlined, ClearOutlined} from "@ant-design/icons";
import ListInstances from "./pages/ListInstances";
import InstanceDetailPage from "./pages/InstanceDetailPage";
import MappingInstance from "./parts/MappingInstance";
import MappingRelationsInstance from "./parts/MappingRelationsInstance";
import PreviewResults from "./parts/PreviewResults";
import PreviewOntology from "./parts/PreviewOntology";
import ListOntologies from "./pages/ListOntologies";
import ConfigService from "./services/ConfigService";
import CleaningPage from "./pages/CleaningPage";

// Components
const {Header, Content, Footer} = Layout;

// Constants
const current_year = new Date().getFullYear();


function App() {
    let navigate = useNavigate();
    const location = useLocation();

    const configService = new ConfigService().getConfig()

    const [ontologyVersion, setOntologyVersion] = useState<any>("v1");

    return (
        <Provider store={store}>
            <Layout>
                <Header style={{
                    backgroundColor: "white",
                    boxShadow: "5px 5px 8px 2px rgba(208, 216, 243, 0.6)",
                    position: 'fixed',
                    zIndex: 1,
                    width: '100%'
                }}>
                    <Row>
                        <Col span={14}>
                            <Menu mode="horizontal" selectedKeys={[location.pathname]}>
                                <Menu.Item key={"/"}>
                                    <img onClick={() => {
                                        navigate('/')
                                    }} className="logo" src={logo} alt="BeeGroup Logo"/>
                                </Menu.Item>

                                <Menu.Item key={"/instances"} title={"Mapping"} icon={<NodeIndexOutlined/>}
                                           onClick={() => {
                                               navigate('/instances')
                                           }}>Mapping</Menu.Item>

                                <Menu.Item key={"/ontologies"} title={"Ontologies"} icon={<BranchesOutlined/>}
                                           onClick={() => {
                                               navigate('/ontologies')
                                           }}>Ontologies</Menu.Item>

                                <Menu.Item key={"/cleaning-zone"} title={"Cleaning"} icon={<ClearOutlined/>}
                                           onClick={() => {
                                               navigate('/cleaning-zone')
                                           }}>Clean Data</Menu.Item>
                            </Menu>
                        </Col>
                        <Col span={10}>
                            <div style={{marginLeft: "70%"}}>
                                <CustomHeader/>
                            </div>
                        </Col>
                    </Row>
                </Header>
                <Content className="site-layout" style={{padding: '0 50px', marginTop: 64}}>
                    <div className="site-layout-background"
                         style={{margin: '25px 0', padding: 24, minHeight: 380, height: "80vh"}}>
                        <Routes>
                            <Route path={""}
                                   element={<PreviewOntology ontology_id={configService.default_ontology_id}/>}/>
                            <Route path="/" element={<ProtectedRoute
                                roles={[Roles.User, Roles.Admin]}><HomaPage/></ProtectedRoute>}>
                                <Route path={"instances/"} element={<ListInstances/>}/>
                                <Route path={"instances/:id"} element={<InstanceDetailPage/>}/>
                                <Route path={"instances/:id/mapping"} element={<MappingInstance/>}/>
                                <Route path={"instances/:id/link"} element={<MappingRelationsInstance/>}/>
                                <Route path={"instances/:id/preview"} element={<PreviewResults/>}/>
                            </Route>
                            <Route path={"ontologies/"} element={<ProtectedRoute
                                roles={[Roles.User, Roles.Admin]}><ListOntologies/></ProtectedRoute>}/>

                            <Route path={"cleaning-zone/"} element={<CleaningPage/>}/>

                            <Route path="*" element={<NoFound/>}/>
                        </Routes>
                    </div>
                </Content>
                <Footer style={{textAlign: 'center'}}>BeeGroup © {current_year} ~ {ontologyVersion}</Footer>
            </Layout>
        </Provider>)
}

export default App;
