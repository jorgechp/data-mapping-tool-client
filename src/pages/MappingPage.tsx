import React, {Fragment, useState} from "react";
import {Button, message, Steps} from "antd";
import {Outlet, useNavigate} from "react-router-dom";
import store from "../store";
import {setCurrentMapping, setIndex} from "../actions";
import MappingService from "../services/MappingService";

const {Step} = Steps;

const MappingPage = () => {

    const [current, setCurrent] = useState(store.getState().mapping.index);
    const [nextStep, setNextStep] = useState(store.getState().mapping.upload)
    const [prevStep, setPrevStep] = useState(false)
    const [doneStep, setDoneStep] = useState(false)
    const navigate = useNavigate();
    const mappingService = new MappingService();

    const [steps, setSteps] = useState([
        {
            title: 'Load Data',
        },
        {
            title: 'Sample Data',
        },
        {
            title: 'Select Columns',
        },
        {
            title: 'Mapping',
        }
    ]);


    const handleNavigation = (index: number) => {
        switch (index) {
            case 0:
                navigate("upload/")
                break
            case 1:
                navigate("sample/")
                break
            case 2:
                navigate("select/")
                break
            case 3:
                navigate("process/")
                if (store.getState().mapping.columnsSelected.length > 0) {
                    sendColumnsToMap();
                }
                break
        }
        setCurrent(index);
        store.dispatch(setIndex(index));
    }

    const sendColumnsToMap = () => {
        const data = store.getState().mapping;
        mappingService.createMapping({
            rawColumns: data.columns,
            selectedColumns: data.columnsSelected,
            filename: data.file.name
        }).then((res) => {
            const ref = res.data['data']['ref']
            store.dispatch(setCurrentMapping(ref))
            message.info("New Mapping with ref.:" + ref)
        }).catch((err) => {
            message.error("The mapping has been failed during the creation.")
        });
    }

    const next = () => {
        handleNavigation(current + 1)
    };

    const prev = () => {
        handleNavigation(current - 1)
    };

    const done = () => {
        message.success('Processing complete!')
    }

    let unsubscribe = store.subscribe(() => {
        switch (store.getState().mapping.index) {
            case 0: // upload
                setNextStep(store.getState().mapping.file);
                break

            case 1: // sample
                setNextStep(store.getState().mapping.sample);
                setPrevStep(true);
                break

            case 2: // select
                setNextStep(store.getState().mapping.columnsSelected.length > 0);
                setPrevStep(true);
                break

            case 3: // process
                setPrevStep(false);
                setDoneStep(true);
                break
        }
    });

    return (<Fragment>
        <Steps current={current}>
            {steps.map(item => (
                <Step key={item.title} title={item.title}/>
            ))}
        </Steps>

        <div className="steps-content">
            <Outlet/>
        </div>

        <div className="steps-action">
            {current < steps.length - 1 && (
                <Button type="primary" disabled={!nextStep} onClick={() => next()}>
                    Next
                </Button>
            )}

            {current === steps.length - 1 && (
                <Button type="primary" disabled={!doneStep} onClick={done}>
                    Done
                </Button>
            )}
            {current > 0 && (
                <Button style={{margin: '0 8px'}} disabled={!prevStep} onClick={() => prev()}>
                    Previous
                </Button>
            )}
        </div>
    </Fragment>);

}
export default MappingPage